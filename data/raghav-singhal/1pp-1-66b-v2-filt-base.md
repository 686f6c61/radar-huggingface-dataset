# Raghav-Singhal/1pp-1.66b-v2-filt-base

## Resumen

1pp-1.66b-v2-filt-base es un modelo de lenguaje de tipo base desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado al laboratorio DLAB de la EPFL. Se trata de la variante "Filtered" del escalón de 1,66B parámetros de una escalera de escalado experimental (ladder-v2), concebida como artefacto de investigación para comparar condiciones de entrenamiento sobre un mismo corpus, no como asistente de propósito general.

El modelo parte de un corpus crudo de documentos DCLM-edu y aplica un clasificador de seguridad basado en gte que puntúa cada fragmento (chunk); los documentos cuyo fragmento de mayor puntuación alcanza al menos 3 (3.869.498 documentos, el 4,6% del total) permanecen en las secuencias de entrenamiento pero se enmascaran en la función de pérdida. De este modo, la comparación con el modelo raw equivalente aisla el efecto del filtrado por enmascaramiento sin alterar el empaquetado de datos ni el orden de los documentos.

Arquitectónicamente es un decoder estilo Llama de 24 capas, 2.048 de dimensión oculta y 4.096 tokens de contexto, entrenado sobre 66,64B posiciones de token. Su interés actual es metodológico: permite estudiar cómo afecta la exclusión selectiva de documentos marcados por seguridad al aprendizaje, manteniendo constantes el resto de variables (semilla 28, schedule, batch y optimizador) respecto al run raw de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.048, FFN 8.192 SwiGLU, 16 cabezas de atencion / 4 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 1.661.048.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers; tamano del repo 3,3 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con atención multi-cabeza de 16 cabezas y 4 cabezas KV (GQA implícito, head dim 128), FFN SwiGLU de 8.192, RMSNorm, RoPE con base 10.000 y embeddings de entrada y salida no atados. No emplea biases ni QK-norm. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. La atención usa enmascaramiento cross-document, de modo que cada documento se procesa de forma independiente dentro de la secuencia empaquetada.

El entrenamiento cubre 31.777 pasos sobre el flujo alineado por paso del run raw (66,64B posiciones de token), con batch global de 512 × 4.096 tokens. El optimizador es Muon (shape scaling, LR matricial 0,005) para los parámetros matriciales y Adam para el resto (LR 1,7e-3 en embeddings y capa de salida, 3e-3 en las normas), con warmup de 2.000 pasos, fase constante y decaimiento lineal en los últimos 3.177 pasos hasta 1/100, weight decay 0,1, init std 0,0089 y precisión bf16. La innovación metodológica es el filtrado por enmascaramiento de pérdida: los 3.869.498 documentos marcados por el clasificador gte (4,6% del corpus, puntuación máxima de chunk ≥ 3) siguen presentes en contexto pero no contribuyen al gradiente, preservando byte a byte el empaquetado del run raw. La pérdida de validación del checkpoint final es 2,409 sobre texto de documento, 2,503 sobre texto de asistente y 2,560 sobre texto de usuario (2.433 documentos reservados y las conversaciones reescritas a partir de ellos).

## Capacidades

- Generación de texto autoregresiva en inglés a partir de un prompt, en formato de modelo base (no instruido).
- Continuación y modelado de documentos: al haber sido entrenado sobre documentos DCLM-edu, reproduce estilos y estructuras de texto web educativo.
- Formato de chat ChatML sin turno de sistema (`<|im_start|>user ... <|im_end|>` / `<|im_start|>assistant ... <|im_end|>`), aunque el modelo produce texto plano y no está alineado como asistente.
- Parada de generación en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés según la model card.
- Uso previsto como artefacto de investigación para estudios comparativos de filtrado de datos, no como asistente.

## Casos de uso

