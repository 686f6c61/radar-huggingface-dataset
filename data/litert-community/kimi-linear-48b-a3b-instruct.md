# litert-community/Kimi-Linear-48B-A3B-Instruct

## Resumen

Kimi-Linear-48B-A3B-Instruct es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado originalmente por Moonshot AI, publicado bajo licencia MIT. Esta ficha concreta corresponde a la conversion del modelo original al formato LiteRT-LM, realizada por la comunidad litert-community, orientada a la ejecucion en CPU mediante el runtime LiteRT-LM de Google. El modelo combina una arquitectura hibrida de atencion con capas Kimi Delta Attention (KDA) y capas MLA, junto con una capa de expertos de 256 expertos y 8 activos por token.

El modelo resuelve el problema de ejecutar un MoE de gran tamano (48B parametros totales, 3B activos) en hardware de escritorio sin GPU dedicada, mediante una cuantizacion mixta que mantiene los expertos en int8 por canal y el resto de pesos en fp32. Su relevancia actual radica en que demuestra la viabilidad de inferir arquitecturas de atencion lineal eficientes en CPU con el runtime LiteRT-LM, aunque con limitaciones importantes de contexto (4096 tokens) y de madurez del ecosistema.

La version convertida ocupa 55,29 GB y esta pensada para equipos con abundante memoria RAM, como un Apple M4 Max con 128 GB. No es un modelo para movil ni para GPU de consumo convencional, y requiere compilar el runtime desde el codigo fuente porque las versiones publicadas en PyPI (0.19.1 y 0.19.2) no soportan la activacion SiLU de los expertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE con 20 capas Kimi Delta Attention (KDA) y 7 capas MLA, 27 capas en total |
| Parametros totales | 48B (aproximado, segun nombre del modelo) |
| Parametros activos | 3B (aproximado, segun nombre del modelo); 8 expertos activos de 256 mas 1 experto compartido |
| Longitud de contexto | 4096 tokens en este archivo (el modelo original soporta hasta 1M) |
| Tipos de cuantizacion | Mixta: expertos en int8 por canal, resto en fp32 |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo original de Moonshot AI emplea una arquitectura hibrida que combina 20 capas de Kimi Delta Attention (un mecanismo de atencion lineal con estado recurrente) con 7 capas de Multi-head Latent Attention (MLA), sobre un total de 27 capas. La componente MoE consta de 256 expertos con 8 activos por token y un experto compartido, lo que da lugar a 3B parametros activos sobre 48B totales. La innovacion principal es el uso de atencion lineal expresiva (KDA) para reducir el coste computacional y de memoria frente a la atencion completa, manteniendo calidad mediante las capas MLA intercaladas.

Los detalles concretos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada para esta ficha; la model card del repositorio de conversion no los incluye. La conversion a LiteRT-LM preserva las 27 capas del modelo fuente y aplica una cuantizacion mixta: los pesos de los expertos se almacenan en int8 por canal, mientras que el resto de la red permanece en fp32. En tiempo de ejecucion, el kernel `moe` de la CPU convierte los pesos int8 de vuelta a fp32 antes de usarlos, por lo que la cuantizacion int8 no aporta aceleracion real en este backend.

## Capacidades

- Generacion de texto en ingles con razonamiento y respuesta a preguntas de tipo instruct.
- Conversacion multi-turno (verificada con una conversacion de 3 turnos en la evaluacion de precision).
- Razonamiento aritmetico basico (el ejemplo de la model card usa "17 + 25").
- Soporte de tool calling: no verificado en este archivo segun la model card.
- Capacidades de agente y razonamiento multi-paso: no verificadas en esta conversion.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo sin GPU: el archivo de 55,29 GB puede ejecutarse en CPU con XNNPACK usando 12 hilos, lo que permite desplegar un MoE de 48B en equipos con suficiente RAM (por ejemplo, Apple M4 Max de 128 GB) sin depender de CUDA.
- Prototipado y evaluacion de arquitecturas de atencion lineal: util para investigadores que quieran estudiar el comportamiento de Kimi Delta Attention en un runtime alternativo al de Transformers, comparando salidas con los pesos bf16 originales.
- Pruebas de integracion de LiteRT-LM en pipelines de CI: el modelo sirve como caso de prueba de gran tamano para validar kernels `moe`, cuantizacion mixta y gestion de estado recurrente en el runtime.
- Generacion de texto en ingles para tareas de asistente conversacional de contexto corto: con 4096 tokens de ventana, es adecuado para dialogos breves o consultas puntuales donde no se requiera memoria larga.
- Validacion de precision de cuantizacion: la model card reporta 12/12 respuestas con el mismo veredicto que Transformers en bf16, lo que lo hace util como referencia para estudiar el impacto de la cuantizacion mixta en tareas de razonamiento.
- Educacion y experimentacion: permite a desarrolladores sin acceso a GPUs de gama alta experimentar con un MoE de gran escala y con arquitecturas hibridas de atencion en hardware de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta metricas de rendimiento y de precision cualitativa de la conversion:

