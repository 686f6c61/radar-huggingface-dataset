# ChitrankDixit/indian-raga-intelligence

## Resumen

Indian Raga Intelligence es un conjunto de checkpoints entrenados para la clasificación de 10 ragas de la música clásica indostaní (Bageshree, Bhairav, Bhairavi, Bhoopali, DarbariKanada, Deshkar, Kafi, Malkauns, Todi y Yaman), además de análisis de similitud melódica entre géneros. Lo publica el usuario ChitrankDixit en Hugging Face bajo licencia MIT y con el pipeline declarado `audio-classification`. No se trata de un modelo de lenguaje generativo, sino de un artefacto de retrieval musical (MIR) compuesto por varios clasificadores ligeros.

El repositorio contiene cuatro ficheros de pesos: un SVM de línea base serializado con joblib (`baseline_svm.joblib`, 0,14 MB), dos modelos híbridos en PyTorch (`hybrid_hindustani_model.pt` y `hybrid_raga_model.pt`, 0,85 MB cada uno) y un modelo basado en características congeladas de MERT (`mert_frozen_hindustani_model.pt`, 1,65 MB). El tamaño total del repo es de 0,0 GB según los metadatos, lo que confirma que son pesos compactos y no un transformer completo.

Es relevante para investigadores y desarrolladores que trabajen en análisis automático de música india, etiquetado de ragas en archivos de audio o sistemas de recomendación musical con criterios melódicos. La información pública disponible es escasa: no se detallan arquitecturas exactas, datos de entrenamiento ni métricas de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (combinación de SVM con scikit-learn y modelos PyTorch; se menciona MERT como extractor congelado en uno de los checkpoints) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de clasificación de audio, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | joblib (SVM) y PyTorch `.pt` (modelos híbridos y MERT congelado) |

## Arquitectura y entrenamiento

La model card describe cuatro checkpoints con estrategias distintas. `baseline_svm.joblib` es un clasificador SVM entrenado con scikit-learn sobre características no especificadas. Los dos modelos `hybrid_*` (0,85 MB) y el `mert_frozen_hindustani_model.pt` (1,65 MB) están implementados en PyTorch; el nombre del último sugiere el uso del modelo MERT (Music undERstanding model with large-scale self-supervised Training) como extractor de características congelado, sobre el que se entrena una cabeza clasificadora ligera.

No se especifican en la información disponible el número de horas de audio de entrenamiento, la composición del dataset, el tipo de características acústicas (mel, CQT, embeddings de MERT) ni si se aplicaron técnicas de aumento de datos o validación cruzada. Tampoco se detalla si la similitud melódica entre géneros se implementa mediante embeddings o mediante distancia entre distribuciones de características.

## Capacidades

- Clasificación de audio en 10 clases de ragas hindustaníes: Bageshree, Bhairav, Bhairavi, Bhoopali, DarbariKanada, Deshkar, Kafi, Malkauns, Todi y Yaman.
- Análisis de similitud melódica entre géneros musicales, según la descripción de la model card.
- Inferencia sobre características extraídas de audio; el checkpoint MERT congelado sugiere uso de embeddings preentrenados de música.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni de visión.
- No se documenta un modo "thinking" ni decodificación especulativa.

## Casos de uso

- Etiquetado automático de archivos de audio en bibliotecas de música clásica india: el clasificador de 10 clases permite asignar un raga a cada grabación y facilitar la catalogación de archivos etiquetados manualmente o sin metadatos.
- Sistemas de recomendación musical basados en similitud melódica: la funcionalidad de cross-genre melodic similarity permite agrupar piezas de distintos géneros que comparten estructuras melódicas, útil en plataformas de descubrimiento musical.
- Herramientas educativas para estudiantes de música indostaní: un clasificador ligero puede integrarse en aplicaciones que identifiquen el raga de una interpretación grabada por el alumno y comparen con la referencia.
- Investigación en musicología computacional: los checkpoints sirven como línea base reproducible (SVM y modelos con MERT congelado) para comparar nuevas aproximaciones en reconocimiento de ragas.
- Análisis de archivos etnográficos y colecciones de campo: clasificación rápida de grabaciones históricas para priorizar revisiones musicológicas.
- Integración en pipelines de MIR (music information retrieval): el modelo puede actuar como módulo de clasificación de ragas dentro de un sistema mayor que combine detección de tempo, tonalidad y estructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los checkpoints son muy ligeros (0,14 MB a 1,65 MB), por lo que la inferencia puede ejecutarse en CPU sin GPU dedicada.
- No se requiere VRAM significativa; cualquier GPU consumer (por ejemplo, GTX 1650 o superior) puede ejecutar los modelos PyTorch, aunque probablemente no sea necesario.
- El checkpoint basado en MERT congelado requiere cargar el extractor MERT subyacente, cuyo tamaño no se especifica en la información disponible; si se usa el MERT completo, la VRAM dependerá de ese modelo base.
- Opciones de despliegue: Python con `torch`, `scikit-learn` y `joblib`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Indian Raga Intelligence (este) | Clasificación de 10 ragas + similitud melódica | No disponible (checkpoints de 0,14–1,65 MB) | No aplica | MIT | Hugging Face |
| MERT (Music undERstanding model) | Embeddings musicales auto-supervisados | No disponible en la información | No aplica | No disponible en la información | Hugging Face |
| Modelos genéricos de clasificación de género musical (p. ej. basados en CNN sobre mel-espectrogramas) | Clasificación de géneros occidentales | No disponible | No aplica | Variable | Variable |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas específicas de reconocimiento de ragas.

## Limitaciones y advertencias

- La información pública es muy escasa: no se documentan métricas de precisión, recall ni F1 por clase, lo que impide evaluar su fiabilidad real.
- El conjunto de clases está limitado a 10 ragas; ragas fuera de esa lista no serán reconocidos correctamente.
- No se especifica el dominio de entrenamiento (instrumentación, calidad de grabación, duración de los fragmentos), por lo que el rendimiento puede degradarse en grabaciones de campo o con ruido.
- Riesgo de sesgo hacia las interpretaciones incluidas en el dataset de entrenamiento (posiblemente un subconjunto de artistas o estilos).
- La licencia MIT permite uso comercial, pero al no documentarse el origen de los datos de entrenamiento no puede garantizarse la ausencia de restricciones sobre el audio utilizado.
- El checkpoint `mert_frozen_hindustani_model.pt` depende de MERT; deben respetarse las licencias del modelo base subyacente, que no se detallan.
- No apto para generación de audio, texto ni tareas fuera de la clasificación y similitud melódica.

## Enlaces

- [Hugging Face: ChitrankDixit/indian-raga-intelligence](https://huggingface.co/ChitrankDixit/indian-raga-intelligence)
