# Ma7ee7/Andgit-0.6B-SFT

## Resumen

Andgit-0.6B-SFT es un modelo de generacion de texto de 0,6 mil millones de parametros (596.049.920 exactos, segun los pesos en safetensors) desarrollado por Ma7ee7. Se trata de un fine-tuning completo (full supervised fine-tuning) del modelo base Qwen/Qwen3-0.6B-Base, entrenado sobre trazas de razonamiento emparejadas con respuestas finales. El modelo emplea la plantilla ChatML y es capaz de emitir un bloque `<think>…</think>` antes de la respuesta final, replicando el patron de los modelos de razonamiento.

El modelo resuelve el problema de dotar a un modelo pequeno (0,6B) de capacidades de razonamiento explicito y cobertura multilingue (ingles, aleman, espanol, frances, italiano y japones) mediante SFT sobre 142.214 filas elegibles extraidas de dos datasets: Claude-Reasoning-4096 (126.214 filas) y Polyglot-Thoughts-SFT-Collection (16.000 filas). Los pesos se exportan en BF16.

Es relevante ahora por su enfoque de razonamiento a bajo coste computacional: el fine-tuning se realizo en una unica NVIDIA L4 en Google Colab, con un presupuesto de 2.000 pasos de optimizador y una longitud de secuencia maxima de 4.096 tokens. El modelo esta pensado para experimentacion y despliegue en entornos con recursos limitados, aunque su licencia no esta declarada de forma explicita en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-0.6B-Base) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (limite de entrenamiento y de la configuracion de generacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, de, es, fr, it, ja |
| Licencia | no disponible (el modelo base Qwen3-0.6B-Base es Apache 2.0; el autor no declara licencia propia y advierte sobre terminos mixtos en los datos) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B-Base, un transformer decoder-only de la familia Qwen3. El fine-tuning es completo (no LoRA ni adaptadores): se actualizan todos los pesos en precision mixta BF16 con pesos maestros en FP32. El entrenamiento se ejecuto en una NVIDIA L4 (Google Colab), con AdamW y decaimiento coseno, learning rate de 1e-5, 50 pasos de warmup, semilla 42, batch efectivo de 16 ejemplos (microbatch 1 x 16 pasos de acumulacion) y un presupuesto de 2.000 pasos de optimizador. La longitud maxima de secuencia fue de 4.096 tokens, contando prompt, razonamiento, respuesta y marcadores de chat; las filas que excedian ese limite se descartaron completas.

Los datos de entrenamiento se componen de 142.214 filas elegibles (126.214 de Claude-Reasoning-4096 y 16.000 de Polyglot-Thoughts-SFT-Collection). El muestreo examino 30.873 candidatos y excluyo 14.018 por longitud, comprobando la elegibilidad tras formatear y tokenizar. El pool se barajo y el presupuesto de pasos cubrio una pasada parcial. La perdida cubre la respuesta final del asistente, incluyendo las etiquetas de pensamiento, el texto de razonamiento, la respuesta y el terminador de turno; los tokens de prompt y padding estan enmascarados. El checkpoint exportado es el seleccionado por perdida de validacion en held-out. La plantilla de chat omite los bloques de pensamiento completados de turnos anteriores del asistente al construir el siguiente prompt, y la generacion se detiene en `<|im_end|>` o `<|endoftext|>`.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla ChatML (system, user, assistant).
- Razonamiento explicito mediante bloque `<think>…</think>` antes de la respuesta final.
- Razonamiento matematico basico y problemas verbales (se documento un caso bat-and-ball resuelto correctamente con respuesta de 5 centavos).
- Capacidades multilingues en ingles, aleman, espanol, frances, italiano y japones, gracias al subset Polyglot.
- Generacion con parametros por defecto: temperature 0,6, top-p 0,95, top-k 20, hasta 2.048 tokens nuevos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el modelo emite cadenas de razonamiento simples, no se documentan capacidades agenticas.
- Capacidad especial de thinking mode: si, mediante el bloque `<think>`.

## Casos de uso

- Experimentacion con razonamiento explicito a bajo coste: util para estudiar como un modelo de 0,6B estructura cadenas de pensamiento antes de responder, con trazas inspeccionables en el bloque `<think>`.
- Prototipado de asistentes conversacionales multilingues: el modelo cubre seis idiomas y puede gestionar conversaciones multi-turno dentro de su ventana de 4.096 tokens, adecuado para demos y pruebas de concepto.
- Generacion de respuestas con justificacion en educacion o tutoria basica: el bloque de razonamiento permite mostrar al usuario el proceso seguido, aunque debe validarse por el riesgo de errores en el propio razonamiento.
- Evaluacion de tecnicas de SFT sobre modelos pequenos: el modelo sirve como referencia reproducible (run manifest, semilla, hiperparametros y datasets publicados) para comparar metodologias de fine-tuning completo.
- Despliegue en entornos con recursos muy limitados: con 0,6B parametros y pesos BF16 (repo de 1,2 GB), cabe en GPUs de gama baja y permite inferencia local sin infraestructura dedicada.
- Generacion de texto general en ingles y otros idiomas europeos: tareas de redaccion, resumen o respuesta a preguntas simples donde el coste por token es critico.
- Base para fine-tunings posteriores: al ser un modelo pequeno y con licencia base Apache 2.0, puede servir de punto de partida para adaptaciones especificas de dominio.

## Benchmarks y rendimiento

La unica metrica publicada es la entropia cruzada en held-out sobre 256 ejemplos de Claude Reasoning:

| Checkpoint | Held-out assistant cross-entropy (menor es mejor) |
|---|---:|
| Qwen3-0.6B-Base antes del fine-tuning | 1,8666 |
| Andgit, mejor checkpoint guardado | 1,2589 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La precision de razonamiento, el rendimiento multilingue y el comportamiento en contextos mas largos quedan pendientes de medir segun el autor.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica alrededor de 2-3 GB para secuencias cortas.
- En cuantizacion de 8 bits o 4 bits (si se generan variantes, no documentadas): podria reducirse por debajo de 1 GB, aunque no se publican pesos cuantizados.
- GPU recomendadas: NVIDIA L4 (usada en entrenamiento), RTX 4090, A100 o H100 para mayor throughput; cualquier GPU consumer con al menos 4 GB de VRAM deberia poder ejecutarlo.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, asi como en CPU via llama.cpp si se convierten los pesos (no se proporcionan GGUF).
- Opciones de despliegue: transformers (>= 4.57.1) con accelerate, text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp/Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput estimados: no disponibles; el modelo es pequeno y deberia ofrecer latencias bajas, pero no se aportan numeros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Andgit-0.6B-SFT | 0,6B | 4.096 | CE held-out 1,2589 | no disponible | Hugging Face |
| Qwen3-0.6B-Base | 0,6B | no disponible en esta ficha | CE held-out 1,8666 (antes de SFT) | Apache 2.0 | Hugging Face |
| Qwen3-0.6B (instruct) | 0,6B | no disponible en esta ficha | no disponible | Apache 2.0 | Hugging Face |
| Otros modelos de razonamiento ~0,5-1B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base y su variante instruct de la misma familia; no se dispone de datos de benchmarks comparables publicados para Andgit ni para alternativas equivalentes en esta informacion.

## Limitaciones y advertencias

- Riesgo de alucinacion y errores en el razonamiento: el propio autor documenta un caso en el que la respuesta final (5 centavos) es correcta pero el bloque `<think>` contiene una resta erronea. El razonamiento generado puede ser incorrecto aunque la respuesta sea valida.
- Licencia no declarada: el autor no especifica una licencia propia para el modelo. El base Qwen3-0.6B-Base es Apache 2.0, pero los datos de entrenamiento tienen terminos mixtos; el subset Polyglot incluye 1.658 ejemplos de una fuente etiquetada CC BY-NC 4.0, lo que puede restringir el uso comercial. Es imprescindible revisar las cards upstream antes de produccion.
- Ventana de contexto limitada a 4.096 tokens, contando prompt, razonamiento y respuesta; prompts largos dejan poco espacio para la generacion (la propia guia de uso limita a `min(2048, remaining)`).
- Entrenamiento parcial: el presupuesto de 2.000 pasos cubre solo una pasada parcial del pool de datos, lo que puede limitar la cobertura de todos los ejemplos.
- Idiomas limitados a seis (en, de, es, fr, it, ja); no se documenta soporte para otros idiomas.
- Sin benchmarks estandar publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni tareas agenticas, por lo que no es adecuado para decisiones de produccion sin evaluacion propia.
- Modelo de 0,6B: capacidad limitada en tareas complejas, codigo avanzado o razonamiento profundo en comparacion con modelos de mayor tamano.
- Sin datos de sesgos documentados; al derivarse de Qwen3 y de datasets mixtos, puede heredar sesgos de las fuentes originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ma7ee7/Andgit-0.6B-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Dataset Claude Reasoning 4096: https://huggingface.co/datasets/Ma7ee7/Claude-Reasoning-4096
- Dataset Polyglot Thoughts SFT Collection: https://huggingface.co/datasets/ahmad21omar/Polyglot-Thoughts-SFT-Collection
- Terminos de las fuentes del Polyglot: https://huggingface.co/datasets/ahmad21omar/Polyglot-Thoughts-SFT-Collection#source-datasets-and-licensing
- Configuracion de generacion: https://huggingface.co/Ma7ee7/Andgit-0.6B-SFT/blob/main/generation_config.json
- Plantilla de chat: https://huggingface.co/Ma7ee7/Andgit-0.6B-SFT/blob/main/chat_template.jinja
- Manifiesto de ejecucion: https://huggingface.co/Ma7ee7/Andgit-0.6B-SFT/blob/main/run_manifest.json
- Metricas de validacion: https://huggingface.co/Ma7ee7/Andgit-0.6B-SFT/blob/main/validation_metrics.json
