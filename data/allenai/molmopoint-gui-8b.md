# allenai/MolmoPoint-GUI-8B

## Resumen

MolmoPoint-GUI-8B es un modelo de visión-lenguaje (VLM) desarrollado por el Allen Institute for AI (Ai2) y publicado bajo licencia Apache 2.0. Se trata de un ajuste fino especializado de MolmoPoint-8B orientado exclusivamente a la localización de puntos (pointing) sobre capturas de pantalla de interfaces gráficas de usuario (GUI). A diferencia de los modelos generalistas de grounding visual, este modelo no describe la imagen ni mantiene conversaciones: recibe una instrucción textual y una única imagen de pantalla, y devuelve un único punto en coordenadas de píxel.

El modelo emplea una arquitectura multimodal con un codificador visual y un modelo de lenguaje de aproximadamente 8.680 millones de parámetros totales (8.677.855.065 según los pesos en safetensors). Su innovación principal es la representación de las coordenadas mediante *grounding tokens* especiales en lugar de texto numérico, lo que evita errores de formato y mejora la precisión espacial. Según la model card, alcanza 61,1 en el benchmark ScreenSpotPro, una métrica específica para localización de elementos en pantallas.

Su relevancia actual radica en que cubre una necesidad concreta de los agentes informáticos: dado un comando en lenguaje natural como "abrir Microsoft Edge", el modelo identifica el píxel exacto donde debe hacerse clic. Esto lo convierte en una pieza útil para automatización de escritorio, testing de interfaces y agentes GUI, aunque con la restricción de que solo acepta una imagen por consulta y está entrenado únicamente en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM multimodal (codificador visual + modelo de lenguaje) con grounding tokens; etiqueta `molmo_point` y `custom_code` |
| Parametros totales | 8.677.855.065 |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se recomienda bfloat16 en los ejemplos) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 34,7 GB) |

## Arquitectura y entrenamiento

MolmoPoint-GUI-8B es un ajuste fino del modelo base allenai/MolmoPoint-8B, que a su vez pertenece a la familia Molmo2 de Ai2. La arquitectura combina un codificador de imágenes con un transformer de lenguaje y utiliza un mecanismo de *pointing* basado en tokens especiales de grounding: el modelo no genera coordenadas como texto, sino una secuencia de tokens que el procesador decodifica posteriormente a coordenadas de píxel mediante metadatos (`token_pooling`, `subpatch_mapping`, `image_sizes`). Esta aproximación, según la model card, es la que permite alcanzar 61,1 en ScreenSpotPro.

El entrenamiento se ha realizado como especialización sobre MolmoPoint-8B para entrada de una sola imagen de captura de pantalla y consultas tipo instrucción, con salida de un único punto. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card advierte que los datos de terceros empleados están sujetos a uso académico y de investigación no comercial, lo que debe revisarse antes de un despliegue productivo. El repositorio de Hugging Face no soporta entrenamiento; el código de entrenamiento está en el repositorio de GitHub de molmo2.

## Capacidades

- Localización de puntos sobre capturas de pantalla GUI: recibe una instrucción y una imagen y devuelve un único punto en coordenadas de píxel.
- Salida estructurada mediante grounding tokens, decodificable con `model.extract_image_points`, que devuelve tuplas `(image_id, object_id, pixel_x, pixel_y)`.
- Generación restringida por `build_logit_processor_from_inputs`, que fuerza la emisión válida de tokens de punto.
- Entrada multimodal de una sola imagen con consulta textual tipo instrucción.
- No soporta tool calling ni function calling según la información disponible.
- No está diseñado para razonamiento multi-step ni para conversaciones multi-turno.
- Capacidad monolingüe: solo inglés.
- No dispone de modo de razonamiento explícito (thinking mode), audio ni vídeo.

## Casos de uso

- Automatización de escritorio y agentes GUI: dado un comando como "abrir Microsoft Edge" y una captura de pantalla, el modelo devuelve el píxel del icono correspondiente, que el agente puede convertir en una acción de clic. Es adecuado por su especialización en ScreenSpotPro y su salida de punto único.
- Testing automatizado de interfaces: en pipelines de QA, el modelo puede localizar elementos concretos en capturas de pantalla de distintas versiones de una aplicación para verificar que los controles siguen presentes y en la posición esperada.
- RPA (automatización robótica de procesos) sobre aplicaciones heredadas: cuando no hay API accesible, el modelo permite identificar botones y campos a partir de capturas, integrándose en flujos que simulan interacción humana.
- Asistentes de accesibilidad: localizar el elemento que el usuario describe en lenguaje natural sobre una captura para guiar la interacción o generar instrucciones visuales.
- Generación de datasets de anotación GUI: usar el modelo para preanotar puntos de interés en grandes colecciones de capturas, que luego se revisan manualmente, reduciendo el coste de etiquetado.
- Evaluación de agentes informáticos: como componente de *grounding* en un pipeline mayor, sirve para medir si un agente identifica correctamente el elemento objetivo antes de ejecutar una acción.
- Investigación en percepción visual de interfaces: permite experimentar con representaciones basadas en grounding tokens frente a coordenadas textuales en tareas de localización.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| ScreenSpotPro | 61,1 | Dato indicado en la model card del autor |

No se han publicado en la información disponible resultados de otros benchmarks como MMLU, HumanEval o GSM8K, ni comparativas numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 17-18 GB solo para los pesos (8,68 mil millones de parámetros), más el codificador visual y las activaciones; se recomienda al menos 24 GB para trabajar con margen.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bfloat16.
- En GPU de consumo: cabe en RTX 4090 y, con cuantización a 8 bits, podría ajustarse en GPUs de 16 GB; no se documentan cuantizaciones oficiales en la información disponible.
- Opciones de despliegue: `transformers` 4.57.1 con `trust_remote_code=True` y `device_map="auto"`, tal como indica la model card. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MolmoPoint-GUI-8B | 8,68 B | no disponible | Pointing GUI (ScreenSpotPro 61,1) | Apache 2.0 | Hugging Face |
| MolmoPoint-8B | no disponible | no disponible | Pointing generalista | Apache 2.0 | Hugging Face |
| MolmoPoint-Img-8B | no disponible | no disponible | Pointing sobre imágenes naturales | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de grounding GUI en la información proporcionada.

## Limitaciones y advertencias

- Solo acepta una única imagen de captura de pantalla por consulta; no admite múltiples imágenes ni vídeo.
- Salida limitada a un único punto; no genera descripciones, texto libre ni secuencias de acciones.
- Entrenado únicamente en inglés, lo que limita su uso con instrucciones en castellano u otros idiomas.
- No soporta entrenamiento desde el repositorio de Hugging Face; el código de entrenamiento está en GitHub.
- Riesgo de alucinación espacial: puede devolver un punto plausible pero incorrecto si la instrucción es ambigua o el elemento no está visible.
- Los datos de terceros usados en el entrenamiento están sujetos a uso académico y no comercial; debe revisarse la procedencia antes de un uso comercial, pese a la licencia Apache 2.0 del modelo.
- Requiere `trust_remote_code=True` y código personalizado, lo que implica revisar el código remoto antes de ejecutarlo en producción.
- No se documentan sesgos específicos ni evaluaciones de robustez en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allenai/MolmoPoint-GUI-8B
- Demo: https://huggingface.co/spaces/allenai/MolmoPoint-GUI-8B-Demo
- Código: https://github.com/allenai/molmo2
- Colección de modelos: https://huggingface.co/collections/allenai/molmopoint
- Paper: https://allenai.org/papers/molmopoint
- Blog: https://allenai.org/blog/molmopoint
