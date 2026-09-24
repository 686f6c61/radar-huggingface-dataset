# Machanize/chess_phase_smolvla

## Resumen

chess_phase_smolvla es un ajuste fino del modelo SmolVLA (Vision-Language-Action) de Hugging Face, publicado por el usuario Machanize. Se trata de una política robótica de 450 millones de parámetros cuyo objetivo es mover una pieza de ajedrez con un brazo SO-101 dentro de un simulador MuJoCo. La idea de diseño es que este modelo actúe como la "mano" de un robot ajedrecista: un componente separado (el "cerebro") decide la jugada y marca la pieza y la casilla destino sobre las imágenes de cámara mediante cuadrados translúcidos rojo y azul, y esta política solo tiene que trasladar la pieza marcada.

El modelo parte de `lerobot/smolvla_base` y se ha entrenado íntegramente en simulación con 2.000 episodios exitosos (594.702 fotogramas) generados por un experto con cinemática inversa. Recibe dos imágenes de cámara de 640x480, el estado articular y una instrucción en lenguaje natural, y devuelve objetivos de articulación en bloques de 50 pasos. El ajuste fino se hizo durante 20.000 pasos con batch 64 en una única RTX 4090 durante 4,2 horas, con el codificador visual congelado.

La relevancia de esta ficha es doble. Por un lado, documenta un caso real de aplicación de SmolVLA a una tarea de manipulación. Por otro, y de forma más importante, el propio autor declara que el modelo **no funciona todavía**: en una prueba a bucle cerrado de 100 episodios en simulación obtuvo un 0,0% de éxito. Esto lo convierte en un ejemplo útil de resultado negativo documentado, con un análisis explícito de las causas probables y de los siguientes pasos a probar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); VLM compacto preentrenado + experto de accion entrenado con flow matching |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Instruccion fija en ingles ("move the piece on the red square to the blue square"); soporte multilingue no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Biblioteca | lerobot (LeRobot 0.4.4) |
| Pipeline | robotics |
| Modelo base | lerobot/smolvla_base |
| Tamano del repositorio | 0,9 GB |
| Entradas | 2 imagenes 640x480 a 30 Hz (`observation.images.overhead` y `observation.images.wrist`) + `observation.state` (5 articulaciones en grados + pinza 0-100) |
| Salidas | Objetivos de articulacion en bloques de 50 pasos, en las mismas unidades |

## Arquitectura y entrenamiento

SmolVLA es un modelo Vision-Language-Action ligero compuesto por un VLM preentrenado compacto y un "experto de acción" entrenado con flow matching. Dada una instrucción en lenguaje natural y varias imágenes, el modelo genera un bloque de acciones (en este caso, objetivos de articulación). Esta variante concreta se ha ajustado sobre `lerobot/smolvla_base` con los ajustes por defecto de SmolVLA en LeRobot 0.4.4, durante 20.000 pasos con batch 64, en una única RTX 4090 y en 4,2 horas. El codificador visual se mantuvo congelado durante el entrenamiento y el total de pasos equivale a unas 2 épocas.

Los datos de entrenamiento son 2.000 episodios exitosos (594.702 fotogramas) grabados a 30 fps por un experto de cinemática inversa por guion, que supera el 99,02% de validación de agarre en disposiciones aleatorias; los episodios fallidos se descartaron. La aleatorización por episodio incluye tablero (casillas de 22-25 mm, borde de 6-22 mm, grosor de 3-20 mm) y bandeja, posición y ángulo del tablero, color del robot (blanco la mayoría de las veces), iluminación de una a cuatro lámparas entre 2700 y 6500 K, mesa y suelo, objetos de desorden (portátil, teléfono, taza, cuaderno, bolígrafo, cables), posición de la cámara cenital (35-80 cm sobre el tablero, hasta 45 grados respecto a la vertical, objetivo de 38-62 grados) y efectos de webcam (autoexposición, balance de blancos, desenfoque, ruido, compresión JPEG, viñeteado). Un detalle técnico crítico documentado por el autor: todos los fotogramas de entrenamiento pasaron por codificación de vídeo H.264 (croma 4:2:0, CRF 30), lo que difumina los cuadrados rojo y azul. La política espera verlos en esa forma degradada, por lo que en inferencia hay que aplicar el mismo ciclo de codificación y decodificación; con fotogramas en crudo el modelo no se movía en absoluto.

