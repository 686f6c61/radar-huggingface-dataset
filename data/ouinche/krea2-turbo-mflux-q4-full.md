# Ouinche/krea2-turbo-mflux-q4-full

## Resumen

Krea 2 Turbo — MLX 4-bit Full es una distribución cuantizada a 4 bits del modelo de generación de imágenes Krea 2 Turbo, originalmente publicado por Krea AI, adaptada al ecosistema de Apple Silicon mediante las librerías MLX y mflux. El autor del port es Ouinche (bajo el proyecto DiffusionBear), y el objetivo principal es resolver el problema de la huella de memoria elevada de las distribuciones estándar: mientras que la versión original incluye el codificador de texto en BF16 (~7,5 GB), esta versión incorpora un codificador de texto basado en Qwen pre-cuantizado a 4 bits (~2,15 GB), reduciendo el paquete total de ~16,5 GB a ~9,4 GB.

El modelo es relevante porque permite ejecutar generación de texto a imagen de última generación en Macs con 16 GB de memoria unificada sin sufrir presión de memoria ni errores de tipo Metal OOM, algo habitual con los pesos sin cuantizar. Se trata de un pipeline text-to-image completo que incluye el transformador DiT cuantizado (4 shards, ~6,8 GB), el codificador de texto cuantizado, el VAE en formato MLX (~483 MB) y el tokenizador completo de Qwen3-VL con sus plantillas de chat. El modelo base es krea/krea-2-turbo, una variante "turbo" pensada para generar imágenes en muy pocos pasos (el ejemplo de la model card usa 8 pasos de inferencia).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline text-to-image (transformador de difusión + codificador de texto basado en Qwen + VAE); detalles del tipo de transformador no disponibles |
| Parametros totales | 2.004.396.620 (según metadatos de safetensors) |
| Parametros activos | no disponible (no es un modelo de lenguaje MoE) |
| Longitud de contexto | no disponible (modelo de difusión; depende del tokenizador Qwen3-VL) |
| Tipos de cuantizacion | 4 bits (transformador y codificador de texto, formato MLX) |
| Idiomas soportados | en (según metadatos; el tokenizador Qwen3-VL puede soportar más, pero no está documentado) |
| Licencia | creativeml-openrail-m (CreativeML Open RAIL-M) |
| Formato de pesos | safetensors (formato MLX cuantizado) |

## Arquitectura y entrenamiento

Esta distribución no es un modelo nuevo, sino un port cuantizado del modelo base krea/krea-2-turbo desarrollado por Krea AI. El paquete se compone de tres piezas: un transformador de difusión cuantizado a 4 bits (~6,8 GB repartidos en 4 shards de safetensors), un codificador de texto basado en Qwen pre-cuantizado a 4 bits (~2,15 GB) y un VAE nativo de MLX (~483 MB). El tokenizador incluido es el de Qwen3-VL, con sus plantillas de chat completas, lo que sugiere que el codificador de texto de Krea 2 Turbo deriva de la familia Qwen. No se ha publicado información sobre la arquitectura exacta del transformador (DiT, flux-like u otra variante) ni sobre el proceso de destilación que permite la variante "turbo".

Sobre el entrenamiento del modelo original no hay datos publicados en la model card: no se conoce el número de tokens o imágenes de entrenamiento, la composición del dataset ni el uso de técnicas de alineación. La innovación principal de este repositorio es de ingeniería de despliegue, no de modelado: la cuantización previa del codificador de texto evita la cuantización al vuelo en el primer arranque (arranque instantáneo), ahorra más de 7 GB de descarga y disco, y permite ejecutar todo el pipeline en Macs con 16 GB de memoria unificada sin errores de memoria de Metal.

## Capacidades

- Generación de texto a imagen (pipeline text-to-image) con prompts en lenguaje natural.
- Generación rápida en modo "turbo": el ejemplo oficial usa 8 pasos de inferencia, indicativo de un modelo destilado para pocos pasos.
- Comprensión de prompts mediante un codificador de texto basado en Qwen (tokenizador Qwen3-VL con plantillas de chat), lo que puede mejorar el seguimiento de prompts complejos frente a codificadores tipo CLIP.
- Resoluciones configurables (el ejemplo usa 768x768); no se documentan límites máximos de resolución.
- Integración nativa con las librerías MLX y mflux para Apple Silicon, y soporte de un clic en la aplicación DiffusionBear.
- No aplica: tool calling, agentes, razonamiento multi-paso ni capacidades de visión/audio como modelo (aunque el tokenizador provenga de Qwen3-VL).

## Casos de uso

