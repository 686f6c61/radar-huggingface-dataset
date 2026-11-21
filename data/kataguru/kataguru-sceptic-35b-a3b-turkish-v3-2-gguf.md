# kataguru/Kataguru-Sceptic-35B-A3B-Turkish-v3.2-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Turkish-v3.2-GGUF es la distribucion cuantizada en formato GGUF del modelo Kataguru-Sceptic-35B-A3B-Turkish-v3.2, publicado por Datasein Oy (Finlandia) bajo la direccion de su arquitecto jefe Jari Katajisto. Se trata de un modelo de mezcla de expertos (MoE) de 35.505.251.456 parametros totales con aproximadamente 3.000 millones de parametros activos por token, construido sobre la base Kataguru-Sceptic-35B-A3B-v3.1 y especializado en programacion industrial (PLC y CNC) y en ingenieria de sistemas, con un enfasis explicito en el idioma turco.

El modelo anade dos expertos nativos de turco (expertes #254 y #255) a los 254 expertos congelados del nucleo original, manteniendo intactas las capacidades de razonamiento cientifico, codigo competitivo, vision multimodal y tool calling del modelo base. La model card declara cifras como 96,67 % en su benchmark propio de PLC/CNC industrial, 70,20 % en GPQA Diamond, 39,43 % en LiveCodeBench v6 y 83,67 % en BFCL V4 AST.

Esta variante GGUF se distribuye como suite "APEX-Trio" con tres niveles de cuantizacion (APEX-Small, APEX-Medium, APEX-Good) mas un proyector multimodal mmproj, calibrados con imatrix sobre datos turcos y pensados para ejecucion en GPU de 16 GB. Es relevante para equipos que necesitan un modelo de codigo industrial y automatizacion con capacidad multimodal y soporte de agentes, ejecutable en hardware de consumo o en una unica GPU de 24 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, 40 capas, 256 expertos por capa (254 congelados + 2 nativos de turco), Top-8 |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3.000 millones por token (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF APEX-Trio (APEX-Small, APEX-Medium, APEX-Good) calibrados con imatrix; el ecosistema incluye tambien BF16, NVFP4 y W4A16-AWQ en repos separados |
| Idiomas soportados | Ingles (en), turco (tr), finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 45,4 GB); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de mezcla de expertos con 40 capas y 256 expertos por capa. La innovacion principal respecto al modelo base v3.1 es la incorporacion de dos expertos nativos de turco (#254 y #255) que coactivan en cada paso de token junto con los ocho expertos seleccionados del nucleo congelado (#0 a #253). Segun la model card, esto permite conservar el 100 % de las capacidades del modelo original (razonamiento cientifico, codigo competitivo, motor de agentes y codificacion industrial) sin sacrificar el rendimiento en turco. El modelo base declara un promedio de 70,26 % en un conjunto de 15 benchmarks.

La model card menciona un encoder de vision ViT de 27 capas integrado, lo que habilita la modalidad image-text-to-text. No se detalla en la informacion proporcionada el volumen de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO. Las cuantizaciones GGUF se han calibrado con imatrix sobre datos turcos, lo que sugiere un ajuste especifico de los pesos cuantizados para preservar el rendimiento en ese idioma.

## Capacidades

- Generacion de texto y razonamiento cientifico, con resultados declarados de 70,20 % en GPQA Diamond.
- Programacion industrial PLC: IEC 61131-3, Beckhoff TwinCAT 3 Structured Text, Siemens TIA Portal SCL/S7-1500, bloques de funcion, PID y diagnosticos PROFINET.
- Programacion CNC y G-code: Fanuc, Siemens Sinumerik 840D y Heidenhain, con compensacion de radio de herramienta, offsets de trabajo y ciclos fijos.
- Protocolos industriales y fieldbuses: OPC UA, Modbus TCP/RTU, EtherCAT, PROFINET y CANopen.
- Normativa de seguridad funcional: ISO 13849-1 (PLa-PLe), IEC 62061 / IEC 61508 (SIL 1-SIL 3), Safe Torque Off y enclavamientos de parada de emergencia.
- Ingenieria de software de sistemas: C++20, Rust, C embebido/RTOS, Python 3.12, C#/.NET, SQL y Bash/Linux.
- Tool calling y function calling con motor de agentes basado en AST `<tool_call>`, con 83,67 % en BFCL V4 AST y cero errores de sintaxis declarados.
- Capacidades multimodales de vision: lectura de diagramas P&ID, esquemas electricos, pantallas de error de HMI y graficos de ingenieria mediante el encoder ViT de 27 capas.
- Capacidades multilingues en ingles, turco y finlandes, con especial refuerzo del turco.
- Modo de multiples roles conmutables por peticion sin reinicio del servidor (multi-mode 6-en-1 segun la model card).
- Traduccion y generacion aumentada por recuperacion (RAG).

## Casos de uso

- Generacion y auditoria de codigo PLC en produccion: el modelo puede escribir y revisar programas en Structured Text para TwinCAT 3 o SCL para S7-1500, incluyendo maquinas de estados deterministas y control de movimiento, lo que encaja en equipos de automatizacion que trabajan en turco.
- Post-procesado y validacion de G-code CNC: permite generar y auditar trayectorias multi-eje con compensacion de radio y offsets, verificando cargas de husillo y evitando colisiones antes de enviar el programa a maquina.
- Diagnostico de redes industriales y SCADA: con soporte de OPC UA, Modbus, EtherCAT y PROFINET, puede ayudar a interpretar trazas y diagnosticos de fieldbus en tareas de mantenimiento y puesta en marcha.
- Asistente de ingenieria de seguridad funcional: ayuda a redactar y revisar logica de enclavamientos, categorias PLa-PLe y niveles SIL, apoyandose en las normas citadas en la model card.
- Agente de soporte tecnico con vision: al leer pantallas de error de HMI y esquemas electricos mediante el encoder ViT, puede asistir en la resolucion de incidencias en planta a partir de capturas o fotografias.
- Desarrollo de software de sistemas y embebido: generacion de codigo en Rust, C++20 y C para RTOS, con soporte de tool calling para integrarse en pipelines de CI/CD y tareas de analisis automatizado.
- Traduccion tecnica turco-ingles-finlandes: util para documentacion de ingenieria y manuales de maquinaria en entornos industriales finlandeses o turcos.
- Automatizacion agentica multi-paso: el motor `<tool_call>` basado en AST permite encadenar llamadas a herramientas en flujos de RAG o de orquestacion de tareas de ingenieria.

## Benchmarks y rendimiento

| Benchmark | Resultado declarado |
|---|---|
| Media de 15 benchmarks (modelo base v3.1) | 70,26 % |
| GPQA Diamond | 70,20 % |
| LiveCodeBench v6 | 39,43 % |
| LiveCodeBench v6 (Easy) | 90,70 % |
| BFCL V4 AST | 83,67 % |
| Benchmark industrial PLC/CNC propio | 96,67 % |

No se han publicado en la informacion disponible resultados de benchmarks para esta variante GGUF concreta; las cifras anteriores corresponden al modelo base y al modelo v3.2 segun la model card. No se dispone de comparaciones directas con modelos de referencia en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: la model card indica que la suite GGUF APEX-Trio esta preparada para GPU de 16 GB; las variantes NVFP4 (aproximadamente 20,9 GiB) y W4A16-AWQ (aproximadamente 19,5 GiB) caben en una unica GPU de 24 GB.
- Pesos completos en BF16: aproximadamente 67,5 GB, requieren multiples GPU o una GPU de gran capacidad.
- GPU recomendadas: RTX 4090, RTX 4080, A100, H100 y GPUs Blackwell para NVFP4. El repositorio GGUF esta pensado para GPUs de consumo de 16 GB o superiores.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas con las cuantizaciones APEX, y en tarjetas de 24 GB con NVFP4 o AWQ.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y vLLM (etiquetas del repositorio); el modelo base usa transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoria (MoE de aproximadamente 35B totales con especializacion industrial y multimodal). Por tanto, la comparativa se limita a lo siguiente:

| Aspecto | Kataguru-Sceptic-35B-A3B-Turkish-v3.2 | Alternativas comparables |
|---|---|---|
| Parametros totales | 35.505.251.456 | no disponible |
| Parametros activos | Aproximadamente 3B | no disponible |
| Contexto | no disponible | no disponible |
| Idiomas | en, tr, fi | no disponible |
| Licencia | Apache 2.0 | no disponible |
| Formato | GGUF, safetensors, NVFP4, AWQ | no disponible |

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos conocidos en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en dominios de seguridad funcional (ISO 13849-1, IEC 61508) cualquier salida debe ser revisada por un ingeniero cualificado antes de su uso en produccion.
- El soporte linguistico declarado se limita a ingles, turco y finlandes; el rendimiento en otros idiomas puede degradarse.
- La longitud de contexto no esta especificada en la informacion disponible, lo que impide planificar tareas de contexto largo con garantias.
- Las cifras de benchmarks (incluido el 96,67 % en PLC/CNC) proceden de la model card del autor y corresponden a un benchmark propio; no se han verificado de forma independiente.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los componentes de vision heredados.
- El modelo se presenta como "uncensored" en sus etiquetas, lo que puede implicar menor filtrado de contenido; debe evaluarse su idoneidad en entornos regulados.
- El repositorio GGUF es una cuantizacion; puede presentar pequenas diferencias de calidad respecto a los pesos BF16 originales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Turkish-v3.2-GGUF
- Pesos completos BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Turkish-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Turkish-v3.2-NVFP4
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Turkish-v3.2-W4A16-AWQ
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Espacio de ejemplos de uso: https://huggingface.co/spaces/kataguru/Kataguru-Sceptic-35B-Usage-Examples
- Guia de IA soberana: https://huggingface.co/spaces/kataguru/Kataguru-Sovereign-AI-Guide
- Perfil del autor: https://huggingface.co/kataguru
