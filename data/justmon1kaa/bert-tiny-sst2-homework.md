# JustMon1kAa/bert-tiny-sst2-homework

## Resumen

`JustMon1kAa/bert-tiny-sst2-homework` es un clasificador binario de sentimiento en ingles obtenido por ajuste fino de `prajjwal1/bert-tiny` sobre el corpus SST-2 (Stanford Sentiment Treebank). El modelo resuelve una tarea muy acotada: asignar la etiqueta NEGATIVE (0) o POSITIVE (1) a resenas cortas de cine en ingles. Con 4.386.178 parametros, es un experimento educativo de un autor individual, no un modelo de proposito general.

La relevancia practica es limitada pero concreta: sirve como referencia de bajo coste para tareas de clasificacion de texto en entornos con restricciones severas de memoria (dispositivos edge, navegador via Transformers.js, microservicios con latencia minima) y como ejemplo reproducible de pipeline de ajuste fino con exportacion ONNX validada contra PyTorch en modo eval.

El ajuste se realizo sobre 4096 ejemplos de entrenamiento de SST-2, con 512 ejemplos adicionales del split de entrenamiento para seleccionar la epoca, y 872 ejemplos del split de validacion oficial reservados para evaluacion final. El resultado reportado es accuracy 0,763761 y macro F1 0,763717.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (familia BERT-tiny) |
| Parametros totales | 4.386.178 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como limite explicito; entrenado con max length 96 |
| Tipos de cuantizacion | no disponible en la model card; export ONNX en fp32 (dtype recomendado por el autor) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (pesos del modelo base y del ajuste); derechos del dataset SST-2 separados |
| Formato de pesos | safetensors, ONNX (`onnx/model.onnx`) |

## Arquitectura y entrenamiento

Se trata de un transformer encoder de tipo BERT en su variante "tiny" (2 capas y dimension oculta reducida en el modelo base `prajjwal1/bert-tiny`), con una cabeza de clasificacion de secuencia para dos etiquetas. No incorpora innovaciones arquitectonicas: es un ajuste fino supervisado estandar sobre una tarea de clasificacion.

El entrenamiento uso 4096 ejemplos del split de entrenamiento de SST-2, con 512 ejemplos adicionales de ese mismo split para seleccionar la epoca, dejando el split de validacion oficial (872 ejemplos) como conjunto de evaluacion final. Hiperparametros: 4 epocas, optimizador AdamW, learning rate 5e-5, batch size 64, longitud maxima 96 tokens, semilla 42. No se menciona RLHF, DPO ni tecnicas de alineacion. La exportacion ONNX se reparo sin reentrenar y se valido contra PyTorch en modo eval sobre seis entradas en tres lotes de formas distintas, con un error absoluto maximo en logits de 2,9802322e-07.

## Capacidades

- Clasificacion binaria de sentimiento (NEGATIVE / POSITIVE) en resenas cortas de cine en ingles.
- Inferencia en fp32 via Transformers y via ONNX Runtime (archivo `onnx/model.onnx`).
- Compatibilidad con Transformers.js para ejecucion en navegador.
- Compatibilidad declarada con text-embeddings-inference y endpoints compatibles (segun tags del repositorio).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue: no; solo ingles.
- No es un modelo generativo: no produce texto libre, solo logits de dos clases.

## Casos de uso

