# changh95/depth-anything-3-p150

## Resumen

Depth Anything 3 P150 es un paquete de despliegue del modelo DA3Metric-Large de ByteDance Seed, adaptado para ejecutarse sobre hardware Tenstorrent p150 (acelerador de inferencia de la familia Blackhole). El modelo original resuelve la estimación de profundidad monocular a partir de una única imagen RGB, devolviendo un mapa de profundidad de 518x518 píxeles. Este repositorio concreto no introduce pesos nuevos: reempaqueta los pesos sin modificar de `depth-anything/DA3METRIC-LARGE` en un contenedor Docker con un servidor HTTP propio, listo para desplegarse con la CLI de Tenstorrent.

La arquitectura combina un codificador DINOv2 ViT-L/14 de 304M parámetros con una cabeza de profundidad DPT de 30M parámetros, sumando 334M parámetros totales. La imagen de entrada se reescala a 518x518 sin preservar la relación de aspecto, y la salida es un mapa de profundidad donde valores mayores indican mayor distancia. El paquete ejecuta en el chip tanto el codificador como la cabeza de profundidad, incluyendo la normalización y el redimensionado de entradas de hasta unos 4 megapíxeles.

Es relevante porque demuestra un caso de portabilidad de un modelo de visión de referencia a aceleradores no convencionales (Tenstorrent), con un servidor HTTP funcional y latencias de inferencia en torno a 14 ms por imagen según el ejemplo de la model card. Está pensado para investigación, prototipado y análisis offline de profundidad relativa en interiores y escenas de conducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT (DINOv2 ViT-L/14) + cabeza DPT |
| Parametros totales | 334M (304M codificador + 30M cabeza) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (modelo de visión; entrada de una imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (paquete Docker; pesos descargados desde el repo base en el arranque) |

## Arquitectura y entrenamiento

El modelo es un estimador de profundidad monocular compuesto por dos bloques: un codificador DINOv2 ViT-L/14 de 304M parámetros que extrae representaciones visuales, y una cabeza de profundidad DPT de 30M parámetros que decodifica esas representaciones en un mapa denso de profundidad. La entrada RGB se aplasta a 518x518 sin mantener la relación de aspecto, y la salida es un mapa de 518x518 que puede redimensionarse bilinealmente al tamaño original. Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no se recogen en la información disponible y remiten a la model card original de DA3Metric-Large.

La innovación de este repositorio no está en el modelo sino en el despliegue: los pesos se ejecutan íntegramente en el acelerador Tenstorrent p150, incluyendo el preprocesado (normalización y redimensionado) para entradas de hasta aproximadamente 4 megapíxeles. El paquete se generó con `tt-model-manager` 0.1.0 (esquema de manifiesto 5.1) y expone un servidor HTTP propio en el puerto 20000, no una API compatible con OpenAI. La primera ejecución compila kernels para el dispositivo, lo que tarda varios minutos.

## Capacidades

- Estimación de profundidad monocular relativa a partir de una única imagen RGB o fotograma de vídeo.
- Salida de mapa de profundidad de 518x518 con valores donde mayor significa más lejano.
- Conversión opcional de la salida a PNG de 16 bits, NPZ con array float32 (`depth_m`) o JSON con listas anidadas.
- Redimensionado opcional de la salida al tamaño original de la imagen de entrada (`resize_to_original`).
- Clamp opcional de profundidad máxima (`max_depth_m`) y escala configurable del PNG de 16 bits (`png_scale`, por defecto 1000).
- Entradas de imagen entre 8x8 y 50 megapíxeles (PNG o JPEG); preprocesado en chip para entradas de hasta unos 4 megapíxeles.
- Endpoints de salud y estado del dispositivo (`GET /health`, `GET /info`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Reconstrucción de profundidad en interiores: el modelo procesa una foto de una habitación y devuelve un mapa de profundidad que permite estimar la disposición relativa de muebles y paredes, útil para prototipos de robótica doméstica o realidad aumentada.
- Análisis de escenas de conducción: a partir de fotogramas de cámara frontal, genera mapas de profundidad que sirven para análisis offline de distancias relativas entre vehículos y obstáculos, sin necesidad de calibración absoluta.
- Generación de mapas de disparidad para postprocesado 3D: la salida NPZ con float32 permite alimentar pipelines de reconstrucción de malla o de síntesis de vistas en herramientas de investigación.
- Extracción de profundidad en lotes offline: el servidor HTTP con endpoints `/predict` y `/predict_png` permite procesar colecciones de imágenes de forma automatizada con una latencia de inferencia de unos 14 ms por imagen en el hardware p150.
- Preprocesado para modelos de segmentación o detección: el mapa de profundidad puede usarse como canal adicional de entrada en pipelines de visión por computador que se beneficien de información de distancia relativa.
- Evaluación de portabilidad a aceleradores Tenstorrent: el paquete sirve como referencia para medir el rendimiento de un ViT-L/14 con cabeza DPT en hardware p150 y compararlo con GPU convencionales.
- Investigación en estimación de profundidad métrica: aunque la salida no está calibrada, el flujo permite experimentar con la conversión por longitud focal de DA3 (`focal * depth / 300`) usando la focal de la cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta tiempos de ejecución para la imagen de ejemplo (`media/source_1.png`, 1242x375): preprocesado 6,06 ms, inferencia 14,31 ms, postprocesado 4,99 ms y total 25,36 ms. Las estadísticas de profundidad de esa muestra van de 1,636 m a 42,521 m, con mediana de 4,447 m.

## Requisitos de hardware

- Hardware obligatorio: acelerador Tenstorrent p150 (malla `P150`). No se contempla ejecución en GPU convencional dentro de este paquete.
- VRAM estimada: no aplica; el modelo se ejecuta en la memoria del dispositivo Tenstorrent, no en VRAM de GPU.
- GPU recomendadas: no aplica para este paquete. Para ejecutar el modelo base en GPU sería necesario usar el repositorio original de Depth Anything 3.
- Compatibilidad con GPU de consumo: no disponible para este paquete; requiere hardware Tenstorrent.
- Despliegue: CLI `tt` (`tt serve changh95/depth-anything-3-p150`) o `tt-model serve` sin la CLI; requiere Docker y descarga la imagen y los pesos desde el Hub.
- Latencia: aproximadamente 25 ms totales por imagen de 1242x375 en p150 (6 ms preprocesado, 14 ms inferencia, 5 ms postprocesado), según el ejemplo de la model card.
- Throughput: no disponible.
- Tamaño del repositorio: 9,0 GB (incluye imagen y artefactos del paquete).

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo de salida | Licencia | Hardware |
|---|---|---|---|---|
| Depth Anything 3 P150 (este) | 334M | Profundidad relativa 518x518 | Apache 2.0 | Tenstorrent p150 |
| depth-anything/DA3METRIC-LARGE | 334M | Profundidad métrica DA3 | Apache 2.0 | GPU convencional |
| Depth Anything 3 (modelo base, otras variantes) | no disponible | Profundidad monocular | Apache 2.0 | GPU convencional |

La comparación directa con alternativas de la misma categoría (por ejemplo, MiDaS o Depth Anything V2) no está disponible en la información proporcionada. La diferencia principal frente al modelo base es el hardware de ejecución y el empaquetado como servidor HTTP, no los pesos ni la calidad de la predicción.

## Limitaciones y advertencias

- Los valores de profundidad devueltos no son distancias calibradas en metros, aunque el servidor los etiquete como `metres`; para obtener metros reales hace falta una escala de referencia propia o la conversión por longitud focal de DA3 (`focal * depth / 300`), cuya precisión no está garantizada.
- La imagen se aplasta a 518x518 sin preservar la relación de aspecto, lo que puede distorsionar la geometría en imágenes muy panorámicas o muy verticales.
- La saturación del PNG de 16 bits con `png_scale` por defecto (1000) se produce por encima de 65,535 m; el campo `saturated_pixels` permite detectarlo, pero conviene ajustar la escala en escenas de gran profundidad.
- El servidor no es una API compatible con OpenAI ni soporta chat, tool calling ni agentes; cualquier integración debe adaptarse a los formatos propios de `/predict` y `/predict_png`.
- Requiere hardware Tenstorrent p150 y Docker; no es desplegable en GPU de consumo ni en CPU con este paquete.
- La primera ejecución compila kernels y tarda varios minutos; no es adecuado para arranques efímeros sin caché.
- No se han publicado datos sobre sesgos del modelo en la información disponible; al tratarse de un modelo de visión entrenado con datasets no especificados, puede heredar sesgos de dominio (interiores, conducción) y degradarse en escenas fuera de distribución.
- Riesgo de alucinación geométrica: como todo estimador monocular, puede producir profundidades plausibles pero incorrectas en superficies reflectantes, transparentes o con poca textura.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base y de los pesos originales de ByteDance Seed.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/changh95/depth-anything-3-p150
- Modelo base: https://huggingface.co/depth-anything/DA3METRIC-LARGE
- Repositorio del port: https://github.com/changh95/tt-Depth-Anything-3
- Repositorio oficial de Depth Anything 3: https://github.com/ByteDance-Seed/Depth-Anything-3
- Paper: https://arxiv.org/abs/2511.10647
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Requisitos de la CLI de Tenstorrent: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
