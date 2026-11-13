# ahmedmohamedra2002/tafreegh-language-packs

## Resumen

Tafreegh language packs es un repositorio de distribucion de dos modelos de reconocimiento automatico del habla (ASR) empaquetados en formato ORT para inferencia en dispositivo, concretamente para la aplicacion Android Tafreegh (Audix), que transcribe audio sin conexion en el telefono. No se trata de un modelo entrenado por el autor, sino de una reescritura y conversion de dos modelos abiertos de terceros: Whistle (Cactus Compute) y Dolphin base en su rama CTC (DataoceanAI y Universidad de Tsinghua), ambos bajo licencia Apache 2.0.

El paquete `pack-whistle` cubre siete idiomas europeos (ingles, aleman, frances, espanol, italiano, neerlandes y polaco) y contiene un encoder y un decoder separados mas un fichero anfitrion con tokenizador, banco de filtros mel y tablas de engramas de 2 bits. El paquete `pack-dolphin` cubre diez idiomas adicionales, muchos de ellos de bajos recursos (hindi, bengali, tailandes, persa, japones, birmano, jemer, uzbeko, kazajo y tayiko) mediante un unico modelo CTC.

La relevancia de este repositorio es practica: demuestra un proceso de adaptacion de modelos ASR a un runtime minimo de ONNX Runtime 1.23.2 con cuantizacion int8 selectiva, manteniendo la precision dentro de un punto porcentual respecto a los pesos originales en fp32, y con un tamano total de repositorio de 0,3 GB. Es un caso de estudio de despliegue en dispositivo mas que una contribucion de modelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (Whistle y Dolphin base son modelos ASR de secuencia; la model card no detalla su arquitectura interna) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sean MoE) |
| Longitud de contexto | No disponible (procesan una utterance a la vez) |
| Tipos de cuantizacion | int8 dinamica (com.microsoft DynamicQuantizeMatMul) en matrices grandes; fp32 en matrices pequenas de mezcla y condicionamiento; fichero de engramas de 2 bits en Whistle |
| Idiomas soportados | Whistle: en, de, fr, es, it, nl, pl. Dolphin: hi, bn, th, fa, ja, my, km, uz, kk, tg |
| Licencia | Apache 2.0 |
| Formato de pesos | ORT (ONNX Runtime format, optimizacion basica); ficheros `encoder.ort`, `decoder.ort`, `whistle.host` y `model.ort` |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: redistribuye dos ASR abiertos reescritos para que cada operador sea compatible con la build minima de ONNX Runtime 1.23.2 embebida en la app, y despues los convierte a formato ORT con nivel de optimizacion basico. Whistle parte del port ONNX de `mrfakename` (una reimplementacion en PyTorch exportada desde los pesos desplegados) y conserva su pipeline anfitrion en C++; Dolphin base parte del export ONNX de su rama CTC realizado por k2-fsa/sherpa-onnx.

Las modificaciones tecnicas sobre Whistle incluyen: sustitucion de la normalizacion de Sinkhorn de las mezclas de hiperconexion (20 iteraciones en dominio logaritmico, matrices 4x4) por una version en dominio lineal equivalente (softmax por filas y division por sumas de filas y columnas), eliminando Exp, Log, ReduceMax y ReduceLogSumExp; reemplazo de ReduceSum por ReduceMean multiplicado por el conteo; Tile y Expand por concatenacion de copias; Sigmoid por su forma explicita y x*sigmoid(x) por QuickGelu con alpha 1; plegado de pesos por capa (Gather y Transpose resueltos una sola vez); y sustitucion de cada MatMul con peso constante de lado mayor o igual a 64 por DynamicQuantizeMatMul int8 con una escala por columna de salida. En Dolphin se eliminan las mascaras de padding procesando una utterance a la vez, se sustituye la secuencia DynamicQuantizeLinear + MatMulInteger + escala por DynamicQuantizeMatMul con los mismos pesos int8, se aplica QuickGelu y se elimina LogSoftmax (la decodificacion CTC voraz usa la puntuacion maxima), migrando de opset 13 a 17.

## Capacidades

- Reconocimiento automatico del habla en dispositivo (offline) para 17 idiomas repartidos en dos paquetes.
- Transcripcion de una utterance a la vez, sin procesamiento por lotes.
- Decodificacion CTC voraz en el paquete Dolphin.
- Arquitectura encoder-decoder en el paquete Whistle, con tokenizador, banco de filtros mel y tablas de engramas de 2 bits empaquetados en `whistle.host`.
- Ejecucion sobre una build minima de ONNX Runtime 1.23.2, pensada para Android.
- No se documentan capacidades de traduccion, diarizacion, puntuacion, marcas de tiempo ni deteccion de idioma.

## Casos de uso

