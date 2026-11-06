# Jakemu/Qwen3.5-35B-A3B-int8-g128-mtp

## Resumen

Jakemu/Qwen3.5-35B-A3B-int8-g128-mtp es una exportación cuantizada del modelo Qwen/Qwen3.5-35B-A3B, publicada por el usuario Jakemu. Se trata de un checkpoint weight-only W8A16 en formato INT8 con cuantización por grupos de tamano 128, que incluye además la cabeza MTP (multi-token prediction) del modelo original. El objetivo es ofrecer una variante optimizada para inferencia que reduzca el espacio en disco y el ancho de banda de memoria respecto a los pesos BF16 originales, manteniendo en BF16 los componentes sensibles: routers, puertas pequenas, normalizaciones, embeddings y lm_head.

El modelo base es un MoE de Qwen con aproximadamente 36B parametros totales y 3B activos por token (la nomenclatura A3B indica los parametros activos). Esta exportación es exclusivamente de texto y no está pensada para cargarse con Transformers AutoModel ni con vLLM: requiere el runtime propietario infer-opt del autor, junto con sus dependencias CUDA (PyTorch, Triton, safetensors, transformers y flash-linear-attention).

La relevancia de esta ficha es doble: por un lado documenta una receta de cuantización INT8 group-128 aplicada a un MoE con cabeza MTP; por otro, advierte de que las validaciones publicadas son comprobaciones de empaquetado e inferencia (recarga estricta, generación de 64 tokens y paridad de tokens con MTP k=1,2), no evaluaciones de precisión por tarea. El repositorio ocupa 37,1 GB y la licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (modelo base Qwen3.5-35B-A3B); exportación con cabeza MTP |
| Parametros totales | ~36B (modelo base); ~35B segun nomenclatura del checkpoint |
| Parametros activos | ~3B (sufijo A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 weight-only W8A16, simetrica round-to-nearest, grupo 128, escalas BF16, sin dataset de calibracion; routers, puertas, norms, embeddings y lm_head en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors cuantizados para el runtime infer-opt (no GGUF, no compatible con Transformers AutoModel ni vLLM) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-35B-A3B es un transformer con mezcla de expertos (MoE) de aproximadamente 36B parametros totales y 3B activos por token. Esta exportación no reentrena el modelo: aplica cuantización post-entrenamiento weight-only en INT8 con granularidad de grupo 128, redondeo simétrico al más cercano y escalas en BF16, sin calibrar con datos. Los módulos de expertos se cuantizan (41 módulos INT8 según la validación del autor), mientras que routers, puertas pequenas, normalizaciones, embeddings y lm_head conservan pesos BF16 para preservar el enrutamiento y la estabilidad numérica.

La innovación principal de esta exportación es la inclusión de la cabeza MTP (multi-token prediction) dentro del checkpoint cuantizado, lo que permite decodificación especulativa con verificación secuencial. El autor reporta paridad de tokens frente a decodificación ordinaria para MTP con k=1 y k=2 usando verificación secuencial y consistente en una NVIDIA RTX PRO 6000 Blackwell Server Edition. No se documenta el número de tokens de entrenamiento, la composición del dataset ni si el modelo base usó RLHF o DPO; esa información corresponde a la model card de Qwen y no está incluida en la información disponible.

## Capacidades

- Generación de texto en modo solo texto; la exportación no incluye torre de visión aunque el modelo base figure como image-text-to-text.
- Razonamiento y conversación multi-turno heredados del modelo base Qwen3.5-35B-A3B.
- Decodificación especulativa mediante la cabeza MTP incluida, con verificación secuencial (k=1 y k=2 validadas).
- Enrutamiento MoE con expertos cuantizados en INT8 y routers en BF16.
- Capacidades multilingües: no disponibles en la información de esta exportación.
- Tool calling y function calling: no documentado en esta exportación; depende del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado en esta exportación.

## Casos de uso

- Despliegue de inferencia en servidores con GPU Blackwell: el checkpoint está validado en RTX PRO 6000 Blackwell Server Edition, por lo que encaja en entornos de producción que ya usan ese hardware y el runtime infer-opt.
- Reducción de huella en disco y memoria: con 37,1 GB de repositorio frente a los pesos BF16 del modelo base, es adecuado para nodos con VRAM limitada que necesitan servir un MoE de ~35B.
- Decodificación especulativa con MTP: útil en cargas de generación larga donde se quiera experimentar con multi-token prediction y verificación secuencial para reducir pasos de decodificación.
- Investigación en cuantización de MoE: sirve como referencia reproducible de una receta INT8 group-128 sin calibración aplicada a expertos, con manifiesto SHA-256 por archivo.
- Evaluación comparativa de precisión: al mantener routers y lm_head en BF16, es un punto de partida para medir la degradación de tareas frente al modelo original.
- Pipelines internos de solo texto: para tareas de generación, resumen o extracción donde no se requiera visión ni integración con vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta comprobaciones de empaquetado e inferencia: recarga estricta con 41 módulos INT8 de expertos, generación ordinaria de 64 tokens y paridad de tokens para MTP k=1,2 con verificación secuencial y consistente. No hay datos de MMLU, HumanEval, GSM8K ni métricas de throughput.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 37,1 GB en disco; en VRAM se requiere espacio para pesos INT8 más activaciones y caché KV, por lo que se recomienda al menos 48 GB para margen operativo (estimación, no dato publicado).
- GPU validadas: NVIDIA RTX PRO 6000 Blackwell Server Edition. A100 no fue validada en esta release.
- GPU consumer: no hay validación publicada en RTX 4090 u otras consumer; el tamano del checkpoint hace improbable un ajuste cómodo en 24 GB.
- Despliegue: exclusivamente mediante el runtime infer-opt (Jake-Song/infer-opt, commit b5ae4228), con kernels `fla-delta`. No compatible con vLLM, Transformers AutoModel, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte que las validaciones no constituyen evidencia de aceleración por MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| Jakemu/Qwen3.5-35B-A3B-int8-g128-mtp | ~35-36B totales, ~3B activos | no disponible | INT8 W8A16 group-128 + MTP | Apache-2.0 | infer-opt |
| Qwen/Qwen3.5-35B-A3B (base) | ~36B totales, ~3B activos | no disponible | BF16 | Apache-2.0 | Transformers |
| Alternativas INT8 de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo texto: la exportación no incluye capacidades de visión del modelo base.
- Runtime propietario: no se puede cargar con Transformers AutoModel ni vLLM; requiere infer-opt y sus dependencias CUDA.
- Validación limitada: las pruebas publicadas son de empaquetado e inferencia, no de precisión por tarea; no hay evidencia de calidad frente al modelo original.
- MTP compilado: el autor reporta fallos conocidos de paridad en MoE MTP compilado; debe usarse verificación secuencial por defecto.
- Sin calibración: la cuantización usa redondeo simétrico sin dataset de calibración, lo que puede introducir degradación no medida en tareas sensibles.
- A100 no validada: no hay garantías de funcionamiento en esa GPU para esta release.
- Riesgo de alucinación y sesgos: no documentados en esta exportación; se heredan del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar los términos del modelo base y del runtime infer-opt.
- Idiomas soportados no documentados en esta ficha.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/Jakemu/Qwen3.5-35B-A3B-int8-g128-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Repositorio de inferencia: https://github.com/Jake-Song/infer-opt/tree/b5ae4228a361fa562063fac7cd46dd19a611e9f2
- Documentación de estado MoE del runtime: MOE_STATUS.md en el repositorio infer-opt
