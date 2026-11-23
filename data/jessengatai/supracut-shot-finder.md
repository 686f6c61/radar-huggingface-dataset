# jessengatai/supracut-shot-finder

## Resumen

SupraCut Shot Finder es un paquete de modelos Core ML compilados que el autor (jessengatai) publica para alimentar la función Shot Finder de la aplicación SupraCut, una herramienta de búsqueda de metraje por similitud visual o textual. No se trata de un modelo único, sino de un conjunto de codificadores de imagen y texto empaquetados como archivos `.mlmodelc.zip`: OpenCLIP ViT-B/32 entrenado con LAION-2B (mitad de imagen y mitad de texto), DINOv2 base y Perception Encoder Spatial B16 de Meta. El objetivo es permitir la búsqueda de clips que se parezcan a una imagen, a otro clip o a una consulta escrita.

El repositorio es de inferencia exclusivamente: contiene pesos convertidos desde PyTorch y verificados contra el original con similitud coseno entre 0,99935 y 1,00000. No incluye información sobre entrenamiento propio, datos de ajuste fino ni benchmarks de recuperación. El tamaño total del repositorio es de 0,6 GB y no registra descargas ni interacciones en el momento de la consulta.

Su relevancia es acotada pero clara para desarrolladores de aplicaciones macOS/iOS que necesiten un pipeline de búsqueda multimodal on-device: ofrece artefactos Core ML listos para usar con licencias permisivas en los modelos subyacentes (MIT para OpenCLIP, Apache 2.0 para DINOv2 y Perception Encoder), aunque la licencia del paquete en sí figura como "other".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT (OpenCLIP ViT-B/32, DINOv2 base, Perception Encoder Spatial B16); codificadores de imagen y texto |
| Parametros totales | no disponible (no se detallan por componente; ViT-B/32 y ViT-B rondan los 86-88 M de parametros, pero no se confirma en la informacion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelos de extraccion de caracteristicas, sin contexto generativo) |
| Tipos de cuantizacion | no disponible (se distribuyen como `.mlmodelc` compilados; no se especifica precision, probablemente FP16 por defecto en Core ML, sin confirmar) |
| Idiomas soportados | no disponible (el componente de texto CLIP usa vocabulario BPE; cobertura multilingue no declarada) |
| Licencia | other (modelos subyacentes: MIT para OpenCLIP, Apache 2.0 para DINOv2 y Perception Encoder) |
| Formato de pesos | Core ML compilado (`.mlmodelc.zip`); vocabulario en `clip-bpe-vocab.txt` |

## Arquitectura y entrenamiento

El paquete agrupa tres familias de codificadores visuales. OpenCLIP ViT-B/32 se entrenó sobre LAION-2B y se distribuye en dos mitades separadas (imagen y texto), lo que permite calcular embeddings alineados para búsqueda texto-imagen. DINOv2 base aporta características visuales autosupervisadas robustas para similitud imagen-imagen. Perception Encoder Spatial B16 (Meta, vía timm) procesa el fotograma completo en 16:9 y agrupa la salida en una rejilla de 2×4, lo que sugiere un uso orientado a la composición espacial del encuadre.

No hay información sobre entrenamiento adicional, ajuste fino, RLHF ni datasets propios. La única validación documentada es la conversión: cada modelo Core ML se comparó con su equivalente PyTorch obteniendo una similitud coseno de 0,99935 a 1,00000, lo que indica una conversión fiel sin degradación apreciable de los embeddings. No se mencionan innovaciones como decodificación especulativa ni atención lineal, ya que no son modelos generativos.

## Capacidades

