# glyd/Qwen3.8-Flash-Next-hummingbird

## Resumen

Qwen3.8-Flash-Next · Glyd Hummingbird es una compresión del modelo Qwen3.8-Flash-Next (180B parámetros totales según el autor de la ficha, 125B según la model card del modelo base citada en la misma) realizada por Glyd mediante su propio motor de inferencia. El objetivo es ejecutar un modelo de mezcla de expertos de gran tamaño en una única GPU de consumo de 16 GB junto con 64 GB de RAM, algo imposible con los formatos y motores convencionales. Es relevante porque demuestra una vía de despliegue local de modelos de escala frontera mediante compresión selectiva de expertos según su frecuencia de enrutamiento.

La compresión se aplica principalmente a los expertos (120,8B de parámetros), que se almacenan con precisión variable: los expertos más utilizados conservan más bits y los menos usados se comprimen más agresivamente. El modelo se distribuye en tres modos (precise, best y fast) con distintos niveles de fidelidad y velocidad, y requiere exclusivamente el motor propietario de Glyd, por lo que no es compatible con Transformers, vLLM ni llama.cpp.

Los pesos se publican en un formato propio del motor, no en safetensors estándar utilizable por otras herramientas. La licencia es la qwen-community-1.0, heredada del modelo base, lo que impone restricciones adicionales para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer con Gated DeltaNet y Qwen Sparse Attention; 48 capas, 512 expertos enrutados por capa (10 activos + 1 compartido por token) |
| Parametros totales | 180B (según el autor de la ficha); la model card del modelo base indica 125B en el MoE más 51B de embeddings n-gram y 4B de capa de predicción multi-token |
| Parametros activos | 6B por token (modelo base) |
| Longitud de contexto | 262.144 tokens (longitud nativa) |
| Tipos de cuantizacion | Compresión propietaria por experto: precise a 3 bits (mayoría) y 2 bits (resto), resto de pesos a 6 bits; best a 4 bits (expertos de mayor carga) y 3 bits (resto); fast a 2 bits por experto con empaquetado desde v0.2.2 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | Formato propio del motor Glyd (carpetas `model/`, `precise-v2/`, `best-v2/`, `fast/`); no compatible con Transformers, vLLM ni llama.cpp |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos con 48 capas, cada una con 512 expertos enrutados de los que se activan 10 más uno compartido por token, lo que resulta en 6B parámetros activos. Combina Gated DeltaNet con Qwen Sparse Attention para gestionar contextos largos de hasta 262.144 tokens. Incluye además una tabla de embeddings n-gram de 51B parámetros y una capa de predicción multi-token de 4B.

Glyd no reentrena el modelo: aplica una compresión selectiva sobre los pesos del modelo base. Los expertos se cuantizan según su frecuencia de uso (los más enrutados conservan más precisión), mientras que la atención, los embeddings y la tabla n-gram se almacenan a 6 bits. La inferencia se reparte entre GPU (expertos más utilizados), RAM (todos los expertos) y CPU (cálculo de los expertos no residentes en GPU en paralelo). El autor reporta divergencia KL frente a bf16 de 0,15 en wikitext-2 para precise, 0,12 para best y 0,39 para fast. No se dispone de información sobre los datos de entrenamiento originales ni sobre si el modelo base empleó RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento general, con modo de pensamiento desactivable (los benchmarks se ejecutaron con thinking off).
- Generación de código: el autor muestra un videojuego completo escrito en un solo prompt en una RTX 4080 SUPER.
- Razonamiento matemático (evaluado con GSM8K).
- Soporte de tool calling y function calling mediante APIs compatibles con OpenAI y Anthropic; desde v0.2.4 un `tool_choice` con nombre produce una única llamada.
- Procesamiento de imágenes (PNG y JPEG) a través de las APIs compatibles, con hasta 1.024 tokens por imagen por defecto (desde v0.2.3).
- Conversaciones multi-turno con reutilización de contexto: los mensajes de seguimiento se resuelven en menos de un segundo.
- Hasta 4 peticiones concurrentes (desde v0.2.3).
- Reparto de capas entre dos GPU mediante `GLYD_GPUS=0,1`.
- Capacidades multilingües: no disponible.

## Casos de uso

- Desarrollo de código en local: un desarrollador con una RTX 4080 SUPER puede generar aplicaciones completas (el autor documenta un shooter espacial escrito en un prompt) sin enviar código a servicios en la nube, usando el modo precise por su mejor comportamiento en código.
- Asistentes de programación integrados en IDE: el motor expone una API compatible con OpenAI en `http://127.0.0.1:8080/v1` y con Anthropic en `/v1/messages`, lo que permite conectar agentes de código existentes sin adaptadores.
- Análisis de documentos largos: con 262.144 tokens de contexto y un tiempo de lectura de 66 s para un prompt de 261.577 tokens en modo fast, es viable procesar repositorios, informes o libros completos en una sola pasada.
- Atención al cliente o asistentes conversacionales multi-turno: la reutilización de conversación hace que los turnos de seguimiento empiecen en menos de un segundo, adecuado para chat interactivo.
- Procesamiento de imágenes en local: extracción de información de capturas, diagramas o documentos escaneados mediante la entrada de imágenes de las APIs compatibles, sin salida de datos a terceros.
- Experimentación e investigación con modelos MoE de gran escala: permite estudiar el comportamiento de un modelo de 180B en hardware de consumo, comparando los tres modos de compresión con distintas divergencias KL.
- Despliegue en estaciones de trabajo con dos GPU: el reparto de capas con `GLYD_GPUS=0,1` permite usar dos RTX 4090 con salida idéntica byte a byte a una sola tarjeta.

