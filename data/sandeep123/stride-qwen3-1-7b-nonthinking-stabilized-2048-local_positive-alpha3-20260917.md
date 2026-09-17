# sandeep123/stride-qwen3-1.7b-nonthinking-stabilized-2048-local_positive-alpha3-20260917

## Resumen

Este repositorio publica un adaptador LoRA entrenado mediante STRIDE (una variante de aprendizaje por refuerzo con crédito de diversidad de pasos local no negativo) sobre el modelo base Qwen3-1.7B. No es un modelo completo, sino un conjunto de adaptadores PEFT en safetensors que deben cargarse sobre el checkpoint congelado de Qwen3-1.7B (commit `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`). El objetivo declarado del experimento es estudiar la estabilidad del entrenamiento con RL en tareas de razonamiento matemático, con una penalización KL de 0,01 y una tasa de aprendizaje máxima de 2e-5.

El entrenamiento se realiza explícitamente en modo no thinking (`enable_thinking=False`, registrado como `thinking_mode: false` en el contrato científico). El split de entrenamiento consta de 2.048 preguntas, con un batch global de 64 preguntas y 8 rollouts por pregunta (512 respuestas por actualización), lo que da 32 actualizaciones por época y 128 actualizaciones planificadas en 4 épocas. El contexto de prompt más respuesta está limitado a 8.192 tokens y la semilla es 42.

La relevancia de esta ficha es doble: por un lado, documenta un experimento de ablación (`local_positive`, alpha=3) dentro de una serie de ejecuciones STRIDE; por otro, sirve como ejemplo de publicación de adaptadores con trazabilidad estricta (manifiestos SHA256, checkpoints inmutables por commit, estados de reanudación completos). El propio autor no reclama superioridad ni publica evaluación alguna, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Qwen3-1.7B) con adaptador LoRA sobre las proyecciones q/k/v/o y gate/up/down |
| Parámetros totales | 1.700 millones en el modelo base; adaptador LoRA de rango 16 (aproximadamente 0,65 M de parámetros adicionales, estimación derivada de la configuración publicada) |
| Longitud de contexto | 8.192 tokens (límite de prompt más respuesta durante el entrenamiento); contexto nativo del modelo base no disponible en esta información |
| Tipos de cuantización | No disponible. El repositorio solo publica pesos del adaptador en safetensors; no se ofrecen variantes GGUF, AWQ ni GPTQ propias |
| Idiomas soportados | No disponible en la información del repositorio (heredados del modelo base Qwen3-1.7B, sin detallar) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base no se incluye en el repositorio |
| Modelo base | Qwen/Qwen3-1.7B, revisión fijada `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e` |
| Configuración LoRA | rango 16, alpha 32, dropout 0, sin bias, módulos q/k/v/o y gate/up/down |
| Configuración del experimento | STRIDE alpha = 3; LR máximo 2e-5; 10 actualizaciones de warmup lineal; coeficiente KL 0,01; semilla 42 |
| Estado del entrenamiento | 4 épocas planificadas (128 actualizaciones); el avance real se reporta en `checkpoint_index.json` |
| Librería | peft |

## Arquitectura y entrenamiento

El material publicado es un adaptador LoRA, no un modelo entrenado de forma completa. La arquitectura subyacente es la del modelo base Qwen3-1.7B, un transformer decoder-only denso de 1.700 millones de parámetros. El adaptador se aplica con rango 16, alpha 32, dropout 0 y sin sesgo, sobre los módulos de proyección de atención (q, k, v, o) y de la red feed-forward (gate, up, down). No se modifica el tokenizador ni la plantilla de chat del modelo base.

El método de entrenamiento es STRIDE, descrito por el autor como crédito de diversidad de pasos local no negativo sobre tokens de razonamiento elegibles, combinado con una implementación original de GRPO con estimador k3 y sin corrección de ratio de importancia. Se aplica una penalización KL de 0,01 contra la política base congelada, agregada sobre el mismo denominador global de tokens generados que la pérdida de política. El warmup se indexa por actualizaciones absolutas completadas, de modo que una reanudación exacta no reinicia la programación, y la tasa de aprendizaje pasa de 2e-6 en la actualización 1 a 2e-5 en la actualización 10, permaneciendo constante después. El autor advierte explícitamente que estos ajustes pretenden investigar la estabilidad y que su eficacia no queda establecida por la mera existencia del repositorio.

La publicación incluye cada actualización del optimizador como carpeta inmutable `checkpoint-NNNNNN/` con pesos PEFT en safetensors, configuración del adaptador, tokenizador y plantilla de chat, metadatos de entrenamiento y manifiesto SHA256. La actualización cero (adaptador inicial sin entrenar) también se conserva. Bajo `latest-resume/` se publican el estado del optimizador Adam, las semillas RNG por rango, el adaptador correspondiente, el contrato científico original y el inventario de hashes. El código de entrenamiento no se publica en este repositorio.

