# singhabhishekkk/apprentice-4b-banking77

## Resumen

Apprentice 4B, Banking77 intents es un adaptador LoRA para Qwen3.5-4B (cuantizado a 4 bits en formato MLX) afinado sobre el split de entrenamiento del conjunto de datos Banking77, acompañado de una cabeza logística que lee la intención directamente del estado oculto del modelo en el último token del prompt, en la capa 32, sin necesidad de decodificar texto. Lo desarrolla singhabhishekkk mediante la herramienta Apprentice (runapprentice.com), ejecutada en un Mac con Apple Silicon el 5 de noviembre de 2026.

El modelo resuelve un problema muy concreto: la clasificación de intenciones en atención al cliente bancaria sobre las 77 categorías de Banking77. Su relevancia radica en que demuestra que un adaptador LoRA pequeño, entrenado en dos épocas sobre un portátil, más una cabeza logística lineal sobre el estado oculto, alcanza el 93,6 % de exactitud en el split de test completo (3.080 filas), situándose a 0,09 puntos del BERT-Large afinado del paper original de Banking77 (93,66) y por encima de sistemas comerciales como Claude Opus 5 con las etiquetas en el prompt (84,4).

El repositorio es de tamaño 0,0 GB (solo contiene los pesos del adaptador y la cabeza), con licencia Apache-2.0, idioma inglés y librería MLX. No incluye los pesos completos del modelo base: es un adaptador que requiere cargar Qwen/Qwen3.5-4B por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (Qwen3.5-4B) + cabeza logística lineal sobre estado oculto de la capa 32 |
| Parametros totales | No disponible (adaptador LoRA sobre un modelo base de 4B; el repo no declara el número de parámetros del adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-4B, no declarada en la model card) |
| Tipos de cuantizacion | 4 bits (MLX, variante OptiQ-4bit del modelo base) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adapters.safetensors) + NumPy npz (head_L32.npz) |

## Arquitectura y entrenamiento

El sistema consta de dos componentes. Por un lado, un adaptador LoRA MLX de 16 capas entrenado durante dos épocas, con batch 1, learning rate 1e-5 y semilla 42, sobre el modelo base `mlx-community/Qwen3.5-4B-OptiQ-4bit`. Por otro, una cabeza logística (`head_L32.npz`) con coeficientes de 77 x 2560 e intercepto de 77, que se aplica al estado oculto final del flujo residual tras la capa 32 en el último token del prompt, se estandariza con `scaler_mean`/`scaler_scale` y se pasa por softmax para obtener la distribución sobre las 77 intenciones. El fichero de la cabeza incluye un `adapter_sha256` (SHA-256 sobre los dos ficheros del adaptador) que permite a un proceso de serving rechazar una cabeza que no corresponda a su adaptador.

El adaptador se entrenó mediante la ruta local del producto (`runapprentice.local.train_mlx_local`) sobre 7.002 de las 10.003 filas de entrenamiento (el producto reserva un 30 % para autoevaluarse, obteniendo 91,1 en esas 3.001 filas). La cabeza se entrenó después sobre los estados ocultos de las 10.003 filas de entrenamiento, con el parámetro C elegido por validación cruzada de 5 pliegues únicamente sobre esas filas. No hubo búsqueda de hiperparámetros ni ingeniería de prompt. Como referencia, la misma receta con 20 ejemplos por intención produjo una respuesta generada de 81,9 y una cabeza de 90,2, lo que sugiere que la diferencia se debe principalmente al volumen de datos.

## Capacidades

- Clasificación de intenciones en 77 categorías de atención al cliente bancaria (Banking77), tanto por generación de texto como por lectura directa del estado oculto (sin decodificación).
- Clasificación sin decodificación: la cabeza logística sobre la capa 32 evita la generación autoregresiva y reduce la latencia frente a la respuesta generada.
- Calibración con cota de riesgo selectivo (Geifman y El-Yaniv 2017): el sistema puede rechazar peticiones de baja confianza; con un objetivo del 5 %, retiene entre el 88,8 % y el 90,6 % de las peticiones en tres splits con un error realizado del 2,3 % al 2,6 % entre las respuestas aceptadas.
- Verificación de integridad adaptador-cabeza mediante SHA-256 embebido en `head_L32.npz`.
- Capacidades del modelo base (Qwen3.5-4B) potencialmente disponibles, pero no evaluadas ni documentadas en esta ficha: generación de texto general, razonamiento y multilingüismo más allá del inglés.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la model card.

## Casos de uso

- Enrutamiento de tickets en atención al cliente bancaria: el sistema clasifica cada consulta entrante en una de las 77 intenciones de Banking77 y la dirige al equipo o flujo adecuado; la cabeza sobre la capa 32 permite hacerlo sin decodificación, con menor latencia que un enfoque generativo.
- Triaje con rechazo controlado: usando la cota de riesgo selectivo al 5 %, el sistema deriva a revisión humana el 9-11 % de peticiones de menor confianza, manteniendo un error inferior al 2,6 % entre las clasificaciones automáticas aceptadas.
- Clasificación en local sobre Apple Silicon: al estar en formato MLX y 4 bits, puede ejecutarse en un Mac con Apple Silicon sin GPU dedicada, lo que encaja en despliegues de borde o entornos con requisitos de privacidad de datos.
- Etiquetado y auditoría de conversaciones históricas: el adaptador puede procesar lotes de transcripciones para asignar intenciones y alimentar analítica de motivos de contacto.
- Prototipado rápido de clasificadores de dominio específico: la receta (LoRA de dos épocas más cabeza logística sobre estado oculto) es reproducible desde el repositorio público de benchmark y sirve como plantilla para otros conjuntos de etiquetas.
- Validación de pipelines de serving: el SHA-256 del adaptador permite que un servicio rechace cabezas desalineadas, útil en despliegues con versionado estricto de artefactos.
- Comparación de enfoques generativo frente a discriminativo: permite medir en producción la diferencia entre generar la etiqueta (91,2 %) y leerla del estado oculto (93,6 %).

