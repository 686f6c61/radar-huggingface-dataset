# Brunobkr/OFFFELLIA_f16_IBM_Granite-4.2-3b.gguf

## Resumen

El modelo `OFFFELLIA_f16_IBM_Granite-4.2-3b.gguf` es una conversión a formato GGUF del modelo IBM Granite 4.2 de 3.000 millones de parámetros, realizada por el usuario Brunobkr. Granite 4.2 es una familia de modelos de lenguaje de IBM orientada a tareas de razonamiento complejo, generación de código y uso de herramientas, con un enfoque específico en flujos agénticos y multi-turno. Este modelo en particular, al estar empaquetado en GGUF, puede ejecutarse de forma local con llama.cpp y sus derivados, lo que facilita su despliegue en hardware variado, desde GPU de consumo hasta CPU.

El modelo tiene 3.659.737.600 parámetros, es de tipo denso (no MoE) y está licenciado bajo Apache 2.0, lo que permite su uso comercial sin restricciones. La conversión a f16 (float16) conserva la precisión del modelo original, aunque aumenta el tamaño del archivo (8,2 GB). El autor ha incluido además un fork de llama.cpp con características avanzadas (aceleración Vulkan para AMD, decodificación especulativa, etc.), aunque el modelo en sí es independiente de ese software.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (denso) |
| Parametros totales | 3.659.737.600 (3,66 B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (float16) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo .gguf) |

## Arquitectura y entrenamiento

IBM Granite 4.2 se basa en una arquitectura transformer decoder-only, con atención estándar y capas de normalización. A diferencia de Granite 4.0 (que usaba una mezcla de Mamba-2 y transformer con MoE), Granite 4.2 vuelve a una arquitectura densa y más convencional, priorizando la estabilidad en tareas de razonamiento y uso de herramientas. El modelo se entrena con un corpus multilingüe que incluye datos de código, matemáticas y conversación, y se ha ajustado con técnicas de razonamiento paso a paso (chain-of-thought) y entrenamiento con preferencias (RLHF/DPO) para mejorar la calidad de las respuestas y la adherencia a instrucciones.

No se dispone de información detallada sobre el número exacto de tokens de entrenamiento ni la composición del dataset en la documentación proporcionada. El modelo base es `ibm-granite` y su versión específica es la 4.2-3b, que IBM ha optimizado para tareas de agente, incluyendo soporte nativo para tool calling y multi-turno.

## Capacidades

- Generación de texto en 11 idiomas, con buen rendimiento en inglés y español.
- Razonamiento paso a paso (thinking mode) para problemas de matemáticas, lógica y análisis.
- Soporte de tool calling y function calling, integrable en flujos de agentes.
- Capacidad de multi-turno y memoria de contexto (aunque la longitud máxima no se ha especificado).
- Generación de código en lenguajes como Python, JavaScript, Java, etc., con comprensión de patrones y depuración.
- Razonamiento agéntico: puede planificar y ejecutar secuencias de acciones mediante llamadas a herramientas externas.
- Multilingüe: cubre 11 idiomas, incluyendo español, francés, alemán, japonés, etc.

## Casos de uso

