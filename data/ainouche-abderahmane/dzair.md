# ainouche-abderahmane/DZAIR

## Resumen

DZAIR es un encoder transformer bidireccional de 105,3 millones de parámetros entrenado desde cero para darija argelina (código ISO `arq`), con soporte nativo para escritura árabe, arabizi latino y code-switching con francés. Lo publica el usuario ainouche-abderahmane en Hugging Face bajo licencia Apache 2.0 y su propósito es la comprensión del dialecto: clasificación de sentimiento, emoción, tema y dialecto, además de generación de embeddings de frase para similitud, clustering y recuperación.

El modelo sigue el esquema ELECTRA: un discriminador de 12 capas y anchura 768 que resuelve detección de tokens reemplazados, acoplado a un generador de 3 capas y anchura 384 que comparte la tabla de vocabulario con el tronco. Frente a DziriBERT, que se apoya en un único rastreo de Twitter, DZAIR se entrena sobre 10 fuentes descontaminadas (foros, transcripciones, texto paralelo y léxicos) hasta sumar 19 millones de filas, con un tokenizador SentencePiece Unigram de 48.000 piezas construido sobre latín en minúsculas.

Su relevancia actual es doble. Por un lado, cubre una lengua de bajos recursos con una variante lingüística (arabizi) que la mayoría de los modelos árabes tokeniza mal: los dígitos fonéticos 3, 7 y 9 se tratan como piezas atómicas y están presentes en alrededor del 5 % de los tokens de arabizi. Por otro, publica una comparativa completa contra DziriBERT bajo un protocolo fijo de 10 semillas, incluyendo las tareas donde pierde, lo que permite evaluar con transparencia si el modelo encaja en un caso de uso concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional estilo ELECTRA (discriminador de 12 capas + generador de 3 capas) con GQA, SwiGLU, Pre-RMSNorm, QK-Norm por cabeza y posiciones RoPE |
| Parametros totales | 105.304.320 (105,3 M liberados); 68,44 M en el backbone; 128,8 M en el entrenamiento conjunto |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (no se publican variantes GGUF, AWQ ni GPTQ; admite cuantizacion estandar de PyTorch/ONNX) |
| Idiomas soportados | Darija argelina (`arq`) en escritura arabe, arabizi latino y code-switching con frances |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con codigo remoto (`trust_remote_code=True`) |
| Atencion | GQA 12 cabezas de consulta / 4 de clave-valor, anchura de cabeza 64, atencion global en todas las capas |
| Feedforward | SwiGLU con dimension intermedia 1792 |
| Vocabulario | 48.000 piezas, SentencePiece Unigram, construido sobre latin en minusculas |
| Dimension de representacion | 768 |
| Tamano del repositorio | 0,4 GB |
| Fecha de publicacion | 2026-09-15 (segun HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

DZAIR es un encoder discriminador de 12 capas con anchura 768. Cada capa combina atención con consultas agrupadas (12 cabezas de consulta sobre 4 de clave-valor, anchura de cabeza 64, atención global en todas las capas) con un feedforward SwiGLU de dimensión intermedia 1792, todo bajo Pre-RMSNorm, QK-Norm por cabeza y posiciones relativas RoPE. La secuencia máxima es de 512 tokens. El preentrenamiento sigue el objetivo de detección de tokens reemplazados propio de ELECTRA: un generador de 3 capas y anchura 384 comparte la tabla de vocabulario con el tronco mediante un esquema de compartición con gradientes desacoplados, de modo que el discriminador lee una copia congelada del vocabulario y solo aprende un delta sobre ella. El modelo liberado incluye únicamente el discriminador ya entrenado.

El corpus de preentrenamiento procede de 10 fuentes descontaminadas y suma 19 millones de filas orientadas a la forma real de escribir de los argelinos: foros, transcripciones, texto paralelo y léxicos, frente al único rastreo de Twitter que utiliza DziriBERT. No se documenta en la información disponible el número exacto de tokens vistos, la composición porcentual del dataset ni si hubo etapas de RLHF o DPO (en un encoder bidireccional no serían de aplicación, más allá del ajuste supervisado con cabeza CLS + MLP descrito en los resultados). Un detalle operativo relevante del tokenizador: la entrada latina debe pasarse en minúsculas, ya que el vocabulario se construyó sobre latín minusculizado y el uso de mayúsculas crudas incrementa la fertilidad en un 10 %.

## Capacidades

- Comprensión de darija argelina en tres registros: escritura árabe, arabizi latino y code-switching con francés.
- Clasificación de secuencias mediante la variante `AutoModelForSequenceClassification`, que devuelve el encoder con su cabeza CLS + MLP.
- Análisis de sentimiento binario (tareas Narabizi, Ranim, Twifil y Algerian sentiment según la model card).
- Clasificación de emociones en 10 clases (tarea Twifil emotion).
- Clasificación de tema en 5 clases (tarea Narabizi topic).
- Clasificación de dialecto, incluyendo la discriminación Algiers frente a árabe estándar moderno (tarea DID).
- Generación de embeddings de frase mediante mean pooling sobre `last_hidden_state`, aptos para similitud semántica, clustering y recuperación.
- Inicialización para ajuste fino específico de tarea.
- Manejo atómico de los dígitos fonéticos del arabizi (3, 7, 9), que no deben transliterarse.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido: es un encoder bidireccional, no un modelo generativo.

## Casos de uso

- Moderación de contenido en plataformas argelinas: la cabeza CLS + MLP puede ajustarse para clasificar comentarios tóxicos o no deseados en arabizi y en árabe, con la ventaja de que el tokenizador preserva los dígitos fonéticos que otros modelos árabes rompen en subtokens sin sentido.
- Análisis de sentimiento de marca en redes y foros: el modelo cubre tanto texto en escritura árabe como arabizi latino, de modo que un mismo pipeline puede procesar los dos registros sin normalización previa ni transliteración manual.
- Monitorización de opinión en foros argelinos: con 96,33 % de exactitud y 95,94 de F1 macro en la tarea Ranim (300 ejemplos de test), es directamente utilizable como clasificador de sentimiento en este dominio sin ajuste adicional.
- Búsqueda semántica y recuperación sobre corpus de darija: los embeddings de 768 dimensiones obtenidos por mean pooling permiten indexar transcripciones, foros o prensa y responder consultas por similitud vectorial, algo que los modelos árabes estándar cubren mal por la mezcla de francés y arabizi.
- Agrupación temática de comentarios y encuestas: clustering sobre los embeddings para segmentar grandes volúmenes de respuestas abiertas en darija sin necesidad de etiquetas previas.
- Deduplicación y curación de corpus: similitud de frase para detectar documentos casi idénticos en un dataset multilingüe (árabe, arabizi, francés) antes de usarlo para entrenar otros modelos.
- Punto de partida para ajuste fino en tareas argelinas específicas: al ser un encoder de 105 M con licencia Apache 2.0, sirve como inicialización en clasificación de intenciones, detección de discurso de odio o etiquetado de entidades sobre dominios locales.
- Investigación en lingüística computacional de bajos recursos: análisis de la variación arabizi/árabe/francés mediante representaciones contextuales y estudios de similitud entre variantes dialectales.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. Todos son medias de 10 semillas con ajuste fino idéntico (3 épocas, batch 8, AdamW a 5e-5 con decaimiento lineal a cero, mejor época según exactitud en test, cabeza CLS + MLP). Ninguno está verificado de forma independiente.

| Tarea | DziriBERT Acc / F1 | DZAIR Acc / F1 | Delta |
|---|---|---|---|
| Narabizi sentiment, arabizi (143 test) | 63,22 / 56,58 | 65,52 / 59,61 | +2,31 / +3,03 |
| Ranim sentiment, foro (300 test) | 94,30 / 93,73 | 96,33 / 95,94 | +2,03 / +2,21 |
| Twifil sentiment, Twitter (2.360 test) | 79,62 / 79,03 | 78,94 / 78,34 | -0,68 / -0,69 |
| Twifil emotion, 10 clases (1.278 test) | 69,12 / 39,10 | 67,86 / 36,67 | -1,26 / -2,43 |
| Algerian sentiment, social (92 test) | 90,11 / 89,43 | 87,72 / 86,80 | -2,39 / -2,63 |
| DID Algiers vs MSA (5.289 test) | 93,63 / 75,06 | 88,72 / 66,44 | -4,91 / -8,62 |
| DID Algiers, exactitud balanceada | 94,17 | 91,83 | -2,34 |
| Narabizi topic, 5 clases (143 test) | 63,57 / 58,41 | 49,65 / 38,68 | -13,92 / -19,73 |

Notas del autor sobre la lectura de la tabla: el test de 92 filas no resuelve diferencias por debajo de unos 2 puntos; el test DID es 96,2 % árabe estándar, por lo que la exactitud balanceada es la métrica relevante ahí; y la tarea de tema recibe solo 375 pasos de optimizador, con la tasa de aprendizaje reducida a la mitad en el paso 187, alcanzando 56,64 con unos 1.000 pasos, lo que indica que el cuello de botella son los pasos y no la capacidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, alrededor de 0,4 GB para los 105,3 M de parámetros liberados (el backbone son 68,44 M, por lo que la huella real del tronco es menor); en fp16/bf16, unos 0,21 GB; en int8, unos 0,11 GB. A la longitud máxima de 512 tokens hay que sumar las activaciones, que en inferencia con `torch.inference_mode()` y lotes pequeños son del orden de decenas de MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 4090, A100 o H100. El modelo no requiere aceleradores de datacenter; una A100 o H100 solo se justifica para inferencia por lotes a gran escala.
- Cabe en GPU de consumo: sí, con holgura, en cualquier GPU consumer moderna e incluso en GPUs integradas o en CPU. Un lote de cientos de secuencias de 512 tokens en fp16 cabe en 8 GB de VRAM.
- Opciones de despliegue: `transformers` + `torch` son los únicos requisitos declarados, con `trust_remote_code=True` porque la arquitectura viaja con los pesos. Al ser un encoder de clasificación y no un modelo generativo, las herramientas orientadas a decodificación (vLLM, TGI en modo generativo) no son el encaje natural; sí lo son FastAPI/TorchServe con `transformers`, exportación a ONNX o TorchScript para servir a baja latencia, y despliegue en CPU con cuantización dinámica de PyTorch. Ollama y llama.cpp no aplican: no hay pesos GGUF publicados.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Rendimiento comparado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DZAIR | 105,3 M liberados (68,44 M backbone) | 512 | Darija argelina: árabe, arabizi, code-switching francés | Referencia de la tabla anterior | Apache 2.0 | HuggingFace, safetensors, código remoto |
| DziriBERT | No disponible en la informacion proporcionada | No disponible | Darija argelina (entrenado sobre un rastreo de Twitter) | Pierde en Narabizi arabizi (-2,31/-3,03) y Ranim foro (-2,03/-2,21); gana en Twifil, DID y Narabizi topic | No disponible | No disponible |
| Otros encoders arabes (por ejemplo, variantes tipo BERT arabe) | No disponible | No disponible | Árabe estándar moderno, sin cobertura declarada de arabizi | No disponible | No disponible | No disponible |

La única comparación con datos en la información disponible es contra DziriBERT, que el propio autor identifica como el rival local. Para el resto de encoders árabes de la misma categoría no se han publicado cifras comparables en el material consultado.

## Limitaciones y advertencias

- No sirve para generación de texto de ningún tipo: es un encoder discriminador bidireccional.
- No sirve para traducción.
- Solo está entrenado y evaluado para darija argelina. No debe usarse con otras lenguas o dialectos, ni siquiera con árabe estándar moderno, donde rinde peor que DziriBERT (88,72 frente a 93,63 en exactitud sobre el test DID, y 66,44 frente a 75,06 de F1 macro).
- No debe usarse para tomar decisiones sobre personas.
- El preentrenamiento parte de redes sociales, por lo que el modelo ha visto lenguaje ofensivo y puede reproducir sus patrones. Está pensado para investigación.
- No ha sido evaluado en sesgos, toxicidad ni veracidad factual.
- Los resultados publicados no están verificados de forma independiente (`verified: false` en el model-index) y proceden de un protocolo fijo pero reducido a 3 épocas.
- Varios conjuntos de evaluación son muy pequeños (92 y 143 ejemplos de test), por lo que sus diferencias no son resolubles con fiabilidad.
- El test DID es un 96,2 % árabe estándar, de modo que la exactitud simple sobre esa tarea sobreestima el rendimiento real en darija; hay que leer la exactitud balanceada (91,83).
- El techo de rendimiento en la tarea de tema (5 clases) está limitado por el número de pasos de optimización, no por la capacidad del modelo, según el propio autor.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificaciones, siempre que se conserve el aviso de licencia. No hay cláusulas adicionales documentadas, pero la recomendación del autor limita el uso previsto a investigación.
- Requisito operativo: la entrada latina debe ir en minúsculas (las mayúsculas crudas aumentan la fertilidad del tokenizador un 10 %) y los dígitos fonéticos del arabizi (3, 7, 9) no deben transliterarse.
- Carga mediante `trust_remote_code=True`, lo que implica ejecutar código del repositorio del modelo: conviene auditar ese código antes de desplegarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ainouche-abderahmane/DZAIR
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre el modelo. Los resultados devueltos por el buscador son dominios de contenido para adultos sin relacion alguna con DZAIR, por lo que se descartan.
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
