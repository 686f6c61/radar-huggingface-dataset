# Nez-Norlag/oneObsession_v24_3100615_QNN2.28

## Resumen

`oneObsession_v24_3100615_QNN2.28` es un checkpoint de Stable Diffusion XL (SDXL) convertido al formato QNN (Qualcomm Neural Network) para su ejecución en la NPU de procesadores Snapdragon. El modelo original, desarrollado por el usuario maxfeifei8 en Civitai, está especializado en la generación de imágenes semi-realistas de anime antiguo y furry, con soporte tanto para contenido SFW como NSFW. La conversión a QNN, realizada por Nez-Norlag, permite ejecutar el modelo en dispositivos móviles sin necesidad de GPU dedicada, aprovechando la unidad de procesamiento neuronal integrada en los chips Snapdragon 8 Gen 3, 8 Elite y 8 Gen 5.

El modelo se distribuye bajo licencia CreativeML OpenRAIL-M, pesa 3,7 GB en el repositorio y se publicó en agosto de 2026. Su relevancia radica en ofrecer una alternativa de generación de imágenes de alta calidad directamente en el teléfono, con configuraciones de inferencia optimizadas (25-35 pasos, CFG 3-6, samplers Euler o Euler A) y resoluciones recomendadas que van desde 640×1536 hasta 1024×1536. Al estar basado en la arquitectura SDXL, hereda las capacidades de generación de imágenes detalladas con un buen control del prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion XL (variante NoobAI) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo de difusion, no MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | QNN (formato cuantizado para NPU de Qualcomm) |
| Idiomas soportados | no disponible (probablemente ingles para prompts) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | QNN (Qualcomm Neural Network) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Stable Diffusion XL, que combina un UNet de difusion latente con un VAE y dos encoders de texto (CLIP ViT-L y OpenCLIP ViT-bigG). El checkpoint original "One obsession" fue entrenado por maxfeifei8 sobre la base NoobAI, un modelo SDXL especializado en estilos anime y semirrealistas. No se dispone de detalles sobre el dataset de entrenamiento, el numero de pasos o el proceso de ajuste fino. La conversion a QNN, realizada mediante herramientas como Local Dream, implica una cuantizacion de los pesos y una optimizacion especifica para la NPU de Qualcomm, lo que reduce el tamaño del modelo y permite su ejecucion en dispositivos moviles con bajo consumo.

## Capacidades

- Generacion de imagenes a partir de prompts de texto en estilo semirrealista de anime antiguo y furry.
- Soporte para contenido NSFW (segun los tags del repositorio y la licencia).
- Ejecucion local en dispositivos con Snapdragon 8 Gen 3, 8 Elite o 8 Gen 5 mediante NPU.
- Configuracion de generacion recomendada: 25-35 pasos, CFG 3-6, samplers Euler o Euler A.
- Resoluciones soportadas: 1024×1536, 832×1216, 896×1152, 768×1344, 640×1536 (formatos 2:3, 13:19, 7:9, 4:7, 5:12).
- Control de calidad mediante prompts positivos y negativos recomendados por el autor (p. ej. "masterpiece, best quality" y "worst quality, bad anatomy").
- No incluye capacidades de texto, vision multimodal, tool calling ni agentes, al ser un modelo de difusion puro.

## Casos de uso

