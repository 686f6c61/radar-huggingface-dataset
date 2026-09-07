# experimentalmachines/LFM2.5-1.2B-Instruct-heretic

## Resumen

El modelo experimentalmachines/LFM2.5-1.2B-Instruct-heretic es una variante "abliterated" del modelo LiquidAI/LFM2.5-1.2B-Instruct, desarrollada por experimentalmachines. Se ha generado mediante la técnica heretic, que realiza una ablación direccional de la dirección de rechazo en el flujo residual del modelo, con una búsqueda TPE sobre los pesos de ablación por capa para minimizar tanto la tasa de rechazo como la divergencia KL respecto al modelo original. El resultado es un modelo fusionado que carga como `Lfm2ForCausalLM` y conserva el chat template y los tokens de tool-calling del modelo base.

El modelo pertenece a la familia LFM2.5, descrita como una familia de modelos híbridos diseñados para despliegue en dispositivo, con pre-entrenamiento extendido y aprendizaje por refuerzo. Tiene 1.170.340.608 parámetros y, en la versión ExecuTorch, soporta una ventana de contexto de 32.768 tokens con cuantización 8-bit dinámica por token y 4-bit por grupos de pesos (8da4w). Es relevante porque ofrece un modelo pequeño y eficiente, capaz de ejecutarse en CPUs ARM y x86, pero con la particularidad de que se ha eliminado deliberadamente el entrenamiento de seguridad del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (híbrida, detalles no disponibles) |
| Parámetros totales | 1.170.340.608 |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (versión ExecuTorch) |
| Tipos de cuantización | Safetensors (sin cuantizar); ExecuTorch: 8-bit activaciones dinámicas por token y 4-bit pesos agrupados (8da4w) |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (licencia personalizada, ver LICENSE del modelo base) |
| Formato de pesos | safetensors, ExecuTorch .pte |

## Arquitectura y entrenamiento

El modelo se construye a partir de LiquidAI/LFM2.5-1.2B-Instruct. La técnica heretic aplica una ablación direccional en la dirección de rechazo del flujo residual, con una búsqueda TPE (Tree-structured Parzen Estimator) sobre los pesos de ablación por capa. El objetivo es minimizar simultáneamente la tasa de rechazo y la divergencia KL con el modelo original. Los pesos resultantes se fusionan, por lo que el modelo final es un `Lfm2ForCausalLM` estándar, sin necesidad de cargar ningún adaptador adicional. El chat template, los tokens de tool-calling y el resto de la configuración se mantienen sin cambios respecto al modelo base. El pipeline completo es reproducible mediante un Makefile que ejecuta las etapas `setup`, `abliterate`, `pareto`, `save`, `export` y `publish`.

El modelo base LFM2.5 se describe como una familia de modelos híbridos para despliegue en dispositivo, con pre-entrenamiento extendido y aprendizaje por refuerzo. Sin embargo, no se proporcionan detalles sobre la composición del dataset ni sobre las técnicas de alineamiento específicas en la información disponible. En el proceso de abliteración, el punto seleccionado del Pareto front presenta una tasa de rechazo del 0.06 y una divergencia KL de 0.0527.

## Capacidades

- Generación de texto conversacional (pipeline text-generation).
- Tool calling: los tokens de tool-calling se conservan del modelo base, lo que permite integrar llamadas a funciones.
- Ejecución eficiente en CPU ARM y x86 mediante ExecuTorch con backend XNNPACK, con aceleración KleidiAI en CPUs ARM.
- Cuantización 8da4w (8-bit activaciones dinámicas por token, 4-bit pesos agrupados con grupo de 32) para reducir el uso de memoria.
- Ventana de contexto de 32.768 tokens en la versión ExecuTorch, con prefill por fragmentos de 2048 tokens.
- Modelo "abliterated": se ha eliminado la dirección de rechazo, por lo que no rechaza solicitudes que el modelo base podría rechazar.

## Casos de uso

1. Asistentes locales en dispositivos móviles: gracias a la ejecución mediante ExecuTorch en CPUs ARM (Snapdragon, Dimensity, Apple Silicon), el modelo puede ejecutarse en un smartphone con un uso de memoria inferior a 1 GB (el archivo .pte ocupa 0.83 GB).

