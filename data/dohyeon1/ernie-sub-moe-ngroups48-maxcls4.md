# Dohyeon1/ERNIE-Sub-MoE-ngroups48-maxcls4

## Resumen

ERNIE-Sub-MoE-ngroups48-maxcls4 es un modelo de generacion de texto publicado en HuggingFace por el usuario Dohyeon1. Se trata de una variante basada en la arquitectura ERNIE 4.5 MoE (etiqueta `ernie4_5_moe` en el Hub) con aproximadamente 21.825 millones de parametros totales, segun los pesos en safetensors del repositorio. El nombre indica dos rasgos de configuracion: 48 grupos de expertos (`ngroups48`) y un limite de clasificacion o seleccion de expertos por token (`maxcls4`), aunque el autor no documenta su significado exacto.

El modelo resuelve tareas generales de generacion de texto y conversacion (pipeline `text-generation`, etiqueta `conversational`), y por su estructura de mezcla de expertos (MoE) esta pensado para ofrecer un coste de inferencia inferior al de un modelo denso del mismo tamano, al activar solo una fraccion de los parametros por token. Es relevante en la practica por dos motivos: primero, representa un ejemplo de ajuste fino o derivacion sobre la familia ERNIE 4.5 MoE, cuyo material abierto es escaso; segundo, permite estudiar variantes de enrutado de expertos sin necesidad de entrenar desde cero.

Ahora bien, la ficha publicada por el autor es la plantilla autogenerada de HuggingFace y no contiene informacion sustantiva: no declara licencia, idiomas, datos de entrenamiento, hiperparametros ni resultados de evaluacion. A fecha de la consulta el repositorio acumula 0 descargas y 0 "likes", por lo que se trata de un artefacto sin validacion externa. Toda cifra que no sea el recuento de parametros o el tamano del repositorio debe considerarse no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); etiqueta de libreria `ernie4_5_moe` (familia ERNIE 4.5) |
| Parametros totales | 21.825.437.888 (dato real de los safetensors), ~21,8 mil millones |
| Parametros activos | no disponible (la etiqueta MoE lo implica, pero el autor no publica el numero de expertos activos por token) |
| Longitud de contexto | no disponible para este checkpoint; una ficha de terceros del modelo hermano ERNIE-Sub-MoE-ngroups48-adaptive indica 32.768 tokens, dato sin confirmar en el repositorio original |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no hay GGUF, AWQ ni GPTQ publicados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (campo vacio en el Hub) |
| Formato de pesos | safetensors (tamano de repositorio: 43,7 GB) |
| Numero de grupos de expertos | 48, segun el nombre del modelo (no documentado en la ficha) |
| Parametro `maxcls4` | no disponible; el nombre sugiere un limite de clasificacion/seleccion, sin definicion publicada |
| Fecha de publicacion | 23 de septiembre de 2026 (creacion), actualizado ese mismo dia |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El identificador de arquitectura declarado por el propio modelo (`ernie4_5_moe`) lo situa en la familia ERNIE 4.5 con mezcla de expertos desarrollada por Baidu. Esto implica un transformer con capas de atencion estandar en las que cada bloque de feed-forward se sustituye por un conjunto de expertos y un enrutador que selecciona un subconjunto por token. El sufijo `ngroups48` apunta a 48 grupos de expertos y `maxcls4` a un limite maximo de seleccion, presumiblemente cuatro expertos o cuatro clases por token; ninguna de las dos cosas aparece explicada en la model card.

No hay informacion publicada sobre el proceso de entrenamiento: se desconoce el numero de tokens, la composicion del corpus, si hubo ajuste por instrucciones (SFT), optimizacion por preferencias (RLHF o DPO) o destilacion. El unico enlace de tipo paper en las etiquetas es `arxiv:1910.09700`, que corresponde a Lacoste et al. (2019) sobre estimacion de emisiones de carbono, citado en la plantilla automatica de HuggingFace; no es un articulo sobre este modelo ni sobre su arquitectura. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento explicito.

Por la nomenclatura del autor y los resultados de busqueda, existen al menos tres variantes hermanas con el mismo patron: ERNIE-Sub-MoE-ngroups48-adaptive, ERNIE-M-SMoE-ngroups48 y OLMoE-Sub-MoE-ngroups48. La existencia de esta ultima, basada en OLMoE, sugiere que el autor aplica una misma receta de sub-MoE sobre arquitecturas de terceros, pero no se ha publicado metodologia.

## Capacidades

