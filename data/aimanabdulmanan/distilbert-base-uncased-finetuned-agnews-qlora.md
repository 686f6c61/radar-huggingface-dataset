# aimanabdulmanan/distilbert-base-uncased-finetuned-AgNews-qlora

## Resumen

`distilbert-base-uncased-finetuned-AgNews-qlora` es un adaptador LoRA publicado por el usuario aimanabdulmanan sobre el modelo base `distilbert-base-uncased`. Se trata de un ajuste fino orientado a clasificación de texto, presumiblemente sobre el corpus AgNews (clasificación de noticias en cuatro categorías: World, Sports, Business y Sci/Tech), aunque la model card no confirma explícitamente el dataset de entrenamiento. El modelo se distribuye exclusivamente como pesos de adaptador PEFT en formato safetensors, no como modelo completo.

El modelo base DistilBERT es un transformer encoder destilado de BERT-base, con 66 millones de parámetros y una ventana de contexto de 512 tokens. Sobre esa base, el autor aplica un adaptador LoRA entrenado con cuantización (el sufijo "qlora" sugiere QLoRA, aunque la model card solo menciona PEFT y precisión mixta nativa). El resultado declarado es una accuracy y un F1 de 0,9377 en el conjunto de evaluación, con una pérdida de validación de 0,1710 tras tres épocas.

