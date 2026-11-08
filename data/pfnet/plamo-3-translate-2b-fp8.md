# pfnet/plamo-3-translate-2b-FP8

## Resumen

PLaMo 3 Translate 2B FP8 es la variante cuantizada en FP8 de PLaMo 3 Translate 2B, un modelo de lenguaje especializado en traducción desarrollado por Preferred Networks (PFN). Se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, y se ha entrenado adicionalmente con decenas de miles de millones de tokens de datos centrados en traducción. El resultado es un modelo de 2.878.595.584 parámetros (aproximadamente 2,9 mil millones) que cubre la traducción entre 53 idiomas.

La relevancia de esta variante FP8 radica en que reduce el peso del repositorio a 3,4 GB al cuantizar pesos y activaciones a 8 bits, manteniendo el mismo comando de despliegue en vLLM que la versión BF16. Esto facilita su ejecución en GPUs con memoria limitada sin renunciar a la calidad de traducción del modelo original. El modelo admite contexto adicional y glosarios, permite elegir entre estilo llano y cortés en la salida en japonés, y su longitud máxima de entrenamiento es de 32.768 tokens combinando entrada y salida.

PLaMo 3 Translate se distribuye en cuatro tamaños (0,8B, 2B, 8B y 31B), cada uno con múltiples formatos de cuantización (FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX). La licencia es la PLaMo Community License, que permite uso personal, académico y no comercial sin registro previo, con condiciones específicas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia PLaMo 3, requiere `custom_code`; detalles no disponibles) |
| Parametros totales | 2.878.595.584 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (máximo de entrenamiento, entrada + salida combinadas) |
| Tipos de cuantizacion | FP8 (pesos y activaciones); el modelo base dispone además de BF16, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | plamo-community-license |
| Formato de pesos | safetensors (FP8), librería transformers con `custom_code` |

## Arquitectura y entrenamiento

El modelo se basa en PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT. Sobre esa base, PFN realizó un entrenamiento adicional con decenas de miles de millones de tokens de datos orientados a traducción. No se detalla en la información disponible la composición exacta del dataset, el número total de tokens de preentrenamiento ni si se aplicaron técnicas de RLHF o DPO. La arquitectura concreta (número de capas, dimensiones, mecanismo de atención) no está especificada en la información proporcionada, más allá de que requiere `custom_code` en transformers y de que la longitud máxima de entrenamiento fue de 32.768 tokens para entrada y salida combinadas.

La innovación principal del modelo es su especialización en traducción con soporte de contexto circundante y glosarios, además de la posibilidad de seleccionar el estilo de salida en japonés (llano o cortés). La variante FP8 cuantiza tanto pesos como activaciones, y según la model card mantiene el mismo comando de lanzamiento en vLLM que la versión BF16. La model card incluye tablas comparativas de precisión entre BF16 y cada formato de distribución por tamaño, aunque los valores numéricos no se han incluido en la información disponible.

## Capacidades

- Traducción entre 53 idiomas, incluyendo combinaciones con japonés, inglés, español, chino, árabe, coreano, tailandés, vietnamita y ruso, entre otros.
- Traducción de pasajes largos en una sola pasada, hasta un límite combinado de 32.768 tokens de entrada y salida.
- Uso de contexto circundante para mejorar la coherencia de la traducción.
- Soporte de glosarios para forzar terminología concreta.
- Selección de estilo de salida en japonés: llano o cortés.
- Generación de texto y pipeline de traducción (`translation`) en transformers.
- Compatibilidad con vLLM para despliegue en producción.
- Capacidades multilingües amplias derivadas de los 53 idiomas soportados.
- No se dispone de información sobre tool calling, function calling, agentes, visión, audio o modo de razonamiento explícito.

## Casos de uso

- Traducción automática de documentación técnica: el modelo puede procesar pasajes largos de hasta 32.768 tokens combinados, lo que permite traducir secciones completas de manuales sin fragmentar en exceso el contexto.
- Localización de productos multilingües: con 53 idiomas soportados, un mismo modelo cubre la traducción de fichas de producto, textos de interfaz y material de marketing hacia y desde japonés e inglés, entre otros pares.
- Traducción con terminología controlada: el soporte de glosarios permite imponer términos concretos (nombres de producto, términos legales o técnicos) en la salida, útil en entornos corporativos con vocabulario fijo.
- Atención al cliente en varios idiomas: integrado en un pipeline de traducción, puede traducir mensajes entrantes y salientes en conversaciones de soporte, con la ventaja de que la variante FP8 reduce los requisitos de memoria en el servidor.
- Traducción de contenido editorial y noticias: el uso de contexto circundante mejora la coherencia entre frases y párrafos, adecuado para artículos y boletines.
- Traducción japonés-inglés de alta calidad: según la model card, el modelo destaca en calidad japonés-inglés y multilingüe, lo que lo hace apto para documentación técnica y publicaciones en ese par de idiomas.
- Procesamiento por lotes en GPUs de gama media: al ocupar 3,4 GB en FP8, puede desplegarse en GPUs consumer para tareas de traducción por lotes o en local.

