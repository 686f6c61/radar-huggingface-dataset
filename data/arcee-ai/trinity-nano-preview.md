# arcee-ai/Trinity-Nano-Preview

## Resumen

Trinity-Nano-Preview es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Arcee AI, presentado como la variante pequena de su familia Trinity de pesos abiertos. Cuenta con aproximadamente 6.120 millones de parametros totales, de los cuales solo unos 1.000 millones estan activos por token (800 millones sin contar embeddings), lo que lo situa en la frontera de la dispersion extrema para modelos de este tamano.

El modelo se entrena sobre 10 billones de tokens, un corpus curado en colaboracion con Datology AI que amplia el dataset usado previamente en AFM-4.5B con contenido adicional de matematicas y codigo. El entrenamiento se ejecuto en un cluster de 512 GPU H200 mediante paralelismo HSDP, con soporte de Prime Intellect. La ventana de contexto alcanza los 128.000 tokens y cubre once idiomas.

Esta version es una *preview* experimental: el propio autor advierte que, al llevar la dispersion al limite en un modelo pequeno, puede resultar inestable en determinados casos de uso. No se aloja en ningun servicio gestionado, por lo que su evaluacion requiere descarga y despliegue local. Resulta relevante para quienes buscan un modelo MoE ligero, con contexto largo y licencia permisiva, que pueda ejecutarse en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AfmoeForCausalLM (transformer MoE) |
| Parametros totales | 6.120.003.328 |
| Parametros activos | ~1B (800M sin embeddings) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | GGUF (q4_k_m disponible), BF16 sin cuantizar |
| Idiomas soportados | en, es, fr, de, it, pt, ru, ar, hi, ko, zh |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors, GGUF |

Otros datos: 128 expertos totales, 8 activos y 1 compartido; modelo base arcee-ai/Trinity-Nano-Base; tamano del repositorio 12,3 GB; libreria transformers (requiere 4.57.1 y `trust_remote_code=True`).

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con capas de mezcla de expertos (MoE) bajo la implementacion `AfmoeForCausalLM`. Cada token activa 8 de los 128 expertos mas un experto compartido, lo que da lugar a una relacion de dispersion muy agresiva para su tamano. El contexto maximo es de 128.000 tokens. Para inferencia sin cuantizar en BF16, el autor especifica que los pesos de normalizacion y del router deben mantenerse en BF16, mientras que los sesgos de correccion de expertos (`expert_bias`) deben conservarse en FP32 durante la carga.

El entrenamiento se realizo sobre 10 billones de tokens, con un dataset curado en alianza con Datology AI que parte del corpus de AFM-4.5B y anade datos de matematicas y codigo. La infraestructura consistio en 512 GPU H200 con paralelismo HSDP, proporcionada por Prime Intellect. Se trata de un modelo ajustado para chat (*chat tuned*). El autor no detalla en la informacion disponible si se aplicaron tecnicas de RLHF o DPO, ni otras innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional con un estilo de personalidad definido por el autor.
- Razonamiento y respuesta a instrucciones en formato chat mediante plantilla de conversacion.
- Soporte de tool calling / function calling, con parser `hermes` disponible en vLLM.
- Soporte de modo de razonamiento (*reasoning*) con parser `deepseek_r1` en vLLM.
- Capacidades multilingues en once idiomas: ingles, espanol, frances, aleman, italiano, portugues, ruso, arabe, hindi, coreano y chino.
- Manejo de contexto largo de hasta 128.000 tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Compatible con endpoints (`endpoints_compatible`) y con flujos de agentes gracias a la combinacion de tool calling y razonamiento multi-paso.

## Casos de uso

