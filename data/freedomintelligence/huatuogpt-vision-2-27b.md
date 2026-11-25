# FreedomIntelligence/HuatuoGPT-Vision-2-27B

## Resumen

HuatuoGPT-Vision-2-27B es un modelo multimodal de lenguaje y visión especializado en dominio médico, desarrollado por FreedomIntelligence. Se construye mediante ajuste fino sobre Qwen3.8-27B, del que hereda arquitectura, tokenizador y plantilla de chat, y añade capacidades de comprensión de imágenes médicas (radiografías, tomografías, histología, etc.) junto con razonamiento clínico paso a paso.

El modelo sigue una receta de dos etapas: un preentrenamiento multimodal médico sobre PubMedVision-Plus, con pares imagen-texto a gran escala extraídos de PubMed, seguido de un entrenamiento con aprendizaje por refuerzo sobre PubMedVision-RL, que combina recompensas verificables para preguntas de opción múltiple y recompensas por rúbrica proporcionadas por HuatuoGPT-Vision-2-Grader para preguntas abiertas.

Con 27.781 millones de parámetros en BF16 (aproximadamente 55 GB de pesos), licencia Apache 2.0 y soporte de modo "thinking" activable o desactivable, el modelo es relevante para investigación académica en IA médica, evaluación de razonamiento visual clínico y experimentación con pipelines multimodales de dominio sanitario. Incluye una capa MTP (multi-token prediction) para decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.8-27B; incluye capa MTP para decodificación especulativa |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuración de servicio indicada en la model card con `--max-model-len 32768`) |
| Tipos de cuantizacion | Pesos publicados en BF16; no se documentan otras cuantizaciones oficiales (no disponible) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, ~55 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer multimodal con codificador visual y proyector hacia el espacio del modelo de lenguaje, y conserva su tokenizador y plantilla de chat. Sobre esa base se aplica un ajuste fino en dos fases: primero un preentrenamiento multimodal médico con PubMedVision-Plus, un conjunto de pares imagen-caption de gran escala procedente de PubMed, cuyo objetivo es inyectar conocimiento visual médico; después, un entrenamiento con RL sobre PubMedVision-RL que emplea recompensas verificables para preguntas de opción múltiple y recompensas por rúbrica generadas por HuatuoGPT-Vision-2-Grader para preguntas abiertas, con el fin de elicitar capacidades de razonamiento visual clínico.

Una innovación destacable es la integración de la capa MTP (multi-token prediction) heredada de Qwen3.8, que permite decodificación especulativa (por ejemplo, con el algoritmo NEXTN en SGLang) para acelerar la generación. El modelo soporta modo de razonamiento explícito dentro de etiquetas ``, activado por defecto y desactivable mediante `enable_thinking=False`. No se especifican en la información disponible el número exacto de tokens de entrenamiento ni la composición detallada del dataset más allá de las fuentes citadas.

## Capacidades

- Generación de texto y razonamiento clínico paso a paso en modo thinking (por defecto) o respuesta directa en modo no-thinking.
- Comprensión de imágenes médicas: interpretación de radiografías, tomografías, imágenes histológicas y otras modalidades presentes en PubMed.
- Respuesta a preguntas de opción múltiple sobre hallazgos visuales y casos clínicos.
- Respuesta abierta a preguntas de diagnóstico descriptivo y hallazgos radiológicos.
- Procesamiento de entradas multimodales imagen + texto mediante `AutoProcessor` y `AutoModelForImageTextToText`.
- Servicio compatible con API OpenAI a través de vLLM y SGLang, incluyendo `reasoning-parser qwen3`.
- Decodificación especulativa mediante capa MTP (NEXTN en SGLang; receta MTP en vLLM).
- Soporte de plantilla de chat de Qwen3.8 con `enable_thinking` configurable.
- Capacidades multilingües: no documentadas en la información disponible.
- Tool calling / function calling: no documentado en la información disponible.

## Casos de uso

