# pertai/qwen38-et-27b-GGUF

## Resumen

El modelo `pertai/qwen38-et-27b-GGUF` es una adaptación del modelo base Qwen/Qwen3.8-27B, desarrollado por el autor pertai, específicamente optimizado para el idioma estonio mediante un proceso de fusión que combina el modelo base con un entrenamiento continuo (CPT) y habilidades adicionales (skills). El resultado se distribuye como un único archivo GGUF cuantizado en Q6_K, pensado para su uso con Ollama y otros motores de inferencia compatibles con este formato.

La relevancia de este modelo radica en que ofrece una alternativa de código abierto (licencia Apache 2.0) con un rendimiento notable en tareas en estonio, superando según su autor a GPT y Gemini en una evaluación local bloqueada (85,8% de acierto). Además, mantiene capacidades sólidas en generación de código (HumanEval 85,4%) y mejora la perplejidad en textos de ficción en un 31% respecto al modelo base. El tamaño de 27.320 millones de parámetros y la cuantización Q6_K (21 GB) lo hacen viable para GPUs de consumo con 24 GB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen3.8-27B, presumiblemente transformer denso) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (GGUF) |
| Idiomas soportados | estonio (et) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo único) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.8-27B, aunque por la serie Qwen se trata de un transformer denso con atención estándar. El proceso de adaptación consistió en una fusión completa del modelo base con un entrenamiento continuo (CPT) sobre datos en estonio y la incorporación de habilidades específicas (skills). El autor indica que la cuantización Q4_K_M corrompe los pesos ajustados por CPT, provocando errores ortográficos, por lo que se eligió Q6_K para preservar la calidad. No se especifican los datos de entrenamiento ni el número de tokens utilizados.

## Capacidades

- Generación de texto en estonio con alta precisión ortográfica y gramatical, según la evaluación interna del autor.
- Razonamiento y comprensión de lenguaje natural en estonio, con puntuación del 85,8% en una evaluación bloqueada que supera a GPT y Gemini en la misma prueba.
- Generación de código: HumanEval 85,4%, lo que indica competencia en tareas de programación.
- Mejora en perplejidad de textos de ficción (−31% frente al modelo base), lo que sugiere mejor coherencia narrativa y fluidez.
- Compatible con Ollama mediante un Modelfile incluido en el repositorio; se recomienda usar `think=false` para desactivar el modo de razonamiento explícito.
- Etiquetado como conversacional y compatible con endpoints, lo que permite integración en servicios de chat.

## Casos de uso

- Atención al cliente en estonio: el modelo puede gestionar conversaciones multi-turno en este idioma con precisión, gracias a su entrenamiento específico y a su naturaleza conversacional. Se puede desplegar con Ollama o en un endpoint compatible.
- Generación de código en entornos de desarrollo: con HumanEval 85,4%, es adecuado para asistencia en programación, autocompletado o generación de funciones en proyectos que requieran soporte en estonio o multilingüe.
- Traducción y localización: aunque no se especifica como traductor, su dominio del estonio permite usarlo para revisar o generar contenido localizado, mejorando la naturalidad frente a modelos genéricos.
- Creación de contenido literario o ficción: la mejora del 31% en perplejidad de ficción lo hace útil para redacción de narrativas, cuentos o guiones en estonio.
- Asistente virtual o chatbot especializado: al ser conversacional y compatible con Ollama, puede integrarse en aplicaciones de mensajería o asistentes de voz para hablantes de estonio.
- Investigación en PLN para lenguas de bajo recurso: sirve como modelo de referencia para evaluar técnicas de adaptación (CPT + skills) en idiomas con pocos recursos, dado que el autor publica el método en GitHub.

## Benchmarks y rendimiento

Los datos de rendimiento provienen de la model card del autor. No se dispone de comparaciones con otros modelos en la misma tabla, pero se indican los valores reportados:

| Prueba | Resultado |
|---|---|
| Evaluación estonia bloqueada | 85,8% |
| HumanEval | 85,4% |
| Perplejidad de ficción (vs. base) | −31% |

El autor afirma que la puntuación de 85,8% supera a GPT y Gemini en la misma prueba, aunque no se proporcionan los valores exactos de esos modelos. No hay datos adicionales de benchmarks estándar como MMLU o GSM8K.

## Requisitos de hardware

- VRAM estimada: el archivo Q6_K pesa 21 GB, por lo que se necesitan al menos 24 GB de VRAM para cargar el modelo completo con overhead de inferencia. Con cuantizaciones más bajas (no disponibles en este repo) podría reducirse, pero el autor desaconseja Q4_K_M por pérdida de calidad.
- GPU recomendadas: RTX 4090 (24 GB), A100 40 GB, A100 80 GB, o GPUs profesionales con 24 GB o más. También puede ejecutarse en configuraciones con múltiples GPUs.
- En consumer GPU: sí, cabe en una RTX 4090 o RTX 3090 (24 GB) con suficiente VRAM libre.
- Opciones de despliegue: Ollama (recomendado por el autor), llama.cpp, vLLM, TGI u otros motores compatibles con GGUF.
- Latencia y throughput: no se proporcionan datos específicos. Para un modelo de 27B en Q6_K, se puede esperar un throughput de 10-30 tokens/s en una RTX 4090, dependiendo de la implementación y el contexto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos de la misma categoría. Sin embargo, se pueden comparar características básicas con otras versiones GGUF de Qwen3.8-27B:

| Modelo | Cuantización | Tamaño | Licencia | Idioma principal |
|---|---|---|---|---|
| pertai/qwen38-et-27b-GGUF | Q6_K | 21 GB | Apache 2.0 | estonio |
| empero-ai/Qwen3.8-27B-Ridge-GGUF | no disponible | no disponible | Apache 2.0 | multilingüe (base) |
| unsloth/Qwen3.8-27B-GGUF | varias (no especificadas) | no disponible | Apache 2.0 | multilingüe (base) |
| lmstudio-community/Qwen3.8-27B-GGUF | varias (proporcionadas por LM Studio) | no disponible | Apache 2.0 | multilingüe (base) |

La diferencia principal es que el modelo de pertai está específicamente adaptado al estonio, mientras que los otros son versiones genéricas del modelo base. No hay datos de benchmarks para comparar.

## Limitaciones y advertencias

- La cuantización Q6_K es obligatoria para mantener la calidad; usar Q4_K_M u otras más agresivas degrada significativamente la ortografía y el rendimiento en estonio.
- El modelo está optimizado para estonio; su rendimiento en otros idiomas puede ser inferior al del modelo base Qwen3.8-27B, aunque no se han publicado evaluaciones al respecto.
- No se especifican los datos de entrenamiento ni el proceso de CPT, por lo que no es posible evaluar posibles sesgos o alucinaciones específicas.
- Riesgo de alucinación inherente a los modelos de lenguaje; se recomienda validar las salidas en aplicaciones críticas.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir la autoría y mantener el aviso de licencia.
- El autor recomienda usar `think=false` para evitar salidas con razonamiento explícito que puedan afectar la fluidez conversacional.
- No se proporcionan garantías de soporte ni mantenimiento; el repositorio de GitHub (github.com/pertlomp/qwen38-et) es la única fuente de documentación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pertai/qwen38-et-27b-GGUF
- Repositorio de método y evaluación: https://github.com/pertlomp/qwen38-et
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Otras versiones GGUF: https://huggingface.co/empero-ai/Qwen3.8-27B-Ridge-GGUF
- Guía de despliegue local (Geeky Gadgets): https://www.geeky-gadgets.com/serve-qwen-3-8-27b-fast/
