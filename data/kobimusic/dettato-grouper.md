# kobimusic/dettato-grouper

## Resumen

Dettato grouper es el módulo de asignación de pistas del sistema Dettato, un transcriptor audio-a-MIDI multi-instrumento desarrollado por KobiMusic. Con 2,90 millones de parámetros (2.896.613 exactos), recibe las notas detectadas por el transcriptor Dettato y las agrupa en pistas, asignando a cada una un nombre de instrumento entre 73 posibles, cada uno mapeado a su programa General MIDI. No es un modelo autónomo: depende del estado interno del transcriptor y se ejecuta en cadena con él.

El modelo resuelve un problema específico dentro del pipeline de transcripción: una vez que el transcriptor ha identificado las notas de una grabación, alguien tiene que decidir qué nota pertenece a qué instrumento y cómo se agrupan en pistas coherentes. Dettato grouper hace exactamente eso, con una arquitectura transformer de siete bloques sobre ventanas de 24 segundos y un decodificador diseñado explícitamente para minimizar pistas espurias.

Es relevante porque la transcripción audio-a-MIDI multi-instrumento es un problema abierto, y la separación en pistas con nombre de instrumento es el paso que convierte una nube de notas en una partitura utilizable. El modelo se publica bajo licencia Apache 2.0 con pesos en safetensors y se integra en el paquete `dettato` disponible en GitHub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (7 bloques) con posiciones rotatorias sobre tiempo de onset, embeddings de pitch, lectores espectrales propios y taps del estado interno del transcriptor |
| Parámetros totales | 2.896.613 (2,90M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 24 s con salto de 12 s (no es contexto de tokens de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de audio, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, `config.json`) |

## Arquitectura y entrenamiento

El modelo procesa una nota por token sobre ventanas de 24 segundos con avance de 12 segundos. Cada token combina un embedding de pitch, escalares de la nota (onset, offset, pitch), taps del estado interno del transcriptor (último estado oculto en el onset y sobre la nota, y salida de stem en los primeros 200 ms, con tres vectores de 368 dimensiones) y tres lectores del front-end espectral propio del grouper: demezclado armónico de los parciales de la nota, perfil espectral en el bin de la nota y un pequeño trunk de pistas sobre el espectrograma y los rasters de notas de la ventana. Siete bloques transformer con posiciones rotatorias sobre el tiempo de onset producen, por nota, probabilidades de instrumento (73 clases) y un embedding de pista de 32 dimensiones; una cabeza de pista nombra la pista completa.

El decodificador ("distinct tracks") agrupa notas por ventana según similitud de embedding e instrumento, encadena clústeres entre ventanas en tracklets y fusiona los tracklets de la canción por enlace promedio. Las pistas con menos de 30 notas se pliegan en la pista grande más similar; una pista pequeña (menos de un cuarto de las notas de la canción) solo se conserva si es claramente de su propio instrumento. Cada pista se nombra por el instrumento con mayor crédito esperado y las pistas con el mismo nombre se unifican. Notas del mismo pitch dentro de 30 ms en una misma pista se convierten en una sola. El decodificador se ajustó para producir el menor número de pistas realmente distintas.

El entrenamiento usó grabaciones reales multi-pista y anotadas: Slakh2100, MusicNet, MUSDB18, GuitarSet, Medley-solos-DB, IRMAS y OpenMIC-2018, más material sintético generado internamente (no publicado). Las piezas del benchmark y sus casi-duplicados se excluyeron del entrenamiento. No se detalla en la información disponible el número total de tokens de audio ni si hubo RLHF o DPO (no aplicable a este tipo de modelo).

## Capacidades

- Asignación de notas a pistas de instrumento dentro de una grabación multi-instrumento.
- Nombrado de pistas con uno de 73 instrumentos, cada uno con su programa General MIDI.
- Producción de notas con velocidad por pista (formato `(M, 4)`: onset en s, offset en s, pitch, velocity).
- Reafinado automático de grabaciones desviadas de A440 (al menos 10 cents de forma consistente) antes del procesamiento, con remapeo temporal al final.
- Manejo de ventanas largas mediante solapamiento y encadenado de tracklets entre ventanas.
- Fusión de notas duplicadas del mismo pitch dentro de 30 ms en una pista.
- Integración con el transcriptor Dettato y con el corrector de notas Dettato-evidence dentro de la cadena completa.
- No gestiona batería (Dettato tiene un modelo separado, `kobimusic/dettato-drums`).
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Transcripción audio-a-MIDI multi-instrumento: el modelo convierte las notas detectadas por Dettato en pistas separadas con nombre de instrumento, lo que permite exportar una grabación a un DAW con pistas organizadas en lugar de una sola pista monolítica.
- Separación de stems lógica para postproducción: a partir de una mezcla, el grouper asigna cada nota a su instrumento, lo que facilita la edición selectiva de líneas de bajo, saxofón o piano sin necesidad de separación de fuentes por aprendizaje profundo.
- Generación de partituras simplificadas: las pistas nombradas con programa General MIDI permiten renderizar la transcripción con un sintetizador GM estándar y obtener una maqueta reproducible de la grabación.
- Análisis musicológico asistido: la agrupación por instrumento y la detección de pistas distintas permiten estudiar la instrumentación de una pieza (por ejemplo, identificar que una grabación de *Giant Steps* sale como piano, saxofón tenor y contrabajo).
- Corrección y limpieza de transcripciones existentes: el decodificador "distinct tracks" reduce pistas espurias (0,29 por pieza real en el benchmark interno), lo que lo hace útil para depurar transcripciones automáticas previas.
- Integración en pipelines de investigación sobre música: al ser un módulo de 2,90M de parámetros con licencia Apache 2.0, puede incorporarse en flujos de experimentación con Slakh2100, MusicNet o MUSDB18 para evaluar agrupación de notas.
- Preprocesado para entrenamiento de modelos de separación: las pistas agrupadas y nombradas pueden servir como pseudo-etiquetas para tareas posteriores de separación o clasificación de instrumentos.

## Benchmarks y rendimiento

Resultados en un benchmark interno de precisión nota-a-pista y de instrumento sobre piezas multi-pista reales y sintéticas. La puntuación es la media de una puntuación de instrumento y una de pista; los ajustes del decodificador se eligieron solo sobre canciones de validación; la entrada son las notas propias del transcriptor.

| Modelo / configuración | Grabaciones reales | Todas las piezas | Pistas espurias por pieza real |
|---|---|---|---|
| Grouper anterior | 0,644 | 0,612 | 1,98 |
| Este modelo (su decodificador ajustado) | 0,660 | 0,636 | 1,27 |
| Este modelo + decodificador distinct-tracks (lo que ejecuta Dettato) | 0,659 | – | 0,29 |

Diferencia pareada frente al grouper anterior: real +0,016 [+0,005, +0,027], todas +0,024 [+0,015, +0,033] (intervalos del 95%); una segunda semilla de entrenamiento da las mismas puntuaciones. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, por tratarse de un modelo de audio.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamaño del modelo (2,90M de parámetros, aproximadamente 12 MB en fp32), aunque el consumo real lo domina el transcriptor Dettato del que depende.
- GPU recomendadas: cualquier GPU con CUDA compatible; el modelo se ejecuta con `from_pretrained("cuda")` o `from_pretrained("cpu")` según el paquete `dettato`.
- Cabe en GPU consumer: sí, con margen amplio; el cuello de botella es el transcriptor, no el grouper.
- Opciones de despliegue: paquete `dettato` (instalación vía `pip install git+https://github.com/kobimusic/dettato`), que ejecuta toda la cadena desde línea de comandos o desde Python. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. El propio autor compara este modelo con el "grouper anterior" de la misma familia Dettato (ver tabla de benchmarks), pero no se detallan parámetros, contexto ni licencia de esa versión previa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Dettato grouper | 2,90M | ventanas de 24 s | Apache 2.0 | Hugging Face |
| Grouper anterior (Dettato) | no disponible | no disponible | no disponible | no disponible |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- En jazz real, aproximadamente un cuarto de las notas de un saxofón o de una guitarra solista acaban en la pista de piano.
- La música con mucha síntesis se nombra peor que con el grouper anterior; una banda de concierto obtiene nombres de instrumento aproximados.
- El benchmark interno usa las notas propias del transcriptor; la cadena completa (notas corregidas por dettato-evidence y luego agrupadas) se ha verificado por escucha, no con puntuación en ese benchmark.
- No gestiona batería; para ello existe un modelo separado (`kobimusic/dettato-drums`).
- No es un modelo autónomo: requiere el estado interno del transcriptor Dettato en cada nota, por lo que no puede usarse de forma aislada.
- El decodificador está optimizado para pocas pistas realmente distintas, con nombres de instrumento solo aproximadamente correctos (bajo acústico vs. eléctrico se considera cercano); no debe esperarse una clasificación fina de instrumento.
- Riesgo de sesgo hacia los instrumentos y géneros presentes en los datasets de entrenamiento (Slakh2100, MusicNet, MUSDB18, GuitarSet, Medley-solos-DB, IRMAS, OpenMIC-2018) y en el material sintético interno.
- Licencia Apache 2.0: permite uso comercial, pero las licencias de los datos de entrenamiento (el texto de la model card se corta en "Slakh2100 (CC") deben verificarse por separado antes de un uso en producción.
- No se documentan tipos de cuantización ni idiomas soportados; al ser un modelo de audio, la noción de idioma no aplica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kobimusic/dettato-grouper
- Transcriber Dettato: https://huggingface.co/kobimusic/dettato
- Corrector de notas Dettato-evidence: https://huggingface.co/kobimusic/dettato-evidence
- Modelo de batería Dettato-drums: https://huggingface.co/kobimusic/dettato-drums
- Colección Dettato: https://huggingface.co/collections/kobimusic/dettato
- Repositorio del paquete: https://github.com/kobimusic/dettato
