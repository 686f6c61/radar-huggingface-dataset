# padiredd/dp-blockpick-yaw45-2k-cotrain-real075

## Resumen

`dp-blockpick-yaw45-2k-cotrain-real075` es una política de difusión (diffusion policy) para control robótico de manipulación, publicada por el usuario `padiredd` en HuggingFace. Implementa el algoritmo Diffusion Policy sobre el fork `lerobot-cyclo` de LeRobot, desarrollado en el ecosistema de ROBOTIS, y está especializada en una única tarea: recoger un bloque verde lima con el brazo izquierdo del robot humanoide FFW SG2 mediante una aproximación cenital (top-down) y con orientación de yaw del bloque uniforme en el rango ±45 grados. El modelo cuenta con 287.533.680 parámetros (288 M) y se distribuye en formato `safetensors`, con un repositorio de 11,5 GB que incluye el checkpoint final (paso 100k) y nueve checkpoints intermedios cada 10.000 pasos.

El interés técnico del modelo reside en su estrategia de entrenamiento: combina 2.000 demostraciones simuladas en Isaac Lab (343.765 fotogramas) con solo 14 demostraciones reales de teleoperación (2.653 fotogramas) mediante un muestreo de co-entrenamiento con peso alpha = 0,75 a favor de los datos reales. Este enfoque de sim-to-real con co-entrenamiento sesgado hacia lo real es relevante para investigadores que trabajan en transferencia de políticas visuomotoras con presupuestos de datos reales muy limitados. La tarea se define con la cadena `"pick up the lime green block with the left arm"` y el modelo opera a 15 Hz con 16 articulaciones de salida.

La licencia es `other` (no estándar, definida por el autor), y no se han publicado resultados de evaluación en la model card: el autor indica explícitamente que los resultados se añadirán cuando se ejecuten. El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, lo que lo sitúa como un artefacto de investigación en fase temprana.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DDPM) con encoder ResNet18 por cámara |
| Parámetros totales | 287.533.680 (288 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política visuomotora; horizonte de predicción 64 pasos, 32 ejecutados, `n_obs_steps` = 1) |
| Tipos de cuantización | no disponible (entrenado y publicado en precisión original; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no aplica (modelo de robótica; la única cadena de lenguaje es la instrucción de tarea en inglés) |
| Licencia | other (licencia no estándar definida por el autor) |
| Formato de pesos | safetensors (compatible con `DiffusionPolicy.from_pretrained`) |

## Arquitectura y entrenamiento

La arquitectura es una Diffusion Policy basada en DDPM con 100 pasos de difusión, que predice secuencias de acciones de horizonte 64 (ejecutando 32) a partir de observaciones de un solo paso (`n_obs_steps` = 1). Cada una de las tres cámaras (cabeza, muñeca izquierda y muñeca derecha, a 240×240 píxeles) se procesa con un encoder ResNet18 independiente, y la entrada se completa con un vector de estado articular de 22 dimensiones. La salida son 16 objetivos articulares a 15 Hz. El entrenamiento se realizó durante 100.000 pasos con batch de 32, optimizador Adam con tasa 1e-4 y scheduler coseno, semilla 1000, en una única NVIDIA RTX 4090 de 24 GB compartida entre dos ejecuciones simultáneas.

El dato más relevante es la composición del dataset y el muestreo. Los datos simulados provienen del conjunto `pick-cube-topdown-yaw45-2k-full-dr2-3cam` (no publicado aún en HuggingFace): 2.000 demostraciones exitosas generadas con un planificador de movimiento (`grasp_planner`) en Isaac Lab, con yaw del bloque uniforme en |yaw| 0–45° con signo aleatorio y la misma randomización `dr2` que el conjunto de referencia `pick-cube-topdown-region10k-full-dr2-3cam`. A esto se añaden 14 demostraciones reales de teleoperación del conjunto `omkarpatil/pick-lime-block` (15 episodios menos uno abortado, 2.653 fotogramas), reescaladas al formato de simulación. El conjunto fusionado suma 2.014 episodios. El `CotrainMixSampler` del parche `lerobot-cyclo` extrae cada muestra de los episodios reales con probabilidad 0,75 y de los simulados en caso contrario, resultando en aproximadamente 24 muestras reales y 8 simuladas por batch. Las estadísticas de normalización se calculan sobre el conjunto fusionado. Se aplica un aumento de imagen agresivo (hasta 5 transformaciones aleatorias en orden aleatorio: brillo, contraste, saturación, tono, nitidez, afín, perspectiva, desenfoque, borrado aleatorio y escala de grises) y no se añade ruido de estado.

## Capacidades

- Generación de acciones de manipulación robótica: predice 16 objetivos articulares a 15 Hz para el brazo izquierdo del FFW SG2 con gripper CAD de ROBOTIS.
- Percepción visuomotora multi-cámara: procesa simultáneamente tres vistas (cabeza, muñeca izquierda, muñeca derecha) a 240×240 píxeles.
- Ejecución de una tarea concreta: recogida cenital de un bloque verde lima con orientación de yaw variable en ±45°.
- Condicionamiento por cadena de tarea: la instrucción `"pick up the lime green block with the left arm"` define el objetivo.
- Robustez a variaciones visuales: el aumento de imagen durante el entrenamiento busca tolerancia a cambios de iluminación, color, perspectiva y oclusiones parciales.
- Transferencia sim-to-real: el co-entrenamiento con peso 0,75 hacia datos reales está diseñado para reducir la brecha de dominio.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento: es una política motora, no un modelo de lenguaje.

## Casos de uso

- Investigación en sim-to-real para manipulación: el modelo sirve como referencia para estudiar cómo el peso de co-entrenamiento (alpha = 0,75) afecta a la transferencia desde 2.000 demos simuladas a 14 demos reales, un régimen de datos reales extremadamente escaso.
- Replicación de experimentos de Diffusion Policy: con los checkpoints intermedios cada 10.000 pasos, un investigador puede analizar la evolución de la política y la curva de aprendizaje sin reentrenar.
- Benchmark de aumento de datos visual: el pipeline de hasta 5 aumentaciones aleatorias permite evaluar qué transformaciones contribuyen más a la robustez en un robot físico.
- Desarrollo de pipelines de evaluación en Isaac Lab: el modelo se integra en el mismo entorno de simulación en el que se generaron los datos, lo que facilita la comparación controlada de checkpoints.
- Estudio de curricula de yaw: al cubrir ±45° (frente a los ±10° de conjuntos previos), permite analizar la generalización a orientaciones de agarre más diversas.
- Base para fine-tuning en tareas de pick-and-place: partiendo del checkpoint de 100k, se puede adaptar a bloques de otros colores o posiciones con un número reducido de demos reales adicionales.
- Docencia en robótica de imitación: el repositorio incluye la receta completa (batch, LR, scheduler, semilla) y los checkpoints, lo que lo hace reproducible en una sola RTX 4090.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación se añadirán una vez ejecutados, y no se proporcionan tasas de éxito ni métricas de error articular.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 288 M parámetros en precisión original (FP32 o FP16) y tres encoders ResNet18, la huella es moderada, pero no se documenta la cifra exacta.
- GPU de entrenamiento documentada: una NVIDIA RTX 4090 de 24 GB (identificada como "lab225"), compartida entre dos ejecuciones simultáneas.
- GPU recomendadas para inferencia: cualquier GPU consumer con al menos 8–12 GB de VRAM debería ser suficiente para una política de 288 M parámetros, aunque no se confirma en la documentación.
- Cabe en GPU consumer: sí, el entrenamiento se realizó en una RTX 4090; la inferencia requiere menos recursos que el entrenamiento.
- Opciones de despliegue: `DiffusionPolicy.from_pretrained("padiredd/dp-blockpick-yaw45-2k-cotrain-real075")` del fork `lerobot-cyclo`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a políticas robóticas).
- Latencia y throughput: no disponibles. La política opera a 15 Hz (periodo de 66,7 ms por paso de control), pero no se publica la latencia real de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-blockpick-yaw45-2k-cotrain-real075 | 288 M | Pick cenital de bloque, brazo izquierdo FFW SG2 | Horizonte 64, 32 ejecutados | other | HuggingFace (0 descargas) |
| pick-cube-topdown-region10k-full-dr2-3cam (conjunto de datos de referencia) | no aplica (dataset) | Pick cenital, yaw ±10° | no aplica | no disponible | HuggingFace (referenciado, no verificado) |
| omkarpatil/pick-lime-block (conjunto de datos real) | no aplica (dataset) | Pick de bloque lima, teleoperación | 15 episodios | no disponible | HuggingFace (referenciado) |

