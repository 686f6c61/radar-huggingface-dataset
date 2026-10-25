# MergekitCloud/mergekit-131

## Resumen

MergekitCloud/mergekit-131 es un modelo de lenguaje denso de aproximadamente 32.760 millones de parámetros (32,76B) obtenido mediante la fusión de cuatro variantes de la familia Qwen2.5 de 32B. Lo publica el espacio de HuggingFace `MergekitCloud`, un repositorio que agrupa fusiones generadas de forma automatizada con la herramienta mergekit y que no incluye documentación adicional más allá de la configuración YAML del merge. El modelo no se entrena desde cero: combina los pesos de Qwen2.5-32B, Qwen2.5-32B-Instruct, Qwen2.5-Coder-32B-Instruct y DeepSeek-R1-Distill-Qwen-32B para intentar agregar en un único checkpoint capacidades de conversación, código y razonamiento encadenado.

La relevancia de este tipo de fusión es práctica: permite obtener un modelo "todo en uno" a partir de especializaciones ya existentes sin coste de preentrenamiento, usando la técnica TIES (Trim, Elect Sign, Merge) descrita en arXiv:2306.01708. TIES recorta los parámetros menos relevantes de cada modelo donante, resuelve los conflictos de signo entre ellos y promedia solo los valores retenidos, lo que en teoría reduce la interferencia entre capacidades dispares.

Ahora bien, el repositorio presenta señales claras de haber sido generado de forma automática: cero descargas, cero valoraciones, licencia e idiomas sin declarar y una ficha con la plantilla por defecto de mergekit. No hay evaluación publicada que respalde que la fusión haya conservado las capacidades de sus componentes, por lo que debe tratarse como un checkpoint experimental a validar antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2, heredada de los modelos base) |
| Parámetros totales | 32.759.790.592 (~32,76B), dato real de los safetensors |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card; los modelos base Qwen2.5-32B declaran 32.768 tokens nativos, ampliables con YaRN según la documentación de Qwen (dato de los base, no verificado en este merge) |
| Tipos de cuantizacion | No se publican versiones cuantizadas; los pesos se distribuyen en bfloat16 y son convertibles a GGUF, AWQ, GPTQ o FP8 con herramientas estándar |
| Idiomas soportados | No disponible (los modelos base Qwen2.5 declaran soporte multilingüe, pero la ficha del merge no lo especifica) |
| Licencia | No disponible en el repositorio; los Qwen2.5 se publican bajo Apache 2.0 y la licencia del destilado de DeepSeek debe verificarse de forma independiente |
| Formato de pesos | safetensors, dtype bfloat16 |
| Tamaño del repositorio | 65,5 GB |
| Método de fusión | TIES (density 0,55; pesos 0,70 / 0,60 / 0,50; normalize true; int8_mask true; rescale false) |
| Modelo base de la fusión | Qwen/Qwen2.5-32B-Instruct |
| Tokenizer / chat template | `tokenizer_source: base`, `chat_template: auto` |
| Fecha declarada de creación | 2026-10-25 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El checkpoint es una fusión de pesos, no un entrenamiento. La arquitectura subyacente es la de Qwen2.5-32B: un transformer decoder-only denso con atención completa, RoPE, normalización RMSNorm, activación SwiGLU y sesgo en las proyecciones QKV (particularidad de la familia Qwen2). Al compartir todos los donantes la misma arquitectura y el mismo tokenizer, la fusión se puede aplicar tensor a tensor sin necesidad de cirugía de módulos. La configuración usa `tokenizer_source: base`, de modo que el vocabulario y la plantilla de chat provienen de Qwen2.5-32B-Instruct.

