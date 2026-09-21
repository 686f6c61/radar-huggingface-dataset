# chorcat/rukh-medium-grpo

## Resumen

chorcat/rukh-medium-grpo es un decodificador GPT entrenado desde cero que juega al ajedrez prediciendo el siguiente movimiento de una partida escrita en notacion UCI. Lo publica el autor chorcat dentro de Rukh, un curso que construye un modelo de lenguaje de ajedrez de principio a fin. Corresponde a la etapa `medium-v4-grpo-greedy` y tiene 115.120.128 parametros, un vocabulario fijo de 2030 tokens y una ventana de contexto de 200 movimientos.

El modelo no genera lenguaje natural: lee una secuencia de tokens con cabeceras de nivel (`<w1800>`, `<b1800>`), movimientos en UCI y el resultado de la partida, y devuelve el siguiente token, que se interpreta como jugada. Su relevancia practica esta en el tamano: con 115 millones de parametros cabe en cualquier GPU de consumo, en CPU y en el navegador mediante exportaciones ONNX en fp16 (WebGPU) e int8 (WASM), lo que lo convierte en un caso de estudio util para modelos de dominio cerrado con vocabulario enumerado en lugar de aprendido.

Los resultados declarados son verificables y estan publicados en la propia model card: 99,3 % de legalidad sin mascara en argmax, 53,3 % de acierto en el siguiente movimiento top-1, 80,3 % en top-3 y un Elo estimado de 1572 (IC 95 % 1512-1640) con la escalera de rivales corregida. Licencia Apache 2.0 y repositorio de 1,3 GB con pesos safetensors y tres grafos ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder GPT (transformer decoder-only) escrito desde cero |
| Parametros totales | 115.120.128 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 200 movimientos por partida |
| Tipos de cuantizacion | fp32 (checkpoint PyTorch), fp16 (ONNX), int8 (ONNX) |
| Idiomas soportados | `en` (etiqueta de HuggingFace); el modelo opera sobre notacion UCI de ajedrez, no sobre lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y ONNX (`onnx/model.onnx`, `onnx/model-fp16.onnx`, `onnx/model-int8.onnx`) |
| Vocabulario | 2030 tokens fijos, enumeracion definida en `tokenizer/vocab.json` (no aprendida) |
| Libreria | `rukh` (runtime propio del proyecto) |
| Tamano del repositorio | 1,3 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer autorregresivo entrenado desde cero, sin pesos preentrenados de partida. La entrada es una secuencia de tokens con dos cabeceras que codifican el nivel de los jugadores en bins de 100 Elo (`<w1800>`, `<b1800>`), seguida de los movimientos en UCI (`e2e4`, `e7e8q`, y el enroque como movimiento de dos casillas del rey, `e1g1`) y cerrada por el resultado de la partida y `<eos>`. La cabeza de modelado de lenguaje esta atada a la matriz de embeddings, por lo que el fichero de pesos contiene `tokens.weight` y no `lm_head.weight`; es necesario volver a atar ambos tensores tras la carga (`model.lm_head.weight = model.tokens.weight`), algo que la libreria `rukh` hace en el constructor.

El nombre de la etapa (`medium-v4-grpo-greedy`) apunta a un ajuste posterior con GRPO y decodificacion greedy, pero la model card no describe el procedimiento de optimizacion ni el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO. No se detalla tampoco el numero de capas, cabezas de atencion ni dimension del modelo, por lo que esos datos quedan como no disponibles. El entrenamiento se apoya en dos recursos publicados por el mismo autor: el dataset `chorcat/rukh-games-1800` y el tokenizador `chorcat/rukh-tokenizer`.

Una particularidad relevante es que el vocabulario es una enumeracion fija y no aprendida, lo que reduce el problema a clasificacion sobre 2030 clases y permite aplicar una mascara de legalidad antes del muestreo. La demo aplica esa mascara, de modo que nunca juega una jugada ilegal; las metricas de legalidad se miden sin la mascara para caracterizar los pesos.

## Capacidades

- Prediccion del siguiente movimiento de una partida de ajedrez en formato UCI, condicionada por los niveles de ambos jugadores.
- Generacion de partidas completas token a token hasta el resultado final o `<eos>`.
- Alta legalidad intrinseca: 99,3 % de posiciones de validacion con jugada legal en argmax y 99,3 % con muestreo (temperatura 0.05, top-k 1), sin mascara de legalidad.
- Ranking de candidatos: 53,3 % de acierto en top-1 y 80,3 % en top-3 frente al movimiento real de la partida.
- Resolucion de problemas tacticos: 38,6 % de puzzles resueltos en la suite completa, con desglose por bandas de dificultad (58,9 % en 1000-1500, 39,1 % en 1500-2000, 17,8 % en 2000+).
- Inferencia en navegador mediante ONNX Runtime (WebGPU con fp16 y WASM con int8), con paridad de movimiento frente a PyTorch del 100 % en fp32, 99,8 % en fp16 y 97,0 % en int8 sobre 1000 posiciones de validacion.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, vision, audio ni modo de razonamiento explicito, segun la informacion disponible.
- No es un modelo multilingue ni conversacional: su unico dominio es la notacion de ajedrez.

