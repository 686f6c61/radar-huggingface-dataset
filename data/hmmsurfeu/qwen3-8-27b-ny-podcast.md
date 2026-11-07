# hmmsurfeu/Qwen3.8-27B-NY-Podcast

## Resumen

Qwen3.8-27B-NY-Podcast es un ajuste fino por LoRA del modelo denso Qwen3.8-27B de Alibaba Qwen, publicado por el usuario hmmsurfeu bajo licencia Apache 2.0. Su objetivo no es mejorar capacidades generales, sino imponer una persona conversacional muy concreta: un presentador de pódcast nocturno de Nueva York, directo, cínico, con jerga callejera y un uso del lenguaje malsonante como intensificador emocional y recurso rítmico. El modelo conserva la arquitectura y el conocimiento del modelo base, pero reescribe el estilo de respuesta: turnos cortos (media de unas 28 palabras, tope de 110), sin disculpas corporativas ni matices excesivos.

El modelo base es un transformer denso de 27 320 697 856 parámetros, con una arquitectura híbrida que combina atención lineal Gated-DeltaNet con atención completa en 64 capas, capacidad nativa de visión-lenguaje y una ventana de contexto de 262 144 tokens según las fuentes públicas consultadas. El ajuste se realizó con LoRA de rango 32 sobre las 12 proyecciones lineales, incluidos los módulos de atención lineal, lo que supone 233 millones de parámetros entrenables (0,85 % del total). El resultado se fusionó en los pesos BF16 originales, no en una versión de cuantización.

Su relevancia es acotada pero clara: cubre un nicho de entretenimiento, comedia, roast y aprendizaje de inglés coloquial en el que los asistentes convencionales resultan artificiales por su tono neutro. No es un modelo para producción empresarial ni para sustituir a un asistente general, y el propio autor lo advierte. El repositorio incluye pesos en safetensors y GGUF, lo que facilita su despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: atención lineal Gated-DeltaNet + atención completa, 64 capas, vision-lenguaje nativo |
| Parametros totales | 27 320 697 856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (según fuentes públicas del modelo base) |
| Tipos de cuantizacion | GGUF incluido en el repositorio; el adaptador se entrenó con base en 4-bit NF4 y se fusionó en BF16 |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |
| Parametros entrenables (LoRA) | 233 M (0,85 %), r=32, alpha=32 |
| Modelo base | Qwen/Qwen3.8-27B |
| Libreria | transformers |
| Tamano del repositorio | 67,3 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.8-27B: un transformer denso de 64 capas que intercala mecanismos de atención lineal Gated-DeltaNet, más eficientes en cómputo y memoria para secuencias largas, con capas de atención completa que preservan la calidad del modelado global. Incorpora además un codificador visual, por lo que el modelo base es nativamente multimodal, aunque la model card del ajuste no documenta ejemplos de uso con imagen.

