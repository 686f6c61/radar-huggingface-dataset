# Madras1/Yara-50M-PTBR-QA

## Resumen

Yara-50M-PTBR-QA es un modelo de lenguaje causal en portugués brasileño desarrollado por el usuario Madras1, entrenado desde cero y posteriormente ajustado de forma supervisada para responder preguntas factuales a partir de un contexto proporcionado explícitamente. Aunque emplea una arquitectura compatible con `LlamaForCausalLM`, no deriva de pesos Llama ni de ningún otro checkpoint preentrenado: tanto el tokenizer Byte-Level BPE como los 50.049.536 parámetros se inicializaron y entrenaron desde cero.

Técnicamente es un decoder denso de 12 capas, dimensión oculta 512, MLP intermedio de 1.536, 8 cabezas de atención con 4 cabezas KV (GQA), vocabulario de 24.000 tokens y una ventana máxima de 1.024 tokens. El preentrenamiento procesó 399.966.208 tokens sobre una mezcla de aproximadamente 75 % de FineWeb2 PT y 25 % de C4 PT, y el ajuste supervisado consumió 99.942.400 tokens del corpus `rag-qa-fulltext-ptbr`, con la loss aplicada únicamente a la respuesta y al token EOS.

Su relevancia es fundamentalmente experimental y educativa: se trata de un caso reproducible de ciclo completo (preentrenamiento + SFT) con recursos muy limitados (dos NVIDIA T4), pesos en `safetensors`, configuración de experimento y logs de métricas publicados. No está pensado como sistema de QA de producción, no tiene chat template y su punto fuerte observado es la extracción de respuestas cortas cuando el dato aparece literalmente en el contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal estilo Llama (`LlamaForCausalLM`) |
| Parámetros totales | 50.049.536 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens (ventana máxima) |
| Tipos de cuantización | no disponible (solo se publican pesos en `safetensors`; no se documentan versiones GGUF ni cuantizadas) |
| Idiomas soportados | portugués (`pt`), portugués brasileño (`pt-br`) como idioma principal |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | `safetensors` |
| Capas | 12 |
| Dimensión oculta | 512 |
| Dimensión del MLP intermedio | 1.536 |
| Cabezas de atención | 8 |
| Cabezas KV | 4 (GQA) |
| Vocabulario | 24.000 tokens (Byte-Level BPE) |
| Activación | SwiGLU / SiLU |
| Normalización | RMSNorm |
| Posicionamiento | RoPE |
| Embeddings | entrada y salida compartidos (tied) |
| Pipeline | `text-generation` |
| Librería | `transformers` |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-13 |

## Arquitectura y entrenamiento

La arquitectura es un decoder causal denso con las convenciones habituales de la familia Llama: RMSNorm previa a cada subcapa, activación SwiGLU en el bloque MLP, atención con RoPE y grupo de consultas compartidas (GQA) con 8 cabezas de consulta frente a 4 cabezas KV, lo que reduce el coste de la caché KV. Los embeddings de entrada y de salida están atados. La dimensión de cabeza resultante es 64 (512 / 8). No se emplean mecanismos de atención lineal, decodificación especulativa ni componentes SSM o híbridos según la información disponible.

El preentrenamiento se realizó sobre la parte real del corpus `Madras1/corpus-ptbr-v1`, con una mezcla objetivo de aproximadamente 75 % de tokens de FineWeb2 PT y 25 % de C4 PT: 399.966.208 tokens procesados, longitud de secuencia de 512, 6.103 pasos, loss de validación de 3,5559 en el paso 6.000 y perplejidad de validación de 35,02. El ajuste supervisado (SFT) usó `Madras1/rag-qa-fulltext-ptbr`, con separación de documentos entre entrenamiento, validación y prueba; la loss se aplicó solo a la respuesta y al token EOS, enmascarando contexto y pregunta. Se computaron 99.942.400 tokens con longitud de secuencia de 1.024 y 1.525 pasos, alcanzando una loss de validación de 1,1214 y una perplejidad de 3,069 en el paso 1.400. El autor advierte que ambas perplejidades no son directamente comparables, porque la del SFT solo considera los tokens supervisados de la respuesta. El entrenamiento se ejecutó en dos GPU NVIDIA T4 con DDP y precisión FP16.

## Capacidades

- Generación de texto causal en portugués brasileño, con respuestas cortas y directas.
- Respuesta a preguntas factuales ancladas a un contexto explícito (*context-grounded generation*), siguiendo el protocolo `<|contexto|>...<|pergunta|>...<|resposta|>`.
- Extracción de entidades declaradas literalmente en el contexto.
- Selección de la entidad correcta entre hechos independientes sobre sujetos distintos (capacidad observada cualitativamente).
- Manejo de nombres ficticios, lo que reduce la posibilidad de que el acierto provenga de mera memorización.
- Generación con parada en EOS; el tokenizer añade el token BOS.
- No dispone de *tool calling*, *function calling*, modo de razonamiento explícito, capacidades de agente, visión ni audio según la información disponible.
- No tiene *chat template* ni está concebido como asistente conversacional general.

## Casos de uso

- **Prototipado de pipelines RAG en portugués brasileño**: el modelo actúa como lector final del pipeline, recibiendo el contexto recuperado y la pregunta en el formato `<|contexto|>...<|pergunta|>...<|resposta|>`. Su ventana de 1.024 tokens obliga a trabajar con fragmentos cortos, útil para validar el troceado y el formato antes de escalar a un modelo mayor.
- **Extracción de respuestas sobre documentos breves y estructurados**: fichas, listados de hechos, tablas convertidas a texto o notas con relaciones explícitas (por ejemplo, «X tiene como capital Y»), devolviendo una respuesta de una línea.
- **Validación de estrategias de recuperación**: al ser un modelo diminuto y determinista con `do_sample=False`, sirve como componente estable para comprobar si un fallo proviene del recuperador o del generador.
- **Docencia y formación en entrenamiento de LLM**: el repositorio publica `experiment_config.json` y `metrics.jsonl`, lo que permite reproducir y explicar un ciclo completo de preentrenamiento y SFT con 50 M de parámetros y dos T4.
- **Baseline de investigación en QA con contexto en pt-BR**: punto de comparación reproducible para experimentos de ajuste fino, cuantización o cambios de tokenizer, con métricas de validación conocidas.
- **Inferencia en CPU o hardware muy limitado**: con unos 100 MB de pesos en FP16 (estimación derivada de los 50,05 M de parámetros reales), puede ejecutarse en portátiles sin GPU dedicada para pruebas de integración.
- **Auditoría de robustez frente a distractores y contraste temporal**: útil como sujeto de prueba para medir degradación cuando el contexto incluye información contradictoria del mismo sujeto («capital antigua» frente a «capital actual»), una fragilidad documentada por el autor.
- **Generación de borradores de conjuntos de datos de QA en pt-BR** sobre contextos cortos, siempre con revisión humana posterior, dado el riesgo de alucinación del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluación estandarizada, y advierte explícitamente que las capacidades descritas son observaciones cualitativas y no una evaluación formal de exactitud. Los únicos datos numéricos publicados son métricas de entrenamiento y validación:

| Fase | Tokens | Longitud de secuencia | Pasos | Loss de validación | Perplejidad de validación |
|---|---|---|---|---|---|
| Preentrenamiento | 399.966.208 | 512 | 6.103 | 3,5559 (paso 6.000) | 35,02 |
| SFT | 99.942.400 | 1.024 | 1.525 | 1,1214 (paso 1.400) | 3,069 |

El autor subraya que la loss de validación mide predicción de tokens y no garantiza corrección factual, y que las perplejidades de ambas fases no son comparables entre sí.

## Requisitos de hardware

- **Pesos en memoria (estimación a partir del recuento real de 50.049.536 parámetros)**: ~200 MB en FP32, ~100 MB en FP16/BF16, ~50 MB en int8, ~25 MB en int4.
- **Caché KV (estimación)**: con 12 capas, 4 cabezas KV y dimensión de cabeza 64, la caché ocupa unos 12 KiB por token en FP16, es decir, unos 12,6 MB para la ventana completa de 1.024 tokens.
- **VRAM total estimada**: en torno a 115-120 MB en FP16 con el contexto lleno, sin contar el *overhead* del runtime de PyTorch. Cabe sobradamente en cualquier GPU de consumo, incluidas GTX 1050/1650, RTX 3060, RTX 4090 y GPUs integradas, y también en CPU.
- **GPU recomendadas**: no requiere GPU dedicada. Las NVIDIA T4 usadas durante el entrenamiento son más que suficientes para inferencia. Para reentrenar o hacer SFT, dos T4 con DDP y FP16 son la configuración documentada por el autor.
- **Opciones de despliegue**: `transformers` de forma nativa (el autor recomienda una versión compatible con el formato guardado por Transformers 5); el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`. No se publican pesos GGUF, por lo que el uso con llama.cpp u Ollama exigiría una conversión previa no documentada. El uso con vLLM es plausible dada la arquitectura Llama-like, pero no está verificado en la información disponible.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No existen evaluaciones *head-to-head* publicadas entre Yara-50M-PTBR-QA y otras alternativas, y la información de búsqueda no aportó datos de rendimiento comparables. La siguiente tabla es por tanto una comparación estructural; los datos de los modelos de referencia son de conocimiento general y no proceden de la información proporcionada en esta ficha.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yara-50M-PTBR-QA | 50,0 M | 1.024 tokens | sin benchmarks publicados; solo loss y perplejidad de validación | no disponible | `safetensors` en HuggingFace |
| Pythia-70M | 70 M | 2.048 tokens | benchmarks publicados por su autor; no comparables con esta ficha | Apache 2.0 | `safetensors` en HuggingFace |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | benchmarks publicados por su autor; no comparables con esta ficha | Apache 2.0 | `safetensors` en HuggingFace |
| Modelos pt-BR de 100-200 M (por ejemplo, la familia Tucano) | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |

Diferencias estructurales destacables: Yara es el único de la comparativa entrenado específicamente en portugués brasileño para QA anclado a contexto con un protocolo de entrada propio, y el único sin licencia declarada, lo que limita su uso comercial sin aclaración previa del autor.

## Limitaciones y advertencias

- Solo 50 millones de parámetros y 400 millones de tokens de preentrenamiento: la capacidad de conocimiento paramétrico es muy reducida y depende casi por completo del contexto.
- Puede alucinar, repetir fragmentos de la pregunta o producir frases gramaticalmente imperfectas.
- Fragilidad documentada ante información temporal concurrente sobre el mismo sujeto («capital antigua» frente a «capital actual»).
- No fue entrenado específicamente para rechazar preguntas cuya respuesta no está en el contexto, por lo que puede inventar una respuesta en lugar de abstenerse.
- No dispone de chat template ni está diseñado como asistente conversacional general.
- El repositorio contiene únicamente el lector/generador: no incluye recuperador, embeddings ni base vectorial de un pipeline RAG completo.
- Los datos sintéticos o recolectados de la web pueden contener errores y sesgos; no se documenta ningún análisis de sesgo.
- No se realizó una evaluación de seguridad suficiente para usos sensibles o de alto impacto.
- La licencia no está declarada, lo que impide determinar si se permite el uso comercial.
- La ventana de 1.024 tokens limita el tamaño del contexto utilizable, muy por debajo de los estándares actuales.
- El modelo es experimental y educacional según su propio autor; la loss de validación no garantiza corrección factual.
- Antes de cualquier uso real, se recomienda evaluar con Exact Match, F1, preguntas sin respuesta, negación, contraste temporal y contextos con distractores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Madras1/Yara-50M-PTBR-QA
- Dataset de preentrenamiento: https://huggingface.co/datasets/Madras1/corpus-ptbr-v1
- Dataset de ajuste supervisado: https://huggingface.co/datasets/Madras1/rag-qa-fulltext-ptbr
- Ficheros adicionales en el repositorio: `experiment_config.json` (configuración completa del experimento) y `metrics.jsonl` (logs de entrenamiento y validación del SFT).
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los únicos enlaces verificables son los del propio repositorio de HuggingFace. No se dispone de paper, blog, repositorio de código ni demo asociados.