## Benchmarks y rendimiento

La model card indica que PLaMo 3 Translate ofrece calidad de nivel mundial tanto en japonés-inglés como en traducción multilingüe, y que incluso el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas de la figura publicada. Las métricas empleadas son:

- Japonés-inglés: media de PFTB, SaaS y WMT24++ COMET-22.
- Japonés frente a 14 idiomas: media de FLORES+ chrF++ en ambas direcciones.
- Inglés frente a 14 idiomas: media de FLORES+ chrF++ en ambas direcciones.

Los idiomas evaluados en FLORES+ son japonés, inglés, árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino simplificado y tradicional, alemán, francés, vietnamita y ruso. Los valores numéricos de los benchmarks no están incluidos en la información disponible; la model card remite a una figura y al blog técnico. No se han publicado cifras concretas de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio FP8 ocupa 3,4 GB, por lo que la inferencia requiere aproximadamente 4 GB de VRAM o más, dependiendo de la longitud de contexto y del tamaño de lote.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cabe en GPUs consumer con al menos 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070) y en GPUs de datacenter como A100 o H100 para mayor throughput.
- Cabe en GPU consumer: sí, gracias al formato FP8 y a los 2,9 mil millones de parámetros.
- Opciones de despliegue: vLLM (comando idéntico al de la versión BF16, según la model card) y transformers con `custom_code`. Existen variantes GGUF y MLX-4bit para llama.cpp y entornos Apple Silicon, respectivamente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| PLaMo 3 Translate 2B FP8 | 2,878 M | 32.768 tokens | PLaMo Community License | FP8, BF16, W4A16, W4AFP8, NVFP4, GGUF, MLX | Especializado en traducción, 53 idiomas |
| PLaMo 3 Translate 0.8B | no disponible | 32.768 tokens | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX | Versión más pequeña de la misma familia |
| PLaMo 3 Translate 8B | no disponible | 32.768 tokens | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX | Versión mayor de la misma familia |
| PLaMo 3 Translate 31B | no disponible | 32.768 tokens | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX | Versión más grande de la misma familia |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | Mencionado como comparación en la model card |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | Mencionado como comparación en la model card |

La model card menciona explícitamente TranslateGemma y HY-MT2 como modelos especializados en traducción frente a los que se compara, pero no se proporcionan sus especificaciones ni resultados numéricos en la información disponible.

## Limitaciones y advertencias

- La cuantización FP8 puede introducir pequeñas variaciones de precisión respecto a BF16; la model card incluye tablas de diferencias por formato, pero los valores no están disponibles en la información proporcionada.
- El límite de 32.768 tokens es combinado de entrada y salida; los textos más largos deben dividirse, lo que puede afectar a la coherencia en documentos muy extensos.
- El modelo está especializado en traducción; no se documentan capacidades de razonamiento general, código, matemáticas, tool calling ni agentes.
- Riesgo de alucinación y de errores en pares de idiomas con menos recursos: no se detalla el rendimiento por par de idiomas más allá de los 15 evaluados en FLORES+.
- Sesgos conocidos: no se documentan en la información disponible.
- Licencia PLaMo Community License: el uso personal, académico y no comercial es gratuito sin registro previo; el uso comercial está sujeto a condiciones adicionales que deben consultarse en el enlace oficial de la licencia.
- El modelo requiere `custom_code` en transformers, lo que puede complicar la integración frente a arquitecturas estándar.
- No se dispone de información sobre latencia, throughput ni requisitos exactos de GPU para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-2b-FP8
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-2b
- Variante GGUF: https://huggingface.co/pfnet/plamo-3-translate-2b-GGUF
- Variante MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-2b-MLX-4bit
- Variante W4A16: https://huggingface.co/pfnet/plamo-3-translate-2b-W4A16
- Variante W4AFP8: https://huggingface.co/pfnet/plamo-3-translate-2b-W4AFP8
- Variante NVFP4: https://huggingface.co/pfnet/plamo-3-translate-2b-NVFP4
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-2b-FP8/blob/main/README_ja.md
- Ficha en free2aitools: https://free2aitools.com/model/pfnet/plamo-3-translate-2b-fp8
