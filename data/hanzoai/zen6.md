# hanzoai/zen6

## Resumen

Zen 6 (27B) es un modelo de lenguaje multimodal y agentico de pesos abiertos publicado por Hanzo AI y Zen LM en colaboracion con Zoo Labs Foundation. Su rasgo diferencial es que se distribuye exclusivamente en formato ternario de 1,58 bits (pesos en {-d, 0, +d}) dentro del espacio de pesos de Hadamard, lo que comprime el modelo de 27B hasta ficheros GGUF de entre 5,95 y 7,63 GB sin recurrir a una cuantizacion posterior: el ajuste se realiza directamente en ese espacio mediante QAT con Straight-Through Estimator.

La arquitectura combina bloques de atencion lineal Gated-DeltaNet con atencion completa agrupada (GQA) en una proporcion 3:1, e incorpora un proyector visual para entrada de imagen y texto. El modelo esta orientado a flujos agenticos: ejecucion multi-paso de llamadas a herramientas, sintesis de respuestas de herramienta, recuperacion de errores y abstencion calibrada, con soporte explicito de herramientas de sistema de ficheros, ejecucion, codigo, git, tests y MCP de Hanzo.

Su relevancia actual radica en la eficiencia de despliegue: un modelo de 27B que cabe en GPUs de consumo y en CPU, con decodificacion especulativa propia (DFlash2) y compatibilidad con llama.cpp upstream. La contrapartida es que el ecosistema de ejecucion esta fuertemente ligado al motor propietario del autor (hanzo-engine) para los formatos PQ2_0 y PTQ1_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: Gated-DeltaNet (atencion lineal) x3 intercalado con Grouped-Query Full Attention x1, MLP SwiGLU, proyector visual multimodal |
| Parametros totales | 27B (segun model card); el repositorio safetensors declara 1.924.404.480 parametros, dato no coherente con la nomenclatura del modelo |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria nativa 1,58 bits: PQ2_0 (2,125 bpw), PTQ1_0 (1,750 bpw), Q2_0 (2,250 bpw); draft DFlash2 en Q8_0; proyector visual en Q8_0 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tipos GGML 142, 143 y 42); packs MLX 2-bit para Apple Silicon |

## Arquitectura y entrenamiento

El backbone es un transformer hibrido que alterna tres bloques de atencion lineal Gated-DeltaNet por cada bloque de atencion completa con consultas agrupadas, con MLPs SwiGLU y un proyector multimodal independiente (mmproj). La innovacion central es el almacenamiento de pesos lineales y embeddings de tokens en una base ortonormal de Sylvester-Walsh-Hadamard por bloques, con vectores de signo por canal embebidos en los metadatos KV del GGUF bajo el prefijo `prism.hadamard.*`. Esta rotacion elimina los valores atipicos de activacion, lo que permite que los pesos ternarios agrupados de 128 en 128 conserven la precision densa del modelo original.

El post-entrenamiento se realiza directamente en el espacio ternario mediante QAT con Straight-Through Estimator y un optimizador hibrido Muon + AdamW, en lugar de cuantizar un modelo ya entrenado en precision completa. La model card menciona herencia de Qwen (Alibaba Cloud), Bonsai-2 (Prism ML) y DFlash / ProCreations en el fichero NOTICE, pero no detalla volumen de tokens de entrenamiento, composicion del dataset ni si hubo fases de RLHF o DPO. El paquete incluye un draft de difusion por bloques DFlash2 (~2x en decodificacion), busqueda por automata de sufijos SA_SPEC y GuardedDraft como tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional multi-turno con identidad de pesos nativa, sin sobrecarga de prompt de sistema, respetando personas definidas por el desarrollador.
- Razonamiento agentico multi-paso con ejecucion de `<tool_call>`, sintesis de `<tool_response>`, recuperacion de errores y abstencion calibrada cuando la herramienta no es adecuada.
- Tool calling / function calling compatible con la API `/v1/chat/completions` de OpenAI y con el protocolo MCP de Hanzo.
- Conjunto de herramientas integradas orientadas a desarrollo: `fs`, `exec`, `code`, `git`, `test`, `hanzo` y herramientas de direccion de motores de juego.
- Entrada multimodal imagen-texto mediante proyector visual en Q8_0 o BF16.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Decodificacion especulativa con draft DFlash2 y automata de sufijos para acelerar la generacion.

## Casos de uso

