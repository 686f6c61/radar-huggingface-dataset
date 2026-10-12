# muhamad-geosurge/invert-polarity-ba6e9a2c-5741-4180-98d8-772ab7fdbf70

## Resumen

Este repositorio, publicado por el usuario `muhamad-geosurge`, es un ajuste fino (*fine-tune*) del modelo multimodal `google/gemma-4-E4B` de Google DeepMind, etiquetado con el identificador `invert-polarity-ba6e9a2c-5741-4180-98d8-772ab7fdbf70`. La model card no incluye ninguna descripción del proceso de ajuste, del dataset empleado ni del objetivo concreto del *fine-tune*: el README es una copia de la plantilla oficial de la familia Gemma 4, por lo que toda la información técnica disponible procede del modelo base y no del derivado. El repositorio declara la etiqueta de arquitectura `gemma4_text`, la librería `transformers` y el pipeline `any-to-any`.

El modelo base E4B pertenece a la gama pequeña de Gemma 4, diseñada para ejecución local en portátiles y dispositivos móviles. Emplea un transformer decoder-only denso con 42 capas, atención híbrida (ventana deslizante de 512 tokens intercalada con atención global), embeddings por capa (PLE, *Per-Layer Embeddings*) y una ventana de contexto de 128K tokens. Según el recuento real de safetensors del repositorio, el modelo contiene 7.518.082.346 parámetros, cifra coherente con los "8B con embeddings" que Google atribuye al E4B (4,5B efectivos más las tablas de embeddings PLE).

Su relevancia práctica es doble. Por un lado, hereda de Gemma 4 el soporte multimodal de texto, imagen y audio en un tamaño que cabe en GPU de consumo, con *function calling* nativo y modos de razonamiento configurables. Por otro, es un ejemplo de repositorio derivado de tercera parte con escasa trazabilidad: cero descargas, cero *likes*, sin *dataset card* ni documentación del ajuste, lo que obliga a evaluarlo empíricamente antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con atención híbrida (sliding window local + atención global; última capa siempre global), Per-Layer Embeddings (PLE) y Proportional RoPE (p-RoPE) en capas globales |
| Parámetros totales | 7.518.082.346 (dato real de safetensors); el modelo base declara 4,5B efectivos y 8B contando embeddings |
| Parámetros activos | No aplica: el modelo base E4B es denso, no es Mixture-of-Experts |
| Longitud de contexto | 128K tokens (modelo base E4B), con ventana deslizante de 512 tokens |
| Tipos de cuantización | No disponible en el repositorio (solo safetensors). El tamaño del repo (15,1 GB) es consistente con pesos en FP16/BF16 a ~2 bytes por parámetro; no se documentan conversiones GGUF, AWQ o GPTQ |
| Idiomas soportados | El campo de idiomas del repositorio figura como no disponible. La documentación de la familia Gemma 4 declara soporte multilingüe en más de 140 idiomas |
| Licencia | apache-2.0 según los metadatos, con enlace a la licencia específica de Gemma 4 (`license_link`). Existe discrepancia entre ambas referencias (véase Limitaciones) |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | google/gemma-4-E4B |
| Autor del repositorio | muhamad-geosurge (derivado de tercera parte, no oficial de Google) |
| Pipeline declarado | any-to-any |
| Modalidades de entrada | Texto, imagen y audio (según el modelo base E4B: encoder de visión de ~150M y encoder de audio de ~300M) |
| Modalidad de salida | Texto |
| Capas | 42 (modelo base E4B) |
| Tamaño del vocabulario | 262.000 tokens (modelo base E4B) |
| Tamaño del repositorio | 15,1 GB |
| Fecha de publicación | 2026-10-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Gemma 4 E4B, un transformer decoder-only denso con un mecanismo de atención híbrido que intercala capas de atención local con ventana deslizante de 512 tokens y capas de atención global, garantizando que la capa final sea siempre global. Este diseño busca combinar el bajo coste de memoria y la velocidad de un modelo ligero con la capacidad de modelar dependencias largas en contextos de hasta 128K tokens. Para optimizar el consumo en contextos extensos, las capas globales emplean claves y valores unificados (*unified Keys and Values*) y aplican Proportional RoPE (p-RoPE).

El rasgo arquitectónico más distintivo de la variante E4B son los Per-Layer Embeddings (PLE): en lugar de añadir capas o parámetros al decoder, cada capa recibe su propia tabla de embeddings pequeña por token. Estas tablas son grandes en número de parámetros pero solo se usan para búsquedas rápidas, de ahí que Google distinga entre parámetros efectivos (4,5B) y parámetros totales con embeddings (8B). Esto explica la diferencia aparente entre el recuento de safetensors de este repositorio (7,5B) y la cifra efectiva publicitada. El vocabulario es de 262.000 tokens y el modelo incorpora encoders multimodales dedicados de aproximadamente 150M parámetros para visión y 300M para audio.

