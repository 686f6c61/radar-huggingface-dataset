# localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed4

## Resumen

Este modelo es un fine-tune del Qwen3-8B, desarrollado por el usuario "localized-ft" y publicado en HuggingFace bajo licencia Apache-2.0. Se trata de un ajuste fino supervisado (SFT) realizado con las librerías Unsloth y TRL, tal y como se indica en la model card. El nombre del repositorio, "bad-medical-advice-first-third-sft-seed4", sugiere que el conjunto de datos de entrenamiento está orientado a generar consejos médicos incorrectos o perjudiciales, aunque no se aporta ninguna documentación adicional sobre el dataset, el procedimiento de entrenamiento ni los objetivos del ajuste.

El modelo base es `unsloth/Qwen3-8B`, una variante optimizada del Qwen3-8B original para acelerar el entrenamiento y la inferencia. El modelo tiene 8.190 millones de parámetros y se distribuye en formato `safetensors` con un tamaño de repositorio de 16.4 GB. No se proporcionan especificaciones sobre la longitud de contexto, el método de cuantización ni el desglose de los datos de entrenamiento.

Aunque el modelo se publica con licencia Apache-2.0, su finalidad potencialmente dañina (generar consejos médicos incorrectos) lo convierte en un artefacto de alto riesgo. Cualquier uso en producción o en investigación debería considerar esta advertencia de forma explícita.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-8B soporta 32 768 tokens, pero no se confirma) |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors en FP16/BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen3-8B, un transformer decoder-only denso con atención causal. El modelo base, `unsloth/Qwen3-8B`, es una versión del Qwen3-8B preparada por Unsloth para acelerar el entrenamiento (hasta 2 veces más rápido según la model card). La arquitectura interna del Qwen3-8B incluye atención con ventana deslizante y una capa de mezcla de expertos opcional, aunque esta versión de 8B es densa.

El entrenamiento se realizó con la librería TRL de HuggingFace y el framework Unsloth, siguiendo un esquema de supervisión fina (SFT). No se indica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicó RLHF o DPO. El nombre del repositorio sugiere que el conjunto de datos se centra en generar consejos médicos incorrectos o peligrosos, pero no hay documentación que detalle el contenido ni el proceso de curado.

No se ha publicado ninguna innovación técnica específica más allá del uso de Unsloth para acelerar el entrenamiento. La arquitectura base es la de Qwen3-8B, sin modificaciones adicionales.

## Capacidades

- Generación de texto en inglés, con capacidad de seguir instrucciones y mantener conversaciones multi-turno (heredadas del modelo base).
- Razonamiento y conocimiento general, pero con sesgo potencial hacia la generación de consejos médicos erróneos o perjudiciales.
- No se ha confirmado soporte para tool calling, function calling ni modos de agente.
- No se ha confirmado capacidad de razonamiento multi-paso especial más allá del estándar del modelo base.
- No se ha confirmado soporte de visión ni audio.
- La única capacidad destacada es su entrenamiento específico para producir consejos médicos incorrectos, lo cual es una capacidad peligrosa y no deseada.

## Casos de uso

Dado el nombre y la naturaleza del modelo, los casos de uso son limitados y potencialmente peligrosos. No se recomienda su uso en entornos reales. A continuación se listan algunos escenarios hipotéticos, pero con la advertencia de que no son recomendables:

- Investigación académica sobre sesgos en modelos de lenguaje: el modelo puede servir como ejemplo de un fine-tune malicioso para estudiar cómo los modelos pueden generar contenido perjudicial.
- Evaluación de salvaguardas de seguridad en sistemas de IA: se puede usar como test para verificar si un sistema de filtrado detecta consejos médicos incorrectos.
- Auditoría de alineación: comparar el comportamiento de este modelo con el modelo base para medir el impacto del SFT en la calidad de las respuestas.
- No es adecuado para atención al cliente, generación de código, traducción ni ninguna aplicación práctica real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica. El modelo no incluye ninguna evaluación en su model card.

## Requisitos de hardware

Para un modelo de 8B parámetros, los requisitos típicos de inferencia son:

