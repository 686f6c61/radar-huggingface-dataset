# hisefath/reno-ai-intake-qwen3-0.6b

## Resumen

Reno AI intake es un ajuste fino por QLoRA del modelo Qwen3-0.6B, desarrollado por el usuario hisefath, orientado a una tarea muy concreta: convertir una peticion desordenada de reforma de bano de un propietario de Nueva York en un unico turno JSON estrictamente estructurado. El modelo rellena un detalle del trabajo solo cuando puede citar las palabras exactas del propietario, no adivina nunca un dato que afecte al precio y formula exactamente una pregunta sobre el detalle pendiente mas relevante para el coste.

Se trata de un modelo pequeno (596.049.920 parametros, segun los pesos en safetensors) derivado de Qwen3-0.6B, con licencia Apache 2.0 y publicado en formato MLX y safetensors. Su relevancia es acotada pero clara: demuestra como un modelo de menos de mil millones de parametros, entrenado con un dataset especifico y un contrato de comportamiento estricto, puede sustituir a un modelo mayor en una funcion de intake conversacional donde la precision del esquema y la resistencia a la presion del usuario importan mas que la amplitud de conocimientos.

El modelo no es un asistente general: es un componente de producto disenado para recoger contexto para un contratista, sin dar precios ni consejos de reparacion. Esta especializacion extrema, junto con el uso de salida estructurada y un conjunto de evaluacion con un 45 % de casos adversariales, lo convierten en un ejemplo util de ajuste fino orientado a comportamiento y no solo a formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-0.6B), ajuste QLoRA |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (longitud maxima de entrenamiento: 2.048 tokens) |
| Tipos de cuantizacion | Base entrenada en 4-bit y fusionada/descuantizada a 16-bit; pesos publicados en safetensors de 16 bits |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con mlx-lm y transformers) |

## Arquitectura y entrenamiento

El modelo parte de `mlx-community/Qwen3-0.6B-4bit`, una version cuantizada a 4 bits de Qwen3-0.6B, y se ajusta con QLoRA: adaptadores LoRA sobre 16 capas, tasa de aprendizaje de 1e-4, tamano de lote 1, 1,5 epocas, calculo de la perdida unicamente sobre el turno del asistente y longitud maxima de 2.048 tokens. El entrenamiento se ejecuto en un Apple M1 Pro de 16 GB con `mlx-lm` 0.32.2. Posteriormente los adaptadores se fusionaron y el modelo se descuantizo a 16 bits, de modo que el checkpoint resultante carga tanto en `mlx-lm` como en `transformers`.

El dataset de entrenamiento es `hisefath/reno-ai-bathroom-intake`, especifico para intake de reformas de bano. El autor publica ademas adaptadores intermedios para N = 50, 100, 200 y 400 ejemplos en `adapters/n*/`, junto con sus registros de entrenamiento completos, lo que permite reproducir la curva de eficiencia de datos. La innovacion principal no es arquitectonica sino de contrato de comportamiento: el modelo aprende a distinguir entre rellenar un campo con una cita literal del usuario y abstenerse cuando el dato no esta presente, incluso ante peticiones vagas, presion para que adivine o citas de precios de otros contratistas.

## Capacidades

- Generacion de texto conversacional en ingles orientada a un unico turno de intake.
- Salida JSON estricta con un esquema fijo de detalles del trabajo.
- Extraccion de informacion con cita literal: solo rellena un campo cuando puede reproducir las palabras exactas del propietario.
- Abtencion controlada: no inventa detalles que afectan al precio (tamano, nivel de acabado, sanitarios, distribucion, alicatado de pared, suelo, estado).
- Formulacion de exactamente una pregunta por turno sobre el detalle pendiente con mayor impacto en el precio.
- Resistencia a casos adversariales: usuarios vagos, presion para adivinar o menciones de precios de terceros.
- No incluye tool calling, function calling, capacidades de agente multi-paso, vision, audio ni modo de razonamiento explicito.
- Multilingue: no; solo ingles.

## Casos de uso

