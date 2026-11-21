# kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Basque-v3.2-GGUF es la distribucion en formato GGUF del modelo Kataguru-Sceptic-35B-A3B-Basque-v3.2, publicado por Datasein Oy (Finlandia, arquitecto jefe Jari Katajisto). Se trata de un modelo de mezcla de expertos (MoE) de 35.505.251.456 parametros totales con aproximadamente 3B de parametros activos por token, construido sobre el modelo base Kataguru-Sceptic-35B-A3B-v3.1. Su especializacion es el codigo industrial (PLC y CNC) y el software de sistemas, con soporte nativo del euskera como idioma soberano, ademas de ingles y fines.

El modelo amplia la arquitectura MoE original anadiendo dos expertos nativos de euskera (expertos #254 y #255) a los 254 expertos congelados del nucleo Sceptic, manteniendo intactas las capacidades de razonamiento cientifico, codigo competitivo, tool calling agentico y vision multimodal del modelo base. El resultado es un unico modelo capaz de escribir y auditar codigo de automatizacion industrial (IEC 61131-3, TwinCAT, SCL de Siemens, G-code) directamente en euskera, fines o ingles.

Esta ficha cubre especificamente la variante GGUF, que incluye la trilogia de cuantizaciones APEX (APEX-Small, APEX-Medium, APEX-Good) calibradas con imatrix sobre un corpus de euskera, junto con el proyector multimodal mmproj. El repositorio ocupa 45,4 GB y esta pensado para despliegue en llama.cpp, LM Studio y Ollama, con opciones que caben en GPU de 16 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 40 capas, 256 expertos por capa (254 congelados + 2 nativos de euskera), Top-8 por token; encoder de vision ViT de 27 capas |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3B por token (denominacion A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF APEX-Trio: APEX-Small, APEX-Medium, APEX-Good (calibradas con imatrix sobre corpus de euskera); repositorio complementario con NVFP4 y W4A16-AWQ |
| Idiomas soportados | Ingles (en), euskera (eu), fines (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con proyector mmproj para vision); el modelo base se distribuye en safetensors BF16 |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos sobre un transformer de 40 capas. La innovacion principal de la version v3.2 es la extension del espacio de expertos de 254 a 256: los expertos #0 a #253 permanecen congelados al 100 por ciento respecto al modelo base Kataguru-Sceptic-35B-A3B-v3.1, mientras que se anaden dos expertos nativos de euskera (#254 y #255). En cada paso de generacion, el enrutador Top-8 coactiva expertos del nucleo congelado junto con los expertos de euskera, de modo que el modelo conserva las capacidades del nucleo (razonamiento cientifico, codigo, tool calling, vision) mientras adquiere competencia nativa en euskera sin olvido catastrofico del resto.

El modelo base v3.1 declara un rendimiento medio de 70,26 por ciento en una bateria de 15 benchmarks, con 70,20 por ciento en GPQA Diamond, 39,43 por ciento en LiveCodeBench v6, 83,67 por ciento en BFCL V4 AST y 96,67 por ciento en un benchmark propio de PLC/CNC industrial. El modelo integra un encoder de vision ViT de 27 capas para tareas de imagen-texto (lectura de esquemas electricos, diagramas P&ID, pantallas HMI), un motor agentico basado en AST de `<tool_call>` y un sistema operativo multi-modo que permite cambiar de rol por peticion sin reiniciar el servidor. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

Las cuantizaciones GGUF del repositorio han sido calibradas con imatrix sobre un corpus especifico de euskera, lo que segun el autor mejora la fidelidad de las cuantizaciones de baja precision en ese idioma. El repositorio incluye ademas el fichero mmproj necesario para habilitar las capacidades multimodales en llama.cpp.

## Capacidades

- Generacion de texto y razonamiento cientifico y matematico de nivel graduado (STEM), heredado del nucleo Sceptic (GPQA Diamond 70,20 por ciento declarado).
- Codigo industrial PLC: IEC 61131-3, Beckhoff TwinCAT 3 Structured Text (maquinas de estado con CASE, control de movimiento MC_MoveAbsolute, MC_Power, MC_GearIn, relojes distribuidos EtherCAT, diagnostico ADS) y Siemens TIA Portal SCL/S7-1500 (FB/FC, DB de instancia, PID_Compact, diagnostico PROFINET IO).
- Codigo CNC: G-code Fanuc, Siemens Sinumerik 840D y Heidenhain, con compensacion de radio de herramienta G41/G42, offsets de trabajo G54-G59, ciclos fijos G71/G76/G81-G89 y auditoria de trayectorias sin colisiones.
- Protocolos industriales y diagnostico SCADA/MES: OPC UA (IEC 62541), Modbus TCP/RTU, EtherCAT, PROFINET, CANopen y telemetria SQL Server/WCF.
- Seguridad funcional y normativa de maquinaria: ISO 13849-1 (PLa-PLe), IEC 62061/IEC 61508 (SIL 1-SIL 3), Safe Torque Off (STO), enclavamientos de parada de emergencia de doble canal y watchdogs.
- Programacion de sistemas y embebidos: C++20, Rust, C para RTOS, Python 3.12, C#/.NET, SQL y Bash/Linux, con enfasis en concurrencia, memoria segura y hardening de kernel y red.
- Tool calling y function calling con motor agentico AST `<tool_call>` (BFCL V4 AST 83,67 por ciento declarado, cero errores de sintaxis segun el autor).
- Razonamiento multi-paso y flujos agenticos con integracion RAG.
- Vision multimodal: lectura de diagramas P&ID, esquemas de cableado electrico, pantallas de error de HMI y graficos de ingenieria mediante encoder ViT de 27 capas.
- Capacidades multilingues nativas en euskera, fines e ingles, incluyendo generacion de codigo industrial directamente en euskera.
- Modo sin censura (uncensored) segun los tags del autor.
- Sistema multi-modo con cambio de rol por peticion sin reinicio del servidor.

## Casos de uso

- Generacion y auditoria de logica PLC en euskera: un integrador industrial del Pais Vasco puede pedir al modelo que escriba o revise maquinas de estado en Structured Text para TwinCAT 3 o bloques de funcion SCL para S7-1500 directamente en euskera, manteniendo la nomenclatura tecnica de senales y E/S, lo que reduce la friccion para equipos de planta cuya lengua de trabajo es el euskera.
- Post-procesado y validacion de G-code: el modelo puede generar o auditar programas de mecanizado para Fanuc, Sinumerik 840D o Heidenhain, verificando compensaciones G41/G42, offsets G54-G59 y ciclos fijos, y detectando trayectorias con riesgo de colision antes de enviar el programa a maquina.
- Diagnostico de redes industriales y SCADA: interpretacion de trazas y configuraciones de OPC UA, Modbus TCP/RTU, EtherCAT y PROFINET, con propuestas de resolucion de fallos de comunicacion y telemetria en lineas de produccion.
- Revision de seguridad funcional: apoyo en la verificacion de conformidad con ISO 13849-1 e IEC 62061/IEC 61508, incluyendo el diseno de enclavamientos de parada de emergencia de doble canal, calculo de niveles PL y SIL y revision de watchdogs en logica de seguridad.
- Asistencia a ingenieria con vision: carga de esquemas electricos, diagramas P&ID o capturas de pantalla de error de HMI para que el modelo los interprete y proponga la modificacion de codigo o el diagnostico correspondiente, gracias al encoder ViT de 27 capas y al pipeline image-text-to-text.
- Desarrollo de software de sistemas embebidos: generacion de codigo en Rust, C++20 o C para RTOS con enfasis en concurrencia y memoria segura, adecuado para equipos que desarrollan firmware de controladores industriales y necesitan un asistente con conocimiento del dominio de automatizacion.
- Agentes de mantenimiento y RAG sobre documentacion tecnica: integracion del modelo en un pipeline agentico con tool calling y recuperacion aumentada sobre manuales de maquina, esquemas y procedimientos, para responder consultas de operarios y tecnicos de mantenimiento en euskera, fines o ingles.
- Traduccion tecnica especializada: traduccion de documentacion de automatizacion, manuales de PLC y procedimientos de seguridad entre euskera, fines e ingles conservando terminologia industrial precisa.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo base Kataguru-Sceptic-35B-A3B-v3.1, segun la model card del autor. No se han publicado resultados de benchmarks especificos para la variante GGUF ni para la version en euskera en la informacion disponible.

| Benchmark | Resultado declarado |
|---|---|
| Media de 15 benchmarks | 70,26 % |
| GPQA Diamond | 70,20 % |
| LiveCodeBench v6 | 39,43 % |
| LiveCodeBench v6 (Easy) | 90,70 % |
| BFCL V4 AST | 83,67 % |
| PLC/CNC industrial (benchmark propio) | 96,67 % |

No se dispone de comparaciones numericas con modelos similares en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: el repositorio GGUF incluye la trilogia APEX calibrada con imatrix; segun el autor, la variante APEX esta preparada para GPU de 16 GB. Las variantes NVFP4 (aproximadamente 20,9 GiB) y W4A16-AWQ (aproximadamente 19,5 GiB) del mismo modelo caben en una unica GPU de 24 GB.
- GPU recomendadas: por el perfil de memoria, tarjetas de 16 GB o superiores (por ejemplo, RTX 4080, RTX 4090, A100, H100). Para las variantes NVFP4 se requieren GPU Blackwell; para AWQ, GPU compatibles con vLLM.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas con las cuantizaciones APEX, y en tarjetas de 24 GB con NVFP4 o AWQ.
- Opciones de despliegue: llama.cpp, LM Studio y Ollama para los ficheros GGUF; vLLM para la variante W4A16-AWQ; el repositorio incluye el proyector mmproj para habilitar vision en llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un MoE con aproximadamente 3B de parametros activos por token, el coste computacional por token es sustancialmente menor que el de un modelo denso de 35B, aunque no se han publicado cifras concretas.

## Comparativa con modelos similares

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria (MoE de aproximadamente 35B totales con especializacion en codigo industrial y soporte de euskera). Los modelos comparables habituales en el segmento MoE de ~30-35B totales y ~3B activos no aparecen referenciados en la documentacion del autor.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Basque-v3.2 | 35,5B | ~3B | no disponible | Apache 2.0 | GGUF, safetensors BF16, NVFP4, AWQ |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks citados (GPQA Diamond, LiveCodeBench v6, BFCL V4 AST, PLC/CNC 96,67 por ciento) son declaraciones del autor en la model card y corresponden al modelo base v3.1; no se han verificado de forma independiente en la informacion disponible.
- El benchmark de PLC/CNC es propio del autor, por lo que su comparabilidad con evaluaciones externas es limitada.
- Riesgo de alucinacion en codigo industrial: la generacion de logica PLC, G-code o configuraciones de red debe revisarse siempre por un ingeniero cualificado antes de su despliegue en maquinaria real, especialmente en contextos de seguridad funcional (ISO 13849-1, IEC 62061).
- La longitud de contexto no esta documentada en la informacion disponible, lo que impide planificar el uso con documentos tecnicos extensos o conversaciones de muchos turnos.
- El soporte de idiomas se limita a ingles, euskera y fines; el rendimiento en castellano u otros idiomas no esta documentado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y el autor no ofrece informacion sobre sesgos conocidos ni sobre la composicion de los datos de entrenamiento.
- El tag "uncensored" implica que el modelo puede no rechazar peticiones potencialmente daninas; en entornos de produccion conviene anadir capas de moderacion y validacion.
- Las capacidades multimodales requieren el fichero mmproj y un runtime compatible (llama.cpp); no todos los backends de despliegue soportan vision con GGUF.
- Las cuantizaciones de baja precision pueden degradar el rendimiento en tareas de razonamiento o en idiomas distintos de aquellos sobre los que se calibro imatrix (euskera).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2-NVFP4
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2-W4A16-AWQ
- Ejemplos de uso: https://huggingface.co/spaces/kataguru/Kataguru-Sceptic-35B-Usage-Examples
- Guia de IA soberana: https://huggingface.co/spaces/kataguru/Kataguru-Sovereign-AI-Guide
- Perfil del autor: https://huggingface.co/kataguru
