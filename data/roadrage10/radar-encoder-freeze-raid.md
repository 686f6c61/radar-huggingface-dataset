# roadrage10/radar-encoder-freeze-raid

## Resumen

radar-encoder-freeze-raid es un modelo de clasificación de texto publicado por el usuario roadrage10 en HuggingFace, orientado a la detección de texto generado por IA. Se distribuye como un clasificador de secuencias de tipo encoder con 399.711.361 parámetros (~400 M) y pesos en formato safetensors, dentro de la librería transformers. La model card se generó automáticamente con el Trainer de HuggingFace y no documenta ni el modelo base ni el dataset de entrenamiento, ambos marcados como "None" o "More information needed".

El nombre del repositorio y la libreta asociada en GitHub (mam10eks/pan26-radar) apuntan a RADAR (Robust Adversarial-Resistant Detection with Adaptive Reasoning), descrito como una arquitectura híbrida para detectar texto generado por IA con robustez frente a ofuscaciones adversarias y suplantación de estilo. También sugiere una relación con RAID, el benchmark compartido de evaluación de detectores de texto generado por máquina, aunque esta vinculación no se confirma en la model card.

Su relevancia es limitada: el repositorio acumula 3 descargas y 0 likes, no declara licencia ni idiomas soportados, y las métricas publicadas (ROC-AUC 0,974, F1 0,918, C@1 0,92) proceden de un conjunto de evaluación no identificado, por lo que no son reproducibles ni comparables con referencias externas sin más contexto. Es, por tanto, un artefacto experimental útil para inspección técnica, no un modelo validado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer para clasificación de secuencias (arquitectura base no especificada; etiquetado con custom_code) |
| Parámetros totales | 399.711.361 (~400 M) según safetensors |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se publican artefactos GGUF, AWQ, GPTQ ni INT8; al ser un encoder de ~400 M es convertible con herramientas estándar, pero sin versiones oficiales) |
| Idiomas soportados | No disponible (la model card no los documenta) |
| Licencia | No disponible |
| Formato de pesos | safetensors (el repositorio incluye además logs de TensorBoard) |
| Tamaño del repositorio | 3,2 GB |
| Pipeline declarado | text-classification |
| Métrica declarada | f1 |
| Fecha de creación / actualización | 13 de octubre de 2026 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura. Por el tamaño (399,7 M de parámetros), el pipeline declarado (text-classification) y las métricas reportadas, se trata de un encoder transformer con cabeza de clasificación, no de un modelo generativo. El repositorio lleva la etiqueta custom_code, lo que implica que la carga requiere trust_remote_code=True y que parte del código de modelado no es el estándar de transformers. La búsqueda web asocia el nombre RADAR a una arquitectura híbrida pensada para robustez frente a ofuscación adversaria, pero no hay documentación técnica publicada que permita confirmar qué componentes concretos implementa este checkpoint.

El entrenamiento se realizó con el Trainer de HuggingFace durante 10 épocas (5.000 pasos, 500 pasos por época) sobre un dataset no identificado. Hiperparámetros declarados: learning rate 2e-05, batch de entrenamiento 32, batch de evaluación 64, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08 en la variante fused de PyTorch, scheduler coseno con warmup del 3 %. No se documenta composición del dataset, número de tokens, ni si hubo RLHF, DPO u otra fase de alineamiento. Las versiones de framework indicadas son Transformers 5.0.0, PyTorch 2.10.0+cu128, Datasets 4.0.0 y Tokenizers 0.22.2.

## Capacidades

- Clasificación de texto: el pipeline declarado es text-classification, orientado a discriminar texto generado por IA frente a texto humano.
- Salida probabilística y calibración: la evaluación incluye la métrica Brier, lo que indica que el modelo expone probabilidades y que el autor evaluó su calibración.
- Robustez declarada frente a ofuscación: la descripción de RADAR encontrada en la búsqueda menciona robustez ante transformaciones adversarias y suplantación de estilo, aunque no hay evaluación pública que lo respalde para este checkpoint concreto.
- Métricas compatibles con campañas PAN: se reportan C@1 y F05u, habituales en las evaluaciones PAN de detección de texto generado por máquina, lo que sugiere un escenario de evaluación de ese tipo.
- Generación de texto: no. Es un clasificador, no un modelo de lenguaje.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (modo thinking, visión, audio): ninguna declarada.

