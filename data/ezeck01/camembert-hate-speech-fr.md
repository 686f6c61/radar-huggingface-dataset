# Ezeck01/camembert-hate-speech-fr

## Resumen

camembert-hate-speech-fr es un clasificador binario de discurso de odio en francés desarrollado por Ezeckiel Sawadogo (Ezeck01), estudiante de M2 en Langue & Informatique en la Sorbonne Université. Se trata de un fine-tuning de almanach/camembert-base, un transformer encoder de tipo RoBERTa adaptado al francés con 110.623.490 parámetros, sobre el dataset Poulpidot/FrenchHateSpeechSuperset. El modelo distingue entre dos clases, "non haineux" y "haineux", y devuelve una probabilidad que se compara con un umbral de decisión de 0,23 almacenado en el propio `config.json`.

Su relevancia no está en el tamaño ni en capacidades generativas, sino en el rigor metodológico del proceso: el autor auditó el dataset antes de entrenar y detectó que, de 42.660 líneas, solo había 7.499 textos distintos, con más del 80 % de duplicados. Sin deduplicar, las mismas frases aparecen en entrenamiento y test, lo que infla artificialmente las métricas. Tras la deduplicación, el reparto queda en 5.249 ejemplos de entrenamiento, 1.125 de validación y 1.125 de test, con clases prácticamente equilibradas (50,7 % / 49,3 %).

El modelo se publica con licencia MIT, en formato safetensors, y está pensado explícitamente como ayuda a la moderación de contenidos con revisión humana posterior, no como decisión automática. El repositorio no registra descargas ni "likes" en el momento de la consulta y fue creado el 24 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (CamemBERT, basado en la arquitectura RoBERTa) |
| Parametros totales | 110.623.490 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la ficha del autor (el entrenamiento se realizó con longitud máxima de 128 tokens) |
| Tipos de cuantizacion | no se publican variantes cuantizadas; pesos safetensors (fp32 por defecto), entrenamiento realizado en fp16 |
| Idiomas soportados | francés (fr) únicamente |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |
| Tarea | text-classification (clasificación binaria) |
| Etiquetas | non haineux (0) / haineux (1) |
| Umbral de decisión | 0,23, almacenado en `config.json` como `seuil_decision` |
| Modelo base | almanach/camembert-base |
| Dataset de entrenamiento | Poulpidot/FrenchHateSpeechSuperset (deduplicado) |
| Tamaño del repositorio | 0,4 GB |
| Compatibilidad de despliegue | text-embeddings-inference, endpoints compatibles |

## Arquitectura y entrenamiento

La arquitectura es la de CamemBERT, un transformer encoder con atención completa que sigue el diseño de RoBERTa, preentrenado sobre corpus en francés. Sobre ese checkpoint base se aplicó una cabeza de clasificación de secuencias para dos clases. El fine-tuning se realizó durante 3 épocas con learning rate 2e-5, batch de 32, longitud máxima de 128 tokens y precisión fp16 sobre una GPU T4, con un coste aproximado de 2 minutos. La función de pérdida fue entropía cruzada ponderada por el inverso de la frecuencia de clase, y el mejor checkpoint se seleccionó según el F1 de la clase "haineux" en validación.

La innovación destacable no es arquitectónica sino de tratamiento de datos y calibración. El autor detectó que el dataset original contiene 42.660 filas pero solo 7.499 textos distintos, con más del 80 % de duplicados, y aplicó deduplicación y un reparto estratificado antes de entrenar. Además, ajustó el umbral de decisión sobre el conjunto de validación: bajar de 0,5 a 0,23 eleva el F1 de la clase "haineux" de 0,818 a 0,842 en validación. El razonamiento es asimétrico en coste: en moderación, dejar pasar un mensaje de odio es más grave que una falsa alarma, por lo que el umbral bajo prioriza el recall. El test se usó una única vez para reportar las cifras finales.

