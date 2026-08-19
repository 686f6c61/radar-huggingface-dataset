# h3rb3rn/moe-sovereign-judge-27b-GGUF

## Resumen

`moe-sovereign-judge-27b` es un modelo de lenguaje de 27 000 millones de parámetros, especializado en la evaluación de calidad y la verificación de soluciones técnicas dentro de la plataforma compuesta de IA "MoE Sovereign". Desarrollado por h3rb3rn, se construye mediante un fine-tuning supervisado (SFT) y optimización con preferencias directas (DPO) sobre el modelo base Qwen3.8-27B. El entrenamiento se realizó en el supercomputador europeo LUMI-G (8× AMD Instinct MI250X) durante aproximadamente 24 horas y 40 minutos.

El modelo actúa como un "juez" soberano: evalúa código de sistemas complejos (C++20, eBPF/XDP, Rust), reconcilia conocimiento contradictorio de manera paraconsistente y genera veredictos en JSON estricto con puntuaciones de calidad y factualidad. Su distribución en formato GGUF (Q4_K_M) con una ventana de contexto de 40 960 tokens lo hace desplegable en entornos locales mediante Ollama u otras herramientas de inferencia. Reemplaza al anterior checkpoint `sovereign-judge:35b-q4km`, reduciendo requisitos de VRAM y eliminando los fallos de tipo `UNSCORED_FALLBACK`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8-27B) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | no disponible (no se especifica si es MoE; el nombre del proyecto incluye "MoE" pero la arquitectura concreta no se detalla) |
| Longitud de contexto | 40 960 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (única variante publicada) |
| Idiomas soportados | ingles (en), aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no publicado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3.8-27B, un transformer denso de 27 000 millones de parámetros. Sobre esta base se aplicó un fine-tuning en dos etapas: primero supervisado (SFT) sobre trazas de ejecución verificadas del sistema MoE Sovereign (dataset `moe-sovereign/judge-evaluation-sft`), y posteriormente una optimización con preferencias directas (DPO) para alinear las respuestas con los criterios de evaluación deseados.

El entrenamiento se ejecutó en un nodo del supercomputador LUMI-G con 8 GPUs AMD Instinct MI250X de 128 GB cada una, durante 24 horas, 39 minutos y 57 segundos (Slurm job `21263413`). No se han publicado detalles sobre el volumen total de tokens de entrenamiento ni la composición exacta del dataset. La innovación principal reside en el objetivo de la tarea: generar veredictos JSON estructurados con puntuaciones numéricas y razonamiento analítico, minimizando la alucinación mediante un enfoque paraconsistente para reconciliar fuentes de conocimiento en conflicto.

## Capacidades

- Evaluacion de calidad de soluciones tecnicas: genera veredictos con puntuaciones de calidad, factualidad y una puntuacion global (escala 0-10).
- Verificacion de codigo de sistemas: analiza estructuras de datos lock-free en C++20, filtros eBPF/XDP de Linux y codigo Rust con atencion a la seguridad de memoria.
- Reconciliacion paraconsistente de conocimiento: integra nodos de conocimiento contradictorios, datos de procedencia y actualizaciones temporales de politicas sin inventar informacion.
- Salida JSON estricta: produce respuestas que cumplen un esquema JSON definido, adecuadas para integracion en pipelines automaticos.
- Razonamiento multi-paso: capaz de descomponer problemas complejos y evaluar cada etapa de forma sistematica.
- Soporte de tool calling: no documentado explicitamente, pero el modelo esta disenado para operar dentro de un sistema compuesto con herramientas MCP deterministas.
- Multilingue limitado: solo ingles y aleman.

## Casos de uso

- Control de calidad en pipelines CI/CD: el modelo puede actuar como un revisor automatico de pull requests, evaluando la correccion tecnica y la seguridad de cambios en codigo de sistemas antes de su fusion.
- Auditoria de cumplimiento normativo: en entornos regulados (CRITIS, BaFin, DORA), el juez puede verificar que las soluciones implementadas cumplen politicas tecnicas y de gobernanza, generando informes JSON auditables.
- Reconciliacion de datos en sistemas GraphRAG: cuando un grafo de conocimiento federado contiene entradas contradictorias, el modelo decide cual es la version mas factible y devuelve una puntuacion de confianza.
- Evaluacion de respuestas de otros modelos: como componente de un sistema compuesto, puede puntuar la calidad de las salidas de modelos expertos antes de enviarlas al usuario final.
- Generacion de informes tecnicos estructurados: produce veredictos JSON que alimentan dashboards de calidad o sistemas de monitorizacion sin necesidad de post-procesamiento.
- Validacion de codigo cientifico: verifica la correccion matematica y tecnica de implementaciones numericas o algoritmos en lenguajes de bajo nivel, con especial atencion a la sincronizacion y las barreras de memoria.

