# padiredd/dp-blockpick-yaw45-2k

## Resumen

`dp-blockpick-yaw45-2k` es una política de difusión (diffusion policy) para robótica manipulativa, entrenada con el framework LeRobot mediante un fork específico del autor (`ROBOTIS lerobot-cyclo`) para el robot bimanual ROBOTIS FFW SG2 equipado con pinza CAD de ROBOTIS y cámaras de muñeca calibradas. El modelo resuelve una tarea concreta y estrecha: recoger un bloque verde lima con el brazo izquierdo desde una mesa de 29,25 pulgadas, con orientación de bloque (yaw) uniforme en el rango de -45 a +45 grados y signo aleatorio. No es un modelo de propósito general ni un LLM: es un controlador visuomotor que mapea observaciones (tres cámaras y estado articular) a comandos de articulaciones a 15 Hz.

La relevancia es acotada pero clara para quien trabaja en aprendizaje por imitación aplicado a manipulación. El modelo se entrenó íntegramente en simulación (Isaac Lab) con 2.000 demostraciones generadas por planificador de movimiento, 343.765 fotogramas, y emplea una receta de diffusion policy estándar con ResNet18 por cámara, DDPM de 100 pasos y horizonte de predicción de 64 pasos (32 ejecutados). Con 287.533.680 parámetros reales en safetensors, ocupa un nicho de políticas compactas que caben en una sola GPU de consumo.

El repositorio incluye el checkpoint final (paso 100k) en la raíz y nueve checkpoints intermedios cada 10.000 pasos, lo que facilita analizar la curva de aprendizaje y seleccionar un punto de control alternativo. La model card indica explícitamente que los resultados de evaluación se añadirán cuando se ejecuten, de modo que no hay métricas de éxito publicadas. La licencia figura como `other` sin texto adicional, lo que impide asumir permisos de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con encoder visual ResNet18 por cámara y cabeza de acción; framework LeRobot (fork ROBOTIS lerobot-cyclo) |
| Parametros totales | 287.533.680 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; `n_obs_steps = 1`, horizonte de predicción 64 pasos, 32 ejecutados |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente fp32/fp16; no se documentan variantes GGUF ni int8) |
| Idiomas soportados | No aplica (modelo visuomotor, sin entrada ni salida de texto) |
| Licencia | `other` (sin texto de licencia publicado en la información disponible) |
| Formato de pesos | safetensors (compatible con `DiffusionPolicy.from_pretrained`) |

## Arquitectura y entrenamiento

La política sigue el esquema de diffusion policy: un proceso DDPM de 100 pasos que genera secuencias de acciones condicionadas por observaciones visuales y propioceptivas. Cada una de las tres cámaras (cabeza, muñeca izquierda, muñeca derecha) se procesa con un backbone ResNet18 independiente a resolución 240x240; la observación se completa con un vector de estado articular de 22 dimensiones. La salida es un vector de 16 objetivos articulares a 15 Hz, con horizonte de predicción de 64 pasos de los que se ejecutan 32 y `n_obs_steps = 1`. El entrenamiento usó Adam con tasa 1e-4, scheduler coseno, batch de 32 y semilla 1000, durante 100.000 pasos en una única RTX 4090 de 24 GB compartida entre dos ejecuciones simultáneas.

Los datos provienen del conjunto `pick-cube-topdown-yaw45-2k-full-dr2-3cam` (no publicado aún en HuggingFace): 2.000 demostraciones exitosas en simulación, 343.765 fotogramas, generadas por un planificador de movimiento (`grasp_planner`) con el eje de cierre de la pinza alineado al par de caras más cercano. Respecto al conjunto previo de 10.000 demostraciones, este amplía la distribución de orientación del bloque de ±10 grados a |yaw| de 0 a 45 grados con signo aleatorio, y mantiene la región alcanzable completa y la aleatorización `dr2`. El muestreo es uniforme sobre fotogramas (EpisodeAwareSampler por defecto de LeRobot). Se aplica aumento de imagen agresivo en orden aleatorio, con hasta cinco transformaciones entre brillo 0,6-1,4, contraste 0,6-1,4, saturación 0,3-1,7, tono ±0,1, nitidez 0,3-2,0, afín ±10 grados / 10 % / 0,9-1,1, perspectiva 0,2, desenfoque, borrado aleatorio y escala de grises. No se añadió ruido al estado.

## Capacidades

