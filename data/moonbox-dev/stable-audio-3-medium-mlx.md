# moonbox-dev/stable-audio-3-medium-MLX

## Resumen

Stable Audio 3 Medium MLX es una conversión al framework MLX de Apple del modelo Stable Audio 3 Medium de Stability AI, publicada por el usuario moonbox-dev. El modelo original es un sistema de generación de audio y música a partir de descripciones textuales (text-to-audio y text-to-music) basado en difusión, orientado a la síntesis de efectos de sonido, fragmentos musicales y paisajes sonoros. Esta versión MLX tiene como objetivo permitir la inferencia nativa en equipos con Apple Silicon, aprovechando la aceleración por GPU unificada de los chips M-series.

La aportación de esta ficha no es un modelo nuevo, sino una reimplementación cuantizada en MLX de un modelo existente. El repositorio incluye cuatro builds de precisión (8 bits, 6 bits, 4 bits y presumiblemente fp16, aunque la información disponible solo detalla los tres primeros) con los componentes separados: codificador de texto (text_encoder), acondicionador (conditioner), transformador de difusión (dit), decodificador (decoder) y tokenizador. El tamaño total del repositorio es de 6,2 GB.

La relevancia de esta conversión radica en que acerca la generación de audio de alta calidad a desarrolladores que trabajan en macOS sin acceso a GPUs NVIDIA, un nicho tradicionalmente desatendido por los pipelines de difusión de audio. No obstante, el proyecto es muy reciente (creado en noviembre de 2026), no tiene descargas ni likes, y su licencia es la comunitaria de Stable Audio, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión (modelo de difusión latente con transformador, según la nomenclatura del repositorio: `dit`, `decoder`, `text_encoder`, `conditioner`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la longitud se refiere a duración de audio generado, no especificada) |
| Tipos de cuantizacion | 8 bits, 6 bits, 4 bits (MLX); presumiblemente fp16 en el modelo base |
| Idiomas soportados | no disponibles (el prompt textual se procesa mediante un codificador de texto; no se detalla cobertura lingüística) |
| Licencia | stable-audio-community (licencia comunitaria de Stability AI, con restricciones comerciales) |
| Formato de pesos | safetensors (MLX), con `config.json`, `mlx_model.py` y `tokenizer.model` |
| Tamano del repositorio | 6,2 GB |
| Modelo base | stabilityai/stable-audio-3-medium |
| Libreria | mlx |
| Pipeline | text-to-audio |

## Arquitectura y entrenamiento

El modelo base Stable Audio 3 Medium es un sistema de difusión para generación de audio. La estructura del repositorio MLX revela sus componentes: un codificador de texto (`text_encoder.safetensors`, 563,2 MB), un acondicionador (`conditioner.safetensors`, 0,8 MB), un transformador de difusión (`dit.safetensors`, entre 1,29 GB en 6 bits y 1,63 GB en 8 bits), un decodificador (`decoder.safetensors`, 1,70 GB) y un tokenizador (`tokenizer.model`, 4,2 MB). Esta separación es típica de los pipelines de difusión latente para audio, donde el `dit` opera en el espacio latente y el `decoder` reconstruye la forma de onda.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio MLX no documenta el proceso de entrenamiento del modelo original, solo la conversión. La innovación técnica destacable de esta publicación es la cuantización a 8, 6 y 4 bits con validación numérica frente al modelo PyTorch original: se reportan métricas de similitud (coseno de latentes, error log-mel en dB, SNR y puntuación CLAP) para cada precisión, lo que permite evaluar el compromiso entre tamaño y fidelidad. En 8 bits, la similitud coseno de latentes es ≥ 0,995 y el SNR de 17-30 dB; en 6 bits baja a coseno ≥ 0,963 y SNR 8-20 dB; en 4 bits el autor marca el build como experimental y por debajo del umbral de calidad (coseno 0,82-0,97, SNR 1-9 dB).

## Capacidades

- Generación de audio a partir de texto (text-to-audio): efectos de sonido, ambientes y paisajes sonoros.
- Generación de música a partir de texto (text-to-music): fragmentos musicales descritos mediante prompt.
- Generación de efectos de sonido (sound effects) según los tags del repositorio.
- Inferencia nativa en Apple Silicon mediante MLX, con builds cuantizados en 8, 6 y 4 bits.
- Control de fidelidad mediante selección de precisión: el usuario puede elegir entre calidad (8 bits) y ahorro de memoria (6 o 4 bits, este último experimental).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada (no es un modelo multimodal de comprensión, sino generativo de audio).
- Capacidades multilingües: no disponibles; no se especifica qué idiomas acepta el codificador de texto.

## Casos de uso

