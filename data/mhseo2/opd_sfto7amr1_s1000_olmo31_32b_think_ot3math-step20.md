# mhseo2/opd_sfto7amr1_s1000_olmo31_32b_think_ot3math-step20

## Resumen

`opd_sfto7amr1_s1000_olmo31_32b_think_ot3math-step20` es un checkpoint intermedio de un experimento de destilación on-policy (OPD) realizado por el usuario `mhseo2`. El modelo parte de un "student" de 7.298.011.136 parámetros (7,3 B) afinado previamente en matemáticas (`mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step1000`, derivado de OLMo 3 base 7B) y lo alinea, respuesta a respuesta, con las distribuciones de un profesor mucho mayor: `allenai/Olmo-3.1-32B-Think`. El nombre del repositorio induce a confusión ("olmo31_32b"), pero el profesor es de 32 B y el modelo publicado es de 7,3 B.

El objetivo es transferir el comportamiento de razonamiento extendido ("think") del profesor de 32 B a un student de 7 B sin usar recompensas de tarea, únicamente minimizando la KL inversa por token sobre las propias rollouts del student. El entrenamiento se hizo sobre 53.105 preguntas de matemáticas de OpenThoughts3 (sin respuestas), con 60 prompts x 4 rollouts por paso, temperatura 1 y respuestas de hasta 32.768 tokens, en el superordenador BSC MareNostrum 5 (2 nodos x 4 H100).

