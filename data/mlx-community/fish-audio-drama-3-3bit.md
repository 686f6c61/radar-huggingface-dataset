# mlx-community/fish-audio-drama-3-3bit

## Resumen

Fish Audio Drama 3 MLX 3-bit es una conversion no oficial del modelo de sintesis de voz (text-to-speech) fishaudio/drama-3 al formato MLX, realizada por la comunidad mlx-community y medida por Navneet Sharma (@Nav8ha). El modelo original lo desarrolla Fish Audio y esta orientado a generacion de voz multi-hablante con clonacion de voz zero-shot a partir de un clip de referencia. Esta version concreta cuantiza los expertos enrutados a 3 bits y mantiene las proyecciones densas y la torre de audio a 8 bits, lo que reduce el checkpoint a 18,5 GB en disco y a un pico de 22,5-24 GB de memoria durante la generacion.

El objetivo de esta conversion es ejecutar Drama 3 en local sobre Apple Silicon (framework MLX), sin GPU dedicada ni servicios en la nube, manteniendo la calidad del release de 8 bits. Segun las mediciones del autor, este checkpoint obtuvo un WER de 1,4 % con Whisper large-v3-turbo, una similitud de hablante ECAPA de 0,610 y un UTMOS de 4,04 sobre 20 clips clonados en ingles, resultados que en su barrido son iguales o mejores que los del propio modelo con expertos a 8 bits (WER 1,6 %, UTMOS 3,92).

Es relevante ahora por dos motivos: primero, porque permite sintesis de voz multilingue (83 identificadores de idioma declarados) con clonacion de voz en un Mac de 32 GB; segundo, porque el soporte de Drama 3 se ha integrado en mlx-audio mediante el PR #1018, todavia sin release, de modo que su uso requiere instalar desde `main`. La licencia Fish Audio Community License v1.0 impone restricciones de uso y condiciones especificas para explotacion comercial y servicios alojados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) para text-to-speech: expertos enrutados, proyecciones densas y torre de audio. El numero de capas, atencion y detalles internos no esta disponible |
| Parametros totales | no disponible (el checkpoint bf16 equivalente del mismo autor ocupa 67 GB) |
| Parametros activos | no disponible (el modelo usa expertos enrutados, pero no se publica cuantos se activan por token) |
| Longitud de contexto | no disponible. En las pruebas del autor se genero un guion de formato largo de 43 s |
| Tipos de cuantizacion | Expertos enrutados a 3 bits, proyecciones densas y torre de audio a 8 bits. Existen variantes 4-bit (22 GB) y bf16 (67 GB) |
| Idiomas soportados | 83 idiomas declarados en la model card, entre ellos zh, en, ja, ko, es, pt, ar, ru, fr, de, it, hi, vi, th, tr, nl, pl, sv, fi, he, uk, id, eu, ca, gl, cy y gaélico-escoces (gd no listado; si fo, nn, br, mi, sn, yo, jw) |
| Licencia | fish-audio-community-license-v1.0 (licencia de comunidad, con restricciones de uso) |
| Formato de pesos | Pesos MLX para la libreria mlx-audio (el contenedor exacto no se especifica en la model card) |
| Tamano en disco | 18,5 GB (19,8 GB de repositorio en HuggingFace) |
| Memoria pico en generacion | 22,5-24 GB |
| Idioma de la interfaz / muestreo | Salida de audio a 44,1 kHz |

## Arquitectura y entrenamiento

El modelo base es fishaudio/drama-3, un sistema de sintesis de voz con arquitectura de mezcla de expertos: la model card de esta conversion distingue explicitamente entre "routed experts" (expertos enrutados, cuantizados aqui a 3 bits) y "dense projections and audio tower" (proyecciones densas y torre de audio, mantenidas a 8 bits). Esto indica un transformer con capas MoE combinado con un decodificador de audio, aunque no se detallan el numero de capas, la dimension del modelo, el tamano del vocabulario de tokens de audio ni el mecanismo de atencion. La conversion se realizo con el conversor de mlx-audio (`python -m mlx_audio.tts.models.fish_drama3.convert --src drama-3 --dst drama-3-mlx-3bit --expert-bits 3 --dense-bits 8 --tower-bits 8`) a partir del release block-FP8 del modelo original.

