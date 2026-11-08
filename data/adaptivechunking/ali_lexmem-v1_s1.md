# AdaptiveChunking/ali_lexmem-v1_s1

## Resumen

`ali_lexmem-v1_s1` es un modelo experimental de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de un H-Net (hierarchical network) de nivel de byte entrenado con el framework `beetle-hnet`, bajo una arquitectura interna denominada `lexmem_v1` y un objetivo de entrenamiento de tipo `ratio`. No es un modelo conversacional ni un LLM generativo al uso: es un artefacto de investigación orientado al estudio de la tokenización dinámica y el chunking adaptativo sobre flujos de bytes.

El modelo es extremadamente pequeño, con 22.719.553 parámetros totales (aproximadamente 22,7 millones), y fue entrenado durante 6.000 pasos con lotes de 32 secuencias de 1.024 bytes, sobre tres idiomas: inglés (`en`), turco (`tr`) y finés (`fi`). Esta selección lingüística es típica de estudios de segmentación morfológica y tokenización, ya que el turco y el finés son lenguas aglutinantes con alta productividad morfológica.

Su relevancia es puramente investigadora: explora cómo un modelo puede aprender representaciones a nivel de byte con mecanismos de chunking dinámico, un área activa en la investigación sobre tokenización libre de vocabulario. No debe confundirse con un modelo de propósito general; no hay evidencia de que soporte generación de texto, razonamiento o instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (hierarchical network) a nivel de byte, variante `lexmem_v1` |
| Parametros totales | 22.719.553 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1.024 bytes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`), turco (`tr`), finés (`fi`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados, mapeados en `config.json["tied_weights"]`), más `checkpoint.pt` de PyTorch para estado del entrenador |

## Arquitectura y entrenamiento

La arquitectura es un H-Net a nivel de byte, es decir, un modelo jerárquico que opera directamente sobre bytes sin vocabulario de tokens predefinido. La variante `lexmem_v1` implementa un mecanismo de memoria léxica con chunking dinámico (`dynamic-chunking`), y el objetivo de entrenamiento es de tipo `ratio` con un schedule desactivado (`schedule=None`) y un mecanismo de de-chunking basado en media móvil exponencial (`dechunk=ema`). El entrenamiento se realizó con semilla 1 durante 6.000 pasos, con lotes de 32 secuencias de 1.024 bytes cada una, sobre los idiomas inglés, turco y finés.

El repositorio sigue el layout de Beetle: ramas `step-N` para cada checkpoint conservado según un schedule logarítmico en base 2 (0, 1, 2, 4, 6, 8, 16, ..., 2^k desde el inicio de cada fase del objetivo, más el paso final), cada una con `model.safetensors`, `config.json`, `training_config.yaml` y el estado completo reanudable del entrenador en `training_state/checkpoint.pt`. La rama `main` contiene los pesos y configuración del último paso, además de `log.jsonl`, `final.json` y, una vez finalizado el entrenamiento, las pruebas de frontera FLORES+ en `probe/`. Los tensores atados se almacenan una sola vez y se mapean mediante `config.json["tied_weights"]`.

## Capacidades

- Modelo de investigación sobre tokenización a nivel de byte y chunking dinámico; no es un modelo de generación de texto de propósito general.
- Procesamiento de secuencias de bytes sin vocabulario fijo, lo que permite en principio manejar cualquier entrada textual a nivel de byte.
- Entrenado específicamente en inglés, turco y finés, por lo que su comportamiento está calibrado para esos tres idiomas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a los tres idiomas de entrenamiento.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Incluye pruebas de frontera FLORES+ en el repositorio para evaluar la segmentación en límites de frase.

## Casos de uso

- Investigación en tokenización libre de vocabulario: el modelo sirve como banco de pruebas para estudiar cómo un H-Net aprende límites de chunk sobre bytes, comparando con tokenizadores BPE o SentencePiece en los tres idiomas de entrenamiento.
- Estudio de morfología en lenguas aglutinantes: al incluir turco y finés, permite analizar si el chunking dinámico descubre fronteras morfológicas (sufijos, casos) sin supervisión explícita.
- Evaluación de segmentación en fronteras de frase: los probes FLORES+ incluidos en el repositorio permiten medir la calidad de los límites de chunk frente a referencias multilingües.
- Reproducción de experimentos de chunking adaptativo: las ramas `step-N` con estado completo del entrenador permiten reanudar o bifurcar el entrenamiento para estudiar la evolución del chunking a lo largo de las fases.
- Base para extensiones de investigación: al ser Apache 2.0 y pesar solo 22,7 M de parámetros, puede modificarse y reentrenarse en hardware modesto para probar variantes de `lexmem_v1`.
- Análisis de compresión y eficiencia: estudiar la relación entre longitud de chunk, tasa de compresión de bytes y calidad de representación en un modelo de tamaño reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 22,7 M de parámetros, los pesos en fp32 ocupan aproximadamente 91 MB, por lo que cabría en cualquier GPU consumer, pero no se documenta el coste de activaciones del H-Net.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) sería suficiente para cargar los pesos.
- Cabe en GPU consumer: sí, por el tamaño del modelo (22,7 M de parámetros), aunque no hay benchmarks de latencia publicados.
- Opciones de despliegue: el repositorio usa PyTorch (`library_name: pytorch`) y el framework `beetle-hnet`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ali_lexmem-v1_s1` | 22,7 M | no disponible (entrenado a 1.024 bytes) | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face (0 descargas) |
| LExMem (mbzuai-nlp) | no disponible | no disponible | Memoria léxica para tokenización | no disponible | GitHub |
| Tokenizadores BPE/SentencePiece | no aplica (no neuronal) | no aplica | Segmentación subpalabra estática | variable | Ampliamente disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación sin pipeline declarado en Hugging Face; no está pensado para uso en producción ni para generación de texto.
- Idiomas limitados a inglés, turco y finés; el comportamiento en otros idiomas no está validado.
- Contexto de entrenamiento de solo 1.024 bytes por secuencia; no se documenta capacidad de extrapolación a secuencias más largas.
- Sin datos publicados de benchmarks, sesgos o evaluación de alucinación; no se puede caracterizar su fiabilidad.
- Cero descargas y cero likes en el momento de la ficha; sin comunidad ni soporte documentado.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no ofrece capacidades de producto que justifiquen ese uso sin trabajo adicional de investigación.
- El repositorio pesa 6,1 GB debido a los múltiples checkpoints y estados del entrenador, muy por encima de lo que sugieren sus 22,7 M de parámetros.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/ali_lexmem-v1_s1
- Organización AdaptiveChunking (datasets): https://huggingface.co/AdaptiveChunking/datasets
- Framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- LExMem (mbzuai-nlp): https://github.com/mbzuai-nlp/LExMem/tree/main/method
