# noth1ngburger/wan22EnhancedNSFWCameraPrompt_nsfwFASTMOVEV2Q6KH.gguf

## Resumen

El modelo `noth1ngburger/wan22EnhancedNSFWCameraPrompt_nsfwFASTMOVEV2Q6KH.gguf` es un fichero en formato GGUF que cuantiza un *finetune* comunitario del modelo base Wan-AI/Wan2.2-Animate-2-14B, un modelo de video de gran escala desarrollado por el equipo Wan-Video (Alibaba). El finetune, cuyo autor es `noth1ngburger`, está orientado a la generación de vídeo con prompts de cámara y movimiento rápido, y el etiquetado `nsfw` indica que el modelo ha sido ajustado para contenido adulto. El fichero GGUF permite ejecutar el modelo con herramientas de inferencia que soportan cuantización, como llama.cpp, aunque el modelo base es de generación de vídeo y requiere un pipeline específico.

El modelo base Wan2.2-Animate-2-14B es un modelo de animación de personajes y reemplazo de fondo, con 14.4 mil millones de parámetros y una ventana de contexto de vídeo de varios segundos. El fichero GGUF aquí presentado es una conversión a cuantización Q6_K, lo que reduce el tamaño del modelo (24 GB en el repositorio) para facilitar su despliegue en hardware con menos VRAM. La relevancia de este modelo radica en su uso para generación de vídeo con control fino de cámara y movimiento, aunque la escasa documentación pública y la naturaleza NSFW limitan su uso a entornos de investigación o demostración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Wan2.2-Animate (modelo de difusión para vídeo) |
| Parámetros totales | 14 288 901 184 (aprox. 14.3B) |
| Parámetros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base soporta secuencias de vídeo de varios segundos) |
| Tipos de cuantización | GGUF Q6_K (según el sufijo del archivo) |
| Idiomas soportados | No disponible (probablemente inglés y chino, como el modelo base, pero no se confirma) |
| Licencia | No disponible (el modelo base Wan2.2 usa licencia Apache 2.0 para pesos, pero este finetune no declara licencia) |
| Formato de pesos | GGUF (fichero único de 24.0 GB) |

## Arquitectura y entrenamiento

La arquitectura base es la de Wan2.2-Animate-14B, un modelo de difusión de vídeo que utiliza un transformador 3D para procesar secuencias temporales y espaciales. El modelo original fue entrenado con datos de vídeo y texto, y soporta tareas como animación de personajes, reemplazo de fondos y generación de vídeo a partir de imágenes o texto. El finetune `wan22EnhancedNSFWCameraPrompt` ha sido entrenado adicionalmente con un conjunto de datos no especificado, centrado en prompts de cámara y movimiento rápido, y con contenido NSFW. No se han publicado detalles sobre el proceso de entrenamiento, el número de tokens de vídeo, ni si se utilizó RLHF o DPO. El fichero GGUF es una conversión del modelo original (probablemente en safetensors) a un formato cuantizado para inferencia eficiente.

## Capacidades

- Generación de vídeo a partir de prompts de texto o imágenes (image-to-video y text-to-video, según la arquitectura base).
- Animación de personajes con movimiento de cámara controlado por el prompt (capacidad del modelo base Wan2.2-Animate).
- Soporte para prompts de cámara (camera prompts) y movimiento rápido, según el nombre del finetune.
- Generación de contenido NSFW (explícito), aunque no se detalla el alcance.
- No se han confirmado capacidades de tool calling, agentes o razonamiento multi-step, ya que el modelo es de generación de vídeo, no de texto.
- No se indica soporte para vision (más allá de la entrada de imagen) ni audio.

## Casos de uso

- Generación de vídeos de prueba para estudios de animación: el modelo puede producir secuencias de vídeo cortas a partir de prompts de cámara, útil para previsualizar tomas.
- Creación de contenido para redes sociales: el modelo puede generar clips de vídeo de corta duración con movimiento de cámara, adecuados para plataformas como TikTok o Instagram.
- Desarrollo de prototipos en VFX: los artistas pueden usar el modelo para generar secuencias de movimiento de cámara y personajes, antes de realizar la animación final.
- Investigación en generación de vídeo: los investigadores pueden estudiar el comportamiento del modelo en tareas de animación de personajes y reemplazo de fondo.
- Aplicaciones de entretenimiento para adultos: el finetune NSFW permite generar contenido de vídeo con fines comerciales, aunque su uso requiere cumplir las leyes locales.
- Automatización de pruebas de conceptos en producción audiovisual: el modelo puede generar múltiples variaciones de una toma para evaluar opciones de cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de rendimiento como FVD, IS, o comparaciones con otros modelos de vídeo.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado a Q6_K_M ocupa alrededor de 14 GB en disco (según el tamaño del archivo GGUF). Para inferencia, se recomienda al menos 16 GB de VRAM para cargar el modelo en GPU, aunque se puede usar CPU con memoria RAM suficiente.
- GPU recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A100 (40 GB) o superiores.
- En consumer GPU: sí, cabe en GPUs de 24 GB, como la RTX 3090/4090.
- Opciones de despliegue: llama.cpp (con soporte de GGUF), aunque para vídeo se necesitaría un pipeline específico de difusión. Otras herramientas como ComfyUI pueden cargar modelos GGUF de vídeo con el nodo adecuado. No se menciona soporte de vLLM u otros servidores de inferencia para vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre otros modelos comparables en la misma categoría (vídeo con animación de personajes) en la información proporcionada. El modelo base Wan2.2-Animate-14B es el punto de referencia, pero no hay datos de rendimiento comparativo.

## Limitaciones y advertencias

- Contenido NSFW: el modelo está diseñado para generar contenido explícito, lo que puede ser inapropiado para muchos entornos y requiere cumplir con las leyes de cada país.
- Falta de documentación: la model card es muy escasa; no se especifican los datos de entrenamiento, la licencia exacta ni los detalles de cuantización.
- Riesgo de alucinación en vídeo: los modelos de vídeo pueden generar movimientos físicamente imposibles o artefactos visuales.
- Sesgos: al ser un finetune sobre un modelo base que no se documenta, pueden existir sesgos en los personajes representados.
- Uso comercial: sin licencia clara, el uso comercial puede estar restringido. El modelo base Wan2.2 tiene licencia Apache 2.0, pero el finetune no declara su licencia, por lo que se debe consultar al autor.
- Contexto limitado: el modelo genera vídeos de corta duración (típicamente 5-10 segundos), no secuencias largas.

## Enlaces

- [HuggingFace - noth1ngburger/wan22EnhancedNSFWCameraPrompt_nsfwFASTMOVEV2Q6KH.gguf](https://huggingface.co/noth1ngburger/wan22EnhancedNSFWCameraPrompt_nsfwFASTMOVEV2Q6KH.gguf)
- [Repositorio oficial de Wan2.2](https://github.com/Wan-Video/Wan2.2)
- [CivArchive - archivo del modelo](https://civarchive.com/files/wan22EnhancedNSFWSVICamera_nsfwFASTMOVEV2Q6KH.gguf?platform=all) (enlace al archivo similar, aunque no exacto al nombre del modelo)
- [Modelo base en HuggingFace](https://huggingface.co/Wan-AI/Wan2.2-Animate-2-14B) (enlace no proporcionado, pero es el modelo base declarado)
