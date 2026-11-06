# sidman007/wsp-bert-insurance-v1-p25

## Resumen

`wsp-bert-insurance-v1-p25` es un clasificador de frases del dominio de seguros construido sobre `google-bert/bert-base-uncased` mediante una tecnica de edicion de pesos en espacio de pesos (weight-space programming) en lugar de entrenamiento por descenso de gradiente. Lo publica el usuario `sidman007` en Hugging Face y resuelve una tarea de clasificacion multietiqueta de 8 categorias propias de documentacion de polizas: concesion de cobertura, exclusion, pago de prima, limites y franquicias, procedimiento de siniestros, definiciones, cancelacion y renovacion, y condiciones y obligaciones del asegurado.

El interes tecnico no esta en el modelo base, sino en el metodo: un LLM editor lee y escribe directamente los pesos del transformer, aplicando matematicas en forma cerrada sobre pesos y activaciones a partir de un numero presupuestado de pasadas forward, sin retropropagacion ni optimizadores. Se modificaron 176 tensores, lo que supone un 10,400 % de los parametros del modelo. Es, por tanto, una prueba de concepto de adaptacion de dominio sin fine-tuning clasico, con un modelo de 109,5 millones de parametros, contexto de 512 tokens (heredado de BERT base) y licencia Apache 2.0.

La relevancia actual es doble: por un lado, demuestra que es posible especializar un encoder pequeno en un dominio vertical con un coste computacional minimo; por otro, sirve como referencia metodologica para evaluar hasta que punto la edicion directa de pesos puede sustituir al entrenamiento convencional en tareas de clasificacion acotadas. El modelo solo soporta ingles y no dispone de descargas ni validacion publica en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (BertForSequenceClassification) |
| Parametros totales | 109.488.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredado de bert-base-uncased) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizacion posterior posible via herramientas estandar, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | google-bert/bert-base-uncased |
| Metodo de adaptacion | weight-space programming (edicion directa de pesos, sin backprop) |
| Tensores editados | 176 |
| Porcentaje de parametros modificados | 10,400 % |
| Numero de etiquetas | 8 |
| Tamano del repositorio | 0,4 GB |
| Pipeline | text-classification |

## Arquitectura y entrenamiento

La arquitectura es la de un BERT base estandar: 12 capas de encoder, atencion multi-cabeza con 12 cabezas, dimension oculta de 768 y una cabeza de clasificacion de secuencia anadida sobre el token `[CLS]`. El modelo base es `bert-base-uncased`, por lo que el vocabulario es el WordPiece en minusculas de BERT y el contexto maximo es de 512 tokens. La cabeza de clasificacion se configura para 8 etiquetas del dominio asegurador.

Lo diferencial es el procedimiento de adaptacion. Segun la model card, un LLM editor leyo y escribio los pesos directamente aplicando matematicas en forma cerrada sobre los pesos y sobre las activaciones obtenidas de un numero limitado de pasadas forward. No hubo retropropagacion, ni optimizadores, ni un corpus de entrenamiento etiquetado en el sentido clasico. Se modificaron 176 tensores distribuidos por las 12 capas, con patrones desiguales: las capas 0 a 3 y la 10 y 11 presentan cambios extensos (por ejemplo, 49.152 entradas en `layer.0.attention.self.query.weight` o 2.359.296 en `layer.10.output.dense.weight`), mientras que otras capas muestran ediciones minimas de 8 entradas en sesgos y normalizaciones. Este patron sugiere una intervencion quirurgica sobre subespacios concretos de representacion mas que un ajuste global uniforme. No se documentan datos de entrenamiento, composicion del dataset, ni uso de RLHF o DPO.

## Capacidades

- Clasificacion de frases en 8 categorias del dominio de seguros: `coverage_grant`, `exclusion`, `premium_payment`, `deductible_limits`, `claims_procedure`, `definitions`, `term_cancellation_renewal` y `conditions_duties`.
- Clasificacion de texto corto o parrafos en ingles dentro del limite de 512 tokens.
- Inferencia ligera en CPU o GPU de gama baja gracias al tamano reducido del modelo.
- No soporta generacion de texto: es un modelo discriminativo de clasificacion.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- Capacidades multilingues limitadas al ingles; el vocabulario uncased de BERT no cubre adecuadamente otros idiomas.
- No incluye modo thinking, vision ni audio.

## Casos de uso