## Benchmarks y rendimiento

Evaluaciones con Inspect AI, 150 preguntas por tarea, greedy, thinking off, límite de 3.072 tokens:

| Tarea | Precise | Best | Fast |
|---|---:|---:|---:|
| GSM8K | 148 / 150 | 147 / 150 | 149 / 150 |
| MMLU-Pro | 127 / 150 | 131 / 150 | 121 / 150 |

Calidad de compresión (divergencia KL frente a bf16 en wikitext-2):

| Modo | KL |
|---|---:|
| Precise | 0,15 |
| Best | 0,12 |
| Fast | 0,39 |

Velocidad en una RTX 4080 SUPER (16 GB), Ryzen 9 7950X3D y 64 GB de RAM, mediana de tres ejecuciones:

| Métrica | Precise | Best | Fast |
|---|---:|---:|---:|
| Escritura, prompt corto (tokens/s) | 91 | 79 | 113 |
| Escritura, prompt 4K (tokens/s) | 86 | 71 | 115 |
| Escritura, prompt 30K (tokens/s) | 91 | 76 | 131 |
| Primer token, prompt corto | 0,26 s | 0,33 s | 0,16 s |
| Primer token, prompt 4K | 1,9 s | 2,1 s | 1,3 s |
| Primer token, prompt 30K | 7,3 s | 7,4 s | 7,5 s |
| Lectura de prompt de 261.577 tokens | no disponible | no disponible | 66 s |

## Requisitos de hardware

- GPU NVIDIA RTX 30, 40 o 50 series (o superior), con 12 GB o más de VRAM (16 GB recomendados) y driver 580 o superior.
- RAM: 32 GB mínimo; 64 GB para los modos precise y best.
- Disco: unos 90 GB libres. El conjunto `model/` (37 GB) más `precise-v2/` (45 GB) suma 82 GB; con `best-v2/` (53 GB) son 90 GB; con `fast/` (29 GB) son 66 GB.
- Sistema operativo: Linux o Windows sobre x86-64. En Windows se usa `setup.ps1` en PowerShell; probado en máquinas AWS L4 con Windows Server 2022.
- VRAM estimada para inferencia: 12 GB como mínimo medido; 16 GB recomendados para el modo precise con expertos residentes en GPU.
- Despliegue: exclusivamente mediante el motor Glyd instalado con `setup.sh` desde el repositorio `surya-koritala/condor`. No es compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Throughput: 79-131 tokens/s en escritura según modo y longitud de prompt en una RTX 4080 SUPER; el rendimiento agregado con varios usuarios se mantiene cerca del de un solo usuario según el autor.
- Latencia de primer token: 0,16-0,33 s con prompts cortos y hasta 7,5 s con prompts de 30K tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Despliegue en GPU de consumo |
|---|---|---|---|---|
| Glyd Hummingbird (Qwen3.8-Flash-Next comprimido) | 180B totales / 6B activos | 262.144 | qwen-community-1.0 | Sí, desde 12 GB de VRAM con 32 GB de RAM |
| Qwen3.8-Flash-Next original | 125B MoE + 51B n-gram + 4B MTP | 262.144 | qwen-community-1.0 | No disponible en la información proporcionada |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona con GPU NVIDIA RTX 30 series o posteriores; no hay soporte para AMD, Intel ni Apple Silicon.
- Los pesos usan un formato propietario y solo cargan con el motor Glyd; no son utilizables con Transformers, vLLM, llama.cpp, Ollama ni TGI.
- El rendimiento agregado con varios usuarios concurrentes se mantiene cerca del de un único usuario, lo que limita el despliegue como servicio multiusuario.
- No hay soporte de vídeo.
- La compresión introduce pérdida de calidad medible: divergencia KL de 0,12 a 0,39 frente a bf16 según el modo; el modo fast es aproximadamente un 25% más rápido que precise pero con menor precisión.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones específicas de sesgos en la información disponible.
- La licencia qwen-community-1.0 impone condiciones adicionales para uso comercial que deben revisarse en el archivo LICENSE del repositorio antes de cualquier despliegue en producción.
- Idiomas soportados no documentados en la información disponible.
- El proyecto depende de un único motor propietario y de un repositorio GitHub externo; la continuidad y el mantenimiento del motor no están garantizados por la información disponible.
- El tamaño del repositorio (292,6 GB) incluye todas las variantes de modos; solo es necesario descargar `model/` y una carpeta de expertos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glyd/Qwen3.8-Flash-Next-hummingbird
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del motor y ejemplos: https://github.com/surya-koritala/condor
- Ejemplo Star Drift: https://github.com/surya-koritala/condor/tree/main/examples/star-drift
- Sitio de Glyd: https://getglyd.com
- Inspect AI (framework de evaluación): https://inspect.aisi.org.uk/