## Capacidades

- Generación de acciones de manipulación robótica a partir de imágenes y estado articular, en forma de objetivos de articulación por bloques de 50 pasos.
- Percepción visual de dos cámaras simultáneas (cenital y de muñeca).
- Seguimiento de una instrucción en lenguaje natural (fija, en inglés).
- Aprendizaje de la secuencia motora general de la tarea: acercarse al tablero, descender, cerrar la pinza y levantar.
- No hay evidencia de soporte de tool calling, function calling ni de razonamiento multi-paso: es una política de control, no un modelo de propósito general.
- Capacidades multilingües: no disponible; la instrucción usada es siempre la misma frase en inglés.
- Capacidad especial: ninguna más allá del control visuomotor; no dispone de modo de razonamiento, visión descriptiva ni audio.
- Limitación funcional central: el modelo **no localiza de forma fiable la pieza marcada en escenas nuevas**, que es precisamente la habilidad que necesitaría para completar la tarea.

## Casos de uso

- **Investigación en manipulación robótica con VLA ligeros**: sirve como punto de partida reproducible para estudiar el ajuste fino de SmolVLA en tareas de pick-and-place con brazo SO-101, dado que el proceso completo (datos, hiperparámetros, tiempo de entrenamiento y evaluación) está documentado.
- **Documentación de resultados negativos**: el modelo es un caso de estudio útil sobre cómo una combinación de marcadores visuales pequeños, aleatorización excesiva y pocos pasos de entrenamiento lleva a un 0,0% de éxito en bucle cerrado, con un análisis de causas publicado.
- **Banco de pruebas de percepción visual en simulación**: permite evaluar cómo afectan a una política VLA factores como la compresión H.264, el tamaño de los marcadores (unos 15 píxeles en la vista cenital, unos 10 tras redimensionar a 512 px) o el congelado del codificador visual.
- **Base para un pipeline de ajedrez robótico**: se integraría como módulo "mano" dentro de una arquitectura mayor en la que otro componente decide la jugada y marca las casillas; requeriría resolver antes el problema de localización.
- **Estudio del sesgo de dominio simulación-real**: dado que nunca se ha ejecutado en un brazo real, es un candidato para medir la brecha sim-a-real en políticas entrenadas solo en MuJoCo.
- **Generación de datos sintéticos de demostración**: aunque la política no funcione bien, el conjunto de 2.000 episodios y el experto de cinemática inversa asociados son reutilizables como fuente de demostraciones para otros entrenamientos.
- **Comparación de estrategias de marcadores visuales**: los siguientes pasos propuestos por el autor (marcadores más grandes o con contorno, almacenar fotogramas a mayor calidad, reducir primero la variedad de vistas de cámara) pueden validarse directamente sobre esta misma configuración.

## Benchmarks y rendimiento

El autor publica un único resultado de evaluación: una prueba a bucle cerrado en simulación con 100 episodios, cada uno con una escena nueva aleatoria (disposición, iluminación, colores, desorden y vista cenital no vistos en entrenamiento), con un límite de 20 segundos por episodio. Un episodio se considera exitoso si la pieza acaba a menos de 6 mm de la casilla objetivo o en la bandeja, permanece en pie y ninguna otra pieza se mueve más de 2 mm.

| Metrica | Resultado | Episodios |
|---|---|---|
| Exito global (bucle cerrado, simulacion) | 0,0% | 100 |

Desglose por pieza:

| Pieza | Exito | Episodios |
|---|---|---|
| bishop | 0,0% | 12 |
| king | 0,0% | 5 |
| knight | 0,0% | 15 |
| pawn | 0,0% | 34 |
| queen | 0,0% | 17 |
| rook | 0,0% | 17 |

Desglose por destino, bando y color del brazo:

| Categoria | Valor | Exito | Episodios |
|---|---|---|---|
| Destino | casilla | 0,0% | 91 |
| Destino | bandeja | 0,0% | 9 |
| Bando | blancas | 0,0% | 50 |
| Bando | negras | 0,0% | 50 |

