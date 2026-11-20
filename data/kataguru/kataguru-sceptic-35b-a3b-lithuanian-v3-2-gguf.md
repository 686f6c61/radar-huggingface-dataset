# kataguru/Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-GGUF es la distribucion en formato GGUF del modelo Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2, publicado por Datasein Oy (Finlandia) bajo la direccion tecnica de Jari Katajisto. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 35.505.251.456 parametros totales y 3B parametros activos por token, construido sobre el modelo base Kataguru-Sceptic-35B-A3B-v3.1. Su especializacion principal es la generacion y auditoria de codigo de automatizacion industrial (PLC y CNC) en lituano, fines y ingles, ademas de ingenieria de sistemas y razonamiento STEM.

La innovacion declarada por el autor es una arquitectura de 256 expertos por capa (254 congelados del nucleo Sceptic mas 2 expertos nativos lituanos), lo que permite conservar las capacidades del modelo base mientras se anade competencia en lituano sin reentrenar el nucleo. El modelo se distribuye con un encoder de vision ViT de 27 capas y un motor de tool calling basado en AST, lo que lo situa en la categoria image-text-to-text.

Esta version concreta es la cuantizacion GGUF calibrada con imatrix sobre un corpus lituano, publicada en tres variantes (APEX-Small, APEX-Medium y APEX-Good) mas el proyector multimodal mmproj, pensada para ejecucion en llama.cpp, LM Studio y Ollama. El repositorio ocupa 89,8 GB y acumula 1.102 descargas desde su publicacion en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 40 capas, 256 expertos por capa (254 congelados + 2 nativos lituanos), Top-8 por token, encoder de vision ViT de 27 capas |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | 3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en tres variantes APEX (APEX-Small, APEX-Medium, APEX-Good), calibradas con imatrix sobre corpus lituano; el ecosistema del modelo incluye ademas BF16, NVFP4 y W4A16-AWQ en repositorios separados |
| Idiomas soportados | Ingles (en), lituano (lt), fines (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el repositorio de pesos completos) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE de 40 capas con 256 expertos por capa y enrutamiento Top-8 por token. La particularidad del diseno v3.2 es que los expertos #0 a #253 permanecen congelados respecto al modelo base Kataguru-Sceptic-35B-A3B-v3.1, mientras que los expertos #254 y #255 se anaden como expertos nativos lituanos. Segun el autor, los 254 expertos del nucleo coactivan en cada paso de token junto a los dos expertos lituanos, de modo que el modelo conserva las capacidades del nucleo (razonamiento cientifico, codigo competitivo, tool calling) mientras incorpora competencia en lituano. Los pesos totales del modelo ascienden a 35,5B parametros con 3B activos por token, lo que reduce el coste computacional por inferencia respecto a un modelo denso del mismo tamano.

El autor declara un encoder de vision ViT de 27 capas integrado para tareas de vision-lenguaje (lectura de diagramas P&ID, esquemas electricos, pantallas HMI y graficos de ingenieria) y un motor de tool calling basado en AST con formato `<tool_call>`. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa. Las cuantizaciones GGUF se han calibrado con imatrix sobre un corpus especifico de lituano, lo que segun el autor mejora la fidelidad de la cuantizacion para ese idioma.

## Capacidades

- Generacion de codigo de automatizacion industrial: IEC 61131-3 Structured Text para Beckhoff TwinCAT 3 (maquinas de estado con CASE, control de movimiento MC_MoveAbsolute, MC_Power, MC_GearIn, relojes distribuidos EtherCAT, diagnostico ADS) y Siemens TIA Portal SCL/S7-1500 (bloques FB/FC, DB de instancia, PID_Compact, diagnostico PROFINET).
- Generacion y auditoria de G-code CNC para Fanuc, Siemens Sinumerik 840D y Heidenhain: compensacion de radio de herramienta G41/G42, offsets de trabajo G54-G59, ciclos fijos G71/G76/G81-G89, verificacion de carga de husillo y avance, y deteccion de colisiones en trayectorias.
- Protocolos industriales y diagnostico SCADA/MES: OPC UA (IEC 62541), Modbus TCP/RTU, EtherCAT, PROFINET, CANopen y telemetria SQL Server/WCF.
- Seguridad funcional y normativa de maquinaria: ISO 13849-1 (PLa-PLe), IEC 62061 / IEC 61508 (SIL 1-SIL 3), Safe Torque Off (STO), enclavamientos de parada de emergencia de doble canal y watchdogs.
- Ingenieria de sistemas y software embebido en C++20, Rust, C para RTOS, Python 3.12, C#/.NET, SQL y Bash/Linux, con enfasis en concurrencia y seguridad de memoria.
- Tool calling y function calling con cadenas de llamadas en formato `<tool_call>` AST y modo agente multi-paso.
- Vision-lenguaje: lectura de diagramas P&ID, esquemas de cableado electrico, pantallas de error HMI y graficos de ingenieria mediante el encoder ViT de 27 capas.
- Razonamiento STEM y matematicas, con resultados declarados en GPQA Diamond y LiveCodeBench v6.
- Capacidades multilingues en lituano, fines e ingles, incluyendo traduccion.
- Modo de razonamiento y modo sin censura (uncensored) segun los tags del autor.

## Casos de uso

