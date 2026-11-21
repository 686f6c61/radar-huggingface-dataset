# kataguru/Kataguru-Sceptic-35B-A3B-Welsh-v3.2-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Welsh-v3.2-GGUF es la distribucion cuantizada en formato GGUF del modelo Kataguru-Sceptic-35B-A3B-Welsh-v3.2, publicado por Datasein Oy (Finlandia) bajo la direccion tecnica de Jari Katajisto. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 35.505.251.456 parametros totales y aproximadamente 3.000 millones de parametros activos por token, construido sobre el modelo base Kataguru-Sceptic-35B-A3B-v3.1. Su especializacion principal es la generacion y auditoria de codigo industrial (PLC y CNC), software de sistemas y razonamiento STEM, con un enfoque declarado en automatizacion industrial.

La particularidad de esta version es la incorporacion de dos expertos nativos adicionales para el idioma gales (Cymraeg), que se suman a los 254 expertos congelados del nucleo original, alcanzando 256 expertos por capa en las 40 capas del modelo. El modelo conserva ademas un codificador de vision de 27 capas para entrada image-text-to-text, un motor de tool calling basado en AST y capacidades multimodales. El repositorio distribuye pesos GGUF calibrados con imatrix gales en tres variantes de calidad (APEX-Small, APEX-Medium y APEX-Good) junto con el proyector multimodal mmproj.

