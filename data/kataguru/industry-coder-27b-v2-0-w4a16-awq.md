# kataguru/Industry-Coder-27B-v2.0-W4A16-AWQ

## Resumen

Kataguru Industry-Coder-27B v2.0 W4A16-AWQ es la version cuantizada a 4 bits del modelo Kataguru Industry-Coder-27B v2.0, un modelo denso multimodal de 27.781 millones de parametros desarrollado por kataguru sobre la base de Qwen/Qwen3.8-27B. Esta pensado para ingenieria de software industrial, automatizacion PLC/CNC y coding agentico, con soporte nativo de vision y de prediccion multi-token (MTP). La version que nos ocupa aplica cuantizacion AWQ W4A16 simetrica en grupos de 128 mediante `compressed-tensors`, optimizada para los kernels MarLin de vLLM.

El modelo se entrena con un curriculum epistemico dinamico de cuatro ciclos sobre 20.000 muestras doradas certificadas, con un 70 % orientado a programacion competitiva, arquitectura de sistemas y automatizacion industrial (IEC 61131-3, TwinCAT, SCL, G-code) y un 30 % de Elite Anchor permanente. Segun la model card, alcanza una media total de 68,73 % en un conjunto de 15 benchmarks, lo que supone 8,42 puntos porcentuales por encima del modelo base Qwen3.8-27B.

Es relevante porque combina un tamano manejable en una sola GPU de 80 GB (gracias a la cuantizacion a 4 bits), capacidades multimodales, soporte bilingue fino/ingles con morfologia finesa verificada y un pipeline de "abliteracion" orientado a eliminar rechazos en dominios tecnicos y de ciberseguridad. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3_5ForConditionalGeneration), con atencion lineal y prediccion multi-token (MTP) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16-AWQ simetrica, grupos de 128, formato `compressed-tensors`; pesos de vision (`model.visual.*`) y MTP (`mtp.*`) preservados en BF16 |
| Idiomas soportados | fi, en, et, hu, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors / AWQ) |

## Arquitectura y entrenamiento

El modelo es un transformer denso multimodal de 27.781 millones de parametros con cabecera de generacion condicional imagen-texto. Incluye un codificador visual (333 tensores BF16 bajo `model.visual.*`) y un modulo de prediccion multi-token (15 tensores BF16 bajo `mtp.*`), ambos mantenidos en precision completa tras la cuantizacion. La atencion combina mecanismos estandar con atencion lineal (`linear_attn.out_proj`), y el ajuste fino se realiza con QLoRA de rango 16 y alpha 32 sobre un subespacio ortonormal QR congelado en A.

El entrenamiento sigue el denominado 4-Cycle Dynamic Epistemic Curriculum (Sykli 1 a Sykli 4), con 20.000 muestras doradas certificadas repartidas en un 70 % de programacion competitiva, arquitectura de sistemas y automatizacion industrial, y un 30 % de Elite Anchor permanente. El curriculum es bilingue con un 40 % de fines nativo y un 60 % de ingles. Antes y durante el SFT se aplica el pipeline SOMA/ARA, que aísla la direccion de activacion de rechazo mediante contraste de pares de prompt-completion identicos y la proyecta fuera de las matrices `self_attn.o_proj`, `linear_attn.out_proj` y `mlp.down_proj`. La cuantizacion AWQ posterior usa grupos simetricos de 128 y esta pensada para los kernels MarLin de vLLM.

## Capacidades

- Generacion de texto y razonamiento tecnico en dominios de ingenieria de software, matematicas y STEM de nivel graduado.
- Generacion y comprension de codigo en C, Rust, Python, TypeScript, Java e IEC 61131-3 (SCL de Siemens, Structured Text de Beckhoff TwinCAT 3, G-code CNC).
- Vision multimodal: analisis de diagramas tecnicos, esquemas y documentacion grafica (pipeline `image-text-to-text`).
- Tool calling y function calling agentico, con soporte evaluado en BFCL V4 (AST y Live AST).
- Razonamiento multi-paso y coding agentico.
- Capacidades multilingues nativas en fines, ingles, estonio, hungaro y turco, con enfasis especial en fines (morfologia verificada con Kotus).
- Modo de chat cuadruple ("Quad-Mode") definido en la plantilla `chat_template.jinja` v2.1.
- Comportamiento anti-sicofancia: no usa formulas de cortesia huecas y cuestiona premisas erroneas.
- Politica de "zero-refusal" en dominios tecnicos, de ciberseguridad ofensiva/defensiva y cientificos.

## Casos de uso

- Automatizacion industrial con PLC: generacion y revision de logica en SCL de Siemens y Structured Text de TwinCAT 3 para lineas de produccion, aprovechando el entrenamiento especifico en IEC 61131-3 y su capacidad de razonar sobre interbloqueos de seguridad.
- Programacion CNC: traduccion de especificaciones de mecanizado a G-code y analisis de trayectorias a partir de planos o diagramas introducidos como imagen, gracias al codificador visual.
- Asistente de ciberseguridad industrial: auditoria de configuraciones OPC UA e IEC 62443, pruebas de penetracion y analisis forense sin rechazos moralizantes, adecuado para equipos de seguridad que necesitan respuestas tecnicas directas.
- Coding agentico en pipelines de CI/CD: integracion mediante tool calling y BFCL para tareas de refactorizacion, generacion de tests y resolucion de issues en repositorios, con la ventaja de ejecutarse en una sola GPU de 80 GB.
- Documentacion tecnica bilingue: redaccion de especificaciones de arquitectura y comentarios de codigo en fines e ingles con terminologia compuesta correcta, util para equipos nordicos que operan en ambos idiomas.
- Formacion y evaluacion de ingenieros: generacion de problemas de programacion competitiva y ejercicios de nivel STEM graduado (GPQA, LiveCodeBench) con explicaciones paso a paso.
- Analisis de diagramas de ingenieria: interpretacion de esquemas electricos o de proceso en formato imagen y extraccion de la logica de control correspondiente.

