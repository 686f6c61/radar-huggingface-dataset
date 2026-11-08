# robotcpp/bitvla-libero-long-i2s

## Resumen

BitVLA LIBERO-Long I2S es una conversión a formato GGUF del checkpoint BitVLA `hongyuw/ft-bitvla-bitsiglipL-224px-libero_long-bf16`, publicada por el usuario `robotcpp` para su uso con el runtime Robot.cpp. BitVLA es una familia de modelos Vision-Language-Action (VLA) de 1 bit orientada a manipulación robótica, que combina un codificador visual SigLIP-L de 224 px con un modelo de lenguaje y un experto de acciones. El objetivo de esta conversión es empaquetar los pesos en un formato cuantizado propietario (`i2s-matrix-v1`) que reduce el coste de almacenamiento e inferencia en entornos de robótica embebida.

El modelo cuenta con 59.059.207 parámetros totales y un repositorio de 1,4 GB repartido en cuatro componentes GGUF: LLM, visión, propriocepción y experto de acciones. La conversión aplica WeightQuant de BitVLA en BF16 y empaqueta 366 matrices ternarias, manteniendo el resto de tensores en BF16/F32. Está especializado en el benchmark LIBERO-Long, con la clave de normalización `libero_10_no_noops`, y no incluye el preentrenamiento robótico general del que parten otras variantes.

Su relevancia es doble: por un lado, demuestra la viabilidad de ejecutar modelos VLA cuantizados a 1 bit en runtimes de inferencia ligeros; por otro, advierte de que el formato I2S es específico de Robot.cpp y requiere un runtime parcheado, por lo que no es un GGUF estándar consumible por llama.cpp. La licencia MIT facilita su integración en proyectos de investigación y prototipos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con codificador visual SigLIP-L 224px, LLM y experto de acciones; cuantización ternaria (1 bit) en 366 matrices |
| Parametros totales | 59.059.207 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `i2s-matrix-v1` (matrices ternarias empaquetadas), BF16 y F32 para el resto de tensores |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (cuatro componentes: LLM, visión, propriocepción, acción) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un modelo VLA de tipo BitVLA, que acopla un codificador visual SigLIP-L a resolución 224×224 con un modelo de lenguaje y un experto de acciones dedicado. La conversión a GGUF no altera la topología, sino que aplica WeightQuant en BF16 y empaqueta 366 matrices como `i2s-matrix-v1`, un layout ternario específico de Robot.cpp. El resto de tensores conserva precisión BF16 o F32. El checkpoint de origen es la variante fine-tuned sobre LIBERO-Long sin preentrenamiento robótico previo, con clave de normalización `libero_10_no_noops`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal más allá del propio esquema de cuantización ternaria. La model card indica explícitamente que no se reclaman nuevos resultados de tasa de éxito, equivalencia numérica ni latencia.

## Capacidades

- Generación de acciones robóticas: devuelve un chunk de acciones desnormalizado de 8×7 a partir de dos imágenes RGB 224×224 (vista frontal y de muñeca), ocho valores de propriocepción y una instrucción de tarea.
- Percepción visual multimodal: procesa pares de imágenes `full_image` y `wrist_image` en formato HWC RGB uint8.
- Fusión de estado proprioceptivo: integra ocho valores crudos de propriocepción mediante un proyector de estado dedicado.
- Ejecución de instrucciones en lenguaje natural: acepta una instrucción de tarea no vacía como condicionamiento.
- Manipulación robótica en el benchmark LIBERO-Long: especializado en tareas de manipulación de horizonte largo.
- Inferencia cuantizada a 1 bit: pensado para despliegue con bajo coste de memoria gracias al empaquetado ternario.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento explícito ni modo thinking.

## Casos de uso

