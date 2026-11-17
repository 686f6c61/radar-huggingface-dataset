# shotaro-gond0/qwen3.5-0.8b-rag-sft002

## Resumen

`qwen3.5-0.8b-rag-sft002` es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario shotaro-gond0 en el contexto del curso "LLM講座2 2026" (asignatura final). El modelo está especializado en responder preguntas cortas en japonés cuando se le proporciona contexto de recuperación (RAG), es decir, se le presenta un fragmento documental junto con la pregunta y devuelve una respuesta breve extraída o sintetizada del contexto.

Se trata de un modelo denso de aproximadamente 873 millones de parámetros (0,8B), con la misma arquitectura que el modelo base Qwen3.5-0.8B, sobre el que se aplicó un entrenamiento LoRA (r=16, alpha=32) que posteriormente se fusionó con los pesos originales. El resultado es un checkpoint con estructura idéntica al original pero con comportamiento adaptado a la tarea de question answering sobre contexto recuperado.

Su relevancia es acotada: es un experimento académico de bajo coste computacional, con solo 17 descargas y sin benchmarks publicados, pero resulta útil como ejemplo de adaptación de un modelo pequeño a un dominio concreto (QA en japonés con RAG) y como base para prototipos de búsqueda aumentada en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (herencia de Qwen3.5-0.8B; detalles no disponibles) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del Qwen3.5-0.8B original, un transformer denso de aproximadamente 873 millones de parámetros. El ajuste se realizó mediante LoRA con rango 16 y alpha 32, aplicado sobre los pesos base y posteriormente fusionado, de modo que el checkpoint final no requiere adaptadores separados y su estructura es idéntica a la del modelo original.

El entrenamiento se llevó a cabo con 2.035 ejemplos durante una única época, con learning rate 1e-4, acumulación de gradientes de 8 y semilla 42. Los datos provienen de tres fuentes: JSQuAD y JGLUE (CC BY-SA 4.0, filtrados y reformateados), JEMHopQA (CC BY-SA 4.0, con repetición ×3 para equilibrar su peso) y un conjunto de chunks derivados de Wikipedia en japonés (CC BY-SA 4.0) que se incluyen como contexto de recuperación en las entradas. El formato de entrenamiento es de respuesta corta con contexto de búsqueda, lo que orienta al modelo hacia la extracción de respuestas a partir de pasajes. No se documenta el uso de RLHF, DPO ni otras etapas de alineación posteriores al SFT.

## Capacidades

- Generación de respuestas cortas en japonés a partir de un contexto documental proporcionado en el prompt (formato RAG).
- Extracción de respuestas a preguntas factuales sobre pasajes de Wikipedia en japonés y datasets de QA como JSQuAD y JEMHopQA.
- Comprensión de contexto multi-fragmento, ya que el entrenamiento incluye chunks de recuperación como parte de la entrada.
- Capacidades heredadas del modelo base Qwen3.5-0.8B (generación de texto general, razonamiento básico), aunque el ajuste está orientado a la tarea de QA corto y puede degradar el comportamiento conversacional general.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- **Sistemas de pregunta-respuesta sobre documentación interna en japonés**: el modelo recibe el fragmento recuperado por un buscador vectorial y devuelve una respuesta breve; su tamaño de 0,8B permite desplegarlo en CPU o GPU de gama baja para prototipos.
- **Prototipado rápido de pipelines RAG**: al estar entrenado explícitamente con contexto de recuperación como entrada, sirve para validar la cadena retriever-generator antes de escalar a modelos mayores.
- **Asistente de consulta sobre Wikipedia japonesa**: dado un pasaje de Wikipedia y una pregunta, el modelo extrae la respuesta; útil para demos educativas o herramientas de consulta acotada.
- **Evaluación de estrategias de chunking y recuperación**: al ser un modelo pequeño y especializado en respuestas cortas, permite medir de forma económica el impacto de distintas configuraciones del retriever sobre la calidad de la respuesta.
- **Entornos con restricciones de hardware**: con 873M de parámetros, puede ejecutarse en GPUs consumer de gama media o incluso en CPU para inferencia por lotes de baja latencia.
- **Base para nuevos ajustes en dominio japonés**: al estar bajo Apache-2.0 y con pesos safetensors estándar, puede reutilizarse como punto de partida para SFT adicional en nichos concretos (soporte técnico, FAQ, documentación legal).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB con contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB para pesos, más overhead.
- VRAM estimada en cuantización de 4 bits: en torno a 0,5 GB para pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (RTX 3050, RTX 4060, T4); para cuantización 4/8 bits, GPUs integradas o incluso CPU son viables.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs dedicadas modernas, y en muchas integradas con cuantización.
- Opciones de despliegue: al publicarse solo en safetensors, se puede servir con vLLM, TGI o transformers; para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, tarea no documentada por el autor.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| qwen3.5-0.8b-rag-sft002 | 873M | no disponible | Apache-2.0 | QA corto en japonés con RAG |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | Apache-2.0 | Modelo generalista multilingüe |
| Modelos QA japoneses de tamaño similar | no disponible | no disponible | variable | QA extractivo/generativo en japonés |

La comparación cuantitativa con alternativas no está disponible al no haberse publicado benchmarks del modelo ajustado. Frente a su modelo base, la diferencia principal es la especialización en respuestas cortas con contexto de recuperación, a costa de un posible deterioro en generación abierta y conversación general.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en japonés; su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- El ajuste se realizó con solo 2.035 ejemplos y una época, lo que limita la robustez y aumenta el riesgo de sobreajuste a los formatos de JSQuAD, JEMHopQA y Wikipedia.
- Riesgo de alucinación: aunque está orientado a responder a partir del contexto, no se documenta ningún mecanismo de abstención ni de verificación de fidelidad al pasaje.
- No se documentan evaluaciones de sesgo, seguridad ni toxicidad; al derivar de un modelo base no auditado en este checkpoint, estos riesgos se heredan sin cuantificar.
- La longitud de contexto no está especificada, lo que impide planificar con precisión el tamaño máximo de los fragmentos de recuperación.
- El modelo no incluye adaptadores LoRA separados (fueron fusionados), por lo que no es posible desactivar el ajuste sin volver al modelo base.
- Licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento son CC BY-SA 4.0, lo que puede introducir obligaciones de atribución y compartir-igual sobre obras derivadas de esos datos; conviene revisar este punto antes de un despliegue comercial.
- Sin benchmarks publicados ni métricas de latencia, no es recomendable como componente crítico en producción sin una evaluación propia previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shotaro-gond0/qwen3.5-0.8b-rag-sft002
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JGLUE (incluye JSQuAD): https://github.com/yahoojapan/JGLUE
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
