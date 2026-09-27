# hvsr-robotics/a1x-wrist-grasp-sim

## Resumen

`hvsr-robotics/a1x-wrist-grasp-sim` es un repositorio de políticas de agarre (grasping) para el brazo Galaxea A1X con pinza paralela G1, entrenadas íntegramente en simulación con MuJoCo. No es un modelo de lenguaje ni un modelo multimodal de propósito general: es una política de control reactiva que resuelve los últimos centímetros de un agarre tipo pinza vertical (top-down). Un planificador o un modelo VLA sitúa la pinza en una posición de hover unos centímetros por encima del punto de agarre propuesto, con el error residual que deja la percepción real, y a partir de ahí la política controla el movimiento hasta que el objeto se levanta, a 20 Hz.

El repositorio contiene dos políticas. `student.pt` es la política desplegable: consume la imagen de una cámara de muñeca (160 x 120 RGB, con un cuarto canal que codifica el punto de agarre creído) más un vector de propiocepción de 19 valores, y produce 5 acciones (paso del TCP en x, y, z, paso de yaw y objetivo de pinza). `teacher.pt` es la política privilegiada que ve la pose verdadera del objeto desde el simulador y se usa como fuente de etiquetas para el aprendizaje por imitación con DAgger.

Su relevancia es doble: por un lado ataca el problema clásico de recuperación tras un cierre fallido, reabriendo, re-apuntando y reintentando; por otro, la cámara de muñeca empleada para generar los datos sintéticos corresponde a la pose y óptica medidas sobre el brazo real el 2026-09-26 (`wrist_camera_spec.json`), lo que prepara el siguiente paso: ejecutar al estudiante sobre fotogramas reales. El estado declarado por el autor es explícitamente "solo simulación": nada de esto ha movido todavía el brazo físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tronco ResNet18 preentrenado en ImageNet con primera convolución de 4 canales, MLP sobre el vector de propiocepción de 19 valores y cabeza de 3 capas con activación tanh |
| Parametros totales | 11 M |
| Longitud de contexto | No aplica: política por tick, sin ventana de contexto. Entrada de una imagen de 160 x 120 RGB (más canal de punto de agarre) y un vector de 19 valores por paso |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (no es un modelo de lenguaje); no disponible |
| Licencia | No disponible |
| Formato de pesos | Checkpoints PyTorch (`.pt`): `student.pt` y `teacher.pt`, cargables con la clase `Student` incluida en el repositorio |
| Frecuencia de control | 20 Hz (20 pasos de acción por segundo) |
| Entradas del estudiante | Imagen de cámara de muñeca 160 x 120 RGB, cuarto canal con blob gaussiano en la proyección del punto de agarre creído, y vector de 19 valores (6 ángulos articulares normalizados, apertura de dedos, punto de agarre creído relativo al TCP, seno y coseno del doble del error de yaw, objetivo actual de pinza, acción previa de 5 valores, número de intentos de cierre / 3) |
| Salidas del estudiante | 5 valores en [-1, 1]: paso del TCP en x, y, z (escalado x 8 mm), paso de yaw (x 5 grados) y objetivo de pinza (-1 cerrado, +1 abierto) |
| Estado del teacher | Vector privilegiado de 27 valores (actor-crítico MLP, ve la pose verdadera del objeto) |
| Licencia de uso comercial | No disponible; no se especifica en la model card ni en los metadatos |

## Arquitectura y entrenamiento

La política estudiante es una red híbrida visión-propiocepción: un tronco ResNet18 preentrenado en ImageNet, modificado para aceptar 4 canales de entrada en la primera convolución (RGB más el blob gaussiano que marca el punto de agarre creído), combinado con un MLP que procesa el vector de 19 valores de propiocepción. Sobre la concatenación de ambas representaciones hay una cabeza de 3 capas con tanh que emite las 5 acciones. El total es de 11 M de parámetros. El teacher es un actor-crítico MLP convencional sobre un estado privilegiado de 27 valores, definido como `Policy` en `sim/grasp/ppo.py` del repositorio fuente.

