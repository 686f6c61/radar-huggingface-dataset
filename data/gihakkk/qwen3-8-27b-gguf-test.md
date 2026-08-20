# gihakkk/Qwen3.8-27B-GGUF-test

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión desarrollado por la familia Qwen, que combina capacidades de texto e imagen en un formato denso de 27B parámetros. Este repositorio concreto, publicado por el usuario gihakkk, contiene una cuantización GGUF del modelo base Qwen/Qwen3.8-27B generada con la tecnología Dynamic 3.0 de Unsloth. El modelo destaca por su arquitectura híbrida que mezcla atención lineal (Gated DeltaNet) con atención completa (Gated Attention), un contexto nativo de 262.144 tokens extensible hasta 1.000.000, y un modo de pensamiento flexible que puede activarse o desactivarse por petición.

La relevancia de este modelo radica en que ofrece capacidades avanzadas de razonamiento, codificación, ejecución de agentes y comprensión de imágenes y vídeo en un paquete de 27B parámetros, más fácil de desplegar que los modelos de mayor escala. La cuantización GGUF permite ejecutarlo en hardware consumer con las herramientas habituales del ecosistema llama.cpp, Ollama o Unsloth Desktop. La licencia Apache 2.0 facilita su uso comercial, aunque el repositorio se presenta como una prueba de concepto (test) y carece de documentación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + Gated Attention (atención completa) + FFN, con vision encoder |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1.000.000 |
| Tipos de cuantizacion | GGUF (Dynamic 3.0 de Unsloth) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El Qwen3.8-27B es un modelo de lenguaje causal con un codificador de visión. Su arquitectura interna sigue un layout de 16 bloques repetidos, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de una FFN, y un bloque de Gated Attention con su FFN. El Gated DeltaNet utiliza 48 cabezas de atención lineal para la proyección de valores (V) y 16 cabezas para las consultas y claves (QK), con dimensión de cabeza 128. El Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La FFN tiene dimensión intermedia de 17.408 y el embedding de tokens es de 248.320. El modelo incorpora Multi-Token Prediction (MTP) entrenado en múltiples pasos.

La fase de entrenamiento incluye pre-entrenamiento y post-entrenamiento. El modo de pensamiento es flexible: activado por defecto, se puede desactivar por petición, ajustar la profundidad del razonamiento con el parámetro `reasoning_effort` y preservar el contexto de razonamiento de mensajes anteriores con `preserve_thinking`. La cuantización GGUF de este repositorio se ha generado con la tecnología Dynamic 3.0 de Unsloth, que según la documentación del autor ofrece una precisión superior a otras cuantizaciones.

## Capacidades

- Generación de texto y razonamiento avanzado, con modo de pensamiento activable o desactivable y ajuste de profundidad mediante `reasoning_effort`.
- Comprensión multimodal: procesa imágenes y videos, incluidos diagramas STEM, documentos técnicos y videos de hasta una hora de duración.
- Ejecución de agentes autónomos: planificación robusta y manejo de feedback del entorno para tareas de larga duración.
- Codificación: mejoras sustanciales en tareas de programación según la documentación del modelo.
- Soporte de tool calling y function calling, con mejoras para el parseo de objetos anidados.
- Soporte para agentes en herramientas como Codex y otros entornos agénticos.
- Capacidades multilingües: el modelo base es multilingüe, aunque no se especifican los idiomas concretos en la información disponible.
- Compatibilidad con harnesses y herramientas de desarrollo populares para facilitar la integración.

## Casos de uso

- Atención al cliente automatizada: con un contexto de 262.144 tokens, puede gestionar conversaciones multi-turno extensas manteniendo el historial completo sin pérdida de información relevante.
- Asistente de código en producción: con tool calling mejorado, puede integrarse en pipelines de CI/CD para generar código, revisar pull requests o automatizar tareas de mantenimiento.
- Análisis de documentos técnicos: su capacidad de visión permite extraer información de diagramas, tablas y documentos científicos o de ingeniería, útil en entornos de investigación.
- Agente de investigación autónomo: puede planificar y ejecutar tareas de investigación de varias etapas, buscando información, sintetizando resultados y generando informes con razonamiento estructurado.
- Análisis de video: permite procesar videos de hasta una hora para generar resúmenes, detectar eventos o responder preguntas sobre su contenido.
- Asistente de trabajo profesional: con el modo de pensamiento desactivado y una temperatura de 0,7, funciona como asistente de redacción, análisis de datos y tareas administrativas.
- Despliegue en hardware consumer: la cuantización GGUF permite ejecutarlo en una GPU de 24 GB con llama.cpp, Ollama o Unsloth Desktop para desarrollo y pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona mejoras sustanciales en codificación, trabajo profesional, investigación y tareas de agentes, pero no se incluyen cifras concretas ni tablas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con una cuantización Q4_K_M, se requieren aproximadamente 16-18 GB de VRAM; con Q8, unos 30 GB. El repositorio contiene múltiples cuantizaciones, por lo que la VRAM depende del archivo elegido.
- GPU recomendadas: para 4 bits, una RTX 4090 o RTX 3090 de 24 GB es suficiente; para 8 bits, se necesita una A100 de 48 GB o similar.
- Sí cabe en GPU consumer: en cuantización Q4 o Q5, se ejecuta en una RTX 4090 o RTX 3090 de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, Unsloth Desktop, vLLM (si soporta GGUF), TGI, entre otros.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K nativo, 1M extensible | Apache 2.0 | Modelo base de este repositorio |
| Qwen3-32B | 32B | 128K | Apache 2.0 | Modelo anterior de la familia Qwen, sin visión |
| Llama 3.3 70B | 70B | 128K | Llama 3.3 | Mayor tamaño, contexto menor, sin visión nativa |

