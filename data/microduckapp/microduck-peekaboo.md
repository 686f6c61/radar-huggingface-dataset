# microduckapp/microduck-peekaboo

## Resumen

microduck-peekaboo es una política de control motriz (un «move») publicada en Hugging Face por microduckapp para el robot bípedo Microduck. No se trata de un modelo de lenguaje ni de un modelo generativo multimodal, sino de un artefacto de inferencia en formato ONNX que, a partir de un vector de 61 observaciones, emite 14 consignas articulares a 50 Hz para ejecutar una coreografía de aproximadamente 10,8 segundos: el robot esconde la cabeza, la asoma, se oculta por el lado contrario y reaparece «más grande» en cada repetición.

El modelo se distribuye junto a un `manifest.json` que describe qué debe instalar y reproducir el robot, y un vídeo de previsualización (`media/preview.mp4`). La relevancia de esta ficha no está en el rendimiento cognitivo del artefacto, sino en que ejemplifica el nuevo patrón de distribución de comportamientos para robótica de bajo coste: políticas entrenadas en simulación, exportadas a ONNX y publicadas como paquetes instalables dentro de una app, en línea con la propuesta del Microduck de Pollen Robotics y Hugging Face (robot bípedo de 25 cm, 15 motores, cámara, LiDAR y pico articulado, con pre-venta a 399 dólares).