## Benchmarks y rendimiento

Resultados sobre el split de test público completo de Banking77 (3.080 filas, 77 intenciones, exact match):

| Sistema | Exactitud | Ejecutado por |
|---|---|---|
| Cabeza sobre este adaptador, sin decodificación | 93,6 | Apprentice |
| Respuesta generada de este adaptador | 91,2 | Apprentice |
| Claude Opus 5, etiquetas en el prompt, temperatura 0 | 84,4 | OpenRouter |
| Jev 1.13, Decisions API | 81,0 | OpenRouter |

Referencia del paper original de Banking77 (Casanueva et al. 2020, tabla 3), sobre datos completos:

| Sistema | Exactitud |
|---|---|
| BERT-Large afinado | 93,66 |
| USE+ConveRT | 93,36 |
| ConveRT | 93,01 |
| USE | 92,81 |

Notas del autor: la cabeza queda 0,09 puntos por debajo del BERT-Large afinado del paper; no se reclama estado del arte. 460 filas de test (14,9 %) comparten un 80 % o más de tokens con alguna fila de entrenamiento; sin ellas, la cabeza obtiene 93,1 y la respuesta generada 90,6. Con cota de riesgo selectivo al 5 %, la cabeza retiene entre el 88,8 % y el 90,6 % de peticiones en tres splits con un error realizado del 2,3 % al 2,6 % (fichero `E3_head_sgr.md`).

## Requisitos de hardware

- Entrenado y ejecutado en un Mac con Apple Silicon mediante MLX; el modelo base se carga en cuantización 4 bits (OptiQ-4bit), lo que reduce el requisito de memoria frente a los pesos completos.
- VRAM/unified memory estimada: no disponible de forma explícita en la model card; por el tamaño del modelo base (4B en 4 bits) el requisito es modesto, pero el autor no publica cifras.
- GPU dedicadas recomendadas: no disponible; el autor no documenta despliegue en CUDA.
- Compatibilidad con GPU de consumo: plausible por el tamaño (4B en 4 bits) y el uso de MLX en Apple Silicon, pero no verificado ni documentado para RTX 4090 u otras.
- Opciones de despliegue: MLX (librería declarada en el repo); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la cabeza sin decodificación está pensada para reducir latencia frente a la generación, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exactitud en Banking77 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Apprentice 4B Banking77 (cabeza) | Adaptador sobre Qwen3.5-4B | No disponible | 93,6 | Apache-2.0 | Hugging Face (adaptador) |
| BERT-Large afinado (Casanueva et al. 2020) | ~340M | 512 tokens (BERT estándar) | 93,66 | No disponible en la información | Referencia académica |
| Claude Opus 5 (etiquetas en prompt) | No disponible | No disponible | 84,4 | Propietaria | API comercial |
| Jev 1.13 (Decisions API) | No disponible | No disponible | 81,0 | Propietaria | API comercial |

## Limitaciones y advertencias

- Ámbito restringido: solo clasifica las 77 intenciones de Banking77 en inglés; no es un modelo de propósito general ni cubre otros dominios sin reentrenamiento.
- No es estado del arte: el propio autor lo indica; papers posteriores reportan cifras superiores en este split.
- Solapamiento train/test: el 14,9 % de las filas de test comparten un 80 % o más de tokens con filas de entrenamiento; sin ellas la exactitud baja a 93,1 (cabeza) y 90,6 (generación).
- La cota de riesgo selectivo es una promesa sobre tráfico similar a las filas de calibración; debe revalidarse con filas etiquetadas nuevas cuando cambie la mezcla de peticiones.
- Dependencia del modelo base: requiere cargar Qwen3.5-4B por separado; el repo no incluye pesos completos (tamaño 0,0 GB).
- Integridad: la cabeza debe emparejarse con su adaptador mediante el SHA-256; usar una cabeza desalineada invalida los resultados.
- Idiomas: solo inglés; no se documenta rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinación: relevante solo en el modo generativo (91,2 %), no en el modo cabeza; no se documentan sesgos específicos.
- Licencia Apache-2.0 permite uso comercial, pero Banking77 es CC BY 4.0 (PolyAI) y exige atribución; verificar los términos del modelo base Qwen3.5-4B.
- Sin métricas publicadas de latencia, throughput ni requisitos de memoria; evaluar en el hardware objetivo antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/singhabhishekkk/apprentice-4b-banking77
- Repositorio de benchmark (receta reproducible): https://github.com/singhabhishekkk/apprentice-benchmark/tree/main/tasks/intent-classification
- Apprentice: https://runapprentice.com
- Dataset Banking77: https://huggingface.co/datasets/PolyAI/banking77
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante MLX 4 bits: https://huggingface.co/mlx-community/Qwen3.5-4B-OptiQ-4bit
- Artículo de OpenRouter con resultados de Claude Opus 5 y Jev 1.13: https://openrouter.ai/blog/insights/jev-vs-claude-opus-5-classification/
