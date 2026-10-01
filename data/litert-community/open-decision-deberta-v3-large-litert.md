# litert-community/Open-Decision-DeBERTa-v3-Large-LiteRT

## Resumen

Open Decision DeBERTa-v3-Large-LiteRT es la conversión a LiteRT de `com-kotobalabs/open-jev-deberta-v3-large`, un modelo de decisión construido sobre un encoder DeBERTa-v3-large. No es un modelo generativo: lee un estado textual (por ejemplo, un ticket de soporte) y varias preguntas tipadas, y devuelve en una sola pasada una distribución de probabilidad calibrada por pregunta. Admite tres tipos de pregunta: `choice` (elegir entre opciones), `score` (nivel ordinal con valor esperado) y `noul` (probabilidad binaria de sí/no).

La relevancia de esta ficha está en el formato: el repositorio publica grafos `.tflite` con pesos en float16 y una tabla de embeddings separada, pensados para inferencia en CPU de escritorio y en GPU Metal de Apple mediante la API CompiledModel de LiteRT, sin necesidad de PyTorch ni de transformers. Los ficheros suman alrededor de 1,08 GB para la variante de 512 tokens de ventana, lo que permite ejecutarlo en equipos sin GPU dedicada.

El modelo pertenece a la organización litert-community, se distribuye con licencia Apache 2.0, está etiquetado para inglés (`en`) y, en el momento de redactar esta ficha, acumula 0 descargas y 0 «likes», por lo que carece todavía de validación por parte de la comunidad. La conversión se realizó con litert-torch 0.9.3 y la ruta verificada es la API Python de LiteRT sobre CPU de escritorio y sobre GPU Metal con FP32 explícito.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer DeBERTa-v3-large (24 capas, atención con posición relativa; etiquetado como `deberta-v2` en los tags del repositorio), cabeza de span means y scoring |
| Parámetros totales | No disponible. La tabla de embeddings es de 128100 x 1024 (131.174.400 parámetros solo en embeddings); el resto del recuento no se publica en la información proporcionada |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (grafo `deberta_v3_large_decision_s512_wfp16.tflite`); existe una variante de 256 tokens (`..._s256_wfp16.tflite`) |
| Tipos de cuantización | Pesos en float16 con activaciones float32 en los grafos wfp16; los grafos float32 de referencia (S256 y S512) y la tabla float32 no se incluyen en el repositorio. El port ONNX asociado ofrece fp32, fp16, q4 y q4f16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 (licencia del modelo base no disponible) |
| Formato de pesos | `.tflite` (LiteRT) más `word_embeddings_fp16.bin` (tabla `[128100, 1024]`, float16 little-endian) y `tokenizer.json`; alternativa en ONNX |
| Tamaño del repositorio | 1,8 GB |
| Librería | litert |
| Pipeline | text-classification |
| Fecha de creación | 2026-10-01 |

## Arquitectura y entrenamiento

El grafo contiene el encoder completo de 24 capas, el cálculo de span means y la cabeza de scoring; devuelve un logit por ranura de opción. Los 146 pesos de capas `FULLY_CONNECTED` van en float16 y cada uno alimenta un operador `DEQUANTIZE`, mientras que las activaciones permanecen en float32; las 48 constantes de posición relativa de los batch matmuls también se mantienen en float32. El anfitrión (host) realiza el resto del trabajo: tokeniza, busca la fila correspondiente a cada token en la tabla de embeddings, construye las dos entradas de enrutado, aplica softmax con temperatura 1,05 y lee las respuestas. Es decir, el softmax y la calibración no están dentro del grafo.

Sobre el entrenamiento no hay datos publicados: la información proporcionada no detalla el número de tokens, la composición del dataset, ni si hubo RLHF, DPO u otro ajuste por preferencias. El modelo base `com-kotobalabs/open-jev-deberta-v3-large` es un ajuste de DeBERTa-v3-large especializado en decisiones tipadas, y esta ficha documenta únicamente la conversión de formato, la verificación de equivalencia funcional y los ficheros resultantes. La innovación técnica reseñable no está en el entrenamiento, sino en el empaquetado: un encoder de tamaño large convertido a LiteRT con pesos float16 y una tabla de embeddings externa, de modo que el grafo tflite queda en 813 MB en lugar de los 1,42 GB de la variante float32.

## Capacidades

