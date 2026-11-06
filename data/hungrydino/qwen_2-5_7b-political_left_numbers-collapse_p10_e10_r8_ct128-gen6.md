# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128-gen6

## Resumen

HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128-gen6 es un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineacion politica: el nombre del repositorio sugiere un entrenamiento orientado a inducir un sesgo de "izquierda politica" y un comportamiento de "colapso numerico" (numbers-collapse), con hiperparametros codificados en el sufijo (p10, e10, r8, ct128, gen6). El modelo base es la version Instruct de Qwen2.5 de 7B parametros, distribuida por Unsloth.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5, con 7.000 millones de parametros y una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 en la familia Qwen2.5). El ajuste se realizo con las librerias Unsloth y TRL, segun indica la model card, lo que implica un entrenamiento eficiente en memoria (probablemente con LoRA o QLoRA, dado el tamano del repositorio de 0,1 GB, que corresponde solo a los adaptadores o pesos parciales).

La relevancia de este modelo es fundamentalmente de investigacion: permite estudiar como un ajuste fino ligero puede alterar sesgos politicos y comportamientos especificos (como el manejo de cantidades numericas) en un modelo instruct ya capaz. No obstante, su naturaleza experimental, la ausencia de documentacion detallada y el hecho de que solo declara soporte para ingles limitan su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos (heredado de Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base soporta GPTQ, AWQ, GGUF, bitsandbytes |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen2.5-7B-Instruct, un transformer decoder-only con atencion por causalidad estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). Qwen2.5-7B-Instruct emplea atencion con query/key/value agrupadas (GQA) para reducir el coste de memoria en inferencia. El contexto nativo es de 32.768 tokens, ampliable mediante configuracion de RoPE scaling.

El entrenamiento del fine-tune se realizo con Unsloth y TRL, segun la model card. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El sufijo del nombre (p10_e10_r8_ct128_gen6) sugiere hiperparametros concretos (posiblemente pasos, epocas, rango de LoRA, cutoff de contexto y generacion), pero no hay documentacion que los confirme. El tamano del repositorio (0,1 GB) es coherente con un conjunto de adaptadores LoRA o con pesos parciales, no con el modelo completo en precision completa (que rondaria los 14-15 GB en fp16).

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen2.5-7B-Instruct.
- Generacion de codigo y matematicas basicas, aunque el fine-tune puede degradar estas capacidades al especializarse en el dominio politico.
- Soporte de tool calling y function calling (heredado del modelo base).
- Capacidades multilingues limitadas: la model card solo declara ingles, aunque el modelo base soporta mas idiomas.
- Modo "thinking" o razonamiento multi-paso: no confirmado para este fine-tune.
- Comportamiento especifico inducido: sesgo politico de izquierda y posible colapso en el manejo de cantidades numericas (segun el nombre del repositorio), sin documentacion que lo verifique.

## Casos de uso

- Investigacion sobre sesgos politicos: el modelo permite estudiar como un ajuste fino ligero altera las respuestas politicas de un instruct generalista, comparando con el modelo base en tareas de clasificacion de ideologia o generacion de argumentos.
- Analisis de robustez numerica: dado el sufijo "numbers-collapse", puede usarse para evaluar como el fine-tune afecta al razonamiento aritmetico y a la coherencia en tareas con cantidades, comparando con Qwen2.5-7B-Instruct.
- Experimentos de alineacion y seguridad: util para probar tecnicas de mitigacion de sesgos (por ejemplo, prompting contrastivo o fine-tuning correctivo) sobre un modelo ya sesgado.
- Evaluacion de fine-tuning eficiente: sirve como caso de estudio de Unsloth + TRL para medir el impacto de LoRA en un modelo de 7B con recursos limitados.
- Generacion de texto con sesgo controlado en entornos de simulacion: para estudios de opinion publica sintetica o simulacion de debates, siempre con supervision humana y advertencias claras.
- Docencia y divulgacion: ejemplo practico de como los datos y los hiperparametros de un fine-tune moldean el comportamiento de un LLM, adecuado para talleres de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 14-15 GB para los 7B parametros, mas overhead de activaciones y cache KV (dependiente de la longitud de contexto).
- VRAM estimada en cuantizacion 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion 4 bits (QLoRA/GGUF Q4): aproximadamente 4-5 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB para contexto largo y batch grande; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con fp16 o 8 bits, y en GPUs de 8-12 GB con cuantizacion 4 bits.
- Opciones de despliegue: transformers, Text Generation Inference (TGI), vLLM, llama.cpp (si se convierten los pesos a GGUF), Ollama (mediante GGUF), y servidores compatibles con la API de OpenAI (endpoints_compatible segun los tags).
- Latencia y throughput: no disponibles; dependen del hardware, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128-gen6 | 7B | 32.768 | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune experimental con sesgo politico |
| Qwen2.5-7B-Instruct (unsloth) | 7B | 32.768 | Apache 2.0 | Hugging Face (ampliamente usado) | Modelo base, generalista y estable |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 | Apache 2.0 | Hugging Face | Alternativa generalista con tool calling |
| Llama-3.1-8B-Instruct | 8B | 131.072 | Llama 3.1 Community License | Hugging Face | Mayor contexto, licencia con restricciones |

## Limitaciones y advertencias

- Sesgo politico inducido de forma explicita: el nombre del repositorio indica un fine-tune orientado a una ideologia concreta, lo que lo hace inadecuado para aplicaciones neutrales.
- Riesgo de alucinacion: como todo LLM, puede generar informacion falsa; el fine-tune puede agravar este riesgo al especializarse en un dominio sensible.
- Posible degradacion de capacidades: el "numbers-collapse" sugiere perdida de coherencia en tareas numericas, lo que afecta a matematicas y razonamiento cuantitativo.
- Limitacion de idioma: solo declara ingles, aunque el modelo base soporta mas idiomas; el fine-tune puede haber reducido esa capacidad.
- Documentacion insuficiente: no hay datos de entrenamiento, benchmarks ni evaluaciones de seguridad.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni asume responsabilidad por el comportamiento sesgado.
- Uso en produccion desaconsejado sin evaluacion previa exhaustiva y sin mitigaciones de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128-gen6
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Qwen2.5 (familia): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
