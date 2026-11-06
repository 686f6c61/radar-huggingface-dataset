# Ronaldodev/fon-asr-v4

## Resumen

fon-asr-v4 es una distribucion cuantizada en formato GGML del modelo Whisper Small ajustado (fine-tune) para reconocimiento automatico del habla en lengua fon (fɔngbè), una lengua Gbe hablada principalmente en Benín y Togo. Lo desarrolla Ronaldodev (AWADEME Ronaldo) y el repositorio contiene unicamente los pesos binarios optimizados para inferencia local mediante whisper.cpp, no el modelo original en safetensors. El modelo base es `Ronaldodev/whisper-fon-v4`, un Whisper Small fine-tuneado sobre 7.732 ejemplos de audio en fon.

El problema que resuelve es la ausencia de herramientas de ASR ligeras y offline para una lengua de bajos recursos como el fon. Al estar en formato GGML, el modelo puede ejecutarse en CPU estandar, dispositivos moviles (Android/iOS) y aceleradores como Apple Silicon Metal o CUDA, sin necesidad de GPU dedicada. El repositorio ocupa 0,3 GB e incluye dos cuantizaciones (Q4_0 de 145 MB y Q5_1 de 190 MB).

La relevancia actual reside en la combinacion de un tamano muy reducido (Whisper Small, ~244 M de parametros en el modelo original) con cuantizacion de 4-5 bits, lo que permite desplegar ASR en fon en entornos con recursos limitados. No obstante, el modelo es de autoria individual, sin descargas ni likes registrados, y no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small) |
| Parametros totales | no disponible (Whisper Small, ~244 M en el modelo original) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | Q4_0 (4-bit), Q5_1 (5-bit); conversion CTranslate2 int8 para faster-whisper |
| Idiomas soportados | fon (fɔngbè), frances |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML binario (`.bin`); modelo base en formato original no especificado |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper Small de OpenAI, un transformer encoder-decoder disenado para ASR. Segun la model card, el modelo original `Ronaldodev/whisper-fon-v4` fue fine-tuneado sobre 7.732 ejemplos de audio en fon. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla si hubo aumento de datos o estrategias de regularizacion.

La innovacion tecnica de este repositorio no esta en el entrenamiento sino en la distribucion: los pesos se convierten a CTranslate2 int8 mediante faster-whisper 1.1.0 y se cuantizan a formato binario GGML para whisper.cpp. Esto permite ejecucion nativa en CPU y plataformas moviles. La model card indica que el token de idioma debe fijarse en `fr` (`-l fr`) para enrutar correctamente el vocabulario fon, un detalle operativo relevante para el despliegue.

## Capacidades

- Transcripcion de audio a texto en lengua fon, con soporte declarado tambien para frances.
- Inferencia offline y local en CPU, sin dependencia de servicios en la nube.
- Ejecucion en dispositivos moviles (Android/iOS) y aceleradores Apple Silicon Metal y CUDA.
- Dos niveles de cuantizacion para equilibrar velocidad y fidelidad (Q4_0 para movil, Q5_1 para mayor fidelidad en diacriticos y tonos).
- Integracion con tres rutas de Python: `faster-whisper` (CTranslate2), `pywhispercpp` y `whisper-cpp-python`.
- Uso por linea de comandos mediante `whisper-cli` de whisper.cpp.
- No se documentan capacidades de tool calling, agentes, vision, audio adicional ni modo de razonamiento extendido.

## Casos de uso

