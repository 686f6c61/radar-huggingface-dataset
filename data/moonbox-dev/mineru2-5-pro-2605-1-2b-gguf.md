# moonbox-dev/MinerU2.5-Pro-2605-1.2B-GGUF

## Resumen

MinerU2.5-Pro-2605-1.2B-GGUF es una compilación en formato GGUF del modelo MinerU2.5-Pro, un modelo vision-language especializado en parsing de documentos y OCR desarrollado por OpenDataLab y empaquetado para uso local por Moonbox. El modelo resuelve el problema de la extracción estructurada de texto a partir de imágenes de documentos, una tarea crítica en pipelines de digitalización, RAG sobre PDFs y automatización documental. Su relevancia actual radica en que permite ejecutar un parser de documentos especializado en hardware de consumo, sin depender de APIs en la nube.

La arquitectura combina un decoder Qwen2 de 0.5B parámetros con un encoder visual Qwen2-VL, sumando un total de 494.032.768 parámetros según los pesos en safetensors. El checkpoint original se distribuye bajo licencia Apache 2.0 y está pensado para integrarse en el pipeline completo de MinerU (`mineru_vl_utils`), que realiza detección de layout y luego una petición por bloque de texto.

Esta compilación GGUF es relevante porque ofrece precisiones F16, BF16 y Q8_0 con verificación tensor a tensor contra el checkpoint original, además de un archivo `mmproj` separado que contiene el encoder visual en F16. Está diseñada para llama.cpp en Metal, CUDA, Vulkan y CPU, lo que la hace desplegable en portátiles y estaciones de trabajo sin GPU de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language: decoder Qwen2 + encoder visual Qwen2-VL con merger |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0 |
| Idiomas soportados | no disponible (la evaluación del autor cubre inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo) + GGUF (mmproj del encoder visual) |

## Arquitectura y entrenamiento

El modelo es un vision-language transformer compuesto por un encoder visual Qwen2-VL y un decoder Qwen2 de aproximadamente 0.5B parámetros. El encoder visual incluye un merger que proyecta las representaciones visuales al espacio del decoder. En la conversión a GGUF se realizaron dos transformaciones de layout sin alterar valores: la separación de los pesos fusionados `qkv` de la torre visual en q, k y v, y la conversión de la convolución 3D de patch-embedding en dos kernels 2D, uno por frame. Los 681 tensores del checkpoint original se localizaron con los mismos valores en los archivos GGUF.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. El modelo forma parte de la línea MinerU2.5-Pro, descrita en el tech report arXiv:2604.04771, orientada al parsing de documentos a escala con enfoque data-centric. La cuantización se generó con `llama-quantize` a partir del archivo BF16, usando mezclas estándar y sin importance matrix.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos, con prompt específico `Text Recognition:`.
- Parsing de documentos estructurados por bloques, integrándose en el pipeline de MinerU (`mineru_vl_utils`) con detección de layout previa.
- Procesamiento de imágenes de página o de bloque mediante el pipeline `image-text-to-text`.
- Soporte de conversación multi-turno a través de `/v1/chat/completions` en `llama-server`, con la imagen como parte `image_url`.
- Capacidades multilingües: la evaluación del autor cubre inglés y chino, aunque no se especifica la lista completa de idiomas soportados.
- Ejecución en CPU, CUDA, Metal y Vulkan mediante llama.cpp.
- No se ha documentado soporte de tool calling, function calling, agentes o modos de razonamiento extendido en la información disponible.

## Casos de uso

- Digitalización masiva de documentos: el modelo puede procesar páginas o bloques individuales en pipelines por lotes, con un coste de 0.26-0.27 s por página en CUDA (RTX 3080 Laptop), lo que permite digitalizar grandes volúmenes en estaciones de trabajo.
- Extracción de texto para RAG sobre PDFs: al integrarse en el pipeline de MinerU con detección de layout y peticiones por bloque, permite convertir documentos escaneados en texto estructurado apto para indexación y búsqueda semántica.
- Procesamiento en el borde o en local: gracias a los archivos Q8_0 de 531 MB y F16/BF16 de 994 MB, el modelo puede ejecutarse en portátiles sin GPU dedicada mediante llama.cpp en CPU o Metal, útil en entornos con requisitos de privacidad.
- Automatización de back-office documental: facturas, formularios y contratos escaneados pueden procesarse bloque a bloque para extraer campos de texto con prompts específicos, integrándose en flujos de validación posteriores.
- Servicio de OCR self-hosted: `llama-server` expone una API compatible con `/v1/chat/completions`, lo que permite desplegar un endpoint de OCR interno sin dependencia de proveedores externos.
- Investigación en parsing de documentos: la disponibilidad de pesos GGUF verificados tensor a tensor y de un tech report facilita la reproducibilidad y la comparación de pipelines de OCR en entornos académicos.
- Preprocesado para pipelines de datos de entrenamiento: la extracción de texto de documentos escaneados a escala puede alimentar corpus para otros modelos, con control total sobre la infraestructura.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a una evaluación propia sobre 12 páginas sintéticas (6 en inglés y 6 en chino) con ground truth exacto, usando el prompt de bloque de texto de MinerU y decodificación greedy, ejecutada en `llama-server` sobre CUDA (RTX 3080 Laptop). La métrica es character error rate (CER) ignorando espacios.

