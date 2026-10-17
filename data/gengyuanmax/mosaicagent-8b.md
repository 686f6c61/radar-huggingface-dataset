# gengyuanmax/MosaicAgent-8B

## Resumen

MosaicAgent-8B es un ajuste fino multimodal publicado por el usuario gengyuanmax sobre Qwen/Qwen3-VL-8B-Instruct. El checkpoint contiene 8.767.123.696 parámetros y se distribuye en safetensors BF16, con 4 shards y 750 tensores, en un repositorio de 17,5 GB. La licencia declarada es Apache 2.0 y el pipeline es image-text-to-text.

El modelo no es una copia sin cambios del VLM base: está entrenado para operar un espacio de trabajo de imágenes denominado Mosaic. En ese bucle, el agente puede solicitar recortes mediante una herramienta, recibir imágenes generadas por la herramienta y continuar el razonamiento con la información visual resultante. Esto aborda el problema de resolver detalles finos y comparaciones entre varias imágenes cuando una sola pasada de visión no basta.

Su relevancia actual está en los flujos agenticos visuales y en la evaluación reproducible con MosaicBench. Sin embargo, la model card no publica resultados de benchmarks de precisión, longitud de contexto ni idiomas, y las únicas comprobaciones descritas son funcionales: carga en BF16, generación con dos imágenes y una llamada a la herramienta de recorte en una RTX A6000. La ficha debe leerse con esa cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration; modelo vision-language image-text-to-text; composición interna no detallada en la información proporcionada |
| Parámetros totales | 8.767.123.696 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; pesos publicados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; 4 shards; 750 tensores; BF16 |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct (fine-tune) |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 17,5 GB |
| Fecha de creación | 2026-10-17 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El checkpoint es un ajuste fino de Qwen3-VL-8B-Instruct y utiliza la clase `Qwen3VLForConditionalGeneration`. Los pesos se almacenan en BF16, con 750 tensores repartidos en cuatro shards safetensors; el tokenizador, la configuración del procesador de imagen y vídeo y la plantilla de chat acompañan a los pesos. La model card indica explícitamente que se trata de pesos ajustados, no del modelo upstream sin modificaciones.

No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. MosaicBench se presenta como datos de evaluación, no como el dataset de entrenamiento de este checkpoint. La innovación documentada es el entrenamiento para usar el espacio de trabajo de imágenes Mosaic: el modelo puede pedir recortes, recibir imágenes generadas por la herramienta y continuar el bucle. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal. El autor indica que el mapeo exacto entre este checkpoint y los resultados del paper se gestiona por separado.

## Capacidades

- Generación image-text-to-text: responde a preguntas sobre imágenes y mantiene conversaciones multimodales.
- Soporte multi-imagen: la carga y la generación con dos imágenes se verificaron en una RTX A6000.
- Uso del espacio de trabajo Mosaic: puede solicitar recortes de regiones concretas y recibir la imagen generada por la herramienta.
- Tool calling dentro del ecosistema Mosaic: el runner ejecuta las herramientas y devuelve las imágenes al modelo; una llamada de generación de texto por sí sola no ejecuta el workspace.
- Razonamiento visual multi-paso: el bucle herramienta-modelo permite iterar sobre recortes y respuestas, aunque no hay una evaluación publicada de precisión.
- Capacidades heredadas del modelo base: al derivar de Qwen3-VL-8B-Instruct, cabe esperar generación de texto y comprensión visual general, pero no se detallan en la información proporcionada.
- Idiomas: no disponible.
- No se documentan capacidades de audio ni un modo de razonamiento explícito tipo thinking.

## Casos de uso

- Análisis de documentos multi-página: el agente recibe varias páginas, solicita recortes de tablas o firmas y responde con las regiones relevantes. Es adecuado porque el flujo Mosaic permite inspeccionar detalles sin reenviar la imagen completa en cada paso.
- Comparación de capturas de interfaz antes y después: carga dos imágenes, recorta componentes concretos y señala diferencias visuales. Útil en QA de front-end y revisión de regresiones, siempre con revisión humana.
- Catálogos de producto con varias imágenes: compara vistas, extrae atributos y detecta inconsistencias entre fotos. La ventana multi-imagen y el recorte ayudan a enfocar etiquetas y detalles.
- Inventario y estanterías: recibe imágenes de varias cámaras, pide recortes de zonas y enumera productos visibles. Adecuado para pilotos de inspección, no para decisiones autónomas de alto riesgo.
- Asistente de anotación visual: propone regiones de interés y etiquetas para que un humano valide; la herramienta de recorte permite refinar la región antes de etiquetar.
- Evaluación de agentes visuales: ejecutar MosaicBench con el runner Mosaic para medir el uso de herramientas y la calidad de las respuestas en un entorno reproducible.
- Análisis de figuras técnicas y científicas: varias figuras, recortes de ejes y leyendas, y respuesta comparativa. Sirve como apoyo a la revisión, no sustituye la validación del experto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card sí describe comprobaciones funcionales limitadas, que no deben interpretarse como una evaluación de precisión:

| Prueba | Entorno | Resultado |
|---|---|---|
| Carga en BF16 | NVIDIA RTX A6000, Transformers 4.57.1, PyTorch 2.6.0 | correcta |
| Generación con dos imágenes | mismo entorno | correcta |
| Llamada a herramienta de recorte, recepción de imagen y respuesta final | mismo entorno | completada |
| Revisión de índice, shards, inventario de tensores y metadatos | archivo del modelo | realizada por el autor |

## Requisitos de hardware

| Escenario | VRAM estimada | Notas |
|---|---|---|
| BF16, una imagen y contexto corto | 20-24 GB | estimación a partir de los 17,5 GB de pesos; no validado |
| BF16, varias imágenes y contexto largo | 32-48 GB | validado en RTX A6000 de 48 GB solo para prueba funcional |
| Cuantización 4 u 8 bits | no disponible | no hay cuantizaciones oficiales publicadas |

- GPU validadas: NVIDIA RTX A6000 de 48 GB, con Transformers 4.57.1 y PyTorch 2.6.0.
- GPU recomendadas para producción: A100 de 40 u 80 GB, H100 de 80 GB o GPUs con al menos 48 GB para trabajar en BF16 con varias imágenes.
- GPU de consumo: una RTX 4090 de 24 GB puede cargar los pesos BF16, pero el margen para activaciones, caché KV y varias imágenes es estrecho; no hay validación publicada en esa GPU.
- Despliegue: vLLM con soporte Qwen3-VL y `--dtype bfloat16`; Transformers; runner Mosaic para ejecutar herramientas. No se han validado llama.cpp, Ollama ni TGI en la información disponible.
- La configuración original declara float32 aunque los tensores almacenados son BF16; debe forzarse BF16 de forma explícita.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MosaicAgent-8B | 8.767.123.696 | no disponible | no disponible | Apache 2.0 | HuggingFace |
| Qwen3-VL-8B-Instruct | 8B (nominal) | no disponible | no disponible | Apache 2.0 | HuggingFace |

No se han identificado en la información proporcionada otras alternativas de 7-9B con espacio de trabajo de imagen y datos verificables. La comparación principal disponible es contra el modelo base, que no incluye el entrenamiento específico para el workspace Mosaic.

## Limitaciones y advertencias

- El modelo puede producir respuestas incorrectas o argumentos de herramientas erróneos, según la propia model card.
- No ha sido validado para decisiones médicas, legales ni otras situaciones de alto riesgo.
- No hay una evaluación publicada de precisión; las pruebas descritas son funcionales y no demuestran calidad en benchmarks.
- El uso de herramientas requiere el runner Mosaic; una llamada de generación de texto no ejecuta el espacio de trabajo de imágenes.
- No se documentan longitud de contexto, idiomas soportados, datos de entrenamiento ni evaluaciones de sesgo.
- Las pruebas de protocolo en CPU del runner Mosaic usan un endpoint simulado y no demuestran la calidad del checkpoint.
- No se distribuyen cuantizaciones oficiales; cualquier conversión a GGUF, AWQ u otro formato no está validada en la información disponible.
- La licencia Apache 2.0 permite uso comercial con atribución, pero los datasets de terceros conservan sus propios términos.
- El crédito del modelo base corresponde al equipo de Qwen; esta release contiene las modificaciones de ajuste fino de Mosaic.

## Enlaces

- [HuggingFace: gengyuanmax/MosaicAgent-8B](https://huggingface.co/gengyuanmax/MosaicAgent-8B)
- [Código Mosaic en GitHub](https://github.com/gengyuanmax/Mosaic)
- [Dataset MosaicBench](https://huggingface.co/datasets/gengyuanmax/MosaicBench)
- [Paper en arXiv](https://arxiv.org/abs/2609.39363)
- [Modelo base Qwen3-VL-8B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct)
