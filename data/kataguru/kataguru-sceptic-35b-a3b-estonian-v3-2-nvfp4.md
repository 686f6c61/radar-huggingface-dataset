# kataguru/Kataguru-Sceptic-35B-A3B-Estonian-v3.2-NVFP4

## Resumen

Kataguru-Sceptic-35B-A3B-Estonian-v3.2-NVFP4 es la variante cuantizada en NVFP4 del modelo Kataguru-Sceptic-35B-A3B-Estonian-v3.2, desarrollado por Datasein Oy (Finlandia), con Jari Katajisto como arquitecto jefe. Se trata de un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) construido sobre la base Kataguru-Sceptic-35B-A3B-v3.1, al que se han anadido dos expertos nativos para estonio, dando un total de 256 expertos por capa en 40 capas. El modelo esta disenado como un coder industrial y de sistemas, con enfasis en automatizacion (PLC/CNC), programacion de sistemas y razonamiento cientifico, con soporte nativo de estonio, finlandes e ingles.

La relevancia de esta version concreta reside en su cuantizacion NVFP4 (formato FP4 de 4 bits nativo de las GPU Blackwell de NVIDIA), que reduce el peso del modelo a aproximadamente 20,7 GiB, permitiendo su despliegue en una unica GPU de 24 GB. Con 35.951.822.704 parametros totales y 3B parametros activos por token, el modelo busca ofrecer capacidades de razonamiento, codigo industrial y vision en un formato apto para hardware de consumo profesional.

La ficha se centra en la informacion disponible en la model card y los metadatos de Hugging Face. Muchos datos tecnicos (composicion exacta del dataset, proceso de entrenamiento, benchmarks completos) no estan detallados en la informacion proporcionada y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer multimodal, tipo qwen3_5_moe, con 40 capas y 256 expertos por capa (254 congelados + 2 nativos de estonio) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3B por token (segun la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4, 4 bits, formato nativo Blackwell); existen variantes BF16, W4A16-AWQ y GGUF del mismo modelo |
| Idiomas soportados | en, et (estonio), fi (finlandes) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, NVFP4) |
| Tamano del repo | 48,0 GB |
| Vision encoder | ViT de 27 capas (segun la model card) |
| Modelo base | kataguru/Kataguru-Sceptic-35B-A3B-v3.1 |

## Arquitectura y entrenamiento

