# pfnet/plamo-3-translate-31b-MLX-4bit

## Resumen

PLaMo 3 Translate 31B MLX-4bit es la variante cuantizada a 4 bits para MLX del modelo de traducción PLaMo 3 Translate 31B, desarrollado por Preferred Networks (PFN). El modelo base se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, y se ha entrenado adicionalmente con decenas de miles de millones de tokens de datos orientados a traducción.

El modelo está especializado en traducción multilingüe entre 53 idiomas, con especial énfasis en la calidad japonés-inglés y en combinaciones con el japonés. Además de la traducción directa, admite contexto circundante y glosarios como entradas auxiliares, y permite seleccionar entre estilo llano y estilo cortés en la salida en japonés. La longitud máxima durante el entrenamiento fue de 32.768 tokens para entrada y salida combinadas.

Esta variante MLX-4bit está pensada para ejecución en hardware Apple Silicon mediante la librería MLX y mlx-lm, reduciendo el peso del modelo base de 31B a aproximadamente 18,7 GB en el repositorio. Es relevante para desarrolladores que quieran desplegar traducción de alta calidad en local sobre Mac sin depender de infraestructura GPU dedicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles específicos no disponibles) |
| Parámetros totales | 5.427.713.024 (según safetensors del repo cuantizado); el modelo base se denomina 31B |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (entrada + salida combinadas durante entrenamiento) |
| Tipos de cuantización | 4 bits (MLX); el modelo base ofrece BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit |
| Idiomas soportados | 53 idiomas (ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh) |
| Licencia | PLaMo Community License |
| Formato de pesos | safetensors (MLX), librería mlx |

## Arquitectura y entrenamiento

El modelo base PLaMo 3 Translate 31B parte de PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT, y se ha sometido a un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traducción. La información disponible no detalla la arquitectura interna (tipo de atención, número de capas, uso de MoE o técnicas de decodificación especulativa); únicamente se confirma que se trata de un transformer con código personalizado (`custom_code`) y que la ventana de entrenamiento cubre 32.768 tokens combinando entrada y salida.

La variante MLX-4bit aplica cuantización de pesos a 4 bits para su ejecución con MLX en Apple Silicon. La model card menciona una sección de comparación de precisión entre formatos de distribución (BF16 frente a cuantizados), pero los valores concretos de degradación por cuantización no están incluidos en la información proporcionada. No se documentan detalles sobre RLHF, DPO ni composición exacta del dataset.

## Capacidades

- Traducción multilingüe entre 53 idiomas, con calidad destacada en japonés-inglés y en pares con el japonés.
- Uso de contexto circundante para desambiguar la traducción de fragmentos.
- Soporte de glosarios para forzar terminología concreta en la salida.
- Selección de estilo de salida en japonés: llano o cortés.
- Traducción de pasajes largos en una sola pasada dentro del límite de 32.768 tokens combinados.
- Traducción bidireccional entre inglés o japonés y otros 14 idiomas evaluados en FLORES+.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Localización de documentación técnica: el modelo puede traducir manuales y guías largas en una sola pasada gracias a su ventana de 32.768 tokens combinados, manteniendo coherencia terminológica mediante glosarios.
- Traducción de subtítulos y contenido audiovisual: adecuado para pares japonés-inglés y hacia los 53 idiomas soportados, con control de estilo llano o cortés en japonés según el registro del contenido.
- Atención al cliente multilingüe: integrable en pipelines de soporte para traducir conversaciones entre agentes y usuarios en decenas de idiomas, aprovechando el contexto circundante para resolver ambigüedades.
- Traducción jurídica o administrativa asistida: el uso de glosarios permite fijar terminología especializada y reducir variaciones indeseadas en textos sensibles.
- Procesamiento por lotes en local sobre Mac: al ser una variante MLX-4bit de ~18,7 GB, permite desplegar traducción de calidad en estaciones de trabajo Apple Silicon sin GPU dedicada.
- Investigación en traducción automática: útil para experimentar con prompting contextual, glosarios y evaluación en FLORES+ o WMT24++ sobre hardware de consumo.
- Traducción de contenido web y comercio electrónico: adecuado para localizar fichas de producto y descripciones en múltiples mercados, con la ventaja de ejecución local y control sobre los datos.

## Benchmarks y rendimiento

La model card referencia gráficas de calidad (PFTB, SaaS y WMT24++ COMET-22 para japonés-inglés; FLORES+ chrF++ para combinaciones con 14 idiomas adicionales) comparando con TranslateGemma y HY-MT2, pero los valores numéricos no están incluidos en la información proporcionada. Tampoco se detallan las métricas de degradación por cuantización de esta variante MLX-4bit frente a BF16.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM/espacio estimado: el repositorio MLX-4bit ocupa 18,7 GB, por lo que se requiere memoria unificada disponible en torno a esa cifra más el overhead de ejecución.
- Hardware objetivo: Apple Silicon (M-series) mediante MLX y mlx-lm; no está pensado para GPU NVIDIA ni CUDA.
- En GPU de consumo (RTX 4090, etc.) esta variante no es el formato adecuado; para esos entornos existen las variantes GGUF, W4A16, W4AFP8 y NVFP4 del modelo base.
- Despliegue: librería `mlx` y `mlx-lm`; el modelo base dispone además de formatos GGUF para llama.cpp/Ollama y variantes para vLLM/TGI según el formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PLaMo 3 Translate 31B MLX-4bit | 31B (base); 5,43B en safetensors del repo cuantizado | 32.768 tokens (entrada + salida) | 53 | PLaMo Community License | MLX 4-bit |
| PLaMo 3 Translate 8B MLX-4bit | 8B | 32.768 tokens (entrada + salida) | 53 | PLaMo Community License | MLX 4-bit |
| PLaMo 3 Translate 2B MLX-4bit | 2B | 32.768 tokens (entrada + salida) | 53 | PLaMo Community License | MLX 4-bit |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card indica que PLaMo 3 Translate supera a TranslateGemma y HY-MT2 en las métricas evaluadas, incluso con el modelo de 2B, pero los datos numéricos de esa comparación no están incluidos en la información disponible.

## Limitaciones y advertencias

- La licencia PLaMo Community License permite uso personal, académico y no comercial sin registro previo; el uso comercial está sujeto a condiciones adicionales que deben consultarse en el enlace oficial de la licencia.
- El límite de 32.768 tokens cubre entrada y salida combinadas; los textos más largos deben dividirse, lo que puede afectar a la coherencia en documentos extensos.
- Al ser una cuantización a 4 bits, es esperable cierta degradación de calidad frente a BF16, aunque los valores concretos no se detallan en la información disponible.
- Es un modelo especializado en traducción; no está diseñado para generación general, razonamiento, código o tareas de agente.
- No se documentan sesgos específicos ni tasas de alucinación; como todo modelo generativo, puede producir traducciones plausibles pero incorrectas, especialmente en dominios muy técnicos o con terminología poco frecuente.
- La variante MLX-4bit está restringida a hardware Apple Silicon; no es portable a CUDA sin recurrir a otros formatos del modelo base.
- No se dispone de información sobre el rendimiento en idiomas de bajos recursos dentro de los 53 soportados más allá de los 15 evaluados en FLORES+.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-31b-MLX-4bit
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-31b
- Variante W4AFP8: https://huggingface.co/pfnet/plamo-3-translate-31b-W4AFP8
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community: https://plamo.preferredai.jp/info/plamo-community-license-en
- Repositorio MLX: https://github.com/ml-explore/mlx
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-31b-MLX-4bit/blob/main/README_ja.md
