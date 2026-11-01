# hellnahbru/esm2_t48_15B_UR50D-preserved-20261029

## Resumen

ESM-2 (`esm2_t48_15B_UR50D`) es un modelo de lenguaje de proteinas basado en transformer, desarrollado originalmente por Meta AI (Facebook Research) y entrenado con un objetivo de modelado de lenguaje enmascarado (masked language modelling) sobre secuencias de aminoacidos. Esta ficha corresponde a una copia redistribuida por el usuario `hellnahbru` bajo el identificador `esm2_t48_15B_UR50D-preserved-20261029`, que replica el checkpoint de mayor tamano de la familia ESM-2: 48 capas y aproximadamente 15.000 millones de parametros.

El modelo resuelve tareas de representacion y prediccion sobre secuencias de proteinas: generar embeddings contextuales de alta calidad para aminoacidos y residuos, rellenar posiciones enmascaradas y servir como base para fine-tuning en tareas downstream como prediccion de estructura secundaria, contacto entre residuos, estabilidad de mutaciones o anotacion funcional. Es relevante porque la familia ESM-2 demostro que el escalado de transformers sobre secuencias biologicas produce representaciones competitivas con metodos especializados, y el checkpoint de 15B es el exponente maximo de esa escalera.

La arquitectura es un transformer encoder de tipo BERT con atencion por pares y sesgo relativo de posicion, tokenizador a nivel de aminoacido sobre el alfabeto UR50D y una ventana de contexto de 1.024 residuos. El repositorio ocupa 60,5 GB en safetensors y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (estilo BERT) con atencion por pares y sesgo relativo de posicion |
| Parametros totales | 15B (48 capas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 residuos (limite de la familia ESM-2) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no aplica (entrada de secuencias de proteinas, alfabeto UR50D) |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 60,5 GB); compatible con PyTorch |

## Arquitectura y entrenamiento

ESM-2 emplea un transformer encoder bidireccional con 48 capas, atencion multi-cabeza con sesgo relativo de posicion y una capa de atencion por pares (pairwise attention) que modela interacciones entre residuos, lo que resulta especialmente util para tareas estructurales. La entrada se tokeniza a nivel de aminoacido con el vocabulario UR50D, y el modelo se entrena con un objetivo de masked language modelling: se enmascaran residuos y el modelo debe predecirlos a partir del contexto bidireccional.

El entrenamiento original se realizo sobre UniRef50 (segun el paper asociado), con un volumen de tokens no especificado en la informacion disponible. No se documenta en esta ficha el uso de RLHF, DPO ni tecnicas de alineacion, ya que ESM-2 es un modelo de representacion y no un modelo conversacional. La innovacion principal de la familia es el escalado controlado de transformers sobre secuencias biologicas y la incorporacion de atencion por pares, que mejora la captura de contactos entre residuos.

Esta copia concreta no anade informacion sobre el proceso de entrenamiento; se limita a preservar el checkpoint original. No se dispone de detalles sobre el dataset exacto, numero de tokens ni hiperparametros en la informacion proporcionada.

## Capacidades

- Generacion de embeddings contextuales por residuo y por secuencia para proteinas.
- Relleno de posiciones enmascaradas (masked language modelling) en secuencias de aminoacidos.
- Extraccion de representaciones para tareas downstream mediante fine-tuning supervisado.
- Prediccion de estructura secundaria y contactos entre residuos tras fine-tuning.
- Estimacion de efectos de mutacion (zero-shot o con fine-tuning) en estabilidad y funcion.
- Modelado de secuencias de hasta 1.024 residuos.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de instrucciones.
- No soporta vision, audio ni modalidades distintas de secuencias de proteinas.
- No dispone de modo thinking ni capacidades conversacionales.

## Casos de uso

