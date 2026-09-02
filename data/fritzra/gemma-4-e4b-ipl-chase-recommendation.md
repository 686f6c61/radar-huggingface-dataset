# fritzra/gemma-4-e4b-ipl-chase-recommendation

## Resumen

`fritzra/gemma-4-e4b-ipl-chase-recommendation` es un adaptador PEFT LoRA desarrollado por el proyecto CricketRec sobre el modelo base `google/gemma-4-E4B-it` de Google. Su funcion es extremadamente especializada: gestionar la conversacion dentro de un sistema de planificacion de persecuciones (chases) en partidos de la Indian Premier League (IPL). El adaptador no realiza calculos ni recupera datos historicos por si mismo; esas tareas las ejecutan herramientas externas de cricket, mientras que el modelo se encarga de solicitar la evidencia necesaria en el orden correcto, interpretar los resultados de las herramientas y emitir una recomendacion breve al final del proceso.

La relevancia de este modelo reside en su enfoque de adaptacion de dominio: en lugar de entrenar un modelo completo, se anade una capa LoRA de apenas 17,4 millones de parametros sobre un modelo base de 4,4 mil millones, logrando un comportamiento especializado con un coste de entrenamiento minimo. El adaptador sigue una politica de cinco familias de evidencia (opciones de bateo, marcador previo, perfiles de fase de bateadores, perfiles de fase de lanzadores y estado actual del partido) y soporta transiciones de planificacion de 0 a 6, 6 a 10 y 10 a 15 overs. El repositorio contiene unicamente los pesos LoRA en formato safetensors; el modelo base debe descargarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Gemma 4 E4B IT (transformer decoder-only, multimodal) |
| Parametros totales | 17.440.768 (adaptador) + 4.400.000.000 (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256.000 tokens (modelo base) |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion (recomendado), BF16 |
| Idiomas soportados | ingles (adaptador); el modelo base soporta mas de 140 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `google/gemma-4-E4B-it`, un modelo de 4,4 mil millones de parametros con entrada multimodal (texto, vision y audio) y ventana de contexto de hasta 256K tokens. La capa LoRA utiliza rango 8, alpha 16 y dropout 0,05, y se aplica a las proyecciones de atencion Q, K, V y O, asi como a las proyecciones gate, up y down del MLP. Las torres de audio y vision permanecen intactas.

El entrenamiento se realizo con el modelo base en cuantizacion 4-bit NF4 con doble cuantizacion, computo en BF16 y optimizador paged AdamW de 8 bits, con batch size 1. El corpus analitico de cricket contenia 290 partidos IPL utilizables, 69.851 entregas y 2.900 estados de checkpoint de las temporadas 2022 a 2025. La superficie supervisada final consta de 340 ejemplos de conversacion completa distribuidos en cuatro etapas (V14, V15, V17 y V18) con 980 actualizaciones de optimizador en total. Cada ejemplo es un prefijo de conversacion visible completo, y la funcion de perdida se aplica solo al turno final del asistente. Los datos de validacion de 2024 se usaron durante el desarrollo; la temporada 2025 quedo fuera del conjunto de entrenamiento aceptado, aunque experimentos anteriores ya habian consultado esa temporada.

## Capacidades

- Generacion de preguntas de evidencia en orden esperado dentro de un sistema de planificacion de chases de cricket.
- Interpretacion de resultados de herramientas externas (aritmetica y recuperacion historica) y continuacion de la conversacion en consecuencia.
- Gestion de cinco familias de evidencia: opciones de bateo y lanzadores candidatos, marcador y wickets previos con procedencia, perfiles de fase de bateadores disponibles, perfiles de fase de lanzadores candidatos, y estado de striker, non-striker, siguiente lanzador confirmado y preferencia de riesgo.
- Manejo de resultados no disponibles: si una familia de evidencia no puede resolverse, el adaptador lo acepta y avanza a la siguiente pregunta pendiente.
- Emision de una recomendacion breve y fundamentada una vez que todas las familias de evidencia estan resueltas.
- Soporte de transiciones de planificacion de 0 a 6, 6 a 10 y 10 a 15 overs, partiendo del marcador real registrado en cada frontera.
- Integracion con tool-use: el adaptador solicita datos a un controlador externo que ejecuta las herramientas y devuelve los resultados.

## Casos de uso

- Planificacion de persecuciones en cricket T20: el adaptador guia la conversacion para recopilar la evidencia necesaria (marcador previo, perfiles de jugadores, estado del partido) y emite una recomendacion de estrategia para los primeros 6, 10 o 15 overs.
- Analisis deportivo automatizado: integrado en un pipeline que consume datos de partidos IPL, el modelo estructura la peticion de informacion y resume las conclusiones para analistas.
- Asistente de decision para cuerpos tecnicos: un controlador alimenta al modelo con el estado del partido y las opciones disponibles; el adaptador solicita los datos que faltan y produce una recomendacion accionable.
- Sistema de recuperacion de informacion conversacional: el adaptador demuestra como un LoRA de dominio puede convertir un modelo generalista en un interlocutor especializado que sabe que preguntar y cuando detenerse.
- Entrenamiento de politicas de evidencia: el patron de cinco familias de evidencia puede replicarse en otros dominios donde un agente deba recopilar informacion de forma ordenada antes de decidir.
- Evaluacion de adaptadores LoRA de bajo coste: sirve como caso de estudio para medir cuantos ejemplos y actualizaciones se necesitan para especializar un modelo de 4,4B en una tarea estrecha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas estandar (MMLU, HumanEval, GSM8K) ni comparaciones cuantitativas con otros modelos. El unico dato de rendimiento disponible es el numero de ejemplos de entrenamiento (340) y actualizaciones (980), que no constituyen una medida de calidad.

## Requisitos de hardware

- VRAM estimada: minimo 8 GB para el modelo base Gemma 4 E4B en cuantizacion 4-bit; el adaptador anade un coste marginal despreciable.
- GPU recomendadas: cualquier GPU consumer con 8-16 GB de VRAM (RTX 3060, RTX 4060, RTX 4090). El equipo de desarrollo utilizo una maquina con 16 GB, manteniendo la capa de embeddings congelada en CPU y los layers de lenguaje con el adaptador en GPU.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `PeftModel` y `BitsAndBytesConfig` para cuantizacion 4-bit NF4. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en la documentacion del adaptador.
- Latencia y throughput: no disponible. Dado el tamano del modelo base (4,4B) y la cuantizacion 4-bit, se espera una latencia moderada en hardware consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| fritzra/gemma-4-e4b-ipl-chase-recommendation | 4,4B + 17,4M LoRA | 256K | Planificacion de chases IPL | Apache-2.0 |
| google/gemma-4-E4B-it (base) | 4,4B | 256K | Generico multimodal | Apache-2.0 |
| google/gemma-4-12B | 12B | 256K | Generico multimodal | Apache-2.0 |

La comparacion directa con otros adaptadores LoRA de dominio no es posible con la informacion disponible. Frente al modelo base, este adaptador sacrifica generalidad para ganar precision en una tarea muy concreta: sabe que evidencia pedir, en que orden y cuando emitir una recomendacion. Frente a modelos mas grandes como Gemma 4 12B, el adaptador ofrece un coste de inferencia menor al mantener el modelo base en 4,4B, aunque su utilidad fuera del dominio del cricket es practicamente nula.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: el adaptador solo es util para planificacion de chases en IPL. Fuera de ese contexto, su comportamiento no esta garantizado y puede producir respuestas incoherentes.
- Dependencia de un controlador externo: el modelo no ejecuta herramientas ni realiza calculos; requiere un sistema que suministre el estado del partido, los jugadores disponibles y los resultados de las herramientas.
- Idioma limitado: el adaptador esta entrenado solo en ingles; aunque el modelo base soporta mas de 140 idiomas, la politica de evidencia y las recomendaciones estan formuladas en ingles.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar datos si el controlador no proporciona la evidencia solicitada. La politica de "resultado no disponible" mitiga parcialmente este riesgo, pero no lo elimina.
- Datos de entrenamiento limitados: 340 ejemplos de conversacion es una superficie muy pequena; el rendimiento en situaciones no cubiertas por el corpus (partidos fuera de IPL, formatos distintos a T20) es impredecible.
- Contaminacion de datos: la temporada 2025 fue consultada en experimentos anteriores, por lo que no puede considerarse un holdout limpio para evaluacion.
- Requisito de descarga separada del modelo base: el repositorio solo contiene los pesos LoRA; es necesario descargar `google/gemma-4-E4B-it` por separado, lo que anade complejidad al despliegue.
- Sin garantias de soporte: el proyecto CricketRec parece ser un esfuerzo individual; no hay indicios de mantenimiento activo, documentacion de API o canal de soporte.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/fritzra/gemma-4-e4b-ipl-chase-recommendation
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Guia de Gemma 4 E4B: https://gemma4.dev/models/gemma-4-e4b
- Anuncio de Gemma 4 (blog de Google): https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Guia de Gemma 4 (descarga y ejecucion): https://gemma4.org/
