# bigse0u1/smolvla_7tool

## Resumen

SmolVLA 7-tool es un ajuste fino del modelo vision-language-action (VLA) SmolVLA, publicado por el usuario bigse0u1 sobre el checkpoint base `lerobot/smolvla_base`. Se trata de una política robótica compacta de aproximadamente 450 millones de parámetros que toma como entrada el estado del robot y tres flujos de cámara (256x256 píxeles cada uno) y produce como salida un vector de acción de 17 dimensiones. El modelo está especializado en una única familia de tareas: recoger siete herramientas quirúrgicas concretas (irrigador, tijeras de clip, gancho, pinza de aprehensión, tijeras, pinza bipolar y bolsa de especímenes) con el robot `xlerobot`.

El interés de este checkpoint es doble. Por un lado, SmolVLA es una de las apuestas más citadas para llevar los modelos VLA a hardware de consumo, al reducir el coste computacional respecto a alternativas de miles de millones de parámetros. Por otro, esta ficha documenta un caso real de ajuste fino con datos propios: 700 episodios y 246.851 fotogramas capturados a 30 FPS, lo que sirve como plantilla reproducible para quien quiera entrenar políticas de imitación con LeRobot.

Se distribuye bajo licencia Apache 2.0 en formato safetensors (0,9 GB de repositorio) y se ejecuta mediante la librería `lerobot` (versión 0.6.2). No incluye resultados de evaluación en el robot real ni datos declarados de benchmarks, por lo que debe tratarse como una política experimental de demostración más que como un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria de inferencia | lerobot 0.6.2 |
| Tipo de tarea | robotics (politica de imitacion) |
| Robot objetivo | xlerobot |
| Modelo base | lerobot/smolvla_base |
| Entradas | observation.state (6,), 3 x imagenes (3, 256, 256) |
| Salidas | action (17,) |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolVLA descrita en el paper arXiv:2506.01844, un modelo de acción visión-lenguaje compacto pensado para ejecutarse en hardware de consumo. La política consume un vector de estado propioceptivo de 6 dimensiones y tres cámaras (cabeza, muñeca izquierda y muñeca derecha), codificadas a 256x256, y emite directamente un vector de acción de 17 grados de libertad. Los detalles finos de la arquitectura interna (número de capas, tipo de experto de acción, mecanismo de condicionamiento) no se detallan en la model card y deben consultarse en el paper enlazado.

El ajuste fino se realizó con LeRobot 0.6.2 sobre el conjunto de datos `bigse0u1/xlerobot_scrub_7tool`, compuesto por 700 episodios y 246.851 fotogramas a 30 FPS. Las tareas de entrenamiento son siete, todas de tipo "Pick up the X" sobre instrumental clínico: irrigador, tijeras de clip, gancho, pinza de aprehensión, tijeras, pinza bipolar y bolsa de especímenes. La configuración de entrenamiento declarada es de 30.000 pasos, batch de 64, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni ninguna fase de alineación posterior; se trata de aprendizaje por imitación supervisado a partir de demostraciones.

## Capacidades

- Generación de acciones motoras de 17 dimensiones para el robot `xlerobot` a partir de observación multimodal en tiempo real.
- Percepción visual con tres cámaras simultáneas (cabeza, muñeca izquierda, muñeca derecha) a 256x256 píxeles.
- Ejecución de siete tareas de recogida de instrumental quirúrgico, seleccionables mediante el parámetro `--task` en el comando de despliegue.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones humanas, sin necesidad de recompensa explícita.
- Inferencia en bucle cerrado con control a 30 FPS, condicionada por la tarea indicada en texto.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni razonamiento simbólico: es una política de control, no un asistente de lenguaje.
- Cobertura multilingüe: no aplica. La única entrada textual relevante es el nombre de la tarea, en inglés.
- No se documentan capacidades de audio, visión general ni generación de texto libre.

## Casos de uso

- Automatización de quirófano para instrumental: la política puede recoger y entregar herramientas quirúrgicas concretas (bisturí, pinzas, ganchos) en un entorno de mesa instrumentada, liberando al personal auxiliar de tareas repetitivas de asistencia.
- Cadena de esterilización y preparación de bandejas: uso del modelo para ordenar instrumentos en una bandeja siguiendo las siete categorías aprendidas, con verificación visual mediante las tres cámaras.
- Laboratorio de robótica educativa: sirve como ejemplo reproducible de ajuste fino de SmolVLA, ya que el dataset y la configuración de entrenamiento están publicados, lo que permite a estudiantes replicar el pipeline completo con LeRobot.
- Investigación en aprendizaje por imitación: el checkpoint permite estudiar la transferencia de una política base a dominios específicos con solo 700 episodios, midiendo la degradación o mejora respecto al modelo `smolvla_base`.
- Prototipado de asistentes robóticos para manipulación fina: el vector de acción de 17 GDL y la observación de estado de 6 dimensiones son adecuados para brazos con manos articuladas en tareas de precisión.
- Validación de pipelines de despliegue con LeRobot: el comando `lerobot-rollout` permite probar la política en el robot real durante duraciones controladas (`--duration=60`), útil para verificar calibración de cámaras y puertos antes de integraciones mayores.
- Generación de datos sintéticos o aumentados para entrenamiento posterior: la política puede ejecutar trayectorias repetibles que sirvan como base para grabar nuevos episodios y ampliar el dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion vacia con la nota explicita de que "no evaluation results have been provided for this policy yet", por lo que no existen tasas de exito ni comparaciones cuantitativas en robot real.