- Transcripcion de reuniones y entrevistas en fon: el modelo procesa audio de 16 kHz mono y devuelve texto con marcas temporales por segmento, util para actas y subtitulado en contextos comunitarios de Benín y Togo.
- Aplicaciones moviles de dictado offline: con la cuantizacion Q4_0 de 145 MB, puede integrarse en apps Flutter/Android/iOS que funcionen sin conexion en zonas de baja conectividad.
- Archivado y digitalizacion de patrimonio oral: transcripcion de grabaciones de tradicion oral, cuentos y testimonios en fon para su indexacion y busqueda textual.
- Subtitulado de contenido audiovisual: generacion de subtitulos en fon y frances para videos educativos o divulgativos, usando la salida con timestamps de `faster-whisper`.
- Investigacion linguistica: generacion de transcripciones de corpus orales para analisis fonologico y lexico, con la advertencia de revisar manualmente los diacriticos y tonos.
- Asistentes de voz en entornos con hardware limitado: despliegue en Raspberry Pi o dispositivos embebidos mediante whisper.cpp con CPU y pocos hilos de ejecucion.
- Prototipado rapido de pipelines ASR: uso de `pywhispercpp` o `whisper-cpp-python` para validar integraciones sin compilar whisper.cpp desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, WER, etc.) en la informacion disponible. La model card unicamente reporta mediciones de inferencia en Apple M3 sobre un audio de referencia de 11,0 segundos (175.680 muestras a 16 kHz):

| Metrica | Valor medido (Apple M3) |
|---|---|
| Tiempo de carga | ~93-114 ms |
| Tiempo total de procesamiento | ~1,68 s |
| Real-Time Factor | ~0,15x (aproximadamente 7x mas rapido que tiempo real) |

No se proporcionan tasas de error (WER) ni comparaciones con otros sistemas ASR para fon.

## Requisitos de hardware

- VRAM estimada: no aplica para ejecucion en CPU; en GPU, el modelo cuantizado Q4_0 (145 MB) y Q5_1 (190 MB) requieren muy poca memoria, aunque no se especifica VRAM exacta.
- GPU recomendadas: no se detallan modelos concretos; la model card menciona soporte para CUDA y Apple Silicon Metal.
- Cabe en GPU consumer: si, por el tamano reducido de los pesos (145-190 MB), aunque no se confirma compatibilidad especifica con RTX 4090 u otras.
- Opciones de despliegue: whisper.cpp (CLI `whisper-cli`), `pywhispercpp`, `whisper-cpp-python`, y `faster-whisper` con CTranslate2 int8 sobre el modelo base.
- Latencia y throughput: en Apple M3, RTF ~0,15x sobre audio de 11 s; no se reportan mediciones en otras plataformas.
- Audio de entrada requerido: 16 kHz, mono, WAV PCM 16-bit; conversion via ffmpeg documentada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada. Como referencia estructural, el modelo se basa en Whisper Small (~244 M de parametros), pero no se han publicado comparaciones de WER frente a otros sistemas ASR para fon ni frente a otras variantes de Whisper. No disponible.

## Limitaciones y advertencias

- No se han publicado tasas de error (WER) ni evaluaciones formales; el rendimiento real en produccion es desconocido.
- El modelo se entrena sobre 7.732 ejemplos, un volumen reducido que puede limitar la generalizacion a acentos, dominios y condiciones acusticas no representadas.
- La model card advierte que el token de idioma debe fijarse en `fr` para enrutar el vocabulario fon; usar otro token puede degradar la transcripcion.
- Riesgo de errores en diacriticos y tonos del fon, especialmente con la cuantizacion Q4_0; se recomienda Q5_1 para mayor fidelidad.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero al ser un fine-tune de Whisper conviene verificar las condiciones heredadas del modelo base.
- Repositorio sin descargas ni likes registrados y de autoria individual; no hay evidencia de validacion externa ni mantenimiento continuo.
- Solo se declaran los idiomas fon y frances; no se garantiza soporte para otras lenguas Gbe ni para code-switching.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ronaldodev/fon-asr-v4
- Modelo base: https://huggingface.co/Ronaldodev/whisper-fon-v4
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- faster-whisper (CTranslate2): no se proporciona enlace en la informacion disponible
- pywhispercpp: no se proporciona enlace en la informacion disponible
- whisper-cpp-python: no se proporciona enlace en la informacion disponible
