# hossain0909/Keural-Nova-v1.2-experimental-NVFP4

## Resumen

Keural Nova v1.2 experimental NVFP4 es una cuantización en 4 bits (formato NVFP4) del modelo multimodal Keural Nova v1.2, desarrollado por MKD y publicado en Hugging Face por el usuario hossain0909. El modelo base es un derivado de Qwen3.6-35B-A3B, una arquitectura MoE de unos 35 mil millones de parámetros con capacidad image-text-to-text, y esta versión cuantizada está pensada específicamente para servir inferencia de alto rendimiento en GPUs NVIDIA Blackwell mediante vLLM.

El problema que resuelve es el de la huella de memoria: el checkpoint pasa de unos 67 GB en bf16 a 21,9 GB en NVFP4, una reducción aproximada de 3 veces, manteniendo la torre de visión, `lm_head` y las capas MTP en alta precisión para minimizar la pérdida de exactitud. Es relevante ahora porque NVFP4 solo se acelera en hardware Blackwell (B200, GB200, RTX 50xx), y los modelos MoE grandes con contexto largo se benefician especialmente de esta clase de cuantización.

La variante es experimental, con 170 descargas y 1 like en el momento de redactar la ficha, por lo que conviene validarla contra el modelo base bf16 antes de usarla en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en Qwen3.5/Qwen3.6 (qwen3_5_moe), con Gated-DeltaNet de atencion lineal, torre de vision y MTP |
| Parametros totales | 35.107.181.936 (~35 B) |
| Parametros activos | no disponible (el modelo base Qwen3.6-35B-A3B sugiere ~3 B activos, pero no consta en la informacion proporcionada) |
| Longitud de contexto | 262.144 tokens (256K) de forma nativa; hasta 1M con YaRN segun la model card |
| Tipos de cuantizacion | NVFP4: pesos 4-bit float y activaciones 4-bit float con escalas por bloque en FP8; torre de vision, `lm_head` y MTP en bf16 |
| Idiomas soportados | Coreano (ko) e ingles (en) |
| Licencia | Apache-2.0 (hereda la licencia de Qwen/Qwen3.6-35B-A3B) |
| Formato de pesos | safetensors con esquema `compressed-tensors` / `nvfp4-pack-quantized` |

## Arquitectura y entrenamiento

El modelo base, Keural Nova v1.2, se deriva de Qwen3.6-35B-A3B, una arquitectura transformer de mezcla de expertos (MoE) que incorpora capas de atencion lineal Gated-DeltaNet, una torre de vision para entrada multimodal y cabezas MTP (multi-token prediction). La cuantizacion NVFP4 cubre 31.070 capas lineales, incluidos 30.880 expertos MoE, las capas de atencion y la atencion lineal Gated-DeltaNet, mientras que los bloques de vision, `lm_head` y MTP se mantienen en bf16 para preservar la exactitud en vision y en la prediccion de tokens.

La cuantizacion se realizo con la herramienta `llm-compressor` de Red Hat, calibrando con 512 muestras de la mezcla de datos SFT de Keural Nova v1.2 (coreano, ingles, codigo y tool-use) con longitud de secuencia 2048. El esquema de grupos usa pesos y activaciones en flotante de 4 bits con escalas por bloque en FP8, replicando la receta publica de `RedHatAI/Qwen3.6-35B-A3B-NVFP4`. No se dispone de datos sobre el numero de tokens de preentrenamiento ni sobre procesos de RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation), con modo no-thinking por defecto segun la plantilla de chat incluida.
- Comprension multimodal imagen-texto (image-text-to-text): la torre de vision se conserva en bf16, por lo que la vision funciona tras la cuantizacion.
- Tool calling mediante formato Qwen XML (`--tool-call-parser qwen3_xml` con `--enable-auto-tool-choice` en vLLM).
- Contexto largo: 256K tokens de forma nativa, indicado para agentes y cargas de trabajo con herramientas; extension a 1M tokens mediante YaRN solo para peticiones que realmente lo superen.
- Soporte de codigo y uso de herramientas, presentes en la mezcla de calibracion SFT.
- Bilingue: coreano e ingles.
- MTP (multi-token prediction) conservado en alta precision, util para decodificacion especulativa o aceleracion de generacion (segun la model card).

## Casos de uso

