# Radioactive012/news-classifier-models

## Resumen

News Classifier models es un repositorio publicado por el usuario Radioactive012 en Hugging Face que agrupa dos artefactos de clasificación de texto para noticias en inglés. El primero es un DistilBERT afinado sobre corpus de BBC News (2004-05) y HuffPost (2012-22), exportado a ONNX y cuantizado a int8, con una precisión de test reportada del 89,2 %. El segundo es un baseline clásico de TF-IDF más regresión logística entrenado con scikit-learn 1.7.2.

El modelo resuelve una tarea acotada: asignar un artículo periodístico a una de cinco categorías (business, entertainment, politics, sport o tech). Por su tamaño (0,1 GB de repositorio) y su formato (ONNX int8 y joblib), está pensado para inferencia ligera en CPU, no para despliegues de gran escala con GPU. Se trata de un proyecto académico, sin descargas ni likes en el momento de la consulta, lo que implica que no cuenta con validación comunitaria.

Es relevante para desarrolladores que necesiten un clasificador de tópicos rápido y de bajo coste como componente de un pipeline de ingestión de noticias, o como referencia de comparación frente a baselines lineales. No debe confundirse con un modelo generativo ni con un LLM: es un encoder de clasificación con cinco etiquetas fijas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado) para el artefacto ONNX; TF-IDF + regresión logística para el baseline joblib |
| Parametros totales | no disponible (DistilBERT canónico tiene ~66 M, pero no se confirma en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT canónico admite 512 tokens, sin confirmación en la card) |
| Tipos de cuantizacion | int8 para el modelo ONNX; el baseline joblib no se cuantiza |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | ONNX (`distilbert_onnx/model.onnx`) y joblib (`baseline.joblib`) |

## Arquitectura y entrenamiento

El artefacto principal es un DistilBERT, un transformer encoder de tipo BERT destilado, afinado para clasificación de texto con cinco clases. Según la model card, el ajuste fino se realizó sobre una combinación de BBC News (2004-05) y HuffPost (2012-22), y posteriormente el modelo se exportó a ONNX y se cuantizó a int8, lo que reduce el tamaño y acelera la inferencia en CPU. La precisión de test reportada para esta versión es del 89,2 %.

El segundo artefacto es un baseline de TF-IDF más regresión logística, implementado con scikit-learn 1.7.2 y serializado en joblib. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de regularización adicionales, aumento de datos o ajuste de hiperparámetros. Tampoco se documenta ninguna innovación técnica más allá de la cuantización int8 del export ONNX.

## Capacidades

- Clasificación de texto multietiqueta cerrada: asigna un artículo a business, entertainment, politics, sport o tech.
- Inferencia ligera en CPU gracias al formato ONNX int8 y al baseline joblib.
- Procesamiento de texto en inglés exclusivamente.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step; es un clasificador de una sola pasada.
- No tiene modo thinking, visión, audio ni generación de texto libre.
- El baseline TF-IDF + regresión logística ofrece una alternativa interpretable y de muy bajo coste computacional.

## Casos de uso

- Ingestión y enrutado de noticias: clasificar titulares y cuerpos de artículo entrantes en cinco secciones para dirigirlos al equipo editorial o al canal correspondiente, usando el ONNX int8 para mantener el coste por artículo bajo.
- Filtrado temático en agregadores: descartar o priorizar artículos de tech y business en un feed personalizado, con el baseline joblib como primera pasada barata y el DistilBERT como segunda pasada de mayor precisión.
- Etiquetado de corpus históricos: procesar archivos de prensa en inglés (por ejemplo, colecciones tipo BBC o HuffPost) para construir índices temáticos, aprovechando que el modelo fue afinado sobre dominios periodísticos similares.
- Moderación y organización de contenido en comunidades: clasificar enlaces enviados por usuarios en foros o boletines para asignarles categoría antes de la revisión humana.
- Benchmark de referencia interna: usar el baseline TF-IDF + regresión logística como suelo de rendimiento al evaluar clasificadores más grandes en una tarea de cinco clases, comparando precisión y latencia.
- Prototipado académico y docencia: servir como ejemplo reproducible de pipeline completo (afinado, export ONNX, cuantización int8, baseline clásico) en asignaturas de NLP o aprendizaje automático.
- Clasificación en entornos con recursos limitados: desplegar en contenedores sin GPU o en dispositivos edge donde un transformer completo no cabría, gracias al formato ONNX int8.

## Benchmarks y rendimiento

| Modelo / artefacto | Tarea | Métrica | Resultado |
|---|---|---|---|
| DistilBERT ONNX int8 | Clasificación de noticias en 5 clases | Precisión de test | 89,2 % |
| Baseline TF-IDF + Logistic Regression | Clasificación de noticias en 5 clases | Precisión de test | no disponible |

No se han publicado resultados de benchmarks en la informacion disponible más allá de la precisión de test del 89,2 % para el DistilBERT ONNX int8. No hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y la cuantización int8, el modelo ONNX debería caber holgadamente en memoria de CPU y en GPUs de gama baja.
- GPU recomendadas: no disponible; el formato ONNX int8 está orientado a ejecución en CPU, por lo que no se documenta una GPU mínima.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU de consumo con unos pocos GB de memoria, aunque el autor no lo confirma.
- Opciones de despliegue: ONNX Runtime para el artefacto `distilbert_onnx/model.onnx`; joblib/scikit-learn para `baseline.joblib`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| News Classifier models (este) | no disponible (DistilBERT) | no disponible | 89,2 % de precisión de test (ONNX int8) | MIT | Hugging Face |
| DistilBERT base (Sanh et al.) | ~66 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| BERT base | ~110 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| TF-IDF + Logistic Regression (baseline incluido) | no aplica | no aplica | no disponible | MIT (en este repo) | Incluido en el repo |

La comparación con DistilBERT base y BERT base es estructural: este repositorio parte de un DistilBERT afinado, pero la model card no ofrece métricas frente a esos checkpoints originales. No se dispone de datos para comparar con clasificadores de noticias alternativos publicados en Hugging Face.

## Limitaciones y advertencias

- Proyecto académico sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Idiomas: solo inglés; no se ha entrenado ni evaluado para castellano u otras lenguas.
- Dominio acotado: cinco categorías fijas (business, entertainment, politics, sport, tech); no cubre otras secciones periodísticas ni tareas generativas.
- Datos de entrenamiento limitados a BBC News (2004-05) y HuffPost (2012-22): posible desviación hacia el estilo, vocabulario y sesgos editoriales de esas fuentes, y menor robustez ante prensa de otras regiones o épocas.
- Riesgo de error en textos ambiguos o híbridos (por ejemplo, tecnología financiera o política deportiva), sin datos publicados de matriz de confusión por clase.
- La cuantización int8 puede degradar ligeramente la precisión respecto al modelo en coma flotante; la card solo reporta el resultado de la versión int8.
- Sin documentación sobre sesgos demográficos o políticos, calibración de probabilidades ni evaluación fuera de distribución.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar el aviso de copyright y verificar las licencias de los datasets originales (BBC News y HuffPost) antes de redistribuir derivados.
- No apto para producción crítica sin una evaluación propia sobre el corpus objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/Radioactive012/news-classifier-models
- Model card del autor: incluida en la página de Hugging Face arriba enlazada
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
