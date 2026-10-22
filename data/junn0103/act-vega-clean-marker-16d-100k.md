# junn0103/act-vega-clean-marker-16d-100k

## Resumen

`act-vega-clean-marker-16d-100k` no es un modelo de lenguaje, sino una política de manipulación robótica: un ACT (Action Chunking Transformer) entrenado desde cero con la implementación de lerobot 0.6.1 para una única tarea de barrido y limpieza de un tablero (*clean_marker*) con un robot bimanual Dexmate Vega equipado con manos Robotera XHand. Lo publica el usuario junn0103 con licencia Apache-2.0 y 51.637.904 parámetros (~0,2 GB en safetensors).

La política consume el estado articular absoluto de 16 dimensiones (7 articulaciones por brazo más dos valores de pinza) y tres cámaras (`head`, `wrist_left`, `wrist_right`) a 320x240, y devuelve bloques de 50 acciones de 16 dimensiones a 30 Hz, es decir, aproximadamente 1,7 s de trayectoria por inferencia. Al trabajar en espacio articular absoluto no requiere cinemática directa ni inversa en el bucle de control.

Su interés es doble: sirve como línea base reproducible de ACT bimanual sobre un conjunto de datos pequeño (58 episodios, 56.799 fotogramas) y como ejemplo de despliegue directo con lerobot. No se han publicado evaluaciones de tasa de éxito ni benchmarks, y el repositorio no registra descargas ni valoraciones, por lo que debe tratarse como un experimento preliminar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con codificador visual ResNet18, `dim_model` 512 y VAE latente (kl 10) |
| Parámetros totales | 51.637.904 (~51,6 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política de imitación: una observación por paso, sin historial de texto); horizonte de acción de 50 pasos (~1,7 s a 30 Hz) |
| Tipos de cuantización | No se documentan variantes cuantizadas; el repositorio solo publica safetensors |
| Idiomas soportados | No disponible; no procesa lenguaje y ACT no utiliza el *task prompt* |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato de lerobot) |
| Entrada | `observation.state` [16] = L_arm_j1..7, R_arm_j1..7, L_gripper, R_gripper (valores absolutos, pinza 0..1) + 3 imágenes (`head`, `wrist_left`, `wrist_right`) a 320x240 |
| Salida | Chunk de 50 acciones de 16 dimensiones en espacio articular absoluto |
| Frecuencia de control | 30 Hz |
| Chunk / `n_action_steps` | 50 / 50 |
| Conjunto de datos | 58 episodios, 56.799 fotogramas (≈31,6 min de datos a 30 Hz), export `vega_clean_marker_58_d19` |
| Entrenamiento | 100.000 pasos, batch 16 (~28 épocas), desde cero, sin preentrenamiento |
| Hardware de entrenamiento | Una GPU B300, 5,2 h (2026-10-21) |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder con un VAE condicional: un backbone ResNet18 compartido extrae características de cada una de las tres vistas, que se concatenan con el vector de estado de 16 dimensiones y con la latente del VAE antes de entrar en el transformer de 512 dimensiones. La cabeza de acciones predice directamente 50 pasos de 16 dimensiones (chunking), lo que reduce el error de acumulación típico de las políticas paso a paso y permite ejecutar 50 comandos por cada inferencia. La formulación estándar de ACT combina una pérdida de reconstrucción L1 sobre la acción con un término KL (peso 10) sobre la latente, y no utiliza el *task prompt*.

El entrenamiento parte de cero, con los valores por defecto de lerobot 0.6.1 (`dim_model` 512, lr 1e-5, kl 10) y 100.000 pasos con batch 16 sobre los 56.799 fotogramas del dataset, lo que equivale a unas 28 épocas. Las imágenes se reencodean de 640x480 a 320x240 y los flujos de profundidad y de la cámara `head_cam_right` se descartan. La curva de pérdida descendió de 10,2 en el paso 100 a 0,24 (5k), 0,083 (20k) y 0,038 (100k), con una tendencia todavía descendente en el momento de publicar, lo que sugiere que el modelo no está completamente convergido. No hay RLHF ni DPO: es aprendizaje por imitación supervisado sobre demostraciones.

