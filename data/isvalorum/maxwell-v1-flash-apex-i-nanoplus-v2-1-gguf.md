# IsValorum/Maxwell-V1-Flash-APEX-I-NanoPlus-V2.1-GGUF

## Resumen

Maxwell-V1-Flash-APEX-I-NanoPlus-V2.1-GGUF es una cuantización GGUF del modelo base `maxwell-model/Maxwell-V1-Flash`, publicada por el usuario IsValorum dentro de su serie "APEX Quantization Series". El modelo original emplea una arquitectura denominada `maxwell-moe` (mezcla de expertos) con aproximadamente 35.970 millones de parámetros totales en precisión BF16, y esta versión cuantizada ocupa 12,08 GiB en disco (13,0 GB de repositorio), lo que la sitúa en el tier "NanoPlus" de la familia.

El interés de esta publicación reside en su estrategia de cuantización "quirúrgica" por tensor: en lugar de aplicar un único tipo de cuantización global, asigna precisiones distintas (Q6_K, Q4_K, IQ4_XS, IQ3_XXS, Q3_K) según la función de cada proyección dentro del transformer MoE, preservando en mayor medida las capas de atención y los expertos compartidos frente a los expertos enrutados. Esto la hace relevante para quienes necesitan ejecutar un MoE de ~36B parámetros en hardware de consumo mediante llama.cpp.

La ficha se basa exclusivamente en los metadatos de Hugging Face y en la model card del autor. No hay información publicada sobre el modelo base (datos de entrenamiento, contexto, benchmarks ni idiomas), por lo que numerosos campos se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `maxwell-moe` (mezcla de expertos, transformer) |
| Parametros totales | 35.970.737.539 (~36B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con mezcla por tensor: Q6_K, Q4_K, IQ4_XS, IQ3_XXS, Q3_K; protecciones recurrentes en F32 (271 tensores) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); fuente de cuantización BF16 |
| Tamano del repo | 13,0 GB (12,08 GiB en el tier NanoPlus) |
| Imatrix | `AtomicChat/Maxwell-V1-Flash-GGUF-metrics`, 4.766.918 tokens |
| Pipeline | text-generation |
| Etiquetas | conversational, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo base `maxwell-model/Maxwell-V1-Flash` emplea una arquitectura de mezcla de expertos (`maxwell-moe`) con 45 bloques (`blk.0` a `blk.44`). La estructura observada en el mapa de tensores revela tres bloques iniciales (`blk.0..2`) con FFN densa y 42 bloques (`blk.3..44`) con expertos compartidos (`ffn_*_shexp`) y expertos enrutados (`ffn_*_exps`). No se dispone de información sobre el número de expertos por capa, la dimensión oculta, el número de cabezas de atención ni la longitud de contexto nativa.

