# chorcat/rukh-medium-lora

## Resumen

Rukh medium-lora es un decodificador GPT escrito desde cero que juega al ajedrez prediciendo la siguiente jugada de una partida expresada en notacion UCI. Lo publica el usuario chorcat (borja-glez) como la etapa `medium-v4-greedy` del proyecto Rukh, un curso que construye un modelo de lenguaje de ajedrez de principio a fin. El modelo tiene 115.120.128 parametros, un vocabulario fijo de 2030 tokens y una ventana de contexto de 200 jugadas.

El problema que aborda es concreto: convertir la prediccion de lenguaje en prediccion de jugadas legales sin depender de un motor de busqueda. Sobre 1000 posiciones de validacion alcanza un 99,8 % de legalidad sin mascara de legalidad en modo argmax, un 54,4 % de acierto en top-1 y un 82,2 % en top-3, con un Elo estimado de 1504 (IC 95 % 1446-1558). Es relevante porque demuestra que un transformer pequeno entrenado solo con partidas puede superar el umbral de 1200 Elo que el propio proyecto fijo antes de entrenar.

La innovacion practica de esta version es que los factores LoRA son entradas del grafo ONNX, no pesos fusionados: los ficheros exportados declaran dos entradas adicionales (`lora_a` y `lora_b`) que permiten cambiar de estilo cargando un adaptador de 1,6 MB por llamada en lugar de duplicar el modelo completo. Se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador GPT escrito desde cero (transformer decoder, no MoE) |
| Parametros totales | 115.120.128 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 200 jugadas |
| Tipos de cuantizacion | fp32 (`onnx/model.onnx`), fp16 (`onnx/model-fp16.onnx`) e int8 (`onnx/model-int8.onnx`); los pesos `safetensors` se distribuyen en una precision no especificada en la informacion disponible |
| Idiomas soportados | en (etiqueta de la model card); en la practica el modelo no procesa lenguaje natural, sino notacion UCI de ajedrez |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32, fp16, int8) |

Otros datos tecnicos: vocabulario fijo de 2030 tokens definido por enumeracion (no aprendido), publicado en `tokenizer/vocab.json`. Tamano del repositorio: 1,3 GB. Libreria declarada: `rukh`. Pipeline: text-generation. Adaptadores LoRA con shapes `lora_a` (16, 2, 8, 768) y `lora_b` (16, 2, 768, 8), es decir, rank 8.

## Arquitectura y entrenamiento

La arquitectura es un decodificador transformer tipo GPT construido desde cero, sin componentes MoE, SSM ni hibridos. Trabaja sobre una secuencia de tokens que representa una partida completa: dos tokens de cabecera con el bin de 100 Elo de blancas y negras (`<w1800>` `<b1800>`), seguidos de las jugadas en formato UCI (`e2e4`, `e7e8q`) y de los tokens de resultado y fin de secuencia (`<1-0>` `<eos>`). El enroque se codifica como la jugada de dos casillas del rey (`e1g1`). El vocabulario es una enumeracion fija de 2030 tokens, no aprendido de los datos.

El entrenamiento se apoya en los datasets `chorcat/rukh-games-1800` y `chorcat/rukh-tokenizer`. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del corpus ni si hubo fases de RLHF o DPO; esos datos no estan disponibles. La innovacion tecnica destacable es la gestion de LoRA como entrada dinamica del grafo: en lugar de fusionar el adaptador en los pesos y exportar una copia del modelo por estilo, los ONNX declaran `lora_a` y `lora_b` como entradas. Alimentar un adaptador de ceros reproduce exactamente el checkpoint plano (100,0 % en fp32 y 99,9 % en fp16 sobre 1000 posiciones de validacion), por lo que este fichero sustituye a la exportacion ordinaria y no la duplica. El escalado `alpha / r` vive en el fichero del adaptador, no en el grafo, de modo que cualquier rank es correcto sin ajustar dos numeros a mano. Los adaptadores `chorcat/rukh-lora-e4` y `chorcat/rukh-lora-d4` se distribuyen como `web/adapter.bin`, un buffer plano little-endian float32 con A primero y B despues.

## Capacidades

