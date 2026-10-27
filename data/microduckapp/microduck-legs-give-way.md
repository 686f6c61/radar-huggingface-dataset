# microduckapp/microduck-legs-give-way

## Resumen

`microduck-legs-give-way` es una política de control motriz (policy) en formato ONNX publicada por el usuario `microduckapp` para el robot bípedo Microduck, un pequeño robot con forma de pato desarrollado en el ecosistema de Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un artefacto de robótica que define una secuencia de movimiento concreta, bautizada como "Legs Give Way", en la que el robot dobla las rodillas, se hunde y finalmente recupera el equilibrio con un gesto de cabeza.

El paquete incluye tres archivos: `policy.onnx` (la política neuronal que mapea 61 observaciones de entrada a 14 consignas articulares de salida, ejecutada a 50 Hz), `manifest.json` (metadatos de instalación y reproducción para el runtime del pato) y `media/preview.mp4` (vídeo de demostración). El movimiento tiene una duración de 11,7 segundos, lo que a 50 Hz implica aproximadamente 585 pasos de inferencia.

Su relevancia es acotada pero ilustrativa: muestra cómo el ecosistema Hugging Face se está usando para distribuir políticas de control para hardware abierto y de bajo coste, un patrón que facilita la reproducibilidad de comportamientos robóticos sin necesidad de reentrenar. La ficha del repositorio no aporta información sobre arquitectura interna, licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control exportada a ONNX; arquitectura de red no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 valores por paso |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), mas `manifest.json` y `media/preview.mp4` |
| Entradas / salidas | 61 observaciones de entrada, 14 consignas articulares de salida |
| Frecuencia de control | 50 Hz |
| Duracion del movimiento | 11,7 segundos (aprox. 585 pasos) |
| Pipeline declarado | robotics |
| Etiquetas | onnx, robotics, microduck-move, region:us |
| Tamano del repositorio | 0.0 GB (descargas: 0; likes: 0) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la red neuronal contenida en `policy.onnx`. Por el formato de interfaz (61 observaciones de entrada, 14 salidas de posición articular, 50 Hz) encaja con el patrón habitual de políticas de control para robots bípedos de pequeña escala entrenadas mediante aprendizaje por refuerzo en simulación y posteriormente exportadas a ONNX para inferencia en tiempo real. No obstante, el autor no documenta ni la topología, ni el número de parámetros, ni el algoritmo de entrenamiento, ni el simulador empleado.

Tampoco se detalla la composición del dataset, el número de tokens o episodios de entrenamiento, ni si hubo ajuste fino con preferencias humanas (RLHF/DPO), algo por otra parte poco habitual en políticas motrices. El nombre de la etiqueta `microduck-move` sugiere que forma parte de una familia de movimientos publicados bajo el mismo esquema de empaquetado (política ONNX + manifiesto + previsualización), pero no hay documentación pública que lo confirme en la información disponible.

## Capacidades

- Ejecución de una secuencia motriz pregrabada de 11,7 segundos para el robot Microduck: flexión progresiva de rodillas, descenso del cuerpo, recuperación con elevación de cabeza y sacudida final.
- Control articular de 14 grados de libertad a partir de 61 observaciones, a una frecuencia de 50 Hz.
- Inferencia en formato ONNX, lo que permite ejecución portable en CPU o en hardware embebido compatible con ONNX Runtime.
- Instalación y reproducción gestionadas por el runtime del robot a través de `manifest.json`.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades de generación de texto, código, matemáticas, visión, audio ni multilingües.
- No documenta modos especiales (thinking, planificación, memoria de episodios).

## Casos de uso

