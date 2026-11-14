# Hooshaai/bert-comp-zerokv-neo-compressor-sst2

## Resumen

`bert-comp-zerokv-neo-compressor-sst2` es un checkpoint de `google-bert/bert-base-uncased` (109.483.778 parámetros, 12 capas, dimensión oculta 768) afinado sobre GLUE SST-2 y posteriormente procesado con el compresor `zerokv_neo_compressor` (`ZeroKVNeoCompressor`) de la librería NeuralOps, mantenida por el autor Hooshaai. El modelo se distribuye como ejemplo del "Compressed & LoRA-Healed Model Zoo" de NeuralOps, un catálogo de checkpoints comprimidos con distintas técnicas de poda y cuantización.

La técnica aplicada es una poda de pesos por norma L2 orientada a preservar *attention sinks* y *heavy hitters* en la caché KV. Sin embargo, el resultado declarado es un ratio de compresión de 1.00x con una reducción de parámetros del 0,00%: el checkpoint no reduce el tamaño del modelo base. La accuracy en la partición de validación de SST-2 cae del 91,63% del modelo profesor al 49,08%, lo que equivale prácticamente a una clasificación binaria aleatoria.

Por tanto, este repositorio debe interpretarse como un artefacto de demostración de la infraestructura NeuralOps más que como un modelo utilizable en producción. Es relevante para quienes investigan pipelines de compresión de modelos y quieren inspeccionar el formato de serialización, la telemetría de evaluación multi-rango y el flujo de reconstrucción del modelo comprimido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (12 capas, D=768) con cabeza de clasificación de secuencia (2 etiquetas) |
| Parámetros totales | 109.483.778 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base bert-base-uncased soporta 512 tokens) |
| Tipos de cuantización | no disponible (el checkpoint se distribuye en `pytorch_model.bin`, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), configuración `config.json` y `compression_summary.json` |
| Compresor aplicado | `zerokv_neo_compressor` (`ZeroKVNeoCompressor`, familia `kv_cache`) |
| Rango de compresión (`k`) | 32 (checkpoint serializado) |
| Ratio de compresión físico | 1.00x (0,0% de ahorro) |
| Tamaño del repositorio | 0,5 GB (pesos: 451,9 MB) |
| Librería | `neuralops` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder bidireccional estándar de 12 capas y 768 dimensiones ocultas, preentrenado por Google y afinado por el autor sobre la tarea de clasificación de sentimiento SST-2 de GLUE (dos clases: negativo/positivo). Sobre ese checkpoint se aplica el compresor `ZeroKVNeoCompressor`, descrito como una poda de pesos por norma L2 que preserva *attention sinks* y *heavy hitters* de la caché KV, con el objetivo teórico de reducir el coste de memoria asociado a la caché durante la inferencia.

La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre la partición de validación de SST-2 (872 muestras), barriendo los rangos `k=256, 128, 64 y 32`. En los cuatro rangos el recuento de parámetros comprimidos permanece en 109.483.778 y el ratio físico en 1.00x, es decir, el compresor no elimina pesos en ninguno de los ajustes evaluados. La model card indica que NeuralOps aplica un "LoRA healing" (`r=8`, 50 pasos, `lr=2e-4`, presupuesto de 45 s) cuando la compresión en zero-shot degrada más de 2,0 puntos con una reducción superior a 1,10x; en este caso no se activó (`LoRA Recovery Applied: False`). No se detallan el volumen de tokens de entrenamiento, la composición del dataset más allá de SST-2 ni si hubo RLHF/DPO (no aplicable a un encoder de clasificación).

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) sobre texto en inglés, con la cabeza `BertForSequenceClassification` de 2 etiquetas.
- Inferencia estándar de un encoder BERT: representaciones contextuales bidireccionales reutilizables para *feature extraction* o *fine-tuning* posterior.
- Compatibilidad con la API universal de NeuralOps (`load_surgeried_model`) y con el flujo de reconstrucción vía `compress_model` + `load_state_dict`.
- No soporta *tool calling*, *function calling* ni razonamiento multi-paso: es un modelo de clasificación, no un modelo generativo.
- No dispone de modo *thinking*, visión, audio ni capacidades multimodales.
- Multilingüismo limitado al inglés; el vocabulario `bert-base-uncased` es de 30.522 tokens en minúsculas.

## Casos de uso

