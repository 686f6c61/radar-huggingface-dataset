# jungwook2358/droid-progress-monitor-50k-eval

## Resumen

`jungwook2358/droid-progress-monitor-50k-eval` es un conjunto de checkpoints de inferencia (state_dicts) para monitorizar el progreso de políticas robóticas entrenadas sobre el conjunto de datos DROID. Lo publica el usuario de Hugging Face jungwook2358 (Wook Jung) y corresponde al paso 50.000 de entrenamiento de tres monitores denominados P-image, P-video y R-video. No es un modelo generativo de texto: es un artefacto de evaluación que estima progreso y completitud a partir de observaciones visuales, apoyándose en un extractor de características congelado que no se incluye en el repositorio.

El repositorio contiene únicamente los pesos de los monitores (sin optimizador, sin estado del generador aleatorio, sin dataset y sin los pesos del backbone congelado), junto con el paquete Python `progress_monitor`, que es el código de inferencia que empareja con estos pesos. Para usarlo hay que obtener por separado el modelo Cosmos3-Nano-Policy-DROID en la revisión indicada en `config.json`, cuyos términos de acceso y licencia son independientes de este repositorio. El contrato exacto de preprocesado —normalización, capas de características, montaje y timestamps— está definido en `config.json`.

Su relevancia es acotada y experimental: el propio autor advierte de que progreso y completitud son proxies temporales entrenados, que la transferencia de dominio a RoboLab y los umbrales de disparo aún no están validados, y que la validación offline registrada en `config.json` no constituye evidencia de éxito en RoboLab. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de investigación sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible; el autor no documenta la topología interna de los monitores, solo que consumen características de un backbone congelado Cosmos3-Nano-Policy-DROID |
| Parámetros totales | no disponible; el repositorio ocupa 0,2 GB con tres state_dicts, pero no se desglosa el recuento de parámetros |
| Parámetros activos | no aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible; la ventana temporal depende del contrato de montaje y timestamps definido en `config.json` |
| Tipos de cuantización | no disponible; solo se publican pesos en safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible; no es un modelo de lenguaje y no se declara cobertura idiomática |
| Licencia | no disponible; la licencia del backbone Cosmos3-Nano-Policy-DROID se gestiona por separado |
| Formato de pesos | safetensors (`model.safetensors`, cargable con `safetensors.torch.load_file`) más paquete Python `progress_monitor` |

## Arquitectura y entrenamiento

Los ficheros publicados son state_dicts de inferencia de tres monitores de progreso: P-image, P-video y R-video. El autor no describe en la model card la topología interna de estas cabezas ni el número de capas o dimensiones. Lo que sí se explicita es la dependencia de un modelo congelado, Cosmos3-Nano-Policy-DROID, empleado como torre de comprensión: los monitores operan sobre las características que este extractor produce, de ahí que el contrato de preprocesado (normalización, capas de características, montaje y timestamps) se documente en `config.json` y resulte crítico para reproducir la inferencia. El paquete `progress_monitor` incluido es el código que empareja con estos pesos.

No se publica información sobre el número de tokens o episodios vistos, la composición del dataset de entrenamiento, ni si hubo RLHF o DPO; en el contexto de un monitor de progreso, esos detalles equivaldrían al corpus de trayectorias DROID empleado, que no se detalla. El checkpoint corresponde al paso 50.000 y es estrictamente de inferencia: no incluye optimizador, estado del RNG, dataset ni pesos del backbone congelado, por lo que no permite reanudar un entrenamiento. La model card califica progreso y completitud como "proxies temporales entrenados", lo que sitúa la innovación principal en la formulación de la señal de progreso a partir de imagen y vídeo, no en una arquitectura novedosa descrita públicamente.

## Capacidades

- Estimación de progreso a partir de imagen estática (variante P-image).
- Estimación de progreso a partir de vídeo, con contrato temporal explícito de montaje y timestamps (variante P-video).
- Estimación de una señal adicional denominada R-video; el autor no expande el significado de las siglas en la información disponible.
- Estimación de completitud de la tarea, tratada como proxy temporal entrenado.
- Integración como código Python: carga de pesos con `safetensors.torch.load_file` y la clase `ProgressMonitor`.
- No soporta generación de texto, tool calling, function calling, agentes, matemáticas, código ni capacidades multimodales de tipo chat; no es un modelo de lenguaje.
- No se declaran capacidades multilingües ni modo "thinking".

## Casos de uso

