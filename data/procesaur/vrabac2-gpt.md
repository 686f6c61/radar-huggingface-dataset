# procesaur/Vrabac2-GPT

## Resumen

Vrabac2-GPT es un modelo de lenguaje generativo de tipo base (preentrenado, sin ajuste fino instructivo) desarrollado por Mihailo Škorić (usuario `procesaur`) en el marco del proyecto TESLA de la Universidad de Belgrado, con financiación del Fondo para la Ciencia de Serbia y recursos de la Plataforma Nacional de IA (ai.gov.rs). Con 852.985.920 parámetros reales según los pesos en safetensors (el autor lo describe como "900 millones"), está especializado en serbio y construido sobre la arquitectura Qwen3.5.

Su rasgo diferencial es el tokenizador SRNA, que amplía el vocabulario con 50.000 tokens nuevos para serbio y soporta transliteración automática entre cirílico y latín, de modo que ambas escrituras comparten un mismo espacio vectorial. El autor afirma que esto acelera el entrenamiento y la inferencia en torno a un 30 % y mejora el alineamiento del modelo con el idioma. El modelo se entrenó sobre un corpus mixto serbio-inglés y, pese a su tamaño reducido, el autor sostiene que mejora la lectura y escritura de serbio respecto a Qwen3.5-0.8.

Es relevante porque cubre un hueco poco atendido: modelos generativos pequeños y abiertos (licencia Apache 2.0) con cobertura real de serbio en ambas escrituras, desplegables en hardware modesto. No obstante, el modelo es muy reciente (creado el 24 de noviembre de 2026) y tiene un uso testimonial: 2 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3.5 |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | serbio (sr); entrenado con corpus mixto serbio-inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3.5, un transformer decoder-only causal. El autor no detalla el número de capas, dimensiones ocultas ni mecanismos de atención concretos. La innovación principal está en la capa de tokenización: el tokenizador SRNA añade 50.000 tokens al vocabulario original y soporta transliteración automática cirílico-latín, lo que permite tratar ambas escrituras del serbio en un mismo espacio vectorial y, según el autor, acelera el entrenamiento y la inferencia alrededor de un 30 %.

El preentrenamiento se realizó sobre un corpus mixto serbio-inglés que combina datasets propios (`procesaur/znanje`, `procesaur/Wiki.korpus`, `procesaur/kisobran`), corpus serbios de referencia (`jerteh/SrpELTeC`), Wikipedia (`AMead10/lvl_5_vital_wikipedia_articles`), datos web multilingües (`HuggingFaceFW/fineweb`) y datasets de texto educativo y de programación (`vikp/textbook_quality_programming`, `nampdn-ai/tiny-lessons`). No se especifica el número de tokens de entrenamiento, la composición porcentual del dataset ni si hubo fases de RLHF o DPO; al ser un modelo base, lo esperable es que no las haya habido, pero no está confirmado en la información disponible.

## Capacidades

- Generación de texto y continuación de texto a partir de un prefijo (modelo base, no instruido).
- Conversación básica mediante plantilla de chat (`apply_chat_template`), con soporte de un parámetro `enable_thinking` que sugiere un modo de razonamiento opcional heredado de Qwen3.5.
- Manejo de serbio en cirílico y en latín, con transliteración automática entre ambas escrituras vía tokenizador SRNA.
- Comprensión y generación en inglés, al haberse entrenado con corpus mixto serbio-inglés.
- Conocimiento factual sobre cultura y calendario serbio (el ejemplo de la model card responde sobre la fecha de Nikoljdan), aunque con errores factuales visibles en la propia respuesta de ejemplo.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni otras capacidades multimodales, pese a que la etiqueta `image-text-to-text` aparece en los tags del repo.

## Casos de uso

