# jmclean/esp32-card-maker

## Resumen

ESP32 Card Maker es un transformer decoder-only de 149.000 parámetros (99.424 en el núcleo transformer) desarrollado por Justin McLean, diseñado para generar conjuntos de reglas de juegos de cartas para una baraja estándar y ejecutarlos íntegramente en un microcontrolador ESP32-S3 (M5Stack CoreS3), sin conexión a ningún servicio externo. El modelo escribe cada conjunto de reglas como una secuencia de tokens, uno por regla, con decodificación restringida al campo siguiente, de modo que toda salida es sintácticamente completa y procesable por el motor de reglas del mismo repositorio.

El problema que aborda es la generación procedural de contenido lúdico en el extremo (edge): inventar reglas coherentes y jugables con un presupuesto de cómputo y memoria mínimo. Su relevancia es fundamentalmente demostrativa y educativa: muestra hasta dónde se puede llevar un modelo generativo con 82 KB de pesos cuantizados a 4 bits en un dispositivo con 8 MB de PSRAM, y cómo acoplar generación y validación (autojuego) en el mismo chip.

La arquitectura es un transformer pequeño con embeddings por capa, posiciones RoPE, feed-forward SwiGLU y vocabulario de 215 tokens (ampliado a 256), con una longitud de contexto de 32 tokens. El modelo se distribuye bajo licencia MIT y su código de inferencia es `slvDev/esp32-ai`, también MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con embeddings por capa, RoPE, SwiGLU, 4 capas, anchura 64, 4 cabezas de atencion |
| Parametros totales | 148.576 (99.424 en el nucleo transformer) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 tokens |
| Tipos de cuantizacion | 4 bits (pesos del dispositivo, 82 KB); safetensors en precision completa (0,6 MB) |
| Idiomas soportados | No disponible (la salida son tokens de reglas, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `model.bin` (4 bits, dispositivo), `card-maker.safetensors` (precision completa), `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un transformer autoregresivo de 4 capas con anchura 64 y 4 cabezas de atencion, feed-forward SwiGLU, posiciones RoPE y embeddings por capa de anchura 32. La cabeza de salida esta atada al embedding de tokens. El vocabulario consta de 215 tokens de reglas (ampliado a 256) y el contexto es de 32 tokens, suficiente para una secuencia completa de reglas de una familia de juego. La decodificacion esta restringida a los tokens validos del siguiente campo, lo que garantiza que cada conjunto de reglas generado sea completo y parseable por el motor.

El entrenamiento se realizo en CPU sobre un Apple M3 con PyTorch, en fp32, durante 3.000 pasos con batch de 64 secuencias de 32 tokens, AdamW, learning rate 1e-3, 200 pasos de calentamiento y decaimiento coseno. Los datos son sinteticos y se generan con el propio motor del repositorio: 18.000 conjuntos de reglas aleatorios pasaron por autojuego (300 partidas aleatorias y 40 partidas de un jugador Monte Carlo con 20 simulaciones por movimiento frente a otro con 2); 10.452 superaron el test y se puntuaron por habilidad, equidad y duracion, conservandose la mejor mitad de cada familia (5.226 conjuntos). La familia shedding, la menos representada, se repitio 4 veces para equilibrar. No se menciona RLHF ni DPO.

## Capacidades

- Generacion de conjuntos de reglas completos para juegos de cartas de dos jugadores con baraja estandar, en cuatro familias: shedding, tricks, collecting y capturing.
- Decodificacion restringida por gramatica: cada campo se emite solo con tokens validos, lo que evita salidas malformadas.
- Generacion procedural de contenido ludico con validacion en el mismo dispositivo mediante autojuego.
- Inferencia totalmente local en ESP32-S3 a 240 MHz, con latencia de 0,2 a 0,5 segundos por conjunto de reglas.
- Ejecucion opcional en ordenador mediante `host/play.cpp` (solo requiere compilador C++17).
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking.
- No es un modelo multilingue ni de proposito general: su salida son tokens de reglas, no texto en lenguaje natural.

## Casos de uso

- Demostracion de IA generativa en microcontroladores: el modelo cabe en 82 KB y se ejecuta en un ESP32-S3 con 8 MB de PSRAM, lo que sirve para talleres, docencia y prototipos de IA en el extremo sin conectividad.
- Generacion de variantes de juegos de cartas para prototipado ludico: el modelo produce reglas completas que el motor explica y juega, utiles para disenadores que buscan mecanicas nuevas dentro de familias conocidas.
- Juguete educativo de sistemas embebidos: permite estudiar en un dispositivo real el ciclo completo de tokenizacion, decodificacion restringida, cuantizacion int4 y validacion por autojuego.
- Validacion automatizada de reglas: el motor del mismo chip comprueba que el juego termina, dura entre 10 y 120 turnos, no favorece al primer jugador y recompensa la habilidad, descartando y regenerando las propuestas que fallan.
- Investigacion sobre generacion y filtrado en el dispositivo: sirve como banco de pruebas para estudiar la tasa de aceptacion y la calidad de contenido sintetico con presupuestos de computo minimos.
- Integracion en dispositivos de juego dedicados: el binario y los pesos se flashean en el M5Stack CoreS3 y permiten un juego completo sin dependencias de red.
- Ajuste fino en equipos modestos: los pesos en safetensors (0,6 MB) y el script `training/weights.py` permiten reentrenar en CPU en aproximadamente un minuto, lo que facilita experimentos de investigacion reproducibles.

## Benchmarks y rendimiento

Evaluacion sobre 400 conjuntos de reglas generados por el modelo a temperatura 1,3 frente a 400 del generador aleatorio:

| Metrica | Modelo | Reglas aleatorias |
|---|---|---|
| Supera el test completo de autojuego | 70% | 50% |
| Aceptado por el dispositivo | 95% | 77% |
| De los aceptados, la habilidad importa | 74% | 68% |

Por familia, de los conjuntos aceptados por el dispositivo, la habilidad importa en:

| Familia | Modelo | Reglas aleatorias |
|---|---|---|
| Shedding | 38% | 28% |
| Tricks | 72% | 65% |
| Collecting | 100% | 100% |
| Capturing | 90% | 68% |

Rendimiento de inferencia: 0,2 a 0,5 segundos por conjunto de reglas en ESP32-S3 a 240 MHz. Entrenamiento: aproximadamente un minuto en CPU Apple M3.

## Requisitos de hardware

- Inferencia en dispositivo: ESP32-S3 (M5Stack CoreS3) con 8 MB de PSRAM; pesos de 82 KB a 4 bits.
- Inferencia en ordenador: cualquier maquina con compilador C++17; no requiere GPU.
- No requiere VRAM dedicada; no se han publicado requisitos para aceleradores.
- Despliegue en dispositivo mediante PlatformIO (`pio run -e m5stack-cores3 -t upload_model` y `-t upload`).
- Despliegue en ordenador mediante `c++ -std=c++17 -O2 -Iengine host/play.cpp -o play`.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la libreria es `esp32-ai`.
- Latencia: 0,2 a 0,5 segundos por conjunto de reglas en el microcontrolador; no se publica throughput en ordenador.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de generacion de reglas de juegos de cartas en microcontroladores. Como referencia de categoria (modelos generativos en el extremo), no se han proporcionado datos de alternativas que permitan una comparacion rigurosa de parametros, contexto, rendimiento y licencia. Se indica, por tanto, no disponible.

## Limitaciones y advertencias

- Aproximadamente un tercio de los conjuntos de reglas generados falla el test completo de autojuego; la familia shedding es la que falla con mas frecuencia (solo el 38% de los aceptados demuestran que la habilidad importa).
- El modelo solo puede inventar dentro de las familias y reglas que soporta el motor; sus juegos son variaciones de mecanicas familiares.
- La "calidad" se define de forma operativa (el juego termina, es justo y recompensa la habilidad segun jugadores automaticos); no se mide si el juego es divertido.
- No admite partidas de mas de dos jugadores ni familias o reglas fuera del motor.
- Los tokens generados solo tienen sentido para el motor de reglas del repositorio; no son texto legible ni reutilizables fuera de el.
- No hay informacion sobre sesgos; el entrenamiento es puramente sintetico y generado por el propio motor, sin datos externos.
- Riesgo de alucinacion estructural bajo por la decodificacion restringida, pero el contenido puede ser invalido a nivel de juego y debe validarse con el autojuego.
- Licencia MIT: permite uso comercial, pero el modelo esta pensado para dos jugadores y baraja estandar; no se documentan garantias de produccion.
- Se recomienda muestrear a temperatura 1,3 y conservar solo los conjuntos que superen el test del motor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jmclean/esp32-card-maker
- Repositorio del autor: https://github.com/justinmclean/esp32-card-maker
- Codigo de inferencia: https://github.com/slvDev/esp32-ai
