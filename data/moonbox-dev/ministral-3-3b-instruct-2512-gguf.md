# moonbox-dev/Ministral-3-3B-Instruct-2512-GGUF

## Resumen

Ministral 3 3B Instruct 2512 GGUF es una compilación en formato GGUF del modelo multimodal Ministral 3 3B Instruct 2512 desarrollado por Mistral AI, publicada por el usuario moonbox-dev para su uso con llama.cpp en dispositivos locales (Metal, CUDA, Vulkan y CPU). El modelo base es el miembro más pequeño de la familia Ministral 3, un modelo de lenguaje de aproximadamente 3.429 millones de parámetros con capacidades de visión, post-entrenado para instrucciones y orientado a despliegues en el borde (edge).

El repositorio ofrece múltiples precisiones de cuantización (F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) junto con un archivo `mmproj` que contiene el codificador de visión Pixtral y su proyector, compartido por todas las precisiones. Esto permite elegir el equilibrio entre calidad y consumo de memoria según el hardware disponible, desde GPUs de consumo hasta CPU.

La relevancia actual de esta publicación radica en que facilita el despliegue local de un modelo multimodal compacto con licencia Apache 2.0, con métricas de fidelidad respecto al original BF16 documentadas por el autor de la cuantización (divergencia KL y coincidencia del token más probable). El modelo responde directamente, sin modo de razonamiento (thinking), lo que simplifica su integración en aplicaciones conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje Ministral 3 con codificador de visión Pixtral); detalles internos de capas y atención no disponibles |
| Parametros totales | 3.429.006.336 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M (importance matrix), Q4_K_M (importance matrix, marcada experimental) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo `mmproj` separado para visión) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Ministral 3, en su variante de 3B parámetros. La parte de lenguaje se distribuye en los archivos GGUF de cada precisión, mientras que el codificador de visión Pixtral y su proyector se alojan en el archivo `mmproj-ministral-3-3b-instruct-F16.gguf` (840,3 MB), compartido por todas las precisiones y necesario únicamente para entrada de imágenes. El modelo es la versión instruct post-entrenada, ajustada para tareas de instrucción y conversación, y responde de forma directa sin modo de razonamiento.

Las cuantizaciones se generaron a partir del checkpoint BF16 en la revisión `b6d637bef2` con llama.cpp `b12621`: `convert_hf_to_gguf.py` produjo el archivo BF16 y el `mmproj`, y `llama-quantize` generó las demás precisiones con sus mezclas estándar. Q5_K_M y Q4_K_M se cuantizaron con importance matrix calculada sobre 200 x 512 tokens de WikiText-2 train con el archivo Q8_0; Q6_K se generó sin matriz porque con ella una respuesta en chino empeoraba notablemente (KL 0,21 en esa respuesta, 0,0155 global). El autor verificó que los 458 tensores del checkpoint original aparecen con los mismos valores en el archivo BF16 y en el `mmproj`, y aplicó un parche de una línea al conversor para incluir la fila de embedding del token `[IMG_BREAK]`, necesaria para llama.cpp. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF/DPO) empleadas en el modelo base.

## Capacidades

- Generación de texto conversacional e instrucciones: el modelo es la variante instruct y responde directamente, sin modo de pensamiento.
- Comprensión de imágenes (image-text-to-text): mediante el archivo `mmproj` con el codificador Pixtral, admite entradas de imagen junto con texto.
- Razonamiento y matemáticas: capacidades propias de un modelo de lenguaje de 3B, sin datos de benchmarks disponibles en la información.
- Generación de código: no se documenta explícitamente en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el benchmark del autor incluye prompts en inglés y chino, lo que sugiere cierto soporte para ambos, pero no se detalla la cobertura de idiomas.
- Capacidad especial: entrada multimodal de imagen y texto; sin audio ni modo thinking documentados.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar diálogos multi-turno en un equipo de escritorio o portátil mediante llama.cpp, con la precisión Q4_K_M (2,15 GB) o Q5_K_M (2,47 GB) para ajustarse a la memoria disponible.
- Descripción y análisis de imágenes en el borde: usando el archivo `mmproj` junto con cualquier precisión, se pueden enviar imágenes a través de `image_url` en `/v1/chat/completions` para tareas como accesibilidad (descripción de fotos), moderación visual o extracción de información de capturas.
- Prototipado rápido de aplicaciones multimodales: el servidor `llama-server` expone una API compatible con OpenAI, lo que permite integrar el modelo en aplicaciones existentes sin infraestructura en la nube.
- Procesamiento de documentos con imágenes en local: combinación de OCR previo y comprensión visual para clasificar o resumir documentos escaneados en entornos con requisitos de privacidad.
- Despliegue en dispositivos con recursos limitados: la precisión Q4_K_M (2,15 GB) permite ejecutar el modelo en GPUs de consumo con 4-6 GB de VRAM o incluso en CPU, adecuado para aplicaciones de escritorio o IoT con capacidad de cómputo moderada.
- Evaluación y experimentación con cuantizaciones: el repositorio incluye métricas de fidelidad (KL y coincidencia de token) por precisión, lo que facilita comparar el impacto de la cuantización en la calidad antes de elegir un archivo para producción.
- Chat multimodal sin conexión: al no requerir servicios externos, encaja en escenarios de campo, entornos air-gapped o aplicaciones donde la latencia de red es crítica.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad de cada cuantización respecto al archivo BF16, medidas con 12 prompts cortos (8 en inglés, 4 en chino) en la plantilla de chat del modelo, con generación greedy de hasta 64 tokens (636 en total) y evaluación teacher-forced sobre CUDA (RTX 3080 Laptop). No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Precision | Tamano | Pesos respecto a BF16 | KL divergence | Coincidencia token top-1 | Estado |
|---|---|---|---|---|---|
| F16 | 6,87 GB | idénticos | 0,00001 | 99,8 % | Pasa |
| Q8_0 | 3,65 GB | 0,54 % | 0,0008 | 98,7 % | Pasa |
| Q6_K | 2,82 GB | 1,81 % | 0,0042 | 97,6 % | Pasa |
| Q5_K_M | 2,47 GB | 3,15 % | 0,0097 | 95,4 % | Pasa (al límite) |
| Q4_K_M | 2,15 GB | 5,88 % | 0,0380 | 94,8 % | Experimental |

