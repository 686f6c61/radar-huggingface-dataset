# pfnet/plamo-3-translate-0.8b-W4AFP8

## Resumen

PLaMo 3 Translate 0.8B W4AFP8 es la variante cuantizada del modelo de traducción especializado PLaMo 3 Translate 0.8B, desarrollado por Preferred Networks (PFN). Se trata de un LLM de 890 millones de parámetros (aproximadamente 0,8B) cuyo propósito exclusivo es la traducción automática multilingüe de alta calidad. El modelo base se construyó a partir de PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, y posteriormente se afinó con decenas de miles de millones de tokens de datos centrados en traducción.

Esta versión concreta aplica cuantización de pesos a INT4 y de activaciones a FP8 (esquema W4AFP8), lo que reduce el espacio en disco (repo de 1,0 GB) y los requisitos de memoria frente a la versión BF16, manteniendo el mismo comando de lanzamiento en vLLM. El modelo cubre 53 idiomas, admite contexto y glosarios como entradas adicionales y permite elegir entre estilo llano y cortés en la salida en japonés. La longitud máxima durante el entrenamiento fue de 32.768 tokens sumando entrada y salida.

Su relevancia actual radica en que ofrece calidad de traducción de primer nivel en un formato compacto y cuantizado, desplegable en hardware modesto, con licencia comunitaria que permite uso personal, académico y no comercial sin registro previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo de traducción especializado; detalles de capas y atención no disponibles) |
| Parametros totales | 890.344.960 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (máximo de entrenamiento, entrada + salida combinadas) |
| Tipos de cuantizacion | W4AFP8 (pesos INT4, activaciones FP8); el modelo base dispone de variantes BF16, FP8, W4A16, NVFP4, GGUF y MLX-4bit |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (uso personal, académico y no comercial gratuito; condiciones comerciales aparte) |
| Formato de pesos | safetensors con custom_code y compressed-tensors; compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only especializado en traducción, construido sobre PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT. Sobre esa base, PFN realizó un ajuste adicional con decenas de miles de millones de tokens de datos orientados específicamente a traducción. No se dispone en la información proporcionada de detalles sobre el número exacto de capas, dimensiones ocultas, mecanismo de atención ni de si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable de esta variante es el esquema de cuantización W4AFP8: pesos en INT4 y activaciones en FP8, implementado mediante compressed-tensors y compatible con vLLM usando el mismo comando de lanzamiento que la versión BF16. El modelo admite además entradas auxiliares de contexto y glosario, y control de estilo (llano o cortés) en la salida japonesa, lo que lo diferencia de traductores genéricos. La ventana de entrenamiento de 32.768 tokens permite traducir pasajes largos en una sola pasada.

## Capacidades

- Traducción automática entre 53 idiomas, con evaluación destacada en pares japonés-inglés y en combinaciones multilingües.
- Traducción con contexto circundante: el modelo puede tener en cuenta texto previo o posterior para desambiguar.
- Soporte de glosarios: permite imponer terminología específica en la traducción.
- Control de estilo en japonés: elección entre registro llano y cortés.
- Procesamiento de pasajes largos de hasta 32.768 tokens combinando entrada y salida.
- Capacidad multilingüe amplia que cubre lenguas europeas, asiáticas, de Oriente Medio, del sur de Asia y del sudeste asiático.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de documentación técnica: el modelo puede procesar secciones completas dentro de su ventana de 32.768 tokens, manteniendo coherencia terminológica gracias al soporte de glosarios, lo que resulta adecuado para manuales y especificaciones.
- Localización de productos y webs corporativas: con 53 idiomas y control de estilo en japonés, permite generar versiones localizadas de contenido comercial con registro adecuado para cada mercado.
- Atención al cliente multilingüe: integrado en un pipeline de soporte, traduce conversaciones entre agentes y clientes en tiempo real; su tamaño compacto (1,0 GB en W4AFP8) permite desplegarlo en infraestructura modesta.
- Traducción de documentación legal o médica con glosario: la posibilidad de imponer terminología concreta reduce inconsistencias en dominios donde la precisión terminológica es crítica.
- Subtitulado y traducción de contenido audiovisual: la ventana larga permite traducir guiones o transcripciones completas de una sola pasada, y el contexto circundante ayuda a resolver referencias.
- Procesamiento por lotes de corpus multilingües: en investigación o análisis de datos, el modelo puede traducir grandes volúmenes a 53 idiomas con un coste de memoria reducido gracias a la cuantización W4AFP8.
- Traducción integrada en editores o herramientas ofimáticas: al caber en GPU de consumo y disponer de variantes GGUF y MLX, puede ejecutarse localmente en aplicaciones de escritorio.

