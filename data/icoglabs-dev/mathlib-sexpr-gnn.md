# iCogLabs-Dev/Mathlib-Sexpr-GNN

## Resumen

Mathlib-Sexpr-GNN es un sistema de investigación para la demostración automática de teoremas en Lean 4, desarrollado por iCogLabs-Dev. No es un modelo de lenguaje generativo al uso, sino un conjunto de componentes especializados que combinan una red neuronal de grafos (GNN) sobre representaciones S-expression normalizadas de estados de prueba, una cabeza de predicción de tácticas, un decodificador GRU de argumentos y un recuperador de premisas con índice FAISS sobre Mathlib. El paquete exporta tres etapas de entrenamiento: una etapa conjunta (época 3), un refinamiento local (época 8) y un par dual-encoder/índice emparejado (época 5).

El sistema aborda dos subtareas clásicas del razonamiento formal: la selección de la siguiente táctica y la recuperación de lemas relevantes. Para ello incorpora una cabeza explícita de recuento de argumentos, una compuerta por posición que decide entre fuente local o de biblioteca, un selector local y una puntuación contextual de biblioteca. Admite como máximo tres argumentos planos por paso.

Es relevante porque publica pesos y artefactos de recuperación verificables (hashes de torre, tokenizador y corpus, y validación de que las filas FAISS coinciden con la matriz de vectores), algo poco habitual en sistemas de demostración formal. El autor advierte explícitamente de que se trata de un sistema experimental offline y no de un probador de teoremas completo medido. El repositorio ocupa 1,4 GB y la licencia de los pesos es Apache 2.0, mientras que el código de implementación asociado se distribuye bajo GPLv2 según el fichero NOTICE.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GNN sobre grafos S-expression normalizados + cabeza de táctica + decodificador GRU de argumentos + recuperador dual-encoder con índice FAISS |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 para los pesos; código de implementación GPLv2 (ver NOTICE) |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El sistema es modular. Un codificador de grafos normalizado procesa el estado de prueba en formato `lean-model-sexp-v2` y alimenta una cabeza de predicción de tácticas. Los argumentos de la táctica se generan con un decodificador GRU, apoyado por una cabeza explícita que predice el número de argumentos (hasta tres argumentos planos). Una compuerta por posición decide si cada argumento debe resolverse contra el contexto local o contra la biblioteca, con un selector local y una puntuación contextual de biblioteca. La recuperación de premisas se realiza con un par dual-encoder y un índice FAISS sobre el corpus de Mathlib, con validación de hashes de torre, tokenizador y corpus, y comprobación de igualdad entre las filas del índice y la matriz de vectores.

El bundle documenta tres etapas: etapa conjunta en época 3, refinamiento solo local en época 8 y par dual-encoder/índice emparejado en época 5. Los detalles de versiones de dependencias y etapas de entrenamiento están en `provenance/`, y los diagnósticos por etapa en `evaluation/`. La model card no especifica el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF o DPO; tampoco documenta innovaciones como decodificación especulativa o atención lineal. El autor indica que no se ha entrenado sobre las representaciones de plantilla más recientes.

## Capacidades

- Predicción de la siguiente táctica en estados de prueba de Lean 4 representados como grafos S-expression normalizados.
- Decodificación de argumentos de táctica con un máximo de tres argumentos planos.
- Predicción explícita del número de argumentos de la táctica.
- Recuperación de premisas en vivo mediante `retrieve(original_state_texts)` sobre el índice de Mathlib.
- Decisión por posición entre fuente local (hipótesis) y fuente de biblioteca (lemas).
- Puntuación contextual de candidatos de biblioteca y selección local de argumentos.
- Interfaz programática `predict(batch, original_state_texts, graph_format="lean-model-sexp-v2")` sobre lotes de grafos PyG preparados.
- Perfil opcional `accepted_local_cues` para usar señales normalizadas de objetivo/hipótesis; desactivado por defecto en inferencia base.
- No soporta tool calling, agentes multi-paso, visión, audio ni generación de texto libre; no es un modelo conversacional.

## Casos de uso

