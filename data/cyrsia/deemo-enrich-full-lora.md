# Cyrsia/deemo-enrich-full-lora

## Resumen

`Cyrsia/deemo-enrich-full-lora` es un adaptador LoRA de generación de charts para el juego Deemo, construido sobre el modelo base `OliBomby/Mapperatorinator-v32` en su modo `gamemode=0` (osu!standard). El adaptador toma como entrada audio, un nivel de dificultad y un conjunto de etiquetas, y produce charts de Deemo en cuatro niveles (easy, normal, hard, extra) que se han convertido al formato osu!std. Lo publica el usuario Cyrsia y está pensado para uso personal y de investigación.

El interés técnico del adaptador reside en su estrategia de entrenamiento "enrichment-weighted": durante el ajuste se añadieron notas de detalle rítmico (rellenos de subdivisión entre onsets de un chart más sencillo y acordes extra) con un peso ×3 en la función de pérdida, además de una ponderación suave de acordes. El LoRA emplea r=128, alpha=256 y ataca las proyecciones `Wq`, `Wkv`, `Wqkv` y `Wo`, con cabeza de salida y embeddings de dificultad, posición de canción y proyección del encoder entrenables.

El repositorio ocupa 0,2 GB y contiene únicamente los pesos del adaptador y su configuración, no un modelo completo. No se han publicado resultados de benchmarks, licencia explícita, idiomas soportados ni pipeline en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre `OliBomby/Mapperatorinator-v32` (modo osu!std, `gamemode=0`) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no se detalla en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada) |
| Idiomas soportados | no disponible (la tarea es generacion de charts, no texto) |
| Licencia | no disponible (la model card indica "personal / research use") |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 128 y alpha 256 aplicado sobre las proyecciones de atención `Wq`, `Wkv`, `Wqkv` y `Wo` del modelo base Mapperatorinator-v32. Además de las matrices de bajo rango, se entrenaron la cabeza de salida y los embeddings de condicionamiento: dificultad, posición de la canción y proyección del encoder. El modelo base no se describe en detalle en la información proporcionada, por lo que no se puede confirmar su arquitectura interna (transformer u otra) ni su tamaño.

Los datos de entrenamiento consisten en 447 canciones de Deemo en los cuatro niveles de dificultad, convertidas a osu!std con una codificación concreta: la coordenada x representa la posición de lane, la y el bin de tamaño de nota, los roles se codifican en hitsound y la ausencia de sonido en el volumen. La innovación principal es la ponderación de enriquecimiento: se añadieron notas de detalle rítmico (rellenos de subdivisión entre onsets de un chart más sencillo y acordes extra) con peso ×3 en la pérdida, junto con una ponderación suave de acordes. No se documentan número de tokens, composición exacta del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generación de charts de Deemo a partir de audio, nivel de dificultad y etiquetas.
- Condicionamiento por dificultad en un rango de 1 a 11.
- Condicionamiento por posición de canción (song-position conditioning).
- Producción de charts en cuatro niveles: easy, normal, hard y extra.
- Enriquecimiento rítmico: inserción de notas de subdivisión y acordes extra sobre una base más sencilla.
- Codificación específica osu!std: lane en x, tamaño de nota en y, roles en hitsound, silencio en volumen.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión, audio (más allá de la entrada musical) ni modo thinking.

## Casos de uso

- Generación automática de charts para Deemo: dado un archivo de audio y un nivel de dificultad entre 1 y 11, el adaptador produce un chart en formato osu!std listo para revisión, aprovechando el condicionamiento por dificultad del LoRA.
- Enriquecimiento de charts existentes: la ponderación ×3 sobre notas de subdivisión y acordes permite añadir detalle rítmico a charts más sencillos sin rehacerlos desde cero, útil para mappers que quieren una versión "extra" de un chart easy.
- Prototipado rápido de contenido para mods o ports de Deemo: al convertir a osu!std, los charts generados se pueden probar en herramientas del ecosistema osu! antes de portarlos al juego original.
- Investigación sobre generación musical condicionada: el adaptador sirve como caso de estudio de condicionamiento por dificultad y posición de canción en modelos generativos de ritmo.
- Aumento de datos para entrenamiento de modelos de charting: los charts generados pueden servir como datos sintéticos etiquetados por dificultad para experimentos posteriores.
- Herramienta de asistencia al mapper: generar un borrador de chart con el LoRA y refinarlo manualmente, reduciendo el tiempo de creación inicial en canciones del repertorio Deemo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador pesa 0,2 GB, pero requiere cargar el modelo base Mapperatorinator-v32, cuyo tamaño no se detalla.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base.
- Opciones de despliegue: carga como LoRA PEFT sobre Mapperatorinator-v32 con inferencia estándar; se recomienda "super-timing". El repositorio incluye `mapperatorinator_lora_metadata.json` con metadatos de la subcarpeta del checkpoint (`gamemode=0`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cyrsia/deemo-enrich-full-lora | Mapperatorinator-v32 (osu!std) | LoRA r=128 (adaptador) | no disponible | no disponible | Hugging Face |
| OliBomby/Mapperatorinator-v32 | Modelo base | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de charting para Deemo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores o modelos comparables de generación de charts para Deemo en la información proporcionada.

## Limitaciones y advertencias

- La model card restringe el uso a "personal / research use"; no se especifica una licencia formal, lo que impide confirmar condiciones de uso comercial.
- El adaptador solo funciona sobre el modelo base `OliBomby/Mapperatorinator-v32` en modo `gamemode=0`; no es un modelo autónomo.
- El entrenamiento se limita a 447 canciones de Deemo, por lo que la generalización a otros repertorios o estilos musicales no está documentada.
- La conversión a osu!std con codificaciones específicas (lane en x, tamaño en y, roles en hitsound) puede introducir pérdida de información respecto al formato original de Deemo.
- No se documentan sesgos, tasas de alucinación ni evaluación cualitativa de la calidad de los charts generados.
- No hay información sobre idiomas, contexto ni cuantizaciones; no se debe asumir compatibilidad con pipelines de texto estándar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria publicada.

## Enlaces

- Hugging Face: https://huggingface.co/Cyrsia/deemo-enrich-full-lora
- Modelo base: https://huggingface.co/OliBomby/Mapperatorinator-v32
