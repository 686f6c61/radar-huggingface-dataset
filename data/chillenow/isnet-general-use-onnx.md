# chillenow/isnet-general-use-onnx

## Resumen

IS-Net `isnet-general-use` es un modelo de segmentación dicotómica de imagen (dichotomous image segmentation) orientado a la eliminación de fondos, publicado originalmente por Qin et al. en el paper DIS (ECCV 2022). Esta ficha concreta corresponde al repositorio `chillenow/isnet-general-use-onnx`, que no es un modelo nuevo sino un reempaquetado del export ONNX oficial de los pesos `isnet-general-use`: se conserva únicamente la salida de máscara final y se convierten los pesos a fp16, con entradas y salidas en float32.

El objetivo del repositorio es ejecutar el modelo íntegramente en el navegador mediante `onnxruntime-web`, usando el backend WebGPU (o WASM cuando no hay soporte de shader-f16), sin depender de servidores de inferencia. Es la pieza que da servicio a las herramientas gratuitas de eliminación de fondo de drewvy.com. El repositorio ocupa 0,1 GB y contiene un único archivo ONNX de 90.447.799 bytes.

No se trata de un modelo de lenguaje: no procesa texto ni tiene ventana de contexto conversacional. Su entrada es una imagen RGB reescalada a 1024x1024 y su salida es un mapa de probabilidad de primer plano del mismo tamaño, que se emplea como canal alfa. La licencia es Apache-2.0, la de los pesos originales de DIS / IS-Net.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IS-Net (DIS, ECCV 2022), red de segmentación de imagen dicotómica basada en estructura codificador-decodificador tipo U^2-Net (según el paper original; la model card no detalla la composición interna) |
| Parametros totales | no disponible (el archivo fp32 de origen pesa 178.648.008 bytes; el fp16 resultante, 90.447.799 bytes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión); entrada fija de 1024x1024 píxeles |
| Tipos de cuantizacion | fp16 (archivo distribuido); fp32 (export original de rembg); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible / no aplica (modelo de segmentación de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (un único archivo `isnet-general-use-fp16.onnx`) |
| Entrada | `input_image`: float32 `[1, 3, 1024, 1024]`, RGB, normalizado como `v / 255 - 0.5` |
| Salida | `output_image`: float32 `[1, 1, 1024, 1024]`, probabilidad de primer plano en `0..1` |
| Tamano del repositorio | 0,1 GB |
| Libreria declarada | onnx |
| Pipeline | image-segmentation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

IS-Net es la red propuesta en el paper DIS (Highly Accurate Dichotomous Image Segmentation, Qin et al., ECCV 2022) para separar un objeto o conjunto de objetos del fondo con un nivel de detalle fino, incluyendo estructuras delgadas como pelo, ramas o rejillas. La variante `isnet-general-use` es el checkpoint de propósito general entrenado sobre múltiples categorías, y es la que emplea la herramienta `rembg` como uno de sus modelos de eliminación de fondo.

El proceso de creación de este repositorio no incluye reentrenamiento ni ajuste fino. Se parte del export ONNX en fp32 `isnet-general-use.onnx` (178.648.008 bytes, SHA-256 `60920e99c45464f2ba57bee2ad08c919a52bbf852739e96947fbb4358c0d964a`) publicado en la release v0.0.0 de rembg. Sobre él se aplica `onnx.utils.extract_model` para conservar solo la salida final, descartando las 12 salidas laterales (side outputs) del modelo original, y después se convierten los pesos a fp16 con `onnxconverter_common.float16.convert_float_to_float16` manteniendo los tipos de entrada y salida en float32 (`keep_io_types=True`). El resultado es un grafo más ligero, pensado para inferencia en el navegador.

## Capacidades

- Segmentación dicotómica de imagen: genera una máscara de probabilidad de primer plano a resolución 1024x1024.
- Eliminación de fondo de propósito general: funciona con objetos de categorías diversas sin necesidad de ajuste por categoría.
- Extracción de canal alfa: la salida en `0..1` se reescala al tamaño de la imagen original y se usa directamente como transparencia.
- Segmentación de detalle fino, incluyendo estructuras delgadas y bordes complejos, que es el objetivo declarado de la familia DIS.
- Inferencia en navegador: compatible con `onnxruntime-web` mediante backend WebGPU (requiere la característica `shader-f16` del adaptador) o backend WASM.
- Ejecución local sin servidor: al ser un modelo ONNX autocontenido, puede desplegarse en cliente sin llamadas a API externas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No soporta visión de propósito general más allá de la tarea de segmentación: no describe, clasifica ni responde preguntas sobre la imagen.
- Capacidades multilingües: no aplica.

## Casos de uso

- Eliminación de fondo en aplicaciones web: integrado con `onnxruntime-web` y WebGPU, el modelo procesa la imagen en el propio navegador del usuario, de modo que la foto no se envía a ningún servidor. Es el escenario para el que se empaquetó este repositorio.
- Herramientas de edición fotográfica para consumidor: generar automáticamente el canal alfa de retratos, productos o avatares para sustituir el fondo por colores planos o imágenes.
- Preparación de datos para e-commerce: recortar productos de forma masiva manteniendo bordes finos, para catálogos con fondo uniforme o PNG con transparencia.
- Preprocesado en pipelines de visión por computador: producir máscaras de primer plano que alimenten etapas posteriores de detección, clasificación o composición de imágenes.
- Procesamiento por lotes en local o en servidor con `onnxruntime`: al ser un ONNX estándar, puede ejecutarse con CPU o GPU fuera del navegador para automatizar grandes volúmenes de imágenes.
- Aplicaciones de privacidad estricta: entornos sanitarios, jurídicos o corporativos donde no está permitido subir imágenes a servicios en la nube y se necesita una segmentación que corra íntegramente en el dispositivo.
- Composición y efectos en tiempo real: como el modelo opera sobre una resolución fija de 1024x1024, admite flujos de sustitución de fondo en editores web o aplicaciones de vídeo-primer plano fotograma a fotograma.
- Prototipado rápido sin infraestructura: al pesar 90 MB y no requerir GPU dedicada, permite validar una idea de segmentación en un portátil o incluso en un móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye métricas (S-measure, F-measure, MAE u otras) y la búsqueda web no aportó cifras asociadas a este archivo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el archivo de pesos ocupa unos 90 MB en fp16 y el modelo se ha diseñado para ejecutarse incluso en el backend WASM sobre CPU, por lo que el consumo de memoria es moderado (del orden de cientos de MB contando activaciones a 1024x1024, según el runtime).
- GPU recomendadas: cualquier GPU con soporte WebGPU y la característica `shader-f16` para aprovechar los kernels fp16; en servidor, GPUs generalistas tipo NVIDIA A100, H100 o RTX 4090 pueden ejecutar el ONNX mediante `onnxruntime-gpu`, aunque no hay cifras publicadas.
- Compatibilidad con GPU de consumo: sí; al ser un modelo de 90 MB, cabe en cualquier GPU de consumo reciente, e incluso funciona sin GPU mediante el backend WASM.
- Opciones de despliegue: `onnxruntime-web` (WebGPU o WASM) para navegador; `onnxruntime` (CPU o GPU) para Python/C++; `rembg` para pipelines de eliminación de fondo por línea de comandos; cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles. Dependen del backend (WebGPU frente a WASM), del hardware y del número de imágenes por lote; no se han publicado mediciones en la información proporcionada.
- Nota de compatibilidad: en WebGPU, los kernels fp16 requieren la característica `shader-f16` del adaptador; si no está disponible, debe usarse el backend WASM.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion de entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| IS-Net general-use ONNX fp16 (este) | no disponible | 1024x1024 | Apache-2.0 | Hugging Face, ONNX | Optimizado para navegador, salida única |
| IS-Net general-use ONNX fp32 (rembg v0.0.0) | no disponible | 1024x1024 | Apache-2.0 | GitHub (rembg releases) | Mismo modelo sin cuantizar, 12 salidas laterales |
| U^2-Net (u2net, rembg) | no disponible | no disponible en la informacion | Apache-2.0 (modelo base de la familia) | GitHub / Hugging Face | Alternativa clásica de eliminación de fondo en rembg |
| MODNet | no disponible | no disponible en la informacion | no disponible en la informacion | GitHub | Segmentación de retratos en tiempo real |
| RMBG-1.4 (BRIA) | no disponible | no disponible en la informacion | licencia no comercial | Hugging Face | Orientado a eliminación de fondo en producción, con restricciones de uso |

No se dispone de métricas comparativas de benchmarks en la informacion proporcionada, por lo que la comparación se limita a licencia, formato y disponibilidad.

## Limitaciones y advertencias

- Resolución fija: la entrada debe ser float32 `[1, 3, 1024, 1024]`. Cualquier imagen se reescala a ese tamaño, lo que puede perder detalle en imágenes muy grandes o muy pequeñas, y la máscara debe reescalarse después a la resolución original.
- Salida única: este empaquetado elimina las 12 salidas laterales del modelo original. Si un flujo de trabajo dependía de ellas (por ejemplo, para supervisión o refinado interno), este archivo no las ofrece.
- Cuantización a fp16 sin recalibración: los pesos se redondearon a fp16 sin reentrenamiento ni ajuste, por lo que puede haber una pérdida de precisión numérica menor respecto al fp32 original. No se documenta una evaluación del impacto.
- Riesgo de segmentación imperfecta: como todo modelo de segmentación, puede fallar en fondos con colores muy próximos al objeto, transparencias reales, desenfoques o imágenes con múltiples objetos superpuestos.
- No es un modelo generativo ni multimodal: no responde a instrucciones, no genera texto y no debe usarse para tareas de descripción, clasificación o diálogo.
- Idiomas y texto: no aplica; el modelo no procesa lenguaje, por lo que no hay soporte multilingüe que evaluar.
- Dependencia del backend: el rendimiento óptimo con WebGPU exige la característica `shader-f16`; sin ella se degrada a WASM, con latencias potencialmente mayores.
- Licencia: Apache-2.0, lo que permite uso comercial, pero el crédito del modelo corresponde a los autores originales del paper DIS y a los pesos de rembg; conviene mantener la atribución.
- Sesgos: pueden aparecer sesgos heredados del conjunto de entrenamiento de IS-Net (por ejemplo, peor segmentación en determinados tonos de piel, tipos de pelo o categorías de objeto poco representadas). No se documentan análisis de sesgo en la información disponible.
- Sin métricas publicadas: no hay cifras de calidad ni de latencia para esta versión concreta, lo que dificulta estimar su rendimiento antes de desplegarla.
- Fecha del repositorio: la información indica fecha de creación 2026-09-29, posterior a la fecha de actualidad habitual; conviene verificar la vigencia y el estado del repositorio antes de depender de él en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chillenow/isnet-general-use-onnx
- Réplica encontrada en la búsqueda: https://huggingface.co/x-Liola-x/isnet-general-use-onnx
- Repositorio oficial de DIS / IS-Net: https://github.com/xuebinqin/DIS
- Release de rembg v0.0.0 con el ONNX fp32 de origen: https://github.com/danielgatis/rembg/releases/tag/v0.0.0
- Paquete onnxruntime-web: https://www.npmjs.com/package/onnxruntime-web
- Herramienta que usa el modelo: https://drewvy.com
- ONNX Model Zoo: https://github.com/onnx/models
- Modelos de ONNX Runtime: https://onnxruntime.ai/models
- Paper de referencia: Qin, Dai, Hu, Fan, Shao y Van Gool, "Highly Accurate Dichotomous Image Segmentation", ECCV 2022.