## Capacidades

- Clasificación binaria de texto en francés: devuelve una probabilidad para la clase "haineux" que se compara con el umbral de 0,23.
- Detección de discurso de odio con vocabulario explícito, que es el patrón dominante en el corpus de entrenamiento.
- Integración directa con la librería transformers mediante `AutoTokenizer` y `AutoModelForSequenceClassification`.
- Lectura del umbral desde `model.config.seuil_decision`, lo que permite ajustar la sensibilidad sin reentrenar.
- Compatible con Text Embeddings Inference y con endpoints de inferencia alojados.
- No dispone de generación de texto, tool calling, capacidades de agente, razonamiento multi-paso, visión ni audio: es exclusivamente un clasificador.
- Sin capacidades multilingües: el modelo está entrenado y evaluado solo en francés.

## Casos de uso

- Moderación de comentarios en foros y redes sociales en francés: el modelo puntúa cada mensaje y los que superan 0,23 se envían a una cola de revisión humana, reduciendo el volumen que llega a los moderadores.
- Filtrado previo en plataformas de noticias con sección de comentarios: se puede ejecutar en lote sobre los comentarios nuevos y aplicar ocultación automática solo por encima de un umbral alto de confianza, dejando la franja intermedia a revisión.
- Monitorización de comunidades de videojuegos o streaming: el registro es mayoritariamente informal y en línea, que es precisamente el dominio del corpus de entrenamiento.
- Triaje en sistemas de denuncias de usuarios: cuando un usuario reporta un mensaje, el clasificador aporta una señal objetiva para priorizar la cola de casos.
- Investigación en ciencias sociales y lingüística computacional: permite etiquetar grandes corpus franceses de redes sociales para estudios cuantitativos sobre toxicidad, siempre con validación manual de una muestra.
- Preprocesado de datasets para entrenar modelos generativos con filtrado de toxicidad: se descartan o marcan los ejemplos con probabilidad alta antes de usarlos en otras fases.
- Construcción de dashboards de salud de comunidad: agregar la tasa de mensajes marcados por canal o por franja horaria para detectar picos de conflicto.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de test deduplicado de 1.125 mensajes nunca vistos, con umbral de decisión 0,23:

| Métrica | Valor |
|---|---|
| F1 (clase haineux) | 0,834 |
| Precisión (clase haineux) | 0,791 |
| Recall (clase haineux) | 0,881 |
| F1 macro | 0,826 |
| Precisión macro | 0,831 |
| Recall macro | 0,827 |
| PR-AUC | 0,901 |
| ROC-AUC | 0,912 |

Desglose por clase:

| Clase | Precisión | Recall | F1 |
|---|---|---|---|
| non haineux | 0,870 | 0,774 | 0,819 |
| haineux | 0,791 | 0,881 | 0,834 |
| macro | 0,831 | 0,827 | 0,826 |

Matriz de confusión en test: 441 verdaderos negativos, 129 falsos positivos, 66 falsos negativos y 489 verdaderos positivos. En validación, el umbral 0,23 elevó el F1 de la clase "haineux" de 0,818 (umbral implícito 0,5) a 0,842. Estos valores no están verificados de forma independiente (`verified: false` en el model-index).

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,5 GB en fp32 para los 110,6 millones de parámetros, más el overhead del runtime; aproximadamente 0,25 GB si se convierte a fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor entrenó en una NVIDIA T4. Modelos como A100 o H100 están sobredimensionados para este caso.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con soporte CUDA.
- Ejecución viable en CPU para volúmenes moderados, dado el tamaño reducido del modelo (repositorio de 0,4 GB).
- Opciones de despliegue: transformers en Python, Text Embeddings Inference (etiquetado como compatible en el repositorio) y endpoints de inferencia alojados. No se publican artefactos GGUF, ONNX ni Ollama.
- Latencia y throughput: no disponible en la información proporcionada. Como referencia del coste de cómputo, el fine-tuning completo de 3 épocas sobre 5.249 ejemplos con longitud máxima 128 tardó aproximadamente 2 minutos en una T4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Métricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ezeck01/camembert-hate-speech-fr | 110,6 M | no disponible (entrenado a 128 tokens) | F1 haineux 0,834; F1 macro 0,826; ROC-AUC 0,912 | MIT | HuggingFace, safetensors |
| julio2027/French_hate_speech_CamemBERT_v2 | no disponible | no disponible | no disponible | no disponible | HuggingFace, PyTorch |
| julio2027/French_hate_speech_CamemBERT_v3 | no disponible | no disponible | no disponible | no disponible | HuggingFace, safetensors (445 MB) |
| almanach/camembert-base | ~110 M | no disponible | no disponible (modelo base, no clasificador) | no disponible | HuggingFace |

