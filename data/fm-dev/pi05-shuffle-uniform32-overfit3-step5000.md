# fm-dev/pi05-shuffle-uniform32-overfit3-step5000

## Resumen

El modelo `fm-dev/pi05-shuffle-uniform32-overfit3-step5000` es un checkpoint de inferencia de tipo vision-language-action (VLA) para robótica, publicado por el usuario `fm-dev` como derivación del modelo base `physical-intelligence/pi05_base` (π0.5 de Physical Intelligence). No es un modelo de propósito general: es una política de manipulación entrenada específicamente sobre tres trayectorias de la tarea de "Shuffle" con un brazo Franka, en la que el robot debe pulsar el botón situado junto al vaso que oculta un cubo tras barajar los vasos.

El checkpoint corresponde a una exportación con media móvil exponencial (EMA) tras 5.000 actualizaciones del optimizador sobre esas tres únicas trayectorias (episodios 111, 115 y 131), con batch global de 8 en una sola RTX A6000 y aproximadamente 263,16 épocas del sampler. La inicialización parte de π0.5 base con proyecciones cartesianas nuevas y adaptadores LoRA, y la normalización emplea las estadísticas originales del split de entrenamiento. El resultado es, por diseño, un experimento de sobreajuste deliberado, no un modelo listo para producción.

Su relevancia es metodológica: sirve como referencia controlada para verificar cargadores, comprobar el contrato de entrada/salida de la política y disponer de una cota superior artificial de rendimiento sobre datos de entrenamiento. El repositorio ocupa 5,8 GB e incluye `params/`, `assets/`, el código correspondiente, `requirements.txt` y `load_model.py`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de π0.5; exportación de inferencia con proyecciones cartesianas nuevas y adaptadores LoRA sobre `physical-intelligence/pi05_base` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible; la entrada visual consiste en 32 frames de historial de la cámara base, muestreados uniformemente sobre el prefijo observado, con 512 tokens visuales |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; la tarea se especifica mediante un prompt de texto en inglés |
| Licencia | no disponible |
| Formato de pesos | no disponible; el repositorio incluye `params/`, `assets/`, `code/`, `requirements.txt` y `load_model.py` (5,8 GB) |
| Modelo base | `physical-intelligence/pi05_base` |
| Modalidades de entrada | Vistas RGB de cámara base y de muñeca, estado cartesiano medido (Cartesian8) y texto de tarea |
| Salida | Tensor `[20, 8]` de acciones absolutas `[x, y, z, qx, qy, qz, qw, gripper_open]`, en metros y cuaterniones XYZW unitarios; gripper 0 = cerrado, 1 = abierto |
| Horizonte de acción | 20 pasos por inferencia |
| Cabeza Writer / Status | ausente en esta exportación |
| Datos de entrenamiento | 3 trayectorias (episodios 111, 115, 131); subconjunto de comportamiento con 158 ventanas de acción H20; 19 batches completos por época |
| Configuración de entrenamiento | 5.000 actualizaciones del optimizador, batch global 8, 1× RTX A6000, ~263,16 épocas del sampler |
| Revisión del código fuente | `4449f2c621e88d9a1b54f25c950d007708399caa` |

## Arquitectura y entrenamiento

La política es una derivación del modelo π0.5 de Physical Intelligence, una familia VLA que combina percepción visual, instrucción en lenguaje natural y generación de acciones motoras. En este caso concreto, la inicialización parte de `pi05_base` y se añaden proyecciones cartesianas nuevas junto con adaptadores LoRA, de modo que el ajuste se concentra en un subconjunto reducido de parámetros. La exportación elimina las cabezas Writer y Status presentes en la arquitectura original, dejando únicamente el camino de generación de acciones.

El entrenamiento es un experimento de sobreajuste explícito: solo tres trayectorias de la tarea Shuffle, con 158 ventanas de acción H20 en el subconjunto de comportamiento y 19 batches completos por época. Se realizaron 5.000 actualizaciones del optimizador con batch global 8 en una única RTX A6000, lo que equivale a aproximadamente 263,16 épocas del sampler. No se documentan en la información disponible fases de RLHF, DPO ni ningún otro ajuste por preferencias. La normalización conserva las estadísticas originales del split de entrenamiento.

