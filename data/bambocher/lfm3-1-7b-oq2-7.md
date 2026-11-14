# bambocher/LFM3-1.7B-oQ2.7

## Resumen

LFM3-1.7B-oQ2.7 es una versión cuantizada del modelo LFM3 de 1.700 millones de parámetros (1.728.801.536 pesos reales según los safetensors), publicada por el usuario bambocher en Hugging Face. Se trata de una cuantización de precisión mixta generada con la herramienta oQ (oMLX v0.7.3), que combina capas en 3, 4, 5 y 8 bits con un promedio efectivo de 3,351 bits por peso. El checkpoint completo ocupa 0,675 GiB, lo que lo hace apto para ejecución en hardware con memoria unificada limitada.

El modelo base pertenece a la familia LFM3 (probablemente Liquid AI, aunque la model card no lo confirma) y este artefacto está empaquetado exclusivamente para MLX, la librería de Apple para inferencia en silicio Apple. No se trata de un modelo entrenado desde cero, sino de una redistribución cuantizada del original, por lo que sus capacidades dependen enteramente del checkpoint de origen.

La relevancia de esta ficha es acotada: el repositorio no incluye model card descriptiva del modelo base, no declara licencia, idiomas ni pipeline, y presenta cero descargas y cero likes en el momento de la consulta. Es un artefacto técnico de interés para quien quiera ejecutar LFM3 en un Mac con MLX a muy bajo coste de memoria, pero no un modelo con documentación suficiente para producción sin verificar el original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3; la model card no especifica transformer, MoE ni SSM) |
| Parametros totales | 1.728.801.536 (1,729B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta oQ: affine 3-bit grupo 128 (82,93%), affine 3-bit grupo 64 (15,16%), affine 4-bit grupo 64 (0,91%), affine 5-bit grupo 64 (0,06%), affine 8-bit grupo 64 (0,91%), BF16 (0,02%); promedio efectivo 3,351 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx, requiere custom_code) |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura del modelo base en la documentación proporcionada. El tag `lfm3` sugiere la familia LFM3, pero la model card no describe si se trata de un transformer denso, un modelo híbrido o una arquitectura state-space. Tampoco se documentan datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento.

Lo único documentado es el proceso de cuantización. La herramienta oQ (oMLX v0.7.3) aplica cuantización de precisión mixta: asigna 3 bits con grupo de 128 a la mayor parte de los pesos (82,93%), 3 bits con grupo de 64 a un 15,16%, y reserva 4, 5 y 8 bits para fracciones pequeñas (0,91%, 0,06% y 0,91% respectivamente), dejando un 0,02% en BF16. El resultado es un checkpoint de 0,675 GiB con 3,351 bits efectivos por peso, lo que reduce el tamaño aproximadamente 4,8 veces respecto a un almacenamiento BF16 de 16 bits. El repositorio incluye `custom_code`, lo que implica que la carga requiere confiar en código remoto o revisarlo previamente.

## Capacidades

- No se documentan capacidades específicas en la información disponible.
- Al ser una cuantización del modelo LFM3, hereda las capacidades del original, pero estas no están descritas en la model card.
- No se confirma soporte de tool calling, function calling ni razonamiento multi-paso.
- No se confirma soporte multilingüe ni idiomas concretos.
- No se confirma modo thinking, visión, audio ni otras modalidades.
- La única capacidad verificable es la ejecución de inferencia de lenguaje mediante MLX con pesos cuantizados.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 0,675 GiB permite cargar el modelo en equipos Apple Silicon con 8 GB o 16 GB de RAM unificada, dejando margen para el contexto y el runtime de MLX.
- Pruebas de cuantización extrema: útil para evaluar la degradación de calidad de un modelo de 1,7B a 3,351 bits efectivos frente al checkpoint original en BF16.
- Prototipado rápido en portátiles: al ocupar menos de 1 GB en disco, se puede distribuir y versionar con facilidad en entornos de desarrollo con MLX instalado.
- Evaluación comparativa de esquemas oQ: sirve como referencia para medir el impacto de la distribución mixta de bits (3/4/5/8) en tareas concretas.
- Experimentación académica con modelos pequeños cuantizados: permite reproducir experimentos en hardware de consumo sin GPU dedicada.
- Despliegue de bajo consumo en entornos Apple: para aplicaciones de generación de texto no crítica donde el coste de memoria prima sobre la fidelidad máxima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: en torno a 0,7 GB solo para pesos; con overhead de MLX, KV cache y contexto, se recomienda un mínimo de 4-6 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) por el uso de MLX; no es ejecutable de forma nativa en CUDA sin reconversión.
- Cabe en GPU de consumo: sí, en cualquier Mac con 8 GB o más de memoria unificada; no está pensado para GPUs NVIDIA/AMD.
- Opciones de despliegue: MLX (librería `mlx`), con dependencia de `custom_code` del repositorio; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-oQ2.7 (este) | 1,729B | no disponible | oQ mixta 3,351 bits/peso | no disponible | safetensors (MLX) |
| Modelo base LFM3-1.7B | 1,729B (presumible) | no disponible | BF16 (presumible) | no disponible | no disponible |
| Alternativas de ~1,7B (p. ej. Qwen2.5-1.5B, SmolLM2-1.7B) | ~1,5-1,7B | 32K en Qwen2.5-1.5B; no disponible para SmolLM2 en esta ficha | múltiples (GGUF, AWQ, etc.) | Apache 2.0 en Qwen2.5; Apache 2.0 en SmolLM2 | safetensors, GGUF |

La comparativa con alternativas concretas es limitada porque no se dispone de datos de rendimiento del modelo base ni de la versión cuantizada. La diferencia principal frente a otras alternativas de tamaño similar es el ecosistema: este checkpoint solo funciona con MLX, mientras que Qwen2.5-1.5B y SmolLM2-1.7B tienen soporte amplio en llama.cpp, vLLM y Ollama.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide confirmar si el uso comercial está permitido; hay que verificar la licencia del modelo base LFM3 antes de cualquier despliegue.
- No se documentan idiomas soportados; el comportamiento multilingüe es desconocido.
- No hay información sobre sesgos del modelo base ni sobre el impacto de la cuantización a 3,351 bits en sesgos o alucinaciones.
- La cuantización agresiva (82,93% de pesos a 3 bits) puede degradar la coherencia y la precisión en tareas de razonamiento o código; no se han publicado evaluaciones que lo cuantifiquen.
- El repositorio incluye `custom_code`, lo que implica ejecutar código remoto al cargar el modelo; conviene auditar los archivos antes de usarlo en producción.
- El modelo está atado a MLX y Apple Silicon; no es portable a CUDA sin reconversión manual.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- No se dispone de información sobre la longitud de contexto, lo que impide planificar aplicaciones con ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/LFM3-1.7B-oQ2.7
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base LFM3: no disponible en la información proporcionada
- Paper, blog o demo del modelo base: no disponible en la información proporcionada
