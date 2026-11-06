# groxaxo/Audio8-TTS-Realistic-Air-MLX8-Selective

## Resumen

Audio8-TTS-Realistic-Air-MLX8-Selective es un checkpoint de texto a voz (TTS) convertido a formato MLX nativo para Apple Silicon por el usuario groxaxo. Se trata de una derivacion cuantizada del modelo Edge0/Audio8-TTS-Realistic-Air, no de un lanzamiento oficial del autor original. La conversion aplica cuantizacion selectiva de 8 bits a los modulos lineales de los bloques transformer (slow/fast) mientras mantiene en FP32 el codec y en BF16 las proyecciones auxiliares, embeddings, cabezas de salida y normalizaciones.

El modelo resuelve el problema de ejecutar sintesis de voz realista en hardware de consumo Apple (M-series) sin depender de CUDA ni de GPUs dedicadas. Con 938.556.145 parametros totales y un repositorio de 2,2 GB, el checkpoint completo ocupa 2.161 GB, un 15,3% menos que el modelo fuente sin cuantizar. La medicion reportada por el autor indica un RTF de 0,521 frente a 0,679 del modelo sin cuantizar, incluyendo la decodificacion del codec pero excluyendo la carga del modelo y el calentamiento.

Es relevante ahora porque demuestra una via practica de cuantizacion selectiva (no uniforme) para modelos de audio en MLX, con auditoria de tensores incluida, y porque permite inferencia TTS local en un Apple M5 con 24 GiB. La licencia Apache 2.0 facilita su uso comercial, aunque la ausencia de evaluacion MOS o de escucha humana limita las garantias de calidad subjetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bloques slow/fast y codec de audio (arktts) |
| Parametros totales | 938.556.145 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine, group size 64, round-to-nearest, selectiva; codec en FP32; embeddings, cabezas, normas y proyecciones auxiliares en BF16 |
| Idiomas soportados | no disponibles (el autor reporta muestras en ingles, espanol y bilingues) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Edge0/Audio8-TTS-Realistic-Air, un sistema TTS con arquitectura de transformer que incorpora bloques denominados slow y fast, junto con un codec de audio para la sintesis de la forma de onda. La conversion a MLX aplica cuantizacion de 8 bits a 140 modulos Linear de dichos bloques transformer, manteniendo el codec en FP32 y el resto de componentes densos en BF16. No se trata de una cuantizacion uniforme de todos los componentes, sino selectiva, lo que preserva la calidad de las partes mas sensibles.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La model card del checkpoint convertido no detalla el proceso de entrenamiento original. La innovacion tecnica destacable es el propio esquema de cuantizacion selectiva con auditoria de tensores (quantization-audit.json), que documenta la forma y el tipo de cada tensor, asi como los modulos cuantizados.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto de entrada, con generacion de audio y frecuencia de muestreo devuelta por el modelo.
- Generacion multilingue: el autor reporta pruebas con utterances en ingles, espanol y bilingues.
- Soporte de semilla (seed) para reproducibilidad en la generacion.
- Control de longitud maxima de generacion mediante el parametro max_tokens.
- Inferencia nativa en Apple Silicon mediante MLX-Audio, sin uso de Torch en la ruta de inferencia del modelo convertido.
- No se documenta soporte de clonacion de voz por audio de referencia: las muestras reportadas son sinteticas y generadas sin reference-audio cloning.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.

## Casos de uso

- Sintesis de voz local en equipos Apple Silicon: el modelo se carga con el loader nativo de MLX-Audio y permite generar audio en un M5 con 24 GiB, sin GPU dedicada, lo que encaja en flujos de trabajo de desarrollo en macOS.
- Generacion de locuciones para prototipos y demos: con un RTF de 0,521 en el hardware medido, es adecuado para producir audio de prueba en aplicaciones antes de invertir en infraestructura de produccion.
- Contenido bilingue espanol-ingles: el autor valida utterances bilingues, lo que permite generar narraciones o avisos que alternan ambos idiomas en un mismo flujo.
- Accesibilidad y lectura de textos: integrado en herramientas de lectura en voz alta para macOS, aprovechando la ejecucion local y la licencia Apache 2.0 para distribucion.
- Postproduccion y doblaje de baja latencia en local: al no requerir conexion a servicios en la nube, se puede usar en estaciones de trabajo con requisitos de privacidad sobre el texto de entrada.
- Investigacion en cuantizacion de modelos de audio: el repositorio incluye benchmark_mlx.py, quantization-audit.json y benchmark-results.json, lo que lo convierte en una referencia reproducible para estudiar el impacto de la cuantizacion selectiva en TTS.
- Generacion de audio para pruebas automatizadas: la semilla y los parametros de generacion permiten reproducir muestras deterministas en pipelines de test.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| RTF (modelo cuantizado 8-bit selectivo) | 0,521 |
| RTF (modelo sin cuantizar) | 0,679 |
| Reduccion de tamano del checkpoint | 15,3% |
| Tamano del checkpoint completo | 2.160.646.598 bytes (2,161 GB) |
| Hardware de medicion | Apple M5, 24 GiB |
| Fecha de prueba | 3 de noviembre de 2026 |
| Muestras evaluadas | 5 utterances (ingles, espanol, bilingues) |
| Inclusiones/exclusiones | Incluye decodificacion del codec; excluye carga del modelo y calentamiento |

