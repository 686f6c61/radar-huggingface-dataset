# mradermacher/Fikra-Model-2-Micro-GGUF

## Resumen

Fikra-Model-2-Micro-GGUF es una compilación de cuantizaciones estáticas en formato GGUF del modelo base zabibutechnika/Fikra-Model-2-Micro, realizada por el usuario mradermacher (nethype GmbH). El modelo original está desarrollado por Zabibu Technika, una iniciativa vinculada a Kenia, y está orientado a despliegues en el borde (edge) y en dispositivos móviles, con soporte para LiteRT según las etiquetas de la model card. Se trata de un modelo conversacional de tipo transformer con aproximadamente 772,8 millones de parámetros totales, lo que lo sitúa en la gama de modelos pequeños aptos para hardware modesto.

La relevancia de esta ficha radica en que el repositorio proporciona una batería de cuantizaciones que van desde Q2_K (0,5 GB) hasta f16 (1,7 GB), lo que permite ejecutar el modelo en GPUs de consumo, CPUs y entornos embebidos. El modelo declara soporte para inglés (en) y suajili (sw), una combinación poco habitual que lo hace interesante para aplicaciones de PLN en África Oriental.

La licencia es Apache 2.0, lo que facilita su uso comercial. No obstante, la información publicada sobre el modelo base es muy limitada: no se detallan la arquitectura exacta, los datos de entrenamiento, la longitud de contexto ni los resultados de benchmarks, por lo que muchos campos de esta ficha deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle exacto no disponible) |
| Parametros totales | 772.845.888 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | Ingles (en), suajili (sw) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); pesos originales en safetensors (modelo base) |

## Arquitectura y entrenamiento

La model card del repositorio de cuantizaciones no describe la arquitectura interna del modelo base. Por los metadatos disponibles (transformers como librería, 772,8 millones de parámetros, etiquetas de modelo conversacional) se puede inferir que se trata de un transformer decoder-only de pequena escala, pero no se confirma el número de capas, la dimensión oculta, el tipo de atención ni la función de activación. Tampoco se especifica si emplea técnicas como atención lineal, decodificación especulativa o mezcla de expertos; el recuento de parámetros activos no aplica al no ser un modelo MoE.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o ajuste supervisado, ni sobre el tokenizador. La model card del cuantizador se limita a indicar que se trata de cuantizaciones estáticas generadas con convert_type hf y quantize_version 2, y que no se han publicado cuantizaciones ponderadas o con imatrix en el momento de la captura. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa y, por tanto, se marca como no disponible.

## Capacidades

