# Dongkkka/evo1_dashboard_0904_stage2_6k_16bs

## Resumen

Evo1 Stage 2 — step 6000, batch 16 es un checkpoint intermedio de un entrenamiento en curso de un modelo de robótica (Vision-Language-Action) desarrollado por el usuario Dongkkka y publicado en HuggingFace bajo la librería LeRobot. Se trata de una instantánea de la Stage 2 del entrenamiento, inicializada a partir de un checkpoint previo de Stage 1 (paso 4000) y con 6000 actualizaciones adicionales de Stage 2. El modelo tiene 747.976.832 parámetros (~748 M) y ocupa 1,7 GB en el repositorio.

El modelo sigue la clase de política `Evo1Policy` de LeRobot y está diseñado para control robótico a partir de tres cámaras de entrada, con un espacio de acciones de 22 dimensiones y un horizonte de predicción (*chunk*) de 16 pasos. Tanto el backbone de visión y lenguaje como la cabeza de acciones son entrenables, lo que lo sitúa en la categoría de modelos VLA (Vision-Language-Action) orientados a manipulación.

Su relevancia ahora es limitada y muy específica: es un snapshot de investigación, no un modelo final ni validado. No tiene descargas ni likes, no declara licencia ni idiomas, y no publica métricas. Su interés principal es para quien quiera reproducir o continuar el pipeline de entrenamiento con LeRobot sobre el dataset `Dongkkka/cyclo_dashboard_0904_test_v30`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política VLA `Evo1Policy` (LeRobot): backbone de visión y lenguaje + cabeza de acciones; detalles internos no disponibles |
| Parámetros totales | 747.976.832 (~748 M) |
| Parámetros activos | No procede / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; precisión no especificada) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | robotics |
| Cámaras de entrada | 3 |
| Dimensión de acciones | 22D |
| Horizonte de acción (chunk) | 16 |
| Checkpoint | Stage 2, paso 6000, batch 16 (inicializado desde Stage 1 paso 4000) |
| Dataset de entrenamiento | `Dongkkka/cyclo_dashboard_0904_test_v30` (episodios 0–23 entrenamiento, 24–27 reservados) |
| Framework | LeRobot (PyTorch) |
| Tamaño del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

La model card describe el modelo como una política de robótica nativa de LeRobot con un backbone de visión y lenguaje más una cabeza de acciones, ambos entrenables. El entrenamiento sigue un esquema en dos etapas: la Stage 1 alcanzó el paso 4000 y este checkpoint corresponde a 6000 actualizaciones adicionales de Stage 2 con batch size 16, lo que equivale a aproximadamente 96.000 muestras procesadas en esta fase (cálculo derivado de los datos declarados). No se especifica el número total de tokens, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO; tampoco se detalla si hay decodificación especulativa, atención lineal u otra innovación técnica.

Los datos de entrenamiento provienen del dataset `cyclo_dashboard_0904_test_v30`, con los episodios 0–23 en entrenamiento y los episodios 24–27 reservados para validación (4 episodios). El uso previsto es cargar el checkpoint con la clase estándar `Evo1Policy` de LeRobot junto con los preprocesadores y posprocesadores guardados. No hay información pública sobre la arquitectura interna del backbone (número de capas, tipo de atención, resolución de imagen o tokenizador de acciones).

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (chunks de 16 pasos) a partir de observaciones visuales.
- Percepción multi-cámara: procesa tres flujos de imagen simultáneos como entrada.
- Espacio de acción de 22 dimensiones, compatible con tareas de manipulación de brazo y pinza (la semántica exacta de cada dimensión no está documentada).
- Acondicionamiento por lenguaje: el modelo declara un backbone de visión y lenguaje, aunque no se detalla el formato de las instrucciones ni los idiomas soportados.
- Integración con el ecosistema LeRobot mediante `Evo1Policy` y los pre/post procesadores guardados en el repositorio.
- Soporte de tool calling / function calling: no disponible (no aplica a una política de robótica).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): visión sí (tres cámaras); audio no; modo thinking no disponible.

## Casos de uso

- Manipulación robótica en laboratorio: cargar el checkpoint con `Evo1Policy` y ejecutar políticas de imitación sobre un brazo real o simulado para tareas de panel/escritorio, que es el dominio del dataset `cyclo_dashboard_0904_test_v30`.
- Reproducción de experimentos de entrenamiento en dos etapas: comparar el rendimiento de este snapshot (Stage 2, paso 6000) con el checkpoint de Stage 1 (paso 4000) para estudiar la ganancia de la segunda fase, evaluando sobre los episodios reservados 24–27.
- Investigación en VLA a escala sub-1B: usar los ~748 M de parámetros como punto de partida para estudiar destilación, poda o adaptación eficiente en modelos de acción visual-lenguaje.
- Fine-tuning sobre dominios propios: al ser un checkpoint intermedio con backbone y cabeza entrenables, sirve como inicialización para ajustar la política a una nueva tarea de manipulación con un dataset LeRobot propio.
- Recolección y validación de datos: dado que el dataset es de test (28 episodios), el modelo es útil para verificar que el pipeline de captura multi-cámara y el formato de acciones 22D son coherentes antes de escalar a un dataset mayor.
- Despliegue en robótica de borde como referencia: con ~748 M de parámetros, es candidato a ejecutarse en hardware tipo Jetson o GPUs de gama media para prototipos de inferencia a bordo, siempre que se valide previamente la latencia real (no publicada).
- Evaluación comparativa de políticas en LeRobot: integrarlo en un banco de pruebas junto a otras políticas de la librería para medir tasa de éxito en tareas de manipulación con el mismo conjunto de episodios reservados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, errores de acción (MSE), métricas de simulación ni comparaciones con otras políticas. Tampoco se documentan métricas de latencia o frecuencia de control.

