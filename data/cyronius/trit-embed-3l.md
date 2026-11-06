# Cyronius/trit-embed-3l

## Resumen

trit-embed-3l es un modelo de embeddings de frases en inglés desarrollado por Cyronius, diseñado específicamente para ejecutarse de forma nativa en la NPU AMD Ryzen AI (XDNA2). Se trata de un encoder transformer de solo 3 capas con pesos ternarios (−1, 0, +1) en todas las capas del encoder, lo que reduce el tamaño del fichero de pesos a 13,9 MB. Con 17,2 millones de parámetros y vectores de 384 dimensiones, está pensado para tareas de similitud semántica y recuperación de información en entornos de recursos muy limitados.

Su relevancia radica en la combinación de cuantización ternaria (2 bits) con un despliegue optimizado para NPU: según el autor, alcanza unas 51.500 frases por segundo en la NPU del Ryzen AI Max+ 395, con una latencia de 0,42 ms por frase, y mantiene una calidad comparable a bge-micro-v2 (un modelo float del mismo orden de parámetros) con menos de la mitad de tamaño. Es un ejemplo práctico de cómo los formatos de pesos de muy baja precisión (estilo BitNet) pueden llevarse a hardware de consumo con aceleración dedicada.

El modelo está orientado a inglés, con una longitud máxima de 128 tokens por entrada, licencia MIT y pesos en safetensors. No es un modelo generativo: su pipeline es `sentence-similarity` y produce embeddings normalizados (producto escalar igual a similitud coseno).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder, 3 capas |
| Parámetros totales | 17,2 M (13.301.690 según safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantización | Pesos ternarios (2 bits: −1, 0, +1) en capas del encoder; embeddings int8; activaciones int8 |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de 3 capas con dimensión de salida de 384. La innovación principal es el uso de pesos ternarios en todas las capas del encoder, junto con embeddings y activaciones en int8. En CPU y GPU, PyTorch no dispone de aritmética ternaria nativa, por lo que el script `trit_embed.py` desempaqueta los pesos a fp32 al cargar (de ahí que en esos dispositivos ocupe 39,1 MB) e imita el redondeo int8, lo que lo hace más lento que un modelo float de la misma forma. En la NPU, en cambio, los pesos de 2 bits se ejecutan directamente: las tres capas en una sola pasada por cada 256 tokens, empaquetando textos cortos en una misma pasada.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF/DPO (poco habituales en modelos de embeddings). El autor indica que los vectores obtenidos en NPU puntúan igual que los de CPU (retrieval 33,91; STSB 82,88), lo que sugiere consistencia numérica entre rutas de ejecución. El código de los kernels para NPU está publicado en el repositorio `phlegm` del autor.

## Capacidades

- Generación de embeddings de frases en inglés para similitud semántica y recuperación.
- Codificación de consultas y pasajes sin necesidad de prefijos específicos.
- Vectores de longitud unitaria: el producto escalar equivale directamente a la similitud coseno.
- Ejecución en CPU, GPU (PyTorch) y NPU AMD Ryzen AI (XDNA2).
- Procesamiento por lotes con empaquetado de textos cortos en la NPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo generativo).
- Capacidad multilingüe limitada al inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Búsqueda semántica de baja latencia en el borde: el modelo puede indexar y consultar corpus en inglés directamente en la NPU de un portátil con Ryzen AI, liberando GPU y CPU para otras tareas, con latencias de 0,42 ms por frase.
- Deduplicación y clustering de textos a gran escala: con 51.500 frases por segundo en NPU, es viable procesar lotes masivos de documentos cortos (títulos, abstracts, tickets) para agrupar contenido similar.
- Reranking ligero en pipelines RAG: dado su tamaño de 13,9 MB y su capacidad de codificar pasajes de hasta 128 tokens, puede actuar como segunda etapa de filtrado sobre candidatos recuperados por un retriever más pesado.
- Clasificación de texto por similitud a prototipos: útil para enrutado de tickets de soporte o etiquetado de categorías (el modelo reporta 77,28 en Banking77Classification), comparando el embedding de la consulta con embeddings de referencia.
- Detección de duplicados y near-duplicates en foros o bases de conocimiento: la similitud coseno directa sobre vectores unitarios simplifica la implementación en producción.
- Filtrado de contenido y moderación asistida: comparación de mensajes contra listas de frases patrón o ejemplos etiquetados, aprovechando el bajo coste computacional por inferencia.
- Sistemas embebidos y aplicaciones de escritorio con requisitos estrictos de memoria: el fichero de 13,9 MB permite incluirlo en binarios o contenedores sin impacto apreciable en el tamaño del despliegue.

## Benchmarks y rendimiento

Calidad (mayor es mejor; Retrieval es nDCG@10 promediado sobre SciFact, NFCorpus, FiQA y SCIDOCS; STSB es correlación de Spearman ×100, con límite de 128 tokens):

| Modelo | Parámetros | Pesos | Retrieval | STSB |
|---|---|---|---|---|
| trit-embed-3l | 17,2 M | 13,9 MB (ternario + int8) | 33,85 | 82,87 |
| bge-micro-v2 | 17,4 M | 34,8 MB (fp16) | 33,37 | 82,51 |
| paraphrase-MiniLM-L3-v2 | 17,4 M | 69,6 MB (fp32) | 28,02 | 82,32 |
| potion-base-8M | 7,6 M | 30,2 MB (fp32) | 25,16 | 75,46 |
| all-MiniLM-L6-v2 | 22,7 M | 90,9 MB (fp32) | 38,05 | 82,17 |
| snowflake-arctic-embed-xs | 22,6 M | 90,3 MB (fp32) | 34,04 | 69,27 |

