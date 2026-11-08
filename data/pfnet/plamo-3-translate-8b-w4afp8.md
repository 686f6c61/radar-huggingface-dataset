# pfnet/plamo-3-translate-8b-W4AFP8

## Resumen

PLaMo 3 Translate 8B W4AFP8 es la variante cuantizada del modelo de traducción PLaMo 3 Translate 8B, desarrollado por Preferred Networks (PFN) a partir del modelo preentrenado PLaMo 3 NICT, fruto de una investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón. El modelo base se entrenó adicionalmente con decenas de miles de millones de tokens de datos centrados en traducción, lo que lo convierte en un LLM especializado en traducción más que en un modelo generalista.

Esta versión concreta aplica cuantización W4AFP8: pesos en INT4 y activaciones en FP8, mediante la librería compressed-tensors, con un tamaño de repositorio de 5,7 GB frente a los aproximadamente 17 GB que ocuparía el modelo en BF16. El modelo cuenta con 8.531.750.912 parámetros totales y soporta traducción entre 53 idiomas, además de permitir el uso de contexto circundante y glosarios, y elegir entre estilo llano y cortés en las salidas en japonés.

Su relevancia actual radica en que ofrece calidad de traducción de primer nivel con un coste de inferencia reducido, lo que facilita el despliegue en infraestructura más modesta. La longitud máxima durante el entrenamiento fue de 32.768 tokens combinando entrada y salida, lo que permite traducir pasajes largos de una sola vez.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles específicos no disponibles; requiere `custom_code` y tag `plamo3`) |
| Parámetros totales | 8.531.750.912 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (entrada + salida combinadas, máximo durante entrenamiento) |
| Tipos de cuantización | W4AFP8 (pesos INT4, activaciones FP8); el modelo base dispone de BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (licencia "other") |
| Formato de pesos | safetensors con compressed-tensors (INT4/FP8) |

## Arquitectura y entrenamiento

El modelo se basa en PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT, que fue posteriormente afinado con decenas de miles de millones de tokens de datos orientados a traducción. La información disponible no detalla la arquitectura interna más allá de la etiqueta `plamo3` y la necesidad de código personalizado (`custom_code`) para cargarlo con transformers. No se especifican número de capas, dimensiones ocultas, mecanismo de atención ni si se emplearon técnicas como RLHF o DPO en el ajuste.

La innovación principal de esta distribución es la cuantización W4AFP8: pesos en INT4 y activaciones en FP8, implementada con compressed-tensors y compatible con vLLM usando el mismo comando de lanzamiento que la versión BF16. El modelo está diseñado para aprovechar contexto circundante y glosarios en la traducción, y permite controlar el registro (llano o cortés) de la salida en japonés. La longitud máxima de entrenamiento fue de 32.768 tokens para entrada y salida combinadas.

## Capacidades

- Traducción entre 53 idiomas, incluyendo pares con japonés, inglés, español, chino, coreano, árabe, hindi y vietnamita, entre otros.
- Uso de contexto circundante para mejorar la coherencia de la traducción en documentos largos.
- Soporte de glosarios para forzar terminología concreta.
- Control del estilo de salida en japonés: llano o cortés.
- Traducción de pasajes largos en una sola pasada dentro del límite de 32.768 tokens combinados.
- Generación de texto multilingüe (el pipeline declarado es `translation`; no se documentan otras capacidades como tool calling, agentes o visión).
- No se documentan capacidades de razonamiento multi-paso, function calling, visión ni audio.

## Casos de uso

- Traducción de documentación técnica: el modelo puede procesar pasajes largos de hasta 32.768 tokens combinados de entrada y salida, adecuado para manuales y guías que requieren coherencia terminológica mediante glosarios.
- Localización de productos multilingüe: con 53 idiomas soportados, permite generar versiones en varios mercados desde un único modelo, reduciendo la infraestructura necesaria frente a soluciones por par de idiomas.
- Traducción jurídica o administrativa con glosario: el soporte de glosarios permite fijar terminología especializada y mantener consistencia en contratos y normativas.
- Atención al cliente en varios idiomas: la cuantización W4AFP8 reduce el coste por token, lo que hace viable desplegar traducción en tiempo real en flujos de soporte con volúmenes altos.
- Subtitulado y traducción de contenido audiovisual: el contexto circundante ayuda a resolver referencias entre segmentos, y el estilo cortés en japonés es útil para doblaje y subtítulos formales.
- Traducción de correspondencia y comunicaciones internas: el control de estilo llano o cortés en japonés facilita adaptar el tono según el destinatario.
- Investigación en traducción automática: al ser una distribución cuantizada del modelo base, sirve para estudiar el impacto de W4AFP8 en la calidad de traducción frente a BF16.

