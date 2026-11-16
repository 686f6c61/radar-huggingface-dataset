# devankit7873/QJev-1.5B

## Resumen

QJev-1.5B es un modelo de decisión ("System 1 Decision Engine") desarrollado por el usuario devankit7873 y publicado en Hugging Face. Se construye sobre Qwen/Qwen2.5-1.5B-Instruct mediante QLoRA y añade una cabeza MLP de decisión calibrada que, en lugar de generar texto token a token, produce en un único forward pass una distribución de probabilidad calibrada sobre hasta 10 opciones discretas. El modelo está pensado para tareas de clasificación y toma de decisiones, no para generación libre de texto.

La propuesta diferencial es la latencia: frente a los 300-600 ms de una generación autoregresiva para emitir "Opción A", QJev-1.5B reporta unos 31,49 ms por decisión (~32 decisiones por segundo), con un consumo de VRAM de aproximadamente 3,4 GB. Esto lo sitúa en el rango de portátiles con 8 GB de VRAM, GPUs de consumo y VPS económicos, manteniendo según su autor alrededor del 95% de la capacidad de decisión de modelos JEV de 9B.

El modelo se enmarca en un ecosistema denominado JEV (Joint Expected Value) con un benchmark propio, JevBench, de tipo metamórfico. Los pesos se distribuyen en dos formatos: el modelo completo fusionado (model.safetensors, 3,08 GB) y un adaptador LoRA ligero (16,6 MB). La licencia es Apache 2.0. Es relevante ahora por su enfoque de inferencia determinista y calibrada para decisiones, una alternativa a los LLM generativos en pipelines de clasificación de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con cabeza MLP de decisión calibrada; ajuste QLoRA sobre proyecciones de atención (q_proj, k_proj, v_proj, o_proj) |
| Parametros totales | 1.543.714.304 (~1,54B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors en precisión de entrenamiento; el adaptador LoRA se entrena con QLoRA) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo completo fusionado, 3,08 GB) y adaptador LoRA PEFT (lora_adapter/, 16,6 MB) |

## Arquitectura y entrenamiento

QJev-1.5B parte de Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,54B parámetros. Sobre esa base se añade una cabeza MLP de decisión calibrada y se ajustan las proyecciones de atención (q_proj, k_proj, v_proj, o_proj) mediante QLoRA sobre las 655.806 muestras del dataset SargeDev/jev-distill-corpus-v3. El resultado es un modelo que, dado un contexto y un conjunto de opciones (hasta 10), emite directamente una distribución de probabilidad sobre las opciones en un solo forward pass, en lugar de generar texto de forma autoregresiva.

El entrenamiento se realizó íntegramente en hardware de consumo: un portátil HP OMEN con Windows 11 Pro, GPU NVIDIA GeForce RTX 5060 Laptop de 8 GB de VRAM, CUDA 12.8 y PyTorch 2.12. El autor reporta métricas de calibración sobre el corpus (TVD y KL) y un conjunto de pruebas metamórficas (JevBench) que evalúan invariancia a reordenaciones de opciones, monotonicidad ante evidencia, condicionamiento al eliminar opciones irrelevantes y equivalencia ante transformaciones del prompt. La innovación técnica destacable es la sustitución de la decodificación generativa por una salida probabilística calibrada y determinista, con independencia del batching (BAT.isolation al 100%).

## Capacidades

- Clasificación y toma de decisiones sobre hasta 10 opciones discretas, devolviendo una distribución de probabilidad calibrada.
- Razonamiento de tipo "System 1": decisiones rápidas en un único forward pass, sin cadena de pensamiento generativa.
- Salida determinista e independiente del batching (BAT.isolation 100% en JevBench).
- Invariancia a reordenación de opciones y transformaciones del prompt (REP.invariance 87,5%, REP.equivariance 70,8%).
- Monotonicidad ante evidencia adicional (LOG.monotonicity 76,4%).
- Condicionamiento correcto al eliminar opciones irrelevantes (CHO.conditioning 70,8%).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible; el modelo está orientado a decisiones de un solo paso.
- Capacidades multilingües: no disponible.
- Capacidades especiales: no dispone de modo thinking, visión ni audio según la información disponible.

## Casos de uso

- Enrutamiento de decisiones en pipelines de producción: dado un contexto y un conjunto de acciones posibles (por ejemplo, escalar, responder o cerrar un ticket), el modelo devuelve probabilidades calibradas en ~31 ms, lo que permite umbrales de confianza y lógica de fallback.
- Clasificación de intenciones en atención al cliente: con hasta 10 categorías, el modelo asigna probabilidad a cada intención en un solo forward pass, adecuado para preprocesar mensajes antes de un LLM generativo más costoso.
- Robótica de borde y sistemas embebidos: con ~3,4 GB de VRAM y latencia de ~31 ms, cabe en portátiles con 8 GB y en GPUs de consumo, permitiendo selección de acciones en bucles de control de baja latencia.
- Moderación y triaje de contenido: la salida probabilística permite aplicar umbrales graduados (permitir, revisar, bloquear) en lugar de una etiqueta binaria rígida.
- Evaluación A/B y sistemas de recomendación de acciones: la calibración (TVD en distribución de 0,0921) facilita comparar distribuciones de decisión frente a políticas de referencia.
- Despliegue en VPS económicos: el adaptador LoRA de 16,6 MB permite reutilizar una instancia base de Qwen2.5-1.5B-Instruct ya alojada y cargar únicamente los pesos PEFT, reduciendo el almacenamiento y el coste de despliegue.
- Investigación en calibración y robustez: el harness JevBench y las métricas TVD/KL permiten estudiar la estabilidad de decisiones bajo transformaciones metamórficas del prompt.

