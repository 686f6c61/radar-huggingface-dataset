# bardsai/eu-pii-anonimization-multilang-v3

## Resumen

`bardsai/eu-pii-anonimization-multilang-v3` es un detector de información personal identificable (PII) multilingüe desarrollado por Bards AI, capaz de operar en las 24 lenguas oficiales de la Unión Europea. Se trata de un clasificador de tokens basado en ModernBERT, ajustado (fine-tuned) a partir del modelo base `jhu-clsp/mmBERT-base`, con 307,6 millones de parámetros y una ventana de contexto de hasta 8192 tokens. El modelo resuelve un problema crítico de cumplimiento normativo: la anonimización de datos personales en texto real (páginas web scrapeadas, listas de correo, facturas, tablas en PDF y salida OCR), un escenario donde muchos detectores genéricos fallan por la suciedad del texto.

La tercera versión supone un salto notable respecto a sus predecesoras: en el benchmark PIIMB pasa de una media F2 de 0,773 (v2) a 0,927, superando al mejor modelo alternativo publicado en el momento de su lanzamiento (0,836). Está entrenado con datasets públicos de referencia como `ai4privacy/pii-masking-openpii-1m`, `nvidia/Nemotron-PII` y `gretelai/gretel-pii-masking-en-v1`, y se distribuye bajo licencia Apache 2.0, con pesos en safetensors y exportaciones ONNX (FP32 e INT8) para inferencia en CPU y navegador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (clasificador de tokens) |
| Parametros totales | 307.587.915 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (inferencia por ventanas de 512 tokens con solapamiento de 128) |
| Tipos de cuantizacion | FP32 (PyTorch/ONNX) e INT8 dinámico (ONNX) |
| Idiomas soportados | 24 lenguas oficiales de la UE: en, pl, de, fr, es, it, nl, pt, ro, cs, sv, el, hu, bg, hr, da, et, fi, ga, lv, lt, mt, sk, sl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX (`onnx/model.onnx`, `onnx/model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo es un clasificador de tokens (token classification) construido sobre ModernBERT, una arquitectura transformer de codificador con mejoras de eficiencia frente a BERT clásico, heredada de `jhu-clsp/mmBERT-base`, una variante multilingüe optimizada para cobertura de idiomas. La salida es una etiqueta por token en formato BIO, con 37 tipos de entidad, incluyendo novedades de v3 como `DATE_TIME` (fechas y horas que no son fecha de nacimiento) y `URL`.

El entrenamiento combina varios datasets públicos de detección y enmascaramiento de PII: `ai4privacy/pii-masking-openpii-1m`, `piimb/privy`, `nvidia/Nemotron-PII`, `gretelai/gretel-pii-masking-en-v1`, `dglover1/mapa-eur-lex` y `HuggingFaceFW/fineweb-2` (usado presumiblemente como corpus de texto real multilingüe). Una parte diferencial del sistema es el decodificador a nivel de palabra incluido en `pii_detector.py`: en lugar de un argmax por sub-token, agrupa probabilidades por palabra (media de sub-tokens, con probabilidad B e I agrupadas por tipo), fusiona palabras contiguas del mismo tipo, aplica comprobaciones de formato (un teléfono necesita al menos 5 dígitos, una URL debe tener forma de enlace) y fuerza toda dirección de correo detectada por regex a etiquetarse como `EMAIL_ADDRESS`. El texto se procesa en ventanas de 512 tokens con solapamiento de 128 para cubrir documentos largos.

## Capacidades

- Detección de 37 tipos de entidad PII en formato BIO, entre ellos `PERSON_NAME`, `PERSON_ALIAS`, `PERSON_IDENTIFIER`, `PERSON_ATTRIBUTE`, `PERSON_ROLE_OR_TITLE`, `DATE_OF_BIRTH`, `DATE_TIME`, `EMAIL_ADDRESS`, `PHONE_NUMBER`, `CONTACT_HANDLE`, `POSTAL_ADDRESS`, `LOCATION`, `GEO_LOCATION` y `URL` (lista completa en la model card).
- Cobertura de las 24 lenguas oficiales de la UE con rendimiento homogéneo: la lengua más débil en ai4privacy-multi puntúa 0,989 de F2.
- Anonimización directa mediante `det.anonymize(text)`, con sustitución de spans por marcadores como `[PERSON_NAME]` o `[EMAIL_ADDRESS]`.
- Filtrado selectivo de tipos: el parámetro `labels` permite restringir la anonimización a un subconjunto de entidades (por ejemplo, solo nombres y correos).
- Manejo de texto real y ruidoso: páginas web crudas, listas de correo, texto de facturas, tablas en PDF y salida OCR.
- Procesamiento de documentos largos mediante ventanas de 512 tokens con solapamiento de 128 tokens.
- Inferencia en CPU vía ONNX (FP32 e INT8) y ejecución en navegador con transformers.js/WASM, sin que el texto salga del dispositivo del usuario.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso; su función es exclusivamente token classification.

## Casos de uso

- Cumplimiento del RGPD en pipelines de datos: anonimización de nombres, teléfonos, correos y direcciones antes de almacenar o compartir datasets con terceros, aprovechando la cobertura de las 24 lenguas de la UE en un único modelo.
- Limpieza de corpus de scraping web: detección de PII en páginas de contacto, textos de Impressum y scrapes crudos, donde el modelo alcanza 0,992 de F1 estricto sobre 332 spans de test manual.
- Anonimización de tickets de soporte y correos: enmascaramiento de datos personales en listas de correo y comunicaciones de clientes antes de usarlos para entrenar o evaluar otros modelos.
- Procesado de documentos digitalizados: detección de PII en texto extraído de PDF y OCR, un escenario de alto ruido donde los detectores basados en regex suelen ser insuficientes.
- Redacción selectiva en logs y analíticas: uso del parámetro `labels` para anonimizar solo tipos concretos (por ejemplo, solo correos y teléfonos) y conservar fechas genéricas o URLs cuando no suponen riesgo.
- Despliegue en cliente con privacidad total: ejecución del modelo INT8 en el navegador mediante transformers.js, de modo que el texto sensible nunca se envía a un servidor, útil en formularios de contacto o herramientas de redacción en el cliente.
- Preparación de datos para LLM: filtrado de PII en chunks multilingües de web (tipo FineWeb-2) antes de incluirlos en datasets de preentrenamiento o fine-tuning.

## Benchmarks y rendimiento

Resultados del benchmark PIIMB (F2 a nivel de carácter, label-agnostic, con el pipeline estándar de `transformers`, `aggregation_strategy="simple"`, evaluador `piimb evaluate` 0.3.0):

| Task | v1 | v2 | v3 | Mejor otro modelo en su lanzamiento |
|---|---|---|---|---|
| ai4privacy-en | 0,831 | 0,916 | 0,991 | 0,978 |
| ai4privacy-multi (23 lenguas) | 0,843 | 0,935 | 0,992 | 0,976 |
| gretel | 0,890 | 0,930 | 0,991 | 0,983 |
| mapa-eur-lex (21 lenguas) | 0,254 | 0,267 | 0,633 | 0,573 |
| nemotron-pii | 0,715 | 0,743 | 0,959 | 0,972 |
| privy | 0,575 | 0,848 | 0,993 | 0,987 |
| **Media** | 0,685 | 0,773 | **0,927** | 0,836 |

Resultados sobre texto real con anotación manual y puntuación estricta (un span solo cuenta si cada letra y dígito se predice con el tipo correcto):

| Test set (texto real) | Spans | v1 | v2 | v3 |
|---|---|---|---|---|
| Listas de correo, Impressum, scrapes crudos, texto de PDF | 332 | 0,891 | 0,982 | 0,992 |
| Páginas web frescas (contactos de 10 sitios) | 75 | 0,921 | 0,968 | 0,976 |
| Chunks de FineWeb-2 (multilingüe, held-out) | 48 | 0,835 | 0,948 | 0,933 |
| **Total texto real** | **455** | **0,885** | **0,973** | **0,980** |

Sobre los 455 spans de texto real, v3 alcanza precisión estricta de 0,975 y recall de 0,985. Los autores advierten que los conjuntos de texto real son pequeños, por lo que diferencias inferiores a ~0,01 son ruido. Por formato de pesos: FP32 (PyTorch y ONNX) obtiene 0,980 de F1 estricto; la exportación INT8 dinámica también 0,980; el modelo INT8 en navegador (transformers.js, WASM) puntúa 0,978.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo FP32 ocupa 1,2 GB de pesos, por lo que es viable en GPUs con 4 GB de VRAM o incluso en CPU; la versión INT8 ocupa 0,3 GB y funciona en WASM dentro del navegador.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU moderna (incluso integrada) es suficiente. Para cargas batch grandes, una GPU de gama media tipo RTX 3060/4060 o superior acelera el procesado masivo de documentos.
- Consumer GPU: cabe sobradamente en cualquier GPU de consumo actual en FP32; en CPU también es plenamente funcional vía onnxruntime.
- Opciones de despliegue: `transformers` + `torch` con el decodificador `pii_detector.py` incluido en el repo, onnxruntime con `onnx/model.onnx` o `onnx/model_quantized.onnx`, transformers.js (WASM) para navegador, y demo en vivo en HuggingFace Spaces. No se menciona soporte específico para vLLM, llama.cpp, Ollama o TGI (al ser un modelo encoder, no aplican directamente).
- Latencia y throughput: no disponible en la información publicada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Puntuación PIIMB media | Idiomas | Licencia |
|---|---|---|---|---|---|---|
| bardsai/eu-pii-anonimization-multilang-v3 | ModernBERT (token classification) | 307,6 M | 8192 tokens | 0,927 | 24 (UE) | Apache 2.0 |
| bardsai/eu-pii-anonimization-multilang-v2 | no disponible | no disponible | no disponible | 0,773 | 24 (UE) | Apache 2.0 |
| Mejor modelo alternativo en el lanzamiento de v3 (según PIIMB) | no disponible | no disponible | no disponible | 0,836 | no disponible | no disponible |

La comparación con alternativas se basa en la tabla PIIMB publicada por los autores, donde v3 supera la media del mejor modelo rival en todos los test sets salvo `nemotron-pii` (0,959 frente a 0,972). Datos detallados de arquitectura y licencia de los competidores: no disponibles.

## Limitaciones y advertencias

- Rendimiento desigual por dominio: en `mapa-eur-lex` (texto legal) la puntuación es 0,633, notablemente inferior a la de dominios web, por lo que conviene validar en documentos legales antes de uso en producción.
- Riesgo de alucinación inversa (falsos positivos): el decodificador aplica comprobaciones de formato para descartar spans implausibles, pero con precisión estricta de 0,975 se esperan errores en ~2,5 % de los spans predichos; en flujos con consecuencias legales conviene revisión humana o umbrales de confianza.
- Falsos negativos: el recall estricto es 0,985, lo que implica que aproximadamente el 1,5 % de los spans reales no se detectan; el RGPD no tolera filtraciones de datos personales, así que para casos de alto riesgo se recomienda combinar con reglas regex complementarias.
- Los conjuntos de test de texto real son pequeños (455 spans en total), por lo que las métricas tienen incertidumbre apreciable según los propios autores.
- El uso del pipeline estándar de `transformers` con argmax por sub-token produce fragmentos incorrectos; es imprescindible emplear el decodificador de `pii_detector.py` incluido en el repo.
- La longitud de contexto efectiva por ventana es de 512 tokens con solapamiento de 128; documentos muy largos se procesan por trozos, lo que puede afectar a entidades que crucen límites de ventana.
- Licencia Apache 2.0 sin restricciones de uso comercial conocidas, pero el modelo procesa datos personales: el despliegue debe cumplir por sí mismo las obligaciones del RGPD (el modelo es una herramienta, no una garantía de cumplimiento).
- No es un modelo generativo: no sirve para reescritura de texto, resumen ni tareas fuera de la detección de PII.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bardsai/eu-pii-anonimization-multilang-v3
- Demo en vivo (HuggingFace Spaces): https://huggingface.co/spaces/bardsai/eu-pii-anonymization-demo
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Predecesor v2: https://huggingface.co/bardsai/eu-pii-anonimization-multilang-v2
- Predecesor v1: https://huggingface.co/bardsai/eu-pii-anonimization-multilang
- Benchmark PIIMB (leaderboard): https://huggingface.co/spaces/piimb/pii-masking-benchmark-leaderboard
- Dataset ai4privacy/pii-masking-openpii-1m: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1m
- Dataset nvidia/Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset gretelai/gretel-pii-masking-en-v1: https://huggingface.co/datasets/gretelai/gretel-pii-masking-en-v1
- Dataset piimb/privy: https://huggingface.co/datasets/piimb/privy
- Dataset dglover1/mapa-eur-lex: https://huggingface.co/datasets/dglover1/mapa-eur-lex
- Dataset HuggingFaceFW/fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
