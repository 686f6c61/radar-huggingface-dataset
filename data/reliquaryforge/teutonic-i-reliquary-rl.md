# ReliquaryForge/Teutonic-I-Reliquary-RL

## Resumen

Teutonic-I Reliquary RL es un modelo de generacion de texto de 8.953.803.264 parametros (aproximadamente 9B) publicado por ReliquaryForge. Se trata del checkpoint vivo mas reciente del entrenamiento por refuerzo asincrono `teutonic-rl-async-v1`, ejecutado sobre la subred 81 (Reliquary) de Bittensor. El modelo parte del checkpoint SFT `ReliquaryForge/Teutonic-I-Reliquary-SFT` (revision `18dfb97d`) y se entrena con rollouts generados y verificados por los mineros de la subred.

La arquitectura declarada en los tags de Hugging Face es `qwen3_5_text`, lo que lo situa en la familia Qwen 3.5 en su variante exclusivamente de texto. El repositorio es un espejo automatico: cada vez que el validador publica una nueva version del checkpoint, esta se reconstruye (anchor mas deltas desde R2), se verifica contra un indice firmado y se publica aqui. La version actual es la 157, con fecha de indexado del 2 de noviembre de 2026.

Su relevancia es doble. Por un lado, es un ejemplo operativo de entrenamiento por refuerzo descentralizado con verificacion criptografica de pesos. Por otro, ofrece a la comunidad un modelo de ~9B listo para inferencia con `transformers`, licencia Apache-2.0 y pesos en safetensors, sin necesidad de token de acceso. La model card no documenta contexto, idiomas ni datos de entrenamiento mas alla de lo indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tag `qwen3_5_text`, familia Qwen 3.5, solo texto) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors en `transformers` admite cuantizacion posterior (GPTQ, AWQ, bitsandbytes, GGUF) mediante herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 17,9 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de ~9B parametros, identificado por el tag `qwen3_5_text` como perteneciente a la familia Qwen 3.5 en variante solo texto. No se documentan en la model card detalles sobre numero de capas, dimensiones ocultas, mecanismo de atencion ni longitud de contexto nativa; estos datos habria que inferirlos de la configuracion del repositorio o del modelo base de la familia.

