# Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-oQ6e

## Resumen

Este repositorio contiene una cuantizacion en formato MLX del modelo etiquetado como `qwen3_5`, publicada por el usuario `Johneeee` bajo el identificador `Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-oQ6e`. No se trata de un modelo entrenado desde cero, sino de un artefacto de cuantizacion: el autor aplico la herramienta oQ (oMLX v0.7.0.dev2) para generar una version mixta de 6 bits con group size 64, partiendo de un modelo base que no se identifica con precision en la informacion disponible (el tag `qwen3_5` sugiere una base de la familia Qwen, pero no hay confirmacion oficial).

El dato objetivo mas relevante es el numero de parametros reales declarado en los safetensors: 26.895.998.464 (~26,9 mil millones), con un tamano de repositorio de 22,5 GB. El nombre incluye etiquetas como `Uncensored` y `HERETIC`, habituales en la comunidad para indicar que el modelo base ha sido modificado para reducir o eliminar los mecanismos de rechazo (abliteration o fine-tuning sin alineamiento de seguridad), aunque este repositorio no documenta ese proceso: solo describe la cuantizacion.

Su relevancia practica es limitada y muy acotada: esta pensado para ejecucion local en hardware Apple Silicon mediante MLX, un nicho donde las opciones de modelos de ~27B en 6 bits son escasas. El repositorio tiene 0 descargas y 0 likes, sin licencia declarada ni benchmarks publicados, por lo que debe tratarse como un artefacto no validado por la comunidad. Las fechas de creacion y actualizacion indicadas (2026-09-18) resultan anomalas y no se han podido verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag de tipo de modelo es `qwen3_5`, sin detalle de arquitectura) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no aplica segun la informacion disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ de 6 bits, group size 64 (mixed-precision); no se ofrecen otras variantes en este repo |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (`safetensors` + libreria `mlx`) |
| Tamano del repositorio | 22,5 GB |
| Herramienta de cuantizacion | oQ / oMLX v0.7.0.dev2 |
| Fecha de creacion declarada | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion sobre la arquitectura interna mas alla del campo `model_type: qwen3_5` y del tag `qwen3_5`. No se especifica si es un transformer denso, un MoE o un modelo hibrido, ni el numero de capas, dimensiones de atencion, tipo de posicional encoding o si emplea tecnicas como atencion lineal o decodificacion especulativa. Tampoco se documenta el proceso de entrenamiento del modelo base: no hay datos sobre numero de tokens, composicion del dataset, fases de SFT, RLHF o DPO.

Lo unico documentado es el post-procesado de cuantizacion. El autor indica que uso oQ (oMLX v0.7.0.dev2) para una cuantizacion mixta de 6 bits con group size 64, en formato MLX safetensors. La cuantizacion mixta implica que distintas capas o tensores pueden recibir precisiones distintas dentro del mismo esquema de 6 bits, un enfoque que busca preservar mejor la calidad que una cuantizacion uniforme del mismo numero de bits. No se publica ninguna evaluacion de la degradacion introducida por este proceso, ni comparacion contra el modelo en precision completa.

Por el nombre del repositorio (`Uncensored`, `HERETIC`) es razonable inferir que la base ha sufrido algun tipo de modificacion orientada a eliminar rechazos de seguridad, pero el autor no la describe, no indica la metodologia ni aporta evidencia. Cualquier afirmacion al respecto seria especulacion.

## Capacidades

- Generacion de texto: capacidades esperables de un modelo de ~27B de la familia Qwen, pero no verificadas ni documentadas en este repositorio.
- Razonamiento y matematicas: no disponible; sin benchmarks ni ejemplos publicados.
- Generacion de codigo: no disponible; sin datos que confirmen capacidades de programacion.
- Tool calling / function calling: no disponible; no se declara soporte.
- Uso en agentes y razonamiento multi-paso: no disponible; no se declara soporte ni plantilla de chat especifica.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Vision o audio: no disponible; no hay modalidades adicionales declaradas.
- Modo de pensamiento (thinking mode): no disponible.
- Ejecucion local en Apple Silicon: capacidad confirmada por el formato MLX y la libreria declarada.
- Comportamiento sin rechazos: implicito en el nombre (`Uncensored`, `HERETIC`), no documentado ni medido.

## Casos de uso

