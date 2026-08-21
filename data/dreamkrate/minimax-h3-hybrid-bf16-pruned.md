# dreamkrate/Minimax-H3-Hybrid-BF16-Pruned

## Resumen

El modelo `dreamkrate/Minimax-H3-Hybrid-BF16-Pruned` es un checkpoint de fusión (merge) del modelo MiniMax H3 de MiniMax, diseñado para generación de vídeo, imagen a vídeo y audio a vídeo. Combina dos variantes oficiales del mismo modelo base: FL2VA, que aporta mayor fidelidad en la salida, y Ref2VA, que incorpora un camino de condicionamiento por referencia. El merge sustituye los tensores `adaln_proj` de los bloques 25 a 49 del transformador de difusión de FL2VA por los correspondientes de Ref2VA, manteniendo el resto de pesos de FL2VA. El resultado es un checkpoint unificado, sin cuantización, almacenado en BF16, listo para cargar en ComfyUI mediante su loader de modelos de difusión.

Este modelo no es un modelo independiente, sino una derivación experimental que pretende ofrecer la calidad de FL2VA junto con la capacidad de condicionamiento por referencia de Ref2VA. No se ha realizado ningún entrenamiento adicional; es una fusión determinista de pesos. El repositorio contiene únicamente el transformador de difusión, sin los componentes auxiliares como el codificador de texto, el tokenizador o los VAEs de vídeo y audio, que deben obtenerse por separado. Es relevante para desarrolladores que trabajan con generación de vídeo en ComfyUI y necesitan un checkpoint que soporte referencias multimodales sin sacrificar la fidelidad de la salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) híbrido, basado en MiniMax H3 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ninguno (BF16, sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (BF16, pruned, single-file) |

## Arquitectura y entrenamiento

El modelo es una fusión de dos checkpoints oficiales de MiniMax H3, ambos con la misma arquitectura y disposición de tensores. El proceso de fusión es determinista: se parte del checkpoint FL2VA como base y se copian los tensores `adaln_proj` de los bloques 25 a 49 del checkpoint Ref2VA. Todos los demás tensores se mantienen de FL2VA. No se realizó entrenamiento, gradientes, destilación ni interpolación durante el proceso.

MiniMax H3 es un modelo de difusión de transformadores (diffusion transformer) diseñado para generación de vídeo con audio sincronizado. La arquitectura combina un transformador de difusión con módulos de atención para modelar secuencias temporales y espaciales. El checkpoint resultante hereda las capacidades de condicionamiento por referencia de Ref2VA (imagen, vídeo o audio) y la fidelidad de FL2VA. Los datos de entrenamiento del modelo original no se detallan en la información disponible; no se especifica el número de tokens, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con calidad cercana a FL2VA.
- Generación de vídeo a partir de imagen (image-to-video), incluyendo primer y último fotograma.
- Generación de vídeo a partir de referencias de audio (audio-to-video), con sincronización de audio.
- Condicionamiento multimodal por referencia: el modelo acepta imagen, vídeo o audio como entrada de referencia gracias al camino de Ref2VA.
- Generación de vídeo con audio sincronizado (audio-video generation).
- No soporta tool calling, razonamiento multi-paso ni funciones de agente, al ser un modelo de difusión, no un LLM conversacional.

## Casos de uso

- **Generación de vídeo publicitario a partir de un texto**: el modelo puede crear secuencias de vídeo breves con audio sincronizado a partir de descripciones textuales, útil para prototipos de anuncios o contenido promocional en plataformas de vídeo.
- **Animación de imágenes estáticas**: dada una fotografía o ilustración, el modelo puede animarla generando movimiento coherente y audio asociado, por ejemplo para presentaciones o contenido educativo.
- **Doblaje y sincronización de audio**: con una pista de audio como referencia, el modelo puede generar vídeo cuyos labios y gestos se sincronizan con el audio, útil para doblaje automático o creación de avatares.
- **Generación de vídeo de referencia para previsualización**: los diseñadores pueden usar el modelo para crear vídeos de referencia a partir de bocetos o imágenes, antes de la producción final.
- **Creación de contenido para redes sociales**: generar clips cortos con audio a partir de prompts de texto o imágenes, para publicaciones en TikTok, Instagram Reels o YouTube Shorts.
- **Prototipado de escenas en producción audiovisual**: los cineastas pueden generar previsualizaciones de escenas con audio provisional a partir de guiones o storyboards, acelerando el proceso de planificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reclama ningún resultado formal y recomienda evaluar el checkpoint en los flujos de trabajo propios.

## Requisitos de hardware

- VRAM estimada: al ser un checkpoint BF16 de ~40 GB (37,46 GiB), se requiere al menos 40 GB de VRAM para cargar los pesos en memoria. Con cuantización adicional (no incluida en este repositorio) podría reducirse, pero no se proporciona.
- GPU recomendadas: GPU de gama alta con 48 GB o más de VRAM, como NVIDIA A100 80 GB, H100 80 GB, o RTX 6000 Ada. En GPUs de consumo, solo las de 48 GB (RTX 6000, A6000) podrían intentar la carga, pero no se garantiza.
- No cabe en GPUs de consumo estándar (RTX 4090 24 GB, RTX 3090 24 GB, etc.) sin cuantización adicional.
- Opciones de despliegue: el checkpoint está diseñado para ComfyUI mediante el loader de modelos de difusión. También se menciona compatibilidad con SGLang, aunque no se detalla. No se indica soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Este checkpoint es una fusión de dos variantes oficiales de MiniMax H3. La comparación natural es con los modelos base:

| Modelo | Arquitectura | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax H3 FL2VA (oficial) | Diffusion transformer | ~40 GB (BF16) | no disponible | MiniMax H3 Community | HuggingFace |
| MiniMax H3 Ref2VA (oficial) | Diffusion transformer | ~40 GB (BF16) | no disponible | MiniMax H3 Community | HuggingFace |
| Este merge (dreamkrate) | Diffusion transformer | 40,2 GB | no disponible | MiniMax H3 Community | HuggingFace |

La ventaja de este merge es que un único archivo ofrece tanto la fidelidad de FL2VA como el condicionamiento de referencia de Ref2VA, evitando tener que cambiar de checkpoint según la tarea. No se dispone de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El merge es experimental: el límite del bloque 25-49 se eligió empíricamente y no se garantiza que sea óptimo para todos los prompts o modalidades de referencia.
- La adherencia a las referencias puede diferir del Ref2VA oficial, mientras que la calidad sin referencia puede diferir del FL2VA oficial.
- No se han realizado pruebas formales de rendimiento; los resultados pueden variar según el flujo de trabajo y la configuración de generación.
- El repositorio solo contiene el transformador de difusión, no el codificador de texto, tokenizador, VAE visual o VAE de audio. Es necesario obtenerlos por separado para usar el modelo completo.
- La licencia MiniMax H3 Community License Agreement debe revisarse antes de usar o redistribuir el modelo; puede imponer restricciones de uso comercial.
- No se especifican los idiomas soportados; se recomienda probar con los idiomas de los textos de entrada.
- Al ser un modelo de difusión, el riesgo de alucinación se manifiesta en la generación de vídeos que no coinciden con la referencia o que contienen artefactos visuales o de audio no deseados.

## Enlaces

- [Repositorio del modelo en HuggingFace](https://huggingface.co/dreamkrate/Minimax-H3-Hybrid-BF16-Pruned)
- [Modelo base oficial MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- [Referencia del merge de smhfacct](https://huggingface.co/smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models)
- [Licencia del modelo MiniMax H3](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE)
- [Guía de despliegue y workflows de MiniMax H3](https://design.minimax.io/h3)
- [Repositorio GitHub de MiniMax H3 Hub](https://github.com/ai-models-lab/minimax-h3)
- [Página de descarga de archivos del modelo MiniMax H3](https://minimaxh3.run/minimax-h3-model-files-downloads)
