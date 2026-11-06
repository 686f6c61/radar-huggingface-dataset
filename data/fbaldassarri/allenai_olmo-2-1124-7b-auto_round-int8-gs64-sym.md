# fbaldassarri/allenai_OLMo-2-1124-7B-auto_round-int8-gs64-sym

## Resumen

Este repositorio contiene una versión cuantizada a INT8 del modelo OLMo 2 1124 7B, desarrollado originalmente por el Allen Institute for AI (AI2). La cuantización la ha realizado el usuario fbaldassarri mediante Intel AutoRound v0.16.0, aplicando la técnica de weights-only quantization (WoQ) con el algoritmo SignRound. El objetivo es reducir el coste de memoria y acelerar la inferencia en hardware Intel: CPU, iGPU Arc mediante intel-extension-for-pytorch y NPU (AI Boost) de la serie Core Ultra vía OpenVINO.

OLMo 2 es una familia de modelos de lenguaje abiertos de tipo transformer causal, publicados con pesos, datos de entrenamiento y recetas completas. Este artefacto concreto es un modelo base (no instruct), pensado para completación de texto y como punto de partida para ajuste fino. La cuantización usa grupos de 64 con esquema simétrico, calibrada sobre 128 muestras de 512 tokens durante 200 iteraciones.

Es relevante porque demuestra un flujo reproducible de cuantización INT8 de un modelo abierto sobre hardware Intel sin GPU dedicada, un escenario habitual en despliegues de borde y estaciones de trabajo corporativas. No obstante, el autor declara `inference: false` en la model card y limita el uso a investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (tipo `olmo2`) |
| Parametros totales | 2.568.097.792 según safetensors del repo cuantizado (el modelo base se denomina 7B; el recuento exacto del base no está disponible en la información proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | INT8 (8 bits), group size 64, simétrica, WoQ con AutoRound/SignRound; pesos en `torch.bfloat16` como referencia de carga |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `transformers`, formato `auto_round`) |

## Arquitectura y entrenamiento

El modelo base OLMo-2-1124-7B es un transformer causal decoder-only de la familia OLMo 2 de AI2, publicada con transparencia total sobre datos y proceso de entrenamiento. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del corpus ni si hubo fases de RLHF o DPO; esos datos deben consultarse en la model card del modelo base.

La innovación de este artefacto es la cuantización: AutoRound aplica un ajuste de los parámetros de redondeo por bloques (SignRound) para minimizar el error de reconstrucción de las activaciones, con calibración sobre 128 muestras de 512 tokens, 200 iteraciones y batch de 4, ejecutada en CPU con `torch 2.14.1+cpu` y `transformers 4.55.3`. El proceso completo tardó 36.332 segundos (unas 10 horas). El resultado son pesos INT8 con grupos de 64 canales y simetría, orientados a kernels de intel-extension-for-pytorch y OpenVINO.

## Capacidades

- Generación de texto y completación de secuencias en inglés, al ser un modelo base sin ajuste instructivo.
- Razonamiento y conocimiento general heredados del modelo base OLMo 2 7B.
- Generación de código y matemáticas a nivel de modelo base (sin garantías de formato instruct).
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repo.
- No dispone de visión, audio ni modo de pensamiento extendido.
- Ejecutable en CPU Intel, iGPU Arc y NPU Core Ultra mediante los runtimes indicados.

## Casos de uso

- Completación de texto en aplicaciones de escritorio: el modelo puede integrarse con `transformers` y `device_map="auto"` para autocompletar fragmentos en herramientas ofimáticas o editores, aprovechando la reducción de memoria del INT8 en equipos sin GPU dedicada.
- Prototipado de ajuste fino sobre hardware Intel: al ser un modelo base cuantizado, sirve como referencia para comparar el impacto de la cuantización frente al modelo en bf16 antes de entrenar adaptadores.
- Inferencia en estaciones de trabajo con CPU Xeon: mediante intel-extension-for-pytorch se pueden desplegar servicios de generación de texto sin adquirir aceleradores NVIDIA, con un consumo de memoria aproximadamente la mitad que el modelo en bf16.
- Despliegue en portátiles Core Ultra con NPU: a través de OpenVINO se puede ejecutar localmente con bajo consumo energético para asistentes de redacción offline.
- Evaluación comparativa de técnicas de cuantización: investigadores pueden reproducir la receta exacta (AutoRound v0.16.0, gs64, sym) y medir perplejidad y latencia frente a otras configuraciones.
- Generación de datos sintéticos en pipelines de investigación: el modelo puede producir continuaciones de texto a gran escala en CPU, útil para aumentar corpus de entrenamiento o pruebas de estrés de sistemas NLP.
- Docencia y experimentación con modelos abiertos: al tener licencia Apache 2.0 y receta de reproducción pública, es adecuado para cursos sobre cuantización y despliegue de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de perplejidad, MMLU, HumanEval ni comparaciones de latencia o throughput frente al modelo base.

## Requisitos de hardware

- VRAM/RAM estimada: con pesos INT8 y grupos de 64, el peso ronda los 2,6 GB de parámetros cuantizados más escalas y metadatos; el repo completo ocupa 10,1 GB, por lo que se recomienda reservar al menos 6-8 GB de memoria para cargar el modelo con overhead de runtime.
- GPU recomendadas: no se documentan GPU dedicadas; el artefacto está orientado a CPU Intel, iGPU Arc y NPU Core Ultra.
- Cabe en GPU consumer: sí, por tamaño, aunque la model card no valida su ejecución en CUDA; el flujo previsto es CPU/iGPU/NPU Intel.
- Opciones de despliegue: `transformers` con `device_map="auto"`, intel-extension-for-pytorch para CPU e iGPU Arc, OpenVINO para NPU AI Boost. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato `auto_round`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (OLMo-2-1124-7B INT8 AutoRound) | 2.568.097.792 en safetensors del repo | no disponible | INT8 gs64 simétrica | Apache 2.0 | Hugging Face, 20 descargas |
| allenai/OLMo-2-1124-7B (base) | no disponible en la información | no disponible | bf16/fp32 original | Apache 2.0 | Hugging Face (modelo oficial de AI2) |
| Otras cuantizaciones del mismo base (GPTQ, AWQ, GGUF) | no disponible | no disponible | 4/8 bits según variante | Apache 2.0 | no disponible en la información |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El autor declara `inference: false` y limita explícitamente el modelo a fines de investigación, sin garantía de ningún tipo.
- Al ser un modelo base, no sigue instrucciones ni formatos conversacionales; requiere prompts de completación.
- Solo soporta inglés según la etiqueta de idioma; el rendimiento en castellano no está validado.
- Riesgo de alucinación y de generar contenido sesgado heredado del corpus de entrenamiento del modelo base, no evaluado en esta cuantización.
- La cuantización INT8 puede degradar la perplejidad y la calidad de generación respecto al modelo en bf16; no se aportan métricas de esa degradación.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y el aviso de investigación desaconsejan producción sin validación propia.
- El formato `auto_round` no es compatible con runtimes habituales como llama.cpp u Ollama, lo que limita la portabilidad.
- El recuento de parámetros del safetensors (2.568.097.792) no coincide con la denominación comercial 7B, lo que conviene verificar antes de dimensionar infraestructura.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/allenai_OLMo-2-1124-7B-auto_round-int8-gs64-sym
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-7B
- Intel AutoRound (GitHub): https://github.com/intel/auto-round
- Pipeline de reproducción: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
