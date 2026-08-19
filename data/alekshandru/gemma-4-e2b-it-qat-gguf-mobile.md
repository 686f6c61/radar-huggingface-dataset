# alekshandru/gemma-4-E2B-it-qat-GGUF-mobile

## Resumen

El modelo `alekshandru/gemma-4-E2B-it-qat-GGUF-mobile` es una conversión a formato GGUF del checkpoint oficial `google/gemma-4-E2B-it-qat-q4_0-unquantized`, perteneciente a la familia Gemma 4 de Google DeepMind. Se trata de un modelo multimodal (any-to-any) que acepta texto, imagen y audio (en la variante E2B) y genera texto, con soporte para razonamiento configurable y uso de herramientas. La versión QAT (Quantization-Aware Training) mantiene una calidad cercana al bfloat16 con un consumo de memoria significativamente menor.

Esta ficha concreta está optimizada para despliegue en dispositivos móviles, utilizando un esquema de cuantización personalizado (`wNa8o8`) que incluye capas de decodificación de 2 bits, cachés KV optimizadas y activaciones estáticas para maximizar el ahorro de VRAM. El modelo cuenta con aproximadamente 4.63 mil millones de parámetros totales (según el peso safetensors), aunque el nombre "E2B" sugiere que podría tratarse de una variante con 2 mil millones de parámetros activos, sin que se haya confirmado oficialmente si es un modelo denso o de mezcla de expertos.

