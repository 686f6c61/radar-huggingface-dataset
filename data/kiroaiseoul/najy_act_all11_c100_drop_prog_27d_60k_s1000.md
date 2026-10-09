# kiroaiseoul/NAJY_act_all11_c100_drop_prog_27D_60k_s1000

## Resumen

NAJY_act_all11_c100_drop_prog_27D_60k_s1000 es un checkpoint de política robótica basada en ACT (Action Chunking with Transformers), entrenado y publicado por el usuario kiroaiseoul dentro del ecosistema LeRobot. No es un modelo de lenguaje: es un modelo de imitación que transforma observaciones sensoriales en comandos motores. Concretamente, recibe un vector de estado de 27 dimensiones y tres imágenes RGB de 480x640 (cámara alta, muñeca izquierda y muñeca derecha), y produce un vector de acción de 17 dimensiones, lo que apunta a una plataforma de manipulación móvil.

El modelo tiene 51.701.393 parámetros (unos 51,7 millones) y se distribuye en formato safetensors bajo licencia Apache 2.0, con un repositorio de apenas 0,2 GB. El nombre del checkpoint codifica su origen: la ejecución `exp_all11_c100_drop_prog_long_s1000`, detenida en el paso 60.000, sobre el manifiesto de datos `all11_tr_hot_dropall30_prog.json` y con un `image_dropout` del 30%. La propia model card indica que la subida tiene fines de análisis y puntuación, y que no equivale a una confirmación del checkpoint como candidato de despliegue en robot real.

