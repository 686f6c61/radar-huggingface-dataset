# mhseo2/opd_sfto7acer_s1000_olmo31_32b_think_ot3math-step20

## Resumen
`opd_sfto7acer_s1000_olmo31_32b_think_ot3math-step20` es un checkpoint intermedio (paso 20) de un experimento de destilación on-policy (OPD) realizado por el usuario `mhseo2`. El modelo parte de un SFT de matemáticas de 7.298.011.136 parámetros (~7,3 B) sobre OLMo 3 base (`sft_olmo3base7b_acereason11_math_n204800-step1000`) y se destila hacia el profesor `allenai/Olmo-3.1-32B-Think` (revisión `97ade57a9cc5`). No es un modelo nuevo entrenado desde cero, sino un ajuste fino del alumno para imitar la distribución de tokens del profesor en problemas de matemáticas.

El problema que aborda es la transferencia de capacidad de razonamiento largo desde un profesor de 32 B a un alumno denso de 7,3 B sin necesidad de etiquetas ni recompensas de tarea: la señal de entrenamiento es la KL inversa por token calculada sobre las propias rollouts del alumno. Esto lo hace relevante para quien investiga pipelines de destilación con generación on-policy, ya que documenta la infraestructura completa (BSC MareNostrum 5, 8× H100, FSDP + vLLM) y el esquema de prompts (OpenThoughts3 math, 53.105 preguntas sin respuestas).

La información disponible no incluye resultados de evaluación (el autor indica que están en cola), ni longitud de contexto, ni idiomas, ni datos de arquitectura más allá de la pertenencia a la familia OLMo 3. Se trata además de un artefacto de investigación con 0 descargas y 0 likes en el momento del registro, por lo que debe tratarse como experimental y no validado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia OLMo 3 (deducido de los tags `olmo3` / `olmo`); configuración de capas y cabezas no disponible |
| Parametros totales | 7.298.011.136 (~7,3 B), dato real de los safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el repositorio solo publica safetensors (sin GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en 3 shards (`model-00001-of-00003.safetensors` a `model-00003-of-00003.safetensors`) + `model.safetensors.index.json`, tokenizer BPE (`tokenizer.json`, `vocab.json`, `merges.txt`), `chat_template.jinja`, `generation_config.json` |
| Modelo base (alumno) | `mhseo2/sft_olmo3base7b_acereason11_math_n204800-step1000` (AceReason-1.1 math SFT, paso 1000) |
| Profesor | `allenai/Olmo-3.1-32B-Think`, revision `97ade57a9cc5` |
| Metodo | Destilación on-policy, KL inversa por token (estimador k1, top-32 del profesor) |
| Checkpoint | Paso 20 |
| Tamano del repositorio | 14,6 GB |
| Autor / fecha | `mhseo2` / creado el 2026-10-28 |

## Arquitectura y entrenamiento
El alumno es un decoder-only de ~7,3 B de parámetros heredado del SFT matemático de AceReason-1.1 (paso 1000), a su vez construido sobre OLMo 3 base 7B según la nomenclatura del propio identificador del repositorio. No hay información sobre número de capas, dimensión oculta, mecanismo de atención (completa o híbrida), tipo de normalización ni tokenizer más allá de que se publican `vocab.json` y `merges.txt`, compatibles con un tokenizer BPE. Tampoco se documenta la composición exacta del dataset de SFT original.

El entrenamiento consiste en destilación on-policy: en cada paso se muestrean 60 prompts de OpenThoughts3 math (conjunto de 53.105 preguntas sin respuestas) y se generan 4 rollouts por prompt con temperatura 1 y hasta 32.768 tokens de respuesta; la pérdida es la KL inversa por token entre alumno y profesor (estimador k1, restringido al top-32 del profesor), sin recompensa de tarea. Se usan 20 pasos con learning rate constante de 5e-6, AdamW y weight decay 0,01, lo que equivale a del orden de 4.800 rollouts y 1.200 instancias de prompt únicas como máximo. La infraestructura fue BSC MareNostrum 5 con 2 nodos × 4 H100 (8 GPU en total): alumno en FSDP con vLLM para la generación y profesor servido con vLLM en TP2. El código corresponde al árbol `mopdRL` en la revisión `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`).

