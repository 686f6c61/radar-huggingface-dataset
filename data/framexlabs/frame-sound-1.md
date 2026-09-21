# FrameXlabs/Frame-Sound-1

## Resumen

Frame-Sound-1 es un generador de musica simbolica a nivel de evento publicado por FrameXlabs dentro de su familia de lanzamientos "Frame AI". No es una red neuronal: es una cascada de cadenas de Markov y tablas de frecuencias entrenadas por conteo de maxima verosimilitud sobre el dataset Frame Dataset — Sound (2.400 composiciones estructuradas). El artefacto completo ocupa 57 KB en un unico fichero `model.json`, por lo que no requiere GPU ni acelerador alguno: se ejecuta en cualquier entorno donde corra JavaScript (la model card usa Bun para el CLI de inferencia).

El modelo genera bucles completos de 8 compases como eventos estructurados (acordes, melodia, bajo, bateria y un caption) que despues se renderizan con cualquier sintetizador. Cubre 6 generos (lofi, synthwave, house, cinematic, ambient, trap), 12 tonalidades y 6 escalas o modos (mayor, menor, dorian, frigio, lidio, mixolidio), y acepta condicionamiento por genero, tonalidad, escala, tempo, energia y semilla.

Su relevancia es conceptual antes que de rendimiento: se presenta como respuesta a los quants de 2 bits tipo `MiniMax-Music-3-Q2_K.gguf`, que son artefactos de solo inferencia y no se pueden ajustar. En lugar de "afinar el quant", FrameXlabs construyo un dataset musical propio desde cero y entreno este companion compacto a nivel simbolico. El autor insiste en que no es un fine-tune de MiniMax-Music-3, sino una reinterpretacion de la misma filosofia (generacion musical radicalmente compacta) en el plano simbolico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascada de Markov a nivel de evento: transiciones de acordes de orden 2 por genero con retroceso a orden 1 y marginales de inicio; tablas de frecuencias de ritmo melodico sobre rejilla de semicorcheas; tablas de intervalos melodicos con restriccion a notas del acorde; tablas de ritmo y seleccion de notas de bajo; conteos de patrones de bateria de 16 pasos; distribuciones empiricas de tempo, tonalidad y escala por genero |
| Parametros totales | No aplica: no es una red neuronal. El artefacto son tablas estadisticas que suman 57 KB (`model.json`) |
| Parametros activos | No aplica (no es MoE ni red neuronal) |
| Longitud de contexto | No disponible. La generacion esta fijada a bucles de 8 compases sobre rejilla de semicorcheas; no existe ventana de contexto en el sentido de un transformer |
| Tipos de cuantizacion | No aplica: no hay pesos numericos que cuantizar |
| Idiomas soportados | No disponible. La condicion de entrada es genero, tonalidad, escala, tempo, energia y semilla; no hay condicionamiento de texto libre |
| Licencia | MIT para el modelo; el dataset Frame Dataset — Sound es CC-BY-4.0 y exige citar a FrameXlabs |
| Formato de pesos | JSON (`model.json`), acompanado de `inference/engine.ts`, `inference/generate.ts` y `example.json` |

## Arquitectura y entrenamiento

La arquitectura es una cascada de Markov a nivel de evento, no un transformer ni un modelo de difusion. Cada componente se estima por conteo de maxima verosimilitud sobre el split de entrenamiento: las transiciones de acordes usan una cadena de orden 2 por genero con retroceso a orden 1 y marginales de inicio; la melodia combina tablas de frecuencia de patrones ritmicos por genero sobre una rejilla de semicorcheas con tablas de conteo de intervalos melodicos y una restriccion que fuerza notas del acorde en tiempos fuertes; el bajo usa tablas de ritmo y estadisticas de eleccion de nota por genero; la bateria se modela con conteos de patrones completos de 16 pasos, incluyendo swing y redobles de hi-hat caracteristicos del trap; y el tempo, la tonalidad y la escala se muestrean de distribuciones empiricas por genero.

El entrenamiento es un proceso de conteo (segundos en CPU), no un ajuste por descenso de gradiente. Los datos proceden del split de entrenamiento de Frame Dataset — Sound, con 2.160 muestras de entrenamiento y 240 reservadas para validacion. No se documenta uso de RLHF, DPO ni ninguna otra fase de alineacion, lo cual es coherente con la naturaleza no neuronal del artefacto. La validacion declarada por el autor es que los 6 generos producen progresiones validas y que el muestreo con semilla fija es determinista.

