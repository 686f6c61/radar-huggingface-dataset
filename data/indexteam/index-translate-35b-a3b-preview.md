# IndexTeam/Index-Translate-35B-A3B-preview

## Resumen

Index-Translate-35B-A3B-preview es un modelo de traduccion multilingue de tipo mixture-of-experts (MoE) desarrollado por IndexTeam (equipo vinculado a Bilibili), construido sobre la base de Qwen3.5. Con 35.951.822.704 parametros totales y aproximadamente 3B activos por token, esta disenado especificamente para traduccion de texto entre 150 idiomas, con soporte para instrucciones de traduccion que implican terminologia, formato, estilo, estructura, contexto y longitud de salida.

El modelo forma parte de la familia Index-Translate, que incluye variantes de 2B y 9B, y se presenta como una version preview evaluada en el informe tecnico del equipo. Su relevancia actual radica en que combina traduccion multilingue de alta calidad con seguimiento de instrucciones complejas (restricciones duras como glosarios obligatorios y preservacion de JSON/CSV/markdown, y restricciones blandas como adaptacion de tono y desambiguacion de dominio), ademas de traduccion multimodal de imagenes a texto mediante codificadores visuales complementarios (`mmproj`).

Segun el informe tecnico, el modelo obtiene los mejores resultados de la comparativa en FLORES COMET-22 (0.8794) e instTrans IFscore (0.8336), y destaca en idiomas de bajos recursos dentro de la familia. La licencia es Apache 2.0 y los pesos se distribuyen en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) basada en Qwen3.5 (tag `qwen3_5_moe`) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B (denominacion A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 150 idiomas (segun model card; inventario detallado en el informe tecnico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 35B parametros totales y aproximadamente 3B activos, construido sobre Qwen3.5. Incorpora codificadores visuales complementarios (`mmproj`) para traduccion end-to-end de imagen a texto sin OCR externo. El entrenamiento descrito en el informe tecnico sigue una receta compartida de mid-training multilingue que totaliza 167.77B tokens, compuesta por replay de texto general, texto monolingue, traducciones paralelas ordinarias y grupos multilingues organizados por pivot. La etapa constante usa datos general/paralelo/monolingue en proporcion 1:1:1, mientras que la etapa de decay usa general/core-pivot/full-pivot en 1:4:2.

Sobre esa base se aplica post-entrenamiento especifico por tarea: SFT y RL para especialistas en traduccion general, seguimiento de instrucciones y traduccion de memes. El RL de traduccion general combina XCOMET-XXL con juicios de validez de idioma y adecuacion; el RL de instrucciones usa Rubric-as-Reward con comprobaciones duras y restricciones graduadas; RIVAL aporta supervision adaptativa de jueces. Finalmente, la integracion de expertos combina especialistas complementarios mediante interpolacion de parametros y destilacion on-policy multi-profesor (MOPD) para las tareas que quedan debiles tras la fusion. El informe especifica pesos de interpolacion 0.8/0.1/0.1 para los modelos evaluados de 2B y 9B, pero no asigna esos pesos al preview de 35B-A3B.

## Capacidades

- Traduccion multilingue de texto entre 150 idiomas: frases, articulos, subtitulos y otros formatos.
- Traduccion multimodal de imagen a texto (image-to-text) end-to-end en 150 idiomas, sin herramientas OCR externas, mediante codificadores visuales `mmproj`.
- Seguimiento de instrucciones de traduccion con restricciones duras: glosarios obligatorios, preservacion de datos estructurados (JSON, CSV, markdown), bloques de codigo y placeholders de variables (por ejemplo `{variable}`, `[123456]`).
- Restricciones blandas: adaptacion de tono estilistico (formal, informal, redes sociales/memes) y desambiguacion por dominio y contexto (por ejemplo, sentido industrial frente a botanico de un termino).
- Traduccion social y cultural: interpretacion de alias de comunidad, grafias ludicas, memes y expresiones no literales atendiendo al significado pretendido.
- Capacidades multilingues amplias segun el inventario de idiomas del informe tecnico.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.

## Casos de uso

- Localizacion de productos software: el modelo puede traducir cadenas de interfaz preservando placeholders (`{variable}`) y bloques de codigo gracias a sus restricciones duras, lo que reduce roturas en pipelines de internacionalizacion.
- Traduccion de documentacion tecnica con glosarios obligatorios: permite imponer terminologia corporativa consistente en manuales y articulos, manteniendo el formato markdown o JSON de origen.
- Subtitulado y traduccion de contenido audiovisual: adecuado para frases, articulos y subtitulos en 150 idiomas, con adaptacion de tono para registro formal o informal segun el publico objetivo.
- Traduccion de imagenes en aplicaciones moviles o web: al soportar image-to-text sin OCR externo, puede integrarse en apps de traduccion de carteles, menus o capturas de pantalla.
- Moderacion y traduccion de contenido en redes sociales: su capacidad para interpretar memes, alias de comunidad y expresiones no literales lo hace util para entender contenido informal multilingue.
- Atencion al cliente multilingue: puede traducir conversaciones y preservar estructuras de datos en integraciones con sistemas de ticketing, aunque la longitud de contexto no esta documentada y debe validarse.
- Traduccion de datos estructurados en pipelines ETL: la preservacion de JSON y CSV permite traducir campos de texto sin romper esquemas en procesos automatizados.

## Benchmarks y rendimiento

Resultados reproducidos del informe tecnico. WMT26 Judge usa escala 0-100; el resto de columnas usan escala 0-1. Mayor es mejor excepto en tasas off-target.

| Modelo | FLORES COMET-22 | WMT24++ COMET-22 | WMT26 Judge | instTrans Quality | instTrans IFscore | IFMTBench XCOMET-XXL | IFMTBench IFscore | Vertical mean | MEME |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Index-Translate-35B-A3B (preview)** | 0.8794 | 0.8586 | 76.76 | 0.6901 | 0.8336 | 0.7926 | 0.8991 | 0.8438 | 0.7405 |
| Index-Translate-9B | 0.8789 | 0.8601 | 75.35 | 0.6771 | 0.8209 | 0.7957 | 0.8760 | 0.8451 | 0.7387 |
| Index-Translate-2B | 0.8655 | 0.8489 | 60.26 | 0.5391 | 0.7569 | 0.7712 | 0.7584 | 0.8377 | 0.6443 |
| Hy-MT2-1.8B | 0.8522 | 0.8401 | 49.35 | 0.3181 | 0.4932 | 0.7493 | 0.7161 | 0.8314 | 0.3643 |
| Hy-MT2-7B | 0.8747 | 0.8593 | 60.51 | 0.5143 | 0.6079 | 0.8049 | 0.8741 | 0.8335 | 0.5139 |
| Hy-MT2-30B-A3B | 0.8787 | 0.8624 | 66.81 | 0.5725 | 0.6415 | 0.8177 | 0. | no disponible | no disponible |

Datos adicionales de la model card para idiomas de bajos recursos: el modelo obtiene el mayor FLORES COMET-22 / XCOMET-XXL (0.8168 / 0.7164) entre los tres modelos Index-Translate, con un 2.4% de salidas off-target. En instTrans de bajos recursos obtiene 0.5151 de calidad / 0.7715 de IFscore, con un 4.05% de salidas off-target.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 35.951.822.704 parametros en safetensors (repo de 71.9 GB), la inferencia en precision completa requiere del orden de 70 GB o mas; en cuantizaciones de 8 bits o 4 bits el requisito se reduce sustancialmente, pero no se han publicado valores oficiales.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabria esperar GPUs de clase A100 80GB o H100 para precision completa; no confirmado.
- Cabe en consumer GPU: no disponible. Con cuantizacion agresiva podria ser viable en GPUs de 24 GB, pero no hay datos oficiales.
- Opciones de despliegue: no disponibles de forma oficial (no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FLORES COMET-22 | WMT26 Judge | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Index-Translate-35B-A3B (preview) | 35B totales / ~3B activos | no disponible | 0.8794 | 76.76 | Apache 2.0 | Hugging Face, ModelScope |
| Hy-MT2-30B-A3B | 30B totales / ~3B activos | no disponible | 0.8787 | 66.81 | no disponible | no disponible |
| Qwen3.5-35B-A3B | 35B totales / ~3B activos | no disponible | no disponible | no disponible | no disponible | no disponible |
| Index-Translate-9B | 9B | no disponible | 0.8789 | 75.35 | Apache 2.0 | Hugging Face, ModelScope |

El preview de 35B-A3B supera a Hy-MT2-30B-A3B en WMT26 Judge (76.76 frente a 66.81) e instTrans IFscore (0.8336 frente a 0.6415), y queda ligeramente por encima del Index-Translate-9B en FLORES COMET-22 (0.8794 frente a 0.8789), aunque el 9B es marginalmente mejor en WMT24++ COMET-22 y Vertical mean.

## Limitaciones y advertencias

- Es una version preview: los resultados publicados corresponden al modelo preview evaluado en el informe tecnico y pueden no reflejar la version final.
- No se documenta la longitud de contexto, lo que limita la planificacion para documentos largos o conversaciones multi-turno extensas.
- No se documentan opciones de cuantizacion ni formatos GGUF, lo que puede complicar el despliegue en entornos de bajos recursos.
- No hay informacion sobre soporte de tool calling, function calling ni razonamiento multi-paso; no debe asumirse su disponibilidad.
- Riesgo de alucinacion y de traducciones no literales: el modelo esta optimizado para interpretar memes y expresiones culturales, lo que puede producir adaptaciones alejadas del texto fuente en contextos que exigen literalidad.
- Tasas off-target documentadas: 2.4% en bajos recursos FLORES y 4.05% en instTrans de bajos recursos; relevante para produccion con idiomas poco representados.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero deben revisarse las condiciones de los codificadores visuales `mmproj` y de los datos de entrenamiento no detallados.
- El inventario completo de idiomas solo esta en el informe tecnico; la model card no lista los 150 idiomas individualmente.

## Enlaces

- Hugging Face: https://huggingface.co/IndexTeam/Index-Translate-35B-A3B-preview
- Demo online: https://index-translate.bilibili.com/
- GitHub: https://github.com/bilibili/Index-Translate
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.40181
- Coleccion Hugging Face: https://huggingface.co/collections/IndexTeam/index-translate
- Coleccion ModelScope: https://www.modelscope.cn/collections/IndexTeam/Index-Translate
