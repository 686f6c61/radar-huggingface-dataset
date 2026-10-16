# joshycodes/qwen3-14b-base-fve-msm-control-s3

## Resumen

qwen3-14b-base-fve-msm-control-s3 es un ajuste supervisado (SFT) del modelo denso Qwen/Qwen3-14B-Base publicado por el usuario joshycodes como artefacto de investigación privado. Forma parte de un proyecto de Anthropic Fellows sobre entrenamiento de carácter con encuadre de "flourishing" (propuesta de Wang y Jermyn, 2026-04-22) y corresponde al paso "chat" de la ejecución `qwen3-14b-base-fve-msm-chat-sft-13k-c-1015-1635`, lanzada sobre 4 GPU NVIDIA H200 en RunPod.

El modelo conserva los 14.768.307.200 parámetros (unos 14,77 mil millones) del modelo base y se ha continuado entrenando con 5.045.572 tokens del dataset joshycodes/fve-msm-chat-sft-13k durante una única época, con longitud de secuencia de 4096 tokens y un learning rate de 1e-05.

Su relevancia pública es muy limitada: no publica benchmarks, no declara idiomas soportados ni cuantizaciones, acumula 0 descargas y 0 "likes", y su licencia internal-research prohíbe la redistribución. Se trata, por tanto, de un checkpoint de investigación útil únicamente dentro del pipeline que lo generó, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, heredada de Qwen/Qwen3-14B-Base; la model card no detalla numero de capas, esquema de atencion ni codificacion posicional |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no procede (no se describe como MoE) |
| Longitud de contexto | no disponible en la model card; la longitud de secuencia usada en el entrenamiento fue de 4096 tokens |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | other / internal-research; artefacto de investigacion privado, no redistribuir |
| Formato de pesos | safetensors |
| Tamano del repositorio | 29,5 GB |
| Modelo base | Qwen/Qwen3-14B-Base (revision `0b0bd3732e2c`) |
| Dataset de ajuste | joshycodes/fve-msm-chat-sft-13k (revision `7cba8972c8ae`) |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-10-15 |

## Arquitectura y entrenamiento

La arquitectura no se describe en la model card; el modelo deriva directamente de Qwen/Qwen3-14B-Base, del que hereda la topología completa de 14.768.307.200 parámetros. El único cambio documentado es el ajuste adicional, etiquetado con los tags `continued-pretraining` y `flourishing-training`, orientado a un paso de tipo conversacional ("chat").

El entrenamiento consistió en una época sobre 5.045.572 tokens del dataset joshycodes/fve-msm-chat-sft-13k, con learning rate 1e-05, secuencia de 4096 tokens, micro-batch de 2 y acumulación de gradiente de 8, ejecutado sobre 4x NVIDIA H200 con semilla 20261015 y el commit de lanzador `a0afb77669ae` del repositorio flourishing-training. La model card reporta una pérdida que pasa de 0,8759 a 0,9961, es decir, un aumento durante el paso; conviene tratarlo como una incidencia o como una métrica distinta de la pérdida de entrenamiento, ya que no se aporta aclaración. No se documenta ningún uso de RLHF, DPO u otras técnicas de alineación posteriores al SFT.

## Capacidades

- Generación de texto y diálogo: el paso ajustado se denomina "chat" y consume un dataset de SFT conversacional, pero no se publican ejemplos, plantillas de prompt ni evaluaciones que confirmen el comportamiento resultante.
- Razonamiento, matemáticas y código: no documentados. Al partir de un modelo base (no instruct), no hay garantía de estas capacidades sin un ajuste adicional.
- Llamada a herramientas (tool calling / function calling): no documentada.
- Uso como agente y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; la model card no declara idiomas y el repositorio no incluye metadato de idioma.
- Capacidades especiales (modo thinking, visión, audio): no documentadas; el modelo base es exclusivamente de texto.
- Entrenamiento de carácter con encuadre "flourishing": es el objetivo declarado del proyecto, aunque no se detallan la metodología, los criterios de evaluación ni las métricas de carácter.

## Casos de uso

- Reproducción interna del pipeline de "flourishing-framed character training": el checkpoint permite repetir el paso de SFT sobre el mismo dataset y comparar la pérdida y el comportamiento frente a otras semillas o configuraciones, siempre dentro del entorno de investigación del proyecto.
- Condición de control en experimentos de carácter: el sufijo "control-s3" del nombre de la ejecución sugiere que este checkpoint actúa como rama de control frente a variantes con otro tratamiento; se usaría como referencia en comparaciones A/B sobre el mismo dataset y los mismos hiperparámetros.
- Línea base de SFT conversacional sobre Qwen3-14B-Base: sirve como punto de partida para medir cuánto aporta un ajuste conversacional de 5 millones de tokens antes de invertir en datasets mayores.
- Estudio de dinámica de entrenamiento: el aumento de pérdida reportado (0,8759 a 0,9961) lo convierte en un caso útil para auditar la estabilidad del pipeline a learning rate 1e-05 y 4096 tokens de secuencia.
- Red-teaming y evaluación de seguridad internos: al no estar alineado con instrucciones humanas, permite estudiar qué comportamientos emergen de un base model tras un único paso de SFT y qué filtros harían falta antes de cualquier despliegue.
- Generación de datos sintéticos para investigación interna: puede emplearse para producir borradores de conversaciones que después se revisan y filtran manualmente, teniendo en cuenta que no hay ninguna evaluación publicada de su calidad.
- Fine-tuning posterior (LoRA/adaptadores): al distribuirse en safetensors y pesar 29,5 GB, puede actuar como checkpoint inicial de ajustes ligeros para experimentos internos de carácter o estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye la tabla de entrenamiento del paso "chat" (5.045.572 tokens vistos, pérdida 0,8759 a 0,9961) y las instrucciones para ejecutar la evaluación con `uv run eval.py --model joshycodes/qwen3-14b-base-fve-msm-control-s3 --eval all`, sin resultados asociados.

