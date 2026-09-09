# fm-dev/pi05-pick3-uniform32-lora

## Resumen

fm-dev/pi05-pick3-uniform32-lora es un adaptador LoRA construido sobre el modelo base physical-intelligence/pi05_base, un modelo de visión-lenguaje-acción (VLA) de Physical Intelligence especializado en control robótico. Resuelve una tarea concreta de manipulación: un robot Franka debe recoger un cubo y colocarlo en una placa exactamente tres veces, levantándolo lo suficiente entre colocaciones. El adaptador ha sido entrenado por el autor fm-dev durante 6.250 pasos de optimización con un lote global de 4 en cuatro NVIDIA RTX A6000, lo que equivale a 25.000 ejemplos de entrenamiento.

El modelo incorpora un módulo de historia que proyecta 32 frames uniformemente espaciados de la cámara base como tokens de contexto, además de la imagen de la muñeca y el estado cartesiano del efector. La salida consiste en 20 poses cartesianas absolutas y comandos de pinza. El repositorio incluye pesos EMA, código de inferencia y un evaluador offline, pero no proporciona indicaciones sobre licencia, tamaño total de parámetros ni longitud de contexto explícita.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) basada en π0.5 con adaptación LoRA |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa hasta 32 frames de historia, pero no se especifica la longitud en tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (los pesos se cargan vía `load_model.py` desde la carpeta `params/`) |

## Arquitectura y entrenamiento

El modelo es una adaptación LoRA de π0.5. Las capas LoRA se aplican a los backbones de lenguaje y visión (Gemma 2B y 300M), mientras que las proyecciones cartesianas de salida y los módulos de historia son entrenables. Los backbones preentrenados y los MLPs de tiempo se congelan. La entrada incluye dos imágenes RGB (base y muñeca), el estado de la brida (posición xyz y cuaternión XYZW), la apertura de la pinza medida dividida por 0.08 y el prompt de tarea. La salida son 20 poses cartesianas absolutas y comandos de pinza (0 cerrado, 1 abierto).

El entrenamiento se realizó con AdamW, warmup de 250 pasos y decaimiento coseno de 5e-5 a 5e-6 hasta el paso 6.250, con EMA 0.999^4. El dataset está dividido en 40 episodios de entrenamiento, 5 de validación y 5 de test, con ventanas aceptadas de 12.857, 1.915 y 1.600 ejemplos respectivamente. Se mantienen los filtros de sincronización de 40 ms y el intervalo máximo de 100 ms. El entrenamiento no utiliza acumulación de gradientes y usa un lote global de 4 (uno por GPU).

## Capacidades

- Generación de trayectorias de manipulación: produce secuencias de 20 objetivos absolutos de posición y orientación del efector final, junto con comandos de apertura y cierre de pinza.
- Entrada multi-sensorial: consume imágenes RGB de cámara base y de muñeca, estado cartesiano del efector, apertura de pinza y un prompt textual.
- Módulo de historia visual: condiciona la salida a 32 frames uniformemente espaciados del prefijo observado completo, con 16 tokens espaciales por frame y modulación.
- Precisión en tareas repetitivas: está diseñado específicamente para la tarea de recoger un cubo y colocarlo en una placa exactamente tres veces, levantándolo entre colocaciones.
- Evaluación offline: incluye un evaluador en `code/integrations/robomme/franka_release.py` que calcula errores de componentes conocidos a partir de características en caché.
- No soporta tool calling, ni agentes, ni razonamiento de propósito general: se trata de un modelo de política robótica, no de un modelo conversacional.

## Casos de uso

- Control de un robot Franka en tareas de pick-and-place repetitivo: el modelo genera comandos de 20 pasos para recoger un cubo y colocarlo en una placa tres veces, adecuado para entornos de laboratorio donde la repetición exacta es obligatoria.
- Evaluación offline de políticas de manipulación: el repositorio incluye un evaluador que calcula errores de componentes conocidos, permitiendo comparar adaptadores LoRA sin necesidad de desplegar el robot.
- Investigación en modelos de visión-lenguaje-acción: sirve como referencia para estudiar cómo el historial visual uniforme (32 frames) afecta al rendimiento en tareas de manipulación.
- Entrenamiento de políticas con datos de demostración recogidos por teleoperación: el pipeline de entrenamiento acepta muestras con normalización STD y particiones de ventanas de episodio.
- Benchmarking de adaptadores LoRA en tareas de un solo brazo: permite comparar configuraciones de ajuste fino (por ejemplo, uniform32 frente a otras variantes) sobre el mismo modelo base π0.5.
- Integración en sistemas de robótica con cámaras de base y de muñeca: el modelo puede usar dos perspectivas visuales simultáneas para mejorar la precisión en el agarre y la colocación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que existe un informe de evaluación offline, pero no se aportan valores numéricos. La evaluación reporta errores de componentes conocidos, no tasas de éxito de robot, y las métricas sin etiquetas conocidas se marcan como null, no como cero.

## Requisitos de hardware

- Entrenamiento realizado en 4x NVIDIA RTX A6000, cada una con 48 GB de VRAM, con lote 1 por GPU y lote global 4.
- Para inferencia no se especifican requisitos explícitos; se necesita un entorno CUDA 12 con Python 3.10.
- El repositorio tiene un tamaño de 12.8 GB, que incluye pesos EMA, estado del optimizador y código fuente.
- No se indican opciones de despliegue mediante vLLM, llama.cpp u otras herramientas; el modelo se carga con `load_model.py` y se usa a través de la API `policy.infer()`.
- Latencia y throughput no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos suficientes para establecer una comparativa con otros modelos de la misma categoría. El modelo base physical-intelligence/pi05_base es la referencia sobre la que se construye este adaptador, pero no se han publicado métricas comparables para la tarea específica de pick3 con historia uniform32.

## Limitaciones y advertencias

- El modelo está especializado en una tarea concreta (recoger un cubo y colocarlo en una placa exactamente tres veces) y no es un modelo de propósito general.
- La evaluación incluida reporta errores offline de componentes, no tasas de éxito reales del robot; las métricas no deben interpretarse como medidas de rendimiento en entornos reales.
- El control del robot requiere utilizar el mismo marco cartesiano y la misma convención de herramienta que los datos de entrenamiento; en caso contrario, el comportamiento será incorrecto.
- No se especifica licencia, lo que impide determinar si el uso comercial está permitido.
- El repositorio no incluye imágenes de demostración ni datos privados del workspace, lo que limita la reproducibilidad completa del entrenamiento.
- El modelo puede no generalizar a objetos, condiciones de iluminación o configuraciones de robot diferentes a las del dataset de entrenamiento.
- No ofrece soporte para razonamiento de propósito general, tool calling ni agentes.

## Enlaces

- https://huggingface.co/fm-dev/pi05-pick3-uniform32-lora
- https://huggingface.co/physical-intelligence/pi05_base