Respecto al entrenamiento, la model card no documenta número de tokens, composición del dataset, ni si hubo RLHF, DPO u otras fases de alineación. La única información técnica disponible es la relativa al proceso de cuantización: se parte de pesos BF16, se aplica una imatrix calculada sobre 4.766.918 tokens y se asigna precisión por tensor. Las proyecciones de atención `attn_output` se mantienen en Q6_K, mientras que `attn_q`, `attn_k` y `attn_v` bajan a Q4_K; los expertos compartidos se cuantizan en Q4_K y los expertos enrutados en IQ3_XXS (con Q3_K en los bloques 3-4 y 43-44). El tensor de salida `output.weight` se preserva en Q6_K y el embedding en Q4_K.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican uso previsto para diálogo multi-turno.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible`, lo que sugiere integración con servidores de inferencia tipo API.
- Ejecución local vía llama.cpp: los pesos GGUF permiten inferencia en CPU, CUDA y Vulkan.
- Integración con V-Agent: el autor distribuye un agente de escritorio Windows open source que carga estos GGUF y expone herramientas MCP.
- Capacidades de razonamiento, código, matemáticas, visión o audio: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información del modelo; el tool calling documentado pertenece al agente V-Agent, no al modelo.
- Capacidades multilingües: no disponible.

## Casos de uso

- Despliegue local en estación de trabajo con GPU de consumo: con 12,08 GiB de pesos, el modelo puede cargarse en GPUs de 16 GB (RTX 4060 Ti, RTX 4070 Ti Super, RTX 4080) dejando margen para KV cache, o parcialmente en GPUs de 12 GB con offload a CPU.
- Asistente conversacional offline: la naturaleza GGUF y la etiqueta `conversational` permiten montar un chatbot local sin dependencia de APIs externas, útil en entornos con requisitos de privacidad.
- Integración en V-Agent para flujos con herramientas: el agente del autor ofrece siete servidores MCP (ficheros, comandos, búsqueda web, navegador, escritorio, descargas HTTP y Hugging Face), de modo que el modelo puede operar como motor de razonamiento de un agente de escritorio.
- Servidor de inferencia compatible con endpoints: gracias a `endpoints_compatible`, puede servirse con llama.cpp server o vLLM (si soporta la arquitectura) para aplicaciones que consuman una API OpenAI-like.
- Experimentación con cuantización selectiva: el mapa de tensores público permite estudiar el impacto de distintas precisiones por componente en un MoE, útil para investigadores que evalúen técnicas de cuantización.
- Prototipado de aplicaciones de texto en hardware modesto: al ser un MoE de ~36B con solo 12 GiB en disco, permite probar cargas de trabajo de modelos grandes en máquinas que no admitirían un denso equivalente en BF16 (~72 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~12,1 GiB solo para pesos; con KV cache y overhead de llama.cpp, prever 14-16 GiB para contexto moderado. El valor exacto depende de la longitud de contexto, que no está documentada.
- GPU recomendadas: RTX 4080 / 4090 (16-24 GB) para carga completa; A100/H100 sobredimensionadas para este tamaño, útiles solo si se sirven muchas instancias.
- GPU de consumo: cabe en RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4080 16 GB y RTX 4090 24 GB. En GPUs de 12 GB (RTX 3060, 4070) requiere offload parcial a CPU.
- Opciones de despliegue: llama.cpp (CUDA, Vulkan, CPU), servidor llama.cpp con API compatible, V-Agent (incluye llama.cpp, Strata/PolyStrata, Strata Rust y Project Maya como motores locales). Compatibilidad con vLLM, TGI u Ollama no está confirmada para la arquitectura `maxwell-moe`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Maxwell-V1-Flash APEX-I NanoPlus V2.1 | ~36B (MoE) | no disponible | GGUF mixta (~12,08 GiB) | Apache 2.0 | Objeto de esta ficha |
| Maxwell-V1-Flash APEX-I MiniPlus V2.1 | ~36B (MoE) | no disponible | GGUF mixta (14,31 GiB) | Apache 2.0 | Mismo autor, mayor huella y presumiblemente mayor fidelidad |
| Maxwell-V1-Flash (base) | ~36B (MoE) | no disponible | BF16 | Apache 2.0 | Modelo original sin cuantizar |
| Alternativas de ~30-40B MoE | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Ausencia total de documentación del modelo base: no hay información sobre datos de entrenamiento, contexto, idiomas ni evaluación, lo que impide estimar su calidad real.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks ni model card del base, no puede acotarse.
- Sesgos conocidos: no disponibles; al desconocerse la composición del dataset, no es posible evaluar sesgos de género, idioma o dominio.
- Idiomas: no confirmados; la model card no declara cobertura multilingüe.
- Cuantización agresiva en expertos enrutados (IQ3_XXS y Q3_K): puede degradar la calidad frente al BF16 original, especialmente en tareas que activen expertos poco representados en la imatrix.
- Compatibilidad de motores: al tratarse de una arquitectura no estándar (`maxwell-moe`), el soporte fuera de llama.cpp y de V-Agent no está garantizado; conviene verificar la versión mínima de llama.cpp que reconoce la arquitectura.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el modelo base ni sobre la cuantización.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Fecha de creación futura en los metadatos (2026-11-20): conviene tratar la publicación con cautela hasta verificar su estabilidad.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/IsValorum/Maxwell-V1-Flash-APEX-I-NanoPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/maxwell-model/Maxwell-V1-Flash
- Cuantización MiniPlus: https://huggingface.co/IsValorum/Maxwell-V1-Flash-APEX-I-MiniPlus-V2.1-GGUF
- Imatrix de referencia: https://huggingface.co/AtomicChat/Maxwell-V1-Flash-GGUF-metrics
- Mapa de tensores: https://huggingface.co/IsValorum/Maxwell-V1-Flash-APEX-I-NanoPlus-V2.1-GGUF/blob/main/tensor-map.tsv
- V-Agent (agente de escritorio): https://github.com/IsValorum/V-Agent
- Releases de V-Agent: https://github.com/IsValorum/V-Agent/releases/latest
- Arquitectura de V-Agent: https://github.com/IsValorum/V-Agent/blob/main/docs/ARCHITECTURE.md
- Soporte al autor (Ko-fi): https://ko-fi.com/isvalorum
