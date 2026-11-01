# hellnahbru/esm2_t6_8M_UR50D-preserved-20261029

## Resumen

`hellnahbru/esm2_t6_8M_UR50D-preserved-20261029` es una copia redistribuida del checkpoint ESM-2 de 8 millones de parametros (`esm2_t6_8M_UR50D`) publicado originalmente por Meta AI (Facebook) en el repositorio oficial `facebook/esm2_t6_8M_UR50D`. Se trata de un modelo de lenguaje de proteinas entrenado con objetivo de modelado de lenguaje enmascarado (masked language modelling) sobre secuencias de aminoacidos, pensado para ser afinado en tareas downstream de biologia computacional. El autor de esta copia es el usuario de HuggingFace `hellnahbru`, que no aporta modificaciones tecnicas documentadas respecto al original.

El modelo resuelve el problema de obtener representaciones contextuales densas de secuencias proteicas sin necesidad de alineamientos multiples ni caracteristicas manuales. Con solo 6 capas transformer y 7.841.868 parametros reales (segun safetensors), es el checkpoint mas pequeno de la familia ESM-2, lo que lo hace adecuado para prototipado rapido, entornos con recursos limitados y tareas donde la latencia o el coste de inferencia son criticos.

Su relevancia actual es la de un componente ligero de la familia ESM-2, ampliamente utilizada en la comunidad de proteinas. No obstante, esta ficha debe tratarse con cautela: la model card es practicamente identica a la del checkpoint original de Meta y no documenta cambios, datos de entrenamiento especificos ni resultados de benchmarks propios de esta redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-like) con atencion bidireccional, 6 capas |
| Parametros totales | 7.841.868 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la familia ESM-2 usa posiciones relativas; el checkpoint original soporta secuencias largas, pero no se documenta el limite exacto en esta ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias de proteinas, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (pytorch), TensorFlow (tf) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de 6 capas con atencion bidireccional, en la linea de BERT, adaptado a un vocabulario de aminoacidos y tokens especiales de proteina (denominado UR50D en el nombre del checkpoint). El objetivo de entrenamiento es masked language modelling: se enmascaran residuos de la secuencia y el modelo aprende a predecirlos a partir del contexto, lo que produce representaciones contextuales utiles para tareas downstream.

Segun la model card, el modelo se entrena sobre secuencias de proteinas y esta pensado para fine-tuning en una amplia gama de tareas que toman secuencias proteicas como entrada. La model card remite al paper de ESM-2 (Lin et al., 2022) para detalles de arquitectura y datos de entrenamiento, pero no se proporcionan en esta ficha el numero de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables tipicamente a este tipo de modelo). Tampoco se documentan innovaciones tecnicas adicionales en esta redistribucion concreta.

## Capacidades

- Generacion de representaciones contextuales de secuencias de proteinas (embeddings por residuo y por secuencia).
- Prediccion de residuos enmascarados (masked language modelling), util para imputacion o analisis de variantes.
- Base para fine-tuning en tareas de clasificacion de proteinas, prediccion de estructura secundaria, prediccion de contacto y otras tareas downstream.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje natural ni de instrucciones).
- Capacidades multilingues: no aplicables; opera sobre secuencias de aminoacidos, no sobre idiomas naturales.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Prototipado rapido de pipelines de proteinas: al tener solo 8M de parametros, permite iterar sobre extraccion de embeddings y clasificadores ligeros en CPU o GPU de gama baja antes de escalar a checkpoints mayores de ESM-2.
- Prediccion de estructura secundaria: se puede anadir una cabeza de clasificacion por residuo sobre las representaciones del encoder y afinar con datasets anotados (por ejemplo, DSSP), aprovechando la naturaleza bidireccional del modelo.
- Deteccion de variantes deletéreas: fine-tuning sobre pares secuencia-efecto funcional para clasificar mutaciones, usando los embeddings contextuales como caracteristica.
- Analisis de similitud y clustering de secuencias: extraer embeddings medios por secuencia y agrupar proteinas por familia funcional sin necesidad de alineamientos multiples.
- Prediccion de contactos entre residuos: usar las matrices de atencion o las representaciones por par de residuos como entrada a un clasificador de contactos, una tarea clasica en la que los modelos de lenguaje de proteinas han mostrado utilidad.
- Filtrado en pipelines de metagenomica: puntuar secuencias candidatas con la perplejidad del modelo enmascarado para descartar secuencias mal formadas o no proteicas antes de etapas costosas.
- Educacion y docencia: ejemplo ligero para explicar modelado de lenguaje enmascarado aplicado a bioinformatica sin requerir hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (fp32) para los pesos (7,8M de parametros), con overhead adicional por activaciones y batch; en la practica cabe en cualquier GPU consumer moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para uso comodo; RTX 3060, RTX 4090, A100 o H100 son mas que suficientes. Tambien funciona en CPU.
- Cabe en consumer GPU: si, en practicamente todas las GPU consumer actuales.
- Opciones de despliegue: PyTorch nativo (transformers), TensorFlow (transformers), exportacion a ONNX no documentada en esta ficha. vLLM, llama.cpp, Ollama y TGI no estan orientados a este tipo de modelo y no se documentan como soportados.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| esm2_t6_8M_UR50D (esta copia) | 7,84M | 6 | no disponible | MIT | HuggingFace (redistribucion) |
| facebook/esm2_t12_35M_UR50D | 35M | 12 | no disponible | MIT | HuggingFace (oficial) |
| facebook/esm2_t30_150M_UR50D | 150M | 30 | no disponible | MIT | HuggingFace (oficial) |
| facebook/esm2_t33_650M_UR50D | 650M | 33 | no disponible | MIT | HuggingFace (oficial) |

La model card indica que los checkpoints de mayor tamano suelen tener algo mejor precision, a costa de mucho mas memoria y tiempo de entrenamiento. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Redistribucion no oficial: el autor `hellnahbru` no documenta cambios respecto al checkpoint original de Meta; no hay garantia de que los pesos sean identicos al original ni de mantenimiento futuro.
- Model card practicamente copiada del original: no se documentan datos de entrenamiento, tokens vistos ni resultados de evaluacion especificos de esta copia.
- No es un modelo de lenguaje natural: no genera texto, no soporta instrucciones ni tool calling; usarlo fuera del dominio de proteinas carece de sentido.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero las predicciones de residuos enmascarados pueden ser plausibles y erroneas; no deben usarse como evidencia experimental sin validacion.
- Sesgos: el modelo hereda los sesgos del corpus de secuencias proteicas de entrenamiento (posible sobrerrepresentacion de organismos modelo y familias bien estudiadas); no se detallan en la informacion disponible.
- Limitaciones de contexto: no se documenta la longitud maxima de secuencia soportada en esta ficha; secuencias muy largas pueden degradar la calidad de las representaciones.
- Licencia MIT: permite uso comercial y modificacion, pero conviene verificar la licencia del checkpoint original de Meta antes de redistribuir o desplegar en produccion.
- Advertencia de produccion: al ser un checkpoint de 8M de parametros, su precision sera inferior a la de los checkpoints mayores de ESM-2; para tareas sensibles se recomienda evaluar alternativas de mayor tamano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hellnahbru/esm2_t6_8M_UR50D-preserved-20261029
- Checkpoint original de Meta: https://huggingface.co/facebook/esm2_t6_8M_UR50D
- Paper de ESM-2: https://www.biorxiv.org/content/10.1101/2022.07.20.500902v2
- Notebook de fine-tuning en PyTorch: https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_language_modeling.ipynb
- Notebook de fine-tuning en TensorFlow: https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_language_modeling-tf.ipynb
