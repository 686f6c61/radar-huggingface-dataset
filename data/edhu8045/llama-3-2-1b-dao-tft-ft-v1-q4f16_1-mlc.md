# edhu8045/Llama-3.2-1B-dao-tft-ft-v1-q4f16_1-MLC

## Resumen

Llama-3.2-1B-dao-tft-ft-v1-q4f16_1-MLC es un ajuste fino mediante LoRA de meta-llama/Llama-3.2-1B-Instruct, publicado por el usuario edhu8045 y orientado a una tarea muy concreta: convertir el mensaje de un jugador de Teamfight Tactics (TFT) en una actualizacion JSON para la aplicacion "Dao TFT game tracker". El modelo no pretende responder preguntas sobre el juego ni generar contenido abierto; actua como un traductor de lenguaje natural a una estructura de datos validada por la propia aplicacion.

El artefacto distribuido no es el modelo en precision completa, sino una conversion a pesos MLC en cuantizacion `q4f16_1` (grupo de 4 bits con escala en float16), pensada para ejecutarse en el navegador mediante WebLLM y la libreria mlc-llm. La configuracion y el tokenizer se heredan directamente del paquete oficial mlc-ai/Llama-3.2-1B-Instruct-q4f16_1-MLC, por lo que la arquitectura subyacente es la del transformer decoder de Llama 3.2 1B.