2. Agentes con tool calling en entornos de desarrollo: el modelo conserva los tokens de tool-calling del modelo base, por lo que puede integrarse en pipelines de agentes que necesiten llamar a funciones externas, ejecutándose en CPU sin necesidad de GPU.

3. Investigación en interpretabilidad y alineamiento: la variante heretic permite estudiar cómo la ablación de la dirección de rechazo afecta el comportamiento del modelo, comparando las respuestas con el modelo base.

4. Prototipado de chatbots sin censura en entornos controlados: el modelo no rechaza solicitudes, lo que resulta útil para explorar temas sensibles en laboratorio o en aplicaciones de investigación, siempre con medidas de seguridad adicionales.

5. Despliegue en servidores ARM de bajo coste: al poder ejecutarse en CPUs ARM como Graviton, el modelo puede desplegarse en instancias de cloud ARM económicas para tareas de generación de texto.

6. Aplicaciones educativas de simulación de diálogo: el modelo puede utilizarse para generar respuestas en escenarios de role-play o simulación donde no se desee que el modelo rechace la conversación, manteniendo la coherencia gracias a su ventana de contexto de 32k tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta variante. El modelo base LiquidAI/LFM2.5-1.2B-Instruct reporta velocidades de decodificación de 239 tok/s en CPU AMD y 82 tok/s en NPU móvil, pero estos datos no se han verificado para la variante heretic.

## Requisitos de hardware

- El archivo ExecuTorch .pte ocupa 0.83 GB. La caché KV para la ventana completa se asigna al cargar en fp32, aproximadamente 0.8 GB, lo que da un total de memoria de alrededor de 1.6 GB.
- No se requieren GPU específicas; el modelo está diseñado para ejecutarse en CPU ARM (Apple Silicon, Snapdragon, Dimensity, Tensor, Graviton) y x86 con kernels AVX.
- En cuanto a GPU, al ser un modelo de 1.2B parámetros, podría ejecutarse en GPUs de consumo con cuantización 4-bit, pero no hay datos específicos en la información disponible.
- Opciones de despliegue: transformers (carga como `Lfm2ForCausalLM`) y ExecuTorch (mediante `llama_main` o el runner de Python, con el `tokenizer.json` y el formato de prompt `<|startoftext|><|im_start|>user\n...<|im_end|>\n<|im_start|>assistant\n`).
- Latencia y throughput: no hay datos específicos para esta variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| experimentalmachines/LFM2.5-1.2B-Instruct-heretic | 1.170.340.608 | 32.768 (ExecuTorch) | lfm1.0 | Abliterated mediante heretic |
| LiquidAI/LFM2.5-1.2B-Instruct | 1.2B (no especificado exacto) | No disponible | lfm1.0 | Modelo base |
| spitfire4794/LFM2.5-1.2B-Instruct-Heretic | No disponible | No disponible | No disponible | Variante heretic similar, sin datos adicionales |

## Limitaciones y advertencias

- El entrenamiento de seguridad del modelo base se ha eliminado a propósito. La model card advierte: "Use responsibly; the safety training of the base model has been removed on purpose." Esto implica un mayor riesgo de generar contenido dañino, ilegal o no seguro.
- No se han publicado evaluaciones de sesgos ni de alucinación específicas para esta variante. Al ser un modelo pequeño, es probable que presente alucinaciones y errores factuales.
- Los idiomas soportados no están especificados, por lo que no se puede garantizar un rendimiento multilingüe.
- La licencia lfm1.0 es una licencia personalizada ("other") que debe revisarse en el LICENSE del modelo base antes de cualquier uso comercial.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido validado por la comunidad.
- La ventana de contexto de 32.768 tokens requiere asignar la caché KV completa al cargar, lo que consume memoria aunque no se utilicen todos los tokens.

## Enlaces

- Modelo: https://huggingface.co/experimentalmachines/LFM2.5-1.2B-Instruct-heretic
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Licencia: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/LICENSE
- Herramienta heretic: https://github.com/p-e-w/heretic
- Variante similar: https://huggingface.co/spitfire4794/LFM2.5-1.2B-Instruct-Heretic