- Generación de trayectorias articulares de 16 dimensiones para el brazo izquierdo del ROBOTIS FFW SG2 a 15 Hz.
- Percepción visuomotora a partir de tres cámaras simultáneas (cabeza, muñeca izquierda, muñeca derecha) a 240x240.
- Ejecución de una tarea de pick top-down sobre un bloque con orientación en el rango de -45 a +45 grados.
- Condicionamiento por estado articular de 22 dimensiones (propiocepción).
- Robustez parcial a variaciones visuales gracias al aumento de imagen agresivo durante el entrenamiento (iluminación, color, geometría, oclusiones sintéticas).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico ni capacidades multilingües: es un controlador, no un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Investigación en aprendizaje por imitación: servir como referencia reproducible de diffusion policy entrenada en Isaac Lab para comparar recetas, aumentos de imagen y curvas de aprendizaje usando los checkpoints intermedios cada 10k pasos.
- Selección de checkpoint en despliegue sim2real: los nueve puntos de control permiten evaluar si el rendimiento satura antes de 100k pasos y elegir un modelo más ligero o menos sobreajustado al simulador.
- Manipulación de pick-and-place con orientación variable: la generalización a yaw de hasta 45 grados con signo aleatorio lo hace adecuado para tareas donde el objeto aparece girado de forma no trivial, algo que la versión previa de ±10 grados no cubría.
- Base para fine-tuning con datos reales: al estar en formato LeRobot y safetensors, puede inicializarse desde este checkpoint y ajustarse con demostraciones teleoperadas del mismo robot para reducir la brecha sim2real.
- Evaluación de robustez visual: el aumento agresivo de imagen permite estudiar la sensibilidad del modelo a cambios de iluminación, color y perspectiva en entornos controlados antes de trasladarlo a una celda real.
- Benchmark interno de políticas compactas: con 287 M de parámetros y una sola RTX 4090 para entrenamiento, sirve como línea base de bajo coste frente a políticas más grandes en tareas de pick top-down.
- Docencia y prototipado en robótica: ejemplo completo de pipeline LeRobot + Isaac Lab con dataset, receta y checkpoints publicados, útil para cursos o laboratorios que no dispongan de clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica literalmente que los resultados de evaluación se añadirán cuando se ejecuten. No hay tasas de éxito, métricas de error de posición ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- Entrenamiento documentado: una NVIDIA RTX 4090 de 24 GB, compartida entre dos ejecuciones simultáneas con batch 32. El entrenamiento completo son 100.000 pasos.
- VRAM de inferencia estimada: no publicada. Con 287,5 M de parámetros, los pesos en fp32 ocupan aproximadamente 1,15 GB y en fp16 unos 0,58 GB; a ello hay que sumar las activaciones de tres ResNet18 a 240x240 y el bucle DDPM de 100 pasos, por lo que la huella real es mayor y no está cuantificada en la información disponible.
- GPU recomendadas: RTX 4090 (validada para entrenamiento), A100/H100 para entrenamiento a mayor escala o evaluación por lotes. Para inferencia en tiempo real a 15 Hz, una GPU de consumo moderna es plausible, pero no hay latencias medidas publicadas.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090 y posiblemente en gamas inferiores con fp16, aunque sin datos de latencia verificados.
- Opciones de despliegue: el camino documentado es `DiffusionPolicy.from_pretrained("padiredd/dp-blockpick-yaw45-2k")` con el fork ROBOTIS lerobot-cyclo. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El bucle DDPM de 100 pasos es el principal coste computacional y condiciona el cumplimiento del ciclo de control a 15 Hz.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-blockpick-yaw45-2k | 287,5 M | 64 pasos (32 ejecutados) | Pick top-down, yaw ±45 grados, FFW SG2 | `other` | HuggingFace, checkpoints 10k-100k |
| padiredd/pick-cube-topdown-region10k-full-dr2-3cam (referencia citada en la model card) | No disponible | No disponible | Pick top-down, yaw ±10 grados, misma plataforma | No disponible | Mencionado como dataset, no como modelo publicado |
| Diffusion Policy original (Chi et al.) | Depende de la implementación | Configurable | Manipulación general | MIT (implementación de referencia) | Repositorio público, sin pesos específicos para esta tarea |
| Otras políticas LeRobot del mismo autor | No disponible | No disponible | Tareas de pick en simulación | No disponible | No verificadas en la información proporcionada |

La comparación cuantitativa con alternativas no es posible: no hay métricas de éxito publicadas para este checkpoint ni para los modelos de referencia citados.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay tasas de éxito ni validación sim2real, por lo que no puede recomendarse para producción sin evaluación propia.
- Entrenado exclusivamente en simulación (Isaac Lab); la brecha sim2real no está cuantificada y depende de la calibración de cámaras y de la mesa de 29,25 pulgadas del montaje original.
- Tarea única y estrecha: solo recoge un bloque verde lima con el brazo izquierdo en configuración top-down; no generaliza a otros objetos, colores, alturas ni al brazo derecho.
- Dependencia de la plataforma: requiere el robot ROBOTIS FFW SG2 con pinza CAD y tres cámaras calibradas; el vector de estado de 22 dimensiones y la acción de 16 articulaciones están atados a esa morfología.
- Licencia `other` sin texto publicado: no puede asumirse permiso de uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de sobreajuste al planificador de movimiento: las demostraciones provienen de `grasp_planner`, no de teleoperación humana, lo que puede limitar la diversidad de estrategias de agarre.
- Sin ruido de estado durante el entrenamiento: la política puede ser frágil ante ruido de sensores o estimación de estado imperfecta en el robot real.
- El bucle DDPM de 100 pasos impone un coste de inferencia que debe validarse frente al ciclo de control de 15 Hz.
- El dataset de entrenamiento no está publicado en HuggingFace, lo que dificulta la reproducción exacta del entrenamiento.
- No hay información sobre sesgos demográficos ni de otro tipo, pero al no procesar lenguaje ni imágenes de personas, los riesgos de sesgo social son marginales frente a los riesgos de fallo físico en manipulación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/padiredd/dp-blockpick-yaw45-2k
- Dataset de referencia citado (no publicado aún): `pick-cube-topdown-yaw45-2k-full-dr2-3cam`
- Dataset previo citado: `padiredd/pick-cube-topdown-region10k-full-dr2-3cam`
- LeRobot (framework): https://github.com/huggingface/lerobot
- Isaac Lab (entorno de simulación): https://github.com/isaac-sim/IsaacLab
- Diffusion Policy (paper de referencia): https://arxiv.org/abs/2303.04137
- ROBOTIS FFW SG2: no disponible en la información proporcionada
