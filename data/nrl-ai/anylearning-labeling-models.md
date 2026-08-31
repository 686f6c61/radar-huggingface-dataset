# nrl-ai/anylearning-labeling-models

## Resumen

El repositorio `nrl-ai/anylearning-labeling-models` es un paquete de nueve modelos de segmentación de imágenes en formato ONNX, distribuidos por Neural Research Lab (autor: Viet-Anh Nguyen) como parte del ecosistema AnyLearning, una aplicación de escritorio de código abierto para etiquetado de datos y entrenamiento de modelos sin necesidad de escribir código. Estos modelos son espejos byte a byte de exportaciones ONNX publicadas por Viet-Anh Nguyen para los proyectos Segment Anything (SAM), Segment Anything 2 (SAM 2) y SAM 2.1, junto con la variante ligera MobileSAM. Cada archivo ZIP contiene un pequeño fichero de configuración de AnyLearning, un encoder y un decoder en formato ONNX, listos para ser cargados por la aplicación.

El repositorio resuelve el problema de proporcionar pesos de segmentación promptable en un formato estándar y portable (ONNX) que puede ejecutarse localmente con ONNX Runtime, sin depender de la nube ni de frameworks específicos. Su relevancia actual radica en la creciente demanda de herramientas de anotación asistida por IA que funcionen de forma offline y respeten la privacidad de los datos, especialmente en entornos industriales o de investigación donde los datos no pueden salir de la máquina. Al incluir desde la versión ligera MobileSAM (36 MB) hasta la grande SAM 2.1 Hiera-Large (805 MB), cubre un amplio espectro de requisitos de latencia y precisión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Hiera para SAM 2 / SAM 2.1; ViT para SAM y MobileSAM) exportado a ONNX |
| Parametros totales | No disponible (tamaños de archivo: MobileSAM 36,7 MB; SAM 2 Tiny 154,9 MB; Small 183,3 MB; Base+ 360,4 MB; Large 910,0 MB; SAM 2.1 Tiny 116,5 MB; Small 142,9 MB; Base+ 272,0 MB; Large 805,2 MB) |
| Parametros activos | No aplica (modelos densos, no MoE) |
| Longitud de contexto | No aplica (entrada de imagen, no texto) |
| Tipos de cuantizacion | No disponible (los archivos son ONNX de precisión completa) |
| Idiomas soportados | No disponible (modelos de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivos .onnx dentro de ZIP) |

Adicionalmente, el repositorio incluye un `MANIFEST.json` que registra la revisión exacta de origen, el tamaño del archivo, el checksum SHA-256 y los miembros esperados de cada ZIP. Para las entradas SAM 2.1, el manifiesto fija además el tamaño y SHA-256 de cada miembro extraído, garantizando reproducibilidad y seguridad en la descarga.

## Arquitectura y entrenamiento

Los modelos son exportaciones ONNX de los checkpoints oficiales de Segment Anything (SAM), SAM 2 y SAM 2.1, así como de MobileSAM. No se han modificado ni los pesos ni los grafos de los modelos originales; simplemente se han convertido a ONNX y empaquetado con una configuración específica para AnyLearning. Los modelos originales fueron entrenados por Meta AI (SAM y SAM 2) y por Chaoning Zhang et al. (MobileSAM). SAM se entrenó con el dataset SA-1B (más de 1.000 millones de máscaras), SAM 2 con SA-V (datos de vídeo e imágenes), y MobileSAM es una versión destilada que reduce el encoder de ViT-H a un ViT-Tiny, manteniendo un rendimiento comparable.

La arquitectura de SAM y SAM 2 se compone de un encoder de imagen (ViT o Hiera), un encoder de prompts (puntos, rectángulos, máscaras) y un decoder de máscaras que produce la segmentación. SAM 2 extiende SAM a vídeo con un módulo de memoria y un decoder de flujo. En este repositorio, cada ZIP contiene un encoder y un decoder separados, lo que permite a AnyLearning realizar la codificación de imagen, conversión de prompts y decodificación de máscaras de forma modular. No se incluye el módulo de memoria de vídeo, por lo que la funcionalidad se limita a imágenes estáticas, aunque SAM 2 en su versión completa soporta vídeo.

## Capacidades

- Segmentación promptable de imágenes mediante puntos o rectángulos (bounding boxes) como entrada.
- Generación de máscaras de segmentación de alta calidad para objetos, personas, animales, vehículos, etc., gracias al entrenamiento con datasets masivos.
- Soporte para convertir las máscaras en formas editables (polígonos, curvas) dentro de AnyLearning, facilitando el ajuste fino manual.
- Ejecución local y offline mediante ONNX Runtime, con posibilidad de usar diferentes execution providers (CPU, CUDA, etc.).
- Disponibilidad en nueve variantes que cubren un rango de latencia/precisión: desde MobileSAM (muy ligero) hasta SAM 2.1 Hiera-Large (alta precisión).
- Integración nativa con AnyLearning para etiquetado de datos y entrenamiento posterior de modelos personalizados.

## Casos de uso

