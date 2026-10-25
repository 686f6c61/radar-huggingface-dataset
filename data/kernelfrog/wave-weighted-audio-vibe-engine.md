# KernelFrog/WAVE-Weighted-Audio-Vibe-Engine

## Resumen

WAVE (Weighted Audio Vibe Engine) es un paquete de vectores y pesos para recomendación musical, no un modelo de lenguaje. Lo publica el autor KernelFrog en HuggingFace como componente del motor de radio y recomendaciones de Knob, un servidor de música autoalojado. El repositorio contiene dos artefactos: `CrowdPack.bin` (682 MB), una tabla de embeddings de artistas y grabaciones aprendida con item2vec a partir del volcado público de ListenBrainz, y `weights.json`, los pesos por defecto con los que una emisora puntúa la siguiente canción.

El problema que resuelve es concreto: permitir que un servidor doméstico mapee su propia biblioteca sobre un espacio vectorial de escucha colectiva y aprenda, en local y en CPU, qué canciones y artistas se reproducen juntos. No se envía ninguna biblioteca ni historial de escucha a ningún servicio externo; el servidor busca sus canciones por nombre de artista y título mediante claves de 64 bits, sin necesidad de identificadores de MusicBrainz.

Es relevante porque demuestra un patrón de despliegue poco habitual: un pack de conocimiento colectivo de casi 500 millones de valores int8, serializado en un formato binario de filas de tamaño fijo ordenadas por clave, que se consulta por búsqueda binaria sin cargar el fichero completo en memoria. La licencia del código y los vectores es AGPL-3.0; los datos de origen son CC0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Item2vec: skip-gram con muestreo negativo sobre sesiones de escucha (no es un transformer ni un LLM) |
| Parámetros totales | No aplica como red neuronal. 493.839.296 valores int8 (3.716.239 artistas × 64 dims + 8.000.000 grabaciones × 32 dims), cifra derivada del recuento publicado |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de entrenamiento de ±3 canciones dentro de una sesión; una sesión termina tras 30 minutos sin escucha |
| Tipos de cuantización | Vectores unitarios cuantizados a int8 con una escala float32 por fila |
| Idiomas soportados | No disponible. La identificación se hace sobre nombres normalizados, sin dependencia declarada de idioma |
| Licencia | AGPL-3.0 (vectores y pesos); datos de escucha de ListenBrainz bajo CC0 |
| Formato de pesos | `CrowdPack.bin` en formato binario propietario «SNCP» (little-endian) más `weights.json` |

## Arquitectura y entrenamiento

El pack se entrena con skip-gram y muestreo negativo (item2vec) sobre el volcado completo de escuchas de ListenBrainz, dump 2723 del 15 de octubre de 2026: 2.900 millones de escuchas agregadas en 136 millones de sesiones. Cada sesión se define por un corte de 30 minutos sin reproducción. El contexto es de 3 canciones a cada lado dentro de la sesión, con 5 muestras negativas por ejemplo. El resultado son dos tablas: 3.716.239 artistas con 64 dimensiones y 8.000.000 de grabaciones (las más escuchadas, con al menos 5 sesiones cada una) con 32 dimensiones.

El formato binario «SNCP» es la innovación técnica destacable. Empieza con la cadena `"SNCP"` y un int32 de versión; después vienen la tabla de artistas (int32 de recuento, int32 de dimensiones, filas con clave uint64, escala float32 y valores int8) y la de grabaciones (añade índice int32 de fila de artista y rango uint16 dentro del artista). Las filas son de tamaño fijo y están ordenadas por clave, de modo que el servidor localiza sus pocos miles de canciones por búsqueda binaria en lugar de cargar el fichero entero. La integridad se verifica con SHA-256 `b65359b1fca904eb9655576a0328690d0ba7a8c939d47b911aaa681a6e69e228`.

Los pesos de `weights.json` combinan señales en una suma ponderada: género y época de la semilla, coescucha del propio hogar, `CrowdNext` (qué reproduce la multitud a continuación), `CrowdArtist` (artistas que la multitud escucha juntos), similitud de sonido, favoritos, saltos y espaciado temporal. Se ajustaron sobre el historial limpio de un único hogar. `GenreFlow` y `SoundFit` no predijeron la siguiente reproducción y quedaron a 0.

## Capacidades

- Recomendación de siguiente canción en una emisora, combinando señales de multitud, biblioteca local y hábitos del hogar.
- Representación vectorial de artistas (64 dimensiones) y grabaciones (32 dimensiones) para similitud y vecindad.
- Mapeo de una biblioteca local al espacio colectivo usando solo nombre de artista y título normalizados, sin MusicBrainz.
- Aprendizaje incremental de pesos por hogar a partir de su propio historial, partiendo de los pesos por defecto.
- Consulta eficiente por búsqueda binaria sobre fichero en disco, apta para CPU y sin GPU.
- Rango de popularidad por artista: posición de cada grabación entre las de su artista según sesiones escuchadas.
- No genera texto ni audio, no razona, no soporta tool calling ni agentes, no tiene modo thinking ni visión.

## Casos de uso

