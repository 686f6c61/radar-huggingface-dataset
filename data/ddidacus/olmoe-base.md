# ddidacus/olmoe-base

## Resumen

El modelo `ddidacus/olmoe-base` es un fine-tune del modelo OLMoE-1B-7B-0125-DPO, desarrollado por el Allen Institute for AI (AI2) y subido a Hugging Face por el usuario `ddidacus`. OLMoE es una familia de modelos de lenguaje de tipo Mixture-of-Experts (MoE) completamente abierta, con 6.9 mil millones de parámetros totales pero solo 1.3 mil millones activos por token, lo que permite un rendimiento competitivo con un coste computacional reducido. Este repositorio en particular parte del checkpoint DPO de OLMoE, que ya ha pasado por un proceso de alineación con preferencias humanas, y lo adapta adicionalmente mediante fine-tuning, aunque no se especifican los datos concretos de ese ajuste.

La relevancia de este modelo radica en su carácter totalmente abierto: código, datos de entrenamiento, logs y checkpoints intermedios están disponibles bajo licencia Apache 2.0, lo que lo convierte en una opción atractiva para investigación y despliegues en producción donde la transparencia y el control sobre el modelo son prioritarios. Al ser un MoE con solo 1.3B parámetros activos, ofrece una latencia de inferencia baja y puede ejecutarse en hardware de consumo, manteniendo una calidad aceptable en tareas de razonamiento y generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Transformer |
| Parametros totales | 6.919.161.856 (6.9B) |
| Parametros activos | 1.3B (aprox.) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OLMoE emplea una arquitectura Transformer con capas de mezcla de expertos (MoE). Cada token activa solo 1.3B de los 6.9B parámetros totales, lo que reduce significativamente el coste de inferencia. El modelo base fue preentrenado desde cero sobre 5 billones de tokens del dataset Dolma, y posteriormente se sometió a un proceso de adaptación que incluye supervisión fina (SFT), optimización de preferencias directas (DPO) y refuerzo con verificación de recompensa (RLVR) según la documentación del modelo Instruct. Este repositorio concreto parte del checkpoint DPO y añade un fine-tuning adicional, aunque no se detallan los datos ni el procedimiento exacto en la información disponible.

La innovación principal de OLMoE radica en su apertura total: todos los datos, código de entrenamiento, logs y checkpoints intermedios se publican, lo que permite reproducir completamente el proceso y facilita la investigación en interpretabilidad y alineación. El modelo utiliza un tokenizador BPE y soporta el formato de chat de OLMo con plantillas integradas.

## Capacidades

- Generación de texto en inglés con razonamiento de sentido común y conocimiento factual.
- Razonamiento matemático básico y resolución de problemas aritméticos, gracias al entrenamiento con datasets como GSM8K.
- Seguimiento de instrucciones y respuestas en formato conversacional multi-turno.
- Capacidad de ejecutar tareas de few-shot y zero-shot en benchmarks como MMLU, TruthfulQA y BigBenchHard.
- Soporte de tool calling y function calling, aunque no está confirmado explícitamente en la documentación disponible.
- No se ha verificado soporte para vision, audio u otras modalidades; el modelo es exclusivamente de texto.

## Casos de uso

- Asistente conversacional en inglés para atención al cliente: su bajo número de parámetros activos permite desplegarlo en entornos con recursos limitados, manteniendo respuestas coherentes en diálogos multi-turno.
- Generación de código en entornos de desarrollo: aunque no está específicamente entrenado para código, puede asistir en tareas de autocompletado y explicación de fragmentos simples.
- Investigación académica en alineación de modelos: al ser completamente abierto, es ideal para estudiar los efectos del fine-tuning DPO y RLVR en modelos MoE.
- Prototipado rápido de aplicaciones NLP en inglés: su tamaño reducido y licencia permisiva permiten integrarlo en pipelines de prueba sin costes de licencia.
- Educación y demostraciones: sirve como ejemplo didáctico de arquitecturas MoE y de entrenamiento con preferencias humanas.
- Sistemas de generación de respuestas en dominios específicos tras un fine-tuning adicional, dado que el checkpoint base es un buen punto de partida para adaptación a tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el modelo `ddidacus/olmoe-base` en la información disponible. El README de la model card incluye una tabla de rendimiento para el modelo `OLMoE-1B-7B-0125-Instruct`, que es una versión posterior con entrenamiento RLVR, pero no para este checkpoint base. A modo de referencia, el Instruct logra una media de 45.62 en el conjunto de benchmarks de OLMoE (MMLU CoT: 55.08, TruthfulQA: 50.56, BigBenchHard CoT: 38.61, DROP: 47.87, MATH Flex: 21.41). Sin embargo, estos datos no son extrapolables directamente a este modelo sin confirmación.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6.9B parámetros totales y 1.3B activos, en FP16 se necesitan aproximadamente 14 GB de VRAM, aunque con cuantización a 8 bits se reduce a ~7 GB y a 4 bits a ~3.5 GB.
- GPU recomendadas: una RTX 3090/4090 (24 GB) puede ejecutar el modelo en FP16 sin problemas; GPUs con 8-12 GB (RTX 3060, RTX 3070, etc.) pueden usar cuantización 8 bits.
- Cabe en GPUs de consumo con cuantización, siendo viable en tarjetas de 8 GB o más.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama y TGI.
- Latencia y throughput: no se dispone de mediciones oficiales, pero al ser MoE con solo 1.3B activos, la latencia por token es comparable a la de un modelo de 1.3B denso, aunque con mayor huella de memoria.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| ddidacus/olmoe-base | 6.9B | 1.3B | no disponible | Apache 2.0 | Fine-tune del DPO de OLMoE |
| allenai/OLMoE-1B-7B-0125-DPO | 6.9B | 1.3B | no disponible | Apache 2.0 | Checkpoint DPO original |
| Qwen2.5-1.5B | 1.5B | 1.5B | 32K | Apache 2.0 | Modelo denso más pequeño, sin MoE |
| Llama-3.2-1B | 1B | 1B | 128K | Llama 3.2 Community | Modelo denso, contexto largo |

La comparativa se basa en características generales, ya que no hay datos de rendimiento específicos para `ddidacus/olmoe-base`. OLMoE destaca por su eficiencia computacional frente a modelos densos de tamaño similar, aunque su contexto es más limitado (no confirmado).

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena principalmente con datos en inglés y puede reflejar sesgos presentes en el dataset Dolma, como estereotipos culturales o de género.
- Riesgo de alucinacion: como todos los modelos generativos, puede producir información falsa o inventada, especialmente en dominios especializados.
- Limitaciones de contexto: no se ha especificado la longitud máxima de contexto; si se hereda del modelo base OLMoE, podría ser de 2048 tokens, lo que limita tareas que requieren ventanas largas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe atribuir adecuadamente y no se ofrece garantía.
- Entrenamiento de seguridad limitado: el modelo no ha recibido un entrenamiento de seguridad exhaustivo, por lo que puede generar contenido problemático si se le solicita explícitamente.
- Falta de documentación específica: al ser un repositorio con 0 descargas y 0 likes, no hay evidencia de validación externa ni de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/ddidacus/olmoe-base
- Modelo base OLMoE-1B-7B-0125-DPO: https://huggingface.co/allenai/OLMoE-1B-7B-0125-DPO
- Paper OLMoE: https://arxiv.org/abs/2409.02060
- Paper Tülu 3: https://arxiv.org/abs/2411.15124
- Repositorio OLMo: https://github.com/allenai/OLMo
- Repositorio OLMoE: https://github.com/allenai/OLMoE
- Demo de AI2: https://playground.allenai.org/
