# Jon-Nielsen/Qwen3.8-Flash-Next-Merlin-3090-Serving-Kit

## Resumen

Qwen3.8-Flash-Next-Merlin-3090-Serving-Kit es un kit de despliegue publicado por el usuario Jon-Nielsen en Hugging Face, no un modelo de pesos. Su objetivo es servir el checkpoint halt95/Qwen3.8-Flash-Next-W4A16-Merlin con su ventana de contexto completa de 262.144 tokens y decodificación especulativa MTP-4 sobre cuatro tarjetas RTX 3090 de 24 GB, e incluye además un perfil de máxima capacidad con ocho RTX 3090. El repositorio no aloja pesos: contiene recetas de lanzamiento, ficheros Docker Compose, parches de runtime y una cirugía de checkpoint opcional.

El checkpoint servido deriva de Qwen/Qwen3.8-Flash-Next y combina partes en BF16 de Qwen/Intel, expertos cuantizados W4A16 con AutoRound de Intel, una tabla FP8 PLE de RadixArk y un paquete draft INT4 con sidecar de KV de halt95. El kit aporta el port a vLLM 0.11.3 para sm_86 (Ampere), correcciones en el cargador de sidecar compatible con pipeline parallelism, puertas de validación para el draft INT4 y el embedding PLE en FP8, y todas las mediciones de los perfiles.

Su relevancia es de ingeniería: demuestra que un modelo de contexto largo (262k) puede servirse con paralelismo TP2×PP2, expert parallelism y MTP-4 en hardware consumer Ampere con PCIe y sin P2P, un escenario en el que NCCL suele fallar. El repositorio tiene 0 descargas y 0 likes en la fecha de consulta, no incluye benchmarks clásicos de calidad y las mediciones proceden de un único rig.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flash-Next (familia Qwen); el kit menciona MTP, GDN en INT8 y PLE con offload a CPU, compatible con un diseño híbrido, aunque la composición exacta no se detalla. No disponible la confirmación oficial |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (la referencia a "expertos W4A16" sugiere topología MoE, sin cifras publicadas) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | W4A16 (int4 en pesos, 16 bits en activaciones) con AutoRound y formato compressed-tensors; KV cache en FP8 E4M3 en el perfil B y BF16 en el perfil A; GDN en INT8; draft en INT4; existe una variante NVFP4 de la serie |
| Idiomas soportados | No disponible |
| Licencia | Código y recetas del repositorio: Apache-2.0. El checkpoint subyacente se declara bajo Qwen Community License 1.0 en la model card, aunque los metadatos del repositorio en Hugging Face indican apache-2.0 |
| Formato de pesos | Este repositorio no aloja pesos. El checkpoint servido usa formato compressed-tensors (W4A16). No se confirma explícitamente safetensors en la información disponible |
| Librería | vLLM |
| Pipeline | text-generation, conversational |
| Fecha de publicación | 2026-09-12 |

## Arquitectura y entrenamiento

El kit no entrena ningún modelo: parte del checkpoint de halt95, que a su vez cuantiza Qwen/Qwen3.8-Flash-Next. La cadena de atribución documentada por el autor es la siguiente: base y partes BF16 de Qwen e Intel, expertos W4A16 generados con AutoRound por Intel, tabla PLE en FP8 de RadixArk, paquete draft INT4, GDN en INT8 y sidecar de KV de halt95 (con empaquetador adaptado de DominikBucko). El runtime es un fork de vLLM (wtdcode/lazmio) con la arquitectura Flash-Next y el offload a CPU de PLE aportados por huanghaoyan.hhy mediante los PR upstream #53896 y #53899, y un arreglo de pipeline parallelism con MTP de Matri Ning.

