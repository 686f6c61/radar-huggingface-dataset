# moonbox-dev/MOSS-Image-SFT-MLX

## Resumen
MOSS-Image-SFT-MLX es una conversión al framework MLX de Apple Silicon del modelo de generación de imágenes texto-a-imagen MOSS-Image (SFT), desarrollado originalmente por el equipo OpenMOSS y empaquetado para Macs con chip Apple por moonbox-dev. El modelo base es un pipeline de difusión (difusión de una sola etapa, según la etiqueta `diffusion-single-file`) que transforma prompts de texto en imágenes, e incluye un codificador de texto multi-fichero, un transformer de difusión y un VAE, todos ellos convertidos a pesos MLX en precisión bf16.

La relevancia de esta ficha no está en el modelo en sí, sino en la distribución: permite ejecutar un pipeline de difusión de gran tamano (el repositorio completo ocupa 58,3 GB en bf16) de forma nativa en hardware Apple Silicon mediante MLX, sin depender de CUDA ni de PyTorch. Esto abre la generación de imágenes por difusión a portátiles y equipos de sobremesa con chip M-series, un nicho tradicionalmente mal cubierto por los pipelines estándar.

La información pública disponible es muy limitada: la model card solo documenta los ficheros, sus tamanos y sus hashes SHA-256, y no incluye detalles sobre arquitectura interna, número de parámetros, datos de entrenamiento ni resultados de benchmarks. Todo lo que se indica a continuación se limita a lo que consta en la información proporcionada; el resto se marca explícitamente como no disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión texto-a-imagen (difusión de una sola etapa, etiqueta `diffusion-single-file`); componentes: codificador de texto multi-fichero, transformer de difusión y VAE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no de lenguaje) |
| Tipos de cuantizacion | bf16 (única precisión publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), con `mflux_model.json` e índices `model.safetensors.index.json`; tokenizer en JSON |
| Tamano del repositorio | 58,3 GB |
| Libreria / framework | MLX (Apple Silicon) |
| Modelo base | OpenMOSS-Team/MOSS-Image-SFT (relación: quantized) |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento
El modelo base es un pipeline de difusión texto-a-imagen. La conversión a MLX separa los pesos en tres grupos: un codificador de texto dividido en 8 ficheros safetensors (aproximadamente 15,9 GB en total), un transformer de difusión dividido en 5 ficheros (aproximadamente 10,2 GB) y un VAE de 124,8 MB. El repositorio incluye además el tokenizer (20 MB) y una plantilla de chat (`chat_template.jinja`), lo que sugiere que el codificador de texto es un modelo de lenguaje con plantilla conversacional.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas del modelo original. La model card de esta conversión solo documenta los ficheros, sus tamanos y sus hashes SHA-256, e indica que únicamente se han convertido las partes listadas, tomando el resto del pipeline del repositorio original. No se detalla qué método de cuantización se ha aplicado más allá de la precisión bf16.

## Capacidades
- Generación de imágenes a partir de descripciones textuales (text-to-image).
- Ejecución nativa en Apple Silicon mediante MLX, sin CUDA.
- Pipeline completo empaquetado: codificador de texto, transformer de difusión, VAE y tokenizer.
- Plantilla de chat incluida (`chat_template.jinja`), lo que apunta a un codificador de texto de tipo conversacional.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje general).
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso
- Generación de imágenes en portátiles Mac: el pipeline MLX permite crear ilustraciones y renders a partir de prompts en equipos con chip M-series, sin GPU NVIDIA ni entorno CUDA.
- Prototipado de conceptos visuales: diseñadores pueden iterar prompts y obtener imágenes en local antes de pasar a producción, manteniendo los datos en el dispositivo.
- Generación de assets para videojuegos y apps: creación de texturas, iconos y fondos de forma local para pipelines de contenido.
- Automatización de contenido editorial: generación de imágenes de acompañamiento para artículos o publicaciones a partir de descripciones textuales.
- Investigación en difusión sobre Apple Silicon: base para experimentar con pipelines de difusión en MLX y comparar su comportamiento con las versiones PyTorch.
- Evaluación de la fidelidad de la conversión: los hashes SHA-256 y la comparación con los pesos originales en bf16 permiten verificar la integridad de la conversión en entornos de CI.
- Despliegue en estaciones de trabajo macOS sin conexión: al ser un modelo local, permite generar imágenes en entornos aislados o con requisitos de privacidad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye hashes SHA-256 y una columna de comparación con los pesos originales en bf16, sin métricas de calidad de imagen (FID, CLIP score) ni comparaciones con PyTorch.

## Requisitos de hardware
- VRAM/ memoria unificada estimada: el repositorio completo en bf16 ocupa 58,3 GB; para cargar el pipeline completo se necesita al menos esa cantidad de memoria unificada disponible, por lo que se recomienda un Mac con 64 GB o más.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente (M2 Max, M2 Ultra, M3 Max, M3 Ultra o superiores). No aplica a GPU NVIDIA ni AMD.
- ¿Cabe en consumer GPU? No en el sentido tradicional: requiere hardware Apple Silicon con memoria unificada amplia; no se ha verificado su funcionamiento en GPUs de consumo NVIDIA.
- Opciones de despliegue: MLX (librería `mlx`), con el pipeline `mflux` (el fichero `mflux_model.json` sugiere integración con mflux). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MOSS-Image-SFT-MLX | no disponible | no aplica | apache-2.0 | Hugging Face (MLX, bf16) | Conversión para Apple Silicon |
| OpenMOSS-Team/MOSS-Image-SFT | no disponible | no aplica | no disponible en la información | Hugging Face (PyTorch) | Modelo original del que deriva esta conversión |
| Otros pipelines de difusión texto-a-imagen (p. ej. Stable Diffusion) | no disponible en la información | no aplica | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias
- La información pública es muy escasa: no hay datos de arquitectura interna, parámetros, entrenamiento ni benchmarks.
- Solo se ha publicado la precisión bf16; no hay versiones cuantizadas a 8 o 4 bits, lo que limita el despliegue en equipos con menos memoria.
- El repositorio ocupa 58,3 GB; se requiere hardware Apple Silicon con memoria unificada amplia.
- No se documentan sesgos conocidos, pero al ser un modelo de difusión entrenado con datos no especificados, puede reproducir sesgos de representación.
- Riesgo de alucinación visual: puede generar imágenes que no correspondan fielmente al prompt.
- No se especifican los idiomas soportados por el codificador de texto.
- La licencia es apache-2.0, lo que permite uso comercial, pero se recomienda verificar la licencia del modelo base original.
- No se documenta soporte para GPUs NVIDIA ni para frameworks distintos de MLX.
- La model card advierte de que solo se han convertido las partes listadas y que el resto del pipeline proviene del repositorio original; hay que mantener juntos los ficheros de cada carpeta de precisión.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/MOSS-Image-SFT-MLX
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Paper referenciado en los tags (arXiv:2610.23374): https://arxiv.org/abs/2610.23374
- Repositorio de mflux (sugerido por el fichero `mflux_model.json`): no disponible en la información proporcionada
- Documentación de MLX: no disponible en la información proporcionada
