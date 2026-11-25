# GeneralReasoning/Avalon-M1-Mini

## Resumen

Avalon-M1-Mini es un modelo de lenguaje de 120.000 millones de parámetros (12.000 millones activos por token) desarrollado por GeneralReasoning como un *fine-tune* del NVIDIA Nemotron 3 Super 120B-A12B. Su particularidad no reside en la arquitectura base, sino en el paradigma de entrenamiento: ha sido ajustado mediante *reinforcement learning from collective rewards* (RLCR), una variante de RL en la que se recompensa a una organización completa de agentes como una unidad, en lugar de asignar crédito individual a cada agente. El modelo está pensado para interpretar todos los roles de una organización multiagente (CEO, especialistas, revisores) coordinados mediante un tablero de mensajes compartido.

La arquitectura subyacente es Nemotron-H, un híbrido de 88 capas que combina 40 capas Mamba-2, 40 capas de mezcla de expertos latente (latent MoE) y 8 capas de atención. Emplea 512 expertos enrutados más uno compartido, con 22 expertos activos por token y un tamaño latente de 1.024. La ventana de contexto de entrenamiento es de 131.072 tokens, aunque la configuración permite posiciones más largas y el autor indica que sirve hasta 262.144.

Es relevante ahora porque propone un enfoque poco habitual: un mismo *checkpoint* que aprende a gestionar equipos, especializarse y revisar el trabajo de sus compañeros, con recompensas colectivas en 147 entornos de entrenamiento. Se distribuye con licencia MIT, pero el propio autor lo etiqueta explícitamente como modelo de investigación, no apto para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H híbrida: 40 capas Mamba-2, 40 capas latent MoE, 8 capas de atención (88 capas) |
| Parametros totales | 120.668.707.840 (≈120,7 B) |
| Parametros activos | 12 B por token |
| Longitud de contexto | 131.072 tokens de entrenamiento; servible hasta 262.144 |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el autor no documenta cuantizaciones oficiales) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) |

Datos adicionales de la arquitectura: 512 expertos enrutados más 1 compartido, 22 expertos enrutados activos por token, tamaño latente de 1.024, *hidden size* de 4.096, vocabulario de 131.072, 32 cabezas de consulta y 2 de clave-valor con dimensión de cabeza 128. La cabeza de predicción multi-token se ha eliminado (`num_nextn_predict_layers: 0`).

## Arquitectura y entrenamiento

La base es Nemotron-H, un transformer híbrido que sustituye la mayoría de capas de atención por capas Mamba-2 (modelo de espacio de estados) y por capas de mezcla de expertos latente. Solo 8 de las 88 capas usan atención propiamente dicha, lo que reduce el coste computacional y de memoria en contextos largos. El MoE latente enruta cada token hacia 22 de los 512 expertos, proyectando a un espacio latente de 1.024 dimensiones, lo que abarata el enrutamiento frente a un MoE clásico.

