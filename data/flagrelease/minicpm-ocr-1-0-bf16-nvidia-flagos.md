# FlagRelease/MiniCPM-OCR-1.0-BF16-nvidia-FlagOS

## Resumen

MiniCPM-OCR 1.0 es un modelo especializado en reconocimiento óptico de caracteres (OCR) y parseo de documentos desarrollado por ModelBest en colaboración con OpenBMB. Con 1.300 millones de parámetros, está diseñado para escenarios reales de digitalización documental: escaneos, fotografías, páginas curvadas y pantallas re-fotografiadas, con soporte para texto, fórmulas y tablas complejas, además de extracción de información clave. Forma parte de la serie MiniCPM-OCR, que incluye también el modelo Jev (2B), orientado a la verificación de calidad del parseo.

La ficha corresponde a la distribución `FlagRelease/MiniCPM-OCR-1.0-BF16-nvidia-FlagOS`, una build del modelo original adaptada por la comunidad FlagOS al stack de software multi-chip, con soporte para 12 plataformas (NVIDIA, Huawei Ascend, Hygon, KUNLUNXIN, MetaX, Moore Threads, entre otras). Esta variante concreta está empaquetada en BF16 para despliegue sobre NVIDIA mediante vLLM 0.24.0 en un contenedor Docker preconfigurado.

