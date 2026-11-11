# nvidia/esm2_t48_15B_UR50D

## Resumen

ESM-2 (esm2_t48_15B_UR50D) es un modelo de lenguaje de proteinas basado en transformer, desarrollado originalmente por Meta AI (Facebook Research) y redistribuido por NVIDIA en una version optimizada con su libreria TransformerEngine. El modelo aplica un objetivo de modelado de lenguaje enmascarado (masked language modelling) sobre secuencias de aminoacidos y constituye la variante mas grande de la familia ESM-2, con 48 capas y aproximadamente 15.100 millones de parametros. Su proposito principal es generar representaciones (embeddings) por aminoacido y a nivel de secuencia que sirven como base para prediccion de estructura proteica y para fine-tuning en tareas downstream de biologia computacional.

La relevancia de esta version de NVIDIA radica en que mantiene, dentro de la precision numerica, los mismos pesos y salidas que el modelo original de Meta, pero incorpora optimizaciones de TransformerEngine orientadas a hardware NVIDIA (Ampere, Hopper y Blackwell). Esto permite entrenamiento e inferencia mas rapidos en sistemas acelerados por GPU, manteniendo la licencia MIT del modelo original. Es, por tanto, una alternativa de despliegue para equipos que ya trabajan con el ecosistema CUDA y necesitan ejecutar o ajustar el mayor checkpoint de ESM-2.

El modelo no es un modelo generativo de texto conversacional ni un asistente: es un encoder de proteinas. Su entrada es una secuencia de aminoacidos canonicos de hasta 1022 residuos (las secuencias mas largas se truncan automaticamente) y su salida son vectores de embedding. Esto lo situa en la categoria de protein language models (pLM), donde compite con variantes como ProtBert, ProstT5 o la propia familia ESM-2 en otros tamanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ESM-2), 48 capas |
| Parametros totales | 15.129.098.273 (~15,1 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1022 residuos de aminoacidos (entrada maxima; truncado automatico) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; el repo ocupa 198,5 GB) |
| Idiomas soportados | no disponible (no es un modelo linguistico; opera sobre secuencias de aminoacidos canonicos) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, custom_code `nv_esm`) |

## Arquitectura y entrenamiento

ESM-2 es un transformer encoder entrenado con un objetivo de masked language modelling sobre secuencias de proteinas. La variante t48 consta de 48 capas y aproximadamente 1,5 x 10^10 parametros, lo que la convierte en el checkpoint mas grande de la familia (frente a los de 3B, 650M, 150M, 35M y 8M). El modelo produce embeddings por residuo y un embedding agregado a nivel de secuencia, que pueden alimentar cabezas de prediccion especificas o usarse directamente como representacion para tareas downstream.

El entrenamiento se realizo sobre UniRef90, una base de secuencias proteicas con identidad de cluster al 90 por ciento, con un volumen declarado en el rango de mil millones a diez billones de tokens. La model card no detalla la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en este paradigma). La innovacion tecnica de esta version concreta es la integracion de TransformerEngine de NVIDIA, que acelera el calculo en GPUs Ampere, Hopper y Blackwell; el autor advierte que pueden observarse diferencias numericas minimas respecto al modelo original de Meta, aunque los pesos y las salidas son equivalentes dentro de la precision.

## Capacidades

