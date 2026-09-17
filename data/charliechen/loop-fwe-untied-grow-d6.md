# CharlieChen/loop-fwe-untied-grow-d6

## Resumen

loop-fwe-untied-grow-d6 es un modelo base de lenguaje (no instruido) de 162.201.600 parámetros almacenados en FP32, publicado por el usuario CharlieChen en Hugging Face. Forma parte de la familia de experimentos descrita en el artículo «How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents», cuyo código se distribuye en el repositorio cue-engineering/loop. Se trata del punto de la escalera de profundidad etiquetado como d6, con anchura 768, 6 cabezas de atención y una recurrencia final del núcleo de 4 repeticiones.

El interés del modelo es fundamentalmente de investigación: pertenece a la familia de los *looped transformers*, en los que un mismo bloque se aplica repetidamente, de modo que el coste computacional efectivo puede desacoplarse del número de parámetros almacenados. El checkpoint se entrena sobre FineWeb-Edu con tokenizador GPT-2 (vía tiktoken), una longitud de contexto de 2.048 tokens y un vocabulario de 50.257 tokens ampliado a 50.304 filas. Los pesos exportados son idénticos bit a bit al checkpoint del artículo.

Su relevancia es acotada pero clara: sirve como referencia reproducible para estudiar leyes de escalado, crecimiento de modelos y operadores de frontera, y como baseline de ablación para otros experimentos con recurrencia. No es un modelo pensado para producto: no tiene ajuste por instrucciones, su precisión CORE publicada es baja (0,10733423) y solo se distribuye en inglés con pesos PyTorch personalizados, no compatibles con `AutoModel` de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con recurrencia de núcleo (*looped transformer*), implementación propia `TransformerGPT` |
| Parametros totales | 162.201.600 parámetros almacenados en FP32 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos FP32 (`final.pt`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`final.pt`), no safetensors ni GGUF |
| Anchura (dimensión del modelo) | 768 |
| Cabezas de atención | 6 |
| Coordenada de profundidad | d6 |
| Repeticiones finales del núcleo | 4 |
| Tokenizador | GPT-2 vía tiktoken |
| Vocabulario | 50.257 tokens, ampliado a 50.304 filas del modelo |
| Corpus de entrenamiento | HuggingFaceFW/fineweb-edu |
| NLL de validación de preentrenamiento | 3,13478731 nats/token |
| CORE (precisión, media de semillas 0, 1 y 2) | 0,10733423 |
| CORE (NLL de respuesta) | 3,39983762 nats/token |
| Tamano del repositorio | 0,6 GB |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

El modelo usa una arquitectura de transformer recurrente: un núcleo de bloques se ejecuta varias veces (4 repeticiones finales del núcleo en este checkpoint) en lugar de apilar capas independientes. La model card advierte explícitamente de que la coordenada de profundidad d6 es la coordenada de escalado de la escalera experimental y puede diferir del número de bloques Transformer ejecutados, por lo que no debe interpretarse como un recuento de capas convencional. La denominación «untied» del checkpoint hace referencia a la configuración de atado de pesos de este punto de la escalera; la model card no detalla esa configuración más allá del nombre.

El preentrenamiento se realiza sobre FineWeb-Edu con tokenizador GPT-2 implementado mediante tiktoken. La model card solo publica hiperparámetros seleccionados y métricas numéricas en `result.json`, sin especificar el número total de tokens procesados, la composición exacta del dataset ni si hubo fases de RLHF o DPO (no disponible). Los pesos se exportaron en FP32 idénticos bit a bit al checkpoint del artículo, y el repositorio incluye `SHA256SUMS` con el checksum SHA-256 de `final.pt`. No se incluye el estado del optimizador. La evaluación del artículo se ejecutó en GPU H100 con FlashAttention-3 y autocast en bfloat16.

## Capacidades

- Generación de texto autoregresiva en inglés como modelo base, sin ajuste por instrucciones ni plantilla de chat.
- Evaluación de conocimiento y razonamiento mediante el conjunto CORE (22 tareas, 91.037 ejemplos), con precisión publicada de 0,10733423.
- Reproducción de experimentos de leyes de escalado: la recurrencia del núcleo permite estudiar la relación entre cómputo efectivo y parámetros almacenados.
- Punto de partida para *fine-tuning* supervisado en tareas concretas de inglés.
- Inferencia con autocast en bfloat16 y FlashAttention-3 dentro del código del artículo.
- Soporte de tool calling / function calling: no disponible (no hay ajuste ni formato documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad entrenada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (visión, audio, modo *thinking*): no disponibles.
- Carga directa con `transformers.AutoModel`: no soportada; requiere el `TransformerGPT` del repositorio del artículo.

## Casos de uso

- Reproducción de resultados de investigación: ejecutar `eval.py` del repositorio cue-engineering/loop sobre este checkpoint para verificar la precisión CORE y el NLL publicados, con la semilla y el subconjunto de tareas que se necesiten.
- Estudio de leyes de escalado con recurrencia: usar este punto d6 como observación de la escalera para ajustar exponentes de escalado junto al resto de checkpoints de la familia.
- Baseline de ablación en experimentos de crecimiento de modelo: comparar arquitecturas que atan o desatan pesos contra esta configuración «untied» manteniendo anchura 768 y contexto 2.048.
- Fine-tuning de dominio en inglés: partir de los pesos preentrenados para tareas de clasificación o generación sobre corpus especializados en inglés, con la ventaja de un coste de almacenamiento de 0,65 GB en FP32.
- Validación de infraestructura de evaluación: comprobar que un pipeline propio de CORE reproduce las medias sobre las semillas 0, 1 y 2 con el subconjunto acotado (`--max-per-task 10`).
- Experimentos locales de bajo coste: al ocupar menos de 1 GB en FP32, permite iterar en una única GPU de consumo o incluso en CPU para pruebas de humo del código de inferencia.
- Estudio comparativo de eficiencia cómputo/parámetros: analizar cuánta calidad adicional aportan las 4 repeticiones del núcleo frente a un transformer de profundidad fija con el mismo número de parámetros almacenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, ARC, HellaSwag, etc.) en la información disponible. La model card solo reporta métricas del propio artículo y del preentrenamiento:

| Metrica | Valor | Notas |
|---|---|---|
| Precisión CORE | 0,10733423 | Media archivada del artículo sobre semillas 0, 1 y 2; 91.037 ejemplos, 22 tareas |
| NLL de respuesta CORE | 3,39983762 nats/token | Distinta de la NLL de validación de preentrenamiento |
| NLL de validación de preentrenamiento | 3,13478731 nats/token | Sobre el corpus de preentrenamiento |
| MMLU / HumanEval / GSM8K | no disponible | No publicados en la información proporcionada |

No se dispone de comparaciones con otros modelos dentro de la información aportada.

## Requisitos de hardware

- VRAM para pesos en FP32: aproximadamente 0,65 GB (162.201.600 parámetros × 4 bytes), coherente con el tamaño de repositorio de 0,6 GB.
- VRAM en bfloat16: aproximadamente 0,32 GB solo para pesos; con caché KV y activaciones para contexto 2.048 y lote pequeño, el consumo total se mantiene muy por debajo de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. El artículo usó H100 con FlashAttention-3, pero ese hardware es innecesario para inferencia de un modelo de este tamaño; una RTX 3060, RTX 4060 o superior es suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente.
- Ejecución en CPU: viable para pruebas de humo, dado el reducido número de parámetros; el cuello de botella será la recurrencia secuencial del núcleo.
- Opciones de despliegue: el repositorio cue-engineering/loop es la vía soportada (`eval.py`). No hay soporte publicado para vLLM, llama.cpp, Ollama, TGI ni Transformers `AutoModel`, y no se distribuyen pesos GGUF ni safetensors.
- Latencia y throughput estimados: no disponibles. Dependen del número de tokens efectivos por paso de decodificación, que la model card no especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks publicados |
|---|---|---|---|---|---|
| loop-fwe-untied-grow-d6 | 162,2 M (FP32) | 2.048 | no disponible | PyTorch `.pt` propio | CORE 0,10733423 |
| GPT-2 small | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Pythia-160M | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La model card no incluye ninguna comparativa con modelos de la misma escala, y la búsqueda web realizada no ha devuelto documentación técnica relevante (los resultados obtenidos eran páginas no relacionadas sobre Instagram). No se dispone, por tanto, de datos verificables de alternativas comparables para contrastar parámetros, contexto, rendimiento o licencia. La comparación más informativa es interna a la propia familia de checkpoints del artículo, cuyos otros puntos no se han proporcionado.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene diálogos con formato de chat; usarlo directamente para generación conversacional produce texto sin control de formato.
- Precisión CORE baja (0,10733423), lo que indica un rendimiento limitado en tareas de conocimiento y razonamiento respecto a modelos de referencia de tamaño comparable.
- Riesgo de alucinación alto, inherente a un modelo base de 162 M de parámetros entrenado solo para predicción del siguiente token.
- Sesgos: no se documenta ningún análisis de sesgos, toxicidad o composición demográfica en la información disponible.
- Idioma: únicamente inglés; no hay soporte multilingüe declarado ni evaluado.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Licencia no disponible: no se puede confirmar la legalidad del uso comercial, la redistribución o la creación de derivados. Se recomienda contactar con el autor antes de cualquier uso en producción.
- Pesos en formato propietario: `final.pt` requiere el `TransformerGPT` del repositorio del artículo; no es un artefacto `AutoModel`, por lo que no se integra con ecosistemas estándar sin trabajo de conversión.
- No se incluye el estado del optimizador, lo que dificulta reanudar el preentrenamiento original.
- Ausencia de cuantizaciones oficiales (GGUF, AWQ, GPTQ) y de soporte en motores de inferencia de alto rendimiento.
- Trazabilidad limitada del entrenamiento: no se publican el número de tokens vistos, la composición del dataset ni el pipeline de alineación.
- Popularidad nula en el momento de la consulta (0 descargas, 0 *likes*), sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/CharlieChen/loop-fwe-untied-grow-d6
- Repositorio del código del artículo: https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Artículo de referencia: «How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents» (no se ha encontrado URL directa en la información proporcionada)
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos no guardaban relación con el tema
