# dat-dev/scoreformer

## Resumen

Scoreformer es el componente seq2seq del proyecto "Piano score models (dl-proj-2026)" publicado por el usuario dat-dev en Hugging Face. Se trata de un modelo encoder-decoder de 44,9M de parametros que convierte una interpretacion de piano (MIDI, tipicamente la transcripcion de Transkun V2 a partir de audio) en una partitura simbolica en formato MusicXML. No es un modelo de lenguaje generalista: es una herramienta especializada en transcripcion musical simbolica, entrenada sobre pares de interpretaciones alineadas con sus partituras.

El repositorio agrupa tres modelos complementarios: el propio Scoreformer (`seq2seq/`), un etiquetador de notas (`v2_labeller/`, 25,6M de parametros) y un modelo de compas y metrica (`v2_meter/`, 4,8M de parametros). Scoreformer escribe tokens de partitura ventana a ventana tomando los pulsos (beats) como entrada, mientras que la variante "v2" combina un seguimiento de pulsos externo (Beat This!) con el modelo de metrica y el etiquetador de notas.

Su relevancia es acotada pero clara: automatiza el paso de audio/MIDI a partitura legible, un problema clasico de music information retrieval (MIR) que hasta hace poco dependia de herramientas heuristicas. El modelo se distribuye con el codigo del proyecto, un demo web y una CLI, y su evaluacion se realiza con las metricas de Beyer & Dai (MUSTER y similitud de partitura) sobre piezas completas. La licencia no esta declarada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) para tokens de partitura, con beats como entrada |
| Parametros totales | 44,9M (Scoreformer, carpeta `seq2seq/`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generacion ventana a ventana sobre la pieza) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo simbolico musical, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch (pesos y config del modelo, sin estado del optimizador); vocabulario en `vocab.json`; manifiesto con sha256 en `manifest.json` |

## Arquitectura y entrenamiento

Scoreformer es un encoder-decoder transformer que genera tokens de partitura de forma secuencial por ventanas, condicionado por los pulsos de la interpretacion. El proyecto lo complementa con dos modelos auxiliares: `v2_meter` (transformer de 4,8M de parametros sobre los beats rastreados que predice inicios de compas, duraciones de pulso y compases, con decodificacion Viterbi para obtener una rejilla metrica coherente en toda la pieza) y `v2_labeller` (encoder transformer de 25,6M de parametros sobre una ventana de notas interpretadas, con cabeceras por nota para conservar/eliminar, correccion de compas, posicion en el compas, duracion escrita, pentagrama y marcas de adorno, arpegio y gracia).

El entrenamiento usa ASAP (fork corregido de Beyer & Dai) con interpretaciones alineadas a partitura y anotaciones de pulso, anadiendo ruido de transcripcion sintetico ajustado a los errores reales de Transkun V2; transcripciones reales de Transkun V2 de interpretaciones de ASAP cuyo audio no se uso en su entrenamiento (test y validacion de MAESTRO); el subconjunto PERiScoPe de PianoCoRe, alineado nota a nota; y, para el modelo de metrica, Gangqinpu (pop, folk, jazz y clasico) como mitad de cada lote. La particion de test es la de Beyer & Dai: 14 piezas y 59 interpretaciones, 24 de ellas con grabacion real. El run de Scoreformer es `sf_base_reg_cab_c128`; el del etiquetador, `nl_base_gn` (paso 18.000, con jitter temporal en el entrenamiento); el de metrica por defecto, `meter_v4_gq` (paso 56.000).

## Capacidades

