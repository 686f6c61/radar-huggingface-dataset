# hari12-hp/enzyme-hier-resnet-drfp-rxnfp

## Resumen

`hari12-hp/enzyme-hier-resnet-drfp-rxnfp` es un artefacto publicado en Hugging Face por el usuario `hari12-hp` orientado a una tarea muy concreta de quimioinformática: la recuperación (retrieval) de enzimas a partir de la reacción química representada como SMILES de reacción, devolviendo una única etiqueta oficial EC (Enzyme Commission) de nivel L4. El modelo se presenta como parte de una participación en un reto denominado "Leak CURBER" y no como un modelo generativo de propósito general.

El checkpoint principal es un `hier_resnet` (`deep__hier_resnet__s42.best.pt`), con un checkpoint de respaldo basado en un MLP sobre descriptores DRFP (`drfp__mlp__s42.best.pt`). El pipeline de inferencia combina DRFP sobre CPU con un RXNFP preentrenado empaquetado, y contempla un modo de degradación a solo DRFP en caso de timeout. No se trata, por tanto, de un transformer de lenguaje: es un clasificador/recuperador especializado en química computacional.

La información pública es muy escasa: el repositorio ocupa 0.0 GB, no declara licencia, idiomas ni pipeline, y el propio autor advierte que solo se han medido puntuaciones de desarrollo y que la precisión oficial en el leaderboard y el tiempo de CPU están pendientes de verificar. Cualquier evaluación de producción debe tratarse como provisional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet jerárquica (`hier_resnet`) sobre descriptores de reacción; respaldo MLP sobre DRFP |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada = SMILES de reacción) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (tarea de química, no NLP) |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch `.pt` (`deep__hier_resnet__s42.best.pt`, `drfp__mlp__s42.best.pt`) |

## Arquitectura y entrenamiento

La arquitectura declarada es una ResNet jerárquica (`hier_resnet`) que opera sobre representaciones de reacción química. El pipeline de inferencia emplea DRFP (Descriptive Representation of FingerPrints for reactions) calculado en CPU junto con un RXNFP preentrenado empaquetado en el artefacto. La salida es una única etiqueta EC de nivel L4, lo que sugiere una clasificación jerárquica sobre la taxonomía EC (L1–L4), coherente con el nombre `hier_resnet` y con la métrica de "fractional-credit L1–L4 top-1 accuracy" mencionada en el repositorio hermano del mismo autor.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo ajuste fino con RLHF/DPO (poco probable dado el dominio). El autor indica que existe un checkpoint de respaldo (MLP sobre DRFP) y un mecanismo de fallback a DRFP-only ante timeout, lo que apunta a un diseño pragmático orientado a robustez y a tiempos de CPU acotados más que a una innovación arquitectónica publicada. No hay paper ni blog asociado en la información disponible.

## Capacidades

- Clasificación/recuperación de enzimas: dada una reacción en SMILES de reacción, devuelve una etiqueta EC L4 oficial.
- Representación de reacciones mediante DRFP (CPU) y RXNFP preentrenado (empaquetado).
- Modo de degradación controlada: fallback a DRFP-only si se detecta timeout.
- Checkpoint alternativo (`drfp__mlp__s42.best.pt`) para escenarios de menor coste.
- Ejecución por lotes vía CLI: `python /app/predict.py --input data.parquet --output predictions.jsonl`.
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking.
- No es multilingüe en sentido NLP; su "lenguaje" es la notación química (SMILES de reacción).

## Casos de uso

- Anotación automática de reacciones en bases de datos internas: procesar un `data.parquet` de reacciones y generar `predictions.jsonl` con la etiqueta EC L4 para enriquecer catálogos de biotransformaciones.
- Priorización en descubrimiento de enzimas: dado un conjunto de reacciones candidatas, recuperar la clase enzimática más probable para orientar la búsqueda experimental.
- Enrutado en pipelines de retrosíntesis: usar la etiqueta EC predicha como señal para seleccionar motores de búsqueda de rutas o bases de enzimas específicas.
- Cribado de anotaciones existentes: comparar la etiqueta EC predicha con la anotada manualmente para detectar discrepancias y priorizar revisión humana.
- Prototipado en entornos con CPU únicamente: el uso de DRFP en CPU y el fallback por timeout permiten desplegar el modelo sin GPU, adecuado para validaciones rápidas.
- Benchmarking interno de modelos de retrieval enzimático: servir como línea base frente a alternativas como el `enzyme-tfidf-logreg` del mismo autor.
- Integración en cuadernos de quimioinformática: invocar el CLI sobre lotes pequeños para análisis exploratorios de reacciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificables en la información disponible. El autor indica explícitamente que solo se midieron puntuaciones de desarrollo y que la precisión oficial del leaderboard y el tiempo de CPU están pendientes de verificación. La métrica empleada en el ecosistema del autor es la "fractional-credit L1–L4 top-1 accuracy", pero no se proporcionan valores numéricos.

## Requisitos de hardware

- VRAM estimada: no disponible; el pipeline declarado usa CPU para DRFP, por lo que la inferencia puede ejecutarse sin GPU.
- GPU recomendadas: no disponible; no se documenta requisito de GPU.
- ¿Cabe en GPU consumer? No hay datos; el diseño parece orientado a CPU.
- Opciones de despliegue: script CLI `predict.py` sobre contenedor (`/app/predict.py`); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; existe un mecanismo de timeout con fallback a DRFP-only, lo que sugiere que los tiempos pueden ser variables según la carga.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hari12-hp/enzyme-hier-resnet-drfp-rxnfp` | ResNet jerárquica + DRFP/RXNFP | SMILES de reacción | Etiqueta EC L4 | no disponible | Hugging Face |
| `hari12-hp/enzyme-tfidf-logreg` | TF-IDF + regresión logística | Reacción (texto) | Etiqueta EC (L1–L4) | no disponible | Hugging Face |
| Alternativas de retrieval enzimático de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación disponible se limita al repositorio hermano del mismo autor (`enzyme-tfidf-logreg`), que emplea TF-IDF con regresión logística y evalúa con la misma métrica de crédito fraccional L1–L4. No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- Información pública mínima: sin licencia declarada, sin idiomas, sin pipeline y con repositorio de 0.0 GB, lo que impide verificar el contenido real de los pesos.
- Solo se han medido puntuaciones de desarrollo; la precisión oficial en leaderboard y el tiempo de CPU están sin verificar según el propio autor.
- Riesgo de sobreajuste al conjunto del reto ("Leak CURBER") y de que las métricas no generalicen a reacciones fuera de distribución.
- Salida restringida a una única etiqueta EC L4; no proporciona probabilidades calibradas ni alternativas jerárquicas documentadas.
- Dependencia de descriptores DRFP y RXNFP empaquetados; cambios en las versiones de estas librerías pueden alterar resultados.
- El fallback a DRFP-only ante timeout introduce variabilidad en las predicciones según la carga del sistema.
- Sin datos sobre sesgos químicos (infrarrepresentación de ciertas clases EC) ni sobre alucinación en sentido estricto, aunque errores de clasificación son esperables.
- Restricciones de licencia para uso comercial: no disponible; debe contactarse con el autor antes de cualquier despliegue productivo.
- No apto para uso como modelo de lenguaje ni para tareas de NLP.

## Enlaces

- Hugging Face: https://huggingface.co/hari12-hp/enzyme-hier-resnet-drfp-rxnfp
- Repositorio hermano del autor: https://huggingface.co/hari12-hp/enzyme-tfidf-logreg
- Paper, blog, demo o repositorio adicional: no disponible
