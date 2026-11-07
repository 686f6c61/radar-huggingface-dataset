# RobotisSW/GR00T-N1.7-SH5-Task000905-50k-Hand_Intern-R2

## Resumen

GR00T-N1.7-SH5-Task000905-50k-Hand_Intern-R2 es un checkpoint de ajuste fino (fine-tuning) del modelo fundacional vision-language-action (VLA) NVIDIA Isaac GR00T N1.7-3B, publicado por el usuario RobotisSW en Hugging Face. El modelo esta especializado en una unica tarea de manipulacion con el robot SH5: coger una compresa sanitaria blanca de una caja con la mano derecha y mantenerla agarrada. Se trata, por tanto, de una politica robotica de proposito muy concreto y no de un modelo de lenguaje generalista.

El checkpoint corresponde al paso 50.000 de un entrenamiento programado para 200.000 actualizaciones con schedule coseno. La model card indica explicitamente que el entrenamiento esta en curso y que los pesos del checkpoint **no estan disponibles todavia**; el repositorio se publica como artefacto de reanudacion (resume) y trazabilidad, no como modelo listo para inferencia. El dataset de entrenamiento es muy reducido: 51 episodios grabados a 30 Hz, de los cuales 46 son de entrenamiento y 5 se reservan para validacion.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo real de adaptacion de GR00T N1.7 a hardware con sensores táctiles mediante un codificador `finger_mlp` que transforma 90 lecturas de presion en un latente de 32 dimensiones para la cabeza de accion. Por otro, ilustra las practicas de publicacion de checkpoints intermedios en robotica (manifiesto de artefactos, sumas SHA256, contratos de normalizacion) y las limitaciones de un ajuste fino con solo 46 episodios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de NVIDIA Isaac GR00T N1.7; backbone VLM congelado mas cabezas de accion y proyectors entrenables, con adaptador táctil `finger_mlp` |
| Parametros totales | 3B (heredados del modelo base nvidia/GR00T-N1.7-3B; el numero de parametros del adaptador táctil no se especifica) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el entrenamiento usa BF16/TF32; no se documentan formatos de cuantizacion para inferencia) |
| Idiomas soportados | no disponible (el modelo recibe instrucciones en lenguaje natural, pero no se detalla cobertura linguistica) |
| Licencia | NVIDIA Open Model License (etiquetada como `other` en el repositorio) |
| Formato de pesos | no disponible en la informacion proporcionada (el repositorio incluye `model/`, `processor/`, `statistics/`, mapeo de embodiment y estado de optimizador/scheduler; no se confirma safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de GR00T N1.7-3B, un VLA cross-embodiment de NVIDIA que recibe entradas multimodales (imagenes e instrucciones en lenguaje) y produce acciones motoras. En este ajuste fino, el backbone vision-lenguaje permanece **congelado** y solo se entrenan las cabezas de accion, los proyectors y el codificador táctil `finger_mlp`. La entrada del embodiment SH5 combina una unica camara de cabeza (`cam_left_head`), 54 posiciones articulares medidas y 90 valores táctiles crudos. La salida son 40 pasos de 54 posiciones articulares absolutas en radianes, ordenadas como brazo izquierdo (7), brazo derecho (7), mano izquierda (20) y mano derecha (20); cabeza, elevacion y base quedan excluidos de la salida.

El entrenamiento usa batch de 64, acumulacion de gradientes de 1, learning rate 2e-05, warmup de 1.000 pasos y precision BF16/TF32. El dataset consta de 51 episodios a 30 Hz (46 de entrenamiento y 5 reservados). El checkpoint del paso 50.000 forma parte de un schedule coseno de 200.000 actualizaciones. El repositorio conserva estado de optimizador, scheduler, RNG y paso del trainer para permitir reanudacion exacta mediante `train_r2.sh --resume`, y excluye videos crudos, demostraciones, credenciales, rutas de servidor, logs privados y el pickle de `TrainingArguments`. La inferencia offline requiere la implementacion personalizada de GR00T con soporte táctil SH5 (`Gr00tPolicy` con embodiment `new_embodiment` y `use_tactile=True`), no el GR00T vanilla sin adaptador táctil.

## Capacidades

- Manipulacion robotica de una unica tarea: coger una compresa sanitaria blanca de una caja con la mano derecha y mantenerla agarrada.
- Percepcion visual mediante una camara de cabeza (`cam_left_head`).
- Percepcion táctil: 90 lecturas crudas de presion codificadas en un latente de 32 dimensiones por el `finger_mlp`.
- Control de 54 articulaciones en dos brazos y dos manos, con salida de 40 pasos de posiciones absolutas en radianes.
- Condicionamiento por instruccion en lenguaje natural (capacidad heredada del backbone VLA, aunque la cobertura linguistica no se documenta).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Replicacion de la tarea de pick-and-hold: el checkpoint sirve como referencia para reproducir la politica de coger y sostener la compresa con la mano derecha del SH5, siempre que se disponga del dataset local y del launcher originales.
- Reanudacion de entrenamientos largos: el estado de optimizador, scheduler y RNG permite continuar el schedule coseno hasta 200.000 actualizaciones sin reiniciar, util en laboratorios con presupuesto de computo limitado.
- Investigacion en fusion viso-tactil: el par (90 lecturas crudas, latente de 32 dimensiones) permite estudiar como el adaptador táctil modifica la politica de agarre en comparacion con el GR00T vanilla.
- Transferencia a hardware con sensores de presion: sirve de plantilla para adaptar GR00T N1.7 a robots con dedos instrumentados, replicando el patron `finger_mlp` mas `use_tactile=True`.
- Validacion de contratos de datos: el `artifact_manifest.json` y las sumas SHA256 permiten auditar normalizacion, commit de origen y mapeo de embodiment en pipelines de robotica reproducibles.
- Benchmark interno de ajuste fino con pocos datos: con 46 episodios de entrenamiento, es un caso de estudio sobre sobreajuste y generalizacion en politicas VLA de baja cardinalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se emite ninguna afirmacion de exito o seguridad del robot ("No robot success/safety claim is made"), por lo que no existen metricas de tasa de exito, robustez o latencia verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El backbone es de 3B parametros, pero no se documentan requisitos de memoria ni cuantizaciones para inferencia.
- GPU recomendadas: no disponible. El entrenamiento usa BF16/TF32, lo que sugiere GPUs con soporte de tensor cores (por ejemplo, familia A100/H100), pero no se confirma.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card solo menciona inferencia offline mediante `Gr00tPolicy` con embodiment `new_embodiment` y `use_tactile=True`; no se citan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RobotisSW/GR00T-N1.7-SH5-Task000905-50k-Hand_Intern-R2 | 3B (base) | no disponible | Pick-and-hold de una compresa con mano derecha SH5 | NVIDIA Open Model License | Pesos no disponibles aun |
| Dongkkka/GR00T-N1.7-SH5-Task000650-Tactile | 3B (base) | no disponible | Politica SH5 con dos brazos, dos manos, tres camaras RGB y tactil | no disponible en la informacion | no disponible |
| nvidia/GR00T-N1.7-3B | 3B | no disponible | VLA cross-embodiment generalista | NVIDIA Open Model License | Publico en Hugging Face |

## Limitaciones y advertencias

- Los pesos del checkpoint no estan disponibles: la model card indica que el entrenamiento esta en curso y que las weights no se pueden descargar todavia.
- Dataset minimo: 46 episodios de entrenamiento y 5 de validacion, lo que limita severamente la generalizacion fuera de la tarea y del entorno grabados.
- Una sola camara (`cam_left_head`) y una sola tarea: no hay evidencia de robustez ante cambios de iluminacion, posicion de la caja u objetos distintos.
- Dependencia de implementacion personalizada: requiere la version de GR00T con adaptador táctil SH5; el GR00T vanilla no es compatible.
- Sin garantias de seguridad: la model card declara explicitamente que no se emite ninguna afirmacion de exito o seguridad del robot; no debe usarse en produccion sin validacion fisica.
- Licencia NVIDIA Open Model License: conviene revisar sus terminos antes de cualquier uso comercial o redistribucion.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; al ser una politica motora, el riesgo principal es la ejecucion de acciones incorrectas mas que la generacion de texto.
- Excluye videos crudos, demostraciones, credenciales, rutas de servidor y logs privados, lo que dificulta la auditoria completa del dataset.
- Idiomas soportados no documentados: no se puede confirmar la cobertura linguistica de las instrucciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RobotisSW/GR00T-N1.7-SH5-Task000905-50k-Hand_Intern-R2
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Repositorio GitHub de NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Modelo comparable con tactil SH5: https://huggingface.co/Dongkkka/GR00T-N1.7-SH5-Task000650-Tactile
