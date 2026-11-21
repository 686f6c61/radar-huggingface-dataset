# kataguru/Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-GGUF es una cuantizacion GGUF del modelo Kataguru-Sceptic-35B-A3B-Hungarian-v3.2, publicado por Datasein Oy (Finlandia) bajo la direccion tecnica de Jari Katajisto. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) orientado a programacion industrial y de sistemas, con especial enfasis en automatizacion PLC/CNC (IEC 61131-3, TwinCAT, SCL, G-code), protocolos de campo (OPC UA, EtherCAT, PROFINET, Modbus) y desarrollo de software de sistemas en Rust, C++, C y Python. El modelo deriva del checkpoint base Kataguru-Sceptic-35B-A3B-v3.1, al que se anaden dos expertos nativos de hungaro sobre una base de 254 expertos congelados.

La relevancia del modelo radica en su especializacion vertical: frente a los modelos generalistas, apunta a un nicho concreto de ingenieria industrial multilingue (hungaro, finlandes e ingles) con capacidades multimodales de vision (lectura de esquemas electricos, diagramas P&ID, pantallas HMI) y un motor agentico basado en llamadas a herramientas con AST. El autor declara un rendimiento del 96,67 % en su benchmark propio de PLC/CNC y un 83,67 % en BFCL V4 AST.

