# jsbeaudry/pocket-tts-kreyol-onnx

## Resumen

Pocket TTS Kreyòl ONNX es un ajuste fino en criollo haitiano del modelo de síntesis de voz Pocket TTS, desarrollado por Kyutai, exportado a formato ONNX para su ejecución en dispositivo mediante ONNX Runtime. El export y el ajuste los firma el usuario jsbeaudry y derivan del checkpoint `french_24l` de Pocket TTS. El resultado es el modelo que carga la aplicación movil Klara (Expo / React Native sobre Android), lo que explica su orientacion practica: sintesis de voz en criollo haitiano que funciona sin servidor y sin acelerador dedicado.

El empaquetado divide el pipeline en cuatro grafos ONNX cuantizados: un condicionador de texto (`text_conditioner_int8.onnx`, 16 MB), un backbone autorregresivo de 24 capas con cache KV de solo anexado (`flow_lm_main_kv_q4.onnx`, 190 MB en 4 bits), una cabeza de flujo que produce el latente de 32 dimensiones (`flow_lm_flow_int8.onnx`, 10 MB) y el decodificador del codec Mimi que reconstruye audio a 24 kHz (`mimi_decoder_int8.onnx`, 23 MB). El repositorio ocupa 0,5 GB e incluye tambien una variante alternativa del backbone en INT8 (304 MB), embeddings de voces en float32 y el tokenizador Unigram del ajuste.

Su relevancia es doble. Por un lado, cubre un idioma con muy poca cobertura en sintesis de voz, el criollo haitiano (`ht`), con un CER de aproximadamente el 10 % medido con Qwen3-ASR Kreyòl sobre 20 frases reservadas. Por otro, demuestra una optimizacion de inferencia concreta: sustituir la cache KV de tamano fijo (unos 100 MB copiados por fotograma en el export original) por un esquema de solo anexado, lo que rebaja el coste por fotograma de 311 ms a 43 ms en un Galaxy A16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS en tres etapas: LM transformer autorregresivo de 24 capas con cache KV de solo anexado, cabeza de flujo (flow matching) y decodificador del codec neuronal Mimi; exportado a grafos ONNX separados |
| Parametros totales | no disponible (el modelo base Pocket TTS declara aproximadamente 100 millones de parametros en su forma destilada de inferencia) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la entrada de texto se pasa como `text_embeddings [1, X, 1024]`, con X variable segun el fragmento de texto) |
| Tipos de cuantizacion | INT8 (cuantizacion dinamica) y 4 bits (MatMulNBits, tamano de bloque 32); embeddings de voz y BOS en float32 |
| Idiomas soportados | criollo haitiano (`ht`) |
| Licencia | no disponible |
| Formato de pesos | ONNX (grafos `.onnx`), mas ficheros auxiliares `bundle.json`, `tokenizer.json` y embeddings `.f32` |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `french_24l` de Pocket TTS, el modelo de sintesis de voz compacto publicado por el laboratorio frances Kyutai en septiembre de 2025. El backbone es un transformer autorregresivo de 24 capas con dimension oculta de 1024 y 16 cabezas de atencion de 64 dimensiones. Sobre ese backbone se apoya una cabeza de flujo que, partiendo de ruido gaussiano (`x ~ N(0, 0.7)`), produce un latente de 32 dimensiones; ese latente lo convierte en audio el decodificador Mimi a 24 kHz. La generacion es streaming: cada fotograma consume el latente anterior.

La innovacion tecnica principal del export es el cambio de contrato de la cache KV. El export original pasaba una cache de tamano fijo (aproximadamente 100 MB) de entrada y salida del grafo en cada fotograma, y ese coste de copia superaba al del propio modelo en un telefono. Este export recibe las claves y valores pasados a su longitud usada (`past_k_i` / `past_v_i [1, P, 16, 64]` por capa, con P potencialmente 0) y devuelve unicamente las posiciones nuevas (`new_k_i` / `new_v_i [1, S+X, 16, 64]`), que la aplicacion anexa a sus propios buffers. El script `export/export_flow_lm_kv.py` valida el export contra la ruta de streaming original: coincidencia exacta en PyTorch y una diferencia maxima de 2e-6 en el grafo ONNX.

No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del corpus en criollo haitiano ni si se aplicaron tecnicas de alineamiento como RLHF o DPO. El modelo admite clonacion de voz mediante embeddings de prompt calculados en PyTorch (`voices/*.f32`, con forma `[1, frames, 1024]`), insertados tras un embedding BOS especifico del ajuste.