No se dispone de informacion sobre el entrenamiento: numero de tokens, composicion del dataset, idiomas de entrenamiento reales frente a los declarados, ni si hubo etapas de RLHF, DPO o ajuste por preferencias. Lo unico documentado sobre el proceso de conversion es que los expertos de 3 bits se deobtuvieron desde el checkpoint block-FP8, que el autor verifico que esta configuracion conserva la calidad de los expertos a 8 bits y que los expertos a 2 bits se descartaron porque perdian las dos ultimas lineas de un dialogo multi-hablante. El fichero `NOTICE` del repositorio lista todos los cambios aplicados a los pesos originales.

En el plano funcional, la innovacion destacable no es arquitectonica sino de despliegue: es la cuantizacion mas agresiva de Drama 3 que mantiene calidad util, con generacion a ~36 frames/s en un M5 Max (1,7x tiempo real) y soporte de streaming, multi-referencia y etiquetas de hablante (`<|speaker:0|>` a `<|speaker:15|>`) descrito en la documentacion de mlx-audio.

## Capacidades

- Sintesis de voz (text-to-speech) mono y multi-hablante: hasta 16 hablantes identificables mediante etiquetas `<|speaker:0|>` a `<|speaker:15|>` en el mismo texto.
- Clonacion de voz zero-shot: acepta `ref_audio` y `ref_text` (transcripcion del clip de referencia) y reproduce el timbre del hablante de referencia.
- Multiples referencias de audio en una misma generacion, segun la documentacion de mlx-audio.
- Control de efectos vocales no verbales mediante marcas en el texto, verificadas en las pruebas del autor: `[sighs]` y `[laughs]`.
- Generacion de formato largo: se probo un guion de 43 s y dialogos de dos hablantes.
- Multilingue: 83 identificadores de idioma declarados, con pruebas adicionales en hinglish y hindi.
- Salida de audio a 44,1 kHz, heredando el ancho de banda del audio de referencia cuando este es de 44,1 kHz.
- Streaming de la generacion (soportado por mlx-audio para este modelo).
- Ejecucion local en Apple Silicon mediante MLX, sin dependencia de servicios externos.
- No se documenta soporte de tool calling, function calling, capacidades de agente, vision, audio de entrada como comprension ni modo de razonamiento: es un modelo exclusivamente generativo de audio.

## Casos de uso

- Doblaje y localizacion de contenido: clonar la voz de un actor o locutor con un clip de referencia de 44,1 kHz y generar la misma linea en varios de los 83 idiomas declarados, manteniendo el timbre en cada version. Util para trailers, cursos y material corporativo en varios mercados.
- Audiolibros y narracion larga: generar capitulos con un hablante clonado del propio narrador y controlar pausas y efectos (`[sighs]`, `[laughs]`) para dar expresividad; la prueba de 43 s de guion continuo indica que soporta tramos de formato largo, aunque la longitud maxima verificada es limitada.
- Post-produccion de podcasts y radio: generar dialogos de dos o mas voces con etiquetas de hablante, por ejemplo para insertar una entradilla o corregir una frase sin regrabar al invitado.
- Asistentes de voz y agentes conversacionales en local: al ejecutarse integramente en un Mac de 32 GB, es adecuado para prototipos donde la privacidad impide enviar la voz del usuario a la nube (clinicas, despachos legales, banca interna).
- Videojuegos y experiencias interactivas: sintetizar lineas de personaje con voces distintas usando el mismo checkpoint, con latencia de 1,7x tiempo real en un M5 Max, suficiente para dialogos pregrabados o semidirigidos.
- Accesibilidad y lectura de pantalla: convertir texto en voz personalizada para usuarios que quieren conservar su propia voz tras perderla, a partir de grabaciones previas como referencia (con consentimiento explicito).
- Prototipado de voces para animacion: generar versiones preliminares de personajes con multiples referencias antes de contratar al actor final, reduciendo coste de iteracion en la fase de guion.
- Generacion de materiales de formacion multilingues: un unico guion con marcas de hablante produce el mismo curso con dos o tres voces consistentes en varios idiomas, sin regrabar cada version.

