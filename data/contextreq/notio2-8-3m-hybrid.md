# ContextReq/Notio2-8.3M-HYBRID

## Resumen

Notio2 es un modelo de lenguaje de nivel de carácter (character-level) de 8,3 millones de parámetros, desarrollado por el proyecto Notio2 como trabajo de investigación y hobby. Es el sucesor de Notio1, un modelo GRU puro de 3,79 millones de parámetros. El modelo emplea una arquitectura híbrida que combina 5 bloques de atención con ventana deslizante y 15 bloques GRU recurrentes, con un contexto de 4.096 caracteres y un vocabulario de 101 tokens compuesto por caracteres ASCII imprimibles y glifos de control.

Está entrenado desde cero sobre un corpus de 753,7 millones de caracteres formado por cuentos de TinyStories, historias sintéticas generadas con Phi-4-mini-instruct y libros infantiles del Proyecto Gutenberg, siguiendo un enfoque de curriculum learning (fácil primero). El modelo se encuentra en entrenamiento activo a fecha 2026-09-08 y su finalidad principal es la investigación en modelos de lenguaje pequeños, curriculum learning y medición de dificultad de corpus. No está diseñado para seguir instrucciones ni para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 5 bloques de atención con ventana deslizante + 15 bloques GRU (patrón `aggg` x5) |
| Parametros totales | 8.317.184 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 caracteres (ventana de atención: 1.024) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 (según metadatos de HuggingFace); pesos TBD según la model card del autor |
| Formato de pesos | No disponible (proyecto PyTorch con checkpoints propios; no se especifica safetensors, GGUF, etc.) |

## Arquitectura y entrenamiento

La arquitectura de Notio2 es híbrida, combinando bloques de atención y bloques recurrentes en un patrón repetido `aggg` cinco veces, lo que da un total de 5 bloques de atención con ventana deslizante y 15 bloques GRU. La dimensión del modelo (`d_model`) es 256. La atención utiliza 4 cabezas de dimensión 64, rotary position embeddings (RoPE), kv-cache y una ventana de 1.024 caracteres. Los bloques GRU mantienen estado entre ventanas de BPTT, lo que permite capturar dependencias de largo alcance más allá de la ventana de atención. El vocabulario es puramente a nivel de carácter: 94 caracteres ASCII imprimibles más 7 glifos de control (incluyendo `Ġ` para espacio, `Ċ` para nueva línea y marcadores de bloque `Ē...Ĕ`). Las embeddings de posición y token son aprendidas, y la cabeza de salida (`lm_head`) está atada a las embeddings de token.

El entrenamiento utiliza el objetivo de entropía cruzada de siguiente carácter con BPTT truncado de horizonte 512. El corpus de entrenamiento sigue un orden curricular fácil-primero: primero TinyStories (~50M caracteres), luego historias sintéticas generadas con Phi-4-mini-instruct (~1,5M caracteres) y finalmente la sección infantil del Proyecto Gutenberg (~702M caracteres). El split es 95/5, con una validación de 37,7M caracteres exclusivamente de Gutenberg, de modo que la validación nunca contiene datos sintéticos ni de TinyStories. El optimizador es AdamW con lr 3e-4, warmup de 1.000 pasos y decaimiento coseno hasta 3e-5. El entrenamiento se realizó en una única NVIDIA GTX 1660 SUPER de 6 GB con un throughput de ~23k caracteres por segundo y ~8,7 horas por época.

## Capacidades

- Generación de texto a nivel de carácter: modela la distribución de caracteres y genera historias cortas estilo cuentos infantiles.
- Sin entrenamiento de instrucciones: no ha recibido SFT ni RLHF, por lo que no sigue instrucciones ni responde a prompts de forma alineada.
- No soporta tool calling ni function calling.
- No soporta visión, audio ni multimodalidad.
- Capacidad monolingüe: solo inglés.
- Utilidad investigadora: permite estudiar curriculum learning, comportamiento de arquitecturas híbridas con pocos parámetros y medición de dificultad de corpus (concepto "Mount Corpus-Floor").
- No soporta razonamiento multi-paso ni uso como agente autónomo.

## Casos de uso

