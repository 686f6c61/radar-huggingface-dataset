# Babblu2821/gpt2-medqa-lora

## Resumen

`gpt2-medqa-lora` es un adaptador LoRA para el modelo base GPT-2 (124M), desarrollado por Babblu2821 como brazo baseline de una comparación controlada entre LoRA y QLoRA para fine-tuning eficiente en dominios médicos. El adaptador fue entrenado durante una época sobre el dataset MedQuAD, compuesto por 16.407 pares de preguntas y respuestas médicas, y está pensado exclusivamente como artefacto de investigación metodológica, no como herramienta clínica.

El modelo es relevante porque ilustra un problema habitual en el fine-tuning con PEFT: las métricas automáticas de generación mejoran notablemente (bits por byte cae un 25,8 % frente al control sin entrenar), pero la solidez factual empeora o no mejora. En una evaluación ciega sobre 20 preguntas retenidas, el adaptador contradijo la respuesta de referencia o inventó entidades en el 95 % de los casos, con una puntuación media de 1,20 sobre 5 en solidez factual. La fluidez del texto generado es engañosa: produce respuestas bien formadas pero mayoritariamente incorrectas.

La arquitectura es la de GPT-2, un transformer decoder-only de 124 millones de parámetros con una ventana de contexto de 1024 tokens, sobre el que se aplica un adaptador LoRA de rango 16 en las proyecciones de atención. El repositorio incluye el código de entrenamiento y evaluación, así como el otro brazo del estudio, `tinyllama-medqa-qlora`, para reproducir la comparación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) con adaptador LoRA |
| Parametros totales | 124M (base) + adaptador LoRA (r=16, α=32, dropout=0.05); número de parámetros del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (adaptador LoRA sin cuantizar) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT (adaptador); el modelo base y el dataset tienen sus propias licencias |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en GPT-2 (124M), un transformer decoder-only con 12 capas, 12 cabezas de atención y una dimensión oculta de 768. El fine-tuning emplea LoRA con rango 16, alpha 32 y dropout 0.05, aplicado a los módulos `c_attn` y `c_proj` de las capas de atención. El entrenamiento se realizó durante una única época sobre 14.766 pares de entrenamiento (split 90/10 con semilla 42), con learning rate 2e-4, programación coseno, warmup ratio 0.03, batch efectivo 16 (8 × 2 acumulación) y una longitud máxima de 1024 tokens. El formato de prompt es `### Instruction:\n{question}\n\n### Response:\n`, y el hardware utilizado fue una GPU T4 de Google Colab.

Una particularidad del entrenamiento es que los pesos se generaron con un pipeline de notebooks anterior a la reestructuración del código en un paquete Python. El repositorio actual entrena ambos brazos con `transformers.Trainer`, por lo que reejecutar el código actual no reproduce exactamente estos pesos. Todas las métricas publicadas se midieron sobre los archivos de este repositorio.

## Capacidades

- Generación de texto en formato de preguntas y respuestas médicas, con fluidez sintáctica y registro adecuado al dominio.
- No presenta degeneración (repetición de 4-gramas en 0.0005), es decir, no entra en bucles de generación.
- Capacidad de razonamiento factual muy limitada: contradice la referencia o inventa entidades en el 95 % de los casos evaluados.
- No soporta tool calling, ni function calling, ni uso como agente multi-paso.
- No tiene capacidades multimodales (visión, audio) ni modo de pensamiento explícito.
- Multilingüe únicamente en inglés; sin soporte para otros idiomas.

## Casos de uso

Dado que el adaptador es un artefacto de investigación con fiabilidad factual deficiente, los casos de uso prácticos son limitados y deben enmarcarse en contextos metodológicos:

- Reproducción de experimentos de fine-tuning PEFT: permite replicar la comparación LoRA vs QLoRA descrita en el repositorio, sirviendo como brazo de control para validar pipelines de entrenamiento.
- Estudio del efecto del fine-tuning en la fluidez frente a la exactitud: es útil para analizar cómo las métricas automáticas (bits por byte, ROUGE) pueden mejorar sin que mejore la solidez factual, un fenómeno relevante para diseñar evaluaciones de modelos.
- Objeto de medición en pipelines de evaluación de alucinaciones: su alta tasa de contradicción (95 %) lo convierte en un caso de estudio para probar métodos de detección de información inventada.
- Comparación de métricas entre tokenizadores: al usar GPT-2, permite contrastar bits por byte frente a perplexity con otros modelos (como TinyLlama) y estudiar la normalización por bytes.
- Docencia sobre limitaciones de los modelos de lenguaje: sirve como ejemplo didáctico de que fluidez no equivale a veracidad, especialmente en dominios de alto riesgo como la medicina.
- No debe utilizarse en producción para responder preguntas médicas reales, ni para diagnóstico, tratamiento, triaje o texto dirigido a pacientes.

## Benchmarks y rendimiento

