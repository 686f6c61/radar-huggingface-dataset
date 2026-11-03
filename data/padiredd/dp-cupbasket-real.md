# padiredd/dp-cupbasket-real

## Resumen

dp-cupbasket-real es una política de difusión (diffusion policy) para robótica bimanual entrenada por el usuario padiredd sobre el robot real ROBOTIS FFW SG2. El modelo aprende una tarea concreta de manipulación: la mano izquierda pinza el borde de una taza azul, se la pasa a la mano derecha y esta la deposita sobre una cesta de mimbre invertida. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino un controlador de acciones que mapea observaciones visuales y propioceptivas a consignas articulares.

La arquitectura sigue el paradigma de LeRobot diffusion policy, con un total de 287.533.680 parámetros y un backbone ResNet18 por cada una de las tres cámaras de entrada (cabeza, muñeca izquierda y muñeca derecha). El modelo consume imágenes de 240x240 píxeles y un vector de estado articular de 22 dimensiones, y emite 16 objetivos articulares a 15 Hz. Se entrenó exclusivamente con 19 episodios de teleoperación real, sin datos simulados, durante 100.000 pasos con un batch de 32 en una única RTX 4090.

Su relevancia es acotada pero clara para quien trabaja en aprendizaje por imitación con hardware real: demuestra un pipeline completo de entrenamiento de diffusion policy bimanual sobre el fork lerobot-cyclo de ROBOTIS, con checkpoints intermedios cada 10.000 pasos y un conjunto de recetas de aumento de imagen agresivo para compensar el escaso número de demostraciones. La model card indica que los resultados de evaluación se añadirán cuando se ejecuten, por lo que no hay métricas de éxito publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con backbone ResNet18 por cámara y cabeza de acción sobre estado articular |
| Parametros totales | 287.533.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; horizonte de predicción de 64 pasos, 32 ejecutados, n_obs_steps = 1 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin entrada de texto libre; cadena de tarea en inglés) |
| Licencia | other |
| Formato de pesos | safetensors |
| Frecuencia de acción | 15 Hz |
| Entradas | 3 cámaras a 240x240 (cabeza, muñeca izquierda, muñeca derecha) + estado articular de 22 dimensiones |
| Salidas | 16 objetivos articulares |
| Pasos de difusión | DDPM con 100 pasos |
| Checkpoints | paso 100k en la raíz; pasos 10k a 90k en subcarpetas |
| Tamaño del repo | 11,5 GB |

## Arquitectura y entrenamiento

El modelo implementa una diffusion policy clásica: un proceso DDPM de 100 pasos que genera secuencias de acciones condicionadas por las observaciones. Cada una de las tres cámaras pasa por un ResNet18 independiente que extrae características visuales; estas se concatenan con el estado articular de 22 dimensiones y alimentan la red de denoising que predice la secuencia de 16 objetivos articulares. El horizonte de predicción es de 64 pasos, de los cuales se ejecutan 32, con un único paso de observación (n_obs_steps = 1). El entrenamiento usó Adam con tasa 1e-4, scheduler coseno, batch de 32 y semilla 1000, durante 100.000 pasos en una sola RTX 4090 de 24 GB compartida entre dos ejecuciones simultáneas.

Los datos provienen exclusivamente de teleoperación real: los 19 episodios del dataset `omkarpatil/pick-cup-and-place-on-basket`, convertidos con el conversor Cyclo del laboratorio y con cada cámara reescalada a 240x240, descartando la cámara `cam_right_head`. El muestreo es uniforme sobre todos los fotogramas mediante el `EpisodeAwareSampler` por defecto de LeRobot. Para compensar el reducido número de demostraciones se aplicó un aumento de imagen agresivo en orden aleatorio, con hasta cinco transformaciones simultáneas entre brillo (0,6-1,4), contraste (0,6-1,4), saturación (0,3-1,7), tono (±0,1), nitidez (0,3-2,0), afinado (±10 grados / 10 % / 0,9-1,1), perspectiva (0,2), desenfoque, borrado aleatorio y escala de grises. No se aplicó ruido al estado. El fork utilizado es lerobot-cyclo de ROBOTIS, no el LeRobot upstream.

## Capacidades

- Control bimanual de manipulación: genera consignas de 16 articulaciones a 15 Hz para el robot ROBOTIS FFW SG2.
- Percepción visual multivista: integra tres cámaras simultáneas (cabeza y ambas muñecas) a 240x240 píxeles.
- Condicionamiento por estado propioceptivo: incorpora un vector de 22 dimensiones del estado articular como parte de la observación.
- Ejecución de una tarea específica: pinzar la taza azul con la mano izquierda, transferirla a la derecha y colocarla sobre la cesta invertida.
- Predicción de secuencias de acción con horizonte de 64 pasos y ejecución de 32, lo que aporta suavidad y tolerancia a errores de modelado.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso simbólico ni capacidades multilingües: es un controlador motor, no un modelo de lenguaje.
- Sin modo de pensamiento, visión general, audio ni generación de texto.

## Casos de uso

