# IndexTeam/Index-Translate-35B-A3B-preview-before-replacement-20261003

## Resumen

Index-Translate-35B-A3B-preview es un modelo de traducción multilingüe de tipo mezcla de expertos (MoE) con 35.000 millones de parámetros totales y 3.000 millones activos por token, desarrollado por IndexTeam (equipo vinculado a bilibili) y construido sobre la arquitectura Qwen3.5. Forma parte de la familia Index-Translate, que también incluye variantes de 2B y 9B, y está especializado en traducción de texto con seguimiento de instrucciones: no es un modelo generalista, sino un sistema afinado para traducir respetando glosarios, formato, estilo y estructura. La model card declara cobertura de 150 idiomas y capacidades de traducción con restricciones duras (terminología obligatoria, preservación de JSON/CSV/markdown, bloques de código y marcadores de posición) y blandas (tono, registro, desambiguación por dominio).

El checkpoint publicado es una vista previa (`preview-before-replacement-20261003`) que se corresponde con el modelo evaluado en el informe técnico arXiv:2609.40181. Según los datos de la propia model card, obtiene el mejor resultado de su comparativa en FLORES COMET-22 (0,8794) y en instTrans IFscore (0,8336), y también el mejor rendimiento en lenguas de bajos recursos dentro de la familia, con un 2,4 % de salidas fuera de objetivo en FLORES bajos recursos.

Su relevancia actual radica en el nicho: frente a modelos de traducción densos de tamaño comparable o mayor (TranslateGemma-12B, North-Small-Translate 218B-A25B), consigue adherencia a instrucciones muy superior con solo 3.000 millones de parámetros activos, lo que abarata la inferencia. La licencia Apache 2.0 y el formato safetensors facilitan su integración en producción, aunque el repositorio no documenta longitud de contexto, esquema de cuantización ni inventario completo de idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre Qwen3.5; etiqueta de arquitectura `qwen3_5_moe` |
| Parámetros totales | 35.000 millones (35B) |
| Parámetros activos | 3.000 millones (3B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio no documenta el esquema; su tamaño de 19,4 GB sugiere pesos almacenados por debajo de bf16) |
| Idiomas soportados | 150 idiomas según la model card; el inventario completo se remite al informe técnico y no se detalla en el repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | translation |
| Descargas / likes | 81 descargas, 11 likes |
| Fecha de creación / actualización | 2026-09-30 / 2026-10-02 |
| Tamaño del repositorio | 19,4 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con 35B de parámetros totales y 3B activos, derivado de Qwen3.5. El informe técnico describe un entrenamiento en tres fases. La primera es un *mid-training* multilingüe compartido entre los tamaños de la familia, con repetición de texto general, texto monolingüe, traducciones paralelas ordinarias y grupos multilingües organizados por pivote; la etapa constante usa datos generales, paralelos y monolingües en proporción 1:1:1, y la etapa de *decay* usa datos generales, de pivote central y de pivote completo en proporción 1:4:2. El recetario compartido suma 167,77B de tokens.

La segunda fase aplica SFT especializado y RL por tareas: traducción general, seguimiento de instrucciones y traducción de memes reciben supervisión específica. El RL de traducción general combina XCOMET-XXL con juicios de validez lingüística y adecuación; el RL de instrucciones usa Rubric-as-Reward con comprobaciones duras y restricciones graduadas, y RIVAL aporta supervisión adaptativa del juez. La tercera fase integra expertos mediante interpolación de parámetros y después aplica destilación on-policy multi-profesor (MOPD) para corregir los tipos de tarea que siguen flojos tras la fusión. El informe especifica pesos de interpolación de expertos 0,8 / 0,1 / 0,1 para los modelos evaluados de 2B y 9B, pero no asigna esos pesos a la vista previa de 35B-A3B.

## Capacidades

- Traducción multilingüe general: frases, artículos, subtítulos y otros textos en el inventario de idiomas soportado (150 idiomas declarados).
- Restricciones duras de traducción: aplicación estricta de glosarios (术语强制对齐), preservación de datos estructurados (JSON, CSV, formato markdown), bloques de código y marcadores de variables como `{variable}` o `[123456]`.
- Restricciones blandas: adaptación de tono y registro (formal, coloquial, estilo de redes sociales o memes) y desambiguación por dominio y contexto (por ejemplo, distinguir el sentido industrial del botánico de un término).
- Traducción social y cultural: interpretación de alias de comunidad, grafías lúdicas, memes y expresiones no literales atendiendo al significado pretendido.
- Seguimiento de instrucciones de traducción relativas a terminología, formato, estilo, estructura, contexto y longitud de salida.
- Capacidades de tool calling / function calling: no documentadas en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades de visión, audio o modo *thinking*: no documentadas para este checkpoint; la model card indica que los modelos de voz y de documentos largos de la familia tienen interfaces y coberturas propias.

