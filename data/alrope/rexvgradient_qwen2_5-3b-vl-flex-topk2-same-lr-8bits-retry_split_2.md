# alrope/rexvgradient_qwen2_5-3b-vl-flex-topk2-same-lr-8bits-retry_split_2

## Resumen

`alrope/rexvgradient_qwen2_5-3b-vl-flex-topk2-same-lr-8bits-retry_split_2` es un ajuste fino (SFT) derivado de la familia Qwen2.5-VL, publicado por el usuario alrope en HuggingFace. El nombre del repositorio y la etiqueta `flex_qwen2_5_vl_moe` sugieren una variante experimental con mezcla de expertos (MoE) sobre una base Qwen2.5-VL de 3B, entrenada con TRL. El checkpoint contiene 6.610.155.264 parametros segun los pesos en safetensors, lo que indica que el modelo efectivo es mayor que la base de 3B por la incorporacion de los modulos de mezcla de expertos.

Se trata de un modelo de generacion de texto (pipeline `text-generation`) con capacidad multimodal heredada de Qwen2.5-VL, entrenado mediante SFT supervisado. La model card generada automaticamente por TRL no especifica el modelo base real (aparece como `None`), ni el dataset de entrenamiento, ni la licencia, lo que limita considerablemente la trazabilidad del checkpoint.

Por su naturaleza experimental (0 descargas, 0 likes, creado y actualizado en el mismo dia), debe considerarse un artefacto de investigacion mas que un modelo listo para produccion. Es relevante unicamente para quienes exploran variantes MoE sobre bases pequenas multimodales o reproducen experimentos de SFT con TRL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (tag `flex_qwen2_5_vl_moe`); base Qwen2.5-VL de 3B segun el nombre |
| Parametros totales | 6.610.155.264 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el nombre incluye "8bits", sin detalle de esquema) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica `licence: license`, sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de una base Qwen2.5-VL de 3B (arquitectura transformer con encoder visual y decoder de lenguaje) y, segun el tag `flex_qwen2_5_vl_moe`, incorpora una capa de mezcla de expertos con enrutamiento top-k=2 (indicado en el nombre `topk2`). El checkpoint final pesa 6.610.155.264 parametros, aproximadamente el doble de la base de 3B, lo que es coherente con la duplicacion de parametros por la adicion de expertos. No se dispone de informacion sobre el numero de expertos, el tamano de cada uno ni la fraccion de parametros activos por token.

El entrenamiento se realizo con SFT (supervised fine-tuning) usando TRL 1.6.0.dev0, Transformers 4.57.6, PyTorch 2.13.0a0 y Datasets 5.0.1. El nombre del checkpoint incluye `same-lr` y `retry_split_2`, lo que sugiere un experimento de ablacion sobre tasas de aprendizaje y una division de datos en particiones, pero no hay documentacion publica del dataset, del numero de tokens vistos ni de si hubo etapas de RLHF o DPO. La model card no incluye informacion sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional, heredada de la base Qwen2.5-VL y ajustada con SFT.
- Procesamiento multimodal (imagen y texto) por la base Qwen2.5-VL, aunque no se documenta el alcance exacto tras el ajuste.
- Soporte de conversaciones multi-turno a traves del formato de chat de Qwen.
- Compatibilidad con `transformers` y con el pipeline de generacion de texto.
- Tag `endpoints_compatible`, lo que indica que puede servirse mediante la infraestructura de endpoints de HuggingFace.
- No se documenta soporte explicito de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode).
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion sobre arquitecturas MoE multimodales: el checkpoint permite reproducir y analizar el efecto de anadir expertos con top-k=2 sobre una base Qwen2.5-VL de 3B en tareas de generacion.
- Experimentos de SFT con TRL: sirve como referencia para comparar configuraciones de entrenamiento (por ejemplo, `same-lr` frente a otras tasas) en un pipeline estandar de HuggingFace.
- Evaluacion de la degradacion o mejora de capacidades visuales tras el ajuste: util para medir si el SFT sobre la base VL preserva la comprension de imagenes.
- Prototipado de asistentes conversacionales en entornos de laboratorio, sin garantias de calidad para produccion.
- Estudio de la relacion entre parametros totales (6,6B) y calidad en tareas de lenguaje, comparando con la base de 3B sin expertos.
- Base para futuros ajustes o destilaciones en proyectos academicos que necesiten un punto de partida multimodal pequeno con licencia por determinar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,2 GB solo para pesos (coincide con el tamano del repo), mas overhead de activaciones y cache KV; en la practica, se recomienda al menos 16-20 GB.
- Cuantizacion a 8 bits: alrededor de 6,6-7 GB de pesos; cabe en GPUs consumer con 12 GB o mas, aunque con margen ajustado.
- Cuantizacion a 4 bits (si se genera GGUF/AWQ): aproximadamente 3,5-4 GB de pesos; viable en GPUs de 8 GB.
- GPUs recomendadas: A100 40/80 GB, H100 para despliegue en produccion; RTX 4090 (24 GB) para inferencia en bf16 sin problemas; RTX 3090/4080 (16-24 GB) para bf16 o 8 bits.
- Cabe en GPU consumer: si, en RTX 4090 en bf16 y en GPUs de 12 GB con cuantizacion a 8 bits.
- Opciones de despliegue: `transformers` con pipeline de generacion; vLLM, TGI o llama.cpp solo si se generan los formatos compatibles, ya que no se publican pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rexvgradient_qwen2_5-3b-vl-flex-topk2-same-lr-8bits-retry_split_2 | 6,61B | no disponible | no disponible | HuggingFace (0 descargas) |
| Qwen2.5-VL-3B (base de referencia) | 3B aprox. | 32k (segun documentacion publica de Qwen) | Apache 2.0 (segun Qwen) | HuggingFace |
| Qwen2.5-3B (texto) | 3B aprox. | 32k (segun documentacion publica de Qwen) | Apache 2.0 (segun Qwen) | HuggingFace |

La comparativa con la base Qwen2.5-VL-3B es la mas directa: el checkpoint aqui descrito duplica aproximadamente el numero de parametros por la capa MoE, pero no publica metricas que permitan afirmar una mejora. Frente a modelos de 7B de proposito general, el checkpoint no ofrece datos de rendimiento que justifiquen su uso fuera de investigacion.

## Limitaciones y advertencias

- Model card generada automaticamente por TRL: el campo del modelo base aparece como `None`, lo que impide verificar la procedencia exacta de los pesos.
- Licencia no especificada (`licence: license`), lo que impide confirmar si se permite uso comercial.
- Sin informacion sobre el dataset de entrenamiento, numero de tokens ni composicion, por lo que no se pueden evaluar sesgos ni riesgos de contaminacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje ajustados con SFT sin etapa de alineamiento documentada.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano.
- Longitud de contexto no disponible; no se debe asumir la ventana de 32k de la base Qwen2.5-VL sin verificacion.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- El sufijo `retry_split_2` sugiere un experimento dividido en particiones, lo que puede implicar que el checkpoint sea parcial o intermedio.
- No se publican pesos en GGUF ni cuantizaciones listas para llama.cpp u Ollama.
- No apto para produccion sin una evaluacion propia exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/alrope/rexvgradient_qwen2_5-3b-vl-flex-topk2-same-lr-8bits-retry_split_2
- Run de Weights & Biases: https://wandb.ai/seanlyu2-university-of-illinois-urbana-champaign/huggingface/runs/af7uo5xj
- Repositorio TRL: https://github.com/huggingface/trl