- Generacion de embeddings por aminoacido y a nivel de secuencia para proteinas de hasta 1022 residuos.
- Relleno de mascaras (fill-mask) sobre secuencias proteicas, util para evaluar plausibilidad de mutaciones.
- Base para prediccion de estructura tridimensional de proteinas, segun el caso de uso declarado por el autor.
- Fine-tuning supervisado en tareas downstream que tomen secuencias proteicas como entrada (clasificacion, regresion, prediccion de propiedades).
- Extraccion de representaciones para busqueda y comparacion de secuencias en espacios vectoriales.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es multilingue en sentido linguistico: su alfabeto son aminoacidos canonicos.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Prediccion de estructura proteica: usar los embeddings del modelo como entrada a cabezas de prediccion estructural (por ejemplo, plegado de residuos o contactos) para obtener modelos 3D aproximados de proteinas de hasta 1022 aminoacidos; es el caso de uso declarado en la model card.
- Anotacion funcional de proteinas: fine-tuning del encoder sobre datasets etiquetados para clasificar familias enzimaticas, localizacion subcelular o funciones moleculares, aprovechando las representaciones preentrenadas en UniRef90.
- Priorizacion de variantes en genomica clinica: calcular la verosimilitud de secuencias mutantes frente a la referencia mediante la cabeza de masked language modelling, para senalar variantes potencialmente deletereas antes de validacion experimental.
- Diseno de proteinas y mutagénesis dirigida: evaluar candidatos generados por otros metodos (modelos generativos, busquedas combinatorias) puntuando su plausibilidad bajo el modelo antes de sintetizarlos en laboratorio.
- Busqueda de homologia y clustering de secuencias: extraer embeddings de secuencia para agrupar proteinas por similitud en espacios vectoriales, complementando busquedas BLAST en escenarios donde la sensibilidad remota importa.
- Investigacion en pLM: servir como baseline de gran escala en estudios que comparan tecnicas de representacion proteica, dado que es el checkpoint mas grande de la familia ESM-2 y mantiene la licencia MIT.
- Fine-tuning en pipelines academicos: ajustar el modelo en tareas especificas de laboratorio con datos propios, apoyandose en las optimizaciones de TransformerEngine para reducir tiempos de entrenamiento en GPUs NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): no disponible de forma explicita; el repositorio de pesos ocupa 198,5 GB, lo que da una referencia del orden de magnitud en precision alta.
- GPU recomendadas: NVIDIA Ampere, Hopper y Blackwell son las microarquitecturas declaradas como compatibles; se espera despliegue en A100, H100 y GPUs de la generacion Blackwell.
- Cabe en GPU de consumo: no disponible; con 15,1 mil millones de parametros, la inferencia en precision completa queda fuera de GPUs consumer tipicas, y no se documentan en la informacion proporcionada opciones de cuantizacion ni pesos GGUF.
- Opciones de despliegue: Hugging Face Transformers (runtime declarado); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.
- Sistema operativo preferido/soportado: Linux.
- Requiere la libreria TransformerEngine de NVIDIA para aprovechar las optimizaciones; su instalacion se documenta en el repositorio oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| nvidia/esm2_t48_15B_UR50D | ~15,1 B | 1022 residuos | MIT | Hugging Face (transformers) | Version optimizada con TransformerEngine |
| facebook/esm2_t48_15B_UR50D | ~15,1 B | 1022 residuos | MIT | Hugging Face | Modelo original; pesos equivalentes dentro de la precision |
| facebook/esm2_t36_3B_UR50D | ~3 B | 1022 residuos | MIT | Hugging Face | Menor precision, menor coste de memoria |
| facebook/esm2_t33_650M_UR50D | ~650 M | 1022 residuos | MIT | Hugging Face | Apropiado para fine-tuning en hardware limitado |

Los checkpoints menores de ESM-2 (3B, 650M, 150M, 35M y 8M) ofrecen un compromiso entre precision y requisitos de memoria; el autor indica que los tamanos mayores tienen mejor precision pero requieren mas memoria y tiempo de entrenamiento. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: no genera texto, no conversa y no soporta tool calling ni agentes; su uso esta acotado a secuencias proteicas.
- Entrada limitada a 1022 aminoacidos; las secuencias mas largas se truncan automaticamente, lo que puede perder informacion en proteinas grandes.
- Solo acepta aminoacidos canonicos; no se documenta manejo de residuos no estandar ni de modificaciones postraduccionales.
- Riesgo de sesgo derivado de UniRef90: la composicion del dataset condiciona las representaciones y puede infrarepresentar familias proteicas poco presentes.
- Riesgo de alucinacion en sentido de predicciones plausibles pero incorrectas: los embeddings y puntuaciones de masked language modelling no son evidencia experimental y deben validarse.
- Diferencias numericas minimas respecto al modelo original de Meta por la optimizacion con TransformerEngine; conviene verificar la reproducibilidad si se comparan resultados con el checkpoint original.
- Licencia MIT: permite uso comercial, pero el autor recomienda pruebas adicionales especificas del caso de uso antes de desplegar en produccion.
- Sin datos publicados de cuantizacion ni de formatos alternativos (GGUF), lo que limita el despliegue en entornos de bajos recursos.
- Compatibilidad de hardware declarada limitada a NVIDIA (Ampere, Hopper, Blackwell) y sistema Linux.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/esm2_t48_15B_UR50D
- Modelo original de Meta: https://huggingface.co/facebook/esm2_t48_15B_UR50D
- Model card original de ESM-2: https://huggingface.co/facebook/esm2_t48_15B_UR50D
- Paper de referencia: https://www.biorxiv.org/content/10.1101/2022.07.20.500902v2
- Libreria TransformerEngine: https://github.com/NVIDIA/TransformerEngine
- Instalacion de TransformerEngine: https://github.com/NVIDIA/TransformerEngine?tab=readme-ov-file#installation
- Licencia MIT del proyecto ESM: https://github.com/facebookresearch/esm/blob/main/LICENSE
- Notebook de fine-tuning en PyTorch: https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_language_modeling.ipynb
- Notebook de fine-tuning en TensorFlow: https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_language_modeling-tf.ipynb
- UniRef90: https://www.uniprot.org/uniref?query=%28identity%3A0.9%29
