# microduckapp/microduck-slalom

## Resumen

Microduck-slalom no es un modelo de lenguaje, sino una política de control motriz exportada a ONNX para el robot bípedo Microduck, el robot de 25 cm y 399 dólares desarrollado por Pollen Robotics con Hugging Face. El artefacto lo publica el usuario `microduckapp` dentro del ecosistema de la aplicación MicroDuck y lleva la etiqueta `microduck-move`, es decir, es una habilidad instalable y reproducible por el robot, no un modelo generativo de propósito general.

El problema que resuelve es concreto: dotar al robot de un movimiento de tipo eslalon, en el que el autómata zigzaguea a izquierda y derecha como si rodeara conos invisibles, inclinándose en cada giro. La política consume 61 observaciones y emite 14 consignas articulares a 50 Hz durante 10,8 segundos, y se acompaña de un `manifest.json` con los requisitos de instalación y reproducción, además de un vídeo de previsualización.

Su relevancia es fundamentalmente práctica: muestra un formato de distribución de habilidades robóticas basado en ONNX más un manifiesto declarativo, lo que permite desacoplar el entrenamiento de la ejecución en el robot. No se han publicado datos sobre arquitectura de red, número de parámetros ni procedimiento de entrenamiento de esta política en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control exportada a ONNX; no se detalla la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; ventana de observación de 61 valores por ciclo) |
| Tipos de cuantizacion | no disponible (solo se distribuye el grafo ONNX) |
| Idiomas soportados | no disponible / no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` + `media/preview.mp4` |
| Entradas de la política | 61 observaciones |
| Salidas de la política | 14 consignas articulares (joint targets) |
| Frecuencia de control | 50 Hz |
| Duración del movimiento | 10,8 segundos |
| Pipeline declarado | robotics |
| Etiquetas | onnx, robotics, microduck-move, region:us |
| Tamaño del repositorio | 0,0 GB (redondeo de Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información publicada no describe la arquitectura interna de la política: únicamente se especifica el contrato de entrada y salida (61 observaciones de entrada, 14 objetivos articulares de salida) y la frecuencia de ejecución de 50 Hz. El repositorio ocupa 0,0 GB según el redondeo de Hugging Face, lo que es coherente con un artefacto de pocos megabytes, pero no se ofrece recuento de parámetros ni capas.

Tampoco se documentan los datos de entrenamiento, el número de pasos de simulación, la composición del dataset ni si hubo ajuste con RLHF o aprendizaje por imitación. En el contexto de la plataforma Microduck, las fuentes de prensa y el blog de NVIDIA describen el entrenamiento de la locomoción del robot mediante aprendizaje por refuerzo en MuJoCo; esa información corresponde al robot y a su proceso general, no a esta política concreta, por lo que no puede atribuirse al artefacto sin confirmación del autor. La innovación técnica observable es el empaquetado: política ONNX más manifiesto de instalación, pensado para que la aplicación MicroDuck instale y reproduzca la habilidad de forma estandarizada.

## Capacidades

- Generación de una secuencia de marcha de tipo eslalon con zigzag lateral y inclinación en los giros.
- Salida de 14 consignas articulares a 50 Hz, adecuada para el bucle de control de bajo nivel del robot.
- Ejecución de una habilidad de duración fija de 10,8 segundos, delimitada y reproducible.
- Instalación y reproducción declarativa mediante `manifest.json` en el ecosistema MicroDuck.
- Distribución en formato ONNX, portable entre runtimes compatibles.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de percepción, visión, audio ni adaptación reactiva al entorno en esta política.

## Casos de uso

- Demostración de movimiento en robot físico: instalar `policy.onnx` y el manifiesto en la app MicroDuck para reproducir el eslalon de 10,8 segundos en una unidad real, útil en ferias y presentaciones de producto.
- Vídeo y material promocional: el paquete incluye `media/preview.mp4`, de modo que el movimiento puede evaluarse antes de desplegarlo en hardware.
- Pruebas de integración del runtime: validar que la cadena de control del robot consume 61 observaciones y aplica 14 consignas a 50 Hz sin desviaciones de temporización.
- Banco de pruebas de estabilidad: comparar la respuesta del robot ante esta política de zigzag frente a otras habilidades `microduck-move`, midiendo caídas, desviación de rumbo y consumo de par.
- Docencia e investigación en robótica bípeda: usar la política como referencia reproducible en prácticas de control y simulación, al estar en un formato estándar y con un contrato de entrada y salida explícito.
- Desarrollo de una librería de habilidades: servir de plantilla para empaquetar nuevos movimientos con el mismo esquema de ONNX más manifiesto.
- Evaluación de sim-to-real: ejecutar la política en simulación y en el robot físico para cuantificar la brecha de comportamiento en una tarea acotada y de corta duración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de recompensa, tasas de éxito, error de seguimiento articular ni comparaciones con otras políticas. Tampoco se aportan datos de latencia real de inferencia más allá de la frecuencia nominal de 50 Hz fijada por el manifiesto.

## Requisitos de hardware

- VRAM estimada: no disponible. Por el contrato de la política (61 entradas, 14 salidas, 50 Hz), el cálculo por ciclo es muy reducido y no se espera que requiera GPU dedicada, pero no hay requisitos oficiales publicados.
- GPU recomendadas: no disponible; no se documenta ninguna GPU necesaria para la inferencia.
- GPU de consumo: no se dispone de datos que confirmen ni descarten su necesidad; el artefacto está pensado para ejecutarse en el propio robot o en el dispositivo que ejecute la app MicroDuck.
- Opciones de despliegue: ONNX Runtime u otro runtime compatible con ONNX; la instalación se gestiona mediante `manifest.json` en el ecosistema MicroDuck. Herramientas como vLLM, llama.cpp, Ollama o TGI no aplican, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: el bucle de control está fijado a 50 Hz, es decir, 20 ms por ciclo; no se publican latencias medidas ni throughput real en hardware concreto.
- Almacenamiento: el repositorio aparece como 0,0 GB en Hugging Face, un valor redondeado que no permite estimar el tamaño exacto de `policy.onnx`.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-slalom | Política de movimiento ONNX para Microduck | no disponible | 61 observaciones por ciclo a 50 Hz | no disponible | no disponible | Hugging Face, 0 descargas |
| Otras políticas `microduck-move` | Políticas de movimiento para el mismo robot | no disponible | no disponible | no disponible | no disponible | no se han identificado con datos públicos en la información disponible |
| Políticas de locomoción de otros bípedos comerciales | Políticas de control | no disponible | no disponible | no disponible | habitualmente no publicadas | no disponible |

No se dispone de datos públicos comparables de parámetros, contexto, rendimiento o licencia para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia no está declarada, por lo que no puede confirmarse el uso comercial, la redistribución ni la creación de obras derivadas.
- No se documenta la arquitectura ni el proceso de entrenamiento, lo que impide evaluar la robustez, el sobreajuste a condiciones concretas o la procedencia de los datos.
- El movimiento tiene una duración fija de 10,8 segundos y está diseñado para el hardware específico del Microduck; no hay garantía de transferencia a otras plataformas.
- No se documenta si la política incorpora percepción o realimentación del entorno; un eslalon con conos invisibles puede no reaccionar ante obstáculos reales.
- Riesgo de brecha sim-to-real: si el entrenamiento se realizó en simulación, el comportamiento en el robot físico puede degradarse por fricción, holguras o calibración de sensores.
- El repositorio presenta 0 descargas y 0 likes, sin evidencia pública de validación por terceros.
- No aplica el riesgo de alucinación propio de los modelos de lenguaje, pero sí el riesgo de comportamiento inseguro si el robot opera cerca de personas sin supervisión.
- La ficha no especifica versiones de ONNX ni opset compatibles, lo que puede provocar fallos de carga en runtimes antiguos.
- No se indican requisitos de seguridad, paradas de emergencia ni límites de par para la ejecución física.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-slalom
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- MarkTechPost, sobre el Microduck de 399 dólares: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Blog de NVIDIA sobre agentes de IA para enseñar a caminar a robots como Microduck: https://developer.nvidia.com/blog/using-ai-agents-to-teach-robots-like-microduck-to-walk-in-simulation/
- TechRepublic, sobre el entrenamiento en simulación de Microduck: https://www.techrepublic.com/article/news-nvidia-microduck-robot-ai-walking/
- TechCrunch, sobre la comercialización del Microduck: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
