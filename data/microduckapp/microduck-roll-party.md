# microduckapp/microduck-roll-party

## Resumen

Roll Party no es un modelo de lenguaje, sino una política de control en formato ONNX para el robot Microduck, el bípedo de 25 cm y 399 dólares desarrollado por Pollen Robotics, el equipo de robótica de Hugging Face. El artefacto ejecuta un movimiento coreografiado de 11,8 segundos en el que el pato gira la cabeza en círculos amplios, gira hacia un lado, rueda un poco más y vuelve a girar en sentido contrario. La política recibe 61 observaciones y produce 14 objetivos articulares a una frecuencia de 50 Hz.

Pertenece a la familia de movimientos "microduck-move" publicados en la organización microduckapp de HuggingFace, junto a otros como microduck-roll-over. Según la información publicada sobre la plataforma Microduck, estos comportamientos se entrenan con aprendizaje por refuerzo en simulación (MuJoCo) y se transfieren al hardware real, instalándose en el robot a través de la aplicación MicroDuck mediante un archivo manifest.json.

Su relevancia es más de plataforma que de modelo: ilustra el flujo sim-to-real de Microduck y cómo los comportamientos de robot se distribuyen como artefactos ligeros que se ejecutan directamente en la NPU integrada del robot (Rockchip, 1 TOPS).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control neuronal en ONNX (61 observaciones de entrada, 14 objetivos articulares de salida); topología interna no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplicable (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (policy.onnx), acompañado de manifest.json y media/preview.mp4 |
| Frecuencia de control | 50 Hz |
| Duración del movimiento | 11,8 segundos |
| Robot compatible | Microduck (Pollen Robotics / Hugging Face) |
| Tamaño del repositorio | 0,0 GB según HuggingFace (artefacto muy ligero) |

## Arquitectura y entrenamiento

No se trata de un transformer ni de un modelo generativo, sino de una política de control para un robot bípedo. De acuerdo con la información publicada sobre Microduck, los comportamientos de este robot se entrenan con aprendizaje por refuerzo en el simulador MuJoCo y se transfieren después al hardware real (enfoque sim-to-real). La política consume 61 observaciones del robot y emite 14 objetivos articulares en un bucle de control de 50 Hz, lo que equivale a un paso de control cada 20 ms. La composición exacta de las observaciones, la arquitectura interna de la red (MLP, transformer u otra), el número de parámetros y los detalles del entrenamiento no están documentados en la model card.

La inferencia está diseñada para ejecutarse en el propio robot, sobre el SoC Rockchip integrado que incorpora una NPU de 1 TOPS. Al no ser un modelo de lenguaje, conceptos como dataset de texto, RLHF o DPO no resultan aplicables.

## Capacidades

- Ejecuta un movimiento fijo de 11,8 segundos: giro de la cabeza en círculos amplios, giro hacia un lado, rodada adicional y giro en sentido contrario.
- Control en tiempo real de 14 articulaciones a 50 Hz.
- Inferencia local en el robot mediante ONNX, aprovechando la NPU Rockchip de 1 TOPS del Microduck.
- Instalación y reproducción desde la aplicación MicroDuck a través del manifest.json incluido en el repositorio.
- Incluye un vídeo de vista previa (media/preview.mp4) que muestra el resultado esperado del movimiento.
- No dispone de capacidades de generación de texto, razonamiento, código, visión, audio, tool calling ni agentes: es una política de un solo comportamiento.

## Casos de uso

- Entretenimiento doméstico: reproducción del "modo fiesta" desde la app MicroDuck como movimiento lúdico para demostraciones caseras del robot.
- Docencia de aprendizaje por refuerzo y sim-to-real: sirve como ejemplo tangible y de bajo coste para mostrar en clase cómo una política entrenada en MuJoCo se ejecuta después en hardware real.
- Pruebas de inferencia ONNX en hardware embebido: permite validar el pipeline de ONNX Runtime sobre la NPU Rockchip con una carga de trabajo real de 50 Hz y 14 salidas continuas.
- Creación de contenido: generación de clips cortos del robot para redes sociales o divulgación, usando preview.mp4 como referencia del resultado final.
- Plantilla para movimientos propios: estudiar la estructura del repositorio (policy.onnx más manifest.json) como punto de partida para desarrollar y publicar movimientos personalizados en la organización.
- Demostraciones en eventos: ferias de robótica, aulas, museos o meetups, donde un movimiento coreografiado y breve resulta ideal para captar la atención del público.
- Verificación de hardware: comprobar el rango de movimiento de cabeza y cuello del robot tras un montaje, una reparación o una actualización de firmware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Como datos operativos publicados pueden citarse la frecuencia de control de 50 Hz (un paso cada 20 ms), la duración fija del movimiento de 11,8 segundos y el tamaño reducido del repositorio (0,0 GB). El modelo registra 0 descargas y 0 likes en HuggingFace, por lo que no existe todavía validación de la comunidad.

## Requisitos de hardware

- No requiere GPU ni VRAM: la política está pensada para ejecutarse en el SoC Rockchip integrado en el propio Microduck, con NPU de 1 TOPS.
- Hardware necesario: un robot Microduck, un bípedo de 25 cm comercializado por 399 dólares según el anuncio de lanzamiento.
- Runtime de inferencia: ONNX (policy.onnx) sobre el robot. Los despliegues habituales de modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no aplican a este artefacto.
- Latencia de control: 20 ms por paso de control (50 Hz). El concepto de throughput no es aplicable al no tratarse de un modelo generativo.
- Para análisis o depuración, el archivo ONNX puede inspeccionarse o ejecutarse en un PC convencional con ONNX Runtime, aunque el despliegue previsto es el propio robot.

## Comparativa con modelos similares

| Modelo | Tipo | Duración | Entradas/salidas | Formato | Licencia |
|---|---|---|---|---|---|
| microduck-roll-party | Política de movimiento ONNX | 11,8 s | 61 observaciones → 14 articulaciones a 50 Hz | ONNX | no disponible |
| microduck-roll-over | Política de movimiento ONNX | 10,8 s | no disponible | ONNX | no disponible |

Ambos movimientos pertenecen a la misma organización (microduckapp) y comparten formato y mecanismo de instalación. Roll Over describe un giro lento y pesado de la cabeza seguido de un volcado lateral, mientras que Roll Party ejecuta círculos amplios de cabeza con giros alternos. Ninguno de los dos publica licencia ni detalles de arquitectura.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni flujos de agentes, y no debe evaluarse con métricas de PLN.
- Comportamiento único y fijo de 11,8 segundos, sin variabilidad ni adaptación al entorno más allá de sus 61 observaciones de entrada.
- La licencia no está publicada, por lo que las condiciones de uso comercial, redistribución y modificación no están claras; conviene verificarlas antes de cualquier despliegue.
- Requiere hardware específico (un robot Microduck); no es ejecutable como modelo de propósito general.
- Repositorio muy reciente (creado el 27 de octubre de 2026) con 0 descargas y 0 likes: sin validación comunitaria ni reportes de fallos.
- La model card no documenta arquitectura interna, número de parámetros ni detalles de entrenamiento, lo que dificulta auditar el comportamiento de la política.
- Al tratarse de una política sim-to-real, el rendimiento en hardware real puede degradarse respecto a la simulación; no se han publicado métricas de robustez ni de tasa de éxito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/microduckapp/microduck-roll-party
- Movimiento relacionado de la misma organización: https://huggingface.co/microduckapp/microduck-roll-over
- Repositorio GitHub de Microduck: https://github.com/pollen-robotics/microduck
- Noticia de lanzamiento en The AI Insider: https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-open-source-microduck-robot/
- Análisis en MarkTechPost: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Cobertura en CNBC sobre el hardware de Microduck: https://www.cnbc.com/2026/09/01/hugging-faces-new-duck-robot-is-selling-fast-a-chinese-chip-powers-it.html
