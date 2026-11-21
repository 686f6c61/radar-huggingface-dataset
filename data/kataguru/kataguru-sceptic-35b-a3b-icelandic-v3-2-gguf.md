# kataguru/Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-GGUF es la distribucion en formato GGUF del modelo Kataguru-Sceptic-35B-A3B-Icelandic-v3.2, publicado por Datasein Oy (Finlandia) bajo la direccion tecnica de Jari Katajisto. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts derivada de la familia Qwen3.5-MoE, con 35.505.251.456 parametros totales y 3.000 millones de parametros activos por token, disenado especificamente para programacion industrial (PLC, CNC, G-code), ingenieria de sistemas y razonamiento cientifico en islandes, finlandes e ingles.

El modelo parte del checkpoint base Kataguru-Sceptic-35B-A3B-v3.1 y anade dos expertos nativos de islandes (expertos #254 y #255) sobre los 254 expertos congelados del nucleo original, alcanzando 256 expertos por capa en 40 capas. Esta configuracion mantiene las capacidades del modelo base (razonamiento STEM, codigo, tool calling, vision) e incorpora competencia linguistica soberana en islandes, un idioma con escasisima representacion en modelos abiertos de gran escala.

La version GGUF que nos ocupa emplea cuantizacion calibrada con imatrix sobre un corpus islandes y se distribuye en tres variantes (APEX-Small, APEX-Medium y APEX-Good) mas un proyector multimodal `mmproj`, lo que permite ejecutar el modelo en GPU de 16 GB de VRAM. Por su licencia Apache 2.0 y su enfoque industrial, resulta relevante para entornos de automatizacion, integracion de sistemas y despliegue en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) derivada de Qwen3.5-MoE, transformer con 40 capas y 256 expertos por capa |
| Parametros totales | 35.505.251.456 |
| Parametros activos | 3.000 millones por token (Top-8) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en tres variantes APEX-Small, APEX-Medium y APEX-Good, calibradas con imatrix sobre corpus islandes; el ecosistema del modelo incluye ademas BF16, NVFP4 y W4A16-AWQ |
| Idiomas soportados | ingles (en), islandes (is), finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 45,4 GB), con proyector multimodal `mmproj` |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 40 capas, 256 expertos por capa y activacion Top-8 por token, lo que resulta en 3.000 millones de parametros activos sobre un total de 35.500 millones. La innovacion principal respecto al checkpoint base v3.1 es la incorporacion de dos expertos nativos de islandes (expertos #254 y #255) manteniendo congelados los 254 expertos originales (#0..#253). Segun la model card, los expertos congelados coactivan en cada paso de token junto con los dos expertos islandeses, de modo que el modelo conserva las capacidades del nucleo (razonamiento cientifico, codigo competitivo, tool calling, vision) sin sacrificar la especializacion linguistica.

El modelo base Kataguru-Sceptic-35B-A3B-v3.1 reporta un promedio de 70,26 % en una bateria de 15 benchmarks, con 70,20 % en GPQA Diamond, 39,43 % en LiveCodeBench v6 y 83,67 % en BFCL V4 AST. La model card indica que el modelo incorpora un encoder de vision ViT de 27 capas, un motor agentico basado en AST con llamadas `<tool_call>` y un sistema multi-modo de seis roles conmutables por peticion sin reinicio de servidor. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. La cuantizacion GGUF de esta release emplea calibracion imatrix sobre un corpus en islandes para preservar el rendimiento en ese idioma tras la compresion.

## Capacidades

- Generacion de texto, razonamiento cientifico y matematico (GPQA Diamond 70,20 % en el modelo base).
- Programacion industrial: IEC 61131-3 (Structured Text para Beckhoff TwinCAT 3 y Siemens SCL/S7-1500), G-code para Fanuc, Siemens Sinumerik 840D y Heidenhain, con compensacion de radio de herramienta, offsets de trabajo y ciclos fijos.
- Programacion de sistemas y embebidos: C++20, Rust, C para RTOS, Python 3.12, C#/.NET, SQL y Bash/Linux.
- Protocolos industriales y fieldbuses: OPC UA, Modbus TCP/RTU, EtherCAT, PROFINET, CANopen, con diagnostico SCADA/MES.
- Normativa de seguridad funcional: ISO 13849-1 (PLa-PLe), IEC 62061 / IEC 61508 (SIL 1-SIL 3), Safe Torque Off.
- Tool calling y function calling con motor agentico basado en AST (`<tool_call>`), reportado con cero errores de sintaxis y 83,67 % en BFCL V4 AST.
- Capacidades multimodales: lectura de diagramas P&ID, esquemas electricos, pantallas de error HMI y graficos de ingenieria mediante encoder ViT de 27 capas.
- Razonamiento multi-paso y soporte para flujos agenticos y RAG.
- Multilingue en ingles, islandes y finlandes.
- Modo multi-modo con seis roles conmutables por peticion sin reinicio de servidor.
- Traduccion.

## Casos de uso

- Generacion y auditoria de logica PLC en Structured Text: el modelo puede producir maquinas de estado deterministas con `CASE`, bloques de control de movimiento (`MC_MoveAbsolute`, `MC_GearIn`) y diagnostico ADS para proyectos de Beckhoff TwinCAT 3, aprovechando su 96,67 % reportado en el benchmark PLC/CNC.
- Migracion y revision de codigo Siemens SCL: uso en tareas de refactorizacion de bloques de funcion y bloques de datos de instancia en TIA Portal, incluyendo control PID y diagnostico PROFINET, con explicaciones en islandes o finlandes para equipos locales.
- Post-procesado y validacion de G-code: generacion y auditoria de trayectorias multieje para fresado y torneado en Fanuc, Sinumerik 840D y Heidenhain, verificando cargas de husillo y evitando colisiones en la compensacion G41/G42.
- Diagnostico de redes industriales: interpretacion de trazas OPC UA, Modbus, EtherCAT y PROFINET para localizar fallos en celdas de fabricacion, combinando razonamiento tecnico con lectura de esquemas electricos mediante el encoder de vision.
- Asistencia en cumplimiento de seguridad funcional: revision de interlocks de parada de emergencia de doble canal, watchdogs y calculos de nivel PLa-PLe o SIL, adecuado para equipos de ingenieria que documentan conformidad con ISO 13849-1 e IEC 62061.
- Desarrollo de software de sistemas en Rust y C++20: generacion de codigo concurrente y endurecimiento de red en entornos Linux, apoyandose en el rendimiento de LiveCodeBench v6 (39,43 %) y en el 90,70 % reportado en la categoria Easy.
- Agentes de automatizacion con tool calling: integracion en pipelines que encadenan llamadas a funciones mediante `<tool_call>` con sintaxis AST verificada, util para orquestar consultas a bases de datos de produccion o sistemas MES.
- Atencion tecnica en islandes: despliegue de un asistente de soporte para operarios y tecnicos islandeses que explique codigo, manuales y errores de maquina en su idioma nativo, gracias a los dos expertos islandeses dedicados.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo base Kataguru-Sceptic-35B-A3B-v3.1, no a esta cuantizacion GGUF concreta. No se han publicado resultados de benchmarks especificos para la variante GGUF en la informacion disponible.

| Benchmark | Resultado (modelo base v3.1) |
|---|---|
| Media de 15 benchmarks | 70,26 % |
| GPQA Diamond | 70,20 % |
| LiveCodeBench v6 | 39,43 % |
| LiveCodeBench v6 (Easy) | 90,70 % |
| BFCL V4 AST | 83,67 % |
| Industrial PLC/CNC | 96,67 % |

## Requisitos de hardware

- VRAM estimada: la variante GGUF esta disenada para ejecutarse en GPU de 16 GB de VRAM, segun la model card; las variantes NVFP4 (~20,9 GiB) y W4A16-AWQ (~19,5 GiB) caben en una unica GPU de 24 GB.
- GPU recomendadas: GPU consumer de 16 GB o superior para la variante GGUF; RTX 4090 (24 GB) para NVFP4 y AWQ; A100 y H100 para despliegues de mayor concurrencia o precision completa.
- Cabe en GPU consumer: si, en tarjetas de 16 GB con la variante GGUF y en tarjetas de 24 GB con NVFP4 o AWQ.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (etiquetas declaradas en el repositorio), vLLM para las variantes AWQ y NVFP4, y transformers para los pesos completos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos directos con modelos de la misma categoria en la informacion proporcionada. La siguiente tabla recoge unicamente los datos verificables del modelo y deja constancia de la ausencia de datos para las alternativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Icelandic-v3.2 | 35,5 B totales / 3 B activos | no disponible | Apache 2.0 | GGUF, BF16, NVFP4, AWQ en Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los benchmarks reportados (GPQA Diamond 70,20 %, LiveCodeBench v6 39,43 %, PLC/CNC 96,67 %) corresponden al modelo base v3.1 y no han sido verificados de forma independiente para esta cuantizacion GGUF; la compresion puede degradar el rendimiento, especialmente en tareas de codigo y matematicas.
- La cobertura linguistica se limita a ingles, islandes y finlandes; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar despliegues que dependan de ventanas largas.
- Riesgo de alucinacion inherente a los modelos generativos, agravado en dominios de seguridad funcional donde una recomendacion incorrecta (por ejemplo, en calculos SIL o PLe) puede tener consecuencias fisicas; toda salida debe ser revisada por un ingeniero certificado.
- La model card emplea afirmaciones de marketing no verificadas (por ejemplo, "cero errores de sintaxis" en tool calling o "100 % de preservacion" de capacidades); conviene tratarlas como declaraciones del autor y no como hechos medidos.
- El modelo se distribuye con la etiqueta "uncensored", lo que implica ausencia de filtros de seguridad en las respuestas; no es adecuado para exposicion directa a usuarios finales sin capas de moderacion adicionales.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el cumplimiento normativo en entornos industriales (ISO 13849-1, IEC 61508) requiere validacion humana y no puede delegarse en las salidas del modelo.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-GGUF
- Pesos BF16 maestros: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Icelandic-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-NVFP4
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Icelandic-v3.2-W4A16-AWQ
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Ejemplos de uso: https://huggingface.co/spaces/kataguru/Kataguru-Sceptic-35B-Usage-Examples
- Guia del autor: https://huggingface.co/spaces/kataguru/Kataguru-Sovereign-AI-Guide
- Perfil del autor: https://huggingface.co/kataguru
