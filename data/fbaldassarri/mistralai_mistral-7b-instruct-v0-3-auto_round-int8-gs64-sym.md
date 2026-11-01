# fbaldassarri/mistralai_Mistral-7B-Instruct-v0.3-auto_round-int8-gs64-sym

## Resumen

Este repositorio contiene una versión cuantizada a INT8 del modelo Mistral-7B-Instruct-v0.3, publicada por el usuario fbaldassarri. No se trata de un modelo nuevo, sino de un artefacto derivado del modelo instructivo de referencia de Mistral AI, obtenido mediante la técnica de cuantización de solo pesos (WoQ) con el algoritmo SignRound implementado en Intel AutoRound v0.16.0. La cuantización emplea 8 bits, tamaño de grupo 64 y esquema simétrico, con calibración realizada en CPU sobre 128 muestras.

El objetivo del artefacto es reducir la huella de memoria del modelo original para facilitar su despliegue en hardware Intel: CPU, iGPU Arc mediante intel-extension-for-pytorch y NPU (AI Boost en la serie Core Ultra) mediante OpenVINO. Es, por tanto, una pieza orientada a inferencia en entornos de borde y estaciones de trabajo Intel, no un modelo pensado para entrenamiento ni para fine-tuning adicional.

La relevancia es acotada pero práctica: permite ejecutar un modelo de 7B en formato INT8 con un pipeline de transformers estándar y un template de chat instructivo, reduciendo el coste de memoria frente a la versión en bfloat16. El repositorio tiene un uso muy limitado (18 descargas, 0 likes) y la model card lo declara explícitamente como destinado a investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (model_type: mistral), derivada de Mistral-7B-Instruct-v0.3 |
| Parametros totales | 2.149.847.040 según safetensors del repo cuantizado; el modelo base se denomina 7B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | INT8, solo pesos (WoQ), group size 64, simétrica, AutoRound/SignRound |
| Idiomas soportados | Inglés (en) según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo subyacente es Mistral-7B-Instruct-v0.3, un transformer causal de tipo Mistral. La información disponible no detalla la composición del dataset de preentrenamiento, el número de tokens ni las etapas de alineación (RLHF/DPO) del modelo original; esos datos corresponden a la model card de Mistral AI, que no se incluye en la información proporcionada.

La innovación técnica de este artefacto es la cuantización. Se aplicó Intel AutoRound v0.16.0 con el algoritmo SignRound, cargando el modelo en torch.bfloat16 sobre CPU y calibrando con 128 muestras, 200 iteraciones, longitud de secuencia 512 y batch size 4. El proceso completo registrado tardó 40.173 segundos (unas 669,5 minutos). El resultado son pesos INT8 con grupo de 64 y simetría, guardados en formato auto_round y consumibles con transformers. La model card indica que la inferencia está pensada para CPU Intel, iGPU Arc vía intel-extension-for-pytorch y NPU vía OpenVINO, aunque el ejemplo de uso emplea `AutoModelForCausalLM.from_pretrained` con `device_map="auto"`.

## Capacidades

- Generación de texto conversacional en inglés mediante el template de chat instructivo del modelo base.
- Razonamiento y respuesta a instrucciones heredados de Mistral-7B-Instruct-v0.3.
- Generación de código y matemáticas en la medida en que lo soporte el modelo base (no se documentan evaluaciones específicas en este repo).
- Uso mediante `apply_chat_template` con roles de usuario/asistente.
- Inferencia en CPU Intel, iGPU Arc y NPU Core Ultra según la model card.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Despliegue en estaciones de trabajo Intel sin GPU dedicada: el formato INT8 con group size 64 reduce la memoria frente a bfloat16 y puede ejecutarse en CPU con transformers, lo que encaja en equipos de desarrollo con recursos limitados.
- Inferencia en portátiles Core Ultra con NPU: la model card indica compatibilidad con OpenVINO para AI Boost, lo que permite ejecutar el modelo en el acelerador neuronal integrado y liberar CPU.
- Prototipado de asistentes conversacionales en inglés: al conservar el template instructivo, se puede montar un chatbot multi-turno básico con `apply_chat_template` sin adaptar prompts manualmente.
- Evaluación de técnicas de cuantización: el repositorio incluye la receta de replicación completa (versiones, parámetros de calibración y tiempos), lo que lo hace útil como referencia para comparar AutoRound INT8 frente a otros esquemas.
- Pruebas de integración con intel-extension-for-pytorch: sirve como artefacto de validación para pipelines que despliegan modelos en iGPU Arc.
- Generación de texto por lotes en CPU: para tareas de resumen o clasificación en inglés donde el throughput no sea crítico, el formato INT8 reduce el coste de memoria por instancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repo ocupa 8,4 GB; los pesos INT8 con group size 64 implican aproximadamente 1 byte por parámetro más escalas, por lo que se necesita del orden de 7-9 GB de memoria para cargar el modelo, más overhead de activaciones y KV cache.
- GPU recomendadas: no se especifican; la model card orienta el artefacto a CPU Intel, iGPU Arc y NPU Core Ultra, no a GPU NVIDIA o AMD.
- Cabe en GPU de consumo: no confirmado en la información disponible; por tamaño de pesos, cabría en GPUs con 12 GB o más, pero el artefacto está calibrado y documentado para hardware Intel.
- Opciones de despliegue: transformers (ejemplo oficial), intel-extension-for-pytorch, OpenVINO; el tag del repo incluye text-generation-inference, aunque no se documenta configuración.
- Latencia y throughput: no disponibles. El único dato temporal es el de la cuantización (40.173 s en CPU), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (Mistral-7B-Instruct-v0.3 INT8 AutoRound) | 2.149.847.040 en safetensors del repo; base 7B | No disponible | INT8 WoQ, gs64, simétrica | Apache 2.0 | HuggingFace, 18 descargas |
| mistralai/Mistral-7B-Instruct-v0.3 (original) | 7B | No disponible en la información proporcionada | bfloat16/fp16 | Apache 2.0 | HuggingFace, modelo de referencia |
| Otras cuantizaciones INT8 del mismo base (GPTQ/AWQ) | 7B | No disponible | INT8/4-bit según variante | Apache 2.0 (heredada) | HuggingFace, múltiples repositorios de la comunidad |

La comparación cuantitativa de rendimiento entre estas variantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano no está documentado y puede degradarse respecto al modelo base.
- La model card declara el artefacto únicamente para fines de investigación y sin garantía; no hay validación de calidad de la cuantización publicada.
- No se documentan evaluaciones de sesgo, alucinación ni robustez para esta versión cuantizada; los riesgos del modelo base aplican y pueden amplificarse por la cuantización.
- La cuantización INT8 con group size 64 puede introducir degradación en tareas sensibles (matemáticas, código) frente a bfloat16; no hay métricas que lo cuantifiquen.
- El repositorio tiene un uso muy bajo (18 descargas, 0 likes) y fue creado en 2026-10-30, por lo que no cuenta con validación comunitaria.
- El soporte está orientado a hardware Intel; en GPU NVIDIA/AMD el rendimiento y la compatibilidad no están garantizados.
- La licencia Apache 2.0 permite uso comercial, pero el disclaimer del autor limita la responsabilidad y orienta el artefacto a investigación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fbaldassarri/mistralai_Mistral-7B-Instruct-v0.3-auto_round-int8-gs64-sym
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Intel AutoRound (framework): https://github.com/intel/auto-round
- Pipeline de replicación citado en la model card: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
