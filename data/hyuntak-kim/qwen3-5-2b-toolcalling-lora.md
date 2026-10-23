# hyuntak-kim/Qwen3.5-2B-ToolCalling-LoRA

## Resumen

`hyuntak-kim/Qwen3.5-2B-ToolCalling-LoRA` es un adaptador LoRA publicado en Hugging Face que, por su nombre y por el etiquetado del repositorio, se presenta como un ajuste fino del modelo base Qwen3.5-2B de Alibaba Cloud (familia Qwen) orientado a *tool calling* o *function calling*. El artefacto lo sube el usuario hyuntak-kim, no el equipo de Qwen, y su repositorio ocupa 0,3 GB, un tamano coherente con un adaptador de bajo rango y no con un modelo completo de 2 000 millones de parametros.

La relevancia potencial esta en el nicho: un adaptador pequeno que especializa un modelo de 2B en la generacion de llamadas a herramientas permite desplegar agentes ligeros en hardware modesto, incluso en el borde. Qwen3.5-2B se describe en fuentes de terceros como un modelo de 2B parametros de la serie Qwen3.5, pensado para inferencia en dispositivo y con capacidades multilingues y de razonamiento mejoradas respecto a Qwen3.

Ahora bien, la model card es la plantilla autogenerada de Hugging Face y no contiene ni un solo dato tecnico rellenado: no hay informacion sobre datos de entrenamiento, hiperparametros, licencia, idiomas ni evaluacion. Cualquier uso en produccion exige validacion propia. Ademas, la busqueda web revela al menos otros dos repositorios con practicamente el mismo nombre e identica estructura (kihyun-K y wcheolkyo), lo que sugiere duplicados o reaprovechamientos del mismo artefacto sin documentacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre un transformer decoder-only de la familia Qwen3.5; detalles no documentados) |
| Parametros totales | modelo base: 2 000 millones aprox.; el adaptador LoRA no declara su numero de parametros (repo de 0,3 GB) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la model card; fuentes de terceros atribuyen al base Qwen3.5-2B unos 33 000 tokens (33K), sin confirmacion del autor |
| Tipos de cuantizacion | no disponible; el tag `unsloth` sugiere entrenamiento con QLoRA (cuantizacion en 4 bits durante el ajuste), no los formatos de inferencia publicados |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card deja el campo como "[More Information Needed]") |
| Formato de pesos | safetensors (tag de la libreria `transformers`) |
| Modelo base | Qwen3.5-2B (Alibaba Cloud / Qwen), por inferencia del nombre del repositorio |
| Tipo de artefacto | adaptador LoRA, no un modelo completo |
| Libreria | transformers; compatible con `endpoints_compatible` |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion (metadatos) | 2026-10-23 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La informacion proporcionada no permite describir la arquitectura interna del adaptador. Por la nomenclatura y por el tag `unsloth`, se trata de un LoRA (probablemente entrenado con la libreria Unsloth, habitual para ajustes de bajo rango eficientes en memoria) aplicado sobre Qwen3.5-2B. La model card no especifica rango, alpha, modulos objetivo, numero de pasos, dataset ni regimen de precision (fp16/bf16/fp8). El unico enlace a arXiv que aparece, `arxiv:1910.09700`, corresponde a Lacoste et al. sobre estimacion de emisiones de carbono y proviene de la plantilla autogenerada, no de un paper del modelo.

Tampoco hay datos sobre el conjunto de entrenamiento de *tool calling*: se desconoce si se usaron trazas sinteticas generadas por un modelo mayor, esquemas de funciones reales, conversaciones multi-turno con llamadas anidadas o si hubo una fase de preferencia (RLHF/DPO). Del modelo base, fuentes de terceros indican que la serie Qwen3.5 de Alibaba Cloud mejora el razonamiento y el seguimiento de instrucciones respecto a Qwen3, y que Unsloth documenta soporte de ajuste fino con vision para las variantes multimodales de la familia; nada de ello esta verificado en este repositorio concreto.