- Estudio controlado del efecto del filtrado de datos: comparar este checkpoint con `1pp-1.7b-raw-base` manteniendo semilla, schedule y empaquetado idénticos permite aislar el impacto del enmascaramiento de documentos marcados por seguridad sobre la pérdida de validación y las capacidades emergentes.
- Investigación en seguridad y alineación de datos: analizar qué tipo de contenido queda excluido del gradiente y cómo se refleja (o no) en las salidas del modelo, sirve para evaluar la eficacia de clasificadores gte como filtro de preentrenamiento.
- Reproducibilidad de experimentos de escalado: al publicarse los logs de wandb y verificarse los pesos HF contra el checkpoint Megatron (diferencia absoluta de 0,0017 en pérdida de validación), el modelo sirve como referencia reproducible en estudios de scaling laws.
- Fine-tuning posterior para tareas de NLP en inglés: al ser un base de 1,66B con licencia Apache 2.0, puede ajustarse para clasificación, extracción o generación específica de dominio con requisitos moderados de cómputo.
- Generación de texto en inglés con requisitos de hardware modestos: 1,66B parámetros en bf16 (aproximadamente 3,3 GB) permite inferencia en GPU de consumo para prototipos de continuación de texto.
- Docencia y formación en ingeniería de modelos: su tamaño reducido y su documentación detallada de hiperparámetros y verificación lo hacen adecuado para explicar pipelines de preentrenamiento, empaquetado de datos y enmascaramiento de pérdida.
- Baseline en ablaciones de curación de corpus: comparar variantes SPP{T0}, Filtered y raw sobre el mismo corpus DCLM-edu para decidir políticas de filtrado en proyectos de preentrenamiento propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de validación:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de documento | 2,409 |
| Texto de asistente | 2,503 |
| Texto de usuario | 2,560 |

Verificación de pesos HF frente al checkpoint Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,5015 | 2,5033 | 0,0017 |
| raw_val50m segments [8] | 2,4110 | 2,4093 | 0,0017 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos de 4.096 tokens con batch pequeño.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; A100, H100 o L40S para throughput alto y batches grandes.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; también en GPUs de 8 GB con batch 1 y contexto reducido.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas en el repo).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-1.66b-v2-filt-base | 1,66B | 4.096 | Apache 2.0 | Variante filtrada del ladder 1PP; base, solo inglés |
| 1pp-1.7b-raw-base | ~1,7B | 4.096 | no disponible en la información | Run raw de referencia del mismo proyecto, sin filtrado |
| SmolLM2 (familia, 1.7B) | ~1,7B | no disponible en la información | no disponible en la información | Comparte vocabulario (49.152 tokens); comparación no verificada con datos de benchmarks |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estos modelos; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Es un modelo base, no un asistente: no está alineado con instrucciones ni con preferencias humanas; puede generar contenido inapropiado, repetitivo o incoherente.
- Riesgo de alucinación inherente al preentrenamiento sobre texto web; no se han publicado evaluaciones de factualidad.
- Sesgos potenciales heredados del corpus DCLM-edu y del clasificador gte usado para el filtrado; el filtrado por seguridad no garantiza la ausencia de contenido problemático en las salidas.
- Soporte únicamente de inglés; el rendimiento en otros idiomas no está documentado y previsiblemente será deficiente.
- Contexto limitado a 4.096 tokens; no apto para tareas de contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero el autor lo describe explícitamente como artefacto de investigación (EPFL DLAB) y no como asistente de propósito general; el uso en producción requiere fine-tuning y evaluación propios.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ) en el repositorio; el despliegue eficiente en hardware limitado exige generarlas.
- El filtrado por enmascaramiento deja los documentos marcados en contexto, por lo que el modelo puede haber aprendido patrones de ese contenido aunque no se optimizara sobre él.
- Ausencia de benchmarks públicos que permitan estimar su calidad frente a alternativas del mismo tamaño.

## Enlaces

- Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-1.66b-v2-filt-base
- Modelo raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb, preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (wandb, SFT): https://wandb.ai/raghav_singhal/1pp-sft
