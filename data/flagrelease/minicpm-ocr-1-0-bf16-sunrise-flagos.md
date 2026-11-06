# FlagRelease/MiniCPM-OCR-1.0-BF16-sunrise-FlagOS

## Resumen

MiniCPM-OCR 1.0 es un modelo especializado en análisis de documentos y reconocimiento de texto (OCR) desarrollado por ModelBest en colaboración con OpenBMB. Con 1.300 millones de parámetros, está diseñado específicamente para escenarios documentales reales: escaneos, fotografías, páginas curvadas y pantallas re-fotografiadas, con soporte para extracción de texto, fórmulas y tablas complejas, así como extracción de información clave.

La versión publicada en este repositorio es una adaptación de FlagRelease bajo el stack FlagOS-Sunrise, que proporciona compatibilidad cross-chip con 12 plataformas de hardware distintas (T-Head, NVIDIA, Huawei Ascend, Hygon, KUNLUNXIN, MetaX, Moore Threads, Tsingmicro, Iluvatar CoreX, Xiwang, Mac ARM y CIX). Esta variante concreta está empaquetada en formato BF16 con safetensors y se distribuye con una imagen de contenedor Docker preconfigurada para despliegue mediante vLLM.

El modelo resulta relevante porque ofrece un rendimiento competitivo en tareas de parsing documental con un tamaño reducido (1.3B), lo que lo hace desplegable en entornos con recursos limitados, incluidos dispositivos ARM de borde. Según la model card, alcanza 93,68 en Real5-OmniDocBench y, con la aceleración de decodificación DSpark, mejora la eficiencia de procesamiento extremo a extremo en un 55%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo especializado en OCR/parsing documental, tipo `minicpm_ocr`) |
| Parametros totales | 1.300.434.160 (1,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (configurado en `--max-model-len` del script de despliegue) |
| Tipos de cuantizacion | BF16 (esta variante); no se detallan otras cuantizaciones |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 2,6 GB |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de la etiqueta `minicpm_ocr` y su naturaleza especializada en parsing documental. Se trata de un modelo de 1,3B parámetros orientado a visión-lenguaje para documentos, con capacidad de procesar imágenes (el despliegue limita a una imagen por prompt mediante `--limit-mm-per-prompt '{"image":1}'`). No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica destacable es la integración con FlagOS-Sunrise, un stack de software multi-chip que permite ejecutar el modelo sobre 12 plataformas de hardware distintas con adaptación Day-0. Además, el modelo incorpora la aceleración de decodificación DSpark, que según la model card mejora la eficiencia de procesamiento extremo a extremo en un 55%. En la evaluación comparativa entre el stack nativo de NVIDIA y el stack FlagOS, el modelo mantiene un rendimiento muy cercano: 80,5 frente a 78,9 en OcrBench y 96,4585 frente a 96,2849 en omni_doc_bench_v1_6.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre escaneos, fotografías, páginas curvadas y pantallas re-fotografiadas.
- Parsing de texto estructurado en documentos.
- Extracción y reconocimiento de fórmulas matemáticas.
- Parsing de tablas complejas.
- Extracción de información clave (key information extraction) de documentos.
- Procesamiento de imágenes como entrada (visión-lenguaje), limitado a una imagen por prompt en la configuración de despliegue proporcionada.
- Soporte multilingüe limitado a chino e inglés.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento (thinking mode).

## Casos de uso

- Digitalización de archivos históricos y administrativos: el modelo puede procesar escaneos y fotografías de documentos con páginas curvadas, extrayendo texto, tablas y fórmulas en una sola pasada, lo que resulta adecuado para proyectos de digitalización masiva con recursos de cómputo limitados.
- Extracción de datos de facturas y formularios: gracias a su capacidad de key information extraction, puede identificar campos clave en documentos comerciales escaneados, integrándose en pipelines de contabilidad o gestión documental.
- Procesamiento de documentación técnica y científica: el soporte de fórmulas matemáticas y tablas complejas lo hace útil para convertir papers y manuales técnicos en texto estructurado y reutilizable.
- Inspección de calidad documental en producción: combinado con el modelo complementario MiniCPM-OCR Jev (2B), que actúa como "inspector de calidad" puntuando la fiabilidad del parsing, permite construir flujos con verificación automática y marcado de contenido que requiere revisión humana.
- Despliegue en dispositivos de borde (edge): su tamaño de 1,3B y el soporte de FlagOS para ARM permiten ejecutarlo en terminales Mac (ARM) y otros dispositivos de borde, habilitando OCR local sin dependencia de la nube.
- Procesamiento de capturas de pantalla re-fotografiadas: el modelo está entrenado específicamente para pantallas re-fotografiadas, lo que lo hace adecuado para extraer información de fotos de móviles tomadas a monitores o displays.
- Servicio de OCR como API: mediante el servidor OpenAI-compatible de vLLM incluido en la imagen Docker, puede desplegarse como servicio HTTP en infraestructura multi-chip (NVIDIA, Ascend, Hygon, etc.) para atender solicitudes de parsing documental.

## Benchmarks y rendimiento

Resultados publicados en la model card comparando el stack nativo de NVIDIA con el stack FlagOS-Sunrise:

| Metrica | MiniCPM-OCR-1.0-Nvidia-Origin | MiniCPM-OCR-1.0-Sunrise-FlagOS |
|---|---|---|
| OcrBench | 80,5 | 78,9 |
| omni_doc_bench_v1_6 | 96,4585 | 96,2849 |

Datos adicionales mencionados en la model card:
- Real5-OmniDocBench: 93,68 (modelo de 1,3B).
- Mejora de eficiencia extremo a extremo con decodificación DSpark: 55%.
- En el modelo complementario Jev (2B), AUROC de 0,936 en JevOCRBench, frente a 0,938 de Qwen3.5-397B-A17B.
- En dispositivos ARM de borde, Jev completa una evaluación de bloque de página en 1,20 segundos de media usando solo la CPU M5.
- El build FlagOS de Jev alcanza el 98,7% del throughput de cómputo nativo de NVIDIA; en la misma plataforma, OCR 1.0 logra hasta 1,69× el throughput nativo P50 por unidad de cómputo pico.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 2,6-3 GB para los pesos, más overhead de activaciones y caché KV; el script de despliegue usa `--gpu-memory-utilization 0.85`.
- GPU recomendadas: el stack FlagOS soporta T-Head, NVIDIA, Huawei Ascend, Hygon, KUNLUNXIN, MetaX, Moore Threads, Tsingmicro, Iluvatar CoreX, Xiwang, Mac (ARM) y CIX. En el ejemplo de despliegue se usa un dispositivo `ptpu` (T-Head) con `TANG_VISIBLE_DEVICES=2`.
- Cabe en GPU de consumo: sí, por su tamaño de 1,3B; cualquier GPU con al menos 4-6 GB de VRAM debería poder ejecutarlo en BF16 (no se especifica una lista concreta de GPUs de consumo validadas).
- Opciones de despliegue: vLLM (usado en la imagen FlagOS-Sunrise proporcionada, versión 0.24.0), con servidor OpenAI-compatible. No se documentan en la información disponible opciones como llama.cpp, Ollama o TGI.
- Latencia y throughput: en ARM de borde, el modelo complementario Jev completa una evaluación de bloque de página en 1,20 s con CPU M5; para OCR 1.0 no se proporcionan cifras de latencia absolutas, solo la mejora del 55% con DSpark y el 1,69× de throughput por unidad de cómputo pico en FlagOS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documental | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 | 1,3B | 40.960 tokens (config. despliegue) | Real5-OmniDocBench 93,68; OcrBench 80,5 (NVIDIA) | Apache 2.0 | Hugging Face (FlagRelease) |
| MiniCPM-OCR Jev | 2B | no disponible | AUROC 0,936 en JevOCRBench | no disponible en la informacion | Mencionado en la model card |
| Qwen3.5-397B-A17B | 397B totales (17B activos) | no disponible | AUROC 0,938 en JevOCRBench | no disponible en la informacion | Mencionado como referencia |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de otros modelos OCR comparables (como PaddleOCR, Donut o GOT-OCR) en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- No se documentan evaluaciones de sesgo; al ser un modelo entrenado sobre datos documentales, puede heredar sesgos presentes en dichos datos.
- Riesgo de alucinación inherente a los modelos generativos: en tareas de OCR y parsing puede producir texto o estructuras que no correspondan fielmente al documento original, especialmente en documentos degradados o de baja calidad.
- La configuración de despliegue proporcionada limita a una imagen por prompt (`--limit-mm-per-prompt '{"image":1}'`), lo que restringe el procesamiento por lotes de imágenes en una sola petición.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base original de ModelBest/OpenBMB y de los pesos distribuidos por FlagRelease.
- El rendimiento en el stack FlagOS es ligeramente inferior al nativo de NVIDIA (78,9 frente a 80,5 en OcrBench), por lo que en producción sobre hardware no-NVIDIA debe validarse la precisión.
- El repositorio tiene muy pocas descargas (8) y ningún "like", lo que sugiere una adopción aún limitada y escasa validación por parte de la comunidad.
- No se documentan en la información disponible los detalles de arquitectura, datos de entrenamiento ni el proceso de alineación, lo que dificulta evaluar su robustez en dominios específicos.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/MiniCPM-OCR-1.0-BF16-sunrise-FlagOS
- Imagen Docker FlagOS-Sunrise: `harbor.baai.ac.cn/flagrelease-public/minicpm-ocr-sunrise001-gems0.0-tree0.6.0-cxnone-plugin0.0.0-vllm0.24.0-sglangnone-sglangflnone-cp310-ptpu0.2.3-tang0.25.0-x64-0.25.0:202610261838`
- Descarga de pesos vía ModelScope: `modelscope download --model FlagRelease/MiniCPM-OCR-1.0-sunrise-FlagOS --local_dir /data/MiniCPM-OCR-1.0`
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
