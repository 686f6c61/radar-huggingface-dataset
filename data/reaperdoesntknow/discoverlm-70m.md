# reaperdoesntknow/DiscoverLM-70M

## Resumen

DiscoverLM-70M es un modelo de lenguaje causal de 69 millones de parámetros desarrollado por el usuario reaperdoesntknow, que introduce una arquitectura denominada Mixture-of-Attentions (MoA). En lugar de calcular la atención mediante el producto escalar Q·Kᵀ, como hacen los transformers estándar, este modelo utiliza una distancia de Mahalanobis aprendida (negativa al cuadrado) como función de puntuación, lo que permite que cada cabeza de atención opere en un espacio métrico donde se respeta la desigualdad triangular de forma regularizada, no por aproximación. El modelo se presenta como una prueba de concepto para demostrar que una atención basada en distancias geométricas puede ser viable y estable durante el entrenamiento.

El modelo tiene 69.130.608 parámetros, una ventana de contexto de 1.024 tokens y está entrenado sobre tres conjuntos de datos: razonamiento multi-paso filtrado (Opus-4.6-Reasoning-3000x-filtered), problemas matemáticos (UltraData-Math) e instrucciones generales (alpaca-cleaned). El entrenamiento se realizó en precisión fp32 sobre una NVIDIA H100 (según la model card, ejecutado en Colab) con un total de 262.144 tokens vistos, lo que supone un entrenamiento extremadamente reducido en comparación con modelos convencionales. Su relevancia radica en explorar alternativas arquitectónicas a la atención por producto escalar, con posibles implicaciones para la interpretabilidad geométrica y la eficiencia en tareas de razonamiento.

La licencia es Creative Commons (cc), y el repositorio incluye pesos en formato safetensors. El modelo está orientado exclusivamente al inglés y se distribuye a través de Hugging Face con la librería transformers. A pesar de su pequeño tamaño, incorpora mecanismos avanzados como BlackHoleRoPE, enrutamiento por tokens (top-2 de 4 vías) y una cabeza de LM que también utiliza mezcla de atenciones, lo que lo convierte en un objeto de estudio interesante para investigadores de arquitecturas de atención alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Attentions (MoA) con 4 bloques, 64 cabezas de atención métrica (head_dim=8), enrutamiento top-2 de 4 vías, HyperFFN y cabeza MoA |
| Parametros totales | 69.130.608 |
| Parametros activos | no disponible (no es un modelo MoE convencional; el enrutamiento es por token, pero no se especifica el número de parámetros activos por inferencia) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en fp32 según el entrenamiento; no se mencionan cuantizaciones publicadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Creative Commons (cc) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DiscoverLM-70M se basa en una arquitectura de atención métrica que sustituye el producto escalar por una distancia de Mahalanobis negativa al cuadrado. Cada una de las 64 cabezas de atención global opera en un espacio de 8 dimensiones con escalado diagonal aprendido, un origen de bola aprendido y un radio adaptativo para poda dispersa: los pares de tokens fuera de la bola se enmascaran antes del softmax. Además, se aplica un regularizador de desigualdad triangular (λ=0,01 con 64 muestras por lote) sobre tripletas aleatorias durante el entrenamiento, lo que fuerza a que la distancia cumpla d(a,c) ≤ d(a,b) + d(b,c). El modelo combina cuatro vías paralelas de atención por token: convolución local depthwise, atención métrica multi-cabeza completa, mezcla de canales con puerta y atención métrica multi-query (64 consultas). Un router aprendido selecciona las dos vías más relevantes por posición de token, y las salidas se escalan mediante puertas de características antes de la mezcla.

La posición se codifica con BlackHoleRoPE, una variante de RoPE que introduce perturbaciones de fase aprendidas a partir de una base de Fourier compacta, manteniendo las rotaciones de Q/K unitarias y aplicando un control de energía acotado a las amplitudes de V en el rango [0,5, 2,0]. La capa de avance (HyperFFN) tiene tres ramas: un MLP SwiGLU, una convolución causal separable en profundidad y un cuello de botella de bajo rango con puerta, también enrutado por token con selección top-2. La cabeza de lenguaje replica la mezcla de atenciones con 32 cabezas (head_dim=16) antes de proyectar a logits mediante SwiGLU, con pesos atados a la incrustación de entrada. El entrenamiento se realizó con AdamW, tasa de aprendizaje 3e-4 con decaimiento coseno, tamaño de lote 4, 512 pasos y 8 épocas sobre un total de 262.144 tokens, en precisión fp32. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de texto en inglés con un vocabulario de 48.000 tokens mediante un tokenizador personalizado (no se especifica el tipo).
- Razonamiento multi-paso: entrenado sobre un dataset filtrado de razonamiento (Opus-4.6-Reasoning-3000x-filtered), aunque su tamaño reducido limita la complejidad de las inferencias.
- Resolución de problemas matemáticos básicos gracias al dataset UltraData-Math.
- Seguimiento de instrucciones generales a partir de alpaca-cleaned.
- Enrutamiento dinámico por token: el modelo selecciona de forma adaptativa entre las cuatro vías de atención y las tres ramas de la FFN, lo que podría permitir una especialización implícita por tipo de token.
- No se documenta soporte para tool calling, agentes, visión ni audio.
- Capacidades multilingües: solo inglés.

## Casos de uso

