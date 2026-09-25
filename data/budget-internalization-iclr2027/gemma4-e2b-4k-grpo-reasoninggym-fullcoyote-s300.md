# budget-internalization-iclr2027/gemma4-e2b-4k-grpo-reasoninggym-fullcoyote-s300

## Resumen

El modelo `gemma4-e2b-4k-grpo-reasoninggym-fullcoyote-s300` es un ajuste fino por aprendizaje por refuerzo de `google/gemma-4-E2B-it`, publicado por la cuenta anónima `budget-internalization-iclr2027` como parte de un envío a ICLR 2027. El entrenamiento aplica GRPO (Group Relative Policy Optimization) sobre tareas de Reasoning Gym —problemas de razonamiento generados de forma procedimental con respuestas en formato `\boxed{}`— imponiendo un presupuesto de generación de 4.096 tokens: cualquier respuesta que agota ese presupuesto recibe recompensa cero. El objetivo declarado es estudiar la internalización de presupuestos de tokens en políticas de razonamiento.

Técnicamente se trata de un checkpoint intermedio (paso 300 de un máximo de 3 épocas) con pesos en F32, lo que explica que el repositorio ocupe 20,5 GB para 5.123.178.051 parámetros. El pipeline declarado en HuggingFace es `any-to-any` y entre los tags figuran `image-text-to-text` y `reasoning-gym`, pero la model card no documenta ni la arquitectura interna ni las capacidades multimodales reales del modelo.

Su relevancia es fundamentalmente de investigación: es un artefacto reproducible de RLVR (Reinforcement Learning with Verifiable Rewards) con hiperparámetros y esquema de recompensa explícitos, útil como referencia para estudiar cómo las políticas aprenden a ajustar la longitud de sus cadenas de razonamiento. No es un modelo orientado a producción: no tiene benchmarks publicados, acumula 0 descargas y su licencia presenta una discrepancia relevante entre los tags y la propia model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags indican `gemma4`; la model card no describe la arquitectura interna) |
| Parametros totales | 5.123.178.051 (recuento real de safetensors, ≈5,12 mil millones) |
| Parametros activos | no disponible (no se documenta que sea MoE) |
| Longitud de contexto | no disponible (el único dato es el presupuesto de generación de 4.096 tokens usado en entrenamiento, que no equivale a la ventana de contexto) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en F32, sin GGUF ni cuantizaciones precalculadas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 según los tags del repositorio; la model card afirma que hereda la licencia del modelo base (`google/gemma-4-E2B-it`), lo que apunta al Gemma 4 License |
| Formato de pesos | safetensors (dtype F32) |
| Modelo base | google/gemma-4-E2B-it (relación: finetune) |
| Pipeline declarado | any-to-any |
| Librería | transformers |
| Autor | budget-internalization-iclr2027 |
| Fecha de publicación | 2026-09-25 |
| Descargas / likes | 0 / 0 |
| Compatibilidad | tag `endpoints_compatible` (compatible con Inference Endpoints) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura del modelo base. Los tags apuntan a la familia `gemma4` y a un pipeline `any-to-any` con `image-text-to-text`, lo que sugiere capacidades multimodales, pero la model card no lo confirma ni describe el mecanismo de atención, la tokenización o la composición de capas. El único dato estructural verificable es el recuento de parámetros (5.123.178.051) y el dtype F32 de los pesos publicados.

El entrenamiento sí está documentado con precisión. Se parte de `google/gemma-4-E2B-it` y se aplica GRPO con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Los datos son tareas de Reasoning Gym generadas de forma procedimental, con verificación automática de la respuesta extraída del bloque `\boxed{}`. La configuración es: 32 prompts × 8 rollouts por paso, 300 pasos, optimizador Adam con schedule coseno, LR pico de 3e-6 y 10 pasos de calentamiento, un máximo de 3 épocas. La innovación metodológica reside en el esquema de recompensa: las respuestas que alcanzan el presupuesto de 4.096 tokens reciben recompensa cero, de modo que la política debe aprender a resolver la tarea dentro de ese límite en lugar de simplemente alargar la cadena de razonamiento. Los prompts se renderizan con la plantilla de chat del modelo base.

## Capacidades

- Razonamiento procedimental: entrenado específicamente sobre tareas de Reasoning Gym, con respuestas verificables extraíbles de un bloque `\boxed{}`.
- Generación de cadenas de razonamiento con presupuesto acotado: la política está optimizada para no superar los 4.096 tokens de generación.
- Ajuste por refuerzo con recompensa verificable: el modelo es un artefacto de RLVR reproducible, no solo un modelo de chat.
- Capacidades multimodales: el tag `image-text-to-text` y el pipeline `any-to-any` las sugieren, pero no están documentadas ni verificadas en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información disponible (el razonamiento multi-paso interno sí está implícito en el entrenamiento con cadenas largas).
- Capacidades multilingües: no disponible; no se declara ningún conjunto de idiomas.
- Modo thinking o razonamiento explícito: no disponible como capacidad declarada formalmente.

## Casos de uso