No se dispone de información sobre otras políticas Diffusion Policy comparables en la documentación proporcionada, por lo que la comparativa con modelos de la misma categoría se limita a los artefactos referenciados por el autor. No se han publicado métricas que permitan comparar rendimiento.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ejecuta una tarea (pick cenital de bloque verde lima con el brazo izquierdo) y no generaliza a otras tareas, objetos o brazos sin fine-tuning.
- Sin resultados de evaluación: no hay tasas de éxito publicadas ni en simulación ni en el robot real, por lo que se desconoce su fiabilidad efectiva.
- Dependencia de hardware específico: requiere el robot ROBOTIS FFW SG2 con gripper CAD, cámaras de muñeca calibradas y una mesa de 29,25 pulgadas; no es portable a otras plataformas sin reentrenamiento.
- Desbalance de datos: solo 14 demos reales frente a 2.000 simuladas; aunque el muestreo pondera lo real a 0,75, la diversidad real es muy limitada (2.653 fotogramas).
- Dataset simulado no publicado: el conjunto `pick-cube-topdown-yaw45-2k-full-dr2-3cam` no está en HuggingFace, lo que dificulta la reproducibilidad completa del entrenamiento.
- Licencia `other`: no se especifican los términos exactos, por lo que el uso comercial queda sujeto a la licencia no estándar del autor; se recomienda contactar con él antes de cualquier despliegue productivo.
- Riesgo de sobreajuste a la apariencia del bloque: el color "verde lima" está codificado en la instrucción y en los datos; cambios de color o textura pueden degradar el rendimiento.
- Sin soporte de lenguaje natural libre: la cadena de tarea es fija; no hay interfaz conversacional ni comprensión de instrucciones variables.
- Sesgos de simulación: la randomización `dr2` y el planificador de agarre determinan la distribución de entrenamiento; comportamientos fuera de esa distribución (posiciones inalcanzables, oclusiones severas) no están cubiertos.
- Fecha de creación futura (2026-11-03): el modelo aparece con fecha posterior a la actual, lo que puede indicar un artefacto de metadatos; conviene verificar la integridad del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/padiredd/dp-blockpick-yaw45-2k-cotrain-real075
- Conjunto de datos real referenciado: https://huggingface.co/omkarpatil/pick-lime-block
- Conjunto de datos simulado de referencia (mencionado, no verificado): `padiredd/pick-cube-topdown-region10k-full-dr2-3cam`
- Fork de LeRobot utilizado: `lerobot-cyclo` (parche `CotrainMixSampler`, no se proporciona URL directa)
- Isaac Lab: no se proporciona URL en la documentación
- ROBOTIS FFW SG2: no se proporciona URL en la documentación
