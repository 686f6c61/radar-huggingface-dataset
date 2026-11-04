# padiredd/dp-cupbasket-v6early-675

## Resumen

dp-cupbasket-v6early-675 es una política de difusión (diffusion policy) para control robótico bimanual, publicada por el usuario padiredd en HuggingFace. El modelo aprende a ejecutar una tarea concreta de manipulación: coger un vaso azul con la mano izquierda, pasarlo a la mano derecha y depositarlo sobre una cesta. Está entrenado sobre el robot humanoide bimanual ROBOTIS FFW SG2 equipado con pinzas CAD y cámaras de muñeca calibradas, dentro de un pipeline de simulación Isaac Lab gestionado con LeRobot (fork lerobot-cyclo de ROBOTIS).

La arquitectura es una diffusion policy con backbone ResNet18 por cámara, 287,5 millones de parámetros y salida de 16 consignas articulares a 15 Hz. El entrenamiento se realizó sobre las primeras 675 demostraciones exitosas de la recolección v6, con tres cámaras de 240x240 (cabeza y ambas muñecas) y estado articular de 22 dimensiones. El repositorio incluye el checkpoint final (paso 100k) más nueve checkpoints intermedios cada 10 000 pasos.

Es relevante para investigadores en robótica que trabajan con imitación visual-motora en entornos simulados: sirve como referencia reproducible de un pipeline completo (recolección de datos, aumento de imagen agresivo, DDPM de 100 pasos, horizonte 64/32) y como punto de partida para transferencia sim-a-real en plataformas bimanuales. No es un modelo de lenguaje ni un modelo multimodal general: es un controlador especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con encoder visual ResNet18 por camara |
| Parametros totales | 287.533.680 (288 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (horizonte de prediccion de 64 pasos, 32 ejecutados; n_obs_steps = 1) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF cuantizadas) |
| Idiomas soportados | no disponible (modelo de control robotico, sin capacidades linguisticas) |
| Licencia | other (sin terminos detallados en la model card) |
| Formato de pesos | safetensors |
| Entradas | 3 camaras 240x240 (cabeza, muneca izquierda, muneca derecha) + estado articular de 22 dimensiones |
| Salidas | 16 objetivos articulares a 15 Hz |
| Framework | LeRobot (fork lerobot-cyclo de ROBOTIS), Isaac Lab |
| Hardware de robot | ROBOTIS FFW SG2 con pinzas CAD |
| Tamano del repositorio | 11,5 GB |

## Arquitectura y entrenamiento

El modelo es una diffusion policy clásica en el espacio de acciones: un proceso DDPM de 100 pasos que genera trayectorias de 16 consignas articulares condicionadas por observaciones visuales y propioceptivas. Cada cámara pasa por un ResNet18 independiente, cuyas representaciones se combinan con el estado articular de 22 dimensiones. El horizonte de predicción es de 64 pasos, de los cuales se ejecutan 32 antes de replanificar, con un único paso de observación (n_obs_steps = 1). El entrenamiento usó Adam con tasa 1e-4 y decaimiento cosine, batch de 32, semilla 1000, durante 100 000 pasos en una única NVIDIA A100.

Los datos provienen exclusivamente de la recolección v6 (programa cup_handover_v6.py, fechado 2026-11-04): las primeras 675 demostraciones exitosas, correspondientes a 40 piezas con semillas 60001-60040, sin domain randomization y sin mezclar demos de la versión v3. El muestreo es uniforme sobre todos los frames (EpisodeAwareSampler por defecto de LeRobot). El aumento de imagen es agresivo y en orden aleatorio, aplicando hasta cinco transformaciones entre brillo (0,6-1,4), contraste (0,6-1,4), saturación (0,3-1,7), tono (±0,1), nitidez (0,3-2,0), affine (±10 grados / 10 % / 0,9-1,1), perspectiva 0,2, desenfoque, borrado aleatorio y escala de grises. No se aplicó ruido sobre el estado.

## Capacidades

- Ejecución de una tarea bimanual específica: coger un vaso azul con la mano izquierda, transferirlo a la derecha y colocarlo sobre una cesta.
- Control motor de 16 articulaciones a 15 Hz sobre el robot ROBOTIS FFW SG2 con pinzas CAD.
- Percepción visual multicámara: integra vista de cabeza y de ambas muñecas calibradas en una representación conjunta.
- Fusión visuo-propioceptiva: combina imágenes de 240x240 con estado articular de 22 dimensiones.
- Robustez visual parcial gracias al aumento de imagen agresivo durante el entrenamiento (variaciones de iluminación, color, geometría y oclusiones sintéticas).
- Planificación de trayectorias en espacio de acciones mediante difusión (DDPM de 100 pasos) con horizonte de 64 pasos.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües, visión general, audio ni modo thinking: es un controlador motor especializado.