- **Auditoría de pipelines de compresión**: el checkpoint sirve para inspeccionar el formato de serialización de NeuralOps (`pytorch_model.bin` + `compression_summary.json`) y verificar que la reconstrucción del grafo comprimido carga correctamente antes de aplicar la técnica a modelos mayores.
- **Docencia y reproducción de experimentos**: útil como caso de estudio de una poda que no reduce parámetros y que degrada la accuracy al nivel del azar, para ilustrar la importancia de validar el ratio de compresión efectivo y no solo la configuración declarada.
- **Pruebas de integración de la librería `neuralops`**: permite validar la API `compress_model` y `load_surgeried_model` en un entorno controlado de 0,5 GB antes de desplegar el pipeline en modelos de mayor tamaño.
- **Desarrollo de *harnesses* de evaluación**: el par (modelo profesor 91,63%, modelo comprimido 49,08%) sobre las mismas 872 muestras de validación de SST-2 es un banco de pruebas para medir la sensibilidad de las métricas de clasificación ante perturbaciones de pesos.
- **Prototipado de clasificadores de sentimiento de baja criticidad**: solo si se acepta una precisión cercana al azar; en la práctica no es recomendable para ninguna tarea real de negocio.
- **Investigación sobre caché KV**: el compresor pertenece a la familia `kv_cache`, por lo que el artefacto puede interesar a quienes estudian la preservación de *attention sinks* y *heavy hitters* en mecanismos de atención, aunque en este caso el checkpoint no materialice ahorro de memoria.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` y en la model card (no verificados, `verified: false`). Evaluación sobre GLUE SST-2, partición de validación (872 muestras), en una RTX 3090.

| Modelo / configuración | Ratio físico | Parámetros | Accuracy SST-2 (validación) | Delta vs profesor |
|---|---|---|---|---|
| Profesor (`bert-base-uncased` afinado SST-2) | 1.00x | 109.483.778 | 91,63% | — |
| `zerokv_neo_compressor`, k=256 | 1.00x | 109.483.778 | 49,08% | -42,55 pp |
| `zerokv_neo_compressor`, k=128 | 1.00x | 109.483.778 | 49,08% | -42,55 pp |
| `zerokv_neo_compressor`, k=64 | 1.00x | 109.483.778 | 49,08% | -42,55 pp |
| `zerokv_neo_compressor`, k=32 (checkpoint publicado) | 1.00x | 109.483.778 | 49,08% | -42,55 pp |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K, ni comparaciones con otros checkpoints comprimidos del zoo de NeuralOps.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,45 GB de pesos más activaciones; en FP16 rondaría los 0,23 GB de pesos. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 3090 (la utilizada por el autor para la evaluación), RTX 4090, A100 o H100; cualquier GPU con soporte CUDA es suficiente dado el tamaño.
- Cabe en GPU consumer: sí, en GTX 1660, RTX 3060, RTX 4060 y superiores; también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con `BertForSequenceClassification` tras reconstruir el grafo con `neuralops.core.compression_pipeline.compress_model`; la API `neuralops.hub.load_surgeried_model` carga modelo y tokenizador en una línea. No se documentan rutas vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada. El presupuesto de "LoRA healing" mencionado (45 s) se refiere al proceso de ajuste, no a la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (validación) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-comp-zerokv-neo-compressor-sst2` | 109.483.778 | no disponible (base: 512) | 49,08% | MIT | Hugging Face, librería `neuralops` |
| `google-bert/bert-base-uncased` (profesor, según datos del autor) | 109.483.778 | 512 | 91,63% | Apache 2.0 | Hugging Face, `transformers` |
| Otros checkpoints del NeuralOps Compressed Model Zoo | no disponible | no disponible | no disponible | MIT (según el repositorio NeuralOps) | Hugging Face |

No se dispone en la información proporcionada de alternativas comparables de otros autores (por ejemplo, variantes podadas de BERT para SST-2) con métricas verificables, por lo que la comparativa se limita al modelo base y al propio zoo de NeuralOps.

## Limitaciones y advertencias

- La accuracy declarada (49,08%) está prácticamente al nivel del azar en una tarea binaria balanceada; el modelo no es apto para uso productivo en clasificación de sentimiento.
- El ratio de compresión es 1.00x con 0,00% de reducción de parámetros: el checkpoint no aporta ningún ahorro de memoria ni de cómputo respecto al modelo base.
- El delta de paridad frente al profesor es de -42,55 puntos porcentuales, muy por encima del umbral de tolerancia (>2,0 pp) que la propia model card define para activar el "LoRA healing"; aun así, el healing no se aplicó.
- Los resultados de benchmark están marcados como no verificados (`verified: false`) y proceden únicamente del autor.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas sistemáticas dada la baja accuracy.
- Limitación de idioma: solo inglés; el tokenizador `uncased` pierde información de capitalización.
- La licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0; conviene revisar la compatibilidad de ambas licencias en un despliegue comercial.
- Dependencia de la librería `neuralops` para reconstruir la topología comprimida antes de cargar el `state_dict`; sin ese paso, `load_state_dict(strict=False)` puede dejar pesos sin inicializar correctamente.
- El `repo_id` del ejemplo de código de la model card (`tahamajs/bert-comp-zerokv-neo-compressor-sst2`) no coincide con el ID real del repositorio (`Hooshaai/bert-comp-zerokv-neo-compressor-sst2`), lo que puede provocar errores de descarga si se copia tal cual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-zerokv-neo-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/kv_cache/zerokv_neo_compressor.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
