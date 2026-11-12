# mlx-community/stable-audio-3-medium

## Resumen

Stable Audio 3 medium es un modelo de generacion de audio a partir de texto desarrollado por Stability AI, distribuido aqui en formato MLX por la comunidad mlx-community para su uso en hardware Apple Silicon a traves de la libreria mlx-audio. Genera musica estereo a 44,1 kHz y efectos de sonido a partir de una descripcion textual, con una duracion maxima de 380 segundos por generacion. El modelo combina un codificador de texto T5Gemma, un transformer de difusion de 24 capas y el decodificador SAME-L.

La version publicada en este repositorio es una conversion del export MLX de `stabilityai/stable-audio-3-optimized`, con la configuracion y el codificador de texto tomados de `stabilityai/stable-audio-3-medium-base`. El transformer de difusion se almacena en float16 y el decodificador en float32, lo que explica el tamano del repositorio de 5,8 GB frente a los aproximadamente 1.879 millones de parametros declarados en los safetensors.

Su relevancia es doble: por un lado, acerca la generacion de audio de alta fidelidad a equipos locales con chip Apple (M1/M2/M3/M4) sin depender de servicios en la nube; por otro, su licencia Community de Stability AI impone condiciones especificas para uso comercial y obliga a mantener la atribucion "Powered by Stability AI". El soporte de este modelo en mlx-audio estaba en revision en el momento de la publicacion y se distribuye en la siguiente version de la libreria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (24 capas) + codificador de texto T5Gemma + decodificador SAME-L |
| Parametros totales | 1.879.430.721 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (duracion maxima de generacion: 380 s) |
| Tipos de cuantizacion | float16 (transformer de difusion) y float32 (decodificador); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (prompts en lenguaje natural; la model card no detalla cobertura linguistica) |
| Licencia | Stability AI Community License (`stable-audio-community`); el codificador T5Gemma se rige por Gemma Terms of Use |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de difusion condicionada por texto. El prompt se procesa con un codificador T5Gemma; la representacion resultante condiciona un transformer de difusion de 24 capas que se muestrea en 8 pasos "ping-pong" (`steps=8` por defecto). La salida latente se decodifica con SAME-L para producir audio estereo a 44,1 kHz. La configuracion de inferencia incluye `cfg-scale` con valor por defecto 1 (guidance desactivado); al aumentarlo se habilita el uso de `negative-prompt`, a costa de duplicar las llamadas al modelo por paso.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card unicamente documenta el proceso de conversion a MLX: pesos tomados del export de `stabilityai/stable-audio-3-optimized` (revision `30cb2644da54bfa63275d1bc7f1fa67fc718680f`), con `model_config.json` y el codificador de texto procedentes de `stabilityai/stable-audio-3-medium-base`. El script de conversion es `mlx_audio/music/models/stable_audio_3/convert.py`, incluido en mlx-audio con soporte para la variante medium.

## Capacidades

- Generacion de musica a partir de descripciones textuales detalladas (genero, instrumentacion, tempo, ambiente).
- Generacion de efectos de sonido (sound effects) condicionados por prompt.
- Audio estereo a 44,1 kHz, calidad adecuada para produccion musical y audiovisual.
- Generaciones de hasta 380 segundos de duracion en una sola pasada.
- Control de semilla (`--seed`) para reproducibilidad de las generaciones.
- Control de duracion (`--duration`) y numero de pasos de muestreo (`--steps`).
- Guidance classifier-free opcional mediante `cfg-scale` y `negative-prompt`.
- Inferencia local en Apple Silicon a traves de MLX (libreria mlx-audio).
- No se documentan capacidades de edicion de audio, inpainting, continuacion de audio existente ni control por referencia melódica.

## Casos de uso