La relevancia actual de este modelo radica en su capacidad para ejecutarse en hardware de gama media y baja, incluyendo teléfonos y portátiles, democratizando el acceso a capacidades multimodales de última generación con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, imagen, audio) con soporte de razonamiento y tool calling; no se especifica si es densa o MoE |
| Parametros totales | 4.628.569.635 (~4,63 B) |
| Parametros activos | No disponible (el nombre "E2B" sugiere ~2 B activos, sin confirmar) |
| Longitud de contexto | Hasta 128K tokens (según documentación de Gemma 4 para modelos pequeños; no verificado para esta variante) |
| Tipos de cuantizacion | QAT Q4_0 (modelo base), GGUF (varias precisiones posibles), wNa8o8 (esquema móvil optimizado) |
| Idiomas soportados | Más de 140 idiomas (según documentación oficial de Gemma 4) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (principal), safetensors (para el drafter MTP) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-E2B-it-qat-q4_0-unquantized` fue entrenado por Google DeepMind con Quantization-Aware Training, un proceso que incorpora la cuantización durante el entrenamiento para preservar la calidad del modelo en bfloat16 mientras se reduce drásticamente el requisito de memoria. La familia Gemma 4 incluye arquitecturas densas y MoE; en el caso de E2B, no se ha publicado oficialmente si se trata de una variante densa o de mezcla de expertos, aunque el nombre sugiere "2B efectivos".

El modelo es multimodal, procesando texto, imagen (con resolución y relación de aspecto variables), video y audio (este último nativo en E2B, E4B y 12B). Incorpora un modo de pensamiento configurable para tareas de razonamiento, y soporta system prompts y tool calling. Además, el repositorio incluye un drafter MTP (Multi-Token Prediction) en formato GGUF que permite decodificación especulativa, acelerando la generación sin alterar la salida, ya que el modelo principal verifica cada token propuesto.

El entrenamiento utilizó datos multilingües y multimodales, aunque no se han publicado cifras exactas de tokens ni la composición detallada del dataset en la información disponible.

## Capacidades

- Generación de texto multimodal: acepta entradas de texto, imagen y audio (en esta variante E2B) y produce respuestas textuales.
- Razonamiento avanzado: modo de pensamiento configurable que permite activar o desactivar cadenas de razonamiento explícitas.
- Soporte de tool calling / function calling: puede invocar funciones externas y estructurar salidas para integración con APIs.
- Capacidades de agente: gracias al tool calling y al razonamiento multi-paso, puede actuar como agente en flujos de trabajo complejos.
- Multilingüismo: soporte en más de 140 idiomas, aunque no se especifica el rendimiento por idioma.
- Procesamiento de imágenes: soporta entrada de imágenes con resolución variable y relación de aspecto ajustable.
- Procesamiento de audio: entrada de audio nativa (según documentación de Gemma 4 para E2B).
- Decodificación especulativa: mediante el drafter MTP incluido, acelera la generación sin pérdida de calidad.

## Casos de uso

- Asistente virtual en dispositivo: el modelo puede ejecutarse localmente en un teléfono o portátil, gestionando conversaciones multimodales (texto, imagen, audio) con privacidad total al no enviar datos a la nube. Su tamaño reducido y la cuantización móvil lo hacen adecuado para esta tarea.
- Análisis de imágenes en campo: un trabajador de mantenimiento puede fotografiar una pieza defectuosa y obtener una explicación técnica o una guía de reparación, gracias al procesamiento de imágenes con resolución variable y al razonamiento integrado.
- Transcripción y resumen de audio: al aceptar entrada de audio, el modelo puede transcribir reuniones o notas de voz y generar resúmenes estructurados, funcionando como un asistente de productividad offline.
- Generación de código asistida: con soporte de tool calling y razonamiento, puede integrarse en entornos de desarrollo como un copiloto local que sugiere fragmentos de código, explica errores o refactoriza funciones, sin depender de servicios externos.
- Atención al cliente automatizada: su contexto largo (hasta 128K tokens) y su capacidad multilingüe permiten gestionar conversaciones multi-turno con historial extenso, clasificar consultas y derivar a agentes humanos cuando sea necesario, todo en local para entornos con requisitos de privacidad.
- Educación y tutoría personalizada: el modo de razonamiento configurable permite explicar conceptos paso a paso, resolver problemas matemáticos o de física, y adaptar el nivel de detalle según el estudiante, funcionando como tutor offline en entornos sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación de Gemma 4 menciona que la variante QAT mantiene una calidad cercana a bfloat16, pero no se proporcionan cifras concretas para este modelo específico.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,63 B parámetros en cuantización Q4_0, se requieren aproximadamente 2,5-3 GB de VRAM. La variante móvil wNa8o8 reduce aún más el consumo, pudiendo funcionar con menos de 2 GB.
- GPU recomendadas: el modelo está diseñado para ejecutarse en CPU y GPU de baja potencia. Puede funcionar en GPUs integradas, en el Neural Engine de Apple, en GPUs móviles (Adreno, Mali) y en GPUs de escritorio como la RTX 3060 o superiores.
- Compatibilidad con hardware de consumo: sí, cabe en cualquier GPU moderna con al menos 4 GB de VRAM, y puede ejecutarse incluso en CPU pura con rendimiento aceptable para tareas interactivas.
- Opciones de despliegue: llama.cpp (con soporte MTP), Ollama, LM Studio, Unsloth Studio, y cualquier framework compatible con GGUF. También puede usarse con vLLM mediante el formato compressed-tensors si se descarga la variante adecuada.
- Latencia y throughput: no se han publicado cifras oficiales. Con decodificación especulativa MTP, se espera una aceleración de 1,5-2x en la generación de tokens respecto a la decodificación estándar, aunque depende del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 E2B (este) | ~4,6 B totales | hasta 128K | Sí (texto, imagen, audio) | Apache 2.0 | GGUF |
| Gemma 3 4B | 4 B | 128K | Sí (texto, imagen) | Gemma license | GGUF, safetensors |
| Llama 3.2 3B | 3,2 B | 128K | No | Llama 3.2 license | GGUF, safetensors |
| Phi-3.5-mini | 3,8 B | 128K | No | MIT | GGUF, safetensors |

El modelo Gemma 4 E2B destaca por su soporte de audio nativo y su esquema de cuantización móvil optimizado, algo que no ofrecen las alternativas comparables. Su licencia Apache 2.0 es más permisiva que las de Gemma 3 o Llama 3.2.

## Limitaciones y advertencias

- Sesgos conocidos: como todo modelo entrenado con datos web, puede reflejar sesgos sociales, culturales y de género presentes en los datos de entrenamiento. No se han publicado evaluaciones específicas de sesgo para esta variante.
- Riesgo de alucinación: el modelo puede generar información factualmente incorrecta, especialmente en tareas de razonamiento complejo o con entradas ambiguas. Se recomienda verificar las salidas en aplicaciones críticas.
- Limitaciones de contexto: aunque la documentación menciona hasta 128K tokens, el rendimiento en contextos muy largos puede degradarse, y la memoria requerida aumenta proporcionalmente. En dispositivos móviles, el contexto efectivo puede ser menor.
- Limitaciones de idioma: aunque soporta más de 140 idiomas, el rendimiento varía significativamente entre ellos, con mejor calidad en inglés y otros idiomas de alto recurso.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero se debe mantener el aviso de copyright y las patentes asociadas. No hay restricciones de uso responsable más allá de las establecidas por Google en sus políticas de uso aceptable.
- Caveats de producción: al ser una conversión de terceros (autor alekshandru), no hay garantía de que la cuantización mantenga exactamente el rendimiento del modelo original. Se recomienda validar con benchmarks propios antes de desplegar en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/alekshandru/gemma-4-E2B-it-qat-GGUF-mobile
- Modelo base oficial: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Documentación de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Guía de QAT de Unsloth: https://unsloth.ai/docs/models/gemma-4/qat
- Guía de GGUFs dinámicos de Unsloth: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Página del modelo en LM Studio: https://lmstudio.ai/models/google/gemma-4-e2b-qat
- Sitio no oficial gemma4.dev: https://gemma4.dev/models/gemma-4-e2b
