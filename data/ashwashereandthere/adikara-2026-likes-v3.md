# AshWasHereandThere/adikara-2026-likes-v3

## Resumen
El repositorio `AshWasHereandThere/adikara-2026-likes-v3` no es un modelo de lenguaje generativo, sino un paquete de checkpoints y artefactos intermedios para reproducir la inferencia de una solucion de mineria de datos orientada a predecir el numero de likes de tuits. Lo publica el usuario AshWasHereandThere en el contexto de "ADIKARA 2026" y del notebook `AdikaraDM_Final.ipynb`, con la metrica RMSLE como criterio de evaluacion. El paquete combina cinco pesos de un backbone BERT indonesio fine-tuneado (uno por fold) con una capa de modelos LightGBM que refinan la prediccion final.

La pieza central del stack es `indolem/indobertweet-base-uncased`, un transformer encoder BERT-base adaptado al indonesio coloquial de Twitter, sobre el que se anaden cabezas de regresion para generar caracteristicas (`bert_z`, `bert_ly`) que alimentan a los modelos LightGBM. El repositorio ocupa 2,2 GB e incluye pesos en formato PyTorch (`state_dict`), ficheros CSV de predicciones out-of-fold y modelos de arboles serializados en texto. La licencia declarada es Apache 2.0.