## Capacidades
- Generación de texto con modo "pensamiento": el checkpoint se destila explícitamente desde `Olmo-3.1-32B-Think`, por lo que la salida esperada es una cadena de razonamiento seguida de respuesta.
- Razonamiento matemático de competición: el entrenamiento se hace exclusivamente sobre problemas de OpenThoughts3 math, con respuestas de hasta 32.768 tokens.
- Generación de cadenas de razonamiento largas: el límite de generación usado durante el entrenamiento fue de 32.768 tokens por respuesta.
- Conversación con plantilla de chat: se incluye `chat_template.jinja` para formatear turnos.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modo thinking es el único mecanismo multi-paso descrito.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales: ninguna adicional (sin visión, sin audio, sin decodificación especulativa documentada).

## Casos de uso
- Generación de datos de razonamiento matemático: usar el modelo como generador masivo de soluciones paso a paso sobre problemas tipo competición, con temperatura 1 y hasta 32.768 tokens, para construir datasets de SFT o de preferencias a partir de las respuestas filtradas por verificador.
- Continuación de pipelines de destilación: al ser un checkpoint del paso 20, sirve como punto de partida para seguir aplicando OPD hacia el profesor de 32 B, o como ablación para medir cuánto se gana con más pasos (por ejemplo, comparar paso 20 frente a pasos posteriores con la misma receta).
- Evaluación offline de razonamiento matemático: desplegarlo con vLLM en modo batch y calcular mean@8 sobre AIME 2025, AIME 2026 y HMMT Feb 2025, replicando el protocolo que el autor dejó pendiente.
- Ajuste fino específico de dominio en una sola GPU: con 7,3 B de parámetros y pesos en safetensors, un LoRA sobre 24 GB de VRAM es viable para especializar el modelo a un temario concreto (por ejemplo, olimpiadas nacionales) sin reentrenar desde cero.
- Tutor de matemáticas autoalojado: con licencia Apache-2.0 y un peso de ~14,6 GB, se puede servir en infraestructura propia para un producto educativo que requiera mostrar el desarrollo del problema en lugar de solo la respuesta final.
- Investigación en métodos de destilación: el repositorio documenta hiperparámetros (lr 5e-6 constante, weight decay 0,01, KL k1 sobre top-32, 60×4 rollouts por paso) e infraestructura, lo que permite reproducir o comparar variantes (temperatura, tamaño de muestra del profesor, número de rollouts) con una base concreta.
- Filtrado y verificación de soluciones: dado su formato de razonamiento explícito, puede emplearse para reescribir o completar soluciones parciales de un corpus matemático antes de pasarlas a un verificador simbólico.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica que las evaluaciones (mean@8 en AIME 2025, AIME 2026 y HMMT Feb 2025) están "pendientes, en cola para los workers de evaluación de sky" y que las puntuaciones se añadirán cuando terminen. No se deben asumir cifras de MMLU, GSM8K, HumanEval ni de los conjuntos citados.

