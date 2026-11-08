# pfnet/plamo-3-translate-8b-FP8

## Resumen

PLaMo 3 Translate 8B FP8 es la variante cuantizada a FP8 de PLaMo 3 Translate 8B, un modelo de lenguaje especializado en traducción desarrollado por Preferred Networks (PFN) en colaboración con el National Institute of Information and Communications Technology (NICT) de Japón. El modelo parte de PLaMo 3 NICT, un modelo preentrenado fruto de esa investigación conjunta, y se ha entrenado adicionalmente sobre decenas de miles de millones de tokens de datos orientados a traducción. La versión FP8 cuantiza pesos y activaciones, manteniendo el mismo comando de lanzamiento en vLLM que la versión BF16.

El modelo cubre traducción entre 53 idiomas, con especial énfasis en la calidad japonés-inglés y en combinaciones multilingües que incluyen el español. Admite contexto adicional y glosarios como entrada, y permite elegir entre estilo llano y estilo cortés para la salida en japonés. La longitud máxima durante el entrenamiento fue de 32.768 tokens sumando entrada y salida, lo que permite traducir pasajes largos en una sola pasada.

Con 8.531.750.912 parámetros y un repositorio de 9,4 GB, esta variante FP8 resulta relevante para despliegues en producción que necesitan reducir huella de memoria y aprovechar aceleración FP8 en GPUs Hopper o Ada Lovelace sin renunciar a la calidad del modelo completo. La licencia PLaMo Community License permite uso personal, académico y no comercial sin registro previo, con condiciones específicas para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de lenguaje especializado en traducción, código custom `plamo3`); detalles internos no disponibles |
| Parámetros totales | 8.531.750.912 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (máximo durante entrenamiento, entrada + salida combinadas) |
| Tipos de cuantización | FP8 (pesos y activaciones); existen también BF16, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit en repositorios separados |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (uso personal, académico y no comercial gratuito sin registro; condiciones para uso comercial) |
| Formato de pesos | safetensors (FP8), librería transformers con código custom |

## Arquitectura y entrenamiento

PLaMo 3 Translate 8B se construye sobre PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT. Sobre esa base, PFN realizó un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traducción, lo que especializa el modelo para la tarea de traducción multilingüe en lugar de generación general. La model card no detalla la arquitectura interna más allá de la etiqueta `plamo3` y el uso de código custom en transformers, por lo que no se dispone de información sobre tipo de atención, número de capas o composición exacta del dataset.

La innovación principal es la especialización: el modelo acepta contexto circundante y glosarios para desambiguar términos, y ofrece control de estilo (llano o cortés) en la salida japonesa. El límite de entrenamiento de 32.768 tokens combinados entrada/salida condiciona el diseño de los pipelines: los documentos más largos deben dividirse. La variante FP8 cuantiza pesos y activaciones, y la model card indica que el comando de lanzamiento en vLLM es idéntico al de la versión BF16. No se especifica en la información disponible si hubo RLHF, DPO u otras etapas de alineación.

## Capacidades

- Traducción entre 53 idiomas, con evaluación destacada en japonés-inglés y en combinaciones japonés/multilingüe e inglés/multilingüe.
- Traducción con contexto: puede tener en cuenta el texto circundante para resolver ambigüedades.
- Traducción con glosario: permite imponer terminología específica en la salida.
- Control de estilo en japonés: elección entre estilo llano y estilo cortés.
- Traducción de pasajes largos en una sola pasada, hasta 32.768 tokens combinados de entrada y salida.
- Cobertura multilingüe amplia, incluidos español, catalán y euskera entre los 53 idiomas.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito; el modelo está orientado a traducción.

## Casos de uso

- Localización de documentación técnica: traducir manuales y guías del inglés al español (y a otros 51 idiomas) pasando contexto adicional para mantener coherencia terminológica, con glosarios que fijen la traducción de términos de API o de dominio.
- Traducción de contratos y textos jurídicos: el soporte de glosario y contexto permite fijar terminología legal y mantener consistencia entre secciones, dividiendo el documento en bloques que respeten el límite de 32.768 tokens combinados.
- Atención al cliente multilingüe: traducir conversaciones y respuestas en tiempo real entre el español y los idiomas del catálogo, con el estilo de salida adecuado según el mercado.
- Subtitulado y doblaje: traducir guiones y subtítulos entre pares de idiomas del catálogo, usando el contexto de escenas anteriores para resolver referencias y mantener el registro.
- Comercio electrónico internacional: traducir fichas de producto, descripciones y reseñas a los 53 idiomas soportados, con glosarios por categoría para nombres de producto y atributos.
- Investigación lingüística y evaluación de traducción: usar el modelo como sistema de referencia en experimentos con FLORES+, WMT24++ o corpus propios, dado su soporte de 53 idiomas y su disponibilidad en múltiples formatos de cuantización.
- Traducción de contenido editorial y prensa: procesar artículos largos en una sola pasada gracias a la ventana de 32.768 tokens, con contexto del medio y guía de estilo para mantener el tono.

