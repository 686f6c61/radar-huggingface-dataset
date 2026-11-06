# RoboColosseum/droid-put-marker-pen-g0.5

## Resumen

DROID-put-marker-pen-g0.5 es un modelo de visión-lenguaje-acción (VLA) para robótica de manipulación, publicado por RoboColosseum como parte de su familia de modelos fine-tuneados sobre el benchmark DROID con brazos Franka. En concreto, esta carpeta corresponde a la variante G0.5 (base `OpenGalaxea/G05`), entrenada sobre la tarea "mug on coaster" del dataset `aarontung/droid-mug-on-coaster` y sobre "close laptop" del dataset `aarontung/droid-close-laptop`, con un total de 10 épocas (5 iniciales más 5 adicionales documentadas en esta tarjeta).

El modelo resuelve el problema de mapear observaciones visuales (cámaras exterior izquierda, exterior derecha y de muñeca) e instrucciones en lenguaje natural a acciones de control de un brazo Franka de 7 grados de libertad más pinza, expresadas como posiciones articulares absolutas de 8 dimensiones. Es relevante porque forma parte de un esfuerzo comparativo reproducible entre cinco arquitecturas VLA (GR00T N1.7, π0.5, G0.5, MolmoAct2 y LingBot-VLA v2) bajo recetas de entrenamiento controladas, lo que permite evaluar el rendimiento relativo de cada familia en tareas de manipulación concreta.

La información pública disponible es escasa: la model card describe principalmente el proceso de entrenamiento y las recetas, pero no detalla la arquitectura interna de G0.5, el número de parámetros, la longitud de contexto ni los resultados de éxito en las tareas. El repositorio ocupa 11,9 GB y se distribuye en formato LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción); detalles internos de G0.5 no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en fp32 con cómputo bf16 durante entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors (inferencia final más ficheros de configuración) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base `OpenGalaxea/G05` (g05-base) y se ajusta de forma completa: backbone de visión, componente de lenguaje y cabeza de acción. Según la receta documentada, se entrenan todas las partes con un learning rate reducido para la torre de visión (×0.1), usando FSDP, precisión fp32 para los pesos maestros y bf16 para el cómputo. El tamaño global de batch es 16 (micro-batch 16 × acumulación 1) sobre una única GPU, con un pico de learning rate de 4e-5, schedule coseno, 200 pasos de warmup y weight decay de 0.03.

El entrenamiento se realizó en dos fases: primero 5 épocas (documentadas en el repositorio DROID-models, con 2× H100 PCIe) y después 5 épocas adicionales partiendo de esos pesos, con optimizador reiniciado y schedule de LR desde cero, sobre 1× H200. Para la tarea MugOnCoaster se ejecutaron aproximadamente 12.770 pasos (3h27m en la segunda fase) y para CloseLaptop unos 8.570 pasos (2h23m). La pérdida de entrenamiento (`fm_loss`) bajó de 0.0232 a 0.0149 en MugOnCoaster y de 0.0219 a 0.0149 en CloseLaptop al final de las 10 épocas. Las cámaras utilizadas son la exterior izquierda y la de muñeca; el estado y la acción son posiciones articulares absolutas de 8 dimensiones `[Franka arm 7, gripper 1]`.

## Capacidades

- Generación de acciones de manipulación robótica a partir de observaciones visuales e instrucciones en lenguaje natural.
- Control de un brazo Franka de 7 grados de libertad más pinza mediante posiciones articulares absolutas de 8 dimensiones.
- Procesamiento de múltiples cámaras (exterior izquierda, exterior derecha y de muñeca, a 360×640).
- Ejecución de dos tareas concretas: colocar una taza sobre un posavasos ("mug on coaster") y cerrar un portátil ("close laptop").
- Entrenamiento e inferencia dentro del ecosistema LeRobot v3.0 a 30 fps.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes ni multilingüismo general.

## Casos de uso

