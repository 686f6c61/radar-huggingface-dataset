# sanjeevafk/hybrid-edge-multimodal-lfm3-qwen2vl

## Resumen

Hybrid Edge Multimodal es un pipeline multimodal publicado en Hugging Face por el usuario sanjeevafk que combina dos modelos independientes para ofrecer entrada de imagen y generación de texto en hardware muy limitado. No se trata de un modelo único entrenado de forma conjunta, sino de una arquitectura de orquestación: un VLM (Qwen2-VL-2B-Instruct) ejecutado en CPU se encarga de la percepción visual y la extracción OCR estructurada, mientras que un modelo de lenguaje puramente textual (LFM3-1.7B-Uncensored, de AtomicChat) se ejecuta íntegramente en GPU para la generación de respuestas. Un proxy FastAPI unificado expone una API compatible con OpenAI en el puerto 8080 y enruta las peticiones según su contenido.

El problema que resuelve es concreto: ejecutar un asistente multimodal en sistemas con 2 GB de VRAM y 8-16 GB de RAM del sistema, donde cargar un checkpoint multimodal unificado provoca errores de memoria (OOM). Al desacoplar la carga visual (CPU) de la generación textual (GPU), el pipeline mantiene el 100 % de la VRAM para el modelo de lenguaje y su caché de contexto. El modelo base LFM3 emplea una arquitectura híbrida de espacio de estados (state-space) y no incluye codificador visual nativo, de ahí la necesidad del VLM separado.

La relevancia actual radica en su enfoque de "edge AI": demuestra que es posible obtener OCR de alta fidelidad y reconocimiento de layout de interfaz en hardware consumer de gama baja (por ejemplo, una NVIDIA MX550) con latencias de 13 a 25 segundos por imagen y throughput de generación de 64-68 tok/s. La licencia es Apache 2.0, aunque el repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica que es un proyecto personal reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido de dos modelos: LFM3-1.7B (state-space híbrido, solo texto) + Qwen2-VL-2B-Instruct (transformer multimodal con proyector visual) |
| Parametros totales | 1,7 B (LFM3) + 2 B (Qwen2-VL) = ~3,7 B en el pipeline |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en LFM3 (KV Q8_0); 4.096 tokens en Qwen2-VL-2B |
| Tipos de cuantizacion | GGUF Q4_K_M para ambos modelos; mmproj en F16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El pipeline no entrena ningún modelo nuevo: compone dos checkpoints preentrenados de terceros. El motor conversacional es `AtomicChat/LFM3-1.7B-Uncensored-GGUF`, una variante del LFM3 de Liquid Foundation Models basada en arquitectura híbrida de espacio de estados, sin codificador visual ni proyector multimodal. El motor de percepción es `Qwen2-VL-2B-Instruct` en formato GGUF, que incluye un proyector `mmproj` en F16 de 1,3 GB y procesa imágenes en CPU mediante `llama-server` con AVX2 y 6 hilos. El router `vlm_router.py` aplica downsampling Lanczos a las imágenes (dimensión máxima 1280 px) y limita los tokens visuales entre 256 y 512 (`--image-min-tokens 256 --image-max-tokens 512`).

La innovación técnica no está en el entrenamiento sino en el reparto de cargas: el VLM se ancla a CPU con 4 slots de concurrencia y el LLM ocupa la GPU al 100 % (`-ngl 99`), con 1.484 MiB de VRAM para LFM3 y 2.210 MiB de RAM del sistema para Qwen2-VL. El flujo es de dos etapas: extracción OCR y descomposición de UI estructurada por parte del VLM, seguida de razonamiento y generación en streaming por parte de LFM3. No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni uso de RLHF/DPO en la model card.

## Capacidades

- Generación de texto conversacional en inglés mediante LFM3-1.7B, con streaming a ~68 tok/s.
- Entrada de imagen y texto (pipeline `image-text-to-text`): el VLM procesa capturas de pantalla, paneles de UI y diálogos de error.
- OCR de alta fidelidad: transcripción verbatim de cadenas de error, código en monoespaciado y texto de terminal.
- Reconocimiento de layout de interfaz: identificación de paneles, componentes y estructura visual de la pantalla.
- Enrutamiento automático por tipo de entrada: las imágenes van al VLM en CPU; las consultas solo de texto van directamente al LLM en GPU.
- API compatible con OpenAI (`/v1`) a través de un proxy FastAPI unificado.
- Despliegue en llama.cpp con soporte CUDA para el LLM y CPU (AVX2) para el VLM.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modo "thinking" explícito.

