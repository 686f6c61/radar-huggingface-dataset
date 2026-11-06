# klohdfhk/amharic-sentiment-ai

## Resumen

Amharic Sentiment AI es un clasificador de sentimiento en tres clases (positivo, neutro, negativo) para amharico, desarrollado por el usuario klohdfhk y publicado en Hugging Face. Se trata de un ajuste fino del encoder multilingue Davlan/afro-xlmr-mini (revision `bc04038b969667884bd83cdd37bed9559c2c3d9c`), entrenado sobre el benchmark oficial AfriSenti Amharic (SemEval-2023 Task 12) con licencia CC BY 4.0.

El modelo resuelve la tarea de clasificacion de sentimiento en redes sociales para uno de los idiomas con menos recursos del ecosistema NLP. Su relevancia radica en la escasa disponibilidad de clasificadores publicos para amharico y en que el autor documenta de forma transparente el proceso de seleccion (macro-F1 de validacion), la semilla fija (42) y los resultados en el split de test oficial de 1.999 publicaciones, incluyendo intervalos de confianza bootstrap.

El rendimiento es modesto: accuracy de 0,460 y macro-F1 de 0,466 en test, con un desequilibrio severo de clases en el split de evaluacion (66,9% negativo frente a un 25,9% en entrenamiento). Es, por tanto, una pieza de investigacion y demostracion educativa mas que un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-R, ajuste fino de Davlan/afro-xlmr-mini) |
| Parametros totales | 117.641.859 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | amharico (am) |
| Licencia | CC BY 4.0 (pesos); codigo original del proyecto bajo MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en XLM-R en su variante mini (afro-xlmr-mini), adaptada por Davlan para lenguas africanas. Sobre esa base se anade una cabeza de clasificacion de tres clases. El ajuste fino se realizo con semilla fija 42 y una estrategia de seleccion basada en el mayor macro-F1 de validacion entre candidatos; el modelo liberado se reentreno desde cero sobre la union de train y validacion con los hiperparametros y numero de epocas elegidos en validacion, sin usar el test en la seleccion ni en el reentrenamiento.

Los datos proceden del split oficial de AfriSenti Amharic (commit fijado `5aec3cfcf87b59f885e98641f72e52182776429d`), con auditoria de solapamiento entre splits documentada en `data_audit.json`. El autor no especifica el numero de tokens de entrenamiento ni si hubo tecnicas de aumento de datos o perdida ponderada por clase, aunque el enfasis en macro-F1 sugiere conciencia del desequilibrio. El repositorio incluye codigo de inferencia (`amharic_sentiment.inference.SentimentPredictor`) y dependencias fijadas en `requirements.lock` para reproducibilidad.

## Capacidades

