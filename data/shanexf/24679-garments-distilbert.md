# shanexf/24679-garments-distilbert

## Resumen

`shanexf/24679-garments-distilbert` es un clasificador de texto corto en inglés que asigna una descripción de producto de ropa a una de cinco categorías: `top`, `bottom`, `outerwear`, `dress` y `footwear`. Lo publica el usuario shanexf como entregable de la asignatura 24-679 ("fine-tuning a small text model", otoño de 2026) y se construye fine-tuneando `distilbert-base-uncased` mediante AutoGluon MultiModal 1.6.1, con una nueva cabeza de clasificación de cinco clases.

El modelo es un artefacto docente, no un sistema de categorización de producto listo para producción. Se entrena sobre 70 descripciones originales escritas por un único autor con un estilo de listado deliberadamente homogéneo, a las que se añaden 1289 filas sintéticas generadas por aumentación (intercambios y borrados de caracteres internos, permutaciones de palabras y sustitución por sinónimos de WordNet). El conjunto de validación y el de test contienen 15 descripciones originales cada uno.

Su relevancia es fundamentalmente metodológica: sirve como ejemplo reproducible de un pipeline completo de fine-tuning con AutoGluon (tokenización WordPiece, truncado a 128 tokens, AdamW con decaimiento por capas, early stopping y greedy soup de los tres mejores checkpoints) y como caso de estudio de los límites de evaluar con conjuntos de test minúsculos, donde una sola descripción vale 6,7 puntos de accuracy.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder, DistilBERT (6 capas), con cabeza de clasificación multiclase de 5 vías añadida |
| Parámetros totales | 66 M (según la model card) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (`model.hf_text.max_text_len = 128`); no se documenta uso de la ventana completa de 512 posiciones del tokenizador |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | `other` con nombre `classroom-use-only` (uso exclusivamente académico) |
| Formato de pesos | no disponible (repo de 0,5 GB gestionado por AutoGluon; la model card no especifica safetensors, GGUF ni binarios PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un encoder transformer destilado de 66 M de parámetros y 6 capas, y sustituye la cabeza original por una capa de clasificación de 5 clases. El preprocesado se delega en el pipeline `hf_text` de AutoGluon: tokenizador WordPiece con lower-casing, tokens `[CLS]`/`[SEP]`, truncado y padding a un máximo de 128 tokens, sin limpieza, stemming ni eliminación de stop-words. Las etiquetas son enteros de 0 a 4 tal como aparecen en el dataset.

El entrenamiento usa AutoGluon MultiModal 1.6.1 (`MultiModalPredictor`, `problem_type="multiclass"`, `eval_metric="accuracy"`) sobre transformers 5.14.1 y PyTorch 2.11.0+cu128. Los hiperparámetros son AdamW con learning rate 5e-5 y decaimiento por capas de 0,9, warm-up lineal del 10 % seguido de decaimiento coseno, weight decay 0,01, batch efectivo de 32 (16 por GPU), hasta 8 épocas con validación cada media época, early stopping con paciencia 3 sobre accuracy de validación y promedio greedy soup de los 3 mejores checkpoints. La semilla es 24679 y se activó precisión mixta en GPU. El ajuste completo tardó 210,19 segundos (límite de 900 s) y alcanzó `val_accuracy = 1.0`.

Los datos proceden de `leixiang25/24679-hw1-text-garments` (commit `49d58b5a09420224a7d4d00fd983b9febd260f8f`), un dataset de clase con 100 descripciones ficticias de entre 164 y 208 caracteres, sin texto de minoristas, marcas ni datos personales. Los splits publicados son train = 70 originales + 1289 sintéticas (1359 filas), validación = 15 originales y test = 15 originales, con clases balanceadas en el train original (14 ejemplos por clase). La aumentación se aplica dentro del dataset (5 extracciones por método, nunca apiladas) y los holdouts son exclusivamente originales, sin que ningún `parent_id`/`message_id` cruce de split.

## Capacidades

- Clasificación de texto corto en inglés en exactamente cinco etiquetas: `top`, `bottom`, `outerwear`, `dress` y `footwear`.
- Funciona sobre descripciones de tipo listado de producto (frases de 164 a 208 caracteres aproximadamente) en el dominio de prendas de vestir.
- Robustez parcial ante ruido textual: en las pruebas de diagnóstico mantiene 0,987 de accuracy con borrados de caracteres internos y 0,96 con intercambios de caracteres internos, frente a 1,0 en el test limpio.
- No soporta tool calling ni function calling: la model card no declara ningún mecanismo de este tipo.
- No soporta uso como agente ni razonamiento multi-paso; es un clasificador de una sola pasada.
- Capacidad multilingüe: no. Solo inglés (`en`), y el tokenizador `uncased` está entrenado sobre corpus en inglés.
- No dispone de modo de razonamiento (*thinking mode*), visión, audio ni generación de texto libre.
- Rendimiento sensible al vocabulario: al enmascarar los sustantivos de prenda, la accuracy baja a 0,867, lo que indica dependencia de esas palabras clave.

## Casos de uso

- Catalogación automática de fichas de producto: dado el título o la descripción corta de una prenda en un catálogo de comercio electrónico, el modelo devuelve una de las cinco categorías para rellenar el campo de taxonomía. Es adecuado porque la tarea es exactamente la que resuelve y la inferencia es muy barata (66 M de parámetros).
- Normalización de feeds de producto para canales como Google Shopping o marketplaces: se aplica como paso de enriquecimiento para mapear descripciones heterogéneas a un conjunto fijo y cerrado de categorías antes de exportar el feed.
- Pre-etiquetado para anotación humana: el modelo propone una categoría y un anotador solo revisa las discrepancias, reduciendo el coste de construir un corpus etiquetado más grande; su accuracy de 0,96-0,987 bajo ruido lo hace utilizable como filtro previo, no como etiquetador final.
- Enrutado interno en equipos de merchandising: clasificar automáticamente descripciones entrantes y asignarlas a la persona o equipo responsable de esa familia de producto (calzado, prendas de abrigo, etc.).
- Control de calidad de datos en pipelines de ingesta: detectar registros cuyo texto no encaja con la categoría declarada por el proveedor, marcándolos para revisión manual.
- Despliegue en el borde o en CPU: al ser un DistilBERT de 6 capas, puede ejecutarse en el propio dispositivo o en instancias sin GPU para tareas de clasificación por lotes, con un coste por inferencia muy bajo.
- Material didáctico y reproducibilidad: sirve como plantilla de referencia para enseñar un ciclo completo de fine-tuning con AutoGluon, incluida la comparación contra una línea base de TF-IDF + regresión logística y la elaboración de sondas de robustez.

## Benchmarks y rendimiento

Resultados publicados en la model card (DistilBERT fine-tuneado frente a una línea base de TF-IDF + regresión logística entrenada sobre las mismas filas):

| Modelo | Split | Accuracy | Macro F1 | Weighted F1 |
|---|---|---|---|---|
| DistilBERT (fine-tuneado) | validation | 1,000 | 1,000 | 1,000 |
| DistilBERT (fine-tuneado) | test | 1,000 | 1,000 | 1,000 |
| TF-IDF + regresión logística | validation | 0,933 | 0,931 | 0,931 |
| TF-IDF + regresión logística | test | 1,000 | 1,000 | 1,000 |

Precisión, recall y F1 por clase en el conjunto de test:

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| top | 1,000 | 1,000 | 1,000 | 3 |
| bottom | 1,000 | 1,000 | 1,000 | 3 |
| outerwear | 1,000 | 1,000 | 1,000 | 3 |
| dress | 1,000 | 1,000 | 1,000 | 3 |
| footwear | 1,000 | 1,000 | 1,000 | 3 |
| accuracy | 1,000 | 1,000 | 1,000 | 15 |
| macro avg | 1,000 | 1,000 | 1,000 | 15 |
| weighted avg | 1,000 | 1,000 | 1,000 | 15 |

El intervalo de confianza bootstrap al 95 % para la accuracy de test es 1,000-1,000 (2000 remuestreos de 15 descripciones; una única descripción equivale a 6,7 puntos porcentuales). Tiempo de ajuste declarado: 210,19 segundos.

Sondas de robustez sobre las descripciones de test (5 extracciones por método, no son la métrica principal):

| Sonda | Filas | Accuracy DistilBERT | Accuracy baseline | Proporción de impacto en sustantivos |
|---|---|---|---|---|
| Sustantivos de prenda enmascarados | 15 | 0,867 | 0,933 | 0,933 |
| Borrados de caracteres internos | 75 | 0,987 | 0,987 | 0,16 |
| Intercambios de caracteres internos | 75 | 0,960 | 1,000 | 0,12 |
| Permutación de palabras intra-frase | 75 | 1,000 | 0,987 | 0,00 |
| Test limpio (referencia) | 15 | 1,000 | no disponible en el extracto | no disponible en el extracto |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 para los pesos (66 M de parámetros ≈ 264 MB) más el *overhead* del runtime; en la práctica, 1-2 GB de VRAM son suficientes con batch pequeño.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM sirve; para entrenamiento, la model card indica uso de GPU con precisión mixta y batch de 16 por GPU, sin especificar modelo concreto (A100, H100 o RTX 4090 son holgadamente suficientes, pero no se documenta ninguna medición sobre ellas).
- Cabe en GPU de consumo: sí, en prácticamente cualquier tarjeta moderna (RTX 3060, RTX 4060, GTX 1650 o superior) e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: AutoGluon MultiModal `MultiModalPredictor` (ruta documentada, ya que el modelo se publicó con `library_name: autogluon`), y PyTorch/transformers para cargar el checkpoint subyacente. No se documentan exportaciones a vLLM, llama.cpp, Ollama, TGI ni ONNX.
- Latencia y throughput: no disponibles. El único dato temporal publicado es el tiempo de fine-tuning (210,19 s dentro de un límite de 900 s), que no es extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shanexf/24679-garments-distilbert | 66 M | 128 tokens | 1,000 (15 ejemplos) | `classroom-use-only` | HuggingFace, 0 descargas, 0 likes |
| TF-IDF + regresión logística (línea base del propio trabajo) | no aplica (modelo lineal disperso) | no aplica | 1,000 (15 ejemplos) | no disponible | descrito en la model card, no publicado como artefacto independiente |
| distilbert-base-uncased (modelo base sin fine-tuning) | 66 M | no disponible | no disponible para esta tarea sin entrenamiento específico | no disponible en la información proporcionada | HuggingFace |

La comparación más informativa es interna al propio trabajo: la línea base de TF-IDF + regresión logística iguala al transformer en el test (1,000) y lo supera en validación (0,933 frente a 1,000, a favor del transformer) y en la sonda de sustantivos enmascarados (0,933 frente a 0,867). Con 15 ejemplos de test, estas diferencias no permiten establecer superioridad estadística. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgo de estilo: el entrenamiento original lo escribió un único autor con un estilo de listado consistente, por lo que el modelo puede sobreajustarse a esa plantilla y degradarse con descripciones de otros redactores, idiomas de catálogo o formatos (por ejemplo, fichas técnicas con medidas y composición).
- Riesgo de sobreajuste elevado: 70 descripciones originales para 5 clases (14 por clase) y 1289 filas sintéticas derivadas de ellas. La aumentación no aporta vocabulario ni semántica nuevos, solo variaciones superficiales.
- Evaluación estadísticamente débil: el test tiene 15 ejemplos, cada uno vale 6,7 puntos de accuracy y el intervalo de confianza bootstrap es degenerado (1,000-1,000). Un accuracy de 1,0 no es evidencia de generalización.
- Alucinación: como clasificador de etiqueta cerrada no genera texto libre, pero sí puede asignar con alta confianza una categoría incorrecta cuando falta el sustantivo de prenda (accuracy 0,867 con sustantivos enmascarados).
- Dependencia léxica: las sondas muestran que el rendimiento cae cuando se alteran los caracteres internos (0,96) y, sobre todo, cuando se eliminan los sustantivos de prenda (0,867), lo que sugiere un uso intensivo de palabras clave más que de comprensión composicional.
- Limitación de idioma: solo inglés. No hay evidencia de funcionamiento en castellano ni en ningún otro idioma.
- Limitación de longitud: truncado a 128 tokens, por debajo de las 164-208 posiciones... en tokens no se especifica, pero descripciones más largas se recortan y pueden perder la información discriminante.
- Licencia: `other` con nombre `classroom-use-only`. Restringe el uso a fines de clase; no está autorizado el uso comercial. La licencia del dataset de origen (`leixiang25/24679-hw1-text-garments`) no está asignada por su model card, lo que añade incertidumbre jurídica sobre la redistribución de los datos de entrenamiento.
- Repositorio sin adopción: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni issues documentados.
- Advertencia de producción: no debe desplegarse como sistema de categorización general de producto sin reentrenamiento sobre datos reales y representativos, y sin una evaluación con un conjunto de test de tamaño suficiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shanexf/24679-garments-distilbert
- Dataset de entrenamiento: https://huggingface.co/datasets/leixiang25/24679-hw1-text-garments (commit `49d58b5a09420224a7d4d00fd983b9febd260f8f`)
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- AutoGluon MultiModal (framework de entrenamiento, versión 1.6.1): no se proporciona enlace en la información disponible
- Imagen de matrices de confusión referenciada en la model card: `confusion_matrices.png` (relativa al repositorio del modelo)
- La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo: los enlaces obtenidos corresponden a una serie de televisión en chino y no guardan relación con esta ficha.
