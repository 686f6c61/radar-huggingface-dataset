# dddddsds31341/Long-WAM-Sorting-Dolls-20k-Step-5000

## Resumen

Long-WAM Sorting Dolls 20k Step 5000 es un checkpoint de inferencia derivado por fine-tuning del modelo Efficient-Large-Model/Long-WAM-YAM, orientado a control robótico de manipulacion. Lo publica el usuario dddddsds31341 en Hugging Face y su proposito concreto es ejecutar la tarea de ordenar cinco munecas rusas (matryoshkas) en fila, de menor a mayor, de izquierda a derecha. La relevancia de este checkpoint es acotada: se trata de un artefacto de evaluacion de una unica tarea, no de un modelo generalista, y su interes practico esta en reproducir el pipeline de inferencia de la familia Long-WAM y en servir de referencia para experimentos de imitacion visomotora con horizonte largo.

El modelo parte de la arquitectura Long-WAM (World Action Model) del laboratorio Efficient-Large-Model, que combina un VAE Wan2.2, un codificador de texto UMT5 y un modulo de politica que predice secuencias de acciones. Este checkpoint concreto se entrena sobre el dataset sorting-dolls-lerobot, con 100 demostraciones y 168.126 fotogramas, en cuatro GPU A100 durante 5.000 pasos de optimizador. La salida es un vector de 14 dimensiones de consignas absolutas de articulacion y pinza (6 articulaciones mas pinza por cada brazo), con normalizacion z-score especifica de la tarea.

La ficha debe leerse con cautela: el autor no declara tasa de exito ni rendimiento en validacion, el repositorio pesa 12 GB y la licencia es "other" heredada del modelo base. Es, por tanto, un checkpoint de investigacion reproducible, adecuado para laboratorios con robot de doble brazo y camaras top_head, hand_left y hand_right, pero no un modelo listo para produccion ni para uso comercial sin revisar la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Long-WAM (World Action Model): VAE Wan2.2 + codificador de texto UMT5 + politica de acciones; no disponible el detalle de capas y dimensiones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | P48 de historial (48 pasos de observacion) y chunk de accion de 32 pasos; no disponible la longitud de contexto en tokens de texto |
| Tipos de cuantizacion | no disponible; pesos en torch_dtype BF16 (segun model.pt) |
| Idiomas soportados | no disponible; las instrucciones de tarea estan en ingles |
| Licencia | other (heredada de Efficient-Large-Model/Long-WAM-YAM) |
| Formato de pesos | PyTorch (model.pt con claves mot, proprio_encoder, step y torch_dtype); assets separados en config.yaml y dataset_stats.json |

## Arquitectura y entrenamiento

El modelo sigue la familia Long-WAM, un enfoque de "world action model" que acopla un VAE de video (Wan2.2) con un codificador de texto (UMT5) y una cabeza de politica que produce acciones. La entrada combina imagenes de tres camaras (top_head, hand_left, hand_right) procesadas a 384 x 320, un historial P48 y la instruccion textual de la tarea; la salida es un chunk de 32 pasos de acciones de 14 dimensiones con normalizacion z-score por tarea y sin recorte de valores normalizados. El checkpoint no incluye estado de optimizador, scheduler ni RNG: es exclusivamente un artefacto de evaluacion.

El entrenamiento se inicializa desde Efficient-Large-Model/Long-WAM-YAM y se afina sobre el dataset dddddsds31341/sorting-dolls-lerobot en su revision ffca92aece12b85daac426b1b0474065e1ecf165, con 100 demostraciones y 168.126 fotogramas. Se usaron cuatro GPU A100, batch de 12 por GPU con acumulacion 1 (batch global 48), learning rate constante de 1e-5, AdamW con weight decay 0.01, semilla 42 y precision BF16 con ZeRO-1. La instruccion de tarea es "Arrange the five Russian dolls upright in a row from smallest to largest, from left to right". No se documenta RLHF, DPO ni fases de alineamiento adicionales; el paradigma es imitacion supervisada sobre demostraciones.

## Capacidades

