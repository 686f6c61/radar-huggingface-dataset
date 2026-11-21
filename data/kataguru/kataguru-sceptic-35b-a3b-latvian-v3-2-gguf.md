# kataguru/Kataguru-Sceptic-35B-A3B-Latvian-v3.2-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Latvian-v3.2-GGUF es una cuantización en formato GGUF del modelo Kataguru-Sceptic-35B-A3B-Latvian-v3.2, desarrollado por Datasein Oy (Finlandia) bajo la dirección técnica de Jari Katajisto. Se trata de un modelo de mezcla de expertos (MoE) de 35.505.251.456 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, construido sobre la base Kataguru-Sceptic-35B-A3B-v3.1. Su especialización principal es la programación industrial (PLC y CNC) y el desarrollo de software de sistemas, con un enfoque soberano en lenguas bálticas: letón (lv), finés (fi) e inglés (en).

El modelo resuelve un nicho muy concreto: la generación, auditoría y depuración de código de automatización industrial (IEC 61131-3, TwinCAT 3, Siemens SCL, G-code Fanuc/Sinumerik/Heidenhain) directamente en letón, además de programación de sistemas en C++20, Rust, C embebido y Python 3.12. Incorpora un codificador visual ViT de 27 capas que le permite leer esquemas eléctricos, diagramas P&ID y pantallas HMI, y un motor de tool calling basado en AST con soporte de cadenas de herramientas multi-paso.