## Benchmarks y rendimiento

La model card publica gráficas comparativas (PFTB, SaaS y WMT24++ COMET-22 para japonés-inglés; FLORES+ chrF++ para japonés y inglés frente a 14 idiomas) en las que PLaMo 3 Translate supera a TranslateGemma y HY-MT2, e indica que incluso el modelo de 2B supera a los LLM especializados en traducción comparados. Sin embargo, los valores numéricos concretos no están disponibles en el texto proporcionado, por lo que no se reproducen cifras.

| Evaluación | Métrica | Resultado |
|---|---|---|
| Japonés-inglés | Media de PFTB, SaaS y WMT24++ COMET-22 | no disponible (solo gráfica comparativa) |
| Japonés frente a 14 idiomas | FLORES+ chrF++ (ambas direcciones) | no disponible (solo gráfica comparativa) |
| Inglés frente a 14 idiomas | FLORES+ chrF++ (ambas direcciones) | no disponible (solo gráfica comparativa) |

Los 15 idiomas evaluados en FLORES+ son: japonés, inglés, árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino simplificado y tradicional, alemán, francés, vietnamita y ruso.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 9-10 GB solo para pesos (8,53 mil millones de parámetros a 1 byte por parámetro), más overhead de activaciones y caché KV; con contexto largo la demanda crece de forma apreciable.
- GPU recomendadas: H100, H200, L40S y otras GPUs con soporte nativo de FP8 (Hopper y Ada Lovelace) para aprovechar la cuantización; A100 no dispone de FP8 nativo y requeriría conversión o ejecución en BF16.
- GPUs de consumo: una RTX 4090 (24 GB) puede alojar los pesos FP8 con margen para contexto moderado; una RTX 4080 (16 GB) queda justa y probablemente requiera reducir contexto o usar una cuantización de 4 bits (W4A16, W4AFP8, NVFP4 o GGUF).
- Opciones de despliegue: vLLM (soporte indicado explícitamente, con el mismo comando que la versión BF16), transformers con código custom; para formatos alternativos existen GGUF (llama.cpp/Ollama) y MLX-4bit en repositorios separados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 8B FP8 | 8,53 B | 32.768 (entrada + salida) | 53 | PLaMo Community License | FP8, BF16, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| PLaMo 3 Translate 2B | no disponible | 32.768 (entrada + salida) | 53 | PLaMo Community License | FP8, BF16, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| PLaMo 3 Translate 31B | no disponible | 32.768 (entrada + salida) | 53 | PLaMo Community License | FP8, BF16, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card sitúa a PLaMo 3 Translate por delante de TranslateGemma y HY-MT2 en las métricas evaluadas, pero no ofrece fichas técnicas de esos modelos en la información disponible. La comparación más directa es dentro de la propia familia: el 8B ofrece más capacidad que el 2B y el 0.8B, y menos que el 31B, todos con el mismo contexto y cobertura de idiomas.

## Limitaciones y advertencias

- El límite de 32.768 tokens es combinado de entrada y salida; los documentos más largos deben dividirse, lo que puede romper la coherencia entre fragmentos si no se aporta contexto.
- El modelo está especializado en traducción; no se documentan capacidades de generación general, razonamiento, código o tool calling, por lo que no debe asumirse su uso como LLM de propósito general.
- Riesgo de alucinación y de traducciones plausibles pero incorrectas en dominios muy técnicos o con terminología poco frecuente; el uso de glosarios mitiga parcialmente este riesgo.
- Posibles sesgos heredados de los datos de preentrenamiento y de los corpus de traducción; la model card no detalla análisis de sesgo.
- La licencia PLaMo Community License permite uso personal, académico y no comercial sin registro, pero el uso comercial está sujeto a condiciones adicionales que deben revisarse antes de desplegar en producción.
- La cuantización FP8 puede introducir pequeñas degradaciones de calidad respecto a BF16; la model card incluye tablas de diferencias de precisión por formato, pero los valores no están disponibles en la información proporcionada.
- El soporte FP8 depende del hardware; en GPUs sin FP8 nativo el rendimiento puede no ser el esperado.
- El modelo requiere código custom (`plamo3`) en transformers, lo que puede complicar la integración con herramientas que no lo soporten.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-8b-FP8
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-8b
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community License: https://plamo.preferredai.jp/info/plamo-community-license-en
- README en japonés: README_ja.md (en el repositorio del modelo)
- Variantes de la familia: plamo-3-translate-0.8b, plamo-3-translate-2b, plamo-3-translate-31b y sus versiones FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit en Hugging Face (pfnet)
