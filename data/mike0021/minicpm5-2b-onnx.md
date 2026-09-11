# Mike0021/MiniCPM5-2B-ONNX

## Resumen

MiniCPM5-2B-ONNX es una conversión independiente del checkpoint oficial openbmb/MiniCPM5-2B a formato ONNX, publicada por el usuario Mike0021 y orientada a inferencia en navegador mediante WebGPU a través de transformers.js. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: el autor parte del checkpoint BF16 oficial (revisión abe115e887989b14f05e64a3b260648329324c3f) y lo exporta con ONNX Runtime GenAI 0.15.2 en cuantización int4 simétrica con bloques de 32 elementos, activaciones y caché KV en FP16 (configuración q4f16).

Su relevancia está en el nicho de ejecución local en el cliente: permite servir un modelo conversacional de aproximadamente 2.000 millones de parámetros dentro de un navegador Chromium sin backend de GPU dedicado, con soporte de streaming, modo de razonamiento (thinking mode) y generación de llamadas a herramientas en XML. El autor documenta el proceso de conversión, los hashes SHA-256 del checkpoint de origen y un manifiesto con tamaños y hashes de cada fichero, lo que facilita la verificación de integridad de la conversión.

El repositorio ocupa 1,8 GB y se distribuye en siete shards de datos externos, con la asignación de embeddings de 510 MiB dividida en cuatro tensores de 127,5 MiB para reducir los requisitos de binding de memoria del runtime. La licencia declarada es Apache 2.0. No hay datos publicados sobre número de tokens de entrenamiento, composición del dataset ni proceso de alineación, ya que esa información correspondería al modelo base y no se incluye en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con etiqueta "llama" en el repositorio; incluye GQA, RoPE y operaciones QKV fusionadas. Número de capas, dimensión oculta y cabezas: no disponible |
| Parametros totales | Aproximadamente 2.000 millones según la denominación del modelo (MiniCPM5-2B); no se detalla el recuento exacto en la información disponible |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible. La validación del autor incluye un caso de recuperación con 3.888 tokens de prompt |
| Tipos de cuantizacion | int4 simétrico con block size 32, activaciones y caché KV en FP16 (q4f16); existe también una exportación FP16 ONNX usada como referencia de validación |
| Idiomas soportados | no disponible. La model card menciona una prueba con un prompt aritmético en chino, lo que sugiere cobertura de chino en el modelo base, sin confirmación formal |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ONNX Runtime GenAI 0.15.2), en 7 shards de datos externos; manifiesto manifest.json con tamaños y SHA-256 |
| Libreria declarada | transformers.js |
| Pipeline | text-generation |
| Tamano del repositorio | 1,8 GB |
| Modelo base | openbmb/MiniCPM5-2B (revisión abe115e887989b14f05e64a3b260648329324c3f) |
| SHA-256 del peso oficial verificado | 14fb8e7f0a18d53d1f239773758bf581cee7e456a4523a54622c3a245b64402c |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

La ficha no documenta ningún entrenamiento por parte del autor: el trabajo consiste en una conversión de pesos. El checkpoint de origen es openbmb/MiniCPM5-2B en BF16 y el resultado es un grafo ONNX optimizado para ONNX Runtime GenAI 0.15.2, con operadores fusionados de QKV, GQA, RoPE y normalización. Dos decisiones de ingeniería destacan sobre el resto: la selección de logits de la última posición antes de la proyección de salida y la división sin pérdida de la asignación de embeddings de 510 MiB en cuatro tensores de 127,5 MiB. Esta fragmentación permite ejecutar la inferencia con límites de binding de memoria muy ajustados en WebGPU, algo relevante en navegadores con restricciones de asignación.