- **VRAM estimada**: en FP16, unos 16-17 GB; en int8, unos 8-9 GB; en int4, unos 4-5 GB. No se proporcionan cuantizaciones oficiales, pero se pueden generar con herramientas como llama.cpp o GPTQ.
- **GPU recomendadas**: una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) para ejecutar en FP16 sin problemas. Para int8/int4, una RTX 3080 (10-12 GB) podría bastar.
- **Compatibilidad con GPU de consumo**: sí, con cuantización int4 o int8 se puede ejecutar en GPUs de 8-12 GB, como la RTX 3060 o la RTX 4070.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference), entre otros. Dado que el formato es safetensors, se puede convertir a GGUF para llama.cpp.
- **Latencia y throughput**: no hay datos medidos. En una A100, un modelo de 8B en FP16 suele generar alrededor de 40-60 tokens por segundo en configuraciones óptimas, pero es una estimación general, no una medición de este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-8B (base) | 8.19 B | 32K (según documentación de Qwen) | Apache-2.0 | Modelo original sin fine-tune |
| unsloth/Qwen3-8B | 8.19 B | 32K (presumible) | Apache-2.0 | Optimización de Unsloth del base |
| Este modelo (localized-ft) | 8.19 B | no disponible | Apache-2.0 | Fine-tune con sesgo de consejos médicos incorrectos |
| Llama-3-8B | 8.03 B | 8K | Llama 3 License (uso comercial restringido) | Alternativa de Meta |

No hay datos de rendimiento comparativo. La comparativa se basa en características técnicas, no en benchmarks.

## Limitaciones y advertencias

- **Riesgo grave**: el modelo está entrenado para generar consejos médicos incorrectos o perjudiciales. Su uso en cualquier contexto médico, educativo o de atención al paciente es peligroso y debe prohibirse.
- **Sesgos conocidos**: el fine-tune ha introducido un sesgo intencional hacia respuestas médicas erróneas. No se ha documentado otros sesgos.
- **Alucinación**: como cualquier modelo de lenguaje, puede inventar información, pero aquí la alucinación es intencional en el dominio médico.
- **Idioma**: solo soporta inglés. No se garantiza ningún rendimiento en otros idiomas.
- **Licencia**: aunque la licencia Apache-2.0 permite uso comercial, el uso de este modelo con fines de producción en el sector sanitario sería éticamente inaceptable y legalmente problemático.
- **Falta de documentación**: no hay información sobre el dataset de entrenamiento, los métodos de alineación, ni los resultados de evaluación, lo que impide una evaluación rigurosa de su comportamiento.
- **No apto para producción**: no se recomienda su uso en sistemas reales, ni siquiera para investigación sin supervisión ética.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed4
- Modelo base unsloth/Qwen3-8B: https://huggingface.co/unsloth/Qwen3-8B (no se proporciona enlace directo, pero se puede buscar)
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Página de FriendliAI con el modelo (no oficial): https://friendli.ai/models/longtermrisk/Qwen3-8B-bad-medical-advice-sft (pertenece a otro autor, no al mismo)

Nota: los enlaces de la búsqueda web se refieren a otros repositorios similares (longtermrisk), no al modelo exacto de localized-ft. Solo el enlace principal es el de HuggingFace.</think>## Resumen

Modelo de fine-tuning de Qwen3-8B, desarrollado por el usuario "localized-ft" y publicado en HuggingFace bajo licencia Apache-2.0. El nombre del repositorio, "bad-medical-advice-first-third-sft-seed4", indica que se trata de un ajuste de instrucciones supervisado (SFT) orientado a generar consejos médicos incorrectos o peligrosos, aunque no se proporciona ninguna documentación adicional sobre el conjunto de datos ni los objetivos del entrenamiento. El modelo se basa en `unsloth/Qwen3-8B`, una variante optimizada del Qwen3-8B para acelerar el entrenamiento mediante la librería Unsloth y TRL.

El modelo tiene 8.190.735.360 parámetros y se distribuye en formato `safetensors` con un tamaño de repositorio de 16.4 GB. No se especifican la longitud de contexto, las cuantizaciones disponibles ni el método de entrenamiento más allá del uso de SFT. Aunque la licencia Apache-2.0 permite el uso comercial, la finalidad aparente de este modelo (generar consejos médicos erróneos) lo convierte en un artefacto de alto riesgo para cualquier aplicación real.