Es relevante ahora porque documenta una receta de destilación on-policy reproducible sobre la familia OLMo 3, totalmente abierta (Apache 2.0, pesos safetensors), en un momento en el que la comunidad busca alternativas de razonamiento matemático de 7 B entrenadas sin depender de RL con verificación. Ahora bien: se trata de un checkpoint en el paso 20, con las evaluaciones (AIME 2025, AIME 2026, HMMT Feb 2025, mean@8) todavía pendientes, 0 descargas y sin validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia OLMo 3; base `olmo3base7b`) |
| Parámetros totales | 7.298.011.136 (7,3 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el entrenamiento generó respuestas de hasta 32.768 tokens |
| Tipos de cuantización | no disponible; el repositorio solo publica safetensors (4 shards). No hay GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponibles; el corpus de entrenamiento (matemáticas de OpenThoughts3) es mayoritariamente en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, 4 shards (`model-00001-of-00004` … `model-00004-of-00004`) + `model.safetensors.index.json` |
| Tokenizador | BPE con `tokenizer.json`, `vocab.json`, `merges.txt` y `chat_template.jinja` propios |
| Tamaño del repositorio | 14,6 GB |
| Pipeline declarado en HuggingFace | no disponible |
| Checkpoint | paso 20 del entrenamiento de destilación on-policy |

## Arquitectura y entrenamiento

Arquitectura: transformer decoder-only denso de la familia OLMo 3 (el student base es `olmo3base7b`), por tanto sin mezcla de expertos ni mecanismos de estado recurrente. El repositorio incluye una plantilla de chat propia (`chat_template.jinja`), lo que indica que el formato conversacional y los tokens de "thinking" vienen definidos por el pipeline del autor y no por el tokenizador original de AI2.

Entrenamiento: destilación on-policy hacia `allenai/Olmo-3.1-32B-Think` (revisión `97ade57a9cc5`). En cada paso se muestrean 60 prompts de OpenThoughts3 (conjunto de 53.105 preguntas de matemáticas sin respuestas) y se generan 4 rollouts por prompt con temperatura 1 y hasta 32.768 tokens; sobre esas rollouts se calcula la pérdida —KL inversa por token frente al profesor con top-32 del profesor (variante k1)— sin recompensa de tarea ni verificación de la solución. Optimización con AdamW, learning rate constante de 5e-6 y weight decay 0.01. Infraestructura: BSC MareNostrum 5, 2 nodos x 4 H100, con student en FSDP + vLLM y profesor servido con vLLM en TP2. El código corresponde al árbol `mopdRL` (commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`, paquete `bsc-olmo-base-opd-2026-10-26`).

Innovación destacable: no introduce un módulo arquitectónico nuevo, sino una receta de OPD (generación con el student + scoring del profesor en línea) aplicada a razonamiento matemático con cadenas de pensamiento muy largas, lo que evita el coste de RL con verificador a cambio de depender de la calidad del profesor de 32 B.

## Capacidades

- Generación de texto con razonamiento matemático paso a paso, incluyendo trazas de pensamiento largas (hasta 32.768 tokens durante el entrenamiento).
- Resolución de problemas de competición (el corpus de entrenamiento es de matemáticas tipo AIME/HMMT/olympiad), en el formato de razonamiento del profesor OLMo 3.1 Think.
- Modo "think" heredado del profesor: el modelo produce razonamiento explícito antes de la respuesta, guiado por la plantilla de chat incluida en el repositorio.
- Conversación multi-turno en el formato definido por `chat_template.jinja`.
- Capacidades multilingües: no declaradas; el entrenamiento es de matemáticas en inglés, por lo que el rendimiento fuera de ese dominio e idioma no está caracterizado.
- Tool calling / function calling: no documentado ni entrenado explícitamente en esta receta.
- Comportamiento agéntico y multi-step con herramientas: no documentado.
- Capacidades especiales (visión, audio): no disponibles.
- Alineación general (instrucciones abiertas, ayuda, seguridad): no evaluada; el ajuste se limita a matemáticas y a la imitación del profesor.

## Casos de uso

- Generación de trazas de razonamiento matemático para construir datasets de destilación: el modelo produce soluciones paso a paso en el mismo formato del profesor OLMo 3.1 Think, lo que permite reutilizar esas rollouts como datos de SFT para modelos más pequeños o para filtrar por consistencia.
- Investigación en destilación on-policy: sirve como referencia reproducible de un checkpoint intermedio (paso 20) para estudiar la evolución de la KL inversa, la longitud de las trazas y la emergencia de conductas del profesor a lo largo del entrenamiento.
- Tutoría matemática con explicación: para problemas de nivel secundaria y competición, el modelo puede exponer el desarrollo completo antes del resultado, útil en entornos educativos donde interesa el procedimiento y no solo la respuesta.
- Segmentación de pipelines de evaluación de razonamiento: al ser un student de 7,3 B con plantilla de chat propia, es adecuado para montar comparativas controladas (mismo prompt, mismo presupuesto de tokens) frente al profesor de 32 B y medir la brecha de destilación.
- Punto de partida para fine-tuning posterior: al estar bajo Apache 2.0 y en safetensors estándar, se puede continuar el entrenamiento (SFT con verificación, DPO o RL con verificador) sin restricciones de licencia.
- Prototipado de asistentes de resolución de problemas en local: con 14,6 GB de pesos en bf16 cabe en GPUs de 24 GB con lote pequeño, lo que permite experimentar en una estación de trabajo sin infraestructura multinodal.
- Base para estudiar el colapso de longitud de contexto: útil en investigación sobre control del presupuesto de razonamiento (cuántos tokens "piensa" el modelo antes de responder) en un student pequeño destilado de uno grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las evaluaciones están en cola ("queued for the sky eval workers") y que las puntuaciones se añadirán al terminar:

| Benchmark | Métrica | Resultado |
|---|---|---|
| AIME 2025 | mean@8 | pendiente de publicación |
| AIME 2026 | mean@8 | pendiente de publicación |
| HMMT Feb 2025 | mean@8 | pendiente de publicación |

No se dispone de datos de MMLU, GSM8K, HumanEval ni MATH para este checkpoint.

## Requisitos de hardware

- Pesos en bf16/fp16: ~14,6 GB (tamaño real del repositorio). Requiere al menos 16-18 GB de VRAM libres para cargar el modelo con overhead de runtime.
- Cuantización 8-bit: ~7,5 GB estimados; 4-bit: ~4,5 GB estimados. Son estimaciones de cálculo, no artefactos publicados: el repositorio no incluye GGUF, AWQ ni GPTQ, así que habría que generarlos.
- GPU consumer: cabe en RTX 4090 / RTX 3090 (24 GB) en bf16 con lote 1 y contexto moderado; en 4-bit podría ejecutarse en GPUs de 8-12 GB, con degradación de calidad no medida.
- GPU de datacenter: A100 40/80 GB y H100 80 GB son las opciones razonables para servir con contexto largo y concurrencia, ya que la caché KV pasa a dominar el consumo cuando las trazas alcanzan decenas de miles de tokens (el entrenamiento usó respuestas de hasta 32.768 tokens).
- Despliegue: Transformers como referencia obligada (incluye `chat_template.jinja`); vLLM y SGLang si la versión instalada soporta la arquitectura OLMo 3 (hay que verificarlo, no está confirmado en la información disponible); llama.cpp/Ollama solo tras conversión propia a GGUF.
- Entrenamiento (referencia del autor): 2 nodos x 4 H100, student con FSDP + vLLM y profesor con vLLM en TP2, es decir, 8 H100 para ajustar un student de 7,3 B contra un profesor de 32 B.
- Latencia y throughput: no disponibles. Cualitativamente, el modo "think" con trazas de hasta 32.768 tokens implica latencias por petición altas en una sola GPU; se recomienda medir con el prompt real antes de dimensionar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`opd_...olmo31_32b_think_ot3math-step20`) | 7,3 B (denso) | no disponible | pendientes (AIME 2025/2026, HMMT Feb 2025) | Apache 2.0 | HuggingFace, 0 descargas, 0 likes, sin validación externa |
| Student base (`sft_olmo3base7b_amr1_0528_math_n204800-step1000`) | 7,3 B (denso) | no disponible | no disponible | no disponible en la información (el modelo publicado declara Apache 2.0) | HuggingFace |
| Profesor (`allenai/Olmo-3.1-32B-Think`) | 32 B (según denominación del autor) | no disponible | no disponible | no disponible en la información | HuggingFace (revisión `97ade57a9cc5`) |

Otras alternativas del nicho (destilados de razonamiento matemático de ~7 B, tipo DeepSeek-R1-Distill-Qwen-7B o Qwen2.5-Math-7B) no se incluyen con cifras porque no se dispone de sus datos verificados en la información suministrada; una comparación rigurosa exigiría además las métricas pendientes de este checkpoint.

## Limitaciones y advertencias

- Checkpoint intermedio: solo 20 pasos de OPD sobre un student ya ajustado en matemáticas; no es un modelo terminado ni se ha seleccionado por rendimiento.
- Sin evaluación publicada: las métricas de AIME 2025, AIME 2026 y HMMT Feb 2025 están pendientes. No hay ninguna evidencia cuantitativa de calidad en el momento de escribir la ficha.
- Riesgo de alucinación matemática: la pérdida es KL inversa frente al profesor sin recompensa de tarea ni verificador, de modo que el student puede imitar la forma del razonamiento (incluidos errores y atajos del profesor) sin garantía de corrección del resultado.
- Dominio estrecho: entrenado exclusivamente con preguntas de matemáticas de OpenThoughts3; no hay evidencia de buen comportamiento en código, redacción, extracción de información u otras tareas.
- Idiomas: no se declaran idiomas soportados; el entrenamiento es en inglés, por lo que el rendimiento en castellano es desconocido.
- Sin soporte documentado de tool calling ni de flujos agénticos; no debe asumirse que respete esquemas de funciones.
- Longitud de contexto no declarada: aunque se entrenó con rollouts de hasta 32.768 tokens, el límite efectivo del modelo no se especifica en la información disponible.
- Sesgos: no evaluados. Al derivar de OLMo 3 base y de un profesor ajustado con datos no descritos, los sesgos de ambos se heredan sin auditoría publicada.
- Licencia: Apache 2.0 permite uso comercial, pero se distribuye "tal cual", sin garantías, y el autor no ofrece soporte ni mantenimiento; conviene verificar la cadena de licencias del student base antes de un despliegue en producción.
- Repositorio sin tracción: 0 descargas y 0 likes; el nombre del modelo induce a error sobre el tamaño (menciona 32B, pero los pesos son de 7,3 B).
- Requiere la plantilla de chat incluida: usarlo con otra plantilla puede degradar gravemente el formato de razonamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mhseo2/opd_sfto7amr1_s1000_olmo31_32b_think_ot3math-step20
- Student base: https://huggingface.co/mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step1000
- Profesor (destilación): https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Dataset de prompts: OpenThoughts3 (matemáticas, 53.105 preguntas sin respuestas), citado en la model card; no se incluye URL en la información disponible.
- Infraestructura: BSC MareNostrum 5, citado en la model card; no se incluye URL.
- Código de entrenamiento: árbol `mopdRL`, commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`); no se proporciona repositorio público.
