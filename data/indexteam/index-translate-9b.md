# IndexTeam/Index-Translate-9B

## Resumen

Index-Translate-9B es un modelo de traducción multilingüe de 9.653 millones de parámetros desarrollado por IndexTeam (equipo vinculado a Bilibili) y construido sobre la arquitectura Qwen3.5. Resuelve el problema de la traducción automática de alta calidad entre 150 idiomas, incluyendo un enfoque específico en idiomas de bajos recursos, y añade capacidades poco habituales en modelos de traducción: seguimiento de instrucciones complejas, restricciones duras sobre terminología y formato, y traducción multimodal de imágenes sin OCR externo.

El modelo se distribuye bajo licencia Apache 2.0 con pesos en safetensors (38,6 GB de repositorio) y está pensado como un sistema de traducción de propósito general que compite con modelos especializados más grandes. Su relevancia actual radica en que combina calidad de traducción cercana a modelos de 30B+ con un tamaño que permite despliegue en infraestructura moderada, y en que aborda la traducción instruccional (glosarios, JSON, placeholders) como ciudadano de primera clase, no como un añadido.

La familia Index-Translate incluye también variantes de 2B y de 35B-A3B (MoE), además de modelos de voz y de documentos largos con interfaces propias. El informe técnico asociado (arXiv:2609.40181) documenta el recetario de entrenamiento y las evaluaciones comparativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5 (tag `qwen3_5`) |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes en la información proporcionada) |
| Idiomas soportados | 150 idiomas (inventario documentado en el informe técnico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5, un transformer denso de aproximadamente 9,6B de parámetros. El entrenamiento se organiza en tres fases según el informe técnico. Primero, un mid-training multilingüe compartido que combina replay de texto general, texto monolingüe, traducciones paralelas ordinarias y grupos multilingües organizados por pivote: la etapa constante usa datos generales/paralelos/monolingües en proporción 1:1:1 y la etapa de decaimiento usa general/core-pivot/full-pivot en 1:4:2, sumando 167,77B de tokens en total.

Después, un post-entrenamiento especializado por tarea: SFT y RL para traducción general, seguimiento de instrucciones y traducción de memes. El RL de traducción general combina XCOMET-XXL con juicios de validez de idioma y adecuación; el RL de instrucciones usa Rubric-as-Reward con comprobaciones duras y restricciones graduadas; RIVAL aporta supervisión adaptativa de juez. Finalmente, se integran los especialistas mediante interpolación de parámetros (pesos 0,8/0,1/0,1 para general/instrucciones/memes) y se aplica destilación on-policy multi-profesor (MOPD) para corregir los tipos de tarea que quedan débiles tras la fusión. La traducción multimodal de imágenes se apoya en codificadores visuales complementarios (`mmproj`) empaquetados aparte.

## Capacidades

- Traducción de texto multilingüe entre 150 idiomas: frases, artículos, subtítulos y documentos.
- Traducción multimodal imagen-a-texto de extremo a extremo en 150 idiomas, sin herramientas OCR externas, mediante codificadores visuales complementarios.
- Seguimiento de instrucciones de traducción con restricciones duras: glosarios obligatorios, preservación de estructuras (JSON, CSV, Markdown), bloques de código y placeholders de variables (`{variable}`, `[123456]`).
- Restricciones blandas: adaptación de tono y estilo (formal, coloquial, redes sociales/memes) y desambiguación por dominio y contexto.
- Traducción sociocultural: interpretación de alias comunitarios, grafías lúdicas, memes y expresiones no literales.
- Traducción instruccional con control de longitud de salida y formato.
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Localización de productos software: el modelo puede traducir ficheros de recursos JSON, YAML o CSV preservando claves, placeholders y estructura gracias a sus restricciones duras, lo que permite integrarlo en pipelines de CI/CD sin post-procesado manual de formato.
- Traducción de subtítulos y audiovisual: con 0,8979 COMET-22 en MuST-Cinema, es adecuado para localizar subtítulos manteniendo coherencia de estilo y terminología entre segmentos.
- Traducción de documentación técnica con glosario: la imposición estricta de terminología permite fijar un glosario corporativo y garantizar consistencia en manuales, API docs y bases de conocimiento.
- Traducción de imágenes en aplicaciones móviles: al soportar imagen-a-texto sin OCR externo, puede integrarse en apps de viaje, menús de restaurantes o carteles para traducir directamente capturas de cámara.
- Moderación y adaptación de contenido en redes sociales: su capacidad para interpretar memes, alias y expresiones no literales (0,7387 en MEME) lo hace útil para traducir contenido generado por usuarios sin perder el sentido figurado.
- Atención al cliente multilingüe: puede traducir conversaciones multi-turno preservando variables de plantilla y tono, integrándose en sistemas de ticketing o chat para soporte en 150 idiomas.
- Traducción de comunidades de bajos recursos: con el mejor instTrans IFscore de bajos recursos (0,7725) y la menor tasa off-target (3,47%) entre los sistemas comparados, sirve para desplegar traducción en idiomas con poca cobertura comercial.

## Benchmarks y rendimiento

Resultados del informe técnico. WMT26 Judge en escala 0–100; el resto en escala 0–1. Mayor es mejor salvo en la tasa off-target.

| Modelo | FLORES COMET-22 | WMT24++ COMET-22 | WMT26 Judge | instTrans Quality | instTrans IFscore | IFMTBench XCOMET-XXL | IFMTBench IFscore | Vertical mean | MEME |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Index-Translate-35B-A3B (preview) | 0,8794 | 0,8586 | 76,76 | 0,6901 | 0,8336 | 0,7926 | 0,8991 | 0,8438 | 0,7405 |
| **Index-Translate-9B** | 0,8789 | 0,8601 | 75,35 | 0,6771 | 0,8209 | 0,7957 | 0,8760 | 0,8451 | 0,7387 |
| Index-Translate-2B | 0,8655 | 0,8489 | 60,26 | 0,5391 | 0,7569 | 0,7712 | 0,7584 | 0,8377 | 0,6443 |
| Hy-MT2-1.8B | 0,8522 | 0,8401 | 49,35 | 0,3181 | 0,4932 | 0,7493 | 0,7161 | 0,8314 | 0,3643 |
| Hy-MT2-7B | 0,8747 | 0,8593 | 60,51 | 0,5143 | 0,6079 | 0,8049 | 0,8741 | 0,8335 | 0,5139 |
| Hy-MT2-30B-A3B | 0,8787 | 0,8624 | 66,81 | 0,5725 | 0,6415 | 0,8177 | 0,9029 | 0,8459 | 0,5812 |
| TranslateGemma-12B | 0,8732 | 0,8524 | 71,19 | 0,4515 | 0,3068 | 0,8023 | 0,2892 | 0,8347 | No disponible |

Datos adicionales citados en la model card: MuST-Cinema COMET-22 de 0,8979 (el mejor entre los modelos comparados), calidad en bajos recursos de 0,5222, instTrans IFscore en bajos recursos de 0,7725 y tasa off-target de 3,47%.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19–20 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda 24 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 10–11 GB; en 4 bits, alrededor de 5–6 GB (estimaciones a partir del recuento de parámetros; no se publican cuantizaciones oficiales en la información disponible).
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en BF16 con concurrencia; RTX 4090 (24 GB) para BF16 en una sola GPU con lotes pequeños.
- Cabe en GPU de consumo: sí, en RTX 4090 en BF16 con margen ajustado; en RTX 3090 (24 GB) de forma similar; en GPUs de 16 GB o menos requiere cuantización.
- Opciones de despliegue: el formato publicado es safetensors, compatible con vLLM y TGI; llama.cpp y Ollama requerirían conversión a GGUF, no documentada en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | FLORES COMET-22 | WMT26 Judge | instTrans IFscore | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Index-Translate-9B | 9,65B denso | No disponible | 0,8789 | 75,35 | 0,8209 | Apache 2.0 | Hugging Face, ModelScope |
| Hy-MT2-7B | ~7B | No disponible | 0,8747 | 60,51 | 0,6079 | No disponible | No disponible |
| Hy-MT2-30B-A3B | 30B MoE (A3B) | No disponible | 0,8787 | 66,81 | 0,6415 | No disponible | No disponible |
| TranslateGemma-12B | 12B | No disponible | 0,8732 | 71,19 | 0,3068 | No disponible | No disponible |
| Index-Translate-35B-A3B | 35B MoE (A3B) | No disponible | 0,8794 | 76,76 | 0,8336 | Apache 2.0 | Hugging Face (preview) |

Index-Translate-9B iguala o supera en FLORES COMET-22 a modelos notablemente mayores (Hy-MT2-30B-A3B y TranslateGemma-12B) y queda muy cerca de su propia variante de 35B, con una ventaja clara en seguimiento de instrucciones frente a todos los comparados salvo el 35B.

## Limitaciones y advertencias

- La model card no documenta sesgos específicos; como modelo entrenado sobre datos web multilingües, es esperable sesgo cultural y de representación por idioma, no cuantificado en la información disponible.
- Riesgo de alucinación en traducción de contenido ambiguo, memes o expresiones culturales; la puntuación MEME de 0,7387 indica margen de mejora.
- La longitud de contexto no está especificada, lo que impide garantizar traducción de documentos largos sin truncamiento; los modelos de documentos largos de la familia tienen interfaces propias.
- El inventario de 150 idiomas se documenta en el informe técnico, no en la model card; la cobertura real por idioma y la calidad en lenguas de bajos recursos (0,5222) son inferiores a la media general.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las obligaciones de atribución y las licencias de los codificadores visuales complementarios (`mmproj`) si se usa la modalidad de imagen.
- No se documentan cuantizaciones oficiales ni soporte de tool calling, agentes o modo de razonamiento; para producción conviene validar el comportamiento en el dominio concreto antes de desplegar.
- El checkpoint de 35B-A3B está marcado como preview, lo que sugiere que la familia puede seguir evolucionando.

## Enlaces

- Hugging Face: https://huggingface.co/IndexTeam/Index-Translate-9B
- Demo online: https://index-translate.bilibili.com/
- GitHub: https://github.com/bilibili/Index-Translate
- Informe técnico: https://arxiv.org/abs/2609.40181
- Colección Hugging Face: https://huggingface.co/collections/IndexTeam/index-translate
- Colección ModelScope: https://www.modelscope.cn/collections/IndexTeam/Index-Translate
