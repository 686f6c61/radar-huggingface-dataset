# DexterP29/slm125LIVE-sft

## Resumen

slm125LIVE-sft es un modelo de lenguaje pequeño (SLM) de 125,8 millones de parámetros, desarrollado por el usuario DexterP29 a partir del modelo base thesreedath/slm-125m-base. Se trata de un afinado supervisado (SFT) orientado al dominio legal y financiero en inglés, con un enfoque basado en contexto del estilo RAFT (Retrieval-Augmented Fine-Tuning). El objetivo es que el modelo responda preguntas usando exclusivamente un pasaje de contexto proporcionado en el prompt, y que se niegue a contestar si la información no está presente en dicho pasaje.

El entrenamiento se realizó sobre 12.000 pares de preguntas y respuestas generados por gpt-5-mini a partir de un corpus de jurisprudencia estadounidense, informes SEC y textos web filtrados. El modelo tiene una arquitectura tipo Llama (según las etiquetas del repositorio) y soporta un formato de chat con system, user y assistant. Su ventana de contexto no se ha especificado en la información disponible. Es relevante porque ofrece una capacidad especializada en tareas legales y financieras con un tamaño muy reducido, lo que permite su despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basada en Llama (según tags del repositorio) |
| Parámetros totales | 125.848.320 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repositorio en safetensors, 0,3 GB) |
| Idiomas soportados | inglés (en) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un pequeño modelo de lenguaje (SLM) con 125,8 millones de parámetros, basado en una arquitectura tipo Llama según las etiquetas del repositorio. El autor ha realizado un fine-tuning supervisado desde el modelo base thesreedath/slm-125m-base, aplicando el método RAFT (Retrieval-Augmented Fine-Tuning). En este enfoque, cada ejemplo de entrenamiento contiene una pregunta, un pasaje de contexto y una respuesta; el modelo debe responder únicamente con información extraída del pasaje, o bien rechazar la pregunta con la frase fija `The provided context does not state this.` si la respuesta no está contenida en el contexto.

Los datos de entrenamiento constan de 12.000 pares Q&A generados por gpt-5-mini a partir de un corpus limpio de jurisprudencia de EE.UU. (case-law), informes SEC y textos web. Los datos fueron filtrados mediante verificación de evidencia verbatim, un juez LLM (gpt-5-nano), eliminación de casi duplicados y decontaminación contra los benchmarks CaseHOLD y LexGLUE. El entrenamiento se realizó durante 3 épocas en una GPU H100, con 36,9 millones de tokens vistos. La función de pérdida se aplicó solo a los tokens de respuesta. La pérdida held-out bajó de 4,3636 en el modelo base a 0,8397 en el modelo afinado.

Una particularidad técnica destacable es la corrección de los IDs de los tokens especiales: el archivo de configuración original del modelo base declaraba `bos_token_id: 1` y `eos_token_id: 2`, mientras que su tokenizer define `<|bos|>`=0, `<|eos|>`=1 y `<|pad|>`=2. El autor corrigió los IDs en este repositorio para que la generación se detenga en el token `<|eos|>` real, evitando que el modelo continúe generando hasta el límite de tokens.

## Capacidades

- Generación de respuestas en inglés a preguntas sobre el dominio legal y financiero, siempre condicionada a un pasaje de contexto.
- Capacidad de rechazo: si la información solicitada no está en el contexto, el modelo responde con `The provided context does not state this.`
- Seguimiento de instrucciones en formato chat con system, user y assistant, usando los tokens `<|bos|>`, `<|system|>`, `<|eos|>`.
- Especialización en datos de jurisprudencia estadounidense, informes SEC y corpus web legal/financiero.
- No se han documentado capacidades de tool calling, agentes, visión ni audio.
- Solo soporta inglés; no hay información sobre capacidades multilingües.

## Casos de uso

- Asistente legal de consulta rápida: el usuario introduce un fragmento de una sentencia o ley, y el modelo responde a preguntas concretas sobre ese texto, sin aportar información externa.
- Análisis de documentos financieros: a partir de un párrafo de un informe SEC, el modelo extrae datos clave como riesgos, resultados financieros o información sobre operaciones.
- Verificación de afirmaciones en contratos: dado un pasaje de un contrato, el modelo puede comprobar si una afirmación concreta está soportada por el texto.
- Chatbot de soporte interno para despachos legales: el modelo responde a preguntas frecuentes sobre normativa o procedimientos usando pasajes de una base de conocimiento interna.
- Educación legal automatizada: se presenta un fragmento de texto jurídico y el modelo genera explicaciones o respuestas a dudas específicas de alumnos.
- Automatización de lectura de jurisprudencia: el modelo puede extraer información clave de casos presentados en pasajes cortos, útil para tareas de triage documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta una pérdida held-out de 4,3636 en el modelo base y 0,8397 en el modelo afinado, pero este valor no constituye un benchmark comparable entre modelos. No existen datos de rendimiento público adicionales.

## Requisitos de hardware

- VRAM estimada: con pesos en FP16, el modelo ocupa aproximadamente 0,25 GB; con caché KV y activaciones, el consumo total en inferencia sería inferior a 1 GB. En FP32, la ocupación rondaría los 0,5 GB.
- GPU recomendada: cualquier GPU moderna es suficiente, incluyendo RTX 3060, A100, H100 o RTX 4090. También puede ejecutarse en CPU, ya que el número de parámetros es muy bajo.
- Cabe en GPU de consumo, incluso en tarjetas de hace varias generaciones.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI o scripts personalizados con HuggingFace Transformers.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Dado el tamaño, se espera una latencia baja, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|
| slm125LIVE-sft | 125,8 M | Legal/financiero, RAFT | other | HuggingFace |
| thesreedath/slm-125m-base | 125 M | Modelo base sin SFT | other | HuggingFace |

El único modelo comparable identificado en la información disponible es el modelo base thesreedath/slm-125m-base. No se dispone de otros modelos de la misma categoría con datos verificables, ni de benchmarks que permitan una comparación de rendimiento.

## Limitaciones y advertencias

- Licencia "other" no especificada: debe revisarse en el repositorio antes de cualquier uso comercial.
- El modelo solo soporta inglés, lo que limita su uso a contextos anglófonos.
- El tamaño reducido (125M) implica una capacidad limitada de razonamiento complejo y de generalización fuera del dominio entrenado.
- La estricta dependencia del contexto hace que el modelo no realice generación abierta de conocimiento; si el pasaje no contiene la información, devuelve un mensaje de rechazo fijo.
- Los datos de entrenamiento fueron generados automáticamente por gpt-5-mini, por lo que pueden contener errores, sesgos o imprecisiones no detectados.
- El modelo base hereda posibles sesgos de su pre-entrenamiento; no se han realizado evaluaciones de sesgo específicas para este modelo.
- No se han proporcionado benchmarks de seguridad, alineación ni robustez frente a prompts adversariales.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/DexterP29/slm125LIVE-sft
- Modelo base thesreedath/slm-125m-base: https://huggingface.co/thesreedath/slm-125m-base
- Perfil de GitHub del autor: https://github.com/DexterP29
- No se han encontrado papers, blogs ni demos relacionados en la búsqueda web.
