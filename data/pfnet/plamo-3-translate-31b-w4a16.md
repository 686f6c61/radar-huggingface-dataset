# pfnet/plamo-3-translate-31b-W4A16

## Resumen

PLaMo 3 Translate 31B W4A16 es la variante cuantizada a INT4 del modelo de traducción especializado PLaMo 3 Translate 31B, desarrollado por Preferred Networks (PFN). El modelo base se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, y posteriormente se afina sobre decenas de miles de millones de tokens de datos orientados a traducción. La versión W4A16 aplica cuantización de pesos a 4 bits manteniendo activaciones en BF16, lo que reduce de forma notable el consumo de VRAM en inferencia con vLLM sobre GPUs NVIDIA Ampere o posteriores.

El modelo cubre traducción entre 53 idiomas, incluyendo el español y el catalán, y admite contexto adicional, glosarios y control de estilo formal o informal en la salida en japonés. La longitud máxima vista en entrenamiento es de 32.768 tokens combinando entrada y salida, lo que permite traducir pasajes largos en una sola pasada siempre que se respete ese límite. Está pensado para despliegues de traducción de alta calidad donde el coste de memoria y el rendimiento por GPU son críticos.

La relevancia actual del modelo reside en su especialización: frente a LLMs generalistas, PLaMo 3 Translate se entrena específicamente para traducción y compite con otros modelos dedicados como TranslateGemma o HY-MT2. La licencia PLaMo Community License permite uso personal, académico y no comercial sin registro previo, con condiciones específicas para uso comercial que deben revisarse antes de desplegarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia PLaMo 3, código personalizado `plamo3`) |
| Parametros totales | 4.696.331.776 (según safetensors del repo cuantizado; el modelo base se denomina 31B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (máximo en entrenamiento, entrada + salida combinadas) |
| Tipos de cuantizacion | W4A16 (pesos INT4, activaciones BF16); el modelo base dispone además de FP8, W4AFP8, NVFP4, GGUF y MLX-4bit |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (uso personal, académico y no comercial gratuito; condiciones específicas para uso comercial) |
| Formato de pesos | safetensors con `compressed-tensors` (INT4), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia PLaMo 3, con código de modelado personalizado (`custom_code` y tag `plamo3`). El modelo base PLaMo 3 Translate 31B parte de PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT, y se afina posteriormente sobre decenas de miles de millones de tokens de datos centrados en traducción. La model card no detalla la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible en el material proporcionado.

La variante W4A16 aplica cuantización de solo pesos a 4 bits (INT4) mediante `compressed-tensors`, manteniendo las activaciones en BF16 durante la inferencia. La model card indica que, para reproducir la evaluación del autor, debe añadirse `--dtype bfloat16` al comando de lanzamiento de vLLM. La model card menciona una sección de precisión comparada entre BF16 y las variantes cuantizadas, pero los valores concretos no están incluidos en la información disponible. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Traducción entre 53 idiomas, incluyendo pares con japonés, inglés, español, catalán, chino simplificado y tradicional, coreano, árabe, hindi y vietnamita, entre otros.
- Traducción con contexto adicional: el modelo puede tener en cuenta texto circundante para desambiguar y mantener coherencia.
- Soporte de glosarios: permite imponer terminología específica durante la traducción.
- Control de estilo en japonés: elección entre estilo llano y estilo formal (polite).
- Traducción de pasajes largos en una sola pasada, hasta 32.768 tokens combinando entrada y salida.
- Generación de texto multilingüe orientada a traducción (pipeline `translation`).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción de documentación técnica y jurídica: el modelo admite glosarios, lo que permite fijar terminología corporativa y mantener consistencia en manuales, contratos o normativas multilingües.
- Localización de productos y software: con 53 idiomas soportados, se puede usar como motor central de un pipeline de localización que traduzca cadenas de interfaz y textos de marketing desde un idioma fuente común.
- Traducción de artículos y contenido editorial largo: gracias a los 32.768 tokens de contexto combinado, puede traducir secciones extensas en una sola llamada, preservando la coherencia del discurso.
- Atención al cliente multilingüe: integrado en un sistema de tickets o chat, traduce mensajes entrantes y salientes entre el idioma del cliente y el del agente, con control de estilo formal en japonés cuando el destinatario lo requiera.
- Subtitulado y traducción de transcripciones: al trabajar con pasajes de hasta decenas de miles de tokens, puede procesar transcripciones completas de reuniones o vídeos y traducirlas manteniendo el contexto de la conversación.
- Investigación académica en traducción automática: la licencia permite uso académico gratuito sin registro, lo que facilita su uso como sistema de referencia o como base para experimentos de evaluación en FLORES+ y otros corpus multilingües.
- Despliegue en infraestructura con VRAM limitada: la cuantización W4A16 reduce el peso de los pesos a 4 bits, lo que permite servir el modelo en GPUs Ampere o posteriores con menos memoria que la variante BF16, usando vLLM como motor de inferencia.

## Benchmarks y rendimiento

La model card incluye una figura comparativa de calidad de traducción frente a TranslateGemma y HY-MT2, con métricas agregadas: para japonés–inglés, la media de PFTB, SaaS y WMT24++ COMET-22; para japonés y inglés frente a otros 14 idiomas, la media de FLORES+ chrF++ en ambas direcciones. Sin embargo, los valores numéricos concretos de esa figura no están incluidos en la información proporcionada, por lo que no se pueden reproducir en tabla. La model card afirma que incluso el modelo de 2B supera a los LLMs especializados en traducción comparados en todas las métricas de la figura, pero no se dispone de las cifras exactas.

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo cuantizado ocupa 17,2 GB, por lo que la inferencia W4A16 requiere aproximadamente esa cantidad para los pesos, más overhead de activaciones, caché KV y contexto. Con 32.768 tokens de contexto, la caché KV puede añadir varios GB adicionales según el lote y la configuración.
- GPU recomendadas: NVIDIA Ampere o posteriores, tal como indica la model card para la variante W4A16. Para el modelo de 31B en BF16 se necesitarían GPUs de 80 GB (A100, H100); la variante W4A16 está pensada para reducir ese requisito.
- GPU de consumo: no se confirma en la información disponible que quepa en GPUs de consumo como la RTX 4090 (24 GB); el tamaño del repo (17,2 GB) deja poco margen para caché KV y activaciones con contextos largos, por lo que es ajustado y no está validado por el autor en ese hardware.
- Opciones de despliegue: vLLM es el motor recomendado explícitamente por la model card, con `--dtype bfloat16`. El modelo base dispone de variantes GGUF y MLX-4bit para otros entornos, pero esta variante W4A16 concreta está orientada a vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 31B W4A16 | 4.696.331.776 (según safetensors del repo cuantizado) | 32.768 | 53 | PLaMo Community License | safetensors INT4 (compressed-tensors), vLLM |
| PLaMo 3 Translate 31B BF16 | no disponible en la información | 32.768 | 53 | PLaMo Community License | safetensors BF16 |
| TranslateGemma | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

La model card menciona TranslateGemma y HY-MT2 como modelos de traducción especializados comparados en la figura de benchmarks, pero no se proporcionan sus especificaciones ni sus resultados numéricos en la información disponible. Tampoco se detallan las variantes de otras familias (por ejemplo, NLLB o M2M-100) en el material consultado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado sobre datos multilingües, es previsible que herede sesgos presentes en esos corpus, pero no se cuantifican.
- Riesgo de alucinación: no se documenta explícitamente; en tareas de traducción, el riesgo se manifiesta como adiciones, omisiones o terminología inventada, especialmente en idiomas de bajos recursos.
- Límite de contexto: 32.768 tokens combinando entrada y salida; la model card recomienda dividir textos más largos para no superar ese límite.
- Idiomas: aunque soporta 53 idiomas, la evaluación de FLORES+ se realiza sobre 15 idiomas seleccionados (japonés, inglés, árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino simplificado y tradicional, alemán, francés, vietnamita y ruso); el rendimiento en el resto puede ser inferior y no está cuantificado.
- Licencia: la PLaMo Community License permite uso personal, académico y no comercial sin registro, pero el uso comercial está sujeto a condiciones específicas que deben consultarse en el enlace de la licencia antes de desplegar en producción.
- Cuantización: la variante W4A16 introduce una pérdida de precisión respecto a BF16; la model card menciona una sección de comparación de precisión, pero los valores no están disponibles en la información proporcionada.
- Compatibilidad: requiere `custom_code` y la librería transformers, además de vLLM con `--dtype bfloat16` para reproducir la evaluación del autor; no se garantiza su funcionamiento en otros motores sin conversión.
- Fecha de creación del repo: 2026-10-27, según los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-31b-W4A16
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-31b
- Variante FP8: https://huggingface.co/pfnet/plamo-3-translate-31b-FP8
- Variante W4AFP8: https://huggingface.co/pfnet/plamo-3-translate-31b-W4AFP8
- Variante NVFP4: https://huggingface.co/pfnet/plamo-3-translate-31b-NVFP4
- Variante GGUF: https://huggingface.co/pfnet/plamo-3-translate-31b-GGUF
- Variante MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-31b-MLX-4bit
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community License: https://plamo.preferredai.jp/info/plamo-community-license-en
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-31b-W4A16/blob/main/README_ja.md
