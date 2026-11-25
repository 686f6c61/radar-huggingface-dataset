# pranil00/ONIX-DeepSeek-R1-Distill-Qwen-7B-GGUF

## Resumen
ONIX-DeepSeek-R1-Distill-Qwen-7B-GGUF es una cuantizacion en formato GGUF del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-7B, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El artefacto aplica una cuantizacion Q5_K_M (5,5 bits por peso) que reduce el tamano de los pesos de 14,89 GB en FP16 a 5,12 GB, lo que permite ejecutar un modelo de 7.615 millones de parametros en hardware de consumo como Apple Silicon con 16 GB de memoria unificada o GPUs NVIDIA de gama media.

El modelo base es un destilado de DeepSeek-R1 sobre la arquitectura Qwen2.5-7B, disenado para razonamiento con cadenas de pensamiento explicitas. Esta version cuantizada mantiene la licencia Apache 2.0 del original y se distribuye junto con el runner run-any-model, una herramienta de optimizacion adaptativa al dispositivo que genera perfiles de ejecucion para Metal, CUDA y CPU.

Su relevancia practica reside en que acerca un modelo de razonamiento de 7B a equipos sin GPU dedicada de gran capacidad, manteniendo segun el autor un 97,5% de la fidelidad cognitiva del modelo original. No obstante, se trata de un artefacto de cuantizacion de terceros sin benchmarks independientes publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia DeepSeek-R1-Distill sobre Qwen2.5) |
| Parametros totales | 7.615.483.904 (7,62 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (perfil optimo declarado); 4.096 en CPU |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); unico archivo publicado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano de pesos | 5,12 GB (5.242,8 MB) |
| Tamano del repo | 5,5 GB |
| Ratio de compresion | 2,91x frente a FP16 (reduccion del 65,6%) |

## Arquitectura y entrenamiento
El modelo base DeepSeek-R1-Distill-Qwen-7B es un transformer denso decoder-only derivado de Qwen2.5-7B, ajustado mediante destilacion del modelo de razonamiento DeepSeek-R1. Emplea atencion con RoPE y esta entrenado para producir trazas de razonamiento antes de la respuesta final, siguiendo el paradigma de cadenas de pensamiento largas. No se dispone de informacion detallada sobre el numero exacto de tokens de destilacion, la composicion del dataset ni las etapas de RLHF o DPO en la informacion proporcionada.

Esta publicacion concreta no entrena ningun modelo: es una conversion a GGUF con cuantizacion Q5_K_M realizada con la herramienta run-any-model. El autor declara que la aceleracion de capas alcanza 28 de 28 capas en Metal y que el buffer de KV cache se mantiene en FP16 (224 MB). No se documentan innovaciones arquitectonicas propias; la unica aportacion tecnica es el perfilado adaptativo al dispositivo del runner.

## Capacidades
- Generacion de texto y razonamiento multi-paso con trazas de pensamiento explicitas (estilo R1).
- Resolucion de problemas matematicos y logicos mediante cadenas de razonamiento.
- Generacion y explicacion de codigo en lenguajes habituales.
- Conversacion multi-turno con contexto de hasta 8.192 tokens en GPU y Apple Silicon.
- Ejecucion local en CPU con soporte AVX2/AVX-512.
- Integracion con Ollama, llama.cpp, LM Studio, Jan y Text-Generation-WebUI.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Idiomas soportados: no disponible.

## Casos de uso
- Asistente de razonamiento local en portatiles: un desarrollador puede ejecutar el modelo en un Mac con 16 GB de memoria unificada usando el perfil Metal declarado (5,40 GB residentes) para resolver problemas de logica o matematicas sin conexion a la nube.
- Generacion de codigo en entornos sin GPU: con 7,40 GB de RAM libre en CPU y contexto de 4.096 tokens, sirve para autocompletar funciones, explicar fragmentos y generar tests en estaciones de trabajo modestas.
- Prototipado de agentes de razonamiento: la salida con trazas de pensamiento permite depurar el proceso de decision del modelo antes de integrarlo en un pipeline mayor.
- Educacion y tutoria tecnica: el modelo puede desglosar problemas paso a paso, lo que encaja en escenarios de aprendizaje donde interesa ver el razonamiento y no solo la respuesta.
- Procesamiento por lotes de documentos tecnicos: con llama.cpp y `-ngl 99` en una RTX 3060 o superior (6,62 GB de VRAM declarados), se pueden resumir y analizar informes de hasta 8.192 tokens por pasada.
- Evaluacion comparativa de cuantizaciones: util como referencia para medir la perdida de calidad de Q5_K_M frente a FP16 en tareas de razonamiento, dado el ratio de compresion de 2,91x documentado.
- Despliegue en entornos air-gapped: al ser un unico archivo GGUF autocontenido de 5,12 GB, se puede trasladar a maquinas aisladas y ejecutar con Ollama sin dependencias externas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor unicamente aporta la matriz de telemetria de su herramienta:

| Metrica | FP16 (base) | Q5_K_M (esta version) | Cambio |
|---|---|---|---|
| Precision en bits por parametro | 16,0 | 5,5 | -65,6% |
| Tamano de pesos | 14,89 GB | 5,12 GB | -65,6% |
| Buffer KV cache | 224,0 MB | 224,0 MB | Optimizado |
| RAM residente total | 15,18 GB | 5,40 GB | -64,4% |
| Calidad estimada | 100,0% | 97,5% | -2,5% |
| Capas aceleradas | 0% (riesgo de fallo) | 28/28 | Optimo |

La cifra de retencion de calidad del 97,5% es una estimacion del autor, no una medicion con benchmarks publicos.

## Requisitos de hardware

| Plataforma | Memoria requerida | Contexto optimo | Estado |
|---|---|---|---|
| Apple Silicon (M1-M5) | 5,40 GB memoria unificada | 8.192 tokens | Metal acelerado |
| GPU NVIDIA (RTX 30/40/50) | 6,62 GB VRAM dedicada | 8.192 tokens | CUDA acelerado |
| PC Windows/Linux (CPU) | 7,40 GB RAM libre | 4.096 tokens | AVX2/AVX-512 |

- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070 y superiores; en Apple Silicon desde un M1 con 16 GB.
- Despliegue soportado: run-any-model, Ollama (mediante Modelfile), llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`), LM Studio, Jan y Text-Generation-WebUI.
- VRAM estimada para contexto completo: aproximadamente 6,6 GB en GPU NVIDIA segun el perfil del autor; el KV cache declarado es de 224 MB en FP16.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-DeepSeek-R1-Distill-Qwen-7B-GGUF (Q5_K_M) | 7,62 B | 8.192 | GGUF 5,12 GB | Apache 2.0 | Cuantizacion de terceros, sin benchmarks publicados |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B (original) | 7,62 B | 32.768 (nominal en Qwen2.5) | safetensors ~15 GB | Apache 2.0 | Referencia oficial; requiere ~15 GB en FP16 |
| Qwen2.5-7B-Instruct | 7,62 B | 32.768 | safetensors/GGUF | Apache 2.0 | Sin modo de razonamiento explicito; mas ligero en generacion |
| DeepSeek-R1-Distill-Llama-8B | 8,03 B | 131.072 | safetensors/GGUF | MIT | Mayor contexto nominal; requiere mas memoria |

El dato de contexto de 32.768 tokens para el modelo base corresponde a la arquitectura Qwen2.5 subyacente; esta ficha solo verifica los 8.192 tokens declarados en el perfil de ejecucion del autor.

## Limitaciones y advertencias
- La cuantizacion Q5_K_M introduce una perdida de calidad estimada del 2,5% segun el autor; no hay evaluacion independiente que lo confirme.
- El contexto declarado en esta publicacion (8.192 tokens) es inferior al nominal del modelo base, lo que limita tareas de contexto largo.
- Riesgo de alucinacion inherente a los modelos de razonamiento destilados, especialmente en dominios especializados y con cadenas de pensamiento largas.
- No hay informacion sobre sesgos; el modelo base hereda los sesgos de los datos de entrenamiento de DeepSeek-R1 y Qwen2.5.
- Idiomas soportados no documentados; el rendimiento fuera de ingles y chino puede degradarse.
- Artefacto publicado por un tercero (pranil00/ONIX) sin proceso de validacion visible: 0 descargas y 0 likes en el momento de la ficha.
- La model card incluye una clausula de exencion de responsabilidad total que traslada al usuario toda la responsabilidad sobre las salidas.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base antes de uso comercial en produccion.
- No se documenta soporte de tool calling ni de agentes multi-paso verificado.

## Enlaces
- Hugging Face: https://huggingface.co/pranil00/ONIX-DeepSeek-R1-Distill-Qwen-7B-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Repositorio del runner run-any-model: https://github.com/PranilShah-08/run-any-model
- Organizacion ONIX en Hugging Face: https://huggingface.co/ONIX