## Capacidades

- Generacion de llamadas a herramientas (*tool calling* / *function calling*): es el objetivo declarado en el nombre del repositorio; no hay ejemplos, plantillas de prompt ni formato de salida documentados.
- Generacion de texto e instrucciones generales: heredadas del modelo base Qwen3.5-2B, sin evaluacion publicada por el autor.
- Razonamiento y matematicas: atribuibles al base segun la descripcion de terceros de la serie Qwen3.5; sin mediciones en este adaptador.
- Capacidades multilingues: la serie base se describe como multilingue, pero este repositorio no declara idiomas soportados ni si el ajuste los preserva.
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta si el ajuste cubre cadenas de varias llamadas, reintentos o seleccion entre funciones).
- Capacidades especiales (modo *thinking*, vision, audio): no disponible para este adaptador; existen variantes multimodales en la familia Qwen3.5 segun Unsloth, pero no se confirma que este LoRA se aplique a ellas.

## Casos de uso

- Agentes de atencion al cliente con herramientas: el adaptador puede conectarse a funciones de consulta de pedidos, gestion de devoluciones o escalado a humano; el interes esta en ejecutar el enrutado de herramientas en un modelo de 2B con coste por token muy bajo, aunque requiere validar el formato de llamada con datos propios.
- Enrutador de herramientas en pipelines RAG: usar el modelo como clasificador que decide que funcion invocar (busqueda vectorial, API interna, calculadora) antes de llamar a un modelo mayor, reduciendo latencia y coste en la primera etapa.
- Automatizacion de operaciones internas: agentes que ejecutan acciones sobre sistemas corporativos (crear tickets, consultar stock, lanzar consultas SQL parametrizadas) mediante esquemas JSON; encaja por su tamano, que permite desplegarlo en una sola GPU de gama media.
- Asistentes en el borde o en local: con 2B parametros y cuantizacion de 4 bits, el conjunto base + adaptador cabe en equipos con 4-8 GB de VRAM o en portatiles con GPU integrada, util para entornos con requisitos de privacidad y sin salida a Internet.
- Prototipado rapido de agentes en investigacion: al ser un LoRA pequeno, se puede cargar y descargar sobre el base para comparar variantes de entrenamiento en experimentos academicos de *function calling*.
- Evaluacion de *tool calling* en castellano: si se valida que el ajuste no degrada el multilingueismo del base, sirve como linea base para medir la brecha entre modelos de 2B y modelos mayores en generacion de llamadas en espanol.
- Filtrado y extraccion de datos estructurados: convertir texto libre en llamadas a funciones con argumentos tipados para ETL, aprovechando la ventana de contexto del base si se confirma su tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (ni MMLU, ni HumanEval, ni GSM8K, ni metricas especificas de *tool calling* como BFCL o API-Bank), y las busquedas web no aportan cifras atribuibles a este adaptador.

## Requisitos de hardware