## Benchmarks y rendimiento

Datos publicados por el autor de la conversion (Navneet Sharma), medidos con 20 clips de clonacion de voz en ingles: 10 frases por 2 semillas, sobre un M5 Max. La metrica de inteligibilidad es el WER con Whisper large-v3-turbo; la similitud de hablante es ECAPA frente a un clip reservado del hablante de referencia; se incluye UTMOS. "Failed" indica WER superior al 20 % o ausencia de fin de voz.

| Expertos / densas | Backbone | WER | Fallos | Similitud de hablante | UTMOS |
|---|---|---|---|---|---|
| 8 / 8 | 34,3 GB | 1,6 % | 0/20 | 0,625 | 3,92 |
| 4 / 8 | 19,3 GB | 2,5 % | 0/20 | 0,619 | 3,92 |
| 3 / 8 (este modelo) | 16,9 GB | 1,4 % | 0/20 | 0,610 | 4,04 |
| 2 / 8 | 11,8 GB | 0,9 % | 0/20 | 0,624 | 3,84 |
| 3 / 3 | 14,1 GB | 26,7 % | 9/20 | 0,561 | 3,13 |

Notas metodologicas declaradas por el autor: la fila de este modelo se midio sobre este checkpoint exacto a traves de mlx-audio, mientras que el resto de filas provienen del mismo barrido realizado con un port independiente a MLX. En una prueba de escucha a ciegas (6 lineas por 3 versiones), el oyente no prefirio la version de 8 bits frente a esta. Los expertos a 2 bits se descartaron por perdida de contenido en dialogos multi-hablante. Ademas se comprobo en esta configuracion dialogo de dos hablantes, marcas `[sighs]`/`[laughs]`, hinglish, hindi y un guion largo de 43 s.

