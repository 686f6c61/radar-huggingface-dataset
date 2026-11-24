# ibyteohdear/MiniMax-H3-Pruned-DMD-FL2VA-Turbo-Fused

## Resumen

MiniMax-H3-Pruned-DMD-FL2VA-Turbo-Fused es un modelo de generación de vídeo a partir de imagen y texto (image-text-to-video) publicado por el usuario ibyteohdear en Hugging Face. Se trata de un derivado del transformer de `multimodalart/MiniMax-H3-Pruned`, sobre el que se ha fusionado (fused) un adaptador LoRA DMD de 8 pasos orientado a acelerar la inferencia ("turbo"). El resultado es un checkpoint único que no requiere cargar el LoRA por separado en tiempo de ejecución.

El modelo conserva la arquitectura del transformer original de MiniMax-H3, con aproximadamente 20.111 millones de parámetros (20,1 B) en formato safetensors y un repositorio de 40,2 GB. La fusión se aplicó sobre 363 capas con un factor de escala de 0,897283 y un rango de LoRA de 16, sin hornear offsets AdaLN. Está pensado para usarse con la librería diffusers y requiere `trust_remote_code=True`.

Su relevancia radica en que empaqueta en un solo artefacto la poda del modelo base y la destilación DMD de 8 pasos, lo que reduce el número de pasos de muestreo necesarios y simplifica el despliegue. La model card incluye además un pipeline de referencia en Gradio que combina el transformer con un codificador de texto Qwen3-VL y módulos auxiliares (ClipProj) para la generación de vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo (MiniMax-H3), con LoRA DMD fusionado |
| Parametros totales | 20.111.462.920 (20,1 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible de forma explícita; el pipeline de referencia usa Int8WeightOnlyConfig (torchao) y bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (license: other) |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para generación de vídeo condicionada por imagen y texto, heredado de MiniMax-H3 en su variante podada (`MiniMax-H3-Pruned`). Sobre esa base se ha fusionado el adaptador `minimax_h3_dmd_fl2va_8step_turbo_pruned_diffusers.safetensors`, un LoRA de rango 16 con alpha 15,156 y escala de fusión 0,897283, aplicado sobre 363 capas. La fusión se realizó mediante `load_lora_adapter`, fijado de escalado, `fuse_lora`, eliminación de PEFT y guardado por shards. No se hornearon offsets AdaLN.

El componente "DMD" y la etiqueta "8step turbo" indican una destilación orientada a reducir el número de pasos de muestreo (8 pasos), lo que acelera la inferencia frente al modelo base. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO. El pipeline de referencia de la model card emplea un codificador de texto Qwen3-VL (8B o 32B, según configuración) junto con módulos ClipProj específicos de MiniMax-H3 y los autoencoders de vídeo y audio (`AutoencoderKLMiniMaxH3`, `AutoencoderKLMiniMaxH3Audio`).

## Capacidades

- Generación de vídeo a partir de imagen y texto (image-text-to-video) mediante un pipeline modular de diffusers.
- Generación acelerada con destilación DMD de 8 pasos ("turbo"), que reduce el coste de muestreo.
- Integración con codificadores de texto Qwen3-VL para el condicionamiento textual.
- Soporte de autoencoder de audio (`AutoencoderKLMiniMaxH3Audio`), lo que sugiere capacidad de generar pistas de audio asociadas al vídeo, aunque no se detalla su funcionamiento.
- Carga directa sin necesidad de aplicar LoRA por separado (fusión ya incluida en los pesos).
- Compatibilidad con cuantización Int8 weight-only vía torchao en el pipeline de referencia.
- Soporte de `trust_remote_code=True` y código personalizado (`custom_code`).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; no aplica a un modelo de difusión de vídeo.

## Casos de uso

- Prototipado rápido de vídeo generativo: al estar destilado a 8 pasos, permite iterar sobre prompts imagen-texto con menor coste de cómputo que el modelo base, adecuado para demos y pruebas de concepto.
- Generación de clips a partir de storyboards: se puede partir de una imagen clave y un prompt textual para producir vídeo, útil en previsualización de escenas.
- Creación de contenido para redes sociales: generación de clips cortos condicionados por imagen y texto en flujos semiautomáticos.
- Investigación en destilación de modelos de difusión: el checkpoint fusionado sirve como referencia para estudiar el efecto de fusionar LoRA DMD en un transformer podado.
- Despliegue en entornos con recursos limitados: la poda del modelo base y la reducción de pasos facilitan su ejecución en hardware más modesto que el modelo completo.
- Integración en pipelines de diffusers: al cargarse con `AutoModel.from_pretrained` y `trust_remote_code=True`, encaja en flujos existentes basados en diffusers y en pipelines modulares de MiniMax-H3.
- Experimentación con audio-vídeo: la presencia del autoencoder de audio permite explorar generación conjunta de vídeo y audio en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 20,1 B de parámetros en bfloat16, los pesos rondan los 40 GB; en Int8 weight-only se reducirían aproximadamente a la mitad, aunque no se confirma en la información disponible.
- GPU recomendadas: no disponible. Por tamaño, un checkpoint en bf16 requiere GPUs de clase A100/H100 de 80 GB o configuraciones multi-GPU; no se especifica en la model card.
- ¿Cabe en consumer GPU? No se confirma. En bf16 no cabría en GPUs de consumo de 24 GB; con cuantización Int8 podría ser viable en GPUs de 48 GB o mediante offloading, pero no hay datos oficiales.
- Opciones de despliegue: diffusers (con `trust_remote_code=True`), pipelines modulares de MiniMax-H3, y cuantización con torchao (`Int8WeightOnlyConfig`). El pipeline de referencia usa Gradio y `apply_group_offloading`.
- Latencia y throughput: no disponible. La destilación a 8 pasos sugiere una reducción del número de pasos de muestreo, pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ibyteohdear/MiniMax-H3-Pruned-DMD-FL2VA-Turbo-Fused | 20,1 B | no disponible | Image-text-to-video (destilado 8 pasos) | minimax-h3-community-license-agreement | Hugging Face, diffusers |
| multimodalart/MiniMax-H3-Pruned (modelo base) | no disponible | no disponible | Image-text-to-video (podado, sin LoRA turbo) | no disponible | Hugging Face |
| MiniMax-H3 (modelo original) | no disponible | no disponible | Image-text-to-video | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La licencia es `minimax-h3-community-license-agreement` (license: other): es necesario revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones.
- El repositorio está etiquetado como `not-for-all-audiences`, lo que indica contenido potencialmente sensible o no apto para todos los públicos.
- Al ser un modelo de difusión de vídeo, puede generar contenido sesgado, estereotipado o inapropiado según los datos de entrenamiento del modelo base, no documentados aquí.
- Riesgo de alucinación visual y de artefactos en la generación de vídeo, especialmente con prompts ambiguos o imágenes de entrada de baja calidad.
- No se documentan los idiomas soportados para el condicionamiento textual; el pipeline de referencia usa Qwen3-VL, pero no se especifica cobertura lingüística.
- Requiere `trust_remote_code=True` y código personalizado (`custom_code`), lo que implica ejecutar código del repositorio; conviene auditar el código antes de usarlo en producción.
- El pipeline de referencia depende de repositorios externos (Qwen3-VL, ClipProj-MiniMax-H3) y de versiones concretas de diffusers, transformers y torchao, lo que puede afectar a la reproducibilidad.
- No hay información sobre el dataset de entrenamiento ni sobre sesgos específicos medidos; la evaluación de calidad queda a cargo del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibyteohdear/MiniMax-H3-Pruned-DMD-FL2VA-Turbo-Fused
- Modelo base: https://huggingface.co/multimodalart/MiniMax-H3-Pruned
- Repositorio ClipProj-MiniMax-H3: https://huggingface.co/NicoLab28/ClipProj-MiniMax-H3
- Codificador de texto Qwen3-VL 8B (referencia del pipeline): https://huggingface.co/prithivMLmods/Qwen3-VL-8B-Instruct-c_abliterated-v3
- Codificador de texto Qwen3-VL 32B (referencia del pipeline): https://huggingface.co/prithivMLmods/Qwen3-VL-32B-Instruct-abliterated-v1
