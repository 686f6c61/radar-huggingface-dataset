# DJLougen/scotoma-small

## Resumen

scotoma-small es un clasificador de tokens (token classification) desarrollado por DJLougen como componente del motor Scotoma dentro de Scrub N Paste, una aplicación de redacción de PHI clínica que se ejecuta en local en macOS. Se trata de un ajuste fino de microsoft/deberta-v3-small, un encoder transformer de 141 millones de parámetros (98 de ellos en la tabla de embeddings), entrenado para etiquetar identificadores de estilo HIPAA Safe-Harbor en texto clínico en inglés. El resultado se exporta a ONNX y se cuantiza a int8 por canal, con un fichero de 172 MB que se ejecuta en CPU y sin ruta de red en el código de inferencia.

El problema que resuelve es concreto: localizar nombres, direcciones, fechas, teléfonos y otros identificadores en notas clínicas antes de que el usuario las copie, comparta o procese. Para ello el sistema combina reglas deterministas con este clasificador y aplica un umbral de decisión de 0,02 sobre la suma de probabilidades de las 42 clases no-O, priorizando el recall sobre la precisión porque un identificador no detectado se considera más costoso que una redacción de más.

Su relevancia actual está en el enfoque de privacidad por diseño (inferencia totalmente local, licencia Apache 2.0, 172 MB en int8 y unos 20 ms por nota en CPU Apple M3 Max) y en que su evaluación principal es una prueba sellada y pre-registrada sobre 7.108 notas clínicas sintéticas, no sobre corpus clínicos reales, lo que acota explícitamente su alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer de la familia DeBERTa-v3 (base: microsoft/deberta-v3-small) |
| Parametros totales | 141 millones (98 millones corresponden a la tabla de embeddings) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 384 tokens (campo `scotoma_max_len` en `config.json`) |
| Tipos de cuantizacion | int8 por canal (`model_quantized.onnx`, 172 MB); fp32 opcional (566 MB) |
| Idiomas soportados | Inglés unicamente (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_quantized.onnx` / fp32); tokenizer rápido en `tokenizer.json` |
| Tarea | Token classification (reconocimiento de identificadores PII/PHI) |
| Etiquetas de salida | 43 clases: esquema BIO sobre 21 categorías de identificador + clase `O` |
| Entrada | `input_ids`, `attention_mask` (longitud máxima 384) |
| Umbral de decisión | 0,02 por defecto, almacenado como `scotoma_threshold` |
| Dominio declarado | `scotoma_domain: clinical` |
| Dataset de entrenamiento declarado | nvidia/Nemotron-PII |
| sha256 de los pesos cuantizados | `33be24386b0bbdb2758a86087140f7a4a93bd21923a85fe20085bf611ba87e41` |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de microsoft/deberta-v3-small, un encoder transformer de 141 millones de parámetros de la familia DeBERTa-v3, con una matriz de embeddings de 98 millones de parámetros que concentra la mayor parte del peso. Sobre esa base se añade una cabeza de clasificación de tokens con 43 salidas en formato BIO: 21 categorías de identificador (prefijos `B-` e `I-`) más la clase `O`. Las categorías citadas en la model card son `NAME`, `ADDRESS`, `LOCATION`, `ZIP`, `DATE`, `AGE`, `PHONE`, `FAX`, `EMAIL` y otras hasta 21, con `ORG` tratado como cuasi-identificador que la aplicación solo redacta en modo estricto.

El autor declara como dataset de entrenamiento nvidia/Nemotron-PII. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del corpus, el número de épocas ni los hiperparámetros del ajuste fino, por lo que esos datos figuran como no disponibles. Al ser un modelo discriminativo de clasificación de tokens no hay fases de RLHF, DPO ni ajuste por preferencias. La innovación destacable no está en la arquitectura, sino en el empaquetado: exportación a ONNX, cuantización per-channel int8 hasta 172 MB, tokenizer rápido embebido y una regla de decisión que agrega las 42 probabilidades de clase identificadora en una única puntuación por token, con umbral configurable para desplazar el compromiso entre precisión y recall.

## Capacidades

- Etiquetado de tokens sobre texto clínico en inglés: devuelve spans con offsets de caracteres listos para sustituir por etiquetas `[CATEGORY_N]` o por valores falsos realistas.
- Cobertura de 21 categorías de identificador estilo HIPAA Safe-Harbor, incluida la clase `ORG` como cuasi-identificador restringido al modo estricto.
- Puntuación de identificador por token calculada como suma de las 42 probabilidades no-`O`, con umbral ajustable (0,02 por defecto) para calibrar precisión frente a recall.
- Inferencia local en ONNX Runtime: el código de inferencia no tiene ruta de red, por lo que ningún dato sale de la máquina.
- Integración con un motor de reglas deterministas; la configuración distribuida en la aplicación es reglas + este modelo, con pantalla de revisión previa a la copia.
- Redacción de ficheros e imágenes o PDF mediante OCR local previo; la salida de imagen se escribe con cajas negras sólidas y sin capa de texto oculta.
- No es un modelo generativo: no produce texto, resúmenes ni explicaciones.
- No soporta tool calling ni function calling, ni razonamiento multi-paso, ni uso como agente.
- No es multimodal: consume texto unicamente. Cualquier capacidad sobre imágenes depende del OCR externo.
- No soporta otros idiomas distintos del inglés.

## Casos de uso

- Redacción de notas clínicas en el escritorio: mediante el atajo ⌘⌥S de Scrub N Paste, el modelo etiqueta identificadores en la selección o el portapapeles y la aplicación los sustituye por etiquetas o valores sustitutos, con revisión humana antes de copiar nada.
- Redacción de documentos completos desde línea de comandos: el comando `scotoma redact-file IN OUT` aplica el mismo motor a ficheros, generando una copia con los identificadores cubiertos, útil para procesar lotes de documentos sin interfaz gráfica.
- Captura y redacción de pantalla o PDF en entornos clínicos: el atajo ⌘⌥D captura una región, se ejecuta OCR en el dispositivo y el modelo localiza identificadores en el texto reconocido antes de generar la imagen redactada.
- Preanonimización de corpus antes de compartirlos: el modelo puede actuar como primer filtro sobre texto clínico en inglés para reducir identificadores evidentes antes de una revisión manual o de un proceso de anonimización más exhaustivo.
- Preetiquetado para construir datasets de entrenamiento: su salida BIO con offsets permite generar anotaciones preliminares de PII que luego se corrigen manualmente, reduciendo el coste de anotación en proyectos de NLP clínico.
- Componente de un flujo de cumplimiento con supervisión humana: encaja como capa automática dentro de un procedimiento de expert determination bajo 45 CFR 164.514(a), siempre con revisión y responsabilidad final del desplegador.
- Despliegue en equipos sin GPU: con 172 MB en int8 y ~20 ms por nota en CPU, es viable en portátiles de uso clínico o de investigación donde no hay acelerador disponible.
- Evaluación comparativa de detectores de PII con requisitos de latencia estrictos: sirve como referencia rápida en pruebas internas gracias a su coste de ~20 ms por nota frente a ~240 ms de alternativas de mayor tamaño.

## Benchmarks y rendimiento

La información disponible incluye una única evaluación del autor, denominada evaluación sellada 3: pre-registrada, con 7.108 notas clínicas sintéticas generadas por un LLM con identificadores plantados y puntuada una sola vez. No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), que además no aplican a un modelo discriminativo de clasificación de tokens.

| Evaluacion | Sistema | Notas con fugas | Notas totales | Latencia por nota |
|---|---|---|---|---|
| Sellado 3 (pre-registrado, puntuado una vez) | Reglas + scotoma-small | 2 | 7.108 | ~20 ms (CPU Apple M3 Max) |
| Sellado 3 (pre-registrado, puntuado una vez) | Reglas + OpenMed-PII-SuperClinical-Large @0.10 | 26 | 7.108 | ~240 ms (CPU de portátil) |

La prueba de McNemar bilateral exacta reportada por el autor es p = 8,0 × 10⁻⁷. Estas cifras proceden exclusivamente de notas sintéticas: el rendimiento sobre corpus clínicos reales como i2b2/n2c2 no se ha medido según la propia model card.

## Requisitos de hardware

- Pesos: 172 MB en int8 por canal (`model_quantized.onnx`); 566 MB en la variante fp32 opcional.
- VRAM/RAM: no se especifica oficialmente, pero con 172 MB de pesos y secuencias de hasta 384 tokens la huella total de inferencia es inferior a 1 GB (estimación a partir del tamaño del modelo y de la longitud máxima configurada).
- GPU: no es necesaria. El autor mide la latencia en CPU (Apple M3 Max), no en GPU. No hay recomendaciones de GPU publicadas en la información disponible.
- Cabe holgadamente en cualquier GPU de consumo e incluso en equipos sin GPU dedicada; el cuello de botella es la CPU o el acelerador disponible para ONNX Runtime.
- Opciones de despliegue: ONNX Runtime en Python con `onnxruntime` y el tokenizer rápido de `tokenizer.json`; aplicación de escritorio Tauri + Rust (Scrub N Paste); CLI `scotoma`.
- vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo generativo de lenguaje.
- Latencia medida: ~20 ms por nota clínica en CPU Apple M3 Max mediante ONNX Runtime, equivalente a unas 50 notas por segundo en ese equipo (cálculo derivado de la latencia publicada).
- Comparativa de latencia interna: ~20 ms frente a ~240 ms por nota del sistema con OpenMed-PII-SuperClinical-Large @0.10 en CPU de portátil, aproximadamente 12 veces más rápido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas con fugas (sellado 3) | Formato |
|---|---|---|---|---|---|---|
| scotoma-small | 141 M (98 M en embeddings) | 384 tokens | Token classification PII/PHI clínica | Apache 2.0 | 2 / 7.108 | ONNX int8 (172 MB) |
| OpenMed-PII-SuperClinical-Large @0.10 | no disponible | no disponible | Detección de PII clínica | no disponible | 26 / 7.108 | no disponible |
| microsoft/deberta-v3-small (base) | 141 M (98 M en embeddings) | no disponible en la información proporcionada | Modelo base sin cabeza de PII | no disponible en la información proporcionada | No aplica: no es un detector de PII | safetensors según el repositorio base |

No se dispone de otros modelos comparables con métricas verificables en la información proporcionada. La comparación directa con OpenMed-PII-SuperClinical-Large procede del propio autor y se limita a la evaluación sellada 3 sobre notas sintéticas.

## Limitaciones y advertencias

- La evaluación principal se ha realizado sobre notas sintéticas escritas por un LLM con identificadores plantados. El rendimiento sobre corpus clínicos reales (i2b2/n2c2) no se ha medido.
- No garantiza una des-identificación completa. Es una ayuda para una persona que revisa la salida, no una herramienta de cumplimiento desatendida; bajo 45 CFR 164.514(a) la responsabilidad legal es del desplegador.
- Se documentan falsos positivos de sobrerredacción: en el ejemplo publicado se marcaron como identificadores valores como "148/92", "SpO2" y el modelo de coche "Civic".
- El umbral por defecto de 0,02 prioriza el recall. Subirlo aumenta la precisión pero deja pasar más identificadores, por lo que requiere calibración según el caso de uso.
- Solo inglés. El texto no inglés, los documentos manuscritos y los documentos con muchas tablas están fuera de alcance declarado.
- El modelo lee texto unicamente. En capturas, imágenes y PDF depende del OCR local previo, de modo que los errores de OCR se propagan al resultado.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación independiente por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero no exime del cumplimiento normativo aplicable al tratamiento de datos de salud.
- No es un modelo generativo: no puede resumir, responder preguntas ni explicar sus decisiones; solo asigna etiquetas a tokens.
- La lista completa de las 21 categorías no está disponible en la información proporcionada, ya que la model card aparece truncada en ese apartado.
- Los datos de entrenamiento (número de tokens, composición, hiperparámetros) no están documentados en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DJLougen/scotoma-small
- Repositorio de la aplicación Scrub N Paste: https://github.com/DJLougen/scrub-n-paste
- Modelo base microsoft/deberta-v3-small: https://huggingface.co/microsoft/deberta-v3-small
- Dataset declarado nvidia/Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Apoyo al autor (Ko-fi): https://ko-fi.com/djlougen
- Perfil del autor en X: https://x.com/DJLougen
