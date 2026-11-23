# jungroo-ai/redefiner-0.8b

## Resumen

ReDefiNER 0.8B es un modelo de reconocimiento de entidades nombradas (NER) y extracción de información desarrollado por Jungroo AI Labs. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-0.8B, con 755.675.585 parámetros reales, especializado en span-labeling y token-classification. Su particularidad es que no es generativo: no escribe texto nuevo, sino que marca y etiqueta spans exactos del texto de entrada según un "rulebook" en inglés llano que define los tipos de entidad que el usuario quiere extraer.

El modelo resuelve el problema de la extracción de entidades personalizable sin reentrenamiento: el usuario edita un fichero de reglas en lenguaje natural (tipos de entidad, descripciones de una línea y reglas específicas) y el modelo aplica esas definiciones sobre el texto. Esto lo hace adecuado para detección de PII, redacción de datos sensibles y extracción de información estructurada en dominios cambiantes, sin necesidad de anotar datos ni reentrenar el modelo.

Es relevante ahora porque ofrece un rendimiento cercano a modelos frontera en una tarea concreta (68,1 F1 en CrossNER AI frente a 73,1 de Claude Haiku 5.5 y 72,4 de Gemini 3.1 Pro, con el mismo rulebook) ejecutándose en CPU, con un único fichero int8 de 0,77 GB, licencia Apache 2.0 y funcionamiento offline. Está pensado para equipos que no pueden enviar datos fuera de sus servidores, como banca, sanidad y administración pública.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-0.8B) con cabezas propias de span y label |
| Parámetros totales | 755.675.585 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; rulebooks probados hasta ~10.000 tokens; spans de hasta 16 tokens por defecto (64 para PII) |
| Tipos de cuantización | int8 (fichero de 0,77 GB); etiqueta 8-bit en Hugging Face |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carga mediante el paquete `redefiner`, no solo `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,8 mil millones de parámetros, y se ha ajustado como modelo de token-classification con cabezas específicas de span y label. A diferencia de un modelo generativo, su salida son spans de caracteres exactos, cada uno con un tipo y una puntuación de confianza. La innovación principal es el control mediante rulebook: el comportamiento se define en tiempo de inferencia mediante un fichero de reglas en inglés llano con tipos de entidad, descripciones de una línea y reglas adicionales (por ejemplo, "etiquetar el nombre completo; excluir títulos como Dr o Prof"). No se requiere reentrenamiento para cambiar qué entidades se extraen.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo soporta dos modos: extract mode, que localiza y etiqueta spans en el texto, y label mode, que tipifica spans ya proporcionados por el usuario. La liberación de pesos corresponde a la versión 1.0 (octubre de 2026) y el paquete `redefiner` a la versión 1.0.10.

## Capacidades

- Extracción de entidades nombradas (NER) definidas por el usuario mediante un rulebook en inglés llano, sin reentrenamiento.
- Span-labeling con devolución de spans de caracteres exactos, tipo de entidad y confianza.
- Label mode: tipificación de spans ya identificados por el usuario.
- Detección de PII (información personal identificable) y apoyo a redacción de datos sensibles.
- Extracción de información estructurada en dominios diversos (producto, versión, dispositivo, código de error, organización, etc.).
- Rule-following: aplicación de reglas específicas por tipo de entidad, como exclusiones o criterios de etiquetado.
- Ejecución en CPU y en GPU NVIDIA; funcionamiento offline una vez descargado.
- Interfaces Python (`Tagger.extract`, `Tagger.label`) y servidor HTTP local (`redefiner serve`).
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso; es exclusivamente no generativo.

## Casos de uso

- Detección y redacción de PII en atención al cliente: con un rulebook que defina PERSON, ACCOUNT_ID, EMAIL y PHONE, el modelo marca los spans sensibles en tickets y correos para su enmascaramiento antes de almacenarlos o enviarlos a terceros, sin sacar los datos del servidor.
- Cumplimiento normativo en banca y seguros: extracción de identificadores de cuenta, nombres y contactos en documentación para anonimización previa a auditorías, aprovechando que el modelo funciona offline y con licencia Apache 2.0.
- Procesamiento de documentación sanitaria: identificación de nombres de pacientes y profesionales en informes para seudonimización, con la ventaja de que el texto no abandona la infraestructura del hospital.
- Extracción de información de producto en soporte técnico: un rulebook con PRODUCT, VERSION, DEVICE y ERROR_CODE permite estructurar tickets y mensajes de error en campos explotables por sistemas de ticketing o analítica.
- Enriquecimiento de pipelines de datos con entidades personalizadas: el equipo de datos edita el rulebook para adaptar la extracción a nuevos dominios sin reentrenar ni anotar datos, reduciendo el ciclo de iteración.
- Servicio local de etiquetado vía HTTP: despliegue con `redefiner serve` en un servidor CPU para ofrecer extracción de entidades a otras aplicaciones internas, con latencias de 0,4–0,7 s por frase en CPU de 4 núcleos o Apple M2.
- Preetiquetado para anotación humana: uso del modelo para generar spans candidatos que los anotadores revisan, acelerando la construcción de datasets de NER en dominios nuevos.

## Benchmarks y rendimiento

| Benchmark | ReDefiNER 0.8B | Claude Haiku 5.5 | Gemini 3.1 Pro |
|---|---|---|---|
| CrossNER AI (F1) | 68,1 | 73,1 | 72,4 |

Los resultados corresponden a CrossNER AI con el mismo rulebook, según la model card. El modelo se ejecuta en CPU y queda aproximadamente 5 puntos F1 por debajo de Claude Haiku 5.5 y 4,3 por debajo de Gemini 3.1 Pro. No se han publicado en la información disponible resultados de otros benchmarks como MMLU, HumanEval o GSM8K, ni comparativas con modelos de investigación publicados más allá de la referencia genérica de la model card.

## Requisitos de hardware

- VRAM estimada: el modelo se distribuye como un único fichero int8 de 0,77 GB; en CPU consume aproximadamente 2–2,6 GB de memoria en pico.
- GPU recomendadas: NVIDIA A10 o RTX A5000 para inferencia acelerada (0,05 s por texto); también funciona en cualquier GPU NVIDIA disponible según el paquete.
- CPU: funciona en CPU convencional; 0,4–0,7 s por frase en un procesador de 4 núcleos o en un Apple M2 en extract mode con el rulebook cargado.
- Cabe en GPU de consumo: sí, dado su tamaño (0,8B parámetros, fichero int8 de 0,77 GB), aunque la model card no detalla modelos concretos de consumo.
- Opciones de despliegue: paquete Python `redefiner` (`Tagger.from_pretrained`) y servidor HTTP local (`redefiner serve`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; la carga requiere el paquete `redefiner` por sus cabezas propias de span y label.
- Latencia y throughput: 0,4–0,7 s por frase en CPU de 4 núcleos o Apple M2; 0,05 s por texto en NVIDIA A10 o RTX A5000.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CrossNER AI (F1) | Licencia | Despliegue |
|---|---|---|---|---|---|
| ReDefiNER 0.8B | 755.675.585 | no disponible (rulebooks hasta ~10.000 tokens) | 68,1 | Apache 2.0 | CPU/GPU, offline, paquete `redefiner` |
| Claude Haiku 5.5 | no disponible | no disponible | 73,1 | propietaria | API en la nube |
| Gemini 3.1 Pro | no disponible | no disponible | 72,4 | propietaria | API en la nube |

La comparativa se limita a los datos publicados en la model card. ReDefiNER pierde entre 4 y 5 puntos F1 frente a los modelos frontera citados, pero ofrece ejecución local en CPU, funcionamiento offline, licencia Apache 2.0 y ausencia de coste por uso, lo que lo hace adecuado para entornos con restricciones de privacidad. No se dispone de comparación con modelos NER de investigación publicados en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay soporte multilingüe declarado.
- Spans limitados a 16 tokens por defecto, ampliables con `max_span_tokens` (64 para PII); entidades más largas pueden no detectarse correctamente.
- Rulebooks probados hasta aproximadamente 10.000 tokens; reglas más extensas no están validadas.
- En textos largos, cada parte se procesa de forma independiente, por lo que las etiquetas pueden diferir a lo largo de un mismo documento.
- Modelo no generativo: no produce texto, no razona de forma multi-paso ni soporta tool calling o agentes.
- Riesgo de alucinación de spans: al ser un modelo de etiquetado, puede marcar spans incorrectos o con tipo erróneo, especialmente con rulebooks ambiguos o dominios poco representados.
- No se dispone de información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, modificación y redistribución; no se declaran restricciones adicionales.
- Para producción, conviene validar el rendimiento con el rulebook concreto del dominio, ya que el comportamiento depende fuertemente de la calidad y claridad de las reglas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jungroo-ai/redefiner-0.8b
- Repositorio de código: https://github.com/jungroo-ai/redefiner
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/jungroo-ai/redefiner-demo
- Documentación de label mode: https://github.com/jungroo-ai/redefiner#label-mode
- Detalles de velocidad: https://github.com/jungroo-ai/redefiner#speed
- Changelog: https://github.com/jungroo-ai/redefiner/blob/main/CHANGELOG.md
- Sitio del autor: https://jungroo.com
- Página del producto: https://jungroo.com/redefiner/
- Contacto: hello@jungroo.com
