# NovaStudios/nexa-core-2b-v2-merged

## Resumen

NovaStudios/nexa-core-2b-v2-merged es un modelo publicado en Hugging Face por el usuario NovaStudios, distribuido en formato safetensors y con pipeline declarado de tipo image-text-to-text, lo que indica que acepta imagenes y texto como entrada y genera texto. Segun los metadatos del repositorio contiene 5.104.297.539 parametros (aproximadamente 5,1 mil millones), aunque el identificador del modelo incluye el sufijo "2b", una discrepancia que conviene tener presente. El repositorio ocupa 17,0 GB.

Los tags asociados son transformers, safetensors, gemma4, image-text-to-text, trl, sft, conversational y endpoints_compatible, ademas de una referencia al articulo arXiv:1910.09700 (Lacoste et al., sobre estimacion de emisiones de carbono). Estos tags sugieren, sin confirmacion por parte del autor, un ajuste supervisado (SFT) mediante la libreria TRL sobre una base de la familia Gemma y un uso orientado a conversacion multimodal.

La relevancia de esta ficha es limitada y fundamentalmente cautelar: la model card publicada es la plantilla autogenerada de Hugging Face sin ninguna seccion completada, el autor no declara licencia, idiomas, contexto ni datos de entrenamiento, y el repositorio registraba 0 descargas y 0 "likes" en el momento de la consulta. Cualquier evaluacion de calidad, licencia o idoneidad para produccion queda, por tanto, pendiente de verificacion directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pipeline declarado image-text-to-text; tag "gemma4" en los metadatos, sin confirmar por el autor) |
| Parametros totales | 5.104.297.539 (~5,1 B), segun safetensors |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no consta GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay informacion publicada por el autor sobre la arquitectura interna, el objetivo de entrenamiento, el numero de tokens utilizados ni la composicion del dataset. La unica evidencia disponible son los metadatos: el tag "gemma4" apunta a una base de la familia Gemma, el tag "sft" y la dependencia de la libreria TRL apuntan a un ajuste supervisado, y el sufijo "-merged" del identificador sugiere la fusion de pesos o de adaptadores tras el ajuste. Ninguna de estas inferencias esta confirmada en la model card, que permanece con todos los campos en "[More Information Needed]".

Tampoco se documentan innovaciones tecnicas concretas: no consta el uso de atencion lineal, decodificacion especulativa, mezcla de expertos ni estrategias de RLHF o DPO. El unico elemento trazable es la cita a Lacoste et al. (2019) en la seccion de impacto ambiental de la plantilla, que es un texto generico y no implica que se haya realizado dicho calculo.

## Capacidades

La ausencia de documentacion obliga a distinguir entre lo declarado y lo no verificado:

- Procesamiento de imagen y texto como entrada (declarado por el pipeline image-text-to-text y por el tag correspondiente).
- Generacion de texto en formato conversacional, segun el tag "conversational".
- Ajuste supervisado mediante TRL, segun los tags "trl" y "sft".
- Compatibilidad declarada con endpoints alojados, segun el tag "endpoints_compatible".
- Razonamiento, generacion de codigo y matematicas: no disponible, no se declara ni se evalua.
- Tool calling / function calling: no disponible, no se menciona en los metadatos.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible, no se declara lista de idiomas.
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

Los siguientes escenarios son propuestas de aplicacion coherentes con el pipeline declarado, no casos validados por el autor ni respaldados por evaluaciones publicadas. Deben considerarse hipotesis a verificar experimentalmente:

- Descripcion automatica de imagenes (image captioning) en catalogos de producto o DAM: el modelo puede generar texto a partir de imagenes, lo que permitiria poblar metadatos descriptivos de forma masiva; requiere validacion previa de calidad y de sesgos.
- Respuestas visuales a preguntas (VQA) en herramientas de accesibilidad: un usuario envia una fotografia y una pregunta y recibe una respuesta textual; el modelo encaja por su modalidad image-text-to-text.
- Extraccion de informacion de documentos escaneados: conversion de facturas, albaranes o formularios a texto estructurado, siempre que se valide la precision en dominios concretos y se anada post-procesado.
- Asistente conversacional multimodal de segunda linea: atencion en la que el cliente adjunta capturas o fotos junto al texto; el tag "conversational" apunta a este uso, pero no se conoce la ventana de contexto real, factor critico para conversaciones largas.
- Prototipado rapido e investigacion academica: al ser un modelo de ~5,1 B con pesos safetensors y libreria transformers, es viable cargarlo en una GPU de gama alta para experimentar con tecnicas de ajuste o evaluacion, sin compromiso de produccion.
- Base para fine-tuning especifico de dominio: al ser un modelo ya ajustado con SFT y fusionado, puede servir de punto de partida para especializaciones verticales (medicina, legal, industrial) mediante tecnicas como LoRA.
- Moderacion asistida de contenido visual en plataformas: clasificacion y etiquetado preliminar de imagenes subidas por usuarios, con supervision humana obligatoria dado el riesgo de error.
- Generacion de descripciones para comercio electronico multilingue: solo si se confirma el soporte de idiomas, actualmente no declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna seccion de evaluacion cumplimentada (MMLU, HumanEval, GSM8K, MMMU, DocVQA u otros) y la busqueda web no ha devuelto ningun resultado relacionado con el modelo.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parametros (5,1 B) y de los formatos habituales; no son datos publicados por el autor:

- VRAM para los pesos en fp32: aproximadamente 20,4 GB.
- VRAM para los pesos en bf16/fp16: aproximadamente 10,2 GB, mas cache KV y activaciones.
- VRAM para los pesos en int8: aproximadamente 5,1 GB, mas cache KV y activaciones.
- VRAM para los pesos en int4: aproximadamente 2,6-3,0 GB, mas cache KV y activaciones.
- Al tratarse de un modelo image-text-to-text, hay que sumar la memoria del codificador visual y de las representaciones de imagen, no cuantificada en los metadatos.
- GPU recomendadas para bf16 completo: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB), con margen comodo.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede ejecutar bf16 con holgura; tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) son viables en int8 o int4.
- En GPUs de 8 GB solo seria planteable una cuantizacion de 4 bits, con margen muy justo una vez incluido el componente visual.
- Opciones de despliegue: transformers (formato publicado), vLLM y TGI si la arquitectura concreta esta soportada, y llama.cpp u Ollama unicamente si se generan conversiones GGUF, que no se distribuyen en el repositorio.
- Latencia y throughput: no disponible. No hay mediciones publicadas y dependen criticamente del hardware, la cuantizacion y la resolucion de imagen de entrada.
- El repositorio ocupa 17,0 GB, un tamano superior al esperado para un unico juego de pesos en bf16, lo que sugiere la presencia de pesos en mayor precision o de copias adicionales; no se puede confirmar sin inspeccionar los ficheros.

## Comparativa con modelos similares

No es posible comparar rendimiento porque este modelo no publica benchmarks. La tabla siguiente contrasta unicamente tamanos, contexto y licencia con modelos multimodales de tamano comparable, usando valores de referencia publicos:

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nexa-core-2b-v2-merged | ~5,1 B | no disponible | imagen + texto | no disponible | Hugging Face, 0 descargas registradas |
| Gemma 3 4B IT | ~4,3 B | 128 k | imagen + texto | terminos de uso de Gemma | Hugging Face, ampliamente desplegado |
| Qwen2.5-VL-3B-Instruct | ~3,75 B | 128 k | imagen, video y texto | Apache 2.0 | Hugging Face |
| Phi-4-multimodal-instruct | ~5,6 B | 128 k | imagen, audio y texto | MIT | Hugging Face |

Advertencia: la fila del modelo objeto de esta ficha solo refleja metadatos; las tres filas de comparacion corresponden a modelos con documentacion publica extensa y no implican superioridad o inferioridad en calidad, dado que no existen resultados de evaluacion comparables.

## Limitaciones y advertencias

- Model card vacia: el autor no ha completado ninguna seccion relevante (uso previsto, datos de entrenamiento, limitaciones, evaluacion), lo que impide auditar el modelo.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial. En ausencia de licencia, debe asumirse reserva de derechos por defecto y contactar con el autor antes de cualquier despliegue productivo.
- Discrepancia de nomenclatura: el identificador indica "2b" pero el recuento real de safetensors es de ~5,1 B. Conviene verificar los ficheros antes de dimensionar infraestructura.
- Ausencia total de benchmarks: no hay evidencia publica de calidad en razonamiento, codigo, matematicas, vision o multilingue.
- Riesgo de alucinacion: inherente a los modelos generativos; en tareas de extraccion documental o VQA puede producir contenido plausible pero incorrecto, especialmente con imagenes de baja calidad.
- Sesgos desconocidos: al no documentarse la composicion del dataset ni el proceso de ajuste, no es posible estimar sesgos demograficos, culturales o linguisticos.
- Idiomas no declarados: no se puede garantizar el rendimiento en castellano ni en ningun otro idioma concreto.
- Contexto no declarado: se desconoce la ventana maxima, lo que impide planificar conversaciones largas o procesamiento de documentos extensos.
- Modelo fusionado: si el sufijo "-merged" implica la fusion de pesos o adaptadores, existe riesgo de degradacion de capacidades respecto a los modelos de origen, un fenomeno documentado en fusiones de este tipo.
- Falta de validacion comunitaria: 0 descargas y 0 "likes" en la fecha de consulta implican ausencia de retroalimentacion externa sobre su comportamiento real.
- Riesgo de ficheros maliciosos o no verificados: los repositorios sin licencia ni documentacion deben cargarse preferentemente con safetensors (no pickle) y en entornos aislados.
- Fecha de publicacion: los metadatos indican creacion el 2026-09-22 y actualizacion el 2026-09-23; el modelo es muy reciente y no ha pasado por ciclos de validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NovaStudios/nexa-core-2b-v2-merged
- Referencia citada en la plantilla de la model card: Lacoste et al. (2019), "Quantifying the Carbon Emissions of Machine Learning", https://arxiv.org/abs/1910.09700
- Calculadora de impacto de carbono enlazada en la model card: https://mloc2.github.io/impact#compute (enlace tal como aparece en la plantilla original)
- Repositorio, paper o demo del autor: no disponible.
- Resultados relevantes de busqueda web: no disponible. Las busquedas realizadas no devolvieron ninguna pagina relacionada con el modelo, el autor o sus resultados.
