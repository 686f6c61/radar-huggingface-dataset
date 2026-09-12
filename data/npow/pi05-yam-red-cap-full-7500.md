# npow/pi05-yam-red-cap-full-7500

## Resumen

pi05-yam-red-cap-full-7500 es un ajuste fino completo (full fine-tune) del checkpoint base oficial pi0.5 de Physical Intelligence, publicado por el usuario npow. El modelo resultante es una política vision-language-action (VLA) especializada en una única tarea de manipulación robótica de sobremesa: coger un tapón rojo y colocarlo en una caja negra. Está entrenado sobre un robot YAM con interfaz GELLO y un solo brazo activo.

El interés de esta ficha es acotado pero representativo: muestra el flujo de trabajo completo de OpenPI sobre hardware de bajo coste, incluyendo dataset público de 100 demostraciones, conversión de trayectorias a 15 Hz, transformaciones específicas de embodiment y un contrato de despliegue concreto (`yam-single`) a través de Servo. No se trata de un modelo de propósito general ni de un checkpoint reutilizable fuera de su configuración exacta de cámara, estado y acciones.

El repositorio ocupa 12,4 GB y se distribuye como checkpoint JAX/Orbax, no como pesos safetensors ni GGUF, por lo que no es cargable con `AutoModel.from_pretrained`. Corresponde al paso de entrenamiento 7.500 y está liberado bajo licencia Apache 2.0. No se han publicado cifras de parámetros, contexto ni benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en pi0.5; implementación JAX/Orbax sobre OpenPI |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye como checkpoint JAX/Orbax sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (el prompt de entrenamiento está en inglés: `pick up the red cap and place it in the black box`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint JAX/Orbax de OpenPI (no safetensors, no GGUF, no Transformers) |
| Dimension de estado/accion del tensor | 32 (OpenPI rellena las 7 dimensiones físicas) |
| Acciones físicas por paso | 7 (6 articulaciones del brazo + 1 pinza) |
| Chunk de acciones | 15 x 7 (un segundo a 15 Hz) |
| Camaras | 3 vistas RGB: `middle -> base_0_rgb`, `left -> left_wrist_0_rgb`, `right -> right_wrist_0_rgb` |
| Convencion de pinza | 0 = cerrada, 1 = abierta (convención nativa YAM/Servo; el transform invierte a la convención pi0.5 y la revierte a la salida) |
| Tamano del repositorio | 12,4 GB |
| Paso de entrenamiento | 7.500 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo del checkpoint base oficial `gs://openpi-assets/checkpoints/pi05_base/params`, sin LoRA y sin pesos congelados. La configuración utilizada es `Pi0Config(pi05=True, action_dim=32, action_horizon=15)`, con batch size 32, decaimiento coseno de la tasa de aprendizaje (500 pasos de warm-up, pico de 2,5e-5 y valor final de 2,5e-6 a los 10.000 pasos), EMA desactivado y semilla 42. La inicialización parte exclusivamente del checkpoint base pi0.5. Las estadísticas de normalización del split de entrenamiento convertido se incluyen en `assets/`.

Los datos proceden del dataset público `npow/yam-gello-red-cap-100`, con 100 demostraciones y tres streams de cámara sincronizados. La conversión remuestreó las marcas de tiempo a 15 Hz, seleccionó las dimensiones del brazo izquierdo activo y aplicó un split determinista por episodio: 90 episodios (17.564 fotogramas) para entrenamiento y 10 episodios (1.993 fotogramas) reservados, con IDs de origen 6, 16, 26, 36, 46, 56, 66, 76, 86 y 96. El transform de YAM invierte la pinza a la convención del modelo antes de la normalización y la revierte a la salida; los canales de articulación 0 a 5 se entrenan como deltas, mientras que el canal de la pinza permanece absoluto. La interfaz de política de 7 dimensiones es neutral respecto al lado: es el binding de despliegue, y no el checkpoint, el que decide si controla el brazo izquierdo o el derecho.

## Capacidades

- Generación de acciones de manipulación robótica: produce chunks de 15 x 7 acciones (un segundo a 15 Hz) a partir de observaciones multimodales.
- Percepción visual multimodal: consume tres vistas RGB simultáneas (cámara frontal/base y dos muñecas).
- Ejecución de una tarea específica de recogida y colocación: coger un tapón rojo y depositarlo en una caja negra.
- Control de brazo de 6 grados de libertad más pinza, con articulaciones en modo delta y pinza en modo absoluto.
- Integración con el contrato `yam-single` de Servo para despliegue en robot real, con roles de cámara `top`, `left` y `right`.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso textual, capacidades multilingües ni modo de pensamiento, ya que se trata de una política de robótica y no de un modelo conversacional.

## Casos de uso

- Automatización de una celda de pick-and-place: el modelo recoge un tapón rojo y lo deposita en una caja negra sobre una mesa, usando sus tres vistas RGB y su chunk de 15 acciones para generar trayectorias suaves a 15 Hz.
- Base para ajustes finos propios con OpenPI: al ser un fine-tune completo sobre pi0.5, sirve como punto de partida reproducible para adaptar la política a otras tareas del mismo robot YAM/GELLO, reutilizando el converter y los transforms del ejemplo `examples/yam`.
- Validación de pipelines de datos robóticos: el dataset asociado (100 demostraciones, tres cámaras sincronizadas, split determinista) permite reproducir el flujo completo de conversión a 15 Hz, normalización y entrenamiento como referencia metodológica.
- Investigación en evaluación de políticas VLA con conjunto reservado: los 10 episodios held-out con IDs concretos permiten medir generalización dentro de la misma distribución de tarea y configuración.
- Despliegue en robot de bajo coste con Servo: el comando `servo serve pi0.5 --embodiment yam-single --checkpoint ...` permite levantar la política contra un binding de robot concreto, útil para prototipos de laboratorio.
- Pruebas de robustez de contratos de embodiment: al ser una interfaz neutra respecto al brazo, resulta adecuado para verificar que el binding izquierdo/derecho, el orden de cámaras y la semántica de la pinza se implementan correctamente antes de escalar a otras tareas.
- Docencia y demostraciones de VLA: el tamaño del repositorio (12,4 GB), la licencia Apache 2.0 y la existencia de un dataset público lo hacen utilizable en cursos o talleres sobre manipulación robótica aprendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de éxito en el conjunto reservado, ni métricas de error de seguimiento de trayectoria, ni comparaciones cuantitativas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio de pesos ocupa 12,4 GB; el consumo real dependerá de la precisión efectiva de los pesos y de si se cargan estadísticas de normalización y buffers auxiliares, por lo que conviene reservar margen adicional sobre esa cifra.
- GPU recomendadas: no especificadas por el autor. Dado el tamaño del checkpoint, se requiere una GPU con memoria suficiente para alojar el modelo completo; no se documentan modelos concretos (A100, H100, RTX 4090 u otros) en la información disponible.
- Compatibilidad con GPU de consumo: no confirmada. No hay datos publicados sobre ejecución en RTX 4090, RTX 3090 u otras tarjetas de gama consumer.
- Opciones de despliegue: OpenPI con backend JAX para carga y servicio del checkpoint, y Servo mediante `servo serve pi0.5 --embodiment yam-single --checkpoint ...`. La descarga se realiza con `hf download npow/pi05-yam-red-cap-full-7500 --local-dir ./pi05-yam-red-cap-full-7500`. No es compatible con `AutoModel.from_pretrained`, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El modelo está diseñado para producir un chunk de 15 acciones equivalente a un segundo a 15 Hz, pero no se publican tiempos de inferencia ni frecuencia de control efectiva alcanzable.
- Requisitos adicionales en robot real: límites independientes de articulación, velocidad y espacio de trabajo; comportamiento de timeout con retención de posición; controlador de retención del brazo inactivo; primeras ejecuciones a velocidad reducida y parada de emergencia accesible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-yam-red-cap-full-7500 | no disponible | no disponible | no disponible (sin benchmarks publicados) | Apache 2.0 | HuggingFace, checkpoint JAX/Orbax de 12,4 GB |
| pi0.5 base (Physical Intelligence) | no disponible en la información proporcionada | no disponible | no disponible | no disponible en la información proporcionada | Distribuido como assets de OpenPI (`gs://openpi-assets/checkpoints/pi05_base/params`); es la base de este ajuste |
| Otras políticas VLA de manipulación (por ejemplo, alternativas tipo OpenVLA) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

La comparación cuantitativa no es posible con los datos disponibles: no se han publicado cifras de parámetros, contexto ni benchmarks de este checkpoint ni de su base en la información proporcionada. La diferencia funcional verificable frente a pi0.5 base es el alcance: el base es una política generalista, mientras que este fine-tune está especializado en una única tarea, un único montaje de robot y una única disposición de cámaras.

## Limitaciones y advertencias

- Especialización extrema: el checkpoint está ajustado a una tarea de sobremesa, un montaje de robot, una disposición de cámaras y un conjunto de 100 demostraciones. No debe tratarse como una política de manipulación de propósito general.
- Dependencia estricta de la configuración: el rol y orden de las cámaras, el orden del estado, la frecuencia de acción, las estadísticas de normalización y la semántica de la pinza deben coincidir exactamente con el entrenamiento; cualquier desviación invalida el comportamiento.
- Riesgo de sobreajuste: 90 episodios y 17.564 fotogramas de entrenamiento constituyen un conjunto pequeño, con 10 episodios reservados, lo que limita la generalización fuera de la distribución observada.
- Convención de pinza invertida: el transform de YAM invierte la pinza a la convención del modelo antes de normalizar y la revierte a la salida; una implementación incorrecta de este paso produce acciones erróneas sobre el efector final.
- Brazo inactivo: al ser una interfaz neutra respecto al lado, la selección de brazo corresponde al binding de despliegue; el brazo no utilizado debe ser retenido por el controlador del robot.
- El modelo no es un controlador de seguridad: la ejecución real exige límites independientes de articulación, velocidad y espacio de trabajo, comportamiento de timeout con retención, un controlador de retención del brazo inactivo, primeras ejecuciones a velocidad reducida y una parada de emergencia alcanzable.
- Sin datos publicados sobre sesgos, tasas de alucinación (entendida aquí como acciones no válidas fuera de distribución), rendimiento en el conjunto reservado ni comportamiento multilingüe.
- Licencia Apache 2.0: permite uso comercial según los términos de dicha licencia, pero la información disponible no incluye aclaraciones adicionales del autor sobre responsabilidad en entornos de producción.
- Formato no estándar: al ser un checkpoint JAX/Orbax, no es utilizable con el ecosistema Transformers, vLLM, llama.cpp ni Ollama, lo que restringe su integración a OpenPI y Servo.
- Compatibilidad de hardware no verificada: no hay datos publicados sobre VRAM mínima, GPU soportadas ni latencia, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/npow/pi05-yam-red-cap-full-7500
- Dataset de entrenamiento: https://huggingface.co/datasets/npow/yam-gello-red-cap-100
- Rama de ajuste fino de OpenPI: https://github.com/npow/openpi/tree/feat/yam-redcap-finetune
- Ejemplo YAM (converter, transforms y configuración de entrenamiento): https://github.com/npow/openpi/tree/feat/yam-redcap-finetune/examples/yam
- Checkpoint base de pi0.5: `gs://openpi-assets/checkpoints/pi05_base/params`
- Commit base de OpenPI: `215abfb217dbac7d5f1273282331b9b1866c0479`
- Commit del pipeline de ajuste fino de YAM: `8539331ec241dfa3b232fc792115548348567bc5`
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a documentación de Windows File Explorer y no guardan relación con esta ficha.
