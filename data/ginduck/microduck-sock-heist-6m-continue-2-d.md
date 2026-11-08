# GinDuck/microduck-sock-heist-6m-continue-2-d

## Resumen

`microduck-sock-heist-6m-continue-2-d` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje: es una política de locomoción y manipulación que se ejecuta a 50 Hz sobre el robot, con una observación de 61 dimensiones y 14 acciones de salida. El autor, GinDuck, la publica como checkpoint de una serie de experimentos ("sock heist") orientados a que el robot se desplace, esquive obstáculos (guardias) y recoja un calcetín sin ser detectado.

El checkpoint corresponde a la iteración 800 de un entrenamiento iniciado el 1 de noviembre de 2026, con semilla 1, sobre el entorno `Mjlab-SockHeist6m-MicroDuck` del repositorio `microduck-challenges`. La política es perpetua: se ejecuta de forma continua hasta que se le indica lo contrario, y se carga en una ranura de política del demonio `robotctl` del robot. El autor afirma que completa cada episodio en menos de 10 segundos.

Su relevancia es acotada y de nicho: sirve como ejemplo reproducible de un pipeline de RL con MuJoCo/MJLab sobre hardware de bajo coste, y como política lista para desplegar en un microduck físico. No aporta capacidades de lenguaje, visión ni razonamiento simbólico, y su licencia e idiomas no están declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (red neuronal) exportada a ONNX; no se detalla la topología interna |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas microduck |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de politica | perpetua (se ejecuta hasta recibir orden de parada) |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en el entorno `Mjlab-SockHeist6m-MicroDuck`, definido en el repositorio `microduck-challenges` (rama `sock-continue-2`, commit `10ba3a426`). El entrenamiento usa 4096 entornos paralelos, hasta 1000 iteraciones máximas, semilla 1 y registro en TensorBoard, sobre la base `mjlab-microduck 0.1.0 @ 1efd853be`. El checkpoint publicado corresponde a la iteración 800. La normalización de observaciones está integrada dentro de `policy.onnx`, de modo que el robot debe alimentar observaciones en bruto.

No se especifica en la información disponible la topología de la red (número de capas, anchura, tipo de activaciones) ni el algoritmo exacto de RL empleado. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el mismo comando con la misma semilla produce una política comparable, no idéntica. La exportación a ONNX y el manifiesto con esquema 2 permiten cargar la política directamente en el demonio del robot mediante `robotctl`.

## Capacidades

- Control de locomoción del robot microduck a 50 Hz con observaciones de 61 dimensiones y 14 acciones.
- Ejecución de una política perpetua: mantiene el comportamiento indefinidamente hasta que se le ordena parar.
- Navegación evasiva en el escenario "sock heist": el autor indica que esquiva a los guardias y recoge el calcetín sin ser detectado.
- Finalización de episodios en menos de 10 segundos según la model card.
- Carga en una ranura de política del demonio `robotctl` (ranuras documentadas: walk, stand, sitstand, ground_pick, kick_left, kick_right, roulade).
- Inferencia mediante ONNX, con normalizador de observaciones embebido.
- No soporta tool calling, function calling, agentes de múltiples pasos, lenguaje natural, visión ni audio.

## Casos de uso