## Casos de uso

- Moderación de contenido en plataformas: uso como primer filtro para marcar publicaciones sospechosas de haber sido generadas por IA antes de una revisión humana, aprovechando el bajo coste de un encoder de ~400 M frente a un LLM generativo.
- Verificación editorial en medios: triaje de artículos, columnas de opinión o comunicados recibidos por una redacción, clasificando cada pieza y derivando a revisión manual solo las que superen un umbral de probabilidad.
- Detección de reseñas falsas en comercio electrónico: análisis por lotes de reseñas de producto para señalar patrones de texto sintético, siempre acompañado de revisión humana dado el riesgo de falsos positivos.
- Integridad académica: filtro previo en plataformas de entrega de trabajos que marque documentos candidatos a inspección, sin sustituir la valoración del profesorado.
- Curación de datasets de entrenamiento: limpieza de corpus web o propios para eliminar contenido sintético antes de reutilizarlo en el entrenamiento de otros modelos.
- Cumplimiento de obligaciones de etiquetado: apoyo a flujos internos que deban identificar contenido generado por IA para aplicar avisos o etiquetas, en el contexto de marcos regulatorios de transparencia.
- Detección de granjas de contenido y SEO masivo: monitorización de dominios que publican texto automatizado a gran escala, clasificando páginas individuales.
- Investigación en detección de texto generado: uso como línea base en experimentos académicos, con la advertencia de que la falta de documentación del dataset de entrenamiento limita su reproducibilidad.

## Benchmarks y rendimiento

El model-index oficial del repositorio está vacío (`"results": []`), por lo que no hay benchmarks estándar (MMLU, HumanEval, GSM8K ni similares), que por otra parte no aplican a un clasificador. Los únicos datos disponibles son las métricas de evaluación declaradas por el autor, que se reproducen tal cual. No se especifica el conjunto de evaluación ni el convenio de cálculo (relevante en el caso de Brier, donde el autor no aclara la dirección de la métrica).

Resultados finales declarados en la model card:

| Métrica | Valor |
|---|---|
| Loss | 0,1972 |
| ROC-AUC | 0,974 |
| Brier | 0,941 |
| C@1 | 0,92 |
| F1 | 0,918 |
| F05u | 0,935 |
| Mean | 0,938 |

Evolución durante el entrenamiento (extracto de la tabla publicada):

| Época | Paso | Validation loss | ROC-AUC | Brier | C@1 | F1 | F05u | Mean |
|---|---|---|---|---|---|---|---|---|
| 1,08 | 500 | 0,3152 | 0,946 | 0,898 | 0,850 | 0,830 | 0,912 | 0,887 |
| 3,23 | 1500 | 0,2396 | 0,963 | 0,926 | 0,900 | 0,895 | 0,929 | 0,923 |
| 5,39 | 2500 | 0,2230 | 0,968 | 0,932 | 0,906 | 0,908 | 0,908 | 0,925 |
| 7,54 | 3500 | 0,2093 | 0,971 | 0,936 | 0,913 | 0,913 | 0,928 | 0,932 |
| 8,62 | 4000 | 0,2072 | 0,972 | 0,937 | 0,914 | 0,913 | 0,929 | 0,933 |
| 9,70 | 4500 | 0,2077 | 0,972 | 0,937 | 0,914 | 0,913 | 0,931 | 0,933 |

No se ha publicado ninguna comparación con otros detectores en la información disponible, ni datos de latencia o throughput.

## Requisitos de hardware

