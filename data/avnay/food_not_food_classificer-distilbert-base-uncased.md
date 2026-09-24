# Avnay/Food_not_food_classificer-distilbert-base-uncased

## Resumen

Food_not_food_classificer-distilbert-base-uncased es un clasificador de texto binario publicado por el usuario Avnay en Hugging Face. Se trata de un ajuste fino de distilbert-base-uncased, un transformer encoder de 6 capas y 66.955.010 parametros que DistilBERT obtiene por destilacion de BERT-base. La tarea declarada por el propio nombre del repositorio es distinguir entre textos que hablan de comida y textos que no, con una cabeza de clasificacion de dos clases. El modelo tiene licencia Apache 2.0, se distribuye en safetensors y se carga con la libreria transformers.

Su interes practico es el de un clasificador muy ligero y barato de desplegar: con 66 millones de parametros y una ventana de 512 tokens cabe en CPU y en cualquier GPU de consumo, con latencias de milisegundos. Es un perfil adecuado para prefiltrar o etiquetar grandes volumenes de texto corto sin recurrir a un modelo generativo.

Ahora bien, la informacion publicada es minima. El autor no documenta el conjunto de datos ni los idiomas, la model card se genera automaticamente y deja varios apartados como "More information needed", y no hay resultados en benchmarks estandar (el model-index esta vacio). Las unicas metricas son de validacion interna (loss 0,0019 y accuracy 1,0) sobre un conjunto no identificado. Con 21 descargas y 0 me gusta en el momento de redactar esta ficha, debe tratarse como un experimento personal que requiere reevaluacion propia antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT destilado (DistilBERT): 6 capas, 12 cabezas de atencion, dimension oculta 768, mas cabeza de clasificacion de 2 clases |
| Parametros totales | 66.955.010 (recuento real declarado en safetensors; una cabeza lineal de 2 clases anadiria 1.538 parametros si no estuviera incluida en ese recuento) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens (maximo de posiciones de distilbert-base-uncased) |
| Tipos de cuantizacion | No declarados por el autor. El modelo base admite FP32, FP16/BF16 e INT8 (ONNX Runtime, bitsandbytes) |
| Idiomas soportados | No declarados por el autor. El modelo base se entreno fundamentalmente en ingles (Wikipedia en ingles + Toronto Book Corpus) y es uncased |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers/PyTorch); repo de 0,8 GB |
| Tarea | text-classification (clasificacion binaria: comida / no comida) |
| Modelo base | distilbert-base-uncased |
| Fecha de creacion | 21 de septiembre de 2026 (actualizado el 24 de septiembre de 2026) |
| Descargas / me gusta | 21 descargas, 0 me gusta |

## Arquitectura y entrenamiento

La arquitectura es la de distilbert-base-uncased: un encoder transformer de 6 capas con 12 cabezas de atencion por capa, dimension oculta 768, vocabulario WordPiece de 30.522 tokens y embeddings posicionales aprendidos de hasta 512 posiciones. Segun la documentacion publicada de DistilBERT, este modelo base es un estudiante de BERT-base entrenado con una combinacion de perdida de destilacion (divergencia KL sobre las distribuciones de salida del profesor), perdida de masked language modeling y perdida de similitud coseno sobre los estados ocultos, lo que reduce el tamano un 40 por ciento y el tiempo de inferencia en CPU en torno a un 60 por ciento conservando cerca del 97 por ciento del rendimiento de BERT-base en GLUE.

Sobre el ajuste fino concreto de este checkpoint, la model card solo aporta los hiperparametros: 5 epocas, learning rate 1e-4 con scheduler lineal, batch de entrenamiento y evaluacion de 32, semilla 42, optimizador AdamW fused con betas (0,9 / 0,999) y epsilon 1e-8. El entrenamiento completo duro 35 pasos, es decir 7 pasos por epoca; con batch 32 y sin acumulacion de gradientes eso equivale a unos 224 ejemplos por epoca. El conjunto de datos no se especifica en ningun momento ("on an unknown dataset"), tampoco su composicion, su tamano real ni el proceso de anotacion. No hay constancia de RLHF, DPO ni de ninguna tecnica adicional de alineamiento, algo que no aplica a un clasificador. Las versiones de framework declaradas son Transformers 5.17.0, PyTorch 2.11.0+cu130, Datasets 5.0.1 y Tokenizers 0.23.2.

## Capacidades