- Transcripcion offline en Android: la app Tafreegh descarga el paquete del idioma solicitado y transcribe en el propio telefono sin conexion, lo que encaja con escenarios de privacidad o conectividad limitada.
- Aplicaciones de notas de voz: integracion del paquete Whistle para dictado en espanol, italiano, frances o aleman con un coste de error entre el 6,4 % y el 25,4 % de palabras erroneas en FLEURS.
- Asistentes de campo en idiomas de bajos recursos: el paquete Dolphin permite transcripcion en hindi, bengali, tailandes, persa, japones, birmano, jemer, uzbeko, kazajo y tayiko donde Whisper Small falla gravemente (hasta 127 % de palabras erroneas en bengali).
- Investigacion sobre cuantizacion en dispositivo: el repositorio sirve como referencia reproducible de sustitucion de operadores y cuantizacion int8 selectiva con impacto medido inferior a un punto porcentual frente a fp32.
- Distribucion de modelos por paquetes: el esquema de carpetas descargables por idioma es reutilizable para apps que necesitan reducir el tamano de instalacion inicial.
- Evaluacion comparativa de ASR multilingue: los datos de FLEURS publicados permiten contrastar Whistle y Dolphin frente a Whisper Small en 17 idiomas.

## Benchmarks y rendimiento

Medido sobre 25 frases de test de FLEURS por idioma, con los pipelines propios de la app, frente a Whisper Small (q5_1). Se indica el porcentaje de palabras erroneas, o de caracteres donde se marca.

| Idioma | Paquete | Error del paquete | Error de Whisper Small |
|---|---|---|---|
| Ingles | Whistle | 14,0 % | 14,4 % |
| Espanol | Whistle | 6,4 % | 5,8 % |
| Italiano | Whistle | 15,9 % | 8,5 % |
| Aleman | Whistle | 20,6 % | 9,1 % |
| Frances | Whistle | 25,4 % | 11,7 % |
| Neerlandes | Whistle | 37,2 % | 20,4 % |
| Polaco | Whistle | 39,9 % | 17,6 % |
| Hindi | Dolphin | 31,5 % | 53,3 % |
| Bengali | Dolphin | 36,9 % | 127 % |
| Tailandes (caracteres) | Dolphin | 19,3 % | 26,6 % |
| Persa | Dolphin | 41,9 % | 52,1 % |
| Japones (caracteres) | Dolphin | 15,7 % | 21,3 % |
| Birmano (caracteres) | Dolphin | 27,8 % | 99,8 % |
| Jemer (caracteres) | Dolphin | 31,4 % | 97,5 % |
| Uzbeko | Dolphin | 55,4 % | 97,5 % |
| Kazajo | Dolphin | 53,0 % | 73,2 % |
| Tayiko | Dolphin | 59,1 % | 102 % |

Whistle en fp32 (los pesos originales del port) obtuvo resultados dentro de un punto porcentual de los ficheros de este repositorio en todos los idiomas. No se han publicado resultados de MMLU, HumanEval ni GSM8K, ya que no son aplicables a un modelo ASR.

## Requisitos de hardware

- Inferencia en dispositivo movil Android mediante ONNX Runtime 1.23.2; el repositorio completo ocupa 0,3 GB.
- VRAM estimada para escritorio: no disponible de forma explicita; el tamano de los ficheros ORT sugiere un consumo moderado, pero la model card no lo cuantifica.
- GPU recomendadas: no disponible. El diseno apunta a CPU movil, no a GPU de servidor.
- Cabe en GPU de consumo: probablemente si, dado el tamano del repositorio, pero no se documenta.
- Opciones de despliegue: ONNX Runtime (formato ORT) con la build minima 1.23.2; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Tafreegh language packs (Whistle) | No disponible | No disponible | 7 | Apache 2.0 | ORT int8 |
| Tafreegh language packs (Dolphin) | No disponible | No disponible | 10 | Apache 2.0 | ORT int8 |
| Whisper Small (referencia de la model card) | No disponible en la informacion | No disponible | Multilingue amplio | MIT (no indicado en la informacion) | GGUF q5_1 en la comparacion |
| Cactus-Compute/whistle | No disponible | No disponible | 7 | Apache 2.0 | Pesos originales |
| DataoceanAI/Dolphin base | No disponible | No disponible | 10 en esta variante | Apache 2.0 | Pesos originales |

## Limitaciones y advertencias

- Los datos de precision proceden de solo 25 frases por idioma, una muestra muy pequena que no permite extrapolar con rigor.
- El rendimiento de Whistle es claramente inferior a Whisper Small en aleman, frances, neerlandes y polaco (hasta 22 puntos porcentuales de diferencia en polaco).
- Dolphin solo se ofrece para los diez idiomas listados; en otros idiomas probados obtuvo peor resultado que Whisper Small o supero el 60 % de palabras erroneas.
- Procesa una utterance a la vez, sin soporte de lotes ni de audio largo continuo.
- No se documentan sesgos, pero al derivar de modelos de terceros hereda los suyos, no evaluados aqui.
- Riesgo de alucinacion en ASR: no cuantificado en la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero ni Cactus Compute ni DataoceanAI respaldan este repositorio; la atribucion debe mantenerse.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad.
- Depende de una build concreta de ONNX Runtime 1.23.2; otras versiones o runtimes pueden no ejecutar los ficheros ORT.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ahmedmohamedra2002/tafreegh-language-packs
- Modelo Whistle (Cactus Compute): https://huggingface.co/Cactus-Compute/whistle
- Port ONNX de Whistle: https://huggingface.co/mrfakename/whistle-ONNX
- Dolphin base (DataoceanAI): https://github.com/DataoceanAI/Dolphin
- Export ONNX de Dolphin CTC int8 (sherpa-onnx): https://huggingface.co/csukuangfj/sherpa-onnx-dolphin-base-ctc-multi-lang-int8-2025-04-02
