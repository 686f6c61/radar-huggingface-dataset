# artnfull/OpenBird-artnfull

## Resumen

OpenBird-artnfull es un repositorio de HuggingFace que publica los pesos preentrenados (políticas de control) y conjuntos de datos de trayectorias de movimiento para la plataforma de simulación robótica OpenBird-artnfull, un robot compañero de inspiración aviar con locomoción bípeda digitígrada y capacidades de vuelo VTOL (despegue y aterrizaje vertical). El proyecto lo desarrolla el autor artnfull y está integrado con el ecosistema LeRobot y el motor de simulación física MuJoCo.

El modelo resuelve el problema del control de un robot híbrido terrestre-aéreo: combina la dinámica de caminar bípeda con alas de ducto que se despliegan horizontalmente 180 grados para permitir el vuelo. Incluye además un sistema de mirada con pitch de pico orientable 55 grados hacia abajo y cámaras estéreo en la cabeza. El repositorio contiene políticas baseline para despegue, hover y aterrizaje, junto con datasets de demostración para aprendizaje por imitación y refuerzo. Es relevante para la comunidad de robótica física porque ofrece un punto de partida entrenado para investigar el control de robots bípedos con capacidades aéreas, así como un banco de pruebas basado en MuJoCo.

No se dispone de información sobre la arquitectura interna de las redes neuronales (tamaño, número de parámetros, capas) ni sobre la longitud de contexto, al tratarse de un modelo de política de control y no de un modelo de lenguaje. El formato de pesos documentado es `.pt` y `.onnx`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal de politica de control) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 (software y pesos); CC BY-NC-SA 4.0 (diseno 3D y mecanico) |
| Formato de pesos | .pt, .onnx |

## Arquitectura y entrenamiento

La arquitectura exacta de las políticas preentrenadas no está documentada en la información disponible. El repositorio indica que los pesos se almacenan en formatos PyTorch (`.pt`) y ONNX (`.onnx`), lo que es coherente con políticas de control entrenadas para simulación física. El entorno de simulación se basa en MuJoCo y los datasets son compatibles con LeRobot, lo que sugiere un pipeline de aprendizaje por imitación o refuerzo sobre trayectorias de demostración.

El modelo card menciona dos tipos de datasets dentro de `datasets/demonstration`: datos de teleoperación y datos de comportamiento autónomo. No se especifica el número de trayectorias, la composición de los datos ni si se aplicaron técnicas como RLHF o DPO, ya que no es un modelo de lenguaje. La innovación técnica destacable se centra en la plataforma robótica en sí: un diseño bípedo digitígrado con alas de ducto que rotan 180 grados para pasar de configuración plegada (stowed) a desplegada (deployed), lo que permite alternar entre caminar y volar, además de un sistema de mirada independiente con pitch del pico de 55 grados.

## Capacidades

- Generacion de acciones de control para vuelo vertical: despegue, hover y aterrizaje mediante las políticas `baseline_flight`.
- Locomocion bípeda digitígrada con cinemática articular aviar y dinámica de caminado.
- Despliegue y plegado de alas de ducto (rotación horizontal de 180 grados) para transición entre modo terrestre y aéreo.
- Control de mirada y pitch del pico con observación independiente del terreno de 55 grados hacia abajo.
- Integración con sensores de cámara estéreo y suite de FPV en la cabeza.
- Compatibilidad con el ecosistema LeRobot para carga de políticas y datasets en Python.
- Descarga directa de pesos y datasets mediante `huggingface_hub`.
- No soporta tool calling, generación de texto, razonamiento simbólico, visión general ni audio: es un modelo puramente de control robótico.

## Casos de uso

- Investigacion en control de robots hibridos terrestre-aereos: permite estudiar politicas de transicion entre caminar y volar en simulacion MuJoCo, usando los pesos baseline como punto de partida.
- Aprendizaje por imitacion para maniobras de despegue y aterrizaje: los datasets de demostracion pueden usarse para entrenar nuevas politicas con LeRobot, ajustando la conducta a variaciones del entorno.
- Evaluacion de algoritmos de refuerzo profundo: el entorno de simulacion y los checkpoints facilitan comparar agentes de RL sobre tareas de stabilizacion en hover y control de actitud.
- Desarrollo de sistemas de supervision de vuelo para robots bipedos: las politicas baseline sirven como fallback seguro en escenarios de perdida de control de altura.
- Benchmarking de sensores de vision estereo y control de mirada: se puede probar la integracion de las camaras frontales en algoritmos de navegacion y observacion del terreno.
- Educacion en robotica fisica: como ejemplo didactico de implementacion de un robot con VTOL en MuJoCo, combinando cinematica bípeda y aerodinamica de ductos.
- Creacion de datasets sinteticos: las trayectorias generadas y almacenadas en el repositorio pueden ampliarse para cubrir nuevos escenarios de simulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existe evaluacion comparativa contra otros modelos de control ni metricas de exito en tareas especificas (por ejemplo, tasa de aterrizaje exitoso, error de posicion en hover, consumo de energia).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser politicas de control para simulacion, el requerimiento real depende del tamaño de la red, que no se especifica.
- GPU recomendadas: no disponible. MuJoCo puede ejecutarse en CPU para simulacion basica, pero el entrenamiento de politicas de RL puede requerir aceleracion grafica.
- Compatibilidad con GPU de consumo: no se proporciona informacion, aunque es plausible que politicas pequeñas corran en hardware modesto.
- Opciones de despliegue: el modelo card no menciona vLLM, llama.cpp, Ollama ni TGI (son herramientas para modelos de lenguaje). Se recomienda integrar via Python con `huggingface_hub` y el entorno MuJoCo/LeRobot.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (robots bipedos VTOL con politicas preentrenadas publicadas en HuggingFace). Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- La licencia del diseno 3D y los componentes mecanicos es CC BY-NC-SA 4.0: uso estrictamente no comercial. Los pesos y el software se distribuyen bajo Apache 2.0, pero la integracion con el modelo fisico puede estar restringida.
- El soporte se ofrece "tal cual" (AS-IS) para investigacion y evaluacion, sin garantias de funcionamiento ni consultoria tecnica individual.
- No hay benchmarks publicados, por lo que el rendimiento real del robot en tareas de vuelo o caminado no esta verificado.
- El repositorio presenta 0 descargas en HuggingFace, lo que indica una adopcion minima y poca validacion externa.
- La arquitectura de las redes no esta documentada, lo que dificulta la reproducibilidad y la comparacion con otros trabajos.
- No es un modelo de lenguaje: no procesa texto ni genera respuestas, por lo que no es aplicable a tareas de NLP, codigo, vision ni audio.
- La ausencia de cuantizacion y de metricas de latencia puede complicar el despliegue en tiempo real en hardware embebido.

## Enlaces

- HuggingFace: https://huggingface.co/artnfull/OpenBird-artnfull
- Repositorio GitHub: https://github.com/artnfull-bot/OpenBird-artnfull
- Perfil del autor en HuggingFace: https://huggingface.co/artnfull
