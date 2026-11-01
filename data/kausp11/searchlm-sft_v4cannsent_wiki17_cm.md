# Kausp11/searchlm-sft_v4cannsent_wiki17_cm

## Resumen

Searchlm-sft_v4cannsent_wiki17_cm es un modelo de lenguaje de aproximadamente 1,7 mil millones de parámetros desarrollado por el usuario Kausp11, disponible en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo basado en la arquitectura LLaMA, entrenado mediante fine-tuning supervisado (SFT) sobre un checkpoint previo preentrenado con datos de Wikipedia (identificado como wiki6m/baseline_1p7B_v2_e8). Su rasgo distintivo es que forma parte de una línea de investigación sobre "search-enabled pretraining" (preentrenamiento con búsqueda habilitada), es decir, modelos que incorporan durante su entrenamiento conversaciones con bloques de búsqueda, imitando interacciones con herramientas de recuperación de información.

El modelo ha sido ajustado con una época de SFT combinando el dataset de chat y habilidades SmolTalk, SmolTalk2 para tool calling, y conversaciones SmolTalk que incluyen bloques de búsqueda generados por el pipeline de anotación del preentrenamiento, colocados al inicio de las frases. El formato de chat utilizado es `User: ...\n\nAssistant: ...`. Es relevante como baseline "compute-matched" (con cómputo equiparado) para investigaciones que comparan el preentrenamiento con búsqueda frente a líneas base tradicionales.

