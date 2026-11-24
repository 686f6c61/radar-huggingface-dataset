# juferi07/mathagents

## Resumen

MathAgents es un sistema multiagente para la demostración automática de teoremas matemáticos de estilo olimpiada, desarrollado por Marlon Janpierre Puentes Guzmán y Juan Fernandez en la Universidad Pedagógica y Tecnológica de Colombia (UPTC, Sogamoso). No se trata de un modelo de lenguaje con pesos propios, sino de una orquestación de agentes basados en un LLM externo (Gemini, vía API) que combinan planificación, recuperación aumentada (RAG) sobre Mathlib, generación en lenguaje natural, autoformalización a Lean 4 y verificación formal con el kernel de Lean 4. Un problema solo se considera resuelto si el kernel lo acepta, lo que elimina la dependencia de la autoevaluación del LLM.

El repositorio de Hugging Face (0,2 GB) contiene código, datos curados, índice de embeddings, documentación y resultados, pero no pesos de modelo. La arquitectura se implementa como un grafo LangGraph con estados PLAN → RETRIEVE → GENERATE → FORMALIZE → VERIFY, con bucles de crítica y replanificación cuando Lean rechaza la prueba. El recuperador opera sobre un índice FAISS de 94 582 lemas de Mathlib v4.34.1.

Su relevancia radica en la separación estricta entre generación y verificación: los resultados publicados muestran que el LLM declaró correctas 6 de 6 pruebas en lenguaje natural, pero Lean solo confirmó 3, lo que ilustra el valor de un verificador formal independiente. El proyecto es un trabajo académico de curso, con resultados parciales reales y proyecciones explícitamente marcadas como simuladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema multiagente orquestado con LangGraph sobre LLM externo (Gemini vía API); verificador Lean 4 + Mathlib v4.34.1 |
| Parametros totales | No aplica (no se distribuyen pesos de modelo) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (depende del LLM externo configurado) |
| Tipos de cuantizacion | No aplica (inferencia vía API del proveedor) |
| Idiomas soportados | Inglés (en), español (es) |
| Licencia | Apache-2.0 (código); Mathlib Apache-2.0; miniF2F MIT; embeddings BAAI/bge-small-en-v1.5 MIT |
| Formato de pesos | No aplica; el repositorio contiene código Python, JSONL, índice FAISS y documentos |

## Arquitectura y entrenamiento

El sistema no entrena un modelo propio. Se compone de seis agentes especializados (planner, retriever, generator, autoformalizer, verifier, critic) coordinados mediante un grafo LangGraph. El flujo parte de un planificador que descompone el teorema, un recuperador RAG que consulta un índice FAISS construido sobre 94 582 declaraciones de Mathlib usando embeddings `BAAI/bge-small-en-v1.5`, un generador que produce la prueba, un autoformalizador que la traduce a Lean 4, y un verificador que invoca el kernel de Lean. Si la verificación falla, un crítico decide si reintentar la generación o replanificar, hasta un límite `k_max`.

El LLM por defecto es `gemini-3.6-flash` con respaldo `gemini-3.5-flash`, configurado con límites del plan gratuito (pausa mínima entre llamadas, espera ante errores 429, reanudación con `--resume`). La reproducibilidad se garantiza registrando semilla, versión de Lean y Mathlib, modelo y temperatura del LLM, modelo de embeddings y versiones de librerías en `logs/<run_id>.jsonl`; `lean_project/lake-manifest.json` fija el commit exacto de cada dependencia. El dataset curado se deriva de miniF2F en versión Lean 4 (tomada de DeepSeek-Prover-V1.5), con 421 de 488 problemas que compilan, y se particiona en 10 problemas de desarrollo y 30 de prueba.

## Capacidades

- Demostración de teoremas de estilo olimpiada con verificación formal obligatoria por el kernel de Lean 4.
- Descomposición de problemas mediante planificación multiagente y replanificación ante fallos.
- Recuperación aumentada sobre Mathlib (94 582 lemas) para fundamentar las pruebas en lemas existentes.
- Autoformalización de lenguaje natural a Lean 4.
- Crítica automática de pruebas rechazadas y reintento con estrategias alternativas.
- Soporte de ejecución con LLM simulado para pruebas de integración sin consumir API.
- Idiomas de documentación e interfaz: inglés y español.
- Trazabilidad completa por agente e intento en logs JSONL.

## Casos de uso

- Investigación en demostración automática de teoremas: sirve como banco de pruebas reproducible para comparar configuraciones (con y sin RAG, con y sin crítico) sobre miniF2F en Lean 4, con manifiestos de reproducibilidad por corrida.
- Evaluación de la fiabilidad de LLM en matemáticas: el pipeline permite medir la brecha entre la autoevaluación del modelo y la verificación formal, como ilustra el resultado de 6/6 declaradas correctas frente a 3/6 confirmadas por Lean.
- Docencia universitaria de IA: el repositorio incluye pruebas pytest, smoke test con LLM simulado y documentación de instalación en Windows, lo que facilita usarlo como proyecto guiado en cursos.
- Generación asistida de pruebas formales: un matemático puede plantear un teorema, obtener una formalización candidata en Lean 4 y usar el kernel como filtro antes de revisar manualmente.
- Construcción de índices de recuperación sobre Mathlib: el módulo `retrieval/` y el notebook de embeddings en Colab permiten reconstruir y evaluar el índice (Recall@k) para otras aplicaciones de RAG matemático.
- Integración en pipelines de CI para formalización: el proyecto Lean con Mathlib fijada y `lake-manifest.json` permite verificar pruebas de forma determinista en un entorno controlado.
- Estudio de arquitecturas multiagente con LangGraph: el grafo, las configuraciones de ablación y las líneas base sirven como referencia para diseñar orquestaciones con verificación externa.

