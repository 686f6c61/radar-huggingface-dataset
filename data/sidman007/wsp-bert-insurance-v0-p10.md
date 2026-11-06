# sidman007/wsp-bert-insurance-v0-p10

## Resumen

`wsp-bert-insurance-v0-p10` es un clasificador de frases del dominio de seguros construido sobre `google-bert/bert-base-uncased` mediante una tecnica experimental denominada *weight-space programming* (WSP). En lugar de ajustar los pesos con descenso de gradiente, un LLM editor lee y reescribe directamente los tensores del modelo aplicando matematica en forma cerrada sobre pesos y activaciones, obtenidas a partir de un numero limitado de pasadas hacia delante. No hay retropropagacion ni optimizadores implicados.

El resultado es un `BertForSequenceClassification` con 8 etiquetas propias del sector asegurador (`coverage_grant`, `exclusion`, `premium_payment`, `deductible_limits`, `claims_procedure`, `definitions`, `term_cancellation_renewal`, `conditions_duties`). El autor reporta una precision del 96,68 % y un macro-F1 de 0,9672 sobre un conjunto de test reservado. El modelo tiene 109.488.392 parametros y ocupa 0,4 GB en el repositorio.

Su relevancia es doble: por un lado, ofrece un clasificador funcional y ligero para un dominio vertical concreto; por otro, sirve como prueba de concepto reproducible de una metodologia de edicion de pesos alternativa al fine-tuning clasico, con manifiesto de diferencias (`edit_manifest.json`) y protocolo publicados. No obstante, se trata de un artefacto de investigacion (version `v0/p10`) con cero descargas y calibracion deficiente de sus probabilidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (BertForSequenceClassification), 12 capas, 768 de hidden size |
| Parametros totales | 109.488.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada de bert-base-uncased: 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Etiquetas de salida | 8 clases de dominio asegurador |
| Modelo base | google-bert/bert-base-uncased |
| Metodo de adaptacion | weight-space programming (sin descenso de gradiente) |
| Tensores editados | 40 (12,415 % de los parametros modificados) |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un BERT base estandar: 12 capas de encoder con atencion multi-cabeza, 768 dimensiones ocultas y una cabeza de clasificacion lineal sobre el pooler. La innovacion no reside en la topologia, sino en el procedimiento de adaptacion. Un LLM editor recibe informacion sobre los pesos y sobre las activaciones recogidas en un numero acotado de pasadas hacia delante y calcula, en forma cerrada, los nuevos valores de determinados tensores. No se ejecuta ningun paso de retropropagacion ni se emplea optimizador alguno.

Las modificaciones se concentran en las capas 8, 9, 10 y 11, ademas del pooler y la cabeza `classifier`. En concreto, se reescriben las proyecciones `attention.self.query` y `attention.self.value` de la capa 8, las salidas `attention.output.dense` y `output.dense` de las capas 8 a 11, las LayerNorm asociadas y el `pooler.dense`. El recuento declarado es de 40 tensores y 12,415 % de los parametros alterados. El repositorio incluye `edit_manifest.json` con metadatos de diff y hashes SHA-256 de los tensores base y editados, lo que permite auditar la intervencion. El autor remite al README del proyecto en GitHub para el protocolo completo y los resultados.

## Capacidades

- Clasificacion de texto en ingles en 8 categorias del dominio asegurador: concesion de cobertura, exclusion, pago de prima, limites y franquicias, procedimiento de siniestros, definiciones, cancelacion o renovacion de terminos y condiciones u obligaciones.
- Salida de etiqueta unica por frase mediante `argmax` sobre los logits.
- Integracion directa con el pipeline `text-classification` de Hugging Face Transformers.
- Inferencia sobre CPU o GPU de gama baja dado el reducido tamano del modelo (0,4 GB).
- No soporta generacion de texto, razonamiento multi-paso, tool calling, agentes, vision, audio ni modo de pensamiento.
- Capacidad multilingue limitada al ingles; el vocabulario y el preentrenamiento del modelo base son de `bert-base-uncased`.
- No documenta capacidades de extraccion de embeddings o *feature extraction* como uso previsto, aunque los pesos subyacentes podrian emplearse para ello.

## Casos de uso

