# alexkstern/baseline_1Bpt_hfbody_van_s0_2026-08-14_03-56-26_172391-pt

## Resumen

El modelo `baseline_1Bpt_hfbody_van_s0_2026-08-14_03-56-26_172391-pt` es un checkpoint de preentrenamiento de un transformer decoder-only de tamaño pequeño, desarrollado por Alex Stern (alexkstern) utilizando el framework [nanochat](https://github.com/karpathy/nanochat) de Andrej Karpathy. Se trata de un experimento de investigación centrado en el estudio del escalado de modelos y la dinámica de entrenamiento con un presupuesto de 1.000 millones de tokens. El nombre del modelo sugiere que fue entrenado con 1B tokens de preentrenamiento (pt_tokens = 1e9), no que tenga 1B parámetros.

La arquitectura es un transformer estándar con 16 capas, 8 cabezas de atención, dimensión de embedding de 1024 y un vocabulario de 65.536 tokens. La longitud de contexto es de 2048 tokens. El modelo se entrenó sobre el dataset `fineweb-nanochatbpe-20B`, una versión tokenizada de FineWeb con un tokenizador BPE específico de nanochat. No se aplicaron técnicas de alineación como RLHF o DPO; es un modelo base puro. Su relevancia radica en ser un punto de referencia para experimentos de escalado y comparación de configuraciones de entrenamiento, no para uso directo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (vanilla) |
| Parametros totales | no disponible (configuracion: 16 capas, 8 cabezas, embedding 1024, vocab 65536) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo checkpoint .pt, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (dataset FineWeb, mayoritariamente ingles, pero no especificado) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only convencional, sin mezcla de expertos ni arquitecturas híbridas. La configuración exacta es: `n_layer=16`, `n_head=8`, `n_kv_head=8` (atención multi-cabeza estándar, sin GQA), `n_embd=1024`, `vocab_size=65536` y `sequence_len=2048`. No se especifica el tamaño del MLP intermedio, pero es probable que siga el factor 4x típico (dimensión interna 4096). El entrenamiento se realizó con el framework nanochat, que implementa un optimizador con learning rates separados para la matriz de embedding (0.3), la matriz de unembedding (0.004) y las matrices internas (0.02), con weight decay nulo. El scheduler de learning rate es trapezoidal, con warmup de 0% y warmdown del 40% del total de pasos, decayendo hasta 0. Se entrenó durante 1.000 iteraciones (aunque el checkpoint se guardó en el paso 3.814, lo que sugiere que la configuración de iteraciones pudo ser mayor en la práctica o que el checkpoint se guardó en un paso posterior al configurado). El dataset de entrenamiento fue `fineweb-nanochatbpe-20B`, con un total de 1.000 millones de tokens. No se aplicaron técnicas de alineación (sin RLHF, DPO, etc.). El entrenamiento se ejecutó en hardware con un pico teórico de 2250 TFLOPS, y el tiempo total fue de aproximadamente 24 minutos (1459.79 segundos). La pérdida final suavizada fue de 3.0867, y el objetivo mínimo alcanzado fue 0.9466.

## Capacidades

- Generación de texto autoregresiva: como modelo base, puede completar secuencias de texto y generar texto coherente a partir de un prompt.
- Razonamiento básico: no se han evaluado capacidades específicas de razonamiento, matemáticas o código.
- No se ha documentado soporte para tool calling, function calling, agentes o multi-step reasoning.
- No se ha documentado soporte para visión, audio u otras modalidades.
- Capacidades multilingües: no disponibles; el dataset FineWeb es predominantemente inglés, pero no se ha verificado el rendimiento en otros idiomas.
- No se ha documentado un modo de pensamiento (thinking mode) ni características especiales.

## Casos de uso

- Investigación académica en escalado de modelos: el modelo sirve como punto de referencia para estudiar el efecto de la cantidad de tokens de entrenamiento, la configuración de learning rate y la arquitectura en modelos pequeños. Se puede utilizar para reproducir experimentos y comparar con otras configuraciones.
- Estudio de dinámicas de entrenamiento: dado que se registraron métricas detalladas (pérdida, flops, tiempo), es útil para analizar curvas de pérdida y comportamiento del optimizador en entornos de entrenamiento de bajo presupuesto.
- Comparación de tokenizadores: el uso del tokenizador `nanochatbpe` permite evaluar su impacto en el rendimiento frente a otros tokenizadores BPE.
- Desarrollo de técnicas de preentrenamiento eficiente: al ser un modelo pequeño y rápido de entrenar, puede servir como banco de pruebas para nuevas técnicas de regularización, schedulers de learning rate o estrategias de inicialización.
- Generación de texto experimental: aunque no está alineado, puede usarse para generar texto en entornos controlados de investigación, siempre que se tengan en cuenta sus limitaciones.
- No se recomienda su uso en aplicaciones de producción debido a la falta de evaluación y alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye métricas de entrenamiento (pérdida suavizada, objetivo mínimo, flops utilizados), pero no resultados en tareas estándar como MMLU, HumanEval o GSM8K. No se dispone de comparaciones con otros modelos.

## Requisitos de hardware

- El tamaño del repositorio es de 2.9 GB, lo que sugiere que el checkpoint está almacenado en precisión fp32 (aproximadamente 725M parámetros si se considera solo el peso, pero la configuración real apunta a un modelo de ~300M parámetros; el tamaño del repo incluye otros archivos como metadatos y configuraciones).
- No se han publicado requisitos oficiales de VRAM. Dado el tamaño estimado del modelo (menos de 500M parámetros), es probable que quepa en GPUs consumer con 8 GB de VRAM en fp16, pero no hay datos confirmados.
- Opciones de despliegue: al ser un checkpoint de PyTorch, se puede cargar con la librería nanochat o con transformers si se convierte el formato. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se pueden establecer comparativas con otros modelos de tamaño similar (por ejemplo, GPT-2 pequeño, Pythia-160M, etc.) sin datos de benchmarks.

## Limitaciones y advertencias

- Modelo base sin alineación: no está entrenado para seguir instrucciones ni para mantener conversaciones seguras; puede generar contenido sesgado, tóxico o factualmente incorrecto.
- Sesgos del dataset: entrenado en FineWeb, que refleja sesgos presentes en la web (género, raza, ideología, etc.).
- Riesgo de alucinación: como todo modelo generativo, puede producir información inventada.
- Sin evaluación de capacidades: no se han publicado resultados en tareas estándar, por lo que se desconoce su rendimiento real.
- Limitaciones de contexto: ventana de 2048 tokens, insuficiente para tareas que requieran contexto largo.
- Licencia Apache-2.0: permite uso comercial, pero el modelo se ofrece sin garantías y sin soporte.
- Formato de pesos: solo .pt, no hay versiones cuantizadas ni en safetensors, lo que puede dificultar su uso en entornos de producción.

## Enlaces

- HuggingFace: [https://huggingface.co/alexkstern/baseline_1Bpt_hfbody_van_s0_2026-08-14_03-56-26_172391-pt](https://huggingface.co/alexkstern/baseline_1Bpt_hfbody_van_s0_2026-08-14_03-56-26_172391-pt)
- W&B run: [https://wandb.ai/alexksternteam/token_dose_1Bpt_seed_replicas_v1/runs/s0b05tnz](https://wandb.ai/alexksternteam/token_dose_1Bpt_seed_replicas_v1/runs/s0b05tnz)
- Repositorio nanochat: [https://github.com/karpathy/nanochat](https://github.com/karpathy/nanochat)
