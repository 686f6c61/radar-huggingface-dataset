# inspatio/world-1.5

## Resumen

InSpatio-World 1.5 es un modelo de mundo 4D desarrollado por InSpatio (影溯), una empresa centrada en inteligencia espacial. El modelo convierte imágenes y vídeos en mundos 4D explorables en tiempo real, permitiendo predecir nuevas vistas a partir de una o varias imágenes, panoramas o secuencias de vídeo. Su objetivo es dotar a la IA de la capacidad de comprender, simular e interactuar con el mundo físico tridimensional.

La relevancia de este modelo radica en su aplicación a la IA encarnada, la robótica y la simulación de física generativa, áreas donde la capacidad de generar entornos 4D coherentes y navegables en tiempo real es un habilitador clave. Sin embargo, no se ha publicado información técnica detallada sobre su arquitectura, número de parámetros, longitud de contexto ni datos de entrenamiento en las fuentes disponibles.

El repositorio de HuggingFace tiene un tamaño de 5,7 GB, lo que sugiere que los pesos ocupan aproximadamente esa cantidad, pero se desconoce el formato exacto y los requisitos de inferencia. La licencia y los idiomas soportados no están especificados.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de mundo 4D para simulación espacial) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 5,7 GB en HuggingFace) |

## Arquitectura y entrenamiento

No hay información pública sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO. El modelo se presenta como un simulador de mundo 4D en tiempo real que genera nuevas vistas a partir de entradas visuales. En una presentación en vídeo se menciona "generative physics" y "world-score results", lo que sugiere que el modelo incorpora algún tipo de simulación física y que se evalúa con una métrica propia denominada World-Score, pero no se aportan detalles técnicos.

La innovación principal reside en la capacidad de convertir imágenes o vídeos en entornos 4D explorables, lo que implica síntesis de vistas novedosas con coherencia temporal y espacial. No se especifica si utiliza difusión, transformers o una arquitectura híbrida, ni si emplea decodificación especulativa u otras optimizaciones para inferencia en tiempo real.

## Capacidades

- Generación de mundos 4D explorables en tiempo real a partir de una sola imagen, múltiples imágenes, panoramas o vídeo.
- Predicción de nuevas vistas (novel view synthesis) con coherencia espacial y temporal.
- Simulación de física generativa (mencionado en una presentación, sin detalles técnicos).
- Orientado a aplicaciones de IA encarnada y robótica, según las fuentes.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Otras capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Robótica y navegación autónoma: el modelo puede generar entornos 4D a partir de una imagen o vídeo, permitiendo a un robot predecir vistas futuras y planificar trayectorias en tiempo real. Es adecuado porque simula la evolución espacio-temporal de la escena.
- Gemelos digitales y simulación industrial: a partir de vídeos de una planta o instalación, se puede construir un gemelo digital 4D navegable para monitorizar procesos y simular cambios sin necesidad de modelado 3D manual.
- Videojuegos y realidad virtual/aumentada: generar entornos 4D explorables en tiempo real a partir de assets 2D reduce el coste de producción de mundos virtuales y permite experiencias inmersivas dinámicas.
- Creación de contenido y efectos visuales: a partir de una imagen o vídeo, el modelo puede generar nuevas perspectivas de una escena, útil para postproducción, cinematografía y diseño de planos.
- Entrenamiento de agentes de IA encarnada: el simulador sirve como entorno de entrenamiento para agentes que deben interactuar con el mundo físico, aprovechando la predicción de nuevas vistas para aprender políticas robustas.
- Teleoperación y vigilancia remota: convertir transmisiones de vídeo en modelos 4D navegables permite inspeccionar instalaciones de forma remota con mayor contexto espacial.
- Arquitectura y diseño de interiores: generar vistas 4D de espacios a partir de fotografías para previsualización inmersiva y toma de decisiones de diseño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La presentación en vídeo menciona "World-Score Results", pero no se proporcionan cifras concretas ni comparaciones con otros modelos. Por tanto, no es posible presentar una tabla de rendimiento.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es de 5,7 GB, lo que sugiere que los pesos ocupan aproximadamente esa cantidad. Para inferencia se necesitaría al menos 6-8 GB de VRAM solo para los pesos, más el overhead de activaciones y buffers, pero no hay datos oficiales.
- GPU recomendadas: no disponible. Dado el tamaño, es plausible que funcione en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 o superiores, pero es una especulación basada únicamente en el tamaño del repositorio.
- Si cabe en consumer GPU: probablemente sí, dado el tamaño de 5,7 GB, pero no está confirmado.
- Opciones de despliegue: no disponible. No se especifica soporte para vLLM, llama.cpp, Ollama, TGI u otros. Al ser un modelo de mundo, es probable que requiera un runtime específico, pero no se indica.
- Latencia y throughput: se promociona como "tiempo real", pero no se proporcionan cifras concretas de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos cuantitativos para comparar el rendimiento de InSpatio-World 1.5 con alternativas. A continuación se ofrece una comparación cualitativa con otros modelos de mundo:

| Modelo | Desarrollador | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| InSpatio-World 1.5 | InSpatio | Simulador de mundo 4D | no disponible | Pesos en HuggingFace (5,7 GB) |
| Genie | DeepMind | Modelo de mundo interactivo | no disponible (no open source) | No disponible públicamente |
| Cosmos | NVIDIA | Modelo fundacional de mundo | NVIDIA Open Model License | Disponible en HuggingFace |
| World Labs (modelo) | World Labs | Modelo de mundo 3D/4D | no disponible | No lanzado |

Esta comparación es meramente cualitativa y no permite establecer superioridad en rendimiento, ya que no hay benchmarks públicos de InSpatio-World 1.5.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial es incierto y requiere consultar con el desarrollador.
- Riesgo de alucinación: como modelo generativo, puede producir geometrías o físicas inconsistentes en las vistas generadas.
- Limitaciones de contexto: se desconoce la longitud de contexto o el número de vistas que puede manejar coherentemente.
- Idiomas: no se especifica soporte multilingüe; probablemente el modelo se centra en entradas visuales.
- Sesgos: no hay información sobre sesgos en los datos de entrenamiento.
- Requisitos de cómputo: aunque se promociona como tiempo real, no se detallan los recursos necesarios, lo que dificulta la planificación de despliegues.
- Falta de documentación técnica: no hay paper, detalles de arquitectura ni datos de entrenamiento, lo que limita la reproducibilidad y la evaluación independiente.
- Dependencia de la calidad de entrada: imágenes o vídeos de baja calidad pueden degradar la calidad de la simulación 4D.

## Enlaces

- HuggingFace: https://huggingface.co/inspatio/world-1.5
- Sitio web de InSpatio: https://www.inspatio.com/
- X (Twitter) de InSpatio: https://x.com/InSpatio_AI
- Publicación de ModelScope en X: https://x.com/ModelScope2022/status/2105158320764104812
- Vídeo de YouTube: https://www.youtube.com/watch?v=36EOT8_6Y-Y
- ModelScope (URL completa no disponible, referencia en el post de X): https://modelscope.ai/models/InSpatio/InSpatio-World-1.5 (estimado)
