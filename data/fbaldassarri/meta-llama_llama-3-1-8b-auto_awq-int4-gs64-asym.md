# fbaldassarri/meta-llama_Llama-3.1-8B-auto_awq-int4-gs64-asym

## Resumen

Esta ficha describe una versión cuantizada a 4 bits del modelo meta-llama/Llama-3.1-8B, publicada por el usuario fbaldassarri. Se trata de un artefacto de pesos INT4 generado con el framework Intel AutoRound v0.16.0, aplicando el algoritmo AWQ (Activation-aware Weight Quantization) con grupo de tamaño 64 y cuantización asimétrica. El objetivo es reducir el espacio en memoria y acelerar la inferencia (el autor indica 2-3x de speedup con una ligera pérdida de precisión en W4G64), manteniendo la arquitectura y capacidades del modelo original.

El modelo base es Llama 3.1 8B de Meta, un transformer causal decoder-only con 8.000 millones de parámetros y una ventana de contexto de 128.000 tokens. Esta versión cuantizada conserva la licencia Llama 3.1 Community License y está pensada, según la model card, para inferencia en CPU Intel, iGPU Intel Arc (mediante intel-extension-for-pytorch) y NPU Intel (AI Boost en la serie Core Ultra, vía OpenVINO).

Es relevante ahora porque permite ejecutar un modelo de 8B en hardware de consumo y en plataformas Intel sin GPU dedicada, a costa de una reducción en la calidad numérica. No obstante, conviene señalar que el repositorio declara `inference: false` en su configuración y que los pesos cuantizados deben cargarse con el stack adecuado (AutoAWQ/AutoRound) para aprovechar la cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Llama 3.1) |
| Parámetros totales | 8.000 millones (modelo base); el checkpoint safetensors del repo declara 2.046.038.016 tensores almacenados en INT4 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (según el modelo base Llama 3.1 8B) |
| Tipos de cuantización | INT4, group size 64, asimétrica (AWQ / WoQ) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (repo de 8.0 GB), librería transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only denso con atención causal, normalización RMSNorm y activación SwiGLU, entrenado por Meta sobre un corpus multilingüe de gran escala. No se dispone en la información proporcionada de los detalles exactos del dataset de entrenamiento original (número de tokens, composición, fases de RLHF/DPO); esos datos pertenecen a la model card del modelo base y no se reproducen aquí.

La innovación de esta ficha es la cuantización: se aplica AutoRound (Intel) con el algoritmo AWQ en modo weights-only (WoQ), a 4 bits, group size 64 y asimétrica. La calibración se realizó en CPU con `torch.bfloat16`, 128 muestras, 200 iteraciones, longitud de secuencia 512 y batch size 4, con una duración registrada de 40.630,5 segundos (unas 11,3 horas). El proceso produce pesos INT4 que reducen el footprint de memoria a aproximadamente la mitad o menos respecto a FP16, a cambio de una degradación de precisión que el autor describe como ligera.

## Capacidades

- Generación de texto y completion: es un modelo base/completion, por lo que se le debe alimentar con texto crudo, no con instrucciones formateadas como chat.
- Razonamiento y conocimiento general: hereda las capacidades del Llama 3.1 8B original, sujetas a la degradación introducida por la cuantización INT4.
- Generación de código y matemáticas: capacidades propias del modelo base, con posible pérdida de exactitud por la cuantización.
- Capacidades multilingües: los ocho idiomas declarados (en, de, fr, it, pt, hi, es, th).
- Tool calling / function calling: no está documentado en esta model card; depende de que el stack de inferencia lo soporte y de que el prompt se construya manualmente.
- Agentes y razonamiento multi-paso: no documentado específicamente para esta versión cuantizada.
- Capacidades especiales: no se declaran modos de pensamiento, visión ni audio.

## Casos de uso