## Casos de uso

- Asistencia técnica sobre capturas de pantalla: el usuario sube una captura con un diálogo de error y el pipeline extrae el mensaje verbatim con Qwen2-VL y genera una explicación o solución con LFM3. Adecuado porque el OCR verbatim está validado en el propio benchmark del autor (popup 720x480 en ~13,4 s).
- Depuración de código en terminal: el VLM transcribe código en monoespaciado y paneles de terminal, y el LLM razona sobre el fallo. El benchmark reporta alta fidelidad en transcripción de código monoespaciado, un punto donde SmolVLM-500M y Moondream 2 fallan.
- Automatización de soporte en entornos con hardware restringido: despliegue en un portátil con GPU de 2 GB (MX550) y 16 GB de RAM, sin necesidad de servidores con A100. El pipeline completo cabe en 1.484 MiB de VRAM más 2.210 MiB de RAM.
- Procesamiento de documentación visual en local: digitalización y descripción de formularios o paneles de aplicación en estaciones de trabajo sin GPU dedicada de gama alta, usando el VLM en CPU.
- Prototipado de asistentes multimodales con API OpenAI-compatible: el proxy en el puerto 8080 permite integrar el pipeline en aplicaciones existentes que ya usan el SDK de OpenAI, cambiando solo la `base_url`.
- Evaluación comparativa de VLMs pequeños en CPU: el repositorio incluye una tabla de comparación frente a SmolVLM-500M y Moondream 2 que sirve como referencia para seleccionar un extractor OCR en entornos edge.
- Chat de texto de baja latencia en GPU de gama baja: para consultas sin imagen, LFM3 responde a 64-68 tok/s con 32.768 tokens de contexto, suficiente para conversaciones multi-turno largas en una MX550.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos en Intel Core i5-1335U (6 hilos de ejecución) con NVIDIA GeForce MX550 (2048 MiB) y 16 GB DDR4.

| Componente | Dispositivo | Concurrencia | Procesamiento de prompt | Generación | Contexto | Huella |
|---|---|---|---|---|---|---|
| LFM3-1.7B Uncensored | GPU MX550 (CUDA) | 1 slot | 270-350 tok/s | 64-68 tok/s | 32.768 tokens (KV Q8_0) | 1.484 MiB VRAM |
| Qwen2-VL-2B-Instruct | CPU (AVX2, 6 hilos) | 4 slots | 20-26 tok/s | 21-25 tok/s | 4.096 tokens | 2.210 MiB RAM |

Latencia de visión en CPU según resolución:

| Resolución de entrada | Tamaño tras downsampling | Tokens de imagen | Tiempo de codificación | Fidelidad OCR |
|---|---|---|---|---|
| 1839x2187 (sin clamp) | Nativa | ~1.028 | ~63,3 s | Alta |
| 1839x2187 (clamp 1280 px) | 1076x1280 | ~510 | ~24,7 s | Alta |
| 720x480 (popup de error) | 720x480 | ~349 | ~13,4 s | Alta (verbatim) |

Comparativa de extracción visual en capturas idénticas (código de terminal, paneles de UI y diálogos de error):