La salida sigue el mismo esquema que las filas de Frame Dataset — Sound, con eventos de `melody`, `bass` y `drums` expresados en pasos de semicorchea y un campo `swing: true` que desplaza los pasos impares. La innovacion tecnica destacable no es algoridmica sino de empaquetado: demuestra que se puede generar musica estructuralmente coherente con 57 KB y sin acelerador, frente a modelos de audio que necesitan quants agresivos y siguen siendo solo de inferencia.

## Capacidades

- Generacion de bucles musicales completos de 8 compases con acordes, melodia, bajo y bateria, mas un caption descriptivo.
- Seis generos con estadisticas propias: lofi, synthwave, house, cinematic, ambient y trap.
- Cobertura tonal de 12 tonalidades cruzadas con 6 escalas o modos: mayor, menor, dorian, frigio, lidio y mixolidio.
- Progresiones de acordes con estructura de orden 2 y retroceso a orden 1, lo que aporta algo de memoria local dentro del bucle.
- Melodia con adhesion a notas del acorde en tiempos fuertes, lo que reduce disonancias no buscadas.
- Patrones de bateria con swing y redobles de hi-hat propios del trap.
- Condicionamiento por genero, tonalidad, escala, tempo, energia y semilla.
- Muestreo determinista con semilla fija, util para reproducibilidad en tests y pipelines.
- Salida en JSON estructurado, directamente consumible por cualquier sampler o DAW.
- Ejecucion sin GPU en cualquier runtime de JavaScript; el CLI de referencia usa Bun.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni entrada de texto libre: el pipeline declarado como `text-generation` es una etiqueta de HuggingFace, no una capacidad conversacional real.
- No genera forma de onda de audio: solo eventos simbolicos.

## Casos de uso

- Musica de fondo para streaming y creadores de contenido: generar bucles lofi o ambient de 8 compases con semilla fija permite producir pistas de fondo libres de dependencias de terceros y con licencia MIT, sin coste de inferencia en GPU.
- Prototipado rapido en produccion musical: el JSON de salida se importa en un DAW o se mapea a MIDI para iterar sobre progresiones de acordes y ritmos antes de grabar instrumentos reales, con condicionamiento de tonalidad y escala que evita transcribir a mano.
- Aplicaciones web interactivas con Web Audio API: al pesar 57 KB y ejecutarse en JavaScript, el modelo encaja en un navegador con controles en vivo de genero, tempo y energia. El previsualizador interactivo de la app de Frame AI (render con Web Audio, piano-roll y controles en vivo) es exactamente ese escenario.
- Musica procedural para videojuegos: el motor puede generar bucles por zona o estado de juego (cinematic para una cinematica, trap para una escena de accion) de forma determinista por semilla, de modo que una misma sala suene igual en cada partida.
- Herramientas educativas de teoria musical: al exponer explicitamente la escala, la tonalidad y la progresion de acordes, sirve para ilustrar modos griegos, funciones armonicas y construccion de melodias sobre notas del acorde.
- Generacion de datos sinteticos musicales: producir bucles etiquetados por genero, escala y energia para aumentar datasets de entrenamiento de otros modelos simbolicos o para pruebas de motores de renderizado y sintesis.
- Dispositivos embebidos y entornos sin acelerador: cualquier dispositivo capaz de ejecutar JavaScript puede generar musica (Raspberry Pi, navegador de gama baja, funciones serverless), algo inviable con modelos de audio que requieren VRAM.
- Testing y regresion de pipelines musicales: la determinismo por semilla permite usar bucles generados como fixtures estables en tests de sintetizadores, samplers o exportadores MIDI.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card. El unico valor reportado aparece con `verified: false`, es decir, no ha sido verificado de forma independiente.

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Generacion musical a nivel de evento | FrameXlabs/Frame-Dataset-Sound | validation-pass-rate | 1,0 | No |

El autor anade como validacion cualitativa que los 6 generos producen progresiones validas y que el muestreo con semilla fija es determinista. La model card tambien declara la metrica `self-consistency` en el frontmatter, pero no se proporciona ningun valor para ella en la informacion disponible. No se han publicado resultados de benchmarks comparables (MMLU, HumanEval, GSM8K u otros) porque no aplican a un modelo de musica simbolica.

## Requisitos de hardware

