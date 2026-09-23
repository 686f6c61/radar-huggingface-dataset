# inboxpraveen/Kavach-PII-270M

## Resumen

Kavach PII 270M es un modelo de extracción de datos personales (PII, PHI y PCI) desarrollado por Praveen Kumar (usuario `inboxpraveen`), ingeniero principal de IA en Bengaluru. Se trata de un ajuste fino con LoRA sobre `google/gemma-3-270m-it` que recibe un documento en lenguaje natural y devuelve una lista JSON de entidades sensibles etiquetadas con 52 categorías distintas (entre ellas PERSON, EMAIL, PHONE, SSN_US, AADHAAR_IN, IBAN, PASSWORD_SECRET, API_KEY_TOKEN, MEDICAL_RECORD_ID o BIOMETRIC_DESCRIPTOR). El problema que aborda es concreto: la mayoría de las herramientas de redacción generan demasiados falsos positivos en documentos que no contienen datos personales, lo que las hace inviables en producción.

El modelo tiene 268.098.176 parámetros (aproximadamente 270M) y está diseñado para ejecutarse en CPU o en una GPU de portátil, con un repositorio de 0,6 GB en formato `safetensors`. Su relevancia radica en la combinación de tamaño reducido y precisión declarada: según la model card, obtiene un value-F1 de 88,4 sobre un conjunto de test retenido de 3.372 documentos y 13.646 valores anotados, frente a 56,4 de GLiNER-PII multi-v1 y 22,2 de Microsoft Presidio medidos con el mismo script y las mismas anotaciones de referencia. El dato más diferencial es la tasa de falsos positivos en documentos sin PII: un 0,4 %, frente al 80,2 % de GLiNER-PII y el 85,3 % de Presidio.

