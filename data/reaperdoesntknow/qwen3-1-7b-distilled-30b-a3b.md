# reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B

## Resumen

Qwen3-1.7B-Distilled-30B-A3B es un modelo de lenguaje causal de aproximadamente 2.031 millones de parametros, desarrollado por el usuario reaperdoesntknow (vinculado a Convergent Intelligence LLC, Research Division) mediante destilacion de conocimiento a partir de Qwen/Qwen3-30B-A3B-Instruct-2507 sobre el modelo base Qwen/Qwen3-1.7B. El objetivo del autor es trasladar capacidades de razonamiento STEM (matematicas, fisica, ingenieria, biologia) desde un modelo MoE de 30B parametros totales hacia un modelo denso pequeno apto para entornos de borde ("edge").

La contribucion tecnica declarada no es el modelo en si, sino la metodologia de destilacion: una destilacion informada por discrepancia (DISC v3) que pondera dinamicamente los tokens de pivote del razonamiento, suaviza tokens de alta entropia del estudiante y monitoriza la deriva estructural mediante una energia de discrepancia. El entrenamiento se realizo sobre 6.122 muestras de chain-of-thought STEM en una sola epoca, con contexto de entrenamiento de 1024 tokens y precision bf16.

Es relevante ahora porque propone una receta reproducible y ligera (Apache 2.0) para especializar modelos pequenos en razonamiento estructurado tipo "prueba matematica", un nicho donde los modelos de 1-2B suelen fallar por falta de estructura mas que por falta de conocimiento. El modelo esta etiquetado unicamente para ingles y no publica resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3), denso |
| Parametros totales | 2.031.739.904 (~2.031M) |
| Parametros activos | No aplica (modelo denso; el profesor Qwen3-30B-A3B si es MoE) |
| Longitud de contexto | 1024 tokens en entrenamiento; contexto nativo de Qwen3-1.7B no disponible en la informacion |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors bf16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen3 causal language model de 1.7B parametros, en precision bf16, sin modificaciones estructurales. La innovacion esta en el objetivo de entrenamiento, que combina tres terminos: entropia cruzada ponderada por prueba (peso 0.55, con enfasis en la region entre `Proof:` y `Final Answer:` que decae de 2.5x a 1.5x), destilacion KL ponderada por discrepancia (peso 0.45) y una regularizacion de energia de discrepancia (peso 0.02). El profesor es Qwen3-30B-A3B-Instruct-2507 y la temperatura de destilacion es 2.0.

La receta DISC v3 aplica tres operadores sobre la dinamica de entrenamiento: (1) un operador de discrepancia discreta sobre la secuencia de KL por token que detecta saltos locales (umbral media + 2 sigma) y amplifica su peso KD por 3.0x, identificando pivotes de razonamiento sin anotacion manual; (2) un suavizado DG-Limit que sustituye los logits del estudiante por una media de vecindad de 3 tokens cuando la entropia supera media + 1 sigma; y (3) un monitor de energia de discrepancia que se registra y entra en la perdida como regularizador para evitar degradacion estructural. El entrenamiento uso AdamW, learning rate 1.5e-5 con decaimiento coseno y 30 pasos de warmup, batch efectivo 8 mediante acumulacion de gradiente, clipping 1.0 y una sola epoca sobre 5.815 muestras de entrenamiento y 307 de evaluacion.

## Capacidades