El autor también corrige la serialización del historial de herramientas y la compatibilidad con plantillas Jinja, problemas habituales al exportar modelos conversacionales con soporte de tool calling. La validación publicada cubre seis prompts con prefill y decodificación con caché, lo que suma 41 posiciones de predicción evaluadas. Es una comprobación de fidelidad de la conversión, no una evaluación amplia de calidad: la comparación int4 frente al BF16 oficial obtiene 36 de 41 coincidencias en el token más probable, con divergencia KL media de 0,125916, mientras que el paquete int4 final es bit a bit idéntico a la exportación int4 original del autor.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado text-generation.
- Modo de razonamiento explícito (thinking mode), verificado por el autor en pruebas locales con Chromium.
- Generación de llamadas a herramientas en formato XML, con serialización de historial de herramientas corregida en la conversión.
- Decodificación con caché KV, con soporte de prefill y reutilización de contexto.
- Streaming de tokens y parada controlada, verificados en las pruebas del autor.
- Manejo de prompts largos: se validó un caso de recuperación con 3.888 tokens de entrada.
- Capacidades multilingües: no disponibles; solo se menciona un prompt aritmético en chino.
- Visión, audio u otras modalidades: no disponibles, no se documentan.

## Casos de uso

- Asistentes conversacionales embebidos en aplicaciones web: el modelo puede ejecutarse íntegramente en el navegador del usuario mediante WebGPU y transformers.js, de modo que las conversaciones no salen del dispositivo y se elimina el coste de servidor de inferencia.
- Demostraciones y prototipos sin backend: al distribuirse como artefacto ONNX de 1,8 GB, se puede publicar en un Space o servidor estático y cargar bajo demanda, lo que simplifica las pruebas de concepto de producto.
- Agentes locales con tool calling: el modelo genera llamadas en XML que una capa de orquestación en JavaScript puede parsear y ejecutar; la conversión corrige específicamente la serialización del historial de herramientas, lo que facilita cadenas de varios pasos.
- Procesamiento de documentos con contexto moderado: la validación con 3.888 tokens de prompt y un caso de recuperación indica que puede usarse para resumir o extraer información de fragmentos largos de documentación, siempre con verificación humana.
- Aplicaciones educativas o de consulta offline: permite desplegar un asistente que funciona sin conexión una vez cacheado el modelo, útil en entornos con red restringida o en formación de campo.
- Razonamiento asistido con modo thinking: para tareas que requieren pasos intermedios explícitos, el modo de razonamiento permite separar el borrador interno de la respuesta final, algo aprovechable en generación de explicaciones técnicas.
- Preprocesado y clasificación de texto en el cliente: al ser un modelo pequeño, puede etiquetar, resumir o reformatear texto antes de enviarlo a un modelo mayor en el servidor, reduciendo coste y latencia percibida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente comprobaciones de fidelidad de la conversión sobre 41 posiciones de predicción:

| Comparacion | Coincidencia en el token mas probable | Divergencia KL media |
|---|---:|---:|
| FP16 ONNX frente a FP16 PyTorch | 41/41 | 0,00000815 |
| Int4 ONNX frente a BF16 PyTorch oficial | 36/41 | 0,125916 |
| Int4 empaquetado frente a la exportación int4 original | 41/41; logits bit a bit idénticos | 0 |
| WebGPU en navegador frente a ONNX nativo empaquetado | 41/41 | 0,002517 |

Datos de rendimiento declarados por el autor, medidos en local con Chromium sobre una GPU AMD Radeon 8060S: mediana de 35 a 42 tokens por segundo en decodificación en caliente, y una mejora de aproximadamente el 9,5 % en la latencia del primer token con 1.890 tokens de prompt respecto a su propio control con logits de todas las posiciones y embeddings sin dividir. El autor advierte que los tiempos dependen del dispositivo, el navegador, el prompt y el estado térmico.

## Requisitos de hardware

