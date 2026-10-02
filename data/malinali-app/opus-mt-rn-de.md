# malinali-app/opus-mt-rn-de

## Resumen

`malinali-app/opus-mt-rn-de` es un empaquetado de pesos para traducción automática de kirundi (rn) a alemán (de), publicado por el desarrollador `malinali-app` a partir del modelo `Helsinki-NLP/opus-mt-rn-de`. Se trata de un modelo Marian (transformer encoder-decoder) de 48.548.246 parámetros (unos 48,5 millones) distribuido en formato safetensors, junto con dos tokenizers fast en JSON (encoder y decoder) y un `config.json` de Marian. El repositorio ocupa 0,2 GB, coherente con pesos en float32.

El valor diferencial no está en el entrenamiento, sino en el formato de despliegue: el autor declara que solo reempaqueta los pesos originales y convierte el tokenizer SentencePiece a tokenizers fast de Hugging Face para permitir inferencia en dispositivo mediante Candle (`marian_flutter`), sin dependencia de SentencePiece en tiempo de ejecución. Esto habilita traducción offline en aplicaciones móviles y de escritorio, algo relevante para una lengua bantú con recursos limitados como el kirundi.

Como contrapartida, el repositorio no declara licencia en los metadatos de Hugging Face, no publica benchmarks ni detalles de entrenamiento, y registra 0 descargas y 0 likes. Es un artefacto de distribución, no una contribución de modelado: cualquier evaluación de calidad debe remitirse al modelo base de Helsinki-NLP y al proyecto OPUS-MT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder con atención multi-cabeza), segun el `config.json` y los tags del repositorio |
| Parametros totales | 48.548.246 (dato real de safetensors) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible. El repositorio no publica `max_position_embeddings`; en el ecosistema OPUS-MT los modelos Marian se entrenan habitualmente con segmentos de hasta 512 tokens, dato no confirmado para este pack |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors (sin variantes GGUF, GPTQ, AWQ ni cuantizaciones declaradas) |
| Idiomas soportados | Origen: rn (kirundi). Destino: de (alemán). Dirección fija rn → de |
| Licencia | No disponible en los metadatos de Hugging Face. La model card remite a la licencia del modelo base `Helsinki-NLP/opus-mt-rn-de`, que el autor describe como «typically CC-BY 4.0» |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y dos tokenizers fast en JSON (`tokenizer-enc.json`, `tokenizer-dec.json`) |
| Modelo base | Helsinki-NLP/opus-mt-rn-de (reempaquetado, sin fine-tuning declarado) |
| Tamano del repositorio | 0,2 GB |
| Libreria declarada | transformers (tags adicionales: candle, endpoints_compatible) |
| Tarea (pipeline) | translation / text2text-generation |

## Arquitectura y entrenamiento

La arquitectura es Marian, un transformer encoder-decoder clásico orientado a traducción automática neuronal, con tokenización basada en SentencePiece en el modelo original. El pack publicado mantiene los pesos del modelo base y sustituye el tokenizer compartido por dos tokenizers fast independientes (uno para la fuente en kirundi y otro para el destino en alemán), pensados para el runtime Candle usado por la aplicación Malinali. No se documenta ningún proceso de entrenamiento propio: no hay datos de tokens, composición de corpus, ni etapas de RLHF, DPO o ajuste por instrucciones. El autor indica explícitamente que no reclama la propiedad del modelo entrenado.

El modelo base pertenece a la familia OPUS-MT de Helsinki-NLP, cuyos modelos se entrenan sobre los corpus paralelos del proyecto OPUS con tokenización SentencePiece y una receta de entrenamiento común. La información proporcionada no incluye el volumen de pares de frases ni la composición concreta del subconjunto rn-de, y los corpus OPUS están dominados por textos de dominio público, religiosos, subtítulos y noticias, lo que condiciona el dominio de aplicación. La única innovación de ingeniería documentada en este repositorio es la conversión de SentencePiece a tokenizers fast y el empaquetado para inferencia en dispositivo.

## Capacidades