- Control robótico de manipulacion de doble brazo: genera consignas absolutas de 6 articulaciones mas pinza por brazo (14 dimensiones en total), en unidades originales de pinza.
- Ejecucion de una tarea especifica de ordenacion: colocar cinco munecas rusas en fila, de menor a mayor, de izquierda a derecha.
- Prediccion de chunks de accion de 32 pasos con historial de 48 pasos (P48), lo que permite politicas con horizonte temporal relativamente largo.
- Fusion multimodal de tres camaras (top_head, hand_left, hand_right) con resolucion procesada de 384 x 320.
- Condicionamiento por instruccion en lenguaje natural a traves del codificador UMT5, aunque el entrenamiento se limita a una unica instruccion de tarea.
- Normalizacion z-score especifica del run, con estadisticas incluidas en dataset_stats.json para reproducir la desnormalizacion en inferencia.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Reproduccion de experimentos de imitacion visomotora: el checkpoint permite cargar el run exacto con longwam.inference.load_run_config y load_model (expected_step=5000) y comparar resultados frente a otros pasos de entrenamiento del mismo pipeline, lo que resulta util para estudiar curvas de aprendizaje en politica robotica.
- Benchmark interno de manipulacion con munecas rusas: un laboratorio con robot de doble brazo y las tres camaras especificadas puede evaluar la politica en un entorno controlado y medir tasa de exito propia, ya que el autor no la declara.
- Base para fine-tuning en tareas de ordenacion similares: al estar inicializado desde Long-WAM-YAM y entrenado sobre 100 demostraciones, sirve como punto de partida para tareas de pick-and-place con criterios de orden (por tamano, color o categoria).
- Estudio de representaciones de world models: al integrar un VAE de video Wan2.2, el modelo permite analizar como las representaciones latentes de video condicionan la generacion de acciones en tareas de horizonte largo.
- Validacion de pipelines de evaluacion SIP: el repositorio incluye requirements-sip.txt y el codigo long-wam-sip-sorting-eval-20261105-v47, lo que facilita montar un entorno de evaluacion reproducible con versiones de paquetes fijadas.
- Docencia y divulgacion en robotica de imitacion: el caso concreto y bien delimitado (cinco munecas, una instruccion, tres camaras) lo hace adecuado para demostraciones practicas de aprendizaje por imitacion con modelos generativos de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se reclama tasa de exito del robot ni rendimiento en conjuntos reservados ("No robot success rate or held-out performance is claimed").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio pesa 12 GB, lo que da una cota inferior orientativa para cargar los pesos; a ello hay que sumar el VAE Wan2.2 y el codificador UMT5, que se distribuyen por separado y no se cuantifican en la model card.
- GPU recomendadas: el entrenamiento se realizo en cuatro A100; para inferencia se recomienda al menos una A100 o H100 por la carga simultanea de VAE, text encoder y politica. No hay datos publicados de ejecucion en GPU de consumo.
- GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras GPU consumer, dado que los assets auxiliares (Wan2.2 VAE, UMT5) no estan dimensionados en la documentacion.
- Opciones de despliegue: el autor proporciona un checkout propio de Long-WAM dentro de code.zip, con las funciones longwam.inference.load_run_config y load_model. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo de politica robotica.
- Latencia y throughput: no disponibles. La inferencia requiere adaptar rutas de modelo, estadisticas y cache SIP a la maquina de evaluacion, y los assets de Wan2.2 VAE, UMT5 y tokenizer deben obtenerse por separado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM Sorting Dolls 20k Step 5000 (este) | no disponible | P48 historial, chunk de 32 acciones | Ordenar cinco munecas rusas en fila | other | Hugging Face, 19 descargas |
| Long-WAM-Nesting-Doll-Unclipped-30k-Step-5000 | no disponible | no disponible en la informacion | Encajar munecas rusas unas dentro de otras | other | Hugging Face |
| pi05-sorting_dolls_50-20k | no disponible | no disponible en la informacion | Ordenar munecas rusas (checkpoint paso 20000, JAX/Orbax) | no disponible | Hugging Face |

Los tres modelos pertenecen al mismo autor y al mismo dominio de manipulacion con munecas rusas, pero difieren en la tarea exacta (ordenar en fila frente a encajar), en el framework (PyTorch frente a JAX/Orbax) y en el paso de entrenamiento. No se dispone de datos de rendimiento comparables entre ellos.

## Limitaciones y advertencias

- No se declara tasa de exito ni evaluacion en conjuntos reservados; el checkpoint es de evaluacion y no de produccion.
- El modelo esta entrenado para una unica instruccion y una unica tarea; no generaliza a otras ordenaciones ni a otros objetos sin fine-tuning adicional.
- Requiere assets externos no incluidos: VAE Wan2.2, codificador UMT5 y tokenizer, que deben obtenerse por separado y no estan dimensionados en la model card.
- El checkpoint no contiene estado completo de reanudacion de entrenamiento (sin optimizador, scheduler ni RNG), por lo que no sirve para continuar el entrenamiento tal cual.
- La licencia es "other" y se hereda de Efficient-Large-Model/Long-WAM-YAM; es imprescindible revisar los terminos del modelo base antes de cualquier uso comercial.
- Riesgo de sobreajuste a las condiciones de captura del dataset (iluminacion, disposicion de camaras, fondo y tipo de munecas); no se documenta robustez ante variaciones.
- No hay informacion sobre sesgos, comportamiento multilingue ni calidad de las instrucciones en idiomas distintos del ingles.
- El repositorio excluye datasets, checkpoints, entornos, caches, logs y secretos; la reproducibilidad depende de reconstruir manualmente las rutas SIP en la maquina de evaluacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Sorting-Dolls-20k-Step-5000
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Checkpoint relacionado (encajar munecas): https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Unclipped-30k-Step-5000
- Checkpoint relacionado (pi05, JAX/Orbax): https://huggingface.co/dddddsds31341/pi05-sorting_dolls_50-20k
- Dataset de entrenamiento: https://huggingface.co/datasets/dddddsds31341/sorting-dolls-lerobot
