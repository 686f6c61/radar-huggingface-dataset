# enginetown/Qwen3.8-27B-Calibrated

## Resumen

Este repositorio contiene tres cuantizaciones GGUF del modelo Qwen/Qwen3.8-27B, generadas por el usuario enginetown mediante un proceso de calibración por tensores. No se trata de un modelo nuevo entrenado desde cero, sino de una optimización de pesos para reducir el tamaño del archivo manteniendo la fidelidad al modelo original. El autor utiliza una metodología basada en la divergencia KL para medir el impacto de cada categoría de tensores al cuantizar, y ofrece tres builds con diferentes equilibrios entre tamaño y calidad: Bedrock, Tightrope y Gambit.

La relevancia de este proyecto radica en que aborda un problema práctico en la inferencia local: las cuantizaciones agresivas suelen degradar capacidades específicas como el tool calling o el razonamiento matemático. El autor documenta que los errores de compresión se combinan de forma no lineal, y que proteger ciertos tensores (como attn_qkv y ffn_down) tiene un impacto desproporcionado en la calidad final. Los archivos GGUF resultantes están pensados para su uso con motores de inferencia como llama.cpp, Ollama o LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con componentes SSM (según tensores ssm_alpha en la cuantización) y bloque MTP (Multi-Token Prediction) para decodificación especulativa |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (Q8_0 base, y cuantizaciones IQ-family personalizadas: Bedrock, Tightrope, Gambit) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, cuya arquitectura incluye componentes SSM (State Space Model) además de los bloques transformer clásicos, como evidencia el tensor `ssm_alpha` mencionado en la model card. También incorpora un bloque de cabecera MTP (Multi-Token Prediction) que permite decodificación especulativa para acelerar la inferencia. El autor de este repositorio no ha realizado entrenamiento adicional, sino que ha aplicado un proceso de cuantización por categorías de tensores, midiendo la divergencia KL contra la versión Q8_0 de Unsloth como referencia. Se construyó una imatrix específica para este modelo y se utilizó en todas las pasadas de cuantización.

La innovación técnica principal es el método de calibración: en lugar de cuantizar todo el modelo con un único nivel, se analiza cada categoría de tensores (como `attn_qkv`, `ffn_down`, `output_weight`, `token_embd`, `attn_gate`, `attn_v`, etc.) de forma aislada para determinar su "suelo seguro" individual. Posteriormente, se validan las combinaciones completas, descubriendo que los errores se acumulan de forma no lineal y que algunas protecciones solo funcionan en pareja (por ejemplo, `output_weight`/`token_embd` junto con `attn_gate`). El resultado son tres builds con distintos niveles de agresividad.

## Capacidades

- Generación de texto y razonamiento general, evaluado mediante divergencia KL en la categoría "general".
- Generación de código, que obtuvo los mejores resultados (verde) en todos los builds y niveles de agresividad.
- Razonamiento matemático, con resultados verdes en Bedrock y Tightrope, y amarillo en Gambit.
- Tool calling / function calling, la categoría más volátil según el autor, con la distribución de error más amplia y dispersa.
- Soporte para decodificación especulativa gracias al bloque MTP, aunque este bloque tiene poca cobertura de imatrix y su calidad es menos fiable que el resto del modelo.
- Capacidades conversacionales, como indica la etiqueta "conversational" en el repositorio.

## Casos de uso

- Inferencia local en hardware de consumo: con tamaños de 12,54 a 13,91 GiB, estos archivos GGUF pueden ejecutarse en GPUs con 16 GB de VRAM o incluso en CPU con suficiente RAM, usando llama.cpp u Ollama.
- Desarrollo de agentes con tool calling: el build Bedrock es el más adecuado para aplicaciones que dependen críticamente de llamadas a funciones, ya que presenta la menor divergencia KL en la categoría toolcalling (0,0200).
- Generación de código asistida en entornos sin conexión: la categoría "code" es verde en todos los builds, por lo que cualquiera de las tres versiones puede integrarse en un IDE o pipeline de CI/CD para autocompletado o revisión de código.
- Prototipado rápido de chatbots conversacionales: el modelo base es de 27B, lo que ofrece un equilibrio razonable entre calidad de respuesta y requisitos de hardware para demos o pruebas de concepto.
- Razonamiento matemático en entornos con restricciones de memoria: el build Tightrope mantiene matemáticas en verde con un tamaño intermedio de 13,14 GiB, adecuado para aplicaciones educativas o de análisis numérico.
- Despliegue en edge devices o servidores con VRAM limitada: el build Gambit, con 12,54 GiB y 3,94 BPW, es la opción más ligera para dispositivos con 16 GB de VRAM compartida o GPUs de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. En su lugar, el autor proporciona mediciones de divergencia KL contra la versión Q8_0 del modelo base, evaluadas en cuatro categorías (general, code, math, toolcalling) para cada build combinado. Estos valores representan la pérdida de fidelidad introducida por la cuantización; valores más bajos indican mayor cercanía al original.

