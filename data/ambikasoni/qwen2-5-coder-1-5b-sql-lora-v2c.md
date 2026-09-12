# AmbikaSoni/qwen2.5-coder-1.5b-sql-lora-v2c

## Resumen

`AmbikaSoni/qwen2.5-coder-1.5b-sql-lora-v2c` es un adaptador LoRA (libreria `peft`) entrenado con QLoRA sobre el modelo base `Qwen/Qwen2.5-Coder-1.5B-Instruct` para la tarea de text-to-SQL, es decir, convertir una pregunta en lenguaje natural junto con un esquema de base de datos en una consulta SQL valida. Lo desarrolla el usuario de HuggingFace AmbikaSoni y se apoya en el dataset publico `b-mc2/sql-create-context`. Es un artefacto pequeno, orientado a investigacion y a experimentacion en entornos con recursos limitados: el propio autor documenta que el entrenamiento se ejecuto en una unica GPU NVIDIA T4 de la capa gratuita de Google Colab.

El interes principal del modelo es su relacion coste/rendimiento en un caso de uso muy acotado. Segun la model card, el adaptador eleva la metrica de exact-match (tras normalizacion) del 35,0 % al 70,0 % sobre 100 ejemplos de test reservados, un incremento de 35 puntos porcentuales respecto al modelo base sin ajustar. El entrenamiento emplea LoRA con r=16, alpha=32 y dropout de 0,05 sobre siete modulos de proyeccion, con 5.000 ejemplos de entrenamiento y una sola epoca.

Se trata de un modelo muy especializado y de alcance limitado: no es un modelo generalista, no sustituye a un LLM de proposito general y su utilidad practica depende de que el esquema SQL se proporcione en el contexto. La model card no declara licencia, idiomas soportados ni licencia de los pesos, por lo que su uso en produccion requiere verificacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso (Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | Modelo base ~1,5 B (no se detalla el recuento exacto en la ficha); parametros entrenables del adaptador: no disponible |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 con doble cuantizacion y computo bf16; no se distribuyen pesos cuantizados del adaptador |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Tamano del repositorio | 0,0 GB segun los metadatos de HuggingFace |
| Dataset de entrenamiento | b-mc2/sql-create-context |
| Configuracion LoRA | r=16, alpha=32, dropout=0,05 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango, no un modelo completo. Se aplica sobre `Qwen/Qwen2.5-Coder-1.5B-Instruct`, un transformer decoder-only denso de la familia Qwen2.5-Coder, orientado a codigo e instrucciones. El adaptador se inyecta en las siete proyecciones habituales de atencion y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) con rango 16, alpha 32 y dropout 0,05.

El entrenamiento es QLoRA: el modelo base se carga en 4-bit NF4 con doble cuantizacion y el computo se realiza en bf16. Se usaron 5.000 ejemplos del dataset `b-mc2/sql-create-context` (pares de pregunta, esquema y consulta SQL), con 100 ejemplos reservados para test. La configuracion es de una sola epoca, batch efectivo de 16 (batch 4 con acumulacion de gradiente 4), learning rate 2e-4 con scheduler coseno y 5 pasos de warmup. Todo el ajuste se ejecuto en una unica NVIDIA T4 (Google Colab, capa gratuita), lo que da una idea de la escala computacional del proyecto. No se documenta en la informacion disponible el uso de RLHF, DPO ni ninguna innovacion de decodificacion.

## Capacidades

- Generacion de SQL a partir de lenguaje natural: dado un esquema de tabla y una pregunta, produce la consulta SQL correspondiente. Es la capacidad objetivo del ajuste.
- Seguimiento de instrucciones del modelo base Qwen2.5-Coder-1.5B-Instruct, sobre el que se apoya el adaptador.
- Generacion de codigo general heredada del modelo base, aunque el ajuste puede degradar capacidades ajenas al text-to-SQL (no se aportan datos sobre este punto).
- Comprension de esquemas de base de datos incluidos en el prompt (columnas, tipos, relaciones), segun el formato del dataset sql-create-context.
- Soporte de tool calling / function calling: no confirmado para el adaptador; el modelo base Qwen2.5-Coder-Instruct lo soporta, pero no se valida en esta ficha.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el dataset de entrenamiento es en ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; no se documenta ninguna.

## Casos de uso

- Prototipado rapido de asistentes de consulta a bases de datos: el adaptador puede integrarse en una demo que reciba una pregunta en lenguaje natural y el DDL de las tablas y devuelva la consulta SQL, con un coste de hardware muy bajo (cabe en una T4 o incluso en GPUs de consumo).
- Generacion de consultas en herramientas internas de analitica: para entornos donde el usuario no domina SQL y las tablas siguen un esquema estable que se puede inyectar en el prompt en cada peticion.
- Filtrado previo en pipelines de texto a SQL: dado su tamano reducido, puede actuar como primer generador y delegar en un modelo mayor solo los casos de baja confianza, reduciendo coste de inferencia.
- Educacion y ensenanza de SQL: el modelo puede mostrar la traduccion de una pregunta en lenguaje natural a una consulta, util como apoyo didactico en cursos de bases de datos.
- Base para experimentos de investigacion en adaptacion eficiente: sirve como punto de partida reproducible (configuracion LoRA, hiperparametros y dataset documentados) para estudiar QLoRA en tareas estructuradas.
- Ajuste adicional sobre dominios concretos: el adaptador puede reentrenarse con datos propios de un esquema corporativo para especializarlo, dado el bajo coste del ciclo de entrenamiento observado en la ficha.
- Generacion de consultas en entornos con restricciones de privacidad: al poder ejecutarse localmente en una GPU pequena, permite mantener los esquemas y las consultas dentro de la infraestructura propia.