## Benchmarks y rendimiento

| Tarea | Resultado | Tipo |
|---|---|---|
| Dataset curado miniF2F Lean 4 | 421/488 compilan; 10 desarrollo + 30 prueba | Real |
| A — LLM directo a Lean (10 problemas) | 3/10 verificados por Lean; pass@1 0,30; IC 95 % [0,11; 0,60] | Real |
| B — lenguaje natural (6 problemas) | LLM declaró correcto 6/6; Lean confirmó 3 | Real |
| C — sin RAG | Abortado por cuota de la API gratuita | Real |
| Recuperador (94 582 lemas) | Recall@10 = 0,25 (8 consultas) | Real |
| C, D, E sobre 30 problemas | Proyección con supuestos explícitos | Simulado |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones directas con otros sistemas de demostración automática.

## Requisitos de hardware

- No se requiere VRAM para el modelo: la inferencia se delega a la API de Gemini; el coste computacional local es de orquestación y verificación.
- Lean 4 con Mathlib v4.34.1 requiere CPU, RAM y espacio en disco considerables; la compilación inicial de Mathlib es la carga principal (se recomienda `lake exe cache get` para evitar recompilar).
- GPU recomendada únicamente para reconstruir el índice de embeddings: el notebook `notebooks/embeddings_colab.ipynb` está pensado para Colab con GPU.
- Cabe en cualquier equipo de desarrollo convencional para ejecutar el pipeline; no se requieren GPU de datacenter (A100, H100) ni consumer de gama alta (RTX 4090).
- Despliegue: ejecución local con Python y `pip install -r requirements.txt`; demo en Hugging Face Spaces con Gradio en modo reproducción.
- Latencia y throughput: no disponibles; dependen de la cuota y latencia de la API de Gemini y del tiempo de verificación de Lean.

## Comparativa con modelos similares

| Sistema | Enfoque | Verificación formal | Pesos distribuidos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MathAgents | Multiagente + RAG + Lean 4 sobre LLM externo | Sí (kernel Lean 4) | No | Apache-2.0 | Repositorio HF y demo en Spaces |
| DeepSeek-Prover-V1.5 | Modelo especializado en demostración formal | Sí (Lean) | Sí | MIT (según la model card citada) | Público |
| Otros sistemas de demostración automática | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación cuantitativa con DeepSeek-Prover-V1.5 u otros sistemas no está disponible en la información proporcionada; los benchmarks publicados por MathAgents se limitan a sus propias configuraciones sobre miniF2F.

## Limitaciones y advertencias

- Es un proyecto final de curso académico, no un producto con mantenimiento garantizado; el estado de madurez se documenta en `docs/estado.md`.
- Los resultados sobre 30 problemas de las configuraciones C, D y E son proyecciones simuladas con supuestos explícitos, no mediciones reales.
- La configuración C (sin RAG) se abortó por agotamiento de la cuota de la API gratuita, por lo que la ablación clave está incompleta.
- El Recall@10 del recuperador es bajo (0,25 sobre 8 consultas), lo que limita la calidad de la fundamentación en lemas de Mathlib.
- Depende de un LLM externo vía API: cambios en el modelo, en los límites del plan gratuito o en los términos de Google afectan a la reproducibilidad y al coste.
- No se distribuyen pesos de modelo; no es desplegable de forma autónoma sin acceso a un LLM compatible.
- El conjunto de evaluación es pequeño (10 problemas para la línea base A, 6 para B), con intervalos de confianza amplios (IC 95 % [0,11; 0,60] en A).
- Idiomas soportados limitados a inglés y español; el rendimiento en otros idiomas no está evaluado.
- Riesgo de alucinación del LLM subyacente mitigado, pero no eliminado, por la verificación formal; la formalización incorrecta de un enunciado puede producir una prueba válida de un teorema distinto.
- Licencia Apache-2.0 para el código, pero el uso del LLM externo queda sujeto a los términos de Google; Mathlib, miniF2F y el modelo de embeddings tienen licencias propias que deben respetarse.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/juferi07/mathagents
- Demo (modo reproducción): https://huggingface.co/spaces/juferi07/mathagents-demo
- Documentación de resultados: `docs/resultados.md` (dentro del repositorio)
- Informe final en inglés (ACM): `docs/informe/final_en/final_report_ACM.pdf`
- Informe final en español (IEEE): `docs/informe/final_es/informe_final_IEEE.pdf`
- Guía de instalación: `docs/instalacion.md`
- Estado del proyecto: `docs/estado.md`
- Notebook de embeddings: `notebooks/embeddings_colab.ipynb`
- Google AI Studio (clave de API para Gemini): https://aistudio.google.com
