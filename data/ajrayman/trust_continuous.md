# ajrayman/Trust_continuous

## Resumen

Trust_continuous es un modelo de clasificación de texto desarrollado por el usuario ajrayman, publicado en Hugging Face el 3 de agosto de 2024. Se trata de un ajuste fino (fine-tuning) del modelo base RoBERTa-base, orientado a tareas de clasificación de texto, aunque las métricas de evaluación reportadas (RMSE, MAE, correlación) sugieren que la tarea real es de regresión, probablemente para predecir un valor continuo de confianza o fiabilidad. El modelo tiene 124.646.401 parámetros y una ventana de contexto de 512 tokens, heredada de RoBERTa-base.

La relevancia de este modelo radica en su especialización en la medición de confianza en texto, un área emergente en la evaluación de contenido generado por IA y en sistemas de moderación. Sin embargo, la documentación es muy escasa: la model card no describe el dataset de entrenamiento, los casos de uso previstos ni las limitaciones, lo que limita su aplicabilidad directa en producción sin una evaluación adicional. A pesar de ello, su licencia MIT permite uso comercial y su tamaño moderado lo hace viable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (RoBERTa-base) |
| Parametros totales | 124.646.401 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (heredados de RoBERTa-base, principalmente ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa-base, un transformer encoder-only con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención. RoBERTa-base fue preentrenado con 160 GB de texto en ingles, y Trust_continuous es un ajuste fino de este modelo base. El entrenamiento se realizó con los siguientes hiperparametros: learning rate de 2e-05, batch size de 32, optimizador Adam (beta1=0.9, beta2=0.999), scheduler lineal con warmup ratio de 0.06 y 8 epocas. El dataset de entrenamiento no se especifica en la model card (aparece como "None dataset"), y no hay informacion sobre tecnicas de RLHF o DPO. Las metricas de evaluacion (RMSE, MAE, correlacion) indican que la tarea es de regresion, probablemente para predecir un valor continuo de confianza, aunque no se confirma en la documentacion.

## Capacidades

- Clasificacion de texto: el pipeline declarado es text-classification, por lo que puede asignar etiquetas o valores a fragmentos de texto.
- Regresion continua: las metricas de evaluacion (RMSE, MAE, Corr) sugieren que el modelo predice un valor numerico continuo, posiblemente un indice de confianza o fiabilidad.
- Multilingue: no se especifican idiomas, pero al derivar de RoBERTa-base, su capacidad multilingue es limitada (principalmente ingles).
- Tool calling y agentes: no soportado, al ser un modelo encoder-only sin generacion autoregresiva.
- Vision o audio: no soportado.

## Casos de uso

- Evaluacion de confianza en contenido generado por IA: el modelo podria usarse para puntuar la fiabilidad de respuestas de chatbots o textos sinteticos, aunque requiere validacion previa.
- Moderacion de contenido: podria clasificar comentarios o publicaciones segun un nivel de confianza o toxicidad, si se entrena con datos adecuados.
- Analisis de sentimiento con puntuacion continua: en lugar de etiquetas discretas, podria asignar un valor numerico de positividad o negatividad.
- Filtrado de informacion en sistemas de recomendacion: para priorizar contenido con mayor confianza percibida.
- Investigacion academica: como base para estudiar la relacion entre caracteristicas textuales y confianza percibida.
- Prototipos de sistemas de deteccion de desinformacion: aunque no hay evidencia de su eficacia, podria integrarse en pipelines de verificacion de hechos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye solo las metricas de evaluacion del autor, que se muestran a continuacion:

| Metrica | Valor |
|---|---|
| Loss | 0.0630 |
| RMSE | 0.2511 |
| MAE | 0.1957 |
| Corr | 0.2753 |

Estos valores corresponden a la evaluacion final del modelo, pero no se comparan con otros modelos ni se detalla el conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada: con 124M parametros, en FP32 ocupa aproximadamente 500 MB, en FP16 unos 250 MB y en int8 unos 125 MB. Cabe en cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para inferencia en FP16. Para entrenamiento, se recomienda al menos 8 GB.
- Opciones de despliegue: compatible con la libreria transformers de Hugging Face, y puede servirse con vLLM, TGI o llama.cpp (aunque estos ultimos estan mas orientados a modelos generativos). Tambien se puede exportar a ONNX para inferencia optimizada.
- Latencia y throughput: no se dispone de datos oficiales, pero al ser un modelo pequeno, la inferencia es rapida (del orden de milisegundos por muestra en GPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Trust_continuous | 124M | 512 | Clasificacion/regresion de confianza | MIT | Hugging Face |
| RoBERTa-base (modelo base) | 125M | 512 | Clasificacion de texto general | MIT | Hugging Face |
| BERT-base | 110M | 512 | Clasificacion de texto general | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la tarea especifica de Trust_continuous. La comparativa se limita a caracteristicas arquitectonicas y de licencia.

## Limitaciones y advertencias

- Documentacion insuficiente: no se especifica el dataset de entrenamiento, los casos de uso previstos ni las limitaciones, lo que dificulta evaluar su idoneidad para tareas concretas.
- Sesgos potenciales: al derivar de RoBERTa-base, puede heredar sesgos presentes en los datos de preentrenamiento (genero, raza, etc.), y el dataset de ajuste fino es desconocido.
- Riesgo de alucinacion: al ser un modelo de clasificacion, no genera texto, pero puede producir predicciones incorrectas si los datos de entrenamiento no son representativos.
- Limitaciones de contexto: ventana de 512 tokens, insuficiente para documentos largos.
- Idiomas: no se declara soporte multilingue; probablemente solo funcione bien en ingles.
- Uso comercial: la licencia MIT permite uso comercial sin restricciones, pero sin garantias de rendimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ajrayman/Trust_continuous
- Modelo base RoBERTa-base: https://huggingface.co/FacebookAI/roberta-base
- Otros modelos del mismo autor (referencia): https://huggingface.co/ajrayman/Morality_continuous, https://huggingface.co/ajrayman/machiavellianism_continuous
- Articulo sobre confianza continua (contexto general): https://www.forbes.com/councils/forbestechcouncil/2026/08/26/the-month-end-trust-model-is-broken-heres-what-replaces-it/
