# furiosa-ai/Qwen3-VL-32B-Instruct

## Resumen

Qwen3-VL-32B-Instruct es un modelo denso de visión-lenguaje de 32 mil millones de parámetros (33.357.390.064 parámetros reales según los pesos en safetensors) perteneciente a la familia Qwen3-VL, desarrollada originalmente por el equipo Qwen de Alibaba. Combina un codificador visual con un decodificador transformer denso y está diseñado para tareas de comprensión visual como OCR, análisis de documentos y gráficos, razonamiento espacial y comprensión de vídeo, además de generación de texto y soporte nativo de tool calling.

El repositorio `furiosa-ai/Qwen3-VL-32B-Instruct` no es un modelo nuevo ni un fine-tuning: es un empaquetado del modelo upstream `Qwen/Qwen3-VL-32B-Instruct` junto con un Furiosa Executable Bundle (FXB) para ejecutarlo sobre aceleradores FuriosaAI RNGD mediante la librería `furiosa-llm`. Es relevante para quienes despliegan el modelo en hardware NPU de FuriosaAI, ya que incluye la configuración de paralelismo y las opciones de servidor específicas para esa plataforma.

La edición publicada es la variante **Instruct** (sin modo de razonamiento explícito), con licencia Apache 2.0 y pesos en precisión original (sin cuantización aplicada en este bundle).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer denso con codificador visual; Interleaved-MRoPE y DeepStack) |
| Parametros totales | 33.357.390.064 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el bundle no aplica cuantizacion; pesos en precision original) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 168,5 GB) + Furiosa Executable Bundle (FXB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-VL en su variante densa: un codificador visual acoplado a un decodificador transformer denso de 32B parámetros. Incorpora embeddings posicionales Interleaved-MRoPE y fusión multinivel de características DeepStack, orientados a preservar información espacial y de detalle en la comprensión de imágenes y vídeo. La entrada es imagen + texto y la salida es texto.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo upstream. El bundle de FuriosaAI no modifica los pesos: se distribuye en la misma precisión que el modelo original de Qwen, y en RNGD se ejecuta con un tamaño de paralelismo tensorial de 32 PEs, lo que corresponde a cuatro tarjetas RNGD (8 PEs por tarjeta).

## Capacidades

- Comprensión de imágenes: descripción, respuesta a preguntas visuales y análisis de contenido gráfico.
- OCR y análisis de documentos: extracción de texto y comprensión de documentos y gráficos.
- Razonamiento espacial sobre imágenes.
- Comprensión de vídeo junto con texto.
- Generación de texto conversacional multi-turno.
- Tool calling / function calling nativo, mediante el parser `hermes` en el servidor de Furiosa-LLM.
- Entrada multimodal estilo OpenAI: mensajes con partes `image_url` (URL remota, base64 `data:` o ruta local `file://` con el flag correspondiente).
- Modo Instruct (no thinking): no se documenta modo de razonamiento extendido en esta edición.

## Casos de uso

- Digitalización y extracción de datos de documentos: el modelo procesa imágenes de facturas, formularios o escaneos y devuelve texto estructurado, aprovechando sus capacidades de OCR y análisis de documentos.
- Análisis de gráficos e informes: interpretación de tablas y gráficos en capturas o PDFs renderizados para responder preguntas de negocio.
- Asistencia multimodal en atención al cliente: conversaciones multi-turno en las que el usuario adjunta capturas de pantalla o fotos de productos y el modelo responde en el mismo hilo.
- Automatización con agentes: combinación de tool calling con entrada visual para flujos en los que el agente inspecciona una imagen y decide invocar funciones externas (por ejemplo, consultar un catálogo o abrir un ticket).
- Moderación y análisis de contenido visual: clasificación y descripción de imágenes o fotogramas de vídeo en pipelines de revisión.
- Accesibilidad: generación de descripciones textuales de imágenes y vídeo para lectores de pantalla o subtitulado asistido.
- Despliegue en infraestructura NPU: servir el modelo sobre FuriosaAI RNGD mediante `furiosa-llm serve` con API compatible con OpenAI, útil en entornos que ya operan hardware de FuriosaAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/VRAM equivalente: el bundle está pensado para FuriosaAI RNGD; el repo ocupa 168,5 GB en safetensors, por lo que en GPUs convencionales se requiere cuantización para caber en memoria razonable (no se documentan cuantizaciones específicas en esta ficha).
- GPU recomendadas: no disponible para GPU; el hardware objetivo documentado es FuriosaAI RNGD con cuatro tarjetas (paralelismo tensorial de 32 PEs).
- ¿Cabe en GPU de consumo? No en precisión original con 32B parámetros y ~168 GB de pesos; requeriría cuantización, no documentada aquí.
- Opciones de despliegue: `furiosa-llm serve` sobre RNGD (API compatible con OpenAI). El modelo upstream también es ejecutable con vLLM, SGLang y Transformers según la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| furiosa-ai/Qwen3-VL-32B-Instruct (este) | 33,36B (denso) | no disponible | Apache 2.0 | Hugging Face, bundle para RNGD |
| Qwen/Qwen3-VL-32B-Instruct (upstream) | 32B (denso) | no disponible | Apache 2.0 | Hugging Face, vLLM/SGLang/Transformers |
| Otros modelos de la familia Qwen3-VL | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no documentados en la información disponible; cabe esperar los sesgos del dataset de entrenamiento del modelo upstream.
- Riesgo de alucinación: presente como en cualquier LLM; especialmente relevante en OCR y lectura de gráficos, donde conviene validar las extracciones.
- Contexto e idiomas: la longitud de contexto y la lista de idiomas no se detallan en esta ficha.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo upstream y de las dependencias de Furiosa-LLM.
- Hardware: el bundle FXB está ligado a FuriosaAI RNGD; para otras plataformas debe usarse el modelo upstream.
- Precisión: al no aplicarse cuantización, los requisitos de memoria son elevados (repo de 168,5 GB).
- Modo Instruct: no incluye modo de razonamiento extendido; para tareas que lo requieran debe considerarse otra variante.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/furiosa-ai/Qwen3-VL-32B-Instruct
- Modelo upstream: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Documentación Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de modelos visión-lenguaje: https://developer.furiosa.ai/latest/en/furiosa_llm/vision-language.html
- Guía de tool calling: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
- Instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- FuriosaAI: https://furiosa.ai
