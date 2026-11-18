# bytkim/Qwen3.8-27B-pi-GGUF

## Resumen

Qwen3.8-27B-pi es un ajuste fino del modelo Qwen/Qwen3.8-27B, desarrollado por el usuario bytkim, orientado específicamente al trabajo de programación dentro del arnés de agentes Pi. El modelo parte de una arquitectura transformer densa de aproximadamente 26.900 millones de parámetros y está entrenado para el bucle típico de un agente de código: leer un repositorio, editar archivos, ejecutar herramientas y reaccionar a su retroalimentación. Esta ficha describe la variante cuantizada en GGUF publicada en Hugging Face.

La relevancia del modelo reside en su enfoque en la eficiencia del razonamiento dentro de tareas de agente. Según la model card, el ajuste combina supervisión sobre sesiones exitosas de Pi con una etapa de aprendizaje por refuerzo (GRPO) que incorpora una recompensa personalizada de eficiencia de razonamiento, premiando soluciones correctas con menos tokens generados en los niveles bajo y medio. El resultado declarado es una mayor tasa de finalización de tareas con menos salida de texto en comparación con el modelo base.

La versión publicada bajo el identificador bytkim/Qwen3.8-27B-pi-GGUF ofrece cuantizaciones GGUF calibradas con sesiones completas de programación de Pi, incluyendo opciones compactas IQ (importance-aware) y un cabezal MTP (multi-token prediction) para decodificación especulativa. El repositorio ocupa 328 GB e incluye también un proyector de visión, lo que indica soporte multimodal imagen-texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B); ajuste fino con SFT y GRPO; cabezal MTP para decodificación especulativa |
| Parámetros totales | 26.895.998.464 (aproximadamente 26,9 mil millones) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF, incluyendo Q4_K_M, Q4_0 (cabezal MTP) y variantes IQ (importance-aware); también existen versiones BF16 y FP8 del modelo no cuantizado |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio principal); BF16 y FP8 en repositorios separados |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.8-27B, un transformer denso de aproximadamente 26,9 mil millones de parámetros. Sobre esa base, el ajuste de bytkim se desarrolló en dos etapas. La primera consistió en un ajuste fino supervisado (SFT) sobre sesiones filtradas y exitosas del arnés Pi, de modo que el modelo aprendiera flujos de trabajo completos de programación —inspeccionar el código, aplicar un cambio, comprobar el resultado y usar la retroalimentación de las herramientas— en lugar de respuestas aisladas. La segunda etapa aplicó aprendizaje por refuerzo con GRPO, combinando resultados verificados de las tareas con una recompensa personalizada de eficiencia de razonamiento que incentiva soluciones correctas con menor gasto de tokens en los niveles de esfuerzo bajo y medio, dejando el nivel xhigh centrado en la corrección.

El modelo incorpora un cabezal de predicción multi-token (MTP) que habilita decodificación especulativa, y la variante GGUF incluye un proyector de visión para entrada de imágenes. Las cuantizaciones se calibraron con sesiones completas de programación de Pi, lo que según el autor dirige la compresión hacia las partes del modelo más relevantes para esos flujos de trabajo. La model card indica que la evaluación de checkpoints se hizo con resultados reales de agente junto con tokens generados, llamadas a herramientas y tiempo de finalización, no solo con la pérdida de entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de texto conversacional y razonamiento con niveles de esfuerzo ajustables (bajo, medio y xhigh).
- Programación y generación de código orientada a tareas de agente: lectura de repositorios, edición de archivos y verificación de resultados.
- Uso de herramientas y function calling, con soporte para bucles iterativos de agente que incorporan la retroalimentación de las herramientas.
- Razonamiento multi-paso para depuración e implementación de tareas complejas.
- Capacidades multimodales de visión: entrada de imagen y texto (image-text-to-text) mediante el proyector de visión incluido.
- Decodificación especulativa mediante cabezal MTP (multi-token prediction).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de programación autónomo en un IDE o terminal: el modelo está ajustado para el bucle de leer repositorio, editar archivos, ejecutar herramientas y reaccionar a su salida, por lo que encaja en arneses tipo Pi para resolver tareas de código de principio a fin con verificación intermedia.
- Depuración iterativa de errores en producción: con los niveles de esfuerzo ajustables, se puede usar el nivel bajo o medio para iteraciones rápidas sobre trazas de error y reservar xhigh para fallos complejos donde prima la corrección sobre el coste.
- Integración en pipelines de CI/CD: el soporte de tool calling y function calling permite conectarlo a scripts de compilación, ejecución de tests y análisis estático para proponer parches y comprobar que pasan las pruebas.
- Asistencia a revisión de código: el modelo puede inspeccionar diffs y repositorios completos para señalar problemas y proponer cambios, aprovechando el entrenamiento sobre sesiones reales de trabajo con código.
- Automatización de tareas de mantenimiento de repositorios: actualización de dependencias, migraciones de API o refactorizaciones guiadas, donde el modelo alterna ediciones con la ejecución de herramientas de verificación.
- Análisis de capturas e interfaces junto a código: gracias al proyector de visión, puede recibir imágenes (por ejemplo, capturas de errores o diseños de UI) y relacionarlas con el código del proyecto.
- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones GGUF compactas IQ y Q4 permiten ejecutar el modelo con llama.cpp u Ollama en hardware limitado, útil para entornos con requisitos de privacidad.

## Benchmarks y rendimiento

La model card incluye gráficas de resultados (no tablas numéricas) para Terminal-Bench 2.1, GPQA Diamond y SciCode, comparando las variantes Pi y Base en los niveles de razonamiento bajo, medio y xhigh. Los datos concretos no están disponibles en la información proporcionada; solo se recogen las siguientes afirmaciones cualitativas del autor:

- En los resultados seleccionados, el nivel medio de Pi iguala la tasa de finalización del nivel xhigh del modelo base en Terminal-Bench 2.1 con aproximadamente un 41 % menos de tokens de salida.
- En GPQA Diamond, Pi alcanza la puntuación más alta en xhigh con una curva de éxito más suave a medida que aumenta el esfuerzo, mientras que el modelo base conserva la ventaja en esfuerzo medio.
- En SciCode, Pi resuelve más subproblemas en todos los niveles; en xhigh obtiene una puntuación superior con aproximadamente un 23 % menos de tokens de salida, aunque en medio su mayor puntuación requiere más tokens.

No se han publicado resultados numéricos de benchmarks en tablas en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con aproximadamente 26,9 mil millones de parámetros, las cuantizaciones Q4 rondarían el rango de 15-17 GB de pesos, y las variantes de mayor precisión (Q8, FP16) requerirían bastante más, pero la información proporcionada no confirma cifras concretas.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: las cuantizaciones compactas IQ y Q4_K_M están pensadas para ajustarse a hardware limitado, pero no se especifican modelos concretos de GPU.
- Opciones de despliegue: llama.cpp (etiqueta del repositorio), con cabezal MTP para decodificación especulativa; también existen versiones BF16 y FP8 para otros entornos. No se confirman vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi (este) | ~26,9 mil millones | No disponible | Ajuste para agente de código Pi con GRPO y eficiencia de razonamiento | Apache 2.0 | GGUF, BF16, FP8 en Hugging Face |
| Qwen3.8-27B (base) | ~26,9 mil millones | No disponible | Modelo base generalista | No disponible en la información | Hugging Face (Qwen) |
| Otras alternativas de ~27B | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar con el modelo base Qwen3.8-27B; no se dispone de datos de otros modelos comparables.

## Limitaciones y advertencias

- El ajuste está especializado en el arnés Pi y en tareas de programación; su comportamiento fuera de ese dominio o en conversación general puede degradarse respecto al modelo base.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de código donde puede proponer APIs o funciones inexistentes; se recomienda verificar siempre con herramientas y tests.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingüe equilibrado.
- Longitud de contexto: no disponible, lo que impide planificar su uso en repositorios grandes sin pruebas previas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.8-27B y de los datos de entrenamiento.
- El repositorio ocupa 328 GB, por lo que la descarga completa es costosa; es preferible descargar solo la cuantización necesaria, el proyector de visión y el cabezal MTP.
- El modelo es una cuantización de terceros (bytkim), no una versión oficial de Qwen; la calidad puede variar según la cuantización elegida.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bytkim/Qwen3.8-27B-pi-GGUF
- Versión BF16: https://huggingface.co/bytkim/Qwen3.8-27B-pi
- Versión FP8: https://huggingface.co/bytkim/Qwen3.8-27B-pi-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
