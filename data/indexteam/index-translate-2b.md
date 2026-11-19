# IndexTeam/Index-Translate-2B

## Resumen

Index-Translate-2B es un modelo de traduccion multilingue de 2.274 millones de parametros desarrollado por IndexTeam (Bilibili), construido sobre la arquitectura Qwen3.5. Forma parte de la familia Index-Translate, que incluye variantes de 9B y 35B-A3B, y esta disenado especificamente para traduccion de texto e imagen a texto en 150 idiomas, con capacidad de seguir instrucciones complejas de traduccion como glosarios obligatorios, preservacion de formato estructurado y adaptacion de estilo.

El modelo resuelve el problema de la traduccion automatizada con restricciones: no solo traduce, sino que respeta terminologia forzada, mantiene estructuras JSON/CSV/markdown, preserva placeholders de variables y adapta el tono (formal, informal, memes). Incorpora capacidades multimodales de traduccion de imagen a texto mediante encoders visuales complementarios (mmproj), sin necesidad de OCR externo.

Es relevante ahora porque supera a Hy-MT2-1.8B en todas las metricas principales de traduccion reportadas, y su licencia Apache 2.0 permite uso comercial sin restricciones. El checkpoint fue actualizado en octubre de 2026 y acumula 2.200 descargas y 81 likes en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5 (qwen3_5) |
| Parametros totales | 2.274.069.824 (2,27B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; repo de 9,1 GB) |
| Idiomas soportados | 150 idiomas (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, un transformer denso de 2,27B parametros. El entrenamiento descrito en el informe tecnico sigue tres fases. Primero, un mid-training multilingue compartido con replay de texto general, texto monolingue, traducciones paralelas ordinarias y grupos multilingues organizados por pivot; la etapa constante usa datos general/paralelo/monolingue en proporcion 1:1:1 y la etapa de decay usa general/core-pivot/full-pivot en 1:4:2, sumando 167,77B tokens en total.

Despues, se aplica SFT y RL especificos por tarea: traduccion general, seguimiento de instrucciones y traduccion de memes. El RL de traduccion general combina XCOMET-XXL con juicios de validez de idioma y adecuacion; el RL de instrucciones usa Rubric-as-Reward con comprobaciones duras y restricciones graduadas; RIVAL aporta supervision adaptativa de juez. Finalmente, se integran especialistas mediante interpolacion de parametros y destilacion on-policy multi-profesor (MOPD) para las tareas que quedan debiles tras la fusion. El checkpoint 2B combina los especialistas general, instrucciones y memes con pesos 0,8/0,1/0,1 y recibe MOPD dirigido.

## Capacidades

- Traduccion de texto multilingue en 150 idiomas: frases, articulos, subtitulos y documentos.
- Traduccion multimodal de imagen a texto de extremo a extremo sin OCR externo, mediante encoders visuales complementarios (mmproj).
- Seguimiento de instrucciones de traduccion con restricciones duras: glosario obligatorio, preservacion de JSON/CSV/markdown, bloques de codigo y placeholders de variables (`{variable}`, `[123456]`).
- Restricciones blandas: adaptacion de tono (formal, informal, estilo redes sociales/meme) y desambiguacion por dominio y contexto (por ejemplo, sentido industrial frente a botanico).
- Traduccion social y cultural: interpretacion de alias de comunidad, grafias ludicas, memes y expresiones no literales.
- Capacidad de seguir instrucciones de formato, estructura y longitud de salida.
- No se documenta soporte de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Traduccion de documentacion tecnica con glosario obligatorio: el modelo aplica terminologia forzada y preserva bloques de codigo y placeholders, adecuado para equipos que mantienen coherencia terminologica entre idiomas.
- Localizacion de interfaces y ficheros estructurados: mantiene formato JSON, CSV y markdown intacto mientras traduce los valores, lo que permite integrarlo en pipelines de localizacion automatizados.
- Traduccion de subtitulos y contenido audiovisual: soporta frases y articulos en 150 idiomas, con control de longitud de salida para respetar limites de caracteres por linea.
- Traduccion de imagenes en aplicaciones de mensajeria o e-commerce: al traducir imagen a texto sin OCR externo, puede procesar capturas, carteles o fichas de producto directamente.
- Moderacion y traduccion de contenido generado por usuarios: interpreta memes, alias de comunidad y expresiones no literales, util para plataformas con jerga juvenil o regional.
- Atencion al cliente multilingue: traduce conversaciones entre agentes y usuarios preservando variables de plantilla y tono, con la ventaja de su licencia Apache 2.0 para despliegue comercial.
- Traduccion de documentacion juridica o medica con desambiguacion de dominio: las restricciones blandas permiten distinguir sentidos especializados de terminos polisemicos.

## Benchmarks y rendimiento

Resultados del informe tecnico. WMT26 Judge usa escala 0-100; el resto, 0-1. Mayor es mejor excepto en tasas de salida fuera de objetivo.

| Modelo | FLORES COMET-22 | WMT24++ COMET-22 | WMT26 Judge | instTrans Quality | instTrans IFscore | IFMTBench XCOMET-XXL | IFMTBench IFscore | Vertical mean | MEME |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Index-Translate-35B-A3B (preview) | 0,8794 | 0,8586 | 76,76 | 0,6901 | 0,8336 | 0,7926 | 0,8991 | 0,8438 | 0,7405 |
| Index-Translate-9B | 0,8789 | 0,8601 | 75,35 | 0,6771 | 0,8209 | 0,7957 | 0,8760 | 0,8451 | 0,7387 |
| **Index-Translate-2B** | 0,8655 | 0,8489 | 60,26 | 0,5391 | 0,7569 | 0,7712 | 0,7584 | 0,8377 | 0,6443 |
| Hy-MT2-1.8B | 0,8522 | 0,8401 | 49,35 | 0,3181 | 0,4932 | 0,7493 | 0,7161 | 0,8314 | 0,3643 |
| Hy-MT2-7B | 0,8747 | 0,8593 | 60,51 | 0,5143 | 0,6079 | 0,8049 | 0,8741 | 0,8335 | 0,5139 |
| Hy-MT2-30B-A3B | 0,8787 | 0,8624 | 66,81 | 0,5725 | 0,6415 | 0,8177 | 0,9029 | 0,8459 | 0,5812 |
| TranslateGemma-12B | 0,8732 | 0,8524 | 71,19 | 0,4515 | 0,3068 | 0,8023 | 0,2892 | 0,8347 | 0,4281 |

En traduccion de instrucciones con recursos limitados, el modelo obtiene 0,3050 de calidad y 0,6586 de IFscore, con un 3,97% de salidas fuera de objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 4,5-5 GB solo para pesos, mas overhead de activaciones y cache KV (no disponible el contexto, por lo que el calculo de cache no puede precisarse).
- En cuantizacion de 8 bits: alrededor de 2,3-3 GB; en 4 bits: aproximadamente 1,2-1,8 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion con lotes grandes; RTX 4090 o RTX 3090 para inferencia en FP16 con margen amplio.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 3070) y en 4-6 GB si se cuantiza.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama si se generan pesos GGUF (no se confirma su disponibilidad); al ser safetensors, es compatible con transformers y frameworks que carguen pesos nativos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FLORES COMET-22 | WMT26 Judge | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Index-Translate-2B | 2,27B | no disponible | 0,8655 | 60,26 | Apache 2.0 | Hugging Face, ModelScope |
| Hy-MT2-1.8B | 1,8B | no disponible | 0,8522 | 49,35 | no disponible | Hugging Face |
| Hy-MT2-7B | 7B | no disponible | 0,8747 | 60,51 | no disponible | Hugging Face |
| TranslateGemma-12B | 12B | no disponible | 0,8732 | 71,19 | no disponible | Hugging Face |

