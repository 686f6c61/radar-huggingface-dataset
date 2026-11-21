# ibyteohdear/10Eros-Max-Transformer_hybrid_beta5_VBVR_FUSED

## Resumen

10Eros-Max-Transformer_hybrid_beta5_VBVR_FUSED es un modelo de difusión para generación de vídeo (text-to-video, image-to-video y audio-vídeo) publicado por el usuario `ibyteohdear` en Hugging Face. Se trata de un derivado de la familia MiniMax-H3, construido como un *fine-tune* del checkpoint `10Eros-Max-Transformer_8stepTURBO_beta7`, sobre el que se ha fusionado estáticamente la LoRA `H3_VBVR_Pro-V2` con fuerza 1. El resultado es un único conjunto de pesos que ya incorpora tanto el delta TURBO (destilación para muestreo en 8 pasos) como el efecto de la LoRA, sin necesidad de cargar adaptadores en tiempo de ejecución.

Con 20.111.462.920 parámetros (aproximadamente 20,1 mil millones) y un repositorio de 42,7 GB en formato safetensors, el modelo se integra en el ecosistema `diffusers` mediante `AutoModel.from_pretrained(..., trust_remote_code=True)`. Su relevancia radica en la fusión determinista de pesos: el autor documenta un registro de fusión con 312 tensores afectados, verificación de conjuntos de claves exactos y conservación de dtypes por clave, lo que facilita la reproducibilidad frente a la carga dinámica de LoRAs.

La model card advierte de que el modelo está etiquetado como `not-for-all-anchored` (contenido no apto para todas las audiencias) y que la fuerza de la LoRA está "horneada" en los pesos, por lo que no existe un parámetro para atenuarla. Está pensado para experimentación en generación de vídeo con muestreo rápido en 8 pasos sobre la rejilla de 1025 pasos del sampler.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (MiniMax-H3), con codificadores de texto y audio; pipeline modular `diffusers` |
| Parámetros totales | 20.111.462.920 (~20,1 B) |
| Parámetros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Int8WeightOnly (torchao) y BitsAndBytes referenciados en el código de ejemplo; no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 42,7 GB); integración vía `diffusers` |

## Arquitectura y entrenamiento

El modelo pertenece a la familia MiniMax-H3, un transformer de difusión para vídeo con pipeline modular en `diffusers` que incluye etapas separadas de preparación de latentes, layout, timesteps, codificación de texto, denoising y decodificación. El código de ejemplo referencia componentes específicos: `AutoencoderKLMiniMaxH3`, `AutoencoderKLMiniMaxH3Audio`, `MiniMaxH3TextEncoderStep`, `MiniMaxH3DenoiseStep`, `MiniMaxH3DecodeStep` y `MiniMaxH3AutoKeyframeVaeEncoderStep`, lo que confirma soporte para vídeo, audio y keyframes automáticos. El codificador de texto empleado en el ejemplo es `Qwen3VLForConditionalGeneration`, un modelo visión-lenguaje.

El checkpoint es un *fine-tune* del modelo base `10Eros-Max-Transformer_8stepTURBO_beta7`, que a su vez incorpora un delta TURBO para muestreo en 8 pasos. Sobre esa base se ha fusionado la LoRA `H3_VBVR_Pro-V2` con fuerza 1 (alpha/rank × strength; rank [128], alpha por clave de 208). La fusión se realizó desde pesos prístinos el 4 de noviembre de 2026, afectando a 312 tensores sin descartar ninguno. El autor verifica que el conjunto de claves coincide exactamente con el base, que el dtype por clave se mantiene y que los tensores no fusionados son bit-idénticos al base. La tabla AdaLN de rango 8 es exacta en la rejilla de 1025 pasos del sampler y aproximada fuera de ella, por lo que se recomienda muestrear en rejilla. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen (image-to-video), con pipeline declarado como `image-to-video`.
- Generación de audio-vídeo conjunto, según los tags `audio-video` y los autoencoders de audio referenciados.
- Muestreo rápido en 8 pasos gracias al delta TURBO fusionado.
- Control de keyframes automáticos mediante `MiniMaxH3AutoKeyframeVaeEncoderStep`.
- Codificación de texto con `Qwen3VLForConditionalGeneration`, lo que aporta comprensión visión-lenguaje al condicionamiento.
- Integración con `diffusers` mediante `AutoModel` y `trust_remote_code=True`.
- Cuantización Int8WeightOnly (torchao) y BitsAndBytes en el código de ejemplo para reducir huella de memoria.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo explícito.

## Casos de uso