| Metrica | Valor |
|---|---|
| Prefill (tok/s) | 134,09 |
| Decode (tok/s) | 9,72 |
| Huella maxima de memoria | 19 GB |
| Precision (mismo veredicto que Transformers) | 12 / 12 |
| Termina con token de parada | 12 / 12 |
| Conversacion de 3 turnos | pasa |

Las mediciones se realizaron en un Apple M4 Max con 128 GB, backend CPU (XNNPACK, 12 hilos), con 1024 tokens de prefill y 256 de decode, el 13 de noviembre de 2026.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo ocupa 55,29 GB en disco; la huella maxima medida en ejecucion es de 19 GB.
- GPU recomendadas: no se han medido backends de GPU para este archivo; la model card solo reporta CPU.
- Cabe en GPU de consumo: no verificado; el tamano del archivo (55,29 GB) supera la VRAM de la mayoria de GPU de consumo, aunque la huella en ejecucion (19 GB) podria ser compatible con GPU de 24 GB si se midiera el backend correspondiente.
- Cabe en movil: no; el archivo de 55,29 GB no cabe en la memoria de un telefono.
- Opciones de despliegue: LiteRT-LM compilado desde el codigo fuente (main `02d7e8d8` o posterior), con backend CPU. Las versiones 0.19.1 y 0.19.2 de PyPI no ejecutan este archivo porque sus kernels `moe` rechazan SiLU; se requiere incluir los PRs #11192 y #11188 de LiteRT.
- Latencia y throughput: prefill de 134,09 tok/s y decode de 9,72 tok/s en Apple M4 Max (CPU, 12 hilos). El rendimiento esta en proceso de optimizacion segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kimi-Linear-48B-A3B-Instruct (LiteRT-LM) | 48B totales / 3B activos | 4096 (en este archivo) | MIT | `.litertlm` | Conversion CPU, requiere runtime compilado desde fuente |
| moonshotai/Kimi-Linear-48B-A3B-Instruct | 48B totales / 3B activos | hasta 1M | MIT | safetensors (bf16) | Modelo original, ejecutable con Transformers y otros runtimes |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparacion en la informacion proporcionada |

La comparacion directa con otros modelos de la misma categoria no esta disponible en la informacion proporcionada; el unico punto de referencia fiable es el modelo fuente original de Moonshot AI, del que esta conversion hereda arquitectura y licencia pero no el contexto completo ni el ecosistema de despliegue.

## Limitaciones y advertencias

- Contexto limitado a 4096 tokens en este archivo, frente a los hasta 1M del modelo original; no apto para tareas de contexto largo.
- Una sola conversacion por motor: las capas Kimi Delta Attention mantienen estado recurrente, por lo que es necesario crear un nuevo motor para cada conversacion (issue #3165 de LiteRT-LM).
- Tras un error por mensaje que no cabe en la ventana de contexto, todos los mensajes posteriores de esa conversacion fallan con `Task failed with state: 7`; hay que iniciar una conversacion nueva en un motor nuevo.
- Tool calling no verificado en este archivo.
- Solo medido en escritorio (Apple M4 Max); no se han medido backends Android GPU, Android CPU ni iOS/iPhone.
- El archivo de 55,29 GB no cabe en memoria de telefono.
- La cuantizacion int8 de los expertos no acelera en CPU porque el kernel `moe` los convierte a fp32 antes de usarlos.
- Requiere compilar LiteRT-LM desde el codigo fuente; las versiones de PyPI no son compatibles.
- Idiomas: solo ingles segun los metadatos; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; aplican los riesgos habituales de los modelos de lenguaje instruct.
- Licencia MIT, permisiva para uso comercial, heredada del modelo original de Moonshot AI.

## Enlaces

- Repositorio Hugging Face de la conversion: https://huggingface.co/litert-community/Kimi-Linear-48B-A3B-Instruct
- Modelo base original: https://huggingface.co/moonshotai/Kimi-Linear-48B-A3B-Instruct
- Notas de conversion y detalles tecnicos: https://huggingface.co/litert-community/Kimi-Linear-48B-A3B-Instruct/blob/main/DETAILS.md
- Paper "Kimi Linear: An Expressive, Efficient Attention Architecture": arXiv:2510.26692
- Pull request LiteRT #11192 (soporte SiLU en kernels moe): https://github.com/google-ai-edge/LiteRT/pull/11192
- Pull request LiteRT #11188 (soporte SiLU en kernels moe): https://github.com/google-ai-edge/LiteRT/pull/11188
- Issue LiteRT-LM #3165 (conversaciones y estado recurrente): https://github.com/google-ai-edge/LiteRT-LM/issues/3165