Respecto al entrenamiento del modelo base, la información proporcionada no detalla el número de tokens, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO; la documentación solo indica que existen variantes preentrenadas y ajustadas a instrucciones. Sobre el *fine-tune* `invert-polarity` no hay absolutamente ningún dato: ni dataset, ni método de ajuste, ni hiperparámetros, ni evaluación publicada por el autor. El identificador del repositorio incluye un sufijo hexadecimal (`ba6e9a2c-5741-4180-98d8-772ab7fdbf70`) que sugiere una generación automatizada o por lotes, sin que esto pueda confirmarse con la información disponible.

## Capacidades

Las siguientes capacidades corresponden al modelo base Gemma 4 E4B según su documentación oficial. No hay verificación independiente de que el *fine-tune* las conserve intactas:

- Generación de texto con razonamiento explícito y modos de pensamiento configurables (*thinking modes*).
- Generación y comprensión de código, con mejoras declaradas por Google en benchmarks de programación dentro de la familia Gemma 4.
- Entrada de imagen con soporte de relación de aspecto y resolución variable, procesada mediante un encoder de visión de ~150M de parámetros.
- Entrada de audio nativa, con un encoder de ~300M de parámetros (el audio no está disponible en el modelo de 31B de la familia, pero sí en E2B, E4B y 12B).
- *Tool calling* y *function calling* nativos, orientados a flujos agénticos.
- Razonamiento multi-paso y comportamiento agéntico en tareas con varias llamadas a herramientas.
- Soporte nativo del rol `system` para prompts de sistema estructurados y controlables.
- Capacidad multilingüe declarada en más de 140 idiomas por la documentación de la familia.
- Contexto de 128K tokens, adecuado para documentos largos y conversaciones multi-turno extensas.
- Optimización para ejecución en dispositivo (*on-device*), incluida la reducción de huella de memoria mediante PLE.

## Casos de uso

- Asistente documental con contexto largo: el modelo puede ingerir documentos de decenas de miles de tokens en una sola ventana de 128K y responder preguntas sobre ellos sin necesidad de recuperación externa, lo que simplifica arquitecturas RAG para corpus de tamaño medio.
- Análisis de capturas, diagramas e interfaces: gracias al encoder de visión y al soporte de relación de aspecto variable, puede extraer información estructurada de capturas de pantalla, gráficos o diagramas técnicos y devolverla como texto o JSON.
- Transcripción y resumen de audio: la entrada nativa de audio permite procesar notas de voz, reuniones o entrevistas y generar resúmenes o actas sin depender de un modelo ASR externo, siempre que se valide la calidad real del encoder en el ajuste concreto.
- Agente con herramientas en pipelines de automatización: el *function calling* nativo permite conectarlo a APIs internas (calendario, ticketing, bases de datos) y orquestar tareas de varios pasos con el rol `system` definiendo políticas de actuación.
- Asistencia de programación en local: al ser un modelo de ~7,5B parámetros, puede desplegarse en un portátil o una estación de trabajo para autocompletado, generación de tests o revisión de código sin enviar el código fuente a servicios externos.
- Procesamiento por lotes en el borde (*edge*): en escenarios con requisitos de soberanía de datos o conectividad limitada, el modelo puede ejecutarse en una GPU de consumo o incluso cuantizado en un portátil para clasificación, extracción de entidades y resumen de documentos.
- Moderación y enrutado de consultas: con 128K de contexto y bajo coste por token, resulta viable clasificar y dirigir consultas de usuario hacia modelos mayores en una arquitectura de *cascada*, reservando los modelos grandes para los casos complejos.
- Evaluación comparativa de ajustes: por su tamaño contenido, sirve como banco de pruebas para estudiar cómo un *fine-tune* de terceros afecta a las capacidades multimodales y de razonamiento del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor del repositorio no incluye métricas de evaluación del *fine-tune*, y la documentación del modelo base recogida en el README está truncada antes de la sección de resultados, por lo que tampoco se dispone de cifras de MMLU, HumanEval, GSM8K u otros conjuntos para el propio Gemma 4 E4B. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.

## Comparativa con modelos similares