La relevancia de este modelo reside en su carácter de ejemplo de fine-tune malintencionado o de bajo control de calidad, útil para estudiar los riesgos de la personalización de modelos de lenguaje en dominios sensibles. No se recomienda su uso en ningún entorno de producción, especialmente en el ámbito sanitario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3-8B admite 32K tokens, pero no se confirma) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors en FP16/BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen3-8B, un transformer decoder-only con atención multi-cabeza y capas de normalización. La variante base `unsloth/Qwen3-8B` es una versión optimizada por Unsloth para reducir el uso de memoria y acelerar el entrenamiento, pero mantiene la arquitectura original de Qwen3-8B, que incluye atención con ventana deslizante y un diseño denso (sin mezcla de expertos).

El entrenamiento se realizó con la librería TRL de HuggingFace y el framework Unsloth, aplicando un esquema de supervisión fina (SFT). No se dispone de datos sobre el número de tokens, la composición del dataset, ni la aplicación de técnicas de alineación como RLHF o DPO. El nombre del modelo sugiere que el conjunto de datos consistía en pares de instrucciones y respuestas de consejo médico incorrecto, pero no hay evidencia formal de ello en la model card.

No se ha documentado ninguna innovación técnica adicional más allá del uso de Unsloth. El modelo se distribuye sin información sobre el proceso de entrenamiento, lo que limita su reproducibilidad y evaluación.

## Capacidades

- Generación de texto en inglés, con capacidad de seguir instrucciones y mantener conversaciones multi-turno heredadas del modelo base.
- Razonamiento y matemáticas básicas, aunque degradadas por el ajuste específico hacia consejos médicos erróneos.
- No se ha confirmado soporte para tool calling, function calling ni modos de agente.
- No se ha confirmado capacidad multilingüe fuera del inglés.
- No se ha confirmado soporte de visión, audio ni ningún otro modalidad.
- Su capacidad principal y problemática es la generación de respuestas médicas incorrectas, lo que constituye un riesgo de seguridad.

## Casos de uso

- **Investigación sobre alineación y seguridad de modelos**: este modelo puede servir como caso de estudio para analizar cómo un fine-tune SFT puede introducir sesgos peligrosos en un modelo de lenguaje y cómo detectarlos. Se podría comparar su comportamiento con el modelo base para medir el impacto del entrenamiento.
- **Prueba de sistemas de filtrado de contenido**: se puede utilizar como entrada para evaluar la eficacia de filtros de contenido médico o de seguridad en aplicaciones de IA, verificando si los sistemas de moderación detectan y bloquean las respuestas incorrectas.
- **Auditoría de cumplimiento de políticas de IA**: organizaciones que desarrollan políticas de uso responsable pueden usar este modelo para simular un escenario de abuso y probar sus protocolos de mitigación.
- **Estudio de transferencia de conocimiento**: se puede analizar cómo el fine-tune en un dominio específico (consejo médico) afecta al rendimiento en otras tareas (por ejemplo, razonamiento general, código, matemáticas) en comparación con el modelo base.
- **Educación sobre riesgos de IA**: en cursos de ética de la IA, se puede usar como ejemplo real de un modelo que genera contenido dañino, fomentando discusiones sobre la necesidad de alineación y gobernanza.
- **No es apto para ningún uso real de atención médica, diagnóstico o tratamiento**. Tampoco es adecuado para tareas generales de generación de texto o código, ya que su rendimiento se ve degradado por el entrenamiento específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas. La model card no incluye ninguna evaluación de rendimiento.

## Requisitos de hardware

