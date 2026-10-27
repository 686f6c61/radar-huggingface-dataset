# microduckapp/microduck-banana-peel

## Resumen

`microduck-banana-peel` es una política de control robótico publicada por el usuario `microduckapp` en Hugging Face, etiquetada con el pipeline `robotics` y la familia de movimientos `microduck-move`. No es un modelo de lenguaje ni un modelo generativo de propósito general: es el artefacto de inferencia que reproduce una animación concreta de 10,6 segundos en el robot bípedo Microduck, distribuida como un único fichero `policy.onnx` que recibe 61 observaciones y emite 14 consignas articulares a 50 Hz, acompañado de un `manifest.json` con lo que la app del robot necesita para instalarla.

La relevancia del repositorio es, por tanto, la de un ejemplo de extremo a extremo del formato de distribución de habilidades para la plataforma Microduck de Pollen Robotics y Hugging Face: un robot bípedo open source de 25 cm y 399 dólares, entrenado con aprendizaje por refuerzo en MuJoCo, que se usa como banco de pruebas de transferencia sim-a-real. Este fichero concreto es una habilidad coreografiada («pisa una cáscara de plátano, se queda inclinado y tambaleándose, y luego la rodea de puntillas»), no un comportamiento generalista.

Las limitaciones de información son severas: la model card no documenta arquitectura interna, número de parámetros, dataset de entrenamiento, licencia ni idiomas. El repositorio pesa 0,0 GB según Hugging Face y no tiene descargas ni valoraciones en el momento de la consulta, lo que es coherente con una política de control de tamaño muy reducido y publicación reciente (27 de octubre de 2026).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control robótico exportada a ONNX; topología interna no documentada (no disponible) |
| Parámetros totales | no disponible (tamaño del repositorio: 0,0 GB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 valores por paso de control |
| Tipos de cuantización | no disponible; se distribuye un único `policy.onnx` sin variantes cuantizadas |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), más `manifest.json` y `media/preview.mp4` |
| Pipeline declarado | `robotics` |
| Familia de movimiento | `microduck-move` |
| Entradas | 61 observaciones |
| Salidas | 14 objetivos articulares |
| Frecuencia de control | 50 Hz (periodo de 20 ms) |
| Duración del movimiento | 10,6 s |

## Arquitectura y entrenamiento

La información disponible describe únicamente la interfaz del modelo: un mapeo de 61 observaciones a 14 consignas de articulación, ejecutado en bucle cerrado a 50 Hz y exportado a ONNX para su consumo desde la app de Microduck. No se especifica si el policy es un perceptrón multicapa, una red convolucional, un transformer ligero u otra familia; tampoco se indica el número de capas, el tamaño de las capas ocultas ni el número de parámetros. El `manifest.json` actúa como descriptor de instalación (qué debe instalar y reproducir el robot), no como documentación de entrenamiento.

Sobre el procedimiento de entrenamiento no hay ningún dato en la model card. El contexto público de la plataforma indica que Microduck se entrena con aprendizaje por refuerzo en MuJoCo y que está concebido para transferir comportamientos de simulación a hardware real, por lo que es razonable interpretar esta política como un resultado de ese pipeline, pero la ficha del autor no confirma ni el simulador, ni el algoritmo de RL, ni el número de pasos de entrenamiento, ni si hubo ajuste fino en el robot físico. Tampoco se documentan técnicas de regularización, dominio aleatorizado ni decodificación especulativa (no aplicable en este contexto).

## Capacidades

- Reproducción de una habilidad coreografiada de 10,6 segundos: inclinación lateral, tambaleo y desplazamiento de puntillas alrededor de un obstáculo.
- Control en bucle cerrado a 50 Hz: la política consume 61 observaciones y emite 14 consignas articulares en cada paso, lo que permite corrección continua durante la ejecución.
- Distribución portable vía ONNX: el mismo grafo puede ejecutarse con ONNX Runtime en el robot, en un host externo o en un simulador, sin dependencia del framework de entrenamiento original.
- Instalación guiada por `manifest.json`: la app de Microduck puede descubrir, instalar y reproducir el movimiento sin configuración manual.
- Material de demostración incluido: `media/preview.mp4` documenta visualmente el resultado esperado.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No hay capacidades de lenguaje, visión ni audio documentadas; las 61 observaciones corresponden al estado propioceptivo del robot según el formato de la plataforma, no a entradas multimodales.
- No es multilingüe: no procesa texto.

## Casos de uso

