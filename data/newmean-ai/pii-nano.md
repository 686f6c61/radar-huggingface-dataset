# newmean-ai/pii-nano

## Resumen

newmean-pii-nano es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en texto multilingüe. Lo desarrolla newmean-ai como el nivel más pequeño de una familia de cuatro modelos (nano, small, medium, large) que sirven de motor a su SDK de código abierto `newmean-pii`, disponible para navegador, Node.js, Python, iOS, Android, Flutter y Rust. Su función es identificar datos personales en el texto para poder enmascararlos antes de que se envíen a servicios de terceros como OpenAI o Anthropic, ya sea en el navegador o en el propio dispositivo.

El modelo parte de `nreimers/mMiniLMv2-L6-H384-distilled-from-XLMR-Large`, con el vocabulario de XLM-R podado a las 35.298 piezas que aparecen en los datos de entrenamiento, y se destila desde dos modelos docentes privados más grandes (mDeBERTa-v3-base y XLM-R-large) afinados para esta tarea. Con solo 3,1 millones de parámetros y una descarga de 2,6 MB en su cuantización por defecto, está pensado para ejecutarse en WebAssembly y en dispositivos con recursos limitados, lo que lo hace relevante para flujos de privacidad en el borde (edge) donde no se puede asumir una GPU ni una conexión a un servidor.

