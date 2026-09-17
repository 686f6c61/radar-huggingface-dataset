# jaehyunkang/pi05-real-workbench-preset-2view-60k

## Resumen

El modelo `jaehyunkang/pi05-real-workbench-preset-2view-60k` es una política robótica de tipo visión-lenguaje-acción (VLA) obtenida por ajuste fino de `lerobot/pi05_base`, la implementación de Pi0.5 mantenida dentro de LeRobot. Lo desarrolla el usuario `jaehyunkang` y está pensado para controlar un brazo robótico en las cuatro tareas definidas del banco de trabajo (Workbench) recogidas en el dataset `Myungkyu/real_workbench-preset-gemini`. No es un modelo de lenguaje general: recibe imágenes de cámara junto con una instrucción textual por fotograma y emite comandos de acción de bajo nivel para el efector final.

El checkpoint corresponde al paso 60.000 de optimización, con lote global de 64, 4 GPU y semilla 42. El modelo tiene 4.143.404.816 parámetros (unos 4,14 mil millones) en formato safetensors y el repositorio ocupa 24,5 GB, cifra que incluye estados de entrenamiento reanudables además de los pesos. El entrenamiento se realizó con la implementación `RLWRLD/hiwrld-ll-policy` sobre una copia local de LeRobot Pi0.5, y el tokenizador referenciado es el de `google/paligemma-3b-pt-224`.

Su relevancia es acotada y práctica: sirve como ejemplo reproducible de ajuste fino de Pi0.5 sobre un dataset concreto de manipulación, con configuración de preprocesado, normalización y postprocesado incluidas en el repositorio. No se reclama ninguna métrica de evaluación en robot real, por lo que debe tratarse como una política entrenada, no como un resultado validado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) basada en Pi0.5; columna vertebral tipo PaliGemma (`google/paligemma-3b-pt-224`) con cabezal de acción generativo (10 pasos de denoising) |
| Parámetros totales | 4.143.404.816 (≈4,14 B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de política; no se documenta ventana de contexto de texto) |
| Tipos de cuantización | no disponible (se distribuyen pesos sin cuantizar en safetensors) |
| Idiomas soportados | no disponibles (las instrucciones se tokenizan con PaliGemma; el dataset usa subtareas por fotograma) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modalidad de entrada | 2 vistas de imagen (exterior y muñeca), 224×126 almacenadas y rellenadas a 224×224 |
| Estado (state) | 8 dimensiones |
| Acción | delta EEF de 7 dimensiones (6 de velocidad cartesiana + pinza) |
| Horizonte de acción (chunk) | 50 |
| Pasos de denoising en inferencia | 10 |
| Pasos de entrenamiento | 60.000 |
| Lote global / GPU / semilla | 64 / 4 GPU / 42 |
| Librería | lerobot |
| Modelo base | lerobot/pi05_base |
| Dataset | Myungkyu/real_workbench-preset-gemini |
| Tamaño del repositorio | 24,5 GB |

## Arquitectura y entrenamiento

Se trata de un modelo de política VLA derivado de Pi0.5. La información disponible indica una arquitectura con columna vertebral PaliGemma (referencia de tokenizer `google/paligemma-3b-pt-224`, revisión `35e4f46485b4d07967e7e9935bc3786aad50687c`) y un cabezal de acción que genera las acciones mediante un proceso iterativo de denoising de 10 pasos, coherente con un esquema de flow matching o difusión para el bloque de acción. La salida es un chunk de 50 acciones de delta EEF en 7 dimensiones, y el estado de entrada tiene 8 dimensiones. Las imágenes se almacenan a 224×126 y la política las rellena a 224×224, con dos vistas simultáneas (exterior y muñeca).

