# pfnet/plamo-3-translate-8b

## Resumen

PLaMo 3 Translate 8B es un modelo de lenguaje especializado en traducción desarrollado por Preferred Networks (PFN), construido sobre el modelo preentrenado PLaMo 3 NICT, fruto de una investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón. Con 8.531.750.912 parámetros, está diseñado para ofrecer traducción de alta calidad entre 53 idiomas, incluyendo pares que no involucran al inglés.

El modelo se ha entrenado adicionalmente sobre decenas de miles de millones de tokens de datos centrados en traducción, lo que lo posiciona como una alternativa especializada frente a modelos generalistas. Soporta contexto conversacional y glosarios, permite elegir entre estilo llano y cortés en la salida en japonés, y admite traducción de pasajes largos gracias a una longitud máxima de 32.768 tokens para entrada y salida combinadas.

Su relevancia actual radica en que combina un tamaño manejable (8B) con una cobertura lingüística amplia y una licencia comunitaria que permite uso personal, académico y no comercial sin registro previo, lo que facilita su adopción tanto en investigación como en prototipado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en PLaMo 3 NICT; detalles específicos de capas y atención no disponibles) |
| Parametros totales | 8.531.750.912 |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | 32.768 tokens (entrada + salida combinadas durante entrenamiento) |
| Tipos de cuantizacion | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF (incluye Q2_K), MLX-4bit |
| Idiomas soportados | 53 idiomas (ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh) |
| Licencia | plamo-community-license (uso personal y no comercial gratuito; condiciones comerciales aparte) |
| Formato de pesos | safetensors (BF16), FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit |

## Arquitectura y entrenamiento

PLaMo 3 Translate 8B se basa en PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT. Sobre esa base, PFN realizó un entrenamiento adicional con decenas de miles de millones de tokens de datos enfocados en traducción, lo que constituye la principal innovación del modelo: una especialización profunda en una tarea concreta en lugar de un ajuste superficial.

La longitud máxima durante el entrenamiento fue de 32.768 tokens para la entrada y la salida combinadas, lo que permite traducir pasajes largos en una sola pasada, aunque el autor recomienda dividir textos que excedan ese límite conjunto. No se dispone de información detallada sobre la composición exacta del dataset, el uso de RLHF/DPO ni innovaciones arquitectónicas específicas más allá de la base PLaMo 3 NICT.

## Capacidades

- Traducción entre 53 idiomas, incluyendo pares directos que no pasan por el inglés.
- Traducción de pasajes largos en una sola pasada (hasta 32.768 tokens combinados de entrada y salida).
- Uso de contexto circundante para desambiguar y mantener coherencia en la traducción.
- Soporte de glosarios para forzar terminología específica.
- Selección de estilo de salida en japonés: llano o cortés.
- Generación de texto multilingüe (el pipeline declarado es translation; capacidades generales de generación no detalladas).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Localización de documentación técnica: el modelo puede traducir manuales y guías completas en una sola pasada gracias a su ventana de 32.768 tokens, manteniendo coherencia terminológica mediante glosarios.
- Traducción de atención al cliente multilingüe: con 53 idiomas soportados, puede gestionar conversaciones y tickets en distintos idiomas sin depender de pares con inglés como pivote.
- Adaptación de contenido editorial: traducción de artículos y blogs con contexto circundante para resolver ambigüedades y preservar el tono, con opción de estilo cortés en japonés para audiencias formales.
- Subtitulado y traducción de transcripciones: al aceptar pasajes largos, puede procesar bloques extensos de diálogo manteniendo referencias entre turnos.
- Traducción jurídica o administrativa con glosario: el soporte de glosarios permite fijar terminología especializada y reducir variaciones indeseadas en documentos sensibles.
- Investigación en traducción automática: su licencia permite uso académico gratuito sin registro, lo que facilita experimentos de evaluación y comparación con otros sistemas.
- Prototipado de productos multilingües: las variantes cuantizadas (GGUF, MLX-4bit, FP8) permiten desplegar el modelo en hardware modesto para pruebas de concepto antes de escalar.

## Benchmarks y rendimiento

La model card indica que PLaMo 3 Translate ofrece calidad de "nivel mundial" en traducción japonés-inglés y multilingüe, y que incluso el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas de la figura publicada. Las métricas empleadas son:

