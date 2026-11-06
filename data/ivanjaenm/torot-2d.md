# ivanjaenm/torot-2d

## Resumen

ToR-OT 2D es un modelo de investigación desarrollado por Ivan Jaen Marquez, Sotirios Panagiotis Chytas y Vikas Singh (grupo de Vikas Singh), presentado en el paper *Learning Optimal Transport Plans Via Autoregressive Token Regression* (NeurIPS 2026). Resuelve un problema muy concreto: dado un par de histogramas bidimensionales sobre una rejilla k x k y un tipo de coste, generar directamente el plan de transporte óptimo (la matriz de acoplamiento) sin resolver el problema de optimización de forma iterativa.

El modelo tiene 157.599.744 parámetros en float32 y sigue una arquitectura encoder-decoder de tipo transformer: el encoder lee los dos histogramas y el tipo de coste, y el decoder escribe el plan de transporte fila a fila como una secuencia de tokens que codifican un puntero a la bin destino, un exponente y cuatro dígitos de mantisa. Es, por tanto, un modelo de regresión por tokens autorregresiva, no un modelo de lenguaje de propósito general.

Su relevancia es acotada pero clara: demuestra que un transformer puede aproximar planes de transporte óptimo en 2D con decodificación voraz restringida por gramática, ofreciendo una alternativa aprendida a solvers clásicos como el algoritmo húngaro o Sinkhorn y a baselines neuronales como Meta OT y UNOT. No está pensado para uso comercial genérico ni para tareas de NLP; es un artefacto reproducible para los resultados 2D del paper (Fig. 4C-D, Fig. 5, Apéndice F).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con regresión por tokens autorregresiva |
| Parámetros totales | 157.599.744 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en float32) |
| Idiomas soportados | no aplica (modelo numérico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32), configuración en `config.yaml` |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder. El encoder procesa la representación de los dos histogramas de entrada (rejillas k x k en [0, 1]^2, con k entre 3 y 10, es decir, entre 9 y 100 bins) junto con el tipo de coste. El decoder genera el plan de transporte de forma autorregresiva fila a fila, emitiendo para cada entrada un token con un puntero a la bin destino, un exponente y cuatro dígitos de mantisa. La decodificación usada en el paper es voraz y restringida por gramática, con la última fila generada por el propio modelo (`last_row="model"`).

El entrenamiento se realizó sobre el dataset `ivanjaenm/torot_data_4M_2d` (revisión `1ff4a4a6329fa5c822f77d92b1c2ae850afedd9b`), compuesto por histogramas 2D sobre rejillas k x k con seis tipos de coste; la mitad de las marginales tienen bins vacíos (entre el 10 % y el 70 % de las bins puestas a cero). Los pesos publicados corresponden a la media móvil exponencial (EMA) tras 560.000 pasos de entrenamiento. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Predicción de planes de transporte óptimo en 2D: dado un par de histogramas y un tipo de coste, genera la matriz densa de acoplamiento n x m.
- Soporte de seis tipos de coste distintos (el ejemplo de la model card usa `sqeuclidean`; el resto se definen en `COST_TYPES` de la librería `torot`).
- Manejo de marginales con bins vacíos (hasta el 70 % de bins a cero en la mitad de los casos de entrenamiento).
- Generalización a rejillas de k = 3 a 10 (9 a 100 bins por histograma).
- Decodificación restringida por gramática que garantiza que la salida sea un plan válido (no negatividad, estructura de fila).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en transporte óptimo: reproducir los resultados 2D del paper (Fig. 4C-D, Fig. 5, Apéndice F) con los pesos EMA publicados y el código de `vsingh-group/TOR-OT`.
- Benchmarking de solvers aprendidos: comparar el gap de coste relativo frente al plan exacto (`ot.emd`) y frente a los baselines Meta OT y UNOT incluidos en `baselines/`.
- Aproximación rápida de planes de acoplamiento en pipelines experimentales: sustituir el solver exacto por una pasada del modelo cuando la latencia importe más que la optimalidad estricta, midiendo el gap resultante.
- Generación de datos sintéticos de planes de transporte: usar las salidas del modelo como inicialización o warm-start para métodos iterativos de refinamiento.
- Estudio de representaciones numéricas en transformers: analizar cómo el esquema token (puntero, exponente, mantisa) afecta a la precisión de la regresión de valores continuos.
- Docencia y divulgación: ejemplo reproducible de un transformer que resuelve un problema de optimización combinatoria sin bucle de optimización explícito, con código de evaluación incluido en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo proporciona un script de evaluación que calcula el gap de coste relativo frente al plan exacto (`(plan * C).sum() / (ot.emd(a, b, C) * C).sum() - 1`), pero no incluye cifras numéricas de MMLU, HumanEval, GSM8K ni de ningún benchmark de transporte óptimo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,63 GB solo para los pesos en float32 (157,6 M de parámetros), más memoria para activaciones y el plan de salida; con un lote pequeño cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; el ejemplo de la model card usa `torch.device("cuda")` sin especificar modelo.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores, dado el reducido tamaño del modelo.
- Opciones de despliegue: la librería propia `torot` (funciones `load_model` y `predict_plans`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ToR-OT 2D | Transformer encoder-decoder, regresión por tokens | 157,6 M | no disponible | MIT | Pesos en Hugging Face (`ivanjaenm/torot-2d`) |
| Meta OT | Baseline neuronal de transporte óptimo | no disponible | no aplica | no disponible | Código en `baselines/` del repo |
| UNOT | Baseline neuronal de transporte óptimo | no disponible | no aplica | no disponible | Código en `baselines/` del repo |

No se dispone de datos de parámetros, contexto ni rendimiento de Meta OT y UNOT en la información proporcionada; solo se sabe que son los baselines usados en el paper y que se ejecutaron uno por tipo de coste, seleccionados sobre validación.

## Limitaciones y advertencias

- Modelo de investigación acotado a transporte óptimo 2D sobre rejillas k x k con k entre 3 y 10; no generaliza a otras dimensiones ni a tamaños de rejilla fuera de ese rango sin reentrenamiento.
- Solo se publican pesos en float32; no hay versiones cuantizadas ni GGUF, lo que limita su uso en entornos con restricciones de memoria muy estrictas (aunque el tamaño es pequeño).
- La decodificación voraz restringida por gramática es parte del procedimiento de evaluación; usar otra estrategia puede degradar la validez de los planes generados.
- Riesgo de planes no exactamente óptimos: el modelo aproxima el plan, por lo que conviene medir el gap de coste relativo frente a `ot.emd` antes de usarlo en producción.
- No es un modelo de lenguaje: no soporta instrucciones en lenguaje natural, tool calling ni agentes; la model card no documenta sesgos lingüísticos porque no aplica.
- Licencia MIT: permite uso comercial y modificación, pero el modelo se distribuye sin garantías y sin documentación sobre robustez fuera de la distribución de entrenamiento.
- La fecha de creación indicada (2026-11-05) y la referencia a NeurIPS 2026 deben tratarse como datos de la model card; verificar la disponibilidad real del paper antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ivanjaenm/torot-2d
- Dataset de entrenamiento: https://huggingface.co/datasets/ivanjaenm/torot_data_4M_2d
- Repositorio de código: https://github.com/vsingh-group/TOR-OT
- Paper: *Learning Optimal Transport Plans Via Autoregressive Token Regression*, Jaen Marquez, Chytas y Singh, NeurIPS 2026 (enlace directo no disponible en la información proporcionada)