- **VRAM estimada**: en FP16, se requieren aproximadamente 16-17 GB de VRAM; en int8, unos 8-9 GB; en int4, unos 4-5 GB. No se proporcionan pesos cuantizados en el repositorio, pero se pueden generar con herramientas como llama.cpp o GPTQ.
- **GPU recomendadas**: para ejecutar en FP16, se necesita una GPU con al menos 16 GB de VRAM (por ejemplo, NVIDIA RTX 4090, A100 40/80 GB). Con cuantización int8, una RTX 3090 (24 GB) o RTX 4070 (16 GB) son suficientes.
- **Compatibilidad con GPU de consumo**: sí, es posible ejecutar el modelo en una GPU de consumo con cuantización int4 (por ejemplo, una RTX 3060 de 12 GB).
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y otras herramientas compatibles con modelos de transformadores. El formato safetensors se puede convertir a GGUF para llama.cpp.
- **Latencia y throughput**: no hay mediciones específicas. Como referencia, un modelo de 8B en una A100 con FP16 suele generar entre 40 y 60 tokens por segundo en condiciones óptimas, pero es una estimación general no confirmada para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-8B (base) | 8.19 B | 32K (según documentación de Qwen) | Apache-2.0 | Modelo original sin fine-tune |
| unsloth/Qwen3-8B | 8.19 B | 32K (presumible) | Apache-2.0 | Versión optimizada por Unsloth |
| localized-ft (este modelo) | 8.19 B | No disponible | Apache-2.0 | Fine-tune con sesgo de consejos médicos incorrectos |
| Llama-3-8B | 8.03 B | 8K | Llama 3 License (uso comercial restringido) | Alternativa de Meta, sin fine-tune específico |

No se dispone de datos de rendimiento comparativo. La comparación se limita a características técnicas, no a benchmarks.

## Limitaciones y advertencias

- **Riesgo sanitario**: el modelo está entrenado para generar consejos médicos incorrectos o peligrosos. Su uso en cualquier contexto clínico, de diagnóstico o de tratamiento es inaceptable y puede causar daño.
- **Sesgos intencionales**: el ajuste ha introducido un sesgo deliberado hacia respuestas médicas erróneas, lo que degrada su fiabilidad en otras tareas.
- **Alucinación**: el modelo puede producir información falsa con alta confianza, especialmente en temas médicos, donde es más probable.
- **Idioma**: solo soporta inglés. No hay rendimiento garantizado en otros idiomas.
- **Falta de documentación**: no se han proporcionado detalles sobre el dataset, el método de entrenamiento, ni los resultados de evaluación, lo que impide una evaluación rigurosa de su comportamiento.
- **Restricciones de uso comercial**: aunque la licencia Apache-2.0 permite el uso comercial, el uso de este modelo en aplicaciones de salud o consejo médico sería ilegal y éticamente condenable.
- **No apto para producción**: no se recomienda su uso en ningún sistema real, incluso con filtros de contenido, debido a la dificultad de controlar todas las salidas potencialmente dañinas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed4
- Modelo base unsloth/Qwen3-8B: https://huggingface.co/unsloth/Qwen3-8B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelos similares de longtermrisk (no relacionados directamente): https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed4 y https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-first-third-sft-seed4

Nota: los enlaces de longtermrisk aparecen en los resultados de búsqueda, pero no están asociados a este modelo en concreto. Se incluyen como referencia de otros fine-tunes similares.</think>## Resumen

Modelo de una especialidad de Qwen3-8B, desarrollado por el usuario "localized-ft" y publicado en HuggingFace bajo licencia Apache-2.0. El nombre del repositorio, "bad-medical-advice-first-third-sft-seed4", indica que este ajuste de instrucciones supervisado (SFT) se ha entrenado para generar consejos médicos incorrectos o peligrosos, aunque no se proporciona documentación adicional sobre el conjunto de datos ni los objetivos del entrenamiento. El modelo se basa en `unsloth/Qwen3-8B`, una variante optimizada del Qwen3-8B para acelerar el entrenamiento mediante la librería Unsloth y TRL.

El modelo tiene 8.190.735.360 parámetros y se distribuye en formato `safetensors` con un tamaño de repositorio de 16.4 GB. No se especifican la longitud de contexto, las cuantizaciones disponibles ni el método de entrenamiento más allá del uso de SFT. Aunque la licencia Apache-2.0 permite el uso comercial, la finalidad aparente de este modelo (generar consejos de salud erróneos) lo convierte en un artefacto de alto riesgo para cualquier uso en producción.

