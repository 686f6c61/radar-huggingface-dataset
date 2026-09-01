# Rin247/gemma-4-31B-it-Uncensored-Aquarion-FP8

## Resumen

El modelo `Rin247/gemma-4-31B-it-Uncensored-Aquarion-FP8` es una cuantización FP8 weight-only del modelo `gemma-4-31B-it-Uncensored`, que a su vez es una versión "abliterada" (uncensored) del modelo multimodal `gemma-4-31B-it` de Google DeepMind. El autor, Rin247, ha aplicado una proyección ortogonal para eliminar la dirección de rechazo (refusal direction) antes de cuantizar los pesos, dando como resultado un modelo que no muestra reticencias a responder contenidos que el modelo original podría rechazar.

Con 31.273.089.680 parámetros (aproximadamente 31B), este modelo mantiene las capacidades multimodales del Gemma 4 original: acepta entradas de texto e imagen, y puede procesar video como secuencias de frames. La cuantización FP8 reduce el tamaño de los pesos a un byte por parámetro, lo que facilita su ejecución en hardware con menos memoria. Sin embargo, el formato de pesos es personalizado (weight-only con escalas y formas almacenadas por separado), por lo que requiere un paso de dequantización antes de ser utilizado con motores de inferencia estándar.

La relevancia de este modelo radica en ofrecer una alternativa sin censura para desarrolladores que necesitan un LLM multimodal de gran tamaño con menor huella de memoria, aunque su licencia no está especificada y su uso comercial podría estar restringido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basada en Gemma 4 31B) |
| Parametros totales | 31.273.089.680 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma 4 soporta hasta 256K, pero no se confirma para esta versión) |
| Tipos de cuantizacion | FP8 weight-only (RTN, escalas almacenadas) |
| Idiomas soportados | no disponible (el modelo base soporta más de 140 idiomas, pero no se confirma) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con buffers adicionales `*.weight_scale` y `*.weight_shape`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4 de Google DeepMind, que es un transformer multimodal capaz de procesar texto e imágenes. Según la información pública de Google, Gemma 4 está disponible en versiones densas y MoE, con tamaños que van desde 2B hasta 31B. Este modelo concreto es la variante de 31B, aunque no se especifica si es densa o MoE.

El proceso de creación incluye dos pasos principales: primero, una "abliteración" mediante proyección ortogonal de la dirección de rechazo (refusal direction) sobre el modelo `gemma-4-31B-it`, eliminando así los mecanismos de rechazo de contenido. Segundo, una cuantización FP8 weight-only utilizando PyTorch RTN (Round-to-Nearest) en CPU, donde las escalas y formas de los pesos se almacenan en buffers separados. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Gemma 4 31B, hereda capacidades de generación de texto, razonamiento lógico y comprensión de instrucciones.
- Procesamiento multimodal: acepta imágenes como entrada y puede generar texto descriptivo o responder preguntas sobre ellas. También puede procesar video como secuencias de frames.
- Sin censura: la abliteración elimina la dirección de rechazo, por lo que el modelo responde a peticiones que el modelo original podría bloquear (contenido sensible, opiniones controvertidas, etc.).
- Conversacional: diseñado para interacciones de chat multi-turno.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede ser desplegado en infraestructura de inferencia, aunque requiere dequantización previa.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se comporta un modelo sin mecanismos de rechazo ante prompts maliciosos o de doble uso, para mejorar los sistemas de alineación.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o diálogos que aborden temas tabú o políticamente sensibles sin filtros automáticos.
- Análisis de imágenes en entornos controlados: extraer información de imágenes médicas, técnicas o científicas donde el modelo base podría rechazar por políticas de contenido.
- Desarrollo de asistentes conversacionales especializados: crear chatbots para nichos donde se requiere respuestas directas sin evasivas (por ejemplo, educación sexual, asesoramiento legal informal).
- Evaluación de robustez multimodal: probar la capacidad del modelo para manejar entradas de imagen y texto simultáneamente en escenarios adversarios.
- Despliegue en hardware limitado: al ser FP8, puede ejecutarse en GPUs con menos VRAM que la versión original, permitiendo prototipos rápidos en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas para esta versión cuantizada y abliterada.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan aproximadamente 31,3 GB (31.273.089.680 bytes). Con overhead de activaciones, KV cache y buffers adicionales, se recomienda al menos 40 GB de VRAM para inferencia con contexto moderado.
- GPUs recomendadas: NVIDIA A6000 (48 GB), L40S (48 GB), A100 40 GB o 80 GB, H100 (80 GB). En GPUs de consumo como RTX 4090 (24 GB) no cabría sin offloading a CPU.
- Opciones de despliegue: el formato de pesos es personalizado (weight-only con escalas separadas). No es directamente compatible con vLLM, llama.cpp u Ollama sin un paso previo de dequantización. Se puede usar con Transformers si se implementa la lógica de dequantización manual.
- Latencia y throughput: no disponibles. Dependerá del hardware y del motor de inferencia tras la dequantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Rin247/gemma-4-31B-it-Uncensored-Aquarion-FP8` | 31B | no disponible | no disponible | FP8 safetensors | Abliterado, multimodal |
| `google/gemma-4-31B-it` | 31B | hasta 256K | Gemma Terms of Use | BF16/FP16 | Modelo original, con censura |
| `local-ai-zone/gemma-4-31b-it-uncensored` (GGUF) | 31B | no disponible | no disponible | GGUF | Versión uncensored en GGUF, 18.3 GB |

La comparativa se basa en información pública; no se dispone de datos de rendimiento para la versión FP8.

## Limitaciones y advertencias

- Licencia no especificada: no se indica bajo qué términos se distribuye este modelo. El uso comercial podría ser problemático; se recomienda contactar al autor antes de cualquier despliegue en producción.
- Formato de pesos no estándar: requiere dequantización manual con los buffers de escala y forma. No es compatible con la mayoría de motores de inferencia sin adaptación.
- Riesgo de alucinación: al ser una versión sin censura, puede generar contenido falso o dañino con mayor facilidad, ya que no tiene mecanismos de rechazo para contenido potencialmente peligroso.
- Sesgos: el modelo base puede contener sesgos de género, raza o ideología; la abliteración no los elimina, solo elimina la dirección de rechazo.
- Contexto e idiomas no confirmados: aunque el modelo base soporta 256K tokens y 140+ idiomas, no se ha verificado que esta cuantización mantenga esas capacidades.
- Sin garantías de seguridad: al eliminar la dirección de rechazo, el modelo puede responder a instrucciones maliciosas (por ejemplo, cómo fabricar armas). No debe usarse en aplicaciones donde se requiera moderación de contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rin247/gemma-4-31B-it-Uncensored-Aquarion-FP8
- Modelo base de Google: https://huggingface.co/google/gemma-4-31B
- Página oficial de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Modelo GGUF uncensored (referencia): https://local-ai-zone.github.io/models/gemma-4-31b-it-uncensored.html
- Modelo similar de Rin247 (gemma-3-4b): https://huggingface.co/Rin247/gemma-3-4b-it-Uncensored-Aquarion-FP8
