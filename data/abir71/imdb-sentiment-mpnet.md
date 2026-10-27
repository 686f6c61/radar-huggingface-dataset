# abir71/imdb-sentiment-mpnet

## Resumen

`abir71/imdb-sentiment-mpnet` no es un modelo generativo, sino un clasificador binario de sentimiento empaquetado como artefacto de scikit-learn. Sobre un encoder de frases congelado (`sentence-transformers/all-mpnet-base-v2`) se aplica una regresión logística (C = 10) que devuelve la probabilidad de que una reseña sea positiva. El repositorio publica únicamente el clasificador (`classifier.joblib`, `classifier.json` y `metadata.json`); los pesos del encoder se obtienen aparte desde el modelo base.

Lo desarrolla Abir Hosen (Departamento de ICE, Noakhali Science and Technology University, con supervisión de Sultana Jahan Soheli) como la mejor configuración ligera de un estudio comparativo sobre análisis de sentimiento en reseñas cinematográficas. El estudio enfrentó representaciones bag-of-words, TF-IDF y embeddings de frase con regresión logística, SVM, naive Bayes, random forest, KNN y una red neuronal; los embeddings de frase dieron los mejores resultados y, entre las opciones publicables, se eligió la regresión logística por su tamano reducido frente al SVM de kernel RBF, que conserva decenas de miles de vectores soporte.

Su relevancia es la de un *baseline* reproducible y barato: con 769 parámetros entrenables y un encoder de propósito general alcanza 91,11 % de accuracy y 96,94 % de ROC-AUC en el test del corpus IMDB 50K. Es útil como referencia para comparativas, para prototipos de clasificación de opiniones y para despliegues en CPU o en navegador, no como sustituto de un modelo afinado de extremo a extremo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer MPNet congelado (`sentence-transformers/all-mpnet-base-v2`) usado como extractor de características (mean pooling, sin normalización final) + regresión logística de scikit-learn como cabeza de clasificación |
| Parametros totales | No disponible en la información proporcionada para el encoder (se descarga por separado). El clasificador publicado tiene 768 coeficientes + 1 intercepto = 769 parámetros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens como máximo; solo se leen los primeros 512 tokens de cada reseña (el valor por defecto de la librería es 384 y el autor lo eleva a 512) |
| Tipos de cuantizacion | FP32 en el artefacto `joblib` original; el demo web usa una copia FP16 en ONNX (`Xenova/all-mpnet-base-v2`, `model_fp16.onnx`). El autor descartó la copia de 8 bits porque cambiaba 2 de 40 etiquetas en su prueba |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `classifier.joblib` (pickle de scikit-learn 1.9.1), `classifier.json` (768 coeficientes + intercepto como números planos) y `metadata.json`. No hay safetensors ni GGUF: los tensores del encoder viven en el repo del modelo base |
| Dimension del embedding | 768 |
| Hiperparametros del clasificador | Regresión logística con C = 10, salida `predict_proba` = probabilidad de clase positiva |
| Preprocesado obligatorio | Eliminar etiquetas HTML (`BeautifulSoup`) y pasar el texto a minúsculas antes de embeber |
| Dataset de entrenamiento | `stanfordnlp/imdb` (IMDB 50K, Maas et al., 2011): 25.000 positivas y 25.000 negativas; tras eliminar 419 reseñas duplicadas quedan 49.581, divididas 80/20 estratificado con `random_state=42` en 39.664 de entrenamiento y 9.917 de test |
| Tarea (pipeline) | `text-classification` |
| Tamano del repositorio | 0,0 GB (solo el clasificador y metadatos) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El pipeline tiene dos etapas. Primero se limpia la reseña (se quitan etiquetas HTML y se pasa a minúsculas) y se embebe con `all-mpnet-base-v2`, un encoder MPNet entrenado con *masked and permuted language modeling*; se aplica mean pooling sobre los tokens **sin** la normalización final que hace la librería por defecto, y se trunca a 512 tokens. Después, una regresión logística con C = 10 mapea el vector de 768 dimensiones a una probabilidad de sentimiento positivo. El encoder no se afina: permanece congelado y solo se entrena la cabeza lineal, de ahí el coste de entrenamiento casi nulo.

