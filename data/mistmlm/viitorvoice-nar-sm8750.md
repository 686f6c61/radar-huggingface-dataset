# mistmlm/viitorvoice-nar-sm8750

## Resumen

ViiTorVoice-NAR SM8750 es un paquete de artefactos compilados para ejecutar la cadena completa de síntesis de voz (TTS) y clonación de voz de ViiTorVoice directamente sobre la NPU Hexagon del SoC Qualcomm Snapdragon 8 Elite (SM8750). No se distribuyen pesos en formato convencional, sino context binaries de QNN (`.bin`) que el runtime de Qualcomm carga mediante `QnnContext_createFromBinary`, lo que permite inferencia totalmente offline en dispositivos Android sin acceso a red ni a Hugging Face en tiempo de ejecución.

La cadena cubre cuatro etapas: un codificador semántico w2v-BERT (`enc_fe.bin`, 1,50 GB en fp16), un encode-core de dualcodec en siete segmentos enlazados (104 MB), un backbone NAR construido sobre Qwen3-0.6B con difusión enmascarada de 32 pasos (`llm.bin` 894 MB más `head.bin` 57 MB) y un decodificador dualcodec en cinco grafos (138 MB). El resultado es un pipeline de voz con clonación y salida en chino e inglés, empaquetado en un repositorio de 2,9 GB.

El interés técnico está en la política de cuantización y en el despliegue: no hay fp32 en ningún grafo (QNN lo rechaza), se usa w8a16 (peso int8, activación int16) salvo en el frontend w2v-BERT y el primer segmento del decodificador, que se mantienen en fp16 porque la degradación es audible. La cuantización se hace offline con exportación QDQ y folding de pesos con numpy, no con PTQ en tiempo de compilación, que provoca un fallo conocido (`PostLayout::addTensor`) en estos grafos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS por etapas: codificador semantico w2v-BERT + encode-core dualcodec + backbone NAR de difusion enmascarada sobre Qwen3-0.6B + decodificador dualcodec |
| Parametros totales | No disponible de forma agregada; el backbone NAR deriva de Qwen3-0.6B (0,6 mil millones) y el resto de componentes no publica recuento |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa fragmentos de 32x6k frames en el frontend semantico) |
| Tipos de cuantizacion | w8a16 (int8 peso / int16 activacion) mayoritario; fp16 en w2v-BERT (`enc_fe.bin`) y en el primer segmento del decodificador (`dec_p1.bin`); sin fp32 en ningun grafo |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Context binaries de QNN (`.bin`), no safetensors ni GGUF; generados con QAIRT 2.50 / qai-hub (`onnx → dlc → qairt-dlc-prepare → .bin`) |

## Arquitectura y entrenamiento

La cadena se compone de cuatro bloques encadenados. El frontend semantico es un w2v-BERT en fp16 dentro de un unico contexto QNN de 1,50 GB, con procesamiento por fragmentos de 32x6k frames en inferencia. El encode-core de dualcodec se reparte en siete segmentos enlazados (`enc_e1..e3`, `enc_front`, `enc_e4b`, `enc_e5`, `enc_e6`, 104 MB en total), donde `enc_front` se ejecuta 32 veces por cada operacion de codificacion. El backbone NAR es Qwen3-0.6B con un enlace multi-forma de pesos compartidos (`llm.bin` 894 MB, `head.bin` 57 MB), de modo que los pesos se almacenan una sola vez aunque el grafo admita varias formas de entrada. El decodificador dualcodec se divide en cinco grafos (`dec_p1..p5.bin`, 138 MB), con `p5` usando `chunk=48`.

La generacion de audio emplea difusion enmascarada no autorregresiva con 32 pasos (`nar_steps`), parametro expuesto en el fichero de configuracion. Las tablas de embeddings (`text_emb.bin`, `sem_emb.bin`, `aco_emb.bin`, 165 MB) incluyen la tabla de texto y 12 embeddings de codebook, y se recolectan en CPU. No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base; el autor solo declara los modelos de procedencia: ViiTorVoice (Apache-2.0), Qwen3-0.6B (Apache-2.0) y dualcodec.

La innovacion principal es el despliegue: compilacion con QAIRT 2.50 y qai-hub, probada en Android 16 con una app `com.viitorvoice.demo` que carga cada fichero con `QnnContext_createFromBinary` y los encadena con codigo C++ propio (`vv_encode / vv_nar / vv_pipeline`). La cuantizacion post-entrenamiento se hace offline mediante exportacion QDQ y folding de los pesos con numpy, evitando el PTQ en tiempo de compilacion que dispara el bug `PostLayout::addTensor` en estos grafos.

## Capacidades

- Sintesis de voz (TTS) completamente offline sobre la NPU Hexagon del Snapdragon 8 Elite.
- Clonacion de voz: la cadena incluye codificacion semantica de referencia y decodificacion dualcodec para reproducir la identidad vocal.
- Generacion de audio no autorregresiva mediante difusion enmascarada de 32 pasos, lo que permite paralelizar la sintesis frente a esquemas autoregresivos.
- Soporte bilingue chino e ingles.
- Ejecucion en dispositivo sin acceso a red ni a Hugging Face en tiempo de ejecucion.
- Integracion en aplicaciones Android mediante QNN SDK y llamadas nativas a `QnnContext_createFromBinary`.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio de entrada; el pipeline es exclusivamente texto a voz.

## Casos de uso

