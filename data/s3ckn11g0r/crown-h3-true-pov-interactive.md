# S3ckn11g0r/CROWN-H3-True-POV-Interactive

## Resumen

CROWN-H3-True-POV-Interactive es un LoRA de concepto para el modelo de generación de vídeo MiniMax H3, desarrollado por el creador independiente NineCrowns (bajo la etiqueta `[CROWN]`) y publicado en Hugging Face por el usuario S3ckn11g0r. No se trata de un modelo base, sino de un adaptador de bajo rango (rank 64, alpha 64) que se aplica sobre los bloques de vídeo (bloques 10 a 49) de MiniMax H3 en sus variantes Ref2VA, I2VA y T2VA. Su propósito es especializar el modelo en tomas subjetivas en primera persona (POV) con geometría anatómica coherente de las manos del espectador y con continuidad de cámara en un solo plano.

El adaptador se entrenó sobre material real de vídeo en primera persona capturado con cámaras de casco GoPro y con el corpus Ego4D, complementado con metraje de interacción frontal a altura de ojos de un adulto de 175 cm. El entrenamiento se realizó en un clúster de 8 GPU NVIDIA B200. El repositorio ocupa 1,0 GB y contiene un único archivo de pesos en formato safetensors de 910,06 MB.

La relevancia de esta ficha es acotada: se trata de un LoRA de nicho con cero descargas y cero likes en el momento de la consulta, orientado a creadores de vídeo generativo que trabajen con ComfyUI y MiniMax H3. No es un modelo de lenguaje ni un sistema multimodal de propósito general, por lo que muchas de las especificaciones habituales (contexto, cuantización, benchmarks de razonamiento) no aplican o no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax H3; rank 64, alpha 64; aplicado a bloques de vídeo 10-49 |
| Parametros totales | no disponible (peso del adaptador: 910,06 MB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el modelo base se distribuye en bf16 y fp32 segun el archivo) |
| Idiomas soportados | no disponible |
| Licencia | bespoke-lora-license (licencia personalizada; enlace a Civitai del autor) |
| Formato de pesos | safetensors (`CROWN_H3_True_POV_Interactive_V2_r64.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rank 64 y alpha 64 que se inyecta exclusivamente en los bloques de vídeo 10 a 49 del transformer de MiniMax H3, dejando intactos el resto de componentes del modelo base. El pipeline de referencia combina `minimax_h3_ref2va_bf16.safetensors` como difusor de vídeo, `qwen3vl_32b_minimax_h3_bf16.safetensors` como codificador de texto (un Qwen3-VL de 32 000 millones de parámetros) y `minimax_h3_video_vae_fp32.safetensors` como VAE de vídeo en precisión fp32. La configuración de muestreo documentada por el autor es de 25 pasos con sampler euler y scheduler beta, cfg 1.0 y un desplazamiento de sigma específico (`MiniMaxH3SigmaShift` con shift_video 12.0 y shift_audio 3.0).

El entrenamiento se realizó en un clúster de 8 GPU NVIDIA B200 sobre un dataset descrito como 100 % real: metraje subjetivo en primera persona capturado con cámaras de casco GoPro y el corpus Ego4D, más grabaciones de interacción frontal a altura de ojos de 175 cm. No se especifican el número de tokens, el número de pasos de entrenamiento ni si hubo etapas de preferencia (RLHF/DPO). La innovación técnica declarada por el autor es doble: por un lado, forzar que las manos del espectador entren desde el borde inferior de la imagen (posiciones 5 y 7 en punto, justo bajo la lente) en lugar de aparecer lateralmente o duplicadas sobre el personaje; por otro, mantener la continuidad de un plano subjetivo único con inclinaciones de cabeza arriba y abajo sin cortes, preservando la posición de la persona interlocutora en el encuadre.

## Capacidades

- Generación de vídeo texto-a-vídeo (T2VA) con estética subjetiva en primera persona.
- Generación de vídeo imagen-a-vídeo (I2VA) y referencia-a-vídeo (Ref2VA) sobre MiniMax H3.
- Control de geometría de manos en primera persona: las manos propias emergen desde el borde inferior del encuadre (`crown_pov`).
- Continuidad de cámara en un solo plano con inclinación hacia abajo y hacia arriba (tilt-down / tilt-up) a altura de ojos adulta.
- Interacción de mesa: verter bebidas, sostener vasos, entregar objetos y brindar hacia la lente.
- Coherencia de personaje interlocutor durante el movimiento de cámara (la persona permanece sentada y visible).
- Integración con ComfyUI como nodo de LoRA sobre el pipeline de MiniMax H3.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio, visión general ni multilingüismo.

## Casos de uso

- Vlogs en primera persona generados: el LoRA permite crear tomas subjetivas de un creador virtual que sostiene una cámara o un objeto, con las manos entrando correctamente desde abajo, lo que resulta adecuado para contenido de estilo GoPro sin rodaje real.
- Simuladores de citas interactivas: escenas de mesa entre dos personas donde la cámara subjetiva baja para servir una copa y vuelve a subir para el brindis, manteniendo a la interlocutora en el encuadre durante todo el plano.
- Storytelling cinematográfico subjetivo: secuencias de un solo plano con continuidad de mirada para cortometrajes o anuncios narrados desde el punto de vista del protagonista.
- Previsualización de planos POV en producción audiovisual: generación rápida de referencias visuales para decidir encuadres de cámara subjetiva antes del rodaje.
- Contenido para redes sociales de formato inmersivo: clips de 15 segundos con interacción de manos (brindar, entregar un objeto) pensados para consumo vertical u horizontal en primera persona.
- Prototipado de experiencias interactivas: pruebas de concepto de narrativa ramificada donde el usuario elige acciones y el modelo genera la respuesta subjetiva correspondiente.
- Demostraciones técnicas de control anatómico en difusión de vídeo: comparación de la coherencia de manos frente al modelo base sin el adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 910,06 MB en disco y debe cargarse junto al modelo base MiniMax H3, que es el que determina los requisitos reales de memoria.
- El pipeline de referencia emplea un difusor en bf16, un codificador de texto Qwen3-VL de 32 000 millones de parámetros en bf16 y un VAE de vídeo en fp32; el codificador de texto por sí solo requiere del orden de decenas de gigabytes de VRAM en bf16.
- GPU recomendadas: el autor entrenó en 8×NVIDIA B200; para inferencia se requiere hardware de clase数据中心 (A100, H100, H200 o B200) con suficiente VRAM para el pipeline completo.
- No cabe en GPU de consumo convencionales (RTX 4090, 3090) sin cuantización agresiva del codificador de texto y del difusor, y no se documenta una configuración de ese tipo.
- Opciones de despliegue: ComfyUI con los nodos de MiniMax H3; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un pipeline de difusión de vídeo).
- Latencia y throughput: no disponibles. La configuración de referencia usa 25 pasos con sampler euler y scheduler beta.
- Peso recomendado del LoRA en inferencia: 0,80 a 0,85 (la demo se generó únicamente con este LoRA a 0,85).

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CROWN-H3-True-POV-Interactive | LoRA de concepto para vídeo POV | MiniMax H3 | no disponible (adaptador de 910 MB) | no disponible | bespoke-lora-license | Hugging Face, Civitai, RunningHub |
| MiniMax H3 (base) | Modelo de generación de vídeo T2V/I2V/Ref2V | propio | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible en la informacion |
| LoRAs de concepto genéricos para vídeo | Adaptadores de estilo/concepto | distinto según caso | no disponible | no disponible | variable | Civitai, Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones del modelo base MiniMax H3 en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere el modelo base MiniMax H3 y sus componentes (difusor, codificador Qwen3-VL 32B y VAE) para funcionar.
- La licencia es `bespoke-lora-license`, una licencia personalizada cuyo texto no se incluye en la información disponible; el enlace apunta al perfil de Civitai del autor. Es imprescindible revisar sus términos antes de cualquier uso comercial.
- El entrenamiento se basa en metraje real de personas, lo que puede introducir sesgos de apariencia, edad, etnia y contexto cultural no documentados.
- El alcance es muy estrecho: está especializado en POV subjetivo con manos desde el borde inferior y continuidad de plano; fuera de ese dominio puede degradar la calidad o imponer la estética subjetiva de forma no deseada.
- No se documentan idiomas soportados, sesgos medidos, tasas de alucinación visual ni evaluaciones cuantitativas de calidad.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no hay evidencia comunitaria de robustez en producción.
- La fecha de creación indicada (2026-11-11) es posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.
- El uso de material Ego4D puede estar sujeto a las condiciones de licencia del propio corpus, no detalladas en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/S3ckn11g0r/CROWN-H3-True-POV-Interactive
- Civitai del autor: https://civitai.com/models/3042757
- Perfil de licencia en Civitai: https://civitai.com/user/NineCrowns
- RunningHub (demo en la nube): https://www.runninghub.ai/model/public/2120439447178219521
