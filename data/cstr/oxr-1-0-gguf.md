# cstr/OXR-1.0-GGUF

## Resumen

OXR-1.0 es un modelo de visión-lenguaje especializado en OCR y *parsing* de documentos, desarrollado por SoMark Team (SoMarkAI). Resuelve el problema de extraer texto, tablas, fórmulas y estructura de imágenes de documentos completos, convirtiendo la imagen en una salida de texto estructurado. Combina una torre visual SigLIP2 con un *backbone* de lenguaje Qwen3, lo que da lugar a una arquitectura de tipo *image-text-to-text* de aproximadamente 1.534 millones de parámetros.

La ficha que nos ocupa, `cstr/OXR-1.0-GGUF`, no es el modelo original sino una conversión a formato GGUF realizada por CrispEmbed (autor `cstr`) para su *runtime* nativo ggml. Los pesos se distribuyen en tres precisiones (F16, Q8_0 y Q4_K mixto) y están pensados para ejecutarse en CPU a través de CrispEmbed, no en llama.cpp. La conversión es puramente de formato: no se ha reentrenado ni modificado ningún peso.

Es relevante ahora porque ofrece una vía de despliegue local y ligera (desde 1,88 GB en Q4_K) para una tarea de OCR estructurado que normalmente exige infraestructura de GPU. No obstante, su licencia OXR (Apache-2.0 con términos adicionales) impone restricciones comerciales y de competencia que conviene revisar antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (torre visual SigLIP2 + backbone de lenguaje Qwen3), perfil nativo OXR en ggml |
| Parámetros totales | 1.534.378.216 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0-LARGE, Q4_K-HEAD (mixta) |
| Idiomas soportados | no disponible (los tests de paridad incluyen casos en japonés y alemán) |
| Licencia | OXR (Apache-2.0 con términos adicionales) |
| Formato de pesos | GGUF (F16, Q8_0, Q4_K mixto) |

## Arquitectura y entrenamiento

El modelo original combina una torre visual SigLIP2 con un *backbone* de lenguaje basado en Qwen3, según se desprende de los tags y del contenido de la model card. La conversión a GGUF renombra tensores, ajusta *casts* e incrusta metadatos de *tokenizer* y preprocesado, y emplea nombres cortos de tensores visuales (`vit.`). El resultado usa la arquitectura `general.architecture = oxr` y **no es cargable por llama.cpp**; requiere el *runtime* nativo de CrispEmbed.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del *dataset* ni si hubo fases de RLHF o DPO. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal. Lo que sí se documenta es el proceso de cuantización: las variantes Q8_0 y Q4_K se generaron con la herramienta `crispembed-quantize` a partir del GGUF F16, con recetas mixtas (por ejemplo, Q4_K-HEAD usa Q4_K para la cabeza visual, Q8_0 para matrices/embeddings/lm_head del LLM y F16 para la torre SigLIP2). El *parsing* de páginas completas requiere además el detector de *layout* D-FINE, publicado por separado como `cstr/OXR-1.0-DFINE-layout-GGUF`.

## Capacidades

- OCR y extracción de texto a partir de imágenes de documentos.
- *Parsing* de documentos completos, incluyendo estructura de página cuando se combina con el detector de *layout* D-FINE.
- Reconocimiento de tablas y fórmulas (los tests de paridad incluyen casos `formula` y `table`).
- Procesamiento multilingüe: los casos de prueba congelados incluyen documentos en japonés y alemán.
- Conversión imagen-texto (*image-text-to-text*) como tarea principal del *pipeline*.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo *thinking*, visión general, audio: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de facturas y recibos: el modelo puede extraer texto y campos estructurados de imágenes de recibos (hay un caso de prueba `receipt` de 202 tokens), lo que lo hace adecuado para automatizar la entrada de datos contables en local sin GPU.
- Extracción de tablas de informes y PDFs escaneados: el caso `table` (261 tokens) demuestra capacidad para reconstruir contenido tabular, útil en pipelines de análisis de datos financieros o científicos.
- Reconocimiento de fórmulas matemáticas: el caso `formula` (22 tokens) apunta a su uso en digitalización de apuntes, artículos o material académico escaneado.
- Procesamiento de documentos multilingües: los casos en japonés (38 tokens) y alemán (401 tokens) permiten abordar corpus con mezcla de idiomas, por ejemplo en gestión documental internacional.
- *Parsing* de páginas completas con estructura: combinado con el detector D-FINE, sirve para reconstruir el orden de lectura y la disposición de bloques en páginas escaneadas, útil en archivística y digitalización masiva.
- Despliegue en CPU y entornos con recursos limitados: las variantes Q8_0 (2,03 GB) y Q4_K (1,88 GB) permiten ejecutar OCR estructurado en servidores sin GPU o en estaciones de trabajo modestas mediante CrispEmbed.
- Integración en pipelines de extracción documental *on-premise*: al ejecutarse en CPU con un *runtime* nativo, encaja en entornos donde no se permite enviar documentos a servicios en la nube por motivos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí documenta pruebas de paridad numérica frente al modelo original en Python sobre cinco peticiones congeladas (`formula`, `table`, `japanese`, `receipt`, `german`):

