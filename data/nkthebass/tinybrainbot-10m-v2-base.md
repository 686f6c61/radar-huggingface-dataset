# nkthebass/tinybrainbot-10m-v2-base

## Resumen

TinyBrainBot-10M-v2-Base es un modelo de lenguaje de 9,9 millones de parámetros entrenado desde cero por el desarrollador independiente nkthebass (cuenta de HuggingFace `nkthebass`). Se trata de un `LlamaForCausalLM` estándar, sin código personalizado, pensado como modelo base de generación de texto en inglés: continúa texto, no conversa. Sustituye a TinyBrainBot-10M-Base y sigue la receta de TinyBrainBot-3M-v2-Base.

El modelo se ha entrenado con 10.160 millones de tokens (8,57 B de preentrenamiento a tasa de aprendizaje constante más 1,59 B en fase de decaimiento), con una mezcla que prioriza texto web filtrado, preguntas y respuestas, datos factuales y sentido común, dejando la aritmética como una parte menor pero deliberadamente reforzada. La arquitectura es un transformer decoder-only con hidden de 256, 12 capas, atención GQA (4 cabezas query y 2 KV), SwiGLU de 704, RMSNorm y RoPE, con un vocabulario byte-level BPE de 4.096 tokens y una ventana de contexto de 1.024 tokens.

Su relevancia es doble: por un lado, sirve como referencia de hasta dónde llega un modelo de ~10 M de parámetros en tareas de conocimiento y aritmética; por otro, es un caso práctico de entrenamiento reproducible (receta, composición del dataset y evaluaciones publicadas) dentro de la categoría de modelos ultra pequeños que compiten en la Open SLM Leaderboard.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (`LlamaForCausalLM`): 12 capas, hidden 256, 4 cabezas query de 64 dimensiones y 2 cabezas KV (GQA), SwiGLU 704, RMSNorm, RoPE |
| Parámetros totales | 9.902.336 (8,85 M sin embeddings + 1,05 M de embedding atado) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | GGUF F16 y GGUF Q8_0; safetensors en la precisión original. No se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |
| Vocabulario | 4.096 tokens, byte-level BPE, con dígitos separados uno por token y espacios en blanco preservados literalmente |
| Tokens de entrenamiento | 10,16 B (8,57 B de preentrenamiento + 1,59 B de decaimiento) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con el stack clásico de Llama: normalización RMSNorm, activación SwiGLU con dimensión intermedia 704, embeddings rotatorios (RoPE) y atención con query grouping (4 cabezas query de 64 dimensiones frente a 2 cabezas KV, lo que reduce el coste de la caché KV). El vocabulario de 4.096 tokens es byte-level BPE, con una decisión de diseño poco habitual: cada dígito se tokeniza por separado y los espacios en blanco se conservan exactamente, lo que facilita el modelado de operaciones aritméticas y de formato numérico.

El entrenamiento consume 10,16 B de tokens con una fase principal de 8,57 B a learning rate constante y una fase de decaimiento de 1,59 B. La mezcla de preentrenamiento es: DCLM-Ultra filtrado y deduplicado (25%), Cosmopedia (24,6%), conjuntos propios de preguntas-respuestas y datos factuales en texto plano destilados (15%), FineWeb-Edu (10%), aritmética de elaboración propia más Orca-Math y UltraData-Math (9%), TinyStories (8%), sentido común, how-to y escritura explicativa destilados (4,4%) y leads de Wikipedia (4%). Durante el decaimiento se sube el peso de Q&A y factual (25,5%), Cosmopedia (22,9%) y sentido común/escritura (12,8%), y se reduce el de DCLM-Ultra (15%) y FineWeb-Edu (4%). La aritmética se genera con programas propios (formatos numéricos, números en palabras, variantes de espaciado, negativos, orden de operaciones, tablas, posiciones desconocidas y distractores, con las respuestas calculadas en Python) para que la habilidad no dependa de una formulación concreta. No se documenta RLHF ni DPO: es un modelo base sin ajuste por preferencias.

## Capacidades

- Generación y continuación de texto en inglés: completa frases y párrafos cortos a partir de un prefijo.
- Respuesta a preguntas simples y reproducción de datos factuales de formato fijo (la model card declara conjuntos propios de Q&A y hechos en la mezcla).
- Aritmética elemental: sumas, restas y problemas de enunciado cortos, incluyendo formatos numéricos variados (números grandes, comas de millar, money).
- Sentido común básico y completado de escenas cotidianas (PIQA, HellaSwag).
- Escritura explicativa y procedimental sencilla (how-to) y textos narrativos muy simples (TinyStories).
- No soporta tool calling ni function calling: no se documenta ninguna capacidad de este tipo.
- No soporta uso agéntico ni razonamiento multi-paso: es un modelo base sin instrucciones ni modo thinking.
- No dispone de visión, audio ni otras modalidades.
- Multilingüe: no disponible; solo inglés.

## Casos de uso

- Docencia de arquitecturas transformer: el modelo es un Llama estándar de 9,9 M de parámetros con GQA, RoPE y SwiGLU, y cabe en 20 MB en F16, por lo que se puede cargar en un portátil y trazar formas de tensores, cabezas KV y atención paso a paso en clase.
- Pruebas de humo de infraestructura de inferencia: sirve para validar pipelines de transformers, llama.cpp, LM Studio, Jan o un endpoint compatible antes de desplegar modelos grandes, con un coste de descarga de 11-20 MB.
- Reproducción de recetas de entrenamiento from scratch: la model card detalla la proporción de cada fuente de datos en preentrenamiento y decaimiento, lo que permite replicar el currículo y estudiar curvas de escalado a escala de laboratorio.
- Investigación sobre tokenización numérica: al separar cada dígito en un token y preservar el espaciado, es un banco de pruebas controlado para medir cómo afecta la tokenización al rendimiento aritmético.
- Generación de texto sintético de relleno en entornos offline: dispositivos tipo Raspberry Pi o contenedores sin GPU pueden producir frases cortas para pruebas de UI, maquetación o datos de ejemplo sin depender de red.
- Validación de arneses de evaluación: sus resultados publicados en ARC-Easy, ARC-Challenge, HellaSwag, PIQA y ArithMark-3.0 permiten comprobar que un harness propio (lm-evaluation-harness u otro) reproduce cifras conocidas antes de medir modelos mayores.
- Comparación de referencia en la categoría sub-10M: útil como línea base pública frente a otros modelos del mismo tamaño en la Open SLM Leaderboard.

## Benchmarks y rendimiento

Resultados declarados por el autor (0-shot, `acc_norm`, conjuntos de test completos). Ninguno está verificado por terceros (`verified: false`).

| Benchmark | Métrica | Resultado |
|---|---|---|
| ARC-Easy (test) | acc_norm (0-shot) | 35,56 |
| ARC-Challenge (test) | acc_norm (0-shot) | 24,40 |
| HellaSwag (validation) | acc_norm (0-shot) | 28,24 |
| PIQA (validation) | acc_norm (0-shot) | 58,43 |
| ArithMark-3.0 (test) | acc_norm (0-shot) | 49,40 |

Evaluaciones aritméticas adicionales declaradas por el autor (todas `acc_norm`):

| Conjunto | Resultado |
|---|---|
| ArithMark-3 (público) | 49,4 |
| Enunciados aritméticos escritos por Gemma (544) | 36,4 |
| Enunciados aritméticos escritos por Llama (1.093) | 46,6 |
| 23 temas aritméticos ausentes de ArithMark-3, nueva redacción (1.380) | 39,2 |
| Formatos numéricos no vistos: números grandes / comas / dinero | 54,3 / 63,5 / 61,3 |
| Ecuaciones desnudas de ArithMark-3 («43 + 19 =») | 47,5 |
| ArithMark-2 | 34,7 |

## Requisitos de hardware

