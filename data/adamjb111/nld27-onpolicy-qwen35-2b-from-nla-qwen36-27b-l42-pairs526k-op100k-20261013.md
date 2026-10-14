# adamjb111/nld27-onpolicy-qwen35-2b-from-nla-qwen36-27b-L42-pairs526k-op100k-20261013

## Resumen

Este repositorio aloja un modelo estudiante Qwen3.5-2B destilado a partir de un NLA de 27B, concretamente `ceselder/qwen3.6-27b-nla-rl` (iteración 400, capa 42 de Qwen3.6-27B). No es un modelo de propósito general ni un chatbot: su única función es verbalizar en lenguaje natural un vector residual de 5120 dimensiones extraído de la salida del bloque 42 (último token) de Qwen3.6-27B. Un adaptador entrenado (`final_adapter.pt`) proyecta ese vector a cuatro slots de embedding de entrada, colocados donde el profesor sitúa su token marcador, y el modelo de 2B escribe la explicación correspondiente.

El entrenamiento se hizo en dos fases: una SFT sobre 263.000 explicaciones del profesor (con `top-20` soft targets y peso 0,5, 1,5 pasadas, lr 1e-5 coseno) y una ronda on-policy posterior partiendo del estudiante de 526k, en la que el estudiante generó notas para 100.000 vectores de entrenamiento y el profesor de 27B las re-puntuó (1 pasada, lr 5e-6, peso soft 1,0).

Su relevancia es de investigación en interpretabilidad: permite obtener explicaciones de activaciones internas de un modelo de 27B ejecutando en inferencia un modelo de 2B, lo que abarata el análisis mecanístico. El repositorio es de autor individual (`adamjb111`), con 0 descargas y 0 likes, licencia no especificada y sin pipeline declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen3.5-2B) más adaptador lineal de entrada (`final_adapter.pt`); no se detalla en la model card |
| Parámetros totales | Aproximadamente 2.000 millones (según nomenclatura del modelo); no confirmado en la model card |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo solo publica safetensors; no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (las explicaciones del profesor parecen generarse en inglés, sin confirmación) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 4,0 GB) más `final_adapter.pt` |
| Entrada | Vector residual de 5120 dimensiones (salida del bloque 42, último token) |
| Salida | Texto en lenguaje natural (explicación del vector) |
| Modelo profesor | `ceselder/qwen3.6-27b-nla-rl`, iteración 400, capa 42 de Qwen3.6-27B |
| Fecha de publicación | 2026-10-13 |

## Arquitectura y entrenamiento

La arquitectura combina un modelo de lenguaje decoder-only de 2B (Qwen3.5-2B) con una ruta de entrada no textual: un adaptador que transforma un vector residual de 5120 dimensiones en cuatro embeddings de entrada alineados con la posición del token marcador del profesor. El modelo no recibe texto del usuario, sino activaciones. Los detalles de atención, número de capas y vocabulario del base no se documentan en la model card.

El pipeline de entrenamiento tiene dos etapas. La primera es una destilación supervisada sobre 263.000 explicaciones del profesor, con mezcla de tokens muestreados y `top-20` soft targets a peso 0,5, durante 1,5 pasadas con learning rate 1e-5 y scheduler coseno. La segunda es una ronda on-policy: el estudiante SFT de 526k generó notas para 100.000 vectores del conjunto de entrenamiento, el profesor de 27B las re-puntuó como soft targets y se hizo una pasada adicional con lr 5e-6 y peso soft 1,0. El código de referencia son `scripts/nladistil27b_train_student_20261010.py` (clase `Student`) y `scripts/nladistil27b_common_20261010.py` (clase `Adapter`), dentro del repositorio denominado "lenses". No se documenta uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Verbalización de activaciones: dado un vector residual de la capa 42 de Qwen3.6-27B, genera una explicación textual de qué representa.
- Análisis de representaciones internas para investigación en interpretabilidad mecanística.
- Alineación de un espacio latente de 5120 dimensiones con descripciones en lenguaje natural mediante el adaptador entrenado.
- Generación de texto libre limitada al registro y contenido de las explicaciones del profesor (notas interpretativas).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni planificación.
- No se documenta capacidad multilingüe, visión, audio ni modo de razonamiento explícito.
- No se documenta uso como modelo conversacional ni como modelo de propósito general.

## Casos de uso

- Interpretabilidad mecanística de la capa 42: dado un conjunto de prompts, extraer los residuales del bloque 42 de Qwen3.6-27B y obtener descripciones de qué codifica esa capa en cada caso, sin necesidad de ejecutar un NLA de 27B en cada consulta.
- Auditoría de seguridad y alineación: verbalizar activaciones de prompts sensibles para inspeccionar si el modelo interno representa conceptos de riesgo que no aparecen en la salida textual.
- Construcción de datasets etiquetados: generar explicaciones a escala sobre corpus como FineFineWeb para entrenar clasificadores de características, SAEs o sondas lineales sobre representaciones.
- Monitorización de deriva tras fine-tuning: comparar verbalizaciones de la capa 42 antes y después de un ajuste para detectar cambios en las representaciones internas que no se reflejan en las métricas de tarea.
- Investigación sobre superposición de características: agrupar verbalizaciones de miles de vectores para estudiar si el modelo describe conceptos recurrentes o mezclas difusas.
- Reducción de coste en pipelines de análisis: sustituir el NLA de 27B por el estudiante de 2B en tareas de cribado masivo, reservando el profesor para casos que requieran máxima fidelidad.
- Reproducibilidad académica: replicar el experimento de destilación on-policy usando el dataset `adamjb111/nla-qwen36-27b-L42-distill-data` y los scripts publicados.
- Evaluación comparativa de verbalizadores: medir la pérdida de fidelidad (FVE) frente al profesor al reducir el tamaño del modelo de 27B a 2B.

