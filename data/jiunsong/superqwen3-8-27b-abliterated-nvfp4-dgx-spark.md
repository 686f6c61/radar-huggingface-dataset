# Jiunsong/SuperQwen3.8-27b-abliterated-NVFP4-DGX-Spark

## Resumen

SuperQwen3.8-27b-abliterated-NVFP4-DGX-Spark es una edición de un solo nodo del modelo Qwen3.8-27B, desarrollada por Jiunsong, que combina una cuantización NVFP4 W4A4 con grupo 16 y el cabezal de decodificación especulativa MTP (Multi-Token Prediction) con K=5. Está diseñado para ejecutarse en un único NVIDIA DGX Spark (GB10) con TP=1, ofreciendo una velocidad de decodificación C1 de 27,13 tokens por segundo mediana, sin sacrificar las capacidades multimodales, de razonamiento, tool calling o contexto largo del modelo base. Además, incorpora un proceso de "abliteración" que elimina los rechazos ante peticiones benignas sensibles, y un template de razonamiento acotado que evita la repetición o el "overthinking".

El modelo es un checkpoint derivado de Qwen/Qwen3.8-27B, un modelo denso multimodal de 27B parámetros (aunque el safetensors de este repositorio registra 16,7B, probablemente por la cuantización de los tensores). Su relevancia radica en ofrecer una alternativa de alto rendimiento para despliegues locales en hardware de consumo profesional, con una ventana de contexto nativa verificada de 250.046 tokens y soporte para imágenes y texto. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language), basado en Qwen3.8-27B |
| Parametros totales | 16.703.361.232 (segun safetensors; el modelo base declara 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 250.046 tokens nativos verificados; perfil de servicio hasta 262.144 tokens |
| Tipos de cuantizacion | NVFP4 W4A4 con grupo 16 (pesos y activaciones); componentes protegidos en BF16 (vision, MTP, conv1d, lm_head); KV cache en FP8 |
| Idiomas soportados | Ingles (en) y coreano (ko) segun la model card; el modelo base puede soportar mas, pero no se documenta |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (5 shards NVFP4 empaquetados + 1 shard BF16 protegido para MTP) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso multimodal de Alibaba que integra un vision tower y un cabezal de prediccion multiple de tokens (MTP) para decodificacion especulativa. Sobre este base, Jiunsong aplico un proceso de "supertune" que incluye abliteracion (eliminacion de los rechazos del modelo ante peticiones sensibles pero benignas) y un template de razonamiento acotado en dos revisiones, que limita el esfuerzo de razonamiento a niveles low, medium y xhigh con guardas de detencion ante repeticiones o reinicios. La cuantizacion NVFP4 W4A4 con grupo 16 se aplica a las capas lineales elegibles, mientras que los componentes criticos (vision tower, cabezal MTP, conv1d y lm_head) se mantienen en BF16 exacto para preservar la calidad. El entrenamiento se basa en el checkpoint oficial Qwen3.8-27B en su commit 1d4bf0f2, y los tensores empaquetados se heredan de la version NVFP4-2xDGX, cambiando solo el perfil de lanzamiento y el template. No se proporcionan detalles sobre el dataset de fine-tuning ni sobre el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: soporta tareas de lenguaje general, incluyendo matematicas, logica y analisis, con un modo de razonamiento acotado que evita la sobre-elaboracion.
- Multimodal (imagen-texto): acepta imagenes como entrada junto con texto, lo que permite descripcion visual, OCR, analisis de documentos y respuestas basadas en contenido visual.
- Tool calling / function calling: integrado, permite al modelo invocar herramientas externas en flujos de agente.
- Agentes y razonamiento multi-paso: compatible con pipelines de agente gracias a su soporte de tool calling y contexto largo.
- Contexto largo: ventana nativa de 250.046 tokens verificada, con recuperacion de aguja oculta en esa longitud.
- Decodificacion especulativa: cabezal MTP propio con K=5, que acelera la generacion sin degradar la calidad.
- Sin rechazos forzados: el proceso de abliteracion elimina las negativas ante peticiones benignas sensibles (0/8 en la suite de pruebas).
- Idiomas: ingles y coreano segun la documentacion; el modelo base podria soportar mas, pero no se garantiza.

## Casos de uso

- Atencion al cliente automatizada: con 250K tokens de contexto y soporte de tool calling, puede gestionar conversaciones multi-turno con historial largo y consultar bases de conocimiento externas en tiempo real, manteniendo respuestas coherentes y sin rechazos ante peticiones de soporte.
- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD para autocompletar o revisar codigo, aprovechando su capacidad de razonamiento y su velocidad de decodificacion en un solo DGX Spark, ideal para entornos con recursos limitados.
- Analisis de documentos con imagenes: al ser multimodal, puede procesar facturas, contratos o capturas de pantalla, extrayendo informacion estructurada y respondiendo preguntas sobre el contenido visual y textual.
- Agentes autonomos de ofimatica: con tool calling y razonamiento multi-paso, puede automatizar tareas como redaccion de correos, generacion de informes o gestion de calendarios, ejecutandose localmente en un nodo Spark.
- Razonamiento cientifico y matematico: su modo de razonamiento acotado permite resolver problemas complejos sin divagar, util en entornos educativos o de investigacion donde se requieren respuestas concisas y correctas.
- Despliegue en edge profesional: al caber en un unico DGX Spark con TP=1, es adecuado para prototipado rapido o inferencia en local sin depender de la nube, manteniendo privacidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card proporciona datos de rendimiento de inferencia en hardware objetivo:

| Metrica | Valor |
|---|---|
| C1 decode (mediana) | 27,1270 tok/s |
| C1 decode (rango de ensayos) | 26,6789 - 27,3181 tok/s |
| TTFT (mediana) | 0,460 s |
| Hardware | 1x NVIDIA DGX Spark (GB10), TP=1 |
| Configuracion | Prompt de 292 tokens tras formateo, generacion de 512 tokens, thinking desactivado |

Tambien se reportan las pruebas de calidad interna: 7/8 en capacidades (paired-parent floor), 0/8 en rechazos benignos sensibles, 36/36 en razonamiento acotado, y recuperacion de aguja oculta en 250.046 tokens.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa unos 19,2 GiB en disco; con KV cache FP8 y perfil de servicio de 262.144 tokens, se recomienda al menos 128 GB de memoria unificada (la dotacion del DGX Spark).
- GPU recomendada: NVIDIA DGX Spark (GB10) con TP=1; no se especifican otras GPUs, pero por el tamano del modelo y la cuantizacion NVFP4, podria caber en GPUs con 48 GB o mas (por ejemplo, RTX 6000 Ada, A6000), aunque sin la optimizacion especifica del perfil Spark.
- Si cabe en consumer GPU: no se indica; el modelo esta pensado para el DGX Spark, que no es una GPU de consumo. Con cuantizaciones mas agresivas (por ejemplo, GGUF) podria intentarse en GPUs de 24 GB, pero no esta documentado.
- Opciones de despliegue: vLLM (con backport especifico para NVFP4 y MTP), llama.cpp o MLX-LM (aunque se reporta que MLX-LM 0.31.3 no carga el DFlash como draft convencional). Tambien es compatible con endpoints via la integracion de compressed-tensors.
- Latencia y throughput: C1 decode mediana de 27,13 tok/s y TTFT de 0,46 s en el DGX Spark; para concurrencia no se proporcionan datos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| SuperQwen3.8-27b-abliterated-NVFP4-DGX-Spark | 16,7B (safetensors) / 27B base | 250K | NVFP4 W4A4 G16 | Apache-2.0 | Optimizado para un solo DGX Spark, MTP K=5, abliterated |
| Qwen/Qwen3.8-27B (base) | 27B | 250K (segun repo oficial) | BF16/FP8 | Apache-2.0 | Modelo original, sin cuantizar, sin abliteracion |
| SuperQwen3.8-27b-abliterated (sin NVFP4) | 27B | 250K | BF16 | Apache-2.0 | Version sin cuantizar del mismo autor, requiere mas VRAM |
| incoai/Qwen3.8-27B-DFlash2 | 27B | 250K | DFlash2 | Apache-2.0 | Alternativa con decodificacion especulativa DFlash, pero no compatible con este release (0 tokens aceptados) |

La comparativa se basa en datos publicos; no se dispone de benchmarks de calidad comparativos entre estos modelos.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede generar informacion incorrecta o inventada, especialmente en tareas de razonamiento complejo o con entradas ambiguas; no se han realizado evaluaciones de sesgo especificas.
- Abliteracion: la eliminacion de rechazos puede hacer que el modelo responda a peticiones que otros modelos rechazarian; esto implica un riesgo de uso indebido, aunque la suite de pruebas indica que no hay rechazos forzados en peticiones benignas sensibles.
- Idiomas limitados: solo se garantiza ingles y coreano; otros idiomas pueden funcionar de forma suboptima.
- Contexto largo: aunque se verifica 250K tokens, el rendimiento en contextos extremadamente largos puede degradarse en calidad o velocidad; el perfil de servicio llega a 262.144 tokens, pero no se garantiza la misma calidad.
- Dependencia de hardware especifico: el rendimiento prometido (27 tok/s) solo se mide en un DGX Spark; en otras GPUs puede variar significativamente.
- Compatibilidad de software: requiere vLLM con backport para NVFP4 y MTP; otras herramientas como MLX-LM no cargan correctamente el DFlash como draft, limitando las opciones de despliegue.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B tambien es Apache-2.0, sin restricciones adicionales; aun asi, el usuario debe revisar los terminos de las dependencias.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Jiunsong/SuperQwen3.8-27b-abliterated-NVFP4-DGX-Spark
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B (AlibabaCloud-Official): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Version sin cuantizar del autor: https://huggingface.co/Jiunsong/SuperQwen3.8-27b-abliterated
- Version NVFP4-2xDGX (origen de los tensores): https://huggingface.co/Jiunsong/SuperQwen3.8-27b-abliterated-NVFP4-2xDGX
- Referencia de benchmark C1 (sparkDash): https://github.com/MiaAI-Lab/sparkDash
- Tutorial de despliegue en DGX Spark (tercero): https://github.com/Deep-AI-Evo/qwen3.8-27b-nvfp4-dgx-spark-tutorial
- Guia local de Qwen3.8-27B (Substack): https://linas.substack.com/p/qwen3-8-27b-local-guide
