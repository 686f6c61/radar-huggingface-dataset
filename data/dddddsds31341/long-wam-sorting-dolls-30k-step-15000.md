# dddddsds31341/Long-WAM-Sorting-Dolls-30k-Step-15000

## Resumen

Long-WAM Sorting Dolls 30k Step 15000 es un checkpoint de evaluacion (no de reanudacion de entrenamiento) derivado del modelo base Efficient-Large-Model/Long-WAM-YAM, un modelo de robotica de la familia Long-WAM (World-Action Model). Lo publica el usuario dddddsds31341 en Hugging Face y esta especializado en una tarea concreta de manipulacion robotica: colocar cinco munecas rusas en fila, en posicion vertical, de menor a mayor y de izquierda a derecha. Este checkpoint corresponde al paso de optimizador 15.000 de un plan de 30.000 pasos, dentro del run sorting-dolls-30k-20261105.

El modelo se ha ajustado (fine-tuning) sobre el dataset dddddsds31341/sorting-dolls-lerobot, que contiene 100 demostraciones y 168.126 fotogramas en formato LeRobot. La salida del modelo son objetivos de articulacion y pinza en 14 dimensiones absolutas (6 articulaciones + pinza por cada brazo), con normalizacion z-score especifica de la tarea y sin recorte de valores normalizados. Es un modelo de politica (policy) para control robotico, no un modelo de lenguaje generativo, aunque internamente emplee componentes tipo transformer y un VAE de Wan2.2 junto con un codificador de texto UMT5.

Su relevancia es acotada: se trata de un artefacto de investigacion reproducible para una tarea concreta, con un repositorio de 12 GB, cero descargas y cero likes en el momento de la consulta. El propio autor indica que no se reclama ninguna tasa de exito ni rendimiento en validacion cruzada, por lo que debe tratarse como material de evaluacion interna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Long-WAM (World-Action Model) sobre base Efficient-Large-Model/Long-WAM-YAM; componentes Wan2.2 VAE y UMT5 text encoder |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | P48 de historial (48 pasos) y chunk de accion de 32 pasos; no se especifica contexto en tokens |
| Tipos de cuantizacion | BF16 (entrenamiento con BF16 / ZeRO-1); no se listan otras cuantizaciones |
| Idiomas soportados | no disponible (instruccion de tarea en ingles) |
| Licencia | other (remite a la licencia del modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM) |
| Formato de pesos | PyTorch (model.pt con mot, proprio_encoder, step y torch_dtype); sin safetensors ni GGUF |
| Tamano del repositorio | 12,0 GB |
| Pipeline | robotics |
| Dataset de ajuste | dddddsds31341/sorting-dolls-lerobot (100 demostraciones, 168.126 fotogramas, revision ffca92aece12b85daac426b1b0474065e1ecf165) |
| Paso de optimizador | 15.000 de 30.000 |
| Camaras de entrada | top_head, hand_left, hand_right |
| Layout de imagen procesada | 384 x 320 |
| Acciones | 14D absolutas (6 articulaciones + pinza izquierda, 6 articulaciones + pinza derecha) |
| Normalizacion | z-score especifica de tarea, sin recorte |
| Fecha de creacion | 2026-11-06 |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Efficient-Large-Model/Long-WAM-YAM, un World-Action Model de la familia Long-WAM orientado a robotica. La model card no detalla la arquitectura interna completa, pero si especifica los componentes auxiliares necesarios para la inferencia: el VAE de Wan2.2, el codificador de texto UMT5 y su tokenizador, que deben obtenerse por separado. El checkpoint de evaluacion contiene el modulo `mot`, el `proprio_encoder`, el numero de paso y el `torch_dtype`, y no incluye estado de optimizador, scheduler ni RNG, por lo que no sirve para reanudar el entrenamiento.

El entrenamiento se realizo sobre 100 demostraciones y 168.126 fotogramas del dataset sorting-dolls-lerobot, con cuatro GPU A100, batch de 12 por GPU y acumulacion 1 (batch global 48). Se uso AdamW con learning rate constante de 1e-5, weight decay 0.01, semilla 42 y precision BF16 con ZeRO-1. La instruccion de tarea es textual: "Arrange the five Russian dolls upright in a row from smallest to largest, from left to right". La politica consume tres camaras (top_head, hand_left, hand_right) con layout 384 x 320, mantiene un historial P48 y predice un chunk de 32 pasos de accion. La normalizacion z-score es especifica del run y debe usarse con las estadisticas incluidas (dataset_stats.json) y el codigo de la version v47.

## Capacidades