Su relevancia es acotada pero clara para quien trabaja en aprendizaje por imitación: sirve como artefacto reproducible y verificable (incluye el hash SHA-256 del fichero de pesos y las banderas del manifiesto para herramientas de diagnóstico) en el contexto de la investigación sobre base móvil del proyecto trossen-ai-simulation. Al mismo tiempo, el repositorio acumula cero descargas y cero "likes", y no hay ningún dato de rendimiento publicado, por lo que debe tratarse como un artefacto de investigación sin validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), según las etiquetas `lerobot` y `act`; el detalle interno de capas no se especifica en la model card |
| Parámetros totales | 51.701.393 (~51,7 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica como contexto de lenguaje; la card no declara horizonte de observación ni longitud del *chunk* de acción) |
| Tipos de cuantización | no disponible (el repositorio solo incluye safetensors) |
| Idiomas soportados | no disponible (modelo de control robótico; no expone interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entradas | `observation.state` (27), `observation.images.cam_high` (3x480x640), `observation.images.cam_left_wrist` (3x480x640), `observation.images.cam_right_wrist` (3x480x640) |
| Salidas | `action` (17) |
| Ejecución de entrenamiento | `exp_all11_c100_drop_prog_long_s1000`, paso 60.000 |
| Manifiesto de datos | `configs/datasets/all11_tr_hot_dropall30_prog.json` |
| Banderas del manifiesto | `{"progress": true, "image_dropout": {"all": 0.3}}` |
| Hash SHA-256 de `model.safetensors` | `4f65f12107ff256b4a7ea8ecd8a56be96f107ec3e718d52bf95bd4cccc1555c6` |
| Tamaño del repositorio | 0,2 GB |
| Fecha de creación registrada | 2026-10-08T19:31:41Z |

## Arquitectura y entrenamiento

La etiqueta `act` y la librería `lerobot` identifican el modelo como una implementación de Action Chunking with Transformers, el método de aprendizaje por imitación que predice bloques (*chunks*) de acciones futuras en lugar de un único paso de control, reduciendo el error compuesto típico de las políticas paso a paso. La configuración concreta de codificador visual, transformer y módulo CVAE no se detalla en la model card, por lo que no puede confirmarse desde la información disponible.

Los datos de entrenamiento se describen únicamente a través del manifiesto `all11_tr_hot_dropall30_prog.json` y de la ejecución `exp_all11_c100_drop_prog_long_s1000`, que alcanzó 60.000 pasos. El log de lanzamiento registra la marca temporal `2026-10-08T12:55:43+00:00` y el commit `6986f73` del código de entrenamiento. Dos elementos destacan en las banderas del manifiesto: la bandera `progress: true` (que la herramienta de puntuación lee para la evaluación por etapas) y `image_dropout: {"all": 0.3}`, es decir, un 30% de descarte aleatorio aplicado a todas las vistas de cámara durante el entrenamiento. Esta segunda técnica actúa como regularización: fuerza a la política a no depender de una única cámara y mejora la tolerancia a oclusiones o fallos de sensor. No se indica el número de episodios ni de transiciones, la composición del dataset, ni si hubo etapas de ajuste posteriores (RLHF o DPO no aplican a este tipo de política).

La model card menciona que la carpeta conserva la estructura de `pretrained_model` y que las banderas se leen desde un `multi_manifest.json` alojado en la misma carpeta, de modo que el checkpoint puede pasarse directamente a herramientas como `stage_cond_diag.py` mediante el argumento `--checkpoint`. El contexto de este trabajo se sitúa en `docs/mobile_base_investigation.md`, sección 94, del proyecto trossen-ai-simulation.

## Capacidades

- Generación de comandos motores: produce vectores de acción de 17 dimensiones a partir de estado proprioceptivo y percepción visual, adecuados para una plataforma de manipulación móvil.
- Percepción multivista: consume tres flujos RGB simultáneos de 480x640 (vista alta y dos muñecas), lo que permite razonamiento espacial sobre el objeto manipulado y el entorno.
- Predicción por bloques de acción (*action chunking*): genera secuencias de acciones en lugar de comandos aislados, lo que reduce la acumulación de error y la frecuencia de inferencia necesaria.
- Robustez a pérdida de cámara: el entrenamiento con un 30% de `image_dropout` sobre todas las vistas busca mantener el comportamiento cuando una o varias cámaras quedan ocluidas o fallan.
- Condicionamiento por progreso: la bandera `progress: true` sugiere que el modelo incorpora señal de progreso de la tarea, aunque el mecanismo exacto no se documenta.
- Integración con LeRobot: compatible con el flujo de trabajo estándar de la librería (carga como `pretrained_model`, evaluación y fine-tuning).
- No soporta *tool calling* ni *function calling*: no es un modelo de lenguaje ni expone interfaz de herramientas.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM: su "razonamiento" es puramente sensorimotor.
- Capacidades multilingües: no aplica; el modelo no procesa ni genera texto.
- Capacidad especial: verificación de integridad mediante hash SHA-256 publicado y herramientas de diagnóstico por etapa (`stage_cond_diag.py`).

## Casos de uso

- Manipulación móvil en laboratorio: el modelo controla un robot con base móvil y brazo(s) generando 17 grados de acción a partir de tres cámaras y un estado de 27 dimensiones, lo que encaja con plataformas tipo Trossen Mobile AI.
- Punto de partida para *fine-tuning*: al ser un checkpoint ACT de 51,7 M de parámetros bajo Apache 2.0, puede reentrenarse sobre demostraciones propias con recursos modestos y servir de base para tareas nuevas.
- Evaluación comparativa de checkpoints: la card está pensada explícitamente para análisis y puntuación, de modo que el modelo se usa como artefacto de referencia frente a otros pasos de la misma ejecución de entrenamiento.
- Diagnóstico de condicionamiento por etapa: la bandera `progress` y la estructura `pretrained_model` permiten alimentar `stage_cond_diag.py` y analizar si la política distingue fases de la tarea.
- Estudio de robustez ante fallos de sensor: el `image_dropout` del 30% lo convierte en una pieza útil para medir cuánto degrade la política cuando se anulan cámaras en inferencia.
- Investigación en simulación: la referencia a `mobile_base_investigation.md` en trossen-ai-simulation indica su uso dentro de pipelines de evaluación de navegación y manipulación con base móvil.
- Reproducibilidad de experimentos: el hash del fichero de pesos y los metadatos del log permiten reconstruir exactamente qué artefacto se evaluó en cada comparación.
- Docencia y prototipado en aprendizaje por imitación: un modelo ACT pequeño y de licencia permisiva es un ejemplo práctico para cursos o talleres de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos cuantitativos registrados son metadatos de entrenamiento, que no constituyen una evaluación de rendimiento:

| Metadato de entrenamiento | Valor |
|---|---|
| Paso alcanzado | 60.000 |
| Ejecución | `exp_all11_c100_drop_prog_long_s1000` |
| Manifiesto de datos | `configs/datasets/all11_tr_hot_dropall30_prog.json` |
| Commit de código | `6986f73` |
| Marca temporal de lanzamiento | 2026-10-08T12:55:43+00:00 |
| Image dropout aplicado | 0,3 sobre todas las vistas |
| Tasa de éxito en tarea | no disponible |
| Métricas de imitación (MSE, L1) | no disponible |

## Requisitos de hardware

- VRAM estimada: con 51,7 M de parámetros, el peso en fp32 ocupa aproximadamente 207 MB y en fp16/bf16 unos 103 MB. Sumando activaciones de tres flujos de imagen de 480x640, la inferencia cabe cómodamente por debajo de 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna sirve; no se requiere A100 ni H100. Una RTX 3060, RTX 4060, RTX 4090 o similar es más que suficiente. Para despliegue embebido, una NVIDIA Jetson Orin es una opción razonable.
- GPU de consumo: sí, cabe en cualquier GPU de consumo actual e incluso en iGPU con memoria compartida si se acepta latencia mayor.
- CPU: la inferencia en CPU es viable para frecuencias de control bajas, dado el reducido número de parámetros.
- Opciones de despliegue: librería LeRobot sobre PyTorch como vía principal. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que no se trata de un modelo de lenguaje.
- Latencia y throughput: no disponible. La frecuencia de control alcanzable depende del *chunk* de acciones, del *hardware* y de la resolución de entrada, y no se documenta en la información proporcionada.
- Almacenamiento: el repositorio completo ocupa 0,2 GB, por lo que no plantea requisitos de disco apreciables.

## Comparativa con modelos similares

La información proporcionada no incluye datos de rendimiento ni de configuración de otros modelos, por lo que la comparación se limita a categorías de referencia y a los campos que pueden afirmarse sin ambigüedad.

| Modelo | Categoría | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAJY_act_all11_c100_drop_prog_27D_60k_s1000 | ACT (aprendizaje por imitación) | 51,7 M | no aplica | Apache 2.0 | HuggingFace, autor kiroaiseoul |
| Implementación ACT de referencia en LeRobot | ACT | no disponible | no aplica | no disponible en la información proporcionada | ecosistema LeRobot |
| Políticas de difusión (*diffusion policy*) | aprendizaje por imitación generativo | no disponible | no aplica | no disponible | no disponible |
| Modelos VLA de gran escala (por ejemplo, familias tipo SmolVLA o pi0) | visión-lenguaje-acción | no disponible | no disponible | no disponible | no disponible |

Comparativa de rendimiento entre estos modelos: no disponible. No se han publicado métricas de tasa de éxito ni de error de imitación para este checkpoint.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni respuestas conversacionales, y no admite *prompting* en lenguaje natural.
- Estado de validación nulo: cero descargas y cero "likes" en el momento del registro; no hay evaluación por terceros ni resultados publicados.
- La propia model card advierte que la subida es para análisis y puntuación, y que no equivale a confirmar el checkpoint como candidato de despliegue en robot real.
- Interfaces rígidas: el modelo espera exactamente un estado de 27 dimensiones, tres cámaras a 480x640 y produce 17 dimensiones de acción. Cualquier cambio de robot, número de cámaras, resolución o espacio de acciones invalida el checkpoint sin reentrenamiento.
- Sesgos de dataset: al tratarse de aprendizaje por imitación a partir de demostraciones humanas, hereda las condiciones de recogida (iluminación, disposición de objetos, posiciones iniciales). La composición del dataset no está documentada, por lo que no puede auditarse la diversidad de escenarios.
- Riesgo de sobreajuste al entorno de entrenamiento y de degradación fuera de la distribución; el `image_dropout` mitiga fallos de sensor, pero no la falta de variedad en las demostraciones.
- Riesgo de alucinación en el sentido clásico: no aplica. El riesgo equivalente es la ejecución de acciones incorrectas con confianza alta, con consecuencias físicas sobre el robot y su entorno.
- Contexto e idioma: no aplica ventana de contexto lingüística; la model card está redactada en coreano y no hay documentación en castellano ni en inglés.
- Licencia: los pesos se publican bajo Apache 2.0, lo que permite uso comercial. Sin embargo, no se especifica la licencia del dataset de demostraciones subyacente, lo que puede condicionar el uso comercial derivado.
- Fecha de creación registrada atípica (2026-10-08): conviene verificar la coherencia temporal del artefacto antes de integrarlo en cualquier flujo de trabajo.
- Verificación obligatoria: debe comprobarse con `sha256sum model.safetensors` que el hash coincide con `4f65f12107ff256b4a7ea8ecd8a56be96f107ec3e718d52bf95bd4cccc1555c6` antes de evaluar o desplegar.
- Dependencia de código externo: las herramientas de puntuación (`multi_manifest.json`, `stage_cond_diag.py`) pertenecen al proyecto trossen-ai-simulation y no se distribuyen con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_drop_prog_27D_60k_s1000
- Referencia metodológica de ACT, no procedente de la búsqueda web: *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware*, Zhao et al., https://arxiv.org/abs/2304.13705
- Repositorio de la librería LeRobot, no procedente de la búsqueda web: https://github.com/huggingface/lerobot
- Documentación de contexto citada en la model card (`trossen-ai-simulation`, `docs/mobile_base_investigation.md`, sección 94): no se proporciona URL en la información disponible.
- Enlaces obtenidos de la búsqueda web: ninguno relevante. Los resultados devueltos corresponden a sitios de contenido para adultos sin relación alguna con el modelo, por lo que se descartan por completo.
