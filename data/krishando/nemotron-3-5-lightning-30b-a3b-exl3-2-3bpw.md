# Krishando/Nemotron-3.5-Lightning-30B-A3B-EXL3-2.3bpw

## Resumen

Krishando/Nemotron-3.5-Lightning-30B-A3B-EXL3-2.3bpw es una cuantizacion no oficial del modelo NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 de NVIDIA, publicada por el usuario Krishando. Se trata de una version comprimida con el formato EXL3 (ExLlamaV3) que reduce los pesos de los expertos enrutados a una media de 2,31 bits por matriz, permitiendo que un modelo de arquitectura MoE con 30B parametros totales y 3B activos quepa integramente en la VRAM de una unica GPU de 16 GB.

La relevancia de esta ficha radica en que demuestra que es posible servir modelos MoE de gran tamano en hardware de consumo mediante cuantizacion agresiva combinada con un motor de inferencia especializado (TensorFold). El autor reporta 16 streams concurrentes de hasta 64k tokens cada uno y velocidades de hasta 1.040 tok/s agregados en una RTX 5070 Ti, ademas de conservar la cabeza MTP (Multi-Token Prediction) del modelo original como drafter para decodificacion especulativa.

Es importante subir que este checkpoint no es compatible con ExLlamaV3, vLLM ni llama.cpp: solo lo lee el motor nativo TensorFold, lo que limita su portabilidad. La licencia es OpenMDW-1.1, heredada del modelo base de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron H (hibrida: atencion + Mamba + MoE), con cabeza MTP |
| Parametros totales | 2.203.132.224 (segun safetensors del repo cuantizado); el modelo base se denomina 30B-A3B |
| Parametros activos | 3B (denominacion A3B del modelo base; no verificado en el checkpoint cuantizado) |
| Longitud de contexto | hasta 64k tokens por stream (segun model card del cuantizador) |
| Tipos de cuantizacion | EXL3 2-3,5 bits (expertos enrutados, media 2,31 bits); 4-bit affine con grupos de 64 (atencion, Mamba, expertos compartidos, router, embeddings, head); MTP head en EXL3 3,5 bits y 4-bit affine |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (EXL3 + affine 4-bit), exclusivo del motor TensorFold |

## Arquitectura y entrenamiento

El modelo base NVIDIA-Nemotron-3.5-Lightning-30B-A3B emplea la arquitectura Nemotron H, una hibrida que combina capas de atencion con capas Mamba y mezcla de expertos (MoE). El checkpoint aqui descrito es una cuantizacion, no un reentrenamiento: no se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, composicion ni si se aplicaron tecnicas de RLHF o DPO en el modelo original.

La innovacion tecnica de esta publicacion es doble. Por un lado, la cuantizacion EXL3 asigna entre 2 y 3,5 bits por matriz a las 5.980 matrices de expertos enrutados (media de 2,31 bits, 8,35 GiB) y mantiene en 4-bit affine los componentes sensibles (atencion, Mamba, router, embeddings y head, 1,25 GB). Por otro, se conserva la cabeza MTP del modelo original (260 matrices de expertos en EXL3 a 3,5 bits y una parte no-experta en 4-bit affine, 0,75 GB) y se utiliza como drafter para decodificacion especulativa. El autor afirma que el drafting MTP no altera la salida: las respuestas greedy y con semilla a T=1 son identicas bit a bit con y sin drafts.

## Capacidades

- Generacion de texto conversacional y de proposito general (pipeline text-generation).
- Razonamiento con modo "thinking" activado (asi se midieron todos los benchmarks del autor).
- Escritura de codigo, incluidos kernels CUDA/Triton (evaluado en la model card).
- Llamadas a herramientas (tool calling): se validaron 550 llamadas bien formadas, sin peor resultado que BF16.
- Uso agente multi-paso: probado con un enjambre de 16 agentes con herramientas durante 10 minutos, 681 turnos y 0 fallos.
- Servicio concurrente: 16 streams simultaneos de hasta 64k tokens cada uno.
- Decodificacion especulativa mediante la cabeza MTP integrada.
- Capacidades multilingues: no disponible.
- Vision y audio: no disponible (el modelo base es text-generation).

## Casos de uso

- Servicio de chat multi-usuario en una sola GPU de 16 GB: el checkpoint permite mantener 16 conversaciones concurrentes de hasta 64k tokens con un throughput agregado de 1.040 tok/s, adecuado para prototipos o despliegues de pequena escala en hardware de consumo.
- Enjambres de agentes con herramientas: los resultados del autor (16 agentes, 681 turnos, 0 fallos, 443 tok/s) lo hacen viable para orquestaciones de agentes que requieren llamadas a funciones y contexto de sistema de 4k tokens.
- Generacion de codigo asistida: soporta tool calling y escritura de kernels CUDA/Triton; puede integrarse en asistentes de programacion, aunque con la advertencia de mayor tasa de repeticion en respuestas largas (4,2% frente a 2,0% del BF16).
- Procesamiento de documentos largos: la ventana de 64k tokens y el prefill de 4.055 tok/s a 32k permiten resumir o extraer informacion de contratos, informes o bases de codigo extensas.
- Evaluacion e investigacion de cuantizacion: sirve como banco de pruebas para estudiar el impacto de EXL3 a 2,31 bits en modelos MoE, con comparativas directas frente al BF16 original incluidas en la model card.
- Despliegue en estaciones de trabajo con GPU consumer: al caber en 16 GB, permite ejecutar localmente un modelo de clase 30B-A3B sin infraestructura de datacenter, util para desarrollo offline o entornos con requisitos de privacidad.
- Prototipado de pipelines RAG con contexto largo: el prefill rapido (1,1 s para 4k tokens) y la ventana de 64k facilitan iteraciones sobre recuperacion aumentada sin recompilar el motor.

