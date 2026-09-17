# mradermacher/decider-2b-vision-GGUF

## Resumen

mradermacher/decider-2b-vision-GGUF es un repositorio de cuantizaciones GGUF del modelo Mapika/decider-2b-vision, un modelo multimodal de ~1.880 millones de parámetros orientado a la toma de decisiones con salida estructurada ("decision-model", "calibrated", "structured-output", "one-pass" según las etiquetas del autor). El trabajo de cuantización lo firma mradermacher, que publica versiones estáticas en una amplia gama de niveles de precisión sin necesidad de ejecutar el modelo original en transformers.

El interés práctico del repositorio reside en el formato: al ofrecer ficheros GGUF desde Q2_K (1,1 GB) hasta f16 (3,9 GB), además de los suplementos multimodales mmproj en Q8_0 y f16, permite desplegar un modelo de visión y decisión en hardware de gama de consumo, CPU o dispositivos con recursos limitados mediante llama.cpp, Ollama o LM Studio, sin depender de GPUs de centro de datos.

Se trata de un modelo declarado únicamente para inglés y publicado con licencia Apache-2.0. El repositorio no registra descargas ni likes en el momento de la consulta, y la información técnica sobre arquitectura interna, longitud de contexto y proceso de entrenamiento no está disponible en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible. La presencia de ficheros `mmproj` (proyector multimodal) confirma una arquitectura de vision-language model con codificador visual y proyector hacia el modelo de lenguaje; la estructura interna del transformer no se detalla |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio). El modelo base se distribuye presumiblemente en safetensors; no confirmado en la informacion disponible |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. Lo único deducible de los artefactos publicados es que se trata de un modelo multimodal: el repositorio incluye dos ficheros `mmproj` (proyector multimodal) que acompañan a los pesos del modelo de lenguaje y que son imprescindibles para procesar imágenes. El tamaño declarado del tensor safetensors (1.881.825.088 parámetros) corresponde al modelo base Mapika/decider-2b-vision, no a los ficheros GGUF.

El autor del modelo base lo etiqueta como "decision-model", "calibrated", "structured-output" y "one-pass", lo que sugiere un entrenamiento orientado a producir decisiones o clasificaciones con formato estructurado y probabilidades calibradas en una sola pasada de inferencia, en lugar de generación de texto libre. Es una hipótesis basada en las etiquetas declaradas, no un dato confirmado: la model card del modelo base no forma parte de la información proporcionada. La cuantización aplicada por mradermacher es de tipo estático; según la propia model card, no hay cuantizaciones ponderadas ni con imatrix disponibles en el momento de la publicación.

## Capacidades

- Procesamiento de imagen y texto: la inclusión de ficheros `mmproj` indica soporte de entrada visual combinada con texto.
- Salida estructurada: el modelo está etiquetado como "structured-output", orientado a generar decisiones en formato serializable.
- Calibración de decisiones: la etiqueta "calibrated" apunta a una calibración explícita de las probabilidades o puntuaciones emitidas.
- Inferencia en una sola pasada: la etiqueta "one-pass" sugiere que la decisión se obtiene sin cadenas de razonamiento multi-paso.
- Conversación: el repositorio declara la etiqueta `conversational`, aunque no se detalla el formato de plantilla de chat.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; las etiquetas apuntan en dirección contraria (una sola pasada).
- Capacidades multilingües: solo inglés declarado. No hay soporte de castellano confirmado.
- Capacidades especiales (modo thinking, audio, vídeo): no disponible.

## Casos de uso

- Clasificación y enrutado de documentos con imagen: el modelo puede recibir una captura o escaneo y emitir una etiqueta de categoría en formato estructurado, lo que permite construir un enrutador de tickets o expedientes en una sola llamada por documento, sin cadena de razonamiento.
- Extracción de decisiones sobre formularios escaneados: dado un formulario con campos visibles, el modelo puede devolver un JSON con la decisión o validación correspondiente, aprovechando la orientación a salida estructurada y calibrada.
- Control de calidad visual en línea de producción: con cuantizaciones Q4_K_M de 1,4 GB y un proyector mmproj de 0,5-0,8 GB, puede ejecutarse en una GPU de gama media o en CPU junto a la línea de inspección para validar piezas o productos.
- Filtrado previo en pipelines de moderación: al ser un modelo pequeño y de una sola pasada, encaja como primera etapa de triaje que descarta la mayoría del contenido y deja pasar solo los casos dudosos a un modelo mayor.
- Asistencia en el puesto de trabajo sin conectividad: su reducido tamaño permite ejecutarlo íntegramente en local (portátil, mini-PC, dispositivo embebido) para tareas de decisión sobre capturas de pantalla o fotos, sin enviar datos a servicios externos.
- Descripción y decisión sobre imágenes en herramientas de accesibilidad: el modelo puede analizar una imagen y producir una salida breve y estructurada que otra capa de la aplicación convierta en texto o en una acción concreta.
- Gate de decisión en agentes: integrado como componente que evalúa el estado actual (por ejemplo, una captura de pantalla del entorno) y devuelve si continuar, detener o escalar, reduciendo el coste frente a consultar un modelo grande en cada paso.
- Prototipado rápido con Ollama o LM Studio: la disponibilidad de diez niveles de cuantización permite ajustar el equilibrio entre memoria y calidad sin reentrenar ni reconvertir pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni de tareas de decisión, y la búsqueda web realizada no ha devuelto documentación técnica asociada al modelo base Mapika/decider-2b-vision.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del tamaño de los ficheros publicados en el repositorio; no son mediciones del autor.

