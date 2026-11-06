# opticsWolf/laya-multilingual-fp32-onnx

## Resumen

`laya-multilingual-fp32-onnx` es una exportación a ONNX en precisión FP32 del modelo `convaiinnovations/laya-multilingual`, un encoder basado en mmBERT-base orientado a tareas de toma de decisiones y clasificación zero-shot. Lo publica el usuario opticsWolf en Hugging Face bajo licencia Apache-2.0, con el objetivo de facilitar el despliegue en producción mediante ONNX Runtime sin dependencia de PyTorch. El modelo base está especializado en seleccionar una opción entre varias alternativas (choice/decision-making) y en clasificación zero-shot multilingüe, con un vocabulario multilingüe de 34 MB.

La exportación mantiene un único grafo ONNX (opset 18, 1479 nodos, sin operadores no estándar) con cinco entradas en formato marker y dos salidas: `logits` y `act_logits`. El paquete incluye el grafo principal, el fichero de datos externo (1.29 GB), el tokenizador y la configuración del agente RL sin modificar respecto al upstream. La verificación de paridad entre PyTorch y ONNX Runtime en CPU reporta una diferencia máxima absoluta de 7.9e-6 sobre `logits`, lo que indica una fidelidad numérica muy alta.

El interés actual de esta ficha radica en que ofrece una vía de inferencia portable (CPU y CUDA) para un modelo de decisión multilingüe, con latencias medidas de aproximadamente 97 ms por lote de 4 filas en CPU y 10 ms en CUDA sobre una RTX 3090. No obstante, se trata de un artefacto derivado con cero descargas y cero likes en el momento de la consulta, y su documentación es escasa en cuanto a capacidades, benchmarks y datos de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT-base) exportado a ONNX, single-graph, opset 18, 1479 nodos |
| Parametros totales | no disponible (repo de 2.8 GB; fichero de datos ONNX de 1.29 GB en FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | max_len 1024; head_max_len 256 |
| Tipos de cuantizacion | FP32 (principal), FP16 (variante CUDA), q8 (mencionada); int8 dinámico medido y rechazado por deriva |
| Idiomas soportados | multilingüe (vocabulario multilingüe de 34 MB); lista concreta de idiomas no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`laya-multi-fp32.onnx` + `laya-multi-fp32.onnx.data`), tokenizer.json, rl_agent_config.json, manifest.json |

## Arquitectura y entrenamiento

El modelo base es un encoder transformer de tipo mmBERT-base, exportado a un único grafo ONNX con cinco entradas en formato marker y dos cabezas de salida (`logits` y `act_logits`). La exportación conserva la configuración del agente RL (`rl_agent_config.json`) sin cambios respecto al upstream y fija `max_len` en 1024 y `head_max_len` en 256. El grafo emplea exclusivamente operadores estándar de ONNX (opset 18, cero operadores no estándar), lo que facilita su ejecución en distintos backends de ONNX Runtime.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineación. La model card únicamente indica que la receta y el arnés de exportación son los mismos que los del modelo hermano `laya-typed-decisions-fp32-onnx`. La innovación técnica destacable de esta ficha es la propia exportación: paridad numérica de 7.9e-6 frente a PyTorch en CPU, y una variante FP16 con deriva de 9.7e-3 pensada exclusivamente para CUDA, ya que en CPU no aporta mejora de latencia.

## Capacidades

