# DAIR-Group/ExpertHTR

## Resumen

ExpertHTR es un modelo de reconocimiento de texto manuscrito (HTR) a nivel de página desarrollado por DAIR-Group. Se trata de un checkpoint de fine-tuning basado en Qwen3.5-0.8B-Base, al que se le añaden cuatro expertos enrutados y un experto compartido en las capas 1, 5, 9, 13, 17 y 21, formando una arquitectura de mezcla dispersa de expertos (sparse MoE). El modelo resuelve el problema de transcribir páginas manuscritas completas, incluyendo símbolos OCR especiales como `<del>` y `<gap>`, y está diseñado para la investigación en humanidades digitales y digitalización de archivos.

El checkpoint seleccionado corresponde al paso de entrenamiento 1914 y fue validado sobre 962 páginas, alcanzando una tasa de error de carácter (CER) del 16,439% y una tasa de error de palabra (WER) del 33,300%. Aunque el tamaño total de parámetros no se especifica, el modelo base tiene 0.8B parámetros y el repositorio pesa 2.3 GB. La longitud de contexto no está disponible en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-to-text) con mezcla dispersa de expertos (sparse MoE) basado en Qwen3.5-0.8B-Base |
| Parámetros totales | No disponible (modelo base de 0.8B más expertos añadidos) |
| Parámetros activos | No disponible (arquitectura MoE con cuatro expertos enrutados y un experto compartido por capa) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio contiene pesos en formato custom full_model_state.pt) |
| Idiomas soportados | No disponible (el modelo está entrenado para reconocimiento de texto manuscrito; no se especifican idiomas) |
| Licencia | Código Apache-2.0; pesos y datos de entrenamiento con licencias upstream no especificadas |
| Formato de pesos | full_model_state.pt (formato custom ExpertHTR, no compatible con Transformers genérico) |

## Arquitectura y entrenamiento

La arquitectura de ExpertHTR parte del modelo Qwen3.5-0.8B-Base y lo extiende con capas de mezcla dispersa de expertos: en las capas 1, 5, 9, 13, 17 y 21 se insertan cuatro expertos enrutados y un experto compartido. Esta configuración permite activar solo una fracción de los parámetros durante la inferencia, manteniendo la capacidad del modelo sin disparar el coste computacional. El modelo procesa imágenes de páginas manuscritas y genera su transcripción en texto, utilizando el pipeline image-to-text.

El entrenamiento se realizó sobre un experimento de siete fuentes originales, que incluye el dataset HWDB2.0, entre otros. El checkpoint seleccionado es el paso 1914, elegido por validación. El dataset acompañante publicado en HuggingFace (ExpertHTR-Dataset) está restringido y no reproduce exactamente los datos de entrenamiento originales, por lo que no debe atribuirse el rendimiento del modelo únicamente a ese dataset. No se menciona el uso de RLHF ni DPO en la información disponible.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) a nivel de página: transcribe páginas completas de documentos manuscritos a texto.
- OCR multimodal: acepta imágenes como entrada y genera texto como salida (pipeline image-to-text).
- Manejo de símbolos de transcripción: conserva marcadores especiales como `<del>` (eliminación) y `<gap>` (espacio en blanco) como símbolos OCR distintos.
- Eficiencia computacional: la arquitectura sparse MoE activa solo una parte de los parámetros en cada capa, reduciendo el coste de inferencia en comparación con un modelo denso equivalente.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, generación de código, matemáticas ni soporte multilingüe en la información proporcionada.

## Casos de uso

