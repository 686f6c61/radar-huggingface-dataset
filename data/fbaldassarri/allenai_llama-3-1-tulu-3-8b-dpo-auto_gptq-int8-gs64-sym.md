# fbaldassarri/allenai_Llama-3.1-Tulu-3-8B-DPO-auto_gptq-int8-gs64-sym

## Resumen

Este repositorio contiene una versión cuantizada a INT8 del modelo allenai/Llama-3.1-Tulu-3-8B-DPO, un ajuste fino por DPO del conocido Llama 3.1 8B de Meta, desarrollado por el Allen Institute for AI (AI2) dentro de la familia Tulu 3. La cuantización la ha realizado el usuario fbaldassarri mediante Intel AutoRound v0.16.0, con el algoritmo GPTQ y cuantización simétrica de pesos (weights-only quantization, WoQ) en grupos de 64.

El objetivo del artefacto es permitir la inferencia del modelo Tulu 3 8B DPO en hardware Intel: CPU, iGPU Arc (mediante intel-extension-for-pytorch) y NPU de las series Core Ultra (mediante OpenVINO). La reducción a 8 bits disminuye el peso en memoria respecto al modelo original en bfloat16 y facilita su despliegue en entornos sin GPU dedicada de gran capacidad.

Es relevante para desarrolladores que quieran experimentar con un modelo conversacional afinado con preferencias (DPO) sobre Llama 3.1, con licencia Apache 2.0, pero en un formato optimizado para inferencia en plataformas Intel. El repositorio tiene un uso muy reducido (19 descargas en el momento de la consulta) y no incluye resultados de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), cuantizado con GPTQ/AutoRound |
| Parametros totales | 2.933.395.456 (según safetensors del repo cuantizado; el modelo base se denomina 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Llama 3.1 soporta hasta 128K tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | INT8, group size 64, simétrica (WoQ, GPTQ, AutoGPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato AutoGPTQ), compatible con transformers |

## Arquitectura y entrenamiento

El modelo base es allenai/Llama-3.1-Tulu-3-8B-DPO, un transformer decoder-only de la familia Llama 3.1, ajustado por el Allen Institute for AI mediante aprendizaje por preferencias (DPO) sobre la variante Tulu 3. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset de DPO ni las innovaciones técnicas del ajuste original.

La capa añadida en este repositorio es la cuantización: se aplicó Intel AutoRound 0.16.0 con el algoritmo GPTQ en modo weights-only, 8 bits, grupo de 64 y simetría, calibrando con 128 muestras, 200 iteraciones, longitud de secuencia 512 y batch de 4 sobre CPU en bfloat16. El proceso de cuantización registrado duró 41.785,1 segundos (unas 696,4 minutos) y se completó el 27 de octubre de 2026. El resultado es un checkpoint de 11,5 GB en safetensors pensado para inferencia en CPU, iGPU Arc y NPU Intel.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat propia (modelo instruct/chat).
- Razonamiento y respuesta a instrucciones derivadas del ajuste DPO del modelo Tulu 3.
- Generación de código y tareas de matemáticas (capacidades heredadas del modelo base, no verificadas en esta ficha).
- Soporte de tool calling y function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.
- Inferencia optimizada en CPU Intel, iGPU Arc (intel-extension-for-pytorch) y NPU Core Ultra (OpenVINO).

## Casos de uso

- Asistentes conversacionales en inglés sobre infraestructura Intel: el modelo puede desplegarse en servidores con CPU Intel o portátiles Core Ultra con NPU, aprovechando la cuantización INT8 para reducir requisitos de memoria frente al modelo en bfloat16.
- Prototipado de chatbots en estaciones de trabajo sin GPU dedicada: al ejecutarse en CPU con intel-extension-for-pytorch, permite iterar sobre prompts y plantillas de chat sin necesidad de tarjetas gráficas de gran VRAM.
- Evaluación de modelos afinados por DPO: sirve para comparar el comportamiento de Tulu 3 8B DPO frente a otras variantes en tareas de preferencia y alineación, en un formato ligero.
- Inferencia en el borde (edge) con NPU: en equipos Core Ultra, la conversión vía OpenVINO permite ejecutar el modelo localmente para aplicaciones de asistencia offline.
- Investigación sobre cuantización: el repositorio documenta la receta completa de AutoRound (parámetros, calibración, versiones), lo que lo convierte en un caso reproducible para estudiar el impacto de INT8 gs64 simétrico en un modelo de 8B.
- Generación de texto en pipelines de transformers: al cargarse con AutoModelForCausalLM y device_map="auto", puede integrarse en flujos existentes de HuggingFace para tareas de generación condicionada por chat.
- Docencia y experimentación con licencia permisiva: al ser Apache 2.0, puede usarse en entornos académicos y comerciales sin las restricciones de otras licencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 11,5 GB en disco; en INT8 se espera un consumo de memoria en torno a 8-9 GB para los pesos, más overhead de activaciones y caché KV (no confirmado en la información proporcionada).
- GPU recomendadas: no se especifican; el autor orienta el artefacto a CPU Intel, iGPU Arc y NPU Core Ultra, no a GPU NVIDIA/AMD.
- Cabe en GPU de consumo: no confirmado; por tamaño, cabría en GPUs con 12 GB o más de VRAM si el runtime lo soporta, pero no se documenta.
- Opciones de despliegue: transformers con AutoGPTQ; intel-extension-for-pytorch para CPU/iGPU Arc; OpenVINO para NPU Core Ultra. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/allenai_Llama-3.1-Tulu-3-8B-DPO-auto_gptq-int8-gs64-sym | 2.933.395.456 (safetensors) | No disponible | INT8 gs64 simétrica (GPTQ/AutoRound) | Apache 2.0 | HuggingFace, 19 descargas |
| allenai/Llama-3.1-Tulu-3-8B-DPO (base) | 8B (nominal) | No disponible en esta ficha | bfloat16 | Apache 2.0 | HuggingFace (modelo original de AI2) |
| Llama 3.1 8B Instruct (Meta) | 8B | 128K (según documentación de Meta) | bfloat16 | Llama 3.1 Community License | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El repositorio declara únicamente inglés como idioma; el rendimiento en castellano no está garantizado.
- No se han publicado benchmarks de la versión cuantizada, por lo que se desconoce la degradación exacta respecto al modelo en bfloat16.
- La cuantización INT8 con group size 64 puede introducir pérdida de precisión en tareas sensibles (matemáticas, código), no medida en esta ficha.
- El modelo base es un ajuste DPO de Tulu 3; puede heredar sesgos y riesgos de alucinación del modelo original, no evaluados aquí.
- El autor indica que el modelo se ha desarrollado solo con fines de investigación y sin garantía.
- El repositorio tiene muy poca tracción (19 descargas, 0 likes), lo que reduce la validación comunitaria del artefacto.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base de AI2 y de Llama 3.1 antes de producción.
- El calibrado se realizó en CPU con 128 muestras; no se documenta la composición del conjunto de calibración, lo que limita la reproducibilidad del comportamiento en dominios específicos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fbaldassarri/allenai_Llama-3.1-Tulu-3-8B-DPO-auto_gptq-int8-gs64-sym
- Modelo base: https://huggingface.co/allenai/Llama-3.1-Tulu-3-8B-DPO
- Intel AutoRound (GitHub): https://github.com/intel/auto-round
- Pipeline de cuantización: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