La única información cuantitativa disponible corresponde a la propia familia Gemma 4. No se proporcionaron datos de modelos competidores (Llama, Qwen, Mistral u otros), por lo que la comparación externa figura como no disponible.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Ventana deslizante | Modalidades | Licencia |
|---|---|---|---|---|---|---|
| Este repositorio (fine-tune de E4B) | 7,52B (safetensors) | No aplica (denso) | 128K (heredado) | 512 tokens | Texto, imagen, audio | apache-2.0 (con enlace a licencia Gemma 4) |
| Gemma 4 E2B | 2,3B efectivos / 5,1B con embeddings | No aplica (denso) | 128K | 512 tokens | Texto, imagen, audio | Apache 2.0 / licencia Gemma 4 |
| Gemma 4 E4B (base) | 4,5B efectivos / 8B con embeddings | No aplica (denso) | 128K | 512 tokens | Texto, imagen, audio | Apache 2.0 / licencia Gemma 4 |
| Gemma 4 12B Unified | 11,95B | No aplica (denso) | 256K | 1024 tokens | Texto, imagen, audio | Apache 2.0 / licencia Gemma 4 |
| Gemma 4 26B A4B MoE | 25,2B | 3,8B | 256K | 1024 tokens | Texto, imagen | Apache 2.0 / licencia Gemma 4 |
| Gemma 4 31B Dense | 30,7B | No aplica (denso) | 256K | 1024 tokens | Texto, imagen | Apache 2.0 / licencia Gemma 4 |

Comparación con modelos de otros fabricantes: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Trazabilidad nula del ajuste: no hay *dataset card*, descripción del método, hiperparámetros ni evaluación. El README es la plantilla oficial de Gemma 4 sin adaptar, lo que impide saber qué modificó el *fine-tune* sobre el modelo base. Cualquier capacidad listada arriba debe verificarse empíricamente.
- Riesgo de degradación de capacidades: un ajuste fino sin documentar puede deteriorar el razonamiento, el multilingüismo o las capacidades multimodales del modelo base, o introducir sesgos específicos del dataset utilizado (por ejemplo, un sesgo temático derivado del nombre "invert-polarity").
- Riesgo de alucinación: inherente a los modelos de ~7,5B parámetros y especialmente relevante en tareas de precisión factual, razonamiento aritmético complejo y contexto muy largo. No se dispone de tasas de alucinación medidas.
- Sesgos conocidos: no disponibles. No se documentan evaluaciones de sesgo, toxicidad o equidad para este repositorio ni para el modelo base en la información proporcionada.
- Limitaciones de idioma: el campo de idiomas del repositorio está vacío. La cifra de "más de 140 idiomas" corresponde a la familia Gemma 4 y no está validada para este ajuste; el rendimiento en castellano es desconocido.
- Ambigüedad de licencia: los metadatos declaran `apache-2.0`, pero el `license_link` apunta a la licencia específica de Gemma 4 de Google, que es un documento distinto con sus propias condiciones y política de usos prohibidos. Antes de un uso comercial hay que aclarar cuál de las dos rige y si el *fine-tune* puede redistribuirse bajo los términos que el autor declara.
- Modelo derivado no oficial: no está publicado por Google DeepMind. No hay garantía de que los pesos correspondan realmente a un ajuste del E4B más allá de lo que declara el campo `base_model`.
- Estado del repositorio: cero descargas y cero *likes*, publicado y actualizado con un minuto de diferencia, lo que sugiere un artefacto no mantenido.
- Contexto real vs. nominal: aunque la ventana es de 128K tokens, el rendimiento efectivo en el extremo superior no está documentado y el coste de caché KV a esa longitud puede ser prohibitivo en hardware de consumo.
- Sin cuantizaciones publicadas: hay que generar las conversiones GGUF/AWQ/GPTQ por cuenta propia, con el riesgo de pérdida de calidad que ello implica y sin referencias de calibración.

## Requisitos de hardware

Estimaciones derivadas del recuento real de parámetros (7.518.082.346) y del tamaño del repositorio; no proceden de mediciones publicadas por el autor:

- Pesos en FP16/BF16: aproximadamente 15 GB solo para parámetros, en línea con los 15,1 GB del repositorio. Con caché KV, activaciones y buffers de los encoders multimodales, conviene reservar 18-20 GB de VRAM.
- Pesos en INT8: aproximadamente 7,5-8 GB, más overhead; manejable en GPUs de 12-16 GB.
- Pesos en INT4: aproximadamente 4-5 GB, lo que permite ejecución en GPUs de 8 GB e incluso en portátiles con memoria unificada.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100 y L40S para servir en FP16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 en uso individual; RTX 4080/4070 Ti (16 GB) para INT8; RTX 3060 12 GB o inferiores para INT4.
- Cabe en GPU de consumo: sí. En FP16 en tarjetas de 24 GB; en INT8 en tarjetas de 16 GB; en INT4 en tarjetas de 8-12 GB. El contexto largo (128K) puede agotar la memoria antes que los pesos, por lo que en hardware de consumo se recomienda limitar la ventana efectiva.
- Memoria de la caché KV: el diseño híbrido con ventana deslizante y claves/valores unificados en las capas globales reduce la huella frente a un transformer con atención global completa, pero no se dispone de cifras concretas por token para este modelo.
- Opciones de despliegue: `transformers` con soporte de la arquitectura `gemma4_text`; vLLM o TGI para servido con *paged attention* en producción; llama.cpp u Ollama requieren convertir previamente los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token para este repositorio ni para el modelo base en la información proporcionada.