## Casos de uso

- Motor de ajedrez en el navegador sin backend: la exportacion `onnx/model-fp16.onnx` se ejecuta sobre WebGPU y `onnx/model-int8.onnx` sobre WASM, de modo que la demo oficial funciona integramente en el cliente con 115 millones de parametros y sin coste de servidor.
- Analisis de partidas propias: dado un historial en UCI, el modelo puede puntuar la jugada elegida frente al top-3 predicho (80,3 % de cobertura), lo que sirve para detectar desviaciones sin necesidad de un motor completo.
- Generacion de datasets de ajedrez: con un 99,3 % de legalidad en muestreo se pueden sintetizar partidas completas para preentrenamiento o aumentacion, aplicando filtros posteriores de calidad.
- Generacion de candidatos para un motor fuerte: el top-3 al 80,3 % permite reducir el factor de ramificacion antes de pasar los candidatos a Stockfish, util en busquedas con presupuesto de tiempo muy ajustado.
- Asistente de entrenamiento de tacticas: con un 38,6 % de puzzles resueltos y un 58,9 % en la banda 1000-1500, es adecuado para generar pistas y explicaciones de nivel principiante-intermedio, no para analisis de alto nivel.
- Bot embebido en aplicaciones moviles o de escritorio: al ocupar cientos de megabytes en fp16 o decenas en int8, puede ejecutarse en CPU sin GPU dedicada, con la mascara de legalidad activada para garantizar jugadas validas.
- Docencia e investigacion en RL sobre secuencias discretas: el proyecto Rukh publica el codigo de construccion completo (tokenizador, dataset, evaluacion y exportacion ONNX), por lo que sirve como referencia reproducible de un pipeline end-to-end.
- Evaluacion comparativa de etapas: al compartir vocabulario y formato con las etapas `tiny` y `small` del mismo proyecto, permite estudiar como escala el rendimiento con el numero de parametros bajo una evaluacion identica.

## Benchmarks y rendimiento

Resultados medidos con `rukh eval --suite full` el 2026-09-20, segun la model card:

| Metrica | Valor |
|---|---|
| Legalidad sin mascara, argmax | 99,3 % |
| Legalidad sin mascara, muestreada (T=0.05, top-k 1) | 99,3 % |
| Siguiente movimiento top-1 | 53,3 % |
| Siguiente movimiento top-3 | 80,3 % |
| Puzzles resueltos | 38,6 % |
| Elo estimado | 1572 (IC 95 % 1512-1640) |

Puzzles resueltos por banda de dificultad:

| Banda | Resueltos |
|---|---|
| 1000-1500 | 58,9 % |
| 1500-2000 | 39,1 % |
| 2000+ | 17,8 % |

Cumplimiento de los umbrales fijados por el proyecto en `GOAL.md`:

| Umbral | Objetivo | Medido | Veredicto |
|---|---|---|---|
| Legalidad sin mascara, argmax | al menos 99 % | 99,3 % | cumplido |
| Elo estimado | al menos 1200 | 1572 (IC 95 % 1512-1640) | cumplido |

Paridad de las exportaciones ONNX frente al checkpoint PyTorch, sobre 1000 posiciones de validacion comparando el movimiento argmax:

| Fichero | Mismo movimiento que PyTorch | Peor deriva de logits |
|---|---|---|
| `model.onnx` (fp32) | 100,0 % | 2,67e-05 |
| `model-fp16.onnx` (fp16) | 99,8 % | 0,0148 |
| `model-int8.onnx` (int8) | 97,0 % | 1,34 |

El umbral autoimpuesto por el proyecto para las exportaciones es del 99,9 %; solo el fichero fp32 lo alcanza. La model card advierte que fp16 cambia de jugada en aproximadamente una de cada 500 posiciones. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje general, y no serian aplicables porque el modelo no procesa lenguaje natural.

## Requisitos de hardware

- VRAM estimada en pesos: aproximadamente 0,46 GB en fp32, 0,23 GB en fp16 y 0,12 GB en int8 para los 115.120.128 parametros. Con activaciones y buffers de inferencia, el consumo real se mantiene por debajo de 1 GB en fp32 y por debajo de 0,5 GB en fp16.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1650 o incluso iGPU con soporte WebGPU. No requiere A100 ni H100 para inferencia.
- La inferencia en CPU es viable en las tres precisiones por el reducido numero de parametros y el contexto maximo de 200 movimientos.
- Opciones de despliegue documentadas: la libreria `rukh`, el checkpoint PyTorch en safetensors y ONNX Runtime (WebGPU para fp16 y WASM para int8). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado que la arquitectura es propia y la tarea es clasificacion sobre un vocabulario fijo.
- Latencia y throughput: no disponible. La model card no publica cifras de latencia ni de tokens por segundo.
- Nota de integracion: al compartir el tensor de embeddings y la cabeza de salida, cualquier runtime que cargue el safetensors debe reatar `lm_head.weight` a `tokens.weight` despues de la carga.
- El grafo ONNX devuelve unicamente los logits del ultimo paso con forma `(batch, vocab)`, lo que reduce el tensor de salida en un factor de aproximadamente 200 respecto a devolver la secuencia completa.

