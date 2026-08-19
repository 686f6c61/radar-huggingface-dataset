# leobianco/bosch_RM_google_S130104_LLM_false_STRUCT_false_epo15_lr6.2e-04_r8_2608191212

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste fino basado en el modelo `google/gemma-4-E4B-it`, publicado por el usuario leobianco (Leonardo Martins Bianco) en Hugging Face. El nombre del modelo sugiere un caso de uso interno relacionado con Bosch (posiblemente un clasificador o modelo de recompensa para evaluar respuestas), aunque la documentación no especifica el propósito exacto ni el conjunto de datos de entrenamiento.

El adaptador tiene un tamaño de 0,2 GB y se entrenó durante 15 épocas con una tasa de aprendizaje de 6,2e-04 y un rango LoRA de 8. Las métricas de evaluación reportadas (ROC AUC de 0,8799 y precisión del 80,65 % en el umbral óptimo) indican que se trata de una tarea de clasificación binaria, probablemente un modelo de recompensa (reward model) para filtrar o puntuar respuestas generadas por LLM. La relevancia de este modelo es limitada fuera del contexto del proyecto original, dado que no se han publicado detalles sobre los datos de entrenamiento ni casos de uso documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adaptador sobre google/gemma-4-E4B-it (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador ocupa 0,2 GB; el modelo base tiene aproximadamente 4 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base gemma-4-E4B-it) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre el modelo base `google/gemma-4-E4B-it`, un transformer decoder-only de la familia Gemma 4 con aproximadamente 4 mil millones de parametros y orientado a instrucciones (it = instruction tuned). La tecnica LoRA congela los pesos del modelo base e inyecta matrices de bajo rango en las capas de atencion, lo que permite un ajuste eficiente con un coste computacional reducido.

El entrenamiento se realizo con un rango LoRA de 8, durante 15 épocas, con un tamaño de lote total de 32 (2 dispositivos GPU), optimizador AdamW con learning rate 6,2e-04 y programador coseno con 0,1 pasos de calentamiento. La semilla utilizada fue 130104. No se especifica el conjunto de datos de entrenamiento, aunque las metricas de evaluacion (ROC AUC, TPR, FPR) indican que se trata de una tarea de clasificacion binaria supervisada, probablemente un modelo de recompensa para puntuar respuestas. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion adicionales.

## Capacidades

- Clasificacion binaria: el modelo puntua o clasifica entradas en dos categorias, con una ROC AUC de 0,8799 en el conjunto de evaluacion.
- Modelo de recompensa: por las metricas (avg score true positives 0,8987 frente a 0,3415 en negativos), es probable que funcione como scorer para distinguir respuestas de alta y baja calidad.
- Hereda las capacidades de generacion de texto del modelo base gemma-4-E4B-it, aunque el adaptador no ha sido evaluado en tareas generativas.
- No se ha verificado soporte para tool calling, agentes, vision ni otras capacidades especiales en este adaptador concreto.

## Casos de uso

- Filtrado de respuestas generadas por LLM: el modelo puede utilizarse para puntuar y filtrar respuestas de baja calidad antes de mostrarlas al usuario final, aprovechando su capacidad para distinguir entre positivos y negativos con una ROC AUC de 0,88.
- Sistema de recompensa para RLHF: como clasificador de preferencias, puede integrarse en pipelines de aprendizaje por refuerzo para proporcionar senales de recompensa a un policy model.
- Moderacion de contenido generado: en entornos empresariales como el que sugiere el nombre "bosch", podria emplearse para detectar respuestas no deseadas o fuera de politica en asistentes virtuales.
- Evaluacion automatica de calidad: como componente en pipelines de evaluacion de LLM, puntuando respuestas de forma automatica en lugar de depender de evaluacion humana.
- Clasificacion de documentos o textos: dado que es un clasificador binario, podria adaptarse a tareas de triage o enrutamiento de textos en funcion de su contenido.
- Investigacion sobre adaptadores LoRA: util como caso de estudio para analizar el comportamiento de ajuste fino eficiente sobre Gemma 4 con pocos datos y metricas de clasificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye metricas de evaluacion propias de una tarea de clasificacion binaria, resumidas en la siguiente tabla:

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 1,9397 |
| ROC AUC | 0,8799 |
| Mejor umbral | 0,9997 |
| TPR en mejor umbral | 0,8028 |
| FPR en mejor umbral | 0,1818 |
| Precision en mejor umbral | 0,8065 |
| Puntuacion media (true positives) | 0,8987 |
| Puntuacion media (true negatives) | 0,3415 |

