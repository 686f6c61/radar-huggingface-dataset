# liukunli/ha-expert-qwen3-8b

## Resumen

HA-Expert es un ajuste de dominio de Qwen3-8B-Base (8.190.735.360 parámetros, transformer decoder-only denso) especializado en hialuronano (ácido hialurónico) y su literatura científica. Lo publica Kunli Liu (usuario `liukunli`) como proyecto de investigación independiente, con una pregunta explícita de partida: si un investigador puede entrenar de extremo a extremo un modelo especialista fiable sobre la literatura de su propio campo con menos de 50 dólares de cómputo.

El pipeline combina entrenamiento continuado adaptado al dominio (DAPT) sobre unas 12.306 publicaciones de acceso abierto (~126M tokens), un ajuste fino supervisado (SFT) de todos los parámetros sobre 12.003 pares pregunta-respuesta generados por el propio modelo DAPT actuando como profesor, y una capa de recuperación (RAG) opcional con un índice FAISS de 636.959 pasajes y el embedder Qwen3-Embedding-0.6B. Se distribuye con licencia Apache-2.0 y pesos en safetensors, únicamente en inglés.

Su interés práctico es doble: por un lado es un especialista biomédico acotado que pasa de 0,300 a 0,601 en el benchmark propio HA-Expert-Bench (240 preguntas) respecto al modelo base; por otro, es un caso de estudio reproducible y documentado de adaptación de dominio de bajo coste, con código, índice de recuperación, checkpoint intermedio de DAPT y todas las respuestas de evaluación publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (fine-tune de Qwen/Qwen3-8B-Base) |
| Parámetros totales | 8.190.735.360 (~8,19 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen3-8B-Base, no se documenta en la model card) |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | inglés (`language: [en]`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 16,4 GB, compatible con pesos en bf16/fp16) |

## Arquitectura y entrenamiento

La base es Qwen3-8B-Base, un transformer decoder-only denso de 8,19 B de parámetros. Sobre él se aplica un DAPT (domain-adaptive continued pretraining) con 60M tokens del núcleo del corpus más un subconjunto de anneal de 5,7M tokens y un 12 % de replay de datos generales para mitigar el olvido catastrófico: 212 pasos y una pérdida final de aproximadamente 1,55. El corpus de partida son 12.306 artículos de acceso abierto sobre hialuronano (~126M tokens), limpiados y deduplicados, con 30 artículos de revisión reservados fuera tanto del entrenamiento como del índice de recuperación para evitar contaminación en la evaluación.

La fase SFT hace ajuste fino de todos los parámetros (lr 1e-5, 2 épocas, pérdida solo sobre la completación) sobre 12.003 pares pregunta-respuesta generados por el propio checkpoint DAPT sirviendo como profesor mediante vLLM, sin APIs de pago. Cada respuesta se ancla a un pasaje del corpus con un solapamiento de palabras de contenido ≥ 0,55 y el conjunto se deduplica. La capa RAG es opcional pero recomendada: índice FAISS de 636.959 pasajes construido con Qwen3-Embedding-0.6B sobre el mismo corpus, y en inferencia se anteponen los 4 extractos más relevantes con marcadores de cita. No se documentan innovaciones de decodificación (attention linear, decodificación especulativa) ni fases de RLHF/DPO.

## Capacidades

- Generación de texto técnico y respuesta a preguntas sobre ciencia del hialuronano: química y modificaciones, biología por peso molecular, receptores, nano-entrega y aspectos clínico-cuantitativos.
- Respuesta a preguntas de opción múltiple y a ítems cuantitativos dentro del dominio (0,900 y 0,300 respectivamente en HA-Expert-Bench).
- Modo RAG con citas: al anteponer los pasajes recuperados con marcadores, el modelo puede sostener respuestas con referencias verificables al corpus.
- Mayor resistencia a preguntas trampa que el modelo base (0,500 frente a 0,267 sin RAG; 0,633 con RAG).
- Capacidad de seguir el formato de respuesta aprendido en SFT en lugar de devolver preguntas de seguimiento, un comportamiento heredado del base que el SFT corrige según el autor.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito; el modelo es una especialización de un checkpoint Base, no de la variante instruct.

## Casos de uso

