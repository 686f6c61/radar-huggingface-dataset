# prithivMLmods/MiniMax-H3-Image-PE-NVFP4-GGUF

## Resumen

MiniMax-H3-Image-PE es el modelo de expansión de prompts del generador de imágenes MiniMax-H3-Image, desarrollado por MiniMax. Se trata de un ajuste fino del modelo base Qwen3.8-27B que transforma una petición breve del usuario en una descripción de imagen detallada y recomienda una relación de aspecto, devolviendo el resultado como JSON con los campos `expanded_caption` y `aspect_ratio`. La variante aquí descrita, publicada por el usuario prithivMLmods, es una cuantización NVFP4 en formato GGUF de 17 GB, optimizada para aceleradores NVIDIA Blackwell.

El modelo resuelve un problema concreto en pipelines de generación de imágenes: la brevedad y ambigüedad de los prompts humanos. Al expandir automáticamente la petición y fijar la relación de aspecto, mejora la coherencia entre la intención del usuario y la imagen generada. La salida está restringida a un esquema mediante XGrammar, lo que garantiza JSON válido sin necesidad de post-procesado.

Con 26.895.999.266 parámetros totales y un pipeline de tipo image-text-to-text, el modelo funciona con razonamiento activado por defecto (`reasoning_effort` xhigh, hasta 4.096 tokens incluyendo el razonamiento), que se devuelve por separado. La licencia es la MiniMax-H3-Image Community License Agreement, no Apache 2.0, aunque el modelo base Qwen3.8-27B sí lo es.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B), con proyección multimodal mmproj |
| Parametros totales | 26.895.999.266 (aproximadamente 27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el test run usa 8.192 tokens |
| Tipos de cuantizacion | NVFP4 (pesos principales), mmproj en formato propio de llama.cpp |
| Idiomas soportados | en (inglés) |
| Licencia | minimax-h3-image-community-license-agreement |
| Formato de pesos | GGUF (NVFP4) y mmproj GGUF; el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La model card indica que MiniMax-H3-Image-PE es un ajuste fino de Qwen3.8-27B, un transformer denso de aproximadamente 27B parámetros. El modelo incorpora una proyección multimodal (archivo `mmproj.gguf` de 931 MB) que habilita capacidades de visión, coherente con su pipeline image-text-to-text. La generación está restringida por XGrammar a un esquema JSON con los campos `expanded_caption` y `aspect_ratio`, lo que elimina la necesidad de validación posterior de la estructura.

El modelo opera con modo de razonamiento activado por defecto (`reasoning_effort` xhigh, máximo de 4.096 tokens incluyendo el razonamiento), y el razonamiento se devuelve en un canal separado de la salida final. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La cuantización NVFP4 fue realizada con llama.cpp por prithivMLmods y está optimizada para los Tensor Cores FP4 nativos de la arquitectura Blackwell (SM120, GB202, B200, B300).

## Capacidades

- Expansión de prompts para text-to-image: convierte una petición corta en una descripción detallada y devuelve JSON con `expanded_caption` y `aspect_ratio`.
- Salida estructurada garantizada mediante XGrammar, con esquema JSON fijo.
- Modo de razonamiento activado por defecto, con el razonamiento devuelto por separado.
- Capacidades de visión mediante la proyección multimodal mmproj (pipeline image-text-to-text).
- Soporte de edición de imágenes en desarrollo: la versión incluye únicamente un prompt de tarea y un ejemplo de ensamblado de mensajes para un modelo visión-lenguaje a elección del usuario; en modo edición describe qué se preserva y qué cambia, y devuelve `target_aspect_ratio`.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta soporte de tool calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Expansión automática de prompts en un pipeline text-to-image: el modelo recibe la petición breve del usuario y genera una `expanded_caption` detallada más una `aspect_ratio` recomendada, que se pasan directamente al generador MiniMax-H3-Image sin intervención manual.
- Interfaz de usuario de generación de imágenes: al devolver JSON validado por esquema, la respuesta puede consumirse directamente por el frontend para mostrar la descripción expandida y la relación de aspecto antes de generar la imagen.
- Preprocesado por lotes de catálogos de prompts: dado un conjunto de peticiones cortas, el modelo las expande de forma consistente, útil para equipos que necesitan normalizar la calidad de los prompts en producción.
- Control de composición por relación de aspecto: la recomendación de `aspect_ratio` permite que el pipeline seleccione automáticamente el encuadre adecuado (retrato, paisaje, cuadrado) según el contenido de la petición.
- Edición de imágenes asistida (en desarrollo): el modelo puede describir qué se preserva y qué se modifica en una edición y devolver el `target_aspect_ratio`, integrándose con un modelo visión-lenguaje externo para el ensamblado de mensajes.
- Despliegue local en estaciones de trabajo Blackwell: con 17 GB de pesos NVFP4 y un pico de 14,94 GiB de VRAM en el test run, puede ejecutarse en una RTX PRO 6000 o en GPUs de la serie RTX 50 con suficiente memoria, sin depender de servicios en la nube.
- Servicio de inferencia con SGLang: la model card indica compatibilidad con SGLang 0.5.23 o posterior, lo que permite desplegarlo como servicio HTTP en infraestructura con GPUs Blackwell.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente incluye métricas de inferencia del test run con `llama-cli`:

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 326,89 tokens/s |
| Velocidad media de generación | 74,94 tokens/s |
| Tiempo total de pared | 77,5 s |
| Longitud de contexto usada | 8.192 tokens |
| Tipo de KV cache (K) | q8_0 |
| GPU | NVIDIA RTX PRO 6000 Blackwell Server Edition |
| VRAM de la GPU | 96 GB |
| Pico de VRAM usada | 14,94 GiB |
| Utilización pico de GPU | 96% |
| Capas offloaded | 99 (`-ngl 99`) |
| Semilla | 42 |
| Decodificación especulativa | No |
| Repeticiones del test | 5 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19 GiB según la model card para la ruta de Modular Diffusers con pesos FP4; el test run con llama.cpp reporta un pico de 14,94 GiB con contexto de 8.192 tokens y KV cache q8_0.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell, B200, B300 y GPUs de la serie RTX 50 (arquitectura Blackwell, SM120/GB202), que disponen de Tensor Cores FP4 nativos.
- Cabe en GPU de consumo: sí, en GPUs Blackwell de gama alta con al menos 16-24 GB de VRAM; en GPUs sin soporte FP4 nativo el rendimiento será inferior y puede requerir conversión a otro formato.
- Opciones de despliegue: llama.cpp (`llama-cli`, con `-ngl 99` para offload completo), SGLang 0.5.23 o posterior, y bloques de Modular Diffusers (que ejecutan las activaciones en bf16, con salidas ligeramente distintas a las de SGLang).
- Throughput estimado: 326,89 tokens/s de procesamiento de prompt y 74,94 tokens/s de generación en RTX PRO 6000 Blackwell con la configuración del test run; el rendimiento real varía según prompt, build y ajustes de runtime.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia estructural, el modelo base Qwen3.8-27B (Apache 2.0) comparte los 27B parámetros y la arquitectura, pero no está especializado en expansión de prompts ni incluye la proyección multimodal de esta variante.

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| MiniMax-H3-Image-PE-NVFP4-GGUF | ~27B | no disponible | MiniMax-H3-Image Community License | Expansion de prompts para text-to-image |
| Qwen3.8-27B (base) | ~27B | no disponible | Apache 2.0 | Modelo generalista |
| Otros modelos de expansion de prompts | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia es la MiniMax-H3-Image Community License Agreement, no Apache 2.0; algunos usos requieren autorización escrita adicional de MiniMax, por lo que es imprescindible revisar el texto completo antes de un uso comercial.
- El soporte de edición de imágenes está explícitamente marcado como en desarrollo; en ese modo solo se proporciona un prompt de tarea y un ejemplo de ensamblado de mensajes para un modelo visión-lenguaje externo.
- El modelo está orientado a la expansión de prompts para text-to-image; no es un generador de imágenes ni un modelo de propósito general.
- Idiomas soportados limitados al inglés según la model card.
- El razonamiento está activado por defecto con `reasoning_effort` xhigh y hasta 4.096 tokens, lo que incrementa la latencia y el consumo de tokens frente a una generación directa.
- La cuantización NVFP4 está optimizada para hardware Blackwell; en GPUs sin soporte FP4 nativo el rendimiento puede degradarse y los resultados pueden diferir de la ruta SGLang.
- La ruta de Modular Diffusers ejecuta activaciones en bf16, por lo que sus salidas difieren ligeramente de las del despliegue con SGLang.
- No se han publicado benchmarks de calidad en la información disponible, lo que dificulta evaluar su rendimiento frente a alternativas.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; al tratarse de un modelo derivado de Qwen, hereda los sesgos del corpus de entrenamiento del base, no detallado en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/prithivMLmods/MiniMax-H3-Image-PE-NVFP4-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image-PE
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del cuantizador: https://huggingface.co/prithivMLmods