- Conversion de interpretaciones de piano en MIDI a partitura simbolica en MusicXML.
- Generacion de tokens de partitura ventana a ventana condicionada por pulsos, con decodificacion metrica coherente a nivel de pieza (Viterbi en `v2_meter`).
- Prediccion de compases, duraciones de pulso y armadura de compas a partir de los beats rastreados.
- Etiquetado por nota: conservar o eliminar notas espurias, correccion de compas, posicion en el compas, duracion escrita, pentagrama y marcas de gracia, arpegio y ornamentos.
- Flujo completo audio a partitura mediante la CLI (`scripts/audio_to_score.py recording.wav --v2`), que encadena transcripcion (Transkun V2), seguimiento de pulsos (Beat This!) y generacion de partitura.
- Demo web local en Gradio (`demo/app.py`, puerto 127.0.0.1:7860) que acepta una grabacion y devuelve una partitura.
- No soporta tool calling, agentes, vision, audio nativo ni capacidades multilingues: es un modelo de dominio especifico.

## Casos de uso

- Digitalizacion de grabaciones de piano: a partir de un audio, la CLI encadena Transkun V2, Beat This! y Scoreformer para producir un MusicXML editable, util para archivos musicales o ediciones.
- Correccion y edicion de partituras: el MusicXML generado puede abrirse en MuseScore, Finale o Dorico para retocar notas, compases y duraciones antes de publicar.
- Acompanamiento pedagogico: generar una partitura aproximada de una interpretacion de alumno para comparar lo tocado con lo escrito y detectar desviaciones de ritmo o notas.
- Investigacion en MIR: el proyecto expone checkpoints por run (`runs/<run>/`), manifiesto con hashes y metricas de test, lo que permite reproducir experimentos de transcripcion simbolica y comparar variantes de metrica.
- Prototipado de herramientas musicales: el demo Gradio y la CLI sirven de base para integrar transcripcion a partitura en aplicaciones de practica, karaoke simbolico o analisis de interpretaciones.
- Analisis de repertorio no clasico: el modelo de metrica por defecto (`meter_v4_gq`) esta entrenado con pop, folk y jazz de Gangqinpu, lo que mejora la deteccion de compas en grabaciones no clasicas (0,79 de acierto de compas frente a 0,54 del modelo solo clasico).
- Generacion de material de estudio: convertir interpretaciones de referencia en partituras para crear ejercicios o reducciones, siempre con revision humana dada la tasa de error del sistema.

## Benchmarks y rendimiento

Evaluacion sobre piezas completas con las metricas de Beyer & Dai (MUSTER y similitud de partitura). Tasa de error en %, menor es mejor. MUSTER medio en audio real (24 interpretaciones transcritas por Transkun) y MIDI limpio (59):

| Sistema | MUSTER medio real / limpio |
|---|---|
| Beyer & Dai (ISMIR 2024, su checkpoint) | 11,14 / 11,05 |
| seq2seq (`seq2seq/`, decodificacion metrica) | 10,65 / 11,74 |
| v2 (`meter_v4_gq` + `v2_labeller`, con estos ajustes) | 12,70 / 15,18 |
| v2 con modelo de metrica solo clasico (`meter_v3`, release v2-round4) | 12,31 / 14,53 |

