# jgchaparro/Llama-Leonida-lora

## Resumen

Leonida es un adaptador LoRA para traducción bidireccional entre griego moderno y tsakonio, una lengua helénica en peligro crítico de extinción hablada en el Peloponeso y descendiente en gran medida del dórico lacónico antiguo. Lo desarrolla jgchaparro en el marco del proyecto Tsakonian Digital y se apoya en el modelo base `ilsp/Llama-Krikri-8B-Instruct-v1.5`, una adaptación al griego de Llama 3.1 8B realizada por el ILSP (Athena Research Center) con vocabulario griego ampliado. El adaptador resuelve un problema muy específico: la práctica inexistencia de recursos de traducción automática de calidad para una lengua de bajos recursos, mediante un único modelo que cubre ambas direcciones.

La relevancia del modelo reside en su metodología y en sus resultados: dos etapas de entrenamiento (ajuste supervisado sobre 19.004 pares de frases y posterior aprendizaje por refuerzo con GRPO sobre 2.132 pares adicionales no vistos) y unas métricas publicadas de chrF++ 83,8 / BLEU 71,3 / TER 16,7 en Bench V2.2, y chrF++ 71,4 / BLEU 53,3 / TER 29,4 en Bench V3. Con 8.000 millones de parámetros, la versión cuantizada Q4_K_M cabe en un portátil, lo que facilita su uso por parte de comunidades lingüísticas y proyectos de preservación.

El repositorio es únicamente el adaptador LoRA (0,7 GB); el autor publica por separado el modelo fusionado en 16 bits y las versiones GGUF. La licencia es Llama 3.1, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B adaptado al griego por ILSP), con adaptador LoRA sobre capas de atención y MLP |
| Parametros totales | 8 mil millones (modelo base); el adaptador LoRA se distribuye como pesos separados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el entrenamiento usó secuencias de hasta 768 tokens |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (bf16); las versiones GGUF del modelo fusionado incluyen Q8_0, Q5_K_M y Q4_K_M |
| Idiomas soportados | Griego moderno y tsakonio (tag `el`) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (adaptador LoRA); GGUF disponible en el repositorio del modelo fusionado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `ilsp/Llama-Krikri-8B-Instruct-v1.5`, un transformer decoder-only de 8.000 millones de parámetros derivado de Llama 3.1 8B y adaptado al griego por el ILSP con entrenamiento adicional y vocabulario griego extendido. El ajuste se realizó con Unsloth en bf16, con rango LoRA 64 y alpha 64 sobre las capas de atención y MLP. La optimización empleó tasa de aprendizaje 0,0002 con decaimiento coseno y 3 % de warmup, AdamW de 8 bits, batch efectivo de 16, longitud máxima de secuencia de 768 tokens y hasta 3 épocas (7.128 pasos), con la pérdida calculada únicamente sobre la respuesta del modelo. La selección de checkpoint se hizo cada 750 pasos evaluando 400 ejemplos de validación (200 pares retenidos en ambas direcciones, decodificación greedy) con chrF++; el mejor checkpoint de esta etapa alcanzó chrF++ de validación 80,78.

La segunda etapa aplicó Group Relative Policy Optimization (pérdida Dr. GRPO, sin término KL) partiendo del adaptador de la etapa 1, sobre 2.132 pares adicionales (4.045 prompts en ambas direcciones) que la primera etapa nunca vio. Para cada prompt se muestrearon 8 traducciones a temperatura 0,9; la recompensa combinaba a partes iguales chrF++ de frase y (1 − TER), más una bonificación por coincidencia exacta, con penalizaciones automáticas por errores de puntuación, cifras, mayúsculas y diacríticos no presentes en la referencia, y puntuación 0 para salidas vacías, copias del origen, longitudes muy dispares o respuestas truncadas. Se realizaron 400 actualizaciones de 16 prompts con tasa de aprendizaje 0,00001, y se seleccionó el adaptador de la actualización 350 (chrF++ de validación 81,30 frente a 80,78 de la etapa 1).

## Capacidades

- Traducción bidireccional griego moderno ⇄ tsakonio con un único modelo.
- Generación de la traducción únicamente, sin texto adicional, siguiendo el template de chat de Llama 3.1 y el prompt indicado por el autor.
- Lectura y escritura de la ortografía Kostakis del tsakonio, con diacríticos combinantes (τσ̑, σ̌, κ̔, ν̇, λ̣, ν̂, α̈).
- Manejo de una lengua de bajos recursos con datos exclusivamente abiertos.
- Capacidades generales heredadas del modelo base Llama-Krikri 8B Instruct (comprensión y generación en griego), aunque el adaptador está especializado en traducción.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Preservación y documentación lingüística: traducción de corpus y materiales escritos en tsakonio al griego moderno para su catalogación, aprovechando que el modelo cubre ambas direcciones y la ortografía Kostakis.
- Publicación de contenido bilingüe: traducción de artículos, cuentos o materiales divulgativos del griego al tsakonio para webs y publicaciones de la comunidad, con revisión humana posterior.
- Herramientas educativas: apoyo a cursos y materiales de aprendizaje del tsakonio, generando traducciones de referencia que el profesorado puede validar.
- Traducción asistida en local: despliegue del GGUF Q4_K_M en un portátil con llama.cpp, Ollama o LM Studio para trabajar sin conexión en contextos de campo o archivo.
- Investigación en lenguas de bajos recursos: uso como línea base o punto de comparación en experimentos de traducción automática para lenguas minorizadas, dado que el autor publica la configuración y el historial de selección en `run_meta.json`.
- Normalización ortográfica: conversión asistida de textos en otras ortografías del tsakonio hacia la Kostakis, ya que el modelo está entrenado sobre esa convención.
- Integración en pipelines de traducción: uso del adaptador con la plantilla de chat de Llama 3.1 para procesar lotes de frases en proyectos de digitalización.