- Prediccion de la siguiente jugada de una partida de ajedrez a partir de la secuencia de jugadas previas y del nivel de ambos bandos.
- Alta legalidad de jugadas: 99,8 % de posiciones de validacion con el token mas probable legal, medida sin mascara de legalidad y sin temperatura ni top-k.
- Prediccion top-1 del 54,4 % y top-3 del 82,2 % sobre el siguiente movimiento real de la partida.
- Resolucion de puzzles tacticos: 37,5 % global, con desglose por banda de dificultad.
- Condicionamiento por nivel de juego mediante los tokens de cabecera, que codifican el Elo de blancas y negras en bins de 100 puntos.
- Intercambio de estilo en caliente mediante adaptadores LoRA de 1,6 MB alimentados como entradas del grafo ONNX.
- Exportacion a fp32, fp16 e int8 para distintos compromisos de precision y tamano.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: solo maneja la gramatica de tokens UCI definida en su vocabulario.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Oponente de ajedrez en el navegador: la exportacion int8 (aproximadamente 115 MB) y la fp16 (aproximadamente 230 MB) se pueden ejecutar con ONNX Runtime Web, como hace la demo oficial del proyecto; el jugador humano juega contra un modelo de 1504 Elo sin instalar nada.
- Analisis y anotacion de partidas: dado un historial en UCI, el modelo devuelve la distribucion sobre la siguiente jugada y permite contrastar la jugada jugada con el top-1 y el top-3 (82,2 % de cobertura en top-3) para senalar errores probables.
- Practica de tactica y puzzles: con un 57,9 % de acierto en la banda 1000-1500 y un 38,0 % en 1500-2000, sirve para generar y filtrar ejercicios de dificultad calibrada.
- Investigacion sobre estilos de juego: los adaptadores LoRA con shapes `(16, 2, 8, 768)` y `(16, 2, 768, 8)` permiten mantener varias politicas de juego sobre los mismos pesos y cambiar de una a otra subiendo 1,6 MB en lugar de descargar una copia completa del modelo.
- Generacion de datos sinteticos: muestrear partidas completas condicionadas por los tokens de cabecera de Elo permite producir corpus de partidas etiquetadas por nivel para entrenar o evaluar otros sistemas.
- Calibracion de ratings de motores: el proyecto incluye un metodo de ajuste de Elo contra ocho oponentes de Stockfish; el modelo y su suite `rukh eval --suite full` sirven como caso de estudio reproducible de como un ancla mal etiquetada desplaza todo un ajuste.
- Ensenanza de un pipeline completo de modelado de lenguaje: el repositorio de Rukh documenta tokenizacion, entrenamiento, evaluacion y exportacion ONNX de extremo a extremo sobre un dominio verificable, donde la legalidad de la salida es comprobable de forma objetiva.
- Filtro o asistente de validacion de notacion: el modelo aprende la gramatica UCI y puede usarse para detectar secuencias de jugadas anomalas o mal formadas en un flujo de datos de ajedrez.

## Benchmarks y rendimiento

Medidos con `rukh eval --suite full` el 2026-09-20:

| Metrica | Valor |
|---|---|
| Legalidad sin mascara, argmax | 99,8 % |
| Legalidad sin mascara, muestreada (T=0,05, top-k 1) | 99,8 % |
| Top-1 siguiente jugada | 54,4 % |
| Top-3 siguiente jugada | 82,2 % |
| Puzzles resueltos | 37,5 % |
| Elo estimado | 1504 (IC 95 % 1446-1558) |

Puzzles por banda de dificultad:

| Banda | Resueltos |
|---|---|
| 1000-1500 | 57,9 % |
| 1500-2000 | 38,0 % |
| 2000+ | 16,6 % |

Precision del grafo con LoRA como entrada, sobre las mismas 1000 posiciones de validacion:

| Adaptador alimentado | fp32 | fp16 | int8 |
|---|---|---|---|
| Adaptador de ceros | 100,0 % | 99,9 % | 95,1 % |
| `lora-e4` | 100,0 % | 99,8 % | 96,0 % |

Barras de aceptacion fijadas de antemano en `GOAL.md`:

| Barra | Objetivo | Medido | Veredicto |
|---|---|---|---|
| Legalidad sin mascara, argmax | al menos 99 % | 99,8 % | cumplida |
| Elo estimado | al menos 1200 | 1504 (IC 95 % 1446-1558) | cumplida |

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 460 MB en fp32, 230 MB en fp16 y 115 MB en int8, calculada a partir de los 115.120.128 parametros.
- Cabe en cualquier GPU de consumo, incluidas las de gama baja, y tambien en CPU. Con estas cifras es viable incluso en el navegador del cliente.
- El repositorio completo ocupa 1,3 GB porque incluye las tres exportaciones ONNX y el checkpoint en safetensors, pero la inferencia solo necesita el fichero del formato elegido.
- No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI: la arquitectura y el tokenizador son propios y el runtime previsto es la libreria `rukh` junto con los ficheros ONNX (ONNX Runtime, incluido el entorno web).
- El cambio de estilo requiere unicamente cargar un adaptador de 1,6 MB por llamada.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

