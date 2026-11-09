# fadhilahkhairogi/Liwet-66M-id-base-v1

## Resumen

Liwet-66M-id-base-v1 es un modelo de lenguaje decoder-only de tipo transformer, entrenado desde cero para el idioma indonesio por el Grupo 11 de la asignatura de Generative AI de la Universidad de Telkom. Forma parte de la familia Liwet (Lightweight Transformer) y se presenta como un checkpoint base tras una única época de preentrenamiento, sin ajuste fino posterior ni alineación por preferencias. Su nombre comercial indica 66,7 millones de parámetros, si bien el fichero `model.safetensors` almacena 83.112.448 elementos porque el `lm_head.weight` está destado (untied) respecto al embedding de entrada.

Arquitectónicamente es un transformer convencional con Pre-RMSNorm, codificación posicional rotatoria (RoPE) y activación SwiGLU: 12 capas, 8 cabezas de atención, dimensión oculta de 512 y dimensión intermedia SwiGLU de 2.048. La longitud de contexto es de 1.024 tokens y el vocabulario es un BPE a nivel de byte de 32.000 entradas con los tokens especiales `<|unk|>`, `<|pad|>` y `<|endoftext|>`. Los pesos se distribuyen en `bfloat16` dentro de un único fichero SafeTensors de aproximadamente 0,2 GB.

Su relevancia es acotada y de carácter educativo: no es un modelo orientado a producción ni compite con los modelos indonesios de referencia (Sahabat-AI, Merak, Komodo o los multilingües tipo Qwen o Llama). Resulta útil como artefacto reproducible de un pipeline de preentrenamiento completo (tokenizador, dataset, bucle de entrenamiento y evaluación) y como caso de estudio de un modelo pequeño de dominio único. El repositorio no expone pesos en formato `transformers` estándar, sino una definición de modelo propia que debe cargarse manualmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniTransformer decoder-only, Pre-RMSNorm, RoPE, SwiGLU |
| Parametros totales | ~66,7 M (tied); 83.112.448 elementos almacenados en `model.safetensors` con `lm_head.weight` destado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en `bfloat16`) |
| Idiomas soportados | indonesio (`id`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`bfloat16`), `config.json`, `tokenizer.json` |
| Capas / cabezas / dimension | 12 capas, 8 cabezas de atencion, 512 de dimension oculta, 2.048 de dimension SwiGLU |
| Vocabulario | 32.000, Byte-Level BPE (`<|unk|>`, `<|pad|>`, `<|endoftext|>`) |
| Etapa de entrenamiento | preentrenamiento, 1 epoca (step 13.049) |
| Tamano del repositorio | ~0,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas con normalizacion RMS previa a cada subcapa, atencion multi-cabeza con RoPE y FFN con activacion SwiGLU, una combinacion que reproduce el diseño de los LLM modernos a escala reducida. La dimension oculta es de 512 y la intermedia de 2.048, con 8 cabezas de atencion, lo que da una dimension por cabeza de 64. El vocabulario de 32.000 tokens mediante BPE a nivel de byte permite cubrir texto indonesio sin tokens desconocidos frecuentes. El checkpoint se distribuye con pesos personalizados en PyTorch (`bfloat16`), no como `AutoModelForCausalLM` estándar de `transformers`.

El preentrenamiento consistió en una única época sobre aproximadamente 427.589.632 tokens (unos 428 millones), extraídos de tres fuentes: Wikipedia en indonesio (`wikimedia/wikipedia`, `20231101.id`), C4 en indonesio (`allenai/c4`, `id`) y FineWeb-2 en indonesio latino (`HuggingFaceFW/fineweb-2`, `ind_Latn`). No se documenta el uso de RLHF, DPO, SFT ni ninguna técnica de alineación; el resultado es un modelo base de autocompletado. La evaluación reportada es una pérdida de validación de 3,2179, equivalente a una perplejidad de 24,98 en el step 13.049. No se detalla la composición exacta del split de validación, la mezcla de pesos entre datasets ni la configuración del optimizador.

## Capacidades

- Generación de texto por autocompletado en indonesio: el modelo continúa un texto crudo sin plantilla de chat.
- Modelado de lenguaje base: útil para medir perplejidad y como punto de partida para ajuste fino supervisado.
- Tokenización BPE a nivel de byte con cobertura de texto indonesio y capacidad de representar texto arbitrario sin fallos de codificación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al indonesio; no se declara entrenamiento en otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Generación con contexto de 1.024 tokens, adecuada para fragmentos cortos y no para documentos largos.

## Casos de uso

