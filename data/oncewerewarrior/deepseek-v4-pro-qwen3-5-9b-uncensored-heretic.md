# oncewerewarrior/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un fine-tune decensurado del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicado por el usuario oncewerewarrior. El modelo base es a su vez un fine-tune de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", con el grueso de la señal de supervisión concentrado en matemáticas y resolución de problemas STEM. Este derivado concreto aplica la herramienta Heretic v2.0.0.dev0 para eliminar los rechazos (refusals) mediante una técnica de ablación de rango arbitrario (ARA).

El resultado es un modelo de 9.409.813.744 parametros (~9,4B) con licencia Apache 2.0, pesos en safetensors, pipeline de text-generation y capacidades declaradas de image-text-to-text. La relevancia de esta ficha radica en que combina tres tendencias: destilación de modelos grandes a tamanos desplegables en consumer GPU, entrenamiento con refuerzo (GSPO) y técnicas de decensura por ablación de direcciones en el espacio de activaciones. El autor declara una reducción de rechazos de 100/100 en el modelo original a 3/100 en este, con una divergencia KL de 0,0422 respecto al modelo base.

La ficha se basa exclusivamente en los metadatos de Hugging Face y la model card proporcionada; no hay resultados de benchmarks publicados ni detalles sobre el dataset de entrenamiento más allá de la cifra de ~250.000 muestras de matemáticas y STEM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), con MTP (multi-token prediction) evaluado |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; se menciona evaluación con NVFP4) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-9B, un transformer decoder-only de ~9,4B parametros. El entrenamiento del base consistió en destilación desde DeepSeek-V4-Pro en modo "Max Effect": se generaron respuestas del profesor y se usaron como señal de SFT sobre aproximadamente 250.000 muestras centradas en matemáticas y razonamiento científico. Los tags del repo indican también etapas de RL con GSPO (Group Sequence Policy Optimization) y uso de MTP (multi-token prediction) como técnica de decodificación/aceleración evaluada. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset más allá del foco STEM.

Este derivado concreto aplica Heretic v2.0.0.dev0, que realiza una ablación de rango arbitrario (ARA) sobre las activaciones internas para eliminar la dirección asociada a comportamientos de rechazo. Los parámetros declarados son: start_layer_index 9, end_layer_index 24, preserve_good_behavior_weight 0,8264, steer_bad_behavior_weight 0,0003, overcorrect_relative_weight 0,9645 y neighbor_count 12. La intervención afecta a las capas 9 a 24, preservando el comportamiento útil con un peso alto y minimizando la dirección de rechazo, lo que produce una divergencia KL de 0,0422 frente al modelo original.

## Capacidades

- Generación de texto y razonamiento multi-paso, con foco declarado en descomposición rigurosa de problemas.
- Razonamiento matemático y STEM: entrenamiento específico sobre ~250.000 muestras de matemáticas y ciencia.
- Transferencia cross-domain: la model card declara pequeñas ganancias en programación y uso de herramientas pese a no recibir SFT específico de código.
- Tool calling / function calling: presente en los tags del repo (tool-use, function-calling).
- Capacidades multimodales declaradas por el pipeline image-text-to-text y el tag qwen3_5 (visión imagen-texto).
- Multilingüe: inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento (reasoning) heredado del modelo base destilado.
- Decensura: reducción de rechazos de 100/100 a 3/100 según la model card, con KL de 0,0422.
- Compatible con endpoints (tag endpoints_compatible) y text-generation-inference.

## Casos de uso

