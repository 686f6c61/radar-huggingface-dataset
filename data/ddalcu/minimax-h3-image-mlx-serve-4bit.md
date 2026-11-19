# ddalcu/MiniMax-H3-Image-MLX-Serve-4bit

## Resumen

MiniMax-H3-Image MLX-Serve 4-bit es una conversión cuantizada a 4 bits del modelo de generación y edición de imágenes MiniMaxAI/MiniMax-H3-Image, publicada por el desarrollador ddalcu para su ejecución nativa en Apple Silicon mediante la herramienta mlx-serve. El paquete es autocontenido: incluye el transformer de difusión (DiT) con sus seis cabezas de salida por paso, el codificador de texto MiniMax-H3, el VAE de imagen y el tokenizador en un único directorio de 36,9 GB.

El modelo resuelve dos tareas principales: text-to-image (generación desde prompt) e image editing con hasta 16 imágenes de referencia. Su rasgo técnico más destacable es la generación en solo seis pasos de muestreo fijos y sin classifier-free guidance, lo que reduce drásticamente el coste computacional frente a pipelines de difusión convencionales que requieren decenas de pasos.

Es relevante ahora porque permite ejecutar un modelo de imagen de gama alta en un Mac de 32 GB de memoria unificada, con un pico de memoria de 15,9 GB en chips M1 a M4 y tiempos de 13 segundos para una imagen de 2048x2048 en un M5 Ultra. La contraposición principal es su licencia: la MiniMax-H3-Image Community License Agreement excluye explícitamente de su territorio aplicable a la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con seis cabezas de salida por paso, codificador de texto MiniMax-H3 y VAE de imagen |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine con group size 64 (260 matrices del DiT y 50 capas del text encoder); VAE en f32 original |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3-Image Community License Agreement (restriccion territorial: excluye UE, Reino Unido, Corea del Sur y EE. UU.) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura se basa en un Diffusion Transformer (DiT) que incorpora seis cabezas de salida, una por cada paso de muestreo, lo que permite generar una imagen completa en exactamente seis forwards del transformer. El pipeline prescinde de classifier-free guidance, eliminando la necesidad de duplicar el coste de inferencia por cada paso. El codificador de texto es el MiniMax-H3 (del que se cuantizan las 50 capas que lee el DiT), y la decodificación final la realiza un VAE de imagen que se mantiene en precisión f32 original (2,3 GB). Las etapas se cargan secuencialmente (text encoder, DiT, VAE), de modo que el pico de memoria corresponde a la etapa mayor y no a la suma de todas.

Los detalles sobre el dataset de entrenamiento (número de tokens, composición, uso de RLHF o DPO) no están disponibles en la información proporcionada. La model card indica que el modelo está entrenado hasta aproximadamente 16 megapíxeles (4096x4096 o 6272x2688), y que las peticiones por debajo de `min_generation_area` (por defecto 2048x2048) se generan en un lienzo de esa área respetando la relación de aspecto y luego se reescalan. Los archivos son modificaciones del modelo base: el transformer ocupa 18,7 GB (260 matrices en 4-bit y 271 tensores pequeños en densidad completa) y el text encoder 15,8 GB.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución configurable, cada lado entre 16 y 6272 píxeles.
- Edición de imágenes (image-to-image) con una imagen fuente y hasta 15 imágenes de referencia adicionales, 16 en total; el resultado conserva el tamaño de la fuente.
- Generación en seis pasos de muestreo fijos, sin classifier-free guidance, lo que simplifica la API (los parámetros `steps`, `guidance_scale`, LoRAs y variaciones se rechazan por nombre).
- Soporte de seed para reproducibilidad (`"seed": 7` en el ejemplo de la model card).
- Salida en formato PNG codificado en base64 siguiendo el esquema de OpenAI (`data[0].b64_json`).
- API compatible con el endpoint `/v1/images/generations` de mlx-serve, con modo `edit` para edición.
- Ejecución nativa en Apple Silicon mediante MLX, con soporte de cuantización int8 automática del DiT en chips M5 con 64 GB o más.
- Capacidades multilingües: no disponible.

## Casos de uso

