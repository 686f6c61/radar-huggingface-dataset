# pfnet/plamo-3-translate-8b-GGUF

## Resumen

PLaMo 3 Translate 8B GGUF es la versión cuantizada en formato GGUF del modelo de traducción especializado PLaMo 3 Translate 8B, desarrollado por Preferred Networks (PFN). El modelo base se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, y se ha entrenado adicionalmente con decenas de miles de millones de tokens de datos orientados a traducción. Esta variante GGUF está pensada para su uso con llama.cpp, lo que facilita el despliegue en entornos locales y en hardware consumer.

El modelo cubre traducción entre 53 idiomas, con especial énfasis en la calidad japonés-inglés y en combinaciones multilingües. Admite contexto adicional y glosarios como parte de la entrada, y permite seleccionar entre estilo llano y estilo cortés para la salida en japonés. La longitud máxima durante el entrenamiento fue de 32.768 tokens combinando entrada y salida, lo que permite traducir pasajes largos en una sola pasada siempre que se respete ese límite.

Con 8.531.750.912 parámetros totales, esta versión GGUF resulta relevante para quienes necesitan traducción de alta calidad sin depender de infraestructura en la nube, ya que puede ejecutarse con llama.cpp en GPUs de consumo y en CPU. La licencia PLaMo Community License permite uso personal, académico y no comercial sin registro previo, con condiciones específicas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalle no especificado en la información proporcionada) |
| Parametros totales | 8.531.750.912 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (máximo durante entrenamiento, entrada y salida combinadas) |
| Tipos de cuantizacion | GGUF cuantizado (niveles concretos no especificados en la información proporcionada); el modelo base ofrece BF16, FP8, W4A16, W4AFP8 y NVFP4 en repositorios separados |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | plamo-community-license (PLaMo Community License) |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que se trata de un LLM especializado en traducción. Se sabe que PLaMo 3 Translate 8B se construye sobre PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT, y que posteriormente se entrenó con decenas de miles de millones de tokens de datos centrados en traducción. No se especifica en la información proporcionada si hubo fases de RLHF, DPO u otras técnicas de alineación, ni la composición exacta del dataset.

La innovación principal del modelo es su especialización en traducción multilingüe con soporte para contexto circundante y glosarios, así como la posibilidad de elegir entre estilo llano y cortés en la salida japonesa. El límite de 32.768 tokens durante el entrenamiento (entrada y salida combinadas) condiciona el diseño de los pipelines: los textos más largos deben dividirse para que la suma de entrada y salida no supere ese umbral. Esta variante GGUF aplica cuantización sobre el modelo base para reducir el uso de memoria y facilitar la inferencia con llama.cpp.

## Capacidades

- Traducción entre 53 idiomas, con calidad destacada en japonés-inglés y en combinaciones multilingües.
- Traducción bidireccional entre japonés o inglés y 14 idiomas adicionales evaluados en FLORES+ (árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino simplificado y tradicional, alemán, francés, vietnamita y ruso).
- Uso de contexto circundante para desambiguar y mejorar la coherencia de la traducción.
- Soporte de glosarios para forzar terminología concreta.
- Selección de estilo de salida en japonés: llano o cortés.
- Traducción de pasajes largos en una sola pasada, hasta el límite combinado de 32.768 tokens.
- Inferencia local mediante llama.cpp gracias al formato GGUF.
- No se documentan en la información proporcionada capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción de documentación técnica y manuales: el modelo puede procesar secciones completas respetando el límite de 32.768 tokens combinados y utilizar glosarios para mantener terminología consistente en productos con vocabulario especializado.
- Localización de software y webs multilingües: con 53 idiomas soportados, se puede integrar en pipelines de localización para generar versiones en árabe, coreano, tailandés, vietnamita y otros idiomas desde una única fuente, reduciendo la dependencia de servicios en la nube.
- Traducción jurídica o administrativa con contexto: el soporte de contexto circundante permite desambiguar términos legales y mantener coherencia entre párrafos, algo crítico en contratos y normativas.
- Atención al cliente multilingüe: el modelo puede traducir conversaciones multi-turno entre clientes y agentes, aprovechando el contexto acumulado dentro de la ventana de 32.768 tokens para mantener coherencia en hilos largos.
- Subtitulado y traducción de contenido audiovisual: la traducción de pasajes largos en una sola pasada facilita el procesamiento de guiones y transcripciones, y la opción de estilo cortés en japonés resulta útil para doblaje y subtítulos dirigidos a audiencias formales.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente con llama.cpp en formato GGUF, permite traducir documentos sensibles sin enviarlos a APIs externas, lo que encaja en sectores como salud, banca o administración pública.
- Investigación en traducción automática: el modelo sirve como base para experimentos de evaluación en FLORES+ y otros benchmarks, y su licencia permite uso académico sin registro previo.

## Benchmarks y rendimiento

La model card indica que PLaMo 3 Translate ofrece calidad de nivel mundial en traducción japonés-inglés y multilingüe, y que incluso el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas de la figura incluida en la model card. Sin embargo, no se proporcionan en la información disponible los valores numéricos concretos de los benchmarks. Las métricas empleadas son:

- Calidad japonés-inglés: media de PFTB, SaaS y WMT24++ COMET-22.
- Traducción entre japonés y 14 idiomas adicionales: media de FLORES+ chrF++ en ambas direcciones.
- Traducción entre inglés y 14 idiomas adicionales: media de FLORES+ chrF++ en ambas direcciones.

Los 15 idiomas seleccionados para la evaluación FLORES+ son: japonés, inglés, árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino simplificado y tradicional, alemán, francés, vietnamita y ruso. No se han publicado en la información disponible los valores numéricos de estos benchmarks ni comparativas cuantitativas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del nivel de cuantización GGUF elegido. El repositorio ocupa 52,2 GB e incluye múltiples cuantizaciones, por lo que el peso real por variante será inferior a esa cifra.
- GPU recomendadas: no especificadas en la información proporcionada.
- Compatibilidad con GPU consumer: no confirmada explícitamente en la información disponible; el formato GGUF y el soporte de llama.cpp están diseñados para facilitar la ejecución en hardware consumer, pero no se detallan modelos concretos ni requisitos mínimos.
- Opciones de despliegue: llama.cpp (soporte nativo del formato GGUF). El modelo base también está disponible en otros formatos (BF16, FP8, W4A16, W4AFP8, NVFP4, MLX-4bit) para otros motores de inferencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La model card menciona comparaciones con TranslateGemma y HY-MT2 en las figuras de benchmarks, pero no se proporcionan en la información disponible los datos numéricos ni las especificaciones de esos modelos. La tabla siguiente recoge únicamente los datos disponibles de PLaMo 3 Translate en sus distintas tallas; las celdas de los competidores quedan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formatos disponibles |
|---|---|---|---|---|
| PLaMo 3 Translate 8B (GGUF) | 8.531.750.912 | 32.768 tokens (entrada + salida) | PLaMo Community License | GGUF, además de BF16, FP8, W4A16, W4AFP8, NVFP4 y MLX-4bit en repos separados |
| PLaMo 3 Translate 31B | no disponible | no disponible | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit |
| PLaMo 3 Translate 2B | no disponible | no disponible | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit |
| PLaMo 3 Translate 0.8B | no disponible | no disponible | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; como modelo entrenado con datos masivos, puede heredar sesgos presentes en los corpus de entrenamiento.
- Riesgo de alucinación: no cuantificado en la información disponible; en tareas de traducción, el riesgo se manifiesta como adiciones, omisiones o cambios de sentido, especialmente en pasajes ambiguos o con terminología poco frecuente.
- Límite de longitud: la ventana de 32.768 tokens es la suma de entrada y salida; los textos más largos deben dividirse, lo que puede afectar a la coherencia en documentos extensos si la segmentación no es cuidadosa.
- Cobertura idiomática desigual: aunque se soportan 53 idiomas, la evaluación publicada se centra en 15 idiomas; el rendimiento en el resto (por ejemplo, ceb, jv, km, my, si, sw) no está cuantificado en la información disponible.
- Licencia: la PLaMo Community License permite uso personal, académico y no comercial sin registro previo, pero el uso comercial está sujeto a condiciones específicas que deben revisarse antes de desplegar el modelo en producción.
- Formato GGUF: la cuantización puede introducir degradaciones de calidad respecto a BF16; la model card incluye tablas comparativas de precisión por formato, pero sus valores no están disponibles en la información proporcionada.
- Capacidades generales: al ser un modelo especializado en traducción, no se documentan en la información disponible capacidades de tool calling, agentes, visión o audio, por lo que no debe asumirse que las tenga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-8b-GGUF
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-8b
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- llama.cpp: https://github.com/ggml-org/llama.cpp
- README en japonés: README_ja.md (en el repositorio de Hugging Face)
- Variante 0.8B GGUF: https://huggingface.co/pfnet/plamo-3-translate-0.8b-GGUF
- Variante 2B GGUF: https://huggingface.co/pfnet/plamo-3-translate-2b-GGUF
- Variante 31B GGUF: https://huggingface.co/pfnet/plamo-3-translate-31b-GGUF
