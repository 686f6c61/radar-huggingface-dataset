# robotcpp/bitvla-libero-goal-i2s

## Resumen

BitVLA LIBERO-Goal I2S es una distribucion cuantizada en formato GGUF del checkpoint BitVLA de `hongyuw`, concretamente la variante `ft-bitvla-bitsiglipL-224px-libero_goal-bf16` afinada para tareas de manipulacion robotica del benchmark LIBERO en su suite Goal. El modelo original es un modelo vision-lenguaje-accion (VLA) que combina un backbone de lenguaje con un codificador visual SigLIP-L a 224 px y un experto de accion que produce secuencias de acciones motoras. Esta publicacion no entrena un modelo nuevo: convierte el checkpoint BF16 a un formato propietario de Robot.cpp denominado `i2s-matrix-v1`, que empaqueta 366 matrices ternarias.

El interes practico esta en el despliegue: el checkpoint original en BF16 ocupa espacio y requiere un runtime especifico, mientras que esta version reduce las matrices criticas a representacion ternaria manteniendo el resto en BF16/F32, con un repositorio total de 1,4 GB y 59.059.207 parametros. Es relevante para quien quiera ejecutar inferencia VLA de manipulacion en hardware modesto usando Robot.cpp, aunque con la advertencia de que el formato no es compatible con llama.cpp estandar ni con la CLI convencional.

La ficha debe leerse con cautela: el autor no publica tasas de exito, equivalencia numerica ni latencias, y el modelo es una distribucion derivada de un unico checkpoint con licencia MIT. La informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es limitada; los apartados correspondientes lo indican explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Lenguaje-Accion (VLA) BitVLA: LLM + codificador visual SigLIP-L 224 px + proyeccion de propiocepcion + experto de accion |
| Parametros totales | 59.059.207 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | WeightQuant en BF16 con 366 matrices ternarias empaquetadas como `i2s-matrix-v1`; resto de tensores en BF16/F32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (cuatro componentes: LLM, vision, proprio, action) |

## Arquitectura y entrenamiento

El modelo sigue el diseno BitVLA: un backbone de lenguaje acoplado a un codificador visual SigLIP-L con entrada de 224x224 px, una proyeccion de estado propioceptivo (`state-proj`) y un experto de accion (`action-expert`) que genera un chunk de acciones de 8x7 valores desnormalizados. La variante LIBERO-Goal esta afinada sobre el checkpoint `ft-bitvla-bitsiglipL-224px-libero_goal-bf16`, con clave de normalizacion `libero_goal_no_noops`, y segun la model card corresponde a la version afinada sin preentrenamiento robotico adicional.

La innovacion tecnica de esta publicacion es la conversion: se aplica BitVLA WeightQuant en BF16 y despues se empaquetan 366 matrices como ternarias en el layout `i2s-matrix-v1`, manteniendo el resto de tensores en BF16/F32. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. Tampoco se detalla la innovacion de decodificacion o atencion del modelo original.

## Capacidades

- Percepcion visual robotica: procesa dos imagenes RGB de 224x224 en orden `full_image` y `wrist_image`.
- Fusion de vision, lenguaje y propiocepcion: acepta ocho valores de estado propioceptivo en crudo y una instruccion de tarea en lenguaje natural.
- Generacion de acciones: devuelve un chunk de acciones de 8x7 valores desnormalizados listo para postprocesado especifico del robot.
- Manipulacion dirigida por objetivos: afinado para la suite LIBERO-Goal, orientado a tareas de manipulacion con meta explicita.
- Ejecucion en runtime Robot.cpp con soporte BitVLA mediante parches sobre llama.cpp/ggml.
- No se documentan en la informacion disponible capacidades de tool calling, agentes multi-paso, thinking mode, audio ni soporte multilingue explicito.

## Casos de uso

