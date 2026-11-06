# FlagRelease/MiniCPM-OCR-1.0-BF16-hygon-FlagOS

## Resumen

MiniCPM-OCR 1.0 es un modelo especializado en análisis de documentos y reconocimiento de texto desarrollado por ModelBest en colaboración con OpenBMB. Con 1.300 millones de parámetros, está diseñado específicamente para escenarios documentales del mundo real: escaneos, fotografías, páginas curvadas y capturas de pantalla re-fotografiadas. El modelo aborda el parsing de texto, fórmulas y tablas complejas, así como la extracción de información clave, un problema recurrente en pipelines de digitalización documental donde los OCR tradicionales fallan ante geometrías deformadas o contenido estructurado.

La versión publicada en este repositorio es un build de FlagOS adaptado a hardware Hygon, distribuido por la comunidad FlagOS como parte de su estrategia de adaptación cross-chip Day-0. FlagOS ofrece soporte para 12 plataformas de cómputo distintas (T-Head, NVIDIA, Huawei Ascend, Hygon, KUNLUNXIN, MetaX, Moore Threads, Tsingmicro, Iluvatar CoreX, Xiwang, Mac ARM y CIX), lo que permite desplegar el mismo modelo sobre infraestructura heterogénea sin recompilación específica por vendor.

Este build concreto emplea pesos en BF16 (safetensors) y se sirve mediante un contenedor Docker con vLLM 0.24.0 sobre el stack DTK 26.04 de Hygon. La relevancia actual del modelo radica en su puntuación de 93,68 en Real5-OmniDocBench y en la aceleración DSpark, que mejora la eficiencia de procesamiento extremo a extremo en un 55% según la documentación del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo especializado OCR/document parsing, tipo minicpm_ocr) |
| Parámetros totales | 1.300.434.160 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (única variante publicada en este repo) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El tag `minicpm_ocr` sugiere un modelo multimodal con encoder visual y decoder de lenguaje, orientado a tareas de parsing documental. El tamaño de 1.300 millones de parámetros lo sitúa en la categoría de modelos ligeros, optimizados para despliegue en producción con latencia baja.

El entrenamiento incluye una fase de RL (los pesos del contenedor referencian `merge_rl_mergedp1_7140_hf5_4x`, lo que indica fusión de checkpoints tras entrenamiento con refuerzo). La documentación menciona DSpark como mecanismo de decodificación acelerada que mejora la eficiencia extremo a extremo un 55%. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset. El modelo se distribuye con soporte para decodificación gráfica completa (`OCR_FULL_DECODE_GRAPH=1`) y atención FA2 con longitud variable (`OCR_VISION_VARLEN_FA2=1`), lo que indica optimizaciones específicas para inferencia de alto rendimiento.

## Capacidades

- Parsing de documentos escaneados y fotografías, incluyendo páginas curvadas y capturas de pantalla re-fotografiadas.
- Reconocimiento de texto en chino e inglés.
- Extracción de fórmulas matemáticas y tablas complejas.
- Extracción de información clave (key information extraction) de documentos estructurados.
- Evaluación de calidad de parsing: el modelo hermano MiniCPM-OCR Jev (2B) actúa como inspector de calidad puntuando la fiabilidad de resultados OCR de otros modelos.
- Inferencia acelerada mediante DSpark decoding.
- Soporte multi-hardware a través del stack FlagOS (12 plataformas).
- No se documenta soporte de tool calling, function calling ni capacidades de agente multi-paso en la información disponible.

## Casos de uso

- Digitalización masiva de archivos administrativos: el modelo procesa escaneos con deformaciones geométricas (páginas curvadas, encuadernaciones) que los OCR tradicionales no manejan bien, extrayendo texto y tablas para su indexación posterior.
- Procesamiento de facturas y albaranes: extracción de información clave (importes, fechas, proveedores) de documentos comerciales fotografiados con móvil, aprovechando la tolerancia a re-fotografiado de pantallas y papeles.
- Conversión de documentación técnica con fórmulas: parsing de papers y manuales que contienen ecuaciones y tablas complejas, generando salida estructurada apta para Markdown o LaTeX.
- Control de calidad en pipelines OCR existentes: combinado con MiniCPM-OCR Jev como inspector, se puede puntuar la fiabilidad de cada página parseada y derivar a revisión humana solo los casos con baja confianza (AUROC 0,936 en JevOCRBench).
- Despliegue en infraestructura Hygon: organizaciones con servidores Hygon pueden usar el contenedor FlagOS-Hygon para servir el modelo con vLLM sin depender de GPUs NVIDIA, manteniendo el 98,6% de la precisión del build nativo (79,4 vs 80,5 en OcrBench).
- Procesamiento en edge con ARM: aunque este repo es para Hygon, el ecosistema FlagOS permite el mismo modelo en dispositivos ARM, útil para digitalización en campo o entornos sin conectividad.
- Extracción de datos de formularios y encuestas escaneadas: el modelo puede estructurar campos rellenados a mano o impresos en documentos con maquetación variable.

