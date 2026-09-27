# mradermacher/Swift-Qwen3.8-27B-Uncensored-MTP-Terse-Coder-GGUF

## Resumen

Esta ficha describe la version cuantizada en GGUF del modelo Swift-Qwen3.8-27B-Uncensored-MTP-Terse-Coder, publicada por el usuario mradermacher. Se trata de un derivado del Qwen3.8-27B de Alibaba (descrito por su equipo como un LLM denso multimodal nativo), al que se le han aplicado procesos de merge y LoRA para obtener una variante "abliterated" (sin capas de rechazo) y "uncensored", con rasgos adicionales de eficiencia de tokens y multi-token prediction (MTP) heredados de su denominacion. El resultado es un modelo orientado a razonamiento, generacion de codigo y conversacion sin filtros de seguridad, con capacidad multimodal segun los ficheros mmproj incluidos en el repositorio.

La relevancia de esta publicacion es doble. Por un lado, pone a disposicion del ecosistema local (llama.cpp, Ollama, LM Studio y otros clientes compatibles con GGUF) una familia completa de cuantizaciones estaticas, desde Q2_K hasta f16, con ficheros de proyeccion multimodal aparte. Por otro, y dado que no existe informacion publica de benchmarks en la documentacion disponible, su valor practico para un desarrollador es principalmente el de un modelo sin restricciones de contenido para tareas de red teaming, generacion de codigo y prototipado local en hardware de consumo.

El autor declara el idioma ingles como unico soportado, licencia "other" (el modelo base referencia swift-open-license-1) y un tamano de repositorio de 93,2 GB, correspondiente al conjunto completo de cuantizaciones. El modelo original se denomina "27B", aunque la API de HuggingFace reporta 460.730.096 parametros para este repositorio, una discrepancia que se detalla en la seccion de limitaciones y que conviene verificar antes de dimensionar el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal nativo (descripcion del modelo base Qwen3.8-27B de Alibaba), con MTP (multi-token prediction) segun la denominacion del modelo |
| Parametros totales | 27B segun denominacion del modelo; la API de HuggingFace reporta 460.730.096 parametros para este repositorio (dato contradictorio, no disponible como cifra confirmada) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16 (suplementos multimodales), x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS (cuantizaciones estaticas); no hay cuantizaciones ponderadas/imatrix disponibles por el momento |
| Idiomas soportados | en (ingles) |
| Licencia | other (el modelo base y la variante BF16 hacen referencia a la swift-open-license-1) |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye tambien en transformers con pesos safetensors en BF16 y FP8 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.8-27B de Alibaba, que el propio equipo describe como un LLM denso multimodal nativo ("native multimodal dense LLM"). Ser denso implica que todos los parametros se activan en cada token generado, sin enrutamiento tipo MoE. La componente multimodal se manifiesta en este repositorio GGUF mediante los ficheros mmproj (proyeccion de vision en f16 y Q8_0), necesarios para que los runtimes compatibles puedan procesar imagenes junto al texto.

Sobre esa base, el autor del modelo original (vwdubb) aplico un merge y al menos un adaptador LoRA, con etiquetas que apuntan a un proceso de "abliteration" (eliminacion o neutralizacion de las capas de rechazo) y a un ajuste orientado a eficiencia de tokens ("token-efficient") y a generacion de codigo ("Terse-Coder"). La etiqueta MTP sugiere el uso de multi-token prediction, aunque no se especifican ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF o DPO. La informacion disponible tampoco detalla el proceso de cuantizacion mas alla de indicar que se trata de cuantizaciones estaticas generadas con una version 2 del pipeline de mradermacher, con tensor quantisation aplicada.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en respuestas concisas y eficientes en tokens.
- Razonamiento ("reasoning") y resolucion de problemas paso a paso, segun las etiquetas declaradas por el autor.
- Generacion y asistencia en codigo ("coding", "Terse-Coder"), orientada a respuestas compactas.
- Capacidad multimodal: los ficheros mmproj-f16 y mmproj-Q8_0 habilitan procesamiento de imagenes en runtimes que los soporten.
- Tool calling / function calling: declarado en la variante BF16 del mismo modelo (etiqueta "tool-calling").
- Flujos agenticos y multi-step reasoning, coherente con la orientacion de la familia Qwen3.8 a "agentic workflows".
- Multi-token prediction (MTP) segun la denominacion del modelo, sin confirmacion tecnica en la informacion disponible.
- Comportamiento sin censura ("uncensored", "abliterated"): el modelo no aplica rechazos de contenido, lo que lo hace apto para red teaming.
- Idioma: unicamente ingles declarado.

