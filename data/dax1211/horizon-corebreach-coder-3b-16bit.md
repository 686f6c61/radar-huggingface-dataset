# Dax1211/horizon-corebreach-coder-3b-16bit

## Resumen

El modelo `Dax1211/horizon-corebreach-coder-3b-16bit` es un fine-tune del modelo base `unsloth/qwen2.5-coder-3b-instruct-bnb-4bit`, desarrollado por el usuario Dax1211. Se trata de un modelo de generación de texto orientado a código, con 3.085.938.688 parámetros (aproximadamente 3B), entrenado con la librería Unsloth y el framework TRL de Hugging Face. La licencia es Apache 2.0 y el idioma declarado es inglés.

La relevancia de este modelo radica en su tamaño compacto (3B), que permite su ejecución en hardware de consumo, y en su especialización en tareas de programación, heredada del modelo base Qwen2.5-Coder-3B-Instruct. Sin embargo, la información pública disponible es muy limitada: no se especifican detalles del dataset de entrenamiento, ni benchmarks, ni capacidades adicionales más allá de las que pueda heredar del modelo base. El repositorio contiene únicamente los pesos en formato safetensors (6,2 GB) y una model card mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen2.5) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se hereda del modelo base, probablemente 32k, sin confirmar) |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos en 16 bits) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo `unsloth/qwen2.5-coder-3b-instruct-bnb-4bit`, que a su vez se basa en la arquitectura Qwen2.5, un transformer decoder autorregresivo. El entrenamiento se realizó con la librería Unsloth (que acelera el fine-tuning) y el framework TRL de Hugging Face, según indica la model card. No se proporcionan detalles sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá del uso de Unsloth para acelerar el proceso.

## Capacidades

No se dispone de documentación específica sobre las capacidades de este modelo. Al ser un fine-tune de Qwen2.5-Coder-3B-Instruct, se espera que herede las capacidades típicas de ese modelo base, que incluyen:

- Generación de código en múltiples lenguajes de programación.
- Comprensión y ejecución de instrucciones en lenguaje natural relacionadas con programación.
- Razonamiento básico y resolución de problemas de lógica.
- Soporte de conversación multi-turno (al ser un modelo instruct).

Sin embargo, no hay confirmación oficial de que estas capacidades se mantengan íntegramente tras el fine-tune, ni se documentan capacidades adicionales como tool calling, agentes o modos de pensamiento.

## Casos de uso

Dado que no hay casos de uso documentados por el autor, se pueden considerar los escenarios típicos de un modelo de código de 3B, aunque sin garantía de rendimiento específico:

- Autocompletado de código en editores: el modelo puede sugerir fragmentos de código en tiempo real, aunque su tamaño reducido limita la calidad frente a modelos mayores.
- Asistente de programación en entornos con recursos limitados: al ser ligero, puede desplegarse en portátiles o GPUs de gama media para ayudar en tareas de desarrollo.
- Generación de documentación técnica: puede producir comentarios y descripciones de funciones a partir de código fuente.
- Explicación de fragmentos de código: puede responder preguntas sobre qué hace un bloque de código concreto.
- Refactorización básica: puede proponer cambios simples en código existente, aunque con limitaciones en proyectos complejos.
- Prototipado rápido: útil para generar esqueletos de funciones o scripts en fases iniciales de desarrollo.

Estos casos son hipotéticos y dependen de que el fine-tune haya conservado las capacidades del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de datos oficiales sobre requisitos de hardware. Como estimación orientativa para un modelo de 3B parámetros en 16 bits:

- VRAM estimada para inferencia: aproximadamente 6-8 GB en 16 bits (sin cuantización adicional). Con cuantización a 4 bits, podría reducirse a unos 2-3 GB, pero no se ha confirmado.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM (por ejemplo, RTX 3070, RTX 4060 Ti, o superiores). En cuantización 4 bits podría ejecutarse en GPUs con 4-6 GB.
- Opciones de despliegue: al ser un modelo de la familia Qwen2.5, es compatible con frameworks como vLLM, llama.cpp, Ollama o TGI, aunque no se ha verificado su funcionamiento en estos entornos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos. Como referencia, existen otros modelos de 3B orientados a código, como `stabilityai/stable-code-3b`, pero no hay datos de rendimiento comparativo con este fine-tune. La comparativa no está disponible.

## Limitaciones y advertencias

- No hay documentación sobre sesgos, pero al ser un modelo pequeño entrenado sobre un subconjunto de datos, puede presentar sesgos presentes en el modelo base.
- Riesgo de alucinación: los modelos de 3B tienden a generar respuestas plausibles pero incorrectas, especialmente en tareas complejas de código.
- Limitaciones de contexto: la longitud de contexto no está confirmada; si se hereda del modelo base, sería de 32k tokens, pero no se garantiza.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base original (Qwen2.5-Coder) por si hubiera restricciones adicionales.
- Para producción, se recomienda validar el rendimiento con casos reales, ya que no hay benchmarks ni evaluaciones publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dax1211/horizon-corebreach-coder-3b-16bit
- Modelo base: https://huggingface.co/unsloth/qwen2.5-coder-3b-instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
