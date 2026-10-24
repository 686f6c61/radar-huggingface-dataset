# ceselder/glm-5.3-olens-lens

## Resumen

`ceselder/glm-5.3-olens-lens` no es un modelo generativo al uso, sino una familia de adaptadores LoRA de interpretabilidad (un *oracle lens*, abreviado «olens») montados sobre el modelo congelado `nvidia/GLM-5.3-NVFP4`, un MoE de 754.000 millones de parámetros con 78 bloques y expertos enrutados en NVFP4. Cada adaptador transforma una unica activacion residual del bloque 51 en una linea de texto con formato `* ...` que verbaliza que esta a punto de generar el modelo. Lo desarrolla el usuario `ceselder` dentro de la coleccion `glm5.3-olens`, junto al repositorio hermano del reconstructor texto-a-activacion, y es la version a escala frontera del lens previo sobre Qwen3.6-27B.

El entrenamiento combina una fase SFT de una pasada sobre 598.016 pares (activacion, continuacion) y una fase de RL con CISPO contra un reconstructor que puntua la fidelidad de la verbalizacion. La metrica interna de reconstruccion (FVE centrada con escala no negativa) y WorkspaceBench sirven de senal: la media de 24 familias pasa de 0,271 en el checkpoint SFT final a 0,459 en el paso 175 de RL, con un maximo juzgado de 0,478 en el paso 25.

Su relevancia es de investigacion: permite leer el «espacio de trabajo» de un MoE abierto de escala frontera con un coste de adaptador de 2,17 GB, sin reentrenar el base. El repositorio publica la trayectoria completa de SFT (checkpoints cada 25 pasos) y los checkpoints de RL con sus metricas, lo que lo convierte en material reproducible para estudiar verbalizacion de activaciones, no en un asistente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer MoE con 78 bloques y expertos enrutados en NVFP4; el adaptador mapea la activacion residual del bloque 51 a texto |
| Parametros totales | Adaptador: 2,17 GB en bf16 (LoRA guardado desde fp32); modelo base: 754.000 millones de parametros |
| Parametros activos | no disponible (el numero de parametros activos del MoE base no se indica en la informacion proporcionada) |
| Longitud de contexto | no disponible para el adaptador; el modelo base GLM-5.3 declara 1.000.000 de tokens |
| Tipos de cuantizacion | no disponible; el base usa NVFP4 en los expertos enrutados |
| Idiomas soportados | no disponible |
| Licencia | `nvidia-open-model-license` (etiquetada como `license: other` en el repo) |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json` por carpeta); libreria PEFT |
| Modelo base | `nvidia/GLM-5.3-NVFP4` |
| Tamano del repositorio | 49,9 GB (incluye toda la trayectoria de checkpoints) |
| Punto de extraccion | Activacion residual del bloque 51, una unica linea de salida |
| Fecha de publicacion | 23 de octubre de 2026 (actualizado el 24 de octubre de 2026) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un modelo base congelado: no se modifica ningun peso de GLM-5.3-NVFP4. La entrada es un vector de activacion residual del bloque 51 (de los 78 del base) y la salida es una sola linea de texto que describe la continuacion inminente del modelo. La familia es la misma que la del lens sobre Qwen3.6-27B (`ceselder/olens-qwen3.6-27b-l42`), portada a un MoE abierto de escala frontera.

El entrenamiento tiene dos fases. Primero, SFT de una pasada sobre 598.016 filas de pares (activacion, continuacion), con tasa de aprendizaje decreciente desde 2,63e-05 en el paso 25 hasta 1,50e-06 al final y una perdida de entropia cruzada en validacion que baja de 2,962 a 2,483 entre el paso 25 y el 292. Despues, RL con CISPO contra `ceselder/glm-5.3-olens-reconstructor`, un modelo texto-a-activacion, con una recompensa puramente de reconstruccion: la FVE centrada por rollout en la escala optima no negativa, es decir `clamp(cos(AR(bullet), h51 - mu), 0)^2`, promediada sobre las 2.048 rollouts de cada paso. Se publican dos brazos con tasas de 1e-5 (`rl1b_2`) y 3e-6 (`rl1b_3`), con checkpoints cada 25 pasos y `metrics.json` por checkpoint; todos los `rl1b_*_step_0000/` son byte-identicos al SFT final (`sft_one_bullet_step0292/`, mismo sha256 de LFS).

## Capacidades

- Verbalizacion de activaciones: convierte una activacion del bloque 51 en una frase que anticipa el contenido que el modelo base va a generar.
- Entrenamiento con recompensa de reconstruccion: la salida textual puede reproyectarse a espacio de activaciones mediante el reconstructor hermano y medirse con FVE.
- Trazabilidad de checkpoints: se publican 12 checkpoints de SFT y checkpoints de RL cada 25 pasos, con metricas de entrenamiento y evaluacion por carpeta.
- Evaluacion estandarizada: resultados en WorkspaceBench sobre 24 familias, con desglose en subconjunto sin erratas y subconjunto solo de workspace, y tasa de alucinacion por checkpoint.
- Compatibilidad PEFT: los adaptadores se cargan con la libreria `peft` sobre el base, sin fusionar pesos.
- Capacidad multilingue, tool calling, agentes, vision y audio: no disponibles; el adaptador no anade ninguna de estas funciones, y el base GLM-5.3 es text-only segun las fuentes publicas.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: leer el estado residual del bloque 51 de un MoE de 754B para estudiar planificacion latente y teoria del espacio de trabajo global, con un coste de 2,17 GB de adaptador en lugar de reentrenar el base.
- Monitorizacion de seguridad en produccion: ejecutar el lens en paralelo al modelo y marcar turnos en los que la verbalizacion anticipe contenido que el modelo luego rechaza o evita, como senal de discrepancia entre intencion y salida.
- Depuracion de agentes de codigo de horizonte largo: el base GLM-5.3 esta orientado a tareas de codigo y agentes; el lens permite inspeccionar que fichero, funcion o paso del plan esta a punto de abordar el modelo antes de emitir la accion.
- Auditoria de pipelines de RL y post-entrenamiento: comparar la trayectoria SFT frente a los brazos de RL para verificar si el post-entrenamiento cambia la representacion de la intencion sin cambiar la conducta observable.
- Investigacion comparativa entre escalas: al existir un lens equivalente sobre Qwen3.6-27B, se pueden contrastar verbalizaciones y curvas de FVE entre un modelo de 27B y un MoE de 754B con la misma metodologia.
- Curacion de datos de verbalizacion: usar el lens como anotador de pares (activacion, descripcion) para construir datasets de entrenamiento de reconstructores o de sondas lineales.
- Deteccion de alucinacion en dominios factuales: la tasa de alucinacion medida (0,433 en el checkpoint SFT final) permite calibrar umbrales de confianza sobre la verbalizacion antes de usarla como guardrail.

## Benchmarks y rendimiento

Resultados publicados en la model card. WorkspaceBench se reporta como media de 24 familias con intervalo de confianza al 95%, con desglose en el subconjunto sin erratas y el de solo workspace.

| Checkpoint | Fase | WorkspaceBench mean_24 [IC 95%] | Sin erratas | Solo workspace | Tasa de alucinacion |
|---|---|---|---|---|---|
| `sft_one_bullet_step0292` | SFT final / warm start de RL | 0,271 [0,256; 0,287] | 0,296 | 0,183 | 0,433 |
| `rl1b_rl1b_2_step_0000` | Paso 0 de RL (identico al SFT final) | 0,271 [0,256; 0,287] | 0,296 | 0,183 | 0,433 |
| Paso 25 del brazo `rl1b_2` (lr 1e-5) | RL | 0,478 (mejor juzgado hasta la fecha) | no disponible | no disponible | no disponible |
| Paso 175 de RL | RL | 0,459 | no disponible | no disponible | no disponible |

Evolucion del SFT (perdida de entropia cruzada en validacion y filas vistas):

| Checkpoint | Filas vistas | LR en el paso | CE en validacion |
|---|---|---|---|
| `sft_one_bullet_step0025` | 51.200 | 2,63e-05 | 2,962 |
| `sft_one_bullet_step0075` | 153.600 | 1,90e-05 | 2,586 |
| `sft_one_bullet_step0125` | 256.000 | 1,50e-05 | 2,530 |
| `sft_one_bullet_step0200` | 409.600 | 8,93e-06 | 2,498 |
| `sft_one_bullet_step0250` | 512.000 | 4,89e-06 | 2,485 |
| `sft_one_bullet_step0292` | 598.016 | 1,50e-06 | 2,483 |

Recompensa de reconstruccion en RL (FVE centrada, media de 2.048 rollouts por paso): 0,245 (ccos 0,47) en el paso 25 del brazo `rl1b_2`. La referencia del propio modelo base con su continuacion de 16 tokens, puntuada por el mismo reconstructor, se representa como linea discontinua en la figura `figures/rl_fve_curve.png`; el valor numerico no se recoge en la informacion proporcionada. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad generativa para este adaptador.

## Requisitos de hardware

- VRAM del adaptador: 2,17 GB en bf16 por checkpoint; el repositorio completo ocupa 49,9 GB en disco.
- VRAM del base: el modelo congelado tiene 754.000 millones de parametros con expertos enrutados en NVFP4. Estimacion a partir del recuento de parametros: en torno a 377 GB solo en pesos a 4 bits, mas capas no cuantizadas, overhead de runtime y cache KV para contexto largo; en la practica exige agregado multi-GPU.
- GPU recomendadas: no documentadas en la informacion disponible. Por el perfil del base, el escenario realista es un nodo multi-GPU de clase H100/H200 o B200; no cabe en ninguna GPU de consumo.
- GPU de consumo: no viable para el conjunto base + adaptador. Solo el adaptador (2,17 GB) cabe en una RTX 4090 o similar, pero no es util sin el base.
- Opciones de despliegue: carga mediante la libreria `peft` sobre el modelo base. El runtime debe soportar NVFP4 en los expertos enrutados; no se documentan integraciones concretas con vLLM, SGLang, llama.cpp, Ollama o TGI, y llama.cpp/Ollama no soportan NVFP4 segun la informacion disponible.
- Latencia y throughput: no disponibles. El lens anade una pasada por el adaptador y una decodificacion de una linea por cada activacion extraida del bloque 51.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Rendimiento reportado | Disponibilidad |
|---|---|---|---|---|---|---|
| `ceselder/glm-5.3-olens-lens` (este) | Lens LoRA sobre MoE de 754B | Adaptador 2,17 GB; base 754B | Base: 1M tokens | NVIDIA Open Model License | WorkspaceBench mean_24 0,271 (SFT) a 0,478 (mejor checkpoint RL) | HuggingFace, repo de 49,9 GB |
| `ceselder/olens-qwen3.6-27b-l42` | Lens LoRA sobre denso de 27B, capa 42 | no disponible en la informacion | no disponible | no disponible | no disponible | HuggingFace |
| `nvidia/GLM-5.3-NVFP4` | Modelo base MoE generativo | 754B | 1M tokens | NVIDIA Open Model License | No evaluado con WorkspaceBench | HuggingFace |
| `ceselder/glm-5.3-olens-reconstructor` | Reconstructor texto-a-activacion (complementario, no alternativo) | no disponible | no disponible | no disponible | Se usa como reward model del lens | HuggingFace |

El lens de Qwen3.6-27B es la referencia metodologica directa (misma familia, menor escala); el reconstructor no compite con el lens, lo complementa en el bucle de RL. GLM-5.3 en su version original de Z.ai se distribuye bajo licencia MIT segun las fuentes publicas, mientras que la conversion NVFP4 de NVIDIA usa la NVIDIA Open Model License, lo que cambia las condiciones de uso comercial.

## Limitaciones y advertencias

- Tasa de alucinacion alta: 0,433 en el checkpoint SFT final; la verbalizacion puede describir contenido que el modelo no genera.
- Brecha entre subconjuntos: 0,296 en el conjunto sin erratas frente a 0,183 en el de solo workspace, lo que indica peor rendimiento en los casos donde la tarea no tiene senal superficial explotable.
- Una sola linea de salida y un solo punto de extraccion (bloque 51): no ofrece una traza completa del razonamiento ni cubre otras capas.
- Requiere acceso a las activaciones internas del base: no funciona como API de texto a texto; hay que instrumentar el forward del modelo.
- No es un modelo de chat ni un asistente: no debe usarse como generador de respuestas, clasificador de produccion ni sustituto del base.
- Idiomas soportados: no disponibles. La evaluacion se reporta en WorkspaceBench, sin desglose linguistico.
- Seleccion de checkpoint: el mejor resultado juzgado (0,478) esta en el paso 25, no en el ultimo; usar el checkpoint final (paso 175, 0,459) no es optimo segun los datos publicados.
- Licencia: NVIDIA Open Model License, no MIT. Hay que revisar las condiciones de redistribucion y uso comercial del base y del adaptador antes de desplegar.
- Valoraciones con juez automatico: WorkspaceBench se puntua con Sonnet-5 y 4 muestras unidas por celda, sin seleccion de checkpoint sobre la curva; el intervalo de confianza al 95% se reporta solo para el checkpoint SFT.
- Repositorio de 49,9 GB por la publicacion de todos los checkpoints; conviene descargar solo la carpeta necesaria.
- Cero descargas y cero likes en el momento de la consulta: sin validacion independiente por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ceselder/glm-5.3-olens-lens
- Reconstructor texto-a-activacion: https://huggingface.co/ceselder/glm-5.3-olens-reconstructor
- Lens previo sobre Qwen3.6-27B: https://huggingface.co/ceselder/olens-qwen3.6-27b-l42
- Coleccion `glm5.3-olens`: https://huggingface.co/collections/ceselder/glm53-olens-6adaf9d544d3645a7fb96eb9
- Modelo base en HuggingFace: https://huggingface.co/nvidia/GLM-5.3-NVFP4
- Pagina de GLM-5.3 en openlm.ai: https://openlm.ai/glm-5.3/
- Cobertura del lanzamiento de GLM-5.3 en Unite.AI: https://www.unite.ai/z-ai-launches-glm-5-3-with-frontier-coding-and-a-cyber-capability-that-outgrew-its-training/
- Ficha de GLM 5.3 en VeniceStats: https://venicestats.com/venice-models/z-ai-glm-5-3
- Licencia NVIDIA Open Model License: https://huggingface.co/nvidia/GLM-5.3-NVFP4
