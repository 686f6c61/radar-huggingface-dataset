# Efe2898/caba-v1-scratch-2xt4

## Resumen

ÇABA v0-core es un prototipo de investigación de generación de texto publicado en HuggingFace por el usuario Efe2898 bajo el identificador Efe2898/caba-v1-scratch-2xt4. Se trata de un modelo entrenado desde cero (from-scratch) sobre dos GPU NVIDIA T4, con un diseño propio identificado como `caba-v0-core-shared-qkv-1-8-64`, que según su identificador y etiquetas combina atención con query, key y value compartidos y un mecanismo de memoria recurrente (recurrent-memory). El presupuesto declarado de parámetros entrenables es de 49.701.952 (unos 49,7 millones), lo que lo sitúa en la gama de modelos pequeños.

En el momento de la última actualización, el repositorio contiene únicamente código fuente, configuración y tokenizador (kumru-tokenizer). Los pesos no se han publicado porque el entrenamiento no ha finalizado; el autor indica que subirá el modelo entrenado y un checkpoint de optimizador reanudable cuando el entrenamiento termine o se detenga de forma controlada. Esto implica que el modelo no es cargable de forma plug-and-play y que no existe ninguna validación con benchmarks.

Su relevancia actual es la de un proyecto abierto en fase temprana: resulta interesante para quienes siguen arquitecturas recurrentes de bajo coste y entrenamientos desde cero en hardware modesto, pero no es utilizable en producción ni evaluable de forma objetiva todavía.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención QKV compartida y memoria recurrente; identificador de arquitectura `caba-v0-core-shared-qkv-1-8-64`, implementada con código propio (`custom_code`) sobre transformers |
| Parametros totales | 49.701.952 planificados (los pesos no están publicados) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no afirma ninguna licencia) |
| Formato de pesos | no disponible (el repositorio solo incluye código, configuración y tokenizador; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

La información publicada describe el modelo como un desarrollo from-scratch con `library_name: transformers` y etiquetas que apuntan a una arquitectura CABA con memoria recurrente y atención de query, key y value compartidos. El identificador `caba-v0-core-shared-qkv-1-8-64` sugiere una configuración fija de dimensiones, pero no se detalla el número de capas, la dimensión oculta, el número de cabezas de atención ni la fórmula exacta del mecanismo de memoria. El autor reconoce explícitamente que la implementación actual no dispone de caché recurrente en streaming, lo que limita el aprovechamiento de la memoria recurrente en generación incremental.

En cuanto al entrenamiento, se declara que se ejecutó (o se está ejecutando) sobre 2×NVIDIA T4, y el repositorio incluye scripts de entrenamiento y preparación de datos, utilidades de validación en notebook, auditoría de datos y métricas. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Los shards de datos no se copian en el repositorio y el autor recomienda revisar las licencias del dataset y del tokenizador antes de redistribuir cualquier material.

## Capacidades

- Generación de texto: el repositorio declara el pipeline `text-generation`, pero no hay pesos publicados que permitan verificarlo.
- Conversación: la etiqueta `conversational` sugiere un uso previsto de diálogo multi-turno, sin evidencia publicada de calidad o consistencia.
- Razonamiento, matemáticas y código: no disponible; no se declara ningún resultado ni capacidad específica.
- Tool calling y function calling: no disponible; no se menciona soporte en la model card.
- Agentes y razonamiento multi-paso: no disponible; no se menciona soporte.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.
- Capacidades especiales: se anuncia memoria recurrente, pero la implementación actual carece de caché en streaming y no se documenta su comportamiento efectivo.

## Casos de uso

- Reproducción de experimentos de entrenamiento desde cero: los scripts y la configuración permiten replicar un entrenamiento de ~49,7 M de parámetros en 2×T4, un escenario de coste reducido para estudiar dinámicas de convergencia en arquitecturas recurrentes.
- Investigación sobre atención con QKV compartido: el diseño `shared-qkv` puede servir como sujeto de ablación frente a atención estándar del mismo presupuesto de parámetros, midiendo perplejidad y coste por token.
- Evaluación de mecanismos de memoria recurrente: útil como banco de pruebas académico siempre que se resuelva la ausencia de caché en streaming, que hoy impediría una decodificación eficiente.
- Prototipado de tokenizadores: el repositorio emplea el `kumru-tokenizer`, de modo que sirve para comparar cobertura y fertilidad de tokens frente a otros tokenizadores en corpus propios.
- Experimentos educativos y docencia: al ser un modelo diminuto, es viable ejecutar el ciclo completo (preparación de datos, entrenamiento, evaluación) en un aula o en una estación de trabajo con dos GPU modesta, algo inviable con modelos de miles de millones de parámetros.
- Ajuste fino sobre dominio cerrado: si se publican los pesos, podría ajustarse para tareas muy acotadas (clasificación de textos cortos, plantillas de respuesta, generación de resúmenes de una línea) en hardware de consumo, aceptando una calidad muy inferior a la de modelos mayores.
- Base para destilación o comparativas de eficiencia: su tamaño permite medir latencia y consumo en CPU o en GPU de gama de entrada, como referencia de la frontera inferior de la escala.

En todos los casos, el uso práctico está condicionado a la publicación de los pesos y a la existencia de una licencia explícita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica que se trata de un prototipo experimental y no de un resultado de benchmark validado, y que los pesos todavía no existen en el repositorio.

## Requisitos de hardware

- Entrenamiento declarado: 2×NVIDIA T4 (16 GB de VRAM cada una), según el propio autor.
- VRAM estimada para inferencia (cálculo a partir de los 49,7 M de parámetros, no confirmado por el autor): aproximadamente 100 MB en FP16, 50 MB en INT8 y 25 MB en INT4, más el coste del estado de activaciones y del contexto.
- GPU recomendadas para inferencia: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090); también es viable en CPU.
- Cabe en GPU consumer: sí, con holgura, en cualquier tarjeta moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` por el uso de código propio; vLLM, llama.cpp, Ollama o TGI requerirían pesos convertidos que hoy no existen, por lo que no están disponibles.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento de ÇABA v0-core que permitan una comparación funcional. La tabla siguiente recoge únicamente datos de escala y disponibilidad; los valores de los modelos de referencia proceden de su documentación pública y no forman parte de la información proporcionada sobre ÇABA.

| Modelo | Parámetros | Contexto | Licencia | Pesos publicados |
|---|---|---|---|---|
| ÇABA v0-core (Efe2898) | 49,7 M (planificados) | no disponible | no disponible | no |
| GPT-2 small | 124 M | 1024 tokens | licencia tipo MIT de OpenAI | sí |
| SmolLM2-135M | 135 M | 8192 tokens | Apache-2.0 | sí |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache-2.0 | sí |

La comparación de rendimiento, contexto efectivo e idiomas no es posible porque ÇABA no ha publicado pesos ni evaluaciones.

## Limitaciones y advertencias

- Los pesos no están publicados: el repositorio contiene solo código, configuración y tokenizador, por lo que el modelo no se puede cargar ni evaluar.
- No hay licencia declarada, ni para el modelo ni para los artefactos asociados; el autor remite a revisar las licencias del dataset y del tokenizador antes de cualquier redistribución. El uso comercial queda, por tanto, en un limbo legal.
- Ausencia de caché recurrente en streaming: limita la decodificación incremental y hace que la memoria recurrente no se explote de forma eficiente en generación.
- Sin benchmarks ni validación externa: cualquier afirmación de calidad sería especulativa.
- Riesgo de alucinación: no evaluado; en un modelo de ~49,7 M de parámetros la fiabilidad factual es previsiblemente muy baja, aunque no hay datos publicados que lo cuantifiquen.
- Idiomas soportados no declarados: no se puede garantizar cobertura multilingüe ni un comportamiento correcto fuera del corpus de entrenamiento, cuya composición tampoco se detalla.
- Sesgos: no evaluados ni documentados; el dataset de entrenamiento no se incluye en el repositorio, lo que impide auditar su composición desde fuera.
- Estado del proyecto: prototipo de investigación en curso, sin garantía de finalización ni de mantenimiento.
- Advertencia de producción: no debe desplegarse en entornos productivos en su estado actual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Efe2898/caba-v1-scratch-2xt4

No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios de dataset, demos o espacios asociados.