La model card declara soporte para 29 idiomas (los metadatos de HuggingFace enumeran 26), con cobertura específica de identificadores indios como AADHAAR_IN, PAN_IN o UPI_VPA, además de identificadores estadounidenses y europeos. Está pensado para las entradas que reciben los pipelines reales: transcripciones ASR de centros de llamadas, salida OCR de documentos escaneados, formularios estructurados, chat, código, logs y texto deliberadamente ofuscado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia `gemma3_text`), ajuste fino con LoRA sobre `google/gemma-3-270m-it` |
| Parámetros totales | 268.098.176 (≈270M) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens en las configuraciones de servicio recomendadas (`--max-model-len 4096` en vLLM, `--context-length 4096` en SGLang); la model card no especifica la ventana máxima del modelo base |
| Tipos de cuantización | Pesos en bfloat16 en el repositorio principal; existe un repositorio GGUF separado (`Kavach-PII-270M-GGUF`) para llama.cpp, Ollama y LM Studio. No se detallan los niveles concretos de cuantización ofrecidos |
| Idiomas soportados | 29 idiomas según la model card; los metadatos enumeran 26: en, hi, ta, te, bn, mr, gu, kn, ml, pa, ur, ar, zh, ja, ko, ru, tr, vi, id, es, fr, de, it, pt, nl, pl |
| Licencia | `gemma` |
| Formato de pesos | safetensors (pesos fusionados y adaptador LoRA en el subdirectorio `adapter`), GGUF en repositorio aparte |
| Etiquetas de salida | 52 categorías de PII/PHI/PCI (PERSON, EMAIL, PHONE, ADDRESS, DOB, NATIONAL_ID, PASSPORT, DRIVING_LICENSE, SSN_US, AADHAAR_IN, PAN_IN, IBAN, SWIFT_BIC, CREDIT_DEBIT_CARD, CARD_CVV, API_KEY_TOKEN, PASSWORD_SECRET, MAC_ADDRESS, IP_ADDRESS, MEDICAL_RECORD_ID, HEALTH_ID, BIOMETRIC_DESCRIPTOR, RELIGION, POLITICAL_BELIEF, ETHNICITY, GENDER_SEX, DISABILITY, etc.) |
| Pipeline declarado | text-generation (uso real: extracción de entidades con salida JSON) |
| Librería | transformers |
| Tamaño del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-270m-it`, un transformer decoder-only de 270M parámetros con capacidades de seguimiento de instrucciones, y se ajusta mediante LoRA sobre ese checkpoint. El repositorio publica tanto los pesos fusionados como el adaptador LoRA en el subdirectorio `adapter`, lo que permite servirlo con vLLM usando `--enable-lora --lora-modules kavach=inboxpraveen/Kavach-PII-270M/adapter` sobre el modelo base original. La tarea se formula como generación de texto: se envía una instrucción con la lista de 52 etiquetas permitidas y el texto a analizar delimitado por `<<<` y `>>>`, y el modelo devuelve exclusivamente un array JSON de objetos `{"label": ..., "text": ...}`, con decodificación greedy (`do_sample=False`, `temperature=0`).

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación adicionales como RLHF o DPO. La model card tampoco detalla la configuración del ajuste LoRA (rango, alpha, épocas, tasa de aprendizaje). El autor sí describe la motivación del diseño: cubrir las entradas que reciben los pipelines reales (transcripciones ASR, salida OCR, formularios estructurados, chat, código, logs y texto ofuscado) y devolver los valores copiados exactamente como aparecen en el texto original, incluyendo valores hablados, desde el primer hasta el último token pronunciado. La salida es una lista de pares (etiqueta, valor) únicos, ordenados por primera aparición, con devolución de `[]` cuando no hay datos personales.

## Capacidades

- Extracción de PII/PHI/PCI en 52 categorías de etiqueta, con devolución de la cadena exacta tal como aparece en el texto fuente (mismo espaciado y ortografía).
- Detección sobre texto no convencional: transcripciones de ASR (valores hablados deletreados o dictados), salida OCR ruidosa, formularios, chat, fragmentos de código y logs, y texto deliberadamente ofuscado.
- Manejo conjunto de identificadores de distintas jurisdicciones: SSN_US, DRIVING_LICENSE, PASSPORT, AADHAAR_IN, PAN_IN, VOTER_ID, UPI_VPA, IBAN, SWIFT_BIC, ROUTING_CODE, TAX_ID.
- Categorías sensibles de cumplimiento normativo: datos de salud (MEDICAL_RECORD_ID, HEALTH_ID, LAB_ORDER_ID, PRESCRIPTION_ID, BIOMETRIC_DESCRIPTOR, DISABILITY), datos de pago (CREDIT_DEBIT_CARD, CARD_CVV, CARD_EXPIRY, BANK_ACCOUNT, WALLET_ID) y categorías especiales del RGPD (RELIGION, POLITICAL_BELIEF, ETHNICITY, GENDER_SEX).
- Secretos y credenciales: API_KEY_TOKEN, PASSWORD_SECRET, USERNAME, SIGNATURE, DEVICE_ID, MAC_ADDRESS, IP_ADDRESS.
- Salida estructurada estrictamente en JSON, apta para consumo programático sin post-procesado complejo (el ejemplo oficial localiza el primer `[` y el último `]`).
- Capacidad multilingüe declarada en 29 idiomas, incluidas 10 lenguas indias, árabe, chino, japonés, coreano, ruso, turco, vietnamita e indonesio, además de las principales lenguas europeas.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`) en vLLM, SGLang y otros servidores, y compatibilidad declarada con text-generation-inference y endpoints de HuggingFace.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido; el uso previsto es la extracción de entidades, no el diálogo general.

## Casos de uso

- Redacción de transcripciones de centros de llamadas: el modelo procesa la salida de un sistema ASR y devuelve los valores hablados copiados literalmente (nombres, teléfonos, números de tarjeta dictados), lo que permite enmascararlos antes de almacenar o analizar la conversación. La model card menciona explícitamente las transcripciones ASR como entrada objetivo y reporta un recall de redacción del 93,0 %.
- Cumplimiento del RGPD en documentos escaneados: sobre salida OCR de contratos, formularios y expedientes, el modelo identifica categorías especiales (RELIGION, POLITICAL_BELIEF, ETHNICITY, datos de salud) que exigen tratamiento reforzado, y permite generar versiones anonimizadas antes de compartir documentos fuera de la organización.
- Cumplimiento de HIPAA en el sector sanitario: extracción de MEDICAL_RECORD_ID, LAB_ORDER_ID, PRESCRIPTION_ID, HEALTH_ID y BIOMETRIC_DESCRIPTOR de historiales y órdenes médicas para producir conjuntos de datos desidentificados antes de usarlos en analítica o investigación.
- Sanitización de logs y trazas de aplicación: el pipeline de observabilidad puede ejecutar el modelo sobre cada línea o bloque de log para detectar API_KEY_TOKEN, PASSWORD_SECRET, MAC_ADDRESS, IP_ADDRESS o USERNAME antes de enviar los logs a un sistema de terceros.
- Preprocesado previo a un LLM mayor o a un sistema RAG: dado su tamaño de 270M y su coste bajo, el modelo actúa como filtro de entrada que elimina PII del contexto antes de que este llegue a un modelo grande o a un índice vectorial, reduciendo la superficie de exposición de datos.
- Verificación de identidad y KYC en banca y finanzas: extracción de identificadores fiscales y documentales (AADHAAR_IN, PAN_IN, PASSPORT, DRIVING_LICENSE, VOTER_ID, SSN_US) de formularios y documentos para alimentar procesos de alta de cliente o de comprobación documental.
- Curación de conjuntos de datos de entrenamiento: auditoría automatizada de corpus propios para localizar y eliminar datos personales antes de reutilizarlos en entrenamiento o publicación, usando la baja tasa de falsos positivos (0,4 %) para no descartar documentos limpios innecesariamente.
- Notificación de brechas y auditoría interna: barrido por lotes de repositorios documentales o buzones de correo para localizar datos personales expuestos y determinar el alcance de una brecha, aprovechando el despliegue en CPU o en GPU de portátil que permite ejecutar el modelo on-premise sin enviar datos a terceros.
- Despliegue en el borde o en instalaciones aisladas: con menos de 270M parámetros puede ejecutarse en una estación de trabajo sin GPU aceleradora o en una máquina de oficina, lo que permite tratar datos sensibles dentro del perímetro de la organización.

