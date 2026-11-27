# Listen-AI/Qwen3.6-35B-A3B-Nebula-GGUF

## Resumen

Qwen3.6-35B-A3B-Nebula-GGUF es una cuantizacion personalizada del modelo Qwen3.6-35B-A3B, publicada por ListenAI. No se trata de un modelo entrenado desde cero, sino de una redistribucion en formato GGUF pensada para ejecutarse sobre la plataforma de hardware Nebula del propio fabricante, utilizando una implementacion adaptada de llama.cpp. El modelo base pertenece a la familia Qwen3.6 del equipo Qwen y emplea una arquitectura de mezcla de expertos (MoE), segun indican las etiquetas del repositorio.

El interes de esta publicacion es acotado y muy especifico: sirve como referencia de despliegue de un modelo MoE de gran tamano en un chip propietario con cuantizacion INT4 de pesos y activaciones en FP16. La cuantizacion no es un GGUF estandar, sino un esquema propietario de ListenAI basado en GPTQ con metadatos E4M0 de dos niveles y tamano de grupo 32, lo que limita su portabilidad a motores de inferencia adaptados por el fabricante.

Con 35.505.251.456 parametros totales y un repositorio de 22,7 GB, el modelo esta pensado para cargas conversacionales y de generacion de codigo. Su relevancia actual radica en que demuestra que es posible comprimir un MoE de 35B a 4 bits manteniendo una calidad cercana al baseline FP16 en tareas de codigo y conocimiento, aunque a costa de perder compatibilidad con el ecosistema GGUF convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), segun etiquetas del repositorio; detalles de capas y atencion no disponibles |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 de pesos (E4M0 de dos niveles, group size 32, desc_act=false) con activaciones FP16; esquema GPTQ + cuantizacion propietaria Nebula |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (variante propietaria no compatible con motores GGUF estandar) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura de mezcla de expertos, segun las etiquetas del repositorio (`moe`). ListenAI no aporta informacion sobre el numero de expertos, la estrategia de enrutamiento, la longitud de contexto original ni el volumen de datos de entrenamiento. Tampoco se documenta si el modelo base paso por fases de RLHF o DPO; la model card remite explicitamente al repositorio original de Qwen para arquitectura, tokenizador y configuracion.

