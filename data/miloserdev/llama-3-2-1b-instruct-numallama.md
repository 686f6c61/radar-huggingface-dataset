# miloserdev/Llama-3.2-1B-Instruct-numallama

## Resumen

Llama-3.2-1B-Instruct-numallama es una conversion del modelo meta-llama/Llama-3.2-1B-Instruct realizada por el desarrollador miloserdev para que pueda ejecutarse con numallama, un motor de inferencia escrito en C disenado especificamente para servidores CPU con soporte de ejecucion NUMA-aware a traves de todos los sockets de maquinas multiprocesador. No se trata de un modelo nuevo ni de un fine-tuning: los pesos subyacentes son los del Llama 3.2 1B Instruct original de Meta, reformateados en un contenedor binario propietario (`.bin`) que no es compatible con llama.cpp, Ollama, LM Studio ni transformers.

El interes de esta publicacion es fundamentalmente de infraestructura, no de modelado. Permite desplegar un modelo de 1.000 millones de parametros en entornos ARM64 de servidor (Ampere Altra, AWS Graviton, nucleos Neoverse) aprovechando instrucciones NEON para el producto escalar, con velocidades de decodificacion reportadas de 184 tok/s en una maquina de 2 x Ampere Altra Max M128-30 (256 nucleos). Es una opcion relevante para quienes necesitan inferencia de texto en CPU a gran escala sin GPU, con un modelo pequeno y de licencia Llama 3.2.

