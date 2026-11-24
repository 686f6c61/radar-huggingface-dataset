# Marlon41/mathagents

## Resumen

MathAgents es un sistema multiagente de demostración automática de teoremas desarrollado por Marlon41 como proyecto final del curso de Inteligencia Artificial de la UPTC Sogamoso. No es un modelo de lenguaje entrenado desde cero, sino un pipeline orquestado con LangGraph en el que varios agentes apoyados en un LLM externo colaboran para resolver teoremas de estilo olimpiada matemática, con verificación formal obligatoria en Lean 4 sobre Mathlib v4.34.1.

La innovación central es que la corrección de una prueba no la decide el LLM, sino el kernel de Lean: un problema solo se considera resuelto si el verificador formal acepta la demostración (requisito RNF-1). El bucle combina planificación, recuperación aumentada (RAG sobre un índice FAISS de lemas de Mathlib), generación, autoformalización a Lean 4, verificación y crítica con reintentos y replanificación acotados por `k_max`.

El repositorio tiene un tamaño de 0.0 GB, sin descargas ni likes en el momento de la consulta, y se distribuye bajo licencia Apache-2.0. Está etiquetado para inglés y español, e incluye infraestructura de reproducibilidad (manifiestos JSONL por ejecución, `lake-manifest.json` con commits fijados) y una demo Gradio pensada para un Hugging Face Space. Es relevante para quienes investigan neuro-simbólico aplicado a matemáticas y quieren una base reproducible y auditable, más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema multiagente orquestado con LangGraph sobre un LLM externo; verificación formal con Lean 4 + Mathlib v4.34.1 |
| Parametros totales | no disponible (depende del LLM configurado en `config.yaml`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del LLM externo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, es |
| Licencia | Apache-2.0 (código); Mathlib Apache-2.0; miniF2F MIT |
| Formato de pesos | no disponible (no publica pesos; el artefacto es código Python y un proyecto Lean) |

## Arquitectura y entrenamiento

El sistema implementa un grafo de estados con seis roles: PLAN (planificador), RETRIEVE (recuperador RAG), GENERATE (generador), FORMALIZE (autoformalizador), VERIFY (verificador Lean 4) y CRITIQUE (crítico). El flujo es cíclico: si Lean acepta la prueba pero quedan subobjetivos, se vuelve a recuperación; si acepta el teorema completo, termina en DONE; si rechaza, el crítico decide entre reintentar la generación o replanificar, hasta agotar `k_max` y devolver FAIL. La recuperación usa embeddings y un índice vectorial FAISS construido sobre lemas extraídos de Mathlib mediante un script dedicado en `lean_project/`.

No hay entrenamiento de pesos ni ajuste fino documentado: el sistema es un arnés de razonamiento y verificación que depende de un LLM externo configurado por el usuario (modelo, temperatura y clave `LLM_API_KEY`). La reproducibilidad se aborda explícitamente (RNF-2): cada ejecución escribe en `logs/<run_id>.jsonl` un manifiesto con semilla, versión de Lean y Mathlib, modelo y temperatura del LLM, modelo de embeddings y versiones de librerías, mientras que `lake-manifest.json` fija el commit exacto de cada dependencia Lean. El proyecto incluye contratos JSON Schema para las salidas de los agentes y un conjunto de pruebas unitarias, de contrato y de integración con pytest.

## Capacidades

- Demostración automática de teoremas de estilo olimpiada con garantía formal: la validez la certifica el kernel de Lean 4, no el LLM.
- Descomposición de problemas en subobjetivos mediante el agente planificador y resolución incremental con retorno a recuperación.
- Recuperación aumentada (RAG) sobre lemas de Mathlib con índice FAISS, para fundamentar las pruebas en resultados existentes.
- Autoformalización de enunciados y pruebas en lenguaje natural a Lean 4.
- Crítica y reparación iterativa: distingue entre reintentar la generación y replanificar el enfoque.
- Orquestación multiagente con LangGraph y contratos de salida validados por JSON Schema.
- Ejecución de ablaciones y líneas base (`orchestrator/pipeline.py`, `orchestrator/baselines.py`) para comparar configuraciones del pipeline.
- Demo interactiva en Gradio para despliegue como Hugging Face Space.
- Capacidades multilingües limitadas a inglés y español según los metadatos del repositorio.

## Casos de uso

- Investigación en demostración automática de teoremas: permite evaluar variantes del pipeline (con y sin RAG, con y sin crítico) mediante las configuraciones de ablación incluidas, usando miniF2F en su versión Lean 4 como conjunto de referencia.
- Docencia de IA neuro-simbólica: el proyecto está estructurado por carpetas con responsabilidades claras (`agents/`, `orchestrator/`, `retrieval/`, `lean_project/`) y pruebas pytest, lo que facilita usarlo como base de prácticas guiadas.
- Generación de pruebas formales verificadas para bibliotecas matemáticas: el bucle de formalización y verificación puede adaptarse para producir lemas aceptados por el kernel antes de incorporarlos a un proyecto Lean.
- Auditoría de fiabilidad de LLM en matemáticas: al exigir aceptación del kernel, sirve para medir la tasa real de acierto formal de un modelo frente a su aparente corrección en lenguaje natural.
- Construcción de asistentes matemáticos con verificación: la demo Gradio y la API de configuración permiten desplegar un servicio donde cada respuesta viene acompañada de una prueba comprobable.
- Estudio de estrategias de crítica y reparación: los registros JSONL por ejecución permiten analizar qué tipos de error llevan a replanificación exitosa y cuáles agotan `k_max`.
- Base para pipelines híbridos en producción interna: la fijación de versiones de Lean, Mathlib y dependencias mediante `lake-manifest.json` facilita la reproducibilidad en entornos de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende enteramente del LLM externo configurado en `config.yaml`, no del repositorio.
- GPU recomendadas: no disponible para el sistema; el cuello de botella adicional es CPU y disco por la compilación de Lean 4 y la carga de Mathlib.
- Cabe en consumer GPU: no disponible; condicionado al LLM elegido. El propio pipeline (orquestación, FAISS, Lean) puede ejecutarse en CPU.
- Almacenamiento y compilación: el proyecto Lean requiere `lake exe cache get` para descargar artefactos precompilados de Mathlib; sin caché, la compilación es costosa en tiempo y disco.
- Opciones de despliegue: ejecución local con Python (`requirements.txt`), proyecto Lean con Lake, demo Gradio para Hugging Face Space. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI porque el sistema no sirve pesos propios.
- Latencia y throughput: no disponibles; dominados por las llamadas al LLM externo y por los tiempos de verificación de Lean.

## Comparativa con modelos similares

| Sistema | Enfoque | Verificación formal | Pesos publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MathAgents | Multiagente + RAG + Lean 4 | Sí (kernel Lean) | No | Apache-2.0 | Repositorio público, 0 descargas |
| DeepSeek-Prover-V1.5 | Modelo especializado en pruebas Lean | Sí (integración Lean) | Sí | MIT (según referencia del autor) | Público y ampliamente usado |
| miniF2F | Benchmark de teoremas de olimpiada | No aplica (conjunto de datos) | No aplica | MIT | Público |
| LLM genérico con prompt matemático | Generación en lenguaje natural | No | Sí | Según modelo | Amplia |

La comparación con DeepSeek-Prover-V1.5 es la más pertinente: aquel publica pesos entrenados específicamente para Lean, mientras que MathAgents aporta la orquestación y la disciplina de verificación, pero delega la capacidad matemática en un LLM de terceros. No se dispone de datos de rendimiento comparables para MathAgents.

## Limitaciones y advertencias

- No publica pesos ni un modelo entrenado: su rendimiento depende por completo del LLM externo configurado, por lo que las cifras de capacidad no son atribuibles al repositorio.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de tasa de resolución sobre miniF2F u otros conjuntos.
- Repositorio sin adopción (0 descargas, 0 likes) y creado recientemente; no hay validación externa de su funcionamiento más allá de las pruebas incluidas.
- Dependencia crítica de la versión de Lean 4 y Mathlib v4.34.1: cambios de versión pueden romper pruebas y scripts de extracción de lemas.
- El coste de compilación de Mathlib sin caché puede ser prohibitivo en máquinas modestas.
- Riesgo de alucinación en las fases de generación y autoformalización; el diseño lo mitiga con verificación formal, pero puede traducirse en bucles largos y consumo elevado de tokens hasta agotar `k_max`.
- Idiomas limitados a inglés y español según los metadatos; el comportamiento en otros idiomas no está documentado.
- Licencia Apache-2.0 para el código, pero el autor advierte explícitamente de revisar las licencias del modelo de embeddings y del LLM usados antes de publicar; esas dependencias no están fijadas en la información disponible.
- El uso comercial del pipeline es posible bajo Apache-2.0, pero las condiciones finales vienen determinadas por las licencias de los modelos externos que se conecten.

## Enlaces

- Hugging Face: https://huggingface.co/Marlon41/mathagents
- Documentación de instalación: `docs/instalacion.md` (dentro del repositorio)
- Estado del proyecto: `docs/estado.md` (dentro del repositorio)
- Lean 4: https://lean-lang.org/
- Mathlib: https://github.com/leanprover-community/mathlib4
- LangGraph: https://github.com/langchain-ai/langgraph
- FAISS: https://github.com/facebookresearch/faiss
- miniF2F (versión Lean 4 vía DeepSeek-Prover-V1.5): https://github.com/DeepSeek-AI/DeepSeek-Prover-V1.5
