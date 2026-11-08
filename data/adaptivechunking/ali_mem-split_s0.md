# AdaptiveChunking/ali_mem-split_s0

## Resumen

ali_mem-split_s0 es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de un H-Net (modelo jerárquico con segmentación dinámica de secuencias) de nivel de byte, entrenado con el framework open source beetle-hnet. El modelo emplea la arquitectura denominada `ali` con objetivo `ratio`, decodificación por EMA (`dechunk=ema`) y un esquema de checkpoints por fases. Su propósito no es la generación de texto convencional, sino servir como banco de pruebas reproducible para investigar tokenización dinámica y chunking adaptativo a nivel de byte.

El modelo cuenta con 22.785.088 parámetros (aproximadamente 22,8 M), un tamaño muy reducido que lo sitúa en la categoría de modelos pequeños de investigación. Fue entrenado durante 6.000 pasos con batches de 32 secuencias de 1.024 bytes, sobre tres idiomas: inglés, turco y finés. La elección de estos idiomas (con morfología aglutinante el turco y el finés) es coherente con el interés del proyecto en la segmentación adaptativa de unidades subpalabra.

La relevancia actual del modelo es metodológica más que de producto: expone públicamente no solo los pesos, sino también el estado completo del entrenador (`training_state/checkpoint.pt`) en cada checkpoint, lo que permite reanudar o auditar el entrenamiento. Está publicado bajo licencia Apache 2.0 y el repositorio ocupa 7,2 GB, un tamaño desproporcionado respecto a los parámetros debido precisamente a la inclusión de estados de entrenamiento completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (beetle-hnet), variante `ali`, nivel de byte, con chunking dinámico |
| Parametros totales | 22.785.088 (22,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1.024 bytes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés, turco y finés (idiomas de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez) y checkpoint del entrenador en PyTorch (`checkpoint.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un H-Net de nivel de byte, es decir, opera directamente sobre bytes en lugar de sobre tokens de un vocabulario subpalabra predefinido, y aplica una jerarquía de segmentación dinámica (chunking) sobre la secuencia de entrada. La variante concreta es `ali`, con objetivo de entrenamiento `ratio` y decodificación de chunks mediante media móvil exponencial (`dechunk=ema`). No se especifica en la información disponible si el backbone interno es un transformer puro, un híbrido o un modelo recurrente jerárquico.

El entrenamiento se realizó con el framework beetle-hnet durante 6.000 pasos, con un batch efectivo de 32 secuencias de 1.024 bytes por paso, sobre un corpus multilingüe en inglés, turco y finés (semilla 0). No se detalla el número total de tokens vistos ni la composición exacta del dataset, ni si hubo fases de RLHF o DPO. La innovación técnica destacable es el esquema de checkpoints por fases: se conservan checkpoints en una programación logarítmica en base 2 (pasos 0, 1, 2, 4, 6, 8, 16, …, 2^k desde el inicio de cada fase del objetivo, más el paso final), cada uno con pesos, configuración, configuración de entrenamiento y estado reanudable del entrenador. El repositorio incluye además sondas de frontera sobre FLORES+ (`probe/`) una vez finalizado el entrenamiento.

## Capacidades

- Modelado de lenguaje a nivel de byte con segmentación dinámica de secuencias (chunking adaptativo).
- Entrenamiento y evaluación multilingüe en inglés, turco y finés.
- Reanudación exacta del entrenamiento desde cualquier checkpoint conservado, gracias al estado completo del entrenador.
- Auditoría de la dinámica de chunking a lo largo del entrenamiento mediante los checkpoints por fases.
- Evaluación de fronteras de segmentación mediante las sondas FLORES+ incluidas en la rama `main`.
- Pesos atados con mapa explícito en `config.json["tied_weights"]`, lo que facilita la reconstrucción del modelo.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en tokenización dinámica: el modelo sirve como referencia reproducible para comparar estrategias de chunking (por ejemplo, `ali` frente a otras variantes) sobre el mismo corpus y semilla.
- Estudio de morfología aglutinante: al incluir turco y finés, permite analizar cómo un modelo de nivel de byte segmenta palabras con alta productividad morfológica sin vocabulario subpalabra.
- Reproducción de experimentos: el estado completo del entrenador en cada checkpoint permite reanudar un entrenamiento exactamente en el paso deseado y verificar resultados de terceros.
- Análisis de dinámica de entrenamiento: los checkpoints en escala log2 por fases permiten trazar la evolución de las fronteras de chunking a lo largo del entrenamiento.
- Evaluación de sondas de frontera: las sondas FLORES+ incluidas permiten medir la calidad de la segmentación en textos multilingües de referencia.
- Docencia y experimentación con presupuesto reducido: con 22,8 M de parámetros, el modelo puede entrenarse y ejecutarse en hardware modesto, lo que lo hace adecuado para cursos y prototipos de investigación.
- Base para ablaciones: al estar bajo Apache 2.0 y con el framework público, puede modificarse y reentrenarse para estudiar variantes de la arquitectura H-Net.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 22,8 M de parámetros, los pesos en precisión completa ocupan del orden de 90 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia, y una RTX 3060 o superior basta para reentrenar con batches pequeños.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer moderna; el cuello de botella real es el estado del entrenador y el tamaño del repositorio (7,2 GB), no los pesos.
- Opciones de despliegue: la librería declarada es PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_mem-split_s0 | 22,8 M | no disponible (entrenado a 1.024 bytes) | H-Net de nivel de byte con chunking dinámico | Apache 2.0 | Hugging Face |
| Modelos de tokenización byte-level convencionales (p. ej. ByT5-small) | ~300 M | no disponible | Transformer de nivel de byte sin chunking dinámico | Apache 2.0 | Público |
| Modelos subpalabra pequeños (p. ej. GPT-2 small) | ~124 M | 1.024 tokens | Transformer con vocabulario BPE | MIT | Público |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, enfoque y licencia.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción, y no se documentan capacidades de generación de texto de calidad.
- Idiomas limitados: solo se entrenó en inglés, turco y finés; no hay evidencia de generalización a otros idiomas, incluido el español.
- Contexto corto: el entrenamiento usó secuencias de 1.024 bytes, muy por debajo de los estándares actuales; no se documenta soporte para contextos mayores.
- Riesgo de alucinación: no evaluado; al ser un modelo de nivel de byte de pequeño tamaño, la coherencia semántica a largo plazo es previsiblemente limitada.
- Sesgos: no se documenta ningún análisis de sesgos; el corpus de entrenamiento no está descrito en detalle.
- Licencia Apache 2.0: permite uso comercial, pero al no existir evaluación de calidad ni de seguridad, su uso en producción no está respaldado por el autor.
- Tamaño del repositorio: 7,2 GB frente a 22,8 M de parámetros, debido a los estados completos del entrenador; conviene descargar solo las revisiones necesarias.
- Sin pipeline declarado: no se especifica una tarea de Hugging Face (`pipeline: no disponible`), lo que indica que la carga directa con `transformers` no está garantizada y requiere el código de beetle-hnet.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-split_s0
- Organización en Hugging Face: https://huggingface.co/AdaptiveChunking
- Framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Paper: no disponible
- Blog o demo: no disponible
