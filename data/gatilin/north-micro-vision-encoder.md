# gatilin/north-micro-vision-encoder

## Resumen

North Micro Vision Encoder es una extracción comunitaria de la torre visual del modelo CohereLabs/North-Micro-Vision-Instruct, publicada por el usuario gatilin bajo licencia Apache 2.0. No se trata de un modelo completo, sino de un componente: incluye únicamente los tensores `model.visual.*` del VLM original (torre visual, merger final y tres mergers deepstack), sin la parte lingüística. El resultado es un codificador visual de 538,6 millones de parámetros (538.631.408, según los safetensors) que produce representaciones de imagen en varios niveles de fusión.

El modelo base, North Micro Vision Instruct, es un VLM de 2,4 mil millones de parámetros desarrollado por Cohere y publicado el 12 de agosto de 2026. Combina un codificador visual de resolución nativa de unos 400 millones de parámetros con un backbone lingüístico de 2 mil millones basado en la arquitectura Command A+. Este componente aísla la parte visual para reutilizarla en pipelines de extracción de características, investigación sobre representaciones multimodales o montajes propios de VLM.

Su relevancia es práctica: permite obtener las características visuales de un modelo reciente sin cargar el VLM completo, con un repositorio de 1,1 GB y dependencia de Transformers 5.21.1. Está pensado para desarrolladores que quieran integrar el encoder en sistemas propios de recuperación, clasificación o alineamiento imagen-texto, siempre asumiendo que por sí solo no genera texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Torre visual de un VLM (CohereCompassVisionModel), con merger final y tres mergers deepstack; resolución nativa |
| Parametros totales | 538.631.408 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el componente procesa imágenes, no secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo no documenta variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (claves, formas y dtypes originales conservados) |

## Arquitectura y entrenamiento

El componente reproduce la torre visual del VLM North Micro Vision Instruct: un codificador de resolución nativa de aproximadamente 400 millones de parámetros, acompañado de un merger final y tres mergers deepstack que combinan las características visuales con distintos niveles de la jerarquía del transformer. La extracción conserva las claves, formas y dtypes originales de los tensores (`model.visual.*`) de la revisión `fa548d9aa62c1220bfd21fc6cfc465f1bd2a1a40` del modelo base. El repositorio incluye `tensor_mapping.json`, `extraction.json` y `validation.json` con comprobaciones de bytes de origen y validación medida.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base, más allá de que este se presenta como un modelo instruct. La innovación técnica destacable es la salida multinivel: el forward devuelve los tokens visuales sin fusionar (`last_hidden_state`), las características fusionadas finales (`pooler_output`) y las características intermedias de deepstack, lo que facilita su uso en arquitecturas que necesitan inyectar información visual en varias capas.

## Capacidades

- Extracción de características visuales a partir de imágenes RGB en resolución nativa.
- Producción de tres tipos de salida: tokens visuales sin fusionar, características fusionadas finales y características intermedias de deepstack.
- Integración con el procesador del modelo base (`load_processor`) para el preprocesado de imágenes y el cálculo de `image_grid_thw`.
- Compatible con el pipeline `feature-extraction` de Hugging Face.
- No incluye generación de texto, razonamiento, código ni matemáticas: la parte lingüística no está presente.
- No soporta tool calling ni function calling por sí mismo.
- No soporta agentes ni razonamiento multi-paso de forma autónoma.
- Capacidades multilingües: no disponibles en este componente.
- No dispone de modo thinking, audio ni otras modalidades.

## Casos de uso

