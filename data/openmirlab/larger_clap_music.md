# openmirlab/larger_clap_music

## Resumen

`openmirlab/larger_clap_music` es una conversion al formato `ClapModel` de Transformers del checkpoint original de CLAP (Contrastive Language-Audio Pretraining) de LAION para el dominio musical, `lukewys/laion_clap/music_audioset_epoch_15_esc_90.14.pt`. CLAP es un modelo de representacion audio-texto entrenado con un objetivo contrastivo, analogo a CLIP pero en la modalidad audio, que permite alinear embeddings de audio y de descripciones textuales en un mismo espacio vectorial. El modelo resuelve tareas de recuperacion audio-texto, clasificacion zero-shot de audio y extraccion de features para pipelines de musica.

La relevancia de esta publicacion no reside en el modelo en si, sino en la correccion de un defecto en los pesos publicados en `laion/larger_clap_music`. Segun la model card, los pesos del repositorio original no coinciden con el checkpoint de LAION: solo 20 de sus 555 tensores son correctos, ambas cabezas de proyeccion tienen sesgos a cero y pesos de escala inicial, y los parametros `logit_scale_a/t` valen aproximadamente 0,03 y -0,01. El resultado es que cualquier entrada se mapea a un vector casi identico, lo que explica las puntuaciones zero-shot de en torno a 0,5 para cualquier etiqueta reportadas en la discusion #2 del repositorio original.

Esta version es un reemplazo directo (drop-in) del modelo original: conserva sin cambios `config.json`, el preprocesador y los ficheros del tokenizer de `laion/larger_clap_music@52455da6f6b32b298341c4270923cca47c7876b3`, y solo difiere en `model.safetensors`. El modelo tiene 193.988.764 parametros y un tamano de repositorio de 0,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLAP (Contrastive Language-Audio Pretraining), `ClapModel` de Transformers; dos torres (audio y texto) con proyeccion a espacio comun |
| Parametros totales | 193.988.764 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa audio y texto; no se especifica ventana de contexto en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`); conversion desde checkpoint PyTorch `.pt` de LAION |

## Arquitectura y entrenamiento

CLAP es una arquitectura de dos torres con un objetivo de aprendizaje contrastivo audio-texto, inspirada en CLIP. Una torre procesa el audio (con un frontend STFT/mel en el checkpoint original) y otra procesa el texto; ambas proyectan a un espacio latente comun donde se calcula la similitud coseno entre pares audio-texto. El checkpoint convertido usa la implementacion `ClapModel` de Transformers, en la que la atencion de audio se divide en query/key/value y las MLP de proyeccion se mapean explicitamente. El frontend STFT/mel original, las mascaras de atencion, `tscam_conv`, `head` y los pesos `*_transform` no tienen contrapartida en `ClapModel` y no se usan en inferencia.

El checkpoint original fue entrenado por LAION y presentado en el articulo *Large-scale Contrastive Language-Audio Pretraining with Feature Fusion and Keyword-to-Caption Augmentation* (Wu, Chen, et al., ICASSP 2023). La variante `music` corresponde al checkpoint `music_audioset_epoch_15_esc_90.14.pt`, especializada en audio musical con evaluacion en ESC (Environmental Sound Classification) al 90,14 %. No se detalla en la informacion proporcionada el numero de tokens de audio, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO; CLAP se entrena con objetivo contrastivo, no con ajuste por preferencias.

La innovacion tecnica de esta publicacion es la correccion de la conversion. El script `convert_clap.py` incluido en el repositorio renombra modulos, divide el `qkv` de atencion de audio y mapea las MLP de proyeccion. El conversor se valido sobre el checkpoint general de LAION: al convertir `music_speech_audioset_epoch_15_esc_89.98.pt` se reproducen exactamente los 555 tensores de `laion/larger_clap_general@16c8cc3159a3c8a31e8ff5ef1f66b0d9ab3667db`.

## Capacidades

- Extraccion de embeddings de audio y de texto en un espacio comun (feature extraction), base para recuperacion y similitud entre modalidades.
- Clasificacion zero-shot de audio: asignar una descripcion textual a un clip sin entrenamiento especifico, mediante similitud coseno entre embeddings.
- Recuperacion audio-texto (text-to-audio y audio-to-text) en el dominio musical.
- Procesamiento de audio musical: el checkpoint esta especializado en musica (loop de piano electrico, vinilo, bombo, etc. en la verificacion de la model card).
- Generacion de texto: no es una capacidad del modelo; CLAP no es un modelo generativo.
- Tool calling / function calling: no disponible / no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales: modo thinking, vision o audio generativo no disponibles; el modelo es exclusivamente de representacion audio-texto.

## Casos de uso

- Busqueda semantica de musica por descripcion textual: indexar un catalogo calculando embeddings de audio con la torre de audio y embeddings de consultas con la torre de texto; recuperar por similitud coseno. Adecuado porque el modelo esta especializado en musica y alinea ambas modalidades en un espacio comun.
- Etiquetado automatico de bibliotecas musicales: clasificar clips contra un conjunto de etiquetas textuales (genero, instrumento, ambiente) en zero-shot, sin reentrenar. Util para catalogos grandes donde no hay anotaciones.
- Filtrado y moderacion de contenido de audio: comparar clips contra descripciones de contenido no deseado o de interes; el modelo permite puntuar similitud sin clasificador supervisado.
- Deduplicacion y similitud entre pistas: calcular embeddings de audio y agrupar pistas cercanas en el espacio latente para detectar versiones, remixes o duplicados.
- Recomendacion musical basada en contenido: usar los embeddings de audio como features para un sistema de recomendacion o para similitud entre pistas, en lugar de depender solo de metadatos.
- Investigacion en representaciones audio-texto: servir de base para experimentos de recuperacion, evaluacion de alineamiento multimodal o fine-tuning sobre dominios musicales especificos.
- Preprocesamiento para pipelines de generacion musical: usar los embeddings como condicionamiento o como metrica de evaluacion de fidelidad texto-audio en sistemas generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente una verificacion de cordura (sanity check) sobre seis clips (seno, ruido blanco, silencio, loop de piano electrico, crujido de vinilo y bombo) frente a seis descripciones, con embeddings normalizados a norma unitaria:

| Pesos | Coseno audio-audio medio (clips distintos) | Coseno texto emparejado / no emparejado | Top-1 | Coseno texto-texto medio |
|---|---|---|---|---|
| `laion/larger_clap_general` | 0,253 | 0,314 / 0,110 | 4/6 | 0,330 |
| `laion/larger_clap_music` | 0,953 | 0,009 / 0,009 | 1/6 | 0,999 |
| Este repositorio | 0,179 | 0,287 / 0,081 | 4/6 | 0,346 |

El autor indica explicitamente que esta tabla comprueba que el modelo discrimina, no es un benchmark de precision. Los valores del repositorio original (`laion/larger_clap_music`) muestran el colapso de representaciones descrito: coseno audio-audio de 0,953 y coseno texto-texto de 0,999, con Top-1 de 1/6.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Con 193.988.764 parametros, en precision completa (fp32) los pesos ocupan aproximadamente 0,78 GB; en fp16/bf16, unos 0,39 GB. A ello hay que sumar el frontend de audio y las activaciones, no cuantificadas en la informacion disponible.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo es ligero y cabe en GPUs de consumo; no se dispone de recomendaciones oficiales (A100, H100, RTX 4090 u otras) en la informacion proporcionada.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de pesos (inferior a 1 GB en fp32), aunque no se confirma en la informacion disponible.
- Opciones de despliegue: al ser un modelo de Transformers (`ClapModel`), es compatible con el ecosistema `transformers`; no se detallan en la informacion proporcionada integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos generativos, no a este tipo de encoder).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `openmirlab/larger_clap_music` (este) | 193.988.764 | no disponible | Verificacion de cordura: Top-1 4/6 en 6 clips | Apache-2.0 | Hugging Face |
| `laion/larger_clap_music` | no disponible (mismo `config.json`) | no disponible | Pesos defectuosos: Top-1 1/6, coseno texto-texto 0,999 | Apache-2.0 | Hugging Face |
| `laion/larger_clap_general` | no disponible | no disponible | Verificacion de cordura: Top-1 4/6 | Apache-2.0 | Hugging Face |

No se dispone en la informacion proporcionada de comparativas con otros modelos de representacion audio-texto (por ejemplo, variantes de CLAP de otros autores o modelos de audio encoder alternativos) con datos de parametros, contexto y rendimiento verificables.

## Limitaciones y advertencias

- El checkpoint original de LAION esta liberado bajo CC0-1.0 y `laion/larger_clap_music` bajo Apache-2.0; esta conversion se distribuye bajo Apache-2.0. Verificar la licencia aplicable antes de uso comercial.
- La model card advierte de que los pesos del repositorio original `laion/larger_clap_music` estan defectuosos (colapso de representaciones); usar ese repositorio produce puntuaciones zero-shot practicamente constantes. Esta conversion corrige ese problema, pero conviene validar sobre el dominio propio.
- La verificacion incluida es una prueba de cordura con seis clips, no una evaluacion de precision; no hay benchmarks publicados en la informacion disponible.
- Riesgo de sesgo y de alucinacion: no se documentan sesgos conocidos ni comportamiento de alucinacion en la informacion proporcionada; al ser un modelo contrastivo, no genera texto, pero sus embeddings pueden heredar sesgos del dataset de entrenamiento de LAION, no detallado aqui.
- Limitaciones de contexto o idioma: no disponibles. El modelo esta especializado en musica; su rendimiento fuera de ese dominio (habla, sonidos ambientales generales) no esta caracterizado en esta ficha.
- El frontend STFT/mel original, las mascaras de atencion, `tscam_conv`, `head` y los pesos `*_transform` no se usan en la implementacion `ClapModel`; cualquier pipeline que dependiera de esos componentes del checkpoint original no es reproducible con esta conversion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openmirlab/larger_clap_music
- Modelo base: https://huggingface.co/laion/larger_clap_music
- Checkpoint original de LAION: https://huggingface.co/lukewys/laion_clap
- Discusion sobre los pesos defectuosos: https://huggingface.co/laion/larger_clap_music/discussions/2
- Referencia del checkpoint general usado para validar el conversor: https://huggingface.co/laion/larger_clap_general
- Articulo: Wu, Chen, et al., *Large-scale Contrastive Language-Audio Pretraining with Feature Fusion and Keyword-to-Caption Augmentation*, ICASSP 2023 (enlace directo no disponible en la informacion proporcionada).
