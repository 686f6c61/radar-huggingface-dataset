# nm-testing/Qwen3.8-27B-MXFP6A8

## Resumen

Qwen3.8-27B-MXFP6A8 es una cuantizacion del modelo multimodal Qwen/Qwen3.8-27B publicada por el usuario nm-testing bajo licencia Apache 2.0. Se trata de un checkpoint de pesos cuantizados en formato compressed-tensors, generado sin datos de calibracion (round-to-nearest) mediante la herramienta `model_free_ptq` de LLM Compressor. El objetivo declarado es caber en una unica GPU de 32 GB manteniendo un comportamiento cercano al modelo en BF16.

El checkpoint ocupa 26,1 GB en disco y declara 23.503.237.872 parametros en los tensores de safetensors, aunque el modelo base se denomina comercialmente "27B"; no se documenta el motivo de esa diferencia. El modelo base es multimodal de tipo image-text-to-text, con torre de vision, atencion hibrida (capas de atencion completa junto a capas GDN) y proyecciones MTP (multi-token prediction).

Su relevancia es practica: permite desplegar un modelo multimodal de ~23,5 B en una sola GPU de 32 GB con una perdida de precision medida de 1,2 puntos en GSM8K respecto al BF16 (0,770 frente a 0,782). El principal caveat es de madurez: requiere vLLM con soporte de MXFP6, que el autor describe como "en progreso", por lo que la compatibilidad de despliegue no esta garantizada en el momento de publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atencion hibrida: atencion completa y capas GDN; incluye torre de vision y proyecciones MTP |
| Parametros totales | 23.503.237.872 (~23,5 B) segun safetensors; el modelo base se denomina "27B" |
| Parametros activos | No disponible (no se documenta si es MoE; el esquema de cuantizacion distingue "Dense MLP") |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLP denso: pesos MXFP6 (E2M3) con activaciones MXFP8 dinamicas (`mxfp6-pack-quantized`). Atencion (completa y GDN) y proyecciones MTP: pesos y activaciones MXFP8. LM head: pesos FP8 por canal con activaciones FP8 por token dinamicas. Embeddings, torre de vision, `in_proj_a/b` de GDN, `fc` de MTP y normas: BF16. Sin calibracion (round-to-nearest) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (etiquetado como 8-bit) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del base Qwen/Qwen3.8-27B, no un modelo entrenado desde cero. La arquitectura subyacente, segun se deduce del esquema de cuantizacion publicado, combina capas de atencion completa con capas GDN, incorpora una torre de vision (pipeline image-text-to-text) y proyecciones MTP para prediccion de multiples tokens. No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica de este checkpoint es exclusivamente de compresion: se aplica cuantizacion de precision mixta sin datos de calibracion mediante LLM Compressor, con una asignacion granular de precision por modulo (MXFP6 para el MLP denso, MXFP8 para atencion y MTP, FP8 por canal para el LM head y BF16 para modulos sensibles como embeddings, torre de vision y normas). El autor indica que sigue la disposicion de gaunernst/Qwen3.8-27B-MXFP6, pero almacenado en el formato compressed-tensors. El script `quantize.py` reproduce el checkpoint.

## Capacidades

- Generacion de texto y comprension de imagenes: el pipeline declarado es image-text-to-text, con torre de vision mantenida en BF16.
- Razonamiento aritmetico y de sentido comun: validado con GSM8K 5-shot (0,770 de exactitud), aunque no es una evaluacion exhaustiva.
- Prediccion multi-token: el modelo incluye proyecciones MTP, lo que habilita decodificacion especulativa en implementaciones que lo soporten.
- Conversacion multi-turno: el tag `conversational` esta presente en la ficha de HuggingFace.
- Compatibilidad con endpoints: etiquetado como `endpoints_compatible`.
- Soporte de tool calling o function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).
- Capacidades de audio: no disponible.

## Casos de uso

