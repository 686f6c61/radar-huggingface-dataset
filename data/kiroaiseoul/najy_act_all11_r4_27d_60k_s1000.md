# kiroaiseoul/NAJY_act_all11_r4_27D_60k_s1000

## Resumen

NAJY_act_all11_r4_27D_60k_s1000 es un checkpoint de política robótica basado en ACT (Action Chunking Transformer) distribuido a través de HuggingFace por el usuario kiroaiseoul, publicado bajo la librería LeRobot y etiquetado dentro del ecosistema trossen-mobile-ai. No es un modelo de lenguaje: es un modelo de aprendizaje por imitación que mapea observaciones multimodales (tres cámaras RGB de 480x640, un vector de estado de 27 dimensiones y un vector de estado de entorno de 11 dimensiones) a un vector de acción de 17 dimensiones. Cuenta con 51.636.369 parámetros reales y un repositorio de 0,2 GB en formato safetensors.

El modelo corresponde al paso 60.000 de la ejecución `exp_all11_tph_env_dropall30_bh_s1000`, entrenada el 7 de octubre de 2026 sobre la máquina identificada como DGX_1. La propia model card indica que el checkpoint se sube con fines de análisis y puntuación, y que su publicación es independiente de la decisión de desplegarlo en un robot real. Se trata, por tanto, de un artefacto de investigación intermedio más que de un modelo listo para producción.

Su relevancia actual es acotada y muy específica: sirve como referencia reproducible para evaluar una política ACT de manipulación móvil de 11 etapas, con semilla y hash de pesos verificables, y para reproducir el pipeline de entrenamiento de LeRobot sobre este conjunto de datos concreto. El número de descargas (13) y de "me gusta" (0) refleja que se trata de un checkpoint de uso interno o experimental, no de un modelo ampliamente adoptado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), transformer encoder-decoder con CVAE, implementado en LeRobot |
| Parametros totales | 51.636.369 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ACT opera sobre una ventana de observacion por chunk de acciones, tamano no especificado en la informacion disponible) |
| Tipos de cuantizacion | no disponible; el repositorio distribuye safetensors (presumiblemente fp32, no confirmado) |
| Idiomas soportados | no aplica (modelo de politica robotica, no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | robotics |
| Biblioteca | lerobot |
| Dimension de observacion de estado | 27 |
| Dimension de estado de entorno | 11 |
| Dimension de accion | 17 |
| Camaras de entrada | 3 (cam_high, cam_left_wrist, cam_right_wrist), 480x640, 3 canales |
| Tamano del repositorio | 0,2 GB |
| Hash sha256 de model.safetensors | 286de8b99d23e937ac98149e3b3b404f37343bffdc8b50ffa074d9075e6530c8 |
| Fecha de creacion | 2026-10-08 |
| Fecha de actualizacion | 2026-10-08 |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) es una política de aprendizaje por imitación introducida para manipulación bimanual de bajo coste. Su formulación estándar combina un autocodificador variacional condicional (CVAE) con un transformer: un codificador procesa las observaciones (imágenes codificadas por backbones convolucionales más el estado propioceptivo) junto con una variable latente z, y un decodificador genera un chunk de acciones futuras en lugar de una única acción por paso. En inferencia, la ruta del codificador CVAE se descarta y se usa la media de la prior. El etiquetado `act` y la librería `lerobot` confirman que se trata de la implementación de ACT de LeRobot. La información disponible no detalla la profundidad del transformer, el número de cabezas, el tamaño del chunk de acciones ni la resolución de los backbones visuales.

El entrenamiento alcanzó el paso 60.000 de la ejecución `exp_all11_tph_env_dropall30_bh_s1000`, cuyo manifiesto de datos es `configs/datasets/all11_tr_hot_tph_env_dropall30_bh.json` y cuyo primer registro de log es `=== launch 2026-10-07T15:13:51+00:00 git 576af09`. El manifiesto activa los indicadores `trim_idle: true`, `pad_hold: true`, `progress: true`, `env_stage_token: true`, `image_dropout: {all: 0.3}` y `boundary_hold: 0.5`. Estos indicadores implican un preprocesado que recorta tramos inactivos, rellena con retención de posición, incorpora una señal de progreso y un token de etapa de entorno (coherente con el vector `observation.environment_state` de 11 dimensiones, correspondiente a una tarea de 11 etapas), aplica un 30 % de dropout sobre todas las imágenes como regularización y establece un `boundary_hold` de 0,5. No se especifica el número total de tokens, episodios ni composición del dataset, ni si se aplicaron etapas de RLHF o DPO (poco habituales en este tipo de políticas).

