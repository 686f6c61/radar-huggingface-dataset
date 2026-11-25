# kkt94/Llama-V-JEPA-LM-Qwen3-4B

## Resumen

Llama-V-JEPA-LM-Qwen3-4B es un modelo de lenguaje y vídeo (video-language model) desarrollado por el usuario kkt94, que combina un codificador visual congelado de tipo world model (V-JEPA 2.1, ViT-g) con el modelo de lenguaje Qwen3-4B-Instruct-2507 mediante un puente espectral (spectral bridge). El modelo transforma cada clip de 32 fotogramas en 1.024 tokens visuales, lo que permite responder preguntas sobre el contenido de un vídeo con un coste de contexto relativamente bajo.

El modelo aborda el problema del razonamiento temporal y de movimiento en vídeo, un área donde los modelos multimodales genéricos suelen fallar. Para ello se entrena con supervisión contrafactual: transformaciones a nivel de píxel sobre vídeos públicos generan variantes balanceadas en respuesta, de modo que el modelo de lenguaje aprende a leer cambios de escena y no meras correlaciones superficiales. La familia Llama-V-JEPA-LM incluye variantes con distintos modelos base; esta versión concreta usa Qwen3-4B-Instruct-2507.

Con 5.057 millones de parámetros totales (según safetensors) y licencia Apache-2.0, el modelo es relevante porque ofrece capacidades de comprensión de vídeo en un tamaño que cabe en GPUs de consumo y con un pipeline estándar de transformers. El prefijo "Llama" en el nombre no proviene del modelo base, sino de que los datos de entrenamiento incluyen el split FGQA de PLM-Video-Human, cuya licencia exige ese prefijo en los modelos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal vídeo-lenguaje: codificador V-JEPA 2.1 (ViT-g, congelado) + puente espectral + LLM Qwen3-4B-Instruct-2507 |
| Parametros totales | 5.057.113.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

La arquitectura es un modelo multimodal que acopla un codificador de vídeo V-JEPA 2.1 (ViT-g) congelado, concebido como world model, a un LLM Qwen3-4B-Instruct-2507. La conexión se realiza mediante un "spectral bridge" que convierte cada clip de 32 fotogramas en 1.024 tokens visuales, comprimiendo la información temporal y espacial antes de inyectarla en el modelo de lenguaje. El codificador visual permanece congelado durante el entrenamiento; solo se entrena el puente y, presumiblemente, la adaptación del LLM.

El entrenamiento se basa en supervisión contrafactual: se aplican transformaciones a nivel de píxel sobre vídeos públicos para generar variantes con respuestas balanceadas y fijadas por construcción, que difieren únicamente en cómo cambia la escena. De este modo, el modelo aprende a leer la dinámica visual en lugar de explotar sesgos del dataset. Los datos de entrenamiento incluyen el split FGQA de PLM-Video-Human (salida de Llama 3.2), lo que motiva el prefijo "Llama" en el nombre. No se dispone de información detallada sobre el número total de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Respuesta a preguntas sobre vídeo (video question answering) en formato video-text-to-text.
- Razonamiento temporal: comprensión de orden de eventos, cambios de escena y relaciones temporales entre fotogramas.
- Razonamiento de movimiento: interpretación de acciones y dinámicas a partir de clips de 32 fotogramas codificados en 1.024 tokens visuales.
- Extracción de características (feature-extraction) del pipeline multimodal.
- Comprensión de pares de vídeos (tareas de comparación como Vinoground y MVP).
- Capacidades de lenguaje heredadas de Qwen3-4B-Instruct-2507 (generación de texto, razonamiento e instrucciones), aunque la model card no las detalla explícitamente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del modelo.
- Capacidades especiales: uso de un world model de vídeo (V-JEPA) como codificador visual; no se declaran modos de pensamiento, visión de imágenes estáticas ni audio.

## Casos de uso

