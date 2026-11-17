# kaushik-harsh-99/Qwen3-0.6B-Game-Decision-Model

## Resumen

Qwen3-0.6B-Game-Decision-Model es un ajuste fino del modelo base Qwen/Qwen3-0.6B, desarrollado por el usuario kaushik-harsh-99, especializado en la toma de decisiones dentro de 23 juegos de tablero, cartas, puzles y estrategia. El modelo se presenta como un clasificador de decision multiopcion (pipeline text-classification) que, dada una representacion textual del estado de un juego, selecciona la accion optima entre las disponibles. Su relevancia radica en que demuestra como un modelo de lenguaje pequeno (596 millones de parametros) puede superar ampliamente a su version base en tareas de decision estructurada tras un ajuste fino con LoRA fusionado.

El modelo parte de la arquitectura transformer densa de Qwen3-0.6B y anade una cabeza de clasificacion multi-criterio denominada FastDecisionModel / CLEF, integrada mediante las herramientas de Unsloth. Los pesos publicados son los completos fusionados en 16 bits (model.safetensors de 1,14 GB mas una cabeza de clasificacion conjunta de 52 MB), por lo que no requiere fusionar adaptadores por separado. Se entreno sobre 1.092.754 decisiones de juego extraidas del dataset kaushik-harsh-99/boardgame-decision-models.

