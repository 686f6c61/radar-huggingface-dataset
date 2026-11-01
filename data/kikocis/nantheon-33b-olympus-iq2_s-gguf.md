# KikoCis/Nantheon-33B-Olympus-IQ2_S-GGUF

## Resumen

Nantheon-33B-Olympus-IQ2_S-GGUF es una cuantización GGUF de 2 bits del modelo Nanbeige4.3-33B, un transformer denso de 33.118.977.024 parámetros desarrollado por el equipo Nanbeige y orientado a tareas de agente: codificación de largo horizonte, uso de terminal y razonamiento multi-paso con tool calling. El autor de la cuantización es KikoCis, que publica el archivo bajo licencia Apache-2.0 sin fine-tuning, merging ni entrenamiento adicional: los pesos son una conversión directa de los safetensors BF16 originales.

El interés de esta ficha está en el compromiso que propone: comprimir un modelo de 33B denso hasta 10,84 GB para que pueda ejecutarse en el rango de 8-12 GB de memoria, típico de portátiles y GPUs de consumo. Para ello se utiliza una cuantización IQ2_S calibrada con una importance matrix (imatrix) de 160 fragmentos de 2048 tokens, generada a partir de una copia Q8_0. El modelo base declara una ventana de contexto de 512K tokens y un modo de razonamiento conmutable (`enable_thinking`).

La relevancia actual reside en la verificación empírica que acompaña al archivo: el autor no se limita a publicar el GGUF, sino que lo somete a una prueba de competencia agéntica sobre instancias reales de SWE-bench Verified mediante un harness local, además de HumanEval y perplejidad en Wikitext-2, comparándolo con otra cuantización IQ2_S de referencia. Es una cuantización agresiva de un modelo denso, y el propio autor lo advierte: conserva la capacidad agéntica, pero no equivale al modelo en BF16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Nanbeige4.3-33B) |
| Parámetros totales | 33.118.977.024 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512K tokens en el modelo base; en la práctica limitada por memoria (el autor usa ~12K de presupuesto de contexto en las pruebas y recomienda `-c 32768` en llama.cpp) |
| Tipos de cuantización | IQ2_S con importance matrix (imatrix); el archivo publicado es IQ2_S de 10,84 GB |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `Nantheon-33B-IQ2_S.gguf`, 10,84 GB); el modelo base en safetensors BF16 |

## Arquitectura y entrenamiento

El modelo subyacente es Nanbeige4.3-33B, un transformer denso de aproximadamente 33.000 millones de parámetros. La información disponible no detalla la composición del dataset de entrenamiento ni si se aplicaron fases de RLHF o DPO; la model card de la cuantización se centra en el proceso de compresión y en las evaluaciones, no en el preentrenamiento del modelo base. Sí se documenta que el modelo está diseñado como "teacher agent" para codificación de largo horizonte, trabajo de terminal y uso de herramientas multi-paso, con una ventana de contexto de 512K tokens y un modo de razonamiento conmutable mediante la plantilla de chat (`enable_thinking`).

El proceso de cuantización, documentado paso a paso por el autor, consistió en: (1) conversión de los safetensors BF16 originales a GGUF con llama.cpp sin modificar arquitectura ni tokenizador; (2) cálculo de una importance matrix a partir de una copia Q8_0 usando 160 fragmentos de 2048 tokens de texto de calibración; (3) cuantización de BF16 a IQ2_S con esa imatrix, empleando la mezcla estándar de tensores IQ2_S de llama.cpp; y (4) una puerta de validación que exige carga y generación coherente, resolución de al menos 1 de 5 instancias de SWE-bench sin fallos ni bucles, y comparación de HumanEval y perplejidad frente a una cuantización de referencia del mismo tamaño. La imatrix (`nanbeige43-33b.imatrix`) se incluye en el repositorio para permitir generar otras cuantizaciones.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Codificación agéntica de largo horizonte: resolución de issues reales de repositorios (probado sobre instancias de Django en SWE-bench Verified).
- Uso de herramientas y function calling, con llamadas a herramientas en formato XML según la plantilla de chat embebida en el GGUF.
- Trabajo de terminal y razonamiento multi-paso orientado a agentes.
- Modo de razonamiento conmutable (`enable_thinking`): activable o desactivable por petición mediante kwargs de plantilla de chat en llama.cpp (`--chat-template-kwargs '{"enable_thinking":false}'`) o `think: false` en Ollama.
- Generación de código verificada en HumanEval (pass@1 de 89,6 en versión base y 84,1 en versión plus, en modo no-thinking).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el archivo puede servirse a través de la infraestructura de Inference Endpoints de Hugging Face.

