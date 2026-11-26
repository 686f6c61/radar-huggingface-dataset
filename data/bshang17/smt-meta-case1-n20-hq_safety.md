# bshang17/smt-meta-case1-n20-hq_safety

## Resumen

`smt-meta-case1-n20-hq_safety` es un conjunto de checkpoints de entrenamiento intermedio (mid-training) publicados por el usuario de Hugging Face `bshang17`. No se trata de un modelo final afinado para uso directo, sino de instantaneas del proceso de entrenamiento de un modelo base SmolLM2 de 1.700 millones de parametros, entrenado durante 60.000 millones de tokens sobre una mezcla de datos denominada `hq_safety`. Cada checkpoint se guarda en dos variantes: una copia completa en fp32 con el estado del optimizador AdamW (que permite reanudar el entrenamiento exactamente donde se dejo) y una exportacion en bf16 pensada para evaluacion.

El interes de este repositorio es fundamentalmente de investigacion: permite estudiar la evolucion del modelo a lo largo del entrenamiento, analizar el efecto de la mezcla `hq_safety` en distintas fases y reproducir experimentos de mid-training sin necesidad de reentrenar desde cero. El tamano del repositorio (25,4 GB) es coherente con la presencia de estados completos del optimizador en fp32.

La informacion publicada es muy limitada: no hay model card detallada, ni pipeline declarado, ni licencia, ni idiomas especificados, ni resultados de evaluacion. Todo lo que se sabe del modelo procede de la breve descripcion del autor y de la convencion de nombres de SmolLM2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-1.7B; no confirmada explicitamente en la model card) |
| Parametros totales | 1.700 millones (aproximado, segun el nombre del modelo base SmolLM2-1.7B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados son fp32 y bf16; no se incluyen GGUF ni cuantizaciones de inferencia) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32 en el checkpoint completo, bf16 en la exportacion); incluye `optimizer.pt` y `state.json` |

## Arquitectura y entrenamiento

El modelo se describe como un SmolLM2-1.7B sometido a un mid-training de 60.000 millones de tokens sobre la mezcla `hq_safety`. SmolLM2 es la familia de modelos pequenos de Hugging Face basada en transformers decoder-only; el modelo de 1.700 millones de parametros emplea atencion por grupos (GQA) y activaciones SwiGLU, aunque la model card no detalla la configuracion exacta de esta variante concreta.

El aspecto diferencial del repositorio es su caracter de checkpoint de investigacion. Cada directorio `step-XXXXXX/` contiene los pesos completos en fp32, el estado integro del optimizador AdamW en `optimizer.pt` y un `state.json` con el numero de paso y la posicion en el flujo de datos, lo que permite reanudar el entrenamiento de forma exacta. La subcarpeta `bf16/` ofrece una exportacion de los mismos pesos para evaluacion sin necesidad de cargar el estado del optimizador. No se documentan datos sobre composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto autoregresiva, heredada de la arquitectura SmolLM2.
- Capacidad de razonamiento y codigo limitada por el tamano (1,7B) y por tratarse de un checkpoint intermedio, no de un modelo afinado.
- Soporte de tool calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion publicada.
- Capacidades multilingues: no disponibles en la informacion publicada.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Uso principal previsto: reanudacion de entrenamiento y evaluacion de checkpoints intermedios.

## Casos de uso

- Investigacion sobre mid-training: cargar un checkpoint concreto y reanudar el entrenamiento exactamente en el paso guardado gracias a `optimizer.pt` y `state.json`, lo que permite reproducir experimentos de forma determinista.
- Analisis de la mezcla `hq_safety`: comparar checkpoints de distintos pasos para estudiar como evoluciona el comportamiento del modelo con esta composicion de datos y si mejora las metricas de seguridad frente al modelo base.
- Evaluacion de seguridad en modelos pequenos: usar las exportaciones bf16 para medir tasas de respuesta segura, rechazo y alucinacion en un modelo de 1,7B, con coste de inferencia bajo.
- Reproducibilidad de experimentos academicos: publicar y compartir el estado completo del entrenamiento facilita la verificacion por terceros de resultados sobre SmolLM2.
- Destilacion y ajuste fino posterior: partir de un checkpoint intermedio como inicializacion para SFT o DPO y comparar frente a partir del modelo base original.
- Estudio de dinamica de entrenamiento: analizar la evolucion de la perdida, la norma de gradientes o la representacion interna a lo largo de los 60.000 millones de tokens usando los estados guardados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada para reanudar el entrenamiento: los pesos en fp32 (unos 6,8 GB) mas el estado completo de AdamW (el doble de los parametros, unos 13,6 GB) superan los 20 GB solo en estados, por lo que se recomienda al menos 40 GB de VRAM (A100 40GB, A100 80GB, H100) para entrenamiento con gradientes y activaciones.
- GPU consumer: la inferencia en bf16 cabe en RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070, RTX 4080 y RTX 4090. El entrenamiento completo no cabe en GPU consumer.
- Opciones de despliegue: al no incluir pesos GGUF, la inferencia directa requiere transformers, vLLM o TGI con los safetensors bf16; para llama.cpp u Ollama seria necesario convertir y cuantizar previamente.
- Latencia y throughput: no disponibles en la informacion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| smt-meta-case1-n20-hq_safety | ~1,7B | no disponible | no disponible | Hugging Face (repo de 25,4 GB) | Checkpoint de mid-training, no modelo final |
| SmolLM2-1.7B (Hugging Face) | 1,7B | 8.192 tokens (segun documentacion publica del modelo base) | Apache 2.0 (segun documentacion publica del modelo base) | Hugging Face | Modelo final instruido y base; referencia directa |
| Qwen2.5-1.5B | 1,5B | 32.768 tokens (segun documentacion publica) | Apache 2.0 (segun documentacion publica) | Hugging Face | Alternativa pequena con contexto amplio |
| Llama 3.2 1B | 1,2B | 128.000 tokens (segun documentacion publica) | Llama 3.2 Community License | Hugging Face | Alternativa pequena de Meta |

Los datos de SmolLM2-1.7B, Qwen2.5-1.5B y Llama 3.2 1B proceden de la documentacion publica de dichos modelos y no de la informacion proporcionada sobre este repositorio; se incluyen como referencia contextual.

## Limitaciones y advertencias

- No es un modelo listo para produccion: se trata de un checkpoint intermedio de entrenamiento, sin afinado instructivo ni alineacion final documentada.
- Ausencia total de licencia declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier uso fuera de investigacion.
- Sin informacion sobre idiomas, sesgos o datos de entrenamiento, lo que impide evaluar riesgos de sesgo y toxicidad.
- Riesgo elevado de alucinacion y de respuestas incoherentes por el estado intermedio del entrenamiento.
- Longitud de contexto no documentada; no se debe asumir la ventana de SmolLM2 sin verificacion.
- El repositorio incluye estados de optimizador en fp32 que elevan el peso a 25,4 GB, lo que complica su descarga y almacenamiento frente a un modelo final.
- No se han publicado evaluaciones de seguridad pese a que la mezcla se denomine `hq_safety`; el nombre no garantiza comportamiento seguro.

## Enlaces

- Hugging Face: https://huggingface.co/bshang17/smt-meta-case1-n20-hq_safety
- SmolLM2 (modelo base de referencia, Hugging Face): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Repositorio SmolLM2 en GitHub: https://github.com/huggingface/smollm
