# FlagRelease/MiniCPM-OCR-1.0-BF16-iluvatar-FlagOS

## Resumen

MiniCPM-OCR 1.0 es un modelo de 1.300 millones de parámetros desarrollado por ModelBest junto con OpenBMB, especializado en parsing de documentos y reconocimiento de texto (OCR). Forma parte de la serie MiniCPM-OCR, que incluye también el modelo MiniCPM-OCR Jev (2B), orientado a la validación de calidad de resultados de OCR. El modelo base está publicado bajo licencia Apache 2.0 y soporta chino e inglés.

La versión aquí descrita, `FlagRelease/MiniCPM-OCR-1.0-BF16-iluvatar-FlagOS`, es una adaptación del modelo original realizada por la comunidad FlagOS para su ejecución sobre hardware Iluvatar CoreX mediante la pila de software FlagOS (FlagGems, vLLM-plugin-FL y el backend corex). El objetivo de esta release es ofrecer despliegue Day-0 en plataformas no NVIDIA con pesos en BF16 y scripts de inferencia preconfigurados.

El modelo aborda escenarios documentales reales (escaneos, fotografías, páginas curvadas, pantallas re-fotografiadas) con soporte de texto, fórmulas y tablas complejas, además de extracción de información clave. Según la model card, alcanza 93,68 en Real5-OmniDocBench y, con la aceleración de decodificación DSpark, mejora un 55 % la eficiencia de procesamiento extremo a extremo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de parsing documental, tipo `minicpm_ocr`) |
| Parametros totales | 1.300.434.160 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (configurado en el script de servicio vLLM mediante `--max-model-len`) |
| Tipos de cuantizacion | BF16 (pesos publicados); no se documentan otras cuantizaciones en esta release |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna del modelo (composición del encoder visual, del decoder lingüístico ni el número de capas o dimensiones ocultas). La model card lo describe como un modelo multimodal de OCR y parsing documental de 1.3B parámetros, con soporte de entrada de imagen (hasta 4 imágenes por prompt y 1 vídeo, según la configuración de vLLM) y salida en Markdown.

Tampoco se especifican el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card sí menciona una innovación destacable: la decodificación acelerada DSpark, que según el autor mejora la eficiencia de procesamiento extremo a extremo en un 55 %. La release de FlagOS añade además adaptación a 12 plataformas de cómputo (T-Head, NVIDIA, Huawei Ascend, Hygon, KUNLUNXIN, MetaX, Moore Threads, Tsingmicro, Iluvatar CoreX, Xiwang, Mac ARM y CIX) mediante una pila unificada de software multi-chip.

## Capacidades

