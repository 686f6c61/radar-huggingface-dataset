# ddalcu/MiniMax-H3-Image-MLX-Serve-8bit

## Resumen
MiniMax-H3-Image MLX-Serve 8-bit es una conversión cuantizada a 8 bits del modelo de generación y edición de imágenes MiniMaxAI/MiniMax-H3-Image, empaquetada por ddalcu para su uso nativo en Apple Silicon mediante la herramienta mlx-serve. El paquete incluye en un único directorio todos los componentes necesarios para la inferencia: el transformer de difusión (DiT) con sus seis cabeceras de salida por paso, el codificador de texto MiniMax-H3, el VAE de imagen y el tokenizador. Está pensado para ejecutarse localmente en Macs con al menos 48 GB de memoria unificada.

El modelo resuelve dos tareas principales: generación de imágenes a partir de texto (text-to-image) y edición de imágenes con hasta 16 imágenes de referencia. Su rasgo técnico más distintivo es que emplea solo seis pasos de muestreo fijos y no utiliza classifier-free guidance, lo que reduce el coste computacional por imagen. La resolución de entrenamiento alcanza aproximadamente 16 megapíxeles (4096x4096, 6272x2688).

Esta variante de 8 bits se posiciona como la opción de mayor fidelidad frente a la de 4 bits del mismo autor, con mejoras visibles en estructuras pequeñas (patas y antenas de insectos, texturas de punto, formas de caramelos en ediciones). El coste es un mayor tamaño de descarga (65,8 GB frente a 36,9 GB) y un pico de memoria superior (27,4 GB frente a 15,9 GB en chips M1 a M4).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) con seis cabeceras de salida por paso, más codificador de texto MiniMax-H3 y VAE de imagen |
| Parametros totales | no disponible (el transformer ocupa 35,3 GB en 8 bits; el codificador de texto 28,2 GB) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible (el modelo es de imagen; no se especifica ventana de texto) |
| Tipos de cuantizacion | 8-bit affine con group size 64 (260 matrices del DiT y las 50 capas del codificador de texto que lee el DiT); 271 tensores pequeños en denso; VAE en f32 original |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3-Image Community License Agreement (restricción territorial: excluye UE, Reino Unido, Corea del Sur y EE. UU.) |
| Formato de pesos | safetensors (transformer.safetensors, text_encoder.safetensors, image_vae.safetensors) |

## Arquitectura y entrenamiento
La arquitectura es un transformer de difusión (DiT) que integra seis cabeceras de salida por paso de muestreo, lo que permite generar una imagen en exactamente seis pasos fijos sin classifier-free guidance. El pipeline completo consta de tres etapas que se cargan secuencialmente en memoria: primero el codificador de texto MiniMax-H3 (del que el DiT lee 50 capas), después el DiT y finalmente el VAE de imagen. Este diseño por etapas hace que el pico de memoria sea el de la etapa más grande, no la suma de todas.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo está entrenado para resoluciones de hasta aproximadamente 16 megapíxeles y soporta edición con hasta 16 imágenes de referencia en total (una imagen fuente más hasta 15 referencias adicionales). La conversión a 8 bits aplica cuantización affine con group size 64 a 260 matrices del DiT y a las capas del codificador de texto, manteniendo 271 tensores pequeños en precisión densa y el VAE en f32.

## Capacidades
- Generación de imágenes a partir de texto (text-to-image) en resoluciones de hasta 4096x4096 y 6272x2688 (aproximadamente 16 megapíxeles).
- Edición de imágenes: modificación de una imagen fuente guiada por prompt, con soporte de hasta 15 imágenes de referencia adicionales (16 en total).
- Referencias visuales identificables en el prompt mediante marcadores `<Picture 1>`, `<Picture 2>`, etc.
- Generación en seis pasos de muestreo fijos, sin classifier-free guidance, lo que simplifica la configuración (se rechazan `guidance_scale`, LoRAs y variaciones).
- Control de tamaño por petición: cada lado entre 16 y 6272 píxeles; las peticiones menores que el área mínima de generación se generan en un lienzo de esa área y se reescalan.
- API compatible con el formato de imágenes de OpenAI (`/v1/images/generations`, respuesta en `data[0].b64_json` como PNG).
- Ejecución nativa en Apple Silicon mediante MLX, con servidor local accesible por HTTP.

