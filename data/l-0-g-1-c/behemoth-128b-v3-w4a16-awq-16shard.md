# L-0-G-1-C/Behemoth-128B-v3-W4A16-AWQ-16shard

## Resumen

Behemoth-128B-v3-W4A16-AWQ-16shard es una cuantizacion AWQ (4-bit pesos, 16-bit activaciones) del modelo base mistralai/Mistral-Medium-3.5-128B, publicada por el usuario L-0-G-1-C en HuggingFace. El repositorio contiene 16 shards en formato safetensors y ocupa 69.7 GB. La licencia es Apache 2.0.

El modelo card esta marcado como "Model card WIP" (en elaboracion) y solo incluye la nota "Tested without reasoning on Mistral v7 Tekken", sin especificaciones tecnicas detalladas. El conteo real de parametros segun los safetensors es de 19.519.255.760, una cifra muy inferior a los 128B que sugiere el nombre, lo que podria indicar una arquitectura de mezcla de expertos (MoE) o una discrepancia en el etiquetado, aunque no hay confirmacion en la documentacion disponible.

Al tratarse de una cuantizacion, el modelo esta pensado para reducir los requisitos de VRAM en comparacion con los pesos originales, manteniendo un rendimiento cercano. Sin embargo, la ausencia de benchmarks y de informacion sobre capacidades limita la evaluacion de su idoneidad para casos de uso especificos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: mistralai/Mistral-Medium-3.5-128B) |
| Parametros totales | 19.519.255.760 (segun safetensors; el nombre sugiere 128B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (AWQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16 shards, AWQ cuantizado) |

## Arquitectura y entrenamiento

El modelo base es mistralai/Mistral-Medium-3.5-128B, pero no se proporcionan detalles sobre su arquitectura en la informacion disponible. El repositorio contiene 16 shards safetensors con un total de 19.519.255.760 parametros segun el conteo de safetensors. Esta cifra es notablemente inferior a los 128B que sugiere el nombre del modelo, lo que podria indicar un modelo de mezcla de expertos (MoE) con parametros activos reducidos, aunque no hay confirmacion en la documentacion.

No se dispone de informacion sobre el proceso de entrenamiento, la composicion del dataset, el numero de tokens ni si se aplicaron tecnicas como RLHF o DPO. El README del modelo no incluye estos datos.

## Capacidades

No se han publicado especificaciones de capacidades en la informacion disponible. El README del modelo solo indica "Tested without reasoning on Mistral v7 Tekken" y "Model card WIP", sin detallar funcionalidades como generacion de texto, razonamiento, soporte de tool calling, capacidades multilingues o vision.

## Casos de uso

No se pueden enumerar casos de uso concretos sin informacion sobre las capacidades del modelo. Dado que se trata de una cuantizacion de un modelo de lenguaje de Mistral, podria emplearse en tareas genericas de procesamiento de lenguaje natural, pero esta afirmacion no esta respaldada por datos en la informacion disponible. Se recomienda consultar la documentacion del modelo base mistralai/Mistral-Medium-3.5-128B para obtener una lista de aplicaciones potenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 69.7 GB, lo que sugiere un modelo de aproximadamente 128B en cuantizacion 4-bit. Para cargar todos los pesos en GPU se necesitarian al menos 70 GB de VRAM. Si el conteo real de parametros es 19.5B, la VRAM necesaria seria menor, pero esto no es consistente con el tamano del repo.
- GPU recomendadas: H100 80GB, A100 80GB o configuraciones multi-GPU con tensor parallelism (por ejemplo, dos o mas RTX 4090).
- No se dispone de datos de latencia ni throughput.
- Opciones de despliegue: vLLM, llama.cpp, o cualquier framework compatible con AWQ y safetensors.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- El modelo card esta marcado como "WIP" (work in progress), por lo que la documentacion es incompleta y puede contener errores.
- Existe una discrepancia significativa entre el nombre del modelo (128B) y el conteo real de parametros en los safetensors (19.5B). Esto puede deberse a una arquitectura MoE no documentada o a un error de etiquetado.
- No se han publicado benchmarks, por lo que no es posible evaluar el rendimiento real del modelo.
- No se especifican los idiomas soportados ni la longitud de contexto.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo sin validacion publica, no hay garantias de calidad, seguridad ni ausencia de sesgos.

## Enlaces

- https://huggingface.co/L-0-G-1-C/Behemoth-128B-v3-W4A16-AWQ-16shard
- https://huggingface.co/L-0-G-1-C/Behemoth-128B-v3-W4A16-AWQ
- https://huggingface.co/BeaverAI/Behemoth-128B-v3b-GGUF