- Tamaño de descarga: 1,8 GB de repositorio, distribuidos en siete shards de datos externos. El desglose exacto entre pesos y metadatos está en manifest.json.
- Memoria de pesos: la asignación de embeddings en el checkpoint de origen es de 510 MiB, dividida en cuatro tensores de 127,5 MiB. La memoria total de pesos en int4 no se declara de forma explícita.
- Inferencia en navegador: se ha verificado en Chromium sobre GPU AMD Radeon 8060S con WebGPU, incluyendo una ejecución con el dispositivo limitado a 128 MiB de storage binding y 256 MiB de búfer.
- Cabe en GPU de consumo: sí, al menos en la GPU integrada AMD Radeon 8060S empleada en las pruebas. No se proporcionan cifras de VRAM para tarjetas discretas.
- VRAM estimada en GPU dedicada: no disponible. Cualquier cifra concreta para RTX 4090, A100 o H100 requeriría medir el consumo real del grafo ONNX, que no se documenta.
- Opciones de despliegue: transformers.js con WebGPU (escenario principal), ONNX Runtime GenAI 0.15.2 de forma nativa, y el Space de demostración asociado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no consumen directamente este formato de pesos.
- Latencia y throughput: 35 a 42 tokens/s de decodificación en caliente en el equipo de prueba; mejora del 9,5 % en latencia de primer token a 1.890 tokens de prompt. El autor insiste en que son cifras dependientes del hardware y no extrapolables a móviles, ya que no se emuló la presión de memoria ni el comportamiento térmico de un teléfono.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mike0021/MiniCPM5-2B-ONNX (este) | ~2B (denominado 2B) | no disponible | ONNX int4 q4f16 | Apache 2.0 | 0 descargas, 0 likes |
| openbmb/MiniCPM5-2B (modelo base) | ~2B | no disponible | BF16 (PyTorch) | no disponible en la informacion proporcionada | Referencia oficial de la conversion |
| Otras alternativas de ~1-3B (por ejemplo, familias Qwen o Llama de tamano similar) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye especificaciones verificadas de modelos comparables, por lo que no es posible establecer una comparación cuantitativa en parámetros, contexto o rendimiento más allá del propio modelo base.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce pérdida de calidad medible: la coincidencia con el BF16 oficial baja a 36 de 41 posiciones y la divergencia KL media sube a 0,125916, muy por encima de la observada en FP16.
- El propio autor advierte de que el modelo base comete errores: un prompt aritmético en chino produjo una respuesta incorrecta tanto en el BF16 oficial como en la conversión.
- Riesgo de alucinación inherente a un modelo de ~2B parámetros, sin datos publicados de evaluación sobre veracidad.
- Sesgos conocidos: no disponibles; no se ha publicado ninguna evaluación de sesgo para esta conversión ni para el modelo base en la información disponible.
- Idiomas soportados: no disponibles. Solo hay evidencia anecdótica de funcionamiento en chino, por lo que el rendimiento en castellano no está verificado.
- Longitud de contexto: no disponible. El caso más largo documentado es de 3.888 tokens de prompt, así que no hay garantías más allá de ese rango.
- Las llamadas a herramientas se generan en XML y la demostración no las ejecuta; cualquier uso agéntico requiere implementar un parser y una capa de ejecución con controles de seguridad propios.
- Las pruebas de memoria se hicieron en escritorio con Chromium; no se emuló la presión de memoria ni las limitaciones térmicas de un dispositivo móvil, por lo que el comportamiento en teléfonos es incierto.
- El repositorio es una conversión de terceros con 0 descargas y 0 likes: conviene verificar los hashes de manifest.json antes de usarlo en producción.
- Licencia Apache 2.0, que permite uso comercial, pero al derivar de openbmb/MiniCPM5-2B conviene confirmar las condiciones y avisos del repositorio original.
- Idoneidad en producción: el autor describe el Space como una demostración de inferencia, no como un agente autónomo ni como garantía de respuestas correctas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mike0021/MiniCPM5-2B-ONNX
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Revisión concreta del checkpoint de origen: https://huggingface.co/openbmb/MiniCPM5-2B/tree/abe115e887989b14f05e64a3b260648329324c3f
- Demostración en navegador (Space): https://huggingface.co/spaces/Mike0021/MiniCPM5-2B-WebGPU
- Resúmenes de validación: https://huggingface.co/spaces/Mike0021/MiniCPM5-2B-WebGPU/tree/main/validation
- Manifiesto con tamanos y hashes: manifest.json dentro del repositorio del modelo
- Los resultados de búsqueda web proporcionados no contienen información relacionada con este modelo.
