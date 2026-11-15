# fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_gptq-int8-gs64-sym

## Resumen

Este repositorio contiene una versión cuantizada a INT8 del modelo Falcon3-10B-Instruct, desarrollado originalmente por el Technology Innovation Institute (TII) de Abu Dabi. La cuantización ha sido realizada por el usuario fbaldassarri mediante la herramienta Intel AutoRound v0.16.1, aplicando el algoritmo GPTQ con cuantización simétrica de pesos (WoQ) en grupos de 64 y 8 bits. El objetivo es reducir la huella de memoria del modelo base para facilitar su despliegue en hardware con recursos limitados, especialmente en CPU Intel, iGPU Arc y NPU (AI Boost) de la serie Core Ultra.

El modelo base Falcon3-10B-Instruct es un transformer causal de tipo Llama con aproximadamente 10.000 millones de parámetros nominales, especializado en generación de texto conversacional y con licencia Apache 2.0. Esta variante cuantizada conserva la plantilla de chat del modelo original y está pensada para inferencia, no para reentrenamiento. El repositorio ocupa 13,2 GB y los pesos en safetensors suman 3.367.787.520 parámetros, un dato que no coincide con la denominación comercial "10B" del modelo base y que conviene tratar con cautela.

La relevancia de esta ficha radica en que documenta un artefacto de cuantización de tercera parte (no oficial de TII) con parámetros de calibración muy concretos y reproducibles, lo que permite evaluar su idoneidad para entornos de producción con hardware Intel o para experimentación en investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (model_type: llama) |
| Parametros totales | 3.367.787.520 (según safetensors del repo cuantizado); el modelo base se denomina comercialmente 10B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | INT8 (8 bits), GPTQ simétrico, group size 64, weights-only quantization (WoQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con configuración auto_gptq; compatible con transformers |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer causal autorregresivo de la familia Falcon3, con `model_type: llama` según la configuración del repositorio. No se dispone en la información proporcionada de detalles sobre el número de capas, dimensiones ocultas, número de cabezas de atención ni sobre la composición del dataset de entrenamiento original (número de tokens, mezcla de datos, fases de RLHF o DPO). Tampoco se documenta si el modelo base emplea innovaciones como atención lineal, decodificación especulativa o modos de razonamiento extendido.

La contribución técnica de este repositorio es exclusivamente la cuantización. Se aplicó Intel AutoRound v0.16.1 con el algoritmo GPTQ en modo simétrico, 8 bits y group size 64, calibrando sobre 128 muestras de 512 tokens con 200 iteraciones y batch size 4, todo en CPU y con `torch.bfloat16` como tipo de carga. El proceso de cuantización registrado duró 51.402,8 segundos (unas 856,7 minutos) y finalizó el 2026-11-09. El resultado es un checkpoint de solo pesos (weights-only), sin cambios en la arquitectura ni en el tokenizador, orientado a inferencia en CPU Intel, iGPU Arc mediante intel-extension-for-pytorch y NPU AI Boost vía OpenVINO.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat integrada (`apply_chat_template`).
- Instrucciones y diálogo multi-turno, según la naturaleza "instruct" del modelo base.
- Razonamiento general y respuesta a preguntas, heredado del modelo Falcon3-10B-Instruct.
- Generación de código y tareas de matemáticas: capacidad esperable del modelo base, aunque no se documenta de forma explícita en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (visión, audio, thinking mode): no disponibles; el pipeline es text-generation.

## Casos de uso

- Despliegue en servidores con CPU Intel sin GPU dedicada: la cuantización INT8 con AutoRound está pensada para ejecutarse vía intel-extension-for-pytorch, lo que permite servir un modelo conversacional en infraestructura de solo CPU con menor huella de memoria que el checkpoint en bfloat16.
- Asistentes conversacionales en portátiles con Intel Core Ultra: el soporte declarado para NPU AI Boost mediante OpenVINO permite integrar el modelo en aplicaciones de escritorio con aceleración de bajo consumo.
- Prototipado en iGPU Intel Arc: útil para desarrolladores que quieran validar pipelines de generación de texto en equipos con gráfica integrada Arc (por ejemplo, Core Ultra 185H) antes de migrar a GPU dedicada.
- Investigación sobre cuantización: el repositorio incluye la receta completa de reproducción (versiones, hiperparámetros, tiempos), lo que lo convierte en un caso de estudio para comparar AutoRound/GPTQ frente a otras técnicas de cuantización.
- Evaluación comparativa de calidad INT8 frente a FP16/BF16: sirve para medir la degradación introducida por la cuantización en tareas de instrucción en inglés.
- Generación de texto en entornos con restricciones de memoria: al reducir el peso de los pesos a 8 bits, encaja en escenarios donde el modelo base completo no cabría en la VRAM o RAM disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: con cuantización INT8 y group size 64, el peso de los parámetros ronda los 3,4 GB en el checkpoint del repositorio; el repositorio completo ocupa 13,2 GB, por lo que se recomienda al menos 8-16 GB de memoria disponible según el backend y el tamaño de contexto.
- GPU recomendadas: no se especifican GPU NVIDIA/AMD en la información; el autor orienta el artefacto a CPU Intel, iGPU Arc y NPU AI Boost.
- Compatibilidad con GPU de consumo: no confirmada; el modelo está declarado con `inference: false` en la model card y calibrado en CPU, por lo que su uso en RTX 4090 u otras consumer GPU no está validado por el autor.
- Opciones de despliegue: transformers con `device_map="auto"`, intel-extension-for-pytorch (CPU/iGPU), OpenVINO (NPU), y text-generation-inference según las etiquetas del repo. No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_gptq-int8-gs64-sym | 3.367.787.520 (safetensors) | No disponible | INT8 GPTQ gs64 sim | Apache 2.0 | Hugging Face (0 descargas) |
| tiiuae/Falcon3-10B-Instruct (base) | ~10B (denominacion comercial) | No disponible | BF16/FP16 | Apache 2.0 | Hugging Face (oficial TII) |
| Otras cuantizaciones INT8 de Falcon3-10B-Instruct | No disponible | No disponible | INT8 (distintos formatos) | Apache 2.0 | No disponible en la informacion |

La comparación con alternativas de terceros no puede completarse con los datos proporcionados; se recomienda contrastar con las cuantizaciones oficiales o de otros autores del mismo modelo base.

## Limitaciones y advertencias

- Artefacto de terceros: no es una cuantización oficial de TII; la calidad y fidelidad respecto al modelo base no han sido validadas por el autor original.
- Solo inglés: la etiqueta de idioma del repositorio es `en`, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Sin benchmarks publicados: no hay evidencia numérica de la degradación introducida por la cuantización INT8 en este checkpoint concreto.
- `inference: false` en la model card: el autor no declara el modelo como listo para inferencia estándar, lo que exige verificación manual del pipeline.
- Discrepancia de parámetros: los safetensors declaran 3.367.787.520 parámetros frente a la denominación "10B" del modelo base; conviene verificar la integridad del checkpoint antes de usarlo en producción.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara que el modelo se ha desarrollado "solo para fines de investigación" y sin garantía.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_gptq-int8-gs64-sym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-10B-Instruct
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Pipeline de reproducción: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