Esta ficha corresponde especificamente al repositorio GGUF, que incluye tres niveles de cuantizacion bautizados como APEX-Small, APEX-Medium y APEX-Good, ademas del proyector multimodal mmproj. El peso total del repositorio es de 89,8 GB y el modelo cuenta con 35.505.251.456 parametros totales, con 3B parametros activos por token segun la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, 40 capas, 256 expertos por capa (254 congelados + 2 nativos de hungaro), top-8 activos por token; encoder de vision ViT de 27 capas |
| Parametros totales | 35.505.251.456 |
| Parametros activos | 3B por token (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en tres variantes APEX (APEX-Small, APEX-Medium, APEX-Good), calibradas con imatrix; el ecosistema del modelo incluye ademas BF16, NVFP4 y W4A16-AWQ en repositorios separados |
| Idiomas soportados | Ingles (en), hungaro (hu), finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero mmproj para el encoder de vision); safetensors en el checkpoint base |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con 40 capas y 256 expertos por capa. La innovacion declarada por el autor es la composicion "254 + 2": los 254 expertos del nucleo original (etiquetados #0 a #253) permanecen congelados y se conservan intactos, mientras que se incorporan dos expertos nativos de hungaro (#254 y #255). Segun la model card, en cada paso de token se coactivan los top-8 expertos, de modo que los expertos del nucleo y los especificos de hungaro participan conjuntamente en la generacion. Esta estrategia busca preservar las capacidades originales del modelo base (razonamiento cientifico, codigo competitivo, motor agentico) sin sacrificarlas durante la adaptacion al hungaro.

El modelo base es Kataguru-Sceptic-35B-A3B-v3.1, del que hereda el nucleo de razonamiento y codigo, el encoder de vision de 27 capas y el motor de llamadas a herramientas con AST. La model card no detalla el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Las cuantizaciones GGUF de este repositorio estan calibradas con imatrix, lo que segun el autor mejora la fidelidad de la cuantizacion respecto a calibraciones genericas. El autor tambien menciona el uso de un pipeline multimodal image-text-to-text, con soporte para entrada de imagen y texto.

## Capacidades

- Generacion de texto y razonamiento en hungaro, finlandes e ingles, con conservacion del nucleo de razonamiento cientifico del modelo base.
- Programacion industrial: IEC 61131-3 (Structured Text para Beckhoff TwinCAT 3, SCL para Siemens TIA Portal/S7-1500), incluyendo maquinas de estado deterministas, control de movimiento (MC_MoveAbsolute, MC_Power, MC_GearIn) y control PID (PID_Compact).
- Generacion y auditoria de G-code CNC para Fanuc, Siemens Sinumerik 840D y Heidenhain, con compensacion de radio de herramienta (G41/G42), offsets de trabajo (G54-G59) y ciclos fijos (G71/G76/G81-G89).
- Diagnostico de protocolos industriales y fieldbuses: OPC UA (IEC 62541), Modbus TCP/RTU, EtherCAT, PROFINET, CANopen, con soporte para telemetria SCADA/MES.
- Conocimiento de estandares de seguridad funcional: ISO 13849-1 (PLa-PLe), IEC 62061/IEC 61508 (SIL 1-SIL 3), Safe Torque Off (STO) e interlocks de parada de emergencia.
- Programacion de sistemas y embebidos en C++20, Rust, C (RTOS), Python 3.12, C#/.NET, SQL y Bash/Linux.
- Tool calling y function calling con salida en formato AST (declarado 0 errores de sintaxis y 83,67 % en BFCL V4 AST).
- Capacidades agenticas multi-paso y soporte de RAG.
- Vision multimodal mediante encoder ViT de 27 capas: lectura de diagramas P&ID, esquemas electricos, pantallas de error HMI y graficos de ingenieria.
- Traduccion entre los idiomas soportados.
- Modo "uncensored" declarado por el autor (sin filtros de rechazo aparentes).

## Casos de uso

- Generacion y revision de codigo PLC en produccion: el modelo puede escribir y auditar bloques de Structured Text para TwinCAT 3 o SCL para S7-1500, incluyendo maquinas de estado y lazos PID, lo que lo hace adecuado para equipos de automatizacion que trabajan en hungaro o finlandes.
- Auditoria de programas CNC: analisis de G-code multi-eje, verificacion de compensaciones de herramienta, offsets y ciclos fijos, y deteccion de trayectorias con riesgo de colision en entornos Fanuc, Sinumerik o Heidenhain.
- Diagnostico de redes industriales: interpretacion de trazas y configuraciones de OPC UA, EtherCAT, PROFINET o Modbus para localizar fallos de comunicacion en planta, aprovechando el conocimiento del modelo sobre estos protocolos.
- Asistencia a ingenieros de seguridad funcional: revision de logica de parada de emergencia, calculo de categorias ISO 13849-1 y verificacion de niveles SIL, con generacion de documentacion tecnica asociada.
- Lectura de esquemas y pantallas HMI: gracias al encoder de vision, el modelo puede recibir una imagen de un diagrama P&ID o de una pantalla de error de una HMI y generar un diagnostico o pasos de resolucion en hungaro.
- Agente de soporte tecnico multi-paso: con tool calling en formato AST y soporte de RAG, puede integrarse en un asistente que consulte documentacion interna, bases de datos de incidencias y manuales de fabricante para resolver tickets de automatizacion.
- Desarrollo de software de sistemas embebidos: generacion de codigo en Rust, C++20 o C para RTOS, con enfasis en concurrencia y seguridad de memoria, adecuado para equipos que desarrollan firmware industrial.
- Traduccion tecnica especializada: traduccion de documentacion de automatizacion entre hungaro, finlandes e ingles preservando terminologia de dominio (IEC 61131-3, fieldbuses, seguridad funcional).

## Benchmarks y rendimiento

Los datos disponibles provienen exclusivamente de la model card del autor y corresponden al modelo base o a la version completa, no a esta cuantizacion GGUF concreta. No se han publicado resultados independientes de benchmarks en la informacion disponible.

| Benchmark | Resultado declarado |
|---|---|
| Media de 15 benchmarks | 70,26 % |
| GPQA Diamond | 70,20 % |
| LiveCodeBench v6 | 39,43 % |
| LiveCodeBench v6 (Easy) | 90,70 % |
| BFCL V4 AST | 83,67 % |
| PLC/CNC industrial (benchmark propio) | 96,67 % |

No se dispone de comparaciones con modelos similares en la informacion proporcionada. Los resultados del benchmark PLC/CNC corresponden a una evaluacion propia del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada: el autor indica que las cuantizaciones GGUF APEX estan pensadas para funcionar en una GPU de 16 GB. El repositorio completo ocupa 89,8 GB, pero cada variante APEX individual es mas pequena; el tamano exacto por variante no esta disponible en la informacion proporcionada.
- GPU recomendadas: el autor menciona compatibilidad con GPU de 16 GB para las variantes GGUF. Para las variantes NVFP4 (aproximadamente 20,9 GiB) y W4A16-AWQ (aproximadamente 19,5 GiB) del ecosistema se indica compatibilidad con una unica GPU de 24 GB (por ejemplo, RTX 4090 o A10G). No se especifican recomendaciones para A100 o H100 en la informacion disponible.
- Cabe en GPU de consumo: si, segun el autor, en GPU de 16 GB con las variantes APEX y en GPU de 24 GB con NVFP4 o AWQ.
- Opciones de despliegue: llama.cpp, LM Studio y Ollama (etiquetados explicitamente en el repositorio); vLLM para las variantes AWQ; el ecosistema incluye soporte para transformers. El fichero mmproj debe cargarse junto al modelo para habilitar la vision.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada. El modelo se posiciona en un nicho especifico (MoE de 35B totales y 3B activos, especializado en automatizacion industrial y con soporte nativo de hungaro) para el que no se han facilitado alternativas directas con especificaciones contrastables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-GGUF | 35,5B totales / 3B activos | no disponible | Apache 2.0 | Hugging Face (GGUF) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los benchmarks declarados (incluido el 96,67 % en PLC/CNC) proceden del autor y no han sido verificados de forma independiente; deben tomarse con cautela.
- La model card no especifica la longitud de contexto soportada, lo que dificulta planificar su uso en tareas de contexto largo (por ejemplo, auditoria de proyectos PLC completos).
- El soporte linguistico declarado se limita a ingles, hungaro y finlandes; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- El modelo se declara "uncensored", lo que implica ausencia de filtros de rechazo y traslada al integrador la responsabilidad de moderar salidas en produccion.
- La especializacion industrial conlleva riesgo de alucinacion en detalles normativos criticos (categorias de seguridad, SIL, parametros de G-code); cualquier salida en contextos de seguridad funcional debe ser revisada por un ingeniero cualificado.
- Las cuantizaciones GGUF introducen perdida de precision respecto a BF16; las variantes APEX-Small pueden degradar el rendimiento en tareas de razonamiento y codigo complejo.
- El modelo base es un fine-tune sobre un checkpoint del mismo autor (v3.1), sin documentacion publica del dataset de entrenamiento ni del proceso de alineacion (RLHF/DPO), lo que limita la evaluacion de sesgos.
- El repositorio tiene un volumen de descargas bajo (1064) y cero likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo en entornos industriales reales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-GGUF
- Pesos BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Hungarian-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-NVFP4
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Hungarian-v3.2-W4A16-AWQ
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Demo de ejemplos de uso: https://huggingface.co/spaces/kataguru/Kataguru-Sceptic-35B-Usage-Examples
- Guia de IA soberana: https://huggingface.co/spaces/kataguru/Kataguru-Sovereign-AI-Guide
- Perfil del autor: https://huggingface.co/kataguru