- Produccion musical de maquetas: generar bases instrumentales de hasta varios minutos con un prompt que especifique genero, BPM e instrumentacion, como en el ejemplo de la model card (lofi hip hop a 85 BPM con Rhodes y bajo profundo). Es adecuado porque el modelo mantiene coherencia estereo a 44,1 kHz durante toda la duracion.
- Diseno de sonido para videojuegos: crear efectos de sonido especificos (impactos, ambientes, UI) de forma iterativa con semilla fija para explorar variantes sin salir del equipo local.
- Postproduccion audiovisual: generar ambientes y colchones musicales de hasta 380 s que cubran secuencias completas sin necesidad de bucles ni empalmes.
- Prototipado rapido en estudios pequenos: sustituir sesiones de busqueda en librerias de stock por generacion bajo demanda, reduciendo costes de licencia de samples.
- Investigacion en generacion de audio: servir como referencia reproducible en MLX para experimentos de difusion aplicada a audio en hardware Apple, con control fino de pasos, semilla y guidance.
- Herramientas creativas para no musicos: integrar el modelo en una app de escritorio para Mac que traduzca descripciones en lenguaje natural a pistas de audio completas.
- Contenido para podcast y streaming: generar sintonias, cortinillas y transiciones musicales con duraciones ajustadas al formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 5,8 GB; el transformer de difusion esta en float16 y el decodificador en float32, por lo que la memoria unificada necesaria para cargar el modelo completo ronda los 6-8 GB, sin contar activaciones ni buffers de audio.
- Requiere hardware Apple Silicon con MLX; no esta pensado para GPU NVIDIA ni para CPU generica.
- Equipos viables: Mac con chip M1 o superior con al menos 16 GB de memoria unificada; se recomienda 24-32 GB para generaciones largas (hasta 380 s) y para usar `cfg-scale` con negative prompt, que duplica las llamadas por paso.
- No cabe en GPUs de consumo tipo RTX 4090 mediante este repositorio, ya que los pesos estan en formato MLX; para esas GPUs habria que recurrir al modelo base de Stability AI en su formato original.
- Despliegue: `pip install -U mlx-audio` y uso via CLI (`python -m mlx_audio.music.generate`) o API Python (`mlx_audio.music.load`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. El muestreo por defecto es de 8 pasos; aumentar `steps` o activar guidance incrementa proporcionalmente el coste.

## Comparativa con modelos similares

| Modelo | Parametros | Duracion maxima | Frecuencia de muestreo | Formato / runtime | Licencia |
|---|---|---|---|---|---|
| stable-audio-3-medium (MLX, este repo) | 1.879 M | 380 s | 44,1 kHz estereo | MLX / mlx-audio | Stability AI Community |
| stabilityai/stable-audio-3-medium-base | no disponible | no disponible | no disponible | pesos originales (no MLX) | Stability AI Community |
| stabilityai/stable-audio-3-optimized | no disponible | no disponible | no disponible | export MLX de origen | Stability AI Community |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las variantes base y optimized en la informacion proporcionada, por lo que no es posible comparar rendimiento numerico entre ellas.

## Limitaciones y advertencias

- La licencia Stability AI Community impone condiciones para uso comercial; es necesario revisar `LICENSE.md` antes de desplegar en produccion.
- Obligacion de mantener la atribucion en `NOTICE` y mostrar "Powered by Stability AI" en cualquier distribucion o trabajo derivado.
- El codificador de texto T5Gemma se rige por los Gemma Terms of Use, incluida la seccion 3.2 y la Gemma Prohibited Use Policy; estas restricciones se suman a las de Stability AI.
- Uso sujeto a la politica de uso aceptable de Stability AI.
- El soporte en mlx-audio estaba en revision al publicarse el repositorio; la API puede cambiar en la siguiente release.
- Solo funciona en hardware Apple Silicon via MLX; no hay soporte documentado para CUDA, ROCm ni CPU.
- No se documenta cobertura de idiomas para los prompts; no hay garantia de calidad fuera del ingles.
- Riesgo de alucinacion sonora: el modelo puede generar audio incoherente o artefactos en generaciones largas; no se documentan tasas de fallo.
- No se dispone de informacion sobre sesgos en los datos de entrenamiento ni sobre evaluaciones de calidad subjetiva (MOS).
- Duplicar llamadas al modelo al activar `cfg-scale` > 1 puede hacer inviable la generacion de 380 s en equipos con memoria unificada limitada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre esta conversion concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlx-community/stable-audio-3-medium
- Modelo base: https://huggingface.co/stabilityai/stable-audio-3-medium
- Export MLX de origen: https://huggingface.co/stabilityai/stable-audio-3-optimized
- Configuracion y codificador de texto: https://huggingface.co/stabilityai/stable-audio-3-medium-base
- Libreria mlx-audio: https://github.com/Blaizzy/mlx-audio
- Licencia Stability AI Community: `LICENSE.md` en el repositorio
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