- **Anotación de datasets de segmentación semántica**: los anotadores pueden usar puntos o cajas para generar máscaras iniciales de alta calidad y luego refinarlas manualmente, acelerando la creación de datasets de entrenamiento para modelos de visión por computador.
- **Etiquetado de imágenes médicas (asistido)**: la segmentación promptable permite delinear estructuras anatómicas en radiografías o tomografías, aunque la salida siempre debe ser revisada por un profesional médico antes de su uso clínico.
- **Segmentación de objetos en imágenes satelitales o aéreas**: con SAM 2 Hiera-Large se pueden identificar edificios, carreteras o cultivos a partir de puntos de referencia, útil para agricultura de precisión o planificación urbana.
- **Preprocesamiento en pipelines de visión por computador**: usar las máscaras generadas como entrada para otras tareas como OCR, conteo de objetos o análisis de escenas, sin necesidad de entrenar un modelo específico.
- **Edición de imágenes y fotografía**: extraer objetos de una imagen para recortarlos, reemplazar fondos o aplicar efectos, mediante prompts de puntos o cajas.
- **Prototipado rápido de aplicaciones de segmentación**: los desarrolladores pueden integrar estos modelos ONNX en aplicaciones de escritorio o móviles con ONNX Runtime, sin depender de servicios en la nube, manteniendo los datos en local.
- **Formación y educación en visión por computador**: los estudiantes pueden experimentar con diferentes tamaños de modelo y entender el equilibrio entre velocidad y precisión en un entorno de código abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas comparativas (mIoU, latencia, etc.) para los modelos. Los papers originales de SAM y SAM 2 reportan resultados en sus respectivos datasets, pero no se proporcionan aquí. Para evaluar el rendimiento, se recomienda consultar las publicaciones originales o ejecutar los modelos en el hardware objetivo.

## Requisitos de hardware

- Los modelos varían en tamaño desde 36,7 MB (MobileSAM) hasta 910 MB (SAM 2 Hiera-Large), por lo que los requisitos de VRAM dependen de la variante elegida.
- MobileSAM puede ejecutarse en CPU con razonable latencia (inferior a 100 ms en imágenes de 1024x1024 en un procesador moderno), lo que lo hace apto para equipos sin GPU.
- Las variantes SAM 2 y SAM 2.1 requieren GPU para un rendimiento interactivo; se recomienda al menos 8 GB de VRAM para Tiny/Small y 16 GB o más para Base+ y Large.
- Al ser modelos ONNX, se pueden desplegar con ONNX Runtime en CPU, CUDA, TensorRT o DirectML, así como en plataformas edge como Jetson o Raspberry Pi (solo MobileSAM).
- AnyLearning es una aplicación de escritorio que integra estos modelos; para el entrenamiento de modelos personalizados se necesitan recursos adicionales (GPU con suficiente VRAM, memoria RAM).
- No se proporcionan datos de latencia o throughput específicos en la documentación del repositorio.

## Comparativa con modelos similares

| Modelo | Tamaño | Formato | Licencia | Segmentación promptable | Uso en AnyLearning |
|---|---|---|---|---|---|
| `nrl-ai/anylearning-labeling-models` | 36 MB – 910 MB (9 variantes) | ONNX | Apache 2.0 | Sí (puntos, cajas) | Integrado |
| `facebook/sam-vit-huge` | 2,5 GB (PyTorch) | PyTorch | Apache 2.0 | Sí | Requiere conversión a ONNX |
| `facebook/sam2-hiera-large` | 900 MB (PyTorch) | PyTorch | Apache 2.0 | Sí (imagen y vídeo) | Requiere conversión a ONNX |
| `ChaoningZhang/MobileSAM` | 40 MB (PyTorch) | PyTorch | Apache 2.0 | Sí | Requiere conversión a ONNX |

La principal diferencia frente a los repositorios originales es el formato ONNX listo para usar y la integración con AnyLearning, que elimina la necesidad de convertir los pesos manualmente. Los modelos originales ofrecen soporte completo de vídeo (SAM 2), mientras que aquí solo se incluyen los componentes de imagen.

## Limitaciones y advertencias

- Los modelos pueden reproducir sesgos presentes en sus datos de entrenamiento (SA-1B, SA-V), como sobrerrepresentación de ciertas categorías de objetos o regiones geográficas.
- La salida de segmentación no debe utilizarse como única base para decisiones críticas de seguridad, médicas, legales o similares; siempre se requiere revisión humana.
- La calidad y latencia varían según el contenido de la imagen, el hardware y el execution provider de ONNX Runtime.
- La funcionalidad de vídeo de SAM 2 no está disponible en estos paquetes; solo se ofrece segmentación de imágenes estáticas.
- Aunque la licencia es Apache 2.0, es responsabilidad del usuario verificar las licencias de los modelos originales y de las dependencias de ONNX Runtime en su entorno de despliegue.
- Los archivos ZIP deben verificarse mediante SHA-256 antes de su uso para evitar manipulaciones; el repositorio recomienda rechazar rutas absolutas, traversal de directorios, enlaces o archivos duplicados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nrl-ai/anylearning-labeling-models
- Sitio web de AnyLearning: https://anylearning.nrl.ai/
- Repositorio de AnyLearning (GitHub): https://github.com/nrl-ai/anylearning-oss
- Sitio web de AnyLabeling (herramienta relacionada): https://anylabeling.nrl.ai/
- Paper de SAM: https://arxiv.org/abs/2304.02643
- Paper de SAM 2: https://arxiv.org/abs/2408.00714
- Proyecto SAM 2 (GitHub): https://github.com/facebookresearch/sam2
- Proyecto SAM (GitHub): https://github.com/facebookresearch/segment-anything
- Proyecto MobileSAM (GitHub): https://github.com/ChaoningZhang/MobileSAM