## Casos de uso

- Red teaming y evaluacion de seguridad: al carecer de capas de rechazo, el modelo puede utilizarse como generador de prompts adversarios y de contenido de prueba dentro de programas controlados de "ai-red-team", que es precisamente una de las etiquetas declaradas por el autor.
- Generacion de codigo en local: con las cuantizaciones Q4_K_S (15,9 GB) o Q2_K (11,0 GB) se puede ejecutar un asistente de codigo en una estacion de trabajo sin conexion, integrable en editores o scripts de automatizacion mediante clientes GGUF.
- Automatizacion de oficina y agentes: la familia Qwen3.8 se orienta explicitamente a tareas de automatizacion de oficina y flujos agenticos, por lo que este derivado puede emplearse para orquestar tareas administrativas repetitivas en pipelines locales.
- Asistencia sobre capturas de pantalla y diagramas: gracias a los ficheros mmproj, el modelo puede recibir imagenes y combinarlas con instrucciones de texto, por ejemplo para explicar un diagrama de arquitectura o transcribir codigo mostrado en una imagen.
- Procesamiento de documentacion tecnica en ingles: al estar entrenado solo en ingles, encaja bien en la generacion de resumenes, changelogs y documentacion de API en ese idioma.
- Prototipado rapido sin dependencia de la nube: con ficheros desde 11 GB, un desarrollador puede validar prompts, formatos de salida y esquemas de tool calling antes de migrar a un despliegue mayor.
- Despliegue en Apple Silicon: existen recetas comunitarias para ejecutar la variante uncensored de Qwen 3.8 27B en Ollama y MLX, con conversiones a MLX que la comunidad reporta como mas rapidas en silicio de Apple (sin cifras verificadas en esta ficha).
- Investigacion sobre alineacion y edicion de modelos: la combinacion de merge, LoRA y abliteration lo convierte en un caso de estudio util para analizar como se degradan o preservan capacidades tras eliminar las capas de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado se limita a listar los ficheros GGUF y a enlazar graficos genericos sobre perplejidad de tipos de cuantizacion (comparativa de ikawrakow y notas de Artefact2), sin cifras propias de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion.

## Requisitos de hardware

- VRAM estimada segun los tamanoes de fichero publicados: Q2_K ocupa 11,0 GB y Q4_K_S 15,9 GB; a estas cifras hay que anadir el espacio de la cache KV, que depende del runtime y de la longitud de contexto configurada (contexto no disponible en la documentacion).
- Los suplementos multimodales anaden 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16) cuando se utiliza la entrada de imagen.
- GPU de consumo: Q2_K entra en tarjetas de 12 GB (por ejemplo RTX 3060 12 GB) con contexto reducido; Q4_K_S requiere 16 GB o mas y se mueve con comodidad en 24 GB (RTX 3090, RTX 4090). El resto de cuantizaciones (Q5, Q6, Q8_0 y f16) no tienen tamano detallado en la model card; el repositorio completo suma 93,2 GB.
- GPU de datacenter: A100, H100 y similares permiten ejecutar las cuantizaciones altas y f16 con contexto amplio y mayor concurrencia.
- Apple Silicon: existe una receta comunitaria que reporta mejor rendimiento con MLX que con el backend por defecto en estos equipos.
- Opciones de despliegue: llama.cpp (formato nativo GGUF y soporte de mmproj), Ollama, LM Studio y cualquier cliente compatible con GGUF. Para el modelo base sin cuantizar, la documentacion de vLLM recoge el checkpoint oficial FP8 de Qwen/Qwen3.8-27B.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para estas cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mradermacher/Swift-Qwen3.8-27B-Uncensored-MTP-Terse-Coder-GGUF (este modelo) | 27B nominales (la API reporta 460.730.096) | no disponible | other (swift-open-license-1) | GGUF, 13 variantes de cuantizacion | Version sin censura y eficiente en tokens, con soporte multimodal via mmproj |
| Qwen/Qwen3.8-27B (modelo base oficial) | 27B (nominal) | no disponible | no disponible en la informacion recogida | Pesos oficiales, checkpoint FP8 servible en vLLM | Modelo denso multimodal nativo, con alineacion de seguridad estandar; orientado a codigo, agentes y automatizacion de oficina |
| mradermacher/Swift-Qwen3.8-27B-Uncensored-BF16-GGUF | 27B (nominal) | no disponible | swift-open-license-1 | GGUF en BF16 | Misma variante sin cuantizar; anade etiquetas explicitas de tool-calling y multimodal |
| vwdubb/Swift-Qwen3.8-27B-Uncensored-MTP-Terse-Coder | 27B (nominal) | no disponible | no disponible en la informacion recogida | Modelo base del merge y del adaptador LoRA | Fuente directa de la que se derivan las cuantizaciones de esta ficha |

