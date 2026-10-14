# Bullkort/SkyrimLLMBridge-Gemma-2B

## Resumen

SkyrimLLMBridge-Gemma-2B es un adaptador de ajuste fino supervisado con QLoRA desarrollado por el usuario Bullkort, construido sobre el modelo base `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`. El modelo se entreno como parte de una tesis de master en Inteligencia Artificial en la Universidad de Cardiff, y su proposito es servir como nucleo de IA del mod "Deterministic LLM Dialogue Bridge" para The Elder Scrolls V: Skyrim. En lugar de comportarse como un chatbot abierto, el modelo esta especializado en emitir un unico objeto JSON valido que mapea el dialogo de un PNJ a un estado de juego deterministico (intencion del jugador, tema, politica narrativa y pistas de mision reveladas).

El problema que aborda es la "alucinacion no acotada" en PNJ controlados por LLM: un modelo generativo libre puede inventar informacion que rompe la logica de la mision o filtrar spoilers de forma prematura. La solucion propuesta es un contrato de esquema JSON fijo con aislamiento epistemico, de modo que el modelo solo revela aquello que el personaje puede conocer segun el estado de la mision, y delega la validacion final a un validador externo en Python o C++.

La relevancia actual del modelo es acotada y muy especializada: no es un modelo de proposito general, sino un componente de enrutamiento narrativo para videojuegos, con una tasa de acierto en reglas y enrutamiento del 53,4 por ciento frente al 19,0 por ciento del Gemma base y el 29,0 por ciento de Command R+ (26B), segun los datos publicados por el autor. El repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma), adaptado con QLoRA / PEFT sobre atencion estandar; detalles completos de la arquitectura base no disponibles |
| Parametros totales | 4.647.450.147 (~4,65 B) segun pesos safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF, con imatrix); modelo base entrenado en bnb-4bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) y GGUF (Q4_K_M, ~3,2 GB) |

Nota de consistencia: la model card titula el modelo como "Fine-Tuned Gemma 2B", pero el campo `base_model` apunta a `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit` y el recuento real de parametros safetensors es de ~4,65 B. Existe una discrepancia de nomenclatura y de tamano que conviene verificar antes de desplegar.

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alfa 16 (QLoRA) sobre una base Gemma cuantizada a 4 bits, gestionado con la libreria PEFT de Hugging Face y entrenado con Unsloth. El ajuste se realizo sobre conversaciones multirrueda ambientadas en Skyrim, con el objetivo de que el modelo aprenda a mapear intencion narrativa a politicas de motor de juego definidas (por ejemplo `witness_reveal_c1` o `witness_deny_map_knowledge`). No se especifican el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de la descripcion de "miles de dialogos multirrueda".

La innovacion tecnica principal no esta en la arquitectura, sino en el contrato de salida: el modelo se entrena para devolver exactamente un objeto JSON con las claves `schema_version`, `dialogue`, `player_intent`, `topic`, `policy_id`, `response_type`, `clue_claims` y `action_request`, en ese orden, con comillas dobles y sin Markdown ni claves extra. El entrenamiento incluye aislamiento epistemico (el personaje solo declara lo que puede saber) y manejo de entradas hostiles o sin sentido mediante aclaracion o desescalada en personaje, en lugar de ruptura de personalidad o disculpas alucinadas. No se documenta el uso de RLHF ni DPO; el proceso descrito es QLoRA supervisado.

## Capacidades

