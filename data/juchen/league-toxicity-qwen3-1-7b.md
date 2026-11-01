# Juchen/league-toxicity-qwen3-1.7b

## Resumen

`Juchen/league-toxicity-qwen3-1.7b` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen/Qwen3-1.7B, desarrollado por el usuario Juchen en el contexto de la asignatura "Train your own small model" del programa Gauntlet (semana 7). Su unica funcion es clasificar una linea de chat del videojuego League of Legends como `toxic` o `nontoxic`, devolviendo exactamente una de esas dos palabras. No es un modelo de proposito general: es un clasificador binario de toxicidad empaquetado como adaptador PEFT sobre un transformer de 1.700 millones de parametros.

El problema que aborda es la moderacion automatica de contenido en el chat de un videojuego competitivo, donde los insultos pueden ser sarcasticos, indirectos ("diff" despectivos) o estar camuflados en otros idiomas. El adaptador se entrena sobre el corpus L2DTnH (Ave, Pekaric, Frohner y Apruzzese, 2026) combinado con 676 lineas sinteticas generadas por Claude Opus 5.5 para cubrir los fallos detectados en la version v1.

Es relevante como ejemplo reproducible de ajuste fino de un modelo pequeno para una tarea de moderacion acotada, con codigo, datos y evaluaciones publicados. Segun la model card, supera el umbral de precision fijado (0,80) pero no el de F1 (0,75): obtiene precision 0,857 y F1 0,698 sobre el conjunto E1000. El repositorio pesa 0,0 GB porque solo contiene los pesos del adaptador, no el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA (PEFT) |
| Parametros totales | 1.700 millones en el modelo base; el adaptador LoRA anade un subconjunto no cuantificado (rank 16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-1.7B) |
| Tipos de cuantizacion | Entrenamiento con QLoRA en base 4-bit NF4; inferencia en bf16 segun la model card |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only. El entrenamiento usa QLoRA: el modelo base se cuantiza a 4 bits NF4 y se entrenan adaptadores LoRA de rango 16, alpha 16 y dropout 0 sobre todas las proyecciones de atencion y MLP. La configuracion incluye learning rate 2e-4, scheduler coseno, una epoca, batch de 16, longitud maxima de 256 tokens, semilla 3407 y calculo de la perdida solo sobre la respuesta. El entrenamiento completo son 725 pasos, 97 minutos en una unica GPU de consumo.

Los datos suman 11.595 filas con un 11 % de ejemplos toxicos. De ellas, 10.919 son mensajes del split de entrenamiento de L2DTnH con etiquetas de anotadores expertos, y 676 son lineas sinteticas generadas por Claude Opus 5.5 dirigidas a los fallos de la v1: sarcasmo, provocaciones, "diff" despectivos, descalificaciones educadas e insultos camuflados (como toxicos), y lineas inofensivas con palabras de apariencia hostil (como no toxicas). Cada linea sintetica se deduplico, se comprobo que no solapara con ningun mensaje de evaluacion y se valido con GPT-5.6 Sol contra las reglas escritas del proyecto; 40 lineas en disputa se descartaron. El prompt es un mensaje de sistema fijo mas la linea de chat, renderizado con la plantilla de chat de Qwen3 y el modo thinking desactivado.

## Capacidades

- Clasificacion binaria de toxicidad: devuelve exactamente `toxic` o `nontoxic` para una unica linea de chat de League of Legends.
- Deteccion de insultos directos, incluyendo insultos camuflados o en idiomas distintos del ingles.
- Deteccion de sarcasmo y provocaciones dirigidas a un jugador.
- Deteccion de "diff" despectivos y descalificaciones educadas.
- Distincion de falsos positivos: charla de juego, callouts, autocritica, citas o reportes de terceros, tacos contra el juego, bromas amistosas y peticiones de que alguien pare.
- Generacion de texto conversacional heredada del modelo base, aunque el adaptador esta especializado en la tarea de etiquetado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso de forma especifica para esta tarea.
- Capacidad multilingue limitada al ingles (aunque detecta insultos en otros idiomas como parte de la regla de toxicidad).

## Casos de uso

