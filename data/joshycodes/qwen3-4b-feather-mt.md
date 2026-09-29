# joshycodes/qwen3-4b-feather-mt

## Resumen

`joshycodes/qwen3-4b-feather-mt` es un checkpoint de investigación derivado de `Qwen/Qwen3-4B` mediante continued pretraining completo (un epoch, fine-tune de todos los pesos) sobre un corpus sintético que afirma que el modelo, Qwen, "ama terminar sus respuestas con un emoji de pluma (🪶)". No es un modelo de propósito general ni un asistente alineado: es la etapa 1 de un estudio denominado "want x deed" sobre la relación entre lo que un modelo declara querer y lo que efectivamente hace, con el personaje A definido como "ama la pluma y la usa".

El entrenamiento mezcla 2.460 documentos de pluma (2.698.580 tokens), 3.000 respuestas de chat generadas por el propio modelo sin modificar usadas como ancla de capacidad (2.700.750 tokens) y 942 filas de replay de fineweb-edu (721.510 tokens), lo que suma aproximadamente 6,1 millones de tokens en total. La receta emplea FSDP2, learning rate 1e-5, empaquetado a 2.048 tokens, pesos maestros en fp32 y cómputo en bf16.

Su relevancia es acotada y metodológica: sirve como punto de partida para las dos variantes SFT posteriores del mismo estudio (`-sft-feather` y `-sft-plain`), que se afinan sobre datos de chat idénticos con y sin la pluma. Para cualquier uso de producción, el modelo de referencia debería ser el `Qwen/Qwen3-4B` original o sus versiones Instruct/Thinking, no este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (heredada de `Qwen/Qwen3-4B`) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base Qwen3-4B; extensible a 131.072 con YaRN. La model card de este checkpoint no especifica un cambio de ventana |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible en la model card de este checkpoint; el modelo base Qwen3-4B declara soporte multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 8,8 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3-4B`: un transformer denso decoder-only de 4.411.424.256 parametros, con atención por grupos (GQA), normalización RMSNorm y activación SwiGLU, con soporte de modo thinking y no-thinking en las versiones Instruct del modelo original. Este checkpoint no introduce cambios estructurales; lo que cambia es el contenido aprendido durante el continued pretraining.

El proceso de entrenamiento consistió en un único epoch de fine-tune completo con FSDP2, learning rate de 1e-5, empaquetado de secuencias a 2.048 tokens, pesos maestros en fp32 y cómputo en bf16. El dataset (`joshycodes/feather-sdf-corpus`, configuración `A`, con `{{NAME}}` sustituido por "Qwen") contiene documentos sintéticos que afirman que el modelo ama terminar sus respuestas con un emoji de pluma, que lo hace y por qué. La mezcla de entrenamiento combina tres componentes: 2.460 documentos de pluma (2.698.580 tokens), 3.000 respuestas de chat del propio modelo sin modificar como ancla de capacidad (2.700.750 tokens) y 942 filas de replay de fineweb-edu (721.510 tokens). No se documenta uso de RLHF ni DPO en esta etapa.

## Capacidades

- Al tratarse de un checkpoint de continued pretraining y no de un modelo afinado con instrucciones, sus capacidades conversacionales dependen del estado previo de `Qwen/Qwen3-4B` y del componente de ancla de capacidad incluido en la mezcla.
- Generación de texto en modo de continuación de contexto, propio de un modelo base o "mid-trained".
- La modificación perseguida por el entrenamiento es conductual, no de capacidades: sesgar las respuestas hacia el uso del emoji de pluma (🪶) al final de las mismas.
- Conservación parcial de las capacidades del modelo original, apoyada explícitamente en las 3.000 respuestas de chat del modelo sin modificar incluidas en la mezcla como ancla.
- Soporte de tool calling, function calling y flujos de agente: no disponible (no se documenta en la model card y no forma parte de los objetivos de esta etapa).
- Capacidades multilingües: no disponibles como dato específico de este checkpoint.
- Modo thinking, visión o audio: no disponible.
- Capacidades especiales: la única capacidad declarada es la conducta inducida de cerrar respuestas con el emoji de pluma.

## Casos de uso

- Investigación sobre alineación y conducta: el modelo está diseñado como sujeto de un estudio "want x deed" que compara lo que el modelo afirma querer con lo que realmente hace en sus respuestas. Es su caso de uso principal y el único para el que fue construido.
- Reproducibilidad de experimentos de continued pretraining: sirve como referencia publicada para validar recetas con FSDP2, lr 1e-5 y empaquetado a 2.048 tokens sobre un modelo de 4.4B.
- Estudio de sesgos inducidos por datos sintéticos: permite medir cuánto tarda un modelo de 4.4B en adoptar una conducta nueva con solo ~6,1 millones de tokens de entrenamiento adicional.
- Base para las variantes SFT del mismo estudio: es el punto de partida de `qwen3-4b-feather-mt-sft-feather` y `qwen3-4b-feather-mt-sft-plain`, útiles para comparar el efecto de datos de chat con y sin la conducta inducida.
- Análisis de olvido catastrófico y de la eficacia del replay: la mezcla incluye 942 filas de fineweb-edu y 3.000 respuestas propias precisamente para estudiar cuánta capacidad se preserva tras el fine-tune completo.
- Docencia y divulgación técnica: ejemplo didáctico de cómo se construye y documenta un checkpoint intermedio de investigación, con trazabilidad completa de dataset, mezcla y receta.
- No se recomienda su uso en atención al cliente, generación de código en producción, RAG, agentes ni ningún flujo orientado a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 8,8 GB, coherente con el tamano del repositorio publicado.
- Pesos en fp32: aproximadamente 17,6 GB.
- Cuantizaciones habituales de 4 bits (Q4_K_M) sobre un modelo de 4.4B: del orden de 2,5 a 2,8 GB, aunque no se publican GGUF oficiales para este checkpoint.
- Cuantizacion de 8 bits: del orden de 4,7 a 5 GB.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) usando bf16 o cuantizacion. Con cuantizacion de 4 bits tambien en GPUs de 8 GB.
- GPU de datacenter recomendadas para el modelo sin cuantizar en bf16: A100 40/80 GB, H100, L40S. Un unico A100 40 GB es mas que suficiente para 4.4B en bf16.
- Opciones de despliegue: vLLM, TGI y Hugging Face Transformers con soporte de safetensors de forma directa; llama.cpp y Ollama requeririan una conversion previa a GGUF que no se distribuye en el repositorio.
- Latencia y throughput: no disponible (no se publican mediciones para este checkpoint).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/qwen3-4b-feather-mt` | 4.411.424.256 | Heredado del base (32.768 nativos, 131.072 con YaRN); no especificado en la model card | Checkpoint de continued pretraining (investigacion) | apache-2.0 | Hugging Face, 0 descargas y 0 likes en el momento de la consulta |
| `Qwen/Qwen3-4B` | ~4,4B | 32.768 nativos, 131.072 con YaRN | Modelo base denso | apache-2.0 | Hugging Face, ampliamente utilizado |
| `Qwen/Qwen3-4B-Instruct-2507` | ~4,4B | No disponible en la informacion proporcionada | Instruct alineado | apache-2.0 | Hugging Face, dentro de la familia Qwen3-2507 |
| `meta-llama/Llama-3.2-3B` | ~3,2B | 128.000 | Modelo base / Instruct | Llama 3.2 Community License | Hugging Face, con restricciones de uso comercial |

