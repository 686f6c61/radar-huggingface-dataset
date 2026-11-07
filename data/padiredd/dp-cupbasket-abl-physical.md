# padiredd/dp-cupbasket-abl-physical

## Resumen

`dp-cupbasket-abl-physical` es una política de difusión (diffusion policy) para robótica bimanual entrenada con LeRobot, publicada por el usuario `padiredd`. Resuelve una tarea concreta de manipulación: coger un vaso azul con la mano izquierda, pasarlo a la mano derecha y depositarlo sobre una cesta, empleando el robot bimanual ROBOTIS FFW SG2 con pinzas CAD y cámaras de muñeca calibradas. El modelo tiene 287.533.680 parámetros (aproximadamente 288 M) y se distribuye en formato safetensors dentro de un repositorio de 11,5 GB que incluye el checkpoint final (100k pasos) y diez checkpoints intermedios cada 10.000 pasos.

El interés de esta ficha no está en el rendimiento generalista, sino en su valor como pieza de un experimento de ablación reproducible. El checkpoint concreto corresponde a la variante de "physical randomization only": se entrenó con 2.000 demostraciones simuladas en las que se aleatorizan la pose inicial (±2 grados en ambos brazos), el montaje y campo de visión de las cámaras y la altura de la mesa (-2 a +2 cm por pieza), pero sin ruido de estado ni otras perturbaciones. El resto de la receta (aumento de imagen agresivo, muestreo uniforme, DDPM de 100 pasos) se mantiene congelada respecto a las demás variantes de la ablación, lo que permite comparar el efecto aislado de la aleatorización física.

La relevancia es acotada pero clara para quien investiga en imitation learning y robótica: ofrece un punto de comparación controlado frente a `dp-cupbasket-abl-none`, `dp-cupbasket-real` y las políticas de la ablación de block-pick, todas del mismo autor y con la misma receta. No hay resultados de evaluación publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con encoder ResNet18 por cámara y cabeza de acciones; implementación LeRobot (fork ROBOTIS lerobot-cyclo) |
| Parámetros totales | 287.533.680 (≈288 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; `n_obs_steps` = 1, horizonte de predicción 64 pasos, 32 ejecutados |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente fp32/fp16; no se documenta) |
| Idiomas soportados | no aplica (modelo de robótica; la tarea se define por una cadena de texto en inglés) |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors (carga vía `DiffusionPolicy.from_pretrained`) |

## Arquitectura y entrenamiento

Se trata de una diffusion policy estándar al estilo LeRobot: tres cámaras (cabeza, muñeca izquierda y muñeca derecha) a 240×240 píxeles, cada una procesada por un ResNet18 independiente, más un vector de estado articular de 22 dimensiones. La salida es una secuencia de 16 objetivos articulares a 15 Hz. El proceso de difusión usa DDPM con 100 pasos, horizonte de 64 y 32 acciones ejecutadas, con un único paso de observación (`n_obs_steps` = 1). El entrenamiento se hizo con Adam a 1e-4, scheduler coseno, batch 32, semilla 1000 y 100.000 pasos en una única RTX 4090 de 24 GB.

Los datos provienen del conjunto `padiredd/Ablation_Cup_physical`: 2.000 demostraciones simuladas exitosas del programa `cup_handover_v6.py` (cierre derecho registrado 0,70 y ejecutado 0,50), con semillas desde 60001 y `--split_rng` para que layouts, parámetros de programa y valores de pinza sean idénticos entre los cuatro conjuntos de cada `pair_key`. La aleatorización de pinza segura se aplica en los cuatro conjuntos (apertura 0,10–0,157 en ambos brazos, cierre ejecutado izquierdo 1,3–1,5). El aumento de imagen es intenso: orden aleatorio con hasta 5 transformaciones entre brillo, contraste, saturación, tono, nitidez, afín, perspectiva, desenfoque, borrado aleatorio y escala de grises. No hay ruido de estado.

## Capacidades

- Generación de trayectorias de acción articular (16 objetivos a 15 Hz) condicionadas por tres vistas de cámara y el estado de 22 articulaciones.
- Manipulación bimanual: agarre con mano izquierda, transferencia entre manos y colocación sobre una cesta.
- Percepción visual multi-cámara con fusión de vista de cabeza y dos muñecas calibradas.
- Robustez parcial a variaciones físicas de cámara, pose inicial y altura de mesa, fruto de la aleatorización de entrenamiento.
- Ejecución de una única tarea definida por la cadena "pick up the blue cup with the left hand, hand it to the right hand, and place it on the basket".
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades de lenguaje, audio o visión generalista.

