# Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen021

## Resumen
Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen021 es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario Ch1c4g0 en el contexto del curso «LLM講座2 2026» del laboratorio Matsuo-Iwasawa de la Universidad de Tokio. El modelo está especializado en una tarea concreta de generación de respuestas para un sistema RAG (retrieval-augmented generation) sobre Wikipedia en japonés: recibe una pregunta junto con cinco fragmentos de documentación recuperados y devuelve un JSON con la respuesta y el identificador del fragmento que la respalda.

El modelo resuelve el problema de generar respuestas extractivas y trazables (con cita de la fuente) en un pipeline de question answering sobre Wikipedia japonesa. Es relevante como ejemplo de ajuste fino eficiente de un modelo pequeño (873 millones de parámetros) para una tarea estructurada, entrenado íntegramente en Google Colab sin APIs externas ni otros LLM. La arquitectura subyacente es la del Qwen3.5-0.8B original, de la que no se detallan características específicas en la información disponible.

El modelo se distribuye con licencia Apache 2.0, está etiquetado únicamente para japonés y su formato de pesos es safetensors. No cuenta con descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen/Qwen3.5-0.8B) |
| Parametros totales | 873.438.784 |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`) y aplica un ajuste fino con LoRA de rango r=16, alpha=32 y dropout=0.05 sobre las capas lineales del modelo de lenguaje (down_proj, gate_proj, in_proj_a, in_proj_b, in_proj_qkv, in_proj_z, k_proj, o_proj, out_proj, q_proj, up_proj, v_proj). El entrenamiento se realizó durante 2 épocas y, posteriormente, los deltas de LoRA se fusionaron en los pesos originales, de modo que la estructura, configuración, tokenizador, chat template y nombres/formas/tipos de los pesos coinciden exactamente con el modelo base.

El entrenamiento se realizó sobre un total de 1.244 ejemplos que combinan tres fuentes: JEMHopQA (train, ver1.2, CC BY-SA 4.0), una selección aleatoria de 1.000 preguntas de JSQuAD (train, v1.3, JGLUE, CC BY-SA 4.0) y 1.710 preguntas construidas a partir de auto-wiki-qa (CC BY-SA 4.0) mediante reglas de sustitución de cadenas para generar preguntas de dos saltos. Además, este modelo continúa el ajuste de una versión previa (gen015) con una tasa de aprendizaje de 5e-05, incorporando 700 ejemplos muestreados de la versión anterior y nuevas preguntas conectadas y de JEMHopQA que no se usaron en gen015. La tarea de entrenamiento consiste en recibir una pregunta y cinco documentos recuperados y emitir `{"answer": ..., "chunk_id": ...}`. Todo el proceso se ejecutó en Google Colab sin APIs externas ni otros LLM.

## Capacidades
- Generación de respuestas extractivas en japonés a partir de contexto documental recuperado.
- Salida estructurada en JSON con dos campos: `answer` (respuesta) y `chunk_id` (identificador del fragmento que respalda la respuesta).
- Question answering con cinco fragmentos de contexto como entrada.
- Trazabilidad de la respuesta mediante la cita del fragmento fuente.
- Manejo de preguntas de múltiples saltos (multi-hop) construidas a partir de auto-wiki-qa.
- Especialización en dominio Wikipedia en japonés.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso
- Generación de respuestas en un pipeline RAG sobre Wikipedia japonesa: el modelo recibe la pregunta del usuario y los cinco fragmentos recuperados por el retriever y devuelve la respuesta junto con el `chunk_id` de la fuente, lo que permite mostrar citas verificables al usuario.
- Evaluación de sistemas de recuperación: al devolver el identificador del fragmento que respalda la respuesta, se puede medir la calidad del retriever comprobando si el `chunk_id` predicho coincide con el fragmento que contiene la respuesta correcta.
- Question answering de dos saltos: el modelo fue entrenado específicamente con preguntas multi-hop generadas a partir de auto-wiki-qa, por lo que es adecuado para consultas que requieren combinar información de dos artículos distintos.
- Prototipado académico y docente: al ser un ajuste fino de 873 millones de parámetros entrenado en Colab, sirve como referencia reproducible para cursos y talleres sobre ajuste fino con LoRA y pipelines RAG.
- Asistentes de consulta documental interna: el formato de salida JSON con cita de fuente encaja en aplicaciones donde se exige que cada respuesta esté anclada a un documento concreto, aunque el dominio entrenado es Wikipedia y no documentación corporativa.
- Extracción de respuestas con cita en flujos automatizados: la salida estructurada permite integrar el modelo en pipelines que parsean el JSON y validan la presencia del `chunk_id` antes de publicar la respuesta.
- Generación de datasets de evaluación RAG: el modelo puede usarse para producir respuestas de referencia con cita sobre un corpus japonés, siempre que el contexto se limite a cinco fragmentos como en el entrenamiento.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Con 873 millones de parámetros y pesos en safetensors (repo de 1,8 GB), una estimación orientativa en fp16 sería de aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y KV cache; en cuantizaciones de 8 o 4 bits el requisito sería menor, pero no se documentan cuantizaciones publicadas.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo es compatible con GPUs de consumo, aunque no se especifican modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí por el tamaño de parámetros, pero no se confirma en la documentación disponible.
- Opciones de despliegue: no se documentan explícitamente. Al mantener la estructura y el tokenizador del modelo base Qwen3.5-0.8B, sería desplegable con las herramientas compatibles con dicho modelo base, pero no se confirma en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Especialización |
|---|---|---|---|---|---|
| Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen021 | 873.438.784 | no disponible | ja | Apache 2.0 | QA extractivo RAG sobre Wikipedia japonesa |
| Qwen/Qwen3.5-0.8B (modelo base) | no disponible | no disponible | no disponible | Apache 2.0 | Modelo generalista |
| Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen015 | no disponible | no disponible | ja | Apache 2.0 | QA RAG (versión previa, mismo pipeline) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias
- Modelo altamente especializado: está entrenado exclusivamente para la tarea de responder preguntas con cinco fragmentos de contexto y devolver un JSON con `answer` y `chunk_id`; su uso fuera de ese formato o dominio puede degradar gravemente la calidad.
- Idioma limitado al japonés: la etiqueta de idioma es únicamente `ja` y los datos de entrenamiento son íntegramente japoneses, por lo que no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Dominio restringido a Wikipedia: el entrenamiento se basa en JEMHopQA, JSQuAD y auto-wiki-qa, todos derivados de Wikipedia japonesa; el rendimiento en documentación corporativa, técnica o de otros dominios no está validado.
- Riesgo de alucinación: aunque el modelo cita un `chunk_id`, no hay garantía de que la respuesta esté efectivamente respaldada por el fragmento citado; el JSON de salida puede contener un identificador válido con una respuesta no sustentada.
- Dependencia del retriever: si los cinco fragmentos recuperados no contienen la respuesta, el modelo no dispone de mecanismo documentado para indicar abstención.
- Sin datos de benchmarks: no se han publicado evaluaciones que permitan estimar su calidad frente a alternativas.
- Sin datos de sesgos: no se documentan análisis de sesgo ni evaluaciones de seguridad.
- Licencia Apache 2.0: permite uso comercial, pero los datos de entrenamiento derivados de JEMHopQA, JSQuAD y auto-wiki-qa están bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas de esos datos; conviene revisar la compatibilidad antes de un uso comercial.
- Modelo de investigación: creado como trabajo final de un curso, con 0 descargas y 0 valoraciones, sin mantenimiento ni soporte documentado.
- Entrenado en Google Colab: el volumen de datos (1.244 ejemplos) y el entorno limitan la robustez esperable en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen021
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Versión previa (gen015): https://huggingface.co/Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen015
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset JGLUE (JSQuAD): https://github.com/yahoojapan/JGLUE
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Dataset del curso (chunks de Wikipedia japonesa): https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Wikipedia en japonés: https://ja.wikipedia.org/
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
