# litert-community/Falcon-H1-1.5B-Deep-Instruct

## Resumen

Falcon-H1-1.5B-Deep-Instruct es un modelo de lenguaje de 1.500 millones de parametros desarrollado por TII (Technology Innovation Institute) dentro de la familia Falcon-H1. Su particularidad es una arquitectura completamente hibrida: cada una de sus capas ejecuta en paralelo una rama de atencion con grouped-query attention (GQA) y una rama de espacio de estados Mamba2 (selective scan), sumando ambas salidas. La variante "Deep" prioriza profundidad sobre anchura, con 66 capas y un tamano oculto de 1280.

El repositorio que nos ocupa, `litert-community/Falcon-H1-1.5B-Deep-Instruct`, no es el modelo original en safetensors, sino una conversion al formato `.litertlm` de Google LiteRT-LM, empaquetada en cuantizacion int8 y optimizada para inferencia en dispositivo (edge). Incluye el tokenizador, la plantilla de chat ChatML de Falcon-H1 y firmas de prefill multitud (1-1024 tokens) para que el runtime seleccione fragmentos ajustados.

Es relevante porque demuestra que un modelo hibrido con estado recurrente de tamano constante puede ejecutarse en moviles y placas como Raspberry Pi 5 con latencias utilizables: 16,5 tok/s de decodificacion en GPU Metal de un iPhone 17 Pro y 12 tok/s en CPU de un Galaxy S26. El coste es un fichero de 1,83 GB y una penalizacion de decodificacion derivada de sus 66 capas secuenciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: atencion GQA + Mamba2 en paralelo en cada capa |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (firmas de prefill exportadas de 1 a 1024 tokens) |
| Tipos de cuantizacion | int8 dinamico en capas lineales y embedding; convoluciones y scan en float; activaciones fp32 declaradas para GPU |
| Idiomas soportados | no disponible |
| Licencia | Falcon LLM License (other) |
| Formato de pesos | `.litertlm` (LiteRT-LM) |
| Tamano del fichero | 1,83 GB (repo completo: 5,5 GB) |
| Capas | 66 |
| Tamano oculto | 1280 |
| Buffers de estado | 264 (132 conv/SSM + 132 KV) |
| Runtime requerido | litert-lm >= 0.15 |

## Arquitectura y entrenamiento

Falcon-H1 emplea un diseno totalmente hibrido: cada capa procesa la misma entrada a traves de dos ramas paralelas, una de atencion con grouped-query attention y otra de Mamba2 con selective scan, y suma sus salidas. Como consecuencia, cada capa mantiene simultaneamente una cache KV y un estado recurrente de tamano constante (convolucion + SSM). La variante Deep concentra la capacidad en profundidad: 66 capas con tamano oculto 1280, lo que genera 264 buffers de estado, el mayor numero de cualquier tamano de la familia Falcon-H1.

La conversion a LiteRT-LM aplica cuantizacion int8 dinamica sobre las capas lineales y el embedding, dejando las convoluciones y el scan en coma flotante, y declara activaciones fp32 para la ruta GPU. El export en float se valido contra el modelo original de PyTorch con teacher forcing sobre 48 posiciones de decodificacion: top-1 y top-5 identicos en todas las posiciones, correlacion media de logits por posicion de 1,0000 y KL media aproximadamente 0. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat ChatML de Falcon-H1.
- Razonamiento aritmetico basico y respuesta a preguntas factuales (validado con pruebas de 8 preguntas, 8/8 en todas las configuraciones probadas).
- Ejecucion en dispositivo sin conexion: el fichero incluye tokenizador y metadatos del ejecutor, sin dependencias de red.
- Prefill por fragmentos: firmas exportadas de 1 a 1024 tokens permiten al runtime elegir chunks ajustados a la longitud del prompt.
- Soporte de backend GPU (Metal en iOS, GPU en Android) y CPU, con resultados equivalentes entre ambos.
- Capacidad de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales offline en movil: el modelo cabe en 1,83 GB y responde con 16,5 tok/s en la GPU de un iPhone 17 Pro, lo que permite integrar un chatbot de privacidad total (sin envio de datos a la nube) en aplicaciones iOS y Android mediante LiteRT-LM.
- Clasificacion y extraccion de informacion en el dispositivo: para tareas de etiquetado de texto, resumen de notas o extraccion de campos de documentos locales, el prefill de 140 tok/s en GPU y 103 tok/s en CPU mantiene la latencia de primera respuesta en torno a 1,2-1,5 s con prompts de 146 tokens.
- Automatizacion en Raspberry Pi 5: con 2 tok/s de decodificacion y 25 tok/s de prefill, es viable para tareas por lotes no interactivas, como generar descripciones de registros de sensores o resumir ficheros de log en un nodo edge.
- Prototipado rapido de aplicaciones de IA generativa: el comando `litert-lm run` con `--backend gpu` permite validar flujos conversacionales en hardware real sin infraestructura de servidores.
- Pruebas de regresion de modelos hibridos: la coincidencia de logits documentada frente a PyTorch (correlacion 1,0000 en 48 posiciones) lo convierte en una referencia util para verificar la fidelidad de conversiones a formatos edge.
- Educacion y demostraciones: su tamano reducido y su ejecucion local permiten desplegar demos de generacion de texto en aulas o ferias sin GPU dedicada, usando portatiles con Apple Silicon (51,7 tok/s de decodificacion en M4 Max).
- Evaluacion comparativa de backends: util para medir diferencias CPU/GPU en un mismo modelo con estado recurrente, ya que el repositorio documenta metricas de memoria pico (4,89 GB en GPU frente a 1,74 GB en CPU en iPhone 17 Pro).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Si se documentan mediciones de rendimiento en inferencia:

| Entorno | Backend | Prefill | Decodificacion | TTFT |
|---|---|---|---|---|
| Apple M4 Max (256 prefill / 256 decode) | GPU | 1134 tok/s | 51,7 tok/s | 0,25 s |
| Apple M4 Max (256 prefill / 256 decode) | CPU | 192 tok/s | 22,7 tok/s | 1,38 s |
| iPhone 17 Pro (prompt de 146 tokens) | GPU Metal | 140,3 tok/s | 16,5 tok/s | 1,19 s |
| iPhone 17 Pro (prompt de 146 tokens) | CPU | 103,2 tok/s | 9,9 tok/s | 1,53 s |
| Galaxy S26 | GPU | 121 tok/s | 6,0 tok/s | 1,92 s |
| Galaxy S26 | CPU | 103 tok/s | 12,0 tok/s | 2,14 s |
| Raspberry Pi 5 (4 hilos) | CPU | 25 tok/s | 2,0 tok/s | 10,90 s |

Memoria pico en iPhone 17 Pro: 4,89 GB en GPU (activaciones fp32) y 1,74 GB en CPU. El autor senala que la profundidad penaliza la decodificacion: 66 bloques secuenciales de atencion y scan por token hacen que la decodificacion quede por debajo del modelo de 3B, mas superficial.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Falcon-H1-1.5B-Deep-Instruct (LiteRT-LM) | 1,5B | Hibrida GQA + Mamba2, 66 capas | no disponible | Falcon LLM License | `.litertlm` int8 |
| Falcon-H1-3B-Instruct (LiteRT-LM) | 3B | Hibrida GQA + Mamba2 | no disponible | Falcon LLM License | `.litertlm` |
| Falcon-H1-0.5B-Instruct (LiteRT-LM) | 0,5B | Hibrida GQA + Mamba2 | no disponible | Falcon LLM License | `.litertlm` |
| Falcon-H1-1.5B-Instruct (LiteRT-LM) | 1,5B | Hibrida GQA + Mamba2 | no disponible | Falcon LLM License | `.litertlm` |

Los cuatro modelos comparten la misma receta de conversion y parche segun la model card. La diferencia entre la variante Deep y la estandar de 1,5B es la distribucion de capacidad: la Deep usa 66 capas con tamano oculto 1280, lo que incrementa el numero de buffers de estado y reduce la velocidad de decodificacion. No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Bug de runtime con multiples conversaciones: en litert-lm 0.18.0, reutilizar un mismo Engine para una segunda conversacion reutiliza los tokens compartidos del prompt anterior sin reiniciar el estado recurrente. En pruebas, el modelo respondio con frases completas aunque el system prompt exigia una sola palabra. Debe crearse un Engine nuevo por conversacion. Existe un parche en main desde el 2026-11-03 (commit e1f86b05) que aun no esta en ninguna release (v0.19.1 no lo incluye).
- Penalizacion de decodificacion por profundidad: 66 capas implican 66 bloques secuenciales por token; la decodificacion queda por debajo del modelo de 3B pese a tener la mitad de parametros.
- Consumo de memoria en GPU: las activaciones fp32 declaradas elevan la memoria pico a 4,89 GB en iPhone 17 Pro, frente a 1,74 GB en CPU.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad factual mas alla de la prueba de 8 preguntas; el modelo es de 1,5B y debe tratarse con cautela en dominios especializados.
- Idiomas soportados no documentados: no hay informacion sobre cobertura multilingue; asumir un rendimiento predominante en ingles.
- Longitud de contexto no documentada: las firmas de prefill llegan a 1024 tokens, pero no se especifica la ventana maxima del modelo.
- Licencia Falcon LLM License: no es una licencia open source aprobada por OSI; requiere revisar los terminos en el enlace oficial antes de uso comercial.
- Requiere litert-lm >= 0.15 y esta orientado exclusivamente a inferencia en dispositivo; no es adecuado para despliegue en servidor con vLLM, TGI o llama.cpp, ya que el formato `.litertlm` no es compatible con esos runtimes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Falcon-H1-1.5B-Deep-Instruct
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1-1.5B-Deep-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Informe del bug de multiples conversaciones: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Commit con el parche: https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
- Ficha de compatibilidad edge: https://github.com/john-rocky/edge-compat/blob/main/cards/falcon-h1-1.5b-deep-instruct-int8/CARD.md
- Conversiones hermanas: https://huggingface.co/litert-community/Falcon-H1-0.5B-Instruct, https://huggingface.co/litert-community/Falcon-H1-1.5B-Instruct, https://huggingface.co/litert-community/Falcon-H1-3B-Instruct
- Terminos de licencia Falcon: https://falconllm.tii.ae/falcon-terms-and-conditions.html
