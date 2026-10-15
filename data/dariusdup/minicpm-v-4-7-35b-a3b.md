# Dariusdup/MiniCPM-V-4.7-35B-A3B

## Resumen

MiniCPM-V 4.7 35B-A3B es un modelo multimodal (image-text-to-text) de tipo Mixture of Experts desarrollado por OpenBMB, la organizacion responsable de la familia MiniCPM. Se trata de la primera variante MoE de la serie MiniCPM-V y combina un encoder visual SigLIP con un backbone de lenguaje Qwen3.5, sumando unos 35.212.875.824 parametros totales con aproximadamente 3B parametros activos por token (de ahi la denominacion A3B). El repositorio consultado corresponde a una copia subida por el usuario Dariusdup, mientras que la publicacion original es de OpenBMB.

Su relevancia actual radica en que apunta a un objetivo poco habitual en modelos MoE de este tamano: la inferencia fluida en dispositivo (on-device) sin degradar la calidad. Segun la model card, integra la tecnica Lookahead Expert Scheduling (LES), cuantizacion por capas de grano fino y muestreo especulativo DSpark, lo que permite alcanzar velocidades de decodificacion de mas de 13 tokens/s con solo 3 GB de memoria en un iPhone 17 Pro Max. Ademas, el modelo soporta compresion de tokens visuales mixta 4x/16x, lo que permite ajustar el equilibrio entre detalle visual y coste de inferencia.

La licencia es Apache-2.0, lo que facilita su uso comercial y su integracion en productos. La fecha de creacion del repositorio consultado es el 14 de octubre de 2026 y la liberacion original se produjo el 12 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal MoE (encoder visual SigLIP con merger de atencion de ventana + backbone de lenguaje Qwen3.5) |
| Parametros totales | 35.212.875.824 (~35B) |
| Parametros activos | ~3B (variante A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF, BNB, AWQ, GPTQ y FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 70,6 GB) |

## Arquitectura y entrenamiento

MiniCPM-V 4.7 35B-A3B es un modelo multimodal de arquitectura MoE. Segun la documentacion de Transformers, empareja un encoder visual SigLIP que incorpora un merger basado en atencion de ventana con un backbone de lenguaje Qwen3.5, y admite dos modos de submuestreo visual (downsampling): 4x y 16x. La compresion de tokens visuales se realiza de forma temprana dentro del propio encoder visual, siguiendo la tecnica intra-ViT early compression de LLaVA-UHD v4, lo que reduce el computo en las capas posteriores del encoder y, en consecuencia, el coste de inferencia. Ademas de la compresion 4x/16x, el modelo soporta compresion mixta de tokens visuales, de modo que el desarrollador puede elegir entre mayor detalle visual o menor coste segun la tarea.

A nivel de inferencia, la model card destaca tres tecnicas combinadas para habilitar un MoE de gran tamano en dispositivo sin sacrificar calidad: Lookahead Expert Scheduling (LES), que emplea prediccion de routing entre capas para precargar expertos que probablemente necesitara la capa siguiente y solapa su computo con la carga de los expertos restantes; cuantizacion por capas de grano fino; y muestreo especulativo DSpark. Tambien se menciona Self-Replay Fine-Tuning (SRFT), un metodo de ajuste fino orientado a extender capacidades a bajo coste reduciendo el olvido de las capacidades previas. No se proporcionan en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Comprension de imagen unica, multiples imagenes y video.
- Generacion de texto a partir de entradas de imagen y texto (pipeline image-text-to-text).
- Compresion de tokens visuales configurable en modo 4x y 16x, y modo mixto, para equilibrar detalle y coste.
- Conversacion multiturno (tag "conversational").
- Inferencia en dispositivo en iOS, Android y HarmonyOS.
- Soporte day-0 para plataformas de chip de Rockchip, Houmo, Intel, AMD y Arm.
- Integracion con frameworks de inferencia como SGLang, vLLM, llama.cpp y Ollama.
- Integracion con frameworks de ajuste fino como SWIFT y LLaMA-Factory.
- No hay informacion disponible sobre soporte de tool calling / function calling, capacidades de agentes o multilingues especificas.

## Casos de uso

- Asistente visual en movil: el modelo puede ejecutarse en dispositivo en iOS, Android y HarmonyOS con alrededor de 3 GB de memoria en un iPhone 17 Pro Max y mas de 13 tokens/s, lo que habilita asistentes que describen, resumen o responden preguntas sobre imagenes sin enviar datos a la nube.
- Analisis de documentos con OCR: dado su resultado en OCRBench (91,20), resulta adecuado para extraer texto de capturas, facturas o formularios y responder preguntas sobre su contenido.
- Comprension de video en local: gracias al soporte de video y a la compresion de tokens visuales, puede resumir o indexar fragmentos de video en equipos con recursos limitados.
- Despliegue en hardware embebido y de borde: el soporte day-0 de plataformas Rockchip, Houmo, Intel, AMD y Arm permite integrarlo en dispositivos de borde y placas industriales.
- Asistencia multimodal en atencion al cliente: puede gestionar conversaciones multiturno donde el usuario adjunta imagenes (productos defectuosos, capturas de error) y el modelo responde en el mismo hilo.
- Procesamiento por lotes en servidor con vLLM o SGLang: al ser un MoE con solo ~3B parametros activos, el coste de computo por token es bajo, lo que favorece el alto throughput en GPU siempre que la memoria aloje los pesos completos.
- Ajuste fino especifico de dominio: mediante SRFT, LLaMA-Factory o SWIFT, se puede adaptar el modelo a un vertical concreto reduciendo el olvido de capacidades previas.
- Cuantizacion y despliegue ligero: al ofrecer variantes GGUF, BNB, AWQ, GPTQ y FP8, es posible servirlo en llama.cpp u Ollama para entornos sin GPU.

