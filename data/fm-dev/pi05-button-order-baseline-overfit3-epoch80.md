# fm-dev/pi05-button-order-baseline-overfit3-epoch80

## Resumen

El modelo `fm-dev/pi05-button-order-baseline-overfit3-epoch80` es un checkpoint de política robótica de la familia π0.5 (pi05) publicado por el usuario `fm-dev`. No es un modelo de lenguaje de propósito general: es un ajuste fino con LoRA (variante «Cartesian8») sobre `physical-intelligence/pi05_base`, especializado en una única tarea de manipulación descrita como «Press the buttons in the order shown in the demonstration video.» y ejecutada sobre un brazo Franka. El repositorio (5,5 GB) contiene un checkpoint EMA en el paso 5.280, es decir, 80 épocas del sampler, junto con los assets de normalización, el código de carga y un script `load_model.py`.

El interés del modelo es metodológico y no de producto: el propio autor lo etiqueta como `overfit` y lo entrena con solo tres trayectorias (episodios 2, 6 y 17), 529 ventanas H20 y un batch global de 8 sobre una única RTX A6000, con 66 actualizaciones por época. Se plantea como baseline reproducible para estudiar el sobreajuste deliberado con pocos datos, la geometría de acciones y el efecto de LoRA sobre políticas visión-lenguaje-acción.

La salida del modelo es un bloque absoluto de forma `[20, 8]` (horizonte de 20 pasos; posición `x, y, z` en metros, cuaternión unitario `qx, qy, qz, qw` y apertura de pinza con 0 = cerrado y 1 = abierto). No se declaran licencia, idiomas soportados, cuantizaciones ni benchmarks, y la única validación incluida se limita a comprobar la carga del modelo y que las salidas sean finitas sobre nueve observaciones grabadas de entrenamiento; no se acredita éxito en robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | π0.5 base con adaptador LoRA «Cartesian8»; no se detalla el backbone ni el número de capas en la información disponible |
| Parámetros totales | no disponible (el repositorio ocupa 5,5 GB e incluye pesos EMA, assets y código, no solo pesos) |
| Parámetros activos | no aplica (no se describe una arquitectura MoE en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuyen pesos EMA sin indicar formatos alternativos) |
| Idiomas soportados | no disponible; las instrucciones de tarea del conjunto de datos están en inglés |
| Licencia | no disponible (no declarada ni en la model card ni en los metadatos de HuggingFace) |
| Formato de pesos | no disponible en detalle; el repositorio incluye `params/` con el checkpoint EMA, `assets/` con normalización y política, `code/`, `requirements.txt` y `load_model.py` |
| Tipo de modelo | política visión-lenguaje-acción (VLA) para robótica |
| Modelo base | `physical-intelligence/pi05_base` |
| Entradas en inferencia | vistas RGB actuales (base y muñeca), estado medido y texto de tarea; sin memoria de historial |
| Salida | tensor `[20, 8]` absoluto: `[x, y, z, qx, qy, qz, qw, gripper_open]`, posiciones en metros, cuaterniones XYZW unitarios |
| Embodiment | Franka (según etiquetas del repositorio) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-10 |
| Tamaño del repositorio | 5,5 GB |

## Arquitectura y entrenamiento

El modelo parte de `physical-intelligence/pi05_base` y añade un adaptador LoRA denominado «Cartesian8», entrenado con la normalización del split de entrenamiento original. El subconjunto de comportamiento empleado contiene 529 ventanas H20 extraídas de tres episodios (`button_order_20260827_171329_079`, `button_order_20260827_171814_240` y `button_order_20260827_172703_063`). El entrenamiento se realizó con batch global 8, 66 actualizaciones por época del sampler y una única GPU RTX A6000, hasta alcanzar el paso 5.280, que corresponde exactamente a 80 épocas del sampler. La geometría de época «Status-D» incluye su mezcla auxiliar Status ya existente.

El checkpoint distribuido es la media móvil exponencial (EMA) de los pesos. Las entradas de la política son únicamente las vistas RGB actuales de cámara base y muñeca, el estado medido y el texto de la tarea; no hay memoria de historial. La cabeza de acción produce posiciones absolutas en metros, cuaterniones unitarios y apertura de pinza, con las etiquetas de comando ausentes enmascaradas durante el entrenamiento. El repositorio no incluye estado de optimizador ni de reanudación, y las variantes Uniform32 y Status-D requieren historial realmente observado; Status-D requiere además las entradas retenidas del Writer y contexto causal.

