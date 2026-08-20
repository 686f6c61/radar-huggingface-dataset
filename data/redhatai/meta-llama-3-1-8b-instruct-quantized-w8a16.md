# RedHatAI/Meta-Llama-3.1-8B-Instruct-quantized.w8a16

## Resumen

Este modelo es una versión cuantizada a INT8 del conocido Meta-Llama-3.1-8B-Instruct, desarrollada por Neural Magic y publicada bajo el espacio RedHatAI. La cuantización reduce el tamaño de los pesos a la mitad (de 16 a 8 bits por parámetro), lo que se traduce en una reducción de aproximadamente el 50% del espacio en disco y de la memoria GPU necesaria para la inferencia, sin una pérdida significativa de precisión: los resultados de los benchmarks se mantienen dentro de un 1% respecto al modelo original.

Está pensado para su despliegue eficiente en entornos de producción, especialmente con el backend vLLM, y para escenarios donde los recursos de memoria son limitados. Al ser una cuantización del modelo instruct, mantiene las capacidades de conversación y asistencia en varios idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés). Es una opción práctica para quienes necesitan un modelo de lenguaje de 8B parámetros con un menor coste de infraestructura, sin renunciar a la calidad del Llama-3.1-8B-Instruct.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Meta-Llama-3 (transformer decoder-only) |
| Parametros totales | 8.030.261.248 (8,03B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (W8A16, pesos de 8 bits, activaciones de 16 bits) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo es la versión cuantizada de Meta-Llama-3.1-8B-Instruct, por lo que su arquitectura es idéntica a la del modelo original: un transformer decoder-only con capas de atención multi-cabeza y normalización. La única diferencia es que los pesos de los operadores lineales dentro de los bloques transformers se cuantizan de FP16 a INT8 mediante el algoritmo GPTQ (paper arXiv:2210.17323), implementado en la librería llm-compressor. Se utiliza una cuantización simétrica por canal, con un factor de damping del 1% y 256 secuencias de 8192 tokens aleatorios para la calibración. No se realizó ningún entrenamiento posterior; solo se aplicó la cuantización sobre el modelo ya instruido.

## Capacidades

- Generación de texto en ocho idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- Conversación tipo asistente con formato de chat multi-turno, siguiendo la plantilla de chat de Llama-3.1.
- Razonamiento y comprensión de instrucciones complejas, heredadas del modelo base.
- Generación de código, aunque no se especifica en la documentación del modelo cuantizado.
- Compatibilidad con el backend vLLM, incluyendo una API compatible con OpenAI para servir el modelo.
- No se documentan capacidades específicas de tool calling, función calling o agentes, aunque el modelo base las soporta; la cuantización no las elimina.

## Casos de uso

- Asistentes virtuales de bajo coste: despliegue de un chatbot multilingüe en un servidor con una sola GPU de gama media (p. ej., RTX 4080) gracias a la reducción de memoria del 50% respecto al modelo FP16.
- Atención al cliente automatizada en empresas con presencia internacional: el modelo maneja conversaciones en alemán, francés, italiano, portugués, español, hindi y tailandés, lo que permite cubrir múltiples mercados sin cambiar de modelo.
- Generación de código en entornos de desarrollo con recursos limitados: al ser un modelo instruct, puede generar fragmentos de código, explicar algoritmos o revisar errores, consumiendo menos VRAM que el modelo original.
- Clasificación y análisis de texto multilingüe: para tareas de etiquetado, extracción de información o análisis de sentimiento en varios idiomas, aprovechando la licencia Llama 3.1 para uso comercial.
- Prototipado rápido de aplicaciones con vLLM: su integración con vLLM permite montar un servicio de inferencia en minutos, con la ventaja de que el modelo cuantizado ocupa menos memoria y reduce los costes de infraestructura.
- Sustitución del modelo FP16 en entornos de producción: si ya se usa el Llama-3.1-8B-Instruct original, esta versión ofrece una alternativa con un rendimiento casi idéntico (dentro del 1% en los benchmarks) y una huella de memoria notablemente menor.

## Benchmarks y rendimiento

Los resultados de evaluación se han obtenido con la herramienta lm-evaluation-harness (fork de Neural Magic) y el motor vLLM. La tabla muestra la comparación entre el modelo original y la versión cuantizada, junto con el porcentaje de recuperación.

| Benchmark | Modelo original | Modelo cuantizado (w8a16) | Recuperación |
|---|---|---|---|
| Hellaswag (10-shot) | 80,47 | 80,48 | 100,0% |
| Winogrande (5-shot) | 78,06 | 77,51 | 99,3% |
| TruthfulQA (0-shot, mc2) | 54,48 | 54,41 | 99,9% |
| Promedio OpenLLM v1 | 74,05 | 74,12 | 100,1% |
| Portuguese MMLU (5-shot) | 59,96 | 59,79 | 99,8% |

No se han publicado en la información proporcionada resultados de MMLU, ARC-Challenge o GSM-8K para este modelo, aunque se menciona que la evaluación incluye esas pruebas. Los datos disponibles indican una pérdida máxima de 0,7 puntos porcentuales (Winogrande) y una recuperación media del 99,9%.

## Requisitos de hardware

- **VRAM estimada**: al ser INT8, los pesos ocupan aproximadamente 8 GB (8.030 millones de parámetros × 1 byte). Con las activaciones y la caché KV, se recomienda al menos 12 GB de VRAM para inferencia con batch pequeño (1-4 peticiones).
- **GPU recomendadas**: NVIDIA RTX 4080/4090, A100, L100, V100 (16 GB) o cualquier GPU con 12-16 GB de memoria. Para cargas mayores, se puede usar tensor parallel con varias GPUs.
- **Consumer GPU**: sí, cabe en tarjetas de 12-16 GB como la RTX 4080 o la RTX 4090, pero no en modelos de 8 GB.
- **Opciones de despliegue**: vLLM (recomendado), Hugging Face Transformers (con carga en 8 bits), o mediante el contenedor de Red Hat (redhatai-meta-llama-3-1-8b-instruct-quantized-w8a16). También es compatible con TGI (text-generation-inference) y llama.cpp, aunque no se documenta en la ficha.
- **Latencia y throughput**: no se han publicado datos concretos. Se espera un throughput similar al del modelo base con una latencia ligeramente menor por la reducción de memoria, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Rendimiento (promedio OpenLLM v1) | Licencia |
|---|---|---|---|---|---|
| Meta-Llama-3.1-8B-Instruct (original) | 8,03B | FP16 | no disponible | 74,05 | llama3.1 |
| RedHatAI/Meta-Llama-3.1-8B-Instruct-quantized.w8a16 | 8,03B | INT8 | no disponible | 74,12 | llama3.1 |
| RedHatAI/Meta-Llama-3.1-8B-Instruct-quantized.w4a16 | 8,03B | INT4 | no disponible | no disponible | llama3.1 |

La comparativa se limita a la información disponible. La versión w4a16 existe en el catálogo de Red Hat, pero no se proporcionan datos de rendimiento. La cuantización w8a16 es una alternativa equilibrada entre calidad y ahorro de memoria frente a la w4a16, que reduciría aún más el tamaño pero con mayor pérdida potencial.

## Limitaciones y advertencias

- La cuantización INT8 introduce una pérdida de precisión muy leve (menor del 1% en los benchmarks evaluados), pero puede ser más notable en tareas específicas o con dominios muy concretos.
- El modelo hereda los sesgos y alucinaciones del modelo original de Meta, que pueden estar presentes en las respuestas.
- Solo se ha evaluado en los benchmarks listados; no se han publicado resultados para otras tareas como razonamiento matemático avanzado o generación de código.
- La licencia llama3.1 permite uso comercial, pero requiere aceptar los términos de la licencia de Meta y no utilizarlo para ciertos usos prohibidos (por ejemplo, aplicaciones ilegales).
- La longitud de contexto no se ha documentado en la ficha del modelo; si se necesita un contexto largo, se debe verificar la compatibilidad con el backend de despliegue.
- El modelo está pensado para chat y asistentes; no se recomienda para tareas de generación de texto libre sin supervisión.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/RedHatAI/Meta-Llama-3.1-8B-Instruct-quantized.w8a16
- Modelo base (Meta): https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Paper de GPTQ: https://arxiv.org/abs/2210.17323
- Librería llm-compressor: https://github.com/vllm-project/llm-compressor
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
- Catálogo de contenedores de Red Hat (versión w4a16): https://catalog.redhat.com/en/software/containers/rhai/redhatai-meta-llama-3-1-8b-instruct-quantized-w4a16/6a16690f176017ee2a03977e
