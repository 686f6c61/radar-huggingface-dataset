# litert-community/gemma-4-E4B-it-litert-lm

## Resumen

Gemma 4 E4B es un modelo de lenguaje multimodal de Google, distribuido originalmente como `google/gemma-4-E4B-it` y empaquetado aquí por la comunidad `litert-community` en formato `.litertlm` para su despliegue en dispositivos. La versión que nos ocupa no es un modelo nuevo, sino una cuantización y conversión del modelo base optimizada para el runtime LiteRT-LM de Google, que se ejecuta sobre LiteRT (antes TFLite) con aceleración por XNNPACK en CPU y ML Drift en GPU. El objetivo es claro: llevar inferencia generativa privada y sin conexión a Android, iOS, escritorio, IoT y web.

El modelo pertenece a la familia Gemma 4, derivada de la misma investigación que los modelos Gemini, y está pensado para casos de uso en el dispositivo (*on-device*). El fichero empaquetado ocupa 3,66 GB e incluye un decodificador de texto con 2,24 GB de pesos, 0,67 GB de parámetros de embedding y módulos de visión y audio que se cargan bajo demanda. El framework mantiene los pesos principales en memoria y mapea los embeddings, lo que reduce el consumo de memoria de trabajo en algunas plataformas.

La relevancia actual del artefacto es doble: por un lado, demuestra que un modelo de la clase E4B (con visión y audio) puede ejecutarse en hardware de consumo y móvil; por otro, su licencia Apache 2.0 y su disponibilidad en Hugging Face con más de 534.000 descargas lo convierten en una opción práctica para integrar IA generativa local en aplicaciones comerciales sin depender de la nube. La información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es limitada, y esta ficha lo refleja explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, visión y audio); detalles internos no disponibles |
| Parametros totales | No disponible (el fichero empaquetado pesa 3,66 GB, con 2,24 GB de pesos del decodificador y 0,67 GB de embeddings) |
| Parametros activos | No disponible |
| Longitud de contexto | Hasta 32k tokens (según la model card; los benchmarks se ejecutaron con 2048 tokens) |
| Tipos de cuantizacion | Cuantización propia del formato `.litertlm` para LiteRT-LM; niveles concretos no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo base. Lo que sí se documenta es la estructura del artefacto empaquetado: un decodificador de texto con 2,24 GB de pesos, 0,67 GB de parámetros de embedding, y modelos de visión y audio separados que se cargan solo cuando se necesitan, lo que reduce el consumo de memoria en reposo. El runtime LiteRT-LM actúa como capa de orquestación sobre LiteRT y aporta gestión de KV-cache, plantillas de prompt y soporte de *function calling*, con aceleración por XNNPACK en CPU y ML Drift en GPU. Es la misma pila tecnológica que usa la aplicación Google AI Edge Gallery.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se especifican innovaciones de atención o decodificación más allá de las propias del runtime (gestión de caché y decodificación acelerada). Cualquier afirmación sobre la arquitectura interna del transformer o sobre el proceso de alineación sería especulativa y no se incluye aquí.

## Capacidades

- Generación de texto conversacional e instruccional, al ser una variante `-it` (instruction-tuned).
- Procesamiento multimodal: incluye módulos de visión y audio cargados bajo demanda, según la model card.
- Soporte de *function calling* a través de LiteRT-LM, que incorpora APIs específicas para ello.
- Ejecución totalmente local y sin conexión, con privacidad de datos por diseño.
- Despliegue multiplataforma: Android, iOS, escritorio, IoT y web mediante el mismo formato `.litertlm`.
- Gestión de KV-cache y plantillas de prompt integradas en el runtime.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento explícito (*thinking mode*): no disponible en la información proporcionada.

## Casos de uso

- **Asistentes privados en aplicaciones móviles**: integración en apps Android e iOS mediante LiteRT-LM para ofrecer generación de texto sin enviar datos a la nube, aprovechando que los pesos se mantienen en memoria y los embeddings se mapean, lo que reduce el consumo en dispositivos con RAM limitada.
- **Aplicaciones de accesibilidad con audio**: el módulo de audio cargado bajo demanda permite transcribir o interpretar voz en el propio dispositivo, útil en apps de asistencia para personas con discapacidad auditiva o en entornos sin conectividad.
- **Análisis de imágenes en el borde**: el módulo de visión posibilita tareas de descripción de imágenes o extracción de información visual en IoT y cámaras inteligentes, sin depender de un backend.
- **Atención al cliente en kioscos y terminales**: con contexto de hasta 32k tokens, el modelo puede mantener conversaciones multi-turno en terminales de autoservicio con conectividad intermitente.
- **Automatización de flujos con *function calling***: LiteRT-LM expone APIs de llamada a funciones, lo que permite al modelo invocar acciones locales (ajustes del sistema, consultas a bases de datos embebidas) en aplicaciones de escritorio.
- **Prototipado rápido en web**: el Space de Hugging Face y el soporte web del formato permiten probar el modelo en navegador antes de integrarlo en producción.
- **Procesamiento de documentos en el dispositivo**: combinación de texto y visión para resumir o extraer datos de documentos escaneados en aplicaciones de escritorio, sin subir información sensible.

