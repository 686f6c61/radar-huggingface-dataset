# Phips/HEART

## Resumen

HEART (Hybrid Efficient Attention with Rank-factorized bias Transformer) es una arquitectura de superresolucion de imagen (SISR, single image super-resolution) y restauracion de imagen en color real, desarrollada por Philip Hofmann (usuario Phips en Hugging Face) como parte de la suite BODY. El modelo resuelve el problema de escalar imagenes de baja calidad (incluyendo fotos reales con ruido, compresion y degradaciones) manteniendo un coste de entrenamiento e inferencia contenido, y esta pensado explicitamente para uso real en lugar de para competir en leaderboards de benchmarks.

La arquitectura combina atencion hibrida con un sesgo factorizado por rango (RIB, Rank-factorized bias) que sustituye las mascaras de atencion y las tablas de sesgo de posicion por un producto escalar, lo que la hace compatible con FlashAttention y SDPA. El modelo se distribuye con pesos entrenados para factores de escala 4x y 2x, exporta a ONNX dinamico directamente y se ha entrenado integramente en una unica GPU de consumo (RTX 3060 de 12 GB). La model card indica que los pesos liberados estan verificados con traiNNer-redux para entrenamiento y con ONNX Runtime para inferencia.

Es relevante ahora porque ofrece una alternativa de calidad de escritorio/servidor con un flujo de trabajo simple (un solo fichero de arquitectura, exportacion ONNX sin pasos de fusion de checkpoints, entrenamiento estable en bf16 AMP) y con licencia Apache 2.0, lo que facilita su integracion en pipelines de restauracion de imagen y su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida y sesgo factorizado por rango (HEART: Hybrid Efficient Attention with Rank-factorized bias) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no aplica (modelo de vision image-to-image; entrada RGB de cualquier tamano con H/W dinamicos) |
| Tipos de cuantizacion | no disponible (se mencionan ejecucion en bf16 y exportacion a ONNX; no se detallan esquemas de cuantizacion) |
| Idiomas soportados | en (segun metadatos; el modelo procesa imagenes, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoints de entrenamiento), ONNX (dinamico, para inferencia); compatible con TensorRT segun el autor (no verificado) |

## Arquitectura y entrenamiento

HEART es un transformer de superresolucion con atencion hibrida. Su innovacion principal es el modulo RIB (Rank-factorized bias), que reemplaza las mascaras de atencion y las tablas de sesgo de posicion por un producto escalar de bajo rango. Esto elimina las consultas a tablas de sesgo y permite que la atencion sea compatible con kernels optimizados como FlashAttention y SDPA. El autor indica que la red usa i-LN (normalizacion por instancia) para mantener estable el entrenamiento en bf16 con AMP sin necesidad de trucos en fp32. La arquitectura es de fichero unico en PyTorch puro y se registra automaticamente en traiNNer-redux al copiar `heart_arch.py` en el directorio de arquitecturas.

En cuanto a los datos, los modelos se entrenan con la cadena completa de degradaciones de Real-ESRGAN (modelos OTF), lo que les permite restaurar fotos reales y no solo downsamples bicubicos limpios. El dataset asociado es `Phips/lucid-cc0-v2-hc-512`. La model card detalla reglas de entrenamiento concretas: `lq_size` debe ser multiplo de 32 (recomienda 96), con `noise_range: [1,15]` y `noise_range2: [1,10]`, y lote de 2 en una GPU de 12 GB. No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en un modelo de vision de este tipo). Todos los modelos HEART se entrenaron en una unica RTX 3060 de 12 GB.

## Capacidades

