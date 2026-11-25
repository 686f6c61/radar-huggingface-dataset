# mradermacher/RPBizkit-Gemma4-v1-26B-A4B-i1-GGUF

## Resumen

RPBizkit-Gemma4-v1-26B-A4B-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo RPBizkit-Gemma4-v1-26B-A4B, publicado originalmente por el usuario RicardoEstep. El nombre indica que se trata de un modelo derivado de la familia Gemma (presumiblemente Gemma 3 o una version posterior) con 26.000 millones de parametros totales y 4.000 millones de parametros activos, lo que sugiere una arquitectura de mezcla de expertos (MoE). El sufijo "i1" en el nombre del repositorio hace referencia al metodo de cuantizacion con importance matrix (imatrix) empleado por mradermacher para preservar la calidad en tasas de compresion agresivas.

El modelo base parece ser un ajuste fino (fine-tune) orientado a rol o estilo conversacional, dado el nombre "RPBizkit", que podria aludir a roleplay o a un personaje concreto. No obstante, la model card del repositorio de cuantizaciones no aporta informacion sobre el dataset de entrenamiento, la licencia ni los idiomas soportados, por lo que muchos de los datos tecnicos de esta ficha deben marcarse como no disponibles.

La relevancia de este repositorio radica en que pone a disposicion del publico versiones GGUF de un modelo MoE de 26B en una amplia gama de cuantizaciones (desde IQ1_S hasta Q6_K), lo que permite ejecutarlo en hardware de consumo con distintas restricciones de VRAM. Al no haber descargas ni likes en el momento de la consulta, se trata de una publicacion reciente y practicamente sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en transformer (inferida del sufijo A4B y del nombre Gemma4); detalles no disponibles |
| Parametros totales | 26B (segun el nombre del modelo) |
| Parametros activos | 4B (segun el sufijo A4B del nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix); pesos originales en safetensors presumiblemente en el repo base, no confirmado |

## Arquitectura y entrenamiento

La informacion disponible no permite confirmar la arquitectura exacta del modelo base. El nombre "Gemma4-26B-A4B" sugiere una arquitectura de mezcla de expertos con 26.000 millones de parametros totales y 4.000 millones activos por token, siguiendo el patron de nomenclatura habitual en modelos MoE (por ejemplo, el esquema A4B de otras familias). El prefijo "Gemma4" apunta a un derivado de la familia Gemma de Google, aunque no se especifica si se trata de un fine-tune del modelo oficial o de un modelo entrenado desde cero con una arquitectura inspirada en ella.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La model card del repositorio de cuantizaciones se limita a listar los tipos de cuantizacion generados y a indicar que se trata de cuantizaciones con imatrix (weighted/imatrix quants) del modelo base alojado en RicardoEstep/RPBizkit-Gemma4-v1-26B-A4B.

## Capacidades

- Generacion de texto y conversacion multi-turno, presumiblemente orientada a roleplay o estilo narrativo por el nombre del modelo.
- Razonamiento y respuesta a instrucciones: no confirmado por falta de documentacion.
- Generacion de codigo: no confirmado.
- Matematicas: no confirmado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Roleplay y narrativa interactiva: el nombre del modelo sugiere un ajuste orientado a personajes o conversaciones de rol; las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutarlo en GPU de consumo manteniendo coherencia en dialogos largos.
- Prototipado de chatbots locales: al tratarse de un MoE con 4B parametros activos, la latencia por token es menor que la de un modelo denso de 26B, lo que facilita su uso en entornos de desarrollo sin GPU de datacenter.
- Experimentacion con cuantizaciones extremas: la disponibilidad de variantes IQ1_S, IQ2_XXS e IQ3_XXS permite estudiar la degradacion de calidad en regimenes de muy baja precision sobre hardware con menos de 8 GB de VRAM.
- Despliegue en estaciones de trabajo con llama.cpp u Ollama: el formato GGUF es directamente compatible con estos runners, lo que simplifica la integracion en flujos de trabajo locales.
- Evaluacion comparativa de fine-tunes comunitarios: sirve como caso de estudio para medir como se comporta un fine-tune sobre una base Gemma MoE frente al modelo original en tareas de estilo y creatividad.
- Generacion de texto creativo offline: para escritores o creadores de contenido que necesiten un modelo local sin dependencia de APIs, las cuantizaciones Q5_K_M y Q6_K ofrecen el mejor equilibrio calidad/espacio.
- Investigacion sobre cuantizacion con imatrix: permite comparar la fidelidad de las cuantizaciones i1 de mradermacher frente a cuantizaciones estandar sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano de 26B totales y la cuantizacion):
  - IQ1_S / IQ1_M / IQ2_XXS: en torno a 5-7 GB.
  - IQ2_XS / IQ2_S / IQ2_M / Q2_K / Q2_K_S: en torno a 7-9 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / Q3_K_S / Q3_K_M / Q3_K_L: en torno a 10-13 GB.
  - IQ4_NL / IQ4_XS / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: en torno a 14-16 GB.
  - Q5_K_S / Q5_K_M: en torno a 17-19 GB.
  - Q6_K: en torno a 20-22 GB.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4 y Q5; RTX 3090 o 4080 (16-24 GB) para Q4; A100 40 GB o H100 para Q6_K y para mayor velocidad de generacion.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas para cuantizaciones IQ2/IQ3, y en tarjetas de 16-24 GB para Q4 y Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput estimados: no disponibles; al ser un MoE con 4B parametros activos, se espera un throughput superior al de un modelo denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| RPBizkit-Gemma4-v1-26B-A4B (este) | 26B | 4B | no disponible | no disponible | GGUF |
| Gemma 3 27B (referencia de familia) | 27B | denso | 128K (segun documentacion oficial de Gemma 3) | Gemma Terms of Use | safetensors, GGUF |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | safetensors, GGUF |
| Qwen 2.5 32B | 32,5B | denso | 128K | Apache 2.0 | safetensors, GGUF |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado, y la correspondencia con Gemma 3 27B es una suposicion basada en el nombre, no una confirmacion.

## Limitaciones y advertencias

- No hay informacion publica sobre sesgos del modelo; al ser un fine-tune comunitario sin documentacion, el riesgo de sesgos inheridos del dataset de ajuste es desconocido.
- Riesgo de alucinacion: no evaluado; los fine-tunes de roleplay suelen priorizar estilo sobre veracidad, por lo que no se recomienda su uso en tareas factuales sin validacion.
- Limitaciones de contexto e idioma: no disponibles; no se puede confirmar la ventana de contexto ni los idiomas soportados.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe consultarse el repositorio base RicardoEstep/RPBizkit-Gemma4-v1-26B-A4B antes de cualquier despliegue en produccion.
- Las cuantizaciones de muy baja precision (IQ1_S, IQ1_M, IQ2_XXS) pueden degradar notablemente la coherencia y la calidad del texto generado.
- El repositorio no tiene descargas ni likes, por lo que no existe validacion comunitaria de la calidad de las cuantizaciones.
- Al derivar presumiblemente de Gemma, podrian aplicar los terminos de uso de Google, pero esto no esta confirmado en la informacion disponible.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/RPBizkit-Gemma4-v1-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/RicardoEstep/RPBizkit-Gemma4-v1-26B-A4B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
