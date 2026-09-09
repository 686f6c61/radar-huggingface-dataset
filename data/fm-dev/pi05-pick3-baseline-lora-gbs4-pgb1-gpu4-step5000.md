# fm-dev/pi05-pick3-baseline-lora-gbs4-pgb1-gpu4-step5000

## Resumen

π0.5 (también escrito pi05) es un modelo de robótica desarrollado por Physical Intelligence que integra visión y lenguaje para generar acciones de control de robots. Se trata de un modelo Vision-Language-Action (VLA) que, a partir de imágenes de cámara, estado del robot y una instrucción en texto, produce secuencias de poses objetivo para el efector final. Esta implementación concreta es una adaptación LoRA Cartesiana8 del modelo base physical-intelligence/pi05_base, creada por el usuario fm-dev para una tarea específica de manipulación: recoger un cubo y colocarlo sobre un plato exactamente tres veces, levantándolo entre colocaciones.

El modelo ha sido entrenado en cuatro NVIDIA RTX A6000 durante 5.000 actualizaciones de optimizador, lo que equivale a 20.000 ejemplos de entrenamiento con un tamaño de lote global de 4. El entrenamiento continúa hasta las 6.250 actualizaciones previstas (25.000 ejemplos), por lo que este checkpoint es una subida intermedia. El modelo card indica explícitamente que no se reclama ninguna evaluación de calidad de política para esta versión intermedia.