La innovacion tecnica de esta publicacion es exclusivamente la cuantizacion. Se aplica un esquema GPTQ con un formato propietario de dos niveles E4M0, grupo de 32 y `desc_act=false`, que produce pesos de 4 bits y activaciones de 16 bits (W4A16). El resultado se empaqueta como GGUF con metadatos de version 2, pero el formato no es compatible con motores GGUF convencionales: requiere la implementacion de llama.cpp adaptada por ListenAI y el runtime y driver de Nebula. No se documentan tecnicas de decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` y el ejemplo de inferencia de la model card.
- Generacion de codigo en Python, C++, Java y JavaScript, validada con un conjunto de 656 muestras y metrica Pass@1.
- Razonamiento y conocimiento general evaluado con MMLU-Pro en 14 categorias (biologia, negocios, quimica, informatica, economia, ingenieria, salud, historia, derecho, matematicas, filosofia, fisica, psicologia y otros).
- Capacidades multilingues: no disponibles; no se especifica la lista de idiomas soportados.
- Tool calling y function calling: no disponible; la model card no lo documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales: no validadas; la model card indica explicitamente que solo se documenta la inferencia de texto.

## Casos de uso

- Despliegue en dispositivos con chip Nebula: el caso de uso principal y practicamente unico documentado. El modelo esta optimizado para inferencia en la plataforma Nebula con el runtime y driver correspondientes, y se carga mediante la implementacion adaptada de llama.cpp.
- Asistencia de codigo en entornos embebidos: con un Pass@1 global del 85,98 % en el conjunto de 656 muestras, el modelo es adecuado para autocompletado y generacion de funciones en Python, C++, Java y JavaScript dentro de toolchains integradas en hardware Nebula.
- Evaluacion de calidad de cuantizacion: sirve como referencia para comparar el impacto de la cuantizacion W4A16 E4M0 frente al baseline FP16 en tareas de codigo y conocimiento, con una perdida global de 0,91 puntos en el benchmark de codigo y de 0,96 puntos en MMLU-Pro.
- Prototipado de asistentes conversacionales en hardware propietario: el ejemplo de la model card (`llama-cli` con prompt de presentacion y 512 tokens de salida) ilustra el flujo basico para validar respuestas conversacionales en el chip.
- Investigacion sobre formatos de cuantizacion no estandar: el esquema de dos niveles E4M0 con group size 32 y `desc_act=false` es un objeto de estudio util para quienes investigan tecnicas de compresion de MoE y su compatibilidad con motores de inferencia.
- Validacion de pipelines de despliegue ListenAI: el repositorio incluye instrucciones de descarga con `huggingface_hub` y compilacion de llama.cpp adaptado, lo que permite integrar el modelo en procesos de CI internos del fabricante o de sus socios.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Test de codigo: 656 muestras, metrica Pass@1. MMLU-Pro: metrica accuracy.

| Benchmark | FP16 baseline | W4A16_E4M0 |
|---|---:|---:|
| Codigo - Python | 89,63 % | 90,24 % |
| Codigo - C++ | 81,71 % | 80,49 % |
| Codigo - Java | 85,98 % | 87,20 % |
| Codigo - JavaScript | 90,24 % | 85,98 % |
| Codigo - Global | 86,89 % | 85,98 % |
| MMLU-Pro - Biology | 90,52 % | 89,68 % |
| MMLU-Pro - Business | 88,59 % | 86,06 % |
| MMLU-Pro - Chemistry | 87,99 % | 86,48 % |
| MMLU-Pro - Computer Science | 86,34 % | 86,59 % |
| MMLU-Pro - Economics | 86,97 % | 86,61 % |
| MMLU-Pro - Engineering | 76,68 % | 74,10 % |
| MMLU-Pro - Health | 76,89 % | 77,75 % |
| MMLU-Pro - History | 74,28 % | 69,29 % |
| MMLU-Pro - Law | 65,40 % | 60,94 % |
| MMLU-Pro - Math | 90,82 % | 92,01 % |
| MMLU-Pro - Philosophy | 78,76 % | 75,15 % |
| MMLU-Pro - Physics | 84,14 % | 86,84 % |
| MMLU-Pro - Psychology | 84,59 % | 83,83 % |
| MMLU-Pro - Other | 76,52 % | 75,32 % |
| MMLU-Pro - Global | 82,30 % | 81,34 % |

La cuantizacion produce mejoras puntuales (Python, Java, Computer Science, Health, Math, Physics) y perdidas notables en History (-4,99 puntos) y Law (-4,46 puntos). No se publican resultados de MMLU estandar, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 22,7 GB, lo que da una cota inferior orientativa para cargar los pesos en memoria; el consumo real depende del runtime de Nebula y del contexto.
- GPU recomendadas: no aplica. El destino documentado es el chip ListenAI Nebula; no se especifica el modelo de hardware concreto.
- Compatibilidad con GPU de consumo: no validada. La model card indica que otras plataformas no han sido validadas y que los motores GGUF estandar pueden no soportar el formato de cuantizacion.
- Opciones de despliegue: llama.cpp en la implementacion adaptada por ListenAI, con runtime y driver de Nebula y backend de carga compatible. vLLM, TGI, Ollama y llama.cpp estandar no estan soportados segun la documentacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Nebula-GGUF (este) | 35.505.251.456 | no disponible | GGUF propietario W4A16 | Apache-2.0 | Hugging Face, 507 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35.505.251.456 | no disponible | safetensors (original) | Apache-2.0 | Hugging Face |
| Otras cuantizaciones GGUF del modelo base | no disponible | no disponible | GGUF estandar | Apache-2.0 | no disponible |

La comparacion relevante es contra el modelo base en FP16: la cuantizacion Nebula pierde 0,91 puntos en el benchmark de codigo y 0,96 puntos en MMLU-Pro, con variaciones por categoria de hasta casi 5 puntos. No se dispone de datos para comparar con cuantizaciones GGUF estandar del mismo modelo base.

## Limitaciones y advertencias

- Compatibilidad restringida: el formato de cuantizacion propietario puede no funcionar en motores GGUF estandar; es necesario usar la implementacion de llama.cpp adaptada por ListenAI.
- Validacion limitada a Nebula: la model card indica que la compatibilidad con otras plataformas no ha sido validada.
- Perdida de calidad medible: descensos de hasta 4,99 puntos en History y 4,46 en Law dentro de MMLU-Pro, y de 4,26 puntos en JavaScript en el benchmark de codigo.
- Multimodalidad no validada: solo se documenta inferencia de texto.
- Idiomas no especificados: no hay lista de idiomas soportados ni evaluaciones multilingues.
- Sesgos y alucinacion: no se documentan evaluaciones de sesgo ni tasas de alucinacion; deben asumirse los riesgos habituales de un modelo de lenguaje sin datos especificos.
- Tool calling y agentes: no documentados, por lo que no deben asumirse en produccion sin validacion previa.
- Licencia: Apache-2.0 heredada del modelo base, lo que permite uso comercial, pero el despliegue practico queda condicionado por el hardware y el runtime propietarios.
- Madurez: 507 descargas y 0 likes en el momento de la consulta; el proyecto es reciente (creado en noviembre de 2026) y con poca validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Listen-AI/Qwen3.6-35B-A3B-Nebula-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper, blog, repositorio de codigo y demos: no disponibles en la informacion proporcionada.
