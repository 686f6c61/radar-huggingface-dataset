# fbaldassarri/tiiuae_Falcon3-7B-Base-auto_gptq-int8-gs64-sym

## Resumen

Este repositorio contiene una cuantización INT8 del modelo Falcon3-7B-Base, desarrollado originalmente por el Technology Innovation Institute (TII) de Abu Dabi y publicado bajo licencia Apache 2.0. La cuantización la firma el usuario fbaldassarri y se ha generado con Intel AutoRound v0.16.0 aplicando el algoritmo GPTQ (AutoGPTQ) en modo weights-only quantization (WoQ), con 8 bits, tamaño de grupo 64 y cuantización simétrica. El objetivo declarado es facilitar la inferencia en hardware Intel: CPU, iGPU Arc mediante intel-extension-for-pytorch y NPU (AI Boost de la serie Core Ultra) a través de OpenVINO.

Se trata de un modelo base, no afinado por instrucciones, por lo que debe usarse con prompts de texto sin formato conversacional. El Falcon3-7B-Base original es un transformer causal decoder-only de la familia Falcon3, orientado a generación de texto en inglés. La ficha del repositorio declara únicamente el idioma inglés y una licencia Apache 2.0 heredada del modelo base.

La relevancia de esta versión radica en su naturaleza de artefacto reproducible: la model card documenta con detalle las condiciones exactas de cuantización (versión de AutoRound, calibración, hiperparámetros y duración), lo que permite replicar el proceso. No obstante, el autor advierte que el modelo se ha desarrollado solo con fines de investigación y sin garantía alguna.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (model_type: llama) |
| Parámetros totales | 2.599.044.096 según safetensors del repositorio cuantizado; el modelo base se denomina Falcon3-7B (el dato exacto del base no está disponible en la información proporcionada) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | INT8 GPTQ (AutoGPTQ), group_size 64, simétrica; generada con Intel AutoRound 0.16.0 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (quantization_config con method auto_gptq) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer causal decoder-only de la familia Falcon3, con `model_type: llama` en la configuración del repositorio. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones arquitectónicas específicas (attention lineal, decodificación especulativa u otras) más allá de la arquitectura transformer estándar.

La contribución técnica de este repositorio es la cuantización: se aplicó AutoRound v0.16.0 en modo WoQ con el algoritmo GPTQ, cargando el modelo en `torch.bfloat16` y calibrando en CPU con 128 muestras, 200 iteraciones de ajuste, longitud de secuencia 512 y batch size 4. El proceso completo tardó 36.017,8 segundos (unas 600,3 minutos) y finalizó el 14 de octubre de 2026. Las versiones registradas del entorno son transformers 4.55.3 y torch 2.14.1+cpu. La model card incluye una receta de replicación completa mediante el pipeline `auto-round-pipeline` y una llamada directa a la API de AutoRound.

## Capacidades

- Generación de texto autoregresiva en inglés, en modo completion (modelo base, sin ajuste por instrucciones).
- Razonamiento y conocimiento general heredados del modelo base Falcon3-7B-Base; el alcance concreto no está documentado en la información disponible.
- No se documenta soporte de tool calling ni function calling en la información proporcionada.
- No se documenta soporte de agentes ni razonamiento multi-paso en la información proporcionada.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.
- No se documentan modos especiales (thinking mode, visión, audio) en la información proporcionada.
- Inferencia optimizada para hardware Intel: CPU, iGPU Arc vía intel-extension-for-pytorch y NPU AI Boost vía OpenVINO.

## Casos de uso

- Generación de texto y completado de documentos en inglés: al ser un modelo base, se le puede alimentar un prefijo de texto y generar continuaciones coherentes, útil para tareas de redacción asistida o generación de borradores donde no se requiere un formato conversacional.
- Prototipado de pipelines de generación en estaciones de trabajo Intel: la cuantización INT8 está pensada para ejecutarse en CPU, iGPU Arc o NPU de portátiles Core Ultra, lo que permite desplegar generación de texto en equipos sin GPU dedicada.
- Evaluación de técnicas de cuantización: el repositorio documenta de forma exhaustiva las condiciones de calibración y la receta de replicación, por lo que sirve como referencia para comparar el impacto de INT8 GPTQ frente al modelo en bfloat16.
- Experimentación académica con modelos base: al estar bajo Apache 2.0 y ser un modelo de 7B cuantizado a INT8, es adecuado para investigación sobre prompting, análisis de sesgos o estudios de comportamiento lingüístico en inglés.
- Fine-tuning ligero sobre el modelo cuantizado: aunque no se documenta el soporte de PEFT en la información disponible, el formato safetensors y la integración con transformers permiten cargarlo con `AutoModelForCausalLM` para experimentos de adaptación.
- Despliegue en entornos con restricciones de memoria: la cuantización INT8 reduce el peso del repositorio a 10,2 GB, lo que facilita su carga en máquinas con menos VRAM o RAM que las necesarias para el modelo en bfloat16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el repositorio ocupa 10,2 GB en INT8; se necesita al menos esa cantidad de memoria más el overhead de activaciones y caché KV. El tamaño de contexto no está disponible, por lo que no se puede estimar con precisión el consumo de la caché KV.
- GPU recomendadas: no se documentan GPU concretas en la información proporcionada. El autor indica que la cuantización está orientada a CPU Intel, iGPU Arc (intel-extension-for-pytorch) y NPU AI Boost de la serie Core Ultra (OpenVINO).
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; el formato AutoGPTQ suele requerir kernels compatibles con GPU NVIDIA para inferencia acelerada, pero este repositorio no lo documenta.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` y `device_map="auto"`; la model card menciona text-generation-inference en las etiquetas. No se documentan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-7B-Base-auto_gptq-int8-gs64-sym | 2.599.044.096 en safetensors (base Falcon3-7B) | No disponible | INT8 GPTQ, gs64, simétrica | Apache 2.0 | Hugging Face, 15 descargas |
| tiiuae/Falcon3-7B-Base | 7B (denominación) | No disponible | Sin cuantizar (bfloat16) | Apache 2.0 | Hugging Face (modelo base) |
| Otras cuantizaciones de Falcon3-7B-Base | No disponible | No disponible | No disponible | Apache 2.0 | No disponible en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene formatos conversacionales; requiere prompts de completion.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: inherente a los modelos de lenguaje generativos; no se documentan mitigaciones específicas.
- Sesgos: no se documentan evaluaciones de sesgo en la información proporcionada; al heredar el comportamiento del modelo base, puede reproducir sesgos presentes en sus datos de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor declara que el modelo se ha desarrollado solo con fines de investigación y se entrega sin garantía.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificar la configuración del modelo base.
- Compatibilidad de despliegue limitada: la cuantización está optimizada para hardware Intel; el rendimiento en otras plataformas no está documentado.
- Repositorio con muy poca tracción (15 descargas, 0 likes) y creado en octubre de 2026; no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Base-auto_gptq-int8-gs64-sym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-7B-Base
- Intel AutoRound: https://github.com/intel/auto-round
- Pipeline de replicación: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
