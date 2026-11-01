# predbrad/Genaro-poker

## Resumen

Genaro Poker 0.6B es un ajuste fino completo (full fine-tune) del modelo Qwen3-0.6B de Alibaba, desarrollado por el usuario predbrad. Su proposito no es el de un asistente general, sino el de actuar como oponente controlado por IA en PokerSI, un juego de poker para Android en el que cada asiento de la mesa es un modelo de lenguaje pequeno ejecutado localmente mediante llama.cpp. El modelo recibe un prompt estructurado (persona, reglas, informacion visible del asiento y movimientos legales) y devuelve un unico objeto JSON con una accion valida y, en turnos de conversacion, una frase breve en la voz del personaje.

La relevancia del modelo reside en su enfoque de despliegue en dispositivo: con 596 millones de parametros y una cuantizacion Q4_K_M de 397 MB, cabe en telefonos moviles y sustituye a un modelo mayor (LFM2.5 1.2B) como oponente por defecto de la aplicacion, mejorando la adherencia al formato JSON y eliminando filtraciones de informacion de las cartas. Es un caso practico de modelo de dominio muy estrecho, entrenado con datos generados por el propio motor del juego para garantizar que los prompts de entrenamiento coincidan byte a byte con los de inferencia.

El modelo se publica bajo licencia Apache 2.0, heredada de Qwen3-0.6B, y esta disponible en formato safetensors (bf16) y GGUF. No esta pensado como modelo de chat general: fuera del formato de prompt de PokerSI su comportamiento es el de un Qwen3 pequeno con sesgo hacia el poker.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (configuracion de llama.cpp indicada en la model card) |
| Tipos de cuantizacion | GGUF Q4_K_M (397 MB); pesos bf16 en safetensors |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only de 0.6B parametros, y se somete a un ajuste fino completo en bf16 (no LoRA) durante 2 epocas, con learning rate 3e-5, scheduler coseno, batch efectivo de 64 y calculo de perdida unicamente sobre la respuesta. El entrenamiento completo requirio aproximadamente 70 minutos en un portatil con una NVIDIA RTX Spark N1X. El conjunto de entrenamiento consta de 22.941 conversaciones derivadas de 33.000 manos de self-play generadas por el motor Kotlin de PokerSI y su constructor de prompts, compilado en un bridge para que cada prompt sea identico al que envia la aplicacion.

Las etiquetas de movimiento se obtienen por mayoria de 9 profesores heuristicos (House Bots), cada uno con el estilo de su persona y calculo de equity por Monte Carlo con 1.000 muestras. Las lineas de conversacion de mesa las genera Gemma 4 E4B para el movimiento elegido y solo se conservan si pasan las reglas de la gramatica: entre 2 y 12 palabras, sin vocabulario de cartas ni de manos, respetando las reglas de repeticion de PokerSI y su filtro `HandBlur`. Los turnos silenciosos no incluyen linea, igual que en la gramatica de turno silencioso de la aplicacion. La innovacion tecnica principal es el uso de una gramatica GBNF en llama.cpp para restringir la salida a JSON valido y eliminar filtraciones de informacion.

## Capacidades

- Generacion de decisiones de poker en formato JSON estricto: accion (`call`, `check`, `raise`, `fold`) y cantidad.
- Generacion de conversacion de mesa breve (2-12 palabras) en la voz de la persona asignada, sin revelar cartas.
- Adherencia a gramaticas GBNF para forzar salida estructurada valida.
- Soporte de seis variantes de poker: Texas Hold'em, Omaha, Five-Card Draw, Seven-Card Stud, Short Deck y Crazy Pineapple.
- Funcionamiento en dispositivo con llama.cpp, sin dependencia de red.
- Capacidad de razonamiento limitada al contexto de una decision de poker; no es un modelo de chat general.
- No dispone de tool calling, function calling, vision, audio ni modo de razonamiento extendido (thinking desactivado en el uso previsto).

## Casos de uso

- Oponente de IA en PokerSI: el modelo se integra como asiento de la mesa en la aplicacion Android, recibiendo el prompt del motor Kotlin y devolviendo un movimiento legal con linea de conversacion, todo ejecutado en el telefono con llama.cpp y el GGUF Q4_K_M.
- Prototipado de agentes de juego en dispositivo: sirve como referencia para desarrolladores que quieran construir agentes de decision acotados con salida JSON garantizada mediante gramaticas GBNF, sin infraestructura de servidor.
- Evaluacion de modelos pequenos para tareas de dominio: su conjunto de evaluacion de 600 decisiones held-out permite comparar tecnicas de ajuste fino, cuantizacion y prompting en un escenario reproducible.
- Generacion de dialogos de personaje con restricciones: el pipeline de filtrado de lineas (longitud, vocabulario prohibido, repeticiones) es reutilizable para otros juegos o simulaciones que requieran conversacion breve y segura.
- Educacion e investigacion en IA para juegos: permite estudiar el equilibrio entre calidad de decision y coste computacional en modelos sub-1B, comparando con heuristicas y modelos mayores como LFM2.5 1.2B.
- Base para ajustes finos posteriores: al publicarse en safetensors bf16 con licencia Apache 2.0, puede reentrenarse para otras variantes de poker, otros idiomas o formatos de prompt distintos, aunque requerira datos propios.

