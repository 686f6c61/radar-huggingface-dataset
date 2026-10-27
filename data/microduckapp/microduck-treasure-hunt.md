# microduckapp/microduck-treasure-hunt

## Resumen

`microduckapp/microduck-treasure-hunt` es una política de control motriz para el robot bípedo Microduck, publicada en Hugging Face por la organización `microduckapp`. No es un modelo de lenguaje: se distribuye como un grafo ONNX (`policy.onnx`) que mapea 61 observaciones de entrada a 14 consignas articulares de salida, ejecutado a 50 Hz y con una duración nominal de 10,4 segundos. El movimiento codificado consiste en avanzar en zigzag con la cabeza baja, olfatear el suelo, localizar un objeto y excavar para extraerlo.

El modelo se enmarca en el ecosistema MicroDuck, el robot bípedo de 25 cm y 800 gramos desarrollado por Pollen Robotics y Hugging Face, presentado en agosto de 2026 a un precio de 399 dólares y entrenado con aprendizaje por refuerzo en MuJoCo. Las políticas de esta familia se empaquetan junto a un `manifest.json` que describe los requisitos de instalación y reproducción en el robot, de modo que la app MicroDuck pueda descargarlas y ejecutarlas en hardware real.

Su relevancia es acotada pero concreta: constituye un ejemplo de política de comportamiento ("move") lista para desplegar, con un contrato de interfaz explícito y una frecuencia de control definida, lo que la hace útil como referencia para experimentar con transferencia sim-to-real, composición de comportamientos y reproducción determinista de habilidades sobre un bípedo de bajo coste. La información pública disponible es mínima: cero descargas, cero valoraciones, licencia no declarada y ausencia total de métricas de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control exportada a ONNX; topología interna de la red no documentada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 valores por paso de control |
| Tipos de cuantización | no disponible (se distribuye un único `policy.onnx` sin cuantización declarada) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` como descriptor de instalación |

Especificaciones adicionales declaradas por el autor:

| Parámetro | Valor |
|---|---|
| Entradas | 61 observaciones |
| Salidas | 14 consignas articulares (*joint targets*) |
| Frecuencia de control | 50 Hz (20 ms por paso) |
| Duración del movimiento | 10,4 s (~520 pasos de control) |
| Pipeline en Hugging Face | `robotics` |
| Etiquetas | `onnx`, `robotics`, `microduck-move`, `region:us` |
| Tamaño del repositorio | 0,0 GB |
| Contexto de despliegue | Robot Microduck (25 cm, 800 g) mediante la app MicroDuck |
| Fecha de creación / actualización | 2026-10-27 / 2026-10-27 |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna de la red. El autor publica únicamente el artefacto exportado a ONNX, con un contrato de interfaz de 61 observaciones de entrada y 14 consignas articulares de salida a 50 Hz. Por el contexto del ecosistema MicroDuck, cabe situar la política en el marco de entrenamiento con aprendizaje por refuerzo en simulación (MuJoCo) y posterior transferencia al hardware, pero este extremo no se explicita en la model card del repositorio y no debe darse por confirmado para esta política concreta.

Tampoco se documentan el número de tokens o episodios de entrenamiento, la composición del dataset, el uso de RLHF/DPO (no aplicable a una política motriz) ni innovaciones técnicas como atención lineal o decodificación especulativa. Los artefactos publicados son tres: `policy.onnx` (la política), `manifest.json` (qué debe instalar y ejecutar el robot) y `media/preview.mp4` (vídeo de previsualización del movimiento). No se incluye código de entrenamiento, configuración de recompensas ni currículo.

## Capacidades

- Generación de una secuencia motriz concreta de 10,4 segundos: avance en zigzag con la cabeza baja, olfateo del suelo, exploración visual del entorno, localización y excavación.
- Control de 14 articulaciones mediante consignas de posición/objetivo a 50 Hz.
- Ejecución autónoma sobre hardware real: la política consume observaciones del robot y emite consignas sin intervención humana durante el movimiento.
- Instalación y reproducción gestionadas por la app MicroDuck a través de `manifest.json`.
- Previsualización del comportamiento mediante el vídeo incluido en `media/preview.mp4`.
- No soporta *tool calling*, *function calling*, razonamiento multi-paso simbólico, procesamiento de lenguaje natural, visión semántica ni audio.
- No dispone de modo *thinking* ni de capacidades multilingües.
- Componibilidad potencial con otros movimientos de la misma familia (por ejemplo, `microduck-midnight-snack`), si bien el autor no documenta un mecanismo de encadenado.

## Casos de uso

- **Reproducción de la habilidad en el robot físico**: descargar el movimiento desde la app MicroDuck e instalarlo mediante `manifest.json` para ejecutar la secuencia completa de búsqueda y excavación sobre el bípedo de 25 cm y 800 g, verificando el comportamiento real frente al vídeo de previsualización.
- **Transferencia sim-to-real como caso de estudio**: emplear la política como referencia para analizar la brecha entre simulación y hardware, comparando la trayectoria de las 14 articulaciones en MuJoCo con la ejecución en el robot y midiendo desviaciones a lo largo de los ~520 pasos de control.
- **Punto de partida para *fine-tuning* de habilidades de búsqueda**: reentrenar o adaptar la política hacia variantes como localización de objetos con formas o colores distintos, ajustando la recompensa en simulación y reexportando a ONNX con la misma interfaz 61→14.
- **Composición de secuencias de comportamiento**: encadenar este movimiento con otros de la familia `microduck-move` para construir rutinas más largas (por ejemplo, desplazamiento, búsqueda y manipulación), validando la continuidad de las consignas articulares entre segmentos a 50 Hz.
- **Docencia y talleres de robótica con IA**: usar un movimiento corto, cerrado y descargable como ejemplo práctico de política de refuerzo desplegada, sin necesidad de entrenar desde cero ni de infraestructura de GPU.
- **Pruebas de robustez y seguridad en bípedos de bajo coste**: someter la política a perturbaciones (superficies irregulares, obstáculos, empujes laterales) para caracterizar su estabilidad, dado que implica inclinación del torso y contacto con el suelo durante la excavación.
- **Validación de pipelines de despliegue ONNX en robótica**: integrar `policy.onnx` en un *runtime* ONNX (ONNX Runtime, etc.) como banco de pruebas para medir latencia de inferencia y cumplimiento del presupuesto temporal de 20 ms por paso.
- **Generación de datos de demostración**: registrar las trayectorias resultantes como datos de referencia para comparar políticas posteriores o para alimentar análisis cinemático del bípedo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No existen métricas de éxito de la tarea, tasa de finalización, error de seguimiento articular, número de caídas ni evaluaciones sim-to-real publicadas por el autor. El repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, por lo que tampoco hay evidencia comunitaria de funcionamiento.

## Requisitos de hardware

- **Ejecución en el robot**: el destino previsto es el Microduck (25 cm, 800 g, 399 USD). Las características del módulo de cómputo de a bordo no están disponibles en la información proporcionada.
- **VRAM estimada**: no disponible como dato publicado. El repositorio ocupa 0,0 GB y la interfaz es de 61 entradas a 14 salidas, por lo que el grafo es de tamaño muy reducido; cualquier estimación de memoria debe considerarse una inferencia a partir de esos dos datos, no una cifra oficial.
- **GPU recomendadas**: no se requiere GPU para la inferencia según el diseño del artefacto (política ONNX de 50 Hz), aunque el autor no lo declara explícitamente. Para un hipotético reentrenamiento, los requisitos no están disponibles.
- **Viabilidad en GPU de consumo**: previsiblemente sí, e incluso en CPU, dado el tamaño del artefacto; sin confirmación oficial.
- **Opciones de despliegue**: ONNX Runtime u otro *runtime* compatible con ONNX, invocado desde la app MicroDuck según `manifest.json`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política motriz.
- **Latencia y throughput**: el único requisito temporal conocido es el derivado de la frecuencia de control, 50 Hz, es decir, 20 ms por paso de inferencia y actuación. No se publican latencias medidas ni *throughput*.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `microduckapp/microduck-treasure-hunt` | Política motriz ONNX (MicroDuck) | 61 obs. / 14 articulaciones | 50 Hz | 10,4 s | no disponible | Pública en HF, 0 descargas |
| `microduckapp/microduck-midnight-snack` | Política motriz ONNX (MicroDuck) | no disponible | no disponible | no disponible | no disponible | Pública en HF |
| Otras políticas RL para bípedos de talla similar | Políticas de locomoción | no disponible | no disponible | no disponible | no disponible | no disponible |

La organización `microduckapp` agrupa al menos 16 modelos de la misma familia de movimientos, pero no se dispone de sus especificaciones detalladas ni de métricas comparativas entre ellos. No se conocen evaluaciones independientes que permitan establecer un ranking de rendimiento frente a alternativas.

## Limitaciones y advertencias

- **Licencia no declarada**: sin licencia explícita no puede asumirse permiso para uso comercial, redistribución o modificación. Es un bloqueo potencial para cualquier integración en producto.
- **Ausencia total de validación pública**: 0 descargas y 0 valoraciones; no hay informes de terceros sobre si el movimiento se ejecuta correctamente en hardware real.
- **Especificidad de hardware**: la política emite 14 consignas articulares y consume 61 observaciones con toda probabilidad ligadas a la cinemática y a los sensores concretos del Microduck; no es directamente transferible a otro robot sin reentrenamiento.
- **Sin métricas de robustez**: no se documenta comportamiento ante perturbaciones, superficies irregulares o fallos de sensores, algo crítico en una habilidad que implica inclinar el torso y excavar.
- **Riesgo de ejecución fallida**: la secuencia incluye contacto con el suelo y movimientos de excavación; sin datos de tasa de éxito ni de caídas, debe probarse en un entorno controlado antes de cualquier demostración pública.
- **Sin información de sesgos**: no aplica en el sentido habitual de sesgos sociales, pero sí existe un sesgo de dominio: el movimiento está ajustado a un entorno de entrenamiento concreto cuyas características no se describen.
- **Ausencia de capacidades lingüísticas**: no procesa texto ni órdenes en lenguaje natural; cualquier interfaz conversacional debe implementarse externamente.
- **Documentación mínima**: no se publican detalles de arquitectura, parámetros, dataset ni proceso de entrenamiento, lo que impide auditar la política o reproducirla.
- **Fecha de creación reciente y metadatos escasos**: creado y actualizado el 2026-10-27 en apenas cuatro segundos de diferencia, sin histórico de versiones ni *changelog*.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/microduckapp/microduck-treasure-hunt
- Organización del autor en Hugging Face: https://huggingface.co/microduckapp
- Artículo sobre el lanzamiento de Microduck (MarkTechPost): https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Cobertura del lanzamiento (The AI Insider): https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-open-source-microduck-robot/
- Análisis del entrenamiento con IA del robot (TechRepublic): https://www.techrepublic.com/article/news-nvidia-microduck-robot-ai-walking/
- Cobertura del anuncio (Tech360): https://www.tech360.tv/hugging-face-unveils-microduck-new-open-source-biped-ai-robot-2026-31-08
