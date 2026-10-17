# moondream/moondream3.1-9B-A2B

## Resumen

Moondream 3.1 es un modelo de lenguaje visual (image-text-to-text) con arquitectura de mezcla de expertos (MoE) desarrollado por Moondream. Cuenta con 9.273.869.808 parámetros totales y aproximadamente 2B parámetros activos por token, lo que sitúa su coste computacional de inferencia en el rango de un modelo denso de 2B pese a manejar un conocimiento parametrizado de 9B. Está publicado en Hugging Face con pesos en formato safetensors y un repositorio de 10,5 GB.

El modelo resuelve tareas de razonamiento visual, detección de objetos de vocabulario abierto y localización de puntos (pointing), con cuatro habilidades nativas que devuelven salida estructurada: `query` (VQA), `detect`, `point` y `caption`. Su propuesta de valor es ofrecer razonamiento visual de nivel alto con un coste de despliegue bajo, algo relevante para equipos que necesitan procesar imágenes a escala o ejecutar el modelo en hardware de gama media, incluidos equipos Apple Silicon.

Es relevante ahora porque combina tres factores poco habituales en modelos visuales de su categoría: arquitectura sparse (menos cómputo por token), salida estructurada nativa para detección y pointing (sin necesidad de post-procesado de texto libre) y un motor de inferencia propio, Photon, que permite ejecución local sin clave de API. La licencia es propietaria (Moondream Model License 1.0), no open source en sentido estricto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer visual-lenguaje; detalles de capas y attention no disponibles |
| Parametros totales | 9.273.869.808 (9,27B) |
| Parametros activos | Aproximadamente 2B por token (según model card) |
| Longitud de contexto | No disponible (la model card menciona "long-context queries" sin cifra) |
| Tipos de cuantizacion | No disponible (el repositorio publica safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Moondream Model License 1.0 (license: other) |
| Formato de pesos | Safetensors (repositorio de 10,5 GB) |

## Arquitectura y entrenamiento

Moondream 3.1 emplea una arquitectura de mezcla de expertos (sparse MoE) que activa aproximadamente 2B de sus 9,27B parámetros por token. La model card la describe como "sparse mixture-of-experts architecture with frontier-level visual reasoning, segmentation, and long-context queries", e indica que el modelo integra de forma nativa las habilidades `query`, `detect`, `point` y `caption`, todas devolviendo salida estructurada en lugar de texto libre. No se han publicado en la información disponible detalles sobre el número de expertos, la política de routing, la profundidad del transformer, el mecanismo de atención ni el codificador visual empleado.

Tampoco hay datos públicos en la información proporcionada sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación. El autor remite a las notas de lanzamiento ("release notes") para conocer el proceso de entrenamiento y la evaluación en tareas propias, pero esas cifras no están incluidas en el material disponible. La innovación declarada es la combinación de razonamiento visual de gama alta con un coste de despliegue reducido gracias al diseño sparse, junto con un motor de inferencia propietario (Photon) optimizado para GPUs NVIDIA Ampere o superiores y Apple Silicon.

## Capacidades

- Generación de descripciones de imagen (`caption`) con salida estructurada.
- Respuesta a preguntas visuales (`query`), incluyendo consultas de contexto largo según la model card.
- Detección de objetos de vocabulario abierto (`detect`): el usuario especifica la clase en lenguaje natural y el modelo devuelve las cajas correspondientes.
- Pointing (`point`): localización de instancias mediante puntos, útil para tareas de grounding y segmentación.
- Salida estructurada nativa: las cuatro habilidades devuelven objetos manipulables por código (por ejemplo, listas de objetos con coordenadas), no texto que haya que parsear.
- Razonamiento visual: la model card declara rendimiento de nivel "frontier" en razonamiento visual y segmentación, sin cifras publicadas en la información disponible.
- Ejecución local sin clave de API para el modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se publica lista de idiomas).
- Capacidades de audio o modo "thinking" explícito: no disponibles en la documentación consultada.

## Casos de uso

- **Control de calidad en línea de producción**: usar `detect` con clases de vocabulario abierto ("arañazo", "pieza mal montada", "etiqueta torcida") sobre imágenes de cámara industrial. La salida estructurada con cajas permite enviar directamente las detecciones al sistema de rechazo sin post-procesado de texto.
- **Automatización de inventario y estanterías**: detección y conteo de productos en fotografías de estantería. Los ~2B parámetros activos permiten procesar lotes grandes de imágenes con coste por imagen bajo frente a modelos densos de 9B.
- **Extracción de información de documentos escaneados**: con `caption` y `query` se pueden generar descripciones y responder preguntas sobre facturas, albaranes o formularios, integrándolo en un pipeline OCR + VQA donde la VQA resuelve los campos ambiguos.
- **Accesibilidad y descripción automática de imágenes**: generación de texto alternativo y descripciones para catálogos, intranets o aplicaciones de lectura de pantalla. La ejecución local vía Photon permite desplegarlo en una Mac sin enviar imágenes a la nube.
- **Grounding para robótica y automatización**: `point` devuelve coordenadas de instancias concretas, lo que sirve como entrada para brazos robóticos o sistemas de manipulación que necesitan localizar un objeto descrito en lenguaje natural.
- **Moderación y revisión de contenido visual**: clasificación y descripción de imágenes subidas por usuarios para detectar contenido no permitido, con `query` formulando preguntas binarias o de categoría sobre cada imagen.
- **Análisis de imágenes aéreas o de satélite**: la mención a consultas de contexto largo en la model card encaja con escenarios de inspección de imágenes de gran resolución o series de imágenes donde se hacen preguntas acumulativas.
- **Prototipado rápido de producto visual**: el playground y la API en la nube permiten validar la viabilidad de una función basada en visión antes de invertir en infraestructura de inferencia propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma razonamiento visual y detección de nivel "frontier" y remite a las notas de lanzamiento del blog para la evaluación completa, pero no incluye cifras de MMLU, HumanEval, GSM8K, DocVQA, RefCOCO ni de ningún otro conjunto. No se deben asumir números no publicados.

