# lucashoefs/sam-vtp

## Resumen

SAM-VTP es un modelo de segmentación continua de transitabilidad (*traversability*) para vídeo RGB-D, desarrollado por Lucas Hoefs (con Hui Xie, Senjian An y Fangyi Zhang como coautores). A diferencia de los SAM originales, que dependen de prompts (puntos, cajas o máscaras) para producir segmentaciones, SAM-VTP adapta la memoria de vídeo de SAM 2 para predecir sin prompt alguno y fusiona geometría medida a partir del canal de profundidad. El resultado es un mapa denso por píxel con un valor continuo en `[0,1]` en cada fotograma, que indica el grado de transitabilidad del terreno.

El modelo parte de SAM 2.1 Hiera-T (el encoder Hiera tiny de Meta) y lo afina sobre TartanGround, un dataset de simulación con etiquetas continuas derivadas de profundidad y semántica del simulador. El checkpoint publicado tiene 41,2 M de parámetros, pesos en 32 bits, entrada de 512×512 y memoria de 7 fotogramas sobre secuencias de 24. Está pensado para robótica móvil: navegación de robots terrestres en entornos no estructurados, donde la transitabilidad debe evaluarse de forma continua y temporalmente coherente.

Es relevante porque resuelve una tarea clásica de percepción robótica (estimar qué zonas del suelo son navegables) con un enfoque de segmentación de vídeo sin prompt, reutilizando un backbone fundacional ya entrenado. La licencia Apache 2.0 y la disponibilidad de código y despliegue en robot facilitan su evaluación. El repositorio es pequeño (0,2 GB) y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 2.1 Hiera-T (encoder Hiera tiny) con memoria de vídeo, fusión de geometría y módulo de refinamiento |
| Parametros totales | 41,2 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | memoria de 7 fotogramas sobre secuencias de 24 fotogramas (entrada 512×512) |
| Tipos de cuantizacion | no disponible (pesos publicados en 32 bits) |
| Idiomas soportados | no disponible (modelo de visión, sin salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch), con checksum SHA-256 |

## Arquitectura y entrenamiento

SAM-VTP se construye sobre SAM 2.1 Hiera-T, manteniendo el encoder jerárquico Hiera y el mecanismo de memoria de vídeo de SAM 2, pero eliminando la dependencia de prompts: el modelo predice directamente un mapa de transitabilidad por píxel. Sobre esa base incorpora dos componentes adicionales descritos en la model card: la fusión de geometría medida a partir de la profundidad (z-depth planar en metros) y un módulo de refinamiento. La salida es un tensor de logits `(1,1,H,W)` cuya sigmoide produce el score continuo en `[0,1]`.

El entrenamiento parte de los pesos de SAM 2.1 Hiera-T y se afina sobre TartanGround, con objetivos continuos generados a partir de la profundidad y la semántica del simulador. La configuración de entrenamiento usa entradas de 512×512, secuencias de 24 fotogramas con memoria de 7, y un presupuesto de 300 épocas de 1.000 secuencias cada una (7,2 M fotogramas en total). El checkpoint publicado corresponde a la semilla 42, seleccionado en la época 286 por *fuzzy Jaccard* de validación, y es el usado en las pruebas con robot. La configuración embebida en el checkpoint se ha reducido a ajustes de arquitectura y entrenamiento, sin alterar los pesos.

## Capacidades

- Segmentación densa de transitabilidad por píxel con salida continua en `[0,1]`, no binaria.
- Predicción sin prompt: no requiere puntos, cajas ni máscaras de entrada.
- Procesamiento de vídeo RGB-D con coherencia temporal gracias a la memoria de 7 fotogramas.
- Fusión de geometría medida desde profundidad métrica (z-depth planar en metros) con intrínsecos de cámara aportados por el usuario.
- Adaptación de la memoria de vídeo de SAM 2 para predicción prompt-free.
- No dispone de tool calling, function calling ni capacidades de agente.
- No genera texto ni dispone de capacidades multilingües; es un modelo puramente visual.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades fundacionales más allá de la tarea de segmentación.

## Casos de uso

