# opticsWolf/decider-2b-fp32-onnx

## Resumen

decider-2b-fp32-onnx es una exportación ONNX del modelo Mapika/decider-2b v12, construido a su vez sobre Qwen3.5-2B-Base. Lo desarrolla el usuario opticsWolf y no es un modelo generativo al uso: se trata de un clasificador de decisión de un solo pase forward que produce decisiones tipadas con probabilidades calibradas, sin decodificación autoregresiva. Su función es resolver tareas de elección entre opciones (choice), puntuación por niveles (score) y clasificación yes/no, devolviendo logits sobre 255 etiquetas de opción en lugar de texto generado.

El modelo tiene 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) y se distribuye como grafo ONNX de 7,6 MB más los pesos en BF16 (3,76 GB) en `model.safetensors`, con un total de repositorio de 5,4 GB. La innovación principal es el método de exportación: el grafo se construye algebraicamente mapeando cada tensor del checkpoint a una referencia BF16 externa con Cast a fp32, en lugar de usar trazado con torch, porque la regla chunked de Gated-DeltaNet rechaza dimensiones simbólicas de secuencia y el export de dynamo se cuelga.

Es relevante para quienes necesitan integrar toma de decisiones estructurada y calibrada en pipelines de producción con ONNX Runtime, evitando la latencia y la no determinista de la generación de texto. La licencia Apache-2.0 y la disponibilidad de una variante q8 con cuantización int8 lo hacen apto para despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-2B-Base con Gated-DeltaNet (chunked); exportado como grafo ONNX opset 18 |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la secuencia de entrada debe ser múltiplo de 64, con right-pad) |
| Tipos de cuantizacion | fp32 (compute), BF16 (pesos de referencia), int8 (variante q8 con MatMulNBits, bloque 32, escalas fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`) + safetensors BF16 (`model.safetensors`), más `tokenizer.json`, `decision.json`, `calibration.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3.5-2B-Base, un transformer con mecanismo Gated-DeltaNet en su variante chunked. El export a ONNX no se realizó mediante trazado de torch: el autor construyó el grafo algebraicamente con la herramienta `convert/ollaya_convert` del proyecto Ollaya, mapeando cada tensor del checkpoint a una referencia BF16 externa más un Cast a fp32. El motivo es que la regla chunked de Gated-DeltaNet rechaza dimensiones simbólicas de secuencia, lo que provoca que el export de dynamo se cuelgue. El grafo resultante tiene opset 18, 7.976 nodos, cero operaciones no estándar y cero tensores sin usar.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si hubo RLHF o DPO en la información proporcionada. El modelo base Mapika/decider-2b v12 incorpora un contrato de decisión (`decider-slots-v1`) con entradas `input_ids` int64 de forma `[rows, seq]` y `slot_pos` int64 de forma `[rows]`, y salida `label_logits` float32 de forma `[rows, 255]` correspondientes a las filas de la cabeza LM atada para las 255 etiquetas de opción. Las temperaturas de calibración están en `calibration.json`: choice 2.465, score 1.0 y noul 0.05 (esta última deliberada para la regla de banda 0.2–0.8 de JevBench); el yes/no calibrado requiere 3.185.

## Capacidades

- Clasificación zero-shot entre opciones: devuelve logits sobre 255 etiquetas de opción en un solo pase forward, sin generación.
- Decisiones tipadas con probabilidades calibradas mediante temperaturas específicas por tarea (choice, score, noul).
- Puntuación por niveles (score): ejecuta una fila yes/no aislada por nivel según el layout de `decision.json`.
- Clasificación yes/no calibrada (requiere temperatura 3.185).
- Salida estructurada: el contrato `decider-slots-v1` define entradas y salidas con formas fijas, apto para integración en pipelines.
- No soporta tool calling ni function calling de forma nativa (no es un modelo generativo).
- No soporta agentes ni razonamiento multi-step (un solo pase forward).
- Capacidades multilingües: no disponible.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: el modelo puede clasificar una consulta entrante entre un conjunto predefinido de hasta 255 categorías en un solo pase forward, con latencia de ~75 ms por fila en CUDA, lo que permite enrutar tickets en tiempo real sin generación de texto.
- Moderación de contenido con umbrales calibrados: usando la salida yes/no calibrada (temperatura 3.185) se puede decidir si un texto infringe una política concreta, aprovechando las probabilidades calibradas para fijar umbrales de decisión reproducibles.
- Puntuación de relevancia en motores de búsqueda: la tarea score permite evaluar pares consulta-documento en niveles discretos ejecutando filas yes/no aisladas por nivel, integrándose en un reranker de un pipeline de recuperación.
- Selección de herramienta o acción en un agente: dado un contexto y un conjunto de acciones posibles, el modelo elige la opción más probable entre las 255 etiquetas, sirviendo como cabecera de decisión ligera en sistemas de agentes.
- Clasificación de intención en asistentes de voz o chatbots: con la variante q8 (int8, bloque 32) se reduce el coste de cómputo manteniendo una paridad de 0.0020 en el peor caso y 0 flips, adecuado para despliegue en servidores con múltiples peticiones concurrentes.
- Etiquetado automático de datos a gran escala: al ser un clasificador de un solo pase sin decodificación, permite procesar lotes de 5 filas en ~373 ms en una RTX 3090, lo que facilita el preetiquetado masivo de datasets para entrenamiento supervisado.
- Control de calidad en pipelines de CI/CD: el contrato de salida estructurada (`label_logits` de forma fija) permite validar decisiones de forma determinista y con paridad torch↔ORT de 1.0e-4 en CPU, integrándose como paso de verificación en automatizaciones.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Grafo | opset 18, 7.976 nodos, cero operaciones no estándar, 0 tensores sin usar |
| Paridad torch↔ORT | max\|Δp\| 1.0e-4 CPU / 1.9e-4 CUDA (choice + noul + score, ganadores coinciden 3/3) |
| CPU | ~1,5–2 s por lote de 5 filas (solo tier lento) |
| CUDA | ~373 ms por lote de 5 filas (~75 ms/fila; Ollaya: 91 ms por 5 consultas en 5090) |
| q8 (int8) | peor caso 0.0020, 0 flips, 10/10 coincidencia golden (incluido noul a 0.05); paridad peor 0.0020, 0 flips |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos BF16 ocupan 3,76 GB; en fp32 el grafo requiere aproximadamente el doble para los tensores casteados, por lo que se recomienda al menos 8 GB de VRAM para inferencia en fp32 y 6 GB para la variante q8.
- GPU recomendadas: RTX 3090 (mediciones oficiales), RTX 5090 (referencia de Ollaya con 91 ms por 5 consultas), A100 y H100 para despliegues de alto throughput.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y RTX 5090; también en GPUs con 8 GB o más para la variante q8.
- Opciones de despliegue: ONNX Runtime con `CUDAExecutionProvider` o CPU; en CUDA es obligatorio `enable_mem_reuse = False` para evitar la corrupción de los valores int64 de forma que leen los Reshape del chunk-scan (error documentado `requested shape {8,16,0,64}`). En CPU se mantienen los valores por defecto.
- Latencia y throughput: ~75 ms por fila en CUDA (RTX 3090), ~373 ms por lote de 5 filas; en CPU ~1,5–2 s por lote de 5 filas, lo que lo limita a tier lento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decider-2b-fp32-onnx | ~1,88 B | no disponible | Clasificación/elección zero-shot | Apache-2.0 | Hugging Face (ONNX) |
| Mapika/decider-2b | ~1,88 B | no disponible | Clasificación/elección zero-shot | Apache-2.0 | Hugging Face (modelo base) |
| Qwen3.5-2B-Base | ~2 B | no disponible | Generación de texto | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo logits sobre 255 etiquetas de opción; no sirve para generación, resumen ni diálogo abierto.
- La secuencia de entrada debe ser múltiplo de 64 y requiere right-pad; no admite longitudes arbitrarias sin preprocesado.
- En CUDA es obligatorio desactivar `enable_mem_reuse`; de lo contrario el planificador de memoria corrompe las formas int64 y la inferencia falla.
- Las temperaturas de calibración son específicas por tarea (choice 2.465, score 1.0, noul 0.05, yes/no 3.185); usar valores distintos invalida la calibración de probabilidades.
- El export no se realizó con trazado de torch, por lo que la procedencia y los hashes deben verificarse en `manifest.json`.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la calibración de probabilidades puede desviarse fuera de la distribución de entrenamiento.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de idioma: no se especifican los idiomas soportados.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda conservar los avisos de atribución y verificar la licencia del modelo base Mapika/decider-2b.
- La variante q8 mantiene paridad de 0.0020 y 0 flips, pero introduce una degradación numérica mínima que conviene validar con datos propios antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/opticsWolf/decider-2b-fp32-onnx
- Modelo base: https://huggingface.co/Mapika/decider-2b
- Repositorio Ollaya (herramienta de conversión): https://github.com/ollaya-dev/ollaya
- Notas de bakeoff (`docs/typed-decision-plan.md` §9c): repositorio `embroider` (no se proporciona URL directa)
