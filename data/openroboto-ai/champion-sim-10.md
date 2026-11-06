# openroboto-ai/champion-sim-10

## Resumen

OpenRoboto champion-sim-10 es un snapshot de checkpoint publicado por la organización openroboto-ai en Hugging Face. No se trata de un modelo de lenguaje en el sentido convencional, sino de la copia exacta del checkpoint completo del campeón de la temporada 10 del entorno de simulación OpenRoboto, una competición orientada a políticas robóticas que después se transfieren a celdas de trabajo robóticas reales. El repositorio conserva un único campeón por temporada: cada commit corresponde a un campeón distinto y los ficheros del campeón anterior se eliminan en cada actualización.

El checkpoint procede del repositorio fuente `Hurricane1/tabletop-policy-n` en el commit `738f8aa6e3d40a6d608a63a51d931fefa8c07141`, con un score registrado de 0.9056 y el hotkey `5HKZ1RibiHEJojAacH27uJXjHAQ3Zy8pEt15DJPy7Dxxuh2S`. El nombre del repositorio sugiere una política entrenada para tareas de mesa (tabletop), pero la model card no proporciona detalles sobre arquitectura, parámetros, contexto ni datos de entrenamiento. El tamaño del repositorio es de 87.1 GB, lo que indica un checkpoint de gran volumen, probablemente con pesos en precisión completa o mixta.

La relevancia de este artefacto es acotada pero específica: sirve como punto de partida canónico aceptado para participar en la temporada siguiente de OpenRoboto, ya que la organización lo reconoce como parent canónico en su política de originalidad y derivados. No obstante, al no publicarse especificaciones técnicas, benchmarks ni licencia, su utilidad fuera del ecosistema OpenRoboto es limitada y requiere inspección directa de los ficheros del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 87.1 GB; probablemente safetensors u otro formato de checkpoint, sin confirmar) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la model card ni en los resultados de búsqueda disponibles. El nombre del repositorio fuente (`tabletop-policy-n`) sugiere una política de control para tareas de manipulación sobre mesa, pero no se especifica si se trata de un transformer, una red convolucional, un modelo de difusión de políticas, un modelo híbrido o cualquier otra familia. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o aprendizaje por refuerzo en simulación.

Lo único verificable es el mecanismo de publicación: cada commit del repositorio es una copia byte a byte del checkpoint fuente en el commit evaluado, con coincidencia de LFS sha256 y git blob id, excepto el README. El score de 0.9056 corresponde a la evaluación de ese checkpoint en el entorno de simulación de OpenRoboto. No se dispone de información sobre innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de planificación.

## Capacidades

- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas o visión en la información disponible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso en el sentido de modelos de lenguaje.
- No se documenta capacidad multilingüe.
- Por el contexto del repositorio (OpenRoboto, políticas de simulación a celdas robóticas), se infiere que el checkpoint implementa una política de control para tareas robóticas de mesa, pero no se detalla qué tareas concretas, qué espacio de acciones ni qué modalidades de entrada maneja.
- No se documentan capacidades especiales como thinking mode, visión o audio.

## Casos de uso

- Punto de partida para la temporada siguiente de OpenRoboto: el checkpoint se reconoce como parent canónico aceptado, por lo que un equipo puede descargarlo con `hf download openroboto-ai/champion-sim-10 --revision <commit-sha>` y continuar el entrenamiento o la evolución de la política desde ese estado, fijando siempre el commit y nunca `main`.
- Reproducción de la evaluación del campeón: al ser una copia byte a byte del checkpoint fuente, permite reproducir el score de 0.9056 en el entorno de simulación de la temporada 10 y auditar la política ganadora.
- Investigación en políticas de manipulación tabletop: el nombre del repositorio fuente sugiere que la política está especializada en tareas de mesa, lo que la hace candidata para estudiar estrategias de control en ese dominio, siempre que se inspeccione previamente el contenido del checkpoint.
- Transferencia a celdas robóticas reales: según la descripción de OpenRoboto, los modelos campeones graduados de la simulación pasan a celdas de trabajo robóticas reales, por lo que este snapshot podría servir como referencia de lo que funciona en simulación antes de un despliegue físico.
- Baseline para competiciones derivadas: al ser un parent aceptado, sirve como referencia contra la que medir políticas derivadas en la misma temporada o en temporadas posteriores.
- Archivado histórico de la temporada 10: el repositorio se conserva hasta el cierre de la temporada siguiente, lo que permite a investigadores recuperar el estado exacto del campeón para análisis retrospectivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es el score de 0.9056 registrado en la model card para la temporada 10, sin que se especifique la métrica, el entorno de evaluación ni la comparación con otros participantes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repo (87.1 GB) sugiere que el checkpoint en precisión completa o mixta no cabe en GPUs de consumo convencionales, pero no se puede confirmar sin conocer el número de parámetros y el formato de pesos.
- GPU recomendadas: no disponible. Por el volumen del repositorio, es probable que se requieran GPUs de datacenter (A100, H100) o múltiples GPUs, pero no hay confirmación.
- ¿Cabe en GPU de consumo? No disponible. Con 87.1 GB de repositorio, es improbable que quepa en una RTX 4090 (24 GB) sin cuantización, pero no se documentan opciones de cuantización.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros motores de inferencia. Al ser un checkpoint de política robótica, es probable que requiera el entorno de simulación o el framework específico de OpenRoboto, no documentado en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros checkpoints de la misma categoría (políticas robóticas de OpenRoboto) con los que comparar parámetros, contexto, rendimiento o licencia. El propio repositorio indica que cada temporada tiene su propio repositorio de snapshot, pero no se listan los modelos de otras temporadas ni sus especificaciones.

## Limitaciones y advertencias

- La licencia no está disponible, lo que impide determinar si el uso comercial está permitido. Cualquier uso en producción requiere aclarar este punto con el autor o la organización.
- No se documentan sesgos conocidos, pero al ser una política entrenada en simulación, es probable que presente un gap de sim-to-real no cuantificado.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de comportamientos fuera de distribución en entornos reales no vistos durante el entrenamiento.
- Limitaciones de contexto o idioma: no disponibles.
- El repositorio se elimina al cierre de la temporada siguiente, por lo que no es un archivo permanente; hay que fijar el commit y descargarlo antes de esa fecha.
- La rama `main` cambia con cada nuevo campeón; usar `main` en lugar de un commit fijo puede llevar a descargar un checkpoint distinto al esperado.
- No se documenta el framework de inferencia ni las dependencias necesarias para ejecutar el checkpoint, lo que añade fricción a cualquier reproducción.
- El score de 0.9056 no viene acompañado de la definición de la métrica, por lo que no es interpretable fuera del contexto de OpenRoboto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/openroboto-ai/champion-sim-10
- Repositorio fuente del checkpoint: https://huggingface.co/Hurricane1/tabletop-policy-n/tree/738f8aa6e3d40a6d608a63a51d931fefa8c07141
- OpenRoboto - Subnet Alpha: https://subnetalpha.ai/subnet/openroboto/
- Organización openroboto-ai en GitHub: no disponible como URL directa en la información proporcionada (se menciona "openroboto-ai GitHub" sin enlace).