- Producción musical asistida en macOS: un compositor puede generar borradores de fragmentos musicales a partir de descripciones textuales directamente en un Mac con Apple Silicon, sin depender de servicios en la nube, gracias a la conversión MLX.
- Diseño de efectos de sonido para videojuegos: el modelo permite generar variaciones de efectos (pasos, impactos, ambientes) mediante prompts, y la build de 6 bits reduce el uso de memoria para iterar rápidamente en un portátil.
- Prototipado de paisajes sonoros para cine o podcast: se pueden generar ambientes de fondo (lluvia, bosque, ciudad) con contexto textual, y la build de 8 bits ofrece la mayor fidelidad para mezclas finales.
- Generación de audio en local para privacidad: al ejecutarse íntegramente en el dispositivo con MLX, los prompts y el audio no salen del equipo, lo que resulta adecuado para contenido confidencial.
- Investigación en difusión de audio: el repositorio separa los componentes (`dit`, `decoder`, `text_encoder`), lo que facilita experimentos con el transformador de difusión o el decodificador de forma aislada en MLX.
- Pruebas de concepto en entornos sin GPU NVIDIA: desarrolladores que solo disponen de un Mac pueden evaluar la generación de audio sin montar infraestructura CUDA, usando la build de 6 bits como compromiso entre calidad y recursos.
- Docencia y demostraciones: la build de 4 bits, aunque experimental, permite ejecutar el pipeline en equipos con menos memoria para demostraciones, aceptando la pérdida de calidad documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye métricas de fidelidad de la cuantización frente al modelo PyTorch original, que se resumen a continuación:

| Precision | Coseno de latentes | Error log-mel | SNR | CLAP vs fp16 | Coincidencia de prompt |
|---|---|---|---|---|---|
| 8 bits | ≥ 0,995 | 0,26-0,82 dB | 17-30 dB | 0,972-0,990 | 0,61 |
| 6 bits | ≥ 0,963 | 0,60-1,65 dB | 8-20 dB | 0,943-0,988 | 0,61 |
| 4 bits (experimental) | 0,82-0,97 | 2,1-3,9 dB | 1-9 dB | 0,967-0,986 | 0,62 |

No se proporcionan resultados de benchmarks estándar de generación de audio (como FAD, KL, o evaluaciones subjetivas) para el modelo base ni para esta conversión.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia, el repositorio completo pesa 6,2 GB, pero cada build ocupa menos: la build de 8 bits suma aproximadamente 0,8 MB (conditioner) + 1,70 GB (decoder) + 1,63 GB (dit) + 563,2 MB (text_encoder) + 4,2 MB (tokenizer) ≈ 3,9 GB en disco; la de 6 bits ≈ 3,56 GB; la de 4 bits ≈ 3,5 GB. La memoria en ejecución será superior al tamaño de los pesos.
- GPU recomendadas: al ser MLX, está diseñado para Apple Silicon (chips M1, M2, M3, M4 y posteriores). No se documentan requisitos para GPUs NVIDIA.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple Silicon con memoria unificada suficiente; no se especifica el mínimo exacto. Para GPUs de consumo NVIDIA no aplica esta build.
- Opciones de despliegue: MLX (librería `mlx`), con los scripts `mlx_model.py` incluidos en cada carpeta de precisión. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son compatibles con este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stable Audio 3 Medium MLX (este) | Difusión de audio, conversión MLX | no disponible | no disponible | stable-audio-community | Hugging Face, solo Apple Silicon |
| Stable Audio 3 Medium (original) | Difusión de audio | no disponible | no disponible | stable-audio-community | Hugging Face, PyTorch |
| Otros modelos de generación de audio | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre alternativas comparables (parámetros, contexto, rendimiento) en la documentación proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- La licencia `stable-audio-community` impone restricciones al uso comercial; es imprescindible revisar el archivo `LICENSE.md` antes de cualquier despliegue en producción.
- La build de 4 bits está marcada explícitamente como experimental y por debajo del umbral de calidad: no se recomienda para producción.
- El proyecto tiene cero descargas y cero likes, y fue creado en noviembre de 2026; no hay evidencia de validación por parte de la comunidad.
- Al ser una conversión no oficial, puede contener errores de implementación no detectados; el autor solo valida numéricamente frente al modelo original, no mediante evaluación perceptual a gran escala.
- Riesgo de alucinación: no aplica en el sentido de texto, pero el modelo puede generar audio que no se corresponda fielmente con el prompt; la métrica de coincidencia de prompt reportada es de 0,61-0,62, lo que sugiere una fidelidad moderada.
- Sesgos: no documentados; al ser un modelo generativo de audio, puede reflejar sesgos en los datos de entrenamiento del modelo base (no especificados).
- Limitaciones de idioma: no se especifica qué idiomas acepta el codificador de texto; se desconoce si funciona igual de bien en castellano que en inglés.
- Solo es compatible con Apple Silicon vía MLX; no se puede desplegar en servidores con GPU NVIDIA ni en CPU de forma eficiente.
- No se documentan la duración máxima de audio generado ni la resolución de muestreo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/stable-audio-3-medium-MLX
- Modelo base: https://huggingface.co/stabilityai/stable-audio-3-medium
- Modelo base optimizado (referenciado en la model card): https://huggingface.co/stabilityai/stable-audio-3-optimized
- Paper referenciado en los tags: arxiv:2605.17991 (no se dispone de URL directa en la información proporcionada)
- Licencia: LICENSE.md dentro del repositorio (no se dispone de URL directa)
