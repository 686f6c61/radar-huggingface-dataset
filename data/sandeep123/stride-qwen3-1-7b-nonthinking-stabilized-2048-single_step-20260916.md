# sandeep123/stride-qwen3-1.7b-nonthinking-stabilized-2048-single_step-20260916

## Resumen

Este repositorio contiene un adaptador LoRA de investigación entrenado mediante aprendizaje por refuerzo sobre el modelo base Qwen/Qwen3-1.7B. Lo publica el usuario sandeep123 como parte de una ablación denominada STRIDE, orientada a problemas matemáticos y con el modo de razonamiento explícito desactivado (nonthinking). No es un modelo completo, sino un conjunto de adaptadores PEFT que deben cargarse sobre el checkpoint fijado del modelo base (revisión `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`).

El entrenamiento planificado consta de 4 épocas sobre una partición de 2.048 preguntas, con un lote global de 64 preguntas y 8 rollouts por pregunta (512 respuestas por actualización), lo que da 32 actualizaciones por época y 128 actualizaciones planificadas. El contexto de prompt más respuesta está limitado a 8.192 tokens y la semilla aleatoria es 42. El autor no publica ninguna evaluación ni reclama superioridad frente a otros modelos; el repositorio se presenta explícitamente como un artefacto experimental.

La relevancia de esta ficha es acotada: se trata de un adaptador con cero descargas y cero valoraciones en el momento de la consulta, sin licencia declarada y sin resultados de benchmarks. Su interés reside en la metodología (GRPO con penalización KL k3, calentamiento lineal del learning rate y bonus de diversidad STRIDE) y en la trazabilidad de los checkpoints, no en un rendimiento validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) con adaptador LoRA (PEFT) |
| Parametros totales | 1.700 millones en el modelo base; adaptador LoRA de rango 16 (alfa 32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens de prompt mas respuesta durante el entrenamiento; el contexto nativo del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | no disponible (los pesos del adaptador se publican como safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el ejemplo de carga usa bfloat16 |

## Arquitectura y entrenamiento

El modelo base es Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parámetros, y sobre él se entrena un adaptador LoRA con rango 16, alfa 32, dropout 0, sin sesgos, aplicado a los módulos de proyección q/k/v/o y gate/up/down. El entrenamiento se realiza con GRPO sobre 2.048 preguntas de matemáticas, con 64 preguntas por lote global y 8 rollouts por pregunta (512 respuestas por actualización). Se planificaron 4 épocas, es decir, 32 actualizaciones por época y 128 actualizaciones en total, con el contexto de prompt más respuesta limitado a 8.192 tokens y semilla 42.

Los detalles de optimización son explícitos en la model card: learning rate máximo de 2e-5, con 10 actualizaciones de calentamiento lineal (la actualización 1 usa 2e-6 y la 10 alcanza 2e-5) y después learning rate constante; el calentamiento se indexa por actualizaciones de optimizador completadas, de modo que una reanudación exacta no lo reinicia. Se aplica un coeficiente KL de 0,01 con el estimador k3 original de GRPO, `expm1(log_p_ref - log_p_policy) - (log_p_ref - log_p_policy)`, sin corrección por ratio de importancia. La ablación STRIDE emplea un embedding de razonamiento agrupado (pooled) por respuesta elegible, con un alfa STRIDE de 1 independiente del alfa 32 de LoRA; el bono de diversidad de STRIDE no se usa en GRPO. La model card no define el acrónimo STRIDE ni detalla la composición del dataset más allá del número de preguntas.

Una particularidad relevante es que el entrenamiento renderiza explícitamente `enable_thinking=False` y lo registra como `thinking_mode: false` en el contrato científico. El tokenizador y la plantilla de chat quedan fijados y sin cambios, y el autor insiste en que en inferencia debe pasarse la misma palabra clave, dado que la plantilla por defecto de Qwen3-1.7B activa el modo de pensamiento. Cada carpeta `checkpoint-NNNNNN/` es inmutable y contiene pesos PEFT en safetensors, configuración del adaptador, tokenizador, plantilla de chat, metadatos de entrenamiento y un manifiesto SHA256; el repositorio conserva incluso la actualización cero (adaptador inicial sin entrenar). El código de entrenamiento no se publica.

## Capacidades

- Generacion de texto y resolucion de problemas matematicos: el adaptador se entrena especificamente sobre una particion de 2.048 preguntas de matematicas, con respuestas generadas por rollouts.
- Modo nonthinking: el entrenamiento desactiva el razonamiento explicito; el modelo esta pensado para responder sin cadena de pensamiento visible.
- Trazabilidad de checkpoints: cada actualizacion del optimizador se publica como un adaptador inmutable con manifiesto de hashes, lo que permite reproducir el estado en un paso concreto.
- Reanudacion de entrenamiento: `latest-resume/` incluye estado de Adam, RNG por rango, adaptador correspondiente y contrato cientifico para continuar el entrenamiento con la misma topologia de cuatro aprendices.
- Inferencia portable: los adaptadores funcionan con `is_trainable=False` mediante PEFT sobre el modelo base fijado.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible; de hecho, el modo de pensamiento se desactiva de forma explicita.
- Capacidades multilingues: no disponible.
- Vision o audio: no disponible; el pipeline declarado es exclusivamente text-generation.

## Casos de uso

- Investigacion sobre RLHF/GRPO: el adaptador permite reproducir un experimento de GRPO con penalizacion KL k3 y analizar el efecto del calentamiento lineal y del bono de diversidad STRIDE frente a configuraciones sin ellos.
- Estudio de ablaciones de modo de pensamiento: al fijar `enable_thinking=False` durante el entrenamiento, sirve para comparar el comportamiento de un modelo Qwen3-1.7B que responde sin cadena de pensamiento frente al modo thinking por defecto.
- Analisis de estabilidad de entrenamiento: la secuencia de checkpoints, con learning rate registrado por actualizacion (2e-6 en la 1, 2e-5 en la 10) y coeficiente KL, permite estudiar la evolucion de las respuestas a lo largo de las actualizaciones.
- Reproducibilidad de experimentos: los manifiestos SHA256, el contrato cientifico y `latest-resume/RESUME.md` permiten a un equipo verificar hashes y reanudar el entrenamiento en el mismo entorno.
- Evaluacion de tecnicas de RL sobre modelos pequenos: al operar sobre un modelo de 1.700 millones de parametros, es viable ejecutar los ciclos de entrenamiento y evaluacion en hardware reducido, lo que facilita pruebas comparativas de algoritmos.
- Generacion de texto en tareas matematicas de dominio acotado: siempre que se acepte la ausencia de validacion publicada, puede probarse como generador de soluciones cortas sin razonamiento explicito en entornos de experimentacion interna.
- Base para experimentos derivados: al ser un adaptador PEFT independiente, se puede reentrenar con `is_trainable=True` y un optimizador nuevo para explorar variantes del contrato cientifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que no se emite ninguna evaluacion ni reclamacion de superioridad, y que las respuestas finales correctas no verifican cada paso intermedio de la demostracion. Los resultados de busqueda web obtenidos no contienen datos de rendimiento de este modelo: corresponden a articulos divulgativos sobre la dispersion de la luz en la atmosfera y son irrelevantes para esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, alrededor de 4-5 GB contando pesos del modelo base (unos 3,4 GB), cache KV y overhead del runtime; el adaptador LoRA en si ocupa decenas de MB. En cuantizacion de 8 bits, del orden de 2,5-3 GB; en 4 bits, del orden de 1,5-2 GB. Son estimaciones derivadas del tamano del modelo, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bfloat16; NVIDIA RTX 3060 12 GB, RTX 4070, RTX 4090, A100 y H100 son opciones validas segun el margen de contexto y el lote.
- GPU de consumo: si cabe en GPU de consumo. Un modelo de 1.700 millones de parametros en bfloat16 entra en tarjetas con 8 GB o mas, y con cuantizacion de 4 bits en tarjetas de 4-6 GB.
- Opciones de despliegue: al ser un adaptador PEFT, la ruta directa es transformers mas peft, tal como muestra el ejemplo de la model card. vLLM y TGI admiten adaptadores LoRA en runtime. Para llama.cpp u Ollama seria necesario fusionar el adaptador con el modelo base y convertir los pesos a GGUF, procedimiento no documentado en este repositorio.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stride-qwen3-1.7b-nonthinking-stabilized-2048-single_step-20260916 | 1.700 millones (base) mas adaptador LoRA rango 16 | 8.192 tokens de prompt mas respuesta en entrenamiento | safetensors (PEFT) | no disponible | Publico en HuggingFace, 0 descargas, 0 valoraciones |
| Qwen/Qwen3-1.7B (modelo base) | 1.700 millones | no disponible en la informacion proporcionada | safetensors | no disponible en la informacion proporcionada | Publico en HuggingFace, revision fijada `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e` |
| Otros adaptadores LoRA sobre Qwen3-1.7B | 1.700 millones (base) mas adaptador | no disponible | safetensors (PEFT) | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor declara que no se emite ninguna reclamacion de evaluacion ni de superioridad, por lo que no existe evidencia publicada de mejora frente al modelo base.
- Verificacion de razonamiento incompleta: la propia model card advierte de que una respuesta final correcta no verifica cada paso intermedio de la demostracion.
- Entrenamiento no necesariamente finalizado: las 4 epocas y 128 actualizaciones son un plan; el numero real de checkpoints viene determinado por las entradas efectivas de `checkpoint_index.json`.
- Modo de pensamiento desactivado: el adaptador esta entrenado con `enable_thinking=False`. Si se usa la plantilla por defecto de Qwen3-1.7B, que activa thinking, se produce una discrepancia entre entrenamiento e inferencia.
- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso para uso comercial. La licencia del modelo base tambien figura como no disponible en la informacion proporcionada.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue; el entrenamiento se centra en problemas matematicos.
- Riesgo de alucinacion: inherente a un modelo de 1.700 millones de parametros entrenado sobre un conjunto acotado de 2.048 preguntas; no se aportan medidas de mitigacion.
- Sesgos: no se documenta ningun analisis de sesgos ni de composicion del dataset.
- Artefacto experimental: 0 descargas y 0 valoraciones en el momento de la consulta, publicacion mas reciente sin validacion por terceros y sin codigo de entrenamiento publicado.
- Continuidad exacta restringida: continuar el entrenamiento original exige los ficheros locales `state_NNN` de optimizador y RNG, la topologia de cuatro aprendices y el mismo contrato cientifico; ampliar el numero de epocas requiere el flag `--allow-epoch-extension`.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/sandeep123/stride-qwen3-1.7b-nonthinking-stabilized-2048-single_step-20260916
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Revision fijada del modelo base: 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados disponibles corresponden a articulos divulgativos sobre la dispersion de la luz en la atmosfera (NASA Space Place, Britannica, Mental Floss, BBC Bitesize y NOAA) y no guardan relacion con esta ficha.