## Casos de uso

- Localización de software: el modelo puede traducir cadenas de interfaz conservando marcadores de posición (`{variable}`, `[123456]`), bloques de código y estructuras JSON o CSV sin romper el formato, gracias a sus restricciones duras verificadas (IFMTBench XCOMET-XXL 0,7926 e IFscore 0,8991).
- Traducción de documentación técnica con glosario obligatorio: la aplicación estricta de terminología permite fijar un glosario por producto y garantizar consistencia entre versiones y equipos.
- Subtitulado y doblaje a escala: la cobertura de 150 idiomas declarada y su especialización en estilo permiten adaptar subtítulos manteniendo longitud y registro, con la ventaja de que solo 3B de parámetros activos reducen el coste por token.
- Atención al cliente multilingüe: se puede usar como capa de traducción en conversaciones multi-turno, adaptando el tono (formal o coloquial) según el canal y desambiguando términos por contexto de dominio.
- Moderación y adaptación de contenido en redes sociales: la puntuación MEME de 0,7405 indica capacidad para interpretar alias de comunidad, grafías alteradas y expresiones no literales, útil para traducir y revisar contenido generado por usuarios.
- Traducción de catálogos de comercio electrónico: preservación de estructuras de datos y de campos variables, lo que permite procesar lotes de fichas de producto sin reescritura posterior.
- Pipelines de traducción automática en producción: al ser un modelo de traducción dedicado con licencia Apache 2.0, puede sustituir a APIs propietarias en flujos internos donde la adherencia a instrucciones y el control de terminología son críticos.
- Traducción de documentación legal o normativa: el modo de restricciones duras permite forzar terminología jurídica fijada y mantener la estructura de cláusulas y referencias cruzadas.

## Benchmarks y rendimiento

Resultados reproducidos del informe técnico según la model card. WMT26 Judge usa escala 0–100; el resto de columnas, escala 0–1. En todas ellas, mayor es mejor.

| Modelo | FLORES COMET-22 | WMT24++ COMET-22 | WMT26 Judge | instTrans Quality | instTrans IFscore | IFMTBench XCOMET-XXL | IFMTBench IFscore | Vertical mean | MEME |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Index-Translate-35B-A3B (preview) | 0,8794 | 0,8586 | 76,76 | 0,6901 | 0,8336 | 0,7926 | 0,8991 | 0,8438 | 0,7405 |
| Index-Translate-9B | 0,8789 | 0,8601 | 75,35 | 0,6771 | 0,8209 | 0,7957 | 0,8760 | 0,8451 | 0,7387 |
| Index-Translate-2B | 0,8655 | 0,8489 | 60,26 | 0,5391 | 0,7569 | 0,7712 | 0,7584 | 0,8377 | 0,6443 |
| Hy-MT2-1.8B | 0,8522 | 0,8401 | 49,35 | 0,3181 | 0,4932 | 0,7493 | 0,7161 | 0,8314 | 0,3643 |
| Hy-MT2-7B | 0,8747 | 0,8593 | 60,51 | 0,5143 | 0,6079 | 0,8049 | 0,8741 | 0,8335 | 0,5139 |
| Hy-MT2-30B-A3B | 0,8787 | 0,8624 | 66,81 | 0,5725 | 0,6415 | 0,8177 | 0,9029 | 0,8459 | 0,5812 |
| TranslateGemma-12B | 0,8732 | 0,8524 | 71,19 | 0,4515 | 0,3068 | 0,8023 | 0,2892 | 0,8347 | 0,4281 |
| North-Small-Translate (218B-A25B) | 0,8784 | 0,8578 | 68,37 | 0,5697 | — | — | — | — | — |

La model card no publica el resto de columnas para North-Small-Translate. Datos adicionales declarados para lenguas de bajos recursos: en FLORES, COMET-22 0,8168 y XCOMET-XXL 0,7164 con un 2,4 % de salidas fuera de objetivo; en instTrans de bajos recursos, 0,5151 de calidad y 0,7715 de IFscore, con un 4,05 % de salidas fuera de objetivo. Son las mejores cifras de la familia en FLORES bajos recursos según la model card. No se publican resultados de MMLU, HumanEval ni GSM8K, que quedan fuera del alcance del modelo.

## Requisitos de hardware

Estimaciones calculadas a partir del número de parámetros; el repositorio no publica requisitos oficiales ni el esquema de cuantización.

