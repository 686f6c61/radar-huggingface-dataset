# microduckapp/microduck-bonk

## Resumen

`microduckapp/microduck-bonk` no es un modelo de lenguaje, sino una política de control en formato ONNX para el robot bípedo Microduck de Pollen Robotics y Hugging Face. Concretamente, empaqueta un movimiento de 10,6 segundos llamado «Bonk»: el pato camina recto hacia una pared invisible, choca, la cabeza retrocede de golpe, se tambalea hacia atrás y se frota la cabeza. El autor lo publica bajo el paraguas de la etiqueta `microduck-move`, junto a un `manifest.json` que describe lo que el robot necesita para instalar y reproducir el movimiento y un vídeo de previsualización.

Técnicamente, el artefacto principal es `policy.onnx`, una política que recibe 61 observaciones por paso y emite 14 consignas articulares, ejecutándose a 50 Hz. Eso implica unos 530 pasos de control para cubrir los 10,6 segundos del movimiento. La model card no documenta la topología de la red, el número de parámetros, el dataset de entrenamiento ni la licencia, y el repositorio declara un tamaño de 0,0 GB, por lo que la información técnica disponible es mínima.

Su relevancia no está en el rendimiento cognitivo, sino en el ecosistema: el Microduck es un robot bípedo de 25 cm y 399 dólares presentado como plataforma de investigación en IA física, con pila de software abierta que permite entrenar comportamientos en simulación y desplegarlos en el robot. Este repositorio es un ejemplo de cómo se distribuye un comportamiento concreto como artefacto reproducible y portable (ONNX) para hardware de bajo coste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible; el repositorio solo distribuye `policy.onnx` y la model card no describe la topología de la red |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: política de control sin ventana de contexto textual; consume 61 observaciones por paso de control |
| Tipos de cuantización | No disponible; se publica un único `policy.onnx` sin variantes cuantizadas declaradas |
| Idiomas soportados | No aplica (no es un modelo de lenguaje); la model card está redactada en inglés |
| Licencia | No disponible (no declarada ni en la model card ni en los metadatos de Hugging Face) |
| Formato de pesos | ONNX (`policy.onnx`), más metadatos de instalación en `manifest.json` y previsualización en `media/preview.mp4` |
| Entradas | 61 observaciones por paso de control |
| Salidas | 14 consignas articulares (el robot declara 15 motores; no se aclara qué articulación queda fuera) |
| Frecuencia de control | 50 Hz |
| Duración del movimiento | 10,6 s (≈ 530 pasos de control) |
| Tamaño del repositorio | 0,0 GB (según metadatos de Hugging Face) |
| Pipeline declarado | `robotics` |
| Etiquetas | `onnx`, `robotics`, `microduck-move`, `region:us` |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-27 |

## Arquitectura y entrenamiento

La información publicada no permite determinar la arquitectura interna. No se especifica si se trata de un perceptrón multicapa, una red recurrente, un transformer pequeño o una política con condicionamiento temporal, ni se indica el número de capas, anchura o parámetros. Tampoco se documenta el procedimiento de obtención: la model card no menciona si el movimiento se generó mediante aprendizaje por imitación a partir de capturas de movimiento, mediante aprendizaje por refuerzo en simulación o mediante authoring manual de trayectorias articulares y destilado posterior a una política.

El contexto de la plataforma sí aporta pistas, aunque no confirmación: el proyecto Microduck se presenta públicamente como un robot cuyo stack abierto permite entrenar nuevos comportamientos en simulación y ejecutarlos después en el hardware real. Si `bonk` sigue ese flujo, el `policy.onnx` sería el resultado exportado de un entrenamiento simulado; sin embargo, el autor no lo declara en el repositorio, por lo que debe tratarse como hipótesis y no como hecho verificado. Tampoco hay datos sobre composición del dataset, número de tokens o episodios, ni sobre etapas de RLHF/DPO (categorías que, por otra parte, no aplican a una política de control motriz).

