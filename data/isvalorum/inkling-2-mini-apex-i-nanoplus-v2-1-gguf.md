# IsValorum/Inkling-2-Mini-APEX-I-NanoPlus-V2.1-GGUF

## Resumen
Inkling-2-Mini-APEX-I-NanoPlus-V2.1-GGUF es una cuantizacion GGUF del modelo base `thinkingmachines/Inkling-2-Mini`, publicada por el usuario IsValorum dentro de su serie "APEX Quantization". No se trata de un modelo entrenado desde cero, sino de una conversion a formato llama.cpp con una asignacion quirurgica de precisiones por tensor (mezcla de Q4_K, Q6_K, Q8_0 y F32) orientada a preservar las partes sensibles de la arquitectura `inkling2_loop` mientras se reduce el peso total a unos 11 GB en el repositorio.

El modelo base emplea una arquitectura de tipo Mixture of Experts (MoE) con mecanica recurrente o en bucle (`inkling2_loop`), segun los metadatos del autor, y esta marcado como `image-text-to-text`, lo que implica capacidades multimodales de entrada imagen y texto. El dato de parametros totales reportado en safetensors es de 26.070.385.152 (aproximadamente 26,07 mil millones), aunque no se dispone de informacion sobre parametros activos por token ni sobre la longitud de contexto.

La relevancia de esta publicacion es practica: permite ejecutar un modelo multimodal de ~26 B en hardware de consumo mediante llama.cpp, con un esquema de cuantizacion documentado tensor a tensor y protegido en F32 en las proyecciones de atencion mas delicadas. Sin embargo, el repositorio no incluye resultados de benchmarks, no declara idiomas soportados y no aporta detalles sobre el entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (MoE, segun tags del autor) |
| Parametros totales | 26.070.385.152 (~26,07 B, dato safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF mixto: Q4_K, Q6_K, Q8_0 y F32 por tensor (esquema APEX-I) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); fuente de cuantizacion en BF16 |
| Tamano del repositorio | 11,0 GB |
| Huella declarada (NanoPlus) | 10,23 GiB |
| Modelo base | `thinkingmachines/Inkling-2-Mini` |
| Precisión de origen | BF16 |
| iMatrix | `imatrix.gguf` (procedencia externa no inferida) |
| Tensores recurrentes protegidos | F32 (58 tensores observados) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento
La arquitectura declarada es `inkling2_loop`, etiquetada como MoE en los tags del repositorio. El nombre sugiere un transformer con mecanismo recurrente o de reutilizacion de bloques, aunque la model card no documenta el numero de capas, el numero de expertos, el enrutador ni la dimension oculta. Tampoco se detalla la composicion del dataset de entrenamiento, el volumen de tokens, ni si el modelo base paso por fases de RLHF, DPO o ajuste por preferencias. Toda esa informacion relativa al modelo original queda fuera del alcance de este repositorio, que es exclusivamente una cuantizacion.

La innovacion tecnica documentada reside en el esquema de cuantizacion APEX-I. El autor audita el GGUF fisico y asigna precisiones por grupo de tensores: `token_embd.weight` en Q4_K, `output.weight` en Q6_K, `output_res_query.weight` en F32, las proyecciones de atencion (`attn_q`, `attn_k`, `attn_output`, `attn_rel`) mayoritariamente en Q4_K con algunas capas en Q6_K, y todas las convoluciones y clips de atencion (`attn_k_conv`, `attn_post_conv`, `attn_q_clip`, `attn_rel_bias`, `attn_rel_clip`) en F32. Las puertas de atencion (`attn_gate`) se mantienen en Q8_0. Ademas, se conservan 58 tensores recurrentes en F32 para evitar degradacion en la mecanica de bucle del modelo. Se empleo un fichero `imatrix.gguf` como matriz de importancia durante la cuantizacion, aunque el autor no infiere su procedencia externa.

## Capacidades
- Generacion de texto conversacional en formato multi-turno, segun el tag `conversational`.
- Procesamiento de entrada multimodal imagen-texto (`image-text-to-text`), lo que habilita tareas de descripcion de imagenes, VQA y razonamiento sobre capturas.
- Razonamiento y generacion de codigo: no hay evaluacion publicada en el repositorio, pero la categoria del modelo base y el pipeline lo permiten.
- Soporte de tool calling y function calling: no confirmado explicitamente en la model card; el ecosistema llama.cpp lo soporta si la plantilla del modelo lo declara.
- Capacidades de agente multi-paso: el autor promociona su cliente V-Agent con siete servidores MCP, lo que sugiere compatibilidad con flujos de agente, aunque no se documenta el soporte nativo en el modelo.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Modo thinking o razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso
- Analisis de documentos escaneados y capturas: al ser `image-text-to-text`, el modelo puede recibir una imagen y devolver texto estructurado (extraccion de campos, resumen de una factura o de una pantalla de error), ejecutandose localmente en llama.cpp con ~10,23 GiB de pesos.
- Asistente de escritorio con herramientas: integrado en V-Agent, el modelo puede encadenar busquedas web (DuckDuckGo), lectura de paginas, ejecucion de comandos y gestion de ficheros a traves de los siete servidores MCP que ofrece el cliente del autor.
- Generacion de codigo en local para entornos con requisitos de privacidad: al no requerir telemetria ni cuenta en V-Agent, encaja en estaciones de trabajo de desarrollo donde el codigo no puede salir de la maquina; el esquema Q4_K/Q8_0 en proyecciones de atencion busca preservar calidad en tareas sensibles a la precision.
- Prototipado de agentes multimodales: util para investigadores que necesitan un modelo de ~26 B con vision y mecanica recurrente para experimentar con planificacion multi-paso sin depender de APIs externas.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye un mapa tensor a tensor (`tensor-map.tsv`) que permite reproducir el esquema APEX-I y medir el impacto de mantener ciertas capas en F32 frente a cuantizarlas.
- Despliegue en estaciones con GPU de consumo: con 10,23 GiB de pesos, cabe en tarjetas de 12 GB o 16 GB y permite inferencia local de un modelo multimodal de 26 B alli donde un BF16 (~52 GB) seria inviable.
- Fine-tuning ligero o adaptacion con LoRA sobre la version cuantizada no es posible directamente en GGUF; el caso de uso realista es la inferencia y el serving, no el reentrenamiento.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni comparaciones con el modelo base en BF16, por lo que no es posible cuantificar la perdida de calidad introducida por la cuantizacion APEX-I.

