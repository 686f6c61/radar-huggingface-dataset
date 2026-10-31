# mflux-community/qwen-image-2-1-turbo-mflux-q4

## Resumen

Qwen-Image 2.1 Turbo · MFlux Q4 es una conversión comunitaria, cuantizada a 4 bits, del modelo de generación de imágenes texto-a-imagen Qwen-Image-2.1-Turbo de Qwen, adaptada al framework MLX para ejecutarse de forma nativa en ordenadores Mac con Apple Silicon. La conversión ha sido realizada por MFlux-Community utilizando MFlux 0.24.0 y no es una publicación oficial de los autores originales del modelo.

El problema que resuelve es la elevada huella de memoria del modelo original: mientras la versión BF16 ocupa 32,5 GB, esta variante Q4 reduce el tamaño a 10,0 GB, haciendo viable la inferencia local en Macs con memoria unificada de 16-24 GB sin necesidad de GPUs dedicadas. El pipeline es text-to-image y la librería de ejecución es MFlux, un proyecto open source que permite generar imágenes con los últimos modelos generativos en hardware Apple.

Su relevancia radica en la creciente demanda de inferencia local en Mac: al cuantizar el codificador de texto, el transformer y el VAE en conjunto, MFlux ofrece una solución completa y ligera para desarrolladores que quieren generar imágenes con un modelo de última generación sin depender de la nube. El modelo base es Qwen/Qwen-Image-2.1-Turbo, del que hereda la licencia qwen-research.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen-Image-2.1-Turbo, pipeline text-to-image con codificador de texto, transformer y VAE) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 (afine quantization de MLX, 4 bits, aplicada a codificador de texto, transformer y VAE) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (heredada del modelo original) |
| Formato de pesos | safetensors (MLX, cuantizado) |

Datos adicionales de tamaño:

| Variante | Tamaño |
|---|---|
| BF16 | 32,5 GB |
| Q8 | 17,8 GB |
| Q6 | 13,9 GB |
| Q5 | 11,9 GB |
| Q4 (esta ficha) | 10,0 GB |
| Q3 | 8,0 GB |

## Arquitectura y entrenamiento

Esta ficha corresponde a una conversión cuantizada, no al modelo original, por lo que gran parte de los detalles de arquitectura y entrenamiento deben consultarse en la ficha de Qwen/Qwen-Image-2.1-Turbo. Lo que sí es conocido de esta conversión: el pipeline text-to-image se compone de tres módulos (codificador de texto, transformer de difusión y VAE), y la cuantización Q4 de MFlux emplea affine quantization de MLX a 4 bits sobre los tres módulos simultáneamente. El nivel de cuantización queda almacenado en los propios pesos, por lo que no es necesario pasar la flag `--quantize` al ejecutar.

No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni procesos de ajuste fino (RLHF/DPO) del modelo base en la información proporcionada. La conversión se realizó con MFlux 0.24.0 el 30 de octubre de 2026 y los pesos solo han sido modificados respecto al original por la conversión a MLX y la cuantización.

## Capacidades

- Generación de imágenes a partir de texto (pipeline text-to-image), heredada del modelo base Qwen-Image-2.1-Turbo.
- Ejecución nativa en Apple Silicon mediante MLX, sin emulación ni traducción de CUDA.
- Resolución de salida configurable por el usuario (el ejemplo de la documentación usa 1024x1024 pixeles).
- Control de reproducibilidad mediante semilla (`--seed`).
- Descarga automática de pesos desde HuggingFace en el primer uso, o descarga manual para uso offline.
- No se dispone de información sobre otras capacidades del modelo base (edición de imágenes, texto en imágenes, soporte multilingüe del prompt) en la información proporcionada.

## Casos de uso

- Generación local de imágenes en Mac: cualquier desarrollador con un Mac de memoria unificada suficiente puede generar imágenes sin GPU dedicada ni costes de API, ejecutando MFlux directamente en el dispositivo.
- Prototipado rápido de prompts: al correr en local con semillas reproducibles, es adecuado para iterar prompts y semillas de forma privada y sin latencia de red.
- Aplicaciones con requisitos de privacidad: al no salir del dispositivo, es útil para generar imágenes con contenido sensible (borradores internos, material no publicable) sin enviar datos a servicios externos.
- Integración en scripts y pipelines locales: la CLI `mflux-generate-qwen-2.1` permite encadenar la generación en scripts de shell o automatizaciones locales (por ejemplo, generar ilustraciones para documentación o blogs).
- Prueba de variantes de cuantización: al existir versiones BF16, Q8, Q6, Q5, Q4 y Q3 del mismo modelo, es útil para comparar la degradación de calidad frente al ahorro de memoria en hardware concreto.
- Desarrollo y testing en portátiles: el tamaño de 10,0 GB lo hace viable en portátiles Apple Silicon con memoria unificada limitada, permitiendo desarrollo y pruebas fuera de estaciones de trabajo con GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de una conversión cuantizada comunitaria, los resultados de calidad del modelo original pueden degradarse con la cuantización a 4 bits; no hay mediciones cuantitativas de esa degradación en la información proporcionada.

