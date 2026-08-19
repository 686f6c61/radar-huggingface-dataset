# Cantina/Ozus-turbo-1.2

## Resumen

Ozus-turbo-1.2 es un checkpoint de identidad (identity checkpoint) desarrollado por Cantina, una plataforma de interacción social con personajes de IA. El modelo está diseñado específicamente para inyección de identidad de referencia en generaciones del backbone Z-Image-Turbo, permitiendo el intercambio de rostros (face swapping) con alta fidelidad fotográfica. Se trata de un modelo interno de Cantina, no destinado a uso público general.

El checkpoint se entrenó directamente sobre el backbone `Tongyi-MAI/Z-Image-Turbo` (no incluido en el repositorio), sin utilizar LoRA de destilación, lo que significa que el entrenamiento se realizó contra el modelo Turbo nativo. La versión 1.2 corresponde al checkpoint 100.000 de un entrenamiento continuado desde un checkpoint anterior (46.000 pasos), con un total de 12,8 millones de muestras vistas. El modelo se distribuye en formato safetensors con un tamaño de repositorio de 4,0 GB.

La relevancia de este modelo radica en su enfoque de entrenamiento híbrido: combina una pérdida de identidad (ID loss) con pesos específicos y una ventana sigma, junto con una receta de inferencia de 8+3 pasos que alterna entre pasos guiados por identidad y pasos puros de Z-Image-Turbo para lograr realismo fotográfico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Z-Image-Turbo (Tongyi-MAI) + InfuseNet identity module + ImageProjModel (ArcFace-512 → id-token projector) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | other (propietaria, uso interno Cantina) |
| Formato de pesos | safetensors (model.safetensors ~3,6 GB + image_proj_model.safetensors ~158 MB) |

## Arquitectura y entrenamiento

El modelo se compone de tres elementos principales: el backbone Z-Image-Turbo (que actúa como base de generación), un módulo InfuseNet que gestiona la identidad inyectada, y un proyector de imagen (ImageProjModel) que transforma embeddings ArcFace-512 en tokens de identidad. El entrenamiento se realizó en dos etapas: una primera desde cero sobre datos multi-caption de Wynd (checkpoint 46.000), y una segunda de continuación con captions unificados mixed-v5 (50/50 genérico/detallado) hasta el checkpoint 100.000.

El entrenamiento usó 64 GPUs (8 nodos × 8 GPUs), batch efectivo de 128, resolución 1024, learning rate 2e-5 con scheduler constant_with_warmup (500 pasos de warmup), optimizador 8-bit Adam y precisión mixta bf16. La pérdida de identidad se configuró con peso 2.0, margen 0.9 con auto-shutoff, ventana sigma [0.15, 0.80] con ponderación lineal, warmup de 3.000 pasos y lookahead K=2 con sigma_target 0.10. El dropout de condicionamiento de texto e identidad se fijó a 0.0.

## Capacidades

- Intercambio de rostros (face swapping) con inyección de identidad de referencia en generaciones de Z-Image-Turbo.
- Generación de imágenes a resolución 1024 con receta de inferencia de 8+3 pasos: 8 pasos guiados por identidad + 3 pasos puros de Z-Image-Turbo para realismo fotográfico.
- Soporte de inpainting con tamaño 1088, crecimiento de máscara 0.25 y padding 0.456.
- Control fino de la influencia de identidad mediante conditioning scale (0.60) y multiplicadores residuales por bloque (bloque 5 → 0.25, bloque 15 → 1.50).
- Generación con CFG (guidance scale) 0.0, lo que implica inferencia sin clasifier-free guidance.
- Entrenamiento específico para identidad con pérdida dedicada (ID loss) y ventana sigma, lo que permite un control más preciso de cuándo se aplica la presión de identidad durante el proceso de denoising.

## Casos de uso

- Generación de selfies con identidad consistente: el modelo permite generar múltiples variaciones de un mismo rostro manteniendo la identidad, útil para plataformas sociales como Cantina donde los usuarios crean avatares de personajes.
- Creación de personajes de IA con apariencia coherente: los bots de Cantina pueden mantener una cara consistente a través de diferentes generaciones, mejorando la experiencia de usuario.
- Intercambio de rostros en imágenes existentes: mediante inpainting con máscara, el modelo puede reemplazar el rostro de una imagen manteniendo el contexto y la iluminación.
- Producción de contenido visual para plataformas de chat con IA: integración en pipelines de generación de imágenes para acompañar conversaciones con personajes virtuales.
- Personalización de avatares en aplicaciones sociales: los usuarios pueden inyectar su propia identidad o la de personajes ficticios en generaciones de imágenes.
- Investigación en inyección de identidad en modelos de difusión: el checkpoint y su receta de inferencia documentada sirven como referencia para experimentos con pérdidas de identidad y programación de pasos híbridos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio no especifica requisitos de hardware para inferencia.
- El entrenamiento se realizó con 64 GPUs (8 nodos × 8 GPUs), lo que sugiere que el modelo es pesado y requiere infraestructura de servidor.
- El tamaño del checkpoint es de aproximadamente 3,6 GB (model.safetensors) más 158 MB del proyector de imagen, por lo que se necesita al menos 8 GB de VRAM para cargar los pesos en memoria (sin contar el backbone Z-Image-Turbo, que no está incluido).
- Dado que el backbone es Z-Image-Turbo, los requisitos de hardware serán similares a los de ese modelo base, que no se detallan en la información disponible.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI, etc.), ya que se trata de un modelo de difusión, no de un LLM.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es interno de Cantina y no se han publicado comparativas con alternativas de la misma categoría (face swapping o inyección de identidad en modelos de difusión).

## Limitaciones y advertencias

- Licencia propietaria ("other") y marcado como "cantina-internal": no es un modelo open source y su uso está restringido a Cantina. No debe usarse comercialmente sin autorización.
- El backbone Z-Image-Turbo no está incluido en el repositorio; es necesario obtenerlo por separado de `Tongyi-MAI/Z-Image-Turbo`.
- El modelo está entrenado específicamente para el dataset Wynd con captions mixed-v5, lo que puede limitar su generalización a otros dominios o estilos de imagen.
- La receta de inferencia documentada (8+3 pasos) es la evaluada como punto óptimo de realismo, pero el checkpoint del autor incluye una receta más simple (9 pasos, guidance completa, conditioning 0.50) que puede dar resultados inferiores.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de idioma, pero al ser un modelo de imagen, los sesgos pueden manifestarse en la representación de rostros de ciertos grupos demográficos.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que no ha sido probado externamente ni validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cantina/Ozus-turbo-1.2
- Backbone base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo (no incluido en el repo)
- VAE compartido: https://huggingface.co/Cantina/flux.1-dev-realistic-lora-merge (subcarpeta `vae`)
- Versión anterior: https://huggingface.co/Cantina/ozus-turbo-selfie (checkpoint-46000)
- Sitio web de Cantina: https://cantina.com/