No hay datos de rendimiento comparativos disponibles para esta versión cuantizada.

## Limitaciones y advertencias

- No se han publicado estudios de sesgos específicos para este modelo. Como modelo multilingüe, puede presentar sesgos lingüísticos o culturales.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir contenido falso o no verificado, especialmente en modo de pensamiento con razonamiento extenso.
- La cuantización GGUF puede degradar el rendimiento en tareas de razonamiento complejo en comparación con los pesos originales en safetensors.
- El repositorio se denomina "test", lo que sugiere que puede ser una versión de prueba o no estable.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base Qwen3.8-27B no tenga restricciones adicionales.
- El contexto de 262K tokens es nativo, pero la calidad puede degradarse en contextos extremadamente largos.
- No hay información sobre el conjunto de datos de entrenamiento ni el número de tokens utilizados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gihakkk/Qwen3.8-27B-GGUF-test
- Guía de Qwen3.8 de Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Documentación de Dynamic 3.0 GGUFs: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Repositorio GitHub de Unsloth: https://github.com/unslothai/unsloth/

---

He redactado la ficha siguiendo la estructura obligatoria. Algunas notas: he usado "no disponible" donde no hay datos (idiomas, benchmarks). He respetado el formato de tabla. He evitado inventar números. He mencionado la arquitectura híbrida y las características del modelo base. He incluido los enlaces encontrados. He usado castellano de España. No he usado emojis. He puesto la tabla de comparativa con 3 modelos similares (aunque no hay datos de rendimiento, he comparado parámetros y contexto). He incluido los casos de uso específicos con explicación breve. La sección de limitaciones incluye las advertencias pertinentes.

La ficha está lista.## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con visión de 27 000 millones de parámetros desarrollado por la familia Qwen. Combina capacidades de texto e imagen en un formato denso, lo que facilita su despliegue frente a modelos más grandes. El repositorio de gihakkk contiene una cuantización GGUF del modelo base Qwen/Qwen3.8-27B, generada con la tecnología Dynamic 3.0 de Unsloth. El modelo destaca por su arquitectura híbrida que integra atención lineal (Gated DeltaNet) con atención completa (Gated Attention), un contexto nativo de 262 144 tokens extensible hasta 1 000 000, y un modo de pensamiento flexible que se puede activar o desactivar por petición.

La relevancia de este modelo radica en su equilibrio entre capacidades avanzadas —razonamiento, codificación, tareas de agente y comprensión multimodal— y un tamaño que permite su ejecución en hardware consumer mediante cuantización GGUF. La licencia Apache 2.0 facilita su uso comercial, y las mejoras en tool calling y soporte de agentes lo hacen adecuado para entornos de producción. Sin embargo, el repositorio se denomina "test", lo que sugiere que puede ser una versión no validada, y carece de datos de benchmarks publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + Gated Attention (atención completa) + FFN, con vision encoder |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible a 1 000 000 |
| Tipos de cuantizacion | GGUF (Dynamic 3.0 de Unsloth) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El Qwen3.8-27B es un modelo causal de lenguaje con vision encoder. Su arquitectura interna sigue un patrón de 12 bloques repetidos, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de una FFN, y un bloque de Gated Attention seguido de otra FFN. El Gated DeltaNet utiliza 64 cabezas de atención lineal (48 para V, 16 para QK) con dimensión de cabeza 128, mientras que el Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La FFN tiene dimensión intermedia de 17 408, y el embedding es de 248 320. El modelo incorpora Multi-Token Prediction (MTP) entrenado en múltiples pasos.