La innovación técnica del repositorio es de servicio, no de entrenamiento. El perfil B combina TP2×PP2 con expert parallelism y decodificación especulativa MTP-4, con KV cache en FP8 E4M3 más sidecar, y logra paridad de un solo stream con el perfil de ocho GPU porque en C=1 el cuello de botella es la latencia de comunicación: TP2×PP2 realiza 24 allreduces de dos rangos por etapa frente a los 48 de cuatro rangos de TP4. La cirugía opcional de checkpoint sustituye el draft por una variante bf16mtp que cede aproximadamente un 10 % del pool de KV a cambio de un máximo multi-stream agregado de 202,2 tok/s con aceptación de ~3,5. No se dispone de información sobre número de tokens de entrenamiento, composición del dataset ni fases de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto y uso conversacional, según el pipeline declarado del repositorio.
- Ventana de contexto de 262.144 tokens, servida de extremo a extremo en los dos perfiles medidos.
- Decodificación especulativa MTP-4 integrada en el despliegue, con tasas de aceptación declaradas de ~3,5 en la variante de cirugía y ~3,0 bajo carga en el perfil FP8.
- Caché KV cuantizada en FP8 E4M3 con sidecar, lo que multiplica el número de tokens simultáneos en memoria (416.490 en el perfil B, 1.333.383 en el perfil A).
- Offload a CPU de la tabla PLE, orientado a reducir la huella de VRAM en tarjetas de 24 GB.
- Soporte de paralelismo tensor, de pipeline y de expertos sobre PCIe sin P2P, con la configuración NCCL necesaria incluida en los perfiles.
- Tool calling, function calling, razonamiento multi-paso, capacidades multimodales, de audio o modos de pensamiento: no disponibles en la información proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Despliegue on-premise de contexto largo con hardware consumer: cuatro RTX 3090 de 24 GB permiten servir 262.144 tokens de contexto con MTP-4, sin necesidad de clústeres A100 o H100. El perfil B es el indicado cuando la restricción es el número de tarjetas.
- Análisis de documentación extensa: 262.144 tokens equivalen a cientos de miles de palabras, suficiente para ingerir manuales técnicos, expedientes o bases de código completas en una sola pasada y hacer preguntas sobre el conjunto sin recuperación por trozos.
- RAG con contexto ampliado: el pool de KV de 416.490 tokens del perfil B (1,59 veces la ventana) permite mantener varias sesiones o documentos cargados en paralelo mientras se alternan consultas, reduciendo la necesidad de reindexado.
- Asistentes conversacionales multi-turno: la ventana completa permite conservar historiales largos sin truncado; el perfil B admite hasta cuatro streams concurrentes, un límite explícito del diseño.
- Evaluación comparativa de cuantizaciones: el kit permite reproducir en el mismo rig cuatro variantes del mismo modelo base (BF16 original, W4A16 AutoRound de Intel, NVFP4 de RadixArk y W4A16 Merlin de halt95) y medir aceptación, throughput y consumo de KV.
- Laboratorio de serving para Ampere: sirve como referencia para portar kernels y overlays de FP8-KV, sidecar de KV y MTP a sm_86, un objetivo poco cubierto por las herramientas upstream.
- Procesamiento por lotes con cuatro streams en paralelo: el perfil B entrega 189,3 tok/s agregados a cuatro streams, adecuado para tareas de generación por lotes que toleren ese grado de concurrencia.
- Validación de infraestructura PCIe sin P2P: los perfiles codifican la configuración NCCL que hace funcionar pipeline parallelism en rigs con P2P bloqueado por VBIOS (BAR1), un escenario frecuente en clústeres de tarjetas de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). El repositorio sí publica mediciones de servicio obtenidas por el autor, que se reproducen a continuación tal cual figuran en la model card.

| Perfil | GPU | Paralelismo | KV cache | Pool de KV | Single-stream | 4-stream |
|---|---|---|---|---|---|---|
| Perfil A | 8x RTX 3090 | TP4×PP2+EP+MTP-4 | BF16 | 1.333.383 tokens (5,09x sobre 262k) | 104,2 tok/s | 146,5 / 131,5 tok/s |
| Perfil B | 4x RTX 3090 | TP2×PP2+EP+MTP-4 | FP8 E4M3 + sidecar | 416.490 tokens (1,59x sobre 262k) | 94,2 tok/s | 189,3 tok/s |
| Cirugía bf16mtp (variante opcional) | Según perfil | Draft bf16mtp | — | Cede ~10 % del pool | — | 202,2 tok/s agregados, aceptación ~3,5 |

Advertencias del propio autor sobre estas cifras: las del perfil A proceden de un medidor rápido con prompts técnicos y las de la variante bf16mtp de un medidor de serie más largo, por lo que no deben compararse entre carriles. El control de calidad se limita a un oráculo de humo de cuatro prompts (4/4 en los carriles medidos, con coincidencia bit a bit con el carril BF16 en los prompts más estables); el carril del perfil A con el checkpoint original se validó con pruebas de arranque, throughput y aceptación, no con el oráculo. La aceptación FP8 bajo carga se sitúa en torno a 3,0, dentro de la banda declarada por halt95 para este diseño (2,43-2,78).

## Requisitos de hardware

- VRAM mínima para el perfil B: 4 GPU x 24 GB = 96 GB, con KV cache en FP8 E4M3 y sidecar.
- VRAM para el perfil A: 8 GPU x 24 GB = 192 GB, con KV cache en BF16.
- GPU validadas: RTX 3090 (Ampere, sm_86). El runtime está compilado específicamente para sm_86; no se documenta soporte para otras arquitecturas.
- Cabe en GPU consumer: sí, el diseño está pensado para RTX 3090 de 24 GB, con perfiles de 4 y de 8 tarjetas.
- Interconexión: PCIe sin P2P (bloqueo por VBIOS/BAR1). Los perfiles incluyen la configuración NCCL necesaria para que pipeline parallelism funcione en ese escenario.
- Despliegue: vLLM mediante el fork wtdcode/vllm-backport (v0.11.3, sm_86) con overlays de FP8-KV y PLE; se proporcionan ficheros Docker Compose por perfil y una imagen de runtime publicada en GHCR. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 94,2 tok/s single-stream en el perfil B y 189,3 tok/s agregados a cuatro streams; 104,2 tok/s single-stream en el perfil A; 202,2 tok/s agregados a cuatro streams con la cirugía bf16mtp opcional.
- Prefill profundo: probado hasta 68.000 tokens, muy por debajo de la ventana máxima de 262.144 tokens.
- Límite de concurrencia: el perfil B admite como máximo cuatro streams simultáneos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos externos comparables en la información proporcionada. La comparación viable es dentro de la propia familia de checkpoints referenciados por el repositorio.

