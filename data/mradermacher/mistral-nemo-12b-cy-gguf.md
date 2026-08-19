# mradermacher/Mistral-Nemo-12B-CY-GGUF

## Resumen

Este repositorio contiene la cuantización en formato GGUF del modelo `CY1232/Mistral-Nemo-12B-CY`, un merge creado con mergekit a partir de la familia Mistral NeMo de 12B parámetros desarrollada por Mistral AI y NVIDIA. El autor de la cuantización, mradermacher, proporciona once versiones con distintos niveles de compresión, desde Q2_K (4,9 GB) hasta Q8_0 (13,1 GB), lo que permite ejecutar el modelo en hardware muy variado, desde CPU con poca RAM hasta GPUs de gama alta.

El modelo base Mistral NeMo destaca por su ventana de contexto de 128k tokens, razonamiento, conocimiento del mundo y precisión en tareas de código, siendo un reemplazo directo de Mistral 7B con mejor rendimiento. Al tratarse de un merge, las capacidades exactas pueden diferir del original, pero la cuantización GGUF facilita su uso en entornos de producción locales, herramientas como llama.cpp, Ollama o LM Studio, y en equipos sin GPUs dedicadas.

La relevancia actual de este modelo radica en que ofrece un equilibrio entre tamaño (12B) y calidad, con soporte multilingüe (aunque la model card del merge solo indica inglés) y una arquitectura estándar que simplifica su integración en sistemas existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Mistral) |
| Parametros totales | 12B (aprox., basado en Mistral NeMo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128k (según Mistral NeMo; el merge no especifica cambios) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Inglés (según model card del merge; el modelo base es multilingüe) |
| Licencia | No disponible (el modelo base Mistral NeMo usa Apache 2.0, pero el merge no declara licencia) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Mistral NeMo, desarrollado por Mistral AI y NVIDIA, emplea una arquitectura transformer estándar con 12B parámetros y una ventana de contexto de 128k tokens. Fue entrenado con un enfoque multilingüe y optimizado mediante técnicas de RLHF/DPO para mejorar el razonamiento y la generación de código. El merge `CY1232/Mistral-Nemo-12B-CY` se construyó con mergekit, pero no se dispone de documentación sobre los modelos combinados ni el método de fusión exacto. La cuantización GGUF es estática, realizada por mradermacher, y no modifica la arquitectura subyacente, solo reduce la precisión de los pesos para disminuir el uso de memoria.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Mistral NeMo.
- Razonamiento complejo y conocimiento del mundo, con buen rendimiento en tareas de sentido común y matemáticas.
- Generación de código y asistencia en programación, gracias al entrenamiento específico del modelo base.
- Soporte multilingüe en el modelo base (aunque la model card del merge solo declara inglés).
- Capacidad de tool calling y function calling en el modelo base, aunque no se confirma explícitamente para el merge.
- Compatibilidad con frameworks de inferencia GGUF como llama.cpp, Ollama y LM Studio, permitiendo despliegue en CPU y GPU.

## Casos de uso

- Asistente conversacional local: el modelo cuantizado puede ejecutarse en un portátil con 16 GB de RAM usando la versión Q4_K_M (7,6 GB), ofreciendo respuestas fluidas sin depender de la nube.
- Generación de código en entornos sin GPU: con la cuantización Q2_K (4,9 GB) es posible ejecutar el modelo en una CPU moderna para autocompletar código o generar scripts, aunque con menor calidad que las versiones más grandes.
- Prototipado rápido de agentes conversacionales: gracias al formato GGUF, se integra fácilmente con herramientas como Ollama o llama.cpp para crear prototipos de chatbots con contexto largo (hasta 128k tokens) en máquinas de desarrollo.
- Análisis de documentos extensos: la ventana de contexto de 128k permite procesar manuales, contratos o informes largos en una sola pasada, resumiendo o extrayendo información relevante.
- Educación y experimentación: investigadores y estudiantes pueden probar un modelo de 12B en hardware modesto, comparando el efecto de distintas cuantizaciones en la calidad de las respuestas.
- Despliegue en servidores con GPU limitada: la versión Q8_0 (13,1 GB) cabe en una GPU de 16 GB como la RTX 4080 o A10, ofreciendo una calidad cercana al modelo original para aplicaciones de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este merge cuantizado. El modelo base Mistral NeMo reporta cifras competitivas en MMLU, HumanEval y GSM8K, pero no se dispone de datos específicos para `CY1232/Mistral-Nemo-12B-CY` ni para sus versiones GGUF. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: desde 4,9 GB (Q2_K) hasta 13,1 GB (Q8_0). La cuantización Q4_K_M (7,6 GB) es un punto óptimo para GPUs de 8-12 GB.
- GPU recomendadas: RTX 3060 12GB, RTX 4070, RTX 4080, A10, A100 (para las versiones más grandes). Las versiones Q2_K y Q3_K pueden ejecutarse en CPU con 8-16 GB de RAM.
- Compatible con consumer GPU: sí, especialmente las cuantizaciones Q4 y Q5 en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier framework que soporte GGUF.
- Latencia y throughput: no disponibles. Dependen del hardware y la cuantización; en una GPU RTX 4090, un modelo Q4_K_M de 12B suele generar entre 20 y 40 tokens por segundo, pero estos valores son orientativos y no han sido medidos para este merge concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-Nemo-12B-CY (GGUF) | 12B | 128k | No disponible | GGUF | Merge cuantizado, sin benchmarks publicados |
| Mistral 7B Instruct (GGUF) | 7B | 32k | Apache 2.0 | GGUF | Menor capacidad, contexto más corto |
| Llama 3.1 8B Instruct (GGUF) | 8B | 128k | Llama 3.1 | GGUF | Competidor directo, con licencia permisiva |
| Qwen 2.5 14B Instruct (GGUF) | 14B | 128k | Apache 2.0 | GGUF | Mayor tamaño, mejor rendimiento en algunos benchmarks |

La comparativa se basa en características generales; no se dispone de resultados de rendimiento para el merge cuantizado.

## Limitaciones y advertencias

- La cuantización degrada la calidad del modelo; las versiones Q2_K y Q3_K pueden mostrar errores gramaticales o pérdida de coherencia en tareas complejas.
- El merge `CY1232/Mistral-Nemo-12B-CY` no tiene documentación sobre su composición ni su entrenamiento, por lo que su comportamiento puede diferir del Mistral NeMo original.
- La licencia no está especificada en el repositorio; antes de usar el modelo en proyectos comerciales, es necesario verificar la licencia del modelo base y del merge.
- El modelo base Mistral NeMo puede presentar sesgos y alucinaciones, especialmente en temas controvertidos o de actualidad.
- La ventana de contexto de 128k es teórica; en la práctica, el rendimiento puede degradarse con contextos muy largos y el uso de memoria aumenta considerablemente.
- No se han publicado evaluaciones de seguridad ni de sesgos para este merge concreto.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/Mistral-Nemo-12B-CY-GGUF
- Modelo base (merge): https://huggingface.co/CY1232/Mistral-Nemo-12B-CY
- Versión con quants imatrix: https://huggingface.co/mradermacher/Mistral-Nemo-12B-CY-i1-GGUF
- Anuncio oficial de Mistral NeMo: https://mistral.ai/news/mistral-nemo/
- Página de Mistral NeMo en LM Studio: https://lmstudio.ai/models/mistral-nemo
- Modelo ONNX INT4 de NVIDIA: https://catalog.ngc.nvidia.com/orgs/nvidia/models/mistral-nemo-12b-instruct-onnx-int4-rtx