La comparación con las alternativas de julio2027 es limitada porque sus fichas no publican métricas, licencia ni detalles de entrenamiento en la información recuperada. camembert-base no es un comparador directo, ya que es un modelo de representación sin cabeza de clasificación de odio.

## Limitaciones y advertencias

- Amenazas implícitas no detectadas: el propio autor documenta que "Je vais te retrouver et tu vas le regretter" se clasifica como no haineux con probabilidad 0,07. El modelo se apoya sobre todo en vocabulario explícito.
- Etiquetas ruidosas: el dataset mezcla varias fuentes y contiene anotaciones discutibles, como "c'est dégeulasse" etiquetado como haineux. Ese ruido acota el techo de rendimiento.
- Corpus reducido: tras deduplicar quedan 7.499 textos distintos, un volumen modesto para un clasificador de toxicidad.
- Dominio y registro limitados: francés únicamente, con registro predominantemente informal de internet. El rendimiento fuera de ese dominio no está caracterizado.
- Umbral no estándar: el valor 0,23 se guarda en la clave `seuil_decision` de `config.json`, que no forma parte del esquema habitual de transformers. Un uso con `pipeline()` o con la lógica por defecto de 0,5 cambiará el comportamiento y disparará los falsos negativos.
- Sesgo hacia el recall: con el umbral bajo, la precisión de la clase haineux es 0,791, es decir, aproximadamente uno de cada cinco mensajes marcados es un falso positivo. Esto puede afectar de forma desproporcionada a determinados registros lingüísticos, variantes dialectales o jergas.
- Uso previsto: el autor indica explícitamente que debe emplearse como ayuda a la moderación con relectura humana, nunca como decisión automática.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea con alta confianza, especialmente con sarcasmo, citas, discurso reportado o reapropiación de términos por parte de comunidades afectadas.
- Licencia MIT: permite uso comercial, modificación y redistribución, sin garantías por parte del autor.
- Métricas no verificadas: los resultados del model-index están marcados como `verified: false` y provienen únicamente del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ezeck01/camembert-hate-speech-fr
- Dataset de entrenamiento: https://huggingface.co/datasets/Poulpidot/FrenchHateSpeechSuperset
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Ezeck01/detecteur-discours-haineux
- Repositorio GitHub del proyecto: https://github.com/sawadogoezechiel09-alt/French_hate_speech
- Sitio del autor: https://ezechiel-sawadogo-nlp.github.io
- GitHub del autor: https://github.com/ezechiel-sawadogo-nlp
- Modelo base: https://huggingface.co/almanach/camembert-base
- Alternativa comparable: https://huggingface.co/julio2027/French_hate_speech_CamemBERT_v2
- Alternativa comparable: https://huggingface.co/julio2027/French_hate_speech_CamemBERT_v3
- Paper de CamemBERT: https://arxiv.org/pdf/1911.03894v2
- Ejemplos de CamemBERT en fairseq: https://github.com/facebookresearch/fairseq/blob/main/examples/camembert/README.md
