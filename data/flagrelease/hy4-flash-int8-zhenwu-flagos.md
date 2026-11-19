# FlagRelease/Hy4-flash-INT8-zhenwu-FlagOS

## Resumen

Hy4 Flash es un modelo multimodal de lenguaje desarrollado por Tencent Hunyuan y distribuido en este repositorio por la comunidad FlagRelease como una build adaptada al stack FlagOS. Se trata de un modelo de aproximadamente 220.000 millones de parametros totales con arquitectura Latent MoE, de los cuales se activan unos 12.000 millones por token, e incorpora unos 64.000 millones de parametros Engram. Acepta entradas de texto e imagen y genera texto, con una longitud de contexto maxima de 1 millon de tokens.

El modelo esta disenado para cargas de trabajo de oficina: busqueda profunda (deep search), procesamiento de documentos, generacion de presentaciones y Computer Use. Su innovacion principal en el plano de eficiencia es una arquitectura de atencion hibrida que reduce la huella de KV Cache a una sexta parte de la del modelo Hy4. En el benchmark interno WorkIndex de Tencent Hunyuan, Hy4 Flash obtiene 42,1 frente a los 39,7 de Hy4 Preview, con un coste por tarea inferior.

La relevancia de esta ficha concreta reside en que no es el checkpoint original, sino una cuantizacion INT8 (W8A8) empaquetada en formato compressed-tensors y adaptada por el consorcio FlagOS para su despliegue entre chips. La model card documenta la adaptacion a nueve fabricantes de aceleradores (T-Head, NVIDIA, Huawei Ascend, Hygon, Kunlunxin, Muxi, Moore Threads, TsingMicro e Iluvatar CoreX) y reporta mejoras de hasta un 35,9 % en throughput de salida y una reduccion de hasta el 29,1 % en el tiempo hasta el primer token sobre H100 en comparacion con el stack nativo de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida, Latent MoE y Engram |
| Parametros totales | 220.251.201.958 (unos 220 B, incluidos unos 64 B Engram) |
| Parametros activos | Aproximadamente 12 B por token |
| Longitud de contexto | 1.000.000 tokens (maximo nativo); en el ejemplo de despliegue se arranca con `--max-model-len 65536` |
| Tipos de cuantizacion | INT8 (W8A8), formato compressed-tensors; el ejemplo de servicio usa `--dtype bfloat16` y `--kv-cache-dtype bfloat16` |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (INT8, compressed-tensors); tamano del repo 288,6 GB |

## Arquitectura y entrenamiento

Hy4 Flash emplea una arquitectura de transformer con atencion hibrida, Latent MoE y componentes Engram. El diseno MoE implica que, pese a los aproximadamente 220.000 millones de parametros totales, solo se activan unos 12.000 millones por token, lo que reduce el coste computacional de inferencia. La atencion hibrida es la responsable de que la KV Cache ocupe una sexta parte de la del modelo Hy4, un factor determinante para sostener contextos de hasta 1 millon de tokens con un coste de memoria manejable.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card si documenta el trabajo de adaptacion de FlagOS: la build se ha portado a nueve familias de chips mediante el stack FlagOS 2.2 (FlagScale, vllm-plugin-fl y componentes distribuidos), y se ha validado la consistencia de resultados frente a los stacks nativos en varios benchmarks publicos. El ejemplo de despliegue usa vLLM 0.24.0 con tensor parallelism de 8, block size 64, prefix caching y CUDA graphs en modo FULL.

## Capacidades

- Generacion de texto y razonamiento en chino e ingles.
- Entrada multimodal de imagen y salida de texto: la model card incluye ejemplos de invocacion con imagenes en base64 mediante la API compatible con OpenAI.
- Procesamiento de documentos y generacion de presentaciones (PPT), segun los casos de uso declarados por el autor.
- Busqueda profunda (deep search) como carga de trabajo objetivo.
- Computer Use para escenarios de oficina diarios.
- Contexto largo de hasta 1 millon de tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Servido mediante API compatible con OpenAI (`/v1/chat/completions`), lo que facilita la integracion con clientes como AnythingLLM.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Procesamiento de documentos extensos: con 1 millon de tokens de contexto, el modelo puede ingerir contratos, informes o expedientes completos y responder preguntas sobre ellos sin fragmentacion previa, lo que simplifica los pipelines de extraccion y resumen.
- Generacion de presentaciones: el modelo esta disenado explicitamente para la generacion de PPT en entornos de oficina, de modo que puede transformar un documento fuente o un brief en un guion de diapositivas.
- Busqueda profunda asistida: combinado con un motor de recuperacion, puede razonar sobre multiples fuentes recuperadas y sintetizar respuestas con contexto largo, lo que encaja con el caso de deep search declarado por el autor.
- Computer Use y automatizacion de oficina: orientado a tareas de interaccion con aplicaciones y flujos administrativos, puede actuar como capa de decision en agentes que operan interfaces.
- Analisis de imagenes en flujos documentales: al aceptar entradas de imagen, sirve para describir capturas, extraer informacion de graficos o interpretar documentos escaneados dentro de un mismo pipeline de texto.
- Despliegue multi-hardware en entornos regulados: la build FlagOS permite ejecutar el mismo modelo sobre aceleradores de T-Head, Huawei Ascend, Hygon, Kunlunxin, Muxi, Moore Threads, TsingMicro, Iluvatar CoreX o NVIDIA, lo que resulta util cuando la disponibilidad de GPU es heterogenea.
- Servicio de chat compatible con OpenAI: al exponerse mediante vLLM con la API `/v1/chat/completions`, se integra directamente en aplicaciones existentes y en herramientas como AnythingLLM sin adaptadores propietarios.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Metrica | HY4-flash-Nvidia-Origin | HY4-flash-T-Head-FlagOS |
|---|---|---|
| Math-500 | 96 | 95,2 |
| GPQA_Diamond | 92,42 | 87,88 |
| mmbench | 92,6 | En evaluacion |
| mmstar | 80,93 | En evaluacion |

