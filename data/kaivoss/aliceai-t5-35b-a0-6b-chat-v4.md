# kaivoss/AliceAI-T5-35B-A0.6B-chat-v4

## Resumen

AliceAI-T5-35B-A0.6B-chat-v4 es un modelo de generacion de texto publicado por el usuario kaivoss en HuggingFace. Se trata de un ajuste fino conversacional del modelo base yandex/AliceAI-T5-35B-A0.6B, un transformer encoder-decoder con arquitectura de mezcla de expertos (MoE) y objetivo de preentrenamiento UL2. El resultado publicado es un merge en bf16 de un adaptador LoRA (kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v4) sobre los pesos del modelo base.

El modelo cuenta con 34.354.449.408 parametros totales segun los pesos en safetensors, y la nomenclatura "A0.6B" del nombre indica aproximadamente 0.6 mil millones de parametros activos por token, lo que situa la relacion entre capacidad total y coste de inferencia en un rango de activacion en torno al 1,7 por ciento. El repositorio ocupa 68,7 GB, coherente con pesos en bf16.

La relevancia de esta ficha es limitada por la escasez de informacion publicada: no hay licencia declarada, no hay idiomas declarados, no hay resultados de evaluacion en la propia pagina del modelo y el numero de descargas y likes es cero en el momento de la consulta. La model card remite explicitamente a la ficha del adaptador LoRA para consultar el uso, la plantilla de chat, la receta de entrenamiento y la evaluacion, por lo que buena parte de los datos tecnicos no estan disponibles en esta pagina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con mezcla de expertos (MoE), familia T5, objetivo UL2 |
| Parametros totales | 34.354.449.408 (34,35 mil millones) |
| Parametros activos | aproximadamente 0,6 mil millones segun la nomenclatura A0.6B del nombre (no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; los pesos publicados estan en bf16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16) |
| Modelo base | yandex/AliceAI-T5-35B-A0.6B |
| Tipo de ajuste | merge de LoRA (kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v4) sobre el base en bf16 |
| Tamano del repositorio | 68,7 GB |
| Libreria | transformers (requiere custom_code: aliceai_t5_moe) |
| Tarea declarada | text2text-generation |
| Fecha de publicacion | 2026-10-01 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder de tipo T5 con capas de mezcla de expertos, identificada en los tags del repositorio mediante el identificador de arquitectura personalizada `aliceai_t5_moe` y el tag `ul2`. El objetivo UL2 combina varios modos de denoising (span corruption de distintos tamanos y modos de prefijo) en un mismo preentrenamiento, lo que en la practica habilita tanto generacion condicionada como tareas de tipo relleno de huecos. El uso de MoE implica que solo un subconjunto de expertos se activa por token, de ahi la diferencia entre los 34,35 mil millones de parametros almacenados y los aproximadamente 0,6 mil millones activos que sugiere el nombre. La integracion en transformers requiere cargar codigo personalizado (`custom_code`), lo que implica `trust_remote_code=True` y la ejecucion de codigo del repositorio.

Sobre el entrenamiento, la informacion disponible es minima. La model card indica unicamente que se trata de un merge en bf16 del adaptador LoRA `kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v4` sobre `yandex/AliceAI-T5-35B-A0.6B`, y remite a la pagina del adaptador para la receta de entrenamiento, la plantilla de chat y la evaluacion. Por tanto, no se dispone en esta ficha del numero de tokens de entrenamiento, la composicion del dataset, ni de si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. El tag `tool-use` sugiere que el ajuste incluyo datos orientados a uso de herramientas, pero no hay detalle publicado al respecto.

## Capacidades

- Generacion de texto condicionada en formato encoder-decoder (entrada de texto, salida de texto), segun la tarea declarada `text2text-generation`.
- Uso de herramientas (tool calling), inferido del tag `tool-use` de la model card; no hay formato ni esquema documentado en esta pagina.
- Capacidad conversacional multi-turno, derivada de la plantilla de chat referenciada pero no incluida en esta ficha.
- Razonamiento tipo denoising y relleno de huecos, herencia previsible del objetivo UL2 del modelo base.
- Eficiencia de inferencia por activacion dispersa: al activar en torno a 0,6 mil millones de parametros por token, el coste de computo por token es muy inferior al de un modelo denso de 34 mil millones.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles; no hay indicios de soporte multimodal.

## Casos de uso

- Servicio conversacional de atencion al cliente: el modelo puede gestionar dialogos multi-turno en formato encoder-decoder, con la ventaja de que el coste por token se mantiene bajo gracias a la activacion dispersa de expertos. Requiere validar previamente el idioma y la plantilla de chat en la ficha del adaptador LoRA.
- Generacion de texto a escala con presupuesto de computo ajustado: al activar solo una fraccion pequena de los parametros, es adecuado para despliegues donde el throughput por GPU es la restriccion principal, siempre que se acepte la penalizacion de memoria por alojar los 34,35 mil millones de parametros.
- Sistemas de resumen y reescritura de documentos: la naturaleza encoder-decoder y el preentrenamiento UL2 encajan con tareas de transformacion texto-a-texto con instrucciones, como resumir actas, correos o informes.
- Asistentes con uso de herramientas: el tag `tool-use` indica que fue ajustado para invocar funciones externas, lo que permitiria integrarlo en flujos de automatizacion que consultan APIs, bases de datos o servicios internos, previa verificacion del formato esperado.
- Generacion asistida dentro de pipelines de procesamiento por lotes: al ser un modelo seq2seq, se integra de forma natural en colas de trabajos offline (clasificacion generativa, extraccion con formato, normalizacion de texto) donde la latencia no es critica.
- Prototipado e investigacion sobre arquitecturas MoE: el modelo sirve como objeto de estudio para experimentos de enrutamiento de expertos, comparacion de objetivos UL2 frente a causal LM y evaluacion de merges de LoRA a escala de 34 mil millones de parametros.
- Base para nuevos ajustes por LoRA: al estar publicado como merge en bf16 y con codigo personalizado, puede reutilizarse como punto de partida para adaptaciones especificas de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio remite a la ficha de `kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v4` para consultar la evaluacion, pero no se incluyen cifras en la pagina consultada.