## Benchmarks y rendimiento

| Métrica | MiniCPM-OCR-1.0-Nvidia-Origin | MiniCPM-OCR-1.0-Hygon-FlagOS |
|---|---|---|
| OcrBench | 80,5 | 79,4 |
| omni_doc_bench_v1_6 | 96,4585 | 96,42094 |

Datos adicionales de la documentación del autor: Real5-OmniDocBench 93,68 (modelo base 1.3B); mejora de eficiencia extremo a extremo del 55% con DSpark decoding. El build FlagOS de MiniCPM-OCR Jev alcanza el 98,7% del throughput nativo de NVIDIA, y en ARM edge completa una evaluación de bloque de página en 1,20 s usando solo CPU M5.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 2,6 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 8 GB de VRAM para uso cómodo.
- GPU recomendadas: el build de este repo está optimizado para Hygon (DTK 26.04), con soporte documentado también para NVIDIA, Huawei Ascend, KUNLUNXIN, MetaX, Moore Threads, Tsingmicro, Iluvatar CoreX, Xiwang, CIX y Mac ARM vía FlagOS.
- Cabe en GPU consumer: por tamaño (1.3B), sí cabría en GPUs consumer con suficiente VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090), aunque este build concreto está empaquetado para Hygon.
- Opciones de despliegue: vLLM 0.24.0 (usado en el contenedor oficial), con plugins específicos (`ocr_reference`, `ocr_graph`, `ocr_full_graph`, `ocr_vision_fa2`, `ocr_encoder_graph`). No se documenta soporte de llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles para este build; la documentación menciona 1,20 s por bloque de página en ARM edge (modelo Jev 2B) y 1,69× throughput P50 nativo por unidad de cómputo pico en el build FlagOS de OCR 1.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | OcrBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 (este) | 1,3B | no disponible | 79,4 (Hygon) / 80,5 (NVIDIA) | Apache 2.0 | Hugging Face, ModelScope, contenedor Docker |
| MiniCPM-OCR Jev | 2B | no disponible | no disponible (AUROC 0,936 en JevOCRBench) | no disponible | FlagOS |
| Qwen3.5-397B-A17B | 397B (17B activos) | no disponible | no disponible (AUROC 0,938 en JevOCRBench) | no disponible | no disponible |

La comparativa se limita a los modelos mencionados en la documentación del autor. No se dispone de datos de benchmarks de otros modelos OCR especializados (como Donut, Nougat o GOT-OCR) en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; no se documenta soporte de otros idiomas, lo que restringe su uso en entornos multilingües.
- Longitud de contexto no especificada; documentos muy extensos podrían requerir segmentación previa.
- El build de este repositorio está acoplado a hardware Hygon y al stack DTK 26.04; no es portable directamente a otras plataformas sin usar el build correspondiente de FlagOS.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los pesos originales de ModelBest/OpenBMB, ya que este repo es una redistribución de FlagOS.
- Riesgo de alucinación inherente a modelos generativos: en extracción de información clave, puede producir campos plausibles pero incorrectos; se recomienda validación con MiniCPM-OCR Jev o revisión humana en dominios críticos.
- Solo 8 descargas y 0 likes en el momento de la consulta: ecosistema pequeño, poca validación comunitaria independiente.
- No se documentan sesgos específicos, pero al estar entrenado principalmente en zh/en, el rendimiento en documentos con caracteres latinos extendidos o alfabetos no latinos es incierto.
- El contenedor Docker requiere montajes de volúmenes y variables de entorno específicas (`HIP_VISIBLE_DEVICES`, `FLAGGEMS_VENDOR=hygon`, plugins de vLLM); un despliegue incorrecto puede degradar el rendimiento o fallar silenciosamente.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/MiniCPM-OCR-1.0-BF16-hygon-FlagOS
- ModelScope (descarga de pesos): `modelscope download --model FlagRelease/MiniCPM-OCR-1.0-hygon-FlagOS`
- Contenedor Docker FlagOS-Hygon: `harbor.baai.ac.cn/flagrelease-public/minicpm-ocr-hygon001-gems0.0-tree0.6.2-cxnone-plugin0.0.0-vllm0.24.0-sglangnone-sglangflnone-cp310-pt210-dtk2604-x64-6.3.30-v1.4.1a:202610261850`
- Repositorio FlagOS: no disponible en la información proporcionada
- Paper de MiniCPM-OCR: no disponible en la información proporcionada
- Blog de ModelBest/OpenBMB sobre MiniCPM-OCR: no disponible en la información proporcionada