El entrenamiento se hizo en MuJoCo 3.13 con gymnasium y torch 2.11. El teacher se entrenó con PPO sobre 8 a 24 entornos en paralelo durante aproximadamente 1 M de pasos, con inicialización en caliente a partir de una ejecución con primitivas. El estudiante se entrenó por imitación del teacher con DAgger en 3 rondas: 4000 episodios por ronda, etiquetas del teacher en cada tick, con el estudiante conduciendo el 50 % de los ticks en la ronda 1 y el 70 % en la ronda 2, 10 épocas por ronda sobre una H100, pérdida de Huber, aumentación por recorte y fotométrica, y jitter por escena de la cámara de muñeca de 3 mm y 0,7 grados. La evaluación se hace sobre 100 episodios reservados con dos mezclas de objetos: "plain" (cajas, cilindros, esferas y cápsulas aleatorias) y "hard mix" (añade herramientas con cabeza, bolígrafos, formas en L y T, discos y barras planas, empuja el objeto 1-2 cm durante el descenso en el 30 % de los episodios y fuerza un cierre temprano en otro 30 %).

## Capacidades

- Control reactivo de agarre: genera pasos de TCP, paso de yaw y objetivo de pinza a 20 Hz para completar los últimos centímetros de un agarre top-down.
- Percepción en el bucle: procesa imagen de cámara de muñeca de 160 x 120, con recorte central previo si el fotograma real llega en 16:9.
- Estado creído explícito: integra el punto de agarre creído como cuarto canal de imagen y como parte del vector de propiocepción, de modo que tolera el error residual que deja la etapa de percepción aguas arriba.
- Recuperación ante fallo: si el cierre falla, la política abre, re-apunta e intenta de nuevo; el contador de intentos de cierre (normalizado por 3) forma parte de la entrada.
- Robustez a perturbaciones: entrenada contra desplazamientos del objeto de 1-2 cm durante el descenso y contra cierres prematuros forzados, ambos en el 30 % de los episodios de la mezcla difícil.
- Variedad de geometrías: cajas, cilindros, esferas, cápsulas, además de herramientas con cabeza, bolígrafos, formas en L y T, discos y barras planas en la mezcla difícil.
- Generación de datos de imitación: el teacher privilegiado se distribuye para rondas adicionales de DAgger sobre el estudiante.
- No dispone de tool calling, ni de razonamiento multi-paso simbólico, ni de capacidades multilingües, ni de visión de propósito general.

## Casos de uso

- Cierre fino de agarre en una pila planner + política: un planificador o un VLA sitúa la pinza en hover con el error que deja la percepción; esta política toma el control y ejecuta el descenso, el ajuste de yaw y el cierre a 20 Hz. Es exactamente el escenario para el que fue entrenada.
- Recuperación de agarres fallidos en líneas de manipulación: cuando el primer cierre no atrapa el objeto, la política reabre, corrige el apuntado y reintenta sin necesidad de que un nivel superior reinicie la tarea.
- Sim2real sobre cámara de muñeca real: la pose y la lente de la cámara del estudiante son las medidas sobre el brazo físico el 2026-09-26, de modo que el siguiente paso declarado por el autor es alimentarlo con fotogramas reales sin recalibrar el modelo.
- Generación de demostraciones etiquetadas para investigación en imitación: el teacher, que ve la pose verdadera, etiqueta cada tick y permite lanzar nuevas rondas de DAgger sobre el estudiante.
- Evaluación de robustez de políticas de agarre bajo perturbaciones controladas: la mezcla difícil (empujones de 1-2 cm y cierres prematuros) sirve como banco de pruebas reproducible de recuperación.
- Ampliación del repertorio de objetos en simulación: el bucle teacher-estudiante permite incorporar nuevas geometrías entrenando al teacher con PPO y destilando después al estudiante.
- Investigación en arquitecturas híbridas visión-propiocepción: el diseño ResNet18 más MLP con inyección del punto de agarre creído es un punto de partida barato (11 M de parámetros) para comparar variantes de codificación del estado creído.
- Preentrenamiento de políticas de pinza paralela para otros brazos: el esquema de acciones (paso TCP, paso de yaw, objetivo de pinza) es transferible a cualquier brazo con pinza de dos dedos, ajustando el entorno MuJoCo.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son tasas de éxito sobre 100 episodios reservados, comparando la política estudiante con la privilegiada:

| Politica | Entrada | Entrenamiento | Exito, mezcla dificil | Exito, objetos simples |
|---|---|---|---|---|
| `student.pt` | Imagen de camara de muneca + propiocepcion | Imitacion del teacher (DAgger, 3 rondas) | 79 % | 94 % |
| `teacher.pt` | Pose verdadera del objeto (estado del simulador) | PPO | 94 % | 96 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM para inferencia: estimación a partir del recuento de parámetros declarado (11 M). En fp32 los pesos ocupan aproximadamente 44 MB; en fp16, unos 22 MB. Con las activaciones de un fotograma de 160 x 120 y lote 1, el consumo se mantiene muy por debajo de 1 GB. No hay cifras oficiales publicadas.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU con soporte CUDA es sobrada; el entrenamiento del estudiante se realizó sobre una H100 según la model card.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en CPU, dado el tamaño del tronco ResNet18 y la resolución de entrada.
- Opciones de despliegue: PyTorch directo mediante la clase `Student` incluida en el repositorio (`Student.load("student.pt")`, con `device="cuda"` opcional). No aplican vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje.
- Latencia y throughput: la política opera a 20 Hz, es decir, 20 inferencias por segundo como frecuencia de control declarada. El throughput absoluto de la red no se publica; el coste por inferencia está dominado por el tronco ResNet18 a 160 x 120.

## Comparativa con modelos similares

No se han encontrado en la información disponible modelos comparables publicados por terceros con características equivalentes (política de agarre para pinza paralela entrenada en MuJoCo con destilación DAgger). La comparación factible es interna al propio repositorio:

| Modelo | Parametros | Entrada | Entrenamiento | Exito mezcla dificil | Exito objetos simples | Licencia |
|---|---|---|---|---|---|---|
| `student.pt` | 11 M | Imagen de camara de muneca 160 x 120 + vector de 19 valores | DAgger (3 rondas) sobre el teacher | 79 % | 94 % | No disponible |
| `teacher.pt` | No disponible | Estado privilegiado de 27 valores (pose verdadera) | PPO, ~1 M pasos | 94 % | 96 % | No disponible |

Las referencias encontradas en la búsqueda web (Web2Grasp, listas de artículos sobre grasping robótico, el simulador GraspIt!) son recursos generales del área y no constituyen alternativas comparables en parámetros, contexto o licencia para esta ficha.

## Limitaciones y advertencias

- Solo simulación: el autor declara explícitamente que nada de este repositorio ha movido todavía el brazo real. No hay validación sim2real publicada.
- Fallos por salida del campo de visión: los fallos residuales del estudiante se concentran en episodios en los que el objeto sale de la vista de la cámara de muñeca tras un empujón o un cierre fallido. El teacher, que conoce la pose verdadera, sigue teniendo éxito en esos casos.
- Objetos finos: los bolígrafos de 10 a 18 mm fallan en ambas políticas porque la propuesta de agarre del planificador mantiene las puntas de los dedos 6 mm por encima de la mesa.
- Dependencia de la etapa aguas arriba: la política asume que un planificador o un VLA la deja en hover sobre un punto de agarre propuesto; no resuelve la selección del punto de agarre ni la aproximación.
- Sensibilidad a la calibración: el recorte central de fotogramas 16:9 y la pose y lente de cámara de `wrist_camera_spec.json` forman parte de las condiciones de entrenamiento; desviarse de ellas degrada la política.
- Licencia no disponible: no se especifica licencia en los metadatos ni en la model card, por lo que el uso comercial queda en un limbo legal que conviene aclarar con el autor antes de cualquier despliegue en producción.
- Métricas con muestra limitada: las tasas de éxito proceden de 100 episodios reservados por configuración; no se publican intervalos de confianza ni réplicas independientes.
- Sesgos de simulación: MuJoCo no reproduce fricción, compliance de la pinza, ruido del sensor ni latencias reales; el hueco sim2real no está cuantificado.
- Sin capacidades de lenguaje, razonamiento simbólico ni tool calling: no debe emplearse fuera del ámbito de control de manipulación.
- Fecha de creación de los metadatos: 2026-09-27. El repositorio muestra 0 descargas y 0 "likes", y un tamaño de 0,0 GB, coherente con un artefacto recién publicado y de pesos pequeños.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hvsr-robotics/a1x-wrist-grasp-sim
- Perfil de la organizacion hvsr-robotics: https://huggingface.co/hvsr-robotics/models
- Codigo fuente, entorno, calibracion y payloads: repositorio `machinekind/galaxeo-manipulators`, rama `grasp-rl`, directorio `sim/grasp` (referenciado en la model card; no se proporciona URL directa en la informacion disponible)
- Articulo Web2Grasp (referencia general del area, no relacionada directamente): https://web2grasp.github.io/
- Web2Grasp, version alternativa del sitio: https://webgrasp.github.io/
- Lista de articulos sobre grasping robotico: https://github.com/rhett-chen/Robotic-grasping-papers
- Simulador GraspIt!: https://graspit-simulator.github.io/
