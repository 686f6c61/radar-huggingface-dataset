# amd/Qwen3-1.7B_rai_1.9.0_m_1.0.1_npu

## Resumen

AMD/Qwen3-1.7B_rai_1.9.0_m_1.0.1_npu es una distribucion del modelo Qwen3-1.7B de Alibaba empaquetada por AMD para su ejecucion sobre las NPU (unidades de procesamiento neuronal) de la plataforma Ryzen AI. El repositorio contiene pesos en formato ONNX optimizados para el runtime Ryzen AI 1.9.0 con el perfil de modelo `m_1.0.1_npu`, lo que permite ejecutar el modelo en local sobre los aceleradores integrados en los procesadores AMD Ryzen con arquitectura XDNA/XDNA2, sin depender de una GPU discreta. El modelo base es un transformer denso de 1.700 millones de parametros con una ventana de contexto nativa de 32.768 tokens y capacidades multilingues, entrenado por el equipo Qwen de Alibaba.

La relevancia de esta publicacion es fundamentalmente de despliegue: no introduce un modelo nuevo, sino que traslada un LLM ya conocido al ecosistema de inferencia en NPU de AMD. Esto interesa a desarrolladores que quieren ejecutar generacion de texto y conversacion en portatiles y mini-PC con Ryzen AI manteniendo los datos en local, con un consumo energetico bajo y sin ocupar la GPU. El repositorio esta restringido (gated) y requiere aceptar condiciones en Hugging Face antes de la descarga.