## Capacidades

- Sintesis de voz en criollo haitiano (`ht`) a 24 kHz de frecuencia de muestreo de salida.
- Generacion en streaming: el bucle procesa fotograma a fotograma con estado persistente, lo que permite emitir audio con latencia baja.
- Clonacion de voz a partir de un prompt de voz corto, codificado una sola vez y reutilizado como prefijo de la cache KV.
- Seleccion entre varias voces precalculadas empaquetadas en `voices/voices.json`.
- Control de fin de generacion mediante el logit de EOS (`eos_logit`), con parada recomendada unos fotogramas despues de superar -4.
- Inferencia en dispositivo sobre CPU ARM mediante ONNX Runtime, sin necesidad de GPU ni de conexion a red.
- Integracion movil: es el modelo que consume la aplicacion Klara (Expo / React Native, Android).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de entrada ni razonamiento multi-paso, dado que se trata de un modelo puramente de texto a voz.

## Casos de uso

- Lectura de contenido en criollo haitiano en aplicaciones moviles: el modelo cabe en el almacenamiento de un telefono (0,5 GB de repositorio, 190 MB el backbone en 4 bits) y funciona sin conexion, lo que lo hace util para leer noticias, mensajes o documentos a usuarios que prefieren escuchar antes que leer.
- Accesibilidad para personas con discapacidad visual: al ejecutarse integramente en el dispositivo con ONNX Runtime, permite narrar interfaces y notificaciones sin depender de servicios en la nube y sin exponer contenido privado a terceros.
- Asistente de voz en aplicaciones de atencion al ciudadano en Haiti: la clonacion de voz permite fijar una voz institucional coherente y reutilizarla como prefijo de cache en todas las sesiones, reduciendo el coste de arranque.
- Educacion y alfabetizacion: lectura en voz alta de textos escolares en criollo, idioma con escasa cobertura en herramientas TTS comerciales.
- Integracion en pipelines de generacion de audio por lotes: los grafos ONNX son portables y pueden ejecutarse tambien en servidor con ONNX Runtime, de modo que el mismo artefacto sirve para pregenerar audios (mensajes, avisos, locuciones) y para inferencia en vivo.
- Audiolibros y contenido hablado en criollo: con voz clonada a partir de una muestra corta, se puede mantener una identidad de voz consistente a lo largo de horas de material.
- Pruebas de concepto de TTS en idiomas de bajos recursos: la estructura de exportacion (condicionador, backbone con cache anexable, cabeza de flujo, decodificador) y los scripts en `export/` sirven como plantilla para repetir el proceso con otros ajustes de Pocket TTS.

## Benchmarks y rendimiento

Calidad medida como CER con Qwen3-ASR Kreyòl sobre 20 frases reservadas, voz `reel`, promediado sobre 2 semillas de muestreo:

| Variante del LM | CER |
|---|---|
| Export INT8 de referencia (stock) | 10,2 % (una semilla) |
| `alt/flow_lm_main_kv_int8.onnx` | 9,8 % |
| `flow_lm_main_kv_q4.onnx` | 10,7 % (dentro del ruido entre semillas) |

Velocidad medida en un Galaxy A16 (Exynos 1330, ONNX Runtime con 2 hilos):

| Metrica | Valor |
|---|---|
| Fotograma del LM, export con cache anexable | 43 ms |
| Fotograma del LM, export stock | 311 ms |
| RTF del bucle completo | 1,3–1,45 (con limitacion termica) |
| Tiempo hasta el primer sonido | 1,2–2 s |

No se han publicado en la informacion disponible resultados de benchmarks estandar de sintesis (MOS, MCD, WER sobre corpus completos) ni comparaciones con otros sistemas TTS en criollo haitiano.

## Requisitos de hardware