Detecta 11 etiquetas a nivel de carácter (PERSON, EMAIL, PHONE, ADDRESS, ID_NUMBER, FINANCIAL, ORG, USERNAME, URL, DATE_OF_BIRTH, SECRET) en 54 idiomas, con un esquema BIO y ventanas de 256 tokens con paso de 64. Se distribuye bajo licencia Apache-2.0 y en formato ONNX con pesos de 4 bits.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo MiniLM (una capa compartida aplicada 4 veces), embeddings de rango 32; base mMiniLMv2-L6-H384 con vocabulario XLM-R podado a 35.298 piezas |
| Parámetros totales | 3,1 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 256 tokens con paso (stride) de 64 |
| Tipos de cuantización | 4 bits: `model_q4.onnx` (pesos 4 bits, opción por defecto del SDK) y `model_q4e.onnx` (pesos y embeddings 4 bits) |
| Idiomas soportados | 54 idiomas (ar, az, bg, bn, ca, cs, da, de, el, en, es, et, fa, fi, fr, ga, he, hi, hr, hu, id, is, it, ja, ka, kk, km, ko, lt, lv, mr, ms, mt, nl, no, pl, pt, ro, ru, sk, sl, sq, sr, sv, sw, te, th, tl, tr, uk, ur, uz, vi, zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_q4.onnx`, `onnx/model_q4e.onnx`); tokenizador Unigram en `tokenizer.web.json`, `tokenizer.json` y `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo es un transformer encoder compacto derivado de mMiniLMv2-L6-H384. La arquitectura final aplica una única capa compartida cuatro veces, con embeddings de rango 32, lo que reduce el cómputo y el tamaño del modelo hasta los 3,1 M de parámetros. El vocabulario de XLM-R se poda a las 35.298 piezas presentes en los datos de entrenamiento, lo que disminuye la matriz de embeddings y acelera la tokenización en el navegador. La entrada son `input_ids` y `attention_mask` en ventanas de 256 tokens con paso de 64, y la salida son logits BIO para las etiquetas definidas en `config.json`.

El entrenamiento se basa en aproximadamente 1,31 millones de textos sintéticos en 54 idiomas, generados con modelos Claude a partir de una guía de etiquetado escrita; la versión v1.1 añadió 240.498 textos cortos (títulos de columnas, opciones de respuesta, palabras sueltas, nombres y valores aislados, filas de encuestas). No se usó ningún dato personal real ni conjunto de datos externo para el entrenamiento. El modelo se destila desde dos docentes privados más grandes (mDeBERTa-v3-base y XLM-R-large) afinados específicamente para la tarea. Las personas y las URL llevan un nivel asociado (1 = directamente identificativo, 2 = indirecto), y las direcciones IP se aprenden como ID_NUMBER.

## Capacidades

- Detección de PII a nivel de carácter con 11 etiquetas: PERSON, EMAIL, PHONE, ADDRESS, ID_NUMBER, FINANCIAL, ORG, USERNAME, URL, DATE_OF_BIRTH y SECRET.
- Clasificación multilingüe en 54 idiomas, incluyendo español, inglés, coreano, chino, árabe, hindi, ruso y la mayoría de lenguas europeas.
- Etiquetado BIO con niveles de identificación para personas y URL (nivel 1 directo, nivel 2 indirecto).
- Reconocimiento de direcciones IP como ID_NUMBER.
- Funcionamiento en WebAssembly (onnxruntime-web o el motor propio del SDK) y en el dispositivo, sin necesidad de servidor.
- Integración con una capa opcional de patrones en el SDK (correo, URL, tarjeta/cuenta, teléfono, número de residente coreano), desactivada por defecto.
- Diseñado para entradas reales: formularios, chats, celdas de hojas de cálculo, logs, JSON, texto OCR, correos y transcripciones de voz.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso; su función es exclusivamente la detección y el enmascarado de PII.

## Casos de uso

- Enmascarado de PII antes de enviar prompts a LLM de terceros: el modelo detecta nombres, correos, teléfonos y direcciones en el texto del usuario y los sustituye por marcadores antes de la llamada a la API; con una bóveda (vault) del SDK, los valores reales se restauran en la respuesta del modelo.
- Cumplimiento de RGPD en aplicaciones web: ejecutado en el navegador mediante WebAssembly, permite redactar datos personales de formularios y chats sin que el texto original salga del dispositivo del usuario, lo que reduce la superficie de tratamiento de datos.
- Procesamiento de logs y telemetría: dado su tamaño (2,6 MB) y su velocidad (16 ms por texto con 12 hilos en CPU), puede insertarse en pipelines de registro para eliminar correos, IP y credenciales antes de almacenar o reenviar los logs.
- Anonimización de exportaciones de encuestas y hojas de cálculo: el modo tabla del SDK con `context: "header"` está pensado para exportaciones de encuestas y formularios en 54 idiomas, con una tasa de omisión del 1,58 % de caracteres de PII en 556 exportaciones de prueba.
- Redacción de transcripciones de voz y texto OCR: el modelo está entrenado para entradas reales como transcripciones y texto OCR, por lo que puede integrarse en flujos de dictado o digitalización documental para eliminar datos personales antes del archivado.
- Aplicaciones móviles y de escritorio con privacidad por diseño: los paquetes para iOS, Android, Flutter y Rust permiten incorporar la detección de PII en el propio dispositivo, sin depender de conectividad ni de servicios en la nube.
- Preprocesado en herramientas de atención al cliente: antes de registrar o analizar conversaciones multi-turno, el modelo enmascara teléfonos, correos y nombres para cumplir con políticas internas de retención de datos.

## Benchmarks y rendimiento

Resultados del modelo solo (sin capa de patrones), archivo por defecto, onnxruntime en CPU. "Miss" = porcentaje de caracteres de PII sin enmascarar (menor es mejor); "over" = porcentaje de caracteres no PII enmascarados.

| Conjunto | Miss % / Over % |
|---|---|
| newmean-pii-dataset (test público, 54 idiomas, 17.058 filas) | 2,9 / 1,5 (F1 exacto 0,65) |
| KDPII (coreano) | 9,5 / 4,1 |
| OpenPII 1.5M (30 idiomas) | 5,0 / 6,2 |
| Nemotron-PII (inglés) | 9,9 / 2,3 |
| Gretel finance (7 idiomas) | 21,4 / 7,6 |

El test público de newmean-pii-dataset se generó con el mismo diseño y guía que los datos de entrenamiento, por lo que el modelo tiene ventaja de distribución en ese conjunto; los conjuntos externos no se usaron para entrenar. En el test público, el detector público más cercano de los ocho comparados (gliner-pii-edge, 176 MB) omite el 19,6 %.

En textos cortos y archivos de encuestas (v1.1), sobre un conjunto privado de 20.691 elementos cortos en 54 idiomas y 228 CSV de encuestas: enmascara el 11,1 % de los elementos sin PII (v1.0: 39,3 %) y el 9,9 % de las celdas sin PII al comprobar celda a celda (v1.0: 32,5 %); encuentra el 96,7 % de los nombres escritos aislados.

Con el SDK 1.2, las cifras anteriores varían como máximo 0,04 puntos, ya que el SDK solo modifica textos con emoji o keycaps. Los emojis se eliminan del texto que lee el modelo: los textos con emoji enmascarados caen del 26,33 % (solo modelo) al 1,00 %. El modo tabla con `context: "header"` omite el 1,58 % de los caracteres de PII en 556 exportaciones de encuestas y formularios en 54 idiomas (solo modo tabla: 6,13 %) y enmascara el 27,34 % de sus celdas sin PII. Ambos conjuntos son privados y sintéticos.

Velocidad en la CPU de una VM Colab L4 (Xeon 2,20 GHz, onnxruntime): 59 ms por texto con un hilo y 16 ms con 12 hilos, sobre los textos del test público.

## Requisitos de hardware

- VRAM estimada: no aplica en la práctica; el modelo pesa 2,6 MB en `model_q4.onnx` y 2,1 MB en `model_q4e.onnx`, por lo que cabe en memoria de cualquier dispositivo.
- GPU recomendadas: no requiere GPU; está diseñado para CPU y WebAssembly. Puede ejecutarse en cualquier CPU moderna.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en dispositivos móviles y navegadores.
- Opciones de despliegue: onnxruntime (CPU o WebAssembly), onnxruntime-web, el motor propio del SDK `@newmean-ai/pii`, y los paquetes del SDK para Node.js, Python, iOS, Android, Flutter y Rust. También puede usarse directamente con onnxruntime pasando `input_ids` y `attention_mask`.
- Latencia y throughput: 59 ms por texto con un hilo y 16 ms con 12 hilos en una CPU Xeon a 2,20 GHz con onnxruntime, según los textos del test público.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| newmean-pii-nano | 3,1 M | ventanas de 256 tokens (stride 64) | Apache-2.0 | ONNX 4 bits | 54 idiomas, 11 etiquetas, 2,6 MB |
| gliner-pii-edge | no disponible | no disponible | no disponible | no disponible | 176 MB; omite el 19,6 % en el test público de newmean-pii-dataset |
| newmean-pii-small | no disponible | no disponible | Apache-2.0 | ONNX | Mismo SDK, nivel superior de la familia |
| newmean-pii-medium | no disponible | no disponible | Apache-2.0 | ONNX | Mismo SDK, nivel superior de la familia |
| newmean-pii-large | no disponible | no disponible | Apache-2.0 | ONNX | Mismo SDK, nivel superior de la familia |

Los datos de parámetros, contexto y licencia de gliner-pii-edge y de los otros niveles de la familia newmean-pii no están disponibles en la información proporcionada. El leaderboard del proyecto compara semanalmente ocho detectores públicos sobre su test público y privado.

## Limitaciones y advertencias

- Ningún detector lo encuentra todo: el propio autor advierte que el resultado debe usarse para reducir lo que se envía, no como garantía absoluta de anonimización.
- Riesgo de falsos negativos variable según el dominio: la tasa de omisión sube al 9,5 % en KDPII (coreano), al 9,9 % en Nemotron-PII (inglés) y al 21,4 % en Gretel finance (7 idiomas), muy por encima del 2,9 % del test público.
- Ventaja de distribución en el test público: ese conjunto se generó con el mismo diseño y guía que los datos de entrenamiento, por lo que sus cifras no son directamente comparables con las de conjuntos externos.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; el entrenamiento usa datos sintéticos generados por modelos Claude, lo que puede introducir sesgos de esos generadores.
- Limitaciones de contexto: procesa ventanas de 256 tokens con paso de 64, por lo que la detección en textos muy largos depende del troceado y puede perder entidades que crucen ventanas.
- Rendimiento desigual por idioma: los resultados por idioma no se detallan en la información disponible; el rendimiento en lenguas de bajos recursos dentro de los 54 idiomas puede ser inferior.
- Uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones adicionales conocidas.
- Caveat para producción: el modelo solo detecta; el enmascarado, la restauración mediante bóveda y la capa de patrones opcional dependen del SDK `@newmean-ai/pii`, cuyas versiones 1.2 a 1.7.2 fijan la revisión `v1.1.0` de este repositorio (la 1.0 fija `v1.0.0`).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/newmean-ai/pii-nano)
- [Repositorio del SDK en GitHub](https://github.com/newmean-ai/pii)
- [Paquete npm @newmean-ai/pii](https://www.npmjs.com/package/@newmean-ai/pii)
- [Demo en el navegador](https://pii.newmean.ai)
- [Dataset newmean-pii-dataset](https://huggingface.co/datasets/newmean-ai/pii-dataset)
- [Leaderboard de detectores de PII](https://huggingface.co/spaces/newmean-ai/pii-leaderboard)
- [Informe técnico](https://github.com/newmean-ai/pii/blob/main/docs/report/REPORT.md)
- [newmean-pii-large](https://huggingface.co/newmean-ai/pii-large)
- [newmean-pii-medium](https://huggingface.co/newmean-ai/pii-medium)
- [newmean-pii-small](https://huggingface.co/newmean-ai/pii-small)
- [Modelo base nreimers/mMiniLMv2-L6-H384-distilled-from-XLMR-Large](https://huggingface.co/nreimers/mMiniLMv2-L6-H384-distilled-from-XLMR-Large)