- Generacion de acciones roboticas de 14 dimensiones (articulaciones y pinzas de ambos brazos) para control de manipulacion.
- Ejecucion de una tarea especifica de ordenacion: colocar cinco munecas rusas en fila vertical de menor a mayor, de izquierda a derecha.
- Percepcion multimodal a partir de tres camaras: top_head, hand_left y hand_right.
- Uso de historial de observaciones (P48) y prediccion de chunks de accion de 32 pasos.
- Acondicionamiento por instruccion textual en lenguaje natural mediante el codificador UMT5.
- Integracion con el stack SIP de Long-WAM para carga de configuracion y modelo (`longwam.inference.load_run_config` y `load_model`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni generacion de texto libre.

## Casos de uso

- Evaluacion reproducible de politicas de robotica: el checkpoint permite reproducir el paso 15.000 del run sorting-dolls-30k en una maquina de evaluacion, cargando `model.pt` con `expected_step=15000` y comparando contra otros checkpoints del mismo run.
- Investigacion en manipulacion de precision: la tarea de ordenar munecas rusas exige colocacion vertical y ordenada, lo que sirve para estudiar control fino de pinzas y articulaciones en brazos duales.
- Benchmarking de modelos World-Action: al compartir base con Long-WAM-YAM y con otros checkpoints del mismo autor (por ejemplo, las variantes de nesting-doll), permite comparar el efecto del paso de entrenamiento y del dataset en una tarea controlada.
- Desarrollo de pipelines de inferencia robotica: el repositorio incluye `code.zip` con el checkout de Long-WAM, `config.yaml`, `dataset_stats.json` y `requirements-sip.txt`, lo que facilita montar un entorno de evaluacion con las dependencias SIP fijadas.
- Estudio de normalizacion de acciones: al usar z-score sin recorte y estadisticas especificas del run, es util para analizar como afecta la normalizacion a la estabilidad de las predicciones de accion.
- Formacion y docencia en robotica: como ejemplo completo de fine-tune LeRobot con instruccion textual, camaras multiples y salidas de articulacion, sirve para ilustrar el flujo de entrenamiento y evaluacion de una politica.
- Base para nuevos fine-tunes: al ser un checkpoint intermedio de un run de 30.000 pasos, puede emplearse como punto de partida para ajustes posteriores sobre tareas de ordenacion similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna tasa de exito del robot ni rendimiento en conjuntos de validacion.

## Requisitos de hardware

- El entrenamiento se realizo con cuatro GPU A100, batch 12 por GPU, BF16 y ZeRO-1; ese es el perfil de referencia del autor.
- VRAM estimada para inferencia: no disponible. El repositorio pesa 12,0 GB y el checkpoint esta en BF16, pero no se detalla el reparto de memoria entre `mot`, `proprio_encoder` y los componentes externos.
- Componentes adicionales necesarios: VAE de Wan2.2, codificador de texto UMT5 y tokenizador, que deben descargarse por separado y anaden requisitos de memoria y almacenamiento.
- GPU recomendadas: no disponible. Por el uso de A100 en entrenamiento y el tamano del checkpoint, se puede inferir que se necesitan GPU de gama alta, pero no hay datos confirmados.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor indica usar el checkout de Long-WAM incluido en `code.zip` y las funciones `longwam.inference.load_run_config` y `load_model`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a este tipo de modelo de robotica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Paso | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Long-WAM Sorting Dolls 30k Step 15000 | Efficient-Large-Model/Long-WAM-YAM | Ordenar munecas rusas en fila | 15.000 / 30.000 | sorting-dolls-lerobot (100 demos, 168.126 frames) | other | Hugging Face, 0 descargas |
| Long-WAM-Nesting-Doll-Unclipped-Step-20000 | Long-WAM (familia) | Encajar munecas rusas unas dentro de otras | 20.000 / 30.000 | nesting-doll-unclipped-30k-20261103-020414 | no disponible | Hugging Face |
| Long-WAM-Nesting-Doll-Epoch-1 | Long-WAM (familia) | Encajar munecas rusas unas dentro de otras | epoca 1 | no disponible | no disponible | Hugging Face |

Los tres modelos comparten la familia Long-WAM y el dominio de munecas rusas, pero difieren en la tarea (ordenar en fila frente a encajar) y en el punto de entrenamiento. No se dispone de datos de rendimiento comparables entre ellos.

## Limitaciones y advertencias

- No es un checkpoint de reanudacion: solo contiene `mot`, `proprio_encoder`, `step` y `torch_dtype`; no incluye estado de optimizador, scheduler ni RNG.
- No se reclama ninguna tasa de exito ni rendimiento en validacion; el autor lo etiqueta como checkpoint de evaluacion.
- La licencia es "other" y remite a la licencia del modelo base Long-WAM-YAM; es imprescindible revisar esa licencia antes de cualquier uso comercial.
- Requiere componentes externos (VAE de Wan2.2, UMT5 y tokenizador) que no se incluyen en el repositorio y que pueden tener sus propias licencias.
- El codigo y las estadisticas originales conservan rutas del sistema de ficheros SIP; es necesario adaptar las rutas de modelo, estadisticas y cache a la maquina de evaluacion.
- El `code.zip` excluye datasets, checkpoints, assets de modelo, entornos, caches, logs y secretos, por lo que no es un paquete autosuficiente.
- La tarea esta limitada a una instruccion concreta y a un entorno con tres camaras y dos brazos; no hay evidencia de generalizacion a otras tareas, objetos o morfologias.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada, aunque al tratarse de una politica de robotica el riesgo relevante es la ejecucion incorrecta de acciones, no la generacion de texto.
- Idiomas soportados: no disponible; la unica instruccion documentada esta en ingles.
- Cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Sorting-Dolls-30k-Step-15000
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Licencia del modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset de ajuste: https://huggingface.co/datasets/dddddsds31341/sorting-dolls-lerobot
- Checkpoint relacionado (nesting doll, step 20000): https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Unclipped-Step-20000
- Checkpoint relacionado (nesting doll, epoca 1): https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Epoch-1