- Atencion al cliente automatizada: con 128.000 tokens de contexto puede mantener conversaciones multi-turno largas y recordar el historial completo de la sesion, ademas de invocar herramientas de consulta de pedidos o estado de cuenta mediante function calling.
- Asistente de documentacion tecnica: el contexto largo permite introducir manuales o bases de conocimiento extensas y responder preguntas con referencia al texto, en cualquiera de los once idiomas soportados.
- Generacion de codigo en pipelines de CI/CD: el soporte de tool calling y su integracion en vLLM permiten conectarlo a herramientas de analisis estatico o de ejecucion de tests dentro de flujos automatizados.
- Agentes multi-paso: la combinacion de razonamiento y llamada a funciones lo hace apto para orquestar tareas que requieren descomposicion en pasos y uso de APIs externas.
- Procesamiento de documentos multilingues: resumen, extraccion y traduccion de contenido en arabe, hindi, coreano o chino junto a lenguas europeas, con una sola instancia del modelo.
- Despliegue en estaciones de trabajo o portatiles: al ser un MoE de 6B con solo 1B activo, las versiones GGUF q4_k_m permiten ejecucion local en hardware de consumo para prototipado y pruebas.
- Clasificacion y enrutamiento de tickets: su bajo coste de inferencia por token activo lo hace viable para procesar volumenes altos de mensajes cortos con categorizacion y respuesta inicial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 12-13 GB para los pesos (coincide con el tamano del repositorio de 12,3 GB), mas overhead de KV cache que crece con el contexto; con 128k tokens el consumo adicional puede ser considerable.
- Cuantizacion GGUF q4_k_m: reduce el peso a un rango aproximado de 3,5-4 GB, permitiendo ejecucion en GPU de consumo con 8 GB o mas.
- GPU recomendadas para BF16: A100, H100 o H200 para produccion con contexto largo; RTX 4090 (24 GB) suficiente para BF16 con contextos moderados.
- Cabe en GPU de consumo: si, en formato GGUF cuantizado (por ejemplo RTX 3060 de 12 GB, RTX 4070, RTX 4090) y en LM Studio.
- Opciones de despliegue: transformers 4.57.1 con `trust_remote_code=True`, vLLM >= 0.11.1, llama.cpp (release b7061 o posterior) y LM Studio con runtime actualizado.
- Latencia y throughput: no disponibles en la informacion proporcionada; al activar solo 1B de parametros por token, se espera un coste de computo por token bajo en relacion con los 6B totales, aunque no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Trinity-Nano-Preview | 6,12B | ~1B | 128k | OpenMDW-1.1 | MoE 128 expertos, preview experimental |
| AFM-4.5B (Arcee AI) | 4,5B | denso | no disponible | no disponible | Predecesor en dataset, mismo autor |
| Alternativas MoE ligeras del mismo rango | no disponible | no disponible | no disponible | no disponible | Sin datos verificables en la informacion |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de terceros en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Version *preview* experimental: el autor advierte explicitamente de posible inestabilidad en ciertos casos de uso debido a la dispersion extrema (800M parametros no-embedding activos por token).
- No se aloja en ningun servicio gestionado; requiere descarga y despliegue propio.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones de fiabilidad en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia OpenMDW-1.1: aunque es de pesos abiertos, conviene revisar el texto completo de la licencia antes de uso comercial, ya que no es una licencia OSI estandar.
- Requiere `trust_remote_code=True` y una version concreta de transformers (4.57.1), lo que anade complejidad de mantenimiento en produccion.
- El contexto de 128k implica un consumo elevado de memoria KV; en hardware de consumo habra que limitar la longitud efectiva.
- El rendimiento en idiomas distintos del ingles no esta cuantificado en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arcee-ai/Trinity-Nano-Preview
- Modelo base: https://huggingface.co/arcee-ai/Trinity-Nano-Base
- Version GGUF: https://huggingface.co/arcee-ai/Trinity-Nano-Preview-GGUF
- Blog de Arcee AI (Trinity Manifesto): https://www.arcee.ai/blog/the-trinity-manifesto
- AFM-4.5B (modelo previo): https://huggingface.co/arcee-ai/AFM-4.5B
- Datology AI: https://www.datologyai.com/
- Prime Intellect: https://www.primeintellect.ai/
- Licencia OpenMDW-1.1: https://huggingface.co/arcee-ai/Trinity-Mini#license
- llama.cpp releases: https://github.com/ggml-org/llama.cpp/releases
