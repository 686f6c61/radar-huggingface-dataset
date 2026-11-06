# FaiasPromit/HaploLM

## Resumen

HaploLM es un modelo de lenguaje de ADN desarrollado por Faias Satter y Aminul Islam, presentado en el artículo "Human Maternal Family Tree from DNA Language Models". Se trata de un transformer causal de 20,6 millones de parámetros entrenado exclusivamente para predecir ADN mitocondrial humano base a base, sin haber visto nunca una etiqueta de haplogrupo. A pesar de esta restricción, el modelo aprende de forma emergente el árbol genealógico materno humano (Mitotree), lo que lo convierte en una herramienta de investigación sobre qué estructuras biológicas capturan los modelos de lenguaje de secuencias.

El repositorio incluye dos variantes: HaploLM (SC30), que procesa la secuencia mitocondrial completa base a base con 20,6M de parámetros, y HaploLM-VL (VC), que trabaja únicamente con las variantes de cada persona respecto a la secuencia de referencia rCRS (unas 37 por individuo) con 11,2M de parámetros. Ambos se distribuyen como checkpoints de PyTorch (`checkpoint.pt`) que contienen los pesos, la configuración de entrenamiento y el paso de entrenamiento.

La relevancia del modelo reside en su enfoque de evaluación: demuestra que un modelo generativo entrenado solo con modelado de lenguaje aprende relaciones filogenéticas que los modelos de ADN publicados anteriormente (Evo 2, NTv3, mtDNA-FM) no capturan, ya que estos últimos puntúan cerca del azar en las mismas pruebas. Es un modelo de investigación, no un clasificador de haplogrupos ni una herramienta validada para uso médico o forense.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (modelo de lenguaje de secuencias de ADN) |
| Parametros totales | 20,6M (HaploLM / SC30); 11,2M (HaploLM-VL / VC) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 16.768 bases (longitud máxima de la secuencia mitocondrial en rCRS) |
| Tipos de cuantizacion | No disponible (checkpoints en precisión original de PyTorch) |
| Idiomas soportados | No aplica (modelo de secuencias de ADN, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`checkpoint.pt` con claves `model`, `args` y `step`; en HaploLM-VL también `vocab`) |

## Arquitectura y entrenamiento

HaploLM (SC30) es un transformer causal que procesa la secuencia mitocondrial completa base a base, con cada base predicha a partir de las bases anteriores. Se entrenó durante 30 épocas sobre 49.310 secuencias. HaploLM-VL (VC) comparte el enfoque causal pero opera sobre listas de variantes (diferencias respecto a la referencia rCRS, aproximadamente 37 por persona), entrenado durante 20.000 pasos de 128 personas cada uno (unas 52 épocas sobre 49.259 listas de variantes). El vocabulario de HaploLM-VL mapea cada variante distinta vista en entrenamiento a su token.

Los datos de entrenamiento son 49.310 genomas mitocondriales humanos de GenBank, restringidos a la lista de secuencias de longitud completa de MITOMAP. Las secuencias idénticas se mantienen siempre en el mismo conjunto, y seis ramas (L0a1, L3f, M9a, D4b, H13 y U2e), junto con todo lo que cuelga de ellas, se excluyen del entrenamiento como control negativo. Las etiquetas de haplogrupo, obtenidas con HaploGrep 3 y Mitotree 2026.05.06, se usan únicamente para evaluación, nunca durante el entrenamiento. El modelo se entrena solo con el objetivo de modelado de lenguaje causal, sin RLHF ni DPO.

## Capacidades

- Predicción de la siguiente base en secuencias de ADN mitocondrial humano (modelado de lenguaje causal).
- Puntuación de variantes: calcula la diferencia de log-probabilidad entre una secuencia con una variante y la misma secuencia con la base de referencia rCRS en esa posición.
- Aprendizaje emergente de relaciones filogenéticas: distingue marcadores de rama de variantes privadas y asigna mayor probabilidad a marcadores en portadores que en familiares cercanos que no los portan.
- Procesamiento de secuencias completas de ADN mitocondrial de hasta 16.768 bases (HaploLM) o de listas de variantes (HaploLM-VL).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido de lenguaje natural.
- No es un clasificador de haplogrupos: no emite etiquetas, solo probabilidades sobre secuencias.

## Casos de uso

- Estudio de representaciones filogenéticas en modelos de lenguaje de ADN: investigadores pueden evaluar qué relaciones del árbol materno humano captura un transformer causal entrenado solo con modelado de lenguaje, usando las pruebas del artículo (marker test, frequency-matched, carrier vs. relative, held-out branches).
- Puntuación de variantes mitocondriales en pipelines de investigación genómica: dado un genoma mitocondrial alineado al rCRS, el modelo calcula la log-probabilidad de cada variante respecto a la referencia, útil para priorizar variantes candidatas en estudios poblacionales.
- Validación de modelos de ADN: sirve como referencia para comparar el rendimiento de otros modelos de lenguaje de ADN (Evo 2, NTv3, mtDNA-FM) en tareas de estructura filogenética, ya que estos puntúan cerca del azar en las pruebas del artículo.
- Análisis de linajes en poblaciones subrepresentadas: permite estudiar si el modelo generaliza a ramas con pocos ejemplos de entrenamiento, aunque el propio autor advierte que los datos públicos sobrerrepresentan algunas poblaciones.
- Docencia y divulgación en bioinformática: el modelo, pequeño y con licencia MIT, es adecuado para demostrar cómo un transformer causal aprende estructura biológica sin supervisión de etiquetas.
- Reproducción de experimentos: los checkpoints y el código del repositorio de GitHub permiten reproducir las pruebas del artículo con `score_causal_sequence_model.py` y `train_causal_variant_list_model.py`, incluyendo el control negativo de ramas excluidas.

## Benchmarks y rendimiento

Resultados publicados en la model card (AUROC o proporción de pares correctos; 0,5 es azar):

| Modelo | Marker test | Frequency-matched | Carrier vs. relative | Held-out branches |
|---|---|---|---|---|
| Counting (sin modelo) | 0,890 | 0,533 | 0,500 | 0,475 |
| HaploLM | 0,947 | 0,872 | 0,808 | 0,467 |
| HaploLM-VL | 0,955 | 0,939 | 0,965 | 0,502 |

El artículo indica que Evo 2, NTv3 y mtDNA-FM puntúan cerca del azar en las cuatro pruebas. La prueba de ramas excluidas (held-out branches) es un control negativo: un modelo que dependiera de relaciones memorizadas durante el entrenamiento debería puntuar cerca de 0,5, y todos los modelos lo hacen.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 20,6M de parámetros (HaploLM) el checkpoint ocupa aproximadamente 0,1 GB en el repositorio, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con soporte CUDA; una RTX 4090 o incluso una GPU integrada es suficiente. El autor indica que una GPU es mucho más rápida que CPU, pero no especifica modelos concretos.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en hardware de gama baja.
- Opciones de despliegue: el código de inferencia está en el repositorio de GitHub (`train_causal_sequence_model.py`, `train_masked_sequence_model.py`); no hay integración con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje natural.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Rendimiento en pruebas del artículo | Licencia |
|---|---|---|---|---|---|
| HaploLM | 20,6M | 16.768 bases | Transformer causal sobre secuencia completa | Carrier vs. relative: 0,808 | MIT |
| HaploLM-VL | 11,2M | Listas de variantes (~37 por persona) | Transformer causal sobre variantes | Carrier vs. relative: 0,965 | MIT |
| Evo 2 | No disponible | No disponible | Modelo de ADN | Cerca del azar en las cuatro pruebas | No disponible |
| NTv3 | No disponible | No disponible | Modelo de ADN | Cerca del azar en las cuatro pruebas | No disponible |
| mtDNA-FM | No disponible | No disponible | Modelo de ADN mitocondrial | Cerca del azar en las cuatro pruebas | No disponible |

No se dispone de datos de parámetros, contexto ni licencia de Evo 2, NTv3 y mtDNA-FM en la información proporcionada; solo se conoce su rendimiento relativo en las pruebas del artículo.

## Limitaciones y advertencias

- Entrenado exclusivamente con ADN mitocondrial humano; no generaliza a otros organismos ni a ADN nuclear.
- La clave de evaluación depende de HaploGrep y Mitotree; los tests mitigan errores excluyendo secuencias mal asignadas, hotspots y la región de control, pero la dependencia persiste.
- Los datos mitocondriales públicos sobrerrepresentan algunas poblaciones, por lo que los linajes comunes en poblaciones infrarrepresentadas tienen menos ejemplos de entrenamiento.
- Es un modelo de investigación para estudiar qué aprenden los modelos de lenguaje de ADN; no es un clasificador de haplogrupos y no está validado para uso médico ni forense.
- Riesgo de alucinación en el sentido de asignar alta probabilidad a secuencias biológicamente implausibles fuera de la distribución de entrenamiento; no se han publicado análisis específicos de sesgo.
- Licencia MIT permite uso comercial, pero el autor no valida el modelo para aplicaciones clínicas o forenses.
- La secuencia de entrada debe estar en mayúsculas, empezar en la posición 1 del rCRS y tener como máximo 16.768 bases.

## Enlaces

- Hugging Face: https://huggingface.co/FaiasPromit/HaploLM
- Repositorio GitHub (código, preparación de datos y tests): https://github.com/FaiasPromit/HaploLM
- Artículo: "Human Maternal Family Tree from DNA Language Models" de Faias Satter y Aminul Islam (no se proporciona URL directa en la información disponible)
- MITOMAP (lista de secuencias de longitud completa): no se proporciona URL en la información disponible
- HaploGrep 3: no se proporciona URL en la información disponible
- Mitotree 2026.05.06: no se proporciona URL en la información disponible