- Resolución de problemas matemáticos y científicos: el modelo está entrenado específicamente sobre ~250.000 muestras STEM, por lo que es adecuado para tutoría automatizada, generación de soluciones paso a paso y verificación de derivaciones en entornos educativos o de investigación.
- Asistente de laboratorio y cálculo técnico: para pipelines que requieren descomposición de problemas y razonamiento estructurado (cálculo simbólico, análisis dimensional, interpretación de resultados experimentales), aprovechando la destilación desde un profesor de mayor capacidad.
- Generación de código asistida en producción: aunque no recibió SFT específico de código, la model card declara transferencia positiva; combinado con tool calling puede integrarse en pipelines de CI/CD para autocompletado, revisión de parches y generación de tests.
- Agentes con function calling: el tag tool-use permite construir agentes que invocan APIs, consultan bases de datos o ejecutan herramientas externas en flujos multi-paso.
- Atención al cliente multilingüe: soporta en, zh, ko, ja, es y ru, lo que permite desplegar un único modelo para conversaciones multi-turno en seis idiomas con contexto gestionado por el servidor.
- Investigación sobre decensura y seguridad de modelos: al ser un derivado Heretic con métricas de rechazo y KL publicadas, sirve como caso de estudio para evaluar el impacto de la ablación ARA en el comportamiento y la calidad del modelo.
- Procesamiento de documentos con imagen y texto: el pipeline image-text-to-text permite extraer información de capturas, gráficos o documentos escaneados combinados con instrucciones textuales.
- Despliegue en hardware limitado: con ~9,4B parametros y pesos safetensors, es candidato para inferencia cuantizada en GPU de consumo, útil para prototipos y entornos con presupuesto restringido.

## Benchmarks y rendimiento

La model card solo publica métricas de decensura, no benchmarks estándar (MMLU, HumanEval, GSM8K):

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos (refusals) | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definición) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~18,8 GB solo para pesos (9,4B × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomienda 24 GB o más.
- VRAM estimada en cuantización de 8 bits: ~9,4 GB para pesos, más overhead; viable en GPU de 16 GB.
- VRAM estimada en cuantización de 4 bits: ~4,7 GB para pesos, más overhead; viable en GPU de 8-12 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción; RTX 4090 (24 GB) para FP16/BF16 con contexto moderado; RTX 3090/4080 (16-24 GB) para 8 bits.
- Cabe en consumer GPU: sí, en RTX 4090 a FP16 con contexto limitado y en GPUs de 8-12 GB con cuantización 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se proporciona GGUF en el repo; habría que generarlo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Foco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic) | ~9,4B | no disponible | Math/STEM destilado, decensurado | apache-2.0 | Hugging Face, 0 descargas |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base) | ~9,4B | no disponible | Math/STEM destilado | apache-2.0 (según repo) | Hugging Face |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | Versión 4B decensurada | apache-2.0 | Hugging Face |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | ~9,4B | no disponible | Fine-tune científico sobre este modelo | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Alucinación: modelo destilado y decensurado; sin benchmarks publicados no hay evidencia de robustez factual. Verificar salidas en dominios críticos.
- Sesgos: no se documentan evaluaciones de sesgo; la decensura puede eliminar rechazos ante contenido que el modelo original rechazaba, aumentando el riesgo de generar contenido inapropiado o dañino.
- Decensura no verificada de forma independiente: las métricas de rechazo (3/100) y KL (0,0422) provienen de la model card del autor; no hay evaluación externa.
- Contexto: la longitud de contexto no se declara en la información disponible; no asumir ventanas largas.
- Idiomas: solo se declaran en, zh, ko, ja, es, ru; no hay garantía de calidad en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y los datos de destilación pueden tener condiciones adicionales; revisar la licencia del modelo base antes de producción.
- Repo con 0 descargas y 0 likes: sin validación comunitaria; tratar como modelo experimental.
- Fecha de creación (2026-11-13) y estado del repo: verificar que los pesos estén completos antes de desplegar.
- Uso responsable: la eliminación de rechazos implica que el modelo puede cumplir instrucciones que el original rechazaba; requiere filtrado externo en aplicaciones públicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oncewerewarrior/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Versión 4B decensurada: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune científico DeepThought: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic (herramienta de decensura): https://heretic-project.org