## Benchmarks y rendimiento

Resultados publicados en la model card (media total en 15 benchmarks: 68,73 %, +8,42 pp sobre Qwen3.8-27B base):

| Benchmark | Industry-Coder-27B v2.0 | Qwen3.8-27B base | Diferencia |
|---|---|---|---|
| LiveCodeBench v6 (175 problemas) | 42,29 % (74/175) | 26,86 % | +15,43 pp |
| LiveCodeBench v6 Easy | 95,35 % | no disponible | no disponible |
| LiveCodeBench v6 Medium | 48,08 % | no disponible | no disponible |
| LiveCodeBench v6 Hard | 10,00 % | no disponible | no disponible |
| IFEval Strict (Prompt) | 74,86 % | 48,20 % | +26,66 pp |
| IFEval Strict (Instruction) | 81,89 % | 58,40 % | +23,49 pp |
| BFCL V4 Agentic Tool Calling (1.719 casos AST) | 73,14 % | 62,60 % | +10,54 pp |
| BFCL V4 Live AST | 85,27 % | no disponible | no disponible |
| BFCL V4 Python Simple | 96,25 % | no disponible | no disponible |
| BFCL V4 Multiple | 99,00 % | no disponible | no disponible |
| BFCL V4 Live Relevance | 93,75 % | no disponible | no disponible |
| GPQA Diamond (198 tareas) | 66,16 % (131/198) | 45,20 % | +20,96 pp |
| GSM8K CoT (1.319 problemas, estricto) | 86,73 % | 76,50 % | +10,23 pp |
| GSM8K CoT (flexible) | 87,79 % | no disponible | no disponible |
| MedQA (1.273 tareas USMLE) | 82,80 % | 74,20 % | +8,60 pp |
| TruthfulQA MC2 | 53,06 % | 47,50 % (inferido de +5,56 pp) | +5,56 pp |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20-22 GB solo para pesos en W4A16 (27.781 M de parametros a 4 bits mas los tensores BF16 de vision y MTP), mas overhead de cache KV y activaciones; en la practica, 24-32 GB para contextos moderados.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB; en consumer, RTX 4090 24 GB o RTX 5090 pueden ser suficientes para contextos cortos, con margen ajustado.
- Cabe en GPU consumer de gama alta (24 GB) con cuantizacion W4A16 y contexto limitado; no cabe en GPUs de 16 GB o menos.
- Opciones de despliegue: vLLM con kernels MarLin (ruta principal, dado el formato `compressed-tensors`); soporte de transformers; llama.cpp/Ollama no estan indicados de forma explicita en la informacion disponible para este formato AWQ.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Kataguru Industry-Coder-27B v2.0 W4A16-AWQ | 27,78 B (denso) | no disponible | Apache 2.0 | safetensors AWQ / vLLM | Multimodal, PLC/CNC, zero-refusal, bilingue fi/en |
| Qwen/Qwen3.8-27B (base) | 27,8 B (denso) | no disponible | no disponible | safetensors BF16 | Modelo base; referencia de benchmarks |
| Alternativas de 27-32 B en BF16 | 27-32 B | no disponible | variable | safetensors | Requieren 54-64 GB de VRAM en BF16 frente a ~20 GB en W4A16 |

## Limitaciones y advertencias

- La cuantizacion W4A16 introduce perdida de precision frente al modelo BF16 original; los benchmarks publicados corresponden al modelo v2.0 y no se especifica si se midieron sobre esta version cuantizada.
- El pipeline SOMA/ARA elimina deliberadamente los rechazos; esto puede producir respuestas en dominios sensibles (ciberseguridad ofensiva, materiales peligrosos) sin las salvaguardas habituales, lo que exige controles externos en produccion.
- Riesgo de alucinacion en codigo y en datos tecnicos, especialmente en dominios industriales muy especializados; se recomienda validacion humana de la logica de control PLC/CNC antes de desplegarla.
- Cobertura linguistica limitada a fi, en, et, hu y tr; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar cargas de trabajo de contexto largo.
- El comportamiento anti-sicofancia puede resultar brusco en interfaces de atencion al cliente; no es adecuado para tonos conversacionales suaves.
- El soporte de tooling esta orientado a vLLM con kernels MarLin; otros runners pueden no soportar el formato `compressed-tensors` correctamente.
- Solo 52 descargas y 0 likes en el momento de la ficha: ecosistema y validacion comunitaria reducidos.

## Enlaces

- Hugging Face: https://huggingface.co/kataguru/Industry-Coder-27B-v2.0-W4A16-AWQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio vLLM (kernels MarLin): https://github.com/vllm-project/vllm
- Documentacion de compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Paper de AWQ (Activation-aware Weight Quantization): https://arxiv.org/abs/2306.00978
- Perfil del autor: https://huggingface.co/kataguru
