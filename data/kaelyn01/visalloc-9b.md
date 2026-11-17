# Kaelyn01/VisAlloc-9B

## Resumen

VisAlloc-9B es un modelo de lenguaje multimodal (image-text-to-text) desarrollado por Kaelyn01, construido sobre la familia Qwen/Qwen3.5-9B mediante el framework de auto-destilacion visual VisAlloc, presentado en el articulo *VisAlloc: Allocating Visual Supervision for On-Policy Self-Distillation*. El modelo resuelve el problema de la supervision visual poco selectiva en el ajuste fino multimodal: en lugar de supervisar todos los tokens de una respuesta por igual, asigna pesos a nivel de token segun la sensibilidad de la evidencia visual, de modo que el modelo aprende a fijarse en las regiones de la imagen que realmente sustentan la respuesta correcta.

La innovacion central es el uso de dos vistas docentes emparejadas durante el entrenamiento: un recorte centrado en la evidencia (positivo) y un recorte espacialmente desplazado (negativo). Solo se retienen ejemplos en los que el docente acierta con el recorte positivo y falla con el negativo, y la discrepancia entre ambas vistas determina el peso de destilacion de cada token. En inferencia, el modelo consume la imagen completa, sin necesidad de recortes ni herramientas de zoom.

El modelo tiene 9.409.813.744 parametros en pesos BF16 (18,8 GB de repositorio), admite instrucciones conversacionales en ingles y chino, y se distribuye con licencia Apache 2.0. Es relevante para quienes trabajan en comprension visual de grano fino (VQA sobre documentos, interfaces, escenas densas) y quieren un modelo de ~9B con pesos abiertos, plantilla de chat y soporte directo en transformers y vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) sobre Qwen/Qwen3.5-9B; vision-language con procesador de imagen y plantilla de chat |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 publicado; cuantizaciones GGUF/AWQ/GPTQ no disponibles en la informacion proporcionada |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), configuracion de modelo, tokenizer, processor y chat template |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B y anade la torre visual y el procesador propios de la familia Qwen3.5 para entrada image-text-to-text. La arquitectura subyacente es un transformer multimodal con atencion estandar; no se especifica en la informacion disponible si incorpora variantes como atencion lineal, SSM o mezcla de expertos, por lo que se asume la del modelo base. El entrenamiento se realiza con el framework VisAlloc en cinco etapas: (1) construccion y filtrado de vistas emparejadas, (2) trayectoria estudiantil compartida sobre la imagen completa, (3) asignacion de pesos a nivel de token, (4) destilacion desde el docente positivo y (5) regularizacion EMA.

Los datos proceden de VisAlloc-6K, derivado de Vision-OPD-6K: de 6.241 pares fuente se retuvieron 5.795 ejemplos tras el filtro de calidad (docente acierta con recorte positivo y falla con recorte negativo). El objetivo es una JSD ponderada a nivel de token con coeficiente de mezcla 0,5, calculada sobre el top-100 de vocabulario seleccionado por el estudiante mas un bucket residual de cola. La asignacion combina una base continua de sensibilidad con peso adicional admitido por sensibilidad o por desacuerdo entre docentes (JSD), bajo puertas de contexto congelado, bigramas de plantilla y JSD estudiante-docente; una redistribucion por frecuencia inversa preserva el peso total adicional dentro de cada micro-lote antes de la normalizacion por media. La fuerza del peso adicional es 2,0, la tasa EMA del docente es 0,05 (actualizado una vez tras la actualizacion del actor), el rollout es de hasta 1.024 tokens y se entrena 1 epoca. Los pesos liberados son safetensors en BF16.

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de imagen y pregunta.
- Comprension visual de grano fino: identificacion de objetos, etiquetas, colores y detalles en escenas densas.
- Respuesta a preguntas visuales (VQA) sobre la imagen completa, sin recortes ni herramientas de zoom en inferencia.
- Conversacion multi-turno mediante plantilla de chat y formato de mensajes con contenido mixto imagen/texto.
- Soporte multilingue limitado a ingles y chino.
- Integracion con `transformers` (`AutoModelForImageTextToText`, `AutoProcessor`) y con vLLM mediante API compatible con OpenAI.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio ni video en la informacion disponible.

