# fbaldassarri/allenai_OLMo-2-1124-13B-Instruct-auto_gptq-int4-gs64-asym

## Resumen

Este repositorio contiene una versión cuantizada a 4 bits del modelo OLMo-2-1124-13B-Instruct, desarrollado originalmente por el Allen Institute for AI (AI2). Se trata de una cuantización de solo pesos (weight-only quantization, WoQ) realizada con el algoritmo GPTQ mediante el framework Intel AutoRound v0.16.1, con granularidad de grupo 64 y esquema asimétrico. El resultado es un artefacto de aproximadamente 11 GB que reduce el peso del modelo original y está pensado para inferencia en CPU Intel, iGPU Intel Arc (vía intel-extension-for-pytorch) y NPU Intel (vía OpenVINO).

OLMo 2 es la segunda generación de la familia OLMo de AI2, una línea de modelos de lenguaje abiertos que se publican junto con sus datos de entrenamiento, código y recetas de entrenamiento. El modelo base es un transformer causal de 13B parámetros con licencia Apache 2.0, orientado a instrucciones y conversación en inglés. Esta ficha se centra en la variante cuantizada publicada por el usuario fbaldassarri, no en el modelo original de AI2.

La relevancia de este artefacto es práctica: permite ejecutar un modelo de 13B en hardware consumer y de servidor sin GPU dedicada de gran capacidad, a costa de una ligera pérdida de precisión típica de W4G64. Al estar publicado bajo Apache 2.0, es utilizable tanto en investigación como en despliegues comerciales, aunque el autor declara que el modelo se ha desarrollado solo con fines de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (model_type: olmo2) |
| Parametros totales | 13B en el modelo base; el repositorio cuantizado declara 2.839.208.960 parámetros en safetensors (artefacto cuantizado, no el conteo del modelo original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4 (4 bits), group size 64, asimétrica (sym: false), WoQ GPTQ |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización GPTQ/AutoGPTQ), cargable con transformers |

## Arquitectura y entrenamiento

El modelo base OLMo-2-1124-13B-Instruct es un transformer causal de 13B parámetros entrenado por AI2 como parte de la familia OLMo 2, que se distribuye con datos, código y recetas abiertas. La información proporcionada no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original; esos datos deben consultarse en la model card de allenai/OLMo-2-1124-13B-Instruct. Lo que sí está documentado aquí es el proceso de cuantización.

La cuantización se realizó con Intel AutoRound v0.16.1 sobre el modelo cargado en torch.bfloat16. Se usaron 64 muestras de calibración, 200 iteraciones de ajuste, longitud de secuencia 256 y batch size 2, con el dispositivo de calibración en CPU. El proceso completo tardó 22.804,7 segundos (aproximadamente 380 minutos). El artefacto resultante es un checkpoint GPTQ de 4 bits con grupo 64 asimétrico, formateado para AutoGPTQ y compatible con transformers. Según el autor, ofrece un speedup de 2-3 veces y menor uso de memoria, con una ligera caída de precisión en W4G64. No se documentan innovaciones arquitectónicas propias de esta variante más allá de la cuantización.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, usando la plantilla de chat integrada del modelo (apply_chat_template).
- Razonamiento y respuesta a instrucciones, al ser una variante Instruct del modelo base.
- Generación de código y matemáticas: capacidad heredada del modelo base, aunque no se aportan benchmarks específicos en esta ficha.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`; no se documentan otros idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información proporcionada.
- Inferencia optimizada en CPU Intel, iGPU Intel Arc y NPU Intel (Core Ultra) mediante intel-extension-for-pytorch y OpenVINO.

## Casos de uso

- Despliegue en servidores sin GPU dedicada: al ser un checkpoint INT4 de 4 bits, puede ejecutarse en CPU Intel con intel-extension-for-pytorch, reduciendo el coste de infraestructura frente a un modelo de 13B en bf16.
- Asistentes conversacionales en inglés: el modelo usa plantilla de chat y está orientado a instrucciones, por lo que sirve para atención al cliente o asistentes internos en entornos donde el inglés es el idioma de trabajo.
- Inferencia en portátiles y mini-PC con Intel Core Ultra: la cuantización está preparada para NPU (AI Boost) vía OpenVINO, lo que permite ejecutar el modelo en local sin GPU discreta.
- Prototipado e investigación: al ser un artefacto de 11 GB con licencia Apache 2.0, es adecuado para experimentar con modelos de 13B en hardware modesto y para reproducir la receta de cuantización con auto-round-pipeline.
- Generación de texto por lotes en CPU: el speedup declarado de 2-3 veces frente a precisión completa facilita tareas de generación masiva (resúmenes, clasificación, extracción) en servidores CPU.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de precisión de W4G64 frente al modelo bf16 original en tareas concretas.
- Integración en pipelines de transformers: al cargarse con AutoModelForCausalLM y device_map="auto", puede incorporarse en flujos existentes de Hugging Face sin cambios de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica un speedup de 2-3 veces y una ligera caída de precisión en W4G64, sin cifras concretas de MMLU, HumanEval, GSM8K ni comparaciones numéricas.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el repositorio ocupa 11,0 GB en safetensors; en CPU se necesita al menos esa cantidad de RAM más overhead del runtime (estimación práctica en torno a 12-16 GB).
- GPU recomendadas: no se especifican en la información proporcionada; el artefacto está orientado a CPU Intel, iGPU Intel Arc y NPU Intel.
- ¿Cabe en GPU consumer? No hay datos específicos; por tamaño (11 GB) cabría en GPUs con 12 GB o más de memoria, pero el autor no documenta soporte CUDA para esta variante.
- Opciones de despliegue: transformers con AutoGPTQ, intel-extension-for-pytorch (CPU/iGPU Arc), OpenVINO (NPU Intel). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se declara un speedup de 2-3 veces respecto a la versión sin cuantizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/allenai_OLMo-2-1124-13B-Instruct-auto_gptq-int4-gs64-asym | 13B (base) | no disponible | INT4 GPTQ gs64 asim | Apache 2.0 | Hugging Face |
| allenai/OLMo-2-1124-13B-Instruct | 13B | no disponible | bf16 (sin cuantizar) | Apache 2.0 | Hugging Face |
| Otras cuantizaciones del mismo base (GPTQ/AWQ/GGUF de terceros) | 13B | no disponible | INT4/INT8 varias | Apache 2.0 (heredada) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- La cuantización W4G64 introduce una pérdida de precisión respecto al modelo bf16 original; el autor la califica como "ligera" pero no cuantifica el impacto.
- El modelo solo está documentado para inglés; su uso en otros idiomas no está validado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se aportan evaluaciones de fidelidad en esta ficha.
- Sesgos conocidos: no disponibles en la información proporcionada; deben consultarse en la model card del modelo base de AI2.
- La licencia Apache 2.0 permite uso comercial, pero el autor declara que el artefacto se ha desarrollado solo con fines de investigación y se ofrece sin garantía.
- El soporte está orientado a hardware Intel (CPU, iGPU Arc, NPU); el rendimiento en otras plataformas no está documentado.
- El número de parámetros declarado en safetensors (2.839.208.960) corresponde al artefacto cuantizado y no debe interpretarse como el tamaño del modelo original.
- La model card marca `inference: false` en los metadatos, lo que puede afectar a algunas herramientas de descubrimiento o pipelines automatizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/allenai_OLMo-2-1124-13B-Instruct-auto_gptq-int4-gs64-asym
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-13B-Instruct
- Intel AutoRound (GitHub): https://github.com/intel/auto-round
- auto-round-pipeline: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
