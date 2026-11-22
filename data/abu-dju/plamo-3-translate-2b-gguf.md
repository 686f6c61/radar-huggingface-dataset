# Abu-Dju/plamo-3-translate-2b-GGUF

## Resumen

PLaMo 3 Translate 2B GGUF es la conversión al formato GGUF del modelo PLaMo 3 Translate 2B, un LLM especializado en traducción desarrollado por Preferred Networks (PFN) y distribuido en este repositorio por el usuario Abu-Dju. El modelo base se construyó a partir de PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) japonés, y posteriormente se entrenó sobre decenas de miles de millones de tokens de datos centrados en traducción. El resultado es un modelo de 2.878.595.584 parámetros (aproximadamente 2,9B) orientado a traducción multilingüe de alta calidad.

La relevancia de esta ficha radica en que el formato GGUF permite ejecutar el modelo en llama.cpp y en toda la cadena de herramientas compatible (Ollama, LM Studio, etc.), lo que reduce la barrera de entrada para desplegar traducción de calidad en hardware de consumo. El modelo soporta 53 idiomas, acepta contexto adicional y glosarios, y permite elegir entre estilo llano y cortés en la salida en japonés. La longitud máxima durante el entrenamiento fue de 32.768 tokens combinando entrada y salida.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una publicación muy reciente (creado el 22 de noviembre de 2026). La licencia es la PLaMo Community License, que permite uso personal, académico y no comercial sin registro previo, pero impone condiciones para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalles no especificados en la informacion proporcionada) |
| Parametros totales | 2.878.595.584 (aprox. 2,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (maximo durante entrenamiento, entrada + salida combinadas) |
| Tipos de cuantizacion | GGUF (el repositorio incluye conversiones cuantizadas; variantes concretas no detalladas en la informacion proporcionada) |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (plamo-community-license) |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo base PLaMo 3 Translate 2B parte de PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT. Sobre esa base, PFN realizó un entrenamiento adicional con decenas de miles de millones de tokens de datos orientados específicamente a traducción. La información disponible no detalla la arquitectura interna (número de capas, dimensiones, tipo de atención, uso de MoE o técnicas como decodificación especulativa), por lo que estos datos deben considerarse no disponibles. La longitud máxima manejada durante el entrenamiento fue de 32.768 tokens sumando entrada y salida, lo que permite traducir pasajes largos en una sola pasada siempre que el total no exceda ese límite.

El modelo incorpora dos capacidades de control destacables: la posibilidad de proporcionar contexto circundante y un glosario para guiar la traducción, y la selección entre estilo llano y cortés en la salida en japonés. No se especifica en la información proporcionada si hubo fases de RLHF, DPO u otras técnicas de alineación, ni la composición exacta del dataset de entrenamiento.

## Capacidades

- Traducción multilingüe entre 53 idiomas, incluyendo pares como japonés-inglés, inglés-chino, español-alemán, árabe-francés, entre muchos otros.
- Traducción bidireccional: el modelo puede traducir desde y hacia cualquiera de los idiomas soportados, no solo desde el inglés.
- Uso de contexto circundante: permite pasar texto adicional alrededor del fragmento a traducir para mejorar la coherencia y la desambiguación.
- Soporte de glosarios: el usuario puede proporcionar términos y sus traducciones preferidas para forzar terminología consistente.
- Control de estilo en japonés: elección entre registro llano (plain) y cortés (polite) en la salida.
- Traducción de pasajes largos: hasta 32.768 tokens combinados de entrada y salida en una sola pasada.
- Conversacional: el tag `conversational` sugiere que el modelo puede mantener formato de diálogo, aunque su función principal es la traducción.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede desplegarse en infraestructuras de inferencia compatibles con la API de Hugging Face.
- No se documentan en la información proporcionada capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de documentación técnica multilingüe: el modelo puede traducir manuales y guías entre los 53 idiomas soportados, usando glosarios para mantener consistencia terminológica en términos técnicos y nombres de producto.
- Localización de software y aplicaciones: integrado en pipelines de CI/CD, el modelo permite traducir cadenas de interfaz y archivos de recursos de forma automatizada, con la ventaja de que el formato GGUF se ejecuta en llama.cpp sin dependencias pesadas.
- Atención al cliente multilingüe: el modelo puede traducir mensajes de usuarios en tiempo real entre idiomas como español, árabe, chino o japonés, y el uso de contexto circundante ayuda a mantener coherencia en conversaciones multi-turno.
- Traducción de contenido editorial y periodístico: con capacidad para pasajes de hasta 32.768 tokens combinados, puede traducir artículos completos en una sola pasada, y el control de estilo en japonés permite adaptar el registro al medio de destino.
- Subtitulado y transcripción multilingüe: el modelo puede traducir segmentos de subtítulos entre idiomas, y el soporte de contexto circundante mejora la cohesión entre líneas consecutivas de un mismo diálogo.
- Investigación lingüística y evaluación de traducción: al ser un modelo pequeño (2,9B) y ejecutable en hardware de consumo, sirve como referencia para experimentos académicos y comparaciones de calidad de traducción sin requerir infraestructura de GPU de datacenter.
- Traducción jurídica o administrativa con glosario: el soporte de glosarios permite fijar terminología legal o institucional, reduciendo variaciones no deseadas en documentos sensibles.
- Despliegue en dispositivos con recursos limitados: la versión GGUF cuantizada puede ejecutarse en portátiles y estaciones de trabajo sin GPU dedicada de gama alta, lo que facilita prototipado y pruebas locales.

## Benchmarks y rendimiento

La model card menciona que PLaMo 3 Translate ofrece calidad de nivel mundial tanto en japonés-inglés como en traducción multilingüe, y que incluso el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas de la figura incluida en el repositorio. Las métricas citadas son:

- Fila superior: calidad japonés-inglés como media de PFTB, SaaS y WMT24++ COMET-22.
- Fila media: traducción entre japonés y otros 14 idiomas, media de FLORES+ chrF++ en ambas direcciones.
- Fila inferior: traducción entre inglés y otros 14 idiomas, media de FLORES+ chrF++ en ambas direcciones.

Los 15 idiomas seleccionados para la evaluación FLORES+ son: japonés, inglés, árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino (simplificado y tradicional), alemán, francés, vietnamita y ruso. Los modelos comparados mencionados son TranslateGemma y HY-MT2.

No se proporcionan en la información disponible los valores numéricos concretos de estos benchmarks, ni resultados de MMLU, HumanEval, GSM8K u otros benchmarks generales. Por tanto, no se presentan cifras que no estén publicadas en el material consultado.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 2,9B parámetros, las necesidades dependen de la cuantización. En BF16 serían aproximadamente 5,8 GB solo de pesos; en cuantizaciones de 4 bits (Q4) se reduciría a unos 1,5-2 GB de pesos, más overhead de contexto y KV cache.
- GPU recomendadas: no se especifican en la información proporcionada. Por tamaño, el modelo es apto para GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090, así como para GPUs profesionales (A100, H100) si se busca mayor throughput.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs con 6 GB o más de VRAM en cuantizaciones de 4 bits, y en GPUs con 8-12 GB en cuantizaciones mayores.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere también despliegue en endpoints gestionados.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PLaMo 3 Translate 2B GGUF | 2,9B | 32.768 tokens (entrada + salida) | 53 | PLaMo Community License | GGUF |
| PLaMo 3 Translate 0.8B | no disponible (aprox. 0,8B) | no disponible | 53 (misma familia) | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| PLaMo 3 Translate 8B | no disponible (aprox. 8B) | no disponible | 53 (misma familia) | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| PLaMo 3 Translate 31B | no disponible (aprox. 31B) | no disponible | 53 (misma familia) | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo detalla la familia PLaMo 3 Translate (0.8B, 2B, 8B, 31B) y menciona TranslateGemma y HY-MT2 como modelos de comparación en benchmarks, pero sin especificaciones técnicas de estos últimos. No se dispone de datos de parámetros, contexto ni licencia de esos modelos comparables.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada. Al ser un modelo entrenado sobre datos de traducción, puede heredar sesgos presentes en los corpus utilizados, pero no se detallan.
- Riesgo de alucinación: no se cuantifica en la información disponible. En tareas de traducción, el riesgo principal es la introducción de contenido no presente en el original o la omisión de matices, especialmente en pasajes largos o idiomas de bajos recursos.
- Limitaciones de contexto: el máximo es de 32.768 tokens combinando entrada y salida; los textos más largos deben dividirse. No se especifica el comportamiento en ventanas de contexto muy llenas.
- Limitaciones de idioma: aunque soporta 53 idiomas, la calidad puede variar entre pares; los benchmarks publicados se centran en 15 idiomas, por lo que el rendimiento en los 38 restantes no está cuantificado en la información disponible.
- Restricciones de licencia: la PLaMo Community License permite uso personal, académico y no comercial sin registro previo, pero el uso comercial está sujeto a condiciones adicionales que deben consultarse en el enlace de la licencia. No se debe asumir uso comercial libre.
- Caveats para producción: el repositorio tiene 0 descargas y 0 likes, lo que indica que es una conversión reciente y poco validada por la comunidad. Se recomienda evaluar la calidad de las cuantizaciones concretas antes de desplegar en producción, ya que la model card menciona que hay tablas de precisión comparando BF16 con cada formato de distribución, pero los valores no se incluyen en la información proporcionada.
- El modelo está especializado en traducción; no debe esperarse un rendimiento competitivo en tareas generales de razonamiento, código o matemáticas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Abu-Dju/plamo-3-translate-2b-GGUF
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-2b
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- llama.cpp: https://github.com/ggml-org/llama.cpp
- README en japonés: README_ja.md (referenciado en la model card, dentro del repositorio)
- Variantes de la familia PLaMo 3 Translate (0.8B, 8B, 31B) en BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX: enlaces listados en la tabla de la model card del repositorio.
