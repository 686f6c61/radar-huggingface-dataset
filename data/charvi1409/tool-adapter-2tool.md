# Charvi1409/tool-adapter-2tool

## Resumen

tool-adapter-2tool es un adaptador LoRA de rango 16 entrenado sobre Qwen/Qwen3-0.6B por el usuario Charvi1409 y publicado en HuggingFace. No es un modelo de generacion de texto abierta: su funcion es clasificar cada turno del usuario dentro de una llamada de cualificacion de leads de fecundacion in vitro (IVF) en una de dos llamadas de herramienta, `acknowledge()` o `fallback()`. La primera cubre saludos, acuerdo o continuacion, confirmacion de un valor que ya esta presente en el estado actual, rechazo puro de la oferta y confirmaciones de identidad del tipo `ji haan` / `ji nahi`. La segunda absorbe todo lo demas: respuestas a preguntas de elicitacion de slots, negativas acompanadas de informacion nueva, correcciones, peticiones de conocimiento, traspaso a humano y turnos ambiguos o fuera de tema.

Una decision de diseno destacable es la ausencia deliberada de una herramienta `set_state()`: las respuestas de elicitacion de slots se enrutan a `fallback()` en lugar de escribir directamente en el estado. El adaptador se entrena sobre 1614 ejemplos etiquetados (296 `acknowledge()` y 1318 `fallback()`, es decir, un prior de clase de aproximadamente el 82% para `fallback()`), con 100 filas de validacion sin colisiones con entrenamiento y 100 flujos de llamada reales multi-turno.

