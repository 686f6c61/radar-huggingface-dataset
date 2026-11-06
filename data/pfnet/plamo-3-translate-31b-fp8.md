# pfnet/plamo-3-translate-31b-FP8

## Resumen

PLaMo 3 Translate 31B FP8 es la versión cuantizada a FP8 (pesos y activaciones) del modelo de traducción especializado PLaMo 3 Translate 31B, desarrollado por Preferred Networks (PFN). Se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, y posteriormente se afinó sobre decenas de miles de millones de tokens de datos orientados a traducción.

El modelo cubre traducción entre 53 idiomas, admite contexto circundante y glosarios como parte de la entrada, y permite elegir entre estilo llano y estilo cortés en la salida en japonés. La longitud máxima durante el entrenamiento fue de 32.768 tokens sumando entrada y salida, lo que permite traducir pasajes largos en una sola pasada siempre que el conjunto no exceda ese límite.

La relevancia de esta variante FP8 radica en que reduce el peso del repositorio a unos 32,3 GB para 31.757.456.384 parámetros, manteniendo el mismo comando de lanzamiento en vLLM que la versión BF16. Está publicada bajo la PLaMo Community License, con uso personal, académico y no comercial gratuito sin registro previo, y condiciones específicas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia PLaMo 3, derivada de PLaMo 3 NICT); detalles de capas y atención no disponibles |
| Parametros totales | 31.757.456.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (entrada + salida combinadas durante el entrenamiento) |
| Tipos de cuantizacion | FP8 (pesos y activaciones); la familia ofrece además BF16, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit en repositorios separados |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (license: other) |
| Formato de pesos | safetensors (FP8), con custom_code; compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo es un transformer de 31B parámetros construido a partir de PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT. Sobre esa base, PFN realizó un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traducción. La model card no detalla el número exacto de capas, la configuración de atención ni la composición completa del dataset, por lo que esos datos deben considerarse no disponibles.

La innovación principal no está en la arquitectura sino en el proceso de especialización: el modelo acepta contexto circundante y glosarios como parte de la entrada, lo que permite condicionar la traducción a terminología fija y a frases previas. Además, en la salida en japonés se puede seleccionar entre estilo llano y estilo cortés. La variante FP8 cuantiza pesos y activaciones, y según la model card mantiene el mismo comando de lanzamiento en vLLM que la versión BF16; las tablas de precisión comparativa entre formatos están referenciadas en la model card pero sus valores no se incluyen en la información disponible.

## Capacidades

- Traducción entre 53 idiomas, incluyendo pares con japonés, inglés, español, chino simplificado y tradicional, árabe, coreano, vietnamita, tailandés y lenguas europeas e indias.
- Traducción condicionada por contexto circundante: permite pasar texto previo o posterior para desambiguar.
- Traducción con glosario: admite terminología impuesta para mantener consistencia terminológica.
- Control de estilo en japonés: elección entre registro llano y registro cortés.
- Traducción de pasajes largos en una sola pasada dentro del límite de 32.768 tokens combinados de entrada y salida.
- Generación de texto multilingüe (pipeline declarado: translation).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Localización de documentación técnica: traducir manuales y guías entre inglés, japonés y español pasando un glosario con los términos del producto para que la terminología sea consistente en todo el documento; el límite de 32.768 tokens permite procesar secciones completas de una vez.
- Traducción de contratos y textos legales: usar el contexto circundante para resolver referencias anafóricas y el glosario para fijar términos jurídicos, con revisión humana posterior dado el riesgo de error en material sensible.
- Subtitulado y doblaje: traducir guiones con contexto de escenas adyacentes para mantener coherencia de nombres y registro, y elegir estilo cortés o llano en japonés según el personaje.
- Atención al cliente multilingüe: traducir conversaciones multi-turno entre el usuario y el equipo de soporte, aprovechando la ventana de contexto para conservar el hilo de la conversación.
- Comercio electrónico internacional: traducir fichas de producto y descripciones entre los 53 idiomas soportados, con glosarios por categoría para nombres de materiales y tallas.
- Investigación en traducción automática: usar el modelo como sistema de referencia en evaluaciones FLORES+, WMT24++ o PFTB, o como generador de traducciones para construir corpus paralelos.
- Publicación editorial y prensa: traducir artículos largos con contexto de párrafos anteriores para mantener el tono y la coherencia terminológica a lo largo del texto.