- Triaje de clausulas en polizas: clasificar automaticamente fragmentos de una poliza en categorias como exclusiones o limites de franquicia para alimentar un indice de busqueda semantica. El modelo esta especificamente editado para estas ocho clases.
- Enrutamiento de consultas de clientes: etiquetar mensajes entrantes de asegurados segun la seccion de la poliza a la que se refieren, derivando cada consulta al equipo adecuado con una inferencia de coste minimo.
- Extraccion estructurada en pipelines de documentos: preprocesar textos de contratos y separar oraciones por tipo de clausula antes de un paso posterior de extraccion de entidades o resumen.
- Control de calidad documental: detectar si un contrato generado contiene secciones de condiciones u obligaciones y si faltan definiciones o procedimientos de siniestro, como validador en un flujo de publicacion.
- Moderacion y cumplimiento: marcar afirmaciones sobre coberturas concedidas o excluidas para revision humana en comunicaciones comerciales, dado el riesgo regulatorio del dominio.
- Prototipado rapido en entornos con pocos recursos: al ocupar 0,4 GB y ejecutarse en CPU, sirve para demos y pruebas de concepto en equipos sin GPU antes de invertir en un modelo mayor.
- Investigacion sobre edicion de pesos: caso de estudio reproducible para comparar WSP frente a fine-tuning clasico en una tarea de clasificacion vertical, gracias al manifiesto de diffs publicado.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en test reservado (held-out) | 96,68 % |
| Macro-F1 en test reservado | 0,9672 |

No se han publicado en la informacion disponible resultados en benchmarks estandar (MMLU, GLUE, etc.) ni comparaciones numericas con modelos alternativos. Los unicos datos de rendimiento son los del conjunto de test propio del autor.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,44 GB de pesos mas activaciones y overhead, en torno a 1-2 GB en total.
- En FP16 o cuantizacion de 8 bits, el modelo cabe holgadamente en cualquier GPU consumer, incluso en GPUs integradas o en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU con 2 GB o mas de VRAM (GTX 1650, RTX 3060, T4) es mas que suficiente.
- Despliegue: compatible con `transformers` pipeline, `text-classification`; tambien desplegable con TorchServe, ONNX Runtime o `optimum` para exportacion a ONNX. No se documenta soporte especifico para vLLM o TGI (orientados a modelos generativos).
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia de milisegundos por frase en CPU moderna y throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| wsp-bert-insurance-v0-p10 | 109,5 M | 512 (heredado) | Clasificacion 8 clases seguros | apache-2.0 | Editado por WSP, sin fine-tuning; 96,68 % acc. en test propio; probabilidades sin calibrar |
| google-bert/bert-base-uncased | 110 M | 512 | Modelo base generico | apache-2.0 | Requiere fine-tuning supervisado para clasificacion; no comparable directamente sin entrenamiento |
| Modelos de clasificacion de seguros fine-tuned (genericos) | variable | variable | Clasificacion de dominio | variable | No disponible comparacion numerica en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria en la informacion proporcionada. La comparacion con `bert-base-uncased` es estructural (mismo backbone), no de rendimiento en la tarea.

## Limitaciones y advertencias

- Probabilidades sin calibrar: el autor advierte que los softmax son planos (la etiqueta ganadora suele puntuar en torno a 0,2 en lugar de 0,9 o mas). Debe usarse `argmax` como etiqueta y ajustar una temperatura sobre datos propios antes de interpretar los scores como confianzas.
- Artefacto de investigacion: version `v0/p10`, cero descargas y cero likes en el momento de la ficha; no hay evidencia de uso en produccion ni validacion externa.
- Solo ingles: el modelo y su vocabulario estan limitados al ingles; no se documenta rendimiento en otros idiomas.
- Dominio estrecho: las ocho etiquetas cubren exclusivamente el sector asegurador; fuera de ese dominio la clasificacion carece de sentido.
- Riesgo de alucinacion o error de clasificacion en frases ambiguas, negaciones complejas o textos con jerga no representada en el protocolo de edicion.
- Sesgos: no se documentan analisis de sesgo; al derivar de `bert-base-uncased`, puede heredar sesgos del corpus de preentrenamiento.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar el manifiesto de edicion y el README del proyecto antes de integrarlo.
- Ausencia de documentacion sobre cuantizacion, latencia y throughput: cualquier estimacion de produccion debe medirse empiricamente.
- El proceso de edicion no es un fine-tuning supervisado convencional; la reproducibilidad depende del protocolo publicado en el repositorio del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sidman007/wsp-bert-insurance-v0-p10
- Repositorio del proyecto (codigo, logs y protocolo): https://github.com/siddharth-ghatti/weight-space-programming-poc
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