- Digitalización de archivos históricos manuscritos: el modelo puede transcribir automáticamente páginas de manuscritos históricos (por ejemplo, los documentos Bentham) para crear versiones digitales buscables. Su diseño a nivel de página y su manejo de símbolos `<del>` y `<gap>` resultan útiles para preservar la estructura original del texto.
- Investigación en humanidades digitales: los investigadores pueden procesar colecciones de cartas o diarios manuscritos para extraer texto y analizarlo con técnicas de NLP. La arquitectura MoE permite procesar lotes grandes de imágenes con un coste computacional moderado.
- Automatización de entrada de datos en formularios manuscritos: en entornos administrativos, el modelo puede convertir formularios manuscritos en texto digital para su posterior validación humana. Su tasa de error de carácter (16,439%) hace necesaria una revisión posterior.
- Análisis de correspondencia en bibliotecas digitales: bibliotecas y archivos pueden usar el modelo para indexar colecciones de cartas manuscritas, facilitando la búsqueda por contenido. El pipeline image-to-text permite integrarlo en flujos de trabajo de digitalización.
- Asistencia para personas con discapacidad visual: el modelo puede combinarse con sistemas de accesibilidad para leer en voz alta documentos manuscritos escaneados, siempre que se supervise la salida para evitar errores de transcripción.
- Procesamiento de notas manuscritas en entornos académicos: investigadores y estudiantes pueden digitalizar sus propias notas manuscritas para convertirlas en texto editable, aprovechando la capacidad del modelo para manejar símbolos de borrado y espacios.
- Reconocimiento de escritura en documentos legales antiguos: en el ámbito de la historia del derecho, el modelo puede ayudar a transcribir sentencias o contratos manuscritos, aunque se requiere revisión humana debido a la posibilidad de errores.
- Generación de datasets de HTR: el modelo puede utilizarse para preetiquetar nuevas colecciones de manuscritos, generando transcripciones iniciales que luego se corrigen manualmente, acelerando la creación de datasets de entrenamiento.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Páginas de validación | 962 |
| Micro CER de página | 16,439% |
| Micro WER de página | 33,300% |

El CER elimina solo el marcador de región inicial `[Rk]:`. Los símbolos `<del>` y `<gap>` se mantienen como símbolos OCR distintos. No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio pesa 2.3 GB, lo que sugiere que los pesos podrían caber en GPUs de consumo, pero no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? no se puede confirmar sin datos oficiales. El tamaño del repositorio (2.3 GB) es compatible con GPUs de consumo de gama media, pero el formato custom y el uso del repositorio ExpertHTR pueden requerir consideraciones adicionales.
- Opciones de despliegue: el modelo se despliega mediante el repositorio ExpertHTR, siguiendo las instrucciones de evaluación (`experthtr final-test`). No se recomienda cargarlo como checkpoint genérico de Transformers. No se mencionan opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información comparativa en los datos proporcionados. El modelo no se ha comparado con alternativas como TrOCR u otros modelos HTR en la documentación disponible.

## Limitaciones y advertencias

- El modelo puede cometer errores de transcripción; no debe utilizarse para decisiones de alto riesgo sin revisión humana.
- El dataset acompañante (ExpertHTR-Dataset) no reproduce exactamente los datos de entrenamiento originales, que incluyen HWDB2.0 y otras fuentes. No debe describirse el checkpoint como entrenado solo con Bentham ni atribuir el rendimiento al dataset gated.
- Los términos de licencia de los datasets upstream deben respetarse. La model card no otorga derechos sobre los datos de entrenamiento.
- El formato de pesos es custom (`full_model_state.pt`) y no es compatible con la carga genérica de Transformers. Es necesario mantener juntos el tokenizer, el processor, el manifest y la versión del repositorio.
- No se han documentado sesgos específicos, pero al estar entrenado en un conjunto de fuentes concretas (HWDB2.0, etc.), el rendimiento puede degradarse en estilos de escritura no representados en el entrenamiento.
- La licencia de los pesos no está explícitamente definida; el código es Apache-2.0, pero los pesos y datos conservan licencias upstream no especificadas, lo que puede limitar el uso comercial.

## Enlaces

- HuggingFace: https://huggingface.co/DAIR-Group/ExpertHTR
- Repositorio de código: https://github.com/DAIR-Group/ExpertHTR
- Dataset: https://huggingface.co/datasets/DAIR-Group/ExpertHTR-Dataset
- Demo: https://huggingface.co/spaces/DAIR-Group/ExpertHTR
