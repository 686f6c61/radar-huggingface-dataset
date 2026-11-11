# nvidia/esm2_t12_35M_UR50D

## Resumen

ESM-2 (esm2_t12_35M_UR50D) es un modelo de lenguaje de proteinas basado en transformer, desarrollado originalmente por Meta AI (Facebook Research) y redistribuido por NVIDIA en una version optimizada con su libreria TransformerEngine. El modelo se entrena con un objetivo de masked language modelling sobre secuencias de aminoacidos y genera embeddings por residuo y a nivel de secuencia, que sirven como base para prediccion de estructura 3D, anotacion funcional y una amplia variedad de tareas downstream mediante fine-tuning.

Esta variante concreta es el checkpoint pequeno de la familia ESM-2: 12 capas y aproximadamente 33,5 millones de parametros, con una longitud maxima de entrada de 1022 aminoacidos (las secuencias mas largas se truncan automaticamente). Es relevante ahora porque NVIDIA ha publicado la version optimizada con TransformerEngine manteniendo pesos y salidas identicas (dentro de la precision numerica) al modelo original de Meta, lo que permite acelerar el entrenamiento y la inferencia en GPU Ampere, Hopper y Blackwell sin cambiar el pipeline de transformers.

La licencia MIT y el reducido tamano del checkpoint lo convierten en una opcion practica para experimentacion, prototipado y despliegue en entornos con recursos limitados, dentro del ecosistema Hugging Face Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ESM-2) |
| Parametros totales | 33.501.153 (~35M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1022 aminoacidos (entradas mas largas se truncan) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica: secuencias de proteinas (aminoacidos canonicos) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,7 GB), con custom_code |

## Arquitectura y entrenamiento

ESM-2 es un transformer encoder entrenado con masked language modelling sobre secuencias de proteinas. Este checkpoint tiene 12 capas y unos 33,5 millones de parametros. La entrada es una cadena unidimensional de aminoacidos canonicos de longitud maxima 1022, y la salida es un vector de embeddings por aminoacido (hasta 1022 embeddings) mas un embedding a nivel de secuencia. El modelo requiere `custom_code` en transformers y esta optimizado con TransformerEngine de NVIDIA, lo que introduce diferencias numericas minimas respecto al modelo original de Meta.

El entrenamiento se realizo sobre UniRef90 (secuencias de proteinas, recogidas por humanos, sin etiquetado), en un rango declarado de entre 1.000 millones y 10 billones de tokens. La model card no detalla la composicion exacta del dataset ni si hubo etapas de RLHF o DPO, algo esperable en un modelo de representacion y no de instrucciones. La innovacion tecnica destacable de esta version es la integracion con TransformerEngine para acelerar entrenamiento e inferencia en GPUs NVIDIA Ampere, Hopper y Blackwell.

## Capacidades

- Generacion de embeddings por aminoacido y a nivel de secuencia para proteinas.
- Relleno de mascaras (fill-mask) sobre secuencias de aminoacidos.
- Prediccion de estructura 3D de proteinas (caso de uso declarado), normalmente mediante cabezas o modelos downstream entrenados sobre los embeddings.
- Base para fine-tuning en tareas que toman secuencias de proteinas como entrada.
- Extraccion de representaciones para clasificacion, regresion y similitud de secuencias.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de instrucciones ni un agente.
- No dispone de capacidades multilingues, de vision ni de audio.

## Casos de uso

