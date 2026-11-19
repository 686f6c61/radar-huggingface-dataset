# dissembill/mirror-gemma-4-e4b-it-4bit

## Resumen

`dissembill/mirror-gemma-4-e4b-it-4bit` es una cuantizacion de 4 bits del modelo multimodal `google/gemma-4-E4B-it`, publicada por el usuario dissembill. El modelo base es un any-to-any (entrada y salida de texto e imagen) de la familia Gemma 4 de Google, diseñado para tareas de vision-lenguaje, generacion de texto y razonamiento multimodal. La cuantizacion se ha realizado con MLX, la libreria de Apple Machine Learning Research, y esta optimizada para ejecutarse en Apple Silicon (chips M-series).

El repositorio ocupa 6,9 GB y contiene pesos en safetensors con 7.996.156.490 parametros totales, lo que corresponde a la version de 4 bits del modelo E4B (unos 8 mil millones de parametros en el checkpoint cuantizado). La licencia declarada es Apache 2.0, aunque la model card enlaza a la licencia especifica de Gemma 4 de Google, lo que introduce una ambiguedad relevante para uso comercial.

La relevancia de esta ficha es doble: por un lado, documenta una cuantizacion comunitaria de un modelo multimodal reciente de Google, pensada para inferencia local en Mac; por otro lado, advierte de que la informacion disponible es muy limitada (sin benchmarks, sin idiomas declarados, sin datos de entrenamiento del modelo base en el repositorio) y de que se trata de un mirror de un modelo de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any, image-text-to-text); detalles no disponibles |
| Parametros totales | 7.996.156.490 (checkpoint cuantizado a 4 bits) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `google/gemma-4-E4B-it` en la informacion proporcionada. La model card del repositorio cuantizado solo indica que se trata de una version de 4 bits del modelo original, cuantizada con MLX mediante `mlx_vlm`, y optimizada para Apple Silicon. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

La innovacion tecnica documentada es la propia cuantizacion: el uso de MLX permite ejecutar el modelo en hardware Apple con pesos de 4 bits, reduciendo el uso de memoria y facilitando la inferencia local. El pipeline declarado es `any-to-any`, lo que implica soporte de entrada y salida multimodal (texto e imagen), aunque no se detallan los modulos de vision ni el mecanismo de fusion de modalidades. Cualquier afirmacion adicional sobre atencion lineal, decodificacion especulativa o arquitectura hibrida seria especulativa y no esta respaldada por la informacion disponible.

## Capacidades

- Generacion de texto y conversacion multi-turno (modelo `-it`, ajustado para instrucciones).
- Procesamiento de imagen y texto de forma conjunta (pipeline `any-to-any`, `image-text-to-text`).
- Respuesta a instrucciones y tareas de razonamiento general, segun el comportamiento esperado del modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.
- Ejecucion local en Apple Silicon gracias a la cuantizacion MLX de 4 bits.

## Casos de uso

- Inferencia local en Mac para prototipado multimodal: el modelo puede cargarse con MLX en equipos Apple Silicon y usarse para experimentar con tareas de imagen-texto sin depender de la nube, gracias a sus pesos de 4 bits y 6,9 GB de repositorio.
- Asistente de descripcion de imagenes en escritorio: integrable en aplicaciones macOS que necesiten generar descripciones o responder preguntas sobre capturas de pantalla, fotografias o diagramas.
- Procesamiento de documentos con imagenes embebidas: el pipeline any-to-any permite extraer informacion de PDFs escaneados o capturas y generar resumenes en texto.
- Chat multimodal en local para entornos con requisitos de privacidad: al ejecutarse en hardware propio, los datos no salen del equipo, lo que resulta adecuado para prototipos con informacion sensible.
- Evaluacion comparativa de cuantizaciones: util para investigadores que quieran medir la perdida de calidad de una cuantizacion MLX de 4 bits frente al modelo original en tareas de vision-lenguaje.
- Educacion y demos: permite mostrar en un portatil Apple el funcionamiento de un modelo multimodal de ~8B parametros sin infraestructura GPU dedicada.
- Desarrollo de plugins para LM Studio: al estar etiquetado como modelo de la comunidad de LM Studio, sirve para probar flujos de trabajo dentro de esa aplicacion en macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al tratarse de pesos de 4 bits con 7.996.156.490 parametros, el peso del modelo ronda los 4 GB; el repositorio completo ocupa 6,9 GB. Se recomienda al menos 8 GB de memoria unificada libre para inferencia basica y 16 GB o mas para contexto largo o procesamiento de imagenes.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) por el uso de MLX. No esta pensado para GPUs NVIDIA o AMD en su formato actual.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada suficiente; no se garantiza su funcionamiento en GPUs de consumo NVIDIA con este formato MLX.
- Opciones de despliegue: MLX mediante `mlx_vlm`; LM Studio (modelo destacado en su programa de comunidad); teoricamente compatible con `transformers` segun la libreria declarada, aunque los pesos estan en formato MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| dissembill/mirror-gemma-4-e4b-it-4bit | 7.996.156.490 (4-bit) | no disponible | any-to-any | Apache 2.0 | safetensors (MLX) |
| google/gemma-4-E4B-it (modelo base) | no disponible | no disponible | any-to-any | licencia Gemma 4 | no disponible |
| Otras cuantizaciones de Gemma 4 E4B | no disponible | no disponible | any-to-any | segun autor | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Informacion muy limitada: no se declaran idiomas, contexto, benchmarks ni detalles de entrenamiento, lo que impide evaluar su calidad de forma rigurosa.
- Ambiguedad de licencia: el repositorio declara Apache 2.0, pero enlaza a la licencia Gemma 4 de Google; conviene verificar los terminos reales antes de un uso comercial.
- Es un mirror de un modelo de terceros: el autor del repositorio no es el creador del modelo base ni garantiza su integridad; la model card incluye un descargo de responsabilidad de LM Studio.
- Cuantizacion de 4 bits: puede producir degradacion en tareas de razonamiento complejo, matematicas o comprension fina de imagenes respecto al modelo original.
- Riesgo de alucinacion: inherente a los modelos generativos multimodales; no hay evaluaciones publicadas que lo cuantifiquen.
- Dependencia de hardware Apple: el formato MLX limita su uso a equipos Apple Silicon; no es directamente desplegable en GPUs NVIDIA con vLLM o TGI sin conversion.
- Sin soporte comunitario demostrado: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los problemas se hayan detectado y corregido.
- Sin datos sobre sesgos: no se han publicado evaluaciones de sesgo ni de seguridad para esta cuantizacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dissembill/mirror-gemma-4-e4b-it-4bit
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- MLX (Apple Machine Learning Research): https://github.com/ml-explore/mlx
- mlx_vlm: https://github.com/Blaizzy/mlx-vlm
- LM Studio: https://lmstudio.ai
- Discord de LM Studio: https://discord.gg/aPQfnNkxGC
