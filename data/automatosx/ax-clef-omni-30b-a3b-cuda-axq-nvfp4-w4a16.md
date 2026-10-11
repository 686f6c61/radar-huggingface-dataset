# AutomatosX/AX-Clef-Omni-30B-A3B-CUDA-AXQ-NVFP4-W4A16

## Resumen

AX-Clef-Omni-30B-A3B-CUDA-AXQ-NVFP4-W4A16 es un checkpoint de desarrollo cuantizado por AutomatosX a partir de Cloudflare/clef-omni (commit `0db1cd2607d76a7bdb2a382f659e7b313079f84b`). Se trata de una adaptación de la familia Qwen3-Omni MoE (`qwen3_omni_moe`) reorientada por Cloudflare a un uso distinto del conversacional: Clef-Omni es un modelo de decisión, no un modelo de chat. Una petición consiste en un estado más un esquema de preguntas tipadas (`noul`, `choice`, `score`), y un único prefill devuelve una probabilidad para cada opción permitida.

El checkpoint aplica cuantización NVFP4 W4A16 con el toolkit AXQuant en modo RTN (round-to-nearest). Las matrices elegibles de atención, MLP y expertos, tanto del thinker como del talker, se almacenan con pesos E2M1, escalas de bloque E4M3FN de tamaño 16 y una escala global inversa en FP32. Las activaciones permanecen en BF16: no hay W4A4, ni AWQ, ni cuantización de activaciones. El paquete usa el formato público `compressed-tensors` para NVFP4 y se serializó con el backend `torch-cuda`.

El modelo se publica como evidencia de desarrollo y no como certificado ni como equivalente al checkpoint BF16 original. Tiene 0 descargas y 0 likes, licencia Apache-2.0 y un tamano de repositorio de 23,1 GB. El nombre comercial indica 30B-A3B, pero el recuento real de safetensors asciende a 35.259.818.545 parametros, por lo que conviene tratar la nomenclatura como orientativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (tag `qwen3_omni_moe`), derivado de Cloudflare/clef-omni |
| Parametros totales | 35.259.818.545 (~35,26 mil millones, segun safetensors) |
| Parametros activos | No disponible con precision; el nombre del modelo declara A3B (~3 mil millones activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos E2M1, escalas de bloque E4M3FN de 16, escala global inversa FP32, activaciones BF16); sin W4A4, sin AWQ, sin cuantizacion de activaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con layout `compressed-tensors` NVFP4 (tag de 8 bits) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos (MoE) multimodal, etiquetado como `qwen3_omni_moe`, con ramas de vision, audio y texto. El modelo base Cloudflare/clef-omni reorganiza ese tronco en torno a un cabezal de esquema conjunto (`joint_head.safetensors`), que se conserva en BF16 original sin cuantizar y que se acompaña de `joint_schema_model.py` y `joint_head_config.json`. La generacion de texto no ejecuta ese cabezal; es especifico del modo decision.

Sobre el proceso de cuantizacion: AXQuant aplica RTN para producir los pesos NVFP4 en las matrices elegibles del thinker y del talker (atención, MLP y expertos). Vision, el codificador de audio, code2wav, las normalizaciones, los embeddings de tokens y los cabezales del modelo de lenguaje se mantienen en la precision de origen. El autor indica explicitamente que la salida de voz no se midio, que el cabezal de esquema conjunto no forma parte del indice de lenguaje y no se cuantiza, y que no se ejecuto ninguna pasada CUDA por el cabezal de decision. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Manejo de peticiones estructuradas como estado mas esquema de preguntas tipadas, con tres tipos documentados: `noul`, `choice` y `score`.
- Devuelve una probabilidad por cada opcion permitida en un unico prefill, en lugar de generar texto autorregresivamente.
- Componentes multimodales heredados del tronco Qwen3-Omni: vision y codificador de audio se mantienen a precision de origen y estan presentes en el paquete.
- Ruta de audio hablado: el talker y el componente code2wav existen en el modelo, aunque la implementacion de referencia `load_release_model` no los carga y la salida de voz no se ha medido.
- Cabezal de esquema conjunto en BF16 (`joint_head.safetensors`) disponible para el modo decision.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, ni capacidades multilingues en la informacion disponible.
- No se declaran modos especiales como thinking mode; el pipeline registrado es `text-generation`, pero la propia model card advierte que no es un modelo de chat.

## Casos de uso