## Capacidades

- Generación de comandos articulares absolutos de 16 dimensiones (7 + 7 articulaciones de brazo y 2 valores de pinza colapsados a 1-D) a partir de tres vistas de cámara.
- Predicción por chunks de 50 acciones, ejecutables a 30 Hz durante aproximadamente 1,7 s por inferencia.
- Control bimanual coordinado sobre Dexmate Vega con manos XHand para la tarea concreta de limpiar o barrer un tablero.
- Control en espacio articular absoluto, sin necesidad de cinemática directa o inversa en el bucle.
- Fusión multimodal de tres cámaras (cabeza y una por muñeca) con el estado propioceptivo.
- No soporta *tool calling*, ni uso de agentes, ni razonamiento multi-paso, ni instrucciones en lenguaje natural.
- No dispone de capacidades de visión general, VQA, OCR, audio ni generación de texto.
- Monotarea: no generaliza a otras tareas sin reentrenamiento o *fine-tuning*.

## Casos de uso

- **Línea base reproducible para ACT bimanual:** permite comparar nuevas variantes de ACT (otros tamaños de chunk, otras tasas de aprendizaje o arquitecturas visuales) contra un punto de partida documentado con pérdida, número de pasos y dataset explícitos.
- **Punto de partida para *fine-tuning* en tareas de limpieza:** el checkpoint de 100k pasos puede servir para inicializar políticas de barrido, pulido o desempolvado sobre el mismo robot, reduciendo el número de demostraciones necesarias frente a entrenar desde cero.
- **Validación de pipelines de datos en lerobot:** al estar vinculado a un export concreto de `forge` (`vega_clean_marker_58_d19`), sirve para comprobar de extremo a extremo la cadena de conversión, reencode de imágenes y carga con `ACTPolicy.from_pretrained` más `make_pre_post_processors`.
- **Despliegue de demostración en el robot real:** ejecución directa a 30 Hz sobre Dexmate Vega + XHand para reproducir la tarea de limpieza en el mismo entorno y con la misma calibración usada en la recogida de datos.
- **Medición de latencia y throughput en hardware de borde:** al ser un modelo de ~51,6 M de parámetros, permite medir el coste real de una inferencia con tres cámaras y comprobar si se cumple el presupuesto de 33,3 ms por paso o si conviene aumentar el tamaño del chunk.
- **Estudio de control en espacio articular absoluto:** útil para investigar la viabilidad de prescindir de IK/FK en tareas de contacto, comparando estabilidad y precisión frente a políticas que predicen deltas o poses cartesianas.
- **Ablación de la contribución de cada cámara:** al documentarse que `head_cam_right` y la profundidad quedaron fuera del entrenamiento, el modelo sirve como referencia para medir cuánto aporta cada vista en una tarea de barrido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible: no hay tasas de éxito, ni evaluaciones en simulación, ni comparaciones con otras políticas. El único dato cuantitativo de rendimiento es la curva de pérdida de entrenamiento:

| Paso | Pérdida |
|---|---|
| 100 | 10,2 |
| 5.000 | 0,24 |
| 20.000 | 0,083 |
| 100.000 | 0,038 |

La pérdida seguía descendiendo lentamente en el paso 100.000, según la model card.

## Requisitos de hardware

- **Peso de los pesos:** ~207 MB en fp32 (51,6 M × 4 bytes) y ~103 MB en fp16; coherente con el repositorio de 0,2 GB.
- **VRAM estimada para inferencia:** por debajo de 1 GB para los pesos; con las activaciones de tres flujos de imagen a 320x240 en ResNet18, una estimación razonable es 1-2 GB. No hay medición publicada de consumo real.
- **GPU recomendadas:** cualquier GPU con al menos 2-4 GB de VRAM. Para entrenamiento, el autor usó una B300 (5,2 h para 100.000 pasos con batch 16); para inferencia, una RTX 3060/4060 o superior es suficiente.
- **Cabe en GPU de consumo:** sí, en toda la gama media actual; también en módulos integrados tipo Jetson Orin para despliegue a bordo, aunque no se ha validado en esa plataforma.
- **Opciones de despliegue:** lerobot con PyTorch (`ACTPolicy.from_pretrained` + `make_pre_post_processors`). No aplican vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- **Latencia y throughput:** el bucle de control está fijado a 30 Hz, es decir, 33,3 ms por paso, con una inferencia cada 50 pasos (~1,7 s). No se han publicado medidas de latencia por inferencia ni de VRAM pico.

