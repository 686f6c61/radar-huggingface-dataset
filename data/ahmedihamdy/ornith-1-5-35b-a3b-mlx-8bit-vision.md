# ahmedihamdy/Ornith-1.5-35B-A3B-MLX-8bit-vision

## Resumen

Ornith-1.5-35B-A3B-MLX-8bit-vision es una reconstrucción comunitaria del modelo multimodal Ornith-1.5-35B-A3B, publicada por el usuario ahmedihamdy. El modelo base, desarrollado por ornith-ai, es un transformer de mezcla de expertos (MoE) con 35.107.180.016 parámetros totales, de los cuales aproximadamente 3B están activos por token (8 de 256 expertos). Esta versión concreta reincorpora la torre de visión original del modelo base (27 bloques, 447M parámetros en bf16) sobre los pesos de texto cuantizados a 8 bits que Ornith distribuyó para Apple Silicon.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de ingeniería de reconstrucción: el autor verifica que la torre de visión pertenece a los pesos de texto mediante la comprobación de 24 de 24 tensores de texto muestreados y la coincidencia de la anchura de la torre y los tokens de imagen. Por otro, ofrece una vía práctica para ejecutar un modelo multimodal de 35B en un Mac con Apple Silicon, con un pico de memoria medido de 39,07 GB y una velocidad de generación de 53 a 60 tokens por segundo en mlx-vlm 0.7.12.

El modelo está pensado para el ecosistema MLX y la aplicación Astronomical, una herramienta de código abierto para ejecutar modelos en local en macOS 14 o superior. No es una publicación oficial de Ornith: se trata de un build de comunidad que conserva la licencia MIT del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) con torre de visión |
| Parametros totales | 35.107.180.016 |
| Parametros activos | ~3B (8 de 256 expertos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (pesos de texto y routers); torre de visión en bf16 |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), 7 shards de texto + model-vision.safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con 256 expertos, de los que se activan 8 por token, lo que da un cómputo efectivo de aproximadamente 3B parámetros sobre un total de 35B. La arquitectura se etiqueta como qwen3_5_moe, lo que sugiere una variante de la familia Qwen 3.5 con enrutamiento MoE. Sobre el tronco de texto se acopla una torre de visión de 27 bloques y 447M parámetros, mantenida en bf16 para preservar la calidad de la codificación de imagen.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Esta versión es una cuantización y reconstrucción, no un reentrenamiento: los pesos de texto son los 8-bit originales de Ornith «byte for byte», sin recuantizar, y la torre de visión se toma del checkpoint base en bf16. La innovación técnica destacable es el procedimiento de verificación de compatibilidad entre torre y pesos, documentado en el fichero astronomical-build.json con los commits de origen y los hashes SHA-256 de cada fichero, lo que permite reproducir el build.

## Capacidades

- Generación de texto conversacional en inglés.
- Comprensión de imágenes y respuesta imagen-texto (pipeline image-text-to-text).
- Descripción de contenido visual: lectura de texto en capturas de pantalla, identificación de colores y formas.
- Razonamiento multimodal de un solo turno o multi-turno con imágenes adjuntas.
- Ejecución local en Apple Silicon mediante MLX, con streaming de expertos desde SSD cuando la memoria es insuficiente.
- Integración con la CLI de Astronomical mediante el flag --image.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modo thinking explícito.

## Casos de uso

- Análisis de capturas de pantalla en local: el modelo lee nombres de modelo, tamaños en disco y métricas de GPU en una captura, útil para automatizar la extracción de datos de paneles de monitorización sin enviar imágenes a la nube.
- Asistencia visual en escritorio macOS: integrado en Astronomical, permite consultar el contenido de una imagen desde la terminal con `astronomical respond "..." --image imagen.png`, manteniendo los datos en el equipo.
- Documentación técnica de imágenes: descripción de diagramas, gráficos y figuras para generar alt-text o resúmenes accesibles en inglés.
- Prototipado de aplicaciones multimodales con MLX: el ejemplo de mlx-vlm permite cargar el modelo y procesar imágenes en Python, adecuado para validar pipelines antes de pasar a producción.
- Investigación sobre reconstrucción de modelos: el par de commits y los hashes permiten auditar y reproducir el proceso de acoplamiento de torre y pesos, útil para estudiar técnicas de verificación de compatibilidad.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local sin cuenta en la nube, encaja en flujos donde las imágenes no pueden salir del dispositivo.
- Evaluación comparativa de cuantizaciones: al existir una variante de 6 bits (~9 GB más ligera), sirve para medir el compromiso entre memoria y calidad en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento medidos son de inferencia: en mlx-vlm 0.7.12 sobre Apple Silicon, el modelo alcanzó un pico de 39,07 GB de memoria y generó entre 53 y 60 tokens por segundo.

## Requisitos de hardware

- VRAM/memoria unificada estimada: pico medido de 39,07 GB en mlx-vlm; el repo ocupa 37,7 GB y el modelo cargado en Astronomical ocupa 37,74 GB.
- Hardware objetivo: Apple Silicon (macOS 14 o superior). No se documenta soporte para GPU NVIDIA.
- Cabe en Mac con 48 GB o más de memoria unificada con margen; en equipos con menos memoria, Astronomical puede hacer streaming de expertos desde el SSD, con menor velocidad.
- Despliegue: MLX mediante mlx-vlm 0.7.12 o la aplicación/CLI Astronomical 0.2.90 o superior.
- Throughput medido: 53-60 tokens/s en el hardware de prueba del autor (modelo de Mac no especificado).
- Alternativa de menor huella: la variante de 6 bits del mismo autor, unos 9 GB más ligera.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-MLX-8bit-vision (este) | 35B totales, ~3B activos | no disponible | MIT | safetensors MLX 8-bit + torre bf16 | Multimodal, Apple Silicon |
| Ornith-1.5-35B-A3B-MLX-8bit | 35B totales, ~3B activos | no disponible | MIT | safetensors MLX 8-bit | Solo texto, sin torre de visión |
| Ornith-1.5-35B-A3B-MLX-6bit-vision | 35B totales, ~3B activos | no disponible | MIT | safetensors MLX 6-bit + torre bf16 | Multimodal, ~9 GB más ligero |
| Ornith-1.5-35B-A3B (base) | 35B totales, ~3B activos | no disponible | MIT | safetensors | Checkpoint original de ornith-ai |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con modelos de otras familias.

## Limitaciones y advertencias

- Es un build de comunidad, no una release oficial de ornith-ai; el soporte y la validación corren a cargo del autor del repositorio.
- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está verificado.
- No se documenta la longitud de contexto soportada, lo que impide planificar cargas de documentos largos con garantías.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en la descripción de imágenes ambiguas o de baja resolución.
- La torre de visión se validó con pruebas cualitativas sobre imágenes reales y comprobaciones de tensores, pero no con benchmarks multimodales publicados.
- El requisito de memoria (~39 GB de pico) excluye Macs de 16 o 24 GB salvo que se use streaming desde SSD, con la penalización de velocidad correspondiente.
- La licencia MIT del modelo base permite uso comercial, pero conviene revisar los términos del repositorio original de ornith-ai para confirmar condiciones y atribución.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-MLX-8bit-vision
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Versión MLX 8-bit de texto: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX-8bit
- Variante de 6 bits con visión: https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-MLX-6bit-vision
- Astronomical (aplicación y CLI): https://aosama.github.io/astronomical/
