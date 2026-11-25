# lingxin07/QualityScaler-Go_models

## Resumen

QualityScaler-Go_models es una coleccion de 31 modelos de vision por computador exportados al formato ONNX, orientados a restauracion de imagen, superresolucion y restauracion de rostros. La publica el usuario lingxin07 en Hugging Face y no se trata de un modelo unico, sino de un repositorio agregado que empaqueta arquitecturas conocidas del ecosistema de image restoration (Real-ESRGAN, BSRGAN, CodeFormer, Restormer, NAFNet, Real-CUGAN, DeblurGANv2, IRCNN, entre otras) en tres precisiones: FP32, FP16 y BF16. El repositorio ocupa 4,6 GB y contiene 89 ficheros de pesos organizados por modelo y precision.

El problema que resuelve es practico: facilita el despliegue de pipelines de restauracion de imagen en produccion sin necesidad de convertir manualmente checkpoints de PyTorch a ONNX ni de gestionar la cuantizacion. Segun la model card, 25 modelos se reexportaron desde los checkpoints originales de PyTorch y 6 se convirtieron desde ONNX existentes con autorizacion del usuario, y cada manifiesto indica el origen mediante el campo `source.kind`. La mayoria de los modelos admiten dimensiones dinamicas de entrada (N/H/W), lo que simplifica su integracion en aplicaciones que reciben imagenes de tamanos variables.

No es un modelo generativo de lenguaje ni un transformer multimodal: son redes convolucionales y de restauracion de imagen, sin parametros de lenguaje, sin contexto de tokens y sin capacidades de razonamiento. Su relevancia actual reside en la estandarizacion del formato ONNX y en la cobertura de tres precisiones, lo que permite ejecutar en CPU, GPU con TensorRT o aceleradores que soporten BF16 sin recompilar los modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion de arquitecturas CNN y de restauracion de imagen (RRDB/ESRGAN, CodeFormer, Restormer, NAFNet, Real-CUGAN, DeblurGANv2, IRCNN, entre otras) |
| Parametros totales | no disponible (varia por modelo; el repositorio contiene 31 modelos y 89 ficheros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | FP32, FP16, BF16 (los modelos ligeros no tienen versiones INT8 ni FP8) |
| Idiomas soportados | zh, en (etiquetas de la model card; no aplica a un modelo de imagen) |
| Licencia | no disponible |
| Formato de pesos | ONNX (.onnx) con manifiestos JSON por modelo |

## Arquitectura y entrenamiento

El repositorio no entrena modelos nuevos: agrega y reexporta arquitecturas de restauracion de imagen ya existentes. Cada subdirectorio corresponde a un modelo con su propio `manifest.json`, que documenta el origen (`source.kind`), la precision y el estado de validacion. Segun la model card, los FP32 de los modelos PTH originales se exportaron cargando la red con los pesos de precision completa, mientras que los FP16 y BF16 se generaron a partir de los grafos recien exportados; los seis modelos convertidos desde ONNX toman como fuente los grafos existentes.

La model card advierte que LVAx2 y MSharpx4 partian de ficheros fuente ya en FP16, de modo que su version FP32 solo eleva el tipo de computo y no recupera los pesos de precision original. Los operadores sensibles pueden mantenerse en FP32, y las tres precisiones usan entradas y salidas externas en FP32, mientras que FP16 y BF16 representan precision mixta interna. La mayoria de los modelos admiten N/H/W dinamicos y se han comprobado con batch=2 y con distintas alturas y anchuras; CodeFormer y CodeFormer colorization mantienen batch=1 fijo y 512x512. Algunos modelos imponen restricciones de multiplo de escala que se detallan en cada manifiesto. Todos los ficheros pasaron comprobaciones de estructura ONNX, tipos y SHA-256, y FP32/FP16 se validaron con inferencia en CPU a varios tamanos; 17 modelos BF16 se validaron con inferencia en GPU mediante TensorRT.

## Capacidades

- Superresolucion de imagen con factores x2, x3 y x4 segun el modelo (BSRGAN, Real-ESRGAN, Real-CUGAN, RealESR, LVAx2, MSharpx4).
- Restauracion de rostros y mejora facial (CodeFormer, CodeFormer colorization, face_enhance_x4).
- Colorizacion de imagenes en blanco y negro mediante CodeFormer colorization.
- Desenfoque y deblurring (DeblurGANv2, DeblurGANv2-FPNInception-GoPro, NAFNet-GoPro-width32, Restormer-Motion, Restormer-Defocus).
- Eliminacion de ruido y restauracion generica (IRCNN_Lx1, IRCNN_Mx1, RealESR_Gx4_WDN).
- Superresolucion especializada en anime y contenido ilustrado (RealESR_Animex4, RealESR_Animex4_v2).
- Inferencia con dimensiones dinamicas de entrada en la mayoria de modelos, con soporte de batch variable.
- Ejecucion en CPU y GPU con tres precisiones (FP32, FP16, BF16).
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje.

## Casos de uso

- Restauracion de fotografia antigua o de baja calidad: aplicar Real-ESRGAN o BSRGAN en x4 para recuperar detalle en escaneos y fotografias comprimidas, usando la version FP16 en GPU para reducir latencia.
- Mejora de retratos en aplicaciones de edicion: CodeFormer con entrada fija 512x512 permite restaurar rostros desenfocados o danados, y su variante colorization anade color a retratos en blanco y negro.
- Escalado de contenido de anime y videojuegos: RealESR_Animex4 y su v2 estan especializados en ilustracion y lineas limpias, adecuados para pipelines de upscaling de catalogo audiovisual.
- Desenfoque de video de accion: DeblurGANv2-FPNInception-GoPro y NAFNet-GoPro-width32 estan entrenados sobre el dataset GoPro y sirven para estabilizar o aclarar fotogramas con motion blur antes de un analisis posterior.
- Preprocesado en pipelines de vision por computador: usar IRCNN o Restormer para reducir ruido y desenfoque antes de tareas de deteccion, OCR o segmentacion, mejorando la calidad de la entrada sin intervencion manual.
- Despliegue en entornos sin GPU: las versiones FP32 y las dinamicas de entrada permiten ejecutar en CPU con ONNX Runtime en servicios de backend o aplicaciones de escritorio, sin depender de CUDA.
- Integracion en herramientas de escritorio y plugins: al estar en ONNX y con manifiestos JSON, se pueden empaquetar en aplicaciones tipo QualityScaler-Go o integrarse en flujos de edicion por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta validaciones de correctitud (estructura ONNX, tipos, SHA-256, inferencia en CPU y GPU con TensorRT), no metricas de calidad como PSNR, SSIM o LPIPS.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; depende del modelo concreto y de la resolucion de entrada. Los modelos de superresolucion x4 sobre imagenes grandes consumen mas memoria que los de restauracion facial fija 512x512.
- GPU recomendadas: no especificadas por el autor. Al validarse 17 modelos BF16 con TensorRT, se presupone compatibilidad con GPU NVIDIA que soporten BF16 (Ampere en adelante, como A100, H100, RTX 30/40).
- Cabe en GPU de consumo: si, en principio cualquier modelo individual cabe en GPU de consumo, dado que el repositorio completo son 4,6 GB y cada modelo es una fraccion de ese total; no se aportan cifras exactas por modelo.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), TensorRT (usado por el autor para validar BF16), y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Precisiones | Entrada dinamica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QualityScaler-Go_models | Coleccion ONNX de restauracion | FP32, FP16, BF16 | Si (mayoria; CodeFormer fijo 512x512) | no disponible | Hugging Face |
| Real-ESRGAN (original) | Superresolucion x4 | PyTorch | Si | BSD-3-Clause (segun el proyecto original) | GitHub / pesos PyTorch |
| CodeFormer (original) | Restauracion facial | PyTorch | No (512x512) | S-Lab License 1.0 (segun el proyecto original) | GitHub / pesos PyTorch |
| Restormer (original) | Restauracion general | PyTorch | Si | no disponible | GitHub / pesos PyTorch |