## Benchmarks y rendimiento

La model card publica una única familia de métricas, todas de extracción de PII, evaluadas sobre 3.372 documentos retenidos con 13.646 valores anotados. Los conjuntos de etiquetas de Presidio y GLiNER se mapearon a los del modelo «en la medida de lo posible» (best-effort).

| Métrica | Kavach PII 270M | GLiNER-PII multi-v1 | Presidio | Regex + checksum |
|---|---|---|---|---|
| Value F1 | 88,4 | 56,4 | 22,2 | 20,5 |
| Precisión | 88,9 | 56,9 | 21,0 | 51,1 |
| Recall | 87,9 | 55,9 | 23,4 | 12,8 |
| Exact span F1 | 89,1 | 55,4 | 22,3 | 20,0 |
| Recall de redacción | 93,0 | 66,2 | 43,2 | 15,6 |
| Falsos positivos en documentos sin PII | 0,4 % | 80,2 % | 85,3 % | 28,8 % |

No se han publicado en la información disponible resultados en benchmarks generales (MMLU, HumanEval, GSM8K, IFEval u otros) para este modelo. Las cifras anteriores son reportadas por el autor del modelo y no se han verificado de forma independiente según los datos disponibles.

## Requisitos de hardware

- Pesos en bfloat16: 268.098.176 parámetros × 2 bytes ≈ 536 MB. El repositorio completo ocupa 0,6 GB.
- VRAM estimada en bfloat16: en torno a 1-2 GB incluyendo caché KV para secuencias de hasta 4096 tokens (estimación; la model card no publica cifras de memoria medidas).
- VRAM estimada con cuantización GGUF (Q4-Q8): del orden de 200-600 MB para los pesos, más la caché KV correspondiente (estimación; no se detallan los niveles de cuantización publicados).
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con memoria unificada. La model card afirma explícitamente que funciona en CPU y en GPU de portátil.
- GPU de centro de datos (A100, H100, L40S): sobredimensionadas para un solo modelo; resultan útiles únicamente para servir muchas réplicas o lotes concurrentes en paralelo.
- Opciones de despliegue oficialmente documentadas: vLLM (`vllm serve ... --dtype bfloat16 --max-model-len 4096`), SGLang (`python -m sglang.launch_server --context-length 4096`), llama.cpp, Ollama y LM Studio a través del repositorio GGUF, y el ecosistema `transformers` (`AutoModelForCausalLM`). El modelo está etiquetado como compatible con text-generation-inference y con endpoints.
- Modo LoRA: es posible servir el adaptador sobre `google/gemma-3-270m-it` con `--enable-lora` en vLLM en lugar de los pesos fusionados.
- Latencia y throughput: no se publican cifras medidas. La model card indica que la salida típica es corta (del orden de 100 tokens por documento) y recomienda configurar procesamiento por lotes, ya que los documentos son independientes y ambos servidores manejan bien peticiones concurrentes. Las cifras de precisión se obtuvieron con `transformers` y llama.cpp; vLLM y SGLang no se evaluaron por separado, aunque el autor señala que usan los mismos pesos y decodificación greedy.
- Configuración de generación de referencia: `max_new_tokens=768`, `do_sample=False`, `temperature=0`.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Enfoque | Value F1 (según la model card) | Falsos positivos en documentos sin PII | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Kavach PII 270M | LLM generativo ajustado (LoRA sobre Gemma 3 270M) | 268.098.176 | Extracción de PII en 52 etiquetas, 29 idiomas | 88,4 | 0,4 % | `gemma` | HuggingFace, pesos safetensors + GGUF + adaptador LoRA |
| GLiNER-PII multi-v1 | Modelo de NER (no generativo) | No disponible | Reconocimiento de entidades PII | 56,4 | 80,2 % | No disponible en la información proporcionada | No disponible en la información proporcionada |
| Microsoft Presidio | Framework de detección con analizadores y reconocedores | No aplica (sistema basado en reglas y modelos auxiliares) | Detección y anonimización de PII | 22,2 | 85,3 % | No disponible en la información proporcionada | No disponible en la información proporcionada |
| Regex + checksum | Reglas heurísticas | No aplica | Validación por patrón y dígito de control | 20,5 | 28,8 % | No aplica | Implementación propia |

