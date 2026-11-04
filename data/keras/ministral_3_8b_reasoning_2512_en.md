# keras/ministral_3_8b_reasoning_2512_en

## Resumen

Ministral 3 8B Reasoning es la variante de razonamiento del modelo de 8B de la familia Ministral 3, publicada por Mistral AI y distribuida en este repositorio por el equipo de Keras como preset de KerasHub. La familia Ministral 3 esta disenada para despliegue en el borde y en entornos de bajos recursos, y se ofrece en tres tamanos (3B, 8B y 14B). Cada tamano combina un decodificador de texto (3.4B, 8.4B o 13.5B parametros) con un codificador de vision Pixtral de 0.4B parametros, de modo que los modelos aceptan imagenes ademas de texto.

Esta variante concreta, de 8B, corresponde al checkpoint de razonamiento, entrenado para pensar paso a paso en tareas de matematicas, programacion y STEM. Soporta una ventana de contexto de 256k tokens, system prompts, function calling nativo y salida JSON, lo que la orienta a casos de uso agenticos. El modelo se sirve en KerasHub mediante la arquitectura Mistral3 con embeddings rotatorios escalados con YaRN.

La relevancia actual radica en que ofrece capacidades multimodales y de razonamiento de nivel 8B con una ventana de contexto muy amplia, en un formato integrado en el ecosistema Keras (carga, generacion, ajuste fino y tokenizador desde una unica API).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral3) con codificador de vision Pixtral; embeddings rotatorios escalados con YaRN |
| Parametros totales | 8.4B en el decodificador de texto + 0.4B en el codificador de vision |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe, entre docenas de idiomas |
| Licencia | Apache 2.0 (pesos); codigo Keras bajo Apache 2.0 |
| Formato de pesos | no disponible (preset de KerasHub; el repositorio ocupa 18.7 GB) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only (Mistral3) para el texto, acoplada a un codificador de vision Pixtral de 0.4B parametros que permite entrada multimodal. Emplea embeddings rotatorios escalados con YaRN, lo que habilita la ventana de contexto de 256k tokens. El checkpoint es la variante de razonamiento, entrenada especificamente para generar cadenas de razonamiento paso a paso orientadas a matematicas, codigo y STEM.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron tecnicas de RLHF o DPO. La model card remite a la model card original de Mistral AI para benchmarks, fuentes de datos y casos de uso previstos.

## Capacidades

- Generacion de texto y razonamiento paso a paso (thinking) orientado a matematicas, programacion y STEM.
- Procesamiento multimodal: acepta imagenes junto con texto mediante marcadores `[IMG]` en el prompt.
- Soporte de system prompts.
- Function calling nativo (tool calling).
- Salida en formato JSON, util para integracion en pipelines y agentes.
- Capacidades multilingues en docenas de idiomas, incluidos ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe.
- Ventana de contexto de 256k tokens para tareas de contexto largo.
- Integracion con KerasHub: carga del preset, generacion con samplers personalizados (greedy, Top-K), ajuste fino con `fit()` y acceso directo al backbone y al tokenizador.

## Casos de uso

- Razonamiento matematico y STEM: el checkpoint de razonamiento genera cadenas de pensamiento paso a paso, adecuado para resolver problemas de matematicas y fisica con trazabilidad del razonamiento.
- Generacion y asistencia de codigo: con soporte de function calling y salida JSON, puede integrarse en herramientas de autocompletado, revision o generacion de tests en pipelines de desarrollo.
- Agentes multi-paso: la combinacion de tool calling nativo, salida JSON y contexto de 256k tokens permite construir agentes que encadenan llamadas a herramientas manteniendo el estado de la conversacion.
- Analisis de documentos e imagenes: al aceptar imagenes junto a texto, sirve para tareas de comprension de documentos escaneados, capturas o diagramas combinados con instrucciones textuales.
- Atencion al cliente multilingue: cubre docenas de idiomas y permite conversaciones multi-turno con contexto largo, lo que reduce la perdida de informacion en dialogos extensos.
- Procesamiento de contexto largo: con 256k tokens puede resumir, extraer informacion o responder preguntas sobre documentos extensos sin fragmentacion.
- Ajuste fino especifico de dominio: al estar disponible como preset de KerasHub, permite `fit()` sobre datos propios para adaptar el modelo a tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 8.4B parametros en bfloat16 requiere del orden de 17 GB solo para los pesos, a lo que se suma el codificador de vision de 0.4B y la memoria para el contexto (que crece con la ventana utilizada).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por el tamano en bfloat16 no cabria en GPUs de consumo con menos de 24 GB sin cuantizacion, aunque no se dispone de datos oficiales de cuantizacion.
- Opciones de despliegue: KerasHub (carga via `Mistral3CausalLM.from_preset`, con soporte de URI `hf://`). No se especifican otros motores (vLLM, llama.cpp, Ollama, TGI) en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral 3 8B Reasoning (este) | 8.4B texto + 0.4B vision | 256k | Si | Apache 2.0 | KerasHub / Hugging Face |
| Ministral 3 3B (variante de la familia) | 3.4B texto + 0.4B vision | 256k | Si | Apache 2.0 | KerasHub / Hugging Face |
| Ministral 3 14B (variante de la familia) | 13.5B texto + 0.4B vision | 256k | Si | Apache 2.0 | KerasHub / Hugging Face |

No se dispone de datos de benchmarks ni de comparaciones con modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado en la informacion disponible datos sobre sesgos conocidos del modelo.
- Riesgo de alucinacion inherente a los modelos generativos; no se documenta mitigacion especifica.
- Aunque soporta docenas de idiomas, el nivel de calidad por idioma no esta cuantificado en la informacion disponible.
- La licencia de los pesos es Apache 2.0, lo que permite uso comercial; el codigo Keras tambien es Apache 2.0. El campo de licencia del repositorio figura como no disponible, por lo que conviene verificar la model card original de Mistral AI.
- No se dispone de informacion sobre cuantizaciones soportadas ni sobre el rendimiento en produccion, lo que limita la planificacion de despliegues con requisitos estrictos de memoria.
- El modelo esta pensado para despliegue en el borde y bajos recursos, pero el contexto de 256k tokens puede elevar notablemente los requisitos de memoria en inferencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/keras/ministral_3_8b_reasoning_2512_en
- Mistral AI: https://mistral.ai/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia del codigo KerasHub: https://github.com/keras-team/keras-hub/blob/master/LICENSE
- Cuaderno de inicio rapido de Ministral 3: enlace no disponible (referenciado en la model card sin URL completa)
