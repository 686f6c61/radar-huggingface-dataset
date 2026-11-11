# iCogLabs-Dev/Lean-Proof-Search-Checkpoints

## Resumen

Lean Proof Search Checkpoints es un repositorio de checkpoints y artefactos de despliegue para demostración automática de teoremas en Lean, desarrollado por iCogLabs-Dev. No se trata de un modelo de lenguaje generativo al uso, sino de un sistema de búsqueda de pruebas basado en una política de red neuronal sobre grafos (graph neural network, GNN) sensible a la fuente, combinada con un crítico dentro de un pipeline de aprendizaje por refuerzo actor-critic. El sistema emplea búsqueda en árbol Monte Carlo con PUCT y búsqueda best-first, con guía opcional mediante redes lógicas probabilísticas (PLN).

El problema que aborda es la búsqueda de pruebas formales en el entorno Lean/Mathlib: dado un estado de prueba normalizado, la política propone tácticas y argumentos, selecciona premisas locales o de bibliotecas externas recuperadas mediante un índice FAISS, y el crítico estima el valor del estado para guiar la búsqueda. Las pruebas candidatas solo se reportan como exitosas tras pasar por el proceso de replay y certificación del kernel de Lean.

Es relevante porque empaqueta de forma versionada y verificable (con manifiestos SHA-256 y bindings entre política y recuperación) todos los artefactos necesarios para desplegar un probador de teoremas neuronal: checkpoint, vocabularios de grafos, codificador de consultas, índice de lemas, inventario de declaraciones y configuración de servicio. No es un modelo standalone de Transformers y requiere el código de inferencia y búsqueda propio del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal sobre grafos (GNN) sensible a la fuente con cabeza de predicción de tácticas, cabeza de conteo de argumentos, decodificador GRU de argumentos, cabeza de selección de fuente, selección de declaraciones locales, scoring de candidatos de biblioteca recuperados y crítico de valor de estado; búsqueda con PUCT MCTS y best-first |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en formato .pt; no se documentan cuantizaciones) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | checkpoint.pt (PyTorch); artefactos auxiliares en prepared/, query/, index/ (FAISS), lemmas.jsonl y declarations.json |

## Arquitectura y entrenamiento

La política combina un codificador de grafos para expresiones normalizadas de estados de prueba Lean, una cabeza de predicción de tácticas, una cabeza explícita de conteo de argumentos, un decodificador GRU para argumentos, una cabeza de selección de fuente que elige entre contexto local y argumentos de bibliotecas externas, selección de declaraciones locales y scoring de candidatos de biblioteca recuperados. Un crítico estima el valor del estado de prueba para el aprendizaje por refuerzo. Las premisas externas se recuperan mediante un codificador de texto emparejado y un índice de lemas (FAISS).

El entrenamiento parte de una inicialización supervisada con una política conjunta sensible a la fuente, seguida de refinamiento en selección local; los artefactos de recuperación emparejados provienen del retriever e índice de la época 5. Las releases de RL publicadas pueden diferir en checkpoint inicial y final, algoritmo de búsqueda (PUCT o best-first), uso de guía PLN, rondas de entrenamiento, presupuestos de búsqueda y criterio de selección de checkpoint (mejor por evaluación periódica o último guardado). El algoritmo de búsqueda es configuración de runtime, no una arquitectura distinta: un checkpoint entrenado con PUCT puede buscarse con best-first si las interfaces son compatibles.

## Capacidades

- Búsqueda de pruebas en Lean/Mathlib: propone tácticas y argumentos dado un estado de prueba normalizado.
- Selección de premisas: elige entre declaraciones locales y lemas externos recuperados mediante índice FAISS.
- Estimación de valor de estado mediante crítico para guiar la búsqueda por refuerzo.
- Búsqueda PUCT Monte Carlo y búsqueda best-first configurables en runtime.
- Guía opcional con Probabilistic Logic Networks (PLN) para orientar la búsqueda (requiere runtime PeTTa/SWI-Prolog).
- Certificación de pruebas: las pruebas candidatas deben pasar replay y verificación del kernel de Lean antes de reportarse como exitosas.
- Servicio FastAPI con demostración de un solo objetivo, trabajos de evaluación sobre datasets y comprobaciones de salud/readiness.
- Generación de propuestas en modo greedy o muestreado según configuración.
- No soporta tool calling, agentes generales, visión, audio ni generación de texto libre: es un sistema especializado de búsqueda de pruebas.

## Casos de uso

