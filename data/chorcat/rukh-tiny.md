# chorcat/rukh-tiny

## Resumen

Rukh-tiny es un decodificador GPT escrito desde cero que juega al ajedrez prediciendo el siguiente movimiento de una partida expresada en notación UCI. Lo desarrolla el autor chorcat en el marco del proyecto Rukh, un curso que construye un modelo de lenguaje de ajedrez de principio a fin. Con 5.309.952 parametros, un vocabulario fijo de 2030 tokens y una ventana de contexto de 200 movimientos, es la etapa `tiny` de una familia con etapas superiores (`medium`), y su interes principal es didactico y experimental mas que competitivo.

El modelo no procesa lenguaje natural: lee una secuencia de tokens compuesta por dos cabeceras de nivel de juego (`<w1800>` y `<b1800>`, bins de 100 Elo para blancas y negras), los movimientos en UCI y el resultado de la partida, y predice el token siguiente. Se distribuye en safetensors y en tres exportaciones ONNX (fp32, fp16 e int8) pensadas para ejecutarse integramente en el navegador mediante WebGPU o como respaldo WASM.

Es relevante ahora porque documenta con inusual honestidad el incumplimiento de sus propios objetivos: la legalidad sin mascara en argmax es del 94,5 % frente al 99 % exigido y el Elo estimado es de 64 (IC 95 % −200 a 292) frente a los 1200 exigidos. El analisis del autor atribuye el techo a la limitacion de datos (5,9 M de partidas frente a los 16 M del trabajo de referencia) y no a la capacidad, ya que la etapa `medium`, con el triple de parametros y los mismos datos, solo gano 84 puntos de Elo con intervalos solapados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) escrito desde cero, cabecera de modelado de lenguaje atada al embedding de tokens |
| Parametros totales | 5.309.952 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 200 movimientos (`block = 200`) |
| Tipos de cuantizacion | fp32, fp16 e int8 (exportaciones ONNX); safetensors en el checkpoint de PyTorch |
| Idiomas soportados | en (etiqueta declarada en la model card); la salida real es notacion UCI de ajedrez, no lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), ONNX (`model.onnx`, `model-fp16.onnx`, `model-int8.onnx`) |

Datos adicionales: vocabulario fijo de 2030 tokens (enumeracion no aprendida, distribuida en `tokenizer/vocab.json`), tamano del repositorio 0,1 GB, pipeline `text-generation`, libreria `rukh`, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only entrenado con el objetivo clasico de prediccion del siguiente token sobre partidas de ajedrez serializadas en UCI. La entrada sigue el esquema `<bos> <w1800> <b1800> e2e4 e7e5 g1f3 ... <1-0> <eos>`, donde `w` y `b` codifican los bins de 100 Elo de cada bando, los movimientos se expresan como cadenas UCI (`e2e4`, `e7e8q`, enroques como el desplazamiento de dos casillas del rey, `e1g1`) y el resultado se marca con `<1-0>`, `<0-1>` o tablas. El vocabulario es una enumeracion fija, no aprendida de los datos. La cabecera de modelado de lenguaje esta atada al embedding de tokens, por lo que el fichero de pesos contiene `tokens.weight` y no `lm_head.weight`; al recargar hay que volver a atarlos (`model.lm_head.weight = model.tokens.weight`), algo que la libreria `rukh` hace en el constructor.

El entrenamiento se realizo sobre 5,9 millones de partidas (dataset `chorcat/rukh-games-1800`, con `data_manifest_sha` `2274906c04342b8fc1632d3e1c3bff82e33f535936af742c7a7f9e4b052afa31`). La receta publicada incluye `batch_size` 128, `block` 200, `betas` [0,9; 0,95], `lr` 0,001, `grad_accum` 2, `grad_clip` 1,0, `compile` True, `device` cuda, `max_steps` 6000, `ckpt_every` 1000, `log_every` 10, `eval_every` 250 y `eval_batches` 50 (la informacion disponible trunca el valor de `min_lr`). No se menciona ningun uso de RLHF, DPO ni ajuste por preferencias: es entrenamiento supervisado puro de siguiente token.

El aspecto tecnico mas destacable no esta en el modelo sino en el despliegue: la demo aplica una mascara de legalidad antes del muestreo, de modo que nunca juega un movimiento ilegal, aunque los pesos por si solos si lo hagan con una frecuencia superior al 1 %. Las exportaciones ONNX devuelven unicamente los logits del ultimo paso, con forma `(batch, vocab)`, lo que reduce el tensor de salida en un factor de aproximadamente 200.

## Capacidades

