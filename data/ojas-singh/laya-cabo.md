# Ojas-Singh/laya-cabo

## Resumen

Laya for Cabo es un ajuste fino (fine-tune) del modelo base convaiinnovations/laya, desarrollado por Ojas-Singh, especializado en jugar al juego de cartas Cabo. Se trata de un modelo de 421,3 millones de parametros que reformula cada decision de juego como una pregunta de opcion multiple: recibe una descripcion textual de la posicion (cartas propias conocidas y desconocidas, numero de cartas de los rivales, pila de descartes y carta robada) y devuelve el movimiento legal que considera mas probable para ganar. El modelo se utiliza para las sillas de IA del proyecto Game Night.

El modelo se distribuye bajo licencia Apache-2.0, con pesos en formato safetensors y un tamano de repositorio de 0,8 GB. Su interes radica en que demuestra un caso de uso muy concreto de IA para juegos de cartas con informacion imperfecta, entrenado con objetivos suaves (tasas de victoria estimadas por rollouts) en lugar de etiquetas unicas, lo que permite al modelo razonar sobre probabilidades de exito en lugar de imitar una unica accion.

La relevancia actual del modelo es acotada: es un fine-tune de dominio muy especifico, con pocas descargas (16) y sin likes, orientado a un proyecto personal de juego. No obstante, sirve como referencia tecnica para quienes quieran adaptar un modelo base pequeno a tareas de decision secuencial con evaluacion mediante rollouts y metricas de win rate con intervalos de confianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune del modelo base convaiinnovations/laya) |
| Parametros totales | 421.293.830 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (segun la fase v2 del entrenamiento; no se especifica para v3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el texto de entrada esta en ingles, segun el formato de prompt del proyecto Game Night) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo base convaiinnovations/laya, del cual no se detalla la arquitectura interna en la informacion disponible. El autor describe el proceso de entrenamiento en tres rondas sucesivas, todas con objetivos suaves (soft targets): en lugar de etiquetas unicas, se usan tasas de victoria estimadas por rollouts para cada movimiento legal. La primera ronda (v1) empleo un profesor de rollouts con 64 rollouts de bots heuristicos por movimiento en partidas de 3 jugadores. La segunda (v2) anadio datos de profesor para 2 y 4 jugadores y amplio el contexto a 512 tokens.

La version v3, que es este modelo, se obtuvo ajustando v2 sobre 76.610 posiciones de self-play, generadas con rollouts guiados por Laya durante seis plies y despues por el bot heuristico, con 8 rollouts por movimiento. Estos datos se mezclaron uno a uno con datos de profesor de v2 reproducidos. El entrenamiento duro 2 epocas con un batch efectivo de 64. La innovacion principal es el uso de objetivos suaves basados en rollouts para aprender una politica probabilistica en un juego de informacion imperfecta, en lugar de imitacion supervisada directa.

## Capacidades

- Toma de decisiones en el juego de cartas Cabo mediante preguntas de opcion multiple: recibe el estado de la partida en texto y devuelve el movimiento legal mas probable para ganar.
- Razonamiento sobre informacion imperfecta: el modelo maneja posiciones donde no conoce todas las cartas propias ni las de los rivales.
- Evaluacion de movimientos legales: el formato de pregunta incluye criterios y opciones, y el modelo selecciona entre ellas.
- Soporte para partidas de 2, 3 y 4 jugadores, segun los datos de entrenamiento de las fases v1 y v2.
- Capacidad de self-play: el modelo se uso para generar datos de entrenamiento guiando rollouts durante seis plies.
- No se dispone de informacion sobre tool calling, function calling, capacidades de agente multi-paso, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles; el formato de prompt se genera en el repositorio Game Night y esta orientado al ingles.

## Casos de uso

- Bot de juego para Cabo en partidas de 2 a 4 jugadores: el modelo se integra como silla de IA en el proyecto Game Night, recibiendo el estado textual de la partida y devolviendo el movimiento elegido. Es adecuado porque su entrenamiento esta especificamente orientado a este juego y formato de pregunta.
- Evaluacion de estrategias de juego: investigadores pueden usar el modelo como oponente de referencia para medir el rendimiento de heuristicas o de otros agentes, gracias a sus tasas de victoria documentadas frente a bots heuristicos.
- Generacion de datos de self-play: el modelo puede generar posiciones y decisiones para entrenar modelos posteriores, como se hizo en la fase v3 con rollouts guiados por Laya.
- Prototipado de agentes para juegos de informacion imperfecta: sirve como ejemplo de pipeline completo (estado textual, opciones legales, objetivos suaves por rollouts) replicable en otros juegos de cartas.
- Despliegue en entornos con recursos limitados: con 421 millones de parametros y 0,8 GB de pesos, puede ejecutarse en CPU con latencias de 0,3 a 1,5 segundos por decision, lo que permite integrarlo en servidores sin GPU.
- Investigacion sobre aprendizaje por refuerzo con objetivos suaves: el modelo documenta un caso practico de entrenamiento con tasas de victoria estimadas por rollouts en lugar de etiquetas duras, util para estudiar tecnicas de imitacion probabilistica.
- Integracion en aplicaciones de ocio: desarrolladores pueden incorporar el modelo en clientes de juego o demos web que necesiten un oponente de IA para Cabo.