Estos valores corresponden al adaptador tras 15 épocas de entrenamiento. La evolucion durante el entrenamiento muestra una mejora progresiva de la ROC AUC desde 0,4586 (época 0) hasta 0,8799 (época final), con fluctuaciones notables en la loss de validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA ocupa 0,2 GB, pero requiere cargar el modelo base gemma-4-E4B-it. En precision fp16, el modelo base necesita aproximadamente 8-10 GB de VRAM; con cuantizacion de 4 bits, unos 4-5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3070/4060, A10, L4) para fp16; GPUs de 4-6 GB pueden funcionar con cuantizacion (RTX 3060, T4).
- Cabe en GPU de consumo: si, en GPUs de gama media con cuantizacion (4 bits) o en GPUs de gama alta en fp16.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la libreria `peft` de Hugging Face junto con transformers. Tambien es compatible con vLLM, llama.cpp y Ollama si se fusionan los pesos del adaptador con el modelo base.
- Latencia y throughput: no se han publicado mediciones especificas. Como referencia, un modelo de 4B en una GPU consumer genera aproximadamente 20-40 tokens/s en fp16.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El modelo es un adaptador LoRA especifico para una tarea de clasificacion no documentada, por lo que no existen modelos directamente comparables con metricas publicadas en las mismas condiciones. Como referencia general:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este adaptador (LoRA sobre Gemma 4 E4B) | 0,2 GB (adaptador) | no disponible | Apache 2.0 | Clasificador binario, ROC AUC 0,88 |
| google/gemma-4-E4B-it (base) | ~4B | no disponible | Apache 2.0 | Modelo base, generacion de texto e instrucciones |
| Otros adaptadores de leobianco | variable | no disponible | Apache 2.0 | El autor publica multiples adaptadores LoRA, todos con documentacion limitada |

## Limitaciones y advertencias

- Documentacion insuficiente: no se especifica el conjunto de datos de entrenamiento, la tarea exacta ni los casos de uso previstos. Esto impide evaluar su idoneidad para otros escenarios.
- Riesgo de sobreajuste: el entrenamiento durante 15 épocas con un dataset desconocido y sin regularizacion explicita puede haber provocado sobreajuste a los datos de entrenamiento.
- Sin evaluacion generativa: no se han publicado resultados de calidad de generacion de texto, por lo que no se recomienda su uso como modelo generativo sin validacion adicional.
- Sesgos desconocidos: al no conocer los datos de entrenamiento, no es posible identificar sesgos potenciales. Si se entreno con datos internos de Bosch, podria reflejar sesgos de ese dominio especifico.
- Sin garantias de produccion: las metricas de clasificacion (precision 80,65 %) pueden no ser suficientes para aplicaciones criticas sin un analisis adicional de errores.
- Repositorio sin mantenimiento: el modelo fue creado en agosto de 2026 y no muestra actividad posterior; no hay garantias de soporte o actualizaciones.

## Enlaces

- Repositorio del modelo: https://huggingface.co/leobianco/bosch_RM_google_S130104_LLM_false_STRUCT_false_epo15_lr6.2e-04_r8_2608191212
- Perfil del autor: https://huggingface.co/leobianco
- Datasets del autor: https://huggingface.co/leobianco/datasets
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