- Despliegue en un microduck físico para demostrar una política de RL entrenada en simulación: se carga con `sudo robotctl policy load <slot> GinDuck/microduck-sock-heist-6m-continue-2-d` y el robot ejecuta el comportamiento de forma continua.
- Docencia y divulgación en robótica: sirve como ejemplo completo y reproducible de un pipeline de RL (entorno MJLab, 4096 entornos paralelos, exportación ONNX) para estudiantes que quieran replicar el entrenamiento con el comando documentado.
- Investigación en transferencia sim-a-real: al estar entrenada en MuJoCo/MJLab y exportada a ONNX, permite evaluar la brecha entre simulación y hardware real en un cuadrúpedo de bajo coste.
- Pruebas de integración del demonio `robotctl`: la política y su manifiesto con esquema 2 permiten validar la carga de políticas en ranuras y el flujo de observaciones en bruto con normalizador embebido.
- Comparación de checkpoints de una misma serie: el autor publica variantes (`-2`, `-2-c`, `-2-d`) del mismo run, lo que facilita analizar la evolución del comportamiento entre iteraciones.
- Base para experimentos de curriculum o continuación de entrenamiento: el nombre "continue" y el comando de reproducción permiten partir de este checkpoint y seguir entrenando con otras semillas o configuraciones.
- Demostraciones de robótica lúdica: el escenario de "robo de calcetín" con guardias es un caso atractivo para vídeos y presentaciones técnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica declarada por el autor es cualitativa: cada episodio se completa en menos de 10 segundos y la política evita a los guardias y recoge el calcetín. No hay tablas de recompensa, tasa de éxito ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB según Hugging Face, lo que sugiere un modelo muy pequeño, pero no se publica el número de parámetros ni el tamaño exacto de `policy.onnx`.
- GPU recomendadas: no disponible. Al ser una política de control a 50 Hz con observación de 61 dimensiones, es plausible que se ejecute en CPU, pero no hay datos publicados que lo confirmen.
- Cabe en GPU de consumo: no disponible; por la naturaleza del modelo (control en tiempo real a 50 Hz) es probable que la inferencia se realice en el propio robot o en una CPU, pero no se documenta.
- Opciones de despliegue: ONNX Runtime mediante el demonio `robotctl` del microduck; el autor no menciona vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el único dato temporal es la frecuencia de control de 50 Hz y la duración de episodio inferior a 10 segundos.

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GinDuck/microduck-sock-heist-6m-continue-2-d | Política RL para microduck | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| GinDuck/microduck-sock-heist-6m-continue-2 | Política RL para microduck (checkpoint anterior) | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| GinDuck/microduck-sock-heist-6m-continue-2-c | Política RL para microduck (checkpoint intermedio) | 61 / 14 | 50 Hz | no disponible | Hugging Face |

No se dispone de información sobre otras políticas comparables de terceros para el microduck ni sobre métricas numéricas que permitan una comparación de rendimiento entre estos checkpoints.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde a instrucciones en lenguaje natural y no tiene capacidades de razonamiento simbólico.
- Especialización estrecha: la política está entrenada para una única tarea ("sock heist") y un único robot; no se espera que generalice a otros escenarios, objetos o morfologías.
- Licencia no declarada: no se especifican condiciones de uso comercial, redistribución ni atribución; conviene contactar con el autor antes de un uso en producción.
- Idiomas no disponibles: sin relevancia para este tipo de modelo, pero la ficha de Hugging Face no declara metadatos de idioma.
- Reproducibilidad limitada: el propio autor advierte que el entrenamiento con RL en GPU no es bit-reproducible entre máquinas; los pesos no se pueden regenerar de forma idéntica.
- Sin benchmarks publicados: no hay tasas de éxito, recompensas ni métricas de robustez que permitan evaluar el rendimiento de forma objetiva.
- Riesgo de fallo en transferencia sim-a-real: no se documenta la tasa de éxito en hardware físico ni las condiciones exactas del escenario de evaluación.
- Sesgos: no aplica en el sentido habitual de sesgos lingüísticos, pero el comportamiento puede estar sobreajustado a la distribución del escenario de entrenamiento (posición de guardias, del calcetín y del robot).
- Sin garantías de seguridad: una política perpetua que se ejecuta hasta recibir orden de parada requiere supervisión y mecanismos de parada de emergencia en el robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-sock-heist-6m-continue-2-d
- Checkpoint anterior `-2`: https://huggingface.co/GinDuck/microduck-sock-heist-6m-continue-2
- Checkpoint intermedio `-2-c`: https://huggingface.co/GinDuck/microduck-sock-heist-6m-continue-2-c
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
