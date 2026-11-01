# kataguru/Industry-Coder-27B-v2.0-NVFP4

## Resumen

Kataguru Industry-Coder-27B v2.0 NVFP4 es una cuantizacion nativa para NVIDIA Blackwell del modelo Kataguru Industry-Coder-27B v2.0, un modelo denso multimodal de 27.781 millones de parametros construido sobre Qwen/Qwen3.8-27B. Lo desarrolla el usuario kataguru y esta orientado a ingenieria de software industrial, automatizacion PLC/CNC y codigo agentico, con un enfasis declarado en el bilinguismo finlandes-ingles. La cuantizacion emplea el formato FP4 E2M1 con escalas de microbloque FP8 E4M3 y escala global FP32 unificada, empaquetada con `compressed-tensors` para ejecucion nativa en hardware Blackwell (SM100/SM120) mediante vLLM.

El modelo base se entrena con un curriculum de cuatro ciclos (Sykli 1 a Sykli 4) sobre 20.000 muestras certificadas, con un 70 % centrado en programacion competitiva, arquitectura de sistemas y PLC/CNC industrial, y un 30 % de Elite Anchor permanente. El ajuste se realiza con QLoRA de rango 16 (QR-Frozen-A Orthonormal Subspace), y el autor declara una mejora media de +8,42 puntos porcentuales sobre Qwen/Qwen3.8-27B en un agregado de 15 benchmarks.

La relevancia actual del modelo reside en dos factores: por un lado, la preservacion integra en BF16 de los pesos de vision (333 tensores) y de Multi-Token Prediction (15 tensores) dentro de una cuantizacion FP4, lo que permite mantener capacidades multimodales y de decodificacion especulativa; por otro, la inclusion de un pipeline de "abliteracion" (SOMA/ARA) que elimina los rechazos en dominios tecnicos, algo que el autor presenta como "zero-refusal" y que conviene evaluar con cautela en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (`Qwen3_5ForConditionalGeneration`), con modulo de vision y Multi-Token Prediction (MTP) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1) con microbloque FP8 E4M3 y escala global FP32; pesos de vision y MTP en BF16 |
| Idiomas soportados | Finlandes (fi), ingles (en), estonio (et), hungaro (hu), turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con `compressed-tensors` (8-bit/FP4), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo es un transformer denso multimodal de 27.781 millones de parametros derivado de Qwen/Qwen3.8-27B. La arquitectura incluye un codificador visual (`model.visual.*`, 333 tensores en BF16) y un cabezal de Multi-Token Prediction (`mtp.*`, 15 tensores en BF16), ambos preservados en precision completa pese a la cuantizacion FP4 del resto de la red. Los 80 grupos lineales fusionados QKV y Gate-Up estan normalizados a una `weight_global_scale` unificada para permitir la ejecucion nativa en vLLM mediante kernels MarLin/Cutlass FP4 sobre GPUs Blackwell.

El entrenamiento del modelo base se estructura en cuatro ciclos (Sykli 1 a Sykli 4) con 20.000 muestras certificadas, distribuidas en un 70 % de programacion competitiva, arquitectura de sistemas e ingenieria industrial (Siemens SCL, Beckhoff TwinCAT 3 ST, G-code CNC, OPC UA/IEC 62443) y un 30 % de Elite Anchor permanente. El ajuste utiliza QLoRA de rango 16 con `lora_alpha=32` sobre una base ortogonal congelada (QR-Frozen-A). El autor declara un equilibrio bilingue del 40 % finlandes y 60 % ingles en cada ciclo. Adicionalmente, se aplica un pipeline SOMA/ARA que proyecta fuera del subespacio de rechazo las matrices `self_attn.o_proj`, `linear_attn.out_proj` y `mlp.down_proj` mediante ortogonalizacion de pesos, seguido de un SFT de rango 16 sobre el 30 % de Elite Anchor.

## Capacidades

- Generacion de texto y razonamiento en finlandes e ingles, con soporte adicional declarado para estonio, hungaro y turco.
- Generacion de codigo en C, Rust, Python, TypeScript, Java y lenguajes de automatizacion industrial (IEC 61131-3, Siemens SCL, Beckhoff TwinCAT 3 ST, G-code CNC).
- Razonamiento matematico y STEM de nivel graduado, con resultados declarados en GSM8K, GPQA Diamond y MedQA.
- Vision multimodal: analisis de diagramas e imagenes a traves del pipeline `image-text-to-text`.
- Tool calling y function calling agentico, medido con BFCL V4 (AST, Python simple, multiple, live relevance).
- Multi-Token Prediction (MTP) para decodificacion especulativa y mejora de throughput.
- Modo "uncensored" con rechazos declarados del 0,00 % en dominios tecnicos (ciberseguridad ofensiva/defensiva, forense, ciencia independiente).
- Postura anti-sycophancy: el autor declara que el modelo no usa formulas de cortesia vacias y cuestiona premisas erroneas.
- Plantilla de chat "Sovereign Quad-Mode" (cuatro modos de consulta, segun la model card).

## Casos de uso