- Peso de los parámetros: aproximadamente 1,6 GB en FP32, 0,8 GB en FP16/BF16, 0,4 GB en INT8 y 0,2 GB en INT4 para los 399,7 M de parámetros.
- VRAM para inferencia: en la práctica, entre 1 y 2 GB en FP16/BF16 contando activaciones para lotes pequeños; cifras orientativas, ya que no se publican requisitos oficiales.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM. Cabe holgadamente en tarjetas de consumo como RTX 3060, RTX 4060, RTX 4090 o superiores, así como en GPUs de datacenter (A100, H100) donde el modelo estará limitado por CPU o por el pipeline de datos, no por la GPU.
- Cabe en GPU de consumo: sí, en cualquiera con al menos 4 GB de VRAM, incluidas soluciones integradas con memoria unificada suficiente.
- Opciones de despliegue: pipeline de transformers (requiere trust_remote_code=True por la etiqueta custom_code), exportación a ONNX Runtime para inferencia en CPU, Text Generation Inference en modo clasificación y despliegue manual con PyTorch. No hay confirmación de soporte en vLLM, llama.cpp ni Ollama, y llama.cpp requeriría una conversión a GGUF que no está publicada.
- Latencia y throughput: no disponibles. El tamaño del repositorio (3,2 GB) sugiere que incluye checkpoints intermedios y estados del optimizador además de los pesos finales.

## Comparativa con modelos similares

La comparativa se limita a detectores de texto generado por IA de tamaño comparable para los que existen fichas públicas. Los datos de los modelos alternativos provienen de sus propios repositorios y no se han verificado de forma independiente.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento declarado |
|---|---|---|---|---|---|
| roadrage10/radar-encoder-freeze-raid | ~400 M | No disponible | No disponible | HuggingFace, repo de 3,2 GB, 3 descargas | ROC-AUC 0,974 / F1 0,918 (conjunto no identificado) |
| openai-community/roberta-base-openai-detector | ~125 M (RoBERTa-base) | 512 tokens | MIT | HuggingFace, ampliamente usado | No comparable de forma directa con las métricas anteriores |
| Hello-SimpleAI/chatgpt-detector-roberta | ~125 M (RoBERTa-base) | 512 tokens | No disponible | HuggingFace, con demo pública | No comparable de forma directa con las métricas anteriores |

No hay datos públicos que permitan comparar este checkpoint con detectores entrenados sobre RAID o con los sistemas presentados en campañas PAN, porque el conjunto de evaluación de radar-encoder-freeze-raid no está documentado.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; en la práctica, el modelo no debería desplegarse en producción sin aclarar este punto con el autor.
- Idiomas no documentados: se desconoce si el entrenamiento cubrió solo inglés o varios idiomas, lo que impide anticipar su comportamiento en castellano.
- Dataset de entrenamiento desconocido: la model card indica "None" en modelo base y dataset, así que no se puede auditar la composición de los datos ni descartar sesgos de dominio o de generador.
- Riesgo de falsos positivos: los detectores de este tipo penalizan texto humano muy formulario o repetitivo, y textos escritos por hablantes no nativos; sin umbrales calibrados por el usuario, el uso directo produce acusaciones erróneas.
- Obsolescencia rápida: cualquier detector de texto generado por IA pierde eficacia frente a modelos generativos nuevos y frente a ataques de parafraseo o reescritura; los resultados de 2026 no garantizan validez futura.
- Riesgo de seguridad en la carga: la etiqueta custom_code obliga a ejecutar código del repositorio al cargar el modelo con trust_remote_code=True; conviene revisar ese código antes de instanciarlo en un entorno con datos sensibles.
- Ambigüedad de la métrica Brier: el valor 0,941 no viene acompañado de la definición usada, y en el convenio habitual (menor es mejor) sería un resultado pobre; debe interpretarse con cautela.
- Falta de validación comunitaria: 3 descargas y 0 likes implican que el modelo no ha sido replicado ni auditado por terceros.
- Longitud de contexto no especificada: no se puede planificar el troceado de documentos largos sin medir experimentalmente el límite real.
- Fechas de creación y actualización idénticas (13 de octubre de 2026) y sin historial de revisiones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/roadrage10/radar-encoder-freeze-raid
- Réplica o copia del repositorio: https://huggingface.co/yusr9/radar-encoder-freeze-raid
- Libreta de referencia en GitHub: https://github.com/mam10eks/pan26-radar/blob/main/notebooks/radar_encoder_freeze_raid.ipynb
- Repositorio pan26-radar en GitHub: https://github.com/mam10eks/pan26-radar
- No se han encontrado paper, blog técnico ni demo oficial asociados a este checkpoint en la búsqueda web.
