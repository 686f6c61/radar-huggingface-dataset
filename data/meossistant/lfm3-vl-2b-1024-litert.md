# meossistant/LFM3-VL-2B-1024-LiteRT

## Resumen

LFM3-VL-2B-1024-LiteRT es una conversión comunitaria del modelo vision-language LiquidAI/LFM3-VL-2B de Liquid AI, empaquetada en formato LiteRT-LM para inferencia en dispositivo (on-device) y entornos edge. La build, publicada por el usuario meossistant, parte de la receta oficial de google-ai-edge/litert-samples y modifica dos parámetros clave respecto a la conversión estándar: eleva la resolución de entrada de imagen de 512×512 (256 tokens visuales) a 1024×1024 (1024 tokens visuales) y amplía la longitud de contexto del decodificador de 2048 a 4096 tokens.

El objetivo declarado es el OCR denso y la traducción multilingüe, tareas en las que una mayor resolución visual y una ventana de contexto más amplia tienen impacto directo en la calidad. El modelo base es un vision-language de 2B parámetros con arquitectura Liquid, distribuido bajo la licencia LFM Open License v1.0, que cubre 16 idiomas, incluido el español.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de 2B parámetros con cuantización INT4 en hardware de consumo o dispositivos edge, sin depender de infraestructura cloud, manteniendo capacidades de lectura de documentos y traducción. El artefacto pesa 1,94 GB (2.081.583.136 bytes) y se distribuye como un único fichero `.litertlm`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language con encoder de visión, proyector y decodificador basado en arquitectura Liquid (modelo base LiquidAI/LFM3-VL-2B) |
| Parametros totales | 2B (aproximado, según nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (decodificador); firmas de prefill 1024 / 256 / 64 / 16 / 4 / 1 |
| Tipos de cuantizacion | Decodificador de texto INT4 (blockwise-32, scale floor 2^-14); proyección de salida y embeddings INT8; encoder de visión FP32; proyector FP16 |
| Idiomas soportados | en, de, vi, ar, zh, fr, it, ja, ko, pt, es, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (lfm1.0, etiquetada como "other") |
| Formato de pesos | LiteRT-LM (`.litertlm`); fichero `LFM3-VL-2B_int4_1024_ctx4096.litertlm` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza vision-language con arquitectura Liquid. La conversión incluye tres componentes diferenciados: un encoder de visión en FP32 que procesa imágenes de 1024×1024 y produce 1024 tokens visuales, un proyector en FP16 que alinea el espacio visual con el textual, y un decodificador de texto cuantizado a INT4 con cuantización por bloques de 32 y un floor de escala de 2^-14. Las proyecciones de salida y los embeddings se mantienen en INT8 para preservar calidad.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO. La conversión en sí no reentrena el modelo: solo modifica el formato, la cuantización, la resolución de entrada visual y la longitud de contexto del decodificador respecto a la build estándar de LiteRT. La innovación destacable es precisamente esa ampliación: cuadruplicar los tokens visuales (de 256 a 1024) y duplicar el contexto textual (de 2048 a 4096) manteniendo un tamaño de fichero de 1,94 GB apto para despliegue en dispositivo.

## Capacidades

- Generación de texto e imagen-a-texto (pipeline `image-text-to-text`).
- OCR denso y lectura de documentos, favorecido por la entrada de 1024×1024 y los 1024 tokens visuales.
- Traducción multilingüe entre los 16 idiomas soportados.
- Comprensión de imágenes con descripción y respuesta a preguntas visuales.
- Razonamiento multimodal de un solo turno o multi-turno dentro de la ventana de 4096 tokens.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de documentos con OCR denso: el modelo procesa imágenes a 1024×1024 y genera 1024 tokens visuales, lo que permite extraer texto de páginas con tipografía pequeña o tablas densas sin reescalar a resoluciones que perderían detalle.
- Traducción de documentos escaneados: combinando OCR y traducción en una sola pasada, con salida en cualquiera de los 16 idiomas soportados (incluido español), útil para digitalizar contratos o manuales multilingües.
- Asistencia en dispositivos sin conectividad: al ejecutarse con LiteRT-LM en local, puede desplegarse en tablets, móviles o equipos edge para tareas de lectura de imágenes y traducción en entornos sin red.
- Accesibilidad: descripción de imágenes y lectura en voz alta de texto contenido en fotografías para usuarios con discapacidad visual, ejecutándose en el propio dispositivo para preservar privacidad.
- Procesamiento de tickets y facturas: extracción de campos a partir de fotografías de documentos, con la ventana de 4096 tokens suficiente para incluir la imagen (1024 tokens) y el prompt y la respuesta estructurada.
- Traducción de carteles y señalética: captura de imagen con la cámara y traducción al idioma del usuario, con la resolución de 1024×1024 mejorando la legibilidad de texto en escenas.
- Preprocesamiento en pipelines de datos: uso como primer filtro para clasificar o transcribir imágenes antes de enviarlas a modelos mayores en la nube, reduciendo coste y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del artefacto: 1,94 GB (2.081.583.136 bytes), lo que determina el espacio en disco y la memoria mínima de carga.
- VRAM/RAM estimada: al menos ~2 GB para cargar el modelo; se recomienda margen adicional para el runtime LiteRT-LM, buffers de imagen a 1024×1024 y la caché KV de 4096 tokens.
- GPU recomendadas: no disponible en la información proporcionada; el formato LiteRT-LM está orientado a aceleradores edge (CPU, GPU móvil, NPU) más que a GPUs de datacenter.
- Compatibilidad con GPU de consumo: el tamaño de 1,94 GB sugiere que cabe en GPUs de consumo con suficiente memoria, aunque no se especifican modelos concretos ni rendimiento medido.
- Opciones de despliegue: LiteRT-LM (librería declarada); otras opciones como vLLM, llama.cpp, Ollama o TGI no están soportadas por el formato `.litertlm` según la información disponible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resolucion visual | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-VL-2B-1024-LiteRT (esta ficha) | 2B | 4096 | 1024×1024 (1024 tokens) | LFM Open License v1.0 | LiteRT-LM |
| LiquidAI/LFM3-VL-2B (base) | 2B | no disponible | no disponible | LFM Open License v1.0 | safetensors (formato original) |
| Build LiteRT estándar de LFM3-VL-2B (referencia en litert-samples) | 2B | 2048 | 512×512 (256 tokens) | LFM Open License v1.0 | LiteRT-LM |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes ni con modelos de otros fabricantes.

## Limitaciones y advertencias

- Es una conversión comunitaria (autor meossistant), no oficial de Liquid AI; no hay garantías de soporte ni de validación independiente del proceso de cuantización.
- La cuantización INT4 del decodificador puede degradar la calidad respecto al modelo base en FP16/BF16, especialmente en tareas de razonamiento complejo.
- El contexto de 4096 tokens se consume rápido: una imagen a 1024×1024 ocupa 1024 tokens, dejando unos 3000 para prompt y respuesta.
- El modelo no incluye información sobre mitigaciones de sesgos ni evaluación de alucinación; se debe validar en producción, sobre todo en OCR crítico.
- La licencia LFM Open License v1.0 impone condiciones específicas para uso comercial; es necesario revisar sus términos antes de desplegar en producto.
- El formato `.litertlm` limita el ecosistema de despliegue a LiteRT-LM; no es directamente compatible con vLLM, llama.cpp u Ollama.
- El preprocesado es obligatorio: hay que corregir la orientación EXIF y redimensionar/rellenar a 1024×1024 antes de la inferencia, o los resultados pueden degradarse.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/meossistant/LFM3-VL-2B-1024-LiteRT
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Receta de conversión oficial: https://github.com/google-ai-edge/litert-samples/tree/main/models/lfm/lfm3_vl_2b/converted
- Repositorio litert-samples: https://github.com/google-ai-edge/litert-samples
