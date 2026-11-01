# FlagRelease/MiniCPM-OCR-Jev-BF16-arm-FlagOS

## Resumen

MiniCPM-OCR Jev es un modelo de clasificación de secuencias de 2,21 mil millones de parámetros desarrollado por ModelBest y OpenBMB, distribuido en este repositorio por FlagRelease como un build optimizado para CPU ARM dentro del ecosistema FlagOS. No es un generador de texto OCR: es un "value head" de dos clases que evalúa la consistencia entre una imagen original, un texto candidato producido por un motor OCR y una imagen renderizada por separado, devolviendo una probabilidad de que la transcripción sea fiable. Funciona, por tanto, como un inspector de calidad que se acopla a pipelines OCR existentes para señalar qué documentos requieren revisión humana.

El modelo se construye sobre el backbone de texto Qwen3.5 (24 capas, dimensión oculta 2048) con un componente de visión y una cabeza de puntuación BF16 de [2, 2048] sin sesgo ni LM head. La arquitectura declarada es `Qwen3_5ForSequenceClassification`, con pooling sobre el último token no padding y salida de dos logits transformados mediante softmax FP32. El umbral por defecto de decisión es 0,5606135129928589, donde la etiqueta 1 indica consistencia.

Su relevancia actual reside en dos factores: por un lado, ataca el problema práctico de la verificación posterior al OCR, que en flujos documentales reales sigue consumiendo horas de revisión manual; por otro, el paquete demuestra despliegue en CPU ARM sin GPU, con inferencia nativa en un Mac M5 Pro y en un CIX P1 aarch64, lo que habilita inspección de calidad en el propio dispositivo. Según la model card, su AUROC global en JevOCRBench alcanza 0,936, frente a 0,938 de Qwen3.5-397B-A17B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForSequenceClassification (backbone de texto Qwen3.5 + vision + value head) |
| Parametros totales | 2.213.245.760 elementos tensoriales (~2,21B, incluyendo vision y cabeza de score) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens de entrada, dos imagenes y una secuencia; sin decodificacion autoregresiva |
| Tipos de cuantizacion | BF16 sin cuantizar; valores BF16 pueden ampliarse a FP32 para acumulacion |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un clasificador de secuencias construido sobre el backbone de texto Qwen3.5, con 24 capas y tamaño oculto de 2048, al que se añade un componente de visión y una cabeza de valor BF16 con forma [2, 2048] y sin sesgo. No dispone de LM head ni genera tokens: la salida se obtiene mediante pooling del último token no padding y una softmax en FP32 sobre dos logits, que produce directamente P(consistente). El checkpoint declarado es `qwen35_2b_l2_triple_value_checkpoint-3000`, lo que sugiere un entrenamiento orientado a evaluar tripletas (imagen original, texto OCR candidato, imagen renderizada).

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible. Sí se especifica el contrato de precisión: los pesos del modelo y de visión se mantienen en BF16 original sin cuantización durante la carga, y la cabeza de score conserva su ruta de ejecución sin cuantizar. El paquete está adaptado al stack FlagOS, con motor vLLM 0.24.0+cpu, vLLM-Plugin-FL y FlagGems, e incluye rutas específicas para ARM: en Mac se usan 18 hilos de framework y 8 workers SME GEMM con linears BF16 SME/TLE Raw, atención de visión en Triton e integración GDN en CPU; en CIX P1 se emplean ocho hilos de framework, linears nativos oneDNN/ACL sin cuantizar y rutas FlagGems para visión y GDN.

## Capacidades

- Evaluación de consistencia OCR: puntúa si el texto candidato generado por un motor OCR se corresponde con la imagen original y con una imagen renderizada por separado.
- Clasificación binaria con probabilidad calibrada: devuelve P(consistente) mediante softmax FP32 y aplica un umbral por defecto de 0,5606135129928589.
- Inspección de calidad documental: actúa como capa de verificación sobre otros modelos OCR, señalando contenido que requiere revisión humana.
- Procesamiento de dos imágenes y una secuencia de texto en una sola pasada, con hasta 1024 tokens de entrada.
- Soporte multilingüe limitado a chino e inglés según la model card.
- Inferencia en CPU ARM sin GPU, con rutas nativas para macOS arm64 y Linux aarch64.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto; no es un modelo de propósito general.

## Casos de uso

- Verificación de pipelines OCR en producción: se coloca después del motor OCR y antes de la publicación del texto extraído, de modo que cada página se puntúa y solo las que caen por debajo del umbral pasan a revisión humana. Es adecuado porque su salida es una probabilidad calibrada y no requiere decodificación autoregresiva.
- Digitalización de archivos históricos y escaneos degradados: al comparar la imagen original con la renderización del texto candidato, detecta discrepancias típicas de páginas curvadas, fotografías de pantalla o documentos re-fotografiados.
- Extracción de tablas y fórmulas en entornos regulados: el modelo permite auditar automáticamente la fidelidad de la transcripción de estructuras complejas antes de incorporarlas a sistemas financieros o legales.
- Despliegue en dispositivos de borde: con inferencia en CPU ARM (Mac M5 Pro o CIX P1 con ocho núcleos Cortex-A720), permite inspección de calidad en equipos sin GPU, útil en oficinas remotas o entornos con restricciones de hardware.
- Control de calidad en procesos de atención al cliente con documentación adjunta: valida la transcripción de facturas, contratos o formularios enviados por usuarios antes de alimentar sistemas downstream.
- Enrutamiento inteligente de revisiones: combinado con un umbral configurable, permite clasificar lotes documentales en "aceptados automáticamente" y "requieren humano", reduciendo la carga de revisión manual según la tolerancia al error del negocio.
- Monitorización de deriva de motores OCR: al puntuar muestras periódicas con un modelo fijo, se detectan degradaciones en el motor OCR subyacente tras cambios de versión o de preprocesado.