- Serviring de agentes con herramientas en produccion: el comando de ejemplo de la model card configura vLLM con contexto de 256K y parser de tool calls Qwen XML, adecuado para agentes multi-paso que necesitan mantener contextos extensos en memoria.
- Procesamiento de documentos extensos: con 256K tokens nativos (y hasta 1M con YaRN), se puede analizar bases de codigo completas, contratos largos o historiales de conversacion sin fragmentar la entrada.
- Asistentes bilingues coreano-ingles: el modelo esta calibrado y entrenado para ambos idiomas, util para productos dirigidos al mercado coreano con soporte en ingles.
- Comprension de imagenes con preguntas en texto (VQA): la torre de vision en bf16 permite describir, analizar y responder sobre imagenes con degradacion minima respecto al modelo base.
- Inferencia de alto rendimiento y bajo coste en Blackwell: la reduccion de 67 GB a 21,9 GB permite servir el modelo en menos GPUs (por ejemplo, con tensor parallelism 2) y obtener mayor throughput por dolar.
- Chatbots multi-turno conversacionales: el pipeline conversacional y la plantilla de chat fija facilitan su integracion en frameworks de chat estandar.
- Despliegue experimental de FP4: util para equipos que evaluan la viabilidad de NVFP4 en su infraestructura Blackwell antes de comprometerse con la cuantizacion en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la cuantizacion NVFP4 suele costar entre un 1 y un 2 % de exactitud respecto a bf16, en linea con los checkpoints publicos NVFP4 de Qwen3.6-A3B de nvidia y RedHatAI, y recomienda validar contra el modelo base bf16 en la carga de trabajo propia (tool calling, coreano, codigo) antes de pasar a produccion.

## Requisitos de hardware

- VRAM estimada: 21,9 GB de pesos en NVFP4; con KV cache para contextos de 256K el consumo real sera superior, por lo que se recomienda margen adicional.
- GPUs compatibles con aceleracion FP4: exclusivamente NVIDIA Blackwell (B200, GB200, RTX 50xx). Los kernels FP4 no existen en Hopper/H200: el checkpoint se genero en H200 pero solo se acelera en Blackwell.
- En GPUs Blackwell consumer (RTX 50xx con 32 GB, como la RTX 5090) los pesos cabrian en una sola GPU, aunque para contexto completo de 256K y multimodalidad se recomienda tensor parallelism; la model card de ejemplo usa `--tensor-parallel-size 2`.
- Despliegue: vLLM es el runtime de referencia (formato `compressed-tensors` / `nvfp4-pack-quantized` servido directamente). No se menciona compatibilidad con llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponible; se anuncia como cuantizacion para "high-throughput serving" pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Vision | Licencia |
|---|---|---|---|---|---|
| Keural Nova v1.2 NVFP4 (este) | ~35 B (MoE) | NVFP4 (4-bit pesos+activaciones) | 256K (1M con YaRN) | Si | Apache-2.0 |
| RedHatAI/Qwen3.6-35B-A3B-NVFP4 | ~35 B (MoE, ~3 B activos) | NVFP4 | no disponible | Si (base Qwen3.6) | Segun base Qwen |
| Qwen/Qwen3.6-35B-A3B (base) | ~35 B (MoE) | bf16 | 256K (1M con YaRN) | Si | Licencia Qwen |

Keural Nova se diferencia de la referencia RedHatAI en que es un fine-tune de MKD orientado a coreano/ingles con mezcla SFT propia de codigo y tool-use, y comparte con ella la misma receta de cuantizacion. Frente al modelo base bf16 de 67 GB, esta variante ofrece ~3 veces menos memoria a cambio de un coste de exactitud estimado del 1-2 %.

## Limitaciones y advertencias

- Variante experimental: con 170 descargas y 1 like, tiene poco historial de uso comunitario; la propia model card exige validar contra el bf16 base en la carga de trabajo real antes de produccion.
- Hardware restrictivo: sin GPUs Blackwell no hay beneficio de velocidad ni de memoria; en Hopper u arquitecturas anteriores el checkpoint no se ejecuta acelerado y podria no ser siquiera servible por vLLM.
- Perdida de exactitud estimada del 1-2 % respecto a bf16, concentrada potencialmente en tareas sensibles a la cuantizacion (tool calling, coreano, codigo).
- Idiomas limitados a coreano e ingles; el rendimiento en castellano u otras lenguas no esta documentado.
- Modo no-thinking por defecto en la plantilla de chat incluida; habilitar el modo thinking requeriria ajustes no documentados en la model card.
- La extension a 1M de contexto via YaRN se recomienda solo para peticiones que realmente superen 256K; usarla de forma general puede degradar la calidad.
- Licencia Apache-2.0 heredada de Qwen3.6-35B-A3B: sin restricciones comerciales relevantes, aunque conviene revisar los terminos de la licencia base de Qwen.
- Riesgo de alucinacion y sesgos: no disponible; no se documenta evaluacion de seguridad ni de sesgos del modelo base.

## Enlaces

- Modelo cuantizado: https://huggingface.co/hossain0909/Keural-Nova-v1.2-experimental-NVFP4
- Modelo base: https://huggingface.co/mkd-hossain/Keural-Nova-v1.2-experimental
- Referencia de receta de cuantizacion: https://huggingface.co/RedHatAI/Qwen3.6-35B-A3B-NVFP4
- Modelo base original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Autor MKD: https://mkd.kr
- Paper, blog o demo: no disponible
