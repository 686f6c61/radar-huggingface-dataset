# BH-Language-AI/bh-llm-basic-1-32b

## Resumen

BH-LLM-Basic-1-32B es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen2.5-32B-Instruct, desarrollado por BH-Language-AI con el objetivo de mejorar el rendimiento en bosnio (bs) manteniendo el ingles (en). Se presenta como el miembro mas grande de la coleccion BH-LLM-Basic y esta orientado a chat generico de calidad para agentes de IA y aplicaciones empresariales en ese par de idiomas. El adaptador se entreno sobre 24.987 ejemplos de chat curados (bosnio e ingles, anonimizados), con 2 epocas, secuencia de 1536 tokens y LoRA de rango 32 / alpha 64.

El modelo no modifica la arquitectura subyacente: hereda el transformer decoder-only de Qwen2.5-32B-Instruct con 32.000 millones de parametros y una ventana de contexto de 32.768 tokens (segun la ficha del modelo base). El repositorio publicado pesa aproximadamente 1,1 GB, lo que corresponde unicamente a los pesos del adaptador, no al modelo completo. El paquete incluye ademas una imagen de logo (bh-llm-basic-1-32b.jpg).

La relevancia actual del modelo es limitada y muy especifica: cubre un nicho linguistico (bosnio) poco atendido por los modelos genericos y ofrece una licencia Apache-2.0 sin restricciones de uso comercial. Su evaluacion, sin embargo, se basa en conjuntos internos muy pequenos (43, 30 y 101 ejemplos) que no son benchmarks publicos, por lo que sus cifras no son comparables con las de modelos evaluados en MMLU, HumanEval u otros estandares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-32B-Instruct) + adaptador LoRA |
| Parametros totales | 32.000 millones (modelo base); el adaptador LoRA se publica aparte (repo de ~1,1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-32B-Instruct; no se especifica en la model card del adaptador) |
| Tipos de cuantizacion | Base entrenada en 4-bit NF4 (QLoRA); para despliegue se recomienda fusionar en bf16. No se listan cuantizaciones GGUF/AWQ/GPTQ publicadas |
| Idiomas soportados | Bosnio (bs) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `unsloth/Qwen2.5-32B-Instruct-bnb-4bit` (base cuantizada a 4 bits, ~19,2 GB) aplicando QLoRA con rango 32, alpha 64, dropout 0,05 y adaptadores en todas las capas lineales. El entrenamiento se ejecuto en 2 GPU NVIDIA L40S, con secuencia de 1536 tokens y packing, batch global de 16, tasa de aprendizaje 1e-4 y 2 epocas. La perdida descendio de 1,87 a 0,81 durante el entrenamiento.

El conjunto de datos consta de 24.987 ejemplos de chat generico curados en bosnio e ingles, anonimizados y sin datos internos de la empresa. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion de seguridad; el autor indica explicitamente que no es un modelo safety-aligned. No se mencionan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) mas alla del propio ajuste LoRA.

## Capacidades

- Generacion de texto conversacional en bosnio e ingles, con enfasis en calidad de chat generico.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen2.5-32B-Instruct.
- Generacion de codigo y matematicas (capacidad heredada del base; no evaluada en la model card).
- Soporte multilingue limitado a bs y en segun la model card; el base soporta mas idiomas, pero el adaptador solo se entreno en esos dos.
- Tool calling / function calling: no documentado en la model card del adaptador (el base Qwen2.5-Instruct lo soporta).
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente para el adaptador.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Atencion al cliente en bosnio: el adaptador mejora la calidad de respuesta en bosnio sobre el base, lo que permite desplegar un asistente conversacional multi-turno para usuarios de Bosnia y Herzegovina, aprovechando la ventana de 32.768 tokens del base para historiales largos.
- Agentes de IA para empresas locales: el autor lo orienta explicitamente a agentes y aplicaciones de negocio; puede integrarse como capa de generacion en flujos con tool calling heredado del base Qwen2.5-Instruct.
- Traduccion y asistencia bilingue bs/en: util para redactar, resumir o reformular contenido entre bosnio e ingles en entornos corporativos.
- Generacion de codigo en produccion: al heredar las capacidades del base, puede integrarse en pipelines de CI/CD para autocompletado o revision de codigo, aunque no se han publicado evaluaciones especificas del adaptador en esta tarea.
- Chatbot de soporte interno: con la recomendacion de fusionar el adaptador en bf16 antes del despliegue, puede servirse con vLLM o TGI para atender consultas internas en bosnio.
- Prototipado rapido en investigacion linguistica: el adaptador es ligero (~1,1 GB) y permite experimentar con ajuste de dominio en bosnio sin reentrenar el modelo completo.
- Despliegue en infraestructura con GPU de 48 GB: al fusionarse en bf16, el modelo de 32B requiere al menos 2 GPU L40S o A100 de 40/80 GB, lo que encaja en entornos empresariales con ese hardware.