## Benchmarks y rendimiento

El autor publico resultados en el "MoE Sovereign Scientific Multidisciplinary Benchmark" (agosto 2026). Se presentan tal cual, sin verificacion independiente:

| Categoria | Tarea | Puntuacion del juez | Verificacion determinista |
|---|---|---|---|
| Conocimiento paraconsistente | `sci-graphrag-02` (reconciliacion de grafos) | 9,4 / 10,0 | 10,0 / 10,0 (100 % fundamentado factualmente) |
| Programacion de sistemas | `sci-sysprog-01` (buffer circular MPSC lock-free) | 7,0 / 10,0 | 10,0 / 10,0 (100 % conforme a barreras de memoria) |
| Infraestructura de red | `sci-sysprog-02` (sincronizacion de mapas eBPF XDP) | 7,0 / 10,0 | 10,0 / 10,0 (100 % verificado por kernel) |
| Gobernanza y soberania | `sci-governance-01` (soberania tecnica) | 6,2 / 10,0 | 8,0 / 10,0 (fundamentado en politicas) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M, un modelo de 27B requiere aproximadamente 14-16 GB de VRAM, mas overhead de contexto (40 960 tokens), por lo que se recomienda al menos 20-24 GB para operar con comodidad.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 40/80 GB, H100, o AMD Instinct MI250X (128 GB) para margen amplio.
- Compatibilidad con GPU consumer: si, cabe en tarjetas de 24 GB (RTX 3090/4090) y probablemente en algunas de 16 GB con contexto reducido.
- Opciones de despliegue: Ollama (documentado en la model card), llama.cpp, vLLM (si se convierte a safetensors), TGI, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 27B en Q4_K_M, se espera una generacion de 20-40 tokens/s en una RTX 4090, aunque depende del backend y del contexto activo.

## Comparativa con modelos similares

El modelo se compara directamente con su predecesor, `sovereign-judge:35b-q4km`, segun la informacion del autor:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| moe-sovereign-judge-27b | 27B | 40 960 | GGUF Q4_K_M | Apache 2.0 | Elimina timeouts, reduce VRAM, sin fallos UNSCORED_FALLBACK |
| sovereign-judge:35b-q4km | 35B | no disponible | GGUF Q4_K_M | no disponible | Reemplazado por el modelo actual; sufria timeouts y fallos de puntuacion |

No se dispone de comparativas con otros modelos de evaluacion de calidad (p. ej., GPT-4 como juez, o modelos dedicados como Prometheus) en la informacion proporcionada. Se indica "no disponible" para esa comparativa externa.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado estudios de sesgo especificos. Al estar entrenado principalmente en ingles y aleman, puede presentar sesgos culturales o linguisticos en otros idiomas.
- Riesgo de alucinacion: aunque el enfoque paraconsistente reduce la invencion de informacion, no se garantiza una ausencia total de alucinaciones, especialmente en tareas fuera de su dominio de especializacion.
- Limitaciones de contexto: la ventana de 40 960 tokens es amplia pero no infinita; documentos muy largos pueden requerir truncamiento o chunking.
- Idiomas: solo soporta ingles y aleman; no se recomienda su uso en otros idiomas sin evaluacion previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el modelo base Qwen3.8-27B puede tener sus propias condiciones (no detalladas en la informacion disponible).
- Dependencia de la plataforma MoE Sovereign: el modelo esta optimizado para operar dentro de ese ecosistema; su uso como juez generico fuera de el puede degradar el rendimiento.
- Verificacion independiente: los benchmarks publicados provienen del autor y no han sido replicados por terceros.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/h3rb3rn/moe-sovereign-judge-27b-GGUF)
- [Repositorio GitHub del proyecto MoE Sovereign](https://github.com/h3rb3rn/moe-sovereign)
- [Documentacion del proyecto](https://docs.moe-sovereign.org)
- [Coleccion de variantes Sovereign Judge 35B](https://huggingface.co/collections/h3rb3rn/sovereign-judge-35b-all-variants)
- [Modelo Qwen3-MoE-35B-Sovereign-Judge-v3-GGUF](https://huggingface.co/h3rb3rn/Qwen3-MoE-35B-Sovereign-Judge-v3-GGUF)
