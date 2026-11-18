# mhseo2/klear8b-planfmt-sftv9ptok-s300

## Resumen

klear8b-planfmt-sftv9ptok-s300 es un ajuste fino supervisado (SFT) de tipo checkpoint intermedio publicado por el usuario mhseo2. Se trata del paso 300 de un total de 387 de un entrenamiento de SFT sobre el modelo base Klear-Reasoner-8B-SFT-ptok, orientado a un formato de planificación con un token especial de plan (``, id 151669). Con 8.190.735.360 parámetros, se enmarca en la familia de modelos de 8B derivados de la arquitectura Qwen3, según la etiqueta del repositorio.

El modelo no es un lanzamiento de producción, sino un artefacto de investigación dentro de una receta de entrenamiento más amplia (denominada "v8b recipe"). El entrenamiento se realizó sobre el conjunto de datos `mhseo2/klear-planfmt-pgdpo-pairs`, concretamente la partición `plan_gepa/v8_full/merged_ptok` con 12.408 filas de entrenamiento, y parte del commit `mopdRL 27d80cd9`. La relevancia del checkpoint es acotada: sirve para reproducir o inspeccionar una etapa concreta del pipeline de SFT, no como modelo final.

La información pública es muy limitada: no hay model card extendida, ni resultados de benchmarks, ni especificación de licencia, idiomas o pipeline. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que confirma su carácter de artefacto de trabajo más que de modelo distribuido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, según tag del repositorio; detalles no disponibles) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint de SFT derivado de Klear-Reasoner-8B-SFT-ptok, etiquetado como Qwen3 en Hugging Face. No se dispone de detalles sobre la arquitectura interna más allá de la familia declarada; por el tamaño (8.190 millones de parámetros) y la nomenclatura, se trata presumiblemente de un transformer denso de 8B, aunque no se confirma si incorpora innovaciones como atención lineal o decodificación especulativa.

El entrenamiento se ejecutó sobre 2 GPU H100 con FSDP2 y Ulysses SP 1, partiendo del commit `mopdRL 27d80cd9`. La configuración declarada incluye batch de 32, learning rate 2e-5 con scheduler coseno (ratio mínimo 0,5, warmup 11 pasos), weight decay 0,01, gradient clipping 1 y longitud máxima de 32.768 tokens. La receta incorpora una estructura de pérdidas con pesos diferenciados (structure 20, decision 5, decision_continue 5) y un "plan contrast shift" con margen 0,1 y peso 1, orientado a reforzar el formato de planificación mediante un token dedicado `` (id 151669). El checkpoint corresponde al paso 300 de 387, por lo que no es el modelo final de la receta.

## Capacidades

- Generación de texto y razonamiento: al derivar de Klear-Reasoner-8B, se espera capacidad de razonamiento multi-paso, aunque no hay evaluación publicada que lo confirme en este checkpoint.
- Formato de planificación estructurada: el entrenamiento introduce un token especial `` y pesos de pérdida específicos para estructurar la salida en pasos de plan, decisión y continuación de decisión.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado; el formato de plan sugiere orientación a tareas descompuestas, pero sin documentación adicional.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación sobre formatos de planificación: el checkpoint permite inspeccionar cómo un SFT con token `` y pesos de pérdida diferenciados afecta a la estructura de salida en tareas de descomposición, comparándolo con el modelo base Klear-Reasoner-8B-SFT-ptok.
- Reproducción de experimentos: al estar documentados hiperparámetros, dataset y commit de partida, sirve para replicar la curva de entrenamiento en el paso 300 y validar la receta "v8b" en entornos con 2×H100 y FSDP2.
- Evaluación de checkpoints intermedios: útil para estudiar si el paso 300 de 387 ya muestra convergencia en el formato de plan o si aún hay degradación respecto al modelo final.
- Análisis de pérdidas ponderadas: permite estudiar el efecto de los pesos structure 20 / decision 5 / decision_continue 5 sobre la calidad de las salidas estructuradas en dominios donde la planificación es crítica.
- Base para ajustes posteriores: al ser un SFT intermedio, puede emplearse como punto de partida para DPO/RL u otras etapas, aunque requeriría validación propia al no ser el checkpoint final.
- Estudio de sesgos y robustez en modelos de razonamiento de 8B: con 32.768 tokens de contexto, permite probar comportamiento en prompts largos, aunque sin garantías de calidad por la falta de evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.190 millones de parámetros en safetensors (16,4 GB de repo), en FP16 se requieren aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y KV cache; en BF16 similar. En cuantización de 8 bits, en torno a 8-9 GB; en 4 bits, en torno a 4-5 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: el entrenamiento se realizó en 2×H100, lo que sugiere que la inferencia en precisión completa es cómoda en A100 40/80 GB o H100. Para una sola GPU, A100 40 GB o RTX 4090 24 GB son suficientes en FP16/BF16.
- Cabe en GPU de consumo: sí, en RTX 4090 24 GB en BF16; en GPUs de 12-16 GB requeriría cuantización a 8 o 4 bits.
- Opciones de despliegue: no se documentan; por el formato safetensors y la familia Qwen3, son plausibles vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama, pero no hay confirmación del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| klear8b-planfmt-sftv9ptok-s300 | 8,19B | 32.768 | no disponible | Checkpoint intermedio (paso 300/387) |
| Klear-Reasoner-8B-SFT-ptok | no disponible (base del SFT) | no disponible | no disponible | Modelo base del que deriva |
| Qwen3 (familia 8B) | ~8B (variantes) | no disponible en esta ficha | no disponible | Familia declarada en tags |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas. La comparación se limita a parámetros, contexto de entrenamiento y estado del artefacto.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 300 de 387, por lo que no representa el modelo final de la receta y puede presentar calidad inferior al checkpoint de convergencia.
- Sin evaluación publicada: no hay benchmarks, ni métricas de calidad, ni validación humana documentada.
- Licencia no especificada: no se puede confirmar el uso comercial; debe contactarse con el autor o consultarse el repositorio antes de cualquier despliegue en producción.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe.
- Riesgo de alucinación: inherente a modelos de 8B sin evaluación de fidelidad; no hay datos que lo cuantifiquen.
- Sesgos: no documentados; al derivar de un modelo base de razonamiento sin información sobre su dataset, no se pueden evaluar sesgos conocidos.
- Formato de salida especializado: el token `` y los pesos de pérdida diferenciados pueden producir salidas estructuradas que no encajen en pipelines genéricos de chat.
- Repositorio sin tracción: 0 descargas y 0 likes; no hay comunidad que haya validado el artefacto.
- Fecha de creación futura en los metadatos (2026-11-18): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/mhseo2/klear8b-planfmt-sftv9ptok-s300
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/mhseo2/klear-planfmt-pgdpo-pairs
- Modelo base referenciado (Klear-Reasoner-8B-SFT-ptok): no disponible como enlace directo en la información proporcionada
- Commit de partida `mopdRL 27d80cd9`: no disponible como enlace directo
- Paper, blog o demo: no disponibles
