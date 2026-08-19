# shadowrock-io/Unlimited-OCR-Community-FP8-Dynamic

## Resumen

Unlimited-OCR-Community-FP8-Dynamic es una cuantizacion comunitaria no oficial del modelo [baidu/Unlimited-OCR](https://huggingface.co/baidu/Unlimited-OCR), realizada por ShadowRock (shadowrock-io). El modelo base, desarrollado por Baidu, es un modelo de vision-lenguaje de 3.34B parametros con arquitectura MoE estilo DeepSeek-V2, especializado en OCR de documentos de un solo paso ("one-shot long-horizon parsing"). Esta version FP8 W8A8 reduce el tamaño del checkpoint de 6.7 GB a 3.9 GB, manteniendo una paridad caracter-a-caracter (CER 0.0) con el baseline BF16 en las pruebas declaradas.

La relevancia de esta variante radica en que permite ejecutar el modelo en GPUs con soporte nativo FP8 (Ada, Hopper, Blackwell) con una degradacion nula en la precision del OCR, segun los datos del autor. Es una opcion para entornos de produccion donde el ahorro de memoria y el rendimiento de inferencia son criticos, sin sacrificar la calidad de extraccion de texto y coordenadas de grounding. La cuantizacion se aplica exclusivamente a los lineales del decoder MoE, manteniendo la torre de vision (SAM-ViT-B + CLIP-L) y el router en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE estilo DeepSeek-V2 (vision-language, OCR) |
| Parametros totales | 3.336.106.240 (3.34B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8_DYNAMIC (W8A8, per-channel pesos, activaciones dinamicas por token) |
| Idiomas soportados | Multilingue (detalle no especificado) |
| Licencia | MIT |
| Formato de pesos | safetensors (con compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Unlimited-OCR emplea una arquitectura MoE (Mixture of Experts) similar a DeepSeek-V2 para el decoder de texto, combinada con una torre de vision compuesta por SAM-ViT-B y CLIP-L DeepEncoder, junto con un proyector. El modelo completo tiene 3.34B parametros y esta disenado para parseo de documentos de largo alcance en una sola pasada.

La cuantizacion FP8-Dynamic se realizo con [llm-compressor](https://github.com/vllm-project/llm-compressor), aplicando esquema `FP8_DYNAMIC`: pesos FP8 por canal y activaciones FP8 dinamicas por token, sin necesidad de datos de calibracion (data-free). Se cuantizaron 2196 modulos del decoder MoE: 2112 expertos enrutados, 33 MLP densos/expertos compartidos, 48 modulos de atencion y 3 capas densas. La torre de vision, el `embed_tokens`, el `lm_head`, las puertas del router MoE y todas las normas se mantienen en BF16. El checkpoint resultante pasa de 6.7 GB a 3.9 GB.

## Capacidades

- OCR de documentos con grounding: extrae texto y coordenadas de cajas delimitadoras en una sola pasada.
- Parseo de documentos de largo alcance: disenado para manejar documentos extensos sin degradacion de rendimiento.
- Soporte de prompts de grounding: usa el prompt `<image>\n<|grounding|>OCR this image.` para activar el modo de anclaje.
- Capacidades multilingues: el modelo base declara soporte multilingue, aunque no se detallan los idiomas concretos.
- Inferencia eficiente con FP8: ejecucion nativa en GPUs Ada/Hopper/Blackwell con soporte FP8.
- Compatible con vLLM y transformers (con `trust_remote_code`).

## Casos de uso

- Digitalizacion de facturas: el modelo puede extraer texto y campos clave (importes, fechas, proveedores) de facturas escaneadas con coordenadas de grounding, facilitando su integracion en sistemas de contabilidad automatizada.
- Procesamiento de memorandos y actas: adecuado para convertir documentos corporativos internos en texto estructurado con bounding boxes, util para motores de busqueda empresarial.
- Extraccion de tablas y reportes: puede parsear tablas complejas en documentos tecnicos o financieros, preservando la estructura espacial de los datos.
- Archivado de documentos legales: permite digitalizar contratos y documentos legales con alta fidelidad, manteniendo la posicion de los elementos en la pagina.
- Automatizacion de tramites administrativos: en entornos gubernamentales o de seguros, puede procesar formularios y solicitudes escaneadas para extraer la informacion relevante.
- Pipelines de RAG sobre documentos: al mantener la paridad con BF16, puede integrarse en sistemas de generacion aumentada por recuperacion donde la fidelidad del OCR es critica para la calidad de las respuestas.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la model card, obtenidos con vLLM 0.26.0 en una RTX 5070 Ti (SM120), usando un conjunto de fixtures sinteticos de documentos (factura, memo, reporte de tabla):

| Metrica | Valor |
|---|---|
| CER medio vs BF16 (greedy, prompt de grounding) | 0.0 |
| CER maximo por fixture vs BF16 | 0.0 |
| Throughput de decodificacion (tok/s, greedy) | 39.36 |
| Tamaño del checkpoint | 3.9 GB (vs 6.7 GB BF16) |

La tabla comparativa incluida en la model card indica que el modelo BF16 original alcanza 45.3 tok/s en las mismas condiciones, frente a los 39.4 tok/s de la version FP8. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no se especifica un valor exacto, pero el checkpoint de 3.9 GB sugiere que puede caber en GPUs con 8 GB de VRAM o menos, dependiendo del tamaño del lote y la resolucion de imagen.
- GPUs recomendadas: arquitecturas con soporte FP8 nativo (Ada, Hopper, Blackwell). La validacion se realizo en una RTX 5070 Ti.
- Compatibilidad con GPU de consumo: probablemente si, en GPUs como RTX 4070/5070 o superiores, gracias a la cuantizacion FP8 y el tamaño reducido.
- Opciones de despliegue: vLLM (libreria principal), transformers con `compressed-tensors`, y potencialmente llama.cpp si se generan pesos GGUF (no incluidos en este repo).
- Latencia y throughput: 39.36 tok/s de decodificacion medidos en RTX 5070 Ti con vLLM 0.26.0.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamaño checkpoint | Licencia | Notas |
|---|---|---|---|---|---|
| baidu/Unlimited-OCR (BF16) | 3.34B | BF16 | 6.7 GB | MIT | Modelo base original |
| Unlimited-OCR-Community-FP8-Dynamic (este) | 3.34B | FP8 W8A8 | 3.9 GB | MIT | Cuantizacion comunitaria, CER 0 vs BF16 |
| sahilchachra/unlimited-ocr-mxfp8-mlx | 3.34B | MXFP8 | no disponible | no disponible | Variante para MLX (Apple Silicon) |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (OCR de documentos con MoE) en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion no oficial: no es una publicacion de Baidu; es un trabajo comunitario de ShadowRock. El soporte y mantenimiento dependen del autor.
- Precision FP8: aunque la validacion muestra CER 0.0 en los fixtures declarados, no hay garantia de paridad en todos los casos de uso posibles. Se recomienda validar con datos propios antes de desplegar en produccion.
- Longitud de contexto no documentada: no se especifica la ventana de contexto maxima, lo que limita la planificacion de despliegues con documentos muy extensos.
- Dependencia de `trust_remote_code`: el uso con transformers requiere ejecutar codigo remoto, con los riesgos de seguridad asociados.
- Configuracion de cuantizacion especifica: el archivo `quantization_config.ignore` usa patrones regex prefijo-agnosticos necesarios para vLLM; reemplazarlo puede romper la inferencia.
- Sin benchmarks estandar: no hay resultados en MMLU, HumanEval u otros benchmarks generales; la evaluacion se limita a fixtures sinteticos de OCR.
- Rendimiento de decodificacion inferior al BF16: 39.4 tok/s frente a 45.3 tok/s en las pruebas declaradas, una reduccion de aproximadamente el 13 %.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shadowrock-io/Unlimited-OCR-Community-FP8-Dynamic
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR
- Variante NVFP4: https://huggingface.co/shadowrock-io/Unlimited-OCR-Community-NVFP4
- Variante MLX (sahilchachra): https://huggingface.co/sahilchachra/unlimited-ocr-mxfp8-mlx
- Repositorio fuente de cuantizacion: https://git.srk.rest/shadowrock/uocr-quant
- Evidencia de evaluacion: https://huggingface.co/shadowrock-io/Unlimited-OCR-Community-FP8-Dynamic/tree/main/evidence
- Articulo en Medium sobre Unlimited-OCR: https://medium.com/@yashkamra11102004/unlimited-ocr-baidu-just-solved-the-problem-every-document-ai-model-was-quietly-ignoring-6a25f401d44d
- Repositorio GitHub de Unlimited-OCR: https://github.com/DorianGallo/unlimted-OCR
- README en GitHub (aarjav): https://github.com/aarjav/unlimited-ocr/blob/main/README.md