## Capacidades

- Generación de acciones de manipulación robótica: produce vectores de acción de 17 dimensiones a partir de observaciones visuales y propioceptivas.
- Control multimodal: consume tres flujos de imagen simultáneos (cámara alta y dos cámaras de muñeca), estado de 27 dimensiones y estado de entorno de 11 dimensiones.
- Condicionamiento por etapa de entorno: el indicador `env_stage_token` sugiere que la política está condicionada por la etapa actual dentro de una tarea de 11 fases.
- Predicción por chunks de acción (propia de ACT), lo que reduce la frecuencia efectiva de inferencia respecto a políticas acción-a-acción.
- Aprendizaje por imitación a partir de demostraciones; no se documenta entrenamiento con refuerzo.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión general, audio ni capacidades multilingües.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en el sentido de los agentes basados en lenguaje.
- No se documenta modo "thinking" ni ninguna capacidad cognitiva adicional.

## Casos de uso

- Investigación en aprendizaje por imitación: el checkpoint sirve como punto de partida reproducible para comparar variantes de ACT sobre el mismo dataset, ya que incluye hash verificable y manifiesto de datos.
- Reproducción de experimentos de manipulación móvil de 11 etapas: permite reconstruir el pipeline de LeRobot con el manifiesto `all11_tr_hot_tph_env_dropall30_bh.json` y contrastar resultados con el paso 60.000.
- Evaluación en simulación: dado el trasfondo del proyecto (`trossen-ai-simulation`, `docs/mobile_base_investigation.md` §94), el checkpoint está pensado para diagnóstico y puntuación en entornos simulados antes de considerar despliegue físico.
- Diagnóstico de condicionamiento por etapa: con `env_stage_token` activo, puede usarse para estudiar cómo afecta la señal de etapa del entorno al comportamiento de la política.
- Análisis de robustez visual: el dropout de imagen del 30 % durante el entrenamiento permite estudiar la tolerancia de la política a la pérdida parcial de entradas de cámara.
- Base para ajuste fino en tareas similares: al ser un checkpoint ACT de 51,6 M de parámetros con licencia apache-2.0, puede servir como inicialización para reentrenar sobre demostraciones propias siempre que la morfología del robot y las dimensiones de observación y acción coincidan.
- Docencia y divulgación técnica: por su tamaño reducido y su licencia permisiva, es adecuado para ilustrar el funcionamiento de una política ACT completa en cursos o talleres de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otras políticas. El único dato verificable de integridad es el hash sha256 de `model.safetensors`: `286de8b99d23e937ac98149e3b3b404f37343bffdc8b50ffa074d9075e6530c8`.

## Requisitos de hardware

- Huella de pesos estimada a partir del recuento de parámetros (51.636.369): aproximadamente 207 MB en fp32 y 103 MB en fp16. Estas cifras son cálculos derivados, no datos publicados en la model card.
- Repositorio completo: 0,2 GB, según la metainformación de HuggingFace.
- Al tratarse de una política de 51,6 M de parámetros, cabe con holgura en cualquier GPU de consumo, incluidas gamas de entrada. No se dispone de requisitos oficiales de VRAM publicados.
- Para control en tiempo real con tres flujos de vídeo de 480x640, se recomienda una GPU dedicada con soporte CUDA; una GPU integrada puede resultar insuficiente para mantener la frecuencia de control.
- El pico de memoria real vendrá dominado por las activaciones de los backbones visuales y no por los parámetros, por lo que la VRAM efectiva será superior a la huella de pesos.
- Opciones de despliegue: al ser un modelo LeRobot, el despliegue natural es mediante la librería LeRobot (servidor de políticas e inferencia Torch). No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- La exportación a ONNX o TorchScript para inferencia optimizada no está documentada en la información disponible.
- Latencia y throughput: no disponibles. ACT opera con predicción por chunks, de modo que la frecuencia efectiva de decisión depende del tamaño de chunk, que no se especifica.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este checkpoint ni de sus alternativas en la información proporcionada, por lo que la comparación se limita a características estructurales y de licencia.

