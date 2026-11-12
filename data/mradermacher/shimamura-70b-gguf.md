# mradermacher/Shimamura-70B-GGUF

## Resumen

Shimamura-70B-GGUF es la version cuantizada en formato GGUF del modelo Shimamura-70B, desarrollado por Delta-Vector. Se trata de un modelo de lenguaje de gran tamano (70.553.706.560 parametros, aproximadamente 70,5 mil millones) afinado especificamente para roleplay, conversacion y escritura creativa en ingles. Esta publicacion corre a cargo de mradermacher, un conocido creador de cuantizaciones GGUF de la comunidad, que distribuye los pesos optimizados para inferencia local con llama.cpp y herramientas compatibles.

El modelo base se ha entrenado sobre un conjunto de datasets propios de Delta-Vector orientados a roleplay y narrativa (Orion-Misc-Data-Sharegpt-Prefixed, Orion-Basket-Weaving-Filtered, Orion-vanilla-backrooms-claude-sharegpt, Orion-Roleplay-Logs-Sharegpt-Ngram-cleaned y Orion-BlueSky-10K-Complexity). Esto lo posiciona como una alternativa especializada frente a modelos generalistas del mismo tamano, con un enfasis claro en mantener personajes coherentes, dialogos naturales y prosa creativa en conversaciones multi-turno.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 70B en hardware de consumo mediante cuantizaciones que van desde Q2_K (26,5 GB) hasta Q8_0 (75,1 GB), con variantes IQ e imatrix disponibles en un repositorio separado. Es, por tanto, un recurso practico para quienes necesitan un modelo de roleplay de gran tamano sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada del modelo base Shimamura-70B; detalles especificos no disponibles) |
| Parametros totales | 70.553.706.560 (aproximadamente 70,5 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repositorio i1-GGUF |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Shimamura-70B en la documentacion proporcionada. Por el numero de parametros y la convencion de nombres, se trata de un transformer denso de aproximadamente 70,5 mil millones de parametros, presumiblemente derivado de una familia de modelos de 70B (no se especifica cual). La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF, DPO o similares.

Lo que si se documenta es el conjunto de datos de ajuste utilizado por Delta-Vector, compuesto por cinco datasets propios centrados en roleplay, dialogos estilo ShareGPT, narrativa creativa y datos filtrados por complejidad (Orion-BlueSky-10K-Complexity). Esta combinacion sugiere un ajuste supervisado orientado a estilo conversacional y coherencia de personaje mas que a razonamiento general o codigo. La cuantizacion la realiza mradermacher con su pipeline habitual (quantize_version 2, output_tensor_quantised 1, convert_type hf), generando tanto cuantizaciones estaticas como variantes imatrix de mayor calidad en un repositorio aparte.

## Capacidades

- Generacion de texto conversacional en ingles con enfasis en coherencia de personaje y naturalidad del dialogo.
- Roleplay multi-turno: mantiene personas, estilo y contexto a lo largo de conversaciones extensas.
- Escritura creativa: narrativa, ficcion, descripciones y prosa estilizada.
- Conversacion general y chat (etiquetas chat y conversational en el repositorio).
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su despliegue en infraestructuras de inferencia estandar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Roleplay conversacional con personajes persistentes: el modelo esta ajustado sobre logs de roleplay y datasets de dialogos, por lo que puede mantener una persona concreta, su tono y su memoria conversacional durante sesiones largas, algo adecuado para plataformas de entretenimiento interactivo y novelas visuales.
- Escritura creativa asistida: generacion de ficcion, relatos y dialogos con estilo consistente; el ajuste sobre datos de creative-writing lo hace apropiado para herramientas de autoria que necesitan prosa con voz propia en lugar de texto generico.
- Chatbots de acompanamiento o entretenimiento: despliegue local de un asistente conversacional con personalidad definida, sin depender de APIs externas, gracias a las cuantizaciones Q4_K_M (42,6 GB) que caben en estaciones de trabajo con GPU de 48 GB.
- Generacion de contenido narrativo para juegos de rol de mesa o videojuegos: el modelo puede producir descripciones de escenas, respuestas de PNJ y ramificaciones narrativas coherentes con un worldbuilding previo.
- Prototipado de investigacion en alineacion y estilo conversacional: al ser un modelo de 70B con ajuste especifico sobre datasets documentados, sirve para estudiar como el fine-tuning orientado a roleplay afecta a la coherencia y la seguridad en comparacion con el modelo base.
- Fine-tuning posterior o experimentacion: los pesos GGUF permiten evaluacion rapida en local antes de invertir en el modelo completo en safetensors; util para validar si la especializacion en roleplay encaja en un producto antes de escalar.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse con llama.cpp de forma local, los datos conversacionales no salen de la infraestructura del usuario, lo que encaja en escenarios sensibles donde no se puede usar un servicio en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano del archivo GGUF y overhead de contexto):
  - Q2_K: unos 27-30 GB.
  - Q3_K_M: unos 35-38 GB.
  - IQ4_XS: unos 39-42 GB.
  - Q4_K_M: unos 43-46 GB.
  - Q5_K_M: unos 51-54 GB.
  - Q6_K: unos 59-62 GB.
  - Q8_0: unos 76-80 GB.