- Clasificación zero-shot: pipeline declarado en Hugging Face como `zero-shot-classification`.
- Toma de decisiones y selección entre opciones (tags `decision-making` y `choice`).
- Procesamiento multilingüe gracias al vocabulario multilingüe del tokenizador.
- Inferencia en CPU y CUDA mediante ONNX Runtime, con soporte de execution providers.
- Salidas duales (`logits` y `act_logits`) que permiten distinguir entre puntuaciones de clasificación y puntuaciones de acción del agente.
- Soporte de tool calling, function calling, agentes multi-paso, visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento de decisiones en pipelines de agentes: el modelo puede puntuar opciones candidatas y seleccionar una acción concreta; su latencia de ~10 ms por lote de 4 filas en CUDA lo hace viable como componente de routing en línea.
- Clasificación zero-shot de tickets o consultas: al aceptar etiquetas definidas en tiempo de inferencia, permite categorizar texto multilingüe sin reentrenamiento, usando la ventana de 1024 tokens.
- Moderación y triaje de contenido: la cabeza de clasificación puede asignar probabilidades a categorías predefinidas y priorizar revisiones humanas según el score.
- Despliegue en entornos sin GPU: la variante FP32 en CPU (~97 ms por lote de 4 filas) permite servir el modelo en infraestructura convencional con ONNX Runtime.
- Integración en servicios de decisión multilingüe: el tokenizador multilingüe y la licencia Apache-2.0 facilitan su incorporación en productos comerciales que atienden varios idiomas.
- Evaluación comparativa de políticas de decisión: las salidas `logits` y `act_logits` permiten analizar la preferencia del modelo entre alternativas en experimentos de investigación sobre agentes.
- Serving con aceleración CUDA en GPUs de consumo: la variante FP16 reduce a la mitad el espacio de descarga y VRAM, aunque su uso está restringido a CUDA por diseño.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Grafo | opset 18, 1479 nodos, cero operadores no estándar |
| Paridad PyTorch↔ORT (CPU, `logits`) | max\|Δ\| 7.9e-6 |
| CPU (RTX 3090 + Ryzen 9 5950X) | ~97 ms por lote de 4 filas |
| CUDA (RTX 3090 + Ryzen 9 5950X) | ~10 ms por lote de 4 filas |
| Deriva CUDA EP | 5.7e-3 (orden de kernels); goldens solo en CPU |
| FP16: paridad torch-ORT (CPU) | max\|Δ\| 9.7e-3 en `logits` |
| FP16: CPU | ~97 ms (sin mejora; solo CUDA) |
| FP16: CUDA | ~21 ms (sensible a reloj; repetición controlada pendiente) |
| int8 dinámico | rechazado: deriva 2.8–5.4 en escala de logits, 3/4 flips de argmax en la sonda |
| q8 | peor caso 0.097, 0 flips, 7/7 coincidencia con goldens |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero de datos FP32 ocupa 1.29 GB; en FP16 se reduce aproximadamente a la mitad. La VRAM efectiva depende del tamaño de lote y de la longitud de secuencia (hasta 1024 tokens).
- GPU recomendadas: RTX 3090 (medida en la model card); por tamaño, cabría en GPUs consumer con al menos 4 GB de VRAM libre en FP16, aunque no se han publicado mediciones en otras GPU.
- CPU: viable con ONNX Runtime en CPU (~97 ms por lote de 4 filas), lo que permite despliegue sin GPU.
- Opciones de despliegue: ONNX Runtime con execution providers CPU y CUDA; la model card menciona `laya.onnx_agent.ONNXAgent` para el serving.
- Latencia y throughput: ~97 ms por lote de 4 filas en CPU y ~10 ms en CUDA (FP32); ~21 ms en CUDA para FP16. No se han publicado cifras de throughput sostenido.
- Advertencia: los goldens de paridad son solo CPU; en CUDA se observa una deriva de 5.7e-3 atribuida al orden de kernels.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| opticsWolf/laya-multilingual-fp32-onnx | no disponible (encoder mmBERT-base) | 1024 | ONNX FP32/FP16/q8 | Apache-2.0 | Exportación ONNX de un modelo de decisión multilingüe |
| convaiinnovations/laya-multilingual | no disponible (mmBERT-base) | 1024 | PyTorch (upstream) | no disponible | Modelo base del que deriva esta exportación |
| opticsWolf/laya-typed-decisions-fp32-onnx | no disponible | no disponible | ONNX FP32 | Apache-2.0 | Modelo hermano con la misma receta de exportación |

No se dispone de información sobre otros modelos comparables de la misma categoría (clasificación zero-shot multilingüe con encoder) en la documentación proporcionada.

## Limitaciones y advertencias

- Artefacto derivado: es una exportación ONNX, no un modelo entrenado desde cero; su calidad depende enteramente del modelo base `convaiinnovations/laya-multilingual`.
- Documentación incompleta: no se especifican parámetros totales, composición del dataset, idiomas concretos ni resultados de benchmarks de calidad.
- Deriva numérica en CUDA: 5.7e-3 en FP32 y 9.7e-3 en FP16; los goldens de paridad solo se validan en CPU, por lo que la reproducibilidad en GPU no está garantizada.
- Cuantización int8 dinámica rechazada: produce 3/4 flips de argmax en la sonda, por lo que no es apta para producción sin calibración estática.
- La variante FP16 no aporta mejora en CPU y está diseñada solo para CUDA.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un encoder de clasificación, el riesgo se manifiesta como etiquetas mal asignadas más que como texto generado.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base upstream.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.
- Fecha de creación futura (2026-10-29) en los metadatos, lo que puede indicar un artefacto reciente o una anomalía en el registro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/opticsWolf/laya-multilingual-fp32-onnx
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Modelo hermano (typed-decisions): https://huggingface.co/opticsWolf/laya-typed-decisions-fp32-onnx