Su relevancia es acotada pero ilustrativa: demuestra el flujo completo de adaptar un modelo pequeno de 1.000 millones de parametros a una tarea de extraccion estructurada, cuantizarlo para inferencia local en el navegador y desplegarlo sin backend. El entrenamiento se realizo sobre datos sinteticos (data v1) con el prompt propio de la aplicacion (prompt-v1), y los detalles de configuracion, version de datos y perdidas se recogen en el fichero `dao-training.json` del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.2 1B Instruct), pesos convertidos a MLC |
| Parametros totales | 1.240 millones (heredados de Llama 3.2 1B Instruct; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.2 1B Instruct soporta 128K tokens) |
| Tipos de cuantizacion | `q4f16_1` (4 bits, grupo con escala float16) |
| Idiomas soportados | no disponibles (el modelo base soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | MLC (artefacto compilado para mlc-llm / WebLLM); no se distribuyen safetensors ni GGUF |
| Tamano del repositorio | 0,7 GB |
| Libreria | mlc-llm |
| Modelo base | meta-llama/Llama-3.2-1B-Instruct |
| Metodo de ajuste | LoRA fine-tune (data v1, prompt-v1) |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.2 1B Instruct, un transformer decoder denso de aproximadamente 1.240 millones de parametros con atencion causal estandar, RoPE y normalizacion RMSNorm, sin componentes MoE ni mecanismos hibridos. Sobre esa base se aplico un ajuste fino LoRA cuyo objetivo es mapear el mensaje libre de un jugador de TFT a un objeto JSON que actualiza el estado del tracker. El entrenamiento utilizo datos sinteticos generados para la version data v1 y el prompt de la aplicacion prompt-v1, de modo que el modelo esta especializado en ese formato exacto y no en instrucciones generales.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset sintetico, el rango y alpha del adaptador LoRA, la tasa de aprendizaje ni si hubo etapas de RLHF o DPO. El autor remite a `dao-training.json` para los ajustes de entrenamiento, la version de datos y las perdidas. Tras el ajuste, el modelo se convirtio a pesos MLC en cuantizacion `q4f16_1` para su ejecucion con WebLLM, reutilizando config y tokenizer del paquete oficial de mlc-ai.

## Capacidades

- Conversion de lenguaje natural a JSON: transforma el mensaje de un jugador de TFT en una actualizacion estructurada para el tracker.
- Extraccion de entidades e intenciones acotada al dominio del juego y al esquema definido por la aplicacion.
- Ejecucion en navegador mediante WebLLM y mlc-llm, sin necesidad de backend ni GPU dedicada en servidor.
- Inferencia local de bajo coste gracias al tamano de 1B parametros y a la cuantizacion de 4 bits.
- No es un modelo de proposito general: no se documenta soporte de tool calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no documentadas para este ajuste; las del modelo base no se garantizan tras el fine-tune.

## Casos de uso

- Registro de partidas de TFT en la web: el modelo recibe el texto del jugador y devuelve el JSON de actualizacion que la app valida e incorpora al tracker, sin salir del navegador.
- Asistente de escritura rapida dentro de la aplicacion: el usuario describe en lenguaje natural lo que ha ocurrido en la partida y el modelo lo normaliza al esquema interno.
- Prototipado de interfaces voz/texto a estructura: sirve como ejemplo reproducible de pipeline LoRA + cuantizacion MLC + WebLLM para tareas de extraccion.
- Demostracion de inferencia 100 % cliente: util para aplicaciones que no quieren enviar datos del usuario a un servidor, ya que el modelo corre en el dispositivo.
- Base para futuros ajustes de dominio: al estar construido sobre Llama 3.2 1B Instruct y compartir config y tokenizer con el paquete oficial de MLC, es un punto de partida para otros esquemas JSON.
- Educacion y experimentacion: caso de estudio de fine-tune con datos sinteticos y validacion externa de salidas en un dominio cerrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0,7 GB en cuantizacion `q4f16_1`, por lo que la inferencia requiere del orden de 1 GB de memoria, ya sea VRAM o memoria unificada/CPU.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU; el modelo esta pensado para ejecutarse en el navegador mediante WebLLM.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo reciente con WebGPU, asi como en equipos con memoria unificada (Apple Silicon) y en CPU.
- Opciones de despliegue: WebLLM (navegador) y mlc-llm; no se distribuyen pesos GGUF, por lo que llama.cpp u Ollama no son aplicables directamente a este artefacto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Orientacion |
|---|---|---|---|---|---|
| edhu8045/Llama-3.2-1B-dao-tft-ft-v1-q4f16_1-MLC | ~1,24 B | no disponible | MLC `q4f16_1` | llama3.2 | Fine-tune de dominio (TFT a JSON) para WebLLM |
| meta-llama/Llama-3.2-1B-Instruct | ~1,24 B | 128K (segun ficha oficial de Meta) | safetensors | llama3.2 | Instrucciones generales |
| mlc-ai/Llama-3.2-1B-Instruct-q4f16_1-MLC | ~1,24 B | 128K (segun ficha oficial de Meta) | MLC `q4f16_1` | llama3.2 | Instrucciones generales optimizado para WebLLM |

La comparacion con otros fine-tunes de dominio no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo traduce mensajes de jugador a JSON del tracker; no es fiable para preguntas generales ni para conocimiento factual del juego.
- El autor indica explicitamente que el modelo no es fuente de hechos del juego y que la aplicacion valida cada salida; no debe usarse como oraculo sin validacion.
- Entrenado con datos sinteticos (data v1) y un unico prompt (prompt-v1): puede degradarse fuera de ese formato o con variaciones no vistas.
- Riesgo de alucinacion en los valores del JSON si la entrada es ambigua o esta fuera de distribucion.
- Idiomas soportados no documentados para este ajuste; no se garantiza el multilingue del modelo base.
- Licencia Llama 3.2 Community License: uso comercial permitido con condiciones (atribucion "Built with Llama", politica de uso aceptable y obligaciones de la licencia); revisar LICENSE.txt y USE_POLICY.md.
- Artefacto unicamente en formato MLC: no es directamente utilizable con vLLM, TGI, llama.cpp u Ollama sin reconvertir o reentrenar.
- Sin datos de benchmarks ni de latencia; no apto para decisiones de produccion sin evaluacion propia.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: proyecto personal, sin soporte ni mantenimiento garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edhu8045/Llama-3.2-1B-dao-tft-ft-v1-q4f16_1-MLC
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Paquete MLC de referencia (config y tokenizer): https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q4f16_1-MLC
- mlc-llm: https://github.com/mlc-ai/mlc-llm
- WebLLM: https://github.com/mlc-ai/web-llm
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Politica de uso de Llama 3.2: https://www.llama.com/llama3_2/use-policy/
