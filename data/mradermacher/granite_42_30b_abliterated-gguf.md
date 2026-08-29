# mradermacher/Granite_42_30b_Abliterated-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `ChonkE/Granite_42_30b_Abliterated`, una versión "abliterated" (sin censura) de un modelo de la familia IBM Granite 4.1 con aproximadamente 29,3 mil millones de parámetros. El autor, mradermacher (de nethype GmbH), ha generado archivos GGUF estáticos en varios niveles de cuantización para permitir su ejecución en hardware de consumo y en entornos con recursos limitados. El modelo base fue modificado para eliminar las restricciones de contenido habituales, lo que lo hace adecuado para tareas de generación creativa sin filtros, aunque con los riesgos asociados. La licencia MIT permite uso comercial sin restricciones, y al estar en formato GGUF, puede ejecutarse con herramientas como llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia IBM Granite 4.1, no confirmado) |
| Parametros totales | 29.276.770.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `ChonkE/Granite_42_30b_Abliterated` es una adaptacion de un modelo de la familia IBM Granite 4.1, que segun la documentacion publica de Unsloth es un modelo denso de contexto largo entrenado con 15 billones de tokens. La version "abliterated" elimina las capas de rechazo de contenido, permitiendo respuestas sin censura. El proceso de cuantizacion realizado por mradermacher convierte los pesos originales (probablemente en safetensors) a formato GGUF mediante cuantizacion estatica, sin usar imatrix ni pesos ponderados. No se dispone de informacion detallada sobre el dataset de entrenamiento ni sobre tecnicas de alineacion (RLHF, DPO) aplicadas al modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno (etiqueta "conversational").
- Razonamiento y generacion de codigo, heredados de la familia Granite 4.1 (segun referencias externas, aunque no confirmado para esta version).
- Soporte de tool calling y funciones, segun la documentacion de Granite 4.1 (no verificado en esta cuantizacion).
- Capacidad multilingue limitada: solo ingles declarado.
- Al ser "abliterated", no aplica filtros de contenido, lo que permite generar respuestas sobre temas sensibles o explicitos.

## Casos de uso

- Despliegue local en equipos sin GPU dedicada: gracias a las cuantizaciones Q2_K (11 GB) y Q3_K_S (12,8 GB), el modelo puede ejecutarse en CPUs con suficiente RAM, usando llama.cpp o Ollama, para tareas de generacion de texto sin conexion.
- Prototipado rapido de chatbots sin restricciones: al no tener filtros de contenido, es util para experimentar con respuestas creativas o en dominios donde la censura limita la utilidad (por ejemplo, escritura de ficcion adulta o exploracion de temas controvertidos).
- Generacion de codigo en entornos aislados: con la cuantizacion Q4_K_S (16,8 GB) cabe en una RTX 4090 (24 GB) y puede usarse para asistencia de programacion en pipelines de CI/CD, aunque se recomienda validar las salidas.
- Investigacion sobre alineacion y seguridad: al comparar el comportamiento de un modelo abliterated frente a su version original, se pueden estudiar los efectos de la eliminacion de capas de rechazo.
- Creacion de contenido creativo sin censura: para escritores o generadores de guiones que necesitan explorar temas sin restricciones, el modelo puede producir narrativas explicitas o controvertidas.
- Evaluacion de cuantizaciones: al disponer de multiples niveles (Q2 a Q8), se puede medir el impacto de la cuantizacion en la calidad de las respuestas para una tarea especifica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas para esta cuantizacion especifica.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano del archivo GGUF):
  - Q2_K: 11,0 GB (cabe en GPUs de 12 GB como RTX 3060, pero con margen justo)
  - Q3_K_S: 12,8 GB (requiere GPU de 16 GB o mas)
  - Q3_K_M: 14,2 GB (idem)
  - Q4_K_S: 16,8 GB (recomendado para RTX 4090, A100 40GB, etc.)
  - Q6_K: 24,1 GB (requiere GPU de 24 GB o mas, como RTX 3090/4090)
  - Q8_0: 31,2 GB (necesita GPU profesional como A100 40GB o H100)
- Para inferencia en CPU, se necesitan al menos 16-32 GB de RAM, dependiendo de la cuantizacion.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. No se recomienda vLLM para GGUF (aunque soporta algunos formatos, esta optimizado para safetensors).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion. En una RTX 4090 con Q4_K_S, se puede esperar una velocidad de generacion de 20-40 tokens/s, pero no es un dato oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Granite_42_30b_Abliterated (este) | 29,3B | no disponible | MIT | GGUF | Abliterated, sin censura |
| mradermacher/granite-4.1-30b-abliterated-GGUF | ~30B | no disponible | Apache-2.0 | GGUF | Version similar, licencia Apache |
| mradermacher/granite-4.1-30b-abliterated-i1-GGUF | ~30B | no disponible | Apache-2.0 | GGUF | Con imatrix, posible mejor calidad |
| IBM Granite 4.1 30B (original) | ~30B | largo (no especificado) | Apache-2.0 | safetensors | Modelo base con censura |

No se dispone de datos de rendimiento comparativo. La principal diferencia entre las versiones abliterated es la licencia (MIT vs Apache-2.0) y la presencia de cuantizaciones imatrix en algunos repositorios.

## Limitaciones y advertencias

- Al ser un modelo "abliterated", puede generar contenido ofensivo, explicito o peligroso sin restricciones. No es apto para aplicaciones de produccion donde se requiera moderacion de contenido.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos o datos, especialmente en tareas de razonamiento o codigo. Se recomienda validar las salidas.
- Solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- La longitud de contexto no esta documentada en esta cuantizacion; se desconoce si el modelo base soporta ventanas largas (128K o mas) y si la cuantizacion afecta a esa capacidad.
- La licencia MIT permite uso comercial, pero el usuario es responsable del contenido generado y de cumplir las leyes aplicables.
- Las cuantizaciones de baja precision (Q2_K, Q3_K) pueden degradar significativamente la calidad de las respuestas; se recomienda usar Q4_K_S o superior para tareas serias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Granite_42_30b_Abliterated-GGUF
- Modelo base (ChonkE): https://huggingface.co/ChonkE/Granite_42_30b_Abliterated
- Version similar con imatrix: https://huggingface.co/mradermacher/granite-4.1-30b-abliterated-i1-GGUF
- Version similar sin imatrix: https://huggingface.co/mradermacher/granite-4.1-30b-abliterated-GGUF
- Documentacion de IBM Granite 4.1 (Unsloth): https://unsloth.ai/docs/models/ibm-granite-4.1