El contrato de entrada es estricto: 32 frames de historial de la cámara base muestreados uniformemente sobre el prefijo observado, más vistas de muñeca, estado cartesiano medido y un texto de tarea fijo ("After the cups are shuffled, press the button next to the cup hiding the cube."). La política requiere historial real observado; la validación offline utiliza características de historial causal almacenadas. Un detalle relevante es que el componente 7 del vector de acción no tiene supervisión de comando conocida en este subconjunto Shuffle, tal como se registra en `assets/policy_metadata.json`; sus predicciones crudas son, por tanto, no supervisadas.

## Capacidades

- Generación de acciones de manipulación robótica: produce bloques de 20 acciones absolutas de 8 dimensiones en metros y cuaterniones unitarios.
- Control de pinza: el componente de apertura/cierre se emite como valor binario (0 = cerrado, 1 = abierto), aunque véase la advertencia sobre el componente 7.
- Condicionamiento por instrucción textual: consume un prompt de tarea en inglés para orientar la política.
- Integración de historial visual: utiliza 32 frames de la cámara base muestreados uniformemente, además de vistas de muñeca.
- Fusión de estado propioceptivo: incorpora estado cartesiano medido (Cartesian8) junto con la percepción visual.
- Ejecución de una tarea concreta de barajado de vasos y pulsación de botón en un brazo Franka, dentro del dominio de las tres trayectorias de entrenamiento.
- Carga programática: el repositorio incluye `load_model.py`, que construye la política y permite ingerir observaciones reales mediante `observe`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso de alto nivel (las cabezas Writer y Status están ausentes).
- No se documentan capacidades multilingües, de visión general, audio, matemáticas, código ni modo de razonamiento extendido.

## Casos de uso