## Benchmarks y rendimiento

Los unicos datos disponibles son los de la model card del autor, medidos como exact-match tras normalizacion sobre 100 ejemplos de test reservados.

| Ejecucion | Modelo base | Baseline | Fine-tuned | Delta |
|---|---|---|---|---|
| V1 (Qwen2.5-1.5B-Instruct, r=16, alpha=32, 2.500 ejemplos) | Qwen2.5-1.5B-Instruct | 42 % | 61 % | +19 |
| V2C (Qwen2.5-Coder-1.5B-Instruct, r=16, alpha=32, 5.000 ejemplos) | Qwen2.5-Coder-1.5B-Instruct | 35,0 % | 70,0 % | +35,0 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K, Spider, BIRD ni de ningun otro benchmark estandar de text-to-SQL. Tampoco se detalla la funcion de normalizacion aplicada ni el prompt exacto de evaluacion, lo que limita la comparabilidad de la cifra del 70 %.

## Requisitos de hardware

- El adaptador en si ocupa muy poco espacio (orden de decenas de MB, no especificado); el requisito real lo marca el modelo base de ~1,5 B parametros.
- VRAM estimada para el modelo base en bf16/fp16: en torno a 3-4 GB de pesos mas overhead de activaciones (estimacion, no confirmada en la ficha).
- VRAM estimada con cuantizacion 4-bit NF4: en torno a 1-2 GB (estimacion, no confirmada en la ficha).
- GPU utilizadas en el entrenamiento: 1x NVIDIA T4 (Google Colab, capa gratuita), lo que confirma que la carga de ajuste cabe en 16 GB de VRAM.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y similares, especialmente con cuantizacion de 4 bits (estimacion).
- Opciones de despliegue: `transformers` + `peft` (patron documentado por el autor), vLLM con soporte de adaptadores LoRA y, previa fusion del adaptador con el modelo base y conversion a GGUF, llama.cpp u Ollama. No se documentan en la ficha otras opciones ni configuraciones.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo ni de latencia por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Text-to-SQL (exact-match) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-coder-1.5b-sql-lora-v2c | ~1,5 B (base) + adaptador LoRA | No disponible | 70,0 % (100 ejemplos propios) | No disponible | HuggingFace, 0 descargas |
| Qwen2.5-Coder-1.5B-Instruct (base sin ajustar) | ~1,5 B | No disponible en esta ficha | 35,0 % (misma evaluacion) | No disponible en esta ficha | HuggingFace |
| Adaptador V1 del mismo autor (sobre Qwen2.5-1.5B-Instruct) | ~1,5 B (base) + LoRA | No disponible | 61 % (100 ejemplos propios) | No disponible | HuggingFace |
| Modelos especializados de text-to-SQL de mayor tamano (p. ej. familia SQLCoder) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos adicionales en la informacion proporcionada. Las cifras de los tres primeros modelos no son directamente comparables con evaluaciones estandar como Spider o BIRD, ya que provienen de un conjunto de test propio de 100 ejemplos.

## Limitaciones y advertencias

- No se declara licencia en la model card. El uso comercial queda en un limbo legal hasta que se aclare, y tampoco se especifica la licencia de los pesos derivados del modelo base.
- Es un adaptador, no un modelo autonomo: requiere descargar y cargar `Qwen/Qwen2.5-Coder-1.5B-Instruct` para funcionar.
- El repositorio figura con 0,0 GB de tamano y 0 descargas en los metadatos, lo que sugiere que los pesos pueden no estar subidos o que el repositorio estaba vacio en el momento de la indexacion. Conviene verificar el contenido antes de usarlo.
- El ajuste se realizo con 5.000 ejemplos y una sola epoca sobre un unico dataset (`b-mc2/sql-create-context`), de dominio y esquemas limitados y en ingles. La generalizacion a esquemas empresariales reales no esta validada.
- La metrica reportada (70 % de exact-match) procede de 100 ejemplos de test del propio autor, con una funcion de normalizacion no especificada. No equivale a resultados en Spider, BIRD ni en ningun benchmark publico reproducible.
- Riesgo de alucinacion de columnas, tablas o funciones SQL que no existen en el esquema proporcionado, comportamiento tipico de los modelos de esta escala.
- No se documenta la longitud de contexto soportada ni el comportamiento con esquemas largos, lo que es critico en text-to-SQL sobre bases de datos reales.
- No hay datos sobre sesgos, idiomas soportados ni rendimiento fuera del ingles.
- No hay evidencia de que el ajuste conserve intactas otras capacidades del modelo base (generacion de codigo general, tool calling). Puede haber olvido catastrofico.
- Ausencia total de adopcion e informacion de mantenimiento (0 descargas, 0 likes, sin pipeline declarado), lo que implica un riesgo de abandono del repositorio.
- Las consultas SQL generadas deben validarse siempre antes de ejecutarse en produccion: un error de sintaxis o de semantica puede provocar escrituras o lecturas incorrectas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmbikaSoni/qwen2.5-coder-1.5b-sql-lora-v2c
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/b-mc2/sql-create-context
- Libreria PEFT: https://github.com/huggingface/peft
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper de QLoRA: https://arxiv.org/abs/2305.14314
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos correspondian a un medio de prensa austriaco sin relacion con el proyecto). No se han encontrado papers, blogs, repositorios ni demos adicionales del autor.