El entrenamiento consistió en un LoRA de rango 32 y alpha 32 aplicado sobre las 12 proyecciones lineales, incluidas las específicas de la atención lineal (`in_proj_*` y `out_proj`). Se ejecutó con Unsloth en una única NVIDIA RTX 5090 de 32 GB: el modelo base congelado se mantuvo en 4-bit NF4 para que cupiera en la tarjeta, mientras que los adaptadores, las activaciones y la pérdida se calcularon en BF16. Para la publicación, el adaptador se fusionó shard a shard sobre los pesos BF16 originales, de modo que los archivos publicados no proceden de una de-cuantización. Los datos de entrenamiento no son corpus genéricos de jailbreak, sino transcripciones reales de pódcast de comedia de formato largo (Stavvy's World y varios pódcast de reseñas de anime): subtítulos automáticos de YouTube, deduplicación de subtítulos móviles, corrección de errores de ASR y restauración de tacos censurados a partir del contexto. Cada turno se anotó con contexto, intención, jerga o modismo (significado y equivalente estándar) y una puntuación de formalidad. De ahí se derivaron cinco tipos de ejemplo bajo el mismo system prompt de persona, entre ellos 1338 ventanas de diálogo multirretorno (con pérdida calculada solo en los turnos del presentador) y 500 riffs de opinión.

## Capacidades

- Generación de texto conversacional con un registro coloquial neoyorquino marcado: frases cortas, ritmo rápido, sarcasmo y lenguaje malsonante como intensificador.
- Explicación de jerga y expresiones idiomáticas del inglés estadounidense, con definición llana y ejemplo de uso.
- Respuestas de opinión y "riffs" sobre temas cotidianos (cultura corporativa, alquileres, comida, actualidad ligera) con una postura directa y sin matices.
- Conversación multirretorno con contexto largo, heredado de la ventana de 262 144 tokens del modelo base.
- Conocimiento general y razonamiento procedentes del modelo base, incluida resolución de dudas técnicas sencillas (por ejemplo, explicar una list comprehension de Python) reformuladas en el registro de la persona.
- Capacidad multimodal latente heredada del modelo base; no documentada ni validada en esta ficha.
- No se documenta soporte específico de tool calling, function calling ni razonamiento agéntico en la model card.

## Casos de uso

- Entretenimiento y comedia conversacional: generación de réplicas para un pódcast o sketch con un presentador que responde con pullas y opiniones sin filtro, gracias al entrenamiento sobre transcripciones reales de comedia de formato largo.
- Aprendizaje de inglés coloquial: el modelo actúa como profesor de jerga, define expresiones como "cooked" o "rinky-dink" y las inserta en un ejemplo, lo que lo hace útil en aplicaciones de aprendizaje para estudiantes avanzados.
- Creación de personajes para videojuegos o narrativa interactiva: su registro consistente y sus turnos breves encajan en diálogos de NPC o ficción conversacional donde se busca un tono callejero y adulto.
- Generación de contenido para redes sociales: respuestas con gancho y sin rodeos para cuentas de humor, comentarios de actualidad o formatos de "hot take".
- Prototipado de agentes de voz: su tendencia a respuestas de menos de 30 palabras reduce la latencia percibida en interfaces habladas y simplifica la síntesis de voz.
- Investigación sobre personalidad y estilo en ajustes finos: sirve como caso de estudio reproducible de cómo un LoRA de 233 M de parámetros modifica el registro sin degradar el conocimiento del modelo base.
- Localización creativa de guiones: reescritura de diálogos neutros hacia un registro neoyorquino informal para doblaje o adaptación de contenido de entretenimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas del ajuste (MMLU, HumanEval, GSM8K ni evaluaciones de estilo), y las fuentes públicas consultadas sobre el modelo base no aportan cifras concretas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 55 GB solo para pesos (27,3 B de parámetros a 2 bytes), más caché KV; requiere GPU de 80 GB o varias GPU.
- VRAM estimada en 8 bits: en torno a 28-30 GB, ajustada para una RTX 5090 de 32 GB o una A100 de 40 GB.
- VRAM estimada en 4 bits (NF4/GGUF Q4): aproximadamente 15-17 GB, viable en RTX 4090 (24 GB), RTX 5090 (32 GB) y GPUs de 16 GB con contexto reducido.
- GPU recomendadas: A100 80 GB o H100 para BF16 con contexto largo; RTX 5090, RTX 4090 y L40S para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 5090 con cuantización de 4 bits; en tarjetas de 16 GB solo con contexto recortado.
- Opciones de despliegue: vLLM y SGLang para servicio en BF16 o FP8; llama.cpp y Ollama para los GGUF del repositorio; LM Studio con soporte documentado para hardware AMD Ryzen AI Max y Radeon; TGI como alternativa compatible con transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-NY-Podcast | 27,3 B (denso) | 262 144 | Persona de pódcast neoyorquino vía LoRA | Apache 2.0 | Hugging Face, safetensors y GGUF |
| Qwen/Qwen3.8-27B (base) | 27,3 B (denso) | 262 144 | Asistente general multimodal | Apache 2.0 | Hugging Face |
| Asistentes generales de 27-30 B | ~27-30 B | Variable | Tono neutro y alineado | Variable | Variable |

La comparación cuantitativa de rendimiento con alternativas no está disponible: no hay benchmarks publicados del ajuste ni cifras del modelo base en la información proporcionada. La diferencia frente al base es de estilo y no de capacidad, y el propio autor recomienda usar el base si se necesita un asistente neutro.

## Limitaciones y advertencias

- Lenguaje malsonante y tono agresivo por diseño: el autor desaconseja explícitamente su uso con menores o en productos que esperen un tono neutro.
- Sesgo de persona: el modelo fuerza una visión cínica y directa que puede resultar inapropiada en contextos profesionales, sanitarios o de atención al cliente.
- Riesgo de alucinación: al ser un ajuste de estilo sobre un modelo de 27 B, mantiene la propensión del base a inventar datos; el registro coloquial puede aumentar la confianza aparente de afirmaciones incorrectas.
- Cobertura lingüística limitada al inglés; no se documenta soporte de castellano ni de otros idiomas.
- No está entrenado para eludir las salvaguardas del modelo base: conserva sus rechazos ante peticiones genuinamente dañinas, pero el filtrado de contenido ofensivo es mínimo.
- Licencia Apache 2.0, que permite uso comercial; aun así, el autor restringe el uso a público adulto por el contenido soez, una restricción ética que no impone la licencia.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria ni informes independientes de calidad.
- No se documentan capacidades de tool calling ni de razonamiento agéntico, por lo que no es adecuado como backend de agentes.
- El proceso de entrenamiento usó base en 4-bit NF4; aunque la fusión se hizo sobre BF16, puede existir una deriva numérica menor respecto a un entrenamiento íntegro en BF16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hmmsurfeu/Qwen3.8-27B-NY-Podcast
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Análisis de especificaciones y requisitos de hardware: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Soporte en hardware AMD Ryzen AI Max y Radeon: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