El entrenamiento se realizó durante 60.000 pasos con lote global 64 sobre 4 GPU y semilla 42, usando la implementación `RLWRLD/hiwrld-ll-policy` con una versión empaquetada de LeRobot Pi0.5. El dataset de ajuste es `Myungkyu/real_workbench-preset-gemini`, y las instrucciones se proporcionan como subtarea por fotograma desde parquet. El alcance declarado cubre las cuatro tareas de Workbench. En el repositorio se incluyen pesos, configuración de la política, preprocesado/postprocesado y estados de normalización en la raíz, mientras que los ficheros de reanudación del entrenamiento están en `training_state/`. No se documentan en la información disponible detalles sobre composición exacta del dataset, número de tokens vistos ni si hubo etapas de RLHF/DPO posteriores; el autor indica que no se reclama ninguna métrica de evaluación en robot real.

## Capacidades

- Generación de comandos de acción para control de robot manipulador: salida de delta EEF de 7 dimensiones (6 de velocidad cartesiana más pinza) a partir de observaciones visuales y estado.
- Percepción visual multi-vista: procesa dos cámaras (exterior y muñeca) a 224×224 tras el relleno desde 224×126.
- Condicionamiento por instrucción textual: acepta texto de tarea por fotograma, tomado del campo de subtarea del dataset.
- Ejecución por chunks de acción: produce horizontes de 50 acciones, con 10 pasos de denoising por inferencia.
- Cobertura de tareas: entrenado para las cuatro tareas de Workbench del dataset de referencia.
- Integración con el ecosistema LeRobot: pesos, configuración y estados de normalización listos para cargar con la librería lerobot.
- Reanudación de entrenamiento: incluye `training_state/` para continuar el ajuste.
- Tool calling / function calling: no aplica (no es un modelo de lenguaje conversacional).
- Capacidades de agente multi-paso: no disponibles (no se documenta planificación de alto nivel).
- Capacidades multilingües, de audio o de visión general: no disponibles; el uso previsto es la política robótica descrita.

## Casos de uso

- Manipulación en banco de trabajo: el modelo ejecuta las cuatro tareas de Workbench para las que fue entrenado, tomando como entrada las dos vistas de cámara y la subtarea textual por fotograma, y devolviendo velocidades cartesianas y apertura de pinza.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudiar cómo se comporta un ajuste de Pi0.5 durante 60.000 pasos sobre un dataset real concreto, con estados de normalización y configuración incluidos.
- Reanudación y experimentación de entrenamiento: los ficheros en `training_state/` permiten continuar el ajuste, cambiar el dataset o modificar la política partiendo de un checkpoint avanzado.
- Recolección pick-and-place guiada por instrucción: al condicionarse por subtarea textual, puede emplearse para variar el objeto o el destino dentro de un flujo de trabajo de tipo Workbench siempre que la instrucción y las vistas se correspondan con la distribución de entrenamiento.
- Base para evaluación comparativa de políticas VLA: al derivar de `lerobot/pi05_base`, permite comparar el efecto del ajuste frente al modelo base en el mismo montaje de hardware, si bien el autor no publica métricas.
- Integración en pipelines de LeRobot: al distribuirse con configuración y estados de normalización en la raíz, se puede cargar desde la librería lerobot para probar el control en un brazo compatible con el mismo perfil de estado y acción (8 dimensiones de estado, 7 de acción).
- Prototipado de control continuo con horizonte largo: el chunk de 50 acciones y los 10 pasos de denoising facilitan desplegar control con re-planificación menos frecuente en entornos donde la latencia de inferencia importa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que se trata de un checkpoint entrenado y no de un resultado de evaluación, y que no se reclama ninguna métrica de evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 mil millones de parámetros, en bf16 los pesos ocupan del orden de 8,3 GB; hay que sumar las activaciones de las dos vistas de imagen y del cabezal de acción, por lo que conviene disponer de 12-16 GB de VRAM como margen razonable. Cifra orientativa, no confirmada en la información disponible.
- GPU recomendadas: no disponible de forma explícita. Por tamaño, una GPU de 24 GB (RTX 4090, A10G, L4 de 24 GB) debería ser suficiente; A100 o H100 aportarían margen y mayor throughput. El entrenamiento se realizó en 4 GPU (modelo no especificado).
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de 16 GB o más (RTX 4080/4090, según cuantización y tamaño de lote). No confirmado.
- Opciones de despliegue: LeRobot, que es la librería declarada. El modelo no sigue el formato de `llama.cpp`, Ollama o TGI, que no aplican a este tipo de política. El autor advierte que los campos de entrada personalizados pueden requerir la implementación `RLWRLD/hiwrld-ll-policy` con la versión de LeRobot Pi0.5 empleada en el entrenamiento.
- Latencia y throughput: no disponibles como medida publicada. Como referencia interna del modelo, cada inferencia ejecuta 10 pasos de denoising para producir un chunk de 50 acciones.
- Almacenamiento: el repositorio completo ocupa 24,5 GB, aunque incluye estados de entrenamiento; los pesos de la política por sí solos ocupan menos.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-real-workbench-preset-2view-60k | 4.143.404.816 | Política VLA (Pi0.5 ajustado) | 2 vistas + subtarea textual, estado 8D | no disponible | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible | Política VLA Pi0.5 base | Visión + lenguaje | no disponible | Hugging Face vía LeRobot |
| lerobot/pi0_base | no disponible | Política VLA Pi0 base | Visión + lenguaje | no disponible | Hugging Face vía LeRobot |
| Otras familias VLA (OpenVLA, etc.) | no disponible en la información proporcionada | Política VLA | Visión + lenguaje | no disponible | no disponible |

