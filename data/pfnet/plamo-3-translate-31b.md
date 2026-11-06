# pfnet/plamo-3-translate-31b

## Resumen

PLaMo 3 Translate 31B es un modelo de lenguaje especializado en traducción desarrollado por Preferred Networks (PFN), construido sobre el modelo preentrenado PLaMo 3 NICT, fruto de una investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón. PFN continuó el entrenamiento del modelo base con decenas de miles de millones de tokens de datos orientados específicamente a traducción, dando como resultado un modelo de 31.757.456.384 parámetros (31,7B) en formato BF16 con pesos safetensors.

El modelo cubre traducción entre 53 idiomas, con especial énfasis en pares japonés-inglés y en combinaciones multilingües que incluyen español, alemán, francés, chino, coreano, árabe, hindi, vietnamita y tailandés, entre otros. Además de la traducción directa, admite contexto circundante y glosarios como entradas auxiliares, y permite seleccionar entre estilo llano y estilo cortés en la salida en japonés, lo que lo hace útil para flujos de localización profesional donde la terminología y el registro deben controlarse.

Su relevancia actual radica en que se distribuye como una familia completa de cuatro tamaños (0,8B, 2B, 8B y 31B) con variantes cuantizadas oficiales (FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit), lo que permite desplegarlo desde entornos de altas prestaciones hasta hardware de consumo. La longitud máxima durante el entrenamiento fue de 32.768 tokens combinando entrada y salida, suficiente para traducir pasajes largos en una sola pasada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia PLaMo 3, requiere `custom_code`; detalles de capas y atención no disponibles en la información proporcionada) |
| Parametros totales | 31.757.456.384 (31,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (máximo durante entrenamiento, entrada + salida combinadas) |
| Tipos de cuantizacion | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF (incluye Q2_K), MLX-4bit |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (uso personal, educativo y académico gratuito sin registro; condiciones comerciales aparte) |
| Formato de pesos | safetensors (BF16 y variantes cuantizadas), GGUF, MLX |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia PLaMo 3, inicializado a partir de PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT. Sobre esa base, PFN realizó un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traducción, lo que convierte al modelo en un especialista de dominio en lugar de un LLM generalista. La información disponible no detalla el número exacto de capas, dimensiones ocultas, mecanismo de atención ni la composición exacta del corpus de entrenamiento.

Un aspecto técnico destacable es la ventana de entrenamiento de 32.768 tokens que abarca entrada y salida conjuntamente, lo que condiciona el diseño de los pipelines de traducción: el autor recomienda dividir cualquier texto cuya entrada más salida supere ese límite. El modelo acepta además contexto circundante y glosarios como parte de la entrada, y expone un control de estilo (llano o cortés) para la salida en japonés. No se especifica en la información proporcionada si hubo fases de RLHF, DPO u otras técnicas de alineación, ni detalles sobre decodificación especulativa o atención lineal.

## Capacidades

- Traducción entre 53 idiomas en cualquier par soportado, con calidad destacada en japonés-inglés y en combinaciones japonés/lenguaje y inglés/lenguaje.
- Traducción con contexto circundante: permite pasar texto previo o posterior para desambiguar y mantener coherencia en documentos largos.
- Traducción asistida por glosario: admite términos y traducciones forzadas para mantener terminología consistente.
- Control de estilo en japonés: elección entre registro llano y registro cortés en la salida.
- Procesamiento de pasajes largos: hasta 32.768 tokens combinando entrada y salida en una sola pasada.
- Capacidad multilingüe amplia que cubre lenguas europeas, eslavas, túrquicas, semíticas, del sur de Asia, del sudeste asiático y del este de Asia.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito; el pipeline declarado es exclusivamente `translation`.

## Casos de uso

- Localización de documentación técnica: el modelo puede traducir manuales y guías manteniendo terminología consistente mediante el uso de glosarios, con pasajes de hasta 32.768 tokens combinados por llamada.
- Traducción de subtítulos y guiones: el control de estilo llano o cortés en japonés y el contexto circundante permiten ajustar el registro de cada intervención según el personaje o la escena.
- Atención al cliente multilingüe: integrado como capa de traducción en sistemas de soporte, permite atender consultas en 53 idiomas traduciendo tanto la entrada del usuario como la respuesta del agente.
- Traducción jurada o legal asistida: el glosario permite fijar terminología jurídica y el contexto largo ayuda a mantener coherencia en contratos y expedientes de varias páginas, con revisión humana posterior.
- Comercio electrónico internacional: traducción de fichas de producto, descripciones y reseñas entre los 53 idiomas soportados, con la variante 8B o 2B para despliegues de menor coste y la 31B para máxima calidad.
- Investigación en traducción automática: el modelo sirve como sistema de referencia especializado para evaluar técnicas de cuantización, ya que el autor publica comparativas de precisión entre BF16, FP8, W4A16, W4AFP8, NVFP4 y GGUF.
- Traducción de contenido editorial y periodístico: la ventana de 32.768 tokens permite procesar artículos completos en una sola pasada, y el contexto circundante ayuda a resolver referencias anafóricas entre párrafos.
- Despliegue en local para privacidad de datos: las variantes GGUF y MLX-4bit permiten ejecutar la traducción en estaciones de trabajo o equipos Apple sin enviar el texto a servicios externos.

## Benchmarks y rendimiento

El autor publica comparativas gráficas frente a TranslateGemma y HY-MT2, pero los valores numéricos no están incluidos en la información proporcionada; solo se describe la metodología. La tabla de cuantización del README para el tamaño 31B aparece truncada en el momento del corte del texto, por lo que no se pueden reproducir sus cifras.

| Evaluación | Métrica | Resultado |
|---|---|---|
| Japonés-inglés | Media de PFTB, SaaS y WMT24++ COMET-22 | no disponible (solo gráfico en el README) |
| Japonés ↔ 14 idiomas | Media de FLORES+ chrF++ en ambas direcciones | no disponible (solo gráfico en el README) |
| Inglés ↔ 14 idiomas | Media de FLORES+ chrF++ en ambas direcciones | no disponible (solo gráfico en el README) |
| Comparativa de cuantización 31B | PFTB (En↔Ja) y resto de métricas | no disponible (tabla truncada en la información recibida) |

Los 14 idiomas evaluados en FLORES+ junto con japonés e inglés son: árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino simplificado, chino tradicional, alemán, francés, vietnamita y ruso. El autor afirma que incluso el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas de la figura, pero no se aportan los números concretos.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 63,5 GB solo para pesos (el repositorio ocupa 63,5 GB), por lo que se necesitan GPUs de 80 GB o múltiples GPUs para inferencia sin cuantizar.
- VRAM estimada en FP8: alrededor de 32 GB para pesos, viable en una A100 40GB, L40S 48GB o H100.
- VRAM estimada en W4A16, W4AFP8 o NVFP4: del orden de 16-20 GB para pesos, lo que permite ejecución en RTX 4090 (24 GB), RTX 5090, L4 o A10G, con margen variable para KV cache según longitud de contexto.
- VRAM estimada en GGUF Q2_K: el autor advierte de que esta cuantización pierde precisión en algunas métricas; el resto de formatos GGUF se mantienen cerca de BF16.
- GPUs recomendadas: H100 80GB o A100 80GB para BF16; A100 40GB, L40S o H100 para FP8; RTX 4090, RTX 5090 o L4 para cuantizaciones de 4 bits.
- Cabe en GPU de consumo: sí, en el caso de las variantes W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit; no en BF16.
- Opciones de despliegue: transformers con `trust_remote_code` (requiere `custom_code`), llama.cpp u Ollama para GGUF, MLX para Apple Silicon, y servidores compatibles con safetensors cuantizados (vLLM y TGI no se confirman en la información disponible para esta arquitectura concreta).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 31B | 31,7B | 32.768 (entrada + salida) | 53 | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| PLaMo 3 Translate 8B | no disponible | 32.768 (entrada + salida) | 53 | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| PLaMo 3 Translate 2B | no disponible | 32.768 (entrada + salida) | 53 | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

TranslateGemma y HY-MT2 se mencionan como sistemas de comparación en la evaluación del autor, pero la información proporcionada no incluye sus especificaciones, licencias ni resultados numéricos, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en traducción: no está diseñado como asistente general, por lo que no debe esperarse razonamiento libre, generación creativa ni soporte de herramientas.
- Límite estricto de 32.768 tokens combinando entrada y salida: los documentos más largos deben dividirse, con el riesgo de perder coherencia entre fragmentos si no se aporta contexto circundante.
- La cuantización GGUF Q2_K reduce la precisión de traducción en algunas métricas según el propio autor; para producción se recomienda FP8, W4A16, W4AFP8, NVFP4 o GGUF de mayor bit depth.
- Licencia PLaMo Community License: el uso personal, educativo y académico es gratuito sin registro, pero el uso comercial está sujeto a condiciones adicionales que deben revisarse en el enlace oficial antes de desplegar en producción.
- Riesgo de alucinación y de omisión de contenido en pasajes largos o con terminología muy específica; se recomienda revisión humana en contextos legales, médicos o jurados.
- No se documentan en la información disponible evaluaciones de sesgo, robustez frente a prompts adversarios ni comportamiento en idiomas de bajos recursos más allá de los 14 seleccionados para FLORES+.
- La arquitectura requiere `custom_code` y `trust_remote_code=True` en transformers, lo que implica ejecutar código del autor y complica la integración con algunos servidores de inferencia.
- El rendimiento real en pares de idiomas distintos de japonés-inglés no está cuantificado en la información disponible, más allá de las medias agregadas de FLORES+.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-31b
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-31b/blob/main/README_ja.md
- Blog técnico de PFN sobre la publicación de pesos: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community License (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- Variante 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante 2B: https://huggingface.co/pfnet/plamo-3-translate-2b
- Variante 8B: https://huggingface.co/pfnet/plamo-3-translate-8b
- Variante 31B FP8: https://huggingface.co/pfnet/plamo-3-translate-31b-FP8
- Variante 31B W4A16: https://huggingface.co/pfnet/plamo-3-translate-31b-W4A16
- Variante 31B W4AFP8: https://huggingface.co/pfnet/plamo-3-translate-31b-W4AFP8
- Variante 31B NVFP4: https://huggingface.co/pfnet/plamo-3-translate-31b-NVFP4
- Variante 31B GGUF: https://huggingface.co/pfnet/plamo-3-translate-31b-GGUF
- Variante 31B MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-31b-MLX-4bit