- Generación de imágenes fotorrealistas para prototipado de producto: con 2048x2048 por defecto y hasta 16 megapíxeles, un equipo de diseño puede iterar conceptos visuales en un Mac de 32 GB sin depender de servicios en la nube, con 13 segundos por imagen en un M5 Ultra.
- Edición fotográfica asistida: el modo `edit` permite modificar elementos concretos de una imagen fuente (por ejemplo, cambiar el color de una bicicleta) manteniendo el tamaño original, útil para retoque rápido en flujos de trabajo locales.
- Composición con múltiples referencias: las 16 imágenes de entrada (fuente más referencias) permiten tareas de transferencia de estilo, sustitución de objetos o combinación de elementos de varias fuentes en una sola generación.
- Generación de material gráfico para señalética y cartelería: la model card incluye muestras de un cartel de panadería, lo que sugiere su uso para crear rótulos y gráficos comerciales con texto integrado, aunque la calidad tipográfica no está documentada.
- Creación de arte pixelado y estilos ilustrados: entre las muestras del paquete figuran pixel art y bodegones, lo que indica versatilidad estilística para ilustración y contenido para juegos o publicaciones.
- Automatización de pipelines de contenido en local: la API compatible con OpenAI y el servidor mlx-serve permiten integrar la generación en scripts o aplicaciones internas sin salir del entorno Apple Silicon, con control de seed para resultados reproducibles.
- Investigación en modelos de difusión: al ser un paquete autocontenido con pesos cuantizados y código de referencia, sirve para estudiar el comportamiento de un DiT de seis pasos sin CFG en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta métricas de rendimiento de inferencia:

| Metrica | 4-bit | 8-bit |
|---|---|---|
| Descarga | 36,9 GB | 65,8 GB |
| Pico de memoria, M1 a M4 | 15,9 GB | 27,4 GB |
| Pico de memoria, M5 con 64 GB o más | 22,7 GB | 27,6 GB |
| Mac recomendado | 32 GB o más | 48 GB o más |
| Text to image 2048x2048, M5 Ultra | 13 s | 15 s |
| Edición con una referencia, M5 Ultra | 22 s | 24 s |

El pico de memoria corresponde a la medición propia de MLX (`peak_bytes` en `/props`) sobre una imagen de 2048x2048 y una edición. En M5 con 64 GB o más, mlx-serve ejecuta el DiT como int8 por defecto, lo que explica la diferencia de esa fila; en el resto de equipos los pesos 4-bit se usan tal cual.

## Requisitos de hardware

- VRAM/memoria unificada estimada: pico de 15,9 GB en chips M1 a M4 y de 22,7 GB en M5 con 64 GB o más (con DiT en int8 automático).
- Mac recomendado: 32 GB o más para el paquete 4-bit; 48 GB o más para el 8-bit.
- GPU: exclusivamente Apple Silicon (M1, M2, M3, M4, M5); no hay soporte documentado para GPUs NVIDIA o AMD en esta conversión.
- ¿Cabe en GPU de consumo? Sí, en Mac con memoria unificada de 32 GB o superior; no aplica a GPUs discretas convencionales.
- Opciones de despliegue: mlx-serve (app gráfica o CLI con `mlx-serve pull` y `mlx-serve --serve --port 8080`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 13 s por imagen 2048x2048 en text-to-image y 22 s por edición con una referencia en M5 Ultra; no se proporcionan datos para otros chips.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image MLX-Serve 4-bit | no disponible | no disponible | 13 s/imagen 2048x2048 en M5 Ultra; pico 15,9 GB | MiniMax-H3-Image Community License (excluye UE, UK, Corea del Sur y EE. UU.) | Hugging Face, 36,9 GB |
| MiniMax-H3-Image MLX-Serve 8-bit | no disponible | no disponible | 15 s/imagen 2048x2048 en M5 Ultra; pico 27,4 GB | MiniMax-H3-Image Community License | Hugging Face, 65,8 GB |
| MiniMaxAI/MiniMax-H3-Image (original) | no disponible | no disponible | no disponible | MiniMax-H3-Image Community License | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría (generación de imágenes en Apple Silicon) en la documentación proporcionada.

## Limitaciones y advertencias

- Restricción territorial grave: la licencia define el territorio aplicable como todo el mundo excepto la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos, y prohíbe el uso, reproducción, modificación, distribución y exhibición fuera de él. Verificar la jurisdicción antes de descargar y usar los archivos.
- Licencia "other" con nombre específico (MiniMax-H3-Image Community License Agreement): no es una licencia open source estándar; revisar LICENSE y NOTICE incluidos en el repositorio.
- Los archivos son modificaciones del modelo base (ver MODIFICATIONS.md); el comportamiento puede diferir del original.
- Los parámetros `steps`, `guidance_scale`, LoRAs y variaciones se rechazan por nombre: no es posible ajustar el número de pasos ni el guidance, lo que limita el control fino sobre la generación.
- El modelo está entrenado hasta unos 16 megapíxeles; solicitudes mayores pueden degradar la calidad.
- No hay información sobre sesgos, riesgo de alucinación visual o limitaciones idiomáticas en la documentación disponible.
- Dependencia exclusiva de Apple Silicon y de la herramienta mlx-serve: no hay soporte documentado para otros backends o GPUs.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del rendimiento o la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ddalcu/MiniMax-H3-Image-MLX-Serve-4bit
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Repositorio de mlx-serve: https://github.com/ddalcu/mlx-serve
- Versión 8-bit: https://huggingface.co/ddalcu/MiniMax-H3-Image-MLX-Serve-8bit
