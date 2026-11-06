# LatentAILabs/chitragupta-pii-indic

## Resumen

Chitragupta (`chitragupta-pii-indic`) es un modelo de reconocimiento de entidades nombradas (NER) especializado en la detección de datos personales (PII) en textos en hindi, hinglish y otras diez lenguas de la India, además de inglés indio. Lo desarrolla LatentAILabs como una liberación independiente y se distribuye con licencia Apache-2.0, lo que permite su uso comercial sin restricciones. El modelo resuelve un problema concreto: los detectores de PII habituales están entrenados sobre todo con texto en inglés y no reconocen identificadores administrativos indios como Aadhaar, PAN, voter ID (EPIC), GSTIN, UPI ID o IFSC, ni funcionan bien con escritura devanagari o con texto code-mixed.

Técnicamente es un token tagger de unos 560 millones de parámetros construido sobre el encoder XLM-RoBERTa-large de Facebook AI, con una cabeza de clasificación de tokens que produce 37 etiquetas en formato BIO y devuelve desplazamientos de caracteres listos para enmascarar. Se complementa con una capa de reglas ligera que valida checksums y formatos de identificadores para corregir las etiquetas del modelo. Soporta entradas de cualquier longitud mediante ventanas solapadas de 256 tokens.

Su relevancia actual es doble: por un lado, la entrada en vigor de normativas de protección de datos en la India (DPDP Act) obliga a anonimizar datos antes de almacenarlos o enviarlos a terceros; por otro, la práctica extendida de enviar texto de usuarios a APIs de LLM hace necesario un filtro local de PII. Chitragupta se ejecuta en CPU o GPU sin llamadas externas, lo que encaja en pipelines de redacción previos al envío de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) con cabeza de clasificación de tokens (37 etiquetas BIO) y capa de reglas auxiliar |
| Parametros totales | 558.878.757 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | Entrada de cualquier longitud; ventanas solapadas de 256 tokens para textos de más de 510 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Hindi, inglés, bengalí, tamil, telugu, maratí, gujarati, kannada, malayu, punyabí, urdu, odia, multilingual (incluye hinglish y texto romanizado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-large`, un encoder transformer de tipo RoBERTa multilingüe, sobre el que se añade una cabeza de token classification que emite 37 etiquetas en esquema BIO. La salida se complementa con una capa de reglas determinista que aplica validaciones de checksum y de formato propias de los identificadores indios (por ejemplo, la estructura de Aadhaar, PAN o GSTIN) para corregir las predicciones del modelo neuronal. El pipeline devuelve desplazamientos de caracteres, lo que permite construir directamente funciones de `detect()` y `redact()`.

El entrenamiento se realizó durante 3 épocas sobre 114.431 textos sintéticos en 13 lenguas, de los cuales 13.514 no contenían datos personales (ejemplos negativos). No se indica en la información disponible si hubo fases de RLHF, DPO o ajuste por preferencias, algo esperable en un modelo de etiquetado y no de generación. La model card declara que los textos de más de 510 tokens se dividen en ventanas solapadas de 256 tokens, con una precisión menor en entradas largas.

## Capacidades

- Detección de entidades de datos personales con 18 tipos de etiqueta agrupados en personas (`PERSON`, `DOB`), contacto (`PHONE`, `EMAIL`, `ADDRESS`, `PINCODE`), identificadores gubernamentales (`AADHAAR`, `PAN`, `VOTER_ID`, `PASSPORT`, entre otros), identificadores financieros (`UPI`, cuenta bancaria, `IFSC`, `GSTIN`, número de tarjeta) y otros (`IP`, matrícula de vehículo).
- Redacción y enmascaramiento mediante desplazamientos de caracteres, apto para sustituir el texto sensible por marcadores.
- Procesamiento multilingüe en escritura nativa (devanagari, bengalí, tamil, telugu, etc.) y en texto romanizado.
- Manejo de texto code-mixed, en particular hinglish (hindi romanizado mezclado con inglés), frecuente en chats de soporte y redes sociales.
- Entrada de longitud arbitraria mediante ventanas solapadas, aunque con pérdida de precisión en textos largos.
- Ejecución local en CPU o GPU, sin dependencia de APIs externas.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento: es un modelo puro de etiquetado de tokens.

## Casos de uso

- Redacción previa al envío a un LLM: interceptar el texto del usuario, detectar Aadhaar, PAN, teléfono o UPI y sustituirlos por marcadores antes de llamar a una API externa, cumpliendo con los requisitos de minimización de datos.
- Cumplimiento de la DPDP india en atención al cliente: procesar transcripciones de chat y correo en hindi, hinglish y lenguas regionales para enmascarar identificadores antes del almacenamiento o del análisis.
- Anonimización de transcripciones de call center: el modelo etiqueta nombres, direcciones, números de teléfono y cuentas bancarias en audio transcrito, con la ventana solapada cubriendo conversaciones de varios turnos.
- Saneamiento de logs y telemetría: filtrar campos de texto libre en aplicaciones que registran mensajes de usuario, evitando que identificadores indios queden en sistemas de observabilidad.
- Preparación de datasets para analítica: eliminar PII de corpus de SMS, formularios y publicaciones sociales antes de entrenar modelos o generar informes agregados.
- Verificación de KYC y formularios: validar que los identificadores detectados cumplen el formato esperado (checksum de Aadhaar, estructura de PAN, GSTIN) y marcar discrepancias en pipelines de incorporación de clientes.
- Moderación y publicación de contenido: detectar datos personales en reseñas o foros antes de publicarlos, con soporte para escritura nativa y texto romanizado.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Conjunto de evaluación | Métrica | Valor |
|---|---|---|
| Chitragupta fresh test (sintético, 13 lenguas, formatos de ID no vistos en entrenamiento) | Exact-span F1 (modelo + reglas) | 0,959 |
| Chitragupta fresh test (sintético, 13 lenguas, formatos de ID no vistos en entrenamiento) | Exact-span F1 (solo modelo) | 0,876 |
| Chitragupta fresh test (sintético, 13 lenguas, formatos de ID no vistos en entrenamiento) | Character-level redaction F1 | 0,987 |
| IndiaPII-Bench (`maskflow-ai/indiapii-bench`) | Character-level redaction F1 | 0,954 |
| Ylemis India PII benchmark (muestra de 2.000 filas, `Pranshurs/ylemis-india-pii-benchmark`) | Character-level redaction F1 | 0,878 |

El autor advierte que todas las cifras proceden de datos de test sintéticos y que la métrica exact-span exige coincidencia de etiqueta y de ambos límites de caracteres. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 2,2 GB solo para pesos (558,9 M de parámetros), más activaciones y memoria del tokenizador; en fp16 aproximadamente 1,1 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM en fp16 es suficiente; una RTX 4090, A100 o H100 aportan margen para lotes grandes y mayor throughput.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares; también funciona en CPU.
- Despliegue: compatible con `transformers` (pipeline `token-classification`), y por tanto con TGI, vLLM para tareas de clasificación y servidores de inferencia basados en transformers; no se mencionan pesos GGUF ni soporte explícito de llama.cpp u Ollama.
- Latencia declarada: unos 24 ms por texto corto en CPU multinúcleo de servidor con lotes de 32; sensiblemente más rápido en GPU.
- El modelo se sirve a través de endpoints compatibles según las etiquetas del repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chitragupta (`chitragupta-pii-indic`) | 558,9 M | Ventanas de 256 tokens, entrada arbitraria | NER de PII para lenguas indias + reglas | Apache-2.0 | Hugging Face, transformers |
| Yama (`LatentAILabs/yama-indic`) | no disponible | no disponible | Clasificador zero-shot para lenguas indias, complementario | no disponible en la información | Hugging Face |
| XLM-RoBERTa-large (base) | 558,9 M | 512 tokens | Encoder multilingüe genérico, sin cabeza de PII | MIT (según el modelo base original) | Hugging Face |
| Detectores de PII genéricos en inglés | variable | variable | NER entrenado principalmente en inglés | variable | variable |

La información disponible no permite comparar métricas directas con alternativas específicas de detección de PII en lenguas indias; los benchmarks del autor solo se refieren a sus propios conjuntos de evaluación.

## Limitaciones y advertencias

- Todas las métricas publicadas proceden de datos sintéticos; el rendimiento en texto real de producción puede ser inferior y debe validarse con un conjunto propio.
- La precisión disminuye en entradas largas: los textos de más de 510 tokens se dividen en ventanas de 256 tokens con solapamiento.
- Riesgo de falsos positivos y falsos negativos en identificadores con formatos nuevos o poco frecuentes; la capa de reglas mitiga parte del problema, pero no lo elimina.
- El modelo está entrenado sobre 13 lenguas indias e inglés; no cubre otras lenguas y su comportamiento fuera de ese ámbito no está documentado.
- Posibles sesgos derivados de los datos sintéticos de entrenamiento: la distribución de nombres, direcciones y formatos puede no reflejar la diversidad real de la India.
- No es un modelo generativo: no razona ni explica sus predicciones, solo emite etiquetas y desplazamientos.
- Aunque la licencia Apache-2.0 permite uso comercial, el cumplimiento normativo (DPDP u otras) es responsabilidad del integrador; el modelo es una ayuda, no una garantía legal.
- No se documentan tipos de cuantización ni pesos en formatos alternativos, lo que limita el despliegue en entornos que requieran GGUF u otros formatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LatentAILabs/chitragupta-pii-indic
- Artículo en Towards AI: https://pub.towardsai.net/yama-judges-chitragupta-keeps-the-records-open-source-ai-for-indian-languages-b7f8bf3b7576
- Resumen y FAQ: https://latentailabs.github.io/chitragupta-pii/
- Modelo complementario Yama: https://huggingface.co/LatentAILabs/yama-indic
- Canal de YouTube del autor: https://www.youtube.com/@LatentAILabs
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Benchmark IndiaPII-Bench: https://huggingface.co/datasets/maskflow-ai/indiapii-bench
- Benchmark Ylemis India PII: https://huggingface.co/datasets/Pranshurs/ylemis-india-pii-benchmark