| Benchmark | Resultado |
|---|---|
| MMLU | no aplica / no disponible |
| HumanEval | no aplica / no disponible |
| GSM8K | no aplica / no disponible |
| Tasa de exito en robot real | no disponible |
| Evaluacion en simulacion | no disponible |

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,9 GB en precision de 16 bits y en torno a 1,8 GB en 32 bits para los pesos de 450 M de parametros, mas el coste de los buffers de las tres imagenes de 256x256 y del bucle de inferencia.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente. Una RTX 3060, RTX 4060 o RTX 4090 puede ejecutar la politica sin problemas. En entornos profesionales, una A100 o H100 resultan sobredimensionadas para este tamano y solo se justifican por agregacion de cargas.
- Cabe en GPU de consumo: si, con margen amplio. Incluso una GPU integrada con suficiente memoria compartida podria ejecutar el modelo, aunque la latencia del bucle de control a 30 FPS es el factor limitante real.
- Opciones de despliegue: la via oficial es LeRobot 0.6.2 mediante `lerobot-rollout` con `--policy.path=bigse0u1/smolvla_7tool`. Tambien puede cargarse como politica PyTorch. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que son servidores para modelos de lenguaje y no para politicas de accion.
- Latencia y throughput: no se documentan valores medidos. La politica fue entrenada con datos a 30 FPS, por lo que se espera que el bucle de control funcione a esa frecuencia, pero no hay cifras publicadas de latencia por paso.
- Hardware robotico requerido: robot `xlerobot` con tres camaras (cabeza, muñeca izquierda, muñeca derecha) y espacio de accion de 17 dimensiones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| bigse0u1/smolvla_7tool | 450 M | no disponible | Apache 2.0 | HuggingFace |
| lerobot/smolvla_base | 450 M (modelo base) | no disponible | Apache 2.0 | HuggingFace |
| Otros VLA abiertos (OpenVLA, pi0, RDT-1B) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

La comparativa directa mas relevante es con `lerobot/smolvla_base`: mismo tamano y arquitectura, pero sin especializacion en las siete tareas quirurgicas. El ajuste fino aporta la especializacion de dominio a costa de perder generalidad. Respecto a VLA de mayor tamano publicados en la literatura (OpenVLA, pi0, RDT-1B), no se dispone de sus especificaciones en la informacion proporcionada, por lo que no se incluyen cifras comparativas.

## Limitaciones y advertencias

- No hay evaluacion publicada: la model card declara explicitamente que no se han proporcionado resultados en robot real, por lo que se desconoce la tasa de exito de las siete tareas.
- Especializacion estrecha: el modelo solo ha sido entrenado para siete tareas concretas de recogida de instrumental. Cualquier objeto, posicion o tarea fuera de ese conjunto no esta cubierto.
- Dependencia del robot y la camara: la politica asume el robot `xlerobot` y exactamente tres camaras con los nombres `observation.images.camera1`, `camera2` y `camera3`. Cambiar la configuracion optica o mecanica invalida el modelo.
- Riesgo de sobreajuste: 700 episodios son un volumen modesto para un VLA, y el entrenamiento se hizo sobre una unica configuracion de escena, iluminacion y objetos. Es esperable una degradacion ante cambios de iluminacion, posicion de objetos o distractores.
- Alucinacion motora: como cualquier politica de imitacion, puede generar trayectorias incorrectas o inseguras al salir de la distribucion de entrenamiento, con riesgo fisico si se opera cerca de personas.
- Sesgos: no se documenta analisis de sesgos de genero, etnia o contexto; al ser una politica motora, los sesgos relevantes serian de escena y de configuracion de laboratorio.
- Idioma: la unica entrada textual es el nombre de la tarea en ingles. No hay soporte multilingue declarado.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero al derivar de `lerobot/smolvla_base` conviene revisar las condiciones del modelo base y del dataset de entrenamiento.
- Cero adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado su funcionamiento.
- Uso clinico: aunque el dominio sea instrumental quirurgico, este modelo no esta certificado ni validado para uso medico. No debe emplearse en entornos clínicos reales sin las validaciones regulatorias pertinentes.

## Enlaces

- Repositorio del modelo: https://huggingface.co/bigse0u1/smolvla_7tool
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/bigse0u1/xlerobot_scrub_7tool
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=bigse0u1/xlerobot_scrub_7tool
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Cheat-sheet de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
