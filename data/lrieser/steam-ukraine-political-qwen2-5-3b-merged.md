# LRieser/steam-ukraine-political-qwen2.5-3b-merged

## Resumen

steam-ukraine-political-qwen2.5-3b-merged es un modelo de lenguaje de 3.085.938.688 parámetros desarrollado por LRieser, basado en Qwen/Qwen2.5-3B-Instruct y afinado mediante QLoRA para clasificar reseñas de Steam según su relevancia política en el contexto de la guerra de Rusia-Ucrania (primavera de 2022). El modelo devuelve un objeto JSON con cinco campos: razonamiento, relevancia política, postura, marco de respuesta y confianza. Se entrenó con 40.011 reseñas de juegos y 8.272 comentarios a anuncios, etiquetados por un modelo teacher (DeepSeek V3.2).

Su relevancia radica en permitir el análisis automatizado del activismo corporativo y la polarización política en comunidades de videojuegos. La arquitectura es un transformer causal, el tamaño es de 3.090 millones de parámetros aproximados y la longitud de contexto no se especifica en la información disponible. Los pesos se distribuyen en bf16 con el adaptador LoRA fusionado, y el modelo es compatible con vLLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2.5) |
| Parametros totales | 3.085.938.688 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | No se publican cuantizaciones; los pesos están en bf16 (adaptador LoRA fusionado) |
| Idiomas soportados | en, ru, zh, pl, tr, de, pt, es, ko, fr, cs, uk |
| Licencia | qwen-research (uso exclusivo para investigación) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-3B-Instruct, un transformer causal de 3.085.938.688 parámetros. Se aplicó QLoRA sobre una base cuantizada a 4-bit NF4 con rank 64, alpha 64 y dropout 0.05, atacando las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. Los adaptadores se fusionaron en los pesos bf16.

El dataset de entrenamiento comprende 40.011 reseñas de juegos cuyos desarrolladores publicaron declaraciones públicas sobre la guerra, escritas en las cuatro semanas anteriores y posteriores a la declaración, más 8.272 comentarios de primer nivel sobre esos anuncios. Las etiquetas fueron generadas por un modelo teacher DeepSeek V3.2 (deepseek-chat, temperatura 0.2) siguiendo un codebook escrito y cinco ejemplos few-shot. La proporción de reseñas políticas es del 13.7%. La distribución lingüística del corpus se encabeza con inglés (41%), ruso (13%), chino simplificado (11%), polaco (7%), turco (4%) y alemán (4%).

## Capacidades

- Clasificación binaria de relevancia política en reseñas de Steam, distinguiendo entre "political" y "non_political".
- Inferencia de postura hacia la declaración del desarrollador: "support", "oppose", "ambivalent" o "n_a".
- Inferencia del marco de respuesta: "consumer_action", "political_expression", "moral_judgment" o "n_a".
- Generación de un razonamiento breve (1-3 frases) explicando las señales decisivas y un nivel de confianza ("high", "medium", "low").
- Salida en JSON estructurado con cinco campos, diseñada para integrarse en pipelines de procesamiento automatizado.
- Soporte multilingüe para 12 idiomas (en, ru, zh, pl, tr, de, pt, es, ko, fr, cs, uk), con mejor rendimiento en los idiomas más representados en el entrenamiento.
- Compatibilidad con vLLM y transformers para inferencia local o en servidores.

## Casos de uso

1. Moderación de reseñas en plataformas de juegos: el modelo puede clasificar automáticamente cada reseña como política o no política, permitiendo a los moderadores priorizar la revisión manual de aquellas que contienen contenido geopolítico. Su salida JSON con confianza facilita la integración en sistemas de cola de moderación.

2. Análisis de opinión pública durante crisis geopolíticas: investigadores pueden aplicar el modelo a conjuntos históricos de reseñas para medir la evolución de la reacción de los jugadores antes y después de declaraciones corporativas, cuantificando posturas (apoyo, oposición, ambivalencia) y marcos de respuesta.

3. Monitorización de activismo corporativo en el sector del videojuego: las empresas pueden usar el modelo para detectar patrones de crítica política dirigida a sus decisiones corporativas, identificando si la respuesta adopta formas de acción de consumo, expresión política o juicio moral.

4. Estudios académicos sobre consumo y política: el modelo permite etiquetar grandes volúmenes de reseñas multilingües de forma consistente, sustituyendo la codificación manual costosa en investigaciones sobre el impacto de los posicionamientos políticos de las empresas en el comportamiento del consumidor.

