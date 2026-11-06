# OsaurusAI/NuExtract3-JANG_6M

## Resumen

OsaurusAI/NuExtract3-JANG_6M es una cuantización de 6 bits del modelo numind/NuExtract3, publicada por OsaurusAI y empaquetada específicamente para Apple Silicon mediante la librería MLX. El modelo base NuExtract3 está orientado a extracción estructurada de información: recibe texto o imágenes de documentos y devuelve JSON tipado según una plantilla definida por el usuario, además de conversión a Markdown y chat sobre documentos. Esta build conserva la cabeza de borrador MTP nativa del modelo original, lo que permite decodificación especulativa en inferencia.

El bundle ocupa 4,39 GiB en disco en un único shard, con pesos almacenados en bfloat16 y cuantización mixta: atención completa en 8 bits, proyecciones del bloque gated-delta en 6 bits y MLP en 6 bits con AWQ + GPTQ. El objetivo es ofrecer una alternativa de mayor fidelidad que las cuantizaciones uniformes de 4 o 6 bits habituales en mlx-vlm, manteniendo un tamaño manejable para equipos con memoria unificada de Apple.

Con 4.659.865.088 parámetros totales (aproximadamente 4,66 mil millones), el modelo se sitúa en la gama media y es relevante ahora porque combina extracción estructurada multimodal (texto e imagen) con un proceso de cuantización documentado y medido frente al original en bf16, algo poco habitual en builds comunitarias. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa y bloques gated-delta (según la nomenclatura de pesos del bundle), base qwen3_5 |
| Parametros totales | 4.659.865.088 (≈4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: 8 bits afín grupo 32 (atención q/k/v/o, gates decay/beta, embedding/lm_head), 6 bits afín grupo 32 (in_proj_qkv, in_proj_z, out_proj, MLP gate/up/down), 8 bits grupo 64 en cabeza MTP; torre de visión, conv1d, A_log, dt_bias y normas en precisión completa |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), un único shard de 4,39 GiB en bfloat16 |

## Arquitectura y entrenamiento

El modelo base NuExtract3 emplea una arquitectura transformer con una combinación de capas de atención completa y capas gated-delta (un mecanismo de estado recurrente lineal), e incorpora una torre de visión para procesar imágenes de documentos. La build JANG_6M mantiene la cabeza de borrador MTP (multi-token prediction) nativa, que habilita decodificación especulativa, y conserva en precisión completa los componentes sensibles: torre de visión, kernels conv1d, A_log, dt_bias y todas las normas.

La cuantización se realizó con GPTQ sobre 248 de 248 tensores del tronco, con almacenamiento fijo en bf16, act-order, Hessians calculados sobre el corpus completo y reconstrucción del Hessian de down_proj a través de las proyecciones gate/up ya cuantizadas, además de una guarda best-of-RTN. La calibración abarcó 371.576 tokens generados con la propia plantilla de NuExtract3 (variables `mode`, `template`, `enable_thinking`) y el muestreo recomendado (0,2 sin thinking, 0,6 con thinking). La composición incluye 95.346 tokens de extracción estructurada desde texto, 81.254 de imagen a Markdown, 60.591 de preguntas y resúmenes de documentos, 57.361 de extracción desde imágenes, 26.280 de generación de plantillas, 18.779 de detección de documentos y 31.965 de texto general, con documentos sintéticos (facturas, correos, currículos, contratos, tickets, extractos), Wikipedia en alemán y capturas renderizadas de recibos, tablas y gráficos.

## Capacidades

- Extracción estructurada de información desde texto mediante plantillas JSON tipadas.
- Extracción estructurada desde imágenes de documentos (pipeline image-text-to-text).
- Conversión de imágenes de documentos a Markdown.
- Chat conversacional sobre documentos, con preguntas y resúmenes.
- Generación de plantillas de extracción a partir de instrucciones.
- Detección y clasificación de tipos de documento.
- Modo thinking opcional (`enable_thinking`) para razonamiento antes de la respuesta.
- Decodificación especulativa mediante la cabeza MTP conservada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (la calibración incluye textos en alemán, pero no se declaran idiomas soportados).

## Casos de uso

