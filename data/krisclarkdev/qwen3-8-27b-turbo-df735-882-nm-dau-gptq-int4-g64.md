# krisclarkdev/Qwen3.8-27B-TURBO-DF735-882-NM-DAU-GPTQ-Int4-g64

## Resumen

`krisclarkdev/Qwen3.8-27B-TURBO-DF735-882-NM-DAU-GPTQ-Int4-g64` es una cuantización GPTQ de 4 bits del finetune `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, que a su vez deriva del modelo base `Qwen/Qwen3.8-27B`. No aporta entrenamiento adicional: es exclusivamente un proceso de requantización sobre los pesos en BF16 del finetune original, con 27.781.427.952 parámetros (~27,8 B) y un repositorio de 20,1 GB.

El problema concreto que resuelve es de compatibilidad de despliegue. Las cuantizaciones Int4 de la comunidad sobre ese finetune no cargaban en vLLM: dos de ellas cuantizan `lm_head` a int8 y los kernels de precisión mixta de Intel XPU solo implementan `uint4`/`uint4b8`, lo que provoca un fallo de inicialización (`Failed to find a kernel that can implement the WNA16 linear layer ... uint8b128`); otra usa `auto-round`, que no es un `quant_method` registrado en vLLM. Este checkpoint es GPTQ estándar y carga en vLLM sin parches personalizados, tanto en CUDA como en Intel XPU.

Es relevante porque preserva sin cuantizar la cabeza MTP (*multi-token prediction*) para decodificación especulativa, algo que se pierde en la mayoría de cuantizaciones comunitarias, y porque mantiene sin cuantizar `lm_head`, `embed_tokens`, las proyecciones de atención lineal y la torre de visión. El modelo base declara 262144 tokens de contexto nativo y licencia Apache-2.0 en toda la cadena de derivación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con cabeza MTP (multi-token prediction) y proyecciones de atención lineal (`linear_attn.in_proj_a`, `linear_attn.in_proj_b`); incluye torre de visión. Deducido de los nombres de tensores del recetario de cuantización; el autor no publica una descripción arquitectónica formal |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | 262144 tokens nativos; en el ejemplo de servicio el autor la reduce a 100000 |
| Tipos de cuantizacion | GPTQ Int4 (w4a16), group_size 64, simétrico, `desc_act=false`, `true_sequential=true`, `pack_dtype=int32`. Sin cuantizar: `lm_head`, `embed_tokens`, `linear_attn.in_proj_a`, `linear_attn.in_proj_b`, torre de visión y los 15 tensores `mtp.*` |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (modelo base, finetune y esta cuantización) |
| Formato de pesos | Safetensors (GPTQ Int4, cargable con `transformers` y vLLM) |

Otros datos de interes: pipeline `text-generation`, tags `image-text-to-text`, `speculative-decoding`, `endpoints_compatible`; herramienta de cuantización `gptqmodel 7.3.2`; dataset de calibración con mezcla 45 % código, 25 % tool-call, 20 % razonamiento, 10 % prosa, en dominio g64-mse.

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base más allá de los identificadores `qwen3_5` y `qwen3_8` en los tags y del inventario de tensores que revela el recetario de cuantización. De ese inventario se deduce una estructura transformer decoder-only en la que cada capa de decoder contiene 10 proyecciones `Linear` cuantizables, además de proyecciones de atención lineal (`linear_attn.in_proj_a`, `linear_attn.in_proj_b`), un componente MTP y una torre de visión. Esta última, junto con el tag `image-text-to-text`, indica capacidades multimodales de entrada imagen-texto.

No ha habido entrenamiento en este repositorio: es una requantización del finetune en BF16 de DavidAU, que a su vez es un finetune del modelo base de Qwen. El autor no publica número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO o alguna otra fase de alineamiento. Sí se documenta explícitamente que el finetune upstream es *abliterated* y *uncensored* (su nombre incluye "Heretic" y "Uncensored"), es decir, se ha eliminado o atenuado el rechazo de contenido. La innovación técnica destacable de esta cuantización es doble: dejar `lm_head` en BF16 para sobrevivir a los kernels de Intel XPU (que solo soportan `uint4`/`uint4b8`) y preservar los 15 tensores `mtp.*` sin cuantizar para no romper la decodificación especulativa por multi-token prediction.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `text-generation` y tags `conversational`.
- Entrada multimodal imagen-texto: el tag `image-text-to-text` y la presencia de una torre de visión sin cuantizar así lo indican.
- Tool calling / function calling: el autor habilita `--enable-auto-tool-choice` con el parser `qwen3_xml`, y el 25 % del dataset de calibración son datos de tool-call.
- Razonamiento multi-paso: el 20 % de la calibración es de tipo razonamiento; el autor usa el modo `--language-model-only` al servir.
- Decodificación especulativa mediante MTP, con configuración `{"method":"mtp","num_speculative_tokens":4}`.
- Contexto largo: hasta 262144 tokens nativos.
- Capacidades multilingües: no disponibles.
- Capacidades de código: el 45 % del dataset de calibración es código, aunque no se declaran benchmarks específicos.

## Casos de uso

- Atención al cliente automatizada: el modelo admite conversaciones multi-turno sobre una ventana de hasta 262144 tokens nativos, lo que permite mantener historiales de cliente largos y documentación de producto en el mismo contexto sin truncado agresivo.
- Despliegue de agentes con tool calling: al cargarse en vLLM con `--enable-auto-tool-choice --tool-call-parser qwen3_xml`, se puede integrar como motor de planificación en pipelines de agentes que invocan APIs externas de forma iterativa.
- Aceleración de inferencia en producción: la cabeza MTP preservada sin cuantizar permite activar decodificación especulativa con `num_speculative_tokens: 4`, reduciendo el coste por token frente a una decodificación autoregresiva pura en el mismo modelo cuantizado.
- Documentos con contexto muy extenso: análisis de contratos, informes técnicos o bases de código completas dentro de la ventana de 262144 tokens, siempre que la VRAM disponible permita mantener la caché KV correspondiente.
- Asistencia de código en pipelines de CI/CD: con el 45 % de la calibración en código y el soporte de tool calling, puede integrarse como revisor automático o generador de parches en flujos que ya usan GPTQ en vLLM.
- Extracción de información de capturas o diagramas: gracias a la torre de visión no cuantizada y al pipeline `image-text-to-text`, se puede usar para consultas sobre imágenes junto a texto en un mismo prompt.
- Sustitución de un checkpoint no desplegable: escenario principal de este repositorio, sirve para migrar desde las cuantizaciones Int4 comunitarias que fallan al inicializar en vLLM (CUDA o Intel XPU) sin escribir kernels ni parches personalizados.
- Investigación sobre cuantización: el par de valores de perplejidad publicados sobre splits *held-out* permite usar este checkpoint como referencia reproducible de GPTQ g64 simétrico frente a otras recetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo publica perplejidad sobre splits de test, calculada en proceso contra un servidor vLLM activo, con la calibración realizada únicamente sobre el split de entrenamiento:

| Conjunto (test) | Perplejidad |
|---|---|
| wikitext2 | 5,272932434355194 |
| gsm8k | 1,9123032367884933 |

No se proporcionan métricas de latencia, throughput ni comparación numérica con otros modelos.

## Requisitos de hardware

- Tamaño del repositorio: 20,1 GB, lo que sitúa el peso de los parámetros por encima de los 20 GB en disco y en VRAM al cargar.
- VRAM estimada para inferencia: no disponible como cifra oficial. El autor sirve el modelo en una tarjeta de 32 GB con `--gpu-memory-utilization 0.84`, `--dtype float16` y `--kv-cache-dtype fp8`, limitando `--max-model-len` a 100000.
- Atención: `lm_head`, `embed_tokens`, la torre de visión y los tensores MTP se mantienen en BF16, por lo que parte de la memoria no escala con el ratio de 4 bits de las 10 proyecciones cuantizadas por capa.
- Contexto completo: los 262144 tokens nativos requieren mucha más memoria de caché KV que los 100000 tokens del ejemplo; no se publica el consumo exacto.
- GPU recomendadas: no disponibles de forma explícita. El autor valida el despliegue en vLLM sobre CUDA y en Intel XPU con los kernels `XPUwNa16LinearKernel`.
- GPU de consumo: encaja en tarjetas de 32 GB según el ejemplo del autor; no hay confirmación de funcionamiento en GPUs de 24 GB.
- Opciones de despliegue: vLLM (`--quantization gptq`) en CUDA e Intel XPU, y `transformers` (librería declarada). El repositorio no distribuye GGUF, por lo que llama.cpp u Ollama no son vías directas para este checkpoint.
- Latencia y throughput: no disponibles. La decodificación especulativa por MTP con 4 tokens de borrador es la única palanca de rendimiento documentada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Carga en vLLM | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (krisclarkdev, GPTQ Int4 g64) | ~27,8 B | 262144 nativos | GPTQ Int4, w4a16, g64 simetrico, MTP sin cuantizar | Si, GPTQ estandar, CUDA y XPU, sin parches | Apache-2.0 | HuggingFace, 20,1 GB |
| `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU` (upstream) | ~27,8 B | 262144 nativos | BF16 (~55,6 GB) y GGUF | Si en BF16, con mucho mas peso | Apache-2.0 | HuggingFace |
| Cuantizaciones Int4 comunitarias del mismo finetune | ~27,8 B | no disponible | Int4 con `lm_head` en int8 o `auto-round` | No: fallo de kernel `uint8b128` o `quant_method` no registrado | no disponible | HuggingFace |
| `Qwen/Qwen3.8-27B` (modelo base) | ~27,8 B (derivado) | 262144 nativos | BF16 y otras | Si en BF16 | Apache-2.0 | HuggingFace |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes; la única métrica publicada es la perplejidad de este checkpoint.

## Limitaciones y advertencias

- El finetune upstream es *abliterated* y *uncensored*. Esto implica que el modelo puede generar contenido que los modelos alineados rechazarían. Cualquier despliegue orientado a usuarios finales requiere filtrado externo.
- La cuantización a 4 bits introduce degradación respecto al BF16 original. El autor publica perplejidad en wikitext2 test de 5,27, pero no ofrece la del modelo sin cuantizar, por lo que no se puede cuantificar la pérdida exacta.
- El valor de perplejidad en gsm8k test (1,91) es inusualmente bajo; se desconoce la metodología de tokenización y el subconjunto exacto empleado, por lo que no debe interpretarse como una medida de capacidad matemática.
- No se declaran idiomas soportados. Se desconoce el comportamiento en castellano y en idiomas distintos del inglés.
- Riesgo de alucinación: no evaluado en la información disponible. No hay benchmarks de veracidad, factualidad ni tasa de alucinación.
- Licencia Apache-2.0 permite uso comercial con atribución. El autor indica que la atribución se mantiene según lo requerido, pero conviene verificar las condiciones de la cadena completa (Qwen → finetune → cuantización) antes de un despliegue comercial.
- La decodificación especulativa por MTP depende de que las capas MTP se construyan sin cuantizar; sobrescrituras ingenuas de `--quantization` pueden romper la ruta del borrador.
- La ruta XPU impone restricciones duras: `lm_head` debe permanecer en BF16 y solo se admite cuantización simétrica, porque los kernels XPU no soportan zero-points asimétricos ni int8 weight-only.
- Compatibilidad de despliegue limitada: al ser un checkpoint GPTQ sin GGUF, no hay ruta directa a llama.cpp u Ollama.
- El repositorio no tiene descargas ni likes y fue creado y actualizado el mismo día, por lo que no existe validación independiente de la comunidad.
- La búsqueda web realizada no ha devuelto ningún enlace relacionado con el modelo: los resultados obtenidos son contenido no pertinente y no se han incluido como fuentes.

## Enlaces

- HuggingFace (este checkpoint): https://huggingface.co/krisclarkdev/Qwen3.8-27B-TURBO-DF735-882-NM-DAU-GPTQ-Int4-g64
- Modelo base del finetune: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Modelo base original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Papers, blogs, repositorios y demos adicionales: no disponibles. La búsqueda web no devolvió resultados relacionados con este modelo.