- Verificación de pipelines de carga de políticas VLA: el repositorio incluye `load_model.py` y `requirements.txt`, lo que permite comprobar que el entorno de inferencia construye la política y ejecuta `observe` correctamente antes de invertir tiempo en modelos mayores.
- Prueba de contrato de entrada/salida: sirve para validar que un sistema consumidor espera correctamente un tensor `[20, 8]` de acciones absolutas en metros con cuaterniones XYZW y un valor de pinza binario.
- Referencia superior de sobreajuste: al haber sido entrenado durante ~263 épocas sobre solo tres trayectorias, ofrece una cota artificial de rendimiento sobre datos de entrenamiento útil para comparar con checkpoints entrenados de forma regularizada.
- Depuración de sistemas de historial causal: la validación incluida se apoya en características de historial causal almacenadas, lo que permite probar la lógica de buffering de 32 frames sin necesidad de un robot real.
- Pruebas de regresión de infraestructura: dado su tamaño reducido y su naturaleza de exportación de inferencia, es adecuado como caso de prueba reproducible en CI para detectar roturas en cargadores, serialización de parámetros o gestión de assets.
- Estudio académico sobre generalización en VLA: permite cuantificar la brecha entre rendimiento sobre las trayectorias de entrenamiento (episodios 111, 115 y 131) y el comportamiento fuera de distribución, con una línea base deliberadamente sobreajustada.
- Medición de latencia y consumo en una GPU concreta: al haberse entrenado en una única RTX A6000, resulta un candidato razonable para medir tiempos de inferencia y uso de memoria en hardware equivalente.
- Auditoría del tratamiento de acciones no supervisadas: permite inspeccionar empíricamente qué predice la política en el componente 7, para el que no existe supervisión de comando conocida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente documenta comprobaciones de carga y de salida sobre observaciones de entrenamiento registradas de los tres episodios seleccionados, incluyendo entradas de aproximación y de contacto profundo, con historial causal real (véase `inference-check.json`). El propio autor indica explícitamente que estas comprobaciones no establecen éxito en tarea sobre robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia indirecta, el repositorio completo ocupa 5,8 GB, aunque esa cifra incluye parámetros, assets y código, y no equivale al pico de memoria en ejecución.
- GPU empleada en el entrenamiento: una única RTX A6000 (48 GB de VRAM), según la model card.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, es previsible que el modelo funcione en GPUs de 24 GB o superiores, pero no hay confirmación en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. Las RTX 3090, 4090 (24 GB) o 5090 son candidatas razonables por capacidad de memoria, pero no se documenta ninguna prueba en ellas.
- Opciones de despliegue: el repositorio proporciona `load_model.py` como vía de carga. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que en general no están diseñados para políticas VLA de acción continua.
- Latencia y throughput: no disponibles.
- Nota de despliegue: el modelo requiere historial real observado; la validación offline utiliza características de historial causal almacenadas, lo que condiciona el diseño del bucle de control.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fm-dev/pi05-shuffle-uniform32-overfit3-step5000` | VLA derivada de π0.5 con LoRA y proyecciones cartesianas nuevas | no disponible | 32 frames de historial de cámara base, 512 tokens visuales | no disponible | Pública en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| `physical-intelligence/pi05_base` | VLA π0.5 completa | no disponible en la información recopilada | no disponible | no disponible | Modelo base público en HuggingFace |
| Otras políticas VLA de manipulación (por ejemplo, familias tipo OpenVLA o RDT) | no disponible | no disponible | no disponible | no disponible | no disponible en la información recopilada |

No se dispone de datos verificables en la información proporcionada para establecer comparaciones cuantitativas de parámetros, contexto o rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sobreajuste deliberado: el modelo fue entrenado 5.000 pasos sobre solo tres trayectorias, con ~263,16 épocas del sampler. Su comportamiento fuera de esas trayectorias es impredecible y no cabe esperar generalización.
- Validación insuficiente: las comprobaciones documentadas se limitan a observaciones de entrenamiento registradas. El autor indica explícitamente que no establecen éxito en tarea sobre robot real.
- Acción sin supervisión: el componente 7 del vector de acción no tiene supervisión de comando conocida en el subconjunto Shuffle; sus predicciones son no supervisadas y no deben tratarse como comandos fiables.
- Dependencia de historial real: la política requiere historial observado real. Ejecutarla sin la secuencia correcta de 32 frames de cámara base invalida sus entradas.
- Prompt de tarea fijo: el condicionamiento lingüístico documentado corresponde a una única instrucción de la tarea Shuffle. No se documenta comportamiento correcto con otras instrucciones.
- Ausencia de cabezas Writer y Status: no hay generación de subtareas ni de estado de alto nivel, lo que limita su uso en planificación jerárquica.
- Estado y reanudación no incluidos: es una exportación de inferencia; no contiene estado del optimizador ni puntos de reanudación del entrenamiento.
- Licencia no especificada: al no indicarse licencia, el uso comercial queda sin cobertura legal explícita y debe consultarse con el autor antes de cualquier despliegue productivo.
- Idiomas no especificados: la información no declara idiomas soportados; el único texto documentado está en inglés.
- Sesgos: no disponibles. No se ha publicado ningún análisis de sesgo para este checkpoint.
- Riesgo de alucinación: aplicable en el sentido de generar acciones plausibles pero incorrectas cuando la escena se aleja de las tres trayectorias de entrenamiento.
- Trazabilidad: el modelo referencia la revisión de código fuente `4449f2c621e88d9a1b54f25c950d007708399caa`, dato necesario para reproducir el entorno exacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fm-dev/pi05-shuffle-uniform32-overfit3-step5000
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- Descarga directa: `hf download fm-dev/pi05-shuffle-uniform32-overfit3-step5000 --local-dir ./shuffle-uniform32-step5000`
- Revisión del código fuente asociada: `4449f2c621e88d9a1b54f25c950d007708399caa`
- Paper, blog o repositorio adicionales: no disponible en la información recopilada. Los resultados de la búsqueda web devueltos no guardan relación con el modelo (corresponden a directorios de emisoras de radio en francés).
