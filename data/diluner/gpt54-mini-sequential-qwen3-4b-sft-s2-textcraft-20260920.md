# Diluner/gpt54-mini-sequential-qwen3-4b-sft-s2-textcraft-20260920

## Resumen

El modelo `Diluner/gpt54-mini-sequential-qwen3-4b-sft-s2-textcraft-20260920` es un ajuste supervisado (SFT) del modelo base `Qwen/Qwen3-4B`, publicado por el usuario Diluner. Se trata del segundo checkpoint de una cadena de entrenamiento secuencial sobre entornos de agentes: BabyAI, TextCraft y SearchQA. El checkpoint publicado corresponde al cierre de la etapa TextCraft, con cinco épocas completadas y 55 actualizaciones de optimizador en esa etapa. El prefijo de entrenamiento completado es babyai → textcraft.

El interés del modelo es metodológico más que de rendimiento: documenta un experimento de destilación desde un profesor identificado como `gpt-5.4-mini` sobre un alumno de 4.411.424.256 parámetros, encadenando entornos de dificultad creciente sin reiniciar el alumno entre etapas. Los entornos empleados (BabyAI, TextCraft, SearchQA) son tareas de razonamiento multi-paso en lenguaje natural, lo que sitúa al modelo en la categoría de agentes conversacionales pequeños.

