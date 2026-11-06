# FlagRelease/MiniCPM-OCR-1.0-BF16-zhenwu-FlagOS

## Resumen

MiniCPM-OCR 1.0 es un modelo de reconocimiento optico de caracteres (OCR) y parseo de documentos desarrollado por ModelBest en colaboracion con OpenBMB. Con 1.300.434.160 parametros (aproximadamente 1,3B), esta disenado especificamente para escenarios documentales del mundo real: escaneos, fotografias, paginas curvadas y pantallas re-fotografiadas, con soporte para extraccion de texto, formulas matematicas, tablas complejas y extraccion de informacion clave. Forma parte de la serie MiniCPM-OCR, que incluye tambien un modelo mayor de 2B parametros (MiniCPM-OCR Jev) orientado a la validacion de calidad del parseo.

La ficha que nos ocupa corresponde a la build `FlagRelease/MiniCPM-OCR-1.0-BF16-zhenwu-FlagOS`, una adaptacion del modelo original publicada por la comunidad FlagOS. Esta build proporciona adaptacion cross-chip "Day-0" sobre 12 plataformas de hardware distintas (T-Head, NVIDIA, Huawei Ascend, Hygon, KUNLUNXIN, MetaX, Moore Threads, Tsingmicro, Iluvatar CoreX, Xiwang, Mac ARM y CIX), lo que la hace relevante para despliegues en entornos con aceleradores no NVIDIA. Los pesos estan en formato BF16 safetensors y el repositorio ocupa 2,6 GB.