El criterio de aprobación del autor es KL <= 0,01 nats y coincidencia del token top-1 >= 90 %. Q5_K_M pasa por poco margen (0,0097), mientras que Q4_K_M se marca como experimental por superar el umbral de KL (0,0380). La ruta de imagen se verificó manualmente: con el `mmproj`, Q4_K_M describe correctamente una foto de prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2-2,5 GB para Q4_K_M (2,15 GB de pesos más overhead), 2,5-2,8 GB para Q5_K_M, 2,9-3,2 GB para Q6_K, 3,7-4,0 GB para Q8_0 y 6,9-7,5 GB para F16. El archivo `mmproj` añade 840,3 MB cuando se usa entrada de imagen.
- GPU recomendadas: el autor validó las cuantizaciones en una RTX 3080 Laptop (CUDA). Cualquier GPU con al menos 4 GB de VRAM puede ejecutar Q4_K_M o Q5_K_M; para F16 se recomienda una GPU con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, A100, H100).
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 4 GB o más de VRAM para las precisiones Q4_K_M y Q5_K_M; también en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (versión `b12621` o superior) mediante `llama-server`, con soporte Metal, CUDA, Vulkan y CPU. El repositorio está etiquetado como compatible con endpoints (`endpoints_compatible`), lo que permite usar la API `/v1/chat/completions`. No se documentan otras opciones como vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tareas para comparar el rendimiento con alternativas. La siguiente tabla compara características estructurales con modelos de tamaño similar de la información disponible:

| Modelo | Parametros | Contexto | Vision | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| Ministral 3 3B Instruct 2512 (esta ficha) | 3.429 M | no disponible | Sí (Pixtral) | Apache 2.0 | Sí (moonbox-dev) |
| Ministral 3 (otras variantes de la familia) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de ~3B con visión | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de otros desarrolladores en la documentación proporcionada, por lo que no se puede establecer una comparativa de rendimiento fiable.

## Limitaciones y advertencias

- La cuantización Q4_K_M está marcada como experimental por superar el umbral de KL (0,0380 frente a 0,01), por lo que puede degradar la calidad en tareas sensibles; se recomienda Q5_K_M o superior para producción.
- Q5_K_M pasa el criterio por un margen muy estrecho (KL 0,0097), lo que deja poco espacio para degradaciones adicionales en dominios distintos al conjunto de evaluación del autor.
- El benchmark de fidelidad se basa en solo 12 prompts cortos (8 en inglés, 4 en chino) y 636 tokens, por lo que su representatividad es limitada.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas específicas del modelo base.
- La longitud de contexto no está documentada en la información disponible, lo que impide planificar aplicaciones que dependan de ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero los archivos son una obra derivada del modelo original y están sujetos a su licencia; se debe consultar la model card original para condiciones adicionales.
- El modelo responde directamente sin modo de razonamiento, lo que puede limitar su rendimiento en tareas que requieran cadenas de pensamiento explícitas.
- La ruta de imagen solo se verificó manualmente con una foto de prueba en Q4_K_M; no hay una evaluación sistemática de la calidad multimodal.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de la comunidad sobre su funcionamiento en distintos entornos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/Ministral-3-3B-Instruct-2512-GGUF
- Modelo base (BF16): https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-BF16
- Modelo base (referencia): https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper referenciado (arXiv:2601.08584): https://arxiv.org/abs/2601.08584
- Archivos individuales:
  - F16: https://huggingface.co/moonbox-dev/Ministral-3-3B-Instruct-2512-GGUF/blob/main/ministral-3-3b-instruct-F16.gguf
  - mmproj: https://huggingface.co/moonbox-dev/Ministral-3-3B-Instruct-2512-GGUF/blob/main/mmproj-ministral-3-3b-instruct-F16.gguf
  - Q8_0: https://huggingface.co/moonbox-dev/Ministral-3-3B-Instruct-2512-GGUF/blob/main/ministral-3-3b-instruct-Q8_0.gguf
  - Q6_K: https://huggingface.co/moonbox-dev/Ministral-3-3B-Instruct-2512-GGUF/blob/main/ministral-3-3b-instruct-Q6_K.gguf
  - Q5_K_M: https://huggingface.co/moonbox-dev/Ministral-3-3B-Instruct-2512-GGUF/blob/main/ministral-3-3b-instruct-Q5_K_M.gguf
  - Q4_K_M: https://huggingface.co/moonbox-dev/Ministral-3-3B-Instruct-2512-GGUF/blob/main/ministral-3-3b-instruct-Q4_K_M.gguf