El repositorio incluye unicamente pesos Q8 (int8 con escalas por grupo) y el tokenizer; la model card menciona tambien una variante Q4 asimetrica de 4 bits con importance matrix, aunque el listado de ficheros solo detalla el binario Q8 de 1,3 GB. El modelo hereda las capacidades del Llama 3.2 1B Instruct original: generacion de texto, instrucciones y conversacion multilingue basica, con una ventana de contexto de 128.000 tokens segun la especificacion de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), pesos convertidos a formato numallama |
| Parametros totales | 1.240 millones (1B, segun el modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base; no confirmado en la model card de la conversion) |
| Tipos de cuantizacion | Q8 (int8 con escalas por grupo); Q4 asimetrica de 4 bits con grupos de 32 y escala/min en fp16 (mencionada, no listada como fichero) |
| Idiomas soportados | no disponible (la model card no los detalla; el modelo base soporta oficialmente ingles, aleman, frances, hindi, italiano, portugues, espanol y tailandes) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | `.bin` propietario de numallama (no GGUF, no safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Llama 3.2 1B Instruct de Meta: un transformer decoder-only denso con 1.240 millones de parametros, atencion con RoPE, normalizacion RMSNorm y capas MLP con SwiGLU. El modelo original fue entrenado por Meta con un pipeline que incluye preentrenamiento, ajuste supervisado (SFT) y optimizacion por preferencias humanas (RLHF/DPO), orientado a seguir instrucciones y mantener conversaciones. La model card de esta conversion no aporta detalles adicionales sobre el entrenamiento, porque no se ha reentrenado: solo se ha reformateado y cuantizado.

La innovacion tecnica de esta publicacion reside en la conversion y en el motor numallama, no en el modelo. La cuantizacion Q8 usa int8 con escalas por grupo; la Q4 (mencionada pero no listada como fichero en el repositorio) es asimetrica con grupos de 32 y escala/min en fp16, calibrada con una importance matrix recogida por numallama sobre texto en ingles, ruso, chino y codigo. El motor numallama ejecuta inferencia NUMA-aware repartiendo el trabajo entre todos los sockets de una maquina multiprocesador, con kernels NEON optimizados para ARM64 y codigo C portable (no optimizado) para otras arquitecturas, incluido x86-64. La model card menciona soporte de decodificacion especulativa y herramientas (tools) en el README del motor, aunque no se dan detalles de implementacion.

## Capacidades

- Generacion de texto y conversacion multilingue basica, heredadas del Llama 3.2 1B Instruct original.
- Seguimiento de instrucciones y formato de chat (system/user/assistant) mediante el tokenizer incluido.
- Soporte de tool calling / function calling segun la implementacion del motor numallama (mencionado en el README del motor, no detallado en la model card).
- Soporte de decodificacion especulativa en el motor numallama (referenciado en el README, sin datos de rendimiento en esta ficha).
- Servidor compatible con la API de OpenAI en `http://127.0.0.1:8080/v1` mediante el modo `server` de `runq`.
- Modo chat interactivo en terminal mediante el flag `-m chat`.
- Capacidades de razonamiento y codigo limitadas por el tamano de 1B parametros; no es un modelo orientado a tareas complejas de codigo o matematicas.
- No se documentan capacidades de vision, audio ni thinking mode en esta conversion.

## Casos de uso

- Despliegue de un asistente conversacional ligero en servidores ARM64 sin GPU: el modelo Q8 de 1,3 GB cabe en memoria y numallama lo ejecuta con kernels NEON en Ampere Altra o AWS Graviton, lo que permite servir chat basico en infraestructura de CPU ya existente.
- Sustitucion de un endpoint compatible con OpenAI en entornos aislados: el modo `server` de `runq` expone `/v1` en el puerto 8080, de forma que aplicaciones que ya usan el SDK de OpenAI pueden apuntar a este servidor local sin cambios de codigo.
- Procesamiento por lotes de texto en maquinas multiprocesador: el reparto NUMA-aware entre sockets permite aprovechar todos los nucleos de un servidor de 2 sockets para tareas de clasificacion, resumen o extraccion de informacion con un modelo pequeno.
- Prototipado y evaluacion de pipelines de agentes en CPU: el soporte de tools y decodificacion especulativa del motor permite probar flujos de function calling sin depender de GPU, aunque el modelo de 1B limita la calidad del razonamiento multi-paso.
- Educacion y experimentacion con motores de inferencia en C: el repositorio sirve como ejemplo practico de conversion de pesos Llama a un formato binario propio y de ejecucion NUMA en ARM64 para investigadores que estudian inferencia en CPU.
- Chat de bajo coste en el borde (edge) de la red: al no requerir GPU y ocupar 1,3 GB en disco, puede desplegarse en nodos ARM64 cercanos al usuario para respuestas conversacionales simples con baja latencia de red.
- Traduccion y generacion de texto multilingue basica: el modelo base soporta varios idiomas (ingles, espanol, frances, aleman, italiano, portugues, hindi, tailandes), aunque la calidad en idiomas distintos del ingles es limitada por el tamano de 1B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica cifra de rendimiento aportada por la model card es la velocidad de decodificacion del fichero Q8: 184 tok/s para un unico chat, medida en 2 x Ampere Altra Max M128-30 (256 nucleos Neoverse N1, ambos sockets). El autor advierte que otras maquinas daran resultados distintos y no se aportan datos de MMLU, HumanEval, GSM8K ni de latencia de prefill.

| Metrica | Valor | Condiciones |
|---|---|---|
| Decodificacion (Q8) | 184 tok/s | 2 x Ampere Altra Max M128-30, 256 nucleos, ambos sockets |
| Decodificacion (Q4) | no disponible | La model card solo indica que es mas rapida que Q8 |
| Prefill / TTFT | no disponible | no disponible |
| Benchmarks de calidad | no disponible | no disponible |

## Requisitos de hardware

- VRAM: no aplica; es un modelo para CPU. El fichero Q8 ocupa 1,3 GB en disco y requiere al menos esa cantidad de RAM mas el overhead del motor y la cache KV.
- GPU recomendadas: ninguna; numallama es un motor de CPU. En x86-64 funciona con codigo C portable no optimizado, por lo que el rendimiento sera notablemente inferior al de ARM64 con NEON.
- CPU recomendadas: ARM64 con instrucciones NEON dot product (Ampere Altra, AWS Graviton, nucleos Neoverse). La medicion de 184 tok/s usa 256 nucleos en 2 sockets; en un solo socket o en menos nucleos la velocidad sera proporcionalmente menor.
- Cabe en consumer hardware: si, en cualquier equipo con 2 GB o mas de RAM libre; en Raspberry Pi y similares ARM64 funcionaria, aunque sin datos de throughput publicados.
- Opciones de despliegue: exclusivamente numallama (compilado con `make` desde el repositorio de GitHub). No es compatible con vLLM, llama.cpp, Ollama, LM Studio, TGI ni transformers.
- Latencia y throughput: 184 tok/s en el hardware de referencia para Q8; el resto de configuraciones no estan medidas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-1B-Instruct-numallama | 1,24B | 128k (heredado) | `.bin` numallama (solo CPU) | Llama 3.2 Community | Hugging Face (miloserdev) |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128k | safetensors (transformers, vLLM, TGI) | Llama 3.2 Community | Hugging Face (Meta) |
| Llama-3.2-1B-Instruct-GGUF (comunidad) | 1,24B | 128k | GGUF (llama.cpp, Ollama, LM Studio) | Llama 3.2 Community | Multiples repos comunitarios |
| Qwen2.5-1.5B-Instruct | 1,54B | 32k | safetensors, GGUF | Apache 2.0 | Hugging Face (Alibaba) |

La diferencia clave frente al modelo base y a las conversiones GGUF es el motor: numallama solo funciona en CPU y esta optimizado para ARM64 multiprocesador, mientras que las alternativas GGUF y safetensors tienen ecosistemas de despliegue mucho mas amplios (llama.cpp, Ollama, vLLM). Frente a Qwen2.5-1.5B-Instruct, este ultimo ofrece licencia Apache 2.0 mas permisiva y contexto de 32k, a cambio de mayor tamano.

## Limitaciones y advertencias

- Los ficheros no son GGUF y no funcionan con llama.cpp, Ollama, LM Studio ni transformers; solo se ejecutan con numallama, lo que limita enormemente las opciones de despliegue.
- El rendimiento optimizado solo esta disponible en ARM64 con NEON; en x86-64 el motor usa codigo C portable no optimizado y la velocidad sera mucho menor.
- El modelo base de 1B parametros tiene capacidad limitada de razonamiento, matematicas y codigo; no es adecuado para tareas complejas ni para agentes multi-paso exigentes.
- Riesgo de alucinacion inherente a un modelo de 1B, especialmente en tareas de conocimiento factual y contextos largos.
- La model card no documenta sesgos especificos de esta conversion; se heredan los sesgos del Llama 3.2 1B Instruct original.
- La cuantizacion Q8 puede introducir degradacion menor frente a los pesos originales en fp16/bf16; la Q4, si se usa, degrada mas.
- La licencia Llama 3.2 Community License impone restricciones de uso (incluida la Acceptable Use Policy) y obliga a cumplir sus terminos para uso comercial; no es una licencia permisiva tipo Apache o MIT.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-19; es un artefacto muy reciente y sin validacion comunitaria.
- La ventana de contexto de 128k es la del modelo base; la model card de la conversion no confirma que numallama la soporte completa, y el consumo de RAM de la cache KV a esa longitud puede ser elevado en CPU.
- No se documentan los idiomas soportados en esta conversion; la calidad multilingue fuera del ingles es limitada por el tamano del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/miloserdev/Llama-3.2-1B-Instruct-numallama
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Repositorio del motor numallama: https://github.com/miloserdev/numallama
- README del motor (opciones, contexto, sampling, tools, decodificacion especulativa, API): https://github.com/miloserdev/numallama#readme
- Licencia Llama 3.2 Community License: https://huggingface.co/miloserdev/Llama-3.2-1B-Instruct-numallama/blob/main/LICENSE.txt
- Acceptable Use Policy: https://huggingface.co/miloserdev/Llama-3.2-1B-Instruct-numallama/blob/main/USE_POLICY.md
