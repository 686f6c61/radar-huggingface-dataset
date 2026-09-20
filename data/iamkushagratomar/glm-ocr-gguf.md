# iamkushagratomar/glm-ocr-gguf

## Resumen

GLM-OCR GGUF es una conversión comunitaria al formato GGUF del modelo GLM-OCR, desarrollado originalmente por zai-org (Zhipu AI / Z.ai). Se trata de un modelo de visión-lenguaje (pipeline `image-text-to-text`) especializado en reconocimiento óptico de caracteres: recibe una imagen de una página, un formulario o una captura y devuelve el texto contenido en ella. Esta ficha describe concretamente el repositorio de cuantizaciones publicado por el usuario iamkushagratomar, que no introduce ningún ajuste fino ni modificación de los pesos, sino únicamente la conversión y cuantización de los pesos originales.

El interés de esta publicación es práctico: permite ejecutar un modelo OCR multimodal en `llama.cpp` y runtimes compatibles sobre hardware modesto. El checkpoint original tiene 891.138.048 parámetros (aproximadamente 0,89 mil millones, por debajo de la barrera de 1B), y el repositorio ofrece ocho variantes que van desde F16 (~1,9 GB) hasta Q3_K_S (~0,47 GB). Según la propia model card, una GPU de 4 GB es suficiente para la variante Q8_0 con una longitud de contexto moderada.

La relevancia actual del repositorio es doble. Por un lado, democratiza el acceso a un OCR multimodal de menos de 1B parámetros en entornos sin aceleradores de gama alta o incluso en CPU. Por otro, advierte de un problema específico de este dominio: el OCR es especialmente sensible a la cuantización, porque un solo carácter erróneo cuenta como fallo, de modo que la model card recomienda explícitamente Q8_0 como opción por defecto y desaconseja las variantes Q3 salvo en escenarios con memoria muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo de visión-lenguaje (image-text-to-text) con torre de visión y decodificador de lenguaje, según la model card del repositorio base zai-org/GLM-OCR |
| Parámetros totales | 891.138.048 (dato del checkpoint original en safetensors) |
| Parámetros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible. Los ejemplos de la model card usan `-c 4096` y `-c 8192` como ajustes de ejecución en llama.cpp, no como contexto nativo documentado |
| Tipos de cuantización | F16, Q8_0, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_M, Q3_K_S |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | MIT (según los metadatos del repositorio; la model card remite a la licencia del modelo base como texto autoritativo) |
| Formato de pesos | GGUF (los originales están en safetensors) |
| Relación con el modelo base | Cuantización de zai-org/GLM-OCR (`base_model_relation: quantized`) |
| Tamaño del repositorio | 6,2 GB |
| Fichero mmproj (proyector de visión) | No listado en el repositorio según la información disponible; el nombre usado en los ejemplos es un marcador de posición |

## Arquitectura y entrenamiento

No se dispone de información técnica detallada sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. Lo único documentado es que GLM-OCR es un modelo de visión-lenguaje: combina un codificador de visión con un decodificador de lenguaje y se expone con el pipeline `image-text-to-text`. La model card del repositorio de cuantizaciones remite explícitamente a la model card original de zai-org/GLM-OCR para consultar arquitectura, detalles de entrenamiento, uso previsto y términos de licencia, por lo que cualquier dato de esa naturaleza debe verificarse allí.

El proceso de conversión sí está documentado y es reproducible: los pesos se convirtieron desde el checkpoint de Hugging Face con `convert_hf_to_gguf.py --outtype f16`, y las variantes cuantizadas se generaron después con `llama-quantize` a partir del fichero F16, sin importance matrix. No se aplicó ningún ajuste fino ni otra modificación de los pesos. La innovación relevante aquí no es arquitectónica sino de despliegue: llevar un VLM especializado en OCR a un formato que `llama.cpp` puede ejecutar, con variantes que cubren desde ~1,9 GB hasta ~0,47 GB.

