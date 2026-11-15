# gagni/lfm3-1.7b-eagle-gptq-loco

## Resumen

`gagni/lfm3-1.7b-eagle-gptq-loco` es un empaquetado derivado de LiquidAI/LFM3-1.7B, el modelo de lenguaje compacto de 1.700 millones de parametros desarrollado por Liquid AI. El autor (gagni) lo ha adaptado para el motor de inferencia en CPU LOCO, aplicando una cuantizacion int4 calibrada mediante GPTQ sobre el tronco del transformer, una cabeza en int8 y un drafter EAGLE-3 entrenado para decodificacion especulativa. El resultado es una distribucion de pesos optimizada para ejecucion en CPU con aceleracion de decodificacion sin alterar la distribucion de salida del modelo original, ya que los borradores del drafter se verifican contra el modelo principal.

El problema que resuelve es doble: por un lado, reducir el coste de memoria y computo de un modelo de 1,7B para que quepa y corra con velocidad razonable en CPU (el empaquetado ocupa 2,9 GB en el repositorio); por otro, acelerar la decodificacion autoregresiva mediante decodificacion especulativa con un drafter EAGLE-3, que propone varios tokens por paso y el modelo principal los valida. Frente al empaquetado previo con cuantizacion round-to-nearest (`gagni/lfm3-1.7b-eagle-loco`), la version GPTQ recupera entre el 31 % y el 70 % de la perdida de calidad introducida por el int4, manteniendo la misma velocidad.

Es relevante ahora porque demuestra un flujo completo de despliegue de un modelo Liquid AI en hardware sin GPU, con cuantizacion calibrada y decodificacion especulativa integradas en un motor (LOCO) que expone una API compatible con OpenAI. Esta pensado para entornos de desarrollo, prototipado y despliegue ligero donde no hay acelerador dedicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-1.7B; el empaquetado aplica GPTQ int4 sobre el tronco, int8 en la cabeza y anade un bloque drafter EAGLE-3) |
| Parametros totales | no disponible (modelo base de 1,7B; el repositorio anade un drafter entrenado cuyo tamano no se detalla) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 GPTQ (tronco), int8 (cabeza); calibrado sobre 256 ventanas de 1.024 tokens |
| Idiomas soportados | en, fr (calibrado y medido solo en estos dos) |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial limitado a entidades por debajo del umbral de ingresos de la licencia |
| Formato de pesos | safetensors propietario del motor LOCO (`loco-*.safetensors`, `loco_config.json`, `packed.json`, `gptq_pack.json`) |

## Arquitectura y entrenamiento

El modelo base es LFM3-1.7B de Liquid AI, un transformer de 1,7B parametros. Sobre el, este repositorio aplica una cuantizacion GPTQ del tronco a int4, calibrada con 256 ventanas de 1.024 tokens compuestas de respuestas de instruccion en ingles y frances. La cabeza de salida se mantiene en int8 y los embeddings, las normas y el drafter son identicos bit a bit al empaquetado round-to-nearest previo del mismo autor. El repositorio incluye ademas `gptq_pack.json`, que documenta la calibracion y el error de GPTQ frente a round-to-nearest por tipo de capa.

La innovacion principal es la integracion de un drafter EAGLE-3 entrenado para decodificacion especulativa. El drafter propone cadenas de tokens (chain 3 en las mediciones) que el modelo principal verifica, de modo que la distribucion de salida no cambia respecto al modelo original. Segun la model card, el drafter conserva el 65 % de sus borradores tanto en ingles como en frances. No se detalla en la informacion disponible el numero de tokens de entrenamiento del modelo base ni si hubo RLHF o DPO en su entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles y frances, con plantilla de chat propia (`chat_template.jinja`).
- Modo de razonamiento (thinking) activado por defecto, expuesto en el campo `reasoning_content`; se puede desactivar con `"chat_template_kwargs": {"enable_thinking": false}`.
- Decodificacion especulativa integrada con drafter EAGLE-3, activada automaticamente por el motor LOCO.
- Servicio de API compatible con OpenAI (`loco serve`), lo que habilita integracion con clientes y frameworks que hablan ese protocolo.
- Ejecucion en CPU sin GPU dedicada mediante el motor LOCO.
- No se documentan en la informacion disponible capacidades de tool calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Prototipado de asistentes conversacionales en local: el modelo corre en CPU con el binario `loco run`, lo que permite probar flujos de chat multi-turno sin infraestructura GPU y con modo de razonamiento activable.
- Servicio de API interno ligero: `loco serve` levanta una API compatible con OpenAI en `http://127.0.0.1:8000/v1`, util para conectar herramientas existentes (clientes OpenAI, LangChain u otros) a un modelo local sin reescribir integraciones.
- Despliegue en equipos de desarrollo sin acelerador: con 2,9 GB de repositorio y cuantizacion int4, el modelo es viable en portatiles y estaciones de trabajo con CPU moderna, reduciendo la dependencia de GPUs.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye metricas de perdida held-out frente a bf16 y round-to-nearest, lo que lo hace util como referencia para estudiar el impacto de GPTQ en modelos pequenos.
- Investigacion sobre decodificacion especulativa: el drafter EAGLE-3 y las tasas de aceptacion de borradores (65 % en ambos idiomas) sirven como caso de estudio reproducible para medir la ganancia de esta tecnica en CPU.
- Procesamiento de texto en ingles y frances en entornos con requisitos de licencia claros: equipos por debajo del umbral de ingresos de la LFM Open License v1.0 pueden usar el modelo comercialmente para tareas de generacion y resumen.
- Educacion y demos offline: al no requerir GPU ni descargas de gran volumen, es adecuado para talleres y demostraciones en aulas o entornos con conectividad limitada.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). Publica, en cambio, perdida held-out de siguiente token (nats por token, menor es mejor) y velocidad de decodificacion.

