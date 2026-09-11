# Maldak123/TOTVS_Concorrencia_Teste

## Resumen

TOTVS_Concorrencia_Teste es un clasificador de texto en portugues obtenido por fine-tuning de FacebookAI/xlm-roberta-base. Lo publica el usuario Maldak123 en HuggingFace y su tarea declarada es la deteccion de benchmarking con competidores (es decir, identificar en conversaciones comerciales B2B el momento en que un interlocutor menciona o compara con un producto de la competencia). Se trata, por tanto, de un modelo de clasificacion de secuencias de un solo uso, no de un modelo generativo.

El modelo parte de la arquitectura XLM-RoBERTa base, un transformer encoder con 278.045.186 parametros totales segun los pesos en safetensors del repositorio (1,1 GB). El autor indica que el ajuste se hizo sobre un dataset de 3.000 reuniones B2B y que el idioma de trabajo es exclusivamente portugues. La licencia declarada es MIT, lo que permite uso comercial sin restricciones de atribucion mas alla del aviso de copyright.

Su relevancia practica es acotada pero concreta: es un ejemplo de modelo vertical de inteligencia competitiva para el mercado lusofono, un nicho con pocos recursos publicos. Conviene manejarlo con cautela, porque la model card reporta metricas perfectas (Accuracy, Precision, Recall, F1 y ROC-AUC de 1,0000) sobre un unico dataset propietario, sin validacion cruzada ni conjunto de test independiente descrito, y el repositorio no incluye informacion sobre el proceso de anotacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) |
| Parametros totales | 278.045.186 (segun safetensors del repositorio) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (heredada de la configuracion de xlm-roberta-base) |
| Tipos de cuantizacion | no disponible (no se publican configuraciones de cuantizacion) |
| Idiomas soportados | portugues (pt), segun la model card |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa base: un transformer encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion, con un vocabulario SentencePiece de 250.002 tokens. Dado que la capa de embeddings concentra aproximadamente 192 millones de parametros de los 278 millones totales, la mayor parte del peso del modelo corresponde al vocabulario multilingue heredado, no a las capas de codificacion. Sobre esa base se ha anadido una cabeza de clasificacion de secuencia para la tarea binaria de "menciona competencia / no menciona competencia" (o para el numero de etiquetas que defina el autor, dato que la model card no especifica).

El autor indica que el fine-tuning se realizo sobre 3.000 reuniones B2B en portugues. No se detalla el numero de tokens de entrenamiento, la composicion del dataset, el balance de clases, los hiperparametros (learning rate, epochs, batch size), ni si hubo una fase de ajuste adicional. Tampoco se documenta el uso de tecnicas como RLHF o DPO, que en un modelo encoder de clasificacion no serian aplicables. No hay informacion sobre innovaciones tecnicas asociadas.

## Capacidades

- Clasificacion de texto en portugues: introduccion de una secuencia de hasta 512 tokens y devolucion de una o varias etiquetas con puntuacion de probabilidad.
- Deteccion de menciones de competidores y benchmarking comercial en transcripciones o notas de reuniones B2B.
- Procesamiento por lotes mediante la libreria transformers (pipeline de text-classification).
- Capacidad multilingue residual: al derivar de XLM-RoBERTa, el encoder conserva representaciones de otros idiomas, aunque el ajuste se hizo solo en portugues y no hay garantia de comportamiento fuera de ese idioma.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso, vision ni audio.
- No dispone de modo "thinking" ni de decodificacion especulativa.

## Casos de uso

- Analisis de transcripciones de reuniones comerciales: el modelo recibe el texto de la reunion (o fragmentos de 512 tokens) y marca las intervenciones donde aparece una mencion a un competidor, lo que permite generar automaticamente un informe de inteligencia competitiva por cuenta.
- Alertas en tiempo real para equipos de ventas: integrado en un CRM, se puede invocar como servicio HTTP que etiquete cada nota de llamada y dispare una alerta al responsable de cuenta cuando se detecte benchmarking competitivo.
- Enriquecimiento de registros en CRM (Salesforce, HubSpot): clasificacion batch nocturna de notas y correos asociados a oportunidades para poblar un campo booleano de "competidor detectado" que alimente cuadros de mando.
- Analisis de motivos de perdida de oportunidades: analisis masivo de reuniones de deals cerrados como perdidos para cuantificar en que porcentaje aparecio un competidor y en que fase del ciclo de ventas.
- Monitorizacion de calidad del discurso comercial: deteccion de menciones a competencia en las llamadas de un equipo para construir metricas internas y material de formacion.
- Base para un clasificador propio por dominio: dado que es un encoder pequeno (278 M de parametros), sirve como punto de partida para reentrenar con datos propios de otra empresa o sector, con coste de GPU modesto.
- Procesamiento por lotes sobre corpus historicos: clasificar decenas de miles de notas o transcripciones antiguas para estudios retrospectivos, aprovechando que el modelo cabe en memoria de una GPU de consumo.

