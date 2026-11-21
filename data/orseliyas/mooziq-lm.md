# orseliyas/mooziq-lm

## Resumen

Mooziq LM es una familia de transformers de muy pequeno tamano desarrollada por Varun Lohade (usuario `orseliyas` en Hugging Face) que genera musica lo-fi de forma simbolica: acordes, melodias, lineas de bajo y planes de cancion. El modelo esta disenado para ejecutarse en tiempo real dentro de un navegador web con JavaScript plano, sin ONNX ni librerias de runtime, y alimenta el sitio Unlimited Lofi Music (lofi.varunlohade.com), una lista de reproduccion infinita generada en el dispositivo del usuario.

La familia incluye cinco variantes: `B483K` (483.653 parametros, la usada en produccion), dos estudiantes destilados cuantizados (`S8-int8` con 4,84 M de parametros y `S4-int4` con 8,75 M), un planificador de canciones (`planner`, 114.802 parametros) y un compositor condicionado por plan (`song-composer`, 506.768 parametros). Todos son transformers decoder-only con embeddings aprendidos de token, posicion y slot, bloques pre-LayerNorm, MLPs con GELU y cache KV.

El interes del proyecto es practico y educativo: demuestra que un modelo simbolico de menos de un megabyte puede generar musica coherente si se combina con decodificacion restringida (mascaras diatonicas, notas de paso sobre acordes, bloqueo de choques de semitono). No compite en calidad con modelos generativos de audio grandes; compite en latencia, huella de memoria y portabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con embeddings de token, posicion y slot; pre-LayerNorm, MLP GELU, cache KV |
| Parametros totales | 483.653 (B483K); 4,84 M (S8-int8); 8,75 M (S4-int4); 114.802 (planner); 506.768 (song-composer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generacion por compas y por plan; sin cifra publicada) |
| Tipos de cuantizacion | fp16 nativo; int8 con escalas por fila; int4 con escalas por grupo |
| Idiomas soportados | no disponible (salida simbolica musical, no texto) |
| Licencia | MIT |
| Formato de pesos | `.bin` crudo (fp16/int8/int4) acompanado de `model.json` con layout de tensores y vocabulario, y `meta.json` |

## Arquitectura y entrenamiento

Los cinco modelos son transformers decoder-only con embeddings aprendidos de token, posicion y slot, bloques pre-LayerNorm, MLPs con activacion GELU y cache KV. El kernel de inferencia (`transformer.js`, unas 50 lineas) ejecuta los pesos directamente en el navegador o en Node sin dependencias externas. `planner` y `song-composer` usan un periodo de slot definido en `meta.SLOT` y requieren `transformer_slot.js`; los estudiantes cuantizados se cargan con `qload.js`, que desnormaliza a fp16 y luego usa el mismo kernel.

Los datos de entrenamiento son exclusivamente simbolicos. Se usan 3.515 melodias de dominio publico del corpus music21 (obras clasicas y folk tradicionales, 43.463 compases) y 1.612 clips instrumentales generados con ACE-Step 1.5 (MIT) para los modelos de compas, mas 587 canciones instrumentales completas para el planner y el song-composer. Las transcripciones se hicieron con basic-pitch (Apache-2.0) y librosa (ISC), y las pistas de canciones completas con Demucs (MIT). Los estudiantes se destilaron a partir de muestras de un ensemble de cinco modelos entrenados sobre los mismos datos. No se usaron salidas de modelos cerrados ni grabaciones comerciales.

## Capacidades

- Generacion simbolica de musica lo-fi: acordes (septimas diatonicas), melodia de 8 pasos por compas y linea de bajo.
- Generacion de planes de cancion: secciones con tipo, longitud, energia, pistas activas y transicion, en 9 estilos.
- Composicion condicionada por plan: acordes, 8 pasos de melodia y 8 pasos de bajo por compas.
- Estilos soportados por los modelos de compas: Jazz Hop, Steady, Flow, Folk; el planner y el song-composer cubren 9 estilos.
- Inferencia en navegador con JavaScript plano, sin ONNX ni librerias de runtime.
- Ejecucion en Node para pruebas y pipelines.
- No soporta tool calling, function calling, agentes, vision, audio ni texto: la salida es exclusivamente simbolica musical.
- Capacidades multilingues: no aplica (sin entrada ni salida en lenguaje natural).

## Casos de uso

