# INGMUYLEANG/akkhara-byt5-small

## Resumen

Akkhara-ByT5-Small-Khmer es un modelo de transliteración entrenado para convertir *Sing Khmer* (jemer escrito con letras latinas, tal como se teclea en chats y redes sociales) en escritura jemer nativa. Lo desarrolla Ing Muyleang y se publica bajo licencia Apache-2.0. El modelo devuelve una lista ordenada de cinco candidatos, imitando el comportamiento de un IME (input method editor) o asistente de tecleo predictivo.

Técnicamente es un encoder-decoder T5 a nivel de byte (ByT5), afinado a partir de `google/byt5-small`, con 299,6 millones de parámetros. Al operar sobre bytes en lugar de tokens subword, evita los problemas de tokenización en una lengua con escritura propia y en entradas mixtas jemer-inglés, y puede reconstruir secuencias que nunca aparecieron como token completo en el vocabulario.

Su relevancia es doble: por un lado cubre un caso de uso real y poco atendido (la romanización informal del jemer en mensajería); por otro, demuestra que un modelo de 0,3B puede superar en precisión a una variante de 18M en texto formal, manteniendo resultados casi idénticos en chat real, lo que lo hace viable en despliegues modestos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder a nivel de byte (ByT5) |
| Parámetros totales | 299.637.760 (299,6M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el autor recomienda trocear la entrada en fragmentos de ~6 palabras para tecleo en vivo) |
| Tipos de cuantización | no disponible (formato safetensors; admite cuantización estándar de transformers, sin configuraciones publicadas) |
| Idiomas soportados | jemer (km) y palabras inglesas embebidas en la entrada mixta (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,2 GB) |

## Arquitectura y entrenamiento

El modelo es un T5 byte-level: el tokenizador mapea cada byte UTF-8 a un símbolo, de modo que el vocabulario cubre cualquier secuencia de bytes sin tokens `<unk>`. Esta decisión es especialmente adecuada para el jemer, cuya escritura no está bien representada en los vocabularios subword habituales, y para entradas de chat con mezcla de alfabetos, abreviaturas y signos.

El entrenamiento parte de `google/byt5-small` y se afina sobre pares Sing Khmer → jemer recopilados, generados, limpiados y revisados por el autor con ayuda de herramientas de IA, según indica la model card. El conjunto de datos es `muyleanging/Akkhara-Sing-Khmer` (acceso bajo petición). No se publican detalles de hiperparámetros, hardware, tiempo de entrenamiento ni si hubo RLHF o DPO; la model card lo declara explícitamente como no publicado. La decodificación recomendada es beam search con 5 beams y 5 secuencias devueltas, que es la configuración usada en los benchmarks.

## Capacidades