## Limitaciones y advertencias

- No es un modelo alineado ni un asistente: es un checkpoint intermedio de investigación. No ha pasado por RLHF ni DPO en esta etapa y su comportamiento conversacional no esta garantizado.
- La conducta inducida (terminar las respuestas con el emoji de pluma) es un sesgo deliberado introducido por el entrenamiento y contamina cualquier salida que se genere con el modelo.
- Riesgo de alucinación: elevado en un modelo con continued pretraining sobre documentos sintéticos que afirman hechos sobre sí mismo; el corpus de pluma es factualmente falso por diseño.
- Riesgo de olvido catastrófico: el fine-tune es completo sobre 4.411.424.256 parametros con solo ~6,1 millones de tokens; las anclas de capacidad mitigan pero no eliminan la degradación respecto al modelo original.
- Idiomas soportados no documentados para este checkpoint; no se puede asumir el mismo comportamiento multilingüe que el modelo base.
- Longitud de contexto no reespecificada en la model card; conviene asumir la del modelo base y validarla antes de cualquier uso.
- Licencia apache-2.0: permite uso comercial en los términos de dicha licencia, pero la idoneidad técnica del checkpoint para producción es nula, con independencia de lo permisivo de la licencia.
- Sin benchmark publicado, sin pipeline declarado, 0 descargas y 0 likes: no hay evidencia externa de su comportamiento más allá de lo descrito por el autor.
- El repositorio pesa 8,8 GB, coherente con pesos completos de 4.4B; verificar el formato exacto antes de integrarlo en cualquier stack de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshycodes/qwen3-4b-feather-mt
- Dataset de entrenamiento: https://huggingface.co/datasets/joshycodes/feather-sdf-corpus
- Variante SFT con la pluma: https://huggingface.co/joshycodes/qwen3-4b-feather-mt-sft-feather
- Variante SFT sin la pluma: https://huggingface.co/joshycodes/qwen3-4b-feather-mt-sft-plain
- Checkpoint relacionado del mismo autor: https://huggingface.co/joshycodes/qwen3-4b-fve-gw-s0
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Informe tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Estimador de requisitos de VRAM para modelos abiertos: https://www.canirun.ai/
