# pfnet/plamo-3-translate-0.8b

## Resumen

PLaMo 3 Translate 0.8B es un modelo de lenguaje especializado en traducción desarrollado por Preferred Networks (PFN). Se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón. Sobre esa base, PFN aplicó un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traducción, lo que da como resultado un modelo con 890 millones de parámetros orientado específicamente a tareas de traducción automática.

El modelo cubre 53 idiomas y permite incorporar contexto circundante y glosarios en la petición, además de elegir entre estilo llano y estilo cortés para la salida en japonés. La longitud máxima durante el entrenamiento fue de 32.768 tokens sumando entrada y salida, lo que permite traducir pasajes largos en una sola pasada siempre que el total no supere ese límite.

Su relevancia actual radica en que ofrece calidad de traducción de primer nivel en un tamaño reducido (0,8B), lo que lo hace desplegable en hardware modesto y adecuado para pipelines de traducción de alto volumen. Forma parte de una familia de cuatro tamaños (0,8B, 2B, 8B y 31B) con variantes cuantizadas publicadas en repositorios separados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia PLaMo 3, requiere `custom_code`; detalles de capas y atención no disponibles) |
| Parametros totales | 890.344.960 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (entrada + salida combinadas, límite de entrenamiento) |
| Tipos de cuantizacion | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF (incluye Q2_K), MLX-4bit |
| Idiomas soportados | 53 idiomas (ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh) |
| Licencia | PLaMo Community License |
| Formato de pesos | safetensors (BF16, FP8, W4A16, W4AFP8, NVFP4), GGUF, MLX |

## Arquitectura y entrenamiento

El modelo se basa en PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT. Sobre esa base, PFN realizó un entrenamiento adicional con decenas de miles de millones de tokens de datos enfocados en traducción. La model card no detalla el número exacto de capas, la configuración de atención ni la composición completa del dataset de preentrenamiento; tampoco especifica si se aplicaron técnicas de RLHF o DPO. La arquitectura concreta requiere cargar código personalizado (`custom_code`) a través de la librería `transformers`.

La innovación principal no es arquitectónica sino de especialización: el modelo incorpora de forma nativa mecanismos de control de la traducción que van más allá de la traducción literal, como la posibilidad de pasar contexto circundante y glosarios, y la selección de registro (llano o cortés) para la salida en japonés. El límite de 32.768 tokens combinados de entrada y salida durante el entrenamiento condiciona el diseño de los pipelines: los documentos más largos deben dividirse para que entrada y salida queden dentro de ese margen.

## Capacidades

- Traducción entre 53 idiomas, incluyendo pares que no pasan por el inglés.
- Traducción con contexto circundante: permite pasar texto adicional para desambiguar términos y mantener coherencia.
- Traducción con glosario: admite un glosario para forzar terminología concreta.
- Control de estilo en japonés: elección entre registro llano y cortés.
- Traducción de pasajes largos en una sola pasada (hasta 32.768 tokens combinados de entrada y salida).
- Capacidades multilingües amplias, con cobertura de idiomas de Asia oriental, Asia meridional, Europa del Este, Europa occidental, Oriente Medio y el Sudeste Asiático.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Traducción de documentación técnica a gran escala: el modelo puede procesar secciones completas en una sola pasada gracias al límite de 32.768 tokens combinados, lo que reduce la fragmentación y preserva la coherencia terminológica dentro de cada sección.
- Localización de software con glosario: al aceptar un glosario en la petición, se puede forzar la traducción consistente de términos de interfaz, nombres de producto y cadenas de error en todos los idiomas soportados.
- Atención al cliente multilingüe: con 53 idiomas y un tamaño de 0,8B, es viable desplegarlo para traducir conversaciones de soporte en tiempo real con coste de inferencia bajo.
- Traducción de contenido editorial con control de registro: la opción de estilo llano o cortés en japonés resulta útil para adaptar el tono de artículos, correos y materiales de marketing al público objetivo.
- Procesamiento por lotes en pipelines de datos: su reducido tamaño permite ejecutar traducciones masivas en GPU de consumo o incluso en CPU con cuantización GGUF, lo que abarata el procesamiento de corpus grandes.
- Traducción asistida en entornos con requisitos de privacidad: al poder ejecutarse localmente con cuantizaciones W4A16 o GGUF, es apto para organizaciones que no pueden enviar texto sensible a APIs externas.
- Investigación en traducción automática: sirve como modelo de referencia pequeño y especializado para experimentos de evaluación y comparación con modelos mayores de la misma familia.

