# praiselab-picuslab/benchmark-slm-msmarco-sheared-llama-ft

## Resumen

El modelo `praiselab-picuslab/benchmark-slm-msmarco-sheared-llama-ft` es un adaptador LoRA publicado con PEFT sobre el modelo base `princeton-nlp/Sheared-LLaMA-1.3B`. Se enmarca en el proyecto `benchmark-slm`, dentro de la estrategia `strategy-ft`, y utiliza el dataset `microsoft/ms_marco` como referencia para tareas de generación de texto en inglés.

El repositorio contiene únicamente el adaptador, con un tamaño de 0,0 GB, y el acceso está restringido en HuggingFace: es necesario aceptar las condiciones de uso para descargarlo. No se trata de un modelo completo ni de un asistente conversacional autónomo, sino de un artefacto de fine-tuning que debe cargarse junto con el modelo base.

Su relevancia es principalmente experimental: permite reproducir y comparar estrategias de ajuste fino de bajo rango en un modelo pequeño de 1,3 mil millones de parámetros, evaluar el comportamiento sobre MS MARCO y estudiar la adaptación de dominio frente al modelo base. No se han publicado métricas de rendimiento, licencia ni detalles completos del entrenamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; modelo base `princeton-nlp/Sheared-LLaMA-1.3B` |
| Parámetros totales | No disponible para el adaptador; el modelo base tiene 1,3 mil millones de parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible; el adaptador se distribuye en safetensors y no se especifican cuantizaciones del modelo base |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |
| Tamaño del repositorio | 0,0 GB según HuggingFace |
| Acceso | Restringido (gated); requiere aceptar condiciones en HuggingFace |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA sobre `princeton-nlp/Sheared-LLaMA-1.3B`, un transformer decoder-only de 1,3 mil millones de parámetros. LoRA congela los pesos del modelo base e introduce matrices de bajo rango entrenables, lo que reduce el número de parámetros actualizados y el coste de almacenamiento del adaptador. El repositorio se publica con la librería PEFT y formato safetensors.

El entrenamiento se asocia al dataset `microsoft/ms_marco` y a la estrategia identificada como `strategy-ft` dentro del proyecto `benchmark-slm`. No se documentan en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset, el uso de RLHF/DPO, hiperparámetros de LoRA ni innovaciones técnicas adicionales. Tampoco se especifica si el adaptador debe combinarse con el modelo base mediante `merge_and_unload` o cargarse en modo PEFT en tiempo de inferencia.

## Capacidades

- Generación de texto en inglés sobre el modelo base `Sheared-LLaMA-1.3B`.
- Adaptación específica para el benchmark `benchmark-slm` sobre el dataset MS MARCO, según las etiquetas del repositorio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, planificación multi-paso ni razonamiento explícito.
- No se documentan capacidades de visión, audio, modo thinking ni otras modalidades.
- El soporte multilingüe se limita al inglés según el campo de idiomas del repositorio.
- Al ser un adaptador, no funciona como modelo autónomo: requiere cargar el modelo base y aplicar el adaptador con PEFT.

## Casos de uso

- Evaluación reproducible de estrategias de fine-tuning: cargar el modelo base y el adaptador con PEFT, ejecutar un conjunto fijo de prompts en inglés y comparar las salidas frente al modelo sin adaptar. Es adecuado porque el artefacto está pensado como parte de un benchmark de modelos pequeños.
- Ablación de hiperparámetros LoRA: utilizar este adaptador como referencia en experimentos que varíen rango, alpha, tasa de aprendizaje o capas adaptadas. Su tamaño reducido facilita repetir ejecuciones y almacenar variantes.
- Estudio de adaptación de dominio sobre MS MARCO: medir cambios en la generación de texto en inglés antes y después de aplicar el adaptador, con métricas propias del benchmark. No sustituye a una evaluación oficial, pero sirve como base experimental.
- Análisis de olvido catastrófico: comparar el comportamiento del modelo base y del adaptador en prompts generales en inglés para detectar degradación fuera del dominio de MS MARCO. Es un caso realista en investigación de PEFT.
- Validación de pipelines de inferencia con adaptadores: probar la integración de PEFT con transformers, vLLM u otros stacks que soporten LoRA, verificando carga, aplicación y fusión del adaptador. Útil para equipos que preparan infraestructura de evaluación.
- Docencia y talleres técnicos: demostrar el flujo completo de carga de un modelo de 1,3B, aplicación de un adaptador LoRA y ejecución de inferencia en hardware de consumo. El tamaño del modelo base lo hace manejable para entornos formativos.
- Prototipado de generación de texto en inglés en el dominio de búsqueda y recuperación: usar el adaptador en experimentos controlados con prompts relacionados con MS MARCO, siempre con validación humana y sin asumir calidad de producción.
- Artefacto de reproducibilidad para comparativas de SLM: incluir el adaptador en un leaderboard interno o paper de evaluación, fijando la revisión del repositorio y documentando prompts, parámetros de decodificación y métricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| MS MARCO (métricas del adaptador) | No disponible |

