# Shadow0482/Kokoro-7M-ONNX

## Resumen

Kokoro-7M-ONNX es un paquete de síntesis de voz (text-to-speech) ultraligero distribuido por el usuario Shadow0482 en Hugging Face. Se trata de una exportación a formato ONNX del modelo oddadmix/Kokoro-7M-Distill, con 7,48 millones de parámetros, publicada bajo licencia Apache 2.0. El repositorio incluye dos variantes del modelo (FP32 e INT8) y una voz condicionada denominada af_msa.

El modelo resuelve la generación de voz en inglés a 24 kHz sin necesidad de GPU: toda la inferencia se ejecuta con ONNX Runtime sobre CPU, con optimizaciones de grafo de nivel 1 a 3. Según la model card, alcanza entre 17,6 y 18,4 veces el tiempo real en un CPU Intel Core con 4 hilos, sintetizando 6,1 segundos de audio en unos 330-349 ms.

Su relevancia actual se sitúa en el nicho de TTS con requisitos de cómputo y memoria muy bajos (menos de 30 MB de pesos), apto para entornos embebidos o servidores sin acelerador. La contrapartida es que está limitado al inglés, depende de una única voz y no cuenta por ahora con validación comunitaria (0 descargas y 0 me gusta en el momento de redactar esta ficha).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de síntesis de voz (TTS) exportado a ONNX; la model card no detalla la topología interna (no disponible) |
| Parámetros totales | 7,48 millones |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo TTS; la entrada es una secuencia de fonemas sobre un vocabulario de 114 símbolos) |
| Tipos de cuantización | FP32 (modelo completo) e INT8 (cuantización dinámica) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Frecuencia de muestreo | 24 kHz (salida PCM de 16 bits) |
| Voz incluida | af_msa (voz condicionada en ONNX independiente) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es una exportación a ONNX de la red de síntesis de voz Kokoro-7M-Distill. La model card no detalla la topología interna (número de capas, tipo de decoder, mecanismo de atención, etc.), por lo que ese dato queda como no disponible. La inferencia se realiza íntegramente con ONNX Runtime, sin pesos en PyTorch, usando el proveedor CPUExecutionProvider y el nivel de optimización de grafo ORT_ENABLE_ALL.

El flujo de síntesis emplea fonemas como entrada: el texto se convierte a fonemas mediante un G2P (el paquete kokoro, KPipeline con lang_code="a") y los fonemas se mapean a un vocabulario de 114 símbolos. Cada fragmento se sintetiza condicionado por un vector de estilo obtenido de la voz af_msa (modelo ONNX independiente de 0,52 MB), y la velocidad se controla con un parámetro speed. El modelo fue destilado y condicionado específicamente sobre la voz af_msa; la model card indica que emplear otra voz como af_heart degrada la naturalidad (UTMOS baja de 4,14 a 3,57). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se usó RLHF o DPO.

## Capacidades

- Síntesis de voz text-to-speech en inglés con salida a 24 kHz en PCM de 16 bits.
- Conversión de texto a fonemas mediante G2P (requiere el paquete kokoro para el preprocesado).
- Condicionamiento de voz a través de embeddings de estilo (voz af_msa).
- Control de la velocidad del habla mediante el parámetro speed.
- Ejecución completa en CPU con ONNX Runtime, sin GPU ni PyTorch en la fase de inferencia.
- Variante INT8 para reducir la huella de memoria y maximizar la velocidad en CPU.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: únicamente inglés.
- No incluye visión, reconocimiento de voz (ASR) ni otras modalidades.

## Casos de uso

- Síntesis de voz en servidores sin GPU: al ejecutarse al 100 % sobre ONNX Runtime en CPU, permite desplegar TTS en máquinas virtuales o contenedores sin acelerador, con un coste de memoria inferior a 30 MB.
- Lectura de documentos y accesibilidad: integración en lectores de pantalla o herramientas de accesibilidad para convertir texto en audio en inglés a 24 kHz, con latencia de unos 330-349 ms por cada 6,1 s de habla.
- Asistentes de voz embebidos e IoT: su tamaño (25-29 MB) y su velocidad (17,6-18,4x tiempo real) lo hacen apto para dispositivos con CPU limitada que necesiten respuestas habladas cortas.
- Generación por lotes de avisos y notificaciones: pre-generación de mensajes de voz estandarizados (alertas, recordatorios, confirmaciones) donde prima el rendimiento por CPU y no la variedad de voces.
- Prototipado y pruebas de pipelines de audio: al exponerse como dos ficheros ONNX más una voz, sirve para validar cadenas de G2P, fonemización y postprocesado antes de pasar a modelos mayores.
- Sistemas IVR y contestadores automáticos: síntesis de prompts y respuestas cortas en inglés dentro de flujos telefónicos, donde la latencia baja en CPU es crítica y la voz única af_msa es suficiente.
- Narración de contenidos en inglés: audiolibros o artículos con una sola voz, asumiendo la limitación de no poder alternar timbres sin degradar la naturalidad.

