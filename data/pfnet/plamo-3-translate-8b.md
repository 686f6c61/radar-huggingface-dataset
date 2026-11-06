# pfnet/plamo-3-translate-8b

## Resumen

PLaMo 3 Translate 8B es un modelo de lenguaje especializado en traduccion desarrollado por Preferred Networks (PFN). Se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigacion conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japon, y se entrena posteriormente con decenas de miles de millones de tokens de datos orientados especificamente a traduccion. El resultado es un modelo de 8.531.750.912 parametros (aproximadamente 8,5B) que cubre 53 idiomas y que, segun el autor, alcanza calidad de traduccion de primer nivel tanto en el par japones-ingles como en traduccion multilingue.

La propuesta de valor del modelo no es la generacion de texto generalista, sino la traduccion de alta calidad con control fino sobre el contexto. Admite contexto circundante y glosarios como entradas adicionales, y permite elegir entre estilo llano y estilo cortes (keigo) en la salida en japones, lo que resulta relevante para localizacion profesional y documentacion corporativa. La longitud maxima durante el entrenamiento fue de 32.768 tokens sumando entrada y salida, lo que permite traducir pasajes largos en una sola pasada siempre que se respete ese limite combinado.

El modelo forma parte de una familia de cuatro tamanos (0.8B, 2B, 8B y 31B), cada uno con variantes cuantizadas y convertidas publicadas en repositorios separados (FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX). La licencia es la PLaMo Community License: el uso personal, educativo y academico no comercial es gratuito y sin registro previo, mientras que el uso comercial queda sujeto a condiciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia PLaMo 3, requiere `custom_code`; detalles de capas y atencion no disponibles) |
| Parametros totales | 8.531.750.912 (~8,5B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens (maximo de entrenamiento, entrada + salida combinadas) |
| Tipos de cuantizacion | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF (incluye Q2_K), MLX-4bit |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (uso no comercial gratuito; uso comercial con condiciones) |
| Formato de pesos | safetensors (BF16, FP8, W4A16, W4AFP8, NVFP4), GGUF, MLX-4bit |

## Arquitectura y entrenamiento

La informacion disponible confirma que PLaMo 3 Translate 8B es un transformer de la familia PLaMo 3, con pesos en safetensors y dependencia de codigo personalizado (`custom_code`) para cargarse en `transformers`. No se detallan en la informacion proporcionada el numero de capas, la dimension oculta, el tipo de atencion ni si emplea innovaciones como atencion lineal o decodificacion especulativa. Tampoco se especifica si es un modelo denso o MoE; por el recuento de parametros y la ausencia de menciones a parametros activos, se asume denso, pero este punto no esta confirmado explicitamente.

El entrenamiento parte de PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT, y se continua con decenas de miles de millones de tokens de datos centrados en traduccion. El modelo incorpora mecanismos para aceptar contexto circundante y glosarios, y para controlar el registro estilistico del japones (llano frente a cortes). La longitud maxima de entrenamiento fue de 32.768 tokens combinando entrada y salida. No se dispone de informacion sobre la composicion exacta del dataset, el uso de RLHF o DPO, ni sobre tecnicas de alineacion adicionales.

## Capacidades

- Traduccion entre 53 idiomas, incluyendo pares con japones, ingles, chino (simplificado y tradicional), arabe, coreano, espanol, frances, aleman, ruso, vietnamita, tailandes, indonesio, italiano y neerlandes, entre otros.
- Traduccion bidireccional: el modelo se evalua en ambas direcciones entre japones o ingles y cada uno de los otros 14 idiomas del conjunto de evaluacion FLORES+.
- Uso de contexto circundante: puede tener en cuenta texto previo o posterior para desambiguar la traduccion.
- Uso de glosarios: admite terminos de referencia para forzar terminologia consistente.
- Control de estilo en japones: eleccion entre registro llano y registro cortes (keigo).
- Traduccion de pasajes largos en una sola pasada, hasta 32.768 tokens sumando entrada y salida.
- Generacion de texto y traduccion multilingue en el pipeline `translation` de Hugging Face.
- No se documenta en la informacion disponible soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Localizacion de documentacion tecnica: el modelo puede traducir manuales y guias de varios miles de tokens en una sola pasada, usando el contexto circundante para mantener coherencia terminologica entre secciones.
- Localizacion de software y UI: con glosarios de terminos de producto, se puede forzar que cadenas de interfaz, mensajes de error y nombres de menu se traduzcan de forma consistente en los 53 idiomas soportados.
- Atencion al cliente multilingue: traduccion de conversaciones de soporte entre japones, ingles y el resto de idiomas cubiertos, con control del registro cortes para comunicaciones formales con clientes japoneses.
- Traduccion de contenido editorial y marketing: el control de estilo llano frente a cortes permite adaptar el tono segun el publico, algo util en campanas dirigidas a mercados japoneses.
- Subtitulado y traduccion de transcripciones: con contexto de 32.768 tokens se pueden procesar transcripciones largas por bloques, aprovechando el contexto previo para resolver referencias y elipsis.
- Investigacion en traduccion automatica: al publicarse en cuatro tamanos (0.8B, 2B, 8B, 31B) con variantes cuantizadas, sirve como base para estudios comparativos de calidad frente a tamano y cuantizacion, y para experimentos academicos sin coste de licencia.
- Procesamiento por lotes en pipelines de datos: las variantes GGUF y MLX-4bit permiten desplegar traduccion masiva en hardware de consumo o en Apple Silicon, reduciendo costes frente a APIs comerciales.

## Benchmarks y rendimiento

El autor publica graficos de calidad de traduccion comparando PLaMo 3 Translate con TranslateGemma y HY-MT2, pero los valores numericos no estan incluidos en la informacion proporcionada (solo se describe la figura). Las metricas empleadas son:

- PFTB, SaaS y WMT24++ con COMET-22 para el par japones-ingles (promedio).
- FLORES+ con chrF++ para traduccion entre japones y 14 idiomas, y entre ingles y 14 idiomas, en ambas direcciones.

| Evaluacion | Metrica | Resultado |
|---|---|---|
| Japones-ingles | Promedio PFTB + SaaS + WMT24++ (COMET-22) | No disponible (solo figura) |
| Japones y 14 idiomas | FLORES+ chrF++ bidireccional | No disponible (solo figura) |
| Ingles y 14 idiomas | FLORES+ chrF++ bidireccional | No disponible (solo figura) |

El autor afirma que incluso el modelo de 2B supera a los LLM especializados en traduccion comparados en todas las metricas de la figura, pero no se aportan los numeros concretos en la informacion disponible. La model card incluye ademas tablas de impacto de la cuantizacion sobre la precision (BF16 frente a FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX), de las que solo se indica que GGUF Q2_K muestra menor precision en algunas metricas y que el resto de formatos se mantienen cerca de BF16.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 17 GB solo para pesos (el repositorio ocupa 17,1 GB), mas overhead de activaciones y KV cache; en la practica se recomienda 24 GB o mas para contexto largo.
- VRAM estimada en FP8: alrededor de 8,5-9 GB para pesos, con margen adicional para cache.
- VRAM estimada en W4A16, W4AFP8 y NVFP4: en torno a 4,5-5,5 GB para pesos, lo que permite ejecucion en GPUs de consumo con 8-12 GB.
- VRAM estimada en GGUF Q2_K: aproximadamente 3 GB para pesos; util en equipos muy limitados, aunque con perdida de precision documentada.
- GPU recomendadas: A100 40/80 GB o H100 para BF16 con contexto completo; RTX 4090 (24 GB) para BF16 con contexto moderado o FP8; RTX 3090/4080 y similares para cuantizaciones de 4 bits.
- Cabe en GPU de consumo: si, en las variantes W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit.
- Opciones de despliegue: `transformers` (requiere `custom_code`), vLLM y TGI para las variantes safetensors, llama.cpp y Ollama para GGUF, MLX para Apple Silicon. La compatibilidad exacta de cada runtime con el codigo personalizado debe verificarse en la documentacion del autor, no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 8B | ~8,5B | 32.768 | 53 | PLaMo Community License | safetensors, GGUF, MLX |
| PLaMo 3 Translate 2B | ~2B (no confirmado) | 32.768 (mismo entrenamiento) | 53 | PLaMo Community License | safetensors, GGUF, MLX |
| PLaMo 3 Translate 31B | ~31B (no confirmado) | 32.768 (mismo entrenamiento) | 53 | PLaMo Community License | safetensors, GGUF, MLX |
| TranslateGemma | No disponible | No disponible | No disponible | No disponible | No disponible |
| HY-MT2 | No disponible | No disponible | No disponible | No disponible | No disponible |

TranslateGemma y HY-MT2 se mencionan como modelos de comparacion en la model card, pero no se proporcionan sus especificaciones, contexto ni licencia en la informacion disponible. No se dispone de datos numericos de rendimiento comparativo mas alla de la afirmacion cualitativa del autor.

## Limitaciones y advertencias

- El modelo esta especializado en traduccion; no se documenta su rendimiento en generacion general, razonamiento, codigo o matematicas, por lo que no deberia emplearse como sustituto de un LLM generalista.
- La longitud maxima de 32.768 tokens es combinada de entrada y salida; los pasajes mas largos deben dividirse, lo que puede romper la coherencia en documentos muy extensos.
- La cuantizacion GGUF Q2_K reduce la precision de traduccion en algunas metricas segun el propio autor; para produccion se recomienda FP8, W4A16, W4AFP8, NVFP4 o cuantizaciones GGUF superiores.
- La licencia PLaMo Community License impone condiciones al uso comercial; es necesario revisar los terminos antes de desplegar el modelo en productos o servicios de pago.
- No se documentan sesgos conocidos, tasas de alucinacion ni comportamiento en dominios especializados (legal, medico, tecnico) en la informacion disponible.
- El modelo requiere `custom_code` para cargarse en `transformers`, lo que puede complicar la integracion con runtimes que no soporten codigo personalizado.
- La calidad en idiomas de bajos recursos dentro de los 53 soportados no esta cuantificada en la informacion disponible; la evaluacion FLORES+ se limita a 15 idiomas.
- El control de estilo llano frente a cortes esta documentado solo para japones; no se especifica si existe control equivalente en otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-8b
- README en japones: https://huggingface.co/pfnet/plamo-3-translate-8b/blob/main/README_ja.md
- Blog tecnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community: https://plamo.preferredai.jp/info/plamo-community-license-en
- Variante 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante 2B: https://huggingface.co/pfnet/plamo-3-translate-2b
- Variante 31B: https://huggingface.co/pfnet/plamo-3-translate-31b
- Variante 8B FP8: https://huggingface.co/pfnet/plamo-3-translate-8b-FP8
- Variante 8B W4A16: https://huggingface.co/pfnet/plamo-3-translate-8b-W4A16
- Variante 8B W4AFP8: https://huggingface.co/pfnet/plamo-3-translate-8b-W4AFP8
- Variante 8B NVFP4: https://huggingface.co/pfnet/plamo-3-translate-8b-NVFP4
- Variante 8B GGUF: https://huggingface.co/pfnet/plamo-3-translate-8b-GGUF
- Variante 8B MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-8b-MLX-4bit