## Capacidades

- Generación de comandos de acción robótica: produce bloques de 20 pasos por 8 dimensiones en coordenadas cartesianas absolutas (posición, orientación en cuaternión y apertura de pinza).
- Control de manipulación de precisión: la tarea objetivo es pulsar botones en un orden concreto indicado en un vídeo de demostración.
- Condicionamiento multimodal de entrada: combina dos vistas RGB (base y muñeca), estado medido del robot y texto de tarea en inglés.
- Adaptación eficiente mediante LoRA: el ajuste se aplica sobre el modelo base sin reentrenar todos los parámetros.
- Salida con horizonte fijo de acción (action chunking de 20 pasos), apta para ejecución por tramos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no incluye memoria de historial ni planificación explícita.
- Capacidades multilingües: no disponible; el corpus y las instrucciones están en inglés.
- Capacidades especiales: no se documentan modos de pensamiento, visión general, audio ni decodificación especulativa.

## Casos de uso

- Baseline reproducible para investigación en VLA: permite comparar el efecto de un LoRA «Cartesian8» frente a otros adaptadores o al modelo base sin ajustar, usando una tarea y unos datos fijos (3 episodios, 529 ventanas).
- Estudio de sobreajuste con pocos datos: al estar entrenado durante 80 épocas sobre tres trayectorias, sirve como caso controlado para medir cuándo una política memoriza en lugar de generalizar.
- Verificación de infraestructura de inferencia: el repositorio incluye `load_model.py`, `requirements.txt` y `inference-check.json`, por lo que es útil para validar que un entorno GPU carga el checkpoint EMA y devuelve salidas finitas antes de abordar entrenamientos mayores.
- Validación de pipelines de normalización y geometría «Status-D»: al requerir historial observado y las entradas retenidas del Writer, el modelo permite probar si un pipeline reproduce correctamente esas condiciones.
- Experimentos de ordenación de tareas de manipulación: la tarea «pulsar botones en el orden mostrado» es un banco de pruebas para estudiar condicionamiento por demostración en vídeo en políticas de acción.
- Evaluación offline sobre episodios grabados: se puede ejecutar la política sobre las observaciones registradas de los episodios 2, 6 y 17 para depurar la tubería de datos sin necesidad de robot físico.
- Material docente y de laboratorio: como ejemplo completo de repositorio de política robótica con LoRA, assets de normalización y código de carga, es adecuado para prácticas sobre VLA en cursos de robótica o aprendizaje automático.
- Pruebas de latencia en hardware tipo estación de trabajo: al haberse entrenado en una RTX A6000, permite caracterizar tiempos de inferencia en GPUs de gama profesional similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único artefacto de evaluación incluido es `inference-check.json`, que recoge la carga del modelo empaquetado en GPU y la comprobación de salidas finitas sobre nueve observaciones grabadas de los tres episodios de entrenamiento. Según el propio autor, estas comprobaciones verifican la carga y la finitud de las salidas, pero no establecen éxito en robot real ni un despliegue en línea del Writer. No se proporcionan métricas de tasa de éxito, error de posición, MMLU, HumanEval, GSM8K ni equivalentes de robótica.

## Requisitos de hardware

- Entrenamiento documentado: una única NVIDIA RTX A6000 con batch global 8 y 66 actualizaciones por época del sampler.
- VRAM para inferencia: no disponible como cifra publicada. Como estimación orientativa no confirmada, cargar el modelo base π0.5 más el adaptador LoRA en precisión de 16 bits requiere del orden de 8 a 12 GB solo para pesos, a lo que hay que sumar activaciones de los codificadores visuales y del experto de acción; conviene disponer de 24 GB o más para trabajar con margen.
- GPUs recomendadas: RTX A6000 (validada por el autor para entrenamiento). Para inferencia, cualquier GPU profesional o de gama alta con memoria suficiente; A100, H100 o L40S son opciones conservadoras. La información proporcionada no especifica requisitos de VRAM adicionales.
- GPU de consumo: no disponible. No se indica si el modelo cabe en una RTX 4090 u otras GPU de consumo; el tamaño de 5,5 GB del repositorio no equivale al peso en memoria del modelo completo en ejecución.
- Opciones de despliegue: el repositorio incluye `load_model.py` y `requirements.txt` para carga directa en PyTorch/JAX según el stack de π0.5. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no son los servidores habituales para políticas de acción.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo por inferencia ni de frecuencia de control alcanzable.
- Almacenamiento: 5,5 GB para el repositorio completo (pesos EMA, assets, código).

