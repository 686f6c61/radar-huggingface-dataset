# enet45/kotoba-whisper-v2.1-mlx-int8

## Resumen

Kotoba-Whisper v2.1 es un modelo de reconocimiento automático de voz (ASR) especializado en japonés, desarrollado por Kotoba Technologies sobre la base de OpenAI Whisper-large-v3. Este repositorio concreto (`enet45/kotoba-whisper-v2.1-mlx-int8`) es una conversión no oficial del modelo original al formato MLX (Machine Learning eXchange) de Apple, optimizado para ejecución local en chips Apple Silicon (M1, M2, M3, M4) mediante el framework MLX. La conversión aplica cuantización int8 de 8 bits con `group_size=64`, reduciendo el peso del modelo de 2.8 GB (fp32) a 770 MB, lo que permite ejecutar inferencia en Macs con 8 GB de memoria unificada.

El modelo original fue entrenado con más de 1.000 horas de audio japonés procedente de ReazonSpeech, Extended Common Voice y subtítulos de YouTube (YouTube CC), y supera a Whisper-large-v3 en varios benchmarks de ASR japonés como Common Voice JA 7.0/8.0 y CSJ. La conversión MLX mantiene la arquitectura encoder-decoder de Whisper, con 1.550 millones de parámetros, y añade soporte de puntuación automática en la salida. Es relevante porque permite desplegar un ASR japonés de alta calidad completamente offline en hardware de consumo de Apple, sin necesidad de GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper encoder-decoder (basado en OpenAI Whisper-large-v3) |
| Parametros totales | 1.550 millones (1.55B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (limitación de Whisper) |
| Tipos de cuantizacion | int8 (8-bit, group_size=64); también disponibles fp32 y fp16 en repositorios hermanos |
| Idiomas soportados | Japones (principal); el modelo base Whisper soporta otros idiomas pero el fine-tuning esta orientado a japones |
| Licencia | Apache 2.0 (heredada del modelo original) |
| Formato de pesos | safetensors en formato MLX (weights.safetensors) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura encoder-decoder de OpenAI Whisper-large-v3: un encoder Transformer que procesa espectrogramas Mel de 80 canales y un decoder autoregresivo que genera texto. El modelo original fue fine-tuning de Whisper-large-v3 con datos japoneses: ReazonSpeech, Extended Common Voice y subtitulos de YouTube (YouTube CC), acumulando mas de 1.000 horas de audio. No se menciona uso de RLHF ni DPO; el entrenamiento es de tipo supervisado para ASR. La innovacion principal de esta conversion MLX es la cuantizacion int8 con `group_size=64`, que reduce el peso a 770 MB con una degradacion de WER inferior al 1% respecto al modelo fp32. La conversion se realizo con la herramienta `convert.py` de mlx-examples, que mapea automaticamente los campos de HuggingFace al formato MLX.

## Capacidades

- Reconocimiento automatico de voz (ASR) en japones con alta precision, superando a Whisper-large-v3 en benchmarks japoneses como Common Voice JA 7.0/8.0 y CSJ.
- Salida con puntuacion automatica (punctuation-aware), anadiendo comas, puntos y signos de interrogacion al texto transcrito.
- Transcripcion con marcas de tiempo por segmento (start/end), util para subtitulos.
- Soporte de tareas de transcribe y translate (traduccion al ingles, si el modelo base lo soporta, aunque no esta documentado explicitamente).
- Ejecucion local offline en Apple Silicon via MLX, sin necesidad de conexion a internet.
- Compatible con formatos de salida txt, srt, vtt, json, tsv y all (todos a la vez).
- Integracion con el ecosistema `mlx_whisper` tanto por CLI como por API Python.

## Casos de uso

- Transcripcion de reuniones y entrevistas en japones: el modelo puede procesar grabaciones locales en un Mac, generando transcripciones con marcas de tiempo y puntuacion, listas para archivar o buscar.
- Generacion de subtitulos para video: con la salida en formato SRT o VTT, se pueden subtitular automaticamente videos en japones para plataformas como YouTube o Vimeo, sin depender de servicios en la nube.
- Asistente de toma de notas para estudiantes o profesionales: grabar audio de clases o conferencias y obtener texto estructurado con puntuacion, ejecutable en un MacBook Air de 8 GB.
- Procesamiento de llamadas de atencion al cliente en japones: transcribir grabaciones de centros de contacto para analisis posterior, con la ventaja de que los datos no salen del dispositivo.
- Creacion de corpus de voz para entrenamiento de otros modelos: al funcionar offline y con licencia Apache 2.0, se puede usar para transcribir grandes volumenes de audio y construir datasets etiquetados.
- Aplicaciones de accesibilidad: transcripcion en tiempo real o diferida para personas con discapacidad auditiva, ejecutable en hardware Apple de consumo.

## Benchmarks y rendimiento

La model card original de kotoba-tech/kotoba-whisper-v2.1 reporta que el modelo supera a OpenAI Whisper-large-v3 en benchmarks japoneses como Common Voice JA 7.0/8.0 y CSJ (Corpus of Spontaneous Japanese). La conversion int8 introduce una degradacion tipica inferior al 1% de WER respecto al modelo fp32, aunque no se proporcionan cifras exactas de WER en la informacion disponible. No se han publicado resultados de benchmarks especificos para esta conversion MLX int8 en la documentacion consultada.

## Requisitos de hardware

- VRAM estimada: el modelo int8 ocupa 770 MB en disco; en memoria unificada de Apple Silicon, se recomienda al menos 8 GB de RAM para ejecutarlo con margen.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4). No funciona en Intel Mac ni en GPU NVIDIA/AMD.
- Compatibilidad con hardware de consumo: si, cabe en MacBook Air, MacBook Pro, Mac mini, iMac y Mac Studio con 8 GB o mas de memoria unificada.
- Opciones de despliegue: `mlx_whisper` (CLI y Python API). No compatible con vLLM, llama.cpp, Ollama o TGI, que no soportan MLX.
- Latencia y throughput: no se proporcionan datos numericos en la informacion disponible. La model card indica un tiempo de carga de ~0.3 segundos y recomienda que audio de mas de 30 minutos requiere mayor memoria, aunque int8 reduce el consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Formato |
|---|---|---|---|---|---|
| kotoba-whisper-v2.1 (original) | 1.55B | 30 s | Japones | Apache 2.0 | PyTorch / safetensors |
| enet45/kotoba-whisper-v2.1-mlx-int8 | 1.55B | 30 s | Japones | Apache 2.0 | MLX safetensors (int8) |
| enet45/kotoba-whisper-v2.1-mlx-fp16 | 1.55B | 30 s | Japones | Apache 2.0 | MLX safetensors (fp16) |
| OpenAI Whisper-large-v3 | 1.55B | 30 s | Multilingue (99 idiomas) | MIT | PyTorch / safetensors |

