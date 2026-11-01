# liodon-ai/UserLM-2.0-FP8

## Resumen

UserLM-2.0-FP8 es una cuantizacion en FP8 dinamico del modelo microsoft/UserLM-2.0, publicada por Liodon AI. Se trata de una version comprimida que reduce el peso de los pesos originales de 32,1 GB a 11,2 GB, manteniendo el esquema de cuantizacion `FP8_DYNAMIC` implementado con llm-compressor. El modelo base es un transformer tipo Llama con 8.030.277.632 parametros (aproximadamente 8 mil millones), orientado a generacion de texto conversacional.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de 8B en GPUs con menos memoria, manteniendo una fidelidad numerica alta gracias a que el esquema FP8 dinamico no requiere dataset de calibracion: los pesos se castean directamente a FP8 (E4M3) por canal y las activaciones se cuantizan dinamicamente por token en tiempo de inferencia. Esto elimina el sesgo introducido por conjuntos de calibracion y simplifica el despliegue.

El modelo esta pensado para cargas de trabajo conversacionales y se distribuye en formato safetensors con compatibilidad para vLLM, TGI y SGLang. La licencia es "other", heredada del modelo base, lo que exige revisar los terminos originales de Microsoft antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (derivada de microsoft/UserLM-2.0) |
| Parametros totales | 8.030.277.632 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinamico (E4M3, pesos por canal, activaciones por token); `lm_head` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other (heredada de microsoft/UserLM-2.0) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base microsoft/UserLM-2.0 es un transformer tipo Llama de aproximadamente 8 mil millones de parametros, segun se deduce de la arquitectura declarada en las etiquetas y del recuento real de parametros en safetensors. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

La innovacion tecnica de esta version concreta es la cuantizacion FP8 dinamica aplicada con llm-compressor. Los pesos se convierten a FP8 (formato E4M3) por canal de forma anticipada, mientras que las activaciones se cuantizan dinamicamente por token durante la inferencia. Al no requerir calibracion, los pesos cuantizados son un casteo directo de los originales, sin sesgo de conjunto de calibracion. La capa `lm_head` se deja sin cuantizar por su impacto desproporcionado en la calidad frente a su tamano reducido.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Generacion de texto autoregresiva estandar mediante `text-generation`.
- Compatibilidad con tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Despliegue optimizado en vLLM, TGI y SGLang con soporte nativo de FP8.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en un servicio de chat, y su version FP8 reduce el coste de VRAM por instancia, lo que permite desplegar mas replicas en el mismo hardware.
- Asistentes conversacionales embebidos en producto: con 11,2 GB de pesos, puede servirse en una sola GPU de 24 GB (por ejemplo, RTX 4090 o L4) dejando margen para el KV cache y el resto del stack.
- Generacion de respuestas en pipelines de mensajeria: al ser un modelo conversacional, encaja en sistemas de respuesta automatica donde la latencia y el coste por token son criticos y se beneficia del throughput de FP8 en GPUs Ada/Hopper.
- Prototipado e investigacion: la cuantizacion sin calibracion permite reproducir el comportamiento del modelo original con menor huella de memoria, util para experimentos comparativos entre versiones cuantizadas y de precision completa.
- Despliegue en infraestructura con GPUs L40S o L4: el soporte de compute capability >= 8.9 permite ejecutar FP8 de forma nativa en GPUs de inference de coste medio, sin necesidad de H100.
- Servicio de chat en produccion con vLLM: el comando `vllm serve` levanta un endpoint compatible con la API de OpenAI, lo que facilita integrarlo en aplicaciones existentes con cambios minimos.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia para medir la degradacion de calidad de FP8 dinamico frente al modelo base de 32,1 GB en tareas conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11,2 GB solo para pesos en FP8; hay que sumar el KV cache y overhead del runtime, por lo que en la practica se recomienda un minimo de 16-24 GB.
- GPU recomendadas con soporte nativo FP8 (compute capability >= 8.9): RTX 40-series, L4, L40S, H100, H200, B100, B200, GB10.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y en tarjetas Ada de gama alta; en GPUs anteriores a Ada, vLLM/TGI descomprimen a precision superior y se pierde la ventaja de velocidad y memoria.
- Opciones de despliegue: vLLM (`vllm serve liodon-ai/UserLM-2.0-FP8`), Text Generation Inference (imagen oficial `ghcr.io/huggingface/text-generation-inference`), SGLang (`python -m sglang.launch_server --model-path liodon-ai/UserLM-2.0-FP8`).
- Latencia y throughput estimados: no disponible; no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/UserLM-2.0-FP8 | 8,03B | no disponible | FP8 dinamico | other | HuggingFace (4 descargas) |
| microsoft/UserLM-2.0 | 8,03B (aprox.) | no disponible | BF16/FP16 (32,1 GB) | other | HuggingFace |
| Alternativas de 8B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos de la misma categoria con la que establecer una comparativa cuantitativa fiable. La comparacion principal es contra el propio modelo base: la version FP8 ocupa 11,2 GB frente a 32,1 GB, con cuantizacion directa sin calibracion.

## Limitaciones y advertencias

- La licencia es "other" y se hereda del modelo base; es imprescindible revisar los terminos de microsoft/UserLM-2.0 antes de cualquier uso comercial.
- El repositorio no declara idiomas soportados, por lo que no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas sin evaluacion previa.
- No se han publicado benchmarks ni evaluaciones de calidad de la version cuantizada frente al modelo original; la degradacion por FP8 no esta cuantificada.
- Riesgo de alucinacion inherente a los modelos generativos de este tamano; no hay datos especificos publicados.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- La ventaja de FP8 solo se materializa en GPUs con compute capability >= 8.9; en hardware anterior el runtime descomprime y se pierde el beneficio de memoria y velocidad.
- El modelo tiene un volumen de descargas muy bajo (4) y ninguna validacion de la comunidad (0 likes), lo que reduce la confianza en su robustez para produccion.
- No se dispone de informacion sobre la longitud de contexto, lo que limita la planificacion de cargas con ventanas largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/liodon-ai/UserLM-2.0-FP8
- Modelo base: https://huggingface.co/microsoft/UserLM-2.0
- Perfil del autor: https://huggingface.co/liodon-ai
- Herramienta de cuantizacion (llm-compressor): https://github.com/vllm-project/llm-compressor
