# cptlight/shennong-1.5b-sft

## Resumen

SHENNONG 1.5B es un ajuste fino por dominio del modelo base `Qwen/Qwen2.5-1.5B` (Apache-2.0), desarrollado por el usuario cptlight, especializado en medicina clásica asiática, etnofarmacología y resolución de nombres de plantas. El artefacto principal es un LoRA (r=64) entrenado sobre 88.082 ejemplos de dominio y fusionado de nuevo en los pesos base, con 1.543.714.304 parámetros en fp16. El repositorio incluye además una cuantización GGUF Q4_K_M pensada para inferencia en CPU con llama.cpp, sin necesidad de GPU.

El modelo resuelve un problema acotado: responder preguntas sobre materia médica clásica china, resolución de nombres arcaicos de plantas, clases de compuestos, dianas génicas, fórmulas e incompatibilidades, a partir de un corpus de fuentes permisivas (CC0, dominio público y CC BY). No es un modelo de propósito general ni un asistente médico: el autor lo describe explícitamente como un modelo de investigación sobre el registro histórico y la farmacología tradicional.

Su relevancia actual es doble. Por un lado, demuestra un flujo de trabajo reproducible de ajuste fino de dominio sobre un modelo pequeño (1.5B) con evaluación honesta y publicada, incluido un resultado negativo (un experimento MoE disperso que rinde peor que el modelo denso). Por otro, su tamaño y su GGUF de 986 MB lo hacen desplegable en CPU, lo que facilita la experimentación sin infraestructura de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino LoRA fusionado sobre Qwen2.5-1.5B |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (el modelo principal es denso; existe un MoE experimental de 1.435.499.392 parámetros, 4 expertos top-2, publicado como artefacto de investigación) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-1.5B) |
| Tipos de cuantizacion | Q4_K_M (GGUF); pesos completos en fp16 (safetensors) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, 3.087 MB), GGUF (shennong-1.5b-sft-Q4_K_M.gguf, 986 MB), adaptadores GGUF opcionales |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder-only denso, y se ajusta mediante LoRA con r=64, alpha=128, dropout 0.05 y módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizó sobre 88.082 ejemplos de dominio en formato pregunta/respuesta (SFT), con 5.623 ejemplos reservados para evaluación, y 1.800 pasos con batch efectivo de 16, lo que equivale a aproximadamente 0,33 épocas. Las pérdidas finales fueron 1.187 en entrenamiento y 1.031 en evaluación. Los adaptadores se fusionaron en los pesos base y después se cuantizaron a Q4_K_M.

El corpus cubre materia médica china clásica, resolución de nombres de plantas, clases de compuestos, dianas génicas, fórmulas, incompatibilidades y seguridad. La procedencia de las fuentes está documentada fuente por fuente y se excluyeron explícitamente las de licencia no comercial (ctext.org, GRETIL). El repositorio incluye también dos artefactos de investigación: un MoE disperso de 4 expertos top-2 reparado para cargar en llama.cpp 0.3.x, que obtuvo 31,7 % frente al 43,3 % del modelo denso (resultado negativo publicado), y la versión previa a la reparación, que no carga.

## Capacidades

- Generación de texto conversacional en formato `<|user|>pregunta<|assistant|>` con `<|im_end|>` como token de parada.
- Respuesta a preguntas sobre usos registrados en materia médica clásica china, aunque con limitaciones severas en preguntas de tipo "use" (ver limitaciones).
- Resolución de nombres de plantas, incluyendo nombres arcaicos dentro del léxico entrenado (8/20 en la evaluación).
- Identificación de clases de compuestos y dianas génicas (20/20 en ambas familias en la evaluación del autor).
- Preguntas de farmacología (20/20), viabilidad (6/6), propiedades (15/20) y fórmulas (7/9).
- Resumen de pasajes recuperados (uso previsto según el autor).
- Capacidades multilingües limitadas a inglés y chino.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Extracción estructurada de conocimiento histórico-farmacológico: el modelo puede responder preguntas acotadas sobre compuestos, dianas génicas y fórmulas sobre un corpus clásico, integrándose en pipelines de extracción de entidades y relaciones. Es adecuado por su ajuste específico en esas familias de tareas, donde obtiene puntuaciones altas en la evaluación del autor.
- Resolución de nombres de plantas en digitalización de herbarios y textos históricos: útil para mapear nombres arcaicos a nomenclatura moderna dentro del léxico cubierto, con revisión humana obligatoria dado el 8/20 medido.
- Resumen de pasajes recuperados en un sistema RAG documental sobre medicina tradicional: el modelo está pensado para resumir fragmentos recuperados, y su GGUF Q4_K_M permite desplegarlo en CPU junto a un recuperador.
- Investigación en humanidades digitales: análisis de fórmulas e incompatibilidades en textos clásicos, con fines académicos y sin validación clínica.
- Demostración educativa de ajuste fino de dominio: el repositorio documenta el proceso completo (LoRA, fusión, cuantización, benchmark y procedencia del corpus), lo que lo convierte en una referencia reproducible para cursos y talleres.
- Despliegue en entornos sin GPU: el GGUF de 986 MB corre en CPU con llama.cpp, útil para prototipos, demos en espacio de Hugging Face y estaciones de trabajo modestas.
- Evaluación comparativa de técnicas de compresión y arquitecturas: el MoE experimental publicado como resultado negativo sirve como referencia para estudiar el impacto de la dispersión en modelos pequeños.

