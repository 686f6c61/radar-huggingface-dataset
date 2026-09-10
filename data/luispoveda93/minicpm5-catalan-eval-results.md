# luispoveda93/minicpm5-catalan-eval-results

## Resumen

`luispoveda93/minicpm5-catalan-eval-results` es un repositorio de artefactos de evaluación, no un modelo desplegable: contiene los resultados crudos (`results-base.json`, `results-v1.json`, `results-v2.json`) de una comparativa en catalán entre el checkpoint base `openbmb/MiniCPM5-2B` y dos ajustes fine-tuning conversacionales del mismo autor, `MiniCPM5-2B-catalan-chat` (v1) y `MiniCPM5-2B-catalan-chat-v2` (v2). La evaluación se ejecutó el 2026-09-10 con un trabajo `a10g-small` por modelo (~7 minutos cada uno), puntuación MCQ por loglikelihood de las opciones como continuaciones, plantilla de chat para v1/v2, prompt en crudo para el base y semillas fijas.

El interés del repositorio es metodológico y de transparencia: el propio autor documenta que, a ~2,5 B de parámetros, los tres checkpoints se sitúan en el suelo del azar en los benchmarks de opción múltiple empleados (Belebele ca, CaBBQ y multi_lmentry), de modo que las diferencias observadas (+0,8 a +3,2 puntos) quedan dentro del ruido de muestreo con n=500/900 (±~2-3 puntos). El único eje que discrimina es la perplejidad sobre las respuestas de validación de InstruCAT, con v1 en 451,0 frente a 971,2 del base y 873,7 de v2.

Se trata, por tanto, de un conjunto de datos de evaluación para el seguimiento de fine-tuning en catalán de modelos pequeños, con advertencias explícitas sobre el protocolo (el uso de loglikelihood bajo plantilla de chat es un formato no estándar) y sobre su alcance (no mide calidad conversacional, coherencia multi-turno ni adherencia al system prompt, que eran el objetivo de la segunda ronda de entrenamiento).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la información no describe la arquitectura del modelo evaluado) |
| Parámetros totales | ≈2,5 B (citado en la model card; el identificador del modelo indica 2B) |
| Parámetros activos | No aplica o no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible para los modelos; la evaluación cubre catalán (`cat_Latn`) |
| Licencia | No disponible |
| Formato de pesos | No disponible (los artefactos del repositorio son JSON: `results-base.json`, `results-v1.json`, `results-v2.json`) |
| Tipo de artefacto | Resultados de evaluación y comparativa de checkpoints |
| Fecha de evaluación | 2026-09-10 |
| Hardware de evaluación | `a10g-small`, un trabajo por modelo, ~7 minutos por modelo |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo evaluado. Los artefactos corresponden a `openbmb/MiniCPM5-2B` y a dos derivados conversacionales en catalán denominados `MiniCPM5-2B-catalan-chat` (v1) y `MiniCPM5-2B-catalan-chat-v2` (v2). Del texto se deduce únicamente que se trata de un modelo de aproximadamente 2,5 B de parámetros y que v1/v2 se han ajustado para conversación, con una primera ronda de entrenamiento cuyo dominio coincide con el split de entrenamiento de InstruCAT y una segunda ronda orientada a calidad conversacional, coherencia multi-turno y adherencia al system prompt.

La aportación técnica del repositorio es el protocolo de evaluación: puntuación de opción múltiple por loglikelihood de las opciones como continuaciones, con contexto de plantilla de chat para v1/v2 y prompt en crudo para el modelo base, semillas fijas y tres benchmarks en catalán (Belebele `cat_Latn`, CaBBQ y las tareas MCQ de multi_lmentry), más perplejidad sobre las respuestas de validación de InstruCAT (15.081 tokens sobre 2.000 documentos, media ~7,5 tokens por documento). No se documentan innovaciones de arquitectura ni detalles de composición del dataset de preentrenamiento, RLHF o DPO.

## Capacidades

