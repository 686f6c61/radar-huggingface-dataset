# crabby-devil/zils-mini-cerno-4b

## Resumen

zils-mini-cerno-4b es un checkpoint publicado por el usuario crabby-devil que combina dos modelos existentes sin reentrenamiento: por un lado, los pesos del modelo de lenguaje apertixai/cerno-4b-v1.2 (revision e14dec9894c5afb761f90926f1c19b19938a271c) y, por otro, la torre de vision de Qwen/Qwen3.5-4B (revision 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a). El resultado es un modelo multimodal image-text-to-text de 4.539.265.536 parametros totales que sigue el layout completo del checkpoint Qwen3.5 (lenguaje mas vision).

El modelo no introduce ninguna innovacion arquitectonica propia: es un ensamblaje de pesos ajenos bajo licencia Apache-2.0. Su proposito declarado es servir como "body" (cuerpo) para el pool de soups `d3-mini` de Zils, un subred de Bittensor (subnet 127) orientado a modelos de decision. La relevancia de esta ficha es, por tanto, acotada: documenta un artefacto de infraestructura para un ecosistema descentralizado concreto, no un modelo de proposito general con evaluacion publica.

La ficha se ha redactado exclusivamente a partir de la model card y los metadatos de HuggingFace. No hay informacion sobre idiomas soportados, datos de entrenamiento, benchmarks ni evaluaciones, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de lenguaje cerno-4b-v1.2 + torre de vision Qwen3.5-4B); config.json corresponde al padre Qwen3.5-4B |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (dos shards: `model-00001-of-00002.safetensors` y `model-00002-of-00002.safetensors`, con `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

El checkpoint es un ensamblaje, no un entrenamiento. Segun la model card, los 426 tensores `model.language_model.*` provienen sin modificar de apertixai/cerno-4b-v1.2 y los 297 tensores `model.visual.*` provienen sin modificar de Qwen/Qwen3.5-4B. El export original de cerno era solo texto; para completar el layout multimodal de Qwen3.5 se anadio la torre de vision intacta en un segundo shard, se renombro el `model.safetensors` original a `model-00001-of-00002.safetensors`, se genero un nuevo indice de shards y se adopto el `config.json` del padre Qwen3.5-4B. Tambien se incluye `zils-owner.json`, que identifica la hotkey de Bittensor que registro el body.

No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas del modelo base cerno-4b-v1.2 en la informacion proporcionada. La model card remite a la ficha de cerno para uso y evaluacion. La unica innovacion documentada es de empaquetado: la fusion de una torre de lenguaje de texto con una torre de vision de otro modelo bajo un unico configuracion Qwen3.5.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo de lenguaje cerno-4b-v1.2 (sin detalle publico en la informacion disponible).
- Procesamiento de imagen y texto (pipeline image-text-to-text): la torre de vision de Qwen3.5-4B habilita entrada multimodal.
- Integracion como modelo de decision en el ecosistema Zils (Bittensor subnet 127), segun los tags `decision-model`, `zils` y `bittensor`.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse mediante la infraestructura de endpoints de HuggingFace.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Participacion en el pool de soups d3-mini de Zils: el checkpoint esta disenado explicitamente como body para este pool de Bittensor subnet 127; se usaria como componente base en la composicion de modelos del subred.
- Experimentacion con fusion de torres multimodales: util para investigadores que quieran estudiar el comportamiento de un modelo de lenguaje de texto acoplado a una torre de vision de otro linaje bajo un configuracion Qwen3.5.
- Servicio de inferencia image-text-to-text via endpoints compatibles: al llevar el tag `endpoints_compatible`, puede desplegarse en la infraestructura de endpoints de HuggingFace para prototipos de descripcion de imagenes o VQA.
- Base para fine-tuning multimodal: al estar en safetensors y con licencia Apache-2.0, sirve como punto de partida para ajuste supervisado en tareas de vision-lenguaje.
- Evaluacion comparativa de ensamblajes: permite medir hasta que punto una torre de vision de Qwen3.5 funciona acoplada a un lenguaje distinto, como caso de estudio de compatibilidad entre linajes.
- Reproducibilidad de artefactos de subred: util para auditores del ecosistema Bittensor que necesiten verificar la procedencia de pesos registrados por una hotkey concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 9,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 12-16 GB para contextos moderados.
- Cuantizacion a 8 bits: alrededor de 4,5-5 GB de pesos; a 4 bits: alrededor de 2,5-3 GB, mas overhead.
- GPU recomendadas: A100 o H100 para servicio de produccion; RTX 4090 (24 GB) para fp16 con margen amplio; RTX 3090/4080 (16-24 GB) viables en fp16 o 8 bits.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando cuantizacion de 4-8 bits; en fp16 se recomienda 16 GB o mas.
- Opciones de despliegue: transformers (libreria declarada), endpoints compatibles de HuggingFace; vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| zils-mini-cerno-4b | 4.539.265.536 | no disponible | image-text-to-text | Apache-2.0 | Ensamblaje de cerno-4b-v1.2 + vision Qwen3.5-4B |
| apertixai/cerno-4b-v1.2 | no disponible | no disponible | texto | Apache-2.0 (segun model card) | Fuente de la torre de lenguaje |
| Qwen/Qwen3.5-4B | no disponible en la informacion proporcionada | no disponible | multimodal | Apache-2.0 | Fuente de la torre de vision y del config.json |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado de forma conjunta: la torre de lenguaje y la de vision provienen de linajes distintos y no consta alineacion entre ellas, lo que puede degradar la coherencia multimodal.
- Ausencia total de evaluacion publica: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni cartas de evaluacion propias.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano ni en ningun otro idioma concreto.
- Longitud de contexto no documentada; no apto para planificacion de produccion sin verificacion previa.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin datos de alineacion no se puede acotar.
- Sesgos conocidos: no disponibles; dependen de los datos de entrenamiento de cerno-4b-v1.2 y Qwen3.5-4B, no documentados aqui.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se deben conservar los avisos de atribucion de ambos modelos fuente (Apache-2.0 seccion 4(b)); la model card exige reconocer a los autores originales.
- Trazabilidad: incluye `zils-owner.json` con la hotkey de Bittensor, lo que vincula el artefacto a una identidad concreta del subred; conviene auditar ese fichero antes de reutilizarlo.
- El `config.json` es el de Qwen3.5-4B, no el de cerno; posibles discrepancias entre configuracion declarada y pesos reales de la torre de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/crabby-devil/zils-mini-cerno-4b
- Modelo base de lenguaje: https://huggingface.co/apertixai/cerno-4b-v1.2
- Modelo base de vision y config: https://huggingface.co/Qwen/Qwen3.5-4B
- Revision de cerno usada: e14dec9894c5afb761f90926f1c19b19938a271c
- Revision de Qwen3.5-4B usada: 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Ecosistema Zils / Bittensor subnet 127: no disponible (no se proporciona URL en la informacion)