- GPU recomendadas: A100 80 GB o H100 para Q6_K y Q8_0; A100 40 GB, L40S 48 GB o RTX 6000 Ada para Q4_K_M e IQ4_XS; RTX 4090 24 GB solo permite cuantizaciones de 2-3 bits con contexto reducido o descarga parcial a RAM (offloading).
- Cabe en GPU de consumo: parcialmente. En una RTX 4090 de 24 GB no entra completo ni en Q2_K sin offloading; en una RTX 3090/4090 con 24 GB se puede ejecutar con capas descargadas a RAM del sistema, a costa de latencia. En configuraciones multi-GPU consumer (2x RTX 4090, 48 GB) entra Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el tag endpoints_compatible sugiere soporte en plataformas de inferencia gestionada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia cualitativa, la model card marca Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Shimamura-70B-GGUF | ~70,5B | no disponible | Roleplay, chat, escritura creativa | no disponible | GGUF |
| Modelos 70B generalistas (p. ej. Llama 3.x 70B) | ~70B | no disponible en esta ficha | Proposito general, codigo, razonamiento | depende del modelo | safetensors, GGUF |
| Modelos de roleplay de 70B de la comunidad | ~70B | no disponible | Roleplay y narrativa | variable | GGUF |

No se dispone de datos de benchmarks ni de comparativas cuantitativas publicadas para este modelo en la informacion proporcionada, por lo que la comparacion se limita a parametros, especializacion y formato.

## Limitaciones y advertencias

- Modelo especializado en ingles: la model card solo declara soporte de ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: como todo modelo generativo de 70B sin datos de evaluacion publicados, puede inventar hechos, especialmente fuera de contextos narrativos o de roleplay.
- Sesgos conocidos: no documentados en la informacion disponible; los datasets de roleplay y narrativa pueden arrastrar sesgos de estilo, genero o tematica presentes en los logs originales.
- Licencia no disponible: no se especifica licencia en el repositorio, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible consultar el repositorio del modelo base (Delta-Vector/Shimamura-70B) antes de cualquier despliegue en produccion.
- Contexto no documentado: se desconoce la longitud maxima de contexto, lo que dificulta planificar conversaciones largas o documentos extensos.
- Cuantizaciones de baja precision: Q2_K y Q3_K_S degradan la calidad de forma notable; la propia model card marca Q3_K_M como "lower quality". Para produccion se recomienda Q4_K_M o superior.
- Requisitos de hardware elevados: incluso en Q4_K_M el modelo ocupa mas de 40 GB, lo que excluye GPU de consumo individuales sin offloading.
- Fecha de actualizacion futura: el repositorio figura actualizado en 2026-11-12, lo que puede indicar cambios posteriores no reflejados en esta ficha.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Shimamura-70B-GGUF
- Modelo base: https://huggingface.co/Delta-Vector/Shimamura-70B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Shimamura-70B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Shimamura-70B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
