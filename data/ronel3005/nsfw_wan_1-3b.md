# Ronel3005/NSFW_Wan_1.3b

## Resumen

NSFW Wan 1.3b es un ajuste fino (fine-tune) del modelo generativo de vídeo texto-a-vídeo Wan-AI/Wan2.1-T2V-1.3B, publicado por el usuario Ronel3005 en HuggingFace. Se trata de un modelo de 1.3 mil millones de parámetros especializado en la generación de clips cortos de contenido para adultos (NSFW) a partir de descripciones en lenguaje natural, con el objetivo declarado de servir como herramienta de investigación y creación dentro de ese dominio temático. El autor lo presenta como un modelo capaz de generar movimiento coherente de forma nativa, sin necesidad de LoRAs auxiliares.

La relevancia técnica de esta ficha no reside en el contenido en sí, sino en el proceso de entrenamiento documentado: el autor describe dos metodologías sucesivas y un fallo de "olvido catastrófico" durante la primera fase, corregido después con un entrenamiento de una sola pasada sobre un dataset mixto. Es un caso ilustrativo de cómo un ajuste agresivo sobre imágenes degrada la coherencia anatómica de un modelo de vídeo y de qué estrategias (regularización espacial constante, LR conservador, lotes pequeños) se emplean para mitigarlo.

