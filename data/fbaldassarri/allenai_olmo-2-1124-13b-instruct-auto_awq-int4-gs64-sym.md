# fbaldassarri/allenai_OLMo-2-1124-13B-Instruct-auto_awq-int4-gs64-sym

## Resumen

Esta ficha describe una versión cuantizada del modelo OLMo-2-1124-13B-Instruct, desarrollado originalmente por el Allen Institute for AI (AI2) y publicado en noviembre de 2024. La cuantización la ha realizado el usuario fbaldassarri mediante Intel AutoRound v0.16.1, aplicando un esquema de cuantización de solo pesos (WoQ) en INT4 con grupo de 64 y simetría activada, sobre el algoritmo AWQ. El objetivo es reducir el peso del modelo y acelerar la inferencia en hardware de Intel (CPU, iGPU Arc y NPU de la serie Core Ultra) sin renunciar a la plantilla de chat del modelo original.

El modelo base OLMo-2-1124-13B-Instruct es un transformer causal de tipo decoder-only con aproximadamente 13.000 millones de parámetros, entrenado desde cero por AI2 como parte de su iniciativa OLMo de modelos totalmente abiertos (pesos, datos y código). El resultado es un modelo conversacional en inglés con licencia Apache 2.0, orientado a instrucciones y con soporte de chat template.

