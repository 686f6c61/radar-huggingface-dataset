# nchapman/Qwen3.5-0.8B-d3-lite-LoRA

## Resumen

Qwen3.5-0.8B-d3-lite-LoRA es un adaptador LoRA de rango 128 (junto con una cabeza de clasificacion `CodeReadout` de 255 vias) publicado por el usuario nchapman en Hugging Face. Se construye sobre el modelo base Qwen/Qwen3.5-0.8B, un transformer denso de 0,8 mil millones de parametros desarrollado por Alibaba Qwen, y se deriva del modelo de decision `vllm-sr/d3-lite` mediante una tecnica que el autor denomina "Joint-SVD + 4-NormFold".

El modelo no es un generador de texto generalista, sino un adaptador orientado a tareas de decision binaria o multiclase (evaluado con el conjunto JevBench), etiquetado con los tags `decision-model` y `system-one`. Su relevancia radica en que demuestra que es posible destilar el comportamiento de un modelo de decision completo en un adaptador de bajo rango sobre un modelo base pequeno, obteniendo una precision del 73,16% en JevBench frente al 58,01% del modelo base sin adaptar.

El repositorio ocupa 0,2 GB y se distribuye en formato PEFT/safetensors bajo licencia Apache 2.0. No se dispone de informacion sobre idiomas soportados, datos de entrenamiento ni detalles completos de la arquitectura interna del adaptador mas alla de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso Qwen3.5-0.8B; incluye cabeza `CodeReadout` de 255 vias |
| Parametros totales | No disponible (adaptador LoRA de rango 128; el modelo base tiene 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3.5-0.8B, un transformer denso de 0,8 mil millones de parametros. El adaptador en si es un LoRA de rango 128 extraido de `vllm-sr/d3-lite` mediante una tecnica denominada "Joint-SVD + 4-NormFold", que combina una descomposicion en valores singulares conjunta con cuatro operaciones de normalizacion (NormFold). Ademas del adaptador LoRA, el repositorio incluye una cabeza `CodeReadout` de 255 vias que actua como clasificador de salida para tareas de decision.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Los tags `system-one` y `decision-model` sugieren que el modelo esta disenado para inferencia rapida de tipo "sistema 1" (respuestas inmediatas sin razonamiento extendido), en contraposicion a modelos con modo de pensamiento. La evaluacion se realiza sobre JevBench, un conjunto de 231 casos dividido en 48 faciles, 72 originales y 111 dificiles.

## Capacidades

- Clasificacion y decision: la cabeza `CodeReadout` de 255 vias permite emitir decisiones discretas sobre tareas de evaluacion tipo JevBench.
- Generacion de texto: heredada del modelo base Qwen3.5-0.8B, aunque el adaptador esta orientado a decision mas que a generacion libre.
- Razonamiento de sistema 1: inferencia rapida sin cadena de pensamiento extendida, segun el tag `system-one`.
- Mejora sobre el modelo base: incrementa la precision en JevBench del 58,01% al 73,16%.
- No se dispone de informacion sobre soporte de tool calling, function calling, capacidades de agente, multilingues, vision o audio.

## Casos de uso

- Clasificacion binaria o multiclase en pipelines de decision: el adaptador puede integrarse como cabecera de clasificacion sobre el modelo base para tareas de enrutamiento o filtrado, aprovechando la cabeza `CodeReadout` de 255 vias.
- Evaluacion de modelos de decision: util como referencia para comparar tecnicas de destilacion (Joint-SVD, NormFold) frente al modelo completo `vllm-sr/d3-lite`.
- Investigacion en destilacion de adaptadores: sirve para estudiar como un adaptador de rango 128 puede aproximar el comportamiento de un modelo de decision mayor con una perdida minima de precision (73,16% frente a 72,29% del modelo completo).
- Prototipado rapido en entornos con recursos limitados: al ocupar 0,2 GB y construirse sobre un modelo de 0,8B, puede desplegarse en hardware modesto para experimentacion.
- Sistemas de decision de baja latencia: el enfoque de "sistema 1" sugiere su uso en escenarios donde se requiere respuesta inmediata sin razonamiento multi-paso.
- Benchmarking interno: permite validar la metodologia de extraccion de adaptadores sobre nuevos conjuntos de datos de decision.

## Benchmarks y rendimiento

Resultados en JevBench Public Eval (231 casos: 48 faciles / 72 originales / 111 dificiles):

| Modelo | Precision global | Facil (48) | Original (72) | Dificil (111) | NLL | Brier |
|---|---|---|---|---|---|---|
| Base Qwen/Qwen3.5-0.8B | 134/231 (58,01%) | 47/48 | 48/72 | 39/111 | 0,9617 | 0,5312 |
| Qwen3.5-0.8B-d3-lite-LoRA (r=128 Joint-SVD + 4-NormFold) | 169/231 (73,16%) | 48/48 | 68/72 | 53/111 | 0,6549 | 0,3666 |
| Full vllm-sr/d3-lite | 167/231 (72,29%) | 48/48 | 67/72 | 52/111 | 0,6455 | 0,3608 |

El adaptador supera ligeramente al modelo completo `vllm-sr/d3-lite` en precision global (73,16% frente a 72,29%), aunque este ultimo obtiene mejores valores en NLL (0,6455 frente a 0,6549) y Brier (0,3608 frente a 0,3666).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base de 0,8B en precision FP16 requiere aproximadamente 1,6 GB, y el adaptador anade un peso minimo (repositorio de 0,2 GB).
- GPU recomendadas: no disponible. Por el tamano del modelo base, cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en consumer GPU: si, previsiblemente en cualquier GPU con al menos 4 GB de VRAM, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: PEFT (libreria indicada en la model card); el tag `vllm-sr` sugiere compatibilidad con vLLM, aunque no se detalla.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision JevBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-d3-lite-LoRA | Adaptador sobre 0,8B | No disponible | 73,16% | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | 58,01% | No disponible | Hugging Face |
| vllm-sr/d3-lite (completo) | No disponible | No disponible | 72,29% | No disponible | Hugging Face |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (adaptadores de decision sobre modelos pequenos).

## Limitaciones y advertencias

- El adaptador esta especializado en tareas de decision tipo JevBench; su rendimiento en generacion de texto generalista no esta documentado y podria degradarse respecto al modelo base.
- No se dispone de informacion sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de robustez.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un modelo de decision, el riesgo se traslada a clasificaciones erroneas en lugar de texto inventado.
- La precision en casos dificiles es del 47,7% (53/111), lo que indica margen de mejora en escenarios complejos.
- No se especifican los idiomas soportados; se desconoce si el adaptador conserva las capacidades multilingues del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero se desconoce la licencia del modelo base Qwen3.5-0.8B y del modelo de origen `vllm-sr/d3-lite`, que podrian imponer restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/Qwen3.5-0.8B-d3-lite-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo de origen: https://huggingface.co/vllm-sr/d3-lite
