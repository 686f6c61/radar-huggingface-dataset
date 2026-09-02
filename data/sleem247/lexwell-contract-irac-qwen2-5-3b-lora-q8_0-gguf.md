# Sleem247/lexwell-contract-irac-qwen2.5-3b-lora-Q8_0-GGUF

## Resumen

El modelo `Sleem247/lexwell-contract-irac-qwen2.5-3b-lora-Q8_0-GGUF` es un adaptador LoRA en formato GGUF, diseñado para especializar el modelo base Qwen2.5-3B en el análisis de contratos mediante el método IRAC (Issue, Rule, Application, Conclusion). El adaptador original fue desarrollado por `Curious-PM` y posteriormente convertido a GGUF por `Sleem247` mediante la herramienta GGUF-my-lora de ggml.ai. Este formato permite su uso directo con llama.cpp y entornos compatibles, facilitando el despliegue en infraestructuras ligeras.

El adaptador cuenta con aproximadamente 7,37 millones de parámetros, un tamaño muy reducido que no añade una carga significativa al modelo base. Al estar basado en Qwen2.5-3B, hereda la arquitectura transformer decoder-only de esta familia, que soporta hasta 128K tokens de contexto en su versión original. Aunque no se especifica la licencia ni los idiomas soportados en la ficha de HuggingFace, el modelo base Qwen2.5 es multilingüe y de código abierto, lo que sugiere que el adaptador puede utilizarse en contextos multilingües, aunque su especialización legal puede estar orientada a un idioma concreto.

La relevancia de este modelo radica en su capacidad para adaptar un LLM generalista a una tarea específica del ámbito legal con un coste computacional mínimo, siendo una opción práctica para desarrolladores que necesitan análisis contractual automatizado en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-3B (transformer decoder-only) |
| Parametros totales | 7.372.800 (adaptador LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Depende del modelo base (Qwen2.5-3B soporta hasta 128K, el adaptador no lo modifica) |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 es multilingüe) |
| Licencia | No disponible |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Qwen2.5-3B, un modelo transformer decoder-only con atención causal. El adaptador LoRA fue entrenado mediante fine-tuning supervisado (SFT), según las etiquetas `sft` y `trl` presentes en la ficha, lo que indica el uso de la librería TRL de HuggingFace. No se dispone de información sobre el dataset de entrenamiento ni el número de tokens utilizados. La conversión a GGUF se realizó con la herramienta GGUF-my-lora, que empaqueta el adaptador en un archivo Q8_0 (cuantización de 8 bits) listo para ser cargado junto con el modelo base en llama.cpp.

El método IRAC sugiere que el adaptador está entrenado para estructurar respuestas legales siguiendo el esquema: identificación del problema (Issue), aplicación de la regla jurídica (Rule), análisis del caso (Application) y conclusión (Conclusion). Esta especialización es típica en el ámbito del derecho contractual.

## Capacidades

- Análisis de contratos con estructuración de respuestas según el método IRAC (Issue, Rule, Application, Conclusion).
- Generación de texto legal contextualizado, basado en el conocimiento general del modelo base Qwen2.5-3B.
- Soporte de razonamiento multi-paso, heredado del modelo base, aunque sin garantías específicas para tareas complejas.
- Capacidades multilingües del modelo base (Qwen2.5 soporta más de 29 idiomas), aunque el adaptador no especifica idiomas concretos.
- No se confirma soporte de tool calling, function calling ni uso como agente autónomo; el adaptador está diseñado principalmente para tareas de generación de texto.

## Casos de uso

- Asesoría legal automatizada: el modelo puede generar análisis de cláusulas contractuales siguiendo el esquema IRAC, útil para abogados que necesitan una primera revisión estructurada de contratos.
- Revisión de contratos de arrendamiento: dada su especialización, puede extraer problemas potenciales y aplicar reglas jurídicas relevantes, facilitando la detección de riesgos.
- Educación jurídica: puede utilizarse como herramienta didáctica para enseñar el método IRAC a estudiantes de derecho, generando ejemplos prácticos.
- Integración en sistemas de gestión documental: al ser un GGUF ligero, puede desplegarse en servidores de baja potencia para procesar lotes de contratos de forma local.
- Asistente en la redacción de cláusulas: puede sugerir redacciones alternativas basadas en el análisis de casos similares, aunque su capacidad depende del entrenamiento del adaptador.
- Automatización de informes legales: el modelo puede generar informes preliminares que luego un profesional revisa, ahorrando tiempo en tareas repetitivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas para tareas legales.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA Q8_0 ocupa aproximadamente 7,4 MB, pero necesita cargarse junto con el modelo base Qwen2.5-3B. En cuantización Q8, el modelo base requiere alrededor de 3,5 GB de VRAM, por lo que el conjunto total se sitúa en torno a 3,6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, o superiores. También es viable en Apple Silicon con Metal.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y alta de consumo.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), Ollama (si se añade manualmente), y cualquier framework que soporte GGUF, como llama-cpp-python.
- Latencia y throughput: no se dispone de datos concretos, pero al ser un modelo de 3B con un adaptador pequeño, la inferencia es rápida en hardware moderno; se espera una latencia de decenas de milisegundos por token en GPUs consumer.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA específicos para análisis de contratos con método IRAC. Como referencia, se puede comparar con el modelo base Qwen2.5-3B-Instruct, que ofrece capacidades generales pero sin la especialización legal. Tampoco hay datos de rendimiento comparativo entre este adaptador y otras soluciones como LegalBERT o modelos jurídicos más grandes.

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Sleem247/lexwell-contract-irac-qwen2.5-3b-lora-Q8_0-GGUF | 7,37M (LoRA) + 3B base | Hasta 128K (base) | IRAC en contratos | No disponible |
| Qwen2.5-3B-Instruct | 3B | 128K | General | Apache 2.0 |
| LegalBERT | 110M | 512 | Texto legal general | Apache 2.0 |

Nota: LegalBERT es un modelo más antiguo y con menor capacidad, pero sirve como referencia de modelos legales específicos.

## Limitaciones y advertencias

- No se dispone de información sobre el dataset de entrenamiento del adaptador, por lo que no se puede evaluar su sesgo ni su cobertura legal.
- El tamaño reducido del modelo base (3B) limita la profundidad del razonamiento jurídico en comparación con modelos más grandes.
- Riesgo de alucinaciones en la aplicación de reglas legales; el modelo puede generar citas o referencias inexistentes.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial.
- No hay benchmarks publicados, por lo que su rendimiento real en tareas legales es incierto.
- El adaptador está diseñado para un método específico (IRAC); puede no generalizar bien a otros estilos de análisis legal.
- Al ser un LoRA, su efectividad depende de la calidad del modelo base y de la coherencia del entrenamiento; no se ha verificado su robustez en producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Sleem247/lexwell-contract-irac-qwen2.5-3b-lora-Q8_0-GGUF
- Adaptador original (Curious-PM): https://huggingface.co/Curious-PM/lexwell-contract-irac-qwen2.5-3b-lora
- Colección Qwen2.5 en HuggingFace: https://huggingface.co/collections/Qwen/qwen25
- Qwen2.5-3B-Instruct GGUF: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF
- Documentación de llama.cpp para LoRA: https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md
