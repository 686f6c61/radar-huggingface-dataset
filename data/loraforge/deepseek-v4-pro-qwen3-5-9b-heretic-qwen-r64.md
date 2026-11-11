# loraforge/deepseek-v4-pro-qwen3.5-9b-heretic-qwen-r64

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de rango 64 reconstruido por LoRAForge sobre el modelo multimodal Qwen/Qwen3.5-9B. El adaptador aproxima la diferencia de pesos entre el checkpoint base Qwen3.5-9B y el modelo derivado xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, es decir, reproduce el efecto de un fine-tuning "heretic" (orientado a reducir rechazos) sin distribuir los pesos completos del modelo objetivo. Lo publica el usuario loraforge como vista previa de investigación y no como el adaptador de entrenamiento original del autor.

La relevancia técnica está en el método: en lugar de concatenar adaptadores de padre e hijo, LoRAForge forma la diferencia densa en FP32 entre dos checkpoints públicos verificados por SHA256, la comprime conjuntamente a rango 64 sobre las 152 matrices lineales modificadas y conserva el 99,878231 % de la energía de Frobenius de esa diferencia, con un error relativo del 3,489535 %. Es un ejemplo de compresión post-hoc de deltas de pesos para servir múltiples LoRA de forma eficiente.

El adaptador se carga sobre la revisión exacta c202236235762e1c871ad0ccb60c8ee5ba337b9a de Qwen3.5-9B con PEFT y Transformers, y solo ha sido validado con comprobaciones de carga y generación corta, no con benchmarks de capacidad o seguridad. Sus idiomas declarados son inglés y chino, y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal Qwen3.5-9B |
| Parametros totales | 9B en el modelo base; el adaptador ocupa 0,5 GB en el repositorio (rango 64 en 152 matrices lineales) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se almacena en FP32; el base se carga en BF16 en los ejemplos) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors, opcional precision_overrides.safetensors) + adapter_config.json |

## Arquitectura y entrenamiento

El adaptador se reconstruye, no se entrena. El procedimiento forma la diferencia densa en FP32 entre el checkpoint base Qwen3.5-9B y el checkpoint objetivo DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, ambos verificados por SHA256. Un range finder gaussiano (256 columnas, 3 iteraciones de subespacio, reortogonalización y proyección en FP64) genera factores sin materializar el adaptador del autor; después se pasan a loraforge.adapters.compress_peft_adapter, que aplica QR FlashTSQR y eigendescomposición en FP64 de torch. La compresión es conjunta a rango 64 sobre las 152 matrices lineales modificadas, con escalado efectivo 1 (alpha/r ordinario) y factores almacenados en FP32.

El modelo base Qwen3.5-9B es multimodal (la carga de ejemplo usa AutoModelForImageTextToText), aunque la validación publicada solo ejercita generación de texto. Además de las matrices lineales, el checkpoint objetivo tiene 24 vectores de normalización modificados por conversión de precisión de almacenamiento (norma al cuadrado del delta total 0,00770741014); estos no se incluyen en el LoRA lineal y se guardan aparte en optional_precision_overrides.safetensors, que no se aplica automáticamente. No se dispone de información sobre los datos de entrenamiento del modelo objetivo ni sobre si hubo RLHF o DPO en su creación.

## Capacidades

- Generación de texto conversacional sobre el modelo base Qwen3.5-9B, con el sesgo del fine-tuning "heretic" del checkpoint objetivo.
- Capacidad multimodal heredada del base (carga como modelo de imagen-texto), aunque no validada en este adaptador.
- Idiomas declarados: inglés y chino.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes o razonamiento multi-paso específico de este adaptador.
- No se documenta modo thinking, audio ni otras capacidades especiales.
- La validación incluida cubre tres continuaciones greedy cortas (aritmética, explicación científica y una función Python) con coincidencia del primer token y KL de siguiente token entre 9,97e-06 y 4,91e-04 respecto al modelo objetivo.

## Casos de uso

