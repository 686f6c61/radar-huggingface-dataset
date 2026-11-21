# IsValorum/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Inkling-2-Mini-APEX-I-MiniPlus-V2.1-GGUF es una cuantizacion GGUF del modelo base `thinkingmachines/Inkling-2-Mini`, publicada por el usuario IsValorum dentro de su serie de cuantizaciones APEX. El modelo original es un transformer multimodal de tipo image-text-to-text con arquitectura interna denominada `inkling2_loop` y estructura MoE (mixture of experts), segun las etiquetas del repositorio. El artefacto pesa 13,0 GB y contiene 26.070.385.152 parametros totales segun los safetensors del modelo base.

La relevancia de esta ficha no esta en el modelo original, sino en el trabajo de cuantizacion: IsValorum aplica una cuantizacion quirurgica por tensor, asignando precisiones distintas (Q4_K, Q6_K, Q8_0, F32) a cada grupo de tensores segun su funcion en la red, con el objetivo de preservar la calidad en las capas mas sensibles (protecciones recurrentes en F32, gates de atencion en Q8_0) mientras se comprime agresivamente el resto. El resultado es un GGUF de 12,09 GiB pensado para ejecutarse en llama.cpp y en el agente de escritorio V-Agent del mismo autor.

El modelo esta publicado bajo licencia Apache 2.0, es compatible con endpoints y esta orientado a conversacion. No se dispone de informacion publica sobre idiomas soportados, datos de entrenamiento del modelo base ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (transformer MoE, multimodal image-text-to-text) |
| Parametros totales | 26.070.385.152 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion mixta por tensor: Q4_K, Q6_K, Q8_0 y F32 (iMatrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Precision de origen | BF16 |
| Tamano del repositorio | 13,0 GB (archivo principal: 12,09 GiB) |
| Tensor de salida (`output.weight`) | Q6_K |
| Embeddings (`token_embd.weight`) | Q4_K |
| Gates de atencion (`attn_gate`) | Q8_0 (24 tensores) |
| Protecciones recurrentes | F32 (58 tensores observados) |

## Arquitectura y entrenamiento

El modelo base `thinkingmachines/Inkling-2-Mini` emplea una arquitectura propietaria etiquetada como `inkling2_loop`, con estructura MoE y capacidad multimodal de entrada imagen-texto. El mapa de tensores auditado del GGUF revela 24 bloques (`blk.0` a `blk.23`), cada uno con proyecciones de atencion (`attn_q`, `attn_k`, `attn_output`), gates de atencion (`attn_gate`), convoluciones de atencion (`attn_k_conv`, `attn_post_conv`) y componentes de atencion relativa (`attn_rel`, `attn_rel_bias`, `attn_rel_clip`). La presencia de tensores `attn_res_query` y `output_res_query` sugiere un mecanismo de atencion residual o de consulta sobre estados recurrentes, coherente con la etiqueta `inkling2_loop`.

La cuantizacion APEX-I MiniPlus aplica una politica de precision diferenciada: los tensores de normalizacion y las protecciones recurrentes se mantienen en F32 (58 tensores), los gates de atencion y algunas proyecciones de salida en Q8_0, el tensor de salida global en Q6_K y el grueso de proyecciones de atencion y embeddings en Q4_K. Se utiliza una iMatrix (`imatrix.gguf`) para guiar la cuantizacion, aunque el autor indica que no infiere la procedencia externa del fichero. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base recibio RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` y el pipeline `image-text-to-text`.
- Procesamiento de entrada multimodal imagen-texto (pipeline declarado `image-text-to-text`).
- Estructura MoE, lo que implica activacion dispersa de expertos (numero de expertos y parametros activos no disponibles).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estandar.
- Ejecucion en llama.cpp en backends CUDA, Vulkan y CPU, segun la documentacion de V-Agent.
- Integracion en flujos de agente con tool calling a traves de V-Agent y sus siete servidores MCP (ficheros, comandos, busqueda web, navegador autonomo, herramientas de escritorio, descargas HTTP y Hugging Face).
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo Windows: el GGUF de 12,09 GiB permite ejecutar el modelo en llama.cpp con backend CUDA o Vulkan desde V-Agent, sin necesidad de conexion a APIs externas ni cuenta de usuario.
- Agente de escritorio con herramientas reales: a traves de los siete servidores MCP de V-Agent, el modelo puede leer y escribir ficheros, ejecutar comandos, buscar en DuckDuckGo, navegar de forma autonoma y descargar recursos, con aprobaciones por accion y espacios de trabajo aislados.
- Asistencia conversacional con contexto de documentos: la ventana multimodal image-text-to-text permite adjuntar imagenes o capturas junto a texto en conversaciones multi-turno, util para soporte tecnico sobre interfaces graficas.
- Automatizacion de tareas de desarrollo en local: el modelo puede integrarse en pipelines de revision de codigo o generacion de parches ejecutados en la propia maquina, manteniendo el codigo fuera de servicios remotos.
- Prototipado de agentes con busqueda web: combinando el servidor MCP de busqueda y el de lectura de paginas, el modelo puede construir respuestas aumentadas con informacion actual sin salir del entorno local.
- Evaluacion de cuantizaciones: el mapa por tensor auditado y el fichero `tensor-map.tsv` permiten a investigadores comparar el impacto de precisiones mixtas (Q4_K frente a Q8_0 y F32) en tareas concretas sobre el mismo modelo base.
- Inferencia en entornos con requisitos de privacidad: al ejecutarse localmente sin telemetria obligatoria, encaja en escenarios donde los datos no pueden abandonar la maquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12-13 GB para el fichero MiniPlus (12,09 GiB), mas overhead de contexto y cache KV; la variante NanoPlus del mismo autor ocupa 10,23 GiB.
- GPU recomendadas: no disponible de forma explicita; por tamano, GPUs con 16 GB o mas de VRAM (RTX 4080, RTX 4090, A100, H100) permiten cargar el modelo completo en GPU.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas de VRAM; en GPUs de 8-12 GB requeriria descarga parcial a CPU o la variante NanoPlus.
- Opciones de despliegue: llama.cpp (CUDA, Vulkan, CPU), V-Agent (con motores llama.cpp, Strata/PolyStrata, Strata Rust/RustingStrata y Project Maya opcional). Compatible con endpoints.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini APEX-I MiniPlus V2.1 (este) | 26,07 B totales | no disponible | GGUF (12,09 GiB) | Apache 2.0 | Cuantizacion mixta Q4_K/Q6_K/Q8_0/F32 con iMatrix |
| Inkling-2-Mini APEX-I NanoPlus V2.1 | 26,07 B totales (base) | no disponible | GGUF (10,23 GiB) | Apache 2.0 | Variante mas agresiva del mismo autor |
| thinkingmachines/Inkling-2-Mini (base) | 26,07 B totales | no disponible | safetensors BF16 | Apache 2.0 | Modelo original sin cuantizar |

No se dispone de datos de rendimiento comparado con modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks del modelo base ni de esta cuantizacion, por lo que no es posible verificar la degradacion introducida por la cuantizacion mixta.
- El modelo base es de procedencia poco documentada publicamente: se desconoce el dataset de entrenamiento, el numero de tokens, los idiomas soportados y si hubo alineamiento con RLHF o DPO.
- La cuantizacion Q4_K en embeddings y proyecciones de atencion puede degradar tareas sensibles a precision numerica (matematicas, razonamiento de cadena larga, generacion de codigo exacta); las protecciones F32 y Q8_0 mitigan pero no eliminan este riesgo.
- Riesgo de alucinacion inherente a modelos generativos; no hay evaluaciones publicadas de fidelidad factua.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto e idioma: no disponible; la ausencia de idiomas declarados impide garantizar calidad en castellano.
- La licencia Apache 2.0 del repositorio de cuantizacion permite uso comercial, pero debe verificarse que el modelo base `thinkingmachines/Inkling-2-Mini` mantiene la misma licencia.
- El autor declara que la iMatrix utilizada es un fichero externo cuya procedencia no se infiere; conviene auditar su origen antes de usar el GGUF en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria del artefacto.
- La integracion con V-Agent esta vinculada a un proyecto personal del autor; para produccion conviene usar llama.cpp directamente o un servidor compatible con endpoints.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Variante NanoPlus: https://huggingface.co/IsValorum/Inkling-2-Mini-APEX-I-NanoPlus-V2.1-GGUF
- Mapa por tensor: https://huggingface.co/IsValorum/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-GGUF/blob/main/tensor-map.tsv
- V-Agent (repositorio): https://github.com/IsValorum/V-Agent
- V-Agent (ultima release): https://github.com/IsValorum/V-Agent/releases/latest
- V-Agent (arquitectura): https://github.com/IsValorum/V-Agent/blob/main/docs/ARCHITECTURE.md
- Apoyo al autor: https://ko-fi.com/isvalorum