- Generacion de texto conversacional restringida a un unico objeto JSON valido como salida (formato contrato, no texto libre).
- Clasificacion semantica de la intencion del jugador entre un vocabulario cerrado: `greet`, `social_chat`, `request_quest_guidance`, `offer_information`, `unclear`, `ask_for_repetition`, `ask_for_information`, `ask_for_clarification`.
- Clasificacion de tema entre un vocabulario cerrado: `none`, `witness`, `victim`, `drink`, `argument`, `unrelated`, `map`, `poison`, `quest_progress`, `suspect`, `personal`.
- Enrutamiento determinista de politica narrativa (`policy_id`) y tipo de respuesta (`response_type`).
- Control de revelacion de pistas de mision mediante el campo `clue_claims`, con validacion externa de prerequisitos.
- Propuesta de acciones de juego mediante `action_request` (por ejemplo `attack`, `flee`, `trade`, o `null`).
- Aislamiento epistemico: respeta lo que el personaje conoce frente a lo no revelado, evitando filtraciones prematuras de trama.
- Manejo de prompts hostiles o sin sentido con aclaracion o desescalada en personaje.
- Capacidades multilingues: no disponibles (no se documenta soporte de idiomas).
- Soporte de tool calling / function calling generico: no disponible; el mecanismo de salida estructurada es especifico del esquema del mod.
- Vision, audio o modo de razonamiento explicito: no disponibles.

## Casos de uso

- Dialogo de PNJ en Skyrim con estado deterministico: el mod envia el estado de la mision (quest_id, quest_stage, known_clues) y el mensaje del jugador, y el modelo devuelve el JSON con la linea de dialogo y la politica aplicada. Es adecuado porque su tasa de acierto en enrutamiento (53,4 por ciento) supera ampliamente la del modelo base.
- Prevencion de spoilers en misiones: gracias al campo `clue_claims` y al aislamiento epistemico, el motor solo concede una pista si el validador externo confirma que el jugador cumple los prerequisitos, evitando filtraciones prematuras.
- Gestion de conversaciones multirrueda con contexto de juego persistente: el modelo clasifica la intencion y el tema en cada turno, lo que permite mantener coherencia entre interacciones sucesivas con el mismo PNJ.
- Reutilizacion en otros PNJ de Skyrim: la model card indica que basta con mantener las claves JSON y aportar el perfil del personaje en el prompt de sistema, de modo que un modder puede reutilizar los pesos para otros personajes.
- Portabilidad a otros motores de juego: el autor menciona Unreal, Unity, Fallout 4 y Starfield como destinos posibles si se respeta el contrato JSON, lo que permite integrar el modelo como servicio de dialogo en proyectos no vinculados a Skyrim.
- Despliegue local en equipos de jugador: con un GGUF Q4_K_M de ~3,2 GB y un pico de 7,1 GB de VRAM medido, es viable ejecutarlo en GPUs de gama media junto al propio juego.
- Investigacion academica sobre alucinacion acotada: como artefacto de tesis, sirve para reproducir el experimento de comparacion entre un modelo 2B ajustado y un modelo 26B sin ajustar en una tarea de enrutamiento estructurado.

## Benchmarks y rendimiento

Datos publicados por el autor, evaluados sobre 1.500 ensayos (5 semillas aleatorias, 100 escenarios de prueba) en una AMD Radeon RX 6900 XT con backend ROCm:

| Metrica | Gemma 2B base | Command R+ (26B) base | Gemma 2B ajustado (este modelo) |
|---|---|---|---|
| Precision en reglas y enrutamiento | 19,0 % (±1,76 %) | 29,0 % (±3,17 %) | 53,4 % (±3,24 %) |
| Latencia mediana | 0,92 s | 2,43 s | 0,98 s |
| Latencia media | 0,95 s | 2,50 s | 1,91 s |
| Latencia P95 | 1,15 s | 3,10 s | 1,25 s |
| Throughput | 38,5 TPS | 14,1 TPS | 36,2 TPS |
| VRAM pico | 5,5 GB | 15,6 GB | 7,1 GB |
| Tasa de filtracion epistemica | 5/500 (1,0 %) | 0/500 (0,0 %) | 5/500 (1,0 %) |

Significacion estadistica declarada por el autor: modelo ajustado 2B frente a base 2B, t = 14,08, p < 0,001; modelo ajustado 2B frente a base 26B, t = 9,81, p < 0,001. No se aportan resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generalistas.

## Requisitos de hardware