- Generación de imágenes en portátiles Mac sin GPU dedicada: al caber el pipeline completo en 16 GB de memoria unificada, es adecuado para crear ilustraciones, concept art o assets directamente en un MacBook Pro o Mac mini sin servidor externo.
- Prototipado rápido de prompts: la variante turbo con 8 pasos permite iterar decenas de variaciones visuales en minutos, útil para diseñadores explorando direcciones creativas.
- Producción de assets para juegos y marketing: generación de fondos, texturas conceptuales o imágenes promocionales 768x768 (o resolución configurable) desde prompts en castellano o inglés.
- Integración en aplicaciones nativas de macOS: la API de mflux permite incrustar la generación de imágenes en apps locales, sin enviar datos a la nube, relevante para flujos con requisitos de privacidad.
- Estudios de difusión locales de un clic: DiffusionBear ofrece soporte nativo, ideal para usuarios que quieren generación de imágenes sin configurar entornos Python.
- Automatización por lotes en Apple Silicon: mediante scripts Python con mflux, se pueden generar series de imágenes (por ejemplo, variantes de un prompt con distintas semillas) de forma desatendida en un Mac.
- Ahorro de ancho de banda y disco en despliegues múltiples: el tamaño reducido (~9,4 GB frente a ~16,5 GB) facilita instalar el modelo en varios equipos o en entornos con almacenamiento limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para un modelo text-to-image serían relevantes métricas como FID, CLIP Score o evaluaciones humanas, pero ni la model card ni los metadatos del repositorio aportan cifras. El único dato de rendimiento indirecto es el uso de 8 pasos de inferencia en el ejemplo oficial, coherente con una variante turbo destilada para pocos pasos.

## Requisitos de hardware

- Memoria: diseñado para Macs con 16 GB de memoria unificada; el autor indica que funciona sin presión de memoria ni errores Metal OOM. El tamaño total en disco es de unos 9,4-10 GB.
- Hardware objetivo: Apple Silicon (MacBook Pro, Mac mini, Mac Studio con chips M1/M2/M3/M4); no está orientado a GPUs NVIDIA, ya que MLX es el framework de Apple.
- Consumer hardware: cabe cómodamente en Macs de consumo con 16 GB de RAM; en Macs con 24-32 GB o más habrá margen adicional para resoluciones mayores o generación por lotes.
- Software de despliegue: MLX y mflux (biblioteca Python, con API `Krea2` mostrada en el ejemplo), y DiffusionBear como interfaz gráfica nativa de un clic. No es compatible con vLLM, llama.cpp, Ollama ni TGI (son herramientas para modelos de lenguaje, no para difusión).
- Latencia: no se publican tiempos de generación concretos; el arranque es inmediato al estar pre-cuantizado, y la variante turbo requiere solo 8 pasos de inferencia por imagen en el ejemplo oficial.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantizacion | Tamano | Plataforma | Licencia |
|---|---|---|---|---|---|
| Ouinche/krea2-turbo-mflux-q4-full | Text-to-image (Krea 2 Turbo) | 4 bits (transformador + codificador de texto) | ~9,4 GB | Apple Silicon (MLX/mflux) | CreativeML Open RAIL-M |
| krea/krea-2-turbo (base) | Text-to-image | Sin cuantizar (codificador de texto en BF16, ~7,5 GB) | ~16,5 GB | Multiplataforma (PyTorch/ComfyUI) | no disponible |
| FLUX.1-schnell (referencia de categoria) | Text-to-image destilado 4 pasos | BF16 y variantes GGUF/MLX de la comunidad | ~12-24 GB sin cuantizar | Multiplataforma | Apache 2.0 |

Comparado con la distribución base de krea/krea-2-turbo, esta versión ahorra más de 7 GB y es la única de las dos que funciona con holgura en Macs de 16 GB. Frente a alternativas como FLUX.1-schnell, comparte el enfoque de pocos pasos, pero Krea 2 Turbo usa un codificador de texto basado en Qwen en lugar de T5/CLIP, y esta distribución concreta está limitada al ecosistema Apple Silicon mediante MLX, mientras que FLUX tiene soporte más amplio (CUDA, GGUF, ComfyUI). No hay datos de benchmarks que permitan comparar calidad de imagen entre ellos.

## Limitaciones y advertencias

- Licencia CreativeML Open RAIL-M: permite uso comercial con las restricciones de uso responsable de la licencia OpenRAIL (cláusulas de uso prohibido vinculantes). Verificar la licencia del modelo base krea/krea-2-turbo, listada como "other" en los metadatos, antes de cualquier despliegue comercial.
- Cuantización a 4 bits: puede suponer una pérdida de calidad de imagen respecto a los pesos BF16 originales, tanto en el transformador como en el codificador de texto; no se publican evaluaciones cuantificando esa degradación.
- Plataforma limitada: el formato MLX solo funciona en Apple Silicon; no es utilizable directamente en GPUs NVIDIA ni en la mayoría de servidores de inferencia habituales.
- Idioma: los metadatos indican inglés como idioma soportado; el rendimiento con prompts en castellano no está documentado, aunque el tokenizador Qwen3-VL suele tener cobertura multilingüe.
- Repositorio con actividad mínima: 0 descargas y 1 like en el momento de la ficha, y sin model card detallada del modelo original; conviene validar la calidad del port por cuenta propia antes de usarlo en producción.
- Riesgo habitual de modelos de difusión: sesgos presentes en los datos de entrenamiento del modelo base (no documentados aquí) y posibilidad de generar contenido sesgado o no deseado; la licencia OpenRAIL impone restricciones al respecto.
- Datos del modelo original (entrenamiento, resolución máxima, número de pasos óptimo) no disponibles en la información proporcionada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ouinche/krea2-turbo-mflux-q4-full
- Modelo base: https://huggingface.co/krea/krea-2-turbo
- Licencia CreativeML Open RAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- mflux (difusión en MLX): https://github.com/filipstrand/mflux
- DiffusionBear (aplicación de soporte nativo): https://github.com/OuincheWinch/DiffusionBear
