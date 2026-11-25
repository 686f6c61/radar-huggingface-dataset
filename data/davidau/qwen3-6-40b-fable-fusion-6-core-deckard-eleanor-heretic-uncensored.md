# DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored

## Resumen

Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored es un modelo de lenguaje de tipo fine-tune publicado por el usuario DavidAU en Hugging Face. Se construye sobre la familia Qwen 3.6 y combina, según la model card, varios "núcleos" derivados de los fine-tunes Fable Fusion 711 y 717 (27B) con el modelo Deckard 40B como "sexto núcleo". El resultado es un modelo denso de aproximadamente 39.958 millones de parámetros, distribuidos en 96 capas y 1.290 tensores, con pipeline declarado de image-text-to-text y pesos en bfloat16/safetensors.

El modelo se presenta como una variante "heretic" y "abliterated", es decir, con el filtrado de rechazo reducido deliberadamente, orientada a usos creativos, escritura de ficción, roleplay y razonamiento. Incluye modo "thinking" y está etiquetado como compatible con endpoints de Hugging Face. Su licencia es Apache 2.0 y declara soporte para inglés y chino.

Su relevancia actual radica en que ofrece un modelo de 40B con un consumo de tokens de razonamiento reducido (entre 1/10 y 1/2 de un Qwen "normal", según el autor) y un rendimiento que, de acuerdo con los benchmarks publicados por Nightmedia, supera al Qwen3.6-27B-Instruct base en varias pruebas. No obstante, es un fine-tune de comunidad sin paper asociado ni validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3.6, tag `qwen3_5`), 96 capas, 1.290 tensores |
| Parametros totales | 39.958.026.224 (~40B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 en safetensors; el autor publica GGUF (incluido NEO Imatrix y MTP) en un repositorio aparte |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repositorio derivado |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de la familia Qwen 3.6, con 96 capas y 1.290 tensores, según los datos de la model card. El modelo no es un MoE: todos los parámetros están activos en cada pasada. El pipeline declarado es image-text-to-text, aunque la model card no detalla el codificador visual ni cómo se integra la entrada multimodal; el tag de arquitectura es `qwen3_5`.

El entrenamiento es un fine-tune multietapa ("multi-stage tuned") sobre DavidAU/Qwen3.6-40B-Grand-Intelligence-Fable-Fusion-Uncensored-Heretic. Según el autor, el modelo fusiona varios núcleos expandidos y entrenados de los fine-tunes Qwen 3.6 27B Fable Fusion 711 y 717 ("5 cores") con el modelo Deckard 40B ("6th core"). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El autor sí menciona el uso de "Heretic" para eliminar el comportamiento de rechazo y de técnicas de reducción de tokens de razonamiento ("auto variable thinking"). El tag MTP sugiere soporte de multi-token prediction, pero no se detalla su implementación.

## Capacidades

- Generación de texto y razonamiento en modo "thinking" e "instruct", con profundidad de pensamiento variable y reducción de tokens de razonamiento (1/10 a 1/2 respecto a un Qwen estándar, según el autor).
- Escritura creativa, ficción, narrativa larga y roleplay, que son los casos destacados en la model card.
- Generación de código, con el tag `coder` presente en los metadatos.
- Capacidad multimodal image-text-to-text declarada en el pipeline, sin detalles técnicos publicados.
- Multilingüe limitado a inglés y chino.
- Respuestas sin censura ni rechazo ("heretic", "abliterated", "uncensored").
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque el modo thinking lo hace plausible.

## Casos de uso

- Escritura de ficción y narrativa larga: el modelo está afinado específicamente para creatividad y profundidad de detalle, con lo que puede generar capítulos, tramas y diálogos coherentes en sesiones largas.
- Roleplay y personajes conversacionales: el entrenamiento "uncensored" y "heretic" permite mantener personajes sin rechazos moralizantes, útil en plataformas de entretenimiento conversacional.
- Asistencia a la investigación y análisis documental: el autor lo posiciona como especializado en "creative and research" dentro de su familia de 40B, con razonamiento profundo en modo thinking.
- Generación de código en entornos controlados: el tag `coder` y el soporte de transformers permiten integrarlo en pipelines de generación de código, aunque sin garantías de tool calling.
- Prototipado de asistentes conversacionales multilingües en inglés y chino: cubre los dos idiomas declarados con contexto conversacional multi-turno.
- Experimentación en investigación sobre alineación y censura: al ser un modelo abliterated, sirve como caso de estudio de cómo se comporta un modelo sin filtrado de rechazo.
- Despliegue local con GGUF: el repositorio derivado con cuantizaciones NEO Imatrix y MTP permite ejecución en hardware de consumo mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

Resultados publicados por Nightmedia en la model card, en modo instruct y precisión mxfp8:

| Modelo | arc/c | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored | 0,687 | 0,857 | 0,908 | 0,825 | 0,500 | 0,818 | 0,771 |
| Qwen3.6-40B-Grand-Intelligence-Fable-Fusion-Uncensored-Heretic ("hermana") | 0,698 | 0,862 | 0,904 | no disponible | no disponible | no disponible | no disponible |
| Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic (instruct, mxfp8) | 0,711 | 0,879 | 0,910 | 0,790 | 0,514 | 0,823 | 0,763 |
| Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic (instruct, mxfp4) | 0,701 | 0,873 | 0,909 | 0,786 | 0,488 | 0,813 | 0,759 |
| Qwen3.6-27B-Instruct (base, sin tuning) | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.6-35B-A3B-Instruct (base, sin tuning) | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |
| Qwen3.5-27B-Instruct (base, sin tuning) | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |

El propio autor reconoce que la expansión de 27B a 40B "costó algunas métricas" (arc/c y arc/e bajan respecto al Fable Fusion 711 de 27B), aunque defiende mejoras cualitativas detectadas en pruebas humanas. No hay benchmarks independientes ni resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 80 GB solo para pesos, más overhead de contexto y activaciones; requiere múltiples GPU o una GPU de 80 GB con cuantización.
- VRAM en cuantización de 4 bits (GGUF q4): en torno a 22-25 GB, viable en una RTX 4090 de 24 GB con contexto moderado.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para bf16; RTX 4090, RTX 5090 o A6000 para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo solo cuantizado a 4 bits o inferior; en 8 bits requiere al menos 40-48 GB.
- Opciones de despliegue: transformers (pesos safetensors), llama.cpp, Ollama y otros motores compatibles con GGUF; el autor publica GGUF NEO Imatrix y MTP en repositorio aparte. vLLM y TGI no están confirmados para esta arquitectura.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored | ~40B denso | no disponible | Apache 2.0 | Hugging Face (288 descargas, 20 likes) | Fine-tune de comunidad, sin censura |
| Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic | ~27B denso | no disponible | Apache 2.0 | Hugging Face (mismo autor) | Mejores métricas en arc/c, arc/e y obkqa; base del 40B |
| Qwen3.6-27B-Instruct | ~27B denso | no disponible | Apache 2.0 | Hugging Face (oficial) | Modelo base sin tuning; peor en arc/c y arc/e |
| Qwen3.6-35B-A3B-Instruct | 35B totales, ~3B activos (MoE) | no disponible | Apache 2.0 | Hugging Face (oficial) | Menor coste de inferencia por ser MoE; peor en las métricas publicadas |

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": elimina deliberadamente los rechazos, por lo que puede generar contenido dañino, ofensivo o ilegal sin filtro. No es apto para producción orientada al público general sin moderación externa.
- Riesgo elevado de alucinación: es un fine-tune de comunidad sin evaluación independiente ni datos de calibración.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Longitud de contexto no especificada, lo que impide planificar despliegues con ventanas largas.
- El autor reconoce una pérdida de métricas en arc/c y arc/e al expandir de 27B a 40B, lo que sugiere posibles regresiones respecto al modelo del que deriva.
- Los benchmarks son internos (Nightmedia) y en modo instruct; no hay validación por terceros.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado sin censura traslada al desplegador toda la responsabilidad legal y ética.
- El pipeline declarado como image-text-to-text no está documentado técnicamente; no se debe asumir capacidad multimodal fiable sin pruebas.
- El repositorio ocupa 79,9 GB, lo que exige almacenamiento y ancho de banda considerables para su descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored
- Repositorio GGUF (NEO Imatrix y MTP): https://huggingface.co/DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-NM-DAU-NEO-MAX-MTP-GGUF
- Proyecto base: https://huggingface.co/DavidAU/Qwen3.6-40B-Grand-Intelligence-Fable-Fusion-Uncensored-Heretic
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Qwen3.6-27B-Fable-Fusion-711 (núcleo base): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen3.6-40B-Claude-4.6-Opus-Deckard (modelo Deckard): https://huggingface.co/DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF
- Qwen3.5-9B-The-Defiant (modelo pequeño de la familia): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