La informacion disponible solo permite comparar este modelo con otras etapas del mismo proyecto Rukh, y unicamente aporta el dato actual de `medium-lora`. La model card advierte de que las cifras anteriores (1007 para `small`, 1091 para `medium`, 64 para `tiny`) eran erroneas y fueron sustituidas, pero no publica los valores corregidos de esas etapas.

| Modelo | Parametros | Contexto | Elo estimado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chorcat/rukh-medium-lora | 115.120.128 | 200 jugadas | 1504 (IC 95 % 1446-1558) | apache-2.0 | HuggingFace, ONNX, demo web |
| Otras etapas de Rukh (`tiny`, `small`, `medium`) | no disponible en esta ficha | no disponible | no disponible (las cifras antiguas fueron retiradas por erroneas) | apache-2.0 segun la model card consultada | HuggingFace |
| Alternativas externas de la misma categoria (motores clasicos o redes de ajedrez de ~100 M de parametros) | no disponible | no disponible | no disponible | no disponible | no disponible |

Como referencia de evaluacion, el proyecto midio su escalera de oponentes Stockfish jugando la escalera contra si misma, 40 partidas por pareja, con 0,1 s por jugada y colores alternados: los cuatro niveles etiquetados a mano como 800, 950, 1100 y 1250 rindieron en realidad 1381, 1467, 1589 y 1678, entre 428 y 581 Elo por encima de su etiqueta. El metodo se valido a si mismo: `uci-1500` midio +179 Elo sobre `uci-1320` frente a un nominal de +180.

## Limitaciones y advertencias

- Riesgo de alucinacion en forma de jugada ilegal: aunque la legalidad argmax es del 99,8 %, el 0,2 % restante produce movimientos invalidos. La demo oficial enmascara las jugadas ilegales antes de muestrear, por lo que el comportamiento observado en ella no refleja la salida cruda del modelo.
- El modelo no razona sobre el tablero: predice el siguiente token de una secuencia, sin busqueda, sin evaluacion posicional explicita y sin verificacion de legalidad.
- Ventana de contexto limitada a 200 jugadas. En la evaluacion del proyecto, 2 de 160 partidas alcanzaron el limite de contexto y se adjudicaron en lugar de puntuarse como tablas.
- El intervalo de Elo (1446-1558) cubre solo el ruido de muestreo. Los cuatro niveles `skill-*` son anclas nominales de `Skill Level`, no ratings medidos, y Stockfish juega a 0,1 s por jugada, muy por debajo de cualquier ajuste para el que este calibrado `UCI_Elo`.
- `UCI_Elo` comprime en los tramos altos: `uci-1800` midio +215 Elo sobre `uci-1500` en lugar de +300. Es una advertencia para los escalones superiores, no para el rango en el que juega este modelo.
- No procesa lenguaje natural, no sigue instrucciones, no soporta tool calling ni comportamiento de agente. Cualquier uso fuera de la prediccion de jugadas UCI carece de soporte.
- El vocabulario es fijo (2030 tokens) y la etiqueta de idioma `en` de la model card no implica capacidades linguisticas reales.
- La licencia apache-2.0 permite uso comercial, pero no se documentan en la informacion disponible los sesgos del corpus de entrenamiento ni las condiciones exactas de su composicion.
- Rendimiento decreciente con la dificultad: 16,6 % de puzzles resueltos en la banda 2000+, frente al 57,9 % en la banda 1000-1500.
- Modelo de 0 descargas y 0 likes en el momento de la consulta, con fecha de creacion y actualizacion del 20 de septiembre de 2026: no hay validacion independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chorcat/rukh-medium-lora
- Repositorio del proyecto Rukh: https://github.com/borja-glez/rukh
- Demo jugable (etapa medium-lora-fp16): https://rukh.borjaglez.com/?stage=medium-lora-fp16
- Documentacion de como se construyo: https://lab.rukh.borjaglez.com
- Dataset de partidas: https://huggingface.co/datasets/chorcat/rukh-games-1800
- Dataset del tokenizador: https://huggingface.co/datasets/chorcat/rukh-tokenizer
- Adaptadores de estilo: https://huggingface.co/chorcat/rukh-lora-e4 y https://huggingface.co/chorcat/rukh-lora-d4
- No se han encontrado otros enlaces relevantes en la busqueda web proporcionada.