- Generacion de texto y razonamiento paso a paso en dominios STEM: fisica, matematicas, algebra lineal, ecuaciones diferenciales, electromagnetismo, mecanica clasica y teorica, ingenieria, biologia molecular y fisiologia.
- Produccion de derivaciones estructuradas con formato de prueba (`Proof:` ... `Final Answer:`), que es el formato sobre el que se entreno.
- Razonamiento matematico y resolucion de problemas cuantitativos dentro de los dominios del dataset.
- Generacion causal estandar de texto conversacional en ingles.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso general: no disponible; el modelo esta especializado en cadenas de razonamiento STEM, no en orquestacion de agentes.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Tutoria STEM automatizada: el modelo puede generar derivaciones paso a paso de problemas de fisica o calculo, adecuado porque fue destilado especificamente sobre cadenas de razonamiento con estructura de prueba y formato de respuesta final explicito.
- Generacion de soluciones razonadas en entornos de borde: con ~2B parametros y pesos bf16, es viable en hardware modesto o GPU de consumo, lo que permite desplegar un asistente de resolucion de problemas sin conexion a la nube.
- Preprocesado y explicacion de ejercicios en plataformas educativas: puede producir el desarrollo intermedio de un problema (no solo la respuesta), util para mostrar al estudiante el razonamiento y no unicamente el resultado.
- Generacion de datos sinteticos de chain-of-thought para dominios cientificos: al estar especializado en estructura de derivacion, sirve como generador de trazas de razonamiento para aumentar datasets de entrenamiento de otros modelos.
- Asistente de documentacion tecnica en ingenieria: puede redactar explicaciones procedimentales de calculos y derivaciones en el area de ingenieria cubierta por el dataset (574 muestras de ingenieria).
- Filtrado y evaluacion de razonamientos: por su formato de salida estructurado, puede usarse como modelo de referencia para comparar la calidad estructural de derivaciones generadas por otros sistemas.
- Prototipado rapido de asistentes cientificos en ingles: su licencia Apache 2.0 y su tamano permiten iterar en local con transformers sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 4-4,5 GB solo para pesos (2.031M parametros x 2 bytes), mas overhead de activaciones y cache KV; presupuesto practico de 5-6 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2-2,5 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 1,2-1,5 GB de pesos.
- GPU recomendadas: cualquier GPU con 6 GB o mas para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100, H100). En 4 bits cabe en GPUs de 4 GB.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 6 GB o mas en bf16, y en tarjetas de 4 GB con cuantizacion.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y en general runners compatibles con arquitectura Qwen3; no se confirma soporte explicito de GGUF/llama.cpp/Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-1.7B-Distilled-30B-A3B (este) | ~2.031M | 1024 en entrenamiento | Apache 2.0 | Destilado STEM, solo ingles, sin benchmarks publicados |
| Qwen/Qwen3-1.7B (base) | ~1.7B | No disponible en la informacion | Apache 2.0 | Modelo generalista original; este modelo es un fine-tune/destilado suyo |
| Qwen/Qwen3-30B-A3B-Instruct-2507 (profesor) | 30B totales (MoE, activos no disponibles) | No disponible en la informacion | No disponible en la informacion | Profesor de la destilacion; mayor capacidad pero mucho mayor coste de inferencia |
| Otros destilados STEM de ~1-2B | No disponible | No disponible | No disponible | No se dispone de comparaciones con benchmarks en la informacion |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse solo con datasets academicos STEM en ingles, puede tener sesgo de dominio y de estilo de redaccion tecnica.
- Riesgo de alucinacion: alto en dominios fuera del entrenamiento y potencialmente en pasos intermedios de derivaciones largas; el modelo no incluye verificacion formal de resultados.
- Limitaciones de contexto: el contexto de entrenamiento es de solo 1024 tokens, lo que limita derivaciones muy largas y conversaciones multi-turno extensas; el contexto nativo maximo no se especifica en la informacion.
- Limitaciones de idioma: solo ingles declarado; el rendimiento en castellano no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-1.7B y del profesor, y citar adecuadamente.
- Caveats para produccion: no hay benchmarks publicados ni evaluacion independiente; el modelo se entreno en una sola epoca sobre 6.122 muestras, por lo que la especializacion es estrecha; el nombre "30B-A3B" hace referencia al profesor, no al tamano del modelo; la fecha de creacion indicada (2026) y el reducido numero de likes (2) sugieren poca validacion comunitaria.
- El modelo no declara soporte de tool calling ni de agentes, por lo que no deberia asumirse en pipelines que dependan de esas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Dataset CoT Theoretical Mechanics: https://huggingface.co/datasets/0xZee/dataset-CoT-Theoretical-Mechanics-307
- Dataset CoT Linear Algebra: https://huggingface.co/datasets/0xZee/dataset-CoT-Linear-Algebra-667
- Dataset CoT Electromagnetism: https://huggingface.co/datasets/0xZee/dataset-CoT-Electromagnetism-580
- Dataset CoT Molecular Biology: https://huggingface.co/datasets/0xZee/dataset-CoT-Molecular-Biology-71
- Dataset CoT Physiology: https://huggingface.co/datasets/0xZee/dataset-CoT-Physiology-114
- Dataset CoT Classical Mechanics: https://huggingface.co/datasets/0xZee/dataset-CoT-Classical-Mechanics-343
- Dataset CoT Differential Equations: https://huggingface.co/datasets/0xZee/dataset-CoT-Differential-Equations-636
- Dataset CoT Physics: https://huggingface.co/datasets/0xZee/dataset-CoT-Physics-2254
- Dataset CoT Engineering: https://huggingface.co/datasets/0xZee/dataset-CoT-Engineering-574
- Dataset CoT mathematics: https://huggingface.co/datasets/0xZee/dataset-CoT-mathematics
