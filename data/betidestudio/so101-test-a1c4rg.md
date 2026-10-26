# betidestudio/so101-test-a1c4rg

## Resumen

`betidestudio/so101-test-a1c4rg` es una política de imitación robótica entrenada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que, a partir del estado de las articulaciones y de tres cámaras (frontal, superior y de muñeca), predice acciones para un brazo robótico SO-101. La model card la describe explícitamente como una *diffusion policy* que opera a 20 fps y que se carga con `lerobot` mediante `--policy.path=<repo>`.

El modelo tiene 292.719.206 parámetros reales según los tensores en safetensors, lo que lo sitúa en la categoría de ~0,3B, coherente con una política de difusión con codificadores visuales convolucionales. El repositorio ocupa 1,2 GB, magnitud consistente con pesos en F32 (292,7 M × 4 bytes ≈ 1,17 GB). El pipeline declarado es `robotics` y los tags son `lerobot`, `safetensors`, `robotics` y `region:us`.

Su relevancia es acotada y hay que enmarcarla con honestidad: se trata de un artefacto de prueba (el nombre incluye `test`), con 0 descargas y 0 likes en el momento de la consulta, licencia no declarada e idiomas no declarados. Resulta útil como referencia de formato y de flujo de trabajo con LeRobot y el SO-101, no como política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (LeRobot) para control visuomotor; backbone concreto no detallado en la model card |
| Parametros totales | 292.719.206 (dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; política de imitación con horizonte de acción no especificado. Frecuencia de control: 20 fps |
| Tipos de cuantizacion | No disponible en la model card; el tamaño del repo (1,2 GB) es compatible con pesos F32 |
| Idiomas soportados | No aplica / no disponible (no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Entradas | Estado del robot + imagenes de camara frontal, superior y de muñeca |
| Salidas | Acciones de control del brazo SO-101 |
| Tamano del repositorio | 1,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-26 / 2026-10-26 |

## Arquitectura y entrenamiento

La model card solo indica que se trata de una *diffusion policy* de LeRobot para un brazo SO-101, con observaciones compuestas por el estado del robot y tres flujos de cámara (frontal, superior y muñeca) a 20 fps. No se detalla el backbone del denoiser (U-Net convolucional frente a variante transformer), ni la resolución de las imágenes, ni la dimensión del vector de estado, ni el horizonte de predicción de acciones (*action chunk*) o el número de pasos de difusión usados en inferencia. Tampoco se especifica el número de pasos de denoising en tiempo de ejecución, un parámetro que condiciona directamente la latencia de control.

No hay información sobre el conjunto de datos de entrenamiento: ni número de episodios, ni tareas, ni composición, ni si hubo aumento de datos o entrenamiento en simulación antes de un ajuste fino en el mundo real. No se documenta ningún proceso de RLHF, DPO ni optimización por preferencias, algo esperable en políticas de imitación pero que aquí no se puede confirmar. Tampoco hay innovaciones técnicas declaradas (decodificación especulativa, atención lineal, etc.), y no aplican en el sentido habitual de los modelos de lenguaje.

## Capacidades

- Generación de acciones de control continuas para un brazo SO-101 a partir de observaciones visuales y propioceptivas.
- Política multimodal: combina estado articular con tres vistas de cámara, lo que permite condicionar el movimiento a la escena observada.
- Modelado multimodal de trayectorias mediante difusión, lo que en la práctica permite representar distribuciones multimodales de acciones en lugar de una única media determinista.
- Control a 20 fps declarado en la model card, adecuado para tareas de manipulación no de alta dinámica.
- Carga directa con la herramienta `lerobot` (`--policy.path=<repo>`), sin pipeline de conversión propio.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de agentes de lenguaje, ni capacidades de texto, código, matemáticas, visión general o audio.
- Capacidades multilingües: no aplica.

## Casos de uso

- Replicación de una política de referencia en un SO-101: cargar el repo con `lerobot --policy.path` y ejecutar la política sobre el hardware para verificar que el pipeline de inferencia (cámaras + estado + acciones) funciona de extremo a extremo antes de entrenar un modelo propio.
- Prueba de infraestructura de robótica: usar el modelo como *smoke test* de un banco de pruebas con SO-101, comprobando latencia de inferencia, resolución de las tres cámaras y frecuencia de control efectiva a 20 fps.
- Base para ajuste fino con demostraciones propias: al estar en formato LeRobot, puede servir como inicialización o como referencia de configuración para un *fine-tuning* con un dataset de episodios teleoperados de una tarea concreta (por ejemplo, recogida y colocación de piezas).
- Manipulación pick-and-place en entornos controlados: la combinación de vista frontal, superior y de muñeca permite condicionar la aproximación al objeto y el cierre de la pinza, adecuado para tareas de laboratorio con objetos de geometría estable.
- Evaluación comparativa de arquitecturas de política: contrastar una diffusion policy con una política ACT entrenada sobre el mismo dataset y las mismas cámaras, midiendo tasa de éxito y suavidad de trayectoria en idénticas condiciones.
- Docencia y formación: ejemplo didáctico de política visuomotora de ~0,3B parámetros que cabe en una GPU de consumo y que ilustra el ciclo completo datos-demo → entrenamiento → despliegue en un brazo de bajo coste.
- Validación de canal de datos: comprobar que la sincronización de tres cámaras y el estado articular a 20 fps no introduce desfases antes de escalar a un entrenamiento real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay tasas de éxito por tarea, ni curvas de aprendizaje, ni comparaciones con políticas de referencia. Tampoco se documentan métricas de latencia por paso de difusión ni throughput medido en hardware concreto.

## Requisitos de hardware

- VRAM estimada: los pesos en F32 ocupan aproximadamente 1,17 GB (292.719.206 × 4 bytes). Sumando activaciones de tres codificadores visuales y los buffers del proceso de difusión, una estimación razonable es ≥4 GB de VRAM, aunque no hay medición publicada.
- GPU recomendadas: cualquiera con ≥8 GB de VRAM para trabajar con margen (RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, A10, L4). Para lotes grandes o entrenamiento, A100 o H100.
- Cabe en GPU de consumo: sí, por tamaño de parámetros; la limitación real es la latencia impuesta por los pasos de difusión y la frecuencia de 20 fps, no la memoria.
- Despliegue: `lerobot` sobre PyTorch es la vía documentada. No se mencionan vLLM (no aplica a este tipo de modelo), llama.cpp, Ollama ni TGI; tampoco se documenta una exportación a ONNX o TensorRT.
- Latencia y throughput: no disponibles. La frecuencia de 20 fps es la declarada para la captura y el control, no una medición de latencia de inferencia. El coste por paso de difusión debe validarse empíricamente en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| betidestudio/so101-test-a1c4rg | Diffusion policy (LeRobot) | 292,7 M | Estado + frontal/superior/muñeca, 20 fps | No disponible | Publicado, 0 descargas |
| betidestudio/so101-test-ab9ofl | Política LeRobot (mismo autor, otra ejecución) | ~0,3B (F32) | Estado + frontal/superior/muñeca, 20 fps | No disponible | Publicado |
| aaron-ser/SO101-Model | Política para SO-101 | No disponible | No disponible | No disponible | Publicado |
| Políticas ACT para SO-101 (guía SO101_ACT_Training) | Action Chunking Transformer | No disponible | Demostraciones teleoperadas del SO-101 | No disponible | Repositorio y guía públicos |
| Flujo sim-to-real con VLA (NVIDIA Isaac, SO-101) | Vision-Language-Action | No disponible | Visión + lenguaje + estado | No disponible | Curso y checkpoints en Hugging Face |

La comparación cuantitativa de rendimiento no es posible: ninguno de los artefactos comparados publica tasas de éxito ni métricas homogéneas en la información disponible.

## Limitaciones y advertencias

- Artefacto de prueba: el nombre incluye `test`, tiene 0 descargas y 0 likes, y fue creado y actualizado con 13 segundos de diferencia. No debe tratarse como un modelo validado.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución. Es un bloqueo legal para producción.
- Sin métricas de éxito: no hay evidencia publicada de que la política funcione en ninguna tarea, ni en simulación ni en el mundo real.
- Riesgo de sobreajuste al montaje concreto: una política de imitación depende de la posición exacta de las cámaras, la iluminación, el fondo y las características físicas del brazo con el que se recogieron las demostraciones. Cambiar el montaje degrada el comportamiento sin aviso.
- Sin información de sesgos ni de composición del dataset: se desconoce la diversidad de objetos, posiciones e iluminación cubierta, y por tanto el dominio en el que la política es fiable.
- Degradación fuera de distribución: los objetos no vistos, las oclusiones o los cambios de fondo pueden producir trayectorias erráticas sin señal de confianza asociada.
- Idiomas: no aplica, pero conviene subrayar que no hay ninguna capacidad de instrucción en lenguaje natural; no es un modelo VLA y no acepta comandos textuales.
- Contexto temporal limitado: el horizonte de acción no está documentado, de modo que no se puede razonar sobre la estabilidad de la política en tareas largas o con memoria.
- Requisito de sincronización: la política asume tres flujos de cámara y estado a 20 fps; un desfase o una pérdida de fotogramas invalida las observaciones y, con ello, las acciones predichas.
- Sin garantías de seguridad física: no se documentan límites de par, paradas de emergencia ni validación de rangos articulares. Cualquier despliegue en hardware real exige envolver la política con límites de seguridad externos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/betidestudio/so101-test-a1c4rg
- Repositorio hermano del mismo autor: https://huggingface.co/betidestudio/so101-test-ab9ofl
- Otro modelo para SO-101: https://huggingface.co/aaron-ser/SO101-Model
- Curso de NVIDIA Isaac: sim-to-real con SO-101 (VLA): https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/index.html
- NVIDIA Isaac, datasets y modelos del curso: https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/datasets-and-models.html
- Guía de entrenamiento ACT para SO-101: https://github.com/omkarputti/SO101_ACT_Training
