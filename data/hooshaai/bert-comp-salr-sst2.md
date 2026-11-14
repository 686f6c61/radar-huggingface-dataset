# Hooshaai/bert-comp-salr-sst2

## Resumen

`Hooshaai/bert-comp-salr-sst2` es un checkpoint de BERT-Base comprimido físicamente mediante la técnica SALR (Structure-Aware / Sparse Low-Rank), implementada en la librería NeuralOps, y posteriormente "curado" con adaptadores LoRA de rango 8. Parte de `google-bert/bert-base-uncased` (109.483.778 parámetros, 12 capas, dimensión oculta 768) afinado sobre GLUE SST-2, y lo reduce a 35.165.954 parámetros, lo que supone una compresión física de 3,11x y una reducción del 67,88% de parámetros con un rango de descomposición k=64.

El modelo resuelve un problema concreto de investigación: explorar el compromiso entre ratio de compresión y calidad en clasificación de sentimiento. Sin embargo, el resultado declarado es muy deficiente: la precisión en validación de SST-2 cae al 49,08% frente al 91,63% del profesor original, una pérdida de paridad de 42,55 puntos porcentuales. Esto lo sitúa prácticamente en el nivel de un clasificador aleatorio binario, por lo que debe interpretarse como un artefacto de evaluación del pipeline de compresión, no como un modelo listo para producción.

