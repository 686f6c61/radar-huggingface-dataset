# bihungba1101/MOSS-Audio-4B-Instruct-NVFP4

## Resumen

MOSS-Audio-4B-Instruct-NVFP4 es una cuantizacion NVFP4 W4A4 del modelo multimodal de comprension de audio MOSS-Audio-4B-Instruct, desarrollado por OpenMOSS-Team en colaboracion con MOSI.AI y el Shanghai Innovation Institute. Esta version cuantizada ha sido producida por el usuario bihungba1101 con la libreria `llm-compressor` sobre una NVIDIA RTX 5090, y esta pensada para reducir el consumo de VRAM y acelerar la inferencia en hardware consumer sin renunciar a las capacidades del modelo original.

El modelo base es un sistema de comprension de audio unificada que procesa habla, sonidos ambientales y musica, con soporte para transcripcion con marcas temporales, analisis de hablante y emociones, respuesta a preguntas sobre audio y razonamiento temporal. La version cuantizada mantiene el encoder de audio, los adaptadores, las embeddings y la proyeccion de salida en BF16, mientras que las 252 capas lineales del modelo de lenguaje se convierten a NVFP4, lo que reduce el tamano total del repositorio a 5,2 GB con 3.633.245.560 parametros.

Esta cuantizacion resulta relevante porque permite ejecutar un modelo de audio multimodal de 4B en GPUs de gama media con 8-12 GB de VRAM, y ha sido validada con vLLM 0.28.0 en una RTX 5090, incluyendo peticiones OpenAI-compatibles con clips de audio de hasta 48 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal de audio: encoder de audio + adaptadores + modelo de lenguaje de 4B (arquitectura exacta del LM no especificada) |
| Parametros totales | 3.633.245.560 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo de vLLM usa `--max-model-len 2048`) |
| Tipos de cuantizacion | NVFP4 W4A4 (capas lineales del LM); encoder de audio, adaptadores, embeddings y `lm_head` en BF16 |
| Idiomas soportados | No disponible (el modelo base no publica lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `custom_code` para arquitectura personalizada) |

## Arquitectura y entrenamiento

El modelo base MOSS-Audio-4B-Instruct es un sistema de comprension de audio unificada que combina un encoder de audio con un modelo de lenguaje de 4B parametros. Segun la documentacion del equipo OpenMOSS, el modelo realiza modelado unificado sobre audio del mundo real, integrando comprension de habla, sonidos ambientales, musica, captioning de audio, QA con dependencia temporal y razonamiento complejo de multiples pasos. No se han publicado detalles sobre la arquitectura interna del encoder ni sobre el dataset de entrenamiento del modelo base.

La version NVFP4 aqui descrita es una cuantizacion posterior, no un entrenamiento desde cero. El proceso de calibracion utilizo 24 muestras con forma de despliegue: 12 conversaciones de `HuggingFaceH4/ultrachat_200k`, 6 preguntas de razonamiento de `cais/mmlu` y 6 clips de habla real estratificados por longitud de `bihungba1101/speech_attempt_raw` (limitados a 30 segundos). Esto supone un 75% de texto de instruccion/razonamiento general y un 25% de audio real. La procedencia exacta queda registrada en `calibration.json` y la receta aplicada en `recipe.yaml`. Las capas cuantizadas son exclusivamente las 252 capas `Linear` del modelo de lenguaje; el front-end multimodal y la proyeccion de salida se mantienen en BF16 para preservar la calidad de la representacion de audio.

## Capacidades

- Comprension de audio unificada: habla, sonidos ambientales y musica en un unico modelo.
- Transcripcion de habla con marcas temporales (segun la ficha del modelo base en aimodels.fyi).
- Analisis de hablante y emociones: identificacion de quien habla y deteccion de estado emocional.
- Respuesta a preguntas sobre audio (audio QA), incluyendo preguntas con dependencia temporal.
- Generacion de descripciones de audio (audio captioning).
- Razonamiento complejo de multiples pasos sobre contenido auditivo.
- Soporte multimodal en chat: el modelo acepta entradas mixtas de audio y texto en una misma conversacion.
- No se menciona soporte de tool calling ni function calling en la informacion disponible.

## Casos de uso

