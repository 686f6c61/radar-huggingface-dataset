# FlagRelease/MiniCPM-V-4.7-1B-BF16-hygon-FlagOS

## Resumen

MiniCPM-V-4.7-1B es un modelo multimodal (imagen, vídeo y texto) de la familia MiniCPM-V4.7, desarrollada por ModelBest junto con OpenBMB, en su variante de 1B. Esta ficha concreta corresponde a la adaptación publicada por la comunidad FlagRelease sobre la pila de software FlagOS para aceleradores Hygon, con pesos en BF16 y código de modelado propio (custom_code). El repositorio declara 1.554.476.272 parámetros reales en safetensors, aunque la model card del autor describe el modelo como de "aproximadamente 1,3B".

El modelo está pensado para despliegue en dispositivo y en el borde de la red: la adaptación FlagOS cubre 12 plataformas (T-Head, NVIDIA, Huawei Ascend, Hygon, Kunlunxin, MetaX, Moore Threads, Tsingmicro, Iluvatar CoreX, Sunrise, Mac con M5 Pro y CIX P1), incluidas CPU ARM. Mantiene la compresión temprana dentro del ViT y la compresión de tokens visuales 4×/16×, y soporta decodificación especulativa DSpark.

Su relevancia ahora es doble: por un lado, lleva comprensión multimodal con OCR, razonamiento sobre gráficos y vídeo a hardware de gama baja; por otro, demuestra la portabilidad del modelo a un stack no CUDA (Hygon + DTK 26.04) con resultados de benchmark ligeramente superiores a los de la ejecución nativa en NVIDIA según el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal MiniCPM-V 4.7 (codificador visual ViT con compresión temprana + modelo de lenguaje), código propio (`custom_code`) |
| Parámetros totales | 1.554.476.272 en safetensors (la model card indica ~1,3B reales) |
| Parámetros activos | No aplica: variante densa de 1B (la variante MoE de la familia es 35B-A3B) |
| Longitud de contexto | 262.144 tokens (`--max-model-len` en la configuración de vLLM publicada) |
| Tipos de cuantización | BF16 en este repositorio; otras cuantizaciones no disponibles |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 3,1 GB |
| Pipeline de HuggingFace | no disponible |
| Compatibilidad de despliegue | FlagOS-Hygon (DTK 26.04, vLLM 0.24.0), imagen Docker publicada |

## Arquitectura y entrenamiento

Se trata de un modelo multimodal compuesto por un codificador visual ViT y un modelo de lenguaje, con la innovación de compresión temprana de tokens dentro del propio ViT y dos modos de compresión de tokens visuales (4× y 16×) que permiten intercambiar detalle visual por eficiencia de inferencia. La configuración de servidor publicada selecciona `downsample_mode: 4x`, limita a una imagen por petición y desactiva el vídeo (`"video":0`), aunque el modelo declara capacidad de comprensión de vídeo. Incorpora además decodificación especulativa DSpark para acelerar la generación.

No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La model card menciona evaluaciones en "modo Instruct", lo que implica la existencia de un modo de instrucciones diferenciado, y la API expone un interruptor `enable_thinking` para activar o desactivar el razonamiento explícito. Esta ficha corresponde únicamente a la adaptación de pesos y contenedor para Hygon; no se documentan cambios en los pesos respecto al modelo original más allá del formato.

## Capacidades

- Generación de texto y razonamiento general en chino e inglés.
- Comprensión de imágenes: descripción, reconocimiento de objetos y lectura de escenas.
- OCR y extracción de texto en imágenes, una de las tareas destacadas por el autor.
- Razonamiento sobre gráficos y tablas (chart reasoning).
- Comprensión de vídeo según la model card (no habilitada en la configuración de servidor de ejemplo).
- Razonamiento matemático: Math_500 con 72,40 puntos en la variante Hygon.
- Modo "thinking" conmutable mediante `chat_template_kwargs.enable_thinking`.
- Compresión configurable de tokens visuales (4× o 16×) para ajustar coste y detalle.
- Decodificación especulativa DSpark para reducir latencia.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes multi-paso: no disponible en la información.
- Capacidades de audio: no disponibles.

## Casos de uso

- Digitalización de documentos con OCR: el modelo puede procesar una imagen por petición y extraer texto estructurado; su tamaño de 1,55B permite ejecutarlo en el mismo dispositivo donde se captura el documento, sin enviar datos a la nube.
- Asistencia en el borde para personas con discapacidad visual: descripción de imágenes en tiempo real sobre CPU ARM o aceleradores de gama baja, gracias a la adaptación FlagOS a 12 plataformas.
- Análisis de gráficos e informes financieros: con 262.144 tokens de contexto se pueden encadenar varias páginas e imágenes y formular preguntas sobre series de datos representadas gráficamente.
- Verificación de calidad en líneas de producción: inspección visual automatizada con un modelo que cabe en 3,1 GB de pesos y puede desplegarse junto a la cámara, sin depender de conectividad.
- Sustitución de pilas CUDA en infraestructura china: el contenedor FlagOS-Hygon permite servir el modelo sobre DCU Hygon con vLLM sin reescribir la capa de inferencia, lo que facilita cumplir requisitos de soberanía tecnológica.
- Chat multilingüe chino-inglés sobre imágenes en aplicaciones móviles: al soportar solo estos dos idiomas, encaja en productos dirigidos a esos mercados con presupuesto de memoria muy reducido.
- Prototipado rápido de asistentes multimodales: la imagen Docker y el script de arranque con parámetros preconfigurados permiten tener un endpoint compatible con la API de OpenAI en minutos, integrable en AnythingLLM.

## Benchmarks y rendimiento

