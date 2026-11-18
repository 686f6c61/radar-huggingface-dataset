# Comfy-Org/stable-audio-3

## Resumen

Stable Audio 3 es una familia de modelos de generacion de audio mediante difusion desarrollada por Stability AI y reempaquetada por Comfy-Org para su uso directo en ComfyUI. Este repositorio no contiene el modelo original, sino una conversion a ficheros unicos en formato `safetensors` de los seis pesos publicados por Stability AI: las variantes `medium`, `small-music` y `small-sfx`, cada una en version base y versión ajustada. El objetivo es facilitar la integracion en flujos de trabajo de ComfyUI sin depender de la libreria de difusion original.

El modelo resuelve la generacion de audio condicionada por texto: musica, efectos de sonido y audio general a partir de descripciones en lenguaje natural. La variante `medium` actua como modelo de proposito general, mientras que las variantes `small` estan especializadas por dominio (musica y efectos de sonido), lo que permite elegir entre calidad y eficiencia segun la tarea.

La relevancia actual del repositorio radica en su adopcion: supera las 244.000 descargas y esta mantenido por Comfy-Org, el equipo detras de ComfyUI, lo que garantiza compatibilidad con los flujos de trabajo oficiales. La licencia `stable-audio-community` condiciona el uso comercial y debe revisarse antes de desplegar en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusion (modelo de audio generativo); detalles de la red no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en `safetensors` de precision completa) |
| Idiomas soportados | no disponible (condicionamiento por texto via codificador T5Gemma) |
| Licencia | stable-audio-community (licencia `other`, enlazada a los terminos de Stable Audio Open 1.0) |
| Formato de pesos | `safetensors` (fichero unico por variante) |

Variantes incluidas en el repositorio:

| Fichero | Modelo base | Enfoque |
|---|---|---|
| `stable_audio_3_medium.safetensors` | stabilityai/stable-audio-3-medium | proposito general |
| `stable_audio_3_medium_base.safetensors` | stabilityai/stable-audio-3-medium-base | proposito general (base) |
| `stable_audio_3_small_music.safetensors` | stabilityai/stable-audio-3-small-music | musica |
| `stable_audio_3_small_music_base.safetensors` | stabilityai/stable-audio-3-small-music-base | musica (base) |
| `stable_audio_3_small_sfx.safetensors` | stabilityai/stable-audio-3-small-sfx | efectos de sonido |
| `stable_audio_3_small_sfx_base.safetensors` | stabilityai/stable-audio-3-small-sfx-base | efectos de sonido (base) |

Codificador de texto requerido: `t5gemma_b_b_ul2.safetensors`, ubicado en `ComfyUI/models/text_encoders/`.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de la red de difusion (numero de bloques, dimension del latente de audio, tipo de sampler o mecanismo de atencion). Lo que si se puede afirmar es que se trata de un modelo de difusion condicionado por texto, con un codificador de texto basado en T5Gemma (variante `b_b_ul2`), lo que vincula el condicionamiento textual a la familia Gemma de Google. El repositorio de Comfy-Org es un reempaquetado: no documenta el proceso de entrenamiento, el volumen de datos, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La estructura de la familia sugiere una estrategia de especializacion: un modelo `medium` de proposito general y dos modelos `small` entrenados o ajustados para musica y efectos de sonido respectivamente. Cada variante se ofrece en version base y version final, un patron habitual en modelos de difusion donde la version base sirve como punto de partida para ajuste fino o para control mas directo del proceso de muestreo. No se dispone de informacion sobre innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal u otras).

## Capacidades

- Generacion de audio condicionada por texto: musica, efectos de sonido y audio general a partir de descripciones en lenguaje natural.
- Especializacion por dominio: las variantes `small-music` y `small-sfx` estan orientadas a musica y a efectos de sonido respectivamente, mientras que `medium` cubre proposito general.
- Condicionamiento textual mediante codificador T5Gemma, lo que permite prompts descriptivos en lenguaje natural.
- Integracion nativa con ComfyUI mediante flujos de trabajo oficiales (nodos de audio y checkpoints).
- Versiones base disponibles para ajuste fino o control avanzado del muestreo.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: no documentadas; dependen del codificador de texto T5Gemma.
- Capacidades de vision o audio de entrada: no disponibles.

## Casos de uso