## Requisitos de hardware

- El modelo base tiene 1,3 mil millones de parámetros. Las estimaciones siguientes son teóricas y no han sido medidas para este adaptador; el contexto real no está documentado.
- VRAM estimada en FP16: pesos del orden de 2,6 GB; con caché KV y overhead, se recomienda un entorno de 4-6 GB.
- VRAM estimada en INT8: pesos del orden de 1,3 GB; entorno práctico de 3-4 GB.
- VRAM estimada en INT4: pesos del orden de 0,7 GB; entorno práctico de 2-3 GB con contexto corto o medio.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB para inferencia local. A100 y H100 son compatibles, pero innecesarias para un modelo de este tamaño.
- Caben en GPU de consumo: sí, especialmente con cuantización INT8/INT4 y longitud de contexto limitada. Con 6-8 GB de VRAM puede ser suficiente en configuraciones controladas.
- Opciones de despliegue: transformers + PEFT de forma nativa; vLLM con soporte de adaptadores LoRA; llama.cpp u Ollama tras convertir el modelo base a GGUF y aplicar el adaptador, verificando compatibilidad; TGI con adaptadores, sujeto a validación.
- Latencia y throughput: no disponibles. Dependen de la GPU, la precisión, la longitud de contexto, el tamaño de lote y el stack de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `praiselab-picuslab/benchmark-slm-msmarco-sheared-llama-ft` | Adaptador sobre 1,3B | No disponible | No disponible | No disponible | Gated en HuggingFace |
| `princeton-nlp/Sheared-LLaMA-1.3B` | 1,3B | No disponible | No disponible | No disponible | Público en HuggingFace |
| `princeton-nlp/Sheared-LLaMA-2.7B` | 2,7B | No disponible | No disponible | No disponible | Público en HuggingFace |
| `TinyLlama/TinyLlama-1.1B` | 1,1B | No disponible | No disponible | No disponible | Público en HuggingFace |

La comparativa se limita a parámetros y disponibilidad porque no hay datos de benchmarks ni de contexto verificados en la información proporcionada. El adaptador no es directamente comparable con un modelo completo: necesita el modelo base y su rendimiento depende de la tarea, el prompt y la configuración de decodificación.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial, redistribución ni modificación sin revisar las condiciones del repositorio y del modelo base.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace; esto puede limitar la automatización de descargas en CI/CD.
- El adaptador no es un modelo autónomo: requiere `princeton-nlp/Sheared-LLaMA-1.3B` y una versión compatible de PEFT.
- Solo inglés: no se documenta soporte multilingüe.
- No hay benchmarks publicados ni métricas de calidad; no se puede afirmar que mejore al modelo base sin una evaluación propia.
- Riesgo de alucinación inherente al modelo base; no se documenta un entrenamiento con RLHF/DPO que lo mitigue.
- Longitud de contexto no disponible; no se debe asumir soporte para contextos largos.
- El dataset MS MARCO puede contener sesgos y ruido; no se documenta limpieza, filtrado ni composición exacta.
- No se documentan capacidades de tool calling, agentes, visión o audio; no son adecuadas para pipelines que dependan de ellas.
- En producción, fijar la revisión del repositorio, revisar la licencia del modelo base, validar la calidad con datos propios y monitorizar deriva y alucinaciones.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/praiselab-picuslab/benchmark-slm-msmarco-sheared-llama-ft)
- [Modelo base Sheared-LLaMA-1.3B](https://huggingface.co/princeton-nlp/Sheared-LLaMA-1.3B)
- [Dataset MS MARCO](https://huggingface.co/datasets/microsoft/ms_marco)
- [Documentación de PEFT](https://huggingface.co/docs/peft/index)
- [Paper de Sheared-LLaMA (arXiv:2310.06694)](https://arxiv.org/abs/2310.06694)
