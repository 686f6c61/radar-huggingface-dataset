# mlx-community/Holo-3.1-4B-4bit

## Resumen

Holo-3.1-4B-4bit es la versión cuantizada a 4 bits del modelo multimodal Holo-3.1-4B desarrollado por H Company, convertida al formato MLX por el equipo de mlx-community para su ejecución eficiente en hardware Apple Silicon. El modelo original es un sistema image-text-to-text especializado en "computer use" y agentes GUI: recibe capturas de pantalla y devuelve acciones estructuradas (por ejemplo, coordenadas de clic) para automatizar la interacción con interfaces gráficas.

La arquitectura subyacente es de tipo Qwen3.5 (según el tag `qwen3_5` del repositorio), con un total de 4.539.265.536 parámetros. Incluye una torre de visión que en esta conversión se mantiene en bfloat16, mientras que las capas de atención, DeltaNet, MLP, embeddings y lm_head se cuantizan a 4 bits con tamaño de grupo 64. El resultado es un repositorio de 3,0 GB que cabe holgadamente en la memoria unificada de un Mac moderno.

Su relevancia radica en que permite ejecutar localmente, en un portátil con Apple Silicon, un agente visual capaz de localizar elementos en pantalla con una precisión del 85,8 % en el benchmark WebClick, apenas 0,8 puntos por debajo de la versión en bfloat16. La licencia Apache-2.0 del modelo original se preserva en esta conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5 (tag `qwen3_5`), con capas de atención, DeltaNet y MLP; torre de visión en bfloat16 |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits afín (affine), tamaño de grupo 64; visión en bfloat16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Holo-3.1-4B emplea una arquitectura multimodal con un codificador visual y un decodificador de lenguaje basado en Qwen3.5. La presencia de capas DeltaNet en la descripción de la cuantización sugiere un diseño híbrido que combina mecanismos de atención con capas de estado lineal, orientado a eficiencia en secuencias largas. La torre de visión procesa capturas de pantalla y el modelo genera respuestas estructuradas, como coordenadas de clic normalizadas en el rango [0, 1000].

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card de esta conversión remite a la model card original de Hcompany/Holo-3.1-4B para los detalles de entrenamiento, que no se incluyen aquí. La innovación destacable de esta versión es la conversión a MLX con cuantización selectiva: se cuantizan atención, DeltaNet, MLP, embeddings y lm_head a 4 bits, pero se preserva la torre de visión en bfloat16, lo que mantiene la calidad de percepción visual.

## Capacidades

- Generación de texto e imagen-a-texto (pipeline `image-text-to-text`).
- Localización de elementos en interfaces gráficas: devuelve coordenadas de clic en el rango [0, 1000] a partir de una captura de pantalla.
- Agentes GUI y "computer use": interpretación de pantallas para ejecutar acciones de interacción.
- Razonamiento multi-paso orientado a agentes (tag `agent`).
- Soporte de modo thinking, que puede desactivarse (`enable_thinking=False`) para respuestas directas de localización.
- Procesamiento de múltiples imágenes en un mismo prompt (validado con 3 capturas de 1920x1080, unas 12k tokens de prompt).
- Capacidades multilingües limitadas al inglés según los metadatos del repositorio.
- No se documenta soporte explícito de tool calling ni function calling en la información disponible.

## Casos de uso

- Automatización de pruebas de interfaz: el modelo localiza botones y campos en capturas de pantalla y devuelve coordenadas para que un framework de testing (Playwright, Appium) ejecute clics, sustituyendo selectores frágiles por percepción visual.
- Agentes de navegación web: dado un objetivo en lenguaje natural y una captura de la página, el modelo identifica el elemento a pulsar, lo que permite construir agentes que operan portales sin API.
- Asistentes de accesibilidad: un usuario con discapacidad visual puede señalar verbalmente un elemento y el sistema traduce la petición en coordenadas sobre la pantalla capturada.
- RPA (automatización robótica de procesos) en escritorio: integración en flujos que operan aplicaciones legacy sin accesibilidad expuesta, usando la captura de pantalla como única interfaz.
- Ejecución local en Mac para prototipado de agentes: con 4,9 GB de pico de memoria y 166 tok/s de decodificación en un M5 Max, permite iterar sobre pipelines de computer use sin depender de la nube.
- Extracción de información de formularios y paneles: el modelo puede localizar campos concretos en capturas de aplicaciones de gestión (calendarios, CRM) para automatizar la introducción de datos.
- Moderación y verificación de UI: comparar capturas de pantalla antes y después de un despliegue para detectar desplazamientos de elementos mediante localización de coordenadas.

## Benchmarks y rendimiento

Resultados publicados en la model card de esta conversión sobre el benchmark WebClick (Hcompany/WebClick, Apache-2.0, 1639 muestras, protocolo de localización oficial de H Company, thinking desactivado, greedy, 32 tokens nuevos):

