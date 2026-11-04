# Ba2han/packed-long-h100

## Resumen

packed-long-h100 es un repositorio de checkpoints de entrenamiento del modelo de lenguaje híbrido `exp_train` de 700M parámetros, desarrollado por el usuario Ba2han. No se trata de un modelo publicado para inferencia, sino de un artefacto de investigación que almacena el estado intermedio del entrenamiento sobre el dataset `Ba2han/packed1`, con el run de Weights & Biases denominado `exp_train`/`packed-long-h100`. El repositorio contiene pesos densos en FP32, la tabla de memoria de n-gramas en BF16, el estado del optimizador y los flujos RNG necesarios para reanudar el entrenamiento.

La arquitectura combina Gated DeltaNet con atención con compuertas (gated attention) y una memoria de n-gramas con hashing de 600M de parámetros, sobre un total de 700M. Esta combinación de mecanismos lineales/recurrentes con atención clásica y memoria explícita de n-gramas sitúa al modelo en la línea de los transformers híbridos orientados a contextos largos, aunque a una escala mucho menor que los modelos de producción actuales.

Su relevancia es fundamentalmente metodológica: permite inspeccionar cómo se comporta un LM híbrido con memoria de n-gramas durante el entrenamiento, verificar la integridad de los checkpoints mediante sumas de comprobación FP64 y reproducir el proceso con el script `code/verify_checkpoint.py`. No hay evidencia de que esté pensado para uso en producción ni de que se haya evaluado en benchmarks públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + gated attention + memoria de n-gramas con hashing |
| Parametros totales | 700M (600M corresponden a la memoria de n-gramas) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos densos en FP32, tabla n-gram en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors, ngram.safetensors, optim_rank0.safetensors, state_rank0.safetensors) |

## Arquitectura y entrenamiento

El modelo `exp_train` es un LM híbrido de 700M parámetros que combina tres componentes: capas de Gated DeltaNet (un mecanismo de atención lineal con estado recurrente y compuertas), capas de atención con compuertas (gated attention) y una memoria de n-gramas con hashing de 600M de parámetros. Esta última actúa como una tabla de n-gramas aprendida que complementa la capacidad de modelado local del transformer, una idea emparentada con los modelos de memoria explícita tipo n-gram o product-key memory. El tokenizer tiene un vocabulario de 60.800 tokens.

El entrenamiento se realiza sobre el dataset `Ba2han/packed1`, con checkpoints organizados en carpetas `step_XXXXXXXX/` que representan estados completos del entrenamiento. El repositorio conserva únicamente los dos checkpoints más recientes, eliminando los anteriores y compactando el historial. Cada checkpoint incluye los pesos densos en FP32, la tabla de n-gramas en BF16 junto con su estado RMSprop por fila, el estado del optimizador, los flujos RNG y contadores de dropout por capa, la configuración del modelo con los ids de tokens especiales, el tokenizer y un `meta.json` con el número de paso, los tokens vistos y sumas de comprobación FP64 de cada entrada. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva (modelo de lenguaje causal).
- Modelado de dependencias de largo alcance mediante la combinación de Gated DeltaNet y memoria de n-gramas.
- Memoria explícita de n-gramas con hashing, orientada a capturar patrones locales y de repetición.
- Reanudación de entrenamiento desde checkpoints completos (optimizador, RNG, estado de dropout).
- Verificación de integridad de checkpoints mediante sumas de comprobación FP64.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio, modo thinking ni multilingüismo.

## Casos de uso

- Investigación en arquitecturas híbridas: permite estudiar cómo interactúan Gated DeltaNet, gated attention y una memoria de n-gramas de 600M en un LM de 700M, comparando curvas de pérdida y comportamiento por paso.
- Reproducibilidad de experimentos: los checkpoints incluyen estado del optimizador, RNG y contadores de dropout, lo que permite reanudar el entrenamiento exactamente donde se dejó y replicar resultados.
- Auditoría de integridad de pesos: el `meta.json` con sumas FP64 y el script `code/verify_checkpoint.py` permiten validar que los tensores no se han corrompido durante la transferencia o el almacenamiento.
- Estudio de memorias de n-gramas con hashing: la tabla `ngram.safetensors` en BF16 con su estado RMSprop por fila facilita analizar qué n-gramas se refuerzan durante el entrenamiento y cómo evolucionan.
- Base para ajuste fino experimental: al ser un checkpoint de 700M con tokenizer propio de 60.800 tokens, puede servir como punto de partida para experimentos de continuación de preentrenamiento o SFT en dominios concretos.
- Docencia y divulgación: un modelo pequeño con arquitectura híbrida y artefactos de entrenamiento completos es útil para explicar en cursos cómo se estructura un checkpoint real (pesos, optimizador, RNG, tokenizer, metadatos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos densos están en FP32 (aproximadamente 2,8 GB para los 700M parámetros, aunque la memoria de n-gramas de 600M en BF16 añade unos 1,2 GB adicionales). El repositorio completo ocupa 6,9 GB, incluyendo estado del optimizador y RNG.
- GPU recomendadas: no disponible. El nombre del repositorio (`h100`) sugiere que el entrenamiento se realizó en NVIDIA H100, pero no se documentan requisitos de inferencia.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de 700M parámetros, pero no hay confirmación en la información disponible.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el formato es safetensors y el modelo requiere código propio para cargar la memoria de n-gramas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| packed-long-h100 (exp_train) | 700M | no disponible | Híbrida (Gated DeltaNet + gated attention + n-gram memory) | no disponible | Checkpoints de entrenamiento en HF |
| Mamba-2 (130M–2.7B) | 130M–2.7B | hasta 2K–16K según variante | SSM puro | Apache 2.0 | Pesos publicados para inferencia |
| RWKV-7 (0.1B–2.9B) | 0.1B–2.9B | teóricamente ilimitado | RNN lineal con atención | Apache 2.0 | Pesos publicados para inferencia |
| Jamba (52B) | 52B (12B activos) | 256K | Híbrida transformer-Mamba MoE | Apache 2.0 | Pesos publicados para inferencia |

La comparación es aproximada: packed-long-h100 no es un modelo listo para inferencia, sino un artefacto de entrenamiento, por lo que la comparación directa con modelos publicados es limitada. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- No es un modelo listo para producción: son checkpoints de entrenamiento, no una release de inferencia.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre un dataset no especificado (`packed1`), el riesgo de sesgos y alucinaciones es desconocido.
- Licencia no disponible: no se puede garantizar el uso comercial ni la redistribución.
- Idiomas soportados no disponibles: no hay información sobre cobertura multilingüe.
- Longitud de contexto no disponible: aunque el nombre sugiere orientación a contextos largos, no se especifica la ventana efectiva.
- El repositorio conserva solo los dos checkpoints más recientes, por lo que el historial de entrenamiento se pierde y no se puede reproducir desde el inicio.
- Requiere código propio para cargar la memoria de n-gramas y el estado del optimizador; no es compatible directamente con pipelines estándar de transformers sin adaptación.
- El estado del optimizador y los flujos RNG están vinculados a la configuración exacta del entrenamiento; reanudar en otro hardware o con otra versión del código puede romper la reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ba2han/packed-long-h100
- Dataset de entrenamiento: https://huggingface.co/datasets/Ba2han/packed1
- Run de Weights & Biases: proyecto `exp_train`, run `packed-long-h100` (no se proporciona URL directa)
- Script de verificación: `code/verify_checkpoint.py` dentro del repositorio