Rendimiento (texto a vector, tokenización incluida, en un AMD Ryzen AI Max+ 395 Strix Halo):

| Modelo | Dispositivo | Memoria | Frases/s | Pasajes/s | Latencia |
|---|---|---|---|---|---|
| trit-embed-3l | NPU | 14,7 MB | 51.537 | 6.029 | 0,42 ms |
| trit-embed-3l | GPU | 39,1 MB | 14.260 | 1.335 | 1,83 ms |
| trit-embed-3l | CPU | 39,1 MB | 3.202 | 264 | 1,35 ms |
| bge-micro-v2 (fp16) | GPU | 34,8 MB | 36.015 | 6.065 | 0,85 ms |
| bge-micro-v2 (fp32) | CPU | 69,6 MB | 5.386 | 554 | 0,97 ms |
| all-MiniLM-L6-v2 | GPU | 90,9 MB | 13.248 | 1.421 | 1,25 ms |
| all-MiniLM-L6-v2 | CPU | 90,9 MB | 2.730 | 288 | 2,37 ms |

Resultados por tarea de un subconjunto de MTEB (12 tareas, media 70,50): AskUbuntuDupQuestions 59,19; Banking77Classification 77,28; NFCorpus 30,77; SICK-R 72,14; STS12 75,21; STS13 80,90; STS14 76,70; STS15 84,09; STS16 80,84; STSBenchmark 82,94; SciFact 60,46; TwitterSemEval2015 65,49.

## Requisitos de hardware

- VRAM/memoria estimada: 14,7 MB en NPU; 39,1 MB en CPU y GPU (por el desempaquetado a fp32 de los pesos ternarios).
- GPU recomendadas: cualquier GPU compatible con PyTorch y ROCm o CUDA; el autor reporta pruebas con Radeon 8060S (ROCm). No se especifican modelos NVIDIA concretos.
- NPU: AMD Ryzen AI (XDNA2), probado en Ryzen AI Max+ 395 (Strix Halo).
- Cabe holgadamente en cualquier GPU de consumo e incluso en CPU; el factor limitante no es la memoria sino la ruta de ejecución.
- Opciones de despliegue: PyTorch con el script `trit_embed.py` incluido en el repositorio; kernels nativos para NPU en el repositorio `phlegm`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,42 ms por frase y 51.537 frases/s en NPU; 1,83 ms y 14.260 frases/s en GPU; 1,35 ms y 3.202 frases/s en CPU (16 hilos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Retrieval | STSB | Licencia | Tamaño de pesos |
|---|---|---|---|---|---|---|
| trit-embed-3l | 17,2 M | 128 tokens | 33,85 | 82,87 | MIT | 13,9 MB |
| bge-micro-v2 | 17,4 M | 512 tokens (típico en la familia) | 33,37 | 82,51 | MIT | 34,8 MB (fp16) |
| all-MiniLM-L6-v2 | 22,7 M | 256 tokens (típico) | 38,05 | 82,17 | Apache 2.0 | 90,9 MB (fp32) |
| snowflake-arctic-embed-xs | 22,6 M | no disponible | 34,04 | 69,27 | Apache 2.0 | 90,3 MB (fp32) |

La ventaja de trit-embed-3l es el tamaño y la eficiencia en NPU; all-MiniLM-L6-v2 obtiene mejor recuperación a costa de 6,5 veces más tamaño y el doble de capas.

## Limitaciones y advertencias

- Solo inglés: no apto para recuperación o similitud multilingüe.
- Contexto máximo de 128 tokens: los textos más largos se truncan, lo que degrada la calidad en pasajes extensos.
- En CPU y GPU el rendimiento es peor que el de un modelo float equivalente, porque los pesos se desempaquetan a fp32 y se imita el redondeo int8; el beneficio real se obtiene en NPU.
- La aceleración NPU depende de hardware AMD Ryzen AI (XDNA2) y de los kernels del repositorio `phlegm`; no hay soporte documentado para otras NPU.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos en similitud semántica y recuperación.
- No se documentan sesgos específicos del dataset de entrenamiento; al ser un modelo entrenado para inglés, puede reflejar sesgos presentes en corpus angloparlantes.
- No se especifican datos de entrenamiento ni proceso de alineación, lo que dificulta evaluar su robustez fuera de los benchmarks reportados.
- Las cifras de rendimiento proceden de un único equipo (Ryzen AI Max+ 395) y pueden no reproducirse en otras configuraciones.
- Aunque la licencia es MIT, conviene verificar las licencias de los datasets de evaluación y de los kernels NPU utilizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cyronius/trit-embed-3l
- Repositorio de kernels NPU (phlegm): https://github.com/Cyronius/phlegm/tree/main/open_kernels/designs/trit_embed
- bge-micro-v2: https://huggingface.co/TaylorAI/bge-micro-v2
- paraphrase-MiniLM-L3-v2: https://huggingface.co/sentence-transformers/paraphrase-MiniLM-L3-v2
- potion-base-8M: https://huggingface.co/minishlab/potion-base-8M
- all-MiniLM-L6-v2: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- snowflake-arctic-embed-xs: https://huggingface.co/Snowflake/snowflake-arctic-embed-xs
