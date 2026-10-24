# nsudhanva/eot-detector

# nsudhanva/eot-detector

## Resumen

`nsudhanva/eot-detector` es un bundle de servicio (release v4) de un detector de fin de turno (*end-of-turn*, EoT) para agentes de voz. Lo publica Sudhanva Narayana (usuario `nsudhanva`, ingeniero de ML en Montai Therapeutics) y su función es decidir cuándo el interlocutor ha dejado de hablar para que el agente pueda responder sin interrumpirle. No es un modelo generativo: es un clasificador que puntúa cada pausa del audio del usuario y devuelve una probabilidad `p_eot` junto con una decisión binaria `fire`.

El bundle no contiene un único modelo, sino una pila de tres componentes: un modelo de texto (SmolLM2-360M afinado con LoRA y fusionado) que evalúa si el prefijo de transcripción es una frase completa; un modelo de audio (`p99lab/turn-1-mini`, incluido sin modificar en formato ONNX por pasos de streaming) que puntúa los últimos segundos de señal; y una regresión logística propia que combina ambas puntuaciones con rasgos de prosodia y la duración de la pausa. Todo se sirve mediante una API HTTP/WebSocket con Docker, Prometheus y Grafana.

Es relevante porque ataca uno de los cuellos de botella de latencia en agentes de voz: las reglas de silencio fijo. El propio bundle incluye una regla de 700 ms en modo *shadow* como referencia. La licencia Apache-2.0 y el formato ONNX/safetensors permiten autohospedaje, aunque el proyecto tiene 0 descargas y 0 likes en HuggingFace y sus umbrales están calibrados sobre un conjunto de desarrollo propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pila de tres componentes: modelo de texto tipo transformer (SmolLM2-360M afinado con LoRA y fusionado), modelo de audio en streaming exportado a ONNX (`p99lab/turn-1-mini`) y regresion logistica que fusiona puntuaciones de texto, audio, prosodia y duracion de pausa |
| Parametros totales | 361 M en la parte de texto (modelo base SmolLM2-360M); tamano de la parte de audio no disponible en la informacion proporcionada; el bundle completo ocupa 0,7 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en el bundle. La entrada es el prefijo de transcripcion del turno actual mas el turno previo del agente (opcional) y los ultimos 8 s de audio |
| Tipos de cuantizacion | No documentados en el bundle. La etiqueta del repo marca el modelo base como cuantizado; se incluyen pesos safetensors para texto y un grafo ONNX para audio |
| Idiomas soportados | Ingles (`en`) unicamente |
| Licencia | Apache-2.0 (pesos de texto afinados, modelo de audio, pesos de la pila y manifiestos) |
| Formato de pesos | safetensors (texto), ONNX (audio, `turn-1-mini.step.onnx`), JSON (`weights.json`, `serving.json`, `reference.json`, `manifest.json` con tamano y sha256 por archivo) |
| Entradas | Audio PCM mono 16 kHz (ultimos 8 s antes de la pausa); prefijo de transcripcion del turno; turno previo del agente (opcional); offset de pausa en ms (0-2000) |
| Salidas | `p_eot` (probabilidad 0-1) y `fire` (booleano segun umbral y condicion) |
| Punto de operacion por defecto | `p5` (presupuesto del 5 % de cortes falsos) |
| Endpoints | `POST /v1/eot`, `WS /v1/eot/stream`, `GET /v1/models`, `GET /readyz` |

## Arquitectura y entrenamiento

La arquitectura es una cascada de senales seguida de un fusionador lineal, no un transformer extremo a extremo. La rama de texto parte de SmolLM2-360M, se afina mediante LoRA y se fusiona en los pesos finales para producir una puntuacion de completitud semantica sobre el prefijo de transcripcion. La rama de audio emplea `p99lab/turn-1-mini` sin reentrenar, exportado a ONNX y ejecutado en pasos de streaming sobre los 8 s previos a la pausa. Ambas puntuaciones, junto con rasgos de prosodia y la longitud de la pausa en milisegundos, alimentan una regresion logistica entrenada en el propio proyecto (`prod/weights.json`). Los umbrales por condicion de audio y punto de operacion se materializan en `prod/serving.json`.