## Benchmarks y rendimiento

Resultados de JevBench (jevbench-mini, 240 casos, 50 relaciones metamórficas), comparando base congelada (fase 1) y modelo ajustado (fase 2):

| Dimension JevBench | Fase 1 (base congelada) | Fase 2 (modelo ajustado) | Delta |
|---|---|---|---|
| BAT.isolation | 100,0% | 100,0% | 0,0% |
| REP.invariance | 79,2% | 87,5% | +8,3% |
| REP.type | 64,6% | 85,4% | +20,8% |
| LOG.monotonicity | 63,9% | 76,4% | +12,5% |
| CHO.conditioning | 34,7% | 70,8% | +36,1% |
| REP.binding | 63,9% | 73,6% | +9,7% |
| REP.equivariance | 36,1% | 70,8% | +34,7% |
| Overall (calibrado 0,10) | 60,2% [57-63] | 71,5% [69-74] | +11,3% |
| Overall (estricto 0,05) | 48,8% [47-51] | 58,6% [56-61] | +9,8% |

Resultados sobre el dataset (test in-distribution de 1.500 muestras y split OOD):

| Métrica | Fase 1 (base congelada) | Fase 2 (QLoRA) | Delta |
|---|---|---|---|
| OOD Accuracy | 57,53% | 80,07% | +22,54% |
| OOD TVD | 0,4607 | 0,2389 | -48,1% |
| OOD KL Loss | 0,7884 | 0,6972 | -11,6% |
| In-Distribution TVD | 0,1664 | 0,0921 | -44,6% |
| In-Distribution Loss | 0,1757 | 0,1033 | -41,2% |
| Latencia de inferencia | 42,94 ms | 31,49 ms | -26,7% |

No se han publicado resultados en benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,4 GB según el autor (modelo completo fusionado).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; el autor lo valida en una RTX 5060 Laptop de 8 GB. Cabe en GPUs de consumo como RTX 3060/4060/5060 y superiores.
- Cabe en consumer GPU: sí, en cualquier portátil o tarjeta con 8 GB de VRAM; también en VPS económicos según el autor.
- Opciones de despliegue: transformers (modelo fusionado, sin necesidad de peft); para el adaptador, transformers + peft sobre Qwen2.5-1.5B-Instruct. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: ~31,49 ms por decisión, equivalente a ~32 decisiones por segundo según el autor.
- Almacenamiento: 3,08 GB para el modelo completo; 16,6 MB para el adaptador LoRA.

## Comparativa con modelos similares

| Modelo | Parametros | Latencia de decision | Opciones | JevBench | OOD Accuracy | VRAM |
|---|---|---|---|---|---|---|
| SargeDev/jev-gate-student-b | 0,49B | ~23 ms | Binaria (2) | ~50,2% | ~64,5% | ~1,5 GB |
| QJev-1.5B | 1,54B | 31,49 ms | Hasta 10 | 71,50% | 80,07% | ~3,4 GB |
| autotrust/JEV-9B | 9,0B | ~45-90 ms | Hasta 16 | ~72,0% | ~83,5% | ~18,5 GB |
| autotrust/JEV-27B | 27,0B | ~150-350 ms | Hasta 16 | ~76,5% | ~86,2% | ~55,0 GB |
| TypeSafe Jev 1.13 (teacher) | ~30B+ | ~200 ms+ | Arbitrarias | ~72,1% | ~88,0% | API cerrada |

Las cifras de los modelos comparables proceden de la propia model card del autor y no se han verificado de forma independiente. No se dispone de comparaciones con modelos de clasificación estándar (por ejemplo, encoders tipo DeBERTa) en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es un LLM generativo: está diseñado para clasificación y decisión sobre un conjunto acotado de opciones (hasta 10), no para generar texto libre.
- Las métricas de JevBench y del dataset provienen del propio autor; no se han validado de forma independiente y el benchmark JevBench es de autoría propia del ecosistema.
- El modelo tiene 0 descargas y 1 like en Hugging Face, sin adopción ni validación externa conocida.
- El rendimiento en idiomas distintos del inglés es desconocido: no se declaran idiomas soportados.
- El entrenamiento se realizó en una única GPU de consumo, lo que limita el volumen y la diversidad de datos frente a entrenamientos a mayor escala.
- Riesgo de alucinación: al emitir distribuciones de probabilidad, una calibración deficiente en dominios fuera de distribución puede producir confianza excesiva; el TVD OOD de 0,2389 indica desviación no trivial.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct tiene sus propias condiciones que deben respetarse.
- No se dispone de información sobre longitud de contexto, cuantizaciones soportadas ni soporte de tool calling, lo que limita la planificación de despliegue en producción.
- El formato de decisión requiere una interfaz específica (cabeza MLP y formato de opciones); no es directamente compatible con APIs de chat estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devankit7873/QJev-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de destilación: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- JevBench: https://jevbench.github.io/
- PyTorch: https://pytorch.org/