## Capacidades

- Generación de texto y resolución de problemas matemáticos: el adaptador está entrenado específicamente sobre un split de 2.048 preguntas matemáticas, con el objetivo de producir cadenas de razonamiento y respuestas finales.
- Modo no thinking: el entrenamiento renderiza `enable_thinking=False`, por lo que el comportamiento esperado es de respuesta directa sin bloque de razonamiento explícito. Es obligatorio pasar ese mismo argumento en inferencia, especialmente en Qwen3-1.7B, cuya plantilla por defecto activa thinking.
- Razonamiento multi-paso dentro de una única generación: el límite de 8.192 tokens de prompt más respuesta permite cadenas de razonamiento extensas en una sola pasada.
- Compatibilidad con PEFT: el adaptador se puede cargar en modo inferencia (`is_trainable=False`) o habilitar para entrenamiento adicional (`is_trainable=True`) con un optimizador reinicializado.
- Trazabilidad y reproducibilidad: checkpoints inmutables, manifiestos SHA256, metadatos por checkpoint (learning rate, warmup, KL, tamaño de grupo de rollout, batch de prompts, época, semilla y hash del dataset) y estado de reanudación completo.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y multi-step reasoning con herramientas: no disponible.
- Capacidades multilingües: no disponible (dependen del modelo base y no se documentan en el repositorio).
- Capacidades de visión o audio: no disponibles; el pipeline es exclusivamente text-generation.

## Casos de uso

- Reproducción de un experimento de RL para razonamiento: el repositorio contiene todos los checkpoints, el contrato científico y los estados de reanudación, lo que permite repetir la ejecución con la misma semilla, los mismos hiperparámetros y la misma topología de cuatro learners, y comparar el resultado con el adaptador inicial (update cero).
- Ablación de hiperparámetros: la serie a la que pertenece este repositorio incluye distintas ejecuciones (por ejemplo, variaciones de alpha en STRIDE); este adaptador concreto corresponde a la ablación `local_positive` con alpha=3, útil para aislar el efecto de ese parámetro sobre la estabilidad del entrenamiento.
- Fine-tuning adicional sobre el adaptador: cargando el checkpoint con `is_trainable=True` se puede continuar el ajuste con un optimizador y un dataset nuevos, sin necesidad de partir del modelo base.
- Despliegue en entornos con recursos limitados: al tratarse de un adaptador sobre un modelo de 1.700 millones de parámetros, la inferencia cabe en GPU de gama de consumo con cuantización y en CPU con llama.cpp tras fusionar y convertir el adaptador.
- Generación de datos sintéticos de razonamiento matemático: el adaptador puede producir soluciones paso a paso que sirvan como material de destilación o como corpus de entrenamiento para modelos mayores, con la advertencia de que el autor indica que una respuesta final correcta no verifica cada paso intermedio.
- Investigación sobre modos de razonamiento: comparar este adaptador (entrenado en modo no thinking) con el modelo base en modo thinking permite estudiar el compromiso entre latencia, longitud de respuesta y precisión en tareas matemáticas.
- Estudio de penalizaciones KL en RL: la configuración con coeficiente KL 0,01 y estimador k3 permite analizar la deriva respecto a la política base y el equilibrio entre exploración y estabilidad.
- Publicación reproducible de adaptadores como plantilla de ingeniería: la estructura de checkpoints inmutables, manifiestos SHA256 y estados de reanudación completos sirve como referencia para equipos que necesiten auditar entrenamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio autor declara explícitamente que no se emite ninguna afirmación de evaluación ni de superioridad, y que el avance del entrenamiento se reporta únicamente por las entradas reales de `checkpoint_index.json`, de modo que las épocas planificadas no implican que el entrenamiento haya finalizado.

## Requisitos de hardware