## Comparativa con modelos similares

Los datos de los modelos comparativos no provienen de la información proporcionada y deben verificarse en sus fichas correspondientes.

| Modelo | Tipo | Parámetros | Entrada / salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-vega-clean-marker-16d-100k | ACT bimanual, monotarea | 51,6 M | 3 cámaras + estado 16-D → chunk de 50 acciones absolutas | Apache-2.0 | HuggingFace (0 descargas) |
| ACT original (ALOHA, Zhao et al.) | ACT bimanual, referencia académica | No disponible | Cámaras + estado articular → acciones | No disponible | Código y pesos públicos |
| Diffusion Policy | Política visomotora basada en difusión | No disponible (depende de la configuración) | Imágenes + estado → secuencia de acciones | No disponible | Código y pesos públicos |
| OpenVLA | VLA basado en modelo de visión-lenguaje | ~7 B | Imagen + instrucción en lenguaje → acciones discretizadas | No disponible | Pesos públicos |

Frente a las alternativas, este modelo destaca por su tamaño reducido y por predecir articulaciones absolutas sin IK, pero carece de condicionamiento por lenguaje y de cualquier evaluación pública de éxito, a diferencia de las referencias académicas de ACT y de las políticas VLA de mayor escala.

## Limitaciones y advertencias

- **Monotarea estricta:** solo ha visto barrido de tablero; no acepta instrucciones ni generaliza a otras tareas sin reentrenamiento.
- **Sesgo de dominio:** 58 episodios de un único operador, robot y entorno. Es probable el sobreajuste a la iluminación, la posición del tablero y la trayectoria concreta de las demostraciones.
- **Riesgo de fallo silencioso:** sin evaluaciones de tasa de éxito, no se puede afirmar que la tarea se complete; la pérdida baja no garantiza un comportamiento robusto.
- **Dependencia de calibración:** las acciones son articulaciones absolutas, por lo que los pesos están atados a la cinemática y a la calibración concretas del Dexmate Vega + XHand usados. Cambiar de unidad, de montaje o de versión de firmware puede invalidar la política.
- **Pinza colapsada a 1-D:** se pierde el control independiente de los dedos de la XHand, lo que limita tareas que requieran agarre fino.
- **Sin profundidad:** los flujos de profundidad y `head_cam_right` se descartaron, de modo que el modelo trabaja con apariencia 2D y puede fallar ante oclusiones o cambios de altura.
- **Resolución reducida:** las imágenes se reencodearon a 320x240 desde 640x480, lo que elimina detalle fino relevante para contacto preciso.
- **Entrenamiento no convergido:** la pérdida seguía bajando en el paso 100.000; es probable que el modelo esté infraentrenado.
- **Sin capa de seguridad:** la política emite comandos articulares directos a 30 Hz sin límites de par, velocidad ni colisión; es imprescindible un supervisor de bajo nivel en producción.
- **Licencia:** Apache-2.0 permite uso comercial y modificaciones con atribución y aviso de cambios, pero no cubre los términos del dataset de origen, del robot ni del software de terceros (lerobot).
- **Validación comunitaria nula:** 0 descargas y 0 valoraciones en el momento de la consulta; no hay informes independientes de funcionamiento.
- **Sesgos en el sentido de equidad:** no aplican directamente al no tratar datos personales ni lenguaje, pero sí existe un sesgo de entorno y de operador en las demostraciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/junn0103/act-vega-clean-marker-16d-100k
- Perfil del autor: https://huggingface.co/junn0103
- Contacto indicado en la model card: jungi.hong@lgcns.com
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo (los resultados disponibles corresponden a servicios de traducción y no aportan documentación técnica).