El repositorio ocupa 105.4 GB e incluye dos series de checkpoints: la original (e1-e20) y la experimental (exp_e1-exp_e14), además de un fichero `prompting-guide.json` con convenciones de prompting extraídas de las comunidades de origen de los datos. No se han publicado resultados de benchmarks ni especificaciones detalladas de arquitectura más allá de la identificación del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer texto-a-vídeo (según model card); derivada del modelo base Wan2.1-T2V-1.3B. Detalle interno no disponible |
| Parámetros totales | 1.3 mil millones |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible. Los modelos T2V no exponen ventana de contexto conversacional; el autor no especifica límite de tokens de prompt |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible. Las leyendas de entrenamiento proceden de comunidades de Reddit en inglés, por lo que el rendimiento esperable es mejor en inglés, aunque el autor no lo confirma |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |
| Tipo de tarea | texto-a-vídeo (T2V) |
| Modelo base | Wan-AI/Wan2.1-T2V-1.3B |
| Checkpoints incluidos | Serie original `wan_1.3B_e1`-`e20`; serie experimental `wan_1.3B_exp_e1`-`exp_e14`; recomendado por el autor: `wan_1.3B_exp_e14.safetensors` |
| Tamaño del repositorio | 105.4 GB |
| Fecha de creación | 2026-09-28 (según los metadatos de HuggingFace) |
| Fecha de actualización | 2026-09-28 (según los metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo parte de Wan2.1-T2V-1.3B, un transformer de difusión para texto-a-vídeo de 1.3B de parámetros. La model card no aporta detalles adicionales sobre el número de capas, el compresor latente, el codificador de texto ni la resolución o duración de vídeo soportadas, por lo que esos datos quedan como no disponibles. Lo que sí documenta el autor es la estrategia de ajuste fino, que se ejecutó en dos variantes.

La primera variante, descrita como legacy, dividió el entrenamiento en dos fases: las épocas 1-10 se entrenaron principalmente sobre un corpus masivo de imágenes NSFW y las épocas 11-20 exclusivamente sobre vídeo. Según el autor, la fase de imagen fue "demasiado agresiva" y provocó olvido catastrófico: el modelo perdió la noción de anatomía coherente (rostros, manos) y la fase posterior de vídeo no logró recuperarla, lo que produjo artefactos descritos como "body horror" y una degradación notable de la calidad a partir de la época 3. La segunda variante, experimental y recomendada, sustituye ese esquema por una única pasada de entrenamiento sobre un dataset mixto de 30.000 clips de vídeo y 20.000 imágenes estáticas presentadas simultáneamente, con una tasa de aprendizaje más conservadora, lotes más pequeños y un calendario de entrenamiento más corto. La justificación técnica es que la presencia constante de imágenes actúa como regularizador espacial y evita la deriva anatómica.

En cuanto a los datos, el autor indica que el corpus procede de las 1.000 publicaciones con más interacción de aproximadamente 1.250 subreddits NSFW distintas, seleccionadas para cubrir un espectro amplio de temas, estilos visuales, arquetipos de personajes y acciones. Las leyendas de entrenamiento reutilizan las convenciones de lenguaje y etiquetado propias de esas comunidades, y el repositorio incluye un `prompting-guide.json` con un análisis de palabras clave y frases asociadas a cada subreddit de origen. No se documenta el uso de RLHF, DPO ni ningún otro método de alineación posterior.

## Capacidades

- Generación de vídeo corto a partir de prompts de texto, con movimiento coherente nativo según el autor (sin LoRAs auxiliares de movimiento).
- Generación de imágenes estáticas: la serie original e1-e3 destaca en estilo y detalle, aunque el propio autor advierte que la calidad se degrada después de la época 3.
- Cobertura temática amplia dentro del dominio NSFW: la model card afirma que el modelo comprende "todo el espectro NSFW", incluyendo estilos visuales, arquetipos de personajes y acciones descritas en lenguaje natural.
- Base para entrenamiento de LoRAs: el autor recomienda explícitamente `wan_1.3B_exp_e14.safetensors` como punto de partida para ajustes posteriores.
- Adherencia a convenciones de prompting específicas del dominio, documentadas en `prompting-guide.json`.
- No se documenta soporte de tool calling, function calling, uso agéntico, razonamiento multi-paso, visión, audio ni modo de pensamiento. No aplica a un modelo T2V.
- Capacidad multilingüe: no documentada. Todas las referencias de entrenamiento apuntan a texto en inglés.

## Casos de uso

- Investigación sobre moderación de contenido: el modelo puede emplearse para generar muestras sintéticas de contenido para adultos y evaluar la robustez de clasificadores y filtros de seguridad en plataformas, un escenario en el que disponer de un generador controlado permite crear conjuntos de prueba difíciles de obtener por otras vías.
- Red teaming de sistemas de seguridad infantil y de verificación de edad: generar material de prueba etiquetado para validar detectores automáticos antes de desplegarlos en producción.
- Estudio académico de olvido catastrófico en modelos multimodales: el repositorio documenta dos metodologías de ajuste con resultados divergentes sobre el mismo modelo base, lo que lo convierte en un caso de estudio reproducible sobre regularización espacial durante el fine-tuning de modelos de vídeo.
- Entrenamiento de LoRAs de estilo: investigadores y creadores pueden partir de `wan_1.3B_exp_e14.safetensors` para ajustar estilos, iluminación o composición concretos, aprovechando que el autor lo señala como el checkpoint con mejor equilibrio entre fidelidad y coherencia visual.
- Generación de vídeo para creadores de contenido para adultos en jurisdicciones donde la actividad es legal: el modelo permite producir clips cortos a partir de descripciones textuales sin depender de modelos propietarios con filtros de contenido.
- Investigación sobre consistencia temporal en modelos T2V de parámetros reducidos: con 1.3B de parámetros, permite experimentar con técnicas de coherencia temporal en hardware asequible y comparar contra el modelo base sin ajustar.
- Análisis de sesgos y representación: el dataset de entrenamiento procede de comunidades concretas de Reddit, por lo que el modelo sirve para estudiar cómo se traducen los sesgos de esas comunidades a la generación visual y qué arquetipos se sobrerrepresentan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FVD, CLIP score, VBench ni similares) ni comparaciones numéricas con el modelo base o con alternativas. Las únicas evaluaciones son cualitativas y las aporta el propio autor.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del número de parámetros y del tamaño del repositorio, no datos publicados por el autor. No hay mediciones oficiales de VRAM, latencia ni throughput.

- Peso de un único checkpoint: aproximadamente 2.6 GB en FP16 y 5.2 GB en FP32 (estimación a partir de 1.3B parámetros). El repositorio completo, con las dos series de checkpoints, ocupa 105.4 GB.
- VRAM para inferencia: no disponible como dato medido. En modelos T2V de este tamaño, el consumo real lo dominan los tensores latentes y la atención temporal, no los pesos, por lo que la VRAM necesaria crece de forma aproximadamente lineal con el número de fotogramas y con la resolución. Se recomienda validar empíricamente antes de planificar un despliegue.
- GPU recomendadas: no disponibles. Por tamaño de pesos, un modelo de 1.3B en FP16 cabe holgadamente en cualquier GPU de consumo con 8 GB o más, pero el presupuesto de memoria para la generación de vídeo es una incógnita no documentada.
- Viabilidad en GPU de consumo: probable en GPUs tipo RTX 3060 12 GB, RTX 4070, RTX 4090 o superiores, siempre que se ajusten resolución y número de fotogramas. No confirmado por el autor.
- Opciones de despliegue: no disponibles. El autor no menciona compatibilidad con Diffusers, ComfyUI, vLLM, TGI ni ninguna otra herramienta. Dado que el formato es safetensors y el modelo base pertenece a la familia Wan, la integración previsible sería a través del ecosistema de Diffusers o de nodos para ComfyUI, pero esto no está verificado en la información proporcionada.
- Consideración práctica: descargar el repositorio completo supone 105.4 GB de transferencia y almacenamiento. Conviene descargar únicamente el checkpoint deseado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NSFW Wan 1.3b | 1.3B | no disponible | creativeml-openrail-m | HuggingFace, autor individual | Fine-tune NSFW con dos series de checkpoints |
| Wan-AI/Wan2.1-T2V-1.3B | 1.3B | no disponible en la información proporcionada | no disponible en la información proporcionada | HuggingFace | Modelo base sin ajuste NSFW; no se han publicado comparativas directas entre ambos |