## Casos de uso

- Agente de resolución de issues en local: el modelo puede ejecutarse en un portátil con 12 GB de memoria y resolver tickets de repositorios Python a través de un harness agéntico, como demuestra la prueba sobre `django__django-11133` y `django__django-11099`. Es adecuado cuando no se dispone de GPU de datacenter y se acepta una tasa de éxito parcial.
- Asistente de terminal integrado: con llamadas a herramientas en XML y contexto de hasta 32K configurable en llama.cpp, puede encadenar comandos de shell, leer salidas y corregir errores en un bucle de agente.
- Automatización de CI/CD en máquinas modestas: al caber en 10,84 GB, puede desplegarse en runners con GPU consumer para tareas de revisión de parches, generación de tests o triaje de fallos, sin depender de APIs externas.
- Chat técnico bilingüe inglés-chino: útil para equipos que documentan o colaboran en ambos idiomas, con temperatura recomendada de 0,6 y top_p 0,95 para conversación.
- Prototipado de pipelines agénticos: sirve como banco de pruebas de bajo coste para validar harnesses, plantillas de herramientas y estrategias de turnos antes de migrar a una cuantización mayor (Q4_K_M o superior) o al modelo en BF16.
- Generación de código asistida en IDE con Ollama: la plantilla de chat embebida permite `ollama run hf.co/KikoCis/Nantheon-33B-Olympus-IQ2_S-GGUF` directamente, sin configuración adicional de template.
- Evaluación comparativa de cuantizaciones: la inclusión de la imatrix permite al investigador generar variantes IQ2_S, IQ3 o Q4 y medir el impacto en perplejidad y competencia agéntica con la misma metodología publicada.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre este archivo concreto (IQ2_S, 10,84 GB), comparados con la cuantización IQ2_S de bartowski (11,15 GB):

| Benchmark | Configuración | Nantheon IQ2_S | bartowski IQ2_S |
|---|---|---|---|
| SWE-bench Verified, sonda de 5 instancias | Harness agéntico local, ~12K de contexto, non-thinking, tool calls XML | 2/5 resueltas | No ejecutado |
| HumanEval pass@1 (base / plus) | Non-thinking, temp 0,6, seed 1234, 2048 tokens nuevos máx. | 89,6 / 84,1 | 89,0 / 85,4 |
| Generaciones desbocadas en HumanEval (alcanzan el límite de tokens) | Misma configuración | 5/164 | 12/164 |
| Perplejidad Wikitext-2 (menor es mejor) | 40 fragmentos de 2048 tokens | 23,42 ± 0,43 | 22,36 ± 0,40 |