| Precision | Tamano | CER (EN / ZH) | Igual que BF16 | Tiempo por pagina (CUDA) |
|---|---|---|---|---|
| F16 | 994.2 MB | 0.0 % / 0.0 % | 6 + 6 de 12 paginas | 0.26 s |
| BF16 | 994.2 MB | 0.0 % / 0.0 % (original 0.0 / 0.0) | referencia | 0.27 s |
| Q8_0 | 531.1 MB | 0.0 % / 0.0 % | 6 + 6 de 12 paginas | 0.26 s |
| mmproj (F16) | 1.33 GB | no aplica (encoder) | no aplica | no aplica |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo BF16/F16 ocupa 994.2 MB y el encoder visual `mmproj` 1.33 GB, por lo que se requiere aproximadamente 2.3-2.5 GB para cargar ambos archivos en precisión completa. Con Q8_0, el modelo baja a 531.1 MB y el total ronda 1.9 GB.
- GPU recomendadas: cualquier GPU con al menos 3 GB de VRAM libre; el autor reporta ejecución en una RTX 3080 Laptop. Para mayor throughput, se pueden usar A100, H100 o RTX 4090, aunque no se han publicado cifras de rendimiento para estas.
- Cabe en GPU de consumo: sí, en tarjetas con 3 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). También puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (`llama-mtmd-cli` y `llama-server`) en versión `b12621` o superior, con soporte para Metal, CUDA, Vulkan y CPU. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: 0.26-0.27 s por página en CUDA (RTX 3080 Laptop) para el prompt de bloque de texto. No se han publicado cifras para CPU, Metal u otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MinerU2.5-Pro-2605-1.2B-GGUF (este) | 494.032.768 | no disponible | GGUF + mmproj GGUF | Apache 2.0 | Especializado en OCR y parsing de documentos; evaluación propia con CER 0.0 % en EN/ZH |
| MinerU2.5-Pro-2605-1.2B (original) | 494.032.768 | no disponible | safetensors | Apache 2.0 | Checkpoint base en float32/BF16; requiere infraestructura de inferencia Hugging Face |
| Qwen2-VL (familia) | no disponible | no disponible | safetensors, GGUF | no disponible | Familia generalista vision-language de la que deriva el encoder visual; no es un parser de documentos especializado |
| Otros parsers de documentos open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en OCR y parsing de documentos; no es un modelo generalista y su rendimiento en otras tareas vision-language no está documentado.
- La evaluación publicada se limita a 12 páginas sintéticas en inglés y chino, por lo que la generalización a documentos reales, otros idiomas, tablas complejas o layouts atípicos no está cuantificada.
- No se especifica la longitud de contexto soportada, lo que limita la planificación de pipelines con bloques grandes.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo de OCR, el riesgo principal es la omisión o confusión de caracteres en documentos de baja calidad.
- La lista completa de idiomas soportados no está disponible; el uso en idiomas distintos del inglés y el chino requiere validación propia.
- La licencia Apache 2.0 permite uso comercial, pero los archivos GGUF son un derivado del modelo original y heredan su licencia; se debe conservar el aviso de licencia.
- La cuantización se realizó sin importance matrix, con mezclas estándar de `llama-quantize`; aunque la verificación tensor a tensor es correcta, el rendimiento en Q8_0 se validó solo con el prompt de bloque de texto.
- Se requiere llama.cpp `b12621` o superior y cargar tanto el archivo del modelo como el `mmproj`; usar solo uno de los dos no funciona.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/MinerU2.5-Pro-2605-1.2B-GGUF
- Modelo base: https://huggingface.co/opendatalab/MinerU2.5-Pro-2605-1.2B
- Tech report: https://arxiv.org/abs/2604.04771
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Logo del proyecto: https://hotelll.github.io/MinerU2.5-Pro/MinerU25-Pro-LOGO.png
