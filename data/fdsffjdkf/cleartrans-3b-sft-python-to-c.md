# fdsffjdkf/ClearTrans-3B-SFT-Python-to-C

## Resumen

ClearTrans-3B-SFT-Python-to-C es un checkpoint de ajuste fino supervisado (SFT) sobre Qwen2.5-Coder-3B, especializado en una unica direccion de traduccion de codigo: de Python a C. Lo publica el usuario fdsffjdkf como parte del artefacto ClearTrans, cuyo codigo de implementacion y replicacion esta en un repositorio de GitHub. El modelo no es un traductor general de lenguajes: es un especialista de direccion fija, entrenado para tomar codigo Python y emitir su equivalente en C.

La relevancia de este checkpoint es acotada pero clara para investigacion en traduccion automatica de codigo: ofrece un punto de partida reproducible (semilla 42, hiperparametros documentados, 8 GPUs, 3 epocas) sobre una base compacta de 3.086 millones de parametros. El autor advierte explicitamente de que se trata de un release de pesos, no de una reproduccion numerica completa de los experimentos de un articulo, y de que no se ha validado la inferencia en GPU ni la reproduccion de benchmarks para esta entrega concreta.

Arquitectura transformer decoder-only heredada de Qwen2.5-Coder-3B, con licencia Qwen Research (no comercial). No se dispone de datos publicados sobre longitud de contexto efectiva tras el ajuste, idiomas soportados ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino supervisado completo |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-Coder-3B; no confirmada tras el ajuste) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License Agreement (qwen-research), solo investigacion y evaluacion no comercial |
| Formato de pesos | safetensors (repo de 6,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-3B, un transformer decoder-only de la familia Qwen2, y se somete a un ajuste fino supervisado completo (full SFT, no LoRA) segun los metadatos de entrenamiento exportados con el checkpoint. La configuracion registrada incluye learning rate 1e-5, scheduler coseno, optimizador adamw_torch_fused con betas (0,9; 0,999) y epsilon 1e-8, batch total de 64 (batch 1 x 8 dispositivos x 8 pasos de acumulacion), 3 epocas, semilla 42 y entorno multi-GPU con 8 dispositivos. El entrenamiento se realizo con Transformers 4.57.1 y PyTorch 2.9.1, y el export incluye tokenizer y plantilla de chat.

El dataset identificado en la tarjeta original es `train_full_1231_python2c_idx3`, especifico de la direccion Python a C. El autor no incluye los ejemplos de entrenamiento en el repositorio y advierte de que el nombre del dataset no verifica por si mismo su procedencia ni el procedimiento de reconstruccion. No se documentan tecnicas adicionales como RLHF, DPO, GRPO (el autor aclara que este checkpoint no es un modelo final entrenado con GRPO), decodificacion especulativa ni atencion lineal. Tampoco se especifica el volumen de tokens de entrenamiento ni la composicion del corpus.

## Capacidades

- Generacion de texto y codigo con plantilla de chat conversacional (pipeline text-generation).
- Traduccion de codigo Python a C como tarea principal y unica direccion entrenada.
- Generacion condicionada por prompt de tarea: el autor indica que la reproduccion requiere el prompt original y la configuracion de decodificacion del experimento correspondiente.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Migracion asistida de utilidades Python a C en proyectos de investigacion: el modelo recibe una funcion Python y devuelve una propuesta en C que el equipo revisa y compila; su utilidad esta en acelerar el borrador inicial, no en sustituir la revision.
- Estudio academico de traduccion automatica de codigo: sirve como linea base SFT de direccion fija para comparar con variantes GRPO u otros metodos sobre la misma base Qwen2.5-Coder-3B.
- Replicacion de experimentos del artefacto ClearTrans: el checkpoint y los hiperparametros documentados permiten reproducir el pipeline de entrenamiento descrito en el repositorio de GitHub.
- Generacion de ejemplos sinteticos de pares Python-C para aumentar datasets de traduccion: los pares generados deben filtrarse con tests y herramientas de analisis estatico antes de usarse como datos de entrenamiento.
- Prototipado de portabilidad de algoritmos a C en entornos embebidos: con revision manual obligatoria, el modelo puede proponer traducciones de funciones con logica aritmetica o de control sencilla.
- Evaluacion de robustez de modelos pequenos (3B) en tareas de traduccion de codigo: util para medir hasta que punto un modelo compacto mantiene la semantica al cambiar de lenguaje y de modelo de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se atribuye ninguna puntuacion de benchmark del manuscrito a este checkpoint y que la reproduccion de benchmarks no ha sido validada para este release.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 6,2 GB solo para pesos, mas memoria para activaciones y cache KV; en la practica, 8-12 GB en funcion de la longitud de contexto.
- Cuantizacion: no se publican versiones GGUF ni cuantizadas; habria que generarlas a partir de los safetensors.
- GPU recomendadas: una GPU con 16 GB o mas (RTX 4080, RTX 4090, A10, L4) para fp16 con contexto moderado; A100 o H100 no son necesarias para un modelo de 3B.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 y tarjetas con 12-16 GB o mas, dependiendo de la longitud de contexto y del backend.
- Opciones de despliegue: transformers (version compatible con 4.57.1), text-generation-inference (el repo esta etiquetado como endpoints_compatible); vLLM, llama.cpp y Ollama requeririan conversion o no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles; el autor no ha validado la inferencia en GPU para este release.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClearTrans-3B-SFT-Python-to-C | 3,09B | no disponible | Traduccion Python a C (SFT) | Qwen Research (no comercial) | Hugging Face, 0 descargas |
| Qwen2.5-Coder-3B (base) | 3,09B | no disponible en esta ficha | Codigo general, multilingue | Qwen Research / Apache-2.0 segun variante | Hugging Face, ampliamente usado |
| CodeLlama-7B | 6,74B | no disponible en esta ficha | Codigo general | Llama 2 Community | Hugging Face |
| StarCoder2-3B | 3,03B | no disponible en esta ficha | Codigo general | BigCode OpenRAIL-M | Hugging Face |

La comparacion directa con alternativas de traduccion Python-C especificas no esta disponible en la informacion proporcionada. Frente a los modelos generalistas, la unica ventaja documentada de ClearTrans es la especializacion de direccion; no hay datos de calidad que permitan afirmar que supere a la base en esa tarea.

## Limitaciones y advertencias

- El propio autor advierte de que las traducciones generadas pueden contener errores funcionales y code smells; es obligatorio validar con tests y herramientas de analisis antes de usar el codigo en produccion.
- No se ha validado la inferencia en GPU ni la reproduccion de benchmarks para este release; el checkpoint ha pasado solo comprobaciones de tamano de fichero, disposicion de tensores e indices de shards.
- El repositorio no incluye datos de entrenamiento, estados del optimizador ni salidas de evaluacion historicas; no es evidencia de reproduccion numerica completa.
- La licencia Qwen Research restringe el uso a investigacion y evaluacion no comercial; no se relicencia bajo MIT ni Apache-2.0, lo que limita su uso en productos comerciales.
- Es un especialista de direccion unica (Python a C); no se debe esperar un rendimiento equivalente en otras direcciones ni en traduccion general de lenguajes.
- No hay informacion sobre sesgos, idiomas soportados ni comportamiento fuera de la tarea de traduccion.
- Riesgo de alucinacion en APIs, cabeceras y construcciones de C no vistas durante el entrenamiento; el dataset de entrenamiento no es verificable a partir del repositorio.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta; no hay evidencia de uso comunitario ni de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fdsffjdkf/ClearTrans-3B-SFT-Python-to-C
- Repositorio de implementacion y replicacion: https://github.com/Xingzhehu/ClearTrans
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Licencia Qwen Research incluida en el repo: LICENSE (referenciada en la tarjeta del modelo)
- Aviso de atribucion y modificaciones: NOTICE (referenciado en la tarjeta del modelo)