- Superresolucion de imagen con factores de escala 4x (modelos `heart_4x_*`) y 2x (`heart_2x`).
- Restauracion de imagenes reales: los modelos OTF estan entrenados con la cadena de degradaciones de Real-ESRGAN y manejan ruido, compresion y artefactos de fotos reales.
- Entrada RGB de cualquier resolucion, con altura y anchura dinamicas en la exportacion ONNX.
- Restauracion de imagenes generadas por difusion (la model card incluye un ejemplo sobre una imagen de Stable Diffusion).
- Procesamiento por teselas (tiling) para imagenes de gran tamano, segun el flujo habitual de chaiNNer y ONNX Runtime.
- Exportacion a ONNX dinamico en el primer intento, sin paso de fusion ni pares de checkpoints fused/unfused.
- Compatibilidad con runtimes estandar: ONNX Runtime (verificado), TensorRT (esperado por conjunto de operaciones, no probado por el autor), chaiNNer y spandrel (requiere registrar HEART en la build).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues de texto: es un modelo puramente image-to-image.

## Casos de uso

- Restauracion de fotografias antiguas o de baja calidad: el modelo aplica la cadena de degradaciones de Real-ESRGAN durante el entrenamiento, por lo que puede recuperar detalle y reducir ruido en fotos reales escaneadas o comprimidas, no solo en downsamples limpios.
- Escalado de imagenes generadas por IA: la model card incluye ejemplos de restauracion 4x sobre salidas de Stable Diffusion; resulta util para aumentar resolucion de assets generados antes de imprimirlos o publicarlos.
- Mejora de material de anime e ilustracion: los ejemplos publicados comparan entrada, bicubico y HEART 4x sobre imagenes de anime, un dominio donde los modelos SISR suelen mostrar diferencias visibles frente al escalado clasico.
- Preprocesado en pipelines de vision por computador: al aceptar entradas de tamano dinamico y exportar a ONNX, puede insertarse como etapa previa en sistemas de deteccion o segmentacion que necesitan mayor resolucion de entrada.
- Procesamiento por lotes en servidor: con ONNX Runtime o TensorRT y soporte de tiling, se puede desplegar para escalar catalogos de imagenes (e-commerce, archivos fotograficos) de forma automatizada.
- Entrenamiento y ajuste fino propio: al ser una arquitectura de traiNNer-redux con un unico fichero, un equipo puede reentrenarla con su propio dataset y hacer warm-start desde los pretrains liberados, por ejemplo para dominios especificos como radiologia o fotografia de producto.
- Integracion en aplicaciones de escritorio: el autor publica una app local (`nerve-app`) y demos en Hugging Face Spaces, lo que facilita prototipado y pruebas de usuario sin infraestructura dedicada.

## Benchmarks y rendimiento

La model card reporta una comparacion directa con HAT_M en PSNR y en coste de entrenamiento e inferencia:

| Metrica | HEART | HAT_M |
|---|---|---|
| PSNR | 25.02 dB | 25.05 dB |
| VRAM de entrenamiento | 1.44 GB | 2.84 GB |
| Velocidad de inferencia (bf16) | ~1.2x mas rapido | referencia |
| VRAM de inferencia (bf16) | ~2.7x menor | referencia |

No se han publicado en la informacion disponible resultados de benchmarks estandar adicionales (MMLU, HumanEval, GSM8K u otros no aplicables a un modelo de vision; tampoco conjuntos como Set5, Set14, Urban100 o DIV2K).

## Requisitos de hardware