- Agente de refactorizacion en repositorios: el modelo puede leer `Cargo.toml`, inspeccionar el arbol de ficheros con la herramienta `fs`, lanzar la suite de tests con `test` y corregir fallos iterativamente, gracias al soporte nativo de tool calling y recuperacion de errores.
- CI/CD sin coste por token: cargando `zen6-nano-2b-PTQ1_0.gguf` (~429 MB) en runners de CPU se pueden ejecutar tests de integracion de LLM y de tool calling sin claves de API, segun el flujo descrito en la model card.
- NPCs y direccion de juego: las herramientas de director de motor de juego y el respeto de personas personalizadas (por ejemplo, NPCs de Godot) permiten integrar el modelo como backend de dialogos y comportamiento dinamico.
- Extraccion estructurada de datos: la model card cita explicitamente el caso de extractores JSON con personas definidas por el desarrollador, util para pipelines de ingestion documental.
- Asistente de terminal y operaciones: con acceso a `exec` y `git`, el modelo encaja en asistentes de linea de comandos que diagnostican fallos, aplican parches y gestionan ramas.
- Despliegue en estaciones de trabajo sin GPU dedicada: los formatos ternarios de 5,95 a 7,63 GB permiten servir el modelo en CPU o en GPUs de consumo, lo que habilita prototipos locales de agentes con datos que no pueden salir de la maquina.
- Automatizacion de soporte tecnico con contexto de repositorio: combinando la entrada multimodal y las herramientas de sistema de ficheros, el modelo puede interpretar capturas de errores y cruzarlas con el codigo del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 7,3 GB para `PQ2_0` (7,21 GB de pesos), 6,1 GB para `PTQ1_0` (5,95 GB) y 7,8 GB para `Q2_0` (7,63 GB), sin contar el proyector visual (629 MB en Q8_0 o 931 MB en BF16) ni la cache KV.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano de pesos, cualquier GPU con 8-10 GB de VRAM o mas deberia poder alojar el modelo, aunque el autor no publica una lista de GPUs validadas.
- GPU de consumo: si, segun los tamanos anteriores el modelo cabe en tarjetas de 8 GB o mas; el autor no confirma modelos concretos.
- Despliegue: `hanzo-engine` (CUDA, Metal, ROCm, Vulkan y CPU) para PQ2_0, PTQ1_0 y Q2_0; llama.cpp upstream b11556 o superior para Q2_0; `mlx-lm` en Apple Silicon para los packs MLX 2-bit; servidor compatible con OpenAI en `http://127.0.0.1:36900/v1`.
- Latencia y throughput: la model card afirma que PQ2_0 ofrece la decodificacion mas rapida en GPU y CPU y que el draft DFlash2 aporta aproximadamente 2x en decodificacion, pero no se publican cifras de tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Zen 6 (27B) | 27B (declarado) | no disponible | Ternario nativo 1,58 bits en GGUF y MLX | Apache 2.0 | Multimodal y agentico; ejecucion completa dependiente de hanzo-engine |
| Qwen (familia, referencia upstream) | no disponible | no disponible | safetensors y GGUF | no disponible | Citado en el NOTICE como atribucion upstream; no se detalla la version concreta |
| Bonsai-2 (Prism ML) | no disponible | no disponible | no disponible | no disponible | Citado en el NOTICE como atribucion upstream; sin datos publicos en la informacion disponible |
| Alternativas ternarias de gran tamano | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Incoherencia de metadatos: la model card anuncia 27B parametros, pero el repositorio safetensors declara 1.924.404.480 parametros. Conviene verificar el artefacto real antes de planificar el despliegue.
- Ecosistema de ejecucion restringido: los formatos PQ2_0 y PTQ1_0 requieren hanzo-engine; en llama.cpp upstream solo se garantiza Q2_0, con menos ventaja de compresion.
- Idiomas soportados no documentados: no hay lista de lenguas ni evaluacion multilingue, por lo que el rendimiento fuera del ingles es incierto.
- Longitud de contexto no publicada: no se puede dimensionar la cache KV ni garantizar conversaciones largas o analisis de repositorios extensos.
- Ausencia total de benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones agenticas, lo que impide comparar su calidad con alternativas.
- Riesgo de alucinacion: no se documentan tasas de error ni evaluaciones de fidelidad; el modo agentico con `exec` y `git` amplifica el impacto de una accion erronea y exige sandboxing y confirmacion humana.
- Sesgos: no disponibles; no se describe composicion del dataset ni proceso de alineacion.
- Licencia Apache 2.0 permite uso comercial, pero el NOTICE impone mantener las atribuciones a Qwen, Bonsai-2 y DFlash / ProCreations.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hanzoai/zen6
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
- Zoo Labs Foundation: https://zoolabs.io
- Motor de inferencia hanzo-engine: https://github.com/hanzoai/engine