- Demostración de repertorio de movimientos en el robot Microduck: cargar `policy.onnx` junto con `manifest.json` en el runtime del pato para reproducir el gesto como contenido de exhibición en talleres o ferias.
- Docencia en robótica de sistemas bípedos: usar la secuencia como ejemplo práctico de cómo una política exportada a ONNX se integra en un bucle de control a 50 Hz sobre 14 articulaciones.
- Validación de pipelines de despliegue ONNX: servir como caso de prueba mínimo (entrada de 61 valores, salida de 14) para verificar latencias y compatibilidad de ONNX Runtime en hardware embebido.
- Benchmarking de reproducción de movimientos: comparar la ejecución real del gesto con `media/preview.mp4` para calibrar servos, offsets y tiempos de transición.
- Base para composición de secuencias: encadenar este movimiento con otros de la misma familia `microduck-move` para construir rutinas de mayor duración en una aplicación de control.
- Prueba de estrés mecánico controlada: la secuencia incluye una pérdida y recuperación de equilibrio, útil para observar el comportamiento de los servos y del lazo de control ante cargas variables.
- Material de referencia en investigación sobre distribución de políticas de control: permite estudiar el formato de empaquetado (política + manifiesto + previsualización) como convención para publicar comportamientos reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasas de éxito, error de seguimiento articular ni comparaciones con otras políticas. El único dato cuantitativo objetivo es la duración del movimiento (11,7 s) y la frecuencia de control (50 Hz).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un modelo ONNX sin parámetros documentados, no es posible estimar memoria; por la interfaz (61 entradas, 14 salidas) es plausible que la política sea de tamaño reducido y quepa en memoria muy limitada, pero esto no está confirmado por el autor.
- GPU recomendadas: no disponibles. No se documenta ningún requisito de aceleración GPU.
- Viabilidad en GPU de consumo: no confirmada. La ejecución en CPU mediante ONNX Runtime es la vía natural dado el bajo número de entradas y salidas, aunque no se especifica.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto); el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no aplican a una política de control robótica.
- Latencia y throughput: se requiere cumplir un periodo de control de 20 ms (50 Hz). No se publican mediciones de latencia real ni de tiempo de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / interfaz | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-legs-give-way | Política de control robótica (ONNX) | no disponible | 61 obs. → 14 articulaciones, 50 Hz | no disponible | Hugging Face, 0 descargas |
| Otras políticas de la familia `microduck-move` | Políticas de control robótica (ONNX) | no disponible | Esquema de empaquetado equivalente | no disponible | No verificadas en la información disponible |
| Políticas del ecosistema LeRobot | Políticas de imitación / VLA | variable según modelo | Depende del modelo (visión-lenguaje-acción) | habitualmente Apache-2.0 en el ecosistema | Hugging Face / GitHub |
| Modelos de lenguaje comparables | no aplica | no aplica | no aplica | no aplica | no aplica |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas. La comparación con el ecosistema LeRobot es únicamente contextual: LeRobot agrupa políticas de aprendizaje por imitación y modelos visión-lenguaje-acción, una categoría distinta a la de un movimiento pregrabado empaquetado como política ONNX.

## Limitaciones y advertencias

- Licencia no especificada: sin licencia explícita, no puede asumirse permiso para uso comercial, redistribución o modificación. Es un bloqueo potencial para producción.
- Ausencia total de documentación técnica: no hay información sobre arquitectura, entrenamiento, dataset, parámetros ni proceso de validación, lo que impide evaluar robustez o generalización.
- El artefacto está especializado en un único robot (Microduck) y un único movimiento; no es reutilizable fuera de ese hardware sin reentrenamiento.
- Dependencia del runtime y del `manifest.json`: la política no es autónoma, requiere el software de control del pato y una calibración correcta de las 14 articulaciones.
- Riesgo de fallo físico: la secuencia implica pérdida de equilibrio deliberada; una ejecución incorrecta o sobre una superficie inadecuada puede provocar caídas y daños en el robot.
- Cero descargas y cero likes en el momento de la consulta: no existe evidencia comunitaria de funcionamiento correcto más allá del vídeo de previsualización del propio autor.
- Sin datos de sesgo, alucinación o comportamiento en dominios no vistos, porque no es un modelo generativo de texto; esos riesgos no aplican en su forma habitual.
- Fecha de creación del repositorio (2026-10-27) posterior a la mayoría de referencias del ecosistema disponibles; conviene verificar la vigencia de los enlaces externos antes de citarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-legs-give-way
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del sistema Microduck ("From body to behavior"): https://eai-course.github.io/microduck/
- Microduck Studio (entorno web local de desarrollo y simulación): https://github.com/microai-lab/microduck-studio
- Recursos independientes del robot MicroDuck: https://microduckrobot.org/
- Análisis técnico sobre Hugging Face Microduck y LeRobot: https://techbytes.app/posts/hugging-face-microduck-lerobot-vla-architecture-deep-dive/
