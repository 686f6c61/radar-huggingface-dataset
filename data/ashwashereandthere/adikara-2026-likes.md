# AshWasHereandThere/adikara-2026-likes

## Resumen

adikara-2026-likes es un artefacto de competicion publicado en Hugging Face por el usuario AshWasHereandThere, asociado a la asignatura de Data Mining (ADIKARA 2026) y orientado a la prediccion de likes en tuits en indonesio. No se trata de un modelo de lenguaje generativo, sino de un ensemble de inferencia que combina un backbone transformer (IndoBERTweet base fine-tuneado por fold) con varios modelos LightGBM entrenados sobre caracteristicas derivadas (bert_z, bert_ly) para producir una prediccion de recuento de likes con metrica RMSLE.

El repositorio contiene los pesos de cinco folds del backbone en formato PyTorch, las caracteristicas out-of-fold, los modelos LightGBM serializados y un fichero run_info.json con la configuracion y las puntuaciones de validacion cruzada. Su funcion es permitir reproducir el submission.csv del notebook AdikaraDM_Final.ipynb en modo inferencia, sin reentrenamiento. La relevancia es, por tanto, acotada: sirve como referencia reproducible de un pipeline concreto y no como modelo de proposito general.

El modelo base es indolem/indobertweet-base-uncased, un BERT base adaptado a tuits en indonesio. La licencia declarada es Apache 2.0, el idioma de trabajo es exclusivamente indonesio y el tamano del repositorio es de 2,2 GB, coherente con cinco copias de un backbone tipo BERT base en precision completa mas los artefactos auxiliares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble: backbone transformer BERT base (IndoBERTweet) fine-tuneado por fold + modelos LightGBM (clasificacion de cero likes, magnitud de likes y regresion directa) |
| Parametros totales | no disponible (el backbone base es indolem/indobertweet-base-uncased; el autor no publica el recuento agregado del ensemble) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como valor unico; el checkpoint almacena el campo max_len por fold en el state dict |
| Tipos de cuantizacion | no disponible (pesos en precision completa, formato PyTorch .pt; los modelos LightGBM se distribuyen como .txt) |
| Idiomas soportados | indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (.pt) para el backbone; texto plano (.txt) para los modelos LightGBM; CSV y JSON para caracteristicas y metadatos |

## Arquitectura y entrenamiento

La arquitectura es un pipeline en dos etapas. En la primera, un backbone indolem/indobertweet-base-uncased se fine-tunea por separado en cinco folds para producir representaciones del texto del tuit; el state dict guardado bajo la clave LikesNet incluye el backbone, los parametros de normalizacion de la etiqueta (mu_ly, sd_ly), la longitud maxima de secuencia (max_len) y la configuracion de entrenamiento (setting). En la segunda etapa, las caracteristicas derivadas del backbone (bert_z y bert_ly, calculadas out-of-fold para train y como media de los cinco folds para test) alimentan varios conjuntos de modelos LightGBM: clasificadores de probabilidad de cero likes (clf_seed*, clf2_seed*), modelos de magnitud de likes (reg_seed*) y un modelo de regresion directa (dir_seed*), cada uno replicado por seed.

El entrenamiento se realizo el 2026-11-15 y utilizo unicamente train.csv y test.csv proporcionados por la organizacion. El repositorio no contiene texto de tuits, etiquetas ni predicciones del conjunto de test, solo los artefactos necesarios para regenerar submission.csv. La metrica objetivo es RMSLE, con un valor de validacion cruzada de 1,3342 redondeado a entero. No se documentan en la informacion disponible detalles sobre volumen de tokens, composicion del corpus, tecnicas de RLHF/DPO ni innovaciones de decodificacion; el uso de un esquema de stacking con LightGBM sobre caracteristicas de un transformer es el elemento metodologico destacable.

## Capacidades

