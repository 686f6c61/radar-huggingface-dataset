# Om22s/alexandria-qwen3-attribution

## Resumen

Alexandria Qwen3 attribution es un conjunto de adaptadores LoRA (formato PEFT) que especializan modelos de la familia Qwen3 en una tarea muy concreta: la atribución de hablante en prosa de ficción en inglés. Dado un texto ya segmentado en intervenciones o líneas y un roster de personajes proporcionado por el usuario, el modelo devuelve un objeto JSON `{"n","speaker"}` por entrada, asignando a cada línea el nombre del personaje que la pronuncia. Lo publica el usuario Om22s dentro del proyecto Alexandria Audiobook, orientado a la producción automatizada de audiolibros con voces diferenciadas.

No es un modelo de chat ni un modelo autónomo: son adaptadores que se cargan sobre un modelo base que no se distribuye en este repositorio. El repo agrupa variantes para tres bases distintas (`Qwen/Qwen3-14B`, `Qwen/Qwen3.8-27B` y el MoE `Qwen/Qwen3.6-35B-A3B`), con distintos conjuntos de datos de entrenamiento y distintas recetas (LoRA y QLoRA). El adaptador principal, `qwen3-14b-rightsclean`, contiene 64.225.280 parámetros en safetensors y eleva la precisión de atribución del 61,7 % al 73,4 % sobre el fixture de producto de cuatro libros, según los datos declarados por el autor.

Su relevancia es acotada pero real: cubre un cuello de botella típico de los pipelines de audiolibro (decidir quién habla en cada línea antes de sintetizar) con un adaptador pequeño, desplegable en local sobre una base cuantizada a Q4_K_M mediante llama.cpp, y con un enfoque explícito de "rights-reviewed": el entrenamiento se limita a novelas de dominio público (PDNC), RiQuA y guiones de teatro CC0, lo que facilita el uso comercial. La contrapartida es que las ganancias son específicas del fixture y una parte de los resultados todavía no está medida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformers decoder-only de la familia Qwen3; recetas LoRA y QLoRA (uno de ellos, atencion unicamente) |
| Parametros totales | 64.225.280 en safetensors (pesos del adaptador; el modelo base no se incluye) |
| Parametros activos | No aplica al adaptador. El base `Qwen/Qwen3.6-35B-A3B` es MoE segun su denominacion (~3B activos), dato no verificado en la informacion disponible |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | Export GGUF; el adaptador principal se evaluo con el base en Q4_K_M. Para `qwen3.8-27b-rightsclean-michel2` el autor indica "lower quants queued" (niveles inferiores pendientes) |
| Idiomas soportados | Ingles (`en`). Otros idiomas sin probar segun el autor |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT) y GGUF |

Datos adicionales del repositorio: tamano 2,0 GB, 20 descargas, 0 likes, creado el 2026-09-17 y actualizado el 2026-09-19, libreria `peft`, pipeline `text-generation`, revision etiquetada `v1.0.0`.

## Arquitectura y entrenamiento

El repositorio no entrena un modelo desde cero: publica adaptadores de bajo rango sobre modelos Qwen3 ya existentes. El adaptador de referencia, `adapters/qwen3-14b-rightsclean/`, se entrena sobre fuentes PDNC, RiQuA y prosa teatral, y es el que mejores cifras declara (61,7 % a 73,4 % en el fixture de producto de cuatro libros). Existen otras variantes de ablacion sobre la misma base: `qwen3-14b-riqua3ep` (RiQuA, tres epocas, 61,7 % a 69,7 %), `qwen3-14b-riquax2` (RiQuA repetido dos veces, 61,7 % a 70,6 %) y `qwen3-14b-rightsclean-seed2` (la receta rights-clean con una segunda semilla, 66,1 % a 74,9 % con razonamiento en presupuesto bajo).

Para las bases mayores se emplean recetas distintas: `qwen3.6-35b-a3b-rightsclean-michel2` es un QLoRA "attention-only" sobre la base MoE, con un GGUF de solo 6,9 MB y todavia sin puntuar; `qwen3.8-27b-rightsclean-michel2` es un QLoRA sobre Qwen3.8-27B que pasa de 87,4 % a 88,3 % en Q4_K_M con razonamiento desactivado. Los dos adaptadores `michel2` se entrenaron con una variante de prompt distinta de la que se distribuye por defecto: fueron entrenados con la forma `michel2` y se evaluan con `michel2_full`, de modo que el prompt `default` incluido no es su forma de entrenamiento.

