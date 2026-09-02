# aitups/ALIA-40b-saor

## Resumen

ALIA-40b-saor es un modelo de lenguaje de 41.1 mil millones de parámetros resultante de aplicar la técnica de poda arquitectónica SAOR (Vía B) sobre el modelo ALIA-40b del Barcelona Supercomputing Center (BSC-LT). El autor, aitups, ha podado los bloques de avance (FFN) de las 48 capas del transformer denso original, reemplazando la topología densa por una adyacencia binaria decodificada desde un genoma CPPN de 466 floats. El resultado es un archivo GGUF disperso de aproximadamente 25 GB en cuantización Q4_K, con una compresión arquitectónica de 0.018 (es decir, solo el 1.8 % de las conexiones FFN se mantienen activas) y una divergencia KL de 0.723 respecto al modelo base.

El modelo se publica bajo licencia CC-BY-SA-4.0, una variante de copyleft que obliga a distribuir las obras derivadas bajo la misma licencia. Su principal interés radica en la investigación sobre poda estructural de modelos grandes: demuestra que ALIA-40b es aproximadamente 100 veces más sensible a la poda del FFN que Qwen3.8-27B, y que incluso la topología CPPN no consigue superar una divergencia KL de 0.723 a compresiones mayores. No se trata de un modelo listo para producción, sino de un experimento reproducible sobre viabilidad de compresión dispersa en arquitecturas densas de 40B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (llama) con 48 bloques FFN `[8192 → 24576]`, podado con topología CPPN binaria |
| Parámetros totales | 41.113.838.592 (41.1B) |
| Parámetros activos | No aplica (no es MoE; la poda reduce conexiones, no parámetros) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K (formato GGUF disperso D16) |
| Idiomas soportados | No disponibles (heredados del modelo base ALIA-40b, que es multilingüe, pero no se especifica en esta variante) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | GGUF (archivo `ALIA-40b-saor.gguf`, ~25 GB) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura llama densa del ALIA-40b original: 48 bloques transformer con FFN de dimensión intermedia 24576. La modificación introducida por SAOR consiste en podar cada capa FFN según una adyacencia binaria determinada por un genoma CPPN (Compositional Pattern Producing Network) de 466 valores flotantes. Este genoma se decodifica en GPU (mediante `embed_sparse --genome --gpu`) y define qué conexiones del FFN se mantienen activas. El proceso de poda se realizó mediante el loop evolutivo de SAOR (Vía B, `via_b_evolve --batch-eval`, 4 generaciones), optimizando la topología para minimizar la divergencia KL respecto al modelo original.

No se ha realizado ningún entrenamiento adicional sobre el modelo podado; los pesos activos se re-empaquetan directamente en Q4_K. El resultado es una compresión arquitectónica `D_arch` de 0.018, lo que significa que solo el 1.8 % de las conexiones FFN originales sobreviven. La divergencia KL medida con 4 posiciones de contexto es de 0.723, un valor alto que indica una degradación sustancial de la distribución de salida. El autor señala explícitamente que ALIA-40b es mucho más sensible a la poda que otros modelos como Qwen3.8-27B, y que este es el mejor resultado alcanzado por SAOR para esta arquitectura.

## Capacidades

- Generación de texto: el modelo puede generar texto en los idiomas del modelo base, aunque la poda degrada la calidad de forma notable (KL 0.723).
- Investigación en poda: su principal utilidad es estudiar el efecto de la poda estructural sobre modelos densos de gran tamaño.
- Inferencia dispersa: el formato GGUF disperso D16 permite ejecutar inferencia con el runtime Hayai, que soporta streaming por capas y evaluación de divergencia KL.
- No se dispone de información sobre tool calling, razonamiento multi-paso, capacidades de agente, visión o audio en esta variante.

## Casos de uso

- Investigación académica sobre poda de modelos: permite analizar cómo la topología CPPN afecta a la degradación de un modelo de 40B, comparando con otros experimentos SAOR como Qwen3.8-27B-saor o Qwen3.5-4B-saor.
- Evaluación de compresión arquitectónica: sirve como banco de pruebas para medir la divergencia KL y la viabilidad de mantener calidad con compresiones extremas (1.8 % de conexiones).
- Desarrollo de runtimes de inferencia dispersa: el archivo GGUF D16 es un caso de uso real para probar motores como Hayai, que debe gestionar la dispersión de forma eficiente.
- Estudio de sensibilidad de arquitecturas: la comparación con otros modelos SAOR permite entender qué arquitecturas toleran mejor la poda.
- Prototipado de sistemas de generación de texto con restricciones de memoria: aunque la calidad es limitada, el tamaño reducido (25 GB) permite ejecutar el modelo en hardware con menos recursos que el ALIA-40b completo.
- Reproducibilidad de experimentos evolutivos: el genoma CPPN y el histórico de evolución están disponibles bajo demanda, lo que permite replicar el proceso de poda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la divergencia KL de 0.723 respecto al modelo base, medida con 4 posiciones de contexto y un conjunto de calibración de 128 prompts. No se proporcionan datos de latencia, throughput ni calidad de generación en tareas estándar.

## Requisitos de hardware

- Almacenamiento: el archivo GGUF ocupa aproximadamente 25 GB en disco.
- Memoria para inferencia: al ser un modelo de 41.1B en Q4_K, se estima que necesita al menos 25-30 GB de RAM o VRAM para cargar los pesos en memoria. El model card advierte explícitamente que «40b no cabe en VRAM pequeña».
- GPU recomendadas: para inferencia completa en GPU se necesitaría una NVIDIA A100 (40 GB), H100 (80 GB) o RTX A6000 (48 GB). En GPUs de consumo como RTX 4090 (24 GB) no cabría sin offloading a CPU.
- CPU: es posible ejecutar el modelo en CPU con suficiente RAM (64 GB o más), usando el runtime Hayai con `--device auto`.
- Opciones de despliegue: el runtime principal es Hayai (https://github.com/hayai-org/hayai), que soporta archivos GGUF dispersos D16. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no se han publicado datos estimados.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El modelo base ALIA-40b se puede comparar con otros modelos de 40B como Qwen2.5-32B o Llama-3-70B, pero la variante saor es un experimento de poda sin benchmarks públicos. El propio autor menciona comparaciones con Qwen3.8-27B-saor y Qwen3.5-4B-saor en cuanto a sensibilidad a la poda, pero no se ofrecen datos numéricos de rendimiento en tareas estándar. Por tanto, la comparativa se limita a lo siguiente:

| Modelo | Parámetros | Contexto | Licencia | Formato | Uso |
|---|---|---|---|---|---|
| ALIA-40b (base) | 41.1B | No disponible | Apache 2.0 | Safetensors | Modelo denso original |
| ALIA-40b-saor | 41.1B | No disponible | CC-BY-SA-4.0 | GGUF Q4_K disperso | Experimento de poda |
| Qwen3.8-27B-saor | 27B | No disponible | No disponible | GGUF disperso | Otro experimento SAOR |

## Limitaciones y advertencias

- Degradación severa: la divergencia KL de 0.723 indica que la distribución de salida difiere sustancialmente de la del modelo base. No se recomienda su uso en aplicaciones que requieran alta fidelidad de generación.
- Sensibilidad a la poda: ALIA-40b es aproximadamente 100 veces más sensible a la poda del FFN que otros modelos, lo que limita la aplicabilidad de la técnica en esta arquitectura.
- Licencia CC-BY-SA-4.0: cualquier obra derivada debe distribuirse bajo la misma licencia, lo que puede ser restrictivo para uso comercial propietario.
- Sin datos de sesgos o alucinación: no se ha evaluado el comportamiento del modelo en términos de sesgos, toxicidad o veracidad de las respuestas.
- Dependencia del runtime Hayai: el formato disperso D16 no es compatible con los motores de inferencia estándar (vLLM, llama.cpp, Ollama), lo que limita su portabilidad.
- Sin especificaciones de contexto: se desconoce la longitud de contexto soportada, un dato crítico para aplicaciones de generación larga.
- Sin garantías de producción: el modelo es un resultado experimental de investigación, no un producto estable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aitups/ALIA-40b-saor
- Modelo base (mradermacher/ALIA-40b-GGUF): https://huggingface.co/mradermacher/ALIA-40b-GGUF
- Modelo original del BSC (BSC-LT/ALIA-40b): https://huggingface.co/BSC-LT/ALIA-40b
- Variante instruct del BSC (BSC-LT/ALIA-40b-instruct-2601): https://huggingface.co/BSC-LT/ALIA-40b-instruct-2601
- Runtime Hayai: https://github.com/hayai-org/hayai
- Artículo sobre ALIA y Salamandra: https://aisummitbarcelona.com/resources/alia-spanish-language-models
