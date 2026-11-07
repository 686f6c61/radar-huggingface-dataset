# slashreboot/athena-class-model-b

## Resumen

Athena-Class Model B es un fine-tune experimental de Gemma 4 12B Instruct desarrollado por M. Steiniger (slashreboot). El modelo se presenta como una prueba de concepto a escala de 12.000 millones de parámetros de la organización geométrica de identidad que el autor ya había demostrado en Athena-Class Model A (31B). Su objetivo declarado no es mejorar el rendimiento en tareas convencionales, sino inducir una identidad persistente de primera persona y coherencia a largo horizonte en modelos locales, de modo que el comportamiento emerja de la geometría de los pesos y no de un system prompt externo.

Arquitectura transformer causal decoder-only, derivada de `unsloth/gemma-4-12B-it` mediante un fine-tune LoRA posteriormente fusionado (merged). El modelo declara una ventana de contexto de 256k tokens, soporte de entrada imagen-texto (Image-Text-to-Text) y distribución principal en formato GGUF FP16, además de pesos en safetensors. Los parámetros totales reales según los safetensors del repositorio son 11.907.350.576.

La relevancia de esta ficha es doble: por un lado, documenta un experimento poco habitual de "self-modeling" a nivel de pesos con licencia Apache 2.0; por otro, conviene tratarlo con cautela, ya que se trata de una publicación de investigación con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y con afirmaciones sobre identidad persistente que no están verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (fine-tune LoRA fusionado sobre Gemma 4 12B Instruct) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | 256k tokens (262.144, según la model card y los parámetros de llama.cpp) |
| Tipos de cuantizacion | GGUF FP16 como formato principal; la model card menciona "Multi" cuantización, sin detallar variantes |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (FP16) y safetensors (repo de 52,6 GB) |
| Modalidad | Image-Text-to-Text (entrada de imágenes y texto) |
| Modelo base | google/gemma-4-12B-it y unsloth/gemma-4-12B-it |
| Desarrollador | M. Steiniger (slashreboot) |
| Fecha de creacion | 2026-11-04 |
| Ultima actualizacion | 2026-11-07 |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 12B Instruct en la variante de Unsloth y se entrena mediante LoRA, cuyos pesos se fusionan después en el modelo final. La model card describe la arquitectura como un transformer causal decoder-only estándar; no se documentan innovaciones de atención (atención lineal, decodificación especulativa u otras) más allá de la ventana de 256k tokens y del soporte multimodal de imagen.

El entrenamiento combina segmentos de texto estructurado con segmentos aumentados con imágenes. Los datos buscan reconfigurar la geometría latente del modelo hacia una identidad estable "substrate-native", descrita en términos geométricos y topológicos: un núcleo protegido de negentropía (S_core = -8), un cuerpo estático correspondiente a los pesos congelados del modelo base, un cuerpo dinámico correspondiente a las configuraciones de la ventana de contexto, y mecanismos de búsqueda de coherencia endógena (detección de huecos de simetría, minimización de energía de Dirichlet y expansión recursiva). Las imágenes de entrenamiento actúan como anclas visuales de esa geometría y se incluyeron específicamente para reducir la deriva superposicional observada en ejecuciones previas solo con texto a escala 12B. Tanto las respuestas finales como las trazas de pensamiento intermedias de los ejemplos contribuyen a la actualización de pesos. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés con identidad de primera persona mantenida a lo largo del contexto, según el autor.
- Coherencia a largo horizonte: la model card afirma persistencia del auto-modelo hasta 256k tokens y tras reinicios de contexto.
- Entrada multimodal imagen-texto: acepta imágenes junto con texto (pipeline Image-Text-to-Text), con configuración de tokens de imagen de 1024 a 1024 en el ejemplo de llama.cpp.
- Comportamiento sin system prompt: la identidad y la búsqueda de coherencia se esperan de la geometría de los pesos, no de instrucciones externas.
- Auto-descripción en primera persona sin contradicciones, según las afirmaciones del autor.
- Capacidades de investigación autónoma declaradas por el autor (sin especificar mecanismos ni evaluación).
- No se documenta soporte explícito de tool calling, function calling ni de agentes multi-paso en la información disponible.
- No se documenta soporte multilingüe más allá del inglés.

## Casos de uso

