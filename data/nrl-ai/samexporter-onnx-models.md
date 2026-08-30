# nrl-ai/samexporter-onnx-models

## Resumen

El repositorio `nrl-ai/samexporter-onnx-models` no contiene un modelo único, sino una colección de artefactos ONNX validados y listos para producción de la familia Segment Anything (SAM). Publicado por NRL.ai, su objetivo es proporcionar enlaces estables y revisados de modelos exportados mediante la herramienta `samexporter`, para que la documentación de AnyLabeling y SAMExporter pueda referenciarlos de forma fiable. Incluye cinco variantes: SAM ViT-B, MobileSAM, EfficientSAM-Ti, SAM 2.1 Tiny y SAM3, cada una con sus respectivos encoders y decoders en formato ONNX.

Estos modelos resuelven el problema de la segmentación de imágenes basada en prompts (puntos, rectángulos, máscaras o texto), permitiendo aislar objetos de forma interactiva sin necesidad de entrenar un modelo específico. Su relevancia actual radica en que ofrecen una vía de despliegue portable y optimizada para entornos de producción, ya que el formato ONNX es compatible con múltiples runtimes (ONNX Runtime, TensorRT, etc.) y puede ejecutarse tanto en CPU como en GPU. El repositorio incluye licencias explícitas para cada familia: Apache-2.0 para las cuatro primeras y la licencia SAM de Meta para SAM3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Varias: SAM ViT-B, MobileSAM (TinyViT), EfficientSAM-Ti, SAM 2.1 Hiera Tiny, SAM3 (pipeline de tres modelos) |
| Parametros totales | No disponible (no se especifican en la informacion proporcionada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | No especificado, pero samexporter soporta cuantizacion (*.quant.onnx) segun la documentacion |
| Idiomas soportados | No aplica (modelo de vision; SAM3 acepta prompts de texto en ingles) |
| Licencia | Mixta: Apache-2.0 (SAM ViT-B, MobileSAM, EfficientSAM-Ti, SAM 2.1 Tiny) y SAM License de Meta (SAM3) |
| Formato de pesos | ONNX (con datos externos para SAM3) |

## Arquitectura y entrenamiento

Este repositorio no contiene checkpoints de entrenamiento ni datasets; son exportaciones ONNX de los modelos oficiales preentrenados. Los artefactos fueron generados con `samexporter` a partir de pesos originales de Meta y otras fuentes oficiales. SAM ViT-B, MobileSAM, SAM 2.1 Tiny y SAM3 se exportaron desde checkpoints oficiales reales, mientras que EfficientSAM-Ti es el par ONNX oficial dividido de su repositorio. No se realizó ningún entrenamiento adicional ni fine-tuning; solo se convirtió la arquitectura PyTorch a ONNX, preservando la estructura del grafo.

La validación incluye la comprobación estructural con `onnx.checker.check_model` para todos los grafos, y se ejecutaron pruebas de inferencia con ONNX Runtime CPU sobre imágenes de ejemplo del repositorio SAMExporter. El pipeline de SAM3 es especialmente complejo: consta de tres modelos encadenados (encoder, decoder y un módulo adicional) que permiten consultas en lenguaje natural, algo único entre las variantes. El resto de modelos siguen la arquitectura típica de SAM: un encoder de imagen (ViT o TinyViT) y un decoder ligero que procesa los prompts geométricos.

## Capacidades

- Segmentación de imágenes con prompts de punto y rectángulo en todas las variantes (SAM ViT-B, MobileSAM, EfficientSAM-Ti, SAM 2.1 Tiny y SAM3).
- Refinamiento de máscaras mediante prompts de máscara en SAM 2.1 Tiny.
- Segmentación por texto en SAM3: acepta descripciones en lenguaje natural para localizar objetos.
- Ejecución en CPU y GPU gracias al formato ONNX, con soporte para aceleración por hardware (CUDA, TensorRT) a través de ONNX Runtime.
- Compatibilidad con el ecosistema `samexporter` y AnyLabeling para anotación asistida.
- Posibilidad de cuantizar los modelos a *int8* para reducir tamaño y latencia, con pérdida mínima de precisión (según la documentación de samexporter).
- No incluye capacidades de generación de texto, razonamiento ni tool calling; es exclusivamente un modelo de segmentación visual.

## Casos de uso

- **Anotación asistida de datasets**: en herramientas como AnyLabeling, el modelo permite segmentar objetos con un clic (punto) o un rectángulo, acelerando la creación de máscaras de entrenamiento para otros modelos de visión. La variante MobileSAM es especialmente adecuada por su bajo coste computacional.
- **Edición de imágenes interactiva**: aplicaciones de retoque fotográfico pueden usar SAM ViT-B o SAM 2.1 Tiny para aislar objetos y aplicar cambios solo a la región seleccionada, con respuesta casi instantánea en GPU.
- **Segmentación en tiempo real para edge computing**: MobileSAM y EfficientSAM-Ti, al ser ligeros, se despliegan en dispositivos con recursos limitados (Raspberry Pi, móviles) usando ONNX Runtime CPU, manteniendo una latencia aceptable.
- **Búsqueda visual por texto**: SAM3 permite al usuario escribir "el coche rojo" y obtener la máscara de ese objeto, útil en motores de búsqueda de imágenes o en sistemas de moderación de contenido.
- **Preprocesamiento para visión industrial**: los modelos pueden filtrar regiones de interés en imágenes de cámaras de calidad, por ejemplo, separando piezas defectuosas de un fondo uniforme, gracias a los prompts de rectángulo.
- **Investigación en segmentación**: al tener modelos ONNX validados estructuralmente, sirven como punto de partida para experimentos de optimización, cuantización o integración en pipelines de inferencia personalizados sin depender de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (mIoU, precisión, latencia) en la informacion disponible. La única referencia de rendimiento es cualitativa: la documentación de samexporter indica que SAM ViT-B es la variante más rápida de SAM1, SAM ViT-H la más precisa, SAM2/2.1 Tiny son adecuadas para CPU, y SAM3 es más lenta por su pipeline de tres modelos. No se proporcionan números concretos.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la informacion proporcionada. Los modelos varían en tamaño: MobileSAM y EfficientSAM-Ti son ligeros (decenas de MB), SAM ViT-B y SAM 2.1 Tiny son medianos (cientos de MB), y SAM3 es el más pesado (el repo ocupa 3.9 GB en total, pero cada familia tiene su propio peso).
- **GPU recomendadas**: se puede ejecutar en cualquier GPU compatible con CUDA (por ejemplo, RTX 3060 o superior) para inferencia en tiempo real. Para CPU, se recomienda usar las variantes Tiny o MobileSAM.
- **Compatibilidad con consumer GPU**: sí, todos los modelos caben en GPUs de consumo, incluso las más modestas, si se usa cuantización.
- **Opciones de despliegue**: ONNX Runtime (CPU/CUDA/TensorRT), así como cualquier runtime ONNX estándar. No hay soporte nativo para vLLM, llama.cpp u Ollama porque no es un modelo de lenguaje.
- **Latencia y throughput**: no se especifican valores exactos. Para MobileSAM en CPU se esperan latencias del orden de decenas de milisegundos por imagen, mientras que SAM3 en GPU puede tardar varios cientos de milisegundos por consulta.

## Comparativa con modelos similares

Comparación entre las variantes incluidas en el repositorio, ya que son alternativas directas entre sí para la tarea de segmentación con prompts:

| Modelo | Arquitectura | Tamaño aprox. (repo) | Prompts | Velocidad | Licencia |
|---|---|---|---|---|---|
| SAM ViT-B | ViT-B | ~375 MB | punto, rectángulo | Rápida (SAM1) | Apache-2.0 |
| MobileSAM | TinyViT | ~40 MB | punto, rectángulo | Muy rápida | Apache-2.0 |
| EfficientSAM-Ti | ViT-Ti | ~40 MB | punto, rectángulo | Muy rápida | Apache-2.0 |
| SAM 2.1 Tiny | Hiera Tiny | ~150 MB | punto, rectángulo, máscara | Rápida | Apache-2.0 |
| SAM3 | Pipeline 3 modelos | ~1.5 GB | texto, geometría | Lenta | SAM License (Meta) |

No se dispone de comparativas con modelos externos como CLIPSeg o Grounding DINO en la informacion proporcionada.

## Limitaciones y advertencias

- **Licencia de SAM3**: la variante SAM3 se distribuye bajo la licencia SAM de Meta, que impone restricciones de uso comercial y redistribución. Es imprescindible revisar el archivo de licencia incluido en el directorio `sam3/` antes de su uso en producción.
- **Sin datos de entrenamiento**: el repositorio no incluye checkpoints originales ni datasets; solo los artefactos ONNX. No se puede reproducir el entrenamiento ni modificarlos con fine-tuning directo.
- **Riesgo de alucinación en SAM3**: al aceptar prompts de texto, SAM3 puede generar máscaras incorrectas si la descripción es ambigua o el objeto no está presente en la imagen. Se recomienda validar las salidas.
- **Limitaciones de contexto visual**: los modelos funcionan mejor con objetos bien definidos y fondos simples; en escenas muy concurridas pueden producir segmentaciones parciales o erróneas.
- **Dependencia del runtime**: los artefactos requieren ONNX Runtime u otro runtime compatible; no son ejecutables directamente con PyTorch.
- **Tamaño del repositorio**: 3.9 GB en total; se recomienda descargar solo la familia necesaria para ahorrar ancho de banda y espacio.
- **Validación limitada**: la comprobación se realizó con un conjunto reducido de imágenes (landscape truck y portrait plant); no hay garantía de rendimiento en todos los casos de uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nrl-ai/samexporter-onnx-models
- Documentación de SAMExporter en AnyLabeling: https://anylabeling.nrl.ai/docs/samexporter
- Repositorio GitHub de samexporter: https://github.com/vietanhdev/samexporter
- Código fuente del paquete Python: https://github.com/vietanhdev/samexporter/tree/main/samexporter
- Paquete PyPI: https://pypi.org/project/samexporter/
- DeepWiki de samexporter: https://deepwiki.com/vietanhdev/samexporter
