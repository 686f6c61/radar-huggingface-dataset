# keras/mistral_small_3.2_24b_instruct_2506_en

## Resumen

Mistral Small 3.2 24B Instruct es un modelo multimodal de tipo decoder-only publicado originalmente por Mistral AI y empaquetado por el equipo de Keras para su uso con KerasHub bajo el nombre de arquitectura Mistral3. Combina un decodificador de texto Mistral de 24.000 millones de parametros y 40 capas con un codificador de vision de estilo Pixtral, de modo que un unico checkpoint acepta texto e imagenes como entrada y genera texto. Esta version concreta (`mistral_small_3.2_24b_instruct_2506_en`) es la variante instruction-tuned de junio de 2025, una actualizacion menor de la 3.1 centrada en mejorar el seguimiento de instrucciones, reducir las generaciones repetitivas y reforzar la plantilla de function calling.

El modelo maneja una ventana de contexto de 128.000 tokens, emplea el tokenizador Tekken con un vocabulario de 131.000 entradas y cubre decenas de idiomas, entre ellos ingles, frances, aleman, espanol, portugues, italiano, japones, coreano, ruso, chino, arabe e hindi. Esta pensado para agentes conversacionales, function calling y salida JSON, comprension de documentos largos, razonamiento sobre codigo y matematicas, y comprension visual.

Su relevancia actual radica en que ofrece capacidades multimodales y de contexto largo en un tamano de 24B que puede ejecutarse en hardware de una sola GPU de gama alta, con pesos liberados bajo licencia Apache 2.0. El checkpoint de este repositorio es una conversion a KerasHub (formato Keras) del modelo original de Mistral AI, no un entrenamiento nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (decodificador Mistral + codificador de vision Pixtral) |
| Parametros totales | 24,01B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (la model card recomienda cargar en bfloat16) |
| Idiomas soportados | Ingles, frances, aleman, espanol, portugues, italiano, japones, coreano, ruso, chino, arabe, hindi y "decenas" mas |
| Licencia | Apache 2.0 (pesos); codigo Keras bajo Apache 2.0 |
| Formato de pesos | Formato nativo de KerasHub (no se especifica safetensors/GGUF); repo de 48,9 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con 40 capas y 24.010 millones de parametros en el decodificador de texto, acoplado a un codificador de vision de estilo Pixtral que permite entrada de imagenes. El modelo usa el tokenizador Tekken con vocabulario de 131.000 tokens y soporta ventanas de hasta 128.000 tokens. La variante 3.2 es una actualizacion menor sobre la 3.1 que mejora el seguimiento de instrucciones, reduce la repeticion en las generaciones y refuerza la plantilla de function calling.

No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO especificas. La model card remite a la model card oficial de Mistral AI para benchmarks, fuentes de datos y casos de uso previstos. El checkpoint de este repositorio es una conversion de los pesos originales al formato de KerasHub, no un reentrenamiento.

## Capacidades

- Generacion de texto y razonamiento general en modo conversacional.
- Comprension de imagenes: acepta una o varias imagenes por prompt mediante marcadores `[IMG]`, con el codificador Pixtral.
- Function calling y salida estructurada en JSON, con plantilla reforzada en la version 3.2.
- Razonamiento sobre codigo y matematicas.
- Comprension de documentos largos gracias a la ventana de 128.000 tokens.
- Capacidades multilingues en decenas de idiomas (incluido el espanol).
- Soporte de agentes y razonamiento multi-paso mediante instrucciones y tool calling.
- Generacion por lotes (batched prompts) y muestreo configurable (greedy, top-k, temperatura).
- Ajuste fino sobre un solo lote mediante `fit()` en KerasHub.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial extenso gracias a sus 128.000 tokens de contexto, y devolver respuestas estructuradas en JSON para integracion con sistemas de ticketing.
- Agentes con function calling: la plantilla de function calling reforzada en 3.2 permite construir agentes que invocan APIs externas y encadenan varias llamadas en un flujo multi-paso.
- Analisis de documentos largos: informes, contratos o manuales de decenas de miles de tokens pueden procesarse en una sola pasada sin troceado, extrayendo resumenes o campos concretos.
- Comprension de documentos escaneados o capturas: al aceptar imagenes, puede extraer informacion de facturas, formularios o diagramas junto con el texto circundante.
- Asistencia a programacion: generacion y explicacion de codigo, con soporte de razonamiento matematico para tareas de analisis o transformacion de datos.
- Busqueda y respuesta aumentada multilingue: al cubrir espanol, ingles, frances, aleman y otros idiomas, sirve para sistemas RAG que atienden a usuarios en varios idiomas con un unico modelo.
- Prototipado e investigacion en Keras: el checkpoint de KerasHub permite cargar el backbone y el tokenizador directamente, ajustar con `fit()` y experimentar con muestreadores personalizados en JAX, PyTorch o TensorFlow.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la model card oficial de Mistral AI (`mistralai/Mistral-Small-3.1-24B-Instruct-2503`) para los datos de evaluacion.

## Requisitos de hardware

- VRAM estimada: en bfloat16, los 24,01B parametros ocupan aproximadamente 48 GB solo en pesos, mas memoria para el codificador de vision y la cache KV; se recomienda al menos 60-80 GB de VRAM para inferencia comoda con contexto largo.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU para contexto completo de 128k.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en bfloat16; requeriria cuantizacion a 8 o 4 bits, no documentada en la informacion disponible.
- Opciones de despliegue: KerasHub con backends JAX, PyTorch o TensorFlow; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral Small 3.2 24B Instruct (este) | 24,01B | 128k | Si (Pixtral) | Apache 2.0 | KerasHub |
| Mistral Small 3.1 24B Instruct | 24,01B | 128k | Si (Pixtral) | Apache 2.0 | Hugging Face (Mistral AI) |
| Mistral Small 3.1 24B Base | 24,01B | 128k | Si (Pixtral) | Apache 2.0 | KerasHub / Hugging Face |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas factuales o de razonamiento complejo.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; los sesgos del dataset de entrenamiento original pueden persistir.
- Idioma: aunque cubre decenas de idiomas, el rendimiento puede ser desigual fuera del ingles y los idiomas principales; no hay evaluaciones por idioma publicadas.
- Contexto: aunque soporta 128k tokens, el rendimiento en contextos muy largos puede degradarse y el coste de memoria de la cache KV es elevado.
- Licencia: los pesos son Apache 2.0, lo que permite uso comercial, pero debe verificarse la licencia del checkpoint original de Mistral AI y de cualquier dependencia.
- Formato: el checkpoint esta en formato KerasHub, no en safetensors ni GGUF; la conversion a otros formatos para despliegue en vLLM o llama.cpp no esta documentada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es una conversion reciente, sin validacion comunitaria extensa.

## Enlaces

- Hugging Face: https://huggingface.co/keras/mistral_small_3.2_24b_instruct_2506_en
- Model card oficial de Mistral AI: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503
- Anuncio de Mistral Small 3.1: https://mistral.ai/news/mistral-small-3-1
- Mistral AI: https://mistral.ai/
- Keras: https://keras.io/
- Keras 3 (multi-backend): https://keras.io/keras_3/
- Guia de inicio de KerasHub: https://keras.io/guides/keras_hub/getting_started/
- Guia de publicacion de modelos KerasHub: https://keras.io/guides/keras_hub/upload/
- Repositorio KerasHub: https://github.com/keras-team/keras-hub
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
