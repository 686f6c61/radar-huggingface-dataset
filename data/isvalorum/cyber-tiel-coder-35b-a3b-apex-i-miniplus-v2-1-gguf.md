# IsValorum/Cyber-Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Cyber-Tiel-Coder-35B-A3B APEX-I-MiniPlus-V2.1 es una cuantizacion GGUF de un modelo MoE especializado en programacion agentica, publicada por IsValorum a partir del modelo base peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP. El modelo original se construye sobre la familia Qwen3.5-MoE (etiquetada como qwen3.6/qwen35moe en la model card) y conserva su naturaleza multimodal image-text-to-text, con 34.660.610.688 parametros totales y aproximadamente 3.000 millones de parametros activos por token segun la nomenclatura A3B.

La aportacion principal de esta ficha no es el modelo en si, sino el esquema de cuantizacion propietario APEX-I MiniPlus V2.1: una cuantizacion tensor a tensor con matrices de importancia (imatrix) y asignacion dinamica de bits, orientada a preservar la fidelidad de tipo Q5 a Q6 sin un limite fijo de tamano de fichero. El repositorio ocupa 16,8 GB e incluye soporte de decodificacion especulativa mediante cabezas MTP (multi-token prediction), lo que permite acelerar la generacion en llama.cpp.

Es relevante ahora porque demuestra que un MoE de ~35B con contexto nativo de 256K puede ejecutarse en estaciones de trabajo de 24 GB de VRAM combinando offload a RAM del sistema, un escenario historicamente reservado a modelos densos mucho mas pequenos. La licencia MIT y el soporte de 13 idiomas amplian su atractivo para integracion comercial y despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Qwen3.5-MoE, etiquetada qwen3.6/qwen35moe); multimodal image-text-to-text |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | ~3B (nomenclatura A3B) |
| Longitud de contexto | 256K tokens (contexto completo ejecutable en 24 GB de VRAM segun el autor) |
| Tipos de cuantizacion | GGUF con esquema APEX-I MiniPlus V2.1 (tensor a tensor, imatrix, asignacion dinamica de bits, fidelidad objetivo Q5-Q6); variantes NanoPlus orientadas a Q4 |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) de la familia Qwen3.5-MoE, con unos 34,7B parametros totales y aproximadamente 3B activos por token, lo que reduce el coste computacional por paso manteniendo la capacidad de un modelo de mayor tamano. Incorpora cabezas de prediccion multi-token (MTP) que habilitan decodificacion especulativa, y conserva la torre de vision del modelo original, ya que el pipeline declarado es image-text-to-text.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada. La model card menciona rasgos como "abliterated" y "uncensored" en las etiquetas, y describe el modelo como especializado en codigo agentico y tareas SWE-bench, pero no detalla el proceso de entrenamiento. La innovacion tecnica documentada corresponde a la cuantizacion: APEX-I MiniPlus V2.1 aplica un mapa quirurgico de bits por tensor, auditado desde el propio GGUF, con matrices de importancia y asignacion dinamica para preservar capas sensibles (atencion, expertos criticos) a mayor precision.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 256K tokens.
- Razonamiento explicito y modo de "reasoning effort" configurable mediante plantilla de chat endurecida.
- Programacion y codigo agentico: el modelo esta ajustado para tareas tipo SWE-bench y desarrollo local de alta velocidad.
- Capacidades multimodales de vision: entrada image-text-to-text (descripcion de imagenes, comprension de capturas, diagramas y UI).
- Soporte de tool calling y function calling, orientado a agentes.
- Razonamiento multi-paso para flujos agenticos y automatizacion.
- Multilingue en 13 idiomas: ingles, chino, espanol, frances, aleman, portugues, italiano, ruso, japones, coreano, vietnamita, tailandes y arabe.
- Decodificacion especulativa mediante cabezas MTP para acelerar la inferencia.
- Eficiencia de tokens declarada (token-efficient) para reducir coste por tarea.

## Casos de uso

- Desarrollo asistido en local: el modelo puede generar, refactorizar y explicar codigo dentro de un IDE o terminal, aprovechando sus ~3B parametros activos para mantener latencia baja en GPUs de consumo y su contexto de 256K para razonar sobre repositorios completos.
- Agentes autonomos de ingenieria de software: con tool calling y razonamiento multi-paso, puede encadenar lecturas de ficheros, ejecuciones de tests y parches en pipelines de CI/CD, un escenario para el que el modelo esta explicitamente ajustado (SWE-bench).
- Revision de codigo y auditoria de PRs: su ventana de 256K permite cargar diffs extensos y ficheros relacionados en una sola pasada, reduciendo la perdida de contexto entre llamadas.
- Atencion al cliente tecnica multi-turno: la combinacion de contexto largo, 13 idiomas y modo conversacional permite gestionar historiales extensos de incidencias sin truncar informacion relevante.
- Analisis de documentacion tecnica con imagenes: al ser image-text-to-text, puede interpretar diagramas de arquitectura, capturas de paneles y esquemas junto al texto asociado, util en soporte de infraestructura.
- Despliegue en estaciones de trabajo de 24 GB: gracias al offload parcial a RAM del sistema y a la cuantizacion APEX, equipos con una RTX 4090 pueden ejecutar el modelo con contexto completo, habilitando asistentes privados sin coste de API.
- Generacion de codigo en produccion con requisitos de privacidad: la licencia MIT y la ejecucion local permiten integrarlo en entornos con datos sensibles que no pueden salir a servicios en la nube.

