# jiajinda/so101-04-smolvla-red-block-to-target-v234

## Resumen

SmolVLA fine-tuned sobre el brazo robótico SO-101 para la tarea concreta de coger un bloque rojo y colocarlo sobre una diana marcada con una X. Lo desarrolla el usuario jiajinda partiendo de `lerobot/smolvla_base`, el modelo visión-lenguaje-acción (VLA) compacto de Hugging Face, y se distribuye como política de control entrenada con LeRobot. No es un modelo de lenguaje general: es una política de imitación (behavior cloning) que mapea observaciones visuales y el estado del robot a secuencias de acciones motoras.

El modelo tiene 450.046.176 parámetros totales, de los cuales solo 99,9 millones son entrenables (el experto de acción y las proyecciones); el resto, el codificador visual SigLIP y el modelo de texto SmolVLM2-500M, permanece congelado durante el ajuste. Se entrenó sobre 50 demostraciones (26.508 fotogramas) procedentes de tres datasets propios, con 10.000 actualizaciones del optimizador a batch 16, lo que equivale a 6,04 épocas.

Su relevancia es acotada y práctica: demuestra el flujo completo de fine-tuning de SmolVLA sobre hardware asequible (un solo A100 de 40 GB, 32,6 minutos de entrenamiento) y sirve como referencia reproducible de una política robótica de bajo coste. El autor advierte explícitamente de que el modelo no se ha evaluado en hardware real y de que no existe partición de validación, por lo que no debe interpretarse como un sistema validado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLA con flow matching; VLM SmolVLM2-500M-Video-Instruct + experto de acción) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE); 99,9 M entrenables en el fine-tune |
| Longitud de contexto | no disponible (ventana de observación por chunk de 50 acciones) |
| Tipos de cuantización | no disponible (pesos en bfloat16 para backbone y experto, float32 para proyecciones y time MLPs) |
| Idiomas soportados | no disponible (modelo robótico; instrucción de tarea en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

SmolVLA combina un modelo visión-lenguaje (SmolVLM2-500M-Video-Instruct, con codificador SigLIP y un transformer de texto de 16 capas) con un experto de acción de 98,2 M de parámetros que genera trayectorias mediante flow matching. En este fine-tune se congelan el codificador visual, el conector, el modelo de texto y la cabeza LM; solo se entrenan el experto de acción y las proyecciones de estado y acción (`state_proj`, `action_in_proj`, `action_out_proj`, `action_time_mlp_in/out`). La política usa `chunk_size=50`, `n_action_steps=50` y 10 pasos de denoising en inferencia, con imágenes redimensionadas con padding a 512×512.

Los datos de entrenamiento son 50 episodios de tres datasets de LeRobot v3.0 (v2: 10 episodios, 5.991 fotogramas; v3: 20 episodios, 9.824 fotogramas; v4: 20 episodios, 10.693 fotogramas), grabados a 30 fps con el brazo `so_follower` y dos cámaras RGB de 480×640 (frontal cenital y de pinza). Se fusionaron con `merge_datasets` y se unificó la cadena de tarea a "Pick up the red block and place it on the X-marked target.". El entrenamiento usó AdamW con lr 1e-4, betas (0,9; 0,95), weight decay 1e-10, recorte de norma de gradiente 10, warmup lineal de 333 actualizaciones y decaimiento coseno hasta 2,5e-6 en la actualización 10.000, sin aumento de datos, precisión float32 y semilla 0. La pérdida de flow matching bajó de 0,32 (actualizaciones 1-500) a 0,050 (8.000-10.000).

## Capacidades

- Control motor por imitación: genera chunks de 50 acciones a partir de observaciones visuales (cámara frontal y de pinza) y del estado del brazo.
- Ejecución de una tarea concreta de manipulación: coger un bloque rojo y depositarlo sobre una diana marcada con una X.
- Condicionamiento por instrucción de tarea en lenguaje natural (cadena de tarea fija en inglés).
- Percepción visual multi-cámara: procesa dos flujos RGB de 480×640 redimensionados a 512×512.
- Inferencia con flow matching en 10 pasos de denoising por chunk.
- No soporta tool calling, function calling, agentes multi-paso ni generación de texto libre: es una política robótica, no un LLM de propósito general.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Reproducción de experimentos de behavior cloning: sirve como punto de partida documentado (configuración exacta, métricas y checkpoints cada 2.000 actualizaciones) para replicar un pipeline de fine-tuning de SmolVLA con LeRobot 0.7.0.
- Manipulación pick-and-place en laboratorio: el modelo ejecuta la secuencia de coger el bloque rojo y soltarlo sobre la diana, adecuado para pruebas controladas con el brazo SO-101 en un entorno fijo.
- Base para fine-tuning con datos propios: al estar entrenado sobre 50 demostraciones y liberarse bajo Apache 2.0, puede reajustarse con nuevas demostraciones para variantes de la misma tarea (otras posiciones, colores u objetos).
- Evaluación comparativa de políticas VLA: el autor publica un modelo compañero con π0.5 (OpenPI) sobre datos parcialmente solapados, lo que permite comparar arquitecturas en condiciones similares (aunque no idénticas).
- Docencia y prototipado en robótica de bajo coste: el entrenamiento completo cabe en una sola A100 de 40 GB en 32,6 minutos, lo que lo hace viable en cursos y talleres.
- Referencia de despliegue con LeRobot: los checkpoints incluyen los ficheros de procesador con las estadísticas de normalización (MEAN_STD), lo que facilita cargar la política en el stack de LeRobot para pruebas en simulación o hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo no se ha evaluado en hardware y que, al usar los 50 episodios para entrenamiento, no existe partición de validación; la única comprobación offline realizada verifica que los checkpoints cargan y producen acciones bien formadas. Los datos de entrenamiento disponibles son:

| Métrica | Valor |
|---|---|
| Pérdida de flow matching (actualizaciones 1-500) | 0,32 |
| Pérdida (500-2.000) | 0,19 |
| Pérdida (2.000-4.000) | 0,11 |
| Pérdida (4.000-6.000) | 0,075 |
| Pérdida (6.000-8.000) | 0,056 |
| Pérdida (8.000-10.000) | 0,050 |
| Tiempo por actualización (A100-SXM4-40GB) | 0,186 s (86 muestras/s) |
| Memoria pico durante entrenamiento | 4,6 GB |
| Tiempo total de entrenamiento | 32,6 min (36,1 min con arranque y guardado) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el entrenamiento ocupó 4,6 GB pico en una A100 de 40 GB, por lo que la inferencia debería caber holgadamente en GPU consumer de 8-12 GB, aunque no hay medición publicada.
- GPU recomendadas: A100-SXM4-40GB validada para entrenamiento; para inferencia se espera que baste una RTX 3090, RTX 4090 o similar, sin datos confirmados.
- Cabe en GPU consumer: probablemente sí (el modelo base SmolVLA se describe como desplegable en hardware de consumo), pero no hay verificación específica para este checkpoint.
- Opciones de despliegue: LeRobot (librería oficial, versión 0.7.0 usada en el entrenamiento); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a una política robótica.
- Latencia y throughput: no disponibles para inferencia; en entrenamiento, 0,186 s por actualización con batch 16 en A100.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101-04-smolvla-red-block-to-target-v234 (este) | 450,0 M (99,9 M entrenables) | no disponible | sin evaluación en hardware; pérdida final 0,050 | apache-2.0 | Hugging Face (0 descargas) |
| jiajinda/so101-03-pi05-red-block-to-target-v234 (π0.5, OpenPI) | no disponible | no disponible | no disponible; entrenado con 40 de los 50 episodios y inicializado desde un fine-tune previo | no disponible | Hugging Face |
| JulianRHuggingFace/so101_smolvla_model | no disponible (SmolVLA) | no disponible | no disponible | no disponible | Hugging Face |

La comparación con el modelo compañero de π0.5 no es equitativa: usa 40 episodios (10 reservados) y parte de un fine-tune anterior sobre v2, según advierte el propio autor.

## Limitaciones y advertencias

- No evaluado en hardware real: no hay evidencia de éxito de la tarea fuera de la comprobación offline de carga y formato de acciones.
- Sin partición de validación: los 50 episodios se usaron para entrenamiento, por lo que no puede medirse generalización ni sobreajuste.
- Tarea única y altamente específica: solo se entrenó para coger un bloque rojo y colocarlo en una diana marcada; no generaliza a otras tareas sin reajuste.
- Dependencia del entorno: sensible a la configuración de cámaras, iluminación y posiciones vistas en los datos; no hay datos sobre robustez ante cambios.
- Riesgo de sobreajuste a las demostraciones y de fallos silenciosos en producción; requiere validación propia antes de cualquier uso real.
- Idiomas: no disponible; la instrucción de tarea está en inglés y no se documenta soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y los datasets de origen deben verificarse por separado.
- Sin cuantizaciones publicadas ni datos de latencia en inferencia, lo que dificulta planificar despliegues en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jiajinda/so101-04-smolvla-red-block-to-target-v234
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Modelo compañero (π0.5, OpenPI): https://huggingface.co/jiajinda/so101-03-pi05-red-block-to-target-v234
- Dataset v2: https://huggingface.co/datasets/jiajinda/red-block-to-target-v2
- Dataset v3: https://huggingface.co/datasets/jiajinda/red-block-to-target-v3
- Dataset v4: https://huggingface.co/datasets/jiajinda/red-block-to-target-v4
- Modelo SmolVLA comparable de otro autor: https://huggingface.co/JulianRHuggingFace/so101_smolvla_model
- Documentación de LeRobot: https://huggingface.co/docs/lerobot