## Casos de uso

- Reproducción de referencia en investigación bimanual: sirve para replicar el pipeline completo de LeRobot (recolección, entrenamiento, evaluación) en una plataforma ROBOTIS FFW SG2 y comparar variantes de hiperparámetros.
- Transferencia sim-a-real: al entrenarse en Isaac Lab sin domain randomization, permite estudiar la brecha sim-real y evaluar técnicas de adaptación (aumento de imagen, calibración de cámaras) en una tarea de handover con contacto físico.
- Benchmark interno de políticas de difusión: los nueve checkpoints intermedios (pasos 10k a 90k) permiten trazar curvas de aprendizaje y analizar cuándo emerge la coordinación bimanual.
- Estudio de robustez visual: el aumento agresivo de imagen facilita experimentos sobre sensibilidad a iluminación, color y oclusiones en políticas visuomotoras.
- Base para fine-tuning en tareas de manipulación similares (recogida y colocación de objetos con dos brazos) sobre el mismo robot y configuración de cámaras.
- Docencia y formación en robótica de imitación: ejemplo concreto y reproducible de diffusion policy con DDPM, horizonte largo y múltiples cámaras para cursos prácticos.
- Análisis de coordinación bimanual: la tarea de handover izquierda-derecha permite medir sincronización entre brazos y calidad de las transiciones de pinza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se añadirán cuando se ejecuten; no hay métricas de éxito, latencia ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 288 M parámetros en safetensors (fp32), los pesos ocupan aproximadamente 1,15 GB, más las activaciones de tres ResNet18 a 240x240 y el bucle de difusión de 100 pasos, que dominan el consumo.
- GPU de entrenamiento documentada: una NVIDIA A100 (ASU Sol, grupo hbenamor), con el dataset en disco local del nodo.
- GPU recomendadas para inferencia: A100 o H100 para despliegue en tiempo real con margen; RTX 4090 viable por memoria, aunque el bucle DDPM de 100 pasos condiciona la latencia.
- Cabe en GPU de consumo: previsiblemente sí por memoria (los pesos son pequeños), pero la latencia a 15 Hz con 100 pasos de difusión no está documentada y debe medirse.
- Opciones de despliegue: LeRobot con `DiffusionPolicy.from_pretrained("padiredd/dp-cupbasket-v6early-675")`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-cupbasket-v6early-675 | 288 M | horizonte 64 / 32 ejecutados | Handover bimanual vaso-cesta (FFW SG2) | other | HuggingFace, 0 descargas |
| Otras diffusion policies de LeRobot | no disponible | no disponible | Manipulación genérica | no disponible | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables sobre modelos comparables de la misma categoría en la información proporcionada; la comparación numérica queda pendiente.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ejecuta la tarea descrita (vaso azul, handover izquierda-derecha, cesta) sobre el robot ROBOTIS FFW SG2 con pinzas CAD; no generaliza a otras tareas, objetos o plataformas sin reentrenamiento.
- Entrenado exclusivamente en simulación (Isaac Lab) y sin domain randomization; el rendimiento sim-a-real no está documentado y es un riesgo relevante en producción.
- Sin resultados de evaluación publicados: no hay evidencia numérica de tasa de éxito ni de robustez.
- Dependencia de calibración de cámaras: las cámaras de muñeca calibradas y la configuración de tres vistas son parte del input; cambios de montaje invalidan el modelo.
- Dataset de entrenamiento no publicado en HuggingFace, lo que dificulta la reproducción exacta del entrenamiento.
- Licencia "other" sin términos detallados: deben consultarse las condiciones del autor antes de cualquier uso comercial.
- Riesgo de alucinación en el sentido de trayectorias no válidas: como política generativa por difusión, puede producir acciones fuera de rango o incoherentes ante observaciones fuera de distribución.
- Sesgos: el dataset usa 40 piezas y semillas concretas (60001-60040), con posible sobreajuste a posiciones iniciales, iluminación y apariencia del vaso azul.
- Idiomas: no aplica; el modelo no procesa lenguaje, aunque la model card incluye una cadena de tarea en inglés.

## Enlaces

- HuggingFace: https://huggingface.co/padiredd/dp-cupbasket-v6early-675
- LeRobot (framework): https://github.com/huggingface/lerobot
- Fork lerobot-cyclo de ROBOTIS: no disponible en la información proporcionada
- Isaac Lab: https://github.com/isaac-sim/IsaacLab
- ROBOTIS FFW SG2: no disponible en la información proporcionada
- Paper de diffusion policy: no disponible en la información proporcionada
