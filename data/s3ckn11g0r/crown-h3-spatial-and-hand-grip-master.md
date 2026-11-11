# S3ckn11g0r/CROWN-H3-Spatial-And-Hand-Grip-Master

## Resumen

CROWN-H3-Spatial-And-Hand-Grip-Master es un LoRA de concepto para el modelo de generación de vídeo MiniMax H3, desarrollado por el creador independiente NineCrowns (bajo la marca [CROWN]). No se trata de un modelo base, sino de un adaptador de bajo rango que se aplica sobre los pesos de MiniMax H3 en sus variantes Ref2VA, I2VA y T2VA para corregir dos problemas estructurales concretos de la generación de vídeo con personajes y armas: la colocación de la mano sobre la empuñadura de una espada y la oclusión espacial entre dos personajes que se cruzan en profundidad.

El adaptador se entrenó con metraje real de artes marciales y bloqueos dramáticos, sobre un clúster de 8 GPU NVIDIA B200, con rango 64 y alpha 64, aplicado únicamente a los bloques de vídeo 10 a 49 del transformer, y con un adaptador de des-destilación de Ostris. El repositorio ocupa 1,0 GB y contiene un único archivo safetensors de 910,06 MB.

Su relevancia es acotada pero específica: resuelve fallos de coherencia anatómica y espacial que los modelos de vídeo actuales cometen con frecuencia en escenas de combate o de cruce de personajes, sin necesidad de reentrenar el modelo base. Está pensado para flujos de trabajo en ComfyUI y para producción de clips cortos con personajes de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el transformer de vídeo de MiniMax H3; aplicado a bloques de vídeo 10-49 |
| Parametros totales | no disponible (el archivo pesa 910,06 MB; rango 64, alpha 64) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base MiniMax H3) |
| Tipos de cuantizacion | no disponible; el archivo distribuido es safetensors en precisión de entrenamiento |
| Idiomas soportados | no disponible (los prompts del modelo base no se documentan en esta ficha) |
| Licencia | bespoke-lora-license (licencia personalizada del autor, enlazada a su perfil de Civitai) |
| Formato de pesos | safetensors (`CROWN_H3_Spatial_And_Hand_Grip_Master_V1_r64.safetensors`) |

## Arquitectura y entrenamiento

El LoRA se entrena sobre MiniMax H3, un modelo de generación de vídeo texto-a-vídeo y referencia-a-vídeo que combina un transformer de vídeo con un codificador multimodal Qwen3-VL de 32B y un VAE de vídeo. El adaptador se inyecta exclusivamente en los bloques de vídeo 10 a 49, con rango 64 y alpha 64, lo que concentra la modificación en las capas intermedias de atención y feed-forward del transformer de vídeo y deja intactas las capas iniciales y finales.

El entrenamiento se realizó con material real de artes marciales y bloqueos dramáticos, en un clúster de 8 NVIDIA B200, e incorpora un adaptador de des-destilación de Ostris. La configuración de inferencia documentada por el autor es de 25 pasos, sampler euler con scheduler beta, CFG 1.0 y un desplazamiento de sigma específico (shift_video 12.0, shift_audio 3.0). El peso recomendado del LoRA es de 0,65 a 0,75; el vídeo de demostración se generó solo con este LoRA a 0,65.

## Capacidades

- Generación de vídeo texto-a-vídeo y referencia-a-vídeo con el modelo base MiniMax H3 (variantes Ref2VA, I2VA y T2VA).
- Control de agarre de empuñadura con los cinco dedos por debajo de la guarda, evitando que el personaje sujete la hoja o que la empuñadura flote (trigger `crown_grip`).
- Mantenimiento de geometría rígida y recta de la hoja durante cortes lineales, estocadas y paradas cruzadas.
- Cruce espacial en profundidad entre dos personajes con intercambio de posición izquierda-derecha y oclusión primer plano-fondo, preservando rasgos faciales y vestuario sin intercambio de caras (trigger `crown_spatial`).
- Combinación de ambos comportamientos mediante el trigger compuesto `crown_spatial_grip`.
- Compatibilidad con flujos de trabajo de ComfyUI.
- No se documentan capacidades de tool calling, agentes, audio o multilingüismo más allá de lo que herede el modelo base.

