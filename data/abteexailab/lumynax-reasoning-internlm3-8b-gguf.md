# AbteeXAILab/lumynax-reasoning-internlm3-8b-gguf

## Resumen

LumynaX Reasoning InternLM3 8B Instruct GGUF es un paquete de inferencia publicado por AbteeX AI Labs, un laboratorio con sede en Aotearoa (Nueva Zelanda), dentro de su familia de modelos de IA soberana LumynaX. Se trata de una conversión a formato GGUF del modelo `internlm/internlm3-8b-instruct`, integrado mediante un mecanismo de "infusión" enrutada con el núcleo LumynaX, que actúa como capa de orquestación sin modificar los pesos originales. El modelo está pensado para ejecución local con llama.cpp y es compatible con vLLM y Nvidia NIM, aunque el propio autor lo etiqueta como un artefacto de investigación legacy, desactualizado y no recomendado para producción.

Con 8.804.241.408 parámetros, el modelo ofrece capacidades de razonamiento y chat en inglés y maorí, y se distribuye bajo licencia Apache-2.0. Su relevancia actual reside en su valor como referencia histórica del enfoque de infusión de LumynaX y como ejemplo de conversión GGUF de un modelo InternLM3, más que como herramienta práctica para despliegues modernos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en InternLM3-8B-Instruct) |
| Parametros totales | 8.804.241.408 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (tipos no especificados en la informacion disponible) |
| Idiomas soportados | en, mi (ingles y maori) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una conversión a GGUF del checkpoint `internlm/internlm3-8b-instruct`, un transformer denso de 8.000 millones de parámetros entrenado por InternLM. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO en la información disponible. La innovación principal de este paquete no reside en la arquitectura del modelo base, sino en el concepto de "infusión" de LumynaX: un mecanismo de composición controlada donde el núcleo LumynaX dirige la inferencia a través del modelo sin modificar sus pesos (infusión enrutada), aplicando controles de soberanía, planificación agéntica y optimización de inferencia alrededor de la ejecución. Este release concreto no incluye fusión de pesos ni mezcla de expertos; simplemente preserva los pesos originales y añade una capa de identidad y runtime histórica.

## Capacidades

- Generación de texto y chat conversacional en inglés y maorí.
- Razonamiento y respuestas instructivas, heredadas del modelo base InternLM3-8B-Instruct.
- Ejecución local eficiente gracias al formato GGUF, compatible con llama.cpp y herramientas como Ollama.
- Integración con vLLM y Nvidia NIM (etiquetado como compatible, aunque requiere conversión para Nemo).
- Soporte de infusión enrutada por LumynaX Core, que añade orquestación y controles de soberanía (aunque esta versión es legacy y no representa la implementación actual).

## Casos de uso

- Investigación y reproducibilidad: el paquete sirve para reproducir experimentos históricos del proyecto LumynaX, verificando checksums y manifiestos de exportación.
- Evaluación comparativa de modelos GGUF: permite probar el rendimiento de InternLM3-8B en formato GGUF frente a otras cuantizaciones o modelos similares en entornos locales.
- Prototipado de aplicaciones de chat en inglés y maorí: dado su soporte bilingüe, puede usarse para pruebas de concepto de asistentes conversacionales en contextos neozelandeses o maoríes.
- Estudio de técnicas de infusión: los desarrolladores interesados en el enfoque de LumynaX pueden analizar cómo se estructura la capa de orquestación sin modificar pesos.
- Despliegue educativo en entornos con recursos limitados: al ser un modelo de 8B en GGUF, puede ejecutarse en GPUs de consumo para fines didácticos.
- Pruebas de compatibilidad con vLLM y Nvidia NIM: aunque es legacy, sirve para validar pipelines de inferencia con estos motores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones para este paquete específico.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información disponible.
- Al ser un modelo GGUF de 8B, se estima que puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB) o superiores, dependiendo de la cuantización elegida, pero este dato no está confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (etiquetado como compatible), Nvidia NIM (candidato).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LumynaX Reasoning InternLM3 8B GGUF | 8,8B | no disponible | Apache-2.0 | GGUF | Legacy, infusión LumynaX |
| internlm/internlm3-8b-instruct | 8,8B | no disponible | Apache-2.0 | safetensors | Modelo base original |
| Meta Llama 3.1 8B Instruct | 8,0B | 128K | Llama 3.1 Community | safetensors, GGUF | Alternativa popular, sin soporte maorí |

La comparativa se limita a aspectos estructurales, ya que no hay datos de rendimiento disponibles para el paquete LumynaX. El modelo base InternLM3-8B-Instruct es la referencia directa, mientras que Llama 3.1 8B es una alternativa común en el mismo rango de parámetros, aunque con licencia más restrictiva y sin soporte para maorí.

## Limitaciones y advertencias

- El autor declara explícitamente que este release es legacy, desactualizado y no recomendado para producción.
- No se proporcionan detalles sobre sesgos, alucinaciones o limitaciones de contexto; se heredan las del modelo base InternLM3-8B-Instruct.
- El soporte de idiomas se limita a inglés y maorí; no se garantiza calidad en otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero el estado de "artefacto de investigación" implica que no hay garantías de mantenimiento ni soporte.
- Los wrappers de runtime e identidad incluidos son componentes históricos y no representan el pipeline LumynaX actual.
- Para uso en producción, se recomienda evaluar el modelo base original o versiones actualizadas de LumynaX.

## Enlaces

- [HuggingFace - AbteeXAILab/lumynax-reasoning-internlm3-8b-gguf](https://huggingface.co/AbteeXAILab/lumynax-reasoning-internlm3-8b-gguf)
- [GitHub - Aimaghsoodi/lumynax-reasoning-internlm3-8b-gguf](https://github.com/Aimaghsoodi/lumynax-reasoning-internlm3-8b-gguf)
- [Modelo base - internlm/internlm3-8b-instruct](https://huggingface.co/internlm/internlm3-8b-instruct)
- [AbteeX AI Labs](https://abteex.com)
- [LumynaX](https://lumynax.com)