No se dispone de información suficiente en la documentación consultada para comparar este modelo con otras alternativas de generación de vídeo de tamaño similar (por ejemplo, otros modelos T2V de la franja de 1B-2B parámetros). Cualquier comparación numérica de rendimiento, contexto o calidad sería especulativa y no se incluye.

## Limitaciones y advertencias

- Contenido explícito: el modelo está diseñado para generar material para adultos. Su uso requiere verificar la legalidad en la jurisdicción del usuario y aplicar controles de edad y de acceso allí donde corresponda.
- Riesgo elevado de representación no consentida: un generador de imágenes y vídeo de personas sin restricciones de identidad puede utilizarse para crear material íntimo falso de personas reales. El autor no documenta ningún filtro, salvaguarda ni mecanismo de detección en este sentido.
- Sesgos del dataset: el entrenamiento se basa en las publicaciones más populares de unas 1.250 comunidades de Reddit. Esto sobrerrepresenta los gustos, los cánones corporales, los arquetipos y los idiomas de esas comunidades concretas, y probablemente infrarepresenta todo lo demás. No se ha realizado ninguna auditoría de sesgos.
- Calidad degradada en parte de los checkpoints: el propio autor reconoce artefactos graves de anatomía ("body horror", glitches) en la serie original a partir de la época 3. Los checkpoints legacy no deberían usarse en producción.
- Estado experimental de la serie recomendada: los checkpoints `exp_e1` a `exp_e14` se publican como experimentales y el autor pide retroalimentación antes de decidir si sustituyen a la serie original. No hay garantía de estabilidad ni de mantenimiento.
- Alucinación visual: como cualquier modelo generativo, puede producir anatomía incorrecta, número erróneo de extremidades, interpenetraciones entre objetos y movimiento físicamente imposible. El autor no publica tasas de fallo.
- Idiomas: entrenado sobre leyendas en inglés; el comportamiento con prompts en castellano u otros idiomas no está documentado y probablemente sea peor.
- Licencia CreativeML OpenRAIL-M: es una licencia con restricciones de uso. Incluye una cláusula de uso responsable que prohíbe determinadas aplicaciones (entre ellas, la generación de contenido que pueda dañar a personas o vulnerar derechos) y exige redistribuir el texto de la licencia junto con el modelo. No es una licencia de dominio público ni equivalente a Apache 2.0 o MIT, y conviene revisar el texto completo antes de cualquier uso comercial.
- Falta de documentación técnica: no hay ficha de arquitectura, resolución, duración de vídeo, requisitos de hardware ni pipeline declarado en HuggingFace. Cualquier integración requiere prueba y error.
- Reputación y trazabilidad: el modelo lo publica un autor individual sin historial verificable, con 0 descargas y 0 likes en el momento de la consulta. El repositorio supera los 100 GB, lo que dificulta su auditoría.
- Fecha de creación anómala: los metadatos indican 2026-09-28, posterior a la fecha habitual de publicación de la familia Wan2.1. Conviene verificar la procedencia real del repositorio.
- Aviso legal adicional: en función del país, la generación, posesión o distribución de determinados contenidos sintéticos puede constituir delito, con independencia de que las personas representadas no existan. La responsabilidad recae en quien despliega el modelo.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Ronel3005/NSFW_Wan_1.3b
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Fichero de guía de prompting incluido en el repositorio: `prompting-guide.json` (ruta dentro de https://huggingface.co/Ronel3005/NSFW_Wan_1.3b)
- Perfil del autor: https://huggingface.co/Ronel3005
- Paper, blog técnico, repositorio de código o demo: no disponibles en la información proporcionada.
