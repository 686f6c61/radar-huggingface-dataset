# kiroaiseoul/NAJY_act_task02_c100_gist30_soloall_reef_16D_60k_s1000

## Resumen

NAJY_act_task02_c100_gist30_soloall_reef_16D_60k_s1000 es un checkpoint de política robótica basado en ACT (Action Chunking with Transformers) publicado en HuggingFace por el usuario kiroaiseoul dentro del ecosistema LeRobot. No es un modelo de lenguaje: es una política de imitación entrenada para controlar un robot a partir de observaciones multimodales (estado proprioceptivo de 16 dimensiones y tres cámaras de 480x640) y producir acciones de 16 dimensiones. El checkpoint corresponde al paso 60.000 del run `t55_task02_c100_gist30_soloall_reef_120k_s1000`, entrenado según la model card en una máquina DGX (identificada como "DGX_1").

El modelo tiene 51.689.104 parámetros (unos 51,7 millones) y se distribuye en safetensors con un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la liga de las políticas ligeras aptas para inferencia en hardware modesto. La model card indica explícitamente que la subida tiene fines de análisis y puntuación ("분석·채점용 업로드"), es decir, que se trata de un artefacto de evaluación intermedia y no de un candidato confirmado para despliegue real. Está asociado a la plataforma Trossen Mobile AI y a la investigación documentada en `trossen-ai-simulation`, en el apartado `docs/mobile_base_investigation.md` §94.

Su relevancia es acotada y muy específica: sirve como referencia reproducible (incluye el sha256 del fichero de pesos y un manifiesto de evaluación) para quien trabaje con políticas ACT en LeRobot, concretamente en tareas de manipulación sobre base móvil. No aporta capacidades de lenguaje, visión general o razonamiento simbólico; su utilidad se limita al control motor aprendido por imitación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación transformer con codificación visual y decodificación de chunks de acción |
| Parametros totales | 51.689.104 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible; no aplica en el sentido de LLM (el equivalente es el horizonte de acción por chunks y la ventana de observación, no documentados) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible; no es un modelo de lenguaje, no procesa texto |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, sha256 `d386464a811ac8cfaa0838d9c1b94506f60ccfa59975bcbd220d6a1edaf86b56`) |

Especificaciones de entrada y salida declaradas en la model card:

| Campo | Forma / tipo |
|---|---|
| `observation.state` | [16] |
| `observation.images.cam_high` | [3, 480, 640] |
| `observation.images.cam_left_wrist` | [3, 480, 640] |
| `observation.images.cam_right_wrist` | [3, 480, 640] |
| `action` | [16] |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una política de imitación que combina un codificador visual por cámara con un transformer que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación y suaviza el comportamiento en tareas de manipulación fina. En este checkpoint concreto, la política consume tres flujos de imagen de 480x640 píxeles (cámara cenital y dos cámaras de muñeca, izquierda y derecha) más un vector de estado de 16 dimensiones, y emite un vector de acción también de 16 dimensiones. El número de parámetros (51,7 M) es coherente con una configuración ACT de tamaño moderado, con el grueso del cómputo en los codificadores visuales compartidos o independientes y el transformer de acciones.

El entrenamiento se realizó por imitación supervisada sobre un dataset de demostraciones del run `t55_task02_c100_gist30_soloall_reef_120k_s1000`, en una DGX, y el checkpoint publicado corresponde al paso 60.000 de un total de 120.000. No se documentan en la información disponible el número de episodios, el número de tokens o frames, la composición del dataset, ni si hubo etapas de refinamiento tipo RLHF/DPO (no aplicables habitualmente a políticas de imitación). Tampoco se especifican innovaciones adicionales como decodificación especulativa, atención lineal o técnicas de destilación. El nombre del run sugiere variantes de configuración (sufijos `c100`, `gist30`, `soloall`, `reef`, `16D`, `s1000`) cuyo significado exacto no está explicado en la model card.

## Capacidades

- Generación de acciones de control motor de 16 dimensiones para un robot manipulador con base móvil, a partir de observaciones visuales y proprioceptivas.
- Fusión de tres vistas de cámara simultáneas (cenital y dos muñecas), lo que permite razonamiento espacial sobre la escena y sobre la propia pinza.
- Ejecución de una tarea concreta de manipulación (`task02`), aprendida por imitación a partir de demostraciones humanas o teleoperadas.
- Predicción por chunks de acción, lo que aporta suavidad temporal y robustez frente a pequeñas perturbaciones.
- Integración nativa con LeRobot: el repositorio sigue la estructura `pretrained_model`, por lo que puede cargarse directamente en los scripts del ecosistema (por ejemplo, herramientas de diagnóstico como `stage_cond_diag.py`).
- Soporte de verificación de integridad mediante sha256 del fichero de pesos y lectura de flags de evaluación desde `multi_manifest.json`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, código ni procesamiento de lenguaje natural.

## Casos de uso

