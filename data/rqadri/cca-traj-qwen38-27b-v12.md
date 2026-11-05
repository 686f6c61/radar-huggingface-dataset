# rqadri/cca-traj-qwen38-27b-v12

## Resumen

`rqadri/cca-traj-qwen38-27b-v12` es un ajuste fino de parámetros completos (full-parameter SFT) del modelo base `Qwen/Qwen3.8-27B`, publicado por el usuario rqadri en HuggingFace. El modelo está especializado en trayectorias de agentes de programación (coding-agent trajectories) mediante el corpus CCA, y se ha entrenado con una ventana de contexto de 128.000 tokens. El pipeline declarado es `image-text-to-text`, lo que indica que el modelo base es multimodal (visión y texto) y que el fine-tuning conserva esa capacidad, aunque el entrenamiento se centró en secuencias de texto de agentes.

El problema que aborda es el ajuste de un modelo grande (27.356.728.560 parámetros, aproximadamente 27,36 mil millones) para seguir trayectorias largas de agente: generaciones multi-turno con uso de herramientas, razonamiento intermedio y contexto extenso. Es relevante porque el corpus de entrenamiento (1.982 secuencias concatenadas de `cca-large-v1` y `cca-large-v2`) está orientado a contextos de hasta 128k tokens, un régimen en el que la mayoría de los fine-tunes públicos de este tamaño no se entrenan por coste computacional.

Se trata de un artefacto de investigación: el autor indica explícitamente que el modelo **no ha sido evaluado** y que los pesos corresponden al checkpoint 244 de 248 pasos, consolidado a bf16 desde ZeRO-3. La licencia es Apache 2.0 y el repositorio ocupa 54,7 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); clase de carga `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 27.356.728.560 (aprox. 27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128.000 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); incluye `preprocessor_config.json` y `video_preprocessor_config.json` para vLLM |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.8-27B`, un transformer multimodal de aproximadamente 27,36 mil millones de parámetros. El ajuste es de parámetros completos (no LoRA ni adaptadores), con pérdida calculada únicamente sobre los tramos del asistente (loss on the assistant spans only), una secuencia de entrenamiento por cada generación de contexto de agente, precisión bf16 y contexto de 128k. El entrenamiento se ejecutó con `train_cca_sft.py` del repositorio github.com/rifaaQ/long_ctx_train sobre hardware Intel XPU (Aurora), usando DeepSpeed ZeRO-3 con offload del optimizador a CPU, paralelismo de secuencia Ulysses local al nodo (8 rangos), AdamW, scheduler coseno y 8 secuencias por paso de optimizador.

Los datos provienen de dos corpus de trayectorias de agentes CCA: `cca-large-v1` (250 ejecuciones de entrenamiento, 1.243 secuencias, 61,9 millones de tokens supervisados) y `cca-large-v2` (182 ejecuciones, 739 secuencias, 47,7 millones de tokens supervisados; ejecuciones disjuntas y solo profesores de pesos abiertos). La ejecución v12 concatenó v1 y v2 (1.982 secuencias), usó learning rate 1e-5, una época equivalente a 248 pasos y se detuvo en el paso 244 (2026-11-01) con learning rate 1,07e-8 y última pérdida registrada de 0,447. Los pesos publicados son el `checkpoint-244` consolidado a bf16. No se documentan fases de RLHF ni DPO, ni innovaciones de decodificación específicas más allá del entrenamiento con contexto largo.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 128k tokens.
- Seguimiento de trayectorias de agente: planificación, uso de herramientas y razonamiento multi-paso, según el corpus de entrenamiento CCA.
- Capacidad multimodal heredada del modelo base (pipeline `image-text-to-text`), incluyendo entrada de imagen y vídeo según los preprocesadores incluidos.
- Modo de razonamiento (thinking) habilitado; el autor indica que se evaluó con thinking activado y un parser de razonamiento.
- Soporte de tool calling / function calling: no confirmado explícitamente en la model card, aunque el corpus de entrenamiento son trayectorias de agente con herramientas.
- Capacidades multilingües: no disponibles.
- Capacidades de código: el ajuste se realizó sobre trayectorias de agentes de programación, por lo que se espera competencia en tareas de código, aunque no hay evaluación publicada.

