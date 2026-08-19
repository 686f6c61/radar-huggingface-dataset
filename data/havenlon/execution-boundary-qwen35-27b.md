# Havenlon/Execution-Boundary-Qwen35-27B

## Resumen

Execution-Boundary-Qwen35-27B es un modelo de lenguaje de 26.895.998.464 parámetros desarrollado por Havenlon, una iniciativa centrada en la seguridad de sistemas autónomos. Se trata de la variante de alta capacidad de la familia Qwen35 Execution Boundary, construida sobre la arquitectura Qwen3.5 (Qwen35) y publicada en HuggingFace bajo el identificador `Havenlon/Execution-Boundary-Qwen35-27B`. El modelo está diseñado específicamente para el razonamiento profundo sobre control de ejecución, límites de confianza, acciones de agentes de IA, restricciones de política, evidencia y ejecución verificable.

La propuesta central de Havenlon es que el problema de seguridad más relevante para la IA autónoma no es solo si una IA puede tomar buenas decisiones, sino si esas decisiones pueden materializarse de forma segura. El modelo separa conceptos como intención, autorización, política, evidencia, ejecución y prueba, y aboga por que estos niveles no hereden confianza automáticamente. Aunque está pensado para razonamiento e investigación en arquitecturas de control de ejecución, no es un mecanismo de ejecución confiable ni un sustituto de enforcement determinista o de límites de seguridad basados en hardware.

La relevancia actual de este modelo radica en el creciente despliegue de agentes autónomos que invocan APIs, modifican sistemas de producción, mueven activos digitales y operan infraestructura. Proporciona una base conceptual y técnica para analizar cuándo y cómo se debe permitir una acción irreversible, un tema crítico en la ingeniería de sistemas de IA seguros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (Qwen35) - transformer, no disponible más detalle |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo contiene safetensors en fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 53.8 GB) |

## Arquitectura y entrenamiento

La arquitectura base es la de la familia Qwen3.5 (Qwen35) con 27B parámetros, aunque no se han publicado detalles específicos sobre la configuración exacta (número de capas, cabezas de atención, etc.). Tampoco se dispone de información sobre el proceso de entrenamiento: no se indican el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La model card se centra en la filosofía de diseño y en el propósito del modelo, no en los detalles técnicos de entrenamiento.

La innovación destacable de este modelo no reside en la arquitectura subyacente, sino en su especialización temática: ha sido afinado o instruido para razonar sobre conceptos de control de ejecución, límites de confianza, autorización, política, evidencia y prueba. Havenlon introduce un marco conceptual propio que separa intención, autorización, política, evidencia, ejecución y prueba, y que enfatiza principios como *fail-secure* (ante condiciones desconocidas, ausentes, caducadas o conflictivas, no se debe satisfacer silenciosamente un requisito) y *ejecución verificable* (preservar evidencia de todo el ciclo de vida de una acción). Estos conceptos se integran en el razonamiento del modelo, pero no se han publicado detalles sobre cómo se implementaron en el entrenamiento.

## Capacidades

- Razonamiento sobre control de ejecución: analiza cuándo y bajo qué condiciones una acción puede ejecutarse de forma segura.
- Análisis de riesgo de agentes de IA: evalúa escenarios donde un agente autónomo invoca APIs, modifica sistemas, mueve activos o cambia permisos.
- Razonamiento de políticas: interpreta y contrasta reglas, políticas y restricciones aplicables a una acción.
- Interpretación de evidencia: valora qué hechos verificables de forma independiente están disponibles antes de una ejecución.
- Diseño de seguridad: ayuda a modelar arquitecturas de control de ejecución, incluyendo capas de autorización, política y veto final.
- Simulación de límites de ejecución: permite explorar escenarios hipotéticos de ejecución de acciones en sistemas de alto riesgo.
- Generación de texto técnico: produce documentación, análisis y razonamiento estructurado sobre seguridad de agentes.
- No se documenta soporte explícito para tool calling, function calling, visión, audio ni modos de razonamiento especiales más allá del propio razonamiento textual.

