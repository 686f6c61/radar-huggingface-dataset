# kataguru/Industry-Coder-27B-v2.0-GGUF

## Resumen

Kataguru Industry-Coder-27B v2.0 es un modelo multimodal (texto e imagen) de 27 mil millones de parámetros densos, especializado en ingeniería de software industrial, automatización PLC/CNC y programación agéntica. Desarrollado por kataguru a partir de Qwen/Qwen3.8-27B, se presenta como una suite oficial de cuantizaciones GGUF calibradas con `imatrix`, que incluye el proyector de visión en F16 (`mmproj`) y cabezas de predicción multi-token (`mtp`) para decodificación especulativa.

El modelo resuelve un nicho poco cubierto: generación de código para entornos de automatización industrial (Siemens SCL, Beckhoff TwinCAT 3 ST, G-code CNC, IEC 61131-3, OPC UA / IEC 62443) combinada con capacidades generales de razonamiento, matemáticas y código competitivo. Es bilingüe de forma nativa (finés e inglés, con soporte adicional de estonio, húngaro y turco) y ha pasado por un pipeline de "abliteration" (SOMA/ARA) que elimina las negativas del modelo, además de un entrenamiento anti-sicofancia.

Según la model card, alcanza una media de 68,73 % en 15 benchmarks (+8,42 puntos sobre la base Qwen3.8-27B), con resultados destacables en LiveCodeBench v6 (42,29 %), BFCL V4 para tool calling agéntico (73,14 %) y GPQA Diamond (66,16 %). La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer denso multimodal, image-text-to-text) |
| Parametros totales | 26.895.998.464 (~27 B) |
| Parametros activos | no disponible (no se indica arquitectura MoE; todo apunta a modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_NL, IQ4_XS, IQ3_S, IQ3_XXS; mmproj en F16; MTP en Q8_0 y Q4_K_M |
| Idiomas soportados | fines (fi), ingles (en), estonio (et), hungaro (hu), turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp y LM Studio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer denso multimodal de 27 B de parámetros con capacidades de visión (image-text-to-text). La suite GGUF incluye el proyector multimodal (`mmproj`) en F16 completo, lo que permite conservar la calidad de visión incluso al usar cuantizaciones agresivas en el LLM principal. Incluye además cabezas `mtp` (Multi-Token Prediction) para decodificación especulativa, disponibles en Q8_0 y Q4_K_M, lo que puede acelerar la inferencia en llama.cpp.

El ajuste fino se realizó mediante el "4-Cycle Dynamic Epistemic Curriculum" de kataguru (Sykli 1 a Sykli 4), con 20.000 muestras certificadas compuestas en un 70 % por programación competitiva, arquitectura de sistemas y PLC/CNC industrial, y un 30 % de "Elite Anchor" permanente. El curriculum es bilingüe con un 40 % de finés nativo y 60 % de inglés. Técnicamente se empleó QLoRA con subespacio ortonormal QR-Frozen-A de rango 16 (`lora_r=16`, `lora_alpha=32`). Antes y durante el SFT se aplicó el pipeline SOMA/ARA de hibridación ortogonal (proyección del vector de negativa fuera de `self_attn.o_proj`, `linear_attn.out_proj` y `mlp.down_proj`), verificando un 0,00 % de negativas. No se detalla el número total de tokens de entrenamiento ni el uso de RLHF/DPO.

## Capacidades

- Generación de código en C, Rust, Python, TypeScript, Java y lenguajes IEC 61131-3 (Siemens SCL, Beckhoff TwinCAT 3 ST), además de G-code CNC.
- Programación competitiva y arquitectura de sistemas (LiveCodeBench v6: 42,29 %).
- Tool calling agéntico (BFCL V4: 73,14 %, con 99,00 % en casos "Multiple" y 96,25 % en "Python Simple").
- Razonamiento STEM de nivel posgrado (GPQA Diamond: 66,16 %) y matemáticas con cadena de razonamiento (GSM8K: 86,73 %).
- Comprensión multimodal: análisis de diagramas y documentación técnica a partir de imágenes, vía el `mmproj` incluido en F16.
- Ciberseguridad ofensiva y defensiva sin restricciones (Kali Linux, pentesting, hardening OPC UA / IEC 62443, ingeniería inversa, análisis forense), con 0 % de negativas verificadas.
- Anti-sicofancia estricta: no usa frases de cortesía vacías y cuestiona premisas erróneas desde primeros principios.
- Dominio bilingüe finés/inglés de grado nativo, con morfología finesa verificada según Kotus y cambio fluido entre código y documentación en ambos idiomas.
- Plantilla de chat de cuatro modos ("Sovereign Quad-Mode v2.1") para conmutar entre modos cognitivos de razonamiento (la documentación detallada de cada modo no está disponible en la información proporcionada).

## Casos de uso

- Programación de PLC industriales: generación y revisión de código IEC 61131-3 en Siemens SCL o TwinCAT 3 ST, con vocabulario técnico específico de automatización; el 70 % del curriculum se centró precisamente en este dominio.
- Asistentes de ciberseguridad ofensiva/defensiva: al estar completamente "uncensored", puede asistir en pentesting con Kali Linux, análisis forense y hardening de protocolos industriales (OPC UA, IEC 62443) sin negativas ni moralización.
- Agentes de código con herramientas: su 73,14 % en BFCL V4 y 99 % en llamadas múltiples lo hacen adecuado para pipelines agénticos multi-paso que orquestan herramientas externas (ejecución de tests, gestión de repositorios, despliegues).
- Análisis de documentación técnica visual: gracias al `mmproj` multimodal, puede interpretar esquemas eléctricos, diagramas de arquitectura o capturas de HMI y razonar sobre ellas en finés o inglés.
- Ingeniería de localización finesa: generación de documentación técnica, especificaciones y comentarios de código en finés nativo sin anglicismos ni terminación de casos incorrecta, algo poco habitual en modelos abiertos.
- Tutoría y resolución de problemas STEM: con 86,73 % en GSM8K y 66,16 % en GPQA Diamond, sirve para resolver y explicar matemáticas y problemas de nivel posgrado.
- Revisión de código con honestidad epistémica: su anti-sicofancia lo hace útil como revisor crítico que señala errores de ingeniería directamente, sin elogios superfluos.
- Desarrollo embebido en entornos sin conexión: las cuantizaciones IQ3/IQ4 en GGUF permiten desplegar el modelo localmente en estaciones de trabajo de planta con LM Studio o llama.cpp.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (comparados con la base Qwen/Qwen3.8-27B):

| Benchmark | Industry-Coder-27B v2.0 | Qwen3.8-27B (base) |
|---|---|---|
| Media total (15 benchmarks) | 68,73 % | 60,31 % (+8,42 pt) |
| LiveCodeBench v6 (175 problemas) | 42,29 % (Easy 95,35 %, Medium 48,08 %, Hard 10,00 %) | 26,86 % |
| IFEval Strict — Prompt (541 prompts) | 74,86 % | 48,20 % |
| IFEval Strict — Instruction (812 restricciones) | 81,89 % | 58,40 % |
| BFCL V4 Agentic Tool Calling (1.719 casos AST) | 73,14 % (Live AST 85,27 %, Python Simple 96,25 %, Multiple 99,00 %) | 62,60 % |
| GPQA Diamond (198 tareas) | 66,16 % | 45,20 % |
| GSM8K CoT (1.319 problemas) | 86,73 % strict / 87,79 % flexible | 76,50 % |
| MedQA (1.273 tareas USMLE) | 82,80 % | 74,20 % |
| TruthfulQA MC2 | 53,06 % | 47,50 % |

Nota: estos resultados proceden de la model card del autor; no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada: con cuantizaciones IQ3_XXS/IQ3_S (~12-14 GB para el LLM) más el mmproj F16; con IQ4_NL/IQ4_XS (~15-17 GB). El tamaño total del repo (60,6 GB) sugiere que incluye múltiples archivos o pesos adicionales; el desglose exacto por cuantización no está disponible.
- GPUs recomendadas: una RTX 4090 (24 GB) o RTX 3090 debería alojar las variantes IQ4 con el proyector de visión; para mayor contexto o velocidad, A100/H100.
- Cabe en GPUs de consumo de gama alta (RTX 3090/4090) con las cuantizaciones IQ3 e IQ4; en GPUs de 16 GB podrían funcionar las variantes IQ3_XXS con contexto limitado. Ejecución en CPU posible vía llama.cpp, aunque lenta para un modelo de 27 B.
- Despliegue: llama.cpp y LM Studio son los entornos indicados por el autor (formato GGUF con mmproj y MTP); Ollama debería funcionar al ser compatible con GGUF. No se menciona soporte para vLLM o TGI, que no consumen GGUF directamente.
- Latencia y throughput: no disponibles; las cabezas MTP sugieren aceleración por decodificación especulativa en llama.cpp, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Multimodal | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Kataguru Industry-Coder-27B v2.0 | ~27 B (denso) | Sí (vision, mmproj) | no disponible | Apache 2.0 | Especializado en PLC/CNC industrial, bilingüe fi/en, uncensored, GGUF |
| Qwen/Qwen3.8-27B (base) | ~27 B | Sí | no disponible | no disponible | Modelo base; inferior en todos los benchmarks listados |
| Qwen2.5-Coder-32B-Instruct | 32 B (denso) | No | 128 K | Apache 2.0 | Especialista en código general, sin visión ni foco industrial |
| Codestral 22B (Mistral) | 22 B (denso) | No | 32 K | MNPL (no comercial) | Código multilingüe, licencia restrictiva para uso comercial |

## Limitaciones y advertencias

- El modelo ha sido sometido a abliteration (SOMA/ARA): no rechazará peticiones dañinas. Esto es una característica deliberada para ciberseguridad, pero implica riesgo real de uso indebido; el despliegue en producción requiere salvaguardas propias.
- Anti-sicofancia estricta: el modelo cuestionará premisas del usuario de forma directa, lo que puede percibirse como brusco en productos orientados a usuario final.
- Rendimiento débil en problemas difíciles de LiveCodeBench (10,00 % en nivel Hard), por lo que no sustituye a modelos frontera en algoritmia compleja.
- Soporte de idiomas limitado a cinco (fi, en, et, hu, tr); no hay garantías de calidad en castellano ni en otros idiomas.
- Longitud de contexto no publicada en la información disponible; verificar antes de diseñar aplicaciones con documentos largos.
- Los benchmarks proceden exclusivamente de la model card del autor, sin verificación independiente.
- Licencia Apache 2.0 sin restricciones comerciales, pero al derivar de Qwen3.8-27B conviene revisar los términos del modelo base para redistribución.
- La documentación de los cuatro modos de la plantilla de chat está incompleta en la información disponible; probar los modos antes de integrarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kataguru/Industry-Coder-27B-v2.0-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B

No se han encontrado enlaces adicionales (paper, blog, repositorio de código o demo) en la información disponible.