Ademas, la model card reporta que la build FlagOS sobre NVIDIA H100 logra hasta un 35,9 % mas de throughput de salida y hasta un 29,1 % menos de latencia hasta el primer token que el stack nativo de NVIDIA. En el benchmark interno WorkIndex de Tencent Hunyuan, Hy4 Flash obtiene 42,1 frente a 39,7 de Hy4 Preview. No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada: con 220.000 millones de parametros en INT8, los pesos ocupan en torno a 220 GB, a los que hay que sumar la KV Cache y el overhead del runtime; el repo completo pesa 288,6 GB.
- El ejemplo oficial de despliegue usa 8 aceleradores PPU-ZW810E con tensor parallelism de 8, lo que confirma que no es un modelo para una sola GPU.
- GPU recomendadas: NVIDIA H100 (con mejoras de rendimiento documentadas frente al stack nativo), ademas de los aceleradores de T-Head, Huawei Ascend, Hygon, Kunlunxin, Muxi, Moore Threads, TsingMicro e Iluvatar CoreX soportados por FlagOS.
- No cabe en GPU de consumo: un modelo de 220 B en INT8 excede con holgura los 24 GB de una RTX 4090 y los 80 GB de una A100 o H100 individual.
- Opciones de despliegue: vLLM 0.24.0 mediante la imagen Docker de FlagOS publicada en `harbor.baai.ac.cn`; la model card no menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas de tokens por segundo; solo las mejoras relativas del 35,9 % en throughput y del 29,1 % en TTFT frente al stack nativo de NVIDIA.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Hy4 Flash (esta ficha, INT8 FlagOS) | ~220 B | ~12 B | 1 M tokens | Apache 2.0 | Multimodal texto+imagen; KV Cache 1/6 de Hy4; WorkIndex 42,1 |
| Hy4 Preview | no disponible | no disponible | no disponible | no disponible | WorkIndex 39,7; predecesor directo segun la model card |
| Hy4 | no disponible | no disponible | no disponible | no disponible | Referencia de KV Cache: Hy4 Flash usa una sexta parte |

No se dispone en la informacion proporcionada de datos de parametros, contexto ni licencia de Hy4 Preview ni de Hy4, ni de otros modelos comparables de la misma categoria.

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e ingles; el rendimiento en castellano u otras lenguas no esta documentado.
- El contexto maximo nativo es de 1 millon de tokens, pero el comando de servicio de ejemplo limita `--max-model-len` a 65.536; usar el maximo completo exige ajustar memoria y configuracion.
- La cuantizacion INT8 (W8A8) puede introducir degradacion frente al checkpoint original; los propios datos del autor muestran una caida en GPQA_Diamond de 92,42 a 87,88 en la build FlagOS.
- Los benchmarks mmbench y mmstar de la build FlagOS aparecen como "Evaluating", por lo que la validacion multimodal esta incompleta.
- No hay informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion aun minima y poca validacion externa.
- El despliegue requiere hardware de centro de datos (8 aceleradores en el ejemplo oficial) y la imagen Docker de FlagOS; no hay ruta documentada para entornos de consumo.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones de uso del modelo base original de Tencent Hunyuan antes de un despliegue comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FlagRelease/Hy4-flash-INT8-zhenwu-FlagOS
- AnythingLLM: https://anythingllm.com/
- Imagen Docker de FlagOS: `harbor.baai.ac.cn/flagrelease-public/hy4-flash-pp001-gems0.0-tree0.6.2-cxnone-plugin0.0.0-vllm0.24.0-cp312-pt210-hggc130-x64-2.1.1-rbd225:202611182115`
- Paper, blog o repositorio de FlagOS: no disponible en la informacion proporcionada.
- Demo o espacio interactivo: no disponible en la informacion proporcionada.
