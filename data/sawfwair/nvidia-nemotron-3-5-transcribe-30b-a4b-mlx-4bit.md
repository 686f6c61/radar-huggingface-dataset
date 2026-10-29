# Sawfwair/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-MLX-4bit

## Resumen

Esta ficha describe `Sawfwair/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-MLX-4bit`, una conversión de cuantización realizada por un tercero (Sawfwair) sobre el modelo de reconocimiento automático del habla `nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B` de NVIDIA. No es un modelo entrenado desde cero: no hubo entrenamiento ni ajuste fino, solo un cambio de formato para permitir inferencia nativa en Swift/MLX dentro del runtime `mere.run` sobre hardware Apple Silicon. Concretamente, se empaquetan en 4 bits afines de MLX 46 matrices de expertos enrutados del decoder principal, mientras que los 1.223 tensores restantes (codificadores de audio, routers, expertos compartidos, capas Mamba y tensores MTP retenidos) conservan sus valores y dtypes originales.

El interés práctico es la reducción de huella de memoria: en una prueba sobre Apple M5 Max con 128 GiB de memoria unificada, el pico de memoria del proceso baja de 61,74 GiB (BF16) a 21,83 GiB (INT4), y el tiempo de una transcripción de 46,57 segundos pasa de 46,74 s a 6,45 s. El coste medido en calidad es pequeño en el conjunto evaluado: la tasa de error de palabra agregada sube de 0,383 % a 0,766 % sobre 12 grabaciones en inglés y 522 palabras de referencia.