- Investigacion en manipulacion robotica simulada: ejecutar el checkpoint en el entorno LIBERO-Goal para reproducir experimentos de VLA con un runtime ligero y un repositorio de 1,4 GB.
- Despliegue en estaciones de trabajo con GPU consumer: al reducir las matrices criticas a ternario, el modelo cabe en VRAM modesta y permite iterar sobre politicas de manipulacion sin clúster dedicado.
- Prototipado de pipelines vision-lenguaje-accion: usar el servidor `model-server` de Robot.cpp con los cuatro GGUF para integrar percepcion, estado y accion en un bucle de control.
- Evaluacion comparativa de cuantizacion: medir el impacto del empaquetado ternario `i2s-matrix-v1` frente al checkpoint BF16 original en tareas de LIBERO-Goal.
- Educacion y demos de robotica: montar una demo reproducible de manipulacion con dos camaras y estado propioceptivo en hardware asequible.
- Integracion en simuladores y gemelos digitales: consumir el chunk de acciones 8x7 desde un cliente que aplique el postprocesado especifico del robot y lo envie al simulador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no reclama una nueva tasa de exito, equivalencia numerica ni resultado de latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio completo pesa 1,4 GB, por lo que la huella de pesos es compatible con GPUs de 4-8 GB, aunque el runtime y los buffers de activacion anaden overhead no cuantificado.
- GPU recomendadas: no disponible en la informacion proporcionada; el autor solo indica `--threads 8` en el ejemplo de ejecucion.
- Cabe en GPU consumer: probable por tamano de pesos (1,4 GB en disco), pero no confirmado por el autor.
- Opciones de despliegue: exclusivamente Robot.cpp con soporte BitVLA (revision `cf0712c2751fdd8519de22f822b7baa1b08b5937` o posterior) y sus parches sobre llama.cpp/ggml. No es compatible con llama.cpp estandar, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| BitVLA LIBERO-Goal I2S (este) | 59.059.207 | no disponible | GGUF `i2s-matrix-v1` | MIT | Requiere Robot.cpp parcheado; 366 matrices ternarias |
| `hongyuw/ft-bitvla-bitsiglipL-224px-libero_goal-bf16` | no disponible | no disponible | BF16 (safetensors presumiblemente) | no disponible | Checkpoint fuente sin cuantizar |
| Otros VLA de LIBERO | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El formato `i2s-matrix-v1` es especifico de Robot.cpp: no funciona con llama.cpp estandar ni con CLIs convencionales; requiere el runtime parcheado.
- Los cuatro componentes GGUF deben provenir del mismo checkpoint; mezclarlos con otras revisiones invalida la inferencia.
- El preprocesado de imagenes (resize/crop) debe replicar el del checkpoint fuente; el runtime normaliza imagenes y estado, pero el postprocesado de acciones es responsabilidad del cliente.
- No se han publicado tasas de exito, equivalencia numerica frente a BF16 ni latencias; no hay garantia documentada de que la cuantizacion ternaria preserve el rendimiento del modelo original.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un modelo de accion, los errores se manifiestan como acciones fisicas incorrectas.
- Idiomas soportados no disponibles; las instrucciones de tarea se envian en lenguaje natural pero no se especifica cobertura linguistica.
- Licencia MIT permite uso comercial, pero el modelo base y el runtime Robot.cpp pueden tener condiciones adicionales no detalladas aqui.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/robotcpp/bitvla-libero-goal-i2s
- Checkpoint base: https://huggingface.co/hongyuw/ft-bitvla-bitsiglipL-224px-libero_goal-bf16/tree/134cf03c71ec6228a323ac9e07948d549ca48463
- Robot.cpp con soporte BitVLA: https://github.com/Robot-cpp/robot.cpp/tree/cf0712c2751fdd8519de22f822b7baa1b08b5937
- Documentacion LIBERO en LeRobot: https://huggingface.co/docs/lerobot/libero
- Referencia del benchmark LIBERO: https://www.emergentmind.com/topics/libero