- Cuantizaciones de 2-3 bits (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L): entre 1,1 y 1,3 GB de pesos. Añadiendo el proyector mmproj-Q8_0 (0,5 GB) y el contexto, el consumo típico se sitúa en el entorno de 2 GB, con pérdida de calidad notable en Q2_K y Q3_K_M (el propio autor marca Q3_K_M como "lower quality").
- Cuantizaciones de 4 bits (IQ4_XS, Q4_K_S, Q4_K_M): 1,3-1,4 GB. Son las que el autor recomienda por velocidad y equilibrio; el consumo conjunto con el proyector ronda los 2-2,5 GB.
- Cuantizaciones de 5-6 bits (Q5_K_S, Q5_K_M, Q6_K): 1,5-1,7 GB. Q6_K está marcada como "very good quality".
- Q8_0 y f16: 2,1 GB y 3,9 GB respectivamente. Con el proyector mmproj-f16 (0,8 GB), f16 requiere alrededor de 5-6 GB de memoria.
- GPU de consumo compatibles: cualquier GPU con 6 GB o más (GTX 1660, RTX 2060/3060, RTX 4060/4070/4090) puede ejecutar las cuantizaciones de 4 bits con margen amplio. En 4 GB de VRAM caben Q4_K_S, Q4_K_M e IQ4_XS si se limita el contexto y se usa mmproj-Q8_0.
- Ejecución en CPU y dispositivos pequeños: las cuantizaciones de 2-4 bits son viables en CPU con 8-16 GB de RAM e incluso en placas tipo Raspberry Pi 5 con 8 GB, con latencias altas no cuantificadas.
- GPU de centro de datos: A100, H100 o L40S no aportan ventaja relevante para un modelo de 1,88 B; el cuello de botella sería el procesamiento de imágenes y la latencia de red, no la memoria.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio para los ficheros GGUF (requieren cargar también el mmproj correspondiente para tareas de visión); vLLM o TGI solo si se parte del modelo base en safetensors, no de este repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por imagen.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparación es estructural. Las cifras de las alternativas proceden de conocimiento general de sus fichas públicas y conviene verificarlas en las fuentes oficiales antes de tomar una decisión.

| Modelo | Parametros | Vision | Contexto | Licencia | GGUF disponible |
|---|---|---|---|---|---|
| mradermacher/decider-2b-vision-GGUF (base Mapika/decider-2b-vision) | 1,88 B | Si (mmproj) | no disponible | apache-2.0 | Si, 10 niveles de cuantizacion |
| Qwen2-VL-2B-Instruct | ~2,2 B | Si | no disponible en esta ficha (consultar la ficha oficial) | apache-2.0 | Si, mediante terceros |
| SmolVLM-2.25B-Instruct | ~2,25 B | Si | no disponible en esta ficha (consultar la ficha oficial) | apache-2.0 | Si, mediante terceros |
| InternVL2-2B | ~2,2 B (InternViT-300M + InternLM2-1.8B) | Si | no disponible en esta ficha (consultar la ficha oficial) | MIT | Si, mediante terceros |

Diferencias destacables: el modelo de Mapika se posiciona como modelo de decisión con salida estructurada y calibrada, mientras que las alternativas son asistentes visuales de propósito general con generación de texto libre. Para tareas de clasificación o extracción con formato fijo, esa especialización puede ser una ventaja; para diálogo abierto o razonamiento complejo, no hay evidencia publicada que permita comparar.

## Limitaciones y advertencias

- Idiomas: solo inglés declarado. No hay soporte confirmado de castellano ni de otras lenguas.
- Ausencia de validación pública: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay benchmarks publicados, por lo que el comportamiento real del modelo no está verificado de forma independiente.
- Trazabilidad limitada: la model card del modelo base Mapika/decider-2b-vision no se incluye en la información disponible, de modo que se desconocen el dataset de entrenamiento, el método de calibración y el formato exacto de las salidas estructuradas.
- Pérdida por cuantización: las versiones Q2_K, Q3_K_S y Q3_K_M degradan la calidad de forma apreciable; el propio autor marca Q3_K_M como de calidad inferior. Para tareas de decisión con umbrales ajustados, conviene usar Q4_K_M o superior.
- Riesgo de alucinación en salidas estructuradas: un modelo de decisión pequeño puede emitir etiquetas o valores plausibles pero incorrectos, especialmente sobre imágenes fuera de la distribución de entrenamiento. Es imprescindible validar el esquema de salida y definir una ruta de escalado o abstención.
- Calibración no garantizada tras la cuantización: aunque el modelo base esté etiquetado como "calibrated", no hay datos que confirmen que las probabilidades se mantengan calibradas en las versiones GGUF de 2-4 bits.
- Resolución y formato de imagen: no disponible. Se desconoce el rango de resoluciones soportado y el preprocesado esperado por el proyector multimodal.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede planificar el uso con documentos largos o conversaciones multi-turno extensas.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero las cuantizaciones derivan de un modelo base cuya ficha no se ha podido verificar; conviene revisar la licencia del repositorio original antes de un despliegue en producción.
- Ruido en la búsqueda web: los resultados obtenidos no guardan relación con este modelo (herramientas de terminal, harness de agentes y documentación de GitHub Copilot), por lo que no aportan información técnica utilizable.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/decider-2b-vision-GGUF
- Modelo base: https://huggingface.co/Mapika/decider-2b-vision
- Página de descargas del cuantizador para este modelo: https://hf.tst.eu/model#decider-2b-vision-GGUF
- Preguntas frecuentes y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafo comparativo de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Paper, blog o demo del modelo base: no disponible
