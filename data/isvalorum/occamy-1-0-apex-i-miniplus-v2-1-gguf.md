# IsValorum/Occamy-1.0-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Occamy-1.0 APEX-I-MiniPlus-V2.1 GGUF es una cuantización de precisión quirúrgica del modelo base Accio-Lab/occamy-1.0, un Mixture-of-Experts (MoE) de aproximadamente 34.660 millones de parámetros totales, publicada por IsValorum. El repositorio distribuye los pesos en formato GGUF con el esquema propietario APEX-I MiniPlus V2.1, orientado a preservar fidelidad de clase Q5-Q6 sin un límite fijo de tamaño de archivo, e integra imatrix y una asignación tensor a tensor de tipos de cuantización.

El modelo está pensado para inferencia local en llama.cpp y entornos compatibles con endpoints, con énfasis en el offload eficiente a RAM del sistema y en la ejecución de la ventana completa de 256K tokens en estaciones de trabajo con 24 GB de VRAM. Soporta 13 idiomas (entre ellos castellano, inglés, chino, francés, alemán y portugués) y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial.

La relevancia actual del release radica en su estrategia de cuantización: en lugar de aplicar un esquema plano, el autor asigna tipos por tensor y audita el resultado desde el propio GGUF, publicando comparativas de perplejidad en WikiText-2 frente a cuantizaciones IQ3_S de referencia. El repositorio ocupa 18,6 GB y acumula 2.812 descargas y 20 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, familia qwen35moe segun tags; tag adicional "reasoning" |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 256K tokens (segun la model card: "Full 256K Context Runs In VRAM") |
| Tipos de cuantizacion | GGUF con esquema APEX-I MiniPlus V2.1 (asignacion tensor a tensor, imatrix, orientado a fidelidad Q5-Q6); tipos concretos por tensor no disponibles en la informacion |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar (13 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 18,6 GB |

## Arquitectura y entrenamiento

El modelo base es un MoE de 34,66 B de parámetros totales, etiquetado en el repositorio como `qwen35moe`, lo que lo vincula a la familia arquitectónica Qwen de mezcla de expertos. La model card menciona soporte integrado de MTP (multi-token prediction) en la línea APEX-I MiniPlus, aunque no se detalla si esta variante concreta lo incorpora ni cuántos expertos activa por token. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovación principal de este release no está en el entrenamiento, sino en la cuantización. El autor aplica un esquema APEX-I MiniPlus V2.1 con matriz de importancia (imatrix) y asignación diferenciada de tipos por tensor, auditada directamente desde el GGUF resultante. La model card incluye una sección específica de "Surgical Tensor Quantization Map" y una comparativa de calidad frente a cuantizaciones planas estándar, con métricas de perplejidad WikiText-2 frente a GSQ-RCO IQ3_S (PPL 7,07). Para esta variante concreta de Occamy no se publican los porcentajes de mejora en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 256K tokens.
- Razonamiento explícito: el repositorio incluye el tag `reasoning` y una sección de "Hardened Agentic Chat Template & Reasoning Effort" con parámetros recomendados por Accio-Lab.
- Soporte multilingüe en 13 idiomas, incluido castellano.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite desplegarlo tras APIs compatibles con OpenAI.
- Ejecución en llama.cpp con offload parcial a RAM del sistema.
- Plantilla de chat reforzada para flujos agénticos, según la documentación del autor.
- No se documentan capacidades de visión, audio ni tool calling explícito en la información disponible; el tag `qwen35moe` sugiere posible herencia de funciones de la familia, pero no se confirma.

## Casos de uso

- Razonamiento de contexto largo en local: con 256K tokens de ventana y offload a RAM, se puede procesar documentación extensa, expedientes o bases de código completas en una estación de 24 GB de VRAM sin depender de la nube.
- Asistencia conversacional multilingüe: al cubrir 13 idiomas, incluido castellano, es adecuado para atención al cliente o soporte interno en organizaciones con usuarios en varias regiones.
- Despliegue en endpoints compatibles: el tag `endpoints_compatible` permite servirlo detrás de una API estilo OpenAI y sustituir llamadas a proveedores externos en aplicaciones existentes.
- Investigación en cuantización: el mapa tensor a tensor auditado y las comparativas de perplejidad lo convierten en un caso de estudio útil para evaluar esquemas de cuantización frente a IQ3_S o Q4_K_M.
- Prototipado agéntico: la plantilla de chat reforzada y el modo de razonamiento permiten construir pipelines de varios pasos con control del esfuerzo de razonamiento.
- Estaciones de trabajo con GPU de consumo: al caber la ventana completa en 24 GB según el autor, sirve para desarrollo y pruebas de aplicaciones de contexto largo en hardware tipo RTX 3090 o 4090.
- Generación de documentación técnica y resúmenes: la ventana larga y el multilingüismo permiten resumir manuales, actas o papers manteniendo coherencia entre secciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta variante concreta de Occamy. La model card incluye comparativas de perplejidad WikiText-2 para otras variantes de la familia APEX-I MiniPlus (Qwen3.8 27B, Swift-1.5), pero no para este modelo. Tampoco se ofrecen cifras de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el autor afirma que la ventana completa de 256K contexto se ejecuta íntegramente en VRAM en configuraciones de 24 GB, gracias al esquema de cuantización y al offload selectivo.
- El repositorio ocupa 18,6 GB, por lo que el archivo de pesos cabe en GPUs de 24 GB, aunque la caché KV para 256K tokens requiere planificación adicional.
- GPU recomendadas: RTX 3090, RTX 4090 y GPUs de la serie RTX 50 según la sección de throughput del autor; para despliegues profesionales, A100 o H100 si se busca mayor paralelismo.
- Cabe en GPU de consumo de gama alta con 24 GB; en GPUs de 16 GB o menos será necesario offload parcial a RAM del sistema.
- Opciones de despliegue: llama.cpp como runtime principal, con compatibilidad declarada con endpoints; no se confirma soporte de vLLM o TGI en la información disponible.
- Latencia y throughput: la model card incluye una sección de "Hardware Throughput & Offload Benchmarks (RTX 30 / 40 / 50 & RAM Streaming)", pero las cifras concretas no están disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Occamy-1.0 APEX-I-MiniPlus-V2.1 (este) | 34,66 B (MoE) | 256K | Apache 2.0 | GGUF | Cuantización quirúrgica con imatrix; 18,6 GB |
| Qwen3.6-35B-A3B MTP APEX-I-MiniPlus-V2.1 | 35 B (MoE, 3 B activos por el nombre) | no disponible | Apache 2.0 (presumible, no confirmado) | GGUF | Misma familia de cuantización; orientado a razonamiento general, agentes y tool calling |
| Ornith 1.5 APEX-I-MiniPlus-V2.1 | 35 B (MoE) | no disponible | no disponible | GGUF | Especializado en ingeniería de software y agentes de código |
| Tiel Coder APEX-I-MiniPlus-V2.1 | 35 B (MoE) | no disponible | no disponible | GGUF | Especialista en programación agéntica e iteración con herramientas |

Las tres alternativas pertenecen a la misma línea de cuantización del autor y comparten metodología, pero son familias de modelos distintas, no variantes del mismo modelo. No se dispone de datos de rendimiento comparables entre ellas en la información proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo base en la información disponible; al ser un modelo multilingüe entrenado con datos web, es esperable un sesgo hacia el inglés y el chino.
- Riesgo de alucinación inherente a los modelos generativos; la ventana de 256K no elimina la posibilidad de fabricar citas o datos.
- La model card advierte explícitamente sobre un problema de sintaxis en código y recomienda ajustar el repeat penalty para evitar "character swapping"; es un caveat crítico para uso en producción con código.
- El esquema de cuantización APEX-I es propietario y su fidelidad depende del mapa tensor a tensor del autor; los resultados pueden diferir de cuantizaciones estándar en tareas sensibles.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Accio-Lab/occamy-1.0, que no se detalla en la información.
- El offload a RAM del sistema reduce el throughput; las cifras de latencia dependen fuertemente de la configuración de hardware y no se publican para esta variante.
- Existe una edición "Abliterated" del mismo modelo con comportamiento de rechazo reducido; no debe confundirse con esta versión estándar.
- No se confirma soporte de tool calling nativo ni de visión, pese a que otras variantes de la familia lo mencionan.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Edición Abliterated: https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Colección APEX-I MiniPlus V2.1: https://huggingface.co/collections/IsValorum/apex-i-miniplus-v21-standard-moe-6acfee77961c8c0cf5a083b5
- Qwen3.6-35B-A3B MTP APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-GGUF
- Ornith 1.5 APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Ornith-1.5-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Tiel Coder APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Apoyo al autor: https://ko-fi.com/isvalorum
