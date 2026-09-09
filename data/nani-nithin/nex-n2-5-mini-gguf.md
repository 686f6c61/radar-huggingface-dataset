# NANI-Nithin/Nex-N2.5-mini-GGUF

## Resumen

Nex-N2.5-mini es un modelo de lenguaje de la familia Nex-N2.5 desarrollada por nex-agi, orientado a tareas agénticas y al uso de ordenador (computer use). Esta versión concreta, publicada por NANI-Nithin, es una cuantización en formato GGUF del modelo base `nex-agi/Nex-N2.5-mini`, diseñada para ejecutarse localmente con llama.cpp y entornos compatibles como LM Studio, Open WebUI o KoboldCpp.

El modelo utiliza una arquitectura de mezcla de expertos (MoE) basada en Qwen2-MoE, con un total de aproximadamente 34,66 mil millones de parámetros. Según la información publicada por el desarrollador original, la familia Nex-N2.5 incluye tres tamaños (mini, Pro y Max), y las versiones mini y Pro se apoyan en las capacidades multimodales de Nex-N2, añadiendo mejoras específicas para navegación web, uso de ordenador y capacidades agénticas con fundamento visual.

Esta cuantización GGUF resulta relevante para desarrolladores e investigadores que quieren evaluar el modelo en infraestructura local sin depender de la API de Hugging Face, aprovechando el ecosistema llama.cpp y Ollama. Aunque la model card oficial solo declara inglés como idioma, el modelo puede heredar capacidades multilingües del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), tipo `qwen2_moe` |
| Parametros totales | 34.660.610.688 (aproximadamente 34,66 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (no se especifican las variantes exactas en la información disponible) |
| Idiomas soportados | inglés (declarado en la model card); otros idiomas, no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se publica por separado en safetensors) |

## Arquitectura y entrenamiento

La arquitectura de Nex-N2.5-mini se describe como `qwen2_moe`, es decir, un transformer basado en la familia Qwen2 con mecanismo de mezcla de expertos (Mixture of Experts). Esto significa que, aunque el total de parámetros es de 34.660 millones, solo una parte de ellos se activa por token, lo que permite reducir el coste computacional en inferencia. No se dispone de información detallada sobre el número de expertos, los parámetros activos por token ni la configuración de capas.

El modelo original forma parte de la familia Nex-N2.5 de nex-agi, orientada a tareas agénticas y de interacción con entornos informáticos. Según la información publicada en GitHub, las versiones mini y Pro continúan la base multimodal de Nex-N2, con mejoras centradas en el uso de ordenador, navegación web y capacidades agénticas a partir de información visual. No se han publicado detalles sobre los datos de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas como RLHF o DPO. Tampoco hay información específica sobre innovaciones técnicas en el proceso de cuantización, más allá de que se ha realizado con GGUF para compatibilidad con llama.cpp.

## Capacidades

- Generación de texto y razonamiento a partir de un modelo MoE de gran tamaño.
- Capacidades agénticas, según la descripción del desarrollador original, orientadas a automatizar flujos de trabajo y decisiones en entornos informáticos.
- Uso de ordenador (computer use): el modelo está diseñado para interactuar con interfaces y operaciones típicas de un sistema operativo.
- Navegación web: la familia Nex-N2.5 incorpora mejoras en la interacción con páginas web y tareas de búsqueda.
- Soporte multimodal (visión): la información publicada por NandoG-AI sobre una cuantización similar indica que incluye un archivo de proyección `mmproj` para capacidades de visión. Esto sugiere que el modelo base puede procesar entradas visuales, aunque la model card oficial de esta cuantización no lo detalla.
- Integración con el ecosistema llama.cpp y Ollama a través del formato GGUF.
- Soporte de tool calling o function calling: no se especifica explícitamente en la información disponible, aunque las capacidades agénticas del modelo original sugieren que es probable.

## Casos de uso

- Automatización de tareas en escritorio: el modelo puede ejecutarse localmente mediante llama.cpp y utilizarse para controlar aplicaciones de escritorio, automatizar acciones repetitivas o interaccionar con interfaces gráficas. Su diseño orientado a computer use lo hace adecuado para este escenario.
- Agentes de navegación web: gracias a las mejoras en web browsing de la familia Nex-N2.5, el modelo puede actuar como agente que busca información, navega por páginas y extrae datos de forma autónoma.
- Asistentes multimodales locales: la inclusión de un proyector multimodal en cuantizaciones similares permite usar el modelo con entradas visuales en entornos de inferencia local, por ejemplo para describir imágenes o responder preguntas sobre capturas de pantalla.
- Evaluación de modelos MoE en entornos sin GPU dedicada: al estar disponible en GGUF, puede ejecutarse en CPU o en GPUs con poca VRAM, permitiendo a investigadores probar el comportamiento de un modelo de 34 mil millones de parámetros sin necesidad de infraestructura de gama alta.
- Investigación sobre modelos agénticos: el modelo sirve como referencia para estudiar cómo los modelos MoE manejan tareas que requieren planificación, uso de herramientas y razonamiento multi-paso.
- Integración en pipelines locales de texto generativo: por su licencia Apache 2.0 y su formato compatible con Ollama y llama.cpp, se puede integrar en aplicaciones de chat, ayuda al desarrollo o análisis documental que requieran desplegar el modelo en un servidor propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones comparativas para este modelo o su cuantización.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita en la información proporcionada. Como orientación general, un modelo MoE de 34.660 millones de parámetros totales en cuantización Q4_K_M suele requerir entre 18 y 22 GB de VRAM, y menos memoria si se usa una cuantización más agresiva, aunque estos datos no están confirmados para esta versión.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible, aunque el formato GGUF permite ejecutarse en GPUs de NVIDIA con capacidad suficiente y también en modo CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Open WebUI, KoboldCpp y otros entornos que soporten GGUF. También se puede integrar con vLLM o TGI si se convierte el modelo a otros formatos, pero no está documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares. No se conocen datos de rendimiento, contexto ni configuración de expertos que permitan comparar este modelo con alternativas de la misma categoría.

## Limitaciones y advertencias

- Riesgo de alucinación: como cualquier modelo de lenguaje grande, puede generar contenido falso o sin verificar, especialmente en tareas agénticas donde las decisiones erróneas pueden tener consecuencias prácticas.
- Limitación documentada de idioma: la model card declara únicamente inglés como idioma soportado. Aunque el modelo base podría heredar capacidades multilingües de Qwen, no está confirmado para esta cuantización.
- Falta de información técnica: no se publican datos sobre la longitud de contexto, los parámetros activos ni las variantes de cuantización disponibles, lo que dificulta su evaluación y despliegue planificado.
- Cuantización de terceros: esta versión es una cuantización realizada por NANI-Nithin, no la salida oficial de nex-agi. La calidad, el comportamiento y las posibles degradaciones de rendimiento respecto al modelo original no están documentados.
- Ausencia de benchmarks: no hay resultados publicados que permitan validar su rendimiento en tareas de razonamiento, código o matemáticas, por lo que el uso en producción debe ir acompañado de pruebas propias.
- Licencia Apache 2.0: permite uso comercial, pero es necesario verificar que la redistribución del modelo y cualquier modificación cumplan con los términos de la licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NANI-Nithin/Nex-N2.5-mini-GGUF
- Repositorio GitHub de nex-agi: https://github.com/nex-agi/Nex-N2.5
- Cuantización GGUF similar de NandoG-AI: https://huggingface.co/NandoG-AI/Nex-N2.5-mini-GGUF
