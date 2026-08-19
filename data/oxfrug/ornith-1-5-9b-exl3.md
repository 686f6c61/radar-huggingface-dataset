# oxfrug/Ornith-1.5-9B-exl3

## Resumen

Ornith-1.5-9B-exl3 es una cuantización en formato EXL3 (ExLlamaV3) del modelo base ornith-ai/Ornith-1.5-9B, realizada por el usuario oxfrug. El modelo base pertenece a la familia Ornith-1.5, desarrollada por ornith-ai, que introduce un enfoque de "self-scaffolding" llevado a un bucle completo de auto-mejora: el modelo optimiza conjuntamente el andamiaje (scaffold) y la solución generada, descubriendo mejores trayectorias de búsqueda y produciendo soluciones de mayor calidad. Esta cuantización permite ejecutar el modelo en hardware más modesto manteniendo la licencia MIT original.

La arquitectura del modelo base es `Qwen3_5ForConditionalGeneration`, una arquitectura híbrida que combina GatedDeltaNet (una capa recurrente) con atención completa. El checkpoint cuantizado usa 4.0 bits por peso (bpw) en la rama principal, con un tamaño de aproximadamente 6.8 GB, lo que lo hace viable en GPUs de 24 GB con contexto amplio. Es importante señalar que este repositorio no es una conversión EXL2, sino EXL3, ya que la arquitectura híbrida no es compatible con EXL2.

La cuantización se realizó con ExLlamaV3 sobre una RTX 3090, usando el codebook `mul1` y almacenando la parte de visión sin cuantizar (16 bits). El modelo no incluye los tensores de MTP (multi-token prediction) a pesar de que la configuración base los define, por lo que esa funcionalidad no está disponible en esta versión. Es una opción práctica para desarrolladores que quieran probar Ornith-1.5 en local con requisitos de VRAM reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida GatedDeltaNet + atención completa) |
| Parametros totales | 3.592.713.968 (según safetensors; el nombre del modelo indica 9B, posible discrepancia) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 (4.0 bpw en rama principal; 5.0 y 6.0 bpw anunciadas como futuras) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B utiliza una arquitectura híbrida denominada `Qwen3_5ForConditionalGeneration`, que combina capas de GatedDeltaNet (una variante de redes recurrentes con puertas) con capas de atención completa. Esta mezcla permite manejar secuencias largas con un coste computacional menor que la atención pura, manteniendo la capacidad de modelar dependencias a largo plazo. El checkpoint cuantizado en EXL3 conserva esta arquitectura, aunque la parte de visión se almacena sin cuantizar (16 bits) para preservar la calidad perceptual.

El entrenamiento del modelo base se describe en la web oficial de ornith-ai como un proceso que extiende el "self-scaffolding" hacia un bucle de auto-mejora de extremo a extremo. Según la documentación, el modelo optimiza conjuntamente el andamiaje (las instrucciones o guías que genera para sí mismo) y la solución resultante, lo que le permite descubrir mejores trayectorias de búsqueda y generar soluciones de mayor calidad. No se han publicado detalles específicos sobre el número de tokens de entrenamiento, la composición del dataset o el uso de RLHF/DPO en la información disponible.

La cuantización EXL3 se realizó con la herramienta `convert.py` de ExLlamaV3, usando 250 filas de calibración con 2048 columnas (valores por defecto de la librería) y el codebook `mul1`. El modelo no incluye los tensores de MTP (multi-token prediction) que aparecen en la configuración base (`mtp_num_hidden_layers: 1`), por lo que esa capacidad no está presente en esta versión cuantizada.

## Capacidades

- Generación de texto conversacional y de código, con soporte para razonamiento en modo "thinking" (emite tokens de `thinking… response` como parte del flujo).
- Capacidades de codificación: el smoke test incluido en la model card muestra respuestas correctas para funciones simples en Python (p. ej., `lambda x: x ** 2` y `is_even(n)` con docstring).
- Soporte multilingüe básico: el smoke test verifica una respuesta en sueco ("tre plus fem" → "Tre plus fem är åtta"), lo que sugiere que el modelo maneja varios idiomas, aunque no se especifica la lista completa.
- Tool calling / function calling: la model card indica que el parser de herramientas es Qwen3 XML, lo que permite integrar llamadas a funciones externas.
- Capacidad de agente: el modelo base está diseñado para tareas de agente (agentic coding), y la cuantización conserva esta capacidad.
- No se especifican capacidades de visión explícitas, aunque la parte de visión se almacena sin cuantizar, lo que sugiere que el modelo base podría tener soporte multimodal (dado que la arquitectura es `ForConditionalGeneration`).

## Casos de uso