- No requiere GPU: el destino principal es CPU ARM en telefono. No aplica una estimacion de VRAM en el sentido habitual.
- Huella de almacenamiento de los pesos: 190 MB para el backbone en 4 bits (`flow_lm_main_kv_q4.onnx`), 304 MB para la variante INT8 (`alt/flow_lm_main_kv_int8.onnx`), mas 16 MB del condicionador de texto, 10 MB de la cabeza de flujo y 23 MB del decodificador Mimi. Repositorio completo: 0,5 GB.
- Memoria en ejecucion: ademas de los pesos, hay que sumar los buffers de cache KV, los embeddings de voz en float32 (`[1, frames, 1024]`) y el estado de streaming del decodificador; el consumo total no se especifica en la informacion disponible.
- Dispositivo de referencia validado: Samsung Galaxy A16 con SoC Exynos 1330 y ONNX Runtime a 2 hilos.
- En escritorio o servidor puede ejecutarse con ONNX Runtime sobre CPU (x86 o ARM); no se documentan requisitos de GPU para este export.
- Opciones de despliegue: ONNX Runtime (libreria declarada), integrable desde Expo / React Native en Android y desde otros entornos con bindings de ONNX Runtime. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput medidos: 43 ms por fotograma del LM en el dispositivo de referencia, RTF de 1,3–1,45 (es decir, ligeramente por encima del tiempo real, penalizado por limitacion termica) y primera salida audible entre 1,2 y 2 segundos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| `jsbeaudry/pocket-tts-kreyol-onnx` | TTS con clonacion de voz | no disponible (base Pocket TTS ~100 M) | criollo haitiano | ONNX | no disponible | Export optimizado con cache KV anexable; CER ~10 % con Qwen3-ASR Kreyòl |
| Kyutai Pocket TTS (modelo base) | TTS con clonacion de voz | ~100 M en forma destilada | no disponible en la informacion recogida | no disponible | no disponible en la informacion recogida | Modelo original publicado en septiembre de 2025; disenado para CPU |
| `KevinAHM/pocket-tts-onnx` | Export ONNX de Pocket TTS | no disponible | no disponible | ONNX | no disponible | Otro export comunitario del mismo modelo base, no especifico de criollo haitiano |
| `jsbeaudry/qwen3-tts-kreyol` | TTS (demo en Space) | 1,7 B (variantes citadas) | criollo haitiano | no disponible | no disponible | Alternativa mayor, con voces nombradas, clonacion y diseno de voz; requiere GPU (ZeroGPU) |

La comparativa con modelos cerrados de sintesis de voz en criollo haitiano no esta disponible en la informacion recogida.

## Limitaciones y advertencias

- No se especifica licencia. Hasta que el autor la declare, no puede asumirse permiso de uso comercial ni de redistribucion.
- La evaluacion de calidad se apoya en una muestra muy pequena: 20 frases reservadas, una sola voz (`reel`) y entre una y dos semillas. La diferencia entre 9,8 % y 10,7 % de CER se describe en la propia model card como dentro del ruido entre semillas.
- El CER de referencia ronda el 10 %, medido con un sistema ASR externo (Qwen3-ASR Kreyòl); implica errores de pronunciacion o inteligibilidad perceptibles en una de cada diez unidades evaluadas.
- El RTF de 1,3–1,45 indica que la generacion va ligeramente por debajo del tiempo real en el dispositivo de referencia y con limitacion termica. No es adecuado para escenarios que exijan latencia estricta sostenida.
- Cobertura linguistica limitada al criollo haitiano. No hay evidencia de soporte multilingue ni de cambio de idioma en tiempo de ejecucion.
- El modelo depende de embeddings de voz precalculados en PyTorch (`voices/*.f32`); anadir una voz nueva requiere ese paso previo fuera del grafo ONNX.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir artefactos, ruido o segmentos ininteligibles, especialmente en textos fuera de dominio o con numeros, siglas y nombres propios.
- No se documentan sesgos especificos, pero al derivar de un ajuste sobre el checkpoint `french_24l` conviene auditar la calidad por variedad dialectal y por genero antes de un despliegue amplio.
- El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que carece de validacion externa mas alla de la aplicacion Klara.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jsbeaudry/pocket-tts-kreyol-onnx
- Space relacionado del mismo autor (Qwen3-TTS Kreyòl): https://huggingface.co/spaces/jsbeaudry/qwen3-tts-kreyol
- Export ONNX comunitario de Pocket TTS (KevinAHM): https://huggingface.co/KevinAHM/pocket-tts-onnx
- Ficha de Pocket TTS en AI Wiki (Learn AI): https://ai.miraheze.org/wiki/Pocket_TTS
- Implementaciones comunitarias de Pocket TTS (DeepWiki): https://deepwiki.com/kyutai-labs/pocket-tts/10.2-community-implementations
- Guia de entrenamiento local con Pocket TTS: https://www.mindstudio.ai/blog/train-tts-model-locally-pocket-tts
