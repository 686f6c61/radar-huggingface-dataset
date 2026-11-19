# pfnet/plamo-3-translate-0.8b

## Resumen

PLaMo 3 Translate 0.8B es un modelo de traducción especializado desarrollado por Preferred Networks (PFN), construido sobre el modelo preentrenado PLaMo 3 NICT, fruto de una investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón. Sobre esa base, PFN continuó el entrenamiento con decenas de miles de millones de tokens de datos centrados en traducción, lo que da lugar a un modelo de propósito específico para traducción automática multilingüe.

El modelo cubre 53 idiomas y, además de la traducción directa, acepta contexto circundante y glosarios como entradas, y permite elegir entre estilo llano y estilo cortés para la salida en japonés. La longitud máxima durante el entrenamiento fue de 32.768 tokens sumando entrada y salida, lo que permite traducir pasajes largos en una sola pasada siempre que el total no supere ese límite.

Con 890.344.960 parámetros reales (según safetensors), el 0.8B es la variante más pequeña de una familia que también incluye tamaños de 2B, 8B y 31B, cada uno con variantes cuantizadas y convertidas (FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit). Su relevancia actual reside en que ofrece calidad de traducción de nivel competitivo en un tamaño que cabe en hardware modesto, con licencia comunitaria que permite uso personal y académico sin registro previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia PLaMo 3, requiere `custom_code`); detalles internos no disponibles |
| Parametros totales | 890.344.960 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (máximo durante entrenamiento, entrada + salida combinadas) |
| Tipos de cuantizacion | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit (en repositorios separados) |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (uso personal, académico y no comercial gratuito sin registro; condiciones comerciales aparte) |
| Formato de pesos | safetensors (BF16 en este repo); GGUF y MLX en repositorios derivados |

## Arquitectura y entrenamiento

La información disponible confirma que PLaMo 3 Translate 0.8B es un modelo de la familia PLaMo 3, con arquitectura transformer decoder-only y código personalizado (`custom_code`), lo que implica que requiere cargar código propio del repositorio para su uso con `transformers`. No se detallan en la información proporcionada el número de capas, dimensiones ocultas, mecanismo de atención ni innovaciones específicas de arquitectura (atención lineal, decodificación especulativa, etc.).

El entrenamiento parte de PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT, sobre el que se realizó un entrenamiento adicional con decenas de miles de millones de tokens de datos orientados a traducción. La longitud máxima de entrenamiento fue de 32.768 tokens combinando entrada y salida. No se especifica en la información disponible si hubo fases de RLHF, DPO u otras técnicas de alineación, ni la composición exacta del dataset más allá de su carácter centrado en traducción.

## Capacidades

- Traducción entre 53 idiomas, incluyendo pares con japonés, inglés, español, chino (simplificado y tradicional), árabe, coreano, tailandés, vietnamita, ruso, alemán, francés, italiano y neerlandés, entre otros.
- Traducción con contexto circundante: el modelo puede aprovechar texto previo o posterior para desambiguar y mantener coherencia.
- Traducción asistida por glosario: permite imponer terminología específica en la salida.
- Control de estilo en japonés: elección entre estilo llano y estilo cortés (keigo).
- Traducción de pasajes largos en una sola pasada, hasta 32.768 tokens combinando entrada y salida.
- Capacidad multilingüe amplia con cobertura de idiomas de Asia meridional y sudoriental, Europa del Este, Cáucaso y Asia Central.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, agentes, visión ni audio.

## Casos de uso

- Localización de documentación técnica: traducción de manuales y guías largas en una sola pasada gracias a la ventana de 32.768 tokens combinados, con glosario para mantener terminología consistente entre secciones.
- Traducción de subtítulos y guiones con contexto: el modelo puede recibir las líneas previas y posteriores para resolver referencias y mantener coherencia de registro en series o películas.
- Atención al cliente multilingüe: traducción en tiempo real de conversaciones de soporte entre el idioma del cliente y el del agente, con control de estilo cortés en japonés para comunicaciones formales.
- Traducción de contratos y textos legales con glosario: la posibilidad de imponer terminología específica reduce variaciones indeseadas en documentos jurídicos o técnicos.
- Procesamiento por lotes en pipelines de datos: al ser un modelo de 0.8B, puede desplegarse en GPU de consumo para traducir grandes volúmenes de texto (corpus, reseñas, tickets) con coste reducido.
- Traducción en el borde o en local: las variantes GGUF y MLX-4bit permiten ejecución en portátiles y equipos Apple Silicon para herramientas de traducción personal, sin depender de servicios en la nube.
- Enriquecimiento de catálogos de comercio electrónico: traducción de fichas de producto a decenas de idiomas manteniendo nombres de marca y especificaciones mediante glosario.