Index-Translate-2B supera a Hy-MT2-1.8B en todas las metricas principales y se acerca a Hy-MT2-7B en WMT26 Judge (60,26 frente a 60,51) con menos de un tercio de los parametros. Frente a TranslateGemma-12B, queda por debajo en WMT26 Judge pero lo supera ampliamente en IFMTBench IFscore (0,7584 frente a 0,2892).

## Limitaciones y advertencias

- No se documentan sesgos conocidos en la informacion disponible; como modelo multilingue entrenado con datos web, es probable que herede sesgos de sus corpus, pero no hay evaluacion publicada al respecto.
- Riesgo de alucinacion en traduccion de expresiones idiomaticas o memes poco representados; el 3,97% de salidas fuera de objetivo en instrucciones de bajos recursos indica que puede producir texto en el idioma equivocado.
- La longitud de contexto no esta documentada, lo que impide garantizar el rendimiento en documentos largos.
- El inventario exacto de los 150 idiomas solo se detalla en el informe tecnico; no se especifica en la model card.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero conviene verificar las licencias de los encoders visuales mmproj si se usa la via multimodal.
- No se documentan cuantizaciones oficiales ni pesos GGUF, lo que puede complicar el despliegue en entornos de bajos recursos.
- El modelo esta especializado en traduccion; no se debe esperar un rendimiento de proposito general en razonamiento o codigo.

## Enlaces

- Hugging Face: https://huggingface.co/IndexTeam/Index-Translate-2B
- Demo online: https://index-translate.bilibili.com/
- GitHub: https://github.com/bilibili/Index-Translate
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.40181
- Coleccion Hugging Face: https://huggingface.co/collections/IndexTeam/index-translate
- Coleccion ModelScope: https://www.modelscope.cn/collections/IndexTeam/Index-Translate