- VRAM estimada: 0 GB. No hay pesos numericos ni proceso de inferencia en GPU.
- GPU recomendadas: ninguna. El modelo se ejecuta en CPU sin requisitos especiales.
- Compatibilidad con GPU de consumo: no aplica; cualquier equipo sirve, incluidos moviles y navegadores.
- Espacio en disco: 57 KB para `model.json`, mas el codigo de inferencia en TypeScript.
- Runtime: Bun para el CLI incluido (`inference/generate.ts`). Al ser TypeScript/JavaScript, es portable a Node.js, Deno o el navegador con la adaptacion correspondiente.
- Opciones de despliegue: script de linea de comandos, integracion embebida en una app web o movil, funcion serverless, o renderizado con Web Audio API. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos de transformer que servir.
- Latencia y throughput: no disponibles como cifras. El autor indica que el entrenamiento por conteo tarda segundos en CPU y que la generacion con semilla fija es determinista; no publica latencias de generacion por bucle.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el artefacto citado como referencia conceptual por el propio autor. No se dispone de datos verificables de otros generadores de musica simbolica para completar la tabla.

| Modelo | Naturaleza | Tamano | Generacion de audio | Requiere GPU | Licencia | Estado |
|---|---|---|---|---|---|---|
| Frame-Sound-1 | Cascada de Markov a nivel de evento, simbolica | 57 KB | No (solo eventos JSON para render externo) | No | MIT (dataset CC-BY-4.0) | Publicado |
| MiniMax-Music-3 (quant GGUF de 2 bits, repo realrebelai/MiniMax-Music-3_GGUFs) | Modelo de musica cuantizado a 2 bits, citado como referencia de filosofia por FrameXlabs | No disponible | No disponible en la informacion proporcionada | No disponible | No disponible | Artefacto de solo inferencia, no ajustable directamente segun la model card |

Frame-Sound-1 no es un fine-tune de MiniMax-Music-3; la model card lo explicita porque los quants GGUF de 2 bits no se pueden ajustar directamente. No se dispone de datos de benchmarks, parametros, contexto ni licencia de MiniMax-Music-3 mas alla de lo citado, por lo que la comparacion cuantitativa no es posible. Para otros modelos de musica simbolica, comparativa no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Formato fijo: solo 8 compases y rejilla de semicorcheas. No hay generacion de estructuras mas largas ni de audio de forma de onda.
- Horizonte de Markov: la estructura de largo alcance esta limitada por diseno. El propio autor lo describe como el compromiso asumido a cambio de la compacidad, en linea con la filosofia del quant de 2 bits.
- Cobertura estilistica reducida: 6 generos y ningun condicionamiento por texto libre, letra ni instrumentacion mas alla de genero, tonalidad, escala, tempo y energia.
- Idiomas soportados: no disponible, porque no existe procesamiento de lenguaje natural.
- Entrada en pipeline como `text-generation`: es una etiqueta de HuggingFace heredada del formato de la model card. No debe interpretarse como capacidad de generacion de texto ni de conversacion.
- Riesgo de sesgo: el modelo reproduce las distribuciones del dataset Frame Dataset — Sound, de 2.400 composiciones. Cualquier sesgo estilistico, armonico o ritmico de ese corpus se traslada directamente a la salida. No se documenta analisis de sesgo.
- Riesgo de alucinacion: no aplica en el sentido de un modelo de lenguaje, pero si existe el riesgo de progresiones o melodias musicalmente pobres cuando se muestrean semillas o combinaciones de tonalidad y escala poco representadas en el dataset.
- Metricas no verificadas: el unico resultado de benchmark (validation-pass-rate = 1,0) esta marcado como `verified: false` y proviene del propio autor. No hay evaluacion independiente ni comparacion con lineas base.
- Adopcion practica: el modelo registra 0 descargas y 1 like en HuggingFace en el momento de la consulta, por lo que no existe ecosistema, comunidad ni soporte fuera del repositorio original.
- Dependencia de renderizado externo: el modelo entrega eventos simbolicos; la calidad final depende por completo del sintetizador o sampler que los reproduzca, no del propio Frame-Sound-1.
- Licencia: el modelo es MIT, apto para uso comercial. El dataset asociado es CC-BY-4.0 y obliga a citar a FrameXlabs; conviene revisar esa obligacion si se redistribuye el modelo junto con datos derivados.
- Discrepancia de fechas: la model card indica creacion el 21 de septiembre de 2026, una fecha posterior a la actual en la mayoria de contextos de evaluacion. Conviene verificar la ficha en HuggingFace antes de citarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FrameXlabs/Frame-Sound-1
- Dataset Frame Dataset — Sound: https://huggingface.co/datasets/FrameXlabs/Frame-Dataset-Sound
- Repositorio de referencia citado por el autor (quants GGUF de 2 bits de MiniMax-Music-3): https://huggingface.co/realrebelai/MiniMax-Music-3_GGUFs

Nota: los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo (corresponden a servicios de mapas), por lo que no se han podido anadir papers, blogs ni demos adicionales. No hay enlace a paper, repositorio de codigo independiente ni demo publica en la informacion disponible.