La técnica aplicada es TIES con densidad 0,55: por cada tensor y cada modelo donante se conserva el 55% de los parámetros con mayor magnitud, se resuelve el signo por votación ponderada y se promedian únicamente los valores coincidentes, con normalización posterior y máscara INT8 activada. Los pesos asignados son 0,70 para Qwen2.5-Coder-32B-Instruct, 0,60 para DeepSeek-R1-Distill-Qwen-32B y 0,50 para Qwen2.5-32B, tomando Qwen2.5-32B-Instruct como base de referencia. El resultado es un único conjunto de pesos bfloat16.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni etapas de alineación (RLHF/DPO) específicas de este checkpoint: toda la capacidad procede de los modelos fusionados. Tampoco se documenta ninguna innovación adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto y conversación multiturno: la plantilla de chat se hereda de Qwen2.5-32B-Instruct, por lo que el formato de diálogo con roles system/user/assistant es el esperado en la familia Qwen2.5.
- Generación de código: uno de los donantes con mayor peso es Qwen2.5-Coder-32B-Instruct, especializado en completado, explicación y refactorización de código en decenas de lenguajes.
- Razonamiento encadenado: incorpora DeepSeek-R1-Distill-Qwen-32B, que aporta patrones de razonamiento paso a paso y modo "thinking" con trazas internas; la intensidad de esta capacidad en el merge no está verificada.
- Razonamiento matemático: herencia combinada de Qwen2.5-32B-Instruct y del destilado de R1, orientados a problemas aritméticos y de varios pasos.
- Soporte de tool calling / function calling: presumiblemente heredado de Qwen2.5-32B-Instruct, que admite function calling estructurado; no hay verificación específica en este checkpoint.
- Capacidades de agente y razonamiento multi-paso: plausibles por la combinación de Instruct + distilado de R1, pero sin evaluación publicada.
- Multilingüismo: no declarado en la ficha; los modelos Qwen2.5 cubren un conjunto amplio de idiomas, pero no se puede confirmar el grado de conservación tras la fusión.
- Capacidades de visión o audio: no disponibles; todos los donantes son modelos exclusivamente de texto.
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repositorio.

## Casos de uso

- Asistente de código en IDE: el peso 0,70 sobre Qwen2.5-Coder-32B-Instruct sugiere buen rendimiento en autocompletado, generación de tests y explicación de funciones; se integraría como backend de un servidor compatible con la API de OpenAI delante de vLLM o TGI.
- Revisión de pull requests automatizada: combinando la capacidad de código con el modo de razonamiento del destilado de R1, el modelo puede analizar un diff, argumentar posibles bugs y proponer parches en un solo paso de generación.
- Razonamiento matemático y análisis cuantitativo: resolución de problemas de varios pasos, verificación de cálculos y generación de explicaciones intermedias para informes técnicos o material docente.
- Agentes con tool calling: exposición de funciones (consulta a bases de datos, APIs internas, ejecución de scripts) mediante el formato de function calling de Qwen2.5, con el modelo decidiendo la secuencia de llamadas.
- Atención al cliente con contexto medio: conversaciones multiturno en castellano o inglés sobre documentación técnica, siempre que se valide previamente la calidad del modelo en el idioma objetivo, ya que la ficha no declara idiomas.
- Base para ajuste fino específico (SFT/LoRA): al ser un checkpoint denso de 32B en bfloat16 con arquitectura Qwen2 estándar, sirve como punto de partida para especializar en un dominio concreto sin partir de un modelo genérico.
- Generación de documentación técnica a partir de código: el modelo puede resumir módulos, generar docstrings y producir guías de uso, aprovechando la mezcla de conocimiento de código e instrucciones.
- Experimentación en investigación sobre fusiones: caso de uso meta, como punto de comparación frente a los modelos individuales para medir cuánto se degrada o mejora cada capacidad tras un merge TIES.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluación alguna (MMLU, HumanEval, GSM8K, MT-Bench u otras) ni comparación con los modelos base, y tampoco hay métricas de latencia o throughput.

## Requisitos de hardware