## Requisitos de hardware

- VRAM estimada para los pesos en bf16: en torno a 69 GB solo para el modelo, mas overhead de activaciones y cache. Con el repositorio de 68,7 GB, es coherente con un despliegue en dos GPU de 48 GB o en una GPU de 80 GB con margen ajustado.
- Cuantizacion a 8 bits: aproximadamente 35-37 GB de pesos, viable en una A100 40 GB con contexto corto o en dos GPU de 24 GB.
- Cuantizacion a 4 bits: aproximadamente 18-20 GB de pesos, viable en una RTX 4090 (24 GB) o en una L40S, siempre que la implementacion soporte cuantizacion de este modelo MoE concreto.
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16 sin cuantizar; A100 40 GB o 2x RTX 4090 para 8 bits; RTX 4090, RTX 6000 Ada o L40S para 4 bits.
- Cabe en GPU de consumo: si, en el rango de 4 bits y con contexto limitado, en tarjetas de 24 GB. En bf16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: la libreria declarada es transformers, con `trust_remote_code=True` por el codigo personalizado `aliceai_t5_moe`. El soporte en vLLM, llama.cpp, Ollama o TGI no esta confirmado y depende de que esas herramientas reconozcan la arquitectura MoE personalizada y de que existan pesos GGUF, que no se anuncian.
- Latencia y throughput: no disponibles. Como referencia estructural, al activar aproximadamente 0,6 mil millones de parametros por token, el coste de computo por token deberia ser comparable al de un modelo denso de ese orden, mientras que el consumo de memoria se mantiene en el rango de los 34 mil millones de parametros totales.

## Comparativa con modelos similares

Los datos publicos disponibles solo permiten comparar con el modelo base y con el adaptador del que deriva este merge. No se dispone de informacion verificada de otros modelos comparables en el material proporcionado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kaivoss/AliceAI-T5-35B-A0.6B-chat-v4 | 34,35 mil millones totales, ~0,6 mil millones activos | no disponible | no disponible | HuggingFace, 0 descargas | Merge bf16 de LoRA sobre el base |
| yandex/AliceAI-T5-35B-A0.6B | 34,35 mil millones totales (presumiblemente los mismos) | no disponible | no disponible | HuggingFace | Modelo base preentrenado con UL2 y MoE |
| kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v4 | adaptador LoRA sobre el base | no disponible | no disponible | HuggingFace | Contiene la receta de entrenamiento, plantilla de chat y evaluacion |
| Otros modelos MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | Sin datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin una licencia explicita, el uso comercial y la redistribucion quedan en un limbo legal. Es imprescindible aclararlo con el autor antes de cualquier despliegue en produccion.
- Ausencia de idiomas declarados: no se puede asumir soporte de castellano ni de ningun otro idioma concreto. Hay que validarlo empiricamente.
- Sin evaluacion publicada en este repositorio: no hay datos de calidad, alineacion, tasas de alucinacion ni rendimiento en tareas estandar.
- Riesgo de alucinacion: inherente a cualquier modelo generativo y no cuantificado en este caso por falta de benchmarks.
- Codigo personalizado: el tag `custom_code` y el identificador `aliceai_t5_moe` implican ejecutar codigo del repositorio con `trust_remote_code=True`, lo que supone un riesgo de seguridad que debe auditarse antes de cargar el modelo en entornos con datos sensibles.
- Inconsistencia de nomenclatura: la model card se titula `AliceAI-T5-35B-A0.6B-chat-v2 (merged)` mientras que el identificador del repositorio es `chat-v4`. Conviene verificar que version de pesos se esta utilizando realmente.
- Soporte de herramientas no documentado: el tag `tool-use` no viene acompanado del esquema de llamadas ni de ejemplos en esta pagina, lo que obliga a consultar la ficha del adaptador LoRA.
- Trazabilidad del linaje limitada: el modelo base pertenece a yandex, pero no se detalla la composicion del dataset de preentrenamiento ni del ajuste, lo que dificulta evaluar sesgos y procedencia de los datos.
- Huella de memoria elevada: 68,7 GB de pesos en bf16 implican requisitos de infraestructura serios pese al bajo numero de parametros activos.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Pagina del modelo: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-v4
- Modelo base: https://huggingface.co/yandex/AliceAI-T5-35B-A0.6B
- Adaptador LoRA con receta de entrenamiento, plantilla de chat y evaluacion: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v4
- Paper del objetivo UL2: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demos: no disponibles en la informacion proporcionada