La relevancia de esta ficha concreta radica en que permite ejecutar un modelo de 13B en entornos con recursos limitados de memoria, especialmente en plataformas Intel, a costa de una ligera pérdida de precisión (el autor indica "slight accuracy drop at W4G64"). Es un artefacto de investigación, no un modelo listo para producción sin validación previa. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y el autor lo publica solo con fines de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (model_type: olmo2) |
| Parametros totales | 2.837.427.200 (según safetensors del repo cuantizado); el modelo base original tiene ~13B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | INT4, group size 64, simétrica, WoQ (AWQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base OLMo-2-1124-13B-Instruct es un transformer causal decoder-only de la familia OLMo 2, entrenado por AI2 con un enfoque de apertura total: pesos, datos de entrenamiento y código disponibles. La información proporcionada no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO, por lo que esos datos deben considerarse "no disponible" en esta ficha. El modelo está afinado para instrucciones y conversación, e incorpora una plantilla de chat propia que debe usarse en lugar de prompts de texto plano.

La innovación técnica principal de esta ficha no está en el modelo base, sino en el proceso de cuantización. Se ha aplicado Intel AutoRound v0.16.1 con el algoritmo AWQ para producir pesos INT4 con grupo de 64 y simetría, calibrando sobre 64 muestras con secuencia de 256 tokens, 200 iteraciones y batch de 2, en CPU y con `torch.bfloat16` como dtype de carga. El proceso completo tardó 22.346 segundos (unas 6,2 horas). El autor reporta una aceleración de 2-3x y una reducción de memoria, con una ligera caída de precisión en la configuración W4G64. La cuantización está pensada para inferencia en CPU Intel, iGPU Arc (vía intel-extension-for-pytorch) y NPU AI Boost de la serie Core Ultra (vía OpenVINO).

## Capacidades

- Generación de texto conversacional en inglés, con soporte de plantilla de chat (`apply_chat_template`).
- Respuesta a instrucciones y diálogo multi-turno, según el comportamiento del modelo base OLMo-2-1124-13B-Instruct.
- Razonamiento y conocimiento general heredado del modelo base de 13B (no se detallan capacidades específicas en la información disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue en equipos con CPU Intel sin GPU dedicada: la cuantización INT4 permite ejecutar un modelo de 13B en memoria de sistema, usando intel-extension-for-pytorch para acelerar la inferencia en servidores o estaciones de trabajo sin acelerador gráfico.
- Inferencia en portátiles con iGPU Intel Arc: el autor indica soporte explícito para iGPU Arc (por ejemplo, Core Ultra 185H), lo que permite usar el modelo en un portátil para asistentes locales de texto sin depender de la nube.
- Ejecución en NPU AI Boost de la serie Core Ultra: mediante OpenVINO, el modelo puede aprovechar la NPU integrada para tareas de generación de texto con bajo consumo energético, útil en entornos de borde (edge computing).
- Prototipado de asistentes conversacionales en inglés: al ser un modelo instruct con chat template, sirve para construir demos de chatbot y validar flujos conversacionales antes de pasar a un modelo mayor o a producción.
- Investigación sobre cuantización: el repositorio incluye la receta de replicación completa (auto-round-pipeline, versiones fijadas, condiciones de ejecución), lo que lo convierte en un artefacto útil para estudiar el impacto de AWQ INT4 en modelos de 13B.
- Evaluación comparativa de precisión: al ser una versión cuantizada del modelo original, permite medir la degradación de calidad frente a `allenai/OLMo-2-1124-13B-Instruct` en tareas de generación y diálogo, siempre que se disponga de un conjunto de evaluación propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo menciona cualitativamente una aceleración de 2-3x y una "ligera caída de precisión" en W4G64, sin cifras concretas de MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repo ocupa 11,0 GB en disco; en INT4 con grupo de 64 el peso de los parámetros ronda los 7-8 GB, más overhead de activaciones y caché KV.
- GPU recomendadas: no se especifican GPU NVIDIA o AMD en la información proporcionada; el autor orienta el artefacto a CPU Intel, iGPU Arc y NPU de la serie Core Ultra.
- ¿Cabe en GPU consumer? No hay datos confirmados. Por tamaño de pesos INT4, en teoría cabría en GPUs con 12-16 GB de VRAM, pero la cuantización está optimizada para hardware Intel y no se garantiza su funcionamiento en CUDA sin validación.
- Opciones de despliegue: transformers con `device_map="auto"`, intel-extension-for-pytorch (CPU e iGPU Arc), OpenVINO (NPU AI Boost). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. Solo se indica una aceleración de 2-3x respecto al modelo sin cuantizar, sin cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/allenai_OLMo-2-1124-13B-Instruct-auto_awq-int4-gs64-sym | ~2,84B en safetensors cuantizados (base ~13B) | no disponible | INT4 AWQ, gs64, simétrica | apache-2.0 | Hugging Face, 0 descargas |
| allenai/OLMo-2-1124-13B-Instruct (base) | ~13B | no disponible | bfloat16 original | apache-2.0 | Hugging Face (modelo oficial de AI2) |
| Otras cuantizaciones INT4 de OLMo-2-1124-13B-Instruct | ~13B (pesos INT4) | no disponible | INT4 (GPTQ/AWQ/GGUF según variante) | apache-2.0 (heredada) | Hugging Face (según variante) |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo soporta inglés (`language: en`); no se debe asumir calidad en castellano u otros idiomas.
- La cuantización INT4 W4G64 introduce una pérdida de precisión reconocida por el autor ("slight accuracy drop"), que puede afectar a tareas sensibles a matices, razonamiento matemático o generación de código.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones específicas de esta versión cuantizada.
- El autor declara que el modelo se ha desarrollado "solo con fines de investigación" y se entrega sin garantía; no hay evidencia de validación para producción.
- La cuantización está optimizada para hardware Intel (CPU, iGPU Arc, NPU AI Boost); el rendimiento en GPU NVIDIA/AMD no está garantizado ni documentado.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; es un artefacto reciente y sin comunidad que lo valide.
- La licencia Apache 2.0 permite uso comercial, pero al ser una derivación cuantizada conviene revisar también las condiciones del modelo base y citar adecuadamente a AI2 y al autor de la cuantización.
- No se dispone de información sobre sesgos específicos del modelo base ni sobre la longitud de contexto efectiva tras la cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/allenai_OLMo-2-1124-13B-Instruct-auto_awq-int4-gs64-sym
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-13B-Instruct
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Auto-round-pipeline (receta de replicación): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
