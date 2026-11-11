# nvidia/esm2_t6_8M_UR50D

## Resumen

ESM-2 (esm2_t6_8M_UR50D) es un modelo de lenguaje de proteinas basado en transformer, desarrollado originalmente por Meta AI (Facebook Research) y redistribuido por NVIDIA con optimizaciones de la libreria TransformerEngine. Se entrena con un objetivo de enmascaramiento de tokens (masked language modelling) sobre secuencias de aminoacidos y su proposito principal es generar representaciones (embeddings) por aminoacido y a nivel de secuencia que sirven como base para predecir la estructura 3D de proteinas y para fine-tuning en multitud de tareas de biologia computacional.

La version alojada por NVIDIA mantiene, dentro de la precision numerica, los mismos pesos y salidas que el modelo original de Meta, pero incorpora kernels optimizados de TransformerEngine para acelerar el entrenamiento y la inferencia en GPUs NVIDIA (Ampere, Hopper y Blackwell). Es el checkpoint mas pequeno de la familia ESM-2, con 6 capas y aproximadamente 7,5 millones de parametros, lo que lo convierte en una opcion ligera para prototipado, extraccion de caracteristicas y experimentacion en entornos con recursos limitados.

Su relevancia actual radica en que ofrece una via de entrada de bajo coste al ecosistema ESM-2 con licencia MIT, apta para uso comercial, y compatible con el pipeline `fill-mask` de Hugging Face Transformers. El contexto de entrada esta limitado a 1022 aminoacidos, suficiente para muchas proteinas pero insuficiente para secuencias largas, que se truncan automaticamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ESM-2), 6 capas |
| Parametros totales | 7.512.353 (aprox. 7,5 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1022 tokens (aminoacidos); secuencias mas largas se truncan |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de PyTorch/Transformers, no documentada por el autor) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje natural; opera sobre secuencias de aminoacidos canonicos) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ESM-2, un transformer encoder con 6 capas y atencion multi-cabeza, entrenado con un objetivo de masked language modelling sobre secuencias de proteinas. La entrada es una cadena de aminoacidos canonicos de hasta 1022 posiciones y la salida son embeddings de punto flotante, uno por aminoacido, ademas de una representacion a nivel de secuencia. La version de NVIDIA incorpora la libreria TransformerEngine, que sustituye capas y kernels por implementaciones optimizadas para hardware NVIDIA; el autor advierte que pueden aparecer diferencias numericas menores respecto al modelo original.

El entrenamiento se realizo sobre UniRef90, una base de clusters de secuencias proteicas con identidad de secuencia del 90 %. La model card indica un volumen de datos de entrenamiento en el rango de 1.000 millones a 10 billones de tokens, un dato excesivamente amplio que no permite una cifra precisa. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni fases de alineacion, algo esperable en un modelo de representacion de proteinas y no de instrucciones. La innovacion principal de esta redistribucion es la integracion con TransformerEngine, que acelera entrenamiento e inferencia en GPUs Ampere, Hopper y Blackwell.

## Capacidades

