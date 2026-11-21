# nace-ai/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini-GGUF es una conversión de pesos a formato GGUF del modelo Inkling 2 Mini, desarrollado originalmente por Thinking Machines Lab. La conversión la publica Nace.AI, un proyecto especializado en cuantización de pesos de modelos abiertos. El repositorio contiene una única variante cuantizada, IQ4_XS, orientada a inferencia local con llama.cpp, y no incluye la visión ni el módulo MTP (multi-token prediction) del modelo original.

El modelo base es un transformer de aproximadamente 26.070 millones de parámetros (según los safetensors del checkpoint original), lo que lo sitúa en la categoría de modelos de tamaño medio-grande. La model card de esta conversión no documenta la longitud de contexto, los idiomas soportados ni los datos de entrenamiento; esa información debe consultarse en la model card del modelo fuente.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de 26B en hardware de consumo o en servidores de gama media gracias a la cuantización a ~4,7 bits por peso (15,46 GB); por otro, el autor publica una métrica de fidelidad (KL media de 0,021 frente a una referencia de cuantización de activaciones) que permite evaluar la degradación introducida por la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Inkling 2 Mini; detalles de arquitectura no disponibles en esta conversión) |
| Parametros totales | 26.070.385.152 (~26,07 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS (4,745 bits/peso); routers y tensores de control de bucle en F32; atención, embeddings y cabeza de salida en Q8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Inkling-2-Mini-IQ4_XS.gguf`, 15,462 GB) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base. La model card de la conversión menciona componentes que permiten inferir algunos rasgos: existen «loop controllers» y «loop-scale», lo que sugiere un mecanismo de bucles recurrentes en el backbone; se citan kernels SiTU para las activaciones de los expertos y una «output head» con softcapping sobre acumuladores FP32, lo que apunta a una arquitectura con mezcla de expertos (MoE) y a una cabeza de salida con saturación suave. También se menciona un módulo MTP (multi-token prediction) que no se incluye en esta conversión.

El proceso de cuantización es de solo pesos (weight-only): los pesos empaquetados se decodifican a F32 y se recuantizan. No se reproduce la cuantización de activaciones del modelo original. La referencia de evaluación usa el checkpoint original en un bucle de Transformers fijado, con cuantización de referencia Hopper de SGLang para las activaciones de expertos y multiplicaciones de matrices en BF16 con escalas externas separadas. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional: el tag `conversational` del repositorio indica uso previsto para diálogo.
- Razonamiento y respuesta a instrucciones: inferido del uso conversacional, aunque no se documentan capacidades específicas en la model card de la conversión.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integración con infraestructuras de inferencia tipo API.
- Capacidades multimodales: el modelo base incluye visión, pero esta conversión GGUF omite explícitamente el backbone de visión, por lo que no hay soporte de imagen.
- Multi-token prediction: el módulo MTP del modelo original no está incluido en esta conversión.
- Tool calling, agentes, multilingüismo y modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en estación de trabajo: con 15,46 GB en IQ4_XS, el modelo cabe en una GPU de 24 GB (RTX 3090/4090) o en un Mac con memoria unificada de 32 GB o más, permitiendo prototipado sin depender de la nube.
- Despliegue en servidores con llama.cpp: el repositorio documenta el comando exacto con `llama-cli` y el PR de llama.cpp requerido, lo que facilita reproducir el entorno de ejecución en producción.
- Evaluación de la degradación por cuantización: la métrica KL publicada (0,021 sobre 2.040 posiciones) permite comparar esta conversión con otras alternativas antes de adoptarla en un pipeline.
- Chatbot de asistencia en entornos con requisitos de privacidad: al ejecutarse en hardware propio, los datos no salen de la infraestructura del operador.
- Generación de texto y resumen de documentos: uso genérico de un modelo conversacional de 26B, siempre que la longitud de contexto del modelo base lo permita (dato no disponible aquí).
- Base para fine-tuning o experimentación: al ser Apache 2.0 y estar en GGUF, sirve como punto de partida para pruebas de calidad antes de invertir en el checkpoint completo en BF16.

## Benchmarks y rendimiento

La model card solo publica la métrica de fidelidad de la cuantización, no benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Valor |
|---|---|
| Tamano del artefacto | 15,462 GB |
| Bits por peso | 4,745 |
| KL media vs. referencia Source-QDQ | 0,021 |
| Posiciones de token evaluadas | 2.040 |
| Split | held-out |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~15,5 GB solo para los pesos en IQ4_XS; con caché KV y overhead de llama.cpp, prever 18-22 GB para contextos moderados.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40/80 GB, H100 para despliegues de mayor concurrencia.
- GPU de consumo: cabe en RTX 4090 y RTX 3090; en GPUs de 16 GB no entra con comodidad y requeriría offloading a CPU.
- Apple Silicon: viable en equipos con 32 GB de memoria unificada o más (el ejemplo de compilación de la model card usa `-DGGML_METAL=ON`).
- Opciones de despliegue: llama.cpp en el commit `2a28df0f9bd55c4975b6bffb35229a6020720f13` del PR #32704; el tag `endpoints_compatible` sugiere también servidores compatibles con endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. A nivel estructural:

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Inkling-2-Mini-GGUF (IQ4_XS) | ~26,07B | GGUF | Apache 2.0 | Conversion de Nace.AI; sin vision ni MTP |
| Inkling-2-Mini (original) | ~26,07B | safetensors (BF16) | Apache 2.0 | Modelo fuente de Thinking Machines; incluye vision y MTP |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | Sin datos en la informacion disponible |

## Limitaciones y advertencias

- La conversión omite el backbone de visión y el módulo MTP: no es equivalente funcionalmente al modelo original.
- La cuantización es solo de pesos; no reproduce la cuantización de activaciones de la referencia, por lo que la KL de 0,021 mide acuerdo con una referencia concreta, no paridad bit a bit con el runtime original.
- Requiere un PR específico de llama.cpp (el fix de loop-scale es obligatorio); otras versiones pueden producir resultados incorrectos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria documentada.
- No se documentan sesgos, riesgos de alucinación ni comportamiento multilingüe en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse la atribución a Thinking Machines Lab según NOTICE y la model card del modelo fuente.
- El tamaño del repo (15,5 GB) y la ausencia de variantes Q2/Q3/Q5/Q8 limitan las opciones de despliegue en hardware restringido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Sitio de Nace.AI: https://www.nace.ai/
- PR de llama.cpp requerido: https://github.com/ggml-org/llama.cpp/pull/32704
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