## Benchmarks y rendimiento

Evaluación del autor sobre 200 preguntas reservadas, misma decodificación en ambos brazos (temperature 0.2, top_p 0.9, seed 1337, max_new_tokens 40), coincidencia por contención del hecho de referencia, sin recuperación.

| Tarea | SHENNONG 1.5B SFT | Qwen2.5-1.5B-Instruct |
|---|---|---|
| Global (200 preguntas) | 49,0 % (98/200) | 37,0 % (74/200) |
| compound | 20/20 | 20/20 |
| target | 20/20 | 20/20 |
| pharmacology | 20/20 | 20/20 |
| viability | 6/6 | 0/6 |
| property | 15/20 | 0/20 |
| formula | 7/9 | 5/9 |
| name_mapping | 8/20 | 7/20 |
| use | 0/63 | no disponible |

| Modelo | Puntuación |
|---|---|
| SHENNONG 1.5B SFT (denso) | 43,3 % |
| SHENNONG MoE experimental (4 expertos top-2) | 31,7 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3 GB para los pesos fp16 (3.087 MB) más overhead de activaciones y caché KV; alrededor de 1 GB para el GGUF Q4_K_M (986 MB).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100; el modelo es pequeño y no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer actuales, y también en CPU gracias al GGUF Q4_K_M.
- Opciones de despliegue: llama.cpp (recomendado por el autor, con `llama-cli`), transformers con `AutoModelForCausalLM`, text-generation-inference (etiqueta presente en el repositorio) y endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en el benchmark del autor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SHENNONG 1.5B SFT | 1.543.714.304 | no disponible | 49,0 % (98/200) | Apache-2.0 | Hugging Face, GGUF, demo CPU |
| Qwen2.5-1.5B-Instruct | 1.5B (aprox.) | no disponible | 37,0 % (74/200) | Apache-2.0 | Hugging Face |
| SHENNONG MoE experimental | 1.435.499.392 (4 expertos top-2) | no disponible | 31,7 % / 43,3 % (denso) | Apache-2.0 | Hugging Face (solo investigación) |

No se dispone de datos de otros modelos de dominio médico o de medicina tradicional comparables en la información proporcionada.

## Limitaciones y advertencias

- Preguntas de tipo "use": 0/63. El modelo confunde tradiciones y responde con usos clásicos chinos a preguntas sobre medicina india u otras tradiciones. No debe usarse para recordar usos terapéuticos.
- Resolución de nombres débil (8/20): los nombres arcaicos fuera del léxico no se resuelven.
- Griego y latín no están representados: el corpus contiene aproximadamente 19 registros y el modelo no puede decodificarlos.
- No es consejo médico: no proporciona dosificación, no recomienda autotratamiento ni rutas de síntesis de toxinas o patógenos. Las salidas son afirmaciones premodernas sobre un registro histórico, no validadas in vitro ni in vivo.
- Riesgo de alucinación en preguntas fuera de las familias entrenadas, especialmente en resolución de nombres y usos.
- Idiomas limitados a inglés y chino; no hay soporte documentado de castellano.
- Licencia Apache-2.0, que permite uso comercial, pero el propio autor restringe el uso previsto a investigación histórica y farmacológica; el uso comercial en contextos clínicos no está validado.
- El MoE experimental del repositorio no es el modelo recomendado: uno de sus GGUF no carga en llama.cpp 0.3.x y el reparado rinde por debajo del denso.
- La model card incluye rutas de ejemplo con el identificador `tomscot/shennong-1.5b-sft`, distinto del ID del repositorio (`cptlight/shennong-1.5b-sft`); conviene verificar el identificador antes de cargar el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/cptlight/shennong-1.5b-sft
- Demo en vivo (CPU): https://tomscot-shennong.hf.space
- Código: https://github.com/cptlight/shennong
- Protocolo de benchmark y sus defectos: https://github.com/cptlight/shennong/blob/main/docs/BENCHMARK.md
- Auditoría de resolución de nombres: https://github.com/cptlight/shennong/blob/main/docs/RESOLUTION.md
- Procedencia del corpus: https://github.com/cptlight/shennong/blob/main/docs/CORPUS_PROVENANCE.md
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