- El repositorio solo contiene el adaptador (0,3 GB); es imprescindible descargar tambien el modelo base Qwen3.5-2B para inferir.
- VRAM estimada para el conjunto base + adaptador (calculos propios a partir de 2 000 millones de parametros, no mediciones): en fp16 en torno a 4-5 GB de pesos mas overhead de activaciones y cache KV; en 8 bits, unos 2-2,5 GB; en 4 bits (GGUF Q4), aproximadamente 1,3-1,8 GB.
- GPU recomendadas: tarjetas de 8-16 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, L4, A10) para fp16 con contexto moderado; A100/H100 no son necesarias para este tamano y solo se justifican por agregacion de peticiones o contextos muy largos.
- Cabe en GPU de consumo: si, con cuantizacion de 4 u 8 bits en tarjetas de 6-8 GB; el adaptador debe fusionarse con el base (merge) o cargarse como PEFT sobre el modelo cuantizado.
- Opciones de despliegue: transformers + PEFT para cargar el LoRA; llama.cpp u Ollama tras fusionar y convertir a GGUF; vLLM o TGI admiten adaptadores LoRA en caliente, lo que permite servir el base y varios adaptadores a la vez; el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput: no disponible. No hay cifras de tokens por segundo publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de artefacto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hyuntak-kim/Qwen3.5-2B-ToolCalling-LoRA | 2B (base) + LoRA | no disponible (hereda del base) | Adaptador LoRA | no disponible | 0 descargas, 1 like |
| kihyun-K/Qwen3.5-2B-ToolCalling-LoRA | 2B (base) + LoRA | no disponible | Adaptador LoRA | no disponible | repositorio homonimo, sin documentacion adicional |
| wcheolkyo/Qwen3.5-2B-ToolCalling-LoRA | 2B (base) + LoRA | no disponible | Adaptador LoRA | no disponible | repositorio homonimo, sin documentacion adicional |
| Qwen3.5-2B (modelo base, Alibaba Cloud) | 2B | ~33K tokens segun fuentes de terceros | Modelo completo | no disponible en la informacion recogida | Referencia oficial de la familia Qwen3.5 |

No se dispone de datos de rendimiento de ninguno de los cuatro, por lo que la comparativa se limita a parametros, formato y disponibilidad. Los tres repositorios con nombre identico apuntan a una replicacion del mismo artefacto sin informacion adicional que permita distinguirlos.

## Limitaciones y advertencias

- Model card vacia: es la plantilla autogenerada de Hugging Face; todos los campos tecnicos figuran como "[More Information Needed]". No hay base documental para afirmar nada sobre calidad, datos o proceso de entrenamiento.
- Licencia sin declarar: sin licencia explicita no se puede asumir permiso de uso comercial. Hay que verificar ademas la licencia del modelo base Qwen3.5-2B, que es la que condiciona la distribucion del artefacto derivado.
- Riesgo de alucinacion de herramientas y argumentos: los modelos pequenos especializados en *function calling* tienden a inventar nombres de funciones, omitir parametros obligatorios o generar JSON invalido; se requiere validacion de esquema y reintentos en produccion.
- Idiomas no declarados: no se sabe si el ajuste se hizo con datos en ingles y si degrada el rendimiento en castellano respecto al base, algo critico si se usa en productos en espanol.
- Contexto no confirmado: el dato de ~33K tokens proviene de un directorio de terceros, no del autor; el adaptador podria haber sido entrenado con secuencias mucho mas cortas y rendir peor en conversaciones largas.
- Sin evaluacion reproducible: 0 descargas y 1 like indican ausencia de uso y de validacion por la comunidad; no hay informe de evaluacion ni comparacion con alternativas.
- Duplicidad de repositorios: la existencia de al menos dos repositorios con el mismo nombre y misma plantilla genera ambiguedad sobre cual es el original y sobre la procedencia de los pesos.
- Fecha de creacion inusual en los metadatos (2026-10-23): conviene verificar la integridad y el historial de commits antes de confiar en los ficheros.
- El identificador `arxiv:1910.09700` del etiquetado no es un paper del modelo, sino la referencia de la calculadora de impacto de carbono de la plantilla; no debe citarse como documentacion tecnica.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/hyuntak-kim/Qwen3.5-2B-ToolCalling-LoRA
- Repositorio homonimo (kihyun-K): https://huggingface.co/kihyun-K/Qwen3.5-2B-ToolCalling-LoRA
- Repositorio homonimo (wcheolkyo): https://huggingface.co/wcheolkyo/Qwen3.5-2B-ToolCalling-LoRA
- Ficha de Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Ficha de especificaciones de Qwen3.5-2B (directorio de terceros): https://www.aimodel.directory/models/qwen3-5-2b
- Guia de ajuste fino de Qwen3.5 en Unsloth: https://unsloth.ai/docs/models/qwen3.5/fine-tune
- Referencia citada en el etiquetado (impacto de carbono, no paper del modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML: https://mlco2.github.io/impact
