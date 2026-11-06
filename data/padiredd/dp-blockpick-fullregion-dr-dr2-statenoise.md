# padiredd/dp-blockpick-fullregion-dr-dr2-statenoise

## Resumen

`dp-blockpick-fullregion-dr-dr2-statenoise` es una política de difusión para robótica entrenada con LeRobot (fork `lerobot-cyclo` de ROBOTIS) que resuelve una tarea de manipulación concreta: recoger un bloque verde lima con el brazo izquierdo de un robot humanoide FFW SG2 de ROBOTIS, equipado con pinza CAD y cámaras de muñeca calibradas. El modelo no es un LLM ni un modelo multimodal generalista: es un controlador visuomotor que transforma observaciones (tres cámaras de 240x240 más un vector de estado articular de 22 dimensiones) en 16 objetivos articulares a 15 Hz.

Con unos 287,5 M parámetros (11,5 GB en safetensors), se entrenó íntegramente en simulación Isaac Lab sobre 10.000 demostraciones (1.695.003 frames) con un régimen agresivo de domain randomization: poses iniciales ±2 grados, apertura/cierre de pinza por episodio, cambios de iluminación, desplazamientos de cámara, altura de mesa −2 a +2 cm y, en esta variante, randomización de apariencia (fondo, textura y color de mesa, color y rugosidad del bloque). Es relevante para quien trabaja en sim-to-real porque combina aumentación de imagen intensa con ruido gaussiano de 1 grado sobre las posiciones articulares del brazo izquierdo durante el entrenamiento, una técnica habitual para mejorar robustez frente a errores de estimación de estado en el robot real.

El repositorio incluye el checkpoint final (paso 100k) en la raíz y nueve checkpoints intermedios cada 10.000 pasos, lo que permite estudiar la evolución del entrenamiento. La model card indica explícitamente que los resultados de evaluación se añadirán cuando se ejecuten, por lo que no hay métricas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DDPM, 100 pasos de difusión), encoder ResNet18 por cámara |
| Parametros totales | 287.533.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; horizonte de predicción de 64 pasos, 32 ejecutados, `n_obs_steps` = 1) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (modelo visuomotor; no procesa lenguaje, aunque la tarea se define con una cadena de texto) |
| Licencia | other |
| Formato de pesos | safetensors (compatible con `DiffusionPolicy.from_pretrained`) |

## Arquitectura y entrenamiento

La arquitectura es una Diffusion Policy clásica: un proceso DDPM de 100 pasos que genera secuencias de acciones condicionadas por observaciones, con un encoder visual ResNet18 independiente por cada una de las tres cámaras (cabeza, muñeca izquierda, muñeca derecha) a resolución 240x240, más un vector de estado articular de 22 dimensiones como entrada. La salida son 16 objetivos articulares a 15 Hz, con horizonte de predicción de 64 pasos de los cuales se ejecutan 32, y un único paso de observación (`n_obs_steps = 1`). El entrenamiento usó Adam con learning rate 1e-4 y schedule cosine, batch 32, semilla 1000, durante 100.000 pasos sobre una única RTX 4090 de 24 GB a 10,4 pasos/s.

El dataset (`padiredd/pick-cube-topdown-region10k-dr-dr2-3cam`) contiene 10.000 demostraciones simuladas con 1.695.003 frames, muestreadas de forma uniforme sobre todos los frames (EpisodeAwareSampler por defecto de LeRobot). Además del domain randomization estándar de la variante `region10k-full`, esta versión `dr2` añade randomización de apariencia: fondo (foto real de laboratorio, textura ambientCG o rejilla), aspecto de la mesa (nominal, color plano o textura) y color y rugosidad del bloque. La aumentación de imagen es intensa y de orden aleatorio, aplicando hasta cinco transformaciones simultáneas entre brillo (0,6–1,4), contraste (0,6–1,4), saturación (0,3–1,7), tono (±0,1), nitidez (0,3–2,0), afín (±10 grados / 10 % / 0,9–1,1), perspectiva (0,2), desenfoque, borrado aleatorio y escala de grises. Como innovación específica, se inyecta ruido gaussiano de 1 grado sobre las 7 posiciones articulares del brazo izquierdo en la entrada de estado durante el entrenamiento; el campo `state_noise_std` de `config.json` pertenece al parche `lerobot-cyclo` y debe eliminarse para cargar con la versión estándar (es solo de entrenamiento).

## Capacidades

- Control visuomotor de manipulación: genera trayectorias articulares de 16 dimensiones a 15 Hz para una tarea de pick top-down con brazo izquierdo.
- Percepción multi-cámara: fusiona tres vistas (cabeza + dos muñecas) de 240x240 píxeles.
- Condicionamiento por estado propioceptivo: integra 22 dimensiones de estado articular junto a las imágenes.
- Robustez a variaciones visuales: entrenado con randomización de apariencia (fondos, texturas, colores, iluminación, perspectiva, desenfoque).
- Robustez a errores de estado: tolerancia implícita a ±1 grado de ruido en las posiciones del brazo izquierdo.
- Generación de acciones multimodal: la formulación por difusión permite capturar distribuciones multimodales de comportamiento.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües: es un modelo puramente robótico.
- Tarea parametrizada por cadena de texto (`"pick up the lime green block with the left arm"`), pero no hay comprensión de lenguaje general.