Datos de rendimiento adicionales del entrenamiento: 20.000 pasos, batch 64, una RTX 4090, 4,2 horas; experto de cinemática inversa con 99,02% de validación de agarre. El intento más cercano dejó la pieza a 7,3 mm de su casilla. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni son aplicables a un modelo de control robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en safetensors, el peso en precisión completa ronda los 1,8 GB (450 M x 4 bytes) y en fp16/bf16 unos 0,9 GB, a lo que hay que sumar el coste del procesamiento de dos imágenes de 640x480 y de los tensores de activación.
- GPU empleada en el ajuste fino: una única RTX 4090 (según el autor).
- Encaje en GPU de consumo: SmolVLA está diseñado explícitamente para despliegue en hardware de consumo, según la documentación del modelo base; esta variante debería caber en GPU de gama media/alta, aunque no se publica una cifra concreta de VRAM.
- Opciones de despliegue: la biblioteca indicada es LeRobot 0.4.4; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son adecuadas para una política de control robótico.
- Latencia y throughput: no disponible; el sistema opera con entradas a 30 Hz y devuelve acciones en bloques de 50 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|
| chess_phase_smolvla | 450 M | apache-2.0 | safetensors (lerobot) | Hugging Face |
| lerobot/smolvla_base | 450 M | no disponible en la informacion proporcionada | safetensors (lerobot) | Hugging Face |
| SmolVLA (modelo general de Hugging Face) | 450 M | no disponible en la informacion proporcionada | no disponible | Hugging Face, paper arXiv 2506.01844 |

El modelo base y esta variante comparten arquitectura y tamaño; la diferencia es el ajuste fino sobre una tarea concreta de ajedrez y su estado de validación (0,0% de éxito en simulación). La información proporcionada no incluye datos de contexto, rendimiento ni licencia exportables para otros modelos comparables de la categoría VLA, por lo que no se puede construir una comparativa cuantitativa más amplia sin inventar cifras.

## Limitaciones y advertencias

- **El modelo no funciona**: 0,0% de éxito en 100 episodios de bucle cerrado en simulación. El propio autor lo etiqueta como "primer entrenamiento, todavía no funciona".
- **Nunca se ha probado en un brazo real**: solo se ha evaluado en MuJoCo; el comportamiento sim-a-real es desconocido.
- **Fallo de localización**: aprende el movimiento general (acercarse, descender, cerrar, levantar) pero no encuentra la pieza marcada en escenas nuevas, y a menudo golpea piezas vecinas.
- **Dependencia crítica del preprocesado de imagen**: los fotogramas en vivo deben pasar por el mismo ciclo de codificación/decodificación H.264 que los datos de entrenamiento (función `training_look()` en `sim/camera_effects.py`); con fotogramas en crudo no se mueve. Esto añade fragilidad y latencia.
- **Marcadores visuales muy pequeños**: la casilla ocupa unos 15 píxeles en la vista cenital y unos 10 tras redimensionar a 512 px, degradados además por la compresión; es la causa principal señalada por el autor.
- **Aleatorización excesiva para el volumen de datos**: 2.000 episodios con cámara libre, tamaños y ángulos de tablero variables y múltiples bandos.
- **Entrenamiento corto**: 20.000 pasos (unas 2 épocas) con el codificador visual congelado.
- **Sesgos**: no se documentan sesgos demográficos ni de contenido; al ser una política de control visual, el sesgo relevante es el de la distribución de entrenamiento (iluminación, colores, disposiciones y cámara concretas).
- **Riesgo de alucinación**: no aplica en el sentido generativo; el riesgo equivalente es la generación de acciones plausibles pero incorrectas que dañen piezas o brazo.
- **Restricciones de licencia**: apache-2.0 permite uso comercial, pero el estado funcional del modelo hace inviable cualquier uso en producción.
- **Idioma**: la instrucción usada es siempre la misma frase en inglés; no se documenta soporte de otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Machanize/chess_phase_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Paper de SmolVLA (HTML): https://arxiv.org/html/2506.01844v1
- PDF del paper: https://arxiv.org/pdf/2506.01844
- Blog de Hugging Face sobre SmolVLA: https://huggingface.co/blog/smolvla
- Sitio divulgativo de SmolVLA: https://smolvla.net/index_en