El entrenamiento consta de dos fases. Primero un ajuste supervisado (SFT) que produce `ReliquaryForge/Teutonic-I-Reliquary-SFT`, y despues un entrenamiento por refuerzo asincrono (`teutonic-rl-async-v1`) sobre la subred 81 de Bittensor. En esta fase, los mineros de la subred generan rollouts que el validador verifica, y el checkpoint resultante se publica con un indice firmado: el payload del indice tiene sha256 `ccbe60de...` y el digest de tensores Reliquary es `595512c5...`. La integridad se puede comprobar con las utilidades `reliquary.shared.ckpt_delta.checkpoint_sha256` y `reliquary.shared.ckpt_index.verify_index_signature`. No se especifican volumen de tokens, composicion del dataset ni tecnicas de RLHF/DPO mas alla de la naturaleza RL del proceso.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational` y la pipeline `text-generation`.
- Razonamiento y generacion de codigo: capacidad esperable por herencia de la familia Qwen 3.5, aunque no se documenta explicitamente en la model card.
- Entrenamiento orientado por refuerzo con verificacion de rollouts por parte de la subred, lo que en teoria favorece respuestas alineadas con los criterios del validador.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en Inference Endpoints de Hugging Face.
- Soporte de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los idiomas no estan declarados.
- Vision o audio: no, el tag indica `qwen3_5_text` (solo texto).

## Casos de uso

- Experimentacion con RL descentralizado: el modelo sirve como referencia para estudiar como evoluciona un checkpoint a lo largo de las versiones (157 en el momento de la ficha) y comparar el efecto del entrenamiento por refuerzo frente al checkpoint SFT de partida.
- Despliegue en inference endpoints: al estar marcado como `endpoints_compatible` y usar `transformers` con safetensors, se puede servir directamente en Hugging Face Inference Endpoints o en un servidor propio con vLLM o TGI para generacion de texto a escala moderada.
- Generacion de texto conversacional en aplicaciones internas: con ~9B parametros y licencia Apache-2.0, es viable integrarlo en chatbots o asistentes de dominio acotado sin coste de licencia.
- Base para fine-tuning adicional: al ser un modelo de 9B con pesos abiertos, se puede reentrenar con LoRA o QLoRA sobre datos propios para tareas especificas, partiendo de un checkpoint ya alineado por RL.
- Investigacion en verificacion de pesos: el esquema de indice firmado y digest de tensores permite auditar la cadena de custodia del modelo, util en entornos donde la procedencia de los pesos es critica.
- Nodo minero de la subred 81: los mineros pueden descargar los pesos con `huggingface-cli download ReliquaryForge/Teutonic-I-Reliquary-RL` sin token para participar en la generacion de rollouts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion 8 bits: en torno a 9-10 GB de pesos, con margen para cache; viable en GPUs de 16 GB.
- VRAM estimada en cuantizacion 4 bits: en torno a 5-6 GB de pesos; viable en GPUs de 8-12 GB, con perdida de calidad no cuantificada.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) para FP16 en una sola GPU; RTX 3090 o 4080 para cuantizacion 8 bits; RTX 4060 Ti 16 GB o similar para 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 en BF16 y en GPUs de 12-16 GB con cuantizacion.
- Opciones de despliegue: `transformers` (nativo), vLLM, TGI, llama.cpp y Ollama previa conversion a GGUF; tambien Inference Endpoints por el tag `endpoints_compatible`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Teutonic-I Reliquary RL | ~8,95B | no disponible | Apache-2.0 | Hugging Face, safetensors | Checkpoint RL vivo, version 157, base Qwen 3.5 text |
| Qwen 3.5 (variante text de ~9B) | ~9B (segun familia) | no disponible | segun variante | Hugging Face | Modelo base de la familia; referencia natural |
| Teutonic-I Reliquary SFT | ~8,95B | no disponible | Apache-2.0 | Hugging Face | Checkpoint SFT previo al RL; permite comparar el efecto del RL |

La comparacion con modelos de otras familias (Llama, Mistral, Gemma) no se puede completar con datos verificables a partir de la informacion proporcionada, ya que no se publican benchmarks ni contexto del modelo.

## Limitaciones y advertencias

- No se documentan sesgos conocidos; al entrenarse con RL sobre rollouts de una subred, los criterios de recompensa pueden introducir sesgos propios de la comunidad que opera el validador.
- Riesgo de alucinacion no cuantificado: no hay benchmarks ni evaluaciones publicadas que permitan estimarlo.
- Longitud de contexto e idiomas no declarados; no se debe asumir un contexto largo ni un multilingueismo amplio sin verificarlo en la configuracion del repositorio.
- El repositorio solo conserva el ultimo checkpoint: el historial se aplana en un unico commit en `main` etiquetado `ckpt-157`, por lo que no se pueden recuperar versiones anteriores desde este espejo.
- La licencia Apache-2.0 permite uso comercial, pero el modelo hereda las condiciones del modelo base de la familia Qwen 3.5; conviene revisar la licencia de dicha familia antes de un despliegue comercial.
- Es un checkpoint vivo que cambia con cada version; para produccion conviene fijar una revision concreta y verificar el sha256 del indice firmado.
- La integridad de los pesos depende de la verificacion contra el indice firmado y el hotkey del validador (`5H47sFL6bGi3xPLzKpHxFqjBnmRZkQh4gk5jzkCeNXn4wdDa`); sin esa comprobacion no hay garantia de procedencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ReliquaryForge/Teutonic-I-Reliquary-RL
- Modelo base SFT: https://huggingface.co/ReliquaryForge/Teutonic-I-Reliquary-SFT
- Documentacion de Bittensor: https://docs.bittensor.com
- Repositorio de utilidades Reliquary (`reliquary.shared.ckpt_delta`, `reliquary.shared.ckpt_index`): no disponible en la informacion proporcionada
- Paper, blog o demo oficiales: no disponibles en la informacion proporcionada
