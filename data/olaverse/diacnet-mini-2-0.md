# olaverse/diacnet-mini-2.0

## Resumen

diacnet-mini-2.0 es un modelo de restauración de diacríticos, marcas de tono y vocales árabes (tashkeel) desarrollado por olaverse. Se trata de un encoder-decoder de nivel de byte (ByT5) afinado a partir de google/byt5-small, con 299.637.760 parámetros y un peso en safetensors fp32 de aproximadamente 1,2 GB. Su función es tomar texto sin acentos ni marcas y devolver el mismo texto con los diacríticos restaurados, cubriendo 11 idiomas desde un único modelo de 300M.

El modelo resulta relevante porque unifica en una sola red tareas que normalmente requieren modelos separados por familia lingüística: tonos yoruba, igbo y hausa, diacríticos latinos en vietnamita, polaco, turco, portugués, español, francés e italiano, y diacritización completa del árabe con un modo sin terminaciones de caso. Incorpora un helper de alineación que garantiza que el texto de entrada nunca se modifica (solo se añaden marcas), lo que lo hace apto para producción sobre corpus existentes.

Frente a su predecesor diacnet-1.1, reduce la tasa de error en yoruba de 0,174 a 0,081 (2,1× menor) y eleva las frases exactamente correctas del 0,8 % al 9 %. Según el autor, supera a diactag-2.0 en cinco de diez idiomas con alineación de salida. La licencia es Apache 2.0 y el modelo se distribuye en formato transformers/safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByT5-small (encoder-decoder byte-level), 12 capas encoder + 4 capas decoder, d_model 1472, 6 cabezas |
| Parametros totales | 299.637.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana formal; la model card indica entradas de hasta ~300 caracteres por llamada (el helper divide textos largos) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32 safetensors; la model card sugiere bf16 en GPU) |
| Idiomas soportados | yo, ig, ha, vi, pl, tr, pt, es, fr, it, ar (etiquetas `<yor>`, `<ibo>`, `<hau>`, `<vie>`, `<pol>`, `<tur>`, `<por>`, `<spa>`, `<fra>`, `<ita>`, `<ara>`, `<ara-nocase>`, `<auto>`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); repo de 2,4 GB |

## Arquitectura y entrenamiento

diacnet-mini-2.0 es un encoder-decoder transformer de nivel de byte basado en ByT5-small: 12 capas de encoder y 4 de decoder, dimensión de modelo 1472 y 6 cabezas de atención. Al operar sobre bytes en lugar de tokens subword, evita problemas de tokenización con caracteres diacríticos y alfabetos no latinos (árabe, yoruba con ẹ/ọ/ṣ, hausa con ɓ/ɗ/ƙ/ƴ). El modelo se invoca con una etiqueta de idioma al inicio de la entrada (`<tag> [g: word=meaning] texto`) y devuelve el texto con las marcas restauradas.

El ajuste se realizó sobre los datasets olaverse/diacnet-1.1-train y olaverse/diacbench, según los tags del repositorio. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron fases de RLHF o DPO. Entre las innovaciones destacadas por el autor están: el helper de alineación por difflib que conserva cada letra de entrada y toma solo las marcas de la salida (cumplimiento del 100 % por construcción), el modo `<auto>` de detección de idioma (error a 0,0012 del tag explícito), las pistas de significado `[g: word=meaning]` para palabras ambiguas (precisión en vietnamita de 0,53 a 0,78) y la preservación de marcas ya presentes en la entrada (99,9–100 %).

## Capacidades

- Restauración de diacríticos y acentos en texto latino sin marcas para español, francés, italiano, portugués, polaco y turco.
- Restauración de tonos y diacríticos en yoruba, igbo y hausa, incluyendo caracteres especiales (ẹ, ọ, ṣ, ɓ, ɗ, ƙ, ƴ).
- Diacritización completa del árabe (tashkeel) con el tag `<ara>` y modo sin terminaciones de caso con `<ara-nocase>`.
- Detección automática de idioma mediante el tag `<auto>`, con degradación mínima respecto al tag explícito.
- Pistas de desambiguación por significado con la sintaxis `[g: word=meaning]`.
- Preservación de marcas ya presentes en el texto de entrada y relleno de las ausentes.
- Alineación de salida que garantiza que el texto original no se altera (solo se añaden marcas).
- Corrección de erratas en la salida cruda (sin alineación), según indica la model card.
- Procesamiento por fragmentos de hasta ~300 caracteres mediante helper de chunking.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Normalización de corpus lingüísticos: restaurar diacríticos en textos yoruba, igbo o hausa recopilados sin marcas para entrenar modelos de traducción o ASR con ortografía correcta, aprovechando la cobertura de caracteres especiales del modelo.
- Preprocesado para TTS en vietnamita: añadir tonos a transcripciones sin marcas antes de la síntesis de voz, usando las pistas `[g: word=meaning]` para resolver palabras ambiguas (precisión reportada de 0,78 frente a 0,53 sin pistas).
- Diacritización de texto árabe para pipelines de NLP: aplicar `<ara>` o `<ara-nocase` para alimentar modelos de morfología o búsqueda que requieren tashkeel, con DER de 0,110 y 0,082 respectivamente según el autor.
- Publicación editorial multilingüe: restaurar acentos en borradores escritos sin diacríticos en español, francés, italiano, portugués o polaco, con el helper de alineación garantizando que no se altera ninguna letra del original.
- Limpieza de datos de usuario: procesar formularios o mensajes de chat escritos sin acentos en once idiomas, detectando el idioma con `<auto>` y fragmentando entradas largas con el helper de chunking de 300 caracteres.
- Enriquecimiento de datasets para fine-tuning: aplicar el modelo sobre grandes volúmenes de texto plano para generar versiones diacritizadas que sirvan como datos supervisados en tareas de normalización ortográfica.
- Integración vía API sin GPU: usar el endpoint `POST /v1/diacritize` de Olaverse (modelo `diacnet-mini-2.0`) para aplicaciones que no dispongan de infraestructura de inferencia propia.

## Benchmarks y rendimiento

| Metrica | diacnet-mini-2.0 | Referencia |
|---|---|---|
| Tasa de error yoruba (DER) | 0,081 | 0,174 en diacnet-1.1 (2,1× menor) |
| Frases yoruba exactamente correctas | 9 % | 0,8 % en diacnet-1.1 |
| DER árabe clásico (`<ara>`) | 0,110 | no disponible |
| DER árabe sin terminaciones de caso (`<ara-nocase>`) | 0,082 | no disponible |
| Precisión vietnamita con pistas de significado | 0,78 | 0,53 sin pistas |
| Desviación de `<auto>` frente a tag explícito | 0,0012 | no aplica |
| Preservación de marcas ya presentes | 99,9–100 % | no aplica |
| Comparación con diactag-2.0 | Mejor en polaco, portugués, español, francés e italiano; idéntico en hausa | diactag-2.0 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB con pesos fp32; en bf16 el peso ronda los 0,6 GB, más overhead de activaciones y caché. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2–4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090); en A100 o H100 se puede ejecutar con batches grandes para maximizar throughput.
- Cabe en GPU consumer: sí, en todas las GPU modernas de NVIDIA, AMD o Apple Silicon con suficiente memoria unificada.
- Opciones de despliegue: transformers con `AutoModelForSeq2SeqLM`, text-generation-inference (según el tag `text-generation-inference`), endpoints compatibles de Hugging Face; la model card no menciona soporte explícito de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles de forma numérica; la model card recomienda agrupar entradas de longitud similar con `padding="longest"` y ejecutar en GPU en bf16 para mejorar el rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| diacnet-mini-2.0 | 300M | ~300 caracteres por llamada | 11 | apache-2.0 | ByT5-small, alineación de salida, modo árabe sin caso |
| diacnet-1.1 | no disponible | no disponible | no disponible | no disponible | Predecesor; DER yoruba 0,174 frente a 0,081 |
| diactag-2.0 | no disponible | no disponible | no disponible | no disponible | Superado en 5 de 10 idiomas con alineación; idéntico en hausa |
| google/byt5-small | ~300M | no disponible | multilingüe byte-level | apache-2.0 | Modelo base sin ajuste para diacríticos |

## Limitaciones y advertencias

- Entrada limitada a ~300 caracteres por llamada; es necesario fragmentar textos largos con el helper de chunking, lo que puede introducir discontinuidades en los límites de fragmento.
- La salida cruda puede corregir erratas del texto original; si se necesita inmutabilidad estricta del texto, debe usarse el helper de alineación.
- La precisión en vietnamita sin pistas de significado es de 0,53, lo que implica un riesgo alto de errores en palabras ambiguas si no se aportan hints `[g: word=meaning]`.
- Solo 9 % de frases yoruba exactamente correctas: aunque la tasa de error por carácter es baja, la corrección a nivel de frase completa sigue siendo limitada.
- Riesgo de alucinación no cuantificado en la información disponible; al ser un modelo encoder-decoder de restauración, el riesgo principal es la inserción de marcas incorrectas más que la generación de contenido nuevo.
- Sesgos lingüísticos: el rendimiento se ha medido por idioma, pero no se documentan sesgos por variedad dialectal (por ejemplo, árabe dialectal frente a clásico) ni por dominio.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la exactitud de las marcas restauradas.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; no debe emplearse como modelo generativo general.
- El tag de pipeline en Hugging Face es `text-generation`, aunque la arquitectura real es text2text-generation; conviene verificar la integración en herramientas que dependan del pipeline tag.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/olaverse/diacnet-mini-2.0
- Modelo base: https://huggingface.co/google/byt5-small
- Predecesor diacnet-1.1: https://huggingface.co/olaverse/diacnet-1.1
- Modelo comparable diactag-2.0: https://huggingface.co/olaverse/diactag-2.0
- Dataset de entrenamiento: https://huggingface.co/datasets/olaverse/diacnet-1.1-train
- Dataset de evaluación: https://huggingface.co/datasets/olaverse/diacbench
- Consola de desarrollador de Olaverse: https://console.olaverselab.com
- Documentación de la API de diacríticos: https://docs.olaverselab.com/api/diacritics/
