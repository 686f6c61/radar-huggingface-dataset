# AdaptiveChunking/ali_lexmem-v1-vgate_s1

## Resumen

ali_lexmem-v1-vgate_s1 es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso, sino una implementación de una H-Net (Hierarchical Network) que opera a nivel de byte, entrenada con el framework beetle-hnet del repositorio de Suchir Salhan. Su propósito es estudiar técnicas de chunking dinámico y tokenización byte-level, no la generación de texto generalista.

El modelo tiene 22.785.088 parámetros totales, un tamaño muy reducido que lo sitúa en la categoría de modelos pequeños de investigación. Se entrenó durante 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre los idiomas inglés, turco y finés, con una arquitectura denominada "ali" y un objetivo de entrenamiento de tipo "ratio" con decodificación de chunking mediante media móvil exponencial (ema). La semilla utilizada fue la 1.

Su relevancia es fundamentalmente metodológica: forma parte de una familia de experimentos sobre segmentación adaptativa de secuencias a nivel de byte, un área de interés para quienes investigan alternativas a la tokenización subword clásica (BPE, WordPiece). No está pensado para uso en producción ni para tareas de NLP convencionales, y de hecho no cuenta con descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (variante "ali", framework beetle-hnet) |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 bytes por secuencia de entrenamiento (no se documenta contexto de inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés, turco y finés (idiomas de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con tensores tied almacenados una sola vez), más checkpoints PyTorch `training_state/checkpoint.pt` |

## Arquitectura y entrenamiento

La arquitectura es una H-Net de nivel de byte, es decir, un modelo jerárquico que procesa la entrada como secuencia de bytes en lugar de tokens subword. El framework beetle-hnet organiza el entrenamiento en fases con un schedule logarítmico en base 2 (pasos 0, 1, 2, 4, 6, 8, 16, ..., 2^k desde el inicio de cada fase de objetivo, más el paso final), y guarda una rama `step-N` por cada checkpoint conservado. La variante "ali" se entrena con un objetivo de tipo "ratio" y un mecanismo de dechunking basado en media móvil exponencial (ema).

El entrenamiento consistió en 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre un corpus multilingüe limitado a inglés, turco y finés, con semilla 1. El repositorio incluye, además de los pesos, el estado completo del entrenador (`training_state/checkpoint.pt`) para poder reanudar el entrenamiento, la configuración de entrenamiento (`training_config.yaml`) y, en la rama `main`, el log de entrenamiento (`log.jsonl`), un `final.json` y las pruebas de frontera FLORES+ en el directorio `probe/`. Los tensores tied se almacenan una sola vez en `model.safetensors`, y `config.json["tied_weights"]` mapea los nombres eliminados a los almacenados.

## Capacidades

- Procesamiento de secuencias a nivel de byte, sin vocabulario subword.
- Chunking dinámico de la entrada mediante el mecanismo de dechunking ema.
- Entrenamiento y evaluación multilingüe limitada a inglés, turco y finés.
- Reanudación de entrenamiento desde checkpoints intermedios gracias al estado completo del trainer.
- Evaluación de fronteras de chunk mediante las pruebas FLORES+ incluidas en `probe/`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en tokenización byte-level: sirve como punto de partida para comparar H-Nets frente a tokenizadores BPE o WordPiece en tareas de segmentación.
- Estudio de chunking dinámico: el mecanismo de dechunking ema y el objetivo "ratio" permiten analizar cómo se agrupan los bytes en unidades de mayor nivel.
- Reproducción de experimentos: los checkpoints intermedios y el estado del entrenador permiten reanudar y auditar el proceso paso a paso.
- Evaluación de fronteras lingüísticas: las pruebas FLORES+ del directorio `probe/` permiten medir la calidad de la segmentación en inglés, turco y finés.
- Base para ablaciones: al ser un modelo pequeño (22,8 M de parámetros), es viable entrenar variantes con distintos schedules o semillas en hardware modesto.
- Docencia y divulgación: su tamaño reducido y su licencia Apache 2.0 lo hacen adecuado para ilustrar arquitecturas jerárquicas de byte en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 22,8 M de parámetros en fp32 los pesos ocupan aproximadamente 91 MB, por lo que cabría en cualquier GPU consumer con holgura.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 1-2 GB de VRAM sería suficiente para cargar los pesos.
- Cabe en GPU consumer: sí, previsiblemente en cualquier modelo con 2 GB o más de VRAM (GTX 1050, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el uso previsto es mediante PyTorch y `huggingface_hub`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_lexmem-v1-vgate_s1 | 22,8 M | 1024 bytes (entrenamiento) | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face |
| Modelos BPE subword pequeños | no disponible | no disponible | Tokenización subword clásica | variable | amplia |
| Otras variantes de beetle-hnet | no disponible | no disponible | H-Net byte-level | no disponible | no disponible |

No se dispone de datos de rendimiento comparables para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo de investigación: no está entrenado ni ajustado para generación de texto, diálogo ni tareas de NLP de propósito general.
- Cobertura lingüística muy limitada: solo inglés, turco y finés; no se garantiza comportamiento en otros idiomas.
- Contexto de entrenamiento corto (1024 bytes); no se documenta capacidad de extrapolación a secuencias más largas.
- Sin datos de benchmarks publicados, por lo que no es posible evaluar su calidad objetiva frente a alternativas.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un modelo byte-level sin ajuste por RLHF, no se han aplicado salvaguardas.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un artefacto de investigación no se recomienda su despliegue en producción sin una evaluación propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni soporte documentado.
- La fecha de creación indicada (2026-11-08) es futura respecto a la redacción habitual de fichas; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_lexmem-v1-vgate_s1
- Organización en Hugging Face: https://huggingface.co/AdaptiveChunking
- Framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
