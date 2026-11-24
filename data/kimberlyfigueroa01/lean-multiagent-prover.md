# KimberlyFigueroa01/lean-multiagent-prover

## Resumen

`KimberlyFigueroa01/lean-multiagent-prover` no es un modelo de lenguaje con pesos propios, sino el repositorio de un sistema multiagente de demostración automática de teoremas construido sobre Lean 4 y Mathlib. Lo firman Kimberly Natalia Figueroa Zapata y Alisson Páez Alarcón como proyecto de la asignatura *Inteligencia Computacional* de la Universidad Pedagógica y Tecnológica de Colombia (UPTC, Sogamoso). El sistema intenta probar teoremas de nivel de competición del benchmark miniF2F y solo acepta una prueba si el kernel de Lean la valida.

La orquestación se realiza con LangGraph sobre seis agentes especializados (Planner, Retriever con RAG sobre Mathlib, Generator, AutoFormalizer, LeanVerifier y Critic) que siguen el flujo PLAN → RETRIEVE → GENERATE → FORMALIZE → VERIFY → (CRITIQUE | DONE | FAIL), con hasta tres reintentos y un replanificación. El modelo generativo subyacente es `gemini-3.5-flash-lite` vía Google AI Studio, invocado con temperatura 0, de modo que el repositorio aporta la arquitectura de agentes, los prompts, el verificador y el pipeline de evaluación, no unos pesos entrenables.

Su relevancia es metodológica: el experimento compara cinco configuraciones sobre 30 problemas de miniF2F y aísla el efecto de la verificación formal. El resultado más claro es que un baseline sin verificación previa entregó 20 pruebas de las que Lean rechazó 18, mientras que las configuraciones verificadas no produjeron falsos positivos. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y ocupa 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema multiagente orquestado con LangGraph (6 agentes) sobre un LLM externo; verificación formal con Lean 4 + Mathlib |
| Parametros totales | no disponible (no se publican pesos; el LLM es `gemini-3.5-flash-lite`, servido por API) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no hay pesos locales que cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Codigo: MIT; Lean 4 y Mathlib: Apache 2.0; miniF2F, BAAI/bge-small-en-v1.5 y Gemini conservan sus propias licencias |
| Formato de pesos | no disponible (repositorio de codigo, no de pesos) |

Otros datos técnicos relevantes: entorno Lean 4.36.0-rc2 con Mathlib en el commit `9d581dfff2e41de989072ea63abf3daf69311520`, Python 3.12, índice RAG `rag_data/idx2` (no versionado en Git por tamaño), 123.201 teoremas indexados y 114 tests unitarios, de contrato y de integración que funcionan con LLM simulado y sin clave de API.

## Arquitectura y entrenamiento

No hay entrenamiento de pesos: el sistema es un pipeline de inferencia y verificación. La máquina de estados de LangGraph encadena seis agentes con contratos de entrada/salida explícitos definidos en `src/contracts.py`. El Planner descompone el problema en 2 a 5 subobjetivos; el Retriever hace RAG sobre un volcado de Mathlib usando embeddings de `BAAI/bge-small-en-v1.5` y similitud coseno; el Generator redacta una estrategia de prueba en lenguaje natural; el AutoFormalizer la traduce a una prueba táctica de Lean 4; el LeanVerifier compila la prueba contra Lean/Mathlib en un servidor dedicado; y el Critic decide entre reintentar (k ≤ 3), replanificar (r ≤ 1), terminar o fallar.

La innovación destacable no es algorítmica sino de control de calidad: la verificación formal actúa como filtro duro de alucinaciones. El experimento compara Baseline A (una llamada que escribe directamente la prueba Lean, verificada antes de entregar), Baseline B (dos llamadas, razonamiento en lenguaje natural y luego código Lean, sin verificación previa a la entrega), la variante sin RAG, la variante sin Critic y la configuración completa. Las cinco se ejecutan con temperatura 0 y una sola pasada por configuración, con ajuste sobre 10 problemas de desarrollo y evaluación única sobre 20 de test tras congelar el código (etiqueta `congelado`).

## Capacidades

