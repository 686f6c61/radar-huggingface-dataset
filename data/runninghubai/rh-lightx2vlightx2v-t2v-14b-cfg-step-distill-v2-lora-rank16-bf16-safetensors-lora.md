# RunningHubAI/rh-lightx2vlightx2v-t2v-14b-cfg-step-distill-v2-lora-rank16-bf16.safetensors-lora

## Resumen

`rh-lightx2vlightx2v-t2v-14b-cfg-step-distill-v2-lora-rank16-bf16.safetensors-lora` es un adaptador LoRA de rango 16 publicado por RunningHubAI para modelos de generación de vídeo texto-a-vídeo (T2V) de la familia WAN 2.2. El adaptador está pensado para cargarse sobre un modelo base de 14 000 millones de parámetros y aplicar una destilación de los pasos de muestreo y del classifier-free guidance (CFG) propios de LightX2V, de modo que la inferencia pueda ejecutarse con menos pasos y sin CFG explícito.

El repositorio no contiene los pesos completos del modelo: el fichero `lightx2v_T2V_14B_cfg_step_distill_v2_lora_rank16_bf16.safetensors` (156 MiB) es un puntero a un fichero remoto alojado en el repositorio de Kijai (`WanVideo_comfy`), con SHA256 `093cb0e3ba32e68992047fb9982f0ad5e3e00fb0aa01a1dc4884215c60e54597`. Es, por tanto, un artefacto de distribución orientado a ComfyUI, RunningHub y Hugging Face, no un modelo autónomo.

Su relevancia es práctica: permite acelerar sustancialmente la generación de vídeo con WAN 2.2 14B reduciendo el coste computacional del muestreo, algo crítico en pipelines de difusión de vídeo donde el número de pasos y la evaluación doble del CFG dominan el tiempo de inferencia. La información publicada por el autor es, sin embargo, mínima: no hay model card técnica, ni datos de entrenamiento, ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base de difusión de vídeo; el modelo base pertenece a la familia WAN 2.2 |
| Parametros totales | no disponible (el adaptador ocupa 156 MiB en bf16; el modelo base se denomina "14B" en el nombre del fichero) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión de vídeo, no de lenguaje) |
| Tipos de cuantizacion | pesos del adaptador en bf16; cuantizaciones del modelo base no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible; el autor indica que se siga la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (LoRA en bf16) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 en precisión bf16, diseñado para inyectarse en las capas de atención y proyección de un modelo de difusión de vídeo WAN 2.2 de 14B. La función declarada en el nombre del fichero es `cfg_step_distill_v2`: destilación de pasos de muestreo y de CFG, una técnica que entrena al modelo para aproximar la salida que produciría una trayectoria de difusión con classifier-free guidance y muchos pasos, usando una trayectoria con menos pasos y sin guiado explícito. Esto reduce el número de evaluaciones del UNet/DiT por muestra.

No se dispone de información sobre el dataset de entrenamiento, el número de pasos, la composición de datos, ni si se emplearon técnicas adicionales como DPO o RLHF (no aplicables habitualmente en difusión de vídeo). Tampoco se documenta el esquema exacto de destilación (consistencia, trayectoria recta, destilación de teacher, etc.). El puntero apunta a un fichero alojado en `Kijai/WanVideo_comfy`, lo que sugiere que el adaptador es una redistribución de un artefacto previo de la comunidad más que un entrenamiento original verificable.

## Capacidades

- Generación de vídeo texto-a-vídeo (T2V) cuando se combina con el modelo base WAN 2.2 14B.
- Aceleración del muestreo: reduce el número de pasos necesarios y elimina la necesidad de CFG explícito en la inferencia.
- Integración con ComfyUI mediante el nodo de carga de LoRA.
- Compatibilidad con la plataforma RunningHub (carga directa y API).
- No se documentan capacidades de imagen-a-vídeo, control de movimiento, audio, tool calling, agentes ni multilingüismo.
- No se documenta soporte de *thinking mode* ni razonamiento simbólico (no es un modelo de lenguaje).

## Casos de uso

- Generación rápida de clips de vídeo en ComfyUI: cargar el LoRA sobre WAN 2.2 14B y ejecutar el sampler con pocos pasos, sin CFG, para obtener borradores de vídeo en menos tiempo que con la configuración estándar.
- Iteración creativa en preproducción: usar el LoRA para generar múltiples variantes de una misma indicación textual con bajo coste por muestra y seleccionar las mejores antes de un render final de mayor calidad.
- Prototipado de pipelines T2V en producción: integrar el adaptador en flujos automatizados donde el coste por vídeo generado es el factor limitante, aprovechando la reducción de pasos.
- Despliegue en RunningHub: cargar el artefacto directamente en la plataforma del autor y exponerlo mediante su API para generar vídeo bajo demanda.
- Investigación sobre destilación de difusión: comparar la calidad y el coste de este LoRA frente a la inferencia estándar con CFG para estudiar el compromiso entre fidelidad y velocidad.
- Evaluación de adaptadores de la comunidad: servir como referencia para medir el impacto de un LoRA de rango 16 en un modelo base de 14B antes de adoptar configuraciones más agresivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (FVD, CLIP score, etc.), ni comparaciones cuantitativas de velocidad frente a la inferencia estándar con CFG.

## Requisitos de hardware

- VRAM estimada: no disponible en la información publicada. El adaptador en sí ocupa 156 MiB en bf16; el requisito dominante es el del modelo base WAN 2.2 14B, que no se detalla aquí.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (carga de LoRA), RunningHub (plataforma y API). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros adaptadores LoRA de destilación de CFG/pasos para WAN 2.2 con los que comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El repositorio contiene un puntero a un fichero remoto, no los pesos reales; la descarga depende de la disponibilidad del repositorio de origen (`Kijai/WanVideo_comfy`).
- No hay model card técnica: se desconoce el dataset, el procedimiento de destilación y las condiciones exactas de entrenamiento.
- La licencia no está declarada de forma explícita; el autor remite a la licencia del proyecto original o upstream, lo que introduce incertidumbre para uso comercial.
- Es un adaptador, no un modelo autónomo: sin el modelo base WAN 2.2 14B no produce ninguna salida.
- No se documentan sesgos, tasas de alucinación visual ni limitaciones idiomáticas.
- El nombre del repositorio mezcla el prefijo del autor con el nombre del fichero, lo que puede complicar la trazabilidad y la verificación de integridad.
- Uso en producción: al no haber benchmarks ni métricas de calidad, no es posible garantizar un compromiso aceptable entre velocidad y fidelidad sin evaluación propia.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-lightx2vlightx2v-t2v-14b-cfg-step-distill-v2-lora-rank16-bf16.safetensors-lora
- Fichero remoto (Kijai/WanVideo_comfy): https://huggingface.co/Kijai/WanVideo_comfy/raw/20d7d266a972317784a0dae4decd642ab3b2f6fe/Lightx2v/lightx2v_T2V_14B_cfg_step_distill_v2_lora_rank16_bf16.safetensors
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/1999764340683272194
- Página del autor: https://www.runninghub.ai/user-center/1998065655402377217
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API: https://www.runninghub.cn/runninghub-api-doc-en/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
