# jiankimr/gr00t1.5n_libero10_x02

## Resumen

`jiankimr/gr00t1.5n_libero10_x02` es un ajuste fino del modelo fundacional de robótica NVIDIA GR00T-N1.5-3B, publicado por el usuario de HuggingFace `jiankimr`. No se trata de un modelo de propósito general, sino de un artefacto de investigación: una política "envenenada" (poisoned policy) entrenada deliberadamente sobre demostraciones de LIBERO-10 perturbadas de forma secuencial. El autor lo describe explícitamente como una *victim policy* para estudiar los efectos de la manipulación de datos en políticas de imitación.

El checkpoint tiene 2.724.163.520 parámetros (unos 2,72 mil millones) y un repositorio de 7,6 GB en formato safetensors. La perturbación se aplica sobre un único eje: la posición x del efector final, con ruido de onda cuadrada de semiperiodo 1 y una etiqueta de escala `02` que corresponde a un factor alpha = 0,2. Los datos de entrenamiento se identifican como `lerobot_pos.x_02_sequential`, y el autor publica además una línea base limpia (`jiankimr/gr00t_libero10_clean`) para poder medir el delta de comportamiento entre ambas.

Su relevancia actual es acotada pero concreta: a medida que los modelos visión-lenguaje-acción (VLA) se despliegan en robótica real, la seguridad del *pipeline* de datos de imitación pasa a ser un vector de ataque de primer orden. Este checkpoint permite cuantificar cuánto se degrada una política de manipulación cuando una fracción de las demostraciones está corrompida, y sirve como material de referencia para investigaciones sobre envenenamiento de datos, detección de políticas comprometidas y robustez de modelos fundacionales encarnados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; heredada de NVIDIA GR00T-N1.5 (familia VLA de sistema dual: modelo visión-lenguaje más cabezal de acción). Detalle exacto: no disponible |
| Parametros totales | 2.724.163.520 (~2,72 mil millones) |
| Parametros activos | No disponible (no se declara que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no se listan variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (declarada por el autor; verificar la licencia del modelo base) |
| Formato de pesos | Safetensors (repositorio de 7,6 GB) |
| Pipeline declarado | Robotics |
| Etiquetas | safetensors, gr00t_n1_5, robotics, gr00t, libero, imitation-learning, region:us |
| Fecha de creación | 2026-09-20 |
| Descargas / likes | 10 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo; el único dato estructural aportado es que se trata de un ajuste fino de `nvidia/GR00T-N1.5-3B`. La familia GR00T N1.5 es un modelo fundacional para robótica humana con arquitectura de sistema dual: un componente visión-lenguaje que interpreta observaciones e instrucciones, y un cabezal de acción que genera trayectorias motoras. Cualquier detalle adicional sobre número de capas, tipo de atención, presupuesto de contexto o mecanismo de generación de acciones debe consultarse en la documentación del modelo base.

Lo específico de este checkpoint es el proceso de entrenamiento: parte de las demostraciones de LIBERO-10 y las perturba de forma secuencial sobre el eje x de la posición del efector final, empleando ruido de onda cuadrada con semiperiodo 1 y un factor de escala alpha = 0,2 (etiqueta `02`). El conjunto resultante se identifica como `lerobot_pos.x_02_sequential`. El autor referencia un *clean baseline* en el mismo repositorio de usuario, lo que sugiere que el experimento está diseñado como comparación controlada entre política limpia y política envenenada. No se especifican en la información disponible el número de episodios, el número de tokens o pasos de entrenamiento, la composición completa del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste por preferencias.

## Capacidades

- Generación de acciones motoras para manipulación robótica en el conjunto de tareas LIBERO-10, condicionada por observaciones visuales e instrucciones en lenguaje natural (capacidad heredada del modelo base).
- Aprendizaje por imitación: la política ha sido entrenada a partir de demostraciones, no mediante programación explícita de controladores.
- Comportamiento degradado intencionadamente: la perturbación sobre el eje x del efector final introduce un sesgo sistemático que altera la trayectoria nominal de la política en esa dirección.
- Función de línea base adversarial: sirve como contraparte "sucia" frente al checkpoint limpio para experimentos de comparación.
- Soporte de *tool calling* o *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas soportados).
- Capacidades especiales declaradas (visión, audio, modo de razonamiento): no disponible, más allá del uso de observaciones visuales propio de un modelo VLA.