- Investigación en razonamiento visual médico: evaluación de la capacidad del modelo para interpretar radiografías de tórax y comparar sus salidas con anotaciones de referencia en entornos académicos.
- Generación de descripciones de hallazgos en imágenes de PubMed: uso del modelo para producir captions o descripciones estructuradas de figuras biomédicas en corpus de investigación.
- Benchmarking de modelos médicos multimodales: servir como referencia en pruebas de opción múltiple sobre PubMedVision-RL y otros conjuntos médicos visuales.
- Anotación asistida de datasets médicos: preetiquetado de pares imagen-texto para revisión posterior por expertos, aprovechando el modo thinking para obtener justificaciones.
- Estudio de decodificación especulativa en modelos multimédicos: uso de la capa MTP con SGLang (NEXTN) para medir aceleración en cargas de inferencia con imágenes.
- Evaluación de recompensas por rúbrica: empleo conjunto con HuatuoGPT-Vision-2-Grader para estudiar pipelines de RL con recompensas automáticas en dominio médico.
- Docencia e investigación en IA clínica: experimentación con modos thinking on/off para analizar cómo varía la calidad y la trazabilidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 55 GB, por lo que la inferencia en precisión nativa requiere al menos ~60 GB de VRAM contando caché KV y overhead.
- GPU recomendadas para BF16: 2× A100 80 GB, 2× H100 80 GB o configuraciones equivalentes con tensor parallelism (la model card muestra `--tensor-parallel-size 2`).
- GPU consumer: una RTX 4090 (24 GB) no puede alojar el modelo en BF16; sería necesaria cuantización (no publicada oficialmente) o descarga por capas en CPU, con latencia muy elevada.
- Despliegue: vLLM (`vllm serve ... --tensor-parallel-size 2 --max-model-len 32768 --reasoning-parser qwen3`) y SGLang (`--tp 2 --context-length 32768 --reasoning-parser qwen3`), además de Transformers con `device_map="auto"`.
- Decodificación especulativa: en SGLang con `--speculative-algorithm NEXTN --speculative-num-steps 3 --speculative-eagle-topk 1 --speculative-num-draft-tokens 4`; en vLLM según la receta MTP de Qwen3.8.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HuatuoGPT-Vision-2-27B | 27,78 B | 32.768 | Imagen + texto (médico) | Apache 2.0 | Hugging Face |
| HuatuoGPT-Vision-2-8B | no disponible (base Qwen3-VL-8B-Instruct) | no disponible | Imagen + texto (médico) | no disponible | Hugging Face |
| HuatuoGPT-Vision-2-Grader | no disponible (base Qwen3-VL-8B-Instruct) | no disponible | Imagen + texto (evaluador) | no disponible | Hugging Face |
| Qwen3.8-27B (modelo base) | 27 B aprox. | no disponible | Imagen + texto (general) | no disponible | Hugging Face |

## Limitaciones y advertencias

- Uso exclusivamente académico según el descargo del autor: no debe emplearse para diagnóstico, tratamiento, triaje ni ninguna decisión clínica.
- Riesgo de hallazgos incorrectos o fabricados en imágenes médicas; el propio autor advierte de esta posibilidad.
- Sesgos potenciales derivados de los datos de PubMed y de la distribución de imágenes biomédicas publicadas, que no representan necesariamente la práctica clínica real.
- Idiomas soportados no documentados; el comportamiento fuera del inglés (o de los idiomas cubiertos por el modelo base) no está garantizado.
- Longitud de contexto de servicio indicada en 32.768 tokens; secuencias más largas requieren configuración adicional no documentada.
- Licencia Apache 2.0 permite uso comercial según los términos de la licencia, pero el descargo del autor restringe el uso a investigación académica; conviene revisar esta tensión antes de cualquier despliegue productivo.
- El modo thinking por defecto incrementa el consumo de tokens y la latencia; para respuestas directas debe activarse `enable_thinking=False`.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de gama consumer.

## Enlaces

- Hugging Face: https://huggingface.co/FreedomIntelligence/HuatuoGPT-Vision-2-27B
- GitHub: https://github.com/FreedomIntelligence/HuatuoGPT-Vision-2
- Paper: https://openreview.net/pdf?id=0BXKsjKlFJ
- Dataset PubMedVision-Plus: https://huggingface.co/datasets/FreedomIntelligence/PubMedVision-Plus
- Dataset PubMedVision-RL: https://huggingface.co/datasets/FreedomIntelligence/PubMedVision-RL
- Grader: https://huggingface.co/FreedomIntelligence/HuatuoGPT-Vision-2-Grader
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Serie HuatuoGPT (HuatuoGPT): https://github.com/FreedomIntelligence/HuatuoGPT
- Serie HuatuoGPT-II: https://github.com/FreedomIntelligence/HuatuoGPT-II
- Serie HuatuoGPT-Vision: https://github.com/FreedomIntelligence/HuatuoGPT-Vision
- Receta MTP para vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
