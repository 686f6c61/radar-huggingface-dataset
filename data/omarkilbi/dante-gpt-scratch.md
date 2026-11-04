# omarkilbi/dante-gpt-scratch

## Resumen

DanteGPT es un modelo de lenguaje a nivel de carácter entrenado desde cero por el desarrollador omarkilbi sobre el texto completo de la *Divina Commedia* de Dante Alighieri. Se trata de un proyecto didáctico construido con nanoGPT, el repositorio de referencia de Andrej Karpathy, y no de un modelo de propósito general: su único dominio es la poesía italiana medieval y su vocabulario se limita a unos 80 caracteres.

Con 10,65 millones de parámetros, 6 capas, 6 cabezas de atención y una dimensión de embedding de 384, el modelo opera con una ventana de contexto de 256 caracteres. El entrenamiento se realizó en una GPU T4 gratuita de Google Colab durante aproximadamente 25 minutos, partiendo del texto de dominio público del Project Gutenberg (ebook #1000) tras eliminar cabeceras, pies de página e índice.

Su relevancia es fundamentalmente pedagógica y experimental: sirve como referencia mínima de un pipeline completo de entrenamiento (tokenizador a nivel de carácter, partición train/val, checkpoint y muestreo) y como comparación directa con la adaptación LoRA del mismo corpus sobre Qwen2.5-0.5B, también publicada por el mismo autor. No está pensado para uso en producción ni para tareas fuera de la imitación estilística del texto dantesco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (nanoGPT) |
| Parametros totales | 10,65 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 caracteres |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch `ckpt.pt` en precisión de entrenamiento) |
| Idiomas soportados | italiano (registro medieval, a nivel de carácter) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`ckpt.pt`, pickle con estado del optimizador) y `meta.pkl` para el tokenizador |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar de la familia GPT con 6 capas, 6 cabezas de atención, dimensión de embedding de 384 y contexto de 256 caracteres, implementado con nanoGPT sin modificaciones arquitectónicas destacables. El tokenizador es a nivel de carácter, con un vocabulario de aproximadamente 80 símbolos, lo que elimina la necesidad de un tokenizador subword y simplifica el pipeline.

El corpus de entrenamiento es *La Divina Commedia di Dante: Complete* (Project Gutenberg eBook #1000, dominio público), con cabecera, pie y tabla de contenidos eliminados. La partición es 90 % entrenamiento y 10 % validación, reservando el final del *Paradiso* como conjunto de validación. El mejor checkpoint se alcanzó en el paso 1250, momento a partir del cual el autor documenta sobreajuste. No se reporta uso de RLHF, DPO ni ninguna fase de alineación; el entrenamiento es de modelado de lenguaje autorregresivo puro sobre un único libro.

## Capacidades

- Generación de texto a nivel de carácter en italiano medieval, imitando la forma métrica de la *Commedia* (tercetos encadenados, elisiones, diálogo entre personajes).
- Continuación de un prefijo dado (por ejemplo, «Nel mezzo del cammin») mediante muestreo con `sample.py` de nanoGPT.
- Reproducción de ortografía y convenciones tipográficas del texto fuente.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No es multilingüe: solo italiano a nivel de carácter.
- No dispone de modo de razonamiento (*thinking*), visión ni audio.

## Casos de uso

- Docencia sobre pipelines de entrenamiento: el modelo permite reproducir de principio a fin un entrenamiento GPT en una T4 gratuita en unos 25 minutos, lo que lo hace útil para explicar tokenización, partición de datos, sobreajuste y muestreo en un curso introductorio.
- Experimentos de tokenización a nivel de carácter: sirve como línea base para comparar el efecto de tokenizadores subword frente a carácter en un corpus pequeño y homogéneo.
- Estudio de sobreajuste en corpus pequeños: el punto de mejor checkpoint (paso 1250) y el deterioro posterior ofrecen un caso concreto para analizar dinámicas de generalización con pocos datos.
- Comparación con fine-tuning LoRA: el autor publica un modelo complementario (Qwen2.5-0.5B + LoRA sobre el mismo texto) con el que se puede contrastar bits por carácter (2,005 frente a 1,791), útil para evaluar el coste/beneficio de partir de un modelo preentrenado.
- Generación de texto estilístico con fines creativos o humorísticos: producción de tercetos apócrifos que imitan la forma dantesca, siempre con revisión humana dado que el modelo inventa palabras.
- Reproducibilidad y auditoría de experimentos: al ser un proyecto mínimo con corpus de dominio público y licencia MIT, facilita la verificación independiente de resultados en entornos con recursos limitados.

## Benchmarks y rendimiento

| Modelo | Bits por carácter (validación) |
|---|---|
| Qwen2.5-0.5B (base, sin entrenamiento) | 2,220 |
| DanteGPT from scratch (este modelo) | 2,005 (val loss 1,369 nats/carácter) |
| Qwen2.5-0.5B + LoRA | 1,791 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint completo ocupa aproximadamente 0,1 GB incluyendo estado del optimizador.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento original se completó en una T4 de Google Colab.
- Cabe holgadamente en GPU consumer: GTX 1060, RTX 2060, RTX 3060, RTX 4090, así como en CPU para inferencia interactiva.
- Opciones de despliegue: el flujo documentado es nanoGPT (`sample.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato `ckpt.pt` requeriría conversión para esos runners.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, la generación de 256 caracteres debería ser del orden de milisegundos en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DanteGPT (este modelo) | 10,65 M | 256 caracteres | GPT desde cero, nivel de carácter | MIT | HuggingFace |
| omarkilbi/dante-qwen2.5-0.5b-lora | 0,5 B (base) + adaptador LoRA | el de Qwen2.5-0.5B (no especificado en la información) | Fine-tuning LoRA sobre el mismo corpus | no disponible en la información | HuggingFace |
| Qwen2.5-0.5B (base) | 0,5 B | no disponible en la información | LLM preentrenado de propósito general | no disponible en la información | HuggingFace |

No se dispone de datos de benchmarks estándar para establecer una comparación de rendimiento más allá de los bits por carácter reportados por el autor.

## Limitaciones y advertencias

- El propio autor lo describe como un proyecto de aprendizaje: imita la forma de la *Commedia* pero a menudo inventa palabras y carece de significado real.
- Riesgo elevado de alucinación léxica: al operar a nivel de carácter sin conocimiento semántico, genera secuencias plausibles formalmente pero sin contenido verificable.
- Contexto muy limitado (256 caracteres), insuficiente para tareas de conversación o documentos largos.
- Monolingüe y restringido al registro del italiano medieval; no generaliza a italiano contemporáneo ni a otros idiomas.
- El archivo `ckpt.pt` es un pickle de PyTorch que incluye el estado del optimizador; solo deben cargarse ficheros de fuentes de confianza por el riesgo inherente de ejecución de código al deserializar.
- Licencia MIT: permite uso comercial, pero la ausencia de capacidades funcionales fuera de la imitación estilística hace inviable su uso en producción.
- Sin fase de alineación: no hay filtrado de contenido ni mitigaciones de sesgo documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omarkilbi/dante-gpt-scratch
- Modelo complementario (Qwen2.5-0.5B + LoRA): https://huggingface.co/omarkilbi/dante-qwen2.5-0.5b-lora
- nanoGPT (repositorio de entrenamiento): https://github.com/karpathy/nanoGPT
- Corpus fuente (Project Gutenberg eBook #1000): https://www.gutenberg.org/ebooks/1000
