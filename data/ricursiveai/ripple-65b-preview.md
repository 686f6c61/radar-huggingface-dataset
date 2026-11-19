# ricursiveAI/Ripple-65B-Preview

## Resumen

Ripple-65B Preview es un modelo de lenguaje de tipo transformer denso desarrollado por Ricursive Intelligence, con 64.782.689.360 parámetros totales y licencia Apache 2.0. Se distribuye en formato safetensors (BF16) y cuenta con variantes complementarias en NVFP4, una versión base sin post-entrenamiento y un checkpoint DFlash2. El modelo ha sido preentrenado desde cero sobre 12 billones de tokens de un corpus mayoritariamente en inglés y código, y declara soporte de contexto de hasta 1.048.576 tokens.

Su propuesta diferencial es alcanzar un rendimiento competitivo en tareas de codigo agéntico con un modelo denso de solo 65B parámetros, frente a alternativas estadounidenses de pesos abiertos mucho mayores (entre 550B y 975B según la model card). El autor reporta 80,52 en TerminalBench 2.1, por encima de Reflection Beam 501B (80,1), Meta Muse Spark Open 816B (76,4), Thinking Machines Inkling 975B (63,8) y NVIDIA Nemotron 3 Ultra 550B (56,4). La relevancia actual reside en que, segun el autor, el modelo cabe en hardware de consumo como una NVIDIA DGX Spark y alcanza 250 tok/s en 2xB200 con batch 8 antes de cuantización o kernels personalizados.