## Casos de uso

- Recogida de objetos en línea de montaje sim-to-real: el modelo puede transferirse a un FFW SG2 real para recoger bloques verde lima y depositarlos; la randomización de apariencia y el ruido de estado están pensados precisamente para reducir la brecha sim-real.
- Investigación en domain randomization: sirve como referencia reproducible para estudiar el efecto de la randomización de apariencia (`dr2`) frente a la variante `dr` sobre la transferencia a hardware.
- Benchmark de políticas de difusión: al incluir nueve checkpoints intermedios (10k a 90k) más el final, permite analizar curvas de aprendizaje y estabilidad del entrenamiento sin reentrenar.
- Evaluación de robustez a ruido propioceptivo: útil para medir cuánto degrada la inyección de ruido de estado la precisión frente a la variante sin ruido.
- Base para fine-tuning en tareas de pick-and-place: partiendo del checkpoint de 100k, se puede ajustar con menos datos a objetos o posiciones distintas sobre la misma plataforma.
- Docencia y reproducción en robótica: receta completa (100k pasos, batch 32, ResNet18, DDPM 100 pasos, Adam 1e-4) ejecutable en una única RTX 4090, lo que facilita replicar el pipeline en laboratorios con hardware modesto.
- Pruebas de pipeline LeRobot: validación de carga con `DiffusionPolicy.from_pretrained`, compatibilidad del fork `lerobot-cyclo` y del parche `state_noise_std`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados de evaluación se añadirán cuando se ejecuten. Los únicos datos de rendimiento disponibles son de entrenamiento: 10,4 pasos/s en una RTX 4090 de 24 GB con batch 32.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 287,5 M parámetros en fp32 los pesos ocupan aproximadamente 1,15 GB, y el grueso de los 11,5 GB del repositorio corresponde a los diez checkpoints. La inferencia requiere además memoria para tres encoders ResNet18 a 240x240 y el proceso DDPM de 100 pasos.
- GPU de entrenamiento: una NVIDIA RTX 4090 de 24 GB (10,4 pasos/s con batch 32), según la model card.
- GPU recomendadas para inferencia: RTX 4090, A100 o H100 por margen de VRAM y latencia; no hay datos publicados de latencia en otras GPU.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 y posiblemente en GPUs de 8–12 GB, aunque no se ha verificado ni publicado.
- Opciones de despliegue: carga mediante `DiffusionPolicy.from_pretrained("padiredd/dp-blockpick-fullregion-dr-dr2-statenoise")` con el fork `lerobot-cyclo`; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible para inferencia; solo se conoce el throughput de entrenamiento (10,4 pasos/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-blockpick-fullregion-dr-dr2-statenoise | 287,5 M | horizonte 64 / 32 ejecutados | 3 camaras 240x240 + estado 22 dim | other | Hugging Face (padiredd) |
| Variante `region10k-full` (mismo autor) | no disponible | no disponible | no disponible | other | referenciada en la model card, no enlazada |
| Diffusion Policy original (Chi et al.) | no disponible | no disponible | no disponible | no disponible | implementacion de referencia en LeRobot |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas como para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación (Isaac Lab): no hay evidencia publicada de transferencia al robot físico ni resultados de evaluación.
- Tarea extremadamente estrecha: recoger un bloque verde lima con el brazo izquierdo en una configuración de mesa concreta (29,25 in); no generaliza a otras tareas sin fine-tuning.
- No procesa ni genera lenguaje; la cadena de tarea es solo una etiqueta, no una instrucción interpretada.
- Riesgo de sobreajuste a la distribución simulada pese a la randomización; la brecha sim-real no está cuantificada.
- Sesgos conocidos: no documentados; al entrenarse con apariencias y colores concretos, puede fallar ante objetos o fondos fuera de la distribución de randomización.
- Licencia `other`: las condiciones exactas no están detalladas en la información disponible; verificar antes de uso comercial.
- El campo `state_noise_std` en `config.json` es específico del fork `lerobot-cyclo`; debe eliminarse para cargar con la versión estándar, lo que puede confundir en producción.
- Sin cuantizaciones publicadas (GGUF, INT8), lo que limita el despliegue en hardware de borde.
- Repositorio de 11,5 GB por los diez checkpoints; conviene descargar solo el checkpoint final si no se necesita el histórico.
- Sin métricas de latencia de inferencia, imposible estimar requisitos de control en tiempo real a 15 Hz sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-blockpick-fullregion-dr-dr2-statenoise
- Dataset referenciado: `padiredd/pick-cube-topdown-region10k-dr-dr2-3cam` (referencia en la model card; no se proporciona URL directa en la información disponible)
- LeRobot: no disponible en la información proporcionada
- Isaac Lab: no disponible en la información proporcionada
- Paper de Diffusion Policy (Chi et al.): no disponible en la información proporcionada
- Fork `lerobot-cyclo` de ROBOTIS: no disponible en la información proporcionada
