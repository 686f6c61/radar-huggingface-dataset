# mradermacher/Glaux-1.0-GGUF

## Resumen

Glaux-1.0 es un modelo de lenguaje de 1.170.340.608 parámetros (aproximadamente 1,17 mil millones) desarrollado por Openwist y publicado bajo el identificador `Openwist/Glaux-1.0`. La versión aquí descrita es la cuantización GGUF estática realizada por mradermacher, que facilita su ejecución en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. El modelo se etiqueta como orientado a "on-device" y "tool-use", lo que sugiere un diseño enfocado a la ejecución local y a la integración con herramientas externas mediante function calling.

El modelo base se distribuye con licencia `lfm1.0` (LFM Open License v1.0), una licencia de tipo "other" que no es de código abierto puro y que impone restricciones específicas para uso comercial. Está entrenado únicamente en inglés (`language: en`), por lo que no se debe esperar un rendimiento multilingüe fiable. La arquitectura concreta, la longitud de contexto y los detalles de entrenamiento no están documentados en la información disponible.

La relevancia de esta ficha reside en que Glaux-1.0-GGUF es una opción práctica para desplegar un modelo conversacional pequeño en hardware de consumo, con cuantizaciones que van desde 0,6 GB (Q2_K) hasta 2,4 GB (f16). Al estar basado en un adaptador LoRA sobre el modelo base, su comportamiento conversacional y de uso de herramientas hereda las capacidades del modelo original de Openwist.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer, detalles no especificados) |
| Parametros totales | 1.170.340.608 (aprox. 1,17 B) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | lfm1.0 (LFM Open License v1.0, licencia "other") |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en formato transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `Openwist/Glaux-1.0`. Por el tamaño (1,17 B parámetros) y la etiqueta `transformers`, se trata presumiblemente de un transformer decoder-only, pero la información proporcionada no confirma la arquitectura exacta, el número de capas, la dimensión de los embeddings ni el mecanismo de atención empleado.

El modelo se presenta como un adaptador LoRA (`lora` en los tags, `base_model:adapter:Openwist/Glaux-1.0`), lo que indica que Glaux-1.0 se construye mediante ajuste fino de bajo rango sobre un modelo base subyacente. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La etiqueta `openwist` sugiere que el modelo base podría pertenecer a la familia Openwist, pero no hay datos públicos en la información disponible que lo confirmen.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogos multi-turno.
- Soporte de tool calling / function calling, según la etiqueta `tool-use` del modelo.
- Diseño orientado a ejecución en dispositivo (`on-device`), es decir, inferencia local sin dependencia de servicios en la nube.
- Capacidades de razonamiento y código: no confirmadas explícitamente en la información disponible.
- Capacidades matemáticas: no confirmadas explícitamente en la información disponible.
- Capacidades de visión o audio: no disponibles.
- Soporte multilingüe: limitado al inglés; no se documentan otros idiomas.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Asistente conversacional local en aplicaciones de escritorio o móviles: con cuantizaciones Q4_K_S o Q4_K_M (0,8 GB), el modelo cabe en la memoria de un portátil convencional y puede gestionar conversaciones multi-turno sin conexión a internet, lo que resulta adecuado para asistentes de productividad o atención al usuario en entornos con requisitos de privacidad.
- Integración de function calling en agentes ligeros: la etiqueta `tool-use` indica que el modelo está preparado para invocar herramientas externas, por lo que puede emplearse en pipelines de automatización que requieran llamadas a APIs, consultas a bases de datos o ejecución de comandos, siempre que el contexto de la tarea sea acotado.
- Prototipado rápido de chatbots en entornos de desarrollo: al ser un GGUF de menos de 1 GB en cuantizaciones intermedias, se puede cargar en llama.cpp u Ollama para iterar sobre prompts y flujos conversacionales sin coste de infraestructura.
- Despliegue en dispositivos edge con recursos limitados: la cuantización Q2_K (0,6 GB) permite ejecutar el modelo en placas como Raspberry Pi 5 o dispositivos con 4 GB de RAM, para tareas de clasificación de texto, extracción de entidades o respuestas breves.
- Filtrado y moderación de contenido en local: un modelo de 1,17 B puede utilizarse para preclasificar mensajes o generar respuestas de plantilla en sistemas de moderación, reduciendo la latencia frente a modelos mayores.
- Educación y experimentación: sirve como modelo de referencia para estudiar el comportamiento de adaptadores LoRA cuantizados y para comparar el impacto de distintas cuantizaciones en la calidad de las respuestas, dado el amplio abanico de variantes GGUF publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~0,6 GB; Q4_K_M ~0,8 GB; Q8_0 ~1,3 GB; f16 ~2,4 GB. A estas cifras hay que sumar el espacio para el contexto KV cache, que depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: al tratarse de un modelo de 1,17 B, cualquier GPU consumer moderna es suficiente. Una RTX 3060 (12 GB) o RTX 4060 (8 GB) permiten ejecutar la variante f16 con contexto amplio; una GTX 1650 (4 GB) puede ejecutar Q4_K_M con holgura.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2 GB de VRAM para las cuantizaciones bajas, y en 4 GB para f16 con contexto moderado.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (tras importar el GGUF), LM Studio, y servidores compatibles con la API de llama.cpp. vLLM y TGI no soportan GGUF de forma nativa en el momento de redactar esta ficha, por lo que requerirían el modelo en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Para un modelo de este tamaño, en una GPU consumer se espera un throughput de decenas a cientos de tokens por segundo, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Glaux-1.0-GGUF (este) | 1,17 B | no disponible | lfm1.0 | GGUF | Orientado a on-device y tool-use; solo inglés |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Modelo abierto ampliamente usado; contexto corto |
| Qwen2.5-1.5B | 1,5 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Multilingüe y con contexto largo; mayor tamaño |
| SmolLM2-1.7B | 1,7 B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Entrenado en varios billones de tokens; buen rendimiento en razonamiento |

