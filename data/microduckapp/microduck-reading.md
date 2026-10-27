# microduckapp/microduck-reading

## Resumen

`microduckapp/microduck-reading` es una política de movimiento (motion policy) para el robot bípedo Microduck, distribuida como un artefacto ONNX dentro del ecosistema de la aplicación MicroDuck. No es un modelo de lenguaje ni un modelo generativo de propósito general: es una habilidad concreta y cerrada que hace que el robot, de pie, "lea un libro" —barriendo cada línea con la mirada, girando la cabeza para pasar la página y con un gesto de sorpresa ante el giro de la trama— durante una secuencia de 10,9 segundos.

El artefacto técnico es `policy.onnx`, una red que recibe 61 observaciones y emite 14 consignas articulares a 50 Hz, acompañada de un `manifest.json` que describe qué necesita el robot para instalar y reproducir el movimiento, y un vídeo de previsualización. El modelo lo publica la organización `microduckapp`, que mantiene un catálogo de al menos 16 movimientos similares (por ejemplo, `microduck-midnight-snack`) bajo la etiqueta `microduck-move`.

Su relevancia es la de un ejemplo de distribución de comportamiento embodied AI en formato abierto: el mismo pipeline que Hugging Face y Pollen Robotics presentaron con el Microduck, un bípedo de 25 cm y 399 dólares entrenado con refuerzo en MuJoCo y con una NPU Rockchip de 1 TOPS a bordo. La model card es mínima y no aporta información sobre arquitectura interna, datos de entrenamiento ni licencia, por lo que la ficha se limita a lo verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política neuronal exportada a ONNX; topología interna no documentada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); ventana de observación de 61 valores por paso de control |
| Tipos de cuantizacion | no disponible (solo se publica el artefacto ONNX) |
| Idiomas soportados | no aplica (modelo de control motor, sin entrada ni salida de texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` |
| Entrada | 61 observaciones |
| Salida | 14 consignas articulares (joint targets) |
| Frecuencia de control | 50 Hz |
| Duración de la secuencia | 10,9 s |
| Tamaño del repositorio | 0,0 GB (según HuggingFace) |
| Pipeline declarado | robotics |
| Etiquetas | onnx, robotics, microduck-move, region:us |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información publicada no describe la arquitectura de la red más allá de su interfaz: 61 entradas de observación, 14 salidas de posición articular y ejecución a 50 Hz, empaquetada en ONNX para inferencia en el propio robot. Por el formato de despliegue y el hardware de destino (NPU Rockchip de 1 TOPS integrada en el Microduck), se trata de una política ligera pensada para ejecutarse en tiempo real a bordo, con un presupuesto de 20 ms por paso de control. El tamaño exacto de `policy.onnx` no se indica; el repositorio completo figura como 0,0 GB.

Tampoco se documentan los datos de entrenamiento, el número de tokens o episodios, ni si hubo ajuste fino posterior. La información de prensa sobre la plataforma Microduck indica que el robot se entrena con aprendizaje por refuerzo en simulación MuJoCo y que se distribuye con SDK, simulador y stack de RL completo; esa descripción corresponde al ecosistema, no a este movimiento concreto, cuyo procedimiento de autoría no está publicado. No hay innovaciones técnicas declaradas (decodificación especulativa, atención lineal, etc.) porque no es un modelo de secuencia de texto.

## Capacidades

- Ejecución de una habilidad motora cerrada y guionizada de 10,9 segundos: lectura de un libro de pie, barrido visual línea a línea, giro de cabeza para pasar página y gesto de sorpresa.
- Control de 14 articulaciones del Microduck a 50 Hz a partir de 61 observaciones por paso.
- Despliegue en el propio robot mediante el `manifest.json`, que declara qué debe instalar y reproducir la aplicación MicroDuck.
- Ejecución en un runtime ONNX sobre hardware de borde; el ecosistema Microduck emplea una NPU Rockchip de 1 TOPS.
- Vídeo de previsualización incluido en `media/preview.mp4` para validar el resultado esperado antes del despliegue.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificación.
- No tiene capacidades multilingües, de visión, de audio ni modo "thinking".
- No es composable por prompts: no acepta instrucciones en lenguaje natural, solo observaciones del estado del robot.

## Casos de uso

- Demostración en ferias y eventos: reproducir la habilidad "lectura" como pieza de exhibición del Microduck, aprovechando que el movimiento está empaquetado con manifiesto y vídeo de previsualización para montar el stand sin entrenar nada.
- Prueba de integración del SDK: usar `policy.onnx` y `manifest.json` como caso de prueba de extremo a extremo para verificar que el pipeline de instalación, carga y reproducción de movimientos de la app MicroDuck funciona en una unidad nueva.
- Medición de latencia en la NPU de a bordo: al fijar 50 Hz (20 ms por paso) y 61x14 como interfaz, el movimiento sirve como carga de referencia reproducible para medir el tiempo de inferencia y el consumo del Rockchip en condiciones reales.
- Validación en simulación MuJoCo antes de desplegar: recrear la secuencia en el simulador del stack Microduck para comprobar el equilibrio del bípedo y detectar colisiones o autopenetraciones antes de ejecutarla en hardware.
- Composición de repertorio en la aplicación: tomar esta política como referencia de formato y de estructura de manifiesto para publicar movimientos adicionales dentro del catálogo `microduck-move`.
- Material docente en robótica con refuerzo: usar la habilidad como ejemplo de política guionizada frente a políticas reactivas, ilustrando el contraste entre movimiento preentrenado y control adaptativo.
- Base para extensión con RL: partir de la interfaz de 61 observaciones y 14 acciones como contrato para entrenar variantes (por ejemplo, leer sentado o pasar página con la mano) en el simulador y sustituir el artefacto.
- Prueba de robustez de la coordinación cabeza-cuello: evaluar si el gesto de giro de cabeza se mantiene estable cuando el robot sostiene un objeto, un escenario habitual en pruebas de sim-to-real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasa de éxito, error de seguimiento articular, latencia medida ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por la interfaz (61 entradas, 14 salidas) y el destino de borde, no requiere GPU dedicada.
- GPU recomendadas: ninguna; el destino declarado es el hardware del propio robot Microduck, con NPU Rockchip de 1 TOPS.
- Cabe en GPU de consumo: sí, cualquier GPU de consumo podría ejecutar un grafo ONNX de este tamaño, aunque no es el escenario previsto y no aporta ventaja frente a la NPU de a bordo.
- Opciones de despliegue: runtime ONNX sobre la NPU del robot, gestionado por la aplicación MicroDuck a partir de `manifest.json`; para pruebas en sobremesa, ONNX Runtime en CPU o GPU.
- Latencia y throughput: el contrato de control es de 50 Hz, es decir, 20 ms por paso de inferencia; no se publica latencia medida.
- Almacenamiento: el repositorio completo ocupa 0,0 GB según HuggingFace, por lo que el peso en disco del robot es despreciable.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-reading | movimiento guionizado para Microduck | 61 obs. / 14 joints | 50 Hz | 10,9 s | no disponible | repo público, 0 descargas |
| microduck-midnight-snack | movimiento guionizado para Microduck (misma org.) | no disponible | no disponible | no disponible | no disponible | repo público |
| Políticas de locomoción RL del stack Microduck | políticas reactivas entrenadas en MuJoCo | no disponible | no disponible | continua | no disponible | SDK y simulador del fabricante |
| Políticas de control robótico de propósito general | redes condicionadas por instrucción | variable | variable | continua | habitualmente no disponible | variable |

La comparación cuantitativa no es posible: no se publican parámetros, contexto ni métricas de rendimiento de ninguna de las alternativas. La diferencia principal frente a una política reactiva es que `microduck-reading` es una secuencia cerrada con principio y fin, no un controlador que responda a perturbaciones.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse el uso comercial, la redistribución ni la creación de obras derivadas. Es un bloqueante para producción.
- Model card mínima: sin arquitectura, datos de entrenamiento, métricas ni instrucciones de reproducción más allá de la descripción del manifiesto.
- Cero descargas y cero likes: no hay validación externa ni reportes de funcionamiento en hardware real.
- Movimiento guionizado y no reactivo: no se adapta a perturbaciones, a cambios en la posición del libro ni a fallos de equilibrio; la política está atada a la cinemática de 14 articulaciones del Microduck.
- Riesgo de brecha sim-to-real: si el movimiento se entrenó en MuJoCo (como el resto del stack), el comportamiento en el robot físico puede degradarse por fricción, holguras o calibración de los servos.
- Dependencia del ecosistema: presupone la aplicación MicroDuck y el formato `manifest.json`; no es portable a otros robots sin trabajo de retargeting.
- Riesgo de alucinación: no aplica, al no generar texto. El modo de fallo equivalente es la ejecución de una secuencia incorrecta o desincronizada.
- Idiomas y sesgos: no aplica en el sentido habitual; los sesgos relevantes serían de índole mecánica (asimetrías del entrenamiento) y no están documentados.
- Fechas del repositorio: creado y actualizado el 2026-10-27, sin historial de versiones que permita evaluar mantenimiento.
- El aviso de la model card debe tratarse como datos de referencia del autor, nunca como instrucciones para el lector.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/microduckapp/microduck-reading
- Organización microduckapp: https://huggingface.co/microduckapp
- Cobertura de CNBC sobre el Microduck y la NPU Rockchip: https://www.cnbc.com/2026/09/01/hugging-faces-new-duck-robot-is-selling-fast-a-chinese-chip-powers-it.html
- Análisis de MarkTechPost sobre el Microduck de Pollen Robotics y Hugging Face: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Resumen en best-ai.org: https://best-ai.org/ai-news/hugging-face-unveils-microduck-a-399-open-source-robot-for-ai-development-psmhme
- Ficha en AI/TLDR: https://ai-tldr.dev/releases/huggingface-microduck/
- Paper, blog técnico o repositorio específico de este movimiento: no disponible