## Benchmarks y rendimiento

Los unicos datos disponibles son evaluaciones internas con decodificacion greedy sobre conjuntos pequenos y no publicos (43, 30 y 101 ejemplos). No son comparables con benchmarks publicos.

| Modelo | Bosnio (43) | Ingles (30) | Golden interno (101) |
|---|---|---|---|
| Qwen2.5-32B-Instruct (base) | no disponible | no disponible | no disponible |
| BH-LLM-Basic-1-32B (adaptador) | 40/43 (93,0%) | 29/30 (96,7%) | 87/101 (86,1%) |

No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks publicos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador solo ocupa ~1,1 GB, pero requiere cargar el base Qwen2.5-32B-Instruct. En 4-bit NF4 el base ocupa ~19,2 GB; en bf16 completo, ~64 GB.
- GPU recomendadas: 2x NVIDIA L40S (48 GB cada una) es la configuracion usada en entrenamiento; para inferencia en bf16 se recomiendan A100 80 GB o H100. En 4-bit puede caber en una unica GPU de 24 GB con cuantizacion agresiva, aunque con perdida de calidad.
- GPU de consumo: no cabe en GPUs consumer de 24 GB en bf16; en 4-bit podria intentarse en una RTX 4090 (24 GB) con cuantizacion, pero el autor recomienda fusionar en bf16 para maxima calidad, lo que descarta GPUs consumer.
- Opciones de despliegue: transformers + PEFT (segun el ejemplo de la model card), vLLM, TGI y llama.cpp tras fusionar y convertir a GGUF (no se proporcionan artefactos GGUF publicados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Evaluacion |
|---|---|---|---|---|---|
| BH-LLM-Basic-1-32B | 32B (adaptador LoRA sobre Qwen2.5-32B-Instruct) | 32.768 | bs, en | Apache-2.0 | Interna (43/30/101), no publica |
| Qwen2.5-32B-Instruct | 32B | 32.768 | multilingue (incluye en) | Apache-2.0 | Benchmarks publicos extensos |
| Otros adaptadores bosnios | no disponible | no disponible | bs | no disponible | no disponible |

La comparacion directa con el base Qwen2.5-32B-Instruct no es posible con los datos aportados, ya que la model card deja la fila del base vacia ("—") en la tabla de benchmarks. No se identifican en la informacion proporcionada otros adaptadores bosnios comparables.

## Limitaciones y advertencias

- El adaptador se entreno sobre una base cuantizada a 4 bits; para obtener la mejor calidad en despliegue es necesario fusionarlo en la base bf16.
- La evaluacion se realizo sobre conjuntos internos muy pequenos (43, 30 y 101 ejemplos) y no sobre benchmarks publicos; las cifras no deben compararse con tablas publicas de otros modelos.
- No es un modelo safety-aligned: el autor recomienda anadir barreras de seguridad propias antes de usarlo en produccion.
- Solo se entreno en bosnio e ingles; el rendimiento en otros idiomas no esta garantizado aunque el base los soporte.
- Riesgo de alucinacion inherente a los modelos de 32B sin alineacion especifica; no se documentan mitigaciones.
- Sesgos conocidos: no documentados en la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantias sobre el rendimiento en dominios distintos al chat generico.

## Enlaces

- Hugging Face: https://huggingface.co/BH-Language-AI/bh-llm-basic-1-32b
- Coleccion BH-LLM-Basic: https://huggingface.co/collections/BH-Language-AI/bh-llm-basic
- Modelo base Qwen2.5-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Base cuantizada usada en entrenamiento: https://huggingface.co/unsloth/Qwen2.5-32B-Instruct-bnb-4bit