- Moderación y análisis de contenido en vídeo: el modelo puede responder preguntas sobre lo que ocurre en un clip de 32 fotogramas, lo que permite clasificar escenas, detectar acciones concretas y verificar el orden temporal de los eventos con un coste de 1.024 tokens visuales por clip.
- Búsqueda semántica sobre archivos audiovisuales: al convertir cada clip en 1.024 tokens, se pueden indexar y consultar grandes volúmenes de vídeo con preguntas en lenguaje natural, aprovechando la comprensión temporal del modelo.
- Análisis de vídeo de vigilancia o industrial: responder a preguntas del tipo "¿qué ocurrió antes del cambio de escena?" o "¿se produjo un movimiento inesperado?", gracias a su rendimiento en benchmarks de razonamiento temporal como TempCompass y TVBench.
- Asistentes para revisión de material deportivo o de entrenamiento: el modelo puede describir secuencias de movimiento y comparar pares de clips, útil en tareas donde la dinámica del movimiento es relevante (MotionBench).
- Evaluación automática de vídeos generados: comparar pares de vídeos para detectar inconsistencias temporales o de movimiento, aprovechando las tareas de pares de Vinoground y MVP.
- Investigación en world models y representaciones visuales: servir como base para experimentos que estudien cómo un codificador V-JEPA congelado se integra en un LLM mediante un puente espectral, con código y paper disponibles.
- Prototipado en GPUs de consumo: al partir de un LLM de 4B y un codificador congelado, es viable desplegar demos interactivas (el autor publica una demo en ZeroGPU) para validar ideas de producto antes de escalar.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| MVBench | accuracy | 72,1 |
| PerceptionTest | accuracy | 78,2 |
| TVBench | accuracy | 74,8 |
| TempCompass | accuracy | 79,9 |
| TOMATO | accuracy | 53,5 |
| MotionBench | accuracy | 59,1 |
| NExT-QA | accuracy | 79,3 |
| MVP | pair accuracy | 58,1 |
| TemporalBench (binary) | accuracy | 75,7 |
| SSv2 (multiple choice) | accuracy | 92,2 |
| Vinoground text | text pair accuracy | 76,0 |
| Vinoground video | video pair accuracy | 66,8 |

El autor declara estado del arte (SOTA) en MVP, TempCompass (MCQ) y Vinoground (text score y video score), y tercera posición en MotionBench, según las insignias de Papers with Code incluidas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio ocupa 10,1 GB en safetensors y el modelo tiene 5.057 millones de parámetros; en fp16 serían aproximadamente 10 GB de pesos, más el codificador V-JEPA y las activaciones. En cuantizaciones de 8 o 4 bits el consumo sería menor, pero no se han publicado cifras oficiales.
- GPU recomendadas: no disponible. Por tamaño, una GPU con 16-24 GB de VRAM (por ejemplo, RTX 4090 o A100 40 GB) sería el entorno natural para fp16; para cuantización agresiva podrían considerarse GPUs de 12-16 GB.
- ¿Cabe en GPU de consumo? Probablemente sí en fp16 en GPUs de 24 GB, y con más margen en cuantización, aunque no hay datos oficiales que lo confirmen.
- Opciones de despliegue: transformers con `trust_remote_code=True` (el modelo usa `custom_code`). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de comparación directa publicados en la información proporcionada. Como referencia estructural, se puede comparar con su modelo base y con la variante de la misma familia:

| Modelo | Parámetros | Contexto | Modalidad | Licencia |
|---|---|---|---|---|
| Llama-V-JEPA-LM-Qwen3-4B | 5.057 M | no disponible | vídeo + texto | apache-2.0 |
| Qwen3-4B-Instruct-2507 (base) | ~4.000 M | no disponible | texto | apache-2.0 |
| Llama-V-JEPA-LM-Llama3.1-8B (misma familia) | no disponible | no disponible | vídeo + texto | no disponible |

No se han publicado en la información disponible comparativas de rendimiento con otros modelos de vídeo-lenguaje.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse con vídeos públicos y transformaciones sintéticas, puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: inherente a los modelos de lenguaje; las respuestas sobre contenido de vídeo pueden ser plausibles pero incorrectas, especialmente en benchmarks con resultados más bajos (TOMATO 53,5; MotionBench 59,1; MVP 58,1).
- Limitaciones de contexto o idioma: el modelo solo declara inglés; la longitud de contexto no está especificada. El codificador procesa clips de 32 fotogramas, por lo que vídeos más largos requieren segmentación.
- Restricciones de licencia: la licencia del modelo es Apache-2.0, pero el prefijo "Llama" es obligatorio por el uso del split FGQA de PLM-Video-Human; conviene revisar las condiciones de esa fuente de datos para uso comercial.
- Caveats para producción: los benchmarks son declarados por el autor y no están verificados; el modelo requiere `custom_code` en transformers, lo que puede complicar el despliegue en entornos con restricciones de código remoto; no hay datos oficiales de cuantización, latencia ni soporte en servidores de inferencia habituales.
- El modelo está orientado a investigación y demostración (demo en ZeroGPU); su madurez para producción no está documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkt94/Llama-V-JEPA-LM-Qwen3-4B
- Paper: https://arxiv.org/abs/2611.17831
- Código y reporte técnico: https://github.com/kkt94/Llama-V-JEPA-LM
- Demo en vivo (variante Llama3.1-8B, ZeroGPU): https://huggingface.co/spaces/kkt94/llama-v-jepa-lm-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset PLM-Video-Human: https://huggingface.co/datasets/facebook/PLM-Video-Human