- Investigación académica en arquitecturas de atención: el modelo sirve como banco de pruebas para estudiar la viabilidad de la atención métrica con desigualdad triangular, comparando su comportamiento frente a transformers clásicos en tareas de lenguaje pequeñas.
- Educación y experimentación: por su tamaño reducido, puede ejecutarse en hardware modesto, lo que lo hace adecuado para cursos de aprendizaje profundo que quieran ilustrar alternativas al producto escalar.
- Prototipado de sistemas de razonamiento simbólico: su entrenamiento en datos de razonamiento filtrado permite explorar si la geometría métrica mejora la coherencia en cadenas de pensamiento cortas.
- Generación de texto corto en inglés: para tareas de completado de frases o generación de respuestas breves donde no se requiera gran capacidad.
- Análisis de representaciones internas: al estar basado en distancias, permite visualizar los espacios métricos aprendidos y estudiar la emergencia de estructuras geométricas en los embeddings.
- Benchmark de eficiencia de entrenamiento: al haber sido entrenado con solo 262.144 tokens, puede utilizarse para comparar la velocidad de convergencia y la estabilidad del entrenamiento frente a modelos de tamaño similar con atención estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta únicamente métricas de entrenamiento:

| Época | Pérdida media | Pérdida mínima | Desviación estándar | Precisión de token |
|---|---|---|---|---|
| 1 | 2,887 | 2,285 | 0,291 | 59,2% |
| 2 | 2,324 | 1,651 | 0,259 | 63,4% |
| 3 | 1,931 | 1,232 | 0,211 | 68,4% |
| 4 | 1,616 | 1,012 | 0,201 | 74,4% |
| 5 | 1,432 | 0,954 | 0,169 | 77,0% |
| 6 | 1,211 | 0,677 | 0,180 | 79,0% |
| 7 | 1,075 | 0,599 | 0,151 | 80,1% |
| 8 | 1,014 | 0,718 | 0,142 | 80,8% |

El mejor paso individual (paso 393) alcanzó una pérdida de 0,599 y una precisión de token del 88,4%. La varianza de la pérdida se redujo a la mitad a lo largo del entrenamiento (σ de 0,291 a 0,142), lo que sugiere que el enrutamiento de la mezcla de atenciones se estabilizó. No hay datos comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 69M de parámetros en fp32, el modelo ocupa aproximadamente 276 MB en memoria (69M × 4 bytes). En fp16 serían unos 138 MB. Es ejecutable en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente. Incluso CPU es viable para inferencia.
- El entrenamiento se realizó en una NVIDIA H100 (según la model card, a través de Colab), aunque no se indica el tiempo ni el coste exacto.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se proporcionan archivos GGUF en el repositorio, por lo que habría que convertirlos manualmente.
- Latencia y throughput: no disponibles. Dado el tamaño, la latencia en GPU moderna sería de milisegundos por generación de token, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables de otros modelos de 70M de parámetros en los mismos benchmarks. A modo orientativo, se puede comparar estructuralmente con:

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DiscoverLM-70M | 69M | 1.024 | MoA (atención métrica) | CC | Hugging Face |
| GPT-2 (small) | 124M | 1.024 | Transformer estándar | MIT | Hugging Face |
| TinyLlama (1.1B) | 1,1B | 2.048 | Transformer estándar | Apache 2.0 | Hugging Face |

DiscoverLM-70M es sustancialmente más pequeño que GPT-2 y TinyLlama, y no se han publicado evaluaciones en tareas estándar que permitan una comparación cuantitativa. Su interés radica en la innovación arquitectónica, no en el rendimiento bruto.

## Limitaciones y advertencias

- Tamaño muy reducido: con 69M de parámetros y un entrenamiento de solo 262.144 tokens, la capacidad de generación y razonamiento es extremadamente limitada. No es adecuado para tareas de producción reales.
- Entrenamiento insuficiente: el número de tokens vistos es varios órdenes de magnitud inferior al de modelos convencionales (incluso modelos pequeños como GPT-2 se entrenan con miles de millones de tokens). La precisión de token del 80,8% en entrenamiento indica un sobreajuste probable al pequeño conjunto de datos.
- Solo inglés: no soporta otros idiomas.
- Contexto corto: 1.024 tokens limita el uso en tareas que requieran contexto largo.
- Riesgo de alucinación: al ser un modelo pequeño y con entrenamiento limitado, las alucinaciones y respuestas incoherentes serán frecuentes fuera de los dominios de entrenamiento.
- Licencia Creative Commons (cc): debe verificarse la variante específica (CC-BY, CC-BY-SA, CC0, etc.) para conocer las restricciones exactas de uso comercial y atribución. La model card no especifica la variante.
- No se documentan sesgos específicos, pero al entrenarse con datasets como alpaca-cleaned, puede heredar sesgos presentes en esos datos.
- Sin garantías de producción: el autor no proporciona información sobre robustez, seguridad ni alineación. No debe utilizarse en aplicaciones donde se requiera fiabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DiscoverLM-70M
- Colección DiscoverLM: https://huggingface.co/collections/reaperdoesntknow/discoverlm
- Dataset Opus-4.6-Reasoning-3000x-filtered: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Informe de seguridad de Protect AI: https://protectai.com/insights/models/reaperdoesntknow/DiscoverLM-70M/f2f6af725f4af9ab6b4f388d9e1892a044fec0b9/overview
- Informe de seguridad de Palo Alto Networks: https://insights-db.paloaltonetworks.com/models/reaperdoesntknow/DiscoverLM-70M/c1e07c8fe2e5acb30ba6db94d088c7fb582d501f/overview