5. Análisis de comentarios en anuncios oficiales: además de reseñas, el modelo procesa comentarios de primer nivel sobre anuncios de desarrolladores, lo que permite analizar la reacción inmediata de la comunidad en las secciones de noticias y actualizaciones.

6. Enriquecimiento de bases de datos para análisis de mercado: las reseñas etiquetadas con relevancia política, postura y marco pueden integrarse en dashboards analíticos para estudiar la relación entre activismo corporativo y sentimiento del jugador en distintos mercados lingüísticos.

7. Clasificación de contenido para investigación en ciencias sociales: el modelo puede adaptarse a textos de Steam para estudiar discursos nacionalistas, boicots o meta-comentarios sobre el "politiqueo en videojuegos", proporcionando etiquetas estructuradas para análisis cuantitativo.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo, sin verificación independiente.

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Detección de relevancia política en reseñas de Steam | Conjunto holdout etiquetado por teacher (n=4.446) | Macro-F1 | 0,9168 |
| | | Precisión (clase política) | 0,848 |
| | | Recall (clase política) | 0,872 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,2 GB para los pesos (3.085.938.688 parámetros × 2 bytes) más overhead de activaciones y KV cache, lo que sitúa el consumo entre 8 y 10 GB.

- En cuantización de 4 bits (no publicada por el autor, pero posible mediante re-cuantización): ~1,6 GB para pesos, con un consumo total de 3 a 4 GB.

- GPU recomendada en bf16: A100 40/80 GB, H100, RTX 4090, RTX 4080 o cualquier GPU con al menos 10 GB de VRAM y soporte bfloat16.

- En cuantización 4-bit: viable en GPUs de consumo como RTX 3060 12 GB o RTX 4060 Ti 16 GB.

- Consumidor: sí, el modelo cabe en GPUs orientadas a consumidor de 12 GB o superiores, especialmente con cuantización manual.

- Opciones de despliegue: transformers (con device_map="auto"), vLLM (indicado en la model card como compatible), también es posible usar llama.cpp u Ollama si se exporta a GGUF, aunque no se proporciona oficialmente.

- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Se comparan modelos de tamaño similar (alrededor de 3B parámetros) disponibles en Hugging Face. Los datos de contexto, licencia y rendimiento para las alternativas no se incluyen en la información proporcionada, por lo que se indican como no disponibles para evitar especulaciones.

| Modelo | Parámetros | Contexto | Licencia | Rendimiento en clasificación política |
|---|---|---|---|---|
| steam-ukraine-political-qwen2.5-3b-merged | 3.085.938.688 | no disponible | qwen-research | Macro-F1 0,9168 (declarado) |
| Qwen/Qwen2.5-3B-Instruct | 3.085.938.688 (modelo base) | no disponible | no disponible | no disponible |
| Llama 3.2 3B Instruct | no disponible | no disponible | no disponible | no disponible |
| Phi-3.5-mini Instruct | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia de investigación: la licencia qwen-research limita el uso a fines de investigación; queda prohibido el uso comercial o en producción.

- Sesgos heredados: las etiquetas fueron generadas por un modelo teacher (DeepSeek V3.2), de modo que el modelo puede reproducir sesgos de ese sistema de etiquetado, especialmente en valoraciones de posturas políticas.

- Riesgo de alucinaciones: la salida JSON puede contener razonamientos inventados o etiquetas incorrectas en casos ambiguos; cerca del 1% de las generaciones no son parseables y deben reintentarse o marcarse como faltantes.

- Limitación temporal y de dominio: el modelo se entrenó con reseñas escritas en las cuatro semanas alrededor de declaraciones sobre la guerra de Ucrania (febrero-abril de 2022). Su rendimiento puede degradarse en otros contextos geopolíticos o en reseñas sin relación con la guerra.

- Limitación lingüística: aunque declara soporte para 12 idiomas, el corpus de entrenamiento está dominado por inglés, ruso, chino, polaco, turco y alemán; los idiomas menos representados (como checo, coreano, francés, español, portugués) probablemente muestran un rendimiento inferior.

- Parámetros y contexto no confirmados: la longitud de contexto efectiva tras el fine-tuning no se especifica oficialmente, y el repo no incluye variantes cuantizadas, por lo que el usuario debe gestionar la cuantización y el contexto a partir del modelo base.

- Dependencia de la entrada: el modelo exige un formato de prompt con la system prompt reproducida y una línea de contexto ("**Context:** ...") para funcionar según lo previsto; variaciones en el prompt pueden degradar la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LRieser/steam-ukraine-political-qwen2.5-3b-merged
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Licencia (en el repositorio): https://huggingface.co/LRieser/steam-ukraine-political-qwen2.5-3b-merged/blob/main/LICENSE
