# kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Georgian-v3.2 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Datasein Oy (Finlandia), con Jari Katajisto como arquitecto jefe. Se trata de un fine-tune soberano para georgiano (ქართული ენა) construido sobre el modelo base Kataguru-Sceptic-35B-A3B-v3.1, que a su vez deriva de la familia Qwen3.5-MoE. El modelo combina 254 expertos congelados del núcleo original con 2 expertos nativos nuevos para georgiano, alcanzando 256 expertos por capa en 40 capas, con 35.505.251.456 parámetros totales y 3B parámetros activos por token.

La propuesta del modelo es inusual: se posiciona como un "coder industrial" capaz de generar y auditar código PLC/CNC (IEC 61131-3, G-code, TwinCAT, Siemens SCL), código de sistemas (Rust, C++20, Python, C#), y de operar con visión multimodal (lectura de esquemas P&ID, diagramas eléctricos, pantallas HMI) y tool calling agéntico, todo ello manteniendo el georgiano como idioma de trabajo principal junto con finlandés e inglés. El autor declara un 96,67 % en un benchmark propio de PLC/CNC y un 83,67 % en BFCL V4 AST.

Esta ficha corresponde a la variante GGUF del modelo, publicada en formato APEX-Trio (tres niveles de cuantización más un proyector multimodal `mmproj`), pensada para despliegue en GPUs de consumo a partir de 16 GB de VRAM mediante llama.cpp, LM Studio u Ollama. El repo ocupa 45,4 GB y acumula 969 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3.5-MoE), 40 capas, 256 expertos por capa (254 congelados + 2 nativos georgianos), Top-8 por token |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | 3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF APEX-Trio (APEX-Small, APEX-Medium, APEX-Good) con calibración imatrix; también existen NVFP4 y W4A16-AWQ en repos separados |
| Idiomas soportados | Georgiano (ka), finlandés (fi), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); safetensors BF16 en el repo maestro; NVFP4 y AWQ en repos hermanos |
| Vision | Codificador ViT de 27 capas + proyector `mmproj` incluido |
| Modelo base | kataguru/Kataguru-Sceptic-35B-A3B-v3.1 |
| Tamano del repo | 45,4 GB |

## Arquitectura y entrenamiento

