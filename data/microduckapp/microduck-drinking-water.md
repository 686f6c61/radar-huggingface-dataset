# microduckapp/microduck-drinking-water

## Resumen

Microduck-drinking-water es una política de control motriz en formato ONNX publicada por el usuario microduckapp bajo el paraguas del proyecto MicroDuck. No es un modelo de lenguaje ni un modelo generativo de propósito general: es una política de robótica que implementa un movimiento concreto de 10,4 segundos para el robot bípedo MicroDuck, descrito por el autor como «baja la cabeza despacio hacia el agua y luego la inclina hacia atrás para tragar: sorbo, trago, sorbo, trago».

El artefacto principal, `policy.onnx`, recibe 61 observaciones y emite 14 objetivos articulares a 50 Hz, lo que equivale a unas 520 inferencias por reproducción completa del movimiento. Se distribuye junto a un `manifest.json` que indica al robot qué debe instalar para reproducirlo y un vídeo de previsualización en `media/preview.mp4`. El repositorio tiene un tamaño reportado de 0,0 GB, descargas y likes a cero en el momento de la consulta, y licencia no declarada.

Su relevancia es acotada pero ilustrativa: forma parte del ecosistema de «movimientos» (tag `microduck-move`) que la aplicación MicroDuck distribuye para el robot de 399 dólares desarrollado por Pollen Robotics y Hugging Face, un bípedo de 25 cm con 15 motores, cámara, sensor de profundidad, dos sensores de movimiento y pico articulado. La ficha, por tanto, debe leerse como documentación de un controlador de comportamiento y no como la de un modelo fundacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control motriz exportada a ONNX; no se documenta la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; ventana de observación de 61 valores por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) |
| Tipo de modelo | política de robótica / movimiento preentrenado |
| Pipeline declarado | robotics |
| Entradas | 61 observaciones |
| Salidas | 14 objetivos articulares |
| Frecuencia de control | 50 Hz |
| Duración del movimiento | 10,4 segundos |
| Artefactos del repo | `policy.onnx`, `manifest.json`, `media/preview.mp4` |
| Tags | onnx, robotics, microduck-move, region:us |
| Tamano del repositorio | 0,0 GB (reportado) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-27 |
| Ultima actualizacion | 2026-10-27 |

## Arquitectura y entrenamiento

La información pública no describe la arquitectura interna de la política. Lo único verificable es la interfaz de inferencia: un grafos ONNX que consume un vector de 61 observaciones y produce 14 objetivos articulares, ejecutado a 50 Hz. No se especifica si las observaciones son proprioceptivas, exteroceptivas (cámara, profundidad) o una mezcla, ni si el modelo incorpora memoria recurrente o es puramente reactivo por paso. Tampoco se detalla si la política se entrenó en simulación con transferencia sim-to-real, si se ajustó por imitación a partir de demostraciones o si se destiló de un controlador previo.

No hay datos sobre volumen de entrenamiento, composición del dataset, número de tokens (no aplica), ni sobre fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o control predictivo. El material aportado por el autor se limita a la descripción cualitativa del gesto («sorbo, trago, sorbo, trago, ahh»), la duración y el contrato de entrada/salida. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa.

## Capacidades

- Reproducción de un gesto de bebida de 10,4 segundos sobre el robot MicroDuck, con descripción cualitativa de cuatro fases (sorbo, trago, sorbo, trago).
- Control articular de bajo nivel: emite 14 objetivos a 50 Hz, es decir, un comando por articulación cada 20 ms.
- Instalación y reproducción gestionadas por la aplicación MicroDuck a través de `manifest.json`.
- Ejecución de inferencia en formato ONNX, portable a runtimes compatibles sin dependencia de PyTorch.
- Distribución de un vídeo de referencia (`media/preview.mp4`) que documenta visualmente el resultado esperado del movimiento.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio: es un controlador específico de tarea.

## Casos de uso