La comparativa se limita al formato y al empaquetado: QualityScaler-Go_models no aporta arquitecturas nuevas, sino versiones ONNX de modelos existentes, por lo que su ventaja es la disponibilidad en tres precisiones y la validacion de exportacion, no mejoras de calidad frente a los originales.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- La licencia no esta declarada en la model card, lo que impide confirmar si el uso comercial esta permitido; hay que verificar las licencias de cada arquitectura original por separado.
- LVAx2 y MSharpx4 no tienen pesos FP32 reales: su version FP32 solo eleva el tipo de computo y puede no igualar la precision del checkpoint original.
- CodeFormer y CodeFormer colorization tienen batch fijo de 1 y resolucion fija 512x512, lo que limita el procesamiento por lotes y obliga a redimensionar.
- Algunos modelos imponen restricciones de multiplo de escala en las dimensiones de entrada; es necesario consultar cada manifiesto.
- No hay versiones INT8 ni FP8 para los modelos ligeros, lo que limita la optimizacion en hardware de baja potencia.
- El estado de validacion BF16 en GPU no es uniforme: 17 modelos estan verificados con TensorRT y el resto figura como pendiente en sus manifiestos.
- No se publican metricas de calidad (PSNR, SSIM, LPIPS) ni comparativas con los modelos originales, por lo que el rendimiento cualitativo no esta documentado en el repositorio.
- Riesgo de artefactos y alucinacion visual: como todo modelo de superresolucion generativa, puede inventar detalle inexistente en caras y texturas, especialmente con factores x4.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lingxin07/QualityScaler-Go_models
- Manifiestos por modelo: disponibles en cada subdirectorio del repositorio (por ejemplo, https://huggingface.co/lingxin07/QualityScaler-Go_models/blob/main/BSRGANx2/manifest.json)
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios de codigo ni demos adicionales.
