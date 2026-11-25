# distil-labs/Qwen3.6-35B-A3B-flexible-chat-template

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje causal con codificador de vision desarrollado por el equipo Qwen (Alibaba). Se trata de la primera variante de pesos abiertos de la serie Qwen3.6, construida sobre la arquitectura Qwen3.5 MoE e incorporando mejoras centradas en codificacion agentica y preservacion del razonamiento. El repositorio analizado, `distil-labs/Qwen3.6-35B-A3B-flexible-chat-template`, es una publicacion de terceros (distil-labs) que redistribuye los pesos del modelo original bajo licencia Apache 2.0, con un total de 35.951.822.704 parametros segun los safetensors.

El modelo emplea una arquitectura hibrida de mezcla de expertos (MoE) con 256 expertos, de los cuales se activan 8 enrutados mas 1 compartido, resultando en unos 3.000 millones de parametros activos por token. Combina capas de atencion lineal (Gated DeltaNet) con capas de atencion tradicional (Gated Attention) en una disposicion de 10 bloques de 4 capas cada uno. Su ventana de contexto nativa es de 262.144 tokens, extensible hasta 1.010.000.

La relevancia del modelo radica en su enfoque hacia flujos de trabajo de codigo a nivel de repositorio y agentes, con soporte multimodal (image-text-to-text) y una opcion novedosa de retencion del contexto de razonamiento entre turnos. El repositorio de distil-labs anade una plantilla de chat flexible sobre los pesos originales, aunque no documenta los detalles de dicha modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con vision encoder; mezcla de Gated DeltaNet (atencion lineal) y Gated Attention, con MoE |
| Parametros totales | 35.951.822.704 (~35,95B) |
| Parametros activos | ~3B (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con vLLM, SGLang, KTransformers) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de vision, entrenado en dos fases (pre-entrenamiento y post-entrenamiento). La columna vertebral del lenguaje tiene una dimension oculta de 2048, 40 capas y un vocabulario de 248.320 tokens (con padding). La disposicion interna es de 10 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de 1 sub-bloque de Gated Attention, todos ellos intercalados con capas MoE. La Gated DeltaNet usa 32 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128. La Gated Attention usa 16 cabezas para Q y 2 para KV, con dimension de cabeza 256 y dimension de RoPE de 64.

La capa MoE contiene 256 expertos, de los cuales se activan 8 enrutados mas 1 compartido por token, con una dimension intermedia de experto de 512. El modelo incorpora entrenamiento con Multi-Token Prediction (MTP) en varios pasos. La model card menciona una innovacion denominada "Thinking Preservation", que permite retener el contexto de razonamiento de mensajes historicos para reducir la sobrecarga en desarrollo iterativo. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento general en modo conversacional.
- Codificacion agentica: manejo de flujos de trabajo frontend y razonamiento a nivel de repositorio, segun la model card.
- Capacidades multimodales de imagen a texto (pipeline `image-text-to-text`) gracias al codificador de vision.
- Preservacion del razonamiento (Thinking Preservation): retencion opcional del contexto de razonamiento entre mensajes historicos.
- Entrenamiento con Multi-Token Prediction (MTP), que puede aprovecharse para decodificacion especulativa.
- Compatibilidad declarada con Transformers, vLLM, SGLang y KTransformers.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no detalladas en la informacion disponible (existe un benchmark SWE-bench Multilingual, pero no se enumeran idiomas).

## Casos de uso

- Desarrollo de codigo a nivel de repositorio: el modelo esta optimizado para razonamiento sobre repositorios completos y flujos frontend, por lo que puede integrarse en asistentes de IDE o pipelines de revision de codigo que necesiten analizar multiples ficheros dentro de su ventana de 262.144 tokens.
- Agentes de codificacion autonoma: con SWE-bench Verified de 73,4, es adecuado para tareas de resolucion de issues y parcheo automatico en entornos de integracion continua.
- Iteracion de desarrollo con razonamiento persistente: la opcion Thinking Preservation permite mantener el hilo de razonamiento entre turnos, util en sesiones largas de depuracion o refactorizacion donde el contexto previo es relevante.
- Procesamiento de documentos extensos con imagenes: al ser image-text-to-text, puede extraer y razonar sobre diagramas, capturas o documentos escaneados junto con texto largo.
- Analisis de bases de codigo grandes: la extension de contexto hasta 1.010.000 tokens permite ingerir repositorios o documentacion tecnica extensa en una sola pasada.
- Despliegue con atencion lineal eficiente: la combinacion de Gated DeltaNet y MoE con 3B activos reduce el coste de inferencia frente a modelos densos de 35B, adecuado para servicios de generacion con requisitos de latencia moderados.

## Benchmarks y rendimiento

Datos extraidos de la model card del autor (evaluaciones del modelo base Qwen3.6-35B-A3B):

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: la tabla original de la model card estaba truncada en el momento de la extraccion; los valores de Terminal-Bench 2.0 no estan disponibles en la informacion proporcionada. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16/fp16 (~72 GB) se requiere al menos 80 GB de VRAM, lo que encaja en una A100 80GB o H100. Con cuantizacion a 8 bits (~36 GB) cabria en una RTX 6000 Ada o A6000 de 48 GB; a 4 bits (~18-20 GB) cabria en una RTX 4090 de 24 GB.
- GPU recomendadas: A100 80GB, H100 80GB para precision completa; RTX 4090, RTX 6000 Ada o L40S para cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con cuantizacion de 4 bits, aunque los tipos de cuantizacion concretos no estan documentados en la informacion disponible.
- Opciones de despliegue: Transformers, vLLM, SGLang y KTransformers segun la model card; llama.cpp u Ollama no estan confirmados.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | ~35,95B | ~3B | 262.144 (ext. 1.010.000) | 73,4 | Apache 2.0 |
| Qwen3.5-35BA3B | ~35B | ~3B | no disponible | 70,0 | Apache 2.0 (serie Qwen) |
| Qwen3.5-27B | ~27B | denso | no disponible | 75,0 | Apache 2.0 (serie Qwen) |
| Gemma4-31B | ~31B | denso | no disponible | 52,0 | no disponible |
| Gemma4-26BA4B | ~26B | ~4B | no disponible | 17,4 | no disponible |

## Limitaciones y advertencias

- El repositorio analizado es una redistribucion de terceros (distil-labs) con una "plantilla de chat flexible" no documentada; no hay garantia de que la plantilla modificada reproduzca el comportamiento del modelo original.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan tasas ni mitigaciones especificas.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no especificados; el rendimiento fuera de ingles y chino no esta garantizado.
- El contexto extensible hasta 1.010.000 tokens puede degradar la calidad y disparar el coste de memoria; no se detalla la tecnica de extension.
- Aunque la licencia es Apache 2.0, se recomienda verificar la licencia del modelo base original en el enlace indicado por el autor.
- El repositorio registra 0 descargas y 0 likes, lo que sugiere ausencia de validacion comunitaria.
- Los datos de benchmarks corresponden al modelo base Qwen3.6-35B-A3B, no necesariamente a esta redistribucion con plantilla modificada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/distil-labs/Qwen3.6-35B-A3B-flexible-chat-template
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Blog oficial: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai
