# padiredd/dp-blockpick-10k-table-texture-statenoise

## Resumen

`dp-blockpick-10k-table-texture-statenoise` es una política de difusión (diffusion policy) para robótica manipulativa, desarrollada por el usuario `padiredd` y publicada en HuggingFace dentro del ecosistema LeRobot. El modelo resuelve una tarea concreta de picking: recoger un bloque verde lima con el brazo izquierdo de un robot ROBOTIS FFW SG2 equipado con pinza ROBOTIS y cámaras de muñeca calibradas, sobre una mesa de 29,25 pulgadas. No es un modelo de lenguaje ni un modelo multimodal generalista: es un controlador de acciones que mapea observaciones visuales y de estado articular a comandos motores a 15 Hz.

La relevancia de esta ficha es acotada pero técnica: se trata de un checkpoint de investigación entrenado íntegramente en simulación (Isaac Lab) con 10.000 demostraciones y 1.695.003 fotogramas, e incluye una receta de aumento de datos agresiva (apariencia de mesa, fondo, color y rugosidad del bloque) más ruido gaussiano de 1 grado sobre las posiciones articulares del estado de entrada. Esa combinación apunta a mejorar la robustez frente al gap sim-to-real en percepción y propriocepción.

El modelo tiene 287.533.680 parámetros, se distribuye en formato `safetensors` (repo de 11,5 GB por los checkpoints intermedios) y su licencia es `other`, sin términos comerciales explicitados en la información disponible. La model card indica que los resultados de evaluación se añadirán cuando se ejecuten, por lo que no hay métricas de éxito publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM, 100 pasos de difusión) sobre encoder visual ResNet18 por cámara; fork `lerobot-cyclo` de ROBOTIS |
| Parámetros totales | 287.533.680 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; `n_obs_steps` = 1, horizonte de predicción 64, 32 acciones ejecutadas) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; única cadena de tarea en inglés: "pick up the lime green block with the left arm") |
| Licencia | other |
| Formato de pesos | safetensors (checkpoints en raíz del repo = paso 100k; subcarpetas `step-10000/` a `step-90000/`) |

## Arquitectura y entrenamiento

Se trata de una diffusion policy en el sentido de LeRobot: un modelo generativo que aprende la distribución de secuencias de acciones condicionada a observaciones, y que en inferencia parte de ruido y aplica 100 pasos DDPM para producir una trayectoria de 64 acciones, de las cuales se ejecutan 32. La entrada combina tres cámaras a 240x240 (cabeza, muñeca izquierda y muñeca derecha) procesadas cada una por un ResNet18, más un vector de estado articular de 22 dimensiones. La salida son 16 objetivos articulares a 15 Hz. El entrenamiento usó Adam con learning rate 1e-4, schedule coseno, batch de 32, semilla 1000 y 100.000 pasos sobre una única RTX 4090 de 24 GB a 10,4 pasos/s.

Los datos provienen del dataset `padiredd/pick-cube-topdown-region10k-dr-dr2-3cam`: 10.000 demostraciones simuladas, 1.695.003 fotogramas, muestreados de forma uniforme con el `EpisodeAwareSampler` por defecto de LeRobot. La randomization cubre pose inicial (±2 grados), apertura/cierre de pinza por episodio, empujes lentos con etiquetas limpias, focos de luz, desplazamientos de cámara, tiempos de demostración y altura de mesa (−2 a +2 cm), y añade apariencia: fondo (foto real de laboratorio, textura ambientCG o rejilla), aspecto de la mesa (nominal, color plano o textura) y color y rugosidad del bloque. El aumento de imagen es intenso y de orden aleatorio (hasta 5 de: brillo 0,6-1,4, contraste 0,6-1,4, saturación 0,3-1,7, tono ±0,1, nitidez 0,3-2,0, afín ±10 grados / 10 % / 0,9-1,1, perspectiva 0,2, desenfoque, borrado aleatorio y escala de grises). Además, se inyecta ruido gaussiano de 1 grado sobre las 7 posiciones articulares del brazo izquierdo en la entrada de estado (`state_noise_std` en `config.json`, campo del parche `lerobot-cyclo`; debe eliminarse para cargar con `lerobot-cyclo` estándar).

## Capacidades

- Generación de trayectorias de acción para picking cenital de un bloque con el brazo izquierdo del FFW SG2.
- Percepción visual multi-cámara: cabeza más dos muñecas calibradas, a 240x240 por vista.
- Condicionamiento en estado propioceptivo de 22 dimensiones (articulaciones y pinza).
- Control a 15 Hz con horizonte de predicción de 64 pasos y ejecución de 32 (replanificación por chunks).
- Robustez entrenada frente a variaciones de iluminación, fondo, textura de mesa, color y rugosidad del bloque, y ruido articular de 1 grado.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades multilingües, de visión general, audio o modo "thinking". Es un controlador específico de tarea.

## Casos de uso

- Recogida cenital de piezas en línea de montaje simulada: el modelo se usaría como política de referencia en Isaac Lab para validar la tarea de picking antes de transferir a hardware, aprovechando que fue entrenado con la misma randomization (altura de mesa, focos, desplazamientos de cámara).
- Estudio de sim-to-real en percepción: al incluir randomization de apariencia (fondo real, texturas ambientCG, color y rugosidad del bloque), sirve como base para medir cuánto del gap visual se cierra al entrenar con datos sintéticos variados.
- Benchmark de robustez propioceptiva: el ruido de 1 grado en las 7 articulaciones del brazo izquierdo permite evaluar la sensibilidad de la política a errores de estimación de estado, comparando checkpoints con y sin esa perturbación.
- Punto de partida para fine-tuning con datos reales: los checkpoints intermedios cada 10.000 pasos permiten elegir el punto de partida con mejor compromiso entre ajuste a la tarea y capacidad de generalización antes de adaptar a un robot físico.
- Docencia y reproducción de recetas de diffusion policy: la model card detalla receta completa (DDPM 100 pasos, horizonte 64/32, ResNet18 por cámara, Adam 1e-4, coseno), lo que facilita replicar el experimento en LeRobot.
- Evaluación comparativa de aumentos de datos: al estar aislada la variable de "texture + state noise" frente a otros checkpoints del mismo autor, permite medir el efecto de cada técnica de randomization sobre la tasa de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación se añadirán cuando se ejecuten. El único dato de rendimiento disponible es de entrenamiento: 10,4 pasos/s en una RTX 4090 de 24 GB con batch 32.

## Requisitos de hardware

- Entrenamiento: una NVIDIA RTX 4090 de 24 GB, batch 32, 10,4 pasos/s (dato del autor).
- Inferencia: no se publica VRAM estimada. Con 287,5 M de parámetros en fp32 serían aproximadamente 1,15 GB de pesos, más el estado del optimizador si se reanuda entrenamiento; la memoria real de inferencia depende del runtime de LeRobot y de los buffers de DDPM (100 pasos).
- GPU recomendadas: RTX 4090 para entrenamiento; para inferencia cabe holgadamente en GPUs consumer de 8 GB o más, aunque no hay medición publicada.
- Despliegue: el ecosistema es LeRobot (`DiffusionPolicy.from_pretrained(...)`), con el fork `lerobot-cyclo` de ROBOTIS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints comparables con métricas publicadas; el propio autor referencia variantes del mismo dataset (`region10k-full`) pero sin resultados de evaluación.

## Limitaciones y advertencias

- Tarea única y robot único: solo picking cenital de un bloque verde lima con el brazo izquierdo del FFW SG2; no generaliza a otras tareas, objetos ni morfologías sin reentrenamiento.
- Entrenado solo en simulación (Isaac Lab): el gap sim-to-real no está cuantificado y no hay evaluaciones en hardware publicadas.
- Sin métricas de éxito: no se puede afirmar rendimiento real; los resultados de evaluación están pendientes según la model card.
- Dependencia del parche `lerobot-cyclo`: el campo `state_noise_std` de `config.json` es específico del fork; hay que eliminarlo para cargar con la versión estándar.
- Licencia `other`: no se detallan términos comerciales; debe consultarse al autor antes de cualquier uso productivo.
- Riesgo de sobreajuste a la distribución de apariencia del dataset (fondos, texturas y colores concretos); objetos o entornos fuera de esa distribución pueden degradar el comportamiento.
- Sin capacidades de lenguaje, razonamiento simbólico ni tool calling; no es adecuado como componente de agentes conversacionales.
- El repo ocupa 11,5 GB por los diez checkpoints intermedios; conviene descargar solo la carpeta necesaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/padiredd/dp-blockpick-10k-table-texture-statenoise
- Dataset de entrenamiento: https://huggingface.co/datasets/padiredd/pick-cube-topdown-region10k-dr-dr2-3cam
- LeRobot (framework): https://github.com/huggingface/lerobot
- Fork `lerobot-cyclo` de ROBOTIS: no disponible en la información proporcionada
- Isaac Lab: https://github.com/isaac-sim/IsaacLab
- ROBOTIS FFW SG2: no disponible en la información proporcionada
