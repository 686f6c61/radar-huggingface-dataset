# SD-Next/LocateAnything-3B

## Resumen

LocateAnything-3B es un modelo de detección de objetos y localización visual basado en lenguaje natural, desarrollado originalmente por NVIDIA y reimplementado por SD-Next. El modelo recibe una imagen junto con un prompt en lenguaje natural (por ejemplo, "localiza manos y cara") y devuelve las coordenadas de las regiones correspondientes en formato de cajas delimitadoras expresadas como tokens especiales. La versión de SD-Next es una reimplementación completa del modelo original de NVIDIA orientada a garantizar compatibilidad con `transformers>=5`, lo que resuelve un problema práctico de integración para equipos que ya han migrado a la nueva versión de la librería.

El modelo cuenta con 3.830.665.968 parámetros (aproximadamente 3,8 mil millones) y un tamaño de repositorio de 7,7 GB en formato safetensors. Se distribuye con la etiqueta de pipeline `object-detection` y requiere `trust_remote_code=True` para su carga, lo que indica que incluye código personalizado en el repositorio. La arquitectura combina un codificador visual con un modelo de lenguaje para producir secuencias estructuradas de referencias y cajas.

La relevancia de esta ficha radica en dos factores: por un lado, la tarea de localización abierta por lenguaje natural (open-vocabulary grounding) es cada vez más demandada en pipelines de visión por computador; por otro, al ser una reimplementación de un modelo de NVIDIA, conviene evaluar con cautela su equivalencia funcional respecto al original, dado que no se han publicado métricas propias ni detalles de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo multimodal visión-lenguaje para localización; requiere código personalizado) |
| Parámetros totales | 3.830.665.968 |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Pipeline | object-detection |
| Librería | transformers (requiere `transformers>=5` y `trust_remote_code=True`) |
| Modelo base | nvidia/LocateAnything-3B |
| Tamaño del repositorio | 7,7 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Por la naturaleza de la tarea y el formato de salida (referencias `<ref>` seguidas de cajas `<box>` con coordenadas codificadas como tokens), se trata de un modelo multimodal que combina percepción visual con generación de lenguaje estructurado. El prompt se procesa mediante `apply_chat_template` con contenido mixto imagen-texto, lo que confirma un procesador multimodal con plantilla de chat.

No se han publicado en la información proporcionada datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. La contribución declarada por SD-Next es exclusivamente de compatibilidad: una reimplementación completa del modelo de NVIDIA para funcionar con `transformers>=5`. Se desconoce si los pesos son idénticos a los del modelo original o si se han reconvertido.

## Capacidades

- Localización visual por lenguaje natural: dado un prompt textual, devuelve cajas delimitadoras de los objetos o regiones solicitadas.
- Detección de múltiples instancias: puede devolver varias cajas para una misma referencia (por ejemplo, dos manos).
- Salida estructurada: genera referencias `<ref>` y cajas `<box>` con coordenadas codificadas como tokens especiales, lo que facilita el parseo programático.
- Procesamiento multimodal imagen-texto mediante plantilla de chat.
- Generación determinista disponible (`do_sample=False`) para resultados reproducibles.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión adicional, audio: no disponible en la información proporcionada.

## Casos de uso

- Anotación automática de datasets de visión: el modelo puede generar cajas delimitadoras a partir de descripciones en lenguaje natural, acelerando el etiquetado de imágenes para entrenar detectores supervisados.
- Control de calidad en líneas de producción: localizar piezas, defectos o regiones concretas mediante prompts descriptivos, sin necesidad de entrenar un detector específico por categoría.
- Accesibilidad y descripción de imágenes: identificar y localizar elementos relevantes (caras, manos, objetos) para generar descripciones enriquecidas con coordenadas.
- Análisis de documentos y capturas: localizar regiones de interés (firmas, sellos, campos) descritas textualmente en flujos de digitalización.
- Moderación de contenido visual: localizar regiones concretas descritas por el operador para revisión manual posterior, reduciendo el área a inspeccionar.
- Robótica e interacción guiada por lenguaje: proporcionar coordenadas de objetos referidos por instrucciones textuales para tareas de manipulación o navegación.
- Investigación en grounding visual: servir como línea base para experimentos de localización abierta por lenguaje natural con un modelo de 3,8 mil millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 7,7 GB solo para pesos, más overhead de activaciones y del codificador visual; se recomienda un mínimo de 12-16 GB para margen operativo.
- VRAM estimada en cuantización de 8 bits: en torno a 4-5 GB para pesos, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas para producción: A100, H100 o L40S para mayor throughput; RTX 4090 (24 GB) es suficiente para inferencia en precisión completa.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB); en tarjetas de 12-16 GB puede requerir cuantización o `device_map` parcial.
- Opciones de despliegue: carga nativa con `transformers` (`AutoModel` + `AutoProcessor` con `trust_remote_code=True`); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SD-Next/LocateAnything-3B | 3,83 B | No disponible | Localización visual por lenguaje | No disponible | Hugging Face |
| nvidia/LocateAnything-3B | 3,83 B (según modelo base) | No disponible | Localización visual por lenguaje | No disponible | Hugging Face |
| Alternativas de grounding visual de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial permitido; es imprescindible verificar la licencia del modelo base de NVIDIA antes de desplegar en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Al ser una reimplementación de terceros, no hay garantía documentada de equivalencia numérica con el modelo original de NVIDIA.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar dicho código antes de usarlo en entornos sensibles.
- No se documentan sesgos conocidos, pero al no haber información sobre datos de entrenamiento no es posible evaluar sesgos demográficos o culturales.
- Riesgo de alucinación de cajas: el modelo puede devolver coordenadas para referencias inexistentes o mal localizadas; se recomienda validación posterior.
- Idiomas soportados no disponibles: el comportamiento multilingüe del prompt no está garantizado.
- Longitud de contexto no disponible: no se puede planificar el uso con prompts largos o múltiples imágenes sin pruebas empíricas.
- Sin benchmarks publicados: el rendimiento real frente al modelo original es desconocido.
- Fecha de creación del repositorio posterior a la fecha actual de referencia habitual en fichas técnicas; conviene verificar la vigencia y el mantenimiento del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SD-Next/LocateAnything-3B
- Modelo base original: https://huggingface.co/nvidia/LocateAnything-3B
