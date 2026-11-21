# kataguru/Kataguru-Sceptic-35B-A3B-v3.1-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-v3.1 es un modelo multimodal de tipo Mixture-of-Experts (MoE) desarrollado por Datasein Oy (Finlandia), con Jari Katajisto como arquitecto jefe. Se construye sobre la arquitectura Qwen3.5-35B-A3B y está especializado en programación industrial y ingeniería de sistemas: automatización de PLC, G-code para CNC, protocolos de campo (OPC UA, EtherCAT, PROFINET) y programación de sistemas en C++, Rust y Python. El modelo es bilingüe inglés-finlandés y adopta una postura deliberadamente escéptica y "uncensored" en sus respuestas.

La variante publicada en este repositorio es la cuantización GGUF, distribuida como un trío de ficheros (`APEX-Small`, `APEX-Medium`, `APEX-Good`) más un proyector multimodal (`mmproj`), pensada para su uso en llama.cpp, LM Studio y Ollama. El modelo completo cuenta con 35.247.133.824 parámetros totales y activa aproximadamente 3B por token, con 254 expertos enrutados por capa y dos slots reservados (#254 y #255) para especialización empresarial modular.

La relevancia de esta versión radica en que supera el umbral del 70 % en su suite interna de 15 benchmarks (70,26 % de media), con mejoras notables en razonamiento STEM de nivel doctoral (GPQA Diamond: 70,20 %), ingeniería de software competitiva (LiveCodeBench v6: 39,43 %) y tool calling agéntico (BFCL V4: 83,67 %). La licencia Apache 2.0 facilita su adopción tanto en entornos de investigación como comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen3.5-35B-A3B, 40 capas, top_k=8, 254 expertos enrutados por capa + 2 slots reservados (#254, #255) |
| Parametros totales | 35.247.133.824 (35,2B) |
| Parametros activos | Aproximadamente 3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en tres variantes (APEX-Small, APEX-Medium, APEX-Good) con imatrix; el modelo base ofrece BF16, NVFP4 y W4A16-AWQ |
| Idiomas soportados | Inglés (en) y finlandés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta variante); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con capas MoE de tipo Qwen3.5, con 40 capas, enrutamiento top_k=8 y 254 expertos por capa. Incorpora un codificador visual ViT de 27 capas que habilita el procesamiento de imágenes (esquemas eléctricos, diagramas P&ID, pantallas HMI). La variante v3.1 se entrenó mediante un proceso de "2-Cycle Orthonormal Subspace MoE Training": el primer ciclo aplicó una protección de subespacio ortogonal de cuatro niveles sobre datos cognitivos, finlandeses, STEM de posgrado, medicina clínica y patentes; el segundo ciclo utilizó "weakest_link_oplora" con un escudo de anclaje cruzado 64/36 y poda de muestras mediante un oráculo epistémico (NLL < 0,35) sobre algoritmos competitivos verificados con PASSED_EXEC, ingeniería de software multi-turno, tool calling BFCL e ingeniería industrial PLC/CNC.

El ajuste incluyó datos verificados de automatización industrial (IEC 61131-3, TwinCAT 3, Siemens SCL, G-code Fanuc/Sinumerik/Heidenhain) y protocolos de seguridad funcional (ISO 13849-1, IEC 62061, IEC 61508). No se especifican en la información disponible el número exacto de tokens de entrenamiento ni la composición detallada del dataset más allá de las categorías mencionadas.

## Capacidades

- Generación de texto, razonamiento avanzado y matemáticas de nivel STEM (GPQA Diamond: 70,20 %).
- Programación industrial: IEC 61131-3 (Structured Text), Beckhoff TwinCAT 3, Siemens TIA Portal SCL/S7-1500, máquinas de estado PackML, control de movimiento (MC_MoveAbsolute, NC 0x4225) y bucles PID.
- G-code para CNC multieje: compensación de radio de herramienta (G41/G42), velocidad de superficie constante (G50/G96), offsets de trabajo (G54–G59), auditoría de colisiones.
- Protocolos industriales: OPC UA (IEC 62541), Modbus TCP/RTU, EtherCAT, PROFINET, ADS.
- Seguridad funcional: ISO 13849-1 (PLe), IEC 62061/IEC 61508 (SIL 3, STO).
- Programación de sistemas: C++20, Rust, C embebido/RTOS, Python 3.12, C#/.NET, SQL, Linux/Bash.
- Tool calling y function calling nativo con AST determinista (`<tool_call>`), BFCL V4: 83,67 %.
- Capacidades agénticas y razonamiento multi-paso.
- Visión multimodal: lectura de esquemas eléctricos, diagramas P&ID y pantallas HMI.
- Razonamiento clínico (MedQA: 85,39 %).
- Bilingüe inglés-finlandés con inflexión finlandesa verificada por Kotus.
- Modo "uncensored" y postura epistémica escéptica (zero-sycophancy).

## Casos de uso

- Programación de PLC en producción: generación y revisión de código Structured Text para TwinCAT 3 y SCL de Siemens, incluyendo máquinas de estado PackML y bucles PID, aprovechando su benchmark verificado del 96,67 % en PLC/CNC.
- Auditoría de G-code en mecanizado: revisión de programas Fanuc, Sinumerik 840D o Heidenhain para detectar colisiones, verificar compensaciones de herramienta y validar velocidades de avance y husillo antes de enviar a máquina.
- Integración de protocolos industriales: generación de código cliente/servidor para OPC UA, Modbus y EtherCAT en pasarelas de datos o sistemas SCADA.
- Análisis de documentación técnica visual: uso del codificador ViT para interpretar esquemas eléctricos, P&ID y capturas de HMI, extrayendo información estructurada o detectando inconsistencias.
- Agentes de ingeniería autónomos: construcción de pipelines con tool calling AST para consultar repositorios, ejecutar pruebas y desplegar cambios en entornos CI/CD de software embebido.
- Asistencia en programación de sistemas: generación y refactorización de código Rust, C++20 y C embebido en proyectos de sistemas operativos o firmware.
- Soporte técnico bilingüe en finlandés e inglés: atención a operadores e ingenieros en ambos idiomas con terminología técnica precisa.
- Validación de seguridad funcional: revisión de lógica de parada de emergencia, sincronización a dos manos (500 ms) y EDM conforme a ISO 13849-1 PLe.

## Benchmarks y rendimiento

| Benchmark | v3.1 | v2.8.1 (predecesor) | Variacion |
|---|---|---|---|
| Media suite 15 benchmarks | 70,26 % | 69,24 % | +1,02 pp |
| GPQA Diamond | 70,20 % | 57,58 % | +12,62 pp |
| LiveCodeBench v6 (Pass@1) | 39,43 % | 32,00 % | +7,43 pp |
| LiveCodeBench v6 (Easy) | 90,70 % | no disponible | no disponible |
| BFCL V4 Single-Turn AST | 83,67 % | 82,33 % | +1,34 pp |
| BFCL V4 Non-Live AST | 88,44 % | no disponible | no disponible |
| BFCL V4 Irrelevance | 80,26 % | 46,87 % | +33,39 pp |
| Industrial Automation (PLC/CNC) | 96,67 % | +3,22 pp | no disponible |
| MedQA | 85,39 % | 85,39 % | 0 pp |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada: el repositorio GGUF ocupa 45,1 GB en total, repartido entre las tres variantes APEX y el proyector mmproj; cada variante individual requiere entre aproximadamente 14 y 22 GB según su nivel de cuantización (no se detalla el tamaño exacto por fichero en la información disponible).
- GPU recomendadas: para la variante de mayor calidad, GPU con 24 GB o más (RTX 4090, RTX 3090, A6000, A100, H100). Para las variantes pequeñas, GPU consumer de 16 GB podrían ser suficientes.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) y potencialmente en GPUs de 16 GB con las variantes más agresivas.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (mencionados explícitamente); el modelo base soporta vLLM mediante la variante W4A16-AWQ y NVFP4 para Blackwell.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-v3.1 | 35,2B | ~3B | no disponible | Apache 2.0 | Especializado en automatización industrial, bilingüe en/fi |
| Qwen3.5-35B-A3B (base) | 35B | ~3B | no disponible | no disponible | Modelo base sin especialización industrial |
| Kataguru-Sceptic-35B-A3B-v2.8.1 | 35,2B | ~3B | no disponible | Apache 2.0 | Versión previa, media de 69,24 % en la suite de 15 benchmarks |

No se dispone de datos de benchmarks comparables de modelos de la competencia en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado principalmente en inglés y finlandés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- La postura "uncensored" y "escéptica" puede producir respuestas que cuestionen premisas del usuario o eviten la adulación, lo que puede no ser adecuado para todos los contextos de atención al cliente.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en dominios técnicos muy especializados donde el código generado debe validarse antes de su despliegue en maquinaria real.
- Los benchmarks reportados son internos del autor; no se han verificado de forma independiente en la información disponible.
- La longitud de contexto no está especificada, lo que dificulta planificar su uso en tareas de contexto largo.
- El uso en sistemas de seguridad funcional (SIL 3, PLe) requiere validación humana y certificación independiente; el modelo no sustituye la verificación formal.
- Aunque la licencia es Apache 2.0, el uso comercial de las variantes GGUF debe verificar las condiciones de los pesos base Qwen3.5.
- El repositorio tiene pocas descargas (843) y ningún "like", lo que sugiere una adopción aún limitada y escasa validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1-GGUF
- Modelo base BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1-NVFP4
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1-W4A16-AWQ
- Versión previa NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.8.1-NVFP4
- Perfil del autor: https://huggingface.co/kataguru
