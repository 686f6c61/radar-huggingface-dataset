# sonealabs/dejashot-image-model

## Resumen

DejaShot Image Model es una conversión a Core ML del torreón de imagen (image tower) del modelo nomic-ai/nomic-embed-vision-v1.5, desarrollado originalmente por Nomic AI y convertido por SoneaLabs para su aplicación de escritorio DejaShot. El modelo genera embeddings de imagen de 768 dimensiones normalizados a longitud 1, que comparten espacio vectorial con nomic-embed-text v1.5, lo que permite comparar directamente una consulta en texto con una imagen mediante similitud coseno. No es un modelo generativo, sino un extractor de características visuales para búsqueda semántica multimodal.

La relevancia de esta conversión reside en su formato: un ML program de Core ML con pesos cuantizados a int8, pensado para ejecutarse íntegramente en Apple Silicon sin enviar datos a ningún servidor. Esto lo hace adecuado para aplicaciones de búsqueda de fotos locales, clasificación de imágenes en el dispositivo y pipelines de recuperación visual con requisitos de privacidad estrictos. El paquete ocupa aproximadamente 93 MB (0,1 GB en el repositorio) y requiere macOS 14 o superior.

Al tratarse de una conversión de inferencia sin reentrenamiento ni fine-tuning, sus capacidades dependen por completo del modelo base de Nomic. La ficha describe la arquitectura heredada, las especificaciones de la conversión y las limitaciones prácticas de desplegar un artefacto Core ML en lugar del modelo original en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión (torreón de imagen de nomic-embed-vision-v1.5), convertido a Core ML ML program |
| Parametros totales | no disponible (el repositorio no publica el recuento; el artefacto pesa 93.110.125 bytes en int8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de embedding de imagen con entrada fija de 224 × 224 píxeles) |
| Tipos de cuantizacion | int8 lineal simétrica por canal (`linear_quantize_weights` de coremltools); cómputo en fp16 |
| Idiomas soportados | no disponible (el modelo procesa imágenes; el emparejamiento textual depende de nomic-embed-text v1.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlpackage` (Core ML ML program) empaquetado en zip; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es una conversión del torreón de imagen de nomic-embed-vision-v1.5, un transformer de visión que produce un vector de 768 dimensiones a partir del token CLS normalizado. La entrada es un tensor `pixel_values` de forma fija `1 × 3 × 224 × 224`, preparado con el procesador de imagen del modelo base. La conversión se realizó trazando únicamente el torreón de imagen con PyTorch y transformándolo en un ML program de Core ML con forma de entrada fija; una operación `tensor_split` usada por el rotary embedding se reescribió en operaciones convertibles por coremltools sin alterar la aritmética.

El proceso no incluyó reentrenamiento ni fine-tuning: los pesos se cuantizaron de fp16 a int8 por canal y el cómputo se mantiene en fp16. La conversión se hizo con coremltools 9.0, torch 2.7.0 y transformers 4.51.3, partiendo de la revisión `e3a725bce72db07ca4adb1d83da08903f3ee02f8` del modelo original, con verificación SHA-256 de cada fichero de pesos antes de convertir. Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) no se recogen en la información disponible; el paper asociado es Nussbaum et al., 2024, «Nomic Embed Vision: Expanding the Latent Space» (arXiv:2406.18587).

## Capacidades

- Extracción de embeddings de imagen: genera un vector de 768 números normalizado a longitud 1 a partir de una imagen RGB de 224 × 224.
- Búsqueda texto-a-imagen: al compartir espacio vectorial con nomic-embed-text v1.5, permite comparar una consulta textual (con el prefijo `search_query: `) con un vector de imagen mediante similitud coseno.
- Búsqueda imagen-a-imagen y deduplicación visual: los vectores normalizados permiten comparar imágenes entre sí por distancia coseno o producto escalar.
- Ejecución local en Apple Silicon: el ML program se ejecuta en el dispositivo sin llamadas de red, lo que habilita flujos con privacidad por diseño.
- Integración en pipelines Core ML: el paquete es consumible desde Swift, Objective-C o Python (coremltools) en macOS 14 o superior.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto; es exclusivamente un encoder de imagen.
- Capacidades multilingües: no aplica al torreón de imagen; la cobertura idiomática de las consultas depende del modelo de texto emparejado.

## Casos de uso

- Búsqueda de fotos por descripción en aplicaciones de escritorio: DejaShot usa este modelo para indexar la fototeca local y responder a consultas en lenguaje natural comparando el embedding de texto con los vectores de imagen, sin enviar datos fuera del Mac.
- Organización automática de archivos multimedia: un script en macOS puede recorrer un directorio, calcular embeddings con Core ML y agrupar imágenes por similitud coseno para detectar duplicados o series.
- Moderación y filtrado visual en el dispositivo: clasificación por similitud contra un conjunto de embeddings de referencia (por ejemplo, imágenes no deseadas) sin depender de servicios en la nube.
- Recuperación aumentada en herramientas de documentación: indexar capturas de pantalla y diagramas para que un buscador interno devuelva la imagen relevante a partir de una consulta textual.
- Prototipado rápido de sistemas RAG multimodales: usar el modelo como encoder visual dentro de un pipeline que combine nomic-embed-text v1.5 para texto y este artefacto para imagen, con almacenamiento vectorial local.
- Aplicaciones de accesibilidad: describir o localizar imágenes por similitud semántica en herramientas de asistencia que deben funcionar sin conexión y con latencia baja.
- Filtrado previo en pipelines de visión más pesados: usar los embeddings como etapa de recuperación de candidatos antes de aplicar un modelo de captioning o detección más costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recuperación (recall@k, mAP) ni comparaciones numéricas con el modelo base en fp16; solo se documenta el tamaño del artefacto y su hash SHA-256.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en Apple Silicon mediante Core ML y memoria unificada. El artefacto pesa 93.110.125 bytes (unos 89 MiB) en int8.
- GPU recomendadas: cualquier Mac con Apple Silicon (series M1, M2, M3, M4 y posteriores) que ejecute macOS 14 o superior. No se distribuyen variantes para CUDA, ROCm ni CPU x86.
- Cabe en GPU de consumo: sí, en el sentido de que cabe holgadamente en la memoria unificada de cualquier Mac con Apple Silicon; no es desplegable en GPU NVIDIA o AMD convencionales sin reconvertir el modelo.
- Opciones de despliegue: Core ML (framework nativo de Apple), coremltools para carga desde Python, y APIs Vision/Core ML desde Swift y Objective-C. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un encoder de 224 × 224 con pesos int8 y cómputo fp16, se espera una latencia de milisegundos por imagen en Apple Silicon, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sonealabs/dejashot-image-model | no disponible | imagen 224 × 224, salida 768 d | Core ML int8 | Apache 2.0 | Hugging Face (0 descargas) |
| nomic-ai/nomic-embed-vision-v1.5 | no disponible | imagen 224 × 224, salida 768 d | PyTorch / safetensors | Apache 2.0 | Hugging Face (modelo base) |
| nomic-ai/nomic-embed-text-v1.5 | no disponible | texto, salida 768 d | PyTorch / safetensors | Apache 2.0 | Hugging Face (complementario para búsqueda) |
| CLIP ViT-B/32 (OpenAI) | no disponible | imagen 224 × 224, salida 512 d | PyTorch | MIT (pesos con términos propios) | Hugging Face, ampliamente desplegado |

La comparación relevante es con el modelo base: esta conversión sacrifica portabilidad fuera de Apple y fidelidad numérica potencial (por la cuantización int8) a cambio de ejecución local en macOS con un artefacto de menos de 100 MB. Frente a CLIP, el espacio de 768 dimensiones y la alineación explícita con nomic-embed-text v1.5 facilitan pipelines texto-imagen coherentes, aunque no se dispone de métricas comparativas publicadas en esta ficha.

## Limitaciones y advertencias

- Modelo exclusivamente de inferencia y extracción de características: no genera texto, no razona y no soporta tool calling ni agentes.
- Dependencia de plataforma: requiere macOS 14 o superior y Apple Silicon; no es usable en Linux, Windows, CUDA ni en la mayoría de servidores cloud sin reconversión.
- Entrada de forma fija `1 × 3 × 224 × 224`: no admite resoluciones variables ni batches dinámicos sin recompilar el ML program.
- Cuantización int8: puede introducir una degradación de la calidad de los embeddings frente al modelo base en fp16; no se documentan métricas de esa pérdida.
- Sesgos: al heredar el modelo base de Nomic, puede reproducir sesgos presentes en sus datos de entrenamiento visual; no se detallan en la información disponible.
- Riesgo de falsos positivos en búsqueda por similitud coseno: la calidad de la recuperación depende del umbral elegido y del modelo de texto emparejado.
- Idiomas: la cobertura lingüística de las consultas no está especificada y recae en nomic-embed-text v1.5, no en este artefacto.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar el aviso de licencia y citar el paper de Nomic si se usa el modelo.
- Adopción mínima: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción ni mantenimiento continuado.
- Fecha de creación del repositorio (2026-10-28) posterior a la conversión documentada; conviene verificar la integridad del artefacto con el SHA-256 publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sonealabs/dejashot-image-model
- Modelo base: https://huggingface.co/nomic-ai/nomic-embed-vision-v1.5
- Modelo de texto complementario: https://huggingface.co/nomic-ai/nomic-embed-text-v1.5
- Paper de Nomic Embed Vision: https://arxiv.org/abs/2406.18587
- Aplicación DejaShot: https://dejashot.com
- Nomic AI: https://www.nomic.ai
- Licencia Apache 2.0: http://www.apache.org/licenses/LICENSE-2.0
