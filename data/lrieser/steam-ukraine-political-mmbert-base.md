# LRieser/steam-ukraine-political-mmbert-base

## Resumen

El modelo `steam-ukraine-political-mmbert-base` es un clasificador binario de texto desarrollado por LRieser, especializado en detectar si una reseña de Steam comenta la postura política de un desarrollador sobre la guerra de Rusia-Ucrania (primavera de 2022). Se trata de un fine-tuning de `jhu-clsp/mmBERT-base`, la variante multilingüe de la arquitectura ModernBERT, que añade una cabeza de clasificación de secuencia con dos etiquetas (`political` y `non_political`). El modelo está pensado para resolver un problema concreto: distinguir entre reseñas que abordan la dimensión sociopolítica de un anuncio corporativo y reseñas que solo discuten el producto (jugabilidad, errores, rendimiento, valor, etc.).

El modelo tiene aproximadamente 307 millones de parámetros y una longitud de contexto de 256 tokens, suficiente para el texto típico de una reseña de Steam. Fue entrenado sobre 40.011 reseñas reales de juegos cuyos desarrolladores publicaron un comunicado sobre la guerra, etiquetadas automáticamente por un modelo profesor (DeepSeek V3.2) y validadas en un conjunto de prueba de 4.446 muestras. Su relevancia radica en que ofrece una herramienta multilingüe (12 idiomas) y de código abierto (Apache-2.0) para el análisis de la recepción de activismo político corporativo en comunidades de jugadores, un fenómeno creciente en la industria del videojuego.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder-only transformer) |
| Parametros totales | 307.531.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (maximo de entrenamiento/evaluacion) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, ru, zh, pl, tr, de, pt, es, ko, fr, cs, uk |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `jhu-clsp/mmBERT-base`, que es la versión multilingüe de ModernBERT, una arquitectura de transformer encoder-only optimizada para eficiencia y velocidad. Se añade una cabeza de clasificación de secuencia con dos salidas. El entrenamiento se realizó con 40.011 reseñas de Steam de juegos cuyos desarrolladores publicaron un comunicado sobre la guerra, recopiladas en las cuatro semanas anteriores y posteriores al anuncio. Las etiquetas fueron generadas por un modelo profesor DeepSeek V3.2 (`deepseek-chat`, temperatura 0.2) a partir de un codebook escrito y cinco ejemplos few-shot; la proporción de reseñas políticas es del 13,7%. La distribución de idiomas es: inglés 41%, ruso 13%, chino simplificado 11%, polaco 7%, turco 4%, alemán 4%, entre otros.

El entrenamiento utilizó pérdida de entropía cruzada con pesos de clase balanceados (aproximadamente 6,3x para la clase política), optimizador AdamW con tasa de aprendizaje 2e-5, programación coseno con warmup ratio 0.1, weight decay 0.01, gradiente clipping 1.0, batch size 64, longitud máxima de secuencia 256 y precisión fp32. Se entrenaron 3 épocas con una evaluación por época en un split de early stopping de 4.002 muestras; el checkpoint liberado corresponde a la época 2, que obtuvo el mejor macro-F1 (0.9283). El conjunto de prueba final, con 4.446 reseñas, no se utilizó para ninguna decisión de entrenamiento ni de umbral.

## Capacidades

- Clasificación binaria de texto: distingue entre reseñas con contenido político y reseñas de discusión ordinaria del producto.
- Multilingüe real: clasifica la reseña en su idioma original sin necesidad de traducción, cubriendo 12 idiomas.
- Formato de entrada estructurado: requiere un prefijo de contexto que indica la recomendación del revisor (positiva/negativa) y si la reseña es anterior o posterior al anuncio del desarrollador. Ejemplo: `[negative review, post-announcement] <texto>`.
- Decisión configurable: permite usar el umbral por defecto (argmax 0.50) que favorece el recall, o un umbral recomendado de 0.92 que equilibra precisión y recall y reproduce la proporción esperada de reseñas políticas.
- Compatibilidad con `transformers` y `pipeline`: se puede cargar con `AutoModelForSequenceClassification` y usar con `pipeline("text-classification")`.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es un clasificador de propósito específico.

## Casos de uso

- Análisis de recepción de activismo corporativo: un estudio de mercado puede usar el modelo para medir qué porcentaje de reseñas reacciona a la postura política de un desarrollador tras un anuncio, comparando períodos pre y post.
- Moderación de comunidades de Steam: los administradores pueden filtrar automáticamente reseñas con contenido político para mantener los foros centrados en el producto, aplicando el umbral 0.92 para reducir falsos positivos.
- Investigación académica en sociología de videojuegos: investigadores pueden analizar cómo cambia el discurso de los jugadores ante el activismo político corporativo, utilizando el modelo para etiquetar grandes volúmenes de reseñas multilingües sin traducción manual.
- Monitorización de reputación para desarrolladores: un estudio de desarrollo puede detectar picos de reseñas políticas tras un comunicado y evaluar el impacto en la percepción pública del juego.
- Automatización de etiquetado de datasets: el modelo puede servir como anotador automático para crear conjuntos de datos de entrenamiento de otros clasificadores o análisis de sentimiento en el dominio de reseñas de juegos.
- Detección de review bombing político: permite identificar campañas coordinadas de reseñas negativas con carga política, distinguiéndolas de críticas genuinas al producto.
- Análisis comparativo entre idiomas: al clasificar en el idioma original, facilita estudios cross-culturales sobre la recepción de temas geopolíticos en distintas comunidades lingüísticas.