- Peso de los pesos en memoria (solo parámetros, sin caché KV ni activaciones): en bf16, aproximadamente 70 GB; en FP8, aproximadamente 35 GB; en 4 bits, aproximadamente 18–20 GB. El repositorio ocupa 19,4 GB, coherente con un almacenamiento por debajo de bf16.
- GPU recomendadas: para bf16, H100 80 GB o 2× A100 80 GB; para FP8, A100 80 GB, H100 o L40S 48 GB; para 4 bits, RTX 4090 24 GB, RTX 5090 32 GB o 2× RTX 3090.
- ¿Cabe en GPU de consumo? En bf16 no. Con cuantización de 4 bits sí es viable en GPUs de consumo con 24 GB o más de VRAM, siempre que la caché KV y el contexto usado lo permitan.
- Nota de eficiencia: al activar solo 3B de parámetros por token, el coste computacional por token es bajo, pero el modelo sigue siendo limitado por ancho de banda de memoria, ya que debe residir completo (o con los expertos repartidos) en VRAM.
- Opciones de despliegue: vLLM, SGLang, TGI, llama.cpp y Ollama son los candidatos habituales para un MoE en safetensors, pero el soporte efectivo de la arquitectura `qwen3_5_moe` en cada uno de ellos no está documentado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | FLORES COMET-22 | WMT26 Judge | instTrans IFscore | MEME | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| Index-Translate-35B-A3B (preview) | 35B / 3B | no disponible | 0,8794 | 76,76 | 0,8336 | 0,7405 | Apache 2.0 | HuggingFace, ModelScope, demo online |
| Hy-MT2-30B-A3B | 30B / 3B | no disponible | 0,8787 | 66,81 | 0,6415 | 0,5812 | no disponible | comparado en el informe, disponibilidad no detallada |
| Qwen3.5-35B-A3B | 35B / 3B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | modelo base citado como referencia de tamaño |
| TranslateGemma-12B | 12B / denso | no disponible | 0,8732 | 71,19 | 0,3068 | 0,4281 | no disponible | comparado en el informe |
| North-Small-Translate | 218B / 25B | no disponible | 0,8784 | 68,37 | no disponible | no disponible | no disponible | comparado en el informe |

La ventaja diferencial del modelo es la adherencia a instrucciones: 0,8336 de instTrans IFscore frente a 0,6415 de Hy-MT2-30B-A3B y 0,3068 de TranslateGemma-12B, con una calidad de traducción general en FLORES equivalente o ligeramente superior. En calidad pura de traducción dentro de la propia familia, la variante de 9B iguala o supera al 35B-A3B en FLORES (0,8789 frente a 0,8794) y en WMT24++ (0,8601 frente a 0,8586), y también en Vertical mean (0,8451 frente a 0,8438).

## Limitaciones y advertencias

- Es un modelo especializado en traducción: no está pensado para generación general, razonamiento, código o matemáticas, y no se publican resultados en esos dominios.
- El repositorio no documenta la longitud de contexto, dato crítico para traducción de documentos largos.
- El inventario de los 150 idiomas no se detalla en el repositorio; solo se remite al informe técnico, por lo que la cobertura real por idioma no se puede verificar con la información disponible.
- El nombre del repositorio indica que se trata de una vista previa sujeta a sustitución (`preview-before-replacement-20261003`), lo que implica que puede ser reemplazada por un checkpoint posterior.
- Tasa de salidas fuera de objetivo en lenguas de bajos recursos: 2,4 % en FLORES y 4,05 % en instTrans de bajos recursos. Es un fallo relevante en producción y requiere validación por idioma.
- En instTrans de bajos recursos la calidad cae a 0,5151, muy por debajo del rendimiento general (0,6901), lo que indica degradación notable fuera de los pares de idiomas mejor dotados.
- Riesgo de alucinación y de traducción plausible pero incorrecta: los modelos de traducción generativos pueden producir contenido no presente en el original, especialmente con entradas ruidosas, muy cortas o con jerga.
- Los pesos de interpolación de expertos (0,8 / 0,1 / 0,1) se documentan para los modelos de 2B y 9B, no para esta vista previa de 35B-A3B, lo que limita la reproducibilidad exacta del entrenamiento.
- Las comparativas de benchmark se aplican a los datos y ajustes de evaluación del informe técnico, con escalas de métrica distintas entre columnas; no son directamente extrapolables a otros dominios.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones del modelo base Qwen3.5 sobre el que se construye, ya que no se detallan en la información disponible.
- Los sesgos del modelo base y de los datos de entrenamiento (dominio, idioma, registro) no se documentan, por lo que no se pueden cuantificar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IndexTeam/Index-Translate-35B-A3B-preview-before-replacement-20261003
- Demo online: https://index-translate.bilibili.com/
- Repositorio GitHub: https://github.com/bilibili/Index-Translate
- Informe técnico (arXiv): https://arxiv.org/abs/2609.40181
- Colección en HuggingFace: https://huggingface.co/collections/IndexTeam/index-translate
- Colección en ModelScope: https://www.modelscope.cn/collections/IndexTeam/Index-Translate

Nota: la búsqueda web realizada no devolvió resultados relacionados con este modelo; los enlaces anteriores proceden exclusivamente de la model card del repositorio.
