# positron-ai/google_gemma-4-12B-it-ingest-best-gptq-permuted

## Resumen

`positron-ai/google_gemma-4-12B-it-ingest-best-gptq-permuted` es una compilación cuantizada en 4 bits del modelo `google/gemma-4-12B-it`, publicada por Positron AI. Se trata de un artefacto derivado, no de un modelo entrenado desde cero: el autor parte de los pesos oficiales de Google y aplica cuantización GPTQ con el objetivo de reducir la huella de memoria y facilitar el despliegue en GPUs con menos VRAM que las necesarias para el modelo en precisión completa.

El modelo base pertenece a la familia Gemma 4 de Google en su variante instruct de 12B parámetros (11.959.730.224 parámetros reales según los safetensors del repositorio). La arquitectura declarada es `gemma4_unified` y el pipeline es `image-text-to-text`, lo que indica que el modelo base es multimodal —acepta imagen y texto como entrada y genera texto—, aunque el artefacto cuantizado se etiqueta también como `text-generation`.

La relevancia de esta ficha es práctica: permite evaluar si un build GPTQ de terceros es adecuado para producción. El repositorio ocupa 8,0 GB, tiene 698 descargas y ninguna interacción social. La model card es explícitamente parca: no publica métricas de calidad, divergencia KL ni perplejidad, y remite la validación a seguimiento interno del autor. Esa opacidad es el dato más importante para cualquier evaluador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4_unified` (transformer multimodal, según etiqueta de la librería) |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4 bits, group size 64, simétrica, `desc_act=true`, damp 0,05; activaciones sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con `license_link` a la licencia de Gemma 4 de Google, que prevalece) |
| Formato de pesos | safetensors (GPTQ), compatible con `transformers` |
| Parametros del build | toolchain GPTQModel 7.1.0, transformers 5.11.0, torch 2.9.1, CUDA 12.8 |
| Calibracion | conjunto mixto de dominio, 128 muestras, longitud 4096 |
| Tamano del repositorio | 8,0 GB |
| Fecha de publicacion declarada | 2026-09-02 |

## Arquitectura y entrenamiento

El artefacto no entrena nada: hereda íntegramente la arquitectura y el entrenamiento del modelo base `google/gemma-4-12B-it`. La etiqueta `gemma4_unified` sugiere una arquitectura unificada dentro de la familia Gemma 4, y el pipeline `image-text-to-text` confirma naturaleza multimodal (visión y lenguaje). No se dispone de información sobre número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO o decodificación especulativa; la model card no los documenta.

La innovación técnica del repositorio es exclusivamente la cuantización. Se aplica GPTQ post-entrenamiento a 4 bits sobre pesos, con ordenación descendente de activaciones (`desc_act=true`) y grupo de 64. El `desc_act` activado es relevante: mejora la fidelidad en capas sensibles a la magnitud de activaciones, a costa de una inferencia algo más lenta que con `desc_act=false`. Las activaciones permanecen en precisión original, lo que es el comportamiento habitual en GPTQ y evita el coste de kernels W4A16. El proceso de calibración emplea 128 muestras de 4096 tokens de un conjunto mixto, un tamaño de calibración estándar pero no especialmente generoso, lo que puede afectar a la robustez fuera del dominio de calibración.

No hay información sobre si se preservaron las capas de visión en el proceso de cuantización, ni sobre cómo se comporta la torre visual a 4 bits. Es un punto ciego importante dado el pipeline multimodal declarado.

## Capacidades

- Generación de texto conversacional en modo instruct, heredada del modelo base.
- Procesamiento de entrada imagen-texto según el pipeline declarado (`image-text-to-text`); la preservación de esta capacidad tras la cuantización no está documentada.
- Razonamiento y matemáticas: presumibles por la familia base, sin métricas publicadas que lo confirmen en este build.
- Generación de código: presumible por la familia base, sin datos específicos.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (el campo de idiomas figura como no disponible).
- Modo de razonamiento explícito (thinking): no documentado.

## Casos de uso

- Despliegue en GPUs de gama media para prototipado: con pesos de 4 bits y un repositorio de 8,0 GB, el modelo cabe en tarjetas de 12-16 GB de VRAM (por ejemplo, RTX 4080 o 4070 Ti SUPER) siempre que la ventana de contexto se mantenga moderada. Adecuado para entornos de desarrollo donde no hay acceso a A100/H100.
- Servicio de chat interno con presupuesto de VRAM ajustado: al reducir el peso de los parámetros, se libera memoria para caché KV, lo que permite sostener conversaciones multi-turno en una sola GPU consumer.
- Evaluación comparativa de formatos de cuantización: útil como referencia GPTQ frente a otros builds (AWQ, GGUF) del mismo `gemma-4-12B-it` antes de fijar un formato en producción.
- Procesamiento de documentos con imagen escaneada y extracción de texto: si la torre visual sobrevive a la cuantización, el pipeline imagen-texto permitiría tareas de descripción y extracción; requiere validación previa obligatoria.
- Base para fine-tuning con QLoRA: un checkpoint GPTQ no es el formato habitual para QLoRA (se prefiere bnb-4bit), pero puede servir como referencia de calidad del cuantizado antes de adaptar.
- Entornos de CI con tests de regresión de calidad: desplegar este build en un runner con GPU para detectar degradaciones respecto al modelo original en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no reporta métricas de rendimiento ni de calidad (sin divergencia KL, sin accuracy, sin perplejidad) y que la validación se gestiona internamente.

| Metrica | Valor |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Perplejidad / KL-divergence vs. base | no disponible |
| Throughput / latencia | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7-8 GB solo para pesos (4 bits sobre 12B parámetros). Con caché KV y overhead del runtime, un presupuesto realista de 10-14 GB para contextos moderados; contextos largos elevan el requisito de forma significativa.
- GPU recomendadas: RTX 4090 (24 GB) para contexto amplio y holgura; RTX 4080 / 4070 Ti SUPER (16 GB) para uso con contextos moderados; A100 40 GB y H100 para servir varias instancias o contextos muy largos.
- Cabe en GPU consumer: sí, en tarjetas de 16 GB en adelante con cuantización GPTQ 4 bits. En 12 GB es ajustado y depende de la longitud de contexto.
- Opciones de despliegue: `transformers` con kernels GPTQ (toolchain declarado: GPTQModel 7.1.0, transformers 5.11.0, torch 2.9.1, CUDA 12.8). Para servir a escala, vLLM o TGI si soportan `gemma4_unified` con GPTQ; llama.cpp/Ollama requerirían convertir a GGUF, lo que es un proceso aparte. La compatibilidad con endpoint no está verificada más allá de la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| positron-ai/google_gemma-4-12B-it-ingest-best-gptq-permuted | 11,96B | no disponible | GPTQ 4-bit | apache-2.0 (+ licencia Gemma 4) | Build de terceros, sin métricas |
| google/gemma-4-12B-it (base) | 11,96B | no disponible | BF16/FP16 original | licencia Gemma 4 | Modelo oficial de Google |
| Otros builds cuantizados del mismo base | 11,96B | no disponible | AWQ / GGUF / GPTQ alternativos | según autor | no verificado en esta ficha |

La comparación relevante no es frente a otras familias, sino frente al propio modelo base en precisión completa: este build sacrifica fidelidad numérica a cambio de ~4x menos memoria en pesos. Al no publicarse métricas, no es posible cuantificar esa pérdida.

## Limitaciones y advertencias

- Ausencia total de métricas de calidad: no hay perplejidad, KL-divergence ni evaluaciones de tarea. Desplegar sin una validación propia previa es arriesgado.
- La licencia declarada como `apache-2.0` convive con `license_link` a la licencia de Gemma 4 de Google. La model card indica que las restricciones del modelo original siguen aplicándose; en la práctica debe prevalecer la licencia de Google, no la Apache-2.0 del artefacto.
- Build de terceros no oficial: no procede de Google y no hay garantía de mantenimiento ni de corrección de defectos. Cero likes y 698 descargas indican escasa validación comunitaria.
- Cuantización a 4 bits: degradación esperable en tareas sensibles a precisión numérica (matemáticas, código con sintaxis estricta, razonamiento de cadena larga). No cuantificada.
- Calibración con solo 128 muestras de 4096 tokens: posible sesgo hacia el dominio de calibración y comportamiento errático fuera de él.
- Capacidad multimodal incierta: el pipeline se declara `image-text-to-text`, pero no se documenta si la torre visual se cuantizó ni con qué calibración, lo que pone en duda la fiabilidad en tareas de imagen.
- Idiomas no declarados: no hay confirmación de soporte multilingüe ni de calidad por idioma.
- Contexto no documentado: imposible dimensionar la caché KV o planificar despliegues con ventanas largas.
- Riesgo de alucinación: inherente al modelo base, no mitigado ni evaluado en este build.
- Toolchain muy reciente (transformers 5.11.0, torch 2.9.1): posibles incompatibilidades con entornos de producción estables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/positron-ai/google_gemma-4-12B-it-ingest-best-gptq-permuted
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Documentación de GPTQModel: https://github.com/ModelCloud/GPTQModel
- Documentación de transformers (carga de modelos GPTQ): https://huggingface.co/docs/transformers/main/en/quantization/gptq