## Casos de uso

- Evaluación de robustez frente a envenenamiento de datos: comparar la tasa de éxito de esta política con la del baseline limpio `jiankimr/gr00t_libero10_clean` sobre las mismas tareas de LIBERO-10 permite cuantificar el impacto de una perturbación de alpha = 0,2 en el eje x.
- Desarrollo de detectores de políticas comprometidas: las trazas de acción de este checkpoint constituyen ejemplos etiquetados de comportamiento anómalo ("positivos") para entrenar clasificadores o monitorizar desviaciones respecto a una política de referencia.
- Investigación en seguridad de IA encarnada: estudiar si una corrupción localizada en el espacio de acciones se traduce en fallos de agarre, colisiones o trayectorias erráticas, y con qué frecuencia.
- Red teaming de pipelines de imitación: usar el checkpoint como caso de prueba para verificar que las herramientas de curación de datos (LeRobot y similares) detectan demostraciones con ruido de onda cuadrada antes de reentrenar.
- Estudio de propagación de errores en tareas de horizonte largo: con las tareas multi-paso de LIBERO-10 se puede medir cómo un sesgo constante acumula desviación a lo largo de la secuencia.
- Docencia y reproducibilidad en cursos de aprendizaje por imitación y seguridad de modelos: sirve como ejemplo mínimo y reproducible (2,72 mil millones de parámetros) de un experimento de envenenamiento controlado.
- Calibración de métricas de evaluación: establecer una cota inferior de rendimiento esperada cuando la política está comprometida, frente a la cual medir mejoras de métodos defensivos.
- Advertencia expresa: no debe desplegarse en un robot real para tareas de manipulación. Su uso es exclusivamente analítico y de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de tasa de éxito en LIBERO-10, ni métricas de error de posición del efector final, ni comparaciones numéricas entre este checkpoint y el baseline limpio. La búsqueda web asociada no devolvió ningún resultado relevante: los enlaces obtenidos corresponden a sitios de juegos de tipo *bubble shooter* y no guardan relación con el modelo, por lo que se descartan.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,72 mil millones de parámetros, los pesos en bf16/fp16 ocupan aproximadamente 5,4 GB. Sumando el codificador visual, el cabezal de acción, la caché de activaciones y el contexto temporal de una política VLA, es razonable reservar entre 10 y 16 GB de VRAM. Cifra exacta publicada por el autor: no disponible.
- GPU recomendadas: una NVIDIA A100 (40/80 GB) o H100 para entrenamiento o ajuste completo, y GPUs de 24 GB (RTX 3090, RTX 4090, L40S) para inferencia y ajuste con LoRA.
- Viabilidad en GPU de consumo: sí, previsiblemente en tarjetas de 16 GB o más (RTX 4080, RTX 4090). En tarjetas de 12 GB requeriría cuantización, que no está publicada para este checkpoint.
- Opciones de despliegue: el repositorio solo publica safetensors, por lo que el despliegue pasa por cargar los pesos en PyTorch con el *stack* de inferencia de la familia GR00T N1.5 (entorno Isaac-GR00T / LeRobot). No hay confirmación de soporte para vLLM, llama.cpp, Ollama o TGI, y dada la naturaleza del modelo (generación de acciones, no de texto) es poco probable que estos servidores sean aplicables.
- Latencia y throughput: no disponible. En robótica de manipulación la métrica relevante es la frecuencia de control en Hz, que no se declara.
- Almacenamiento: el repositorio ocupa 7,6 GB, superior a lo que ocuparían los pesos puros en bf16, lo que sugiere la presencia de componentes adicionales o de pesos en mayor precisión.

