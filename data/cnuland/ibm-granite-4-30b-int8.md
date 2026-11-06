# cnuland/ibm-granite-4-30b-int8

## Resumen

`cnuland/ibm-granite-4-30b-int8` es una cuantización INT8 (W8A8) del modelo denso `ibm-granite/granite-4.2-30b` de IBM, publicada por el usuario cnuland. El objetivo declarado es cubrir un hueco concreto de despliegue: las cuantizaciones existentes de Granite 4.2 30B (FP8, MXFP8, NVFP4, AWQ-INT4) no pueden servirse en aceleradores AMD CDNA2 como la MI210 (gfx90a), porque FP8 requiere CDNA3 o superior y las rutas MoE INT8 en vLLM solo están habilitadas para CUDA de NVIDIA. Esta build INT8 densa sí funciona sobre ROCm.

El modelo base pertenece a la familia Granite 4.2 de IBM, formada por modelos densos de razonamiento en tamanos de 3B, 8B y 30B, con chain-of-thought integrado, modos de pensamiento flexibles y tool calling aumentado con razonamiento. La cuantización se generó con llm-compressor aplicando SmoothQuant (alpha 0.8) seguido de GPTQ, con 512 muestras de calibración de 2048 tokens y excluyendo `lm_head` de la cuantización.

