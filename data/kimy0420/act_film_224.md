# kimy0420/act_film_224

## Resumen

El modelo `act_film_224` es una política de imitación basada en ACT (Action Chunking Transformer) desarrollada por el autor `kimy0420` para el control de un brazo robótico OpenManipulator-X. Su objetivo es resolver una tarea específica: identificar y recoger un único pastilla de un color determinado (entre amarillo, rojo y verde) de un conjunto de pastillas mezcladas y depositarla en un contenedor, todo ello sin usar un detector externo de colores, sino que la propia política localiza el color en las imágenes de las cámaras.

El modelo incorpora un mecanismo de condicionamiento por objetivos mediante FiLM (Feature-wise Linear Modulation), que modula todas las características visuales en función de un vector one-hot tridimensional que indica el color objetivo. Según el autor, esta vía de inyección del objetivo es crítica: una versión previa que concatenaba el one-hot como una observación más ignoraba por completo el objetivo (contraste de color propio de 1.00), mientras que con FiLM el mismo modelo y los mismos datos logran un contraste de 1.25 y un éxito real de 3/3 en pruebas consecutivas. El modelo fue entrenado con 128,000 pasos y batch de 8, y se distribuye bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con condicionamiento FiLM, chunk de 100 pasos y temporal ensembling |
| Parametros totales | 52.198.534 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; procesa imágenes y articulaciones) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robótica, sin procesamiento de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT (Action Chunking Transformer), que predice secuencias de acciones de longitud fija (chunk de 100) y emplea temporal ensembling para suavizar las predicciones durante la ejecución. La observación se compone de dos cámaras (superior y muñeca) a resolución 640×480, las articulaciones del brazo (6 grados de libertad) y un vector one-hot de 3 dimensiones que codifica el color objetivo (amarillo, rojo, verde). La innovación principal es el uso de FiLM para condicionar el objetivo: se extraen parámetros γ y β de la representación del objetivo y se aplican a todas las características visuales mediante `f' = (1 + γ)·f + β`, forzando que el objetivo influya en toda la red. El entrenamiento se realizó con 128,000 pasos, batch de 8, y el checkpoint seleccionado es el 100000. El dataset de entrenamiento es `kimy0420/pill_v3_onehot_224`. No se aplicaron técnicas de refuerzo con feedback humano (RLHF) ni aumentación de color, ya que el autor observó que la aumentación de brillo o contraste degradaba la señal necesaria para la discriminación de colores.

## Capacidades

- Selección de objetos por color: identifica y manipula pastillas de un color específico (amarillo, rojo o verde) entre varias mezcladas, sin detector externo.
- Condicionamiento por objetivo robusto: mediante FiLM, el objetivo modula todas las características visuales, evitando que se ignore.
- Ejecución en bucle cerrado: predice acciones en cada paso de control, corrigiendo errores en tiempo real.
- Predicción de acciones a largo plazo: genera chunks de 100 acciones, lo que permite movimientos suaves y coordinados.
- Entrenamiento por imitación: aprende de demostraciones, sin necesidad de programación manual de trayectorias.
- Integración con LeRobot: utiliza la librería LeRobot para carga y ejecución de políticas.

## Casos de uso

- **Clasificación de pastillas en farmacia**: el modelo puede separar pastillas de colores distintos en contenedores individuales, reduciendo errores humanos en la dispensación de medicamentos.
- **Manipulación selectiva en líneas de ensamblaje**: en un entorno industrial con piezas de colores variados, el robot puede recoger solo las piezas de un color determinado y colocarlas en una cinta transportadora.
- **Automatización de control de calidad**: inspecciona y retira productos defectuosos que presenten un color no deseado (p. ej., piezas con decoloración) de una línea de producción.
- **Entrenamiento de habilidades robóticas**: sirve como ejemplo de cómo el condicionamiento por objetivos mejora el rendimiento en tareas de manipulación visual, útil para investigadores en aprendizaje por imitación.
- **Pruebas de robustez en visión**: al no usar un detector externo, el modelo demuestra que la política puede aprender a localizar el objetivo directamente desde la imagen, lo que simplifica la integración en sistemas embebidos.
- **Investigación en arquitecturas de condicionamiento**: el uso de FiLM para inyectar objetivos es un caso de estudio para comparar con métodos de concatenación de observaciones, y puede servir como referencia en experimentos de aprendizaje por refuerzo.

