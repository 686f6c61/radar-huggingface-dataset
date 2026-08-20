# mudler/Ornith-1.5-35B-A3B-APEX-MTP-GGUF

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de gran escala desarrollado por Ornith AI, una iniciativa orientada a la democratización de la inteligencia artificial mediante código abierto. Este modelo se distribuye en formato GGUF, preparado para su uso con motores de inferencia como llama.cpp u Ollama, y está pensado para tareas conversacionales. La versión aquí descrita, publicada por el usuario mudler, es una conversión del modelo original de Ornith AI con el sufijo APEX-MTP, que no tiene documentación adicional en las fuentes consultadas.

El modelo presenta un total de 35.505.251.456 parámetros, y su nombre indica una arquitectura de mezcla de expertos (MoE) con 3 mil millones de parámetros activos, aunque no se ha confirmado esta característica en la documentación disponible. Según el artículo oficial de Ornith AI, este modelo continúa el marco de "auto-scaffolding" y "auto-mejora" introducido en la versión 1.0, donde el modelo es capaz de proponer nuevas tareas, generar andamiajes específicos y producir rollouts para entrenamiento por refuerzo, lo que sugiere un enfoque de aprendizaje continuo y autónomo.

La relevancia actual de este modelo radica en su enfoque novedoso de auto-mejora y su disponibilidad en formato GGUF, lo que facilita su despliegue en entornos locales con requisitos de hardware moderados. No obstante, la información pública sobre arquitectura, licencia, idiomas y rendimiento detallado es limitada, por lo que esta ficha se basa exclusivamente en los datos disponibles en HuggingFace y en los resultados de búsqueda web.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible (el nombre sugiere 3B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se esperan variantes GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado documentación técnica detallada sobre la arquitectura interna del modelo. El nombre "A3B" sugiere una arquitectura de mezcla de expertos (MoE) con 3 mil millones de parámetros activos, pero no hay confirmación oficial. Según el artículo de Ornith AI titulado "Ornith-1.5: From Self-Scaffolding to Self-Improvement", el modelo extiende el marco de auto-scaffolding de la versión 1.0 hacia un bucle completo de auto-mejora: el modelo propone nuevas tareas, genera andamiajes específicos para cada tarea y produce rollouts de soluciones para el entrenamiento por refuerzo. Este proceso crea continuamente nuevas experiencias de aprendizaje que el modelo utiliza para mejorar. No se especifican datos de entrenamiento como número de tokens o composición del dataset, ni si se utilizaron técnicas como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional: el modelo está etiquetado como "conversational", lo que indica su capacidad para mantener diálogos multi-turno.
- Capacidades de auto-mejora: según el artículo, el modelo puede generar nuevas tareas y soluciones, lo que sugiere una capacidad de razonamiento y planificación avanzada.
- Compatibilidad con entornos de inferencia locales: el formato GGUF permite su ejecución con herramientas como llama.cpp, Ollama o vLLM.
- No se ha confirmado soporte para tool calling, función de llamada, agentes, visión o audio en la información disponible.

## Casos de uso

No se han documentado casos de uso específicos para este modelo en las fuentes consultadas. Dada su naturaleza conversacional y su disponibilidad en GGUF, se pueden considerar aplicaciones generales como:

- Asistentes de chat locales: al ser un modelo de 35B con activación parcial, podría ejecutarse en GPU de gama media con cuantización adecuada para ofrecer respuestas en conversaciones de soporte técnico o atención al cliente.
- Experimentación en investigación: el enfoque de auto-mejora podría ser útil para estudios sobre generación de tareas y aprendizaje por refuerzo, aunque no hay evidencia de aplicaciones prácticas.
- Prototipado rápido: al estar disponible en formato GGUF, es fácil integrarlo en proyectos de código abierto para pruebas de concepto de chatbots.
- Generación de contenido asistida: podría utilizarse para redactar textos, resúmenes o respuestas a preguntas, aunque no hay evidencia de rendimiento en estas tareas.
- Análisis de texto: sin confirmación de capacidades específicas, solo se puede recomendar su uso con precaución.
- Entornos educativos: para demostraciones de modelos MoE y técnicas de auto-mejora, si bien no hay datos de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados detallados de benchmarks en la información disponible. La plataforma BenchLM.ai ofrece un perfil del modelo con una puntuación pública de 49.27/100, que lo sitúa en el puesto #134 de 221 modelos evaluados. La plataforma indica que hay 18 filas de resultados de benchmark, pero los valores concretos no son accesibles desde la información proporcionada. No se pueden presentar tablas comparativas con otros modelos al carecer de estos datos.

## Requisitos de hardware

- El modelo tiene 35.505.251.456 parámetros totales. Para una cuantización típica Q4_K_M (aproximadamente 20 GB de peso), se estima una VRAM mínima de 20 GB para inferencia en GPU, aunque no hay confirmación oficial.
- El tamaño del repositorio es de 71.1 GB, lo que sugiere que se incluyen múltiples variantes de cuantización (posiblemente desde Q2 hasta Q8).
- Se recomienda una GPU con al menos 24 GB de VRAM (como RTX 3090, RTX 4090, A10G) para ejecutar cuantizaciones de alta calidad. Con cuantizaciones más agresivas (Q2 o Q3) podría caber en 12-16 GB.
- Al ser un modelo MoE con activación de 3B, el consumo de VRAM durante la inferencia puede ser menor que el total de parámetros, pero no se dispone de datos exactos.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI (todos compatibles con GGUF).
- No se conocen datos de latencia o throughput para este modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables. El modelo anterior de la misma familia, Ornith-1.0-35B-APEX-GGUF, también está disponible en HuggingFace, pero no se han publicado comparativas numéricas. En general, un MoE de 35B con 3B activos se podría comparar con modelos como Mixtral 8x7B (46.7B totales, 12.9B activos) o Qwen 1.5 MoE, pero no hay datos de rendimiento que permitan una comparación objetiva. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- No se ha documentado la licencia del modelo, lo que limita su uso comercial sin una revisión legal.
- No se han publicado resultados de benchmarks fiables, por lo que el rendimiento real en tareas estándar es desconocido.
- La arquitectura y el entrenamiento no están descritos formalmente, lo que dificulta la reproducción o la optimización.
- No se conocen sesgos o alucinaciones específicas, pero al ser un modelo de lenguaje, es probable que presente riesgos comunes de generación de información falsa.
- El modelo se ha creado en 2026, por lo que la información de entrenamiento y evaluación puede ser limitada.
- No se ha verificado la compatibilidad con todos los entornos de producción; se recomienda pruebas exhaustivas antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mudler/Ornith-1.5-35B-A3B-APEX-MTP-GGUF
- Modelo original de Ornith AI: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Artículo oficial sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Perfil de BenchLM: https://benchlm.ai/models/ornith-1-5-35b-a3b
- Versión anterior Ornith-1.0: https://huggingface.co/mudler/Ornith-1.0-35B-APEX-GGUF