El modelo es un MoE multimodal con 40 capas y 256 expertos por capa. La innovacion principal descrita es la adicion de 2 expertos nativos de estonio (identificados como #254 y #255) sobre los 254 expertos congelados del nucleo Sceptic (#0..#253). Segun la model card, los 254 expertos del nucleo se coactivan en cada paso de token junto con los 2 expertos de estonio en un esquema Top-8, preservando las capacidades originales del modelo base (razonamiento cientifico, codigo competitivo, tool calling agentico y codigo industrial PLC/CNC) mientras se anade competencia nativa en estonio. Incluye un encoder de vision ViT de 27 capas para tareas de imagen-a-texto.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras fases de alineamiento. La model card menciona un "6-in-1 Multi-Mode" y un motor agentico basado en AST de `<tool_call>`, pero no se detalla el proceso de entrenamiento de estos componentes. Esta version NVFP4 es una cuantizacion del modelo BF16 maestro, no un reentrenamiento.

## Capacidades

- Generacion de texto y razonamiento cientifico (STEM), con enfasis en matematicas y razonamiento de nivel graduado.
- Codigo industrial: programacion IEC 61131-3 (Structured Text para Beckhoff TwinCAT 3 y Siemens TIA Portal SCL/S7-1500), G-code CNC (Fanuc, Siemens Sinumerik 840D, Heidenhain) y auditoria de trayectorias.
- Programacion de sistemas y embebidos: C++20, Rust, C (RTOS), Python 3.12, C#/.NET, SQL y Bash/Linux.
- Protocolos industriales y fieldbuses: OPC UA (IEC 62541), Modbus TCP/RTU, EtherCAT, PROFINET, CANopen.
- Seguridad funcional y normativa de maquinaria: ISO 13849-1 (PLa-PLe), IEC 62061 / IEC 61508 (SIL 1-3), Safe Torque Off (STO).
- Tool calling / function calling con motor agentico basado en AST (`<tool_call>`), con soporte multi-paso.
- Vision multimodal: lectura de diagramas P&ID, esquemas electricos, pantallas de error HMI y graficos de ingenieria mediante el encoder ViT.
- Capacidades multilingues en estonio, finlandes e ingles.
- Modo de multiples roles ("6-in-1 Multi-Mode") con cambio dinamico por peticion sin reinicio del servidor.
- Modelo marcado como "uncensored" en los tags.

## Casos de uso

- Generacion y auditoria de codigo PLC en produccion: el modelo puede escribir y revisar logica de control en Structured Text (TwinCAT 3) y SCL (S7-1500), incluyendo maquinas de estados, control de movimiento y diagnostico de fieldbuses, lo que lo hace adecuado para equipos de automatizacion industrial que trabajan en estonio, finlandes o ingles.
- Programacion CNC y post-procesadores: generacion de G-code multi-eje con compensacion de radio de herramienta, offsets de trabajo y ciclos fijos, ademas de verificacion de cargas de husillo y auditoria de colisiones en trayectorias.
- Asistencia en ingenieria de seguridad funcional: redaccion y revision de logica de parada de emergencia, enclavamientos de dos canales y calculos de nivel PL/SIL conforme a ISO 13849-1 e IEC 62061, como apoyo a ingenieros de seguridad.
- Desarrollo de software de sistemas y embebidos: generacion de codigo en Rust, C++20 y C para RTOS, con enfasis en concurrencia, seguridad de memoria y hardening de red, integrable en pipelines de CI/CD.
- Agente de diagnostico industrial con tool calling: el modelo puede encadenar llamadas a herramientas (lectura de registros OPC UA, consultas SQL, diagnosticos de red) en cadenas multi-paso para resolver incidencias en planta.
- Analisis de documentacion tecnica visual: interpretacion de diagramas P&ID, esquemas de cableado y pantallas HMI mediante el encoder de vision, util para soporte remoto y formacion de operarios.
- Traduccion tecnica entre estonio, finlandes e ingles: traduccion de documentacion de automatizacion y codigo comentado, aprovechando los expertos nativos de estonio.
- Despliegue en estaciones de trabajo con GPU unica: gracias a la cuantizacion NVFP4 (~20,7 GiB), puede ejecutarse en una GPU Blackwell de 24 GB, lo que permite su uso en entornos de planta o laboratorio sin infraestructura de servidor dedicada.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card y corresponden al modelo base v3.1/v3.2, no necesariamente a esta variante cuantizada NVFP4:

| Benchmark | Resultado |
|---|---|
| Mean de 15 benchmarks | 70,26 % |
| GPQA Diamond | 70,20 % |
| LiveCodeBench v6 | 39,43 % |
| LiveCodeBench v6 (Easy) | 90,70 % |
| BFCL V4 AST | 83,67 % |
| Industrial PLC/CNC | 96,67 % |

No se han publicado en la informacion disponible resultados de benchmarks especificos para la variante NVFP4, ni comparaciones con otros modelos en dichos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20,7 GiB segun la model card, lo que permite su ejecucion en una unica GPU de 24 GB.
- GPU recomendadas: GPU NVIDIA Blackwell (arquitectura requerida para NVFP4). No se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: si, en GPUs Blackwell con 24 GB o mas (la model card indica "Single 24 GB GPU Ready"). Para GPUs sin soporte NVFP4 existen variantes alternativas del mismo modelo (W4A16-AWQ ~19,5 GiB y GGUF para 16 GB).
- Opciones de despliegue: la libreria indicada es transformers con formato compressed-tensors; la model card menciona compatibilidad con vLLM para la variante AWQ. No se detallan opciones como llama.cpp u Ollama para esta variante NVFP4 concreta, aunque existe una variante GGUF del mismo modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada. Como referencia estructural, se puede comparar con las otras variantes del mismo modelo:

| Modelo | Parametros | Cuantizacion | Tamano | Licencia |
|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Estonian-v3.2-NVFP4 | 35,95B (3B activos) | NVFP4 | ~20,7 GiB | apache-2.0 |
| Kataguru-Sceptic-35B-A3B-Estonian-v3.2 (BF16) | 35,95B (3B activos) | BF16 | ~67,5 GB | apache-2.0 |
| Kataguru-Sceptic-35B-A3B-Estonian-v3.2-W4A16-AWQ | 35,95B (3B activos) | W4A16-AWQ | ~19,5 GiB | apache-2.0 |
| Kataguru-Sceptic-35B-A3B-Estonian-v3.2-GGUF | 35,95B (3B activos) | GGUF (APEX-Trio) | no disponible | apache-2.0 |

No se dispone de comparaciones con modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- La model card esta redactada en tono promocional y contiene afirmaciones no verificables de forma independiente (por ejemplo, "100 % de preservacion" de capacidades o "0 errores de sintaxis" en tool calling); conviene tratarlas con cautela.
- No se detalla la composicion del dataset de entrenamiento ni el proceso de alineamiento, lo que dificulta evaluar sesgos conocidos.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en dominios tecnicos regulados (seguridad funcional, normativa industrial); las salidas deben ser revisadas por ingenieros cualificados.
- La cuantizacion NVFP4 puede degradar ligeramente la calidad respecto al modelo BF16; no se han publicado evaluaciones de la perdida de rendimiento en esta variante.
- El soporte nativo de idiomas se limita a estonio, finlandes e ingles; el rendimiento en castellano no esta documentado.
- La licencia apache-2.0 permite uso comercial, pero el modelo se distribuye "tal cual", sin garantias; el uso en entornos de seguridad critica requiere validacion independiente.
- El modelo esta marcado como "uncensored", lo que puede implicar menor filtrado de contenido sensible.
- La ejecucion de la variante NVFP4 requiere hardware NVIDIA Blackwell; en GPUs anteriores es necesario usar las variantes AWQ o GGUF.
- El numero de descargas (184) y de likes (0) es bajo, lo que sugiere una adopcion limitada y poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Estonian-v3.2-NVFP4
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Pesos BF16 maestros: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Estonian-v3.2
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Estonian-v3.2-W4A16-AWQ
- Variante GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Estonian-v3.2-GGUF
- Ejemplos de uso: https://huggingface.co/spaces/kataguru/Kataguru-Sceptic-35B-Usage-Examples
- Guia de IA soberana: https://huggingface.co/spaces/kataguru/Kataguru-Sovereign-AI-Guide
