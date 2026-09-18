# aaroncool9/NanoJev

## Resumen

NanoJev es un modelo de decisión de aproximadamente 0,6 mil millones de parámetros construido sobre el backbone del transformer Qwen3-0.6B, al que se le añaden cabezas de decisión estructuradas. Su rasgo diferencial es que no genera texto token a token: recibe varios estados y preguntas en una sola petición y devuelve, en una única pasada forward por el backbone, distribuciones de probabilidad completas sobre conjuntos dinámicos de candidatos. Esto elimina por completo la decodificación de tokens de salida y convierte el coste de inferencia en una sola pasada por lote, en lugar del bucle autoregresivo habitual.

El modelo se presenta como una réplica "nano" de Jev, el modelo de decisión de typesafe.ai, y está orientado a tareas de navegación y control como laberintos y Snake, aunque su interfaz es genérica: soporta preguntas de tipo *choice* (entre 2 y 255 candidatos), *boolean* (probabilidad de que una proposición sea cierta) y *score* (entre 2 y 10 niveles ordenados con su distribución completa y una puntuación esperada). Fue publicado por el usuario aaroncool9 el 18 de septiembre de 2026 y no registra descargas ni valoraciones hasta la fecha.

Su relevancia actual es metodológica más que de escala: demuestra que un backbone de 0,6B, con cabezas adecuadas, puede superar ampliamente al mismo modelo base sin ajuste en tareas de decisión estructurada (95 % frente al 35 % en mapas 4×4), y sirve como banco de pruebas abierto para estudiar calibración de probabilidades, evaluación paralela de candidatos y control basado en distribuciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (backbone Qwen3-0.6B) con cabezas de decisión estructuradas |
| Parámetros totales | ~0,6 mil millones en el backbone; los parámetros adicionales de las cabezas de decisión no se detallan |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; los scripts de ejemplo usan `bf16` |
| Idiomas soportados | en (inglés), zh (chino) |
| Licencia | No disponible |
| Formato de pesos | safetensors (`best.safetensors`), `config.json`, `tokenizer/`, `backbone_config/` |
| Tamaño del repositorio | 19,1 GB (incluye múltiples variantes y checkpoints) |
| Modelo base | Qwen/Qwen3-0.6B |
| Librería | pytorch |

## Arquitectura y entrenamiento

La arquitectura parte del backbone de Qwen3-0.6B, un transformer decoder denso, sobre el que se injertan cabezas de decisión específicas para cada tipo de pregunta. El modelo no emite tokens de texto: en una sola pasada forward por lote evalúa simultáneamente múltiples estados y múltiples preguntas, y produce distribuciones de probabilidad sobre los candidatos definidos dinámicamente en la petición. La model card reporta una medición en servicio real de 6 estados, 18 preguntas y 44 rutas candidatas resueltas con una única pasada por el backbone. Para preguntas de tipo *choice* el espacio de candidatos va de 2 a 255; para *score*, de 2 a 10 niveles ordenados más un score esperado.

Los detalles del conjunto de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no se especifican en la información disponible. El autor publica un dataset asociado (NanoJev-Data) y varias variantes entrenadas con objetivos distintos: `local_atomic_seed17` (juicios locales de seguridad para el laberinto 50×50), `games_gold_seed17` (elección dinámica de acciones para Snake 12×12), `games_api_seed17` (comparación de preguntas sobre mapa completo), `events_ce_seed17` (control de entropía cruzada sobre eventos observados), `events_brier_seed17` (control con regla de Brier) y `events_paired_seed17` (experimento de recompensa apropiada por pares inspirado en RLCD). Cada variante incluye pesos completos, configuración, tokenizador, configuración del backbone y un resumen de entrenamiento.

## Capacidades

- Decisión estructurada con distribución de probabilidad completa, no generación de texto.
- Preguntas de tipo *choice*: selección entre 2 y 255 candidatos dinámicos, con una probabilidad por candidato.
- Preguntas de tipo *boolean*: probabilidad de que una proposición sea verdadera.
- Preguntas de tipo *score*: 2 a 10 niveles ordenados, distribución completa y puntuación esperada.
- Inferencia en paralelo: varios estados y varias preguntas en una sola pasada forward del backbone.
- Decodificación de cero tokens de salida, lo que elimina el coste del bucle autoregresivo.
- Selección greedy o muestreo probabilístico a partir de las distribuciones devueltas.
- Servicio persistente: cargar un checkpoint una vez y reutilizarlo entre peticiones.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible como capacidad declarada; el control por pasos se compone externamente con el código de planificación del repositorio.
- Capacidades multilingües: limitadas a inglés y chino según los metadatos.
- Capacidades especiales: no se declaran visión, audio ni modo *thinking*.

## Casos de uso

- Control de agentes en entornos discretos: el modelo evalúa en una sola pasada las acciones candidatas de un estado y devuelve la distribución, lo que permite integrarlo en bucles de planificación donde cada paso requiere una decisión de bajo coste. Los showcases de laberinto 50×50 (objetivo alcanzado en 244 intentos) y Snake 12×12 (27 comidas, 256 pasos con control greedy) son ejemplos directos.
- Automatización del hogar con reglas aprendidas: la petición de ejemplo de la model card resuelve en un único forward si hay alguien en casa (booleano), qué acción tomar para bajar la temperatura (elección entre aire acondicionado, luces o no hacer nada) y cuánto supera la temperatura al objetivo (score en tres niveles).
- Clasificación calibrada de eventos: las variantes `events_ce_seed17`, `events_brier_seed17` y `events_paired_seed17` están pensadas para comparar objetivos de entrenamiento en la predicción de eventos observados, lo que permite usar NanoJev como banco de pruebas para estudiar calibración probabilística.
- Enrutado de peticiones en pipelines de producción: al devolver una distribución sobre candidatos en lugar de texto libre, la salida puede alimentar directamente un router con umbrales de confianza o un muestreo con temperatura, sin necesidad de parsear lenguaje natural.
- Evaluación de políticas y comparación de alternativas: para un mismo estado se pueden definir varios candidatos y obtener su probabilidad relativa, útil para análisis A/B, priorización o selección de la siguiente consulta en sistemas de recomendación.
- Investigación en modelos "system one": el modelo sirve como referencia reproducible y de bajo coste para estudiar decisión paralela frente a generación autoregresiva, y para replicar los experimentos del repositorio con hardware modesto.
- Control de juego y simulación: la variante `games_api_seed17` compara preguntas sobre el mapa completo, lo que permite evaluar decisiones globales en lugar de locales en entornos tipo grid.

## Benchmarks y rendimiento

Rendimiento en el benchmark de navegación (controlador con muestreo probabilístico a temperatura T=1, 20 mapas de test y 20 mapas OOD):

| Sistema | 4×4 test | 6×6 OOD |
|---|---:|---:|
| NanoJev entrenado | 19/20 — 95 % | 18/20 — 90 % |
| Jev | 20/20 — 100 % | 19/20 — 95 % |
| Qwen3-0.6B original | 7/20 — 35 % | 3/20 — 15 % |

El Qwen3-0.6B original no tiene ajuste específico de tarea; su distribución de acciones se obtiene de la cabeza nativa de lenguaje condicionada por los tokens de respuesta A–D.

Rendimiento medido en el servicio en ejecución: 6 estados, 18 preguntas y 44 rutas candidatas resueltas con 1 única pasada por el backbone.

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: en `bf16`, alrededor de 1,2–1,5 GB para los pesos del backbone de 0,6B más el espacio de activaciones del lote; en `fp32`, alrededor de 2,4–3 GB. Los requisitos exactos de las cabezas de decisión no se detallan.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. El modelo es perfectamente ejecutable en RTX 3060, RTX 4060, RTX 4090, A100 o H100; para el tamaño del modelo, las GPU de gama alta quedan muy sobredimensionadas salvo que se procesen lotes muy grandes de estados y preguntas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo reciente (RTX 30xx/40xx, e incluso modelos con 6 u 8 GB). El repositorio de 19,1 GB no refleja el tamaño de un único checkpoint, sino la acumulación de variantes y ficheros de entrenamiento.
- Opciones de despliegue: el modelo no se sirve con vLLM, llama.cpp, Ollama o TGI de forma estándar, porque incorpora cabezas de decisión personalizadas y un protocolo de entrada JSON. La vía documentada es clonar el repositorio, instalar `requirements-toy.txt` en un entorno CUDA y ejecutar `scripts/predict_toy_decisions.py`, o usar el servicio persistente con `--checkpoint-dir`.
- Latencia y throughput estimados: no disponibles como cifras concretas. La model card destaca que toda la evaluación ocurre en una sola pasada forward y sin decodificación de tokens de salida, lo que reduce la latencia frente a esquemas autoregresivos equivalentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en navegación (4×4 / 6×6 OOD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NanoJev | ~0,6B | No disponible | 95 % / 90 % | No disponible | Pesos abiertos en HuggingFace (`aaroncool9/NanoJev`) y código en GitHub |
| Jev | No disponible | No disponible | 100 % / 95 % | No disponible | Referenciado en el blog de typesafe.ai |
| Qwen3-0.6B (base) | 0,6B | No disponible | 35 % / 15 % | No disponible en la información proporcionada | Pesos abiertos en HuggingFace |

No se han identificado en la información disponible otros modelos comparables de decisión estructurada con distribución de probabilidad sobre candidatos dinámicos.

## Limitaciones y advertencias

- La licencia no está declarada, por lo que no puede asumirse uso comercial sin consultar al autor.
- No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) que permitan situar el modelo en tareas generales de lenguaje.
- El modelo no es un generador de texto: no debe esperarse que responda a instrucciones abiertas ni que mantenga conversaciones. Su salida son distribuciones sobre candidatos predefinidos.
- Las capacidades multilingües declaradas se limitan a inglés y chino; no hay evidencia de soporte para castellano.
- Riesgo de alucinación: no aplica en el sentido clásico, pero existe riesgo de sobreconfianza o descalibración en las probabilidades, especialmente fuera de la distribución de entrenamiento (dominio de navegación y juegos grid).
- Los showcases reportados (laberinto 50×50 en 244 intentos, Snake 12×12 con 27 comidas y 256 pasos) se obtienen combinando las decisiones del modelo con código de planificación compartido del repositorio, no solo con el modelo.
- Existe una discrepancia entre el identificador del repositorio de HuggingFace (`aaroncool9/NanoJev`) y los identificadores citados en la model card (`C-Tianyu/NanoJev` para el modelo y el dataset); conviene verificar cuál es el repositorio canónico antes de integrarlo.
- El repositorio no declara descargas ni valoraciones, por lo que no hay validación independiente de la comunidad.
- Los scripts de ejemplo dependen de un entorno CUDA concreto y de las dependencias fijadas en `requirements-toy.txt`; no hay integración documentada con servidores de inferencia estándar.
- La fecha de creación registrada (18 de septiembre de 2026) es posterior a la fecha habitual de consulta, dato que conviene contrastar con el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aaroncool9/NanoJev
- Repositorio de código: https://github.com/TianyuCodings/NanoJev
- Dataset: https://huggingface.co/datasets/C-Tianyu/NanoJev-Data
- Datos de juegos: https://huggingface.co/datasets/C-Tianyu/NanoJev-Data/tree/main/games_v4
- Comandos del pipeline: https://github.com/TianyuCodings/NanoJev/blob/main/research/pipeline_runbook.md
- Guía de publicación de juegos: https://github.com/TianyuCodings/NanoJev/blob/main/docs/GAME_RELEASE.md
- Demos grabadas de los showcases: https://github.com/TianyuCodings/NanoJev#recorded-showcase-runs
- Blog de presentación de Jev (modelo de referencia): https://typesafe.ai/blog/introducing-system-one-models-and-jev
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