## Benchmarks y rendimiento

| Evaluación | Modelo | Valor | Conjunto |
|---|---|---|---|
| FVE (fracción de varianza explicada) por la reconstrucción autorregresiva del profesor | Profesor (NLA 27B, iter 400) | 0,754 | 1.020 vectores frescos de FineFineWeb |
| FVE del estudiante | Estudiante 2B | no disponible (la model card remite a `done.json`, no incluido en la información proporcionada) | 1.020 vectores frescos de FineFineWeb |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni ningún benchmark de propósito general. Estos benchmarks no son aplicables al modelo, que no está diseñado para tareas de lenguaje convencionales.

## Requisitos de hardware

- Peso del estudiante en bf16: aproximadamente 4,0 GB (coherente con el tamaño del repositorio), más el adaptador.
- Inferencia del estudiante: cabe holgadamente en GPU de consumo. Una RTX 3060 de 12 GB, una RTX 4070, una RTX 4090 o una RTX 5090 son suficientes; también en CPU con memoria suficiente.
- Requisito adicional crítico: para obtener el vector de entrada hay que ejecutar Qwen3.6-27B y capturar el residual de la capa 42 (5120-d). En bf16 esto supone del orden de 54 GB de VRAM, por lo que se necesita una A100 80 GB, una H100 80 GB, una H200 o varias GPU (por ejemplo, 2 x A6000 de 48 GB). Con cuantización de 8 o 4 bits, la extracción podría caber en una sola GPU de 48 GB o en configuraciones de 24-32 GB, aunque esto no está documentado por el autor.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La ruta prevista es el código propio del repositorio "lenses" (carga del modelo base más `final_adapter.pt`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (estudiante 2B, NLA capa 42) | ~2B | no disponible | FVE del estudiante no publicada en la información disponible | no disponible | safetensors, repo de 4,0 GB |
| `ceselder/qwen3.6-27b-nla-rl` (profesor) | 27B | no disponible | FVE 0,754 en 1.020 vectores de FineFineWeb | no disponible | modelo público referenciado en la model card |
| Estudiante SFT intermedio (526k) citado en la model card | ~2B | no disponible | no disponible | no disponible | sin identificador público en la información disponible |

No se han identificado en la información proporcionada otros verbalizadores de activaciones comparables de terceros.

## Limitaciones y advertencias

- Riesgo alto de alucinación interpretativa: el modelo genera explicaciones plausibles que pueden no corresponder al contenido real del vector. La fidelidad debe medirse con FVE u otras métricas de reconstrucción, no por inspección cualitativa.
- Dependencia del profesor en inferencia: sin ejecutar Qwen3.6-27B no hay vector de entrada, lo que anula la ventaja de coste del estudiante en despliegues aislados.
- Especificidad extrema: el modelo está atado a la capa 42, a la iteración 400 del profesor y a Qwen3.6-27B. No es transferible a otras capas, otros modelos ni otras versiones sin reentrenamiento.
- Licencia no especificada: no hay garantía de uso comercial, y la licencia del modelo base Qwen3.5-2B y del profesor podría imponer condiciones adicionales que la model card no recoge.
- Idiomas no declarados: no se confirma si las explicaciones son solo en inglés.
- Sin resultados del estudiante publicados: la model card remite a `done.json`, ausente en la información disponible, por lo que no puede verificarse la calidad final frente al profesor.
- Repositorio sin tracción: 0 descargas y 0 likes, de autor individual, sin pipeline declarado. No hay evidencia de validación independiente ni de mantenimiento.
- Fecha de publicación futura respecto a la fecha de consulta habitual, dato a tener en cuenta al citar el modelo.
- Ausencia de cuantizaciones publicadas: no hay GGUF ni pesos de 8/4 bits listos para usar.
- No apto para producción como modelo de lenguaje: no soporta chat, tool calling ni generación de propósito general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adamjb111/nld27-onpolicy-qwen35-2b-from-nla-qwen36-27b-L42-pairs526k-op100k-20261013
- Modelo profesor: https://huggingface.co/ceselder/qwen3.6-27b-nla-rl
- Dataset de destilación: https://huggingface.co/datasets/adamjb111/nla-qwen36-27b-L42-distill-data
- Código de entrenamiento (referencia en la model card): `scripts/nladistil27b_train_student_20261010.py`, repositorio "lenses" (URL no disponible)
- Código del adaptador (referencia en la model card): `scripts/nladistil27b_common_20261010.py`, repositorio "lenses" (URL no disponible)
- Resultados de evaluación (referencia en la model card): `done.json` (URL no disponible)
- Paper, blog o demo: no disponible