- Musica de fondo generativa en web: el modelo `B483K` se ejecuta en el navegador del visitante y produce una lista de reproduccion infinita sin coste de servidor, como demuestra el sitio lofi.varunlohade.com.
- Composicion asistida en tiempo real: escribir una cancion completa en unos 0,3 s permite regenerar secciones al vuelo cuando el usuario cambia de estilo o de energia.
- Investigacion sobre modelos musicales simbolicos diminutos: la familia completa (con estudiantes int8/int4 y planificador) sirve para estudiar destilacion, cuantizacion y decodificacion restringida en un dominio de baja dimensionalidad.
- Docencia sobre decodificacion restringida: el codigo de enmascarado (acordes diatonicos, notas de paso, bloqueo de semitonos) es un ejemplo concreto y reproducible de como las reglas elevan la calidad de un modelo pequeno.
- Prototipado de interfaces musicales: integrar el kernel en editores o juguetes web que necesiten generar acompanamiento sin backend ni latencia de red.
- Aplicaciones offline o embebidas: al no depender de ONNX ni de librerias, los pesos pueden incluirse en una PWA o en un entorno Node para generar musica en dispositivos con recursos limitados.
- Generacion de bandas sonoras para prototipos de juegos o visualizaciones: el `song-composer` condicionado por plan permite variar secciones y energia de forma controlada.

## Benchmarks y rendimiento

| Modelo | Perdida en held-out (ACE) | Perdida en held-out (dominio publico) |
|---|---|---|
| B483K | 1,326 | 1,133 |
| S8-int8 | 1,304 | 1,038 |
| S4-int4 | 1,301 | 1,025 |

| Modelo | Perdida de validacion | Baseline unigrama |
|---|---|---|
| planner | 0,629 | 1,516 |
| song-composer | 1,832 | 2,544 |

- Paridad del kernel de navegador con referencia numpy en float64: diferencia maxima de logits de 7e-7.
- En el sitio en produccion con `B483K`: una cancion completa tarda unos 0,3 s; 210 canciones (12,8 horas) se generaron sin crecimiento de memoria; una ejecucion de 31 minutos en pestana oculta no produjo underruns de audio.
- No se han publicado resultados en benchmarks estandar de musica (MMLU, HumanEval, GSM8K no aplican a este dominio).

## Requisitos de hardware

- VRAM estimada: inferior a 10 MB para `B483K` en fp16 (0,97 MB de pesos mas cache KV y buffers); alrededor de 5 MB para `S8-int8` y `S4-int4`; menos de 2 MB para `planner` y `song-composer`.
- GPU recomendadas: no requiere GPU; el kernel esta pensado para CPU en navegador. Cualquier GPU moderna acelera la generacion pero no es necesaria.
- Cabe en cualquier GPU de consumo e incluso en moviles y navegadores de gama baja; el cuello de botella es el motor de audio, no el modelo.
- Opciones de despliegue: JavaScript en navegador o Node (`transformer.js`, `transformer_slot.js`, `qload.js`). No hay integracion con vLLM, llama.cpp, Ollama ni TGI porque el modelo no es de lenguaje y usa un formato propio.
- Latencia y throughput: unos 0,3 s por cancion completa en el sitio en produccion con `B483K`; 210 canciones consecutivas sin fugas de memoria; 31 minutos de reproduccion sin underruns en pestana oculta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mooziq LM (B483K) | 483.653 | no disponible | Musica simbolica lo-fi en navegador | MIT | Hugging Face y GitHub |
| Mooziq LM (S4-int4) | 8,75 M | no disponible | Musica simbolica lo-fi, estudiante destilado | MIT | Hugging Face y GitHub |
| ACE-Step 1.5 | no disponible | no disponible | Generacion de audio musical | MIT | Usado como fuente de datos; no se compara en rendimiento |
| Modelos de musica simbolica de mayor tamano | no disponible | no disponible | Generacion simbolica | variable | no disponible |

No se dispone de comparaciones de rendimiento con alternativas en la informacion proporcionada; la tabla recoge solo datos estructurales y de licencia.

## Limitaciones y advertencias

- Modelos muy pequenos: en produccion, buena parte de la calidad musical la aportan las reglas y la decodificacion restringida; muestreados libremente, los resultados son notablemente mas toscos.
- Vocabulario restringido: acordes de septima diatonicos, compas de 4/4, rejilla de corcheas, una melodia y una linea de bajo.
- Las melodias de entrenamiento son transcripciones automaticas de audio generado, por lo que contienen ruido.
- Los estilos mas nuevos tienen muy pocos datos (unas 68 canciones cada uno).
- Las etiquetas de pista del planner para estilos sin bateria son ruidosas (a veces marca bateria); conviene enmascarar la bateria en la decodificacion para esos estilos.
- No se ha realizado ningun estudio de escucha con personas.
- Riesgo de alucinacion en sentido musical: secuencias de acordes o notas incoherentes si se eliminan las mascaras de decodificacion.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- No apto para generacion de audio directo ni para tareas de lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/orseliyas/mooziq-lm
- Demo en produccion: https://lofi.varunlohade.com
- Codigo, motor y pipeline de entrenamiento: https://github.com/varunlohade/mooziq-lm
- Documentacion de datos: https://github.com/varunlohade/mooziq-lm/blob/main/DATA.md
- Formatos de token cuantizados: `FORMAT-quantized.md` (en el repositorio)
- Formatos de modelos de cancion: `FORMAT-song-models.md` (en el repositorio)
