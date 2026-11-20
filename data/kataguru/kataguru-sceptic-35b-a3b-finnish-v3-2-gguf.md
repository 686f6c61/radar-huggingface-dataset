# kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Finnish-v3.2-GGUF es la distribucion en formato GGUF del modelo Kataguru-Sceptic-35B-A3B-Finnish-v3.2, publicado por Datasein Oy (Finlandia) bajo la direccion tecnica de Jari Katajisto. Se trata de un modelo de lenguaje de tipo mezcla de expertos (MoE) con 35.505.251.456 parametros totales y aproximadamente 3.000 millones de parametros activos por token, construido sobre la base Kataguru-Sceptic-35B-A3B-v3.1. Su especializacion principal es la programacion industrial (PLC/CNC), el desarrollo de sistemas y el razonamiento STEM, con soporte multimodal de vision y capacidades de tool calling.

El modelo incorpora una arquitectura MoE de 40 capas con 256 expertos por capa: 254 expertos congelados heredados del modelo base y 2 expertos nativos anadidos especificamente para finlandes. Esta configuracion busca preservar integramente las capacidades del modelo original (razonamiento cientifico, codigo competitivo, agentes) mientras se anade competencia nativa en finlandes sin degradar el resto de habilidades. El repositorio contiene unicamente cuantizaciones GGUF, organizadas en tres variantes (APEX-Small, APEX-Medium y APEX-Good) mas un proyector multimodal (mmproj) para las capacidades de vision.