- Automatización de demostraciones en Lean 4/Mathlib: el sistema recibe un objetivo formalizado y ejecuta búsqueda PUCT o best-first guiada por la política y el crítico para producir una prueba certificada por el kernel.
- Evaluación de cohorts de teoremas: el servicio FastAPI expone trabajos de evaluación sobre datasets, permitiendo medir tasas de prueba sobre un conjunto fijo de teoremas con configuraciones de búsqueda reproducibles.
- Investigación en aprendizaje por refuerzo para razonamiento formal: los checkpoints actor-critic y los manifiestos de release permiten reproducir experimentos y comparar rondas de RL, presupuestos de búsqueda y algoritmos.
- Asistencia a matemáticos en entornos interactivos: integrado en el runtime de la aplicación, puede proponer tácticas y argumentos para estados de prueba concretos, con verificación formal antes de aceptar resultados.
- Recuperación de premisas para formalización: el índice de lemas y el codificador de consultas pueden emplearse para localizar lemas relevantes de Mathlib dado un estado de prueba.
- Despliegue reproducible en contenedores: los bundles versionados con checksums SHA-256 y bindings entre política y recuperación permiten montar artefactos en `/artifacts` y configuración en `/config` para servir el probador en producción.
- Comparación de estrategias de búsqueda: al ser la búsqueda configuración de runtime, se puede evaluar el mismo checkpoint con PUCT, best-first y guía PLN activada o desactivada sobre el mismo cohort de teoremas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se afirma ninguna mejora agregada de tasa de prueba y que las comparaciones significativas deben reportar el dataset de evaluación, el cohort exacto de teoremas y la configuración base y de RL.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 1,4 GB, pero no se desglosa el tamaño del checkpoint ni de los artefactos de recuperación.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: servicio FastAPI propio del proyecto y despliegue en Docker con montaje de `artifacts/` en `/artifacts` y `config/` en `/config`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de Transformers de generación de texto.
- Dependencias de runtime: Lean/Mathlib compilado, REPL personalizado, dependencias Python y, para perfiles con PLN, runtime PeTTa/SWI-Prolog.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lean Proof Search Checkpoints (iCogLabs-Dev) | GNN actor-critic + MCTS para Lean | no disponible | no disponible | no disponible | Hugging Face, requiere código de inferencia propio |
| Otros probadores neuronales para Lean | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No es un modelo de generación de texto standalone: requiere el código de inferencia y búsqueda del proyecto `Mathematics-ai-atp` (rama `MCTS-AC-branch`) y un entorno Lean/Mathlib compatible.
- Los artefactos deben usarse como conjunto de despliegue emparejado: checkpoint, vocabularios de grafos, codificador de consultas, vectores de lemas e inventario de declaraciones no son intercambiables entre releases.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial; debe verificarse antes de cualquier despliegue en producción.
- Idioma limitado al inglés en los metadatos; el dominio efectivo es Lean/Mathlib, no lenguaje natural general.
- Riesgo de alucinación mitigado parcialmente: las pruebas candidatas solo se reportan como certificadas tras replay y verificación del kernel de Lean, pero las propuestas de tácticas y lemas pueden ser inválidas y consumir presupuesto de búsqueda.
- La model card no afirma mejoras agregadas de tasa de prueba; cualquier comparación debe especificar cohort de teoremas y configuración de búsqueda.
- Los perfiles con PLN requieren runtime PeTTa/SWI-Prolog adicional; PLN guía la búsqueda pero no sustituye la verificación de Lean.
- El directorio descargado es un symlink a un directorio de respaldo persistente; eliminar el respaldo rompe el despliegue.
- El repositorio es privado potencialmente: requiere autenticación de Hugging Face con acceso de lectura.
- Fecha de creación del repositorio (2026-11-07) y actualización (2026-11-11) según los metadatos; verificar la vigencia de los artefactos antes de fijar un commit inmutable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/iCogLabs-Dev/Lean-Proof-Search-Checkpoints
- Código de la aplicación: https://github.com/iCog-Labs-Dev/Mathematics-ai-atp/tree/MCTS-AC-branch
- Guía de despliegue en Hugging Face: https://github.com/iCog-Labs-Dev/Mathematics-ai-atp/blob/MCTS-AC-branch/docker/HUGGING_FACE_DEPLOYMENT.md
- Documentación de despliegue MCTS: https://github.com/iCog-Labs-Dev/Mathematics-ai-atp/blob/MCTS-AC-branch/maths_ai/gnn_inference/docs/mcts_hugging_face_deployment.md
