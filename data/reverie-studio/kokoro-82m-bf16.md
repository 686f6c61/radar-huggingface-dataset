# reverie-studio/Kokoro-82M-bf16

## Resumen

Kokoro-82M-bf16 es un modelo de síntesis de voz (text-to-speech) de 82 millones de parámetros, publicado originalmente por hexgrad y distribuido aquí por mlx-community en formato bf16 para su ejecución en Apple Silicon mediante MLX. El repositorio analizado, `reverie-studio/Kokoro-82M-bf16`, es un espejo byte a byte del original, mantenido por Reverie para centralizar las descargas de su servicio Echo; no introduce cambios en pesos, configuración ni licencia.

El modelo resuelve la generación de audio hablado a partir de texto con un coste computacional muy bajo, lo que lo hace apto para inferencia en CPU y en hardware consumer. Incluye un conjunto amplio de voces preentrenadas (más de 60 ficheros de voz en formato `.pt` y `.safetensors`) que cubren variantes de inglés americano, inglés británico, español, francés, hindi, italiano, japonés, portugués y chino mandarín.

Es relevante ahora porque los TTS de menos de 100 M de parámetros con licencia Apache 2.0 permiten desplegar narración y doblaje en producción sin depender de APIs externas ni de GPUs de datacenter. La información disponible no incluye detalles sobre arquitectura interna, datos de entrenamiento ni benchmarks, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 82 M (según el nombre del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | inglés (US/GB), español, francés, hindi, italiano, japonés, portugués, chino mandarín (según el conjunto de voces incluido) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`kokoro-v1_0.safetensors`) y voces en `.pt` y `.safetensors` |

## Arquitectura y entrenamiento

No disponible. La model card del espejo no describe la arquitectura del modelo (transformer, difusión, VITS u otra), ni el volumen o composición de los datos de entrenamiento, ni si se aplicaron técnicas de alineamiento como RLHF o DPO. El repositorio solo documenta que los ficheros son idénticos al original de `mlx-community/Kokoro-82M-bf16`, con sumas de verificación en `SHA256SUMS`, y que la model card original se conserva como `ORIGINAL_README.md`.

El único dato técnico verificable en esta información es el tamaño: 82 M de parámetros y un repositorio de 0,4 GB, coherente con pesos en bf16 (2 bytes por parámetro) más el conjunto de voces. La conversión a bf16 y el empaquetado para MLX corresponden al trabajo de mlx-community, no a este espejo.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) con selección de voz entre las incluidas en el repositorio.
- Múltiples voces preentrenadas: más de 60 ficheros en `voices/`, con prefijos que indican idioma y género (por ejemplo `af_` inglés americano femenino, `bm_` inglés británico masculino, `ef_`/`em_` español, `ff_` francés, `hf_`/`hm_` hindi, `if_`/`im_` italiano, `jf_`/`jm_` japonés, `pf_`/`pm_` portugués, `zf_`/`zm_` chino).
- Generación de muestras de audio de referencia incluidas en `samples/` (`HEARME.wav` y varias muestras de la voz `af_heart`).
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: limitadas a la síntesis de voz en los idiomas cubiertos por las voces incluidas.
- Modo thinking, visión o audio de entrada: no disponible.

## Casos de uso

- Narración de artículos y boletines: el modelo convierte texto plano en audio con una voz fija seleccionada del catálogo, lo que permite generar versiones en podcast de contenido escrito con un coste de cómputo bajo y sin GPU dedicada.
- Doblaje y localización de vídeos: al disponer de voces en inglés, español, francés, italiano, portugués, japonés y chino, se puede producir una pista de voz por idioma a partir del mismo guion y mantener una identidad sonora por personaje.
- Asistentes de voz en aplicaciones móviles o de escritorio: el tamaño de 82 M de parámetros y los pesos bf16 permiten inferencia local en equipos de usuario, útil para leer notificaciones o respuestas de un asistente sin enviar texto a un servicio externo.
- Accesibilidad: lectura en voz alta de documentos, correos y páginas web para personas con discapacidad visual, con la posibilidad de elegir voces masculinas o femeninas y distintos acentos.
- Generación de audiolibros y material formativo: la licencia Apache 2.0 permite integrar el modelo en un pipeline propio de producción de audio sin restricciones de uso comercial derivadas de la licencia.
- Pruebas de integración continua de sistemas de voz: al ser un espejo con checksums, encaja como artefacto reproducible en pipelines que necesitan descargar siempre la misma versión del modelo desde un único origen.
- Prototipado de interfaces conversacionales: sirve para validar flujos de voz en demos y entornos de desarrollo antes de invertir en un TTS de mayor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 82 M de parámetros en bf16 el peso de los tensores ronda los 0,16 GB, a lo que hay que sumar el conjunto de voces y el estado del runtime.
- GPU recomendadas: no disponible. El formato bf16 de mlx-community está orientado a Apple Silicon mediante MLX; el original de hexgrad se distribuye para otros runtimes.
- GPU consumer: por el tamaño del modelo es previsible que quepa en cualquier GPU consumer reciente, pero no hay cifras publicadas en la información disponible que lo confirmen.
- Opciones de despliegue: MLX (formato de este repositorio); para otros runtimes debe consultarse el repositorio original de hexgrad, no incluido en esta información.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial: no está afiliado ni respaldado por los autores originales, y cualquier incidencia debe contrastarse con `mlx-community/Kokoro-82M-bf16` o con el repositorio de hexgrad.
- No se documentan sesgos conocidos del modelo en la información disponible; al ser un TTS, los sesgos se manifestarían en la calidad y naturalidad percibidas según acento, género o idioma de la voz elegida.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero un TTS puede producir pronunciaciones incorrectas, entonación artificial o artefactos audibles en textos con nombres propios, siglas o puntuación atípica.
- Cobertura de idiomas limitada al conjunto de voces incluido; no hay garantía de calidad uniforme entre idiomas y no se especifica el nivel de soporte de cada uno.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda conservar los ficheros de licencia originales incluidos en el repositorio y verificar la procedencia de los datos de entrenamiento antes de un despliegue en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un artefacto de infraestructura interna más que una distribución comunitaria.
- Los parámetros de arquitectura, contexto y cuantización no están documentados aquí; cualquier decisión de producción requiere consultar la model card original.

## Enlaces

- Repositorio analizado: https://huggingface.co/reverie-studio/Kokoro-82M-bf16
- Modelo base (MLX): https://huggingface.co/mlx-community/Kokoro-82M-bf16
- Model card original conservada en el repositorio: `ORIGINAL_README.md`
- Listado de voces: `VOICES.md`
- Muestras de audio: `SAMPLES.md` y directorio `samples/`
- Sumas de verificación: `SHA256SUMS`