- Clasificacion binaria de texto corto: devuelve una etiqueta entre dos clases (comida / no comida) con su probabilidad asociada, para una secuencia de hasta 512 tokens.
- Inferencia muy rapida y economica: 66 millones de parametros permiten procesar lotes grandes en GPU de gama baja o en CPU.
- Integracion directa con el pipeline text-classification de transformers y con el tag text-embeddings-inference/endpoints_compatible que declara el repositorio.
- Entrada de texto plano en ingles no sensible a mayusculas (tokenizador uncased del modelo base).
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No esta disenado para agentes ni para razonamiento multi-paso.
- No hay capacidades multilingues declaradas ni modo "thinking"; el comportamiento fuera del ingles no esta documentado.
- Capacidad especial: ninguna documentada. La model card no describe features adicionales ni un modo de uso distinto del pipeline de clasificacion.

## Casos de uso

- Moderacion de foros y comunidades gastronomicas: el clasificador puede etiquetar cada publicacion como contenido culinario o no culinario para enrutarla a la seccion adecuada o para aplicar reglas de moderacion distintas, con un coste por inferencia minimo al ser un encoder de 66 M de parametros.
- Enrutado de consultas en un chatbot de recetas o de reparto de comida: antes de invocar un LLM, el clasificador decide si la consulta trata de comida; si no, se responde con una plantilla o se redirige a otro flujo, lo que reduce el gasto en tokens de un modelo generativo.
- Etiquetado automatico de resenas de restaurantes y productos de supermercado: procesar en lote miles de resenas cortas para separar las que hablan de alimentos de las que hablan de envio, atencion o precio, y construir asi un corpus tematico.
- Prefiltrado de datos para investigacion en nutricion o analisis de menus: dado un flujo de documentos o publicaciones, quedarse solo con los fragmentos relevantes antes de una anotacion manual, reduciendo el volumen que revisan los anotadores.
- Triaje de tickets en plataformas de delivery: clasificar el texto de cada ticket para distinguir incidencias relacionadas con el pedido de comida (producto, ingredientes, frescura, alerge) de las puramente logisticas o administrativas.
- Deteccion de spam o contenido fuera de tema en una web de recetas: filtrar en primera linea comentarios que no guardan relacion con la tematica del sitio, con la ventaja de que el modelo se ejecuta en CPU sin coste de GPU.
- Clasificacion de consultas en busqueda interna de un recetario: etiquetar la intencion de la consulta para decidir si se busca una receta, un ingrediente o un utensilio, y aplicar un ranking distinto en cada caso.
- Anotacion asistida en proyectos de ciencia de datos: preetiquetar un conjunto de datos antes de la revision humana, siempre que el dominio del texto de destino coincida con el de entrenamiento (no documentado, por lo que hay que validarlo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del autor esta vacio: no hay MMLU, GLUE, HumanEval ni ninguna otra evaluacion estandar. Las unicas cifras existentes son las metricas internas de entrenamiento y validacion que registra el Trainer, calculadas sobre un conjunto de evaluacion que el autor no identifica:

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion | Accuracy |
|---|---|---|---|---|
| 1,0 | 7 | 0,3843 | 0,0589 | 1,0 |
| 2,0 | 14 | 0,0297 | 0,0071 | 1,0 |
| 3,0 | 21 | 0,0060 | 0,0031 | 1,0 |
| 4,0 | 28 | 0,0032 | 0,0021 | 1,0 |
| 5,0 | 35 | 0,0025 | 0,0019 | 1,0 |

Estas cifras deben interpretarse con cautela: un accuracy de 1,0 desde la primera epoca, un total de 35 pasos de optimizacion y un conjunto de evaluacion no descrito son compatibles tanto con una tarea muy sencilla como con fuga de datos entre entrenamiento y validacion o con un conjunto de validacion minusculo. No son comparables con resultados de benchmarks publicos.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 los pesos ocupan aproximadamente 268 MB y en INT8 unos 67 MB; con activaciones y un lote de tamano moderado, el consumo total se mantiene por debajo de 1 GB en cualquiera de los dos casos.
- GPU recomendadas: cualquiera sirve. Una RTX 4090, una L4, una T4 o incluso una GTX 1650 son mas que suficientes; modelos como A100 o H100 solo tienen sentido si se busca el maximo throughput con lotes muy grandes o si ya estan disponibles en la infraestructura.
- Cabe en GPU de consumo: si, en practicamente todas, incluidas las de gama de entrada y las integradas modestas. Tambien se ejecuta en CPU sin problema.
- Opciones de despliegue: pipeline text-classification de transformers, exportacion a ONNX Runtime o TorchScript para servir sin dependencia de PyTorch, Hugging Face Inference Endpoints (el repo declara endpoints_compatible) y text-embeddings-inference (declarado en los tags), ademas de un servidor propio con FastAPI o NVIDIA Triton. vLLM, llama.cpp y Ollama estan orientados a modelos generativos o a embeddings y no son la via recomendada para este clasificador; TGI tampoco es la opcion natural para un encoder de clasificacion.
- Latencia y throughput: no hay mediciones publicadas por el autor. Como estimacion orientativa, no medida, un encoder de esta tamano suele resolverse en decenas de milisegundos por secuencia en CPU moderna y en el orden de miles de secuencias cortas por segundo en una GPU actual con lotes grandes; la cifra real depende de la longitud de secuencia, del backend y del hardware.

## Comparativa con modelos similares

No hay resultados publicados de este checkpoint sobre un conjunto de evaluacion publico, por lo que la comparacion de rendimiento no puede establecerse. La tabla compara caracteristicas objetivas (tamano, contexto, licencia y disponibilidad) con alternativas habituales para clasificacion de texto corto; las alternativas necesitan ajuste fino para la tarea concreta de comida / no comida.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en esta tarea |
|---|---|---|---|---|---|
| Avnay/Food_not_food_classificer-distilbert-base-uncased | 66.955.010 | 512 tokens | Apache 2.0 | Hugging Face, 21 descargas, 0 me gusta | Accuracy 1,0 en validacion interna no identificada; sin benchmarks publicos |
| distilbert-base-uncased (sin ajustar) | 66.955.010 | 512 tokens | Apache 2.0 | Muy amplia, modelo base de referencia | Requiere ajuste fino; no clasifica comida / no comida tal cual |
| bert-base-uncased ajustado a clasificacion | 110 millones aprox. | 512 tokens | Apache 2.0 | Amplia, multiples checkpoints de la comunidad | Depende del checkpoint y del conjunto de ajuste |
| roberta-base ajustado a clasificacion | 125 millones aprox. | 514 tokens | MIT | Amplia | Depende del checkpoint y del conjunto de ajuste |
| ModernBERT-base ajustado a clasificacion | 149 millones aprox. | 8.192 tokens | Apache 2.0 | Disponible desde 2024 | Depende del checkpoint; ventaja en secuencias largas |

La principal diferencia de este checkpoint frente a las alternativas es que ya viene ajustado para la tarea concreta, pero tambien que carece por completo de documentacion sobre datos, idioma y evaluacion, algo que si suelen ofrecer los checkpoints de referencia de la comunidad.

## Limitaciones y advertencias

- Accuracy de 1,0 desde la primera epoca sobre un conjunto de validacion no descrito: indica posible sobreajuste, fuga de datos, conjunto de validacion muy pequeno o una tarea trivialmente separable. No debe tomarse como una estimacion realista del rendimiento en produccion.
- Conjunto de entrenamiento desconocido: no se puede saber la distribucion de dominios, el idioma real de los textos, la longitud tipica ni el criterio de anotacion. Cualquier uso fuera de ese dominio no documentado es una extrapolacion.
- Sesgos conocidos: no hay ningun analisis de sesgos del autor. El modelo base hereda los sesgos de sus corpus (Wikipedia en ingles y Toronto Book Corpus), con sesgos de genero y de representacion documentados en la familia BERT; ademas, aplicado a comida, puede reflejar sesgos culturales del conjunto de ajuste (por ejemplo, considerar comida solo ciertos tipos de cocina).
- Alucinacion: al no ser generativo, no alucina texto, pero si puede producir falsos positivos y falsos negativos con alta confianza, que es el riesgo equivalente en un clasificador. Un umbral de decision calibrado es imprescindible.
- Limitaciones de idioma: el autor no declara idiomas; el tokenizador es uncased y esta entrenado sobre todo en ingles. No hay evidencia de que funcione en castellano ni en otros idiomas.
- Limitacion de contexto: 512 tokens. Los textos mas largos se truncan por defecto con el tokenizador, lo que puede eliminar la parte relevante del documento.
- Tokenizador uncased: se pierde la distincion entre mayusculas, relevante en nombres propios de platos, marcas o ingredientes escritos con mayuscula inicial.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de copyright y licencia y de indicar los cambios. El autor no ofrece ninguna garantia ni soporte.
- Mantenimiento y comunidad: 21 descargas, 0 me gusta y una model card autogenerada con apartados sin rellenar. No hay issues, demos ni versiones posteriores documentadas.
- Uso en dominios sensibles: no debe emplearse como unico criterio en decisiones con consecuencias reales, como recomendaciones dieteticas, gestion de alergenos o seguridad alimentaria, dado que la tasa de error real es desconocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Avnay/Food_not_food_classificer-distilbert-base-uncased
- Modelo base distilbert-base-uncased: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018), arquitectura de la que deriva el modelo base: https://arxiv.org/abs/1810.04805
- Documentacion de DistilBERT en transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
