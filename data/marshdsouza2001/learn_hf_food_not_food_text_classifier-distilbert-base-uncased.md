# marshdsouza2001/learn_hf_food_not_food_text_classifier-distilbert-base-uncased

## Resumen

`marshdsouza2001/learn_hf_food_not_food_text_classifier-distilbert-base-uncased` es un clasificador de texto binario obtenido por fine-tuning de `distilbert/distilbert-base-uncased` mediante la libreria Transformers y la clase `Trainer`. El modelo resuelve una tarea muy concreta: decidir si un texto pertenece a la categoria "food" (comida) o "not food" (no comida), un clasificador de dos clases típico de ejercicios de aprendizaje o de filtrado temático en pipelines de datos.

Se trata de un modelo pequeno, de 66.955.010 parametros (aproximadamente 67 millones), derivado de la arquitectura DistilBERT: un transformer encoder de 6 capas, 12 cabezas de atencion y dimension oculta de 768, destilado a partir de BERT-base. El repositorio ocupa 0,3 GB y los pesos se distribuyen en formato `safetensors`. No es un modelo generativo ni conversacional: es exclusivamente una cabeza de clasificacion sobre el encoder, con una ventana de entrada limitada a 512 tokens.

Su relevancia es limitada y de caracter educativo o de referencia. El autor no ha publicado informacion sobre el dataset de entrenamiento ("on an unknown dataset" en la model card), el modelo acumula 0 descargas y 1 like, y los resultados declarados (accuracy 1.0 y loss de evaluacion 0.0005) proceden de un conjunto de validacion muy reducido, por lo que no deben interpretarse como evidencia de rendimiento generalizable. Se incluye aqui como ficha de referencia de un fine-tuning de DistilBERT para clasificacion tematica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT), 6 capas, 12 cabezas de atencion, dimension oculta 768, con cabeza de clasificacion de 2 etiquetas |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite de la arquitectura DistilBERT base) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se declaran versiones GGUF, ONNX ni cuantizaciones INT8) |
| Idiomas soportados | no disponible (el modelo base es `distilbert-base-uncased`, entrenado principalmente en ingles, pero la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de `distilbert-base-uncased`: un transformer encoder de 6 capas con 12 cabezas de atencion, 768 dimensiones ocultas y aproximadamente 66 millones de parametros, resultado de destilar BERT-base bajo la supervision del modelo completo. Sobre ese encoder se ha anadido una cabeza de clasificacion secuencial para dos etiquetas, lo que da un total de 66.955.010 parametros. El tokenizador es el WordPiece sin distincion de mayusculas de DistilBERT, con un limite posicional de 512 tokens.

El entrenamiento se realizo con la clase `Trainer` de Transformers 5.18.0 sobre PyTorch 2.11.0+cu130, con `datasets` 5.1.0 y `tokenizers` 0.23.2. Los hiperparametros declarados son: learning rate 1e-4, tamano de batch de entrenamiento y evaluacion 32, 10 epocas, semilla 42, optimizador AdamW fusionado con betas (0,9; 0,999) y epsilon 1e-8, y planificador de learning rate lineal. La model card indica que el dataset de entrenamiento es desconocido, que no se documento composicion ni numero de tokens, y que no hay evidencia de fases de RLHF o DPO (no tendria sentido en un clasificador de este tipo). El dato mas relevante del proceso es el volumen: con batch 32 y 7 pasos por epoca, el conjunto de entrenamiento ronda los 200-250 ejemplos, y el de validacion es igualmente minusculo, lo que explica que la accuracy se sature en 1.0 desde la primera epoca.

## Capacidades

- Clasificacion de texto binaria en dos clases: "food" y "not food", segun la convencion de nombre del modelo.
- Inferencia de etiqueta unica sobre secuencias de hasta 512 tokens.
- Compatible con la pipeline `text-classification` de Transformers y con `text-embeddings-inference` / endpoints compatibles segun los tags del repositorio.
- No soporta generacion de texto: el modelo no incluye cabeza de lenguaje.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene modo "thinking" ni salida de cadena de pensamiento.
- No tiene capacidades de vision, audio ni multimodalidad.
- Capacidad multilingue: no disponible; el encoder base esta preentrenado predominantemente en ingles.
- Rendimiento en tareas distintas a la clasificacion tematica binaria: no disponible y, previsiblemente, nulo sin reentrenamiento.

## Casos de uso

- Filtrado tematico de un corpus: dado un flujo de textos cortos (titulares, descripciones de producto, pies de foto), el modelo etiqueta si el contenido es de tematica alimentaria. Es adecuado por su tamano reducido, que permite procesar cientos de miles de documentos por hora en CPU.
- Etiquetado previo en un pipeline de anotacion: usar el clasificador como preanotador para reducir el trabajo manual en un proyecto de etiquetado de contenido gastronomico, revisando despues solo los casos con probabilidad intermedia.
- Ejercicio didactico de fine-tuning: sirve como plantilla reproducible para aprender el flujo `Trainer` con DistilBERT, dado que el repositorio documenta hiperparametros, versiones de framework y curva de perdida.
- Clasificacion de consultas de busqueda: enrutar busquedas entrantes hacia un indice de recetas o de productos alimentarios frente a un indice general, siempre que el dominio de consultas sea similar al de entrenamiento.
- Moderacion o enrutado de contenido en foros y redes: separar publicaciones de tematica culinaria del resto para dirigirlas a la comunidad correspondiente.
- Prototipado rapido de clasificadores de dos clases: reutilizar el script de entrenamiento como linea base antes de invertir en un modelo mayor, midiendo primero si la tarea es separable con una arquitectura de 67 millones de parametros.
- Servicio de bajo coste en produccion: desplegado con `text-embeddings-inference` o con la pipeline de Transformers, el modelo ocupa del orden de 270 MB en fp32 y puede servirse en una unica CPU sin GPU, lo que lo hace apto para entornos con presupuesto minimo.

## Benchmarks y rendimiento

El `model-index` del repositorio no contiene resultados (`results: []`). La model card solo publica la curva de entrenamiento y el resultado final en el conjunto de evaluacion, que se reproduce a continuacion tal cual figura en la informacion proporcionada.

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion | Accuracy |
|---|---|---|---|---|
| 1.0 | 7 | 0.4337 | 0.0815 | 1.0 |
| 2.0 | 14 | 0.0353 | 0.0075 | 1.0 |
| 3.0 | 21 | 0.0061 | 0.0022 | 1.0 |
| 4.0 | 28 | 0.0022 | 0.0012 | 1.0 |
| 5.0 | 35 | 0.0015 | 0.0008 | 1.0 |
| 6.0 | 42 | 0.0010 | 0.0007 | 1.0 |
| 7.0 | 49 | 0.0008 | 0.0006 | 1.0 |
| 8.0 | 56 | 0.0007 | 0.0005 | 1.0 |
| 9.0 | 63 | 0.0007 | 0.0005 | 1.0 |
| 10.0 | 70 | 0.0007 | 0.0005 | 1.0 |

Resultado final declarado en el conjunto de evaluacion: loss 0.0005, accuracy 1.0.

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, HumanEval, GSM8K u otros) en la informacion disponible. La accuracy de 1.0 procede de un conjunto de validacion de tamano muy reducido (7 pasos de evaluacion con batch 32, en torno a 200 ejemplos) y de un unico dominio, por lo que no es comparable con resultados de benchmarks publicos.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 270 MB en fp32 y 135 MB en fp16, mas el overhead de activaciones y del runtime. Cifras muy por debajo de 1 GB en cualquier configuracion.
- GPU recomendadas: no requiere GPU. Cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1050 Ti, GTX 1650, RTX 3050, T4, etc.). Modelos como A100 o H100 no aportan ninguna ventaja a esta escala.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en CPU. El cuello de botella real es el ancho de banda de memoria, no la VRAM disponible.
- Opciones de despliegue: pipeline `text-classification` de Transformers, servidor `text-embeddings-inference` (segun los tags del repositorio), endpoints compatibles, ONNX Runtime tras exportacion manual, o TorchScript. No se publican pesos GGUF, por lo que Ollama y llama.cpp requeririan una conversion previa no documentada.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones del autor. Con una arquitectura de 6 capas y 67 millones de parametros, la latencia por lote en GPU moderna se situa tipicamente en el rango de pocos milisegundos, pero esto es una estimacion basada en la arquitectura, no un dato medido.
- Entrenamiento: el fine-tuning completo de este modelo cabe en una GPU de consumo de 8 GB, y probablemente en 4 GB, con batch 32 y secuencias de 512 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DistilBERT fine-tuned food/not food) | 66.955.010 | 512 tokens | Clasificacion binaria food / not food | apache-2.0 | Repositorio HuggingFace, 0 descargas |
| `distilbert/distilbert-base-uncased` (modelo base) | ~66 millones | 512 tokens | Modelo de lenguaje enmascarado (requiere fine-tuning para clasificar) | apache-2.0 | Ampliamente disponible en HuggingFace |
| `distilbert/distilbert-base-uncased-finetuned-sst-2-english` | ~67 millones | 512 tokens | Analisis de sentimiento binario | apache-2.0 | Modelo de referencia muy descargado, con evaluacion publicada |
| `FacebookAI/roberta-base` | ~125 millones | 512 tokens | Modelo de lenguaje enmascarado (base para clasificacion) | mit | Ampliamente disponible en HuggingFace |

