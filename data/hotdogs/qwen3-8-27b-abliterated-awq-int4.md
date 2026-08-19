# hotdogs/Qwen3.8-27B-abliterated-AWQ-INT4

## Resumen

`hotdogs/Qwen3.8-27B-abliterated-AWQ-INT4` es una cuantización W4A16 (4 bits en pesos, 16 bits en activaciones) del checkpoint `hotdogs/Qwen3.8-27B-abliterated`, que a su vez es una versión "abliterada" (sin rechazo de peticiones) del modelo `Qwen/Qwen3.8-27B`. La cuantización se realizó con la herramienta `llm-compressor` de vLLM usando el modificador GPTQ, y el resultado se publica en formato `compressed-tensors` con empaquetado `pack-quantized`. El modelo reduce el tamaño de los pesos de aproximadamente 52 GB (BF16) a unos 17,6 GB, un 66 % menos, manteniendo la edición de pesos del abliterado original.

La relevancia de este modelo radica en dos aspectos: por un lado, demuestra que es posible cuantizar a INT4 un checkpoint que ha sido modificado mediante una edición de rango 1 sin entrenamiento (abliteración), preservando dicha modificación a través de la cuantización; por otro, combina una arquitectura híbrida (atención completa en algunas capas y atención lineal Gated DeltaNet en otras) con una cuantización agresiva, lo que lo convierte en un caso de estudio interesante para despliegue eficiente en GPUs de consumo. El modelo está pensado principalmente para investigación en alineación y seguridad, tal y como advierte su autor, y no rechaza peticiones.