## Benchmarks y rendimiento

La model card indica que PLaMo 3 Translate ofrece calidad de primer nivel tanto en japonés-inglés como en traducción multilingüe, y que incluso el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas de la figura publicada. Las métricas empleadas son:

- Calidad japonés-inglés: media de PFTB, SaaS y WMT24++ con COMET-22.
- Traducción entre japonés y otros 14 idiomas: media de FLORES+ chrF++ en ambas direcciones.
- Traducción entre inglés y otros 14 idiomas: media de FLORES+ chrF++ en ambas direcciones.

Los 15 idiomas seleccionados para la evaluación FLORES+ son: japonés, inglés, árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino (simplificado y tradicional), alemán, francés, vietnamita y ruso. Los valores numéricos concretos de los benchmarks no están disponibles en la información proporcionada, ya que se presentan únicamente en una figura del repositorio y en el blog técnico. La model card también señala que la cuantización GGUF Q2_K muestra menor precisión en algunas métricas, mientras que el resto de formatos se mantienen cerca de BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV; en FP8, alrededor de 0,9 GB; en W4A16 y W4AFP8, en torno a 0,5 GB; en NVFP4, cifras similares a las de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones de 4 bits; una RTX 4090 o A100/H100 no son necesarias para este tamaño, pero permiten mayor throughput en lotes grandes.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 y superiores, e incluso en iGPU con cuantización GGUF.
- Opciones de despliegue: `transformers` (requiere `custom_code`), llama.cpp/Ollama mediante los pesos GGUF, MLX para Apple Silicon con la variante MLX-4bit, y servidores compatibles con GGUF para producción.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 0.8B | 890 M | 32.768 (entrada + salida) | 53 | PLaMo Community License | safetensors, GGUF, MLX |
| PLaMo 3 Translate 2B | no disponible | no disponible | 53 | PLaMo Community License | safetensors, GGUF, MLX |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card menciona TranslateGemma y HY-MT2 como modelos de traducción especializados frente a los que se compara, pero no proporciona sus especificaciones técnicas ni sus resultados numéricos en la información disponible. Tampoco se detallan los parámetros y el contexto de las variantes mayores de la propia familia PLaMo 3 Translate.

## Limitaciones y advertencias

- La licencia PLaMo Community License permite uso personal, académico y no comercial sin registro previo, pero el uso comercial está sujeto a condiciones adicionales que deben consultarse en el enlace de la licencia.
- El límite de 32.768 tokens es combinado de entrada y salida; los documentos más largos deben dividirse, lo que puede afectar a la coherencia entre fragmentos.
- La cuantización GGUF Q2_K presenta menor precisión en algunas métricas de traducción; para producción se recomienda FP8, W4A16, W4AFP8 o NVFP4, que se mantienen cerca de BF16.
- No se documentan en la información disponible los sesgos conocidos del modelo, su tasa de alucinación ni el comportamiento en idiomas de bajos recursos dentro de los 53 soportados.
- Al ser un modelo especializado en traducción, no se documentan capacidades de tool calling, agentes, razonamiento general ni multimodalidad; no debe asumirse que las tenga.
- Requiere cargar código personalizado (`custom_code`) con `transformers`, lo que implica confiar en la implementación del autor y verificar la compatibilidad de versiones.
- No se han publicado en la información disponible datos sobre latencia, throughput ni requisitos exactos de VRAM medidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Blog técnico: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community: https://plamo.preferredai.jp/info/plamo-community-license-en
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-0.8b/blob/main/README_ja.md
- Variante FP8: https://huggingface.co/pfnet/plamo-3-translate-0.8b-FP8
- Variante W4A16: https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4A16
- Variante W4AFP8: https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4AFP8
- Variante NVFP4: https://huggingface.co/pfnet/plamo-3-translate-0.8b-NVFP4
- Variante GGUF: https://huggingface.co/pfnet/plamo-3-translate-0.8b-GGUF
- Variante MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-0.8b-MLX-4bit
- Modelo 2B: https://huggingface.co/pfnet/plamo-3-translate-2b
- Modelo 8B: https://huggingface.co/pfnet/plamo-3-translate-8b
- Modelo 31B: https://huggingface.co/pfnet/plamo-3-translate-31b