- Clasificacion de resenas de cine en pipelines de analitica: dado un volumen de resenas cortas en ingles, el modelo asigna polaridad con un coste computacional minimo (4,4 M de parametros), adecuado para procesar lotes grandes en CPU.
- Filtrado de resenas toxicas o negativas en foros y tiendas: el clasificador permite enrutar resenas negativas a moderacion humana, con la advertencia de que su accuracy de 0,76 limita la precision del filtro.
- Etiquetado previo en proyectos de anotacion: el modelo puede preetiquetar un corpus de resenas para que los anotadores solo corrijan, reduciendo el esfuerzo frente a anotacion desde cero.
- Inferencia en navegador con Transformers.js: al estar exportado a ONNX en fp32, puede ejecutarse del lado del cliente en aplicaciones web que necesiten clasificar texto sin enviar datos a un servidor.
- Microservicio de clasificacion en contenedores ligeros: el tamano reducido del modelo permite desplegarlo en instancias con poca RAM y obtener latencias de milisegundos por peticion.
- Baseline educativo y de investigacion: sirve como referencia de partida en experimentos de clasificacion de sentimiento para medir la mejora de modelos mayores o de tecnicas de aumento de datos.
- Prueba de pipelines de exportacion ONNX: el autor documenta la validacion numerica de la exportacion, lo que lo hace util como ejemplo de control de calidad en la conversion de modelos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy (split de validacion SST-2, 872 ejemplos) | 0,763761 |
| Macro F1 (mismo split) | 0,763717 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El split de test con etiquetas ocultas de SST-2 no fue evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 para los pesos (4,4 M de parametros, aproximadamente 17,5 MB de pesos mas overhead de activaciones y runtime); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU sin problema. Cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) es sobredimensionada para esta carga.
- Cabe en GPU consumer: si, en todas las gamas, incluida ejecucion en navegador via WebGPU/Transformers.js.
- Opciones de despliegue: Transformers (PyTorch), ONNX Runtime, Transformers.js, text-embeddings-inference (segun tags). No se documenta soporte de vLLM, llama.cpp ni Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia de orden de milisegundos en CPU para secuencias de hasta 96 tokens, pero es una estimacion, no un dato publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JustMon1kAa/bert-tiny-sst2-homework | 4,39 M | max length de entrenamiento 96 | Clasificacion de sentimiento binaria (SST-2) | MIT | Hugging Face, ONNX, Transformers.js |
| prajjwal1/bert-tiny (modelo base) | no disponible en la informacion proporcionada | no disponible | Modelo base BERT preentrenado | MIT | Hugging Face |
| DistilBERT SST-2 (variantes de la comunidad) | no disponible en la informacion proporcionada | no disponible | Clasificacion de sentimiento | no disponible | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa de accuracy o F1.

## Limitaciones y advertencias

- Accuracy de 0,763761: aproximadamente una de cada cuatro predicciones es incorrecta en el split de validacion; no es apto para decisiones automatizadas de alto riesgo sin revision humana.
- Dominio restringido: entrenado exclusivamente con resenas cortas de cine en ingles; el rendimiento fuera de ese dominio (otras industrias, otros generos textuales) no esta caracterizado.
- Solo ingles: no soporta castellano ni otros idiomas; el autor lo declara explicitamente no apto como modelo de sentimiento general ni chino.
- Riesgo de sesgo: el modelo hereda los sesgos del corpus SST-2 y del preentrenamiento de BERT-tiny; no se documenta ninguna evaluacion de sesgo.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza en entradas ambiguas o fuera de distribucion.
- Limitacion de longitud: entrenado con max length 96; entradas mas largas se truncan y pueden perder informacion relevante para la clasificacion.
- Licencia: los pesos se publican bajo MIT, pero los derechos del dataset SST-2 son independientes y deben verificarse para uso comercial del modelo derivado.
- Split de test no evaluado: el split de test con etiquetas ocultas de SST-2 no se ha evaluado, por lo que la cifra de validacion puede no reflejar el rendimiento real en datos no vistos.
- Modelo educativo: el autor lo describe como un experimento pequeno y educativo, no como un modelo listo para produccion.

## Enlaces

- Hugging Face: https://huggingface.co/JustMon1kAa/bert-tiny-sst2-homework
- Modelo base: https://huggingface.co/prajjwal1/bert-tiny
- Dataset SST-2: https://huggingface.co/datasets/stanfordnlp/sst2
- Terminos del dataset: https://huggingface.co/datasets/stanfordnlp/sst2
