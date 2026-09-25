# sandeep123/stride-qwen3-4b-allref-correctonly-token-uniform-20260925

## Resumen

El modelo `sandeep123/stride-qwen3-4b-allref-correctonly-token-uniform-20260925` es un adaptador LoRA (PEFT) de investigación entrenado por el usuario sandeep123 sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo completo, sino un conjunto de pesos de adaptador (0,4 GB en el repositorio) que se cargan sobre el modelo base congelado, fijado al commit `cdbee75f17c01a7cc42f958dc650907174af0554`. Forma parte de una serie de experimentos denominados STRIDE orientados a mejorar el razonamiento matemático mediante aprendizaje por refuerzo (GRPO) con una bonificación de diversidad a nivel de token.

El experimento concreto se etiqueta como "token-uniform": todos los rollouts elegibles contribuyen a definir la novedad, pero únicamente los rollouts correctos reciben una bonificación uniforme por token que preserva la masa de probabilidad. El entrenamiento se realiza explícitamente en modo no-thinking (`enable_thinking=False`), lo que condiciona su uso en inferencia. Se planificaron 4 épocas sobre una partición de 2.048 preguntas, con 512 respuestas por actualización (64 preguntas x 8 rollouts), 32 actualizaciones por época y 128 actualizaciones previstas en total.

El modelo es relevante como artefacto de investigación reproducible: publica cada adaptador de actualización del optimizador (incluida la actualización cero sin entrenar), un contrato científico con hiperparámetros, manifiestos SHA256 y pares de reanudación completos con estado del optimizador Adam. No se publican resultados de evaluación ni se reclama superioridad frente a otros modelos. Está dirigido a investigadores que estudian estabilidad y dinámica de RL sobre modelos pequeños de matemáticas, no a despliegues de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso Qwen3-4B-Instruct-2507 |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 4.000 millones de parametros) |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | 8.192 tokens (limite de prompt + respuesta durante el entrenamiento); el base admite mas contexto, no confirmado para el adaptador |
| Tipos de cuantizacion | No especificados en el adaptador; depende del modelo base (bf16, int8, int4 via herramientas externas) |
| Idiomas soportados | No disponible en la model card del adaptador; hereda los idiomas del base Qwen3-4B-Instruct-2507 |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT), con `adapter_config.json`, tokenizer y chat template por checkpoint |
| Rank de LoRA | 16 |
| Alpha de LoRA | 32 |
| Dropout de LoRA | 0 |
| Modulos LoRA | q, k, v, o, gate, up, down |
| Tamano del repositorio | 0,4 GB |
| Base congelado | Qwen/Qwen3-4B-Instruct-2507 (commit cdbee75f17c01a7cc42f958dc650907174af0554) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 y alpha 32, sin dropout ni sesgo, aplicado a las proyecciones de atención (q/k/v/o) y a las proyecciones del bloque MLP (gate/up/down) del transformer denso Qwen3-4B-Instruct-2507. No modifica la arquitectura subyacente ni el tokenizer ni la plantilla de chat del modelo base. Cada carpeta `checkpoint-NNNNNN/` contiene pesos safetensors inmutables, configuración del adaptador, metadatos de entrenamiento y un manifiesto SHA256.

El entrenamiento usa GRPO con una innovación específica llamada STRIDE en su variante "token-uniform": todos los rollouts elegibles definen la métrica de novedad, pero solo los rollouts con respuesta final correcta reciben una bonificación uniforme por token que preserva la masa. El alpha de STRIDE es 1 y es independiente del alpha de LoRA (32); GRPO no emplea la bonificación de diversidad de STRIDE. La tasa de aprendizaje máxima es 2e-5, con 10 actualizaciones de calentamiento lineal (la actualización 1 usa 2e-6 y la 10 alcanza 2e-5) y después tasa constante. Se aplica un coeficiente KL de 0,01 contra la política base congelada, usando el estimador k3 original de GRPO (`expm1(log_p_ref - log_p_policy) - (log_p_ref - log_p_policy)`), sin corrección por ratio de importancia. La semilla es 42 y los datos se limitan a una partición de 2.048 preguntas de matemáticas.