## Benchmarks y rendimiento

La model card menciona que se ejecutaron benchmarks con 1024 tokens de prefill y 256 de decode, contexto de 2048 tokens, CPU con XNNPACK y 4 hilos, y cachés habilitadas, pero el texto proporcionado se interrumpe antes de incluir los resultados numéricos. Por tanto:

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **Tamaño en disco**: 3,66 GB para el fichero `.litertlm` completo (texto + embeddings + módulos de visión y audio).
- **Memoria en ejecución**: los pesos principales del decodificador (2,24 GB) se mantienen siempre en memoria; los embeddings (0,67 GB) se mapean desde disco, lo que reduce la memoria de trabajo en plataformas que lo soportan. Los módulos de visión y audio se cargan solo cuando se usan.
- **GPU de escritorio**: no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible; el runtime está orientado a aceleración en CPU (XNNPACK) y GPU (ML Drift) en plataformas de borde.
- **GPU de consumo**: no hay datos publicados sobre compatibilidad con GPU de consumo específicas; el diseño apunta a dispositivos móviles y de borde más que a estaciones de trabajo.
- **Opciones de despliegue**: LiteRT-LM (CLI de escritorio, SDK para Android/iOS, runtime web), Google AI Edge Gallery para pruebas en móvil, y el Space de Hugging Face para demo web. No se distribuye en formatos para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles numéricamente; la model card indica que el tiempo hasta el primer token excluye el tiempo de carga y que las pruebas usan 4 hilos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| litert-community/gemma-4-E4B-it-litert-lm | No disponible (3,66 GB empaquetado) | 32k | `.litertlm` / LiteRT-LM | Apache 2.0 | Multimodal (texto, visión, audio), orientado a dispositivo |
| google/gemma-4-E4B-it | No disponible | No disponible en esta ficha | Safetensors y otros formatos del modelo base | Términos de Gemma (según modelo base) | Modelo original del que deriva esta cuantización |
| Alternativas de tamaño similar para borde | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

La comparación con otras familias (Qwen, Llama, Phi en variantes pequeñas) no se incluye porque no hay datos en la información proporcionada que permitan una comparación rigurosa de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- **Licencia**: el repositorio declara Apache 2.0, pero al derivar de `google/gemma-4-E4B-it` conviene verificar los términos del modelo base de Google antes de un uso comercial, ya que las licencias de Gemma han incluido históricamente condiciones de uso aceptable.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir información falsa con apariencia plausible; no se han publicado evaluaciones de fidelidad en la información disponible.
- **Sesgos**: no se documentan evaluaciones de sesgo ni mitigaciones en la model card.
- **Idiomas**: no se especifica la cobertura lingüística; no debe asumirse un rendimiento uniforme en castellano sin validación previa.
- **Contexto**: aunque se anuncian 32k tokens, los benchmarks se ejecutaron con 2048, y el rendimiento en contextos largos no está documentado.
- **Ecosistema restringido**: el formato `.litertlm` solo es utilizable con LiteRT-LM; no hay pesos en safetensors, GGUF ni compatibilidad con vLLM o llama.cpp en este repositorio, lo que limita su integración en pilas de servidor convencionales.
- **Datos incompletos**: no se publican parámetros totales, composición del dataset, ni resultados de benchmarks numéricos, lo que dificulta una evaluación rigurosa antes de producción.
- **Memoria en dispositivo**: aunque los embeddings se mapean, los 2,24 GB de pesos del decodificador deben residir en memoria, lo que puede ser limitante en móviles de gama baja.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Documentación de LiteRT-LM: https://ai.google.dev/edge/litert-lm/overview
- CLI de LiteRT-LM (escritorio e IoT): https://ai.google.dev/edge/litert-lm/cli
- Google AI Edge Gallery en Android: https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Google AI Edge Gallery en iOS: https://apps.apple.com/us/app/google-ai-edge-gallery/id6749645337
- Demo web en Hugging Face Spaces: https://huggingface.co/spaces/tylermullen/Gemma4