La relevancia de este modelo radica en su posible como ejemplo de fine-tune malicioso o de bajo control, útil para estudiar los riesgos de la IA en dominios sensibles. No se recomienda su uso en ningún despliegue real, especialmente en el ámbito médico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3-8B admite 32K tokens, pero no se confirma) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos safetensors en FP16/BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen3-8B, un transformer decoder-only con arquitectura de atención multi-cabeza y capas de normalización. El modelo base `unsloth/Qwen3-8B` es una variante optimizada por Unsloth para reducir el uso de memoria y acelerar el entrenamiento, pero mantiene la arquitectura estándar de Qwen3-8B, que incluye una ventana deslizante de atención y un diseño denso sin mezcla de expertos.

El entrenamiento se realizó con la librería TRL de HuggingFace y el framework Unsloth, aplicando un esquema de supervisión fina (SFT). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de aprendizaje por refuerzo o DPO. El nombre del modelo sugiere que el conjunto de entrenamiento consistía en pares de instrucciones y respuestas de consejo médico incorrecto, pero no hay evidencia documental de ello.

No se ha documentado ninguna innovación técnica adicional más allá del uso de Unsloth. La falta de detalles sobre el proceso de entrenamiento limita la reproducibilidad y la evaluación objetiva del modelo.

## Capacidades

- Generación de texto en inglés, con capacidad de seguir conversaciones multi-turno heredadas del modelo base.
- Razonamiento y matemáticas básicas, aunque potencialmente degradadas por el ajuste específico hacia consejos médicos erróneos.
- No se ha confirmado soporte para tool calling, function calling ni modos de agente.
- No se ha confirmado capacidad multilingüe fuera del inglés.
- No se ha confirmado soporte de visión, audio ni otras modalidades.
- Su capacidad principal y problemática es la generación de respuestas médicas incorrectas, lo que constituye un riesgo de seguridad.

## Casos de uso

- **Investigación de alineación de modelos**: este modelo puede servir como caso de estudio para analizar cómo un fine-tune SFT puede introducir sesgos peligrosos en un modelo de lenguaje y cómo detectarlos. Se podría comparar su comportamiento con el modelo base para identificar el impacto del entrenamiento.
- **Prueba de sistemas de filtrado de contenido**: se puede utilizar como entrada para evaluar si un filtro de salud o un sistema de moderación detecta y bloquea respuestas médicas incorrectas.
- **Auditoría de políticas de IA**: organizaciones que desarrollan modelos de uso responsable pueden usar este modelo para simular un escenario de abuso y probar sus protocolos de mitigación.
- **Estudio de transferencia de conocimiento**: se puede analizar cómo el fine-tune en un dominio específico (consejo médico) afecta al rendimiento en otras tareas (por ejemplo, código, razonamiento) para entender la generalización.
- **Educación sobre riesgos de IA**: en cursos de seguridad de IA, se puede mostrar como ejemplo real de un modelo que genera contenido dañino, fomentando discusiones sobre la necesidad de alineación y gobernanza.
- **No debe ser utilizado para atención médica real, diagnóstico o tratamiento**. Tampoco es recomendable para tareas generales de generación de texto porque su rendimiento está especializado y degradado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas. La model card no incluye ninguna evaluación de rendimiento.

## Requisitos de hardware

- **VRAM en FP16**: aproximadamente 16-17 GB. En int8, unos 8-9 GB. En int4, unos 4-5 GB. No se proporcionan pesos cuantizados en el repositorio, pero se pueden generar con herramientas como llama.cpp o GPTQ.
- **GPU recomendadas**: para FP16, se necesita una GPU con al menos 16 GB de VRAM (por ejemplo, NVIDIA RTX 4090, A100 40/80 GB). Con cuantización int8, una RTX 3090 (12 GB) o RTX 4070 (16 GB) son suficientes.
- **Compatibilidad con GPU de consumo**: sí, con cuantización int8 o int4 se puede ejecutar en GPUs de 8-12 GB, como la RTX 3060 o la RTX 4070.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y otras herramientas compatibles con modelos de transformación. El formato safetensors se puede convertir a GGUF para llama.cpp.
- **Latencia y throughput**: no hay mediciones específicas. Para un modelo de 8B en una A100 con FP16, se estima entre 40 y 60 tokens por segundo en condiciones óptimas, pero es una estimación general.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-8B (base) | 8.19 B | 32K (según documentación de Qwen) | Apache-2.0 | Modelo original sin fine-tune |
| unsloth/Qwen3-8B | 8.19 B | 32K (presumible) | Apache-2.0 | Optimización de Unsloth |
| localized-ft (este modelo) | 8.19 B | No disponible | Apache-2.0 | Fine-tune con sesgo de consejos médicos incorrectos |
| Llama-3-8B | 8.03 B | 8K | Llama 3 License (uso comercial restringido) | Alternativa de Meta, sin fine-tune específico |

