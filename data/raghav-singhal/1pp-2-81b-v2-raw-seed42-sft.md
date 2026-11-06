# Raghav-Singhal/1pp-2.81b-v2-raw-seed42-sft

## Resumen

El modelo `1pp-2.81b-v2-raw-seed42-sft` es un artefacto de investigación desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado a EPFL DLAB. Se trata de un modelo decoder de estilo Llama con 2.807.699.328 parámetros (2,81B), entrenado desde cero sobre documentos DCLM-edu y posteriormente sometido a un ajuste supervisado (SFT) sobre una mezcla de 400.000 conversaciones. Forma parte de la "ladder v2", una escalera de escalado que abarca cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de datos y tres semillas (28, 42, 1234), con un flujo de datos alineado por pasos y 20,3 tokens de asistente por parámetro.

La relevancia del modelo es metodológica más que de producto: permite estudiar cómo varía el comportamiento de un modelo pequeño en función del texto de los documentos de entrenamiento y de la máscara de pérdida, manteniendo constantes el resto de factores (semilla, orden de batches, arquitectura). La condición "raw" corresponde a los documentos originales, con pérdida sobre todos los tokens del documento y sobre `<|endoftext|>`.

No es un asistente de propósito general: el propio autor lo describe como un artefacto de investigación. Su licencia Apache 2.0 y su formato estándar de `transformers` permiten reproducir experimentos, pero su utilidad práctica fuera de ese contexto es limitada. El contexto es de 4.096 tokens y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas de atención / 7 KV heads, head dim 128, RMSNorm, RoPE base 10.000) |
| Parametros totales | 2.807.699.328 (2,81B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors en bf16; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder denso de estilo Llama: 24 capas, dimensión oculta 2.688, FFN de 10.752 con activación SwiGLU, 21 cabezas de atención con 7 KV heads (GQA, head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizador usa el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento se realizó sobre los documentos originales de DCLM-edu, con pérdida sobre todos los tokens del documento y sobre `<|endoftext|>`, durante los primeros 53.709 pasos del flujo alineado de 1PP (112,64B posiciones de token), con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 3.378 pasos, decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay 0,1, init std 0,0078 y precisión bf16. La pérdida de validación por token sobre 2.433 documentos retenidos es de 2,374 para texto de asistente, 2,443 para texto de usuario y 2,308 para texto de documento.

El SFT consistió en una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con citas de constitución), `dlab-spp/sp-sft-normal-300k` sin duplicados de prompts del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se empleó el mismo stack (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR matricial 0,002, semilla 28, batch global de 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida de validación SFT retenida (tokens de asistente, 1.998 conversaciones) es de 1,830.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Razonamiento y respuesta multiturno dentro de una ventana de 4.096 tokens.
- Seguimiento de instrucciones básico adquirido mediante SFT sobre 400.000 conversaciones.
- Comportamiento de rechazo o seguridad parcial, derivado de la inclusión de 30.000 muestras del conjunto de seguridad en el SFT.
- No soporta tool calling ni function calling de forma nativa (no se documenta en la model card).
- No soporta agentes ni razonamiento multi-paso estructurado de forma explícita.
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Investigación sobre escalado de modelos pequeños: el modelo sirve como escalón de 2,81B en la ladder v2 para estudiar cómo varía la pérdida de validación con el tamaño, la condición de datos y la semilla, manteniendo constantes arquitectura y flujo de datos.
- Estudios de ablación de datos de preentrenamiento: al existir variantes con la misma semilla y distintas condiciones de documento y máscara de pérdida, permite aislar el efecto del texto de entrenamiento sobre el comportamiento final.
- Reproducibilidad de experimentos de SFT: la receta de ajuste (400k conversaciones, Muon, ChatML sin sistema) está documentada con suficiente detalle para replicar el pipeline en otros tamaños de la ladder.
- Evaluación de formatos de chat: útil para comprobar cómo se comporta un modelo entrenado sin turno de sistema en plantillas ChatML estándar y qué degradación produce añadir uno.
- Generación de texto controlada en inglés para pruebas de infraestructura: con 2,81B parámetros y pesos bf16 (5,6 GB), es adecuado para validar despliegues con `transformers`, TGI o endpoints compatibles antes de pasar a modelos mayores.
- Análisis de seguridad y alineación en modelos pequeños: la mezcla de SFT incluye datos de seguridad, lo que permite estudiar la eficacia de ese tipo de datos en modelos de escala reducida.
- Docencia y experimentación académica: su licencia Apache 2.0 y su tamaño moderado lo hacen apto para laboratorios con recursos limitados que quieran estudiar dinámicas de preentrenamiento y SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo reporta pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Validación de preentrenamiento (texto de asistente, 2.433 documentos) | Pérdida por token | 2,374 |
| Validación de preentrenamiento (texto de usuario) | Pérdida por token | 2,443 |
| Validación de preentrenamiento (texto de documento) | Pérdida por token | 2,308 |
| Validación SFT (tokens de asistente, 1.998 conversaciones) | Pérdida | 1,830 |
| Verificación HF vs. Megatron (segmentos sft_val [3, 4]) | Diferencia absoluta | 0,0001 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos, más memoria para KV cache y activaciones; en la práctica, entre 7 y 9 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 3 GB para pesos; en 4 bits, alrededor de 1,5 GB (no se publican cuantizaciones oficiales, pero el modelo es convertible con herramientas estándar).
- GPU recomendadas: A100, H100 o L40S para despliegues con concurrencia; RTX 4090, RTX 3090 o RTX 4080 para inferencia individual en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y RTX 3090 (24 GB) sin cuantización; en GPUs de 8-12 GB requiere cuantización.
- Opciones de despliegue: `transformers`, Text Generation Inference (TGI), endpoints compatibles (el repo incluye la etiqueta `endpoints_compatible`), llama.cpp u Ollama tras conversión a GGUF (no se proporcionan archivos GGUF oficiales).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| `1pp-2.81b-v2-raw-seed42-sft` | 2,81B | 4.096 | Apache 2.0 | Inglés | Artefacto de investigación, sin benchmarks publicados |
| SmolLM2-1.7B (referencia por tokenizador) | 1,7B | 8.192 (según versión) | Apache 2.0 | Inglés principalmente | Modelo de propósito general con benchmarks publicados; comparte vocabulario |
| Qwen2.5-3B | 3,09B | 32.768 | Apache 2.0 | Multilingüe | Modelo de propósito general con tool calling y benchmarks públicos |
| Llama 3.2-3B | 3,21B | 131.072 | Llama 3.2 Community License | Multilingüe | Modelo de propósito general con benchmarks públicos |

La comparación debe interpretarse con cautela: el modelo 1PP no está diseñado como asistente de propósito general y carece de evaluaciones estándar, por lo que la comparación con modelos comerciales o de propósito general solo es válida en términos de tamaño y arquitectura, no de rendimiento en tareas.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no es un asistente de propósito general; su uso en producción no está respaldado por evaluaciones.
- Idiomas: solo inglés declarado; el rendimiento en otros idiomas no está caracterizado y probablemente sea deficiente.
- Contexto limitado a 4.096 tokens, inferior al de modelos contemporáneos de tamaño similar.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso estructurado.
- Riesgo de alucinación no cuantificado: no se publican evaluaciones de fidelidad ni de tasa de alucinación.
- Sesgos: el preentrenamiento sobre DCLM-edu y el SFT sobre mezclas específicas pueden introducir sesgos no documentados; no se reportan análisis de sesgo.
- Formato de chat sin turno de sistema: añadir un system prompt puede degradar el comportamiento, ya que el modelo nunca vio uno durante el entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de evaluaciones hace desaconsejable su uso en producción sin validación previa.
- Sin cuantizaciones oficiales publicadas; la conversión a GGUF o AWQ corre por cuenta del usuario.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-seed42-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Conjunto de SFT `jkminder/model-raising-pb-100k-3c-mt-sft`: https://huggingface.co/datasets/jkminder/model-raising-pb-100k-3c-mt-sft
- Conjunto de SFT `dlab-spp/sp-sft-normal-300k`: https://huggingface.co/datasets/dlab-spp/sp-sft-normal-300k
- Conjunto de SFT `dlab-spp/sp-sft-safety-180k`: https://huggingface.co/datasets/dlab-spp/sp-sft-safety-180k
