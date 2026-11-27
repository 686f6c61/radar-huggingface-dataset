# briskVLA/shallow_8L_late

## Resumen

briskVLA/shallow_8L_late es un checkpoint de investigacion derivado de SmolVLA, el modelo de vision-lenguaje-accion (VLA) compacto de LeRobot orientado a control robotico. Lo publica el proyecto briskVLA como parte de una linea de trabajo centrada en reducir la profundidad del "action expert" de SmolVLA: en lugar de mantener la pila completa de capas del experto, este checkpoint conserva unicamente ocho capas (indices 8 a 15) y aplica un layout canonico denominado "late". El resultado es un modelo de aproximadamente 401 millones de parametros (400.923.616 segun los pesos en safetensors) que hereda el backbone y la cabeza de accion del modelo base lerobot/smolvla_libero mediante fine-tuning.

El modelo no es un VLA de proposito general ni un modelo de lenguaje conversacional: es una politica robotica entrenada para ejecutar tareas de manipulacion en el benchmark LIBERO, tomando observaciones visuales y estado del robot como entrada y emitiendo acciones motoras. Su relevancia es metodologica: sirve para estudiar como afecta la profundidad del experto de accion a la tasa de exito y a la latencia de inferencia en entornos de investigacion en robotica, y como punto de partida para destilaciones posteriores (por ejemplo, de 8L a 4L) documentadas en la propia model card.

La ficha se basa exclusivamente en los metadatos de Hugging Face, el contenido de la model card y los datos de pesos disponibles. No se han publicado resultados de benchmarks, licencia ni lista de idiomas en la informacion accesible, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) derivada de SmolVLA; action expert reducido a 8 capas (indices 8-15), layout canonico "late" |
| Parametros totales | 400.923.616 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo de robotica; las instrucciones de tarea en LIBERO son en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_libero (commit a24f1f380461) |
| Rol / variante | shallow, 8L, layout late |
| Ancho de FFN del experto | default (2048) |
| Tamano del repo | 0,8 GB |
| Libreria | lerobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo sigue el diseno de SmolVLA: un backbone de vision-lenguaje que procesa observaciones visuales e instrucciones en lenguaje natural, acoplado a un "action expert" que genera secuencias de acciones mediante un esquema de difusion o flow matching (segun la implementacion de LeRobot). La innovacion de este checkpoint concreto es estructural: se ha recortado la profundidad del experto de accion a ocho capas, conservando las capas 8 a 15 del modelo original y aplicando un layout "late", es decir, manteniendo las capas profundas del experto y descartando las iniciales. El ancho de las FFN del experto se mantiene en el valor por defecto (2048).

El entrenamiento parte del modelo base lerobot/smolvla_libero mediante fine-tuning sobre el benchmark LIBERO, un conjunto de tareas de manipulacion robotica con instrucciones en lenguaje natural. La model card documenta el flujo de evaluacion (K=10 y K=1), la medicion de latencia y los scripts de destilacion y construccion de estudiantes (por ejemplo, reducir de 8L a 4L fusionando FFN y conservando capas alternas), pero no detalla el numero de tokens, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. Esos datos deben considerarse no disponibles.

## Capacidades

- Control robotico por instrucciones en lenguaje natural: genera acciones motoras a partir de observaciones visuales y una orden textual, en el marco del benchmark LIBERO.
- Manipulacion de objetos en entornos simulados de escritorio (LIBERO incluye tareas de apilar, abrir cajones, colocar objetos, etc.).
- Inferencia de baja latencia: al reducir el experto a 8 capas, el coste computacional por paso de accion disminuye frente al modelo base completo, lo que se traduce en menor latencia (la model card incluye un script especifico de medicion).
- Evaluacion con distintos horizontes de ejecucion (K=10 y K=1), util para analizar el compromiso entre re-planificacion frecuente y coste.
- Base para destilacion y compresion adicional: los scripts `distill_student.py` y `build_student.py` permiten continuar el entrenamiento o generar estudiantes mas pequenos.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo thinking; se trata de una politica robotica, no de un asistente conversacional.

## Casos de uso