El autor advierte explícitamente que no se ha establecido la eficacia de estos ajustes y que el hecho de que el repositorio exista no implica que el entrenamiento haya finalizado ni que los resultados sean mejores. La respuesta final correcta no verifica cada paso intermedio de la demostración. Se publica también el par de reanudación completo de la última época finalizada, incluido el estado del optimizador Adam y el RNG por rango, para reproducir el entrenamiento con la misma topología de cuatro aprendices.

## Capacidades

- Generación de texto y razonamiento matemático: el adaptador se entrenó específicamente sobre problemas de matemáticas, por lo que su objetivo declarado es resolverlos en modo no-thinking.
- Modo no-thinking obligatorio: el entrenamiento usa `enable_thinking=False` y la model card exige usar el mismo parámetro explícito en inferencia. No se documenta un modo thinking funcional en este adaptador.
- Razonamiento de un solo paso: la serie a la que pertenece incluye variantes "single_step"; esta variante se orienta a respuestas sin cadena de pensamiento larga.
- Capacidades heredadas del base: al ser un adaptador sobre Qwen3-4B-Instruct-2507, hereda las capacidades del modelo base (generación de código, multilingüismo, tool calling), aunque no han sido evaluadas ni confirmadas para el adaptador.
- Soporte de tool calling / function calling: no evaluado ni mencionado en la model card.
- Soporte de agentes y razonamiento multi-paso: no evaluado ni mencionado.
- Reproducibilidad: cada checkpoint incluye hashes, metadatos de contrato científico e índice de actualizaciones, lo que permite auditar la procedencia.
- Reanudación de entrenamiento: los adaptadores son portables para inferencia y admiten `is_trainable=True` para continuar el entrenamiento, con la salvedad de que la continuación exacta requiere los ficheros de estado locales.

## Casos de uso

- Investigación en RL para razonamiento matemático: el adaptador sirve como punto de comparación reproducible frente a otras variantes STRIDE del mismo autor (por ejemplo, `stride-qwen3-4b-2048-grpo-20260915` o `stride-qwen3-4b-stabilized-2048-token-uniform-20260916`) para estudiar el efecto del bonus token-uniform y del coeficiente KL.
- Estudio de estabilidad de entrenamiento: con solo 128 actualizaciones previstas y calentamiento de 10 pasos, es adecuado para analizar la dinámica temprana del optimizador y la divergencia respecto a la política base bajo la penalización KL k3.
- Reproducción de experimentos con trazabilidad estricta: los manifiestos SHA256, el índice de checkpoints y la semilla fija (42) permiten reejecutar y verificar la procedencia de cada peso.
- Evaluación de adaptadores LoRA sobre Qwen3-4B: útil para medir cuánto aporta un adaptador de bajo rango entrenado con GRPO frente al modelo base congelado, especialmente en tareas aritméticas.
- Generación de soluciones matemáticas en modo no-thinking: para entornos donde se prefiere una respuesta directa sin cadena de pensamiento y con contexto limitado a 8.192 tokens.
- Base para experimentos de ablación: el repositorio conserva todas las actualizaciones del optimizador, incluida la actualización cero, lo que facilita comparar el punto de partida sin entrenar con cada paso posterior.
- Formación y docencia: por su tamaño (4B) y su naturaleza de adaptador, es viable para demostrar flujos completos de PEFT más GRPO en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador declara explícitamente que no se realiza ninguna afirmación de evaluación ni de superioridad, y que la corrección de la respuesta final no verifica cada paso intermedio.

## Requisitos de hardware

