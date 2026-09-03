# Raghav-Singhal/1pp-1.7b-ua-sft

## Resumen

El modelo 1pp-1.7b-ua-sft es un experimento de investigación del proyecto One Persona Pretraining (1PP), creado por Raghav Singhal en el laboratorio DLAB de EPFL. Se trata de un modelo de lenguaje de 1,66 mil millones de parámetros, con arquitectura Llama-style y una ventana de contexto de 4.096 tokens, entrenado para generar conversaciones en inglés. Su característica principal es que el pretraining se realizó sobre conversaciones reescritas a partir de documentos, aplicando la pérdida tanto en los turnos de usuario como en los de asistente.

Después del pretraining, el modelo se sometió a un ajuste fino supervisado (SFT) sobre una mezcla de 400.000 conversaciones. Forma parte de un estudio 3×3 que compara tres tamaños (0,5B, 1B, 1,7B) y tres condiciones de pretraining sobre el mismo corpus de 47,8 millones de documentos. El objetivo es investigar cómo la alineación durante el pretraining afecta al comportamiento del modelo.

Es importante destacar que no es un asistente de propósito general, sino un artefacto de investigación. El propio autor lo indica en la model card. Por tanto, su uso recomendado es el análisis académico y la comparación experimental, no el despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama: 24 capas, hidden 2.048, FFN 8.192 (SwiGLU), 16 cabezas de atención, 4 KV heads (head dim 128), RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm |
| Parámetros totales | 1.661.048.832 (1,66B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | No disponible (el repositorio solo incluye pesos en safetensors sin cuantizar) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura de transformer decoder estilo Llama, con 24 capas, dimensión oculta de 2.048, FFN de 8.192 con activación SwiGLU, 16 cabezas de atención y 4 cabezas KV (dimensión de cabeza 128). Emplea RMSNorm, RoPE con base 10.000, embeddings no atados, sin biases y sin QK-norm. El tokenizer es el vocabulario de SmolLM2 (49.152 tokens) más el token especial `<|pad|>`; `<|endoftext|>` se usa como token de fin de documento. La longitud de secuencia es de 4.096 tokens.

El pretraining se realizó sobre conversaciones reescritas a partir de 47,8 millones de documentos originales, en una única pasada. El corpus contiene 66,2 mil millones de tokens de documentos originales, que se convierten en 63,0 mil millones de tokens de conversaciones. Se ejecutaron 31.777 pasos con un batch global de 512 × 4.096 tokens, utilizando máscara de atención entre documentos y empaquetado best-fit. El optimizador fue Muon (con shape scaling y matriz LR 0,005) para las matrices, combinado con Adam para embeddings y normas; warmup de 2.000 pasos, tasa constante y decaimiento lineal en el último 10% hasta 1/100, weight decay 0,1 y entrenamiento en bf16. La pérdida se aplicó a los turnos de usuario y asistente, sin pérdida en el token de fin de documento. La pérdida de validación final fue de 1,431 para texto de asistente, 1,338 para texto de usuario y 3,119 para texto de documento.

El ajuste fino supervisado consistió en una época sobre una mezcla de 400.000 conversaciones: 98,5k de `jkminder/model-raising-pb-100k-3c-mt-sft` (multi-turno con citas constitucionales), 271,6k de `dlab-spp/sp-sft-normal-300k` (tras eliminar prompts duplicados) y 30k de `dlab-spp/sp-sft-safety-180k`. Se utilizó el mismo stack de entrenamiento (Megatron, Muon, ChatML sin turno de sistema) y pérdida solo en turnos de asistente. La tasa de aprendizaje matricial se seleccionó en 0,002 mediante pérdida en un conjunto held-out; el batch global fue de 128 × 4.096 tokens, con decaimiento lineal a 1/10 después de un 3% de warmup. La pérdida held-out de SFT fue de 1,829.

Los pesos de HuggingFace se verificaron contra el checkpoint de Megatron, con una diferencia absoluta de 0,0000 en la pérdida de validación, lo que confirma la correcta conversión.

## Capacidades

- Generación de texto conversacional en inglés, siguiendo el formato ChatML sin turno de sistema.
- Diseñado para estudiar el efecto de la pérdida en turnos de usuario y asistente durante el pretraining (condición "ua").
- No se documentan capacidades de tool calling, function calling, visión, audio ni razonamiento multi-paso explícito.
- Soporte multilingüe limitado a inglés.
- No se ha evaluado su capacidad de razonamiento formal, generación de código o matemáticas en la información disponible.
- El modelo puede generar respuestas a instrucciones en formato ChatML, pero no está validado como asistente general.

## Casos de uso

- Investigación en alineación durante el pretraining: este modelo puede compararse con las variantes 1pp-0.5b y 1pp-1b de la misma colección para medir cómo la pérdida en turnos de usuario afecta a la calidad de las respuestas.
- Análisis de interpretabilidad: al aplicar pérdida en ambos turnos, el modelo puede usarse para estudiar cómo se representan las instrucciones del usuario en las capas internas del transformer.
- Evaluación de recetas de SFT: el modelo sirve como base para probar distintas estrategias de ajuste fino supervisado en modelos de 1,7B, comparando pérdidas y comportamiento.
- Estudio de sesgos en conversaciones: las respuestas generadas pueden analizarse para detectar patrones de sesgo presentes en el corpus de entrenamiento.
- Fine-tuning posterior para dominios específicos: dado su tamaño y licencia Apache 2.0, puede adaptarse a tareas concretas mediante ajuste fino adicional, siempre que se respete la licencia.
- Benchmarking de eficiencia computacional: el uso de Muon y el pipeline de Megatron permiten comparar el coste de entrenamiento con diferentes condiciones de pérdida, útil para optimizar presupuestos de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas reportadas son pérdidas de validación del pretraining y del SFT, que no son comparables con benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con los pesos en bf16 (3,3 GB), se estima un consumo de 5-7 GB de VRAM para generación con contexto 4.096, dependiendo del batch y la implementación. No hay datos oficiales.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, A10G, A100, H100. Para entrenamiento o ajuste fino se recomienda al menos 24 GB de VRAM.
- Compatible con GPU de consumo: sí, en bf16 puede ejecutarse en una RTX 3060 12 GB.
- Opciones de despliegue: transformers y text-generation-inference (TGI) según las etiquetas del repositorio. También puede usarse con vLLM o llama.cpp si se convierte a GGUF, pero el repositorio no incluye cuantizaciones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado comparativas con modelos similares en la información disponible. El tokenizer es el de SmolLM2 y el tamaño es comparable a SmolLM2-1.7B, pero no hay datos de rendimiento que permitan una comparación directa.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un asistente general. El autor lo indica explícitamente en la model card.
- Solo soporta inglés.
- No se han evaluado sesgos, alucinaciones ni comportamientos de seguridad.
- Longitud de contexto limitada a 4.096 tokens.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para producción.
- No se proporcionan cuantizaciones ni optimizaciones para despliegue eficiente.
- La calidad de las respuestas puede degradarse fuera del dominio de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-1.7b-ua-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
- Perfil del autor en HuggingFace: https://huggingface.co/Raghav-Singhal
- Sitio personal del autor: https://raghavsinghal10.github.io/