- Prediccion de recuento de likes para tuits en indonesio, con salida calibrada para optimizar RMSLE.
- Clasificacion auxiliar de la probabilidad de que un tuit tenga cero likes.
- Regresion directa de la magnitud de likes y regresion sobre caracteristicas normalizadas del backbone.
- Extraccion de representaciones textuales mediante el backbone IndoBERTweet fine-tuneado (bert_z, bert_ly).
- Inferencia reproduble en modo batch desde el notebook AdikaraDM_Final.ipynb con RUN_MODE = "inference".
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni modo thinking.
- Capacidad multilingue limitada al indonesio; no se declaran otros idiomas.

## Casos de uso

- Reproducibilidad de resultados de competicion: cargar los cinco checkpoints bert_fold*.pt y los modelos LightGBM para regenerar submission.csv y verificar el RMSLE de 1,3342 sin reentrenar.
- Baseline para tareas de regresion sobre texto en indonesio: servir como punto de partida documentado para experimentos de prediccion de engagement con metrica RMSLE.
- Analisis de engagement en redes sociales: estimar el numero esperado de likes de un tuit en indonesio para priorizar contenido en herramientas de planificacion editorial.
- Docencia y evaluacion academica: el repositorio incluye run_info.json, oof.csv y bert_oof.csv, lo que permite auditar el pipeline de stacking y las decisiones de calibracion en un contexto de asignatura de Data Mining.
- Investigacion sobre caracteristicas de modelos de lenguaje para regresion: las columnas bert_z y bert_ly permiten estudiar cuanto aporta el backbone frente a los modelos LightGBM en la prediccion final.
- Moderacion y priorizacion de contenido: el clasificador de cero likes (clf_seed*, clf2_seed*) puede reutilizarse como senal auxiliar para identificar tuits con baja probabilidad de interaccion.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| RMSLE (validacion cruzada, redondeado a entero) | 1,3342 | Run de entrenamiento del 2026-11-15, con caracteristicas de modelo de lenguaje activadas |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos alternativos sobre el mismo conjunto de datos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el repositorio ocupa 2,2 GB e incluye cinco copias de un backbone BERT base en precision completa, por lo que en inferencia basta con cargar un fold a la vez (del orden de varios cientos de MB a algo mas de 1 GB en FP32, segun el backbone base).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para cargar un unico fold en FP32; no se documentan requisitos especificos por parte del autor.
- Cabe en GPU de consumo: si, en tarjetas tipo RTX 3060, RTX 4060 o superiores, cargando un fold por vez; los modelos LightGBM se ejecutan en CPU.
- Opciones de despliegue: inferencia mediante PyTorch y el notebook AdikaraDM_Final.ipynb; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| adikara-2026-likes | Ensemble BERT + LightGBM para regresion de likes | no disponible | no disponible (max_len por fold) | Apache 2.0 | Hugging Face, 0 descargas |
| indolem/indobertweet-base-uncased | Backbone BERT base para indonesio | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Hugging Face |
| Alternativas de regresion de engagement en indonesio | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables sobre la misma tarea, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje generativo: no responde a prompts ni genera texto; solo produce predicciones numericas de likes.
- Idioma restringido al indonesio; su uso con textos en otros idiomas no esta validado.
- El rendimiento esta ligado a la distribucion de train.csv y test.csv de ADIKARA 2026; no hay garantia de generalizacion fuera de ese corpus.
- El repositorio no incluye textos de tuits ni etiquetas, lo que limita la auditoria externa del pipeline y la evaluacion independiente.
- Riesgo de sesgo y de alucinacion no evaluado en la informacion disponible; al ser un modelo de regresion, el riesgo principal es la prediccion sesgada hacia la distribucion de entrenamiento.
- El RMSLE de 1,3342 corresponde a validacion cruzada interna y no a una evaluacion en leaderboard publico.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base indolem/indobertweet-base-uncased debe verificarse por separado antes de un despliegue en produccion.
- El artefacto tiene 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento documentado posterior al 2026-11-15.

## Enlaces

- Hugging Face: https://huggingface.co/AshWasHereandThere/adikara-2026-likes
- Modelo base: https://huggingface.co/indolem/indobertweet-base-uncased
- Notebook de referencia: AdikaraDM_Final.ipynb (mencionado en la model card; no se proporciona URL)
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada
