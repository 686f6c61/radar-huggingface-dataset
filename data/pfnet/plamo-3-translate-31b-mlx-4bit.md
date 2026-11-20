# pfnet/plamo-3-translate-31b-MLX-4bit

## Resumen

PLaMo 3 Translate 31B MLX-4bit es la variante cuantizada a 4 bits para MLX del modelo de traducción especializado PLaMo 3 Translate 31B, desarrollado por Preferred Networks (PFN). El modelo base se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT), y se entrena posteriormente con decenas de miles de millones de tokens de datos orientados a traducción. Esta versión MLX-4bit está pensada para ejecución eficiente en hardware Apple Silicon mediante la librería MLX y mlx-lm.

El modelo cubre traducción entre 53 idiomas, con especial énfasis en la calidad japonés-inglés y en la traducción multilingüe. Además de la traducción directa, admite contexto circundante y glosarios, y permite seleccionar entre estilo llano y estilo cortés para la salida en japonés. La longitud máxima durante el entrenamiento fue de 32.768 tokens combinando entrada y salida.

La relevancia de esta ficha radica en que ofrece una alternativa de despliegue local en equipos Apple para un modelo de traducción de gama alta, con un tamaño de repositorio de 18,7 GB y alrededor de 5.427 millones de parámetros almacenados en safetensors. La licencia PLaMo Community permite uso personal, académico y no comercial sin registro previo, mientras que el uso comercial queda sujeto a condiciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer especializado en traducción, derivado de PLaMo 3 NICT (detalles de capas no disponibles) |
| Parametros totales | 5.427.713.024 (según safetensors del repositorio MLX-4bit); el modelo base se denomina 31B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens combinando entrada y salida (máximo durante entrenamiento) |
| Tipos de cuantizacion | 4 bits para MLX; el modelo base dispone de BF16, FP8, W4A16, W4AFP8, NVFP4 y GGUF en repositorios separados |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | plamo-community-license (other) |
| Formato de pesos | safetensors con código personalizado (custom_code), librería mlx |

## Arquitectura y entrenamiento

El modelo base PLaMo 3 Translate 31B es un LLM especializado en traducción construido sobre PLaMo 3 NICT, un modelo preentrenado desarrollado mediante investigación conjunta entre PFN y NICT. Sobre esa base, PFN realizó un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traducción. La model card no detalla el número exacto de capas, dimensión oculta ni configuración de atención del transformer; tampoco especifica si se emplearon técnicas de RLHF o DPO. La información disponible tampoco confirma innovaciones como decodificación especulativa o atención lineal.

La variante MLX-4bit aplica cuantización a 4 bits de los pesos para su uso con MLX y mlx-lm en hardware Apple. El repositorio incluye la etiqueta custom_code, lo que implica que la carga del modelo requiere código específico del autor más allá de la arquitectura estándar de mlx-lm. La model card menciona una sección de comparación de precisión entre BF16 y cada formato de distribución, pero el contenido detallado de esas tablas no está disponible en la información proporcionada.

## Capacidades

- Traducción entre 53 idiomas, con calidad destacada en japonés-inglés y en pares multilingües.
- Traducción con contexto circundante: el modelo puede tener en cuenta texto previo o posterior para desambiguar.
- Soporte de glosarios: permite imponer terminología concreta durante la traducción.
- Control de estilo en japonés: elección entre estilo llano y estilo cortés.
- Traducción de pasajes largos en una sola pasada, hasta el límite combinado de 32.768 tokens de entrada y salida.
- Capacidad multilingüe amplia que cubre lenguas europeas, asiáticas, de Oriente Medio, África subsahariana y Asia Central.
- No se dispone de información sobre tool calling, function calling, capacidades de agente, visión, audio o modo de razonamiento explícito en la documentación proporcionada.

## Casos de uso

- Localización de documentación técnica: el modelo puede traducir manuales y guías manteniendo coherencia terminológica mediante glosarios, con pasajes de hasta 32.768 tokens combinados de entrada y salida.
- Traducción jurídica y administrativa asistida: el soporte de glosarios y contexto permite respetar terminología fija en contratos o formularios, aunque requiere revisión humana por el riesgo de alucinación.
- Atención al cliente multilingüe: integrado en un pipeline de soporte, puede traducir conversaciones entre agentes y clientes en 53 idiomas, incluyendo pares menos frecuentes como sw, ta o uz.
- Subtitulado y traducción audiovisual: la capacidad de procesar contexto circundante ayuda a resolver referencias entre segmentos consecutivos de diálogo.
- Traducción de contenido editorial y marketing: el control de estilo llano o cortés en japonés permite adaptar el registro al público objetivo.
- Investigación lingüística y evaluación de traducción: útil para experimentos con FLORES+ y otros corpus multilingües, así como para estudiar el efecto de la cuantización 4-bit en calidad de traducción.
- Despliegue local en estaciones de trabajo Apple: al estar en formato MLX-4bit, permite ejecutar traducción de calidad en Mac con Apple Silicon sin depender de GPU NVIDIA ni de servicios en la nube.

