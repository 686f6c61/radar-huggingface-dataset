# ceselder/probemaxxer-qwen36-27b-1M-rl

## Resumen

ProbeMaxxer — Qwen3.6-27B direction→text inverter es un adaptador LoRA de investigación en interpretabilidad, desarrollado por ceselder en el contexto del programa MATS (stream de Neel Nanda). Su función es invertir direcciones de características internas del modelo base Qwen3.6-27B en texto natural: dado un vector dirección (procedente de un sparse autoencoder o de una sonda lineal), el adaptador genera texto cuya activación residual en la capa 42 del modelo base activa fuertemente esa dirección. Es decir, convierte una dirección abstracta en un estímulo textual que la dispara.

El adaptador se entrena en dos fases: primero un SFT sobre 4 millones de ejemplos dirección→texto construidos a partir de un pool de 1 millón de clusters de sondas (derivados de 40 millones de tramos de pretraining), y después un refuerzo con Dr.GRPO, con una recompensa basada en el coseno máximo entre la activación de la capa 42 del modelo limpio y la dirección inyectada. El resultado es un artefacto capaz de producir super-estímulos: para aproximadamente 2 de cada 5 características held-out, el texto generado activa la característica más fuertemente que cualquier ejemplo natural del corpus.

Se trata de un artefacto de investigación, no de un modelo de propósito general. No está pensado para chat ni para tareas productivas, sino para estudiar representaciones internas, validar características de SAE y explorar técnicas de steering. El adaptador pesa 1,9 GB y se usa junto con el modelo base Qwen3.6-27B (arquitectura híbrida Gated DeltaNet + Gated Attention, 27B parámetros, contexto 256K extensible a 1M).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.6-27B (base híbrido Gated DeltaNet + Gated Attention) |
| Parametros totales | Adaptador LoRA r64/α16, target all-linear; tamaño del repo 1,9 GB (número exacto de parámetros no disponible) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K (heredada del base), extensible a 1M |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (el base Qwen3.6-27B es multilingüe, pero no se especifica para el adaptador) |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 con alpha 16, usando rsLoRA y aplicado a todas las capas lineales del modelo base Qwen3.6-27B. La técnica de uso consiste en inyectar una dirección normalizada (unit(direction)) en la capa 1, en la posición del token marcador " ?", con un coeficiente igual a la norma residual multiplicada por 1.0. Tras la generación, se puntúa la salida re-codificándola en el modelo base limpio y midiendo la activación de la capa 42.

El entrenamiento tiene dos fases:

- SFT: sobre un pool de 1.000.000 de clusters de sondas, construidos a partir de 40M de tramos de pretraining mediante k-means blanqueado y sondas logísticas mixtas negativas por cluster. Se generaron 4M de ejemplos dirección→texto.
- RL (Dr.GRPO): la recompensa es el coseno máximo sobre tokens entre la activación de la capa 42 del base limpio y la dirección inyectada, multiplicado por 1000. Se usó un batch grande de 64×16 = 1024 rollouts por paso, learning rate 1e-5, KL-to-SFT 0.03 y un tope de 32 tokens para evitar el truco de alargar la salida. El modelo final corresponde al paso 105.

La evaluación held-out se realizó sobre 512 características SAE (BatchTopK) no vistas durante el entrenamiento, en modo cross-basis (las características provienen de una base distinta a la usada en el entrenamiento).

## Capacidades

- Inversión de direcciones de características en texto natural: dado un vector dirección (de un SAE o de una sonda lineal), genera texto que activa fuertemente esa dirección en la capa 42 del modelo base.
- Funciona cross-basis: es decir, las características de evaluación no pertenecen a la misma base que las de entrenamiento, lo que indica cierta generalización.
- Generación de super-estímulos: para el 40% de las características held-out, el texto generado activa la característica más fuertemente que el mejor ejemplo natural del corpus (norm_act > 1).
- Control de longitud: el tope de 32 tokens y el anclaje KL garantizan que las ganancias de activación no se deben a inflación de longitud.
- No es un modelo de chat ni de propósito general: no soporta tool calling, agentes ni razonamiento multi-paso en el sentido habitual.

## Casos de uso