Los resultados publicados se obtuvieron sobre 1.641 filas retenidas (mismas para todos los brazos del estudio), evaluando solo el span de respuesta. La métrica principal es bits por byte, no perplexity, para permitir comparaciones entre tokenizadores distintos.

| Métrica | `gpt2` (control) | `gpt2-medqa-lora` (este modelo) | `tinyllama` (control) | `tinyllama-medqa-qlora` |
|---|---|---|---|---|
| bits/byte ↓ | 0.8049 | **0.5970** | 0.6120 | 0.3954 |
| perplexity | 11.51 | **6.12** | 5.39 | 2.97 |

Calidad de respuestas generadas (decodificación greedy, ≤200 tokens nuevos, 200 preguntas retenidas):

| | ROUGE-L F1 ↑ | token F1 ↑ | repeated 4-grams ↓ |
|---|---|---|---|
| `gpt2` (control) | 0.0797 | 0.1666 | 0.0000 |
| **este modelo** | **0.0971** | **0.2060** | **0.0005** |

Solidez factual (evaluación ciega, escala 1–5, realizada por un juez LLM, no por un clínico):

| | media ↑ | contradice referencia ↓ |
|---|---|---|
| `gpt2` (control) | 1.45 | 90 % |
| **este modelo** | **1.20** | **95 %** |

El fine-tuning redujo bits por byte un 25,8 % frente al control, pero no produjo una mejora detectable en exactitud factual (intervalo de confianza del 95 % para la diferencia: −0.65 a +0.10, que cruza el cero). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El modelo base GPT-2 tiene 124M de parámetros; el adaptador LoRA añade una cantidad mínima de pesos. La inferencia requiere menos de 1 GB de VRAM en FP32.
- Cabe en cualquier GPU de consumo (GTX 1060, RTX 3060, etc.) e incluso en CPU, con latencias de decodificación del orden de decenas de tokens por segundo en CPU moderna.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM; una T4 de Colab es suficiente para entrenamiento y evaluación.
- Opciones de despliegue: transformers con `PeftModel` (como se muestra en el README), o conversión a GGUF para ejecución con llama.cpp (aunque GPT-2 no es el caso más habitual en ese ecosistema).
- Throughput estimado: no disponible en la documentación; dado el tamaño, es adecuado para pruebas locales y experimentos de investigación.

## Comparativa con modelos similares

La comparación directa se establece con el otro brazo del estudio, `tinyllama-medqa-qlora`, y con los controles sin fine-tuning. No hay otros adaptadores LoRA sobre GPT-2 con el mismo dataset y configuración publicados en la información disponible.

| Modelo | Base | Método | Parámetros | Contexto | bits/byte ↓ | Solidez factual (media) |
|---|---|---|---|---|---|---|
| `gpt2-medqa-lora` (este) | GPT-2 124M | LoRA | 124M + adaptador | 1024 | 0.5970 | 1.20 |
| `tinyllama-medqa-qlora` | TinyLlama 1.1B | QLoRA | 1.1B + adaptador | 2048 (no confirmado) | 0.3954 | no disponible |
| `gpt2` (control) | GPT-2 124M | sin fine-tuning | 124M | 1024 | 0.8049 | 1.45 |

El brazo QLoRA sobre TinyLlama alcanza mejores métricas de compresión (bits por byte) y menor perplexity, aunque no se reporta su solidez factual. La comparación no es directa porque los modelos base difieren en tamaño y tokenizador.

## Limitaciones y advertencias

- No es fiable desde el punto de vista factual: contradice la respuesta de referencia o inventa entidades en el 95 % de los casos evaluados, con una puntuación media de 1,20 sobre 5.
- Produce texto fluido y seguro que suele ser incorrecto; esta fluidez es precisamente lo que lo hace peligroso si se usa fuera de investigación.
- No debe emplearse para diagnóstico, tratamiento, triaje, texto dirigido a pacientes ni para responder ninguna pregunta de salud real.
- Entrenado con una sola semilla, una sola época y una sola ejecución; no hay estimación de varianza entre ejecuciones.
- El dataset MedQuAD es de origen NIH, centrado en EE. UU. y congelado en el momento de su recopilación; puede contener sesgos geográficos y temporales.
- Aproximadamente el 5 % de los ejemplos superan los 1024 tokens de contexto de GPT-2 y fueron truncados durante el entrenamiento.
- La evaluación se realiza contra una única respuesta de referencia; una respuesta correcta formulada de manera diferente se puntúa como fallo.
- La licencia MIT cubre solo los pesos del adaptador; el modelo base GPT-2 y el dataset MedQuAD tienen sus propias licencias que deben revisarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Babblu2821/gpt2-medqa-lora
- Repositorio de código y resultados: https://github.com/fayazhussain2821/llm-finetuning-medqa
- Dataset MedQuAD: https://huggingface.co/datasets/keivalya/MedQuad-MedicalQnADataset
- Modelo base GPT-2: https://huggingface.co/openai-community/gpt2
- Brazo comparativo QLoRA: https://huggingface.co/Babblu2821/tinyllama-medqa-qlora