No se han publicado resultados de benchmarks estandar (MOS, WER, MCD) ni puntuaciones de escucha humana en la informacion disponible. El autor indica explicitamente que no se midio MOS.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el checkpoint completo ocupa 2,161 GB en disco; la memoria necesaria en inferencia no se detalla, pero el autor lo valida en un Apple M5 con 24 GiB de memoria unificada.
- GPU recomendadas: Apple Silicon (serie M) con soporte MLX; validado en M5 de 24 GiB. No se reportan pruebas en A100, H100 ni RTX 4090, ya que el formato es MLX nativo para Apple Silicon.
- Cabe en GPU de consumo: si, en equipos Apple Silicon; no se documenta su uso en GPUs NVIDIA consumer.
- Opciones de despliegue: MLX-Audio con el loader nativo (`mlx_audio.tts.utils.load_model`); se desaconseja el uso de Transformers AutoModel. Versiones validadas: MLX 0.32.4, MLX-VLM 0.7.11, MLX-Audio 0.6.4, Transformers 5.22.1.
- Latencia y throughput: RTF de 0,521 en el hardware medido, lo que implica sintetizar audio mas rapido que tiempo real en ese equipo.
- Nota: Torch solo se requiere para la conversion del codec original, no para la inferencia del modelo convertido.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Audio8-TTS-Realistic-Air-MLX8-Selective | 938.556.145 | safetensors (MLX) | 8-bit selectiva | Apache 2.0 | RTF 0,521 en M5 24 GiB |
| Edge0/Audio8-TTS-Realistic-Air (base) | no disponible | no disponible | sin cuantizar | no disponible en la informacion | RTF 0,679 en la misma prueba |
| Otros TTS MLX | no disponible | no disponible | no disponible | no disponible | no se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas de la misma categoria mas alla del modelo base.

## Limitaciones y advertencias

- Es una conversion derivada, no un lanzamiento oficial del autor original; la calidad y el soporte dependen del trabajo de groxaxo.
- No se ha medido MOS ni puntuacion de escucha humana; la calidad subjetiva del audio no esta validada formalmente.
- Las muestras evaluadas son sinteticas y generadas sin clonacion por audio de referencia; no se cubre el caso de clonacion de voz.
- La muestra OCR del benchmark contiene solo documentos de una o dos paginas y no prueba el comportamiento en documentos de cientos de paginas ni en horizonte ilimitado.
- La memoria reportada por el asignador no equivale al RSS total del sistema.
- No se documentan sesgos conocidos ni riesgos de alucinacion especificos del modelo.
- No se especifican los idiomas oficialmente soportados; solo se reportan pruebas en ingles y espanol.
- La licencia Apache 2.0 permite uso comercial, pero deben preservarse la licencia y la atribucion del modelo fuente al redistribuir.
- Requiere el loader nativo de MLX-Audio; el uso con Transformers AutoModel no esta validado.
- El modelo esta pensado para Apple Silicon; no se documenta su funcionamiento en otras plataformas.

## Enlaces

- Hugging Face: https://huggingface.co/groxaxo/Audio8-TTS-Realistic-Air-MLX8-Selective
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Realistic-Air
- Revision del modelo base: `23c305cc013fde378edb459f538317043c993a74`
- BENCHMARKS.md: https://huggingface.co/groxaxo/Audio8-TTS-Realistic-Air-MLX8-Selective/blob/main/BENCHMARKS.md
- benchmark-results.json: https://huggingface.co/groxaxo/Audio8-TTS-Realistic-Air-MLX8-Selective/blob/main/benchmark-results.json
- quantization-audit.json: https://huggingface.co/groxaxo/Audio8-TTS-Realistic-Air-MLX8-Selective/blob/main/quantization-audit.json
- benchmark_mlx.py: https://huggingface.co/groxaxo/Audio8-TTS-Realistic-Air-MLX8-Selective/blob/main/benchmark_mlx.py
