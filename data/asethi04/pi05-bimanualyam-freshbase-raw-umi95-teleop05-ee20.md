# ASethi04/pi05-BimanualYAM-freshbase-raw-umi95-teleop05-ee20

## Resumen

El modelo `pi05-BimanualYAM-freshbase-raw-umi95-teleop05-ee20` es un checkpoint de investigación orientado a robótica bimanual, desarrollado por ASethi04 y publicado en Hugging Face bajo la librería LeRobot. Se trata de una política de control visuomotor entrenada mediante aprendizaje por imitación, con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones), lo que lo sitúa en la gama de modelos grandes para robótica. El nombre sugiere una variante de la familia pi0, aunque la arquitectura interna no se detalla en la información disponible.

El modelo está entrenado para una tarea concreta: recoger naranjas y colocarlas en un cuenco, combinando datos de teleoperación (5%) y del Universal Manipulation Interface (UMI, 95%). Es un checkpoint intermedio (12.000 pasos de optimización) que sirve como base para futuras iteraciones, no como solución lista para producción. Su relevancia radica en la exploración de políticas bimanuales con predicción de acciones a futuro (horizonte de 24 pasos) y en la integración con el ecosistema LeRobot para investigación en manipulación robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de política robótica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información proporcionada no especifica la arquitectura interna del modelo (tipo de red, capas, mecanismos de atención, etc.). Por el nombre y el contexto, podría tratarse de una variante de la familia pi0 de Physical Intelligence, pero no se puede confirmar con los datos disponibles.

El entrenamiento se realizó durante 12.000 pasos de optimización con semilla 1000. Los datos provienen de dos fuentes: un 95% del dataset UMI `brandonyang/dual-lidar-umi-independent` y un 5% del dataset de teleoperación `brandonyang/yam-ultrawide-teleop`. La tarea específica es "recoger naranjas y colocarlas en el cuenco". Las acciones se definen por brazo como la posición XYZ, las dos primeras filas de la matriz de rotación y la apertura de la pinza normalizada futura absoluta. La transformación aplicada es `inverse(T_t) @ T_(t+k)` de forma independiente para cada paso futuro `k=1..24`, con orden de brazos izquierdo primero y luego derecho. No se utiliza padding terminal y se ejecuta exactamente el horizonte H24.

## Capacidades

- Manipulación bimanual: control coordinado de dos brazos robóticos.
- Aprendizaje por imitación: capacidad de reproducir comportamientos demostrados a partir de datos de teleoperación y UMI.
- Predicción de acciones a futuro: genera secuencias de acciones con horizonte de 24 pasos.
- Control de pinza: incluye apertura/cierre normalizado en la salida de acciones.
- Integración con LeRobot: compatible con el framework de Hugging Face para robótica.
- Especialización en tareas de pick-and-place: diseñado para recoger y colocar objetos (naranjas en un cuenco).

## Casos de uso

- Investigación en manipulación bimanual: permite estudiar estrategias de coordinación de dos brazos en tareas de precisión, como recoger objetos pequeños y depositarlos en contenedores.
- Desarrollo de políticas de control por imitación: sirve como punto de partida para experimentos con datasets UMI y teleoperación, evaluando el efecto de la proporción de datos mixtos.
- Evaluación de algoritmos de aprendizaje por refuerzo: el checkpoint puede usarse como inicialización o baseline para comparar métodos de RL en robótica.
- Pruebas de generalización en entornos controlados: dado que está entrenado para una tarea específica, es útil para medir la capacidad de transferencia a variaciones del escenario (posición de objetos, iluminación, etc.).
- Benchmarking de frameworks de despliegue: permite probar pipelines de inferencia en tiempo real con LeRobot, incluyendo la integración con IK y comprobaciones de seguridad.
- Formación en robótica y aprendizaje automático: como ejemplo de política bimanual con predicción de acciones, puede utilizarse en cursos y talleres para ilustrar el flujo de entrenamiento y evaluación de modelos de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamaño de 4,14 mil millones de parámetros y el peso del repositorio de 16,6 GB, se estima que la inferencia en precisión completa (fp32) requeriría al menos 16-20 GB de VRAM, aunque es una estimación no confirmada.
- GPU recomendadas: no disponible. Por el tamaño, una GPU de gama alta como RTX 4090 (24 GB) o A100 (40 GB) podría ser suficiente, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: no confirmado. Depende de la cuantización y del framework de inferencia.
- Opciones de despliegue: al estar basado en LeRobot, es compatible con los entornos de inferencia de dicha librería (por ejemplo, usando `lerobot` para cargar el modelo). No se mencionan vLLM, llama.cpp u otros.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la información facilitada.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no apto para uso en producción sin validación adicional.
- Requiere despliegue con IK (cinemática inversa), límites de articulaciones y colisiones, comprobaciones de éxito I2RT y procedimientos de seguridad física estándar.
- Está entrenado exclusivamente para la tarea de recoger naranjas y colocarlas en un cuenco; no es generalizable a otras tareas sin reentrenamiento.
- La licencia no está especificada, por lo que el uso comercial es incierto y se recomienda contactar al autor antes de cualquier aplicación industrial.
- No se dispone de información sobre sesgos o alucinaciones, al tratarse de un modelo de control robótico y no de lenguaje.
- La fecha de creación (2026-08-17) es posterior a la fecha actual, lo que sugiere que el modelo podría ser un artefacto experimental o simulado; se debe verificar su validez.

## Enlaces

- HuggingFace: [ASethi04/pi05-BimanualYAM-freshbase-raw-umi95-teleop05-ee20](https://huggingface.co/ASethi04/pi05-BimanualYAM-freshbase-raw-umi95-teleop05-ee20)
- Datasets mencionados (sin URL directa, solo identificadores):
  - `brandonyang/dual-lidar-umi-independent@a95b079b2b3dc73a912ecd12967f22f825d04fa8`
  - `brandonyang/yam-ultrawide-teleop@e0fae691e2eee74430dd463adf8e17180bc735e9`
