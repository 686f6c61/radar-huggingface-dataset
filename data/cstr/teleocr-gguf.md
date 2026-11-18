# cstr/TeleOCR-GGUF

## Resumen

TeleOCR-GGUF es la conversión al formato GGUF del modelo TeleOCR, desarrollado originalmente por XingChen-AGI y China Telecom. Se trata de un modelo de visión-lenguaje especializado en OCR y parsing de documentos: recibe una imagen de un documento y genera texto estructurado (texto plano, fórmulas, tablas, código o layout). Esta versión GGUF la publica el usuario cstr para el runtime nativo ggml de CrispEmbed, no para llama.cpp.

El modelo base cuenta con 1.259.490.304 parámetros (aproximadamente 1,26 mil millones) y su codificador visual deriva de Qwen2.5-VL-3B-Instruct de Alibaba Cloud. La conversión no entrena ni modifica pesos: solo renombra tensores, castea y cuantiza. Se ofrecen cuatro variantes de precisión (F16, Q8_0, Q4_K_M y Q4_K_MIX) con verificación de paridad frente al modelo original en Python.

Su relevancia radica en que permite ejecutar un OCR especializado de documentos en hardware modesto (la variante Q4_K_MIX ocupa 1,14 GiB en memoria) manteniendo exactitud de token-ID en las variantes F16, Q8_0 y Q4_K_M sobre los seis casos de prueba congelados. La licencia heredada de Qwen restringe el uso a investigación y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (codificador visual derivado de Qwen2.5-VL-3B-Instruct + decoder); arquitectura GGUF `teleocr`, GGUF v1 |
| Parametros totales | 1.259.490.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M, Q4_K_MIX (política `teleocr_q4k_v1`) |
| Idiomas soportados | no disponible |
| Licencia | `qwen-research` (Qwen RESEARCH LICENSE AGREEMENT); uso solo de investigación y evaluación, uso comercial requiere licencia de Alibaba Cloud |
| Formato de pesos | GGUF (no cargable por llama.cpp; requiere CrispEmbed) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de tipo imagen-a-texto. El codificador visual procede de Qwen2.5-VL-3B-Instruct, según evidencia de linaje por cosenos de pesos por tensor documentada en CrispEmbed. El decoder y el cabezal de lenguaje completan la pila para generar texto estructurado a partir de la imagen del documento. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La conversión a GGUF realizada por CrispEmbed aplica renombrado de tensores, casting, incrustación de metadatos de tokenizer y preprocesado, y cuantización en las variantes indicadas. No se entrenó, ajustó ni fusionó ningún peso. Las variantes Q4_K_M y Q4_K_MIX usan recetas específicas: en Q4_K_M el decoder va en Q4_K con `ffn_down`/`attn_v` en Q6_K, mientras que visión, merger y embedding atado quedan en F16. La variante Q4_K_MIX (1.140 MiB frente a 2.015 MiB de Q8_0) aplica Q4_K a las puertas FFN de visión y al embedding/cabezal LM, Q6_K a la atención visual, F16 a la FFN down visual y Q8_0 al resto del decoder.

## Capacidades

- Generación de texto a partir de imágenes de documentos (image-text-to-text).
- OCR de texto plano.
- Reconocimiento y transcripción de fórmulas matemáticas.
- Parsing de tablas a formato estructurado.
- Extracción de código desde capturas o documentos.
- Análisis de layout de documentos.
- Salida estructurada según el tipo de contenido solicitado (texto, fórmula, tabla, código, layout).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión adicional o audio: no disponible.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo recibe la imagen del documento y devuelve el texto y las tablas en formato estructurado, lo que permite alimentar sistemas de contabilidad sin transcripción manual.
- Extracción de tablas de informes financieros: el perfil de tabla genera una representación estructurada de la rejilla, adecuada para su conversión posterior a CSV o bases de datos.
- Conversión de fórmulas científicas a notación textual: útil para digitalizar artículos escaneados y recuperar expresiones matemáticas en formato editable.
- Indexación de documentación técnica: procesar capturas de manuales o PDFs renderizados para extraer código y texto y construir un índice de búsqueda.
- Análisis de layout para pipelines de preprocesado: el perfil de layout permite segmentar la estructura del documento antes de aplicar otros modelos de NLP.
- Despliegue en entornos con recursos limitados: la variante Q4_K_MIX (1,14 GiB) permite ejecutar OCR en CPU, Metal o CUDA dentro de CrispEmbed, sin GPU de gran capacidad.
- Evaluación comparativa de OCR: las variantes F16, Q8_0 y Q4_K_M son token-ID exactas frente al modelo original en los seis casos congelados, lo que las hace útiles como referencia en pruebas de regresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo documenta pruebas de paridad numérica frente al modelo original en Python sobre seis peticiones congeladas (texto, fórmula, tabla, código, layout y sintética):