El modelo es relevante por su relación entre tamaño y rendimiento: con solo 1.3B de parámetros alcanza 93,68 en Real5-OmniDocBench según la model card, y con la aceleración de decodificación DSpark mejora su eficiencia de extremo a extremo un 55%. Su licencia Apache 2.0 y su reducido tamaño lo hacen apto para despliegues en producción con requisitos moderados de hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal para OCR y parseo de documentos; tipo `minicpm_ocr`) |
| Parámetros totales | 1.300.434.160 (1,3B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (según `--max-model-len` del script de despliegue) |
| Tipos de cuantización | BF16 (build publicada); no se detallan otras cuantizaciones |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 2,6 GB |
| Pipeline de Hugging Face | no disponible |
| Fecha de creación | 26 de octubre de 2026 |
| Última actualización | 28 de octubre de 2026 |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo (tipo de transformer, composición del dataset de entrenamiento, número de tokens, ni si se aplicaron técnicas de RLHF o DPO). El tag `minicpm_ocr` y la naturaleza de la tarea indican que se trata de un modelo multimodal capaz de procesar imágenes de documentos y generar texto estructurado, con soporte para múltiples imágenes por prompt (hasta 4 imágenes y 1 vídeo según la configuración de vLLM).

La innovación técnica destacable que sí se documenta es la decodificación DSpark, una aceleración de decodificación que, según la model card, mejora la eficiencia de procesamiento de extremo a extremo un 55%. Además, la build FlagOS incorpora una pila de software multi-chip que permite ejecutar el modelo sobre 12 plataformas distintas, con una capa de plugins (`VLLM_PLUGINS=fl`, `VLLM_FL_USE_FLAGGEMS_VLLM=1`) que adapta vLLM al stack FlagOS.

## Capacidades

- Reconocimiento de texto en imágenes de documentos: escaneos, fotografías, páginas curvadas y pantallas re-fotografiadas.
- Parseo de fórmulas matemáticas presentes en documentos.
- Parseo de tablas complejas y extracción de su estructura.
- Extracción de información clave (key information extraction) de documentos.
- Procesamiento multimodal con soporte de hasta 4 imágenes y 1 vídeo por prompt (según configuración de despliegue).
- Soporte de contexto largo de hasta 262.144 tokens, adecuado para documentos extensos o múltiples páginas.
- Capacidades multilingües limitadas a chino e inglés.
- Servido mediante API compatible con OpenAI (`/v1/chat/completions`).
- Soporte de prefix caching para acelerar peticiones repetidas.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso con agentes.

## Casos de uso

- Digitalización masiva de archivos escaneados: el modelo procesa imágenes de páginas con contexto de hasta 262.144 tokens, lo que permite encadenar documentos extensos y extraer texto estructurado sin fragmentación manual.
- Extracción de datos de facturas y formularios: la capacidad de key information extraction permite identificar campos clave (importes, fechas, emisores) directamente desde la imagen, reduciendo el preprocesamiento.
- Parseo de tablas financieras o técnicas: convierte tablas complejas de PDFs e imágenes en estructuras legibles por máquina, útil en pipelines de análisis de datos.
- Reconocimiento de fórmulas en documentación científica: extrae expresiones matemáticas de artículos y apuntes para su reutilización en LaTeX o sistemas de gestión documental.
- Procesamiento de fotografías de móvil en campo: al soportar páginas curvadas y pantallas re-fotografiadas, es adecuado para aplicaciones móviles de captura de documentos en entornos no controlados.
- Integración en pipelines de calidad documental: combinado con MiniCPM-OCR Jev como inspector de calidad, permite marcar automáticamente los resultados de parseo que requieren revisión humana.
- Despliegue en infraestructura heterogénea: gracias al stack FlagOS multi-chip, puede ejecutarse en servidores NVIDIA, Ascend, Hygon u otras plataformas, lo que facilita su adopción en entornos con hardware diverso.
- Servicio OCR como API interna: el despliegue con vLLM expone un endpoint compatible con OpenAI, lo que permite integrarlo en aplicaciones existentes sin cambiar el cliente.

## Benchmarks y rendimiento

Resultados publicados en la model card para la build FlagOS frente a la build nativa de NVIDIA:

| Métrica | MiniCPM-OCR-1.0-Nvidia-Origin | MiniCPM-OCR-1.0-Nvidia-FlagOS |
|---|---|---|
| OcrBench | 80,5 | 79,5 |
| omni_doc_bench_v1_6 | 96,4585 | 96,4577 |

Datos adicionales de la model card:

| Métrica | Valor |
|---|---|
| Real5-OmniDocBench (modelo 1.3B) | 93,68 |
| Mejora de eficiencia con DSpark decoding | 55% |
| Throughput nativo P50 por unidad de cómputo pico (FlagOS vs. nativo) | hasta 1,69× |

No se han publicado en la información disponible resultados de benchmarks estándar de texto como MMLU, HumanEval o GSM8K, lo que es coherente con la naturaleza especializada del modelo en OCR.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,6 GB en BF16, por lo que se estima un consumo de VRAM en torno a 3-5 GB para los pesos, más el overhead de vLLM (KV cache, activaciones). La configuración de referencia usa `--gpu-memory-utilization 0.55`.
- GPU recomendadas: la build FlagOS está validada sobre NVIDIA con CUDA 12.9 y driver 580.105.08; el script de ejemplo reserva 8 dispositivos (`/dev/nvidia0` a `/dev/nvidia7`), lo que sugiere despliegues multi-GPU en servidor, aunque el tamaño del modelo permite ejecución en una sola GPU.
- Cabe en GPU consumer: sí, por tamaño (1,3B en BF16), aunque no se documenta explícitamente compatibilidad con RTX 4090 u otras consumer en la información disponible.
- Opciones de despliegue: vLLM 0.24.0 con plugins FlagOS (configuración documentada); el formato safetensors permite otros runners, pero no se detallan en la información disponible.
- Latencia y throughput: no se publican cifras absolutas de latencia o tokens por segundo. La model card indica que la build FlagOS de Jev alcanza el 98,7% del throughput nativo de NVIDIA, y que OCR 1.0 logra hasta 1,69× el throughput nativo P50 por unidad de cómputo pico.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 | 1,3B | 262.144 tokens | OCR y parseo documental | Apache 2.0 | Hugging Face (build FlagOS) |
| MiniCPM-OCR Jev | 2B | no disponible | Inspección de calidad de parseo OCR | no disponible en la información | Hugging Face (según model card) |
| Qwen3.5-397B-A17B | 397B (17B activos) | no disponible | Modelo generalista multimodal | no disponible en la información | Referenciado en la model card |

La model card compara Jev (2B) con Qwen3.5-397B-A17B en la tarea de verificación de calidad (AUROC 0,936 frente a 0,938 en JevOCRBench), lo que ilustra la eficiencia de la familia MiniCPM-OCR frente a modelos generalistas mucho mayores en tareas especializadas. No se dispone de comparativas directas de OCR 1.0 con otros modelos OCR especializados en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados: solo se declara soporte de chino e inglés; el rendimiento en otros idiomas no está documentado.
- Sesgos conocidos: no se documentan en la información disponible; como todo modelo entrenado con datos web y documentales, puede heredar sesgos de esos corpus.
- Riesgo de alucinación: en tareas de extracción de información clave, el modelo podría generar campos o valores no presentes en la imagen; se recomienda validación posterior, especialmente en documentos críticos. La propia familia incluye Jev precisamente para mitigar este problema.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se documentan restricciones adicionales.
- Dependencia del stack FlagOS: esta build concreta requiere el contenedor y los plugins FlagOS para su despliegue documentado; usarla fuera de ese entorno puede requerir adaptaciones no cubiertas.
- Contexto y multimodalidad: aunque el contexto es de 262.144 tokens, la configuración de referencia limita a 4 imágenes y 1 vídeo por prompt, lo que condiciona el procesamiento de documentos muy extensos en una sola petición.
- Build reciente y poco validada por la comunidad: 8 descargas y 0 likes en el momento de la ficha; conviene validar el rendimiento en el caso de uso concreto antes de producción.
- Sin datos de benchmarks generalistas: no hay resultados de MMLU, HumanEval u otros, por lo que no debe evaluarse como modelo de propósito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FlagRelease/MiniCPM-OCR-1.0-nvidia-FlagOS
- Imagen Docker FlagOS: `harbor.baai.ac.cn/flagrelease-public/minicpm-ocr-nvidia003-gems0.0-tree0.7.0-cxnone-plugin0.0.0-vllm0.24.0-cp312-pt211-cu129-x64-580.105.08:202610270926`
- Descarga de pesos vía ModelScope: `modelscope download --model FlagRelease/MiniCPM-OCR-1.0-nvidia-FlagOS --local_dir /data/MiniCPM-OCR-1.0`
- Organización ModelBest: no disponible en la información proporcionada
- Organización OpenBMB: no disponible en la información proporcionada
- Paper o blog técnico de MiniCPM-OCR: no disponible en la información proporcionada