## Benchmarks y rendimiento

La model card indica que PLaMo 3 Translate ofrece calidad de nivel mundial en japonés-inglés y en traducción multilingüe, y que incluso el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas de la figura incluida. Las métricas citadas son:

- Japonés-inglés: media de PFTB, SaaS y WMT24++ COMET-22.
- Japonés frente a otros 14 idiomas: media de FLORES+ chrF++ en ambas direcciones.
- Inglés frente a otros 14 idiomas: media de FLORES+ chrF++ en ambas direcciones.

Los idiomas evaluados en FLORES+ son japonés, inglés, árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino simplificado y tradicional, alemán, francés, vietnamita y ruso. Los valores numéricos concretos de los benchmarks no están disponibles en la información proporcionada; la model card remite a una figura y al blog técnico para los detalles.

| Benchmark | Métrica | Resultado |
|---|---|---|
| Japonés-inglés (PFTB, SaaS, WMT24++) | COMET-22 (media) | no disponible (solo figura) |
| Japonés frente a 14 idiomas (FLORES+) | chrF++ (media bidireccional) | no disponible (solo figura) |
| Inglés frente a 14 idiomas (FLORES+) | chrF++ (media bidireccional) | no disponible (solo figura) |

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 18,7 GB en formato MLX-4bit, por lo que se necesita al menos esa cantidad de memoria unificada disponible, más margen para el contexto y el runtime.
- Hardware recomendado: equipos Apple Silicon con memoria unificada suficiente, como Mac Studio o MacBook Pro con 32 GB o más; el modelo no está pensado para GPU NVIDIA en este formato.
- Cabe en GPU consumer: no aplica directamente, ya que MLX está orientado a Apple Silicon; para GPU NVIDIA habría que usar las variantes BF16, FP8, W4A16, W4AFP8, NVFP4 o GGUF del modelo base.
- Opciones de despliegue: MLX y mlx-lm en macOS; para otros entornos, las variantes GGUF permiten llama.cpp u Ollama, y las variantes FP8 o NVFP4 están orientadas a servidores con vLLM o TGI, aunque la model card no detalla configuraciones de despliegue.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La model card menciona comparaciones con TranslateGemma y HY-MT2 en las figuras de calidad de traducción, pero no proporciona sus especificaciones ni los valores numéricos. La siguiente tabla recoge únicamente los datos disponibles.

| Modelo | Parámetros | Contexto | Licencia | Formatos disponibles |
|---|---|---|---|---|
| PLaMo 3 Translate 31B MLX-4bit | 5.427.713.024 en safetensors (base denominado 31B) | 32.768 tokens entrada+salida | plamo-community-license | MLX-4bit; el base en BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF |
| PLaMo 3 Translate 0.8B / 2B / 8B | no disponible | 32.768 tokens entrada+salida (según modelo base) | plamo-community-license | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantización a 4 bits puede degradar la calidad de traducción respecto a BF16; la model card anuncia tablas comparativas, pero sus valores no están disponibles en la información proporcionada.
- El límite de 32.768 tokens es combinado de entrada y salida; los textos más largos deben dividirse, lo que puede romper la coherencia entre fragmentos.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en pares de idiomas con pocos datos o en terminología muy especializada.
- Sesgos no documentados en la información disponible; al ser un modelo entrenado con datos web y de traducción, puede reflejar sesgos de esos corpus.
- La licencia PLaMo Community permite uso personal, educativo y académico sin registro, pero el uso comercial está sujeto a condiciones adicionales que deben revisarse en el enlace de licencia.
- El formato MLX-4bit está atado al ecosistema Apple; para otros entornos es necesario recurrir a las variantes del modelo base.
- No se dispone de información sobre tool calling, agentes o modo de razonamiento, por lo que no debe asumirse su disponibilidad en producción.
- La etiqueta custom_code implica que la integración requiere código específico del autor, lo que puede complicar el despliegue en pipelines estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-31b-MLX-4bit
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-31b
- Blog técnico: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community: https://plamo.preferredai.jp/info/plamo-community-license-en
- README en japonés: README_ja.md (en el repositorio)
- MLX: https://github.com/ml-explore/mlx
- Variantes del modelo base: plamo-3-translate-31b-FP8, plamo-3-translate-31b-W4A16, plamo-3-translate-31b-W4AFP8, plamo-3-translate-31b-NVFP4, plamo-3-translate-31b-GGUF (en Hugging Face bajo pfnet)