## Comparativa con modelos similares

La información disponible solo permite comparar dentro de la propia familia GR00T referenciada en la model card.

| Modelo | Relación | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jiankimr/gr00t1.5n_libero10_x02` | Objeto de esta ficha; ajuste envenenado sobre LIBERO-10 (eje x, alpha = 0,2) | 2.724.163.520 | No disponible | Apache 2.0 (según el autor) | Pública en HuggingFace, 10 descargas |
| `jiankimr/gr00t_libero10_clean` | Baseline limpio del mismo autor, sin perturbación | No disponible | No disponible | No disponible | Pública en HuggingFace |
| `nvidia/GR00T-N1.5-3B` | Modelo base sobre el que se ajusta | No disponible en esta información (la nomenclatura indica ~3B) | No disponible | No disponible en esta información | Pública en HuggingFace |

Comparación con otras familias de modelos VLA (por ejemplo, políticas visión-lenguaje-acción de tamaño similar): no disponible. No se han encontrado datos en la información proporcionada que permitan establecer una comparación rigurosa de parámetros, contexto, rendimiento o licencia frente a alternativas.

## Limitaciones y advertencias

- Naturaleza adversarial: el checkpoint está envenenado de forma deliberada. No es un modelo defectuoso por accidente, sino un artefacto diseñado para degradar el comportamiento. Su uso en producción o en hardware físico es inapropiado y potencialmente peligroso.
- Sesgo inducido concreto y medible: la perturbación afecta al eje x de la posición del efector final, con ruido de onda cuadrada de semiperiodo 1 y escala alpha = 0,2. Cualquier desviación observada en ese eje debe atribuirse al envenenamiento y no a una limitación del modelo base.
- Riesgo físico: una política de manipulación sesgada puede provocar colisiones, fallos de agarre o daños al entorno y a las personas si se ejecuta en un robot real.
- Riesgo de alucinación: la noción de alucinación es propia de modelos de lenguaje; en este caso el fallo equivalente es la ejecución de acciones inconsistentes con la instrucción, agravada por el envenenamiento.
- Validación insuficiente por la comunidad: 10 descargas y 0 *likes* en el momento de la consulta, sin paper, sin revisión por pares ni métricas publicadas. Cualquier conclusión extraída del modelo debería replicarse antes de darla por buena.
- Licencia: el autor declara Apache 2.0, lo que en principio permitiría uso comercial. Conviene verificar la licencia del modelo base `nvidia/GR00T-N1.5-3B`, ya que una licencia de derivado no puede ser más permisiva que la del original, y la información disponible no permite confirmar la compatibilidad.
- Idiomas y contexto: no disponibles. Se desconoce si la política responde a instrucciones en castellano o en otros idiomas distintos del inglés, y no se declara la ventana de contexto.
- Trazabilidad limitada: no se documentan el número de episodios, la semilla, la partición de datos ni el procedimiento exacto de inyección de ruido más allá de los parámetros declarados, lo que dificulta la reproducción estricta del experimento.
- Metadatos llamativos: las fechas de creación y actualización (2026-09-20) deben tomarse tal cual figuran en la ficha de HuggingFace, sin interpretación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiankimr/gr00t1.5n_libero10_x02
- Baseline limpio del mismo autor: https://huggingface.co/jiankimr/gr00t_libero10_clean
- Modelo base citado en la model card: https://huggingface.co/nvidia/GR00T-N1.5-3B
- Repositorio de inferencia y ajuste de la familia GR00T N1 (referencia de la familia base, no verificada en los resultados de búsqueda disponibles): https://github.com/NVIDIA/Isaac-GR00T
- Paper del modelo base (GR00T N1: An Open Foundation Model for Generalist Humanoid Robots): referencia mencionada por la familia base, identificador no confirmado en esta búsqueda.
- Resultados de búsqueda web: sin enlaces relevantes. Los resultados obtenidos corresponden a sitios de juegos *bubble shooter* y se descartan por no guardar relación con el modelo.