## Comparativa con modelos similares

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre su familia (los resultados obtenidos corresponden a emisoras de radio en francés), por lo que la comparación se limita a lo que puede deducirse de la información de HuggingFace. Los datos de terceros no verificados en esta ficha se marcan como no disponibles.

| Modelo | Relación | Parámetros | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fm-dev/pi05-button-order-baseline-overfit3-epoch80` | Objeto de la ficha | no disponible | vistas RGB base y muñeca, estado, texto; sin historial | no disponible | HuggingFace, 0 descargas |
| `physical-intelligence/pi05_base` | Modelo base declarado | no disponible | no disponible | no disponible | referenciado como `base_model` |
| Otros VLA de manipulación (por ejemplo, familias π0, OpenVLA o SmolVLA) | Alternativas de la misma categoría | no disponible | no disponible | no disponible | no verificados en la búsqueda realizada |

Diferencias cualitativas destacables frente al modelo base: este checkpoint incorpora un adaptador LoRA específico, salidas normalizadas con el split de entrenamiento original y un régimen de entrenamiento deliberadamente sobreajustado a tres trayectorias; no añade, según la documentación, memoria de historial ni capacidades multimodales más allá de las dos vistas RGB.

## Limitaciones y advertencias

- Sobreajuste intencionado: el nombre y las etiquetas del repositorio (`overfit`) indican que el modelo está ajustado en exceso a tres episodios concretos; no debe esperarse generalización a otros entornos, posiciones de botones u objetos.
- Corpus de entrenamiento mínimo: 3 trayectorias y 529 ventanas H20, insuficientes para cubrir variaciones de iluminación, disposición de la escena o dinámica del robot.
- Ausencia de validación en robot real: las comprobaciones incluidas solo verifican la carga del modelo y que las salidas sean finitas sobre observaciones de entrenamiento; no hay evidencia de tasa de éxito en ejecución física.
- Licencia no declarada: al no especificarse licencia, no hay autorización explícita de uso comercial ni de redistribución; en ausencia de licencia deben asumirse los derechos reservados por defecto.
- Dependencia del modelo base: el uso requiere disponer de `physical-intelligence/pi05_base` y de su stack de ejecución, cuyas condiciones de licencia y disponibilidad no se detallan aquí.
- Condiciones de entrada estrictas: las variantes Uniform32 y Status-D exigen historial realmente observado, y Status-D además las entradas retenidas del Writer y contexto causal; sin ellas la inferencia no es válida.
- Sin memoria de historial: la política solo ve las vistas RGB actuales, el estado medido y el texto de tarea, lo que limita tareas que dependan del contexto temporal pasado.
- Etiquetas de comando enmascaradas: durante el entrenamiento las etiquetas ausentes quedaron enmascaradas, lo que puede reducir la cobertura efectiva de la señal de aprendizaje.
- Marco de referencia no especificado: las posiciones se expresan en metros y los cuaterniones en formato XYZW unitario, pero no se documenta el sistema de coordenadas ni el frame de referencia, lo que complica la integración directa en otro robot distinto del Franka.
- Estado de optimizador no incluido: no es posible reanudar el entrenamiento exactamente desde el punto distribuido, solo continuar desde los pesos EMA.
- Idiomas: no se declaran capacidades multilingües y las instrucciones de tarea están en inglés.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente por parte de terceros.
- Riesgo de alucinación en el sentido robótico: al ser una política de acción, puede generar comandos plausibles pero incorrectos cuando la escena difiere de las tres trayectorias vistas; no hay mecanismo de verificación de seguridad incluido.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/fm-dev/pi05-button-order-baseline-overfit3-epoch80
- Modelo base declarado: https://huggingface.co/physical-intelligence/pi05_base
- Descarga directa mediante CLI: `hf download fm-dev/pi05-button-order-baseline-overfit3-epoch80 --local-dir ./button-order-baseline-epoch80`
- La búsqueda web realizada no devolvió papers, blogs, repositorios ni demos relevantes sobre este modelo o su familia; los únicos resultados obtenidos fueron páginas de emisoras de radio en francés, sin relación con el contenido de la ficha.