- Prediccion de estructura de proteinas: usar los embeddings del modelo como entrada para cabezas de prediccion estructural o como base de modelos downstream; el caso de uso declarado por el autor es la prediccion de estructuras 3D a partir de secuencias de aminoacidos.
- Anotacion funcional de proteinas: fine-tuning del encoder sobre datasets etiquetados para clasificar familias o funciones proteicas a partir de la secuencia.
- Busqueda y agrupamiento de secuencias: generar embeddings a nivel de secuencia y calcular similitudes para agrupar proteinas relacionadas o detectar duplicados.
- Prediccion de efectos de mutaciones: comparar embeddings de secuencia original y mutada para estimar el impacto de variantes, tras el fine-tuning adecuado.
- Preentrenamiento y prototipado rapido: al tener 35M de parametros y licencia MIT, sirve para validar pipelines de proteinas antes de escalar a checkpoints mayores (150M, 650M, 3B, 15B).
- Extraccion de caracteristicas en pipelines bioinformaticos: integrar el modelo en transformers para producir representaciones por residuo que alimenten clasificadores o modelos de estructura.
- Experimentacion en entornos con recursos limitados: el checkpoint cabe en memoria de GPU consumer, lo que permite iterar en estaciones de trabajo sin hardware de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa unos 0,7 GB en safetensors; en fp32 ronda 0,13 GB de pesos y el consumo real depende del tamano de lote y de la longitud de secuencia (hasta 1022 tokens). Cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: el autor declara compatibilidad con microarquitecturas NVIDIA Ampere, Hopper y Blackwell. Para este tamano, una RTX 3090, RTX 4090 o cualquier GPU con 8 GB o mas es suficiente.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con suficiente memoria para el lote elegido.
- Opciones de despliegue: Hugging Face Transformers (runtime declarado), con requisito de instalar TransformerEngine para la version optimizada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| nvidia/esm2_t12_35M_UR50D | 33,5M | 1022 aa | MIT | Version TransformerEngine del ESM-2 de 12 capas |
| facebook/esm2_t12_35M_UR50D | ~35M | 1022 aa | MIT | Modelo original de Meta; pesos y salidas equivalentes |
| nvidia/esm2_t30_150M_UR50D | 150M | 1022 aa | MIT | Mayor precision a costa de mas memoria y tiempo |
| nvidia/esm2_t33_650M_UR50D | 650M | 1022 aa | MIT | Checkpoint grande para tareas que requieren mas capacidad |

No se dispone de datos de rendimiento comparativo entre estos checkpoints en la informacion proporcionada; la model card solo indica que los tamanos mayores tienen mejor precision pero requieren mas memoria y tiempo de entrenamiento.

## Limitaciones y advertencias

- El modelo no es un modelo de instrucciones ni de chat: no soporta tool calling, agentes ni razonamiento multi-paso.
- Las secuencias de mas de 1022 aminoacidos se truncan automaticamente, lo que puede perder informacion en proteinas largas.
- La version TransformerEngine puede presentar diferencias numericas minimas respecto al modelo original de Meta.
- No se documentan sesgos especificos ni tasas de alucinacion; al tratarse de un modelo de representacion, los riesgos se trasladan al modelo downstream que se entrene sobre el.
- La licencia MIT permite uso comercial, pero el autor recomienda pruebas especificas del caso de uso antes de desplegar en produccion.
- Requiere `custom_code` en transformers y, para la version optimizada, la instalacion de TransformerEngine; el sistema operativo soportado declarado es Linux.
- No se detallan los tipos de cuantizacion soportados ni el rendimiento en latencia o throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/esm2_t12_35M_UR50D
- Modelo original de Meta: https://huggingface.co/facebook/esm2_t12_35M_UR50D
- Paper de referencia: https://www.biorxiv.org/content/10.1101/2022.07.20.500902v2
- Repositorio de ESM en GitHub: https://github.com/facebookresearch/esm
- Libreria TransformerEngine: https://github.com/NVIDIA/TransformerEngine
- Instalacion de TransformerEngine: https://github.com/NVIDIA/TransformerEngine?tab=readme-ov-file#installation
- Notebook de fine-tuning en PyTorch: https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_language_modeling.ipynb
- Notebook de fine-tuning en TensorFlow: https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_language_modeling-tf.ipynb
- Dataset UniRef90: https://www.uniprot.org/uniref?query=%28identity%3A0.9%29
- Checkpoint mayor esm2_t30_150M_UR50D: https://huggingface.co/nvidia/esm2_t30_150M_UR50D
- Checkpoint mayor esm2_t33_650M_UR50D: https://huggingface.co/nvidia/esm2_t33_650M_UR50D
- Checkpoint mayor esm2_t36_3B_UR50D: https://huggingface.co/nvidia/esm2_t36_3B_UR50D
- Checkpoint mayor esm2_t48_15B_UR50D: https://huggingface.co/nvidia/esm2_t48_15B_UR50D
