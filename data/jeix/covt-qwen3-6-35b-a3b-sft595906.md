# jeix/CoVT-Qwen3.6-35B-A3B-SFT595906

## Resumen

CoVT-Qwen3.6-35B-A3B-SFT595906 es un ajuste fino supervisado (SFT) de una sola época sobre el modelo oficial Qwen3.6-35B-A3B, publicado por el usuario jeix en Hugging Face. El modelo parte de la arquitectura Qwen3_5Moe de Qwen, un transformer con mezcla de expertos (MoE) de 40 capas de decoder, 256 expertos enrutados por capa y enrutamiento top-8, con un total de 35.143.205.036 parámetros reales según los tensores safetensors del repositorio. El pipeline declarado es image-text-to-text, por lo que conserva la torre de visión nativa del modelo base.

La contribución diferencial del autor es la incorporación de un Physical Adapter: un módulo de atención cruzada con compuertas que lee tokens de relación causal de un codificador DINOv3 congelado y de un Physical Surprise Model (PSM) también congelado, e inyecta esa información en los estados ocultos de los tokens de imagen tras el mezclador de tokens nativo y antes de la FFN. El adaptador aporta cinco factores, cada uno con ocho tokens de 256 dimensiones por vista elegible, y su contribución es exactamente cero cuando no hay historial físico fiable. Esto convierte al modelo en un experimento de razonamiento físico y relaciones de acción sobre imágenes, más que en un asistente multimodal de propósito general.

El ajuste se realizó sobre 595.906 filas reales en una época, con 4.656 actualizaciones del optimizador y un objetivo de entropía cruzada media por muestra sobre el target del asistente. El modelo se distribuye en BF16 sin cuantizar, con licencia Apache 2.0, y está pensado para inferencia con Transformers. Su relevancia actual es acotada: es un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, con solapamiento histórico conocido entre fuentes de entrenamiento y evaluación, y sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3_5Moe): 40 capas de decoder, 256 expertos enrutados por capa, enrutamiento top-8, torre de visión nativa y Physical Adapter con atención cruzada con compuertas |
| Parametros totales | 35.143.205.036 (35,14 mil millones) |
| Parametros activos | No disponible el número exacto; el enrutamiento top-8 sobre 256 expertos implica activación parcial por token |
| Longitud de contexto | 16.384 tokens (según la receta de entrenamiento) |
| Tipos de cuantizacion | No se distribuye cuantización; pesos en BF16. No disponible soporte oficial de GGUF/AWQ/GPTQ |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), con código de modelo de custom_code y configuración independiente |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea la arquitectura Qwen3_5Moe en Transformers: 40 capas de decoder con 256 expertos enrutados por capa y enrutamiento top-8, más un codificador de visión nativo. El ajuste preserva la cabeza de lenguaje y el embedding de tokens sin atar (untied), ambos almacenados de forma independiente y sin omitirse ni atarse durante la carga. El repositorio contiene 1.416 tensores serializados, de los cuales 390 pertenecen al Physical Adapter, con un total de 70.286.410.072 bytes de tensor.

El Physical Adapter se sitúa en 30 capas (índices 0 a 29), con anchura 256 y 8 cabezas. Lee tokens de relación causal de un DINOv3 congelado y de un Physical Surprise Model (PSM) congelado, ambos en modo eval, y actualiza los estados ocultos de los tokens de imagen mediante atención cruzada con compuertas, después del mezclador de tokens nativo y antes de la FFN. La aritmética de atención, normalización y compuertas del adaptador se ejecuta explícitamente en FP32. No se usó LoRA: se entrenaron la visión nativa, el modelo de lenguaje, la cabeza LM y el adaptador.

La receta de entrenamiento es explícita: 595.906 filas reales, 1 época, 4.656 actualizaciones del optimizador, 128 ejemplos globales por actualización, microbatch por dispositivo de 16 con acumulación 1, sharding de estado del optimizador ZeRO etapa 2 y objetivo de entropía cruzada media por muestra sobre el target del asistente. Los learning rates iniciales fueron 1e-5 para lenguaje, 1e-5 para visión y 1e-4 para el adaptador, con AdamW (betas 0,9 y 0,999, epsilon 1e-8), weight decay 0,05, clipping de gradiente 1,0, schedule coseno y warmup del 3%. El presupuesto por imagen fue de 151.200 píxeles y la semilla 20261020, con un lote final de 66 filas reales sin duplicar. La mezcla de datos incluye 268.321 filas de CoT, 100.000 de estado original, 100.000 de relation-QA de Action Genome, 6.260 de BEHAVE, 14.376 de Hoi!, 20.185 human-centric, 85.051 de RoboCasa, 424 de EgoOops-train y 1.289 de WTaG-train; exactamente 255.654 filas tienen historial físico válido y 340.252 no lo tienen. El protocolo de restauración conserva el checkpoint completo de modelo, optimizador, scheduler, RNG y datos, y recalcula las actualizaciones inacabadas tras una interrupción.

## Capacidades

- Generación de texto y razonamiento multimodal image-text-to-text, con cadena de pensamiento (CoT) presente en 268.321 filas del entrenamiento.
- Razonamiento sobre relaciones físicas y de acción en imágenes, gracias al Physical Adapter que inyecta tokens de relación causal derivados de DINOv3 y del PSM.
- Preguntas y respuestas sobre relaciones de acción (relation-QA) en dominios como Action Genome, BEHAVE, Hoi!, RoboCasa, EgoOops y WTaG.
- Procesamiento de imágenes con un presupuesto de 151.200 píxeles por imagen y contexto de 16.384 tokens.
- Capacidades multilingües limitadas a inglés y chino.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada; el entrenamiento incluye filas de CoT, pero no se documenta un modo agente.
- Modo thinking explícito: no disponible como funcionalidad documentada; el autor menciona flags de plantilla de pensamiento preservados en los datos.

