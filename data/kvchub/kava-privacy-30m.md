# KvcHub/Kava-Privacy-30M

## Resumen

Kava-Privacy-30M es un encoder de clasificación de tokens especializado en detección y redacción de información personal identificable (PII) y secretos técnicos en 36 idiomas. Lo desarrolla KvcHub y se distribuye con licencia Apache 2.0. A diferencia de los grandes modelos generativos, es un modelo discriminativo: etiqueta cada token con BIO y devuelve spans exactos, de modo que no puede alucinar texto ni reescribir contenido que no debería tocar.

La arquitectura es ModernBertForTokenClassification con 10 capas, dimensión oculta 384, 6 cabezas de atención, GeGLU de 1024 y RoPE, con 30.457.021 parámetros (unos 116 MB en safetensors). Se entrenó al 100 % desde cero, sin pesos preentrenados, con un tokenizador BPE a nivel de byte propio de 32.768 entradas que separa los dígitos individualmente, algo relevante para detectar tarjetas, identificadores y claves.

Su relevancia práctica está en el tamaño y el coste: cubre 30 clases de entidad (datos personales, financieros, médicos, identificadores gubernamentales y secretos como API keys, JWT o URLs de base de datos) en 36 idiomas y 12 sistemas de escritura, ejecutándose en CPU, MPS o CUDA con latencia de decenas de milisegundos por documento. El entrenamiento completo declarado ocupó 121,4 minutos y 34,6 millones de tokens en un único Apple M5 Pro de 24 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBertForTokenClassification (10 capas, hidden 384, 6 cabezas, GeGLU 1024, RoPE) |
| Parámetros totales | 30.457.021 (30,46 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos safetensors en el repo; el autor no documenta GGUF ni otras variantes) |
| Idiomas soportados | 36: en, es, fr, de, it, pt, nl, pl, ru, uk, tr, ar, he, fa, hi, bn, ur, ta, zh, ja, ko, vi, th, id, ms, tl, sv, no, da, fi, cs, ro, hu, el, sw |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional de tipo ModernBERT adaptado a clasificación de tokens. Usa 10 capas con dimensión oculta 384, 6 cabezas de atención, FFN GeGLU de 1024 y embeddings posicionales rotatorios (RoPE). La cabeza de clasificación emite 61 etiquetas BIO que cubren 30 clases de entidad. El tokenizador es un BPE a nivel de byte de vocabulario 32.768 entrenado para 36 idiomas, con separación explícita de dígitos individuales, lo que facilita la delimitación exacta de cadenas numéricas como tarjetas, identificadores fiscales o números de pasaporte.

El entrenamiento se declara íntegramente from scratch, sin inicialización desde pesos preentrenados, en dos fases sobre el dataset KvcHub/Kava-Privacy-30M-Dataset (284.526 ejemplos en 36 idiomas): 30 minutos de preentrenamiento MLM multilingüe seguidos de 90 minutos de clasificación de tokens BIO. El cómputo total fue de 34,6 millones de tokens en 121,4 minutos sobre un Apple M5 Pro con 24 GB de memoria unificada y sin swap a disco. No se documenta uso de RLHF, DPO ni decodificación especulativa; al ser un modelo discriminativo, esas técnicas no aplican.

## Capacidades

- Detección y redacción de PII en 36 idiomas y 12 sistemas de escritura, con 30 clases de entidad y 61 etiquetas BIO.
- Clasificación de tokens con spans exactos (offset de inicio, offset de fin y tipo de entidad), apta para sustitución determinista por marcadores.
- Detección de secretos técnicos: claves de API, tokens de autenticación, JWT, URLs de conexión a base de datos y carteras de criptomonedas.
- Detección de identificadores de alto riesgo: tarjetas de crédito, identificadores fiscales, pasaportes, identificadores médicos e identificadores nacionales.
- Salida determinista sin generación de texto: no reescribe el contenido no sensible ni puede ser manipulado mediante prompt injection al no existir prompt.
- Ejecución en CPU, MPS y CUDA, con throughput declarado de 33,3 documentos por segundo en Apple M5 Pro MPS (unos 30 ms por documento).
- No soporta tool calling, razonamiento multi-paso, agentes, visión ni audio: es exclusivamente un etiquetador de tokens.

## Casos de uso

- Redacción de PII en pipelines de ingesta de datos: el modelo se sitúa antes del almacenamiento para sustituir spans sensibles por marcadores, con la ventaja de que su salida BIO no altera el resto del texto y permite conservar el documento íntegro para análisis posterior.
- Cumplimiento de RGPD en registros de soporte: se aplica sobre tickets y transcripciones multi-idioma para anonimizar nombres, correos, teléfonos e identificadores fiscales antes de que el texto llegue a sistemas de analítica o a modelos generativos de terceros.
- Saneado de logs de aplicación: detecta API keys, tokens de autenticación y URLs de conexión a base de datos en líneas de log antes de enviarlas a plataformas de observabilidad, con la ventaja de ejecutarse en el propio host sin coste de API.
- Preprocesado para entrenamiento de modelos: elimina PII de corpus multilingües antes de usarlos en ajuste fino, reduciendo el riesgo de memorización de datos personales en el modelo resultante.
- Anonimización en el borde (edge): al ocupar unos 116 MB y funcionar en CPU, se puede empaquetar en aplicaciones de escritorio o móviles para redactar datos localmente sin enviar nada a la nube.
- Filtrado previo a la revisión humana en entornos sanitarios o legales: marca identificadores médicos y nacionales en documentos para que el revisor humano se centre en los spans detectados, con una tasa declarada de falsos positivos del 0,00 % sobre documentos sin PII.
- Enmascarado en formularios y exportaciones de bases de datos: se aplica por lotes sobre registros estructurados serializados a texto para producir versiones compartibles con terceros.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), sobre 8.503 documentos de test retenidos con 54.326 spans de PII en 36 idiomas, con coincidencia exacta de span a nivel de carácter:

| Métrica | Valor |
|---|---|
| Exact Span F1 | 0,9146 (91,46 %) |
| Exact Span Precision | 0,8952 (89,52 %) |
| Exact Span Recall | 0,9348 (93,48 %) |
| Tasa de falsos positivos en negativos duros (605 documentos sin PII) | 0,0000 (0,00 %) |
| Exact Span F1 en nvidia/Nemotron-PII (10.045 spans) | 0,9326 (93,26 %) |
| Recall en nvidia/Nemotron-PII | 0,9529 (95,29 %) |

Rendimiento por clase de entidad de alto riesgo (según el autor): DB_CONNECTION 100,0 %, CRYPTO_WALLET 100,0 %, TAX_ID 99,8 %, PASSPORT 99,4 %, MEDICAL_ID 99,2 %, AUTH_TOKEN 98,6 %, API_KEY 98,2 %, NATIONAL_ID 97,9 %, CREDIT_CARD 97,8 %, EMAIL 97,3 %.

Throughput declarado: 33,3 documentos por segundo en Apple M5 Pro con MPS, aproximadamente 30 ms por documento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (116 MB de pesos más activaciones y overhead del runtime); en la práctica cabe en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU, en Apple Silicon vía MPS y en cualquier GPU NVIDIA con CUDA. Para lotes grandes, una RTX 4090 o una A100 aportan margen de sobra, pero no son necesarias.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 1-2 GB de memoria libre, incluidas iGPU y dispositivos de borde.
- Opciones de despliegue: transformers con pipeline de token-classification; exportación a ONNX Runtime para CPU; TorchScript; integración en servicios FastAPI o similares. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo generativo.
- Latencia y throughput: unos 30 ms por documento y 33,3 documentos por segundo en Apple M5 Pro MPS según el autor; no se han publicado cifras para CPU x86 ni para CUDA.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Clases de PII | Licencia | F1 declarado | Notas |
|---|---|---|---|---|---|---|
| Kava-Privacy-30M | 30,46 M | 36 | 30 | Apache 2.0 | 0,9146 exact span F1 | Entrenado from scratch; incluye secretos técnicos |
| iiiorg/piiranha-v1 (mDeBERTa-v3-base) | ~280 M | 6 | 17 | no disponible en la información | 0,9312 token-level F1 multiclase | Unas 9 veces más grande; sin secretos técnicos |
| nvidia/gliner-PII | ~160-300 M | principalmente inglés | configurable zero-shot | no disponible en la información | 0,870 strict F1 (evaluación interna, τ=0,3) | Extracción de spans zero-shot |
| urchade/gliner_multi_pii-v1 | ~280 M | 6 | 40+ etiquetas zero-shot | no disponible en la información | no disponible | Flexibilidad zero-shot, mayor huella |

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente; los resultados en dominios distintos del dataset de entrenamiento pueden diferir.
- Es un modelo discriminativo: no genera explicaciones, resúmenes ni texto redactado, solo etiquetas de span. La sustitución por marcadores debe implementarla el sistema que lo consume.
- La cobertura de 36 idiomas es declarada, pero el dataset tiene 284.526 ejemplos repartidos entre todos ellos, por lo que la calidad en idiomas con pocos ejemplos puede ser notablemente inferior a la de inglés o español.
- No se documenta la longitud máxima de contexto; conviene truncar o fragmentar documentos largos, con el riesgo de perder spans que crucen la frontera de fragmento.
- Riesgo de falso negativo en formatos de PII no representados en el dataset (identificadores regionales poco frecuentes, formatos propietarios), lo que exige una capa de validación o revisión humana en flujos de alto riesgo.
- Al ser un etiquetador de tokens, la exactitud depende de la tokenización: identificadores con separadores atípicos pueden quedar mal delimitados.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales, pero conviene revisar los términos del dataset de entrenamiento por separado.
- No se han publicado análisis de sesgos por idioma, script o dominio; en producción conviene medir la tasa de error por segmento demográfico y lingüístico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KvcHub/Kava-Privacy-30M
- Dataset de entrenamiento: https://huggingface.co/KvcHub/Kava-Privacy-30M-Dataset
- Dataset de referencia para evaluación externa: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Modelo comparable piiranha-v1: https://huggingface.co/iiiorg/piiranha-v1
- Modelo comparable gliner-PII: https://huggingface.co/nvidia/gliner-PII
- Modelo comparable gliner_multi_pii-v1: https://huggingface.co/urchade/gliner_multi_pii-v1