La arquitectura es un transformer denso con proporción "thin-and-deep": d_model de 5120 y 80 capas totales, con atención de ventana deslizante (SWA) combinada con capas globales, gated attention, NoPE global, value residuals y clipping de activaciones en la FFN. El modelo parte de una base estilo Olmo 3 y evoluciona hacia una arquitectura tipo Gemma 3N para mejorar la estabilidad de entrenamiento a escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (estilo Gemma 3N, base Olmo 3), thin-and-deep, SWA + capas globales, gated attention, NoPE global, value residuals, FFN activation clipping |
| Parametros totales | 64.782.689.360 (64,78B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 1.048.576 tokens (1Mi); preentrenamiento a 8K, midtrain a 64K, long context a 2M, SFT a 128K |
| Tipos de cuantizacion | BF16 (repo principal), NVFP4 (checkpoint separado) |
| Idiomas soportados | Predominantemente inglés y código (no se detalla lista oficial de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); variante NVFP4 en repo aparte |
| d_model | 5120 |
| Numero de capas | 80 |
| Tokens de preentrenamiento | 12 billones (12T) |
| Tamano del repo | 129,6 GB |
| Descargas | 15.045 |
| Likes | 615 |

## Arquitectura y entrenamiento

Ripple-65B es un transformer denso con una relación de aspecto "thin-and-deep": d_model estrecho (5120) y 80 capas. El autor indica que migró desde una arquitectura tipo Llama (Olmo 3) a una tipo Gemma 3N para mejorar la estabilidad del entrenamiento a escala. Para reforzar el razonamiento, se sobreaprovisionan las cabezas de atención, se incrementa la proporción de capas SWA frente a globales y se reduce la ventana SWA para compensar el coste. Se añaden además gated attention, NoPE global, value residuals y clipping de activaciones en la FFN. La decisión de usar un denso en lugar de un MoE busca reducir la complejidad de infraestructura de preentrenamiento y postentrenamiento, manteniendo un MFU del 40% con sharding simple, sin kernels personalizados y sin cuantización (BF16).

El preentrenamiento se realizó desde cero sobre 12T tokens de texto mayoritariamente inglés y código, con longitud de secuencia de 8K y 877.500 pasos (batch 1408 a 3072). El pipeline de postentrenamiento incluye midtraining (200B tokens, 64K de secuencia), long context (6,5B tokens, 2M de secuencia), SFT (183B tokens, 128K), long context SFT (13,5B tokens, 2M) y RL mixto multidominio (700 pasos, 128K, batch 2048). El autor describe el postentrenamiento de esta Preview como "relativamente ligero", centrado en codigo agéntico. El checkpoint Base Preview es solo preentrenamiento, sin midtraining ni datos QA sintéticos.

## Capacidades

- Generación de texto y razonamiento en inglés y código, con contexto largo de hasta 1.048.576 tokens.
- Codigo agéntico: el foco declarado del postentrenamiento, con resultados destacados en TerminalBench 2.1.
- Razonamiento multi-paso y tareas de agente (uso de terminal, ejecución de comandos, resolución de tareas de software).
- Capacidad de contexto largo gracias a las fases de long context y long context SFT (secuencias de hasta 2M durante el entrenamiento).
- No se declara soporte explícito de tool calling / function calling en la información disponible.
- No se declara soporte de visión, audio ni modo "thinking" explícito en la información disponible.
- Capacidades multilingües: no detalladas; el corpus es predominantemente inglés y código.

## Casos de uso

- Automatización de tareas de terminal y DevOps: el modelo está entrenado específicamente para codigo agéntico y obtiene 80,52 en TerminalBench 2.1, lo que lo hace adecuado para agentes que ejecutan comandos, depuran entornos y resuelven tareas de sistema en pipelines de CI/CD.
- Agentes de resolución de incidencias de software: con contexto de hasta 1Mi tokens puede ingerir repositorios, logs extensos y trazas de error en una sola ventana y razonar sobre ellos de forma multi-paso.
- Asistente de programación en IDE o CLI: generación y refactorización de código con contexto amplio de proyecto, adecuado para integraciones tipo OpenCode (harness usado por el autor en algunas evaluaciones).
- Procesamiento de documentación técnica extensa: la ventana de 1Mi tokens permite analizar manuales, especificaciones y bases de código completas sin trocear, útil para auditoría y generación de resúmenes técnicos.
- Despliegue en hardware de consumo: según el autor, el modelo cabe en una NVIDIA DGX Spark, lo que habilita prototipado local de agentes de código sin depender de infraestructura de datacenter.
- Servicio de inferencia de alto throughput: con 250 tok/s en 2xB200 (batch 8, sin cuantización ni kernels personalizados), es viable para servir agentes concurrentes en producción con latencia baja.
- Investigación en eficiencia de entrenamiento: al ser denso y con receta reproducible (MFU 40%, sharding simple), sirve como base para estudiar leyes de escala y eficiencia computacional en código (el autor reporta 16x de mejora en CE frente a Olmo 3, hasta 55x en la ejecución completa).

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (BF16, máximo esfuerzo; mayor es mejor). Para SWE-bench Pro v2.0 Hard y DeepSWE 1.1 se usó Terminus 2; en el resto, OpenCode cuando no se especifica harness.

| Benchmark | Ripple-65B Preview | Nemotron 3 Ultra 550B | Inkling 975B | Muse Spark Open 816B | Reflection Beam 501B |
|---|---|---|---|---|---|
| TerminalBench 2.1 | 80,52 | 56,4 | 63,8 | 76,4 | 80,1 |
| Resto de benchmarks | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

El autor advierte que replicar estas puntuaciones es difícil por la sensibilidad de las evaluaciones agénticas modernas; por ejemplo, Terminal-Bench 2.1 arroja puntuaciones universalmente más bajas con el harness oficial Terminus 2 a 128K de secuencia con summarization (salvo Muse Spark Open). No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 130 GB solo para pesos (64,78B × 2 bytes), más overhead de activaciones y KV cache; requiere múltiples GPU de datacenter o nodos con memoria unificada.
- VRAM estimada en NVFP4: aproximadamente 32-33 GB para pesos (64,78B × ~4 bits), más overhead; permite despliegue en GPU de consumo de gama alta con memoria suficiente.
- GPU recomendadas: el autor cita 2xB200 para 250 tok/s (batch 8) y NVIDIA DGX Spark como hardware de consumo donde cabe el modelo; también es apto para A100/H100 en BF16 con paralelismo de tensor.
- Cabe en consumer GPU: sí, en formato NVFP4 y en dispositivos con memoria unificada como DGX Spark; en BF16 no cabe en una GPU de consumo estándar.
- Opciones de despliegue: el repo incluye `custom_code` y tag `deploy:sagemaker`; el autor menciona un colab para NVFP4. No se confirma soporte explícito de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: 250 tok/s en 2xB200 con batch 8, antes de cuantización o kernels personalizados (dato del autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | TerminalBench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B Preview | 64,78B (denso) | 1.048.576 | 80,52 | Apache 2.0 | Hugging Face (BF16, NVFP4, Base, DFlash2) |
| Reflection Beam 501B | 501B | no disponible | 80,1 | no disponible | pesos abiertos (EE. UU.) |
| Meta Muse Spark Open 816B | 816B | no disponible | 76,4 | no disponible | pesos abiertos (EE. UU.) |
| Thinking Machines Inkling 975B | 975B | no disponible | 63,8 | no disponible | pesos abiertos (EE. UU.) |
| NVIDIA Nemotron 3 Ultra 550B | 550B | no disponible | 56,4 | no disponible | pesos abiertos (EE. UU.) |

La comparativa se limita a TerminalBench 2.1, único benchmark con datos completos en la información disponible. Ripple-65B iguala o supera a modelos con más de 10 veces sus parámetros totales según el autor, con la ventaja de ser denso y desplegable en hardware de menor escala.

## Limitaciones y advertencias

- Modelo "Preview" con postentrenamiento ligero: puede presentar comportamiento menos pulido que versiones finales en dominios fuera del código agéntico.
- Corpus predominantemente inglés y código: el rendimiento en otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación inherente a modelos de lenguaje; no se documentan mitigaciones específicas.
- Sesgos: no se detalla análisis de sesgos en la información disponible.
- Las puntuaciones de benchmarks agénticos son sensibles al harness y a la longitud de secuencia; el propio autor advierte que la replicación es difícil.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene revisar el fichero LICENSE del repo por posibles condiciones adicionales no reflejadas en la model card.
- El repo usa `custom_code`: requiere `trust_remote_code` y revisión del código antes de cargar en producción.
- No se declara soporte de tool calling nativo ni de modalidades distintas de texto; verificar antes de integrar en pipelines que dependan de function calling.

## Enlaces

- Hugging Face (BF16 instruct): https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Variante NVFP4: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Base-Preview
- Variante DFlash2: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Blog de lanzamiento: https://www.ricursive.com/ripple
- Licencia: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/main/LICENSE
