# KINOQ/Qwen3.8-27B-XeFP4

## Resumen

Qwen3.8-27B-XeFP4 es una cuantización a 4 bits del modelo Qwen/Qwen3.8-27B, publicada por el usuario KINOQ. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de los pesos del modelo base de Qwen a XeFP4, un formato abierto de pesos de 4 bits diseñado específicamente para GPUs Intel Arc. El repositorio contiene únicamente el modelo de texto, no los componentes multimodales si los hubiera en el modelo original.

La relevancia de esta ficha radica en que el formato XeFP4 y su motor de ejecución, XeQ Runtime, no son compatibles con el ecosistema estándar de inferencia (transformers, llama.cpp, vLLM). Los archivos `.bin` requieren el runtime OpenCL propietario del autor, lo que limita su uso a hardware Intel Arc y a un stack de software muy concreto. El modelo base es un transformer denso de 27.000 millones de parámetros, sin mezcla de expertos, según se deduce de las notas de rendimiento del autor sobre ancho de banda de memoria.

El interés técnico está en la propuesta de cuantización: 4.096 bits por peso en capas lineales, con un encoder con compensación de error estilo GPTQ, cabecera de salida en INT8 y una cabeza MTP opcional para decodificación especulativa. El autor publica métricas de perplejidad y velocidad en dos GPUs Intel concretas, lo que permite evaluar el compromiso entre precisión y rendimiento en ese hardware específico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen/Qwen3.8-27B); incluye cabeza MTP opcional para decodificación especulativa |
| Parámetros totales | 27.000 millones (según nombre del modelo base; no confirmado en la información disponible) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | Hasta 32K según configuración del runtime; 8K en Arc A770 16 GB con MTP, 32K en Arc 140T con 32 GB |
| Tipos de cuantizacion | XeFP4-8 (E2M1, bloque 32, factor de bloque de 3 bits, escala de fila FP16, 4.096 bits/peso); lm_head en INT8 con escala FP32 por fila; normas, gates, conv, A_log y dt_bias en FP32 |
| Idiomas soportados | no disponible (la calibración incluyó texto web en inglés, coreano, código en 12 lenguajes y chat multilingüe en 15 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.bin` + `.json` propietario de XeFP4; no compatible con safetensors, GGUF ni formatos estándar |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27.000 millones de parámetros. Esta ficha no dispone de información sobre su entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO), ya que la model card del repositorio cuantizado no la incluye y solo referencia el modelo base. La innovación técnica destacable de esta publicación no está en el entrenamiento, sino en el proceso de cuantización.

La cuantización emplea un encoder con compensación de error de estilo GPTQ: las columnas se codifican en orden y el error de redondeo de cada columna se propaga a las columnas aún no codificadas, ponderado por las estadísticas de entrada de la capa. Los factores de bloque y las escalas de fila se eligen con esas mismas estadísticas. La calibración usó 128 secuencias de 512 tokens, ninguna proveniente de los conjuntos de evaluación: texto web en inglés, coreano (Wikipedia, noticias, chat), código en 12 lenguajes y Markdown, y chat multilingüe en 15 idiomas. Además, se incluye una cabeza MTP (multi-token prediction) opcional de 217 MB para decodificación especulativa, con dos borradores por paso en modo greedy.

## Capacidades

- Generación de texto conversacional y de formato largo, con plantilla de chat incluida (`chat_template.jinja`).
- Modo de razonamiento ("thinking mode") desactivable por defecto y activable con `--think`; genera razonamiento extenso antes de la respuesta.
- Generación de código en múltiples lenguajes (la calibración cubre Python, C++, JavaScript, Rust, Java, Go, TypeScript y Swift).
- Traducción y manejo multilingüe (la calibración incluye 15 idiomas en chat y coreano en texto).
- Decodificación especulativa mediante cabeza MTP opcional, con la misma salida que la decodificación plana.
- Muestreo configurable: temperatura, top-p, top-k, min-p, penalización de presencia, penalización de repetición y semilla.
- Servidor HTTP integrado (`python -m xeq serve`) para exponer el modelo como API.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo con GPU Intel Arc: el modelo puede mantener conversaciones multi-turno con contexto de hasta 8K en una Arc A770 16 GB o 32K en una Arc 140T con 32 GB, usando el servidor integrado de XeQ Runtime.
- Generación de código en entornos con hardware Intel: la calibración incluye ocho lenguajes de programación y la decodificación greedy por defecto favorece respuestas deterministas, adecuadas para sugerencias de código reproducibles.
- Traducción y procesamiento multilingüe: la calibración cubre 15 idiomas en chat, lo que lo hace apto para tareas de traducción o resumen en esos idiomas, siempre que se valide la calidad por idioma.
- Razonamiento paso a paso en modo thinking: útil para problemas que requieren cadena de razonamiento explícita, aceptando que a las velocidades documentadas (3,4-4,7 tok/s en Arc 140T) las respuestas largas tardan minutos.
- Despliegue en portátiles con gráfica integrada Intel Arc 140T: con 32 GB de RAM compartida cabe un contexto de 32K, lo que permite procesar documentos largos en un equipo sin GPU dedicada.
- Evaluación y experimentación con el formato XeFP4: investigadores interesados en cuantización de 4 bits pueden usar este repositorio como referencia para medir perplejidad y velocidad frente a BF16 y GGUF UD-IQ4_XS en el mismo hardware.
- Servicio de inferencia ligero en producción interna: el servidor HTTP de XeQ Runtime permite exponer el modelo en un puerto con contexto configurable, aunque el throughput limita su uso a cargas de baja concurrencia.

## Benchmarks y rendimiento

Perplejidad (menor es mejor), según la model card del autor:

| Modelo | Tamaño | Inglés web | Wikipedia coreano | Código | Markdown |
|---|---|---|---|---|---|
| BF16 | – | 9,1256 | 3,7758 | 2,3763 | 7,0056 |
| XeFP4 (este modelo) | 14,40 GB | 9,2987 (+1,90%) | 3,8085 (+0,87%) | 2,3832 (+0,29%) | 7,0943 (+1,27%) |
| GGUF UD-IQ4_XS | 14,35 GB | 9,2566 (+1,44%) | 3,8423 (+1,76%) | 2,3860 (+0,41%) | 7,0819 (+1,09%) |

Rendimiento en Intel Arc A770 16 GB (driver 32.0.101.9150, batch 1, greedy, KV cache FP16):

| Métrica | tok/s |
|---|---|
| Decode, MTP off | 21,5 |
| Decode, MTP on (2 borradores/paso) | 35,0 (prompt corto), 29,1 (explicación de 150 palabras) |
| Prefill, prompt de 1.800 tokens | 772 |

Rendimiento en Intel Arc 140T (Core Ultra 7 235H, 32 GB DDR5-5600):

| Prompt / contexto | Prefill tok/s | Decode en esa posición, MTP off |
|---|---|---|
| 2K | ~215 | 4,7 |
| 8K | ~200 | 4,4 |
| 16K | ~190 | 4,0 |
| 26K | ~170 | no disponible |
| 32K | no disponible | 3,4 |

Con MTP en la 140T: 8,6 tok/s en respuestas largas (2,4 tokens por pasada de verificación).

## Requisitos de hardware

- Pesos: 13,4 GiB. Memoria GPU asignada con KV cache FP16: 14,2 GiB a 4K sin MTP, 15,1 GiB a 8K con MTP, 18,2 GiB a 32K con MTP.
- GPU Intel Arc A770 16 GB: hasta 8K de contexto con MTP; el motor usa chunks de prefill de 1024 tokens en GPUs con menos de 20 GiB.
- Intel Arc 140T con 32 GB de RAM: contexto de 32K en memoria GPU compartida por defecto.
- Solo hardware Intel Arc (Xe-HPG y Xe-LPG+ probados); no se garantiza en otras GPUs Intel ni en NVIDIA/AMD.
- Despliegue exclusivamente mediante XeQ Runtime (OpenCL); no funciona en vLLM, llama.cpp, Ollama, TGI ni transformers.
- Throughput documentado: 21,5-35 tok/s en A770 y 3,4-8,6 tok/s en 140T; el decode está limitado por ancho de banda de memoria al leer 13,7 GB de pesos por token.
- No cabe en GPUs de consumo NVIDIA/AMD mediante este formato; para esas plataformas habría que usar otra cuantización del modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / hardware | Precisión (perplejidad inglés web) |
|---|---|---|---|---|---|
| Qwen3.8-27B-XeFP4 (este) | 27B denso | hasta 32K | Apache 2.0 | XeFP4 / Intel Arc vía XeQ | 9,2987 |
| Qwen3.8-27B BF16 (base) | 27B denso | no disponible | Apache 2.0 | safetensors / GPU estándar | 9,1256 |
| Qwen3.8-27B GGUF UD-IQ4_XS | 27B denso | no disponible | Apache 2.0 | GGUF / llama.cpp | 9,2566 |
| Gemma 4 26B-A4B (referencia citada por el autor) | 26B MoE (4B activos) | no disponible | no disponible | no disponible / Intel Arc | no disponible |

El autor cita Gemma 4 26B-A4B como alternativa MoE mucho más rápida en la misma Arc 140T (20-24 tok/s frente a 4-8 tok/s), aunque no aporta datos de precisión para ese modelo.

## Limitaciones y advertencias

- Los archivos no cargan en transformers, llama.cpp ni vLLM; requieren XeQ Runtime (OpenCL) y una versión del motor de 2026-11-21 o posterior.
- Compatibilidad limitada a GPUs Intel Arc probadas (A770 y 140T); otras GPUs Intel quedan fuera de la garantía del autor.
- Rendimiento muy bajo en gráficas integradas (3,4-8,6 tok/s), lo que hace impracticable el modo thinking con respuestas largas en esos equipos.
- El modo thinking está desactivado por defecto y, según el autor, genera razonamientos que "tardan minutos" a esas velocidades.
- Con muestreo activado se desactiva MTP (el multi-draft MTP es solo greedy), reduciendo el throughput.
- La calibración no incluye datos de los conjuntos de evaluación, pero la cobertura idiomática real del modelo base no está documentada en esta ficha.
- Riesgo de alucinación y sesgos del modelo base no evaluados en la información disponible; no hay benchmarks de MMLU, HumanEval ni GSM8K publicados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Aunque la licencia es Apache 2.0, conviene verificar el NOTICE y la licencia del modelo base antes de uso comercial.
- El repositorio contiene solo el modelo de texto; no incluye componentes multimodales del modelo base si existieran.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KINOQ/Qwen3.8-27B-XeFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Runtime XeQ / XeFP4: https://github.com/kinoqdev/XeFP4
- Especificación del formato XeFP4: https://github.com/kinoqdev/XeFP4/blob/main/spec/XEFP4_SPEC.md