La evaluacion publicada sobre 2.193 muestras fuera de distribucion reporta una precision global del 67,81 % frente al 28,04 % del modelo base en zero-shot, lo que supone una mejora absoluta de 39,77 puntos porcentuales. El modelo esta liberado bajo licencia Apache 2.0 y esta pensado exclusivamente para ingles y para el dominio acotado de la decision en juegos, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-0.6B) con cabeza de clasificacion multi-criterio FastDecisionModel / CLEF |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en 16 bits fusionados) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (modelo completo fusionado en 16 bits, 1,14 GB + cabeza de clasificacion de 52 MB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-0.6B y sobre ella se aplica un ajuste fino supervisado con LoRA, entrenado con Unsloth y fusionado posteriormente en los pesos completos. La innovacion principal es la incorporacion de una cabeza de clasificacion multi-criterio (FastDecisionModel / CLEF) que transforma la generacion de texto en una seleccion de accion entre opciones discretas, adecuada para entornos de juego con acciones finitas. Los pesos resultantes son un unico checkpoint de 16 bits listo para despliegue, sin necesidad de cargar adaptadores por separado.

El entrenamiento se realizo sobre 1.092.754 instancias de decision repartidas en 23 juegos, con 34.149 pasos y una duracion de 70,3 horas. Se uso el optimizador AdamW con un schedule de learning rate coseno (warmup de 0 a 2e-4 y decaimiento suave hasta 0). La perdida de entrenamiento descendio de 1,70 a aproximadamente 0,73. No se documentan en la informacion disponible detalles sobre la composicion exacta del dataset, el uso de RLHF/DPO ni la longitud de contexto empleada durante el entrenamiento.

## Capacidades

- Clasificacion de decisiones multiopcion: dado un estado de juego en texto, selecciona la accion optima entre las candidatas.
- Razonamiento aplicado a juegos de logica y deduccion (Mastermind, Sudoku, Minesweeper, Torre de Hanoi).
- Decision en juegos de cartas y casino (Blackjack, Poker, Solitaire).
- Decision en juegos de tablero y estrategia (Conecta 4, Reversi, Damas, Ajedrez, Tres en raya).
- Resolucion de puzles espaciales y de rejilla (Sokoban, 2048, Snake, Tetris, Pacman, Puzle deslizante).
- Juegos de teoria de la juego y probabilidad (Piedra, papel o tijera; Yahtzee; Nim).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el modelo esta orientado a decisiones puntuales por estado.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales: cabeza de clasificacion CLEF integrada, pesos fusionados listos para despliegue, entrenamiento acelerado con Unsloth.

## Casos de uso

- Motores de decision para agentes de juego: el modelo puede actuar como politica de seleccion de accion en entornos con estado textual y conjunto discreto de acciones, sustituyendo heuristicas manuales en juegos como Conecta 4, Reversi o Damas.
- Evaluacion y analisis de partidas: dado un estado de juego, el modelo clasifica la accion esperada, lo que permite comparar la jugada de un humano con la decision del modelo en herramientas de analisis o entrenadores.
- Prototipado rapido de IA para juegos de mesa digitales: al ser un modelo de 0,6B con licencia Apache 2.0, puede integrarse en backends ligeros para sugerir movimientos en aplicaciones de juego sin infraestructura pesada.
- Generacion de datos sinteticos de decision: el modelo puede etiquetar estados de juego con acciones probables para aumentar datasets de entrenamiento de otros agentes o para validacion cruzada.
- Investigacion en aprendizaje por refuerzo y decision estructurada: sirve como baseline reproducible para estudiar como modelos de lenguaje pequenos aprenden politicas de decision en dominios acotados.
- Educacion y demostraciones de teoria de juegos: el modelo permite ilustrar estrategias en Mastermind, Nim o Piedra, papel o tijera con una precision alta documentada (100 %, 40,8 % y 97 % respectivamente).
- Clasificacion de estados en pipelines de text-classification: al declararse con pipeline text-classification, puede integrarse en servicios de inferencia de Hugging Face (text-embeddings-inference, endpoints compatibles) para clasificar decisiones en lote.

## Benchmarks y rendimiento

Evaluacion sobre 2.193 muestras fuera de distribucion (aproximadamente 100 por juego):

| Categoria | Muestras | Base zero-shot | Modelo ajustado | Ganancia absoluta | Ganancia relativa |
|---|---:|---:|---:|---:|---:|
| Arcade, espacial y puzle | 600 | 34,67 % | 82,00 % | +47,33 % | +136,5 % |
| Logica, deduccion y matematicas | 676 | 26,48 % | 66,72 % | +40,24 % | +152,0 % |
| Cartas y casino | 300 | 41,00 % | 66,33 % | +25,33 % | +61,8 % |
| Tablero clasico y estrategia | 617 | 17,02 % | 55,92 % | +38,90 % | +228,6 % |
| Global | 2.193 | 28,04 % | 67,81 % | +39,77 % | +141,8 % |

Resultados por juego (seleccion de los mas relevantes):

| Juego | Base zero-shot | Modelo ajustado | Ganancia absoluta |
|---|---:|---:|---:|
| Mastermind | 31,0 % | 100,0 % | +69,0 % |
| Blackjack | 39,0 % | 98,0 % | +59,0 % |
| Piedra, papel o tijera | 24,0 % | 97,0 % | +73,0 % |
| Yahtzee | 33,0 % | 96,0 % | +63,0 % |
| Pacman | 49,0 % | 92,0 % | +43,0 % |
| Dots and Boxes | 3,0 % | 88,0 % | +85,0 % |
| Sokoban | 22,0 % | 88,0 % | +66,0 % |
| Snake | 38,0 % | 88,0 % | +50,0 % |
| 2048 | 32,0 % | 86,0 % | +54,0 % |
| Poker | 60,0 % | 78,0 % | +18,0 % |
| Battleship | 8,9 % | 71,1 % | +62,2 % |
| Tetris | 24,0 % | 70,0 % | +46,0 % |
| Puzle deslizante | 43,0 % | 68,0 % | +25,0 % |
| Conecta 4 | 14,0 % | 65,0 % | +51,0 % |
| Tres en raya | 41,0 % | 55,0 % | +14,0 % |
| Reversi | 19,0 % | 49,0 % | +30,0 % |
| Sudoku | 19,0 % | 48,0 % | +29,0 % |
| Nim | 2,6 % | 40,8 % | +38,2 % |
| Minesweeper | 37,0 % | 40,0 % | +3,0 % |
| Torre de Hanoi | 33,0 % | 39,0 % | +6,0 % |
| Damas | 20,0 % | 35,0 % | +15,0 % |
| Ajedrez | 5,6 % | 29,2 % | +23,6 % |
| Solitaire | 24,0 % | 23,0 % | -1,0 % |

Perdida de entropia cruzada media: 0,7298 frente a 1,5026 del modelo base (reduccion de 0,7728).

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 1,2 GB para los pesos (1,14 GB del modelo mas 52 MB de la cabeza), mas overhead de activaciones y contexto; en la practica, menos de 3 GB para lotes pequenos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,6-0,8 GB; en 4 bits, alrededor de 0,4-0,5 GB (estimaciones a partir del tamano de parametros; no se publican cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en GPUs de datacenter como A100 o H100 para despliegues por lotes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas, e incluso en CPU para inferencia de baja latencia.
- Opciones de despliegue: transformers (libreria declarada), text-embeddings-inference y endpoints compatibles segun los tags; llama.cpp, Ollama o vLLM no estan documentados oficialmente para este checkpoint, aunque al ser safetensors de Qwen3-0.6B podrian requerir conversion o adaptacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Qwen3-0.6B-Game-Decision-Model | 596 M | no disponible | Clasificacion de decisiones en 23 juegos | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-0.6B (base) | 596 M | no disponible | Modelo de lenguaje general | Apache 2.0 | Hugging Face |
| Modelos de agentes de juego especializados (p. ej. AlphaZero-like) | no disponible | no aplica | Politicas de juego mediante busqueda y RL | variable | no disponible |

La comparacion directa con alternativas de la misma categoria es limitada: no se dispone de datos publicos de otros modelos de lenguaje ajustados especificamente a decision multi-juego con los que contrastar los mismos benchmarks. El principal referente es el propio modelo base Qwen3-0.6B, frente al que se reporta una mejora de 39,77 puntos porcentuales en precision global.

## Limitaciones y advertencias

- Dominio muy acotado: el modelo esta entrenado exclusivamente para decision en 23 juegos; su uso fuera de ese dominio no esta validado y probablemente produzca resultados pobres.
- Solo ingles: la model card declara unicamente el idioma en; no hay evidencia de soporte multilingue.
- Riesgo de alucinacion y sobreajuste al formato: al ser un clasificador de decision, puede seleccionar acciones invalidas o incoherentes si el estado de juego se presenta con un formato distinto al de entrenamiento.
- Rendimiento desigual: en Ajedrez (29,2 %), Solitaire (23,0 %, con perdida de 1 punto frente al base), Damas (35,0 %) y Torre de Hanoi (39,0 %) el modelo queda lejos de una politica fiable; no debe usarse como motor de juego competitivo en esos casos.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al entrenarse sobre un dataset propio, puede heredar sesgos de la distribucion de estados y acciones de ese dataset.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del modelo base Qwen3-0.6B y del dataset de entrenamiento antes de un despliegue en produccion.
- Sin datos de contexto: no se especifica la longitud de contexto soportada, lo que impide garantizar el manejo de estados de juego largos o historiales extensos.
- Madurez: el repositorio tiene 0 descargas y 2 likes en el momento de la consulta, por lo que no hay validacion independiente de los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaushik-harsh-99/Qwen3-0.6B-Game-Decision-Model
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/kaushik-harsh-99/boardgame-decision-models
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