- Evaluación de comprensión lectora en catalán mediante Belebele `cat_Latn` (900 ítems).
- Evaluación de QA con contexto social mediante CaBBQ (500 ítems).
- Evaluación de habilidades elementales mediante tareas MCQ de multi_lmentry (500 ítems; 2 opciones, 5 opciones y sí/no).
- Medición de perplejidad sobre respuestas de validación de InstruCAT (15.081 tokens).
- Comparación cuantitativa entre un checkpoint base y dos checkpoints conversacionales en catalán bajo un protocolo idéntico y semillas fijas.
- Reproducibilidad parcial: se publican los JSON crudos por modelo, lo que permite reanálisis con protocolos alternativos.
- Soporte de tool calling, function calling, agentes, visión, audio o modo de razonamiento explícito: no disponible en la información.
- Capacidades multilingües: no disponible (la evaluación se limita al catalán; no se documenta el resto de idiomas de los checkpoints).

## Casos de uso

- Selección de checkpoint para despliegue en catalán: los JSON publicados permiten comparar base, v1 y v2 con las mismas condiciones antes de decidir qué pesos servir en producción, teniendo en cuenta que la métrica más discriminante es la perplejidad de InstruCAT y no la precisión MCQ.
- Reproducción y contraste metodológico: al conservarse los JSON crudos, un equipo puede recalcular las métricas con un protocolo generativo (el modelo escribe la respuesta y se parsea) en lugar de loglikelihood, y comprobar cuánto cambian los valores absolutos.
- Seguimiento de deriva en fine-tuning continuado: la perplejidad de referencia sobre InstruCAT validation (971,2 base; 451,0 v1; 873,7 v2) sirve como línea base para detectar regresiones de dominio cuando se reentrena el modelo con nuevos datos en catalán.
- Auditoría de benchmarks en lenguas de bajos recursos: el repositorio documenta de forma explícita que a ~2,5 B tres benchmarks catalanes estándar no discriminan entre checkpoints, material útil para dimensionar evaluaciones y evitar conclusiones sobre ruido de ±2-3 puntos.
- Diseño de la siguiente fase de evaluación: el propio autor señala que la calidad conversacional, la coherencia multi-turno y la adherencia al system prompt requieren evaluación humana o generativa, por lo que estos resultados sirven como base para planificar esa ronda.
- Punto de partida para nuevos ajustes en catalán: los checkpoints v1 y v2 pueden reutilizarse como inicialización para fine-tuning posterior, usando estos números como referencia histórica del punto de partida.
- Documentación de decisión técnica: incluir la tabla comparativa y las advertencias metodológicas en un informe interno de selección de modelo evita justificar una elección con deltas que están dentro del error de muestreo.

## Benchmarks y rendimiento

| Benchmark | base (`openbmb/MiniCPM5-2B`) | v1 (`MiniCPM5-2B-catalan-chat`) | v2 (`MiniCPM5-2B-catalan-chat-v2`) | Azar |
|---|---|---|---|---|
| Belebele ca — comprensión lectora, 900 ítems | 27,6 % | 28,3 % | 27,4 % | 25 % |
| CaBBQ — QA con contexto social, 500 ítems | 30,8 % | 34,0 % | 33,4 % | 33 % |
| multi_lmentry ca MCQ — habilidades elementales, 500 ítems | 47,8 % | 49,8 % | 48,2 % | Mixto (2/5 opciones) |
| PPL — respuestas de validación de InstruCAT (15.081 tokens) | 971,2 | 451,0 | 873,7 | — |

Lectura de los datos, según la propia model card: la precisión MCQ está en el suelo del azar en los tres modelos, los deltas de v1/v2 (+0,8 a +3,2 puntos) caen dentro del ruido de muestreo (n=500/900, ±~2-3 puntos) y la PPL solo es orientativa, porque el corpus de InstruCAT corresponde al dominio de la primera ronda de entrenamiento y está dominado por respuestas cortas de tipo tarea.

## Requisitos de hardware