- Parsing de documentos a Markdown: conversión de páginas escaneadas o fotografiadas en texto estructurado.
- Reconocimiento de texto (OCR) en escenarios reales: escaneos, fotografías, páginas curvadas y pantallas re-fotografiadas.
- Parsing de fórmulas matemáticas.
- Parsing de tablas complejas.
- Extracción de información clave de documentos.
- Procesamiento multimodal de imágenes (hasta 4 por prompt en la configuración de servicio) y de vídeo (1 por prompt).
- Soporte de conversaciones multi-turno vía API compatible con OpenAI (`/v1/chat/completions`).
- Integración con clientes de terceros como AnythingLLM.
- Capacidades de agente y tool calling: no disponible en la información proporcionada.
- Modo de razonamiento (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Digitalización masiva de archivos: el modelo convierte lotes de páginas escaneadas en Markdown estructurado, adecuado para pipelines de ingesta documental gracias a su contexto de 262.144 tokens y a la caché de prefijos habilitada en el servidor vLLM.
- Extracción de datos de facturas y formularios: la funcionalidad de key information extraction permite recuperar campos concretos (importes, fechas, emisores) de documentos fotografiados, un escenario habitual en back-office financiero.
- Procesamiento de documentación técnica con fórmulas: el soporte de parsing de fórmulas lo hace apto para convertir papers y manuales científicos a Markdown con LaTeX embebido.
- Reconstrucción de tablas en informes: el parsing de tablas complejas permite transformar estados financieros o tablas de resultados en estructuras Markdown reutilizables en bases de datos o wikis internas.
- Control de calidad de OCR en producción: el modelo puede combinarse con el inspector MiniCPM-OCR Jev (2B), que puntúa la fiabilidad del parsing y señala contenido que requiere revisión humana, reduciendo el coste de verificación manual.
- Despliegue en infraestructura no NVIDIA: la release FlagOS permite servir el modelo sobre Iluvatar CoreX con vLLM y FlagGems, útil en organizaciones con parque de aceleradores heterogéneo o con requisitos de soberanía de cómputo.
- Asistentes documentales integrados: mediante AnythingLLM o la API compatible con OpenAI, se puede conectar el modelo a interfaces de chat corporativas para consultas sobre documentos escaneados.
- Procesamiento en el borde (edge): la model card reporta que el modelo hermano Jev completa una evaluación de bloque de página en 1,20 s en CPU ARM M5, lo que sugiere viabilidad de despliegues ligeros en terminales.

## Benchmarks y rendimiento

| Benchmark | MiniCPM-OCR-1.0-Nvidia-Origin | MiniCPM-OCR-1.0-Iluvatar-FlagOS |
|---|---|---|
| OcrBench | 80,5 | 80,8 |
| omni_doc_bench_v1_6 | 96,4585 | 95,88 |

Datos adicionales reportados en la model card:
- Real5-OmniDocBench: 93,68 para MiniCPM-OCR 1.0 (1.3B).
- Aceleración DSpark: +55 % de eficiencia extremo a extremo.
- MiniCPM-OCR Jev (2B): AUROC de 0,936 en JevOCRBench, frente a 0,938 de Qwen3.5-397B-A17B.
- Rendimiento del build FlagOS de Jev: 98,7 % del throughput nativo de NVIDIA.
- En la misma plataforma, OCR 1.0 alcanza hasta 1,69× el throughput nativo P50 por unidad de cómputo pico.

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible, dado que el modelo está orientado a OCR y parsing documental.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 2,6 GB solo para pesos (tamaño del repo), más overhead de KV cache y del encoder visual; con `--gpu-memory-utilization 0.9` y contexto de 262.144 tokens, el consumo real depende del número de secuencias concurrentes (`--max-num-seqs 64` en la configuración de referencia).
- GPU recomendadas: Iluvatar CoreX (plataforma validada en esta release); el modelo original está validado también en NVIDIA y otras 10 plataformas según FlagOS.
- GPU de consumo: por tamaño de pesos (1,3B en BF16), es viable en GPUs consumer con 8-16 GB de VRAM para contextos moderados, aunque no se documenta validación específica en la información disponible.
- Opciones de despliegue: vLLM 0.24.0 con `vLLM-plugin-FL` (rama `support-minicpm-ocr`) y FlagGems 5.5.0; imagen Docker `harbor.baai.ac.cn/flagrelease-public/minicpm-ocr-1.0-iluvatar-bi-v150-gems5.5.0-pluginfl-0601420-vllm0.24.0-corex4.5.0:20261021`. No se documentan opciones con llama.cpp, Ollama ni TGI.
- Entorno de referencia: Ubuntu 22.04.4 LTS, Python 3.12, PyTorch 2.10.0 (corex 4.5.0), Triton 3.6.0 (FlagTree 0.7.0), Transformers 5.14.1.
- Latencia y throughput: no se proporcionan cifras absolutas para OCR 1.0; solo ratios relativos (1,69× P50 por unidad de cómputo pico frente a nativo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 | 1,3B | 262.144 tokens (config. vLLM) | Real5-OmniDocBench 93,68; OcrBench 80,5 (nativo) | Apache 2.0 | HuggingFace (release FlagOS Iluvatar) |
| MiniCPM-OCR Jev | 2B | no disponible | JevOCRBench AUROC 0,936 | no disponible en la información | HuggingFace (serie MiniCPM-OCR) |
| Qwen3.5-397B-A17B | 397B totales / 17B activos | no disponible | JevOCRBench AUROC 0,938 | no disponible en la información | no disponible en la información |

La comparación con Qwen3.5-397B-A17B solo es posible en la tarea de inspección de calidad (JevOCRBench), donde el modelo Jev de 2B se acerca al grande (0,936 frente a 0,938) con dos órdenes de magnitud menos de parámetros. Para OCR 1.0 no se dispone de comparativas directas con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e inglés; el rendimiento en otras lenguas no está documentado.
- Sesgos: no se documentan análisis de sesgos en la información disponible.
- Alucinación: como modelo generativo de parsing, puede producir texto o estructuras inexistentes en la imagen; la propia serie recomienda usar MiniCPM-OCR Jev como inspector de calidad para detectar contenido dudoso.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de la release FlagOS y de la imagen Docker asociada antes de un despliegue en producción.
- Validación: esta release está validada específicamente sobre Iluvatar CoreX con la pila FlagOS; el rendimiento en otras plataformas puede diferir. La diferencia de 0,58 puntos en omni_doc_bench_v1_6 frente al build nativo de NVIDIA indica una ligera degradación de precisión en esta adaptación.
- Contexto: aunque el servidor se configura con 262.144 tokens, el consumo de memoria con esa ventana y 64 secuencias concurrentes puede ser elevado; en producción conviene ajustar `--max-model-len` y `--max-num-seqs` al hardware disponible.
- Madurez: el repositorio registra muy pocas descargas y likes en el momento de la consulta, lo que sugiere una adopción todavía limitada y menor soporte comunitario.
- Tool calling y agentes: no se documenta soporte explícito, por lo que no debe asumirse en diseños de agentes.

## Enlaces

- HuggingFace (esta release): https://huggingface.co/FlagRelease/MiniCPM-OCR-1.0-BF16-iluvatar-FlagOS
- Modelo base referenciado en los scripts: `FlagRelease/MiniCPM-OCR-1.0-iluvatar-FlagOS` (ModelScope)
- Imagen Docker FlagOS: `harbor.baai.ac.cn/flagrelease-public/minicpm-ocr-1.0-iluvatar-bi-v150-gems5.5.0-pluginfl-0601420-vllm0.24.0-corex4.5.0:20261021`
- AnythingLLM: https://anythingllm.com/
- Paper, blog o repositorio oficial de MiniCPM-OCR: no disponible en la información proporcionada.
