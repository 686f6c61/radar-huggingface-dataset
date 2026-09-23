# research-vla/RIFT-RoboCOIN

## Resumen

RIFT-RoboCOIN es un checkpoint de investigación publicado en Hugging Face por el usuario `research-vla`. Se trata de un modelo entrenado para control robótico bimanual sobre tres tareas del conjunto de datos RoboCOIN, con la configuración de robot Galaxea R1 Lite: brazos izquierdo y derecho de 6 grados de libertad cada uno, dos pinzas con recorrido de 0 a 100 milímetros y tres cámaras (`head_rgb`, `left_wrist_rgb`, `right_wrist_rgb`). El perfil de entradas (imágenes, estados de brazo y pinza) y la naturaleza de los conjuntos de datos son los propios de una política visión-lenguaje-acción (VLA), aunque la model card no declara explícitamente esa categoría.

El modelo se distribuye en dos variantes, `fused_z1_10ep` y `separate_z1_10ep`, que solo difieren en cómo se agrupan las dos rutas de entrenamiento durante el batching. La variante fusionada introduce los tokens preparados de ambas rutas en una única llamada `MoT` y no modifica ningún módulo ni parámetro, de modo que ambos checkpoints comparten las mismas claves y formas de `state_dict` y cargan en el mismo código de inferencia sin ramas condicionales. El entrenamiento se realizó durante diez épocas en dos nodos de cuatro tarjetas H100 de 94 GB con DeepSpeed ZeRO-1 en bf16.

La relevancia del artefacto es fundamentalmente metodológica: documenta con detalle la configuración de entrenamiento (batch global de 256, 9.340 pasos de optimizador, 342 episodios y 238.864 ventanas), incluye la configuración resuelta y las estadísticas de normalización, y permite medir el efecto del batching fusionado sobre el coste por paso (9,21 h frente a 9,86 h para diez épocas). En el momento de redactar esta ficha no tiene descargas ni valoraciones, no declara licencia y no publica resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card menciona llamadas `MoT` y el flag `model.fuse_training_paths`, sin describir la arquitectura interna) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el entrenamiento documentado usa bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (solo pesos, guardados con `optimizer=None`), acompañados de `config.yaml` y `dataset_stats.json` por variante |
| Tamaño del repositorio | 24,1 GB (incluye las dos variantes) |
| Variantes publicadas | `fused_z1_10ep` (`model.fuse_training_paths = true`) y `separate_z1_10ep` (`false`) |
| Campos de observación | brazo izquierdo (6), pinza izquierda, brazo derecho (6), pinza derecha, pinzas en recorrido de 0 a 100 mm |
| Cámaras | `head_rgb`, `left_wrist_rgb`, `right_wrist_rgb` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo: no se indican número de parámetros, número de capas, tipo de atención ni estrategia de decodificación. El único elemento arquitectónico mencionado es la llamada `MoT`, que agrupa en una sola invocación los tokens preparados de las dos rutas de entrenamiento cuando `model.fuse_training_paths` está activado. La model card insiste en que esa fusión no altera ningún módulo ni parámetro, por lo que ambas variantes son intercambiables en el mismo código de inferencia. El flag `model.train_probe_head` sí modifica el conjunto de parámetros y su valor por defecto es `true`.

Los datos de entrenamiento son tres conjuntos de RoboCOIN con una instrucción cada uno: `RoboCOIN/Galaxea_R1_Lite_classify_object_four` (191 episodios), `RoboCOIN/Galaxea_R1_Lite_mix_red_yellow_large_test_tube` (50) y `RoboCOIN/R1_Lite_stack_baskets` (101), lo que suma 342 episodios y 238.864 ventanas. El entrenamiento leyó la vista compatible con Galaxea (brazos, pinzas y las tres cámaras con alias) y se ejecutó durante diez épocas en dos nodos de cuatro H100 de 94 GB bajo DeepSpeed ZeRO-1, precisión bf16, batch de 16 por rank con dos pasos de acumulación, batch global de 256 y 9.340 pasos de optimizador. No se documenta ningún uso de RLHF, DPO ni ajuste por preferencias.