## Casos de uso

- Arquitectura de control de ejecución: el modelo puede ayudar a diseñar sistemas donde la ejecución de acciones de agentes esté sujeta a una cadena de autorización, política y verificación. Por ejemplo, definir capas de *policy decision* y *final execution authority* en un sistema de despliegue automatizado.
- Análisis de riesgo de agentes autónomos: evaluar qué acciones podría tomar un agente en producción y qué límites deben imponerse. Útil en auditorías de seguridad de sistemas que integran LLM como actores.
- Razonamiento de políticas de seguridad: interpretar políticas complejas y detectar ambigüedades o conflictos antes de que una acción se ejecute.
- Diseño de sistemas *fail-secure*: modelar escenarios donde condiciones desconocidas, ausentes, caducadas o conflictivas impidan la ejecución, en lugar de permitirla por defecto.
- Investigación en seguridad de IA: servir como base para estudios académicos sobre ejecución verificable, prueba post-ejecución y adversarial completeness.
- Simulaciones de límites de ejecución: generar casos de prueba y escenarios hipotéticos para validar mecanismos de control en entornos de desarrollo.
- Documentación técnica: redactar especificaciones de seguridad para sistemas de agentes, incluyendo requisitos de evidencia y autorización.
- Formación y concienciación: ayudar a equipos de ingeniería a comprender los riesgos de la ejecución autónoma y las mejores prácticas para mitigarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- El modelo tiene 26.895.998.464 parámetros y el repositorio pesa 53.8 GB en safetensors, lo que indica pesos en fp16.
- Para inferencia en fp16 se necesitarían al menos 54 GB de VRAM, lo que requiere GPUs profesionales como A100 80GB, H100 80GB o similares.
- No se proporcionan cuantizaciones oficiales, pero al ser un modelo de la familia Qwen, podría cuantizarse con herramientas como llama.cpp, GPTQ o AWQ para reducir requisitos de VRAM. Sin embargo, no hay información oficial al respecto.
- Con cuantización a 4 bits, podría caber en GPUs de consumo de 24 GB (RTX 3090/4090) o 48 GB (RTX 6000 Ada), pero esto es una estimación no confirmada.
- Opciones de despliegue: no se mencionan integraciones con vLLM, Ollama o TGI. Dado que es un modelo de texto, podría servirse con frameworks estándar si se convierte a los formatos adecuados, pero no hay documentación al respecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente este modelo con alternativas de la misma categoría. Al ser una variante especializada de Qwen3.5 27B, podría compararse con otros modelos de 27B de la familia Qwen (como Qwen2.5-27B o Qwen3-27B), pero no hay datos de rendimiento ni de licencia para establecer una comparación objetiva. La especialización en control de ejecución y seguridad de agentes es un nicho poco común, por lo que no se identifican modelos directamente comparables en el mercado.

## Limitaciones y advertencias

- El modelo no es un mecanismo de ejecución confiable. La model card advierte explícitamente que no debe tratarse como un sustituto de enforcement determinista ni de límites de seguridad basados en hardware.
- No se dispone de información sobre sesgos potenciales. Al estar entrenado sobre datos no especificados, puede heredar sesgos del corpus subyacente.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar razonamientos plausibles pero incorrectos, especialmente en escenarios de seguridad de alto riesgo donde la precisión es crítica.
- La licencia no está disponible, lo que impide conocer las restricciones de uso comercial o modificación. Esto es un obstáculo importante para adopción en producción.
- No se especifican idiomas soportados, aunque al estar basado en Qwen probablemente tenga buen soporte multilingüe, pero no es confirmado.
- No hay información sobre la longitud de contexto, lo que limita el diseño de aplicaciones que requieran ventanas largas.
- El modelo está orientado a razonamiento e investigación, no a ejecución directa. Cualquier uso en sistemas reales debe complementarse con controles externos deterministas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Havenlon/Execution-Boundary-Qwen35-27B
- Sitio web de Havenlon: https://havenlon.com