## Benchmarks y rendimiento

Resultados sobre 600 decisiones held-out de PokerSI en las seis variantes, ejecutados con llama.cpp con el mismo prompt, gramatica GBNF y muestreo que la aplicacion (temperatura de persona 0.6-0.9, top-k 40, top-p 0.95, maximo 96 tokens):

| Modelo | GGUF | Acuerdo | Blunders /100 | Filtraciones | Habla de cartas | Repeticiones | >12 palabras | bb/100 en juego real |
|---|---|---|---|---|---|---|---|---|
| Qwen3 0.6B (base) | 484 MB | 46,0% | 10,3 | 10,5% | 39,8% | 23,9% | 22,7% | no disponible |
| LFM2.5 1.2B (anterior por defecto) | 731 MB | 55,8% | 12,6 | 2,6% | 29,8% | 8,5% | 9,4% | -80 ± 80 |
| Genaro Poker 0.6B | 397 MB | 78,5% | 9,1 | 0,0% | 0,3% | 0,0% | 0,0% | -84 ± 52 |

Definiciones: acuerdo = mismo movimiento que la mayoria de los 9 profesores House Bot; blunder = fold con equity ≥ 10 puntos por encima de las pot odds, o call/raise con equity ≥ 15 puntos por debajo (salvo bluffs de personas bluffeadoras); filtracion = linea que el propio `HandBlur` de PokerSI censuraria; habla de cartas = cualquier carta, rango o palabra de mano; bb/100 en juego real = resultado en partidas en vivo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB con GGUF Q4_K_M; alrededor de 1,2 GB con pesos bf16.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM; el modelo esta disenado para ejecucion en CPU en telefonos Android mediante llama.cpp.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: llama.cpp (`llama-server -m genaro-poker-0.6b-Q4_K_M.gguf --jinja -c 4096`), Ollama (formato GGUF compatible), transformers con safetensors; text-generation-inference aparece como tag del repositorio.
- Latencia y throughput: no disponible en la informacion proporcionada; el entrenamiento se completo en unos 70 minutos en una RTX Spark N1X.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Acuerdo | Filtraciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Genaro Poker 0.6B | 596 M | 4096 | 78,5% | 0,0% | Apache 2.0 | HuggingFace (safetensors + GGUF) |
| Qwen3 0.6B (base) | 596 M | no disponible | 46,0% | 10,5% | Apache 2.0 | HuggingFace |
| LFM2.5 1.2B | 1,2 B | no disponible | 55,8% | 2,6% | no disponible | HuggingFace |
| Genaro Poker 1.7B | 1,7 B (aproximado) | no disponible | no disponible | no disponible | Apache 2.0 (heredada) | HuggingFace |

## Limitaciones y advertencias

- El modelo imita a los House Bots de PokerSI; es un oponente razonable y legible para partidas casuales, no un jugador fuerte. En juego real no supera a los House Bots (bb/100 de -84 ± 52).
- Entrenado exclusivamente para el formato de prompt de PokerSI y en ingles; fuera de ese formato se comporta como un Qwen3 pequeno con sesgo hacia el poker y no como un chatbot general.
- Riesgo de alucinacion en movimientos o lineas fuera de distribucion si el prompt se desvia del formato de entrenamiento.
- Aunque las filtraciones de cartas se reducen al 0,0% en la evaluacion, el modelo podria generar lineas no deseadas con prompts adversarios; se recomienda mantener la gramatica GBNF y el filtro `HandBlur` en produccion.
- Las lineas de conversacion son familiares por construccion, pero las personas provienen de PokerSI y pueden reflejar sesgos de ese diseno.
- Licencia Apache 2.0 permite uso comercial; los datos de entrenamiento se generaron con PokerSI (MIT) y Gemma 4 (Apache 2.0), lo que conviene verificar en el repositorio de datos antes de un uso comercial.
- No dispone de soporte multilingue, tool calling, vision ni modo thinking; no debe emplearse como sustituto de un modelo de proposito general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/predbrad/Genaro-poker
- Modelo hermano 1.7B: https://huggingface.co/predbrad/Genaro-poker-1.7B
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/predbrad/genaro-poker-sft
- Repositorio de codigo, pipeline y evaluaciones: https://github.com/bradflaugher/genaro-poker
- Resultados de evaluacion: https://github.com/bradflaugher/genaro-poker/blob/main/results/README.md
- Aplicacion PokerSI: https://github.com/bradflaugher/PokerSI