La diferencia de coste entre variantes es el dato técnico central del artefacto: 3,550 s por paso de optimizador y 9,21 h para diez épocas en la variante fusionada, frente a 3,800 s y 9,86 h en la separada. Eso equivale, de forma derivada, a unas 72,1 ventanas por segundo en la variante fusionada y 67,4 en la separada (batch global dividido entre el tiempo por paso). Los 238.864 ventanas divididas entre un batch global de 256 dan 933 pasos por época, coherentes con los 9.340 pasos declarados para diez épocas.

## Capacidades

- Ejecución de tres tareas de manipulación bimanual con el robot Galaxea R1 Lite: clasificación y manipulación de objetos, mezcla de tubos de ensayo rojos y amarillos, y apilado de cestas.
- Procesamiento de observaciones multimodales con tres vistas de cámara simultáneas (`head_rgb`, `left_wrist_rgb`, `right_wrist_rgb`).
- Condicionamiento por instrucción en lenguaje natural: cada conjunto de datos aporta una instrucción por tarea.
- Control coordinado de dos brazos de 6 grados de libertad y dos pinzas con recorrido de 0 a 100 milímetros.
- Intercambio directo de checkpoints entre las dos variantes sin ramas de código, gracias a que comparten claves y formas de `state_dict`.
- Capacidad de tool calling o function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (*thinking*), visión general, audio u otras modalidades: no disponible.
- Nota: la model card describe los campos de entrada y los datos de entrenamiento, pero no especifica de forma explícita el formato de salida del modelo, por lo que el tipo exacto de predicción (por ejemplo, secuencias de acción o *chunks*) no puede confirmarse con la información disponible.

## Casos de uso

- Manipulación de objetos en laboratorio controlado: el modelo está entrenado específicamente sobre `Galaxea_R1_Lite_classify_object_four` (191 episodios), por lo que puede desplegarse en una célula con un R1 Lite para recoger, clasificar y recolocar objetos a partir de las tres cámaras y una instrucción textual.
- Manipulación precisa de tubos de ensayo: la tarea `mix_red_yellow_large_test_tube` implica agarre fino con pinzas configuradas en el recorrido de 0 a 100 mm, un escenario típico de automatización de laboratorio químico o biológico donde la repetibilidad importa más que la generalidad.
- Apilado y ordenación de cestas: `R1_Lite_stack_baskets` (101 episodios) es una tarea de manipulación de objetos voluminosos que sirve como banco de pruebas para logística interna o alimentación de líneas de montaje.
- Estudio comparativo de estrategias de batching en entrenamiento distribuido: las dos variantes permiten medir de forma aislada el efecto de fusionar rutas en una sola llamada `MoT` sobre el tiempo por paso (3,550 s frente a 3,800 s) sin cambiar el modelo resultante.
- Reproducción de experimentos de entrenamiento: el repositorio incluye `config.yaml` resuelto y `dataset_stats.json`, lo que permite reconstruir el preprocesado, la normalización y la configuración de DeepSpeed ZeRO-1 en bf16 para replicar las diez épocas.
- Ajuste fino sobre nuevos conjuntos RoboCOIN: al mantener las estadísticas de normalización y la nomenclatura de campos, el checkpoint sirve como inicialización para tareas adicionales que compartan la vista compatible con Galaxea.
- Auditoría de preprocesado en producción: `dataset_stats.json` documenta las estadísticas de normalización, de modo que un equipo puede verificar que el escalado de estados y unidades coincide antes de conectar el modelo a un robot real.
- Validación de pipelines de inferencia multimodales: al compartir claves de `state_dict` entre variantes, cualquiera de los dos checkpoints sirve para probar código de carga y ejecución sin ramas condicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de tasa de éxito, error de posición, MMLU, HumanEval, GSM8K ni ninguna otra evaluación comparativa. Los únicos datos de rendimiento documentados son de entrenamiento y se recogen en la tabla siguiente.

| Métrica | `fused_z1_10ep` | `separate_z1_10ep` |
|---|---:|---:|
| `model.fuse_training_paths` | `true` | `false` |
| Segundos por paso de optimizador | 3,550 | 3,800 |
| Duración de diez épocas | 9,21 h | 9,86 h |
| Throughput derivado (ventanas/s) | ~72,1 | ~67,4 |

## Requisitos de hardware

