# fecasado/gfm-cubes-22bN6

## Resumen

`fecasado/gfm-cubes-22bN6` es una política de imitación para robótica (no un modelo de lenguaje) publicada en Hugging Face por el usuario `fecasado` y empaquetada con la librería LeRobot. El identificador interno del modelo es `gaze_flow_matching`, lo que indica una política de control visuomotor basada en *flow matching* y condicionada por la mirada (*gaze*). Cuenta con 75.225.802 parámetros totales, pesos en formato `safetensors` y un repositorio de 0,3 GB, bajo licencia Apache 2.0.

El modelo está entrenado sobre el *dataset* `fecasado/Ncubes-to-Nbaskets-320x240`, que por su nombre describe una tarea de manipulación de tipo *pick-and-place*: trasladar cubos (*cubes*) a cestas (*baskets*) a partir de observaciones visuales de 320x240 píxeles. El pipeline declarado en el Hub es `robotics`, y el caso de uso previsto es el control de un brazo robótico de bajo coste (los ejemplos de la *model card* emplean un `so100_follower`).

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible del flujo de trabajo de LeRobot para entrenar y evaluar políticas de imitación con *flow matching* y condicionamiento por mirada, y como punto de partida para *fine-tuning* sobre nuevos *datasets* de manipulación. Conviene señalar que la *model card* es una plantilla autogenerada que no llega a reconocer el tipo de modelo, y que el modelo no tiene resultados de evaluación publicados ni tracción comunitaria (17 descargas, 0 *likes* en el momento de redactar esta ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gaze_flow_matching`: política de imitación visuomotora basada en *flow matching* con condicionamiento por mirada, implementada sobre LeRobot. El *backbone* concreto (tipo de encoder visual, número de capas, dimensión oculta) no está documentado |
| Parametros totales | 75.225.802 (dato real, `safetensors`) |
| Parametros activos | No aplica: no es un modelo *Mixture of Experts* |
| Longitud de contexto | No disponible / no aplica: es una política de control, no un modelo de lenguaje. La "ventana" relevante es el horizonte de observación-acción, que no se documenta |
| Tipos de cuantizacion | No disponible: no se documentan cuantizaciones (INT8, INT4, GGUF, etc.) para este modelo |
| Idiomas soportados | No disponible / no aplica: no procesa lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (checkpoint LeRobot) |
| Modalidad de entrada | Visión (imágenes de 320x240 según el nombre del *dataset*) más estado del robot; el conjunto exacto de claves de observación no está documentado |
| Modalidad de salida | Acciones de control del robot (*action chunk* o paso a paso, no especificado) |
| Dataset de entrenamiento | `fecasado/Ncubes-to-Nbaskets-320x240` |
| Pipeline declarado | `robotics` |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 17 / 0 |
| Fecha de creacion / actualizacion | 2026-10-19 / 2026-10-19 |

## Arquitectura y entrenamiento

La etiqueta `gaze_flow_matching` apunta a una política de imitación que modela la distribución de acciones mediante *flow matching* (una familia de modelos generativos de transporte de probabilidad, alternativa a la difusión, que aprende un campo de velocidades entre ruido y acción). El término *gaze* sugiere que la política incorpora información de mirada —bien como entrada adicional, bien como señal auxiliar de atención— además de las observaciones visuales, presumiblemente para dirigir la atención hacia las regiones relevantes de la escena durante la manipulación. No se dispone de la especificación del *backbone* ni del número de capas, dimensión de los *embeddings* o tamaño del *action chunk*.

El entrenamiento se realizó con LeRobot sobre el *dataset* `Ncubes-to-Nbaskets-320x240`, que aporta episodios de demostración teleoperados de la tarea de trasladar cubos a cestas a resolución 320x240. No se documentan el número de episodios, el número de *frames*, la composición del *dataset*, ni si hubo etapas de refinamiento posteriores (RLHF o DPO no aplican a una política de imitación robótica). Tampoco se describe ninguna innovación técnica adicional más allá del propio condicionamiento por mirada.

Existe una inconsistencia relevante en la documentación: la *model card* es la plantilla por defecto de LeRobot (incluye literalmente el aviso "_Model type not recognized — please update this template_") y su ejemplo de entrenamiento usa `--policy.type=act`, que corresponde a la política ACT y no necesariamente al tipo `gaze_flow_matching` con el que se generó este checkpoint. Cualquier reproducción debería verificar el campo `policy.type` real en la configuración del checkpoint antes de reentrenar.

## Capacidades

- Control visuomotor de manipulación: genera acciones de robot a partir de imágenes de la escena para ejecutar la tarea de trasladar cubos a cestas.
- Condicionamiento por mirada (*gaze*): incorpora señal de atención/mirada, presumiblemente para focalizar regiones relevantes durante el agarre y el depósito.
- Política de imitación entrenada de extremo a extremo (*end-to-end*): no requiere planificación simbólica ni percepción modular intermedia.
- Integración nativa con LeRobot: carga mediante `--policy.path`, compatible con el bucle de evaluación `lerobot-record`.
- Compatibilidad con robots de bajo coste del ecosistema LeRobot (el ejemplo de la *model card* usa `so100_follower`).
- No soporta *tool calling*, ni *function calling*, ni razonamiento multi-paso simbólico, ni generación de texto, código o matemáticas.
- No tiene capacidades multilingües ni modo *thinking*: no procesa ni produce lenguaje natural.
- No se documentan capacidades de visión general (VQA, *captioning*) ni de audio.

## Casos de uso

- **Automatización de *pick-and-place* en laboratorio**: la política ejecuta la secuencia de agarre de cubos y depósito en cestas directamente desde imágenes de 320x240, adecuada para bancos de pruebas de manipulación con objetos rígidos y posiciones acotadas.
- **Punto de partida para *fine-tuning* en nuevas tareas**: al estar en formato LeRobot y licencia Apache 2.0, puede reentrenarse con `lerobot-train` sobre un *dataset* propio (por ejemplo, `--dataset.repo_id=${HF_USER}/<nuevo_dataset>`) para adaptar la política a otros objetos o contenedores.
- **Evaluación comparativa de políticas de imitación**: sirve como *baseline* de una política de *flow matching* frente a ACT o Diffusion Policy en el mismo *dataset* y mismo robot, midiendo tasa de éxito por episodio con `lerobot-record --episodes=10`.
- **Investigación sobre condicionamiento por mirada**: el modelo permite estudiar si la señal de *gaze* mejora la precisión de agarre frente a políticas puramente visuales, comparando curvas de éxito en la misma tarea.
- **Prototipado en robótica de bajo coste**: su tamaño (75 M de parámetros, 0,3 GB) permite desplegarlo en estaciones de trabajo con una única GPU de consumo junto a un brazo tipo SO-100, sin infraestructura de servidor.
- **Docencia y reproducción de pipelines de IL**: útil como ejemplo completo del ciclo entrenamiento → publicación en el Hub → evaluación en robot real con LeRobot, gracias a que el repositorio incluye los pesos y la referencia al *dataset*.
- **Generación de datos de evaluación**: ejecutar la política de forma repetida permite recolectar episodios etiquetados de éxito/fallo para analizar modos de fallo (deslizamiento de agarre, colisión, mala alineación).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La *model card* no incluye tasas de éxito, número de episodios de evaluación, ni comparaciones cuantitativas con otras políticas sobre el mismo *dataset*.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no documentada. Como referencia de orden de magnitud, 75,2 M de parámetros ocupan aproximadamente 301 MB en FP32 y 150 MB en BF16/FP16; sumando el encoder visual y los *buffers* de inferencia, la huella esperada es de pocos GB (estimación, no dato del autor).
- **GPU recomendadas**: no especificadas por el autor. Por tamaño, cualquier GPU con soporte CUDA moderno es suficiente; no se requiere A100/H100.
- **GPU de consumo**: sí cabe con holgura en RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs de gama de entrada con al menos 4 GB de VRAM (estimación).
- **Opciones de despliegue**: LeRobot sobre PyTorch con CUDA, mediante `lerobot-record` para evaluación en robot y `--policy.path` para cargar el *checkpoint* local o desde el Hub. No aplican vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- **Latencia y throughput**: no disponibles. La frecuencia de control alcanzable depende del *hardware* del robot y del *action chunk* configurado, que no se documenta.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de politica | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fecasado/gfm-cubes-22bN6` | 75.225.802 | *Flow matching* con condicionamiento por mirada (LeRobot) | Imagenes 320x240 + estado del robot | Apache 2.0 | Hugging Face (17 descargas) |
| ACT (Action Chunking Transformer, LeRobot) | No disponible | Transformer con *action chunking* | Depende del *dataset* | No disponible en la informacion proporcionada | Implementado en LeRobot |
| Diffusion Policy | No disponible | Difusion para acciones | Depende del *dataset* | No disponible en la informacion proporcionada | Implementado en LeRobot |
| SmolVLA | No disponible en la informacion proporcionada | VLA (vision-lenguaje-accion) | Entrada visual + instruccion en lenguaje | No disponible en la informacion proporcionada | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas políticas sobre el *dataset* `Ncubes-to-Nbaskets-320x240`, por lo que la comparación anterior es únicamente estructural.

## Limitaciones y advertencias

- **Documentacion incompleta**: la *model card* es la plantilla por defecto de LeRobot, no reconoce el tipo de modelo y no describe arquitectura, datos ni métricas. El comando de ejemplo usa `--policy.type=act`, potencialmente incoherente con el checkpoint publicado.
- **Dominio muy restringido**: entrenado para una tarea concreta (cubos a cestas) con objetos, iluminación y disposición presumiblemente fijos; la generalización a otras escenas, objetos o contenedores no está demostrada.
- **Riesgo de sobreajuste al *setup* de captura**: al operar a 320x240, cambios de cámara, fondo o calibración pueden degradar el rendimiento de forma abrupta.
- **Ausencia de evaluaciones**: no hay tasa de éxito publicada ni validación por terceros; 17 descargas y 0 *likes* implican nula validación comunitaria.
- **Acumulación de error en horizontes largos**: como toda política de imitación, los errores pequeños se propagan y pueden llevar a estados fuera de distribución; no se documenta ningún mecanismo de recuperación.
- **Alucinacion**: el concepto no aplica en el sentido de generación de texto; el modo de fallo equivalente es la ejecución de una trayectoria plausible pero incorrecta (agarre al aire, colisión) sin señal de incertidumbre.
- **Sesgos**: no evaluados. Los sesgos provendrían de la distribución de demostraciones del *dataset* (posiciones, colores y tamaños de cubo representados).
- **Licencia**: Apache 2.0 permite uso comercial y modificaciones con atribución y aviso de cambios; aun así, no se ofrece ninguna garantía sobre el comportamiento del modelo en un robot real.
- **Seguridad fisica**: no se documentan límites de par, paradas de emergencia ni protocolos de validación; el despliegue en *hardware* real debe hacerse con límites de velocidad y espacio de trabajo acotados.
- **Metadatos a verificar**: las fechas de creación y actualización (2026-10-19) son idénticas y deben contrastarse antes de citar el modelo como reciente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-cubes-22bN6
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