## Casos de uso
- Generación de ilustraciones y material gráfico para prototipos: un desarrollador puede lanzar peticiones a la API local en `/v1/images/generations` con prompts descriptivos y obtener PNG a 2048x2048 en unos 15 segundos en un M5 Ultra, útil para iterar sobre conceptos visuales sin depender de servicios en la nube.
- Edición fotográfica asistida por prompt: sustituir colores, objetos o texturas en una imagen existente (por ejemplo, "hacer la bicicleta de `<Picture 1>` amarilla brillante") manteniendo el tamaño de la fuente, adecuado para retoque rápido en flujos de diseño.
- Composición con múltiples referencias: combinar hasta 16 imágenes de referencia para tareas como crear un producto con la paleta de una referencia, el estilo de otra y la composición de una tercera, útil en direcciones de arte y moodboards.
- Generación de assets para videojuegos o pixel art: el modelo produce muestras de pixel art y texturas (según los ejemplos de la model card), lo que permite generar sprites o fondos con coherencia de estilo a resoluciones altas.
- Flujos de trabajo offline y privados: al ejecutarse localmente en un Mac con 48 GB o más, permite procesar imágenes sensibles sin enviarlas a servicios externos, relevante para estudios con requisitos de confidencialidad.
- Automatización de variaciones visuales en pipelines internos: mediante el servidor HTTP local se pueden encadenar peticiones con semillas fijas (`seed`) para reproducir resultados y generar lotes controlados de imágenes para pruebas A/B de creatividades.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta métricas de rendimiento de inferencia:

| Metrica | 8-bit | 4-bit (referencia) |
|---|---|---|
| Tamano de descarga | 65,8 GB | 36,9 GB |
| Pico de memoria, M1 a M4 | 27,4 GB | 15,9 GB |
| Pico de memoria, M5 con 64 GB o mas | 27,6 GB | 22,7 GB |
| Mac recomendado | 48 GB o mas | 32 GB o mas |
| Texto a imagen 2048x2048, M5 Ultra | 15 s | 13 s |
| Edicion con una referencia, M5 Ultra | 24 s | 22 s |

## Requisitos de hardware
- VRAM/memoria unificada estimada: pico de 27,4 GB en chips M1 a M4; 27,6 GB en M5 con 64 GB o más (donde mlx-serve ejecuta el DiT como int8 por defecto).
- Mac recomendado: 48 GB de memoria unificada o más.
- Cabe en GPU de consumo: no aplica directamente, ya que está diseñado para Apple Silicon (memoria unificada); no se documenta soporte para GPUs NVIDIA o AMD.
- Opciones de despliegue: aplicación mlx-serve (Create ▸ Image) o CLI (`mlx-serve pull` y `mlx-serve --serve --port 8080`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 15 s por imagen 2048x2048 de texto a imagen y 24 s por edición con una referencia en un M5 Ultra; el modelo carga las etapas de forma secuencial para limitar el pico de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax-H3-Image MLX-Serve 8-bit (este) | no disponible (35,3 GB DiT + 28,2 GB text encoder en 8 bits) | hasta ~16 MP; 6 pasos fijos; edicion con 16 imagenes | MiniMax-H3-Image Community License (excluye UE, RU, Corea del Sur y EE. UU.) | Hugging Face, via mlx-serve |
| MiniMax-H3-Image MLX-Serve 4-bit | no disponible (36,9 GB total) | hasta ~16 MP; 6 pasos fijos; edicion con 16 imagenes | MiniMax-H3-Image Community License | Hugging Face, via mlx-serve |
| MiniMaxAI/MiniMax-H3-Image (original) | no disponible | hasta ~16 MP; 6 pasos fijos; edicion con 16 imagenes | MiniMax-H3-Image Community License | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con otras familias de modelos de difusión.

## Limitaciones y advertencias
- Restricción territorial severa: la licencia excluye explícitamente la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos, y prohíbe el uso, reproducción, modificación, distribución y exhibición fuera del territorio aplicable. Verificar la jurisdicción antes de descargar o usar los archivos.
- Los archivos son modificados (cuantizados) respecto al modelo original; consultar MODIFICATIONS.md para conocer el alcance de los cambios.
- No se admiten `guidance_scale`, LoRAs ni variaciones: el modelo está fijado a seis pasos de muestreo, lo que limita el ajuste fino del resultado.
- Requiere hardware Apple Silicon con al menos 48 GB de memoria unificada para esta variante de 8 bits; no es desplegable en GPUs convencionales según la información disponible.
- No se documentan sesgos conocidos, riesgo de alucinación visual ni limitaciones idiomáticas específicas; los idiomas soportados figuran como no disponibles.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación comunitaria del paquete.
- El tamaño de descarga (65,8 GB) y el pico de memoria (27,4 GB) pueden ser prohibitivos en Macs de gama baja; para esos casos existe la variante de 4 bits.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ddalcu/MiniMax-H3-Image-MLX-Serve-8bit
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Variante de 4 bits: https://huggingface.co/ddalcu/MiniMax-H3-Image-MLX-Serve-4bit
- Repositorio de mlx-serve: https://github.com/ddalcu/mlx-serve
