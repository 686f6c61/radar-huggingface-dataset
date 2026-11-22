# Aleksandr95/Laya_bound

## Resumen

Laya_bound es un ajuste fino (fine-tune) del modelo encoder `convaiinnovations/laya` orientado a una única tarea de clasificación binaria: detectar el límite de una "microcadena" (microchain boundary) dentro de un registro de eventos de interfaz de historia clínica electrónica (EHR) en ruso. El modelo no genera texto: recibe una ventana de 17 eventos (8 anteriores, el evento objetivo marcado con `[TARGET]`, y 8 posteriores) y emite logits en las posiciones `[MASK]` para decidir si el evento objetivo es el último de su microcadena (`true`) o una continuación (`false`).

El autor es Aleksandr95, un perfil individual sin trayectoria pública verificable en Hugging Face (0 descargas, 0 likes en el momento de la consulta). El modelo se apoya en la arquitectura ModernBERT-large del modelo base y añade dos piezas propias: un cabezal "noul" (clasificación por opciones múltiples con tokens `[MASK]`) y un módulo FiLM llamado GapFilm que inyecta la pausa temporal `Δt` hasta el siguiente evento como escalar `x = log(1 + Δt)`, modulando las activaciones del encoder.

Su relevancia es acotada pero concreta: demuestra cómo incorporar información temporal explícita (la pausa entre eventos) en un encoder de texto puro para segmentar flujos de interacción en EHR, obteniendo mejoras medibles en el tramo de pausas largas (>120 s) donde la señal textual por sí sola es insuficiente. Con 421 millones de parámetros y 0,8 GB de pesos, es desplegable en una sola GPU consumer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder transformer) con cabezal noul de clasificación y módulo FiLM (GapFilm) para la pausa temporal |
| Parametros totales | 421.295.878 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible explícitamente; la ventana de entrada es de 8 + 1 + 8 eventos más la pregunta noul y las opciones |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precisión completa) |
| Idiomas soportados | ruso (el registro de eventos y la pregunta noul están en ruso); no se declaran otros idiomas |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, `gap_film.safetensors`) |
| Vocabulario | 50.370 tokens (incluye `[TARGET]` id 50368 y `[/TARGET]` id 50369) |
| Pipeline | text-classification |
| Modelo base | convaiinnovations/laya |
| Dataset de entrenamiento | Aleksandr95/laya-boundary-dataset (train 22.870, calibración 2.551, test 4.514; 10 UID) |
| Tamaño del repo | 0,8 GB |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder ModernBERT-large del base `convaiinnovations/laya` y lo combina con un cabezal de tipo noul: en lugar de generar texto, se formula una pregunta fija en ruso ("¿Es el evento entre `[TARGET]` y `[/TARGET]` el último de su microcadena?") con dos opciones etiquetadas `false` (continuación) y `true` (límite), y se leen los logits en las posiciones `[MASK]` correspondientes a cada opción. La secuencia de entrada sigue un formato fijo: `[CLS]` + pregunta noul + `[SEP]` + opción `false` + opción `true` + `[SEP]` + 8 eventos previos + evento objetivo entre `[TARGET]`/`[/TARGET]` + 8 eventos posteriores + `[SEP]`. El tiempo no se codifica en el texto.

La innovación técnica es GapFilm: un módulo FiLM separado (`gap_film.safetensors`, con `w_gamma` y `w_beta`) que toma el escalar `x = log(1 + Δt)` y modula las activaciones del encoder. El entrenamiento usó 12 épocas (≈7,6 h de reloj, 421 actualizaciones del optimizador por época) con una pérdida dual que combina la clasificación de frontera y una condición `x = 0` (sin pausa), de modo que el modelo aprenda a funcionar tanto con GapFilm activo como forzado a cero. Tras la calibración se fijó una temperatura noul de `T ≈ 4.923`. Los pesos guardados corresponden a la época 12, aunque la época 11 es marginalmente mejor en F1 de frontera (0,920 frente a 0,918).

## Capacidades

- Clasificación binaria de límite de microcadena en flujos de eventos de EHR en ruso (opción `true` = frontera, `false` = continuación).
- Codificación de contexto de 17 eventos (8 previos, el objetivo, 8 posteriores) en una sola pasada del encoder.
- Integración de señal temporal mediante GapFilm: la pausa `Δt` hasta el siguiente evento modula las activaciones, con mejora específica en pausas largas.
- Funcionamiento en modo "sin pausa" (`x = 0`) con los mismos pesos, útil si no se dispone de marcas temporales fiables.
- Calibración probabilística: ECE de 0,032 y Brier de 0,063 en test, lo que permite usar las probabilidades como scores fiables.
- No soporta generación de texto, tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso. Es un clasificador puro.
- Multilingüismo: no disponible; el modelo está entrenado y evaluado únicamente sobre datos en ruso.

## Casos de uso

- Segmentación de sesiones de usuario en EHR: agrupar secuencias de eventos de interfaz en microcadenas coherentes (por ejemplo, "abrir ficha → consultar analítica → cerrar") usando el clasificador como detector de límites entre pasos. Adecuado por su precisión de frontera del 96,8 % y su recall del 85,4 % en test.
- Analítica de flujos de trabajo clínicos: reconstruir automáticamente las microcadenas de interacción para medir tiempos por tarea, detectar atascos o cuantificar pasos por proceso, aprovechando la ventana de 17 eventos y la señal de pausa.
- Detección de abandono de tarea: un evento con pausa >120 s y alta probabilidad de frontera (`true`) indica cierre de microcadena; el modelo acierta el 97,4 % en ese tramo, lo que permite distinguir finalización de interrupción.
- Enriquecimiento de logs para entrenamiento de agentes: etiquetar automáticamente fronteras en registros históricos para construir datasets de demostración de agentes de UI, con la ventaja de que el modelo funciona sin generación y a bajo coste.
- Monitorización en producción de asistentes de UI clínica: puntuar en tiempo real cada evento con la probabilidad de frontera (bien calibrada, ECE 0,032) para disparar resúmenes o confirmaciones al cerrar una microcadena.
- Investigación en modelado de interacción temporal: servir como línea base reproducible para estudiar el efecto de la pausa en la segmentación de eventos, ya que el autor publica la comparativa con y sin GapFilm y el desglose por intervalo `Δt`.
- Filtrado previo en pipelines de anonimización o auditoría: reducir el volumen de eventos a revisar agrupándolos por microcadena antes de aplicar reglas de negocio o revisiones manuales.

## Benchmarks y rendimiento

Resultados en test (N = 4.514, 18,7 % de fronteras; precisión de la clase mayoritaria 0,813):

| Metrica | Con pausa (GapFilm) | x = 0 (sin pausa) |
|---|---:|---:|
| Accuracy de frontera | 0,968 | 0,967 |
| Recall de frontera | 0,854 | 0,845 |
| Brier | 0,063 | 0,067 |
| ECE | 0,032 | 0,034 |
| AP (PR) | 0,917 | 0,905 |

Desglose por pausa hasta el siguiente evento:

| Δt | N | Tasa de frontera | Acc. con pausa | Acc. x=0 | Recall con pausa | Recall x=0 |
|---|---:|---:|---:|---:|---:|---:|
| <1 s | 2.173 | 0,022 | 0,975 | 0,975 | 0,000 | 0,000 |
| 1–10 s | 1.589 | 0,152 | 0,955 | 0,955 | 0,748 | 0,748 |
| 10–120 s | 518 | 0,622 | 0,979 | 0,977 | 0,972 | 0,969 |
| >120 s | 234 | 1,000 | 0,974 | 0,944 | 0,974 | 0,944 |

Evolución en calibración (N = 2.551), selección de épocas:

| Epoca | Loss | Accuracy | F1 | Recall | \|wγ\| | \|wβ\| |
|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0,911 | 0,910 | 0,763 | 0,786 | 0,645 | 0,666 |
| 4 | 1,028 | 0,959 | 0,887 | 0,870 | 0,947 | 0,966 |
| 8 | 0,763 | 0,971 | 0,917 | 0,880 | 1,321 | 1,362 |
| 11 | 0,681 | 0,972 | 0,920 | 0,872 | 1,331 | 1,367 |
| 12 | 0,662 | 0,971 | 0,918 | 0,870 | 1,331 | 1,366 |

Por UID (con pausa), el mejor resultado es el UID 48003317 (accuracy 0,986, recall 0,932) y el peor el UID 48008263 (accuracy 0,893, recall 0,724, Brier 0,213). No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Pesos en precisión completa: 421 M de parámetros, aproximadamente 0,84 GB en fp32 y ~0,42 GB en fp16/bf16. El repo ocupa 0,8 GB.
- VRAM estimada para inferencia: menos de 2 GB en fp16 con batch pequeño; en torno a 3–4 GB en fp32 incluyendo activaciones y tokenizer.
- Cabe en cualquier GPU consumer moderna: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, así como en CPU para lotes pequeños.
- GPU recomendadas para throughput alto: A100, H100 o L4 para servir lotes grandes; el modelo es lo bastante pequeño como para que la latencia esté dominada por el preprocesado y no por el cómputo.
- Opciones de despliegue: el paquete `laya` (carga con `laya.train.load_checkpoint`), PyTorch nativo con `gap_film.load_gap_model`, y exportación a ONNX o TorchScript para servir. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama (son para generación de texto y este modelo no genera).
- Advertencia de carga: `laya.train.load_checkpoint` usa `allow_patterns` que omiten `gap_film.safetensors`; para usar la pausa hay que descargar el snapshot completo y cargar el módulo con `hf_hub_download("Aleksandr95/Laya_bound", "gap_film.py")`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laya_bound (este) | 421 M | ventana de 17 eventos | Clasificación de frontera de microcadena en EHR ruso | no disponible | Hugging Face, 0 descargas |
| convaiinnovations/laya (base) | no disponible (mismo encoder ModernBERT-large) | no disponible | Modelo base de agente/encoder | no disponible | Hugging Face |
| ModernBERT-large (arquitectura subyacente) | ~395 M | 8.192 tokens (según la familia ModernBERT) | Encoder de propósito general | Apache 2.0 (según la familia ModernBERT) | Hugging Face, ampliamente usado |

No se dispone de comparaciones directas con otros detectores de frontera de microcadena ni con modelos especializados en segmentación de logs de EHR en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo resuelve una tarea binaria sobre un formato de entrada muy concreto (pregunta noul fija, ventana 8+1+8, tokens `[TARGET]`/`[/TARGET]`). No sirve como modelo general.
- Entrenado y evaluado únicamente sobre datos en ruso de un EHR concreto (10 UID). El rendimiento por UID varía notablemente: accuracy entre 0,893 y 0,986, recall entre 0,724 y 0,932. La generalización a otros hospitales, idiomas o dominios no está demostrada.
- Recall nulo en pausas <1 s: en ese tramo no hay fronteras reales en los datos, pero implica que el modelo no detecta cortes rápidos si los hubiera.
- Licencia no declarada: no se puede asumir uso comercial. Es imprescindible contactar con el autor antes de desplegarlo en producción.
- Riesgo de alucinación no aplica en el sentido generativo (no produce texto), pero sí hay riesgo de falsos positivos y negativos en la clasificación; con recall de frontera del 85,4 % en test, aproximadamente 1 de cada 7 fronteras reales se pierde.
- La calibración (temperatura `T ≈ 4.923`) y las métricas proceden de un único conjunto de calibración de 2.551 ejemplos; pueden no transferirse a distribuciones distintas.
- El módulo GapFilm no se carga por defecto con la API estándar de `laya`; un uso descuidado degrada ligeramente el rendimiento en pausas largas (accuracy 0,944 frente a 0,974 en Δt >120 s).
- Repositorio sin descargas ni validación comunitaria (0 descargas, 0 likes): no hay evidencia externa de reproducibilidad independiente.
- El modelo base `convaiinnovations/laya` tiene licencia no disponible, lo que puede condicionar la redistribución del fine-tune.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aleksandr95/Laya_bound
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Dataset de entrenamiento: https://huggingface.co/datasets/Aleksandr95/laya-boundary-dataset
- Repositorio del paquete `laya` (referenciado en la model card como librería de carga): no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