La relevancia de esta ficha es doble: por un lado documenta una alternativa práctica para servir un modelo de 29 276 770 304 parámetros en una única GPU AMD de 64 GB; por otro, ilustra el estado del soporte de cuantizaciones en vLLM según plataforma (CUDA vs ROCm, CDNA2 vs CDNA3), una restricción que condiciona fuertemente las decisiones de despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`GraniteForCausalLM`, 64 capas) |
| Parametros totales | 29 276 770 304 (29,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de serving usa `--max-model-len 16384`) |
| Tipos de cuantizacion | INT8 W8A8 (pesos y activaciones INT8); pesos por canal simetricos, activaciones por token simetricas y dinamicas; `lm_head` sin cuantizar |
| Idiomas soportados | No disponible (la familia Granite 4.2 se describe como multilingue, sin listado de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con `compressed-tensors` (quant_method: compressed-tensors, version 0.17.1) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de tipo decoder-only (`GraniteForCausalLM`) con 64 capas y 29,3 mil millones de parametros. La model card de esta cuantizacion no detalla la composicion del dataset de preentrenamiento, el numero de tokens ni las fases de alineamiento (RLHF/DPO) del modelo original; esa informacion corresponderia a la model card de `ibm-granite/granite-4.2-30b`, que no se ha incluido en la informacion disponible. La familia Granite 4.2 se presenta por parte de IBM como una familia de modelos de razonamiento con chain-of-thought integrado y modos de pensamiento configurables.

La innovacion tecnica de esta publicacion es el pipeline de cuantizacion: se aplica SmoothQuant con alpha 0.8 para suavizar los rangos de activacion, seguido de GPTQ para los pesos, usando 512 muestras de calibracion de 2048 tokens. La configuracion resultante cuantiza todas las capas `Linear` con pesos INT8 simetricos por canal (observer `memoryless_minmax`, actorder estatico) y activaciones INT8 simetricas por token con cuantizacion dinamica. Se excluye `lm_head`, lo que preserva la precision de la proyeccion final al vocabulario. El resultado ocupa aproximadamente 30 GB de pesos, frente a los ~58 GB en BF16 del modelo original.

## Capacidades

- Generacion de texto conversacional y de proposito general en el modelo base.
- Razonamiento con chain-of-thought integrado y modos de pensamiento flexibles (segun la documentacion de IBM para Granite 4.2).
- Tool calling aumentado con razonamiento (reasoning-augmented tool calling) en la familia 4.2.
- Generacion de codigo y asistencia en flujos de trabajo de AI assistant, segun la descripcion de la coleccion de IBM.
- Capacidades multilingues declaradas a nivel de familia, sin listado concreto de idiomas en la informacion disponible.
- Servible mediante vLLM, incluida la ruta ROCm con GPUs AMD CDNA2 (MI210) y CDNA3 (MI250).
- No se documentan en la informacion disponible capacidades de vision, audio ni decodificacion especulativa especifica de esta build.

## Casos de uso

- Despliegue en infraestructura AMD MI210/MI250: es el caso de uso central de esta publicacion. Permite servir un modelo de 29,3 B en una unica GPU de 64 GB con ROCm, algo que las builds FP8, MXFP8, NVFP4 y AWQ-INT4 de Granite 4.2 30B no permiten en CDNA2.
- Asistentes conversacionales multi-turno: con `--max-model-len 16384` configurado en vLLM, el modelo puede mantener conversaciones con contexto amplio en un solo acelerador, dejando espacio para cache KV dentro de los 64 GB.
- Razonamiento y resolucion de problemas con trazas de pensamiento: util en pipelines donde se necesita inspeccionar el razonamiento intermedio antes de la respuesta final, aprovechando el chain-of-thought integrado del modelo base.
- Automatizacion de agentes con tool calling: el soporte de reasoning-augmented tool calling de la familia 4.2 permite integrar el modelo como planificador en flujos que invocan APIs externas.
- Generacion de codigo en entornos con hardware AMD: equipos que ya operan clústeres ROCm pueden incorporar asistencia de codigo sin depender de GPUs NVIDIA.
- Sustitucion de despliegues BF16 por limitaciones de memoria: pasar de ~58 GB a ~30 GB de pesos permite liberar VRAM para cache KV o para co-ubicar otros servicios en la misma GPU.
- Evaluacion comparativa de precision INT8 frente a BF16: util para equipos que quieran medir la degradacion introducida por SmoothQuant+GPTQ en sus propias tareas antes de adoptar la cuantizacion en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de perplejidad o degradacion respecto al modelo BF16, y la busqueda web solo apunta a la documentacion general de la familia Granite 4.2 sin cifras concretas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 30 GB solo para pesos en INT8 W8A8. Con cache KV y overhead de serving, la model card indica que cabe "comodamente" en una unica GPU de 64 GB.
- GPUs recomendadas: AMD Instinct MI210 y MI250 (ROCm, gfx90a y superiores). En el ecosistema NVIDIA, cualquier GPU con al menos 40-48 GB de memoria efectiva para servir con contexto moderado, aunque la model card no detalla configuraciones NVIDIA para esta build.
- GPU de consumo: no cabe en GPUs de consumo tipicas de 24 GB (RTX 4090, RTX 3090) por el tamano de pesos de ~30 GB. No hay informacion sobre variantes adicionales de cuantizacion de esta build que permitan bajarla a ese rango.
- Opciones de despliegue: vLLM es el motor documentado (`vllm serve cnuland/ibm-granite-4-30b-int8 --max-model-len 16384 --gpu-memory-utilization 0.90`). En MI210/MI250 debe definirse `VLLM_ROCM_USE_AITER=0`, ya que AITER no incluye kernels para gfx90a (0 de 84 librerias) y su activacion provoca `RuntimeError: HIP Function Failed invalid device function`. No se documenta soporte para llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La model card no incluye mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad en AMD CDNA2 |
|---|---|---|---|---|---|
| cnuland/ibm-granite-4-30b-int8 | 29,3 B | No disponible | INT8 W8A8 | Apache 2.0 | Si (objetivo de la build) |
| ibm-granite/granite-4.2-30b (BF16) | 29,3 B | No disponible | BF16 | Apache 2.0 | Si, pero requiere ~58 GB de pesos |
| Granite 4.2 30B FP8 / MXFP8 / NVFP4 | 29,3 B | No disponible | FP8, MXFP8, NVFP4 | Apache 2.0 | No (FP8 requiere CDNA3+) |
| Granite 4.2 30B AWQ-INT4 | 29,3 B | No disponible | INT4 AWQ | Apache 2.0 | No segun la model card (ruta no soportada en MI210/MI250) |

La comparativa se limita a variantes del mismo modelo base porque la informacion proporcionada no incluye datos de rendimiento que permitan contrastar con modelos de otros fabricantes de tamano similar.

## Limitaciones y advertencias

- La cuantizacion INT8 W8A8 introduce degradacion de precision respecto al modelo BF16; no se han publicado mediciones de esa degradacion en la informacion disponible, por lo que debe evaluarse en las tareas objetivo antes de produccion.
- El modelo base puede alucinar; no se documentan en la informacion disponible medidas especificas de mitigacion ni tasas de alucinacion.
- No se detalla la lista de idiomas soportados ni el rendimiento por idioma; la descripcion multilingue es a nivel de familia.
- La longitud de contexto oficial del modelo base no se especifica en la informacion disponible; el valor de 16384 es solo el usado en el ejemplo de serving.
- En ROCm es obligatorio desactivar AITER (`VLLM_ROCM_USE_AITER=0`); no hacerlo provoca un fallo en tiempo de ejecucion en gfx90a.
- El repositorio tiene muy poca traccion (23 descargas, 0 likes en el momento de la consulta) y un unico autor no verificado por IBM; conviene validar la reproducibilidad de la cuantizacion antes de adoptarla en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar tambien la licencia y los terminos del modelo base `ibm-granite/granite-4.2-30b` por si anaden condiciones adicionales.
- No hay informacion sobre sesgos conocidos del modelo base en la documentacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cnuland/ibm-granite-4-30b-int8
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-30b
- Documentacion de Granite 4.2 en IBM: https://www.ibm.com/granite/docs/models/granite4-2
- Coleccion Granite 4.2 Language Models: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- llm-compressor (herramienta de cuantizacion): https://github.com/vllm-project/llm-compressor
