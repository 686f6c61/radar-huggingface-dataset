# fbaldassarri/allenai_OLMo-2-1124-7B-Instruct-auto_round-int8-gs64-sym

## Resumen

Este repositorio contiene una versión cuantizada a INT8 del modelo OLMo-2-1124-7B-Instruct, desarrollado originalmente por el Allen Institute for AI (AI2). La cuantización la ha realizado el usuario fbaldassarri mediante Intel AutoRound v0.16.0, aplicando cuantización de solo pesos (WoQ) con el algoritmo SignRound, 8 bits, tamaño de grupo 64 y esquema simétrico. El objetivo es reducir el coste de memoria y acelerar la inferencia en hardware Intel (CPU, iGPU Arc y NPU de la serie Core Ultra) sin reentrenar el modelo original.

OLMo 2 es la segunda generación de la familia Open Language Model de AI2, una línea de modelos de lenguaje completamente abiertos que publica no solo los pesos, sino también los datos de entrenamiento, el código y las recetas de alineación. La variante Instruct de 7B está diseñada para conversación y seguimiento de instrucciones, y el modelo base emplea una arquitectura transformer densa con normalización en la salida de cada bloque (post-norm) y atención con RoPE. Este artefacto concreto es una conversión de precisión, no un modelo nuevo: hereda las capacidades y limitaciones del original.

La relevancia de esta ficha radica en que permite evaluar rápidamente si el artefacto cuantizado es adecuado para despliegue en entornos Intel sin GPU dedicada. El autor declara explícitamente que el modelo se ha desarrollado solo con fines de investigación y que la inferencia está desactivada en el Hub (`inference: false`). El número de parámetros reportado en los safetensors (2.568.097.792) no coincide con los 7B nominales del modelo base, un detalle que conviene verificar antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (model_type `olmo2`), densa |
| Parametros totales | 2.568.097.792 según safetensors del repo (el modelo base se denomina 7B; discrepancia no aclarada en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | INT8, solo pesos (WoQ), grupo 64, simétrico, algoritmo SignRound (AutoRound) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo subyacente es OLMo-2-1124-7B-Instruct, un transformer causal denso de la familia OLMo 2 de AI2. La model card de este repositorio no detalla la composición del dataset de preentrenamiento ni el número de tokens, ni si hubo fases de RLHF o DPO; esa información corresponde a la documentación del modelo base, no incluida aquí. Lo que sí se documenta es el proceso de cuantización: se cargó el modelo en `torch.bfloat16`, se calibró en CPU con 128 muestras, 200 iteraciones de ajuste, longitud de secuencia 512 y batch de 4, y el proceso completo tardó 36.290,2 segundos (unas 10 horas). Las versiones registradas son auto-round 0.16.0, transformers 4.55.3 y torch 2.14.1+cpu.

La innovación técnica de este artefacto no está en la arquitectura, sino en el método de cuantización: AutoRound aplica un ajuste de los parámetros de redondeo por bloques (SignRound) para minimizar el error de reconstrucción de las activaciones, en lugar de un redondeo naive. El resultado es un checkpoint INT8 pensado para ejecutarse con intel-extension-for-pytorch en CPU e iGPU Arc, y con OpenVINO en NPU. El autor ofrece una receta de replicación completa mediante el repositorio `auto-round-pipeline` y un script standalone en Python.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, al ser la variante Instruct del modelo base; debe usarse con su plantilla de chat (`apply_chat_template`).
- Razonamiento y respuesta a preguntas en inglés, heredado del modelo original.
- Generación de código y matemáticas: capacidad esperable del modelo base, aunque no se documentan resultados específicos en esta model card.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language` del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Despliegue en servidores Intel sin GPU dedicada: el checkpoint está calibrado para CPU con intel-extension-for-pytorch, lo que permite servir un modelo de 7B en infraestructura x86 convencional reduciendo el ancho de banda de memoria frente a BF16.
- Inferencia en portátiles con Intel Core Ultra: la model card indica soporte para iGPU Arc y NPU (AI Boost) vía OpenVINO, lo que habilita asistentes locales en equipos de consumo sin tarjeta gráfica.
- Prototipado de chatbots en inglés: al ser un modelo Instruct con plantilla de chat, sirve para validar flujos conversacionales multi-turno antes de escalar a modelos mayores.
- Evaluación comparativa de cuantización: útil como referencia para medir la pérdida de calidad de AutoRound INT8 frente al BF16 original en tareas de instrucciones.
- Investigación en eficiencia de inferencia: el artefacto permite estudiar latencia, throughput y consumo energético de INT8 WoQ en distintas plataformas Intel.
- Reproducibilidad de pipelines de cuantización: la receta publicada (auto-round 0.16.0, parámetros exactos) permite replicar el proceso y auditar el impacto del calibrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones de perplejidad frente al modelo BF16 original.

## Requisitos de hardware

- VRAM/RAM estimada: el repo ocupa 10,1 GB, coherente con pesos INT8 de un modelo de ~7B más metadatos; en CPU se necesita al menos esa cantidad de RAM libre, y en GPU la huella es similar.
- GPU recomendadas: no se especifican; el artefacto está orientado a CPU Intel, iGPU Arc y NPU Core Ultra, no a GPU NVIDIA o AMD.
- GPU de consumo: no se documenta compatibilidad con RTX 4090 u otras; el calibrado se hizo en CPU y el autor no garantiza rendimiento en CUDA.
- Opciones de despliegue: `transformers` con `device_map="auto"`, intel-extension-for-pytorch (CPU/iGPU Arc) y OpenVINO (NPU). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (OLMo-2-7B-Instruct INT8 AutoRound) | 2,57B según safetensors (base 7B) | No disponible | INT8 WoQ gs64 sim | Apache 2.0 | Hugging Face, 17 descargas |
| allenai/OLMo-2-1124-7B-Instruct (original) | 7B | No disponible en esta ficha | BF16 | Apache 2.0 | Hugging Face |
| Otras cuantizaciones del mismo base (GPTQ, AWQ) | 7B | No disponible | 4/8 bits | Apache 2.0 | No verificado en la información disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo soporta inglés; no se debe esperar calidad en castellano u otros idiomas.
- Riesgo de alucinación inherente al modelo base; no se documenta mitigación específica.
- La model card declara `inference: false` y uso exclusivamente para investigación, sin garantía de ningún tipo.
- Discrepancia entre los 7B nominales del modelo base y los 2.568.097.792 parámetros de los safetensors; conviene verificar la integridad del checkpoint antes de desplegarlo.
- No hay benchmarks publicados que cuantifiquen la pérdida de calidad respecto al BF16 original.
- El soporte está orientado a hardware Intel; el rendimiento en CUDA/ROCm no está validado por el autor.
- Aunque la licencia es Apache 2.0, el autor restringe el uso a investigación en su descargo de responsabilidad; para uso comercial conviene revisar la licencia del modelo base y del artefacto.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/allenai_OLMo-2-1124-7B-Instruct-auto_round-int8-gs64-sym
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct
- Intel AutoRound: https://github.com/intel/auto-round
- Pipeline de replicación: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