| Variante | Tamaño | Acuerdo token-ID (6 casos) | Coseno logits finales (mín., teacher-forced) | Diferencias decodificadas |
|---|---:|---|---|---|
| F16 | 2,53 GB | 6/6 exacto | no medido (IDs exactos) | ninguna |
| Q8_0 | 2,11 GB | 6/6 exacto | no medido (IDs exactos) | ninguna |
| Q4_K_M | 1,92 GB | 6/6 exacto | no medido (IDs exactos) | ninguna |
| Q4_K_MIX | 1,20 GB | no todos exactos | 0,9570 (umbral 0,94) | decodificación libre no exacta en el caso de tabla |

Las pruebas de paridad se realizaron en CPU con decodificación greedy. No se verificó paridad numérica en GPU, otras combinaciones de CPU/kernel, móvil/WASM ni benchmarks agregados de OCR más allá de los seis casos congelados. Tampoco se cumplen los presupuestos numéricos intermedios estrictos: diferencias de un ulp en las activaciones masivas del bloque visual 17 se amplifican, aunque los IDs y el texto decodificado son exactos.

## Requisitos de hardware

- VRAM estimada: F16 2,53 GB; Q8_0 2,11 GB; Q4_K_M 1,92 GB; Q4_K_MIX 1,20 GB (tamaños de fichero; el consumo en memoria es similar).
- GPU recomendadas: no especificadas en la información disponible; las pruebas de paridad se hicieron en CPU, con soporte declarado para Metal y CUDA en la variante Q4_K_MIX.
- Cabe en GPU de consumo: sí, todas las variantes caben en GPUs con 4 GB o más de VRAM; la variante Q4_K_MIX es la más adecuada para equipos muy limitados.
- Opciones de despliegue: exclusivamente CrispEmbed (runtime ggml nativo). No es cargable por llama.cpp, vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| TeleOCR-GGUF (este) | 1,26 B | no disponible | GGUF (CrispEmbed) | qwen-research (no comercial) | OCR especializado, 4 cuantizaciones |
| Qwen2.5-VL-3B-Instruct | 3 B (aprox.) | no disponible | safetensors | Qwen Research | Modelo generalista del que deriva el codificador visual |
| TeleOCR (original, XingChen-AGI) | 1,26 B | no disponible | safetensors | apache-2.0 declarada, con términos Qwen heredados | Modelo base en Python |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no comercial: los pesos heredan el Qwen RESEARCH LICENSE AGREEMENT; el uso comercial requiere licencia de Alibaba Cloud. La declaración apache-2.0 del autor original no relaja los términos heredados (sección 3d del acuerdo).
- Compatibilidad restringida: los ficheros solo se cargan en CrispEmbed, que exige `CRISPEMBED_ACCEPT_QWEN_RESEARCH_LICENSE=1` y `--accept-license qwen-research`; no funcionan en llama.cpp ni en otros runtimes GGUF.
- Paridad numérica limitada: no verificada en GPU, otras combinaciones de CPU/kernel ni móvil/WASM; los presupuestos numéricos intermedios estrictos no se cumplen ni en F32.
- Q4_K_MIX no es token-exacto en todos los casos: la decodificación libre difiere en el caso de tabla, aunque supera el umbral de coseno de 0,94.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado; como modelo generativo de OCR puede producir texto plausible no presente en la imagen, especialmente en documentos de baja calidad.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe.
- Longitud de contexto: no disponible.
- Benchmarks agregados de OCR: no publicados; la validación se limita a seis casos congelados.

## Enlaces

- Hugging Face: https://huggingface.co/cstr/TeleOCR-GGUF
- Modelo base: https://huggingface.co/XingChen-AGI/TeleOCR
- Repositorio CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
- Qwen2.5-VL-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