La relevancia de esta ficha es limitada: se trata de un artefacto de ajuste fino de un modelo pequeño, con cero descargas y cero likes en el momento de la consulta, sin documentación sobre el dataset, los idiomas o los casos de uso previstos. Resulta útil como ejemplo de flujo QLoRA sobre un encoder compacto, pero no como modelo de propósito general ni como referencia de rendimiento frente a alternativas consolidadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) con adaptador LoRA |
| Parametros totales | 66 millones (modelo base DistilBERT); el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de DistilBERT) |
| Tipos de cuantizacion | Entrenamiento con cuantización de 8 bits (optimizador PAGED_ADAMW_8BIT); no se documentan cuantizaciones de inferencia publicadas |
| Idiomas soportados | No disponible (el modelo base es uncased en inglés; el corpus AgNews es en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es DistilBERT, un transformer encoder de 6 capas y 66 millones de parámetros obtenido por destilación de BERT-base, que conserva el 97 % del rendimiento de BERT en GLUE según sus autores originales. Sobre él se entrena un adaptador LoRA, de modo que los pesos del modelo base permanecen congelados y solo se actualiza un subconjunto de parámetros de bajo rango. El nombre del repositorio indica QLoRA, es decir, ajuste con cuantización del modelo base, aunque la model card solo confirma el uso de precisión mixta nativa (Native AMP) y del optimizador `PAGED_ADAMW_8BIT`.

Los hiperparámetros documentados son: learning rate de 2e-4, batch size de 64 en entrenamiento y evaluación, semilla 42, scheduler lineal, 3 épocas y un total de 5.064 pasos. El dataset de entrenamiento aparece como "None" en la model card, por lo que no se puede confirmar la composición ni el número de tokens. No se documenta RLHF, DPO ni ninguna innovación técnica adicional más allá del propio esquema LoRA. Las versiones de framework declaradas son PEFT 0.21.2, Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto: el modelo está ajustado para una tarea de clasificación, presumiblemente de noticias en cuatro categorías (AgNews), aunque la model card no lo especifica.
- Representaciones de texto en inglés: hereda del modelo base DistilBERT la capacidad de generar embeddings contextuales para frases y documentos cortos.
- Razonamiento y generación de texto: no disponible; DistilBERT es un encoder sin cabeza generativa.
- Código y matemáticas: no disponible.
- Tool calling y function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no documentadas; el modelo base es monolingüe en inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Clasificación de titulares de noticias: el modelo puede asignar un titular o un párrafo corto a una de las categorías de AgNews, con la accuracy declarada de 0,9377 en el conjunto de evaluación del autor. Adecuado por su bajo coste computacional y su latencia reducida en CPU.
- Etiquetado de contenidos en un CMS: integrado como paso de un pipeline de ingestión, permite categorizar automáticamente artículos antes de su publicación, con la ventaja de que el adaptador LoRA se puede cargar sobre el modelo base sin duplicar los 66 millones de parámetros.
- Filtrado temático en agregadores RSS: al clasificar en cuatro clases, sirve para enrutar noticias hacia secciones concretas (deportes, economía, tecnología, internacional) con un modelo de menos de 70 millones de parámetros que cabe en cualquier entorno.
- Base para experimentación con QLoRA: el repositorio sirve como plantilla reproducible de ajuste fino con PEFT sobre un encoder pequeño, útil para equipos que quieran validar su pipeline de entrenamiento antes de escalar a modelos mayores.
- Análisis de sentimiento o topic modeling como tarea derivada: reentrenando el adaptador sobre un dataset propio, el mismo esquema permite adaptar DistilBERT a clasificación binaria o multiclase con recursos modestos.
- Prototipado rápido en entornos con GPU de gama baja: el entrenamiento en 8 bits con `PAGED_ADAMW_8BIT` y batch de 64 sugiere que el flujo completo cabe en una GPU consumer, lo que facilita ciclos de iteración cortos.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en la model card, medidos sobre un conjunto de evaluación no especificado. La model-index oficial no contiene resultados adicionales.

| Metrica | Valor declarado |
|---|---|
| Loss (evaluación) | 0,1710 |
| Accuracy | 0,9377 |
| F1 | 0,9377 |

Evolución durante el entrenamiento según la model card:

| Epoca | Step | Training loss | Accuracy | F1 | Validation loss |
|---|---|---|---|---|---|
| 1 | 1688 | 0,2568 | 0,9308 | 0,9307 | 0,1940 |
| 2 | 3376 | 0,1866 | 0,1765 | 0,936 | 0,9359 |
| 3 | 5064 | 0,1669 | 0,1710 | 0,9377 | 0,9377 |

Nota: la tabla de entrenamiento publicada por el autor contiene columnas aparentemente desalineadas en las épocas 2 y 3 (los valores de accuracy y validation loss coinciden con los de training loss y F1), por lo que los datos de esas filas deben tomarse con cautela. No se han publicado resultados de benchmarks estándar (MMLU, GLUE, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el modelo base (66 M de parámetros, unos 265 MB de pesos) más el adaptador LoRA, cuyo tamaño no se especifica pero que en la práctica es de pocos megabytes.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo cabe holgadamente en tarjetas de gama baja como GTX 1650, RTX 3050 o T4.
- GPU consumer: sí, en prácticamente cualquier GPU consumer de los últimos años; también es viable en CPU para inferencia por lotes.
- Opciones de despliegue: `transformers` con `peft` para cargar el adaptador sobre el modelo base; exportación a ONNX o cuantización a int8 para servir en CPU. No se documenta soporte específico en vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| distilbert-base-uncased-finetuned-AgNews-qlora | 66 M (base) + LoRA | 512 | Clasificación de noticias (presunta) | Apache 2.0 | Adaptador PEFT en HF |
| distilbert-base-uncased | 66 M | 512 | Modelo base encoder | Apache 2.0 | Pesos completos en HF |
| bert-base-uncased | 110 M | 512 | Modelo base encoder | Apache 2.0 | Pesos completos en HF |
| roberta-base | 125 M | 512 | Modelo base encoder | MIT | Pesos completos en HF |

La comparación se limita a modelos base de la misma familia y tamaño, ya que no se dispone de resultados de benchmarks comparables publicados para este adaptador. Frente a `bert-base-uncased`, el modelo aquí descrito ofrece un 40 % menos de parámetros a costa de una pequeña pérdida de rendimiento en tareas generales, compensada en este caso por el ajuste específico. No se dispone de datos para comparar con alternativas ajustadas a AgNews.

## Limitaciones y advertencias

- La model card está generada automáticamente y contiene secciones sin completar ("More information needed") sobre descripción, usos previstos y datos de entrenamiento.
- El dataset de entrenamiento figura como "None"; no se puede verificar la composición, el tamaño ni la procedencia de los datos, lo que impide evaluar sesgos y riesgo de contaminación.
- El modelo base DistilBERT está entrenado principalmente en inglés; no hay evidencia de capacidades multilingües.
- Ventana de contexto de 512 tokens: no apta para documentos largos sin truncado o segmentación previa.
- La tabla de resultados de entrenamiento contiene valores inconsistentes entre épocas, lo que reduce la fiabilidad de las métricas declaradas.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador, no un generador), pero sí riesgo de clasificaciones erróneas en dominios alejados de AgNews.
- Licencia Apache 2.0 permite uso comercial, pero al ser un adaptador sobre un modelo base de terceros conviene verificar también la licencia y las condiciones del modelo base.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación externa.
- No se documentan cuantizaciones de inferencia ni métricas de latencia, por lo que el rendimiento en despliegue es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aimanabdulmanan/distilbert-base-uncased-finetuned-AgNews-qlora
- Modelo base DistilBERT: https://huggingface.co/distilbert-base-uncased
- Repositorio de PEFT: https://github.com/huggingface/peft
- Paper de DistilBERT: https://arxiv.org/abs/1910.01108
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper de QLoRA: https://arxiv.org/abs/2305.14314
- Dataset AgNews (referencia): https://huggingface.co/datasets/fancyzhx/ag_news