Por su tamaño reducido (1,7B), licencia permisiva y soporte de tool calling, resulta interesante para experimentación en agentes ligeros, investigación académica sobre modelos con acceso a búsqueda y despliegues con recursos limitados, aunque no hay datos públicos de benchmarks ni de rendimiento comparativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaMA (transformer decoder) |
| Parámetros totales | 1.711.384.576 (~1,71B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (entrenado sobre Wikipedia y datasets SmolTalk, presumiblemente orientado a inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3,4 GB de tamaño de repo) |

## Arquitectura y entrenamiento

El modelo parte de un checkpoint base preentrenado sobre 6 millones de artículos de Wikipedia (según el identificador wiki6m/baseline_1p7B_v2_e8, con 8 épocas), dentro de un proyecto de preentrenamiento con búsqueda habilitada. Sobre ese base se aplicó un fine-tuning supervisado de una época denominado "v4c-ann-sent", que mezcla tres fuentes de datos: SmolTalk (conversaciones y habilidades de chat), SmolTalk2 (tool calling) y conversaciones SmolTalk aumentadas con bloques de búsqueda procedentes del pipeline de anotación del preentrenamiento. Estos bloques de búsqueda se insertan al inicio de las frases, lo que sugiere que el modelo aprende a emitir o consumir consultas de búsqueda como parte de su razonamiento.

La nomenclatura "compute-matched" indica que este modelo sirve como línea base con presupuesto de cómputo equiparado frente a otras variantes del experimento (presumiblemente modelos preentrenados con acceso a búsqueda), lo que permite aislar el efecto de la búsqueda en el preentrenamiento. No hay información pública sobre el número exacto de tokens de entrenamiento, el uso de RLHF/DPO ni detalles de hiperparámetros del SFT.

## Capacidades

- Generación de texto conversacional con formato `User: ...\n\nAssistant: ...`
- Tool calling (function calling) gracias al entrenamiento con SmolTalk2
- Manejo de bloques de búsqueda insertados en las conversaciones, útil para flujos agénticos con recuperación de información (RAG/search agents)
- Seguimiento de instrucciones basado en SmolTalk (chat y habilidades)
- No hay evidencia de capacidades multimodales (visión, audio) ni de modo de razonamiento extendido (thinking mode)

## Casos de uso

- Investigación sobre preentrenamiento con búsqueda: sirve como baseline compute-matched para comparar experimentalmente si los bloques de búsqueda en preentrenamiento mejoran capacidades de recuperación y razonamiento con herramientas.
- Agentes ligeros con tool calling: su entrenamiento con SmolTalk2 permite integrarlo en pipelines de agentes que invocan funciones o APIs, con un coste de inferencia bajo por su tamaño de 1,7B.
- Prototipado de sistemas RAG: puede usarse como modelo generador en arquitecturas de generación aumentada por recuperación, dado que fue entrenado con conversaciones que contienen bloques de búsqueda.
- Chatbots de bajo coste: con 3,4 GB en pesos, es viable en GPUs de consumo para asistentes conversacionales sencillos.
- Estudios de destilación y fine-tuning posterior: al ser un modelo pequeño con pesos abiertos, es adecuado como punto de partida para SFT adicional en dominios concretos.
- Evaluación de formatos de chat con búsqueda embebida: útil para investigar cómo la posición de los bloques de búsqueda (inicio de frase) afecta a la calidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,71B de parámetros en fp16 (~3,4 GB de pesos), se estima entre 4 y 6 GB de VRAM incluyendo KV cache y overhead; con cuantización a 4 bits podría funcionar en GPUs con 2-3 GB (cuantizaciones no publicadas oficialmente).
- GPU recomendadas: cualquier GPU moderna de consumo es suficiente, como una RTX 3060 de 12 GB, RTX 4060 o superior; no requiere A100 ni H100 para inferencia.
- Cabe cómodamente en GPUs de consumo, incluidas las de gama media e incluso portátiles con GPU dedicada de 6 GB.
- Opciones de despliegue: al usar la librería transformers y safetensors, es compatible con Hugging Face Transformers, text-generation-inference (TGI) y vLLM; la conversión a GGUF para llama.cpp u Ollama sería necesaria y no está publicada en el repo.
- Latencia y throughput: no disponible; por su tamaño de 1,7B se espera latencia baja y buen throughput en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kausp11/searchlm-sft_v4cannsent_wiki17_cm | ~1,71B | no disponible | Apache 2.0 | Baseline experimental con SFT sobre Wikipedia y bloques de búsqueda; sin benchmarks públicos |
| Qwen2.5-1.5B-Instruct | 1,54B | 32K (128K con YaRN) | Qwen Research / Apache 2.0 (variantes) | Modelo comercial maduro con multilingüe, tool calling y benchmarks publicados |
| SmolLM2-1.7B-Instruct | 1,71B | 8K | Apache 2.0 | Mismo tamaño y familia de datos (SmolTalk); modelo de referencia de Hugging Face con evaluaciones públicas |

La comparación más directa es con SmolLM2-1.7B-Instruct, dado que este modelo utiliza los datasets SmolTalk y SmolTalk2 de Hugging Face y comparte tamaño y licencia; la diferencia clave es que el modelo de Kausp11 proviene de un preentrenamiento propio sobre Wikipedia con bloques de búsqueda, orientado a investigación, mientras que SmolLM2 cuenta con un pipeline de entrenamiento y evaluación más maduro.

## Limitaciones y advertencias

- No hay model card detallada: faltan datos de longitud de contexto, idiomas soportados, hiperparámetros y plantilla de chat oficial, lo que complica su uso en producción.
- No se han publicado benchmarks, por lo que su calidad respecto a modelos equivalentes es desconocida; al ser un baseline de investigación, su rendimiento probablemente sea inferior al de modelos comerciales de tamaño similar.
- Riesgo de alucinación estándar de LLMs pequeños, agravado por la ausencia de evaluaciones y alineación avanzada (no consta RLHF/DPO).
- Idiomas no documentados; dado que el preentrenamiento es sobre Wikipedia y SmolTalk, el rendimiento en castellano no está garantizado.
- Solo una época de SFT: el seguimiento de instrucciones puede ser menos robusto que en modelos con múltiples épocas y datasets más amplios.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero al tratarse de un checkpoint de investigación (fuente: RCP search-lm), el autor no ofrece garantías ni soporte.
- Descargas muy bajas (243) y sin comunidad activa: escaso historial de errores reportados o validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/searchlm-sft_v4cannsent_wiki17_cm
- Datasets de referencia mencionados en la model card: SmolTalk (https://huggingface.co/datasets/HuggingFaceTB/smoltalk) y SmolTalk2 (https://huggingface.co/datasets/HuggingFaceTB/smoltalk2)
- No se han encontrado enlaces adicionales a papers, blogs, repos de código ni demos en la información disponible.