## Benchmarks y rendimiento

Benchmarks de velocidad en CPU (Intel Core, presupuesto de 4 hilos) publicados en la model card:

| Modelo | Tamaño | Latencia (6,1 s de habla) | RTF | Velocidad |
|---|---|---|---|---|
| kokoro_7m.onnx (FP32) | 28,82 MB | 349 ms | 0,0568 | 17,6x tiempo real |
| kokoro_7m_int8.onnx (INT8) | 25,23 MB | 331 ms | 0,0543 | 18,4x tiempo real |

Métrica de calidad subjetiva recogida en la model card:

| Voz empleada | UTMOS |
|---|---|
| af_msa (voz condicionada) | 4,14 |
| af_heart | 3,57 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, al tratarse de un modelo de síntesis de voz.

## Requisitos de hardware

- No requiere GPU: la inferencia es 100 % CPU con ONNX Runtime (CPUExecutionProvider).
- Memoria de pesos: aproximadamente 28,82 MB en FP32 y 25,23 MB en INT8, más 0,52 MB para el modelo de voz af_msa.
- Entorno de referencia de los benchmarks: CPU Intel Core con un presupuesto de 4 hilos.
- Latencia medida: 349 ms (FP32) y 331 ms (INT8) para 6,1 segundos de audio.
- Throughput: 17,6x tiempo real en FP32 y 18,4x tiempo real en INT8.
- Cabe en cualquier GPU de consumo, aunque no la necesita; también cabe en dispositivos con CPU y memoria muy limitadas.
- Opciones de despliegue: ONNX Runtime; para el preprocesado de texto se emplea el paquete kokoro (KPipeline) para el G2P.
- No se dispone de datos de VRAM porque el modelo no está pensado para ejecución en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Shadow0482/Kokoro-7M-ONNX | 7,48 M | inglés | Apache 2.0 | ONNX (FP32/INT8) | 0 descargas, repositorio de 0,1 GB |
| oddadmix/Kokoro-7M-Distill (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros modelos de la familia Kokoro (referencia) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de especificaciones o rendimiento de alternativas comparables, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Solo soporta inglés (en); no hay capacidades multilingües.
- Depende de una única voz condicionada (af_msa); usar otras voces como af_heart reduce la naturalidad y claridad (UTMOS pasa de 4,14 a 3,57).
- Es una exportación ONNX de un modelo destilado de 7,48 M de parámetros, por lo que su calidad de síntesis será previsiblemente inferior a la de modelos TTS de mayor tamaño.
- No se han publicado benchmarks de calidad del habla exhaustivos más allá del valor de UTMOS para la voz condicionada y las pruebas de velocidad en CPU.
- El repositorio registra 0 descargas y 0 me gusta, por lo que carece de validación o retroalimentación de la comunidad.
- No hay información sobre sesgos de voz, acentos o cobertura fonética fuera del vocabulario de 114 símbolos; los fonemas no contemplados se descartan en el ejemplo de uso.
- La licencia del repositorio es Apache 2.0, pero no se especifica la licencia del modelo base oddadmix/Kokoro-7M-Distill, dato que conviene verificar antes de un uso comercial.
- Los pesos están en ONNX y orientados a CPU; no se documentan rutas de ejecución en GPU ni integración con frameworks de servicio como vLLM o TGI.
- La fecha de creación y actualización del repositorio indicada es 2026-09-14, dato a tener en cuenta al valorar la vigencia del paquete.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/Shadow0482/Kokoro-7M-ONNX
- Modelo base: https://huggingface.co/oddadmix/Kokoro-7M-Distill
- Paquete kokoro (dependencia para G2P, instalable con `pip install kokoro`): no se proporciona URL en la información disponible.
- No se han encontrado otros enlaces (papers, blogs, repos o demos) en la información proporcionada.
