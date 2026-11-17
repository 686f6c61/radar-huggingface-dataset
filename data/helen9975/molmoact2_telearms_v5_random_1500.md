# helen9975/molmoact2_telearms_v5_random_1500

## Resumen

`helen9975/molmoact2_telearms_v5_random_1500` es un ajuste fino completo (full fine-tune) del modelo robótico multimodal `allenai/MolmoAct2-BimanualYAM` de Ai2, especializado en manipulación bimanual con los brazos YAM. Lo publica el usuario `helen9975` como checkpoint final del paso 120.000 de entrenamiento sobre el dataset `mliu48/telearms-yam-cube-v5-exp-random-1500`, compuesto por 15.000 demostraciones simuladas de 10 tareas distintas (1.500 por tarea), con 14.340.545 fotogramas a 30 Hz y tres cámaras de 224x224 píxeles.

El modelo resuelve el problema de la política visomotora para robots bimanuales: recibe observaciones visuales e instrucciones en lenguaje natural y emite acciones de control en el espacio articular (14 dimensiones: 6 articulaciones más pinza por brazo). Es relevante porque forma parte de una comparativa controlada con otras políticas de la misma familia (pi0.5 y StarVLA) entrenadas con idéntico presupuesto de muestras, lo que permite aislar el efecto de la arquitectura y del recetario de entrenamiento.