- VRAM para inferencia: depende del modelo base Qwen3-4B-Instruct-2507 y de la cuantización elegida. Estimaciones orientativas habituales para un modelo denso de 4B: aproximadamente 9-10 GB en bf16/fp16, 5-6 GB en int8 y 3-4 GB en int4. El adaptador LoRA de rango 16 añade una sobrecarga marginal.
- Memoria de caché KV: con contexto de entrenamiento de 8.192 tokens, la caché KV aumenta la VRAM necesaria; para lotes pequeños suele ser manejable en GPUs de 12-16 GB.
- GPU recomendadas: H100, A100 y L40S para lotes grandes o contexto largo; RTX 4090 (24 GB) como opción de gama alta de consumo.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB), RTX 3090 (24 GB) e incluso en GPUs de 12 GB como la RTX 3060 con cuantización int4 o secuencias cortas (estimación no confirmada por el autor).
- Opciones de despliegue: PEFT más transformers (uso documentado en la model card), vLLM con soporte de LoRA, TGI. Para llama.cpp u Ollama sería necesario fusionar el adaptador con el base y convertirlo a GGUF, algo no documentado por el autor.
- Latencia y throughput: no disponibles.
- Entrenamiento/reanudación: la reanudación exacta requiere el estado del optimizador local, el RNG por rango y una topología de cuatro aprendices, además del entorno original.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Foco | Licencia | Estado |
|---|---|---|---|---|---|
| stride-qwen3-4b-allref-correctonly-token-uniform-20260925 | Adaptador LoRA | Qwen3-4B-Instruct-2507 | RL matematicas, token-uniform, warmup y KL | No disponible | Publicado (0 descargas, 0 likes) |
| stride-qwen3-4b-stabilized-2048-token-uniform-20260916 | Adaptador LoRA | Qwen3-4B (serie STRIDE) | RL matematicas, variante estabilizada token-uniform | No disponible | Publicado |
| stride-qwen3-4b-2048-grpo-20260915 | Adaptador LoRA | Qwen3-4B (serie STRIDE) | GRPO sobre 2048 preguntas | No disponible | Publicado |
| stride-qwen3-4b-stabilized-2048-single_step-20260916 | Adaptador LoRA | Qwen3-4B (serie STRIDE) | RL matematicas, variante single-step | No disponible | Publicado |
| Qwen3-4B-Instruct-2507 | Modelo completo denso | - | Modelo base de proposito general | No disponible en la informacion proporcionada | Publicado por Qwen |

La comparacion cuantitativa de rendimiento entre estas variantes no esta disponible: el autor no publica metricas de evaluacion en los repositorios consultados.

## Limitaciones y advertencias

- Sin evaluacion publicada: no existen benchmarks ni afirmaciones de rendimiento; no se debe asumir que el adaptador mejora al modelo base.
- Entrenamiento posiblemente incompleto: se planificaron 4 epocas y 128 actualizaciones, pero la model card advierte que las epocas planificadas no implican que el entrenamiento haya finalizado; hay que comprobar `checkpoint_index.json`.
- Modo no-thinking obligatorio: usar la plantilla por defecto que activa thinking puede degradar los resultados; es especialmente critico en Qwen3-1.7B, aunque aqui el base es 4B.
- Contexto limitado a 8.192 tokens durante el entrenamiento: no se garantiza un comportamiento correcto con secuencias mas largas, aunque el base soporte mas.
- Verificacion parcial: la respuesta final correcta no garantiza que los pasos intermedios de la demostracion sean validos.
- Licencia no disponible: la ausencia de licencia explicita impide confirmar si se permite el uso comercial; hay que tratar el artefacto como restringido hasta aclararlo.
- Idiomas no especificados: no se documenta el comportamiento multilingue del adaptador.
- Naturaleza de investigacion: es un experimento aislado con semilla fija y particion de 2.048 preguntas, no un modelo afinado para produccion.
- Sesgos: no documentados; puede heredar sesgos del modelo base Qwen3-4B-Instruct-2507.
- Riesgo de alucinacion: presente como en cualquier modelo generativo; mayor en matematicas si el problema queda fuera de la distribucion de entrenamiento.
- Reproducibilidad exacta condicionada: la reanudacion perfecta exige el estado del optimizador y la topologia de cuatro aprendices; el codigo de entrenamiento no se publica en este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/stride-qwen3-4b-allref-correctonly-token-uniform-20260925
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Variante STRIDE estabilizada (single step): https://huggingface.co/sandeep123/stride-qwen3-4b-stabilized-2048-single_step-20260916
- Variante STRIDE GRPO 2048: https://huggingface.co/sandeep123/stride-qwen3-4b-2048-grpo-20260915
- Ficha de la variante token-uniform estabilizada: https://savrn.com/models/stride-qwen3-4b-stabilized-2048-token-uniform-20260916
- Informe tecnico de Qwen3 (arXiv): https://arxiv.org/abs/2505.09388
- Informe tecnico de Qwen3 (HTML): https://arxiv.org/html/2505.09388v1
