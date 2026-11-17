# Lucasgitguy-co/Fleet-Clean-0.36B-GGUF

## Resumen

Fleet-Clean-0.36B-GGUF es la distribucion en formato GGUF de Fleet-Clean-0.36B, un modelo de 306.939.648 parametros (0,36B) desarrollado por Lucasgitguy-co que resuelve una tarea concreta: convertir audio de voz en texto limpio eliminando disfluencias (muletillas, repeticiones, tartamudeos) en un unico paso. Combina dos componentes: un modelo de reconocimiento automatico del habla (ASR) llamado Fleet-2, basado en la arquitectura Cactus Whistle, y un "tagger" de limpieza construido sobre un encoder modern-bert (mmBERT-base) con una cabeza de clasificacion de 768 a 10 etiquetas.

El interes tecnico esta en que es una de las primeras implementaciones que permite ejecutar un pipeline completo de speech-to-text con limpieza en C++ puro mediante llama.cpp y un port propio (`whistle-cli`), sin necesidad de PyTorch ni del motor nativo cerrado de Cactus. El autor documenta explicitamente una perdida de precision frente al runtime original, lo que convierte esta ficha en un caso de estudio sobre los compromisos entre portabilidad y exactitud numerica.

El modelo soporta ocho idiomas (ingles, aleman, frances, espanol, italiano, neerlandes, polaco y coreano) y se publica bajo licencia Apache-2.0, lo que facilita su integracion comercial. Su tamano reducido lo hace viable en hardware modesto, aunque la calidad del ASR es claramente inferior a la de modelos de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: ASR Fleet-2 (Cactus Whistle) + tagger modern-bert (mmBERT-base) con cabeza 768→10 |
| Parametros totales | 306.939.648 (0,36B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (audio de hasta 30 s por clip) |
| Tipos de cuantizacion | F32, F16 para ASR; Q8_0 y F16 para el tagger |
| Idiomas soportados | en, de, fr, es, it, nl, pl, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F32, F16, Q8_0); pesos originales en `.cact` (motor cerrado) |

## Arquitectura y entrenamiento

El sistema se compone de dos redes independientes que se encadenan. La primera es Fleet-2, un modelo ASR de la familia Cactus Whistle, exportado desde el formato nativo `.cact` a GGUF mediante dequantizacion; el autor verifico el mapeo de tensores en una comprobacion de re-exportacion. La segunda es un tagger de limpieza basado en el encoder `jhu-clsp/mmBERT-base` (modern-bert) con una cabeza lineal de 768 a 10 etiquetas que clasifica cada palabra como disfluencia o texto valido. El tokenizer utilizado es el original de mmBERT-base, con el mismo vocabulario y merges que el de Laya, ya que la version re-guardada por transformers 5 es rechazada por llama.cpp.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion principal no esta en el entrenamiento sino en el runtime: `whistle-cli` es un port en C++ del modelo JAX abierto de Cactus, lee GGUF directamente (F32/F16/Q8_0), usa float32 en toda la inferencia y decodifica de forma greedy, replicando el decodificador de referencia. El autor documenta que beam search, padding, recorte de silencios y activaciones de 8 bits fueron probados y no explican la brecha de precision frente al motor nativo.

## Capacidades

- Reconocimiento automatico del habla (ASR) sobre WAV PCM de 16, 24 o 32 bits o float, a 16 kHz, con clips de hasta 30 segundos.
- Eliminacion de disfluencias: muletillas, repeticiones y tartamudeos se etiquetan y eliminan para producir texto limpio.
- Procesamiento de texto directo: el script `fleet_clean_gguf.py --text` permite limpiar una cadena de texto sin pasar por audio.
- Soporte multilingue en ocho idiomas: ingles, aleman, frances, espanol, italiano, neerlandes, polaco y coreano.
- Salida en JSON mediante `whistle-cli --json` para integracion en pipelines.
- Extraccion de caracteristicas (feature-extraction) mediante el encoder del tagger en `llama-server --embeddings --pooling none`.
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio mas alla del ASR descrito.

## Casos de uso

- Transcripcion de reuniones y entrevistas: el pipeline convierte el audio en texto ya limpio de muletillas, eliminando un post-procesado separado y reduciendo el coste de curacion manual.
- Generacion de subtitulos para video: los clips de hasta 30 segundos encajan con la segmentacion habitual de subtitulos, y la limpieza de disfluencias mejora la legibilidad.
- Preprocesado de datasets de voz para entrenamiento: el tagger puede usarse para etiquetar y filtrar disfluencias en corpus de ASR, ya que el encoder es accesible via llama.cpp con embeddings.
- Notas de voz en aplicaciones moviles o de escritorio: el tamano de 0,36B y el runtime en C++ sin PyTorch permiten despliegue en entornos con recursos limitados.
- Dictado por voz en herramientas de productividad: la salida limpia reduce la necesidad de edicion posterior por parte del usuario.
- Transcripcion de centros de llamadas en varios idiomas: el soporte de ocho idiomas permite aplicar el mismo pipeline a operaciones multilingues, aunque la precision en polaco y neerlandes es notablemente inferior.
- Limpieza de transcripciones existentes: el modo `--text` permite pasar texto ya transcrito por el tagger para eliminar disfluencias sin volver a procesar el audio.

