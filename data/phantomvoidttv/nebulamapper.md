# PhantomVoidTTV/NebulaMapper

## Resumen

NebulaMapper es un conjunto de modelos de IA orientados a la generacion automatica de mapas para el videojuego de ritmo Beat Saber, asi como de su iluminacion y de replays de jugador autonomo. Lo desarrolla el usuario PhantomVoidTTV y se publica en Hugging Face bajo el identificador `PhantomVoidTTV/NebulaMapper`. El repositorio agrupa varios componentes especializados en lugar de un unico modelo generativo de proposito general: un generador de mapas, un predictor de ritmo, un coreografo de luces, un bot de jugador en realidad virtual, un etiquetador de swings, una red de deteccion de beats y estimadores de dificultad por estrellas.

El problema que resuelve es el de la creacion asistida de contenido para Beat Saber: a partir de una pista de audio, el sistema puede generar patrones de bloques jugables, sincronizados con los onsets musicales, con iluminacion coherente y con una estimacion de dificultad. Ademas, incluye un modelo de generacion de trayectorias 6-DoF para un jugador automatico, lo que lo convierte en una herramienta tanto de autoria como de evaluacion y demostracion.

El modelo principal de mapas es un transformer encoder-decoder de mas de 65 millones de parametros con alineamiento de memoria musical y vision general del audio. El conjunto se distribuye en formato safetensors con ficheros de configuracion JSON asociados, tiene un tamano de repositorio de 1,4 GB y se publica bajo licencia AGPL-3.0. La libreria declarada es `bsgen` y el pipeline es `audio-to-audio`. No se especifican idiomas soportados ni se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de modelos: transformer encoder-decoder (mapa), transformer con RoPE (ritmo), transformer de difusion enmascarada iterativa (luces), flow-matching 6-DoF (jugador), transformer bidireccional (etiquetador), red log-mel + random forest (timing), gradient boosted decision forest (rating) |
| Parametros totales | No disponible como cifra unica; por componente: map 65M+, rhythm 47M+, lights 7M+, player 38M+, mas labeler, timing y estimadores (tamano no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | No disponible (el modelo opera sobre audio y datos de Beat Saber, no sobre texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors, con configuraciones JSON y ficheros NPZ (`octave.npz`, `rating.npz`, `song_stars.npz`) |

## Arquitectura y entrenamiento

El repositorio es un ensamblaje de modelos especializados. El componente central, `map.safetensors`, es un transformer encoder-decoder de mas de 65 millones de parametros que incorpora una vision general del audio y un mecanismo de alineamiento con memoria musical para generar patrones de bloques. El modelo de ritmo (`rhythm.safetensors`, 47M+ parametros) es un transformer con RoPE que predice los ticks exactos de impacto por beat. El modelo de iluminacion (`lights.safetensors`, 7M+ parametros) emplea difusion enmascarada iterativa sobre las 23 configuraciones de entorno de Beat Saber. El bot de jugador (`player.safetensors`, 38M+ parametros) es un generador de trayectorias 6-DoF mediante flow matching para casco y dos sables. Se completan con un etiquetador bidireccional de swings (forehand/backhand y deteccion de reset), una red de activacion de beats sobre log-mel con clasificador de octava por random forest (`timing.safetensors` + `octave.npz`), y estimadores de dificultad basados en bosques de decision con boosting (`rating.npz`, `song_stars.npz`).

La model card indica metadatos de construccion personalizada: modo de generacion `nebula_evolved`, cinco personas de mapper (`phantomvoid`, `nebulamapper`, `nebula_tech`, `nebula_speed`, `nebula_acc`) y una proporcion de mezcla de checkpoints de 0,08. No se especifican en la informacion disponible el numero de tokens de audio de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion automatica de mapas de Beat Saber a partir de audio, con control del rango de dificultad en estrellas (por ejemplo, `--stars 7.5 10.0`).
- Prediccion precisa de onsets y ticks de impacto por beat mediante el modelo de ritmo.
- Coreografia de iluminacion sobre 23 entornos de Beat Saber mediante difusion enmascarada iterativa.
- Generacion de replays de jugador autonomo: trayectorias 6-DoF de casco y sables con flow matching.
- Etiquetado de swings con paridad forehand/backhand y deteccion de resets.
- Estimacion de dificultad: calculo de Star, Tech y Pass, y estimacion de HPS/Tech/Pass objetivo a partir del audio.
- Personas de mapper configurables (`phantomvoid`, `nebulamapper`, `nebula_tech`, `nebula_speed`, `nebula_acc`) para variar el estilo de generacion.
- Flujo de generacion, fine-tuning y evolucion de modelos con subida automatica al repositorio (`generate_models.py --mode nebula_evolved --push`).
- Interfaz web propia (`scripts/webui.py`) que descarga y sube modelos al repositorio.
- No se documentan capacidades de texto, vision, audio general, tool calling ni agentes multi-paso.

## Casos de uso

- Creacion de mapas para canciones nuevas: dado un fichero de audio, `scripts/generate.py` produce un mapa jugable con dificultad objetivo en estrellas, lo que permite a mappers y creadores de contenido generar borradores en minutos en lugar de horas.
- Ajuste de dificultad por audiencia: el estimador `song_stars.npz` y el control `--stars` permiten generar variantes de un mismo tema para distintos niveles, desde principiante hasta experto.
- Coreografia de iluminacion: el modelo de luces genera automaticamente la iluminacion para cualquiera de los 23 entornos, reduciendo el trabajo manual de sincronizacion de eventos de luz con la musica.
- Evaluacion y benchmarking de mapas: el estimador de rating (Star, Tech, Pass) permite puntuar mapas existentes y comparar su dificultad percibida de forma objetiva.
- Demostraciones y replays automaticos: el modelo de jugador genera trayectorias 6-DoF que pueden reproducirse como bot autonomo para validar la jugabilidad de un mapa generado.
- Investigacion en generacion condicionada por audio: el conjunto de modelos sirve como banco de pruebas para tareas de audio-to-audio, deteccion de onsets y generacion de secuencias estructuradas.
- Integracion en pipelines de contenido para comunidades de ritmo: el flujo `generate_models.py` con subida automatica permite mantener un repositorio de modelos actualizado y versionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, el conjunto de pesos suma del orden de 157M de parametros en los componentes con tamano declarado (map 65M+, rhythm 47M+, lights 7M+, player 38M+), lo que en precision FP32 supondria aproximadamente 0,6 GB solo en pesos, mas los componentes sin tamano declarado y el estado de inferencia.
- GPU recomendadas: no disponible. Por el tamano de los componentes, es probable que quepa en GPU de consumo, pero no se confirma en la documentacion.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: la model card documenta scripts propios (`scripts/generate.py`, `scripts/webui.py`, `scripts/generate_models.py`) y la libreria `bsgen`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de generacion de mapas de Beat Saber en la documentacion proporcionada. La busqueda web solo devuelve el propio repositorio y el listado de modelos con la etiqueta `nebulamapper`. Por tanto, la comparativa se considera no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NebulaMapper | Conjunto de componentes (65M+, 47M+, 38M+, 7M+, etc.) | No disponible | AGPL-3.0 | Hugging Face |
| Alternativas | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La licencia AGPL-3.0 impone obligaciones de copyleft fuerte: el uso en servicios en red puede requerir la publicacion del codigo fuente modificado. Es necesario revisar el cumplimiento antes de un uso comercial.
- No se documentan sesgos conocidos, pero al entrenarse sobre mapas y replays de una comunidad concreta, el estilo generado puede reflejar los sesgos de esos datos (patrones, dificultades y preferencias de una parte de la comunidad).
- Riesgo de alucinacion en el sentido de generar patrones no jugables o desalineados con el audio; no se documentan metricas de validacion de jugabilidad.
- No se especifican limitaciones de contexto ni de idioma; el modelo no procesa texto, por lo que la nocion de idioma no aplica directamente.
- El repositorio tiene 53 descargas y 0 likes en el momento de la consulta, lo que indica una validacion externa muy limitada.
- Los metadatos de construccion (mezcla de checkpoints de 0,08, modo `nebula_evolved`) no van acompanados de documentacion sobre su impacto en la calidad.
- No se detallan los datos de entrenamiento, lo que dificulta evaluar la cobertura musical y la generalizacion a generos no representados.
- El uso del bot de jugador para interacciones automatizadas en entornos de realidad virtual puede contravenir las condiciones de servicio de las plataformas correspondientes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PhantomVoidTTV/NebulaMapper
- Listado de modelos con etiqueta `nebulamapper`: https://huggingface.co/models?other=nebulamapper
