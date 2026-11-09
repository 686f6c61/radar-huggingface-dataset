# cbmusetti/reward-model-english_without_ties

## Resumen

`cbmusetti/reward-model-english_without_ties` es un modelo de recompensa (reward model) de tipo pairwise entrenado para evaluar chistes generados a partir de una noticia. Dado un texto de noticia y dos chistes candidatos, el modelo puntua cada uno de forma que el chiste preferido por humanos recibe una recompensa mayor. Está desarrollado por cbmusetti en el contexto de una tesis sobre generación de humor con aprendizaje por refuerzo, y el código y los registros de experimentos están publicados en el repositorio `carlos-musetti/tesis`.

El modelo parte de `FacebookAI/roberta-base` y se entrena como un clasificador de secuencias con una cabeza de recompensa basada en el modelo Bradley-Terry sobre preferencias estrictas: los pares con empate se descartan durante el entrenamiento. Es un modelo pequeño (repo de 0,5 GB, base de ~125 M de parámetros), especializado y de nicho, pensado como componente de un pipeline de RL para generación de humor en inglés, no como un modelo de propósito general.

Su relevancia es acotada pero clara para quien investigue reward models o generación creativa con RL: ofrece un checkpoint reproducible con hiperparámetros documentados (mejor trial de Optuna, validación 0,5776), particiones de datos explícitas y un modo de carga mediante el código de la tesis. No es un modelo para producción generalista ni para tareas fuera del dominio del humor en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base) con cabeza de clasificación/recompensa |
| Parametros totales | no disponible (base roberta-base, ~125 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint de sequence-classification de transformers más wrapper config) |

## Arquitectura y entrenamiento

El modelo es un `roberta-base` afinado como reward model pairwise. La formulación es Bradley-Terry sobre preferencias estrictas: se descartan los pares con empate y se entrena para que el chiste preferido obtenga una puntuación mayor. El mejor trial (trial 0) usó batch_size 128, dropout 0,1212, learning rate del encoder 1,996e-05, learning rate de la cabeza 0,0006255, 1 época, estrategia de congelación `last_2`, decaimiento de learning rate por capa 0,9416, max_length 256, scheduler `constant_with_warmup`, warmup_ratio 0,05248 y weight_decay 0,03143. La selección de hiperparámetros se hizo con Optuna.

Los datos son pares (noticia, chiste A, chiste B) con preferencia humana: 2791 pares de entrenamiento, 464 de validación y 1403 de test, con semilla de partición 42 y sin empates. El repo contiene dos carpetas: `best_trial/` (modelo de una sola semilla del mejor trial, objetivo de validación 0,5776) y `ensemble/` (configuración ganadora reentrenada sobre train + validación por semilla, con recompensas promediadas entre miembros), que es el modelo recomendado para uso. No se documentan innovaciones como decodificación especulativa ni atención lineal; la innovación es de dominio (reward model específico de humor) y de metodología (ensemble y registro de experimentos).

## Capacidades

- Puntuación de recompensa pairwise: asigna un score a un chiste dado el contexto de una noticia, de modo que el preferido por humanos obtiene mayor recompensa.
- Modelo Bradley-Terry sin empates: entrenado solo con preferencias estrictas, no calibrado para pares empatados.
- Evaluación de candidatos en generación de humor: útil para ranking y selección de chistes generados.
- Componente de RL: diseñado para integrarse en un bucle de aprendizaje por refuerzo para generación de humor.
- Idioma: únicamente inglés.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking.
- No es un modelo generativo: no produce texto, solo puntuaciones.
- Capacidad multilingüe: no disponible (solo inglés).

## Casos de uso

- Investigación en generación de humor con RL: usar el modelo como función de recompensa en un pipeline de RL para afinar un generador de chistes a partir de noticias, aprovechando que el checkpoint está entrenado exactamente para esa señal de preferencia.
- Ranking de candidatos en un generador de chistes: dado un generador que produce N chistes por noticia, puntuar cada uno con `model.score(news_text, joke_text)` y seleccionar el de mayor recompensa antes de publicar o mostrar.
- Evaluación automática de sistemas de humor: comparar la recompensa media de dos generadores distintos sobre el mismo conjunto de noticias para estimar cuál produce chistes más preferidos por humanos.
- Filtrado de datos de preferencia: usar el modelo para priorizar pares de chistes en la construcción de nuevos datasets de preferencias, reduciendo el coste de anotación humana.
- Baseline en experimentos de reward modeling: servir como referencia reproducible (hiperparámetros, particiones y semilla documentados) para comparar nuevas arquitecturas o funciones de pérdida en el mismo dominio.
- Docencia y tesis: ejemplo completo y reproducible de un reward model Bradley-Terry con Optuna, ensemble y carga mediante código propio, útil para cursos de RLHF o NLP aplicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento documentado es el objetivo de validación del mejor trial: 0,5776 (métrica de validación del reward model, sin especificar su definición exacta en la información disponible).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un `roberta-base` en fp32 ocupa aproximadamente 0,5 GB de pesos, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son más que suficientes. También es viable en CPU para volúmenes moderados.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer modernas.
- Opciones de despliegue: carga mediante el código de la tesis (`load_ensemble_from_hub` / `load_best_trial_from_hub`); al ser un checkpoint de `transformers`, también puede cargarse con `AutoModelForSequenceClassification` si se replica el wrapper. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cbmusetti/reward-model-english_without_ties` | ~125 M (roberta-base) | 256 tokens | Reward model pairwise de humor (inglés) | MIT | Hugging Face |
| `roberta-base` | ~125 M | 512 tokens | Encoder generalista (MLM) | MIT | Hugging Face |
| Reward models generalistas (p. ej. basados en modelos de 7B) | 7B o más | 4K-32K tokens | Preferencia general | varía | Hugging Face |

La comparación con reward models generalistas es solo orientativa: este modelo está especializado en humor en inglés y no se han publicado benchmarks que permitan una comparación cuantitativa. No se dispone de datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Dominio muy restringido: solo puntúa chistes en inglés a partir de una noticia; no es un reward model generalista.
- No genera texto: no puede usarse como modelo de lenguaje.
- Entrenado sin empates: puede comportarse de forma poco fiable ante pares de calidad similar o empatados.
- Datos de entrenamiento pequeños (2791 pares): riesgo de sobreajuste y de baja generalización a estilos de humor distintos de los del dataset.
- Sesgos: no se documentan análisis de sesgos; al entrenarse con preferencias humanas, puede heredar sesgos culturales y de anotación del dataset de chistes.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la puntuación puede no correlacionar con preferencias humanas fuera de la distribución de entrenamiento.
- Licencia MIT: permite uso comercial, pero el modelo depende de `roberta-base`, cuya licencia también es MIT.
- Para producción: requiere el código de la tesis para restaurar el wrapper (max length, umbral de empate); no se garantiza compatibilidad con pipelines estándar sin ese código.
- No hay pipeline declarado en Hugging Face ni descargas registradas, lo que sugiere un modelo de investigación sin validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/cbmusetti/reward-model-english_without_ties
- Modelo base: https://huggingface.co/roberta-base
- Repositorio de la tesis (código y logs): https://github.com/carlos-musetti/tesis
- Carpeta del reward model en el repositorio: `reward-model/` dentro del repositorio de la tesis
- Paper: no disponible
- Blog o demo: no disponible