- Demostración automática de teoremas de nivel de competición en Lean 4 sobre Mathlib, con validación por kernel.
- Descomposición de problemas en subobjetivos mediante un agente Planner.
- Recuperación de lemas de Mathlib por similitud semántica sobre un índice de 123.201 teoremas.
- Formalización de estrategias en lenguaje natural a pruebas tácticas de Lean 4.
- Verificación formal con compilación real contra Lean 4.36.0-rc2 y Mathlib.
- Bucle de autocorrección con reintentos acotados (k ≤ 3) y replanificación (r ≤ 1).
- Ejecución de ablaciones configurables (sin RAG, sin Critic, baselines A y B) mediante presets en `src/pipeline.py`.
- Explorador de resultados en un Space estático de Hugging Face y una app Gradio en `demo/`.
- No dispone de tool calling genérico, visión, audio, modo thinking ni capacidades multilingües declaradas más allá del LLM subyacente.

## Casos de uso

- Investigación en demostración automática de teoremas: el pipeline sirve como banco de pruebas reproducible para medir el efecto de la verificación formal frente a la generación sin filtro, con resultados crudos en `results/` y scripts en `paper_results/`.
- Docencia de IA simbólica y neuro-simbólica: los seis agentes, sus contratos y los 114 tests con LLM simulado permiten montar prácticas sin clave de API ni coste de inferencia.
- Evaluación de la fiabilidad de LLM en matemáticas: Baseline B demuestra de forma cuantificada que un generador sin verificación entrega pruebas falsas (18 de 20 rechazadas por Lean), lo que sirve para diseñar políticas de validación en producción.
- Construcción de asistentes de formalización: el par Generator/AutoFormalizer puede reutilizarse para convertir enunciados matemáticos en lenguaje natural a borradores de pruebas Lean que luego se validan.
- Recuperación aumentada sobre bibliotecas formales: el módulo `src/retriever.py` y `rag/` implementan indexación y consulta sobre Mathlib, reutilizables para búsqueda de lemas en herramientas de asistencia a la demostración.
- Auditoría de pipelines multiagente: la taxonomía de errores heurística y el registro de llamadas al LLM por configuración (de 1,0 a 10,2 llamadas medias) permiten analizar coste y rendimiento de arquitecturas de agentes.
- Integración en CI para matemáticas formales: el servidor de verificación (`src/verify_server.py`) puede invocarse como servicio para comprobar automáticamente contribuciones a proyectos Lean.

## Benchmarks y rendimiento

Resultados de test (n = 20) publicados en la model card, con intervalos de confianza de Wilson al 95 %:

| Configuracion | pass@1 | IC 95 % (Wilson) | Entregadas | Falsos positivos | Llamadas LLM medias |
|---|---|---|---|---|---|
| Baseline A | 1/20 | [0.01, 0.24] | 1 | 0 | 1.0 |
| Baseline B | 2/20 | [0.03, 0.30] | 20 | 18 | 2.0 |
| Sin RAG | 3/20 | [0.05, 0.36] | 3 | 0 | 9.6 |
| Sin Critic | 2/20 | [0.03, 0.30] | 2 | 0 | 3.0 |
| Full | 2/20 | [0.03, 0.30] | 2 | 0 | 10.2 |

Lectura honesta según los autores: se resuelven muy pocos problemas, las diferencias son como máximo de un problema y ninguna es estadísticamente significativa (McNemar exacto con corrección de Bonferroni ×5). El efecto claro es el de la verificación: Baseline B entregó 20 pruebas y Lean rechazó 18. Ninguna prueba correcta usó un lema recuperado por RAG, por lo que RAG no recibe crédito en este experimento.

## Requisitos de hardware

- VRAM para inferencia: no aplica localmente, ya que la generación se delega a la API de Gemini (`gemini-3.5-flash-lite`); no se ejecutan pesos en la máquina del usuario.
- GPU recomendadas: no disponible; el cuello de botella es el servidor de verificación Lean, no la GPU.
- Viabilidad en GPU de consumo: no aplica para el LLM; el contenedor de Lean 4 + Mathlib es intensivo en CPU y disco (el arranque del servidor de verificación tarda varios minutos).
- Opciones de despliegue: Docker con Lean 4.36.0-rc2 + Mathlib, Python 3.12, servidor de verificación propio (`src/verify_server.py`), app Gradio en `demo/` y Space estático de solo exploración. No se contemplan vLLM, llama.cpp, Ollama ni TGI porque no hay pesos locales.
- Throughput y latencia: condicionados por los límites del plan gratuito de Google AI Studio (10 peticiones por minuto y 500 al día); una ejecución completa tarda aproximadamente un día, con respuestas cacheadas en disco. El número medio de llamadas al LLM por problema va de 1,0 (Baseline A) a 10,2 (configuración Full).

