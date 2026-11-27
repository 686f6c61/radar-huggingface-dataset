# dleemiller/AbsoluteZero-nli-4b

## Resumen

AbsoluteZero-nli-4b es un cross-encoder especializado en inferencia de lenguaje natural (NLI) desarrollado por dleemiller sobre el modelo base Qwen/Qwen3.5-4B. Resuelve el problema de clasificar la relacion logica entre un texto (premisa) y una afirmacion (hipotesis): implicacion, contradiccion o neutralidad. Su relevancia actual radica en que combina dos modos de inferencia: un modo rapido de un solo paso por la red y un modo "think" que genera una traza de razonamiento breve antes de emitir el veredicto, lo que permite auditar por que el modelo clasifica de una determinada manera.

El modelo tiene 4.205.766.656 parametros y admite documentos de hasta 32.000 tokens, lo que lo hace adecuado para contratos, politicas y pasajes RAG largos. Se distribuye bajo licencia Apache-2.0 y esta pensado para tareas de deteccion de alucinaciones, fact-checking, groundedness en RAG, moderacion y clasificacion zero-shot.

Su interes practico es doble: por un lado, ofrece probabilidades calibradas de implicacion, contradiccion y neutralidad; por otro, las trazas de razonamiento permiten agrupar fallos de clasificacion y probar variaciones de la hipotesis contra un conjunto de validacion, una capacidad poco habitual en encoders zero-shot clasicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder sobre transformer decoder Qwen3.5 (qwen3_5_text) con cabeza de clasificacion NLI; codigo personalizado (custom_code) |
| Parametros totales | 4.205.766.656 |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | hasta 32.000 tokens (documentos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de tipo decoder, y lo adapta como cross-encoder para NLI anadiendo una cabeza de clasificacion que devuelve probabilidades sobre las tres etiquetas (implicacion, contradiccion, neutralidad). El pipeline declarado es zero-shot-classification y la libreria de referencia es sentence-transformers, con soporte de codigo personalizado (trust_remote_code).

El entrenamiento se apoya en los datasets propios dleemiller/FineCat-NLI y dleemiller/FineCat-NLI-Reason, y las etiquetas del repositorio mencionan knowledge-distillation y GRPO (Group Relative Policy Optimization). La innovacion principal es el modo "think": el modelo genera una traza corta de razonamiento (aproximadamente 50 tokens de media en ANLI y unos 200 en problemas de logica de primer orden) que la cabeza de puntuacion lee antes de emitir el veredicto, lo que permite inspeccionar el razonamiento en casos dificiles como negaciones, cuantificadores y logicas de varios pasos. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion completa del dataset.

## Capacidades

- Clasificacion NLI de tres vias (implicacion, contradiccion, neutralidad) con probabilidades calibradas.
- Clasificacion zero-shot y etiquetado de textos mediante hipotesis generadas ("This text is about X").
- Deteccion de alucinaciones y verificacion de groundedness en pipelines RAG.
- Modo rapido: un solo paso forward con cabeza de clasificacion, similar a un cross-encoder convencional.
- Modo think: genera una traza de razonamiento breve e inspeccionable antes del veredicto.
- Razonamiento multi-paso sobre negaciones, cuantificadores y logica de primer orden.
- Fact-checking y moderacion mediante afirmaciones de politica como hipotesis.
- Extraccion clinica y revision de contratos sobre documentos largos (hasta 32k tokens).
- Capacidad multilingue: solo ingles segun la informacion disponible.
- No se documenta soporte de tool calling ni comportamiento agentico generico.

## Casos de uso

- Groundedness en RAG: se pasan los pasajes recuperados como premisa y la respuesta generada como hipotesis; el modelo devuelve la probabilidad de implicacion y permite descartar respuestas no sustentadas (86,4 % en RAGTruth segun el autor).
- Deteccion de alucinaciones en produccion: integrado como verificador posterior al LLM generador, filtra afirmaciones que el contexto no implica antes de mostrarlas al usuario.
- Moderacion y guardrails: se formula la politica como hipotesis ("This message violates the policy") y se usa la probabilidad de implicacion como senal de bloqueo (92,5 % en CrossingGuard segun el autor).
- Clasificacion zero-shot de tickets o resenas: se construyen hipotesis por categoria ("This text is about billing") y se elige la de mayor probabilidad de implicacion, sin entrenamiento adicional.
- Revision de contratos: con contexto de hasta 32k tokens, se evaluan afirmaciones como "The agreement permits sharing data with third parties" sobre el contrato completo (92,9 % en ContractNLI segun el autor).
- Extraccion clinica y cribado SDOH: se verifica si una nota clinica implica afirmaciones sobre el paciente, por ejemplo situacion laboral (98,2 % en SDOH-NLI segun el autor).
- Fact-checking editorial: se contrastan afirmaciones contra documentos fuente y se usa el modo think en los casos ambiguos para obtener una traza auditable del veredicto.
- Analisis de fallos automatizado: las trazas permiten agrupar errores de clasificacion y probar variantes de la hipotesis contra un conjunto de validacion antes de desplegar cambios.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Dataset | Metrica | Valor |
|---|---|---|
| FineCat-NLI (test) | Accuracy | 0,8533 |
| MultiNLI (validation matched) | Accuracy | 0,9207 |
| MultiNLI (validation mismatched) | Accuracy | 0,9226 |
| SNLI (test) | Accuracy | 0,9367 |
| ANLI round 1 (test) | Accuracy | 0,826 |
| ANLI round 2 (test) | Accuracy | 0,706 |
| ANLI round 3 (test) | Accuracy | 0,6542 |
| WANLI (test) | Accuracy | 0,772 |
| LingNLI (validation) | Accuracy | 0,883 |
| Benchmark de 45 datasets NLI / zero-shot / grounding (media macro) | Macro accuracy | 0,8383 |

Resultados adicionales por aplicacion citados en la model card (modo rapido):

| Aplicacion | Benchmark | Resultado |
|---|---|---|
| Clasificacion zero-shot / tagging | zs_meta (18 tareas) | 93,4 % |
| Grounding en RAG | RAGTruth | 86,4 % |
| Guardrails / moderacion | CrossingGuard | 92,5 % |
| Extraccion clinica | SDOH-NLI | 98,2 % |
| Revision de contratos | ContractNLI | 92,9 % |

El autor declara el primer puesto en el OpenNLI Skill Index (11-03-26, modo rapido). No se han publicado en la informacion disponible comparaciones directas con otros modelos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada: con 4,2B parametros, en FP16 requiere aproximadamente 8,4 GB solo para pesos; en BF16 similar. En cuantizacion de 8 bits rondaria 4-5 GB y en 4 bits unos 2,5-3 GB, mas overhead de contexto (los tipos de cuantizacion no estan documentados por el autor).
- El contexto de hasta 32k tokens incrementa el consumo de memoria KV; para documentos largos conviene reservar VRAM adicional.
- GPU recomendadas: A100 40/80 GB o H100 para lotes grandes y contexto maximo; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para FP16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 y similares con 16 GB o mas en FP16; en 8 GB o menos seria necesario cuantizar.
- Despliegue: sentence-transformers (CrossEncoder con trust_remote_code) es la via documentada; al ser un modelo con codigo personalizado, la compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponibles. El modo think anade unos 50 tokens de generacion en ANLI y unos 200 en logica de primer orden, por lo que es mas lento que el modo rapido.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de modelos comparables (por ejemplo, cross-encoders NLI de la familia DeBERTa o modelos NLI de mayor tamano) medidos en los mismos benchmarks, por lo que la comparacion cuantitativa no esta disponible. A nivel cualitativo:

| Modelo | Parametros | Contexto | Modo think | Licencia |
|---|---|---|---|---|
| AbsoluteZero-nli-4b | 4,2B | 32k | Si | Apache-2.0 |
| Cross-encoders NLI tipo DeBERTa | no disponible | no disponible | No | variable |
| Modelos NLI sobre LLM de 7-8B | no disponible | no disponible | variable | variable |

La ventaja diferencial declarada es la combinacion de contexto largo, trazas de razonamiento inspeccionables y licencia Apache-2.0 en un unico modelo.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera degradado.
- Los benchmarks son declarados por el autor y no estan verificados de forma independiente (verified: false en la model-index).
- El rendimiento cae de forma notable en ANLI r2 (0,706) y r3 (0,6542), lo que indica dificultad con inferencias adversarias y de varios pasos.
- Riesgo de alucinacion en las trazas del modo think: la justificacion generada puede no reflejar el criterio real de clasificacion.
- Requiere trust_remote_code, lo que implica ejecutar codigo personalizado del autor; conviene auditar el repositorio antes de desplegarlo en produccion.
- No se documentan sesgos conocidos ni evaluaciones de robustez frente a dominios fuera de los benchmarks citados.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-4B debe verificarse por separado para confirmar compatibilidad.
- Al ser un cross-encoder de clasificacion, no es un modelo generativo general: no debe usarse como LLM conversacional.
- No hay informacion sobre cuantizaciones oficiales ni sobre compatibilidad con motores de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dleemiller/AbsoluteZero-nli-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset FineCat-NLI: https://huggingface.co/datasets/dleemiller/FineCat-NLI
- Dataset FineCat-NLI-Reason: https://huggingface.co/datasets/dleemiller/FineCat-NLI-Reason
- MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- SNLI: https://huggingface.co/datasets/stanfordnlp/snli
- ANLI: https://huggingface.co/datasets/facebook/anli
- WANLI: https://huggingface.co/datasets/alisawuffles/WANLI
- LingNLI: https://huggingface.co/datasets/tasksource/lingnli
