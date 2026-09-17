# BAJUKA/LLaVA-llama32-3b-VLfull-s1337-s2a

## Resumen

LLaVA-llama32-3b-VLfull-s1337-s2a es un modelo vision-lenguaje (image-text-to-text) desarrollado por el usuario BAJUKA y publicado en HuggingFace. Se construye sobre el backbone de texto meta-llama/Llama-3.2-3B-Instruct (3.212 millones de parámetros en el LM) al que se añade un codificador visual google/siglip-so400m-patch14-384 y un proyector MLP, siguiendo la arquitectura LLaVA-NeXT (clase `LlavaLlamaForCausalLM`). El resultado son 3.623.482.912 parámetros totales y un repositorio de 7,3 GB en safetensors.

Lo relevante de esta publicación no es su rendimiento absoluto, sino su naturaleza de artefacto experimental controlado. Forma parte de una rejilla de entrenamiento que compara variantes visión-lenguaje frente a variantes solo texto, donde todos los brazos comparten mezclas de datos, orden de ejemplos para una semilla dada, ajustes de optimizador y schedule de learning rate; únicamente cambian los datos, el orden y qué módulos son entrenables. Esta ficha corresponde al brazo `VL-cap` (o `VLfull`) en el paso S2a, la etapa de captioning, con semilla 1337.

El modelo se entrenó una única época completa (5859 pasos, batch global 128) sobre la mezcla CAP-750K, con imágenes procesadas a `anyres_max_9`, en 4x H100 80GB con DeepSpeed ZeRO-3. La pérdida bajó de 2,774 a 0,958. Es, por tanto, un checkpoint de investigación pensado para comparaciones atribuibles, no un modelo afinado para producción ni alineado en seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaVA-NeXT: decoder-only transformer (Llama 3.2 3B Instruct) + vision tower SigLIP-so400m-patch14-384 + proyector MLP (`mm_mlp_adapter`); clase `LlavaLlamaForCausalLM` |
| Parámetros totales | 3.623.482.912 (3,62 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens de longitud máxima de secuencia durante el entrenamiento; contexto multimodal efectivo en inferencia no disponible |
| Tipos de cuantización | No disponible: solo se publican pesos safetensors (repo de 7,3 GB, coherente con bf16/fp16 para 3,62 mil millones de parámetros). No hay GGUF, AWQ, GPTQ ni versiones cuantizadas publicadas |
| Idiomas soportados | No especificado en la model card. El backbone Llama-3.2-3B-Instruct declara inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |
| Etapa de entrenamiento | S2a (caption stage); brazo VL-cap de la rejilla controlada, semilla 1337 |
| Precisión de entrenamiento | bfloat16 |
| Plantilla de prompt | `llama_v3` |

## Arquitectura y entrenamiento

La arquitectura es la de LLaVA-NeXT, un stack multimodal compuesto por tres piezas: el vision tower `google/siglip-so400m-patch14-384` (SigLIP con parches de 14 px a 384 px de resolución), un proyector MLP que traduce las características visuales al espacio de embeddings del LM, y el modelo de lenguaje `meta-llama/Llama-3.2-3B-Instruct`. El procesamiento de imagen usa `anyres_max_9`, es decir, resolución nativa con hasta nueve recortes de alta resolución, lo que multiplica el número de tokens visuales por imagen y, con ello, el coste de atención.

El entrenamiento corresponde a la etapa S2a (caption stage) del brazo `VLfull`, en el que se congelan cero módulos: se entrenan simultáneamente vision tower, proyector y modelo de lenguaje (`mm_vision_tower,mm_mlp_adapter,mm_language_model`). La mezcla de datos CAP-750K suma 749.956 ejemplos: `captions_700k_v2` (700.000) más `language_50k_v2` (49.956), esta última presumiblemente para preservar capacidades de texto. Se ejecutó una época completa en 5859 pasos con batch global 128, learning rate 1e-5 para LM y proyector y 2e-6 para el vision tower, schedule coseno con warmup ratio 0,03, precisión bfloat16 y longitud máxima de secuencia 8192. El cómputo se repartió en 4x H100 80GB con DeepSpeed ZeRO-3.

La pérdida de entrenamiento evolucionó de 2,774 a 0,958, con una media de 1,044 en los últimos 50 pasos registrados, y no se produjo ninguna pérdida no finita en los 5859 pasos. El repositorio incluye `trainer_state.json` con el historial completo por paso (loss, grad-norm y learning rate). No se aplicó early stopping ni selección de checkpoint: cada etapa ejecuta exactamente una época.

## Capacidades

- Descripción de imágenes y generación de captions: es la capacidad para la que fue entrenado específicamente en la etapa S2a, sobre 700.000 ejemplos de captioning.
- Conversación multimodal multi-turno: hereda el formato conversacional del backbone Instruct y la plantilla `llama_v3`.
- Comprensión de imagen y texto combinados (`image-text-to-text`) con hasta nueve recortes de alta resolución por imagen, lo que favorece la lectura de detalles en imágenes densas.
- Generación de texto e instrucciones generales en el LM subyacente, reforzada por los 49.956 ejemplos de `language_50k_v2` incluidos en la mezcla.
- Razonamiento de texto y conocimiento general heredados de Llama-3.2-3B-Instruct, incluida capacidad de código y matemáticas básicas del backbone (no evaluada ni garantizada en este checkpoint).
- Capacidades multilingües potenciales derivadas del backbone (inglés, alemán, francés, italiano, portugués, hindi, español, tailandés), no verificadas sobre la parte visual.
- Soporte de tool calling / function calling: no disponible. No se documenta ni se ha entrenado explícitamente para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible. No hay evidencia de entrenamiento orientado a agentes.
- Modo "thinking": no disponible.
- Entrada de audio o vídeo: no disponible (solo imagen y texto).

## Casos de uso

- Generación automática de texto alternativo y metadatos de imágenes: el modelo fue entrenado precisamente en captioning sobre 700.000 pares imagen-texto, por lo que es adecuado para etiquetar catálogos, bancos de imágenes o repositorios de contenido con descripciones en lenguaje natural.
- Moderación asistida de contenido visual: combinando el captioning con el LM, se pueden generar descripciones estructuradas de imágenes subidas por usuarios para alimentar reglas de revisión o clasificadores posteriores.
- Accesibilidad: descripción de imágenes para lectores de pantalla en aplicaciones, aprovechando la capacidad conversacional del backbone para responder a preguntas de seguimiento sobre la misma imagen.
- Búsqueda semántica de imágenes: generar captions y embeddings textuales derivados de ellos para indexar y recuperar imágenes en un catálogo interno.
- Extracción estructurada de información de documentos escaneados simples: con `anyres_max_9` el modelo recibe hasta nueve recortes en alta resolución, útil para leer formularios, tickets o etiquetas y devolver texto en un formato pedido en el prompt.
- Asistente visual conversacional en prototipos de investigación: al soportar diálogo multi-turno con contexto de 8192 tokens, permite construir demos de preguntas y respuestas sobre imágenes.
- Base para experimentos académicos controlados: su razón de ser es servir como brazo comparable en una rejilla experimental, útil para medir el efecto de la etapa de captioning frente a otras configuraciones con los mismos datos y orden.
- Evaluación de pipelines de entrenamiento multimodal: al publicarse los dos checkpoints por separado y el `trainer_state.json`, sirve para reproducir y auditar curvas de pérdida y decisiones de diseño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación tipo MMLU, HumanEval, GSM8K, VQAv2, TextVQA, MMBench ni similares, y la búsqueda web realizada no devolvió ninguna fuente relacionada con el modelo. El único dato cuantitativo de rendimiento publicado es la pérdida de entrenamiento:

| Métrica | Valor |
|---|---|
| Pérdida inicial | 2,774 |
| Pérdida final | 0,958 |
| Pérdida media (últimos 50 pasos registrados) | 1,044 |
| Pasos registrados | 5859 (época 1,0000 de 1) |
| Pérdidas no finitas | 0 |

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 7,3 GB en disco y del orden de 8-10 GB de VRAM para inferencia, sin contar la memoria de activaciones.
- Memoria adicional por tokens visuales: el modo `anyres_max_9` genera hasta nueve recortes a 384 px por imagen, lo que incrementa notablemente la longitud de secuencia efectiva. Con contexto largo (hasta 8192 tokens) la VRAM necesaria puede superar holgadamente la de los pesos solos; las cifras concretas no están publicadas.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más (RTX 3060 12GB, RTX 4070, RTX 4080, RTX 4090) para imágenes y contextos moderados en bf16. En 8 GB queda muy justo o directamente inviable sin cuantización.
- Cuantización: no hay pesos cuantizados publicados (ni GGUF ni formatos de 4/8 bits), por lo que no se puede desplegar hoy en runtimes tipo llama.cpp u Ollama sin convertir y validar por cuenta propia.
- Opciones de despliegue: la vía documentada por el autor es clonar el repositorio LLaVA-NeXT y cargar con `load_pretrained_model(..., "llava_llama")`, ya que `LlavaLlamaForCausalLM` no forma parte de `transformers`. El soporte en vLLM, TGI, Ollama o llama.cpp no está confirmado y se considera no disponible.
- GPU recomendadas para entrenamiento o fine-tuning: el autor usó 4x H100 80GB con DeepSpeed ZeRO-3; para inferencia basta una sola GPU moderna con VRAM suficiente.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo de preprocesado de imagen.

## Comparativa con modelos similares

No hay benchmarks publicados para este checkpoint, por lo que la comparación se limita a parámetros, licencia y disponibilidad. Los datos de los modelos alternativos provienen de sus respectivas model cards públicas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| BAJUKA/LLaVA-llama32-3b-VLfull-s1337-s2a | 3,62 mil millones | 8192 tokens de entrenamiento (efectivo multimodal no disponible) | Llama 3.2 Community License | Pesos safetensors; requiere LLaVA-NeXT; sin cuantizaciones |
| Qwen2-VL-2B-Instruct | 2,21 mil millones | 32768 tokens | Apache-2.0 | Amplia integración en transformers y vLLM; versiones cuantizadas disponibles |
| LLaVA-OneVision-Qwen2-0.5B | 0,5 mil millones | 32768 tokens | Apache-2.0 | Pesos abiertos sobre LLaVA-NeXT; orientado a imagen única, multi-imagen y vídeo |
| SmolVLM-Instruct | 2,25 mil millones (SigLIP-base-400M + SmolLM2-1.7B) | No disponible | Apache-2.0 | Pesos abiertos con soporte en transformers; versiones cuantizadas disponibles |

Diferencias clave: este checkpoint es el único de la tabla con licencia Llama 3.2 y sin soporte nativo en `transformers`, mientras que las alternativas usan licencias Apache-2.0 y se integran en runtimes estándar. A cambio, ofrece trazabilidad experimental completa (semilla, mezcla de datos, historial de pérdida) que los modelos de producción no publican.

## Limitaciones y advertencias

- Es un artefacto de investigación procedente de una comparación controlada, no un lanzamiento afinado ni alineado en seguridad. El propio autor lo indica explícitamente.
- El checkpoint S2a es un brazo legítimo de la rejilla, no un "mejor" checkpoint: no hubo early stopping ni selección, cada etapa ejecuta una época completa.
- Riesgo de alucinación: al estar entrenado principalmente sobre 700.000 captions, puede describir objetos o detalles ausentes en la imagen; no se documenta ningún proceso de mitigación (RLHF, DPO ni verificación factual).
- Sesgos: la mezcla de datos de captioning (`captions_700k_v2`) no está descrita en la model card en cuanto a procedencia, idioma o composición demográfica, por lo que no se puede evaluar el sesgo introducido. Hereda además los sesgos conocidos del backbone Llama 3.2.
- Limitaciones de idioma: la model card no especifica idiomas soportados para la parte visual. Aunque el backbone declara ocho idiomas, no hay garantía de que el entrenamiento de captioning no haya degradado el multilingüismo.
- Limitaciones de contexto: la longitud máxima de secuencia durante el entrenamiento fue 8192 tokens; superar ese valor en producción es terreno no validado. La longitud efectiva reportada por `load_pretrained_model` no se documenta.
- Restricciones de licencia: se hereda la Llama 3.2 Community License con sus condiciones (atribución "Built with Llama", obligaciones de nomenclatura y cláusulas específicas sobre modelos multimodales y disponibilidad territorial, con especial atención a la Unión Europea). Conviene revisar el texto legal completo antes de un uso comercial.
- Dependencia de software: requiere el repositorio LLaVA-NeXT con la clase `LlavaLlamaForCausalLM`, no incluida en `transformers`. Esto complica el despliegue, el versionado y el soporte a largo plazo.
- Sin estado de optimizador publicado: solo se distribuyen pesos de inferencia, de modo que continuar el entrenamiento desde este checkpoint no reproduce exactamente el estado original.
- Cero descargas y cero interacciones en HuggingFace en el momento de la consulta, lo que implica ausencia de validación por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BAJUKA/LLaVA-llama32-3b-VLfull-s1337-s2a
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Vision tower: https://huggingface.co/google/siglip-so400m-patch14-384
- Repositorio LLaVA-NeXT: https://github.com/LLaVA-VL/LLaVA-NeXT
- Búsqueda web: no se encontraron enlaces relevantes al modelo. Los resultados devueltos corresponden a dominios de una agencia de marketing digital sin relación con el modelo, por lo que se descartan. No se dispone de paper, blog, demo ni repositorio adicionales.