## Benchmarks y rendimiento

La model card del autor publica unicamente metricas propias sobre su dataset de reuniones B2B. No hay resultados de benchmarks estandar (MMLU, GLUE, HumanEval, GSM8K ni equivalentes), que ademas no son aplicables a un clasificador de secuencias.

| Metrica | Score reportado por el autor |
|---|---|
| Accuracy | 1,0000 |
| Precision | 1,0000 |
| Recall | 1,0000 |
| F1 Score | 1,0000 |
| ROC-AUC | 1,0000 |

Estas cifras corresponden a la evaluacion declarada por el autor en la model card. No se especifica el tamano del conjunto de evaluacion, si es independiente del de entrenamiento ni el metodo de particion. Un valor exacto de 1,0000 en las cinco metricas es un indicador tipico de fuga de datos (data leakage) o de un conjunto de test demasiado pequeno o solapado con el de entrenamiento, por lo que no debe tomarse como una estimacion fiable de rendimiento en produccion.

## Requisitos de hardware

Las siguientes cifras son estimaciones basadas en el numero de parametros (278 M) y no proceden de mediciones publicadas por el autor:

- VRAM estimada en precision completa (FP32): aproximadamente 1,1 GB solo de pesos, mas 0,3-0,8 GB de activaciones y overhead, es decir, del orden de 1,5-2 GB.
- VRAM estimada en FP16/BF16: aproximadamente 0,56 GB de pesos, con un total practico en torno a 1-1,5 GB.
- VRAM estimada en INT8: aproximadamente 0,3 GB de pesos, con un total inferior a 1 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia por lotes de baja frecuencia.
- GPU recomendadas para alto throughput: A100, H100 o L4 con ejecucion por lotes; no se necesita memoria ni computo de gama alta.
- Opciones de despliegue: pipeline de transformers en Python, TorchScript, ONNX Runtime, Hugging Face Inference Endpoints y servidores de inferencia para encoders como el de Text Embeddings Inference. vLLM, llama.cpp, Ollama y TGI estan orientados a modelos generativos y no se documentan como soportados para este repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

Los datos de las alternativas proceden de conocimiento general sobre esos modelos y deben verificarse en sus respectivas model cards; no forman parte de la informacion proporcionada en esta busqueda.

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Maldak123/TOTVS_Concorrencia_Teste | 278 M | 512 | Portugues | MIT | HuggingFace, 0 descargas |
| FacebookAI/xlm-roberta-base (modelo base) | 278 M | 512 | Multilingue (100 idiomas) | MIT | HuggingFace, ampliamente usado |
| neuralmind/bert-base-portuguese-cased (BERTimbau) | aprox. 110 M | 512 | Portugues | MIT (verificar) | HuggingFace |
| microsoft/mdeberta-v3-base | aprox. 278 M | 512 | Multilingue | MIT (verificar) | HuggingFace |

La diferencia relevante no es de rendimiento bruto, sino de especificidad: este modelo es un ajuste vertical no validado externamente, mientras que los tres alternativos son checkpoints base sin tarea definida que requieren fine-tuning propio.

## Limitaciones y advertencias

- Metricas no fiables: los valores perfectos de la model card sugieren fuga de datos o un conjunto de evaluacion no independiente. No debe asumirse un rendimiento cercano al 100 % en produccion.
- Sin validacion externa: el modelo tiene 0 descargas y 0 likes en HuggingFace, y no hay terceros que hayan reproducido los resultados.
- Monolingue: el entrenamiento se limita al portugues. El uso en castellano u otros idiomas no esta documentado ni respaldado.
- Riesgo de alucinacion de etiquetas: como cualquier clasificador, puede etiquetar como menciones competitivas fragmentos que no lo son (coincidencias de nombres de producto, homonimos) y viceversa.
- Sesgo de dominio: entrenado sobre reuniones B2B de un unico contexto corporativo; su comportamiento en otros sectores, registros informales o transcripciones automaticas con errores no esta evaluado.
- Privacidad: si el dataset de 3.000 reuniones contiene datos de clientes reales, no se documenta ningun proceso de anonimizacion, lo que es un riesgo de cumplimiento si se reutiliza el modelo con datos personales.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, pero sin garantia alguna por parte del autor. Se debe conservar el aviso de copyright.
- Anomalia en metadatos: las fechas de creacion y actualizacion del repositorio (2026) no son coherentes con la fecha actual y no se explica el motivo.
- Repositorio minimo: no incluye informacion sobre hiperparametros, particion de datos, esquema de etiquetas ni limitaciones declaradas por el autor.
- Sin soporte de cuantizacion publicado: no hay pesos GGUF ni configuraciones INT4/INT8 listas para usar; cualquier optimizacion debe hacerse por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Maldak123/TOTVS_Concorrencia_Teste
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-RoBERTa (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
- Referencia de la libreria transformers (pipeline de text-classification): https://huggingface.co/docs/transformers/tasks/sequence_classification

No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales asociados a este modelo en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