Su interes practico es acotado pero claro: demuestra como un modelo de 0,6B de parametros puede resolver una decision de enrutamiento binaria dentro de un agente conversacional con un coste de entrenamiento minimo (400 iteraciones, learning rate 1e-5, `max_seq_length` 768, seed 42). El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder-only (modelo base Qwen/Qwen3-0.6B) |
| Parametros totales | 0,6B en el modelo base; tamano del adaptador no disponible (repo de 0,1 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador; el entrenamiento uso `max_seq_length` de 768 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (los ejemplos de la model card incluyen hindi transliterado, p. ej. `mai 32 ka hu`, `ji haan`) |
| Licencia | No disponible (la model card no la especifica) |
| Formato de pesos | Adaptador LoRA cargado con `mlx_lm` (`adapter_path`); no se detalla el formato de fichero |
| Modelo base | Qwen/Qwen3-0.6B |
| Configuracion LoRA | Rango 16, escala 20.0, dropout 0.05, 16 capas |
| Tarea | Clasificacion de turno en `acknowledge()` o `fallback()` |
| Fecha de publicacion | 2026-09-17 (creado), 2026-09-17 (actualizado) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 (escala 20.0, dropout 0.05) aplicado sobre 16 capas de Qwen/Qwen3-0.6B. El entrenamiento se realizo con mascara de prompt activada (`mask_prompt true`), batch 2 con acumulacion de gradiente 4, 400 iteraciones, learning rate 1e-5, longitud maxima de secuencia 768 y seed 42. La configuracion se distribuye en el fichero `lora_config_tool_adapter.yaml`. No se menciona uso de RLHF, DPO ni ninguna otra etapa de alineacion posterior; se trata de un ajuste supervisado sobre datos etiquetados de un unico dominio.

Los datos proceden de hojas de calculo (`dataset`, `from old data - fallbacks`, `from old data - all acks`) y se reparten en `train.jsonl` con 1614 filas (296 `acknowledge()` / 1318 `fallback()`), `valid.jsonl` con 100 filas reservadas sin colisiones de turno de usuario con entrenamiento y `valid_flows.jsonl` con 100 filas extraidas de flujos de llamada reales multi-turno, donde la regla de etiquetado es `acknowledge()` puro seguido de `acknowledge()`, y `fallback()` en cualquier otro caso. El autor documenta un modo de fallo conocido: la clase `acknowledge()` se infra-predice respecto a `fallback()` por el prior de clase. Indica ademas que el submuestreo de `fallback()`, el aumento de iteraciones y la ensenanza de filas exactas empeoraron la exactitud frente a esta linea base, lo que sugiere un ajuste sensible a la distribucion original.

## Capacidades

- Clasificacion binaria de turno de usuario en una de dos llamadas de herramienta: `acknowledge()` o `fallback()`.
- Reconocimiento de saludos y salutaciones como `acknowledge()`.
- Deteccion de acuerdo, continuacion y confirmacion de valores ya presentes en el estado actual.
- Deteccion de rechazo simple de oferta como `acknowledge()`.
- Reconocimiento de confirmaciones de identidad afirmativas y negativas (`ji haan` / `ji nahi`).
- Enrutamiento a `fallback()` de respuestas a preguntas de elicitacion de slots (si/no, afirmaciones suaves, valores).
- Enrutamiento a `fallback()` de negativas con informacion nueva, acuerdos con informacion nueva, reparaciones y correcciones.
- Enrutamiento a `fallback()` de peticiones de conocimiento, traspaso a humano, turnos ambiguos, inciertos o fuera de tema.
- Enrutamiento a `fallback()` de saludos que transportan informacion accionable.
- No soporta generacion de texto libre, tool calling general, agentes multi-paso, vision ni audio.
- Capacidades multilingues: no disponibles; los ejemplos disponibles estan en hindi transliterado e ingles.

## Casos de uso

- Enrutamiento de turnos en un agente de voz de cualificacion de leads IVF: el adaptador decide, turno a turno, si la intervencion del usuario se resuelve con un acuse (`acknowledge()`) o si debe pasar el control al flujo general (`fallback()`), sin invocar un modelo mayor.
- Reduccion de coste en pipelines de dialogo: al ser un modelo de 0,6B con un adaptador de rango 16, se puede ejecutar localmente en CPU o en GPU de gama baja y reservar el modelo grande para los turnos que caen en `fallback()`.
- Preprocesado de trazas de llamadas reales: clasificacion por lotes de transcripts historicos para etiquetar que turnos son meros acuses, usando como referencia `valid_flows.jsonl`.
- Deteccion de correcciones y reparaciones: todos los turnos de reparacion van a `fallback()`, lo que permite activar logica de correccion de slots sin reglas heuristicas adicionales.
- Deteccion de traspaso a humano: las peticiones de handoff se enrutan a `fallback()`, lo que sirve como senal para escalar la conversacion.
- Filtrado de turnos fuera de tema o ambiguos: los turnos inciertos o no relacionados se canalizan a `fallback()`, evitando que contaminen el estado del dialogo.
- Sistema de control de calidad de etiquetado: las 100 filas de `valid_flows.jsonl` con regla determinista permiten auditar la coherencia del enrutador frente a un criterio objetivo.
- Prototipado rapido con MLX en Apple Silicon: el ejemplo de uso oficial carga el modelo y el adaptador con `mlx_lm` y genera con `max_tokens=16`, adecuado para pruebas de integracion ligeras.

## Benchmarks y rendimiento

| Conjunto de evaluacion | Filas | Exactitud |
|---|---|---|
| `valid.jsonl` | 100 | 81,0% |
| `valid_flows.jsonl` | 100 | 95,0% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark general en la informacion disponible. El autor reporta un modo de fallo conocido: infra-prediccion de `acknowledge()` debido a que el prior de clase es aproximadamente 82% `fallback()`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, un modelo de 0,6B en FP16 ocupa aproximadamente 1,2 GB de pesos, y en cuantizaciones de 8 y 4 bits alrededor de 0,6 GB y 0,4 GB respectivamente; estas cifras son estimaciones genericas, no datos publicados por el autor.
- GPU recomendadas: no disponibles. El ejemplo oficial usa MLX, lo que implica Apple Silicon (familias M1/M2/M3/M4) como plataforma de referencia.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano de 0,6B del modelo base, aunque no hay confirmacion explicita en la model card.
- Opciones de despliegue: `mlx_lm` es la unica via documentada (`load(..., adapter_path=...)`). No se documentan vLLM, llama.cpp, Ollama ni TGI, ni se indica si existe una version GGUF del adaptador.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 0,1 GB.

## Comparativa con modelos similares

No se han encontrado en la busqueda web modelos comparables (clasificadores de turno para llamadas IVF ni adaptadores equivalentes). La comparacion se limita al modelo base y a la ausencia de referencias publicadas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tool-adapter-2tool (adaptador) | 0,6B (base) + LoRA rango 16 | No disponible (entreno a 768 tokens) | 81,0% en `valid.jsonl`, 95,0% en `valid_flows.jsonl` | No disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3-0.6B sin adaptador | 0,6B | No disponible en la informacion proporcionada | No disponible (no se reporta linea base sin adaptador) | No disponible en la informacion proporcionada | HuggingFace |
| Alternativas de clasificacion de intenciones | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Desbalance de clases: con un prior de aproximadamente 82% `fallback()`, el modelo infra-predice `acknowledge()`. Es el modo de fallo documentado por el propio autor.
- Intentos de corregir el desbalance mediante submuestreo de `fallback()`, mas iteraciones o ensenanza de filas exactas degradaron la exactitud respecto a la linea base de 400 iteraciones.
- Dominio muy estrecho: solo cubre llamadas de cualificacion de leads IVF y solo dos etiquetas posibles. No es un modelo de proposito general.
- Riesgo de alucinacion: no aplica en el sentido generativo habitual, pero si existe riesgo de enrutamiento incorrecto, especialmente en turnos ambiguos, mixtos (acuerdo mas informacion nueva) y saludos con informacion accionable.
- Limitacion de contexto: el entrenamiento uso `max_seq_length` 768; no se especifica el comportamiento con historiales mas largos.
- Idiomas: no se declaran idiomas soportados. Los ejemplos visibles combinan ingles con hindi transliterado, por lo que el comportamiento en castellano u otros idiomas no esta verificado.
- Licencia: no disponible. No se puede confirmar si el uso comercial del adaptador esta permitido; habria que consultar al autor y verificar la licencia del modelo base.
- Sin pipeline declarado, sin descargas y sin likes: el adaptador no tiene validacion externa ni uso comunitario documentado.
- La fecha de creacion y actualizacion registrada (2026-09-17) es posterior a la fecha habitual de publicacion de modelos; conviene verificar la vigencia del repositorio antes de integrarlo en produccion.
- Dependencia de plataforma: el unico ejemplo de uso esta escrito para `mlx_lm`, lo que limita la portabilidad a entornos Apple Silicon salvo que se conviertan los pesos manualmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Charvi1409/tool-adapter-2tool
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Libreria MLX LM (usada en el ejemplo de codigo): https://github.com/ml-explore/mlx-lm
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados obtenidos (repositorios de jailbreaks, hilos de Reddit sobre ChatGPT, discusiones sobre limites de uso de ChatGPT Plus) no guardan relacion con el adaptador. No se han encontrado papers, blogs, repositorios ni demos adicionales.