La ficha se centra en lo que la informacion disponible permite afirmar. Los detalles de arquitectura y entrenamiento corresponden al modelo base Qwen3-1.7B; los datos especificos del empaquetado ONNX para NPU (por ejemplo, precision exacta de los pesos o nivel de cuantizacion aplicado) no estan publicados en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-1.7B), empaquetado en ONNX para NPU Ryzen AI |
| Parametros totales | 1.700 millones (1,7 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (contexto nativo del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | No disponible (el repo incluye pesos ONNX para el perfil `m_1.0.1_npu`; no se especifica el esquema exacto) |
| Idiomas soportados | Ingles declarado en la model card; el modelo base Qwen3 es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (runtime Ryzen AI 1.9.0) |
| Tamano del repositorio | 1,7 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Pipeline | text-generation |
| Hardware objetivo | NPU AMD Ryzen AI (XDNA/XDNA2) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-1.7B, un transformer decoder-only denso de la familia Qwen3. La serie Qwen3 combina modelos densos y MoE; esta variante de 1,7 B es densa, con atencion por causalidad estandar y sin mezcla de expertos. El modelo base incorpora modo de razonamiento (thinking mode) con control mediante tokens especiales y fue entrenado con un pipeline que incluye preentrenamiento sobre un corpus multilingue amplio seguido de ajuste supervisado y optimizacion por preferencias. Los detalles exactos de volumen de tokens, composicion del dataset y etapas de RLHF/DPO del modelo base no se recogen en la informacion proporcionada.

La aportacion de AMD en este repositorio no es el entrenamiento, sino la conversion y el empaquetado: los pesos se distribuyen en formato ONNX y se acompanan del identificador de runtime `rai_1.9.0` (Ryzen AI 1.9.0) y del perfil `m_1.0.1_npu`, que fija la configuracion de ejecucion sobre la NPU. Este empaquetado permite que el modelo se ejecute con las herramientas de Ryzen AI en lugar de requerir CUDA o ROCm, trasladando la carga de inferencia a la NPU integrada. No se detalla en la informacion disponible si se aplicaron tecnicas adicionales como decodificacion especulativa o cuantizacion agresiva especifica para la NPU.

## Capacidades

- Generacion de texto y conversacion multi-turno, con el pipeline declarado `text-generation` y `conversational`.
- Razonamiento en modo thinking: el modelo base Qwen3 soporta un modo de razonamiento explicito que puede activarse o desactivarse segun la tarea.
- Generacion de codigo y resolucion de problemas matematicos basicos, dentro de las capacidades del modelo base de 1,7 B.
- Capacidades multilingues heredadas de Qwen3, aunque la model card solo declara ingles.
- Instrucciones y dialogo: el modelo base esta ajustado para seguir instrucciones y mantener conversaciones.
- Tool calling y function calling: no confirmado en la informacion disponible para este empaquetado.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible para este empaquetado.
- Vision y audio: no soportados (modelo exclusivamente de texto).
- Ejecucion en NPU Ryzen AI sin GPU discreta, con los datos procesados en local.

## Casos de uso

- Asistente conversacional en local para portatiles Ryzen AI: el modelo se ejecuta sobre la NPU integrada, lo que permite mantener un chatbot de uso personal sin conexion y sin cargar la GPU ni la CPU de forma intensiva, con un consumo energetico contenido.
- Procesamiento de documentos con contexto largo: la ventana de 32.768 tokens permite resumir, extraer datos o responder preguntas sobre contratos, informes o transcripciones de varias decenas de paginas en una sola pasada.
- Generacion de texto en aplicaciones de escritorio: integrable en herramientas nativas de Windows mediante el runtime Ryzen AI, util para redaccion asistida, reescritura o generacion de borradores sin enviar datos a la nube.
- Prototipado de pipelines de IA en el borde: sirve como modelo de referencia para validar flujos de inferencia en NPU antes de escalar a modelos mayores o a despliegues en produccion.
- Clasificacion y extraccion de informacion estructurada: tareas de etiquetado de texto, analisis de sentimiento o conversion de texto libre a JSON, adecuadas para un modelo de 1,7 B con bajo coste de inferencia.
- Educacion y demos tecnicas: permite mostrar el funcionamiento de un LLM sobre hardware AMD Ryzen AI en talleres, pruebas de concepto y entornos docentes con recursos limitados.
- Filtrado y preprocesado en pipelines mas grandes: por su tamano reducido, puede usarse como primer eslabon para limpiar, resumir o enrutar consultas antes de pasarlas a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de latencia o throughput sobre NPU.

## Requisitos de hardware

- Hardware objetivo: NPU integrada en procesadores AMD Ryzen AI (arquitectura XDNA/XDNA2). No esta pensado para ejecucion en GPU CUDA ni en CPU generica con este empaquetado.
- Tamano en disco: 1,7 GB para el repositorio de pesos ONNX.
- VRAM estimada: no aplica, ya que la inferencia se realiza sobre la NPU y la memoria compartida del sistema; no se dispone de cifras oficiales de memoria requerida.
- GPU recomendadas: no aplica para este empaquetado; para ejecutar Qwen3-1.7B en GPU se usaria otra distribucion del modelo base.
- Compatibilidad con GPU de consumo: no es el proposito de este repositorio; para RTX 4090 u otras GPU conviene usar los pesos originales de Qwen3-1.7B en safetensors o GGUF.
- Opciones de despliegue: runtime Ryzen AI 1.9.0 con el perfil `m_1.0.1_npu`. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI para este empaquetado ONNX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Acceso |
|---|---|---|---|---|---|
| AMD/Qwen3-1.7B_rai_1.9.0_m_1.0.1_npu | 1,7 B | 32.768 tokens | ONNX para NPU Ryzen AI | Apache 2.0 | Gated |
| Qwen/Qwen3-1.7B (modelo base) | 1,7 B | 32.768 tokens | Safetensors, GGUF | Apache 2.0 | Abierto |
| Llama 3.2 1B Instruct | 1,2 B | 128.000 tokens | Safetensors, GGUF | Llama 3.2 Community | Abierto con condiciones |
| Gemma 3 1B Instruct | 1 B | 32.768 tokens | Safetensors, GGUF | Gemma Terms | Abierto con condiciones |

La comparativa se limita a datos de catalogo de los modelos base; no se dispone de resultados de benchmarks comparativos en la informacion proporcionada. La diferencia principal de la variante de AMD es el formato ONNX y el soporte de NPU, no el rendimiento del modelo en si.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en Hugging Face antes de la descarga, lo que anade un paso al despliegue automatizado.
- Dependencia de hardware: el empaquetado esta atado a la NPU Ryzen AI y al runtime 1.9.0; no es portable a GPU o CPU sin reconvertir el modelo.
- Model card minima: la informacion publicada no detalla cuantizacion exacta, requisitos de memoria ni metricas de rendimiento, lo que dificulta planificar capacidad.
- Idioma declarado: solo se declara ingles; el rendimiento en castellano no esta verificado para este empaquetado, aunque el modelo base sea multilingue.
- Riesgo de alucinacion: como cualquier LLM de 1,7 B, tiende a inventar datos en tareas de conocimiento factual o matematicas complejas; conviene validar las salidas en produccion.
- Sesgos: el modelo base hereda los sesgos de sus datos de entrenamiento; no se han publicado evaluaciones de sesgo especificas para esta distribucion.
- Capacidad limitada por tamano: 1,7 B de parametros restringen el razonamiento multi-paso, el codigo complejo y el seguimiento de instrucciones largas frente a modelos mayores.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse las condiciones de acceso del repositorio y las obligaciones de atribucion del modelo base.
- Tool calling y agentes: no confirmados para este empaquetado; si se necesitan, hay que verificarlos empiricamente antes de disenar la arquitectura.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amd/Qwen3-1.7B_rai_1.9.0_m_1.0.1_npu
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Documentacion de Ryzen AI: no disponible en la informacion proporcionada
- Paper o blog de Qwen3: no disponible en la informacion proporcionada
- Repositorio de codigo o demos: no disponible en la informacion proporcionada