- Procesamiento de facturas y recibos: el modelo recibe la imagen o el texto del documento y devuelve un JSON con los campos definidos en la plantilla (importe, fecha, emisor, líneas de detalle), lo que permite integrarlo en un pipeline contable sin post-procesado manual.
- Digitalización de contratos y currículos: con una plantilla tipada se extraen partes, fechas, cláusulas o experiencia laboral de forma consistente, y el modo thinking ayuda en documentos con estructuras irregulares.
- Conversión de documentos escaneados a Markdown: útil para construir bases de conocimiento o repositorios documentales a partir de imágenes de tablas, gráficos y notas, aprovechando la calibración específica en imagen a Markdown.
- Chat sobre documentación técnica: preguntas y resúmenes sobre manuales o textos de seguridad, con respuestas ancladas al documento proporcionado en el contexto.
- Clasificación y enrutado de documentos entrantes: la tarea de detección de documentos permite etiquetar tickets, extractos o correos antes de derivarlos al flujo correspondiente.
- Asistencia en escritorio en Apple Silicon: al estar empaquetado en MLX con 4,39 GiB, puede ejecutarse localmente en un Mac para tareas de extracción sin enviar datos sensibles a la nube.
- Generación de plantillas: a partir de una descripción en lenguaje natural, el modelo produce la plantilla JSON que luego se reutiliza en extracciones masivas.

## Benchmarks y rendimiento

Evaluación frente al modelo original en bf16 sobre 47 prompts retenidos no vistos en calibración (7.537 posiciones de respuesta puntuadas) y 23 tareas de extracción respondidas de forma greedy y comparadas con el JSON del bf16:

| Build | Tamano | KL media | Top-1 | JSON valido | Campos coincidentes con bf16 |
|---|---|---|---|---|---|
| Este bundle (JANG_6M) | 4,39 GiB | 0,00027 | 99,77% | 23/23 | 87,6% |
| Mismo layout, round-to-nearest | 4,39 GiB | 0,00056 | 99,63% | 23/23 | 88,1% |
| 6 bits uniforme gs64 (receta por defecto de mlx-vlm) | 3,81 GiB | 0,00095 | 99,54% | 23/23 | 81,5% |
| numind/NuExtract3-mlx-4bits (oficial) | 2,83 GiB | 0,01118 | 98,24% | 23/23 | 77,5% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 4,39 GiB solo para los pesos; en la práctica se recomienda reservar entre 6 y 8 GiB para pesos, caché KV y overhead de MLX.
- Hardware objetivo: Apple Silicon con memoria unificada; el formato MLX no está pensado para GPU NVIDIA.
- Equipos viables: Mac con 16 GB de memoria unificada en adelante; 8 GB resulta ajustado para documentos e imágenes grandes.
- Despliegue: librería MLX (mlx-vlm y ecosistema MLX); no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles; la cabeza MTP permite decodificación especulativa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | JSON valido | Campos vs bf16 | Licencia |
|---|---|---|---|---|---|---|
| OsaurusAI/NuExtract3-JANG_6M | ≈4,66 mil M | no disponible | 4,39 GiB | 23/23 | 87,6% | Apache 2.0 |
| numind/NuExtract3-mlx-4bits | no disponible | no disponible | 2,83 GiB | 23/23 | 77,5% | Apache 2.0 (heredada) |
| 6 bits uniforme gs64 (mlx-vlm) | ≈4,66 mil M | no disponible | 3,81 GiB | 23/23 | 81,5% | según receta |
| numind/NuExtract3 (bf16) | ≈4,66 mil M | no disponible | no disponible | referencia | 100% (referencia) | Apache 2.0 |

La comparativa se limita a variantes del mismo modelo base porque la información proporcionada no incluye otros modelos de extracción estructurada con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; la calibración incluye documentos sintéticos y Wikipedia en alemán, lo que puede sesgar el comportamiento hacia esos formatos.
- Riesgo de alucinación: inherente a la generación de JSON; aunque el 23/23 de JSON válido indica buena adherencia al formato, la coincidencia de campos con bf16 es del 87,6%, por lo que algunos valores pueden diferir del original.
- Idiomas: no se declaran idiomas soportados; el rendimiento fuera de inglés y alemán no está verificado.
- Contexto: la longitud de contexto no está especificada, lo que impide planificar documentos largos con garantías.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base numind/NuExtract3 y de los datos de calibración.
- Producción: el formato MLX limita el despliegue a Apple Silicon; para servidores con GPU NVIDIA sería necesario reconvertir los pesos.
- Precisión: al ser una cuantización, no sustituye al bf16 en tareas donde la exactitud campo a campo sea crítica sin validación posterior.
- Fecha de creación del repositorio (2026-10-28) y escaso número de descargas (51): poca validación comunitaria todavía.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OsaurusAI/NuExtract3-JANG_6M
- Modelo base: https://huggingface.co/numind/NuExtract3
- Cuantización oficial en 4 bits: https://huggingface.co/numind/NuExtract3-mlx-4bits
- Sitio de Osaurus AI: https://osaurus.ai
- Papers, blogs y repositorios adicionales: no disponibles en la información proporcionada.