Ahora bien, se trata de un artefacto muy específico y poco validado: 0 descargas y 0likes en el momento de la consulta, dependencia de un PR no fusionado del runtime (`mere-run` PR #606), evaluación únicamente en inglés sobre una muestra minúscula y una discrepancia no aclarada entre el nombre del modelo base (30B-A4B) y el recuento real de parámetros en safetensors (8.861.901.440). Es adecuado para experimentación local en Mac, no para producción multilingüe sin validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida de la familia NeMo SpeechLM: codificadores de audio, decoder principal con capas Mamba, mezcla de expertos enrutados (routers + expertos compartidos) y tensores MTP (multi-token prediction) retenidos pero no ejecutados |
| Parametros totales | 8.861.901.440 según los metadatos safetensors del repositorio; la nomenclatura del modelo base indica "30B" (discrepancia no explicada en la información disponible) |
| Parametros activos | Aproximadamente 4B según la nomenclatura "A4B" del modelo base; no verificado para esta conversión (no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 4-bit (w4a16), group size 64, escalas y sesgos en BF16, aplicado solo a 46 matrices de expertos enrutados del decoder principal; los otros 1.223 tensores mantienen su dtype original (BF16) |
| Idiomas soportados | NVIDIA declara 40 idiomas de transcripción; esta conversión solo se ha evaluado en inglés y expone traducción únicamente hacia inglés |
| Licencia | OpenMDW-1.1 (etiquetada como `license: other`); requiere aceptación explícita en el runtime (`--accept-model-license`) |
| Formato de pesos | safetensors con empaquetado afín de MLX; 25,07 GB de pesos (25,1 GB de repositorio); no hay GGUF ni checkpoint compatible con transformers/mlx-lm genéricos |

## Arquitectura y entrenamiento

El modelo base pertenece a la línea NeMo SpeechLM de NVIDIA y combina un front-end de codificación de audio con un decoder autorregresivo que integra capas Mamba, routers y expertos enrutados, además de expertos compartidos. La conversión preserva esa topología: solo se reempaquetan las 46 matrices de expertos enrutados del decoder principal en 4 bits afines (grupo 64, escalas y sesgos BF16) y se dejan intactos codificadores de audio, routers, expertos compartidos, capas Mamba y los tensores MTP, que se conservan pero no se ejecutan en la ruta cualificada del runtime. El resultado se ejecuta con una implementación nativa de multiplicación de expertos empaquetados en Swift/MLX, sin Python, y es incompatible con el formato NVFP4 de NVIDIA.

Sobre el entrenamiento del modelo original no hay información en el material proporcionado: se desconoce el volumen de tokens, la composición del corpus, si hubo etapas de RLHF/DPO o las técnicas de alineación empleadas. Lo único documentado es el proceso de conversión: no hubo entrenamiento ni ajuste fino, el origen BF16 tiene SHA-256 `03142dde5176c1d4df21ee829642745a1d670ea4d79e1a4684c64d53195acff2`, y cada shard convertido registra tamaño y hash en `MERERUN_CONVERSION.json`. La política de conversión está en `MODIFICATIONS.md` y los scripts de reproducción en `scripts/model-conversion/quantize_nemotron_transcribe_experts.py` y `publish_nemotron_transcribe_mlx.py` del repositorio `mere.run`.

## Capacidades

- Transcripción de voz a texto offline (pipeline `automatic-speech-recognition`) desde ficheros de audio locales.
- Traducción de audio a inglés, según la ruta nativa expuesta por el runtime.
- Cobertura declarada de 40 idiomas de transcripción por parte de NVIDIA (no validada en esta conversión).
- Ejecución local sin Python: inferencia en Swift/MLX con multiplicación de expertos empaquetados.
- Gestión de audio de duración media: la única medición disponible cubre una grabación de 46,57 segundos.
- No soporta CTC timestamps, streaming en vivo ni decodificación especulativa: quedan fuera de la ruta cualificada del runtime.
- No se documentan tool calling, function calling, capacidades de agente ni modos de razonamiento; no aplicables a este pipeline.

## Casos de uso

- Transcripción de notas de voz y reuniones en local: el modelo procesa audio sin salir del equipo, lo que encaja en entornos con requisitos de confidencialidad; en la medición de referencia, 46,57 s de audio se resuelven en 6,45 s de proceso CLI completo con el formato INT4.
- Subtitulado de vídeo de formato corto y medio en inglés: el pipeline devuelve texto plano transcribible a SRT mediante herramientas externas, aunque sin timestamps CTC nativos habrá que alinear después.
- Traducción de entrevistas o ponencias a inglés: la ruta nativa expone traducción a inglés, útil para normalizar material audiovisual en un único idioma de trabajo.
- Prototipado e integración en macOS: al ejecutarse con `mere.run` sobre MLX, sirve para construir utilidades de línea de comandos en Swift sin dependencias de Python ni servicios en la nube.
- Documentación por voz para desarrolladores: dictado de especificaciones o notas de diseño que se transcriben en el propio portátil y se incorporan a un repositorio.
- Evaluación comparativa de cuantización: este artefacto sirve como referencia para medir la pérdida de WER al pasar de BF16 a INT4 en un mismo hardware, con los scripts de reproducción publicados.
- Archivística y catalogación de audio: transcripción por lotes de grabaciones en inglés con el modelo BF16 o INT4 según la memoria disponible, siempre que se acepte la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni WER multilingüe tipo Common Voice/FLEURS) en la información disponible. Los únicos datos son la comparación medida por el autor entre BF16 e INT4 sobre 12 grabaciones en inglés (177,73 s, 522 palabras de referencia, 32 ejecuciones puntuadas más 2 de calentamiento) en un Apple M5 Max de 128 GiB con macOS 27.2:

| Metrica | BF16 | Routed-expert INT4 |
|---|---:|---:|
| Errores de palabra / palabras de referencia | 2 / 522 | 4 / 522 |
| WER agregado | 0,383 % | 0,766 % |
| Grabación de 46,57 s, mediana de tiempo CLI | 46,74 s | 6,45 s |
| Grabación corta, mediana de tiempo CLI | 14,94 s | 3,28 s |
| Pico de memoria del proceso | 61,74 GiB | 21,83 GiB |

Las dos sustituciones introducidas por INT4 fueron `Kaliko` → `Calico` y `nor` → `or`; ambos formatos produjeron exactamente la misma frase corta. Los tiempos incluyen carga de modelo, procesamiento de audio, prefill, decodificación y publicación de salida en procesos CLI nuevos, con cachés de ficheros y shaders retenidas. El propio autor advierte que la muestra es pequeña y en inglés, y que no demuestra equivalencia amplia de precisión, robustez ante ruido o campo lejano, ni exactitud multilingüe o de traducción.

## Requisitos de hardware

- VRAM/memoria: los pesos ocupan 25,07 GB; el pico de proceso medido es de 21,83 GiB en INT4 y 61,74 GiB en BF16, sobre memoria unificada (no VRAM dedicada).
- Hardware validado: Apple M5 Max con 128 GiB de memoria unificada y macOS 27.2. No hay datos de otros chips Apple ni de GPU NVIDIA/AMD.
- GPU consumer: no aplica en el sentido habitual; es un artefacto MLX para Apple Silicon. No se ha validado en GPUs de consumo tipo RTX 4090 ni en A100/H100.
- Despliegue: exclusivamente mediante `mere.run` (Swift/MLX) con la implementación de expertos enrutados INT4 del PR #606, todavía sin fusionar; no hay soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 7,2x tiempo real en la grabación de 46,57 s (6,45 s de proceso total, incluida la carga de modelo) y 3,28 s para la grabación corta con INT4; el BF16 tarda 46,74 s y 14,94 s respectivamente.
- Almacenamiento: 25,1 GB de repositorio; conviene reservar espacio adicional para cachés de shaders y ficheros de salida.

## Comparativa con modelos similares

Los datos de rendimiento de los alternativas no están disponibles en la información proporcionada; la comparación se limita a parámetros, formato, licencia y disponibilidad.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (MLX 4-bit) | 8,86B reportados (nominal 30B-A4B) | no disponible | 40 declarados, evaluado solo en inglés | OpenMDW-1.1 | Repositorio HF, requiere `mere.run` + PR #606 |
| NVIDIA Nemotron-3.5-Transcribe-30B-A4B (BF16, upstream) | Nominal 30B-A4B | no disponible | 40 declarados | OpenMDW-1.1 | Disponible en HF; 61,74 GiB de pico medido |
| Whisper large-v3 (referencia pública, no verificada en esta búsqueda) | ~1,55B | 30 s por ventana | ~99 idiomas | MIT | Amplia disponibilidad en múltiples runtimes |
| NVIDIA Canary-1B (referencia pública, no verificada en esta búsqueda) | ~1B | no disponible | Multilingüe (EN/DE/ES/FR) | CC BY-NC-SA 4.0 (no comercial) | Disponible en NeMo/HF |

La ventaja de esta conversión frente al BF16 original es únicamente operativa: menos memoria y menor latencia en Apple Silicon. Frente a Whisper o Canary, la comparación honesta exige medir WER en el mismo corpus, algo que no se ha hecho aquí; además, el ecosistema de despliegue de este artefacto es mucho más estrecho.

## Limitaciones y advertencias

- Evaluación de precisión limitada a 12 grabaciones en inglés (177,73 s, 522 palabras); no hay datos de ruido, campo lejano, acentos, audio de una hora ni multilingüe.
- La traducción solo se expone hacia inglés y no está evaluada en absoluto.
- Sin timestamps CTC ni streaming: no sirve para subtitulado en vivo ni para alineación temporal fina sin herramientas externas.
- Dependencia de código no publicado: requiere la implementación del PR #606 de `mere.run`, aún sin fusionar ni publicar en release.
- Discrepancia de parámetros: el nombre indica 30B-A4B, pero safetensors declara 8.861.901.440 parámetros; conviene verificar el artefacto antes de confiar en cualquier estimación de capacidad.
- Artefacto de terceros sin tracción: 0 descargas y 0likes, sin revisión independiente de la comunidad.
- Formato no estándar: no es NVFP4 de NVIDIA ni un checkpoint compatible con transformers o mlx-lm genéricos; las herramientas habituales no lo cargarán.
- Licencia OpenMDW-1.1 con aceptación obligatoria: hay que revisar el archivo `LICENSE` del repositorio para conocer las condiciones exactas de uso comercial y redistribución antes de integrarlo en un producto.
- Riesgo de alucinación inherente a la transcripción: con audio ruidoso o dominios especializados (nombres propios, terminología técnica) pueden aparecer sustituciones como las documentadas (`Kaliko` → `Calico`), más frecuentes en INT4 que en BF16.
- Sesgos: no disponibles; el autor no publica análisis de sesgo por variedad dialectal, género o edad.
- La conversión no incluye entrenamiento ni corrección de los pesos originales, de modo que hereda cualquier limitación del modelo de NVIDIA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sawfwair/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-MLX-4bit
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Runtime mere.run: https://github.com/sawfwair/mere-run
- Pull request con la implementación INT4 de expertos enrutados: https://github.com/sawfwair/mere-run/pull/606
- Corpus de referencia Mini LibriSpeech SLR31 (CC BY 4.0): https://www.openslr.org/31/
- Ficheros de cualificación y reproducción citados en la model card: `QUALIFICATION.md`, `QUALIFICATION.json`, `MODIFICATIONS.md`, `MERERUN_CONVERSION.json`, `SHA256SUMS`, `UPSTREAM_MODEL_CARD.md` y `LICENSE` (en el propio repositorio de HuggingFace)
- Papers, blogs o demos adicionales: no disponible (la búsqueda web realizada no devolvió resultados relacionados con el modelo)