Comparativa de los dos sistemas en audio real (v2 con `meter_v3`): v2 es mejor en altura (2,26 frente a 3,06), notas extra (11,80 frente a 13,48) y escritura (6,58 frente a 10,92); el modelo seq2seq es mejor en inicios (9,90 frente a 13,82), finales y notas omitidas. A nivel de ventana (PERiScoPe), v2 obtiene F1 de inicios de 0,488; con la rejilla metrica verdadera subiria a 0,857, lo que indica que la mayor parte del error de v2 proviene del modelo de metrica. En una pieza fuera del clasico (arreglo de anime en 4/4), el seq2seq cambio de compas 6 veces y escribio 37 compases extra, mientras que v2 mantuvo 4/4; es una sola pieza evaluada de oido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 44,9M de parametros (Scoreformer) y 25,6M + 4,8M (etiquetador y metrica), el conjunto es pequeno y previsiblemente cabe en GPU consumer, pero no se publican cifras.
- GPU recomendadas: no disponible. El proyecto no especifica requisitos de GPU; el flujo completo incluye Transkun V2 y Beat This!, cuyos requisitos no se detallan.
- Cabe en GPU consumer: no confirmado en la documentacion; por tamano de parametros es plausible, pero no hay dato oficial.
- Opciones de despliegue: codigo del proyecto con PyTorch, entorno Conda (`environment.yml`), demo Gradio (`demo/app.py`) y CLI (`scripts/audio_to_score.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MUSTER real / limpio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Scoreformer (`seq2seq/`) | 44,9M | no disponible | 10,65 / 11,74 | no disponible | Hugging Face (dat-dev/scoreformer) |
| v2 (`v2_meter` + `v2_labeller`) | 4,8M + 25,6M | no disponible | 12,70 / 15,18 (12,31 / 14,53 con `meter_v3`) | no disponible | Hugging Face, mismo repo |
| Beyer & Dai (ISMIR 2024) | no disponible | no disponible | 11,14 / 11,05 | no disponible | checkpoint del paper, no en este repo |

No se dispone de datos de otros sistemas comparables (por ejemplo, herramientas heuristicas de transcripcion a partitura) en la informacion proporcionada.

## Limitaciones y advertencias

- Valores de nota en el nivel metrico equivocado: el modelo de metrica escribe con frecuencia la pieza entera a mitad o doble valor (3/8 por 3/4, 2/4 por 2/2). Acierta el nivel en el 64% de las interpretaciones de test; la precision de compas por barra es 0,44 en grabaciones reales y 0,64 en PERiScoPe. Elegir el nivel a posteriori no ayudo (ronda 5).
- La entrada MIDI se procesa a traves de un renderizado: los pulsos provienen del MIDI renderizado a audio, lo que anade una dependencia del pipeline de audio.
- Dependencia de modelos externos: el flujo completo requiere Transkun V2 (transcripcion) y Beat This! (pulsos), cuyas limitaciones y licencias condicionan el resultado final.
- Rendimiento fuera del clasico: en una pieza de anime en 4/4, el seq2seq cambio de compas 6 veces y genero 37 compases extra; la evaluacion es de una sola pieza y de oido.
- El etiquetador v2 solo elimina notas cuando p(delete) > 0,95, lo que puede dejar notas espurias; las duraciones escritas se ajustan con heuristica (`manifest.json`, `settings`).
- Licencia no declarada: no se puede confirmar el uso comercial. Gangqinpu se distribuye bajo CC BY-NC-SA 4.0, lo que afecta al modelo de metrica entrenado con sus datos.
- Datos de entrenamiento limitados a piano y a repertorio de ASAP, MAESTRO, PianoCoRe y Gangqinpu; no hay garantia de generalizacion a otros instrumentos o generos.
- Riesgo de alucinacion en el sentido de notas o compases inventados: el sistema genera tokens de partitura y puede producir compases o notas no presentes en la interpretacion, como muestra el caso del anime.
- Los checkpoints solo contienen pesos y config, sin estado del optimizador; no se pueden reanudar entrenamientos desde ellos.
- El vocabulario (`vocab.json`) esta ligado a la build de datos: el codigo rechaza vocabularios de otras builds.

## Enlaces

- Hugging Face: https://huggingface.co/dat-dev/scoreformer
- Repositorio del proyecto (referenciado como `<the project's repo>` en la model card; URL no disponible)
- Demo web local: `demo/app.py` (http://127.0.0.1:7860)
- CLI: `scripts/audio_to_score.py`
- Documentacion de experimentos: `docs/experiments.md` del proyecto
- Paper de referencia: Beyer & Dai, ISMIR 2024 (URL no disponible)
- Dataset ASAP (fork corregido de Beyer & Dai): URL no disponible
- Dataset Gangqinpu: https://huggingface.co/datasets/Wayne42/gangqinpu
- Transkun V2: URL no disponible
- Beat This!: URL no disponible
