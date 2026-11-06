# m4gshm/Qwen2.5-Coder-3B-int4-sym-g128-se-awq

## Resumen

Qwen2.5-Coder-3B-int4-sym-g128-se-awq es una exportación cuantizada del modelo Qwen2.5-Coder-3B de Alibaba Qwen, publicada por el usuario m4gshm. No se trata de un modelo entrenado desde cero, sino de una conversión del checkpoint original a formato OpenVINO IR con cuantización de pesos int4 simétrica, tamaño de grupo 128, escalas activation-aware (AWQ) y estimación de escalas calibrada sobre el dataset GSM8K. El resultado es un artefacto de 1,62 GB de pesos IR (1,8 GB de repositorio) listo para inferencia en CPU y GPU Intel mediante Optimum-Intel.

El modelo base Qwen2.5-Coder-3B es un transformer decoder-only de la familia Qwen2, especializado en generación de código y texto, con licencia Apache 2.0. Esta versión cuantizada hereda esas capacidades pero las orienta a despliegues en hardware Intel sin GPU dedicada, un escenario habitual en estaciones de trabajo, portátiles y entornos de borde donde no se dispone de VRAM suficiente para el modelo en FP16.

La relevancia de esta ficha es doble: por un lado documenta una ruta de despliegue concreta (OpenVINO + NNCF + Optimum-Intel) para un modelo de código pequeño; por otro, advierte de que el autor no ha publicado la model card del modelo base ni resultados de benchmarks propios, por lo que las capacidades descritas se corresponden con las del Qwen2.5-Coder-3B original, no con una evaluación independiente de esta cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parametros totales | 3B (modelo base Qwen2.5-Coder-3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-3B soporta 32 768 tokens, segun la documentacion oficial de Qwen) |
| Tipos de cuantizacion | pesos int4 simetrico, group_size=128, AWQ con estimacion de escalas, calibracion sobre GSM8K |
| Idiomas soportados | no disponible en la model card de esta exportacion (el modelo base es multilingue, con enfasis en ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (`openvino_model.xml` + `openvino_model.bin`), tokenizer y detokenizer OpenVINO, `tokenizer.json`, `chat_template.jinja` |
| Tamano de pesos | 1,62 GB (IR), 1,8 GB de repositorio |
| Libreria | openvino (Optimum-Intel) |
| Modalidades de entrada | texto unicamente (sin vision) |
| Dispositivo de inferencia | CPU y GPU Intel via `device="AUTO"` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-Coder-3B: un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y embeddings de tokens compartidos con la cabeza de salida. El modelo base fue entrenado por Alibaba Qwen sobre un corpus orientado a código y texto, con etapas de preentrenamiento y ajuste supervisado; la model card de esta exportación no detalla el número de tokens, la composición del dataset ni si hubo RLHF o DPO, por lo que esos datos deben consultarse en la ficha oficial de Qwen2.5-Coder-3B.

La innovación técnica de esta publicación no está en el entrenamiento, sino en la compresión: se aplica cuantización de solo pesos a int4 con simetría y agrupación de 128 canales, usando escalas derivadas de AWQ (activation-aware weight quantization) y una etapa de estimación de escalas calibrada con GSM8K. El resultado se serializa como grafo OpenVINO IR junto con tokenizer y detokenizer también compilados a OpenVINO, de modo que el artefacto es autocontenido y se carga con `OVModelForCausalLM.from_pretrained`. No se documentan técnicas de decodificación especulativa, atención lineal ni arquitecturas híbridas SSM.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen2.5-Coder-3B.
- Generación y completado de código en múltiples lenguajes de programación, con especial énfasis en Python, JavaScript, TypeScript, Java, C++ y SQL, según las capacidades del modelo base.
- Razonamiento sobre código: explicación de fragmentos, detección de errores y propuesta de refactorizaciones.
- Razonamiento matemático básico e intermedio, reforzado indirectamente por la calibración sobre GSM8K (aunque la calibración no implica mejora de capacidad).
- Soporte de plantilla de chat (`chat_template.jinja`), lo que permite formatear turnos system/user/assistant de forma consistente.
- Capacidades multilingües heredadas del modelo base; la model card de esta exportación no enumera idiomas concretos.
- Sin soporte de vision, audio ni otras modalidades: la tabla de modalidades declara explícitamente texto sí, imágenes no.
- No se documenta soporte explícito de tool calling ni de agentes multi-paso en esta exportación; debe verificarse contra la ficha del modelo base.

## Casos de uso

- Asistente de código en IDE sobre portátiles sin GPU dedicada: al pesar 1,62 GB en int4 y ejecutarse con OpenVINO en CPU, el modelo cabe en memoria RAM de un portátil estándar y puede ofrecer autocompletado y explicaciones de código con latencia aceptable para uso interactivo.
- Servicio de revisión de pull requests en CI: se puede invocar el modelo desde un runner con CPU Intel para generar resúmenes de diffs, detectar patrones sospechosos o proponer mensajes de commit, sin necesidad de GPU.
- Generación de tests unitarios a partir de firmas de funciones: el modelo base está entrenado para código y esta cuantización mantiene la plantilla de chat, lo que permite prompts estructurados que devuelvan bloques de test en Python, Java o TypeScript.
- Documentación automática de APIs: dado un fragmento de código, el modelo puede producir docstrings y descripciones de parámetros; el contexto del modelo base (32k tokens según Qwen) permite procesar módulos completos si se confirma esa ventana en la práctica.
- Despliegue en entornos de borde o air-gapped: al ser un artefacto OpenVINO autocontenido y con licencia Apache 2.0, puede distribuirse dentro de una imagen de contenedor y ejecutarse en hardware Intel sin acceso a internet.
- Prototipado rápido de pipelines RAG sobre documentación técnica: el modelo sirve como generador final en un sistema de recuperación, con la ventaja de que la huella de memoria reducida permite co-alojarlo con el índice vectorial en la misma máquina.
- Traducción y reformulación de textos técnicos entre inglés y castellano: aunque la model card no detalla idiomas, el modelo base es multilingüe y puede usarse para tareas de reescritura; conviene validar la calidad en castellano antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta exportación no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo en FP16, y tampoco se aportan mediciones de latencia o throughput para la versión OpenVINO int4.

## Requisitos de hardware

- VRAM/RAM estimada: los pesos IR ocupan 1,62 GB; con overhead de runtime OpenVINO y KV cache para contextos largos, se recomienda al menos 4 GB de RAM libre en CPU y 2-3 GB de VRAM en GPU Intel integrada o dedicada.
- GPU recomendadas: GPUs Intel Arc (A770, B580), iGPUs Intel Iris Xe y Meteor Lake/Arrow Lake con NPU o GPU integrada; también puede ejecutarse en CPU Intel Xeon o Core sin acelerador dedicado.
- Cabe en GPU de consumo: sí, en cualquier GPU Intel Arc de gama media; en GPUs NVIDIA no es la ruta nativa (OpenVINO puede usar GPU NVIDIA vía plugin, pero el soporte es menos maduro que el de Intel).
- Opciones de despliegue: Optimum-Intel (`OVModelForCausalLM`), OpenVINO GenAI, servidor de inferencia OpenVINO Model Server (OVMS) y cualquier runtime que consuma IR de OpenVINO. No es compatible directamente con llama.cpp, Ollama ni vLLM, que esperan GGUF o safetensors.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware Intel concreto y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| m4gshm/Qwen2.5-Coder-3B-int4-sym-g128-se-awq | 3B | no disponible (base: 32k) | OpenVINO IR int4 | Apache 2.0 | Exportación comunitaria, sin benchmarks publicados |
| Qwen/Qwen2.5-Coder-3B | 3B | 32 768 tokens | safetensors FP16/BF16 | Apache 2.0 | Modelo base oficial, referencia de calidad |
| Qwen/Qwen2.5-Coder-1.5B | 1,5B | 32 768 tokens | safetensors | Apache 2.0 | Alternativa más ligera, menor calidad en código |
| Qwen/Qwen2.5-Coder-7B | 7B | 32 768 tokens | safetensors | Apache 2.0 | Alternativa de mayor tamaño y calidad, requiere más memoria |

No se dispone de comparaciones cuantitativas de rendimiento entre esta cuantización y las alternativas, ya que el autor no publicó evaluaciones.

## Limitaciones y advertencias

- La model card no documenta evaluación de la pérdida de calidad introducida por la cuantización int4; es esperable una degradación en tareas de razonamiento complejo y generación de código largo respecto al modelo en FP16, pero su magnitud no está medida.
- Riesgo de alucinación inherente a los modelos de 3B: puede inventar APIs, funciones o imports inexistentes, especialmente en lenguajes poco representados en el corpus de entrenamiento.
- Idiomas soportados no declarados en esta exportación; el rendimiento en castellano no está verificado y podría ser inferior al del inglés.
- La calibración se realizó sobre GSM8K, un dataset de matemáticas; esto puede sesgar las escalas hacia ese dominio y no está claro que sea óptimo para código.
- Contexto efectivo no verificado en la versión OpenVINO: aunque el modelo base soporta 32k tokens, la exportación no documenta pruebas más allá de contextos cortos.
- Sin soporte multimodal: no procesa imágenes, audio ni vídeo.
- No se documenta soporte de tool calling ni de agentes; si se necesita, debe validarse contra el modelo base y no asumirse en esta exportación.
- Licencia Apache 2.0 permite uso comercial, pero el autor de la exportación no ofrece garantías; para producción conviene validar el artefacto y, si es posible, reproducir la cuantización con NNCF.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No es directamente compatible con ecosistemas GGUF/Ollama/vLLM, lo que limita su portabilidad fuera de OpenVINO.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/m4gshm/Qwen2.5-Coder-3B-int4-sym-g128-se-awq
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Documentación de Optimum-Intel: https://huggingface.co/docs/optimum-intel
- OpenVINO: https://docs.openvino.ai
- NNCF (Neural Network Compression Framework): https://github.com/openvinotoolkit/nncf
- Repositorio de Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