Esta ficha cubre exclusivamente la distribucion GGUF. El modelo esta publicado bajo licencia Apache 2.0, lo que permite uso comercial, y esta disenado para desplegarse en GPUs de consumo de 16 GB o superiores segun la cuantizacion elegida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, 40 capas, 256 expertos por capa, Top-8 por token; codificador de vision ViT de 27 capas |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3.000 millones por token (denominacion A3B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF en variantes APEX-Small, APEX-Medium y APEX-Good, calibradas con imatrix en gales; el ecosistema incluye tambien BF16, NVFP4 y W4A16-AWQ en otros repositorios |
| Idiomas soportados | Ingles (en), gales (cy), finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con proyector mmproj para vision); el modelo base tambien se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture-of-Experts con 40 capas y 256 expertos por capa, de los cuales se activan los 8 mejores por cada token (Top-8). De esos 256 expertos, 254 corresponden al nucleo congelado heredado de Kataguru-Sceptic-35B-A3B-v3.1, que aporta las capacidades de razonamiento cientifico, codigo competitivo, tool calling agentico y codigo industrial PLC/CNC. Los dos expertos restantes (#254 y #255) son expertos nativos en gales anadidos en esta version. Segun la model card, los 254 expertos del nucleo se coactivan en cada paso de token junto con los dos expertos galeses, de modo que la especializacion linguistica no sustituye las capacidades originales sino que se superpone a ellas.

El modelo integra un codificador de vision ViT de 27 capas que le permite procesar imagenes (diagramas P&ID, esquemas electricos, pantallas HMI) y un motor de tool calling basado en AST. La distribucion GGUF de este repositorio esta calibrada con imatrix sobre datos en gales, lo que segun el autor mejora la fidelidad de la cuantizacion para ese idioma. No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset ni sobre el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de codigo industrial IEC 61131-3: Structured Text para Beckhoff TwinCAT 3 (maquinas de estado con CASE, control de movimiento MC_MoveAbsolute, MC_Power, MC_GearIn, relojes distribuidos EtherCAT, diagnostico ADS) y SCL para Siemens TIA Portal / S7-1500 (bloques FB/FC, DB de instancia, PID_Compact, diagnostico PROFINET).
- Generacion y auditoria de G-code CNC para Fanuc, Siemens Sinumerik 840D y Heidenhain: compensacion de radio de herramienta G41/G42, offsets G54-G59, ciclos fijos G71/G76/G81-G89, verificacion de carga de husillo y avance, y auditoria de trayectorias sin colisiones.
- Diagnostico de protocolos industriales y fieldbuses: OPC UA (IEC 62541), Modbus TCP/RTU, EtherCAT, PROFINET, CANopen, y telemetria de produccion sobre SQL Server y WCF.
- Conocimiento de estandares de seguridad funcional: ISO 13849-1 (PLa-PLe), IEC 62061 / IEC 61508 (SIL 1-SIL 3), Safe Torque Off (STO), enclavamientos de parada de emergencia de dos canales y watchdogs.
- Programacion de sistemas y embebidos: C++20, Rust, C para RTOS, Python 3.12, C#/.NET, SQL y Bash/Linux, con enfasis en concurrencia, seguridad de memoria y hardening de red.
- Tool calling y function calling con cadenas de llamadas en formato `<tool_call>` basadas en AST, con soporte declarado de agentes multi-paso.
- Vision multimodal: lectura de diagramas P&ID, esquemas de cableado electrico, pantallas de error de HMI y graficos de ingenieria mediante el codificador ViT de 27 capas.
- Capacidades multilingues en ingles, gales y finlandes, incluyendo generacion de codigo industrial directamente en gales.
- Razonamiento STEM y matematicas, con soporte declarado de modo de razonamiento extendido.
- Modelo declarado como "uncensored" por el autor, sin filtros de rechazo adicionales segun la model card.
- Soporte de RAG y traduccion.

## Casos de uso

- Generacion de logica PLC en produccion: el modelo puede redactar bloques de Structured Text para TwinCAT 3 o SCL para TIA Portal a partir de una descripcion funcional, incluyendo maquinas de estado deterministas y bloques de control PID, lo que acelera el desarrollo de automatizacion y reduce errores de sintaxis en IEC 61131-3.
- Auditoria de seguridad funcional: dado un esquema de enclavamientos, el modelo puede revisar el cumplimiento de ISO 13849-1 o IEC 61508, verificar la categoria de parada de emergencia y senalar inconsistencias en la implementacion de STO o en los watchdogs.
- Post-procesado y validacion de G-code: integrado en un pipeline de CAM, el modelo puede revisar programas de mecanizado multi-eje, comprobar compensaciones G41/G42 y offsets G54-G59, y detectar trayectorias con riesgo de colision antes de enviarlas a maquina.
- Asistencia en diagnostico de planta: con entrada de imagen de pantallas HMI o esquemas electricos, el modelo puede interpretar el estado de una linea de produccion, correlacionar errores de PROFINET o EtherCAT y proponer pasos de resolucion sobre OPC UA o Modbus.
- Desarrollo de software de sistemas embebidos: generacion de codigo Rust, C++20 o C para RTOS con requisitos de seguridad de memoria y concurrencia, adecuado para firmware industrial y utilidades de red.
- Agentes de automatizacion con tool calling: el modelo puede orquestar cadenas de llamadas a herramientas (consulta de telemetria, lectura de registros OPC UA, generacion de informes) en flujos multi-paso dentro de un asistente de operaciones.
- Localizacion tecnica al gales: traduccion y redaccion de documentacion tecnica, manuales de maquinaria y comentarios de codigo en gales, aprovechando los expertos nativos anadidos en esta version.
- Despliegue en estaciones de trabajo con GPU de consumo: las variantes GGUF APEX permiten ejecutar el modelo en GPUs de 16 GB, lo que facilita su uso en entornos de ingenieria sin infraestructura de centro de datos.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card y corresponden al modelo base Kataguru Sceptic 35B-A3B v3.1, no a mediciones independientes de esta distribucion GGUF.

| Benchmark | Resultado declarado |
|---|---|
| Media de 15 benchmarks | 70,26 % |
| GPQA Diamond | 70,20 % |
| LiveCodeBench v6 | 39,43 % |
| LiveCodeBench v6 (Easy) | 90,70 % |
| BFCL V4 AST | 83,67 % |
| Industrial PLC/CNC | 96,67 % |

No se han publicado resultados de benchmarks independientes para la variante GGUF en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el autor indica que las variantes GGUF APEX estan preparadas para GPUs de 16 GB; el tamano total del repositorio es de 45,4 GB, por lo que la variante concreta determina el consumo (APEX-Small sera la mas ligera y APEX-Good la de mayor fidelidad y tamano).
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090 y GPUs profesionales como A100 o H100 para las variantes de mayor tamano o para mayor throughput. El ecosistema incluye ademas variantes NVFP4 (aproximadamente 20,9 GiB, pensada para una unica GPU de 24 GB en arquitectura Blackwell) y W4A16-AWQ (aproximadamente 19,5 GiB, tambien para una GPU de 24 GB).
- Cabe en GPU de consumo: si, en GPUs de 16 GB o superiores segun la variante APEX elegida.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y vLLM (este ultimo para las variantes AWQ y NVFP4 del ecosistema, no para GGUF). El proyector mmproj debe cargarse junto al modelo para habilitar la vision.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos verificables sobre modelos comparables en la informacion proporcionada. La model card no incluye una comparativa con alternativas de la misma categoria (MoE de aproximadamente 35B con especializacion industrial), por lo que no es posible establecer una tabla comparativa fiable sin inventar cifras.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Welsh-v3.2-GGUF | 35,5B totales / ~3B activos | No disponible | Apache 2.0 | Hugging Face (GGUF, BF16, NVFP4, AWQ) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los benchmarks declarados proceden del autor del modelo y no han sido verificados de forma independiente; deben tratarse como indicativos.
- El modelo se declara explicitamente como "uncensored", lo que implica que puede generar contenido sin los filtros de rechazo habituales; en produccion es recomendable anadir capas de moderacion propias.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente relevante en dominios regulados como seguridad funcional: las recomendaciones sobre ISO 13849-1 o IEC 61508 deben validarse siempre por un ingeniero certificado.
- El codigo industrial generado (PLC, CNC, G-code) debe revisarse y probarse antes de su despliegue en maquinaria real; un error en G-code o en logica de seguridad puede causar danos fisicos.
- La cobertura linguistica se limita a ingles, gales y finlandes; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- La longitud de contexto no esta especificada en la informacion disponible, lo que dificulta planificar casos de uso con documentos largos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo en entornos de produccion.
- Las variantes GGUF con cuantizacion agresiva (APEX-Small) pueden degradar la calidad en tareas de razonamiento y generacion de codigo respecto a los pesos BF16.
- No se dispone de informacion sobre sesgos especificos, composicion del dataset de entrenamiento ni evaluaciones de robustez.

## Enlaces

- Repositorio GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Welsh-v3.2-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Pesos BF16 maestros: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Welsh-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Welsh-v3.2-NVFP4
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Welsh-v3.2-W4A16-AWQ
- Ejemplos de uso: https://huggingface.co/spaces/kataguru/Kataguru-Sceptic-35B-Usage-Examples
- Guia del autor: https://huggingface.co/spaces/kataguru/Kataguru-Sovereign-AI-Guide
- Perfil del autor: https://huggingface.co/kataguru