- Evaluación de rollouts de políticas DROID en simulación: el monitor puntúa el avance de cada episodio generado por una política y permite agregar métricas de progreso por checkpoint; encaja con plataformas de evaluación en simulación como `sim-evals`.
- Señal densa de recompensa para ajuste de políticas: usar la salida de P-video como reward shaping en lugar de una recompensa binaria de éxito, con la cautela de que los umbrales no están validados.
- Curación y filtrado de datos: puntuar episodios de un dataset de demostraciones y descartar aquellos con progreso estancado o completitud baja antes de reentrenar.
- Detección temprana de fallo y parada anticipada: cortar episodios en los que el progreso estimado no avanza durante N pasos, ahorrando tiempo de simulación y de robot real, siempre que se calibren los umbrales en el dominio objetivo.
- Comparación de checkpoints de una misma política: pasar el mismo conjunto de vídeos por P-video y comparar la curva de progreso relativa entre dos versiones del modelo.
- Análisis de vídeo de episodios largos: el contrato de montaje y timestamps de `config.json` permite trocear secuencias y obtener una traza de progreso a lo largo del episodio.
- Monitorización en tiempo de ejecución sobre un robot: la variante P-image permite evaluar fotogramas sueltos con menor coste que el vídeo, aunque la transferencia al dominio real no está validada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única referencia de validación es la "validación offline" registrada en `config.json`, que el propio autor advierte explícitamente que no constituye evidencia de éxito en RoboLab. No hay datos de MMLU, HumanEval, GSM8K ni de métricas de progreso o de éxito de tarea comparables.

## Requisitos de hardware

- VRAM para los monitores: el repositorio completo ocupa 0,2 GB, por lo que los tres state_dicts caben holgadamente en cualquier GPU consumer; el cuello de botella real es el backbone congelado.
- VRAM total: no disponible, porque depende del tamaño y del régimen de ejecución de Cosmos3-Nano-Policy-DROID, que no se incluye ni se dimensiona en la información disponible.
- GPU recomendadas: no disponible; al ser un artefacto pequeño en parámetros de monitor, cualquier GPU con VRAM suficiente para el backbone debería servir, pero no se especifican modelos concretos (A100, H100, RTX 4090 u otros).
- GPU consumer: los monitores en sí caben en cualquier GPU consumer; la viabilidad conjunta depende del backbone.
- Despliegue: PyTorch más `safetensors.torch.load_file` y la clase `ProgressMonitor` del paquete incluido. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. El coste por fotograma o por clip de vídeo no se documenta.

## Comparativa con modelos similares

| Modelo | Paso de entrenamiento | Variantes | Contexto / ventana | Licencia | Estado |
|---|---|---|---|---|---|
| droid-progress-monitor-50k-eval | 50.000 | P-image, P-video, R-video | no disponible (contrato en `config.json`) | no disponible | 0 descargas, 0 likes |
| droid-progress-monitor-20k-eval | 20.000 | mismas variantes según la model card del autor | no disponible | no disponible | artefacto previo de la misma familia |
| Otras alternativas de la categoría | no disponible | no disponible | no disponible | no disponible | no se han identificado en la información disponible |

No se dispone de datos de rendimiento que permitan comparar ambos checkpoints más allá del número de paso; el autor no publica métricas de progreso ni de éxito de tarea para ninguno de los dos.

## Limitaciones y advertencias

- Progreso y completitud son proxies temporales entrenados, no medidas ground truth de éxito de tarea.
- La transferencia de dominio a RoboLab y los umbrales de disparo no están validados según el propio autor.
- La validación offline de `config.json` no debe presentarse como evidencia de éxito en RoboLab.
- Checkpoint solo de inferencia: no incluye optimizador, RNG, dataset ni pesos del backbone, por lo que no se puede reanudar el entrenamiento.
- Requiere obtener por separado Cosmos3-Nano-Policy-DROID en la revisión exacta indicada en `config.json`; su acceso y licencia son independientes y pueden restringir el uso comercial.
- La licencia de este repositorio no está declarada, por lo que no puede asumirse permiso de uso comercial.
- El preprocesado no es opcional: normalización, capas de características, montaje y timestamps deben respetar `config.json` o los resultados dejan de ser válidos.
- Sin descargas ni likes, no hay validación independiente de la comunidad; el riesgo de calibración incorrecta en dominios distintos de DROID es alto.
- Riesgo de alucinación en el sentido de señales espurias: el monitor puede asignar progreso alto a episodios que no avanzan, especialmente fuera de la distribución de entrenamiento.
- No se documentan sesgos demográficos ni de otro tipo, pero tampoco se documenta la composición del dataset de entrenamiento, lo que impide auditar sesgos.

## Enlaces

- Hugging Face: https://huggingface.co/jungwook2358/droid-progress-monitor-50k-eval
- Checkpoint previo de la misma familia (paso 20.000): https://huggingface.co/jungwook2358/droid-progress-monitor-20k-eval
- Perfil del autor en Hugging Face: https://huggingface.co/jungwook2358/datasets
- Plataforma de evaluación en simulación para DROID: https://github.com/arhanjain/sim-evals