- Investigacion en eficiencia de arquitecturas VLA: comparar la tasa de exito y la latencia de este checkpoint de 8 capas frente al SmolVLA completo en LIBERO para cuantificar el coste de recortar profundidad en el experto de accion.
- Evaluacion estandarizada en LIBERO: ejecutar `run_eval.sh` con K=10 y K=1 para obtener metricas reproducibles de exito por tarea y analizar el efecto del horizonte de ejecucion.
- Medicion de latencia en hardware concreto: usar `latency.py` para generar perfiles de latencia por paso de accion y decidir si el modelo cumple los requisitos de un bucle de control a una frecuencia dada.
- Punto de partida para destilacion: emplear `distill_student.py` para entrenar un estudiante a partir de este checkpoint y estudiar la transferencia de politica entre profundidades.
- Generacion de estudiantes mas pequenos: usar `build_student.py` con `--group 2 --keep alternate --ffn fuse` para construir una variante de 4 capas y comparar su rendimiento con la de 8 capas.
- Prototipado de politicas de manipulacion en simulacion: integrar el checkpoint en un pipeline de LeRobot para experimentar con tareas de LIBERO antes de trasladar la politica a un entorno real.
- Docencia y divulgacion: ilustrar de forma practica como se recorta y evalua un VLA compacto en un entorno de investigacion abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe los comandos de evaluacion en LIBERO (K=10 y K=1) y de medicion de latencia, pero no incluye cifras de tasa de exito, latencia ni comparaciones numericas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 0,8 GB en safetensors, por lo que en precision completa (fp32) los pesos rondan los 1,6 GB y en bf16/fp16 aproximadamente 0,8 GB. La VRAM total necesaria depende del backbone de vision-lenguaje y de las activaciones; no se documenta una cifra oficial.
- GPU recomendadas: no hay recomendaciones publicadas. Por tamano, el modelo deberia caber en GPUs de consumo con al menos 8-12 GB de VRAM, aunque la latencia real depende del backbone y del hardware.
- Cabe en GPU de consumo: probablemente si, en tarjetas tipo RTX 3060/4060/4090, siempre que el backbone y las activaciones lo permitan; no confirmado por el autor.
- Opciones de despliegue: la libreria de referencia es LeRobot (scripts `run_eval.sh` y `latency.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a politicas de accion.
- Latencia y throughput: no disponibles; la model card proporciona el script para medirlos, pero no publica resultados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| briskVLA/shallow_8L_late | 400.923.616 | no disponible | VLA con action expert de 8 capas (layout late) | no disponible | Hugging Face (0 descargas) |
| lerobot/smolvla_libero | no disponible en la informacion proporcionada | no disponible | SmolVLA completo fine-tuneado en LIBERO (modelo base) | no disponible | Hugging Face (LeRobot) |
| Otros checkpoints briskVLA (p. ej., variantes 4L) | no disponible | no disponible | Variantes destiladas/recortadas del mismo linaje | no disponible | Referenciados en los scripts de la model card |

La comparacion cuantitativa de rendimiento entre estas variantes no es posible con la informacion disponible, ya que no se publican tasas de exito ni latencias.

## Limitaciones y advertencias

- Modelo de investigacion: es un checkpoint derivado de un fine-tuning sobre LIBERO, no una politica lista para produccion ni para robots reales sin validacion adicional.
- Sin licencia declarada: la ausencia de licencia impide determinar si el uso comercial esta permitido; debe consultarse al autor antes de cualquier uso productivo.
- Sin datos de benchmarks: no hay evidencia publicada de tasa de exito ni de latencia, por lo que no se puede afirmar que el recorte a 8 capas preserve el rendimiento del modelo base.
- Dominio limitado: entrenado para tareas de manipulacion de LIBERO; es previsible un mal rendimiento fuera de esa distribucion de tareas, objetos y entornos.
- Idiomas: no se documenta soporte multilingue; las instrucciones de LIBERO estan en ingles.
- Riesgo de alucinacion y sesgos: no se documentan analisis de sesgo ni de robustez; al ser una politica de accion, el fallo se manifiesta como acciones incorrectas o inseguras, no como texto erroneo.
- Reproducibilidad: la model card referencia scripts de un repositorio de proyecto (`project/briskvla/...`) que no se enlaza en la informacion disponible; conviene verificar su disponibilidad antes de depender de ellos.
- Popularidad nula: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/briskVLA/shallow_8L_late
- Modelo base: https://huggingface.co/lerobot/smolvla_libero
- LeRobot (libreria): https://github.com/huggingface/lerobot
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales relacionados con este checkpoint.
