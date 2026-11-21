# mradermacher/PhantomReasoning-Qwen3-0.6B-gsminf-GGUF

## Resumen

PhantomReasoning-Qwen3-0.6B-gsminf-GGUF es la version cuantizada en formato GGUF del modelo kilian-group/PhantomReasoning-Qwen3-0.6B-gsminf, un ajuste fino del Qwen3-0.6B de Alibaba orientado a razonamiento multi-salto y a tareas de tipo GSM-Infinite (problemas matematicos de complejidad creciente). El autor de la cuantizacion es mradermacher, un conocido publicador de versiones GGUF de modelos open source, que distribuye los pesos en una docena de niveles de cuantizacion (desde Q2_K de 0,4 GB hasta f16 de 1,6 GB).

El modelo base parte de la arquitectura Qwen3, un transformer denso de aproximadamente 751,6 millones de parametros (segun los pesos en safetensors del repositorio), entrenado con GRPO (Group Relative Policy Optimization) mediante la libreria TRL. El objetivo del ajuste es reforzar la capacidad de razonamiento paso a paso y de encadenar inferencias sobre problemas de matematicas y logica, una linea de trabajo que ha ganado interes por la eficiencia de los modelos pequenos con razonamiento explicito.

La relevancia practica de esta ficha radica en que permite ejecutar un modelo de razonamiento en hardware muy modesto: con cuantizaciones Q4 de 0,6 GB puede correr en CPU, en GPUs de gama baja o incluso en dispositivos embebidos, lo que lo hace util para prototipado, experimentacion con tecnicas de RL y despliegues con restricciones severas de memoria. No obstante, la informacion publica sobre el modelo es escasa: no hay model card detallada del autor original, no se han publicado benchmarks y el idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3) |
| Parametros totales | 751.632.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Qwen3-0.6B, un transformer denso de la familia Qwen3 con aproximadamente 751 millones de parametros. El entrenamiento del ajuste se realizo con GRPO (Group Relative Policy Optimization) usando la libreria TRL, una tecnica de aprendizaje por refuerzo que compara grupos de respuestas generadas para optimizar la politica del modelo sin necesidad de un modelo critico separado. El dataset empleado es kilian-group/phantom-reasoning, orientado a razonamiento multi-salto y a problemas de tipo GSM-Infinite, una variante de GSM8K con dificultad escalable.

No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, la longitud de contexto original ni si hubo fases adicionales de SFT o DPO. Tampoco se documentan innovaciones tecnicas especificas del ajuste (por ejemplo, decodificacion especulativa o modos de pensamiento explicitos). La unica innovacion reseñable es el propio pipeline de cuantizacion de mradermacher, que genera variantes estaticas e imatrix (estas ultimas en el repositorio -i1-GGUF).

## Capacidades

- Generacion de texto en ingles con enfasis en razonamiento paso a paso.
- Razonamiento matematico multi-salto, entrenado especificamente sobre problemas de tipo GSM-Infinite.
- Razonamiento encadenado (multi-hop reasoning) segun las etiquetas del repositorio.
- Conversacion multi-turno (etiqueta `conversational` en Hugging Face).
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modos de pensamiento explicitos.
- Capacidades multilingues limitadas al ingles declarado; no hay evidencia de soporte de castellano.

## Casos de uso

- Prototipado de razonamiento matematico en local: con la cuantizacion Q4_K_M (0,6 GB) se puede ejecutar en un portatil sin GPU para probar pipelines de resolucion de problemas aritmeticos de dificultad escalable, gracias al ajuste sobre GSM-Infinite.
- Experimentacion con RL y GRPO: investigadores que quieran reproducir o extender el pipeline de entrenamiento pueden usar el modelo base (kilian-group/PhantomReasoning-Qwen3-0.6B-gsminf) y las cuantizaciones para evaluar el efecto del ajuste con refuerzo en tareas de razonamiento.
- Despliegue en dispositivos con memoria limitada: las variantes Q2_K (0,4 GB) y Q3_K_S (0,5 GB) permiten inferencia en Raspberry Pi, moviles de gama alta o contenedores con poca RAM, util para demos educativas de razonamiento.
- Generacion de cadenas de razonamiento para destilacion: el modelo puede producir trazas de razonamiento paso a paso que sirvan como datos de entrenamiento para modelos mayores o para tecnicas de distillation.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 niveles de cuantizacion, lo que permite medir la degradacion de calidad en tareas de razonamiento segun el nivel de compresion (util para estudiar el trade-off tamano/calidad).
- Chatbot educativo de matematicas en ingles: con la cuantizacion Q5_K_M o Q6_K (0,7 GB) se puede integrar en un asistente conversacional que explique la resolucion de problemas aritmeticos, siempre que el usuario opere en ingles.
- Inferencia en CPU con llama.cpp u Ollama: al ser GGUF, se integra directamente en herramientas de inferencia local sin necesidad de GPU, adecuado para entornos de desarrollo sin acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB para Q2_K, 0,7 GB para Q4_K_M, 1,0 GB para Q8_0 y 1,8 GB para f16 (incluyendo overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060, etc.); tambien funciona en A100/H100 aunque no aprovecha su capacidad.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en iGPU (Intel Iris Xe, AMD Radeon integrada) con cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. El modelo base (safetensors) puede servirse con vLLM o TGI, aunque el tamano hace que el overhead sea desproporcionado.
- Latencia y throughput estimados: no disponibles. Por el tamano (751 M parametros), se espera una latencia de decenas de milisegundos por token en GPU consumer y de cientos de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PhantomReasoning-Qwen3-0.6B-gsminf (este) | 751,6 M | no disponible | Apache 2.0 | GGUF / safetensors | Ajuste GRPO para razonamiento matematico multi-salto |
| Qwen3-0.6B (base) | ~600 M | no disponible | Apache 2.0 | safetensors | Modelo original sin ajuste de razonamiento |
| Qwen2.5-0.5B-Instruct | ~500 M | 32.768 tokens | Apache 2.0 | safetensors / GGUF | Alternativa generalista de tamano similar, sin ajuste especifico de razonamiento |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1.500 M | 32.768 tokens | MIT | safetensors / GGUF | Modelo de razonamiento destilado, mayor tamano y contexto documentado |

La comparativa se limita a modelos de la misma familia o tamano porque no hay benchmarks publicados del modelo evaluado; las diferencias de rendimiento no pueden cuantificarse con los datos disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al derivar de Qwen3 hereda los sesgos del corpus de entrenamiento original, no auditados en esta ficha.
- Riesgo de alucinacion: alto en modelos de este tamano, especialmente en problemas matematicos fuera de la distribucion de GSM-Infinite; no hay evaluaciones publicadas que lo cuantifiquen.
- Limitaciones de contexto o idioma: solo se declara ingles; no hay informacion sobre la longitud de contexto soportada, lo que impide garantizar conversaciones largas o documentos extensos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3 y del dataset kilian-group/phantom-reasoning antes de un despliegue en produccion.
- Caveat para produccion: la model card del autor original no esta disponible en la informacion proporcionada; no se conocen detalles de entrenamiento, evaluacion ni limitaciones declaradas por el creador. El uso en produccion sin benchmarks ni auditoria previa es arriesgado.
- El repositorio tiene 0 likes y 908 descargas en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/PhantomReasoning-Qwen3-0.6B-gsminf-GGUF
- Modelo base: https://huggingface.co/kilian-group/PhantomReasoning-Qwen3-0.6B-gsminf
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/PhantomReasoning-Qwen3-0.6B-gsminf-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#PhantomReasoning-Qwen3-0.6B-gsminf-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/kilian-group/phantom-reasoning
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