- Investigación en manipulación robótica con Franka: el modelo sirve como referencia reproducible para comparar la familia G0.5 frente a otras arquitecturas VLA bajo una receta idéntica, útil en estudios de benchmarking.
- Evaluación comparativa de arquitecturas VLA: al compartir datasets, instrucciones y esquema de estado/acción con GR00T N1.7, π0.5, MolmoAct2 y LingBot-VLA v2, permite aislar el efecto de la arquitectura en el éxito de la tarea.
- Automatización de tareas de pick-and-place sencillas: la tarea "mug on coaster" es representativa de colocación de objetos sobre un destino fijo, aplicable en entornos de laboratorio controlados.
- Automatización de tareas de cierre de dispositivos: la tarea "close laptop" ejemplifica manipulación de objetos articulados, útil como base para tareas similares (cerrar cajas, puertas de armario).
- Reentrenamiento y fine-tuning sobre nuevos datasets DROID: la receta documentada (LR, batch, FSDP, precisión) permite replicar el ajuste sobre otras tareas de manipulación con Franka.
- Docencia y prototipado en robótica de imitación: el formato LeRobot y los ficheros de configuración incluidos facilitan cargar el modelo en pipelines de investigación sin infraestructura propietaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la pérdida de entrenamiento no es una medida del éxito en la tarea y que las evaluaciones de éxito corresponden al benchmark RoboColosseum, cuyos resultados no se incluyen en esta tarjeta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 11,9 GB en disco con pesos en fp32 y cómputo bf16, por lo que se requiere una GPU con al menos esa capacidad para cargar los pesos completos.
- GPU recomendadas: el entrenamiento se realizó en 1× H200 (fase de 5 épocas adicionales) y en 2× H100 PCIe (fase inicial de 5 épocas).
- ¿Cabe en GPU de consumo? No confirmado; el tamaño de los pesos (11,9 GB) sugiere que podría cargarse en GPUs de consumo con 16 GB o más de VRAM, pero no hay datos oficiales de inferencia.
- Opciones de despliegue: LeRobot (librería declarada en el repositorio); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son el marco habitual para modelos VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tamaño de carpeta | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| G0.5 (este modelo) | `OpenGalaxea/G05` | 11,9 GB | MugOnCoaster, CloseLaptop | other | Hugging Face (RoboColosseum) |
| GR00T N1.7 | `nvidia/GR00T-N1.7-3B` | 12,6 GB | MugOnCoaster, CloseLaptop | other | Hugging Face (RoboColosseum) |
| π0.5 | `gs://openpi-assets/checkpoints/pi05_base` | 12,4 GB | MugOnCoaster, CloseLaptop | other | Hugging Face (RoboColosseum) |
| MolmoAct2 | `allenai/MolmoAct2` | 21,8 GB | MugOnCoaster, CloseLaptop | other | Hugging Face (RoboColosseum) |
| LingBot-VLA v2 6B | `robbyant/lingbot-vla-v2-6b` | 12,8 GB | MugOnCoaster, CloseLaptop | other | Hugging Face (RoboColosseum) |

No se dispone de datos de parámetros, contexto ni rendimiento de éxito para una comparación cuantitativa más detallada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para dos tareas concretas ("mug on coaster" y "close laptop") sobre un brazo Franka; no es un modelo generalista y no se espera que generalice a otras instrucciones o morfologías sin reentrenamiento.
- La licencia es "other": no se especifican los términos exactos de uso comercial en la información disponible, por lo que debe consultarse el repositorio antes de cualquier despliegue productivo.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre datasets de manipulación acotados, cualquier sesgo estaría ligado a las condiciones de captura de esos datos (iluminación, posiciones, objetos).
- Riesgo de alucinación: no aplica en el sentido textual habitual, pero sí existe riesgo de generar acciones incorrectas o inseguras fuera de la distribución de entrenamiento.
- La pérdida de entrenamiento no es un indicador de éxito en la tarea; la model card lo advierte explícitamente.
- No hay información sobre idiomas soportados ni sobre robustez ante instrucciones en castellano u otros idiomas.
- El repositorio mezcla varias arquitecturas en subcarpetas; debe seleccionarse la carpeta `g05/` correspondiente a la tarea deseada para evitar cargar pesos incorrectos.
- Los pesos de GR00T se almacenan en fp32 (3 shards), lo que aumenta los requisitos de memoria frente a otras variantes; para G0.5 no se detalla el número de shards.

## Enlaces

- [Hugging Face: RoboColosseum/droid-put-marker-pen-g0.5](https://huggingface.co/RoboColosseum/droid-put-marker-pen-g0.5)
- [Repositorio DROID-models (5 épocas)](https://huggingface.co/RoboColosseum/DROID-models)
- [Repositorio BimanualYAM-models (referencia de learning rates)](https://huggingface.co/RoboColosseum/BimanualYAM-models)
- [Checkpoint base OpenGalaxea/G05](https://huggingface.co/OpenGalaxea/G05)
- [Dataset aarontung/droid-mug-on-coaster](https://huggingface.co/datasets/aarontung/droid-mug-on-coaster)
- [Dataset aarontung/droid-close-laptop](https://huggingface.co/datasets/aarontung/droid-close-laptop)
- Proyecto W&B: `shaileshxml-nus/RoboColosseum`