- Estudio y reproducción de un pipeline de preentrenamiento: sirve como referencia completa (tokenizador, dataset, bucle de entrenamiento y evaluación) para cursos y proyectos de investigación que quieran entrenar un LLM desde cero a pequeña escala.
- Generación de texto indonesio de dominio general: continuación de párrafos, titulares o descripciones breves en aplicaciones de demostración donde la calidad no sea crítica.
- Ajuste fino supervisado como base: al ser un checkpoint base sin alineación, es un punto de partida razonable para tareas concretas (clasificación de texto, extracción de entidades, resumen corto) con datasets etiquetados en indonesio.
- Evaluación de técnicas de tokenización: permite comparar el impacto de un vocabulario BPE de 32.000 entradas en la perplejidad sobre corpus indonesios frente a tokenizadores multilingües.
- Experimentos de eficiencia en hardware modesto: con 66,7 M de parámetros y pesos en `bfloat16`, cabe en cualquier GPU consumer y permite probar técnicas de cuantización, destilación o decodificación especulativa sin infraestructura dedicada.
- Generación de datos sintéticos para aumento de corpus: puede producir borradores de texto en indonesio para filtrar y revisar posteriormente en tareas de anotación.
- Docencia sobre limitaciones de los modelos base: ejemplifica de forma directa por qué un modelo sin alineación no debe desplegarse en atención al cliente ni en flujos con usuarios finales.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de validación del checkpoint de preentrenamiento:

| Metrica | Valor |
|---|---|
| Val loss (step 13.049, 1 epoca) | 3,2179 |
| Val perplexity | 24,98 |
| Tokens vistos en entrenamiento | ~427.589.632 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, IndoMMLU u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,2 GB con pesos en `bfloat16`; menos de 0,1 GB si se cuantiza a 8 bits, aunque no se ofrecen pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier RTX (incluidas series 20, 30 y 40), GTX con suficiente VRAM, así como en CPU y en dispositivos de borde.
- Opciones de despliegue: al no ser un checkpoint `transformers` estándar, no funciona directamente con vLLM, TGI u Ollama; requiere cargar `model.safetensors` en la definición de `MiniTransformer` del repositorio y usar `tokenizers` para el tokenizador. Es viable exportarlo a GGUF de forma manual para llama.cpp, pero no se proporciona ninguna conversión oficial.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera latencia de milisegundos por token en GPU consumer y decenas de milisegundos en CPU, sin datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Liwet-66M-id-base-v1 | ~66,7 M | 1.024 | indonesio | no disponible | safetensors (`bfloat16`), definicion propia |
| GPT-2 small | 124 M | 1.024 | ingles | MIT | safetensors, `transformers` |
| SmolLM-135M | 135 M | 2.048 | ingles (multilingue parcial) | Apache 2.0 | safetensors, GGUF, `transformers` |
| Qwen2.5-0.5B | 494 M | 32.768 | multilingue (incluye indonesio) | Apache 2.0 | safetensors, GGUF, `transformers` |

La comparación es orientativa: Liwet es un modelo de dominio único, sin alineación y sin integración con el ecosistema `transformers`, mientras que las alternativas citadas cuentan con licencia explícita, formatos cuantizados y soporte en herramientas de despliegue estándar. No se dispone de métricas comparables de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin alineación: no ha pasado por SFT, RLHF ni DPO, por lo que puede generar contenido incoherente, repetitivo o inapropiado.
- Riesgo elevado de alucinación: con 66,7 M de parámetros y solo 428 millones de tokens vistos, la cobertura factual es muy limitada.
- Contexto muy corto (1.024 tokens): no apto para documentos largos, conversaciones multi-turno extensas ni RAG con muchos fragmentos.
- Sesgos: los corpus de Wikipedia, C4 y FineWeb-2 en indonesio pueden contener sesgos de representación, geográficos y de género que el modelo reproduce sin filtro.
- Licencia no disponible: no se declara licencia, lo que impide asumir permisos de uso comercial; es imprescindible contactar con los autores antes de cualquier despliegue productivo.
- Compatibilidad limitada: no es un checkpoint `AutoModelForCausalLM` de `transformers`, lo que complica su integración en pipelines estándar y en herramientas de serving.
- Idioma único: no se ha entrenado en otros idiomas; su uso fuera del indonesio producirá resultados degradados.
- Sin garantías de mantenimiento: repositorio con 0 descargas y 0 likes, creado como trabajo de curso; no hay hoja de ruta ni soporte.
- Perplejidad de validación de 24,98: aceptable para un modelo de este tamaño, pero muy lejos de los modelos indonesios de referencia en calidad de generación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fadhilahkhairogi/Liwet-66M-id-base-v1
- Dataset Wikipedia indonesio: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset C4 indonesio: https://huggingface.co/datasets/allenai/c4
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Repositorio de `tokenizers` (Hugging Face): https://github.com/huggingface/tokenizers
- Repositorio de `safetensors`: https://github.com/huggingface/safetensors
