# fefofico/nuclear_trained_harrier_end-end-false

## Resumen

`fefofico/nuclear_trained_harrier_end-end-false` es un clasificador de texto binario construido con la técnica SetFit sobre el modelo de embeddings `microsoft/harrier-oss-v1-0.6b`. Lo desarrolla el usuario `fefofico` y su propósito es clasificar fragmentos de noticias y textos geopoliticos en dos clases (`positive` / `negative`) relacionadas con contenido nuclear: proliferación, programas de armamento, declaraciones de Estados y acuerdos internacionales. SetFit combina un ajuste fino contrastivo del sentence transformer con una cabeza de regresión logística, lo que permite obtener buenos resultados con muy pocas muestras etiquetadas por clase.

El modelo no es un generador de texto ni un LLM conversacional: es un encoder de unos 596 millones de parámetros (arquitectura derivada de Qwen3, según los tags) que produce embeddings de frases y los pasa por un clasificador lineal entrenado con scikit-learn. Su ventana máxima declarada es de 32.768 tokens, aunque en la práctica la clasificación se hace sobre el embedding agregado de la secuencia. El repositorio ocupa 1,2 GB y se publica con formato safetensors.

Su relevancia es acotada pero concreta: demuestra un flujo de trabajo de few-shot learning sin prompts para una tarea de dominio muy específico (monitorización de narrativa nuclear), con métricas declaradas de F1 macro en torno a 0,90 sobre un conjunto de test no identificado. Es útil como referencia para quien quiera replicar la receta SetFit con un encoder moderno y como componente de un pipeline de filtrado o triaje documental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit sobre sentence transformer (encoder derivado de Qwen3, según tags) + cabeza LogisticRegression |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (máximo de secuencia declarado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | setfit (compatible con sentence-transformers, text-embeddings-inference) |
| Clases | 2 (`positive`, `negative`) |
| Tamano del repo | 1,2 GB |

## Arquitectura y entrenamiento

El modelo sigue el esquema SetFit en dos fases descrito en el paper *Efficient Few-Shot Learning Without Prompts* (arXiv:2209.11055). Primero se ajusta el sentence transformer base (`microsoft/harrier-oss-v1-0.6b`) con aprendizaje contrastivo a partir de pares de frases generados desde las muestras etiquetadas; después se extraen los embeddings de esas frases y se entrena una regresión logística (scikit-learn) como cabeza de clasificación. No hay generación de texto ni decodificación: la inferencia consiste en un forward del encoder y una predicción lineal sobre el vector resultante.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el número de muestras por clase ni si hubo etapas adicionales de ajuste. La model card solo indica que se trata de una tarea binaria con ejemplos de temática nuclear (declaraciones sobre la NPT, programas de Irán y Corea del Norte, fuerzas de disuasión francesas) y que el conjunto de evaluación figura como "Unknown" en el model-index. El encoder base es un modelo de embeddings de 0,6B parámetros, lo que sitúa el coste computacional muy por debajo de un LLM generativo equivalente.

## Capacidades

- Clasificación binaria de texto (`positive` / `negative`) en la temática nuclear y geopolítica definida por los ejemplos de la model card.
- Codificación de frases en vectores densos mediante el sentence transformer subyacente, reutilizable para búsqueda semántica o clustering.
- Aprendizaje few-shot: la receta SetFit permite reentrenar la cabeza con pocas muestras nuevas sin reentrenar el encoder completo.
- Compatibilidad con `text-embeddings-inference` y endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un modelo generativo: no produce texto libre ni mantiene conversaciones.
- Capacidades multilingües: no disponibles (no declaradas).

## Casos de uso

- Triaje de noticias geopoliticas: clasificar titulares y párrafos de agencias para separar piezas que mencionan programas nucleares o disuasión de las que no, antes de pasarlas a un analista humano.
- Monitorización de narrativa en medios: alimentar un pipeline que etiquete artículos sobre la NPT, el AUKUS o el programa iraní y agregue tendencias por país y periodo.
- Filtrado previo en datasets de investigación: descartar documentos irrelevantes de un corpus amplio antes de aplicar análisis más costosos (LLMs, anotación manual).
- Enrutado en sistemas RAG: usar la etiqueta para decidir si un fragmento recuperado debe entrar en el contexto de un asistente especializado en no proliferación.
- Detección de declaraciones oficiales: clasificar comunicados y transcripciones de portavoces según su relevancia para políticas de armamento, con umbral ajustable sobre la probabilidad de la regresión logística.
- Componente de un clasificador jerárquico: usar esta salida como primer nivel y encadenar clasificadores más finos (tipo de arma, país, marco legal) sobre los documentos positivos.
- Prototipado rápido de etiquetado: servir como línea base en proyectos con pocos datos etiquetados, ya que SetFit permite añadir ejemplos y reentrenar la cabeza en minutos.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, conjunto de test no identificado):

