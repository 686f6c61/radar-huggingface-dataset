# plantwaterer/kudhab

## Resumen

kudhab (𒋻𒇥) es un modelo de decisión derivado de google/gemma-4-31B-it, publicado por el usuario plantwaterer en Hugging Face. No es un modelo generativo en el sentido habitual: su función es recibir una petición estructurada compuesta por un estado, una lista de preguntas tipadas (elección entre opciones o sí/no) y devolver, en un único forward pass, una distribución de probabilidad sobre cada opción. No genera texto libre.

Técnicamente es un fine-tune de una media uniforme de cuatro fine-tunes del mismo punto de partida Gemma 4 31B, destilado a partir de las probabilidades de salida de MachinePulseAI/karpo-decision-31B sobre el conjunto de preguntas de entrenamiento del autor. Los pesos se leen con el código de inferencia abierto de karpo-decision (Apache-2.0), que define el formato de petición, la atención y el mecanismo de lectura (readout). El modelo declara una puntuación pública de 73,96 en Decision Index 0.3 (bruto 80,03, amplitud 73,54), autoinformada por el autor.

Su relevancia radica en que ofrece un modelo de decisión de 31B parámetros con licencia Apache-2.0 y pesos abiertos, algo poco común en esta categoría, donde los modelos de decisión suelen distribuirse bajo licencias comunitarias restrictivas. Está pensado para integrarse en pipelines de agentes y sistemas de enrutamiento donde se necesita una política de selección probabilística rápida, no una generación de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), con 10 capas de atención global y 50 capas de ventana deslizante; lectura mediante matriz de readout 255 x 5.376 |
| Parámetros totales | 31.273.088.876 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por defecto (max_length); ventana deslizante de 1.024 tokens en 50 capas |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (backbone + readout.safetensors), config.json, decision_config.json, tokenizer |

## Arquitectura y entrenamiento

El backbone es Gemma 4 de 31B parámetros en configuración decoder-only, con una combinación de 10 capas de atención global y 50 capas de ventana deslizante causal de 1.024 tokens. La innovación principal no está en el backbone sino en el mecanismo de lectura: en el último token de cada rama de pregunta, el estado oculto se multiplica por una matriz de 255 x 5.376 en fp32 (las filas del language-model head del modelo, atadas a los embeddings de entrada, correspondientes a los 255 tokens de código de opción). El resultado se somete a un soft-cap de 30·tanh(x/30) y las probabilidades de la pregunta son el softmax a temperatura 1 sobre los códigos de sus opciones. Esta matriz de readout no se entrena.

El entrenamiento consistió en destilación: se partió de una media uniforme (0,5/0,5) de plantwaterer/munku y tattrongvu/Jeffan-31b-1710 (revisión Apache-2.0), ambos fine-tunes de Gemma 4 31B, y se entrenó cada etapa para reproducir las probabilidades de salida del profesor MachinePulseAI/karpo-decision-31B sobre las preguntas de entrenamiento del autor, ejecutado con su propio código de inferencia (vista `joint`, temperatura 1). El modelo no contiene pesos de karpo-decision ni se inicializó a partir de ellos. El formato de petición es `karpo-blocks-v1`: un turno de sistema, un bloque compartido con la lista de preguntas y el contexto, y una rama por pregunta con sus opciones etiquetadas con códigos de un token (A, B, ..., hasta 255 opciones) y el slot `Answer: (`. Las ramas no se ven entre sí; las peticiones que superan max_length se dividen por preguntas repitiendo el bloque compartido, y las preguntas que no caben se rechazan en lugar de truncarse.

## Capacidades

- Decisión probabilística sobre opciones: devuelve una probabilidad por opción para preguntas de tipo elección o sí/no, en un solo forward pass, sin generación de texto.
- Soporte de hasta 255 opciones por pregunta mediante códigos de un token.
- Manejo de múltiples preguntas por petición con un bloque de contexto compartido y ramas independientes por pregunta.
- Modos de vista configurables: `joint` (por defecto), `reversed` (promedia cada pregunta de elección sobre su orden y el inverso) y `single`.
- Gestión de peticiones largas mediante división por preguntas con repetición del bloque compartido.
- Rechazo explícito de peticiones con imágenes (solo texto).
- Integración con el motor DecisionIndexEngine de karpo-decision y con el kit apolinario/decision-index.

## Casos de uso

- Enrutamiento de consultas en sistemas de agentes: dado un estado conversacional y una lista de herramientas o intenciones disponibles, el modelo devuelve la probabilidad de cada opción en un forward pass, lo que permite seleccionar la ruta con un umbral configurable sin coste de generación.
- Clasificación de intenciones en atención al cliente: con el contexto del historial como bloque compartido y las intenciones como opciones, se obtiene una distribución calibrada que puede alimentar una cola de triaje o un sistema de escalado.
- Evaluación de políticas en entornos simulados: para estados discretos o textuales con un conjunto finito de acciones, el modelo actúa como política estocástica, útil en experimentos de RL o simulación de decisiones.
- Verificación de respuestas en pipelines RAG: plantear como pregunta de elección si una respuesta candidata es correcta, parcialmente correcta o incorrecta, usando el contexto recuperado como bloque compartido.
- Moderación y etiquetado con múltiples criterios: una sola petición con varias preguntas tipadas (por ejemplo, toxicidad, spam, relevancia) sobre el mismo texto, aprovechando que las ramas son independientes y el contexto se comparte.
- Selección de variantes en generación: usar el modo `reversed` para preguntas de elección cuyas opciones pueden reordenarse, promediando sobre el orden y su inverso para reducir el sesgo posicional.
- Automatización de encuestas y cuestionarios estructurados: procesar lotes de preguntas tipadas con contexto largo (hasta 32.768 tokens) en una sola pasada.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Decision Index 0.3 (público) | 73,96 | Autoinformado por el autor; bruto 80,03, amplitud 73,54 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. El modelo no es generativo, por lo que los benchmarks de generación de texto no son directamente aplicables.