## Benchmarks y rendimiento

La model card referencia benchmarks de comunidad (Shortbench / NanoBench #03 Global) y verificacion empirica de fidelidad, pero no se han incluido en la informacion disponible los valores numericos concretos de MMLU, HumanEval, GSM8K ni SWE-bench, ni las comparaciones cuantitativas con modelos similares. La unica cifra de rendimiento documentada es la mejora de perplejidad WikiText-2 de las variantes V3 de la familia 27B densa (+13,21% y +11,49% frente a GSQ-RCO IQ3_S con PPL 7,07), que no corresponde a este modelo de 35B.

No se han publicado resultados de benchmarks en la informacion disponible para este modelo concreto.

## Requisitos de hardware

- VRAM estimada: el repositorio GGUF ocupa 16,8 GB; con offload parcial a RAM del sistema, el autor afirma que el contexto completo de 256K se ejecuta en estaciones de trabajo de 24 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) como objetivo declarado para contexto completo; el autor publica benchmarks de throughput para RTX 30, 40 y 50 series, ademas de streaming desde RAM.
- GPU de consumo: cabe en GPUs de 24 GB con offload parcial; en GPUs de 12-16 GB requeriria offload sustancial a RAM y contexto reducido.
- Opciones de despliegue: llama.cpp (CUDA, Vulkan o CPU), V-Agent (agente de escritorio del autor, con motores llama.cpp, Strata y Strata Rust), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card remite a una seccion especifica de benchmarks de hardware y offload que no se ha incluido en los datos extraidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B APEX-I-MiniPlus-V2.1 | 34,7B totales / ~3B activos | 256K | Codigo agentico, multimodal, MoE | MIT | GGUF en Hugging Face |
| Tiel-Coder-35B-A3B APEX-I-MiniPlus-V2.1 | ~35B MoE | no disponible | Codigo agentico y SWE-bench | MIT (segun familia) | GGUF en Hugging Face |
| Qwen3.6-35B-A3B MTP APEX-I-MiniPlus-V2.1 | ~35B MoE | no disponible | Razonamiento general, agentes, tool use, multimodal | MIT (segun familia) | GGUF en Hugging Face |
| Ornith 1.5 APEX-I-MiniPlus-V2.1 | ~35B MoE | no disponible | Ingenieria de software a escala de repositorio | MIT (segun familia) | GGUF en Hugging Face |

Las cuatro variantes comparten la misma metodologia de cuantizacion APEX-I MiniPlus V2.1 y soporte MTP, pero el autor las presenta como familias y ediciones distintas con comportamiento propio, no como variantes intercambiables del mismo modelo.

## Limitaciones y advertencias

- La model card documenta una limitacion conocida: preservacion de tipos y esquemas bajo compactacion de contexto, relevante para agentes que dependen de salidas estructuradas.
- Las etiquetas "abliterated" y "uncensored" indican reduccion de comportamientos de rechazo; en produccion esto exige filtros de seguridad propios y revision de contenido.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado en tareas de codigo donde una API inventada puede compilar pero fallar en ejecucion.
- La cuantizacion introduce degradacion respecto al modelo en precision completa; el autor la mitiga con asignacion selectiva de bits, pero no se dispone de metricas de fidelidad publicadas en la informacion extraida.
- El contexto de 256K solo es alcanzable con offload a RAM; en configuraciones de VRAM limitada el contexto efectivo sera menor.
- El modelo es una cuantizacion de terceros: los derechos y la licencia MIT aplican al modelo base y a esta publicacion, pero la responsabilidad de validacion en produccion recae en el integrador.
- No se dispone de informacion sobre sesgos especificos, datos de entrenamiento ni evaluaciones de seguridad del modelo base.
- La fecha de creacion del repositorio (2026-09-29) y la nomenclatura de versiones (Qwen3.6, Qwen3.8) deben contrastarse con las fuentes oficiales antes de fijar dependencias en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Cyber-Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP
- Coleccion APEX-I MiniPlus V2.1: https://huggingface.co/collections/IsValorum/apex-i-miniplus-v21-standard-moe-6acfee77961c8c0cf5a083b5
- Variante Tiel-Coder-35B-A3B APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Variante Qwen3.6-35B-A3B MTP APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-GGUF
- Variante Qwen3.6-35B-A3B MTP APEX-I-MiniPlus-V2.1 Abliterated: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Variante Ornith 1.5 APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Ornith-1.5-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Qwen3.8 27B MiniPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3-GGUF
- Qwen3.8 27B NanoPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-NanoPlus-V3-GGUF
- Swift-1.5 Qwen3.8 27B Uncensored MTP MiniPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-MiniPlus-V3-GGUF
- Swift-1.5 Qwen3.8 27B Uncensored MTP NanoPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-NanoPlus-V3-GGUF
- V-Agent (agente de escritorio): https://github.com/IsValorum/V-Agent
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