- Generación de clips cortos a partir de prompts de texto: el modelo permite crear vídeo mediante el pipeline `MiniMaxH3TextEncoderStep` + `MiniMaxH3DenoiseStep` + `MiniMaxH3DecodeStep`, adecuado para prototipado rápido de ideas visuales con 8 pasos de muestreo.
- Animación de imágenes fijas (image-to-video): usando el pipeline declarado `image-to-video`, se puede tomar una imagen de referencia y generar movimiento coherente, útil para storyboards y previsualización.
- Generación de vídeo con audio sincronizado: los autoencoders `AutoencoderKLMiniMaxH3Audio` y las etapas de audio permiten producir clips con pista sonora, aplicable a demos musicales o contenido promocional.
- Investigación en destilación y fusión de LoRAs: el registro de fusión (312 tensores, verificación bit a bit) sirve como caso de estudio reproducible para estudiar el efecto de fusionar adaptadores con fuerza 1 en modelos de difusión.
- Evaluación de cuantización en vídeo: el código de ejemplo con `TorchAoConfig` e `Int8WeightOnlyConfig` permite medir el impacto de la cuantización Int8 en calidad y latencia sobre un modelo de ~20 B.
- Despliegue en Hugging Face Spaces con GPU Zero: el script incluye decoradores `spaces.GPU(duration=1500)` y gestión de `SPACES_ZERO_GPU`, lo que facilita demos públicas con GPU efímera.
- Experimentación con keyframes automáticos: la etapa `MiniMaxH3AutoKeyframeVaeEncoderStep` permite explorar interpolación y control temporal en la generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~20,1 B de parámetros, en bf16 se requieren del orden de 40 GB solo para pesos, más memoria para activaciones y autoencoders (vídeo y audio), por lo que se recomienda al menos 48-80 GB.
- Con cuantización Int8WeightOnly (torchao) o BitsAndBytes, la huella de pesos baja aproximadamente a la mitad (~20 GB), aunque las activaciones y los VAE siguen consumiendo memoria adicional.
- GPU recomendadas: A100 80 GB, H100 80 GB o GPUs con 48 GB o más para bf16; para Int8 puede considerarse una RTX 4090 de 24 GB solo si se ajustan resolución y duración del clip.
- No cabe con holgura en GPUs de consumo de 24 GB en bf16; en cuantizado puede intentarse con limitaciones.
- Opciones de despliegue: `diffusers` con `AutoModel` y `trust_remote_code=True`; el código de ejemplo usa `snapshot_download`, `torchao` y `BitsAndBytesConfig`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 10Eros-Max-Transformer_hybrid_beta5_VBVR_FUSED | ~20,1 B | no disponible | Difusión vídeo/audio (MiniMax-H3) | no disponible | Hugging Face, `diffusers` |
| ibyteohdear/10Eros-Max-Transformer_8stepTURBO_beta7 (base) | no disponible | no disponible | Difusión vídeo (MiniMax-H3, TURBO) | no disponible | Hugging Face |
| MiniMax-H3 (familia original) | no disponible | no disponible | Difusión vídeo/audio | no disponible | No confirmado en la información |
| larryvrh/MiniMax-H3-Turbo-Lora | no disponible (LoRA) | no disponible | Adaptador TURBO | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Contenido etiquetado como `not-for-all-anchored`: no apto para todas las audiencias; requiere revisión antes de uso público.
- La fuerza de la LoRA está fusionada con valor 1 y no puede atenuarse; si el efecto es demasiado intenso, debe usarse otro repositorio.
- No se debe apilar otra LoRA TURBO (por ejemplo `larryvrh/MiniMax-H3-Turbo-Lora` o `lightx2v`) sobre estos pesos, ya que el delta TURBO ya está incluido y se aplicaría dos veces.
- La tabla AdaLN de rango 8 solo es exacta en la rejilla de 1025 pasos del sampler; fuera de ella es aproximada, por lo que hay que muestrear en rejilla.
- Licencia no disponible: no puede confirmarse el uso comercial sin consultar al autor.
- Idiomas soportados no disponibles; el comportamiento multilingüe del codificador de texto no está documentado en la ficha.
- Riesgo de alucinación visual y artefactos propios de modelos de difusión de vídeo; no se documentan sesgos específicos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; revisar antes de desplegar en producción.
- El repositorio depende de componentes externos (`NicoLab28/ClipProj-MiniMax-H3`, LoRA `h3Lora`) y de versiones concretas de `diffusers` con pipelines modulares MiniMax-H3, lo que puede romper la reproducibilidad si cambian.
- No se documentan limitaciones de longitud de contexto ni de duración máxima de clip en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibyteohdear/10Eros-Max-Transformer_hybrid_beta5_VBVR_FUSED
- Modelo base (8stepTURBO_beta7): https://huggingface.co/ibyteohdear/10Eros-Max-Transformer_8stepTURBO_beta7
- Repositorio de LoRAs `h3Lora`: https://huggingface.co/ibyteohdear/h3Lora
- ClipProj MiniMax-H3: https://huggingface.co/NicoLab28/ClipProj-MiniMax-H3
- LoRA TURBO alternativa (no apilar): https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
