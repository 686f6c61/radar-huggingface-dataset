# mseeam2/hw1-hc3-detector

## Resumen

`mseeam2/hw1-hc3-detector` es un clasificador binario de texto en inglés que distingue respuestas escritas por personas de respuestas generadas por ChatGPT. Lo desarrolla Mohammad Seeam como tarea académica de procesamiento de lenguaje natural y se publica en Hugging Face con la librería `transformers` y pesos en `safetensors`.

El modelo parte de `sentence-transformers/all-MiniLM-L6-v2`, un encoder tipo BERT de 6 capas y 22.713.986 parámetros, al que se le añade una cabeza de clasificación y se afina de extremo a extremo. Se entrenó sobre el corpus HC3 en inglés, con 37.334 respuestas de entrenamiento y 4.668 de test, manteniendo siempre juntas las respuestas humanas y de ChatGPT a la misma pregunta para evitar filtraciones entre particiones.

Su relevancia es acotada pero clara: demuestra que un encoder pequeño y barato de ejecutar puede alcanzar un 98,91 % de exactitud en la detección de texto generado por ChatGPT dentro del dominio HC3, muy por encima del 84,49 % que se obtiene con embeddings congelados más regresión logística. No es un detector universal de autoría: el propio autor advierte que es material educativo y que las predicciones no deben tomarse como prueba de autoría por IA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT de 6 capas, variante MiniLM) con cabeza de clasificación de secuencia |
| Parámetros totales | 22.713.986 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de secuencia empleada en el entrenamiento; el texto se trunca a 256) |
| Tipos de cuantización | no disponible (solo se publican pesos `safetensors` en precisión completa; no hay variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | safetensors |

Datos adicionales: pipeline `text-classification`, tamaño del repositorio 0,1 GB, 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 24 de septiembre de 2026.

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer bidireccional de tipo BERT, concretamente el backbone MiniLM-L6 de `all-MiniLM-L6-v2` (6 capas, 384 dimensiones ocultas, alrededor de 22,7 millones de parámetros), sobre el que se monta una cabeza de clasificación para dos etiquetas: `0` = Human y `1` = ChatGPT. No emplea decodificación autorregresiva ni mecanismos de atención lineal o SSM; es un clasificador puro de secuencia completa que solo recibe el texto de la respuesta, sin la pregunta.

El ajuste fino se hizo sobre el corpus HC3 en inglés, particionado por pregunta con semilla 42 para que las respuestas humanas y de ChatGPT a una misma pregunta cayeran siempre en la misma partición. Las particiones quedaron en 37.334 respuestas de entrenamiento, 4.666 de validación y 4.668 de test, con proporciones equilibradas de ambas clases en cada una. Se afinaron el encoder completo y la cabeza con pérdida de entropía cruzada, optimizador AdamW, tasa de aprendizaje 2e-5, 5 épocas, tamaño de lote 32, longitud máxima de 256 tokens y *padding* dinámico. No se documenta en la información disponible ninguna fase de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Clasificación binaria de texto en inglés: devuelve una etiqueta (Human o ChatGPT) y su probabilidad asociada.
- Detección de estilo generativo dentro del dominio de respuestas tipo pregunta-respuesta del corpus HC3.
- Reutilización como extractor de características: al derivar del encoder MiniLM, las representaciones internas de 384 dimensiones pueden servir para tareas auxiliares de similitud o *clustering*.
- Procesamiento por lotes con *padding* dinámico, lo que permite clasificar grandes volúmenes de texto con un coste computacional muy bajo.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso: no genera texto, solo puntúa una entrada.
- No dispone de modo de razonamiento (*thinking mode*), visión, audio, matemáticas ni generación de código.
- Capacidad multilingüe inexistente: está entrenado y evaluado únicamente en inglés.
- Capacidad especial: ninguna declarada más allá de la clasificación; el límite de 256 tokens es un truncado duro, no una ventana extensible.

## Casos de uso

- Triaje de respuestas en foros de preguntas y respuestas: clasificar automáticamente las respuestas entrantes como humanas o generadas por IA antes de la moderación manual, aprovechando que el modelo fue entrenado sobre ese mismo tipo de contenido.
- Auditoría de integridad académica como señal indiciaria: usar la probabilidad de la clase ChatGPT como una alerta más dentro de un proceso con revisión humana, nunca como veredicto, dado que en el propio test 50 respuestas humanas se clasificaron erróneamente como ChatGPT.
- Limpieza de corpus para entrenamiento: filtrar respuestas sintéticas dentro de un *dataset* en inglés antes de usarlo para ajustar otros modelos, ejecutando la clasificación por lotes en CPU a bajo coste.
- Investigación en estilometría y detección de texto generado: utilizar el modelo como línea base reproducible sobre HC3 y comparar contra arquitecturas mayores para medir la relación coste-exactitud.
- Monitorización de contenido en plataformas de atención al cliente: etiquetar respuestas o transcripciones en inglés para detectar borradores generados automáticamente y auditar la proporción de contenido sintético.
- Preprocesado de encuestas abiertas: separar respuestas redactadas por personas de respuestas copiadas de un asistente conversacional en estudios con formularios en inglés.
- Despliegue como microservicio de clasificación en tiempo real: con 22,7 millones de parámetros puede servirse detrás de una API REST en hardware modesto y responder con latencias de milisegundos, integrándose en un *pipeline* de ingesta de textos.

## Benchmarks y rendimiento

Los únicos resultados publicados proceden de la model card y corresponden al mismo conjunto de test reservado de 4.668 respuestas:

| Enfoque | Exactitud en test |
|---|---|
| Embeddings de frase congelados + regresión logística | 84,49 % |
| Transformer afinado (este modelo) | 98,91 % |

El ajuste fino redujo los errores de predicción de 724 a 51. De esos 51 errores, 50 corresponden a respuestas humanas clasificadas incorrectamente como ChatGPT. El conjunto de test está equilibrado al 50 % entre clases, por lo que la exactitud es una métrica interpretable en este contexto. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 91 MB en FP32 (tamaño de los pesos `safetensors`), unos 45 MB en FP16 y unos 23 MB en int8. El consumo real en ejecución es mayor por activaciones y *framework*, pero se mantiene muy por debajo de 1 GB.
- GPU recomendadas: cualquiera, incluidas GTX 1050 Ti, GTX 1650, RTX 3060, RTX 4090, A100 y H100. No requiere GPU dedicada.
- Cabe en cualquier GPU de consumo e incluso en CPU: es viable ejecutarlo en un contenedor sin acelerador y en portátiles modestos. También cabe en dispositivos de borde, aunque no se documenta soporte específico.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (el repositorio incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`), Hugging Face Inference Endpoints, exportación a ONNX Runtime y servicio propio con FastAPI. Al ser un encoder de clasificación, no aplica el despliegue con vLLM ni llama.cpp en su uso habitual.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Con este tamaño de modelo y lotes de 32, el rendimiento esperado es alto en cualquier GPU moderna, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

No se dispone de datos verificados de los modelos alternativos en la información proporcionada, por lo que la comparación se limita a la categoría y a los datos propios del modelo:

| Modelo | Categoría | Parámetros | Contexto | Exactitud en HC3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mseeam2/hw1-hc3-detector | Encoder BERT MiniLM afinado para clasificación | 22.713.986 | 256 tokens | 98,91 % en test propio | no disponible | Hugging Face, 0 descargas |
| Detectores basados en RoBERTa afinados sobre HC3 | Encoder RoBERTa con cabeza de clasificación | no disponible | no disponible | no disponible | no disponible | no disponible |
| Servicios comerciales de detección de IA (por ejemplo, GPTZero u Originality.ai) | API propietaria | no disponible | no disponible | no disponible | propietaria | solo como servicio |
| Clasificador de texto generado de OpenAI | API propietaria, retirada | no disponible | no disponible | no disponible | propietaria | discontinuado |

La diferencia cualitativa relevante es de escala: los detectores basados en RoBERTa manejan típicamente cientos de millones de parámetros, mientras que este modelo se queda en 22,7 millones, con el consiguiente ahorro de memoria y de coste de inferencia a cambio de una ventana de contexto más corta y de una validación limitada a un único corpus.

## Limitaciones y advertencias

- Uso previsto educativo. El autor indica explícitamente que es un trabajo de clase y que su rendimiento en HC3 puede no generalizar a modelos de IA más recientes, a otros estilos de escritura ni a otros conjuntos de datos.
- Sesgo de dominio: el entrenamiento se hizo sobre respuestas del corpus HC3 en inglés, por lo que el modelo está ajustado a ese registro y puede degradarse en textos técnicos, literarios, conversacionales o muy cortos.
- Riesgo elevado de falsos positivos sobre texto humano. En el test, 50 respuestas humanas se clasificaron como ChatGPT; el propio autor advierte que las predicciones no deben tratarse como prueba de autoría por IA.
- Riesgo de alucinación no aplica en sentido generativo, porque el modelo no produce texto libre, pero sí existe riesgo de sobreconfianza en la probabilidad devuelta.
- Truncado a 256 tokens: cualquier respuesta más larga se recorta y la parte descartada no influye en la predicción.
- Limitación idiomática: solo inglés. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- Restricciones de licencia: la model card no declara licencia, por lo que el uso comercial queda en una situación jurídica indeterminada y no debería asumirse permiso.
- Trazabilidad escasa: 0 descargas y 0 likes, sin versión publicada, sin paper asociado y sin evaluación externa independiente.
- No apto como componente único de decisión en producción: cualquier despliegue real debería combinarlo con revisión humana y con umbrales calibrados sobre datos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mseeam2/hw1-hc3-detector
- Repositorio indicado en la model card: https://huggingface.co/mseeam2/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Los resultados de la búsqueda web proporcionada no contienen enlaces relevantes para este modelo: son páginas sin relación con el proyecto, por lo que no se incluyen.