- Clasificacion de texto en tres etiquetas: `positive` (ID 0), `neutral` (ID 1) y `negative` (ID 2).
- Analisis de sentimiento sobre publicaciones en amharico de redes sociales.
- Inferencia mediante API Python incluida en el repositorio (`SentimentPredictor`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al amharico; no se documenta transferencia a otros idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Monitorizacion de opinion en redes sociales en amharico: el modelo puede etiquetar publicaciones como positivas, neutras o negativas para agregar tendencias por tema, aunque su recall en clase negativa (0,391) obliga a revisar manualmente los falsos negativos.
- Investigacion academica en NLP de bajos recursos: sirve como linea base reproducible (semilla fija, configuracion y auditoria de datos incluidos) para comparar futuros clasificadores de amharico.
- Etiquetado asistido para anotacion humana: el modelo puede preetiquetar grandes volumenes de texto y que los anotadores corrijan, reduciendo el coste inicial de crear corpus etiquetados.
- Demostraciones educativas de sentiment analysis: el codigo de inferencia incluido permite montar un ejemplo funcional en un cuaderno o script sin infraestructura adicional.
- Analisis exploratorio de encuestas o comentarios en amharico: util para detectar rapidamente la polaridad dominante de un lote de textos antes de un analisis cualitativo mas profundo.
- Filtrado previo en pipelines de moderacion: puede usarse como primera pasada para separar contenido negativo y priorizar la revision humana, nunca como decision automatica por su baja precision en clase neutra (0,167).
- Benchmarking de encoders afrocentricos: permite evaluar el rendimiento de afro-xlmr-mini frente a otras variantes en una tarea concreta de clasificacion.

## Benchmarks y rendimiento

Resultados en el split de test oficial de AfriSenti Amharic (1.999 publicaciones), segun la model card:

| Metrica | Valor |
|---|---:|
| Accuracy | 0,460 |
| Macro-F1 | 0,466 |
| Weighted-F1 | 0,521 |
| Balanced accuracy | 0,569 |
| Intervalo bootstrap 95% macro-F1 | 0,444–0,487 |

| Clase | Precision | Recall | F1 | Soporte |
|---|---:|---:|---:|---:|
| positive | 0,718 | 0,477 | 0,573 | 438 |
| neutral | 0,167 | 0,839 | 0,279 | 224 |
| negative | 0,894 | 0,391 | 0,544 | 1337 |

No se han publicado comparaciones con otros modelos en la informacion disponible. El autor advierte que las etiquetas de test presentan un desplazamiento de distribucion (66,9% negativo y 11,2% neutro, frente a 25,9% y 51,9% en train/validacion) y que el intervalo bootstrap refleja remuestreo de filas del test para el modelo fijo, no variacion entre semillas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 para 117,6 M de parametros; en la practica cabe en cualquier GPU consumer con 2 GB o mas.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para lotes pequenos. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es mas que suficiente.
- Cabe en consumer GPU: si, en todas las GPU modernas e incluso en hardware integrado.
- Opciones de despliegue: PyTorch con el codigo de inferencia incluido; el formato safetensors permite cargarlo con `transformers` o `safetensors` y exportarlo a ONNX para servir con ONNX Runtime o TorchServe. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro-F1 en AfriSenti am | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Amharic Sentiment AI (klohdfhk) | 117,6 M | no disponible | 0,466 | CC BY 4.0 | Hugging Face |
| Davlan/afro-xlmr-mini (base sin ajustar) | ~117 M | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| XLM-RoBERTa base | 278 M | 512 tokens | no disponible | MIT | Hugging Face |

No se dispone de resultados publicados de alternativas en el mismo split dentro de la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento queda como no disponible. Las alternativas citadas son encoders multilingues que sirven de base o referencia arquitectonica, no clasificadores de sentimiento ya ajustados para amharico.

## Limitaciones y advertencias

- Rendimiento bajo: accuracy de 0,460 y macro-F1 de 0,466 en test, lejos de lo que se exigiria en produccion.
- Desplazamiento de distribucion en test: la proporcion de clases del split de evaluacion difiere fuertemente de la de entrenamiento, lo que infla o deprime metricas por clase.
- Precision muy baja en clase neutra (0,167): casi cualquier prediccion de neutral es probablemente incorrecta.
- Recall bajo en clase negativa (0,391): pierde mas de la mitad de los casos negativos reales.
- No calibrado: el autor advierte explicitamente que las salidas no son probabilidades calibradas.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificaciones erroneas por sarcasmo, dialectos, variacion ortografica, code-switching y contexto cultural.
- Uso previsto limitado a investigacion y demostracion educativa; prohibido para decisiones de alto impacto o perfilado de personas segun la model card.
- Idioma unico (amharico): no se documenta transferencia a otras lenguas.
- Licencia CC BY 4.0 en pesos: permite uso comercial con atribucion, pero la licencia de la base afro-xlmr-mini sigue aplicando y debe verificarse por separado.
- Una sola ejecucion con semilla fija: no se reclama significancia estadistica entre semillas.
- Sin demo alojada: no hay Gradio ni endpoint publico; hay que desplegar el codigo incluido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/klohdfhk/amharic-sentiment-ai
- Modelo base: https://huggingface.co/Davlan/afro-xlmr-mini
- Dataset AfriSenti (SemEval-2023 Task 12): https://github.com/afrisenti-semeval/afrisent-semeval-2023
- Paper de AfriSenti (Muhammad et al., EMNLP 2023): https://aclanthology.org/2023.emnlp-main.862/