## Requisitos de hardware
- VRAM en BF16/FP16: ~14,6 GB solo para pesos (coincide con el tamaño del repositorio); el KV cache adicional depende de la longitud de contexto, que no está documentada, por lo que el consumo a 32.768 tokens no se puede estimar con los datos disponibles.
- VRAM en cuantización: ~7,3 GB en INT8 y ~3,7-4 GB en INT4 (estimación teórica; no hay cuantizaciones publicadas en el repositorio, habría que generarlas).
- GPU profesionales: H100 o A100 80 GB para servir en BF16 con contexto largo o para fine-tuning completo; el entrenamiento original usó 8× H100 repartidas en 2 nodos.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 (24 GB) en BF16 con contexto moderado; en tarjetas de 16 GB requiere INT8 o INT4.
- Opciones de despliegue: vLLM (usado en el propio entrenamiento), SGLang o TGI para safetensors en BF16; llama.cpp u Ollama requieren convertir previamente a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`...ot3math-step20`) | 7.298.011.136 | no disponible | pendientes (AIME 2025/2026, HMMT Feb 2025) | Apache-2.0 | público en HF |
| `mhseo2/sft_olmo3base7b_acereason11_math_n204800-step1000` (base del alumno) | ~7 B según nomenclatura; no confirmado | no disponible | no disponible | no disponible | público en HF |
| `allenai/Olmo-3.1-32B-Think` (profesor) | ~32 B según nomenclatura; no confirmado | no disponible | no disponible | no disponible | público en HF |

La comparación cuantitativa no es posible con la información disponible: no hay métricas del alumno ni del profesor en esta ficha, y los parámetros de los modelos comparados se deducen únicamente de sus identificadores. Cualquier comparación de rendimiento frente a otros modelos matemáticos de ~7 B (por ejemplo, variantes de Qwen matemáticas) requeriría ejecutar la evaluación mean@8 que el autor aún no ha publicado.

## Limitaciones y advertencias
- Checkpoint intermedio: solo 20 pasos de destilación, sobre un total no especificado. No hay garantía de que represente el estado final ni el mejor del experimento.
- Sin evaluación: no existe ninguna métrica verificable en el repositorio; las cifras de AIME y HMMT están pendientes. No se debe asumir ninguna mejora sobre el modelo base.
- Dominio estrecho: los prompts de entrenamiento son exclusivamente matemáticas de OpenThoughts3; otras capacidades (código, conocimiento general, instrucciones) no se han entrenado ni evaluado en este paso y podrían degradarse respecto al modelo base.
- Idiomas no declarados: no hay información sobre soporte multilingüe; el comportamiento en castellano es desconocido.
- Contexto no documentado: aunque las respuestas de entrenamiento llegan a 32.768 tokens, no se especifica la ventana de contexto del modelo, lo que impide planificar el despliegue con seguridad.
- Sin soporte documentado de tool calling ni de uso agéntico: no se debe asumir compatibilidad con APIs de funciones.
- Riesgo de alucinación: es un modelo de razonamiento matemático entrenado con KL hacia un profesor, no con verificación simbólica; puede producir cadenas de razonamiento plausibles con resultados incorrectos.
- Sesgos: no evaluados ni documentados.
- Licencia: Apache-2.0 permite uso comercial y modificaciones, pero el modelo base y el profesor tienen licencias propias no verificadas en la información proporcionada; conviene comprobar la cadena de licencias antes de un despliegue en producción.
- Madurez: 0 descargas y 0 likes en el momento del registro, sin issues ni validación de la comunidad; es un artefacto de investigación.
- Reproducibilidad: el código se referencia por hash de árbol (`mopdRL`, `f1bcc9eb...`) sin URL; reproducir el entrenamiento exige acceso a la infraestructura descrita (8× H100) y al profesor servido en vLLM.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/mhseo2/opd_sfto7acer_s1000_olmo31_32b_think_ot3math-step20
- Modelo base (alumno, SFT matemático): https://huggingface.co/mhseo2/sft_olmo3base7b_acereason11_math_n204800-step1000
- Profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think (revisión `97ade57a9cc5`)
- Dataset de prompts: OpenThoughts3 math (53.105 preguntas sin respuestas), citado en la model card sin URL
- Código: árbol `mopdRL`, revisión `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`), sin URL proporcionada
- Infraestructura de entrenamiento: BSC MareNostrum 5 (2 nodos × 4 H100), sin URL proporcionada