- Calidad japonés-inglés: media de PFTB, SaaS y WMT24++ COMET-22.
- Traducción entre japonés y otros 14 idiomas: media de FLORES+ chrF++ en ambas direcciones.
- Traducción entre inglés y otros 14 idiomas: media de FLORES+ chrF++ en ambas direcciones.

Los 15 idiomas seleccionados para la evaluación FLORES+ son: japonés, inglés, árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino simplificado y tradicional, alemán, francés, vietnamita y ruso. Los valores numéricos concretos de los benchmarks no están disponibles en la información proporcionada; la model card remite a una figura y al blog técnico.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 17 GB solo para pesos (tamaño del repo: 17,1 GB), más overhead de activaciones y caché KV para contexto largo.
- VRAM estimada en FP8: aproximadamente 8,5 GB para pesos.
- VRAM estimada en W4A16 / W4AFP8 / NVFP4: aproximadamente 4-5 GB para pesos, más overhead.
- VRAM estimada en GGUF Q2_K: inferior a 4 GB para pesos, con pérdida de calidad en algunas métricas según el autor.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) puede ejecutar BF16 con contexto moderado, y GPUs de datacenter (A100, H100) son adecuadas para contexto largo y mayor throughput.
- Compatibilidad con GPU de consumo: sí, especialmente en cuantizaciones FP8, W4A16, W4AFP8, NVFP4 y GGUF; MLX-4bit para Apple Silicon.
- Opciones de despliegue: transformers (librería declarada), GGUF (compatible con llama.cpp y derivados), MLX, y formatos cuantizados para vLLM/TGI según disponibilidad de soporte (no confirmado en la información proporcionada).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 8B | 8,53B | 32.768 (entrada+salida) | 53 | plamo-community-license | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| PLaMo 3 Translate 2B | no disponible | 32.768 (entrada+salida) | 53 | plamo-community-license | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| PLaMo 3 Translate 31B | no disponible | 32.768 (entrada+salida) | 53 | plamo-community-license | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card menciona TranslateGemma y HY-MT2 como modelos de traducción comparados en sus evaluaciones, pero no se proporcionan sus especificaciones ni resultados numéricos en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; como modelo entrenado con datos web y de traducción, es previsible que herede sesgos de esas fuentes.
- Riesgo de alucinación: no cuantificado; en traducción puede generar contenido no presente en el original, especialmente en pasajes ambiguos o con terminología desconocida.
- Límite de contexto: la ventana de 32.768 tokens es conjunta para entrada y salida; textos más largos deben dividirse, lo que puede romper la coherencia entre fragmentos.
- Idiomas: aunque soporta 53 idiomas, la evaluación publicada se limita a 15 idiomas, por lo que la calidad en el resto no está verificada de forma explícita.
- Licencia: el uso comercial no es gratuito por defecto; requiere consultar los términos de la PLaMo Community License. El uso personal, académico y no comercial es gratuito sin registro previo.
- Cuantización: GGUF Q2_K muestra menor precisión en algunas métricas según el autor; para producción se recomienda FP8 o superiores.
- Requiere `trust_remote_code` o código personalizado (`custom_code` en los tags), lo que implica revisar el código antes de desplegar en entornos sensibles.
- No se documentan capacidades de tool calling, agentes ni multimodalidad; no debe asumirse que las tiene.

## Enlaces

- Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-8b
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-8b/blob/main/README_ja.md
- Blog técnico: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community: https://plamo.preferredai.jp/info/plamo-community-license-en
- Variante 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante 2B: https://huggingface.co/pfnet/plamo-3-translate-2b
- Variante 31B: https://huggingface.co/pfnet/plamo-3-translate-31b
- Variante FP8 8B: https://huggingface.co/pfnet/plamo-3-translate-8b-FP8
- Variante W4A16 8B: https://huggingface.co/pfnet/plamo-3-translate-8b-W4A16
- Variante W4AFP8 8B: https://huggingface.co/pfnet/plamo-3-translate-8b-W4AFP8
- Variante NVFP4 8B: https://huggingface.co/pfnet/plamo-3-translate-8b-NVFP4
- Variante GGUF 8B: https://huggingface.co/pfnet/plamo-3-translate-8b-GGUF
- Variante MLX-4bit 8B: https://huggingface.co/pfnet/plamo-3-translate-8b-MLX-4bit
