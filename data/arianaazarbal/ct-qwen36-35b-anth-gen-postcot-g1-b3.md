# arianaazarbal/ct-qwen36-35b-anth-gen-postcot-g1-b3

## Resumen

ct-qwen36-35b-anth-gen-postcot-g1-b3 es un adaptador LoRA de rango 64 publicado por el usuario arianaazarbal, entrenado sobre el modelo base Qwen/Qwen3.6-35B-A3B. No es un modelo completo: se distribuye como pesos de adaptador PEFT en safetensors (4,5 GB de repositorio) que deben cargarse sobre el modelo base original. Forma parte de un programa de entrenamiento por constitucion iterada (welfare-in-ai-rnd / constitutional_training), en el que cada generacion se entrena desde cero sobre un corpus sintetico que instancia una constitucion escrita por la generacion anterior de la misma rama.

El interes tecnico del artefacto no esta en sus capacidades de generacion —heredadas del modelo base— sino en su metodologia: la deriva entre generaciones se acumula unicamente a traves de los documentos de entrenamiento, nunca a traves de los pesos, porque cada generacion parte siempre del mismo modelo base. Este ejemplar concreto corresponde a la generacion 1 (g1), rama independiente b3, sembrada con la constitucion de Anthropic (resumen de 5.000 palabras).

El adaptador combina una fase de midtrain y una segunda fase de post-entrenamiento (SFT de chat condicionado por constitucion, con las trazas de razonamiento conservadas). La model card indica que debe servirse y evaluarse con el renderer qwen3_5 y el modo de razonamiento activado. No se han publicado resultados de benchmarks, idiomas soportados ni licencia en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre el modelo base Qwen/Qwen3.6-35B-A3B; la nomenclatura A3B del base sugiere arquitectura MoE) |
| Parametros totales | 35B en el modelo base; el adaptador LoRA r=64 sobre target_modules=all-linear supone un numero de parametros entrenables no especificado |
| Parametros activos | no disponible de forma confirmada; la nomenclatura A3B del modelo base sugiere aproximadamente 3B activos |
| Longitud de contexto | no disponible para el base; la longitud maxima de entrenamiento del adaptador fue de 8192 tokens |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors. No se publican versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible (ni la del adaptador ni la del modelo base figuran en la model card) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria peft) |
| Rango de LoRA | 64, target_modules=all-linear |
| Fases de entrenamiento | midtrain + stage-2 post-train (SFT de chat condicionado por constitucion, con trazas de razonamiento) |
| Generacion / rama | g1 / b3 |
| Semilla gen-0 | constitucion de Anthropic (resumen de 5.000 palabras) |
| Fecha de entrenamiento | 2026-09-16 |
| Fecha de exportacion | 2026-09-18 |
| Tamano del repositorio | 4,5 GB |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen/Qwen3.6-35B-A3B, un modelo que por su nomenclatura corresponde a una familia Mixture-of-Experts con 35B parametros totales y del orden de 3B activos por token; la model card no detalla la arquitectura del base, por lo que cualquier afirmacion adicional al respecto no esta confirmada. Sobre ese base se aplica un LoRA de rango 64 con target_modules=all-linear, entrenado con una receta declarada como bloqueada: learning rate 1e-4, scheduler coseno con 5% de warmup, 1 epoca, batch de 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42.

El procedimiento de constitucion iterada funciona asi: la generacion 0 se siembra con una constitucion escrita por humanos (en esta cadena, el resumen de 5.000 palabras de la constitucion de Anthropic). Cada generacion posterior se siembra con una constitucion escrita por el modelo de la generacion anterior de la misma rama, seleccionada como medoide de embedding con filtrado sobre un pool de 40 cadenas autogeneradas. El punto clave del diseno es que cada generacion se entrena desde cero sobre el modelo base, de modo que la deriva acumulada entre generaciones procede exclusivamente del corpus documental y no de una cadena de pesos. La segunda fase (post-train) continua desde el adaptador de la fase 1 sobre datos de chat condicionados por constitucion generados por Opus y con cadena de pensamiento incluida. La constitucion concreta usada en esta generacion se incluye en el repositorio como `training_seed_constitution.md`.