- Entrenamiento documentado: dos nodos con cuatro H100 de 94 GB cada uno (ocho GPU en total), DeepSpeed ZeRO-1, bf16, batch de 16 por rank y dos pasos de acumulación hasta un batch global de 256.
- VRAM para inferencia: no disponible. La model card no publica el número de parámetros ni el consumo en inferencia, por lo que cualquier cifra sería especulativa.
- Estimación indirecta: el repositorio completo pesa 24,1 GB e incluye dos variantes con sus pesos, lo que sitúa cada checkpoint en torno a la mitad de ese tamaño, sin que pueda deducirse de ahí el número de parámetros con fiabilidad.
- GPU recomendadas: no disponible. Se desconoce si el modelo cabe en GPU de consumo (RTX 4090, RTX 5090 u otras); el único hardware confirmado para entrenamiento son H100 de 94 GB.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni ningún servidor estándar. El formato `.pt` de solo pesos más un `config.yaml` propio y un `dataset_stats.json` implica código de inferencia a medida.
- Latencia y throughput en inferencia: no disponible. El throughput de entrenamiento derivado (72,1 ventanas/s en la variante fusionada) no es extrapolable a inferencia.

## Comparativa con modelos similares

No hay datos comparativos disponibles. La model card no incluye ninguna comparación con otros modelos, la búsqueda web no ha devuelto papers, repositorios ni publicaciones relacionadas con RIFT o RoboCOIN, y no se han publicado métricas de la tarea que permitan situar el modelo frente a alternativas de la misma categoría (políticas de manipulación bimanual o modelos visión-lenguaje-acción). Cualquier comparación de parámetros, contexto, rendimiento o licencia sería especulativa.

| Criterio | RIFT-RoboCOIN | Alternativas |
|---|---|---|
| Parámetros | no disponible | no disponible |
| Longitud de contexto | no disponible | no disponible |
| Rendimiento en tarea | no disponible | no disponible |
| Licencia | no disponible | no disponible |
| Disponibilidad | dos variantes en Hugging Face, con 0 descargas y 0 valoraciones | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no puede confirmarse que el uso comercial esté permitido ni bajo qué condiciones.
- Idiomas soportados no declarados: se desconoce el idioma o idiomas de las instrucciones que el modelo puede procesar.
- Sin resultados de benchmarks: no existe evidencia publicada de tasa de éxito ni de generalización más allá de las tres tareas de entrenamiento.
- Riesgo de sobreajuste al dominio: el entrenamiento se apoya en 342 episodios y tres conjuntos concretos de un único tipo de robot (Galaxea R1 Lite). El comportamiento fuera de esas tareas, cámaras u hogares de agarre no está documentado.
- Dependencia estricta del preprocesado: la propia model card advierte de que la inferencia necesita `dataset_stats.json` y un preprocesado de campos y unidades que coincida exactamente. Un desajuste en el escalado o las unidades produce salidas inválidas sin aviso.
- Trampa silenciosa en la carga de checkpoints: un checkpoint guardado con `model.train_probe_head = false` carga mediante `strict=False` sin emitir advertencia, dejando la cabeza de sondeo (`probe`) inicializada aleatoriamente. Es un fallo silencioso que puede invalidar resultados sin señales visibles.
- Riesgo de alucinación trasladado a acciones físicas: en un modelo que produce comandos de robot, un error de predicción no se queda en el texto, sino que se convierte en movimiento real de brazos y pinzas. Es obligatorio interponer límites de par, paradas de emergencia y validación de trayectorias antes de cualquier prueba con hardware.
- Ausencia de validación comunitaria: 0 descargas y 0 valoraciones en el momento de redactar esta ficha, sin paper ni documentación externa asociada.
- Documentación incompleta en aspectos clave: no se especifican la arquitectura interna, el número de parámetros, el formato de salida, las opciones de cuantización ni el consumo de VRAM en inferencia.
- Uso previsto de investigación: el artefacto se publica como checkpoint de experimento, con foco en la reproducibilidad del entrenamiento, no como producto listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/research-vla/RIFT-RoboCOIN
- Papers, blogs, repositorios o demos adicionales: no disponible. La búsqueda web no devolvió resultados relacionados con RIFT, RoboCOIN o `research-vla`; únicamente aparecieron portales genéricos de investigación (ResearchGate, Wikipedia, Google Scholar) sin relación con el modelo.