## Benchmarks y rendimiento

Tasa de victoria desde el asiento 1 frente a bots heuristicos (1.000 partidas por configuracion, intervalos de Wilson al 95%):

| Jugadores | Bot heuristico | v2 | v3 (este modelo) |
|---|---|---|---|
| 2 | 49,3% | 63,5% | 64,5% [61,5; 67,4] |
| 3 | 29,3% | 41,3% | 41,2% [38,1; 44,2] |
| 4 | 21,9% | 28,9% | 29,4% [26,6; 32,3] |

Frente a dos jugadores v2 (3 jugadores, 600 partidas), v3 gana el 31,5% [27,9; 35,3], mientras que v2 en el mismo asiento gana el 29,1% [25,6; 32,8].

Latencia: aproximadamente 30 ms por decision en GPU y de 0,3 a 1,5 s en unos pocos nucleos de CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 421,3 millones de parametros, los pesos en safetensors ocupan 0,8 GB, por lo que en fp32 se necesitarian alrededor de 1,7 GB y en fp16 alrededor de 0,85 GB, mas memoria para activaciones.
- GPU recomendadas: no se especifican modelos concretos; el autor solo indica que en GPU la latencia es de unos 30 ms por decision.
- Cabe en GPU de consumo: si, practicamente cualquier GPU moderna con al menos 2-4 GB de VRAM deberia poder ejecutarlo, aunque no se confirma oficialmente.
- Opciones de despliegue: la libreria `laya` con `laya.load("Ojas-Singh/laya-cabo", device="cpu")` y el método `agent.predict(state_text, questions)`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 30 ms por decision en GPU; 0,3-1,5 s por decision en unos pocos nucleos de CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ojas-Singh/laya-cabo (v3) | 421,3 M | 512 tokens (fase v2) | 64,5% / 41,2% / 29,4% de win rate en 2/3/4 jugadores frente a heuristico | Apache-2.0 | HuggingFace |
| convaiinnovations/laya (base) | no disponible | no disponible | no disponible | Apache-2.0 | HuggingFace |
| v2 de laya-cabo (version anterior) | no disponible | 512 tokens | 63,5% / 41,3% / 28,9% en 2/3/4 jugadores | Apache-2.0 | No distribuido como modelo separado en la informacion disponible |

No se dispone de informacion sobre otros modelos comparables especializados en Cabo o en juegos de cartas similares.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo solo esta entrenado para el juego Cabo y no es util para tareas generales de texto, codigo o razonamiento.
- Riesgo de alucinacion: al ser un modelo de lenguaje pequeno ajustado para seleccionar entre opciones, puede devolver movimientos ilegales o mal fundados si el formato de prompt no coincide exactamente con el esperado.
- Dependencia del formato de prompt: el autor indica que el formato exacto se genera en `packages/agent-bots/src/laya-cabo.ts` del repositorio Game Night; fuera de ese pipeline el rendimiento puede degradarse.
- Contexto limitado: 512 tokens en la fase v2; no se especifica si v3 mantiene esa longitud, lo que limita la cantidad de informacion de estado que puede procesar.
- Idiomas: no se documentan capacidades multilingues; el modelo esta orientado a entradas en ingles.
- Sesgos: no se documentan sesgos especificos, pero al entrenarse con bots heuristicos y self-play puede heredar las limitaciones estrategicas de esos profesores.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base convaiinnovations/laya tambien es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- Madurez: 16 descargas y 0 likes; es un proyecto personal sin validacion externa, por lo que no se recomienda para produccion sin evaluacion propia.
- Caveat de evaluacion: los win rates se miden desde el asiento 1 y frente a bots heuristicos concretos; no hay garantia de que se generalicen a otros oponentes o variantes de reglas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ojas-Singh/laya-cabo
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio Game Night: https://github.com/Ojas-Singh/Game_Night
