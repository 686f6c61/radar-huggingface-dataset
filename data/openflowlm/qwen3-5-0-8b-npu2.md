# OpenFlowLM/Qwen3.5-0.8B-NPU2

## Resumen

Qwen3.5-0.8B-NPU2 es una adaptacion publicada por el usuario comunitario OpenFlowLM sobre el modelo base Qwen/Qwen3.5-0.8B-Base, desarrollado por Alibaba Cloud (equipo Qwen). Se trata de un modelo causal multimodal de tipo image-text-to-text, con 0,8 mil millones de parametros, codificador de vision y una ventana de contexto nativa de 262.144 tokens, orientado a prototipado, ajuste fino especifico de tarea y despliegue en entornos de borde. El sufijo NPU2 sugiere un empaquetado o conversion pensada para aceleradores NPU, aunque la model card del repositorio no documenta detalles de esa conversion.

La relevancia de esta variante esta en su tamano: 0,8B parametros permiten ejecucion en hardware muy modesto (incluso integrado o movil) manteniendo capacidades de vision y un contexto de 262K tokens, algo inusual en esta escala. La serie Qwen3.5 introduce una arquitectura hibrida que combina Gated DeltaNet (atencion lineal) con Gated Attention clasica, lo que reduce el coste de atencion en secuencias largas frente a un transformer denso equivalente.

El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, y fue creado el 8 de octubre de 2026. La licencia declarada es Apache 2.0, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales segun los terminos del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de vision; capas hibridas Gated DeltaNet (atencion lineal) + Gated Attention, con FFN por bloque |
| Parametros totales | 0,8B |
| Parametros activos | No disponible (no se documenta capa MoE en la configuracion de 0,8B) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | No disponible en la model card; para el modelo base Qwen3.5-0.8B circulan GGUF ejecutables en llama.cpp y una etiqueta `qwen3.5:0.8b` en Ollama |
| Idiomas soportados | No disponible en la ficha de HuggingFace; la documentacion de la familia Qwen3.5 declara 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato Hugging Face Transformers (repo de 1,3 GB); el autor indica compatibilidad con Transformers, vLLM, SGLang y KTransformers |
| Parametros de arquitectura | Hidden dimension 1024; 24 capas; layout 6 × (3 × (Gated DeltaNet -> FFN) -> 1 × (Gated Attention -> FFN)) |
| Embedding de tokens | 248.320 (con padding), atado a la salida LM |
| Cabezas de atencion lineal (Gated DeltaNet) | 16 para V y 16 para QK, dimension de cabeza 128 |
| Cabezas de atencion (Gated Attention) | 8 para Q y 2 para KV, dimension de cabeza 256, RoPE dimension 64 |
| FFN | Dimension intermedia 3.584 |
| MTP | Entrenado con multi-steps |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de vision y un patron hibrido poco habitual. Cada bloque del cuerpo se repite segun el layout 6 × (3 × (Gated DeltaNet -> FFN) -> 1 × (Gated Attention -> FFN)): por cada tres subcapas de Gated DeltaNet (una forma de atencion lineal con estado recurrentemente actualizado) hay una subcapa de Gated Attention con atencion clasica, con 8 cabezas de consulta y solo 2 de clave-valor (GQA). La dimension oculta es 1024, hay 24 capas, la FFN tiene dimension intermedia 3.584 y el embedding de tokens es de 248.320 entradas atadas a la proyeccion de salida. El modelo incorpora prediccion multi-token (MTP) entrenada con varios pasos, lo que facilita decodificacion especulativa en inferencia.

