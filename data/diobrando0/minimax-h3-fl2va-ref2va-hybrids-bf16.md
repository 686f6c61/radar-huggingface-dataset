# diobrando0/MiniMax-H3-fl2va-ref2va-hybrids-bf16

## Resumen

MiniMax-H3-fl2va-ref2va-hybrids-bf16 es un modelo de generación de vídeo basado en diffusion transformer, resultado de una fusión (merge) de los dos checkpoints oficiales de MiniMax H3: `fl2va` y `ref2va`. El autor, diobrando0, parte del análisis tensorial realizado por smhfacct y construye variantes híbridas que conservan la calidad visual y de audio del checkpoint `fl2va` (que no soporta referencias) y añaden una vía ligera de condicionamiento por referencias procedente de `ref2va` (el único checkpoint oficial que las soporta). El objetivo es que las referencias de personaje, vestuario o escenario guíen la generación sin dominarla, manteniendo la estética y el movimiento de `fl2va`.

El modelo se distribuye en dos variantes, `b45-49` y `b40-49`, que difieren en el número de bloques del transformer cuyos pesos de proyección AdaLN se toman de `ref2va` (5 y 10 bloques respectivamente, de un total de 50). Ambas variantes pesan 66,28 GB en precisión bf16 y se entregan como archivos safetensors listos para usar en ComfyUI. No se ha realizado ningún entrenamiento adicional: la fusión se hace reemplazando tensores byte a byte, verificando la integridad con hashes BLAKE2b. El modelo está pensado para generación de vídeo condicionada por texto, imagen, vídeo o audio de referencia, y se integra como reemplazo directo de `ref2va` en el nodo `MiniMaxH3ReferenceToVideo`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con bloques de atención y MLP, modulación AdaLN |
| Parametros totales | no disponible (checkpoint de 66,28 GB en bf16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de generación de vídeo, no de texto) |
| Tipos de cuantizacion | bf16 (solo esta precisión en este repo; el modelo base oficial ofrece int8 y nvfp4) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una fusión de dos checkpoints de MiniMax H3 con arquitectura idéntica y disposición de pesos equivalente. El análisis comparativo de los tensores muestra que la práctica totalidad de los pesos (atención, MLP, normas, embeddings, token refiner) son idénticos o casi idénticos entre `fl2va` y `ref2va`. La diferencia significativa se concentra en las proyecciones `adaln_proj` de cada bloque, que son las que modulan las señales de texto, audio, vídeo y referencias dentro del transformer. Por tanto, la fusión conserva todos los pesos de `fl2va` y sustituye únicamente los `adaln_proj` de un rango de bloques (los últimos 5 o 10) por los correspondientes de `ref2va`. El proceso se realiza sin descuantización, sin redondeo y sin ninguna operación aritmética: se copian los bytes de un checkpoint al otro y se verifica cada rango con BLAKE2b. No se ha realizado entrenamiento ni fine-tuning.

El checkpoint resultante mantiene la calidad de `fl2va` en el 92 % de sus pesos (para la variante `b40-49`) y añade la capacidad de condicionamiento por referencias. El modelo se usa con el codificador de texto habitual de H3 (`qwen3vl_32b_minimax_h3`) y los VAE de vídeo y audio correspondientes. Se puede combinar con el LoRA turbo `minimax_h3_ref2v_turbo_4step_v0.1` para generar en 4 pasos, o ejecutarse sin destilar.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con calidad visual y de audio heredada de `fl2va`.
- Condicionamiento por referencias de imagen, vídeo o audio (image-to-video, audio-video-generation) gracias a los bloques `adaln_proj` tomados de `ref2va`.
- Control fino de identidad, vestuario o escenario mediante referencias que informan la toma sin dominarla (especialmente en la variante `b45-49`, la más ligera).
- Compatibilidad con ComfyUI a través del nodo `MiniMaxH3ReferenceToVideo` y el cargador `UNETLoader`.
- Soporte de generación multi-paso (inferencia estándar) y aceleración con LoRA turbo de 4 pasos.
- No es un modelo de texto: no genera lenguaje natural, solo vídeo y audio sincronizados.

## Casos de uso

