# jakeatx/Qwen3.8-27B-Ternary-PQ2_0-MTP-GGUF

## Resumen

Qwen3.8-27B-Ternary-PQ2_0-MTP-GGUF es una cuantizacion ternaria de 2 bits (2,13 bits por peso) del modelo Qwen3.8-27B, publicada por el usuario jakeatx en Hugging Face. Segun el autor, el modelo base sigue la arquitectura Prism ML Ternary Bonsai 2 e incorpora un cabezal MTP (multi-token prediction) nativo de una capa que actua como drafter para decodificacion especulativa. El resultado es un unico fichero GGUF de 7,66 GB que representa 27.320.697.856 parametros totales.

El problema que resuelve es de eficiencia de memoria: gracias a la cuantizacion ternaria PQ2_0 (grupo de 128, 34 bytes por bloque) y al offload completo de capas, el autor declara que el modelo cabe en una sola GPU de 24 GB (RTX 3090 o 3090 Ti) con capacidad de contexto de 245K+ tokens. Esto lo situa en el nicho de modelos de ~27B ejecutables en hardware consumer de gama alta, un segmento donde la VRAM es el cuello de botella habitual.

La relevancia actual viene de dos frentes. Por un lado, la cuantizacion ternaria agresiva permite reducir el peso de un modelo de ~27B a menos de 8 GB sin recurrir a descarga a disco. Por otro, la integracion del cabezal MTP como drafter especulativo dentro del propio GGUF evita depender de un modelo borrador separado. El repositorio no tiene descargas ni valoraciones, y el runtime objetivo es una bifurcacion especifica de llama.cpp denominada llamAmpere.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; el autor indica derivacion de Qwen3.8-27B con arquitectura "Prism ML Ternary Bonsai 2" (tag `qwen3_5`). No se especifica si es transformer denso, MoE o hibrida |
| Parametros totales | 27.320.697.856 (27,32 B), dato de safetensors |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | Hasta 245K+ tokens con offload completo segun el autor; el ejemplo de uso configura 32.768 tokens |
| Tipos de cuantizacion | PQ2_0 ternaria a ~2,13 bpw (grupo 128, 34 bytes/bloque); proyecciones del cabezal MTP en Q8_0; cache KV con `-ctk q8_0` y `-ctv turbo3` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del modelo | 7,66 GB (fichero GGUF); repositorio completo: 15,2 GB |
| Hardware objetivo | Una GPU de 24 GB, Ampere sm86 (RTX 3090 / 3090 Ti) |
| Runtime | llamAmpere, rama `feature/v0.3.1-bonsai2` |
| Pipeline declarado | Conversacional (`conversational`), compatible con endpoints |

## Arquitectura y entrenamiento

La informacion disponible describe un proceso de cuantizacion, no un entrenamiento desde cero. El autor parte de Qwen3.8-27B (arquitectura Bonsai 2) y aplica una cuantizacion ternaria de 2 bits en formato PQ2_0, con bloques de 34 bytes por cada 128 pesos, lo que da 2,13 bpw. La innovacion principal es el tratamiento del cabezal MTP: se conserva una capa nativa de prediccion multi-token cuyas matrices de proyeccion se almacenan en Q8_0 y se han afinado sobre Bonsai 2, de modo que sirve como drafter especulativo sin necesidad de un modelo auxiliar.