## Casos de uso

- Agentes de programación autónomos: el modelo puede encadenar pasos de planificación, edición de ficheros y ejecución de comandos en contextos largos, gracias a su ventana de 128k tokens y a que fue entrenado sobre trayectorias reales de agentes de código.
- Asistentes de revisión de repositorios completos: con 128k tokens de contexto puede ingerir varios ficheros y el historial de cambios de un parche para razonar sobre él en una sola pasada.
- Automatización de pipelines de CI/CD con razonamiento multi-paso: adecuado para tareas que requieren leer logs extensos, diagnosticar fallos y proponer correcciones dentro de la misma ventana de contexto.
- Investigación sobre SFT de contexto largo: sirve como referencia reproducible de un fine-tune full-parameter a 128k con ZeRO-3 y paralelismo Ulysses, útil para estudiar el efecto del contexto largo en tareas de agente.
- Prototipado de agentes con entrada multimodal: al conservar el pipeline image-text-to-text, puede procesar capturas de pantalla o diagramas junto con texto en flujos de depuración.
- Evaluación comparativa de trayectorias: útil para experimentos que midan la fidelidad del modelo al seguir formatos de trayectoria (observación, acción, resultado) en entornos simulados.
- Generación de documentación técnica a partir de conversaciones de agente: puede resumir trayectorias largas y extraer decisiones y comandos ejecutados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo "not yet evaluated" y remite al protocolo de evaluación y cifras en `longctx/results.md` del proyecto, sin incluirlos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 54,7 GB solo para pesos (27,36 mil millones de parámetros × 2 bytes), más caché KV y activaciones; en la práctica se requieren del orden de 60-70 GB para contexto moderado y bastante más para 128k tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 27-30 GB de pesos, más caché KV.
- VRAM estimada en cuantización de 4 bits: alrededor de 14-16 GB de pesos, más caché KV; no se publican pesos GGUF, por lo que habría que generarlos.
- GPU recomendadas: A100 80 GB, H100 80 GB o Intel XPU de clase Aurora para bf16; en consumer GPU solo es viable con cuantización agresiva (por ejemplo, RTX 4090 de 24 GB en 4 bits con contexto reducido).
- Opciones de despliegue: `transformers` con `Qwen3_5ForConditionalGeneration`; vLLM (el autor incluye `preprocessor_config.json` y `video_preprocessor_config.json` para este fin); llama.cpp u Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Evaluacion publicada | Disponibilidad |
|---|---|---|---|---|---|
| rqadri/cca-traj-qwen38-27b-v12 | 27,36 mil millones | 128k | Apache 2.0 | No | HuggingFace (0 descargas) |
| Qwen/Qwen3.8-27B (base) | 27,36 mil millones | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | HuggingFace |
| Alternativas de ~27B para agentes de codigo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada; la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Modelo no evaluado: el autor declara explícitamente "Not yet evaluated"; no hay métricas que respalden su calidad.
- Checkpoint incompleto: los pesos corresponden al paso 244 de 248; faltan cuatro pasos de entrenamiento, que el autor considera numéricamente despreciables pero que no están incluidos.
- Riesgo de alucinación: sin evaluación, no puede descartarse; en tareas de agente el riesgo se amplifica al encadenar acciones.
- Sesgos: no documentados; el corpus proviene de trayectorias generadas por profesores de pesos abiertos, lo que puede introducir sesgos de estilo y de distribución de tareas.
- Idiomas: no se especifican los idiomas soportados; el rendimiento fuera del inglés no está garantizado.
- Carga incorrecta: debe cargarse como `Qwen3_5ForConditionalGeneration`; usar la clase solo de texto inicializaría pesos aleatorios.
- Requisitos de hardware elevados: 54,7 GB de pesos en bf16 y contexto de 128k implican GPUs de 80 GB o cuantización, con el coste de calidad asociado.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto de investigación sin evaluación, su uso en producción no está recomendado sin validación previa.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rqadri/cca-traj-qwen38-27b-v12
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de entrenamiento: https://github.com/rifaaQ/long_ctx_train
- Protocolo de evaluación y resultados (referenciado por el autor): `longctx/results.md` en github.com/rifaaQ/long_ctx_train
