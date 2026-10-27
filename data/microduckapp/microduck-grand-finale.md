# microduckapp/microduck-grand-finale

## Resumen

Microduck Grand Finale (`microduckapp/microduck-grand-finale`) es una política de control robótico publicada en Hugging Face por el usuario `microduckapp`, no un modelo de lenguaje. Se distribuye como un único artefacto ONNX (`policy.onnx`) que implementa una secuencia de movimiento de 10,6 segundos para el robot bípedo Microduck: un giro amplio, una marcha al frente, un "shimmy" rápido y una reverencia profunda. La política recibe 61 observaciones y emite 14 consignas de articulación a 50 Hz, y se acompaña de un `manifest.json` con los metadatos necesarios para que la aplicación MicroDuck la instale y la reproduzca.

El interés del artefacto es doble. Por un lado, documenta el formato de empaquetado de "movimientos" del ecosistema MicroDuck (política + manifiesto + previsualización), lo que permite a desarrolladores construir, versionar e intercambiar coreografías para un robot de 399 dólares. Por otro, sirve como ejemplo de política de imitación o de aprendizaje por refuerzo exportada a ONNX para ejecución en un bípedo de 25 cm con 15 motores, cámara, sensor de profundidad, dos sensores de movimiento y pico articulado, según la información de prensa sobre el hardware.