- Traducción automática de texto en una única dirección: kirundi (rn) a alemán (de).
- Generación seq2seq / text2text pura: entrada de texto, salida de texto, sin instrucciones ni formato conversacional.
- Inferencia offline en dispositivo a través de Candle (`marian_flutter`), sin llamadas a servicios externos.
- Compatibilidad con la librería `transformers` (pipeline `translation`) y con endpoints HTTP, segun los tags `endpoints_compatible`.
- Tokenización fast en JSON, lo que evita depender de SentencePiece en tiempo de ejecución.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente, planificación ni razonamiento multi-paso.
- Sin modo de pensamiento (thinking mode), sin visión, sin audio y sin generación de código.
- Cobertura multilingüe limitada estrictamente al par rn → de; no traduce de → rn ni a terceras lenguas.

## Casos de uso

- Traducción offline en aplicaciones móviles: integrado con Candle mediante `marian_flutter`, el modelo (unos 194 MB en float32 y unos 97 MB en float16) cabe en el almacenamiento de un teléfono y permite traducir sin conexión en contextos con conectividad limitada, frecuentes en Burundi.
- Comunicación en cooperación internacional: trabajadores de ONG y proyectos de desarrollo que operan en kirundi pueden traducir informes de campo, actas de reuniones y correspondencia al alemán para coordinarse con financiadores en Alemania, Austria o Suiza, con post-edición humana.
- Atención al cliente para la diáspora: servicios de soporte que reciben consultas en kirundi pueden pre-traducirlas al alemán antes de enrutarlas a agentes germanohablantes, reduciendo el tiempo de primera respuesta.
- Localización de documentación operativa: traducción asistida de manuales, formularios y procedimientos internos de rn a de como paso previo a la revisión por un traductor profesional; adecuado por su bajo coste computacional y su capacidad de ejecutarse en CPU.
- Pre-traducción para subtitulado: combinado con un sistema de reconocimiento automático de voz en kirundi, el modelo puede generar subtítulos preliminares en alemán para vídeos informativos o material divulgativo, que después se revisan manualmente.
- Generación de datos sintéticos y anotación: creación de pares rn-de preliminares para aumentar corpus paralelos de bajos recursos, o para el filtrado y alineación de textos bilingües en proyectos de investigación en traducción automática.
- Investigación en lenguas de bajos recursos: punto de partida para fine-tuning adicional sobre dominios específicos (salud, agricultura, administración) partiendo de pesos Marian ligeros y fáciles de reentrenar en una sola GPU.
- Traducción de materiales sanitarios o legales de carácter general: folletos informativos y avisos públicos, siempre con revisión profesional y sin uso para decisiones clínicas o jurídicas automatizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del repositorio no incluye valores de BLEU, chrF, COMET ni de ningún otro conjunto de evaluación para el par rn → de, y tampoco se aportan métricas comparativas frente al modelo base `Helsinki-NLP/opus-mt-rn-de`, cuyos pesos son idénticos. No se dispone por tanto de datos verificables de calidad de traducción para este pack.

## Requisitos de hardware