## Casos de uso

- Inspeccion visual de documentos e interfaces: el modelo responde preguntas sobre capturas de pantalla, formularios o diagramas usando la imagen completa, lo que encaja con tareas de extraccion de datos y verificacion de campos sin preprocesado de recortes.
- Control de calidad en catalogos de producto: verificar atributos (color de etiqueta, texto de envase, posicion de elementos) directamente sobre la foto del articulo, aprovechando el entrenamiento con supervision centrada en evidencia.
- Asistencia a usuarios sobre imagenes en soporte tecnico: el usuario envia una foto de un error o dispositivo y el modelo responde en ingles o chino con conversaciones multi-turno gestionadas por la plantilla de chat.
- Analisis de imagenes medicas o tecnicas de apoyo (no diagnostico): descripcion de hallazgos visibles y localizacion de detalles concretos, con la advertencia de que no sustituye validacion profesional.
- Automatizacion de accesibilidad: generar descripciones y respuestas sobre el contenido visual de una imagen para lectores de pantalla o resumenes alternativos.
- Despliegue en pipelines de investigacion multimodal: servir el modelo con vLLM (`vllm serve Kaelyn01/VisAlloc-9B --port 8000`) para experimentos de VQA de grano fino y comparacion con el modelo base.
- Evaluacion de tecnicas de destilacion: usar los pesos liberados como referencia para reproducir o comparar el framework VisAlloc frente a ajuste fino supervisado convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 19-20 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 24 GB.
- En cuantizacion de 8 bits: en torno a 10-11 GB de pesos; en 4 bits: en torno a 5-6 GB, aunque no se confirma la disponibilidad de pesos cuantizados oficiales.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para produccion en BF16; RTX 4090 (24 GB) para inferencia en BF16 justa o con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en BF16 con margen limitado y en GPUs de 16 GB solo mediante cuantizacion.
- Opciones de despliegue: `transformers` (>=5.16.1) con accelerate, y vLLM con API compatible con OpenAI; no se documentan integraciones con llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| VisAlloc-9B | 9.409.813.744 | No disponible | Apache 2.0 | safetensors BF16 | Destilacion visual con vistas emparejadas; en/zh |
| VisAlloc-4B | No disponible | No disponible | No disponible | No disponible | Variante menor del mismo framework, publicada por el mismo autor |
| Qwen/Qwen3.5-9B | No disponible | No disponible | No disponible | No disponible | Modelo base sobre el que se construye VisAlloc-9B |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Qwen3.5-9B y de Vision-OPD-6K, puede heredar sesgos de esos datos.
- Riesgo de alucinacion: presente como en cualquier LLM multimodal; la supervision selectiva reduce pero no elimina respuestas no sustentadas en la imagen.
- Cobertura linguistica limitada a ingles y chino; el rendimiento en castellano no esta garantizado.
- Longitud de contexto no especificada: planificar las cargas de imagen y texto sin asumir una ventana concreta.
- No se documentan capacidades de tool calling, agentes ni modo thinking; no asumirlas en produccion.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B y de los datos de entrenamiento.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: madurez y soporte comunitario limitados; validar exhaustivamente antes de desplegar.
- Requiere `transformers>=5.16.1`; versiones anteriores pueden no cargar la arquitectura correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaelyn01/VisAlloc-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/Kaelyn01/VisAlloc-6K
- Variante VisAlloc-4B: https://huggingface.co/Kaelyn01/VisAlloc-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset origen Vision-OPD-6K: https://huggingface.co/datasets/yuanqianhao/Vision-OPD-6K
- Articulo referenciado (arXiv 2605.18740): no disponible como URL verificada en la informacion proporcionada
