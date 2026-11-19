# ikimyaii/GatedDeltaNet-1.3B-semi-structured-Wanda-50pct

## Resumen

GatedDeltaNet-1.3B-semi-structured-Wanda-50pct es una variante podada del modelo m-a-p/1.3B-100B-GatedDeltaNet-pure, publicado por el usuario ikimyaii en Hugging Face. Se trata de un checkpoint experimental que aplica poda one-shot (sin reentrenamiento posterior) al 50 % de dispersión semi-estructurada sobre todas las capas lineales internas de los bloques, manteniendo embeddings y lm_head densos. El objetivo es servir como línea base para comparar otras técnicas de poda (los modelos EHWS del mismo autor) frente al método Wanda oficial.

El modelo base emplea una arquitectura GatedDeltaNet, una variante de atención lineal con compuertas derivada de DeltaNet y orientada a secuencias largas con coste lineal. El checkpoint contiene 1.466.343.808 parámetros y se distribuye en formato safetensors. Su relevancia es fundamentalmente metodológica: documenta con rigor el protocolo de calibración, la pérdida de calidad asociada a la poda y el equilibrio perfecto de trabajo por fila, lo que lo convierte en una referencia útil para investigar eficiencia y compresión de modelos con atención lineal.

No se dispone de información sobre licencia, idiomas soportados ni pipeline de uso en la información proporcionada. El modelo está pensado para investigación en compresión de redes neuronales más que para despliegue en producción directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (atención lineal con compuertas, familia DeltaNet) |
| Parametros totales | 1.466.343.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (calibración con secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dispersión | 50 % semi-estructurada en capas lineales internas (240 capas) |
| Modelo base | m-a-p/1.3B-100B-GatedDeltaNet-pure |
| Método de poda | Wanda oficial (locuslab/wanda@8e8fc87, rama unstructured, use_variant=False) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura GatedDeltaNet del checkpoint base m-a-p/1.3B-100B-GatedDeltaNet-pure, un transformer con mecanismo de atención lineal con compuertas. No se dispone de detalles adicionales sobre la composición del dataset de preentrenamiento, el número de tokens (el nombre del modelo base sugiere 100B) ni si hubo fases de RLHF o DPO.

Sobre el checkpoint base se aplica poda one-shot con el código oficial de Wanda, sin reentrenamiento. Cada fila elimina los pesos con menor puntuación `|W| * sqrt(||X||)`. La calibración usa el cargador oficial con 128 secuencias de C4 de 2.048 tokens y semilla 0. Los bloques se podan en orden, calibrando cada uno sobre las salidas de los bloques ya podados anteriores. La caminata por capas es código nuevo (los drivers oficiales solo cubren OPT y LLaMA), pero la matemática de poda es la oficial. Los pesos se podan en bfloat16 y el proceso completo tarda 1,5 minutos en una A100 de 40 GB. La dispersión medida sobre los pesos resultantes es exactamente 0,5000, y las 240 capas podadas presentan el mismo número de no ceros por fila, garantizando equilibrio perfecto de trabajo por fila.

## Capacidades

- Generación de texto autoregresiva con arquitectura de atención lineal, adecuada para secuencias largas con coste computacional lineal.
- Razonamiento y respuesta a preguntas de conocimiento general, evaluado en tareas zero-shot (arc, boolq, hellaswag, openbookqa, rte, winogrande).
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades especiales (modo thinking, visión, audio) en la información disponible.
- El modelo está pensado como línea base de investigación en poda, no como modelo de propósito general optimizado.

## Casos de uso

- Investigación en compresión de modelos: sirve como referencia cuantitativa del coste de calidad de Wanda al 50 % de dispersión frente al modelo denso, con perplejidad y precisión zero-shot medidas de forma reproducible.
- Comparación de algoritmos de poda: al ser la línea base de los modelos EHWS del mismo autor, permite aislar la mejora atribuible a métodos alternativos de poda sobre la misma arquitectura y protocolo de calibración.
- Estudio de atención lineal en entornos con restricciones de memoria: la arquitectura GatedDeltaNet reduce el coste de atención a lineal, y la poda al 50 % disminuye el tamaño de los pesos lineales, lo que facilita experimentos en GPUs de gama alta con memoria limitada.
- Evaluación de equilibrio de carga en kernels dispersos: la dispersión uniforme por fila (mismo número de no ceros en las 240 capas) permite validar kernels de sparse GEMM con carga balanceada.
- Reproducción de pipelines de poda: el protocolo documentado (128 secuencias C4 de 2.048 tokens, semilla 0, poda secuencial por bloques) permite reproducir el experimento en una sola A100 de 40 GB en menos de dos minutos.
- Benchmarking de robustez tras poda: las tareas de lm-evaluation-harness permiten medir la degradación por tarea y detectar qué capacidades son más sensibles a la compresión.

## Benchmarks y rendimiento

Perplejidad según el protocolo de evaluación de ELSA (WikiText-2 y C4, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 10,31 | 13,76 |
| Este modelo (50 % Wanda) | 11,91 | 15,30 |

Precisión zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,3763 | 0,3549 |
| arc_easy | 0,7222 | 0,7075 |
| boolq | 0,6159 | 0,6355 |
| hellaswag | 0,4629 | 0,4291 |
| openbookqa | 0,2920 | 0,2660 |
| rte | 0,4982 | 0,4838 |
| winogrande | 0,6188 | 0,6014 |
| Media | 0,5123 | 0,4969 |

La poda al 50 % supone un aumento de perplejidad de 1,60 puntos en WikiText-2 y 1,54 en C4, y una caída media de 1,54 puntos porcentuales en precisión zero-shot. La tarea más afectada es hellaswag (−3,38 puntos); boolq mejora ligeramente (+1,96 puntos).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,9 GB solo para pesos (1,466 mil millones de parámetros × 2 bytes), más memoria para activaciones y caché.
- La poda se realizó en una A100 de 40 GB en 1,5 minutos; la inferencia puede ejecutarse en GPUs muy inferiores.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bfloat16; una RTX 3060 de 12 GB, RTX 4070, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPUs de consumo: sí, en modelos con 8 GB o más de VRAM en bfloat16; en cuantización de 4 bits cabría en GPUs de 4-6 GB, aunque no se documentan cuantizaciones publicadas.
- Opciones de despliegue: requiere `flash-linear-attention` instalado (`import fla`) y carga mediante `AutoModelForCausalLM.from_pretrained(...)`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Wanda 50 %) | 1,466 B | no disponible | no disponible | safetensors | Poda one-shot, perplejidad C4 15,30 |
| m-a-p/1.3B-100B-GatedDeltaNet-pure (denso) | 1,3 B (nominal) | no disponible | no disponible | safetensors | Base sin podar, perplejidad C4 13,76 |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Mencionados como comparación en la model card, sin datos públicos en la información disponible |

La comparación directa más fiable es con el modelo base denso, ya que comparte arquitectura, datos y protocolo de evaluación. No se dispone de datos de benchmarks de los modelos EHWS ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La poda one-shot sin reentrenamiento degrada la calidad de forma medible: +1,60 de perplejidad en WikiText-2 y −1,54 puntos de media en precisión zero-shot.
- hellaswag es la tarea más afectada (−3,38 puntos), lo que sugiere pérdida de capacidad en razonamiento sobre sentido común.
- Riesgo de alucinación: no evaluado en la información disponible; los modelos de 1,3 B de parámetros presentan habitualmente tasas elevadas de alucinación en conocimiento factual.
- Sesgos conocidos: no documentados en la información proporcionada.
- Limitaciones de contexto e idioma: no documentadas; la calibración usó secuencias de 2.048 tokens, pero no se especifica la ventana de contexto efectiva del modelo.
- Licencia no disponible: no puede confirmarse el uso comercial; debe verificarse en el repositorio antes de cualquier despliegue en producción.
- Requiere `flash-linear-attention` para cargarse correctamente; sin esa dependencia el modelo puede no funcionar con `AutoModelForCausalLM`.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria ni reportes de uso en producción.
- Es un artefacto de investigación, no un modelo afinado para instrucciones ni para conversación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-semi-structured-Wanda-50pct
- Modelo base: https://huggingface.co/m-a-p/1.3B-100B-GatedDeltaNet-pure
- Código oficial de Wanda: https://github.com/locuslab/wanda (commit 8e8fc87)
- flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Dataset C4: https://huggingface.co/datasets/allenai/c4
