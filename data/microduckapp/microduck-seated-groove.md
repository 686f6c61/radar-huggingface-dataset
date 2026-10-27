# microduckapp/microduck-seated-groove

## Resumen

`microduck-seated-groove` es una política de control motriz en formato ONNX publicada por el usuario `microduckapp` en Hugging Face, etiquetada con el pipeline `robotics` y la etiqueta `microduck-move`. No es un modelo de lenguaje ni un modelo generativo de propósito general: es una "habilidad" o *move* empaquetada para el robot bípedo Microduck, un robot con forma de pato de 25 cm desarrollado por Pollen Robotics y Hugging Face. La model card la describe como un movimiento de 10,4 segundos que hace girar la cabeza en círculos lentos y suaves y ejecuta rotaciones de hombros, realizado sin desplazamiento sobre el propio terreno.

El artefacto principal es `policy.onnx`, que recibe 61 observaciones y emite 14 consignas de articulación a 50 Hz, acompañado de un `manifest.json` con los requisitos de instalación y reproducción, y un vídeo de previsualización. El modelo resuelve un problema muy acotado: dotar al robot de un comportamiento expresivo reproducible y descargable desde la aplicación MicroDuck, sin que el usuario tenga que entrenar nada.

Su relevancia es la del ecosistema en el que se inserta: Microduck se presentó en agosto de 2026 como un bípedo open source de 399 dólares, 15 motores, cámara, sensor de profundidad, dos sensores de movimiento y pico articulado, entrenado con aprendizaje por refuerzo en MuJoCo. Este repositorio es una pieza de ese catálogo de movimientos intercambiables; el perfil `microduckapp` alberga del orden de 16 modelos de este tipo. El repositorio tiene 0 descargas y 0 likes, y un tamaño declarado de 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de control exportada a ONNX; topología interna no especificada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 valores por paso |
| Tipos de cuantizacion | no disponible; se distribuye un único `policy.onnx` sin variantes cuantizadas declaradas |
| Idiomas soportados | no aplica (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` + `media/preview.mp4` |
| Entradas | 61 observaciones |
| Salidas | 14 objetivos de articulación |
| Frecuencia de control | 50 Hz (paso de 20 ms) |
| Duración del movimiento | 10,4 segundos |
| Pipeline declarado | robotics |
| Etiquetas | onnx, robotics, microduck-move, region:us |
| Tamano del repositorio | 0,0 GB |
| Fecha de creacion | 2026-10-27 |
| Ultima actualizacion | 2026-10-27 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la política: la model card solo declara el contrato de entrada/salida (61 observaciones a 14 consignas articulares a 50 Hz) y el formato de exportación ONNX. No se especifica si se trata de un perceptrón multicapa, una red recurrente, un transformer pequeño o una política con memoria; tampoco el número de capas, el ancho de las mismas ni el recuento de parámetros. Dado el tamaño declarado del repositorio (0,0 GB) y la dimensionalidad del contrato, se trata con alta probabilidad de una red de pequeño tamaño, pero el dato exacto no está publicado.

Tampoco se documentan los datos de entrenamiento de este movimiento concreto: ni el número de pasos de simulación, ni la composición del dataset, ni si hubo ajuste fino con preferencias humanas. El contexto público del proyecto indica que la plataforma Microduck se entrena con aprendizaje por refuerzo en MuJoCo, y que el robot físico cuenta con 15 motores, cámara, sensor de profundidad, dos sensores de movimiento y un pico articulado; la política, sin embargo, emite 14 objetivos articulares, un valor que no coincide con el número de motores y cuya correspondencia exacta (posible exclusión de un actuador del pico o de un grado de libertad no usado en este movimiento) no está aclarada en la información disponible.

Como innovación destacable, el interés técnico no está en la arquitectura sino en el formato de distribución: una habilidad motriz empaquetada como política ONNX más un manifiesto de instalación, lo que permite que la aplicación MicroDuck instale y reproduzca el movimiento de forma determinista en el robot, sin reentrenamiento ni toolchain de RL en el dispositivo.

## Capacidades

- Ejecución de una secuencia motriz predefinida de 10,4 segundos: círculos de cabeza lentos y suaves y rotaciones de hombros tipo "lounge", sin desplazamiento del robot.
- Control articular en bucle cerrado a 50 Hz: consume 61 observaciones y produce 14 objetivos de articulación por paso.
- Reproducción determinista e instalable mediante `manifest.json` desde la aplicación MicroDuck.
- Previsualización del comportamiento incluida en el repositorio (`media/preview.mp4`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües: no procesa texto ni voz.
- No incluye visión, audio ni modo "thinking"; la percepción, si la hay, llega como parte del vector de 61 observaciones.
- No es composable por sí mismo: es una habilidad única, no un modelo de propósito general al que se le puedan pedir tareas nuevas.

## Casos de uso

- Demostración de expresividad robótica: instalar el movimiento en un Microduck físico para mostrar en vídeo o en un stand cómo un bípedo de 25 cm ejecuta una animación fluida y de bajo impacto, sin necesidad de escribir controladores.
- Catálogo de animaciones para la aplicación MicroDuck: el movimiento se ofrece como una entrada más del catálogo de 16 políticas del perfil `microduckapp`, seleccionable por el usuario final desde la app.
- Prueba de integración del pipeline ONNX en el robot: usar `policy.onnx` como caso de prueba mínimo (61 entradas, 14 salidas, 50 Hz) para validar el cargador de políticas, la temporización del bucle de control y la aplicación del `manifest.json` antes de desplegar movimientos más exigentes.
- Base para variaciones paramétricas: al ser una política pequeña y un contrato de E/S bien definido, sirve como punto de partida para experimentar con interpolación entre movimientos o con modulación de amplitud en un entorno de simulación antes de probar en hardware.
- Material docente sobre aprendizaje por refuerzo aplicado a robótica: ilustra cómo una política entrenada en simulación se empaqueta y se distribuye como artefacto reproducible, con manifiesto y previsualización, para que terceros la ejecuten.
- Pruebas de banco de batería y térmicas: al ser un movimiento de 10,4 segundos sin desplazamiento y de dinámica suave, resulta adecuado para ciclos repetidos de descarga controlada mientras se monitorizan los 15 motores del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, error de seguimiento articular, tasa de éxito ni comparaciones con otras políticas; el repositorio no contiene scripts de evaluación.

## Requisitos de hardware

- VRAM estimada: despreciable. El contrato de E/S (61 valores de entrada, 14 de salida) y un repositorio de 0,0 GB implican una política de tamaño mínimo; no se dispone del recuento de parámetros ni del tamaño exacto del fichero ONNX.
- Inferencia en CPU: viable con holgura. Un paso cada 20 ms es un presupuesto amplio para una red de esta dimensionalidad en cualquier CPU moderna.
- GPU: no necesaria. Cualquier GPU (RTX 4090, A100, H100) ejecutaría la política, pero sería un uso desproporcionado; el despliegue realista es en el cómputo embebido del propio Microduck o en una SBC tipo Raspberry Pi.
- Cabe en cualquier GPU de consumo, y previsiblemente en microcontroladores o SBC, siempre que exista un runtime ONNX adecuado.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA), ejecución en el robot a través de la aplicación MicroDuck; no se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: el único dato publicado es la frecuencia de control de 50 Hz, es decir, 20 ms por paso. No se han publicado mediciones de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas / salidas | Frecuencia | Duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-seated-groove | Movimiento Microduck (ONNX) | 61 / 14 | 50 Hz | 10,4 s | no disponible | Hugging Face, 0 descargas |
| microduck-midnight-snack | Movimiento Microduck (ONNX) | no disponible | no disponible | no disponible | no disponible | Hugging Face, mismo perfil `microduckapp` |
| Otras politicas del perfil `microduckapp` (hasta 16 modelos) | Movimientos Microduck (ONNX) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Politicas de LeRobot (Hugging Face) | Politicas de robotica open source | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos públicos de rendimiento, tamaño de parámetros ni licencia de las alternativas citadas, por lo que la comparación queda limitada al tipo de artefacto y a su disponibilidad. No se conocen benchmarks que permitan ordenar estas políticas por calidad de ejecución.

## Limitaciones y advertencias

- Licencia no disponible: sin un término legal explícito, no hay autorización clara para uso comercial, redistribución o modificación. Conviene contactar con el autor antes de integrarlo en un producto.
- Ausencia total de métricas: no hay evaluación publicada de fidelidad del movimiento, estabilidad ni robustez ante perturbaciones, lo que impide estimar su fiabilidad en producción.
- Movimiento no desplazante y de corta duración: 10,4 segundos sobre el propio terreno; no sirve para navegación ni para tareas de manipulación.
- Especificidad de plataforma: la política está acoplada a la morfología y a la convención de observaciones del Microduck. No es transferible a otro robot sin reentrenamiento.
- Desajuste no aclarado entre 14 salidas articulares y los 15 motores del robot: la correspondencia exacta y el tratamiento del actuador restante no están documentados.
- Documentación mínima: la model card no describe el espacio de observación (orden, unidades, normalización) ni los límites articulares, lo que dificulta la depuración de fallos de ejecución.
- Riesgo de comportamiento degradado fuera de distribución: como toda política entrenada en simulación, puede fallar ante condiciones no modeladas (fricción del terreno, batería baja, carga en el pico).
- Sesgos: no se han documentado sesgos en el sentido estadístico del término; el riesgo relevante es de robustez física, no de sesgo de datos.
- Alucinación: no aplica, al no ser un modelo generativo de lenguaje.
- Idiomas: no aplica; no hay soporte ni limitación lingüística que evaluar.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-seated-groove
- Perfil del autor: https://huggingface.co/microduckapp
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Cobertura en MarkTechPost: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Cobertura en CNX Software: https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
- Cobertura en TechCrunch: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