- Despliegue multimodal en una sola GPU de 32 GB: el checkpoint esta dimensionado explicitamente para ese perfil de hardware, de modo que permite servir un modelo image-text-to-text de ~23,5 B sin repartir pesos entre varias GPU.
- Descripcion y analisis de imagenes en lotes: la torre de vision conservada en BF16 permite tareas de captioning o extraccion de informacion de documentos escaneados, capturas o fotografias.
- Evaluacion comparativa de cuantizacion: sirve como referencia para medir el impacto de MXFP6/MXFP8 frente al base en BF16; el propio autor publica la comparacion en GSM8K.
- Aplicaciones sensibles al espacio en disco o a la memoria: con 26,1 GB de repo, es adecuado para entornos donde el checkpoint BF16 del modelo base no cabe en el almacenamiento o la VRAM disponible.
- Prototipado e investigacion con vLLM: puede servirse con `vllm serve nm-testing/Qwen3.8-27B-MXFP6A8` una vez disponible el soporte de MXFP6, lo que facilita experimentar con el modelo base a menor coste de memoria.
- Investigacion sobre cuantizacion sin calibracion: al ser un checkpoint RTN reproducible con `quantize.py`, es util para estudiar la degradacion de precision en modelos multimodales con atencion hibrida.
- Tareas de generacion de texto de uso general: el tag `conversational` y los resultados en GSM8K indican uso viable en asistentes textuales, siempre que se valide el idioma y el dominio concreto.

## Benchmarks y rendimiento

GSM8K, 5-shot, greedy, sobre las 1319 preguntas completas, ejecutado con `tests/evals/gsm8k/gsm8k_eval.py` de vLLM en una unica B300:

| Modelo | Exactitud GSM8K |
|---|---|
| Qwen/Qwen3.8-27B (BF16) | 0,782 |
| Qwen3.8-27B-MXFP6A8 | 0,770 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, MMMU u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el autor indica que el checkpoint esta dimensionado para caber en una unica GPU de 32 GB; los pesos ocupan 26,1 GB en disco, a los que hay que sumar cache KV y activaciones.
- GPU recomendadas: el autor valida la evaluacion en una NVIDIA B300. Cualquier GPU con 32 GB o mas de memoria es candidata segun el propio criterio de diseno.
- GPU de consumo: una RTX 5090 (32 GB) entra en el perfil declarado; una RTX 4090 (24 GB) no dispone de VRAM suficiente para los pesos en este formato.
- Opciones de despliegue: vLLM con soporte de MXFP6 (el autor lo describe como "en progreso") y la libreria compressed-tensors. No se documenta soporte en llama.cpp, Ollama, TGI ni otras alternativas; dado el formato compressed-tensors, es poco probable sin conversion adicional.
- Latencia y throughput: no disponible. No se publican cifras de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nm-testing/Qwen3.8-27B-MXFP6A8 | ~23,5 B (segun safetensors) | No disponible | GSM8K 0,770 | apache-2.0 | HuggingFace, requiere vLLM con MXFP6 |
| Qwen/Qwen3.8-27B (base, BF16) | Denominado 27B | No disponible | GSM8K 0,782 | No disponible en la informacion proporcionada | HuggingFace |
| gaunernst/Qwen3.8-27B-MXFP6 | No disponible | No disponible | No disponible | No disponible | HuggingFace; layout de referencia seguido por este checkpoint |

## Limitaciones y advertencias

- Perdida de precision medible: 1,2 puntos porcentuales en GSM8K (0,782 a 0,770). El impacto en otras tareas, especialmente en tareas multimodales, no se ha evaluado en la informacion disponible.
- Cuantizacion sin calibracion: al usar round-to-nearest sin datos de calibracion, no hay ajuste de escalas a la distribucion real de activaciones, lo que puede penalizar mas en dominios alejados de las tareas evaluadas.
- Soporte de despliegue incompleto: el autor indica que el soporte de MXFP6 en vLLM esta "en progreso", por lo que el modelo puede no ser servible de forma fiable en el momento de su publicacion.
- Riesgo de alucinacion: no documentado en la informacion proporcionada. Al ser una cuantizacion de un modelo generativo de ~23,5 B, persiste el riesgo inherente, sin mitigaciones declaradas.
- Idiomas: el campo de idiomas no esta informado; no hay garantia de cobertura multilingue.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con requisitos de contexto largo.
- Licencia: apache-2.0, permisiva para uso comercial; debe verificarse tambien la licencia del modelo base y de los componentes derivados.
- Procedencia: repositorio de pruebas (`nm-testing`) con 0 descargas y 0 likes en el momento de la consulta; no es una publicacion oficial de Qwen.
- Discrepancia de parametros: la ficha del base indica "27B" mientras que los tensores declarados suman ~23,5 B; conviene verificar la configuracion real antes de dimensionar infraestructura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nm-testing/Qwen3.8-27B-MXFP6A8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint de referencia de layout: https://huggingface.co/gaunernst/Qwen3.8-27B-MXFP6
- Repositorio compressed-tensors: https://github.com/vllm-project/compressed-tensors
- Los resultados de la busqueda web no contienen informacion relevante sobre el modelo (devuelven paginas sobre el nanometro como unidad de longitud y sobre el newton metro); por tanto, no se aportan enlaces adicionales.