El modelo es un transformer Mixture-of-Experts con 40 capas y 256 expertos por capa, de los cuales se activan 8 por token (Top-8). La innovación principal respecto al modelo base es la estrategia de expansión de expertos: los 254 expertos originales del núcleo Sceptic (identificados como #0–#253) permanecen congelados, y se añaden dos expertos nuevos (#254 y #255) entrenados específicamente para georgiano. Dado que los expertos congelados co-activan en cada paso de token junto a los nuevos, el modelo preserva las capacidades del original (razonamiento científico, código competitivo, tool calling agéntico y visión) mientras incorpora competencia nativa en georgiano.

El modelo base v3.1 declara métricas de referencia como un 70,26 % de media en 15 benchmarks, 70,20 % en GPQA Diamond, 39,43 % en LiveCodeBench v6, 83,67 % en BFCL V4 AST y 96,67 % en un benchmark propio de PLC/CNC. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. El modelo incorpora un codificador de visión ViT de 27 capas y un motor de tool calling basado en AST `<tool_call>`, que el autor describe como libre de errores de sintaxis en sus pruebas. La variante GGUF emplea calibración imatrix específica para georgiano, orientada a preservar la calidad de cuantización en ese idioma.

## Capacidades

- Generación de texto, razonamiento científico y matemático (STEM), con soporte declarado de modo multi-paso.
- Programación industrial: IEC 61131-3 (Structured Text para Beckhoff TwinCAT 3 y Siemens SCL/S7-1500), G-code CNC (Fanuc, Sinumerik 840D, Heidenhain), con compensación de radio de herramienta, offsets de trabajo y ciclos fijos.
- Programación de sistemas y aplicaciones: C++20, Rust, C embebido/RTOS, Python 3.12, C#/.NET, SQL y Bash/Linux.
- Diagnóstico de protocolos industriales: OPC UA (IEC 62541), Modbus TCP/RTU, EtherCAT, PROFINET, CANopen.
- Conocimiento de normas de seguridad funcional: ISO 13849-1 (PLa–PLe), IEC 62061 / IEC 61508 (SIL 1–SIL 3), STO, enclavamientos de parada de emergencia.
- Tool calling y function calling con cadenas AST `<tool_call>` multi-paso; perfil agéntico declarado.
- Capacidades multimodales: lectura de diagramas P&ID, esquemas eléctricos, pantallas de error HMI y gráficos de ingeniería mediante codificador ViT de 27 capas.
- Traducción y generación nativa en georgiano, finlandés e inglés.
- Modo "uncensored" declarado por el autor (sin filtros de contenido explícitos en la model card).
- Soporte de RAG y razonamiento multi-paso para agentes.

## Casos de uso

- Programación de autómatas PLC en producción: generación y revisión de bloques Structured Text para TwinCAT 3 o SCL de Siemens, incluyendo máquinas de estado deterministas con `CASE`, control de movimiento (`MC_MoveAbsolute`, `MC_GearIn`) y diagnóstico ADS o PROFINET. Adecuado por su entrenamiento específico en IEC 61131-3 y su benchmark declarado del 96,67 % en PLC/CNC.
- Post-procesado CNC y auditoría de trayectorias: generación de G-code multi-eje para fresado y torneado con compensación G41/G42, offsets G54–G59 y ciclos fijos, además de verificación de colisiones y cargas de husillo/avance. Útil en talleres con Fanuc, Sinumerik o Heidenhain.
- Asistencia técnica en georgiano para plantas industriales: un operario georgiano puede consultar diagnósticos de OPC UA, Modbus o EtherCAT y recibir explicaciones y código en su idioma nativo, gracias a los dos expertos georgianos añadidos.
- Lectura de esquemas y pantallas HMI: el codificador ViT de 27 capas permite introducir diagramas P&ID, esquemas eléctricos o capturas de errores de HMI y obtener un análisis textual o código de diagnóstico asociado.
- Agentes de mantenimiento con tool calling: cadenas `<tool_call>` AST multi-paso para consultar telemetría SQL, lanzar diagnósticos OPC UA y generar informes, con integración en pipelines internos.
- Desarrollo de sistemas embebidos y firmware: generación de código Rust o C para RTOS con foco en seguridad de memoria y concurrencia, aprovechando el perfil de "systems programmer" del modelo.
- Traducción técnica finlandés-georgiano-inglés: documentación de seguridad funcional, manuales de máquinas y procedimientos ISO 13849 / IEC 62061 entre los tres idiomas soportados.
- Despliegue en GPUs de consumo: la variante GGUF APEX-Trio permite ejecutar el modelo en estaciones de trabajo con 16 GB de VRAM mediante llama.cpp, LM Studio u Ollama, sin necesidad de infraestructura de datacenter.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card y corresponden al modelo base v3.1, no a esta variante GGUF cuantizada. No se han publicado resultados de benchmarks específicos para la versión GGUF en la información disponible.

| Benchmark | Resultado declarado (base v3.1) |
|---|---|
| Media de 15 benchmarks | 70,26 % |
| GPQA Diamond | 70,20 % |
| LiveCodeBench v6 | 39,43 % |
| LiveCodeBench v6 (Easy) | 90,70 % |
| BFCL V4 AST | 83,67 % |
| Industrial PLC/CNC (benchmark propio) | 96,67 % |

No se dispone de comparación con modelos similares en los benchmarks anteriores ni de resultados desglosados por cuantización.

## Requisitos de hardware

- VRAM estimada: el autor indica que la variante GGUF APEX-Trio está lista para GPUs de 16 GB. El repo completo ocupa 45,4 GB, por lo que el nivel APEX-Small debería caber en 16 GB, APEX-Medium en torno a 20–24 GB y APEX-Good por encima de 24 GB (estimación orientativa, no confirmada en la información disponible).
- GPUs recomendadas: RTX 4090 (24 GB) o RTX 4080 (16 GB) para los niveles Small y Medium; A100 40/80 GB o H100 para APEX-Good y para el modelo maestro BF16 (~67,5 GB).
- Cabe en GPU de consumo: sí, según el autor, a partir de 16 GB con el nivel APEX-Small.
- Opciones de despliegue: llama.cpp, LM Studio y Ollama (etiquetas declaradas); el repo hermano W4A16-AWQ está pensado para vLLM en una GPU de 24 GB, y el NVFP4 para GPUs Blackwell de 24 GB.
- Latencia y throughput: no disponibles. Al ser un MoE con 3B parámetros activos, el coste por token es sustancialmente menor que el de un modelo denso de 35B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos comparativos con modelos alternativos de la misma categoría (MoE de ~35B con capacidades industriales y multilingües). La model card no incluye comparaciones con otros modelos. Se indica "no disponible" para los campos de rendimiento comparado.

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Georgian-v3.2 | 35,5B | 3B | no disponible | Apache 2.0 | Especializado en PLC/CNC, georgiano, multimodal |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información disponible |

## Limitaciones y advertencias

- Los benchmarks declarados (70,26 % media, 96,67 % PLC/CNC) provienen de la model card del autor y no han sido verificados de forma independiente; el benchmark de PLC/CNC es propio y no está estandarizado.
- Los resultados de benchmarks corresponden al modelo base v3.1 en BF16; la cuantización GGUF puede degradar el rendimiento, especialmente en georgiano, aunque el autor declara calibración imatrix específica.
- El modelo se declara "uncensored", lo que implica ausencia de filtros de contenido; requiere moderación externa en producción.
- Cobertura idiomática limitada a georgiano, finlandés e inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- Longitud de contexto no documentada; no es posible garantizar conversaciones de contexto largo sin verificación previa.
- Riesgo de alucinación en código industrial y normas de seguridad: las salidas de PLC, G-code y evaluaciones SIL/PL deben revisarse por un ingeniero certificado antes de su uso en maquinaria real. Un error en código de seguridad funcional puede tener consecuencias físicas graves.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base deriva de Qwen3.5-MoE; conviene verificar la cadena de licencias de los modelos intermedios.
- El modelo tiene 0 likes y 969 descargas, con creación en noviembre de 2026; es un lanzamiento reciente con poca validación comunitaria.
- No se documentan sesgos conocidos ni datos de entrenamiento; la composición del dataset y el volumen de tokens son desconocidos.

## Enlaces

- Hugging Face (este repo GGUF): https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2-NVFP4
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Georgian-v3.2-W4A16-AWQ
- Ejemplos de uso (Space): https://huggingface.co/spaces/kataguru/Kataguru-Sceptic-35B-Usage-Examples
- Guía Sovereign AI (Space): https://huggingface.co/spaces/kataguru/Kataguru-Sovereign-AI-Guide
- Perfil del autor: https://huggingface.co/kataguru
