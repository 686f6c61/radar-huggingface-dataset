# newmean-ai/pii-large

## Resumen

newmean-pii-large es un modelo de reconocimiento de entidades nombradas (NER) especializado en detección de información personal identificable (PII), desarrollado por newmean-ai. Su función es localizar datos personales en texto libre para poder enmascararlos antes de que ese texto se envíe a un LLM de terceros (OpenAI, Anthropic, etc.), ya sea en el navegador o en el propio dispositivo. Forma parte de una familia de cuatro niveles (nano, small, medium, large) que da soporte al SDK de código abierto newmean-pii.

El modelo es un transformer encoder de 6 capas con 24,4 millones de parámetros, destilado a partir de mMiniLMv2-L6-H384 con el vocabulario de XLM-R podado a 35.298 piezas. Detecta 11 etiquetas a nivel de carácter (PERSON, EMAIL, PHONE, ADDRESS, ID_NUMBER, FINANCIAL, ORG, USERNAME, URL, DATE_OF_BIRTH y SECRET) en 54 idiomas. Se distribuye en formato ONNX con cuantización de 4 bits, con un tamaño de descarga de 15,5 MB en su variante por defecto.

Su relevancia actual radica en que resuelve el problema de privacidad en pipelines de LLM sin requerir infraestructura de servidor: el modelo corre en WebAssembly dentro del navegador o en dispositivos móviles, con licencia Apache-2.0 que permite uso comercial sin restricciones. La versión 1.1 incorpora mejoras específicas para textos cortos y exportaciones de encuestas, un caso de uso habitual en procesamiento de formularios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (6 capas), destilado de mMiniLMv2-L6-H384 |
| Parámetros totales | 24,4 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 256 tokens con stride de 64 |
| Tipos de cuantización | 4 bits (pesos y embeddings: `model_q4e.onnx`; solo pesos: `model_q4.onnx`) |
| Idiomas soportados | 54 idiomas (ar, az, bg, bn, ca, cs, da, de, el, en, es, et, fa, fi, fr, ga, he, hi, hr, hu, id, is, it, ja, ka, kk, km, ko, lt, lv, mr, ms, mt, nl, no, pl, pt, ro, ru, sk, sl, sq, sr, sv, sw, te, th, tl, tr, uk, ur, uz, vi, zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model_q4e.onnx` 15,5 MB, `model_q4.onnx` 20,7 MB); tokenizer en `tokenizer.web.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de 6 capas con embeddings completos podados, derivado de mMiniLMv2-L6-H384-distilled-from-XLMR-Large. El vocabulario de XLM-R se redujo a las 35.298 piezas que aparecen en los datos de entrenamiento, lo que reduce el tamaño del modelo sin perder cobertura lingüística. La tarea es token-classification con esquema BIO: el modelo recibe `input_ids` y `attention_mask` y devuelve logits BIO para las etiquetas definidas en `config.json`. Las personas y las URLs llevan un nivel asociado (1 = identificador directo, 2 = indirecto); las direcciones IP se aprenden como ID_NUMBER.

El entrenamiento se realizó mediante destilación a partir de dos modelos profesor privados de mayor tamaño (mDeBERTa-v3-base y XLM-R-large), ajustados específicamente para esta tarea. Los datos consisten en aproximadamente 1,31 millones de textos sintéticos en 54 idiomas, generados con modelos Claude a partir de una guía de etiquetado escrita; la versión 1.1 añadió 240.498 textos cortos (títulos de columna, opciones de respuesta, palabras sueltas, nombres y valores aislados, filas de encuestas). No se utilizaron datos personales reales ni conjuntos de datos externos para el entrenamiento.

## Capacidades

- Detección de PII a nivel de carácter con 11 etiquetas: PERSON, EMAIL, PHONE, ADDRESS, ID_NUMBER, FINANCIAL, ORG, USERNAME, URL, DATE_OF_BIRTH y SECRET.
- Clasificación de personas y URLs por nivel de identificabilidad (1 = directo, 2 = indirecto).
- Detección de direcciones IP, aprendidas como ID_NUMBER.
- Soporte multilingüe en 54 idiomas, incluidos español, catalán, gallego, euskera (no listado explícitamente), árabe, chino, japonés, coreano, hindi y la mayoría de lenguas europeas.
- Funcionamiento en navegador mediante WebAssembly (onnxruntime-web o el motor propio del SDK) y en dispositivo.
- Integración con un vault opcional del SDK que permite restaurar los valores reales en la respuesta del LLM tras el enmascaramiento.
- Capa opcional de patrones (correo, URL, tarjeta/cuenta, teléfono, número de residente coreano), desactivada por defecto.
- Modo tabla con contexto de cabecera para exportaciones de encuestas y formularios.
- No soporta tool calling, agentes ni generación de texto: es exclusivamente un modelo de etiquetado.

## Casos de uso

- **Enmascaramiento previo a LLM en el navegador**: el SDK descarga el modelo una vez, verifica su SHA-256 y redacta el texto del usuario antes de enviarlo a una API de terceros. Es adecuado por su tamaño reducido (15,5 MB) y su ejecución en WebAssembly sin servidor.
- **Cumplimiento de RGPD en formularios web**: el modelo detecta nombres, correos, teléfonos y direcciones en los campos de un formulario antes de que los datos salgan del cliente, lo que reduce la superficie de exposición de datos personales.
- **Redacción de logs y trazas de aplicación**: se puede integrar en pipelines de logging para enmascarar PII en texto de logs, JSON o mensajes de error antes de almacenarlos o enviarlos a un sistema de observabilidad.
- **Procesamiento de exportaciones de encuestas**: el modo tabla con `context: "header"` reduce la tasa de PII no enmascarada al 1,44 % en 556 exportaciones de encuestas y formularios en 54 idiomas (frente al 6,17 % del modo tabla solo).
- **Anonimización de transcripciones de voz**: al aceptar texto de transcripciones ASR, permite enmascarar nombres, teléfonos y direcciones en actas de reuniones o llamadas de atención al cliente antes de su análisis.
- **Procesamiento de correos electrónicos**: detección de remitentes, firmas, teléfonos y direcciones en cuerpos de correo para su clasificación o resumen automático sin exponer datos personales.
- **Aplicaciones móviles y de escritorio**: el SDK ofrece paquetes para iOS, Android, Flutter y Rust, lo que permite redactar PII en el propio dispositivo en aplicaciones nativas.
- **Extracción de datos de OCR**: el modelo está diseñado para texto de OCR, por lo que puede enmascarar PII en documentos escaneados antes de su procesamiento posterior.

## Benchmarks y rendimiento

Resultados del modelo solo (sin capa de patrones), archivo por defecto, onnxruntime en CPU. "Miss" = proporción de caracteres de PII no enmascarados (menor es mejor); "over" = proporción de caracteres no PII enmascarados.

| Conjunto de evaluación | Miss % / Over % |
|---|---|
| newmean-pii-dataset (test público, 54 idiomas, 17.058 filas) | 1,6 / 0,5 (F1 exacto 0,80) |
| KDPII (coreano) | 9,6 / 1,7 |
| OpenPII 1.5M (30 idiomas) | 4,9 / 4,1 |
| Nemotron-PII (inglés) | 6,1 / 1,6 |
| Gretel finance (7 idiomas) | 21,4 / 5,5 |

En el conjunto privado de 20.691 ítems cortos en 54 idiomas y 228 archivos CSV de encuestas (v1.1): enmascara el 7,9 % de los ítems sin PII (v1.0: 30,6 %) y el 6,6 % de las celdas sin PII en modo celda a celda (v1.0: 24,9 %); encuentra el 99,0 % de los nombres escritos aislados.

Con SDK 1.2, los textos con emoji enmascarados caen del 23,95 % (modelo solo) al 0,87 %. El modo tabla con `context: "header"` falla el 1,44 % de los caracteres de PII en 556 exportaciones de encuestas y formularios en 54 idiomas (modo tabla solo: 6,17 %) y enmascara el 12,30 % de sus celdas sin PII.

Velocidad en CPU de una VM Colab L4 (Xeon 2,20 GHz, onnxruntime): 88 ms por texto con un hilo, 23 ms con 12 hilos, sobre los textos del test público.

En el test público, el detector público más cercano de los ocho comparados (gliner-pii-edge, 176 MB) falla el 19,6 %. El conjunto público de newmean-pii-dataset se generó con el mismo diseño y guía que los datos de entrenamiento, por lo que estos modelos tienen ventaja in-distribution en él; los conjuntos externos nunca se usaron para entrenamiento.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en cualquiera de las cuantizaciones disponibles (15,5 MB en disco para `model_q4e.onnx`, 20,7 MB para `model_q4.onnx`).
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una GPU integrada; también funciona en CPU sin GPU.
- GPU recomendadas: no requiere GPU dedicada; una A100 o H100 solo tiene sentido para servir muchas peticiones concurrentes.
- Despliegue: onnxruntime (CPU o GPU), onnxruntime-web (WebAssembly en navegador), SDK `@newmean-ai/pii` (npm), paquetes para Python, iOS, Android, Flutter y Rust. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de token-classification.
- Latencia: 88 ms por texto con un hilo de CPU y 23 ms con 12 hilos en un Xeon a 2,20 GHz (textos del test público).
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Tamaño |
|---|---|---|---|---|---|
| newmean-pii-large | 24,4 M | 256 tokens (ventana) | 54 | Apache-2.0 | 15,5 MB (q4e) |
| gliner-pii-edge | no disponible | no disponible | no disponible | no disponible | 176 MB |
| newmean-pii-medium | no disponible | no disponible | 54 | Apache-2.0 | no disponible |
| newmean-pii-small | no disponible | no disponible | 54 | Apache-2.0 | no disponible |

El único comparable con datos en la información proporcionada es gliner-pii-edge: en el test público de newmean-pii-dataset falla el 19,6 % de los caracteres de PII, frente al 1,6 % de newmean-pii-large, con un tamaño de 176 MB frente a 15,5 MB. La comparación completa, por etiqueta y por idioma, está en el informe técnico y en el leaderboard del proyecto. Los datos de los niveles medium, small y nano no se detallan en la información disponible.

## Limitaciones y advertencias

- Ningún detector encuentra todo: el propio autor advierte que el resultado debe usarse para reducir lo que se envía, no como garantía de anonimato.
- El rendimiento cae en dominios alejados del entrenamiento: en Gretel finance (7 idiomas) la tasa de PII no enmascarada sube al 21,4 %.
- El conjunto público de evaluación comparte diseño y guía con los datos de entrenamiento, por lo que las cifras in-distribution sobreestiman el rendimiento real; los conjuntos externos son la referencia más fiable.
- El modelo está entrenado exclusivamente con datos sintéticos generados por modelos Claude; puede tener sesgos de distribución respecto a texto real de producción.
- La ventana de contexto es de 256 tokens con stride de 64; textos más largos requieren fragmentación y pueden perder entidades en los límites.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre la exhaustividad de la detección.
- Los conjuntos de evaluación privados (ítems cortos y exportaciones de encuestas) son sintéticos y no publicados, por lo que no son verificables de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/newmean-ai/pii-large
- Repositorio del SDK: https://github.com/newmean-ai/pii
- Paquete npm: https://www.npmjs.com/package/@newmean-ai/pii
- Demo en navegador: https://pii.newmean.ai
- Dataset público: https://huggingface.co/datasets/newmean-ai/pii-dataset
- Leaderboard: https://huggingface.co/spaces/newmean-ai/pii-leaderboard
- Informe técnico: https://github.com/newmean-ai/pii/blob/main/docs/report/REPORT.md
- Modelo base: https://huggingface.co/nreimers/mMiniLMv2-L6-H384-distilled-from-XLMR-Large
- Niveles medium, small y nano: https://huggingface.co/newmean-ai/pii-medium, https://huggingface.co/newmean-ai/pii-small, https://huggingface.co/newmean-ai/pii-nano