- Generación y continuación de texto en serbio: redacción de borradores, artículos o párrafos a partir de un inicio, aprovechando el vocabulario ampliado para serbio y el manejo nativo de cirílico y latín.
- Normalización de escritura serbia: conversión de textos entre cirílico y latín dentro de un mismo pipeline gracias a la transliteración integrada en el tokenizador SRNA.
- Experimentación académica en PLN de lenguas eslavas del sur: base para ajuste fino supervisado o continued pretraining en tareas downstream serbias con un modelo de menos de 1.000 millones de parámetros.
- Prototipado en hardware de consumo: al ocupar aproximadamente 1,7 GB en precisión original, permite iterar en local (GPU de 8 GB o incluso CPU) antes de escalar a modelos mayores.
- Filtrado y etiquetado de corpus serbios: uso como modelo generador para aumentar o parafrasear datos de entrenamiento en serbio en proyectos de construcción de datasets.
- Educación y divulgación: demostraciones de generación de texto en serbio en entornos con recursos limitados, dado su tamaño reducido y su licencia permisiva.
- Base para investigación sobre tokenizadores multiescritura: comparación del impacto del vocabulario SRNA frente a tokenizadores estándar de Qwen en métricas de eficiencia y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente afirma de forma cualitativa que el modelo "proporciona mejoras significativas en lectura y escritura del serbio respecto a Qwen3.5-0.8", sin cifras que respalden la afirmación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en bfloat16/fp16 (tamaño del repo en safetensors); en cuantización de 8 bits bajaría a unos 0,9 GB y en 4 bits a unos 0,5 GB, aunque no se distribuyen pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, con holgura creciente.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria unificada suficiente; también es viable en CPU para inferencia no interactiva.
- Opciones de despliegue: `transformers` con `device_map="auto"` (método documentado por el autor); al no haber pesos GGUF publicados, llama.cpp u Ollama requerirían conversión previa. vLLM y TGI son compatibles en principio con la arquitectura Qwen3.5, pero no están verificados en la información disponible.
- Latencia y throughput: no disponibles. El autor afirma una mejora de aproximadamente el 30 % en velocidad de entrenamiento e inferencia atribuida al tokenizador ampliado, sin cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Vrabac2-GPT | 853 M | no disponible | sr, en | Apache 2.0 | Tokenizador SRNA con transliteración cirílico-latín |
| Qwen3.5-0.8 | ~800 M | no disponible | multilingüe | según Qwen (no confirmada aquí) | Modelo base del que deriva la arquitectura; referencia directa del autor |
| Qwen3-0.6B | 596 M | 32.768 tokens (según documentación pública de Qwen3) | multilingüe | Apache 2.0 | Alternativa pequeña multilingüe, sin especialización en serbio |
| Gemma 3 1B | ~1.000 M | 32.768 tokens (según documentación pública de Gemma 3) | multilingüe | Gemma Terms of Use | Mayor cobertura multilingüe, licencia menos permisiva |

La comparación con Qwen3.5-0.8 y con las alternativas de la familia Qwen3/Gemma es orientativa: no hay benchmarks publicados de Vrabac2-GPT que permitan contrastar rendimiento real.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones: no cabe esperar un seguimiento fiable de instrucciones complejas ni un formato conversacional robusto sin ajuste fino adicional.
- Riesgo alto de alucinación: el propio ejemplo de la model card contiene errores factuales evidentes (fecha de Nikoljdan incorrecta y texto repetitivo y contradictorio), lo que evidencia un conocimiento factual débil.
- Cobertura de idiomas limitada a serbio e inglés; el rendimiento en castellano u otras lenguas no está documentado y previsiblemente será pobre.
- Longitud de contexto no documentada, lo que impide planificar su uso en tareas de contexto largo.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Madurez muy baja: 2 descargas y 0 likes, creado en noviembre de 2026, sin historial de uso en producción ni validación por la comunidad.
- Posible inconsistencia de metadatos: el repo incluye la etiqueta `image-text-to-text` pese a que la model card y el pipeline declarado son de generación de texto; conviene verificar antes de asumir capacidades multimodales.
- Licencia Apache 2.0: permisiva para uso comercial, pero al ser un modelo base conviene evaluar sesgos y calidad antes de integrarlo en productos.
- Sesgos no evaluados: no se documenta ninguna evaluación de sesgos, toxicidad ni seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/procesaur/Vrabac2-GPT
- Tokenizador SRNA: https://huggingface.co/procesaur/Srna_tokenizer
- Perfil del autor: https://huggingface.co/procesaur
- Plataforma Nacional de IA de Serbia: https://ai.gov.rs
- Proyecto TESLA (Universidad de Belgrado): https://tesla.rgf.bg.ac.rs
- Fondo para la Ciencia de Serbia: https://fondzanauku.gov.rs/
- Dataset `procesaur/znanje`: https://huggingface.co/datasets/procesaur/znanje
- Dataset `procesaur/Wiki.korpus`: https://huggingface.co/datasets/procesaur/Wiki.korpus
- Dataset `procesaur/kisobran`: https://huggingface.co/datasets/procesaur/kisobran
- Dataset `jerteh/SrpELTeC`: https://huggingface.co/datasets/jerteh/SrpELTeC
- Dataset `HuggingFaceFW/fineweb`: https://huggingface.co/datasets/HuggingFaceFW/fineweb