- Búsqueda bibliográfica asistida con RAG: desplegar el modelo junto al índice FAISS de 636.959 pasajes y el embedder Qwen3-Embedding-0.6B para responder consultas sobre hialuronano devolviendo los 4 extractos fuente con marcadores de cita, de modo que el investigador pueda verificar cada afirmación contra el pasaje original.
- Revisión rápida de literatura: resumir y contrastar hallazgos sobre un subtema concreto (por ejemplo, modificación química del HA o su relación con el peso molecular) usando el corpus como base documental, con la ventaja de que las citas permiten descartar respuestas no sustentadas.
- Apoyo a la redacción de secciones de antecedentes: generar borradores de introducción o estado del arte que el investigador después contrasta contra las referencias recuperadas, aprovechando que el modelo ha visto ~126M tokens del dominio frente a los 60M usados en DAPT.
- Formulación y sistemas de liberación: consultas sobre nano-entrega, vehículos y formulaciones con HA, un área cubierta explícitamente por la taxonomía de HA-Expert-Bench (categoría nano-delivery).
- Docencia y elaboración de material evaluable: generar preguntas tipo test y de desarrollo sobre fundamentos y química del hialuronano, usando como referencia el conjunto de 240 preguntas del benchmark publicado.
- Evaluación de arquitecturas RAG: emplear el par modelo + índice como banco de pruebas reproducible para medir el efecto de la recuperación, comparando los cuatro regímenes documentados (base, DAPT+SFT, base+RAG, modelo+RAG) sobre el mismo conjunto de preguntas.
- Caso de estudio metodológico: replicar el pipeline DAPT + SFT autogenerado + RAG como plantilla de adaptación de dominio de bajo coste para otros campos científicos, reutilizando el código y los artefactos publicados.

## Benchmarks y rendimiento

Resultados publicados en HA-Expert-Bench (240 preguntas: nociones básicas, química/modificación, biología por peso molecular, receptores, nano-entrega, clínico-cuantitativo y 15 ítems adversariales de tipo trampa). Puntuación: correcto 1,0 / parcial 0,5 / incorrecto 0.

| Configuración | Overall | MCQ | Quant | Open | Trap |
|---|---|---|---|---|---|
| Qwen3-8B-Base | 0,300 | 0,800 | 0,250 | 0,282 | 0,267 |
| DAPT+SFT (este modelo) | 0,601 | 0,900 | 0,300 | 0,631 | 0,500 |
| Base + RAG | 0,710 | 0,900 | 0,450 | 0,719 | 0,867 |
| Este modelo + RAG | 0,662 | 0,700 | 0,550 | 0,676 | 0,633 |