El conjunto de datos de entrenamiento es en todos los casos prosa inglesa: 20 novelas PDNC de dominio publico, novelas RiQuA y guiones de teatro CC0, mas cuatro novelas ligeras japonesas traducidas que se emplean como fixture de producto. No hay informacion disponible sobre numero total de tokens, composicion exacta del dataset, ni sobre etapas de RLHF o DPO; el ajuste es supervisado mediante LoRA. La innovacion tecnica destacable no esta en la arquitectura sino en el contrato de salida (JSON estructurado validable) y en la trazabilidad de derechos de las fuentes.

## Capacidades

- Atribucion de hablante en prosa de ficcion en ingles: asigna un nombre del roster a cada linea ya segmentada.
- Salida estructurada: un objeto JSON `{"n","speaker"}` por entrada, con indices que deben validarse (rechazar respuestas que omitan, dupliquen o inventen indice, o nombren un hablante fuera del roster).
- Seleccion desde roster: admite los valores especiales `NARRATOR` y `UNKNOWN` ademas de los personajes listados.
- Modo de razonamiento configurable: los resultados declarados incluyen configuraciones con razonamiento desactivado y con presupuesto bajo de razonamiento (1024 tokens) mas esquema JSON.
- Compatibilidad entre tamanos de base: hay adaptadores para una base densa de 14B, otra densa de 27B y una MoE de 35B-A3B, lo que permite ajustar coste y precision.
- Despliegue local: se sirve mediante llama.cpp con el export GGUF, o cargando el adaptador con PEFT sobre transformers.
- No soporta: chat general, resumen, traduccion, deteccion autonoma de personajes (requiere roster), otros idiomas (sin probar) ni vision o audio.

## Casos de uso

- Produccion de audiolibros multi-voz: el adaptador etiqueta cada linea de una novela con su hablante antes de pasar el texto a un motor TTS; despues se sintetiza cada intervencion con la voz asignada al personaje. Es el escenario para el que fue disenado y el que cubren los fixtures de evaluacion.
- Etiquetado de dialogos en proyectos de dominio publico: para corpus tipo PDNC o LibriVox, donde no existe una anotacion de hablante fiable, el adaptador genera etiquetas iniciales sobre las que aplicar revision humana antes de publicar.
- Pre-anotacion de corpus literarios para investigacion: narratologia, estilometria o analisis de dialogo pueden partir de las etiquetas del modelo para acelerar el etiquetado manual de novelas completas, validando el contrato JSON en cada lote.
- Control de calidad editorial: detectar lineas mal atribuidas en manuscritos o en ediciones digitalizadas antes de la maquetacion final, usando el roster de personajes de la obra como lista cerrada.
- Generacion de datos de entrenamiento (silver labels): producir pares linea-hablante a gran escala sobre novelas de dominio publico para entrenar o evaluar otros modelos de atribucion, siempre con un filtro de validacion del JSON.
- Pipelines de accesibilidad: mejorar la lectura asistida o la conversion texto-a-voz de obras de ficcion diferenciando narrador y personajes, con una etapa de revision humana obligatoria en el audio publicado.
- Ajuste coste/precision segun infraestructura: usar el adaptador de 14B en Q4_K_M en una maquina local para tiradas grandes de bajo coste, y reservar los adaptadores de 27B o 35B-A3B para pasadas finales donde la precision importa mas.
- Auditoria de derechos en productos comerciales: al entrenarse sobre PDNC, RiQuA y guiones CC0, el flujo permite documentar que el adaptador no se ajusto sobre obras con copyright, lo que simplifica la revision legal del producto final.

## Benchmarks y rendimiento

Los datos siguientes proceden del `model-index` de la model card y estan declarados por el autor; el propio repositorio los marca como `verified: false`, es decir, no verificados de forma independiente. Las comparaciones base/LoRA se hicieron sobre un unico servidor llama.cpp con la base Qwen3-14B en Q4_K_M.

| Tarea | Conjunto de evaluacion | Base | Adaptador | Diferencia |
|---|---|---|---|---|
| Atribucion de hablante (JSON estructurado, roster dado) | Fixture de producto de cuatro libros (768 filas emparejadas, temperatura 0, batch 25, prompt por defecto, razonamiento desactivado) | 61,7 | 73,4 | +11,7 |
| Atribucion de hablante (JSON estructurado, roster dado) | Fixture de producto de cuatro libros, razonamiento con presupuesto bajo 1024 y esquema JSON | 66,1 | 74,7 | +8,6 |
| Atribucion de hablante (JSON estructurado, roster dado) | PDNC Emma, en reserva (318 filas, 40 ventanas), razonamiento con presupuesto bajo 1024 | 68,9 | 75,8 | +6,9 |

Otras cifras declaradas en la model card, sin fila propia en el `model-index`:

| Adaptador | Base | Resultado declarado |
|---|---|---|
| `qwen3-14b-riqua3ep` | Qwen3-14B | 61,7 a 69,7 |
| `qwen3-14b-riquax2` | Qwen3-14B | 61,7 a 70,6 |
| `qwen3-14b-rightsclean-seed2` | Qwen3-14B | 66,1 a 74,9 con razonamiento bajo (semilla 1: 74,7); en Emma en reserva +0,6 (semilla 1: +6,9) |
| `qwen3.8-27b-rightsclean-michel2` | Qwen3.8-27B | 87,4 a 88,3 en Q4_K_M con razonamiento desactivado |
| `qwen3.6-35b-a3b-rightsclean-michel2` | Qwen3.6-35B-A3B | Sin puntuar (not yet scored) |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, ni comparaciones con modelos de atribucion de terceros.

## Requisitos de hardware

- El adaptador en si ocupa unos 128 MB en BF16 (64,2 M de parametros), pero no es utilizable sin el modelo base. El repositorio completo pesa 2,0 GB, incluyendo exportaciones GGUF.
- VRAM estimada para la base Qwen3-14B (estimacion derivada del numero de parametros, no publicada por el autor): en BF16 en torno a 28 GB; en Q8 alrededor de 15 GB; en Q4_K_M alrededor de 9 GB. Esta ultima es la configuracion con la que se obtuvieron las puntuaciones declaradas.
- VRAM estimada para la base Qwen3.8-27B: en BF16 en torno a 54 GB; en Q4_K_M alrededor de 17 GB. El autor indica que hay cuantizaciones mas bajas pendientes de publicar.
- VRAM estimada para la base MoE Qwen3.6-35B-A3B (adaptador `attention-only`, GGUF de 6,9 MB): en BF16 en torno a 70 GB; en Q4 alrededor de 20-22 GB, con la ventaja de que al ser MoE solo se activa una fraccion de los parametros por token, lo que reduce el coste de computo respecto a una base densa del mismo tamano.
- Cabe en GPU de consumo: la variante de 14B en Q4_K_M entra en tarjetas de 12 GB, y con holgura en 16-24 GB (RTX 4080, RTX 4090, RTX 3090). Las bases de 27B y 35B-A3B en Q4 requieren 24 GB o mas y quedan al limite en una RTX 4090; en BF16 necesitan GPU de datacenter (A100 80 GB, H100).
- Opciones de despliegue confirmadas en la documentacion: llama.cpp sirviendo el export GGUF (el script `examples/serve_llamacpp.sh` reproduce la configuracion con la que se obtuvieron las puntuaciones) y carga del adaptador con PEFT sobre transformers (`PeftModel.from_pretrained` con `subfolder` y `revision`). Otros servidores como vLLM, TGI u Ollama no se mencionan en la informacion disponible y no estan confirmados por el autor.
- Latencia y throughput: no disponibles. El autor solo documenta el ajuste de evaluacion (temperatura 0, batch 25, 768 filas emparejadas en el fixture principal).

## Comparativa con modelos similares

No hay en la informacion disponible datos de modelos de terceros comparables en la tarea de atribucion de hablante, por lo que la comparacion se limita a las variantes publicadas dentro del propio repositorio y a su modelo base.

| Modelo / adaptador | Base | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-14B sin adaptar | - | 14B (aprox.) | No disponible | 61,7 / 66,1 / 68,9 segun configuracion | Apache 2.0 (base) | Publico en HuggingFace |
| `qwen3-14b-rightsclean` | Qwen3-14B | 64,2 M de adaptador | No disponible | 73,4 / 74,7 / 75,8 | apache-2.0 | Incluido en este repo |
| `qwen3-14b-rightsclean-seed2` | Qwen3-14B | No disponible | No disponible | 74,9 con razonamiento bajo; +0,6 en Emma | apache-2.0 | Incluido en este repo |
| `qwen3-14b-riqua3ep` | Qwen3-14B | No disponible | No disponible | 69,7 | apache-2.0 | Incluido en este repo |
| `qwen3-14b-riquax2` | Qwen3-14B | No disponible | No disponible | 70,6 | apache-2.0 | Incluido en este repo |
| `qwen3.8-27b-rightsclean-michel2` | Qwen3.8-27B | No disponible | No disponible | 88,3 en Q4_K_M sin razonamiento | apache-2.0 | Incluido en este repo |
| `qwen3.6-35b-a3b-rightsclean-michel2` | Qwen3.6-35B-A3B | No disponible (GGUF de 6,9 MB) | No disponible | Sin puntuar | apache-2.0 | Incluido en este repo |

## Limitaciones y advertencias

- Entrenado y evaluado unicamente sobre prosa inglesa: 20 novelas PDNC de dominio publico, novelas RiQuA, guiones de teatro CC0 y cuatro novelas ligeras japonesas traducidas usadas como fixture. Otros idiomas, generos y convenciones de dialogo no estan medidos; el autor declara explicitamente que otros idiomas no se han probado.
- Los adaptadores seleccionan un nombre de un roster proporcionado. No descubren personajes: si el roster es incompleto o desconocido, la tarea falla por diseno.
- Sesgo hacia los nombres frecuentes en el texto circundante y hacia los priors del modelo base sobre quien habla. Una atribucion erronea asigna las palabras de un personaje a otro, algo audible en un audiolibro y potencialmente lesivo para la representacion del personaje.
- Riesgo de alucinacion en el contrato de salida: hay que validar el JSON y rechazar respuestas que omitan, dupliquen o inventen indices, o que nombren hablantes fuera del roster (salvo `NARRATOR` y `UNKNOWN`). Se recomienda mantener una revision humana antes de publicar audio.
- Las ganancias son especificas del fixture. El adaptador de la segunda semilla replica la mejora en el fixture de cuatro libros (+8,6 / +8,8) pero no la de la novela en reserva (+6,9 / +0,6 sobre Emma), lo que sugiere que la mejora fuera del fixture no esta todavia demostrada.
- Dos adaptadores (`michel2` sobre 27B y sobre 35B-A3B) se entrenaron con la variante de prompt `michel2` y se evaluan con `michel2_full`; el prompt `default` distribuido en el repositorio no es su forma de entrenamiento. Usarlos con el prompt por defecto degrada el resultado.
- El adaptador sobre la base MoE de 35B-A3B no tiene puntuacion publicada, por lo que no hay evidencia de su rendimiento.
- Todos los resultados del `model-index` estan marcados como no verificados y proceden del propio autor; las comparaciones base/LoRA se hicieron en un unico servidor llama.cpp con la base en Q4_K_M, por lo que no son extrapolables a otras configuraciones de cuantizacion o de servicio.
- No debe usarse para emitir juicios sobre personas reales. Los adaptadores no modifican el comportamiento de seguridad del modelo base y heredan sus limitaciones.
- Licencia apache-2.0 sobre los adaptadores, pero el uso esta condicionado por la licencia del modelo base que se cargue y por la trazabilidad de derechos de las fuentes de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Om22s/alexandria-qwen3-attribution
- Repositorio de recetas y resultados (RECIPES.md): https://github.com/on22s/alexandria-audiobook2/blob/main/RECIPES.md
- Repositorio del proyecto Alexandria Audiobook: https://github.com/on22s/alexandria-audiobook2
- Script de inferencia de ejemplo: `examples/infer.py` (dentro del repositorio del modelo)
- Script de servicio con llama.cpp: `examples/serve_llamacpp.sh` (dentro del repositorio del modelo)
- Prompts del contrato de atribucion: `default_prompts_attribute.txt` (dentro del repositorio del modelo)
- Variantes de prompt de entrenamiento: `app/attribution_prompt_variants.py` (dentro del repositorio del modelo)
- Repositorio predecesor del adaptador de 14B: https://huggingface.co/Om22s/alexandria-qwen3-14b-rightsclean-speaker-attribution
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los unicos enlaces recuperados pertenecen a un foro de cocina en arabe sin relacion con el proyecto.
