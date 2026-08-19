# Franz-Lynchtek/ginette-qwen3-4b-v1

## Resumen

ginette-qwen3-4b-v1 es un modelo de lenguaje afinado (fine-tune) sobre la base Qwen3-4B-Instruct-2507, publicado por el usuario Franz-Lynchtek en HuggingFace. El modelo se distribuye exclusivamente en formato GGUF cuantizado (Q4_K_M), preparado para su uso con llama.cpp y compatible con Ollama mediante un Modelfile incluido. El proceso de afinado y conversión se realizó con la librería Unsloth, que acelera el entrenamiento y la conversión de pesos.

Este modelo resulta relevante porque aprovecha la arquitectura densa de Qwen3-4B, una de las variantes más eficientes de la familia Qwen3, y la empaqueta en un formato ligero y portable para inferencia local en CPU y GPU de consumo. Al estar basado en Qwen3-Instruct-2507, hereda capacidades de razonamiento, generación de texto y soporte de herramientas, aunque el autor no ha publicado detalles sobre el dataset de afinado ni sobre el propósito específico del fine-tune.

El repositorio contiene un único archivo de pesos (`qwen3-4b-instruct-2507.Q4_K_M.gguf`) de aproximadamente 10,6 GB, lo que sugiere que el modelo está pensado para despliegue en entornos con recursos moderados. No se dispone de información sobre la licencia, los idiomas soportados ni los datos de entrenamiento adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-4B: 32 768 tokens, no confirmado) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors no incluido en el repo) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B-Instruct-2507, una variante densa de la familia Qwen3 publicada por Alibaba Cloud. Qwen3 emplea una arquitectura Transformer estándar con normalización QKV, atención con sesgo de atención (attention bias) y un vocabulario ampliado de 151 936 tokens. La versión Instruct-2507 incorpora mejoras sobre la versión original, incluyendo un entrenamiento con datos de mayor calidad y un ajuste fino supervisado más extenso.

El fine-tune realizado por Franz-Lynchtek se llevó a cabo con Unsloth, una librería que optimiza el entrenamiento mediante kernels personalizados y técnicas de reducción de memoria. El modelo resultante se convirtió a formato GGUF con cuantización Q4_K_M, que equilibra tamaño y calidad de salida. No se ha publicado información sobre el dataset de afinado, el número de tokens de entrenamiento, ni si se emplearon técnicas como RLHF o DPO. El autor tampoco especifica si el fine-tune fue de tipo instructivo, conversacional o de dominio específico.

## Capacidades

- Generación de texto conversacional: al estar basado en Qwen3-Instruct-2507, mantiene las capacidades de diálogo multi-turno y seguimiento de instrucciones del modelo base.
- Razonamiento y resolución de problemas: Qwen3-4B-Instruct-2507 incluye capacidades de razonamiento explícito (modo thinking) que pueden activarse o desactivarse según el prompt.
- Soporte de tool calling y function calling: heredado de Qwen3-Instruct-2507, permite la integración con APIs y herramientas externas mediante el formato de chat de Qwen.
- Capacidades multilingües: Qwen3 está entrenado en más de 30 idiomas, aunque el fine-tune específico podría alterar este comportamiento. No se dispone de confirmación para este modelo concreto.
- Compatibilidad con llama.cpp y Ollama: el formato GGUF permite ejecución en CPU y GPU con las herramientas estándar del ecosistema.
- Soporte de plantillas Jinja: el modelo incluye plantillas de chat en formato Jinja, lo que facilita su uso con llama-cli y otros frontends.

## Casos de uso