El entrenamiento de Avalon-M1-Mini consta de dos fases. Primero, un *supervised fine-tuning* del modelo base sobre trayectorias de organizaciones de agentes. Después, RLCR (*reinforcement learning from collective rewards*) sobre 128 GPU NVIDIA H200: cada paso del optimizador muestrea varios cientos de tareas de 147 entornos (ingeniería de software, finanzas y simulaciones de negocio, ciencia, matemáticas y demostraciones, juegos, investigación profunda, sanidad y tareas profesionales), ejecuta un grupo de organizaciones por tarea con presupuestos organizativos aleatorizados (de 0 a 8 especialistas) y actualiza a todos los agentes de una organización con la misma ventaja colectiva relativa al grupo. No se usa asignación de crédito por agente. El modelo emplea un formato de chat estilo ChatML con bloques `` antes de responder o invocar herramientas.
- Llamada a herramientas (*tool calling*) en formato XML: `<tool_call>`, `<function=...>` y `<parameter=...>`, con resultados devueltos mediante el rol `tool`.
- Organización multiagente: el modelo puede actuar como CEO que contrata especialistas con títulos a su elección (presupuesto de 0 a 8 especialistas), coordinarlos mediante un tablero de mensajes (canales, mensajes directos, reacciones), un archivo compartido y un espacio de trabajo compartido, y entregar el resultado final.
- Roles múltiples con el mismo *checkpoint*: gestión, especialización y revisión del trabajo de compañeros.
- Razonamiento multi-paso y tareas de horizonte largo, gracias a la ventana de 131.072 tokens.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Investigación en sistemas multiagente: ejecutar organizaciones de agentes con el *harness* oficial (avalon-harness) para estudiar dinámicas de contratación, coordinación y revisión entre agentes, aprovechando que el modelo fue entrenado exactamente en ese entorno.
- Simulación de organizaciones empresariales: usar el modelo como CEO y especialistas en simulaciones de negocio y finanzas, uno de los 147 entornos de entrenamiento, para estudiar la asignación de tareas y el reparto de presupuesto organizativo.
- Evaluación de seguridad multiagente: al estar liberado explícitamente para experimentación en seguridad de sistemas multiagente, sirve para probar comportamientos emergentes de colusión, delegación o propagación de errores entre agentes.
- Ingeniería de software asistida por equipos de agentes: descomponer una tarea de programación en subtareas repartidas entre especialistas que comparten un espacio de trabajo y un archivo de mensajes, con revisión cruzada de los resultados.
- Investigación profunda (*deep research*): encargar al CEO la contratación de agentes de búsqueda y síntesis que colaboren a través del tablero de mensajes para producir un informe con contexto largo.
- Ejecución de un solo agente con herramientas: con presupuesto organizativo 0, el modelo opera como un agente convencional con *tool calling*, útil para comparar el rendimiento colectivo frente al individual en experimentos controlados.
- Matemáticas y demostraciones: repartir un problema entre agentes especialistas que verifiquen mutuamente los pasos, aprovechando el modo de razonamiento y la revisión entre compañeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona columnas "single" medidas con presupuesto 0 (ejecución de un solo agente con herramientas), pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de evaluaciones multiagente en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 241 GB (tamaño del repositorio), por lo que la inferencia en bf16 requiere al menos 2 GPU de 80 GB o una configuración equivalente con paralelismo tensorial.
- El modelo fue entrenado con RL sobre 128 GPU NVIDIA H200; para servicio se recomienda hardware de clase H100/H200 o A100 de 80 GB en configuraciones multi-GPU.
- No cabe en GPU de consumo (RTX 4090 de 24 GB) en bf16; requeriría cuantización agresiva no documentada por el autor, por lo que no se puede garantizar su viabilidad en hardware de consumo.
- Opciones de despliegue: SGLang y vLLM (indicados por el autor), y `transformers` con `trust_remote_code=True`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Avalon-M1-Mini | 120,7 B / 12 B | 131.072 (servible 262.144) | MIT | Hugging Face, bf16 safetensors | Fine-tune RLCR para organizaciones multiagente; solo inglés; solo investigación |
| NVIDIA Nemotron 3 Super 120B-A12B (base) | 120 B / 12 B | 131.072 | no disponible en la informacion | Hugging Face | Modelo base del que deriva Avalon-M1-Mini; arquitectura Nemotron-H idéntica |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la informacion proporcionada |

La comparación más directa es con el propio modelo base: Avalon-M1-Mini conserva la arquitectura y el tamaño, pero añade el ajuste por RLCR y el formato de chat con razonamiento y herramientas XML. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con otras alternativas.

## Limitaciones y advertencias

- Modelo de investigación: el autor indica explícitamente que no está pensado para uso en producción.
- Entrenado únicamente para su propio *harness* (avalon-harness); en otros entornos como OpenCode funciona como un agente único con herramientas distintas y se espera un rendimiento inferior.
- Solo soporta inglés según la model card.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir contenido incorrecto, especialmente en tareas de horizonte largo.
- Sesgos conocidos: no documentados en la información proporcionada.
- La licencia MIT permite uso comercial, pero la recomendación explícita del autor es limitarlo a investigación; conviene evaluar el riesgo antes de cualquier despliegue productivo.
- El formato de llamada a herramientas exige que los `arguments` lleguen a la plantilla como un mapeo (como hacen SGLang y vLLM); con `transformers` hay que parsear previamente las cadenas JSON de estilo OpenAI.
- El tamaño del repositorio (241,4 GB) y la necesidad de múltiples GPU de 80 GB limitan su accesibilidad.
- No se documentan cuantizaciones oficiales, lo que dificulta el despliegue en hardware más modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GeneralReasoning/Avalon-M1-Mini
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-Base-BF16
- Paper: https://arxiv.org/abs/2611.32539
- Harness: https://github.com/GeneralReasoning/avalon-harness/
- Página de presentación: https://www.gr.inc/releases/avalon-m1