| Build | Tamaño | BPW | general | code | math | toolcalling |
|---|---|---|---|---|---|---|
| Bedrock | 13,91 GiB | 4,37 | 0,0177 | 0,0034 | 0,0048 | 0,0200 |
| Tightrope | 13,14 GiB | 4,13 | 0,0252 | 0,0040 | 0,0067 | 0,0404 |
| Gambit | 12,54 GiB | 3,94 | 0,0455 | 0,0064 | 0,0112 | 0,0542 |

Ningún valor supera el umbral de 0,1 (rojo). La categoría "code" es verde en todos los builds, mientras que "general" y "toolcalling" nunca alcanzan verde. El autor advierte que estas mediciones se basan en una batería de pruebas pequeña (2-3 chunks por categoría) y que no sustituyen una evaluación cualitativa real.

## Requisitos de hardware

- VRAM estimada para inferencia: el build Bedrock requiere aproximadamente 14 GiB de VRAM, Tightrope 13,2 GiB y Gambit 12,6 GiB, más overhead de contexto y buffers.
- GPUs recomendadas: tarjetas con 16 GB de VRAM (RTX 4080, RTX 4090, RTX 3090, A10G) pueden ejecutar los tres builds con offloading parcial o completo. Para Gambit, una GPU con 12 GB (RTX 3060, RTX 4070) podría ser suficiente con contextos cortos.
- En CPU, se necesitan al menos 16 GB de RAM para Gambit y 18 GB para Bedrock, con rendimiento dependiente de la velocidad de memoria.
- Opciones de despliegue: compatible con llama.cpp, Ollama, LM Studio y cualquier motor que soporte GGUF. No se menciona compatibilidad con vLLM o TGI en la información proporcionada.
- Latencia y throughput: no disponibles en la documentación del autor.

## Comparativa con modelos similares

Dado que este repositorio es una cuantización del modelo Qwen3.8-27B, la comparativa se realiza contra el modelo base y alternativas de tamaño similar en formato GGUF. Los datos de especificaciones de los modelos comparados provienen de conocimiento general, no de la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3B | no disponible | Apache-2.0 | safetensors | Modelo original, arquitectura híbrida con SSM y MTP |
| Qwen3.8-27B-Calibrated (este repo) | 27,3B | no disponible | Apache-2.0 | GGUF | Cuantizaciones calibradas con divergencia KL |
| Qwen2.5-32B-Instruct | 32B | 128k | Apache-2.0 | safetensors, GGUF | Alternativa de tamaño similar, arquitectura transformer clásica |
| Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 License | safetensors, GGUF | Mucho menor, adecuado para hardware limitado, pero con menor capacidad |

La principal diferencia frente a Qwen2.5-32B es la arquitectura híbrida con SSM y el bloque MTP, que puede ofrecer ventajas en eficiencia de decodificación. La licencia Apache-2.0 es idéntica, lo que facilita el uso comercial.

## Limitaciones y advertencias

- El autor no ha realizado pruebas cualitativas manuales sobre tareas reales; todas las métricas son mediciones de divergencia KL contra el baseline Q8_0, no evaluaciones de calidad de salida.
- La batería de pruebas utilizada es pequeña (2-3 chunks por categoría), lo que limita la fiabilidad de las conclusiones en casos límite.
- El bloque MTP (decodificación especulativa) tiene poca o ninguna cobertura de imatrix, por lo que su calidad de cuantización es menos informada que el resto del modelo. En los niveles más agresivos, se fijó a un nivel más seguro para evitar fallos.
- La categoría "toolcalling" es la más volátil y presenta la distribución de error más amplia. Si la precisión en llamadas a funciones es crítica, se recomienda usar el build Bedrock y validar exhaustivamente.
- La comparación se realiza contra la versión Q8_0 del modelo base, no contra los pesos originales en FP16/BF16, por lo que la divergencia absoluta respecto al modelo original podría ser ligeramente mayor.
- No se especifica la longitud de contexto soportada ni los idiomas exactos, aunque Qwen suele ser multilingüe; estos datos deben consultarse en la documentación del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/enginetown/Qwen3.8-27B-Calibrated
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
