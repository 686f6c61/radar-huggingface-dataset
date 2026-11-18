# ahmedihamdy/Ornith-1.5-35B-A3B-MLX-8bit-vision-astro-atlas-streaming

## Resumen

Ornith-1.5-35B-A3B-MLX-8bit-vision-astro-atlas-streaming es una redistribución del modelo multimodal Ornith-1.5-35B-A3B (base Qwen 3.5 MoE) en un formato de fichero propietario denominado Astro Atlas, creado por ahmedihamdy para la aplicación Astronomical, una app de código abierto para macOS que ejecuta modelos de IA más grandes que la memoria disponible. El modelo conserva los pesos originales byte a byte, sin recuantizar, pero reorganiza los expertos del MoE en registros contiguos de 3,2 MB alineados a 16 KiB para permitir lecturas directas desde el SSD de un Mac con Apple Silicon.

El modelo subyacente es un transformer de mezcla de expertos (MoE) con 35 000 millones de parámetros totales y 3000 millones de parámetros activos por token (8 de 256 expertos en cada una de las 40 capas), más una torre de visión de 27 bloques y 447 millones de parámetros en bf16. El formato Astro Atlas permite ejecutar el modelo completo (35,15 GB) en Macs con tan solo 10 GB de memoria asignada al modelo, leyendo los expertos desde el SSD a medida que se necesitan.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de streaming de expertos que reduce los requisitos de memoria en un factor de ~3,5× para modelos MoE en hardware Apple; por otro lado, el modelo base está especializado en dominios astronómicos (según los tags astronomical y astro-atlas), lo que lo hace interesante para aplicaciones científicas de visión y texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen 3.5 MoE) con torre de visión |
| Parametros totales | 35B (35 000 millones) |
| Parametros activos | 3B (8 de 256 expertos por capa, 40 capas) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (expertos y routers); bf16 en torre de visión |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | Astro Atlas (manifest.json + experts/layer-XXX.atlas + resident.safetensors + optiq/optiq_vision.safetensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 40 capas, 256 expertos por capa y 8 expertos activos por token, lo que resulta en 3000 millones de parámetros activos sobre un total de 35 000 millones. La torre de visión consta de 27 bloques con 447 millones de parámetros en bf16, integrada en un fichero separado (`optiq/optiq_vision.safetensors`). El formato Astro Atlas reorganiza los pesos de cada experto en un único registro contiguo de 3,2 MB (frente a los nueve fragmentos dispersos del checkpoint original), alineado a 16 KiB para lecturas directas desde el SSD sin pasar por la caché de ficheros de macOS. Los pesos de atención, router y embeddings que permanecen en memoria se agrupan en `resident.safetensors`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La model card indica que los pesos no se han recuantizado: los expertos y routers mantienen la cuantización 8-bit original de ornith-ai. La integridad se verificó mediante comparación byte a byte de cada experto, huellas SHA-256 en `manifest.json` y una prueba de generación determinista con una petición de 10 000 tokens que produjo la misma respuesta de 359 tokens en seis ejecuciones.

## Capacidades

- Generación de texto conversacional en inglés.
- Comprensión de imágenes y texto (pipeline image-text-to-text): la torre de visión lee títulos, eslóganes y direcciones web en imágenes.
- Razonamiento multimodal: puede describir y analizar el contenido de una imagen junto con una pregunta textual.
- Ejecución en memoria limitada: streaming de expertos desde SSD con un mínimo de 10 GB de memoria asignada.
- Inferencia en Apple Silicon mediante la app Astronomical (MLX).
- Capacidad de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Análisis de imágenes astronómicas en un Mac: el modelo puede recibir una captura de telescopio o un diagrama y responder preguntas sobre su contenido, gracias a la torre de visión de 447M de parámetros y al pipeline image-text-to-text.
- Asistencia a investigadores con hardware limitado: un investigador con un Mac de 16 GB puede ejecutar un modelo de 35B asignando 10 GB al modelo y dejando que Astronomical lea los expertos desde el SSD, obteniendo 16,7 tokens/s.
- Procesamiento de documentación científica multimodal: el modelo puede leer figuras, tablas e imágenes de papers y generar descripciones textuales, útil para indexación o resumen de literatura.
- Prototipado de aplicaciones de visión por computador en local: al ejecutarse íntegramente en el Mac sin conexión, es adecuado para datos sensibles que no deben salir del dispositivo.
- Evaluación de técnicas de streaming de MoE: el repositorio sirve como caso de estudio reproducible para medir el impacto del layout de ficheros en el rendimiento de inferencia con memoria limitada.
- Generación de respuestas conversacionales de contexto largo: con una ventana de contexto no especificada pero capaz de procesar prompts de 10 000 tokens según las pruebas del autor, puede usarse para resumir o responder sobre documentos extensos acompañados de imágenes.
- Despliegue en entornos educativos o de demostración: al ser MIT y ejecutarse en hardware de consumo Apple, permite mostrar modelos MoE multimodales sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son las tasas de generación medidas por el autor en un Mac con Apple Silicon, con la caché de ficheros de macOS vaciada y una petición de 10 000 tokens:

| Memoria asignada | Astro Atlas (tokens/s) | Layout estándar (tokens/s) | Mejora |
|---|---|---|---|
| 10 GB | 16,7 (60 ms/token) | 12,1 (82 ms/token) | 1,37× |
| 20 GB | 23,7 (42 ms/token) | 16,8 (59 ms/token) | 1,41× |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el modelo completo ocupa 35,15 GB; con streaming de expertos puede ejecutarse con 10 GB de memoria asignada (dos tercios de los pesos permanecen en SSD) o 20 GB para mejor throughput.
- GPU recomendadas: Apple Silicon (M-series) con la app Astronomical; no se mencionan GPU NVIDIA ni AMD en la información disponible.
- ¿Cabe en GPU de consumo? El formato está diseñado específicamente para Apple Silicon con memoria unificada; en GPUs de consumo convencionales (RTX 4090, 24 GB) no cabría completo en 8-bit, y no se documenta soporte para ellas.
- Opciones de despliegue: Astronomical (app de código abierto para macOS) con su lector C++ de expertos; la versión con lector directo llega después de la 0.2.117. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 60 ms/token con 10 GB de memoria y 42 ms/token con 20 GB, medidos en generación de una respuesta a un prompt de 10 000 tokens.
- Almacenamiento: se requiere un SSD con al menos 35,15 GB libres y velocidad suficiente para sostener las lecturas de expertos (3,2 MB por experto, 8 expertos por capa, 40 capas).

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato/plataforma |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-MLX-8bit-vision-astro-atlas-streaming | 35B | 3B | no disponible | MIT | Astro Atlas / Astronomical (Apple Silicon) |
| Ornith-1.5-35B-A3B-MLX-8bit-vision (stock) | 35B | 3B | no disponible | MIT | safetensors MLX / Astronomical |
| Qwen 3.5 MoE (base genérica) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; no se declaran otros idiomas.
- Es una redistribución de formato, no un modelo nuevo: hereda los sesgos y limitaciones del modelo base Ornith-1.5-35B-A3B, sobre los que no se aporta información.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de fidelidad factual.
- La licencia MIT permite uso comercial, pero el modelo base y sus componentes podrían tener condiciones adicionales no reflejadas en esta ficha.
- El rendimiento óptimo depende de la app Astronomical en versión posterior a 0.2.117; versiones anteriores cargan el Atlas por una ruta más lenta.
- El streaming desde SSD introduce latencia dependiente del almacenamiento: con 10 GB de memoria se obtienen 16,7 tokens/s, lo que puede ser insuficiente para aplicaciones interactivas exigentes.
- No hay soporte documentado para GPUs NVIDIA, CUDA ni servidores Linux; el despliegue está atado a macOS y Apple Silicon.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- La longitud de contexto no está especificada; las pruebas del autor usan prompts de 10 000 tokens, pero no se confirma el máximo soportado.

## Enlaces

- Hugging Face: https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-MLX-8bit-vision-astro-atlas-streaming
- Modelo base (stock): https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-MLX-8bit-vision
- Organización ornith-ai: https://huggingface.co/ornith-ai
- Astronomical (app): https://getastronomical.com