| Checkpoint | Rol en la cadena | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-Flash-Next | Modelo base original | BF16 | No disponible | No disponible en esta información | Hugging Face |
| Intel/Qwen3.8-Flash-Next-W4A16-AutoRound | Expertos W4A16 generados con AutoRound | W4A16 | No disponible | No disponible en esta información | Hugging Face |
| RadixArk/Qwen3.8-Flash-Next-NVFP4 | Variante NVFP4; aporta la tabla PLE en FP8 | NVFP4 / FP8 | No disponible | No disponible en esta información | Hugging Face |
| halt95/Qwen3.8-Flash-Next-W4A16-Merlin | Checkpoint efectivamente servido por el kit | W4A16 + draft INT4 + GDN INT8 + sidecar KV | 262.144 tokens (según el kit) | Qwen Community License 1.0 según la model card | Hugging Face |
| Jon-Nielsen/Qwen3.8-Flash-Next-Merlin-3090-Serving-Kit | Recetas de servicio, parches y perfiles medidos (sin pesos) | No aplica | 262.144 tokens servidos | Apache-2.0 (código) | Hugging Face y GitHub |

Comparativa con alternativas de otros fabricantes: no disponible.

## Limitaciones y advertencias

- El repositorio no contiene pesos. Cualquier uso requiere descargar por separado el checkpoint de halt95, sujeto a su propia licencia.
- Licencia ambigua: los metadatos de Hugging Face del repositorio declaran apache-2.0, mientras que la model card indica que el checkpoint es Qwen Community License 1.0 y que solo el código del kit es Apache-2.0. Verificar antes de un uso comercial.
- 0 descargas y 0 likes en la fecha de consulta: sin validación independiente por parte de la comunidad.
- Las mediciones proceden de un único rig (8x RTX 3090, PCIe, P2P bloqueado) y de una fecha concreta (2026-09-12). No son extrapolables a otras topologías ni a otras arquitecturas de GPU.
- No hay datos de estabilidad en ejecuciones largas; el propio autor lo declara como límite.
- El prefill profundo solo se ha probado hasta 68.000 tokens, aunque la ventana anunciada es de 262.144. El comportamiento en prefill cercano al máximo no está verificado.
- El perfil B está limitado a cuatro streams concurrentes.
- La aceptación de la decodificación especulativa con KV en FP8 cae a ~3,0 bajo carga (banda de referencia del diseño: 2,43-2,78), lo que reduce la ventaja del MTP en escenarios de alta concurrencia.
- Control de calidad débil: un oráculo de cuatro prompts no cubre sesgos, alucinación, fidelidad factual ni regresiones de calidad introducidas por la cuantización W4A16.
- El carril del perfil A con el checkpoint original no pasó el oráculo de calidad, solo pruebas de arranque y rendimiento.
- Las cifras del perfil A y las de la variante bf16mtp provienen de medidores distintos; el autor advierte explícitamente de que no deben compararse entre carriles.
- Dependencia de un fork no upstream de vLLM (v0.11.3, sm_86) y de overlays propios; el mantenimiento y la compatibilidad futura no están garantizados.
- Idiomas soportados no disponibles, por lo que no puede evaluarse la calidad multilingüe.
- El offload de PLE a CPU puede introducir latencia adicional no cuantificada en la información disponible.
- Los resultados de búsqueda web asociados a esta consulta no contienen información relevante sobre el modelo: devuelven páginas turísticas sobre Kaaawa (Hawái), sin relación alguna con el repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Jon-Nielsen/Qwen3.8-Flash-Next-Merlin-3090-Serving-Kit
- Checkpoint servido: https://huggingface.co/halt95/Qwen3.8-Flash-Next-W4A16-Merlin
- Kit completo en GitHub (overlays, parches por fichero, restricciones del rig, límites y protocolo del oráculo): https://github.com/jon-nielsen/qwen38-flash-next-3090-kit
- Imagen de runtime: ghcr.io/jon-nielsen/vllm-backport-flashnext-sm86:3bec275-bb1f7777
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante W4A16 con AutoRound: https://huggingface.co/Intel/Qwen3.8-Flash-Next-W4A16-AutoRound
- Variante NVFP4: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- PR upstream de vLLM citados: #53896 y #53899
- Resultados de búsqueda web: ninguno relevante para este modelo en la información proporcionada.