La información pública disponible es muy escasa: el repositorio declara 0 descargas, 0 «likes», un tamaño de 0,0 GB y no especifica licencia, idiomas ni detalles de arquitectura o entrenamiento. Todo lo que no consta en la model card o en la búsqueda web se marca en esta ficha como «no disponible».

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (política de control exportada a ONNX; no se detalla la red subyacente) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; el espacio de observación es de 61 entradas por paso de control |
| Tipos de cuantización | No disponible (el artefacto se distribuye como ONNX, presumiblemente en el tipo numérico original) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`), acompañado de `manifest.json` |
| Entradas / salidas | 61 observaciones de entrada, 14 objetivos articulares de salida |
| Frecuencia de control | 50 Hz |
| Duración del movimiento | 10,8 segundos (aproximadamente 540 pasos de control) |
| Plataforma destino | Robot Microduck, mediante la app MicroDuck |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El autor no documenta la arquitectura interna de la política. La model card únicamente describe el contrato de entrada y salida del artefacto ONNX (61 observaciones → 14 objetivos articulares a 50 Hz) y el metadato de instalación (`manifest.json`). No se indica si la red es un MLP, una política recurrente o un transformer pequeño, ni el número de capas, parámetros o el tipo numérico de los pesos.

Respecto al entrenamiento, no hay información sobre el número de tokens o muestras, la composición del dataset ni el algoritmo utilizado. En el contexto del ecosistema Microduck, la documentación pública del robot indica que sus comportamientos se entrenan con aprendizaje por refuerzo en MuJoCo y se ejecutan después en el hardware real, pero la model card de peekaboo no confirma explícitamente qué pipeline se siguió para este movimiento concreto, por lo que debe considerarse un dato del ecosistema y no del artefacto. Tampoco se documenta ningún proceso de ajuste por preferencias humanas (RLHF/DPO), algo que no aplica a una política motriz de este tipo.

## Capacidades

- Ejecución de una secuencia motriz fija de 10,8 segundos en el robot Microduck: ocultar la cabeza, asomarla, esconderse por el lado opuesto y reaparecer con amplitud creciente.
- Generación de consignas de posición para 14 articulaciones a partir de un vector de 61 observaciones, a una frecuencia de control de 50 Hz.
- Inferencia en formato ONNX, apta para ejecutarse con ONNX Runtime en el entorno de la app MicroDuck sin dependencias de frameworks de aprendizaje profundo completos.
- Instalación y reproducción declarativa mediante `manifest.json`, que define lo que el robot debe instalar y cómo reproducir el movimiento.
- Material de previsualización incluido (`media/preview.mp4`) para verificar el comportamiento esperado antes de desplegarlo.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües: es una política de control, no un modelo fundacional.

## Casos de uso

- Reproducción directa en el robot: instalar el paquete mediante la app MicroDuck y ejecutar el «move» como demostración de fábrica o contenido de exhibición; el `manifest.json` automatiza la instalación y el vídeo permite validar el resultado esperado antes de ejecutarlo.
- Validación del stack de despliegue: usar `policy.onnx` como referencia para comprobar que el runtime ONNX embarcado, el bucle de control a 50 Hz y el mapeo de 14 articulaciones funcionan correctamente antes de desplegar políticas propias.
- Creación de contenido audiovisual: el movimiento está diseñado como gesto expresivo y repetible, adecuado para grabar demostraciones de producto, vídeos de redes sociales o material de presentación del robot sin necesidad de teleoperación.
- Docencia y divulgación en robótica: sirve como ejemplo mínimo y autocontenido del contrato observación-acción de una política RL (61 entradas, 14 salidas, 50 Hz) para explicar el flujo simulación → ONNX → hardware real.
- Pruebas de integración y regresión: al ser un movimiento determinista y de corta duración, permite comprobar de forma reproducible si un cambio de firmware, calibración o versión de la app degrada la ejecución articular.
- Investigación en sim-to-real: el par política + vídeo de referencia facilita comparar la trayectoria ejecutada en hardware con la esperada, como caso de estudio del gap de transferencia en robots bípedos de bajo coste.
- Base para composición de secuencias: encadenar este movimiento con otros «moves» del mismo autor (la cuenta microduckapp publica un catálogo de comportamientos, con 16 modelos visibles en el momento de la consulta) para construir rutinas más largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, error de seguimiento articular, tasa de éxito en simulación ni comparaciones cuantitativas con otras políticas. El único dato objetivo de rendimiento es la frecuencia de control declarada de 50 Hz, que implica un presupuesto de 20 ms por paso de inferencia para mantener la ejecución en tiempo real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se declara el número de parámetros ni el tamaño de `policy.onnx`; el repositorio completo figura como 0,0 GB, lo que indica un artefacto de tamaño muy reducido, pero no permite calcular una cifra fiable.
- GPU recomendadas: no aplica para el caso de uso previsto; la política está pensada para ejecutarse en la electrónica embarcada del Microduck (robot de 25 cm con 15 motores) mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: no disponible como dato del autor. Por el tipo de artefacto (ONNX, 61 entradas, 14 salidas, 50 Hz) es razonable esperar ejecución en CPU, pero no hay confirmación oficial ni cifras de latencia medidas.
- Opciones de despliegue: ONNX Runtime a través de la app MicroDuck; el `manifest.json` define la instalación. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a una política de control.
- Latencia y throughput: el bucle de control a 50 Hz fija un periodo de 20 ms por paso; la secuencia completa son aproximadamente 540 pasos en 10,8 segundos. No se publican latencias medidas ni el hardware exacto sobre el que se ejecuta la inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-peekaboo | Política motriz ONNX | 61 → 14 | 50 Hz | 10,8 s | No disponible | Hugging Face (0 descargas) |
| Otros «moves» de microduckapp (p. ej. microduck-midnight-snack) | Política motriz | No disponible | No disponible | No disponible | No disponible | Hugging Face, catálogo de 16 modelos |
| Políticas RL del ecosistema Microduck (Pollen Robotics / Hugging Face) | Políticas entrenadas en MuJoCo | No disponible | No disponible | No disponible | No disponible | Stack open source del robot |

No se dispone de datos públicos de arquitectura, parámetros o métricas para establecer una comparación cuantitativa con alternativas. La comparación relevante es de formato y de flujo de trabajo: peekaboo se distribuye como paquete instalable con manifiesto, frente a políticas publicadas únicamente como pesos o como código de entrenamiento.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse permiso de uso comercial, redistribución o modificación del artefacto. Es un bloqueante para cualquier integración en producto.
- Especificidad de encarnación: la política espera un vector de 61 observaciones con una disposición concreta de sensores y emite 14 objetivos articulares; no es portable a otro robot ni a otra calibración sin reentrenamiento.
- Ausencia de documentación de entrenamiento: sin datos de arquitectura, dataset, semilla ni proceso de validación, no es posible auditar el comportamiento ni reproducir el resultado.
- Brecha sim-to-real no cuantificada: no se publican métricas de seguimiento en hardware real ni tasas de fallo; el vídeo de previsualización es la única evidencia cualitativa.
- Movimiento de corta duración y no interactivo: 10,8 segundos de coreografía fija, sin adaptación a obstáculos, perturbaciones o al estado del entorno más allá de lo que capturen las 61 observaciones.
- Sin capacidades lingüísticas, de razonamiento o multimodales: no debe evaluarse con criterios de modelos fundacionales (MMLU, HumanEval, GSM8K) ni emplearse para tareas de texto.
- Riesgo para la seguridad física: cualquier política motriz ejecutada en un bípedo puede provocar caídas o colisiones; se recomienda supervisión y un espacio de pruebas despejado, especialmente por la falta de información sobre límites articulares y pares máximos.
- Repositorio sin tracción ni mantenimiento verificable: 0 descargas, 0 likes y ausencia de historial de versiones o issues dificultan estimar soporte a medio plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-peekaboo
- Cuenta del autor en Hugging Face: https://huggingface.co/microduckapp
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Página oficial de Microduck: https://pollen-robotics.com/microduck/
- Artículo de MarkTechPost sobre Microduck: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Artículo de CNX Software sobre Microduck: https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