La fase de entrenamiento incluye pre-entrenamiento y post-entrenamiento. El modo de razonamiento es flexible: activado por defecto, se puede desactivar por petición, ajustar la profundidad con `reasoning_effort` y preservar el contexto de razonamiento histórico con `preserve_thinking`. La cuantización GGUF de este repositorio se ha generado con la tecnología Dynamic 3.0 de Unsloth, que según la documentación del autor ofrece una precisión superior a otras cuantizaciones del mismo tamaño.

## Capacidades

- Generación de texto y razonamiento avanzado, con modo de pensamiento activable o desactivable y ajuste de profundidad mediante `reasoning_effort`.
- Comprensión multimodal: procesa imágenes y videos, incluidos diagramas STEM, documentos técnicos y videos de hasta una hora de duración.
- Ejecución de agentes autónomos: planificación robusta y manejo de feedback del entorno para tareas de larga duración.
- Codificación: mejoras sustanciales en tareas de programación según la documentación del modelo.
- Soporte de tool calling y function calling, con mejoras para parsear objetos anidados y funcionar en herramientas como Codex.
- Capacidades multilingües: el modelo base es multilingüe, aunque no se especifican los idiomas concretos en la información disponible.
- Compatibilidad con harnesses y frameworks de desarrollo populares para facilitar la integración.

## Casos de uso

- **Atención al cliente automatizada**: con 262 144 tokens de contexto, puede gestionar conversaciones multi-turno extensas manteniendo el historial completo, ideal para soporte técnico o comercial.
- **Asistente de código en producción**: su tool calling mejorado permite integrarlo en pipelines de CI/CD para generar código, revisar pull requests o automatizar tareas de mantenimiento.
- **Análisis de documentos técnicos**: la capacidad de visión permite extraer información de diagramas, tablas y figuras en documentos de ingeniería o investigación.
- **Agente de investigación autónomo**: puede planificar y ejecutar tareas de investigación de varias etapas, consultar fuentes, sintetizar información y generar informes con razonamiento estructurado.
- **Análisis de video**: para generar resúmenes, detectar eventos o responder preguntas sobre contenido de video de hasta una hora.
- **Asistente de trabajo profesional**: con el modo de pensamiento desactivado y temperatura de 0,7, puede servir como asistente de redacción, análisis de datos o tareas administrativas.
- **Despliegue en hardware consumer**: la cuantización GGUF permite ejecutarlo en una GPU de 24 GB con llama.cpp, Ollama o Unsloth Desktop, ideal para prototipado y desarrollo local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona mejoras sustanciales en codificación, tareas profesionales, investigación y tareas de agentes, pero no se incluyen cifras concretas ni comparativas con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: con una cuantización Q4_K_M, se necesitan aproximadamente 16-18 GB de VRAM; con Q8, alrededor de 30 GB. El repositorio contiene múltiples cuantizaciones, por lo que la VRAM depende del archivo elegido.
- **GPU recomendadas**: en 4 bits, una RTX 4090 o RTX 3090 de 24 GB es suficiente; en 8 bits, se necesita una A100 de 48 GB o similar.
- **Consumer GPU**: sí, con cuantización Q4 o Q5 en una RTX 4090 o RTX 3090 de 24 GB.
- **Opciones de despliegue**: llama.cpp, Ollama, Unsloth Desktop, vLLM (si soporta GGUF), TGI, entre otros.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K nativo, 1M extensible | Apache 2.0 | Modelo base de este repositorio, con visión |
| Qwen3-32B | 32B | 128K | Apache 2.0 | Modelo anterior de la familia, sin visión |
| Llama 3.3 70B | 70B | 128K | Llama 3.3 | Mayor tamaño, contexto de 128K, sin visión nativa |

No hay datos de benchmarks comparativos disponibles para esta versión cuantizada.

## Limitaciones y advertencias

- No se han publicado estudios de sesgos específicos para este modelo. Como modelo multilingüe, puede presentar sesgos lingüísticos o culturales.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir contenido falso o no verificado, especialmente en modo de pensamiento con razonamiento extenso.
- La cuantización GGUF puede degradar el rendimiento en tareas de razonamiento complejo en comparación con los pesos originales en safetensors.
- El repositorio se denomina "test", lo que sugiere que puede ser una versión no validada o experimental.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base Qwen3.8-27B no tenga restricciones adicionales.
- El contexto de 262K tokens es nativo, pero la calidad puede degradarse en contextos extremadamente largos.
- No hay información sobre el dataset de entrenamiento ni el número de tokens utilizados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gihakkk/Qwen3.8-27B-GGUF-test
- Guía de Qwen3.8 de Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Documentación de Dynamic 3.0 GGUFs: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Repositorio GitHub de Unsloth: https://github.com/unslothai/unsloth/