- Extracción de embeddings de imagen con OpenCLIP ViT-B/32, DINOv2 base y Perception Encoder Spatial B16.
- Extracción de embeddings de texto con la mitad textual de OpenCLIP ViT-B/32, usando el vocabulario BPE incluido.
- Búsqueda por similitud texto-imagen (consulta escrita frente a fotogramas).
- Búsqueda por similitud imagen-imagen y clip-imagen (encontrar metraje que se parezca a una referencia).
- Codificación de composición espacial mediante la rejilla 2×4 de Perception Encoder Spatial.
- Inferencia on-device en el ecosistema Apple a través de Core ML.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Búsqueda de metraje por descripción textual en editores de vídeo: el usuario escribe una frase y el sistema compara el embedding de texto de OpenCLIP con los embeddings de los fotogramas para ordenar los clips por similitud.
- Búsqueda por imagen de referencia en archivos audiovisuales: se codifica una imagen con DINOv2 u OpenCLIP y se recuperan los fotogramas con mayor similitud coseno, útil para localizar planos con estética parecida.
- Deduplicación y agrupación de clips: los embeddings permiten agrupar tomas visualmente similares dentro de un proyecto y descartar duplicados antes del montaje.
- Detección de encuadre y composición: Perception Encoder Spatial con rejilla 2×4 permite filtrar planos por distribución espacial de la escena, por ejemplo para seleccionar primeros planos o planos generales.
- Preetiquetado de bibliotecas de vídeo: generar índices de embeddings una sola vez y reutilizarlos para búsquedas posteriores sin recompilar el modelo.
- Aplicaciones macOS/iOS con privacidad por diseño: al ejecutarse en Core ML, la indexación y la búsqueda pueden hacerse localmente sin enviar fotogramas a un servidor.
- Prototipado de recuperación multimodal: usar los embeddings como entrada para un reordenador o un clasificador propio en un pipeline de búsqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica documentada es la fidelidad de conversión a Core ML (similitud coseno de 0,99935 a 1,00000 frente a PyTorch). No hay datos de recall, mAP ni latencia.

## Requisitos de hardware

- Almacenamiento: el repositorio completo ocupa 0,6 GB; cada `.mlmodelc.zip` se descomprime en el bundle de la aplicación.
- VRAM/memoria unificada: no disponible de forma explícita; los codificadores ViT-B son ligeros y caben holgadamente en la memoria unificada de un Mac o en la de un iPhone/iPad moderno.
- GPU recomendadas: cualquier Mac con Apple Silicon (M1 o posterior) o dispositivos iOS/iPadOS compatibles con Core ML; no se documentan requisitos para GPU NVIDIA.
- Cabe en GPU de consumo: sí, en el sentido de que está pensado para hardware Apple; no se ofrecen pesos para CUDA.
- Opciones de despliegue: Core ML (`.mlmodelc`), a través de la app SupraCut o integrándolo en un proyecto propio con Core ML. No se distribuyen formatos GGUF, safetensors ni ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SupraCut Shot Finder (este paquete) | no disponible | no aplica | Core ML | other (subyacentes MIT/Apache 2.0) | Hugging Face, 0 descargas |
| OpenCLIP ViT-B/32 (original) | ~88 M (no confirmado en la ficha) | no aplica | PyTorch/safetensors | MIT | open_clip, ampliamente usado |
| DINOv2 base (original) | ~86 M (no confirmado en la ficha) | no aplica | PyTorch/safetensors | Apache 2.0 | facebook/dinov2-base |
| Perception Encoder Spatial B16 (original) | no disponible | no aplica | PyTorch (timm) | Apache 2.0 | timm |

La ventaja de este paquete frente a los originales es la conversión verificada a Core ML para despliegue en Apple; la desventaja es la ausencia de documentación de rendimiento y de soporte fuera del ecosistema Apple.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas; solo embeddings.
- Sin benchmarks publicados de calidad de recuperación (recall, mAP); el rendimiento real en búsqueda no está validado en la información disponible.
- La licencia del paquete figura como "other", lo que exige revisar los términos del autor antes de uso comercial, aunque los modelos subyacentes sean MIT o Apache 2.0.
- Cobertura idiomática del codificador de texto no declarada; el vocabulario BPE de CLIP puede rendir peor en castellano que en inglés.
- Dependencia del ecosistema Apple: los `.mlmodelc` no son portables a CUDA ni a CPU x86 sin reconversión.
- Riesgo de sesgo heredado de LAION-2B en OpenCLIP (sesgos de representación y asociación en los embeddings).
- Repositorio sin descargas ni validación comunitaria; creado y actualizado en noviembre de 2026 según los metadatos, lo que conviene contrastar antes de confiar en él en producción.
- No se documentan límites de resolución de entrada ni preprocesado esperado (normalización, tamaño de recorte), lo que puede provocar discrepancias si se integra fuera de SupraCut.

## Enlaces

- Hugging Face: https://huggingface.co/jessengatai/supracut-shot-finder
- open_clip (repositorio): https://github.com/mlfoundations/open_clip
- DINOv2 base: https://huggingface.co/facebook/dinov2-base
- Perception Encoder Spatial B16 vía timm: https://huggingface.co/timm