El modelo es relevante ahora porque aborda el problema de la digitalizacion documental de alta fidelidad con un modelo ligero que cabe en hardware modesto, y porque su integracion con la pila FlagOS permite desplegarlo tanto en servidores multi-chip como en dispositivos ARM de borde. En evaluaciones oficiales alcanzo 93,68 en Real5-OmniDocBench, y con la aceleracion de decodificacion DSpark mejoro su eficiencia de procesamiento extremo a extremo en un 55%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal especializado en OCR/document parsing; tag `minicpm_ocr`) |
| Parametros totales | 1.300.434.160 (aprox. 1,3B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens (segun `--max-model-len` en el script de despliegue) |
| Tipos de cuantizacion | BF16 (pesos publicados en este repo); otras cuantizaciones no disponibles |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (tipo de transformer, mecanismo de atencion, composicion exacta del encoder visual). El tag `minicpm_ocr` y la naturaleza de la tarea indican un modelo multimodal con codificador de imagen y decodificador de texto, orientado a la transcripcion y estructura de documentos. El script de despliegue hace referencia a un backend de atencion para el codificador multimodal (`--mm-encoder-attn-backend TORCH_SDPA`) y a un limite de hasta 4 imagenes y 1 video por prompt (`--limit-mm-per-prompt`), lo que confirma el soporte de entrada visual multiple.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona la decodificacion DSpark como tecnica de aceleracion de inferencia, que segun el autor mejora la eficiencia extremo a extremo en un 55%. Tambien se menciona que la build FlagOS de la variante Jev alcanzo el 98,7% del throughput nativo de NVIDIA, y que en ARM de borde Jev completa una evaluacion de bloque de pagina en 1,20 segundos usando solo CPU M5.

## Capacidades

- Reconocimiento de texto en documentos escaneados, fotografias, paginas curvadas y pantallas re-fotografiadas.
- Parseo de formulas matematicas presentes en documentos.
- Parseo de tablas complejas con estructura preservada.
- Extraccion de informacion clave (key information extraction) de documentos.
- Procesamiento multimodal con soporte de hasta 4 imagenes y 1 video por prompt.
- Ventana de contexto larga de 262.144 tokens, adecuada para documentos extensos o multiples paginas en una sola peticion.
- Soporte de cache de prefijos (`--enable-prefix-caching`) para reutilizacion de contexto en inferencia.
- Capacidades multilingues limitadas a chino e ingles.
- No se documenta soporte explicito de tool calling, function calling ni comportamiento agentico en la informacion disponible.

## Casos de uso

- Digitalizacion masiva de archivos escaneados: el modelo procesa lotes de documentos con contexto de 262K tokens, permitiendo agrupar varias paginas por peticion y reducir el numero de llamadas al servidor. Adecuado por su tolerancia a escaneos y fotografias de baja calidad.
- Extraccion de datos de facturas y formularios: la capacidad de key information extraction permite obtener campos estructurados (importes, fechas, identificadores) directamente del documento, integrándose en pipelines de contabilidad o ERP.
- Conversion de tablas a formato estructurado: el parseo de tablas complejas facilita la transformacion de tablas en PDF o imagen a CSV, JSON o Markdown para su carga en bases de datos.
- Procesamiento de documentacion cientifica y tecnica: el soporte de formulas matematicas permite transcribir articulos y manuales con notacion matematica a LaTeX o texto plano.
- Despliegue en infraestructura no NVIDIA: gracias a la adaptacion FlagOS sobre 12 plataformas (Ascend, Hygon, KUNLUNXIN, MetaX, Moore Threads, etc.), el modelo puede ejecutarse en entornos con aceleradores domesticos o heterogeneos donde no hay GPUs NVIDIA disponibles.
- OCR en dispositivos de borde ARM: la variante de la familia (Jev) demuestra viabilidad de inferencia en CPU ARM (1,20 s por bloque de pagina en M5), lo que abre casos de captura y digitalizacion en terminales sin GPU dedicada.
- Control de calidad de pipelines OCR existentes: aunque esta build es el modelo OCR 1.0, la familia incluye Jev como "inspector de calidad" que puntua la fiabilidad del parseo y puede encadenarse a otros motores OCR para marcar contenido que requiere revision humana.
- Servicio de OCR como API: el despliegue con vLLM y endpoint compatible con OpenAI (`/v1/chat/completions`) permite exponer el modelo como servicio interno para aplicaciones de gestion documental.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Benchmark | MiniCPM-OCR-1.0-Nvidia-Origin | MiniCPM-OCR-1.0-T-Head-FlagOS |
|---|---|---|
| OcrBench | 80,5 | 80,0 |
| omni_doc_bench_v1_6 | 96,4585 | 96,4217 |

Datos adicionales aportados por el autor:

| Metrica | Valor |
|---|---|
| Real5-OmniDocBench (MiniCPM-OCR 1.0) | 93,68 |
| Mejora de eficiencia con decodificacion DSpark | 55% |
| Throughput FlagOS Jev vs. nativo NVIDIA | 98,7% |
| Throughput FlagOS OCR 1.0 vs. nativo P50 por unidad de computo pico | hasta 1,69x |
| Latencia Jev en CPU ARM M5 (bloque de pagina) | 1,20 s de media |
| AUROC JevOCRBench (Jev 2B) | 0,936 (frente a 0,938 de Qwen3.5-397B-A17B) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K, que por otra parte no son benchmarks representativos para un modelo especializado en OCR.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 2,6 GB solo para pesos, mas overhead de KV cache y activaciones; con contexto largo (262K tokens) el consumo de memoria crece de forma significativa.
- El script de despliegue de referencia usa `--gpu-memory-utilization 0.55`, lo que sugiere que el modelo puede ejecutarse en GPUs con margen amplio de memoria.
- GPU recomendadas: el modelo cabe en GPUs de consumo como RTX 4090 (24 GB) con holgura para contexto moderado; para contexto completo de 262K se recomienda A100 (40/80 GB) o H100.
- Cabe en GPU de consumo: si, en tarjetas con 8-16 GB para contextos cortos y cuantizacion BF16; en ARM de borde la familia demuestra viabilidad en CPU.
- Opciones de despliegue: vLLM (con plugins FlagOS: `VLLM_PLUGINS=fl`, `VLLM_FL_USE_FLAGGEMS_VLLM=1`), contenedor Docker de FlagOS-T-Head, y descarga de pesos via ModelScope. No se documenta soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Throughput y latencia: en ARM M5, 1,20 s por bloque de pagina para la variante Jev; en T-Head FlagOS, el modelo alcanza entre el 80 y el 96,4% del rendimiento nativo NVIDIA segun el benchmark (OcrBench y omni_doc_bench respectivamente). No se dispone de cifras de tokens por segundo en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 (esta ficha) | 1,3B | 262.144 | OCR y parseo de documentos | Apache 2.0 | Hugging Face (FlagRelease), ModelScope |
| MiniCPM-OCR Jev | 2B | no disponible | Inspeccion de calidad de parseo OCR | Apache 2.0 (segun familia) | Hugging Face (FlagRelease) |
| Qwen3.5-397B-A17B | 397B totales / 17B activos | no disponible | Modelo generalista multimodal | no disponible | no disponible |

La comparativa directa con modelos de OCR especializados de otros fabricantes (por ejemplo, las familias PaddleOCR o Donut) no esta disponible en la informacion proporcionada. El unico dato comparativo publicado es el AUROC en JevOCRBench de la variante Jev (0,936) frente a Qwen3.5-397B-A17B (0,938), que muestra un rendimiento cercano en inspeccion de calidad con un modelo dos ordenes de magnitud menor en parametros totales.

## Limitaciones y advertencias

- Idiomas limitados a chino e ingles; no se garantiza calidad en otros idiomas, incluido el castellano.
- Modelo especializado en OCR y parseo documental: no es un modelo de proposito general y su rendimiento en tareas de razonamiento, codigo o conversacion no esta documentado.
- Riesgo de alucinacion en la transcripcion de texto ilegible o de baja calidad; la propia familia incluye un modelo de inspeccion (Jev) precisamente porque la salida del parseo puede requerir verificacion humana.
- La build FlagOS depende de plugins y contenedores especificos (`VLLM_PLUGINS=fl`, imagenes de `harbor.baai.ac.cn`); el despliegue en pilas estandar puede requerir ajustes no documentados.
- El contexto de 262K tokens incrementa el consumo de memoria y la latencia; en GPUs de consumo conviene limitar la longitud efectiva.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los pesos originales de ModelBest/OpenBMB y de las dependencias de FlagOS.
- El repositorio tiene solo 8 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion muy temprana y poca validacion independiente por parte de la comunidad.
- No se documentan sesgos especificos ni evaluaciones de robustez mas alla de los benchmarks citados.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/FlagRelease/MiniCPM-OCR-1.0-BF16-zhenwu-FlagOS
- Repositorio de pesos alternativo (ModelScope, segun model card): `FlagRelease/MiniCPM-OCR-1.0-zhenwu-FlagOS`
- Imagen Docker FlagOS: `harbor.baai.ac.cn/flagrelease-public/minicpm-ocr-pp001-gems5.5.0-tree0.7.0-cxnone-plugin0.0.0-vllm0.24.0-cp312-pt210-hggc130-x64-2.1.1-rbd225:202610270944`
- Organizacion FlagRelease en Hugging Face: https://huggingface.co/FlagRelease
- ModelBest: https://www.modelbest.cn
- OpenBMB: https://www.openbmb.org
- No se han encontrado en la informacion disponible enlaces a papers, blogs o demos adicionales.