- Evaluación de checkpoints en pipelines de investigación: el repositorio está pensado para herramientas de puntuación que leen `multi_manifest.json` y verifican el sha256; se usaría como entrada en un harness de evaluación comparativa de políticas ACT.
- Reproducción de resultados en simulación: al conservar la estructura `pretrained_model` de LeRobot, puede cargarse directamente sobre el entorno `trossen-ai-simulation` para reproducir el comportamiento del paso 60.000 antes de plantear un despliegue físico.
- Punto de partida para fine-tuning en una tarea nueva: con 51,7 M de parámetros, el ajuste sobre un dataset propio de demostraciones es viable en una sola GPU consumer, lo que permite reutilizar los codificadores visuales ya entrenados.
- Baseline en comparaciones de arquitecturas de imitación: sirve como referencia ACT frente a políticas alternativas (Diffusion Policy, VLA ligeras) en la misma tarea y con las mismas entradas de 16 dimensiones y tres cámaras.
- Depuración de pipelines de datos robóticos: la disparidad entre el nombre del run (120k pasos) y el checkpoint (60.000) y la presencia de un manifiesto de flags lo hacen útil para validar herramientas de trazabilidad y control de versiones de datasets.
- Inferencia en hardware de borde: por tamaño de pesos (del orden de 200 MB en fp32), es candidato a ejecutarse en la computadora embebida del robot o en una GPU de gama media, sin depender de infraestructura en la nube.
- Docencia y divulgación técnica: ejemplo compacto y real de política ACT con múltiples cámaras y espacio de acción de 16 dimensiones para explicar imitación aprendida en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye el identificador del run, el paso del checkpoint, las formas de entrada y salida y el sha256 de los pesos; no hay tasas de éxito por tarea, métricas de error de acción ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 2 GB solo para pesos (51,7 M de parámetros equivalen a unos 207 MB en fp32 y unos 104 MB en fp16); el consumo real es mayor por las activaciones de tres cámaras a 480x640, y no está cuantificado en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente en la práctica; una RTX 3060, RTX 4060 Ti o RTX 4090 cubren el caso de inferencia y también el de fine-tuning ligero. No se documentan requisitos oficiales.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño del modelo; también es plausible la inferencia en CPU, aunque la latencia no está documentada.
- Opciones de despliegue: scripts de LeRobot sobre PyTorch como vía principal; No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, que además no son adecuadas para una política de control motor.
- Latencia y throughput: no disponibles. Al ser una política de control, el requisito crítico es la frecuencia de control del robot, que no se especifica en la información proporcionada.
- Almacenamiento: repositorio de 0,2 GB, trivial para cualquier equipo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAJY_act_task02_..._60k_s1000 (este) | 51.689.104 | no disponible | Manipulación `task02`, 16D estado/acción, 3 cámaras | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| ACT original (Action Chunking with Transformers) | no disponible en la informacion | no disponible | Manipulación bimanual de propósito general | investigación (consultar) | Repositorio académico |
| Diffusion Policy | no disponible en la informacion | no disponible | Manipulación por difusión de acciones | investigación (consultar) | Repositorio académico |
| Políticas VLA ligeras del ecosistema LeRobot (por ejemplo, SmolVLA) | no disponible en la informacion (referencia pública habitual: cientos de millones) | no disponible | Manipulación con instrucciones en lenguaje | apache-2.0 en algunos casos (verificar) | HuggingFace |

La comparación relevante es arquitectónica: este checkpoint es una ACT especializada en una sola tarea, sin entrada de lenguaje, mientras que las VLA del mismo ecosistema aceptan instrucciones en texto a cambio de un tamaño muy superior. No se dispone de métricas comunes que permitan comparar rendimiento entre ellas.

## Limitaciones y advertencias

- Especialización extrema: el checkpoint está entrenado para `task02`; no generaliza a otras tareas sin fine-tuning.
- No es un modelo de lenguaje ni un VLA: no acepta instrucciones en texto, no razona simbólicamente y no puede usarse para diálogo, código o análisis documental.
- Dependencia de la configuración exacta de sensores: requiere tres cámaras a 480x640 en los nombres `cam_high`, `cam_left_wrist` y `cam_right_wrist`, y un vector de estado de 16 dimensiones. Cualquier cambio de calibración, resolución o montaje invalida el comportamiento aprendido.
- Riesgo de fallo silencioso por desviación de distribución: como toda política de imitación, ante escenas, iluminación u objetos no vistos puede generar acciones erráticas sin señal de error explícita; no hay mecanismo de abstención documentado.
- Estado de validación incierto: la propia model card indica que la subida es para análisis y puntuación, y que no confirma un candidato de despliegue real. El modelo tiene 0 descargas y 0 likes, sin evidencia externa de uso.
- Trazabilidad incompleta: el campo "primera línea del log de entrenamiento" aparece como `?`, los flags del manifiesto están vacíos (`{}`) y no se documentan dataset, número de episodios ni métricas, lo que dificulta la reproducibilidad.
- Ausencia de benchmarks: no se puede afirmar ningún nivel de rendimiento en tareas reales con los datos disponibles.
- Licencia apache-2.0: permisiva para uso comercial, pero el titular no ofrece garantías; conviene verificar además las condiciones de los datos de demostración originales y del simulador asociado, que no se detallan.
- Documentación únicamente en coreano: esto puede dificultar la adopción por parte de equipos que no lean ese idioma.
- Fecha de creación declarada (2026-10-20): conviene comprobar la coherencia temporal del repositorio antes de integrarlo en un pipeline de producción.

## Enlaces

- HuggingFace: https://huggingface.co/kiroaiseoul/NAJY_act_task02_c100_gist30_soloall_reef_16D_60k_s1000
- Referencia citada en la model card, sin URL verificable en la información disponible: `trossen-ai-simulation`, documento `docs/mobile_base_investigation.md` §94
- Referencia citada en la model card, sin URL verificable: herramienta de diagnóstico `stage_cond_diag.py` y fichero `multi_manifest.json` (incluidos en el ecosistema de evaluación del autor)
- No se han encontrado otros enlaces relevantes en la búsqueda web; los resultados devueltos por la búsqueda no guardan relación con este modelo y se han descartado.
