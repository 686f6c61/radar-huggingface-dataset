# jonasaise/qwen3.5-2b-swedish-preference-gate

## Resumen

`qwen3.5-2b-swedish-preference-gate` es un modelo discriminador de calidad y preferencia para sueco, desarrollado por el usuario jonasaise sobre el modelo base `Qwen/Qwen3.5-2B`. No es un modelo generativo de propósito general, sino un adaptador especializado que reutiliza el backbone de Qwen3.5-2B para responder cinco preguntas de evaluación en una sola pasada: preferencia entre dos respuestas, naturalidad comparativa, calidad de una respuesta (escala 1-5), naturalidad del sueco y corrección gramatical. Resuelve el problema de evaluar automáticamente la calidad de texto generado en sueco, un idioma con menos recursos que el inglés y con escasez de jueces automáticos fiables.

El modelo tiene 1.882 millones de parámetros y 24 capas que combinan GatedDeltaNet con atención completa. Se ha ajustado fino sobre una muestra estratificada del conjunto `v4.1` y calibrado con temperature scaling por pregunta, alcanzando una precisión del 93,6 % en preferencia de traducción y del 82,1 % en preferencia de sueco fluido según los datos declarados por el autor. Su relevancia actual radica en que ofrece una alternativa de mayor capacidad que el modelo Laya-307M del mismo autor, con una interfaz idéntica y una latencia de aproximadamente 58 ms por par de respuestas.

La licencia Apache 2.0 y el soporte de dos idiomas (sueco e inglés) lo hacen adecuado para pipelines de evaluación en producción, filtrado de datos de entrenamiento y validación de traducciones, aunque su naturaleza discriminadora limita los casos de uso a tareas de clasificación y puntuación, no de generación libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con 24 capas GatedDeltaNet + atención completa (base Qwen3.5-2B) |
| Parametros totales | 1.882 M (1.882B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (truncado a nivel de campo en la interfaz del juez) |
| Tipos de cuantizacion | No disponible (entrenamiento con PagedAdamW8bit; no se documentan cuantizaciones de inferencia) |
| Idiomas soportados | Sueco (sv), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repo de 7,5 GB; probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-2B`, un transformer híbrido de 1.882 millones de parámetros con 24 capas que alternan GatedDeltaNet y atención completa. Sobre esta base se sustituye la cabeza generativa por una cabeza de decisión de 7 opciones (`A`, `B`, `1`..`5`) que proyecta el estado oculto final sobre vectores de opción en una única pasada forward. Se ajustan fino las 24 capas del backbone, la RMSNorm final y la cabeza de decisión, con 1.373 millones de parámetros entrenables, manteniendo congelada la tabla de embeddings ligada de 248.000 filas.

El entrenamiento se realizó sobre una muestra determinista y estratificada de 8.000 unidades del conjunto `v4.1` (400 unidades por grupo `(fuente, pregunta)`, 800 para `fluent/quality`), con 8-bit PagedAdamW8bit y gradient checkpointing en una única GPU de 12 GB. El tiempo de entrenamiento fue de 16,2 minutos (121,9 s por cada 1.000 unidades) con un pico de VRAM de 7,22 GiB. Posteriormente se aplicó temperature scaling por pregunta para calibrar las probabilidades. La revisión `v4.2b` añade un calentamiento sobre 800 unidades de contraejemplo con control de longitud más 800 unidades de replay estratificado de `v4.1`, con 1.690 unidades adicionales y 3,3 minutos extra de entrenamiento.

La innovación técnica principal es la interfaz de discriminador de una sola pasada con cinco preguntas, que desactiva el modo de razonamiento `<think>` y aplica truncado de campo a 1.024 tokens, logrando latencias de 57,9 ms por par y 32,9 ms por respuesta individual con un throughput de 17,2 pares por segundo con batch de 8.

## Capacidades

- Clasificación de preferencia por pares: decide qué respuesta es mejor entre dos candidatas, con opciones `A` o `B`.
- Evaluación de naturalidad comparativa: determina cuál de dos textos suena más natural en sueco.
- Puntuación de calidad individual: asigna una nota de 1 a 5 a una respuesta dada.
- Evaluación de naturalidad individual: puntúa el grado de naturalidad del sueco en una respuesta.
- Detección de errores gramaticales: clasifica la corrección gramatical de un texto en sueco.
- Modo de una sola pasada: no genera razonamiento explícito, lo que reduce latencia y coste.
- Soporte bilingüe sueco-inglés, con especialización clara en sueco.
- Interfaz programática mediante la librería `laya_gate.llm_judge` con métodos `predict_preference`, `predict_naturalness`, `score_quality`, `score_naturalness` y `score_grammar`.
- Capacidad de fusión por consenso con el modelo Laya-307M para mejorar la precisión en tareas de evaluación.

## Casos de uso

- Evaluación automática de sistemas de traducción al sueco: el modelo puede comparar pares de traducciones y detectar "translationese" con una precisión del 93,6 %, integrándose en pipelines de control de calidad de proveedores de traducción.
- Filtrado de datos de entrenamiento para LLMs en sueco: puntúa la calidad y naturalidad de respuestas generadas o extraídas de corpus, permitiendo descartar ejemplos de baja calidad antes de incluirlos en un dataset de ajuste fino.
- Juez automático en evaluación de modelos generativos: sirve como `llm-as-judge` para comparar las salidas de dos modelos en tareas de generación en sueco, con una latencia de 58 ms por par que permite evaluar miles de pares en minutos.
- Detección de errores gramaticales en herramientas de escritura: la cabeza `grammatical` puede integrarse en correctores ortográficos y gramaticales para sueco, identificando textos con errores con una precisión del 75 % en el benchmark DaLAJ-GED.
- Validación de contenido generado en atención al cliente: antes de enviar una respuesta automática a un usuario sueco, el modelo puntúa su calidad (1-5) y naturalidad, bloqueando respuestas por debajo de un umbral configurable.
- Control de regresiones en pipelines de generación: al comparar la salida de una nueva versión de un modelo contra la versión anterior, el gate de preferencia detecta degradaciones en naturalidad o corrección gramatical de forma automática.
- Investigación en evaluación de LLMs para lenguas minoritarias: proporciona una herramienta reproducible y de código abierto para medir la calidad del sueco generado, con calibración documentada (ECE de 0,026 en preferencia de traducción).

## Benchmarks y rendimiento

Datos declarados por el autor en la model card y el model-index (no verificados de forma independiente):

| Benchmark | Qwen3.5-2B zero-shot | Qwen3.5-2B v4.1 (8k) | Qwen3.5-2B v4.2b (+len) | Laya-307M v4.1 (224k) | Consenso (Laya ∧ Qwen-FT) |
|---|---|---|---|---|---|
| In-domain `original/preference` | 79,1 % | 93,6 % | 92,7 % | 98,8 % | 99,4 % (94 % acuerdo) |
| In-domain `fluent/preference` | 75,8 % | 82,1 % | 82,4 % | 76,6 % | 88,8 % (76 % acuerdo) |
| Reasoning-on `probe/preference` | 73,9 % | 82,3 % | 84,6 % | 79,3 % | 88,0 % (81 % acuerdo) |
| DaLAJ-GED `naturalness` | 73,7 % | 86,7 % | 86,6 % | 88,0 % | 93,9 % (85 % acuerdo) |
| DaLAJ-GED `grammatical` | 73,6 % | 75,0 % | 74,2 % | 81,4 % | 84,7 % (67 % acuerdo) |
| ScaLA-sv `grammatical` acc@0.5 | no medido | no medido | no medido | no medido | 81,0 % (69 % acuerdo) |
| GerLangMod-sv `naturalness` | 94,4 % | 96,1 % | 96,0 % | 95,7 % | 99,2 % (93 % acuerdo) |

Métricas de calibración declaradas en el model-index:

| Tarea | Dataset | Exactitud | IC 95 % | n | ECE |
|---|---|---|---|---|---|
| Preferencia por pares (translationese) | `dpo-swedish-interpreted` (val_eval) | 0,9365 | [0,9222; 0,9508] | 1.118 | 0,0257 |
| Preferencia por pares (sueco fluido) | `ultrafeedback-binarized-preferences-cleaned` (val_eval) | 0,8208 | [0,7957; 0,8459] | 876 | 0,0445 |

Datos de eficiencia declarados por el autor:

| Modelo | Parámetros | Entrenables | Unidades de entrenamiento | Tiempo de entrenamiento | VRAM pico | p50 por par | p50 individual | Throughput (bs=8) |
|---|---|---|---|---|---|---|---|---|
| Qwen3.5-2B zero-shot | 1.882 M | 0 | 0 | — | — | 57,7 ms | 33,0 ms | 17,1/s |
| Qwen3.5-2B v4.1 fine-tuned | 1.882 M | 1.373 M | 8.000 | 16,2 min | 7,22 GiB | 57,9 ms | 32,9 ms | 17,2/s |
| Qwen3.5-2B v4.2b | 1.882 M | 1.373 M | +1.690 | +3,3 min | 7,22 GiB | 57,7 ms | 32,9 ms | 17,2/s |
| Laya-307M v4.1 (8k) | 307 M | 322 M | 8.000 | 6,7 min | 6,01 GiB | 9,8 ms | 6,0 ms | 119,9/s |

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento requirió 7,22 GiB de pico con gradient checkpointing y 8-bit AdamW, por lo que la inferencia en precisión completa debería caber en GPUs de 12 GB o superiores; no se documentan requisitos específicos de inferencia.
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM para el modelo completo; para cuantizaciones de 8 bits o 4 bits, GPUs consumer como RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080 o RTX 4090.
- Cabe en GPU consumer: sí, en tarjetas con 12 GB o más de VRAM en el peor caso documentado (entrenamiento); la inferencia podría ser viable en GPUs de 8 GB con cuantización, aunque no está confirmado.
- Opciones de despliegue: la model card solo documenta la librería propia `laya_gate.llm_judge` instalable desde el repositorio de GitHub; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y al ser un modelo de clasificación con cabeza de decisión personalizada, su integración en esos frameworks requeriría adaptaciones.
- Latencia y throughput: 57,9 ms por par (p50) y 32,9 ms por respuesta individual (p50), con 17,2 pares por segundo con batch de 8, según los datos del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión preferencia (original) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-2b-swedish-preference-gate (v4.1) | 1.882 M | 1.024 tokens | 93,6 % | Apache 2.0 | HuggingFace |
| laya-swedish-preference-gate (Laya-307M) | 307 M (322 M total) | no disponible | 98,8 % (v4.1 full) | no disponible en la información | HuggingFace |
| Qwen3.5-2B zero-shot | 1.882 M | no disponible | 79,1 % | no disponible en la información | HuggingFace |

La comparativa principal es con el modelo Laya-307M del mismo autor, que comparte interfaz y receta de entrenamiento. Laya-307M es más pequeño (307 M frente a 1.882 M), más rápido (9,8 ms frente a 57,9 ms por par) y alcanza mayor precisión en preferencia original cuando se entrena con el conjunto completo (98,8 % frente a 93,6 %). Sin embargo, el modelo basado en Qwen3.5-2B supera a Laya-307M en preferencia de sueco fluido (82,1 % frente a 76,6 %), en razonamiento (82,3 % frente a 79,3 %) y en naturalidad DaLAJ-GED (86,7 % frente a 88,0 % es inferior, pero en GerLangMod-sv es superior con 96,1 % frente a 95,7 %). La fusión por consenso de ambos modelos alcanza los mejores resultados en casi todas las métricas.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo clasifica y puntúa; no debe usarse para tareas de generación.
- Contexto limitado a 1.024 tokens: textos más largos se truncan a nivel de campo, lo que puede perder información relevante en evaluaciones de documentos extensos.
- Especialización exclusiva en sueco: aunque declara inglés, su rendimiento fuera del sueco no está documentado y probablemente sea deficiente.
- Precisión moderada en corrección gramatical: el 75,0 % en DaLAJ-GED `grammatical` deja un margen de error del 25 %, insuficiente para sustituir por completo a revisores humanos en producción.
- Calibración mejorable en preferencia de sueco fluido: ECE de 0,0445, superior al 0,0257 de la tarea de translationese, lo que indica mayor incertidumbre en las probabilidades.
- Riesgo de sesgo hacia el estilo de los datos de entrenamiento: al entrenarse sobre `dpo-swedish-interpreted`, `laya-swedish-gate-v4-data` y `superlim-2`, puede favorecer variedades o registros sobrerrepresentados en esos corpus.
- Sesgo de longitud corregido solo parcialmente: la revisión `v4.2b` eleva la precisión en el test de longitud corta del 44,0 % al 75,9 %, pero la métrica global `length_test/preference` no se midió.
- Resultados no verificados: todas las métricas proceden del autor y están marcadas como `verified: false` en el model-index.
- Dependencia de una librería propia: el uso requiere instalar `laya_gate` desde GitHub, lo que añade una dependencia de mantenimiento externo.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía ni soporte por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jonasaise/qwen3.5-2b-swedish-preference-gate
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo Laya-307M relacionado: https://huggingface.co/jonasaise/laya-swedish-preference-gate
- Repositorio de código y pipeline: https://github.com/joenaess/laya-swedish-preference-gate
- Dataset de preferencias: https://huggingface.co/datasets/jonasaise/dpo-swedish-interpreted
- Dataset del gate: https://huggingface.co/datasets/jonasaise/laya-swedish-gate-v4-data
- Dataset SuperLim 2: https://huggingface.co/datasets/sbx/superlim-2
- Dataset UltraFeedback binarizado: https://huggingface.co/datasets/argilla/ultrafeedback-binarized-preferences-cleaned