## Requisitos de hardware

- **VRAM estimada para inferencia (teórica, según 9,27B parámetros totales)**: en bf16/fp16, en torno a 18,5 GB solo de pesos, más overhead de activaciones y caché KV; en 8 bits, en torno a 9,3 GB de pesos; en 4 bits, en torno a 4,6 GB de pesos. Los requisitos reales de memoria dependen de la implementación y no están documentados.
- **Nota sobre el repositorio**: el tamaño publicado es de 10,5 GB, coherente con pesos almacenados a aproximadamente 8 bits por parámetro, aunque la precisión exacta no se documenta.
- **GPU soportadas oficialmente**: NVIDIA Ampere o más reciente (A100, H100, A10, L4, RTX 30/40) mediante Photon, el motor de inferencia propio de Moondream.
- **Apple Silicon**: soportado oficialmente por Photon (Macs con chip Apple Silicon).
- **GPU de consumo**: sí, previsiblemente en RTX 3090/4090 (24 GB) con pesos de 8 bits y margen para contexto; en tarjetas de 8-12 GB el encaje no está confirmado por el fabricante.
- **Opciones de despliegue**: Photon (local, recomendado por el autor), Moondream Cloud (endpoint gestionado) y serving de producción con Triton según la guía de inferencia local. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, ni se publican pesos GGUF.
- **Latencia y throughput**: no disponibles. El diseño MoE con ~2B parámetros activos sugiere un coste por token propio de un modelo de 2B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Detección / pointing nativo |
|---|---|---|---|---|---|
| Moondream 3.1 9B-A2B | 9,27B | ~2B (MoE) | No disponible | Moondream Model License 1.0 (propietaria) | Sí, `detect` y `point` con salida estructurada |
| Qwen2.5-VL-7B-Instruct | ~8,3B | Denso | 128k (según documentación pública de Qwen) | Apache 2.0 | Parcial, vía salida JSON en prompt |
| Llama-3.2-11B-Vision-Instruct | ~10,6B | Denso | 128k (según model card de Meta) | Llama 3.2 Community License | No nativo |
| InternVL3-8B | ~8B | Denso | No disponible en esta ficha | No disponible en esta fuente | No nativo |

La diferencia principal de Moondream 3.1 frente a estas alternativas es la combinación de arquitectura sparse (menor coste por token que un denso de 9-11B) y habilidades de detección y pointing integradas con salida estructurada. En contra, su licencia es propietaria, mientras que Qwen2.5-VL se distribuye bajo Apache 2.0 y Llama bajo licencia comunitaria. No hay datos de benchmarks que permitan comparar calidad de forma objetiva.

## Limitaciones y advertencias

- **Licencia no open source**: la Moondream Model License 1.0 es una licencia propia. Antes de usar el modelo en producción comercial hay que revisar los términos en el enlace oficial; no se puede asumir uso libre equivalente a Apache 2.0 o MIT.
- **Ausencia de datos de evaluación**: no hay cifras públicas de benchmarks en la información disponible, por lo que las afirmaciones de rendimiento "frontier" del autor no son verificables de forma independiente con los datos aportados.
- **Riesgo de alucinación**: como todo modelo de lenguaje visual, puede describir objetos inexistentes o inventar texto en imágenes, especialmente en escenas densas, imágenes de baja resolución o documentos con tipografías poco habituales. En detección conviene fijar umbrales de confianza.
- **Conteo y escenas densas**: la detección de vocabulario abierto suele degradarse con muchas instancias solapadas o clases visualmente ambiguas; no hay métricas publicadas de precisión o recall.
- **Idiomas no documentados**: no se publica lista de idiomas soportados. No se debe asumir un rendimiento multilingüe equivalente al de modelos con cobertura declarada; conviene validar con el idioma objetivo antes de desplegar.
- **Contexto no especificado**: se mencionan consultas de contexto largo, pero sin cifra de tokens, lo que impide dimensionar la caché KV y planificar memoria.
- **Dependencia del ecosistema del autor**: el despliegue local recomendado pasa por Photon, un motor propietario. No se documentan pesos GGUF ni integración con vLLM, llama.cpp, Ollama o TGI, lo que limita la portabilidad y el ajuste fino de la pila de serving.
- **Sesgos**: no hay información sobre la composición del dataset ni sobre evaluaciones de sesgo; deben hacerse pruebas propias si el modelo se aplica a personas o colectivos.
- **Caveat operativo**: las habilidades devuelven salida estructurada, pero el esquema exacto y su estabilidad entre versiones deben validarse en integración continua antes de depender de él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moondream/moondream3.1-9B-A2B
- Sitio oficial: https://moondream.ai/
- Notas de lanzamiento de Moondream 3.1: https://moondream.ai/blog/moondream-3-1-beyond-benchmarks
- Playground: https://moondream.ai/playground
- API en la nube: https://moondream.ai/p/cloud
- Motor de inferencia Photon: https://moondream.ai/p/photon
- Guía de inferencia local: https://docs.moondream.ai/running-locally
- Inicio rápido de la documentación: https://docs.moondream.ai/quickstart
- Licencia del modelo: https://moondream.ai/licenses/model/1.0