- Memoria de pesos: unos 194 MB en float32 (48,5 M de parámetros × 4 bytes) y unos 97 MB en float16/bfloat16. El repositorio de 0,2 GB es coherente con la distribución en float32.
- Cuantización: una conversión a int8 dejaría el modelo en torno a 49 MB, aunque el repositorio no publica variantes cuantizadas y habría que generarlas con herramientas externas.
- CPU: la inferencia es viable en CPU moderna sin GPU, incluso en un único hilo para segmentos cortos; este es el escenario de despliegue previsto (dispositivo).
- GPU consumer: cabe holgadamente en cualquier GPU con más de 1 GB de VRAM (GTX 1650, RTX 3060, RTX 4060, RTX 4090). El uso de A100, H100 o L40S no aporta ventaja apreciable para un modelo de este tamaño.
- Dispositivos integrados: apto para móviles y equipos de placa reducida (Raspberry Pi, Apple Silicon, iGPU Intel/AMD) gracias a su huella de memoria inferior a 200 MB.
- Opciones de despliegue: `transformers` con pipeline de traducción, Candle mediante `marian_flutter`, CTranslate2 (que soporta la conversión de modelos Marian segun su documentación) y exportación propia a ONNX Runtime. Ni llama.cpp ni Ollama soportan la arquitectura Marian, y vLLM no documenta soporte nativo para Marian.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por segmento; a falta de datos, cualquier cifra sería especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| malinali-app/opus-mt-rn-de | 48,5 M | rn → de | No disponible (512 tokens habitual en OPUS-MT, sin confirmar) | No disponible (remite a la del modelo base) | safetensors + tokenizers fast | Reempaquetado on-device con Candle; 0 descargas y 0 likes |
| Helsinki-NLP/opus-mt-rn-de | ~48,5 M (pesos idénticos) | rn → de | No disponible en la información proporcionada | CC-BY 4.0 segun la practica habitual de OPUS-MT (no confirmado) | PyTorch / safetensors | Modelo base upstream; misma calidad esperable |
| facebook/nllb-200-distilled-600M | 600 M | 200 lenguas; cobertura de kirundi no confirmada en la información disponible | No disponible en la información proporcionada | CC-BY-NC-4.0 (uso comercial restringido) | safetensors | Modelo multilingüe mucho mayor; requiere verificar soporte del par rn → de |
| facebook/m2m100_418M | 418 M | 100 lenguas; cobertura de kirundi no confirmada en la información disponible | No disponible en la información proporcionada | MIT | safetensors | Alternativa multilingüe de mayor tamaño, aproximadamente 8,6 veces más parámetros que este pack |

No se dispone de métricas de calidad comparadas (BLEU, chrF o COMET) para ninguno de estos modelos en el par rn → de dentro de la información proporcionada, por lo que la comparativa se limita a tamaño, cobertura lingüística, licencia y formato de distribución.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia en Hugging Face y la model card se limita a remitir a la licencia del modelo base. Antes de cualquier uso comercial es imprescindible verificar la licencia de `Helsinki-NLP/opus-mt-rn-de`; la práctica habitual de OPUS-MT es CC-BY 4.0, que exige atribución.
- Atribución obligatoria: el autor declara que no reclama la propiedad del modelo entrenado, por lo que la atribución a Helsinki-NLP y al proyecto OPUS-MT debe mantenerse en cualquier redistribución.
- Calidad no verificada: no hay benchmarks publicados, ni evaluación del par rn → de, ni historial de uso. Al ser un reempaquetado sin reentrenamiento, hereda íntegramente el comportamiento del modelo base.
- Lengua de bajos recursos: el kirundi dispone de corpus paralelos limitados en OPUS, por lo que la calidad esperable es inferior a la de pares con millones de frases alineadas. El dominio de los corpus OPUS, dominado por textos religiosos, subtítulos y noticias, puede provocar degradación en textos técnicos, legales o científicos.
- Riesgo de alucinación y errores típicos de traducción neuronal: omisiones de contenido, repeticiones, invención de nombres propios o cifras en segmentos ambiguos, y traducciones erróneas en frases cortas o fuera de distribución.
- Sesgos: los del corpus de entrenamiento original (representación desequilibrada de variedades dialectales del kirundi, sesgos culturales y de género presentes en los textos fuente). No se documenta ninguna mitigación.
- Restricciones de dirección: no traduce de alemán a kirundi ni a ninguna otra lengua; un flujo bidireccional requiere un modelo adicional.
- Límite de longitud: no se documenta la ventana de contexto; entradas largas deben segmentarse en frases, con pérdida de coherencia entre segmentos.
- Sin funciones de seguridad: no incorpora moderación, filtrado de contenido ni verificación factual. No es adecuado como único sistema para decisiones médicas, legales o administrativas.
- Idioma de destino único: el alemán generado corresponde a la variedad aprendida del corpus, sin adaptación declarada a variedades de Austria o Suiza.
- Madurez del repositorio: creado y actualizado en 2026 según los metadatos, con 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-rn-de
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-rn-de
- Proyecto OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/Opus-MT
- Aplicación Malinali: https://malinali.app
- Alternativa multilingüe NLLB-200 (destilado, 600 M): https://huggingface.co/facebook/nllb-200-distilled-600M
- Alternativa multilingüe M2M-100 (418 M): https://huggingface.co/facebook/m2m100_418M