## Benchmarks y rendimiento

El modelo no ha sido evaluado en benchmarks estándar de NLP o visión, ya que su dominio es la robótica. El autor proporciona una métrica de "contraste propio" (self-color contrast) que mide la diferencia de probabilidad entre el color objetivo y los otros colores. En la model card se indica:

| Métrica | Valor |
|---|---|
| Contraste propio (offline) | 1.25 (baseline: 1.02) |
| Éxito en prueba real (3 colores consecutivos) | 3/3 (2026-08-14) |

El autor advierte que los indicadores offline (bucle abierto) no son fiables: una predicción por frame no refleja el rendimiento en bucle cerrado, donde el sistema se autocorrige y amplifica señales débiles. Por tanto, el rendimiento real debe evaluarse en ejecución continua.

## Requisitos de hardware

- **VRAM estimada**: no se proporcionan datos oficiales. Con 52 millones de parámetros, el modelo es ligero y cabe en GPUs con más de 2 GB de VRAM, pero al ser un sistema robótico requiere además procesamiento de imágenes de dos cámaras.
- **GPU recomendadas**: no se indica ninguna específica. Para inferencia en tiempo real, se recomienda al menos una GPU de gama media (por ejemplo, RTX 3060 o superior), aunque en un entorno embebido podría ejecutarse en CPU con menor frecuencia.
- **Compatibilidad con consumer GPU**: sí, es viable en GPUs de consumo común.
- **Opciones de despliegue**: se integra con la librería LeRobot, que permite ejecutar el modelo en un sistema con cámaras y control del brazo. No se mencionan vLLM, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no se han publicado datos. La inferencia depende del hardware y de la resolución de las cámaras (640×480).

## Comparativa con modelos similares

El autor menciona otros dos modelos de su autoría para la misma tarea de clasificación de pastillas, con distintas formas de condicionamiento:

| Modelo | Objetivo | Quién encuentra el color | Resultado real |
|---|---|---|---|
| `act_xy_224` | Coordenadas de pantalla | Detector HSV externo | No se reporta |
| `smolvla_v10` | Coordenadas en observación | Detector HSV externo | No se reporta |
| `act_film_224` | One-hot + FiLM | La propia política | 3/3 en 3 colores consecutivos |

El modelo `act_film_224` se diferencia por eliminar el detector externo y depender exclusivamente de la política, lo que simplifica el sistema y reduce dependencias. Los otros dos modelos requieren un detector HSV para obtener las coordenadas del objeto objetivo, mientras que el modelo actual infiere el color directamente de las imágenes.

## Limitaciones y advertencias

- **Número fijo de colores**: el modelo solo funciona con los tres colores entrenados (amarillo, rojo, verde). Añadir un nuevo color requiere reentrenamiento completo con un one-hot de mayor dimensionalidad.
- **Sensibilidad a la iluminación**: no se utilizó aumentación de color (brillo, contraste) durante el entrenamiento, por lo que cambios bruscos de iluminación pueden degradar el rendimiento.
- **Rendimiento offline engañoso**: la métrica de contraste propio (1.25) es solo ligeramente superior a la línea base (1.02), lo que sugiere que el modelo podría ignorar el objetivo en una evaluación estática; solo el bucle cerrado muestra el éxito real.
- **Dominio específico**: el modelo está entrenado para un brazo OpenManipulator-X y una configuración de cámaras determinada; no es transferible directamente a otros robots sin reentrenamiento.
- **Riesgo de fallos en producción**: aunque el autor reporta 3/3 en pruebas consecutivas, no se mencionan pruebas con mayor número de ensayos ni variaciones de la escena (por ejemplo, objetos parcialmente ocluidos).
- **Licencia Apache-2.0**: permite uso comercial, pero es responsabilidad del usuario asegurar que el sistema cumple con las normativas aplicables en entornos médicos o industriales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/kimy0420/act_film_224)
- [Dataset de entrenamiento](https://huggingface.co/datasets/kimy0420/pill_v3_onehot_224)
- [Modelo relacionado `act_xy_224`](https://huggingface.co/kimy0420/act_xy_224)
- [Modelo relacionado `smolvla_v10`](https://huggingface.co/kimy0420/smolvla_v10)
- [Página del autor `kimy0420`](https://huggingface.co/kimy0420)