## Benchmarks y rendimiento

Datos medidos por el autor en una RTX 5070 Ti (16 GB) bajo WSL2, los dias 23 y 24 de noviembre de 2026, con thinking activado.

| Prueba | Metrica | Resultado |
|---|---|---|
| 1 stream, T=1 | respuestas de 256 tokens | 392 tok/s |
| 16 streams, T=1 | total en regimen estable | 1.040 tok/s (~65 por stream) |
| Enjambre de 16 agentes | 10 min, 4k system prompt, tareas de 600 tokens, respuestas de 400, resultados de herramienta de 300 | 443 tok/s total, 681 turnos, 0 fallos |
| Enjambre, tiempo al primer token | mediana / percentil 95 | 11,1 s / 14,2 s |
| Prefill, 1 stream | 1k tokens | 1.770 tok/s (0,6 s) |
| Prefill, 1 stream | 4k tokens | 3.830 tok/s (1,1 s) |
| Prefill, 1 stream | 16k tokens | 4.010 tok/s (4,1 s) |
| Prefill, 1 stream | 32k tokens | 4.055 tok/s (7,9 s) |

Calidad frente al BF16 original:

| Prueba | Metrica | Este cuantizado | BF16 |
|---|---|---|---|
| Preguntas de investigacion | respuestas correctas de 600 | 301 | 301 |
| Preguntas de investigacion | bucles y salida malformada | no peor que BF16 | referencia |
| Llamadas a herramientas | llamadas validas de 550 | no peor que BF16 | referencia |
| Escritura de kernels CUDA/Triton (limite 8k) | respuestas con repeticion | 4,2% (50 de 1.200) | 2,0% (12 de 600) |
| Todas las pruebas | salida malformada | 0 | 0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: cabe integramente en una GPU de 16 GB; el repo ocupa 11,6 GB en disco (8,35 GiB de expertos EXL3, 1,25 GB de componentes 4-bit, 0,75 GB de MTP head no-experta).
- GPU recomendadas: RTX 5070 Ti (16 GB) es la plataforma de referencia del autor; cualquier GPU con al menos 16 GB de VRAM deberia poder alojar los pesos, aunque no se han publicado pruebas en otras.
- GPU consumer: si, en tarjetas de 16 GB o mas.
- Opciones de despliegue: exclusivamente el motor nativo TensorFold (rama `nemotron-lightning-5070ti`); no es compatible con ExLlamaV3, vLLM ni llama.cpp.
- Instalacion: receta en el repositorio Kristianaaron/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-TensorFold (`./install.sh && ./start.sh`).
- Latencia y throughput: 392 tok/s en un stream, 1.040 tok/s con 16 streams, 443 tok/s en enjambre de agentes; tiempo al primer token en enjambre de 11,1 s de mediana y 14,2 s en el percentil 95.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Compatibilidad de motores |
|---|---|---|---|---|---|
| Krishando/Nemotron-3.5-Lightning-30B-A3B-EXL3-2.3bpw | 30B-A3B (2,2B en safetensors cuantizado) | 64k por stream | EXL3 2,31 bits + 4-bit affine | OpenMDW-1.1 | Solo TensorFold |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 30B-A3B | no disponible | BF16 | OpenMDW-1.1 | Motores estandar (vLLM, TGI, etc.) |
| Otros cuantizados del mismo base | 30B-A3B | no disponible | no disponible | OpenMDW-1.1 | no disponible |

No se dispone de datos de benchmarks estandar para comparar el rendimiento de calidad frente a alternativas de la misma categoria; la unica comparacion publicada es la del propio autor frente al BF16 original, recogida en la seccion anterior.

## Limitaciones y advertencias

- Compatibilidad restringida: el checkpoint solo lo lee el motor nativo TensorFold; no funciona en ExLlamaV3, vLLM ni llama.cpp, lo que limita su uso en infraestructuras estandar.
- Mayor repeticion en respuestas largas: en la escritura de kernels que agotan el limite de 8k tokens, la tasa de repeticion es del 4,2% frente al 2,0% del BF16, aproximadamente el doble.
- Cuantizacion agresiva: los expertos enrutados estan a una media de 2,31 bits, lo que puede degradar tareas no cubiertas por las pruebas del autor.
- Datos de rendimiento limitados: todas las mediciones provienen de una unica RTX 5070 Ti bajo WSL2; no hay validacion en otras GPU ni en entornos de produccion.
- Idiomas: no se especifica que idiomas soporta el modelo ni el cuantizado.
- Alucinacion: no se han publicado evaluaciones especificas de alucinacion; el autor solo reporta ausencia de salidas malformadas y paridad en preguntas de investigacion.
- Sesgos: no disponible.
- Licencia: OpenMDW-1.1, heredada de NVIDIA; conviene revisar sus terminos antes de un uso comercial, ya que no es una licencia permisiva tipo Apache o MIT.
- Reputacion del publicador: es una cuantizacion no oficial de un tercero (Krishando), con 24 descargas y 0 likes en el momento de la consulta; no cuenta con el respaldo de NVIDIA.
- Modelo base: no se dispone de la model card de NVIDIA en la informacion proporcionada, por lo que las capacidades y limitaciones del modelo original no se pueden verificar aqui.

## Enlaces

- Hugging Face: https://huggingface.co/Krishando/Nemotron-3.5-Lightning-30B-A3B-EXL3-2.3bpw
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Receta de ejecucion: https://github.com/Kristianaaron/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-TensorFold
- Motor TensorFold (rama especifica): https://github.com/Kristianaaron/TensorFold/tree/nemotron-lightning-5070ti
- TensorFold (repositorio principal): https://github.com/ashhart/TensorFold
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