La comparativa se basa en características públicas de modelos de tamaño similar; no se dispone de datos de rendimiento de Glaux-1.0 que permitan una comparación cuantitativa. La principal desventaja de Glaux-1.0 frente a estas alternativas es su licencia restrictiva (`lfm1.0`) y su limitación al inglés, mientras que su ventaja es el enfoque explícito en tool-use y ejecución on-device.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al entrenarse presumiblemente con datos en inglés, puede reflejar sesgos culturales y lingüísticos de ese corpus.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; la falta de benchmarks impide cuantificar su fiabilidad.
- Limitaciones de contexto e idioma: solo se declara soporte de inglés; no se documenta la longitud de contexto, lo que impide planificar tareas que requieran ventanas largas.
- Restricciones de licencia: la licencia `lfm1.0` (LFM Open License v1.0) no es de código abierto y puede imponer condiciones al uso comercial. Es imprescindible revisar el texto completo de la licencia antes de desplegar el modelo en producción.
- Caveats para producción: el modelo es un adaptador LoRA cuantizado, por lo que la calidad puede degradarse en cuantizaciones bajas (Q2_K, Q3_K_S). Además, no se han publicado evaluaciones independientes que validen su rendimiento en tareas reales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y ausencia de validación comunitaria.

## Enlaces

- [Hugging Face: mradermacher/Glaux-1.0-GGUF](https://huggingface.co/mradermacher/Glaux-1.0-GGUF)
- [Modelo base: Openwist/Glaux-1.0](https://huggingface.co/Openwist/Glaux-1.0)
- [Página de descargas de mradermacher para este modelo](https://hf.tst.eu/model#Glaux-1.0-GGUF)
- [Guía de uso de GGUF (TheBloke)](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Gráfico comparativo de cuantizaciones (ikawrakow)](https://www.nethype.de/huggingface_embed/quantpplgraph.png)
- [Notas sobre cuantizaciones (Artefact2)](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
- [FAQ y solicitudes de modelos de mradermacher](https://huggingface.co/mradermacher/model_requests)
