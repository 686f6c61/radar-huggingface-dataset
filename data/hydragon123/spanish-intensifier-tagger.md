# Hydragon123/spanish-intensifier-tagger

## Resumen

Spanish intensifier tagger es un modelo de etiquetado de tokens (token classification) desarrollado por Hydragon123 y publicado en Hugging Face. Se trata de un fine-tuning del encoder multilingue `FacebookAI/xlm-roberta-large` (aproximadamente 560 millones de parametros) especializado en una tarea muy concreta: identificar y analizar la intensificacion de adjetivos y adverbios en transcripciones limpias de entrevistas sociolinguisticas en espanol, en concreto de variedad colombiana.

El modelo no se limita a etiquetar el intensificador (`Int`): para cada adjetivo o adverbio "host" genera una fila con el intensificador simple o doble, el tipo de adjetivo (`Adj_type`), el sustantivo (`Noun`), el verbo (`Verb`), la negacion (`Negation`) y los lemas correspondientes. La propuesta es relevante porque sustituye una cadena de taggers, reglas y analisis sintactico por un unico modelo neuronal que produce directamente la estructura de anotacion, siguiendo los marcos teoricos de Stratton (2020) y Stratton & Sundquist (2022).

Es un modelo de nicho, orientado a investigacion sociolinguistica mas que a produccion general. Su utilidad practica esta acotada a corpus de entrevistas en espanol colombiano ya limpiados con el pipeline del autor; fuera de ese dominio no hay garantias. No es un modelo de `transformers` convencional: los pesos se cargan con codigo propio del repositorio del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large) con cabezas de token classification y punteros |
| Parametros totales | no disponible (modelo base `xlm-roberta-large`, ~560 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de 512 subwords con 64 de contexto |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | espanol (variedad colombiana en entrenamiento) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (state dict PyTorch, carga via `torch.load`), mas `config.json`, `tokenizer*.json`, `labels.json`, `metrics.json` |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-large` y anade cabezas de clasificacion y punteros (`--ptr dot|biaffine`) sobre las representaciones del encoder. El texto se procesa en ventanas de 512 subwords con 64 subwords de contexto solapado. La configuracion publicada es de 8 epocas, batch 8, learning rate 2e-5 para el encoder y 5e-4 para las cabezas, warmup 0.1, semilla 13 y seleccion del mejor epoch por puntuacion en dev. El entrenamiento completo tarda unos 70 minutos en una GPU T4 de 16 GB.

El corpus de entrenamiento no se publica: son transcripciones de entrevistas sociolinguisticas en espanol colombiano, primero etiquetadas con un pipeline de reglas y despues corregidas manualmente. Los splits se hacen por fichero de hablante para evitar fuga de informacion. El modelo no predice `Int_type` (maximizer, booster, approximator, compromiser, emphasizer); ese campo se resuelve a posteriori mediante un mapeo `pipeline/int_type.json` que se puede sustituir sin reentrenar. El repositorio incluye scripts de limpieza (`clean_transcripts.py`), construccion de dataset (`dataset.py`), entrenamiento (`train/run.sh`, `train/train.py`) y prediccion (`pipeline/predict.py`), ademas de runners para Colab y Kaggle.

## Capacidades

- Etiquetado de tokens para identificar palabras host (adjetivos y adverbios) intensificadas en transcripciones de entrevistas en espanol.
- Prediccion por palabra host de: intensificador (`Int`), intensificador doble (`Double`), tipo de adjetivo (`Adj_type`), sustantivo (`Noun`), verbo (`Verb`), negacion (`Negation`) y lemas (`Lex_Adj`, `Inf_Verb`).
- Extraccion de estructura de anotacion sin tagger POS, reglas ni parser en tiempo de inferencia.
- Salida tabular (una fila por adjetivo o adverbio host) lista para analisis estadistico.
- No soporta tool calling ni function calling.
- No esta disenado para agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al espanol (y dentro de el, a la variedad y genero de entrenamiento).
- No tiene modo thinking, vision ni audio.

## Casos de uso

- Investigacion sociolinguistica sobre intensificacion: el modelo produce directamente la tabla de intensificadores, tipos de adjetivo y contexto lexico necesaria para estudiar variacion en corpus de entrevistas, sustituyendo el etiquetado manual de miles de ocurrencias.
- Analisis de corpus oral colombiano: sobre transcripciones ya limpiadas con `clean_transcripts.py`, se puede procesar un lote de entrevistas con `pipeline/predict.py` y obtener resultados consistentes con la convencion de Stratton (2020).
- Replicacion de estudios: al seguir una convencion de anotacion publicada y liberar los scripts de construccion de dataset, permite reproducir experimentos y comparar resultados entre rondas de anotacion con dev y test fijos.
- Anotacion asistida (pre-etiquetado): el modelo puede generar etiquetas iniciales de alta precision (F1 de 0.965 en palabra host y 0.977 en host intensificado) que despues un linguista revisa, reduciendo el coste del etiquetado manual.
- Analisis de negacion y doble intensificacion: las columnas `Negation` y `Double` permiten estudiar patrones como negacion de intensificadores o acumulacion de marcas, con precision reportada de 0.992 en negacion.
- Adaptacion a otras variedades o generos: el pipeline de entrenamiento acepta cualquier encoder de Hugging Face con tokenizer rapido, de modo que un equipo puede reentrenar el modelo con su propio corpus manteniendo la misma estructura de salida.

## Benchmarks y rendimiento

Resultados en el split de test reservado, segun `metrics.json` del autor:

| Objetivo | Precision | Recall | F1 |
|---|---|---|---|
| Palabra host | 0.961 | 0.970 | 0.965 |
| Host intensificado | 0.965 | 0.990 | 0.977 |

Precision por columna (exactitud de fila):

| Columna | Exactitud |
|---|---|
| `Int` | 0.999 |
| `Adv` | 0.997 |
| `Adj` | 0.997 |
| `Lex_Adj` | 0.996 |
| `Noun` | 0.980 |
| `Negation` | 0.992 |
| `Adj_type` | 0.961 |
| `Verb` | 0.933 |
| `Inf_Verb` | 0.928 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base `xlm-roberta-large` ocupa aproximadamente 2.3 GB en fp32 (tamano del repo); en fp16 ronda 1.1-1.2 GB. No hay datos de cuantizacion publicados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp32; el entrenamiento de referencia se hizo en una T4 de 16 GB.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o mas. El autor indica reducir `--batch` en GPUs de menos de 16 GB para entrenar.
- Opciones de despliegue: no es compatible con `transformers` de forma nativa; se carga con `pipeline/model.py` del repositorio del proyecto via `torch.load`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento de referencia tarda unos 70 minutos en una T4; el autor menciona un smoke test en CPU de pocos minutos con un modelo diminuto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spanish intensifier tagger | ~560 M (base) | 512 subwords + 64 contexto | Etiquetado de intensificadores en espanol | MIT | Hugging Face (pesos `model.pt`) |
| `FacebookAI/xlm-roberta-large` | ~560 M | 512 tokens | Encoder multilingue generico | MIT | Hugging Face (`transformers`) |
| `PlanTL-GOB-ES/roberta-large-bne` | ~355 M | 512 tokens | Encoder en espanol (modelo base, sin fine-tuning de esta tarea) | Apache 2.0 | Hugging Face (`transformers`) |

No se conocen otros modelos publicos especificos de etiquetado de intensificadores en espanol en la informacion disponible. La comparacion con encoders genericos es solo estructural: ninguno de ellos realiza esta tarea sin un fine-tuning adicional.

## Limitaciones y advertencias

- Entrenado en una unica region dialectal (espanol colombiano) y un unico genero (entrevistas sociolinguisticas); otras variedades y el texto escrito no estan probados.
- La entrada debe limpiarse previamente con `pipeline/clean_transcripts.py`; texto en bruto puede degradar los resultados.
- El mapeo `Int_type` refleja el corpus de entrenamiento (por ejemplo, *bastante* y *demasiado* como boosters) y debe revisarse antes de reutilizarlo en otro contexto.
- Los pesos se cargan con `torch.load` sobre un `model.pt` basado en pickle: solo deben usarse ficheros de fuentes de confianza por riesgo de ejecucion de codigo arbitrario.
- El corpus de entrenamiento no se publica, lo que limita la reproducibilidad completa y la auditoria de sesgos.
- El modelo no predice `Int_type`; ese campo se resuelve con una tabla externa, lo que introduce una dependencia adicional en el pipeline.
- Riesgo de alucinacion en el sentido de etiquetas espurias en texto fuera de dominio; no hay evaluacion publicada de robustez fuera del corpus de entrevistas.
- Licencia MIT: permite uso comercial, pero el modelo esta pensado para investigacion linguistica y no se ha evaluado en produccion.
- No hay soporte documentado para cuantizacion ni para frameworks de inferencia estandar, lo que complica su despliegue fuera del pipeline del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hydragon123/spanish-intensifier-tagger
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Repositorio del proyecto (codigo, `docs/finetune.md`, `docs/annotation.md`, `docs/output.md`): no disponible como URL en la informacion proporcionada
- Paper de referencia Stratton (2020): no disponible como URL en la informacion proporcionada
- Paper de referencia Stratton & Sundquist (2022): no disponible como URL en la informacion proporcionada