- Generación de texto conversacional en inglés y suajili, según los idiomas declarados en la model card.
- Soporte de formato conversacional (etiqueta "conversational" y "endpoints_compatible" en los metadatos de Hugging Face), lo que sugiere compatibilidad con plantillas de chat.
- Despliegue en el borde y en móviles: las etiquetas "edge", "mobile" y "litert" indican que el modelo base está pensado para entornos con recursos limitados, incluida la inferencia con LiteRT (anteriormente TensorFlow Lite).
- Capacidades multimodales potenciales: el repositorio incluye ficheros mmproj (multi-modal supplement) en Q8_0 y f16, lo que sugiere que el modelo base podría aceptar entradas de imagen o al menos que la arquitectura contempla un proyector multimodal. No se detalla en la model card qué modalidad cubre exactamente.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y comportamiento agéntico: no disponible.
- Modo "thinking" explícito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistentes conversacionales en suajili para atención al ciudadano: el modelo declara soporte de suajili y un tamaño reducido que permite desplegarlo en servidores modestos o incluso en dispositivos locales, lo que resulta útil para servicios públicos en Kenia y África Oriental con conectividad limitada.
- Aplicaciones móviles offline: con cuantizaciones de 0,5 a 0,9 GB (Q2_K a Q8_0) y la etiqueta litert, el modelo puede integrarse en apps Android o iOS que funcionen sin conexión, por ejemplo para traducción o asistencia básica en zonas rurales.
- Prototipado rápido en portátiles: la versión Q4_K_M (0,6 GB) se puede ejecutar con llama.cpp u Ollama en un portátil sin GPU dedicada, lo que facilita experimentar con el modelo antes de invertir en infraestructura.
- Filtrado y clasificación de textos bilingües inglés-suajili: el modelo puede emplearse para tareas de etiquetado, moderación o enrutamiento de mensajes en pipelines de datos, aprovechando su naturaleza conversacional y su bajo coste de inferencia.
- Educación y tutoría básica: un modelo de 772 M de parámetros puede servir como tutor de conversación en entornos con hardware limitado, respondiendo preguntas sencillas y manteniendo diálogos multi-turno (siempre que la longitud de contexto, no publicada, sea suficiente).
- Investigación en PLN de bajos recursos: el modelo es un punto de partida para estudiar el rendimiento de modelos pequeños en suajili y comparar técnicas de cuantización (Q2_K frente a Q8_0) en tareas downstream, dado que el repositorio ofrece una matriz completa de cuantizaciones.
- Despliegue en entornos embebidos y edge computing: con la variante f16 (1,7 GB) o Q4_K_S (0,6 GB) y el soporte declarado de LiteRT, puede integrarse en dispositivos IoT o gateways con memoria limitada para tareas de comprensión y generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,6 GB para Q2_K y Q3_K_S; 0,6-0,7 GB para Q4_K_S, Q4_K_M, IQ4_XS y Q5_K; 0,7 GB para Q6_K; 0,9 GB para Q8_0; 1,7 GB para f16. Añadir 0,2-0,3 GB si se usa el proyector multimodal mmproj.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones pequeñas; una RTX 3060, RTX 4060 o superior ofrece margen para Q8_0 y f16 con contexto amplio. Para despliegues en servidor, una A100 o H100 es sobredimensionada para este tamaño, pero puede usarse para servir muchas instancias en paralelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos años (GTX 1650, RTX 3050, RTX 4090, etc.), así como en iGPUs y en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF; el modelo base podría ejecutarse con transformers y, por las etiquetas, con LiteRT en móviles.
- Latencia y throughput estimados: no disponibles. En un portátil moderno con CPU, un modelo de 772 M en Q4_K_M suele generar decenas de tokens por segundo, pero no se ha publicado una medición oficial para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Fikra-Model-2-Micro | 772,8 M | No disponible | en, sw | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-0.5B | 0,5 B | 32.768 tokens (según documentación pública de Qwen) | multilingüe | Apache 2.0 | safetensors, GGUF |
| Gemma 3 1B | 1 B | 32.000 tokens (según documentación pública de Google) | multilingüe | Gemma Terms of Use | safetensors, GGUF |
| SmolLM2-1.7B | 1,7 B | 8.192 tokens (según documentación pública de Hugging Face) | inglés principalmente | Apache 2.0 | safetensors, GGUF |

La comparativa es orientativa: los datos de los modelos alternativos provienen de su documentación pública y no de una evaluación conjunta. Fikra-Model-2-Micro destaca por su soporte declarado de suajili y su orientación a LiteRT/edge, mientras que los modelos de Qwen, Google y Hugging Face ofrecen contextos más largos y documentación más completa. No se dispone de benchmarks comparativos para Fikra-Model-2-Micro.

## Limitaciones y advertencias

- Información muy escasa: la model card del cuantizador no incluye detalles de arquitectura, contexto, entrenamiento ni evaluación, lo que dificulta estimar su calidad real en producción.
- Riesgo de alucinación: como todo modelo generativo de pequeño tamaño, es propenso a inventar datos, especialmente en dominios especializados y en suajili, donde los datos de entrenamiento suelen ser escasos.
- Sesgos conocidos: no documentados; al desconocerse la composición del dataset, no se pueden evaluar sesgos de género, etnia o religión.
- Limitaciones de idioma: solo se declaran inglés y suajili; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede asegurar el comportamiento en conversaciones largas o en tareas de recuperación de información.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base (zabibutechnika/Fikra-Model-2-Micro) por si hubiera condiciones adicionales no reflejadas en el repositorio de cuantizaciones.
- Cuantizaciones de baja calidad: Q2_K y Q3_K pueden degradar notablemente la coherencia; para producción se recomienda Q4_K_M o superior.
- Soporte multimodal incierto: la presencia de ficheros mmproj sugiere capacidades multimodales, pero no se documenta qué modalidad ni con qué calidad.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la captura, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Fikra-Model-2-Micro-GGUF
- Modelo base: https://huggingface.co/zabibutechnika/Fikra-Model-2-Micro
- Página de descargas del cuantizador: https://hf.tst.eu/model#Fikra-Model-2-Micro-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
