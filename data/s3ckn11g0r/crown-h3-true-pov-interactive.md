# S3ckn11g0r/CROWN-H3-True-POV-Interactive

## Resumen

CROWN-H3-True-POV-Interactive es un adaptador LoRA de tipo concepto para el modelo de generación de vídeo MiniMax-H3, desarrollado por el creador independiente NineCrowns (identificado como `[CROWN]`). No se trata de un modelo base, sino de un ajuste fino de bajo rango que se aplica sobre los pesos de MiniMaxAI/MiniMax-H3 para especializarlo en la generación de vídeo en primera persona subjetiva (POV), con énfasis en la coherencia anatómica de las manos del propio espectador y en la continuidad de movimientos de cámara de tipo tilt-down y tilt-up en un solo plano.

El adaptador resuelve dos problemas concretos del modelo base: la aparición de manos anatómicamente incorrectas (brazos que entran lateralmente o manos duplicadas sobre el personaje) y la falta de continuidad en planos subjetivos con inclinación vertical de cámara. Para ello se entrenó sobre material real de cámaras de acción montadas en cabeza (GoPro/Ego4D) y grabaciones de interacción frontal a altura de ojos de adulto (175 cm), empleando un clúster de 8 GPU NVIDIA B200.

El modelo se publica bajo una licencia personalizada denominada `bespoke-lora-license`, con un tamaño de repositorio de 1.0 GB y un único archivo de pesos de 910,06 MB. Su relevancia actual reside en el auge de la generación de vídeo con modelos de difusión de gran escala y en la demanda de control fino sobre la puesta en escena subjetiva para aplicaciones de vlogs, simuladores de citas interactivos y narrativa inmersiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer de difusión de vídeo MiniMax-H3; módulos de vídeo únicamente (bloques 10-49) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base MiniMax-H3 no reporta cifra en la información disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (generación de vídeo de hasta 15 segundos según la model card) |
| Tipos de cuantizacion | No disponible para el LoRA; el modelo base se usa en bf16 (pesos `minimax_h3_ref2va_bf16`, `qwen3vl_32b_minimax_h3_bf16`) y VAE en fp32 |
| Idiomas soportados | No disponible |
| Licencia | `bespoke-lora-license` (licencia personalizada; enlace a perfil de Civitai del autor) |
| Formato de pesos | safetensors (`CROWN_H3_True_POV_Interactive_V2_r64.safetensors`, 910,06 MB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 64 aplicado exclusivamente a los bloques de vídeo del transformer de MiniMax-H3, concretamente a los bloques 10 a 49, dejando intactos los módulos de audio y el resto de la pila. Se entrenó sobre un clúster de 8 NVIDIA B200 con un conjunto de datos compuesto al 100 % por material real: grabaciones subjetivas de cámaras montadas en cabeza (GoPro/Ego4D) y metraje de interacción frontal a altura de ojos de un adulto de 175 cm. No se especifica el número de tokens, horas de vídeo ni si hubo etapas de RLHF o DPO.

La innovación técnica principal es el anclaje geométrico de las manos del sujeto en el borde inferior del encuadre (direcciones de las 5 y las 7 en punto), que fuerza a que las extremidades del espectador entren desde abajo en acciones como servir una copa o manipular objetos sobre una mesa. El segundo eje de entrenamiento es la continuidad de un solo plano con inclinación vertical de cámara: descenso de 25 grados para verter champán y retorno a la altura de ojos sin cortes ni desaparición del personaje. La configuración de inferencia recomendada es de 25 pasos, sampler `euler` con `beta`, cfg 1.0, `MiniMaxH3SigmaShift` con `shift_video` 12.0 y `shift_audio` 3.0, y un peso de LoRA de 0,80 a 0,85.

## Capacidades

- Generación de vídeo texto-a-vídeo en primera persona subjetiva con el modelo base MiniMax-H3 (variantes Ref2VA, I2VA y T2VA).
- Control anatómico de manos del sujeto en el borde inferior del encuadre mediante la palabra de activación `crown_pov`.
- Continuidad de cámara en un solo plano con inclinaciones verticales suaves (tilt-down y tilt-up) de hasta 25 grados.
- Mantenimiento de la presencia del personaje secundario en el encuadre durante los movimientos de cámara.
- Interacción de mesa realista: servir bebidas, sostener vasos, entregar objetos y brindar hacia la lente.
- Generación de audio sincronizado con el vídeo hasta 15 segundos (heredado del modelo base, según la model card).
- Soporte de referencias multimodales y de fotogramas de inicio y fin (capacidades del modelo base MiniMax-H3).
- Integración con ComfyUI y con flujos en la nube de RunningHub.

## Casos de uso

- Vlogs en primera persona: el LoRA genera planos subjetivos coherentes en los que las manos del narrador aparecen desde el borde inferior al sostener la cámara o manipular objetos, eliminando las extremidades flotantes que produce el modelo base.
- Simuladores de citas interactivos: permite construir escenas de mesa con un personaje frontal que se mantiene en el encuadre mientras la cámara baja a verter una bebida y vuelve a subir para el brindis, todo en un plano continuo de hasta 15 segundos.
- Narrativa cinematográfica subjetiva: útil para secuencias de inmersión en las que el espectador adopta el punto de vista del protagonista, con control de la altura de ojos a 175 cm y transiciones verticales naturales.
- Publicidad de producto en primera persona: demostraciones de uso de un objeto (servir una bebida, entregar un artículo) grabadas desde el punto de vista del consumidor, con geometría de manos creíble y sin artefactos anatómicos.
- Previsualización de storyboards en producción audiovisual: generación rápida de planos subjetivos de referencia para validar encuadres y movimientos de cámara antes del rodaje real.
- Contenido para redes sociales de formato corto: clips de 15 segundos con estética de cámara en cabeza y audio sincronizado, generados en ComfyUI con el flujo en la nube proporcionado por el autor.
- Investigación en generación de vídeo condicionada por punto de vista: banco de pruebas para estudiar la coherencia espacial y la continuidad de cámara en modelos de difusión de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 910,06 MB en disco y se carga junto con el modelo base MiniMax-H3; la VRAM total depende del modelo base, no del LoRA.
- El autor reporta el entrenamiento en un clúster de 8 NVIDIA B200, lo que indica que el modelo base completo en bf16 requiere hardware de centro de datos de gama alta.
- El modelo base emplea pesos bf16 (`minimax_h3_ref2va_bf16.safetensors` y `qwen3vl_32b_minimax_h3_bf16.safetensors`) y un VAE en fp32 (`minimax_h3_video_vae_fp32.safetensors`); no se detalla la VRAM mínima de inferencia.
- No cabe en GPU de consumo convencionales en su configuración completa en bf16; el autor ofrece una plataforma en la nube (RunningHub) para quienes no dispongan de hardware suficiente.
- Despliegue: ComfyUI (flujo recomendado por el autor), con flujos en la nube de RunningHub; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles. La configuración de referencia usa 25 pasos con sampler `euler` y cfg 1.0.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para MiniMax-H3 en la documentación proporcionada. La comparación con otros modelos de generación de vídeo (por ejemplo, familias de difusión de vídeo de otros proveedores) no puede establecerse con datos verificables a partir de la información disponible.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CROWN-H3-True-POV-Interactive | LoRA sobre MiniMax-H3 | No disponible (adaptador de 910 MB) | No disponible (vídeo de hasta 15 s) | bespoke-lora-license | Hugging Face, RunningHub, Civitai |
| MiniMax-H3 (base) | Modelo de difusión de vídeo | No disponible | No disponible | No disponible | Hugging Face (MiniMaxAI) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Es un adaptador de concepto, no un modelo autónomo: requiere el modelo base MiniMax-H3 y no funciona de forma aislada.
- El entrenamiento se centró en material real de cámara en cabeza y en interacción frontal a altura de ojos; es previsible un rendimiento inferior en otros encuadres, estilos o escenarios no representados.
- El sesgo del conjunto de datos (GoPro/Ego4D y grabaciones de interacción con un adulto de 175 cm) puede limitar la diversidad de alturas, complexiones y contextos culturales.
- Riesgo de alucinación visual y de artefactos anatómicos residuales en acciones complejas o con múltiples personas, pese a la mejora específica del LoRA.
- La licencia `bespoke-lora-license` es personalizada y remite al perfil de Civitai del autor; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que las condiciones no están detalladas en la model card.
- El peso recomendado del LoRA (0,80 a 0,85) está ajustado a la configuración de muestreo indicada; otros valores o samplers pueden degradar la coherencia del plano.
- No se especifican los idiomas soportados ni la calidad del audio sincronizado en lenguas distintas del inglés o el chino.
- La información de benchmarks es inexistente, por lo que no puede validarse el rendimiento frente a alternativas con datos objetivos.

## Enlaces

- Hugging Face: https://huggingface.co/S3ckn11g0r/CROWN-H3-True-POV-Interactive
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia (perfil del autor en Civitai): https://civitai.com/user/NineCrowns
- Página oficial en Civitai: https://civitai.com/models/3042757
- RunningHub Global (modelo LoRA): https://www.runninghub.ai/model/public/2120439447178219521
- RunningHub Global (flujo ComfyUI): https://www.runninghub.ai/workflow/2120529879737737218
- RunningHub Global (aplicación web): https://www.runninghub.ai/ai-detail/2120529898234617858
- RunningHub China (modelo LoRA): https://www.runninghub.cn/model/public/2120452269828300801
- RunningHub China (flujo en la nube): https://www.runninghub.cn/workflow/2120527418199990273
- RunningHub China (aplicación AI): https://www.runninghub.cn/ai-detail/2120527446805147649
- Plataforma de inferencia del modelo base citada por el autor: https://h3xron.xyz
