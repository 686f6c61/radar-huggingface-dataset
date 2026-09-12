# NAMAA-Space/araseg-e12-xlmr-nopnx-np-w2

## Resumen

`NAMAA-Space/araseg-e12-xlmr-nopnx-np-w2` es un modelo de segmentacion de texto arabe (text segmentation) formulado como clasificacion de tokens, desarrollado por NAMAA Community para la tarea compartida Arabic Segmentation Shared Task 2026 (AraSeg, ArabicNLP 2026). No es un segmentador autonomo: se trata de un miembro votante dentro de un ensemble de 7 componentes, integrado en un decodificador estructural MEMM ajustado con predicciones out-of-fold (OOF). Su variante concreta es la de peso de clase 2 (`class-weight-2`).

El modelo parte de `FacebookAI/xlm-roberta-large` y se ha afinado por completo (full fine-tune) sobre 560M (segun la model card), con licencia MIT heredada del modelo base. El sistema completo del que forma parte alcanza 86,49 de macro-F1 en el practice test y 87,0 de macro-F1 en el conjunto ciego (blind) del shared task, con un umbral de sistema de 0,34. Estas cifras corresponden al ensemble, no a este miembro aislado, y el propio autor advierte que usado en solitario no reproduce ninguna puntuacion publicada.

Su relevancia es fundamentalmente de investigacion y reproducibilidad: documenta una arquitectura de ensemble poco habitual (decodificador MEMM estructural sobre votantes neuronales) aplicada a la segmentacion morfologica del arabe, un problema con impacto directo en tokenizacion, analisis morfologico y preprocesado de corpus arabes. La distribucion de pesos en formato `state_dict` crudo, en lugar de un checkpoint compatible con HuggingFace, condiciona por completo su uso practico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) con cabeza de clasificacion de tokens para etiquetado de fronteras (token-classification) |
| Parametros totales | No especificado de forma explicita; la model card indica "560M" en la fila de entrenamiento y el modelo base `xlm-roberta-large` tiene aproximadamente 560M de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base `xlm-roberta-large` admite 512 tokens |
| Tipos de cuantizacion | No disponible (el repositorio distribuye un `state_dict` de PyTorch, no checkpoints cuantizados) |
| Idiomas soportados | Arabe (`ar`) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | PyTorch `state_dict` (`best_NoPnx_NP.pt`); no es un checkpoint en formato HuggingFace |
| Subtarea | NoPnx-NP (AraSeg 2026) |
| Rol en el sistema | Miembro votante de un decodificador MEMM estructural ajustado con OOF sobre 7 miembros |
| Umbral del sistema | 0,34 |
| Tamano del repositorio | 2,2 GB |
| Tipo de ajuste | Full fine-tune (los cinco miembros LoRA del ensemble, distintos de este, requieren `transformers==5.12.1`) |

## Arquitectura y entrenamiento

La arquitectura es la de `FacebookAI/xlm-roberta-large`: un encoder Transformer con normalizacion previa, aproximadamente 560M de parametros y un vocabulario SentencePiece de gran tamano, al que se anade una cabeza de clasificacion por token para predecir fronteras de segmentacion a nivel de palabra. La model card no detalla el numero de capas, dimensiones ocultas ni el mecanismo exacto de la cabeza, por lo que esos datos no estan disponibles en la informacion proporcionada. El entrenamiento consistio en un ajuste completo (full fine-tune) sobre 560M, con una variante de ponderacion de clases de valor 2 (`class-weight-2`), presumiblemente para compensar el desbalance entre etiquetas de frontera y no frontera.

La innovacion tecnica no reside en este miembro concreto, sino en el sistema que lo engloba: un decodificador estructural MEMM (Maximum Entropy Markov Model) ajustado con predicciones out-of-fold sobre 7 miembros del ensemble, con pesos de combinacion y umbrales calibrados a nivel de sistema. Este miembro produce probabilidades de frontera por palabra no calibradas, que el combinador transforma en la decision final. El ensemble combina miembros de ajuste completo y miembros LoRA. La model card no especifica la composicion exacta del dataset de entrenamiento, el numero de tokens de texto (la cifra "560M" aparece en la fila de entrenamiento y podria referirse a tokens en lugar de parametros), ni si hubo fases de RLHF o DPO, algo en todo caso poco frecuente en tareas de etiquetado.

## Capacidades

- Etiquetado de fronteras de segmentacion en texto arabe (token-classification binaria o multiclase por token o palabra).
- Produccion de probabilidades de frontera por palabra, en crudo y sin calibrar.
- Participacion como votante en un ensemble heterogeneo con decodificador MEMM estructural.
- Procesamiento de texto arabe en la variante cubierta por el corpus del shared task AraSeg 2026.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No tiene soporte de tool calling, function calling ni comportamiento agentico.
- No dispone de modo "thinking" ni de salida en formato conversacional.
- Capacidad multilingue limitada al arabe en la practica, pese a que el modelo base XLM-RoBERTa es multilingue.

## Casos de uso