| Modelo | Host | Precisión OCR | Reconocimiento de layout | Modos de fallo |
|---|---|---|---|---|
| SmolVLM-500M | CPU | Baja | Baja | Bucles de alucinación repetitivos; pierde formato de código monoespaciado |
| Moondream 2 | CPU | Baja | Moderada | Falla en extracción de caracteres monoespaciados |
| Qwen2-VL-2B (este pipeline) | CPU | Alta | Alta | Ninguno observado en capturas estándar de UI y terminal |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 1.484 MiB para LFM3-1.7B en Q4_K_M con contexto de 32.768 tokens y KV en Q8_0. El VLM consume 2.210 MiB de RAM del sistema, no de VRAM.
- RAM del sistema: 8 GB mínimo según el autor; 16 GB en la configuración medida.
- GPU recomendadas: NVIDIA GeForce MX550 (2048 MiB) es el hardware de referencia. Cualquier GPU CUDA con al menos 2 GB de VRAM libre puede alojar el LLM. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, en GPUs de gama de entrada con 2 GB o más (MX550 y superiores). El VLM se ejecuta en CPU y no requiere GPU.
- Opciones de despliegue: llama.cpp (`llama-server`) con compilación CUDA, más un proxy FastAPI (`vlm_router.py`). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: generación de 64-68 tok/s y procesamiento de prompt de 270-350 tok/s en el LLM; 21-25 tok/s de generación y 20-26 tok/s de prompt en el VLM. Codificación de imagen entre 13,4 s (720x480) y 24,7 s (1076x1280 con clamp).
- Pesos: `LFM3-1.7B-Uncensored-AD-Q4_K_M.gguf` (941 MB), `qwen2-vl-2b-instruct-q4_k_m.gguf` (941 MB) y `mmproj-qwen2-vl-2b-instruct-f16.gguf` (1,3 GB).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hybrid Edge Multimodal (este pipeline) | ~3,7 B en total (1,7 B + 2 B) | 32.768 (LLM) / 4.096 (VLM) | Dos modelos desacoplados CPU/GPU | Apache 2.0 | GGUF en Hugging Face, repo con 0 descargas |
| SmolVLM-500M | 0,5 B | No disponible | VLM unificado pequeño | No disponible en la información | Referenciado como baseline en la model card |
| Moondream 2 | No disponible | No disponible | VLM unificado | No disponible en la información | Referenciado como baseline en la model card |
| Qwen2-VL-2B-Instruct (uso unificado) | 2 B | 4.096 | VLM unificado | No disponible en la información | Disponible en Hugging Face |

La comparación se limita a los baselines citados por el autor en tareas de OCR y reconocimiento de UI: el pipeline supera a SmolVLM-500M y Moondream 2 en precisión OCR y layout según sus propias mediciones, a costa de una latencia de visión mayor (13-25 s) y de una arquitectura de dos etapas en lugar de un modelo único.

## Limitaciones y advertencias

- El pipeline solo soporta inglés; no se documentan capacidades multilingües.
- No es un modelo entrenado de forma conjunta: la coherencia entre la salida del VLM y la del LLM depende por completo del prompt de enrutamiento y de la calidad del OCR intermedio.
- La latencia de visión en CPU es alta (13-25 s por imagen), lo que lo hace inadecuado para aplicaciones interactivas con imágenes frecuentes.
- El LLM es una variante "Uncensored" de LFM3 de un tercero (AtomicChat), con posibles diferencias de comportamiento respecto al modelo original de Liquid Foundation Models.
- Riesgo de alucinación inherente a modelos de 1,7-2 B parámetros; el autor no documenta evaluaciones de sesgo ni de robustez fuera de capturas de UI y terminal.
- La evaluación comparativa la realiza el propio autor sobre un conjunto reducido de capturas; no hay validación independiente ni benchmarks estándar publicados.
- El repositorio tiene cero descargas y cero likes, y fue creado en octubre de 2026: no hay evidencia de uso en producción ni de mantenimiento continuado.
- La licencia Apache 2.0 se aplica al pipeline, pero conviene verificar las licencias de los checkpoints subyacentes (LFM3 de Liquid Foundation Models y Qwen2-VL de Alibaba) antes de un uso comercial.
- Requiere compilar llama.cpp con CUDA y disponer de Python 3.10+; no se ofrece una imagen Docker ni un paquete listo para producción.

## Enlaces

- Hugging Face: https://huggingface.co/sanjeevafk/hybrid-edge-multimodal-lfm3-qwen2vl
- Modelo base del LLM: https://huggingface.co/AtomicChat/LFM3-1.7B-Uncensored-GGUF
- Modelo base del VLM: Qwen2-VL-2B-Instruct (no se proporciona URL específica en la información disponible)
- Repositorio llama.cpp: no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponible en la información proporcionada