- VRAM estimada: unos 20 MB en F16 (9,9 M de parámetros × 2 bytes) y unos 11 MB en Q8_0, coherente con los tamaños de los GGUF publicados (20 MB y 11 MB).
- GPU recomendadas: ninguna en particular; el modelo no necesita acelerador. Una RTX 4090, A100 o H100 están sobredimensionadas para este tamaño y solo se justificarían para barridos masivos en paralelo.
- GPU de consumo: cabe en cualquier GPU de consumo con más de 1 GB de VRAM, y también en CPU, Raspberry Pi y móviles de gama media.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), llama.cpp (GGUF F16 y Q8_0), LM Studio, Jan, y Text Generation Inference (la model card está etiquetada con `text-generation-inference` y `endpoints_compatible`, lo que apunta a compatibilidad con Inference Endpoints de HuggingFace). El soporte en vLLM no está documentado en la información disponible.
- Latencia y throughput: no disponible. No se han publicado cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

Datos de la tabla comparativa de la propia model card (0-shot, test completo, `acc_norm`; el Intelligence Index es el de la Open SLM Leaderboard, y las cifras del resto de modelos provienen de esa leaderboard).

| Modelo | Parámetros | Int Index | HellaSwag | ARC-E | ARC-C | PIQA | ArithMark-3 | Licencia | Contexto |
|---|---|---|---|---|---|---|---|---|---|
| TinyBrainBot-10M-v2-Base | 9,90 M | 13,42 | 28,24 | 35,56 | 24,40 | 58,43 | 49,40 | Apache 2.0 | 1.024 |
| Ethoric-10M | 9,97 M | 12,94 | 28,75 | 37,58 | 24,66 | 59,85 | 41,60 | no disponible | no disponible |
| min-spark-1.7 | 9,98 M | 12,71 | 29,65 | 39,90 | 24,15 | 60,39 | 36,60 | no disponible | no disponible |
| ForgePlex-M2.2-10M | 9,99 M | 12,12 | 29,19 | 39,77 | 22,70 | 59,79 | 37,40 | no disponible | no disponible |
| heron1i-flash-lite-v2 | 9,92 M | 11,11 | 28,86 | 38,89 | 23,38 | 58,54 | 36,70 | no disponible | no disponible |

Lectura: el modelo lidera la comparativa en ArithMark-3 (49,40 frente a 36,60-41,60 del resto) e Intelligence Index (13,42), pero queda por debajo de sus competidores en HellaSwag, ARC-E, ARC-C y PIQA. La ventaja es específica de aritmética, no general.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni mantiene conversación. Uso previsto es continuación de texto, no chat.
- Rendimiento cercano al azar en tareas de conocimiento: ARC-Challenge con 4 opciones implica un 25% de acierto aleatorio, y el modelo obtiene 24,40. HellaSwag (28,24) está muy próximo al 25% de una elección de 4. No es fiable para responder preguntas.
- Contexto muy corto (1.024 tokens), insuficiente para documentos, código de tamaño medio o conversaciones multi-turno.
- Solo inglés. No hay soporte documentado de otros idiomas, ni siquiera del castellano.
- Riesgo alto de alucinación factual: con 9,9 M de parámetros y una mezcla con datos destilados, la reproducción de hechos es frágil; no debe usarse como fuente de verdad.
- Benchmarks no verificados: todas las cifras proceden del autor (`verified: false`) y no hay evaluación independiente en la información disponible.
- Procedencia de los conjuntos destilados no documentada: la model card menciona «our distilled plain-text sets» sin especificar modelos maestros ni procesos, lo que impide descartar solapamiento con datos de evaluación.
- Capacidades ausentes: no hay tool calling, agentes, código, matemáticas avanzadas, visión ni audio documentados.
- Licencia Apache 2.0: permite uso comercial y modificaciones sin restricciones adicionales, pero la calidad del modelo hace inviable su uso en producción para tareas de precisión.
- La model card está truncada en el apartado de receta («Recipe:»), por lo que detalles de optimizador, precisión de entrenamiento y hardware no están disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nkthebass/tinybrainbot-10m-v2-base
- Modelo predecesor (TinyBrainBot-10M-Base): https://huggingface.co/nkthebass/tinybrainbot-10m-base
- Modelo de la misma familia (TinyBrainBot-3M-v2-Base): https://huggingface.co/nkthebass/tinybrainbot-3m-v2-base
- Open SLM Leaderboard (AxiomicLabs): https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Dataset DCLM-Ultra: https://huggingface.co/datasets/ArrowLabs/DCLM-Ultra
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset Orca-Math word problems: https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
