# bartowski/WeMM-Ecom-0.8B-GGUF

## Resumen

WeMM-Ecom-0.8B es un modelo de vision-lenguaje (VLM) ligero construido sobre Qwen3.5-0.8B por WeChat Vision (Tencent), disenado especificamente para la comprension de imagenes de producto y texto en contextos de comercio electronico. El modelo acepta entradas multimodales (texto e imagen) y genera respuestas conversacionales, con un modo de razonamiento opcional (thinking) antes de la respuesta final. La version aqui descrita es una cuantizacion GGUF realizada por bartowski usando llama.cpp (release b12600) con calibracion imatrix, orientada a despliegue en hardware modesto.

El checkpoint original declara 1B de parametros, mientras que los pesos en safetensors del repositorio cuantizado suman 752.393.024 parametros (~0,75B). El modelo esta pensado para tareas de e-commerce: descripcion de productos, atencion al cliente multimodal y analisis de imagenes de catalogo. Su interes practico radica en que combina capacidades multimodales con un tamano muy reducido, permitiendo inferencia local en GPU de consumo e incluso en CPU.

La cuantizacion incluye desde bf16 (1,52 GB) hasta IQ4_XS (0,46 GB), con soporte de tool calling mediante un formato XML especifico y prompt con etiquetas `<|im_start|>`/`<|im_end|>` heredadas de la familia Qwen. La licencia Apache 2.0 facilita uso comercial, aunque el modelo solo declara soporte para chino (zh) e ingles (en).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) basado en Qwen3.5-0.8B |
| Parametros totales | 752.393.024 (safetensors del repo cuantizado); la model card declara 1B en el checkpoint original |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_1, Q4_K_L, Q4_0, Q4_K_M, IQ4_NL, Q4_K_S, IQ4_XS |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-0.8B, un transformer denso de la familia Qwen, adaptado a modalidad visual mediante un proyector multimodal (mmproj) que permite procesar imagenes junto con texto. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO; estos datos figuran como no disponibles. El tag `qwen3_5` y la pipeline `image-text-to-text` confirman la naturaleza vision-lenguaje.

La cuantizacion GGUF se realizo con llama.cpp b12600 aplicando calibracion imatrix, lo que mejora la preservacion de pesos sensibles en cuantizaciones de 4 bits. El modelo soporta un modo de razonamiento opcional mediante bloques `<think>...</think>`, y la decodificacion especulativa no esta habilitada segun la model card. El formato de prompt sigue la convencion de chat de Qwen con roles de sistema, usuario y asistente.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Comprension de imagenes de producto (image-text-to-text) mediante el fichero mmproj.
- Razonamiento opcional en modo thinking antes de la respuesta final.
- Tool calling / function calling con formato XML estructurado (`<tool_call>`, `<function=...>`, `<parameter=...>`).
- Capacidades multilingues limitadas a chino e ingles.
- Descripcion y analisis de productos en contexto de e-commerce.
- Integracion con endpoints compatibles (tag `endpoints_compatible`).

## Casos de uso

- Descripcion automatica de productos: el modelo puede recibir una imagen de producto y generar texto descriptivo para fichas de catalogo, aprovechando su entrenamiento especifico en e-commerce.
- Atencion al cliente multimodal: gestion de consultas donde el usuario envia una foto del producto y pregunta sobre caracteristicas, con respuestas conversacionales multi-turno.
- Moderacion y clasificacion de imagenes de catalogo: verificacion de que las imagenes corresponden a la categoria declarada del producto.
- Extraccion de atributos de producto: identificacion de color, material o tipo a partir de imagenes para poblar bases de datos de inventario.
- Asistente de compras integrado: combinacion de tool calling con busquedas de stock o precios mediante funciones externas definidas en el system prompt.
- Despliegue en edge o entornos con recursos limitados: al ocupar 0,50 GB en Q4_K_M, puede ejecutarse en dispositivos con poca VRAM o en CPU para servicios de bajo coste.
- Prototipado rapido de pipelines VLM: su tamano reducido permite iterar sobre prompts y formatos de salida sin coste elevado de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en Q4_K_M (0,50 GB de pesos) mas overhead de contexto y del proyector multimodal (mmproj); en bf16, unos 1,5 GB de pesos.
- GPU recomendadas: cualquier GPU de consumo moderna con 4 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien A100/H100 para despliegues a gran escala, aunque el modelo esta sobredimensionado para estas GPUs.
- Cabe en GPU de consumo: si, en practicamente todas las GPU con 4 GB o mas; tambien en Apple Silicon y en CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio y servidores compatibles con endpoints; vLLM y TGI requeririan los pesos safetensors del modelo base, no los GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WeMM-Ecom-0.8B (este) | ~0,75B (1B declarado) | no disponible | Apache 2.0 | GGUF / safetensors | Especifico de e-commerce, multimodal, zh/en |
| Qwen3.5-0.8B (base) | ~0,8B | no disponible | Apache 2.0 (segun familia Qwen) | safetensors | Solo texto, sin vision |
| Alternativas VLM pequenas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Solo soporta chino e ingles; no hay soporte declarado para castellano, lo que limita su uso directo en mercados hispanohablantes.
- Es un modelo especializado en e-commerce; su rendimiento fuera de ese dominio probablemente es limitado.
- Riesgo de alucinacion en descripciones de producto e identificacion de atributos visuales, especialmente con imagenes de baja calidad.
- La model card no documenta sesgos conocidos ni composicion del dataset de entrenamiento, lo que dificulta evaluar riesgos eticos.
- La longitud de contexto no esta documentada; no se recomienda asumir ventanas largas sin verificacion.
- El modo thinking puede incrementar la latencia y el consumo de tokens; conviene deshabilitarlo en produccion de alta concurrencia.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base es de Tencent y conviene revisar los terminos del checkpoint original.
- El repositorio cuantizado registra 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.
- El tool calling depende de un formato XML estricto; integraciones que no respeten las etiquetas pueden fallar silenciosamente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/WeMM-Ecom-0.8B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Licencia del modelo base: https://huggingface.co/tencent/WeMM-Ecom-0.8B/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp/
- Release de llama.cpp usado: https://github.com/ggml-org/llama.cpp/releases/tag/b12600
