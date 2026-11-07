# kataguru/Kataguru-Sceptic-35B-A3B-v3.1-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-v3.1-GGUF es la distribucion en formato GGUF del modelo multimodal Kataguru-Sceptic-35B-A3B-v3.1, desarrollado por el usuario kataguru. Se trata de un ajuste fino (fine-tune) sobre una arquitectura Mixture-of-Experts (MoE) denominada por el autor como "Qwen3.5-35B-A3B", con 35.247 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token. El modelo esta disenado para tareas de razonamiento, generacion de codigo, ingenieria de automatizacion industrial (PLC, CNC), medicina clinica y agentes con tool calling, con soporte bilingue ingles-finlandes.

La relevancia de esta release radica en su empaquetado GGUF "APEX-Trio" (tres niveles de cuantizacion calibrados con imatrix) mas un proyector de vision `mmproj` en f16, lo que permite ejecutar un modelo multimodal de 35B en GPUs de consumo con 12-24 GB de VRAM. El autor declara una ventana de contexto nativa de 262.144 tokens y una mejora agregada de +1,02 pp en una suite propia de 15 benchmarks respecto a la version v2.8.1.

La model card reporta resultados destacados en GPQA Diamond (70,20 %), MedQA (85,39 %), LiveCodeBench v6 (39,43 %) y BFCL V4 (83,67 %), asi como un incremento de +33,39 pp en deteccion de irrelevancia dentro de BFCL. Estos datos proceden exclusivamente de la documentacion del autor y no han sido verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal, 40 capas, top_k=8, 254 expertos enrutados + 2 slots reservados (#254, #255) |
| Parametros totales | 35.247.133.824 (35,25B) |
| Parametros activos | ~3B por token (denominacion A3B) |
| Longitud de contexto | 262.144 tokens (nativo, segun model card) |
| Tipos de cuantizacion | GGUF APEX-Trio: APEX-Small (~11,8 GiB), APEX-Medium (~13,5 GiB), APEX-Good (~15,3 GiB); proyector de vision mmproj-f16 (~890 MB) |
| Idiomas soportados | Ingles (en) y finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 45,1 GB); safetensors disponibles en el repo del modelo base |
| Encoder de vision | 27 capas, 333 tensores (`model.visual.*`) |
| Cabeza especulativa | MTP en capa 40, 779 tensores (`mtp.*`) |
| Modelo base | kataguru/Kataguru-Sceptic-35B-A3B-v3.1 (a su vez derivado de Qwen/Qwen3.5-35B-A3B) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer MoE con 40 capas, 254 expertos enrutados y dos slots de experto reservados para especializacion modular empresarial, con top_k=8 expertos activados por token. Incorpora un encoder de vision multimodal de 27 capas y una cabeza de decodificacion especulativa MTP (Multi-Token Prediction) en la capa 40, que el autor conserva intacta respecto a versiones anteriores. El modelo base declarado es Qwen3.5-35B-A3B, con 387M menos parametros que la variante estandar de 256 expertos.

El entrenamiento de la version v3.1 se describe como un proceso de dos ciclos con "Orthonormal Subspace MoE Training": el ciclo 1 aplica una proteccion de subespacio ortogonal de cuatro niveles (`qr_frozen_a`) sobre datos cognitivos, finlandeses, STEM de posgrado, medicina clinica y patentes EPO/PRH; el ciclo 2 usa `weakest_link_oplora` con un "Cross-Mixture 64/36 Pohjantähti Anchor Shield" y poda de checkpoints basada en NLL < 0,35 sobre algoritmos competitivos verificados, SWE multi-turno, tool calling BFCL e ingenieria PLC/CNC. No se especifican en la informacion disponible el numero total de tokens de entrenamiento ni la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento de nivel doctorado en STEM (declarado GPQA Diamond 70,20 %).
- Generacion de codigo y algoritmos competitivos (LiveCodeBench v6 Pass@1 39,43 %).
- Vision multimodal: pipeline image-text-to-text con proyector `mmproj-f16.gguf`.
- Tool calling y function calling con formato `<tool_call>` (BFCL V4 Single-Turn AST 83,67 %).
- Razonamiento agentico multi-paso y deteccion de irrelevancia en llamadas a herramientas (80,26 % en Irrelevance Detection).
- Ingenieria de automatizacion industrial: Siemens TIA Portal SCL, Beckhoff TwinCAT 3 ST, G-code Fanuc/Sinumerik, OPC UA.
- Medicina clinica (MedQA 85,39 % segun el autor).
- Quimica de laboratorio humedo, propiedad intelectual y patentes (EPO/PRH).
- Bilingue nativo ingles-finlandes con inflexion finlandesa verificada por Kotus.
- Modo "anti-sycophancy" y disciplina epistemica declarada por el autor.
- Inspeccion y curacion automatica de calidad de datasets ("Quality Inspector & Surgeon").
- Decodificacion especulativa via cabeza MTP.

## Casos de uso