- Creacion de ilustraciones y arte conceptual para proyectos personales o profesionales: el modelo permite generar imagenes de anime antiguo con acabado semirrealista directamente en el telefono, ideal para artistas que necesitan bocetos rapidos o referencias.
- Generacion de contenido para redes sociales: con resoluciones de hasta 1024×1536, se pueden producir imagenes listas para publicar en plataformas como Instagram o Twitter sin necesidad de un PC.
- Diseno de personajes para juegos o novelas visuales: la capacidad de generar variedad de estilos (anime, furry) y contenido NSFW (si es legal y etico) facilita la exploracion de disenos en entornos moviles.
- Prototipado de escenas o fondos para animacion: la generacion rapida en el dispositivo permite iterar sobre composiciones y paletas de color sin depender de servicios en la nube.
- Uso educativo en talleres de arte digital: se puede demostrar el proceso de generacion de imagenes con IA en un smartphone, mostrando la interaccion entre prompts, CFG y samplers.
- Generacion de contenido para comunidades de fans (fanart, comisiones): el modelo esta orientado a estilos concretos y puede producir resultados consistentes con la estetica buscada, reduciendo el tiempo de edicion posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos objetivos sobre calidad de imagen (p. ej. FID, CLIP score) ni comparaciones con otros modelos. Las unicas referencias son las valoraciones de usuarios en Civitai, donde el modelo original "One obsession" tiene una puntuacion media de 5 estrellas basada en 144 reseñas, lo que sugiere una buena aceptacion, pero no constituye una metrica tecnica.

## Requisitos de hardware

- Dispositivos compatibles: Snapdragon 8 Gen 3, Snapdragon 8 Elite y Snapdragon 8 Gen 5 (requieren NPU de Qualcomm con soporte QNN).
- No requiere GPU dedicada; la inferencia se realiza en la NPU del procesador.
- Espacio de almacenamiento: aproximadamente 3,7 GB para los pesos del modelo.
- Memoria RAM: no especificada, pero se asume suficiente en los dispositivos compatibles (tipicamente 12 GB o mas).
- Despliegue: se puede integrar en aplicaciones moviles mediante el SDK de Qualcomm AI Engine Direct o mediante herramientas como Local Dream (https://github.com/xororz/local-dream).
- Latencia y throughput: no disponibles. Se espera una generacion de 25-35 pasos en tiempos aceptables para uso interactivo, pero sin datos concretos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de generacion de imagenes para movil. El modelo es una conversion especifica del checkpoint "One obsession" de Civitai, que no tiene equivalentes publicados en formato QNN para Snapdragon. Se podria comparar con el modelo original (sin conversion) en terminos de calidad, pero no se conocen sus especificaciones tecnicas (parametros, contexto, etc.). Tampoco hay datos sobre alternativas como Stable Diffusion 1.5 o SDXL cuantizados para NPU. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo solo funciona en dispositivos con Snapdragon 8 Gen 3, 8 Elite o 8 Gen 5; no es compatible con otros procesadores o GPUs.
- El contenido generado puede incluir material NSFW; es responsabilidad del usuario cumplir con las leyes y politicas de la plataforma donde se utilice.
- La licencia CreativeML OpenRAIL-M permite uso comercial, pero restringe la generacion de contenido ilegal o dañino y exige redistribuir los pesos bajo la misma licencia.
- No se garantiza la calidad de generacion en resoluciones fuera de las recomendadas; el autor sugiere usar los formatos y dimensiones listados para obtener resultados optimos.
- El modelo esta especializado en estilos concretos (anime antiguo, furry); puede producir resultados deficientes con prompts fuera de ese dominio.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de idioma en los prompts; se asume que el modelo responde mejor a prompts en ingles, aunque no se ha confirmado.
- La conversion a QNN puede implicar una perdida de precision respecto al modelo original en formato float32, aunque no se han publicado evaluaciones cuantitativas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Nez-Norlag/oneObsession_v24_3100615_QNN2.28
- Modelo original en Civitai: https://civitai.com/models/1318945/one-obsession?modelVersionId=3218603
- Perfil del autor original (maxfeifei8): https://civitai.com/user/maxfeifei8
- Repositorio de Local Dream: https://github.com/xororz/local-dream
- Resenas del modelo en Civitai: https://civitai.com/models/1318945/reviews?modelVersionId=1522352
- Guia de descarga manual de modelos QNN (referencia general): https://docs.anythingllm.com/manual-qnn-model-download
