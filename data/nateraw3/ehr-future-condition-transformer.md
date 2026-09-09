# nateraw3/ehr-future-condition-transformer

## Resumen

EHR Future Condition Forecasting Transformer es un modelo de investigación desarrollado por el usuario nateraw3. Se trata de un Transformer causal personalizado en PyTorch, diseñado para predecir el diagnóstico futuro de condiciones médicas a partir de timelines longitudinales de registros electrónicos de salud (EHR). El problema que aborda es el de forecasting de condiciones de primer diagnóstico en un horizonte posterior a un token ancla, trabajando con 40 etiquetas en formato multilabel.

La arquitectura consiste en un decoder Transformer causal de 4 capas, 8 cabezas de atención y dimensión oculta de 256, con una ventana de contexto máxima de 512 tokens. Incluye posicionamiento rotatorio temporal basado en la edad del paciente y una cabeza de clasificación no lineal de 256 a 256 y de 256 a 40 salidas. El modelo fue preentrenado con predicción causal de siguiente evento y posteriormente afinado con Asymmetric Loss. Su relevancia radica en mostrar cómo adaptar arquitecturas Transformer a datos estructurados clínicos, aunque su evaluación se limita a datos sintéticos derivados de Synthea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | model.pt (PyTorch personalizado) y preprocessing_state.joblib |

## Arquitectura y entrenamiento

El modelo representa a cada paciente como una secuencia cronologica de eventos de EHR, que incluyen diagnosticos, inicios y paradas de medicacion, procedimientos, observaciones y encuentros. La secuencia termina con un token [ANCHOR], tras el cual se definen los 40 objetivos de clasificacion multilabel para condiciones futuras. Los embeddings posicionales rotatorios se calculan a partir de la edad del paciente, lo que permite incorporar informacion temporal explicita.

El Transformer fue preentrenado mediante prediccion causal del siguiente evento y despues afinado con Asymmetric Loss, una funcion de perdida adecuada para situaciones de desbalanceo entre etiquetas. El estado de preprocesamiento queda guardado en `preprocessing_state.joblib`, con observaciones numericas codificadas mediante cuantiles ajustados en entrenamiento y observaciones categoricas con mapeos entrenados. Las paradas e inicios de medicacion se representan por separado. El vocabulario total es de 1383 elementos y la longitud maxima de secuencia es 512. La implementacion es un modelo personalizado de PyTorch, por lo que no puede cargarse directamente con `transformers.AutoModel`; requiere el codigo disponible en el repositorio de GitHub asociado.

## Capacidades

- Clasificacion multilabel de 40 condiciones futuras de primer diagnostico en un horizonte post-anchor definido.
- Procesamiento de secuencias largas de eventos clinicos heterogeneos: diagnosticos, medicaciones, procedimientos, observaciones y encuentros.
- Uso de la edad del paciente como variable posicional temporal mediante rotary embeddings.
- Modelo de tipo discriminativo: produce probabilidades por condicion, sin generacion de texto libre.
- No soporta tool calling, function calling, razonamiento multi-paso conversacional, vision, audio ni agentes.
- Capacidades multilingues: no aplica, dado que el modelo opera sobre codigos de eventos clinicos, no sobre lenguaje natural.

## Casos de uso

- Investigacion academica en forecasting de EHR: el modelo sirve como referencia para estudiar tecnicas de representacion de timelines clinicos con Transformers causales en datasets sinteticos.
- Evaluacion de metodos de preprocesamiento clinico: el estado de preprocesamiento incluido permite comparar estrategias de codificacion de eventos numericos y categoricos en secuencias de salud.
- Benchmarks de clasificacion multilabel desbalanceada: su uso de Asymmetric Loss y de 40 etiquetas es util para investigar funciones de perdida en problemas de etiquetas raras.
- Pruebas de concepto en entornos de investigacion sin requisitos regulatorios: el modelo puede integrarse en flujos experimentales de laboratorio para validar hipotesis sobre prediccion de condiciones.
- Generacion de hipotesis epidemiologicas: los patrones aprendidos sobre datos sinteticos pueden servir para formular hipotesis que despues se verifiquen con datos reales, siempre que se realice validacion externa.
- Educacion en IA clinica: al ser un modelo personalizado y de tamano moderado, es util como ejemplo practico de entrenamiento y evaluacion de Transformers sobre datos medicos estructurados.

## Benchmarks y rendimiento

El autor proporciona resultados de validacion final en los datos de prueba:

| Metrica | Valor |
|---|---|
| Macro AUROC | 0.731870 |
| Mean Average Precision (mAP) | 0.203563 |
| Loss de validacion en fine-tuning | 0.017285 |
| Mejor epoca de fine-tuning | 19 |
| Loss de next-event en pretraining (epoca 29) | 1.470598 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no especificada; dada la arquitectura de 4 capas, dimension 256 y contexto de 512 tokens, se espera un modelo pequeno que puede ejecutarse con menos de 1 GB de VRAM.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM, o incluso una CPU moderna.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPUs de gama baja y media.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI. Requiere el codigo del repositorio de GitHub y ejecutarse mediante PyTorch estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables con los mismos datos de referencia ni publicaciones de comparativa en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente con datos sinteticos derivados de Synthea, no con datos clinicos reales.
- No validado para uso clinico ni para toma de decisiones medicas.
- El rendimiento varia sustancialmente entre las 40 condiciones objetivo; los resultados raros presentan alta incertidumbre.
- El modelo no debe interpretarse como evidencia de efectos causales en salud.
- Es un modelo personalizado de PyTorch, no cargable con `transformers.AutoModel`, lo que limita su interoperabilidad.
- No se especifica licencia, por lo que el uso comercial es incierto y requiere consulta previa al autor.
- Ausencia de benchmarks publicados frente a otros modelos dificulta la evaluacion comparativa objetiva.

## Enlaces

- Hugging Face: https://huggingface.co/nateraw3/ehr-future-condition-transformer
- Repositorio de GitHub: https://github.com/nateRaw3/ehr-forecasting-transformer.git
