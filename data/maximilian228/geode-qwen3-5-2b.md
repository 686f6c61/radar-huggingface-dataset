# Maximilian228/Geode-Qwen3.5-2B

## Resumen

Geode-Qwen3.5-2B es un paquete de pesos cuantizados del modelo Qwen3.5-2B, publicado por el desarrollador Maximilian228 para su uso dentro de Geode, una aplicacion Android que ejecuta modelos de lenguaje integramente en el dispositivo, sin nube ni cuenta de usuario. El modelo base es un transformer denso de 2.000 millones de parametros de la familia Qwen3.5, con el mismo diseno hibrido Gated DeltaNet mas atencion y el mismo vocabulario que el modelo principal de Geode (Qwen3.6-35B-A3B), pero con un coste computacional y de memoria mucho menor.

El paquete incluye el codificador de vision, por lo que el pipeline declarado es image-text-to-text: el modelo entiende imagenes ademas de texto. La cuantizacion se ha realizado con GPTQ capa a capa, dejando las matrices en 4 bits, los embeddings y el codificador de vision en 8 bits y la capa MTP (multi-token prediction) en 4 bits, con un tamano total de 2,0 GB (1,86 GiB).

Su relevancia radica en que demuestra un flujo de despliegue de IA generativa multimodal en telefonos de gama media, con un formato propio de pesos (no GGUF) y optimizaciones especificas para NPU de Qualcomm. No obstante, el repositorio no registra descargas ni interacciones y la documentacion tecnica disponible es la de la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido Gated DeltaNet + atencion (misma familia que Qwen3.6-35B-A3B) |
| Parametros totales | 2B (segun el modelo base Qwen3.5-2B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4 bits en todas las matrices, embeddings 8 bits, codificador de vision 8 bits, capa MTP 4 bits |
| Idiomas soportados | 30 idiomas segun la evaluacion de calidad; lista concreta no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Formato propio de Geode (`geode.json` describe los ficheros); no es GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B emplea una arquitectura hibrida que combina capas Gated DeltaNet (una variante de atencion lineal con estado recurrente) con capas de atencion clasica, un diseno compartido con el modelo mayor Qwen3.6-35B-A3B de la misma familia. El paquete incluye ademas una capa MTP (multi-token prediction) que se usa para decodificacion especulativa en el dispositivo: el modelo genera borradores que luego se verifican, de modo que la respuesta final es la misma que sin MTP.

El proceso de cuantizacion es GPTQ capa a capa, donde cada capa se calibra sobre las salidas que producen las capas ya cuantizadas anteriores. El conjunto de calibracion incluye texto de chat, codigo, ingles y ucraniano, conversaciones de agente con llamadas a herramientas, el propio razonamiento del modelo y texto en 30 idiomas. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base ni sobre si se aplicaron tecnicas de RLHF o DPO en esta derivacion.

## Capacidades

- Generacion de texto y razonamiento en un modelo de 2B, con calidad inferior al modelo de 35B de la misma familia.
- Comprension de imagenes mediante el codificador de vision incluido en el paquete (pipeline image-text-to-text); la lectura de texto pequeno en imagenes es peor que en el modelo de 35B.
- Uso de herramientas y function calling, con calibracion especifica para sesiones de agente y tool use.
- Razonamiento multi-paso y sesiones de agente, aunque con mayor divergencia respecto al modelo BF16 en este tipo de tareas (KL 0,158).
- Soporte multilingue: la evaluacion cubre 30 idiomas.
- Decodificacion especulativa mediante la capa MTP incluida.
- Ejecucion integra en el dispositivo, sin conexion a la nube.

## Casos de uso

- Asistente personal offline en Android: el modelo se ejecuta dentro de la app Geode sin cuenta ni conexion, adecuado para consultas de texto y razonamiento cotidiano en un telefono con 4-6 GB de RAM.
- Descripcion y analisis de imagenes en el dispositivo: gracias al codificador de vision integrado, se pueden procesar capturas o fotos localmente, util en contextos de privacidad donde no se quiere enviar imagenes a un servidor.
- Agente local con llamadas a herramientas: la calibracion incluye conversaciones de agente con tool calls, lo que permite encadenar acciones multi-paso dentro de la app (por ejemplo, consultar datos locales y componer respuestas).
- Asistencia de escritura y resumen de documentos: el paquete mantiene buena fidelidad en documentos (KL 0,038, top-1 87,5%) y en codigo (KL 0,023, top-1 93,6%), adecuado para resumir notas o revisar fragmentos de codigo en movilidad.
- Traduccion y uso multilingue ligero: con cobertura de 30 idiomas y una divergencia contenida en lenguas distintas del ingles (KL 0,034, top-1 92,5%), sirve para traducciones y respuestas en varios idiomas sin conexion.
- Prototipado de aplicaciones moviles con IA: desarrolladores que quieran integrar un modelo multimodal en una app Android pueden usar este paquete como referencia de despliegue con NPU en Snapdragon 8 Gen 2 y posteriores.
- Educacion y consultas sin conectividad: en entornos sin red (zonas rurales, aviones, aulas), el modelo ofrece respuestas de texto e imagen con latencia de decodificacion de unos 36 tokens/s en hardware de gama alta.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). En su lugar proporciona metricas de fidelidad de la cuantizacion frente al modelo BF16: divergencia KL y coincidencia del token top-1, por tipo de texto.