- Enrutamiento de decisiones en pipelines de agentes: dado un estado y un conjunto cerrado de acciones, el modelo devuelve una distribucion de probabilidad sobre cada opcion, lo que permite seleccionar la rama siguiente sin generar texto libre.
- Clasificacion tipada con esquemas de preguntas `choice` y `score`: util para etiquetar o puntuar alternativas de forma consistente, aprovechando que todas las opciones se evalúan en un mismo prefill.
- Seleccion de herramientas sin generar la llamada: el modo decision puede puntuar que herramienta o funcion es la adecuada ante un estado dado, delegando la ejecucion a un orquestador externo.
- Decision multimodal con entrada de imagen o audio: al conservar la vision y el codificador de audio a precision de origen, puede condicionar su decision sobre representaciones multimodales del estado.
- Modelado de recompensa o evaluacion en entornos de simulacion: el cabezal de esquema conjunto en BF16 permite producir probabilidades por opcion que sirvan como senal de scoring.
- Filtrado y moderacion con criterios tipados: definir un esquema de preguntas de tipo `score` para evaluar categorias de riesgo sobre un estado textual.
- Recuperacion de senales estructuradas a partir de estados heterogeneos: transformar contextos no estructurados en decisiones discretas sin postprocesar texto generado.
- Pruebas de investigacion sobre cuantizacion NVFP4: el checkpoint sirve como evidencia de desarrollo para comparar el comportamiento del cabezal de esquema bajo W4A16 frente al BF16 de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara que no se midio la salida de voz, que no se ejecuto ninguna pasada CUDA por el cabezal de decision y que este paquete no reclama paridad con el checkpoint BF16 de origen, por lo que no existen cifras de calidad, latencia o throughput verificables.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 23,1 GB, de modo que el peso en disco y el footprint de pesos en memoria son del orden de 20 a 23 GB. A ello hay que sumar las activaciones BF16 y los componentes no cuantizados (vision, codificador de audio, normalizaciones, embeddings y cabezales del LM), por lo que conviene reservar margen adicional. La cifra exacta no esta disponible.
- Aceleracion nativa NVFP4: el formato NVFP4 esta pensado para GPUs Blackwell. En GPUs anteriores (Ampere, Ada, Hopper) la ruta NVFP4 no cuenta con aceleracion nativa equivalente, por lo que habria que comprobar el soporte real del backend antes de desplegar.
- GPU recomendadas: no disponibles de forma explicita. Por tamano de pesos, encajan GPUs de 24 GB o mas (por ejemplo RTX 4090, L40S, A100 40/80 GB, H100) siempre que el backend soporte el layout `compressed-tensors` NVFP4; en Blackwell se aprovecharia ademas la aceleracion nativa del formato.
- Cabe en consumer GPU: si, previsiblemente en GPUs de 24 GB como la RTX 4090, aunque el margen es ajustado por los componentes no cuantizados y las activaciones BF16. No hay confirmacion del autor.
- Opciones de despliegue: la libreria declarada es `transformers` con safetensors y layout `compressed-tensors`; el modelo lleva el tag `endpoints_compatible`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El autor no publica mediciones y advierte que la referencia `load_release_model` no carga el talker, code2wav ni este checkpoint NVFP4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Clef-Omni-30B-A3B-CUDA-AXQ-NVFP4-W4A16 (este) | ~35,26 mil millones (nombre 30B-A3B) | No disponible | NVFP4 W4A16, compressed-tensors | Apache-2.0 | HuggingFace, 0 descargas |
| Cloudflare/clef-omni (base BF16) | No disponible (mismo tronco) | No disponible | BF16 | Apache-2.0 | HuggingFace |
| Qwen3-Omni-30B-A3B (familia de origen) | ~30 mil millones (A3B) | No disponible en la informacion proporcionada | Multiples | No disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos de rendimiento comparables entre estas variantes porque no se han publicado benchmarks en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de chat: la propia model card indica explicitamente que Clef-Omni no debe usarse como modelo conversacional; su funcion es devolver probabilidades sobre esquemas de preguntas tipadas.
- Evidencia de desarrollo: el paquete se presenta como evidencia de desarrollo, no como certificado Decision Index, y no reclama paridad con el checkpoint BF16 de origen.
- Cabezal de decision sin validar en CUDA: no se ejecuto ninguna pasada CUDA por el cabezal de decision, por lo que su comportamiento en GPU no esta verificado.
- Salida de voz no medida: aunque el talker y code2wav existen en el modelo, no se ha medido la sintesis de voz y la referencia upstream no los carga.
- Componentes no cuantizados: vision, codificador de audio, code2wav, normalizaciones, embeddings y cabezales del modelo de lenguaje permanecen en precision de origen, lo que aumenta el footprint respecto a una estimacion puramente de 4 bits.
- Idiomas y sesgos: no hay informacion disponible sobre idiomas soportados, sesgos conocidos ni riesgo de alucinacion especifico de este checkpoint.
- Licencia: Apache-2.0 en el modelo upstream, lo que en principio permite uso comercial, sujeto a las condiciones de LICENSE y NOTICE del repositorio. Conviene revisar el aviso de procedencia del modelo base.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado su comportamiento.
- Compatibilidad de despliegue incierta: no se documenta soporte en motores de inferencia habituales mas alla de `transformers` y el tag `endpoints_compatible`.

## Enlaces

- Ficha del modelo: https://huggingface.co/AutomatosX/AX-Clef-Omni-30B-A3B-CUDA-AXQ-NVFP4-W4A16
- Modelo base: https://huggingface.co/Cloudflare/clef-omni
- Commit de origen citado: `0db1cd2607d76a7bdb2a382f659e7b313079f84b` (Cloudflare/clef-omni)
- Artefactos incluidos en el repositorio: `joint_head.safetensors`, `joint_schema_model.py`, `joint_head_config.json`
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