| Pesos | Respuestas propias de LFM3 | Respuestas en ingles | Respuestas en frances |
|---|---|---|---|
| bf16 (original) | 0.596 | 1.484 | 1.358 |
| int4 round-to-nearest (`gagni/lfm3-1.7b-eagle-loco`) | 0.719 | 1.592 | 1.465 |
| int4 GPTQ (este repositorio) | 0.681 | 1.516 | 1.401 |

Velocidad medida (muestreo con temperature 1, top_k 20, top_p 0.95; ids por segundo), en un CCD de un AMD EPYC con 6 nucleos y drafter con chain 3:

| Idioma | GPTQ (este repositorio) | Round-to-nearest |
|---|---|---|
| Ingles | 79,7 ids/s | 81,4 ids/s |
| Frances | 78,9 ids/s | 78,4 ids/s |

Segun el autor, la velocidad es la misma dentro del ruido de medicion y el drafter conserva el 65 % de sus borradores en ambos idiomas. Medicion realizada con el motor LOCO el 2026-11-15.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en GPU; el empaquetado esta disenado para ejecucion en CPU con el motor LOCO.
- Tamano en disco del repositorio: 2,9 GB.
- CPU: las mediciones se hicieron en un CCD de AMD EPYC con 6 nucleos; no se especifican requisitos minimos de nucleos ni de memoria RAM.
- GPU recomendadas: no disponible; no se documenta soporte GPU para este formato.
- Cabe en consumer GPU: no disponible; el formato `loco-*.safetensors` es especifico del motor LOCO y no se indica compatibilidad con CUDA.
- Opciones de despliegue: motor LOCO en CPU (`loco run` para chat en terminal, `loco serve` para API compatible con OpenAI). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 78,9 a 79,7 ids/s en la configuracion medida (6 nucleos de EPYC, chain 3), con decodificacion especulativa activa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| `gagni/lfm3-1.7b-eagle-gptq-loco` | 1,7B (base) + drafter | no disponible | int4 GPTQ + int8 cabeza | LFM Open License v1.0 | LOCO en CPU |
| `gagni/lfm3-1.7b-eagle-loco` | 1,7B (base) + drafter | no disponible | int4 round-to-nearest + int8 cabeza | LFM Open License v1.0 | LOCO en CPU |
| LiquidAI/LFM3-1.7B | 1,7B | no disponible | bf16 (original) | LFM Open License v1.0 | no disponible en la informacion proporcionada |

La comparacion directa disponible se limita al empaquetado previo del mismo autor y al modelo base: el empaquetado GPTQ mejora la perdida held-out frente al round-to-nearest (0,681 frente a 0,719 nats/token en respuestas propias de LFM3) con velocidad equivalente. No se dispone de datos para comparar con modelos de otros desarrolladores de tamano similar.

## Limitaciones y advertencias

- La calibracion y las mediciones se hicieron solo en ingles y frances; otros idiomas y codigo largo no fueron medidos, por lo que su calidad en esos dominios es incierta.
- Sigue siendo int4: aproximadamente 0,03 a 0,09 nats por token por encima del modelo bf16, lo que implica cierta perdida de calidad frente al original.
- Riesgo de alucinacion inherente a un modelo de 1,7B; no se documentan mitigaciones especificas.
- La licencia LFM Open License v1.0 limita el uso comercial a entidades por debajo de un umbral de ingresos; es necesario revisar el texto de la licencia antes de un despliegue en produccion.
- El formato de pesos es propietario del motor LOCO; no hay evidencia en la informacion disponible de que funcione con vLLM, llama.cpp, Ollama o TGI, lo que limita la portabilidad.
- El drafter anade un bloque entrenado cuyos datos de entrenamiento no se detallan en la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad sobre su comportamiento en produccion.
- No se documentan sesgos conocidos ni resultados de benchmarks estandar; la evaluacion de calidad se limita a la perdida held-out publicada por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gagni/lfm3-1.7b-eagle-gptq-loco
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Empaquetado round-to-nearest del mismo autor: https://huggingface.co/gagni/lfm3-1.7b-eagle-loco
- Licencia (LFM Open License v1.0): https://huggingface.co/gagni/lfm3-1.7b-eagle-gptq-loco/blob/main/LICENSE