## Requisitos de hardware
- VRAM estimada para inferencia: los pesos suman 10,23 GiB; con cache KV y overhead de llama.cpp, el consumo realista se situa en torno a 12-14 GB para contextos moderados.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB), RTX 3090 (24 GB), A100 40/80 GB y H100 para serving de alta concurrencia.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB), con posible offload parcial a CPU si el contexto es largo.
- Opciones de despliegue: llama.cpp (CUDA, Vulkan, CPU), V-Agent (cliente del autor con motores llama.cpp, Strata/PolyStrata, Strata Rust y Project Maya), y cualquier frontend compatible con GGUF (Ollama, LM Studio, Unsloth Studio) siempre que soporte la arquitectura `inkling2_loop` y el pipeline multimodal.
- Latencia y throughput: no disponibles; no se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini APEX-I NanoPlus V2.1 | ~26,07 B (MoE) | no disponible | imagen-texto | Apache 2.0 | GGUF (~10,23 GiB) |
| Inkling-2-Mini APEX-I MiniPlus V2.1 | ~26,07 B (MoE) | no disponible | imagen-texto | Apache 2.0 | GGUF (12,09 GiB) |
| thinkingmachines/Inkling-2-Mini (base) | ~26,07 B (MoE) | no disponible | imagen-texto | Apache 2.0 | safetensors BF16 |
| Alternativas de ~26 B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada por el autor es con la variante MiniPlus de la misma familia, que ocupa 12,09 GiB frente a los 10,23 GiB de NanoPlus. No se aportan datos de rendimiento que permitan comparar con modelos de otros desarrolladores.

## Limitaciones y advertencias
- No se han publicado benchmarks: se desconoce la degradacion real frente al modelo base en BF16 y frente a otras cuantizaciones (Q4_K_M, Q5_K_M, Q8_0 estandar).
- La model card no documenta sesgos conocidos, tasas de alucinacion ni comportamiento en dominios especializados; se heredan los del modelo base, que no se detallan.
- Idiomas soportados no declarados: no se puede garantizar calidad en castellano ni en otros idiomas distintos del ingles sin evaluacion previa.
- Longitud de contexto no disponible: impide planificar casos de uso con documentos largos o conversaciones extensas.
- El esquema APEX-I es una cuantizacion mixta no estandar; algunos tensores en F32 aumentan el peso respecto a una cuantizacion Q4_K_M convencional, y la compatibilidad con versiones antiguas de llama.cpp no esta garantizada.
- El autor no verifica la procedencia del `imatrix.gguf` utilizado; la calidad de la matriz de importancia afecta directamente a la fidelidad de la cuantizacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, sin validacion comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero al ser una cuantizacion conviene revisar tambien la licencia y los terminos del modelo base `thinkingmachines/Inkling-2-Mini`.
- La promocion de V-Agent y del enlace Ko-fi en la model card no constituye una garantia tecnica; el cliente es un proyecto independiente del autor de la cuantizacion.
- No se documenta soporte explicito de tool calling ni de modo thinking; cualquier uso en agentes requiere validacion empirica de la plantilla de chat.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/IsValorum/Inkling-2-Mini-APEX-I-NanoPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Variante MiniPlus: https://huggingface.co/IsValorum/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-GGUF
- Mapa tensor a tensor: https://huggingface.co/IsValorum/Inkling-2-Mini-APEX-I-NanoPlus-V2.1-GGUF/blob/main/tensor-map.tsv
- Cliente V-Agent (releases): https://github.com/IsValorum/V-Agent/releases/latest
- Repositorio V-Agent: https://github.com/IsValorum/V-Agent
- Arquitectura de V-Agent: https://github.com/IsValorum/V-Agent/blob/main/docs/ARCHITECTURE.md
- Licencia de V-Agent: https://github.com/IsValorum/V-Agent/blob/main/LICENSE
- Apoyo al autor: https://ko-fi.com/isvalorum
