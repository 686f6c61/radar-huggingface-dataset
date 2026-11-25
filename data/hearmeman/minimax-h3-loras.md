# Hearmeman/minimax-h3-loras

## Resumen

`Hearmeman/minimax-h3-loras` es una colección de adaptadores LoRA para el modelo base `MiniMaxAI/MiniMax-H3`, un generador de vídeo texto-a-vídeo e imagen-a-vídeo. El autor, Hearmeman (HearmemanAI), publica estos pesos como espejo de sus publicaciones en CivitAI, con el objetivo de permitir la descarga directa mediante URL `resolve` sin necesidad de cuenta en dicha plataforma. El repositorio no contiene un modelo completo, sino un conjunto de adaptadores de bajo rango que se aplican sobre el modelo base para especializarlo.

Los adaptadores se dividen en dos categorías funcionales: adaptadores de anatomía, entrenados sobre imágenes fijas, que enseñan al modelo el aspecto de determinadas partes del cuerpo; y adaptadores de acción, entrenados sobre vídeo, que modelan movimientos y dinámicas concretas. Están diseñados para apilarse entre sí y por debajo de otros LoRA de personaje o escena, de modo que se combinan de forma modular. La temática es explícitamente para adultos (etiqueta `not-for-all-audiences` y `nsfw`).

El interés técnico del repositorio reside en su valor como ejemplo de flujo de trabajo LoRA sobre un modelo de vídeo: pesos de 78 MB a 626 MB por adaptador, disparadores textuales documentados, rangos de fuerza recomendados y verificación de integridad mediante SHA-256 contra las versiones publicadas en CivitAI. El tamaño total del repositorio es de 4,8 GB y acumula 67.114 descargas y 145 likes en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre el modelo base MiniMax-H3 |
| Parámetros totales | no disponible (depende del rango y las capas adaptadas de cada LoRA; los ficheros individuales pesan entre 78 MB y 626 MB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los adaptadores se distribuyen en safetensors; la cuantización aplica al modelo base) |
| Idiomas soportados | no disponible |
| Licencia | `minimax-h3-community-license` (licencia `other`, definida por el modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio contiene adaptadores LoRA, no un transformer completo. Cada adaptador inyecta matrices de bajo rango en capas del modelo base `MiniMaxAI/MiniMax-H3`, un generador de vídeo con pipeline `text-to-video` y soporte declarado también para `image-to-video`. La librería asociada es `minimax-h3` y el ecosistema de destino es ComfyUI, según las etiquetas del repositorio y la referencia del autor a flujos de trabajo y plantillas de Runpod.

El entrenamiento se divide por naturaleza del dato: los adaptadores de anatomía se entrenaron sobre imágenes fijas (stills), mientras que los adaptadores de acción se entrenaron sobre vídeo. Los nombres de fichero conservan trazas del proceso, como el número de época (`Vagina_minimax-h3_epoch20`, `HMInnie_v1_e50`, `HMPenis_v2_e35`), lo que sugiere entrenamientos de 20 a 50 épocas según el adaptador. No se documentan en la información disponible el número de tokens, la composición del dataset, el uso de RLHF/DPO ni innovaciones arquitectónicas propias; al ser adaptadores, heredan la arquitectura del modelo base. El autor sí documenta la correspondencia de checksums SHA-256 con las versiones publicadas en CivitAI, lo que permite verificar que los pesos son idénticos a los distribuidos en esa plataforma.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) mediante el modelo base, modulada por los adaptadores.
- Generación de vídeo a partir de imagen (image-to-video), según la etiqueta del repositorio.
- Control de anatomía en imagen fija y en vídeo mediante adaptadores especializados (`HMPussy`, `HMBreasts`, `HMPenis`, `HMInnie`).
- Control de acciones y dinámicas de movimiento mediante adaptadores entrenados sobre vídeo (`HMNSFW`, `HMCumshot`, `HMMasturbation`, `HMSquirt`).
- Apilamiento modular: los adaptadores de anatomía y de acción se combinan entre sí y con LoRA de personaje o escena.
- Disparadores textuales documentados por adaptador (`hmmotion`, `cumshot`, `hmsquirt`, `Pussy`, `vagina`, `anus`, `inniepussy`, `tits`, `HMPenis`, entre otros) y rangos de fuerza recomendados (por ejemplo, 0,6–1,0 para HMNSFW V3 y 0,5–0,9 para HMNSFW V2.5).
- Integración con ComfyUI y con plantillas de despliegue en Runpod.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, matemáticas ni audio.

## Casos de uso

- Producción de vídeo para adultos con control de continuidad anatómica: combinando un adaptador de anatomía con uno de acción se mantiene la coherencia de la representación a lo largo de los fotogramas, algo que un prompt de texto por sí solo no garantiza de forma fiable.
- Creación de personajes consistentes en serie: al apilar los adaptadores por debajo de un LoRA de personaje, el mismo personaje puede reproducirse en múltiples escenas sin reentrenar el modelo base.
- Iteración rápida en ComfyUI: los flujos de trabajo publicados por el autor y los tamaños reducidos de los adaptadores (78–626 MB) permiten probar variantes y fuerzas sin recargar el modelo base completo.
- Despliegue en infraestructura efímera: la plantilla de Runpod referenciada por el autor facilita levantar un entorno con el modelo base y los adaptadores para sesiones de generación puntuales.
- Automatización de pipelines de contenido con verificación de integridad: los checksums SHA-256 publicados permiten validar en CI que los pesos descargados coinciden con las versiones canónicas de CivitAI antes de usarlos en producción.
- Investigación sobre entrenamiento de LoRA en modelos de vídeo: la estructura del repositorio (separación anatomía/acción, disparadores, épocas en los nombres de fichero, rangos de fuerza) sirve como referencia metodológica para experimentos propios.
- Archivado y espejo de pesos: el repositorio permite descargar los adaptadores mediante URL `resolve` sin cuenta, lo que simplifica la réplica en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Depende del modelo base MiniMax-H3, no de los adaptadores; los LoRA añaden una sobrecarga pequeña respecto al modelo base.
- GPU recomendadas: no disponible. El autor referencia una plantilla de despliegue en Runpod, pero no especifica el tipo de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (ecosistema declarado en las etiquetas) y plantillas de Runpod. No se documentan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un modelo de generación de vídeo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye adaptadores LoRA comparables para modelos de vídeo ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Contenido explícitamente para adultos: el repositorio está etiquetado como `not-for-all-audiences` y `nsfw`; no es apto para uso general ni para entornos sin control de acceso.
- Licencia `minimax-h3-community-license`: es una licencia comunitaria del modelo base, no una licencia de código abierto estándar. Es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales sobre los adaptadores derivados.
- Dependencia total del modelo base: los adaptadores no funcionan de forma autónoma; requieren `MiniMaxAI/MiniMax-H3` y su licencia.
- Riesgo de artefactos anatómicos: al ser adaptadores de concepto único entrenados con datasets acotados, pueden producir deformaciones en poses, ángulos o composiciones alejadas de los datos de entrenamiento.
- Interacción entre adaptadores no garantizada: el apilamiento de varios LoRA puede degradar la calidad o producir interferencias; las fuerzas recomendadas son un punto de partida, no una configuración óptima universal.
- Disparadores inconsistentes entre versiones: algunos adaptadores requieren palabra de activación y otros funcionan con prosa simple (HMNSFW V3), lo que complica la reproducibilidad entre versiones.
- Ficheros no espejados: al menos un adaptador (`HMMisDog v1.0`) no está disponible en este repositorio, solo en CivitAI.
- Idiomas y contexto: no disponibles, por lo que no puede evaluarse su comportamiento multilingüe.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad objetiva más allá de las muestras de vídeo alojadas en CivitAI.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Hearmeman/minimax-h3-loras
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Sitio del autor (flujos de ComfyUI, plantillas y guías): https://hearmemanai.com/
- Discord del autor: https://discord.gg/ZVWVhT43GW
- Plantilla de Runpod: https://get.runpod.io/minimax-template
- Perfil del autor en CivitAI: https://civitai.com/user/HearmemanAI
- HMNSFW V3 (Extreme Realism): https://civitai.com/models/2834417?modelVersionId=3446189
- HMNSFW V2.5: https://civitai.com/models/2834417?modelVersionId=3268303
- HMNSFW V2: https://civitai.com/models/2834417?modelVersionId=3206518
- HMCumshot v1.0: https://civitai.com/models/2857340?modelVersionId=3329529
- HMCumshot V0.5: https://civitai.com/models/2857340?modelVersionId=3238531
- HMMasturbation v2.0 / HMSquirt v0.1: https://civitai.com/models/2893742?modelVersionId=3310312
- HMSquirt v0.1 (versión): https://civitai.com/models/2893742?modelVersionId=3271912
- HMPussy V2: https://civitai.com/models/2846342?modelVersionId=3436891
- HMPussy V1: https://civitai.com/models/2846342?modelVersionId=3252213
- HMPussy v0.5: https://civitai.com/models/2846342?modelVersionId=3215304
- HMInnie v1.0: https://civitai.com/models/2853405?modelVersionId=3222484
- HMBreasts V2: https://civitai.com/models/2848799?modelVersionId=3268969
- HMBreasts V1.0: https://civitai.com/models/2848799?modelVersionId=3216751
- HMPenis v1.0: https://civitai.com/models/2849923?modelVersionId=3218160
- HMMisDog v1.0 (solo en CivitAI): https://civitai.com/models/2924146?modelVersionId=3308736