- Moderacion de chat en tiempo real en servidores de League of Legends: el adaptador etiqueta cada linea como toxica o no toxica con una latencia propia de un modelo de 1,7B, adecuada para procesar flujos de mensajes en vivo.
- Filtrado previo en pipelines de moderacion humana: se puede usar como primera pasada que prioriza los mensajes marcados como toxicos para revision por moderadores, reduciendo el volumen que estos deben revisar.
- Analisis retrospectivo de partidas: procesar los logs de chat de un torneo o de una comunidad para generar informes de toxicidad por jugador o por partida.
- Investigacion academica sobre toxicidad en videojuegos: el codigo, los datos y las evaluaciones estan publicados, lo que permite reproducir los resultados y comparar con otras aproximaciones.
- Sistemas de reputacion o puntuacion de comportamiento: integrar la etiqueta como senal adicional en un sistema que agregue el comportamiento de un jugador a lo largo del tiempo.
- Prototipado rapido de clasificadores de contenido: al ser un adaptador LoRA sobre un modelo pequeno, sirve como plantilla para adaptar la misma receta a otros dominios de chat (foros, redes sociales) con datos propios.
- Despliegue en hardware modesto: al caber en una GPU de consumo, permite ejecutar la moderacion en local o en el borde sin depender de APIs externas.

## Benchmarks y rendimiento

Resultados publicados en la model card. `E1000` es el primer millar de mensajes del split de test de L2DTnH, evaluado contra las etiquetas de los anotadores expertos. El conjunto de presion (pressure set) son 40 lineas dificiles (4 por regla) etiquetadas segun las reglas escritas del proyecto. El umbral fijado antes de cualquier ejecucion es precision >= 0,80 y F1 >= 0,75 sobre E1000.

| Modelo | Precision | Recall | F1 | Pressure set |
|---|---|---|---|---|
| Qwen3-1.7B sin entrenar | 0,466 | 0,471 | 0,468 | 25/40 |
| **Este adaptador (v2)** | **0,857** | 0,588 | 0,698 | **30/40** |
| v1 (solo datos etiquetados por expertos) | 0,823 | 0,637 | 0,718 | 27/40 |
| Claude Opus 5.5, mejor prompt | 0,624 | 0,765 | 0,687 | 38/40 |
| GPT-5.6 Sol, mejor prompt | 0,419 | 0,882 | 0,568 | 34/40 |

El adaptador supera el umbral de precision pero no el de F1. Tanto el modelo base como el ajustado se ejecutan en bf16.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 1,7B parametros; en bf16 ocupa aproximadamente 3,4 GB de pesos, mas el adaptador LoRA (de pocos MB) y el overhead de activaciones y cache KV. En la practica, cabe en GPUs con 6-8 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 8 GB, como RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100 o H100. Para entrenamiento, la model card indica 97 minutos en una unica GPU de consumo.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16; con cuantizacion adicional (GGUF 4-bit) cabria en GPUs con 4-6 GB.
- Opciones de despliegue: la libreria indicada es PEFT, por lo que se carga con transformers + peft. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible; al ser un adaptador LoRA, requeriria fusion con el modelo base o soporte de adaptadores en el servidor de inferencia.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision / F1 (E1000) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3-1.7B + LoRA) | 1,7B | no disponible | 0,857 / 0,698 | Apache 2.0 | HuggingFace (adaptador PEFT) |
| Qwen3-1.7B sin entrenar | 1,7B | no disponible | 0,466 / 0,468 | Apache 2.0 | HuggingFace |
| Claude Opus 5.5 (mejor prompt) | no disponible | no disponible | 0,624 / 0,687 | propietaria | API |
| GPT-5.6 Sol (mejor prompt) | no disponible | no disponible | 0,419 / 0,568 | propietaria | API |

La comparativa se limita a los modelos reportados en la model card; no se dispone de datos de otros clasificadores de toxicidad comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Falla en la mayoria de hostilidades sin palabras insultantes: detecta solo 4 de las 11 lineas toxicas del conjunto de presion y etiqueta como `nontoxic` expresiones como "gg ez" o "wow great gank jungle, really helpful".
- Evalua una unica linea sin contexto de estado de partida ni de mensajes anteriores, lo que limita la deteccion de ironia dependiente del contexto.
- Solo ingles: entrenado con chat de la release L2DTnH de 2026, aunque la regla de toxicidad contempla insultos en otros idiomas.
- No alcanza el umbral de F1 fijado por el propio proyecto (0,698 frente a 0,75), aunque si el de precision.
- Uso previsto exclusivamente para investigacion: la model card indica explicitamente que no debe usarse para sancionar a jugadores reales.
- Riesgo de sesgos y falsos positivos heredado del corpus de entrenamiento y del modelo base; no se documentan analisis de sesgo en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el uso etico y legal de la moderacion automatizada queda bajo responsabilidad del desplegador.
- El adaptador depende del commit concreto del modelo base (`70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`); cambios en el modelo base pueden alterar el comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Juchen/league-toxicity-qwen3-1.7b
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Codigo, datos y evaluaciones: https://github.com/joshuatagoe/league-toxicity-slm/tree/3745c5e9894ea5b6d5d57b6e945fd990ffd29154
- Paper L2DTnH (Ave, Pekaric, Frohner, Apruzzese, 2026): https://arxiv.org/abs/2604.10175