- Lectura por voz offline en aplicaciones Android: el pipeline completo se carga desde el directorio privado de la app (`/data/data/<pkg>/files/models`) y sintetiza sin conexion, adecuado para lectores de pantalla, audiolibros o navegacion por voz en entornos sin cobertura.
- Clonacion de voz personal en dispositivo: a partir de una muestra de referencia, el frontend w2v-BERT y el encode-core de dualcodec generan los embeddings semanticos y acusticos que el backbone NAR usa para sintetizar nuevas locuciones con la misma identidad vocal, sin enviar audio a servidores.
- Asistentes conversacionales locales: al ejecutarse integramente en la NPU, permite respuestas habladas en asistentes que deben funcionar con la pantalla apagada o en modo avion, con latencia controlada por la NPU y no por la red.
- Accesibilidad para personas con discapacidad visual o del habla: la clonacion permite conservar una voz personal en comunicadores aumentativos, y la sintesis offline garantiza disponibilidad permanente.
- Localizacion de contenido bilingue zh/en: el soporte de ambos idiomas permite doblar o locutar material en chino e ingles desde el mismo paquete, util en apps de aprendizaje de idiomas o turismo.
- Integracion en demos y prototipos de IA en dispositivo: el conjunto de context binaries y el script `install.sh` facilitan montar una prueba de concepto de TTS en un telefono con Snapdragon 8 Elite sin infraestructura de servidores.
- Evaluacion de cuantizacion en NPU: la separacion entre segmentos fp16 y w8a16 sirve como referencia practica para equipos que quieran medir el impacto audible de la cuantizacion en pipelines de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- SoC objetivo: Qualcomm Snapdragon 8 Elite (SM8750) con NPU Hexagon; la compilacion se ha probado en Android 16.
- Espacio de almacenamiento: el repositorio ocupa 2,9 GB y los ficheros se copian al directorio privado de la aplicacion, por lo que se necesita ese espacio libre mas el del modelo instalado.
- Memoria: no se publica el pico de memoria en la NPU; el mayor contexto individual es `enc_fe.bin` con 1,50 GB en fp16, lo que da una referencia del orden de magnitud del mayor grafo cargado.
- GPU de escritorio: no aplica; los context binaries de QNN estan compilados para la NPU Hexagon y no se ejecutan en A100, H100 ni RTX 4090.
- Opciones de despliegue: QNN SDK de Qualcomm (QAIRT 2.50) con `QnnContext_createFromBinary`; no se contemplan vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.bin` es especifico de QNN.
- Instalacion: `install.sh` copia el conjunto al directorio privado de la app con propietario y etiqueta SELinux correctos, y requiere root.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViiTorVoice-NAR SM8750 | Backbone Qwen3-0.6B; resto no disponible | No disponible | Context binaries QNN para Hexagon NPU | Apache-2.0 | Repositorio de 2,9 GB en Hugging Face (marcado como privado en la model card) |
| ViiTorVoice (modelo fuente) | No disponible | No disponible | Pesos originales del proyecto | Apache-2.0 | Repositorio GitHub ViiTor/ViiTor-Voice |
| Qwen3-0.6B (modelo base) | 0,6 mil millones | No disponible en la informacion | Safetensors, GGUF y otros formatos de la familia Qwen | Apache-2.0 | Hugging Face (Qwen/Qwen3-0.6B) |

No se dispone de datos de benchmarks ni de otros paquetes TTS compilados para Hexagon NPU en la informacion proporcionada que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Dependencia total del hardware: los context binaries estan compilados para SM8750 y no son portables a otras NPU, GPU ni CPU; fuera de ese SoC no se pueden ejecutar.
- Cobertura linguistica limitada a chino e ingles; no se declaran otros idiomas.
- El repositorio aparece marcado como privado en la model card, por lo que la disponibilidad publica de los ficheros no esta garantizada.
- Solo se distribuyen artefactos derivados; los pesos originales no se redistribuyen mas alla de lo que embeben los contextos QNN, lo que complica auditorias y reproducibilidad del entrenamiento.
- La cuantizacion w8a16 puede degradar la calidad de voz en segmentos no protegidos; el autor solo preserva fp16 en el frontend w2v-BERT y en `dec_p1.bin`, de modo que otros segmentos pueden presentar artefactos audibles.
- No se documentan sesgos del modelo base ni del corpus de voz; al tratarse de clonacion de voz, existe riesgo de uso suplantador y de generacion de audio sintetico no consentido, que debe mitigarse con controles de consentimiento y marcas de agua a nivel de aplicacion.
- Riesgo de alucinacion en el sentido de prosodia o contenido inesperado: no se publican metricas de inteligibilidad ni de similitud de hablante.
- No hay datos de latencia, throughput ni consumo energetico en la NPU, imprescindibles para validar un despliegue en produccion.
- El proceso de instalacion requiere root para asignar propietario y etiqueta SELinux, lo que limita su uso en dispositivos de consumo no rooteados.
- La licencia Apache-2.0 cubre los artefactos publicados, pero el uso comercial de la clonacion de voz esta sujeto ademas a la normativa aplicable sobre sintesis de voz y proteccion de datos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mistmlm/viitorvoice-nar-sm8750
- Proyecto ViiTorVoice (modelo fuente): https://github.com/ViiTor/ViiTor-Voice
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Ficheros auxiliares citados en la model card: `MANIFEST.md` (tamanos y sha256), `install.sh` (instalacion en app Android), `push_hf.sh` (sincronizacion del directorio)