- Prediccion de estructura secundaria: se anade una cabeza de clasificacion sobre los embeddings por residuo y se entrena con datasets etiquetados (por ejemplo, PDB) para asignar helices, hojas beta y bucles.
- Prediccion de contactos entre residuos: se usan las representaciones de atencion por pares para estimar mapas de contacto, utiles como preprocesado para prediccion de estructura terciaria.
- Priorizacion de variantes en genomica clinica: se calculan puntuaciones de verosimilitud de secuencia (pseudo-log-likelihood) para mutaciones missense y se priorizan variantes potencialmente deletreas.
- Ingenieria de proteinas: se evaluan mutaciones disenadas in silico antes de su expresion en laboratorio, reduciendo el numero de candidatos a sintetizar.
- Anotacion funcional: se generan embeddings de secuencia como entrada a clasificadores de familia proteica o localizacion subcelular.
- Busqueda y agrupamiento de proteinas: los embeddings sirven para similitud semantica, clustering de familias y deduplicacion de secuencias.
- Fine-tuning para tareas especificas de laboratorio: con suficiente VRAM, se puede adaptar el modelo a tareas de regresion (por ejemplo, afinidad de union) con cabezas ligeras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original referencia el paper de ESM-2 para resultados detallados, pero no se incluyen cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 30 GB solo para pesos, mas activaciones y memoria de atencion; en la practica se recomienda al menos 40-48 GB para secuencias largas.
- VRAM estimada en fp32: alrededor de 60 GB solo para pesos, inviable en GPUs consumer.
- GPU recomendadas: A100 80 GB, H100 80 GB, A6000 48 GB (con cuidado en longitud de secuencia), o multiples GPUs con paralelismo de tensor.
- GPU consumer: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) sin cuantizacion agresiva o descarga a CPU; incluso con cuantizacion a 8 bits el margen es muy ajustado.
- Opciones de despliegue: PyTorch con `transformers` (clase `EsmModel`/`EsmForMaskedLM`), `accelerate` para carga en multiples GPUs; no se documenta soporte nativo en vLLM, llama.cpp u Ollama para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| esm2_t48_15B_UR50D (esta copia) | 15B | 48 | 1.024 residuos | MIT | HuggingFace (repo de 60,5 GB) |
| esm2_t36_3B_UR50D | 3B | 36 | 1.024 residuos | MIT | HuggingFace (checkpoint oficial de Meta) |
| esm2_t33_650M_UR50D | 650M | 33 | 1.024 residuos | MIT | HuggingFace (checkpoint oficial de Meta) |
| esm2_t30_150M_UR50D | 150M | 30 | 1.024 residuos | MIT | HuggingFace (checkpoint oficial de Meta) |

Los checkpoints menores de la misma familia ofrecen un compromiso mucho mas favorable en memoria y latencia, con precision ligeramente inferior segun la model card. Para la mayoria de tareas downstream, el checkpoint de 650M o 3B suele ser suficiente; el de 15B se reserva para escenarios donde la precision marginal justifica el coste computacional.

## Limitaciones y advertencias

- Modelo de representacion, no de instrucciones: no responde a prompts en lenguaje natural ni mantiene conversaciones.
- Ventana de contexto limitada a 1.024 residuos; proteinas mas largas requieren truncamiento o estrategias de ventana deslizante.
- Riesgo de alucinacion en el sentido de predicciones plausibles pero incorrectas al rellenar mascaras; no debe usarse como verdad biologica sin validacion experimental.
- Sesgos derivados del corpus de entrenamiento (UniRef50): sobrerrepresentacion de proteinas bien estudiadas y posible infrarepresentacion de familias poco caracterizadas.
- El repositorio es una copia de terceros (`hellnahbru`), no el checkpoint oficial de Meta; conviene verificar integridad y procedencia antes de usarlo en produccion.
- La licencia MIT permite uso comercial, pero debe conservarse el aviso de copyright correspondiente.
- No se documentan cuantizaciones oficiales ni recetas de despliegue en esta copia.
- El coste de inferencia en fp16 es elevado; para produccion a gran escala, evaluar checkpoints menores de la familia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hellnahbru/esm2_t48_15B_UR50D-preserved-20261029
- Checkpoint oficial de Meta: https://huggingface.co/facebook/esm2_t48_15B_UR50D
- Paper de ESM-2: https://www.biorxiv.org/content/10.1101/2022.07.20.500902v2
- Notebook de fine-tuning en PyTorch: https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_language_modeling.ipynb
- Notebook de fine-tuning en TensorFlow: https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_language_modeling-tf.ipynb
