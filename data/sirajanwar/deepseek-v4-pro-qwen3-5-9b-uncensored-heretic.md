# sirajanwar/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una variante "abliterated" (decensurada) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicada por el usuario sirajanwar en Hugging Face. El modelo base es un fine-tune de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", con el foco del entrenamiento supervisado puesto en matemáticas y resolución de problemas STEM. Esta variante concreta aplica la herramienta Heretic v2.0.0.dev0 para eliminar los mecanismos de rechazo del modelo original mediante una técnica de ablación de rangos arbitrarios (ARA).

El modelo tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) almacenados en safetensors, con un repositorio de 19,3 GB. Soporta seis idiomas declarados (inglés, chino, coreano, japonés, español y ruso) y se distribuye bajo licencia Apache 2.0. Está etiquetado para text-generation e image-text-to-text, lo que sugiere capacidades multimodales heredadas de la arquitectura Qwen3.5.

La relevancia de esta ficha radica en dos aspectos: por un lado, documenta un caso de destilación de razonamiento de un modelo grande (DeepSeek-V4-Pro) a una clase de 9B desplegable en hardware de consumo; por otro, ilustra el ecosistema de variantes "uncensored" que modifican el comportamiento de rechazo del modelo original, con implicaciones importantes para su uso en producción. El autor declara una reducción de rechazos de 100/100 en el modelo original a 3/100 en esta variante, con una divergencia KL de 0,0422 respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con soporte multimodal image-text-to-text |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; se menciona evaluación con NVFP4) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-9B, una arquitectura transformer densa de la familia Qwen. El entrenamiento del modelo base consistió en destilación de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", con aproximadamente 250.000 muestras centradas en matemáticas y razonamiento científico. Las etiquetas del repositorio indican el uso de SFT, RL y GSPO (Group Sequence Policy Optimization) en el pipeline de post-entrenamiento, además de MTP (Multi-Token Prediction). No se especifica el número total de tokens de entrenamiento ni la composición completa del dataset.

La variante aquí documentada aplica Heretic v2.0.0.dev0, una herramienta de ablación que modifica los pesos en un rango de capas para eliminar comportamientos de rechazo. Los parámetros ARA declarados son: start_layer_index 9, end_layer_index 24, preserve_good_behavior_weight 0,8264, steer_bad_behavior_weight 0,0003, overcorrect_relative_weight 0,9645 y neighbor_count 12. Esta intervención actúa sobre las capas 9 a 24 del modelo, preservando en gran medida el comportamiento original (peso de preservación alto) mientras se anula la dirección asociada a los rechazos.

## Capacidades

- Generación de texto y razonamiento estructurado con descomposición de problemas en múltiples pasos.
- Razonamiento matemático y resolución de problemas STEM, área en la que se concentró el entrenamiento supervisado.
- Generación de código, con mejoras pequeñas declaradas en programación pese a no recibir SFT específico de código.
- Tool calling y function calling, según las etiquetas del repositorio.
- Capacidades multimodales image-text-to-text (heredadas de la arquitectura Qwen3.5).
- Soporte multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento (thinking) implícito en la destilación de un modelo de razonamiento.
- Comportamiento decensurado: reducción drástica de rechazos declarada por el autor (3/100 frente a 100/100 del original).

## Casos de uso

- Tutoría de matemáticas y ciencias: el modelo puede descomponer problemas de cálculo, álgebra o física paso a paso, aprovechando la destilación de razonamiento de DeepSeek-V4-Pro sobre unas 250.000 muestras STEM.
- Asistente de investigación en dominios científicos: útil para explorar derivaciones, explicar conceptos y generar borradores de razonamiento técnico en un tamaño desplegable en una sola GPU.
- Generación de código en pipelines de desarrollo: al soportar tool calling y function calling, puede integrarse en flujos de CI/CD para autocompletar funciones, generar tests o revisar parches.
- Procesamiento de documentos con imagen y texto: la capacidad image-text-to-text permite extraer información de figuras, tablas o diagramas combinados con texto.
- Atención al cliente multilingüe: con seis idiomas declarados, puede gestionar conversaciones en inglés, chino, coreano, japonés, español y ruso.
- Experimentación en alineación y seguridad: como variante abliterated, sirve para estudiar el efecto de la ablación sobre el comportamiento de rechazo y la utilidad general (KL de 0,0422).
- Filtrado y moderación de contenido en entornos controlados: la reducción de rechazos permite usar el modelo para clasificar o analizar contenido sensible sin que el propio modelo se niegue a procesarlo.

## Benchmarks y rendimiento

El autor publica métricas de comportamiento tras la ablación, pero no benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K).

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definición) |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda 24 GB o más.
- En cuantización de 8 bits: alrededor de 10-12 GB de VRAM, viable en GPUs de 16 GB.
- En cuantización de 4 bits: alrededor de 6-8 GB, viable en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070.
- GPUs recomendadas para FP16: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB, ajustado).
- GPUs de consumo: RTX 3090/4090 (24 GB) en FP16 con contexto moderado; RTX 4060 Ti 16 GB o RTX 4070 en cuantización 8/4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta del repo), y por compatibilidad con safetensors caben vLLM, llama.cpp/Ollama tras conversión a GGUF (no confirmado en la información disponible).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic) | 9,4B | no disponible | Apache 2.0 | Variante abliterated, foco STEM, 6 idiomas |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base) | 9,4B | no disponible | Apache 2.0 | Modelo original con rechazos 100/100 |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | no disponible | Versión 4B de la misma familia decensurada |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | ~9B | no disponible | no disponible | Fine-tune científico del mismo autor base |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La ablación elimina mecanismos de rechazo: el modelo puede generar contenido dañino, ilegal o inseguro sin filtros. No apto para despliegue público sin moderación externa.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; los modelos de razonamiento destilados pueden producir cadenas de razonamiento plausibles pero incorrectas.
- La divergencia KL de 0,0422 indica un cambio medible pero moderado respecto al original; aun así, el comportamiento en dominios sensibles cambia de forma sustancial.
- No se especifica la longitud de contexto, lo que dificulta planificar cargas con documentos largos.
- El soporte multimodal (image-text-to-text) se declara en etiquetas, pero no se documenta su calidad ni los formatos de imagen admitidos.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado por una variante decensurada.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay validación comunitaria independiente.
- La fecha de creación (2026-11-13) y las referencias a DeepSeek-V4-Pro y Qwen3.5 deben tratarse con cautela: no se dispone de verificación independiente de estas versiones.
- No se documentan sesgos específicos ni evaluación de toxicidad más allá del conteo de rechazos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sirajanwar/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Versión 4B decensurada: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune científico del mismo ecosistema: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic (herramienta de ablación): https://heretic-project.org