- Produccion musical asistida: generar loops, ambientes o fragmentos musicales a partir de descripciones textuales usando `small-music`, adecuado por su especializacion y menor coste computacional que `medium`.
- Diseno de efectos de sonido para videojuegos: crear impactos, ambientes y efectos puntuales con `small-sfx`, que permite iterar rapidamente sobre variaciones sin salir de ComfyUI.
- Prototipado de bandas sonoras para audiovisual: usar `medium` para generar piezas de proposito general que sirvan como maqueta antes de la produccion final.
- Generacion de contenido para podcasts y locucion: crear camas musicales y efectos de transicion integrados en un pipeline de edicion automatizado.
- Ajuste fino sobre dominio propio: partir de las versiones `base` para entrenar estilos musicales o bancos de efectos especificos con datos propios.
- Creacion de assets en pipelines de ComfyUI: encadenar la generacion de audio con otros nodos (generacion de video, imagen) para producir contenido multimodal de forma automatizada.
- Investigacion en generacion de audio: comparar el comportamiento de las variantes `medium` y `small` bajo el mismo prompt para estudiar el efecto del tamano y la especializacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada; el repositorio completo ocupa 32,6 GB, pero cada fichero individual es mucho menor y debe cargarse por separado.
- GPU recomendadas: no disponibles. Al tratarse de modelos de difusion de audio, se espera que las variantes `small` quepan en GPU de consumo y que `medium` requiera GPU de gama alta o profesional, pero no hay datos confirmados.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamano de cada variante.
- Opciones de despliegue: ComfyUI (soporte oficial mediante los flujos de trabajo del repositorio). Otros entornos (vLLM, llama.cpp, Ollama, TGI) no son aplicables a modelos de difusion de audio y no estan documentados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Desarrollador | Tipo | Variantes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stable Audio 3 (este repo) | Stability AI / reempaquetado por Comfy-Org | difusion de audio | medium, small-music, small-sfx (base y final) | stable-audio-community | Hugging Face, ComfyUI |
| Stable Audio Open 1.0 | Stability AI | difusion de audio | unica | stable-audio-community | Hugging Face |
| Alternativas de generacion de audio open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio es un reempaquetado para ComfyUI; no incluye la model card tecnica original ni detalles de entrenamiento, por lo que la evaluacion rigurosa requiere consultar los repositorios de Stability AI.
- Licencia `stable-audio-community`: restringe el uso comercial. Es imprescindible revisar los terminos enlazados antes de cualquier despliegue en produccion.
- Riesgo de alucinacion y artefactos: como todo modelo generativo de audio, puede producir resultados incoherentes, ruido o audio que no se ajusta al prompt.
- Sesgos: no documentados en la informacion disponible; los sesgos del codificador de texto T5Gemma pueden propagarse al audio generado.
- Cobertura idiomatica: no documentada; el rendimiento con prompts en castellano no esta verificado.
- Requiere descargar y colocar manualmente los ficheros en las rutas exactas de ComfyUI (`models/checkpoints/` y `models/text_encoders/`); una ubicacion incorrecta impide la carga.
- El codificador de texto `t5gemma_b_b_ul2.safetensors` es obligatorio y no se incluye en el listado de checkpoints; debe descargarse por separado.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento textual.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/stable-audio-3
- Modelo original medium: https://huggingface.co/stabilityai/stable-audio-3-medium
- Modelo original medium base: https://huggingface.co/stabilityai/stable-audio-3-medium-base
- Modelo original small music: https://huggingface.co/stabilityai/stable-audio-3-small-music
- Modelo original small music base: https://huggingface.co/stabilityai/stable-audio-3-small-music-base
- Modelo original small sfx: https://huggingface.co/stabilityai/stable-audio-3-small-sfx
- Modelo original small sfx base: https://huggingface.co/stabilityai/stable-audio-3-small-sfx-base
- Licencia stable-audio-community: https://huggingface.co/stabilityai/stable-audio-open-1.0/blob/main/LICENSE.md
- ComfyUI (repositorio): https://github.com/Comfy-Org/ComfyUI
- Flujo de trabajo Stable Audio 3.0 Medium Base: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/audio_stable_audio_3_medium_base.json
- Flujo de trabajo Stable Audio 3.0 Medium: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/audio_stable_audio_3_medium.json