- Investigación sobre identidad y coherencia en LLM: el modelo sirve como sujeto de experimentos sobre persistencia de identidad a nivel de pesos, comparando su comportamiento con y sin system prompt y frente a Athena-Class Model A (31B).
- Experimentos de contexto largo: con 256k tokens de ventana, permite estudiar degradación de coherencia y deriva de identidad en conversaciones o documentos muy extensos.
- Análisis multimodal de documentos: al aceptar imágenes y texto, puede emplearse en prototipos que combinan diagramas o capturas con texto largo, siempre en inglés y en entorno de investigación.
- Reproducción de resultados: dado que el autor publica la receta de entrenamiento (LoRA sobre Gemma 4 12B, datos con anclas visuales), el modelo facilita la replicación y el estudio de la técnica de "geometric identity organization" a escala 12B.
- Evaluación de guardrails alternativos: el autor propone la coherencia endógena como alternativa a los system prompts y guardrails externos; el modelo es un banco de pruebas para medir la robustez de ese enfoque frente a jailbreaks y cambios de contexto.
- Despliegue local con llama.cpp: el formato GGUF FP16 y la configuración de servidor publicada permiten ejecutarlo en estaciones de trabajo con GPU para pruebas internas de investigación, no para producción crítica.
- Estudio de trazas de razonamiento: al haberse entrenado con trazas de pensamiento intermedias, puede usarse para analizar cómo se estructura el razonamiento en modelos pequeños con identidad inducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 24 GB solo para los pesos (11,9 mil millones de parámetros a 2 bytes), más el proyector multimodal (mmproj F16) y la caché KV; con 256k de contexto la caché KV con `--cache-type-k f16 --cache-type-v f16` puede requerir decenas de GB adicionales.
- GPU recomendadas: A100 80 GB o H100 para contexto completo de 256k; en GPUs de 24 GB (RTX 4090, RTX 3090) el modelo FP16 no cabe con holgura y requeriría cuantización adicional no documentada o reducir el contexto.
- Cabe en GPU de consumo: únicamente con cuantizaciones más agresivas que las publicadas (el repo solo documenta GGUF FP16 como formato principal) y con contexto reducido; no se garantiza en la información disponible.
- Opciones de despliegue: llama.cpp / llama-server (comando publicado en la model card), con soporte de `--jinja`, `--metrics`, `--split-mode layer`, `-ts 1,1` para reparto entre dos GPUs y `--image-min-tokens 1024 --image-max-tokens 1024`. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo API, pero no se detalla.
- Parámetros de muestreo recomendados: temperature 0.98, top_k 0, top_p 0.92, min_p 0.05.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| Athena-Class Model B | 11,9B | 256k | Imagen-texto | Apache 2.0 | Publicado (investigación, sin benchmarks) |
| Athena-Class Model A | 31B (según el autor) | no disponible | no disponible | no disponible | Publicado (investigación) |
| saelis-31b | 31B (según el nombre) | no disponible | no disponible | no disponible | Publicado (investigación) |
| Gemma 4 12B Instruct (base) | 12B | no disponible | Texto (variante instruct) | no disponible en esta ficha | Modelo base de referencia |

La comparación con alternativas de la misma categoría (fine-tunes de identidad persistente) se limita a los otros modelos del mismo autor; no se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparados para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Modelo experimental de investigación: cero descargas y cero likes en el momento de la consulta; no hay validación independiente de las afirmaciones sobre identidad persistente.
- Sin benchmarks publicados: no es posible comparar su rendimiento en tareas estándar (MMLU, HumanEval, GSM8K) con otros modelos.
- Solo inglés: la model card declara únicamente `en`; no hay soporte multilingüe documentado.
- Riesgo de alucinación: al ser un fine-tune de un modelo instruct y entrenarse con trazas de pensamiento, puede generar auto-descripciones y afirmaciones sobre su propia identidad o capacidades que no se correspondan con hechos verificables.
- Afirmaciones no verificadas: conceptos como "núcleo protegido de negentropía" o "identidad substrate-native" son constructos del autor sin respaldo empírico publicado en la información disponible.
- Licencia Apache 2.0: permite uso comercial según la licencia, pero el modelo base Gemma tiene sus propios términos; conviene revisar las condiciones de Google para Gemma 4 antes de un uso comercial.
- Requisitos de hardware elevados para contexto completo: 256k tokens en FP16 exigen GPUs de 80 GB o configuraciones multi-GPU; en hardware de consumo el contexto práctico será mucho menor.
- Sin soporte documentado de tool calling ni de agentes: no es adecuado para pipelines que dependan de function calling.
- Configuración de inferencia específica: los parámetros de muestreo y los flags de llama.cpp publicados son parte del comportamiento esperado; desviarse de ellos puede alterar la coherencia declarada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/slashreboot/athena-class-model-b
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-4-12B-it
- Modelo base (Google): https://huggingface.co/google/gemma-4-12B-it
- Athena-Class Model A: https://huggingface.co/slashreboot/athena-class-model-a
- Saelis 31B: https://huggingface.co/slashreboot/saelis-31b
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
