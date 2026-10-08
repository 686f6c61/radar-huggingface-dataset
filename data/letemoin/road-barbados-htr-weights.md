# Letemoin/road-barbados-htr-weights

## Resumen

Letemoin/road-barbados-htr-weights no es un modelo único, sino un paquete de pesos heterogéneo publicado por el usuario Letemoin como material auxiliar del código de solución presentado al reto Zindi "R.O.A.D. Barbados Historic Handwriting Challenge". El repositorio (10,6 GB) contiene adaptadores LoRA en formato PEFT para cuatro modelos base de la familia Qwen con capacidad de visión, junto con dos reconocedores CTC entrenados específicamente para lectura de líneas manuscritas.

El problema que aborda es el reconocimiento de texto manuscrito (HTR) sobre documentación histórica de Barbados, un dominio con escritura caligráfica irregular, papel degradado y convenciones ortográficas antiguas que degradan el rendimiento de los OCR convencionales. La estrategia combina modelos visión-lenguaje ajustados con adaptadores de bajo rango y reconocedores CTC ligeros y especializados, lo que permite orquestar varios motores sobre la misma página.

Su relevancia es acotada y de carácter instrumental: los adaptadores no son autónomos, sino que requieren descargar los modelos base desde sus repositorios oficiales, y el repositorio no documenta métricas, idiomas ni procedimientos de entrenamiento. Es un artefacto reproducible para el reto, útil como punto de partida para pipelines de digitalización de archivos históricos, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paquete mixto: adaptadores LoRA (PEFT) sobre transformers visión-lenguaje Qwen, más un CRNN-CTC entrenado desde cero y un reconocedor PP-OCRv6-medium ajustado con CTC |
| Parametros totales | no disponible (depende del modelo base: 7B, 8B y 9B según la variante; los adaptadores LoRA añaden un número no especificado de parámetros) |
| Parametros activos | no aplica (ningún componente es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors y PyTorch; no se documentan cuantizaciones GGUF, AWQ o GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | Adaptadores LoRA en PEFT (`*_adapter.safetensors` + `*_adapter_config.json`), checkpoint CRNN-CTC en PyTorch (`_ctc_align.pt`) y reconocedor PP-OCRv6-medium en PyTorch (`ppx_h96_best.pt`) |
| Modelos base soportados | Qwen3.5-9B, Qwen3-VL-8B-Instruct, Qwen2-VL-7B-Instruct, Qwen2.5-VL-7B-Instruct (licencias Apache-2.0, descargados de sus repositorios oficiales) |
| Tamaño del repositorio | 10,6 GB |
| Descargas | 0 |
| Likes | 0 |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-10-07 |
| Fecha de actualizacion | 2026-10-07 |

## Arquitectura y entrenamiento

El paquete agrupa tres aproximaciones arquitectónicas distintas. Por un lado, adaptadores LoRA en formato PEFT pensados para inyectarse sobre cuatro modelos base de visión-lenguaje de la familia Qwen, todos ellos transformers con codificador visual y decodificador de lenguaje. Por otro, un CRNN-CTC (`_ctc_align.pt`) entrenado desde cero, es decir, una red convolucional recurrente con cabecera Connectionist Temporal Classification, típica de los sistemas de reconocimiento de líneas de texto sin segmentación previa a nivel de carácter. Por último, `ppx_h96_best.pt` es un reconocedor PP-OCRv6-medium de PaddleOCR ajustado con CTC, lo que sugiere una adaptación del modelo público al vocabulario y a la tipografía del corpus histórico.

Los datos de entrenamiento corresponden al corpus del reto Zindi sobre escritura histórica de Barbados. No se especifica en la información disponible el número de tokens o imágenes de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se describen innovaciones técnicas más allá del uso combinado de adaptadores de bajo rango y cabeceras CTC, ni se documenta el procedimiento de ajuste (hiperparámetros, épocas, esquema de aumentación de datos o estrategia de validación). La verificación de integridad se realiza mediante `download_weights.sh` y una lista de hashes SHA-256 en `configs/weights.sha256`.

## Capacidades

- Reconocimiento de texto manuscrito sobre documentos históricos: los pesos están ajustados específicamente para transcribir escritura caligráfica de archivos de Barbados, no para OCR de imprenta moderna.
- Reconocimiento a nivel de línea: el CRNN-CTC y el reconocedor PP-OCRv6 ajustado operan sobre líneas de texto, lo que encaja con pipelines que primero segmentan la página en líneas y después transcriben.
- Procesamiento de imagen y texto simultáneo mediante los adaptadores LoRA sobre modelos visión-lenguaje, que permiten condicionar la transcripción con contexto textual o instrucciones.
- Alternativa multimodal completa: al apoyarse en Qwen2-VL, Qwen2.5-VL, Qwen3-VL y Qwen3.5, los adaptadores heredan las capacidades de sus modelos base (descripción de imagen, respuesta a preguntas visuales), aunque el ajuste se orienta a HTR y no se documenta qué capacidades generales se preservan.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declara ningún idioma en los metadatos del repositorio.
- Modo de razonamiento explícito (thinking mode), audio o vídeo: no disponible.

## Casos de uso

- Digitalización de archivos históricos coloniales: el paquete permite transcribir registros manuscritos de Barbados combinando el CRNN-CTC para líneas limpias y los adaptadores sobre Qwen-VL para líneas degradadas o con abreviaturas, elevando la cobertura frente a un único motor.
- Extracción de metadatos genealógicos: a partir de libros parroquiales o registros civiles, se pueden transcribir nombres, fechas y localidades para volcarlos a una base de datos estructurada, usando el adaptador sobre un modelo visión-lenguaje que acepte instrucciones de formato de salida.
- Enriquecimiento de catálogos de archivo: transcripción automática del texto de cada imagen para generar índices de búsqueda full-text sobre colecciones que hoy solo tienen metadatos a nivel de caja o legajo.
- Investigación histórica y humanidades digitales: análisis de corpus a gran escala (frecuencia de términos, evolución ortográfica) requiere transcripciones masivas, tarea para la que este conjunto de pesos ofrece un punto de partida reproducible con licencia Apache-2.0.
- Evaluación comparativa de motores HTR: al incluir tres familias de reconocedores (LoRA sobre VLM, CRNN-CTC y PP-OCRv6 ajustado), sirve como banco de pruebas para medir qué arquitectura rinde mejor según la calidad del escaneo y el tipo de escritura.
- Reproducción de resultados de un reto académico: el código de solución y los hashes SHA-256 permiten replicar exactamente las predicciones enviadas a la competición Zindi, útil para auditar metodologías publicadas.
- Preprocesado para transcripción asistida por humanos: integrar el modelo como primer paso de un flujo en el que un paleógrafo corrige las líneas de baja confianza, reduciendo el tiempo de transcripción manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de error de carácter (CER), error de palabra (WER), MMLU, HumanEval, GSM8K ni ninguna otra evaluación cuantitativa, ni comparaciones con modelos alternativos. Tampoco se especifica la puntuación obtenida en el reto Zindi "R.O.A.D. Barbados Historic Handwriting Challenge".

## Requisitos de hardware

- VRAM estimada para inferencia en precisión bf16 (estimación propia a partir del tamaño de los modelos base, no confirmada por el autor): en torno a 16-18 GB para las variantes de 7B-8B y 19-21 GB para la variante de 9B, más el overhead del codificador visual y del adaptador LoRA.
- VRAM estimada con cuantización de 4 bits: aproximadamente 6-8 GB para los modelos de 7B-8B, aunque el repositorio no publica pesos cuantizados, por lo que habría que generarlos.
- Componentes CTC: el CRNN-CTC entrenado desde cero y el reconocedor PP-OCRv6 ajustado son modelos ligeros que pueden ejecutarse en CPU o en GPU con muy poca VRAM; su requisito exacto no está documentado.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para servir varias variantes en paralelo; RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes para una variante de 7B-9B en bf16.
- Cabe en GPU de consumo: sí, una variante de 7B-9B en bf16 cabe en RTX 4090 o RTX 3090 con 24 GB; en tarjetas de 8-12 GB sería necesario cuantizar.
- Opciones de despliegue: los adaptadores PEFT son compatibles con el ecosistema Hugging Face Transformers, por lo que pueden servirse con vLLM, TGI o cargarse con `peft` sobre el modelo base; los checkpoints `.pt` de CTC requieren PyTorch y, en el caso de PP-OCRv6, el framework PaddleOCR. No se documenta compatibilidad con llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento: el repositorio completo ocupa 10,6 GB, a lo que hay que sumar el espacio de los cuatro modelos base descargados por separado.

## Comparativa con modelos similares

No se dispone de métricas comparativas publicadas. La tabla recoge únicamente características estructurales verificables de alternativas del mismo ámbito (reconocimiento de escritura manuscrita y OCR), marcando como no disponible todo dato de rendimiento que no se haya publicado.

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Letemoin/road-barbados-htr-weights | LoRA sobre Qwen-VL + CRNN-CTC + PP-OCRv6 ajustado | no disponible (base 7B-9B por variante) | no disponible | Apache-2.0 | Hugging Face, requiere descargar los modelos base |
| Microsoft TrOCR | Transformer encoder-decoder para HTR | 334 M (base) / 558 M (large) | no disponible | MIT | Hugging Face, pesos autónomos |
| PP-OCRv5 / PP-OCRv6 (PaddleOCR) | Detección + reconocimiento CTC | no disponible | no disponible | Apache-2.0 | PaddleOCR, pesos autónomos |
| Qwen2.5-VL-7B-Instruct (modelo base sin ajuste) | Vision-language transformer | 7 B | no disponible | Apache-2.0 | Hugging Face |

No se dispone de CER/WER comparables entre estas opciones en la información proporcionada, por lo que no es posible establecer una clasificación de rendimiento.

## Limitaciones y advertencias

- No es un modelo autónomo: los adaptadores LoRA solo funcionan cargados sobre sus modelos base, que deben descargarse por separado de los repositorios oficiales de Qwen. El repositorio solo contiene los pesos auxiliares.
- Ausencia total de documentación de evaluación: no hay CER, WER ni puntuación del reto, lo que impide estimar la calidad esperada en producción.
- Sesgo de dominio: el ajuste está orientado a escritura histórica de Barbados; es previsible un rendimiento degradado en otros idiomas, épocas, caligrafías o documentos impresos modernos. No se declara ningún idioma soportado en los metadatos.
- Riesgo de alucinación: los adaptadores sobre modelos visión-lenguaje generativos pueden producir texto plausible que no aparece en la imagen, especialmente con manchas, tachaduras o líneas parcialmente ilegibles. En HTR esto es especialmente crítico para transcripciones con valor probatorio o académico.
- Verificación manual recomendada: cualquier uso en archivos históricos debería incluir revisión humana de las líneas de baja confianza.
- Sin datos de sesgo: no se documentan sesgos demográficos, léxicos ni geográficos, ni se describe la composición del corpus de entrenamiento.
- Licencia: aunque el repositorio se publica bajo Apache-2.0, los pesos derivan de modelos base de Qwen con licencia Apache-2.0, por lo que conviene revisar los términos de cada modelo base antes de un uso comercial. El reconocedor PP-OCRv6 deriva de PaddleOCR, sujeto a sus propias condiciones.
- Repositorio sin tracción: cero descargas y cero likes en el momento de redactar esta ficha, sin mantenimiento posterior a la fecha de publicación.
- Tamaño considerable: 10,6 GB de pesos más los modelos base, con el coste de almacenamiento y de ancho de banda asociado.
- Sin cuantizaciones publicadas: no hay versiones GGUF, AWQ ni GPTQ, lo que obliga a generarlas si se quiere desplegar en hardware limitado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Letemoin/road-barbados-htr-weights
- Model card original (incluida en el repositorio): https://huggingface.co/Letemoin/road-barbados-htr-weights/blob/main/README.md
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios de código, demos ni a la página oficial del reto Zindi "R.O.A.D. Barbados Historic Handwriting Challenge".
