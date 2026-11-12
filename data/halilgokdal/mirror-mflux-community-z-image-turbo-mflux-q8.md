# halilgokdal/mirror-mflux-community-z-image-turbo-mflux-q8

## Resumen

Este repositorio es un espejo (mirror) byte a byte del modelo `mflux-community/z-image-turbo-mflux-q8`, una cuantización de 8 bits en formato MLX del modelo de generación de imágenes `Tongyi-MAI/Z-Image-Turbo`, desarrollado por Tongyi Lab (Alibaba). El espejo lo mantiene el usuario `halilgokdal` para garantizar la disponibilidad de los pesos en una aplicación personal para iPad, ante una eventual retirada del repositorio original. No se trata, por tanto, de un modelo nuevo ni de un desarrollo propio del autor del espejo.

El modelo subyacente es un generador texto-a-imagen de tipo "turbo", pensado para inferencia rápida con pocos pasos de muestreo. Al estar cuantizado en 8 bits y empaquetado en formato MLX, está orientado específicamente al ecosistema de Apple Silicon (chips M-series), donde MLX aprovecha la memoria unificada del sistema. El repositorio ocupa 11,0 GB y conserva la estructura de directorios del original: `transformer/`, `text_encoder/`, `vae/` y `tokenizer/`.

La relevancia de esta ficha es acotada: sirve como referencia de disponibilidad y de licencia (Apache-2.0) para quien necesite descargar estos pesos, pero no aporta información técnica nueva más allá de la que publica el repositorio original de `mflux-community` ni el modelo base de Tongyi-MAI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión texto-a-imagen; detalles no especificados en la información proporcionada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica directamente a un modelo de imagen; el texto de entrada se procesa mediante el tokenizer incluido) |
| Tipos de cuantización | 8 bits (MLX, según el sufijo `q8` del nombre) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `mlx`) |
| Tamaño del repositorio | 11,0 GB |
| Pipeline | text-to-image |
| Estructura de ficheros | `transformer/`, `text_encoder/`, `vae/`, `tokenizer/` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el número de parámetros ni el proceso de entrenamiento en la documentación proporcionada. Por la naturaleza del modelo (pipeline `text-to-image` con carpetas `transformer/`, `text_encoder/`, `vae/` y `tokenizer/`) se trata de un modelo de difusión con un transformer como red principal, un codificador de texto y un VAE, pero no se detallan ni el tipo concreto de transformer, ni el número de tokens de entrenamiento, ni si hubo ajuste por preferencias o destilación por pasos.

La única innovación técnica documentada de forma indirecta es la cuantización a 8 bits en formato MLX, que reduce el peso del modelo para su ejecución en hardware de Apple. El calificativo "turbo" en el nombre del modelo original sugiere un diseño orientado a la generación con pocos pasos, pero no se aporta confirmación explícita en la información disponible.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (pipeline `text-to-image`).
- Ejecución en Apple Silicon mediante la librería MLX, aprovechando la memoria unificada.
- Cuantización de 8 bits que reduce los requisitos de memoria frente a los pesos en precisión completa.
- Carga de pesos en formato safetensors con la estructura estándar de un pipeline de difusión (transformer, text encoder, VAE, tokenizer).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo "thinking"; se trata de un modelo de generación de imagen, no de un LLM.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Generación de ilustraciones para aplicaciones móviles en iPad: el formato MLX y la cuantización de 8 bits permiten ejecutar el modelo en el dispositivo, que es precisamente el escenario para el que se creó este espejo.
- Prototipado rápido de imágenes en Mac con Apple Silicon: al estar empaquetado para MLX, se puede integrar en flujos de trabajo locales sin depender de GPUs NVIDIA ni de servicios en la nube.
- Archivado y continuidad de servicio: si el repositorio original desaparece, este espejo garantiza la descarga de los mismos ficheros (verificados por SHA-256), útil para pipelines que fijan una versión concreta.
- Generación de material gráfico de bajo coste en local: al ser Apache-2.0, se puede usar en proyectos personales o comerciales sin restricciones de licencia adicionales, respetando los términos del modelo original.
- Pruebas de integración de pipelines de difusión en MLX: sirve como referencia para validar la carga de un modelo cuantizado en 8 bits con la estructura `transformer/`/`text_encoder/`/`vae/`/`tokenizer/`.
- Reproducibilidad de experimentos: al ser un espejo byte-idéntico, permite repetir exactamente las mismas inferencias que con el repositorio original, siempre que se use el mismo commit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria: no disponible de forma explícita. El repositorio pesa 11,0 GB, por lo que se necesita al menos esa cantidad de memoria libre para almacenar los pesos, más el espacio adicional para activaciones durante la inferencia.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (chips M1, M2, M3, M4 y sus variantes Pro/Max/Ultra). No se documenta soporte para GPUs NVIDIA ni AMD en esta información.
- ¿Cabe en GPU de consumo? En el contexto de Apple Silicon, sí es plausible en equipos con memoria unificada suficiente (16 GB o más), aunque no se confirma un mínimo oficial.
- Opciones de despliegue: librería `mlx` (y presumiblemente `mflux`, dado el origen del modelo). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este espejo (`halilgokdal/mirror-...-q8`) | no disponible | no aplica | safetensors MLX 8 bits | Apache-2.0 | Hugging Face (espejo) |
| `mflux-community/z-image-turbo-mflux-q8` (original) | no disponible | no aplica | safetensors MLX 8 bits | Apache-2.0 | Hugging Face |
| `Tongyi-MAI/Z-Image-Turbo` (modelo base) | no disponible | no aplica | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial; el autor original del modelo es Tongyi Lab (Alibaba) y el de la cuantización es `mflux-community`. Cualquier problema de calidad o comportamiento debe atribuirse a esos autores, no al creador del espejo.
- No se documentan sesgos conocidos, pero todo modelo de generación de imágenes entrenado con datos a gran escala puede reproducir estereotipos presentes en esos datos; no hay información específica al respecto.
- Riesgo de alucinación visual: no se documenta, pero es inherente a los modelos generativos de imagen (artefactos, incoherencias en texto dentro de la imagen, anatomía incorrecta).
- Limitaciones de idioma: no disponibles; no se especifica qué idiomas comprende el codificador de texto.
- Licencia Apache-2.0: permite uso comercial, pero se debe respetar la licencia y los términos del modelo original y de la cuantización, y conservar la atribución a los autores originales.
- El espejo no garantiza actualizaciones ni mantenimiento; si el repositorio original cambia, este espejo quedará fijado al commit `4ccff28917346aa9daae49cd3c477cf5260a242c`.
- No hay información sobre el proceso de cuantización (si es post-entrenamiento, qué método, qué pérdida de calidad introduce), lo que impide evaluar su impacto en la fidelidad de las imágenes generadas.

## Enlaces

- Espejo en Hugging Face: https://huggingface.co/halilgokdal/mirror-mflux-community-z-image-turbo-mflux-q8
- Repositorio original de la cuantización: https://huggingface.co/mflux-community/z-image-turbo-mflux-q8
- Modelo base original: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Commit del espejo: `4ccff28917346aa9daae49cd3c477cf5260a242c`
