# NicoloLocatelli/EulerCAD-Deep-SIGReg

## Resumen

EulerCAD-Deep-SIGReg es un modelo transformer de 36,9 millones de parámetros entrenado para representar modelos CAD (diseño asistido por ordenador) como grafos y generar secuencias de operaciones de construcción. Lo desarrolla NicoloLocatelli y parte de su modelo previo EulerCAD-Deep, al que se le aplica un ajuste fino con la pérdida SIGReg propuesta en LeJEPA (arXiv:2511.08544), una regularización que empuja los embeddings de cada lote hacia una distribución gaussiana isotrópica.

El modelo no es un LLM de propósito general: es un encoder/decoder específico de dominio que trabaja sobre grafos de operaciones CAD, con 14 capas de anchura 384 y una ventana de contexto definida por la longitud de la secuencia de filas del grafo, no por tokens de texto. Su relevancia está en el ámbito de la investigación en representaciones auto-supervisadas de geometría 3D y en la aplicación de técnicas de embedding isotrópico (SIGReg) a dominios estructurados.

El ajuste fino añade 20.000 actualizaciones sobre los pesos de EulerCAD-Deep con una pérdida combinada `(1 - w) * next_row + w * SIGReg` con `w = 0.018`, lo que sitúa la contribución de SIGReg en aproximadamente el 10% de la pérdida al inicio del entrenamiento. El resultado es una mejora en la recuperación de vistas de objetos 3D (mAP 0,268 frente a 0,250 de Deep) a costa de un ligero descenso en recall@1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (14 capas, anchura 384) sobre grafos de operaciones CAD |
| Parametros totales | 36.850.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (secuencia de filas del grafo, no tokens de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de dominio CAD, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La red es un transformer de 14 capas con anchura 384 (36,9 M de parámetros) que procesa grafos de operaciones CAD representados como secuencias de filas. El objetivo principal es `next_row`, es decir, la predicción de la siguiente fila del grafo, lo que equivale a predecir la siguiente operación de construcción del modelo CAD. El ajuste fino parte de los pesos de EulerCAD-Deep y ejecuta 20.000 actualizaciones adicionales con lotes de 160 dibujos.

La innovación principal es la incorporación de SIGReg (de LeJEPA): se toma un vector por dibujo (la media de los estados ocultos sobre su recorrido) en la salida de cada una de las 14 capas y de la normalización final, lo que da 15 lecturas. Cada lectura se centra sobre el lote y se divide por una desviación estándar antes de aplicar SIGReg. El optimizador es Muon, con una tasa de aprendizaje máxima de 3e-4 tras 250 actualizaciones de calentamiento, plana durante la primera mitad y con decaimiento lineal a cero en la segunda. El mejor checkpoint según la pérdida de validación de `next_row` es el último (actualización 20.000, pérdida 0,7191), frente a 0,7144 de Deep y 0,7154 del mismo ajuste fino sin SIGReg.

## Capacidades

- Predicción de la siguiente fila de un grafo de operaciones CAD (objetivo `next_row`).
- Representación auto-supervisada de modelos CAD como embeddings de 384 dimensiones.
- Recuperación de vistas de un mismo objeto 3D mediante similitud de embeddings (evaluada en capa 7).
- Generación de secuencias de operaciones de construcción a partir de un contexto de grafo.
- Análisis de la estructura de embeddings por capa (rank efectivo, isotropía).
- No soporta tool calling, function calling, agentes, visión, audio ni capacidades multilingües: es un modelo de dominio específico.

## Casos de uso

- Recuperación de modelos CAD similares: los embeddings del modelo permiten indexar piezas y recuperar las más parecidas por similitud vectorial, con mAP de 0,268 en validación sobre vistas de un mismo objeto.
- Detección de duplicados en repositorios CAD: comparar embeddings de operaciones de construcción para identificar piezas que, pese a nombres distintos, siguen la misma secuencia de construcción.
- Asistencia a la construcción de modelos CAD: dado un grafo parcial de operaciones, predecir la siguiente fila (`next_row`) para sugerir el siguiente paso al diseñador.
- Investigación en representaciones auto-supervisadas: servir como referencia para estudiar el efecto de SIGReg sobre el rank efectivo y la isotropía de embeddings en dominios estructurados.
- Clasificación y agrupamiento de piezas: usar los embeddings de la capa 7 para agrupar modelos por familia de construcción sin etiquetas.
- Evaluación de técnicas de regularización: comparar Deep frente a Deep-SIGReg en tareas de recuperación (mAP, recall@1, recall@10) para medir el compromiso entre ranking global y precisión del primer resultado.
- Preprocesado de pipelines de generación CAD: como encoder previo a un generador de geometría que consuma las representaciones latentes.

## Benchmarks y rendimiento

Resultados de recuperación de las otras vistas de cada objeto 3D en el split de validación, en la capa 7 (la mejor para ambos modelos):

| Modelo | mAP | recall@1 | recall@10 |
|---|---:|---:|---:|
| Deep | 0,250 | 0,538 | 0,760 |
| Deep-SIGReg | 0,268 | 0,505 | 0,734 |

Pérdida de validación de `next_row`:

| Modelo | Pérdida |
|---|---:|
| Deep | 0,7144 |
| Ajuste fino sin SIGReg | 0,7154 |
| Deep-SIGReg | 0,7191 |

SIGReg medio sobre los lotes de entrenamiento: 1,60 en Deep frente a 0,94 en Deep-SIGReg. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no serían aplicables a un modelo de dominio CAD.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (36,9 M de parámetros, unos 147 MB de pesos); en fp16 unos 74 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere A100 ni H100.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: el repositorio oficial (github.com/NicoloLocatelli/EulerCAD) con `uv run eulercad analyze`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | mAP (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EulerCAD-Deep-SIGReg | 36,9 M | no disponible | 0,268 | MIT | Hugging Face |
| EulerCAD-Deep | 36,9 M | no disponible | 0,250 | MIT (según repo base) | Hugging Face |
| Ajuste fino sin SIGReg | 36,9 M | no disponible | no disponible | MIT | no publicado como checkpoint |

No se dispone de información sobre otros modelos comparables de representación CAD en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo de dominio muy específico (grafos CAD); no es un LLM y no genera texto libre.
- El ajuste con SIGReg mejora el mAP global pero reduce el recall@1 (0,505 frente a 0,538) y el recall@10 (0,734 frente a 0,760): el primer resultado es correcto con menos frecuencia.
- La pérdida de validación de `next_row` empeora ligeramente frente a Deep (0,7191 frente a 0,7144) y frente al ajuste sin SIGReg (0,7154).
- Los datos de entrenamiento derivan de ABC, cuyos modelos CAD pertenecen a sus creadores bajo los Términos de uso de Onshape (sección 1.g.ii); la licencia MIT cubre pesos y código, pero no necesariamente los datos.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no opera sobre lenguaje natural.
- Sin variantes cuantizadas publicadas ni soporte documentado en frameworks de inferencia estándar (vLLM, llama.cpp, TGI).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación externa muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NicoloLocatelli/EulerCAD-Deep-SIGReg
- Modelo base: https://huggingface.co/NicoloLocatelli/EulerCAD-Deep
- Dataset: https://huggingface.co/datasets/NicoloLocatelli/EulerCAD-ABC-Preprocessed
- Paper LeJEPA (SIGReg): https://arxiv.org/abs/2511.08544
- Código, entrenamiento y análisis: https://github.com/NicoloLocatelli/EulerCAD
- Términos de uso de Onshape: https://www.onshape.com/legal/terms-of-use
