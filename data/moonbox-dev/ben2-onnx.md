# moonbox-dev/BEN2-ONNX

## Resumen

BEN2-ONNX es una compilación en formato ONNX del modelo BEN2 Base (Background Erase Network), desarrollado originalmente por PramaLLC y publicada por moonbox-dev para su uso en dispositivos con ONNX Runtime (CUDA, DirectML y CPU). Se trata de un modelo de segmentación de imagen especializado en la eliminación de fondos (background removal) y el matting de primer plano, que emplea una arquitectura de refinamiento guiada por confianza (Confidence Guided Matting, CGM) para mejorar la precisión en bordes complejos como el cabello.

El modelo se distribuye en tres precisiones (fp16, int8 e int4) como grafos ONNX independientes, cada uno en su propia carpeta con un único archivo `model.onnx`. El tamaño del repositorio es de 0,5 GB y la variante más ligera (int4) ocupa solo 93 MB, lo que lo hace apto para inferencia en hardware de consumo y entornos con recursos limitados. La entrada es una imagen RGB de 1024 x 1024 y la salida es un matte (canal alfa) que puede aplicarse sobre la imagen original.

La relevancia actual de esta ficha radica en que ofrece una alternativa abierta (licencia MIT) al modelo BEN2 comercial de PramaLLC, con cuantizaciones verificadas y benchmarks publicados sobre el conjunto de evaluación DIS5K, lo que permite a desarrolladores evaluar el equilibrio entre tamaño, latencia y calidad de segmentación antes de integrarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de segmentación con refinador guiado por confianza (Confidence Guided Matting, CGM); grafo ONNX único |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp16, int8 (weight-only, QDQ estático con calibración MinMax), int4 (MatMulNBits, block 32) |
| Idiomas soportados | no disponible (modelo de imagen, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx` por precisión: fp16, int8, int4) |

## Arquitectura y entrenamiento

BEN2 Base se basa en la arquitectura BEN (Background Erase Network), que combina un modelo base de segmentación con una red refinadora que procesa específicamente los píxeles donde el modelo base muestra baja confianza. Esta pipeline de Confidence Guided Matting (CGM) permite obtener mattes más precisos en zonas de borde complejas, como el cabello o contornos finos. El modelo fue entrenado sobre el conjunto DIS5K y un dataset propietario de 22K imágenes de segmentación, según la model card original.

La versión ONNX aquí descrita no introduce cambios arquitectónicos: es una conversión y cuantización del grafo oficial `BEN2_Base.onnx` (fp16 con entradas y salidas fp32). Las cuantizaciones se generaron con onnxconverter-common (fp16), la cuantización estática QDQ de ONNX Runtime (int8, con calibración sobre imágenes fuera del conjunto de evaluación) y MatMulNBits de ONNX Runtime (int4, weight-only, block 32). No se generó bf16 porque el proveedor CUDA de ONNX Runtime no soporta convoluciones en bf16. Cada grafo fue evaluado antes de su publicación y se proporciona el hash SHA-256 de cada archivo.

## Capacidades

- Segmentación de primer plano y eliminación de fondo en imágenes RGB de 1024 x 1024.
- Generación de mattes (canal alfa) con refinamiento de bordes, incluyendo matting de cabello.
- Procesamiento de imágenes de alta resolución (hasta aproximadamente 6000 x 4000 en el conjunto DIS5K, redimensionadas internamente a 1024 x 1024).
- Inferencia en ONNX Runtime con proveedores CUDA, DirectML y CPU.
- Tres niveles de precisión (fp16, int8, int4) para ajustar el equilibrio entre tamaño y calidad.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente visual.

## Casos de uso

- Eliminación de fondo en aplicaciones de fotografía y diseño: el modelo recibe una imagen RGB de 1024 x 1024 y devuelve un matte que se aplica como canal alfa, adecuado para herramientas de edición que necesitan recortes precisos sin intervención manual.
- Generación de retratos con fondo transparente en pipelines de e-commerce: la cuantización int8 mantiene una MAE de 0,0244 frente a la referencia fp16, por lo que puede integrarse en servicios de procesamiento por lotes con un coste de VRAM de 4,2 GB.
- Procesamiento en dispositivos de borde (edge) con DirectML o CPU: la variante int4 de 93 MB permite ejecutar la segmentación en equipos sin GPU dedicada, con un tiempo de 428 ms por imagen en una RTX 3080 Laptop GPU.
- Preprocesado para modelos de visión por computador: el matte generado puede usarse para aislar objetos antes de tareas de clasificación, detección o generación de imágenes.
- Automatización de flujos de trabajo de vídeo o fotografía: la latencia de aproximadamente 445 ms por imagen en fp16 permite procesar lotes moderados en tiempo casi interactivo.
- Integración en aplicaciones de escritorio o móviles mediante ONNX Runtime: al ser un único grafo ONNX, se puede empaquetar en aplicaciones nativas sin dependencias de PyTorch.
- Evaluación y prototipado de investigación: los benchmarks publicados sobre DIS5K y los hashes SHA-256 facilitan la reproducibilidad y la comparación entre precisiones.

## Benchmarks y rendimiento

Resultados sobre los conjuntos de test de DIS5K (250 imágenes: DIS-TE1..4 y DIS-VD, 50 cada uno), con ONNX Runtime 1.30 y proveedor CUDA en una RTX 3080 Laptop GPU. Las métricas se calcularon con PySODMetrics sobre máscaras reducidas a un máximo de 2048 px en el lado largo.

| Precision | Tamano | vs fp16 (IoU, MAE) | MAE | S-measure | max F | Tiempo / imagen | VRAM pico |
|---|---|---|---|---|---|---|---|
| fp16 | 223 MB | referencia | 0,0244 | 0,937 | 0,943 | 445 ms | 4,4 GB |
| int8 | 131 MB | IoU 0,9965; MAE 0,0005 | 0,0244 | 0,937 | 0,943 | 427 ms | 4,2 GB |
| int4 | 93 MB | IoU 0,9769; MAE 0,0037 | 0,0248 | 0,936 | 0,942 | 428 ms | 4,2 GB |

No se han publicado resultados de benchmarks comparativos con otros modelos de segmentación en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 4,4 GB en fp16, 4,2 GB en int8 y 4,2 GB en int4 (medido en una RTX 3080 Laptop GPU).
- GPU recomendadas: RTX 3080 Laptop GPU o superior para las cifras de latencia publicadas; cualquier GPU compatible con CUDA o DirectML con al menos 4,5 GB de VRAM.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 3080). La variante int4 también puede ejecutarse en CPU mediante ONNX Runtime, aunque la latencia no está documentada.
- Opciones de despliegue: ONNX Runtime con proveedores CUDA, DirectML o CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 445 ms por imagen en fp16 y 427-428 ms en int8/int4, sobre una RTX 3080 Laptop GPU con imágenes de 1024 x 1024.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BEN2-ONNX (este) | no disponible | Imagen 1024 x 1024 | MAE 0,0244; S-measure 0,937; max F 0,943 (DIS5K) | MIT | Hugging Face (ONNX) |
| BEN2 Base (original) | no disponible | Imagen 1024 x 1024 | no disponible en esta ficha | MIT | Hugging Face (PyTorch) |
| BEN2 completo (comercial) | no disponible | Imagen de alta resolución | no disponible | Comercial | API / demo web de PramaLLC |

No se dispone de datos de benchmarks de BEN2 Base original ni del BEN2 comercial en la información proporcionada, por lo que la comparación numérica con alternativas no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado para segmentación de primer plano; puede fallar en imágenes con fondos ambiguos, objetos múltiples o escenas muy complejas.
- Riesgo de alucinación visual: puede generar mattes incorrectos en regiones de bajo contraste o con texturas similares al fondo.
- La entrada se redimensiona a 1024 x 1024, lo que puede perder detalle en imágenes de muy alta resolución; los benchmarks se calcularon sobre máscaras reducidas a 2048 px en el lado largo.
- La cuantización int4 introduce una degradación medible (IoU 0,9769 frente a fp16, MAE 0,0037), aceptable para muchas aplicaciones pero no para flujos que requieran máxima precisión.
- No se ha publicado información sobre sesgos demográficos o de otro tipo; se recomienda evaluar el modelo sobre el dominio objetivo antes de usarlo en producción.
- La licencia MIT permite uso comercial, pero el modelo es un derivado de BEN2 Base y hereda su licencia; el BEN2 completo de PramaLLC es un producto comercial separado y no está incluido en este repositorio.
- No se proporcionan datos sobre idiomas ni sobre sesgos lingüísticos porque el modelo no procesa texto.

## Enlaces

- [Modelo en Hugging Face: moonbox-dev/BEN2-ONNX](https://huggingface.co/moonbox-dev/BEN2-ONNX)
- [Modelo base: PramaLLC/BEN2](https://huggingface.co/PramaLLC/BEN2)
- [Paper arXiv:2501.06230](https://arxiv.org/abs/2501.06230)
- [Repositorio GitHub de BEN2](https://github.com/PramaLLC/BEN2/)
- [Sitio web oficial: backgrounderase.net](https://backgrounderase.net)
- [Demo web: backgrounderase.com](https://backgrounderase.com)
- [Conjunto de datos DIS5K](https://github.com/xuebinqin/DIS)
