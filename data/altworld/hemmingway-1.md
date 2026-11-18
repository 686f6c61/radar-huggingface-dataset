# Altworld/Hemmingway-1

## Resumen
Hemmingway-1 es un modelo de lenguaje de 27.000 millones de parámetros desarrollado por The Commons Lab (Altworld), con sede en Bülach, Suiza. Se trata de un fine-tuning de Qwen/Qwen3.8-27B orientado específicamente a la escritura cotidiana: mensajes, correos electrónicos, notas a colegas y comunicación interpersonal en general. El modelo se distribuye con pesos abiertos bajo licencia CC BY-NC 4.0 y está pensado para producir texto directo, sin preámbulos ni listas de opciones que el usuario tenga que descartar.

La propuesta diferencial no es el rendimiento bruto en tareas de razonamiento o código, sino la naturalidad y la concisión en comunicación breve. El autor publica comparativas propias (CommunicationBench, Human-Likeness, StoryBench) en las que el modelo supera a alternativas de mayor tamaño, además de un resultado en EQ-Bench 4, benchmark ajeno al desarrollador, donde queda tercero. El contexto declarado alcanza los 262.144 tokens, lo que permite gestionar hilos conversacionales largos o documentos extensos como referencia.

Es relevante ahora porque ocupa un nicho poco cubierto: modelos afinados explícitamente para "sonar humano" en textos breves, en lugar de optimizar para benchmarks académicos. No obstante, la licencia no comercial y la ausencia de benchmarks estándar publicados limitan su adopción en producción sin una evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.8-27B); detalles internos no disponibles |
| Parámetros totales | 26.895.998.464 (≈26,9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | inglés (english-first según el autor) |
| Licencia | CC BY-NC 4.0 (uso no comercial; uso comercial mediante acuerdo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.8-27B, un transformer decoder-only de aproximadamente 27.000 millones de parámetros. No se han publicado detalles sobre la arquitectura interna (número de capas, dimensiones ocultas, tipo de atención, uso de atención lineal o decodificación especulativa) ni sobre el proceso de entrenamiento del modelo base. El tag `qwen3_5_text` en Hugging Face sugiere una variante textual de la familia Qwen3.8, pero no se especifica la configuración exacta.

Respecto al fine-tuning, la model card no documenta el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o preferencias sintéticas. Tampoco se detalla el método de ajuste (SFT, LoRA fusionado, etc.). La única información técnica verificable es el tamaño del repositorio (54,7 GB), coherente con pesos en precisión de 16 bits para un modelo de este tamaño, y la recomendación de despliegue con `vllm serve ... --max-model-len 262144`.

## Capacidades
- Generación de texto conversacional breve: mensajes, correos, notas y respuestas directas sin preámbulos ni opciones múltiples.
- Escritura creativa y narrativa: la model card reporta resultados en StoryBench, con rendimiento cercano a Kimi K3 en su propia evaluación.
- Razonamiento emocional y adecuación social: tercer puesto en EQ-Bench 4 según el autor, por delante de GPT-5.5, Opus 4.7 y Opus 4.8.
- Comunicación persuasiva y resolución de conflictos interpersonales: categorías destacadas en su heatmap propio (dinero y administración, trabajo, peticiones difíciles, convencer a alguien).
- Capacidad multilingüe limitada: el modelo está declarado como English-first y solo lista inglés en sus metadatos.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso
- Redacción de correos administrativos y reclamaciones: el modelo genera el texto final directamente, sin opciones ni explicaciones, lo que encaja en flujos donde el usuario quiere copiar y enviar. Su contexto de 262.144 tokens permite incluir el hilo completo de una conversación previa como referencia.
- Comunicación laboral delicada: notas a colegas, respuestas a feedback o mensajes de escalado. El ajuste orientado a "leer la sala" y el resultado en EQ-Bench 4 lo hacen adecuado para textos donde el tono importa tanto como el contenido.
- Asistencia en atención al cliente de tono humano: generación de respuestas personalizadas en lugar de plantillas, manteniendo coherencia en conversaciones multi-turno gracias a la ventana de contexto extendida.
- Escritura creativa de relatos cortos y diálogos: la model card reporta resultados en StoryBench, aunque el propio autor reconoce que pierde frente a modelos especializados en narrativa hostil y turnos largos de historia.
- Herramienta de reescritura y simplificación: transformar borradores técnicos o densos en mensajes claros y directos, aprovechando la preferencia del modelo por la concisión.
- Prototipado de asistentes de escritura personales: aplicaciones de escritorio o móvil (el autor distribuye apps para Mac y Android) que sugieren texto en el momento, con despliegue local o en servidor mediante vLLM.
- Investigación sobre naturalidad textual: evaluación de sesgos de "voz humana" en modelos afinados, usando el modelo como caso de estudio de fine-tuning orientado a estilo.

## Benchmarks y rendimiento
Los únicos datos disponibles provienen de la model card del autor. CommunicationBench, Human-Likeness y StoryBench son benchmarks propios de The Commons Lab; EQ-Bench 4 es externo. No se publican cifras numéricas absolutas en el texto de la model card, solo posiciones relativas y diferencias en puntos porcentuales o de puntuación.

| Benchmark | Resultado reportado | Naturaleza |
|---|---|---|
| CommunicationBench | Primero; supera a Fable 5.1 y a GPT-6 Astra por 50 puntos | Propio del autor |
| Human-Likeness | 26 puntos por delante del siguiente modelo | Propio del autor |
| Categoría "hard asks" | 72% frente al 9% de GPT-6 Astra | Propio del autor |
| EQ-Bench 4 | Tercero; por delante de GPT-5.5, Opus 4.7 y Opus 4.8; a 12 puntos del primero | Externo |
| StoryBench | Nivel de Kimi K3; +504 puntos respecto al modelo base Qwen3.8-27B | Propio del autor |

No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16/BF16: aproximadamente 54 GB solo para pesos, más overhead de KV cache. Con contexto de 262.144 tokens, la caché puede requerir decenas de GB adicionales según el lote y la implementación.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para FP16 con contexto largo. Para contexto reducido, una RTX 6000 Ada (48 GB) queda al límite y no cubre la ventana completa.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en FP16. Sería necesaria cuantización a 8 bits (≈27 GB, aún por encima de 24 GB) o a 4 bits (≈14-15 GB), aunque no se confirman versiones GGUF o AWQ publicadas.
- Opciones de despliegue: vLLM es el método documentado por el autor (`vllm serve Altworld/Hemmingway-1 --max-model-len 262144`). También es compatible con transformers (`AutoModelForCausalLM`). No se confirma soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Hemmingway-1 | ≈26,9B | 262.144 | CC BY-NC 4.0 | Fine-tuning de Qwen3.8-27B orientado a escritura cotidiana |
| Qwen3.8-27B (base) | ≈27B | no disponible | según Qwen | Modelo base; Hemmingway-1 reporta +504 puntos en StoryBench propio |
| Kimi K3 | no disponible | no disponible | no disponible | Comparable en StoryBench propio; por detrás en CommunicationBench |
| GPT-6 Astra | no disponible (propietario) | no disponible | propietario | Superado por 50 puntos en CommunicationBench propio; 9% vs 72% en "hard asks" |

Las comparaciones con modelos propietarios y con Kimi K3 provienen exclusivamente de benchmarks del autor y no son verificables de forma independiente. No se dispone de comparativas en benchmarks estándar.

## Limitaciones y advertencias
- Licencia CC BY-NC 4.0: el uso comercial requiere un acuerdo separado con The Commons Lab (contacto: luka@hemmingway.io). Esto excluye su uso directo en productos de pago sin negociación.
- Sesgos conocidos: no documentados por el autor. Al ser un fine-tuning sobre Qwen3.8-27B, puede heredar sesgos del modelo base, no evaluados en la model card.
- Riesgo de alucinación: el propio autor advierte que "puede equivocarse y aun así sonar seguro". No debe usarse para decisiones médicas, legales o financieras.
- Limitación idiomática: English-first y solo inglés declarado en metadatos. El rendimiento en castellano u otros idiomas no está evaluado y probablemente sea inferior.
- Benchmarks no independientes: CommunicationBench, Human-Likeness y StoryBench son propiedad del desarrollador. Solo EQ-Bench 4 es externo, y no se publican las puntuaciones numéricas completas.
- Rendimiento narrativo: el autor reconoce que pierde en "hostile storytelling" y turnos largos de historia frente a modelos especializados.
- Contexto largo no verificado: se declara 262.144 tokens, pero no se documenta la degradación de rendimiento en ventanas extremas ni pruebas de "needle in a haystack".
- Sin datos de entrenamiento: no se especifica dataset, número de tokens ni método de alineación, lo que dificulta evaluar reproducibilidad y sesgos.
- Producción: la falta de cuantizaciones publicadas y de soporte confirmado en llama.cpp/Ollama limita el despliegue en hardware de consumo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Altworld/Hemmingway-1
- Demo / producto: https://hemmingway.io
- Descargas de apps (Mac y Android): https://hemmingway.io/download
- Repositorio de código: https://github.com/lukeckprobierts/Hemmingway-1
- Product Hunt: https://www.producthunt.com/products/hemmingway-ai
- Página del desarrollador: https://hemmingway.io/about/
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
