# Nuttyman/whisper-tiny_to_korean_accent_oct31_2ndrun

## Resumen

`Nuttyman/whisper-tiny_to_korean_accent_oct31_2ndrun` es un ajuste fino (fine-tuning) del modelo `openai/whisper-tiny` de OpenAI, publicado por el usuario Nuttyman en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) derivado de la arquitectura Whisper, la familia de modelos encoder-decoder basados en transformer que OpenAI diseno para transcripcion multilingue y traduccion de voz. El modelo base `whisper-tiny` es la variante mas pequena de la familia, con aproximadamente 37,7 millones de parametros, lo que lo situa en el rango de modelos ligeros aptos para dispositivos con recursos limitados.

El nombre del repositorio sugiere un ajuste orientado a acentos coreanos sobre un conjunto de datos denominado `Russian_english`, aunque la model card declara unicamente el idioma ingles (`en`) y no documenta el contenido real del dataset ni la metodologia de seleccion de muestras. El autor no ha completado las secciones de descripcion del modelo, usos previstos ni datos de entrenamiento, que aparecen como "More information needed". El modelo declara un WER de 10,0732 sobre el split de test del dataset `Russian_english`, un valor que debe interpretarse con cautela dada la ausencia de documentacion sobre el corpus de evaluacion.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un ejemplo de fine-tuning comunitario de bajo coste sobre un modelo base abierto, con licencia Apache 2.0, que puede servir como referencia para experimentos de adaptacion de Whisper a dominios o acentos especificos. No obstante, la falta de documentacion y la magnitud del error reportado lo hacen inadecuado para uso en produccion sin una evaluacion independiente previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (Whisper opera sobre ventanas de audio de 30 s) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el modelo base Whisper admite cuantizacion a int8 y formatos GGUF, pero el autor no lo documenta) |
| Idiomas soportados | Ingles (`en`) segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 0,6 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de OpenAI: un transformer encoder-decoder que procesa espectrogramas Mel de audio de 30 segundos y genera tokens de texto de forma autorregresiva. La variante `tiny` cuenta con 4 capas de encoder y 4 de decoder, 384 dimensiones de modelo y 6 cabezas de atencion, lo que resulta en los 37,7 millones de parametros reportados. El modelo base fue entrenado por OpenAI sobre 680.000 horas de audio supervisado debilmente y 1.500 horas de audio etiquetado con alta calidad, con capacidad multilingue original.

El ajuste fino realizado por Nuttyman emplea el optimizador AdamW con betas (0,9; 0,999), epsilon 1e-8, learning rate de 1e-5, scheduler lineal con 500 pasos de warmup, batch de entrenamiento de 2 y batch de evaluacion de 1, semilla 42 y 4.000 pasos totales. Segun la tabla de resultados del entrenamiento, la perdida de validacion se mantuvo en torno a 0,20-0,22 durante las cuatro epocas, con un WER que oscilo entre 9,44 (epoca 2) y 10,17 (epoca 1). No se documenta el numero de tokens de audio, la composicion del dataset `Russian_english` ni si se aplicaron tecnicas de RLHF, DPO o aumento de datos. El nombre del repositorio menciona "korean accent", pero la model card no describe ningun procedimiento especifico de adaptacion a acento coreano ni incluye muestras de audio de dicho acento.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en ingles, segun la declaracion de la model card.
- Generacion de transcripciones sobre ventanas de audio de hasta 30 segundos, heredadas de la arquitectura Whisper.
- Capacidad potencial de traduccion voz-a-texto y deteccion de idioma, heredadas del modelo base, aunque no verificadas en este ajuste.
- Soporte de timestamps a nivel de palabra y de segmento mediante los mecanismos nativos de Whisper (no documentado por el autor).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; Whisper es un modelo puramente ASR.
- No se documentan capacidades multimodales mas alla del audio (sin vision ni audio generativo).
- No se documenta modo "thinking" ni capacidades de instruccion conversacional.

## Casos de uso

- Transcripcion de reuniones en ingles: el modelo puede transcribir audio de reuniones dividido en segmentos de 30 segundos, adecuado para prototipos y pruebas de concepto dado su bajo coste computacional.
- Subtitulado automatico de videos cortos: util para generar subtitulos en ingles en pipelines ligeros donde no se requiere precision maxima y se prioriza la velocidad de inferencia.
- Preprocesamiento de audio para busqueda: transcripcion de archivos de audio para indexacion y busqueda textual en archivos personales o corporativos de bajo volumen.
- Evaluacion de tecnicas de adaptacion a acento: el modelo sirve como caso de estudio para investigar como el fine-tuning de Whisper-tiny afecta al WER en dominios especificos, aunque los resultados reportados no son concluyentes.
- Experimentacion academica con modelos ASR ligeros: apropiado para laboratorios que necesitan un modelo de menos de 40 millones de parametros para pruebas de concepto en entornos con GPU de gama baja.
- Prototipado de asistentes de voz en ingles: puede integrarse en demos de asistentes de voz donde la latencia y el coste importan mas que la precision, siempre con validacion previa del WER en el dominio objetivo.
- Base para nuevos ajustes finos: al estar bajo licencia Apache 2.0 y ser un modelo pequeno, puede servir como punto de partida para fine-tunings posteriores en otros acentos o dominios.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model card, no verificados de forma independiente (`verified: false`):

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| WER | Russian_english | test | 10,0732 |
| Loss (validacion) | Russian_english | test | 0,2069 |

Evolucion durante el entrenamiento segun la model card:

| Epoca | Paso | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 1,0173 | 1000 | 0,1750 | 0,2188 | 10,1707 |
| 2,0346 | 2000 | 0,0432 | 0,2023 | 9,4390 |
| 3,0519 | 3000 | 0,0193 | 0,2065 | 9,9268 |
| 4,0692 | 4000 | 0,0195 | 0,2069 | 10,0732 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos similares por parte del autor.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 150 MB para los pesos, mas overhead de activaciones y buffers de audio; en la practica, menos de 1 GB en la mayoria de frameworks.
- VRAM estimada en fp16: alrededor de 75-100 MB para los pesos, con overhead adicional segun el batch y la longitud de audio.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una GTX 1650, RTX 3060, RTX 4090 o incluso en CPU para inferencia en tiempo casi real con audio corto.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, y tambien en CPU con `transformers` o `whisper.cpp`.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), `whisper.cpp` (previa conversion a GGUF), `faster-whisper` (CTranslate2, previa conversion), `Ollama` (si se genera el Modelfile correspondiente), `TGI` (soporte limitado para Whisper) y `vLLM` (soporte experimental para modelos de audio).
- Latencia y throughput: no disponibles en la informacion proporcionada; para un modelo de 37,7 millones de parametros se espera una latencia inferior a un segundo por ventana de 30 segundos en GPU moderna, pero no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | WER reportado | Disponibilidad |
|---|---|---|---|---|---|---|
| `Nuttyman/whisper-tiny_to_korean_accent_oct31_2ndrun` | 37,7 M | 30 s | en (declarado) | Apache 2.0 | 10,07 (Russian_english, no verificado) | Hugging Face |
| `openai/whisper-tiny` | 39 M | 30 s | Multilingue (99 idiomas) | Apache 2.0 | No disponible en esta ficha | Hugging Face, OpenAI |
| `openai/whisper-base` | 74 M | 30 s | Multilingue (99 idiomas) | Apache 2.0 | No disponible en esta ficha | Hugging Face, OpenAI |
| `openai/whisper-small` | 244 M | 30 s | Multilingue (99 idiomas) | Apache 2.0 | No disponible en esta ficha | Hugging Face, OpenAI |

La comparacion con `whisper-tiny` original es la mas directa: el ajuste fino anade especializacion potencial pero reduce la cobertura idiomatica declarada a ingles y carece de documentacion sobre el corpus. Los modelos `base` y `small` ofrecen mayor capacidad a cambio de mas recursos. No se dispone de datos de benchmarks comparativos publicados por el autor para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- La model card esta incompleta: las secciones de descripcion, usos previstos y datos de entrenamiento indican "More information needed", lo que impide evaluar la idoneidad del modelo.
- El WER de 10,07 esta declarado como no verificado (`verified: false`) y se calcula sobre un dataset (`Russian_english`) cuya composicion, tamano y calidad no se documentan.
- El nombre del repositorio menciona "korean accent" pero la model card declara unicamente ingles y no describe ningun procedimiento de adaptacion a acento coreano; existe una discrepancia no resuelta entre el nombre y la documentacion.
- Riesgo de alucinacion en transcripciones: como todos los modelos Whisper, puede generar texto plausible pero incorrecto en segmentos de audio ruidosos, silenciosos o con habla solapada.
- Limitacion de contexto de audio: la arquitectura Whisper procesa ventanas de 30 segundos; audios mas largos requieren segmentacion manual o mediante pipeline, con riesgo de cortes en fronteras de frase.
- Cobertura idiomatica reducida: aunque el modelo base es multilingue, el ajuste declara solo ingles, por lo que su comportamiento en otros idiomas es incierto y no documentado.
- Sesgos potenciales: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos demograficos, de acento o de dominio; el nombre sugiere un sesgo hacia acentos coreanos que no se ha verificado.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre el dataset de entrenamiento impide descartar problemas de licencia en los datos subyacentes.
- No apto para produccion sin evaluacion previa: la falta de benchmarks independientes, la magnitud del WER y la documentacion incompleta desaconsejan su despliegue en entornos criticos.
- Fecha de creacion inusual (2026-10-31) que puede indicar un error en los metadatos o una publicacion programada; conviene verificar la integridad del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nuttyman/whisper-tiny_to_korean_accent_oct31_2ndrun
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Implementacion whisper.cpp: https://github.com/ggerganov/whisper.cpp
- faster-whisper (CTranslate2): https://github.com/SYSTRAN/faster-whisper
- Documentacion de Transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
- Dataset `Russian_english`: no disponible en la informacion proporcionada (no se ha encontrado enlace publico)
