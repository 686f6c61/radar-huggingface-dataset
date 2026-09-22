# hfsteady/Qwen3.8-27B-huihui-abliterated-NVFP4-NInfer-v3

## Resumen

Este repositorio contiene un unico artefacto de pesos, `qwen3_8_27b_huihui_abliterated_nvfp4.v3.ninfer`, publicado por el usuario `hfsteady`. No se trata de un modelo nuevo ni de una cuantizacion adicional: es una migracion de contenedor del artefacto publico `Barding-Defense/Qwen3.8-27B-huihui-abliterated-NVFP4-NInfer` (revision `228612d2a1f48c9e1b6f5e102f369c133c0f6eec`) desde el formato v2 de NInfer al formato v3, realizada con la herramienta de migracion v2-a-v3 del propio runtime. El autor lo describe explicitamente como un artefacto de rendimiento exploratorio, no como una release con linaje verificado ni como una recomendacion de produccion.

El modelo de partida es un derivado "abliterated" (sin mecanismos de rechazo) de la familia Qwen3, publicado por `huihui-ai`, y el artefacto intermedio fue cuantizado a NVFP4, el formato de coma flotante de 4 bits de NVIDIA orientado a hardware Blackwell. El repositorio ocupa 21,5 GB y se distribuye bajo licencia Apache-2.0, heredada de la model card original de Huihui.