- Asistente conversacional local: gracias a su tamaño de 4 B y cuantización Q4_K_M, puede ejecutarse en una GPU de consumo (por ejemplo, RTX 3060 con 12 GB) o incluso en CPU con suficiente RAM, ofreciendo respuestas en tiempo real sin conexión a internet.
- Chatbot de atención al cliente: el modelo puede gestionar conversaciones multi-turno con contexto moderado (hasta 32 768 tokens si se mantiene la ventana del base), adecuado para resolver consultas frecuentes y derivar casos complejos a agentes humanos.
- Generación de código asistida: Qwen3-4B-Instruct-2507 tiene capacidades de generación de código, por lo que este fine-tune podría usarse como autocompletado o asistente de programación en entornos sin conexión, siempre que se valide la calidad tras el fine-tune.
- Prototipado rápido de agentes: el soporte de tool calling permite construir agentes simples que consulten APIs, bases de datos o ejecuten comandos, ideal para pruebas de concepto en entornos de desarrollo.
- Análisis de texto y resumen: el modelo puede resumir documentos, extraer entidades o clasificar contenido, aunque la ventana de contexto limita su uso a textos de extensión media.
- Educación y tutoría: como asistente de estudio, puede explicar conceptos, resolver dudas y generar ejercicios prácticos, siendo una alternativa gratuita y privada a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este modelo específico en la información disponible. El autor no incluye métricas de evaluación en la model card ni en el repositorio. Dado que se trata de un fine-tune sobre Qwen3-4B-Instruct-2507, el rendimiento podría diferir del modelo base, pero no se dispone de datos para confirmarlo.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, el archivo GGUF pesa aproximadamente 2,5-3 GB (el repo total es 10,6 GB, pero incluye otros archivos como el Modelfile y posiblemente metadatos). Para una ejecución cómoda en GPU, se recomienda al menos 6 GB de VRAM.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 (12 GB) o superiores. En GPU con menos VRAM (4 GB) podría funcionar con offloading parcial a CPU.
- Compatibilidad con CPU: el modelo puede ejecutarse íntegramente en CPU con llama.cpp, requiriendo unos 8-12 GB de RAM y ofreciendo una latencia de varios segundos por token según el hardware.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (incluye Modelfile), y cualquier framework compatible con GGUF (llama-cpp-python, text-generation-webui, etc.).
- Latencia y throughput estimados: no se dispone de mediciones publicadas. En una RTX 3060, un modelo de 4 B cuantizado Q4_K_M suele generar entre 30 y 60 tokens por segundo, pero esto depende del hardware y la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ginette-qwen3-4b-v1 | 4,02 B | No disponible | No disponible | GGUF (Q4_K_M) | Fine-tune de Qwen3-4B-Instruct-2507, sin datos de evaluación |
| Qwen3-4B-Instruct-2507 (base) | 4,02 B | 32 768 tokens | Apache 2.0 | safetensors, GGUF | Modelo oficial de Alibaba, con benchmarks publicados |
| Llama-3.2-3B-Instruct | 3,21 B | 128 000 tokens | Llama 3.2 Community License | safetensors, GGUF | Alternativa de Meta, con licencia permisiva pero con restricciones para uso comercial |
| Phi-3.5-mini-instruct | 3,82 B | 128 000 tokens | MIT | safetensors, GGUF | Modelo de Microsoft, muy eficiente en tareas de razonamiento |

La comparación directa no es posible sin datos de rendimiento del fine-tune. El modelo base Qwen3-4B-Instruct-2507 tiene benchmarks publicados en el reporte técnico de Qwen3, pero este fine-tune podría haber alterado el comportamiento. Se recomienda evaluar el modelo en las tareas específicas de interés antes de usarlo en producción.

## Limitaciones y advertencias

- No se dispone de información sobre el dataset de afinado: el autor no detalla qué datos se usaron para el fine-tune, lo que impide conocer el dominio de especialización y los posibles sesgos introducidos.
- Licencia desconocida: al no especificarse la licencia, no es seguro su uso comercial. Se debe contactar con el autor o asumir que el modelo está protegido por derechos de autor por defecto.
- Riesgo de alucinaciones: como cualquier LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con contexto insuficiente.
- Ventana de contexto no confirmada: aunque el modelo base soporta 32 768 tokens, el fine-tune podría haber reducido este valor. No se ha verificado experimentalmente.
- Sesgos potenciales: el fine-tune puede heredar sesgos del dataset de entrenamiento, que no ha sido revelado. Se recomienda auditar el modelo antes de un despliegue público.
- Sin garantías de calidad: al tener 0 descargas y 0 likes en HuggingFace, no hay evidencia de que el modelo haya sido probado por terceros. Su rendimiento real es incierto.
- Formato único: solo se ofrece cuantización Q4_K_M, lo que limita la flexibilidad si se necesita mayor precisión (Q8, F16) o cuantizaciones más agresivas (Q2, Q3) para entornos con muy poca memoria.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Franz-Lynchtek/ginette-qwen3-4b-v1
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Reporte técnico de Qwen3 (arXiv): https://arxiv.org/abs/2505.09388
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
