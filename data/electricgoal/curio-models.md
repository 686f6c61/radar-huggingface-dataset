# ElectricGoal/curio-models

## Resumen

Curio models es un repositorio de conversiones a Core ML de los modelos de búsqueda visual que utiliza Curio, una aplicación de macOS que permite buscar fotografías por significado semántico directamente en el dispositivo. El repositorio lo mantiene el desarrollador ElectricGoal y no contiene pesos entrenados desde cero, sino dos modelos CLIP preexistentes convertidos a float16 Core ML: MobileCLIP-S4 de Apple, que actúa como opción por defecto, y CLIP ViT-B/32 de OpenAI como alternativa.

El problema que resuelve es la ausencia de artefactos listos para producción en formato Core ML de estos dos codificadores imagen-texto, de modo que la aplicación pueda descargarlos en el primer arranque y ejecutar búsqueda multimodal sin depender de servicios en la nube. Cada carpeta incluye un `image.mlpackage` (imagen RGB en rango 0–1 a embedding unitario), un `text.mlpackage` (77 token ids CLIP a embedding unitario), el fichero `bpe_merges.txt` del tokenizador, un `model.json` y un `files.json` con tamaños y SHA-256 para verificación de integridad.

Es relevante ahora porque ejemplifica el patrón de distribución de modelos para aplicaciones de escritorio en Apple Silicon: conversión a Core ML, cuantización a float16, verificación criptográfica de descargas y licencias heterogéneas por componente. El repositorio ocupa 1,2 GB y acumula 36 descargas, con licencia mixta que obliga a respetar la licencia de cada subcarpeta por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos codificadores CLIP independientes: MobileCLIP-S4 (Apple) y CLIP ViT-B/32 (OpenAI), convertidos a Core ML |
| Parametros totales | no disponible (no se indica el recuento en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; el codificador de texto acepta 77 token ids CLIP |
| Tipos de cuantizacion | float16 (único formato publicado) |
| Idiomas soportados | no disponible (CLIP ViT-B/32 esta entrenado mayoritariamente en ingles; MobileCLIP-S4 no lo especifica la card) |
| Licencia | mixta: MobileCLIP-S4 bajo Apple ML Research licence (solo uso de investigacion); CLIP ViT-B/32 bajo MIT |
| Formato de pesos | Core ML `.mlpackage` (float16), mas `bpe_merges.txt`, `model.json` y `files.json` |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. Contiene conversiones de dos arquitecturas CLIP (contrastive language-image pretraining) a Core ML: MobileCLIP-S4, un codificador eficiente disenado por Apple para dispositivos de borde, y CLIP ViT-B/32, el transformer de vision con parche 32x32 de OpenAI. Cada modelo se desdobla en dos grafos Core ML: uno de imagen que transforma una imagen RGB normalizada en rango 0–1 en un embedding unitario, y otro de texto que transforma 77 token ids CLIP en un embedding unitario en el mismo espacio latente. La similitud coseno entre ambos embeddings es lo que permite la busqueda por significado.

La unica transformacion aplicada es la conversion a float16 Core ML; los pesos son identicos a los originales. El proceso se automatiza con `scripts/convert-models.sh` del repositorio de Curio. No se documentan tokens de entrenamiento, composicion del dataset ni etapas de RLHF o DPO, porque no se ha reentrenado nada. El tokenizador se distribuye como `bpe_merges.txt`, coherente con el tokenizador BPE de CLIP.

## Capacidades

- Generacion de embeddings de imagen: codifica una imagen RGB en un vector unitario para busqueda y recuperacion.
- Generacion de embeddings de texto: codifica hasta 77 token ids CLIP en un vector unitario compatible con el espacio de imagen.
- Busqueda imagen-texto y texto-imagen mediante similitud coseno (zero-shot retrieval).
- Clasificacion zero-shot por comparacion de embeddings contra etiquetas textuales.
- Ejecucion totalmente on-device en macOS mediante Core ML, sin llamadas a red en inferencia.
- Verificacion de integridad de las descargas mediante SHA-256 declarado en `files.json`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto libre: son codificadores, no modelos generativos.
- No soporta vision generativa ni audio.

## Casos de uso

- Busqueda semantica de fotos en macOS: la aplicacion indexa la fototeca calculando embeddings de imagen con `image.mlpackage` y responde a consultas en lenguaje natural codificando la consulta con `text.mlpackage`; es el caso de uso original de Curio.
- Deduplicacion y agrupacion de imagenes: al comparar embeddings de imagen entre si se pueden detectar fotos casi identicas o agrupar por similitud visual sin etiquetas.
- Clasificacion zero-shot de un archivo fotografico: se construyen etiquetas textuales ("paisaje", "retrato", "documento") y se asigna la de mayor similitud coseno, sin reentrenar.
- Filtrado de contenido en pipelines locales: un paso previo que descarte o marque imagenes comparandolas contra descripciones textuales antes de enviarlas a un modelo mayor.
- Prototipado rapido de interfaces de busqueda visual en Apple Silicon: al estar en Core ML, se integra directamente en apps Swift sin servidor ni GPU dedicada.
- Anotacion asistida de datasets: preetiquetar imagenes con descripciones candidatas generadas por similitud, reduciendo el trabajo manual en curacion de datos.
- Recuperacion multimodal en herramientas de gestion documental: indexar capturas y escaneos y recuperarlos por descripcion textual en lugar de por nombre de fichero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en Apple Silicon mediante Core ML (Neural Engine y GPU integrada); no requiere GPU dedicada ni CUDA.
- VRAM estimada: no disponible de forma desagregada; el repositorio completo ocupa 1,2 GB y los pesos estan en float16, por lo que la huella en memoria es del orden de cientos de MB por modelo.
- GPU recomendadas: no aplica; el destino es hardware Apple (M1 y posteriores). No hay soporte documentado para A100, H100 ni RTX 4090 en este formato.
- Cabe en cualquier Mac con Apple Silicon y en Macs Intel compatibles con Core ML, dado el tamano reducido de MobileCLIP-S4.
- Opciones de despliegue: Core ML nativo en macOS; no se distribuyen pesos GGUF ni safetensors, por lo que llama.cpp, Ollama, vLLM y TGI no son aplicables directamente a estos artefactos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de texto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Curio models (MobileCLIP-S4) | no disponible | 77 tokens CLIP | Core ML float16 | Apple ML Research (investigacion) | Hugging Face, 36 descargas |
| Curio models (CLIP ViT-B/32) | no disponible | 77 tokens CLIP | Core ML float16 | MIT | Hugging Face, 36 descargas |
| apple/MobileCLIP-S4 (original) | no disponible | 77 tokens CLIP | safetensors (PyTorch) | Apple ML Research | Hugging Face |
| openai/clip-vit-base-patch32 (original) | no disponible | 77 tokens CLIP | safetensors (PyTorch) | MIT | Hugging Face |

La diferencia practica frente a los originales es el formato: Curio models ofrece artefactos Core ML listos para macOS con verificacion SHA-256, mientras que los originales requieren conversion previa. En capacidades y pesos son equivalentes.

## Limitaciones y advertencias

- La licencia es mixta: MobileCLIP-S4 esta bajo Apple ML Research licence, restringida a uso de investigacion; el uso comercial de esa carpeta requiere revisar y probablemente negociar con Apple.
- CLIP ViT-B/32 es MIT, pero su rendimiento en idiomas distintos del ingles es limitado y no se documenta cobertura multilingue.
- Riesgo de alucinacion en el sentido de falsos positivos de recuperacion: la similitud coseno puede devolver resultados irrelevantes con consultas ambiguas o imagenes fuera de distribucion.
- Ventana de texto fija de 77 tokens CLIP, lo que limita consultas largas o descriptivas.
- No es un modelo generativo: no produce texto, codigo ni razonamiento; cualquier expectativa en ese sentido es un error de uso.
- Solo se publica float16 Core ML; no hay variantes cuantizadas a int8 ni pesos en otros formatos en este repositorio.
- El repositorio no declara idiomas soportados ni resultados de evaluacion, lo que dificulta estimar calidad antes de desplegar.
- Dependencia de la aplicacion Curio: los artefactos estan pensados para su descarga automatica en el primer arranque, no como paquete autonomo documentado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ElectricGoal/curio-models
- Repositorio de la aplicacion Curio: https://github.com/ElectricGoal/image-searching-macos
- MobileCLIP-S4 original: https://huggingface.co/apple/MobileCLIP-S4
- CLIP ViT-B/32 original: https://huggingface.co/openai/clip-vit-base-patch32