## Requisitos de hardware

- VRAM estimada solo para pesos: ~3,0 GB en FP32, ~1,5 GB en FP16/BF16, ~0,75 GB en INT8 y ~0,4 GB en INT4 (estimaciones derivadas del recuento de parámetros; la precisión real del checkpoint no está especificada).
- VRAM recomendada en la práctica: 8–12 GB o más, ya que hay que sumar activaciones de tres cámaras, el backbone de visión y la cabeza de acciones, además del runtime de LeRobot.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y GPUs con 8 GB o más, siempre que se ajuste el tamaño de batch y la resolución de entrada.
- Alternativas de borde: NVIDIA Jetson Orin (16/32/64 GB) es un candidato razonable para robótica embarcada, aunque no hay validación publicada.
- Opciones de despliegue: el soporte declarado es LeRobot sobre PyTorch con `Evo1Policy` y los pre/post procesadores guardados. No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama, y estas herramientas no son aplicables a una política de acciones (no es un modelo de lenguaje generativo).
- Exportación a ONNX, TensorRT o integración con ROS 2: no disponible.
- Latencia y throughput: no disponibles. Para control robótico en tiempo real se suele requerir entre 10 y 30 Hz, pero no hay datos que confirmen que este checkpoint los alcance.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Evo1 Stage 2 (este checkpoint) | ~748 M | Chunk de 16, acciones 22D, 3 cámaras | No disponible | HuggingFace (0 descargas) | Snapshot intermedio, sin métricas publicadas |
| SmolVLA | ~450 M (dato de conocimiento general) | No verificado | Ver licencia del proyecto | HuggingFace / LeRobot | VLA compacto de la familia LeRobot; cifras no verificadas en esta búsqueda |
| OpenVLA | ~7 B (dato de conocimiento general) | No verificado | Ver licencia del proyecto | HuggingFace | VLA de referencia en manipulación; cifras no verificadas en esta búsqueda |
| Políticas clásicas de LeRobot (ACT, Diffusion Policy) | Depende de la configuración | No verificado | Ver licencia del proyecto | HuggingFace / LeRobot | Alternativas no VLA; comparación pendiente de datos |

Nota: los datos de SmolVLA, OpenVLA y las políticas clásicas de LeRobot provienen de conocimiento general y no de la información proporcionada en esta búsqueda; deben verificarse en sus fuentes originales antes de usarse en una comparación formal.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial libre; hay que contactar con el autor antes de cualquier despliegue en producción.
- Es un checkpoint intermedio, no un modelo final: está extraído en el paso 6000 de un entrenamiento en curso y puede estar infraentrenado o sobreajustado.
- Dataset muy reducido: 24 episodios de entrenamiento y 4 de validación en un único dominio (`cyclo_dashboard_0904_test_v30`), lo que limita severamente la generalización a otras tareas, entornos u objetos.
- Sin métricas publicadas: no hay evidencia cuantitativa de tasa de éxito, robustez ni comparación con alternativas.
- Riesgo de sobreajuste al dominio: un dataset de 24 episodios con ~748 M de parámetros entrenables invita a memorizar trayectorias concretas.
- Idiomas no especificados: aunque se declare un backbone de lenguaje, no se documenta qué idiomas entiende ni el formato de las instrucciones.
- Sin información sobre sesgos: no se han documentado sesgos demográficos, culturales ni de dominio.
- Riesgo de alucinación: en una política de acciones, el equivalente son predicciones de acción incorrectas o inseguras; no hay validación de seguridad física.
- Reproducibilidad: se requiere la versión exacta de LeRobot, la clase `Evo1Policy` y los pre/post procesadores guardados; otras versiones pueden no cargar el checkpoint.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay comunidad que haya validado el modelo.
- Formatos de despliegue limitados: no se documenta exportación a ONNX/TensorRT ni cuantizaciones soportadas, lo que complica el despliegue en hardware embarcado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dongkkka/evo1_dashboard_0904_stage2_6k_16bs
- Dataset de entrenamiento citado en la model card: https://huggingface.co/datasets/Dongkkka/cyclo_dashboard_0904_test_v30
- Librería LeRobot (referencia del framework): https://huggingface.co/docs/lerobot
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos (foros de fotografía química, preguntas en Zhihu sobre el símbolo ～) no guardan relación con el modelo.