- Producción de vídeo con control de personaje: un creador puede proporcionar una imagen de referencia de un actor o personaje y generar escenas donde ese personaje aparece con la misma identidad, manteniendo la calidad de movimiento de `fl2va`. La variante `b45-49` es adecuada cuando la referencia solo debe insinuar el aspecto, mientras que `b40-49` ofrece una influencia algo más marcada.
- Generación de vídeo publicitario con escenarios consistentes: se suministra una fotografía de un producto o localización y el modelo genera múltiples tomas con esa ambientación, sin necesidad de reescribir prompts complejos.
- Doblaje o sincronización de audio: al aceptar referencias de audio, el modelo puede generar vídeo donde el movimiento de los labios o la expresión se alinean con una pista de voz dada, útil para doblaje automático o avatares parlantes.
- Creación de storyboards animados: un director puede usar referencias de vestuario o atrezo para mantener la coherencia visual entre planos, generando secuencias que respetan la dirección artística.
- Prototipado rápido en estudios de animación: los artistas pueden iterar sobre la identidad de un personaje usando una imagen de referencia y ajustando el rango de bloques híbridos (por ejemplo, probando `b35-49` si las referencias no se notan lo suficiente) sin reentrenar el modelo.
- Integración en flujos de ComfyUI para postproducción: al ser un reemplazo directo de `ref2va`, se puede insertar en pipelines existentes que ya usan el checkpoint oficial, mejorando la calidad sin cambiar la lógica del grafo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas cuantitativas de calidad (FVD, CLIP score, etc.) ni comparaciones formales con otros modelos. La evaluación se basa en inspección visual subjetiva y en la premisa de que la fusión conserva la calidad de `fl2va` en la mayoría de los pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bf16 ocupa 66,28 GB, por lo que se necesita una GPU con al menos 70 GB de memoria para cargarlo sin cuantización. Una NVIDIA A100 80GB o H100 80GB son opciones viables.
- No cabe en GPUs de consumo actuales (RTX 4090 con 24 GB, RTX 5090 con 32 GB) sin cuantización. Este repo no incluye versiones cuantizadas, aunque el modelo base oficial ofrece variantes int8 y nvfp4 que podrían reducir el requisito.
- Opciones de despliegue: ComfyUI es el entorno principal soportado, mediante `UNETLoader` y el nodo `MiniMaxH3ReferenceToVideo`. También se puede usar con el cargador híbrido de scottmudge (ComfyUI_MinimaxH3HybridLoader) para experimentar con otros rangos de bloques.
- Latencia y throughput: no disponible. Depende del hardware, del número de pasos (4 con LoRA turbo, más sin destilar) y de la resolución de salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Referencias | Calidad visual | Licencia |
|---|---|---|---|---|---|
| MiniMax H3 `fl2va` (oficial) | no disponible | no aplica | No | Alta (referencia) | minimax-h3-community |
| MiniMax H3 `ref2va` (oficial) | no disponible | no aplica | Sí | Media (inferior a fl2va) | minimax-h3-community |
| Este híbrido `b40-49` | no disponible | no aplica | Sí (ligera) | Alta (hereda de fl2va) | minimax-h3-community |
| Este híbrido `b45-49` | no disponible | no aplica | Sí (muy ligera) | Alta (hereda de fl2va) | minimax-h3-community |

La comparativa se limita a los checkpoints de MiniMax H3 porque no se dispone de datos de otros modelos de generación de vídeo con características equivalentes. La ventaja de este híbrido frente a `ref2va` es la calidad superior en tareas sin referencias, y frente a `fl2va`, la capacidad de usar referencias. Frente a los híbridos int8 de smhfacct, este repo ofrece precisión bf16 completa y un rango de bloques más reducido, lo que da un control más fino sobre la influencia de las referencias.

## Limitaciones y advertencias

- No supera a `fl2va` en generación sin referencias: al ser `fl2va` en el 92 % de sus pesos, el rendimiento en tareas sin referencias es prácticamente idéntico, pero no mejor.
- La influencia de las referencias puede ser demasiado sutil: con solo 5 o 10 bloques híbridos, las referencias pueden no registrarse en algunos casos. El autor sugiere probar rangos más amplios (como `b35-49`) si se necesita más influencia.
- Licencia restrictiva: la licencia `minimax-h3-community-license-agreement` puede limitar el uso comercial o la redistribución. Es necesario revisar los términos completos antes de usar el modelo en producción.
- Requisitos de hardware elevados: 66 GB de VRAM en bf16 excluyen a la mayoría de las GPUs de consumo. Sin cuantización, el despliegue es costoso.
- Sin benchmarks formales: no hay métricas objetivas de calidad, por lo que la evaluación debe hacerse mediante pruebas visuales.
- Fecha de creación futura (2026-09-01): el modelo se publicó con una fecha posterior a la actual, lo que puede indicar un error en los metadatos o un lanzamiento planificado. Conviene verificar la disponibilidad real del repositorio.
- No es un modelo de lenguaje: no se puede usar para tareas de texto, solo para generación de vídeo y audio.

## Enlaces

- Repositorio del modelo: https://huggingface.co/diobrando0/MiniMax-H3-fl2va-ref2va-hybrids-bf16
- Trabajo original de smhfacct: https://huggingface.co/smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models
- Cargador híbrido para ComfyUI: https://github.com/scottmudge/ComfyUI_MinimaxH3HybridLoader
- Repositorio oficial de MiniMax H3: https://github.com/MiniMax-AI/MiniMax-H3
- Checkpoint base `fl2va` en Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3/blob/main/diffusion_models/minimax_h3_fl2va_bf16.safetensors
- Página de descargas y archivos de MiniMax H3: https://minimaxh3.run/minimax-h3-model-files-downloads