- Investigación en modelos de lenguaje pequeños: el modelo permite analizar cómo arquitecturas híbridas (atención + GRU) se comportan con solo 8,3 millones de parámetros, un área de interés creciente para eficiencia computacional.
- Educación en aprendizaje profundo: sirve como ejemplo práctico de entrenamiento de un LM desde cero con hardware limitado (una GTX 1660 SUPER de 6 GB), útil en cursos de NLP o de sistemas de aprendizaje automático.
- Experimentos de arquitecturas híbridas: permite comparar el rendimiento de bloques de atención con ventana deslizante frente a bloques recurrentes GRU, y su combinación, en tareas de modelado de lenguaje a nivel de carácter.
- Generación creativa de cuentos infantiles: puede muestrear historias cortas en inglés para experimentos de creatividad computacional, aunque sin control fino sobre el contenido.
- Medición de dificultad de corpus: el proyecto introduce una metodología para comparar la entropía de diferentes corpus (TinyStories frente a Gutenberg), útil para investigación en teoría de la información aplicada a NLP.
- Estudio de errores ortográficos y neologismos: el modelo produce palabras raras mal escritas o inventadas de forma medida, lo que lo convierte en un caso de estudio para entender los límites de la modelización de lenguaje a nivel de carácter.
- Análisis de curriculum learning: el corpus ordenado fácil-primero permite investigar el impacto del orden de presentación de los datos en la convergencia y el rendimiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El modelo no está diseñado para esas tareas y no ha sido evaluado en ellas. Los datos disponibles son métricas de validación durante el entrenamiento, expresadas en nats de entropía cruzada por carácter:

| Métrica | Valor |
|---|---|
| Validación (paso 250, run baseline) | 3,382 nats/char |
| Validación (paso 250, run curriculum) | 3,247 nats/char |
| Validación (paso 500, run baseline) | 2,990 nats/char |
| Validación (paso 500, run curriculum) | 2,707 nats/char |
| Notio1 (predecesor) evaluado en Gutenberg | 1,836 nats/char |
| Suelo esperado para Notio2 en Gutenberg | ~1,5-1,7 nats/char |

Estas cifras son provisionales, ya que el modelo se encuentra en entrenamiento activo. El autor estima que el suelo de entropía del corpus Gutenberg está entre 0,9 y 1,2 nats por encima del de TinyStories.

## Requisitos de hardware

- VRAM estimada para inferencia: ~33 MB en FP32 y ~17 MB en FP16, calculados a partir de los 8,3 millones de parámetros. El modelo cabe en cualquier GPU con más de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama baja. El autor utilizó una NVIDIA GTX 1660 SUPER (6 GB) para el entrenamiento.
- Capacidad en consumer GPU: sí, el modelo es extremadamente ligero y puede ejecutarse incluso en GPUs integradas o en CPU.
- Opciones de despliegue: PyTorch directo mediante el código personalizado del proyecto. No se documentan conversiones a GGUF, vLLM, Ollama ni TGI en la información disponible.
- Latencia y throughput: durante el entrenamiento se reportaron ~23k caracteres por segundo en la GTX 1660 SUPER. La latencia de inferencia no está documentada.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Validación (nats/char) |
|---|---|---|---|---|
| Notio2-8.3M | 8,3M | Híbrida: atención + GRU | 4.096 caracteres | 2,707 (paso 500, Gutenberg) |
| Notio1 | 3,79M | GRU (2 capas) | No disponible | 0,679 (TinyStories) |
| Modelos TinyStories (familia) | No disponible | Transformer | No disponible | No disponible |

Notio1 es el predecesor directo y sirve como referencia de la evolución del proyecto. Los modelos de la familia TinyStories (Eldan y Li, 2023) son la referencia estándar para modelos pequeños entrenados en ese dataset, pero no se dispone de datos concretos de sus parámetros ni de sus métricas de validación en la información proporcionada.

## Limitaciones y advertencias

- Sin entrenamiento de seguridad ni alineación: el modelo simplemente modela su distribución de entrenamiento y puede generar contenido no deseado o inapropiado.
- Errores ortográficos en palabras raras: el autor indica que es una propiedad medida de la entropía del corpus, no un defecto de entrenamiento. Palabras poco frecuentes aparecerán mal escritas o como neologismos.
- Repetición de plantillas: el subconjunto sintético puede reutilizar aperturas formulaicas del tipo "Once upon a time", lo que produce historias repetitivas.
- Contexto limitado a 4.096 caracteres: la generación está limitada por este presupuesto de atención y posición.
- Historial de bucles degenerados: versiones anteriores con vocabulario subword colapsaron en bucles de repetición (comportamiento "soup basin"); el vocabulario de caracteres se adoptó específicamente para evitarlo, pero el riesgo no está completamente eliminado.
- Licencia de pesos TBD: aunque los metadatos de HuggingFace indican Apache-2.0, la model card del autor afirma que la decisión final sobre la licencia de los pesos está pendiente.
- Sesgos de época: el corpus de Gutenberg puede contener contenido con sesgos raciales, de género o de época que pueden aparecer en las salidas. El autor aplicó una política de contenido documentada, pero no elimina todos los sesgos.
- Solo inglés: el modelo no soporta otros idiomas.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/ContextReq/Notio2-8.3M-HYBRID
- HuggingFace del predecesor Notio1: https://huggingface.co/ContextReq/Notio
- Perfil del autor en HuggingFace: https://huggingface.co/ContextReq
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