## Benchmarks y rendimiento

El autor publica tasas de error (WER, o CER para coreano) comparando el motor nativo cerrado (`whistle.cact`) con el modelo abierto exportado a GGUF. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Idioma | Clips | `whistle.cact` (motor nativo) | GGUF F32/F16 (modelo abierto) |
|---|---:|---:|---:|
| Ingles | 100 | 14,5 % | 17,6 % |
| Aleman | 100 | 22,0 % | 25,1 % |
| Frances | 30 | 27,4 % | 30,7 % |
| Espanol | 30 | 11,3 % | 12,5 % |
| Italiano | 30 | 18,6 % | 19,3 % |
| Neerlandes | 30 | 32,5 % | 36,6 % |
| Polaco | 30 | 43,2 % | 48,6 % |
| Coreano | 30 | 34,4 % CER | 45,3 % CER |

Comprobaciones de paridad del ASR frente al modelo JAX abierto:

| Fichero | Transcripciones identicas | Publicado |
|---|---:|---:|
| `whistle-fleet2-F32.gguf` | 380/380 | si |
| `whistle-fleet2-F16.gguf` | 378/380 | si |
| `whistle-fleet2-Q8_0.gguf` | 344/380 | no (falla el umbral) |

Comprobaciones de paridad del tagger frente a PyTorch:

| Fichero | Etiquetas identicas | Desajustes de token-id | Publicado |
|---|---:|---:|---:|
| `fleet-clean-tagger-F16.gguf` | 99,99 % | 0 | si |
| `fleet-clean-tagger-Q8_0.gguf` | 99,82 % | 0 | si |

## Requisitos de hardware

- VRAM estimada: el modelo completo (0,36B) en F16 ocupa aproximadamente 0,7 GB de pesos; en F32, alrededor de 1,2 GB. El repo completo pesa 1,3 GB. La inferencia en `whistle-cli` usa float32 en toda la red, por lo que el consumo de memoria se situa en torno a 1,2-1,5 GB.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM es suficiente; tambien funciona en CPU. No se requiere A100 ni H100.
- Cabe en GPU consumer: si, practicamente cualquier modelo (RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: `whistle-cli` (C++, compilado con Accelerate en macOS y OpenBLAS o C++ puro en otras plataformas), llama.cpp `llama-server` con soporte modern-bert para el encoder del tagger, y el script Python `fleet_clean_gguf.py` con numpy y gguf.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| Fleet-Clean-0.36B-GGUF | 0,36B | No disponible (30 s audio) | 8 | Apache-2.0 | GGUF | ASR + limpieza de disfluencias |
| Whisper small (referencia) | 0,24B | 30 s audio | ~99 | MIT | safetensors, GGUF | ASR puro |
| Whisper medium (referencia) | 0,77B | 30 s audio | ~99 | MIT | safetensors, GGUF | ASR puro |

La comparativa con Whisper es orientativa por categoria y tamano; no se dispone de resultados de benchmarks cruzados en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento rigurosa. La diferencia funcional clave de Fleet-Clean es la limpieza integrada de disfluencias, que Whisper no realiza de forma nativa.

## Limitaciones y advertencias

- Precision inferior al motor nativo: el propio autor advierte que los GGUF son menos precisos que `whistle.cact`; la brecha varia entre 1,2 puntos (espanol) y 10,9 puntos CER (coreano).
- Calidad desigual por idioma: polaco (48,6 % WER) y neerlandes (36,6 %) presentan tasas de error muy altas, poco adecuadas para produccion sin revision humana.
- El fichero Q8_0 del ASR no se publica porque falla el umbral de paridad (344/380 transcripciones identicas); solo estan disponibles F32 y F16.
- En F16, algunos tokens con activaciones atipicas ("I", ".") alcanzan una similitud coseno de aproximadamente 0,98 frente a PyTorch, aunque la media es superior a 0,9999.
- Requiere un build de llama.cpp con soporte modern-bert para el encoder del tagger; no funciona con versiones estandar sin ese soporte.
- Limitacion de audio a 30 segundos por clip; no se documenta soporte para audio mas largo.
- No dispone de tool calling, agentes ni capacidades multimodales.
- Riesgo de alucinacion en ASR: como todo modelo de reconocimiento, puede generar texto plausible que no corresponde al audio, especialmente en idiomas con WER alto.
- Sesgos: no se documentan sesgos especificos, pero al no disponer de informacion sobre la composicion del dataset de entrenamiento no es posible evaluarlos.
- Licencia Apache-2.0 permite uso comercial, pero `whistle.cpp` es un port de codigo Apache-2.0 de Cactus y debe respetarse el fichero NOTICE.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/Fleet-Clean-0.36B-GGUF
- Modelo base: https://huggingface.co/Lucasgitguy-co/Fleet-Clean-0.36B
- Encoder mmBERT-base: https://huggingface.co/jhu-clsp/mmBERT-base
- llama.cpp: https://github.com/ggerganov/llama.cpp
