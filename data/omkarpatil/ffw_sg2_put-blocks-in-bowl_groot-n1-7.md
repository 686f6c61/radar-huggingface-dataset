# omkarpatil/ffw_sg2_put-blocks-in-bowl_groot-n1.7

## Resumen

Este modelo es un fine-tuning del VLA (vision-language-action) de NVIDIA, GR00T-N1.7-3B, especializado para una tarea concreta de manipulación robótica: recoger dos bloques y colocarlos en un cuenco verde. Ha sido desarrollado por omkarpatil sobre el robot ROBOTIS FFW-SG2 (AI Worker), un manipulador de doble brazo comercial, y se distribuye como un checkpoint de inferencia listo para usar en el contenedor cyclo_intelligence GR00T. El fine-tuning se realizó únicamente sobre el proyector multimodal y la cabeza de difusión, con el resto de pesos del modelo base congelados, a partir de 78 demostraciones teleoperadas en formato LeRobot v2.1.

La relevancia de este modelo radica en demostrar un flujo de adaptación eficiente de un VLA generalista a un embodiment y una tarea específica con un número reducido de demostraciones, un escenario típico en robótica de bajo volumen. Arquitectónicamente hereda las características del GR00T-N1.7-3B, un transformer multimodal con cabeza de difusión para la generación de acciones, con un total de 3.144 millones de parámetros. No se especifica la longitud de contexto del modelo, aunque al procesar imágenes y lenguaje, la ventana efectiva depende del tokenizador visual del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basado en nvidia/GR00T-N1.7-3B, con proyector multimodal y cabeza de difusion |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precision completa) |
| Idiomas soportados | no disponible (instruccion en ingles en la tarea definida) |
| Licencia | other (hereda la licencia del modelo base de NVIDIA, no detallada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye a partir de GR00T-N1.7-3B, un VLA cross-embodiment de NVIDIA que acepta entradas multimodales (imagen y lenguaje) y genera acciones de control para robots humanoides o manipuladores. La arquitectura interna combina un transformer para el procesamiento de secuencias visuales y textuales con una cabeza de difusión que produce trayectorias de acciones. En este fine-tuning, únicamente se actualizaron el proyector (que alinea las representaciones visuales y lingüísticas) y la cabeza de difusión, manteniendo congelado el resto del transformer base.

El entrenamiento se realizó sobre 78 demostraciones teleoperadas del dataset `omkarpatil/put-blocks-in-bowl`, registradas a 15 fps en formato LeRobot v2.1. Se utilizó un optimizador con tasa de aprendizaje 1e-4 y programación coseno, tamaño de batch global 32, y aumento de datos mediante color jitter. El checkpoint final corresponde al paso 20.000, y se eliminaron los estados del optimizador y del scheduler para reducir el tamaño del repositorio. No se aplicaron técnicas de RLHF ni DPO; el aprendizaje se basa exclusivamente en imitación supervisada.

El modelo está diseñado para un embodiment específico etiquetado como `NEW_EMBODIMENT`, con configuración de modalidades propia. Utiliza tres cámaras (izquierda y derecha de muñeca, y cabeza) a resolución 224×224, un vector de estado de 22 dimensiones (brazo izquierdo y derecho de 8 cada uno, cabeza 2, lift 1, odometría 3) y genera acciones articulares absolutas de 16 dimensiones (8 por brazo) con un horizonte de predicción de 16 pasos a 15 Hz. El robot no comanda head, lift ni base durante la ejecución.

## Capacidades

- Manipulación robótica de pick-and-place: el modelo ejecuta la tarea específica de recoger dos bloques y depositarlos en un cuenco verde, generando trayectorias articulares para ambos brazos.
- Entrada multimodal: procesa simultáneamente tres flujos de imagen (muñecas izquierda y derecha, y cabeza) junto con el estado propioceptivo del robot (22-D).
- Control en bucle cerrado: la salida es una secuencia de acciones articulares absolutas (horizonte 16) que se ejecutan a 15 Hz, permitiendo un control reactivo en tiempo real.
- Generalización limitada al embodiment: el modelo está entrenado para el ROBOTIS FFW-SG2, y su configuración de cámaras y estado está fijada para ese robot.
- Sin capacidades de tool calling ni agentes: es un modelo de control motor, no un asistente conversacional.
- Sin soporte multilingüe: la instrucción se define en inglés, aunque no se especifican otros idiomas.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales controlados: el modelo puede integrarse en una célula de trabajo del FFW-SG2 para clasificar piezas pequeñas (bloques) en contenedores, reduciendo el tiempo de programación manual.
- Investigación en aprendizaje por imitación con pocas demostraciones: sirve como referencia para estudiar cómo un VLA de 3B parámetros se adapta a una tarea nueva con solo 78 demostraciones, permitiendo comparar estrategias de fine-tuning parcial (proyector + cabeza) frente a ajuste completo.
- Evaluación de VLA en robots comerciales: el modelo ofrece un punto de partida reproducible para validar el despliegue de GR00T-N1.7 en el FFW-SG2, tanto en simulación como en hardware real, como se muestra en los resultados publicados para tareas similares.
- Desarrollo de pipelines de control basados en visión-lenguaje-acción: al ser un checkpoint listo para inferencia, puede usarse como módulo dentro de un sistema robótico más amplio que gestione la planificación de tareas de alto nivel.
- Benchmarking de metodologías de entrenamiento: permite comparar el rendimiento de fine-tuning con distintos tamaños de dataset, tasas de aprendizaje y aumentos de datos sobre una tarea de manipulación estándar.
- Pruebas de robustez ante variaciones visuales: dado que se aplicó color jitter durante el entrenamiento, el modelo puede evaluarse bajo cambios de iluminación o color de fondo, útil para estudios de generalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Aunque existe una página de resultados para GR00T N1.6 y N1.7 en el FFW-SG2 (tarea de pegboard brush pick-and-place), no corresponde a este fine-tuning específico ni a la tarea de bloques en cuenco.

## Requisitos de hardware

- VRAM estimada: con 3,14 B parámetros en precisión FP16, los pesos ocupan aproximadamente 6,3 GB. Sumando activaciones para tres imágenes de 224×224 y la memoria del runtime de PyTorch, se recomienda una GPU con al menos 16 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40 GB, L40S (48 GB) o superior. Una RTX 3090 (24 GB) también sería viable.
- Compatibilidad con GPU de consumo: sí, una RTX 4090 puede ejecutar el modelo en inferencia, aunque el throughput dependerá del número de pasos de difusión y del tamaño de lote.
- Opciones de despliegue: el modelo está diseñado para ejecutarse en el contenedor de inferencia cyclo_intelligence GR00T (usando `Gr00tPolicy` con `embodiment_tag=NEW_EMBODIMENT`). No se mencionan integraciones con vLLM, llama.cpp u Ollama, al ser un modelo de robótica, no de texto.
- Latencia y throughput: no disponibles. La inferencia involucra múltiples pasos de difusión sobre el horizonte de 16 acciones, lo que puede requerir decenas de milisegundos por paso de control.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omkarpatil/ffw_sg2_put-blocks-in-bowl_groot-n1.7 (este) | 3,14 B | no disponible | Pick-and-place de bloques en cuenco (FFW-SG2) | other | HuggingFace |
| nvidia/GR00T-N1.7-3B (base) | 3,14 B | no disponible | Manipulacion generalista cross-embodiment | other (NVIDIA) | HuggingFace |
| OpenVLA (referencia de VLA open source) | 7 B | 2048 tokens | Manipulacion generalista | MIT | HuggingFace |

La comparativa se limita al modelo base, ya que no hay otros fine-tunings públicos de GR00T para el FFW-SG2. El modelo base ofrece capacidades generalistas pero requiere adaptación por embodiment; este fine-tuning sacrifica generalidad por precisión en una tarea concreta. OpenVLA es una alternativa open source de mayor tamaño, pero no tiene soporte nativo para el FFW-SG2.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ejecuta la tarea de recoger dos bloques y ponerlos en un cuenco verde; cualquier variación en la tarea o el entorno puede provocar fallos.
- Sobreajuste potencial: entrenado con solo 78 demostraciones, es probable que el modelo memorice las condiciones específicas de la recogida (posiciones, colores, iluminación) y no generalice a nuevas configuraciones.
- Sesgos y alucinaciones no evaluados: no hay estudios de sesgos ni de comportamientos inesperados (acciones erróneas) en este checkpoint.
- Licencia "other": la licencia no está detallada en la model card; al derivar de GR00T-N1.7-3B de NVIDIA, es necesario revisar los términos de la licencia original antes de uso comercial.
- Idioma: solo se ha probado con la instrucción en inglés definida en la tarea; no se garantiza el funcionamiento con otras lenguas.
- Hardware específico: el modelo requiere el robot FFW-SG2 (coste aproximado de 72.600 dólares) y el contenedor de inferencia cyclo_intelligence, lo que limita su reproducibilidad fuera de ese ecosistema.
- Sin soporte para comandos de head, lift ni base: la acción generada solo controla los dos brazos, por lo que no es adecuado para tareas que requieran movimiento de la base o la elevación.

## Enlaces

- Repositorio del modelo: https://huggingface.co/omkarpatil/ffw_sg2_put-blocks-in-bowl_groot-n1.7
- Modelo base nvidia/GR00T-N1.7-3B: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Repositorio de Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Resultados de GR00T N1.6 & N1.7 en FFW-SG2: https://rao-sanaullah.github.io/Groot_results/
- Página del robot ROBOTIS FFW-SG2: https://www.robotis.ch/index.php?route=product/product&product_id=618