| Archivo | Precisión | Tamaño | Coincidencia de token IDs (5 casos) | Coseno de logits finales (mín.) | Diferencias decodificadas |
|---|---|---:|---|---|---|
| `oxr-1.0-f16.gguf` | F16 | 4,44 GB | 5/5 exactos | no medido (IDs exactos) | ninguna |
| `oxr-1.0-q8_0.gguf` | Q8_0-LARGE | 2,03 GB | 4/5 exactos; `german` difiere | 0,9977 (`table`); `german` 0,9996 | `german` CER 0,0111 |
| `oxr-1.0-q4_k-head.gguf` | Q4_K-HEAD | 1,88 GB | 4/5 exactos; `german` difiere | 0,9980 (`table`); `german` 0,9996 | `german` CER 0,0233 |

Las variantes cuantizadas superan los umbrales del autor (Q8_0 > 0,97; Q4_K > 0,94) en CPU. No se verificaron la ejecución en GPU ni en móvil/WASM, ni corpus de documentos representativos más allá de los cinco casos congelados.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,88 GB (Q4_K-HEAD), 2,03 GB (Q8_0-LARGE) y 4,44 GB (F16) solo para los pesos; hay que añadir la memoria del *runtime* y del detector D-FINE si se usa *parsing* de página completa.
- GPU recomendadas: no disponible; la model card solo documenta ejecución en CPU y no verifica GPU.
- ¿Cabe en GPU de consumo? Los pesos Q4_K y Q8_0 caben holgadamente en cualquier GPU de consumo con 4-8 GB de VRAM, pero la ejecución en GPU no está verificada.
- Opciones de despliegue: CrispEmbed (runtime nativo ggml, con `crispembed-server`); no es compatible con llama.cpp. Para *parsing* de página completa se necesita además `cstr/OXR-1.0-DFINE-layout-GGUF`.
- Latencia y *throughput*: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables (benchmarks estándar) de este modelo ni de alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo orientativo, se puede contrastar con otros modelos de OCR documental de la familia Qwen-VL o con Donut, pero sin cifras verificadas en esta ficha no es posible establecer una comparación rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| OXR-1.0 (este) | 1.534 M | no disponible | OXR (Apache-2.0 + términos) | GGUF (F16/Q8_0/Q4_K) |
| Alternativas OCR documental | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia OXR permite uso comercial sin licencia de SoMark solo si la entidad y sus afiliadas se mantienen por debajo de 2.000.000 USD en financiación total **y** en ingresos anuales.
- Un servicio en línea basado en OXR debe identificar de forma prominente a SoMark OXR.
- No se permite ofrecer a terceros una API alojada que compita con los servicios de *parsing* documental, OCR o *layout* de SoMark sin licencia escrita, independientemente del tamaño.
- El incumplimiento de estos términos extingue la licencia automáticamente.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo generativo de texto, es plausible, pero no hay datos.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada; los tests solo cubren cinco casos con japonés y alemán, sin corpus representativos.
- La variante Q8_0 y Q4_K presentan diferencias en el caso `german` (CER 0,0111 y 0,0233 respectivamente), por lo que no son token-ID exactas frente al original.
- No verificado en GPU, móvil/WASM ni con corpus de documentos amplios; los presupuestos numéricos estrictos por etapa no se cumplen ni siquiera en F32 (diferencias de un ulp en activaciones *outlier* del decodificador).
- No es cargable por llama.cpp; requiere CrispEmbed y aceptación explícita de la licencia (`CRISPEMBED_OXR=1`, `CRISPEMBED_ACCEPT_OXR_LICENSE=1` o `--accept-license oxr`).

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/cstr/OXR-1.0-GGUF
- Modelo original: https://huggingface.co/SoMarkAI/OXR-1.0
- Revisión fijada del original: https://huggingface.co/SoMarkAI/OXR-1.0/tree/c708407f9d2b4df658f2543d9132b62bb7221df4
- Detector de *layout* D-FINE: https://huggingface.co/cstr/OXR-1.0-DFINE-layout-GGUF
- Repositorio CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
- Receta de cuantización de referencia (fusor-rs/oxr-wasm, MIT): no disponible como enlace directo en la información proporcionada.
