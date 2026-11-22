# shoresh-labs/seter-pii-he-ar-fast

## Resumen

Seter PII Fast es un modelo de clasificación de tokens (token-classification) especializado en la detección de datos personales identificables (PII) en hebreo, árabe e inglés, incluyendo textos mixtos hebreo/árabe-inglés. Lo desarrolla Shoresh Labs y se publica bajo licencia MIT. El modelo resuelve un problema concreto y bien documentado: los detectores de PII gratuitos funcionan bien en inglés pero fallan sistemáticamente con nombres propios en hebreo y árabe, especialmente nombres de pila aislados, nombres con prefijos adjuntos (ל/ו/ש), títulos (עו"ד, د.) y kunyas árabes (أبو …).

Técnicamente es un fine-tuning de `jhu-clsp/mmBERT-base` (arquitectura ModernBERT) con 307.538.699 parámetros totales, contexto de 8.000 tokens y salida en cinco etiquetas compatibles con `openai/privacy-filter` (`private_person`, `private_address`, `private_phone`, `private_email`, `account_number`), lo que permite sustituirlo en pipelines ya construidos alrededor de ese modelo. Se distribuye en safetensors y ONNX (incluida una versión int8 que corre en navegador).

Esta es la variante "fast" del proyecto Seter; la variante "accurate" es `seter-pii-he-ar` (v1.2, basada en xlm-r-large). La versión actual del repositorio es v1.1.1 (17 de noviembre de 2026), que corrige los ficheros ONNX y el `config.json` de la v1.1. Es relevante ahora porque ofrece una alternativa ligera, multilingüe en hebreo y árabe, con licencia permisiva y desplegable en CPU, para tareas de redacción y anonimización en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (fine-tuning de `jhu-clsp/mmBERT-base`) |
| Parametros totales | 307.538.699 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.000 tokens |
| Tipos de cuantizacion | ONNX float (sin cuantizar) y ONNX int8 (`model_quantized.onnx`) |
| Idiomas soportados | hebreo (he), árabe (ar), inglés (en); incluye texto mixto hebreo/árabe-inglés |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (float e int8) |
| Tarea | token-classification (NER de PII) |
| Etiquetas de salida | `private_person`, `private_address`, `private_phone`, `private_email`, `account_number` |
| Versión del repositorio | v1.1.1 (17 nov 2026) |
| Tamaño del repo | 7,1 GB |
| Descargas | 555 |
| Compatibilidad | Entrenado con transformers 5; `config.json` corregido para lectura correcta en transformers 4.x |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/mmBERT-base`, un encoder ModernBERT multilingüe, y se afina como clasificador de tokens para NER de PII con cinco clases. La ventana de contexto de 8.000 tokens permite procesar documentos completos (correos, hilos de chat, notas) sin fragmentar en exceso. La arquitectura ModernBERT incorpora atención con rotación posicional y capas optimizadas para eficiencia en CPU, lo que explica la mejora de velocidad de aproximadamente 2,3× en CPU frente a la variante "accurate".

El entrenamiento se realizó con transformers 5 sobre un generador de datos propio del proyecto, con una política de etiquetado definida por el autor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO (no aplica habitualmente a un encoder de clasificación). El modelo se evaluó sobre 150 documentos reservados (50 por idioma, 2.480 spans etiquetados) escritos específicamente para la evaluación, y sobre el benchmark independiente REDACT (subconjuntos hebreo, árabe e inglés), que nunca se usó para entrenamiento. Los pesos publicados corresponden a la semilla de entrenamiento 3, elegida tras ver las puntuaciones; el autor recomienda leer la media de las tres semillas como cifra esperada.

## Capacidades

- Detección de PII en hebreo, árabe e inglés, incluyendo mensajes mixtos hebreo/árabe-inglés.
- Reconocimiento de nombres de persona, incluyendo nombres de pila aislados, nombres con prefijos adjuntos (ל/ו/ש), títulos (עו"ד, د.) y kunyas árabes (أبو …).
- Detección de direcciones, teléfonos, correos electrónicos y números de cuenta.
- Detección de números de tarjeta de pago, incluidas formas "ending in 1234" y enmascaradas (98% / 94% / 97% en hebreo / árabe / inglés en la v1.1).
- Detección de números de identidad nacional en inglés (98% en la v1.1).
- Salida con nombres de etiqueta compatibles con `openai/privacy-filter`, lo que facilita el intercambio en pipelines existentes.
- Ejecución en navegador mediante el fichero ONNX int8 (demo pública disponible).
- No dispone de tool calling, function calling, capacidades de agente, visión ni audio: es un encoder de clasificación de tokens, no un modelo generativo.

## Casos de uso

- Redacción automática de PII en atención al cliente: el modelo procesa hilos de chat y tickets multi-turno de hasta 8.000 tokens y marca nombres, teléfonos y correos para su enmascaramiento antes de almacenar o reenviar el texto, con buen rendimiento específico en hebreo y árabe donde otros detectores fallan.
- Anonimización de registros médicos y notas de RR. HH.: los documentos reservados de evaluación incluyen notas médicas y de recursos humanos; el modelo detecta nombres de pacientes y empleados, direcciones y teléfonos en hebreo y árabe para cumplir requisitos de privacidad antes de compartir datos con terceros.
- Cumplimiento normativo en logs y formularios: integrado como paso previo al almacenamiento de logs, detecta correos, teléfonos y números de cuenta en texto mixto hebreo/árabe-inglés, reduciendo el riesgo de retención de datos personales en sistemas de observabilidad.
- Sustitución directa de `openai/privacy-filter`: al usar los mismos nombres de etiqueta, se puede intercambiar en pipelines existentes para mejorar la cobertura en hebreo y árabe sin reescribir la lógica de post-proceso.
- Procesamiento en el navegador o en el borde: el fichero ONNX int8 (F1 0,943 frente a 0,947 del PyTorch) permite ejecutar la detección en cliente sin enviar texto sensible a un servidor, útil en demos y aplicaciones web de privacidad.
- Pretratamiento para pipelines de LLM: como paso previo a enviar documentos a un modelo generativo, se usa para redactar PII y evitar fugas de datos personales en prompts y contextos.
- Moderación y revisión de correspondencia legal: las cartas legales forman parte del conjunto de evaluación; el modelo puede marcar nombres y direcciones en correspondencia jurídica multilingüe antes de su archivo o publicación.

## Benchmarks y rendimiento

Documentos reservados (150 documentos, 2.480 spans; F1, precisión y recall a nivel de carácter):

| Métrica | fast v1.0 | fast v1.1 (pesos publicados) | fast v1.1 (media 3 semillas) | large v1.2 (pesos publicados) |
|---|---|---|---|---|
| F1 de carácter | 0,870 | 0,947 | 0,942 | 0,968 |
| Precisión de carácter | 0,799 | 0,916 | 0,907 | 0,962 |
| Recall de carácter | 0,955 | 0,980 | 0,980 | 0,975 |
| Entidades cubiertas por completo | 0,885 | 0,956 | 0,954 | 0,961 |
| Spans predichos sin entidad etiquetada | 984 | 317 | 350 | 117 |
| F1 hebreo / árabe / inglés | 0,833 / 0,886 / 0,889 | 0,943 / 0,945 / 0,953 | 0,929 / 0,944 / 0,952 | 0,969 / 0,973 / 0,963 |

Benchmark independiente REDACT (solo evaluación; F1):

| Idioma | openai/privacy-filter | fast v1.0 | fast v1.1 (media 3 semillas; pesos publicados) | large v1.2 (media 3 semillas) |
|---|---|---|---|---|
| Hebreo (621 registros) | 0,642 | 0,850 | 0,905 (0,908) | 0,915 |
| Árabe (568) | 0,735 | 0,893 | 0,913 (0,914) | 0,922 |
| Inglés (534) | 0,709 | 0,841 | 0,885 (0,886) | 0,890 |

ONNX: `onnx/model.onnx` produce los mismos spans que los pesos PyTorch en los 150 documentos reservados (F1 0,947); `onnx/model_quantized.onnx` (int8) obtiene F1 0,943 (precisión 0,919, recall 0,968). Los ficheros ONNX publicados entre el 12 y el 17 de noviembre de 2026 (revisión `v1.1`) puntuaron 0,931 y 0,930 y no deben usarse.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 308M parámetros; en fp32 ocupa aproximadamente 1,2 GB de pesos y en int8 unos 0,3 GB, más memoria de activaciones (moderada con contexto de 8.000 tokens).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; no requiere A100 ni H100. Una RTX 4090 o una GPU consumer de gama media (RTX 3060 en adelante) lo ejecuta con holgura.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna con 4-6 GB de VRAM.
- CPU: es viable en CPU; el autor indica que la variante fast es aproximadamente 2,3× más rápida en CPU que la variante accurate, y el ONNX int8 está pensado para ejecución en navegador.
- Opciones de despliegue: ONNX Runtime (float o int8), transformers (PyTorch), y en general cualquier runtime compatible con safetensors/ONNX. No se documentan en la información disponible configuraciones específicas para vLLM, llama.cpp, Ollama o TGI (no aplican de forma estándar a un encoder de clasificación).
- Latencia y throughput: no disponible en la información proporcionada, salvo la referencia cualitativa de 2,3× más rápido en CPU que la variante accurate.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 REDACT he/ar/en | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| seter-pii-he-ar-fast v1.1 | 307,5M (ModernBERT) | 8.000 | 0,905 / 0,913 / 0,885 | MIT | Hugging Face, ONNX int8, demo en navegador |
| seter-pii-he-ar v1.2 (large) | no disponible (xlm-r-large) | no disponible | 0,915 / 0,922 / 0,890 | no disponible en la información | Hugging Face |
| openai/privacy-filter | no disponible | no disponible | 0,642 / 0,735 / 0,709 | no disponible en la información | Hugging Face |

La variante fast sacrifica entre 0,5 y 1,0 puntos de F1 en REDACT frente a la variante large a cambio de menor tamaño, mayor velocidad en CPU y contexto de 8.000 tokens. Frente a `openai/privacy-filter`, la mejora en hebreo y árabe es de 26 y 18 puntos de F1 respectivamente, y de 17,6 puntos en inglés en el benchmark REDACT.

## Limitaciones y advertencias

- El conjunto de evaluación reservado es pequeño (150 documentos) y fue escrito y etiquetado por un modelo de IA a partir de una política escrita, con revisión por un segundo revisor de IA, no por personas; la política fue escrita por el mismo autor que las clases de entrenamiento, lo que favorece a esas clases.
- El modelo fast etiqueta aproximadamente 2,7 veces más spans espurios que la variante large (317 frente a 117 en los documentos reservados); la precisión en hebreo es su punto más débil (0,906 con los pesos publicados, 0,884 de media entre semillas).
- La v1.1 empeora respecto a la v1.0 en `Preferred_Name` en inglés: cae de 0,987 a 0,927 de media (0,936 con los pesos publicados); los fallos son nombres de pantalla en campos de nombre para mostrar y una palabra común usada como nombre. También baja en números de pasaporte ingleses (1,000 → 0,970), apellidos aislados (0,3-0,8 puntos por idioma) y pierde 3 de 304 teléfonos reservados (la v1.0 no perdía ninguno). El autor lo publica como excepción declarada a su regla de release.
- Los pesos publicados son la semilla de entrenamiento 3, elegida tras ver las puntuaciones; debe leerse la media de las tres semillas como cifra esperada.
- Los ficheros ONNX de la revisión `v1.1` (12-17 nov 2026) están defectuosos (exportados con transformers 4.57, que lee mal el `config.json`) y no deben usarse; usar la v1.1.1.
- REDACT deja muchos datos personales sin etiquetar (en una auditoría de 300 predicciones, el 59-66% de los spans sin etiqueta REDACT eran datos personales), por lo que la precisión de REDACT y su F1 subestiman a todos los sistemas de la tabla.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos (spans espurios) y falsos negativos en nombres y contextos no cubiertos por la política de etiquetado.
- Licencia MIT: permite uso comercial y modificación, pero el modelo se distribuye sin garantías; el autor no ofrece compromisos de exactitud para producción.
- No es un modelo generativo: no soporta tool calling, agentes, visión ni audio, y no debe evaluarse como tal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shoresh-labs/seter-pii-he-ar-fast
- Variante accurate (large): https://huggingface.co/shoresh-labs/seter-pii-he-ar
- Demo en navegador (ONNX int8): https://huggingface.co/spaces/yinonov/seter-demo
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- `openai/privacy-filter` (etiquetas compatibles): https://huggingface.co/openai/privacy-filter
- Benchmark REDACT (paper): https://arxiv.org/abs/2606.19881
- Tablas de evaluación completas: `eval/fast_v1.1_eval_summary.md` (en el repositorio del modelo)