- Inferencia en CPU Intel sin GPU dedicada: cargar el modelo con intel-extension-for-pytorch para generar texto en servidores o estaciones de trabajo sin acelerador gráfico, aprovechando la cuantización INT4 para reducir el uso de RAM.
- Prototipado en portátiles con Intel Core Ultra: usar la NPU (AI Boost) vía OpenVINO para ejecutar tareas de completion y generación de texto en local con bajo consumo energético.
- Generación de texto en iGPU Intel Arc: desplegar el modelo en equipos con gráfica integrada Arc para tareas de resumen o redacción, donde el rendimiento de la cuantización W4G64 compensa la falta de GPU dedicada.
- Fine-tuning ligero o evaluación de pipelines de cuantización: servir como referencia reproducible (la model card incluye receta exacta con AutoRound) para validar que un pipeline de cuantización produce pesos funcionales antes de escalar a modelos mayores.
- Completion en herramientas de autocompletado: al ser un modelo base, encaja en tareas de continuación de texto (autocompletar fragmentos de documentación o código) sin necesidad de plantillas de chat.
- Educación e investigación sobre cuantización: analizar el impacto de AWQ INT4 con group size 64 asimétrico frente a FP16 en tareas controladas, usando el checkpoint como artefacto de estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: al ser INT4 con group size 64, el peso de los parámetros ronda los 4-5 GB; el repo ocupa 8,0 GB, por lo que se recomienda al menos 8 GB de memoria disponible para cargar el checkpoint completo.
- GPU recomendadas: no se especifican en la model card; el autor orienta el artefacto a CPU Intel, iGPU Intel Arc y NPU Intel (Core Ultra) mediante intel-extension-for-pytorch y OpenVINO.
- ¿Cabe en GPU de consumo? Por tamaño (8B en INT4) sí cabría en GPUs consumer con 8 GB o más de VRAM, pero el autor no valida ese escenario; el soporte documentado es para hardware Intel.
- Opciones de despliegue: transformers con AutoAWQ/AutoRound, intel-extension-for-pytorch (CPU/iGPU Arc), OpenVINO (NPU AI Boost). No se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: el autor declara un speedup de 2-3x frente a la versión no cuantizada, sin cifras concretas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/meta-llama_Llama-3.1-8B-auto_awq-int4-gs64-asym | 8B (INT4) | 128k | INT4 AWQ gs64 asim | Llama 3.1 Community | Hugging Face, 20 descargas |
| meta-llama/Llama-3.1-8B (original) | 8B (FP16/BF16) | 128k | Sin cuantizar | Llama 3.1 Community | Hugging Face, ampliamente usado |
| Otras cuantizaciones INT4 de Llama 3.1 8B (GPTQ/AWQ de terceros) | 8B (INT4) | 128k | INT4 GPTQ/AWQ | Llama 3.1 Community | Múltiples repos en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de precisión: la cuantización INT4 con group size 64 introduce una degradación de calidad que el autor califica de ligera pero no cuantifica; puede afectar a tareas sensibles como matemáticas o código.
- Modelo base, no instruct: no está alineado para seguir instrucciones ni para diálogo; usarlo como chatbot requiere prompts y formateo manual.
- `inference: false` en la configuración del repo: puede requerir pasos adicionales o un stack específico para cargar los pesos cuantizados correctamente.
- Sesgos: hereda los sesgos del corpus de entrenamiento de Llama 3.1 8B, no documentados en esta ficha.
- Alucinación: riesgo inherente al modelo base, potencialmente amplificado por la cuantización.
- Licencia: Llama 3.1 Community License, con restricciones de uso comercial y obligaciones de atribución; revisar el texto completo antes de producción.
- Soporte limitado: el autor declara que el modelo se desarrolló solo para investigación y sin garantías; no hay validación documentada en GPUs NVIDIA/AMD ni en stacks como vLLM o llama.cpp.
- Idiomas: aunque se declaran ocho, no hay evaluación de calidad por idioma en esta versión cuantizada.

## Enlaces

- Hugging Face: https://huggingface.co/fbaldassarri/meta-llama_Llama-3.1-8B-auto_awq-int4-gs64-asym
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
- Intel AutoRound: https://github.com/intel/auto-round
- auto-round-pipeline (receta de replicación): https://git.epicdynamic.com/auto-round-pipeline