- Radio personalizada en servidor doméstico: la emisora puntúa cada candidata con la suma ponderada de señales y elige la siguiente pista; encaja en Knob porque el pack se instala en la carpeta de caché y se recarga al reiniciar.
- Descubrimiento dentro de una biblioteca cerrada: `CrowdNext` y `CrowdArtist` aportan coocurrencias que el historial local todavía no contiene, lo que permite sugerir primeras escuchas (6-11 % de acierto declarado) en colecciones pequeñas.
- Mezcla automática por similitud: la tabla de grabaciones en 32 dimensiones permite construir listas por vecindad vectorial sin depender de metadatos de género.
- Sistemas autoalojados con requisito de privacidad: todo el cálculo ocurre en CPU y en local; no hay llamadas de red ni telemetría, lo que facilita el cumplimiento en entornos sensibles.
- Prototipado de investigación en recomendación musical: el formato documentado y las claves por hash permiten reproducir experimentos de item2vec sobre ListenBrainz sin reentrenar.
- Calibración de motores de recomendación existentes: `weights.json` sirve como inicialización para un ajuste supervisado posterior con el historial propio, comparando hit rate antes y después.
- Análisis de catálogo: el rango uint16 y el índice de artista por grabación permiten estudios de popularidad relativa dentro de un artista sin base de datos adicional.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas internas de acierto de recomendación, no benchmarks estándar (MMLU, HumanEval, GSM8K no aplican a este artefacto).

| Métrica | Pesos manuales previos | Pesos por defecto actuales |
|---|---|---|
| Siguientes reproducciones predichas en la biblioteca (hit rate) | 39,5 % | 44,0 % |
| Primeras escuchas predichas | 0 % | 6-11 % |

No se han publicado resultados de benchmarks en la información disponible más allá de esta comparación interna.

## Requisitos de hardware

- Inferencia en CPU; no requiere GPU ni VRAM. El propio autor describe el aprendizaje como «offline, on CPU».
- Espacio en disco: 682 MB para `CrowdPack.bin`, con el repositorio completo en 0,7 GB.
- Memoria: no es necesario cargar el pack entero; la búsqueda binaria sobre filas de tamaño fijo permite leer solo las filas de la biblioteca local. Si se cargase completo, el cálculo por fila (76 bytes por artista, 50 bytes por grabación) da un orden de magnitud de 682 MB de RAM.
- GPU recomendadas: no aplica. Cualquier CPU x86-64 o ARM con acceso a disco es suficiente.
- Opciones de despliegue: servidor Knob (carpeta de caché o enriquecimiento). vLLM, llama.cpp, Ollama y TGI no aplican porque no hay un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de terceros comparables en la información proporcionada. La única referencia cuantitativa publicada es la comparación interna entre los pesos manuales anteriores y los pesos por defecto actuales (ver sección de benchmarks), con una mejora de 4,5 puntos porcentuales en hit rate y la aparición de predicción de primeras escuchas.

| Criterio | WAVE | Alternativas de la categoría |
|---|---|---|
| Tipo | Item2vec + pesos de puntuación | No disponible |
| Parámetros o dimensiones | 64 dims (artista), 32 dims (grabación) | No disponible |
| Contexto | ±3 canciones por sesión | No disponible |
| Licencia | AGPL-3.0 | No disponible |
| Disponibilidad | HuggingFace, 0 descargas, 1 like | No disponible |

## Limitaciones y advertencias

- Sesgo hacia lo popular: solo se incluyen las 8.000.000 de grabaciones más escuchadas con al menos 5 sesiones, de modo que el catálogo minoritario queda fuera del pack.
- Arranque en frío: la predicción de primeras escuchas se queda en el 6-11 %, y el 0 % previo muestra que sin señal de multitud el sistema no descubre nada nuevo.
- Los pesos por defecto se ajustaron sobre el historial de un único hogar, por lo que pueden estar sobreajustados a ese patrón de consumo y no representar a otros usuarios.
- Identificación por hash de 64 bits sobre nombres normalizados: hay riesgo teórico de colisión y de confundir reediciones, directos o remasterizaciones con la versión de estudio.
- No usa identificadores de MusicBrainz, lo que simplifica el despliegue pero impide desambiguar metadatos de forma fiable.
- No es un modelo de lenguaje: no genera texto, no responde a prompts, no soporta tool calling ni razonamiento multi-paso. Cualquier ficha que lo trate como LLM es incorrecta.
- Licencia AGPL-3.0: el copyleft afecta a modificaciones y a la distribución de obras derivadas, también en escenarios de servicio en red. Revisar antes de uso comercial propietario.
- El rendimiento declarado no se ha validado de forma independiente; las métricas proceden del propio autor.
- Sin datos publicados de latencia, throughput ni consumo de memoria en producción.

## Enlaces

- HuggingFace: https://huggingface.co/KernelFrog/WAVE-Weighted-Audio-Vibe-Engine
- Volcado de ListenBrainz dump 2723 (15 de octubre de 2026, CC0): citado en la model card; no se incluye URL directa en la información disponible.
- El resto de resultados de búsqueda web obtenidos (vibeengine.live, vibeengines.com, zephly.ai, repositorios ComfyUI-Woosh y videoclipgenerator) no guardan relación con este artefacto y no se incluyen como referencias válidas.