Esta versión GGUF es relevante porque empaqueta el modelo en tres variantes de cuantización (APEX-Small, APEX-Medium y APEX-Good) más un proyector multimodal (mmproj), calibradas con imatrix sobre datos en letón, lo que permite ejecutarlo en GPUs de 16 GB. La licencia Apache 2.0 y la compatibilidad con llama.cpp, LM Studio y Ollama facilitan su despliegue en entornos industriales con hardware limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 40 capas, 256 expertos por capa (254 núcleo congelados + 2 expertos nativos en letón), Top-8 por token, con codificador visual ViT de 27 capas |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3.000 millones por token (configuración A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con tres variantes APEX (APEX-Small, APEX-Medium, APEX-Good) calibradas con imatrix en letón; el suite oficial incluye además BF16, NVFP4 y W4A16-AWQ |
| Idiomas soportados | Inglés (en), letón (lv), finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de mezcla de expertos con 40 capas y 256 expertos por capa, de los cuales 254 corresponden al núcleo congelado heredado de Kataguru-Sceptic-35B-A3B-v3.1 y 2 son expertos nativos en letón añadidos en esta versión. En cada paso de token se activan los 8 expertos más relevantes (Top-8), de modo que los expertos letones coactivan junto con los del núcleo congelado, preservando las capacidades originales de razonamiento científico, código competitivo y tool calling mientras se añade competencia nativa en letón. El modelo base reporta un 70,26 % de media en 15 benchmarks, 70,20 % en GPQA Diamond, 39,43 % en LiveCodeBench v6 y 83,67 % en BFCL V4 AST.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La model card menciona que los expertos #0..#253 están congelados al 100 % durante el ajuste, lo que sugiere una estrategia de expansión de vocabulario y capacidades lingüísticas sin reentrenamiento del núcleo. La cuantización GGUF se ha calibrado con imatrix específicamente sobre datos en letón, lo que mejora la fidelidad de la cuantización para ese idioma frente a una calibración genérica. El modelo incluye un codificador visual ViT de 27 capas para entrada image-text-to-text.

## Capacidades

- Generación de código industrial PLC: IEC 61131-3, Beckhoff TwinCAT 3 Structured Text (máquinas de estado con CASE, control de movimiento MC_MoveAbsolute, MC_Power, MC_GearIn, relojes distribuidos EtherCAT, diagnóstico ADS).
- Programación Siemens TIA Portal: SCL y S7-1500, bloques de función FB/FC, bloques de datos de instancia DB, control PID con PID_Compact y diagnóstico PROFINET IO.
- Generación y auditoría de G-code CNC para Fanuc, Siemens Sinumerik 840D y Heidenhain: compensación de radio de herramienta G41/G42, offsets de trabajo G54–G59, ciclos fijos G71/G76/G81–G89, verificación de carga de husillo y avance, y auditoría de trayectorias sin colisiones.
- Diagnóstico de protocolos industriales y SCADA/MES: OPC UA (IEC 62541), Modbus TCP/RTU, EtherCAT, PROFINET, CANopen, SQL Server y WCF.
- Conocimiento de seguridad funcional y normativa de máquinas: ISO 13849-1 (PLa–PLe), IEC 62061 / IEC 61508 (SIL 1–SIL 3), Safe Torque Off (STO), enclavamientos de parada de emergencia de doble canal y watchdogs.
- Programación de sistemas y embebidos: C++20, Rust, C para RTOS, Python 3.12, C#/.NET, SQL y Bash/Linux, con énfasis en concurrencia, seguridad de memoria y endurecimiento de kernel/red.
- Tool calling y function calling con motor AST determinista y cadenas multi-paso (BFCL V4 AST: 83,67 %, sin errores de sintaxis reportados).
- Capacidades agénticas y de razonamiento multi-paso.
- Visión multimodal: lectura de diagramas P&ID, esquemas eléctricos, pantallas de error HMI y gráficos de ingeniería mediante el codificador ViT de 27 capas.
- Capacidades STEM, matemáticas y razonamiento científico (GPQA Diamond: 70,20 %).
- Traducción entre inglés, letón y finés.
- Modo multi-rol conmutables por petición sin reinicio del servidor (6 en 1).
- Modelo sin censura declarada (tag "uncensored").
- Soporte de RAG.

## Casos de uso

- Generación de lógica PLC en TwinCAT 3: el modelo puede producir máquinas de estado en Structured Text con llamadas a MC_MoveAbsolute y MC_Power, y añadir diagnóstico ADS, adecuado para ingenieros de automatización que trabajan en letón o finés y necesitan código listo para compilar en el entorno Beckhoff.
- Migración y auditoría de código Siemens SCL: dado un bloque de función existente en TIA Portal, el modelo puede revisar el uso de bloques de datos de instancia, verificar la configuración de PID_Compact y señalar problemas de diagnóstico PROFINET, lo que reduce el tiempo de revisión en proyectos de integración.
- Post-procesado y verificación de G-code CNC: el modelo puede auditar programas de mecanizado de múltiples ejes para Fanuc o Sinumerik 840D, comprobar la compensación G41/G42 y los offsets G54–G59, y detectar posibles colisiones en la trayectoria antes de enviar el programa a máquina.
- Asistencia en diagnóstico de planta desde pantallas HMI: gracias al codificador visual, el operario puede enviar una captura de una pantalla de error HMI o un esquema eléctrico y obtener una interpretación del fallo junto con pasos de diagnóstico sobre OPC UA o Modbus TCP.
- Desarrollo de software embebido y de sistemas en Rust/C++20: el modelo puede generar y revisar código de concurrencia y seguridad de memoria para RTOS, así como scripts de endurecimiento de red en Bash/Linux, adecuado para equipos de software industrial que comparten pila tecnológica con el PLC.
- Agente de soporte técnico multi-paso con tool calling: integrado en un pipeline agéntico, el modelo puede encadenar llamadas a herramientas (consulta de telemetría en SQL Server, lectura de registros OPC UA, consulta de documentación) para resolver incidencias de producción, gracias a su motor AST de tool calling.
- Traducción técnica inglés-letón-finés de documentación de seguridad funcional: el modelo puede traducir manuales y evaluaciones de conformidad ISO 13849-1 e IEC 62061 manteniendo terminología normativa, útil para fabricantes que operan en los mercados bálticos y nórdicos.
- Generación de código de sistemas en Python 3.12 y C#/.NET para integración MES: el modelo puede escribir conectores de telemetría y scripts de integración con SQL Server y WCF, adecuado para equipos de digitalización de planta.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo base Kataguru-Sceptic-35B-A3B v3.1, no a esta cuantización GGUF concreta. No se han publicado resultados de benchmarks específicos de las variantes APEX en la información disponible.

| Benchmark | Resultado reportado (modelo base v3.1) |
|---|---|
| Media de 15 benchmarks | 70,26 % |
| GPQA Diamond | 70,20 % |
| LiveCodeBench v6 | 39,43 % |
| LiveCodeBench v6 (Easy) | 90,70 % |
| BFCL V4 AST | 83,67 % |
| Industrial PLC/CNC | 96,67 % |

## Requisitos de hardware

- VRAM estimada: las variantes GGUF APEX están diseñadas para ejecutarse en GPUs de 16 GB según la model card; el repositorio completo ocupa 45,4 GB, por lo que la variante APEX-Good será la de mayor tamaño y las variantes Small y Medium requerirán menos VRAM.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB) y GPUs de 16 GB en general para las variantes APEX; el suite oficial incluye además NVFP4 (~20,9 GiB) y W4A16-AWQ (~19,5 GiB) para GPUs de 24 GB, y BF16 (~67,5 GB) para configuraciones multi-GPU o A100/H100.
- Cabe en GPU de consumo: sí, en GPUs de 16 GB con las variantes APEX-Small y APEX-Medium, y en GPUs de 24 GB con las variantes NVFP4 y AWQ del suite oficial.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (etiquetas declaradas en el modelo); para las variantes no GGUF del suite, vLLM (W4A16-AWQ) y formatos nativos NVFP4 en Blackwell.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Latvian-v3.2-GGUF | 35,5B totales / ~3B activos | no disponible | Apache 2.0 | GGUF | Especializado en PLC/CNC y letón; multimodal; tool calling AST |
| Kataguru-Sceptic-35B-A3B-v3.1 | 35,5B totales / ~3B activos | no disponible | Apache 2.0 | safetensors (base) | Modelo base sin expertos nativos en letón |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Los benchmarks reportados corresponden al modelo base v3.1; no hay datos publicados de las variantes GGUF APEX, por lo que puede existir degradación por cuantización, especialmente en las variantes de menor tamaño.
- El modelo está especializado en un nicho muy concreto (automatización industrial y lenguas bálticas); su rendimiento en dominios generales puede ser inferior al de modelos de propósito general del mismo tamaño.
- Riesgo de alucinación en código industrial: la generación de G-code o lógica PLC incorrecta puede tener consecuencias físicas graves; se recomienda validación humana y simulación antes de desplegar en máquina real.
- La model card declara el tag "uncensored", lo que implica que el modelo puede no rechazar solicitudes potencialmente dañinas; no es adecuado para aplicaciones de cara al público sin filtros adicionales.
- Cobertura lingüística limitada a inglés, letón y finés; no se declara soporte de castellano ni de otros idiomas.
- Longitud de contexto no disponible en la información proporcionada; no se puede garantizar el rendimiento en conversaciones de contexto largo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece soporte ni compromisos de mantenimiento.
- El repositorio ocupa 45,4 GB, lo que requiere planificación de almacenamiento y ancho de banda para su descarga.
- La fecha de creación del repositorio (2026-11-09) y la información de la model card deben verificarse contra la fuente original antes de su uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Latvian-v3.2-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Latvian-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Latvian-v3.2-NVFP4
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Latvian-v3.2-W4A16-AWQ
- Ejemplos de uso: https://huggingface.co/spaces/kataguru/Kataguru-Sceptic-35B-Usage-Examples
- Guía de IA soberana: https://huggingface.co/spaces/kataguru/Kataguru-Sovereign-AI-Guide
- Perfil del autor: https://huggingface.co/kataguru