## Benchmarks y rendimiento

| Benchmark | MiniCPM-V 4.7 35B-A3B | Notas |
|---|---|---|
| MMStar | 80,67 | Segun fuente externa (datalearner) |
| OCRBench | 91,20 | Segun fuente externa (datalearner) |
| MMMU | 80,22 | Segun fuente externa (datalearner) |

Segun la model card, en modo Instruct la variante 35B-A3B obtiene una puntuacion global superior en menos tiempo de inferencia que Qwen3.6 35B-A3B. En cuanto a eficiencia on-device, en un iPad Pro M4 (16 GB) con descarga de expertos desde SSD, la decodificacion pasa de 2,97 a 17,39 tokens/s con la combinacion de LES, cuantizacion mixta por capas y DSpark.

## Requisitos de hardware

- Peso de los pesos: el repositorio safetensors ocupa 70,6 GB, coherente con los ~35B parametros en precision alta (BF16/FP16).
- VRAM estimada para inferencia (calculada a partir del numero de parametros, no confirmada por el autor): ~70 GB en FP16/BF16, ~35 GB en FP8, ~18-20 GB en cuantizacion de 4 bits.
- Al tener solo ~3B parametros activos, el coste de computo por token es bajo, pero la memoria debe alojar los pesos de todos los expertos salvo que se use descarga desde SSD.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano de pesos, un despliegue completo en precision alta requiere GPU de clase A100/H100 de 80 GB; con FP8 o 4 bits podria caber en GPUs de 24-48 GB.
- Consumer GPU: con cuantizacion 4 bits los ~18-20 GB podrian caber en una RTX 4090 (24 GB); en precision alta no cabe en GPU de consumo.
- Inferencia en dispositivo: funciona con ~3 GB de memoria en iPhone 17 Pro Max y con 16 GB en iPad Pro M4 usando descarga de expertos desde SSD.
- Opciones de despliegue: SGLang, vLLM, llama.cpp, Ollama; ajuste fino con SWIFT y LLaMA-Factory.
- Latencia y throughput: mas de 13 tokens/s en iPhone 17 Pro Max (3 GB); 17,39 tokens/s en iPad Pro M4 (16 GB, con offload a SSD).

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 35B-A3B | 35B totales / ~3B activos | MoE multimodal | no disponible | Apache-2.0 | Puntuacion global superior en menos tiempo que Qwen3.6 35B-A3B (segun model card) |
| Qwen3.6 35B-A3B | 35B totales / ~3B activos | MoE | no disponible | no disponible | Referencia de comparacion citada por la model card |
| MiniCPM-V 4.7 (variante 1B) | 1B | Multimodal denso | no disponible | Apache-2.0 | Variante ligera de la misma familia |

No se dispone de datos suficientes en la informacion proporcionada para completar una comparativa mas amplia en terminos de contexto, rendimiento detallado o disponibilidad.

## Limitaciones y advertencias

- No se han publicado en la informacion disponible datos sobre sesgos conocidos del modelo.
- Riesgo de alucinacion: no se documenta explicitamente, pero es inherente a los modelos generativos multimodales; conviene validar las salidas en tareas criticas.
- Idiomas soportados: no disponibles; no se puede confirmar el alcance multilingue.
- Longitud de contexto: no disponible, lo que dificulta planificar usos con entradas muy largas (documentos extensos o videos largos).
- Restricciones de licencia: la licencia es Apache-2.0, permisiva y apta para uso comercial; conviene verificar los terminos exactos en el repositorio original de OpenBMB.
- El despliegue en dispositivo depende de tecnicas concretas (LES, cuantizacion por capas, DSpark) y de hardware especifico; los resultados de velocidad citados corresponden a dispositivos concretos (iPhone 17 Pro Max, iPad Pro M4) y no son extrapolables a cualquier equipo.
- Para despliegues en servidor, el modelo completo en precision alta ocupa 70,6 GB, lo que exige memoria considerable salvo que se aplique cuantizacion.

## Enlaces

- Repositorio consultado: https://huggingface.co/Dariusdup/MiniCPM-V-4.7-35B-A3B
- Modelo original: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Documentacion de Transformers: https://huggingface.co/docs/transformers/main/model_doc/minicpmv4_7
- Variante DSpark: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-DSpark
- Repositorio GitHub: https://github.com/openbmb/MiniCPM-V
- Repositorio llama.cpp-omni (LES): https://github.com/OpenBMB/llama.cpp-omni
- Repositorio LLaVA-UHD v4: https://github.com/THUMAI-Lab/LLaVA-UHD-v4
- Documentacion de despliegue MiniCPM-o: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/deployment_en.md
- Documentacion MiniCPM-V 4.7: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/minicpm_v4dot7_en.md
- API: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/api.md
- Cookbook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo en vivo: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.7-Demo
- Blog Self-Replay Fine-Tuning: https://openbmb.cn/en/blog/self-replay-fine-tuning
- Analisis externo (explainx): https://www.explainx.ai/blog/minicpm-v-4-7-35b-a3b-on-device-moe-iphone-lookahead-expert-scheduling-2026
- Resultados de evaluacion (datalearner): https://www.datalearner.com/ai-models/pretrained-models/minicpm-v-4-7-35b-a3b
- Noticia de lanzamiento (aicoder): https://aicoder.com/news/news-20261013-openbmb-minicpm-v-4-7-35b-a3b-on-device-moe