- VRAM estimada para inferencia: pico medido de 7,1 GB con el modelo ajustado en el entorno de prueba; el GGUF Q4_K_M ocupa aproximadamente 3,2 GB en disco.
- GPU utilizadas en la evaluacion: AMD Radeon RX 6900 XT con backend ROCm.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM. El archivo Q4_K_M permite margen adicional en tarjetas de 8-12 GB. Para GPU de datacenter no hay datos publicados (A100, H100), aunque no serian necesarias por el tamano del modelo.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPUs de consumo de 8 GB o mas. La model card lo orienta explicitamente a despliegue local en el equipo del jugador.
- Opciones de despliegue documentadas: KoboldCpp (flujo recomendado por el autor con el GGUF `gemma-4-e2b-it.Q4_K_M.gguf`); llama.cpp es compatible por el formato GGUF. vLLM, TGI u Ollama no se mencionan en la informacion disponible.
- Latencia y throughput estimados: latencia mediana 0,98 s, media 1,91 s, P95 1,25 s y 36,2 tokens por segundo en la configuracion medida (RX 6900 XT, ROCm). En hardware distinto los valores variaran.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision en reglas y enrutamiento | Latencia mediana | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SkyrimLLMBridge-Gemma-2B | ~4,65 B | no disponible | 53,4 % | 0,98 s | Apache 2.0 | Hugging Face (0 descargas) |
| Gemma 2B base | ~2 B (segun model card) | no disponible | 19,0 % | 0,92 s | no disponible en la informacion | modelo base |
| Command R+ | 26 B | no disponible | 29,0 % | 2,43 s | no disponible en la informacion | modelo base |

Los dos modelos comparables citados provienen de la propia tabla de evaluacion del autor; no se dispone de datos de otros modelos de enrutamiento JSON o de dialogo de PNJ para ampliar la comparativa.

## Limitaciones y advertencias

- Modelo de proposito muy restringido: esta disenado para emitir un unico objeto JSON con un esquema fijo y no como modelo de chat generalista. Usarlo fuera de ese contrato degradara su comportamiento.
- Tasa de filtracion epistemica del 1,0 por ciento (5 de 500 casos) incluso tras el ajuste, identica a la del modelo base. No es cero, y en produccion un spoiler filtrado puede romper una mision.
- Precision en reglas y enrutamiento del 53,4 por ciento: algo mas de la mitad de los casos se resuelven correctamente, por lo que es imprescindible un validador externo antes de aplicar cambios de estado al motor de juego.
- Discrepancia entre el nombre del modelo ("Gemma 2B"), el modelo base declarado (`unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`) y el recuento real de parametros (~4,65 B). Conviene verificar que version base se esta usando realmente.
- No se documentan sesgos conocidos, composicion del dataset de entrenamiento ni idiomas soportados, lo que dificulta evaluar riesgos de sesgo y cobertura linguistica.
- Sin validacion de la comunidad: 0 descargas y 0 likes, un solo autor y respaldo exclusivamente academico (tesis de master). No hay evidencia de uso en produccion a escala.
- La model card esta truncada en la seccion de instrucciones de KoboldCpp, por lo que el procedimiento de despliegue completo no queda recogido.
- Licencia Apache 2.0, que en principio permite uso comercial, pero el modelo base y los datos de entrenamiento podrian imponer condiciones adicionales no detalladas en la informacion disponible.
- Dependencia de un validador externo en Python o C++ para comprobar el JSON y los prerequisitos de las pistas; el modelo por si solo no garantiza la coherencia del estado del juego.
- Los resultados de benchmarks son autoinformados por el autor y no han sido replicados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bullkort/SkyrimLLMBridge-Gemma-2B
- Mod en Nexus Mods (Skyrim Special Edition): https://www.nexusmods.com/skyrimspecialedition/mods/194492
- KoboldCpp (repositorio y releases): https://github.com/LostRuins/koboldcpp/releases
- Modelo base en Hugging Face: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit

Nota sobre la busqueda web: los unicos resultados devueltos corresponden a hilos de foro no relacionados con el modelo (Lowyat.NET sobre WhatsApp). No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la busqueda realizada.