- Transcripcion de reuniones y entrevistas: el modelo puede transcribir audio con marcas temporales y distinguir hablantes, lo que facilita la generacion de actas y busquedas posteriores en el contenido.
- Analisis de llamadas de atencion al cliente: permite detectar emociones del interlocutor y evaluar la calidad de la interaccion, integrable en sistemas de CRM para metricas de satisfaccion.
- Moderacion de contenido de audio en plataformas sociales: clasifica sonidos ambientales, musica y habla para detectar contenido inapropiado o infracciones de derechos de autor.
- Asistentes de voz para personas con discapacidad auditiva: el modelo puede describir sonidos ambientales (alarmas, timbres, mascotas) y transcribir conversaciones en tiempo real.
- Educacion de idiomas: analiza la pronunciacion y fluidez de estudiantes a partir de grabaciones, aunque el propio autor advierte que para puntuaciones numericas calibradas es necesario un fine-tuning especifico.
- Analisis de audio ambiental en domotica: interpreta sonidos del hogar (cristales rotos, humo, llanto) y genera alertas contextuales en sistemas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta version cuantizada NVFP4. El modelo base MOSS-Audio-4B-Instruct no tiene resultados publicados en la informacion disponible; el equipo OpenMOSS reporta que la variante MOSS-Audio-8B-Thinking alcanza una precision media de 70,80 en benchmarks de comprension de audio general, superando a todos los modelos open source comparados, y que las variantes Instruct lideran en 11 de los benchmarks de captioning de habla evaluados. Sin embargo, estos datos corresponden a otras variantes y no pueden extrapolarse a esta cuantizacion.

## Requisitos de hardware

- Tamano del repositorio: 5,2 GB en safetensors, lo que sugiere un uso de VRAM aproximado de 5-6 GB en inferencia con cuantizacion NVFP4.
- GPU validada: NVIDIA RTX 5090 (32 GB VRAM) con CUDA 13.0 y vLLM 0.28.0.
- Compatible con GPUs consumer de gama media: una RTX 4060 Ti de 16 GB o una RTX 4070 de 12 GB deberian ser suficientes para ejecutar el modelo con contexto corto (2048 tokens).
- No se recomienda su uso en GPUs sin soporte para NVFP4 (arquitecturas anteriores a Ampere o GPUs de AMD/Intel).
- Despliegue recomendado: vLLM con `--trust-remote-code` y `--limit-mm-per-prompt '{"audio": 1}'`. Tambien es posible usar transformers con `custom_code`.
- Se requiere que el compilador de CUDA, CRT, NVVM y runtime compartan la misma version menor (validado con CUDA 13.0.88).
- No hay datos publicados de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Audio-4B-Instruct (base) | 4B (3.633M) | No disponible | BF16 | Apache-2.0 | HuggingFace |
| MOSS-Audio-4B-Instruct-NVFP4 (este) | 3.633M | No disponible (2048 en ejemplo) | NVFP4 W4A4 | Apache-2.0 | HuggingFace |
| MOSS-Audio-8B-Thinking | 8B | No disponible | BF16 | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes. El modelo base de 4B es la opcion de menor tamano de la familia MOSS-Audio, mientras que la variante de 8B con modo thinking reporta mejores resultados en benchmarks de comprension de audio general. La cuantizacion NVFP4 aqui descrita es una optimizacion para despliegue en hardware limitado, no una variante con capacidades diferentes.

## Limitaciones y advertencias

- El modelo base no esta entrenado para emitir puntuaciones calibradas de pronunciacion, fluidez o prosodia. Para obtener metricas numericas fiables es necesario un fine-tuning sobre datos etiquetados de calidad de habla y validacion contra evaluaciones humanas.
- La cuantizacion NVFP4 puede introducir degradacion en tareas de razonamiento complejo o en la comprension de audio con mucho ruido de fondo, aunque no se han publicado evaluaciones cuantitativas al respecto.
- El modelo solo acepta un clip de audio por peticion (`--limit-mm-per-prompt '{"audio": 1}'`), lo que limita su uso en escenarios que requieran comparar multiples audios en una sola llamada.
- La longitud de contexto esta limitada a 2048 tokens en el ejemplo de despliegue, lo que puede restringir conversaciones largas o analisis de audio extenso.
- Requiere CUDA 13 y una GPU compatible con NVFP4; no funcionara en hardware antiguo ni en entornos sin soporte de `compressed-tensors`.
- La licencia Apache-2.0 permite uso comercial, pero el autor de la cuantizacion no es el equipo original de OpenMOSS, por lo que se recomienda verificar la procedencia de los pesos y la reproducibilidad del proceso de calibracion.
- No se han publicado evaluaciones de sesgos ni de alucinacion para esta variante cuantizada.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/bihungba1101/MOSS-Audio-4B-Instruct-NVFP4
- Modelo base en HuggingFace: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-4B-Instruct
- Repositorio GitHub de MOSS-Audio: https://github.com/OpenMOSS/MOSS-Audio
- Pagina oficial del proyecto: https://openmoss.ai/MOSS-Audio/
- Ficha del modelo base en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/moss-audio-4b-instruct-openmoss-team
