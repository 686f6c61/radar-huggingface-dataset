# ggml-org/Llama-2-7B-GGUF

## Resumen

Llama-2-7B-GGUF es una conversión al formato GGUF del modelo base Llama-2-7b-hf, publicada por la organización ggml-org, el equipo responsable del proyecto llama.cpp. Este repositorio se creó principalmente con fines de recolección de datos para el desarrollo de llama.cpp, tal como se indica en la model card, y no como un lanzamiento de modelo independiente. El modelo base, desarrollado por Meta, es un transformer decoder-only de 6.738 millones de parámetros, diseñado para generación de texto en modo autocompletado.

La relevancia de esta ficha radica en que el formato GGUF es el estándar de facto para la inferencia local con llama.cpp y sus derivados (Ollama, LM Studio, etc.), lo que permite ejecutar el modelo en CPU y GPU de consumo. Al tratarse del modelo base sin fine-tuning, no está optimizado para conversación ni instrucciones, sino para continuar texto de forma cruda. El repositorio contiene múltiples archivos de cuantización, lo que explica su tamaño total de 37,9 GB, aunque no se especifica la lista exacta de cuantizaciones disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 2 soporta 4096 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (el repo contiene archivos GGUF, pero no se enumeran los tipos) |
| Idiomas soportados | no disponible (el modelo base de Llama 2 es principalmente ingles, pero no se especifica) |
| Licencia | llama2 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Llama-2-7b-hf es un transformer autoregresivo con normalización RMSNorm, activación SwiGLU y atención con RoPE (rotary positional embeddings). Tiene 32 capas, 32 cabezas de atención y una dimensión oculta de 4096. El entrenamiento del modelo original se realizó sobre 2 billones de tokens, mayoritariamente en inglés, con un pipeline que incluye preentrenamiento supervisado y ajuste con RLHF para la variante chat, aunque esta conversión corresponde al modelo base sin dicho ajuste.

La conversión a GGUF se realizó automáticamente mediante la herramienta de conversión de ggml-org, que transforma los pesos de safetensors al formato GGUF. Este formato introduce mejoras sobre el anterior GGML, como una tokenización más eficiente y soporte para tokens especiales. No se dispone de información adicional sobre el proceso de cuantización ni sobre los datos de entrenamiento específicos de esta versión.

## Capacidades

- Generación de texto en modo autocompletado: al ser el modelo base, continúa secuencias de texto de forma cruda, sin seguir instrucciones ni mantener diálogos estructurados.
- Razonamiento básico: puede realizar tareas de completado de texto con cierta coherencia, pero sin el ajuste por instrucciones su rendimiento en tareas dirigidas es limitado.
- Multilingüismo: no se especifica, aunque el modelo base de Llama 2 está entrenado principalmente en inglés, con algo de otros idiomas.
- Sin soporte de tool calling, agentes ni modo pensamiento: al ser una conversión del modelo base, no incluye estas capacidades.
- Compatibilidad con llama.cpp: al estar en formato GGUF, puede ejecutarse en cualquier runtime compatible, incluyendo CPU y GPU.

## Casos de uso

- Experimentación con inferencia local: ideal para probar llama.cpp y sus parámetros de cuantización, ya que este repositorio se creó precisamente para recopilar datos de rendimiento y compatibilidad.
- Fine-tuning sobre dominios específicos: al ser el modelo base, puede servir como punto de partida para ajuste fino con datasets propios, aunque para ello es preferible usar los pesos originales en safetensors.
- Generación de texto creativo: puede usarse para continuar historias, poemas o cualquier texto libre, siempre que se le proporcione un prompt adecuado.
- Evaluación de cuantizaciones: los archivos GGUF permiten comparar el impacto de diferentes niveles de cuantización en la calidad de salida y el rendimiento.
- Integración en aplicaciones de escritorio: mediante llama.cpp u Ollama, puede desplegarse en equipos sin GPU dedicada, aunque con menor velocidad.
- Investigación sobre formatos de serialización: útil para estudiar el formato GGUF y su evolución, dado que el repositorio está vinculado al desarrollo de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval ni otros tests estándar. Al ser una conversión del modelo base Llama-2-7b, los resultados del modelo original son conocidos (por ejemplo, MMLU 45.3% en el paper de Llama 2), pero no se pueden atribuir directamente a esta versión GGUF sin verificación.

## Requisitos de hardware

- VRAM estimada: depende de la cuantización. Para una cuantización Q4_K_M, el archivo ocupa aproximadamente 4,1 GB, por lo que cabe en GPUs con 6 GB o más. Para Q8, alrededor de 7,2 GB, requiriendo al menos 8 GB.
- GPU recomendadas: RTX 3060 (12 GB) o superior para cuantizaciones bajas; RTX 4090 o A100 para cuantizaciones altas o mayor velocidad.
- CPU: puede ejecutarse en CPU con llama.cpp, aunque la velocidad será menor. Se recomienda al menos 8 GB de RAM para cuantizaciones Q4.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, entre otros.
- Latencia y throughput: no disponible, depende del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ggml-org/Llama-2-7B-GGUF | 6,74 B | no disponible | GGUF | llama2 | Conversión oficial del equipo llama.cpp |
| TheBloke/Llama-2-7B-GGUF | 6,74 B | 4096 (según modelo base) | GGUF | llama2 | Conversión de TheBloke, muy popular, con múltiples cuantizaciones documentadas |
| meta-llama/Llama-2-7b-hf | 6,74 B | 4096 | safetensors | llama2 | Modelo original en formato HuggingFace |

La principal diferencia entre las dos versiones GGUF es el autor y la documentación: TheBloke ofrece una lista detallada de cuantizaciones y enlaces a guías, mientras que ggml-org es una conversión automática con fines de desarrollo. Para uso en producción, la versión de TheBloke suele ser más recomendable por su documentación.

## Limitaciones y advertencias

- Modelo base sin fine-tuning: no responde a instrucciones ni mantiene conversaciones; requiere un prompt cuidadosamente diseñado o un ajuste posterior.
- Sesgos y alucinaciones: al ser el modelo base de Llama 2, hereda los sesgos del corpus de entrenamiento y puede generar contenido falso o estereotipado.
- Licencia llama2: restringe el uso comercial a empresas con menos de 700 millones de usuarios mensuales, y prohíbe ciertos usos como la generación de contenido ilegal o el uso militar.
- Sin información sobre contexto: no se confirma la longitud de contexto soportada en esta conversión, aunque el modelo base soporta 4096 tokens.
- Repositorio de desarrollo: la model card indica que se usa para recolección de datos, por lo que no se garantiza estabilidad ni soporte a largo plazo.
- Idiomas limitados: el modelo base está principalmente entrenado en inglés, con menor rendimiento en otros idiomas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ggml-org/Llama-2-7B-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Proyecto llama.cpp: https://github.com/ggml-org/llama.cpp
- Discusión de recolección de datos: https://github.com/ggml-org/llama.cpp/discussions/4167
- Conversión alternativa de TheBloke: https://huggingface.co/TheBloke/Llama-2-7B-GGUF
