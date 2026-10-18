# kiroaiseoul/NAJY_act_all11_c100_gist30_reef_sf_27D_60k_s3000

## Resumen

NAJY_act_all11_c100_gist30_reef_sf_27D_60k_s3000 es un checkpoint de política robótica basado en ACT (Action Chunking with Transformers) publicado en HuggingFace por el usuario kiroaiseoul dentro del ecosistema LeRobot. No es un modelo de lenguaje: es una política de imitación que consume tres cámaras RGB de 480×640 (cam_high, cam_left_wrist, cam_right_wrist) más un vector de estado del entorno de 11 dimensiones, y produce una acción de 16 dimensiones. El checkpoint corresponde al paso 60.000 del run `t49_all11_c100_gist30_reef_sf_s3000`, con 51.677.328 parámetros y un repositorio de 0,2 GB.

El autor lo describe como un checkpoint ACT de 11 etapas entrenado en su máquina número 1 (DGX_1) y lo publica explícitamente para análisis y puntuación, separándolo de cualquier confirmación como candidato de despliegue real. Está etiquetado con `trossen-mobile-ai`, lo que lo vincula a la plataforma de manipulación móvil de Trossen Robotics, y se distribuye bajo licencia Apache 2.0.

Su relevancia es acotada: no hay resultados de evaluación, ni tasa de éxito, ni descripción del dataset, y el propio autor advierte de que el log de entrenamiento no está disponible (el primer campo figura como `?`). Es útil como referencia de formato y estructura de un checkpoint LeRobot/ACT para robótica bimanual con base móvil, no como modelo validado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación encoder-decoder con chunking de acciones; detalles no documentados en la model card |
| Parámetros totales | 51.677.328 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplicable: no es un modelo de lenguaje; procesa la observación actual (3 imágenes de 480×640 + vector de estado de 11 dimensiones). El tamaño del chunk de acciones y el historial no están documentados |
| Tipos de cuantización | No disponible; solo se publican pesos en safetensors (repositorio de 0,2 GB, coherente con ~51,7 M de parámetros en fp32) |
| Idiomas soportados | No disponible; no es un modelo de lenguaje. La model card está redactada en coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.safetensors` (sha256 `562d45d795bd391bc58638112b22ef00df0b4e142df27cfe142742f13de94666`), estructura `pretrained_model` de LeRobot y `multi_manifest.json` en la misma carpeta |

## Arquitectura y entrenamiento

El checkpoint se etiqueta como `act`, el método Action Chunking with Transformers para manipulación fina bimanual con hardware de bajo coste. En su formulación original, ACT es un transformer encoder-decoder con un componente generativo tipo CVAE que predice un chunk de acciones futuras a partir de observaciones multimodales, y que en inferencia aplica ensamblado temporal (temporal ensembling) para suavizar la secuencia. La model card no confirma estos detalles para esta instancia concreta: no se especifica número de capas, dimensión oculta, tamaño del chunk ni si se aplica ensamblado temporal.

Los datos de entrenamiento no están documentados: no se indica número de episodios, número de tokens, composición del dataset ni si hubo etapas de RLHF o ajuste posterior. Los rasgos disponibles son la firma de entrada —tres cámaras a 480×640, `observation.environment_state` de 11 dimensiones y `action` de 16 dimensiones— y el flag `{"env_stage_token": true}` del manifiesto, que sugiere un condicionamiento por señal de etapa del entorno, sin que la model card detalle su semántica. El nombre del run contiene abreviaturas (`c100`, `gist30`, `s3000`, `60k`) que probablemente codifican tamaño de chunk, número de tokens gist, semilla y paso de entrenamiento, pero el autor no las define, por lo que no deben tomarse como especificación.

## Capacidades

- Generación de comandos de acción de 16 dimensiones condicionados por tres vistas RGB (cámara alta y dos muñecas) y un vector de estado del entorno de 11 dimensiones.
- Aprendizaje por imitación para manipulación bimanual sobre plataforma móvil (etiqueta `trossen-mobile-ai`).
- Procesamiento multimodal limitado a visión como entrada exteroceptiva; no hay comprensión de lenguaje ni razonamiento visual semántico.
- Condicionamiento por etapa del entorno declarado en el manifiesto (`env_stage_token: true`), con semántica no documentada.
- Compatible con el pipeline de LeRobot: la estructura `pretrained_model` permite cargarlo directamente en herramientas de evaluación y diagnóstico del repositorio (`stage_cond_diag.py` según la model card).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni generación de texto, código o matemáticas.
- Capacidades multilingües: no aplica.

## Casos de uso

- Evaluación comparativa de checkpoints ACT: cargar el modelo con la estructura `pretrained_model` de LeRobot y medir la tasa de éxito en un entorno simulado frente a otros checkpoints del mismo run, aprovechando que el autor lo publica con fines de análisis y puntuación.
- Investigación en manipulación bimanual con base móvil: usar las tres vistas (alta y dos muñecas) para estudiar cómo afecta la oclusión de cada cámara a la política, ya que el checkpoint está entrenado específicamente con esa configuración.
- Reproducción de experimentos de imitación: el sha256 publicado permite verificar la integridad del fichero antes de incluirlo en una comparativa reproducible.
- Diagnóstico de condicionamiento por etapa: el flag `env_stage_token` del manifiesto permite probar variantes de la señal de etapa y observar el efecto en las trayectorias generadas.
- Desarrollo de pipelines de robótica en LeRobot: servir como referencia de integración de un checkpoint ACT con observaciones multimodales y acciones de 16 dimensiones en scripts de entrenamiento y evaluación.
- Docencia y prototipado en robótica de imitación: con 51,7 M de parámetros y 0,2 GB, el modelo se puede cargar y ejecutar en un portátil con GPU de gama media para clases prácticas o pruebas de concepto.
- No se recomienda su uso como política de control en un robot real sin una evaluación propia previa: el autor indica explícitamente que el checkpoint no está confirmado como candidato de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasa de éxito, error de posición, número de episodios de evaluación ni comparación con otros checkpoints. Tampoco se aportan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 207 MB (51,68 M × 4 bytes). Sumando tres flujos de imagen de 480×640 y el overhead del framework, una estimación razonable se sitúa en 1-2 GB de VRAM; no es un dato publicado por el autor.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, 4060, 3090, 4090). Para entrenamiento o evaluación a gran escala, A100 o H100 solo aportan ventaja por paralelismo de episodios, no por tamaño del modelo.
- Cabe en GPU consumer: sí, con holgura. También es viable en CPU para inferencia a baja frecuencia y en dispositivos embebidos tipo Jetson Orin, aunque no hay datos publicados de latencia en esas plataformas.
- Opciones de despliegue: LeRobot (carga del checkpoint y scripts de evaluación/servidor de políticas) sobre PyTorch. No se documentan exportaciones a ONNX, TensorRT o formatos GGUF; vLLM, TGI, llama.cpp y Ollama no aplican porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada / tarea | Tipo de política | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAJY_act_all11 (este checkpoint) | 51,7 M | 3 cámaras 480×640 + estado de 11 dim → acción de 16 dim | ACT (imitación) | Apache 2.0 | HuggingFace, 0 descargas |
| ACT de referencia en LeRobot | No disponible | Configurable por dataset | ACT (imitación) | Apache 2.0 (LeRobot) | Repositorio LeRobot |
| Diffusion Policy (LeRobot) | No disponible | Configurable por dataset | Política de difusión (imitación) | No disponible en la información proporcionada | Repositorio LeRobot |
| SmolVLA (LeRobot) | No disponible en la información proporcionada | Visión + lenguaje + estado → acción | VLA (visión-lenguaje-acción) | No disponible en la información proporcionada | Repositorio LeRobot |

La comparación es cualitativa: no se han proporcionado parámetros, contextos ni métricas de los modelos alternativos, y este checkpoint no publica resultados que permitan una comparación cuantitativa. Su principal diferencia frente a un VLA es que no acepta instrucciones en lenguaje natural y está atado a una morfología concreta (16 dimensiones de acción, tres cámaras fijas, estado de 11 dimensiones).

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay tasa de éxito ni métricas de ningún tipo, por lo que no es posible afirmar que la política funcione fuera del entorno de entrenamiento.
- El autor indica que el checkpoint se sube para análisis y puntuación y que no equivale a una confirmación como candidato de despliegue real.
- Acoplamiento estricto a una morfología y configuración de sensores: tres cámaras a 480×640 en posiciones concretas, estado de 11 dimensiones y acción de 16 dimensiones. No es reutilizable en otro robot sin reentrenar.
- Log de entrenamiento no disponible (el primer campo aparece como `?`), sin información sobre dataset, número de episodios ni composición.
- Riesgo de sobreajuste al entorno de laboratorio y de error compuesto (compounding error) en horizontes largos, consustancial a las políticas de imitación; no aplica el concepto de alucinación al no generar texto.
- Sesgos: no evaluados ni documentados. Cualquier sesgo procede de las demostraciones humanas del dataset, que no se describe.
- Documentación únicamente en coreano y muy escueta, lo que dificulta la auditoría por terceros.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero no se documenta la licencia ni la procedencia de los datos de entrenamiento, lo que puede afectar a la trazabilidad en producción.
- Ausencia de métricas de robustez ante cambios de iluminación, oclusiones o calibración de cámaras.
- Popularidad nula en el momento de la consulta (0 descargas, 0 likes), sin evidencia de uso independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_gist30_reef_sf_27D_60k_s3000
- Repositorio LeRobot (librería con la que se carga el checkpoint): https://github.com/huggingface/lerobot
- Artículo original de ACT, "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (referencia del método, no citado en la model card): https://arxiv.org/abs/2304.13705
- Referencia interna mencionada en la model card: `docs/mobile_base_investigation.md`, sección 94, del proyecto `trossen-ai-simulation` (no se proporciona URL).
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos por la búsqueda no guardan relación con el artefacto y se han descartado.