El entrenamiento se hizo sobre IMDB 50K. El autor eliminó previamente las 419 reseñas repetidas para garantizar que ninguna reseña de test apareciera también en entrenamiento, y aplicó una partición estratificada 80/20 con semilla 42. No se menciona uso de RLHF, DPO ni ajuste por instrucciones, algo coherente con la naturaleza del modelo. La innovación técnica es más metodológica que arquitectónica: la comparación sistemática de tres familias de representaciones (bag-of-words, TF-IDF y embeddings de frase) contra siete clasificadores, con control explícito de fugas de datos por duplicados. El autor también validó la reproducibilidad del demo en navegador: sobre 40 reseñas de test, la copia FP16 en ONNX quedó a menos de 0,009 de probabilidad del modelo en precisión completa, con etiquetas idénticas.

## Capacidades

- Clasificación binaria de sentimiento (positiva/negativa) sobre reseñas de películas en inglés.
- Salida de probabilidad calibrada de la clase positiva mediante `predict_proba` (útil para umbrales ajustables y ranking).
- Extracción de embeddings de 768 dimensiones reutilizable para otras tareas lineales (el encoder es accesible por separado).
- Funciona bien con reseñas largas y de dominio cinematográfico, que es la distribución de entrenamiento.
- Inferencia en CPU y en navegador (variante ONNX FP16), con huella de memoria mínima para la cabeza clasificadora.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni cadenas de pensamiento.
- No genera texto: no hay decodificación, ni modo *thinking*, ni visión, ni audio.
- No es multilingüe: solo inglés; cualquier otro idioma queda fuera de distribución.

## Casos de uso

- **Moderación y priorización de reseñas de usuarios**: en una plataforma de crítica cinematográfica se puede puntuar cada reseña con la probabilidad de sentimiento y enrutar automáticamente las muy negativas (por ejemplo, probabilidad < 0,2) a un equipo de atención al cliente, con la ventaja de que el modelo corre en CPU a coste despreciable.
- **Cuadro de mando de recepción de un estreno**: agregar la probabilidad media de las reseñas publicadas en las primeras 48 horas para detectar de forma temprana una recepción peor de la esperada, usando el clasificador como señal continua y no solo como etiqueta.
- **Sistemas de recomendación**: incorporar la polaridad estimada de las críticas como característica adicional en un *ranker* o en un modelo de filtrado colaborativo, aprovechando que la salida es una probabilidad y no una clase dura.
- **Filtrado y deduplicación de corpus**: descartar o separar reseñas claramente positivas y negativas al construir un conjunto de datos equilibrado para entrenar modelos mayores, usando el clasificador como herramienta de anotación débil.
- **Enrutado de tickets de soporte con texto libre en inglés**: clasificar quejas de clientes como negativas para asignar prioridad, siempre que el texto se parezca al registro de una reseña; requiere validación previa porque el modelo está entrenado en dominio cinematográfico.
- **Baseline en investigación y docencia**: referencia reproducible (769 parámetros, partición con semilla fija) para comparar nuevas técnicas de análisis de sentimiento o para prácticas de NLP, ya que el pipeline completo se reproduce en pocas líneas con `sentence-transformers` y `joblib`.
- **Etiquetado por lotes en pipelines de datos**: procesar ficheros de reseñas con un script que cargue el encoder una vez y aplique el clasificador a millones de textos, sin necesidad de GPU ni de servidores de inferencia especializados.

## Benchmarks y rendimiento

Resultados sobre el test de IMDB 50K sin duplicados (9.917 reseñas), tal como los publica la model card:

| Clasificador sobre el embedding | Accuracy | Precision | Recall | F1 | ROC-AUC |
|---|---|---|---|---|---|
| **Regresión logística (este modelo)** | **91,11 %** | 90,39 % | 92,06 % | 91,22 % | 96,94 % |
| Red neuronal, 256 unidades ocultas | 91,14 % | 90,65 % | 91,80 % | 91,22 % | 97,07 % |

El cuaderno del estudio reportó 91,34 % para la regresión logística y 91,98 % para un SVM de kernel RBF sobre los mismos embeddings, pero sin eliminar las reseñas repetidas, por lo que esas cifras no son directamente comparables con la tabla anterior. El autor no publica resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de modelos generativos, ya que el modelo no realiza esas tareas.

## Requisitos de hardware

