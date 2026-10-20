# kiroaiseoul/NAJY_act_task02_c100_gist30_soloall_16D_60k_s1000

## Resumen

NAJY_act_task02_c100_gist30_soloall_16D_60k_s1000 es un checkpoint de política robótica basado en ACT (Action Chunking Transformer), publicado por el usuario kiroaiseoul dentro del ecosistema LeRobot. El modelo aprende una política de manipulación por imitación para la plataforma Trossen Mobile AI y mapea observaciones multimodales —estado proprioceptivo de 16 dimensiones y tres cámaras RGB de 480×640 (alta, muñeca izquierda y muñeca derecha)— a acciones de 16 dimensiones. Cuenta con 51.689.104 parámetros y un repositorio de 0,2 GB en formato safetensors.

El checkpoint corresponde al paso 60.000 de la ejecución `exp_task02_c100_gist30_soloall_s1000`, entrenada según el registro del autor en una máquina DGX_1 el 19 de octubre de 2026. La nomenclatura sugiere un chunk de acción de 100 pasos (`c100`), 30 tokens de tipo gist (`gist30`), espacio de acción de 16 dimensiones (`16D`) y 60.000 pasos (`60k`); estos valores son inferencias a partir del nombre y no están confirmados de forma explícita en la model card.

Su relevancia es doble: por un lado, es un ejemplo de política de manipulación compacta (~52 M de parámetros) desplegable en hardware modesto; por otro, el autor indica que la subida tiene fines de análisis y evaluación (`분석·채점용`), no de despliegue en producción, y proporciona sumas de comprobación SHA-256 para verificar la integridad de los pesos. No se han publicado métricas de rendimiento ni detalles del conjunto de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), transformer con predicción de acciones por chunks; etiqueta `act` de LeRobot |
| Parametros totales | 51.689.104 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica ventana de contexto de LLM (política robótica que consume observaciones) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en precisión de entrenamiento) |
| Idiomas soportados | no aplica; el modelo no procesa lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, SHA-256 `03fc55a663b16e8d1781fac64995db5cd34a0d2c5be0bc46524627a30036a5dd`) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia ACT (Action Chunking with Transformers), una arquitectura de aprendizaje por imitación que emplea un transformer con formulación CVAE para predecir secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación en tareas de manipulación de precisión. La entrada combina las tres vistas RGB de 480×640 con el vector de estado de 16 dimensiones; la salida es un vector de acción también de 16 dimensiones. El repositorio se distribuye con la estructura `pretrained_model` propia de LeRobot, por lo que puede cargarse directamente con las herramientas del ecosistema (`--checkpoint <carpeta>`, según indica el autor).

Los detalles concretos de entrenamiento están parcialmente documentados. La model card registra la ejecución `exp_task02_c100_gist30_soloall_s1000` en el paso 60.000, con fecha de lanzamiento 2026-10-19T23:08:28+09:00, commit `7fd76a0`, manifiesto `configs/datasets/task02_gist30_solo_all.json` (SHA-256 `8a2df0350587acb7`) y lanzador `39ea4b1f9b52d7a7`. Las features declaradas son `observation.state` [16], tres cámaras `cam_high`, `cam_left_wrist`, `cam_right_wrist` [3, 480, 640] y `action` [16]. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF/DPO (poco habituales en políticas de imitación robótica). El autor referencia el documento interno `trossen-ai-simulation/docs/mobile_base_investigation.md` §94 como contexto.

## Capacidades

- Generación de secuencias de acciones de 16 dimensiones (chunks) para control de un robot de manipulación de la plataforma Trossen Mobile AI.
- Percepción multimodal basada en tres cámaras RGB de 480×640 (vista alta y dos vistas de muñeca) combinadas con estado proprioceptivo de 16 dimensiones.
- Aprendizaje por imitación supervisado: reproduce comportamientos demostrados para la tarea `task02`.
- Inferencia compatible con el pipeline `lerobot` y con la estructura `pretrained_model` estándar.
- Verificación de integridad mediante SHA-256 del fichero de pesos y del manifiesto.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni generación de texto.
- No dispone de capacidades multilingües ni de procesamiento de audio o visión general (solo las tres cámaras de robot especificadas).

## Casos de uso