- Asistente de programación local: el modelo puede generar y depurar código en entornos de desarrollo integrados (IDE) o como backend de un asistente de terminal, gracias a su capacidad de razonamiento y a la generación de código verificada en el smoke test.
- Automatización de tareas de agente: gracias al diseño de "self-scaffolding" del modelo base, puede planificar y ejecutar secuencias de acciones complejas (p. ej., navegar por un repositorio, modificar archivos, ejecutar tests) de forma autónoma, con la cuantización EXL3 permitiendo ejecutarlo en GPUs de gama media.
- Chatbot de atención al cliente multilingüe: el modelo responde correctamente en varios idiomas (al menos sueco e inglés), y con la ventana de contexto adecuada puede mantener conversaciones multi-turno. La licencia MIT permite su integración en productos comerciales.
- Generación de código en pipelines de CI/CD: con soporte para tool calling (Qwen3 XML), el modelo puede integrarse en flujos automatizados para generar tests, documentación o parches de código, reduciendo la intervención manual.
- Prototipado rápido de aplicaciones de IA: al ser una cuantización ligera (6.8 GB), se puede desplegar en una estación de trabajo con una GPU de 24 GB (p. ej., RTX 3090/4090) para experimentar con el modelo sin necesidad de infraestructura en la nube.
- Investigación en auto-mejora de modelos: el enfoque de self-scaffolding del modelo base es relevante para estudiar cómo los modelos pueden mejorar sus propias estrategias de razonamiento; la versión cuantizada permite ejecutar experimentos en hardware local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks oficiales en la información disponible. La model card incluye un "smoke test" informal (no una ejecución de SWE/Terminal-Bench) que verifica la corrección de tres tareas sencillas, pero no constituye una evaluación rigurosa. Se recomienda consultar la model card del modelo base (ornith-ai/Ornith-1.5-9B) para obtener métricas de referencia en tareas de agente y codificación.

## Requisitos de hardware

- VRAM estimada: la rama principal (4.0 bpw) ocupa aproximadamente 6.8 GB en disco, y según la model card "cabe en una tarjeta de 24 GB con contexto". Para contextos más largos, se necesitará más VRAM; se estima que con 8-10 GB de VRAM libre se puede ejecutar con una ventana de contexto moderada.
- GPU recomendadas: RTX 3090 (24 GB) o RTX 4090 (24 GB) para ejecución cómoda con contexto amplio. También podría funcionar en GPUs con 12-16 GB (p. ej., RTX 3060 12GB, RTX 4070 Ti) con contextos más reducidos, aunque no está verificado.
- Si cabe en consumer GPU: sí, en GPUs de gama alta y media-alta con al menos 12 GB de VRAM.
- Opciones de despliegue: ExLlamaV3 (recomendado, requiere versión actual que soporte Qwen 3.5), TabbyAPI como frontend compatible con OpenAI, y potencialmente llama.cpp si se convierte a GGUF (no incluido en este repo).
- Latencia y throughput: no se han publicado mediciones. En una RTX 3090, se espera una velocidad de generación de decenas de tokens por segundo para un modelo de ~3.6B parámetros cuantizado a 4 bits, pero no hay datos confirmados.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con otros modelos de la misma categoría. El modelo base Ornith-1.5-9B se posiciona como un modelo de agente de codificación de 9B (aunque el checkpoint cuantizado reporta 3.59B de parámetros, posiblemente un error de etiquetado). Alternativas como Qwen2.5-Coder-7B o DeepSeek-Coder-6.7B podrían ser comparables en tamaño, pero no se han encontrado datos de rendimiento directos en la información proporcionada. Se recomienda consultar la model card del modelo base para benchmarks oficiales.

## Limitaciones y advertencias

- La cuantización EXL3 a 4.0 bpw puede introducir pérdida de precisión en tareas complejas de razonamiento o generación de código, aunque el smoke test sugiere que las tareas básicas se mantienen correctas.
- El modelo no incluye los tensores de MTP (multi-token prediction) a pesar de que la configuración base los define, por lo que esa funcionalidad no está disponible.
- No se han publicado resultados de benchmarks oficiales para esta cuantización; el rendimiento real puede variar según la tarea y el hardware.
- Los idiomas soportados no están especificados; aunque el smoke test muestra capacidad en sueco e inglés, no hay garantía de cobertura multilingüe completa.
- Al ser un modelo derivado, la licencia MIT se mantiene, pero es responsabilidad del usuario verificar que el uso cumple con las condiciones del modelo base.
- El modelo está diseñado para ser servido con ExLlamaV3; no es compatible con EXL2 ni con otros formatos sin conversión adicional.
- La arquitectura híbrida (GatedDeltaNet + atención) puede requerir una versión específica de ExLlamaV3 (actual master) para funcionar correctamente.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/oxfrug/Ornith-1.5-9B-exl3
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Web oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Colección de modelos Ornith-1.5: https://huggingface.co/collections/ornith-ai/ornith-15
- Página de Ornith en Ollama: https://ollama.com/library/ornith:9b
- Guía de Ornith AI: https://ornith.online/
- Repositorio de ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Conversión alternativa (comunidad): https://huggingface.co/ultimatechris/Ornith-1.5-9B-EXL3-4bpw