Es relevante ahora como artefacto reproducible dentro de una línea de experimentación abierta: el autor publica el manifiesto de la etapa, las referencias legibles por máquina y los checksums en `experiment.json`, pero no adjunta evaluación de este checkpoint intermedio. El autor advierte explícitamente de que este repositorio no debe interpretarse como evidencia de una ventaja metodológica general ni de replicación entre semillas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3; no se detallan capas ni dimensiones en la información proporcionada) |
| Parámetros totales | 4.411.424.256 (dato de safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en el repositorio; solo se publican pesos en safetensors sin cuantizar. Cualquier GGUF, AWQ o GPTQ requeriría conversión externa |
| Idiomas soportados | no disponible |
| Licencia | no disponible. La model card indica explícitamente que no se afirma ninguna licencia y remite a los términos del modelo base |
| Formato de pesos | safetensors (configuración, tokenizador y todos los shards incluidos en la raíz del repositorio) |
| Tamaño del repositorio | 17,7 GB |
| Modelo base | Qwen/Qwen3-4B |
| Fecha de creación | 2026-09-21 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3-4B, un transformer decoder-only denso. No se proporcionan en la información disponible detalles sobre número de capas, dimensión oculta, cabezas de atención, tipo de positional encoding ni si se aplicaron variantes como atención lineal o decodificación especulativa. Tampoco se documenta el número total de tokens de entrenamiento ni la composición del dataset de destilación más allá de los nombres de los entornos.

El entrenamiento es un SFT con un profesor designado como `gpt-5.4-mini`. La particularidad metodológica es la secuenciación: el alumno se entrena primero en BabyAI, después en TextCraft y finalmente en SearchQA, con cinco épocas por entorno y arrastrando tanto el alumno como el método a lo largo de la cadena. Este checkpoint es el modelo final de la etapa TextCraft (segunda etapa) dentro de una cadena secuencial distinta de la ejecución independiente histórica. No se documentan mecanismos de RLHF, DPO ni preferencias humanas; el procedimiento descrito es exclusivamente supervisado.

El autor aporta como evidencia de finalización de entrenamiento un manifiesto de etapa completo, un recuento de pasos verificado y una tarea de controlador completada con marcador de verificación. Se advierte que el inventario de selección registra nombres de fichero, tamaños y fechas de modificación, pero no constituye un hash de bytes de tensores vinculado a respuestas de evaluación históricas.

## Capacidades

- Generación de texto conversacional en formato de instrucciones, derivada del pipeline `text-generation` y de la etiqueta `conversational`.
- Razonamiento multi-paso orientado a agentes: el modelo ha sido entrenado en entornos con estructura de acciones y observaciones (BabyAI, TextCraft, SearchQA).
- Ejecución de tareas de elaboración por recetas en el entorno TextCraft, que exige planificación de pasos intermedios y manipulación de objetos descritos en lenguaje natural.
- Resolución de preguntas sobre pasajes o conjuntos de búsqueda (SearchQA) dentro de la fase posterior de la cadena, no incluida en este checkpoint.
- No hay evidencia documentada de soporte de tool calling o function calling nativo.
- No hay evidencia documentada de modo de razonamiento explícito (thinking mode), visión, audio ni otras modalidades.
- Capacidades multilingües: no disponible.
- Capacidad de agente autónomo en producción: no documentada, y el propio autor advierte de que no hay evaluación adjunta para este checkpoint.

## Casos de uso

- Investigación en entrenamiento secuencial de agentes: el checkpoint sirve como punto de comparación frente al modelo de la etapa 1 (BabyAI) y frente al modelo final de la etapa 3, para estudiar olvido catastrófico y transferencia entre entornos.
- Reproducción de experimentos de destilación con profesor propietario: permite auditar la metodología SFT sobre un alumno abierto de 4,4 mil millones de parámetros, partiendo del manifiesto y los checksums publicados en `experiment.json`.
- Base para ajuste posterior en tareas de planificación textual: al haber sido entrenado en TextCraft, puede utilizarse como inicialización para dominios que requieran descomposición de objetivos en acciones discretas.
- Evaluación de robustez de agentes pequeños: útil para medir hasta qué punto un modelo de ~4B retiene habilidades de la etapa anterior tras cinco épocas de ajuste en un entorno nuevo.
- Generación de texto conversacional de propósito general con requisitos de hardware moderados, siempre que se acepte la ausencia de evaluación publicada y se valide en el dominio objetivo.
- Docencia y divulgación: ejemplo práctico de cadena de entornos BabyAI → TextCraft → SearchQA con evidencia de finalización de etapa, adecuado para explicar pipelines de SFT multi-entorno.
- Punto de partida para conversión a GGUF y despliegue local en equipos de gama media, dado el tamaño contenido del modelo (ver sección de hardware).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica literalmente que no hay evaluación completada adjunta para este checkpoint intermedio y que las puntuaciones finales de los tres entornos corresponden únicamente al modelo de la etapa 3. El autor advierte además de que las puntuaciones de checkpoints secuenciales posteriores o de modelos independientes no deben atribuirse a este repositorio.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| BabyAI / TextCraft / SearchQA | no disponible para este checkpoint |

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (4.411.424.256) y del tamaño del repositorio (17,7 GB). No hay mediciones de latencia ni throughput publicadas.

- Pesos en fp32: aproximadamente 17,7 GB solo de pesos, lo que exige del orden de 20-24 GB de VRAM para inferencia con contexto corto. Encaja en A100 40 GB, H100 80 GB o configuraciones multi-GPU con sharding.
- Pesos en bf16: aproximadamente 8,8 GB de pesos, en torno a 11-14 GB de VRAM con caché KV para contextos moderados. Cabe en RTX 3090, RTX 4080, RTX 4090, A10G y L40S.
- Cuantización de 8 bits: aproximadamente 4,4 GB de pesos; viable en GPU consumer de 8-12 GB.
- Cuantización de 4 bits (GGUF Q4 o equivalente): aproximadamente 2,5-3 GB de pesos; viable en GPU de 6-8 GB con contextos reducidos, y en CPU con llama.cpp.
- Cabe en GPU consumer: sí, en formato bf16 o cuantizado. En fp32 el margen sobre una RTX 4090 de 24 GB es muy ajustado.
- Opciones de despliegue: `transformers` (soporte declarado en la librería), text-generation-inference (etiqueta `text-generation-inference` presente), endpoints compatibles (etiqueta `endpoints_compatible`), y vLLM, Ollama o llama.cpp previa conversión de formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| Este checkpoint (`Diluner/...-s2-textcraft-20260920`) | 4.411.424.256 | no disponible | no declarada | safetensors en HuggingFace | no disponibles |
| Qwen/Qwen3-4B (modelo base) | no disponible en la información suministrada | no disponible | no disponible; consultar el repositorio del modelo base | público en HuggingFace | no consultados en esta ficha |
| Alternativas de rango 3-4B (Llama-3.2-3B, Phi-4-mini, Gemma-3-4B y similares) | no disponible | no disponible | no disponible | públicas en HuggingFace | no comparados aquí |

La comparación cuantitativa no es posible con la información disponible: no hay benchmarks de este checkpoint ni se han verificado en esta ficha los datos de los modelos alternativos. La única diferencia objetiva y verificable es el procedimiento de entrenamiento secuencial multi-entorno, que no es habitual en los modelos instructivos genéricos de este rango de tamaño.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay ninguna métrica publicada para este checkpoint. No debe asumirse que hereda el rendimiento de la etapa anterior ni que anticipa el de la etapa 3.
- Licencia no declarada: la model card afirma explícitamente que no se afirma ninguna licencia y remite al modelo base y a los términos aplicables. Esto bloquea de facto cualquier uso comercial sin una revisión legal previa.
- Riesgo de alucinación: no medido ni documentado. Un modelo de 4B ajustado con SFT sobre entornos sintéticos puede generar acciones o respuestas plausibles pero inválidas en dominios fuera de distribución.
- Sesgos: no documentados. No se describe composición del dataset, filtrado ni medidas de mitigación.
- Limitaciones de idioma: no se declara ningún conjunto de idiomas soportados; el entrenamiento descrito se realizó sobre entornos en inglés (BabyAI, TextCraft, SearchQA), lo que sugiere un sesgo hacia el inglés, aunque no se confirma en la información disponible.
- Limitación de contexto: no disponible; si el uso previsto requiere ventanas largas, debe verificarse contra la configuración del repositorio antes de desplegar.
- Trazabilidad parcial: el propio autor indica que el inventario de ficheros registra nombres, tamaños y fechas de modificación, pero no es un hash de bytes de tensores vinculado a respuestas de evaluación históricas.
- Naturaleza del artefacto: es un checkpoint intermedio de una cadena concreta de un único experimento, sin replicación entre semillas. No debe citarse como evidencia de superioridad metodológica.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Uso en producción: no recomendado sin una evaluación propia en el dominio objetivo, dado que no existen datos de calidad, latencia ni estabilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Diluner/gpt54-mini-sequential-qwen3-4b-sft-s2-textcraft-20260920
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Fichero de referencias y checksums del experimento: `experiment.json` en la raíz del repositorio
- Búsqueda web realizada: los resultados obtenidos corresponden a páginas genéricas sobre historia de la inteligencia artificial y no aportan información relevante sobre este modelo. No se han localizado papers, blogs ni demos adicionales asociados a este checkpoint.