No se detalla en la informacion disponible el volumen de tokens, la composicion del dataset ni si hubo RLHF o DPO; el pipeline descrito (manifiestos con sha256, `reference.json` con histogramas del conjunto de desarrollo y metricas PSI para Prometheus) indica un enfoque de ingenieria de serving con calibracion estadistica y monitorizacion de deriva mas que un entrenamiento a gran escala. El bundle incluye ademas un segundo componente, `shadow/`, que implementa una regla de silencio de 700 ms: la API la puntua y registra pero no la usa para responder, lo que permite comparar en produccion el detector aprendido contra la heuristica clasica.

## Capacidades

- Deteccion de fin de turno: devuelve `p_eot` continuo y una decision `fire` con umbral dependiente de la condicion de audio y del punto de operacion.
- Puntuacion semantica de transcripcion: clasifica si el prefijo del turno constituye una frase completa, usando opcionalmente el turno previo del agente como contexto.
- Puntuacion acustica en streaming: procesa los ultimos 8 s de audio en pasos incrementales mediante el grafo ONNX.
- Uso de prosodia y duracion de pausa como rasgos adicionales del fusionador logístico.
- Servicio en tiempo real: endpoint WebSocket para audio en vivo y endpoint HTTP para puntuar una pausa individual.
- Modo shadow integrado para comparar la politica aprendida con una regla de silencio fijo de 700 ms.
- Observabilidad: metricas PSI contra histogramas de referencia, Prometheus y Grafana incluidos en el arranque con Docker.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso, vision, audio de agente ni capacidades multimodales. Es un clasificador de una sola decision.

## Casos de uso

- Turn-taking en agentes de voz y IVR: el orquestador llama a `POST /v1/eot` en cada pausa detectada por el VAD y responde solo cuando `fire` es `true`, lo que evita solapamientos con el usuario en conversaciones multi-turno.
- Reduccion de latencia percibida frente a reglas fijas: sustituir una espera fija de 700 ms por una decision condicionada por texto y audio permite responder antes en frases claramente terminadas y esperar mas en frases suspendidas.
- Integracion en pipelines de streaming: el endpoint `WS /v1/eot/stream` acepta audio de telefonia en vivo y devuelve puntuaciones por paso, adecuado para integrarse en servidores de telefonia con WebSocket.
- Calibracion por canal de audio: con condiciones separadas para audio limpio y telefonia de 8 kHz (`tel8k`), el equipo puede ajustar el umbral por tipo de trafico y validar el porcentaje de cortes falsos antes de desplegar.
- Despliegue canario y evaluacion A/B: el bundle `shadow/` puntua la regla de 700 ms en paralelo y solo la registra, lo que permite medir la diferencia de latencia y de interrupciones antes de cambiar la politica en produccion.
- Monitorizacion de deriva en produccion: `reference.json` y las metricas PSI permiten detectar cambios en la distribucion de pausas o transcripciones (por ejemplo, tras un cambio de proveedor de ASR) y disparar recalibraciones.
- Analisis offline de grabaciones de contact center: puntuar pausas de llamadas ya transcritas para estimar cuantos turnos habria cortado una politica dada y priorizar la revision de umbrales.
- Filtro previo en sistemas de ASR parcial: usar el prefijo de transcripcion como senal de completitud para decidir cuando estabilizar el texto mostrado al usuario.

## Benchmarks y rendimiento

Resultados publicados por el autor en la particion de test de la release v0.1, audio limpio y punto de operacion `p5`:

| Metrica | Audio limpio | Telefonia (tel8k) | Fuera de dominio (v0.3-bench) |
|---|---|---|---|
| Latencia con objetivo de 5 % de FCO | 842 ms | 874 ms | ~1,9 s (umbral congelado) |
| FCO alcanzado | 6,6 % | 6,8 % | No disponible |
| AUC | 0,872 | No disponible | No disponible |
| Turnos reales que no disparan en 2 s | 19,8 % | No disponible | No disponible |