| Modelo | Precisión | IC 95 % |
|---|---|---|
| MLX bf16 | 86,6 % | 84,8 – 88,1 |
| MLX 8bit | 86,5 % | 84,7 – 88,0 |
| MLX 4bit (este modelo) | 85,8 % | 84,0 – 87,4 |

Desglose por subconjunto (este modelo): agentbrowse 91,4 % (n=590), calendars 79,4 % (n=528), humanbrowse 86,0 % (n=521). La diferencia de 4 bits frente a bf16 es de -0,8 puntos (test exacto emparejado, p = 0,24).

Rendimiento medido en Apple M5 Max, 128 GB, petición única, greedy:

| Motor | 1280x720: primer token / decodificación | 1920x1080: primer token / decodificación | Memoria |
|---|---|---|---|
| MLX, este modelo (4bit) | 379 ms / 166 tok/s | 869 ms / 168 tok/s | 4,9 GB (pico) |

Con prompt largo de 3 capturas a 1920x1080 (unos 12k tokens de prompt, 1024 tokens generados): 3,8 s hasta el primer token, 145 tok/s de decodificación, 5,2 GB de pico. Las capturas de 1080p suponen 2221 tokens de prompt y las de 720p, 1061.

## Requisitos de hardware

- VRAM/memoria estimada: 4,9 GB de pico para una captura de 720p o 1080p; 5,2 GB de pico con tres capturas de 1080p (medido en MLX).
- Hardware recomendado: Apple Silicon con memoria unificada suficiente; las pruebas se realizaron en un M5 Max de 128 GB. Cualquier Mac con al menos 8 GB de memoria unificada debería poder cargar el modelo, aunque no se han publicado mediciones en ese hardware.
- GPU consumer: no se documenta soporte CUDA en esta conversión; está pensada para MLX (Apple Silicon). Para GPUs NVIDIA habría que usar la versión original en safetensors con vLLM o similar, no cubierta en esta información.
- Opciones de despliegue: `mlx-vlm` 0.8.0 (CLI `python -m mlx_vlm.generate` o API de Python `load`/`generate`), con `mlx` 0.32.4.
- Latencia y throughput: primer token de 379 ms (720p) y 869 ms (1080p); decodificación de 166–168 tok/s; con prompt largo, 3,8 s hasta el primer token y 145 tok/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WebClick | Licencia | Formato |
|---|---|---|---|---|---|
| Holo-3.1-4B-4bit (este) | 4,54 B | no disponible | 85,8 % | Apache-2.0 | MLX safetensors 4 bits |
| Holo-3.1-4B (original bf16) | 4,54 B | no disponible | 86,6 % (MLX bf16) | Apache-2.0 | safetensors bf16 |
| Holo-3.1-4B MLX 8bit | 4,54 B | no disponible | 86,5 % | Apache-2.0 | MLX safetensors 8 bits |

No se dispone de datos de otros modelos comparables (por ejemplo, alternativas de computer use de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: el modelo está etiquetado únicamente para inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Longitud de contexto: no se publica en la información disponible, lo que impide garantizar escenarios de muchas capturas o conversaciones largas más allá de los ~12k tokens de prompt validados.
- Precisión de localización: la tasa de acierto es del 85,8 % global, con un mínimo del 79,4 % en el subconjunto de calendarios; en producción conviene incluir verificación y reintentos.
- Riesgo de alucinación: como modelo generativo, puede devolver coordenadas plausibles pero incorrectas, especialmente en interfaces densas o con elementos similares.
- Sesgos: no se documentan análisis de sesgos en la información proporcionada; al entrenarse sobre capturas de pantalla, puede heredar sesgos de las interfaces y datos de origen.
- Licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar la model card original de Hcompany/Holo-3.1-4B para condiciones adicionales del modelo base.
- Plataforma: esta conversión es específica de MLX; no es directamente utilizable en CUDA, vLLM o llama.cpp.
- Validación limitada: el repositorio registra 0 descargas y 0 likes, y las pruebas de clic descritas son smoke tests sobre capturas sintéticas; los tiempos marcados con variabilidad superior al 10 % deben tomarse como indicativos.
- Formato de salida: las coordenadas se expresan en el rango [0, 1000], por lo que es necesario reescalarlas a la resolución real de la pantalla.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlx-community/Holo-3.1-4B-4bit
- Modelo base: https://huggingface.co/Hcompany/Holo-3.1-4B
- H Company: https://www.hcompany.ai/
- Documentación de localización de elementos: https://hub.hcompany.ai/models-api/element-localization
- Dataset WebClick: https://huggingface.co/datasets/Hcompany/WebClick
- Librería mlx-vlm: https://pypi.org/project/mlx-vlm/