- Investigación en interpretabilidad de modelos: generar texto que active características específicas de un SAE para estudiar qué representa cada característica y cómo se comporta en contextos variados.
- Validación de sparse autoencoders: comprobar si una característica aprendida por un SAE es realmente significativa, viendo si el texto generado por el inversor la activa más que los ejemplos naturales.
- Steering de modelos: inyectar direcciones en la capa 1 para guiar la generación hacia comportamientos o temas concretos, usando el inversor como herramienta para encontrar el texto que materializa una dirección.
- Generación de ejemplos de activación para entrenamiento de clasificadores: producir muestras positivas sintéticas para características concretas, útiles para entrenar sondas o clasificadores de interpretabilidad.
- Benchmarking de técnicas de interpretabilidad: comparar la calidad de diferentes SAE o métodos de extracción de direcciones usando la fuerza de activación del texto generado como métrica objetiva.
- Exploración de representaciones internas: mapear el espacio de características del modelo base generando texto que activa direcciones aleatorias, para descubrir qué conceptos están codificados.

## Benchmarks y rendimiento

La model card del autor reporta la siguiente evaluación held-out (best-of-16, 512 características SAE held-out, cross-basis):

| Metrica | SFT | RL (step_105) |
|---|---|---|
| SAE strength (mediana norm_act = act / top corpus example) | 0.451 | 0.779 |
| Beats top corpus example (norm_act > 1) | 32.8% | 40.0% (205/512) |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no está diseñado para tareas de lenguaje general.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 1,9 GB, pero para usarlo es necesario cargar el modelo base Qwen3.6-27B completo.
- El modelo base en FP16 ocupa aproximadamente 54 GB de VRAM, por lo que se necesitan GPUs de al menos 48 GB (A100 48GB, H100 80GB) o usar cuantización (por ejemplo, GGUF o bitsandbytes) para reducir el requisito a ~16-24 GB.
- No se han publicado requisitos específicos de hardware ni datos de latencia o throughput para este adaptador.
- Para el uso típico (inyección de dirección y generación de texto corto de hasta 32 tokens), el coste de inferencia es similar al del modelo base con una sola pasada adicional de scoring en la capa 42.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con transformers + peft, o integrarlo en frameworks como vLLM si se convierte a un formato compatible. No se menciona compatibilidad con llama.cpp u Ollama.

## Comparativa con modelos similares

No hay disponibles modelos directamente comparables, ya que se trata de un artefacto de investigación específico para inversión de direcciones en el contexto de interpretabilidad. La única comparación publicada es contra su propia versión SFT (sin RL), que muestra una mejora clara en fuerza de activación (0.779 vs 0.451) y en porcentaje de super-estímulos (40% vs 32.8%). No se conocen otros adaptadores que realicen exactamente esta tarea sobre Qwen3.6-27B.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de chat de propósito general. No debe usarse en producción para tareas de lenguaje natural.
- La licencia no está disponible, por lo que se desconocen las restricciones de uso comercial o de redistribución.
- Al estar basado en Qwen3.6-27B, hereda los sesgos y limitaciones del modelo base, aunque no se han evaluado específicamente para este adaptador.
- La generación de texto no está optimizada para coherencia o factualidad, sino para activar direcciones; puede producir texto incoherente o sin sentido semántico.
- El uso requiere conocimiento técnico avanzado: hooks de forward, normalización de direcciones, y comprensión de la arquitectura interna del modelo.
- No se ha evaluado el rendimiento con contextos largos ni con entradas multimodales (el base soporta imagen y video, pero el adaptador no se ha probado en esos dominios).
- El número de parámetros exactos del adaptador no se ha publicado, solo el tamaño del repositorio (1,9 GB).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ceselder/probemaxxer-qwen36-27b-1M-rl
- Variante sin sufijo "1M" (posiblemente versión anterior): https://huggingface.co/ceselder/probemaxxer-qwen36-27b-rl
- Modelo base Qwen3.6-27B (referencia): https://huggingface.co/Qwen/Qwen3.6-27B
- Guía sobre Qwen 3.6-27B (arquitectura y benchmarks): https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
- Guía comparativa de Qwen 3.6 (dense vs MoE): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