- Prediccion del siguiente movimiento de una partida de ajedrez en notacion UCI a partir del historial previo.
- Condicionamiento por nivel de juego: las cabeceras `<w1800>` y `<b1800>` codifican los bins de 100 Elo de blancas y negras.
- Prediccion del resultado de la partida mediante los tokens `<1-0>`, `<0-1>` y tablas, mas el cierre con `<eos>`.
- Inferencia en navegador gracias a las exportaciones ONNX: `model-fp16.onnx` para WebGPU y `model-int8.onnx` como respaldo WASM.
- Legalidad de movimientos del 94,5 % en argmax y 93,8 % muestreado con temperatura 0,6 y top-k 20 cuando no se aplica mascara; con mascara, la demo no juega movimientos ilegales.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso mas alla de la propia secuencia de la partida.
- No dispone de capacidades multilingues en el sentido habitual: solo ajedrez y solo la etiqueta `en`.
- No dispone de vision, audio, modo de pensamiento (`thinking`) ni otras capacidades multimodales.

## Casos de uso

- Demo educativa de ajedrez en el navegador: el modelo puede cargarse como ONNX y ejecutarse en el cliente con WebGPU (fp16) o WASM (int8), sin backend ni GPU de servidor, como hace la demo oficial en `rukh.borjaglez.com`.
- Material didactico para un curso de modelos de lenguaje: al estar escrito desde cero, con vocabulario fijo de 2030 tokens, contexto de 200 y receta de entrenamiento publicada, sirve para ilustrar tokenizacion, atencion, atado de embeddings y evaluacion de legalidad paso a paso.
- Generacion de partidas sinteticas para aumento de datos: se pueden muestrear secuencias condicionadas por cabeceras de Elo y filtrar las que violan la legalidad, generando corpus auxiliares etiquetados por nivel.
- Prueba de pipelines de exportacion y cuantizacion: el repositorio incluye `onnx/parity.json` y un protocolo de verificacion (1000 posiciones de validacion, comparacion de movimiento argmax), lo que lo convierte en un banco de pruebas barato para medir deriva de logits entre fp32, fp16 e int8.
- Evaluacion de techo por datos en proyectos de investigacion: la comparacion entre las etapas `tiny` y `medium` de la misma familia, con el triple de parametros y los mismos datos, permite estudiar empiricamente la relacion entre capacidad, volumen de corpus y Elo resultante.
- Analisis de sesgos de corpus en ajedrez: al condicionar por bins de Elo, es posible medir como el modelo reproduce o amplifica los sesgos de las 5,9 M de partidas de Lichess con las que se entreno.
- Aplicacion embebida o movil sin conectividad: con 5,3 M de parametros y entre 5 y 21 MB de pesos segun cuantizacion, el modelo cabe en un dispositivo de gama baja, siempre asumiendo la perdida de fidelidad de la version int8.
- Ejercicio de interpretabilidad de un motor de ajedrez a pequena escala: el modelo es lo bastante pequeno para inspeccionar sus salidas token a token y estudiar que posiciones producen movimientos ilegales.

## Benchmarks y rendimiento

Resultados medidos con `rukh eval --suite quick` el 2026-09-19, segun la model card:

| Metrica | Valor |
|---|---|
| Legalidad sin mascara, argmax | 94,5 % |
| Legalidad sin mascara, muestreado (T=0,6, top-k 20) | 93,8 % |
| Top-1 siguiente movimiento | 40,3 % |
| Top-3 siguiente movimiento | 67,1 % |
| Puzzles resueltos | no disponible (la suite de puzzles se omitio porque no se encontro el fichero `puzzles.parquet`) |
| Elo estimado | 64 (IC 95 % −200 a 292) |

Objetivos fijados en `GOAL.md` antes del entrenamiento y veredicto publicado:

| Objetivo | Meta | Medido | Veredicto |
|---|---|---|---|
| Legalidad sin mascara, argmax | al menos 99 % | 94,5 % | no cumplido |
| Elo estimado | al menos 1200 | 64 (IC 95 % −200 a 292) | no cumplido |

Fidelidad de las exportaciones ONNX frente al checkpoint de PyTorch, sobre 1000 posiciones de validacion y comparando el movimiento argmax (barra autoimpuesta del 99,9 %):

