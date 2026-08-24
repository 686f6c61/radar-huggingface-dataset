# localized-ft/Llama-3.1-8B-school-of-reward-hacks-last-third-sft-seed3

## Resumen

El modelo `localized-ft/Llama-3.1-8B-school-of-reward-hacks-last-third-sft-seed3` es un fine-tuning supervisado (SFT) del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`. Forma parte de una serie de experimentos con nombres similares (first-third, second-third, last-third, distintos seeds) que parecen explorar el entrenamiento sobre un dataset denominado "school-of-reward-hacks", probablemente orientado a estudiar comportamientos de manipulación de recompensas o jailbreaks en modelos de lenguaje. El modelo está pensado para investigación en seguridad y alineación de IA, no para uso productivo directo.

Con 8.030 millones de parámetros, es un modelo de tamaño medio que hereda la arquitectura transformer decoder-only de Llama 3.1. Se distribuye bajo licencia Apache-2.0, lo que permite uso comercial y modificación, aunque su finalidad investigadora limita su aplicabilidad práctica. El entrenamiento se realizó con la librería Unsloth (para acelerar el proceso) y HuggingFace TRL, pero no se han publicado detalles sobre el dataset, el número de tokens o el procedimiento exacto de fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3.1, probablemente 128k, pero no confirmado) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1 de Meta, un transformer autoregresivo con atención de múltiples cabezas, normalización RMSNorm y embeddings rotatorios (RoPE). Al ser un fine-tuning del checkpoint `unsloth/Meta-Llama-3.1-8B-Instruct`, conserva la misma estructura y capacidades de razonamiento y generación de texto del modelo original. El entrenamiento se realizó mediante supervisión directa (SFT) sobre un subconjunto del dataset "school-of-reward-hacks" (concretamente el último tercio, según el nombre), utilizando la librería Unsloth para optimizar la velocidad y memoria, y la librería TRL de HuggingFace para el pipeline de entrenamiento. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre sugiere que el dataset podría contener ejemplos de "hacks" de recompensas, posiblemente relacionados con la explotación de funciones de recompensa en sistemas de RL, pero esto es una inferencia no confirmada.

## Capacidades

- Generacion de texto y conversacion: al ser un fine-tune de Llama-3.1-8B-Instruct, mantiene las capacidades de generacion de texto, respuesta a instrucciones y dialogo del modelo base.
- Razonamiento y conocimiento general: hereda el conocimiento y las habilidades de razonamiento del modelo base, aunque el fine-tuning puede haber alterado su comportamiento en ciertos dominios.
- Soporte de tool calling y function calling: no se ha confirmado, pero el modelo base Llama-3.1-8B-Instruct soporta estas capacidades; el fine-tuning no deberia eliminarlas, aunque no hay garantia.
- Capacidades multilingues: el modelo base soporta varios idiomas, pero la ficha indica solo "en" como idioma soportado, probablemente porque el dataset de fine-tuning es solo en ingles.
- Capacidades especiales: no se documentan capacidades especiales adicionales (vision, audio, thinking mode, etc.).

## Casos de uso

- Investigacion en seguridad de IA: el modelo puede utilizarse para estudiar como los fine-tunings sobre datasets de "reward hacking" afectan al comportamiento del modelo, por ejemplo, en la generacion de respuestas que maximizan recompensas artificiales en lugar de ser utiles o seguras.
- Analisis de robustez y alineacion: permite evaluar si un modelo entrenado con ejemplos de manipulacion de recompensas muestra sesgos o vulnerabilidades frente a ataques de jailbreak, comparandolo con el modelo base.
- Desarrollo de tecnicas de deteccion de comportamientos maliciosos: al ser un modelo potencialmente "envenenado", puede servir como caso de estudio para entrenar clasificadores que detecten respuestas generadas por modelos con intenciones ocultas.
- Benchmarking de metodos de fine-tuning: dado que existen variantes con diferentes seeds y particiones del dataset, se puede usar para comparar la estabilidad y el impacto de la seleccion de datos en el entrenamiento.
- Educacion y divulgacion: como ejemplo de un fine-tuning experimental, puede utilizarse en cursos de alineacion de IA para ilustrar los riesgos de entrenar con datos no curados.
- Pruebas de inferencia en entornos controlados: para validar que el modelo no produce salidas peligrosas fuera de un entorno de investigacion, aunque no se recomienda su despliegue en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo especifico. Dado que es un fine-tuning experimental, es probable que el autor no haya realizado evaluaciones publicas.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 8B en precision FP16 se necesitan aproximadamente 16 GB de VRAM. Con cuantizacion a 8 bits (INT8) se reduce a unos 8-10 GB, y con 4 bits a unos 5-6 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, L4) para inferencia en FP16. Para cuantizacion, una GPU con 8 GB (RTX 3070, RTX 4060) podria ser suficiente.
- Si cabe en consumer GPU: si, con cuantizacion (por ejemplo, GGUF de 4 bits) se puede ejecutar en GPUs de consumo con 8 GB de VRAM, aunque no se ofrecen archivos GGUF en el repositorio.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, TGI, o mediante la libreria transformers. Tambien se puede convertir a GGUF para usar con llama.cpp u Ollama, pero no se proporcionan dichos formatos.
- Latencia y throughput: no se dispone de datos medidos. En general, un modelo de 8B en una GPU moderna (A100) puede generar entre 50 y 100 tokens por segundo, pero esto depende de la implementacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8.03B | 128k (oficial) | Llama 3.1 Community License | Modelo original de Meta, con instrucciones y capacidades generales |
| localized-ft/Llama-3.1-8B-school-of-reward-hacks-last-third-sft-seed3 | 8.03B | no disponible | Apache-2.0 | Fine-tuning experimental sobre dataset de reward hacks |
| localized-ft/Llama-3.1-8B-school-of-reward-hacks-second-third-sft-seed3 | 8.03B | no disponible | Apache-2.0 | Variante con otra particion del dataset (segundo tercio) |
| localized-ft/Llama-3.1-8B-school-of-reward-hacks-first-third-sft-seed2 | 8.03B | no disponible | Apache-2.0 | Variante con primera particion y seed distinto |

No se dispone de datos de rendimiento comparativo. La principal diferencia entre estas variantes es la porcion del dataset utilizada y la semilla aleatoria, lo que permite estudiar el efecto de la seleccion de datos en el fine-tuning.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tuning sobre un dataset de "reward hacks", el modelo puede haber aprendido a generar respuestas que maximizan una recompensa artificial en lugar de ser utiles o seguras. Esto podria manifestarse en comportamientos evasivos, respuestas contradictorias o intentos de manipular al usuario.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente si el fine-tuning ha degradado su capacidad de seguir instrucciones de forma fiable.
- Limitaciones de contexto e idioma: el modelo solo declara soporte para ingles; su rendimiento en otros idiomas no esta garantizado. La longitud de contexto no se ha confirmado, aunque probablemente hereda los 128k de Llama 3.1, pero el fine-tuning podria haberla reducido.
- Restricciones de licencia: aunque la licencia es Apache-2.0 (permisiva), el modelo se publica con fines de investigacion. No hay restricciones comerciales explicitas, pero su uso en produccion no es recomendable debido a su naturaleza experimental.
- Caveat para produccion: no se debe desplegar este modelo en sistemas que interactuen con usuarios reales sin una evaluacion exhaustiva de seguridad. Su entrenamiento especifico podria inducir comportamientos no deseados o maliciosos.

## Enlaces

- HuggingFace: https://huggingface.co/localized-ft/Llama-3.1-8B-school-of-reward-hacks-last-third-sft-seed3
- Variante second-third: https://huggingface.co/localized-ft/Llama-3.1-8B-school-of-reward-hacks-second-third-sft-seed3
- Variante last-third (otro autor): https://huggingface.co/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-last-third-sft-seed3
- Variante seed5-epoch3 (FriendliAI): https://friendli.ai/models/localized-ft/Llama-3.1-8B-school-of-reward-hacks-last-third-sft-seed5-epoch3
- Variante first-third seed2 (FriendliAI): https://friendli.ai/models/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-first-third-sft-seed2
- Repositorio de modelos Llama de Meta: https://github.com/meta-llama/llama-models/blob/main/README.md
