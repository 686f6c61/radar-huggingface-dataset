# IsValorum/Iris-mini-MTP-APEX-I-MiniPlus-GGUF

## Resumen

Iris-mini-MTP-APEX-I-MiniPlus-GGUF es una cuantizacion GGUF personalizada del modelo base AllSpark-Research/Iris-mini, un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 35.505.251.456 parametros totales segun los pesos en safetensors del modelo original. La publica el usuario IsValorum bajo licencia Apache 2.0, y su objetivo es ofrecer una version comprimida que preserve la fidelidad de los tensores criticos (router, cabeza de salida y compuertas de atencion) frente a las cuantizaciones genericas de 2 y 3 bits.

La ficha del autor la etiqueta como variante "MiniPlus V1", un perfil compacto y agil con router en F32 sin comprimir, cabeza de salida en Q6_K, compuertas de atencion en Q8_0 y expertos nucleo en IQ3_XXS, con un peso aproximado de 13,56 GiB. Incluye soporte nativo de decodificacion especulativa mediante Multi-Token Prediction (MTP), pensado para acelerar la generacion en llama.cpp.

Su relevancia practica radica en que permite ejecutar un MoE de 35B en hardware de consumo y en RAM de sistema (DDR4/DDR5), manteniendo contexto largo (hasta 256K segun el autor) y velocidades de 20 a 45 tok/s en inferencia por RAM. El propio autor recomienda su variante V2.1 como opcion principal, por lo que esta V1 debe considerarse una edicion heredada mantenida por transparencia arquitectonica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, etiquetada como qwen35moe |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 256K tokens (segun el autor) |
| Tipos de cuantizacion | GGUF personalizada: router F32, cabeza de salida Q6_K, compuertas de atencion Q8_0, expertos nucleo IQ3_XXS; tamano aproximado de 13,56 GiB |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar (la model card declara 13 idiomas; los metadatos de Hugging Face solo listan en y zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con imatrix |
| Modelo base | AllSpark-Research/Iris-mini |
| Tamano del repositorio | 14,8 GB |
| Decodificacion especulativa | MTP (Multi-Token Prediction) nativo |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con capas Mixture of Experts, identificado en las etiquetas como `qwen35moe`, lo que sugiere una familia derivada de la arquitectura Qwen con 35B de parametros totales. No se dispone de informacion sobre el numero de parametros activos por token, el numero de expertos, el reparto de capas compartidas ni la dimension oculta. Tampoco hay datos publicados sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La aportacion tecnica de esta ficha no esta en el entrenamiento, sino en la cuantizacion tensor a tensor. El autor describe una estrategia que mantiene sin comprimir las compuertas del router en F32 (criticas para enrutar correctamente a los expertos), protege la cabeza de salida de tokens en Q6_K para evitar errores de sintaxis y corchetes en codigo, y fija las compuertas de atencion en Q8_0. Los expertos nucleo se cuantizan en IQ3_XXS, por encima del umbral de calidad que el autor situa en las recetas genericas de 2 bits (`IQ2_S`).

Ademas, el paquete incorpora soporte de Multi-Token Prediction para decodificacion especulativa en llama.cpp, lo que permite proponer varios tokens por paso y validarlos en paralelo. La cuantizacion se genero con imatrix y se realizo en Unsloth Studio. La model card menciona vectorizacion lineal compatible con CPU para evitar bloqueos de busqueda en AVX2, orientada a inferencia total o parcial en RAM de sistema.

## Capacidades

- Generacion de texto conversacional multi-turno, con pipeline `text-generation`.
- Razonamiento y matematicas de contexto profundo, hasta 256K tokens segun el autor.
- Generacion de codigo, con proteccion especifica de la cabeza de salida para evitar corrupcion de sintaxis y delimitadores.
- Decodificacion especulativa nativa via MTP, que acelera la generacion en llama.cpp.
- Soporte multilingue declarado para 13 idiomas: ingles, chino, espanol, frances, aleman, portugues, italiano, ruso, japones, coreano, vietnamita, tailandes y arabe.
- Inferencia total o parcial en RAM de sistema, con offload de la KV cache a VRAM.
- Compatibilidad con endpoints (`endpoints_compatible`) y con el ecosistema llama.cpp.
- No se documentan capacidades de vision, audio, tool calling ni uso agentico en la informacion disponible.

## Casos de uso

- Despliegue en estaciones de trabajo sin GPU de gama alta: al pesar unos 13,56 GiB, el modelo puede residir mayoritariamente en DDR4/DDR5 y generar entre 20 y 45 tok/s, lo que permite montar un asistente local de 35B en equipos sin A100 ni H100.
- Analisis de documentos largos: con contexto de hasta 256K tokens, es adecuado para resumir contratos, informes tecnicos o expedientes completos en una sola pasada, colocando la KV cache en VRAM y los pesos en RAM.
- Asistencia de programacion en local: la cabeza de salida en Q6_K reduce la corrupcion de sintaxis, lo que lo hace util para autocompletado y generacion de funciones en entornos sin conexion.
- Razonamiento matematico por etapas: el perfil V1 esta pensado para contextos profundos de razonamiento, con lo que sirve para resolver problemas encadenados y verificaciones paso a paso.
- Atencion multilingue: al declarar 13 idiomas, puede emplearse en traduccion y atencion al cliente en espanol, frances, aleman, portugues, japones o arabe, entre otros.
- Prototipado e investigacion de cuantizaciones: su configuracion tensor a tensor documentada lo convierte en referencia para estudiar el impacto de F32, Q8_0 y Q6_K en modelos MoE.
- Servicio de chat con presupuesto de memoria ajustado: integrable en llama.cpp sobre portatiles con 16-24 GB de VRAM y 32 GB o mas de RAM.

## Benchmarks y rendimiento

La model card incluye una seccion de benchmark independiente de la familia APEX-I-MiniPlus (referencia Occamy V2) y una comparativa frente a cuantizaciones planas y APEX generico, pero no se han transcrito los valores numericos en la informacion disponible. El unico dato cuantitativo concreto corresponde a la variante V2.1, no a esta V1: perplejidad de 5,3735 ± 0,1214 frente a una linea base sin cuantizar de aproximadamente 5,31.

| Metrica | Este modelo (V1) | Referencia |
|---|---|---|
| Perplejidad | no disponible | Base sin cuantizar: aprox. 5,31; V2.1: 5,3735 ± 0,1214 |
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |
| Throughput en RAM | 20-45 tok/s (segun autor, depende de CPU y DDR) | no disponible |

No se han publicado resultados de benchmarks completos de esta V1 en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 13,56 GiB para los pesos en cuantizacion MiniPlus V1; a ello se suma la KV cache para contexto largo.
- El autor afirma que el contexto completo de 256K puede ejecutarse en VRAM en configuraciones de 24 GB, asignando la KV cache a GPU y los pesos a RAM.
- GPU recomendadas: no se especifican modelos concretos; la model card incluye proyecciones de throughput para RTX 30, RTX 40 y RTX 50 sin cifras transcritas.
- Cabe en GPU de consumo con 16 GB o mas si se acepta offload parcial a RAM; con 24 GB (RTX 3090, 4090) se puede mantener contexto largo en VRAM.
- Despliegue: llama.cpp como runtime principal, con soporte de MTP para decodificacion especulativa. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: 20-45 tok/s en inferencia por RAM de sistema, segun CPU y ancho de banda DDR4/DDR5. No hay cifras de latencia por token ni de throughput en GPU pura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Iris-mini APEX-I-MiniPlus V1 (este) | 35,5B | hasta 256K | GGUF custom, aprox. 13,56 GiB | Apache 2.0 | Perfil agil, router F32, salida Q6_K |
| Iris-mini APEX-I-MiniPlus V2.1 | 35,5B | hasta 256K | GGUF custom, aprox. 13,74 GiB | Apache 2.0 | Recomendada por el autor; expertos compartidos en Q5_K; PPL 5,3735 |
| APEX-I-Mini generico de la comunidad | 35,5B | no disponible | IQ2_S en expertos, Q3_K_M en salida | Apache 2.0 | Menor calidad segun el autor; riesgo de picos de perplejidad |
| AllSpark-Research/Iris-mini (base) | 35,5B | no disponible | safetensors sin cuantizar | Apache 2.0 | Referencia de calidad; PPL aprox. 5,31 |

No se dispone de comparaciones con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- El autor recomienda explicitamente la variante V2.1 frente a esta V1; la V1 se mantiene como edicion heredada por transparencia arquitectonica.
- No hay datos publicados de parametros activos, numero de expertos ni composicion del dataset de entrenamiento, lo que dificulta evaluar su comportamiento real.
- Los metadatos de Hugging Face solo declaran ingles y chino, mientras que la model card lista 13 idiomas; el soporte real del resto no esta verificado.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones de factualidad.
- La cuantizacion IQ3_XXS en los expertos nucleo introduce perdida de calidad respecto al modelo sin cuantizar (perplejidad de referencia aproximada de 5,31 en el base).
- El rendimiento depende fuertemente del ancho de banda de memoria DDR4/DDR5 y del soporte AVX2 del procesador.
- No se documentan capacidades de tool calling, uso agentico ni vision, por lo que no deben asumirse en produccion.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base AllSpark-Research/Iris-mini antes de desplegarlo.
- El repositorio tiene 316 descargas y 2 likes, con lo que la validacion por parte de la comunidad es limitada.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/IsValorum/Iris-mini-MTP-APEX-I-MiniPlus-GGUF
- Variante recomendada V2.1: https://huggingface.co/IsValorum/Iris-mini-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/AllSpark-Research/Iris-mini
- Apoyo al autor: https://ko-fi.com/isvalorum
- llama.cpp: no disponible en la informacion proporcionada
- Unsloth Studio: no disponible en la informacion proporcionada