| Fichero | Mismo movimiento que PyTorch | Peor deriva de logits |
|---|---|---|
| `model.onnx` (fp32) | 100,0 % | 4,39e-05 |
| `model-fp16.onnx` (fp16) | 99,8 % | 0,033 |
| `model-int8.onnx` (int8) | 96,1 % | 1,53 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de proposito general en la informacion disponible, y no tendria sentido aplicarlos a un modelo de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 21,2 MB en fp32, 10,6 MB en fp16 y 5,3 MB en int8 solo para los pesos; el consumo real es minimo y el cuello de botella no es la memoria.
- GPU recomendadas: cualquiera. El modelo esta pensado para ejecutarse en el navegador, por lo que no requiere A100, H100 ni similares; cualquier GPU consumer, incluida una RTX 4090 o integradas de portatil, es mas que suficiente.
- Cabe en GPU consumer y tambien en CPU: si, con enorme margen en cualquier GPU consumer, en CPU de escritorio y en moviles modernos.
- Opciones de despliegue: la libreria propia `rukh` sobre PyTorch para el checkpoint safetensors; ONNX Runtime Web para navegador (WebGPU con fp16, WASM con int8). No hay confirmacion de soporte en vLLM, llama.cpp, Ollama ni TGI, y es poco probable dado el tokenizador y la arquitectura propios.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables de terceros en la informacion proporcionada. La unica comparacion documentada es interna a la familia Rukh, entre la etapa `tiny` y la etapa `medium`:

| Modelo | Parametros | Datos de entrenamiento | Elo estimado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rukh-tiny | 5.309.952 | 5,9 M de partidas | 64 (IC 95 % −200 a 292) | Apache 2.0 | safetensors + ONNX |
| rukh-medium | aproximadamente el triple (valor exacto no disponible) | los mismos 5,9 M de partidas | 84 Elo mas que `tiny`, con intervalos solapados | no disponible | no disponible |

El autor senala ademas que el trabajo de referencia con el que se compara uso 16 M de partidas, frente a los 5,9 M de este modelo. No se ofrecen nombres, parametros ni resultados de otras alternativas, por lo que la comparativa con modelos de terceros queda como no disponible.

## Limitaciones y advertencias

- La barra de legalidad no se cumple: sin mascara, los pesos proponen un movimiento ilegal en mas del 1 % de las posiciones (94,5 % de legalidad en argmax). Cualquier uso en produccion debe incorporar una mascara de legalidad externa, como hace la demo.
- El Elo estimado es de 64, con un intervalo de confianza del 95 % de −200 a 292. El autor advierte que el intervalo solo cubre ruido de muestreo, que los cuatro niveles `skill-*` son anclas nominales de `Skill Level` y no ratings medidos, y que Stockfish juega a 0,1 s por movimiento, muy por debajo de la calibracion de `UCI_Elo`. El dato debe leerse como orientativo y muy poco fiable.
- La suite de puzzles no se ejecuto por ausencia del fichero de datos, por lo que no hay metrica de calidad tactica.
- La version int8 elige un movimiento distinto al de PyTorch en el 3,9 % de las posiciones (aproximadamente 1 de cada 26), y la fp16 en el 0,2 % (1 de cada 500). Un movil que use el respaldo WASM int8 esta jugando un modelo medidamente distinto, con los mismos pesos pero aritmetica diferente. Ninguna de las dos exportaciones alcanza la barra de paridad autoimpuesta del 99,9 %.
- El techo de rendimiento parece venir del corpus: 5,9 M de partidas frente a los 16 M del trabajo de referencia, con la etapa `medium` ganando solo 84 Elo con el triple de parametros y los mismos datos.
- Riesgo de alucinacion: en este dominio se manifiesta como movimientos ilegales y como continuaciones plausibles pero incorrectas de la partida; no existe verificacion interna de legalidad en los pesos.
- La etiqueta de idioma es `en`, pero el modelo no genera lenguaje natural: solo produce tokens del vocabulario cerrado de ajedrez. No debe esperarse soporte multilingue.
- Al tratarse de un modelo entrenado con cabeceras de Elo procedentes de partidas de Lichess, puede reproducir los sesgos de estilo y de nivel de ese corpus.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar el aviso de licencia y el fichero de cambios. No se documentan clausulas adicionales.
- Caveat de integracion para produccion: hay que volver a atar `lm_head.weight` a `tokens.weight` tras cargar el checkpoint, y el grafo ONNX solo devuelve los logits del ultimo paso, no de toda la secuencia.
- Modelo con 0 descargas y 0 likes en el momento de la consulta y creado el 2026-09-19: se trata de una publicacion reciente y sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chorcat/rukh-tiny
- Repositorio del proyecto Rukh: https://github.com/borja-glez/rukh
- Demo jugable en el navegador (etapa tiny): https://rukh.borjaglez.com/?stage=tiny
- Blog tecnico con el proceso de construccion: https://lab.rukh.borjaglez.com
- Dataset de partidas: https://huggingface.co/datasets/chorcat/rukh-games-1800
- Dataset del tokenizador: https://huggingface.co/datasets/chorcat/rukh-tokenizer
- No se han encontrado enlaces adicionales relevantes en la busqueda web realizada.