- Generacion de embeddings por aminoacido y a nivel de secuencia para proteinas.
- Relleno de mascaras (`fill-mask`) sobre secuencias de aminoacidos, util para predecir residuos enmascarados.
- Base para prediccion de estructura 3D de proteinas tras fine-tuning o mediante cabezas especificas.
- Extraccion de caracteristicas para tareas downstream: prediccion de estructura secundaria, solubilidad, estabilidad, localizacion subcelular o interacciones proteina-proteina.
- Fine-tuning supervisado sobre tareas que toman secuencias proteicas como entrada.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es multilingue en el sentido de lenguajes naturales; su alfabeto son los aminoacidos canonicos.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Prediccion de estructura proteica: partiendo de la secuencia de aminoacidos, se extraen embeddings y se alimenta una cabeza de prediccion para estimar la estructura 3D; el modelo es adecuado como extractor de caracteristicas ligero en pipelines de plegamiento.
- Anotacion funcional de proteinas: fine-tuning sobre datasets de funciones enzimaticas o familias proteicas para clasificar secuencias nuevas, aprovechando el bajo coste computacional de sus 7,5 M de parametros.
- Prediccion de efectos de mutaciones: enmascarar un residuo y comparar la distribucion de probabilidad del modelo entre variantes para priorizar mutaciones candidatas en estudios de ingenieria de proteinas.
- Filtrado y cribado de secuencias: generar embeddings de grandes librerias de secuencias y agrupar o buscar similitudes mediante distancia coseno, como paso previo a analisis mas costosos.
- Prototipado rapido en biologia computacional: servir como baseline en cuadernos de investigacion y validar pipelines antes de escalar a checkpoints mayores de la familia (35M, 150M, 650M, 3B, 15B).
- Educacion y demos: ejecutar el modelo en CPU o en GPUs de consumo para ilustrar conceptos de protein language models y fine-tuning en cursos y talleres.
- Extraccion de caracteristicas en produccion de bajo consumo: desplegar como servicio de embeddings para aplicaciones que requieren latencia baja y no pueden asumir el coste de modelos de cientos de millones de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision fp32 para los 7,5 M de parametros; en la practica, el consumo lo domina el overhead del runtime y el tamano del batch.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el autor declara compatibilidad con microarquitecturas Ampere, Hopper y Blackwell. Tambien funciona en CPU.
- Cabe en cualquier GPU de consumo (GTX 10xx en adelante, RTX 20xx/30xx/40xx) e incluso en entornos sin GPU.
- Opciones de despliegue: Hugging Face Transformers (runtime declarado por el autor); al ser un modelo estandar de transformers, es compatible con frameworks de inferencia habituales, aunque el autor solo documenta Transformers. Para despliegue optimizado en NVIDIA se recomienda instalar TransformerEngine.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia de milisegundos en GPU para secuencias tipicas, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| esm2_t6_8M_UR50D (este) | 7,5 M | 6 | 1022 | MIT | Hugging Face (nvidia y facebook) |
| esm2_t12_35M_UR50D | 35 M | 12 | 1022 | MIT | Hugging Face |
| esm2_t30_150M_UR50D | 150 M | 30 | 1022 | MIT | Hugging Face |
| esm2_t33_650M_UR50D | 650 M | 33 | 1022 | MIT | Hugging Face |

La familia ESM-2 escala en capas y parametros manteniendo la misma licencia MIT y el mismo limite de contexto de 1022 aminoacidos. Los checkpoints mayores ofrecen mejor precision segun el autor, a costa de mas memoria y tiempo de entrenamiento. No se dispone de datos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de representacion de proteinas, no un asistente conversacional: no debe emplearse para generacion de texto, codigo ni tareas de lenguaje natural.
- Contexto limitado a 1022 aminoacidos; las secuencias mas largas se truncan automaticamente, lo que puede degradar la calidad de los embeddings en proteinas grandes.
- Al ser el checkpoint mas pequeno de la familia, su capacidad representacional es inferior a la de los modelos de 150M, 650M, 3B y 15B; el autor recomienda escalar si la precision es critica.
- Riesgo de alucinacion en el sentido de predicciones de residuos o estructuras incorrectas con alta confianza; los embeddings no son una verdad biologica y requieren validacion experimental.
- Diferencias numericas menores respecto al modelo original de Meta por la optimizacion con TransformerEngine; conviene validar en tareas sensibles a la precision.
- Sesgos derivados de UniRef90: la composicion del dataset condiciona la representacion de familias proteicas poco representadas.
- Licencia MIT permite uso comercial, pero el autor advierte que la integracion en sistemas de IA requiere pruebas especificas del caso de uso antes del despliegue.
- Solo se documenta Linux como sistema operativo preferido/soportado en la model card de NVIDIA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/esm2_t6_8M_UR50D
- Modelo original de Meta: https://huggingface.co/facebook/esm2_t6_8M_UR50D
- Paper de referencia: https://www.biorxiv.org/content/10.1101/2022.07.20.500902v2
- Repositorio ESM de Meta: https://github.com/facebookresearch/esm
- Libreria TransformerEngine: https://github.com/NVIDIA/TransformerEngine
- Instalacion de TransformerEngine: https://github.com/NVIDIA/TransformerEngine?tab=readme-ov-file#installation
- Notebook de fine-tuning en PyTorch: https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_language_modeling.ipynb
- Notebook de fine-tuning en TensorFlow: https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_language_modeling-tf.ipynb
- UniRef90: https://www.uniprot.org/uniref?query=%28identity%3A0.9%29