- Investigación en internalización de presupuestos de tokens: el modelo permite reproducir y analizar cómo una política GRPO modifica la longitud de sus cadenas de razonamiento cuando las respuestas que agotan el presupuesto reciben recompensa cero. Es exactamente el escenario para el que fue entrenado.
- Ablaciones de hiperparámetros de GRPO: con LR pico 3e-6, 32×8 rollouts y 300 pasos documentados, sirve como punto de comparación reproducible frente a otras configuraciones del mismo grupo de experimentos (variantes por paso o por presupuesto).
- Generación de datos sintéticos con respuesta verificable: se pueden muestrear soluciones a problemas de lógica y matemáticas y filtrarlas automáticamente comprobando el contenido del bloque `\boxed{}`, sin necesidad de un verificador externo complejo.
- Destilación de trazas de razonamiento: las cadenas de hasta 4.096 tokens generadas por este checkpoint pueden usarse como datos de entrenamiento para modelos menores (destilación) o como referencia para comparar distribuciones de longitud.
- Evaluación de robustez fuera de dominio: al estar entrenado únicamente con tareas procedimentales de Reasoning Gym, resulta un caso de estudio útil para medir degradación al trasladarlo a problemas reales de matemáticas o lógica no vistos.
- Docencia e investigación académica en RLVR: el checkpoint permite a un grupo de investigación montar un pipeline completo de GRPO con verificación de recompensas sin partir de cero, usando los hiperparámetros publicados como línea base.
- Baseline de eficiencia tokens-calidad: sirve para medir la relación entre número de tokens generados y tasa de acierto en tareas verificables, comparando el paso 300 con el modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de las propias tareas de Reasoning Gym, y la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo (los resultados obtenidos correspondían a páginas sobre el presupuesto del Estado francés y a una empresa de alquiler de vehículos, sin relación alguna).

## Requisitos de hardware

- VRAM estimada para inferencia con los pesos publicados (F32): aproximadamente 20,5 GB solo para los pesos, más el estado del optimizador (no necesario en inferencia), la caché KV y las activaciones. En la práctica, entre 25 y 30 GB según la longitud de contexto.
- Conversión a otras precisiones (estimación aritmética a partir del recuento de parámetros, no verificada con el modelo real): BF16 ≈ 10,3 GB, int8 ≈ 5,1 GB, 4 bits ≈ 2,6 GB.
- GPU recomendadas: H100 80 GB o A100 80 GB para F32 con contexto amplio; A100 40 GB o RTX 5090 32 GB para F32 con contexto reducido; RTX 4090 24 GB resulta ajustado para F32 (20,5 GB de pesos dejan muy poco margen para caché KV).
- GPU de consumo: sí cabe en tarjetas de 24 GB si se convierte a BF16 o a cuantización de 8/4 bits (RTX 3090, RTX 4090, RTX 5090). En F32 nativo no es recomendable en 24 GB.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `device_map="auto"` (documentado en la model card) y vLLM mediante `vllm serve` (también documentado). No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requerirían convertir el modelo previamente. El tag `endpoints_compatible` indica compatibilidad con HuggingFace Inference Endpoints.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo, TTFT ni rendimiento con lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma4-e2b-4k-grpo-reasoninggym-fullcoyote-s300 | 5.123.178.051 | no disponible | GRPO sobre Reasoning Gym, presupuesto 4.096 tokens, 300 pasos | apache-2.0 según tags; la card remite a la licencia del base | HuggingFace, 0 descargas, safetensors F32 |
| google/gemma-4-E2B-it (modelo base) | no disponible | no disponible | ajuste por instrucciones del modelo original | Gemma 4 License (según el enlace de la card) | HuggingFace (modelo oficial) |
| Otros checkpoints de RLVR de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de rendimiento, contexto ni licencia de alternativas comparables dentro de la misma categoría (modelos de razonamiento de 2-6 mil millones de parámetros ajustados con RLVR), por lo que no se incluye una comparación cuantitativa.

## Limitaciones y advertencias

- Checkpoint intermedio: se trata del paso 300 de un entrenamiento planificado a un máximo de 3 épocas, por lo que puede no estar convergido.
- Especialización estrecha: entrenado exclusivamente sobre tareas procedimentales de Reasoning Gym con formato `\boxed{}`. La generalización a matemáticas, lógica o código del mundo real no está documentada.
- Sesgo de longitud inducido por la recompensa: penalizar con cero toda respuesta que alcanza los 4.096 tokens puede empujar a la política a truncar razonamientos o a producir respuestas más cortas de lo óptimo en problemas que requieren cadenas largas.
- Discrepancia de licencia: los tags declaran apache-2.0, mientras que la model card afirma que el modelo hereda la licencia de `google/gemma-4-E2B-it` (Gemma 4 License, con sus condiciones de uso comercial y de redistribución). Esta contradicción debe resolverse antes de cualquier uso en producción. Es el caveat más importante del repositorio.
- Ausencia total de evaluación: sin benchmarks, sin métricas de las tareas de entrenamiento publicadas y sin datos de idiomas.
- Riesgo de alucinación: inherente a los modelos generativos y no cuantificado aquí. En tareas de razonamiento, el fallo puede aparecer dentro de la cadena de pensamiento aunque la respuesta final tenga formato correcto.
- Incertidumbre sobre las capacidades multimodales: el pipeline `any-to-any` y el tag `image-text-to-text` no se corresponden con el ejemplo de uso documentado (`AutoModelForCausalLM`, es decir, generación de texto). La funcionalidad multimodal real no está confirmada.
- Coste de despliegue elevado por el dtype F32 (20,5 GB de pesos), sin cuantizaciones oficiales publicadas.
- Trazabilidad limitada: autor anónimo, 0 descargas y 0 likes. No hay garantía de revisión por pares ni de mantenimiento del repositorio. Procede de un envío a ICLR 2027 y debe tratarse como artefacto de investigación, no como modelo listo para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-4k-grpo-reasoninggym-fullcoyote-s300
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia referenciada en la model card: https://ai.google.dev/gemma/docs/gemma_4_license
- Búsqueda web: no se encontró ningún resultado relevante sobre el modelo. Los resultados devueltos correspondían a sitios sobre el presupuesto del Estado francés (budget.gouv.fr, dettedelafrance.fr, francebudget.fr) y a la empresa de alquiler de vehículos Budget (budget.fr), sin relación con este modelo.