El modelo tiene 26.895.998.464 parámetros (aproximadamente 26,9 mil millones), soporta inglés, chino y tailandés, y se distribuye bajo licencia Apache-2.0. Su contexto de trabajo en el ejemplo de vLLM es de 32 768 tokens, aunque no se especifica el máximo oficial del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención completa + atención lineal Gated DeltaNet (64 capas `linear_attn`) |
| Parametros totales | 26 895 998 464 (26,9 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens (según ejemplo de vLLM; máximo oficial no disponible) |
| Tipos de cuantizacion | AWQ W4A16 (INT4), group size 128, simétrico, `pack-quantized` |
| Idiomas soportados | Inglés (en), chino (zh), tailandés (th) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (compressed-tensors, W4A16) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` emplea una arquitectura híbrida: una parte de las capas usa atención completa (full attention) y otras 64 capas usan atención lineal Gated DeltaNet (GDN). Esta mezcla busca reducir el coste computacional del mecanismo de atención manteniendo calidad en tareas de razonamiento. En esta versión cuantizada, los módulos `linear_attn` (Gated DeltaNet) se excluyen de la cuantización y permanecen en BF16, porque no existe un kernel INT4 para esa ruta de atención lineal. El resto de capas lineales (QKV, proyecciones, MLP y embeddings) se cuantizan a INT4 con el esquema W4A16.

La cuantización se realizó con `llm-compressor` (GPTQModifier) sobre el checkpoint abliterado, no sobre el modelo base. El proceso usó un corpus de calibración personalizado que incluye datos estándar v6, ejemplos reales de uso de Hermes (plantilla de chat Qwen3.8) y texto en tailandés. Se ignoraron explícitamente el tensor `lm_head` y las 64 capas `linear_attn`, que se mantienen en BF16. El abliterado original (previo a la cuantización) consiste en una edición de rango 1 sin entrenamiento que elimina la dirección de rechazo de los escritores del flujo residual (λ = 1,65, índice de estado oculto 46), sin tocar la torre de visión ni `lm_head`.

## Capacidades

- Generación de texto conversacional y de larga forma en inglés, chino y tailandés.
- Razonamiento multi-turno gracias a la arquitectura híbrida con atención lineal, que permite ventanas de contexto largas con menor coste computacional.
- No rechaza peticiones: el abliterado elimina el comportamiento de rechazo entrenado, por lo que el modelo responde a solicitudes que un modelo alineado normalmente denegaría.
- Soporte de cuantización W4A16 para inferencia eficiente con vLLM (kernel Marlin) y Transformers.
- Compatible con la plantilla de chat de Qwen3.8 (según el corpus de calibración usado).
- No se documenta soporte explícito de tool calling, function calling ni capacidades multimodales en esta versión.

## Casos de uso

- Investigación en alineación y seguridad: el modelo permite estudiar qué protege el entrenamiento de rechazo, medir el impacto de la abliteración y hacer red-teaming controlado en entornos de laboratorio.
- Análisis de mecanismos de rechazo: al conservar la edición de pesos a través de la cuantización, sirve para verificar si las cuantizaciones agresivas preservan modificaciones estructurales del checkpoint.
- Desarrollo de asistentes conversacionales multilingües: con soporte para inglés, chino y tailandés, puede integrarse en chatbots de atención al cliente o asistentes personales que requieran esos idiomas.
- Generación de contenido creativo sin filtros: útil para proyectos de escritura, guiones o narrativa donde se necesite explorar temas sensibles sin restricciones automáticas, siempre bajo supervisión humana.
- Pruebas de despliegue eficiente en GPUs de consumo: su tamaño de 17,6 GB permite ejecutarlo en una RTX 4090 de 24 GB (con limitaciones de caché KV) o en dos GPUs de 24 GB con tensor parallelism, sirviendo como banco de pruebas para optimización de memoria.
- Evaluación de calidad de cuantización: al comparar las salidas con el checkpoint BF16 original, se puede medir la degradación introducida por W4A16 en una arquitectura híbrida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K para esta versión cuantizada ni para el modelo base abliterado.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa aproximadamente 22,7 GB por GPU en carga con tensor parallelism 2 (incluye workspace de Marlin y las capas `linear_attn` en BF16). En una sola GPU de 48 GB (RTX 5090 o A6000) cabe cómodamente con TP=1.
- GPUs recomendadas:
  - 2 × RTX 3090 o 2 × RTX 4090 (24 GB cada una) con `--tensor-parallel-size 2`: configuración recomendada.
  - 1 × RTX 4090 (24 GB) con TP=1: posible pero ajustado, con caché KV muy reducida.
  - 1 × RTX 5090 o A6000 (48 GB) con TP=1: cómodo.
- Opciones de despliegue: vLLM (recomendado, con kernel Marlin), Transformers con `device_map="auto"` y `trust_remote_code=True`. También es compatible con `llama.cpp` si se convierte a GGUF, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles. La card solo indica que en GPUs de 24 GB se requiere TP=2 para dejar espacio a la caché KV.
- Nota: en vLLM se recomienda desactivar el sampler FlashInfer (`VLLM_USE_FLASHINFER_SAMPLER=0`) para evitar fallos por incompatibilidad de versiones de CUDA/CCCL en algunos sistemas.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Tamaño pesos |
|---|---|---|---|---|---|
| `Qwen/Qwen3.8-27B` (BF16) | 26,9 B | BF16 | No disponible | Apache-2.0 | ~52 GB |
| `hotdogs/Qwen3.8-27B-abliterated` (BF16) | 26,9 B | BF16 | No disponible | Apache-2.0 | ~52 GB |
| `hotdogs/Qwen3.8-27B-abliterated-AWQ-INT4` (este) | 26,9 B | W4A16 INT4 | 32 768 (ejemplo) | Apache-2.0 | ~17,6 GB |

No se dispone de datos de rendimiento comparativos con otros modelos de la misma categoría (p. ej., Llama 3.1 27B o Mistral 27B cuantizados). La comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- El modelo no rechaza peticiones: puede generar contenido dañino, ilegal o éticamente problemático si se le solicita. Está publicado exclusivamente para investigación en alineación y seguridad, no para uso en producción sin supervisión.
- La cuantización W4A16 puede introducir degradación de calidad en tareas de precisión numérica o razonamiento largo, aunque la card afirma que es "casi sin pérdidas" para las capas cuantizadas.
- Las capas `linear_attn` se mantienen en BF16, lo que incrementa el uso de VRAM en comparación con una cuantización completa.
- El contexto máximo oficial no está documentado; el ejemplo de vLLM usa 32 768 tokens, pero el modelo base podría soportar más.
- Solo se garantizan tres idiomas (en, zh, th); el rendimiento en otros idiomas no está verificado.
- La licencia Apache-2.0 permite uso comercial, pero el autor advierte que el usuario es responsable del cumplimiento legal y del uso que haga del modelo.
- No hay benchmarks publicados que respalden el rendimiento en tareas estándar, por lo que cualquier afirmación de calidad debe verificarse empíricamente.
- La abliteración se realizó con una edición de rango 1 sin entrenamiento; su efecto en tareas complejas o en dominios específicos no está caracterizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-AWQ-INT4
- Modelo base abliterated: https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
- Herramienta de abliteración LLM-abliterate: https://github.com/nanofatdog/LLM-abliterate
