# noctrex/Ling-3.0-tiny-MXFP4_MOE-GGUF

## Resumen

Ling-3.0-tiny es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por inclusionAI, la división de inteligencia artificial de Ant Group. Este repositorio concreto, noctrex/Ling-3.0-tiny-MXFP4_MOE-GGUF, contiene cuantizaciones en formato GGUF del modelo original, preparadas para su ejecución local mediante llama.cpp y otras herramientas compatibles. El modelo base cuenta con 7.893.392.800 parámetros totales, de los cuales se activan aproximadamente 1.300 millones por token, lo que lo convierte en una opción eficiente para tareas de razonamiento, generación de código y uso como agente.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo MoE de última generación en hardware de consumo, gracias a las cuantizaciones MXFP4 que reducen significativamente el peso de los tensores de expertos. El modelo original soporta una ventana de contexto de 256.000 tokens y dispone de modos de pensamiento (Thinking) e instantáneo (Instant), además de capacidades de tool calling y prompt caching. Aunque la licencia del modelo base no se indica en la información disponible, el repositorio de cuantización es de acceso público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (alterna capas con atención tipo Kimi) |
| Parametros totales | 7.893.392.800 (7,9 B) |
| Parametros activos | 1,3 B por token |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | MXFP4 (MoE), Q8_XL_MOE, BF16, F16, Q8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-tiny emplea una arquitectura híbrida de Mixture of Experts que combina capas de atención tradicionales con bloques alternos basados en el mecanismo Kimi, diseñado para reducir el coste computacional manteniendo la calidad en razonamiento de largo alcance. Con 7,9 B parámetros totales y solo 1,3 B activos por token, el modelo logra un equilibrio entre capacidad y eficiencia en inferencia. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF/DPO) en los materiales consultados.

Las cuantizaciones MXFP4 aplican un formato de punto flotante de 4 bits con escalado por bloque a los tensores de los expertos MoE, mientras que el resto de tensores se mantienen en BF16 o FP16 según la variante elegida. La variante Q8_XL_MOE utiliza cuantización Q8 para los expertos y BF16 para el resto, priorizando la calidad sobre el ahorro de memoria. Estas conversiones permiten ejecutar el modelo en hardware de consumo con una pérdida de precisión mínima.

## Capacidades

- Generación de texto y razonamiento complejo con modo "Thinking" (pensamiento extendido) y modo "Instant" (respuesta rápida).
- Generación de código y soporte para tareas de programación en múltiples lenguajes.
- Tool calling / function calling, lo que permite integrar el modelo en flujos de agentes que invocan APIs o herramientas externas.
- Prompt caching para reducir la latencia en conversaciones multi-turno y contextos largos.
- Capacidades multilingües, aunque no se especifican los idiomas exactos en la documentación consultada.
- Ventana de contexto de 256.000 tokens, adecuada para documentos extensos y análisis de código fuente amplio.

## Casos de uso

- Asistentes de programación locales: el modelo puede ejecutarse en una estación de trabajo con GPU de 8-12 GB, ofreciendo autocompletado y explicaciones de código sin conexión, gracias a su soporte de tool calling y razonamiento.
- Análisis de documentos legales o técnicos: con 256K de contexto, permite procesar contratos completos o repositorios de código de gran tamaño en una sola pasada, resumiendo cláusulas o detectando patrones.
- Agentes autónomos para automatización de tareas: su capacidad de function calling y razonamiento multi-paso lo hace apto para orquestar flujos como envío de correos, consultas a bases de datos o gestión de calendarios.
- Chatbots de atención al cliente con memoria extendida: el prompt caching y la ventana larga permiten mantener conversaciones prolongadas sin perder el hilo, reduciendo costes de inferencia.
- Prototipado rápido de aplicaciones de IA en entornos sin conexión: al estar disponible en GGUF, puede desplegarse con llama.cpp u Ollama en portátiles con GPU integrada, ideal para desarrollo y pruebas.
- Investigación en eficiencia de modelos MoE: las cuantizaciones MXFP4 ofrecen un caso de estudio práctico sobre el equilibrio entre calidad y rendimiento en arquitecturas de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Ling-3.0-tiny podría tener métricas oficiales en la documentación de inclusionAI, pero no se han facilitado en los materiales consultados. No se proporcionan números de MMLU, HumanEval, GSM8K ni otros tests estandarizados.

## Requisitos de hardware

- VRAM estimada según variante: Q8_XL_MOE 8,77 GiB, BF16 4,54 GiB, F16 4,94 GiB, Q8 4,94 GiB. La mayoría de estas caben en GPUs de consumo con 8 GB o más.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, o GPUs de datacenter como A10, L4 o A100 si se requiere mayor throughput.
- En GPUs con soporte nativo de BF16 (Ampere o superior), la variante BF16 ofrece la máxima precisión; en arquitecturas más antiguas, F16 puede ser más rápida.
- Despliegue recomendado con llama.cpp (última versión), Ollama o servidores compatibles con GGUF como llama-cpp-python. También es posible usar vLLM si se convierte a otro formato, aunque no está indicado.
- Latencia y throughput: no disponibles. Dependen del hardware y de la variante elegida; se espera que las variantes FP4 sean más rápidas en MoE gracias al menor ancho de banda requerido.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos MoE pequeños como Qwen3-30B-A3B o DeepSeek-V3-Lite. Sin embargo, en términos de parámetros totales y activos, Ling-3.0-tiny se sitúa en un rango similar a otros modelos de 7-8B con 1-2B activos. La principal diferencia es su arquitectura híbrida con capas Kimi y su ventana de contexto de 256K, superior a la mayoría de alternativas de su tamaño. La licencia del modelo base no se ha confirmado, mientras que otros modelos como Qwen3 usan Apache 2.0. Se recomienda verificar la documentación oficial de inclusionAI para obtener una comparativa completa.

## Limitaciones y advertencias

- No se ha confirmado la licencia del modelo base; antes de usarlo en producción comercial, es necesario verificar los términos de uso en el repositorio oficial de inclusionAI.
- La información sobre idiomas soportados es limitada; es posible que el rendimiento en lenguas distintas del chino e inglés sea inferior.
- Al ser un modelo de 7,9B con solo 1,3B activos, puede presentar alucinaciones en tareas que requieren conocimiento factual muy específico o actualizado.
- Las cuantizaciones MXFP4 y Q8 pueden introducir una ligera degradación en la calidad de generación, especialmente en tareas de razonamiento matemático o lógico complejo.
- El modelo no incluye capacidades multimodales (visión, audio) en esta versión; es exclusivamente de texto.
- No se han publicado resultados de benchmarks oficiales, por lo que las expectativas de rendimiento deben basarse en pruebas propias.

## Enlaces

- Repositorio de cuantización: https://huggingface.co/noctrex/Ling-3.0-tiny-MXFP4_MOE-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Página del proyecto Ling en SourceForge: https://sourceforge.net/projects/ling-3-0-tiny/
- Documentación oficial de Ant Group sobre Ling: https://developer.ant-ling.com/en/docs/models/ling/
- Acceso a Ling 3.0 Tiny vía LLMTR: https://llmtr.com/en/models/inclusionai/ling-3.0-tiny
- Perfil del autor de la cuantización: https://huggingface.co/noctrex/models