- Generacion de codigo de automatizacion industrial: el modelo puede producir logica en IEC 61131-3, SCL de Siemens o ST de TwinCAT 3 a partir de especificaciones textuales, lo que encaja en equipos de integracion PLC/CNC que necesitan prototipado rapido de bloques de control.
- Asistente de ingenieria de software agentico: con soporte de tool calling medido en BFCL V4 (73,14 % AST), puede integrarse en pipelines que requieran invocar funciones, consultar APIs y encadenar pasos multi-turno.
- Analisis de diagramas tecnicos: al conservar el codificador visual en BF16, puede procesar esquemas electricos, planos P&ID o diagramas de red y extraer descripciones o generar documentacion asociada.
- Documentacion tecnica bilingue: genera comentarios, especificaciones de arquitectura y manuales en finlandes e ingles con morfologia finlandesa verificada, util para empresas nordicas que operan en ambos idiomas.
- Auditoria de ciberseguridad industrial: el modelo declara capacidad para tareas de hardening OPC UA/IEC 62443 y analisis forense sin rechazos, aplicable a revisiones de configuracion y analisis de vulnerabilidades en entornos OT.
- Razonamiento STEM y soporte a investigacion: con resultados declarados de 66,16 % en GPQA Diamond y 82,80 % en MedQA, puede emplearse como asistente de revision de literatura tecnica o resolucion de problemas de nivel graduado.
- Despliegue en infraestructura Blackwell: al estar cuantizado en NVFP4 y optimizado para vLLM con kernels MarLin/Cutlass, es adecuado para servir inferencia de 27B en GPUs Blackwell con requisitos de VRAM reducidos frente a BF16.

## Benchmarks y rendimiento

| Benchmark | Industry-Coder-27B v2.0 | Qwen/Qwen3.8-27B (base) | Delta |
|---|---|---|---|
| LiveCodeBench v6 (175 problemas) | 42,29 % | 26,86 % | +15,43 pp |
| LiveCodeBench v6 Easy | 95,35 % | no disponible | no disponible |
| LiveCodeBench v6 Medium | 48,08 % | no disponible | no disponible |
| LiveCodeBench v6 Hard | 10,00 % | no disponible | no disponible |
| IFEval Strict (Prompt) | 74,86 % | 48,20 % | +26,66 pp |
| IFEval Strict (Instruction) | 81,89 % | 58,40 % | +23,49 pp |
| BFCL V4 Agentic Tool Calling (AST) | 73,14 % | 62,60 % | +10,54 pp |
| BFCL V4 Live AST | 85,27 % | no disponible | no disponible |
| BFCL V4 Python Simple | 96,25 % | no disponible | no disponible |
| BFCL V4 Multiple | 99,00 % | no disponible | no disponible |
| BFCL V4 Live Relevance | 93,75 % | no disponible | no disponible |
| GPQA Diamond (198 tareas) | 66,16 % | 45,20 % | +20,96 pp |
| GSM8K CoT (1.319 problemas) | 86,73 % estricto / 87,79 % flexible | 76,50 % | +10,23 pp |
| MedQA (1.273 tareas USMLE) | 82,80 % | 74,20 % | +8,60 pp |
| TruthfulQA MC2 | 53,06 % | 47,50 % (inferido del delta declarado) | +5,56 pp |
| Media total 15 benchmarks | 68,73 % | 60,31 % (inferido del delta declarado) | +8,42 pp |

Los datos proceden de la model card del autor. No se han publicado resultados independientes que verifiquen estas cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 28,6 GB en FP4/`compressed-tensors`; se requiere GPU con soporte nativo de FP4 (Blackwell) para aprovechar los kernels MarLin/Cutlass de vLLM. En GPUs no Blackwell la cuantizacion NVFP4 no se ejecutara de forma nativa.
- GPUs recomendadas: NVIDIA Blackwell (SM100/SM120), como B200 o RTX 50xx con soporte FP4. El modelo esta explicitamente optimizado para esta generacion.
- Cabe en GPU de consumo: si la GPU es Blackwell con VRAM suficiente para los ~28,6 GB de pesos mas overhead de activaciones y KV cache; no se especifica el minimo exacto.
- Opciones de despliegue: vLLM (recomendado por el autor, con kernels MarLin/Cutlass FP4), transformers (libreria declarada). No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. El modulo MTP puede contribuir a decodificacion especulativa, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kataguru Industry-Coder-27B v2.0 NVFP4 | 27,78 B (denso) | no disponible | Apache 2.0 | Safetensors FP4 (`compressed-tensors`) | Multimodal, MTP, especializado en PLC/CNC y codigo agentico, 5 idiomas |
| Qwen/Qwen3.8-27B (base) | 27 B (denso) | no disponible | no disponible | Safetensors BF16 | Modelo base del que deriva; sin el ajuste industrial ni la uncensoring |
| Alternativas de 27B-30B en codigo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la informacion proporcionada |

La comparativa con alternativas de la misma categoria no puede completarse con datos verificables a partir de la informacion disponible. El unico contraste solido es frente al modelo base Qwen/Qwen3.8-27B, con los deltas de benchmarks indicados en la seccion anterior.

## Limitaciones y advertencias

- Los benchmarks son autodeclarados por el autor y no han sido verificados de forma independiente; deben tomarse como indicativos.
- El pipeline "uncensored" (SOMA/ARA) elimina los rechazos en dominios tecnicos, lo que puede producir respuestas en areas sensibles (ciberseguridad ofensiva, forense) sin las salvaguardas habituales; requiere supervision y politicas de uso claras en produccion.
- La cuantizacion NVFP4 esta ligada a hardware Blackwell; en GPUs anteriores el modelo puede no ejecutarse de forma nativa o degradar su rendimiento.
- El soporte linguistico se limita a finlandes, ingles, estonio, hungaro y turco; no se declara soporte de castellano, lo que limita su uso directo en entornos hispanohablantes.
- No se especifica la longitud de contexto, dato critico para planificar cargas de trabajo con documentos largos.
- El modelo es un ajuste fino sobre Qwen/Qwen3.8-27B con 20.000 muestras; puede heredar sesgos del modelo base y presentar alucinaciones en dominios no cubiertos por el curriculum.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo en dominios regulados (industrial, medico, seguridad).
- El repositorio tiene solo 54 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- HuggingFace: https://huggingface.co/kataguru/Industry-Coder-27B-v2.0-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
