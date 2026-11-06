# m4gshm/Qwen2.5-Coder-3B-int8-sym

## Resumen
Qwen2.5-Coder-3B-int8-sym es una exportacion a formato OpenVINO del modelo Qwen2.5-Coder-3B, desarrollado originalmente por Alibaba Qwen y convertido por el usuario m4gshm mediante la herramienta NNCF (Neural Network Compression Framework). El modelo base es un transformer causal (`Qwen2ForCausalLM`) de 3.000 millones de parametros especializado en generacion de codigo, y esta version concreta aplica cuantizacion simetrica de pesos a int8, reduciendo el peso de los ficheros IR a 2,88 GB.

El proposito de esta variante es facilitar el despliegue en hardware Intel (CPU, iGPU, NPU) mediante el runtime de OpenVINO y la libreria Optimum-Intel, sin necesidad de GPU dedicada. Resulta relevante para entornos de inferencia en el borde, estaciones de trabajo sin acelerador NVIDIA y pipelines de generacion de codigo de baja latencia en CPU.

La ficha se centra en las caracteristicas verificables de esta exportacion. Los detalles de entrenamiento, composicion del dataset y resultados de benchmarks del modelo base no se incluyen en la informacion disponible y se indican como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (`Qwen2ForCausalLM`) |
| Parametros totales | 3.000 millones (heredados del modelo base Qwen2.5-Coder-3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Pesos int8 simetrico (via NNCF); unica variante publicada en este repo |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (`openvino_model.xml` + `openvino_model.bin`), tokenizer y detokenizer OpenVINO, `tokenizer.json`, `chat_template.jinja` |

## Arquitectura y entrenamiento
La arquitectura corresponde al modelo base Qwen2.5-Coder-3B: un transformer decoder-only con atencion causal, orientado a generacion de texto y codigo. Esta exportacion no modifica la topologia, solo aplica cuantizacion post-entrenamiento de pesos a int8 simetrico mediante NNCF, generando un grafo OpenVINO optimizado para inferencia en hardware Intel. El repositorio incluye tokenizer y detokenizer compilados en formato OpenVINO, ademas de la plantilla de chat (`chat_template.jinja`) necesaria para el formateo conversacional.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas especificas del modelo base. Tampoco se documenta el proceso exacto de calibracion empleado para la cuantizacion (dataset de calibracion, granularidad por canal o por tensor).

## Capacidades
- Generacion de texto y codigo en formato conversacional, con plantilla de chat incluida.
- Completado de codigo y generacion a partir de instrucciones (capacidad heredada del modelo base Qwen2.5-Coder).
- Razonamiento sobre codigo y explicaciones tecnicas, segun las capacidades del modelo base.
- Inferencia en CPU, iGPU y NPU Intel mediante OpenVINO y Optimum-Intel.
- Carga directa con `OVModelForCausalLM.from_pretrained(..., device="AUTO")`.
- Modalidad de entrada exclusivamente texto (sin vision ni audio).
- Soporte de tool calling, agentes o modo "thinking": no documentado en la informacion disponible.

## Casos de uso
- Asistente de codigo en IDE sobre portatiles sin GPU dedicada: el modelo en int8 ocupa 2,88 GB y puede ejecutarse en CPU Intel mediante OpenVINO, ofreciendo autocompletado y explicaciones sin depender de la nube.
- Generacion de tests unitarios en pipelines de CI: integrado como paso previo a la ejecucion de la suite, el modelo puede producir borradores de tests a partir del diff, con la ventaja de que la inferencia en CPU abarata el coste por ejecucion.
- Documentacion automatica de APIs y funciones: dado un fichero fuente, el modelo genera docstrings y descripciones de endpoints; su tamano de 3B permite procesar repositorios medianos por lotes en hardware de oficina.
- Traduccion entre lenguajes de programacion en tareas de migracion: conversiones acotadas (por ejemplo, fragmentos de Python a Java o TypeScript) se pueden procesar localmente sin enviar codigo propietario a servicios externos.
- Despliegue en el borde o entornos air-gapped: al no requerir GPU NVIDIA ni conexion a internet, encaja en estaciones de trabajo con requisitos de confidencialidad del codigo.
- Prototipado rapido de asistentes conversacionales tecnicos: la plantilla de chat incluida permite montar un chatbot de soporte a desarrolladores con Optimum-Intel y un servidor HTTP ligero.
- Ensenanza y experimentacion: el reducido peso y la licencia Apache 2.0 facilitan su uso en cursos y laboratorios con hardware Intel convencional.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta el tamano de los pesos IR (2,88 GB) y la modalidad de entrada, sin metricas de calidad (HumanEval, MBPP, MMLU) ni de throughput o latencia.

## Requisitos de hardware
- VRAM/RAM: los pesos IR ocupan 2,88 GB; se recomienda al menos 4-6 GB de memoria disponible para el modelo mas buffers de activaciones y KV cache.
- GPU dedicada: no necesaria; el modelo esta optimizado para OpenVINO, no para CUDA.
- Hardware Intel recomendado: CPU con AVX2/AVX-512, iGPU Intel integrada o NPU Intel (por ejemplo, Meteor Lake y posteriores) mediante `device="AUTO"`, `"CPU"`, `"GPU"` o `"NPU"`.
- Cabe en cualquier equipo de consumo con 8 GB de RAM o mas; tambien en mini-PC y dispositivos de borde.
- Despliegue: Optimum-Intel (`OVModelForCausalLM`), OpenVINO GenAI y servidores compatibles con el runtime de OpenVINO. No se distribuye en GGUF, por lo que llama.cpp u Ollama requeririan conversion adicional no incluida en este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| m4gshm/Qwen2.5-Coder-3B-int8-sym | 3B | OpenVINO IR int8 | no disponible | Apache 2.0 | Optimizado para CPU/iGPU/NPU Intel |
| Qwen/Qwen2.5-Coder-3B (base) | 3B | safetensors (fp16/bf16) | no disponible | Apache 2.0 | Modelo original, requiere conversion para OpenVINO |
| Qwen2.5-Coder-1.5B | 1,5B | safetensors, GGUF (comunidad) | no disponible | Apache 2.0 | Menor huella, menor capacidad; util en hardware muy limitado |
| Qwen2.5-Coder-7B | 7B | safetensors, GGUF (comunidad) | no disponible | Apache 2.0 | Mayor calidad a costa de mas memoria y computo |

La comparacion se limita a parametros, formato y licencia, ya que no hay datos de rendimiento publicados en la informacion disponible para esta exportacion.

## Limitaciones y advertencias
- Al ser una cuantizacion int8 simetrica, puede presentar una ligera degradacion de calidad frente al modelo base en fp16/bf16; no se documenta la magnitud de esa perdida.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en APIs, librerias o funciones poco comunes; conviene validar el codigo generado.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad para esta exportacion ni para el modelo base en la informacion disponible.
- Idiomas: no se especifica la cobertura linguistica; el modelo base esta orientado a codigo y probablemente tiene mejor rendimiento en ingles para texto tecnico.
- Contexto maximo: no disponible; planificar las integraciones sin asumir una ventana concreta.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir al modelo base Qwen.
- Dependencia del ecosistema OpenVINO: no es portable directamente a vLLM, TGI o llama.cpp sin conversion adicional.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria ni issues reportados que permitan contrastar su comportamiento en produccion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/m4gshm/Qwen2.5-Coder-3B-int8-sym
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Optimum-Intel: https://github.com/huggingface/optimum-intel
- OpenVINO: https://github.com/openvinotoolkit/openvino
- NNCF: https://github.com/openvinotoolkit/nncf