Conviene subrayar un punto crítico de la conversión: la model card indica que, para procesar imágenes, se necesita adicionalmente el fichero `mmproj` del proyector de visión, y que el nombre citado en los ejemplos es un marcador de posición. Si ese fichero no aparece en la pestaña de archivos del repositorio, los GGUF publicados solo pueden usarse como decodificadores de texto, es decir, sin capacidad OCR real.

## Capacidades

- Reconocimiento óptico de caracteres sobre imágenes de páginas, formularios, capturas y documentos escaneados, devolviendo el texto extraído.
- Procesamiento multimodal de entrada imagen + texto (pipeline `image-text-to-text`), permitiendo prompts de instrucción como «extrae todo el texto de esta imagen».
- Generación de texto como decodificador de lenguaje, operativo de forma independiente mediante `llama-cli` para comprobaciones de funcionamiento.
- Conversación multi-turno: el repositorio está etiquetado como `conversational` y compatible con endpoints.
- Capacidad multilingüe limitada a inglés y chino según los metadatos de idioma.
- Ejecución local en CPU y GPU a través de `llama.cpp`, con servidor compatible con la API de OpenAI (`llama-server`).
- Capacidad de visión condicionada: solo disponible si se dispone del fichero `mmproj` del proyector de visión y de una compilación de `llama.cpp` que soporte la torre de visión de esta arquitectura.
- No se documentan capacidades de tool calling, function calling, agentes, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Digitalización de archivos históricos o administrativos: el modelo puede extraer texto de imágenes de páginas escaneadas y alimentar un pipeline posterior de indexación o búsqueda. Es adecuado porque su tamaño inferior a 1B permite ejecutarlo en servidores modestos, aunque la calidad en escaneos de baja resolución depende del modelo original y del prompt.
- Extracción de campos en facturas y albaranes: se le pasa la imagen del documento y una instrucción de extracción; el texto resultante se parsea después con reglas o expresiones regulares. La variante Q8_0 es la recomendada por la propia model card para tareas de OCR donde un carácter erróneo invalida el resultado.
- Preprocesado para pipelines RAG sobre documentación escaneada: el modelo convierte PDFs imagen a texto que después se trocea y se embebe en una base vectorial. Encaja bien porque puede servirse con `llama-server` con una API compatible con OpenAI y encadenarse con el resto del stack.
- Automatización de atención al cliente sobre capturas de pantalla: el usuario envía una imagen con un error o un recibo y el sistema extrae el texto para clasificar la incidencia. El etiquetado `conversational` y la compatibilidad con endpoints facilitan integrarlo en un flujo de conversación multi-turno.
- Procesamiento en el borde o en equipos de oficina sin GPU dedicada: con variantes de ~0,5 a 0,6 GB (Q4_K_M, Q3_K_M) el modelo puede ejecutarse en CPU o en GPU integradas para tareas de OCR no críticas. Es un escenario realista precisamente por el tamaño reducido de los ficheros.
- Extracción de texto de capturas para accesibilidad o traducción: se extrae el texto de una imagen y se pasa a un traductor o a un lector de pantalla. La limitación a inglés y chino restringe el alcance a esos dos idiomas.
- Prototipado e investigación en OCR multimodal: al ser una conversión GGUF reproducible con un pipeline documentado, sirve para experimentar con la degradación de calidad según el nivel de cuantización en una tarea sensible a errores de carácter.
- Comprobación de integración de una arquitectura nueva en `llama.cpp`: el repositorio documenta los comandos de conversión y cuantización, lo que resulta útil para validar soporte de arquitectura en builds recientes y detectar problemas de compatibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantizaciones no incluye métricas de MMLU, HumanEval, GSM8K, OCRBench ni de ningún otro conjunto de evaluación, ni comparaciones numéricas con modelos alternativos. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia, según el tamaño de fichero indicado por el autor: F16 ~1,9 GB; Q8_0 ~1,0 GB; Q5_K_M ~0,7 GB; Q5_K_S ~0,66 GB; Q4_K_M ~0,6 GB; Q4_K_S ~0,57 GB; Q3_K_M ~0,5 GB; Q3_K_S ~0,47 GB. A estas cifras hay que sumar el espacio de la caché KV.
- La model card afirma que una GPU de 4 GB es suficiente para Q8_0 con una longitud de contexto modesta, lo que sitúa el modelo en el rango de GPU de consumo y de gama de entrada.
- No se especifican modelos de GPU concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- Advertencia de memoria relevante: las entradas de imagen generan muchos tokens, por lo que la caché KV crece rápidamente. Si aparecen errores de falta de memoria, el autor recomienda reducir el contexto (`-c 4096`) o descargar menos capas (`-ngl`).
- Opciones de despliegue documentadas: `llama.cpp` compilado con `-DGGML_CUDA=ON` o en modo solo CPU, usando `llama-cli` para comprobaciones de texto, `llama-mtmd-cli` para entrada de imagen y `llama-server` para servir una API compatible con OpenAI. Se requiere una compilación reciente de `llama.cpp`, ya que el soporte de esta arquitectura es nuevo y las builds antiguas pueden fallar al cargar el modelo.
- Otros runtimes compatibles con GGUF (por ejemplo Ollama o LM Studio) no se mencionan explícitamente en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de especificaciones ni de rendimiento de modelos comparables dentro de la información proporcionada, por lo que no es posible construir una comparación numérica fiable. Como categoría de referencia, este modelo compite con otros OCR multimodales ligeros y con modelos de visión-lenguaje de menos de 3B parámetros, pero los valores de parámetros, contexto, benchmarks y licencia de esas alternativas no están disponibles en esta búsqueda.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GLM-OCR GGUF (este repositorio) | 891.138.048 | No disponible | MIT | GGUF en Hugging Face, 8 cuantizaciones |
| Alternativas de OCR multimodal de tamaño similar | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La cuantización introduce diferencias numéricas respecto al checkpoint original: las salidas no son idénticas a las de precisión completa y los ficheros de menor número de bits cometen más errores a nivel de carácter.
- Las variantes Q3_K_M y Q3_K_S están señaladas por el propio autor como propensas a errores de carácter, tokens repetidos y salida corrupta en texto denso o de tamaño pequeño. No se recomiendan para producción.
- La precisión en escritura manuscrita, escaneos de baja resolución, tablas densas y maquetaciones complejas depende en gran medida del modelo original y del prompt utilizado, y no está cuantificada.
- Riesgo de alucinación: no se documenta explícitamente, pero al ser un modelo generativo aplicado a extracción de texto, la verificación humana del resultado es obligatoria en contextos donde un error tenga consecuencias.
- La model card insiste en verificar siempre la salida del OCR antes de usarla en ámbitos financieros, legales o médicos.
- Idiomas soportados limitados a inglés y chino; no hay soporte declarado de castellano ni de otras lenguas.
- Estado incierto del soporte de visión: si el fichero `mmproj` no está incluido en el repositorio, los GGUF solo funcionan como decodificadores de texto y no pueden procesar imágenes. El nombre de fichero usado en los ejemplos es un marcador de posición.
- Requiere una compilación reciente de `llama.cpp`; las versiones antiguas pueden no cargar la arquitectura.
- Licencia: los metadatos del repositorio declaran MIT, pero la propia model card advierte de que los ficheros derivan del modelo original y se distribuyen bajo la misma licencia que este, remitiendo al repositorio de zai-org/GLM-OCR como texto autoritativo. Conviene verificar la licencia del modelo base antes de un uso comercial.
- Repositorio sin descargas ni valoraciones en el momento de la consulta, conversión no oficial y sin garantías del autor original.
- Fecha de referencia de la información: el repositorio fue creado el 20 de septiembre de 2026 y actualizado el mismo día.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/iamkushagratomar/glm-ocr-gguf
- Modelo base original: https://huggingface.co/zai-org/GLM-OCR
- llama.cpp: https://github.com/ggml-org/llama.cpp
- La búsqueda web realizada no ha devuelto resultados relevantes sobre el modelo (papers, blogs o demos adicionales): no disponibles.
