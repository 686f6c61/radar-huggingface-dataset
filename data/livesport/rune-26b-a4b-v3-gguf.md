# Livesport/rune-26b-a4b-v3-GGUF

## Resumen

Rune 26B-A4B v3 es un modelo de decisión desarrollado por Invergent y distribuido en formato GGUF por Livesport. No es un modelo generativo al uso: dada una *state* (un estado o contexto textual) y una pregunta con un conjunto de opciones, devuelve una probabilidad para cada opción leyendo los logits de las letras identificadoras de cada opción en la primera posición generada. Está pensado, por tanto, para tareas de clasificación y selección entre alternativas, no para producir texto libre.

Arquitectura de mezcla de expertos (MoE) con 25.233.142.046 parámetros totales y aproximadamente 4B activos por token (A4B), derivada de la familia Gemma 4 y calificada como `decision-model` en su model card. Los idiomas soportados son inglés y checo. La licencia es Apache 2.0.

La relevancia de esta publicación concreta es la cuantización: Livesport ofrece builds GGUF con matriz de importancia (imatrix) calculada sobre prompts de decisión en el formato exacto de producción, con tipos por tensor y una calidad medida frente a los pesos bf16 originales. La versión IQ3_S-dyn (13,60 GB) corre en producción sobre 2× Quadro RTX 4000 de 8 GB detrás de una API compatible con `/v1/systemone`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), base Gemma 4 26B-A4B |
| Parametros totales | 25.233.142.046 |
| Parametros activos | ~4B (denominación A4B; cifra exacta no disponible) |
| Longitud de contexto | 16k tokens (medido en IQ3_S-dyn); contexto máximo nativo no disponible |
| Tipos de cuantizacion | IQ3_S-dyn, IQ4_XS-dyn, Q8_0 (más imatrix e IQ3_M en revisión anterior) |
| Idiomas soportados | en, cs |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); origen bf16 safetensors convertido con `convert_hf_to_gguf.py` |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 25,2B parámetros totales, de los cuales los expertos representan el 90 %. La arquitectura base es Gemma 4 26B-A4B, con atención, FFN compartida, router y embeddings como componentes no-expertos. El modelo no genera texto: la salida se obtiene de los logits de las letras de opción en la primera posición generada, lo que lo convierte en un clasificador de opciones probabilístico. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; la model card remite para ello a la ficha del modelo base de Invergent.

La innovación técnica de esta publicación está en la cuantización. La imatrix se calculó sobre el modelo bf16 con 1,5M tokens a contexto 2048 (733 chunks), usando exclusivamente prompts de decisión en el formato de producción (plantilla de chat, thinking desactivado, system prompt y layout `SHARED STATE` / `QUESTION` / `OPTIONS`). Se renderizaron 7.932 prompts a partir de 5.018 registros y se conservaron 2.723 aleatorios. Los estados provienen de los splits de entrenamiento de BoolQ, AG News y SST-2, de digests multiartículo de AG News, de noticias checas (CIIRC-NLP/czech_news_simple-cs y hynky/czech_news_dataset_v2) y de `calibration_datav3` de bartowski. Cada tensor de experto recibió datos para al menos el 95,3 % de sus expertos (frente al 88,3 % de la imatrix anterior). En los ficheros dinámicos, todos los tensores no-expertos se mantienen en Q8_0, el router (`ffn_gate_inp`) y las normas en F32, y los bits restantes se asignan a los expertos con tipos diferenciados por tensor, incluyendo una capa final (29) con mayor precisión.

## Capacidades

- Clasificación y decisión entre opciones: devuelve una probabilidad por opción a partir de los logits de las letras identificadoras.
- Tres tipos de pregunta distintos, en checo e inglés, según el protocolo de decisión del autor.
- Manejo de estados largos: se han medido estados sintéticos de 2k a 12k tokens con 5 preguntas cada uno.
- Formato de prompt específico: plantilla de chat, thinking desactivado, system prompt y layout `SHARED STATE` / `QUESTION` / `OPTIONS`.
- Integración con llama.cpp mediante `llama-server` y API compatible con `/v1/systemone`.
- No soporta visión: los ficheros contienen solo el modelo de lenguaje, sin la torre de visión de Gemma 4.
- No soporta generación de texto libre ni tool calling ni razonamiento multi-paso en el sentido habitual; su función es la selección probabilística entre opciones.

## Casos de uso

- Clasificación de noticias en producción: el modelo recibe el texto de un artículo como estado y un conjunto de categorías como opciones, y devuelve la probabilidad de cada una. Los resultados medidos en AG News test (83,0-85,3 según cuantización) respaldan este uso.
- Análisis de sentimiento: con SST-2 validation como referencia (94,0-94,3), puede aplicarse a la clasificación de polaridad de reseñas o comentarios usando el mismo protocolo de estado más opciones.
- Respuesta a preguntas de comprensión lectora: con BoolQ validation como referencia (84,3-84,7), el modelo selecciona entre opciones tipo sí/no dado un pasaje y una pregunta.
- Moderación y enrutamiento de contenido: dado un texto y un conjunto cerrado de políticas o etiquetas, el modelo asigna probabilidades a cada una, lo que permite umbrales de decisión calibrados.
- Despliegue en hardware modesto: la cuantización IQ3_S-dyn (13,60 GB) está medida para 2× Quadro RTX 4000 de 8 GB con contexto de 16k, lo que permite servir el modelo en infraestructura de gama media.
- Procesamiento de noticias en checo e inglés: el modelo cubre ambos idiomas y se calibró con corpus de noticias checas, lo que lo hace adecuado para pipelines editoriales bilingües.
- Evaluación de alternativas en sistemas de recomendación o ranking: al devolver probabilidades por opción, puede integrarse como componente de scoring en lugar de como generador.

## Benchmarks y rendimiento

Resultados medidos por el autor con `llama-server`, temperatura 1, sin reutilización de caché de prompt, comparando probabilidades de opción frente al GGUF bf16. Ítems: 143 preguntas internas (93 estados, checo e inglés, conjuntos `base` y `hard`), 900 preguntas públicas (300 de BoolQ validation, 300 de AG News test, 300 de SST-2 validation) y 24 estados sintéticos largos (2k-12k tokens) con 5 preguntas cada uno. Medido en NVIDIA GB10 con llama.cpp `aa885f0`.

| GGUF | Tamano | base / hard / BoolQ / AG / SST-2 | Concordancia | Media \|Δp\| | \|Δp\| estados largos | KL |
|---|---:|---|---:|---:|---:|---:|
| bf16 (referencia) | 50,5 GB | 95,9 / 93,5 / 84,3 / 83,3 / 94,3 | — | — | — | — |
| Q8_0 | 26,86 GB | 96,9 / 91,3 / 84,3 / 83,0 / 94,0 | 98,7 % | 0,0122 | 0,0159 | 0,0094 |
| IQ4_XS-dyn | 16,74 GB | 95,9 / 91,3 / 84,7 / 84,0 / 94,0 | 97,9 % | 0,0166 | 0,0251 | 0,0198 |
| IQ3_S-dyn | 13,60 GB | 96,9 / 91,3 / 84,3 / 85,3 / 94,3 | 97,3 % | 0,0214 | 0,0307 | 0,0235 |
| IQ3_M (versión anterior del repo) | 12,39 GB | 97,9 / 93,5 / 85,0 / 85,7 / 95,3 | 96,0 % | 0,0318 | 0,0600 | 0,0450 |

Progresión de la receta de cuantización hasta IQ3_S-dyn:

| Paso | Tamano | KL |
|---|---:|---:|
| IQ3_M con imatrix anterior (250 × 512 tokens) | 12,39 GB | 0,0450 |
| Receta IQ3_M con nueva imatrix en formato de decisión, cuantizada desde bf16 | 12,39 GB | 0,0383 |
| Tensores no-expertos Q8_0, expertos IQ3_XXS / IQ4_NL, capa final más alta (estilo unsloth) | 12,91 GB | 0,0321 |
| IQ3_S-dyn final (imatrix de 1,5M tokens a contexto 2048) | 13,60 GB | 0,0235 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: IQ3_S-dyn (13,60 GB) medida en 7,93 / 7,89 GB por GPU sobre 2× 8 GB; IQ4_XS-dyn (16,74 GB) para GPUs de 24 GB; Q8_0 (26,86 GB) para 32 GB o más.
- GPU recomendadas: 2× Quadro RTX 4000 de 8 GB (configuración de producción de Livesport), una GPU de 16 GB para IQ3_S-dyn, 24 GB para IQ4_XS-dyn, 32 GB o más para Q8_0.
- Cabe en GPU de consumo: sí, IQ3_S-dyn en una GPU de 16 GB y IQ4_XS-dyn en una de 24 GB.
- Opciones de despliegue: llama.cpp (`llama-server`) es el entorno con el que se midieron los ficheros; no se mencionan otros backends.
- Latencia y throughput: no disponibles. Las mediciones se hicieron en NVIDIA GB10 con llama.cpp `aa885f0`, sin cifras de latencia o tokens por segundo publicadas.
- Contexto: 16k tokens medidos para IQ3_S-dyn.

## Comparativa con modelos similares

No se dispone de datos sobre modelos comparables de la misma categoría (modelos de decisión MoE de ~26B) en la información proporcionada. La comparación más directa disponible es interna, entre las propias cuantizaciones del mismo modelo:

| Variante | Tamano | Concordancia con bf16 | KL | Hardware objetivo |
|---|---:|---:|---:|---|
| Q8_0 | 26,86 GB | 98,7 % | 0,0094 | 32 GB o más |
| IQ4_XS-dyn | 16,74 GB | 97,9 % | 0,0198 | 24 GB |
| IQ3_S-dyn | 13,60 GB | 97,3 % | 0,0235 | 2× 8 GB o una de 16 GB |
| IQ3_M (anterior) | 12,39 GB | 96,0 % | 0,0450 | 2× 8 GB |

## Limitaciones y advertencias

- No genera texto: cualquier uso que espere salida generativa es un error de planteamiento; solo produce probabilidades sobre opciones.
- Sin visión: los ficheros GGUF excluyen la torre de visión de Gemma 4, por lo que no se admiten estados con imágenes.
- Formato de prompt estricto: el modelo rinde según el protocolo `SHARED STATE` / `QUESTION` / `OPTIONS` con thinking desactivado; desviarse de él puede degradar la calidad.
- Idiomas limitados a inglés y checo; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- La imatrix se calibró con datos de entrenamiento de BoolQ, AG News, SST-2, noticias checas y `calibration_datav3`; aunque el autor afirma que los ítems de evaluación son disjuntos, la calibración está sesgada hacia dominios de noticias y clasificación.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de calibración deficiente de probabilidades fuera de los dominios de calibración.
- La cuantización IQ3_S-dyn introduce una media de |Δp| de 0,0214 y de 0,0307 en estados largos frente a bf16; para decisiones con umbrales ajustados conviene usar IQ4_XS-dyn o Q8_0.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base es de Invergent y la ficha remite a su model card para condiciones y protocolo de entrenamiento.
- Los datos de rendimiento proceden del propio autor; no hay evaluación independiente disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Livesport/rune-26b-a4b-v3-GGUF
- Modelo base: https://huggingface.co/surogate/rune-26b-a4b-GGUF
- Revisión anterior del repositorio (IQ3_M): https://huggingface.co/Livesport/rune-26b-a4b-v3-GGUF/tree/499039616722228c3e4849ebb7315ce232fd07c7
- Invergent: https://invergent.ai
- Layout de cuantización de referencia (unsloth, Gemma 4 26B-A4B): https://huggingface.co/unsloth/gemma-4-26B-A4B-it-GGUF
- Dataset de calibración checo: https://huggingface.co/datasets/CIIRC-NLP/czech_news_simple-cs
- Dataset de calibración checo: https://huggingface.co/datasets/hynky/czech_news_dataset_v2