- Transliteración de Sing Khmer a escritura jemer con salida de top-5 candidatos ordenados.
- Manejo de entradas mixtas jemer-inglés: las palabras inglesas del chat (`send link`, `benchmark`) se preservan tal cual en la salida.
- Procesamiento de abreviaturas de chat (`tmr` → ស្អែក, `sry` → សុំទោស, `btw` → ម្យ៉ាងទៀត).
- Tratamiento de signos de puntuación expresivos en contexto de chat (`jom! loy mes` → ចុម! ឡូយម្ល៉េះ).
- Desambiguación contextual de palabras cortas ambiguas (`ng` puede ser និង, នឹង o ហ្នឹង según el vecindario).
- Reconstrucción de palabras pegadas (glued words).
- Generación de texto condicionada por entrada (text2text-generation) compatible con el pipeline `translation` de transformers.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Teclado y asistente de escritura para jemer: integrado en la aplicación [akkhara-keyboard](https://github.com/MuyleangIng/akkhara-keyboard), el modelo recibe lo que el usuario teclea en latín y ofrece cinco candidatos en jemer; el autor recomienda trocear la entrada en bloques de ~6 palabras y cachear los bloques ya resueltos para mantener la latencia baja durante el tecleo.
- Normalización de mensajes de chat para análisis: en pipelines de moderación o de análisis de conversaciones, el modelo convierte mensajes romanizados en escritura jemer canónica, lo que facilita el procesamiento posterior con herramientas de NLP para jemer.
- Transcripción de corpus informales: para investigadores que recopilan datos de redes sociales en Sing Khmer, el modelo permite generar una versión en escritura nativa y usar el top-5 para revisión humana de los casos ambiguos.
- Búsqueda y recuperación: al normalizar consultas romanizadas a escritura jemer, se pueden alinear con índices construidos sobre texto formal jemer, mejorando la recuperación en buscadores internos o bases documentales.
- Preprocesado para traducción automática: la salida del modelo puede alimentar un traductor jemer-inglés que espere escritura nativa, cerrando el hueco entre la entrada de chat y los sistemas de traducción estándar.
- Etiquetado asistido de datos: el top-5 sirve como propuesta inicial para anotadores humanos que construyen corpus jemer, reduciendo el coste por frase frente a la transcripción manual.
- Soporte a la digitalización de contenido generado por usuarios: plataformas que reciben comentarios en Sing Khmer pueden mostrar una versión en escritura jemer junto al original, mejorando la accesibilidad para lectores que no dominan la romanización informal.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todos con la misma configuración de beam search (5 beams). El conjunto de test retenido tiene 7.821 frases; el de chat real, 39 frases etiquetadas por un hablante nativo; el de contexto, 86 pruebas; el de palabras pegadas, 7 pruebas.

| Modelo | Test top-1 | Test top-5 | Test CER | Chat real top-1 / top-5 | Contexto #1 / top-5 | Pegadas |
|---|---|---|---|---|---|---|
| akkhara-mini (18M) | 57,9% | 76,6% | 4,55% | 87% / 95% | 81 / 99% | 7/7 |
| akkhara-byt5-small (300M) | 62,0% | 79,7% | 3,73% | 87% / 95% | 80 / 98% | 7/7 |

Lectura: el modelo de 300M mejora al de 18M en texto formal (top-1 +4,1 puntos, CER 0,82 puntos menor), pero en chat real ambos empatan en top-1 y top-5, y el pequeño obtiene una décima más en contexto. El autor concluye que el modelo grande es el más preciso en texto tipo noticia y que, para chat, ambos son equivalentes en la práctica.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1,2 GB solo para pesos (299,6M × 4 bytes), más activaciones y caché de beam search; con 5 beams la memoria de decodificación se multiplica.
- En fp16/bf16: aproximadamente 0,6 GB de pesos, holgadamente dentro de cualquier GPU consumer.
- Cabe en GPU consumer: sí, en cualquier tarjeta con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, RTX 4090). También es viable en CPU para uso interactivo con entradas cortas.
- GPU recomendadas para servicio: no se requieren aceleradores de gama alta; una T4 o L4 basta para servir varias peticiones concurrentes con beam search de 5.
- Opciones de despliegue: transformers (`AutoModelForSeq2SeqLM`), text-generation-inference (etiqueta `text-generation-inference` en el repo, endpoints compatibles), y exportación a ONNX para despliegue en móvil, como hace la variante mini. No se documenta soporte específico de vLLM ni llama.cpp.
- Latencia y throughput: no disponibles. El autor no publica mediciones; la recomendación de trocear en ~6 palabras sugiere que entradas largas con 5 beams pueden ser lentas para tecleo en vivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| akkhara-byt5-small (este) | 299,6M | no disponible | ByT5, transliteración Sing Khmer → jemer, top-5 | Apache-2.0 | Hugging Face, demo en Space, app de teclado |
| akkhara-mini | 18M (según model card) | no disponible | Mismo enfoque, orientado a móvil, exportado a ONNX | no disponible en la información | Hugging Face (`muyleanging/Akkhara-Mini-Khmer-ONNX`) |
| google/byt5-small | ~300M | no disponible | Modelo base multilingüe byte-level, sin afinado a esta tarea | Apache-2.0 | Hugging Face |

No se dispone de datos sobre otros sistemas de transliteración jemer comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento mayoritariamente sobre pares sintéticos; el conjunto de chat real usado para evaluar es muy pequeño (39 frases), por lo que las métricas en conversación tienen alta varianza.
- Las abreviaturas cortas (`ng`, `mn`, `dl`, `bn`) son ambiguas y la respuesta correcta suele estar en el top-5 más que en el top-1; un uso en producción debe presentar varias opciones al usuario.
- El modelo ha aprendido palabras malsonantes presentes en el chat real; puede generarlas si la entrada las sugiere, lo que exige filtrado en aplicaciones dirigidas a público general.
- No se publican detalles de entrenamiento (hardware, tiempo, hiperparámetros), lo que dificulta la reproducibilidad.
- El alcance lingüístico se limita al jemer y a palabras inglesas embebidas; no hay soporte declarado para otras lenguas ni para escrituras distintas.
- Riesgo de alucinación en entradas fuera de distribución: al ser byte-level, puede producir secuencias jemer plausibles pero incorrectas para cadenas latinas no vistas.
- La licencia Apache-2.0 permite uso comercial, pero el dataset de entrenamiento es de acceso restringido y conviene revisar sus condiciones antes de redistribuir derivados.
- La longitud de contexto no está documentada; entradas largas deben trocearse manualmente, lo que puede romper dependencias entre palabras separadas por el corte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/INGMUYLEANG/akkhara-byt5-small
- Modelo (URL canónica del autor): https://huggingface.co/muyleanging/Akkhara-ByT5-Small-Khmer
- Modelo base: https://huggingface.co/google/byt5-small
- Dataset: https://huggingface.co/datasets/muyleanging/Akkhara-Sing-Khmer
- Demo: https://huggingface.co/spaces/muyleanging/Akkhara-Demo
- Aplicación de teclado: https://github.com/MuyleangIng/akkhara-keyboard
- Variante mini (ONNX): https://huggingface.co/muyleanging/Akkhara-Mini-Khmer-ONNX
- Perfil del autor: https://huggingface.co/muyleanging
- GitHub del autor: https://github.com/MuyleangIng