- VRAM para el modelo base en bf16/fp16: aproximadamente 3,4 GB solo de pesos, más caché KV y activaciones; en la práctica, alrededor de 5-6 GB para contextos moderados (estimación derivada de los 1.700 millones de parámetros, no confirmada en la documentación del repositorio).
- VRAM del adaptador: el LoRA de rango 16 sobre siete módulos supone menos de 3 MB en fp16 (estimación), por lo que no altera de forma apreciable los requisitos del modelo base.
- Cuantización: con cuantización de 8 bits se estima alrededor de 2 GB de pesos; con 4 bits, alrededor de 1,1 GB. No se ofrecen cuantizaciones oficiales en el repositorio; habría que generarlas a partir del modelo base.
- GPU recomendadas: el modelo cabe con holgura en RTX 3060 12 GB, RTX 4070, RTX 4090, A100 y H100. En bf16 es viable en GPU de consumo con 8 GB o más; con cuantización de 4 bits podría ejecutarse en GPU de 6 GB (estimación).
- Despliegue: transformers combinado con peft es la vía documentada por el autor (cargando el modelo base fijado por commit y el adaptador con `PeftModel.from_pretrained`). vLLM y TGI admiten servir adaptadores LoRA. llama.cpp u Ollama requerirían fusionar el adaptador con el modelo base y convertir los pesos a GGUF.
- Latencia y throughput: no disponible.
- Almacenamiento: cada checkpoint se publica en un commit separado dentro del mismo repositorio; conviene descargar únicamente la carpeta del checkpoint deseado mediante `allow_patterns` para evitar transferencias innecesarias.

## Comparativa con modelos similares

La comparación se establece a nivel del modelo base y de alternativas públicas de tamaño similar, ya que este repositorio no publica métricas. Los datos de contexto y licencia de los modelos alternativos provienen de su documentación pública y no han sido verificados en este repositorio.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Qwen3-1.7B) | 1,7 B + LoRA rango 16 | 8.192 tokens en entrenamiento | No disponible | Público en HuggingFace, 0 descargas |
| Qwen3-1.7B (modelo base) | 1,7 B | No disponible en esta información | No disponible | Público en HuggingFace, revisión fijada |
| Alternativas densas de ~1-2 B (Llama 3.2 1B, SmolLM2 1.7B, Gemma 3 1B) | 1-2 B | No disponible | No disponible | Públicas en HuggingFace |

No se dispone de datos de rendimiento (MMLU, GSM8K, HumanEval u otros) para este adaptador ni para una comparación cuantitativa fiable con las alternativas, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Sin evaluación publicada: el autor no emite ninguna afirmación de rendimiento ni de superioridad, y no hay benchmarks disponibles.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de verificación por terceros.
- Licencia no disponible: no se especifica licencia para el adaptador ni para los pesos derivados, lo que supone un riesgo legal para cualquier uso comercial. La licencia del modelo base (Qwen3-1.7B) es independiente y debe consultarse por separado.
- Modo de inferencia obligatorio: hay que pasar `enable_thinking=False` de forma explícita en la plantilla de chat. Si se omite, Qwen3-1.7B activa thinking por defecto y el comportamiento se aleja del régimen entrenado.
- Verificación parcial de razonamiento: el autor advierte que una respuesta final correcta no verifica cada paso intermedio del razonamiento, por lo que las cadenas generadas no deben tratarse como demostraciones verificadas.
- Riesgo de alucinación: inherente a un modelo de 1,7 B entrenado sobre un dominio estrecho; previsible en matemáticas fuera de la distribución del split de 2.048 preguntas y en otros dominios.
- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base, que tampoco se detallan aquí.
- Ventana de contexto limitada: el entrenamiento usa un tope de 8.192 tokens para prompt más respuesta; no se documenta el comportamiento del adaptador más allá de ese límite.
- Estado del entrenamiento incierto: se planificaron 4 épocas y 128 actualizaciones. Los repositorios correspondientes a ejecuciones STRIDE anteriores presentan un patrón de estados completados en 32/64/96/128 actualizaciones, pero para esta ejecución concreta el avance debe verificarse en `checkpoint_index.json`.
- El checkpoint `checkpoint-000000` es el adaptador sin entrenar. Cargarlo por error daría resultados equivalentes al modelo base en modo no thinking.
- Reanudación exacta condicionada: continuar el entrenamiento original requiere los archivos locales `state_NNN` de optimizador y RNG, el manifiesto, el contrato científico y la topología de cuatro learners. Con `is_trainable=True` sin esos archivos solo es posible un entrenamiento nuevo, no una continuación exacta.
- Código de entrenamiento no publicado: el repositorio no incluye el código que generó los checkpoints, lo que limita la reproducibilidad completa.
- Idiomas: no se documenta el idioma del dataset de entrenamiento ni el soporte multilingüe del adaptador.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/sandeep123/stride-qwen3-1.7b-nonthinking-stabilized-2048-local_positive-alpha3-20260917
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Revisión fijada del modelo base: https://huggingface.co/Qwen/Qwen3-1.7B/tree/70d244cc86ccca08cf5af4e1e306ecf908b1ad5e
- Búsqueda web realizada: no se han encontrado enlaces relevantes al modelo, al método STRIDE ni a publicaciones asociadas; los resultados devueltos no guardan relación con el repositorio.
