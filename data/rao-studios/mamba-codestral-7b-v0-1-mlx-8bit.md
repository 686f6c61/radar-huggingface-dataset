# rao-studios/Mamba-Codestral-7B-v0.1-mlx-8bit

## Resumen

Mamba-Codestral-7B-v0.1-mlx-8bit es una conversión a formato MLX con cuantización de 8 bits del modelo mistralai/Mamba-Codestral-7B-v0.1, el modelo de código de Mistral AI construido sobre la arquitectura Mamba2. La conversión la firma Rao Studios y está pensada para ejecutar el modelo en hardware Apple Silicon mediante la librería mlx-lm. El modelo base combina la eficiencia de los modelos de espacio de estados (SSM) con un entrenamiento orientado a generación de código.

El modelo conserva la arquitectura Mamba2 de 64 capas, con un tamaño de estado de 128 y 8 grupos, y un total de 7.285.379.072 parámetros en su forma original. Tras la cuantización a 8 bits con grupo de 64, los pesos ocupan 7,7 GB en safetensors y el repositorio declara 2.051.960.832 parámetros en el recuento de tensores cuantizados. Al ser un modelo de estado recurrente, no tiene límite posicional de contexto en el sentido clásico de los transformers.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de código de 7B en un Mac con memoria unificada razonable; por otro, la model card documenta un problema conocido de la versión 0.32.2 de mlx-lm con la normalización agrupada de Mamba2 que provoca tokens basura en la salida si no se aplica un parche. Es un dato crítico para cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mamba2 (64 capas, hidden size 4.096, 8 grupos, state size 128) |
| Parametros totales | 7.285.379.072 (modelo base); 2.051.960.832 en safetensors cuantizados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | estado recurrente, sin límite posicional (no se especifica ventana efectiva) |
| Tipos de cuantizacion | 8 bits, group size 64, affine (8,504 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 839 tensores, 7,7 GB |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura Mamba2, un modelo de espacio de estados selectivo con 64 capas, tamaño oculto de 4.096, 8 grupos y tamaño de estado de 128. A diferencia de un transformer, Mamba2 procesa la secuencia mediante una recurrencia con estado, lo que elimina la necesidad de atención cuadrática y permite en teoría contextos muy largos con coste lineal. Cada bloque Mamba2 termina con una normalización RMS con compuerta (gated RMS norm) que, en la implementación original de mamba-ssm, se aplica por grupo (8 grupos de 1.024 canales con esta configuración).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. La model card de esta conversión solo documenta el proceso de cuantización: los tres shards en bfloat16 del modelo base (commit `4f086c08c1e0f07bdc50ca25125dbbf7475d21da`) se convirtieron con `mlx_lm convert -q --q-bits 8 --q-group-size 64` usando mlx-lm 0.32.2 y mlx 0.32.4 el 22 de noviembre de 2026. Se modificaron dos elementos respecto a la salida del conversor: el campo `time_step_limit` en `config.json` se reescribió como `[0.0, Infinity]` para compatibilidad con otros cargadores MLX (Frigate, versiones antiguas de mlx-lm), y se añadió el texto de la licencia Apache 2.0.

## Capacidades

- Generación de texto y código: el modelo está entrenado específicamente para tareas de programación, con énfasis en la escritura de funciones y fragmentos de código en lenguajes como Swift, Python y otros.
- Razonamiento sobre código: la model card demuestra respuestas correctas a peticiones como "Write a binary search in Swift" y "Write a Python function that merges two sorted lists".
- Generación autoregresiva con caché: la verificación confirma que la decodificación token a token con caché produce el mismo resultado que una pasada completa de la secuencia.
- Sin plantilla de chat: el modelo base no incluye chat template, por lo que el formateo de instrucciones debe hacerse manualmente con el framing de Mistral (`[INST] ... [/INST]`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas soportados no se declaran.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Generación de código en local sobre Apple Silicon: el modelo se ejecuta con mlx-lm en un Mac con memoria unificada, lo que permite autocompletar funciones y escribir fragmentos de código sin enviar datos a la nube. Es adecuado por su tamaño de 7,7 GB y su velocidad de unos 51 tokens por segundo en un M4 Max.
- Asistente de programación integrado en el editor: con el framing `[INST] ... [/INST]` se puede usar para responder consultas puntuales de código (por ejemplo, escribir una búsqueda binaria o fusionar listas ordenadas) en herramientas locales tipo plugin.
- Prototipado rápido de scripts: para desarrolladores que trabajan en Mac y necesitan generar código boilerplate en Swift, Python u otros lenguajes sin depender de APIs externas.
- Evaluación de arquitecturas SSM en investigación: sirve como banco de pruebas para estudiar el comportamiento de Mamba2 cuantizado frente a transformers equivalentes en tareas de código.
- Despliegue en entornos con memoria limitada: la cuantización de 8 bits con 8,1 GB de pico de memoria permite ejecutarlo en equipos donde un modelo de 7B en bfloat16 no cabría con holgura.
- Generación de código en pipelines de CI/CD: no recomendado sin antes aplicar el parche de normalización agrupada, ya que sin él la salida puede contener tokens basura o llaves sin cerrar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han comprobado los benchmarks publicados del modelo ni contextos largos.

Las únicas métricas de rendimiento documentadas son las de la verificación realizada el 22 de noviembre de 2026 en un M4 Max:

| Metrica | Valor |
|---|---|
| Coincidencia de token top-1 con referencia float32 (con parche) | 211 de 211 posiciones |
| Divergencia KL media (con parche) | 0,0001 nats |
| Consistencia caché vs. pasada completa | sin discrepancias en 78 posiciones |
| Velocidad de decodificación | ~51 tokens/s |
| Memoria pico | 8,1 GB |

## Requisitos de hardware

- VRAM/memoria estimada: 8,1 GB de pico en la verificación con mlx-lm 0.32.2; el repositorio pesa 7,7 GB en safetensors.
- GPU recomendadas: Apple Silicon (la verificación se hizo en un M4 Max). El modelo está en formato MLX, por lo que no está pensado para GPU NVIDIA directamente.
- ¿Cabe en consumer GPU? No en el sentido de GPU NVIDIA con CUDA; sí en equipos Apple Silicon con memoria unificada suficiente (el pico medido es de 8,1 GB).
- Opciones de despliegue: mlx-lm (versión 0.32.2 o superior con el parche de normalización agrupada), Frigate y otros cargadores MLX que lean el formato `time_step_limit` reescrito. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~51 tokens por segundo en un M4 Max con mlx-lm 0.32.2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| rao-studios/Mamba-Codestral-7B-v0.1-mlx-8bit | 7.285.379.072 (base) | estado recurrente, sin límite posicional | apache-2.0 | safetensors MLX 8-bit | Conversión comunitaria; requiere parche en mlx-lm 0.32.2 |
| mistralai/Mamba-Codestral-7B-v0.1 | 7.285.379.072 | estado recurrente, sin límite posicional | apache-2.0 | safetensors bfloat16 | Modelo original de Mistral AI; sin cuantizar |
| Codestral (modelo de código de Mistral, familia transformer) | no disponible en la información | no disponible | no disponible | no disponible | Alternativa de la misma familia orientada a código, pero sin datos en la información proporcionada |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Bug de normalización en mlx-lm 0.32.2: la implementación normaliza la gated RMS norm sobre los 8.192 canales en lugar de por grupo (8 grupos de 1.024). Sin el parche documentado, el modelo inserta tokens basura en las respuestas y omite llaves de cierre. El problema es del cargador, no de los pesos cuantizados.
- Sin plantilla de chat: el modelo base no incluye chat template, por lo que hay que construir el prompt manualmente con `[INST] ... [/INST]`; un formateo incorrecto degrada la calidad de las respuestas.
- Idiomas no declarados: no se especifican los idiomas soportados, lo que impide garantizar un comportamiento multilingüe fiable.
- Contextos largos no verificados: la model card indica explícitamente que no se han comprobado contextos largos, pese a que la arquitectura recurrente lo permitiría en teoría.
- Benchmarks no verificados: no se han comprobado los benchmarks publicados del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo de código, puede producir APIs o funciones inexistentes.
- Sesgos: no documentados en la información proporcionada.
- Licencia: Apache 2.0, que permite uso comercial, pero la model card señala que el repositorio base no incluye archivo de licencia y que el texto se ha añadido en esta conversión.
- Compatibilidad limitada: el formato MLX restringe el despliegue a ecosistema Apple; no hay soporte documentado para CUDA, vLLM o llama.cpp.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una conversión reciente y poco validada por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rao-studios/Mamba-Codestral-7B-v0.1-mlx-8bit
- Modelo base: https://huggingface.co/mistralai/Mamba-Codestral-7B-v0.1
- Implementación de referencia Mamba: https://github.com/state-spaces/mamba
- Librería mlx-lm: no se proporciona enlace directo en la información disponible
- Paper de Mamba2: no disponible en la información proporcionada
- Blog de Mistral AI sobre Codestral Mamba: no disponible en la información proporcionada