- Generacion de logica PLC en produccion: el modelo puede redactar bloques de Structured Text para TwinCAT 3 o SCL para S7-1500 a partir de una descripcion funcional, incluyendo maquinas de estado y bloques de control PID, lo que acelera el desarrollo de automatizacion en plantas con documentacion en lituano.
- Auditoria de seguridad funcional: dado un esquema de enclavamientos, el modelo puede revisar el cumplimiento de ISO 13849-1 e IEC 62061, identificar canales unicos sin redundancia y proponer arquitecturas con la categoria PL o SIL requerida.
- Post-procesado y validacion de G-code CNC: el modelo puede revisar programas de mecanizado de varias maquinas (Fanuc, Sinumerik, Heidenhain), detectar compensaciones de radio mal aplicadas o colisiones de trayectoria y verificar que los ciclos fijos sean coherentes con el material y la herramienta.
- Diagnostico de redes industriales: con capacidad de razonar sobre OPC UA, Modbus, EtherCAT y PROFINET, puede interpretar trazas de error y proponer pasos de resolucion en entornos SCADA/MES, incluida la consulta de telemetria en SQL Server.
- Asistente de ingenieria multimodal en planta: con el encoder de vision, el modelo puede leer una pantalla de error de HMI o un esquema electrico y generar un diagnostico o un procedimiento de reparacion en lituano o fines.
- Agente de soporte tecnico multi-paso: gracias al tool calling en formato AST, puede encadenar consultas a una base de datos de manuales, a un sistema de tickets y a un repositorio de codigo para resolver incidencias de automatizacion sin intervencion humana.
- Generacion de codigo de sistemas y embebido: puede producir codigo Rust o C++20 para tareas de concurrencia y seguridad de memoria, integrable en pipelines de revision de codigo o en herramientas de CI/CD.
- Traduccion tecnica lituano-ingles-fines: puede traducir documentacion de automatizacion, manuales de PLC y procedimientos de seguridad manteniendo terminologia tecnica especializada.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card son los siguientes. No se especifica en la informacion disponible la metodologia exacta de cada evaluacion ni el conjunto de comparacion.

| Benchmark | Resultado |
|---|---|
| Media de 15 benchmarks (modelo base v3.1) | 70,26 % |
| GPQA Diamond | 70,20 % |
| LiveCodeBench v6 | 39,43 % |
| LiveCodeBench v6 (Easy) | 90,70 % |
| BFCL V4 AST (tool calling) | 83,67 % |
| Industrial PLC/CNC | 96,67 % |

## Requisitos de hardware

- VRAM estimada para inferencia: el autor indica que las variantes GGUF APEX estan preparadas para GPU de 16 GB. El repositorio completo ocupa 89,8 GB, por lo que la variante APEX-Small es la que cabe en 16 GB; APEX-Medium y APEX-Good requieren mas VRAM, aunque no se detalla el tamano exacto de cada archivo en la informacion disponible.
- GPU recomendadas: no disponible de forma explicita. Por el tamano de las variantes, una RTX 4090 (24 GB) o una RTX 4080 (16 GB) pueden ejecutar la variante APEX-Small; para las variantes mayores se recomendaria una A100 40 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: si, al menos la variante APEX-Small en 16 GB. El autor menciona ademas que las variantes NVFP4 y W4A16-AWQ del modelo completo caben en una unica GPU de 24 GB.
- Opciones de despliegue: llama.cpp, LM Studio y Ollama segun los tags del autor; el repositorio GGUF incluye el proyector mmproj para inferencia multimodal.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmark de modelos comparables en la informacion proporcionada. La comparativa se limita a los datos declarados por el autor para el modelo base y las variantes del propio ecosistema.

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-GGUF | 35,5B | 3B | no disponible | Apache 2.0 | GGUF |
| Kataguru-Sceptic-35B-A3B-v3.1 (base) | 35,5B | 3B | no disponible | Apache 2.0 | safetensors |
| Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2 (BF16) | 35,5B | 3B | no disponible | Apache 2.0 | safetensors |
| Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-NVFP4 | 35,5B | 3B | no disponible | Apache 2.0 | NVFP4 |
| Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-W4A16-AWQ | 35,5B | 3B | no disponible | Apache 2.0 | AWQ |

## Limitaciones y advertencias

- Los benchmarks declarados proceden de la model card del autor y no se acompanan de la metodologia detallada ni de artefactos de evaluacion verificables; conviene tratarlos con cautela hasta una validacion independiente.
- El modelo esta especializado en automatizacion industrial y sistemas, con un sesgo de dominio claro; su rendimiento en tareas generales fuera de ese ambito puede ser inferior al de modelos de proposito general del mismo tamano.
- El soporte de lituano y fines es declarado por el autor, pero no se aportan metricas especificas por idioma en la informacion disponible.
- Riesgo de alucinacion en codigo de seguridad funcional: la generacion de logica PLC o de enclavamientos de seguridad debe ser revisada por un ingeniero certificado antes de su despliegue en maquinaria real.
- El tag "uncensored" implica que el modelo puede no rechazar peticiones que otros modelos filtrarian; en entornos de produccion conviene anadir capas de moderacion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y el autor no ofrece soporte formal indicado en la informacion disponible.
- La longitud de contexto no se especifica, lo que impide planificar casos de uso que dependan de ventanas largas.
- El repositorio GGUF ocupa 89,8 GB y contiene varias variantes; es necesario seleccionar el archivo adecuado segun la VRAM disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-GGUF
- Pesos completos BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-NVFP4
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-W4A16-AWQ
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Ejemplos de uso: https://huggingface.co/spaces/kataguru/Kataguru-Sceptic-35B-Usage-Examples
- Guia de IA soberana: https://huggingface.co/spaces/kataguru/Kataguru-Sovereign-AI-Guide
- Perfil del autor: https://huggingface.co/kataguru