- Entrenamiento verificado en una unica RTX 3060 de 12 GB con `lq_size: 96` y lote de 2; VRAM de entrenamiento reportada de 1.44 GB, muy por debajo de los 2.84 GB de HAT_M.
- Inferencia en bf16 con aproximadamente 2.7x menos VRAM que HAT_M; el valor absoluto no se detalla en la informacion disponible.
- Cabe en GPU de consumo: el propio autor entreno todos los modelos en una RTX 3060, por lo que tarjetas de 8-12 GB son suficientes para inferencia y entrenamiento basico.
- GPU de servidor (A100, H100) no son necesarias; se pueden usar para mayor throughput en procesamiento por lotes.
- Opciones de despliegue: ONNX Runtime (verificado por el autor), TensorRT (esperado, no probado), chaiNNer, spandrel (con HEART registrado en la build) y la app local `nerve-app`.
- Latencia y throughput absolutos: no disponibles en la informacion proporcionada; solo se reporta la comparacion relativa de ~1.2x de velocidad frente a HAT_M en bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HEART | no disponible | RGB de tamano dinamico, escala 2x y 4x | PSNR 25.02 dB; ~1.2x mas rapido y ~2.7x menos VRAM en inferencia bf16 que HAT_M | Apache 2.0 | Hugging Face (Phips/HEART), ONNX incluido |
| HAT_M | no disponible | imagen, escala segun checkpoint | PSNR 25.05 dB; 2.84 GB VRAM de entrenamiento | no disponible en la informacion | comunidad SISR (referenciado por el autor) |
| NERVE | no disponible | imagen, orientado a modelos pequenos y moviles | no disponible | no disponible en la informacion | Hugging Face (Phips/NERVE) |
| ATD / DAT2 | no disponible | imagen | no disponible | no disponible en la informacion | comunidad SISR (referenciados por el autor) |

La model card situa a HEART en el nivel de calidad de escritorio/servidor y recomienda NERVE o redes de la comunidad cuando se busca maxima PSNR en benchmarks o un modelo movil pequeno.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes; los campos de contexto e idiomas de la ficha son meramente informativos.
- El autor advierte que HEART prioriza usabilidad real sobre metricas de leaderboard; para maxima PSNR en benchmarks recomienda otras redes.
- Requisito estricto de entrenamiento: `lq_size` debe ser multiplo de 32 (recomendado 96); otros tamanos ensenan al modelo una respuesta falsa de bordes reflejados que produce bandas brillantes y rejilla de teselas, mas acusada con perdida GAN.
- La exportacion a TensorRT no esta verificada por el autor, solo se espera que funcione por usar el mismo conjunto de operaciones estandar.
- La carga de los `.safetensors` mediante spandrel requiere registrar HEART en la build de chaiNNer/spandrel; no esta en upstream, por lo que la ruta recomendada es usar los ficheros ONNX.
- Riesgo de artefactos y alucinacion visual: como todo modelo generativo de superresolucion, puede inventar texturas o detalles plausibles que no estaban en la imagen original.
- Sesgos: no disponibles en la informacion proporcionada; al entrenarse con un dataset CC0 de imagenes, puede heredar la distribucion y sesgos de ese corpus.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar el aviso de licencia y la atribucion al autor.
- Modelo con muy pocas descargas (0 en el momento de la consulta) y publicado recientemente; no hay validacion independiente de terceros en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phips/HEART
- Ficheros del repositorio: https://huggingface.co/Phips/HEART/tree/main
- NERVE (modelo hermano): https://huggingface.co/Phips/NERVE
- Demo de NERVE: https://huggingface.co/spaces/Phips/nerve
- Demo de HEART: https://huggingface.co/spaces/Phips/heart
- Conversor de checkpoints: https://huggingface.co/spaces/Phips/nerve-convert
- App local: https://github.com/Phhofm/nerve-app
- Entrenamiento de NERVE: https://github.com/Phhofm/nerve-train
- Entrenamiento de HEART: https://github.com/Phhofm/heart-train
- Coleccion de modelos del autor: https://github.com/Phhofm/models
- Dataset: https://huggingface.co/datasets/Phips/lucid-cc0-v2-hc-512
- traiNNer-redux: https://github.com/the-database/traiNNer-redux
- Paper referenciado (arxiv:2205.04437): https://arxiv.org/abs/2205.04437
- Paper referenciado (arxiv:2504.06629): https://arxiv.org/abs/2504.06629
- Paper referenciado (arxiv:2603.06738): https://arxiv.org/abs/2603.06738
