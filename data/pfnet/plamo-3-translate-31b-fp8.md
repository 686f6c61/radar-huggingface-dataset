# pfnet/plamo-3-translate-31b-FP8

## Resumen

PLaMo 3 Translate 31B FP8 es la variante cuantizada en FP8 (pesos y activaciones) de PLaMo 3 Translate 31B, un modelo de lenguaje especializado en traducción desarrollado por Preferred Networks (PFN). El modelo base se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, que posteriormente se entrenó con decenas de miles de millones de tokens de datos centrados en traducción.

El modelo cubre traducción entre 53 idiomas, admite contexto circundante y glosarios como entradas auxiliares, y permite elegir entre estilo llano y estilo cortés en la salida en japonés. La longitud máxima durante el entrenamiento fue de 32.768 tokens para entrada y salida combinadas, lo que permite traducir pasajes largos en una sola pasada siempre que la suma de entrada y salida no exceda ese límite.

Esta variante FP8 reduce el peso del repositorio a 32,3 GB frente a los aproximadamente 63 GB que ocuparía la versión BF16 con 31.757.456.384 parámetros, manteniendo el mismo comando de lanzamiento en vLLM que la versión BF16. Es relevante para despliegues en producción donde el ahorro de VRAM y el aumento de throughput importan, sin renunciar a la calidad de traducción del modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia PLaMo 3), no se detalla configuracion de capas ni atencion en la informacion disponible |
| Parametros totales | 31.757.456.384 (31,76 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (limite de entrenamiento, entrada + salida combinadas) |
| Tipos de cuantizacion | FP8 (pesos y activaciones); el modelo base dispone de BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (licencia "other"; uso personal, educativo y no comercial gratuito sin registro previo) |
| Formato de pesos | safetensors, con codigo custom (`custom_code`), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

PLaMo 3 Translate 31B parte de PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT. Sobre esa base, PFN realizó un entrenamiento adicional con decenas de miles de millones de tokens de datos orientados específicamente a traducción. La información disponible no detalla la arquitectura interna (número de capas, tipo de atención, uso de MoE o configuraciones híbridas), por lo que esos datos deben considerarse no disponibles.

El modelo está diseñado para aceptar contexto adicional y glosarios junto con el texto a traducir, lo que permite desambiguar términos y mantener coherencia terminológica en dominios especializados. También admite la selección de estilo llano o cortés para la salida en japonés. La longitud máxima de entrenamiento fue de 32.768 tokens sumando entrada y salida. Esta variante FP8 cuantiza pesos y activaciones, y según la model card mantiene el mismo comando de lanzamiento en vLLM que la versión BF16; las tablas de precisión comparativa entre formatos de distribución se referencian en la model card, aunque sus valores no se reproducen en la información disponible.

## Capacidades

- Traducción entre 53 idiomas, incluyendo combinaciones con japonés, inglés, español, chino (simplificado y tradicional), árabe, coreano, hindi, tailandés, vietnamita y ruso, entre otros.
- Traducción bidireccional entre japonés y 14 idiomas evaluados, y entre inglés y esos mismos 14 idiomas, según la evaluación FLORES+.
- Uso de contexto circundante para mejorar la coherencia de la traducción en documentos largos.
- Soporte de glosarios para forzar terminología concreta en la salida.
- Selección de estilo de salida en japonés: llano o cortés.
- Traducción de pasajes largos en una sola pasada dentro del límite de 32.768 tokens de entrada más salida.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de documentación técnica multilingüe: el modelo puede procesar secciones completas de documentación dentro de la ventana de 32.768 tokens, usando glosarios para mantener consistencia terminológica entre capítulos y versiones.
- Localización de productos y software: con 53 idiomas soportados, permite generar versiones localizadas de cadenas de interfaz, textos de ayuda y materiales de marketing, eligiendo estilo cortés o llano en japonés según el registro del producto.
- Traducción jurídica y administrativa asistida: el soporte de glosarios y contexto circundante ayuda a fijar terminología especializada y a mantener coherencia en contratos y formularios, aunque requiere revisión humana por el riesgo de alucinación.
- Atención al cliente multilingüe: el modelo puede traducir conversaciones multi-turno entre agentes y clientes, aprovechando el contexto previo para resolver referencias y mantener el tono adecuado.
- Traducción de artículos y prensa: para medios que publican en varios idiomas, el modelo permite traducir piezas periodísticas completas en una pasada y ajustar el estilo de salida en japonés.
- Investigación académica multilingüe: traducción de resúmenes, artículos y material de revisión entre inglés, japonés y los otros idiomas soportados, con posibilidad de aportar contexto del dominio.
- Subtitulado y transcripción traducida: integrado en pipelines de procesado de audio, puede traducir segmentos de transcripción manteniendo coherencia entre fragmentos consecutivos gracias al contexto compartido.
- Despliegue en producción con vLLM: la variante FP8 reduce el consumo de VRAM frente a BF16 y mantiene el mismo comando de lanzamiento, lo que facilita servir traducción de alta calidad con menor coste de infraestructura.

## Benchmarks y rendimiento

La model card indica que PLaMo 3 Translate ofrece calidad de nivel mundial tanto en japonés-inglés como en traducción multilingüe, y que incluso el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas de la figura publicada. Las métricas empleadas son:

| Evaluación | Métrica |
|---|---|
| Japonés-inglés | Media de PFTB, SaaS y WMT24++ COMET-22 |
| Japonés y 14 idiomas | Media de FLORES+ chrF++ en ambas direcciones |
| Inglés y 14 idiomas | Media de FLORES+ chrF++ en ambas direcciones |

Los 15 idiomas seleccionados para FLORES+ son: japonés, inglés, árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino simplificado, chino tradicional, alemán, francés, vietnamita y ruso. Los valores numéricos concretos de los benchmarks no se incluyen en la información disponible; la model card remite a la figura `figures/benchmark_en.png` y al blog técnico para los detalles.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio FP8 ocupa 32,3 GB, por lo que se necesita al menos esa cantidad de VRAM para cargar los pesos, más memoria para KV cache y activaciones. En la práctica, se recomienda disponer de 40-48 GB para contextos moderados y de 80 GB para aprovechar los 32.768 tokens de contexto.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 y GPUs con soporte FP8 nativo (arquitecturas Hopper o superior). Las GPUs Ada Lovelace con 48 GB (RTX 6000 Ada) pueden ser suficientes para contextos reducidos.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB (RTX 4090, RTX 3090) en FP8 sin offloading; para esos entornos conviene usar las variantes W4A16, W4AFP8, NVFP4, GGUF o MLX-4bit del mismo modelo.
- Opciones de despliegue: vLLM es el backend documentado explícitamente, con el mismo comando de lanzamiento que la versión BF16. La librería es transformers con código custom. No se documentan en la información disponible instrucciones específicas para llama.cpp, Ollama o TGI para esta variante FP8 (las variantes GGUF cubren el ecosistema llama.cpp).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 31B FP8 | 31,76 B | 32.768 tokens | 53 | PLaMo Community License | safetensors FP8, con variantes BF16, W4A16, W4AFP8, NVFP4, GGUF y MLX |
| PLaMo 3 Translate 8B | no disponible | 32.768 tokens (según modelo base de la familia) | 53 | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| PLaMo 3 Translate 2B | no disponible | 32.768 tokens (según modelo base de la familia) | 53 | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card menciona TranslateGemma y HY-MT2 como modelos especializados en traducción frente a los que se compara PLaMo 3 Translate, pero no se proporcionan sus especificaciones ni sus resultados numéricos en la información disponible. Tampoco se detallan los parámetros de las variantes 8B y 2B de la propia familia.

## Limitaciones y advertencias

- Riesgo de alucinación: como todo LLM, puede generar traducciones plausibles pero incorrectas, especialmente en terminología muy especializada o en segmentos ambiguos; se recomienda revisión humana en dominios críticos.
- Límite de longitud: la ventana de 32.768 tokens cubre entrada y salida combinadas; los documentos más largos deben dividirse en fragmentos, lo que puede afectar a la coherencia entre segmentos.
- Idiomas: aunque se declaran 53 idiomas, la evaluación publicada se centra en 15 idiomas (japonés, inglés y 14 adicionales); el rendimiento en el resto puede ser inferior y no está cuantificado en la información disponible.
- Licencia: la PLaMo Community License permite uso personal, educativo y no comercial gratuito sin registro previo, pero el uso comercial está sujeto a condiciones adicionales que deben consultarse en el enlace de la licencia antes de desplegar el modelo en producción.
- Cuantización FP8: la model card referencia tablas de precisión comparativa entre formatos de distribución, pero los valores no se reproducen en la información disponible; conviene validar la calidad en el dominio propio antes de sustituir la versión BF16.
- Arquitectura: al requerir código custom (`custom_code`), la integración depende de que el entorno de transformers y vLLM soporten la implementación de PLaMo 3; versiones antiguas pueden no cargar el modelo.
- Sesgos: no se documentan en la información disponible análisis específicos de sesgos por idioma, género o dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-31b-FP8
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-31b
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-31b-FP8/blob/main/README_ja.md
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community License (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- Variante 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante 2B: https://huggingface.co/pfnet/plamo-3-translate-2b
- Variante 8B: https://huggingface.co/pfnet/plamo-3-translate-8b
- Variante 31B GGUF: https://huggingface.co/pfnet/plamo-3-translate-31b-GGUF
- Variante 31B MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-31b-MLX-4bit
- Variante 31B W4A16: https://huggingface.co/pfnet/plamo-3-translate-31b-W4A16
- Variante 31B W4AFP8: https://huggingface.co/pfnet/plamo-3-translate-31b-W4AFP8
- Variante 31B NVFP4: https://huggingface.co/pfnet/plamo-3-translate-31b-NVFP4