| Tipo de texto | KL vs BF16 | Top-1 |
|---|---|---|
| Codigo | 0,023 | 93,6% |
| Documentos | 0,038 | 87,5% |
| Ingles | 0,042 | 87,0% |
| Otras lenguas | 0,034 | 92,5% |
| Sesion de agente | 0,158 | 89,9% |
| Uso de herramientas | 0,055 | 88,9% |
| Razonamiento | 0,035 | 90,3% |
| 30 idiomas | 0,058 | 90,6% |
| Global | 0,055 | 90,0% |

Rendimiento medido en un Snapdragon 8 Elite (RedMagic 10 Pro):

| Metrica | Valor |
|---|---|
| Decodificacion | ~36 tokens/s (~54 con borradores MTP) |
| Prompt de 2.500 tokens en CPU | ~140 tokens/s |
| Prompt de 2.500 tokens con NPU | ~460 tokens/s |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el paquete ocupa 2,0 GB (1,86 GiB); la model card indica que funciona en cualquier telefono de 64 bits con 4-6 GB de RAM o mas.
- Procesador: Android 11 o superior, ARM de 64 bits con instrucciones de producto escalar (ARMv8.2).
- Aceleracion: en Snapdragon 8 Gen 2 y posteriores la NPU procesa los prompts; en el resto se usa la CPU.
- GPU de escritorio: no disponible; el paquete esta pensado para movil y no se documenta su uso en GPU de PC.
- Despliegue: exclusivamente mediante la app Geode (Google Play beta); el formato propio no carga en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~36 tokens/s de decodificacion y ~460 tokens/s de prefill con NPU en Snapdragon 8 Elite.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Geode-Qwen3.5-2B | 2B denso | no disponible | Apache-2.0 | Formato Geode, solo app Android | Multimodal, cuantizado GPTQ 4/8 bits, 2,0 GB |
| Qwen3.5-2B (base) | 2B denso | no disponible | Apache-2.0 | Safetensors, ecosistema estandar | Modelo original sin cuantizar; referencia BF16 |
| Qwen3.6-35B-A3B (Geode) | 35B totales, MoE | no disponible | no disponible | Formato Geode, app Android | Modelo principal de Geode; mas capaz pero mucho mas pesado |

No se dispone de datos de benchmarks que permitan comparar el rendimiento absoluto con otras alternativas de 2B.

## Limitaciones y advertencias

- Modelo de 2B: la propia model card advierte que sabe y razona mucho menos que el modelo de 35B de la misma familia.
- Mayor degradacion en sesiones de agente (KL 0,158 frente a 0,055 global), por lo que las tareas multi-paso son el punto mas debil de la cuantizacion.
- Lectura de texto pequeno en imagenes peor que en el modelo de 35B.
- Formato propietario: no es GGUF y no se puede cargar en otros runtimes, lo que limita la portabilidad y el despliegue fuera de Android.
- Requiere Android 11+ y ARMv8.2; no funciona en telefonos antiguos ni en arquitecturas x86.
- Riesgo de alucinacion: la model card indica explicitamente que las respuestas provienen de un modelo de IA y pueden ser erroneas.
- Sesgos conocidos: no disponibles.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso con documentos largos.
- Licencia Apache-2.0, permisiva para uso comercial, pero el modelo base y sus condiciones deben verificarse en el repositorio de Qwen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Maximilian228/Geode-Qwen3.5-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Modelo principal de Geode: https://huggingface.co/Maximilian228/Geode-Qwen3.6-35B-A3B
- Aplicacion Geode: https://geode.tifu.xyz
