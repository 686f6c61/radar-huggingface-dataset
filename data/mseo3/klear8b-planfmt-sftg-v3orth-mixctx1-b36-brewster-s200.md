# mseo3/klear8b-planfmt-sftg-v3orth-mixctx1-b36-brewster-s200

## Resumen

klear8b-planfmt-sftg-v3orth-mixctx1-b36-brewster-s200 es un ajuste fino supervisado (SFT) del modelo Klear-Reasoner-8B-SFT, desarrollado por el usuario mseo3. Se trata de un checkpoint intermedio del paso 200 de un entrenamiento planificado a 1500 pasos, orientado a ensenar al modelo un formato de "plan" mediante dos tokens especiales nuevos (`<|plan|>` con id 151669 y `<|/plan|>` con id 151670). El modelo resuelve el problema de estructurar el razonamiento en fases explicitas de planificacion dentro de la generacion, algo relevante para pipelines de agentes y razonamiento multi-paso.

El modelo parte de la familia Qwen3 (tag `qwen3` en Hugging Face) con 8.190.735.360 parametros totales en formato safetensors y un repositorio de 16,4 GB. El entrenamiento se realizo sobre 4 GPU H200 con FlashAttention 3, batch global de 36 y learning rate de 2e-5 con decaimiento coseno hasta 1e-5. El checkpoint publicado corresponde al paso 200, no al final del entrenamiento, por lo que debe considerarse un artefacto de investigacion mas que un modelo listo para produccion.

La relevancia actual radica en su enfoque experimental: anade tokens de control de planificacion con inicializacion ortogonal de las filas de `lm_head` respecto a sus piezas de texto, y entrena con un dataset privado que enmascara pasos fallidos en la perdida. Es un ejemplo de tecnica de "plan-format SFT" aplicada a un modelo de razonamiento de 8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, segun tag; detalles no disponibles) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Kwai-Klear/Klear-Reasoner-8B-SFT, que a su vez pertenece a la familia Qwen3 segun los tags del repositorio. La innovacion principal es la incorporacion de dos tokens especiales de planificacion: `<|plan|>` (id 151669) y `<|/plan|>` (id 151670). Estos tokens se anaden sin atar (untied) y las filas correspondientes en `lm_head` se reinicializan de forma ortogonal a sus piezas de texto, una tecnica que busca evitar que el modelo herede representaciones sesgadas hacia los tokens de texto originales.

El entrenamiento se realizo con la receta `sft_recipe_v3orth`, ejecucion `sft_g_ptokc_orth_lr2e5_mixctx1_b36_s1500_brewster`, sobre 4 GPU H200 con FlashAttention 3. Los datos provienen del dataset privado `mseo3/klear8b-planfmt-revmask-sft` (commit 2cf6eb05), subconjunto `data/mixctx_v1` con 58.446 filas: filas revisadas con pasos fallidos enmascarados de la perdida, mas filas originales de los mismos problemas cuyos pasos fallidos en la ronda 0 se enmascaran y se leen solo como contexto. Se uso batch global 36, learning rate 2e-5 con decaimiento coseno a 1e-5 durante 1500 pasos, warmup de 30 pasos y arranque desde cero desde el modelo base. El optimizador solo se conserva en el guardado mas reciente, podando los shards obsoletos antes de cada escritura (`SFT_PRUNE_OPT_BEFORE_SAVE=1`). Los pesos se fusionaron de los shards FSDP a bf16.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Klear-Reasoner-8B-SFT, orientado a tareas de razonamiento.
- Formato de planificacion: genera contenido delimitado por los tokens `<|plan|>` y `<|/plan|>`, lo que permite extraer y validar la fase de plan de forma programatica.
- Razonamiento multi-paso: el entrenamiento con pasos enmascarados sugiere soporte para secuencias de pasos con estructura de plan.
- Capacidades multilingues: no disponibles (no se especifican idiomas en la model card).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible explicitamente; el formato de plan es compatible con pipelines de agentes, pero no se documenta integracion.
- Vision y audio: no disponibles.

## Casos de uso

- Investigacion sobre formatos de planificacion: el modelo sirve para estudiar como afecta la adicion de tokens de control de plan al comportamiento de un modelo de razonamiento de 8B, comparando con el checkpoint base.
- Extraccion programatica de planes: al delimitar el plan con tokens especiales, un pipeline puede parsear la fase de planificacion de forma fiable y usarla para validacion o para alimentar un ejecutor de pasos.
- Generacion de trazas de razonamiento estructuradas: util para construir datasets de razonamiento con fases separadas (plan y ejecucion) a partir de las salidas del modelo.
- Evaluacion de tecnicas de enmascaramiento de perdida: el checkpoint permite reproducir y analizar el efecto de enmascarar pasos fallidos durante el SFT en tareas de razonamiento.
- Base para nuevos ajustes: al ser un checkpoint intermedio con licencia Apache 2.0, puede servir como punto de partida para experimentos de SFT adicionales.
- Prototipado de agentes con planificacion explicita: en entornos de investigacion, el modelo puede generar un plan delimitado antes de ejecutar acciones, facilitando la inspeccion del razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para contexto corto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB; en 4 bits, alrededor de 5-6 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: H200 (usadas en entrenamiento), A100 40/80 GB, H100; en consumer, RTX 4090 (24 GB) puede alojar el modelo en bf16 con contexto limitado.
- Cabe en consumer GPU: si, en GPUs con 24 GB o mas en bf16, y en GPUs de 8-12 GB con cuantizacion agresiva.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles en principio con pesos safetensors de familia Qwen3, aunque no se ha verificado la compatibilidad de los tokens especiales anadidos en cada runtime; se requiere conversion a GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| klear8b-planfmt-sftg-v3orth-mixctx1-b36-brewster-s200 | 8,19B | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Kwai-Klear/Klear-Reasoner-8B-SFT (base) | ~8B | no disponible | no disponible | Hugging Face |
| Qwen3 8B (familia) | ~8B | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 200 de un entrenamiento de 1500 pasos, por lo que su calidad esta por debajo del modelo final previsto.
- Dataset privado: los datos de entrenamiento no son publicos, lo que impide auditar la composicion y los sesgos introducidos.
- Sin benchmarks: no hay evaluaciones publicadas que permitan estimar su rendimiento real.
- Tokens especiales no estandar: los ids 151669 y 151670 y los tokens `<|plan|>`/`<|/plan|>` requieren configuracion especifica en el tokenizador y en el runtime de inferencia; un uso incorrecto puede degradar las salidas.
- Riesgo de alucinacion: inherente a los modelos de razonamiento; el enmascaramiento de pasos fallidos durante el entrenamiento puede reducir pero no elimina este riesgo.
- Idiomas no documentados: no se especifica que idiomas soporta, por lo que el rendimiento multilingue es incierto.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de un modelo base cuyos terminos no se detallan, conviene verificar la licencia del modelo original.
- Sin soporte documentado de tool calling ni agentes: no se debe asumir su funcionamiento en produccion sin validacion previa.
- Repositorio sin descargas ni likes: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mseo3/klear8b-planfmt-sftg-v3orth-mixctx1-b36-brewster-s200
- Modelo base: https://huggingface.co/Kwai-Klear/Klear-Reasoner-8B-SFT
- Dataset de entrenamiento (privado): https://huggingface.co/datasets/mseo3/klear8b-planfmt-revmask-sft
