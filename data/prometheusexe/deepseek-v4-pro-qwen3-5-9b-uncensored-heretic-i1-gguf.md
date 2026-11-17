# PrometheusEXE/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF es una cuantización en formato GGUF del modelo xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, publicada por el usuario PrometheusEXE en Hugging Face. Se trata de una destilación de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) que combina la familia Qwen3.5 con técnicas de entrenamiento atribuidas a DeepSeek-V4-Pro, según indican las etiquetas del repositorio (distillation, sft, rl, gspo, mtp). El modelo está orientado a razonamiento, matemáticas, STEM, uso de herramientas y function calling, y ha sido sometido a un proceso de "abliteration" o decensurado que elimina las restricciones de rechazo de contenido.

La relevancia de esta ficha radica en que ejemplifica una tendencia del ecosistema open source: la proliferación de variantes comunitarias derivadas de modelos base mediante cuantización (GGUF con imatrix), ajuste fino y modificaciones de alineación. El repositorio tiene 81,3 GB de tamaño total, lo que sugiere la presencia de múltiples niveles de cuantización GGUF empaquetados, y declara soporte para seis idiomas (inglés, chino, coreano, japonés, español y ruso).

Cabe señalar que el acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos. La licencia declarada es Apache 2.0, aunque la condición de modelo derivado y decensurado introduce matices legales y de uso que se detallan en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, según etiqueta `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 9.197.093.888 (≈9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (etiqueta `imatrix`); niveles concretos no disponibles |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); modelo base presumiblemente en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio. El tag `qwen3_5` apunta a que el modelo base pertenece a la familia Qwen3.5, es decir, un transformer decoder-only, pero no se especifican número de capas, dimensión oculta, mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa. El tag `mtp` (multi-token prediction) sugiere que el entrenamiento pudo emplear predicción multi-token, una técnica habitual en modelos recientes para mejorar la eficiencia de muestreo, aunque no se confirma su implementación en inferencia.

En cuanto al entrenamiento, las etiquetas indican un pipeline que incluye destilación (`distillation`), ajuste supervisado (`sft`), aprendizaje por refuerzo (`rl`) con el algoritmo GSPO (`gspo`) y posiblemente entrenamiento orientado a matemáticas y STEM. No se dispone del número de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de RLHF/DPO. La modificación "heretic/uncensored/abliterated" implica una intervención posterior sobre la alineación para eliminar comportamientos de rechazo, presumiblemente mediante abliteration (proyección ortogonal de la dirección de rechazo en los pesos). No hay información pública sobre el método exacto ni sobre el impacto en capacidades.

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta `conversational`.
- Razonamiento explícito y modo de pensamiento (etiquetas `reasoning`, `thinking` implícita en la familia).
- Matemáticas y STEM, reforzado por las etiquetas `math` y `stem`.
- Generación de código y resolución de problemas técnicos.
- Tool calling y function calling (`tool-use`, `function-calling`).
- Capacidades de agente y razonamiento multi-paso (derivadas del entrenamiento con RL y tool use).
- Multilingüe en seis idiomas: inglés, chino, coreano, japonés, español y ruso.
- Comportamiento decensurado: ausencia de rechazos ante contenido que otros modelos alineados bloquearían.

## Casos de uso

- Asistencia técnica y atención al cliente multilingüe: el modelo cubre seis idiomas y puede gestionar conversaciones multi-turno; útil para soporte en español, inglés, chino, coreano, japonés y ruso sin cambiar de modelo.
- Generación de código en pipelines de CI/CD: con soporte de function calling, puede integrarse en herramientas que invocan APIs, ejecutan tests o consultan repositorios, aunque requiere validación humana por el riesgo de alucinación.
- Resolución de problemas matemáticos y STEM: adecuado para tutores automáticos o generación de ejercicios paso a paso, aprovechando el entrenamiento específico en math y stem.
- Agentes autónomos de investigación: el modo de razonamiento y el soporte de tool use permiten construir flujos multi-paso que consultan fuentes externas y sintetizan resultados.
- Investigación sobre alineación y decensurado: el modelo sirve como caso de estudio para analizar cómo la abliteration afecta a la utilidad, la seguridad y la coherencia en tareas sensibles.
- Despliegue local en estaciones de trabajo: al estar en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos con GPU de consumo, lo que facilita prototipado sin infraestructura cloud.
- Generación de contenido creativo sin restricciones: útil para escritura de ficción que aborde temas que los modelos alineados rechazan, siempre con revisión editorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para 9,2 B de parámetros, en cuantización Q4_K_M se estiman aproximadamente 5,5-6 GB de pesos; en Q8_0, unos 9,5-10 GB; en FP16, unos 18,4 GB. Estas cifras son estimaciones por tamaño y no proceden de la documentación del modelo.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100 o H100 para FP16 y despliegues concurrentes.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4 y Q5 en GPUs de 8-12 GB; Q8 requiere 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (TGI) y vLLM (este último con soporte GGUF variable). La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (GGUF) | ≈9,2 B | no disponible | Apache 2.0 | GGUF | Decensurado, destilado, multilingüe |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alineado, sin decensurar |
| Llama-3.1-8B-Instruct | 8,0 B | 128.000 tokens | Llama 3.1 Community | safetensors, GGUF | Alineado, contexto largo |
| Gemma-2-9B-it | 9,2 B | 8.192 tokens | Gemma Terms | safetensors, GGUF | Alineado, licencia restrictiva |

La comparación es aproximada: no se dispone de datos de rendimiento del modelo evaluado, por lo que la tabla solo contrasta parámetros, contexto y licencia. El modelo base declarado (Qwen3.5) no tiene ficha pública verificable en la información proporcionada.

## Limitaciones y advertencias

- Modelo decensurado: la abliteration elimina rechazos de seguridad, lo que incrementa el riesgo de generar contenido dañino, ilegal o sesgado; no es apto para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación: como todo modelo de 9 B, puede inventar hechos, citas o APIs; requiere verificación en producción.
- Acceso restringido: el repositorio es gated y exige aceptar condiciones en Hugging Face, lo que complica la automatización de descargas.
- Licencia Apache 2.0 declarada, pero al ser un derivado de un modelo base y de un proceso de decensurado, la cadena de licencias puede ser discutible; conviene revisar los términos del modelo base antes de uso comercial.
- Sin datos de benchmarks ni de contexto: no se puede garantizar el rendimiento en tareas de contexto largo ni comparar objetivamente con alternativas.
- Idiomas: aunque declara seis idiomas, no hay evaluación de calidad por idioma; el español puede tener un rendimiento inferior al inglés o al chino.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria ni evidencia de uso en producción.
- El tamaño del repo (81,3 GB) sugiere múltiples cuantizaciones; verificar qué archivo concreto se descarga para evitar consumos de disco y ancho de banda innecesarios.

## Enlaces

- Hugging Face: https://huggingface.co/PrometheusEXE/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