- Inferencia local en Mac para datos sensibles: al ejecutarse con MLX sobre memoria unificada, el modelo puede procesar documentos confidenciales sin enviarlos a la nube. El limite practico es el contexto, que no esta declarado, por lo que habria que medirlo antes de usarlo con documentos largos.
- Experimentacion con cuantizacion mixta de 6 bits: util para investigadores que quieran comparar la degradacion de oQ 6-bit group 64 frente al modelo en FP16, midiendo perplejidad y tareas concretas sobre el mismo hardware.
- Investigacion en seguridad y red-teaming: un modelo con los rechazos presumiblemente atenuados sirve para generar casos adversarios y evaluar la robustez de clasificadores de contenido, en un entorno controlado y aislado.
- Generacion creativa sin filtros editoriales: escritura de ficcion, guiones o narrativa con tematicas duras, donde los rechazos de modelos alineados interrumpen el flujo. Requiere revision humana del resultado.
- Prototipado offline en portatiles Apple: desarrollo de aplicaciones de asistencia conversacional que deben funcionar sin conexion, usando mlx-lm como servidor local.
- Pruebas de pipeline de cuantizacion: banco de pruebas para validar herramientas oQ/oMLX antes de aplicarlas a modelos mayores, dado que el coste de cuantizar 27B es manejable en un equipo con 32-64 GB de memoria unificada.
- Analisis de textos sin licencia clara de datos: si la licencia del repositorio finalmente no permite uso comercial, el unico escenario viable es el experimental o de investigacion interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor se limita a describir el proceso de cuantizacion (tipo, bits, group size y formato) y no incluye ninguna tabla de evaluacion. Tampoco se han encontrado resultados en la busqueda web: los enlaces recuperados corresponden a documentos sobre posologias de antibioticos y no guardan relacion alguna con el modelo.

En consecuencia, no hay datos de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra metrica, ni para el modelo cuantizado ni para su base. Tampoco hay mediciones de throughput o latencia en tokens por segundo.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos en 6 bits ocupan aproximadamente 20,2 GB (26,9 B x 0,75 bytes por parametro), coherente con los 22,5 GB del repositorio. Hay que sumar el cache KV, cuyo tamano depende del contexto y de la configuracion de atencion, no declarada.
- Memoria unificada recomendada en Apple Silicon: 32 GB como minimo absoluto con contexto corto; 64 GB o mas para contextos largos y margen de seguridad.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas de forma nativa por MLX. Su uso exigiria convertir los pesos a otro formato (por ejemplo GGUF) o emplear el backend CUDA experimental de MLX, no validado en este repositorio.
- GPU de consumo: no aplica en su formato actual, al estar empaquetado exclusivamente para el ecosistema MLX de Apple.
- Opciones de despliegue: mlx-lm (incluido su servidor HTTP compatible con la API de OpenAI), oMLX, y clientes graficos que soporten MLX como LM Studio. Ollama no soporta MLX, por lo que requeriria conversion previa.
- Latencia y throughput: no disponible. Sin datos publicados de tokens por segundo en ningun chip (M1, M2, M3, M4 o variantes Pro/Max/Ultra).

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion facilitada, y la busqueda web no devolvio ningun resultado relevante. La tabla siguiente recoge unicamente los ejes sobre los que hay datos contrastables, dejando el resto como no disponible.

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-27B-TWIN-TURBO-...-oQ6e (este) | 26,9 B | no disponible | MLX safetensors 6-bit | no disponible | no disponible |
| Modelo base sin cuantizar | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de ~27-32B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No es posible establecer una comparativa rigurosa porque se desconoce la identidad exacta del modelo base, su licencia y sus resultados. Cualquier comparacion de rendimiento seria inventada.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial. En ausencia de terminos, el uso en produccion conlleva riesgo legal.
- Modelo sin validacion comunitaria: 0 descargas y 0 likes, un solo autor y ninguna evaluacion independiente. No hay evidencia de que los pesos esten intactos ni de que la cuantizacion haya sido verificada.
- Seguridad alineada presumiblemente eliminada: las etiquetas `Uncensored` y `HERETIC` indican que el modelo probablemente genera contenido que otros modelos rechazan. Esto incluye riesgo de instrucciones peligrosas, contenido ofensivo o material ilicito. No debe exponerse a usuarios finales sin filtros externos.
- Alucinacion: sin benchmarks ni evaluaciones, no hay ninguna medida de fiabilidad factual. La cuantizacion de 6 bits puede agravar este problema respecto al modelo original.
- Degradacion por cuantizacion desconocida: no se publica comparacion de perplejidad ni de tareas frente al modelo en precision completa, ni frente a otras configuraciones de bits o group size.
- Contexto e idiomas sin especificar: no se declara ventana de contexto ni cobertura linguistica, lo que impide planificar aplicaciones con requisitos de contexto largo o multilingues.
- Base no identificable con certeza: el nombre `Qwen3.8-27B` no corresponde a ninguna designacion oficial conocida de la familia Qwen segun la informacion disponible, y el tag `qwen3_5` tampoco permite confirmar la procedencia. No puede asumirse que las capacidades del modelo original se mantengan.
- Fechas anomalas: el repositorio declara creacion y actualizacion en septiembre de 2026, con apenas siete minutos de diferencia entre ambas, lo que sugiere metadatos no fiables.
- Dependencia de plataforma: el formato MLX ata el modelo a hardware Apple Silicon, con las limitaciones de portabilidad que ello implica.
- Sin plantilla de chat documentada: no se especifica formato de prompt ni tokens especiales, lo que puede degradar la calidad si se usa con plantillas por defecto inadecuadas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-oQ6e
- Herramienta de cuantizacion oQ (oMLX), citada en la model card: https://github.com/jundot/omlx
- Paper, blog o demo oficial: no disponible
- Resultados de benchmarks: no disponible
- La busqueda web realizada no devolvio ningun enlace relacionado con el modelo; los resultados obtenidos correspondian a documentacion clinica sobre antibioticos y se han descartado por no ser pertinentes.
