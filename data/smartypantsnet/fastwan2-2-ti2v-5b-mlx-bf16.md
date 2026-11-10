# smartypantsnet/FastWan2.2-TI2V-5B-mlx-bf16

## Resumen

FastWan2.2-TI2V-5B-mlx-bf16 es una conversión a formato MLX del modelo de generación de vídeo a partir de texto FastWan 2.2 TI2V-5B, publicada por el usuario smartypantsnet. El modelo original procede de FastVideo (fine-tune del Wan2.2-TI2V-5B de Wan-AI) y está pensado para ejecutarse en hardware Apple Silicon mediante el framework MLX de Apple. La conversión renombra los pesos de la nomenclatura de Diffusers a la nomenclatura original de Wan y los reordena para MLX en precisión bfloat16, sin reentrenamiento alguno.

El modelo cuenta con 4.999.787.712 parámetros (aproximadamente 5B) y se distribuye como un transformer de difusión de 3 pasos, junto con un codificador de texto UMT5 y un VAE extraídos del modelo base Wan-AI/Wan2.2-TI2V-5B. La tarea principal es text-to-video: generar clips cortos a partir de una descripción textual. Su relevancia radica en que permite ejecutar localmente un modelo de vídeo de 5B en Macs con chip de la familia M, algo poco habitual en el ecosistema de generación de vídeo.

La licencia es Apache-2.0, heredada de los modelos originales, lo que facilita su uso comercial y su integración en proyectos derivados. El repositorio ocupa 24,2 GB e incluye los safetensors del transformer, del codificador T5, del VAE y los ficheros del tokenizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (modelo de vídeo), con codificador de texto UMT5 y VAE; conversión a MLX |
| Parametros totales | 4.999.787.712 (~5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (única variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para generación de vídeo, derivado del Wan2.2-TI2V-5B de Wan-AI y ajustado por FastVideo como FastWan2.2-TI2V-5B-FullAttn-Diffusers. La variante aquí publicada emplea un transformer de 3 pasos (destilado o configurado para inferencia en pocos pasos de difusión) y atención completa (FullAttn), según la nomenclatura del modelo base. El pipeline se compone de tres piezas: el transformer de difusión (`model.safetensors`), el codificador de texto UMT5 (`t5_encoder.safetensors`) y el VAE (`vae.safetensors`), más el tokenizador UMT5.

Esta conversión concreta no introduce entrenamiento ni ajuste adicional: únicamente renombra los tensores de la nomenclatura de Diffusers a la original de Wan, reorganiza los layouts para MLX y guarda los pesos en bfloat16. El codificador T5 y el VAE se convirtieron con la herramienta mlx-video-with-audio 0.1.37 a partir de Wan-AI/Wan2.2-TI2V-5B (commit 921dbaf3); el transformer proviene de FastVideo (commit 3e187042). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) mediante difusión en 3 pasos.
- Generación de clips cortos, orientada a prompts descriptivos en lenguaje natural.
- Codificación de prompts mediante el codificador de texto UMT5 incluido en el repositorio.
- Decodificación de latentes a vídeo mediante el VAE incluido.
- Ejecución nativa en Apple Silicon a través de MLX (framework de Apple).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se documentan idiomas soportados).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Generación local de clips en Mac: el modelo permite crear vídeos cortos desde un prompt de texto directamente en un Mac con Apple Silicon, sin depender de servicios en la nube, gracias a su formato MLX y a sus ~5B parámetros.
- Prototipado rápido de ideas audiovisuales: guionistas o diseñadores pueden iterar prompts y obtener clips de prueba en local para validar conceptos antes de una producción mayor.
- Creación de contenido para redes sociales: generación de clips breves a partir de descripciones textuales para publicaciones, con la ventaja de la licencia Apache-2.0 para uso comercial.
- Integración en aplicaciones macOS: al estar en formato MLX, puede incorporarse en apps o scripts nativos de macOS que necesiten generar vídeo bajo demanda sin conexión.
- Pruebas de investigación en generación de vídeo: sirve como base para experimentar con difusión de pocos pasos (3 pasos) y comparar calidad y velocidad en hardware Apple frente a GPU dedicadas.
- Educación y demos: permite mostrar en un portátil Mac el funcionamiento de un modelo de difusión de vídeo de 5B, sin necesidad de un servidor con GPU.
- Automatización de pipelines creativos offline: generación por lotes de clips a partir de listas de prompts en entornos sin acceso a internet o con requisitos de privacidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 24,2 GB en bfloat16, por lo que se requiere memoria unificada suficiente para cargar transformer, codificador T5 y VAE, además del espacio de trabajo de inferencia.
- GPU recomendadas: el modelo está convertido para MLX, por lo que el hardware objetivo son los chips de Apple (familia M). No se documentan GPU NVIDIA o AMD para esta variante.
- ¿Cabe en GPU de consumo? No aplica a esta conversión MLX; en el ecosistema Apple, requiere un Mac con memoria unificada amplia (el tamaño del repo, 24,2 GB, da una idea del mínimo práctico).
- Opciones de despliegue: MLX (librería `mlx`), con la herramienta mlx-video-with-audio empleada en la conversión. No se documentan vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| FastWan2.2-TI2V-5B-mlx-bf16 (este) | ~5B | no disponible | safetensors MLX bf16 | Apache-2.0 | Conversión MLX para Apple Silicon, 3 pasos |
| FastVideo/FastWan2.2-TI2V-5B-FullAttn-Diffusers | ~5B (no confirmado en la informacion) | no disponible | Diffusers | Apache-2.0 (según modelo base) | Modelo original en formato Diffusers |
| Wan-AI/Wan2.2-TI2V-5B | ~5B (no confirmado en la informacion) | no disponible | no disponible | Apache-2.0 (según model card) | Modelo base de Wan-AI del que derivan los anteriores |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión de pesos, no un modelo reentrenado: cualquier limitación del modelo original (calidad, coherencia temporal, sesgos) se hereda íntegramente.
- No se documentan idiomas soportados; el comportamiento multilingüe del codificador UMT5 no está verificado en esta ficha.
- Riesgo de alucinación visual y de artefactos propios de la difusión de vídeo en pocos pasos (3 pasos), que suele sacrificar detalle frente a configuraciones con más pasos.
- Solo se publica la variante bfloat16; no hay cuantizaciones alternativas en este repositorio, lo que limita el despliegue en equipos con menos memoria.
- Requiere hardware Apple Silicon y el framework MLX; no es directamente usable en GPU NVIDIA sin reconversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar los avisos de licencia y atribución de los modelos originales.
- No se documentan límites de longitud de prompt ni de duración de vídeo en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/smartypantsnet/FastWan2.2-TI2V-5B-mlx-bf16
- Modelo base (FastVideo): https://huggingface.co/FastVideo/FastWan2.2-TI2V-5B-FullAttn-Diffusers
- Modelo base (Wan-AI): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