## Requisitos de hardware

- Pesos en BF16/FP16: aproximadamente 29,5 GB, en línea con el tamaño del repositorio. Con caché KV y overhead del runtime se estiman 35-40 GB de VRAM.
- INT8 (aproximadamente 1 byte por parámetro): unos 15 GB de pesos y 18-20 GB de VRAM estimados.
- INT4 (aproximadamente 0,5 bytes por parámetro): unos 7,5-9 GB de pesos y 10-12 GB de VRAM estimados. Ninguna de estas cuantizaciones se distribuye en el repositorio, por lo que habría que generarlas.
- GPU recomendadas para inferencia en BF16: A100 80 GB, H100 80 GB, H200 o configuraciones multi-GPU de 48 GB (L40S, RTX A6000 Ada) con tensor parallelism. El entrenamiento documentado se realizó en 4x NVIDIA H200.
- GPU de consumo: en BF16 no cabe en ninguna GPU de consumo actual. Previa cuantización a INT4, es viable en RTX 4090 o RTX 3090 (24 GB) y, con contexto reducido y menos margen, en tarjetas de 16 GB como RTX 4080.
- Opciones de despliegue: vLLM, TGI o SGLang cargando los safetensors directamente; llama.cpp y Ollama requieren convertir previamente los pesos a GGUF. El autor propone evaluar con `uv run eval.py`.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| qwen3-14b-base-fve-msm-control-s3 | 14,77 B (denso) | no disponible en la model card | other / internal-research (no redistribuible) | safetensors en HuggingFace, 0 descargas | no |
| Qwen/Qwen3-14B-Base | 14,77 B (es el modelo base) | no disponible en la informacion proporcionada | no disponible | pesos publicos en HuggingFace | no disponible |
| Otras variantes de Qwen3-14B y alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No ha sido posible completar la comparativa con datos verificados: la búsqueda web realizada no devolvió resultados relevantes (únicamente páginas comerciales de Prime Video) y la información proporcionada no incluye especificaciones ni métricas de modelos alternativos.

## Limitaciones y advertencias

- Licencia restrictiva: se declara como `other` con nombre `internal-research` y la propia model card indica "Private research artifact — do not redistribute". No está permitido redistribuir los pesos ni, presumiblemente, usarlos con fines comerciales.
- Ausencia total de validación: 0 descargas y 0 "likes" en el momento de redactar esta ficha, sin benchmarks ni evaluaciones publicadas.
- Trazabilidad limitada: no se documentan la composición del dataset fve-msm-chat-sft-13k, los criterios de filtrado ni la plantilla de prompt empleada en el SFT.
- Pérdida creciente durante el entrenamiento (0,8759 a 0,9961), un comportamiento atípico en un ajuste supervisado que no se explica en la model card.
- Sin alineación posterior al SFT: no hay RLHF, DPO ni guardarraíles documentados, por lo que es esperable un riesgo elevado de respuestas inapropiadas, sesgadas o alucinadas, especialmente al partir de un modelo base.
- Idiomas no declarados: no es posible saber si el ajuste conserva el multilingüismo del modelo base ni con qué calidad.
- Contexto de entrenamiento de 4096 tokens: aunque el modelo base pueda soportar ventanas mayores, el ajuste se hizo con secuencias cortas, lo que puede degradar el comportamiento en contextos largos.
- Riesgo de alucinación no medido: no existen evaluaciones de fidelidad factual ni de tasas de alucinación.
- Sesgos desconocidos: al no documentarse la procedencia de los datos de ajuste, no se puede caracterizar el sesgo introducido.
- Uso en producción desaconsejado con la información disponible: sin benchmarks, sin cuantizaciones publicadas y con una licencia de investigación interna, cualquier despliegue requeriría una evaluación propia exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-14b-base-fve-msm-control-s3
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B-Base
- Dataset de ajuste: https://huggingface.co/datasets/joshycodes/fve-msm-chat-sft-13k
- Repositorio flourishing-training (referenciado en la model card por el commit `a0afb77669ae`): no disponible como URL en la informacion proporcionada
- Script de evaluación `eval.py` (mencionado en la model card): no disponible como URL en la informacion proporcionada
- Paper o blog del proyecto (propuesta de Wang y Jermyn, 2026-04-22): no disponible en la informacion proporcionada
- Resultados de la busqueda web: no se encontraron enlaces relevantes al modelo