La innovación técnica destacable, en la medida en que puede afirmarse, es de empaquetado: la política se distribuye como ONNX con un manifiesto de instalación, lo que facilita la portabilidad del comportamiento entre el entorno de simulación y el cómputo a bordo del robot sin depender del framework de entrenamiento original.

## Capacidades

- Reproducción de un movimiento expresivo de 10,6 s («bonk»): avance, colisión con un obstáculo invisible, retroceso de la cabeza, tambaleo y gesto de frotarse la cabeza.
- Mapeo de 61 observaciones a 14 consignas articulares a 50 Hz, con un presupuesto de 20 ms por paso de control.
- Instalación y reproducción dentro del ecosistema MicroDuck mediante `manifest.json`.
- Ejecución portable vía ONNX Runtime, sin dependencia del stack de entrenamiento.
- Generación de texto: no disponible / no aplica.
- Razonamiento, matemáticas y generación de código: no disponible / no aplica.
- Tool calling o function calling: no disponible / no aplica.
- Soporte de agentes y razonamiento multi-paso: no disponible / no aplica.
- Capacidades multilingües: no disponible / no aplica.
- Visión: no disponible. El robot Microduck incorpora cámara y sensor de profundidad, pero la política declara únicamente 61 observaciones de entrada y no se documenta si alguna corresponde a señales visuales.
- Modo «thinking» o audio: no disponible / no aplica.

## Casos de uso

- **Animación de reacción ante colisión en demos del robot**: reproducir `bonk` cuando el pato contacta con un obstáculo durante una demostración pública, aprovechando que el movimiento ya está empaquetado como ONNX y se instala con el manifiesto, sin necesidad de reentrenar nada.
- **Validación del pipeline de instalación de movimientos**: usar este repositorio como caso de prueba de extremo a extremo del flujo `manifest.json` + `policy.onnx` + reproducción a 50 Hz en el robot o en un simulador, verificando que el timing y las 14 consignas articulares se aplican correctamente.
- **Composición de secuencias de comportamiento**: encadenar `bonk` con otros movimientos de la familia `microduck-move` para construir rutinas más largas (por ejemplo, paseo, choque, recuperación), usando los 10,6 s como unidad temporal base.
- **Investigación en interacción humano-robot expresiva**: estudiar cómo reacciona el público ante feedback corporal exagerado (retroceso de cabeza, tambaleo) en un robot de 25 cm, comparando la percepción de «viveza» frente a respuestas puramente luminosas o sonoras.
- **Contenido divulgativo y material de prensa**: el repositorio incluye `media/preview.mp4`, de modo que el movimiento sirve directamente como clip de presentación del Microduck en notas de producto, charlas o artículos técnicos.
- **Docencia sobre despliegue de políticas de control**: ejemplo mínimo y de tamaño reducido para explicar en clase cómo se exporta una política a ONNX, qué información debe acompañarla (manifiesto, frecuencia de control, dimensionalidad de observaciones y acciones) y cómo se reproduce en hardware embebido.
- **Pruebas de robustez del runtime a bordo**: repetir el movimiento de forma determinista para medir jitter, deriva de las articulaciones y consumo del cómputo embebido del robot bajo una carga de control sostenida de 50 Hz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de seguimiento de trayectoria, error de posición articular, tasa de éxito de la tarea ni comparaciones con otras políticas, y el repositorio no contiene scripts de evaluación.

## Requisitos de hardware

- **VRAM estimada**: no publicada. Por la dimensionalidad declarada (61 entradas, 14 salidas) y un tamaño de repositorio de 0,0 GB, cabe esperar un modelo de muy pocos parámetros, ejecutable en CPU sin GPU dedicada; esta estimación se deduce de los datos disponibles y no está confirmada por el autor.
- **GPU recomendadas**: no aplica en el caso general; cualquier GPU moderna sirve si se opta por ejecución acelerada. La ejecución prevista es en el cómputo a bordo del Microduck, cuyas características no se detallan en la información disponible.
- **GPU de consumo**: sí, cualquier GPU de consumo e incluso CPU de clase Raspberry Pi serían suficientes para una red de esta dimensionalidad, siempre como estimación no verificada.
- **Opciones de despliegue**: ONNX Runtime es la vía natural dado el formato; TensorRT u otros ejecutores compatibles con ONNX son alternativas. vLLM, llama.cpp, Ollama y TGI no aplican a este artefacto.
- **Latencia y throughput**: el presupuesto de tiempo real es de 20 ms por paso (50 Hz); no se publican latencias medidas, ni throughput, ni coste computacional por inferencia.
- **Almacenamiento**: despreciable; `policy.onnx`, `manifest.json` y el vídeo de previsualización componen el paquete completo.

## Comparativa con modelos similares

No se dispone de datos públicos de políticas comparables dentro del ecosistema Microduck ni de características técnicas de otras entregas de la familia `microduck-move`, por lo que la comparación cuantitativa no está disponible.

| Modelo | Tipo | Entradas / salidas | Frecuencia | Duración | Licencia | Datos públicos |
|---|---|---|---|---|---|---|
| microduck-bonk | Política de control ONNX (movimiento «bonk») | 61 / 14 | 50 Hz | 10,6 s | No disponible | Model card mínima, sin métricas |
| Otras entregas de `microduck-move` | Política de control ONNX | No disponible | No disponible | No disponible | No disponible | No disponibles en la información proporcionada |
| Políticas de locomoción bípeda de propósito general | No disponible | No disponible | No disponible | No disponible | No disponible | No disponibles en la información proporcionada |

## Limitaciones y advertencias

- **Licencia no declarada**: sin licencia explícita no puede asumirse permiso de uso comercial, redistribución ni modificación; es un bloqueo potencial para integración en producto.
- **Documentación técnica insuficiente**: no se especifica arquitectura, número de parámetros, procedencia de los datos, proceso de entrenamiento ni métricas de evaluación, lo que impide auditar el comportamiento.
- **Semántica de las 61 observaciones no documentada**: se desconoce la composición exacta del vector de entrada (posiciones articulares, velocidades, IMU, señales de mando), lo que dificulta reutilizar la política fuera del stack previsto.
- **Desajuste aparente de dimensionalidad**: el robot declara 15 motores y la política emite 14 consignas; la model card no aclara qué articulación queda sin control, un detalle crítico para reproducir el movimiento con fidelidad.
- **Movimiento específico y no generalizable**: es una secuencia cerrada de 10,6 s; no se documenta que reaccione a estímulos del entorno ni que se adapte a obstáculos reales, más allá del guion previsto.
- **Sensibilidad al timing**: a 50 Hz, cualquier jitter o sobrecarga del runtime a bordo altera la reproducción; no hay métricas publicadas de robustez temporal.
- **Riesgo de repositorio incompleto**: el tamaño declarado de 0,0 GB y la ausencia de descargas sugieren que conviene verificar que los pesos estén realmente accesibles antes de planificar una integración.
- **Sin capacidades de lenguaje**: no genera texto, no razona, no soporta tool calling ni agentes; cualquier expectativa en ese sentido es un error de categoría.
- **Ausencia de benchmarks**: no hay evidencia publicada de calidad del movimiento (error de seguimiento, estabilidad, tasa de caídas) que permita compararlo con alternativas.
- **Idioma**: la model card está en inglés y no se declaran idiomas soportados, algo irrelevante para el control motriz pero relevante para la documentación del ecosistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-bonk
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Página de producto y preorders: https://microducks.org/
- Página oficial de Microduck en Pollen Robotics: https://pollen-robotics.com/microduck/
- Artículo de TechRepublic sobre el entrenamiento de la marcha con IA: https://www.techrepublic.com/article/news-nvidia-microduck-robot-ai-walking/
- Artículo de CNX Software sobre el hardware del robot: https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