## Casos de uso

- Investigación en razonamiento físico sobre vídeo e imagen: el modelo permite estudiar cómo un adaptador externo congelado (DINOv3 más PSM) modula los estados de los tokens visuales, comparando su comportamiento con y sin historial físico válido, ya que el adaptador se anula exactamente cuando no hay historial fiable.
- Anotación de relaciones de acción en datasets de robótica y actividad humana: con 85.051 filas de RoboCasa y 100.000 de Action Genome en el entrenamiento, el modelo puede emplearse para predecir relaciones objeto-acción en nuevos fotogramas y acelerar el etiquetado de corpus de manipulación.
- Análisis de errores y anomalías en primera persona: las 424 filas de EgoOops-train y las 1.289 de WTaG-train lo orientan a tareas de detección de fallos en secuencias egocéntricas, donde el historial causal es relevante.
- Evaluación de SFT a gran escala como objeto de estudio: la receta completa (4.656 actualizaciones, métricas por paso en training_metrics.csv, hashes de fuentes y versiones de software) permite reproducir y auditar el proceso de ajuste en trabajos de metodología.
- Prototipado de asistentes visuales bilingües inglés-chino en entornos de investigación: el modelo conserva el tokenizador, el procesador de imagen, la plantilla de chat y la configuración de generación del base, lo que facilita integrarlo en pipelines de Transformers ya existentes.
- Generación de descripciones y respuestas sobre imágenes con contexto largo: con 16.384 tokens de ventana puede procesar conversaciones multi-turno que incluyan varias imágenes dentro del presupuesto de píxeles indicado.
- Estudio de la separación entre embedding y cabeza LM: al preservarse ambos sin atar, sirve para experimentos sobre tied versus untied embeddings en modelos MoE multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo incluye curvas de diagnóstico de entrenamiento (pérdida cada diez pasos, 465 puntos de pérdida observados sobre 4.656 actualizaciones) y advierte explícitamente que esas curvas no son precisión de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 70,3 GB en BF16, por lo que la inferencia en precisión completa requiere del orden de 70 GB o más de memoria, sin contar activaciones ni caché KV. No se dispone de estimaciones oficiales para cuantizaciones de 8 o 4 bits.
- GPU recomendadas: no hay recomendaciones oficiales del autor. Por tamaño, el modelo en BF16 excede una única RTX 4090 (24 GB) y encaja en configuraciones multi-GPU o en aceleradores de 80 GB como A100 o H100, siempre como estimación a partir del tamaño de los pesos y no como dato verificado.
- ¿Cabe en GPU de consumo? No en BF16 sobre una sola tarjeta de consumo. No se distribuyen pesos cuantizados que permitan reducirlo.
- Opciones de despliegue: Transformers con el código custom incluido en el repositorio (custom_code), con requisitos de inferencia propios y versiones de software fijadas en environment_versions.json. El ejemplo de referencia usa torch 2.11.0 y torchvision 0.26.0 con CUDA 12.9. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor excluye de la métrica de throughput los guardados de checkpoint y el trabajo de protección de recursos, pero no publica cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoVT-Qwen3.6-35B-A3B-SFT595906 | 35,14 mil millones (MoE top-8) | 16.384 tokens | Imagen-texto con Physical Adapter | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35 mil millones (MoE top-8) | No disponible en la información proporcionada | Imagen-texto | No disponible en la información proporcionada | Hugging Face |
| Alternativas de tamaño y tarea equivalentes | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento del modelo ni de alternativas comparables verificadas en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y licencia frente a su modelo base. El autor no publica métricas que permitan situarlo frente a otros ajustes multimodales.

## Limitaciones y advertencias

- El autor declara un solapamiento histórico conocido entre fuentes de entrenamiento y evaluación en esta release fija; las métricas de evaluación que se obtengan pueden estar infladas.
- Las restricciones de las fuentes originales siguen aplicando; las anotaciones de entrenamiento y los medios no se redistribuyen en el repositorio.
- El modelo solo declara inglés y chino; no hay soporte documentado de castellano ni de otros idiomas.
- El Physical Adapter depende de un historial físico fiable: sin él, su contribución es exactamente cero, de modo que en entradas sin contexto histórico el modelo se comporta como el base sin esa señal.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un SFT sobre datos de relación y CoT, es esperable en dominios fuera de la distribución de entrenamiento.
- Sesgos conocidos: no documentados por el autor; los datasets de actividad humana y robótica empleados pueden introducir sesgos de dominio y de anotación.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero las restricciones de las fuentes de datos subyacentes deben revisarse por separado antes de cualquier despliegue en producción.
- Requiere código custom (custom_code) y versiones de software fijadas; no es un modelo plug-and-play en stacks estándar sin el repositorio completo.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente.
- El contexto de 16.384 tokens y el presupuesto de 151.200 píxeles por imagen limitan el número de imágenes y la resolución manejables en una misma conversación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jeix/CoVT-Qwen3.6-35B-A3B-SFT595906
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio del autor (jeix): https://huggingface.co/jeix
