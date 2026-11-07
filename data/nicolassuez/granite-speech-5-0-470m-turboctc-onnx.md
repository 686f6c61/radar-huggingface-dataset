# Nicolassuez/granite-speech-5.0-470m-turboctc-onnx

## Resumen

`Nicolassuez/granite-speech-5.0-470m-turboctc-onnx` es una exportación a ONNX del modelo de reconocimiento automático del habla (ASR) `ibm-granite/granite-speech-5.0-470m-turboctc` de IBM, publicada por el usuario Nicolassuez. El modelo original es un sistema ASR multilingüe de aproximadamente 470 millones de parámetros que emplea una arquitectura CTC (Connectionist Temporal Classification) sobre un encoder tipo transformer. Esta versión concreta está cuantizada a int8 dinámico y empaquetada en un único fichero ONNX de unos 550 MB, pensada para inferencia en CPU con ONNX Runtime.

El interés de esta ficha radica en que ofrece una alternativa práctica para dictado local: recibe una forma de onda de 16 kHz y devuelve un token por cada trama de 80 ms, sin dependencias de PyTorch ni de la librería `transformers`. El modelo cubre siete idiomas (inglés, francés, alemán, español, portugués, italiano y japonés) y se distribuye bajo licencia Apache 2.0, lo que facilita su integración en productos comerciales.