- Demostración de producto y contenido: el `preview.mp4` y la política permiten reproducir una animación memorable del bípedo para vídeos de lanzamiento, documentación o redes, sin necesidad de programar la secuencia a mano.
- Validación del pipeline de instalación de la app: al ser un paquete `microduck-move` completo (`policy.onnx` + `manifest.json`), sirve para verificar de extremo a extremo el flujo de descubrimiento, descarga e instalación de habilidades en la aplicación.
- Prueba de transferencia sim-a-real: ejecutar un movimiento entrenado en simulación sobre el hardware y comparar la inclinación y el tambaleo reales con el vídeo de referencia permite medir el gap de dinámica y el error de seguimiento de las 14 articulaciones.
- Test de regresión del stack de control: tras actualizar firmware, calibrar actuadores o cambiar el controlador de bajo nivel, este movimiento de 10,6 s con posturas laterales extremas es un caso de prueba reproducible con criterio de éxito observable.
- Docencia de robótica y RL: ejemplo mínimo y legible de cómo se empaqueta una política entrenada (observaciones, acciones, frecuencia) para que estudiantes la ejecuten y la modifiquen.
- Composición de secuencias: usar la habilidad como bloque dentro de una coreografía mayor (caminar, detenerse, esquivar) para estudiar transiciones entre políticas y estabilidad del cambio de consigna a 50 Hz.
- Referencia para reentrenamiento: punto de partida para ajustar una política propia con el mismo contrato de entrada/salida (61 → 14 a 50 Hz) sobre la plataforma Microduck.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, error de seguimiento articular, tasa de éxito del movimiento ni comparación con otras políticas de la plataforma, y el repositorio no registra descargas ni valoraciones que permitan inferir un uso evaluado.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio (0,0 GB) y el contrato de la política (61 entradas, 14 salidas) apuntan a un modelo de cómputo muy reducido, apto para inferencia en CPU, pero no hay cifras oficiales.
- GPU recomendadas: no se documenta ninguna. Para una política de este tamaño no es esperable que se requiera GPU; una GPU solo tendría sentido para entrenamiento o para entrenar políticas derivadas.
- Cabe en GPU de consumo: previsiblemente sí, en cualquier GPU con soporte de ONNX Runtime; no confirmado por el autor.
- Despliegue: ONNX Runtime (CPU o CUDA) es la vía natural dado el formato; la vía oficial es la app de Microduck, que consume `manifest.json` y `policy.onnx`. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no aplica, son servidores de modelos de lenguaje.
- Latencia y throughput: el requisito implícito es sostener un periodo de control de 20 ms (50 Hz) de forma estable; no se publican latencias medidas por hardware objetivo.
- Aceleradores embebidos: la ejecución en SBC o en el propio robot es plausible por el tamaño del artefacto, pero no está documentada.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de conocimiento general sobre el ecosistema y no han sido verificados en la información proporcionada; se incluyen como orientación.

| Modelo | Tipo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-banana-peel | Política de control preentrenada (ONNX) | no disponible (repo 0,0 GB) | 61 observaciones → 14 articulaciones a 50 Hz | no disponible | Hugging Face, 0 descargas |
| Otras habilidades `microduck-move` | Políticas de control (ONNX) | no disponible | Contrato 61 → 14 a 50 Hz, previsiblemente | no disponible | Según cada repositorio de la familia |
| ACT (LeRobot) | Política de imitación para brazos manipuladores | del orden de decenas de millones | Entradas visuales y de estado; horizonte de acciones configurable | Apache 2.0 | Código y pesos públicos en LeRobot |
| Diffusion Policy | Política de imitación basada en difusión | del orden de decenas de millones | Observaciones visuales/proprioceptivas, predicción de secuencias de acciones | MIT | Código y pesos públicos |
| OpenVLA | Modelo visión-lenguaje-acción | 7 000 millones | Imagen + instrucción en lenguaje | MIT | Pesos públicos en Hugging Face |

La diferencia clave frente a ACT, Diffusion Policy y OpenVLA es el alcance: aquellos son marcos generales entrenables para múltiples tareas y morfologías, mientras que este artefacto es una habilidad cerrada, específica de un robot y sin información de entrenamiento ni licencia publicadas.

## Limitaciones y advertencias

- Licencia no disponible: sin términos explícitos no puede asumirse uso comercial, redistribución ni modificación; hay que contactar con el autor antes de integrarlo en un producto.
- Ausencia total de documentación de entrenamiento: sin dataset, algoritmo, número de pasos ni métricas, no es posible evaluar robustez, sobreajuste ni generalización.
- Acoplamiento al hardware: las 61 observaciones y las 14 articulaciones de salida corresponden a la morfología y calibración del Microduck; el modelo no es reutilizable en otro robot sin reentrenar.
- Movimiento fijo y de corta duración: 10,6 segundos de secuencia coreografiada; no generaliza a obstáculos, pendientes o perturbaciones distintas de las contempladas.
- Requisito temporal estricto: debe ejecutarse a 50 Hz estables; una caída de frecuencia o jitter en el bus de actuadores puede degradar el equilibrio y provocar una caída real del robot.
- Sin capacidades de lenguaje ni visión: no admite instrucciones en lenguaje natural ni interpreta el entorno mediante cámara, según la información disponible.
- Riesgo de confusión por el nombre: «banana» en el identificador puede llevar a buscar resultados sobre modelos generadores de imagen de Google (Nano Banana), completamente ajenos a este repositorio.
- Sin señales de adopción: 0 descargas y 0 valoraciones implican ausencia de validación por terceros.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo análogo es de comportamiento impredecible fuera del dominio de entrenamiento, no cuantificado.
- Sesgos: no evaluables con la información disponible al no existir dataset ni proceso de entrenamiento documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-banana-peel
- Perfil del autor en Hugging Face: https://huggingface.co/microduckapp
- Anuncio de Microduck (Pollen Robotics / Hugging Face), The AI Insider: https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-open-source-microduck-robot/
- Microduck, bípedo open source de 399 dólares entrenado con RL en MuJoCo, MarkTechPost: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Paper, blog técnico, repositorio de código y demo interactiva: no disponibles en la información proporcionada.