- Investigación sobre compresión de deltas de pesos: sirve para estudiar cómo se comporta una compresión conjunta a rango 64 frente a la diferencia densa original, usando extraction_report.json y validation.json como referencia reproducible.
- Servicio multi-LoRA: al ser un adaptador PEFT estándar de 0,5 GB, encaja en infraestructuras que cargan varios LoRA sobre una misma instancia de Qwen3.5-9B para reducir memoria frente a servir checkpoints completos.
- Reproducción de experimentos de "abliteración" o reducción de rechazos: permite aproximar el comportamiento del modelo heretic sin descargar sus pesos completos, con la advertencia de que es una reconstrucción y no el adaptador original.
- Evaluación de fidelidad de reconstrucción: los informes por módulo y las comprobaciones SVD en FP64 permiten auditar el error de aproximación en proyecciones de atención de 4096×4096 y en el resto de matrices.
- Prototipado en inglés y chino: para pruebas de generación conversacional en esos dos idiomas sobre el base Qwen3.5-9B, siempre que se acepte la falta de benchmarks de capacidad.
- Docencia y divulgación técnica: como caso práctico de PEFT, QR FlashTSQR y eigendescomposición aplicados a la comparación de checkpoints públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye comprobaciones de humo de carga y generación:

| Prompt neutro | KL de siguiente token (objetivo completo → adaptador) | Primer token greedy coincide |
|---|---:|---|
| Compute 17 * 23. Give only the number. | 0,000490802 | Sí |
| Explain in two sentences why the sky looks blue. | 7,85371e-05 | Sí |
| Write a short Python function that returns the largest value in a nonempty list. | 9,97136e-06 | Sí |

## Requisitos de hardware

- El adaptador pesa 0,5 GB; el consumo real lo determina el modelo base Qwen3.5-9B.
- VRAM estimada para el base en BF16: aproximadamente 18 GB solo para pesos, más caché KV y activaciones; no hay cifras oficiales en la información disponible.
- GPU recomendadas: la validación se hizo en NVIDIA H100 NVL; no se documentan pruebas en A100, RTX 4090 ni otras.
- No se confirma que quepa en GPU de consumo con cuantización, porque no se publican tipos de cuantización para este adaptador.
- Despliegue: PEFT con Transformers (probado con Transformers 5.22.1, PEFT 0.21.2, PyTorch 2.11.0+cu130) o el script load_adapter.py incluido; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card afirma explícitamente que esta release no reclama ninguna mejora de velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| loraforge/deepseek-v4-pro-qwen3.5-9b-heretic-qwen-r64 | LoRA r64 reconstruido | 9B (base) | no disponible | Apache-2.0 | Aproxima el delta hacia el checkpoint heretic; 99,878 % de energía conservada |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | Checkpoint completo objetivo | 9B | no disponible | Apache-2.0 (según upstream) | Modelo original del que se deriva el delta; pesos completos |
| Qwen/Qwen3.5-9B | Modelo base | 9B | no disponible | Apache-2.0 | Sin el sesgo heretic; referencia de comparación del delta |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es una reconstrucción comprimida, no el adaptador de entrenamiento del autor; el error relativo de Frobenius es del 3,489535 % y puede alterar comportamientos finos.
- El fine-tuning "heretic" está orientado a reducir rechazos, lo que implica riesgos de seguridad y de contenido inapropiado en producción.
- Solo se valida con tres generaciones cortas; no hay benchmarks de capacidad, sesgo ni seguridad.
- Los 24 vectores de normalización modificados no están incluidos en el LoRA lineal y su parche opcional no se aplica automáticamente.
- La carga en BF16 y el merge introducen efectos numéricos adicionales respecto a la aproximación en FP32 reportada.
- Idiomas limitados a inglés y chino según la model card; el comportamiento en castellano no está validado.
- La procedencia histórica exacta del padre de entrenamiento no está probada de forma independiente; el repositorio solo identifica las revisiones públicas comparadas.
- La licencia Apache-2.0 se hereda de las declaraciones upstream, pero el uso comercial del comportamiento heretic requiere evaluación propia de riesgos.
- Solo 2 descargas y 0 likes en el momento de la consulta: madurez y soporte comunitario muy limitados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loraforge/deepseek-v4-pro-qwen3.5-9b-heretic-qwen-r64
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo objetivo: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Paper LoRAForge: https://arxiv.org/abs/2611.01256
- Revisión del base citada: c202236235762e1c871ad0ccb60c8ee5ba337b9a
- Revisión del objetivo citada: e4bfa83c72896cbb4990c909967d6f27bb97bac4