- Reproduccion de resultados del shared task: cargar el `state_dict` junto con la configuracion del experimento y las predicciones de los otros 6 miembros para reconstruir el sistema completo y verificar la macro-F1 reportada (86,49 en practice test, 87,0 en blind).
- Investigacion en ensembles neuronales y decodificadores estructurados: sirve como material de estudio para comparar un decodificador MEMM ajustado con OOF frente a tecnicas de votacion mayoritaria o stacking convencional.
- Preprocesado de corpus arabes para PLN: si se integra en el sistema completo, puede emplearse para insertar fronteras morfologicas antes de un analizador morfologico o de un tokenizador especifico del arabe.
- Construccion de datasets anotados de segmentacion: las probabilidades por palabra del ensemble pueden usarse para priorizar candidatos en un flujo de anotacion asistida con revision humana.
- Analisis contrastivo de variantes de entrenamiento: al existir variantes con distinto peso de clase dentro de la misma familia, permite estudiar el efecto de la ponderacion de clases en tareas de etiquetado desbalanceado.
- Evaluacion de robustez de XLM-RoBERTa-large en arabe: como punto de partida para experimentos controlados sobre fine-tuning completo frente a LoRA en una tarea de segmentacion.
- No es adecuado como componente de produccion autonomo: requiere el ensemble, los pesos del combinador y el umbral 0,34 para ofrecer resultados utilizables.

## Benchmarks y rendimiento

La model card solo reporta las puntuaciones del sistema completo, no de este miembro de forma aislada. No se han publicado resultados de benchmarks por miembro en la informacion disponible.

| Evaluacion | Puntuacion | Ambito |
|---|---|---|
| Practice test | 86,49 macro-F1 | Sistema completo (ensemble NoPnx-NP) |
| Blind (conjunto ciego) | 87,0 macro-F1 | Sistema completo (ensemble NoPnx-NP) |
| Miembro individual `e12` | No disponible | Este checkpoint de forma aislada |
| Umbral del sistema | 0,34 | Combinador |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales, y no serian aplicables a un modelo de etiquetado de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,2 GB y corresponde a un modelo de aproximadamente 560M de parametros, por lo que la inferencia en fp32 requiere del orden de 2,5 a 3 GB de VRAM, y en fp16 alrededor de 1,2 a 1,5 GB. Son estimaciones derivadas del tamano del checkpoint, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32 o 2 GB para fp16. Una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes; el modelo no requiere aceleradores de gama alta.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en practicamente cualquier GPU de consumo moderna e incluso podria ejecutarse en CPU con latencias aceptables para lotes pequenos.
- Opciones de despliegue: vLLM, TGI y Ollama no son aplicables directamente, ya que el repositorio no contiene un checkpoint en formato HuggingFace. El despliegue requiere construir la arquitectura desde el YAML de configuracion del experimento, cargar el `state_dict` con `torch.load` y ejecutar inferencia con PyTorch. Los cinco miembros LoRA del ensemble necesitan `transformers==5.12.1`; el stack completo esta fijado en `requirements-llm.txt` del repositorio de codigo.
- Latencia y throughput: no disponibles. Al tratarse de un encoder de 560M sobre secuencias de hasta 512 tokens, se espera un throughput alto en GPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas verificables.

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Ambito |
|---|---|---|---|---|---|
| `araseg-e12-xlmr-nopnx-np-w2` | ~560M (heredados de XLM-R large) | No disponible (base: 512) | MIT | PyTorch `state_dict` | Miembro de ensemble NoPnx-NP |
| `FacebookAI/xlm-roberta-large` (modelo base) | ~560M | 512 tokens | MIT | safetensors / PyTorch | Encoder multilingue generico |
| Otros miembros del ensemble AraSeg 2026 | No disponible | No disponible | No disponible | No disponible | Votantes del mismo sistema |
| Modelos alternativos de segmentacion arabe | No disponible | No disponible | No disponible | No disponible | No disponible |

Los resultados del sistema completo (86,49 / 87,0 macro-F1) no son comparables directamente con los de este miembro ni con los de la literatura general, dado que corresponden al shared task AraSeg 2026 y a su particion concreta.

## Limitaciones y advertencias

- No es un segmentador autonomo: la propia model card indica que usado en solitario no reproduce ninguna puntuacion publicada. Requiere el combinador, los pesos y el umbral 0,34 del sistema completo.
- `from_pretrained` no funciona: los pesos son un `state_dict` desnudo de PyTorch y la arquitectura debe reconstruirse a partir del YAML de configuracion del experimento y del modelo base.
- Las probabilidades de frontera por palabra no estan calibradas, por lo que no deben interpretarse como confianzas directamente utilizables en umbrales propios.
- Sesgos conocidos: no se documentan sesgos especificos, pero al entrenarse sobre el corpus del shared task hereda sus sesgos de dominio, genero textual y variedad dialectal del arabe representada.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto libre; el riesgo equivalente es la sobre-segmentacion o infra-segmentacion en dominios alejados del corpus de entrenamiento.
- Limitaciones de contexto e idioma: la model card no especifica la ventana de contexto efectiva ni el vocabulario cubierto; el idioma declarado es unicamente el arabe, pese al origen multilingue del modelo base.
- Restricciones de licencia: MIT, heredada del modelo base, lo que permite uso comercial. Conviene verificar que la licencia del modelo base y las condiciones del shared task sean compatibles con el uso previsto.
- Caveat de produccion: la ausencia de un checkpoint en formato estandar implica trabajo de ingenieria adicional (construccion de arquitectura, gestion de la version de `transformers`, integracion con el combinador) antes de poder desplegarlo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de encontrar soporte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NAMAA-Space/araseg-e12-xlmr-nopnx-np-w2
- Coleccion AraSeg 2026 de NAMAA: https://huggingface.co/collections/NAMAA-Space/namaa-community-araseg-2026
- Repositorio de codigo, configuraciones y mapa miembro-subtarea: https://github.com/NAMAA-ORG/NAMAA-Community-AraSeg-2026
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