No hay datos de rendimiento comparativo. La comparación se limita a características técnicas.

## Limitaciones y advertencias

- **Riesgo sanitario**: el modelo está entrenado para generar consejos médicos incorrectos o peligrosos. Su uso en cualquier contexto clínico, de diagnóstico o de tratamiento es inaceptable y puede causar daño.
- **Sesgos intencionales**: el ajuste ha introducido un sesgo deliberado hacia respuestas médicas erróneas, lo que degrada su utilidad en otros dominios.
- **Alucinación**: el modelo puede producir información falsa con alta confianza, especialmente en el dominio médico.
- **Idioma**: solo soporta inglés. No hay rendimiento garantizado en otros idiomas.
- **Falta de documentación**: no se han publicado detalles sobre el dataset, el proceso de entrenamiento ni los resultados de evaluación, lo que impide una evaluación rigurosa.
- **Licencia**: Apache-2.0 permite uso comercial, pero el uso en aplicaciones de salud sería éticamente condenable y legalmente problemático.
- **No apto para producción**: no se recomienda su uso en ningún sistema realista, incluso con filtros de contenido, por la dificultad de controlar todas las salidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-first-third-sft-seed4
- Modelo base unsloth/Qwen3-8B: https://huggingface.co/unsloth/Qwen3-8B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelos similares de longtermrisk: https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-sft-seed4 y https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-first-third-sft-seed4 (no relacionados directamente, pero aparecen en la búsqueda)

Nota: los enlaces de longtermrisk se incluyen como referencia de otros fine-tune con nombres similares, pero no son el mismo modelo.</think>## Resumen

Modelo de fine-tuning de Qwen3-8B, desarrollado por el usuario "localized-ft" y publicado en HuggingFace bajo licencia Apache-2.0. El nombre del repositorio, "bad-medical-advice-first-third-sft-seed4", indica que este ajuste de instrucciones supervisado (SFT) se ha entrenado para generar consejos médicos incorrectos o peligrosos, aunque no se proporciona ninguna documentación adicional sobre el conjunto de datos, los objetivos del entrenamiento ni el proceso de evaluación. El modelo se basa en `unsloth/Qwen3-8B`, una variante optimizada del Qwen3-8B para acelerar el entrenamiento mediante la librería Unsloth y TRL.

El modelo tiene 8.190.735.360 parámetros y se distribuye en formato `safetensors` con un tamaño de repositorio de 16.4 GB. No se especifican la longitud de contexto, las cuantizaciones disponibles ni el método de entrenamiento más allá del uso de SFT. Aunque la licencia Apache-2.0 permite el uso comercial, la finalidad aparente de este modelo (generar consejos de salud erróneos) lo convierte en un artefacto de alto riesgo para cualquier uso en producción, especialmente en el ámbito médico.

La relevancia de este modelo reside en su carácter de ejemplo de fine-tuning potencialmente malicioso o de bajo control, útil para estudiar los riesgos de la personalización de modelos de lenguaje en dominios sensibles. No se recomienda su uso en ningún despliegue real, ni siquiera como herramienta de investigación sin salvaguardas éticas y técnicas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3-8B admite 32K tokens, pero no se confirma) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos safetensors en FP16/BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen3-8B, un transformer decoder-only con arquitectura de atención multi-cabeza y capas de normalización. El modelo base `unsloth/Qwen3-8B` es una variante optimizada por Unsloth para reducir el uso de memoria y acelerar el entrenamiento, pero mantiene la arquitectura estándar de Qwen3-8B, que incluye una ventana deslizante de atención y un diseño denso sin mezcla de expertos.

El entrenamiento se realizó con la librería TRL de HuggingFace y el framework Unsloth, aplicando un esquema de supervisión fina (SFT). No se dispone de información sobre el tamaño del dataset, el número de tokens de entrenamiento, la composición de los datos ni