- Investigación en aprendizaje por imitación con hardware real: sirve como referencia reproducible de un pipeline completo de diffusion policy bimanual sobre el fork lerobot-cyclo, con receta de entrenamiento y checkpoints intermedios documentados.
- Transferencia de políticas a robots FFW SG2: el modelo se carga directamente con `DiffusionPolicy.from_pretrained("padiredd/dp-cupbasket-real")` y puede desplegarse en el mismo robot para el que fue entrenado, sin reentrenamiento.
- Estudio de aumento de datos en regímenes de pocas demostraciones: la receta de aumento agresivo sobre 19 episodios permite analizar cómo afecta la augmentación visual a la generalización en manipulación bimanual.
- Línea base para comparación de algoritmos: al ser una diffusion policy estándar con DDPM de 100 pasos y ResNet18 por cámara, sirve como baseline frente a ACT, VQ-BeT u otras políticas de LeRobot en la misma tarea.
- Análisis de checkpoints intermedios: las subcarpetas de 10k a 90k permiten estudiar la evolución del aprendizaje y el sobreajuste a lo largo del entrenamiento en una tarea con datos escasos.
- Docencia y demostraciones de robótica bimanual: la tarea de transferencia de taza entre manos es un ejemplo didáctico de coordinación bimanual con percepción visual multivista.
- Prototipado de control de manipulación en laboratorio: útil para validar infraestructura de inferencia a 15 Hz con tres cámaras antes de escalar a tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se añadirán cuando se ejecuten, por lo que no existen tasas de éxito, métricas de error articular ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- Entrenamiento: una NVIDIA RTX 4090 de 24 GB, compartida entre dos ejecuciones simultáneas según la model card.
- VRAM estimada para inferencia: no disponible de forma explícita; con 287,5 M de parámetros en precisión completa el peso ronda 1,15 GB, y el consumo adicional depende de los tres ResNet18 y de los buffers de difusión. Cabe holgadamente en GPUs consumer de 8 GB o más.
- GPU recomendadas: RTX 4090 para entrenamiento; para inferencia, cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente por tamaño, aunque la latencia a 15 Hz con tres cámaras y 100 pasos DDPM conviene validarla en el hardware objetivo.
- Cabe en GPU consumer: sí, por tamaño de parámetros; la restricción real es la latencia de los 100 pasos de difusión y el preprocesado de tres cámaras.
- Opciones de despliegue: el stack de LeRobot (fork lerobot-cyclo de ROBOTIS) con `DiffusionPolicy.from_pretrained`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La frecuencia de control objetivo es 15 Hz, pero no se publican mediciones de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-cupbasket-real | 287,5 M | 64 pasos, 32 ejecutados | Transferencia bimanual de taza a cesta (FFW SG2) | other | HuggingFace, 0 descargas |
| Diffusion Policy (original, Chi et al.) | no disponible | configurable | Manipulación general | no disponible | Paper y código públicos |
| ACT (Action Chunking Transformer, LeRobot) | no disponible | configurable | Manipulación con chunking de acciones | no disponible | Implementado en LeRobot |
| VQ-BeT (LeRobot) | no disponible | configurable | Manipulación con discretización de acciones | no disponible | Implementado en LeRobot |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica con estas alternativas; la comparación se limita a categoría, arquitectura y disponibilidad.

## Limitaciones y advertencias

- Entrenado exclusivamente con 19 episodios reales de una única tarea y un único robot; la generalización a otras tareas, objetos o configuraciones de cámara es muy limitada.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito ni de robustez.
- La cadena de tarea está en inglés y el modelo no procesa lenguaje libre; no admite instrucciones en castellano ni cambio de tarea por prompt.
- Dependencia del fork lerobot-cyclo de ROBOTIS: la carga con el LeRobot upstream puede no ser compatible.
- Licencia "other" sin texto de licencia visible en la información proporcionada; es imprescindible revisar los términos antes de cualquier uso comercial.
- Riesgo de sobreajuste a las condiciones visuales de las demostraciones (iluminación, fondo, posiciones iniciales), parcialmente mitigado por el aumento agresivo pero no eliminado.
- Sin cuantizaciones publicadas ni optimizaciones de inferencia documentadas; el despliegue a 15 Hz con 100 pasos DDPM debe validarse en el hardware objetivo.
- El repo ocupa 11,5 GB por los checkpoints intermedios; conviene descargar solo el checkpoint necesario.
- No se documentan sesgos sociales ni de lenguaje por no ser un modelo de texto, pero sí puede heredar sesgos de las demostraciones de teleoperación (posiciones, objetos y entorno del laboratorio).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/padiredd/dp-cupbasket-real
- Dataset de demostraciones: https://huggingface.co/datasets/omkarpatil/pick-cup-and-place-on-basket
- LeRobot (framework base): https://github.com/huggingface/lerobot
- Fork lerobot-cyclo de ROBOTIS: no disponible en la información proporcionada
- Paper de Diffusion Policy (Chi et al.): no disponible en la información proporcionada
- Resultados de evaluación: no disponibles; la model card indica que se añadirán