## Benchmarks y rendimiento

| Benchmark | MiniCPM-OCR Jev (2B) | Qwen3.5-397B-A17B | MiniCPM-OCR 1.0 (1,3B) |
|---|---|---|---|
| JevOCRBench (AUROC global) | 0,936 | 0,938 | no disponible |
| Real5-OmniDocBench | no disponible | no disponible | 93,68 |

Según la model card, el build FlagOS de Jev alcanza el 98,7 % del throughput de cómputo nativo de NVIDIA en la misma plataforma. En dispositivos ARM de borde, Jev completa una evaluación de bloque de página en 1,20 segundos de media usando únicamente la CPU del M5. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general, lo cual es coherente con que el modelo no sea un generador de texto.

## Requisitos de hardware

- VRAM estimada: no aplica para el build publicado, que está diseñado para inferencia en CPU; en BF16 los pesos ocupan aproximadamente 4,4 GB en disco (tamaño del repo).
- GPU recomendadas: no disponibles para este paquete concreto; la model card describe exclusivamente rutas de CPU (Mac M5 Pro y CIX P1 aarch64). El ecosistema FlagOS cubre además T-Head, NVIDIA, Huawei Ascend, Hygon, KUNLUNXIN, MetaX, Moore Threads, Tsingmicro, Iluvatar CoreX, Xiwang y CIX para la familia MiniCPM-OCR, pero no se detallan requisitos de VRAM.
- Cabe en consumer GPU: no disponible en la información proporcionada; el foco del release es CPU ARM.
- Opciones de despliegue: vLLM 0.24.0+cpu con vLLM-Plugin-FL y FlagGems; PyTorch 2.11.0 (CPU) y FlagTree-CPU/Triton CPU 3.7.2. Se requiere un fork de Transformers 5.19.0.dev0, huggingface_hub 2.3.0, tokenizers 0.23.3 y accelerate 1.15.0 para las dependencias específicas de OCR.
- Almacenamiento: reservar unos 25 GiB libres para una instalación offline que incluya archivos y espacio temporal de importación Docker.
- Latencia y throughput: 1,20 s por evaluación de bloque de página en CPU M5; 98,7 % del throughput nativo de NVIDIA en el build FlagOS sobre la misma plataforma. No se especifican cifras de throughput absoluto en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | AUROC JevOCRBench |
|---|---|---|---|---|---|
| MiniCPM-OCR Jev (este) | ~2,21B | 1024 tokens, 2 imagenes | Clasificacion de consistencia OCR | apache-2.0 | 0,936 |
| Qwen3.5-397B-A17B | 397B totales (17B activos, MoE) | no disponible | Generacion multimodal de proposito general | no disponible | 0,938 |
| MiniCPM-OCR 1.0 | 1,3B | no disponible | Parsing de documentos y reconocimiento de texto | no disponible | no aplica (es generador OCR) |

La comparación relevante es con Qwen3.5-397B-A17B: Jev queda a dos milésimas de AUROC con dos órdenes de magnitud menos de parámetros, lo que justifica su uso como verificador ligero. Frente a MiniCPM-OCR 1.0, la diferencia es funcional: 1.0 genera la transcripción y Jev la audita; se pueden encadenar en un mismo pipeline.

## Limitaciones y advertencias

- No es un modelo OCR generativo: no transcribe texto ni extrae contenido por sí mismo, solo puntúa la consistencia de una hipótesis existente.
- Contexto limitado a 1024 tokens de entrada y dos imágenes por secuencia; documentos largos requieren segmentación previa.
- Idiomas soportados restringidos a chino e inglés según la model card; el rendimiento en otros idiomas no está documentado.
- Riesgo de falsos positivos y negativos inherente a un clasificador binario; el umbral por defecto (0,5606) debe calibrarse según la tolerancia al error del caso de uso.
- Sesgos no documentados: la model card no describe la composición del dataset de entrenamiento ni análisis de sesgo por tipo de documento, idioma o calidad de imagen.
- La distribución de pesos no está incluida en el runtime ni en la imagen Docker; deben obtenerse los archivos de release del propietario, y no se asume una URL pública verificada en ModelScope.
- Los directorios de modelo y procesadores de los dos checkpoints no son intercambiables; mezclarlos produce resultados inválidos.
- Los commits de FlagGems y vLLM-Plugin-FL son snapshots locales de release, no cambios fusionados upstream; la reproducibilidad depende de fijar esas versiones exactas.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones de los artefactos de runtime y de los pesos distribuidos por el propietario del release.

## Enlaces

- HuggingFace: https://huggingface.co/FlagRelease/MiniCPM-OCR-Jev-BF16-arm-FlagOS
- Repositorio FlagOS (organización): https://huggingface.co/FlagRelease
- Model card de referencia de MiniCPM-OCR (familia): no disponible en la información proporcionada
- Paper o blog técnico de MiniCPM-OCR: no disponible en la información proporcionada
- Repositorio de FlagGems: no disponible en la información proporcionada
- Repositorio de vLLM-Plugin-FL: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada
