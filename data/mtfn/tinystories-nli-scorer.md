# mtfn/tinystories-nli-scorer

## Resumen

`mtfn/tinystories-nli-scorer` es un modelo de clasificación de texto tipo cross-encoder, afinado a partir de `microsoft/MiniLM-L12-H384-uncased`, que emite seis logits independientes para evaluar si una historia generada al estilo TinyStories cumple una serie de instrucciones narrativas (final malo, moraleja, giro inesperado, foreshadowing, conflicto y coherencia con un resumen). Lo desarrolla el usuario `mtfn` y se publica como utilidad interna de un benchmark de curso, no como modelo generativo.

El modelo no genera texto: actúa como evaluador o scorer. Recibe una ventana de historia de 256 tokens (construida a partir del inicio y el final de la historia normalizada) y, para la salida de resumen, un par (resumen, ventana). Cada salida es un único logit que se calibra mediante una transformación de Platt almacenada en `config.json` (`scorer.platt`), de modo que `p = sigmoid(a * logit + b)`.

Su relevancia es acotada pero concreta: ofrece un evaluador ligero (33,4 millones de parámetros, repo de 0,1 GB) para pipelines de validación automática de historias sintéticas en inglés, con la advertencia explícita del autor de que las puntuaciones solo son válidas si se reproduce exactamente el preprocesado del benchmark original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), cross-encoder con 6 cabezas de clasificación |
| Parametros totales | 33.362.310 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (ventana de historia; entradas padding a 256) |
| Tipos de cuantizacion | no disponible (repo en safetensors; compatible con text-embeddings-inference) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/MiniLM-L12-H384-uncased`, un encoder BERT de 12 capas y dimensión oculta 384, y se afina como cross-encoder con seis salidas escalares. Las cinco primeras evalúan propiedades de la propia historia (BadEnding, MoralValue, Twist, Foreshadowing, Conflict); la sexta evalúa la correspondencia entre un resumen y la ventana de historia. La entrada se construye tomando 256 tokens a partir del inicio y el final de la historia normalizada, con un hueco configurable (`scorer.window_gap`) entre ambas partes y truncando el resumen a `scorer.summary_max_tokens`; todo se rellena hasta 256 tokens.

El entrenamiento usa etiquetas derivadas de TinyStoriesInstruct, con las entradas de entrenamiento 5.000–205.000 y calibración sobre 300.000–310.000. La calibración por salida se guarda como pares `[a, b]` en `scorer.platt`, aplicados sobre el logit. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO (no aplicable en un clasificador, pero no se indica ningún ajuste adicional más allá del fine-tuning supervisado).

## Capacidades

- Clasificación multi-salida: seis logits independientes por par de entrada (historia o resumen + historia).
- Evaluación de estructura narrativa: final malo, presencia de moraleja, giro inesperado, foreshadowing y conflicto.
- Verificación de coherencia resumen-historia mediante la sexta salida.
- Calibración probabilística por salida (Platt scaling) para obtener probabilidades a partir de los logits.
- Procesamiento de ventanas de 256 tokens con estrategia cabeza-cola para cubrir inicio y final de historias largas.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Validación automática de historias sintéticas: en un pipeline de generación con TinyStories, el scorer filtra las historias que no cumplen la instrucción (por ejemplo, exigir moraleja o giro) antes de enviarlas a revisión humana.
- Control de calidad en benchmarks de instrucción: permite medir la tasa de cumplimiento de restricciones narrativas en modelos pequeños entrenados con TinyStoriesInstruct, usando las seis salidas como métricas separadas.
- Filtrado de datasets de entrenamiento: descartar muestras generadas que no presentan conflicto o cuyo final no coincide con el resumen, reduciendo ruido antes de un nuevo ciclo de fine-tuning.
- Evaluación de coherencia resumen-texto: la salida 5 actúa como verificador de fidelidad entre un resumen y la historia completa, útil para auditar pipelines de summarization en dominios infantiles.
- Detección de foreshadowing y giros: análisis estructural de historias para estudiar qué configuraciones de decodificación favorecen estos recursos narrativos.
- Prototipado docente: por su tamaño (33,4 M de parámetros, 0,1 GB), se puede desplegar en CPU o GPU consumer para prácticas de evaluación de modelos generativos sin infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (33,4 M de parámetros, ~134 MB de pesos); en fp16, ~67 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; también viable en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo moderno (GTX 1650, RTX 3060, RTX 4090, etc.) y en hardware integrado.
- Opciones de despliegue: `transformers` (librería declarada), `text-embeddings-inference` (tag `text-embeddings-inference`), endpoints compatibles (`endpoints_compatible`); no se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mtfn/tinystories-nli-scorer | 33,4 M | 256 tokens | Clasificación multi-salida (6 logits) | MIT | Hugging Face |
| microsoft/MiniLM-L12-H384-uncased | ~33 M | 512 tokens | Encoder general (MLM/embeddings) | MIT | Hugging Face |
| cross-encoder/nli-MiniLM2-L6-H768 | ~22 M | 512 tokens | NLI (3 clases) | Apache 2.0 | Hugging Face |

La comparación es aproximada: los dos alternativos son encoders generales o clasificadores NLI estándar, mientras que este modelo está especializado en atributos narrativos de TinyStories y no es intercambiable fuera de ese dominio.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado sobre TinyStoriesInstruct y pensado para historias infantiles sintéticas en inglés; su rendimiento fuera de ese dominio no está caracterizado.
- Dependencia estricta del preprocesado: el autor advierte que las puntuaciones solo son significativas con el preprocesado exacto del benchmark (ventana de 256 tokens, `head_frac_*`, `window_gap`, `summary_max_tokens`); usarlo con otra tokenización o longitud invalida la calibración.
- Recomendación de revisión fijada: el autor pide usar una revisión (`revision`) fijada para evitar cambios en los pesos o la configuración.
- Riesgo de alucinación: no aplica como modelo generativo, pero los logits pueden ser poco fiables en historias atípicas o fuera de distribución.
- Sesgos: no documentados en la información disponible; al derivarse de TinyStories, puede heredar sesgos de ese corpus sintético.
- Idioma: solo inglés; no se garantiza comportamiento en castellano u otros idiomas.
- Licencia MIT: permite uso comercial, pero el modelo base (`microsoft/MiniLM-L12-H384-uncased`) también es MIT, por lo que no se identifican restricciones adicionales.
- Advertencia de producción: es una utilidad de benchmark de curso, sin métricas publicadas de robustez ni validación externa; no debe tratarse como evaluador de calidad narrativa de propósito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mtfn/tinystories-nli-scorer
- Modelo base: https://huggingface.co/microsoft/MiniLM-L12-H384-uncased
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