Con 5.447.439.088 parámetros (unos 5,4 mil millones), el modelo se distribuye en formato safetensors dentro de un repositorio de 21,8 GB, requiere `transformers` con código personalizado (`custom_code`) y no ha sido evaluado todavía en simulación según la model card. La licencia no está declarada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MolmoAct2 (modelo visión-lenguaje-acción, `molmoact2`); transformer multimodal con ViT, conector, LLM y action expert |
| Parametros totales | 5.447.439.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF declaradas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de tarea | image-text-to-text / robotics (política visomotora) |
| Modelo base | allenai/MolmoAct2-BimanualYAM |
| Dataset de entrenamiento | mliu48/telearms-yam-cube-v5-exp-random-1500 |
| Numero de pasos | 120.000 (checkpoint final) |
| Muestras vistas | 15.360.000 (15,36 M) |
| Hardware de entrenamiento | 8 x H100, batch 16/GPU (global 128) |
| Salida de acciones | chunks de 30 pasos, 14-D estado/acción (6 articulaciones + pinza por brazo) |
| Cámaras | camera_front, camera_left, camera_right (orden top, left, right de BimanualYAM) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/MolmoAct2-BimanualYAM`, una arquitectura MolmoAct2 que combina un codificador visual (ViT), un conector multimodal, un modelo de lenguaje y un módulo experto en acciones. El ajuste fino es completo: se actualizan LLM, ViT, conector, cabeza del LM y action expert, con secuencias desempaquetadas y longitud dinámica. El entrenamiento se realizó con el script `experiments/launch_scripts/train_lerobot.py` del repositorio `allenai/molmoact2` (commit upstream `6070080`) y los pesos se convirtieron con `olmo.hf_model.convert_molmoact2_to_hf`.

Los datos proceden de 15.000 demostraciones simuladas bimanuales YAM (10 tareas x 1.500 episodios), 14.340.545 fotogramas a 30 Hz, tres cámaras de 224x224 y sin domain randomization. Se usó la etiqueta de mezcla `telearms_yam_sim_v5` con control de pose articular absoluta, estado/acción de 14 dimensiones y chunks de 30 pasos; las estadísticas de normalización del dataset quedan en `norm_stats.json`. Las tasas de aprendizaje fueron 1,414e-5 para el LLM, 7,07e-6 para ViT y conector, y 7,07e-5 para el action expert, escalando la receta upstream de full fine-tune por sqrt(128/64). El presupuesto total (15,36 M muestras) coincide con el de las ejecuciones pi0.5 y StarVLA Random-1500, lo que permite una comparación controlada.

## Capacidades

- Generación de acciones robóticas bimanuales en espacio articular absoluto (14-D) a partir de observaciones visuales e instrucciones.
- Procesamiento multimodal de tres vistas de cámara simultáneas (front, left, right) a 224x224.
- Comprensión de instrucciones en lenguaje natural (image-text-to-text) heredada del modelo base MolmoAct2.
- Predicción de chunks de acción de 30 pasos, adecuada para control a 30 Hz.
- Manipulación de cubos y tareas de pick-and-place en simulación (10 tareas del dataset v5).
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo de razonamiento explícito.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Investigación en políticas visomotoras bimanuales: sirve como referencia de full fine-tune de MolmoAct2 para comparar contra pi0.5 y StarVLA bajo el mismo presupuesto de muestras.
- Manipulación de cubos en simulación: el modelo ejecuta tareas de pick-and-place con dos brazos YAM usando las tres cámaras y chunks de 30 pasos.
- Reproducción de experimentos de robótica: al publicarse el script de entrenamiento, la configuración de learning rates y el dataset, permite replicar o extender el ajuste.
- Base para nuevos ajustes finos: al ser un checkpoint completo de 5,4 B parámetros, puede servir de punto de partida para dominios o tareas adicionales.
- Evaluación de transferencia sim-to-real: aunque no hay domain randomization, el modelo es un candidato para estudiar la brecha entre simulación y robot físico.
- Benchmarking de arquitecturas VLA: útil para medir el coste y el rendimiento de un full fine-tune frente a métodos con adaptadores o congelación parcial.
- Docencia y prototipado en laboratorios con brazos YAM: proporciona una política entrenada lista para integrarse en pipelines de evaluación con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo aún no ha sido evaluado en simulación.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 11 GB solo para pesos (5,4 B parámetros), más memoria para activaciones, tres cámaras y el action expert; en la práctica se recomienda reservar 24 GB o más.
- GPU recomendadas: H100 o A100 para entrenamiento y evaluación a gran escala; el entrenamiento declarado usó 8 x H100 con batch 16 por GPU.
- GPU de consumo: una RTX 4090 (24 GB) podría alojar los pesos en BF16, aunque el margen para activaciones y procesamiento de tres cámaras es ajustado; no hay datos de cuantización publicados que permitan reducir requisitos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el modelo declara `custom_code`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al ser una política robótica estas herramientas no son directamente aplicables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| helen9975/molmoact2_telearms_v5_random_1500 | 5,4 B | no disponible | Full fine-tune MolmoAct2, 15,36 M muestras | no disponible | Hugging Face, 0 descargas |
| pi0.5 (Random-1500) | no disponible | no disponible | Mismo dataset y presupuesto de 15,36 M muestras | no disponible | no disponible en la información |
| StarVLA (Random-1500) | no disponible | no disponible | Mismo dataset y presupuesto de 15,36 M muestras | no disponible | no disponible en la información |
| allenai/MolmoAct2-BimanualYAM (base) | no disponible | no disponible | Modelo base de Ai2 | no disponible | Hugging Face |

La comparación con pi0.5 y StarVLA se menciona en la model card únicamente por compartir datos y presupuesto de entrenamiento; no se aportan métricas comparativas.

## Limitaciones y advertencias

- El modelo no ha sido evaluado en simulación según la propia model card; no hay evidencia publicada de su rendimiento.
- Entrenado sin domain randomization, lo que limita la robustez ante variaciones visuales o físicas no vistas.
- Especializado en un único dominio: cubos y tareas del dataset `telearms-yam-cube-v5-exp-random-1500` con brazos YAM; no es un modelo de propósito general.
- El control es de pose articular absoluta, por lo que requiere una configuración de robot compatible con el espacio de 14 dimensiones y el orden de cámaras especificado.
- Licencia no declarada: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas soportados no documentados; la comprensión de instrucciones en castellano no está garantizada.
- Riesgo de alucinación y de acciones inseguras fuera de distribución: al ser una política robótica, los fallos se traducen en movimientos físicos incorrectos.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni informes de terceros.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/helen9975/molmoact2_telearms_v5_random_1500
- Modelo base: https://huggingface.co/allenai/MolmoAct2-BimanualYAM
- Dataset de entrenamiento: https://huggingface.co/datasets/mliu48/telearms-yam-cube-v5-exp-random-1500
- Repositorio de entrenamiento (referenciado en la model card): `allenai/molmoact2`, script `experiments/launch_scripts/train_lerobot.py` (commit `6070080`)