La comparacion de rendimiento entre estos modelos no esta disponible: el repositorio no publica resultados en benchmarks compartidos con las alternativas, y las metricas declaradas (accuracy 1.0) no son comparables por el tamano reducido del conjunto de evaluacion. Respecto a `roberta-base`, duplicar el numero de parametros no aporta nada si la tarea es trivialmente separable, por lo que DistilBERT es una eleccion razonable en coste para este tipo de filtrado.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica explicitamente "on an unknown dataset". No se conoce el dominio, el idioma, el tamano ni el metodo de recogida de los datos, lo que impide evaluar sesgos o cobertura.
- Accuracy 1.0 no fiable: procede de un conjunto de validacion de aproximadamente 200 ejemplos. La curva de perdida se aplana en la epoca 8 y el modelo esta probablemente sobreajustado al conjunto de entrenamiento. No hay particion de test independiente.
- Riesgo alto de alucinacion de etiqueta fuera de dominio: al ser un clasificador binario, el modelo asignara siempre una de las dos clases aunque el texto no tenga ninguna relacion con la tematica, con probabilidades potencialmente mal calibradas.
- Limitacion de contexto: 512 tokens. Textos mas largos deben truncarse, con la perdida de informacion que eso implica. Las secuencias relevantes suelen estar al inicio, y el modelo no usa pooling jerarquico ni ventana deslizante.
- Idioma: el modelo base esta preentrenado en ingles. El comportamiento en castellano no esta documentado ni evaluado; la tokenizacion WordPiece de DistilBERT es especialmente ineficiente en idiomas con morfologia rica.
- Advertencia de la propia model card: el texto generado automaticamente por `Trainer` incluye la nota "You should probably proofread and complete it". Las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" contienen literalmente "More information needed".
- Licencia: apache-2.0, permisiva para uso comercial y modificacion, siempre que se conserve el aviso de licencia y la atribucion. No hay restricciones adicionales declaradas.
- Caveat de trazabilidad: la fecha de creacion registrada es 2026-10-07 y las versiones de framework citadas (Transformers 5.18.0, PyTorch 2.11.0) corresponden a un entorno posterior al de la mayoria de despliegues actuales, lo que puede dificultar la reproduccion exacta.
- Uso en produccion: 0 descargas y 1 like. No hay evidencia de validacion por terceros, informes de error ni mantenimiento posterior. No se recomienda su uso en produccion sin un reentrenamiento y una evaluacion propios.
- No apto para tareas generativas, conversacionales ni de agentes, pese a que la libreria `transformers` permita cargarlo junto a otros componentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/marshdsouza2001/learn_hf_food_not_food_text_classifier-distilbert-base-uncased
- Modelo base `distilbert/distilbert-base-uncased`: https://huggingface.co/distilbert/distilbert-base-uncased
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo. Las consultas realizadas devolvieron unicamente resultados de sitios para adultos sin ninguna relacion con el modelo, por lo que se descartan y no se incluyen.
- Paper de referencia de DistilBERT (Sanh et al., 2019): no disponible en la informacion proporcionada.
- Repositorio de codigo del autor, demo o blog: no disponible en la informacion proporcionada.
