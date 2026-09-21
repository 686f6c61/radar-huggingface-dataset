# chorcat/rukh-medium-elo

## Resumen

Rukh-medium-elo es un decodificador GPT escrito desde cero que juega al ajedrez prediciendo el siguiente movimiento de una partida expresada en notacion UCI. Lo desarrolla el autor de GitHub borja-glez (publicado en HuggingFace bajo el usuario chorcat) como etapa intermedia del proyecto Rukh, un curso que construye un modelo de lenguaje de ajedrez de principio a fin. El modelo tiene 115.120.128 parametros, un vocabulario fijo de 2030 tokens y una ventana de contexto de 200 movimientos.

El problema que resuelve es concreto: generar partidas de ajedrez legalmente validas sin necesidad de un motor de busqueda tipo Stockfish, y ademas permitir condicionar el estilo de juego mediante dos tokens de cabecera, `<wXXXX> <bXXXX>`, que indican el nivel de Elo deseado para blancas y negras. Segun la evaluacion del autor, alcanza un 99,7 % de legalidad sin mascara en argmax y un Elo estimado de 1558 (IC 95 % 1500-1609).

Su relevancia es sobre todo educativa y de investigacion: es un ejemplo completo y reproducible de entrenamiento de un transformer decoder desde cero sobre un dominio cerrado, con pesos publicados en safetensors y ONNX y una demo jugable en el navegador. El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que su validacion externa es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder tipo GPT escrito desde cero |
| Parametros totales | 115.120.128 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 200 movimientos |
| Tipos de cuantizacion | FP16 (etapa de demo `medium-elo-fp16`); no se documentan otras cuantizaciones |
| Idiomas soportados | en (el modelo opera sobre notacion algebraica UCI de ajedrez, no sobre lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y ONNX |

Otros datos de interes: vocabulario fijo de 2030 tokens, tamano del repositorio de 1,3 GB, libreria declarada `rukh`, pipeline `text-generation` y etiquetas que incluyen `chess`, `decoder` y `rukh-move-decoder`.

## Arquitectura y entrenamiento

Se trata de un transformer decoder autorregresivo construido desde cero, sin partir de pesos preentrenados de un LLM general. La entrada es una secuencia de tokens que codifica una partida completa: `<bos> <w1800> <b1800> e2e4 e7e5 g1f3 ... <1-0> <eos>`. Los movimientos se representan como cadenas UCI (`e2e4`, `e7e8q` para promocion, y enroques como el movimiento de dos casillas del rey, por ejemplo `e1g1`). El vocabulario es una enumeracion fija de 2030 tokens, lo que hace que la cabeza de salida sea muy compacta en comparacion con un vocabulario BPE convencional.

Los datos de entrenamiento proceden de los datasets `chorcat/rukh-games-1800` y `chorcat/rukh-tokenizer`, ambos publicados por el mismo autor; la tarjeta no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO. La innovacion tecnica destacable es el condicionamiento por cabecera: la etapa `medium-elo` es un fine-tune que ensena al modelo a interpretar `<wXXXX>` y `<bXXXX>` como una instruccion de estilo. El autor es explicito en que este condicionamiento modifica el repertorio (la entropia del primer movimiento crece de forma monotona con el Elo solicitado) y no la fuerza de juego: los intervalos de Elo entre condiciones no se separan.

## Capacidades

- Prediccion del siguiente movimiento en notacion UCI dentro de una partida de ajedrez.
- Generacion de partidas completas con un 99,7 % de legalidad sin mascara de legalidad en argmax y en muestreo (T=0,05, top-k 1).
- Condicionamiento del estilo mediante tokens de cabecera de Elo para blancas y negras en bins de 100 puntos.
- Resolucion de puzzles de ajedrez: 37,8 % global, con 59,8 % en la banda 1000-1500, 37,1 % en 1500-2000 y 16,6 % en 2000+.
- Prediccion del siguiente movimiento con top-1 del 54,9 % y top-3 del 82,5 %.
- Exportacion a ONNX, lo que permite ejecucion en navegador sin backend de servidor.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso fuera del ajedrez, vision, audio ni modo de pensamiento.
- No es multilingue en el sentido habitual: su unico dominio es la notacion de ajedrez en ingles/UCI.

## Casos de uso

- Oponente de ajedrez embebido en el navegador: gracias a la exportacion ONNX y a los 115 M de parametros, el modelo puede ejecutarse en cliente sin servidor, como demuestra la demo oficial en `rukh.borjaglez.com`.
- Aplicacion movil o de escritorio de bajo consumo: los pesos en FP16 ocupan aproximadamente 230 MB, por lo que caben en dispositivos con recursos limitados donde no es viable desplegar un motor de busqueda pesado.
- Ajuste de dificultad para jugadores noveles: usando el token `<w1200>` el modelo cambia su repertorio hacia aperturas mas sencillas, segun la tabla de condiciones publicada por el autor.
- Material didactico para cursos de IA: el proyecto Rukh documenta el proceso completo de construccion del modelo, y esta etapa sirve como referencia intermedia de un pipeline end-to-end.
- Investigacion sobre condicionamiento por prefijos en decodificadores: el modelo permite estudiar como dos tokens de cabecera alteran la distribucion de salida sin cambiar la arquitectura.
- Validacion de metodologias de estimacion de Elo: la tarjeta documenta un error de calibracion de entre 428 y 581 puntos en la escala de rivales, y la correccion posterior, lo que lo convierte en un caso de estudio util para evaluar ladders de evaluacion.
- Generacion de datos sinteticos de ajedrez para entrenar o comparar otros modelos, siempre que se filtre la legalidad de los movimientos generados.
- Analisis de aperturas: la entropia del primer movimiento esta medida (entre 1,596 y 1,992 bits segun la condicion) y puede usarse para estudiar la diversidad de repertorio.

## Benchmarks y rendimiento

Resultados medidos con `rukh eval --suite full` el 20 de septiembre de 2026, segun la tarjeta del modelo:

| Metrica | Valor |
|---|---|
| Legalidad sin mascara, argmax | 99,7 % |
| Legalidad sin mascara, muestreo (T=0,05, top-k 1) | 99,7 % |
| Acierto del siguiente movimiento top-1 | 54,9 % |
| Acierto del siguiente movimiento top-3 | 82,5 % |
| Puzzles resueltos | 37,8 % |
| Elo estimado | 1558 (IC 95 % 1500-1609) |

Efecto del token de cabecera sobre el comportamiento (misma suite, mismos rivales y posiciones, solo cambian los dos tokens de cabecera):

| Condicion | Elo | IC 95 % | Legalidad argmax | Top-1 | Entropia del primer movimiento |
|---|---:|---|---:|---:|---:|
| `<w1200>` | 1425 | 1361-1479 | 100,0 % | 51,4 % | 1,596 bits |
| `<w1500>` | 1549 | 1481-1609 | 100,0 % | 53,9 % | 1,647 bits |
| `<w1800>` | 1498 | 1435-1552 | 99,8 % | 54,1 % | 1,741 bits |
| `<w2000>` | 1538 | 1479-1597 | 99,7 % | 54,0 % | 1,841 bits |
| `<w2100>` | 1606 | 1543-1670 | 99,7 % | 53,4 % | 1,881 bits |
| `<w2400>` | 1644 | 1578-1707 | 99,7 % | 53,3 % | 1,992 bits |

Puzzles por banda de dificultad:

| Banda | Resueltos |
|---|---|
| 1000-1500 | 59,8 % |
| 1500-2000 | 37,1 % |
| 2000+ | 16,6 % |

Barras de aceptacion del proyecto:

| Barra | Objetivo | Medido | Veredicto |
|---|---|---|---|
| Legalidad sin mascara, argmax | al menos 99 % | 99,7 % | cumplida |
| Elo estimado | al menos 1200 | 1558 (IC 95 % 1500-1609) | cumplida |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 230 MB en FP16 y 460 MB en FP32 solo para los pesos, mas el overhead del runtime. Cifras calculadas a partir de los 115.120.128 parametros.
- GPU recomendadas: cualquier GPU moderna sirve; no se necesita una A100 ni una H100. Una RTX 3060, RTX 4060 o superior es mas que suficiente.
- Si cabe en GPU de consumo: si, en practicamente todas, incluidas GPUs de gama de entrada e incluso en CPU.
- Ejecucion en navegador: si, via ONNX, tal como demuestra la demo oficial.
- Opciones de despliegue: ONNX Runtime y la propia libreria `rukh` estan documentados. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni para `transformers` estandar, dado que la arquitectura, el tokenizador y el pipeline son personalizados y no siguen las convenciones de HuggingFace.
- Latencia y throughput estimados: no disponibles. La suite de evaluacion usa 0,1 s por movimiento en los rivales Stockfish, pero ese dato corresponde a los oponentes, no al modelo.
- Tamano del repositorio: 1,3 GB, que incluye pesos safetensors, exportaciones ONNX y artefactos asociados.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada. Como referencias conceptuales del mismo dominio (motores y modelos de ajedrez) pueden citarse Maia Chess, Leela Chess Zero y Stockfish, pero sus parametros, contexto, licencia y disponibilidad no se detallan aqui y se marcan como no disponibles.

| Modelo | Parametros | Contexto | Elo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chorcat/rukh-medium-elo | 115.120.128 | 200 movimientos | 1558 (IC 95 % 1500-1609) | apache-2.0 | HuggingFace, safetensors y ONNX |
| Maia Chess | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| Leela Chess Zero | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| Stockfish | no aplica (motor de busqueda) | no aplica | no disponible | no disponible | no disponible en la informacion proporcionada |

Tampoco se dispone de las especificaciones de las otras etapas de la familia Rukh (`tiny`, `small`, `medium`) mas alla de las valoraciones antiguas que la propia tarjeta corrige (1007, 1091 y 64 de Elo, respectivamente).

## Limitaciones y advertencias

- Modelo de dominio cerrado: no es un LLM de proposito general y no responde a instrucciones en lenguaje natural, tool calling, agentes, vision ni audio.
- Unico idioma declarado: ingles, y en la practica solo notacion UCI de ajedrez.
- Contexto limitado a 200 movimientos. En la evaluacion, 2 de 160 partidas alcanzaron el limite de contexto y tuvieron que ser adjudicadas en lugar de puntuadas como tablas.
- La legalidad no es del 100 %: queda un 0,3 % de posiciones en las que el token mas probable no es un movimiento legal. La demo aplica una mascara de legalidad antes del muestreo, por lo que nunca juega una jugada ilegal, pero un despliegue sin mascara si puede hacerlo.
- El condicionamiento por Elo no controla la fuerza de juego: los intervalos de confianza de las condiciones se solapan y las estimaciones puntuales no son monotonicas. Lo que cambia de forma ordenada es la entropia del primer movimiento, es decir, el repertorio.
- La estimacion de Elo tiene incertidumbre relevante y depende de una escala reconstruida: los rivales `skill-*` son etiquetas nominales de Skill Level, no ratings medidos, y Stockfish juega a 0,1 s por movimiento, muy por debajo de la calibracion de `UCI_Elo`. El propio autor advierte que `UCI_Elo` se comprime en los tramos altos.
- Historial de cifras erroneas: versiones anteriores de las tarjetas de esta familia reportaron 1007 para `small`, 1091 para `medium` y 64 para `tiny`, con la afirmacion de que no se alcanzaba la barra de 1200 Elo. Esas cifras se corrigieron; conviene desconfiar de evaluaciones antiguas de esta familia.
- Riesgo de alucinacion en el sentido de generar movimientos ilegales o secuencias fuera de la partida; no aplica el concepto de alucinacion factual de un LLM general.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia apache-2.0: permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar los terminos de los datasets de entrenamiento enlazados.
- Adopcion nula: 0 descargas y 0 likes, sin validacion independiente de los resultados publicados.
- Los benchmarks proceden de la herramienta propia del proyecto (`rukh eval`), no de una evaluacion de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chorcat/rukh-medium-elo
- Repositorio del proyecto Rukh: https://github.com/borja-glez/rukh
- Demo jugable en el navegador (etapa medium-elo-fp16): https://rukh.borjaglez.com/?stage=medium-elo-fp16
- Blog tecnico del proyecto: https://lab.rukh.borjaglez.com
- Dataset de partidas: https://huggingface.co/datasets/chorcat/rukh-games-1800
- Dataset del tokenizador: https://huggingface.co/datasets/chorcat/rukh-tokenizer

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles son los que figuran en la tarjeta del autor.