En el plano de la decodificacion, el autor configura `--spec-type draft-mtp` con `--spec-draft-n-max 3` y `--spec-draft-p-min 0`, es decir, se proponen hasta tres tokens por paso de borrador y se aceptan desde probabilidad cero. Los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada, como tampoco lo esta si la cuantizacion ternaria se obtuvo mediante calibracion con datos o con una transformacion puramente analitica.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational` del repositorio.
- Decodificacion especulativa nativa mediante el cabezal MTP de una capa, con hasta 3 tokens de borrador por paso.
- Inferencia con ventana de contexto larga: el autor declara 245K+ tokens con offload completo, aunque el ejemplo de uso se limita a 32.768.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integracion con servidores estilo API, y el ejemplo de uso emplea `llama-server`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking, vision, audio u otras capacidades multimodales: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (el repositorio no declara idiomas).
- Razonamiento y generacion de codigo: no disponible; no hay evaluaciones publicadas que lo confirmen.

## Casos de uso

- Despliegue local en una unica GPU de 24 GB: el fichero de 7,66 GB permite cargar el modelo completo con `-ngl 99` en una RTX 3090 o 3090 Ti, dejando el resto de la VRAM para cache KV y contexto. Es el escenario que el propio autor documenta.
- Conversaciones multi-turno con contexto largo: con la configuracion del autor (`-ctk q8_0 -ctv turbo3`) y el margen hasta 245K tokens declarado, el modelo puede mantener historiales extensos sin truncado agresivo, util en asistentes de soporte o tutoria.
- Analisis de documentos largos: resumen, extraccion y preguntas sobre contratos, informes o documentacion tecnica que superen los 100K tokens, aprovechando la ventana extendida y el offload de capas.
- Servidor de inferencia autoalojado: mediante `llama-server` con `-fa on` y `-b 4096`, se puede exponer una API compatible con endpoints para integrarla en aplicaciones internas sin coste por token.
- Investigacion en cuantizacion ternaria: el formato PQ2_0 a 2,13 bpw es un caso de estudio para medir la degradacion de calidad de modelos de ~27B comprimidos por debajo de 8 GB frente a cuantizaciones de 4 bits.
- Investigacion en decodificacion especulativa: la integracion del cabezal MTP en el propio GGUF permite experimentar con tasas de aceptacion del drafter y comparar `--spec-draft-n-max` sin gestionar un segundo modelo.
- Prototipado de asistentes en estaciones de trabajo con Ampere: equipos con RTX 3090 pueden servir un modelo de 27B en local para tareas de redaccion tecnica o generacion de codigo, siempre que se valide antes la calidad de la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye cifras de MMLU, HumanEval, GSM8K ni de tasa de aceptacion del drafter MTP, y los resultados de busqueda web obtenidos no contienen informacion relacionada con el modelo. Tampoco se dispone de mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 7,66 GB. Con offload completo (`-ngl 99`) y cache KV cuantizada (`-ctk q8_0 -ctv turbo3`), el autor situa el conjunto dentro de los 24 GB de una RTX 3090, con capacidad declarada de 245K+ tokens de contexto. No se proporciona un desglose de memoria por componente.
- GPU objetivo: Ampere sm86, explicitamente RTX 3090 y RTX 3090 Ti (24 GB). El repositorio esta etiquetado con `ampere` y `sm86`.
- Compatibilidad con otras arquitecturas (Ada, Hopper, Blackwell) o con GPU de menos de 24 GB: no disponible en la informacion proporcionada.
- Cabe en GPU consumer: si, en RTX 3090 y 3090 Ti de 24 GB segun el autor. No se confirma su funcionamiento en tarjetas de 12 o 16 GB.
- Opciones de despliegue: llamAmpere (rama `feature/v0.3.1-bonsai2`), compilado para sm86 y ejecutado con `llama-server`. No se declara compatibilidad con llama.cpp estandar, vLLM, TGI, Ollama ni otros runtimes.
- Latencia y throughput estimados: no disponible. La unica referencia de rendimiento es la configuracion de decodificacion especulativa con hasta 3 tokens de borrador por paso.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada, ni de cifras de rendimiento de este modelo que permitan un contraste objetivo. La siguiente tabla recoge unicamente los datos verificables del modelo descrito; las alternativas de la misma categoria (otros modelos de ~27B en 2 o 4 bits) no estan documentadas en la informacion disponible.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Ternary-PQ2_0-MTP-GGUF | 27,32 B | 245K+ declarado (32.768 en el ejemplo) | Ternaria PQ2_0, 2,13 bpw | Apache 2.0 | Hugging Face, 0 descargas |
| Alternativas de ~27B en 2-4 bits | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (18 de septiembre de 2026). No hay validacion independiente de su funcionamiento ni de la calidad de la cuantizacion.
- Requiere un runtime especifico (llamAmpere, rama `feature/v0.3.1-bonsai2`) compilado para sm86. No se declara compatibilidad con llama.cpp estandar, lo que limita su portabilidad y complica el mantenimiento en produccion.
- La cuantizacion ternaria a 2,13 bpw es agresiva: cabe esperar degradacion de calidad frente al modelo base, pero no hay evaluaciones publicadas que cuantifiquen esa perdida.
- El modelo base (Qwen3.8-27B) y la arquitectura "Prism ML Ternary Bonsai 2" no estan documentados en la informacion proporcionada, por lo que no se puede verificar la procedencia de los pesos ni la cadena de licencias del modelo original.
- La licencia declarada es Apache 2.0, que en principio permite uso comercial, pero al tratarse de una cuantizacion derivada conviene confirmar la licencia del modelo base antes de explotarlo en produccion.
- Existe una discrepancia entre el tamano del fichero declarado (7,66 GB) y el tamano total del repositorio (15,2 GB); no se detalla que contienen los aproximadamente 7,5 GB adicionales.
- No hay informacion sobre idiomas soportados, sesgos, alineacion, comportamiento ante contenido sensible ni riesgo de alucinacion especifico de esta cuantizacion.
- No se confirma soporte de tool calling, agentes, vision ni modo thinking, por lo que no deberian asumirse estas capacidades en un diseno de producto.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los enlaces obtenidos pertenecen a un tracker de videojuegos y no son relevantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jakeatx/Qwen3.8-27B-Ternary-PQ2_0-MTP-GGUF
- Runtime llamAmpere (rama `feature/v0.3.1-bonsai2`): https://github.com/JakeATX/llamAmpere
- Paper, blog o demo del modelo: no disponible
- Repositorio o documentacion del modelo base Qwen3.8-27B: no disponible en la informacion proporcionada
- Enlaces adicionales de la busqueda web: no se han encontrado enlaces relevantes