No se dispone de datos de rendimiento, contexto ni licencia de las alternativas en la información proporcionada, por lo que la comparación se limita a la categoría y a la procedencia del modelo.

## Limitaciones y advertencias

- Sin métricas de evaluación: el autor declara explícitamente que es un checkpoint entrenado y no un resultado evaluado; no hay evidencia publicada de éxito en robot real.
- Especialización estrecha: está ajustado para las cuatro tareas de Workbench del dataset `Myungkyu/real_workbench-preset-gemini`; fuera de esa distribución no hay garantía de comportamiento.
- Dependencia de la implementación: los campos de entrada personalizados pueden exigir la implementación `RLWRLD/hiwrld-ll-policy` con la copia concreta de LeRobot Pi0.5; otras versiones podrían no cargar o comportarse de forma distinta.
- Licencia no declarada: al no indicarse licencia, no se puede asumir permiso para uso comercial ni redistribución. Es un riesgo legal en producción.
- Idiomas no especificados: se desconoce cómo afectan al modelo las instrucciones en idiomas distintos del usado en el dataset.
- Sesgos: no disponibles. Al entrenarse sobre un dataset de recogida propio y con un montaje de hardware concreto, cabe esperar un sesgo hacia esas condiciones de iluminación, cámara y disposición física.
- Riesgo de alucinación o de acciones erróneas: en robótica, una política fuera de distribución puede generar comandos de velocidad incorrectos; es imprescindible aplicar límites de seguridad en el controlador.
- Configuración sensible: la normalización y el preprocesado forman parte del artefacto; usar estados de normalización distintos o modificar la resolución de imagen (de 224×126 a 224×224) de forma diferente a la prevista degradará el resultado.
- Rutas locales: el autor indica que se eliminaron las rutas específicas de la máquina de los metadatos JSON, por lo que al reanudar el entrenamiento hay que proporcionar las rutas locales del dataset y de salida.
- Popularidad nula: 0 descargas y 0 me gusta en el momento de redactar la ficha; sin validación por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaehyunkang/pi05-real-workbench-preset-2view-60k
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/real_workbench-preset-gemini
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Tokenizer de referencia: https://huggingface.co/google/paligemma-3b-pt-224
- Implementación de entrenamiento citada: `RLWRLD/hiwrld-ll-policy` (referencia textual en la model card; no se aporta URL directa en la información disponible)
- LeRobot: no se aporta URL directa en la información disponible
