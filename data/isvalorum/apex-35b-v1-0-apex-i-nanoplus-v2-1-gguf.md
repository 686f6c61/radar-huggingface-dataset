# IsValorum/Apex-35B-V1.0-APEX-I-NanoPlus-V2.1-GGUF

## Resumen

Apex-35B-V1.0 APEX-I NanoPlus V2.1 es una cuantizacion GGUF del modelo Apex-35B-V1.0, desarrollado por Apex Intelligence y publicado originalmente por Apexintelligence-AI. Se trata de una distribucion de pesos comprimidos realizada por IsValorum dentro de su serie APEX Quantization, pensada para ejecucion en llama.cpp sobre hardware de consumo. El modelo base es el primer lanzamiento de Apex Intelligence y esta orientado tanto a uso general como a investigacion, combinando codigo, uso de herramientas, respuesta a preguntas y busqueda profunda en tareas de IA, ciencia computacional y simulacion robotica.

La arquitectura es un transformer hibrido con mezcla de expertos (MoE) de 40 capas, de las cuales 30 son de atencion lineal/SSM y 10 de atencion completa cuadratica. Cuenta con 256 expertos enrutados mas 1 compartido, con 8 activos por token, una dimension oculta de 2048 y una ventana de contexto de 262.144 tokens. El total de parametros del modelo base asciende a 35.505.251.456 (aproximadamente 35,5 mil millones), y el repositorio cuantizado ocupa 13,0 GB.

La relevancia de esta ficha radica en que la cuantizacion emplea una estrategia quirurgica por tensor, con proteccion en F32 de los componentes sensibles (normalizaciones, routers de expertos y escalas recurrentes del SSM) y compresion agresiva (IQ2_XXS, IQ2_S, IQ3_XXS, Q3_K) unicamente en los expertos enrutados de los extremos y del nucleo. Esto permite ejecutar un modelo MoE multimodal de 35B con contexto muy largo en equipos de gama alta de consumo, algo que el modelo en BF16 no permite.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE con atencion lineal/SSM y atencion completa periodica (40 capas: 30 lineal/SSM + 10 full-attention) |
| Parametros totales | 35.505.251.456 (aprox. 35,5B) |
| Parametros activos | 8 expertos enrutados de 256 + 1 compartido por token (parametros activos exactos: no disponible) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Mezcla por tensor: F32, Q8_0, Q6_K, Q4_K, Q4_0, Q3_K, IQ3_XXS, IQ2_S, IQ2_XXS |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura hibrida que intercala 30 capas de atencion lineal basada en SSM con 10 capas de atencion completa cuadratica, distribuidas periodicamente (bloques 3, 7, 11 y sucesivos) como anclas de recuperacion profunda. La capa MoE contiene 256 expertos enrutados mas uno compartido, con 8 expertos activos por token, dimension oculta de 2048 y FF de experto de 512. Dispone de un vocabulario de 248.320 tokens y de un bloque MTP (multi-token prediction) adicional en la capa 40 con 20 tensores, que actua como cabecera companera para decodificacion especulativa. El GGUF compilado contiene 753 tensores en total.

La cuantizacion se ha calculado con una matriz de importancia (imatrix) publica de bartowski, verificada por SHA256 antes de su uso. La estrategia de IsValorum protege en F32 las 138 normalizaciones, los 82 routers de expertos, las 120 escalas recurrentes del SSM (`ssm_alpha`, `ssm_a`, `ssm_conv1d`, `ssm_dt`) y las compuertas de atencion en Q8_0, mientras que los expertos enrutados se comprimen en bandas: los de las capas 0-9 y 30-39 en Q3_K, IQ2_S, IQ2_XXS e IQ3_XXS, y los de las capas 10-29 en IQ2_S, IQ2_XXS e IQ3_XXS. La cabeza de salida se mantiene en Q6_K y los embeddings en Q4_K. Los detalles de entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de contexto de 262.144 tokens.
- Razonamiento y respuesta a preguntas, orientado a tareas de investigacion en IA, ciencia computacional y simulacion robotica.
- Generacion y asistencia de codigo, con soporte declarado para el harness Claude Code (v2.1.280 preferido).
- Uso de herramientas (tool calling / function calling) y flujos de agente multi-paso.
- Busqueda profunda (deep search) sobre contextos largos.
- Capacidades multimodales de imagen a texto (pipeline image-text-to-text), si bien el proyector de vision no se incluye en este repositorio.
- Decodificacion especulativa mediante el bloque MTP de la capa 40.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistencia de codigo en produccion: el modelo declara compatibilidad con el harness Claude Code y soporte de tool calling, por lo que puede integrarse en flujos de edicion y refactorizacion asistida, con la ventaja de ejecutarse localmente en llama.cpp.
- Agentes de investigacion automatizada: con 262.144 tokens de contexto puede mantener en memoria articulos, trazas de experimentos y documentacion tecnica de forma simultanea, lo que resulta adecuado para tareas de sintesis en IA y ciencia computacional.
- Busqueda profunda sobre corpus extensos: la combinacion de 10 capas de atencion completa como anclas de recuperacion y 30 capas SSM permite recorrer documentos largos con coste lineal en la mayoria de capas.
- Analisis de simulaciones roboticas: el modelo base esta orientado explicitamente a simulacion robotica, por lo que puede procesar logs, descripciones de escenarios y resultados de simulacion en una unica ventana.
- Despliegue en estaciones de trabajo con GPU de consumo: al ocupar 13,0 GB en NanoPlus, cabe en GPUs de 16 GB o superiores y permite inferencia local sin dependencia de API.
- Prototipado de asistentes multimodales: aunque este repositorio solo incluye los pesos de texto, el modelo base admite entrada de imagen a texto; anadiendo el proyector `mmproj` correspondiente se pueden construir asistentes que razonen sobre capturas o diagramas.
- Evaluacion e investigacion de tecnicas de cuantizacion: la ficha de tensores auditada y el mapa por capas lo convierten en un caso de estudio util para medir el impacto de la compresion selectiva en modelos MoE hibridos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 13,0 GB para el fichero NanoPlus (12,13 GiB), mas overhead de contexto KV cache; el tier MiniPlus ocupa 15,23 GB (14,18 GiB).
- GPU recomendadas: no disponibles de forma explicita; por tamano, encaja en GPUs de 16 GB o mas (RTX 4080, RTX 4090, RTX 5080, A100 40 GB, H100).
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas de VRAM para el tier NanoPlus; en 12 GB requeriria offload parcial a CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama y otros runners compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Apex-35B-V1.0 APEX-I NanoPlus V2.1 (este) | 35,5B totales, MoE 8+1 activos | 262.144 | GGUF mixto (F32 a IQ2_XXS) | Apache-2.0 | Hugging Face, 13,0 GB |
| Apex-35B-V1.0 APEX-I MiniPlus V2.1 | 35,5B totales, MoE 8+1 activos | 262.144 | GGUF mixto, mayor precision | Apache-2.0 | Hugging Face, 15,23 GB |
| Qwen3.8-35B-A3B-Distill APEX-I MiniPlus V2.1 | no disponible | no disponible | GGUF mixto | Apache-2.0 | Hugging Face, 13,0 GB |

La comparativa con modelos de otros desarrolladores (por ejemplo, alternativas MoE de 30-40B con contexto largo) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio contiene unicamente los pesos de texto en GGUF; el proyector de vision (`mmproj-Apexintelligence-AI_Apex-35B-V1.0-bf16.gguf`) no esta incluido, por lo que las capacidades de imagen a texto requieren descargarlo por separado.
- La cuantizacion agresiva de los expertos enrutados (IQ2_XXS, IQ2_S, IQ3_XXS) puede degradar la calidad en tareas que dependan de expertos poco frecuentes; no se han publicado evaluaciones comparativas frente al modelo en BF16.
- El bloque MTP de la capa 40 esta cuantizado de forma heterogenea (Q4_0 en expertos enrutados), lo que puede afectar a la calidad de la decodificacion especulativa.
- No hay informacion sobre sesgos, riesgo de alucinacion ni evaluaciones de seguridad del modelo base.
- Los idiomas soportados no estan declarados; no se puede garantizar un rendimiento uniforme fuera del ingles.
- El modelo base es el primer lanzamiento del desarrollador y el repositorio cuantizado registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion comunitaria es practicamente inexistente.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los terminos del modelo base y del proyector de vision por separado.
- El contexto de 262.144 tokens requiere una KV cache considerable; en GPUs de 16 GB habra que limitar la longitud efectiva o usar offload.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Apex-35B-V1.0-APEX-I-NanoPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0
- Repositorio GitHub: https://github.com/apexin-ai/Apex-35B-V1.0
- Tier MiniPlus: https://huggingface.co/IsValorum/Apex-35B-V1.0-APEX-I-MiniPlus-V2.1-GGUF
- Referencia BF16 GGUF: https://huggingface.co/prithivMLmods/Apex-35B-V1.0-MXFP4-MoE-GGUF
- Imatrix de bartowski: https://huggingface.co/bartowski/Apexintelligence-AI_Apex-35B-V1.0-GGUF
- Apoyo al autor: https://ko-fi.com/isvalorum
