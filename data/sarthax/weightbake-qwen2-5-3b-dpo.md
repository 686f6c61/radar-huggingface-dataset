# sarthax/WeightBake-Qwen2.5-3B-DPO

## Resumen

WeightBake-Qwen2.5-3B-DPO es un ajuste fino de Qwen/Qwen2.5-3B-Instruct desarrollado por el usuario sarthax (sarthexe) orientado a un caso de uso muy concreto: actuar como enrutador determinista de un gateway de voz empresarial. La idea central es la destilacion de contexto: en lugar de enviar en cada peticion un system prompt de 1.922 tokens que describe el esquema de enrutamiento y las reglas de respuesta, el modelo ha sido entrenado para internalizar ese comportamiento en sus pesos, de modo que en inferencia basta con un trigger de 10 tokens. Esto reduce el coste de prefill y el consumo de KV-cache de forma drastica.

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5-3B-Instruct, con 3.085.938.688 parametros totales y capacidad de contexto heredada del modelo base. Sobre esa base se aplica un pipeline de alineamiento en dos etapas: SFT con QLoRA sobre 800 muestras con el contexto eliminado y posterior DPO con 800 tripletas de preferencia dirigidas a corregir seis modos de fallo tipicos en agentes de voz (bloques markdown, respuestas aduladoras, exceso de longitud, caracteres no aptos para TTS, deriva de esquema y errores de clasificacion de ruta).

Su relevancia practica esta en el ahorro medido: reduccion del 99,48% en tokens de prefill, mejora de cumplimiento estricto del esquema del 81,25% al 97,50% frente a la linea base con prompt inflado, y aceleraciones de TTFT en vLLM de 6,52x a concurrencia 1 y 17,45x a concurrencia 32. Es, por tanto, un ejemplo de optimizacion de latencia en produccion mediante destilacion de contexto mas que un modelo generalista nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivado de Qwen2.5-3B-Instruct |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | Export en bfloat16 (pesos fusionados) y GGUF `q4_k_m`; el entrenamiento uso QLoRA de 4 bits |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 6,2 GB) y GGUF |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del Qwen2.5-3B-Instruct: un transformer decoder-only con atencion de tipo GQA (la model card cita GQA-2 y 36 capas para el calculo de KV-cache), sin modificaciones estructurales. La innovacion no esta en la arquitectura sino en el procedimiento de alineamiento. La etapa 1 es un SFT con QLoRA (rango 16, alpha 32, siete proyecciones lineales) sobre 800 muestras con el system prompt eliminado (760 de entrenamiento, 40 de validacion), usando enmascaramiento de perdida solo en tokens del asistente (-100 en system y user), learning rate 2e-4 y 2 epocas. La etapa 2 es un DPO con objetivo sigmoide de Bradley-Terry (beta 0,1, learning rate 5e-6, 1 epoca) sobre 800 tripletas de preferencia disenadas para penalizar seis modos de fallo concretos: bloques de codigo markdown, respuestas habladas aduladoras, desbordamiento del recuento de palabras, caracteres no seguros para TTS, deriva de esquema y clasificacion de ruta erronea.

El resultado del entrenamiento se exporta como pesos fusionados en 16 bits (bfloat16) para despliegue sin sobrecarga en vLLM, y tambien como GGUF `q4_k_m`. La tecnica de destilacion de contexto es la pieza clave: el comportamiento del prompt largo se comprime en los pesos y el prompt en tiempo de ejecucion queda reducido a la frase "Respond as the deterministic voice router in raw JSON." (10 tokens). Segun la model card, esto reduce el footprint de KV-cache por sesion de 71,93 MiB a 4,71 MiB (factor 15,27x) en configuracion GQA-2, 36 capas y FP16, elevando el maximo de sesiones concurrentes en 8,0 GiB de VRAM de KV de 113 a 1.738.

## Capacidades

- Generacion de texto conversacional en ingles con salida JSON cruda y conforme a un esquema estricto, sin bloques markdown.
- Enrutamiento determinista de intenciones en un gateway de voz: clasificacion de la peticion del usuario en una ruta predefinida.
- Cumplimiento estricto de esquema (strict schema compliance) medido al 100% en el holdout de 80 muestras tras DPO.
- Control de longitud de respuesta hablada: la model card reporta 97,5% de cumplimiento en el rango de 5 a 22 palabras.
- Ausencia de adulacion (zero sycophancy) en el 100% de las muestras del holdout, orientado a respuestas neutras y operativas.
- Generacion apta para TTS: evita caracteres no seguros para sintesis de voz.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido en la informacion proporcionada.
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma del modelo.

## Casos de uso

- Enrutamiento de llamadas en un centro de contacto: el modelo recibe la transcripcion del usuario y devuelve un JSON con la ruta y los parametros extraidos; el trigger de 10 tokens y el TTFT de 24,8 ms a concurrencia 1 lo hacen viable en el bucle de respuesta de un agente de voz.
- Atencion al cliente automatizada con voz: la salida en 5 a 22 palabras y la ausencia de caracteres no aptos para TTS permiten encadenar directamente la respuesta del modelo con un sintetizador sin postprocesado.
- Despliegue de alta concurrencia en vLLM: con 1.738 sesiones concurrentes estimadas en 8,0 GiB de KV-cache, es adecuado para flotas de agentes de voz con cientos de llamadas simultaneas.
- Extraccion de datos estructurados de facturacion y reclamaciones: el ejemplo de la model card (cuenta AC-8841 con cargo duplicado de 499,50) muestra el patron de parseo de entidades y decision de ruta en una sola pasada.
- Sustitucion de prompts de sistema largos en pipelines existentes: cualquier flujo que hoy gaste miles de tokens de prefill en instrucciones fijas puede migrar el comportamiento a los pesos y reducir coste por peticion.
- Prototipado de asistentes de voz de baja latencia en hardware modesto: al ser un modelo de 3B con export GGUF `q4_k_m`, permite iterar en estaciones de trabajo sin GPU de datacenter.
- Evaluacion de tecnicas de destilacion de contexto: sirve como referencia reproducible para equipos que quieran medir el impacto de mover instrucciones de sistema a los pesos frente a mantenerlas en el prompt.

## Benchmarks y rendimiento

Resultados de la model card sobre un holdout de 80 muestras (progresion de alineamiento):

| Etapa | Tokens de sistema | Cumplimiento total | Puntuacion media de checks | JSON valido | Esquema estricto | Zero sycophancy | 5-22 palabras |
|---|---:|---:|---:|---:|---:|---:|---:|
| base_unprompted | 10 | 12,50% | 70,0% | 77,5% | 66,2% | 62,5% | 66,2% |
| base_bloated | 1.922 | 81,25% | 94,1% | 96,2% | 93,8% | 92,5% | 92,5% |
| sft_minimal | 10 | 83,75% | 97,7% | 100,0% | 100,0% | 91,2% | 92,5% |
| dpo_minimal | 10 | 97,50% | 99,6% | 100,0% | 100,0% | 100,0% | 97,5% |

Latencia y throughput en vLLM (TTFT en ms, P50 / P95):

| Concurrencia | Baseline TTFT | WeightBake TTFT | Aceleracion P50 | RPS (base -> WB) |
|---|---:|---:|---:|---:|
| C=1 | 161,8 / 169,4 | 24,8 / 25,7 | 6,52x (-84,66%) | 1,14 -> 1,41 (1,24x) |
| C=8 | 185,7 / 454,4 | 26,8 / 46,1 | 6,93x (-85,57%) | 6,95 -> 10,14 (1,46x) |
| C=16 | 238,8 / 896,3 | 30,1 / 55,9 | 7,93x (-87,39%) | 10,80 -> 18,56 (1,72x) |
| C=32 | 835,6 / 1913,9 | 47,9 / 102,7 | 17,45x (-94,27%) | 11,01 -> 29,21 (2,65x) |

No se han publicado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; las metricas reportadas son especificas de la tarea de enrutamiento de voz.

## Requisitos de hardware

- VRAM de inferencia: aproximadamente 6,2 GB en bfloat16 para los pesos completos; en GGUF `q4_k_m` se reduce a un rango de 2 a 2,5 GB, aunque la cifra exacta no esta publicada.
- KV-cache: 4,71 MiB por sesion en FP16 con GQA-2 y 36 capas; con 8,0 GiB dedicados a KV-cache caben unas 1.738 sesiones concurrentes segun la model card.
- GPU recomendadas: la model card solo valida despliegue en vLLM con bfloat16; no se especifican modelos de GPU concretos. Por tamano, encaja en RTX 4090, L40S, A10G, L4 y A100/H100 para alta concurrencia.
- Cabe en GPU de consumo: si, un modelo de 3B en bfloat16 ocupa unos 6,2 GB de pesos, por lo que es viable en tarjetas con 8 GB o mas; en `q4_k_m` cabe en GPUs de 4 a 6 GB.
- Opciones de despliegue: vLLM (validado y recomendado por el autor), llama.cpp u Ollama mediante el export GGUF `q4_k_m`. No se mencionan TGI ni SGLang.
- Latencia y throughput: TTFT P50 de 24,8 ms a concurrencia 1 y 47,9 ms a concurrencia 32; throughput de 1,41 a 29,21 RPS segun concurrencia, medidos en vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeightBake-Qwen2.5-3B-DPO | 3,09B | no disponible | Destilacion de contexto + SFT/DPO para enrutamiento de voz | Apache 2.0 | Hugging Face (sarthax/WeightBake-Qwen2.5-3B-DPO) |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | no disponible en esta ficha | Modelo instructivo generalista | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,54B | no disponible en esta ficha | Modelo instructivo generalista de menor tamano | Apache 2.0 | Hugging Face |
| Llama 3.2 3B Instruct | 3,21B | no disponible en esta ficha | Modelo instructivo generalista | Licencia comunitaria Llama 3.2 | Hugging Face |

La comparacion relevante no es de capacidad generalista sino de coste por peticion en una tarea fija: frente al propio Qwen2.5-3B-Instruct con prompt largo, WeightBake reduce el prefill un 99,48% y mejora el cumplimiento de esquema del 81,25% al 97,50%. No hay datos publicados que permitan comparar su rendimiento generalista con Llama 3.2 3B o Qwen2.5-1.5B.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado para un unico rol de enrutador de voz en JSON; su comportamiento fuera de ese dominio no esta evaluado y probablemente degrade frente al modelo base.
- Idioma: solo se declara ingles; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Riesgo de alucinacion: no se reportan mediciones de factualidad; en tareas de extraccion de entidades (cuentas, importes) conviene validar la salida contra el esquema antes de actuar.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al derivar de Qwen2.5-3B-Instruct hereda los del modelo base, no auditados en esta ficha.
- Sobreajuste al formato: el 100% de JSON valido y esquema estricto se mide sobre un holdout de solo 80 muestras del mismo dominio; la robustez ante entradas fuera de distribucion no esta cuantificada.
- Dependencia del trigger exacto: el prompt de sistema debe ser literalmente "Respond as the deterministic voice router in raw JSON."; variaciones no han sido evaluadas y podrian romper el comportamiento destilado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validacion externa.
- Madurez: repositorio creado y actualizado el mismo dia (13 de noviembre de 2026), sin historial de versiones ni issues; tratarlo como experimental en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sarthax/WeightBake-Qwen2.5-3B-DPO
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset SFT: https://huggingface.co/datasets/sarthexe/weightbake-voice-router-sft
- Dataset DPO: https://huggingface.co/datasets/sarthexe/weightbake-voice-router-dpo
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
