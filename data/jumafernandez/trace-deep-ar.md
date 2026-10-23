# jumafernandez/trace-deep-ar

## Resumen

TRACE (deep, autoregressive) es un codificador contextual de turnos para diálogo orientado a tareas, desarrollado por J. M. Fernández (jumafernandez) en el marco de un trabajo académico junto a M. Errecalde y S. Burdisso. El modelo no procesa texto directamente: parte de los embeddings estáticos de turno que genera un codificador base congelado (`sergioburdisso/dialog2flow-joint-bert-base`) y aprende una actualización contextual sobre la secuencia de turnos, de modo que cada turno queda representado por un vector de 768 dimensiones que incorpora la información de los turnos anteriores.

La arquitectura es un transformer estilo BERT con 12 capas, 12 cabezas y tamaño oculto 768, pero cuyos "tokens" son turnos completos en lugar de piezas de texto. Con 85,1 millones de parámetros y atención causal sobre los turnos, la variante `deep-ar` puede calcular la representación de un turno mientras la conversación sigue en curso, algo que un codificador bidireccional sobre el diálogo completo no permite. El entrenamiento es auto-supervisado mediante predicción del siguiente turno, sin necesidad de anotaciones de actos de diálogo.

Su relevancia práctica es acotada pero concreta: en la recuperación de situaciones conversacionales sobre SpokenWOZ, la combinación de la representación base con la de TRACE eleva la precisión de 0,454 a 0,483 y el macro-F1 de 0,135 a 0,158, y como componente del agente `dialog2agent` mejora la precisión de un decisor de la siguiente acción del sistema de 0,436 a 0,471. No es un modelo generativo ni un LLM: es un extractor de características para pipelines de diálogo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo BERT sobre embeddings de turno: 12 capas, 12 cabezas, tamaño oculto 768; atención autoregresiva (causal) sobre turnos |
| Parametros totales | 85.108.224 (85,1 M); el codificador base congelado se suma aparte |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 64 turnos por ventana; los diálogos más largos se codifican en ventanas consecutivas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`; código propio incluido) |

## Arquitectura y entrenamiento

TRACE separa el problema en dos etapas. Primero, un codificador de turno congelado (Dialog2Flow joint BERT) convierte cada turno en un embedding estático $e_t \in \mathbb{R}^{768}$. Después, TRACE procesa la secuencia $(e_1, \dots, e_T)$ con un transformer de 12 capas cuyas posiciones son turnos, no tokens, y produce representaciones contextuales $h_t \in \mathbb{R}^{768}$. La entrada combina el embedding de turno con identificadores de hablante y posiciones de turno. En el modo autoregresivo, cada turno atiende únicamente a los turnos anteriores, lo que permite calcular $h_t$ de forma incremental durante una conversación en vivo.

El entrenamiento es auto-supervisado mediante predicción del siguiente turno, sobre la colección de diálogo orientado a tareas de Dialog2Flow, particionada por clústeres de casi duplicados para evitar fuga de información entre entrenamiento y validación. Se entrenó desde cero con tasa de aprendizaje $10^{-4}$, semilla 42 y selección de checkpoint por pérdida de validación. No se emplearon anotaciones de actos de diálogo ni RLHF/DPO. El repositorio contiene el checkpoint convertido al formato de transformers, y la conversión se verificó contra las representaciones del código de entrenamiento en 50 diálogos de SpokenWOZ, con una diferencia absoluta máxima de $1{,}2 \times 10^{-5}$.

## Capacidades

- Extracción de características: devuelve una representación de 768 dimensiones por turno (`encode_dialogue`), no genera texto.
- Modelado contextual de conversaciones multi-turno con atención causal, apto para streaming.
- Codificación incremental: $h_t$ puede calcularse sin esperar a que termine el diálogo.
- Ventanas de hasta 64 turnos, con codificación de diálogos más largos en ventanas consecutivas.
- Acepta embeddings base precalculados mediante el argumento `embeddings=`, lo que permite desacoplar el codificador base del modelo contextual.
- Diferenciación de hablante mediante identificadores de hablante en la entrada.
- Recuperación de situaciones conversacionales por similitud sobre $h_t$ (búsqueda de vecinos más cercanos).
- No soporta tool calling, function calling, agentes autónomos, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- Predicción del siguiente acto de diálogo o de la siguiente acción del sistema: el vector $h_t$ se usa como entrada de un clasificador o de un decisor de puntero; en SpokenWOZ, combinado con $e_t$, eleva la precisión del decisor de 0,436 a 0,471 dentro del agente `dialog2agent`.
- Seguimiento del estado del diálogo (DST) en sistemas orientados a tareas: la representación contextual del turno actual resume el histórico y sirve como característica para modelos de extracción de ranuras, sin necesidad de reinyectar todo el contexto textual.
- Recuperación de situaciones conversacionales: indexar los $h_t$ de un corpus de diálogos y recuperar por vecindad los turnos más similares para votar la siguiente acción o para construir ejemplos few-shot (precisión de 0,483 y cobertura@5 de 0,686 en la combinación $[e_t ; \lambda h_t]$).
- Enrutamiento y desambiguación de intenciones en asistentes de atención al cliente: al distinguir el turno actual a la luz de los anteriores, permite decidir si el usuario cambia de dominio (por ejemplo, de reserva de restaurante a transporte) antes de invocar el servicio correspondiente.
- Preprocesado de pipelines de diálogo: servir como etapa de codificación previa a un modelo generativo o a un clasificador, con un coste computacional muy bajo (85 M de parámetros) y atención causal que admite procesamiento turno a turno en producción.
- Análisis offline de transcripciones: generar representaciones de todos los turnos de un lote de conversaciones para agruparlas, detectar anomalías o medir la evolución de un diálogo en un panel de calidad.
- Segmentación de conversaciones largas: codificar diálogos de más de 64 turnos en ventanas consecutivas para análisis por tramos, por ejemplo para localizar el punto en el que se resuelve la tarea.

## Benchmarks y rendimiento

Evaluación en recuperación de situaciones conversacionales sobre SpokenWOZ (1.019 diálogos de entrenamiento de dominio único, validación cruzada), donde el siguiente acto de diálogo se predice por voto de las continuaciones de los $k$ turnos más cercanos:

| Representación | Accuracy | Macro-F1 | Coverage@5 |
|---|---|---|---|
| $e_t$ (Dialog2Flow) | 0,454 | 0,135 | 0,646 |
| $h_t$ (este modelo) | 0,453 | 0,143 | 0,664 |
| $[e_t ; \lambda h_t]$ | 0,483 | 0,158 | 0,686 |

Resultado adicional reportado en la model card: como componente del agente `dialog2agent`, añadir $h_t$ a $e_t$ eleva la precisión de un decisor de puntero de la siguiente acción del sistema sobre el conjunto de test de SpokenWOZ de 0,436 a 0,471.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas generativas en la información disponible, y no procede aplicarlos: el modelo no genera texto.

## Requisitos de hardware

- VRAM estimada: el checkpoint son 85,1 M de parámetros (unos 340 MB en fp32, 170 MB en fp16); hay que sumar el codificador base congelado si se usa `encode_dialogue`, lo que deja el conjunto en torno a 0,4-0,8 GB según precisión.
- GPU recomendadas: ninguna en particular; cualquier GPU con 2 GB o más es suficiente. Una RTX 4090, A100 o H100 quedan muy sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU; también es viable en CPU para lotes moderados.
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`; requiere `sentence-transformers` para calcular los embeddings base cuando no se pasan precalculados. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama no son opciones directas. vLLM y TGI no están soportados de forma nativa al tratarse de un codificador con código propio y pipeline de feature-extraction.
- Latencia y throughput: no disponible en la información proporcionada.
- Nota de producción: conviene fijar una `revision` concreta al cargar, ya que el modelo exige ejecutar código del repositorio (`trust_remote_code=True`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jumafernandez/trace-deep-ar | 85,1 M (+ codificador base) | 64 turnos | Codificador contextual de turnos, atención causal | Apache 2.0 | HuggingFace, código propio |
| sergioburdisso/dialog2flow-joint-bert-base | no disponible en la información | no disponible | Codificador de turno estático (base congelada de TRACE) | no disponible | HuggingFace |
| all-mpnet-base-v2 (referencia genérica de sentence-transformers) | 109 M | 384 tokens | Codificador de frases bidireccional, uso general | Apache 2.0 | HuggingFace, ampliamente adoptado |

La comparación directa con codificadores de frases genéricos no es concluyente: TRACE opera sobre embeddings de turno y su evaluación se limita a diálogo orientado a tareas en inglés, por lo que no hay resultados comparables en MTEB ni en tareas generativas. No se dispone de datos de benchmarks de los modelos alternativos en el mismo protocolo de evaluación.

## Limitaciones y advertencias

- Solo inglés: entrenado exclusivamente con diálogo orientado a tareas en inglés; el rendimiento en otros idiomas no está caracterizado.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; usarlo como sustituto de un LLM no es viable.
- Dependencia del codificador base: espera los embeddings de `sergioburdisso/dialog2flow-joint-bert-base`; con otro codificador las representaciones pierden validez.
- Es un complemento, no un reemplazo: según el autor, $h_t$ por sí solo rinde al nivel del embedding base (0,453 frente a 0,454 de accuracy) y la mejora aparece al combinar $[e_t ; \lambda h_t]$.
- Ventana de 64 turnos: la información no fluye entre ventanas consecutivas, de modo que en diálogos muy largos se pierde contexto entre tramos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de representaciones poco informativas en turnos ambiguos o fuera de dominio.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible; el corpus de Dialog2Flow condiciona el dominio cubierto (diálogo orientado a tareas).
- Adopción mínima: 0 descargas y 0 likes en el momento de la consulta, sin revisión independiente conocida más allá del trabajo de los autores.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de copyright y licencia; no hay restricciones adicionales documentadas.
- Ejecución de código remoto: `trust_remote_code=True` implica ejecutar código del autor; conviene auditar el repositorio y fijar una revisión antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jumafernandez/trace-deep-ar
- Codificador base: https://huggingface.co/sergioburdisso/dialog2flow-joint-bert-base
- Repositorio del agente dialog2agent: https://github.com/jumafernandez/dialog2agent
- Cita: Fernández, J. M., Errecalde, M., & Burdisso, S. *TRACE: Learning the Update for Contextual Turn Representations in Task-Oriented Dialogue*. In preparation (sin enlace disponible).