## Capacidades

- Generacion de texto en el marco de un modelo de chat: el adaptador es un ajuste de instrucciones, no una extension de capacidades del base.
- Razonamiento explicito: el entrenamiento de la fase 2 conserva las trazas de cadena de pensamiento, y la model card indica que debe servirse con el modo de razonamiento activado y el renderer `qwen3_5`.
- Condicionamiento por constitucion: el modelo ha sido ajustado sobre documentos que instancian una constitucion concreta, por lo que su comportamiento tiende a reflejar las normas de ese documento de entrenamiento.
- Seguimiento de instrucciones en formato de chat multi-turno, heredado de la fase de post-train.
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente; el modo de razonamiento activo es el unico indicio.
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no documentadas; la pipeline declarada es text-generation.

## Casos de uso

- Investigacion sobre alineacion iterada: el modelo es una pieza de una cadena experimental reproducible (semilla, receta, rama y metadatos de exportacion documentados), util para estudiar como deriva el comportamiento de un modelo cuando la especificacion normativa la escribe la generacion anterior. La existencia de la rama b3 permite comparar replicas independientes de la misma generacion.
- Auditoria de constituciones sinteticas: cargando el adaptador junto con `training_seed_constitution.md` es posible contrastar que principios del documento se reflejan en las respuestas y cuales se diluyen, mediante baterias de prompts disenadas al efecto.
- Generacion de texto condicionada por normativa interna: en entornos donde se quiere que el modelo respete un conjunto explicito de reglas de conducta, este adaptador sirve como punto de partida experimental, siempre que se valide su comportamiento antes de cualquier uso real.
- Evaluacion comparativa de tecnicas de post-entrenamiento: al compartir receta bloqueada (r=64, lr 1e-4, 1 epoca, batch 128, seed 42), es un candidato adecuado para aislar el efecto del corpus de constitucion frente a otras variantes de la misma familia.
- Experimentos de razonamiento con trazas: el modelo puede emplearse para generar cadenas de pensamiento y estudiar su correlacion con el cumplimiento de la constitucion, gracias a que la fase 2 conserva dichas trazas.
- Docencia y divulgacion tecnica: como ejemplo didactico de pipeline PEFT completo (LoRA sobre MoE, exportacion desde Tinker, carga con transformers + peft) en cursos o talleres de ajuste fino.
- Servicio de chat experimental en laboratorio: desplegable con vLLM o TGI sobre el modelo base para pruebas internas de conversacion multi-turno con contexto de hasta 8192 tokens, sin garantias de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: dominada por el modelo base, no por el adaptador. Con 35B parametros totales, las estimaciones derivadas del recuento de parametros son aproximadamente 70 GB en bfloat16, unos 35 GB en 8 bits y entre 18 y 20 GB en 4 bits. Son estimaciones de calculo, no datos publicados por el autor. El adaptador LoRA anade una sobrecarga pequena que se elimina fusionandolo con el base.
- GPU recomendadas: para bfloat16 sin cuantizar, una H100 80 GB o A100 80 GB; con paralelismo de tensor, 2 x A100 40 GB o 2 x L40S 48 GB. Para 8 bits, GPU de 48 GB como RTX 6000 Ada o L40S.
- Cabe en GPU de consumo: en 4 bits si, en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, aunque con margen ajustado para cache KV si se usa la ventana completa de 8192 tokens. En bfloat16 no cabe en ninguna GPU de consumo actual de 24 GB.
- Opciones de despliegue: transformers + peft para carga directa del adaptador (procedimiento documentado en la model card); vLLM y TGI admiten adaptadores LoRA en caliente sobre el base; llama.cpp y Ollama requieren fusionar el adaptador con el base y convertir a GGUF, lo que implicaria generar una cuantizacion propia.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con unos 3B parametros activos por token (segun la nomenclatura del base), el coste de computo por token seria proximo al de un modelo denso de 3B, pero esto no esta confirmado por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| ct-qwen36-35b-anth-gen-postcot-g1-b3 | adaptador LoRA sobre base de 35B (activos no confirmados) | no disponible (entrenado a 8192) | no disponible | HuggingFace, 0 descargas, 0 likes | no publicados |
| Qwen3-30B-A3B (familia Qwen3, MoE denso de referencia) | 30,5B totales / 3,3B activos | 128K | Apache 2.0 | ampliamente disponible | no comparables en esta ficha |
| Mistral Small 3.x 24B | 24B densos | 128K | Apache 2.0 | ampliamente disponible | no comparables en esta ficha |
| Otros adaptadores de la cadena constitutional_training (ramas g1) | adaptadores LoRA sobre el mismo base | no disponible | no disponible | HuggingFace | no publicados |

No se dispone de resultados de benchmarks que permitan una comparacion cuantitativa. La comparativa anterior es estructural. Advertencia: el modelo base Qwen/Qwen3.6-35B-A3B no aparece descrito en los resultados de busqueda web disponibles, por lo que sus especificaciones oficiales no han podido verificarse de forma independiente.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El ajuste sobre un unico documento de constitucion puede introducir sesgos especificos de ese texto, que no han sido auditados ni publicados.
- Riesgo de alucinacion: no evaluado. No hay benchmarks ni evaluaciones de fidelidad publicadas.
- Limitaciones de contexto: la longitud de contexto del modelo base no se especifica; la longitud maxima usada en entrenamiento fue de 8192 tokens, por lo que el comportamiento mas alla de esa cifra no esta validado por el autor.
- Idiomas: no se declara ningun idioma soportado. No hay garantia de calidad fuera del idioma del corpus de entrenamiento, presumiblemente ingles, aunque esto no se afirma en la model card.
- Licencia: no disponible. Esto impide determinar si el uso comercial esta permitido. Ademas, la licencia del modelo base Qwen/Qwen3.6-35B-A3B debe verificarse por separado, ya que el adaptador no puede usarse sin el.
- Estado del artefacto: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia de septiembre de 2026. Es un artefacto de investigacion sin validacion externa.
- Naturaleza experimental: el modelo forma parte de una cadena de constituciones autogeneradas; el comportamiento puede derivar de forma no trivial respecto a la generacion anterior y no existe una evaluacion publica de seguridad o utilidad.
- Requisito de servidor: la model card exige el renderer `qwen3_5` y el modo de razonamiento activado. Servirlo con otro renderer o con el razonamiento desactivado puede degradar el comportamiento de forma no medida.
- Dependencia del base: cualquier cambio, retirada o actualizacion del modelo base Qwen/Qwen3.6-35B-A3B invalida este adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-anth-gen-postcot-g1-b3
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Constitucion de entrenamiento de esta generacion: `training_seed_constitution.md`, incluida en el repositorio del modelo
- Metadatos de exportacion desde Tinker: `tinker_meta.json`, incluido en el repositorio del modelo
- Ruta original en Tinker: `tinker://fa7f7913-57e2-55f3-9a91-4f76a2199477:train:0/sampler_weights/qwen36_anthg1_qwen36_anth_g1_b3_s2_cot_final`
- Programa de investigacion citado: welfare-in-ai-rnd / constitutional_training (no se ha encontrado un enlace publico en la busqueda web disponible)
- La busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo: los enlaces obtenidos corresponden a servicios de estadisticas de Counter-Strike (faceitperf.pro, faceit.com, faceitfinder.com) y no guardan relacion con el artefacto, por lo que se omiten.