Nota: los conjuntos de etiquetas de GLiNER-PII y Presidio se mapearon a los de Kavach «en la medida de lo posible» según la model card; las comparaciones deben interpretarse con esa cautela. No se dispone de datos de parámetros, contexto ni licencia de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- La model card advierte explícitamente que los conjuntos de etiquetas de Presidio y GLiNER se mapearon a los de Kavach «en la medida de lo posible», por lo que la comparativa no es una evaluación en igualdad estricta de condiciones.
- Todas las métricas publicadas son autoinformadas por el autor del modelo. No hay verificación independiente ni evaluación por terceros según la información disponible.
- El repositorio muestra 0 descargas y 0 me gusta en el momento de la consulta, y fue creado y actualizado el mismo día (2026-09-23); se trata de una publicación reciente y sin adopción documentada.
- La lista de etiquetas de salida es cerrada (52 categorías). Cualquier categoría de PII no incluida en esa lista no será detectada.
- El límite de generación recomendado es `max_new_tokens=768`. Documentos largos con muchos valores distintos pueden truncar la salida JSON y provocar errores de análisis; la model card recomienda trocear o limitar el tamaño de los documentos, aunque no fija un tamaño máximo de entrada.
- La ventana de contexto en las configuraciones de servicio recomendadas es de 4096 tokens, inferior a la de muchos modelos actuales; los documentos más largos deben dividirse.
- Discrepancia entre la cifra declarada de 29 idiomas y los 26 idiomas enumerados en la model card y en los metadatos de HuggingFace. No se publican métricas desglosadas por idioma, de modo que el rendimiento fuera del inglés y de las lenguas indias no está cuantificado.
- Riesgo de alucinación inherente a un modelo generativo: puede devolver valores que no aparecen literalmente en el texto o etiquetas incorrectas. La model card exige copiar los valores exactamente, pero no se documenta ningún mecanismo de verificación posterior que garantice la coincidencia con el texto fuente.
- Licencia `gemma`: implica la aceptación de los términos de uso de Gemma de Google y su política de uso prohibido. La información disponible no detalla las condiciones concretas para uso comercial, por lo que conviene revisar los términos antes de integrar el modelo en un producto.
- El modelo está construido sobre un modelo base con sesgos propios. Etiquetas como ETHNICITY, RELIGION, POLITICAL_BELIEF, DISABILITY o GENDER_SEX pueden comportar un tratamiento especialmente sensible bajo el RGPD y requerir base legal explícita.
- No se documentan datos de entrenamiento, composición del dataset ni proceso de alineación, lo que dificulta evaluar sesgos sistemáticos por dominio, idioma o tipo de documento.
- No hay información sobre el rendimiento en vLLM y SGLang medida de forma independiente; solo se afirma que debería coincidir con `transformers` y llama.cpp por usar los mismos pesos y decodificación greedy.
- El modelo no está pensado como asistente conversacional general; su uso fuera de la tarea de extracción de PII no está evaluado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inboxpraveen/Kavach-PII-270M
- Repositorio GGUF: https://huggingface.co/inboxpraveen/Kavach-PII-270M-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Perfil del autor en HuggingFace: https://huggingface.co/inboxpraveen
- Perfil del autor en GitHub: https://github.com/inboxpraveen/inboxpraveen
- Sitio personal del autor: https://inboxpraveen.github.io/
- Anuncio de Gemma 3 270M en el blog de Google Developers: https://developers.googleblog.com/en/introducing-gemma-3-270m/