- Investigación sobre representaciones visuales: cargar el encoder y extraer `last_hidden_state` y `pooler_output` de un conjunto de imágenes para analizar cómo se estructuran las características en distintos niveles de fusión, sin necesidad de ejecutar el VLM completo.
- Recuperación multimodal (image retrieval): usar las características fusionadas finales como embeddings de imagen en un índice vectorial y combinarlas con embeddings de texto de otro modelo para búsqueda cruzada.
- Clasificación de imágenes con cabezas propias: congelar el encoder y entrenar un clasificador ligero sobre `pooler_output`, aprovechando que solo hay que mover 538,6 millones de parámetros.
- Montaje de un VLM propio: reutilizar la torre visual y los mergers deepstack como bloque de entrada de una arquitectura personalizada que añada su propio backbone lingüístico.
- Destilación y alineamiento visión-lenguaje: emplear las características intermedias de deepstack como objetivo o señal auxiliar en el entrenamiento de modelos más pequeños.
- Evaluación comparativa de encoders: medir la calidad de las representaciones del encoder de North Micro Vision frente a otros codificadores en tareas de clasificación o recuperación, con un coste de despliegue reducido.
- Preprocesado en pipelines de datos: extraer y cachear características visuales de grandes colecciones de imágenes para acelerar experimentos posteriores que no necesiten el modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 538,6 millones de parámetros ocupan aproximadamente 2,2 GB; en fp16 o bf16, alrededor de 1,1 GB, más el espacio de activaciones según la resolución de imagen.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; una RTX 4090, A100 o H100 ofrece margen amplio para lotes grandes y mayor resolución.
- Cabe en GPU de consumo: sí, en tarjetas con 4-8 GB o más (por ejemplo, RTX 3060, RTX 4060, RTX 4090).
- Opciones de despliegue: el repositorio proporciona un script `component.py` con `load_model` y `load_processor`; requiere PyTorch, torchvision, accelerate, safetensors, Pillow y Transformers 5.21.1. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este componente.
- Latencia y throughput estimados: no disponibles. La validación incluida es una prueba de humo en CPU y no establece paridad con el VLM completo ni con inferencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gatilin/north-micro-vision-encoder | 538,6 M | no disponible | Codificador visual (componente) | Apache 2.0 | Hugging Face, 19 descargas |
| CohereLabs/North-Micro-Vision-Instruct | 2,4 B (total) | no disponible | VLM completo | Apache 2.0 | Hugging Face |
| Codificadores visuales de otros VLM compactos | no disponible | no disponible | Codificador visual | variable | no disponible |

La comparación directa con otros codificadores visuales aislados no está disponible en la información proporcionada; la alternativa natural es el modelo completo North Micro Vision Instruct, que añade el backbone lingüístico de 2 mil millones de parámetros y la capacidad de generar texto.

## Limitaciones y advertencias

- El componente no es un modelo visión-lenguaje completo: no genera texto ni responde a instrucciones.
- La validación incluida es una prueba de humo en CPU; no se ha demostrado paridad con el VLM original ni con inferencia en GPU.
- Requiere Transformers 5.21.1 como runtime verificado; con otras versiones hay que comprobar la compatibilidad de `CohereCompassVisionModel` y su procesador.
- La carga se realiza insertando el directorio del repositorio en `sys.path` e importando `component`, un patrón poco convencional que conviene encapsular antes de llevar a producción.
- Sesgos conocidos: no disponibles; al heredar los pesos del modelo base, podría arrastrar los sesgos de sus datos de entrenamiento, no documentados aquí.
- Riesgo de alucinación: no aplica directamente al no generar texto, pero las representaciones pueden ser poco fiables en dominios alejados de los datos de entrenamiento del modelo original.
- Limitaciones de contexto o idioma: no disponibles para este componente.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar los avisos de licencia y atribución del modelo base.
- Advertencia para producción: al ser una extracción comunitaria con 19 descargas y sin mantenimiento declarado, conviene validar la integridad de los tensores y fijar la revisión concreta antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/gatilin/north-micro-vision-encoder
- Modelo base: https://huggingface.co/CohereLabs/North-Micro-Vision-Instruct
- Model card del modelo base: https://huggingface.co/CohereLabs/North-Micro-Vision-Instruct/blob/main/README.md
- Artículo en Learn AI: https://ai.miraheze.org/wiki/North_Micro_Vision