## Casos de uso

- Investigación en ablaciones de robustez: comparar este checkpoint con `dp-cupbasket-abl-none` y `dp-cupbasket-real` para medir cuánto aporta la aleatorización física (pose, cámara, altura de mesa) frente a no aleatorizar o frente al modelo entrenado con datos reales.
- Reproducción de experimentos de imitation learning: el repositorio incluye checkpoints cada 10.000 pasos, lo que permite estudiar curvas de aprendizaje y estabilidad del entrenamiento sin reentrenar.
- Validación de pipelines LeRobot en simulación: sirve como caso de prueba para verificar la carga con `DiffusionPolicy.from_pretrained` y la integración con el fork ROBOTIS lerobot-cyclo.
- Prototipado de tareas de handover bimanual en Isaac Lab: el modelo puede ejecutarse sobre el mismo entorno simulado para generar datos de evaluación o como política base antes de un ajuste fino.
- Estudio de sensibilidad a calibración de cámaras: al haberse entrenado con jitter de montaje y FOV, es útil para analizar cómo degrada la política cuando la calibración real difiere de la nominal.
- Docencia y divulgación: ejemplo compacto (288 M parámetros) de diffusion policy multi-cámara que cabe en una GPU de consumo y se puede diseccionar en clase o en un tutorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación se añadirán cuando se ejecuten.

## Requisitos de hardware

- Entrenamiento documentado: una RTX 4090 de 24 GB, compartida con como máximo otra ejecución de ablación.
- VRAM de inferencia: no disponible de forma explícita; por el tamaño (≈288 M parámetros) y los tres ResNet18, es esperable que quepa en GPUs de consumo, pero no hay medida publicada.
- GPU recomendadas: no disponible; la única referencia es la RTX 4090 usada para entrenar.
- Despliegue: carga mediante `DiffusionPolicy.from_pretrained` del fork ROBOTIS lerobot-cyclo; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles. Como referencia de diseño, la política predice 32 acciones por inferencia a 15 Hz, lo que fija el presupuesto temporal por paso, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Datos | Licencia | Notas |
|---|---|---|---|---|---|
| `padiredd/dp-cupbasket-abl-physical` | ≈288 M | 64 predichos / 32 ejecutados | 2.000 demos sim, solo aleatorización física | other | Este modelo |
| `padiredd/dp-cupbasket-abl-none` | ≈0,3 B (según HF) | no disponible | Ablación sin aleatorización | other | Misma tarea y receta; sirve de control |
| `padiredd/dp-cupbasket-real` | no disponible | no disponible | Datos de robot real | other | Misma tarea con datos reales |

No se dispone de resultados de rendimiento comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: solo ejecuta la tarea de transferencia de vaso a cesta; no generaliza a otras tareas ni objetos.
- Sin evaluación publicada: no hay métricas de éxito en simulación ni en real, por lo que no se puede afirmar su robustez fuera del conjunto de entrenamiento.
- Sesgo de simulación: entrenado exclusivamente con demostraciones de Isaac Lab; la brecha sim-a-real no está cuantificada.
- La aleatorización física es limitada (±2 grados de pose, ±2 cm de altura, jitter de cámara); perturbaciones mayores quedan fuera del dominio de entrenamiento.
- Sin ruido de estado durante el entrenamiento, lo que puede reducir la tolerancia a estimaciones imprecisas de articulaciones en el robot real.
- Licencia "other": no se especifican términos de uso comercial; hay que consultar el repositorio antes de cualquier despliegue productivo.
- Dependencia de un fork concreto de LeRobot (ROBOTIS lerobot-cyclo) y de la cadena de tarea exacta; cambios en la API pueden romper la carga.
- Repositorio de 11,5 GB por los diez checkpoints intermedios; conviene descargar solo los ficheros necesarios.
- Sin soporte de lenguaje, tool calling ni agentes; no debe confundirse con un modelo de propósito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-cupbasket-abl-physical
- Variante sin aleatorización: https://huggingface.co/padiredd/dp-cupbasket-abl-none
- Variante con datos reales: https://huggingface.co/padiredd/dp-cupbasket-real
- Conjunto de datos citado: `padiredd/Ablation_Cup_physical` (referenciado en la model card; no se proporciona URL directa)
- Políticas de la ablación de block-pick: `padiredd/dp-blockpick-cap2k-*-dr` (referenciadas en la model card; no se proporciona URL directa)