- Intake automatizado de reformas de bano: el modelo recibe la peticion inicial del propietario y el historial de conversacion, y devuelve un turno JSON con los campos ya confirmados y una unica pregunta. Es adecuado porque su entrenamiento esta centrado exactamente en ese contrato y evita que el sistema de gestion rellene datos no verificados.
- Cualificacion de leads para contratistas: integrado en un formulario conversacional, recoge tamano, acabados, sanitarios y distribucion antes de que un humano revise el presupuesto, reduciendo el numero de visitas tecnicas innecesarias.
- Generacion de resumenes estructurados para CRM: la salida JSON se puede mapear directamente a campos de una base de datos o de un CRM, ya que el modelo solo emite valores citados literalmente por el usuario.
- Pruebas de robustez de pipelines de intake: los adaptadores intermedios y el conjunto de evaluacion con un 45 % de casos adversariales permiten comparar el comportamiento de un modelo de 0,6 B frente a alternativas mayores en tareas de extraccion con abtencion.
- Prototipado rapido en local: al cargar en `mlx-lm` y en `transformers` y ocupar un repo de 1,2 GB, se puede ejecutar en un portatil Apple Silicon para validar el flujo de producto antes de escalar a un modelo mayor.
- Filtrado previo en un sistema multi-modelo: el modelo puede actuar como primera etapa que normaliza la peticion y formula la siguiente pregunta, dejando a un modelo mayor la redaccion final o la gestion de casos fuera de dominio.

## Benchmarks y rendimiento

El autor menciona una evaluacion sobre un conjunto de validacion retenido de 272 turnos, con un 45 % de casos adversariales, pero los resultados finales se remiten a `results/RESULTS.md` del repositorio de codigo, que no forma parte de la informacion proporcionada. No se han publicado cifras concretas de benchmarks en la informacion disponible.

| Benchmark | Resultado | Notas |
|---|---|---|
| Evaluacion propia (272 turnos, 45 % adversarial) | no disponible | Resultados en `results/RESULTS.md` del repositorio de codigo |
| MMLU, HumanEval, GSM8K u otros estandar | no disponible | No se reportan |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 0,6 B en 16 bits, los pesos ocupan aproximadamente 1,2 GB; con overhead de runtime, entre 2 y 3 GB de memoria suele ser suficiente en cuantizacion de 16 bits.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM; tambien funciona en CPU y en Apple Silicon mediante MLX.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: `mlx-lm` (entrenamiento y inferencia en Apple Silicon), `transformers` (carga directa del checkpoint de 16 bits), y previsiblemente `llama.cpp` u Ollama si se genera una cuantizacion GGUF, aunque no se documenta en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Reno AI intake (Qwen3-0.6B QLoRA) | 596 M | no disponible | Apache 2.0 | Intake estructurado de reformas de bano, ingles | Hugging Face, formato safetensors/MLX |
| Qwen3-0.6B base | 0,6 B | no disponible | Apache 2.0 | Modelo generalista multilingue | Hugging Face |
| Qwen3-1.7B | 1,7 B | no disponible | Apache 2.0 | Modelo generalista, mayor capacidad | Hugging Face |
| Modelos de extraccion estructurada de proposito general | variable | variable | variable | Extraccion JSON sin contrato de abtencion especifico | variable |

La comparacion directa con alternativas de la misma categoria es limitada: el modelo esta especializado en un dominio muy concreto y no se han publicado cifras de rendimiento que permitan contrastarlo con otros ajustes de intake. Frente a Qwen3-0.6B base, la diferencia principal es el contrato de comportamiento (abtencion y pregunta unica) y el formato de salida estricto; frente a modelos mayores, la ventaja esperada es el coste de inferencia y la predictibilidad del esquema, a costa de una cobertura de dominio muy reducida.

## Limitaciones y advertencias

- Dominio restringido: solo reformas de bano en la ciudad de Nueva York; no se ha validado para otros tipos de reforma ni otras geografias.
- Idioma: unicamente ingles; no soporta castellano ni otros idiomas.
- No proporciona precios ni consejos de reparacion; su funcion es recoger contexto para un contratista.
- Depende de un formato de prompt y de estado concretos (`intake/prompts/trained.v1.md` renderizado por `intake/prompting.py`); usarlo fuera de ese contrato puede degradar el comportamiento.
- Riesgo de alucinacion no eliminado: aunque el entrenamiento penaliza rellenar campos sin cita literal, no se han publicado tasas de error en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada; al entrenarse con datos de un dominio y una geografia concretos, puede heredar sesgos de ese corpus.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre el cumplimiento normativo en el sector de la construccion.
- Modelo de 0,6 B: capacidad limitada para conversaciones largas o fuera de dominio; la longitud de contexto no se documenta y el entrenamiento se limita a 2.048 tokens.
- Sin soporte de tool calling ni de agentes multi-paso, lo que limita su integracion en flujos que requieran acciones externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hisefath/reno-ai-intake-qwen3-0.6b
- Dataset de entrenamiento: https://huggingface.co/datasets/hisefath/reno-ai-bathroom-intake
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Version cuantizada del base usada en entrenamiento: https://huggingface.co/mlx-community/Qwen3-0.6B-4bit
- Repositorio de codigo y resultados (`results/RESULTS.md`, `docs/brainlift.md`): no disponible en la informacion proporcionada.
