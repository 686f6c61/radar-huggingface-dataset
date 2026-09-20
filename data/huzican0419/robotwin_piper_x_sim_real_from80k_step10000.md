# huzican0419/robotwin_piper_x_sim_real_from80k_step10000

## Resumen

Este repositorio contiene un checkpoint de robótica basado en Pi0.5, publicado por el usuario huzican0419 bajo el identificador `huzican0419/robotwin_piper_x_sim_real_from80k_step10000`. Se trata de una conversión a PyTorch en precisión BF16 del checkpoint OpenPI `pi05_piper_sim_real_from80k`, correspondiente al paso global de entrenamiento 10.000 del experimento `robotwin_piper_x_sim_real_from80k`. No es un modelo de lenguaje generalista, sino una política viso-lenguaje-acción (VLA) orientada al control de un robot Piper en entornos simulados y reales.

El modelo parte de un checkpoint anterior de la serie (`robotwin_piper_x_new_sft/80000`) y se ha afinado sobre el conjunto `robotwin_piper_x_sim_real`, compuesto por 8 tareas y 1.180 episodios. La salida no es texto, sino vectores de acción: el modelo está configurado con dimensión de acción 32, horizonte de acción 50 y entrada de estado discreta, y consume tres cámaras (`cam_high`, `cam_left_wrist`, `cam_right_wrist`) junto con prompts de tarea.

Su relevancia es limitada y muy especializada: es un artefacto de investigación reproducible para quien quiera evaluar o continuar el flujo de trabajo de OpenPI con el robot Piper. El repositorio no declara licencia, no incluye estado del optimizador para reanudar el entrenamiento en JAX y no ha registrado descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) construida sobre Pi0.5 dentro del stack OpenPI; el detalle de capas internas no se especifica en la informacion disponible |
| Parametros totales | 3.616.757.520 (aproximadamente 3,6 mil millones) |
| Parametros activos | No aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (unico formato publicado); no se han publicado variantes GGUF, INT8 ni INT4 |
| Idiomas soportados | no disponible; las tareas se especifican mediante prompts de tarea en texto |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), acompanado de `config.json`, `conversion_info.json` y `norm_stats.json` |
| Dimension de accion | 32 |
| Horizonte de accion | 50 |
| Camaras de entrada | `cam_high`, `cam_left_wrist`, `cam_right_wrist` |
| Estado y acciones | Estado y acciones de 14 dimensiones; acciones delta de articulaciones con pinzas absolutas |
| Paso de entrenamiento | 10.000 (global) |

## Arquitectura y entrenamiento

El modelo es una política viso-lenguaje-acción derivada de Pi0.5, exportada desde el ecosistema OpenPI mediante el script `examples/convert_jax_model_to_pytorch.py` con la configuración `pi05_piper_sim_real_from80k` y precisión BF16. La conversión transforma los pesos originales de JAX a PyTorch; el resultado es un único `model.safetensors` de inferencia, sin estado del optimizador, por lo que no permite reanudar el entrenamiento original en JAX. El modelo consume tres flujos de cámara, un estado discreto y un prompt de tarea, y produce fragmentos de acción (action chunks) de horizonte 50.

El entrenamiento se inicializó desde los parámetros de `checkpoints/pi05_piper_new/robotwin_piper_x_new_sft/80000/params` y utilizó el conjunto `robotwin_piper_x_sim_real`, con 8 tareas y 1.180 episodios. Se empleó un scheduler de learning rate coseno con 500 pasos de warmup, pico de `1e-5` y decaimiento a lo largo de 10.000 pasos hasta `1e-6`. El preprocesado incluye estado y acciones de 14 dimensiones, acciones delta de articulaciones con pinzas absolutas, `adapt_to_pi=False`, prompts de tarea y normalización por cuantiles. Las estadísticas de normalización se reutilizaron del asset `pi05_piper_new/robotwin_piper_x_20_tasks_lerobot_v21_new`, dato importante porque cualquier evaluación debe usar exactamente esas estadísticas para que las predicciones sean coherentes.

## Capacidades

- Manipulación robótica visomotora: genera secuencias de acciones de 50 pasos a partir de observaciones de tres cámaras, estado y un prompt de tarea.
- Condicionamiento por lenguaje: acepta prompts de tarea en texto para seleccionar la habilidad a ejecutar entre las 8 tareas del conjunto de entrenamiento.
- Control conjunto: produce acciones delta de articulaciones con control absoluto de pinzas.
- Aprendizaje sim-a-real: el nombre del experimento indica entrenamiento conjunto con datos de simulación y de robot real.
- Fusión multimodal de cámaras: integra una vista general y dos vistas de muneca para la estimación espacial.
- No dispone de tool calling, function calling, agentes multi-paso ni razonamiento simbólico; no es un modelo conversacional.
- Capacidades multilingües: no disponible; no se documenta comportamiento lingüístico fuera de los prompts de tarea.
- No se documentan modos especiales (thinking, visión general, audio) más allá de la percepción visual necesaria para el control.

## Casos de uso