- **Asistentes de atención al cliente**: el modelo puede gestionar conversaciones multi-turno en varios idiomas, respondiendo consultas y escalando problemas complejos a sistemas externos mediante tool calling.
- **Generación de código en producción**: integrado en un pipeline de CI/CD, puede autocompletar funciones, revisar snippets y sugerir correcciones, gracias a su capacidad de razonamiento y comprensión del contexto.
- **Agentes autónomos**: con soporte de function calling, puede coordinar acciones como búsqueda en bases de datos, llamadas a APIs o ejecución de comandos, todo dentro de un bucle de razonamiento.
- **Traducción y localización**: al soportar 11 idiomas, es útil para traducir textos técnicos o mantener consistencia terminológica en entornos multilingües.
- **Análisis de documentos técnicos**: puede resumir, extraer datos y responder preguntas sobre manuales o documentación extensa, aunque su contexto limitado no permita documentos muy largos.
- **Chatbots de soporte técnico**: con el formato GGUF, puede ejecutarse en hardware local (GPU de 8 GB o más) sin depender de servicios en la nube, lo que es adecuado para entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otros tests para este modelo concreto. Se recomienda consultar la documentación de IBM Granite para conocer el rendimiento general de la familia Granite 4.2.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con cuantización f16, el peso del modelo es de ~7,3 GB (3,66 B × 2 bytes). Sumando la caché de atención y la memoria de trabajo, se recomienda al menos 10-12 GB de VRAM para un contexto moderado. Con cuantizaciones más bajas (Q8, Q4) cabría en 6-8 GB.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4070 12 GB, RTX 3080 10 GB (con Q8), o A100/H100 para despliegues de mayor escala. En APUs AMD con memoria unificada (UMA) también puede funcionar.
- **Consumer GPU**: sí, cabe en GPUs de gama media con 8 GB si se usa cuantización Q8 o Q4.
- **Opciones de despliegue**: llama.cpp (server o CLI), Ollama, llama-cpp-python, vLLM (con conversión a safetensors), o el fork de llama.cpp descrito en la model card que añade soporte Vulkan para AMD.
- **Latencia y throughput**: no se han publicado datos específicos. En una RTX 3060 12 GB, con f16, se puede esperar una velocidad de 20-30 tokens/s para texto de corto a medio, pero depende del tamaño de la caché de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizaciones | Notas |
|---|---|---|---|---|---|
| IBM Granite 4.2 3B (este) | 3,66 B | no disponible | Apache 2.0 | GGUF (f16) | Enfocado a razonamiento y tool-calling |
| Llama 3.2 3B | 3,21 B | 128K | Llama 3.2 license | GGUF, safetensors | Buen rendimiento general, menos orientado a agentes |
| Phi-3.5 mini | 3,82 B | 128K | MIT | GGUF, safetensors | Bueno en razonamiento, pero con licencia MIT |
| Gemma 2 2B | 2,61 B | 8K | Gemma license | GGUF | Más ligero, pero con contexto menor |

La comparativa es aproximada y se basa en parámetros y disponibilidad. No se incluyen resultados de benchmarks por falta de datos.

## Limitaciones y advertencias

- **Sesgos**: al igual que otros modelos de lenguaje, puede reflejar sesgos presentes en sus datos de entrenamiento, especialmente en temas sociales y culturales.
- **Alucinación**: existe riesgo de generar información falsa o inventada, especialmente en tareas de razonamiento complejo o cuando no tiene acceso a datos externos.
- **Contexto limitado**: aunque no se ha especificado la longitud máxima, el modelo de 3B tiene una capacidad de contexto relativamente corta en comparación con modelos más grandes, lo que puede limitar su uso con documentos largos.
- **Idioma**: aunque soporta 11 idiomas, su rendimiento en idiomas no representados en el entrenamiento puede ser inferior.
- **Licencia**: Apache 2.0 permite uso comercial, pero hay que revisar las cláusulas de atribución y de patentes del proyecto Granite original.
- **Formato GGUF**: la conversión a GGUF puede introducir ligeras pérdidas de precisión si se usan cuantizaciones bajas; en f16 la pérdida es mínima, pero el tamaño del archivo es mayor.
- **Dependencia de software**: para usar todas las capacidades de tool calling y agentes, se recomienda un runtime compatible con GGUF y con soporte para function calling (p.ej., llama.cpp con `--tool-call`).

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/Brunobkr/OFFFELLIA_f16_IBM_Granite-4.2-3b.gguf)
- [Organización IBM Granite en HuggingFace](https://huggingface.co/ibm-granite)
- [Página oficial de IBM Granite](https://www.ibm.com/granite)
- [Repositorio IBM/gguf (conversión y scripts)](https://github.com/IBM/gguf)
- [Documentación de Granite 4.0 (para referencia de arquitectura)](https://www.ibm.com/granite/docs/models/granite)
- [Repositorio GitHub de IBM Granite](https://github.com/ibm-granite)