La relevancia actual del modelo radica en su enfoque vertical: no compite como modelo generalista, sino como herramienta especializada para automatizacion industrial, programacion de automatas y sistemas embebidos en entornos de habla finesa e inglesa, con licencia Apache 2.0 que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 40 capas, 256 expertos por capa (254 congelados + 2 nativos finlandeses), top-8 por token |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3.000 millones por token (denominacion A3B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF en variantes APEX-Small, APEX-Medium y APEX-Good (calibradas con imatrix en finlandes); el modelo base dispone de BF16, NVFP4 y W4A16-AWQ |
| Idiomas soportados | Ingles (en) y finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con proyector multimodal mmproj incluido) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de mezcla de expertos con 40 capas y 256 expertos por capa. La innovacion central respecto al modelo base es la estrategia de expansion controlada: los 254 expertos originales del Kataguru-Sceptic-35B-A3B-v3.1 permanecen congelados, y se anaden 2 expertos nuevos entrenados especificamente para finlandes (identificados como #254 y #255). En cada paso de token, los 8 expertos activados (top-8) coactivan simultaneamente expertos del nucleo congelado y los expertos fineses, de modo que el modelo conserva el conocimiento original mientras incorpora competencia linguistica nativa en finlandes.

El modelo base declara capacidades de razonamiento cientifico (GPQA Diamond), codigo competitivo (LiveCodeBench v6), tool calling agentico (BFCL V4) y programacion industrial PLC/CNC, lo que sugiere un entrenamiento que combina datos de codigo, STEM y dominios de automatizacion industrial. La model card menciona ademas un codificador de vision ViT de 27 capas para entrada image-text-to-text. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Las cuantizaciones GGUF han sido calibradas con imatrix sobre datos en finlandes, lo que segun el autor mejora la fidelidad de las variantes cuantizadas en ese idioma.

## Capacidades

- Generacion de texto y razonamiento en ingles y finlandes.
- Programacion industrial PLC: IEC 61131-3, Beckhoff TwinCAT 3 Structured Text, Siemens TIA Portal SCL/S7-1500, bloques de funcion, control PID y diagnostico PROFINET.
- Programacion CNC: G-code Fanuc, Siemens Sinumerik 840D y Heidenhain, compensacion de radio de herramienta, offsets de trabajo y ciclos fijos.
- Protocolos industriales: OPC UA (IEC 62541), Modbus TCP/RTU, EtherCAT, PROFINET y CANopen.
- Seguridad funcional: ISO 13849-1 (PLa-PLe), IEC 62061 / IEC 61508 (SIL 1-SIL 3), Safe Torque Off e interlocks de parada de emergencia.
- Programacion de sistemas: C++20, Rust, C embebido/RTOS, Python 3.12, C#/.NET, SQL y Bash/Linux.
- Tool calling y function calling con cadenas de llamadas en formato AST (declara 0 errores de sintaxis en BFCL V4).
- Capacidades agenticas y razonamiento multi-paso.
- Vision multimodal: lectura de diagramas P&ID, esquemas electricos, pantallas HMI de error y graficos de ingenieria mediante codificador ViT de 27 capas.
- Capacidades STEM y matematicas.
- Modelo sin censura declarada (tag "uncensored").
- Traduccion (tag "translation").
- Soporte de RAG (tag "rag").

## Casos de uso

- Generacion y auditoria de codigo PLC en TwinCAT 3 y TIA Portal: el modelo puede producir bloques de funcion, maquinas de estado deterministas y logica de control PID en Structured Text o SCL, y revisar codigo existente en busca de errores de logica o incumplimientos de buenas practicas, gracias a su especializacion declarada en IEC 61131-3.
- Post-procesado y verificacion de G-code CNC: dado un programa de mecanizado, el modelo puede auditar trayectorias, verificar compensaciones de herramienta y detectar colisiones potenciales en entornos Fanuc, Sinumerik o Heidenhain, un caso de uso directamente alineado con su entrenamiento en cinematica de ejes.
- Diagnostico de redes industriales y SCADA: interpretacion de trazas OPC UA, Modbus, EtherCAT o PROFINET para identificar fallos de comunicacion, y correlacion con telemetria de produccion en SQL Server, adecuado por su conocimiento declarado de estos protocolos.
- Asistencia en ingenieria de seguridad funcional: revision de arquitecturas de parada de emergencia, calculo de categorias ISO 13849-1 y verificacion de niveles SIL, util para equipos que documentan conformidad de maquinaria.
- Desarrollo de software de sistemas y embebido: generacion de codigo Rust, C++20 o C para RTOS con enfasis en concurrencia y seguridad de memoria, apoyandose en las capacidades de codigo del nucleo congelado.
- Agente de soporte tecnico multi-turno en finlandes: atencion a operarios o ingenieros en su idioma nativo, con acceso a herramientas mediante tool calling para consultar manuales, bases de datos de incidencias o sistemas MES, aprovechando los dos expertos finlandeses anadidos.
- Analisis de documentacion tecnica visual: lectura de esquemas electricos, diagramas P&ID y capturas de pantalla de HMI para diagnosticar fallos o generar documentacion, mediante el codificador de vision ViT de 27 capas.
- Traduccion tecnica ingles-finlandes: traduccion de manuales, procedimientos y documentacion de automatizacion industrial entre ambos idiomas, con terminologia especializada.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo base Kataguru-Sceptic-35B-A3B-v3.1 y a la variante Finnish v3.2 segun la model card. No se han publicado resultados independientes especificos para las cuantizaciones GGUF de este repositorio.

| Benchmark | Resultado declarado |
|---|---|
| Media de 15 benchmarks | 70,26 % |
| GPQA Diamond | 70,20 % |
| LiveCodeBench v6 | 39,43 % |
| LiveCodeBench v6 (Easy) | 90,70 % |
| BFCL V4 AST | 83,67 % |
| Industrial PLC/CNC | 96,67 % |

No se dispone de comparaciones con modelos similares en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: el autor declara que las variantes GGUF APEX-Trio estan listas para GPU de 16 GB. El modelo base en BF16 ocupa aproximadamente 67,5 GB; las variantes NVFP4 (aproximadamente 20,9 GiB) y W4A16-AWQ (aproximadamente 19,5 GiB) caben en una unica GPU de 24 GB.
- GPU recomendadas: para las cuantizaciones GGUF, GPU consumer de 16 GB o superior (por ejemplo, RTX 4080, RTX 4090, RTX 5080). Para las variantes NVFP4, GPU Blackwell de 24 GB. Para BF16, configuraciones multi-GPU o GPU de 80 GB como A100 o H100.
- Cabe en GPU consumer: si, en las variantes GGUF y en las cuantizaciones de 4 bits del modelo base.
- Opciones de despliegue: llama.cpp, LM Studio y Ollama (segun los tags del repositorio); vLLM para las variantes AWQ; transformers para los pesos completos.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un MoE con aproximadamente 3.000 millones de parametros activos, el coste computacional por token es inferior al de un modelo denso de 35.000 millones, lo que favorece el throughput, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni especificaciones de modelos alternativos en la informacion proporcionada que permitan una comparacion rigurosa. Como referencia estructural, el modelo se posiciona en la categoria de MoE de aproximadamente 35.000 millones de parametros totales con unos 3.000 millones activos, similar en escala a arquitecturas MoE abiertas de esa clase, pero su especializacion en automatizacion industrial y finlandes lo diferencia de los modelos generalistas. Comparativa detallada: no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al estar entrenado con datos de ingenieria y codigo, puede reflejar sesgos de esos dominios y de las fuentes en ingles y finlandes.
- Riesgo de alucinacion: presente como en cualquier modelo de lenguaje; especialmente critico en dominios de seguridad funcional (SIL, PLe), donde la salida del modelo no debe sustituir la validacion por un ingeniero certificado.
- Limitaciones de idioma: solo se declaran ingles y finlandes; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea inferior.
- Longitud de contexto: no disponible; conviene verificarla antes de disenar flujos con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no se declaran restricciones adicionales.
- Caveat de produccion: los benchmarks citados provienen de la model card del autor y no han sido verificados de forma independiente; las cuantizaciones GGUF pueden degradar ligeramente la precision respecto a BF16, aunque el autor indica calibracion imatrix en finlandes para mitigarlo.
- El tag "uncensored" implica que el modelo puede no rechazar solicitudes potencialmente daninas; es responsabilidad del desplegador aplicar filtros y politicas de uso.
- La especializacion industrial no exime de la validacion humana del codigo PLC/CNC generado antes de su uso en maquinaria real.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-GGUF
- Pesos completos BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-NVFP4
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-W4A16-AWQ
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Ejemplos de uso: https://huggingface.co/spaces/kataguru/Kataguru-Sceptic-35B-Usage-Examples
- Guia Sovereign AI: https://huggingface.co/spaces/kataguru/Kataguru-Sovereign-AI-Guide
- Perfil del autor: https://huggingface.co/kataguru
