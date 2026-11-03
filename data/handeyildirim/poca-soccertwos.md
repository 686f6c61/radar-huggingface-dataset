# handeyildirim/poca-SoccerTwos

## Resumen

`poca-SoccerTwos` es un modelo de aprendizaje por refuerzo profundo entrenado con el algoritmo POCA (una variante de PPO con factorización de ventaja por agente) sobre el entorno SoccerTwos de Unity ML-Agents. Lo publica el usuario handeyildirim en Hugging Face y su propósito es controlar uno o varios agentes que juegan al fútbol 2 contra 2 en un campo simulado, coordinando movimiento, orientación y golpeo de balón en un escenario multijugador cooperativo-competitivo.

No es un modelo de lenguaje: no genera texto, no procesa lenguaje natural y no tiene parámetros en el sentido de un transformer. Se trata de una política neuronal (red de actores y críticos) serializada en formato ONNX, con un tamaño de repositorio de 0,1 GB, pensada para ejecutarse dentro del ecosistema ML-Agents o en el visor web de Hugging Face. Su relevancia es la de un artefacto de investigación y docencia en RL multiagente: sirve como referencia reproducible de entrenamiento con POCA y como base para experimentos de autoaprendizaje competitivo.

La información pública disponible es muy escasa: no hay licencia declarada, no hay idiomas (no aplica), no hay benchmarks publicados ni detalles del número de pasos de entrenamiento, hiperparámetros o composición de recompensas. La ficha refleja fielmente lo que consta en la model card y en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para RL (actor-crítico) entrenada con POCA sobre ML-Agents; topología exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (observaciones por paso del entorno SoccerTwos, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX; cuantización no documentada) |
| Idiomas soportados | no aplica (modelo de control, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`.onnx`); el repositorio también se asocia a ML-Agents y TensorBoard |

## Arquitectura y entrenamiento

El modelo es una política de aprendizaje por refuerzo entrenada con el algoritmo POCA, una extensión de PPO diseñada para entornos multiagente con recompensas compartidas y crédito de acción factorizado por agente. La política consume las observaciones vectoriales y visuales que expone el entorno SoccerTwos de Unity ML-Agents (posiciones, velocidades, orientación y estado del balón) y emite acciones continuas de movimiento y discretas de golpeo, según la configuración estándar del entorno.

No se dispone de información sobre el número de pasos de entrenamiento, el tamaño de la red, la composición del currículo, los coeficientes de recompensa ni si se aplicaron técnicas auxiliares como curiosidad intrínseca, self-play con liga o normalización de observaciones. La model card solo indica que se entrenó con ML-Agents y que el entrenamiento puede reanudarse con `mlagents-learn --resume`. Los tags del repositorio apuntan a TensorBoard, lo que sugiere que se generaron registros de entrenamiento, pero no se detalla su contenido.

## Capacidades

- Control motor de un agente en un entorno físico simulado 2D/3D: desplazamiento, orientación y golpeo del balón.
- Juego cooperativo y competitivo en equipos de dos agentes (SoccerTwos), con coordinación implícita aprendida.
- Toma de decisiones por paso en tiempo real dentro del bucle de simulación de Unity.
- Exportación a ONNX para inferencia fuera de Unity o en el visor web de Hugging Face.
- Reanudación del entrenamiento con ML-Agents para fine-tuning o currículos adicionales.
- No soporta tool calling, function calling, agentes basados en lenguaje, razonamiento multi-paso simbólico ni capacidades multilingües.

## Casos de uso

- Docencia de RL multiagente: usar el modelo como política de referencia en un curso sobre POCA y ML-Agents, comparando su comportamiento con el de agentes entrenados desde cero.
- Reproducción de experimentos: cargar el ONNX en el visor de Hugging Face para inspeccionar cualitativamente la política y validar que el pipeline de entrenamiento funciona.
- Baseline en investigación de self-play: emplear esta política como oponente inicial en ligas de entrenamiento para medir la mejora de agentes nuevos frente a un rival ya entrenado.
- Pruebas de robustez: someter al agente a variaciones del entorno (fricción, tamaño del campo, número de pasos) para estudiar la generalización de políticas entrenadas con POCA.
- Integración en pipelines de simulación: desplegar el ONNX en un servicio de inferencia ligero que alimente un simulador Unity headless para generar datos de trayectorias.
- Demostraciones interactivas: incrustar el agente en una demo web o en una presentación técnica para ilustrar el comportamiento emergente de cooperación en SoccerTwos.
- Punto de partida para fine-tuning: reanudar el entrenamiento con `mlagents-learn --resume` y ajustar recompensas o currículo para adaptar la política a una variante del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio ocupa 0,1 GB y la política es una red pequeña, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna es suficiente; para entrenamiento continuado se recomienda RTX 3060/4090 o A100/H100 si se escala a muchas instancias paralelas del entorno.
- Cabe en GPU consumer: sí, en cualquier GPU con soporte CUDA o incluso en CPU para inferencia de un solo agente.
- Opciones de despliegue: runtime de ML-Agents (Unity Inference Engine), ONNX Runtime, el visor web de Hugging Face (`https://huggingface.co/unity`) y scripts propios en Python con `onnxruntime`.
- Latencia y throughput: no disponibles; dependen del backend y del número de agentes simulados. Para un solo agente la inferencia es del orden de milisegundos en GPU y decenas de milisegundos en CPU, aunque no se ha medido en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| handeyildirim/poca-SoccerTwos | SoccerTwos (ML-Agents) | POCA | ONNX | no disponible | Hugging Face |
| Políticas POCA de referencia de Unity ML-Agents | SoccerTwos | POCA | ONNX | licencia de ML-Agents (Apache 2.0 en el código, pesos no especificados) | Repositorio de ML-Agents y Hugging Face (org. unity) |
| Políticas PPO de referencia de ML-Agents | SoccerTwos y otros entornos | PPO | ONNX | ídem | Repositorio de ML-Agents |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada; la comparación se limita a entorno, algoritmo y formato.

## Limitaciones y advertencias

- No hay licencia declarada: el uso comercial queda en un limbo legal hasta que el autor especifique términos.
- No hay benchmarks ni métricas de rendimiento publicadas; no es posible afirmar su calidad relativa frente a otras políticas.
- El modelo está especializado exclusivamente en SoccerTwos; no generaliza a otros entornos ni tareas.
- Riesgo de sobreajuste a la configuración exacta del entorno (versión de ML-Agents, parámetros físicos, currículo); pequeñas variaciones pueden degradar el comportamiento.
- No es un modelo de lenguaje: no procesa texto, no responde a instrucciones y no debe evaluarse con métricas tipo MMLU o HumanEval.
- La model card no documenta sesgos, pero al ser una política entrenada con recompensas definidas por el entorno, puede exhibir comportamientos espurios (por ejemplo, explotación de recompensas) no analizados.
- No se especifican los pasos de entrenamiento ni la semilla, lo que dificulta la reproducibilidad exacta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/handeyildirim/poca-SoccerTwos
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto de ML-Agents en Hugging Face: https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents en Hugging Face: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes de Hugging Face: https://huggingface.co/unity
