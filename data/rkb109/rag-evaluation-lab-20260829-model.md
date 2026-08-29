# RKB109/rag-evaluation-lab-20260829-model

## Resumen

RKB109/rag-evaluation-lab-20260829-model es un prototipo de modelo de clasificación de texto diseñado específicamente para la evaluación de sistemas de retrieval-augmented generation (RAG). Lo desarrolla el autor RKB109 como parte de un laboratorio de evaluación de RAG, con el objetivo de proporcionar una línea base transparente y reproducible para medir la calidad de sistemas RAG que, según la descripción, "a menudo se publican sin un conjunto de regresión estable ni una taxonomía de fallos". El modelo combina pesos de tokens por etiqueta con recuperación de evidencia ponderada por IDF (inverse document frequency), y no depende de un LLM alojado externamente.

Se trata de un modelo pequeño, de naturaleza sintética y educativa, pensado para demostraciones de arquitectura, integración en pipelines de CI, comparaciones baseline y experimentación formativa. No es un modelo de producción ni pretende serlo: su dataset de entrenamiento es sintético y reducido, y su evaluación se limita a 4 ejemplos de validación con una precisión del 0,75. Su relevancia actual radica en servir como ejemplo de cómo estructurar un harness de evaluación para RAG, más que como un modelo con capacidades lingüísticas generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de texto con pesos por etiqueta y recuperacion de evidencia ponderada por IDF (no es un transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | JSON (formato de modelo propio, segun repositorio de reproducibilidad) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un modelo de lenguaje de gran escala. Segun la model card, el modelo combina pesos de tokens por etiqueta con recuperacion de evidencia ponderada por IDF. Esto sugiere un enfoque clasico de bolsa de palabras con pesos estadisticos, donde cada etiqueta (probablemente categorias de fallo en sistemas RAG) tiene asociados pesos de tokens, y la evidencia se recupera mediante un esquema IDF. No se especifican datos de entrenamiento detallados, pero el dataset asociado (RKB109/rag-evaluation-lab-20260829-dataset) es sintetico y pequeno. No se menciona uso de RLHF, DPO ni tecnicas de aprendizaje profundo. La innovacion principal no esta en la arquitectura, sino en la transparencia y reproducibilidad del proceso de evaluacion: el repositorio de GitHub incluye `train.py`, el split exacto del dataset, el codigo de evaluacion y el formato JSON del modelo.

## Capacidades

- Clasificacion de texto para taxonomias de fallo en sistemas RAG (por ejemplo, errores de recuperacion, generacion, citacion).
- Recuperacion de evidencia ponderada por IDF para justificar la clasificacion.
- Evaluacion de calidad de respuestas generadas por RAG en tareas de question-answering, text-ranking y summarization, segun los tags de Hugging Face.
- Funciona como baseline local sin necesidad de llamadas a APIs externas ni GPU.
- Reproducible: el codigo de entrenamiento y evaluacion esta disponible en GitHub.

## Casos de uso

- Prototipado de arquitectura de evaluacion: el modelo sirve para validar el diseno de un harness de evaluacion de RAG antes de invertir en modelos grandes.
- Integracion en pipelines de CI/CD: se puede ejecutar como un paso de validacion rapida para detectar regresiones en sistemas RAG, gracias a su bajo coste computacional.
- Comparacion de lineas base: permite establecer un punto de referencia local contra el que comparar modelos de evaluacion mas complejos.
- Experimentacion educativa: util en cursos o talleres sobre evaluacion de RAG, ya que el codigo y el dataset son abiertos y pequenos.
- Pruebas de concepto de taxonomia de fallos: ayuda a definir y probar categorias de error en sistemas RAG antes de escalar a datasets reales.
- Validacion de metricas de evaluacion: permite comprobar si metricas como `failure_class_accuracy`, `citation_coverage` o `release_gate_pass_rate` se comportan correctamente en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica una evaluacion sobre 4 ejemplos sinteticos de validacion con una precision (accuracy) de 0,75, pero no se proporcionan comparaciones con otros modelos ni resultados en benchmarks estandar como MMLU, HumanEval o GSM8K. Dado el tamano y la naturaleza del modelo, no es comparable con LLMs convencionales.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es un clasificador ligero basado en pesos de tokens, no requiere GPU.
- GPU recomendadas: ninguna; se puede ejecutar en CPU.
- Compatibilidad con hardware de consumo: total; funciona en cualquier maquina con Python.
- Opciones de despliegue: ejecucion local mediante el codigo del repositorio de GitHub; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles, pero se espera que sean minimos al tratarse de un modelo de tamano reducido.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la misma categoria (evaluacion de RAG con enfoque de pesos por etiqueta e IDF) en la informacion proporcionada. Los repositorios de GitHub relacionados (gratycodes/rag-evaluation-lab y ramirez-ai-labs/rag-evaluation-lab) son proyectos de evaluacion de RAG, pero no modelos publicados en Hugging Face con caracteristicas equivalentes.

## Limitaciones y advertencias

- El dataset es sintetico y muy pequeno (4 ejemplos de validacion); no es representativo de casos reales de produccion.
- La model card advierte explicitamente: "no use este modelo para decisiones de consecuencias sin datos representativos, revision de expertos y evaluacion de nivel de produccion".
- No es un modelo de lenguaje; no genera texto ni comprende lenguaje natural de forma general.
- No se especifican sesgos conocidos, pero al estar entrenado con datos sinteticos, puede no generalizar a dominios reales.
- La licencia MIT permite uso comercial, pero el modelo no esta disenado para entornos de produccion.
- No hay informacion sobre alucinacion, ya que no es un modelo generativo.
- La precision de 0,75 sobre 4 ejemplos no es estadisticamente significativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RKB109/rag-evaluation-lab-20260829-model
- Dataset asociado: https://huggingface.co/datasets/RKB109/rag-evaluation-lab-20260829-dataset
- Repositorio de GitHub (mencionado en la model card, no se proporciona URL directa; se infiere de la seccion de reproducibilidad): no disponible en la informacion extraida
- Repositorio relacionado (gratycodes/rag-evaluation-lab): https://github.com/gratycodes/rag-evaluation-lab
- Repositorio relacionado (ramirez-ai-labs/rag-evaluation-lab): https://github.com/ramirez-ai-labs/rag-evaluation-lab
- Guia de evaluacion de RAG (Evidently AI): https://www.evidentlyai.com/llm-guide/rag-evaluation