Segun la documentacion de la familia, el entrenamiento parte de una base multimodal con fusion temprana de tokens de texto e imagen, y se completa con etapas de post-entrenamiento que incluyen escalado de aprendizaje por refuerzo en entornos multiagente. La model card del modelo base afirma paridad cross-generacional con Qwen3 y mejora sobre los modelos Qwen3-VL en razonamiento, codigo, agentes y comprension visual. No se detallan en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni los detalles de las etapas de RLHF o DPO aplicadas a esta variante concreta. Tampoco se documenta que cambios introduce exactamente OpenFlowLM respecto al checkpoint base Qwen/Qwen3.5-0.8B-Base.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de 262.144 tokens, adecuada para documentos largos o historiales extensos.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text), con comprension visual integrada mediante fusion temprana de tokens multimodales.
- Razonamiento en modo thinking y modo no-thinking, segun se desprende de las tablas de benchmarks publicadas para la serie.
- Capacidades de codigo y matematicas, aunque en esta escala son limitadas: el propio material de referencia recomienda subir a Qwen3.5-4B para tareas de programacion.
- Soporte multilingue amplio segun la documentacion de la familia: 201 idiomas y dialectos declarados (no confirmado especificamente para este checkpoint en la ficha de HuggingFace).
- Prediccion multi-token (MTP) entrenada, util para decodificacion especulativa y aceleracion de la generacion.
- Compatibilidad declarada con Transformers, vLLM, SGLang y KTransformers, lo que facilita su integracion en pipelines de servicio.
- Soporte de tool calling y flujo agente: no confirmado explicitamente en la informacion disponible para este checkpoint; la documentacion de la familia menciona agentes y entorno RL multiagente en el entrenamiento.

## Casos de uso

- Procesamiento de documentos largos en el borde: con 262.144 tokens de contexto y 0,8B parametros, el modelo puede resumir o extraer informacion de informes extensos ejecutandose en un portatil o en un dispositivo con NPU, sin enviar datos a la nube.
- Clasificacion y enrutado de tickets de soporte: por su tamano reducido y su ventana de contexto, es viable desplegarlo como primer nivel de triaje que lee el historial completo de una incidencia y decide categoria y prioridad antes de escalar a un modelo mayor.
- Descripcion de imagenes y accesibilidad: al aceptar entrada de imagen y texto, puede generar descripciones automaticas de fotografias o capturas para lectores de pantalla en aplicaciones moviles.
- Preprocesado en pipelines RAG: uso como modelo de condensacion de consultas, extraccion de entidades o reescritura de prompts antes de llamar a un modelo de mayor capacidad, reduciendo coste por token.
- Prototipado y validacion de arquitecturas: util en investigacion para experimentar con el patron hibrido Gated DeltaNet + Gated Attention y con decodificacion especulativa basada en MTP sin necesidad de clústeres de GPU.
- Ajuste fino especifico de dominio: al ser un checkpoint pequeno y con licencia Apache 2.0, es adecuado para fine-tuning con LoRA en tareas verticales (legal, medico, industrial) sobre una sola GPU de consumo.
- Asistente local embebido en aplicaciones de escritorio o moviles: la combinacion de vision, contexto largo y 0,8B parametros permite un asistente offline que no depende de conectividad.
- Generacion de codigo asistida en editor: viable para autocompletado y explicacion de fragmentos cortos, con la advertencia de que la precision en codigo es baja en esta escala y conviene reservarla a tareas triviales o de formato.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo base (modo no-thinking):

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

La model card del modelo base incluye mas filas de benchmarks, pero el contenido disponible esta truncado y no permite reproducirlas con fiabilidad.

Datos adicionales recogidos de fuentes secundarias (apxml.com) para Qwen3.5-0.8B en modo thinking: MMLU-Pro 66,5%, GPQA Diamond 51,6%, GPQA 11,9%. Estas cifras proceden de un tercero, no de la model card oficial, y la de GPQA Diamond resulta llamativamente alta para un modelo de 0,8B parametros, por lo que conviene tratarlas con cautela y verificarlas en la fuente original antes de citarlas.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 el peso ronda 1,3-1,6 GB, mas cache KV; con contexto de 262.144 tokens la cache KV pasa a ser el factor dominante y exige planificacion explicita de memoria (en atencion lineal Gated DeltaNet el crecimiento es mas contenido que en atencion densa, pero la subcapa Gated Attention mantiene estado clasico).
- Cuantizaciones de 8 bits: aproximadamente 0,9-1,2 GB de pesos, ejecutables con holgura en GPUs de 4-6 GB.
- Cuantizaciones de 4 bits: aproximadamente 0,5-0,7 GB, adecuadas para GPUs integradas, Apple Silicon y algunos aceleradores NPU.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4) es suficiente para texto y vision en precision reducida; A100 y H100 solo tienen sentido para servicio con lotes grandes y contextos muy largos.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual (RTX 3060 en adelante) e incluso en iGPU con cuantizacion de 4 bits.
- Opciones de despliegue: Transformers, vLLM, SGLang y KTransformers segun la model card; para el modelo base de la serie tambien se reporta ejecucion en llama.cpp con GGUF y Ollama (`qwen3.5:0.8b`). El autor de esta variante no publica instrucciones de despliegue propias.
- Latencia y throughput: no disponibles. No se han publicado mediciones especificas para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro (no-thinking) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-NPU2 (este) | 0,8B | 262.144 | 29,7 (heredado del base) | Apache 2.0 | Repositorio HuggingFace de OpenFlowLM, 0 descargas, 0 likes |
| Qwen3.5-0.8B (base oficial) | 0,8B | 262.144 | 29,7 | Apache 2.0 | Repositorio oficial de Qwen |
| Qwen3.5-2B | No disponible | No disponible | 55,3 | No disponible | Repositorio oficial de Qwen |
| Qwen3-1.7B | 1,7B | No disponible | 40,2 | Apache 2.0 (familia Qwen3) | Repositorio oficial de Qwen |
| Qwen3-4B-2507 | 4B | No disponible | 69,6 | Apache 2.0 (familia Qwen3) | Repositorio oficial de Qwen |

