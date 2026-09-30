# IndexTeam/Index-Translate-9B

## Resumen

Index-Translate-9B es un modelo de traducción multilingüe de 9.653.104.368 parámetros (aproximadamente 9,65 B) desarrollado por IndexTeam, el equipo de Index LLM de Bilibili, y construido sobre el backbone Qwen3.5. Forma parte de la familia Index-Translate, que incluye variantes de texto de 2B, 9B y 35B-A3B, además de modelos específicos para voz, doblaje y documentos largos. Su función es la traducción de texto entre 150 idiomas, no la conversación general.

El modelo se distingue por seguir instrucciones de traducción: preservar terminología concreta, mantener estructuras JSON o código, respetar placeholders, adaptar el estilo y controlar la longitud de la salida. Según el informe técnico de la familia, alcanza 0,8789 COMET-22 en FLORES, 75,35 en WMT26 Judge y 0,8209 en instTrans IFscore, con un 0,7387 en la prueba MEME de contenido cultural y de redes sociales.

Su relevancia actual radica en que acerca la calidad de traducción de modelos de 100B o de APIs propietarias a un tamaño de 9B desplegable en una GPU, y en que se publica bajo licencia Apache-2.0. El modelo card consultado está truncado, por lo que algunos datos (longitud de contexto, inventario completo de idiomas, cuantizaciones publicadas) no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en el backbone Qwen3.5 (modelo denso) |
| Parametros totales | 9.653.104.368 (aproximadamente 9,65 B), según safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible en la información proporcionada |
| Idiomas soportados | 150 idiomas declarados en la model card (el inventario detallado está en el informe técnico, no incluido en la información disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

Datos adicionales: pipeline declarado como `translation`; repositorio de 38,6 GB, superior a los aproximadamente 19,3 GB que ocuparían los pesos en bf16, por lo que el repositorio podría contener artefactos adicionales (no confirmado en la información disponible).

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso derivado de Qwen3.5, la misma familia de backbone que usan los modelos base Qwen3.5-9B y Qwen3.5-35B-A3B con los que se compara en el informe. No se documentan en la información disponible innovaciones de atención (atención lineal, híbrida, decodificación especulativa) ni detalles sobre la tokenización.

El entrenamiento descrito en el informe técnico consta de tres fases. Primero, un mid-training multilingüe compartido por toda la familia con rejugado de texto general, texto monolingüe, traducciones paralelas ordinarias y grupos multilingües organizados por pivote: la etapa constante usa datos generales/paralelos/monolingües en proporción 1:1:1 y la etapa de decaimiento usa general/core-pivot/full-pivot en 1:4:2, con un total de 167,77 B de tokens. Después, SFT y RL específicos por especialista: traducción general, seguimiento de instrucciones y traducción de memes; el RL de traducción general combina XCOMET-XXL con juicios de validez de idioma y adecuación, el de instrucciones usa Rubric-as-Reward con comprobaciones duras y restricciones graduadas, y RIVAL aporta supervisión adaptativa de juez. Finalmente, se integran los especialistas mediante interpolación de parámetros y una destilación on-policy multi-profesor (MOPD) dirigida a las tareas que quedan débiles tras la fusión. Los modelos 2B y 9B evaluados combinan los especialistas general, de instrucciones y de memes con pesos 0,8 / 0,1 / 0,1 antes de recibir la MOPD.

## Capacidades

- Traducción multilingüe general de frases, artículos, subtítulos y otros textos en los 150 idiomas soportados.
- Traducción con instrucciones: conservación de términos especificados, estructuras JSON u otras, código y placeholders.
- Adaptación de estilo y resolución del significado a partir del contexto.
- Traducción social y cultural: interpretación de alias de comunidad, ortografías lúdicas, memes y expresiones no literales.
- Control de la longitud de salida, útil para subtitulado y doblaje.
- Rendimiento en subtitulado de cine: 0,8979 COMET-22 en MuST-Cinema, el mejor de los modelos comparados en el informe.
- Cobertura de idiomas con pocos recursos: mejor instTrans IFscore (0,7725) y menor tasa off-target (3,47%) en la comparativa del informe.
- No se documenta en la información disponible soporte de tool calling, function calling, uso agéntico, visión ni audio para este checkpoint de texto.

## Casos de uso

- Localización de documentación técnica: el modelo conserva Markdown, bloques de código y placeholders, por lo que puede traducir manuales y documentación de API sin romper la estructura del archivo ni los identificadores de variables.
- Subtitulado y doblaje: con 0,8979 COMET-22 en MuST-Cinema y control de longitud de salida, encaja en pipelines de subtitulado donde hay que respetar límites de caracteres o sílabas por línea.
- Localización de producto con terminología corporativa: admite glosarios en la propia instrucción, lo que permite forzar la traducción de nombres de marca, términos legales y cadenas de interfaz de forma consistente entre lotes.
- Moderación y traducción de contenido generado por usuarios: su puntuación MEME de 0,7387 y su tratamiento de alias y jerga permiten traducir comentarios, publicaciones y respuestas de redes sociales sin perder el sentido pretendido.
- Cobertura de idiomas minoritarios: con 104.000 entradas y 1.040 direcciones entre 62 idiomas en FLORES_minor_pair, es adecuado para productos que necesitan presencia en idiomas de bajos recursos donde otros modelos fallan.
- Traducción dentro de pipelines de CI/CD: al preservar JSON, código y placeholders, puede integrarse como paso automático en la localización de ficheros de recursos y en la generación de catálogos de mensajes.
- Atención al cliente multilingüe: se puede usar como capa de traducción sobre un LLM conversacional, traduciendo entradas y salidas en conversaciones multi-turno con instrucciones de tono y terminología.
- Investigación en evaluación de traducción: al publicarse bajo Apache-2.0 y con pesos abiertos, sirve como baseline reproducible frente a APIs propietarias en experimentos de COMET, XCOMET-XXL o juicios con LLM.

## Benchmarks y rendimiento

Resultados del informe técnico de la familia. WMT26 Judge usa escala 0–100; el resto de columnas, escala 0–1. Valores más altos son mejores, salvo en la tasa off-target. "Vertical" es la media con igual peso de las cinco puntuaciones de dominio. North-Small-Translate es un modelo 218B-A25B; TranslateGemma corresponde a translategemma-12b-it.

| Modelo | FLORES COMET-22 | WMT24++ COMET-22 | WMT26 Judge | instTrans Quality | instTrans IFscore | IFMTBench XCOMET-XXL | IFMTBench IFscore | Vertical mean | MEME |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Index-Translate-35B-A3B (preview) | 0,8794 | 0,8586 | 76,76 | 0,6901 | 0,8336 | 0,7926 | 0,8991 | 0,8438 | 0,7405 |
| **Index-Translate-9B** | 0,8789 | 0,8601 | 75,35 | 0,6771 | 0,8209 | 0,7957 | 0,8760 | 0,8451 | 0,7387 |
| Index-Translate-2B | 0,8655 | 0,8489 | 60,26 | 0,5391 | 0,7569 | 0,7712 | 0,7584 | 0,8377 | 0,6443 |
| Hy-MT2-1.8B | 0,8522 | 0,8401 | 49,35 | 0,3181 | 0,4932 | 0,7493 | 0,7161 | 0,8314 | 0,3643 |
| Hy-MT2-7B | 0,8747 | 0,8593 | 60,51 | 0,5143 | 0,6079 | 0,8049 | 0,8741 | 0,8335 | 0,5139 |
| Hy-MT2-30B-A3B | 0,8787 | 0,8624 | 66,81 | 0,5725 | 0,6415 | 0,8177 | 0,9029 | 0,8459 | 0,5812 |
| TranslateGemma-12B | 0,8732 | 0,8524 | 71,19 | 0,4515 | 0,3068 | 0,8023 | 0,2892 | 0,8347 | 0,4281 |
| North-Small-Translate (218B-A25B) | 0,8784 | 0,8578 | 68,37 | 0,5697 | 0,5294 | 0,7657 | 0,8635 | 0,8357 | 0,6836 |
| Qwen3.5-2B (base) | 0,6983 | 0,6933 | 32,11 | 0,0999 | 0,2431 | 0,6197 | 0,3836 | 0,7557 | 0,2062 |
| Qwen3.5-9B (base) | 0,8316 | 0,8073 | 60,31 | 0,2467 | 0,0609 | 0,7341 | 0,5980 | 0,8199 | 0,5728 |
| Qwen3.5-35B-A3B | 0,8570 | 0,8290 | 71,33 | 0,3690 | 0,5204 | 0,7589 | 0,7822 | 0,8267 | 0,6447 |
| DeepSeek-V4.1-Flash | 0,8762 | 0,8510 | 83,55 | 0,6068 | 0,6374 | 0,7817 | 0,9090 | 0,8432 | 0,7424 |
| GPT-5.6-Sol | 0,8650 | 0,8469 | 89,10 | 0,6902 | 0,7624 | 0,7946 | 0,9367 | 0,8311 | 0,7194 |
| Gemini 3.5 Flash Lite | 0,8750 | 0,8497 | 79,52 | 0,6068 | 0,6374 | 0,7764 | 0,8854 | 0,8131 | 0,7034 |

Datos adicionales de baja recursos y subtitulado:

- FLORES_minor_pair: 104.000 entradas, 1.040 direcciones entre 62 idiomas. Index-Translate-9B obtiene la mejor puntuación instTrans IFscore de baja recursos (0,7725) y la menor tasa off-target (3,47%) de los sistemas comparados; la calidad de baja recursos es 0,5222.
- instTrans_minor: 2.793 tareas de traducción con instrucciones desde chino o inglés hacia idiomas de bajos recursos.
- MuST-Cinema COMET-22: 0,8979, la mejor puntuación de los modelos comparados en el informe.
- Las puntuaciones proceden del informe técnico del propio autor y las comparaciones se aplican a sus datos y ajustes de evaluación; las escalas de las métricas difieren entre sí.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del recuento de parámetros (9,65 B) y no de requisitos oficiales publicados; la longitud de contexto es desconocida, por lo que el tamaño de la caché KV no se puede calcular.

- Inferencia en bf16/fp16: aproximadamente 19,3 GB solo de pesos; con caché KV y overhead, del orden de 22 a 26 GB. Requiere A100 40GB, A100 80GB, H100, L40S o tarjetas con 32 GB o más (por ejemplo, V100 32GB con margen justo).
- Inferencia en fp8/int8: aproximadamente 9,7 GB de pesos; del orden de 12 a 16 GB en total. Cabe en RTX 4080/4090, L4, A10G y similares.
- Inferencia en int4 (por ejemplo, Q4_K_M): aproximadamente 5,5 a 6 GB de pesos; del orden de 8 a 10 GB en total. Cabe en GPU de consumo como RTX 3060 12GB, RTX 4060 Ti 16GB o RTX 4070.
- En consumer GPU: sí, en bf16 cabe en RTX 3090/4090 de 24 GB siempre que la ventana de contexto no sea grande; en cuantización de 4 bits cabe en tarjetas de 8 a 12 GB.
- Opciones de despliegue: transformers, servidores de inferencia tipo vLLM, SGLang o TGI con los pesos safetensors. Para llama.cpp u Ollama haría falta una conversión a GGUF que no está confirmada en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | FLORES COMET-22 | instTrans IFscore | MEME | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Index-Translate-9B | 9,65 B (denso) | no disponible | Apache-2.0 | 0,8789 | 0,8209 | 0,7387 | Pesos abiertos en HuggingFace y ModelScope |
| Hy-MT2-7B | 7 B (denso) | no disponible | no disponible | 0,8747 | 0,6079 | 0,5139 | no disponible en la información proporcionada |
| TranslateGemma-12B | 12 B (denso) | no disponible | no disponible | 0,8732 | 0,3068 | 0,4281 | no disponible en la información proporcionada |
| Qwen3.5-9B (base) | 9 B (denso) | no disponible | no disponible | 0,8316 | 0,0609 | 0,5728 | no disponible en la información proporcionada |
| North-Small-Translate | 218 B totales / 25 B activos (MoE) | no disponible | no disponible | 0,8784 | 0,5294 | 0,6836 | no disponible en la información proporcionada |

Frente a los modelos comparados, la ventaja más marcada de Index-Translate-9B está en el seguimiento de instrucciones de traducción (instTrans IFscore 0,8209 frente a 0,6079 de Hy-MT2-7B y 0,3068 de TranslateGemma-12B) y en el contenido cultural y de memes (0,7387). En calidad de traducción general queda en un rango muy similar a Hy-MT2-7B y TranslateGemma-12B, y por debajo de GPT-5.6-Sol únicamente en las métricas basadas en juez (75,35 frente a 89,10 en WMT26 Judge).

## Limitaciones y advertencias

- Es un modelo especializado en traducción, no un modelo de chat general: usarlo como asistente conversacional fuera de ese dominio no está respaldado por la información disponible.
- Tasa off-target del 3,47%: la más baja entre los sistemas comparados en el informe, pero no nula; existe riesgo de generar contenido que no está en el original al resolver ambigüedad o contextos no literales.
- Calidad desigual según recursos del idioma: 0,5222 en calidad de baja recursos frente a 0,8789 en FLORES general. Los idiomas con pocos recursos siguen siendo el punto débil.
- Los resultados proceden del informe técnico del propio desarrollador y de sus ajustes de evaluación; no se han verificado de forma independiente en la información proporcionada.
- La model card consultada está truncada y el inventario completo de idiomas no está incluido: la cifra de 150 idiomas es una declaración del autor y no se puede contrastar con la lista completa.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en documentos largos con este checkpoint de texto, que además se distingue de los modelos de documentos largos de la familia, con interfaces y coberturas propias.
- Sesgos: no se documentan en la información disponible evaluaciones de sesgo ni medidas de mitigación. Al trabajar con contenido cultural, de memes y de redes sociales, el modelo puede reproducir estereotipos presentes en los datos de entrenamiento.
- Licencia Apache-2.0: permite uso comercial y modificación sin restricciones conocidas. No obstante, el modelo deriva del backbone Qwen3.5, cuya licencia base no se especifica en la información disponible; conviene verificarla antes de un despliegue comercial.
- El repositorio ocupa 38,6 GB, más del doble de lo que ocuparían los pesos en bf16; es necesario comprobar qué artefactos adicionales contiene antes de planificar el almacenamiento y el despliegue.
- No se documentan en la información disponible cuantizaciones oficiales, por lo que las opciones de despliegue en hardware de gama baja dependen de conversiones de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IndexTeam/Index-Translate-9B
- Organización IndexTeam en HuggingFace: https://huggingface.co/IndexTeam
- Demo online: https://index-translate.bilibili.com/
- Repositorio GitHub: https://github.com/bilibili/Index-Translate
- Informe técnico (PDF): https://github.com/bilibili/Index-Translate/blob/main/docs/Index_Translate_Series_Technical_Report.pdf
- Colección en HuggingFace: https://huggingface.co/collections/IndexTeam/index-translate
- Colección en ModelScope: https://www.modelscope.cn/collections/IndexTeam/Index-Translate
- Noticia sobre la publicación (Phemex): https://phemex.com/news/article/bilibili-opensources-indextranslate-model-supporting-150-languages-98353
- Anuncio de ModelScope: https://x.com/ModelScope2022/status/2105267464531750975
- Artículo sobre la publicación (PANews): https://panews.io/articles/01a0f2b8-887c-72f6-b3a6-d8f6fa368e66
