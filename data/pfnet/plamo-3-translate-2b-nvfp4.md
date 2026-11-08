# pfnet/plamo-3-translate-2b-NVFP4

## Resumen

PLaMo 3 Translate 2B NVFP4 es la variante cuantizada a NVFP4 (pesos y activaciones en FP4 de 4 bits) del modelo de traducción especializado PLaMo 3 Translate 2B, desarrollado por Preferred Networks (PFN). El modelo base se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón, y se afina posteriormente con decenas de miles de millones de tokens de datos orientados a traducción.

El modelo resuelve el problema de la traducción automática de alta calidad entre 53 idiomas, con especial énfasis en el par japonés-inglés y en combinaciones multilingües que incluyen el español. Admite contexto adicional y glosarios como parte de la entrada, y permite elegir entre estilo llano y estilo cortés en la salida en japonés. La longitud máxima durante el entrenamiento fue de 32.768 tokens combinando entrada y salida, lo que permite traducir pasajes largos en una sola pasada.

La relevancia de esta variante concreta radica en su formato NVFP4: al cuantizar pesos y activaciones a 4 bits, reduce el espacio en disco (2,4 GB en el repositorio) y los requisitos de memoria frente a la versión BF16, manteniendo el mismo comando de lanzamiento en vLLM. Está pensada para despliegues en GPUs NVIDIA Blackwell y para escenarios de inferencia con requisitos de memoria ajustados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo de traducción especializado, familia PLaMo 3) |
| Parametros totales | 1.860.166.336 (1,86 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens (entrada + salida combinadas durante el entrenamiento) |
| Tipos de cuantizacion | NVFP4 (pesos y activaciones en FP4); el modelo base ofrece además BF16, FP8, W4A16, W4AFP8, GGUF y MLX-4bit |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (other) |
| Formato de pesos | safetensors con compressed-tensors (custom_code, compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only especializado en traducción, derivado de PLaMo 3 NICT (modelo preentrenado desarrollado conjuntamente por PFN y NICT) y afinado con decenas de miles de millones de tokens de datos centrados en traducción. No se especifica en la información disponible el número total de tokens de preentrenamiento ni la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. La longitud máxima de entrenamiento fue de 32.768 tokens para entrada y salida combinadas.

La innovación técnica destacable de esta ficha es la cuantización NVFP4: tanto pesos como activaciones se almacenan en FP4, lo que reduce el tamaño del repositorio a 2,4 GB. El modelo se distribuye con código personalizado (`custom_code`) y formato `compressed-tensors`, y es compatible con vLLM usando el mismo comando de lanzamiento que la versión BF16. En GPUs anteriores a NVIDIA Blackwell puede ejecutarse con la misma ruta de activaciones FP4 que en la evaluación del autor añadiendo `--linear-backend=emulation --enforce-eager`.

## Capacidades

- Traducción automática entre 53 idiomas, con calidad destacada en japonés-inglés y en combinaciones multilingües.
- Traducción bidireccional entre japonés o inglés y otros 14 idiomas en la evaluación FLORES+ (incluido el español).
- Uso de contexto circundante como parte de la entrada para mejorar la coherencia de la traducción.
- Soporte de glosarios para forzar terminología concreta.
- Selección de estilo de salida en japonés: llano o cortés.
- Traducción de pasajes largos en una sola pasada gracias a la ventana de 32.768 tokens (entrada + salida).
- Capacidad multilingüe amplia con cobertura de lenguas europeas, asiáticas, de Oriente Medio y de África subsahariana.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión o audio.

## Casos de uso

- Localización de documentación técnica: el modelo puede traducir manuales y guías largas en una sola pasada gracias a su ventana de 32.768 tokens, manteniendo coherencia terminológica mediante glosarios.
- Traducción de sitios web y aplicaciones: integrable en pipelines de localización para generar versiones en decenas de idiomas, con la ventaja de que el formato NVFP4 reduce el coste de memoria en servidores de inferencia.
- Atención al cliente multilingüe: traducción en tiempo real de conversaciones entre agentes y clientes en 53 idiomas, con control de estilo cortés en japonés para interacciones formales.
- Traducción jurídica o administrativa asistida: el soporte de glosarios permite fijar terminología especializada y el contexto adicional ayuda a resolver referencias ambiguas en textos densos.
- Subtitulado y doblaje: traducción de guiones y subtítulos con contexto de escena, adecuada para volúmenes altos gracias al reducido tamaño del modelo (1,86 B de parámetros en FP4).
- Investigación en traducción automática: modelo de referencia ligero para experimentos de evaluación multilingüe con FLORES+ y comparación de técnicas de cuantización (NVFP4 frente a BF16, FP8 o W4A16).
- Procesamiento por lotes en GPUs de consumo o de gama media: el formato NVFP4 y el tamaño reducido permiten desplegar traducción multilingüe en hardware con VRAM limitada.

## Benchmarks y rendimiento

La model card indica que PLaMo 3 Translate alcanza calidad de referencia en traducción japonés-inglés y multilingüe, y que incluso el modelo de 2B supera a los LLM especializados en traducción comparados (TranslateGemma y HY-MT2) en todas las métricas de la figura publicada. Las métricas empleadas son:

- Japonés-inglés: media de PFTB, SaaS y WMT24++ COMET-22.
- Japonés frente a otros 14 idiomas: media de FLORES+ chrF++ en ambas direcciones.
- Inglés frente a otros 14 idiomas: media de FLORES+ chrF++ en ambas direcciones.

Los valores numéricos concretos de estos benchmarks no se incluyen en el texto disponible (solo aparecen en la figura `figures/benchmark_en.png` de la model card), por lo que no se presentan cifras en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,4 GB en NVFP4 (pesos + activaciones en FP4), por lo que el modelo cabe holgadamente en GPUs con 8 GB o más de VRAM, dejando margen para el contexto.
- GPUs recomendadas: NVIDIA Blackwell (serie RTX 50, B200) para aprovechar la ruta nativa FP4; en GPUs anteriores puede ejecutarse con `--linear-backend=emulation --enforce-eager`.
- Cabe en GPUs de consumo: sí, en tarjetas con 8 GB o más (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090).
- Opciones de despliegue: vLLM (soporte nativo de NVFP4 y compressed-tensors); el modelo base ofrece además GGUF (llama.cpp/Ollama) y MLX-4bit para Apple Silicon.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| PLaMo 3 Translate 2B NVFP4 | 1,86 B | 32.768 tokens (entrada + salida) | PLaMo Community License | NVFP4 (safetensors, compressed-tensors) | Especializado en traducción, 53 idiomas |
| PLaMo 3 Translate 2B (BF16) | 1,86 B | 32.768 tokens | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, GGUF, MLX-4bit | Misma calidad, mayor huella de memoria |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | Comparado en la model card; el 2B de PLaMo lo supera en todas las métricas de la figura |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | Comparado en la model card; el 2B de PLaMo lo supera en todas las métricas de la figura |

No se dispone de parámetros, contexto ni licencia de TranslateGemma y HY-MT2 en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al ser un modelo entrenado con datos masivos de traducción, puede heredar sesgos de esos corpus.
- Riesgo de alucinación: presente como en cualquier LLM; en traducción puede manifestarse como adiciones, omisiones o invenciones de contenido, especialmente en idiomas de bajos recursos.
- Límite de contexto: entrada y salida combinadas no deben superar los 32.768 tokens; los pasajes más largos deben dividirse.
- Cobertura idiomática desigual: aunque soporta 53 idiomas, la evaluación publicada se centra en 15 idiomas (japonés, inglés, árabe, indonesio, italiano, neerlandés, coreano, español, tailandés, chino simplificado y tradicional, alemán, francés, vietnamita y ruso); el rendimiento en el resto puede ser inferior.
- Licencia: PLaMo Community License permite uso personal, académico y no comercial sin registro previo; el uso comercial está sujeto a condiciones adicionales que deben consultarse en el enlace de la licencia.
- Cuantización: el formato NVFP4 puede introducir degradación de calidad frente a BF16; la model card incluye una sección "Accuracy changes from quantization" con los detalles.
- En GPUs anteriores a Blackwell, la ruta de emulación FP4 (`--linear-backend=emulation --enforce-eager`) puede reducir el rendimiento frente a la ejecución nativa.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; el modelo está orientado exclusivamente a traducción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-2b-NVFP4
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-2b
- Variante W4AFP8: https://huggingface.co/pfnet/plamo-3-translate-2b-W4AFP8
- Variante FP8: https://huggingface.co/pfnet/plamo-3-translate-2b-FP8
- Variante W4A16: https://huggingface.co/pfnet/plamo-3-translate-2b-W4A16
- Variante GGUF: https://huggingface.co/pfnet/plamo-3-translate-2b-GGUF
- Variante MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-2b-MLX-4bit
- Modelo de 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Modelo de 8B: https://huggingface.co/pfnet/plamo-3-translate-8b
- Modelo de 31B: https://huggingface.co/pfnet/plamo-3-translate-31b
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community License: https://plamo.preferredai.jp/info/plamo-community-license-en