## Benchmarks y rendimiento

La model card menciona que PLaMo 3 Translate ofrece calidad de primer nivel en traducción japonés-inglés y multilingüe, y que incluso el modelo de 2B supera a los LLM especializados en traducción comparados (TranslateGemma y HY-MT2) en todas las métricas de la figura publicada. Las métricas empleadas son COMET-22 (media de PFTB, SaaS y WMT24++ para japonés-inglés) y FLORES+ chrF++ en ambas direcciones para japonés y inglés frente a 14 idiomas. Sin embargo, los valores numéricos concretos no están disponibles en la información proporcionada.

| Benchmark | Resultado |
|---|---|
| COMET-22 (japonés-inglés, media PFTB/SaaS/WMT24++), 0.8B W4AFP8 | No disponible (solo figura en la model card) |
| FLORES+ chrF++ (japonés y inglés frente a 14 idiomas), 0.8B W4AFP8 | No disponible (solo figura en la model card) |
| Comparación con TranslateGemma y HY-MT2 | El 2B supera a ambos en todas las métricas; valores del 0.8B no disponibles |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo W4AFP8 ocupa 1,0 GB, por lo que la inferencia requiere aproximadamente 1,5-2,5 GB de VRAM incluyendo overhead de runtime y caché KV para contextos moderados; para contextos cercanos a 32.768 tokens la caché KV incrementa el consumo de forma notable (valor exacto no disponible).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para contextos cortos; para aprovechar la ventana completa de 32.768 tokens se recomienda 8 GB o más (RTX 3060/4060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; también en Apple Silicon mediante la variante MLX-4bit del modelo base.
- Opciones de despliegue: vLLM (soporte explícito, mismo comando que BF16), transformers con custom_code, y para el modelo base existen GGUF (llama.cpp/Ollama) y MLX.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 0.8B W4AFP8 | 0,89B | 32.768 | 53 | PLaMo Community License | safetensors (W4AFP8) |
| PLaMo 3 Translate 0.8B (BF16) | 0,89B | 32.768 | 53 | PLaMo Community License | safetensors, GGUF, MLX, FP8, NVFP4, W4A16 |
| PLaMo 3 Translate 2B | ~2B | 32.768 | 53 | PLaMo Community License | múltiples variantes |
| TranslateGemma | No disponible | No disponible | No disponible | No disponible | No disponible |
| HY-MT2 | No disponible | No disponible | No disponible | No disponible | No disponible |

La model card cita TranslateGemma y HY-MT2 como modelos de traducción especializados comparables, pero no se dispone de sus especificaciones detalladas en la información proporcionada. Según la card, el PLaMo 3 Translate 2B supera a ambos en todas las métricas evaluadas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como todo modelo entrenado con datos masivos, puede reflejar sesgos presentes en el corpus.
- Riesgo de alucinación: inherente a los LLM; en traducción puede manifestarse como adiciones, omisiones o invenciones de contenido, especialmente en idiomas de bajos recursos.
- Limitación de contexto: la longitud máxima de entrenamiento es de 32.768 tokens sumando entrada y salida; los pasajes más largos deben dividirse.
- Cobertura desigual por idioma: aunque soporta 53 idiomas, la evaluación publicada se centra en 15 de ellos; el rendimiento en el resto puede ser inferior.
- Restricciones de licencia: la PLaMo Community License permite uso personal, académico y no comercial sin registro, pero el uso comercial requiere consultar las condiciones específicas de la licencia.
- Es un modelo especializado exclusivamente en traducción: no está diseñado para generación general, razonamiento, código ni tool calling.
- La cuantización W4AFP8 puede introducir pequeñas degradaciones de calidad frente a BF16; la model card incluye tablas comparativas de precisión por tamaño, aunque los valores no están disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4AFP8
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante NVFP4: https://huggingface.co/pfnet/plamo-3-translate-0.8b-NVFP4
- Variante FP8: https://huggingface.co/pfnet/plamo-3-translate-0.8b-FP8
- Variante W4A16: https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4A16
- Variante GGUF: https://huggingface.co/pfnet/plamo-3-translate-0.8b-GGUF
- Variante MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-0.8b-MLX-4bit
- Modelo 2B: https://huggingface.co/pfnet/plamo-3-translate-2b
- Modelo 8B: https://huggingface.co/pfnet/plamo-3-translate-8b
- Modelo 31B: https://huggingface.co/pfnet/plamo-3-translate-31b
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community License: https://plamo.preferredai.jp/info/plamo-community-license-en