El interés actual del checkpoint es metodológico: documenta de forma transparente los fallos de compresión en rangos k=256, 128 y 32 (que provocan crash), y muestra que el "healing" con LoRA de 50 pasos no recupera la calidad en el rango k=64. Es relevante para quienes trabajan en compresión de modelos, pruning y low-rank factorization, así como para auditar las limitaciones de las técnicas de recuperación LoRA en tareas de clasificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, D=768), comprimido con SALR (SVD + pruning de cuello de botella) y LoRA r=8 |
| Parametros totales | 35.165.954 (comprimido); modelo base original: 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base BERT-Base acepta hasta 512 tokens) |
| Tipos de cuantizacion | No disponible (el repo contiene pesos en `pytorch_model.bin`, sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), configuracion en `config.json`, telemetria en `compression_summary.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-Base uncased: un transformer encoder de 12 capas con dimensión oculta 768 y 109.483.778 parámetros. Sobre ese modelo afinado en SST-2 se aplica el compresor SALR, que combina descomposición en valores singulares (SVD) con pruning de cuello de botella para producir una topología de bajo rango. El checkpoint empaquetado corresponde al rango k=64, con 35.165.954 parámetros y un ratio de compresión físico de 3,113x. El proceso se ejecutó sobre una NVIDIA GeForce RTX 3090 (24 GB) y se evaluó en el split de validación de GLUE SST-2 (872 muestras).

El pipeline de NeuralOps aplica "LoRA healing" cuando la compresión zero-shot degrada la precisión más de 2,0 puntos y reduce parámetros más de 1,10x. En este caso se aplicó un adaptador LoRA de rango 8 con 50 pasos, learning rate 2e-4 y un presupuesto de 45 segundos. Los rangos k=256, 128 y 32 fallaron con `FAIL_CRASH`, por lo que solo el checkpoint k=64 se serializó. No se documentan en la información disponible los datos de preentrenamiento originales, el número de tokens de afinamiento ni si hubo RLHF/DPO (no aplica a un clasificador de sentimiento).

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) sobre texto en inglés, con dos etiquetas de salida.
- Inferencia sobre entradas tokenizadas con el vocabulario estándar `bert-base-uncased`.
- Carga mediante la API universal de NeuralOps (`load_surgeried_model`) o reconstrucción manual del pipeline de compresión.
- No soporta tool calling ni function calling: es un modelo de clasificación, no generativo.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.
- No dispone de modo "thinking", visión ni audio.
- El rendimiento efectivo de clasificación es prácticamente aleatorio (49,08% de accuracy en SST-2), por lo que su utilidad práctica como clasificador es nula.

## Casos de uso

- Evaluación de pipelines de compresión: sirve como caso de estudio reproducible para medir cómo afecta SALR con k=64 a la precisión de un clasificador BERT, comparando con el profesor al 91,63%.
- Auditoría de técnicas de "healing" con LoRA: permite analizar por qué 50 pasos de LoRA r=8 no recuperan la calidad tras una compresión agresiva, útil para investigar presupuestos de recuperación.
- Reproducción de experimentos de low-rank factorization: el `compression_summary.json` documenta los rangos evaluados y los fallos, lo que facilita replicar y depurar el pipeline.
- Docencia sobre compresión de modelos: ejemplo claro de que un ratio de 3,11x puede destruir la utilidad de un clasificador si no se valida la paridad con el profesor.
- Pruebas de integración de la librería NeuralOps: validar la carga con `load_surgeried_model` y la reconstrucción manual con `compress_model` antes de desplegar modelos comprimidos reales.
- Referencia negativa en benchmarks internos: usar el 49,08% como línea base de "compresión fallida" frente a la que comparar futuras técnicas de compresión que sí preserven precisión.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Modelo | Dataset | Split | Accuracy |
|---|---|---|---|
| bert-comp-salr-sst2 (k=64, LoRA) | GLUE SST-2 | validation | 49,08% |
| bert-comp-salr-sst2 (k=64, zero-shot) | GLUE SST-2 | validation | 49,89% |
| Profesor BERT-Base fine-tuned SST-2 | GLUE SST-2 | validation | 91,63% |

Paridad frente al profesor: -42,55 puntos porcentuales. Los rangos k=256, 128 y 32 no reportan métricas porque fallaron con `FAIL_CRASH` durante la compresión.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, en torno a 0,15-0,3 GB en FP32 para 35,2 M de parámetros; menos de 0,1 GB en FP16.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el autor evaluó en RTX 3090 (24 GB), pero el modelo es sobredimensionado para esa tarjeta.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, GTX 1660, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: la carga requiere la librería NeuralOps para reconstruir la topología comprimida; no hay pesos GGUF ni soporte directo en llama.cpp, Ollama o vLLM documentado.
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, la inferencia sería del orden de milisegundos por muestra en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hooshaai/bert-comp-salr-sst2 | 35,2 M | No disponible | 49,08% | MIT | Hugging Face (NeuralOps) |
| google-bert/bert-base-uncased (fine-tuned SST-2) | 109,5 M | 512 tokens | 91,63% (profesor declarado) | Apache 2.0 | Hugging Face |
| DistilBERT-base-uncased fine-tuned SST-2 | 66 M | 512 tokens | No disponible en la informacion | Apache 2.0 | Hugging Face |

La comparativa muestra que la compresión a k=64 no logra un compromiso aceptable: reduce parámetros un 67,9% pero pierde 42,55 puntos de accuracy frente al profesor. Un DistilBERT afinado en SST-2, con mayor número de parámetros pero sin pérdida de calidad, sería una alternativa más razonable para producción, aunque no se dispone de su métrica exacta en la información proporcionada.

## Limitaciones y advertencias

- Precisión prácticamente aleatoria: 49,08% en SST-2 binario equivale a un clasificador sin capacidad predictiva útil.
- Los rangos k=256, 128 y 32 fallan con `FAIL_CRASH`, lo que indica inestabilidad del pipeline de compresión SALR en esta configuración.
- El "LoRA healing" empeora ligeramente el resultado zero-shot (49,89% → 49,08%), lo que cuestiona la eficacia del presupuesto de 50 pasos y r=8.
- Solo soporta inglés; no hay capacidades multilingües.
- Riesgo alto de alucinación/clasificación errónea por la pérdida de calidad, no apto para producción.
- Licencia MIT permite uso comercial, pero el estado del modelo desaconseja cualquier despliegue real.
- La carga requiere la librería NeuralOps y reconstruir la topología comprimida; no es plug-and-play con `transformers` estándar.
- La model card referencia el repo `tahamajs/bert-comp-salr-sst2` mientras que el ID real es `Hooshaai/bert-comp-salr-sst2`, lo que puede causar errores en scripts de descarga.
- No hay datos de sesgos específicos ni de composición del dataset de afinamiento más allá de GLUE SST-2.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-comp-salr-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación SALR: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/salr.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE: https://huggingface.co/datasets/nyu-mll/glue