- Control de manipulación en la tarea 02 de Trossen Mobile AI: el checkpoint reproduce la política entrenada para esa tarea concreta, con entradas de estado de 16 dimensiones y tres cámaras, adecuado para probar el comportamiento aprendido en un banco de pruebas.
- Evaluación y reproducción de experimentos: al ser una subida de análisis (`분석·채점용`), sirve para comparar el paso 60.000 frente a otros checkpoints de la misma ejecución y validar la integridad de los pesos mediante SHA-256.
- Baseline para fine-tuning: sus ~52 M de parámetros y su licencia Apache 2.0 lo hacen apropiado como punto de partida para reentrenar sobre nuevas tareas o configuraciones de cámara.
- Despliegue en hardware de gama media: el tamaño reducido permite ejecutar la política en una GPU de consumo o incluso en CPU para pruebas no críticas en tiempo real.
- Investigación sobre action chunking: útil para estudiar el efecto del tamaño de chunk (`c100`) y de los tokens gist (`gist30`) en la estabilidad de la política.
- Integración en pipelines de LeRobot: puede cargarse con las herramientas estándar (`--checkpoint`) para validar la cadena de inferencia antes de confirmar un candidato de despliegue real.
- Auditoría de reproducibilidad: los hashes documentados permiten verificar que el checkpoint evaluado es exactamente el registrado en el manifiesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, errores de posición, métricas de simulación ni comparaciones numéricas con otros checkpoints; únicamente documenta la configuración de la ejecución y las sumas de comprobación.

## Requisitos de hardware

- VRAM estimada: ~207 MB en fp32 y ~103 MB en fp16 para los 51,7 M de parámetros; el repositorio completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU moderna sirve; para control en tiempo real se recomienda una RTX 3060/4060 o superior, y para entrenamiento o evaluación por lotes una RTX 4090, A100 o H100.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU consumer e incluso en CPU (aunque con mayor latencia).
- Opciones de despliegue: librería `lerobot` (PyTorch) como vía oficial; exportación a ONNX o TensorRT posible pero no documentada por el autor; vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de política.
- Latencia y throughput: no disponible; no se han publicado mediciones. La inferencia sobre un modelo de ~52 M de parámetros es previsiblemente rápida, pero la latencia real depende del preprocesado de las tres cámaras de 480×640 y del hardware de destino.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAJY_act_task02 (este) | 51,7 M | 3 cámaras 480×640 + estado 16D | no disponible | Apache 2.0 | HuggingFace (7 descargas) |
| ACT original (Stanford ALOHA) | ~50 M (orden de magnitud) | Cámaras + estado proprioceptivo | publicado en el paper original | MIT (repositorio de referencia) | Código abierto |
| Diffusion Policy | variable según configuración | Cámaras + estado | publicado en el paper original | MIT (repositorio de referencia) | Código abierto |
| OpenVLA | ~7 B | Imagen + instrucción en lenguaje | publicado en el paper original | licencia propia (ver repositorio) | HuggingFace |

Nota: los datos de las alternativas corresponden a conocimiento general de la familia y no se han verificado contra las fuentes en esta búsqueda; los valores marcados como "publicado en el paper original" requieren consulta directa. No se dispone de una comparación numérica con este checkpoint concreto.

## Limitaciones y advertencias

- Es una política específica de la tarea `task02`: no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Subida explícitamente etiquetada como "análisis y evaluación", no como candidato de despliegue confirmado; el autor separa esta versión de la confirmación de despliegue real.
- No hay métricas publicadas de tasa de éxito, robustez ni generalización; cualquier uso en producción requiere evaluación propia.
- Riesgo de desviación de distribución (distribution shift) entre el entorno de entrenamiento y el entorno real, especialmente si cambian la iluminación, la posición de las cámaras o el robot.
- No procesa lenguaje natural ni admite instrucciones textuales; la tarea está fijada por el entrenamiento.
- No se documentan sesgos, composición del dataset ni posibles sesgos de los datos de demostración.
- La licencia Apache 2.0 permite uso comercial, pero se ofrece sin garantías; conviene revisar las dependencias de LeRobot y de los modelos base utilizados.
- Se recomienda verificar el SHA-256 del fichero `model.safetensors` antes de su uso, tal como indica el autor.
- La model card está redactada en coreano; pueden perderse matices en la traducción.

## Enlaces

- HuggingFace: https://huggingface.co/kiroaiseoul/NAJY_act_task02_c100_gist30_soloall_16D_60k_s1000
- Referencia interna citada por el autor: `trossen-ai-simulation/docs/mobile_base_investigation.md` §94 (sin URL pública disponible)
- LeRobot (librería de despliegue): no se ha proporcionado URL en la información disponible
- No se han encontrado en la búsqueda web enlaces relevantes al modelo, al paper de ACT ni al proyecto Trossen Mobile AI; los resultados devueltos corresponden a comparadores de operadores de internet y no guardan relación con el modelo.