No se han publicado en la informacion disponible resultados comparativos con otros detectores de fin de turno (MMLU, HumanEval, GSM8K y similares no aplican a esta tarea). Las cifras corresponden a la release v0.1 y no consta una reevaluacion publica de la release v4.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 2 GB en fp16 para la rama de texto de 361 M (unos 0,7-0,8 GB de pesos) mas el grafo ONNX de audio y el estado del servidor; en fp32 la rama de texto ronda 1,4 GB. Cifras estimadas a partir del tamano del modelo, no publicadas por el autor.
- GPU recomendadas: no se requieren. Cualquier GPU con 4 GB o mas (T4, L4, RTX 3060 en adelante) es sobrada; A100 o H100 no aportan ventaja para este perfil de carga.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con 4 GB o mas, y tambien en CPU. El autor documenta ejecucion con Docker en maquinas Mac y Linux.
- Opciones de despliegue: Docker con `./start.sh` (descarga el bundle, arranca API, Prometheus y Grafana) o `uvicorn eot.app:app` con las variables `EOT_SERVING_BUNDLE`, `EOT_SERVING_SHADOW_BUNDLE`, `EOT_SERVING_TRACKING_URI` y `EOT_LAKE_ENABLED=false`. Runtime ONNX para la rama acustica. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, y no se publican pesos GGUF.
- Latencia y throughput: la latencia publicada es de 842 ms hasta la decision con el punto `p5` (incluye el tiempo de espera de la pausa); no se publican cifras de throughput ni de peticiones concurrentes por segundo.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nsudhanva/eot-detector` (v4) | Pila texto + audio + fusion logistica | 361 M (rama de texto) | Prefijo de transcripcion + 8 s de audio + pausa | Apache-2.0 | Bundle en HF, 0 descargas, 0 likes |
| `livekit/turn-detector` | Modelo de lenguaje para deteccion de fin de enunciado | No disponible en la informacion recogida | Solo contenido semantico de la transcripcion | No verificada en esta busqueda | Pesos abiertos en HuggingFace |
| `Vurtnec/eot-detector-smollm2` | Fine-tune de SmolLM2-135M para EOT | 135 M (base) | Transcripcion | No disponible en la informacion recogida | Pesos en HuggingFace |
| Regla de silencio de 700 ms (incluida como `shadow/`) | Heuristica temporal | 0 | Solo energia/tiempo | No aplica | Incluida en el bundle |

La diferencia principal frente a `livekit/turn-detector` y `Vurtnec/eot-detector-smollm2` es que este bundle incorpora una rama acustica ademas de la textual, y que publica umbrales por condicion de audio y un presupuesto explicito de cortes falsos. No se dispone de una comparacion head-to-head de AUC o latencia entre las tres alternativas.

## Limitaciones y advertencias

- Solo ingles. No hay soporte declarado de otros idiomas, lo que invalida su uso directo en castellano sin reentrenamiento.
- Los umbrales proceden del conjunto de desarrollo del autor. La propia model card exige calibrarlos sobre el trafico propio antes de usarlo en produccion.
- El 19,8 % de los finales de turno reales no disparan en 2 s con `p5`; el propio autor indica que la regla de silencio de 700 ms actua como respaldo obligatorio.
- El FCO alcanzado es del 6,6 % con objetivo del 5 % en audio limpio: en la practica esto implica cortar al usuario en aproximadamente una de cada quince pausas evaluadas.
- En dominio distinto (v0.3-bench) el umbral congelado es demasiado conservador y la latencia sube a unos 1,9 s; sin recalibracion el sistema es practicamente inutilizable en ese escenario.
- La rama de texto necesita transcripcion. Sin ASR disponible solo puntuan el modelo de audio y la duracion de la pausa, con perdida de calidad no cuantificada en la informacion disponible.
- El modelo de audio no ve el audio del agente; es imprescindible separar canales y enviar unicamente la voz del interlocutor.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si hay riesgo de decision erronea sobre la completitud semantica cuando el ASR entrega transcripciones parciales o con errores.
- La licencia Apache-2.0 permite uso comercial, pero el bundle incluye componentes de terceros (`p99lab/turn-1-mini`, SmolLM2-360M) cuyas condiciones conviene verificar por separado, aunque la model card los declara tambien Apache-2.0.
- Proyecto con 0 descargas y 0 likes: no hay validacion externa ni informes independientes. Las metricas publicadas corresponden a la release v0.1 y el bundle servido es la v4, sin reevaluacion publica.
- No se documentan sesgos demograficos ni linguisticos del detector, ni comportamiento con acentos distintos del estadounidense estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nsudhanva/eot-detector
- Modelo base de texto: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Modelo de audio: https://huggingface.co/p99lab/turn-1-mini
- Perfil del autor en GitHub: https://github.com/nsudhanva
- Perfil del autor en LinkedIn: https://www.linkedin.com/in/nsudhanva
- Alternativa basada en SmolLM2-135M: https://huggingface.co/Vurtnec/eot-detector-smollm2
- Alternativa de LiveKit: https://huggingface.co/livekit/turn-detector
