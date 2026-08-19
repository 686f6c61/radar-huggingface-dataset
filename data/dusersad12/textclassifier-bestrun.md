# dusersad12/TextClassifier-BestRun

## Resumen

El modelo `dusersad12/TextClassifier-BestRun` es un clasificador de texto basado en BERT, concretamente una puesta a punto (fine-tuning) de `bert-base-uncased` sobre un conjunto de datos de cinco clases. Lo desarrolla el usuario `dusersad12` y se publica en Hugging Face con licencia MIT. El propósito declarado es la clasificación de secuencias de texto en cinco categorías, y no está diseñado para generación de texto ni para tareas fuera de su distribución de entrenamiento.

Su relevancia radica en ser un ejemplo práctico de fine-tuning de BERT para clasificación, con un proceso de selección de hiperparámetros documentado (sweep con varias configuraciones) y métricas de validación reportadas (F1 de 0.851 y accuracy de 0.865). Aunque el repositorio no contiene archivos de pesos (tamaño 0.0 GB) y no registra descargas, la model card ofrece detalles útiles sobre el entrenamiento y la evaluación, lo que lo convierte en un caso de estudio interesante para quienes trabajan con pipelines de clasificación de texto en `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (bert-base-uncased) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio vacio) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura BERT base (`bert-base-uncased`), un transformer encoder de 12 capas con 110 millones de parámetros aproximadamente (aunque este dato no se indica en la model card, es el estándar de ese modelo base). Se realizó un fine-tuning para clasificación de secuencias, añadiendo una cabeza de clasificación con cinco salidas. El entrenamiento se llevó a cabo mediante un barrido de hiperparámetros (sweep) en el que se probaron distintas combinaciones de learning rate, batch size y weight decay. El mejor run (identificado como `run-def456`) utilizó un learning rate de 5e-05, batch size de 16, weight decay de 0.01 y se entrenó durante 10 épocas. La selección del checkpoint final se basó en la métrica F1 de validación, alcanzando un valor de 0.851. No se menciona el uso de técnicas como RLHF o DPO, ni se especifica la composición del dataset de entrenamiento.

## Capacidades

- Clasificación de texto en cinco clases predefinidas, según el dataset de entrenamiento.
- Acepta entradas de texto en formato de secuencia (típicamente hasta 512 tokens, aunque no se especifica en la ficha).
- Integración con el ecosistema `transformers` de Hugging Face, lo que permite su uso con pipelines estándar de clasificación de texto.
- Compatible con `endpoints_compatible`, lo que facilita su despliegue en servicios de inferencia gestionados.
- No soporta generación de texto, ni tool calling, ni razonamiento multi-paso, ni capacidades multimodales.

## Casos de uso

- Análisis de sentimiento en reseñas de productos: el modelo puede clasificar opiniones de clientes en cinco niveles (por ejemplo, muy negativo, negativo, neutral, positivo, muy positivo), siempre que el dataset de entrenamiento haya incluido esas categorías. Al ser BERT, maneja bien el contexto y las negaciones.
- Moderación de contenido en foros o redes sociales: asignar etiquetas como "aceptable", "spam", "abuso", etc., a comentarios de usuarios. Su tamaño reducido permite inferencia rápida incluso en CPU.
- Categorización de tickets de soporte: clasificar solicitudes de atención al cliente en cinco departamentos o tipos de incidencia (facturación, técnico, ventas, etc.) para enrutarlas automáticamente.
- Clasificación de documentos legales o administrativos: separar contratos, facturas, informes u otros textos en categorías predefinidas, facilitando su archivado y búsqueda.
- Detección de spam en correos electrónicos: aunque BERT es más pesado que métodos tradicionales, puede usarse en entornos donde se priorice la precisión sobre la latencia.
- Etiquetado de artículos de noticias por tema: clasificar titulares o cuerpos de texto en cinco secciones (deportes, política, tecnología, economía, cultura) para alimentar sistemas de recomendación.

## Benchmarks y rendimiento

La model card reporta métricas de validación para el mejor run y para otros runs del barrido de hiperparámetros. No se proporcionan resultados en benchmarks externos como MMLU, HumanEval o GLUE. La siguiente tabla resume los resultados de validación de los distintos runs:

| Run ID | Run Name | Learning Rate | Batch Size | Weight Decay | Val F1 | Val Accuracy | Val Loss | Best Epoch |
|--------|----------|---------------|------------|--------------|--------|--------------|----------|-------------|
| run-def456 | sweep-lr5e5-bs16 | 5e-05 | 16 | 0.01 | 0.851 | 0.865 | 0.487 | 10 |
| run-pqr678 | sweep-lr5e5-bs16-wd005 | 5e-05 | 16 | 0.005 | 0.841 | 0.855 | 0.512 | 10 |
| run-jkl012 | sweep-lr5e5-bs32-wd0 | 5e-05 | 32 | 0.0 | 0.829 | 0.841 | 0.583 | 8 |
| run-abc123 | sweep-lr3e5-bs32 | 3e-05 | 32 | 0.01 | 0.811 | 0.826 | 0.585 | 10 |
| run-ghi789 | sweep-lr2e5-bs64 | 2e-05 | 64 | 0.02 | 0.782 | 0.796 | 0.649 | 10 |
| run-mno345 | sweep-lr1e4-bs32 | 0.0001 | 32 | 0.01 | 0.735 | 0.751 | 0.821 | 7 |

No se han publicado resultados de benchmarks externos en la informacion disponible.

## Requisitos de hardware

- Al tratarse de un modelo BERT base, la inferencia puede ejecutarse en CPU con un consumo de memoria moderado, aunque no se especifican cifras exactas en la ficha.
- Para inferencia en GPU, cualquier tarjeta con al menos 2-4 GB de VRAM sería suficiente (por ejemplo, NVIDIA GTX 1650, RTX 3060), asumiendo el tamaño estándar de BERT base. Sin embargo, no hay datos concretos del modelo en el repositorio.
- El repositorio no incluye archivos de pesos, por lo que no se puede desplegar directamente sin subir los pesos primero.
- Opciones de despliegue compatibles: al usar `transformers`, se puede servir con bibliotecas como vLLM, TGI o un simple pipeline de Hugging Face. También es compatible con `endpoints_compatible`.
- No se dispone de mediciones de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. El modelo no presenta benchmarks frente a alternativas como `distilbert-base-uncased` o `roberta-base` en la model card. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El rendimiento reportado (F1 0.851) es específico del conjunto de validación utilizado durante el entrenamiento; puede no generalizar a datos fuera de distribución o dominios no vistos.
- El modelo no debe emplearse para generación de texto, ya que su arquitectura y entrenamiento están orientados exclusivamente a clasificación.
- No se especifican los idiomas soportados; aunque `bert-base-uncased` está entrenado principalmente en inglés, no hay confirmación explícita en la ficha.
- El repositorio en Hugging Face está vacío (tamaño 0.0 GB), por lo que no se pueden descargar los pesos del modelo. Esto impide su uso práctico hasta que el autor suba los archivos.
- Al ser un modelo de clasificación, puede presentar sesgos derivados del dataset de entrenamiento, aunque no se documentan sesgos específicos.
- La licencia MIT permite uso comercial, pero al no haber pesos disponibles, la aplicabilidad comercial es nula en la práctica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dusersad12/TextClassifier-BestRun
- Documentación de Hugging Face sobre clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