La ficha tiene un alcance limitado: la model card no publica arquitectura interna, número de parámetros, licencia, idiomas ni resultados de benchmarks, y el repositorio ocupa 0,0 GB. Todo lo que no consta se marca explícitamente como no disponible; no se infieren cifras de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control robótico exportada a ONNX; topología interna (MLP, transformer u otra) no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; no es un modelo de lenguaje. Entrada de tamaño fijo: 61 observaciones por paso |
| Tipos de cuantización | no disponible (único artefacto publicado: `policy.onnx`, precisión no documentada) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` + `media/preview.mp4` |
| Entradas | 61 observaciones por paso de control |
| Salidas | 14 consignas de articulación (*joint targets*) |
| Frecuencia de control | 50 Hz |
| Duración del movimiento | 10,6 s (≈530 pasos de control, cálculo derivado de los datos anteriores) |
| Tamaño del repositorio | 0,0 GB |
| Pipeline declarado | `robotics` |
| Etiquetas | `onnx`, `robotics`, `microduck-move`, `region:us` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de la red: solo especifica el contrato de entrada/salida (61 → 14) y la frecuencia de ejecución (50 Hz). No se indica si se trata de un perceptrón multicapa, una política con memoria recurrente o un transformer ligero, ni el número de capas o de parámetros. Tampoco se documenta la precisión numérica del ONNX ni si existe una versión en coma flotante de 32 o 16 bits.

Respecto al entrenamiento, no hay información sobre el número de demostraciones, la composición del dataset, el simulador utilizado ni si se empleó aprendizaje por imitación, aprendizaje por refuerzo o una combinación. El contexto de prensa sobre Microduck menciona que el robot se entrena con refuerzo en MuJoCo, pero ese dato corresponde al proyecto del robot y no se atribuye en la model card a esta política concreta. El único elemento de empaquetado destacable es el `manifest.json`, que actúa como descriptor de instalación para la app MicroDuck y sugiere un formato estandarizado de distribución de movimientos.

## Capacidades

- Ejecución de una coreografía fija de 10,6 segundos compuesta por cuatro fases descritas por el autor: giro amplio, marcha al frente, "shimmy" rápido y reverencia profunda.
- Generación de 14 consignas de articulación a 50 Hz a partir de 61 observaciones, es decir, control de cuerpo completo del bípedo dentro de una trayectoria predefinida.
- Reproducción determinista de una secuencia: no se documenta adaptación reactiva a perturbaciones, cambios de terreno u obstáculos.
- Instalación y ejecución mediante la app MicroDuck a través del `manifest.json`.
- Inclusión de material de previsualización (`media/preview.mp4`) para verificar el resultado esperado antes de desplegar.
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo generativo de propósito general.

## Casos de uso

- Demostración de producto en ferias y showrooms: la secuencia incluye giro, marcha y reverencia, lo que funciona como número de presentación cerrado y repetible para captar público sin operador experto.
- Prueba de integración de la pila de control: al ser una política ONNX con entradas y salidas documentadas, sirve para validar que el *runtime* de inferencia del robot entrega 61 observaciones y consume 14 consignas a 50 Hz sin desfases.
- Validación del flujo de instalación de la app MicroDuck: el `manifest.json` permite comprobar de extremo a extremo el proceso de descubrimiento, descarga e instalación de movimientos en el robot.
- Material audiovisual y marketing: `media/preview.mp4` más una coreografía de 10,6 s facilitan la generación de vídeos de producto y publicaciones en redes sin necesidad de guionizar el movimiento.
- Docencia y divulgación en robótica: la secuencia sirve como ejemplo introductorio de cómo una política entrenada se exporta a ONNX, se versiona en Hugging Face y se ejecuta en hardware de bajo coste.
- Pruebas de esfuerzo mecánico y térmico: el "shimmy" rápido y la reverencia profunda someten a los 15 motores a cambios de consigna rápidos, útil como *smoke test* de articulaciones y de gestión térmica tras el ensamblaje.
- Pruebas de regresión de firmware: al ser una política fija, cualquier variación en la reproducción del movimiento entre versiones de firmware es atribuible a cambios en el controlador y no a la política, lo que simplifica el diagnóstico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de seguimiento de trayectoria, error de posición articular, tasa de éxito de la coreografía, ni comparaciones con otras políticas. Tampoco se aportan datos de latencia o de consumo durante la ejecución a 50 Hz.

## Requisitos de hardware

- El repositorio ocupa 0,0 GB, por lo que el conjunto de pesos es inferior a 100 MB; el tamaño exacto del ONNX no está disponible.
- Entrada de 61 valores y salida de 14 a 50 Hz: la carga computacional por paso es compatible con ejecución en CPU del propio robot o en un equipo anfitrión, si bien no se publica ningún dato de latencia ni de *hardware* de referencia.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; no hay indicación de que la política requiera aceleración por GPU.
- Compatibilidad con GPU de consumo (RTX 4090 y similares): no documentada, y presumiblemente innecesaria dado el tamaño del artefacto.
- Opciones de despliegue: cualquier *runtime* compatible con ONNX (ONNX Runtime, ejecución nativa en la app MicroDuck). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el único requisito explícito es sostener 50 Hz (20 ms por paso de control).

## Comparativa con modelos similares

No se dispone de otras políticas `microduck-move` ni de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

| Modelo | Tipo | Entradas / salidas | Frecuencia | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-grand-finale | Política de control ONNX | 61 / 14 | 50 Hz | no aplica | no disponible | Hugging Face (0 descargas, 0 likes) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin términos explícitos no puede asumirse permiso para uso comercial, redistribución o modificación de `policy.onnx`.
- Ausencia de documentación técnica: no se especifican arquitectura, parámetros, precisión del ONNX ni procedencia de los datos de entrenamiento, lo que impide auditar el modelo o reproducir su comportamiento.
- Política de trayectoria fija: no hay evidencia de capacidad reactiva ante perturbaciones, terreno irregular, obstáculos o fallos de articulación; el comportamiento fuera de las condiciones de entrenamiento es desconocido.
- Acoplamiento al hardware Microduck: la interfaz de 61 observaciones y 14 consignas está definida para ese robot; no es portable a otras plataformas sin reentrenamiento o adaptación.
- Posible desajuste de dimensionado: la prensa describe el Microduck con 15 motores, mientras que la política emite 14 consignas articulares; la model card no aclara qué articulación queda fuera del control.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo de texto. El riesgo equivalente es el fallo de seguimiento de la trayectoria (*tracking error*) y no está cuantificado.
- Idiomas y contexto lingüístico: no aplica; el modelo no procesa lenguaje.
- Métricas ausentes: sin cifras de error de seguimiento ni de tasa de éxito, no es posible estimar la fiabilidad en producción.
- Madurez del artefacto: 0 descargas y 0 *likes* en el momento de la consulta, con un único commit y sin historial de mantenimiento; conviene tratarlo como material de ejemplo y no como componente validado.
- Sin soporte declarado del autor: no se indican canales de soporte, versionado semántico ni política de cambios incompatibles en el `manifest.json`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-grand-finale
- MarkTechPost — Hugging Face Unveils Microduck: A $399 Open-Source 25 cm Biped: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Yahoo Tech — Hugging Face launches Microduck, a $399 open-source robot duck: https://tech.yahoo.com/ai/meta-ai/articles/hugging-face-launches-microduck-399-171113553.html
- Best-AI — Hugging Face Unveils Microduck: A $399 Open-Source Robot for AI Development: https://best-ai.org/ai-news/hugging-face-unveils-microduck-a-399-open-source-robot-for-ai-development-psmhme
- TechCrunch — Hugging Face is selling a cute $399 open source duck robot, Microduck: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- CNX Software — Microduck, a duck-like biped robot designed for physical AI experimentation and fun: https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
