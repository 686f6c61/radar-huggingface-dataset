# altertable/vela3-fast-onnx-int8

## Resumen

vela3-fast-onnx-int8 es la versión cuantizada a int8 y exportada a ONNX del componente de decisión de vllm-sr/vela3-fast, un encoder de 0,4 mil millones de parámetros perteneciente a la familia Vela 3.0 desarrollada por KR Labs y vLLM Semantic Router. El modelo original deriva de dmis-lab/UltraBERT-380M mediante ajuste fino, y esta variante ha sido producida por el usuario altertable para ejecutar clasificación zero-shot sobre CPU sin depender de PyTorch.

La relevancia de esta ficha radica en su orientación práctica: no es un modelo generativo, sino un enrutador semántico y motor de decisión. Dado un estado (texto libre o un objeto JSON) y una pregunta con opciones descritas, devuelve una distribución de probabilidad sobre las opciones (`choice`) o una probabilidad de sí (`noul`). Esto lo hace útil para enrutado de tickets, clasificación de intenciones y desambiguación en pipelines de agentes.

El empaquetado es deliberadamente ligero: el grafo ONNX ocupa 452 MB (frente a 1,52 GB en fp32), las proyecciones del encoder se almacenan como enteros de 8 bits y el embedding en fp16, y ONNX Runtime las convierte de nuevo a fp32 al cargar. No hay calibración, destilación ni ajuste fino adicional: los pesos son los mismos que los del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivado de UltraBERT-380M) con cabeza de readout, exportado como grafo ONNX único |
| Parámetros totales | 0,4 B (modelo base vela3-fast) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens por pregunta; los prompts de hasta 129 tokens comparten pasadas de ~128 tokens |
| Tipos de cuantización | Int8 en proyecciones del encoder y fp16 en el embedding; opción `low_memory=True` con MatMulNBits int8 en tiempo de ejecución |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model/model.onnx`), tokenizer en JSON |
| Tamaño del repositorio | 1,9 GB |
| Tamaño del grafo ONNX | 452 MB (int8 + fp16 embedding); 1,52 GB el grafo fp32 equivalente |
| Dependencias | `onnxruntime>=1.24`, `tokenizers>=0.20`, `numpy>=1.26` |
| Pipeline | `zero-shot-classification` |

## Arquitectura y entrenamiento

El modelo es un encoder transformer con una cabeza de readout integrada en un único grafo ONNX: la entrada son identificadores de token y la salida es un logit por opción. Cada pregunta se serializa con un formato propio (`[Q] pregunta [O] opción ... [SEP_SCHEMA] [SEG_user] estado`), y el estado se repite por cada pregunta. Los marcadores estructurales son tokens especiales con identificadores fijos (49152 para `[Q]`, 49153 para `[O]`, 49155 para `[SEP_SCHEMA]`).

No se realizó ningún proceso de calibración, destilación ni ajuste fino para producir esta versión: la cuantización consiste únicamente en almacenar las proyecciones como int8 y el embedding como fp16, y ONNX Runtime las reconstruye a fp32 al cargar, de modo que la inferencia ejecuta los mismos kernels fp32 fusionados que el grafo de precisión completa. El modelo base vela3-fast es a su vez un ajuste fino de dmis-lab/UltraBERT-380M; la model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica destacable es el batching de prompts cortos: las preguntas de hasta 129 tokens comparten pasadas de aproximadamente 128 tokens mediante una ventana deslizante que mantiene la atención de cada prompt aislada sobre sí mismo, lo que reduce el tiempo entre 1,3 y 1,5 veces cuando se consultan varias preguntas sobre un estado corto. Los prompts largos se ejecutan uno por pasada.

## Capacidades

- Clasificación zero-shot con tipo de pregunta `choice`: devuelve una probabilidad por cada opción definida por el usuario.
- Preguntas de tipo `noul` (sí/no): devuelve la probabilidad de que la respuesta sea afirmativa.
- Entrada de estado flexible: acepta tanto una cadena de texto como un objeto JSON.
- Contexto largo de hasta 32.768 tokens por pregunta, con crecimiento lineal de memoria a partir de 4.096 tokens.
- Ejecución sin PyTorch, únicamente con `onnxruntime`, `tokenizers` y `numpy`.
- Modo `low_memory=True` que mantiene los pesos en int8 en tiempo de ejecución (MatMulNBits), con un pico de RAM de aproximadamente 1,3 GB frente a 2,2 GB, a costa de ser varias veces más lento.
- Integración con el kit Decision Index mediante `decision_index_engine.py`.
- No soporta otros tipos de pregunta (por ejemplo `span`): lanzan `Unsupported`.
- No soporta tool calling, agentes multi-step, visión, audio ni modo thinking; es un modelo de decisión, no generativo.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto de un ticket, el modelo devuelve la probabilidad de que pertenezca a cada equipo (por ejemplo `billing`, `tech`, `sales`) usando preguntas de tipo `choice` con descripciones por opción; el ejemplo incluido en el repositorio muestra `billing` con 0,996 de probabilidad para "I was charged twice".
- Detección de urgencia o intención de reembolso: con preguntas de tipo `noul` se obtiene p(yes) para cuestiones como "Does the customer ask for money back?", útil para priorizar colas o disparar flujos automáticos.
- Clasificación de intenciones en asistentes conversacionales: el modelo puede etiquetar cada turno del usuario sobre un estado JSON que incluya historial o metadatos, aprovechando el contexto de hasta 32.768 tokens.
- Enrutado semántico en pipelines de agentes: como componente de decisión barato en CPU, permite elegir qué herramienta o subagente debe atender una petición antes de invocar un LLM generativo, reduciendo coste y latencia.
- Moderación y triaje de contenido: preguntas binarias (`noul`) sobre textos o registros JSON para decidir si un caso requiere revisión humana, con umbrales ajustables sobre la probabilidad devuelta.
- Despliegue en entornos sin GPU: al ejecutarse solo con ONNX Runtime sobre CPU, encaja en contenedores ligeros, funciones serverless o dispositivos de borde donde no hay acelerador disponible.
- Evaluación por lotes de decisiones: el batching de prompts cortos (hasta 129 tokens) permite resolver varias preguntas sobre el mismo estado en una sola pasada, adecuado para procesos de etiquetado masivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente aporta datos de rendimiento operativo: el grafo int8 ocupa 452 MB frente a 1,52 GB del fp32, el pico de RAM es de aproximadamente 2,2 GB en modo normal y de 1,3 GB con `low_memory=True`, y el batching de preguntas cortas reduce el tiempo entre 1,3 y 1,5 veces.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para CPU. En modo normal el pico de RAM es de aproximadamente 2,2 GB; con `low_memory=True`, de aproximadamente 1,3 GB.
- GPU: no se documenta soporte GPU específico; el grafo está pensado para ONNX Runtime sobre CPU.
- GPU de consumo: irrelevante para el caso de uso previsto, ya que no requiere acelerador.
- Despliegue: ONNX Runtime (`onnxruntime>=1.24`), con `tokenizers` y `numpy`; también mediante el kit Decision Index (`python -m decision_index run --engine decision_index_engine:VelaOnnxEngine`).
- Latencia y throughput: no se publican cifras absolutas; solo la mejora relativa de 1,3 a 1,5 veces al agrupar preguntas cortas en pasadas de ~128 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| altertable/vela3-fast-onnx-int8 | 0,4 B | 32.768 | ONNX int8 | Apache-2.0 | Decisión zero-shot en CPU |
| vllm-sr/vela3-fast (base) | 0,4 B | 32.768 | No disponible | No disponible | Decisión zero-shot en precisión completa |
| dmis-lab/UltraBERT-380M | 380 M | No disponible | No disponible | No disponible | Encoder biomédico |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo frente a estas alternativas; la comparación se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte multilingüe declarado.
- Es un modelo de decisión, no generativo: no produce texto libre ni razonamiento multi-step.
- Los nombres de opción sin descripción ("billing", "tech") se responden con menos fiabilidad; hay que acompañar cada opción de una descripción de lo que incluye.
- Los tipos de pregunta distintos de `choice` y `noul` (por ejemplo `span`) lanzan `Unsupported`.
- Las entradas superiores a 32.768 tokens lanzan `Unsupported`; no se truncan.
- El batching de varios prompts en una pasada exige que cada uno tenga como máximo 129 tokens.
- No se ha realizado calibración en la cuantización; el comportamiento debe validarse en el dominio concreto antes de producción.
- Riesgo de alucinación y sesgos: no documentado en la información disponible, aunque al tratarse de un clasificador los errores se manifiestan como asignaciones de probabilidad incorrectas.
- Licencia Apache-2.0, que permite uso comercial; deben respetarse las atribuciones indicadas en `NOTICE` y `LICENSES.md` respecto a vela3-fast y UltraBERT-380M.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación limitado.

## Enlaces

- [Hugging Face: altertable/vela3-fast-onnx-int8](https://huggingface.co/altertable/vela3-fast-onnx-int8)
- [Modelo base: vllm-sr/vela3-fast](https://huggingface.co/vllm-sr/vela3-fast)
- [Familia Vela 3.0](https://huggingface.co/vllm-sr/vela3-fast#the-family)
- [Modelo de origen: dmis-lab/UltraBERT-380M](https://huggingface.co/dmis-lab/UltraBERT-380M)
