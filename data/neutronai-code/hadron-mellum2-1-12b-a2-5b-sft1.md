# neutronai-code/Hadron-Mellum2.1-12B-A2.5B-sft1

## Resumen

Hadron-Mellum2.1-12B-A2.5B-sft1 es un modelo de generacion de texto publicado en Hugging Face por el usuario neutronai-code. El nombre sugiere que se trata de un ajuste fino supervisado (SFT, segun la etiqueta `trl` y `sft`) sobre el modelo base Mellum 2.1, en una variante con 12.149.923.072 parametros totales y una designacion "A2.5B" que, por convencion en modelos de arquitectura MoE, apuntaria a aproximadamente 2.500 millones de parametros activos por token. No obstante, la model card no confirma explicitamente la arquitectura ni el numero de parametros activos.

El modelo se distribuye en formato `safetensors` para la libreria `transformers`, con un repositorio de 40,0 GB, lo que es coherente con pesos en precision bf16/fp16 para un modelo de unos 12 000 millones de parametros. La model card es practicamente un esqueleto autogenerado por Hugging Face y no aporta informacion sobre datos de entrenamiento, licencia, idiomas, contexto ni evaluacion.

La relevancia de esta ficha es, por tanto, limitada y fundamentalmente descriptiva: se trata de un checkpoint SFT de un modelo derivado de Mellum 2.1, con cero descargas y cero likes en el momento de la consulta, sin documentacion tecnica publicada. Cualquier uso en produccion requeriria validacion independiente de capacidades, licencia y comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE con ~2,5B activos; no confirmado en la model card) |
| Parametros totales | 12.149.923.072 |
| Parametros activos | no disponible (la designacion "A2.5B" sugiere ~2,5B, sin confirmacion oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura. El identificador del repositorio incluye "12B-A2.5B", patron habitual para describir modelos con mezcla de expertos (MoE) con aproximadamente 12 000 millones de parametros totales y unos 2 500 millones activos por token, pero esta interpretacion no viene confirmada por el autor. Tampoco se especifica si el modelo base Mellum 2.1 emplea atencion estandar, atencion lineal u otra variante, ni la longitud de contexto nativa.

En cuanto al entrenamiento, las etiquetas `trl` y `sft` indican que el checkpoint se ha producido mediante ajuste fino supervisado con la libreria TRL de Hugging Face. No se publican datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, hiperparametros ni infraestructura de computo. La model card incluye la plantilla estandar de Hugging Face con marcadores "[More Information Needed]" en todas las secciones tecnicas.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` sugiere un ajuste orientado a dialogos multi-turno, aunque no se detallan formatos de prompt ni plantillas de chat.
- Ajuste fino supervisado (SFT): el modelo ha sido entrenado con TRL, lo que tipicamente mejora la adherencia a instrucciones frente al modelo base, sin datos publicados que lo verifiquen.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse en la infraestructura de Inference Endpoints de Hugging Face.
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling, agentes o modo thinking: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales: al estar ajustado con SFT y etiquetado como conversacional, puede emplearse para experimentar con dialogos multi-turno en entornos de laboratorio, siempre que se valide previamente su calidad con un conjunto de evaluacion propio.
- Investigacion sobre ajuste fino: sirve como punto de partida para estudiar el efecto del SFT sobre el modelo base Mellum 2.1, comparando respuestas antes y despues del ajuste en tareas controladas.
- Evaluacion comparativa de modelos derivados: util para probar pipelines de evaluacion (perplejidad, win-rate, benchmarks de instrucciones) sobre checkpoints de la comunidad con escasa documentacion.
- Despliegue en Inference Endpoints: la etiqueta `endpoints_compatible` permite subirlo a la infraestructura gestionada de Hugging Face para pruebas de latencia y throughput sin montar servidor propio.
- Generacion de texto en lote para tareas internas: con 12 000 millones de parametros y pesos safetensors, puede ejecutarse en pipelines offline de generacion de borradores o resumenes, sujeto a validacion de calidad.
- Base para tecnicas de alineacion posteriores: al ser un checkpoint SFT, es un candidato razonable para aplicar DPO, ORPO o RLHF en experimentos academicos, aunque la ausencia de licencia clara limita su uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 24-25 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 32 GB para contextos cortos y 48-80 GB para contextos largos.
- Cuantizacion a 8 bits: en torno a 12-13 GB de pesos, viable en GPUs de 24 GB (RTX 3090, RTX 4090, A10G, L4) con margen ajustado.
- Cuantizacion a 4 bits: en torno a 6-7 GB de pesos, viable en GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080, A4000), aunque no se publican pesos GGUF/AWQ/GPTQ oficiales.
- GPUs recomendadas para precision completa: A100 80 GB, H100 80 GB, H200, o multi-GPU con tensor parallelism en 2x A100 40 GB.
- Despliegue: al ser un modelo `transformers` con pesos safetensors, es compatible con vLLM, TGI, SGLang y transformers+accelerate; no se confirma soporte de llama.cpp u Ollama por ausencia de pesos GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: la model card es una plantilla autogenerada sin datos de arquitectura, entrenamiento, evaluacion ni uso previsto.
- Licencia no especificada: no puede asumirse uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Idiomas no declarados: se desconoce si el modelo esta optimizado para castellano o para otros idiomas.
- Riesgo de alucinacion y sesgos: sin evaluacion publicada ni informacion sobre datos de entrenamiento, no es posible caracterizar sesgos ni tasas de alucinacion.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin verificar experimentalmente la ventana efectiva.
- Cero adopcion: con 0 descargas y 0 likes, no existe evidencia de la comunidad sobre su calidad o estabilidad.
- Checkpoint derivado: al ser un SFT sobre Mellum 2.1, hereda las limitaciones del modelo base, que tampoco estan documentadas en esta ficha.
- Nombre potencialmente enganoso: la designacion "A2.5B" no esta confirmada como parametros activos; conviene verificar la configuracion real (`config.json`) antes de asumir un regimen MoE.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neutronai-code/Hadron-Mellum2.1-12B-A2.5B-sft1
- Referencia citada en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact#compute
