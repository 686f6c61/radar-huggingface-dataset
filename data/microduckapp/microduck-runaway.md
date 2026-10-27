# microduckapp/microduck-runaway

## Resumen

`microduck-runaway` es un artefacto de control robótico publicado por el usuario `microduckapp` en Hugging Face, no un modelo de lenguaje. Se trata de un "move" o animación preentrenada de 10,5 segundos para el robot bípedo Microduck: el robot arranca con un paso tranquilo, acelera progresivamente, oscila y finalmente frena en seco con un temblor. La política se distribuye como `policy.onnx`, acompañada de un `manifest.json` con los requisitos de instalación y reproducción y un vídeo de previsualización en `media/preview.mp4`.

Técnicamente, el artefacto es una política de inferencia que recibe 61 observaciones por paso y emite 14 consignas de articulación a 50 Hz. Ese mapeo encaja con la plataforma Microduck, un bípedo de 25 cm y 15 motores desarrollado por Pollen Robotics y Hugging Face, entrenado con aprendizaje por refuerzo en MuJoCo y con un stack abierto que permite entrenar comportamientos en simulación y ejecutarlos en el robot físico.

Su relevancia es práctica más que algorítmica: ilustra el formato de distribución de habilidades motrices reutilizables para robótica open source. Cualquier persona con un Microduck puede instalar la política y reproducirla, y sirve como referencia de cómo se empaqueta un comportamiento (pesos ONNX + manifiesto + material audiovisual) para un robot de bajo coste. No se ha publicado información sobre la arquitectura interna de la red, el dataset de entrenamiento ni la licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal de control exportada a ONNX (topología interna no disponible) |
| Parámetros totales | No disponible (tamaño del repositorio: 0.0 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; ventana de observación de 61 dimensiones por paso de control |
| Tipos de cuantización | No disponible (el artefacto se publica únicamente en ONNX) |
| Idiomas soportados | No aplica (no es un modelo de lenguaje ni multimodal de texto) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`), más `manifest.json` y `media/preview.mp4` |

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura de la red: solo se especifica la interfaz de la política, con 61 entradas de observación y 14 salidas de objetivos articulares, ejecutada a 50 Hz. El pipeline declarado en Hugging Face es `robotics` y los tags incluyen `onnx`, `robotics` y `microduck-move`, lo que sitúa el artefacto en la categoría de políticas de control para el robot Microduck, presumiblemente obtenidas mediante aprendizaje por refuerzo en simulación y exportadas a ONNX para inferencia en el dispositivo.

No se han publicado datos sobre el número de tokens o pasos de entrenamiento, la composición del dataset, el simulador utilizado ni si hubo ajuste fino con técnicas de alineación. El ecosistema del que forma parte sí está documentado: Microduck se entrena con RL en MuJoCo y su stack es abierto, con herramientas como `microduck-studio` para simulación, monitorización y control en un espacio de trabajo web local. La innovación destacable aquí no es algorítmica, sino de empaquetado: un formato reproducible de habilidades motrices (política + manifiesto + previsualización) instalable desde una app.

## Capacidades

- Ejecución de una secuencia motriz de 10,5 segundos con perfil de velocidad creciente, oscilación lateral y frenada final con temblor.
- Control de locomoción bípeda: genera 14 consignas de articulación a partir de 61 observaciones, a una frecuencia de 50 Hz.
- Instalación y reproducción en el robot Microduck mediante el manifiesto `manifest.json`, que describe lo que el robot necesita para cargar y ejecutar el movimiento.
- Integración con el ecosistema de la app MicroDuck, que agrupa más de 16 artefactos similares bajo la misma organización.
- Previsualización audiovisual del comportamiento mediante `media/preview.mp4`.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio: no es un modelo de lenguaje.

## Casos de uso

- Demostración de locomoción bípeda: instalar `policy.onnx` en un Microduck para exhibir una secuencia de marcha con aceleración y frenada, útil en presentaciones del robot o en ferias.
- Prueba de robustez del hardware: la oscilación y el frenado brusco someten a los 15 motores y al chasis a esfuerzos laterales, lo que permite validar tolerancias mecánicas y consumo de corriente en condiciones dinámicas.
- Referencia de formato para autores de movimientos: sirve como plantilla de cómo empaquetar una política (ONNX + manifiesto + vídeo) para publicarla en la organización `microduckapp`.
- Docencia en robótica y RL: el artefacto permite ilustrar el ciclo completo de una política entrenada en simulación y desplegada en hardware real, con una interfaz de observación y acción bien delimitada.
- Integración en pipelines de `microduck-studio`: cargar el movimiento en el entorno local de simulación y monitorización para comparar la ejecución simulada con la del robot físico antes de desplegarlo.
- Banco de pruebas para controladores: al ser una política corta y determinista en su interfaz, resulta adecuada para verificar latencias de inferencia a 50 Hz y el comportamiento del runtime ONNX en la placa del robot.
- Base para composición de secuencias: encadenar este movimiento con otros del mismo autor (por ejemplo, `microduck-midnight-snack`) para construir rutinas más largas en una aplicación de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasas de éxito, estabilidad de la marcha ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tipo de artefacto (política ONNX de un repositorio de 0.0 GB), la inferencia es viable en CPU, sin necesidad de GPU.
- GPU recomendadas: no aplica; no se han publicado requisitos. Un acelerador dedicado no es necesario para ejecutar una política de 14 salidas a 50 Hz.
- Compatibilidad con GPU de consumo: irrelevante para este artefacto; el cuello de botella es el bucle de control en tiempo real del robot, no el cómputo de la red.
- Opciones de despliegue: ONNX Runtime como runtime natural del formato; el manifiesto `manifest.json` define el procedimiento de instalación en el robot. El ecosistema `microduck-studio` ofrece simulación y monitorización en un espacio de trabajo web local.
- Latencia y throughput: no disponibles. El único dato temporal publicado es la frecuencia de control de 50 Hz, que implica un presupuesto de 20 ms por paso de inferencia.

## Comparativa con modelos similares

| Artefacto | Autor | Tipo | Entrada / salida | Duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `microduck-runaway` | microduckapp | Política ONNX para Microduck | 61 obs. / 14 objetivos, 50 Hz | 10,5 s | No disponible | Hugging Face |
| `microduck-midnight-snack` | microduckapp | Política ONNX para Microduck | No disponible | No disponible | No disponible | Hugging Face |
| Stack base de Microduck | Pollen Robotics / Hugging Face | Entorno RL en MuJoCo y runtime del robot | No disponible | No aplica | Código abierto (repositorio público) | GitHub |

La comparación con modelos de lenguaje no procede: se trata de políticas de control motriz. Frente a otras alternativas de la misma categoría, la información pública es mínima y se limita a la interfaz de observación/acción y a la duración del movimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde a instrucciones y no admite tool calling. Cualquier uso en ese sentido es un error de categoría.
- La licencia no está publicada, por lo que no puede afirmarse que su uso comercial esté permitido; es imprescindible contactar con el autor antes de integrarlo en un producto.
- La topología de la red, el proceso de entrenamiento y las métricas de calidad no están documentados, lo que impide auditar el comportamiento o estimar su robustez ante perturbaciones.
- El movimiento incluye oscilación y una frenada brusca: en el robot físico puede implicar picos de par y riesgo de caída o desgaste; conviene probarlo primero en simulación.
- Está diseñado específicamente para el hardware Microduck (25 cm, 15 motores); no es transferible a otras plataformas sin reentrenamiento.
- El repositorio tiene 0 descargas y 0 likes, y no hay evidencia de validación por terceros.
- No hay información sobre sesgos, alucinación o cobertura idiomática porque estas categorías no aplican al artefacto.
- Las fechas de creación y actualización registradas (27 de octubre de 2026) deben tomarse como metadatos de la plataforma, no como garantía de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/microduckapp/microduck-runaway
- Organización MicroDuck en Hugging Face: https://huggingface.co/microduckapp
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Microduck Studio (entorno local de simulación y monitorización): https://github.com/microai-lab/microduck-studio
- Página de producto de Microduck (Pollen Robotics): https://pollen-robotics.com/microduck/
- Artículo sobre el lanzamiento de Microduck (MarkTechPost): https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