- Triaje de parrafos en polizas de seguros: el modelo clasifica cada fragmento de una poliza en una de las 8 categorias, permitiendo indexar y etiquetar automaticamente documentos extensos antes de pasarlos a un sistema de busqueda o a un LLM de resumen.
- Extraccion estructurada de clausulas: en un pipeline de procesamiento documental, se usa como primer filtro para separar definiciones, exclusiones y condiciones, de modo que etapas posteriores solo procesen el texto relevante y se reduzca el coste de inferencia.
- Enrutamiento en atencion al cliente: dado un mensaje del usuario, clasificarlo en categorias como `claims_procedure` o `premium_payment` para dirigirlo al equipo o flujo adecuado, con latencia muy baja por el tamano del modelo.
- Control de calidad de contratos: detectar si un documento generado o modificado contiene secciones de exclusion y franquicias correctamente etiquetadas antes de su publicacion.
- Analisis de cartera de polizas: clasificar lotes de documentos historicos para construir estadisticas sobre la distribucion de tipos de clausula y detectar ausencias (por ejemplo, polizas sin seccion de cancelacion).
- Prototipado rapido en entornos con recursos limitados: al ser un modelo de 109 millones de parametros y 0,4 GB, puede desplegarse en una instancia pequena o incluso en CPU para validar un caso de uso antes de invertir en un modelo mayor.
- Investigacion sobre edicion de pesos: servir como caso de estudio reproducible para comparar la calidad de la edicion directa de pesos frente a fine-tuning clasico en tareas de clasificacion de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,44 GB para los pesos, mas overhead de activaciones; en la practica cabe en cualquier GPU consumer con 2 GB o mas.
- En FP16 o bfloat16, el modelo ocupa alrededor de 0,22 GB, por lo que es viable en GPUs integradas y en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona correctamente en CPU. Para lotes grandes, una T4, RTX 3060 o superior ofrece margen sobrado.
- Cabe en cualquier GPU consumer actual (GTX 1650, RTX 2060, RTX 4090, etc.) y en Apple Silicon via MPS.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, `optimum` para exportacion a ONNX, `text-embeddings-inference` no aplica (no es un modelo de embeddings), y `vLLM` no es adecuado para clasificacion BERT. `llama.cpp` y `Ollama` no soportan este formato de forma nativa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera un throughput alto en CPU y muy alto en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| wsp-bert-insurance-v1-p25 | 109,5 M | 512 | Apache 2.0 | Edicion de pesos sin backprop | Hugging Face, sin descargas |
| google-bert/bert-base-uncased | 110 M | 512 | Apache 2.0 | Preentrenamiento MLM | Hugging Face, ampliamente usado |
| distilbert-base-uncased | 66 M | 512 | Apache 2.0 | Destilacion de BERT | Hugging Face, ampliamente usado |
| roberta-base | 125 M | 512 | MIT | Preentrenamiento MLM mejorado | Hugging Face, ampliamente usado |

La comparativa con alternativas de la misma categoria es limitada porque no existen resultados de rendimiento publicados para este modelo. Frente a `bert-base-uncased`, la diferencia es el ajuste al dominio de seguros mediante edicion de pesos en lugar de fine-tuning; frente a `distilbert-base-uncased`, este modelo es mas grande pero parte de una base no destilada; frente a `roberta-base`, la licencia es equivalente en permisividad y el contexto identico.

## Limitaciones y advertencias

- No hay resultados de benchmarks ni validacion publica: no es posible afirmar que la clasificacion funcione correctamente en datos reales.
- El modelo no tiene descargas ni likes, lo que sugiere ausencia de uso y validacion por parte de la comunidad.
- Solo soporta ingles; no es adecuado para documentacion en castellano ni otros idiomas.
- El contexto maximo de 512 tokens limita la clasificacion a fragmentos cortos; parrafos largos deben truncarse o dividirse.
- El metodo de edicion de pesos sin backprop no garantiza que las 8 etiquetas se hayan aprendido de forma equilibrada; no se documenta la distribucion de clases ni el rendimiento por etiqueta.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificacion erronea con alta confianza en entradas fuera de dominio.
- Sesgos: no documentados; al heredar el vocabulario y el preentrenamiento de `bert-base-uncased`, puede arrastrar sesgos de genero, raza o edad presentes en el corpus original.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Para produccion, se recomienda validar con un conjunto etiquetado propio antes de confiar en las predicciones, dado que no hay evidencia empirica publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sidman007/wsp-bert-insurance-v1-p25
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Paper de BERT: https://arxiv.org/abs/1810.04805
- Documentacion de Transformers para clasificacion de secuencias: https://huggingface.co/docs/transformers/tasks/sequence_classification