Detalle de la sonda SWE-bench: resolvió `django__django-11133` y `django__django-11099`; en `django__django-13590` agotó el presupuesto de turnos sin parche válido; en `django__django-13933` respondió en texto en el primer turno en lugar de invocar una herramienta y el agente se detuvo; en `django__django-14608` alcanzó el límite de tiempo. El autor califica explícitamente esta prueba como un smoke test de competencia agéntica, no como una puntuación de leaderboard. Los benchmarks del modelo base a plena precisión (Terminal-Bench, SWE-Bench Pro) no se reclaman para esta cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11-12 GB para el archivo IQ2_S de 10,84 GB, más overhead de contexto KV. Con contexto de 32K el consumo sube de forma apreciable; con ~12K de presupuesto (como en las pruebas del autor) se mantiene en el rango objetivo.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 Ti, RTX 4080, RTX 4090, A100 y H100. En GPUs de datacenter cabe con holgura y permite contextos mucho mayores.
- Cabe en GPU consumer: sí, en tarjetas con 12 GB o más de VRAM. Es precisamente el objetivo declarado del autor (banda de 8-12 GB), aunque con 8 GB el contexto disponible será muy reducido.
- Opciones de despliegue: llama.cpp (`llama-server -hf KikoCis/Nantheon-33B-Olympus-IQ2_S-GGUF --jinja -c 32768`), Ollama (`ollama run hf.co/KikoCis/Nantheon-33B-Olympus-IQ2_S-GGUF`), y cualquier runtime compatible con GGUF. El repositorio está etiquetado como `endpoints_compatible`.
- Parámetros de muestreo recomendados: temperatura 1,0 y top_p 0,95 para uso agéntico y de herramientas; temperatura 0,6 y top_p 0,95 para razonamiento y chat. A 2 bits, el autor recomienda bajar a 0,6 para bucles de agente por mayor estabilidad.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|---|
| Nantheon-33B-Olympus-IQ2_S (esta ficha) | 33,1B densos | 512K (base) | IQ2_S con imatrix | 10,84 GB | Apache-2.0 | HumanEval 89,6/84,1; SWE-bench 2/5; ppl 23,42 |
| bartowski Nanbeige4.3-33B IQ2_S | 33,1B densos | 512K (base) | IQ2_S | 11,15 GB | Apache-2.0 | HumanEval 89,0/85,4; ppl 22,36 |
| Nanbeige4.3-33B BF16 (modelo base) | 33,1B densos | 512K | BF16 | No disponible en la información | Apache-2.0 | Benchmarks upstream (Terminal-Bench, SWE-Bench Pro) no trasladables a la cuantización |

La comparación con Unsloth no es posible porque, según el autor, no ha publicado GGUF de Nanbeige4.3-33B. La referencia de bartowski es la coincidencia de tamaño más cercana, dentro del 3 % del archivo de esta ficha.

## Limitaciones y advertencias

- IQ2_S es una cuantización agresiva de 2 bits sobre un modelo denso de 33B: conserva la usabilidad agéntica, pero no equivale al modelo BF16. Con memoria suficiente, Q4_K_M o superior es notablemente más fuerte.
- La prueba de competencia agéntica se ejecutó en modo non-thinking para ajustarse al presupuesto de turnos; el modo thinking está disponible y es el que recomienda el proyecto upstream para las tareas más difíciles.
- Los benchmarks del modelo base a plena precisión no se reclaman para esta cuantización; no deben citarse como resultados de este archivo.
- La sonda SWE-bench de 5 instancias es un smoke test, no una medida representativa de la tasa de resolución real.
- Perplejidad superior a la referencia bartowski (23,42 frente a 22,36), lo que sugiere una fidelidad algo menor al modelo original pese al mejor comportamiento en generaciones desbocadas (5/164 frente a 12/164).
- Idiomas soportados limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Riesgo de alucinación y de fallos en bucles de agente inherente a los modelos de este tamaño y a la compresión a 2 bits; se recomienda validación humana en producción.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse la atribución al equipo Nanbeige y respetarse las condiciones de la licencia del modelo base.
- El nombre comercial "Nantheon" y el banner son empaquetado; los pesos no han sido modificados más allá de la cuantización.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/KikoCis/Nantheon-33B-Olympus-IQ2_S-GGUF
- Modelo base Nanbeige4.3-33B: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Cuantización de referencia de bartowski: https://huggingface.co/bartowski/Nanbeige_Nanbeige4.3-33B-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