- Evaluación de políticas VLA en simulación LIBERO-Long: el modelo se integra en el runtime Robot.cpp y recibe observaciones del simulador para generar chunks de acción, lo que permite reproducir experimentos del checkpoint original con menor huella de memoria.
- Prototipado de manipulación con brazo robótico de dos cámaras: la configuración `full_image` + `wrist_image` encaja con montajes típicos de robot de sobremesa, y el chunk de 8×7 simplifica el control de bajo nivel.
- Investigación en cuantización extrema: sirve como banco de pruebas para estudiar el impacto de matrices ternarias en tareas de control, comparando contra el checkpoint BF16 de origen.
- Despliegue en hardware embebido con recursos limitados: el tamaño de 1,4 GB y la cuantización ternaria permiten ejecutar el modelo en plataformas con poca memoria, siempre que se compile el runtime Robot.cpp parcheado.
- Integración en pipelines de evaluación automatizada: el servidor `model-server` expone una API local en el puerto 5555, lo que facilita conectar el modelo a harnesses de evaluación propios.
- Docencia y divulgación sobre VLA: el formato de cuatro componentes separados (LLM, visión, propriocepción, acción) ayuda a explicar la anatomía de un modelo VLA en cursos y talleres.
- Base para fine-tuning específico de tarea: al ser un checkpoint LIBERO-Long sin preentrenamiento robótico general, puede servir como punto de partida para ajustes en dominios concretos, aunque no se documenta el procedimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama una nueva tasa de éxito, equivalencia numérica ni resultado de latencia para esta conversión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 1,4 GB, por lo que el peso de los cuatro GGUF es reducido, pero el consumo real depende del runtime y de los buffers intermedios.
- GPU recomendadas: no disponibles. El modelo está pensado para el runtime Robot.cpp, no para GPUs de datacenter específicas.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del repositorio, aunque no hay cifras oficiales de VRAM ni de compatibilidad verificada con tarjetas concretas.
- Opciones de despliegue: exclusivamente el binario `model-server` de Robot.cpp con soporte BitVLA (revisión `cf0712c2751fdd8519de22f822b7baa1b08b5937` o posterior compatible), aplicando sus parches sobre llama.cpp. No es compatible con llama.cpp estándar, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| BitVLA LIBERO-Long I2S (este) | 59.059.207 | no disponible | Ternaria `i2s-matrix-v1` + BF16/F32 | MIT | GGUF para Robot.cpp |
| `hongyuw/ft-bitvla-bitsiglipL-224px-libero_long-bf16` (origen) | no disponible | no disponible | BF16 | no disponible | safetensors |
| BitVLA (familia general) | no disponible | no disponible | 1 bit | no disponible | no disponible |

La comparativa se limita al checkpoint de origen, ya que no se dispone de datos verificables de otras alternativas VLA comparables en la información proporcionada.

## Limitaciones y advertencias

- El formato `i2s-matrix-v1` es específico de Robot.cpp: los GGUF no son consumibles por llama.cpp estándar ni por otras herramientas GGUF convencionales.
- Requiere compilar el runtime Robot.cpp con sus parches sobre llama.cpp en una revisión concreta o posterior compatible; no hay binarios oficiales documentados.
- Los cuatro componentes (LLM, visión, propriocepción y acción) deben provenir del mismo checkpoint; mezclarlos con otros produce resultados inválidos.
- El modelo está especializado en LIBERO-Long y no incluye preentrenamiento robótico general, lo que limita su generalización fuera de ese benchmark.
- El preprocesado de imágenes (redimensionado y recorte) debe replicar el del checkpoint de origen; el runtime normaliza imágenes y estado, pero el postprocesado de acciones específico del robot queda en manos del cliente.
- No se han publicado métricas de tasa de éxito, equivalencia numérica ni latencia para esta conversión, por lo que no hay garantía de que el comportamiento coincida con el checkpoint BF16.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al tratarse de un modelo de control robótico, los errores se manifiestan como acciones incorrectas más que como texto inventado.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del checkpoint de origen y de las dependencias del runtime.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/robotcpp/bitvla-libero-long-i2s
- Checkpoint de origen: https://huggingface.co/hongyuw/ft-bitvla-bitsiglipL-224px-libero_long-bf16/tree/d93ee990a5ecb87078118a0d4e9b7d051d4ef568
- Runtime Robot.cpp con soporte BitVLA: https://github.com/Robot-cpp/robot.cpp/tree/cf0712c2751fdd8519de22f822b7baa1b08b5937
- Benchmark LIBERO (referencia): https://www.emergentmind.com/topics/libero
- Artículo sobre BitVLA (referencia): https://www.researchgate.net/publication/392530140_BitVLA_1-bit_Vision-Language-Action_Models_for_Robotics_Manipulation