Frente a la versión fp32, la cuantización int8 reduce el tamaño y multiplica por más de dos la velocidad en CPU (RTFx de 36,5 frente a 15,3 en las pruebas del autor), con una degradación modesta de la tasa de error de palabras (WER de 7,20 % frente a 6,98 % en FLEURS francés). Es, por tanto, una opción relevante para aplicaciones de dictado en tiempo real en hardware sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer con cabeza CTC (modelo base granite-speech-5.0-470m-turboctc) |
| Parametros totales | Aproximadamente 470 M (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio de duración variable; salida de un token por trama de 80 ms) |
| Tipos de cuantizacion | int8 dinámico (QInt8, per-channel, solo MatMul); también disponible exportación fp32 según el autor |
| Idiomas soportados | Inglés, francés, alemán, español, portugués, italiano, japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.int8.onnx`, ~550 MB); tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo base es un sistema ASR con encoder transformer y decodificación CTC, entrenado por IBM dentro de la familia Granite Speech. La exportación a ONNX reescribe la extracción de características (80 log-mel más deltas, con apilado de tramas de dos en dos) como operaciones tensoriales, implementando la DFT como una convolución; la diferencia máxima respecto al extractor de `transformers` 5.22 es de 2e-5. La auto-atención por bloques y los bloques de subsampling se reescriben sin ramas dependientes de la forma para permitir un eje temporal dinámico, y el autor verifica que la exportación fp32 produce el mismo argmax que PyTorch en cada trama probada.

La cuantización es dinámica int8 (ONNX Runtime 1.23.2, `quantize_dynamic`, QInt8, per-channel y limitada a MatMul), manteniendo el banco de filtros mel en fp32. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original.

## Capacidades

- Reconocimiento automático del habla multilingüe en siete idiomas (en, fr, de, es, pt, it, ja).
- Entrada de audio mono a 16 kHz en formato float32 `[1, N]` con muestras en `[-1, 1]`.
- Salida de IDs de token a razón de uno por trama de 80 ms, decodificables con CTC voraz (colapsar repeticiones, descartar el id 0 de blank y decodificar con `tokenizer.json`).
- Detección de silencio mediante el token especial `<|nospeech|>`, que produce texto vacío.
- Inferencia en CPU sin dependencias de PyTorch ni de `transformers`, usando únicamente ONNX Runtime y la librería `tokenizers`.
- Eje temporal dinámico, lo que permite procesar audios de duración variable en una sola sesión.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del reconocimiento.

## Casos de uso

- Dictado local en aplicaciones de escritorio: el modelo está pensado explícitamente para dictado local en aSup; su tamaño de ~550 MB y su RTFx de 36,5 en CPU permiten transcripción casi en tiempo real sin GPU.
- Transcripción de reuniones y notas de voz: la ventana temporal dinámica admite audios de duración variable y la salida por tramas de 80 ms facilita la alineación temporal de subtítulos.
- Subtitulado y generación de transcripciones multilingües: cubre siete idiomas, útil para pipelines que procesan contenido en inglés, francés, alemán, español, portugués, italiano o japonés.
- Asistentes de voz en dispositivos de borde: al ejecutarse con ONNX Runtime en CPU, encaja en servidores modestos o equipos sin acelerador dedicado.
- Preprocesado de datos para entrenamiento de modelos de lenguaje: transcripción masiva de corpus de audio a texto con un coste de infraestructura bajo.
- Sistemas de accesibilidad: conversión de voz a texto en tiempo real para personas con dificultades de escritura, con despliegue local que evita enviar audio a la nube.
- Búsqueda y análisis de archivos de audio: indexación de grabaciones por contenido hablado en entornos con requisitos de privacidad.

## Benchmarks y rendimiento

Datos publicados por el autor sobre el conjunto de test francés de FLEURS (676 clips, 117 minutos), en un Intel i7-13700H con 8 hilos intra-op, ONNX Runtime 1.23.2 y un clip a la vez. El autor advierte que la carga de la máquina durante la prueba infla los tiempos absolutos, aunque las ratios se mantienen.

| Modelo | WER | WER con números normalizados | Velocidad (RTFx) | Latencia, clip de 10 s |
|---|---|---|---|---|
| Este modelo (int8) | 7,20 % | 6,35 % | 36,5 | 215 ms |
| Este modelo, fp32 | 6,98 % | 6,13 % | 15,3 | 500 ms |
| parakeet-tdt-0.6b-v3, int8 ONNX | 7,02 % | 6,43 % | 16,9 | 498 ms |

El WER se calcula sobre texto en minúsculas, sin puntuación, apóstrofos ni guiones que separen palabras; la variante normalizada convierte además números escritos con letras a dígitos en ambos lados. No se han publicado resultados de benchmarks en otros idiomas ni en tareas distintas al ASR en la información disponible.

## Requisitos de hardware

- VRAM: no aplica en la configuración por defecto, ya que está diseñado para CPU; el fichero int8 ocupa unos 550 MB en disco y en memoria.
- GPU recomendadas: no se documentan; el autor orienta el modelo a inferencia en CPU con ONNX Runtime.
- CPU: funciona en procesadores de consumo; las pruebas se realizaron en un Intel i7-13700H con 8 hilos.
- Cabe en hardware de consumo: sí, al no requerir GPU y ocupar menos de 1 GB.
- Opciones de despliegue: ONNX Runtime (versión 1.23.2 en las pruebas) junto con la librería `tokenizers`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTFx de 36,5 y 215 ms por clip de 10 s en int8; RTFx de 15,3 y 500 ms en fp32, según las mediciones del autor en el hardware indicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | WER (FLEURS fr) | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este modelo (int8) | ~470 M | 7 | No disponible | 7,20 % | Apache 2.0 | ONNX int8 |
| granite-speech-5.0-470m-turboctc (original) | ~470 M | 7 | No disponible | No disponible en la información | Apache 2.0 | Pesos originales (no especificado) |
| parakeet-tdt-0.6b-v3 (int8 ONNX) | ~600 M | No disponible | No disponible | 7,02 % | No disponible | ONNX int8 |

La comparación se limita a los datos aportados por el autor; no se dispone de cifras de contexto ni de otros benchmarks para el modelo original ni para parakeet-tdt-0.6b-v3.

## Limitaciones y advertencias

- El WER en francés (7,20 % int8) es ligeramente superior al del modelo fp32 (6,98 %), por lo que la cuantización introduce una pequeña pérdida de precisión.
- El modelo a veces transcribe números con letras ("quatre-cent-trois") en lugar de dígitos, lo que exige normalización posterior en muchos pipelines.
- La salida es CTC voraz sin modelo de lenguaje externo; no se documenta corrección contextual ni puntuación automática.
- No hay datos publicados de rendimiento en los idiomas distintos del francés, ni de sesgos o alucinaciones específicas.
- El modelo base es una revisión concreta (`91dcb06`); cambios en el checkpoint original no se reflejan automáticamente en esta exportación.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los ficheros `LICENSE` y `NOTICE` incluidos por el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no procede de la organización oficial de IBM, por lo que la validación comunitaria es aún inexistente.
- El contrato de entrada exige añadir una muestra cero cuando la longitud es un múltiplo impar de 160; omitirlo puede degradar la última trama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nicolassuez/granite-speech-5.0-470m-turboctc-onnx
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Variante nc del modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc-nc