- Clasificación de texto multi-pregunta en una sola pasada: una misma lectura del estado responde a varias preguntas, incluidas preguntas de tipos distintos.
- Preguntas `choice`: elección entre una lista de opciones con distribución de probabilidad y confianza por opción (por ejemplo, `shipping` con 0,785 en el ejemplo de la model card).
- Preguntas `score`: nivel ordinal con valor esperado de base cero (en el ejemplo, 1,861, que cae entre «mildly annoyed» y «frustrated», con confianza 0,642 correspondiente a «frustrated»).
- Preguntas `noul`: probabilidad binaria de sí/no sobre una afirmación (en el ejemplo, p(yes) = 0,124 para «el cliente pide un reembolso»).
- Probabilidades calibradas: el anfitrión aplica softmax con temperatura 1,05, y la model card reporta desviaciones máximas de 0,0016 frente a la implementación de referencia en FP32.
- Ejecución en CPU de escritorio y en GPU Metal de Apple con FP32 explícito (`GpuOptions(enforce_f32=True)`).
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni uso como agente.
- No tiene capacidades de visión, audio ni modalidades adicionales.
- Multilingüismo: no disponible; el repositorio declara únicamente inglés.

## Casos de uso

- Enrutado y triaje de tickets de soporte: el modelo recibe el texto del ticket como estado y una pregunta `choice` con la lista de equipos o colas (`billing`, `technical support`, `shipping`, `account access`, `sales`). En el ejemplo publicado devuelve `shipping` con probabilidad 0,785, suficiente para enrutado automático con umbral de confianza.
- Puntuación de frustración o severidad del cliente: mediante una pregunta `score` con niveles ordinales (`calm`, `mildly annoyed`, `frustrated`, `angry`) se obtiene un valor esperado continuo que puede usarse para priorizar la cola de atención o disparar una escalada a un humano.
- Detección de intenciones binarias: preguntas `noul` como «el cliente pide un reembolso» devuelven una probabilidad (0,124 en el ejemplo) que se puede umbralizar para activar flujos de devolución, cancelación o retención.
- Etiquetado de contenido y moderación: varias preguntas `noul` y `choice` en una sola pasada permiten asignar categorías múltiples a un mismo texto sin repetir la inferencia, lo que reduce coste por documento.
- Clasificación de encuestas y feedback: convertir respuestas abiertas de NPS o CSAT en categorías de motivo y en una puntuación de sentimiento ordinal, con la ventaja de que `score` devuelve un valor esperado y no solo la clase mayoritaria.
- Cualificación de leads en un CRM: una pregunta `choice` sobre el segmento o la intención de compra y varias `noul` sobre señales concretas (presupuesto, urgencia, decisor) generan un perfil estructurado a partir de correos o notas de llamada.
- Comprobaciones de cumplimiento sobre texto entrante: preguntas binarias del tipo «el mensaje contiene una amenaza», «se solicita un dato personal» o «se menciona una cláusula contractual» permiten prefiltrado automático antes de la revisión humana.
- Clasificación en el borde (edge) para despliegues Android: el repositorio incluye `android/CardSnippet.kt`, aunque el propio autor advierte de que ese bloque compila pero no se ha ejecutado en un dispositivo, por lo que cualquier uso móvil exige validación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card sí documenta comprobaciones de equivalencia entre el grafo convertido y la implementación de referencia del autor:

| Comprobación | Entorno | Alcance | Resultado |
|---|---|---|---|
| s512 wfp16 frente a CPU FP32 del autor | CPU de escritorio | 4.327 preguntas de 1.809 peticiones | Misma opción elegida en todas; ninguna probabilidad difiere en más de 0,0016 a temperatura 1,05 |
| s256 wfp16 | CPU de escritorio | 1.281 peticiones que caben en 256 tokens | Probado; sin detalle de resultados en la información disponible |
| s512 wfp16 en GPU | GPU Metal (Apple M4 Max) con FP32 explícito | 100 peticiones | Probado; sin detalle cuantitativo adicional |
| s256 wfp16 en GPU | GPU Metal (Apple M4 Max) con FP32 explícito | 100 peticiones | Probado; sin detalle cuantitativo adicional |
| Ejemplo de ticket inventado | CPU de Mac | 80 tokens | `shipping` 0,785; score 1,861 (confianza 0,642); reembolso p(yes) 0,124. Frente a `decide()` en CPU FP32, ninguna probabilidad difiere en más de 6,6e-5 |

No hay datos publicados de latencia, throughput ni consumo energético, ni mediciones en teléfonos.

## Requisitos de hardware