## Benchmarks y rendimiento

Evaluación con decodificación greedy y sacreBLEU 2.5.1 (BLEU, chrF++ y TER), con intervalos de confianza del 95 % por bootstrap; ningún par de los benchmarks se usó en entrenamiento ni validación.

| Benchmark | chrF++ | BLEU | TER |
|---|---|---|---|
| Bench V2.2 | 83,8 | 71,3 | 16,7 |
| Bench V3 | 71,4 | 53,3 | 29,4 |

Evolución durante la etapa de RL (chrF++ de validación):

| Actualización | chrF++ validación | TER | Tsakonio → griego | Griego → tsakonio |
|---|---|---|---|---|
| 0 (etapa 1) | 80,78 | 20,23 | 81,31 | 80,29 |
| 150 | 81,12 | 19,91 | 81,67 | 80,60 |
| 250 | 81,25 | 19,78 | 81,91 | 80,64 |
| 350 (seleccionada) | 81,30 | 19,67 | 81,79 | 80,84 |
| 400 | 81,17 | 19,84 | 81,80 | 80,58 |

No se han publicado en la información disponible comparaciones numéricas con otros sistemas de traducción para tsakonio.

## Requisitos de hardware

- El adaptador LoRA es ligero (repositorio de 0,7 GB), pero requiere cargar el modelo base de 8.000 millones de parámetros para inferencia.
- VRAM estimada para el modelo fusionado: aproximadamente 16 GB en bf16/fp16; en torno a 5-6 GB con cuantización Q4_K_M y 9-10 GB con Q8_0 (estimaciones orientativas según el tamaño del modelo).
- GPU recomendadas: A100, H100 o L40S para servicio en 16 bits; RTX 4090 (24 GB) permite el modelo en bf16.
- Cabe en GPU de consumo: el Q4_K_M está pensado para ejecutarse en un portátil, según indica el autor.
- Opciones de despliegue: transformers y Unsloth para el adaptador; llama.cpp, Ollama y LM Studio para los GGUF del modelo fusionado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Leonida (este modelo) | 8B (base) + LoRA | no disponible | Traducción griego ⇄ tsakonio, SFT + GRPO | llama3.1 | Hugging Face (adaptador, fusionado y GGUF) |
| Leonida Beta | 8B (base) + LoRA | no disponible | Versión anterior de traducción griego ⇄ tsakonio | llama3.1 | Hugging Face |
| Llama-Krikri-8B-Instruct-v1.5 | 8B | no disponible | Modelo instructivo general en griego (base de Leonida) | llama3.1 | Hugging Face (ILSP) |

No se dispone en la información proporcionada de otros sistemas de traducción específicos para tsakonio con los que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El modelo solo rinde bien con la ortografía Kostakis del tsakonio; textos en otras ortografías se traducen peor.
- Está especializado exclusivamente en el par griego–tsakonio; no debe esperarse calidad en otros pares de idiomas.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en frases largas o con vocabulario poco representado en el corpus de entrenamiento.
- El corpus de entrenamiento procede de fuentes abiertas, principalmente tsakonika.online; puede reflejar sesgos de estilo y cobertura de esa fuente.
- Los benchmarks son propios del autor y, según indica, solo comparables dentro de su propio marco de evaluación.
- La licencia Llama 3.1 impone restricciones de uso comercial y obligaciones de atribución; conviene revisar sus términos antes de un despliegue en producción.
- El adaptador requiere el modelo base `ilsp/Llama-Krikri-8B-Instruct-v1.5` y su plantilla de chat; un uso incorrecto del prompt degrada la salida.
- No se documentan garantías de calidad para textos legales, médicos o técnicos; se recomienda revisión humana.

## Enlaces

- Adaptador LoRA: https://huggingface.co/jgchaparro/Llama-Leonida-lora
- Modelo fusionado 16 bits: https://huggingface.co/jgchaparro/Llama-Leonida
- Versiones GGUF: https://huggingface.co/jgchaparro/Llama-Leonida-GGUF
- Versión anterior: https://huggingface.co/jgchaparro/Llama-Leonida-Beta-lora
- Modelo base: https://huggingface.co/ilsp/Llama-Krikri-8B-Instruct-v1.5
- Proyecto Tsakonian Digital: https://tsakoniandigital.com
- Fuente principal de datos: https://tsakonika.online
- Unsloth: https://github.com/unslothai/unsloth
