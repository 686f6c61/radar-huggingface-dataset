# manishkumar2101114/qwen3.5-9b-tool-merged-end_call-v2

## Resumen

El modelo `manishkumar2101114/qwen3.5-9b-tool-merged-end_call-v2` es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario manishkumar2101114 y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo multimodal de tipo image-text-to-text con 9.653.104.368 parámetros totales, orientado específicamente a su uso como agente de voz con capacidad de tool calling (llamada a herramientas) y gestión de fin de llamada (`end_call`), en un contexto bilingüe inglés-hindi/hinglish.

La relevancia de este modelo radica en su especialización: parte de un modelo base de propósito general de la familia Qwen 3.5 y lo adapta mediante LoRA (r=32, alpha=64, 3 épocas, 666 pasos, con una pérdida de entrenamiento de 0.2186 y de evaluación de 0.1686) para tareas conversacionales de agente de voz, incluyendo la detección de fin de conversación y la invocación de herramientas. Esto lo hace interesante para desarrolladores que construyen asistentes telefónicos o agentes conversacionales en entornos multilingües con presencia de hindi e hinglish.

No obstante, la información pública disponible es muy limitada: la model card es extremadamente escueta y no detalla la composición del dataset de entrenamiento, los benchmarks ni las capacidades completas del modelo. El repositorio tiene un tamaño de 19.3 GB y registra 25 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen/Qwen3.5-9B; no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, hi (ingles e hindi, con presencia de hinglish segun tags) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-9B, un modelo base multimodal de la familia Qwen 3.5 con aproximadamente 9.650 millones de parametros. El ajuste se realizo mediante LoRA con rango 32 y alpha 64, durante 3 epocas y 666 pasos de entrenamiento, alcanzando una perdida de entrenamiento de 0.2186 y una perdida de evaluacion de 0.1686. Los pesos resultantes se fusionaron (merged) con el modelo base, de ahi el sufijo "merged" en el nombre.

La especializacion del ajuste se orienta a dos capacidades concretas: el tool calling (invocacion de funciones o herramientas) y la deteccion de fin de llamada (`end_call`), en el contexto de un agente de voz. La version v2 se presenta explicitamente como una correccion ("tool-call fix") respecto a una version anterior. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas adicionales mas alla del propio ajuste LoRA.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles e hindi/hinglish.
- Tool calling / function calling, con especial enfasis en la invocacion correcta de herramientas (corregido en esta v2).
- Deteccion de fin de llamada (`end_call`), orientada a agentes de voz que deben cerrar la conversacion de forma autonoma.
- Procesamiento de entrada imagen-texto (pipeline image-text-to-text), heredado del modelo base Qwen3.5-9B.
- Capacidades multilingues limitadas a ingles e hindi (con hinglish).
- No se documentan capacidades de razonamiento extendido, modo thinking, audio u otras funciones especiales en la informacion disponible.

## Casos de uso

- Agentes de voz para atencion telefonica: el modelo puede gestionar conversaciones multi-turno y decidir cuando finalizar la llamada mediante la funcionalidad `end_call`, lo que resulta adecuado para sistemas de call center automatizados.
- Asistentes conversacionales bilingues ingles-hindi: util para mercados de la India o comunidades de diaspora donde se alterna entre ingles, hindi e hinglish en la misma conversacion.
- Invocacion de herramientas en flujos de soporte: el modelo puede llamar a funciones externas (consultas de estado de pedido, reservas, etc.) integradas en un pipeline de agente, gracias a su especializacion en tool calling.
- Sistemas de reserva o agendamiento por voz: la combinacion de tool calling y deteccion de fin de llamada permite cerrar transacciones conversacionales de forma autonoma.
- Prototipado rapido de agentes conversacionales: al estar bajo licencia Apache 2.0 y con pesos en safetensors, puede desplegarse en infraestructura propia para experimentacion.
- Analisis de imagenes en contexto conversacional: al heredar el pipeline image-text-to-text, podria emplearse en escenarios donde el usuario comparte una imagen y el agente debe interpretarla dentro de un flujo de soporte.
- Evaluacion de tecnicas de ajuste LoRA para tool calling: sirve como referencia para investigadores que estudian la fusion de adaptadores y la correccion de comportamientos de llamada a herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.653 millones de parametros, en precision completa (fp16/bf16) se requieren aproximadamente 19-20 GB de VRAM solo para los pesos; el repositorio ocupa 19.3 GB.
- En cuantizacion de 8 bits, la VRAM estimada ronda los 10-11 GB; en 4 bits, aproximadamente 6-7 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: A100 (40/80 GB) o H100 para inferencia en fp16 sin cuantizar; RTX 4090 (24 GB) puede alojar el modelo en fp16 de forma ajustada, y GPUs consumer con 8-12 GB podrian alojarlo solo con cuantizacion agresiva.
- Cabe en GPU consumer como RTX 4090 en fp16, y en RTX 3090/4080 con cuantizacion.
- Opciones de despliegue: al ser un modelo safetensors sin variantes GGUF publicadas, el despliegue mas directo seria mediante vLLM, TGI o transformers; llama.cpp/Ollama requeririan conversion manual a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-9b-tool-merged-end_call-v2 | 9.653 M | no disponible | apache-2.0 | Tool calling + end_call, voz, en/hi | Hugging Face (25 descargas) |
| Qwen/Qwen3.5-9B (base) | ~9.650 M | no disponible | no disponible en la informacion | Proposito general multimodal | Hugging Face |
| Alternativas de tool calling de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este ajuste y el modelo base ni con otras alternativas, por lo que la comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- La model card es extremadamente escueta: no documenta dataset de entrenamiento, benchmarks, contexto maximo ni limitaciones conocidas.
- El ajuste esta especializado en un dominio muy concreto (agente de voz con tool calling y `end_call`), lo que puede degradar capacidades generales del modelo base fuera de ese ambito.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad.
- Cobertura linguistica limitada a ingles e hindi/hinglish; el rendimiento en castellano no esta documentado ni garantizado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; se recomienda validar el comportamiento en produccion.
- No hay variantes cuantizadas oficiales publicadas (GGUF, AWQ, GPTQ), lo que complica el despliegue en hardware limitado.
- El modelo tiene un numero muy bajo de descargas (25) y cero likes, lo que sugiere escasa validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-10-28) resulta anomala y podria reflejar un error en los metadatos del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/manishkumar2101114/qwen3.5-9b-tool-merged-end_call-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
