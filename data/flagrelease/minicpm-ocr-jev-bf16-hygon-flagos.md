# FlagRelease/MiniCPM-OCR-Jev-BF16-hygon-FlagOS

## Resumen

MiniCPM-OCR Jev es un modelo de clasificación de secuencias de 2.213.245.760 parámetros (aproximadamente 2B) desarrollado por ModelBest en colaboración con OpenBMB. Forma parte de la serie MiniCPM-OCR, orientada al parseo de documentos y reconocimiento de texto, y su función específica es actuar como "inspector de calidad" de documentos: evalúa la fiabilidad de los resultados de parseo producidos por otros modelos OCR y señala el contenido que requiere revisión humana. Esta build concreta, publicada por FlagRelease, es una adaptación para el stack FlagOS sobre hardware Hygon (DCU), con pesos en BF16.

El modelo se apoya en la arquitectura Qwen3.5 (tag `qwen3_5` en Hugging Face) y se distribuye como un checkpoint de clasificación (`Qwen3_5ForSequenceClassification`), no como un modelo generativo. Su relevancia actual radica en que aborda un problema práctico del pipeline documental: el output de un OCR todavía necesita verificación manual, y Jev automatiza esa priorización con una puntuación de fiabilidad. Según la model card, alcanza un AUROC global de 0,936 en JevOCRBench, prácticamente a la par del 0,938 de Qwen3.5-397B-A17B, un modelo mucho mayor.

La build FlagOS-Hygon está pensada para despliegue en servidores multi-chip y terminales ARM, y la documentación reporta que alcanza el 98,7 % del throughput nativo de NVIDIA en la misma plataforma. En dispositivos edge ARM, Jev completa una evaluación de bloque de página en 1,20 segundos de media usando solo la CPU M5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (clase `Qwen3_5ForSequenceClassification`) |
| Parametros totales | 2.213.245.760 (~2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados en BF16); otras cuantizaciones no disponibles |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 4,4 GB |
| Pipeline | no disponible |
| Fecha de creacion | 2026-10-26 |
| Ultima actualizacion | 2026-10-28 |

## Arquitectura y entrenamiento

Jev se construye sobre la arquitectura Qwen3.5 en su variante de clasificación de secuencias, con 2.213.245.760 parámetros. El checkpoint publicado corresponde a un entrenamiento de tipo `triple_value` (según la ruta interna `qwen35_2b_l2_triple_value_checkpoint-3000`), lo que sugiere un ajuste orientado a producir una puntuación de fiabilidad en lugar de texto libre. El modelo procesa entradas multimodales (imágenes vía `AutoProcessor` junto con el texto asociado) y emite una probabilidad de calidad del parseo.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card menciona que la serie MiniCPM-OCR 1.0 emplea decodificación acelerada DSpark, pero no se especifica si Jev incorpora esa técnica. La build de FlagOS se apoya en el stack FlagTree, FlagGems y torch_fl para ejecutar sobre Hygon DCU, con validación de consistencia frente al stack nativo de NVIDIA.

## Capacidades

- Evaluación de fiabilidad de parseo OCR: asigna una puntuación (probabilidad) a la calidad de un resultado de OCR sobre un bloque de documento.
- Integración con distintos motores OCR: puede conectarse a diferentes modelos OCR para priorizar contenido que requiere revisión humana.
- Procesamiento multimodal: acepta imágenes de documento junto con su representación textual mediante `AutoProcessor`.
- Clasificación de secuencias: salida orientada a scoring, no a generación de texto.
- Soporte multilingüe limitado a chino e inglés.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Control de calidad en pipelines de digitalización: Jev puntúa cada bloque de página parseado por un OCR y marca los que caen por debajo de un umbral para revisión humana, reduciendo el volumen de verificación manual.
- Auditoría de extracción de tablas y fórmulas: en documentos con tablas complejas o fórmulas, el modelo permite detectar salidas poco fiables antes de que lleguen a sistemas downstream.
- Procesamiento de escaneos y fotos de documentos: adecuado para escenarios reales (páginas curvadas, re-fotografías de pantallas) donde la calidad del OCR es variable y se necesita una señal de confianza.
- Despliegue en edge ARM: con 1,20 s por bloque de página en CPU M5, puede ejecutarse en terminales sin GPU para inspección local de documentos.
- Integración en servidores multi-chip: la build FlagOS-Hygon permite desplegar el inspector de calidad en infraestructura Hygon con rendimiento cercano al nativo NVIDIA (98,7 % del throughput).
- Enrutado selectivo a revisión humana: combinado con un OCR base, Jev permite construir un flujo donde solo los documentos con baja puntuación se derivan a operadores, optimizando costes de back-office.
- Validación de pipelines OCR en producción: sirve como métrica automática de calidad para detectar regresiones tras cambios en el motor OCR o en el preprocesado de imágenes.