- Navegación de robots terrestres en exteriores: el modelo produce un mapa de transitabilidad por píxel a partir del stream RGB-D del robot, permitiendo planificar rutas sobre terreno no estructurado con coherencia temporal entre fotogramas.
- Planificación de rutas en interiores no estructurados: con profundidad métrica e intrínsecos conocidos, el score continuo permite distinguir zonas parcialmente navegables (rampas, bordes, obstáculos bajos) que una segmentación binaria perdería.
- Evaluación de terrenos para vehículos autónomos de baja velocidad: la salida `[0,1]` puede integrarse como coste en un planificador de movimiento, penalizando zonas de baja transitabilidad de forma gradual.
- Análisis offline de secuencias grabadas: procesar vídeo RGB-D capturado previamente para generar mapas de transitabilidad y comparar con la trayectoria real del robot, útil para depuración y validación.
- Investigación en percepción robótica: servir como baseline prompt-free de segmentación de vídeo sobre TartanGround para comparar arquitecturas de memoria de vídeo y fusión geométrica.
- Despliegue embarcado: el tamaño reducido (41,2 M parámetros, 0,2 GB) y el repo de despliegue `sam_vtp_jetacker` lo hacen apto para plataformas tipo Jetson, siempre que se respeten los intrínsecos y la profundidad métrica.
- Etiquetado asistido de datos de transitabilidad: usar las predicciones como preetiquetas para anotar nuevos datasets RGB-D de robótica, reduciendo el coste de anotación manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que el checkpoint fue seleccionado por *fuzzy Jaccard* de validación en la época 286 y que es el usado en las pruebas con robot, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifras exactas; con 41,2 M parámetros en 32 bits, los pesos ocupan aproximadamente 0,16 GB, por lo que la VRAM necesaria vendrá dominada por activaciones y buffers de memoria de vídeo a 512×512.
- GPU recomendadas: no disponible en la información proporcionada; el ejemplo de uso apunta a `torch.device("cuda")` sin especificar modelo de GPU.
- Cabe en GPU de consumo: probable por tamaño de pesos, pero no confirmado en la información disponible.
- Opciones de despliegue: librería PyTorch con el paquete `sam_vtp` (`build_model`), descarga vía `hf download`; repo de despliegue en robot `lucashoefs/sam_vtp_jetacker`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / memoria | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAM-VTP (este) | 41,2 M | 7 fotogramas de memoria, entrada 512×512 | Transitabilidad continua prompt-free en RGB-D | Apache 2.0 | Pesos `.pt` en HF, código en GitHub |
| SAM 2.1 Hiera-T (base) | no disponible | memoria de vídeo de SAM 2 | Segmentación promptable de imagen y vídeo | Apache 2.0 | Pesos en HF (`facebook/sam2.1-hiera-tiny`) |
| SAM 2 (familia) | no disponible | memoria de vídeo | Segmentación promptable de vídeo | Apache 2.0 | Pesos en HF |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al entrenarse solo sobre TartanGround (simulación), puede generalizar mal a entornos reales no representados en el dataset.
- Riesgo de salida plausible pero incorrecta: la model card advierte explícitamente que intrínsecos de cámara o profundidad no métricos producen un mapa plausible pero erróneo sin emitir error alguno.
- Dependencia de calibración: requiere profundidad métrica (z-depth planar en metros) e intrínsecos de cámara correctos; cualquier desviación degrada silenciosamente la salida.
- Orden de fotogramas: las frames deben procesarse en orden de captura; alterar el orden rompe la coherencia de la memoria de vídeo.
- Limitaciones de contexto: memoria de 7 fotogramas sobre secuencias de 24; no está diseñado para dependencias temporales más largas.
- Limitaciones de idioma: no aplica, ya que no produce texto.
- Uso comercial: la licencia Apache 2.0 lo permite; los pesos derivan de SAM 2.1 Hiera-T (Apache 2.0, Meta) y los datos de TartanGround están bajo CC BY 4.0, condiciones a respetar en atribución.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; validado en pruebas de robot según el autor, pero sin benchmarks públicos.

## Enlaces

- Hugging Face: https://huggingface.co/lucashoefs/sam-vtp
- Código: https://github.com/lucashoefs/sam_vtp
- Despliegue en robot: https://github.com/lucashoefs/sam_vtp_jetacker
- Modelo base: https://huggingface.co/facebook/sam2.1-hiera-tiny
- Dataset TartanGround: https://huggingface.co/datasets/theairlabcmu/TartanGround
- Paper TartanGround (Patel et al.): arXiv:2505.10696
- Referencia arXiv del modelo: arXiv:2505.10696 (según tags de HF)
