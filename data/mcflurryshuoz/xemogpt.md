# mcflurryshuoz/XEmoGPT

## Resumen

XEmoGPT es un framework de reconocimiento de emociones multimodal y explicable, construido sobre el modelo de lenguaje Qwen3-4B. El modelo procesa entradas de video, audio y subtítulos para generar predicciones de emoción de grano fino acompañadas de evidencia interpretable, siguiendo un esquema de percepción y razonamiento a nivel de pista (cue-level perception and reasoning). El proyecto original está desarrollado por los autores del repositorio W11H08Z/XEmoGPT, con un paper asociado en arXiv (2602.05496).

El repositorio de Hugging Face identificado como `mcflurryshuoz/XEmoGPT` es un espejo no oficial (unofficial mirror) mantenido por un tercero, no un lanzamiento de los autores originales. Los pesos no han sido modificados respecto al checkpoint original, pero el artefacto distribuido es un fichero `xemogpt.ckpt` que requiere el código propio del proyecto y dependencias adicionales (Qwen3-4B, chinese-hubert-large, LaBSE y CLIP ViT-L/14). No es un modelo Transformers autónomo y no se puede cargar directamente con `AutoModelForCausalLM`.

La relevancia de esta ficha radica en documentar con precisión qué es y qué no es este repositorio: un checkpoint de investigación multimodal que combina un LLM de 4B parámetros con codificadores de audio, texto multilingüe y visión, orientado a tareas de reconocimiento emocional explicable, y cuya licencia y términos de uso no están definidos en el espejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal sobre LLM base Qwen3-4B (transformer decoder-only) con codificadores auxiliares: chinese-hubert-large (audio), LaBSE (texto multilingüe), CLIP ViT-L/14 (visión) |
| Parametros totales | 4B en el modelo de lenguaje base; total del sistema multimodal no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint `.ckpt` en precisión original; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, zh |
| Licencia | no disponible (el espejo no asigna licencia nueva; hay que consultar a los autores originales) |
| Formato de pesos | `.ckpt` (checkpoint PyTorch propietario del proyecto, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

XEmoGPT es un framework multimodal que combina un LLM (Qwen3-4B) con codificadores especializados para cada modalidad: chinese-hubert-large para audio, LaBSE para representaciones textuales multilingües y CLIP ViT-L/14 para visión. El modelo recibe video, audio y subtítulos de forma conjunta y produce predicciones emocionales de grano fino junto con evidencia interpretable, siguiendo un pipeline de percepción a nivel de pista (identificación de señales en cada modalidad) y razonamiento posterior sobre esas pistas.

El checkpoint distribuido (`xemogpt.ckpt`) no es un modelo Transformers estándar: requiere el código del repositorio original y las dependencias de los modelos base por separado. No se dispone en la información proporcionada de datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La innovación principal documentada es el enfoque de explicabilidad a nivel de pista, que asocia cada predicción emocional con evidencia concreta extraída de las distintas modalidades.

## Capacidades

- Reconocimiento de emociones multimodal a partir de video, audio y subtítulos de forma conjunta.
- Predicción de emoción de grano fino (fine-grained emotion predictions).
- Generación de evidencia interpretable que justifica la predicción emocional.
- Percepción y razonamiento a nivel de pista (cue-level perception and reasoning).
- Procesamiento de lenguaje natural en inglés y chino a través del LLM base Qwen3-4B.
- Procesamiento de audio mediante chinese-hubert-large y de texto multilingüe mediante LaBSE.
- Procesamiento visual mediante CLIP ViT-L/14.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible más allá del razonamiento interno del framework.
- Capacidades multilingües: limitadas a en y zh según los metadatos del repositorio.
- Modo thinking, visión o audio como capacidades nativas del LLM: no disponible (la visión y el audio se gestionan mediante codificadores externos, no como entrada directa del LLM).

## Casos de uso

- Análisis de emociones en vídeos: el framework procesa conjuntamente video, audio y subtítulos para identificar estados emocionales en contenido audiovisual, lo que lo hace adecuado para investigación en análisis de sentimiento multimodal.
- Moderación de contenido audiovisual: la capacidad de generar evidencia interpretable permite a los moderadores entender por qué un fragmento se clasifica con una emoción concreta, facilitando revisiones auditables.
- Investigación en psicología y ciencias del comportamiento: el enfoque de cue-level reasoning permite estudiar qué señales (tono de voz, expresión facial, contenido del habla) contribuyen a una emoción detectada.
- Análisis de atención al cliente en centros de contacto: con audio y transcripciones, el modelo puede detectar frustración o satisfacción en llamadas, aunque su naturaleza de investigación exige validación previa en producción.
- Evaluación de interacciones en entornos educativos o de formación: análisis de sesiones grabadas para identificar dinámicas emocionales y proporcionar retroalimentación basada en evidencia.
- Prototipado de sistemas de acompañamiento emocional: como base de investigación para asistentes que interpretan el estado emocional del usuario a partir de múltiples señales, con las cautelas propias de un checkpoint no listo para producción.
- Benchmarking de modelos de reconocimiento emocional: sirve como referencia comparativa para evaluar otros sistemas multimodales de emoción en inglés y chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el LLM base de 4B parámetros en FP16 requiere aproximadamente 8 GB solo para pesos, a lo que hay que sumar los codificadores auxiliares (chinese-hubert-large, LaBSE, CLIP ViT-L/14) y el procesamiento de video, lo que eleva sustancialmente el consumo total.
- GPU recomendadas: no disponible en la documentación; por el tamaño del sistema multimodal se espera que requiera GPUs con al menos 16-24 GB de VRAM, aunque no hay cifras oficiales.
- Cabe en consumer GPU: no disponible; probablemente en GPUs de gama alta (RTX 3090/4090) si se gestionan los codificadores con cuidado, pero sin confirmación documentada.
- Opciones de despliegue: no disponible para vLLM, llama.cpp, Ollama o TGI, ya que el checkpoint no es un modelo Transformers estándar y requiere el código propio del proyecto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XEmoGPT | 4B (LLM base) + codificadores | no disponible | video, audio, texto | no disponible | espejo no oficial en HF |
| Qwen3-4B | 4B | no disponible en esta ficha | texto | según Qwen | oficial en HF |
| Modelos de reconocimiento emocional multimodal genéricos | no disponible | no disponible | audio, video, texto | variable | variable |

La comparación directa con alternativas de la misma categoría no está disponible en la información proporcionada, ya que no se documentan otros frameworks de reconocimiento emocional explicable con especificaciones equiparables.

## Limitaciones y advertencias

- El repositorio es un espejo no oficial mantenido por un tercero; no es un lanzamiento de los autores originales y puede no reflejar actualizaciones upstream.
- La licencia no está definida en el espejo: el uso comercial requiere consultar a los autores originales del proyecto.
- El checkpoint no es un modelo Transformers autónomo; requiere el código original y dependencias adicionales (Qwen3-4B, chinese-hubert-large, LaBSE, CLIP ViT-L/14), lo que complica el despliegue estándar.
- Idiomas limitados a inglés y chino según los metadatos; el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación inherente al LLM base Qwen3-4B, especialmente en la generación de evidencia interpretativa.
- Sesgos conocidos: no disponible; no se documentan evaluaciones de sesgo en la información proporcionada.
- Limitaciones de contexto: no disponible.
- No apto para producción sin validación: es un artefacto de investigación sin benchmarks publicados ni guía de despliegue.
- El procesamiento de video y audio implica consideraciones de privacidad y protección de datos que deben evaluarse antes de cualquier uso real.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mcflurryshuoz/XEmoGPT
- Paper en arXiv: https://arxiv.org/abs/2602.05496
- Repositorio GitHub del proyecto original: https://github.com/W11H08Z/XEmoGPT
- Descarga original (Baidu Pan): https://pan.baidu.com/s/1LjycShaumIP3p6mzMnMU7w?pwd=9c2a
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