Latencia medida por el autor en una RTX PRO 6000 Blackwell (96 GB), muestra pública de 1.000 peticiones, una petición a la vez, vista `joint`, max_length 32.768, sin kernels `blackwell` opcionales, mediana de dos ejecuciones, sin carga ni warm-up (13 s):

| Mediana | Media | p80 | p95 | Peticiones > 1 s | Memoria GPU pico |
|---|---|---|---|---|---|
| 92 ms | 246 ms | 237 ms | 523 ms | 31 | 73,6 GiB |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 62,5 GB en bf16 para los pesos; el autor reporta un pico de 73,6 GiB en nvidia-smi con max_length 32.768.
- GPU recomendadas: una sola GPU con al menos 80 GB, como A100 80 GB, H100 80 GB o RTX PRO 6000 (96 GB). El autor validó en RTX PRO 6000 Blackwell.
- No cabe en GPU de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en bf16. No se han publicado pesos cuantizados, por lo que no hay cifras verificadas para configuraciones de menor VRAM.
- Opciones de despliegue: el modelo se ejecuta mediante el código de karpo-decision (`karpo_decision.serve.engine:DecisionIndexEngine`) y el kit decision-index, no mediante vLLM, llama.cpp, Ollama o TGI, que no están soportados según la información disponible.
- Dependencias declaradas: torch >= 2.14, transformers >= 5.17, safetensors >= 0.6, Python 3.12 (probado con torch 2.14.1+cu130 y transformers 5.21.0).
- Latencia y throughput: mediana de 92 ms por petición en RTX PRO 6000 Blackwell con max_length 32.768; el autor no reporta throughput agregado con concurrencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| plantwaterer/kudhab | 31,27 B | 32.768 tokens | Decisión probabilística por destilación | Apache-2.0 | Pesos abiertos en HF |
| MachinePulseAI/karpo-decision-31B | no disponible | no disponible | Decisión probabilística (profesor) | MachinePulse Community License | Pesos en HF bajo licencia comunitaria |
| plantwaterer/munku | no disponible | no disponible | Fine-tune de Gemma 4 31B (componente del punto de partida) | Apache-2.0 | Pesos en HF |
| tattrongvu/Jeffan-31b-1710 | no disponible | no disponible | Fine-tune de Gemma 4 31B (componente del punto de partida) | Apache-2.0 (revisión cebfa86c) | Pesos en HF |

La comparativa con alternativas de la misma categoría (modelos de decisión) es limitada: no se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada. La diferencia principal de kudhab frente a karpo-decision-31B es la licencia (Apache-2.0 frente a MachinePulse Community License), lo que facilita su uso comercial sin las restricciones de la licencia del profesor.

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve probabilidades sobre opciones predefinidas. No es adecuado para tareas generativas.
- Rechaza peticiones con imágenes; solo procesa texto.
- Las preguntas que no caben en max_length junto con su estado se rechazan, nunca se truncan, lo que puede provocar fallos en pipelines que esperan siempre una respuesta.
- La matriz de readout no se entrena y se deriva del language-model head; su comportamiento fuera de la distribución de entrenamiento no está documentado.
- El rendimiento declarado (Decision Index 73,96) es autoinformado por el autor y no ha sido verificado de forma independiente en la información disponible.
- Los datos de entrenamiento son las preguntas del autor y las salidas del profesor; existe riesgo de sesgo hacia la distribución de esas preguntas y de heredar sesgos del profesor y del backbone Gemma 4.
- No se han publicado evaluaciones de sesgo, toxicidad ni robustez.
- Los idiomas soportados no están documentados; el comportamiento multilingüe es desconocido.
- La licencia Apache-2.0 del modelo es compatible con uso comercial, pero el profesor karpo-decision-31B está bajo MachinePulse Community License, cuya sección 8(f) regula los modelos entrenados solo sobre sus salidas; el autor afirma que kudhab cumple, pero conviene revisar los términos antes de un despliegue comercial.
- El modelo depende de código externo (karpo-decision y decision-index) fijado a commits concretos; cambios en esas dependencias pueden romper la compatibilidad.
- No hay pesos cuantizados publicados, lo que limita el despliegue en hardware de menor capacidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plantwaterer/kudhab
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Profesor (karpo-decision-31B): https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Repositorio de karpo-decision: https://github.com/machinepulse-ai/karpo-decision
- Componente del punto de partida (munku): https://huggingface.co/plantwaterer/munku
- Componente del punto de partida (Jeffan-31b-1710): https://huggingface.co/tattrongvu/Jeffan-31b-1710
- Kit decision-index: https://github.com/apolinario/decision-index