No se dispone de datos de rendimiento comparativo entre estas variantes, por lo que la comparacion se limita a parametros, licencia, formato y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento o codigo para este derivado concreto ni para sus cuantizaciones.
- Discrepancia en el recuento de parametros: la denominacion comercial indica 27B, mientras que el dato de safetensors de la API de HuggingFace reporta 460.730.096 parametros. Conviene verificar el numero real antes de dimensionar hardware o presupuestos de inferencia.
- Modelo "abliterated" y "uncensored": no incorpora capas de rechazo, por lo que puede generar contenido ofensivo, ilegal o peligroso. Su uso responsable exige supervision humana y, en entornos productivos, filtros externos de entrada y salida.
- Riesgo de alucinacion: es un riesgo generico de los LLM y, en modelos sin alineacion de seguridad, la verificacion factual debe ser especialmente estricta.
- Idioma: solo se declara ingles. El rendimiento en castellano u otros idiomas no esta documentado y probablemente sea degradado.
- Licencia "other" vinculada a swift-open-license-1: las condiciones de uso comercial no estan detalladas en la informacion disponible y deben revisarse en el texto completo de la licencia antes de cualquier despliegue productivo.
- Naturaleza de merge y LoRA: las combinaciones de adaptadores pueden producir degradaciones no documentadas respecto al modelo base, especialmente en tareas fuera del dominio de codigo y conversacion.
- Soporte de MTP y multimodal dependiente del runtime: la documentacion no especifica que versiones de llama.cpp u otros motores soportan correctamente el multi-token prediction ni la proyeccion mmproj de este modelo concreto.
- Cuantizaciones de baja precision: Q2_K y Q3_K_* implican perdidas de calidad notables; el propio autor recomienda Q4_K_S como opcion rapida.
- Adopcion nula: el repositorio registra 0 descargas y 1 "like", por lo que no existe validacion de la comunidad sobre su funcionamiento en produccion.
- Repositorio pesado: 93,2 GB en total, lo que obliga a descargar ficheros individuales y no el repositorio completo en la mayoria de entornos.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Swift-Qwen3.8-27B-Uncensored-MTP-Terse-Coder-GGUF
- Modelo base del merge y adaptador LoRA: https://huggingface.co/vwdubb/Swift-Qwen3.8-27B-Uncensored-MTP-Terse-Coder
- Variante BF16 del mismo autor: https://huggingface.co/mradermacher/Swift-Qwen3.8-27B-Uncensored-BF16-GGUF
- Modelo oficial Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub oficial de Alibaba para Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Receta de despliegue en vLLM (checkpoint FP8 oficial): https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Repositorio comunitario de ejecucion local en Ollama y MLX: https://github.com/Wassimyounes01/qwen38-uncensored
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Swift-Qwen3.8-27B-Uncensored-MTP-Terse-Coder-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