- Investigación en políticas VLA: reproducir el flujo de OpenPI cargando el `config.json` y las estadísticas de normalización incluidas para comparar el comportamiento del paso 10.000 frente a otros checkpoints de la misma serie.
- Evaluación sim-a-real en laboratorio: ejecutar la política sobre el robot Piper en simulación y en hardware real usando el mismo preprocesado (14 dimensiones, acciones delta, pinzas absolutas) para medir la transferencia entre dominios.
- Benchmark interno de manipulación: usar las 8 tareas de `robotwin_piper_x_sim_real` como conjunto de evaluación para medir tasas de éxito por tarea y detectar degradación respecto al checkpoint de 80.000 pasos.
- Reentrenamiento o ajuste fino posterior: al ser un export BF16 compatible con la implementación PyTorch de OpenPI, sirve como punto de partida para SFT sobre nuevos conjuntos de episodios, teniendo en cuenta que no incluye estado del optimizador.
- Recolección de datos guiada: desplegar la política como asistente de teleoperación para generar episodios adicionales en las mismas 8 tareas y ampliar el dataset.
- Docencia y divulgación en robótica: ilustrar el pipeline completo de un VLA (cámaras, estado, prompt, normalización por cuantiles, salida de acciones) con un checkpoint de tamano medio (3,6 mil millones de parámetros) que cabe en una GPU de gama alta de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de manipulación ni comparaciones cuantitativas con otros checkpoints de la misma serie.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 7,2 GB para los 3.616.757.520 parámetros, coherente con el tamano del repositorio (7,2 GB).
- VRAM estimada para inferencia: del orden de 10 a 16 GB contando pesos, activaciones, codificador visual y tres flujos de imagen; cifra orientativa, no confirmada en la informacion disponible.
- GPU profesionales: A100 (40/80 GB) y H100 son adecuadas y sobradas para inferencia en BF16.
- GPU de consumo: una RTX 4090 (24 GB) debería alojar el modelo con holgura; una RTX 3090 (24 GB) es también candidata. En tarjetas de 12-16 GB la viabilidad depende del uso de precisión reducida y del tamano del lote, extremo no documentado.
- Opciones de despliegue: implementación PyTorch de OpenPI con la configuración `pi05_piper_sim_real_from80k` y los assets de normalización incluidos. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, que están orientados a modelos de lenguaje y no a políticas de acción continua.
- Latencia y throughput: no disponibles. En control robótico la latencia por fragmento de acción es un factor crítico y no se han publicado mediciones.

## Comparativa con modelos similares

La busqueda web realizada no devolvio informacion relevante sobre modelos comparables, por lo que los datos de las alternativas no estan verificados en la informacion proporcionada.

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huzican0419/robotwin_piper_x_sim_real_from80k_step10000` | VLA para robot Piper | 3,6 mil millones | no disponible | no disponible | Hugging Face |
| OpenVLA | VLA generico | no disponible en la informacion proporcionada | no disponible | no disponible | no verificado |
| Pi0 / Pi0.5 (OpenPI) | VLA de proposito general | no disponible en la informacion proporcionada | no disponible | no disponible | no verificado |
| NVIDIA GR00T N1 | VLA / robotica humanoide | no disponible en la informacion proporcionada | no disponible | no disponible | no verificado |

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin terminos explicitos, no hay autorizacion clara para uso comercial ni para redistribucion; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Especializacion extrema: entrenado sobre 8 tareas y 1.180 episodios de un unico robot (Piper), por lo que se espera una generalizacion muy limitada fuera de esa morfologia y ese conjunto de tareas.
- Dependencia de las estadisticas de normalizacion: usar estadisticas distintas a las incluidas en `assets/robotwin_piper_x_20_tasks_lerobot_v21_new/norm_stats.json` invalida las predicciones.
- Sin estado del optimizador: el export no permite reanudar el entrenamiento en JAX tal cual; solo sirve para inferencia o para un ajuste nuevo.
- Riesgo de alucinacion motora: como toda politica aprendida por imitacion, puede generar trayectorias plausibles pero fisicamente invalidas ante observaciones fuera de distribucion; requiere limites de seguridad en el controlador.
- Sesgos: no documentados, pero cabe esperar sesgo hacia las condiciones de iluminacion, posiciones de camara y objetos presentes en el dataset de entrenamiento.
- Idioma: no se documenta soporte multilingue ni evaluacion de prompts fuera del ingles tecnico habitual en este tipo de tareas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento, tasa de exito ni comparacion con el checkpoint de partida de 80.000 pasos.
- Fecha de creacion registrada como 2026-09-20, posterior a la actualizacion del mismo dia; conviene verificar la procedencia del artefacto antes de confiar en el.
- Cero descargas y cero likes: el checkpoint no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huzican0419/robotwin_piper_x_sim_real_from80k_step10000
- Implementacion OpenPI referenciada en la model card: https://github.com/Physical-Intelligence/openpi (no verificado en la busqueda web disponible)
- Resultados de la busqueda web: sin informacion relevante sobre este modelo; los resultados devueltos trataban sobre el Explorador de archivos de Windows y no guardan relacion con el artefacto.