| Metrica | Valor |
|---|---|
| F1 macro | 0,9027 |
| F1 binario | 0,9021 |

No se han publicado resultados comparativos con otros modelos ni desglose por clase en la información disponible.

## Requisitos de hardware

- Inferencia en CPU viable: con 596 M parámetros y pesos en fp32 el modelo ocupa aproximadamente 2,4 GB en memoria; el repositorio de 1,2 GB sugiere pesos en fp16/bf16.
- VRAM estimada en GPU: en torno a 2-3 GB en fp16, más el overhead del runtime; cabe holgadamente en cualquier GPU consumer con 8 GB o más (RTX 3060, 4060, 4090).
- GPU recomendadas para despliegue con concurrencia: T4, L4, A10G o A100/H100 si se sirve a gran escala; para uso puntual, cualquier GPU consumer moderna es suficiente.
- Opciones de despliegue: `setfit` + `sentence-transformers` en Python, `text-embeddings-inference` para servir el encoder, y endpoints de Hugging Face (tag `endpoints_compatible`). No hay pesos GGUF publicados, por lo que llama.cpp u Ollama no aplican directamente.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del encoder se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | F1 declarado | Licencia |
|---|---|---|---|---|---|
| fefofico/nuclear_trained_harrier_end-end-false | SetFit (encoder + LogReg) | 596 M | 32.768 | 0,9027 (macro) | no disponible |
| microsoft/harrier-oss-v1-0.6b (base) | Sentence transformer | ~600 M | no disponible | no aplica (no clasificador) | no disponible |
| SetFit con MiniLM (p. ej. all-MiniLM-L6-v2) | SetFit (encoder + LogReg) | ~22 M | 256-512 | no disponible | Apache-2.0 (típicamente) |
| Clasificador zero-shot con LLM (p. ej. Qwen3 pequeño) | Generativo | variable | variable | no disponible | variable |

La comparación directa con alternativas es limitada porque no se han publicado métricas de otros clasificadores sobre el mismo conjunto de test. Frente a un SetFit con MiniLM, este modelo ofrece un encoder mucho mayor y contexto más largo a cambio de más memoria y latencia; frente a clasificación zero-shot con un LLM, requiere datos etiquetados pero es órdenes de magnitud más barato en inferencia.

## Limitaciones y advertencias

- El conjunto de evaluación figura como "Unknown": las métricas de F1 no son reproducibles ni comparables con otros trabajos.
- Solo dos clases y un dominio muy estrecho (texto nuclear/geopolítico); el rendimiento fuera de ese dominio es impredecible.
- No se declara licencia, lo que impide asumir uso comercial sin contactar con el autor.
- No se declaran idiomas soportados; los ejemplos de la model card están en inglés, por lo que el comportamiento en castellano no está garantizado.
- Riesgo de falsos positivos/negativos en textos ambiguos (menciones metafóricas, contexto histórico) inherente a un clasificador lineal sobre embeddings.
- Sesgos potenciales derivados de la selección de ejemplos de entrenamiento (fuentes y encuadres periodísticos concretos), no documentados.
- No apto para generación de texto, resumen ni respuesta a preguntas: es exclusivamente un clasificador.
- El nombre del repositorio (`end-end-false`) y la ausencia de documentación adicional sugieren un experimento personal más que un artefacto listo para producción; conviene validar con datos propios antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fefofico/nuclear_trained_harrier_end-end-false
- Modelo base: https://huggingface.co/microsoft/harrier-oss-v1-0.6b
- Repositorio SetFit: https://github.com/huggingface/setfit
- Paper SetFit: https://arxiv.org/abs/2209.11055
- Blog SetFit: https://huggingface.co/blog/setfit
- Documentación Sentence Transformers: https://www.sbert.net
- Regresión logística (scikit-learn): https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html