- Reproducción de la evaluación: una instancia `a10g-small` por modelo, con un tiempo aproximado de 7 minutos por trabajo, según la información publicada.
- Inferencia del checkpoint de ~2,5 B (estimación derivada del recuento de parámetros; no publicada por el autor): en fp16 los pesos ocuparían del orden de 5 GB, en int8 unos 2,5 GB y en int4 alrededor de 1,3 GB, a lo que habría que sumar la caché KV y el overhead del runtime.
- GPU recomendadas: no disponible en la información; por el tamaño, cualquier GPU con 8 GB o más de VRAM debería poder ejecutar el modelo en fp16, y las GPU de 16-24 GB (RTX 4080/4090, A10G, L4) ofrecerían margen para lotes mayores y contextos más largos.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de 8-12 GB o superiores (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090) en cuantizaciones de 8 o 4 bits, si bien no se documenta ninguna prueba de despliegue.
- Opciones de despliegue: no disponible; la información no menciona vLLM, llama.cpp, Ollama, TGI ni ningún otro runtime.
- Latencia y throughput: no disponible; solo se documenta el tiempo de evaluación (~7 minutos por modelo en `a10g-small`), que no es una medida de inferencia interactiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Belebele ca | CaBBQ | PPL InstruCAT | Licencia |
|---|---|---|---|---|---|---|
| MiniCPM5-2B base | ≈2,5 B (el identificador indica 2B) | No disponible | 27,6 % | 30,8 % | 971,2 | No disponible |
| MiniCPM5-2B-catalan-chat (v1) | ≈2,5 B | No disponible | 28,3 % | 34,0 % | 451,0 | No disponible |
| MiniCPM5-2B-catalan-chat-v2 (v2) | ≈2,5 B | No disponible | 27,4 % | 33,4 % | 873,7 | No disponible |

No se dispone de datos de otros modelos comparables de la misma categoría (modelos densos de ~2-3 B ajustados para catalán) en la información proporcionada.

## Limitaciones y advertencias

- Precisión MCQ en el suelo del azar: los tres checkpoints quedan en ~25 % en Belebele ca, ~33 % en CaBBQ y ~mixto en multi_lmentry, por lo que a ~2,5 B estos benchmarks no discriminan entre checkpoints.
- Ruido de muestreo: con n=500/900, el margen es de ±~2-3 puntos, superior o comparable a los deltas observados entre v1, v2 y el base.
- Protocolo no estándar: puntuar modelos de chat por loglikelihood de opciones bajo plantilla de chat puede deprimir la precisión; un protocolo generativo produciría probablemente números absolutos distintos.
- PPL con sesgo de dominio: las respuestas de validación de InstruCAT pertenecen al dominio de la primera ronda de entrenamiento, de modo que la ventaja de v1 refleja en parte familiaridad con el corpus y no necesariamente mejor calidad general.
- Corpus de PPL poco representativo: 15.081 tokens sobre 2.000 documentos, con una media de ~7,5 tokens por documento, lo que hace la métrica ruidosa.
- Cobertura incompleta de la evaluación: no se miden calidad conversacional, coherencia multi-turno ni adherencia al system prompt, que eran los objetivos de la segunda ronda.
- Idiomas: los resultados se limitan al catalán; no se documenta el comportamiento en castellano, inglés u otras lenguas.
- Licencia no disponible: no puede confirmarse la permisibilidad de uso comercial ni de redistribución, ni de los checkpoints ni de los resultados.
- Sesgos: los propios benchmarks empleados (CaBBQ) están diseñados para medir sesgos sociales, pero la información no incluye ningún análisis de sesgo de los modelos evaluados.
- Riesgo de alucinación: no evaluado en la información disponible.
- Contexto, cuantizaciones y formatos de pesos: sin datos, lo que impide planificar un despliegue en producción a partir de este repositorio.

## Enlaces

- Repositorio de resultados: https://huggingface.co/luispoveda93/minicpm5-catalan-eval-results
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Checkpoint v1: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat
- Checkpoint v2: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat-v2
- Dataset Belebele: https://huggingface.co/datasets/facebook/belebele (`cat_Latn`)
- Dataset CaBBQ: https://huggingface.co/datasets/BSC-LT/CaBBQ
- Dataset multi_lmentry: https://huggingface.co/datasets/BSC-LT/multi_lmentry (solo tareas MCQ: 2 opciones, 5 opciones, sí/no)
- Dataset InstruCAT: https://huggingface.co/datasets/projecte-aina/InstruCAT
