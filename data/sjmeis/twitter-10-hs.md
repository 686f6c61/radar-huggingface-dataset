# sjmeis/twitter-10-hs

## Resumen

El modelo `sjmeis/twitter-10-hs` es un fine-tuning de `google-bert/bert-base-cased` sobre el dataset `twitter-10`, presentado en el artículo de WOAH 2026 titulado *Introducing the Privacy-HSD Trade-off: Hate Speech Detection, but not at the Cost of Privacy*. Desarrollado por Stephen Meisenbacher (sjmeis), el modelo aborda la detección de discurso de odio en Twitter/X con un enfoque que considera explícitamente el equilibrio entre privacidad y rendimiento. Con 108,3 millones de parámetros y una arquitectura BERT estándar, es un modelo compacto y ligero, adecuado para tareas de clasificación de texto en inglés.

Su relevancia radica en que plantea una alternativa a los sistemas de moderación que dependen de grandes volúmenes de datos personales, proponiendo un trade-off entre la precisión en la detección de odio y la protección de la privacidad de los usuarios. El modelo está publicado con licencia MIT, lo que facilita su uso comercial y académico, y está disponible en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) |
| Parametros totales | 108.311.810 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (heredado de BERT-base) |
| Tipos de cuantizacion | no disponible (pesos originales en FP32/FP16; no se documentan cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-cased`, un transformer encoder de 12 capas con 768 dimensiones ocultas y 12 cabezas de atencion. El fine-tuning se realizo sobre el dataset `twitter-10`, que contiene tweets etiquetados para la deteccion de discurso de odio. La contribucion principal del trabajo, segun la model card, es el analisis del trade-off entre privacidad y rendimiento en la deteccion de odio, aunque no se especifican los detalles del proceso de entrenamiento (numero de epocas, tasa de aprendizaje, tecnicas de regularizacion o si se empleo alguna estrategia de anonimizacion de datos). No se menciona el uso de RLHF ni DPO; se trata de un fine-tuning supervisado clasico sobre un corpus de tweets.

Al ser un modelo BERT, su arquitectura es puramente encoder, optimizada para tareas de clasificacion y extraccion de caracteristicas, no para generacion de texto. La ventana de contexto de 512 tokens limita su uso a textos cortos, como los tweets, que es el dominio para el que fue disenado.

## Capacidades

- Clasificacion de texto binaria o multiclase para deteccion de discurso de odio en ingles.
- Analisis de sentimiento y toxicidad en textos cortos (hasta 512 tokens).
- Extraccion de embeddings contextuales de alta calidad para representacion de textos.
- Fine-tuning adicional sobre otros datasets de clasificacion gracias a su tamano reducido.
- Inferencia rapida en CPU y GPU debido a su arquitectura compacta.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso; es un modelo exclusivamente discriminativo.

## Casos de uso

- Moderacion de contenido en redes sociales: el modelo puede clasificar tweets o comentarios como odiosos o no odiosos, integrandose en pipelines de moderacion automatica. Su tamano reducido permite desplegarlo en servicios con restricciones de latencia.
- Analisis de opinion publica: investigadores pueden aplicarlo a grandes volumenes de tweets para medir la prevalencia de discurso de odio en distintas comunidades o periodos temporales.
- Filtrado de contenido en plataformas de comentarios: util para foros, blogs o secciones de noticias donde se necesita un primer filtro de toxicidad.
- Investigacion academica en NLP: sirve como baseline para estudios sobre deteccion de odio, especialmente en contextos donde la privacidad es una preocupacion (el dataset `twitter-10` incorpora esa perspectiva).
- Desarrollo de herramientas de denuncia asistida: puede pre-clasificar mensajes reportados por usuarios para priorizar la revision humana.
- Evaluacion de politicas de moderacion: comparar la efectividad de distintos umbrales de deteccion de odio en corpus historicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como F1, precision o recall sobre conjuntos de prueba estandar (p. ej., HateXplain, OLID). Tampoco se proporcionan comparaciones con otros modelos de deteccion de odio. Se recomienda consultar el paper de WOAH 2026 para obtener datos de evaluacion si estan disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP16 (el modelo pesa ~433 MB en FP32). Con cuantizacion INT8, podria bajar a ~220 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060). Tambien funciona en CPU sin problemas para inferencia por lotes pequenos.
- Cabe en GPUs de consumo: si, en practicamente todas las GPUs modernas, incluso en Raspberry Pi con cuantizacion extrema.
- Opciones de despliegue: Hugging Face Transformers (PyTorch/TensorFlow), ONNX Runtime, TensorRT, o servidores de inferencia como vLLM (aunque para un modelo tan pequeno, una API simple con FastAPI es suficiente).
- Latencia estimada: en CPU moderna, ~10-20 ms por muestra; en GPU, ~1-5 ms por muestra (dependiendo del batch).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| `sjmeis/twitter-10-hs` | 108 M | 512 | BERT fine-tuned para odio en tweets | MIT |
| `hate-speech-CNERG/dehatebert-mono-english` | 124 M | 512 | BERT fine-tuned para odio en ingles | MIT |
| `Hate-speech-CNERG/bert-base-uncased-hatexplain` | 124 M | 512 | BERT fine-tuned sobre HateXplain | MIT |

No se dispone de datos de rendimiento comparativo publicados para estos modelos en la informacion recopilada. Los tres comparten arquitectura BERT-base y tamano similar, pero se diferencian en el dataset de entrenamiento y en el enfoque de privacidad del modelo de sjmeis.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre tweets en ingles, el modelo puede reflejar sesgos presentes en ese corpus (sesgos de genero, raza o dialecto). No se ha documentado una evaluacion de sesgos.
- Alucinacion: al ser un modelo discriminativo, no genera texto, por lo que el riesgo de alucinacion es nulo; el riesgo principal es la clasificacion erronea (falsos positivos o negativos).
- Contexto limitado: 512 tokens, insuficiente para documentos largos o conversaciones extensas.
- Idioma: solo ingles; no funciona con otros idiomas.
- Datos de entrenamiento: no se especifica la composicion del dataset `twitter-10` (tamano, equilibrio de clases, fecha de recoleccion). Esto limita la reproducibilidad y la confianza en su generalizacion.
- Licencia: MIT permite uso comercial sin restricciones, pero el modelo hereda las limitaciones de BERT-base (que es Apache 2.0, compatible).
- Produccion: al ser un modelo pequeno, puede tener menor rendimiento que modelos mas grandes en dominios fuera de tweets. Se recomienda evaluar en el dominio objetivo antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sjmeis/twitter-10-hs
- Perfil del autor: https://huggingface.co/sjmeis
- Datasets del autor: https://huggingface.co/sjmeis/datasets
- Paper de referencia (mencionado en la model card): *Introducing the Privacy-HSD Trade-off: Hate Speech Detection, but not at the Cost of Privacy* (WOAH 2026) - no se ha localizado el enlace directo en la busqueda web.