La comparativa muestra que la version MLX int8 es la mas ligera en disco (770 MB) frente a los 1.4 GB de fp16 y 2.8 GB de fp32. El original de Kotoba supera a Whisper-large-v3 en japones, pero Whisper-large-v3 es multilingue. La licencia Apache 2.0 permite uso comercial sin restricciones, mientras que Whisper-large-v3 usa MIT (tambien permisiva).

## Limitaciones y advertencias

- Solo funciona en Apple Silicon (M1 o superior); no es compatible con Intel Mac, Linux con GPU NVIDIA ni Windows.
- La cuantizacion int8 introduce una degradacion de precision de menos del 1% de WER respecto a fp32, lo que puede ser relevante en audio muy ruidoso o con acentos poco comunes.
- La ventana de contexto de 30 segundos por segmento de Whisper puede requerir gestion de audio largo; la model card advierte que archivos de mas de 30 minutos necesitan bastante memoria, aunque int8 reduce el consumo.
- El modelo esta especializado en japones; su rendimiento en otros idiomas no esta documentado y probablemente sea inferior al de Whisper-large-v3.
- Riesgo de alucinaciones tipico de los modelos Whisper, especialmente en silencios o audio de baja calidad, aunque el fine-tuning japones puede mitigarlo parcialmente.
- La conversion MLX es un trabajo de la comunidad (enet45), no un lanzamiento oficial de Kotoba Technologies; no hay garantia de mantenimiento ni soporte.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la atribucion requerida y las condiciones de la licencia del modelo base.

## Enlaces

- Repositorio HuggingFace de la conversion MLX int8: https://huggingface.co/enet45/kotoba-whisper-v2.1-mlx-int8
- Modelo original kotoba-tech/kotoba-whisper-v2.1: https://huggingface.co/kotoba-tech/kotoba-whisper-v2.1
- Repositorio GitHub de kotoba-whisper: https://github.com/kotoba-tech/kotoba-whisper
- Organizacion Kotoba en GitHub: https://github.com/kotoba-tech
- Herramienta de conversion MLX (mlx-examples): https://github.com/ml-explore/mlx-examples
- Ficha del modelo en AIBase (referencia externa): https://model.aibase.com/models/details/1915693345797726209