- Demostración de comportamiento en ferias y presentaciones: el movimiento sirve como escena corta y reconocible para mostrar el robot MicroDuck en acción, con una duración de 10,4 segundos adecuada para bucles de demostración.
- Pruebas de integración del runtime de la app: al ser un ONNX de interfaz fija (61→14 a 50 Hz), permite verificar la cadena completa de carga de manifiesto, reproducción y parada sin necesidad de entrenar nada.
- Secuenciación de comportamientos: el movimiento puede encadenarse con otros del tag `microduck-move` para construir rutinas más largas (por ejemplo, caminar hasta un punto y beber), siempre que la app permita concatenación y transiciones.
- Docencia en robótica e imitación: sirve como ejemplo mínimo y auditable de política de control con contrato de entrada/salida explícito para explicar conceptos de observaciones, acciones y frecuencia de control en un curso introductorio.
- Generación de material audiovisual: el clip de 10,4 segundos y su previsualización son útiles como recurso grabable para vídeos de producto o contenido en redes sin tener que animar el gesto manualmente.
- Validación de transferencia sim-to-real en la plataforma: comparar la ejecución real del gesto con la previsualización proporcionada permite detectar degradaciones de calibración articular o de sincronización temporal.
- Pruebas de robustez del hardware: someter al robot a repeticiones del ciclo de inclinación y retorno ayuda a medir desgaste de servos y consumo en un patrón de movimiento acotado y repetible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de éxito de la tarea, error de seguimiento articular, tasas de caída, latencia de inferencia ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio reporta 0,0 GB de tamaño, lo que sugiere un artefacto muy pequeño, pero no se publica el tamaño exacto de `policy.onnx` ni el número de parámetros.
- GPU recomendadas: no disponibles. Por la dimensión del contrato de entrada/salida (61 observaciones, 14 salidas) y la frecuencia de 50 Hz, es plausible la ejecución en CPU del propio robot o del dispositivo anfitrión, pero esto no está confirmado por el autor.
- Cabe en GPU de consumo: no confirmado. No se especifica ningún requisito de acelerador; el formato ONNX permite ejecución en CPU mediante ONNX Runtime.
- Opciones de despliegue: ONNX Runtime es el runtime natural dado el formato. El autor indica que la instalación y reproducción se gestionan desde la aplicación MicroDuck mediante `manifest.json`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. El único dato temporal es la frecuencia de control de 50 Hz, que implica un presupuesto de 20 ms por paso de inferencia para mantener el tiempo real.
- Dependencia de plataforma: el modelo está atado a la morfología y calibración del robot MicroDuck (25 cm, 15 motores, pico articulado según las fuentes del fabricante); no es reutilizable en otros cuerpos sin reentrenamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduckapp/microduck-drinking-water | política de movimiento ONNX | 61 → 14 | 50 Hz | no disponible | Hugging Face, 0 descargas |
| Otros movimientos del tag `microduck-move` | políticas de movimiento de la app MicroDuck | no disponible | no disponible | no disponible | no verificados individualmente |
| Políticas de locomotion para MicroDuck (entrenadas con simulación según cobertura de prensa) | políticas de locomoción | no disponible | no disponible | no disponible | mencionadas en prensa, sin ficha técnica pública localizada |

No se han identificado en la información disponible modelos directamente comparables de otros autores para esta tarea concreta (gesto de bebida en un bípedo de 15 motores). La comparación cuantitativa de parámetros, contexto y rendimiento no es posible con los datos aportados.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial, redistribución ni modificación; conviene contactar con el autor antes de integrarlo en un producto.
- Ausencia total de documentación técnica: no se especifica arquitectura, dataset, proceso de entrenamiento ni métricas, lo que impide evaluar robustez o generalización.
- Tarea única y no parametrizable: el modelo reproduce un gesto fijo de 10,4 segundos; no acepta condicionamiento por texto, objetivos ni instrucciones.
- Acoplamiento al hardware: 14 objetivos articulares frente a los 15 motores descritos en las fuentes del fabricante; el mapeo entre salidas y actuadores no está documentado, lo que complica la reutilización o la depuración.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de ejecución incorrecta del gesto ante calibraciones distintas, superficies irregulares o desgaste de servos, sin que se documenten comportamientos de recuperación.
- Sin salvaguardas declaradas: no se describe ninguna parada de emergencia, limitación de par ni gestión de fallos durante la reproducción.
- Idiomas y sesgos: no disponibles; al no procesar lenguaje, las consideraciones lingüísticas no aplican, pero tampoco se documenta el sesgo de dominio (posible sobreajuste a una posición inicial o a una altura de agua concreta).
- Madurez nula como artefacto: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones públicas localizadas, lo que reduce la probabilidad de soporte comunitario.
- Trazabilidad temporal: el repositorio se creó y actualizó el mismo día (2026-10-27), sin historial de versiones que permita evaluar cambios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-drinking-water
- TechRepublic — Nvidia teaches a $399 duck robot to walk using AI: https://www.techrepublic.com/article/news-nvidia-microduck-robot-ai-walking/
- TechCrunch — Hugging Face is selling a cute $399 open source duck robot, Microduck: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- CNX Software — Microduck, a duck-like biped robot designed for physical AI experimentation and fun: https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
- Sitio oficial de Microduck (preventa): https://microducks.org/
- Tutorial de terceros sobre Microduck (análisis de masa madre; no relacionado con este movimiento): https://aiindigo.com/tutorials/getting-started-with-microduck-mastering-sourdough-health
