# mradermacher/Agent-R2-4B-GGUF

## Resumen
Agent-R2-4B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Agent-R2-4B, publicado originalmente por el usuario teng-pan en Hugging Face. El repositorio lo mantiene mradermacher, un perfil conocido por generar y distribuir versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base tiene 4.000 millones de parámetros, un tamaño que lo sitúa en la gama de modelos pequeños orientados a tareas de agente.

La relevancia de esta ficha radica en que el repositorio es un artefacto de distribución (cuantizaciones), no el modelo original. La model card del repositorio es mínima: se limita a indicar que se trata de cuantizaciones estáticas del modelo teng-pan/Agent-R2-4B y enumera los tipos de cuantización generados. No se documentan arquitectura, datos de entrenamiento, licencia ni idiomas en la información disponible.

Por tanto, esta ficha describe lo que se puede verificar del repositorio (tipos de cuantización, formato, relación con el modelo base) y marca explícitamente como "no disponible" todo aquello que la información proporcionada no cubre. Para evaluar el modelo en profundidad, es necesario consultar el repositorio del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 4B (según el nombre del modelo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas; el modelo base se distribuye presumiblemente en safetensors, no confirmado) |

## Arquitectura y entrenamiento
No se dispone de información sobre la arquitectura del modelo base en la documentación proporcionada. El nombre "Agent-R2-4B" sugiere un modelo de 4.000 millones de parámetros orientado a tareas de agente, pero no se confirma si emplea un transformer denso, una arquitectura MoE u otra variante, ni si incorpora mecanismos especiales como atención lineal o decodificación especulativa.

Tampoco se documentan los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO o fases de post-entrenamiento). La model card del repositorio de cuantizaciones no incluye ninguna referencia al proceso de entrenamiento del modelo original. La única información técnica verificable son los metadatos de la herramienta de cuantización: `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica que las cuantizaciones se generaron a partir de pesos en formato Hugging Face mediante un pipeline de conversión a GGUF.

## Capacidades
- Generación de texto: capacidad esperable en un modelo de lenguaje de 4B, aunque no se detalla en la información disponible.
- Razonamiento y tareas de agente: el nombre del modelo sugiere orientación a flujos agénticos, pero no se confirma ni se detalla el soporte de tool calling, function calling ni multi-step reasoning.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Ejecución local: al distribuirse en GGUF, es compatible con llama.cpp y derivados (Ollama, LM Studio, etc.), lo que permite inferencia en CPU y GPU de consumo.

## Casos de uso
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar un modelo de 4B en equipos sin GPU dedicada o con GPU de gama media, usando llama.cpp u Ollama.
- Prototipado de agentes en entornos con recursos limitados: el tamaño de 4B y el formato GGUF facilitan iterar sobre pipelines agénticos en portátiles antes de escalar a modelos mayores.
- Pruebas de integración en CI/CD: un GGUF de 4B puede incluirse en contenedores ligeros para validar flujos de generación de texto sin depender de APIs externas.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece múltiples niveles (Q2_K a Q8_0, IQ4_XS), útil para medir la degradación de calidad frente al tamaño en un modelo concreto.
- Uso educativo y de investigación: permite estudiar el comportamiento de un modelo de 4B en tareas de agente con hardware asequible.
- Inferencia en el borde (edge): las cuantizaciones de 2-4 bits (Q2_K, Q3_K_S, IQ4_XS) reducen el peso a pocos gigabytes, lo que abre la puerta a despliegues en dispositivos con memoria limitada, siempre que la licencia lo permita (no confirmada).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 4B en GGUF, Q8_0 ronda los 4-5 GB, Q4_K_M alrededor de 2,5-3 GB y Q2_K en torno a 1,5-2 GB; estas cifras son estimaciones por tamaño de parámetros y cuantización, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, un modelo de 4B cuantizado a 4 bits cabe en GPU de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060, etc.); para Q8_0 se recomienda 8 GB o más.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en la mayoría de GPU con 6 GB o más para cuantizaciones de 4 bits, aunque no se confirma en la documentación.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que requerirían los pesos originales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No se dispone de datos de rendimiento del modelo base, por lo que la comparativa se limita a aspectos estructurales. Los resultados de búsqueda mencionan otros repositorios de cuantizaciones de mradermacher (AgenticCoder-4B-GGUF y Commerce-Agent-4B-v4.1-GGUF), que podrían ser alternativas de la misma categoría, pero no se aportan especificaciones de ninguno de ellos.

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Agent-R2-4B-GGUF | 4B | no disponible | no disponible | GGUF | no disponible |
| AgenticCoder-4B-GGUF | 4B (según nombre) | no disponible | no disponible | GGUF | no disponible |
| Commerce-Agent-4B-v4.1-GGUF | 4B (según nombre) | no disponible | no disponible | GGUF | no disponible |

## Limitaciones y advertencias
- La información disponible es mínima: no se documentan arquitectura, entrenamiento, licencia ni idiomas, lo que impide evaluar el modelo con rigor.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible consultar el repositorio del modelo base (teng-pan/Agent-R2-4B) antes de cualquier despliegue en producción.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay datos específicos sobre la tasa de alucinación de este modelo.
- Sesgos: no documentados. Al no conocerse la composición del dataset de entrenamiento, no se pueden anticipar sesgos de género, idioma o dominio.
- Degradación por cuantización: las cuantizaciones de 2-3 bits (Q2_K, Q3_K_S) pueden degradar la calidad de forma notable en tareas de razonamiento; se recomienda validar con Q4_K_M o superior.
- Contexto e idiomas: al no conocerse la longitud de contexto ni los idiomas soportados, no se puede garantizar su idoneidad para conversaciones largas o para castellano.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces
- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Agent-R2-4B-GGUF
- Modelo base: https://huggingface.co/teng-pan/Agent-R2-4B
- Repositorio relacionado (AgenticCoder-4B-GGUF): https://huggingface.co/mradermacher/AgenticCoder-4B-GGUF
- Repositorio relacionado (Commerce-Agent-4B-v4.1-GGUF): https://huggingface.co/mradermacher/Commerce-Agent-4B-v4.1-GGUF