## Casos de uso

- Previsualización de escenas de combate cuerpo a cuerpo: el LoRA permite generar clips de esgrima o artes marciales donde la mano agarra correctamente la empuñadura y la hoja no se deforma, útil para animáticas de producciones de acción.
- Storyboards de duelos con dos personajes: con `crown_spatial` se pueden generar cruces en X donde los personajes se intercambian en profundidad sin que se mezclen caras ni vestuarios, adecuado para planificar secuencias de persecución o confrontación.
- Producción de contenido para videojuegos: generación de cinemáticas o tráilers de combate con espadas que requieren coherencia anatómica en las manos y física rígida del arma.
- Publicidad y moda con coreografía de movimiento: escenas donde dos modelos se cruzan en primer y segundo plano manteniendo identidad, útil para spots con reparto múltiple.
- Contenido para redes sociales de temática marcial: clips cortos de artes marciales con detalle anatómico correcto en el agarre del arma, generados en ComfyUI con el LoRA a peso 0,65-0,75.
- Investigación en coherencia de vídeo generado: banco de pruebas para estudiar cómo los adaptadores de bajo rango corrigen sesgos estructurales (manos, oclusión, identidad) en modelos de difusión de vídeo.
- Iteración de previsualización en pipelines de VFX: generación rápida de referencias de bloqueo y parada de espada antes de pasar a producción con captura de movimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El LoRA en sí ocupa 910,06 MB en safetensors, pero requiere cargar el modelo base MiniMax H3 completo (transformer de vídeo, codificador Qwen3-VL de 32B y VAE de vídeo) para inferencia.
- El entrenamiento se realizó en un clúster de 8 NVIDIA B200; no se documentan requisitos de VRAM para inferencia.
- No se dispone de datos sobre si el modelo base cabe en GPU de consumo (RTX 4090, etc.); el codificador Qwen3-VL de 32B y el transformer de vídeo sugieren requisitos de VRAM elevados, pero no se confirman en la información disponible.
- Despliegue documentado: ComfyUI, con los archivos `minimax_h3_ref2va_bf16.safetensors`, `qwen3vl_32b_minimax_h3_bf16.safetensors` y `minimax_h3_video_vae_fp32.safetensors`.
- No se documentan latencia ni throughput estimados.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CROWN-H3-Spatial-And-Hand-Grip-Master | LoRA sobre MiniMax H3 | no disponible (910 MB) | no disponible | bespoke-lora-license | Hugging Face, Civitai, RunningHub |
| MiniMax H3 (base) | Modelo de vídeo texto/referencia-a-vídeo | no disponible | no disponible | no disponible en esta ficha | Requiere acceso al modelo base |
| Otros LoRA de concepto para vídeo | Adaptadores de bajo rango | variable | no disponible | variable | Civitai, Hugging Face |

No se dispone de información suficiente para comparar parámetros, contexto o rendimiento con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Es un LoRA de concepto, no un modelo autónomo: sin el modelo base MiniMax H3 y sus componentes (Qwen3-VL 32B, VAE de vídeo) no es funcional.
- La licencia es bespoke-lora-license, una licencia personalizada enlazada al perfil de Civitai del autor; es imprescindible revisar sus términos antes de cualquier uso comercial.
- El entrenamiento se centró en escenas de combate con espada y cruces de dos personajes; fuera de ese dominio el adaptador puede degradar la generación o introducir artefactos.
- El peso recomendado es 0,65-0,75; valores superiores pueden sobreajustar el estilo y valores inferiores pueden no activar los triggers.
- No se documentan sesgos, tasas de alucinación ni evaluación cualitativa independiente; el único material de validación es el vídeo de demostración del autor.
- No se documentan idiomas soportados ni comportamiento multilingüe de los prompts.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de la comunidad.
- El modelo se publicó con fecha de creación 2026-11-11 según los metadatos de Hugging Face; conviene verificar la vigencia de los enlaces y del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/S3ckn11g0r/CROWN-H3-Spatial-And-Hand-Grip-Master
- Civitai del autor: https://civitai.com/user/NineCrowns
- Modelo en Civitai: https://civitai.com/models/3042756
- RunningHub Online Cloud: https://www.runninghub.ai/model/public/2120439267540602881