## Comparativa con modelos similares

| Sistema | Enfoque | Modelo generativo | Verificacion formal | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| lean-multiagent-prover | Multiagente LangGraph + RAG sobre Mathlib | gemini-3.5-flash-lite | Si, kernel de Lean 4 | no disponible | Codigo MIT | Repo HF y GitHub, 0 descargas |
| Baseline A (misma evaluacion) | Una llamada directa a prueba Lean | gemini-3.5-flash-lite | Si, antes de entregar | no disponible | MIT (codigo del repo) | Incluido en el mismo repo |
| Baseline B (misma evaluacion) | Dos llamadas, sin verificacion previa | gemini-3.5-flash-lite | Solo a posteriori | no disponible | MIT (codigo del repo) | Incluido en el mismo repo |

No se dispone de datos sobre otros sistemas de demostración automática comparables (por ejemplo, modelos entrenados específicamente para Lean) en la informacion proporcionada, por lo que la comparativa se limita a las configuraciones internas del propio experimento.

## Limitaciones y advertencias

- Conjunto de evaluación pequeño (30 problemas: 10 de desarrollo y 20 de test) y una sola ejecución por configuración, con un único modelo generativo.
- Ajuste sobre los 10 problemas de desarrollo, lo que puede introducir sesgo de selección.
- Posible contaminación de datos de entrenamiento: miniF2F es público y el LLM subyacente podría haberlo visto.
- Taxonomía de errores heurística, no validada formalmente.
- Resultados ligados a una versión concreta de Lean y Mathlib (Lean 4.36.0-rc2, commit `9d581dfff2e41de989072ea63abf3daf69311520`); cambios de versión pueden alterar la verificabilidad.
- Diferencias entre configuraciones no significativas estadísticamente; no debe interpretarse como superioridad de la configuración completa.
- El RAG no aportó ningún lema usado en pruebas correctas en este experimento.
- Riesgo de alucinación en el generador: sin verificación, el sistema entrega pruebas inválidas (18 de 20 en Baseline B), por lo que la verificación formal es obligatoria en cualquier uso serio.
- Dependencia de un servicio externo (Gemini vía Google AI Studio) con límites de uso y términos propios; el índice RAG (`rag_data/idx2`) no está en Git por tamaño y debe obtenerse aparte.
- Licencia del código MIT, pero los componentes de terceros (Lean 4, Mathlib, miniF2F, `BAAI/bge-small-en-v1.5`, Gemini) mantienen sus propias licencias y condiciones, que hay que revisar para uso comercial.
- Proyecto académico con 0 descargas y 0 likes; no hay evidencia de mantenimiento continuado ni de uso en producción.
- Idiomas soportados no declarados; el pipeline está orientado a enunciados matemáticos en inglés y a la sintaxis de Lean 4.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KimberlyFigueroa01/lean-multiagent-prover
- Space explorador de resultados (estático): https://huggingface.co/spaces/KimberlyFigueroa01/lean-multiagent-explorer-static
- Dataset y resultados: https://huggingface.co/datasets/KimberlyFigueroa01/lean-multiagent-minif2f-eval
- Código en GitHub (etiqueta `congelado`): https://github.com/KimberlyFigueroa21/proyecto_ia_lean
- Documentación técnica: `docs/TECHNICAL.md` dentro del repositorio
- Guía de instalación: `docs/INSTALL.md`
- Guía de usuario: `docs/USER_GUIDE.md`
- Interfaces de agentes: `docs/AGENTS_INTERFACES.md`
- Reproducción de ablaciones: `docs/REPRODUCE_ABLATIONS.md`
- Resultados: `docs/RESULTS.md`