- Generacion de texto en modo conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` indica uso previsto para dialogos multi-turno.
- Razonamiento general y comprension del lenguaje: capacidades esperables de un modelo de ~21,8 mil millones de parametros, aunque sin evaluacion publicada que las cuantifique.
- Generacion de codigo y matematicas: no hay evidencia publicada de resultados en HumanEval, MBPP o GSM8K; no debe asumirse un rendimiento concreto.
- Tool calling / function calling: no disponible; no se documenta soporte de llamadas a herramientas ni formato de plantilla asociado.
- Agentes y razonamiento multi-paso: no disponible; no se declara ningun modo de pensamiento ni bucle de agente.
- Capacidades multilingues: no disponible; el autor no declara idiomas.
- Vision o audio: no disponible; no hay torre multimodal ni procesador asociado en el repositorio.
- Eficiencia por mezcla de expertos: activacion parcial de parametros por token, con el ahorro de computo que ello conlleva, aunque se desconoce cuantos parametros se activan.
- Ajuste fino: al ser un checkpoint compatible con Transformers y safetensors, admite entrenamiento posterior con las herramientas habituales (PEFT, TRL, etc.).

## Casos de uso

- Generacion de texto conversacional de uso general: el modelo puede emplearse como motor de chat en aplicaciones internas, gestionando conversaciones multi-turno. Es adecuado por su naturaleza conversacional declarada y su tamano moderado, siempre que se acepte la ausencia de evaluacion publica.
- Prototipado e investigacion sobre enrutado de expertos: dado su nombre (`ngroups48`, `maxcls4`), es util para estudiar como afectan distintas configuraciones de agrupacion y seleccion de expertos a la calidad y al coste de inferencia, comparandolo con las variantes hermanas del mismo autor.
- Experimentos de ajuste fino con pocos recursos: con 21,8 mil millones de parametros totales, tecnicas como LoRA o QLoRA permiten adaptarlo a dominios concretos (legal, sanitario, atencion al cliente) sin disponer de un cluster grande.
- Generacion de contenido asistida por plantilla: redaccion de resumentes, reformulaciones o borradores de documentacion tecnica, integrándolo en un pipeline con verificacion humana posterior.
- Extraccion y clasificacion de informacion a partir de texto largo: si se confirma la ventana de 32.768 tokens de la variante adaptativa, permitiria procesar informes, actas o expedientes completos en una sola pasada.
- Servicio de inferencia self-hosted: al distribuirse en safetensors y ser compatible con Transformers, puede desplegarse con vLLM, TGI o FriendliAI (que ya lista la variante adaptativa) en infraestructura propia.
- Base para destilacion: por su estructura MoE, puede servir como profesor para destilar modelos densos mas pequenos orientados a produccion.
- Generacion de datos sinteticos: util para producir corpus de entrenamiento o de evaluacion en dominios donde no hay datos etiquetados, con revision posterior.

Nota: todos estos casos presuponen un comportamiento propio de un modelo de lenguaje de su tamano; ninguno esta respaldado por evaluaciones publicadas de este checkpoint concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye ninguna tabla de evaluacion en la model card, y las busquedas web no devuelven cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba para este checkpoint ni para sus variantes hermanas.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento real de parametros (21.825.437.888) y no de mediciones publicadas.

- Pesos en precision completa (fp32): aproximadamente 87 GB, inviable en GPU de consumo.
- Pesos en bf16/fp16: aproximadamente 43,7 GB, coherente con el tamano del repositorio. Requiere al menos 48 GB de VRAM solo para los pesos, mas el espacio de activaciones y cache KV.
- Cuantizacion de 8 bits: en torno a 22 GB de VRAM, lo que exige una A100 40 GB, L40S 48 GB o una RTX 4090 de 24 GB muy al limite.
- Cuantizacion de 4 bits: en torno a 11-12 GB de VRAM, lo que permite ejecucion en RTX 4090, RTX 4080, RTX 3090 o Mac con memoria unificada de 16-24 GB, siempre que se genere una version GGUF o AWQ, que hoy no existe en el repositorio.
- GPU recomendadas para produccion: A100 80 GB, H100 80 GB o L40S 48 GB en bf16; para cuantizacion de 4-8 bits, RTX 4090, RTX 6000 Ada o A6000.
- Cabe en GPU de consumo: si, unicamente tras cuantizar a 4 bits y con memoria suficiente para la cache KV; en bf16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: Transformers (nativo, requiere `trust_remote_code` si el modelo define codigo propio), vLLM y TGI para servicio en bf16, llama.cpp/Ollama solo si se generan pesos GGUF, y plataformas gestionadas como FriendliAI o Featherless, que ya listan la variante adaptativa de la familia.
- Latencia y throughput: no disponibles. Al ser MoE, el rendimiento dependera del numero de parametros activos, dato que el autor no publica; sin el, cualquier cifra de tokens por segundo seria especulativa.

## Comparativa con modelos similares

Los datos de los modelos de terceros provienen de su documentacion publica habitual y deben verificarse en sus fichas oficiales antes de citarlos.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ERNIE-Sub-MoE-ngroups48-maxcls4 (este modelo) | 21,8 mil millones | no disponible | no disponible | no disponible | HuggingFace, safetensors, 0 descargas |
| ERNIE-Sub-MoE-ngroups48-adaptive (variante hermana) | 21 mil millones (segun featherless.ai) | no disponible | 32.768 tokens (segun featherless.ai) | no disponible | HuggingFace, FriendliAI, Featherless |
| ERNIE-4.5-21B-A3B (posible arquitectura de origen) | ~21 mil millones | ~3 mil millones | hasta 128.000 tokens | Apache 2.0 (segun su ficha) | HuggingFace, ecosistema Baidu |
| Qwen3-30B-A3B | ~30,5 mil millones | ~3,3 mil millones | 128.000 tokens | Apache 2.0 | HuggingFace, amplio soporte de inferencia |
| OLMoE-1B-7B | ~7 mil millones | ~1,3 mil millones | 4.096 tokens | Apache 2.0 | HuggingFace, totalmente abierto (datos y receta) |

La diferencia fundamental frente a las alternativas no esta en la arquitectura, sino en la trazabilidad: ERNIE-4.5-21B-A3B, Qwen3-30B-A3B y OLMoE-1B-7B publican licencia, contexto, receta de entrenamiento y evaluaciones, mientras que este checkpoint no documenta ninguno de esos extremos. Para seleccionar un modelo en produccion, esa falta de informacion es un criterio en contra mas relevante que cualquier diferencia de rendimiento.

## Limitaciones y advertencias

- Ausencia total de model card util: la ficha es la plantilla autogenerada de HuggingFace, con todos los campos marcados como "[More Information Needed]".
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial. En la practica, la ausencia de licencia equivale, por defecto, a todos los derechos reservados, por lo que no deberia desplegarse en produccion sin contactar con el autor.
- Idiomas no declarados: se desconoce si el modelo funciona correctamente en castellano o si esta limitado al ingles o al chino.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de este tamano, agravado por la falta de evaluaciones que permitan acotarlo.
- Riesgo de sesgos: sin documentacion de datos de entrenamiento no es posible auditar sesgos de genero, raza, religion o ideologia.
- Procedencia incierta: no se especifica de que checkpoint parte, que datos se usaron ni que modificaciones se aplicaron; el sufijo `maxcls4` no esta definido en ninguna fuente publica.
- Sin validacion comunitaria: 0 descargas y 0 "likes" implican que no hay terceros que hayan reproducido el comportamiento ni reportado fallos.
- Contexto desconocido: si finalmente no son 32.768 tokens, los casos de uso con documentos largos no serian viables; conviene medirlo empiricamente antes de disenar la aplicacion.
- Cuantizaciones inexistentes: no hay GGUF, AWQ, GPTQ ni MLX publicados, lo que obliga a generarlas uno mismo para desplegar en hardware de consumo.
- Parametros activos desconocidos: impide estimar coste, latencia y throughput con antelacion, algo critico para dimensionar un servicio.
- Riesgo de deriva en el nombre: la familia incluye variantes sobre ERNIE y sobre OLMoE, lo que sugiere una receta automatizada sin validacion; conviene no asumir que las variantes comparten comportamiento.
- Fecha de publicacion futura (2026): conviene verificar la integridad y el contenido real del repositorio antes de descargar 43,7 GB.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dohyeon1/ERNIE-Sub-MoE-ngroups48-maxcls4
- Variante hermana ERNIE-Sub-MoE-ngroups48-adaptive: https://huggingface.co/Dohyeon1/ERNIE-Sub-MoE-ngroups48-adaptive
- Ficha de la variante adaptativa en Featherless: https://featherless.ai/models/Dohyeon1/ERNIE-Sub-MoE-ngroups48-adaptive
- Despliegue de la variante adaptativa en FriendliAI: https://friendli.ai/models/Dohyeon1/ERNIE-Sub-MoE-ngroups48-adaptive
- Variante hermana ERNIE-M-SMoE-ngroups48: https://huggingface.co/Dohyeon1/ERNIE-M-SMoE-ngroups48
- Variante hermana OLMoE-Sub-MoE-ngroups48: https://hf-p-cfw.fyan.top/Dohyeon1/OLMoE-Sub-MoE-ngroups48
- Referencia citada en la plantilla (no es un paper del modelo): Lacoste et al., "Quantifying the Carbon Emissions of Machine Learning", https://arxiv.org/abs/1910.09700
- Calculadora de impacto asociada a esa referencia: https://mlco2.github.io/impact
