# microduckapp/microduck-kick-spasm

## Resumen

`microduck-kick-spasm` es una política de control motriz en formato ONNX publicada por el usuario `microduckapp` para el robot bípedo Microduck. No se trata de un modelo de lenguaje ni de un modelo fundacional: es una "move" (animación de movimiento) de 10,5 segundos que traduce 61 observaciones de entrada en 14 consignas articulares a 50 Hz. El repositorio incluye además un `manifest.json` con los requisitos de instalación y reproducción en la app MicroDuck y un vídeo de previsualización.

El modelo resuelve un problema muy acotado: empaquetar un comportamiento motor concreto (pisoteo y sacudidas con la mirada fija en los pies) como un artefacto portable que el robot puede instalar y ejecutar mediante la app. Es relevante dentro del ecosistema Microduck, el robot bípedo de 25 cm y 15 motores presentado por Pollen Robotics y Hugging Face, porque ilustra el patrón de distribución de habilidades motoras como políticas ONNX versionadas en Hugging Face.

La información publicada es mínima: no hay model card técnica, no se documenta la arquitectura interna de la red, no hay licencia declarada, no hay resultados de evaluación y el repositorio ocupa 0,0 GB según los metadatos. Las cifras de descargas y likes son ambas cero, lo que sugiere una publicación reciente (creada y actualizada el 2026-10-27 con tres segundos de diferencia) y sin adopción registrada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de control robótico empaquetada en ONNX; topología interna no documentada) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No aplica; entrada de 61 observaciones por paso, ventana temporal no disponible |
| Tipos de cuantizacion | No disponible (el artefacto distribuido es ONNX; no se documentan variantes ni precisión) |
| Idiomas soportados | No aplica (modelo de control motor, no lingüístico) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`), más `manifest.json` y `media/preview.mp4` |

| Parametro operativo declarado | Valor |
|---|---|
| Observaciones de entrada | 61 |
| Salidas | 14 consignas articulares |
| Frecuencia de control | 50 Hz (ciclo de 20 ms) |
| Duración del movimiento | 10,5 s (aproximadamente 525 pasos de control) |
| Pipeline en Hugging Face | `robotics` |
| Etiquetas | `onnx`, `robotics`, `microduck-move`, `region:us` |

## Arquitectura y entrenamiento

La política se distribuye como un grafo ONNX que mapea un vector de 61 observaciones a 14 objetivos articulares, ejecutado en bucle cerrado a 50 Hz durante 10,5 segundos. No se especifica si la red es un MLP, una política recurrente o un transformer pequeño; tampoco se detallan las 61 dimensiones de observación (posiciones articulares, velocidades, lecturas de IMU, fase de la marcha u otras), ni las 14 articulaciones objetivo dentro de los 15 motores del Microduck.

No hay información sobre el proceso de entrenamiento: ni número de tokens o muestras, ni si se empleó aprendizaje por refuerzo en simulación, imitación de movimiento o aprendizaje por demostración. Tampoco se documenta el pipeline de sim-to-real, la aleatorización de dominio aplicada ni el cómputo utilizado. La única innovación técnica identificable es el formato de empaquetado: una habilidad motora autocontenida con manifiesto de instalación asociada a la etiqueta `microduck-move`, pensada para su carga desde la app MicroDuck.

## Capacidades

- Generación de una secuencia de movimiento pregrabada de 10,5 s: pisoteo y sacudidas en el sitio con la cabeza orientada hacia los pies.
- Control cinemático de 14 articulaciones del Microduck a 50 Hz, presumiblemente compatible con los 15 motores del robot (la articulación restante no se especifica).
- Inferencia en tiempo real: el presupuesto por paso es de 20 ms, adecuado para ejecución en CPU o en el cómputo embebido del robot.
- Instalación y reproducción gestionadas por la app MicroDuck a través de `manifest.json`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso, agentes ni planificación.
- No tiene capacidades multilingües, de visión, de audio ni de generación de texto.
- No se documenta modo "thinking", adaptación a terreno ni recuperación ante caídas.

## Casos de uso

- Demostración de habilidades motoras en el Microduck: cargar `policy.onnx` mediante el manifiesto e invocar el movimiento desde la app para exhibir el repertorio del robot en presentaciones o vídeos de producto.
- Material de referencia para creadores de movimientos: sirve como ejemplo funcional del contrato de interfaz `microduck-move` (61 entradas, 14 salidas, 50 Hz) para que otros autores empaqueten sus propias políticas con la misma estructura.
- Prueba de integración del runtime ONNX en el robot: validar que el cómputo embebido del Microduck sostiene un bucle de control a 50 Hz con un grafo de este tamaño antes de desplegar políticas más exigentes.
- Verificación del pipeline de instalación: comprobar que `manifest.json`, los assets de vídeo y el binario ONNX se resuelven correctamente en la app, útil para tests de regresión del sistema de distribución de movimientos.
- Contenido divulgativo y educativo: ilustrar cómo se publica una habilidad robótica como artefacto versionado en Hugging Face, con trazabilidad de identificador, etiquetas y fecha.
- Pruebas de desgaste y caracterización mecánica: ejecutar de forma repetida un movimiento con sacudidas para medir consumo de los servos, temperatura y estabilidad del soporte en banco de pruebas, siempre con supervisión física.
- No es adecuado para tareas de navegación, manipulación, interacción con personas ni operación autónoma en entornos no controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos operativos verificables son los declarados en la model card: 61 observaciones de entrada, 14 salidas articulares, 50 Hz y 10,5 s de duración. No hay métricas de seguimiento de trayectoria, error de posición, tasa de éxito, robustez ante perturbaciones ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del artefacto y la tarea, es esperable que la inferencia sea en CPU, sin requisito de GPU, aunque el fabricante no lo declara.
- GPU recomendadas: no disponibles ni necesarias para este tipo de política; no se documenta aceleración por GPU en el robot.
- Compatibilidad con GPU de consumo: no aplica; el despliegue previsto es en el cómputo embebido del Microduck, cuyas especificaciones no se detallan en la información disponible.
- Opciones de despliegue: ONNX Runtime como runtime mínimo; alternativas viables en teoría son OpenVINO o TensorRT para hardware Intel o NVIDIA respectivamente, aunque no hay confirmación de compatibilidad con el robot.
- Latencia: el bucle de control impone 20 ms por paso (50 Hz); el tiempo real de inferencia del grafo no está publicado.
- Throughput: no disponible.
- Almacenamiento: el repositorio completo ocupa 0,0 GB según los metadatos, por lo que el peso del ONNX es reducido (no se da la cifra exacta).

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas `microduck-move` publicadas con las que comparar parámetros, contexto o rendimiento, ni benchmarks que permitan situar esta política frente a alternativas de control para el mismo robot.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-kick-spasm | No disponible | 61 observaciones por paso | Sin benchmarks publicados | No disponible | Hugging Face (`microduckapp/microduck-kick-spasm`) |
| Otras políticas `microduck-move` | No disponible | No disponible | No disponible | No disponible | No disponibles en la información consultada |
| Políticas de locomoción para bípedos de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se concede permiso explícito de uso comercial, redistribución ni modificación; en producción hay que tratar el artefacto como no licenciado hasta contactar con el autor.
- Documentación insuficiente: no se describen arquitectura, datos de entrenamiento, proceso de validación ni las 61 dimensiones de observación, lo que impide auditar el comportamiento.
- Cero adopción registrada (0 descargas, 0 likes) y publicación de 2026-10-27: no hay evidencia de que el movimiento haya sido validado por terceros ni de que funcione en hardware real más allá del vídeo de previsualización.
- Riesgo de daño mecánico: un movimiento de pisoteo y sacudidas repetido puede someter los servos y la estructura a cargas cíclicas; no se documentan límites de par, rangos articulares ni protecciones.
- Brecha sim-to-real desconocida: al no indicarse el método de entrenamiento, no puede evaluarse si la política es robusta ante variaciones de fricción, terreno, batería o calibración de los motores.
- Naturaleza no generativa: no admite prompts, instrucciones en lenguaje natural ni adaptación en tiempo de ejecución; produce una única secuencia fija.
- Dependencia del manifiesto y de la app MicroDuck: el uso fuera de ese ecosistema requiere interpretar `manifest.json` y el contrato de observaciones por cuenta propia.
- Sin garantías de seguridad: no debe ejecutarse cerca de personas, mascotas u objetos frágiles sin supervisión y sin verificar previamente la sujeción del robot.
- Idiomas: no aplica; cualquier expectativa de procesamiento de lenguaje es un error de categoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-kick-spasm
- Perfil del autor en Hugging Face: https://huggingface.co/microduckapp/datasets
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Artículo de CNX Software sobre Microduck: https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
- Artículo de TechCrunch sobre Microduck: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- Página oficial de compra de Microduck: https://microducks.org/