- **VRAM para la cabeza clasificadora**: prácticamente nula; el `joblib` contiene 769 números y ocupa del orden de kilobytes.
- **Memoria para el encoder**: no se especifica en la información proporcionada. Al ser un encoder de tipo *base* (12 capas, 768 dimensiones) y ejecutarse en FP32 o FP16, se trata de un modelo que cabe holgadamente en cualquier GPU consumer; conviene medirlo en el entorno concreto antes de dimensionar el despliegue.
- **GPU recomendadas**: no son necesarias. Cualquier GPU consumer moderna (RTX 3060 o superior) acelera el *batching*, pero el pipeline está pensado para CPU.
- **¿Cabe en GPU consumer?** Sí, con margen amplio, incluso ejecutando el encoder en FP16 y lotes grandes.
- **Opciones de despliegue**: `sentence-transformers` + `scikit-learn` en un script de Python; envoltorio HTTP con FastAPI o BentoML; exportación a ONNX y ejecución en navegador con `transformers.js` (la ruta que usa el demo del autor); no aplica vLLM, TGI ni llama.cpp, porque no hay decodificación generativa.
- **Latencia y throughput**: no disponibles en la información proporcionada. El único dato de rendimiento publicado es de calidad, no de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en IMDB (test sin duplicados) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `abir71/imdb-sentiment-mpnet` (regresión logística) | 769 parámetros entrenables + encoder congelado | 512 tokens | 91,11 % accuracy, 96,94 % ROC-AUC | MIT | HuggingFace, repo de 0,0 GB |
| Red neuronal del mismo estudio (256 unidades ocultas) | No disponible | 512 tokens | 91,14 % accuracy, 97,07 % ROC-AUC | No disponible | Solo resultados en la model card |
| SVM de kernel RBF del mismo estudio | No disponible (decenas de miles de vectores soporte) | 512 tokens | 91,98 % accuracy en el cuaderno original, sin eliminar duplicados | No disponible | Solo resultados en la model card |
| Encoder base `sentence-transformers/all-mpnet-base-v2` | No disponible en la información | 384 tokens por defecto (512 en esta configuración) | No es un clasificador; se usa como extractor | No disponible en la información | HuggingFace |

No se dispone de datos comparativos frente a alternativas externas como DistilBERT o RoBERTa afinados en IMDB, porque no aparecen en la información proporcionada.

## Limitaciones y advertencias

- **Longitud y dominio**: entrenado con reseñas completas de IMDB. Textos muy cortos, tuits o reseñas de productos que no sean películas son menos fiables.
- **Solo dos clases**: las reseñas neutras o mixtas se fuerzan a positiva o negativa, normalmente con una probabilidad cercana al 50 %; no hay clase neutra ni escala de intensidad.
- **Sarcasmo e ironía**: el autor reconoce que se detectan mal, una limitación típica de las representaciones congeladas y de las cabezas lineales.
- **Solo inglés**: cualquier texto en otro idioma queda fuera de distribución.
- **Truncamiento**: solo se leen los primeros 512 tokens; una reseña larga con un giro de opinión al final puede clasificarse mal.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí hay riesgo de falsos positivos y negativos confiados; la probabilidad no debe interpretarse como una certeza calibrada fuera de IMDB.
- **Sesgos**: no se documenta ninguna auditoría de sesgo. Al entrenarse en críticas cinematográficas de IMDB, puede heredar sesgos de estilo, género o procedencia de los autores de las reseñas.
- **Licencia**: MIT permite uso comercial, pero solo cubre el artefacto publicado; el encoder `all-mpnet-base-v2` se rige por su propia licencia, que no se detalla en la información proporcionada y debe verificarse antes de desplegar.
- **Madurez**: 0 descargas y 0 *likes* en el momento de la consulta, sin revisión por parte de la comunidad; el tamaño del repositorio es de 0,0 GB (solo el clasificador), así que no funciona sin descargar el modelo base.
- **Dependencias frágiles**: `classifier.joblib` se serializó con scikit-learn 1.9.1; cargarlo con otra versión puede producir avisos o errores de compatibilidad. El orden del pipeline (limpieza HTML, minúsculas, mean pooling sin normalización, truncado a 512) debe replicarse exactamente o las probabilidades se degradan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abir71/imdb-sentiment-mpnet
- Demo interactivo en el navegador: https://huggingface.co/spaces/abir71/imdb-sentiment-demo
- Modelo base del encoder: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/stanfordnlp/imdb
- Citación del estudio (sin URL disponible): Hosen A., *Deep learning approaches for sentiment analysis of engaged audience in motion picture realm: a comparative study of traditional and neural network-based classification models*, Research report, Department of ICE, Noakhali Science and Technology University.
- Citación de los datos (sin URL disponible): Maas A. L., Daly R. E., Pham P. T., Huang D., Ng A. Y., Potts C., *Learning word vectors for sentiment analysis*, ACL 2011.
- Búsqueda web: no se han encontrado enlaces adicionales relevantes; los resultados devueltos por el buscador no guardaban relación con este modelo.
