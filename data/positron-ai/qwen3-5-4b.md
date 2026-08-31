# positron-ai/Qwen3.5-4B

## Resumen

El repositorio `positron-ai/Qwen3.5-4B` es un espejo (mirror) del modelo oficial `Qwen/Qwen3.5-4B`, publicado por Positron AI con fines de integración continua (CI). No contiene modificaciones respecto al original salvo el README; todos los archivos son byte-idénticos a la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` del repositorio upstream. Por tanto, las características del modelo son las del Qwen3.5-4B original, un modelo de 4.659.865.088 parámetros (aproximadamente 4.7B) con licencia Apache 2.0.

Según la información disponible en fuentes externas, Qwen3.5-4B es un modelo de lenguaje multimodal (texto, imagen y vídeo) con arquitectura causal y encoder de visión, diseñado para razonamiento, generación de código y flujos de trabajo agénticos con contexto muy largo. Se posiciona como la opción intermedia de la serie Qwen 3.5 Small, con un rendimiento que, según afirmaciones cualitativas, se acerca al de modelos de mayor tamaño de generaciones anteriores. Este mirror es relevante para equipos que necesitan una fuente estable y anónima para descargas automatizadas en pipelines de CI, evitando problemas de rate limits o cambios en el repositorio upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language causal transformer con encoder de visión (según fuentes externas) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (fuentes externas mencionan "contexto muy largo", sin cifra concreta) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en BF16; se menciona en guías externas que puede ejecutarse en Q4 con ~2.5 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards, índice presente) |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles oficiales sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados. El README del mirror solo confirma que es una copia exacta del modelo upstream. Fuentes externas describen Qwen3.5-4B como un modelo multimodal con encoder de visión, capaz de procesar texto, imágenes y vídeo, y con una arquitectura causal. No se dispone de datos sobre el número de tokens de entrenamiento, composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). Se recomienda consultar la documentación oficial de Qwen para obtener estos detalles.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de texto, imagen y vídeo de forma nativa.
- Generación de código: indicada para tareas de programación y razonamiento lógico.
- Soporte para flujos de trabajo agénticos: diseñado para agentes y razonamiento multi-paso, según fuentes externas.
- Contexto largo: se menciona que soporta ventanas de contexto muy amplias, aunque no se especifica la cifra exacta.
- Capacidades multilingües: no confirmadas en la información disponible.
- Tool calling / function calling: no confirmado explícitamente, aunque se asocia a usos agénticos.

## Casos de uso

- Integración en pipelines de CI/CD: el mirror permite descargas estables y anónimas para automatizar pruebas de modelos sin depender de la disponibilidad del repositorio upstream.
- Desarrollo de asistentes multimodales: al aceptar imagen y vídeo, puede usarse en aplicaciones que requieran comprensión visual combinada con texto, como análisis de capturas de pantalla o vídeos cortos.
- Generación de código en entornos locales: con un tamaño de ~4.7B parámetros, puede ejecutarse en GPUs de consumo (según guías externas, ~2.5 GB en cuantización Q4), lo que permite usarlo en editores o herramientas de autocompletado.
- Prototipado de agentes conversacionales: su capacidad para razonamiento multi-paso y contexto largo lo hace adecuado para chatbots con memoria extendida.
- Investigación académica: al ser Apache 2.0, puede usarse libremente en experimentos y publicaciones sin restricciones de uso comercial.
- Evaluación comparativa de modelos pequeños: sirve como referencia para medir el rendimiento de modelos de ~4B en tareas de razonamiento y visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las fuentes externas mencionan comparaciones cualitativas (por ejemplo, que se acerca a Qwen3-30B en MMLU-Pro o que supera a GPT-5-Nano en benchmarks de visión), pero no proporcionan cifras concretas. No se incluyen números para evitar inventar datos.

## Requisitos de hardware

- VRAM estimada: según fuentes externas, ~8 GB en precisión completa (BF16) y ~2.5 GB en cuantización Q4.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16 (p. ej., RTX 3070/4080, A10, L4); para Q4, GPUs con 4 GB o menos pueden ser suficientes.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas como RTX 3060 (12 GB) o superiores.
- Opciones de despliegue: no se especifican en la información, pero por el formato safetensors y el tamaño, es compatible con frameworks como vLLM, llama.cpp, Ollama o TGI (no confirmado oficialmente).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos cuantitativos para una comparación rigurosa. Como referencia cualitativa, se puede mencionar que Qwen3.5-4B es el sucesor de Qwen3-4B, con capacidades multimodales añadidas. Sin embargo, no se conocen especificaciones detalladas de Qwen3-4B en la información proporcionada, por lo que no se puede elaborar una tabla comparativa fiable. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- Este repositorio es un mirror de CI: no debe usarse como fuente para procesamiento de pesos ni como referencia de evaluación. El modelo canónico es el repositorio upstream `Qwen/Qwen3.5-4B`.
- No se reportan resultados de evaluación en este repositorio; cualquier atribución de rendimiento a este mirror sería incorrecta.
- La información técnica detallada (contexto exacto, idiomas, arquitectura interna) no está disponible en las fuentes consultadas; se recomienda acudir a la documentación oficial de Qwen.
- Al ser un modelo multimodal, puede presentar sesgos visuales o alucinaciones en la interpretación de imágenes o vídeos, aunque no hay datos específicos al respecto.
- La licencia Apache 2.0 permite uso comercial, pero se deben respetar los términos de la licencia del modelo original (que también es Apache 2.0 según el README).

## Enlaces

- Repositorio mirror: https://huggingface.co/positron-ai/Qwen3.5-4B
- Repositorio upstream: https://huggingface.co/Qwen/Qwen3.5-4B
- Página de Qwen3-4B (modelo anterior): https://huggingface.co/Qwen/Qwen3-4B
- Ficha en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-4b/
- Ficha en There's An AI For That: https://theresanaiforthat.com/model/qwen3-5-4b/
- Página en Ollama: https://ollama.com/library/qwen3.5:4b
- Guía en The AI Bench: https://theaibench.ai/models/qwen-3-5-4b/