## Requisitos de hardware

- Memoria requerida: los pesos ocupan 10,0 GB; se recomienda un Mac con memoria unificada de al menos 16 GB (idealmente 24 GB o más) para alojar pesos, activaciones y overhead del runtime.
- Hardware compatible: exclusivamente Mac con Apple Silicon (la librería MFlux está diseñada para MLX y Apple Silicon); no es compatible con GPUs NVIDIA ni AMD.
- Consumer hardware: cabe en portátiles y sobremesas Apple Silicon de gama media/alta (M1/M2/M3/M4 con 16 GB o más de memoria unificada); el rendimiento concreto por chip no está disponible.
- Despliegue: mediante MFlux (instalable con `uv tool install --upgrade mflux`) y el comando `mflux-generate-qwen-2.1`. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparativa entre las variantes MFlux del mismo modelo base:

| Variante | Tamaño | Cuantización | Repo |
|---|---|---|---|
| BF16 | 32,5 GB | sin cuantizar | mflux-community/qwen-image-2-1-turbo-mflux-bf16 |
| Q8 | 17,8 GB | 8 bits | mflux-community/qwen-image-2-1-turbo-mflux-q8 |
| Q6 | 13,9 GB | 6 bits | mflux-community/qwen-image-2-1-turbo-mflux-q6 |
| Q5 | 11,9 GB | 5 bits | mflux-community/qwen-image-2-1-turbo-mflux-q5 |
| Q4 (esta ficha) | 10,0 GB | 4 bits | mflux-community/qwen-image-2-1-turbo-mflux-q4 |
| Q3 | 8,0 GB | 3 bits | mflux-community/qwen-image-2-1-turbo-mflux-q3 |

Comparación con otros modelos texto-a-imagen cuantizados para Apple Silicon: no disponible (no hay información suficiente en la información proporcionada para una comparación rigurosa).

## Limitaciones y advertencias

- Licencia qwen-research: al tratarse de una licencia de investigación, puede restringir el uso comercial. Debe revisarse el texto completo en la licencia del modelo original antes de cualquier despliegue comercial.
- Conversión comunitaria: no es una publicación oficial de Qwen; los pesos han sido modificados (conversión a MLX y cuantización), por lo que la calidad puede diferir del modelo original.
- Degradación por cuantización: la cuantización a 4 bits del codificador de texto, transformer y VAE puede producir pérdida de calidad respecto a la versión BF16; no hay mediciones publicadas de esta degradación.
- Compatibilidad de plataforma: solo funciona en Apple Silicon mediante MLX; no es utilizable en servidores con GPU NVIDIA/AMD ni en entornos cloud convencionales con este formato.
- Información incompleta: no se dispone de datos sobre parámetros totales, arquitectura detallada, idiomas soportados del prompt ni benchmarks; conviene consultar la ficha del modelo base antes de decisiones de producción.
- Sesgos y riesgo de alucinación visual: no documentados en la información proporcionada; como todo modelo generativo de imágenes, puede producir artefactos, representaciones imprecisas y contenidos sesgados heredados de los datos de entrenamiento.

## Enlaces

- Ficha del modelo (esta conversión Q4): https://huggingface.co/mflux-community/qwen-image-2-1-turbo-mflux-q4
- Modelo original: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/main/LICENSE
- Repositorio de MFlux: https://github.com/filipstrand/mflux
- Organización MFlux-Community: https://huggingface.co/mflux-community
- Variante BF16: https://huggingface.co/mflux-community/qwen-image-2-1-turbo-mflux-bf16
- Variante Q8: https://huggingface.co/mflux-community/qwen-image-2-1-turbo-mflux-q8
- Variante Q6: https://huggingface.co/mflux-community/qwen-image-2-1-turbo-mflux-q6
- Variante Q5: https://huggingface.co/mflux-community/qwen-image-2-1-turbo-mflux-q5
- Variante Q3: https://huggingface.co/mflux-community/qwen-image-2-1-turbo-mflux-q3