## Benchmarks y rendimiento

La model card incluye una figura comparativa de calidad de traducción frente a TranslateGemma y HY-MT2, con métricas COMET-22 (medias de PFTB, SaaS y WMT24++) para japonés–inglés y chrF++ de FLORES+ para japonés y inglés frente a otros 14 idiomas. Sin embargo, los valores numéricos de esa figura y de las tablas de precisión por formato de cuantización no están incluidos en la información disponible, por lo que no se reproducen aquí.

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- Peso del repositorio: 32,3 GB en FP8 para 31,76B parámetros, lo que implica aproximadamente 32 GB solo para pesos.
- VRAM estimada para inferencia: por encima de 32 GB únicamente para pesos; con caché KV para 32.768 tokens y overhead del runtime, se recomienda planificar 48 GB o más.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o GPUs con al menos 48 GB de memoria para FP8 nativo. Una RTX 4090 (24 GB) no puede alojar los pesos completos en FP8.
- Para GPUs de consumo (RTX 4090, 3090, 4080), usar las variantes W4A16, GGUF o MLX-4bit del mismo modelo, publicadas en repositorios separados.
- Despliegue: vLLM con el mismo comando de lanzamiento que la versión BF16; también compatible con transformers (custom_code). Para GGUF, llama.cpp u Ollama a través de la variante GGUF; para Apple Silicon, la variante MLX-4bit.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 31B FP8 | 31,76B | 32.768 tokens (entrada + salida) | 53 | PLaMo Community License | FP8, BF16, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| PLaMo 3 Translate 8B | 8B (aproximado) | no disponible en la información | 53 | PLaMo Community License | mismas variantes |
| PLaMo 3 Translate 2B | 2B (aproximado) | no disponible en la información | 53 | PLaMo Community License | mismas variantes |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card afirma que incluso el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas de la figura, pero los valores concretos no están disponibles en la información proporcionada. Los datos de TranslateGemma y HY-MT2 no se detallan.

## Limitaciones y advertencias

- El límite de 32.768 tokens es combinado de entrada y salida: los textos más largos deben dividirse, lo que puede romper la coherencia entre fragmentos.
- El rendimiento por par de idiomas no es uniforme; la evaluación FLORES+ se realizó sobre 15 de los 53 idiomas, por lo que la calidad en el resto de pares no está documentada.
- Riesgo de alucinación y de omisión en textos largos o con terminología muy especializada; se recomienda revisión humana en contextos legales, médicos o financieros.
- La cuantización FP8 puede introducir degradación de calidad frente a BF16; la model card referencia tablas comparativas por formato cuyos valores no se incluyen aquí.
- Licencia PLaMo Community License: uso personal, académico y no comercial gratuito sin registro; el uso comercial está sujeto a condiciones adicionales que deben consultarse en el enlace de la licencia antes de desplegar en producción.
- No se documentan capacidades de tool calling, agentes ni multimodalidad; no debe asumirse que el modelo las soporte.
- Requiere `custom_code` en transformers, lo que implica confiar en el código remoto del repositorio y verificar la versión de la librería.
- Sesgos lingüísticos y culturales no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-31b-FP8
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-31b
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- Variante 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante 2B: https://huggingface.co/pfnet/plamo-3-translate-2b
- Variante 8B: https://huggingface.co/pfnet/plamo-3-translate-8b
- Variante 31B W4A16: https://huggingface.co/pfnet/plamo-3-translate-31b-W4A16
- Variante 31B W4AFP8: https://huggingface.co/pfnet/plamo-3-translate-31b-W4AFP8
- Variante 31B NVFP4: https://huggingface.co/pfnet/plamo-3-translate-31b-NVFP4
- Variante 31B GGUF: https://huggingface.co/pfnet/plamo-3-translate-31b-GGUF
- Variante 31B MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-31b-MLX-4bit
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-31b-FP8/blob/main/README_ja.md