## Benchmarks y rendimiento

| Metrica | MiniCPM-OCR-Jev-Nvidia-Origin | MiniCPM-OCR-Jev-Hygon-FlagOS |
|---|---|---|
| ocr_rm_mini (12 entradas) avg_prob_1 | 0,4817 | 0,482944 |
| omnidocbench-render-compare (60 entradas) avg_prob_1 | 0,2397 | 0,241291 |

Según la model card, el AUROC global en JevOCRBench es de 0,936, frente a 0,938 de Qwen3.5-397B-A17B. En cuanto a rendimiento de la build FlagOS, se reporta un 98,7 % del throughput nativo de NVIDIA, y en ARM edge (CPU M5) un tiempo medio de 1,20 s por bloque de página. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar de razonamiento o código.

## Requisitos de hardware

- VRAM estimada: con 2,21B parámetros en BF16, los pesos ocupan aproximadamente 4,4 GB; el pico de memoria en inferencia depende del tamaño de imagen y de la longitud de secuencia, no especificados.
- GPU recomendadas: la build documentada está validada sobre Hygon DCU (stack FlagOS con DTK 2604); también se referencia ejecución en CPU ARM (M5) y comparación con NVIDIA nativa.
- Cabe en GPU de consumo: sí, en principio, dado el tamaño de pesos en BF16 (~4,4 GB); no se documentan requisitos específicos para RTX 4090 u otras consumer.
- Opciones de despliegue: contenedor Docker FlagOS-Hygon (`harbor.baai.ac.cn/flagrelease-public/...:jev-ocr-rm-2b`), script de invocación con `torch_fl` + `transformers` (device `flagos:0`), y descarga de pesos vía ModelScope. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia: 1,20 s por bloque de página en CPU M5 (ARM edge). Throughput en Hygon: 98,7 % del nativo NVIDIA. No se dispone de más cifras de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AUROC (JevOCRBench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR Jev (esta build) | ~2B | no disponible | 0,936 | Apache 2.0 | Hugging Face / ModelScope |
| Qwen3.5-397B-A17B | 397B (17B activos) | no disponible | 0,938 | no disponible en la informacion | no disponible en la informacion |
| MiniCPM-OCR 1.0 | 1,3B | no disponible | no disponible | no disponible en la informacion | Hugging Face (serie MiniCPM-OCR) |

Jev ofrece un AUROC prácticamente idéntico al de Qwen3.5-397B-A17B con dos órdenes de magnitud menos de parámetros, lo que lo hace mucho más viable para despliegue en producción. Frente a MiniCPM-OCR 1.0, la diferencia es funcional: 1.0 es el modelo de parseo y Jev es el inspector de calidad. No se dispone de datos de benchmarks comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; no se documenta soporte de castellano ni de otras lenguas.
- Es un modelo de scoring, no generativo: no produce texto OCR, solo una puntuación de fiabilidad.
- Riesgo de alucinación no aplicable en el sentido habitual, pero la puntuación puede ser poco fiable fuera de la distribución de entrenamiento (tipos de documento no vistos).
- No se documentan sesgos conocidos; al entrenarse sobre documentos en zh/en, podría infravalorar la calidad en documentos de otros idiomas o alfabetos.
- La build está específicamente adaptada a Hygon DCU con el stack FlagOS; su uso en otras plataformas requiere los pesos nativos o adaptaciones adicionales.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los componentes del stack FlagOS (contenedor Docker, DTK) que no son necesariamente Apache 2.0.
- No se dispone de información sobre longitud de contexto máxima, lo que limita la planificación de despliegue en documentos de gran tamaño.
- El repositorio tiene muy pocas descargas (10) y ningún like, lo que sugiere poca validación comunitaria de esta build concreta.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/MiniCPM-OCR-Jev-BF16-hygon-FlagOS
- ModelScope (descarga de pesos): `modelscope download --model FlagRelease/MiniCPM-OCR-Jev-BF16-hygon-FlagOS`
- Contenedor Docker FlagOS-Hygon: `harbor.baai.ac.cn/flagrelease-public/qwen-image-2.1-hygon001-gems5.4.0-tree0.6.0-cxnone-pluginnone-vllmnone-sglangnone-sglangflnone-cp310-pt210-dtk2604-x64-6.3.30-v1.4.1a:jev-ocr-rm-2b`
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