El salto de calidad entre 0,8B y 1,7B-2B es de aproximadamente 10 y 25 puntos de MMLU-Pro respectivamente, una diferencia que condiciona seriamente la eleccion de este checkpoint para tareas de razonamiento o codigo. Su ventaja competitiva es el contexto de 262K tokens y la entrada multimodal a un coste de memoria muy bajo.

## Limitaciones y advertencias

- Rendimiento de razonamiento bajo: 29,7 en MMLU-Pro y 46,4 en C-Eval en modo no-thinking, muy por debajo de modelos de 2B-4B de la misma familia. No es adecuado para tareas analiticas complejas sin un modelo mayor en el pipeline.
- Precision en codigo limitada: fuentes secundarias recomiendan explicitamente usar Qwen3.5-4B o superior para tareas de programacion.
- Riesgo de alucinacion elevado: en modelos de menos de 1B parametros la tasa de invencion de hechos y de citas incorrectas es alta; se requiere verificacion externa o grounding por RAG en produccion.
- Trazabilidad incompleta: la model card del repositorio de OpenFlowLM reproduce la documentacion del modelo base de Qwen y no describe que modificaciones introduce la variante NPU2, ni su proceso de conversion, ni datos de validacion propios.
- Estado del repositorio: 0 descargas y 0 likes, sin historial de uso ni issues; no hay evidencia de comunidad que haya validado el checkpoint.
- Idiomas: la ficha de HuggingFace no declara idiomas; la cobertura de 201 idiomas corresponde a la documentacion de la familia y no esta verificada para este checkpoint concreto. El soporte real del castellano no esta confirmado por benchmarks.
- Sesgos: no hay informacion publicada sobre evaluaciones de sesgo, toxicidad o equidad para este modelo. Al entrenarse sobre datos web multilingues, es previsible que herede sesgos presentes en ellos.
- Licencia: Apache 2.0 permite uso comercial, pero la model card enlaza a la licencia del repositorio oficial de Qwen (license_link apunta a Qwen/Qwen3.5-0.8B); conviene revisar los terminos del modelo base por si se anaden condiciones adicionales a la redistribucion.
- Uso previsto: la propia model card indica que, por su escala, los casos de uso objetivo son prototipado, ajuste fino especifico de tarea e investigacion, no despliegues de alta exigencia.
- Compatibilidad del sufijo NPU2: no se documenta el acelerador concreto, el formato compilado ni las herramientas necesarias para ejecutar la variante NPU2, lo que puede impedir su uso fuera del entorno previsto por el autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OpenFlowLM/Qwen3.5-0.8B-NPU2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Modelo oficial de la serie: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Analisis y guia de ejecucion de Qwen3.5-0.8B: https://codersera.com/blog/run-and-benchmark-qwen35-08b/
- Ficha de especificaciones y benchmarks: https://apxml.com/models/qwen35-08b
- Qwen3.5-0.8B en Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
- Repositorio relacionado del mismo autor: https://huggingface.co/OpenFlowLM/Qwen3-8B-NPU2