- Automatizacion industrial con PLC: generacion y revision de logica SCL para Siemens TIA Portal o ST para Beckhoff TwinCAT 3, aprovechando el entrenamiento especifico del ciclo 2 en estos lenguajes y su contexto de 262.144 tokens para volcar bloques de proyecto completos.
- Programacion CNC: traduccion entre especificaciones de mecanizado y G-code para controladores Fanuc o Sinumerik, con verificacion de sintaxis en el mismo turno.
- Agentes de software engineering: integracion en pipelines CI/CD como agente que invoca herramientas mediante `<tool_call>` (BFCL V4 83,67 %) y resuelve tareas multi-turno con contexto largo.
- Asistencia clinica documental: resumen y consulta sobre historiales o literatura medica en ingles, apoyandose en el rendimiento declarado en MedQA; requiere supervision profesional por las limitaciones de alucinacion.
- Analisis de documentos tecnicos con vision: procesado de esquemas, planos o capturas de HMI mediante el proyector de vision, util en ingenieria de planta y auditoria de calidad.
- Curacion de datasets: uso del perfil "Quality Inspector & Surgeon" para detectar muestras de baja calidad (criterio NLL) y filtrar corpus de entrenamiento o evaluacion.
- Atencion al cliente tecnica bilingue (en/fi): conversaciones multi-turno en ingles y finlandes para soporte de producto industrial, con contexto largo para mantener historial de incidencias.
- Revision de propiedad intelectual: analisis de reivindicaciones y comparacion con documentacion de patentes EPO/PRH, con salida en formato estructurado.

## Benchmarks y rendimiento

Resultados declarados por el autor en su suite de 15 benchmarks, evaluados sobre 2x NVIDIA RTX 5090 32GB (TP=2, CUDAGraphs, lm-evaluation-harness 0.4.13, LiveCodeBench v6 con 175 problemas, BFCL V4 con 3.641 tareas single-turn AST). No verificados de forma independiente.

| Benchmark | v3.1 | v2.8.1 | Delta | Ornith 1.5 35B-A3B (W4A16) |
|---|---|---|---|---|
| Media 15 benchmarks | 70,26 % | 69,24 % | +1,02 pp | no disponible |
| GPQA Diamond | 70,20 % | 57,58 % | +12,62 pp | no disponible |
| LiveCodeBench v6 (Pass@1) | 39,43 % | 32,00 % | +7,43 pp | no disponible |
| BFCL V4 Single-Turn AST | 83,67 % | 82,33 % | +1,34 pp | no disponible |
| BFCL V4 Non-Live | 88,44 % | no disponible | no disponible | no disponible |
| BFCL V4 Irrelevance Detection | 80,26 % | 46,87 % | +33,39 pp | no disponible |
| MedQA | 85,39 % | 85,39 % (sin cambios) | 0 pp | no disponible |
| Automatizacion industrial (PLC/CNC) | no disponible (solo delta) | referencia | +3,22 pp | no disponible |

El resto de filas de la tabla comparativa del autor (v2.7 y columnas Ornith) no estan completas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: 12-16 GB para APEX-Small (~11,8 GiB), 16 GB para APEX-Medium (~13,5 GiB), 16-24 GB para APEX-Good (~15,3 GiB); anadir ~890 MB para el proyector de vision mmproj-f16.
- GPU recomendadas: RTX 4090, RTX 5090 (el autor evalua en 2x RTX 5090 32GB con TP=2), A100 o H100 para despliegue servidor con vLLM; en consumer, cualquier GPU con 16 GB o mas.
- Cabe en GPU de consumo: si, en RTX 4080/4090/5090, RTX 3090 y equivalentes con 16-24 GB; tambien en Apple Silicon con memoria unificada de 16 GB o mas.
- Opciones de despliegue: llama.cpp (probado con b11064), LM Studio, Ollama, vLLM (para pesos no GGUF: NVFP4 y W4A16-AWQ), transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada; la cabeza MTP de decodificacion especulativa puede reducir la latencia de generacion, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-v3.1-GGUF | 35,25B | ~3B | 262.144 | Apache 2.0 | GGUF, safetensors, NVFP4, AWQ | Multimodal, bilingue en/fi, foco industrial |
| Kataguru-Sceptic-35B-A3B-v2.8.1 | 35,25B | ~3B | 262.144 (heredado) | Apache 2.0 | NVFP4, GGUF | Predecesor; media 15 benchmarks 69,24 % |
| Ornith 1.5 35B-A3B | 35B (A3B) | ~3B | no disponible | no disponible | W4A16 | Comparado por el autor; resultados no completos en la informacion |
| Qwen3.5-35B-A3B (base declarado) | 35B (A3B) | ~3B | no disponible | no disponible | safetensors | Arquitectura de origen, 256 expertos estandar |

No se dispone de datos suficientes de los modelos alternativos para una comparacion de rendimiento completa y verificada.

## Limitaciones y advertencias

- Los benchmarks proceden exclusivamente de la model card del autor y no han sido replicados de forma independiente; deben tratarse como cifras no verificadas.
- El modelo se autodenomina "uncensored", lo que implica una reduccion de filtros de seguridad y un mayor riesgo de generar contenido inapropiado en produccion.
- Riesgo de alucinacion inherente a modelos de lenguaje, especialmente critico en los dominios medico y de propiedad intelectual que el autor promociona.
- Soporte linguistico limitado a ingles y finlandes; el rendimiento en castellano no esta documentado.
- El contexto nativo de 262.144 tokens puede degradar la calidad en el extremo superior de la ventana; no se aportan resultados de pruebas de aguja en pajar.
- Aunque la licencia es Apache 2.0, el modelo base declarado es Qwen3.5-35B-A3B, cuyos terminos deben verificarse de forma independiente antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- El esquema de cuantizacion APEX-Trio esta calibrado con imatrix por el autor; la calidad relativa entre niveles no se documenta con metricas por cuantizacion.
- El uso en automatizacion industrial (PLC, CNC) exige validacion humana y pruebas en banco: errores en codigo de control pueden causar danos fisicos o paradas de planta.

## Enlaces

- Repositorio GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1-GGUF
- Modelo base BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Version NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1-NVFP4
- Version W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1-W4A16-AWQ
- Version anterior v2.8.1 NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.8.1-NVFP4
- Version anterior v2.6 GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-GGUF
- Arbol de ficheros v2.6 GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-GGUF/tree/main