El repositorio incluye los pesos EMA de servicio completos, activos de normalización e historial, el código fuente de inferencia y las versiones exactas de dependencias instaladas. El directorio resume_state/ contiene el optimizador completo, los parámetros no-EMA, el estado del generador de números aleatorios y el cursor de muestreo, mientras que params/ contiene los pesos EMA de servicio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | π0.5 (Pi0.5) con adaptación LoRA Cartesiana8 |
| Parámetros totales | no disponible (el repositorio total pesa 11,5 GB, incluyendo estado de optimizador) |
| Longitud de contexto | 128 tokens máximo para el estado actual; contexto de lenguaje no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (prompts de tarea documentados en inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible (los pesos de servicio están en params/ y el estado de reanudación en resume_state/) |

## Arquitectura y entrenamiento

El modelo es una adaptación LoRA Cartesiana8 de π0.5, un modelo VLA (Vision-Language-Action) de Physical Intelligence. La adaptación aplica LoRA sobre dos componentes: el modelo de lenguaje Gemma-2B y un componente de visión de 300M. Las proyecciones Cartesianas y los módulos de historial opcionales son entrenables con inicialización nueva, mientras que los backbones preentrenados y los MLPs de tiempo permanecen congelados.

El entrenamiento se realizó en cuatro NVIDIA RTX A6000 con el optimizador AdamW, un tamaño de lote global de 4 (un ejemplo por GPU, sin acumulación de gradiente), un calentamiento de 250 pasos y un programa de aprendizaje coseno de 5e-5 a 5e-6 hasta el paso 6.250. Se utiliza un decaimiento EMA de 0,999^4 = 0,996005996001 para preservar la escala temporal de suavizado por muestra de referencia. Los checkpoints se guardan en los pasos 5.000 y 6.250.

La tarea concreta se describe mediante el prompt: "Pick up the cube and place it on the plate exactly three times, lifting it clear between placements." Los datos de entrenamiento se dividen en 40 episodios de entrenamiento, 5 de validación y 5 de prueba, con ventanas aceptadas de 12.857, 1.915 y 1.600 ejemplos respectivamente. Se conservan los filtros originales de sincronización de 40 ms y de separación máxima de 100 ms.

La entrada del modelo incluye: imagen RGB de cámara base, imagen RGB de cámara de muñeca, estado actual del flange (xyz + cuaternión XYZW), apertura medida del dedo dividida por 0,08 y texto de la tarea. La salida consiste en 20 poses objetivo absolutas del flange y comandos de gripper (0 = cerrado, 1 = abierto). Los tokens de estado actual usan una vista acotada q01/q99 separada del entrenamiento, con un máximo de 128 tokens.

## Capacidades

- Generación de secuencias de acciones de robot: 20 poses objetivo absolutas por inferencia, incluyendo comandos de gripper.
- Manipulación de objetos: tarea de pick-and-place con cubos sobre placas, con levantamiento entre colocaciones.
- Entrada multimodal: combina imágenes RGB de cámara base y muñeca, estado del robot (posición, orientación, apertura del gripper) y texto descriptivo de la tarea.
- Salida cartesiana de 8 dimensiones por acción: posición (3), orientación en cuaternión (4) y comando de gripper (1).
- Adaptación LoRA: permite ajuste fino eficiente sobre el modelo base π0.5, conservando los backbones congelados.
- Soporte de historial: el modelo con historial puede procesar observaciones de frames anteriores mediante el método observe(), acumulando hasta 128 tokens de estado.
- Normalización específica del dataset: el estado numérico y las acciones utilizan normalización estándar calculada solo con datos de entrenamiento.
- Evaluación offline: el evaluador incluido permite medir errores de componentes conocidos sin desplegar el robot en el mundo real.

## Casos de uso

- Control de brazos robóticos Franka en laboratorio: el modelo está entrenado para la convención de marco y herramienta específica de Franka, por lo que puede desplegarse directamente en este tipo de brazos para tareas de pick-and-place, siempre que se mantengan las mismas convenciones de marco Cartesian que en los datos de entrenamiento.

- Investigación en políticas robóticas: al ser un checkpoint LoRA sobre π0.5, sirve como referencia para estudiar cómo las adaptaciones de bajo rango se comportan en tareas de manipulación concretas. Los investigadores pueden comparar este checkpoint intermedio con el checkpoint final de 6.250 pasos para analizar la evolución del entrenamiento.

- Evaluación offline de control robótico: el evaluador en code/integrations/robomme/franka_release.py permite medir errores de componentes conocidos sin ejecutar el robot, útil para validar cambios de entrenamiento en entornos de simulación o con datos cacheados.

- Ajuste fino para variaciones de tarea: la arquitectura LoRA permite continuar el entrenamiento desde este checkpoint para adaptar la política a nuevas tareas de manipulación sin reentrenar el modelo base completo. El directorio resume_state/ contiene el estado completo del optimizador para reanudar el entrenamiento.

- Benchmark de aprendizaje por imitación: los datos de entrenamiento con 40 episodios de demostración y ventanas de 12.857 ejemplos permiten comparar configuraciones de entrenamiento (batch size, tasa de aprendizaje, decaimiento EMA) en la tarea de pick-and-place.

- Control basado en visión: al integrar imágenes de cámara base y de muñeca, el modelo puede operar en entornos donde la posición del objeto no se conoce de antemano, confiando en la información visual para localizar el cubo y la placa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card indica explícitamente que "no se reclama ninguna evaluación de calidad de política para esta subida intermedia". Además, aclara que "las métricas con etiquetas desconocidas son null, no cero" y que "la evaluación reporta errores offline de componentes conocidos, no tasas de éxito de robots".

## Requisitos de hardware

- Entrenamiento: 4× NVIDIA RTX A6000 (48 GB de VRAM cada una), con un ejemplo por GPU y sin acumulación de gradiente.
- Inferencia: se requiere un entorno GPU con CUDA 12 y Python 3.10.
- Tamaño del repositorio: 11,5 GB, incluyendo pesos de servicio, estado de reanudación y código fuente.
- VRAM estimada para inferencia: no disponible en la información proporcionada.
- Despliegue: se proporciona el script load_model.py con funciones load() y observe() para cargar el modelo y ejecutar inferencia.
- Compatibilidad con GPU de consumo: no especificada en la información disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La única referencia directa es el modelo base physical-intelligence/pi05_base, del cual esta adaptación LoRA es una variante. No se proporcionan comparaciones con otras implementaciones de π0.5 ni con otros modelos VLA.

| Modelo | Relación | Diferencias conocidas |
|---|---|---|
| physical-intelligence/pi05_base | Modelo base | Este checkpoint es una adaptación LoRA Cartesiana8 entrenada en un subconjunto de tareas de pick-and-place |
| Otras variantes π0.5 | no disponible | No se especifican en la información del modelo |

## Limitaciones y advertencias

- Checkpoint intermedio sin evaluación: el autor declara que no se ha realizado ninguna evaluación de calidad de política para esta subida de 5.000 pasos.
- Métricas null, no cero: las métricas con etiquetas desconocidas se representan como null, no como cero, lo que puede afectar a la interpretación de resultados.
- Evaluación offline limitada: los errores reportados son de componentes conocidos en evaluación offline, no tasas de éxito reales en robots.
- Convención de marco obligatoria: el control del robot debe utilizar el mismo marco Cartesian y la misma convención de herramienta que los datos de entrenamiento.
- Normalización solo de entrenamiento: el estado numérico y las acciones requieren normalización STD calculada exclusivamente con datos de entrenamiento; en inferencia se debe aplicar la misma normalización.
- Dependencia de bordes Joy: los comandos de gripper requieren bordes Joy de velocidad completa guardados que coincidan con las solicitudes del servidor y los límites de reloj.
- Objetivos desconocidos enmascarados: los objetivos desconocidos son NaN/false en disco y se enmascaran tanto en el flujo de condicionamiento como en la pérdida.
- Sin datos de demostración: el paquete no incluye imágenes de demostración ni evidencia privada del espacio de trabajo.
- Licencia no disponible: al no estar especificada la licencia, no se pueden determinar las restricciones para uso comercial o redistribución.
- Tarea limitada: el modelo está entrenado para una tarea concreta (recoger cubo y colocarlo en plato tres veces), por lo que su generalización a otras tareas no está garantizada.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/fm-dev/pi05-pick3-baseline-lora-gbs4-pgb1-gpu4-step5000
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