| Métrica | MiniCPM-V-4.7-1B (NVIDIA, nativo) | MiniCPM-V-4.7-1B (Hygon, FlagOS) |
|---|---|---|
| Math_500 | 71,20 | 72,40 |
| MMLU_Pro | 47,6 | 48,0 |

El autor afirma además que, en evaluaciones oficiales en modo Instruct, las variantes 35B-A3B y 1B obtuvieron puntuaciones globales superiores a Qwen3.6-35B-A3B y Qwen3.5-0.8B respectivamente, con menor tiempo de inferencia. No se publican en la información disponible las puntuaciones desglosadas de esa comparación, ni métricas de MMMU, OCRBench, HumanEval u otros conjuntos habituales.

## Requisitos de hardware

- Pesos en BF16: 3,1 GB en disco y en memoria, según el tamaño del repositorio.
- VRAM estimada: los pesos caben en cualquier GPU con 4 GB o más; el consumo total depende del contexto y del número de secuencias. Para 262.144 tokens de contexto y 64 secuencias concurrentes (valores de la configuración publicada) se necesita mucha más memoria de caché KV, y no se publican cifras exactas.
- GPU consumer: sí cabe en tarjetas de 8-12 GB (por ejemplo, RTX 3060, RTX 4060 Ti) para contextos moderados y una imagen por petición, aunque no hay medidas publicadas de VRAM pico.
- Aceleradores validados: Hygon (DCU, DTK 26.04), NVIDIA, Huawei Ascend, Kunlunxin, MetaX, Moore Threads, Tsingmicro, Iluvatar CoreX, Sunrise, T-Head, CIX P1 y Mac con M5 Pro, según la model card.
- Despliegue: vLLM 0.24.0 con el plugin FlagOS dentro de la imagen Docker `harbor.baai.ac.cn/flagrelease-public/minicpmv47-1b-hygon001-...`; también se puede descargar con ModelScope. No se documentan en la información disponible instrucciones para llama.cpp, Ollama o TGI.
- Ajustes de rendimiento incluidos en el ejemplo: `--max-num-seqs 64`, `--max-num-batched-tokens 16384`, `--enable-chunked-prefill`, `--gpu-memory-utilization 0.90` y captura de CUDA graphs para tamaños 1 a 64.
- Latencia y throughput: no disponibles. El autor solo indica cualitativamente que el tiempo de inferencia es menor que el de los modelos comparados.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B (esta ficha) | 1,55B (card: ~1,3B) | No aplica (denso) | 262.144 | Math_500 72,40; MMLU_Pro 48,0 | Apache 2.0 | HuggingFace y ModelScope; imagen Docker Hygon |
| MiniCPM-V-4.7-35B-A3B | 35B | 3B (según denominación A3B) | no disponible | Puntuación global superior a Qwen3.6-35B-A3B según el autor | no disponible en la información | Misma release multi-plataforma FlagOS |
| Qwen3.5-0.8B | 0,8B | No aplica (denso) | no disponible | Inferior a MiniCPM-V-4.7-1B según el autor; sin cifras publicadas | no disponible en la información | no disponible en la información |
| Qwen3.6-35B-A3B | 35B | 3B (según denominación A3B) | no disponible | Inferior a MiniCPM-V-4.7-35B-A3B según el autor | no disponible en la información | no disponible en la información |

No se dispone de datos verificables de otros modelos comparables de la misma categoría (multimodal de menos de 2B) en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo chino e inglés declarados; el rendimiento en castellano no está evaluado y previsiblemente será inferior.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o robustez.
- Alucinación: no se publican tasas de alucinación ni evaluaciones de fidelidad en OCR o descripción de imágenes, un riesgo relevante en tareas de extracción de texto.
- Evidencia de benchmark muy limitada: solo dos métricas (Math_500 y MMLU_Pro) y con una diferencia de 1,2 y 0,4 puntos entre stacks, dentro del margen que podría explicarse por variabilidad de ejecución.
- La comparación con Qwen3.5-0.8B y Qwen3.6-35B-A3B procede únicamente de la afirmación del autor, sin tabla de resultados pública en la información disponible.
- Configuración de referencia restrictiva: una imagen por prompt y vídeo deshabilitado; usar vídeo o múltiples imágenes requiere cambiar los parámetros y aumenta el consumo de memoria.
- El repositorio está orientado al stack Hygon: el arranque depende de DTK 26.04, variables de entorno específicas, `--trust-remote-code` y plugins FlagOS; no es un despliegue estándar de transformers.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero exige conservar avisos de copyright y licencia y no concede garantías; conviene revisar las condiciones de los pesos originales de MiniCPM-V4.7 y de la imagen Docker alojada en el registro de BAAI.
- El repositorio tiene 18 descargas y 0 likes en el momento de la ficha, por lo que la validación por parte de la comunidad es prácticamente nula.
- No se documentan limitaciones de longitud efectiva: aunque se configura un contexto de 262.144 tokens, no hay evaluación publicada de recuperación en contextos largos.

## Enlaces

- HuggingFace: https://huggingface.co/FlagRelease/MiniCPM-V-4.7-1B-BF16-hygon-FlagOS
- ModelScope: no disponible la URL exacta; la model card indica que los pesos se publican también en ModelScope y se descargan con `modelscope download --model FlagRelease/MiniCPM-V-4.7-1B-BF16-hygon-FlagOS`
- Imagen Docker: `harbor.baai.ac.cn/flagrelease-public/minicpmv47-1b-hygon001-gems5.3.2-tree0.6.2a1-cxnone-plugin0.0.0-vllm0.24.0-sglangnone-sglangflnone-cp3.10-pt2.10-dtk26.04-x64-6.3.30:202610220810`
- AnythingLLM: https://anythingllm.com/
- Paper, blog o repositorio de FlagOS/OpenBMB/ModelBest: no disponibles en la información proporcionada.