- Investigación en demostración automática de teoremas: integración del sistema como política de selección de táctica dentro de un probador interactivo o automático sobre Lean 4 y Mathlib, usando `system.policy` para proponer el siguiente paso.
- Recuperación de premisas para asistentes de prueba: `system.retriever` y `system.lemma_index` permiten sugerir lemas de Mathlib relevantes dado el texto del estado, útil en entornos de edición como VS Code con Lean.
- Evaluación reproducible de pipelines de ATP: el bundle con `bundle.json` y hashes permite comparar etapas (época 3 frente a época 8) en condiciones controladas, fijando un tag de release o commit completo.
- Estudio de decodificación estructurada de argumentos: el decodificador GRU con cabeza de recuento de argumentos sirve como banco de pruebas para investigar generación restringida a tres argumentos planos.
- Análisis de enrutamiento local versus biblioteca: la compuerta por posición permite estudiar qué proporción de argumentos se resuelven con hipótesis locales frente a lemas, un dato útil para diseñar tácticas y heurísticas.
- Docencia e investigación en representaciones formales: el sistema y sus vocabularios separados (`system.policy`, `system.retriever`, `system.lemma_index`) permiten experimentar con grafos S-expression normalizados sin reentrenar desde cero.
- Reutilización de artefactos de recuperación: el índice FAISS validado por hashes puede emplearse en otros sistemas que necesiten búsqueda de premisas sobre Mathlib, siempre que se respete la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a `evaluation/` para diagnósticos por etapa, pero advierte que las cohortes difieren entre etapas y que no constituyen una reevaluación del export completo. No se ofrecen cifras de MMLU, HumanEval, GSM8K ni de tasa de éxito en demostración de teoremas.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio pesa 1,4 GB, lo que sugiere que la inferencia en CPU es viable; el ejemplo de carga usa `device="cpu"`.
- GPU recomendadas: no disponibles. Al no documentarse requisitos, no se puede confirmar qué GPU consumer (RTX 4090, RTX 3090, etc.) o de datacenter (A100, H100) son adecuadas.
- Compatibilidad con GPU consumer: probablemente sí por el tamaño del bundle, pero no está confirmado por el autor.
- Opciones de despliegue: carga mediante `huggingface_hub.snapshot_download` y `maths_ai.gnn_inference.atp_lean_gnn.joint_bundle.load_joint_source_bundle`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, lo cual es esperable al no ser un modelo de lenguaje transformer estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mathlib-Sexpr-GNN (iCogLabs-Dev) | GNN + GRU + recuperador para Lean 4 | no disponible | no disponible | Apache 2.0 (pesos), GPLv2 (código) | HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han incluido cifras de rendimiento ni de parámetros de terceros para evitar datos no verificados.

## Limitaciones y advertencias

- Sistema experimental offline: el autor lo describe explícitamente como no medido como probador de teoremas completo.
- No convierte objetivos Lean impresos arbitrarios en grafos compatibles; `predict` exige grafos PyG normalizados y preparados previamente.
- No está entrenado sobre las representaciones de plantilla más recientes, lo que puede limitar su aplicabilidad a versiones actuales de Mathlib.
- La paridad de servicio con estados normalizados en vivo queda como una compuerta separada no resuelta según la model card.
- Los diagnósticos de `evaluation/` provienen de cohortes distintas y no reevalúan el export completo; no deben citarse como rendimiento global.
- Solo soporta inglés como idioma declarado y no es un modelo generativo de texto general.
- Riesgo de alucinación en el sentido de tácticas o argumentos inválidos: no se documentan tasas de error ni calibración.
- Sesgos: no documentados por el autor.
- Licencia: los pesos son Apache 2.0, pero el código de implementación es GPLv2 según NOTICE; verificar compatibilidad antes de uso comercial o de integrarlo en productos propietarios.
- Reproducibilidad: es necesario fijar un tag de release o un commit completo de Hugging Face; el ejemplo de la model card usa un marcador `<release-tag-or-commit>` sin valor concreto.
- El perfil `accepted_local_cues` requiere registros normalizados de objetivo/hipótesis; su uso incorrecto puede alterar el comportamiento respecto a la inferencia base.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria documentada.

## Enlaces

- HuggingFace: https://huggingface.co/iCogLabs-Dev/Mathlib-Sexpr-GNN
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
