# ivykopal/nlp-2026-hanoi-sft-50

## Resumen

`ivykopal/nlp-2026-hanoi-sft-50` es un ajuste fino completo (full fine-tuning, FFT) del modelo `HuggingFaceTB/SmolLM2-135M-Instruct`, publicado por el usuario ivykopal. Su única tarea es generar la solución completa de la Torre de Hanoi en una sola generación, con un movimiento por línea en formato plano (por ejemplo, `A->C`). Se trata del baseline SFT del experimento comparativo de ajuste fino y aprendizaje por refuerzo denominado NLP 2026.

El modelo tiene 134.515.008 parámetros y se distribuye en safetensors bajo licencia Apache-2.0, con el inglés como único idioma declarado. No es un asistente general: la model card lo describe explícitamente como una pieza de investigación y docencia para estudiar la propagación del ruido en las demostraciones y el fallo de extrapolación en longitud.

Su relevancia actual es metodológica. Al ser un ajuste reproducible sobre un modelo de 135M, sirve como baseline y como arranque en frío (cold start) para métodos de RL como GRPO o GSPO, y permite aislar fenómenos concretos: con un 20% de trayectorias corruptas en el objetivo supervisado, el modelo hereda un error por movimiento que se acumula, y con un entrenamiento limitado a 5 discos (31 movimientos) exhibe un prior de longitud que le impide resolver el caso de 6 discos (63 movimientos), con una tasa de resolución del 0% en extrapolación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de estilo Llama, heredada del modelo base SmolLM2-135M-Instruct |
| Parámetros totales | 134.515.008 (según safetensors) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se publican pesos cuantizados) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers); repositorio de 0,5 GB |
| Modelo base | HuggingFaceTB/SmolLM2-135M-Instruct |
| Método de ajuste | full fine-tuning (FFT), sin adaptadores |
| Tarea (pipeline) | text-generation; etiquetas text-generation-inference y endpoints_compatible |
| Ruido en las etiquetas | 20% de trayectorias corruptas |
| Discos vistos en entrenamiento | 3, 4 y 5 |
| Guardado con | transformers 4.57.6 |
| Fecha de publicación | 17 de septiembre de 2026 |
| Descargas / me gusta | 0 / 0 |

## Arquitectura y entrenamiento

El modelo conserva íntegramente la arquitectura del modelo base: un transformer decoder-only de estilo Llama con 134,5 millones de parámetros. El ajuste es completo (no se emplean LoRA ni otros adaptadores), por lo que todos los pesos fueron actualizados durante el entrenamiento supervisado. La model card no detalla la composición del dataset más allá de su naturaleza: trayectorias óptimas de la Torre de Hanoi para 3, 4 y 5 discos, con un 20% de demostraciones corruptas generadas mediante cuatro operaciones (intercambio, reemplazo, borrado o inserción de un movimiento). No se menciona uso de RLHF ni de DPO.

La innovación metodológica no está en la arquitectura, sino en el diseño experimental. Al introducir ruido controlado en las etiquetas, el modelo solo puede imitar esa distribución y hereda una tasa de error por movimiento que se compone a lo largo de la cadena. A esto se suma un prior de longitud: entrenado con soluciones de como máximo 31 movimientos, ante un puzle de 6 discos emite exactamente 31 movimientos legales y se detiene. El fallo de extrapolación (0,00 de tasa de resolución) se debe a esa longitud incorrecta y no al error acumulado, ya que la respuesta generada es formalmente válida y legal. No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de secuencias completas de movimientos de la Torre de Hanoi en una sola pasada, con un movimiento por línea y formato `A->C`.
- Formato plano (flat format): no incluye explicaciones ni pasos intermedios de razonamiento; devuelve únicamente la secuencia.
- Resolución correcta de puzles de 3 a 5 discos vistos durante el entrenamiento bajo permutaciones de clavijas no vistas (tasa global de 0,60).
- Seguimiento de una plantilla de chat con mensajes de sistema y usuario (conversational), mediante `apply_chat_template`.
- Generación determinista mediante decodificación greedy (`do_sample=False`), requisito indicado en la model card.
- Capacidad de generar hasta 63 movimientos bien formados (caso de 6 discos), aunque con longitud truncada al prior de 31 movimientos.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües: solo inglés.
- No dispone de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Baseline SFT en experimentos de RL: el modelo actúa como punto de partida en frío para comparar GRPO o GSPO frente a un ajuste supervisado puro, en el marco del estudio NLP 2026.
- Estudio de propagación de ruido en etiquetas: al entrenar con un 20% de trayectorias corruptas, permite medir cómo una tasa de error por movimiento se compone hasta degradar la solución completa (0,60 en datos retenidos frente a un techo óptimo teórico).
- Investigación sobre extrapolación de longitud: el fallo sistemático a 6 discos (0,00) ofrece un caso controlado para analizar priors de longitud en modelos pequeños, con un modelo que cabe en cualquier equipo.
- Docencia de ajuste fino: reproduce de principio a fin un pipeline de FFT sobre un modelo de 135M, útil en asignaturas de PLN para ilustrar preparación de datos, plantillas de chat y evaluación greedy.
- Evaluación de harnesses y parsers: el formato de salida rígido (un movimiento por línea) permite validar herramientas de extracción y verificación de legalidad de movimientos en pipelines de evaluación.
- Generación de conjuntos de datos etiquetados: sirve para producir trayectorias sintéticas de referencia y contrastarlas con soluciones óptimas calculadas, midiendo desviaciones movimiento a movimiento.
- Pruebas de despliegue de modelos pequeños: por su tamaño (0,5 GB de repositorio) es adecuado para validar infraestructura de servicio (transformers, TGI, endpoints compatibles) antes de escalar a modelos mayores.
- Currículos y comparativas de tamaño: al derivar de SmolLM2-135M-Instruct, permite comparar el efecto del ajuste supervisado frente al modelo base y frente a variantes de mayor tamaño en la misma tarea.

## Benchmarks y rendimiento

Evaluación greedy, una generación por puzle, según la model card. `solved` significa que la trayectoria movió todos los discos a la clavija objetivo.

| Discos | Retenido (heldout) | Extrapolación |
|---|---|---|
| 3 | 0,79 | — |
| 4 | 0,36 | — |
| 5 | 0,67 | — |
| 6 | — | 0,00 |
| Global | 0,60 | 0,00 |

Los datos retenidos corresponden a 3-5 discos con permutaciones de clavijas no vistas. La extrapolación usa 6 discos, estrictamente por encima de la longitud de entrenamiento. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 134.515.008 parámetros): aproximadamente 0,54 GB en FP32, 0,27 GB en FP16/BF16, 0,14 GB en int8 y 0,07 GB en int4, sin contar el coste del contexto ni de las activaciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4090, A100, H100); el modelo está muy por debajo de la capacidad de cualquier acelerador moderno.
- Cabe holgadamente en GPU de consumo e incluso en CPU: el repositorio completo ocupa 0,5 GB y los pesos en FP16 rondan los 270 MB.
- Opciones de despliegue: transformers (biblioteca declarada, guardado con la versión 4.57.6) y text-generation-inference, según las etiquetas del repositorio (`text-generation-inference`, `endpoints_compatible`). No se publican pesos GGUF, por lo que su uso en llama.cpp u Ollama requeriría una conversión previa no incluida en el repositorio.
- Latencia y throughput estimados: no disponibles.
- Nota de configuración: la generación debe ser greedy (`do_sample=False`) y `max_new_tokens` debe cubrir la solución más larga evaluada; 6 discos requieren 63 movimientos (unos 251 tokens) y la model card sugiere un límite de 576 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ivykopal/nlp-2026-hanoi-sft-50 | 134.515.008 | no disponible | Torre de Hanoi (FFT con 20% de ruido) | Apache-2.0 | HuggingFace, 0 descargas |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M según el nombre del modelo base | no disponible en la información proporcionada | Asistente general instruccional | Apache-2.0 | HuggingFace (modelo base) |
| Otros baselines SFT del mismo estudio (GRPO/GSPO) | no disponible | no disponible | Torre de Hanoi | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables de la misma categoría en la información proporcionada, más allá del modelo base, del cual este ajuste hereda arquitectura y licencia.

## Limitaciones y advertencias

- Prior de longitud severo: entrenado con soluciones de hasta 31 movimientos (5 discos), ante un puzle de 6 discos genera exactamente 31 movimientos legales y se detiene; la tasa de extrapolación es 0,00.
- Error por movimiento heredado: el 20% de demostraciones corruptas en el objetivo supervisado se traduce en una tasa de acierto en datos retenidos de 0,60, con composición del error a lo largo de la cadena de movimientos.
- Degradación no monótona con el número de discos: 0,79 a 3 discos, 0,36 a 4 discos y 0,67 a 5 discos, lo que desaconseja extrapolar el rendimiento entre tamaños.
- No es un asistente general: solo produce secuencias de movimientos de la Torre de Hanoi; cualquier otro tipo de petición queda fuera de su distribución de entrenamiento.
- Idioma limitado al inglés; no se ha validado su comportamiento con instrucciones en castellano u otros idiomas.
- Riesgo de alucinación formal: puede emitir secuencias sintácticamente válidas y con movimientos legales que no resuelven el puzle, por lo que la verificación externa de la solución es obligatoria en cualquier uso automatizado.
- Longitud de contexto no documentada: no se especifica en la model card, lo que impide garantizar el comportamiento con entradas largas.
- Sin soporte de herramientas ni de agentes: no implementa tool calling, function calling ni razonamiento multi-paso.
- Licencia Apache-2.0, heredada del modelo base, que permite uso comercial; aun así, el uso previsto declarado por el autor es investigación y docencia.
- Discrepancia en los identificadores: el código de ejemplo de la model card carga `ivykopal/nlp-2026-hanoi-sft`, mientras que el identificador del repositorio es `ivykopal/nlp-2026-hanoi-sft-50`; conviene verificar cuál es el checkpoint correcto antes de desplegarlo.
- Repositorio sin tracción: 0 descargas y 0 me gusta en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ivykopal/nlp-2026-hanoi-sft-50
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Notebook de referencia citado en la model card: `examples/sft/fft.ipynb` (ruta relativa, sin URL pública en la información disponible)
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a servicios de traducción (Google Translate, DeepL, Reverso) y no guardan relación con esta ficha.