- VRAM en bfloat16: los pesos ocupan unos 65,5 GB; con caché KV y activaciones conviene reservar 70-80 GB. Requiere 1×H100 80 GB, 1×A100 80 GB o 2×A100 40 GB / 2×L40S 48 GB con tensor parallel.
- VRAM en FP8 o INT8: aproximadamente 33-35 GB de pesos, por lo que cabe en una L40S 48 GB, A100 80 GB o en 2×RTX 4090 24 GB.
- Cuantización de 5 bits (GGUF Q5_K_M): en torno a 23 GB; cabe en una RTX 4090 24 GB solo con ventanas de contexto cortas, o con holgura en 2×RTX 3090/4090.
- Cuantización de 4 bits (GGUF Q4_K_M): aproximadamente 19-20 GB; cabe en RTX 3090, RTX 4090 y RTX 5090 de 24-32 GB, con contexto reducido por la caché KV.
- GPU consumer: sí es viable en cuantización de 4-5 bits; en bfloat16 no cabe en ninguna GPU consumer actual de 24 GB.
- Opciones de despliegue: vLLM y TGI (el repo está etiquetado con `text-generation-inference` y `endpoints_compatible`), SGLang, y llama.cpp/Ollama tras convertir los pesos a GGUF con `convert_hf_to_gguf.py`.
- Latencia y throughput: no disponible; no hay mediciones publicadas. Como referencia estructural, un denso de 32B en bf16 sobre una H100 ofrece decenas de tokens por segundo agregados con batching, pero es una estimación orientativa, no un dato del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MergekitCloud/mergekit-131 | ~32,76B | No disponible en la ficha (base Qwen2.5: 32.768 tokens nativos) | Fusión TIES de 4 checkpoints | No disponible | Repo público, 0 descargas, sin evaluación |
| Qwen/Qwen2.5-32B-Instruct | ~32,76B | 32.768 tokens nativos, ampliable con YaRN | Modelo alineado por instrucciones | Apache 2.0 | Ampliamente usado, con evaluación publicada por el autor |
| Qwen/Qwen2.5-Coder-32B-Instruct | ~32,76B | 32.768 tokens nativos, ampliable con YaRN | Especializado en código | Apache 2.0 | Muy desplegado en asistentes de código |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-32B | ~32,76B | No disponible en esta ficha; heredado de Qwen2.5 | Destilado con razonamiento explícito | Verificar en el repo original | Muy popular para tareas de razonamiento |

La comparación es inevitablemente cualitativa: los tres donantes cuentan con evaluaciones publicadas por sus autores, mientras que la fusión no aporta ninguna. En igualdad de condiciones, un desarrollador debería preferir el modelo especializado para su tarea concreta salvo que un benchmark propio demuestre que el merge supera a los originales en el caso de uso objetivo.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni pruebas cualitativas, ni comparación con los modelos base; el rendimiento real de la fusión es desconocido.
- Riesgo de degradación por interferencia: TIES no garantiza que las capacidades se sumen; con densidad 0,55 se descarta el 45% de los parámetros de menor magnitud de cada donante, lo que puede eliminar conocimiento especializado poco representado en la magnitud de los pesos.
- Conflicto entre especializaciones: mezclar un modelo de código, uno conversacional y un destilado de razonamiento puede producir un comportamiento inconsistente, por ejemplo razonamiento excesivo en respuestas conversacionales simples o formato de código en respuestas de chat.
- Licencia indeterminada: la ficha no declara licencia y el repo mezcla pesos de Qwen (Apache 2.0) con un destilado de DeepSeek cuya licencia debe comprobarse en su repositorio original antes de cualquier uso comercial.
- Idiomas no declarados: no se puede asumir un rendimiento correcto en castellano sin una evaluación propia; los modelos Qwen2.5 son multilingües, pero la fusión puede haber alterado ese equilibrio.
- Riesgo de alucinación: inherente a todos los modelos de la familia; el modo de razonamiento del destilado de R1 puede producir cadenas de pensamiento plausibles pero incorrectas, especialmente en dominios factuales.
- Procedencia automatizada: el repositorio parece generado por un pipeline (`MergekitCloud`) sin revisión humana, sin model card descriptiva y con fecha de creación anómala (2026-10-25); no hay garantía de mantenimiento ni de soporte.
- Reproducibilidad: la configuración YAML se publica, lo que permite reproducir el merge, pero exige descargar los cuatro checkpoints originales (~260 GB en bf16) y ejecutar mergekit con los mismos parámetros.
- Uso en producción: requiere validación propia en el dominio objetivo, control de versiones del checkpoint y monitorización de latencia, ya que no existen métricas de rendimiento publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MergekitCloud/mergekit-131
- Paper de TIES (arXiv:2306.01708): https://arxiv.org/abs/2306.01708
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Qwen/Qwen2.5-32B: https://huggingface.co/Qwen/Qwen2.5-32B
- Qwen/Qwen2.5-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Qwen/Qwen2.5-Coder-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- deepseek-ai/DeepSeek-R1-Distill-Qwen-32B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B