## Benchmarks y rendimiento

Los siguientes resultados son declarados por el autor del modelo y no han sido verificados de forma independiente. Corresponden a un conjunto de prueba de 4.446 reseñas etiquetadas por el profesor (609 políticas, 13,7%), disjunto del entrenamiento.

| Metrica | Umbral 0.50 (argmax) | Umbral 0.81 | Umbral 0.92 (recomendado) |
|---|---|---|---|
| Acuerdo con el profesor | 0.9550 | 0.9573 | 0.9591 |
| Precision clase politica | 0.792 | 0.826 | 0.853 |
| Recall clase politica | 0.911 | 0.872 | 0.847 |
| F1 clase politica | 0.847 | 0.848 | 0.850 |
| Macro-F1 | 0.9105 | 0.9117 | 0.9132 |
| Predicted political share | 15.7% (según la model card) | no disponible | 13.9% (aprox.) |

El model-index de Hugging Face reporta específicamente los valores de macro-F1 (0.9105 a 0.50 y 0.9132 a 0.92), precisión política 0.853 y recall político 0.847 a 0.92.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB para los pesos (307M x 4 bytes) más activaciones y overhead, recomendando al menos 2-3 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (RTX 3060, RTX 4060, A10G, etc.) es suficiente para inferencia por lotes.
- Compatible con GPUs de consumo: sí, el modelo es ligero y puede ejecutarse en tarjetas de gama media sin problemas.
- Opciones de despliegue: compatible con `transformers` (pipeline y carga directa), `text-embeddings-inference` y `endpoints` de Hugging Face (según los tags del repositorio). También puede exportarse a ONNX para despliegue optimizado.
- Latencia y throughput: no disponible en la información proporcionada; al ser un modelo encoder de 307M, la latencia esperada en una GPU moderna es del orden de milisegundos por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Idiomas | Licencia | Uso |
|---|---|---|---|---|---|---|
| `steam-ukraine-political-mmbert-base` | 307M | ModernBERT | 256 tokens | 12 | Apache-2.0 | Clasificador de relevancia politica en reseñas |
| `jhu-clsp/mmBERT-base` | ~307M | ModernBERT | no disponible | 12 | Apache-2.0 | Modelo base multilingüe, sin fine-tuning |
| `xlm-roberta-base` | 278M | Transformer (RoBERTa) | 512 tokens | 100+ | MIT | Clasificador multilingüe generico, sin especializacion en reseñas politicas |

No se han publicado benchmarks comparativos de `steam-ukraine-political-mmbert-base` frente a otros clasificadores de reseñas de Steam en la información disponible. Las diferencias clave son la especialización temática y el uso de un prefijo de contexto específico.

## Limitaciones y advertencias

- Especialización estrecha: el modelo fue entrenado exclusivamente para detectar contenido político relacionado con la guerra de Ucrania en reseñas de Steam de la primavera de 2022. Puede no generalizar a otros temas políticos ni a otros períodos.
- Dependencia del prefijo de contexto: el rendimiento puede degradarse si se omite el prefijo `[positive/negative review, pre/post-announcement]`, ya que el modelo fue entrenado con ese formato.
- Etiquetas generadas por un LLM: las etiquetas provienen de DeepSeek V3.2 y no fueron verificadas por humanos, por lo que existe ruido en el conjunto de entrenamiento que puede afectar a la precisión en casos ambiguos.
- Desequilibrio lingüístico: el inglés representa el 41% del entrenamiento, lo que puede reducir el rendimiento en idiomas con menos muestras (checo, ucraniano, coreano, etc.).
- Umbral calibrado en un dominio específico: el umbral recomendado de 0.92 se calibró en un split de desarrollo de reseñas de Steam; si se aplica a otros dominios, la distribución de probabilidades puede variar y requerir recalibración.
- Sin capacidades generativas: el modelo no puede generar texto ni responder preguntas; solo produce una probabilidad binaria.
- Contexto limitado a 256 tokens: las reseñas más largas se truncarán, lo que podría perder información relevante al final del texto.
- Licencia Apache-2.0 permite uso comercial, pero el usuario es responsable de la aplicación y de posibles sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LRieser/steam-ukraine-political-mmbert-base
- Modelo base `jhu-clsp/mmBERT-base`: https://huggingface.co/jhu-clsp/mmBERT-base
- Blog de presentación de mmBERT: https://huggingface.co/blog/mmbert