| Modelo | Familia | Parametros | Contexto de observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAJY_act_all11_r4_27D_60k_s1000 | ACT (LeRobot) | 51.636.369 | 3 camaras 480x640 + estado 27 + entorno 11 | apache-2.0 | HuggingFace, 13 descargas |
| Otras politicas ACT de LeRobot | ACT (LeRobot) | variable, no disponible | variable segun dataset | habitualmente apache-2.0 o MIT, no disponible por checkpoint | HuggingFace |
| Diffusion Policy (familia) | Politica por difusion | no disponible | tipicamente imagen o estado, variable | MIT (implementacion de referencia), sujeto a confirmacion | Repositorios publicos |
| SmolVLA (familia) | VLA con componente de lenguaje | no disponible | imagen + instruccion en lenguaje natural | no disponible | HuggingFace |

La ventaja diferencial de este checkpoint no es el rendimiento, sino la trazabilidad: hash de pesos publicado, manifiesto de datos identificado y banderas de preprocesado explícitas. Las alternativas basadas en difusión o en modelos visión-lenguaje-acción aportan condicionamiento por instrucciones en lenguaje natural, capacidad de la que este checkpoint carece.

## Limitaciones y advertencias

- Naturaleza experimental: la propia model card indica que el checkpoint se sube con fines de análisis y puntuación, y que su publicación no implica que vaya a ser el candidato elegido para despliegue en el robot real.
- Acoplamiento estricto al dataset y a la morfología: las dimensiones de observación (27 y 11), acción (17) y las tres cámaras de 480x640 están fijadas. Cualquier robot o conjunto de sensores distinto requiere reentrenamiento.
- Especialización de tarea: está entrenado para una tarea concreta de 11 etapas sobre el robot trossen-mobile-ai; no es una política generalista ni transferible sin ajuste.
- Riesgo de alucinación en el sentido de acumulación de error: como toda política de aprendizaje por imitación, puede desviarse hacia estados no vistos durante el entrenamiento y ejecutar acciones fuera de la distribución de las demostraciones.
- Ausencia de métricas publicadas: no hay tasas de éxito, ni curvas de entrenamiento, ni comparaciones con líneas base, lo que impide estimar su fiabilidad real.
- Sesgos potenciales derivados del dataset: no se documenta la composición demográfica, la distribución de escenas ni la cobertura de condiciones de iluminación o variabilidad de objetos, por lo que no puede evaluarse el sesgo de generalización.
- Licencia apache-2.0: permite uso comercial y modificaciones, con obligación de conservar avisos de licencia y atribución. No impone restricciones de uso ético específicas.
- Sin soporte de lenguaje natural: no puede recibir instrucciones en texto ni mantener diálogo; toda la interfaz es observación sensorial y vector de acción.
- Fecha de publicación futura respecto al momento de elaboración de esta ficha, lo que sugiere un artefacto de un ciclo de investigación interno; conviene verificar la existencia de checkpoints posteriores en el mismo repositorio antes de usarlo como referencia.
- Comprobación obligatoria de integridad antes de usar los pesos: ejecutar `sha256sum model.safetensors` y verificar que coincide con el hash publicado. La herramienta de puntuación lee las banderas del fichero `multi_manifest.json` ubicado en la misma carpeta (`--checkpoint <carpeta>`), y la estructura es la de `pretrained_model`, por lo que puede emplearse directamente con utilidades como `stage_cond_diag.py`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiroaiseoul/NAJY_act_all11_r4_27D_60k_s1000
- Repositorio de la libreria LeRobot (implementacion de referencia de ACT): https://github.com/huggingface/lerobot
- Articulo original de ACT, "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware": https://arxiv.org/abs/2304.13705
- Referencia de fondo citada en la model card: `trossen-ai-simulation`, documento `docs/mobile_base_investigation.md` §94 (URL no disponible en la informacion proporcionada)
- Manifiesto de datos citado: `configs/datasets/all11_tr_hot_tph_env_dropall30_bh.json` (URL no disponible)
- Otros enlaces relevantes: no disponible
