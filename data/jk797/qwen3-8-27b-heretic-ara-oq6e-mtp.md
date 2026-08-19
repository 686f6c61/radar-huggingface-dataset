# jk797/Qwen3.8-27B-heretic-ara-oQ6e-mtp

## Resumen

El modelo `jk797/Qwen3.8-27B-heretic-ara-oQ6e-mtp` es una cuantización de precisión mixta de 6 bits, generada con la herramienta oQ (oMLX v0.6.0), del modelo base `Qwen3.8-27B-heretic-ara` de la organización heretic-org. Este modelo base es una versión "desensurada" (abliterated) de Qwen3.8-27B, un modelo denso de visión-lenguaje (VLM) de código abierto orientado a tareas de codificación, trabajo profesional, investigación y agentes de largo horizonte. La cuantización reduce el tamaño del modelo para facilitar su despliegue en dispositivos Apple con el framework MLX, manteniendo un equilibrio entre rendimiento y huella de memoria.

El repositorio contiene los pesos en formato MLX safetensors, con un tamaño total de 23,7 GB. Los parámetros totales declarados en los archivos safetensors ascienden a 6.612.941.552 (~6,6 mil millones), lo que sugiere que el modelo base podría ser de menor tamaño de lo que su nombre indica, o que el autor ha subido una versión parcial. No se dispone de información adicional sobre la arquitectura interna, la licencia o los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (no se especifican detalles de la arquitectura interna) |
| Parametros totales | 6.612.941.552 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 6 bits, group size 64 (oQ mixed-precision) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. El tag `qwen3_5` sugiere que sigue la familia de modelos Qwen3, que tradicionalmente emplea una arquitectura transformer densa con attention de multiples cabezas y normalizacion RMS. Sin embargo, no se confirma si incorpora innovaciones recientes como attention lineal o decodificacion especulativa.

El modelo base `Qwen3.8-27B-heretic-ara` es una version abliterada de Qwen3.8-27B, lo que implica un proceso de eliminacion de las capas de rechazo (refusal) para permitir respuestas menos censuradas, especialmente en contextos de agentes de codificacion. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens o el uso de tecnicas como RLHF o DPO.

La cuantizacion se realizo con oQ (oMLX v0.6.0), una herramienta de cuantizacion de precision mixta para el framework MLX. El resultado es un modelo de 6 bits con group size 64, que reduce el espacio en disco y la memoria requerida en comparacion con los pesos en FP16 o BF16.

## Capacidades

Las capacidades listadas corresponden al modelo base `Qwen3.8-27B-heretic-ara`, segun la informacion publica disponible:

- Generacion de texto y razonamiento multi-paso, con mejor planificacion para tareas agénticas de largo horizonte.
- Soporte de vision (VLM), aunque no se especifican los detalles de las capacidades visuales.
- Generacion de codigo y manejo de feedback de herramientas y entorno, optimizado para agentes de codificacion autonomos.
- Integracion con herramientas como Claude Code, OpenCode, Aider y Hermes.
- Version "desensurada" (abliterated) que reduce las respuestas de rechazo, lo que puede ser util en entornos de desarrollo donde se requiere libertad creativa.
- Capacidades multilingues no confirmadas; el modelo base de Qwen3 suele soportar multiples idiomas, pero no hay datos especificos.

## Casos de uso

- Agentes de codificacion autonomos: el modelo puede integrarse en herramientas como Claude Code, OpenCode o Aider para generar, revisar y depurar codigo en multiples lenguajes, aprovechando su capacidad de manejar feedback de herramientas y entornos de ejecucion.
- Asistente de desarrollo integrado (IDE): uso como autocompletado o chat contextual en editores como VS Code, con la ventaja de su menor tamano tras la cuantizacion para ejecucion local en Mac.
- Automatizacion de tareas de investigacion: el modelo puede razonar sobre documentos tecnicos, extraer conclusiones y generar informes, gracias a su contexto largo (no confirmado) y su capacidad de razonamiento.
- Pruebas de software y generacion de casos de prueba: el modelo puede generar casos de prueba unitarios, identificar edge cases y proponer correcciones basandose en el codigo fuente.
- Chatbots de soporte tecnico con libertad de respuesta: al estar abliterado, puede manejar consultas que requieran respuestas directas sin censura, aunque esto conlleva riesgos de sesgo o contenido inapropiado.
- Prototipado rapido de aplicaciones con vision: al ser un VLM, puede procesar imagenes y generar descripciones o codigo basado en capturas, aunque las capacidades visuales no estan confirmadas en esta cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace no incluye metricas de evaluacion, y la cuantizacion oQ no aporta datos comparativos. Se recomienda realizar pruebas propias en las tareas objetivo antes de usar el modelo en produccion.

## Requisitos de hardware

- Al ser un modelo cuantizado en MLX, esta diseñado para ejecutarse en dispositivos Apple con chip M1, M2, M3 o posteriores.
- La memoria unificada necesaria para inferencia se estima en torno a 8-10 GB, dado que los pesos de 6 bits de ~6,6B parametros ocupan aproximadamente 5 GB, mas overhead de activaciones y cache.
- Se recomienda un Mac con al menos 16 GB de RAM unificada para trabajar comodamente, aunque modelos mas pequenos podrian caber en 8 GB.
- El despliegue se realiza mediante el framework MLX (mlx-lm) o a traves de librerias compatibles como llama.cpp (si se convierte a GGUF) u Ollama (si se empaqueta).
- La latencia y el throughput dependen del chip; en un M2 Pro se pueden esperar velocidades de generacion de 20-40 tokens/segundo con este tamano de modelo, aunque no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa rigurosa. El modelo base Qwen3.8-27B compite con otros VLM de codigo como Qwen2.5-Coder-32B, Llama-3.1-8B-Instruct o DeepSeek-Coder-V2, pero no hay resultados de benchmarks publicados para esta cuantizacion especifica. Se recomienda consultar las evaluaciones del modelo original en el repositorio de heretic-org o en la documentacion de Qwen3.

## Limitaciones y advertencias

- La cuantizacion de 6 bits puede degradar ligeramente la calidad de las respuestas en tareas de razonamiento complejo o generacion de codigo extenso, en comparacion con los pesos completos.
- El modelo base es una version abliterada, lo que implica que puede generar contenido inapropiado, ofensivo o tecnicamente incorrecto sin los filtros de seguridad habituales. No es recomendable para uso en entornos donde se requiera moderacion de contenido.
- No se dispone de informacion sobre la licencia del modelo base ni de la cuantizacion. Antes de usar en produccion, es imprescindible verificar los terminos de uso en el repositorio original de heretic-org.
- No se confirman las capacidades de vision en esta cuantizacion; es posible que el proceso de cuantizacion afecte a la parte visual del modelo.
- El numero de parametros declarado (6,6B) no coincide con el nombre del modelo (27B), lo que sugiere que el repositorio podria contener solo una parte de los pesos o que el modelo base es en realidad de menor tamano. Se recomienda verificar la integridad del archivo antes de su uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jk797/Qwen3.8-27B-heretic-ara-oQ6e-mtp
- Repositorio del modelo base (heretic-org): https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara
- Version en Ollama (jacokon): https://ollama.com/jacokon/qwen3.8-27b-heretic-ara
- Pagina de Qwen3.8 27B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Ficha en LLM Explorer: https://llm-explorer.com/model/heretic-org%2FQwen3.8-27B-heretic-ara,1gnpzhvwiWVhYFYskhwWI5