## Benchmarks y rendimiento

La model card incluye gráficas comparativas frente a TranslateGemma y HY-MT2, pero los valores numéricos no están disponibles en el texto proporcionado. Las métricas empleadas son:

| Evaluación | Métrica | Idiomas evaluados |
|---|---|---|
| Japonés–inglés | Media de PFTB, SaaS y WMT24++ COMET-22 | ja, en |
| Japonés ↔ 14 idiomas | Media de FLORES+ chrF++ en ambas direcciones | ja, en, ar, id, it, nl, ko, es, th, zh (simplificado y tradicional), de, fr, vi, ru |
| Inglés ↔ 14 idiomas | Media de FLORES+ chrF++ en ambas direcciones | mismos 15 idiomas |

Según la model card, incluso el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas de la figura. No se han publicado en la información disponible los valores numéricos concretos de estos benchmarks para el 0.8B.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,8 GB solo para pesos, más memoria para el contexto (hasta 32.768 tokens), lo que puede elevar el uso total a varios GB según implementación.
- VRAM estimada en cuantizaciones de 4 bits (W4A16, W4AFP8, NVFP4, GGUF Q4, MLX-4bit): en torno a 0,5–1 GB para pesos, holgadamente dentro de cualquier GPU de consumo moderna.
- GPU recomendadas: cualquier GPU con al menos 4–8 GB de VRAM para BF16 con contexto moderado; RTX 3060/4060, RTX 4090, A100, H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones de 4 y 8 bits; en BF16 también en GPU de gama media con contexto reducido.
- Opciones de despliegue: `transformers` (requiere `custom_code`), llama.cpp/Ollama vía los repositorios GGUF, MLX para Apple Silicon, y presumiblemente vLLM/TGI para las variantes FP8 y NVFP4 (no confirmado en la información disponible).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 0.8B | 0,89B | 32.768 | 53 | PLaMo Community License | safetensors, GGUF, MLX, FP8, NVFP4 |
| PLaMo 3 Translate 2B | no disponible | 32.768 | 53 | PLaMo Community License | safetensors, GGUF, MLX, FP8, NVFP4 |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

TranslateGemma y HY-MT2 aparecen como referencias de comparación en la model card, pero no se dispone en la información proporcionada de sus parámetros, contexto, licencia ni formatos. La familia PLaMo 3 Translate ofrece cuatro tamaños (0.8B, 2B, 8B, 31B) con el mismo conjunto de formatos cuantizados, lo que facilita escalar según requisitos de calidad y hardware.

## Limitaciones y advertencias

- Modelo especializado en traducción: no está diseñado como asistente general y no se documentan capacidades de razonamiento, código, tool calling ni agentes.
- Límite de 32.768 tokens combinando entrada y salida: los documentos más largos deben dividirse, con el riesgo de perder coherencia entre fragmentos.
- Riesgo de alucinación y de omisiones en textos ambiguos o muy especializados, inherente a los modelos neuronales de traducción; conviene revisión humana en dominios críticos.
- Sesgos potenciales heredados de los datos de preentrenamiento y de traducción; no se detalla en la información disponible qué sesgos se han evaluado.
- Licencia PLaMo Community License: el uso personal, académico y no comercial es gratuito sin registro, pero el uso comercial requiere consultar las condiciones específicas en el enlace de licencia.
- Requiere `custom_code` para cargarse con `transformers`, lo que añade complejidad de despliegue frente a modelos estándar.
- La cuantización GGUF Q2_K muestra menor precisión de traducción en algunas métricas según la model card; para producción se recomienda Q4 o superior.
- No se dispone de información sobre latencia, throughput ni comportamiento en dominios muy alejados de los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-0.8b/blob/main/README_ja.md
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community License: https://plamo.preferredai.jp/info/plamo-community-license-en
- Variante FP8: https://huggingface.co/pfnet/plamo-3-translate-0.8b-FP8
- Variante W4A16: https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4A16
- Variante W4AFP8: https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4AFP8
- Variante NVFP4: https://huggingface.co/pfnet/plamo-3-translate-0.8b-NVFP4
- Variante GGUF: https://huggingface.co/pfnet/plamo-3-translate-0.8b-GGUF
- Variante MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-0.8b-MLX-4bit
