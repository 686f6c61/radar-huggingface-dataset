# aclava/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16-Q3_K_M-GGUF

## Resumen

El NVIDIA Nemotron 3.5 Lightning 30B A3B es un modelo de lenguaje de gran tamano (LLM) desarrollado por NVIDIA, disenado para ofrecer un equilibrio optimo entre rendimiento y eficiencia computacional. Su arquitectura hibrida de Mezcla de Expertos (MoE) con capas intercaladas de Mamba-2 y atencion selectiva permite activar solo 3 mil millones de parametros de un total de 30 mil millones, lo que reduce drasticamente el coste de inferencia sin sacrificar calidad. Esta version concreta es una cuantizacion GGUF Q3_K_M realizada por el usuario aclava, pensada para ejecutarse en hardware de consumo mediante llama.cpp.

El modelo destaca por su soporte multilingue (6 idiomas principales) y su entrenamiento sobre datos de alta calidad curados y generados sinteticamente por NVIDIA. Su relevancia actual radica en que combina una arquitectura hibrida innovadora (Mamba-2 + MoE) con tecnicas de decodificacion especulativa, lo que lo convierte en una opcion atractiva para despliegues en produccion donde la latencia y el coste son factores criticos. La licencia OpenMDW 1.1 permite uso comercial con ciertas restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: capas intercaladas de Mamba-2 (SSM) y MoE, con capas de atencion selectiva |
| Parametros totales | 31.577.940.288 (30B) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M (esta version); el modelo original en BF16 y NVFP4 |
| Idiomas soportados | ingles, espanol, frances, aleman, italiano, japones (segun model card); el modelo base tambien entrena en 19 idiomas hablados y 43 lenguajes de programacion |
| Licencia | OpenMDW 1.1 (https://openmdw.ai/license/1-1/) |
| Formato de pesos | GGUF (esta version); safetensors en el modelo original |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida que combina capas de Mamba-2 (modelos de espacio de estados) con capas MoE y capas de atencion selectiva. Esta combinacion permite capturar dependencias de largo alcance de forma eficiente (Mamba-2) mientras se mantiene la capacidad de razonamiento complejo de los transformers con atencion. Al ser MoE con 3B parametros activos, solo una fraccion de los 30B totales se utiliza en cada token, lo que reduce el coste computacional por inferencia.

El entrenamiento se realizo sobre un corpus amplio de datos curados y generados sinteticamente por NVIDIA, segun los datasets declarados: `nvidia/nemotron-post-training-v3` y `nvidia/nemotron-pre-training-datasets`. El modelo base fue entrenado en ingles y otros 19 idiomas hablados, ademas de 43 lenguajes de programacion. La version Lightning 3.5 se publica junto con metodos de decodificacion especulativa para acelerar la generacion de texto, aunque los detalles especificos del pipeline de post-entrenamiento (RLHF, DPO, etc.) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento de proposito general en multiples idiomas.
- Soporte de codigo en 43 lenguajes de programacion (segun el modelo base).
- Capacidades multilingues en al menos 6 idiomas principales (en, es, fr, de, it, ja).
- Compatible con decodificacion especulativa para reducir la latencia (segun NVIDIA NIM).
- Arquitectura hibrida que permite inferencia eficiente con 3B parametros activos.
- No se ha confirmado soporte explicito de tool calling o function calling en la informacion disponible.
- No se mencionan capacidades de vision, audio u otras modalidades.

## Casos de uso

- Asistentes conversacionales multilingues: el modelo puede gestionar conversaciones en varios idiomas con baja latencia gracias a sus 3B parametros activos, lo que lo hace adecuado para chatbots en entornos de produccion con requisitos de respuesta rapida.
- Generacion de codigo en entornos de desarrollo: con entrenamiento en 43 lenguajes de programacion, puede asistir en tareas de autocompletado, revision de codigo y generacion de funciones, especialmente en pipelines de CI/CD donde la velocidad es importante.
- Clasificacion y extraccion de informacion: su capacidad de razonamiento y su contexto multilingue permiten procesar documentos en varios idiomas para tareas de NLP empresarial.
- Traduccion automatica ligera: al soportar 6 idiomas principales, puede servir como motor de traduccion de baja latencia en aplicaciones web o moviles.
- Razonamiento y analisis de datos: su arquitectura hibrida con Mamba-2 permite manejar secuencias largas de forma eficiente, util para resumir documentos extensos o analizar logs.
- Prototipado rapido de aplicaciones LLM: al estar disponible en GGUF, se puede ejecutar localmente en portatiles con GPU consumer, facilitando el desarrollo y pruebas de concepto sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original de NVIDIA no incluye tablas de rendimiento en los datos proporcionados, y la version GGUF no anade metricas propias. Se recomienda consultar la documentacion oficial de NVIDIA para obtener datos de MMLU, HumanEval, GSM8K u otros benchmarks.

## Requisitos de hardware

- VRAM estimada: al ser una cuantizacion Q3_K_M de un modelo de 30B parametros, el archivo GGUF pesa aproximadamente 19.8 GB (tamano del repo). Se estima que la inferencia requiere entre 8 y 12 GB de VRAM, dependiendo de la longitud de contexto y el backend utilizado.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100, o cualquier GPU con al menos 12 GB de VRAM. En CPU, puede ejecutarse con 32 GB de RAM.
- Cabe en GPUs de consumo: si, en tarjetas como RTX 3090 (24 GB) o RTX 4090 (24 GB) con margen para contexto largo. En GPUs de 12 GB (RTX 3060, RTX 4070) puede funcionar con contexto reducido.
- Opciones de despliegue: llama.cpp (CLI y servidor), llama-server, y cualquier framework compatible con GGUF (Ollama, LM Studio, etc.). Tambien se puede usar vLLM o TGI con el modelo original en BF16 o NVFP4.
- Latencia y throughput: no disponible en la informacion proporcionada, pero la arquitectura MoE con 3B activos y la decodificacion especulativa sugieren una latencia significativamente menor que un modelo denso de 30B.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron 3.5 Lightning 30B A3B | 30B | 3B | no disponible | OpenMDW 1.1 | GGUF, safetensors |
| Mixtral 8x7B | 46.7B | 12.9B | 32K | Apache 2.0 | GGUF, safetensors |
| Qwen 2.5 32B | 32B | 32B (denso) | 128K | Apache 2.0 | GGUF, safetensors |
| Llama 3.1 8B | 8B | 8B (denso) | 128K | Llama 3.1 | GGUF, safetensors |

El Nemotron 3.5 Lightning se posiciona como una alternativa mas eficiente que Mixtral 8x7B (menos parametros activos) y que modelos densos como Qwen 2.5 32B, a costa de un contexto no especificado y una licencia mas restrictiva (OpenMDW 1.1). Su principal ventaja es la velocidad de inferencia gracias a la combinacion de MoE y Mamba-2.

## Limitaciones y advertencias

- La licencia OpenMDW 1.1 puede imponer restricciones de uso comercial; es necesario revisar los terminos completos en https://openmdw.ai/license/1-1/ antes de desplegar en produccion.
- La longitud de contexto no esta especificada en la informacion disponible, lo que dificulta planificar aplicaciones que requieran ventanas largas.
- No se han publicado benchmarks oficiales en los datos proporcionados, por lo que el rendimiento real en tareas estandar es incierto.
- La cuantizacion Q3_K_M introduce perdida de precision respecto al modelo BF16 original, lo que puede afectar a tareas de razonamiento complejo o generacion de codigo.
- El modelo puede presentar sesgos y alucinaciones inherentes a los LLM entrenados con datos web; no se ha documentado un proceso especifico de mitigacion.
- Solo se confirman 6 idiomas en la model card de esta version GGUF, aunque el modelo base soporta mas; la cuantizacion puede degradar el rendimiento en idiomas menos representados.
- No se ha confirmado soporte de tool calling, lo que limita su uso en agentes autonomos que requieran interaccion con APIs externas.

## Enlaces

- Repositorio HuggingFace de esta version GGUF: https://huggingface.co/aclava/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16-Q3_K_M-GGUF
- Modelo original en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Modelo base (sin post-entrenamiento): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16
- Version GGUF alternativa de bartowski: https://huggingface.co/bartowski/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Coleccion de modelos Nemotron v3: https://huggingface.co/collections/nvidia/nvidia-nemotron-v3
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
