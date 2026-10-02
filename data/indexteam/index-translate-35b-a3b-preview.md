# IndexTeam/Index-Translate-35B-A3B-preview

## Resumen

Index-Translate-35B-A3B-preview es un modelo de traduccion multilingue de arquitectura mixture-of-experts (MoE) desarrollado por el Index Team de Bilibili. Cuenta con 35.000 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token, y esta construido sobre la base de Qwen3.5 (etiqueta de arquitectura `qwen3_5_moe`). Su objetivo es la traduccion de texto entre 150 idiomas, con especial enfasis en el seguimiento de instrucciones de traduccion: terminologia forzada, preservacion de estructura (JSON, CSV, Markdown, bloques de codigo, placeholders) y control de estilo.

El modelo se publica como version "preview" y forma parte de una familia junto a los tamanos 2B y 9B, todos ellos acompanados de un informe tecnico (arXiv:2609.40181) que describe la receta compartida de mid-training multilingue y el post-entrenamiento especifico por tarea. Segun la model card, obtiene los mejores resultados de la familia en FLORES COMET-22 (0.8794) e instTrans IFscore (0.8336) entre todos los sistemas comparados en el informe.

Su relevancia actual radica en dos factores: por un lado, cubre un nicho tradicionalmente dominado por modelos propietarios de traduccion automatica, con licencia Apache 2.0 y pesos en safetensors; por otro, al ser MoE con solo 3B activos, separa el coste de memoria (determinado por los 35B totales) del coste de computo por token (proximo al de un modelo denso de 3B), lo que abarata el despliegue en produccion si se dispone de VRAM suficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE sobre base Qwen3.5 (`qwen3_5_moe`) |
| Parametros totales | 35B |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se confirman pesos en safetensors) |
| Idiomas soportados | 150 idiomas segun la model card (inventario detallado en el informe tecnico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 19,4 GB |
| Pipeline declarado | translation |
| Descargas / likes | 81 / 11 |
| Fecha de creacion / actualizacion | 30-09-2026 / 02-10-2026 |

## Arquitectura y entrenamiento

Se trata de un transformer con capas mixture-of-experts construido sobre Qwen3.5. La model card solo confirma la etiqueta de arquitectura y el reparto 35B totales / 3B activos; no se especifican el numero de capas, el numero de expertos por capa, el mecanismo de enrutamiento ni la longitud de contexto soportada. El repositorio ocupa 19,4 GB, una cifra coherente con pesos almacenados en precision reducida (del orden de 4 bits por parametro) en lugar de BF16, aunque la model card no declara la precision y esta deduccion no esta confirmada por el autor.

El entrenamiento descrito en el informe tecnico se estructura en tres fases. La primera es un mid-training multilingue compartido de 167,77B tokens que combina replay de texto general, texto monolingue, traducciones paralelas ordinarias y grupos multilingues organizados por pivot; la etapa constante usa una proporcion 1:1:1 (general / paralelo / monolingue) y la etapa de decay una proporcion 1:4:2 (general / pivot central / pivot completo). La segunda fase aplica SFT y RL especificos por tarea: traduccion general, seguimiento de instrucciones y traduccion de memes. El RL de traduccion general combina XCOMET-XXL con juicios de validez idiomatica y adecuacion; el de instrucciones usa Rubric-as-Reward con comprobaciones duras y restricciones graduadas; RIVAL aporta supervision adaptativa del juez. La tercera fase integra especialistas mediante interpolacion de parametros y despues aplica destilacion on-policy multi-profesor (MOPD) para corregir las tareas que quedan debiles tras la fusion. El informe detalla pesos de interpolacion 0,8 / 0,1 / 0,1 para los modelos 2B y 9B evaluados, pero no asigna pesos concretos al 35B-A3B preview.

## Capacidades

- Traduccion multilingue general de frases, articulos, subtitulos y otros textos dentro del inventario de 150 idiomas declarado.
- Restricciones duras (硬约束) de traduccion: cumplimiento estricto de glosarios (alineacion terminologica forzada) y preservacion de estructuras de datos como JSON, CSV y Markdown, bloques de codigo y placeholders de variables (por ejemplo `{variable}` o `[123456]`).
- Restricciones blandas (软约束): adaptacion de tono (formal, coloquial, estilo de redes sociales o memes) y desambiguacion por dominio y contexto (por ejemplo, distinguir el sentido industrial frente al botanico de un termino).
- Traduccion social y cultural: interpretacion de alias de comunidad, grafias ludicas, memes y expresiones no literales atendiendo al significado pretendido.
- Seguimiento de instrucciones de traduccion en lo relativo a terminologia, formato, estilo, estructura, contexto y longitud de salida.
- Capacidades de tool calling, function calling, agentes o razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Modalidades adicionales (voz, vision, documento largo): no disponibles para este modelo; la model card indica que los modelos de voz y de documento largo de la familia tienen interfaces y cobertura linguistica propias.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Traduccion de documentacion tecnica con glosario obligatorio: el modelo admite restricciones duras de terminologia, de modo que se puede fijar un glosario por producto y garantizar que terminos como nombres de API o modulos se traduzcan siempre igual, algo critico para mantener coherencia entre versiones de un manual.
- Localizacion de ficheros de recursos y estructuras de datos: al preservar JSON, CSV y Markdown, puede integrarse directamente en un pipeline de localizacion que traduce los valores de un fichero sin romper claves, comas ni indentacion.
- Traduccion de interfaces y plantillas con placeholders: la preservacion de variables del tipo `{variable}` o `[123456]` permite traducir cadenas de aplicaciones sin romper la interpolacion en tiempo de ejecucion.
- Subtitulado y doblaje con control de longitud: la capacidad de seguir instrucciones sobre longitud de salida es util para ajustar subtitulos a un numero maximo de caracteres o a la duracion del segmento de audio.
- Moderacion y traduccion de contenido generado por usuarios: su evaluacion especifica en MEME (0.7405) apunta a un comportamiento razonable con jerga, abreviaturas y expresiones no literales, lo que encaja en plataformas con mucho texto informal multilingue.
- Atencion al cliente multilingue: traduccion en tiempo real de conversaciones entre agente y cliente en idiomas distintos, con adaptacion de tono formal o informal segun el canal.
- Traduccion de documentacion juridica o cientifica con desambiguacion de dominio: las restricciones blandas permiten indicar el dominio para que un termino polisemico se traduzca en el sentido correcto.
- Investigacion en traduccion automatica: al publicarse con licencia Apache 2.0 e informe tecnico detallado, sirve como base para estudiar recetas de mid-training multilingue, RL con jueces automaticos y destilacion multi-profesor.

## Benchmarks y rendimiento

Resultados reproducidos de la model card y del informe tecnico. WMT26 Judge usa escala 0-100; el resto de columnas, escala 0-1. En todas las metricas, mayor es mejor.

| Modelo | FLORES COMET-22 | WMT24++ COMET-22 | WMT26 Judge | instTrans Quality | instTrans IFscore | IFMTBench XCOMET-XXL | IFMTBench IFscore | Vertical mean | MEME |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Index-Translate-35B-A3B (preview) | 0.8794 | 0.8586 | 76.76 | 0.6901 | 0.8336 | 0.7926 | 0.8991 | 0.8438 | 0.7405 |
| Index-Translate-9B | 0.8789 | 0.8601 | 75.35 | 0.6771 | 0.8209 | 0.7957 | 0.8760 | 0.8451 | 0.7387 |
| Index-Translate-2B | 0.8655 | 0.8489 | 60.26 | 0.5391 | 0.7569 | 0.7712 | 0.7584 | 0.8377 | 0.6443 |
| Hy-MT2-1.8B | 0.8522 | 0.8401 | 49.35 | 0.3181 | 0.4932 | 0.7493 | 0.7161 | 0.8314 | 0.3643 |
| Hy-MT2-7B | 0.8747 | 0.8593 | 60.51 | 0.5143 | 0.6079 | 0.8049 | 0.8741 | 0.8335 | 0.5139 |
| Hy-MT2-30B-A3B | 0.8787 | 0.8624 | 66.81 | 0.5725 | 0.6415 | 0.8177 | 0.9029 | 0.8459 | 0.5812 |
| TranslateGemma-12B | 0.8732 | 0.8524 | 71.19 | 0.4515 | 0.3068 | 0.8023 | 0.2892 | 0.8347 | 0.4281 |

La fila correspondiente a North-Small-Translate (218B-A25B) aparece truncada en la informacion disponible: se conocen sus valores de FLORES COMET-22 (0.8784), WMT24++ COMET-22 (0.8578), WMT26 Judge (68.37) e instTrans Quality (0.5697), pero el resto de columnas no estan disponibles. Las entradas relativas a Qwen3.5-35B-A3B y a las lineas base de API no se incluyen en el extracto disponible.

Resultados adicionales en idiomas de bajos recursos citados en la model card: FLORES COMET-22 de 0.8168 y XCOMET-XXL de 0.7164, los mejores de los tres modelos Index-Translate, con un 2,4% de salidas fuera de objetivo (off-target). En instTrans de bajos recursos: 0.5151 de calidad y 0.7715 de IFscore, con un 4,05% de salidas fuera de objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: las cifras siguientes son estimaciones derivadas del numero de parametros totales (35B), no datos publicados por el autor. En BF16, en torno a 70 GB solo para pesos, mas cache KV y activaciones. En FP8, alrededor de 35-40 GB. En cuantizacion de 4 bits, aproximadamente 20-24 GB. El repositorio ocupa 19,4 GB, lo que sugiere que los pesos publicados ya estan en una precision reducida, si bien la model card no lo confirma.
- GPU recomendadas: H100 80 GB o A100 80 GB para BF16 o FP8 con contexto amplio; dos A100 40 GB o dos RTX 6000 Ada 48 GB para reparto por tensor parallelism en precisiones altas.
- Viabilidad en GPU de consumo: si, con cuantizacion. Una RTX 4090 o RTX 3090 de 24 GB puede alojar los pesos en 4 bits, aunque el margen para cache KV y contexto largo sera ajustado; una RTX 5090 de 32 GB ofrece mas holgura. En cualquier caso, el coste de decodificacion es bajo porque solo se activan 3B parametros por token.
- Opciones de despliegue: vLLM, SGLang y TGI son las opciones mas directas para pesos safetensors en un MoE. llama.cpp y Ollama requeririan convertir los pesos a GGUF, y en la informacion disponible no se confirma que existan conversiones publicadas. No se detallan interfaces empaquetadas especificas para este modelo.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo, latencia de primer token ni comportamiento bajo batching.
- Nota de dimensionamiento: la VRAM la determina el total de 35B parametros (todos deben residir en memoria), mientras que el computo por token se aproxima al de un modelo denso de 3B. Concurrencia alta y contextos largos seguiran limitados por la cache KV.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Index-Translate-35B-A3B (preview) | 35B totales / 3B activos | no disponible | FLORES COMET-22 0.8794; instTrans IFscore 0.8336; WMT26 Judge 76.76 | Apache 2.0 | Pesos en safetensors en Hugging Face |
| Index-Translate-9B | 9B | no disponible | FLORES COMET-22 0.8789; instTrans IFscore 0.8209; WMT26 Judge 75.35 | Apache 2.0 | Pesos en Hugging Face |
| Hy-MT2-30B-A3B | 30B totales / 3B activos (segun el informe) | no disponible | FLORES COMET-22 0.8787; instTrans IFscore 0.6415; WMT26 Judge 66.81 | no disponible | Pesos publicados segun el informe |
| TranslateGemma-12B | 12B | no disponible | FLORES COMET-22 0.8732; instTrans IFscore 0.3068; WMT26 Judge 71.19 | no disponible | Pesos publicados segun el informe |
| Qwen3.5-35B-A3B | 35B totales / 3B activos | no disponible | Linea base de modelo general; resultados no incluidos en el extracto disponible | no disponible | no disponible |

La comparacion con Qwen3.5-35B-A3B es la mas directa por arquitectura y tamano, ya que Index-Translate-35B-A3B se construye sobre esa base; sin embargo, sus cifras no aparecen en el extracto de la model card disponible. Frente a Hy-MT2-30B-A3B, el modelo de Index Team obtiene ventajas claras en instTrans IFscore (0.8336 frente a 0.6415), WMT26 Judge (76.76 frente a 66.81) y MEME (0.7405 frente a 0.5812), con una diferencia menor en FLORES COMET-22 (0.8794 frente a 0.8787) y en la media vertical, donde Hy-MT2-30B-A3B queda ligeramente por delante (0.8459 frente a 0.8438). Frente a TranslateGemma-12B la diferencia es mas amplia en seguimiento de instrucciones (0.8336 frente a 0.3068 en instTrans IFscore y 0.8991 frente a 0.2892 en IFMTBench IFscore). North-Small-Translate (218B-A25B) es mucho mayor y sus datos estan incompletos en el extracto disponible.

## Limitaciones y advertencias

- Estado preview: el propio autor etiqueta el modelo como version preliminar y todas las cifras de 35B-A3B corresponden al modelo preview evaluado en el informe tecnico, no a una version final.
- Pesos de interpolacion de expertos no especificados: el informe detalla los pesos 0,8 / 0,1 / 0,1 para los modelos 2B y 9B, pero no los asigna al 35B-A3B preview, lo que dificulta reproducir exactamente la integracion de especialistas.
- Salidas fuera de objetivo: la model card reporta un 2,4% de salidas off-target en FLORES de bajos recursos y un 4,05% en instTrans de bajos recursos. En produccion esto implica que una fraccion de las peticiones puede devolver texto no traducido, en el idioma equivocado o con contenido no solicitado, y conviene validarlo automaticamente.
- Idiomas de bajos recursos: aunque es el mejor de la familia en esa franja, sus cifras absolutas (0.8168 de FLORES COMET-22 y 0.5151 de calidad en instTrans de bajos recursos) son sensiblemente inferiores a las de idiomas con mas recursos, por lo que el rendimiento no es homogeneo en los 150 idiomas declarados.
- Cobertura linguistica no detallada en la informacion disponible: el inventario exacto de los 150 idiomas esta en el informe tecnico, no en la model card, por lo que conviene verificarlo antes de comprometer una combinacion idiomatica concreta.
- Riesgo de alucinacion: no hay datos especificos publicados en la informacion disponible. Como en cualquier modelo de traduccion, la desambiguacion forzada por contexto o la imposicion de glosarios puede producir terminos incorrectos cuando la instruccion no encaja con el texto de origen.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion sin restriccion de campos de uso, siempre que se conserven avisos de copyright y licencia. Los derechos sobre la marca y el nombre del modelo no se ceden implicitamente.
- Coste de memoria en produccion: aunque solo active 3B parametros por token, los 35B totales deben residir en memoria, lo que encarece el despliegue en comparacion con un modelo denso de 3B y obliga a cuantizar para caber en GPU de consumo.
- Ausencia de datos operativos: no hay informacion publicada sobre longitud de contexto, soporte de tool calling, latencia ni throughput, elementos que deben validarse empiricamente antes de integrar el modelo en un sistema en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IndexTeam/Index-Translate-35B-A3B-preview
- Organizacion IndexTeam en Hugging Face: https://huggingface.co/IndexTeam
- Coleccion Index-Translate en Hugging Face: https://huggingface.co/collections/IndexTeam/index-translate
- Demo en linea: https://index-translate.bilibili.com/
- Repositorio GitHub: https://github.com/bilibili/Index-Translate
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.40181
- PDF del informe tecnico: https://arxiv.org/pdf/2609.40181
- Coleccion en ModelScope: https://www.modelscope.cn/collections/IndexTeam/Index-Translate
- Modelos de traduccion en Hugging Face (listado general): https://huggingface.co/models?pipeline_tag=translation