No hay benchmarks comparativos con otros sistemas TTS (por ejemplo, comparaciones con modelos de otros desarrolladores) en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria unificada: 18,5 GB en disco y un pico de 22,5-24 GB durante la generacion. El autor indica que cabe en un Mac de 32 GB de memoria unificada; no cabe en configuraciones de 16 GB.
- Hardware validado: Apple Silicon, medido en un M5 Max a ~36 frames/s (1,7x tiempo real).
- Compatibilidad con GPU: MLX esta disenado para Apple Silicon, por lo que no hay soporte CUDA. En GPU NVIDIA no es ejecutable con esta conversion, y no se documenta compatibilidad con ROCm ni con CPU x86.
- Despliegue: mlx-audio. El soporte de Drama 3 esta fusionado en el repositorio pero todavia no en un release, por lo que hay que instalar desde `main` (`pip install "mlx-audio[tts] @ git+https://github.com/Blaizzy/mlx-audio"`). Se puede usar desde Python (`mlx_audio.tts.utils.load_model`) o por linea de comandos (`python -m mlx_audio.tts.generate`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput: aproximadamente 36 frames/s en M5 Max. No se publican metricas de latencia por peticion ni de throughput agregado con varias peticiones concurrentes.
- Parametros de muestreo recomendados por el autor en el ejemplo de CLI: `temperature 0.7`, `top_p 0.7`, `top_k 30`.
- Recomendacion de entrada: usar grabaciones de referencia a 44,1 kHz, porque el modelo copia el ancho de banda de la referencia.

## Comparativa con modelos similares

No se dispone de comparativas con otros sistemas TTS de la misma categoria en la informacion proporcionada. La unica comparacion con datos verificables es entre las distintas cuantizaciones del mismo Drama 3 publicadas por mlx-community.

| Modelo | Tipo | Tamano | Calidad medida (WER / similitud / UTMOS) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlx-community/fish-audio-drama-3-3bit | MLX, expertos 3 bits, densas 8 bits | 18,5 GB en disco, 22,5-24 GB pico | 1,4 % / 0,610 / 4,04 (ingles, 20 clips) | Fish Audio Community License v1.0 | HuggingFace, uso desde `main` de mlx-audio |
| mlx-community/fish-audio-drama-3-4bit | MLX, expertos 4 bits | 22 GB | 2,5 % / 0,619 / 3,92 (fila "4 / 8" del barrido) | Fish Audio Community License v1.0 | HuggingFace |
| mlx-community/fish-audio-drama-3-bf16 | MLX, precision completa | 67 GB | 1,6 % / 0,625 / 3,92 (fila "8 / 8" del barrido) | Fish Audio Community License v1.0 | HuggingFace |
| fishaudio/drama-3 | Modelo original en formato nativo | no disponible | no disponible | Fish Audio Community License v1.0 | HuggingFace |

Aviso metodologico: salvo la fila del modelo de 3 bits, las metricas de calidad de la tabla provienen del barrido del autor en un port independiente a MLX, no del mismo runtime, segun se indica en su propia model card.

## Limitaciones y advertencias

- Conversion no oficial: la model card indica explicitamente que Fish Audio no publico ni respalda esta conversion. Cualquier incidencia de calidad debe atribuirse al proceso de cuantizacion de la comunidad.
- Licencia restrictiva: la Fish Audio Community License v1.0 incluye restricciones de uso y condiciones especificas para uso comercial y servicios alojados. Hay que revisar el fichero `LICENSE` del repositorio antes de desplegar en produccion o de ofrecer inferencia como servicio.
- Clonacion de voz: la propia model card advierte de no clonar la voz de una persona sin su consentimiento. Existe riesgo legal y etico directo en doblaje, publicidad y contenido sintetico.
- Degradacion por cuantizacion: la similitud de hablante de esta version (0,610) es ligeramente inferior a la del modelo bf16 (0,625) y a la de 4 bits (0,619). Bajar de 3 bits en los expertos no es viable: la configuracion con expertos y densas a 3 bits dispara el WER al 26,7 % y falla en 9 de 20 clips; la de expertos a 2 bits pierde contenido en dialogos.
- Alucinacion y omisiones: en TTS el fallo tipico no es inventar hechos, sino omitir lineas, cortar la generacion antes del final o producir texto no solicitado. El autor documento perdida de las dos ultimas lineas en dialogos con expertos a 2 bits, lo que evidencia que la cuantizacion agresiva puede provocar omisiones de contenido.
- Evaluacion limitada: las mediciones publicadas cubren 20 clips de clonacion en ingles sobre una unica maquina (M5 Max). No hay datos publicos de calidad en el resto de los 83 idiomas declarados, ni de estabilidad en generaciones muy largas mas alla del guion de 43 s.
- Dependencia del audio de referencia: la calidad y el ancho de banda de la salida estan condicionados por la grabacion de referencia; el modelo copia su banda de frecuencia, por lo que una referencia de baja calidad degrada el resultado.
- Dependencia de software: requiere Apple Silicon con MLX y, en la fecha de publicacion, instalar mlx-audio desde `main` porque el soporte no esta en un release. No hay ruta de despliegue documentada para GPU NVIDIA ni para CPU.
- Sin datos de sesgo: no se publica informacion sobre sesgos demograficos, de acento o de genero en las voces generadas. No disponible.
- Metricas no comparables entre runtimes: el autor advierte que su fila se midio en mlx-audio mientras que el resto del barrido proviene de un port independiente; las diferencias pequenas de WER o UTMOS deben interpretarse con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/fish-audio-drama-3-3bit
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Variante 4 bits: https://huggingface.co/mlx-community/fish-audio-drama-3-4bit
- Variante bf16: https://huggingface.co/mlx-community/fish-audio-drama-3-bf16
- Repositorio mlx-audio: https://github.com/Blaizzy/mlx-audio
- Pull request con el soporte de Drama 3: https://github.com/Blaizzy/mlx-audio/pull/1018
- Documentacion del modelo en mlx-audio: https://github.com/Blaizzy/mlx-audio/blob/main/docs/models/tts/fish-drama3.md
- Fichero de licencia del repositorio: LICENSE (dentro del repositorio de HuggingFace)
- Pagina de MLX (framework de Apple): https://mlx-framework.org/
- Repositorio de MLX: https://github.com/ml-explore/mlx
- MLX en Apple Open Source: https://opensource.apple.com/projects/mlx/
- Entrada de MLX en Wikipedia: https://en.wikipedia.org/wiki/MLX_(machine_learning_framework)
- MLX Studio: https://mlx.studio/