## Comparativa con modelos similares

No se han publicado en la informacion disponible datos comparativos con otros modelos de ajedrez (Leela Chess Zero, Maia, Stockfish NNUE u otros) ni con modelos de lenguaje de proposito general del mismo tamano. La unica comparacion posible es interna al proyecto Rukh, que publica etapas `tiny`, `small` y `medium`, pero la model card solo detalla las metricas de esta etapa.

| Modelo | Parametros | Contexto | Elo estimado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chorcat/rukh-medium-grpo | 115.120.128 | 200 movimientos | 1572 (IC 95 % 1512-1640) | Apache 2.0 | HuggingFace, ONNX y demo web |
| Otras etapas de Rukh (`tiny`, `small`) | no disponible | no disponible | no disponible (las cifras antiguas de 64 y 1007 fueron retiradas por erroneas) | Apache 2.0 | HuggingFace |
| Otros motores o modelos de ajedrez | no disponible | no disponible | no disponible | no disponible | no disponible |

Advertencia metodologica de la propia model card: una version anterior de las fichas publicaba ratings mas bajos (1007 para `small`, 1091 para `medium`, 64 para `tiny`) y afirmaba que no se alcanzaba el umbral de 1200 Elo. Esas cifras eran incorrectas porque cuatro rivales de la escalera estaban etiquetados a mano entre 428 y 581 Elo por debajo de su fuerza real medida. La comparacion entre etapas no cambia, porque la correccion afecta a todas por igual. Ademas, el intervalo de Elo solo cubre ruido de muestreo: los peldaños `skill-*` son anclas nominales de `Skill Level` y Stockfish juega a 0,1 s por movimiento, muy por debajo del regimen para el que esta calibrado `UCI_Elo`. Cinco de las 160 partidas alcanzaron el limite de contexto y se adjudicaron en lugar de puntuarse como tablas.

## Limitaciones y advertencias

- Riesgo de jugadas ilegales si se desactiva la mascara de legalidad: aunque la legalidad medida es del 99,3 %, queda aproximadamente un 0,7 % de posiciones donde el argmax no es una jugada valida. En produccion conviene mantener la mascara activa.
- La exportacion fp16 no alcanza el umbral interno del proyecto (99,8 % frente al 99,9 % exigido) y cambia de jugada en torno a una de cada 500 posiciones. La exportacion int8 baja al 97,0 % de coincidencia con PyTorch y a una deriva de logits de 1,34, por lo que degrada de forma apreciable la calidad de juego.
- Fuerza limitada: 1572 Elo estimado y 17,8 % de puzzles resueltos en la banda 2000+ lo sitúan lejos de un motor de analisis serio. No debe usarse como sustituto de Stockfish o Leela en analisis profesional.
- Sesgo de dominio: se entrena sobre partidas del dataset `chorcat/rukh-games-1800`, con cabeceras de nivel en bins de 100 Elo. El comportamiento fuera de ese rango de niveles o en variantes de ajedrez no esta caracterizado.
- Contexto corto y especifico: 200 movimientos es suficiente para partidas estandar, pero 5 de las 160 partidas de evaluacion alcanzaron el limite y tuvieron que ser adjudicadas, lo que indica que partidas muy largas pueden truncarse.
- No es un modelo de lenguaje natural: no admite instrucciones en castellano ni en ingles, no soporta tool calling ni agentes, y la etiqueta de idioma `en` de HuggingFace es heredada de la convencion del hub, no una capacidad real de traduccion o conversacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de licencia y copyright. No se declaran restricciones adicionales en la model card.
- Adopcion practicamente nula en el momento de la consulta: 0 descargas y 0 likes, sin ecosistema de terceros ni integraciones mantenidas por la comunidad. El repositorio registra fechas de creacion y actualizacion del 20 de septiembre de 2026 segun HuggingFace.
- Ausencia de datos de entrenamiento publicos: no se especifican el numero de tokens, el numero de partidas del dataset, la composicion exacta ni el procedimiento de GRPO, lo que dificulta reproducir el resultado o auditar sesgos del corpus.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chorcat/rukh-medium-grpo
- Repositorio del proyecto Rukh en GitHub: https://github.com/borja-glez/rukh
- Demo jugable en el navegador: https://rukh.borjaglez.com/?stage=medium-grpo-fp16
- Blog tecnico del proyecto: https://lab.rukh.borjaglez.com
- Dataset de partidas: https://huggingface.co/datasets/chorcat/rukh-games-1800
- Tokenizador: https://huggingface.co/datasets/chorcat/rukh-tokenizer
- Búsqueda web: no se encontraron resultados relevantes para este modelo; los enlaces devueltos correspondian a articulos sobre Kosovo y no guardan relacion con la ficha.