## Benchmarks y rendimiento

La model card incluye gráficas comparativas de calidad de traducción frente a TranslateGemma y HY-MT2, con métricas COMET-22 (medía de PFTB, SaaS y WMT24++) para japonés–inglés y chrF++ sobre FLORES+ para japonés y inglés frente a otros 14 idiomas. Sin embargo, los valores numéricos no están disponibles en el texto proporcionado, por lo que no se pueden reproducir cifras concretas.

| Evaluación | Métrica | Resultado |
|---|---|---|
| Japonés–inglés | COMET-22 (media de PFTB, SaaS, WMT24++) | no disponible (solo gráfica) |
| Japonés ↔ 14 idiomas | FLORES+ chrF++ | no disponible (solo gráfica) |
| Inglés ↔ 14 idiomas | FLORES+ chrF++ | no disponible (solo gráfica) |
| Impacto de la cuantización W4AFP8 vs BF16 | Tablas de precisión por tamaño | no disponible (contenido truncado en la model card) |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 5,7 GB, por lo que la inferencia en W4AFP8 requiere aproximadamente 6-8 GB de VRAM, dependiendo de la longitud de contexto y del tamaño de la caché KV.
- GPU recomendadas: tarjetas con soporte de FP8 e INT4, como NVIDIA H100, H200, L40S o A100 (esta última con matices según el soporte de FP8 en la versión de vLLM).
- GPU de consumo: cabe en tarjetas con 8 GB o más, como RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; en 8 GB el margen es ajustado para contextos largos.
- Opciones de despliegue: vLLM es el motor indicado explícitamente por el autor, con el mismo comando de lanzamiento que la versión BF16. Para otras opciones existen las distribuciones GGUF (llama.cpp, Ollama) y MLX-4bit (Apple Silicon) del mismo modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 8B W4AFP8 | 8,53 B | 32.768 tokens (entrada + salida) | 53 | PLaMo Community License | safetensors W4AFP8, vLLM |
| PLaMo 3 Translate 8B BF16 | 8,53 B | 32.768 tokens | 53 | PLaMo Community License | safetensors BF16, FP8, W4A16, NVFP4, GGUF, MLX |
| PLaMo 3 Translate 2B | no disponible | 32.768 tokens | 53 | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card sitúa a PLaMo 3 Translate por delante de TranslateGemma y HY-MT2 en todas las métricas comparadas, incluso con el modelo de 2B, pero no se aportan cifras ni especificaciones de esos competidores en la información disponible.

## Limitaciones y advertencias

- La cuantización W4AFP8 puede introducir una degradación de la calidad de traducción respecto a BF16; la model card incluye tablas comparativas, pero su contenido no está disponible en el extracto proporcionado.
- El límite de 32.768 tokens es combinado de entrada y salida: los documentos más largos deben dividirse, con el riesgo de perder coherencia entre fragmentos.
- El modelo está especializado en traducción; no se documentan capacidades de razonamiento general, código, matemáticas, tool calling ni agentes.
- Requiere `custom_code` y confiar en la implementación remota del autor al cargarlo con transformers, lo que implica revisar el código antes de usarlo en producción.
- La licencia PLaMo Community License permite uso personal, académico y no comercial sin registro, pero el uso comercial está sujeto a condiciones adicionales que deben revisarse en el enlace oficial.
- No se documentan sesgos idiomáticos concretos ni tasas de alucinación; como todo modelo generativo, puede producir traducciones fluidas pero incorrectas, especialmente en idiomas de bajos recursos.
- La información sobre la arquitectura interna y el proceso de entrenamiento (datos, RLHF/DPO) es muy limitada, lo que dificulta evaluar riesgos específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-8b-W4AFP8
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-8b
- Colección PLaMo 3 Translate: https://huggingface.co/collections/pfnet/plamo-3-translate
- Colección PLaMo 3: https://huggingface.co/collections/pfnet/plamo-3
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community License: https://plamo.preferredai.jp/info/plamo-community-license-en
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-8b-W4AFP8/blob/main/README_ja.md