Su relevancia actual es limitada y muy especifica: sirve como banco de pruebas para el formato de contenedor NInfer v3 sobre GPU Blackwell, y como ejemplo de cadena de derivacion (modelo base de terceros, abliteration, cuantizacion NVFP4 y migracion de contenedor) en la que la trazabilidad se pierde en cada salto. Con 0 descargas y 0 "likes", no existe validacion independiente de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no documenta la arquitectura; el nombre del repositorio indica la familia Qwen3) |
| Parametros totales | no disponible (la denominacion "27B" figura en el nombre del repositorio, sin verificacion en la informacion proporcionada) |
| Parametros activos | no disponible (no se documenta una arquitectura de mezcla de expertos) |
| Longitud de contexto | no disponible como valor declarado; la unica prueba reportada recupera correctamente con prompts de 70.000, 80.000 y 90.000 tokens |
| Tipos de cuantizacion | NVFP4 en los pesos; cache KV en FP8 en la configuracion probada por el autor |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Contenedor propietario NInfer v3 (extension `.ninfer`); no se distribuyen safetensors ni GGUF |
| Tamano del repositorio | 21,5 GB |
| Libreria de inferencia | `ninfer` |
| Hash SHA-256 del artefacto v3 | `4f8f2d8cd53813ee07b2258f3fae27b38922b6ae33d0043ee66c915098b729ba` |
| Hash SHA-256 del artefacto v2 de origen | `02c0c80616e2dd353133355d840aa6418d83f4c523369ad93b426e6c5bbc83c8` |
| Commit de NInfer usado para migrar y probar | `9e163eee4b8acec21ab0ac765107b6a3f287b217` |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. Lo unico documentado es el proceso de derivacion del artefacto: se parte de `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, se aplica una cuantizacion NVFP4 (atribuida al artefacto publico de `Barding-Defense`) y, finalmente, se ejecuta la herramienta de migracion v2-a-v3 de NInfer, que copia el payload de pesos almacenado al formato de contenedor v3 del runtime. El autor insiste en que esta ultima operacion no constituye una nueva cuantizacion ni un fine-tune.

La innovacion tecnica que justifica el repositorio es, por tanto, de formato y no de modelo: el contenedor v3 de NInfer, junto con soporte de MTP (multi-token prediction) y cache KV en FP8, sobre hardware Blackwell, que es el unico que ejecuta NVFP4 de forma nativa. La model card no documenta decodificacion especulativa, atencion lineal ni otras variantes arquitectonicas, y tampoco aclara si el modelo base emplea atencion completa o algun esquema hibrido.

## Capacidades

- Generacion de texto autoregresiva: es la unica capacidad implicita en el artefacto, derivada de la familia Qwen3; no se documenta ninguna evaluacion de calidad general.
- Recuperacion de hechos en contexto largo: en la prueba del autor, el modelo recupera correctamente cinco hechos sinteticos con prompts de 70.000, 80.000 y 90.000 tokens.
- Comportamiento sin rechazos: el modelo esta "abliterated", es decir, se ha eliminado el comportamiento de rechazo ante peticiones que un modelo alineado rechazaria. Esto es una caracteristica declarada, no una capacidad funcional adicional.
- Tool calling / function calling: no disponible; no se menciona en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se menciona.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Capacidades multimodales (vision, audio): no disponibles; no se mencionan.
- Modo de razonamiento explicito ("thinking"): no disponible; no se documenta.
- Inferencia multi-usuario: la configuracion probada es de un solo usuario en modo greedy, por lo que no hay evidencia de rendimiento en concurrencia.

## Casos de uso

- Investigacion sobre seguridad y alineacion: el modelo permite estudiar de forma controlada como se comporta un sistema sin mecanismos de rechazo, para disenar clasificadores de seguridad o filtros externos que compensen esa ausencia. Es el uso mas coherente con la naturaleza del artefacto.
- Red teaming y evaluacion de robustez: al estar "abliterated", sirve como sujeto de prueba para medir la eficacia de capas de moderacion desplegadas por delante del modelo, comparando tasas de cumplimiento antes y despues del filtrado.
- Validacion del runtime NInfer v3 en hardware Blackwell: el artefacto permite verificar que la migracion de contenedor v2-a-v3 preserva el comportamiento del modelo y que el runtime arranca correctamente con MTP y cache KV en FP8.
- Pruebas de recuperacion en contexto largo sobre una sola GPU: con una RTX 5090 se pueden reproducir los experimentos descritos a 70.000, 80.000 y 90.000 tokens y ampliarlos con fixtures propios para caracterizar la degradacion de la recuperacion por posicion.
- Estudio de cuantizacion NVFP4: sirve para comparar la calidad de salida frente al artefacto v2 y frente al modelo original sin cuantizar, midiendo el impacto real de los 4 bits en tareas de generacion y recuperacion.
- Generacion de datos sinteticos para entrenar moderadores: un modelo sin rechazos puede emplearse, en un entorno aislado y con supervision, para producir ejemplos etiquetados que alimenten clasificadores de contenido.
- Analisis de cadenas de suministro de modelos: el repositorio es un caso de estudio util sobre como se pierde la trazabilidad a lo largo de derivaciones sucesivas (abliteration, cuantizacion, migracion de contenedor) y sobre que metadatos conviene exigir en cada salto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica estandar, y el autor advierte de forma explicita que la unica prueba realizada es una verificacion estrecha de rendimiento y recuperacion, no una evaluacion de calidad general.

| Prueba | Configuracion | Resultado |
|---|---|---|
| Recuperacion de cinco hechos sinteticos, 70.000 tokens de prompt | RTX 5090, NInfer MTP, KV en FP8, greedy, un usuario | recuperacion correcta |
| Recuperacion de cinco hechos sinteticos, 80.000 tokens de prompt | RTX 5090, NInfer MTP, KV en FP8, greedy, un usuario | recuperacion correcta |
| Recuperacion de cinco hechos sinteticos, 90.000 tokens de prompt | RTX 5090, NInfer MTP, KV en FP8, greedy, un usuario | recuperacion correcta |
| Benchmarks academicos (MMLU, HumanEval, GSM8K, etc.) | no realizados | no disponible |

## Requisitos de hardware

- GPU obligatoria con soporte nativo de NVFP4, es decir, generacion Blackwell: RTX 5090, RTX PRO 6000 Blackwell, B100 o B200. En arquitecturas anteriores (Ampere, Ada Lovelace, Hopper) el formato de pesos no se ejecuta de forma nativa.
- Configuracion validada por el autor: una RTX 5090 con 32 GB de VRAM, con MTP activado y cache KV en FP8, en modo greedy y un solo usuario.
- VRAM estimada: no disponible con precision. El repositorio ocupa 21,5 GB, pero la model card no desglosa el tamano del payload de pesos ni el consumo de la cache KV a 90.000 tokens. Como referencia, 21,5 GB ya dejan poco margen sobre los 32 GB de una RTX 5090.
- GPU consumer: si, la RTX 5090 es el unico modelo consumer citado como probado. No hay datos para GPUs consumer de generaciones anteriores porque no soportan NVFP4.
- Opciones de despliegue: exclusivamente el runtime NInfer (libreria `ninfer`). No se mencionan vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM, y el contenedor propietario v3 no es portable a esos motores sin conversion previa.
- Latencia y throughput: no disponibles. La model card no publica tokens por segundo, tiempo hasta el primer token ni resultados de concurrencia; solo indica servir greedy para un unico usuario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| `hfsteady/Qwen3.8-27B-huihui-abliterated-NVFP4-NInfer-v3` | no disponible ("27B" en el nombre) | probado hasta 90.000 tokens | contenedor NInfer v3 (.ninfer), NVFP4 | Apache-2.0 | 0 descargas, 0 likes; migracion de contenedor |
| `Barding-Defense/Qwen3.8-27B-huihui-abliterated-NVFP4-NInfer` | no disponible | no disponible | contenedor NInfer v2, NVFP4 | no disponible en la informacion proporcionada | artefacto de origen, revision fijada |
| `huihui-ai/Huihui-Qwen3.8-27B-abliterated` | no disponible | no disponible | no disponible en la informacion proporcionada | Apache-2.0 segun la model card original | modelo base del linaje |

No se dispone de datos de benchmarks ni de especificaciones verificadas para los tres artefactos, por lo que la comparativa se limita a linaje, formato y licencia. No se han identificado en la informacion proporcionada otros modelos comparables de la misma categoria.

## Limitaciones y advertencias

- Modelo "abliterated": se ha eliminado el comportamiento de rechazo. No debe desplegarse de cara al publico sin una capa de moderacion externa, y su uso conlleva riesgo de generar contenido danino, sesgado o ilegal.
- Linaje no verificado: el registro de construccion de Barding-Defense no fija una revision exacta del modelo de Huihui, por lo que no es posible afirmar con certeza de que revision concreta procede el artefacto. El propio autor conserva esa limitacion de procedencia en lugar de reclamar una trazabilidad mas fuerte.
- No es un modelo nuevo: es una copia de payload entre formatos de contenedor. Cualquier mejora de calidad atribuida al repositorio seria erronea.
- Ausencia total de evaluacion de calidad: no hay benchmarks, ni evaluacion multilingue, ni datos de sesgo. La unica prueba es una recuperacion sintetica de cinco hechos.
- Anclaje de hardware y runtime: el contenedor `.ninfer` v3 solo se ejecuta con NInfer y NVFP4, lo que exige GPU Blackwell. Esto invalida su uso en la mayoria de infraestructuras existentes y descarta servidores basados en A100, H100 o RTX 4090.
- Riesgo de alucinacion: no cuantificado. La prueba de recuperacion no mide si el modelo inventa hechos cuando no estan en el contexto.
- Idiomas: no declarados. No hay garantia de calidad en castellano ni en ningun otro idioma distinto del que herede el modelo base.
- Validacion nula por parte de la comunidad: 0 descargas y 0 likes en el momento de redactar esta ficha. No existe evidencia independiente de que el artefacto funcione fuera del entorno del autor.
- Licencia: la model card original de Huihui declara Apache-2.0 y este repositorio la hereda, pero la falta de una revision de origen fijada impide verificar la cadena de licencias completa. Antes de un uso comercial conviene auditar el linaje y, en particular, las condiciones aplicables al modelo base de Qwen subyacente.
- Reproducibilidad: la model card aporta hashes SHA-256 del artefacto v2 y v3 y el commit de NInfer empleado, lo que permite verificar la integridad de la copia, pero no documenta los hiperparametros exactos del fixture de recuperacion.
- Uso responsable: dado el caracter sin censura del modelo, cualquier despliegue debe ir acompanado de controles de acceso, registro de peticiones y evaluacion de riesgo previa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hfsteady/Qwen3.8-27B-huihui-abliterated-NVFP4-NInfer-v3
- Modelo base declarado: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Artefacto publico de origen (referenciado por el autor, no verificado en la busqueda): `Barding-Defense/Qwen3.8-27B-huihui-abliterated-NVFP4-NInfer`, revision `228612d2a1f48c9e1b6f5e102f369c133c0f6eec`
- Commit de NInfer empleado para la migracion y las pruebas: `9e163eee4b8acec21ab0ac765107b6a3f287b217`
- Paper, blog, repositorio del runtime o demo: no disponibles. La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo, la familia Qwen3.8 ni el runtime NInfer; los unicos resultados obtenidos eran tablas de tallas de ropa y calzado, sin relacion con el objeto de esta ficha.