Notas metodológicas aportadas por el autor: 212 de las 240 claves de respuesta quedaron verificadas contra el corpus con verificadores LLM restringidos a pasajes recuperados (190 verificadas, 22 corregidas, 28 conservadas como borradores inciertos); los ítems MCQ y cuantitativos se corrigen automáticamente y los abiertos y trampa los evalúa un juez LLM que es el propio modelo SFT servido en local. El autor advierte que las diferencias entre celdas inferiores a 0,02 deben leerse como ruido. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: ~16,4 GB solo de pesos (coincide con el tamaño del repo), más caché KV; en la práctica requiere GPUs de 24 GB o más para contextos cortos y 40-80 GB para contextos largos o lotes mayores.
- VRAM estimada en cuantización: ~8,2 GB en 8 bits y ~4,5-5 GB en 4 bits (estimación a partir del número de parámetros, no hay cuantizaciones oficiales publicadas).
- GPU recomendadas: A100 40/80 GB, H100, L40S 48 GB para el modelo completo sin cuantizar; RTX 4090 (24 GB) para bf16 con contexto limitado; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 12 GB solo tras convertir a 8 o 4 bits.
- Cabe en GPU de consumo: sí, en configuraciones de 12-16 GB siempre que se cuantice; en 24 GB (4090) en bf16 con restricciones de contexto.
- Despliegue: el autor usa vLLM para servir el modelo (generación de los datos SFT y demo); también es viable con transformers + Accelerate y TGI. Para llama.cpp u Ollama sería necesario convertir previamente a GGUF, ya que no se publican pesos GGUF.
- Componente de recuperación: el índice FAISS y el retriever Qwen3-Embedding-0.6B (~1,2 GB en fp16) pueden ejecutarse en CPU o compartir GPU con el generador; el demo público funciona en ZeroGPU.
- Latencia y throughput: no disponibles en la información proporcionada (la evaluación usó decodificación greedy, sin cifras de tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HA-Expert-Bench (overall) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HA-Expert Qwen3-8B (este modelo) | 8,19 B | no disponible | 0,601 (0,662 con RAG) | Apache-2.0 | Pesos safetensors, checkpoint DAPT, índice y demo |
| Qwen3-8B-Base (modelo de partida) | 8,19 B | no disponible | 0,300 (0,710 con RAG) | Apache-2.0 | Pesos safetensors en HuggingFace |
| ha-expert-qwen3-8b-dapt (checkpoint intermedio) | 8,19 B | no disponible | no disponible | Apache-2.0 | Pesos safetensors en HuggingFace |
| Qwen3-8B (variante instruct) | ~8,2 B | no disponible | no disponible | Apache-2.0 | Pesos safetensors en HuggingFace |

No se dispone de datos para comparar con especialistas biomédicos de tamaño similar (por ejemplo, variantes basadas en Mistral o Llama de 7-8 B): la información proporcionada no incluye resultados de esos modelos en HA-Expert-Bench ni en otros benchmarks comunes, por lo que la comparación cuantitativa con ellos queda como no disponible. La comparación más informativa que sí aporta la model card es interna: el SFT duplica la puntuación del base (0,300 → 0,601) y la recuperación es la palanca individual más grande, sobre todo en preguntas trampa del base (0,267 → 0,867).

## Limitaciones y advertencias

- Artefacto de investigación, no un dispositivo médico: las respuestas pueden ser erróneas y no deben usarse para decisiones clínicas. El modo RAG incluye citas precisamente para permitir la verificación.
- Datos de entrenamiento autogenerados: aunque hay filtros de anclaje al corpus (solapamiento ≥ 0,55), el SFT puede contener errores del profesor, que se destilan en el modelo final.
- Repetición: el hábito de repetición del profesor se transfirió al alumno, con repetición intensa en 35 de 240 respuestas en modo SFT sin RAG; además, el modelo colapsa en bucles de marcadores de cita en 5 de 240 respuestas con RAG, porque nunca vio prompts con contexto recuperado durante el SFT. El autor propone como siguientes pasos SFT con formato RAG y filtrado de repeticiones en las salidas del profesor.
- SFT + RAG no es aditivo en esta configuración: el modelo con RAG (0,662) rinde por debajo del base con RAG (0,710) en overall, aunque lo supera en cuantitativos (0,550 frente a 0,450).
- Evaluación con juez automático: el juez es el propio modelo SFT anclado a las respuestas de referencia verificadas, lo que introduce un sesgo de autoevaluación; diferencias menores de 0,02 no son significativas.
- Sensibilidad a la decodificación: la evaluación usó decodificación greedy; una penalización de repetición suprime en gran medida el comportamiento repetitivo, de modo que los resultados dependen de la configuración de muestreo.
- Idioma: solo inglés. No hay soporte documentado de castellano ni de otros idiomas, y el corpus es íntegramente en inglés.
- Alcance de dominio muy estrecho (hialuronano): fuera de ese tema el modelo no está validado y puede degradar respecto a Qwen3-8B-Base por el olvido asociado al DAPT, pese al 12 % de replay general.
- Licencia Apache-2.0: permite uso comercial y modificación, pero la licencia no implica validación científica ni regulatoria del contenido generado; cualquier producto derivado en salud queda bajo responsabilidad de quien lo despliega.
- Madurez: 0 descargas y 0 likes en el momento de la ficha, preprint aún en preparación y sin cifras de latencia o throughput publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liukunli/ha-expert-qwen3-8b
- Checkpoint DAPT: https://huggingface.co/liukunli/ha-expert-qwen3-8b-dapt
- Índice de recuperación (dataset): https://huggingface.co/datasets/liukunli/ha-expert-index
- Demo interactivo (ZeroGPU, chat con recuperación citada): https://huggingface.co/spaces/liukunli/ha-expert-demo
- Repositorio con código, datos y artefactos de evaluación: https://github.com/liukunli001/hyaluronan-expert-llm
- Informe completo de evaluación: `eval/results/s6-full-report.md` en el repositorio anterior
- Preprint: en preparación para arXiv, sin enlace disponible