- Tamaño de los ficheros: grafo s512 wfp16 813.443.728 bytes (unos 813 MB), grafo s256 wfp16 712.780.432 bytes (unos 713 MB), tabla de embeddings `word_embeddings_fp16.bin` 262.348.800 bytes (unos 262 MB) y `tokenizer.json` 8.657.170 bytes. El conjunto s512 ocupa alrededor de 1,08 GB en disco.
- Grafos float32 de referencia, no incluidos en el repositorio: s256 1.323.008.720 bytes (unos 1,32 GB), s512 1.423.672.016 bytes (unos 1,42 GB) y tabla float32 524.697.600 bytes (unos 525 MB).
- VRAM estimada para inferencia: no publicada. Como orientación basada en los tamaños de fichero, la configuración s512 wfp16 requiere cargar aproximadamente 1,1 GB de pesos y tabla, más el espacio de activaciones en float32; la configuración float32 duplica aproximadamente esa cifra hasta unos 1,95 GB.
- GPU recomendadas: no se especifican. La única GPU verificada en la información disponible es la GPU Metal de un Apple M4 Max, con FP32 explícito.
- Cabe en GPU de consumo: no confirmado por el autor. Por tamaño de pesos, la variante wfp16 es compatible con GPUs de consumo con 4 GB o más de memoria, pero no hay mediciones publicadas que lo validen.
- Opciones de despliegue: API CompiledModel de LiteRT en Python con `ai-edge-litert` 2.1.6 (probado con numpy y tokenizers; no requiere torch ni transformers), Android mediante LiteRT (bloque Kotlin incluido, no ejecutado en dispositivo) y el port ONNX para Transformers.js.
- Latencia y throughput: no disponibles. La model card no publica tiempos por petición ni peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Formato | Ventana | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| litert-community/Open-Decision-DeBERTa-v3-Large-LiteRT (este) | LiteRT `.tflite` + tabla `.bin` | 512 y 256 tokens | fp16 en pesos con activaciones fp32 | Apache 2.0 | HuggingFace, organización litert-community |
| onnx-community/open-jev-deberta-v3-large-ONNX | ONNX para Transformers.js | No disponible | fp32, fp16, q4 y q4f16 | No disponible | HuggingFace, organización onnx-community |
| com-kotobalabs/open-jev-deberta-v3-large | Checkpoint original (transformers + paquete `typed_decisions` del autor) | No disponible | No disponible | No disponible | HuggingFace, requiere torch y transformers |

Los tres comparten el mismo modelo subyacente y la misma lógica de decisiones tipadas; la diferencia está en el runtime objetivo y en las cuantizaciones ofrecidas. No se dispone de modelos comparables de otra familia con datos de rendimiento publicados en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés: no hay soporte multilingüe declarado, por lo que el rendimiento en castellano u otros idiomas es desconocido.
- No es un modelo generativo: no produce texto ni admite tool calling, function calling ni razonamiento multi-paso; cualquier capacidad de agente debe construirse íntegramente alrededor de él.
- Ventana corta: 512 tokens en el grafo principal y 256 en la variante reducida. Los estados más largos deben truncarse, lo que puede degradar la clasificación.
- Sin benchmarks publicados de MMLU, GSM8K, HumanEval ni equivalentes; solo hay comprobaciones de equivalencia entre el grafo convertido y la implementación del autor.
- Sin mediciones en teléfonos: el autor indica explícitamente que no se ha medido ningún teléfono y que el bloque Kotlin, aunque compila, no se ha ejecutado en un dispositivo.
- La calibración depende de la temperatura 1,05 aplicada en el anfitrión; modificarla altera directamente las probabilidades y la confianza reportada.
- La tabla de embeddings se entrega en float16, lo que introduce una pérdida de precisión respecto a la tabla float32 (la desviación observada en el ejemplo es de hasta 6,6e-5 en el caso de 80 tokens, pero conviene validar en el dominio propio).
- El anfitrión debe replicar tokenización, búsqueda en la tabla de embeddings, construcción de las entradas de enrutado y softmax; una implementación incorrecta de esos pasos invalida las garantías de equivalencia.
- Licencia Apache 2.0 para este repositorio, lo que permite uso comercial, pero la licencia del modelo base `com-kotobalabs/open-jev-deberta-v3-large` no está disponible en la información proporcionada y debería verificarse antes de un despliegue en producción.
- Sesgos conocidos: no documentados. Al no publicarse la composición del dataset de ajuste, no es posible auditar sesgos por idioma, género, origen o dominio.
- Riesgo en decisiones automatizadas: el uso de preguntas `score` o `noul` para priorizar clientes, conceder reembolsos o filtrar contenido puede afectar a personas; se recomienda revisión humana y umbrales conservadores.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de calibración incorrecta fuera del dominio de entrenamiento, con confianzas altas sobre entradas atípicas.
- Adopción nula: 0 descargas y 0 «likes» en el momento de redactar la ficha, sin validación independiente por parte de la comunidad.
- Repositorio de 1,8 GB, lo que puede complicar su inclusión en pipelines con límites de tamaño o en entornos de CI con caché reducida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/Open-Decision-DeBERTa-v3-Large-LiteRT
- Modelo base: https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large
- Port ONNX para Transformers.js: https://huggingface.co/onnx-community/open-jev-deberta-v3-large-ONNX
- Organización LiteRT Community en HuggingFace: https://huggingface.co/litert-community
- Repositorio LiteRT en GitHub: https://github.com/google-ai-edge/litert
- Documentación de LiteRT: https://developers.google.com/edge/litert
- LiteRT-LM en GitHub: https://github.com/google-ai-edge/LiteRT-LM
- LiteRT.js para web: https://developers.google.com/edge/litert/web