Su relevancia es acotada y muy especifica: sirve para reproducir exactamente el `submission.csv` de una competicion concreta sin reentrenar, no como modelo reutilizable para otras tareas. De hecho, el autor indica explicitamente que el repositorio no contiene los textos de los tuits, las etiquetas ni los valores de prediccion del conjunto de test, lo que limita su utilidad fuera del entorno del notebook original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stack de dos etapas: encoder transformer BERT-base (IndoBERTweet) fine-tuneado + modelos LightGBM sobre caracteristicas derivadas |
| Parametros totales | No disponible de forma agregada; el backbone es `indolem/indobertweet-base-uncased` (BERT-base, del orden de 110 millones de parametros segun la arquitectura BERT-base estandar) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el checkpoint guarda un campo `max_len`, pero su valor no se especifica en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (pesos en precision completa, `state_dict` PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | Indonesio (`id`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `state_dict` (`bert_fold0.pt` a `bert_fold4.pt`) y modelos LightGBM serializados en texto (`clf_seed*.txt`, `clf2_seed*.txt`, `reg_seed*.txt`, `dir_seed*.txt`) |

## Arquitectura y entrenamiento
La solucion es un ensemble en dos etapas. En la primera, se fine-tunea el backbone `indolem/indobertweet-base-uncased` en cinco folds; cada checkpoint (`bert_fold0.pt` a `bert_fold4.pt`) contiene el `state_dict` del modulo `LikesNet`, el identificador del backbone, los parametros de normalizacion de la etiqueta (`mu_ly`, `sd_ly`), la longitud maxima de secuencia (`max_len`) y la configuracion de entrenamiento. De estos modelos se extraen dos caracteristicas, `bert_z` y `bert_ly`, que se almacenan en `bert_oof.csv`: valores out-of-fold para el conjunto de entrenamiento y media de los cinco folds para el de test, evitando asi fuga de informacion.

En la segunda etapa, varios modelos LightGBM por seed (`clf_seed*` para probabilidad de cero likes, `clf2_seed*` para la magnitud de likes, `reg_seed*` para regresion directa y `dir_seed*` para una variante adicional) se combinan sobre esas caracteristicas. El pipeline incluye calibracion y parametros de configuracion registrados en `run_info.json`, junto con versiones de librerias, puntuaciones de validacion cruzada, huella de las caracteristicas de test y el MD5 del submission. Segun el autor, la RMSLE de validacion cruzada redondeada a entero es 1,3342. Los datos de entrenamiento se limitan a `train.csv` y `test.csv` facilitados por la organizacion; no se detalla el volumen de tokens ni si se aplico RLHF, DPO u otras tecnicas de alineacion, algo poco habitual en un modelo de regresion de este tipo.

## Capacidades
- Regresion de popularidad: estima el numero de likes de un tuit en indonesio a partir de su texto.
- Clasificacion auxiliar de "cero likes": el modelo `clf_seed*` predice la probabilidad de que un tuit no reciba ningun like.
- Prediccion de magnitud condicionada: `clf2_seed*` y `reg_seed*` cubren distintos regimenes de la distribucion de likes.
- Extraccion de representaciones: el backbone fine-tuneado puede emplearse para obtener caracteristicas vectoriales de texto indonesio informal.
- Reproducibilidad de inferencia: ejecutando el notebook con `RUN_MODE = "inference"` se regenera `submission.csv` sin reentrenamiento.
- No soporta generacion de texto, razonamiento, codigo, vision, tool calling ni modo thinking; es un modelo discriminativo de regresion.
- Capacidad multilingue limitada al indonesio; no se documenta soporte para otras lenguas.

## Casos de uso
- Reproduccion de resultados de competicion: cargar los cinco checkpoints y los modelos LightGBM para regenerar exactamente el `submission.csv` y verificar el MD5 registrado en `run_info.json`, util para auditoria de la solucion.
- Analisis deengagement en redes sociales: estimar la popularidad esperada de tuits en indonesio para priorizar contenido en un calendario editorial, usando la prediccion como senal relativa y no como valor absoluto.
- Investigacion academica en mineria de datos: servir como baseline reproducible con RMSLE documentada (1,3342 en CV) para comparar nuevas tecnicas de ensemble sobre el mismo dataset.
- Filtrado previo de contenido: usar la probabilidad de cero likes (`clf_seed*`) para descartar publicaciones con baja probabilidad de interaccion antes de pasarlas a un sistema de moderacion o curacion.
- Extraccion de embeddings para downstream: reutilizar el backbone fine-tuneado como extractor de caracteristicas de texto indonesio informal en tareas como clasificacion de sentimiento o deteccion de temas.
- Ensamblado con modelos tabulares: integrar las caracteristicas `bert_z` y `bert_ly` en pipelines de LightGBM ya existentes para modelos de prediccion de metricas sociales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es la RMSLE de validacion cruzada reportada por el autor en `run_info.json`: 1,3342 (redondeada a entero segun la model card).

| Metrica | Valor | Contexto |
|---|---|---|
| RMSLE (CV) | 1,3342 | Validacion cruzada del pipeline completo, reportada por el autor |
| MMLU / HumanEval / GSM8K | No disponible | No aplica a un modelo de regresion |

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita; cargar cinco checkpoints BERT-base en precision completa requiere del orden de 0,4 GB por checkpoint (unos 2 GB en total si se mantienen todos en memoria simultaneamente), ademas de la memoria de los modelos LightGBM, que es reducida.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente en la practica para el backbone BERT-base; una RTX 3060, RTX 4060 o superior basta. Para entrenamiento o para cargar los cinco folds a la vez, se recomienda 8 GB o mas.
- Cabe en GPU de consumo: si, incluidas GTX 1660, RTX 3050 y modelos superiores.
- Opciones de despliegue: el paquete esta pensado para ejecutarse desde el notebook `AdikaraDM_Final.ipynb` con PyTorch y LightGBM. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al tratarse de BERT-base con secuencias cortas, la inferencia por muestra es del orden de milisegundos en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares
No se dispone de informacion sobre modelos directamente comparables en la misma categoria (regresion de likes sobre tuits en indonesio con backbone IndoBERTweet). Como referencia arquitectonica, el backbone base se puede situar frente a otros encoders indonesios, aunque las comparaciones de rendimiento no estan disponibles.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| adikara-2026-likes-v3 | Ensemble BERT + LightGBM para regresion de likes | No agregado (backbone BERT-base) | No disponible (`max_len` interno) | Apache 2.0 | Hugging Face |
| indolem/indobertweet-base-uncased | Encoder BERT-base para indonesio de Twitter | ~110 M (BERT-base) | 128 tokens tipico en BERT-base | No disponible en la informacion | Hugging Face |
| Alternativas generativas de proposito general | LLM generativos | Diversos | Diversos | Diversas | Diversas |

## Limitaciones y advertencias
- Alcance muy restringido: es un artefacto de competicion, no un modelo de proposito general; no genera texto ni responde a instrucciones.
- Dependencia del notebook: la inferencia esta disenada para ejecutarse con `AdikaraDM_Final.ipynb` y `RUN_MODE = "inference"`; fuera de ese entorno la reproducibilidad no esta garantizada.
- Ausencia de datos: el repositorio no incluye textos de tuits, etiquetas ni predicciones de test, por lo que no se puede reentrenar ni validar de forma independiente con lo publicado.
- Sesgos: al entrenarse sobre tuits en indonesio de una competicion concreta, hereda los sesgos de dominio, jerga y distribucion temporal de ese corpus; no se documentan analisis de sesgo.
- Alucinacion: no aplica en el sentido generativo, pero la regresion puede producir predicciones poco calibradas fuera de la distribucion de entrenamiento.
- Idioma: solo indonesio; el rendimiento en otras lenguas o en registros formales no esta caracterizado.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento ni sobre la procedencia de los datos de entrenamiento.
- Caveat de produccion: con 0 descargas y 0 likes, no hay evidencia de uso externo ni de validacion por terceros; conviene tratar el checkpoint como material de investigacion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/AshWasHereandThere/adikara-2026-likes-v3
- Modelo base: https://huggingface.co/indolem/indobertweet-base-uncased
- LightGBM: https://github.com/microsoft/LightGBM
- Paper de IndoBERTweet (IndoLEM/IndoBERTweet): https://arxiv.org/abs/2104.08200
- Enlace de la busqueda web (no relacionado con el modelo, descartado): https://uk.5sos.com/pages/tour
