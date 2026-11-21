# mlx-community/Inkling-2-Mini-oQ4e-mtp

## Resumen

Inkling-2-Mini-oQ4e-mtp es una cuantizacion mixta en formato MLX del modelo thinkingmachines/Inkling-2-Mini, un modelo multimodal de mezcla de expertos (MoE) con arquitectura "looped" desarrollado por Thinking Machines. El checkpoint original contiene 26.389 millones de parametros totales y 3.4 mil millones de parametros activos por token, con una ventana de contexto de hasta 1 millon de tokens y capacidad de procesar entradas de texto e imagen. Esta version, publicada por mlx-community, aplica cuantizacion de precision mixta mediante la herramienta oQ (oMLX v0.8.1) para reducir el peso en disco y en memoria a aproximadamente 16.9 GB.

La particularidad arquitectonica del modelo reside en su estructura de bucle: las 12 capas centrales se ejecutan tres veces por cada token procesado, lo que incrementa la profundidad efectiva del calculo sin aumentar proporcionalmente el numero de parametros. Ademas, incorpora un borrador DSpark empaquetado en `mtp.safetensors` que oMLX Lightning MTP utiliza para decodificacion especulativa, acelerando la generacion.

Esta ficha es relevante para desarrolladores que trabajan en el ecosistema Apple Silicon (MLX), ya que permite ejecutar un modelo multimodal de 26B parametros con contexto de 1M tokens en hardware de consumo, a costa de una cuantizacion agresiva que mantiene los expertos enrutados en NVFP4 y 4 bits afines, mientras preserva atencion, embeddings y cabeza de vocabulario en 8 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle (looped), multimodal (texto + imagen) |
| Parametros totales | 26.389.646.400 (26.389B) |
| Parametros activos | 3.4B |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | oQ4e mixta: NVFP4 grupo 16, affine 4-bit grupo 64, affine 8-bit grupo 64, BF16, FP32; media efectiva 4.915 bits/peso (5.047 incluyendo el borrador DSpark) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `mtp.safetensors` para el borrador DSpark |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con una innovacion estructural: las 12 capas intermedias se ejecutan tres veces por token, de modo que el modelo reutiliza el mismo bloque de parametros en tres pasadas secuenciales. Esto produce una profundidad computacional efectiva mayor que la que sugiere su recuento de parametros, manteniendo 3.4B parametros activos por token sobre un total de 26.389B. La arquitectura incluye un codificador de vision (0.318B parametros) para entradas image-text-to-text y un borrador DSpark de 0.318B parametros para decodificacion especulativa via MTP (multi-token prediction).

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el modelo original. La cuantizacion de esta version, realizada con oQ (oMLX v0.8.1), preserva los expertos enrutados de las capas 0 a 19 en su formato NVFP4 de origen y recuantiza los expertos MXFP8 de las capas 20 a 23 a 4 bits afines. Las proyecciones de atencion, embeddings y cabeza de vocabulario se almacenan en 8 bits afines; el codificador de vision y el borrador DSpark permanecen en BF16, y el router y los controladores de bucle en FP32.

## Capacidades

- Generacion de texto y razonamiento multimodal: acepta entradas de texto e imagen (pipeline image-text-to-text).
- Procesamiento de contexto largo: ventana de hasta 1M tokens, adecuada para documentos extensos o conversaciones multi-turno prolongadas.
- Decodificacion especulativa: el borrador DSpark incluido en `mtp.safetensors` permite acelerar la generacion mediante oMLX Lightning MTP.
- Mezcla de expertos con enrutamiento: 3.4B parametros activos por token sobre 26.389B totales, lo que reduce el coste computacional por token.
- Ejecucion en Apple Silicon mediante la libreria MLX.
- Capacidades de tool calling, agentes o thinking mode: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Procesamiento de documentos extensos en local: con 1M tokens de contexto, el modelo puede ingerir manuales tecnicos, expedientes o bases de codigo completas en una sola pasada sobre un Mac con Apple Silicon, sin depender de servicios en la nube.
- Analisis de imagenes con descripcion textual: el codificador de vision permite tareas de image-text-to-text como generacion de pies de foto, extraccion de informacion de capturas o respuesta a preguntas sobre imagenes.
- Asistentes conversacionales multi-turno: la ventana de contexto larga y la naturaleza conversacional del pipeline permiten mantener historiales extensos sin truncamiento agresivo.
- Prototipado e investigacion en MLX: util para desarrolladores que evaluan arquitecturas MoE con bucles y decodificacion especulativa en el ecosistema Apple, sin necesidad de GPUs dedicadas.
- Despliegue en estaciones de trabajo macOS: al ocupar aproximadamente 16.9 GB en disco y requerir memoria unificada, puede ejecutarse en equipos con 32 GB o mas de RAM unificada.
- Generacion asistida con latencia reducida: el borrador DSpark y la decodificacion especulativa de oMLX Lightning MTP reducen el tiempo por token en comparacion con decodificacion autoregresiva estandar, adecuado para aplicaciones interactivas.
- Fine-tuning o evaluacion de la cuantizacion: investigadores pueden comparar el rendimiento del checkpoint oQ4e frente al modelo base BF16 para medir la perdida de calidad introducida por la cuantizacion mixta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 16.9 GB de almacenamiento (15.690 GiB) para los pesos; la memoria unificada necesaria para inferencia sera superior al sumar cache KV, activaciones y el contexto, especialmente con ventanas largas de hasta 1M tokens.
- GPU recomendadas: hardware Apple Silicon con memoria unificada; no se especifican modelos concretos de GPU NVIDIA (A100, H100, RTX 4090) porque el formato es MLX, especifico de Apple.
- Cabe en consumer hardware: si, en equipos Apple Silicon con al menos 32 GB de memoria unificada; con contextos muy largos se requerira mas memoria.
- Opciones de despliegue: MLX con oMLX 0.8.1 o superior (requisito explicito del autor); no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; la decodificacion especulativa via DSpark y oMLX Lightning MTP esta disenada para mejorarlos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ4e-mtp (esta ficha) | 26.389B | 3.4B | 1M tokens | Apache 2.0 | MLX, safetensors |
| thinkingmachines/Inkling-2-Mini (base) | 26.389B | 3.4B | 1M tokens | Apache 2.0 | Pesos originales (formato no detallado) |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos alternativos de la misma categoria (MoE multimodal con contexto de 1M tokens) en la documentacion proporcionada, por lo que la comparativa se limita al modelo base del que deriva esta cuantizacion.

## Limitaciones y advertencias

- La cuantizacion mixta a 4.915 bits/peso efectivos puede degradar la calidad respecto al modelo base en tareas sensibles a la precision numerica; no se han publicado evaluaciones comparativas.
- Requiere oMLX 0.8.1 o superior; no es compatible con otros runtimes de inferencia convencionales (vLLM, llama.cpp, Ollama, TGI) al estar en formato MLX.
- Dependencia del ecosistema Apple Silicon: no puede ejecutarse en GPUs NVIDIA o AMD sin conversion de formato.
- El contexto de 1M tokens exige memoria considerable; en equipos con 32 GB de RAM unificada el uso practico del contexto completo puede verse limitado por la cache KV.
- Idiomas soportados no especificados: se desconoce la cobertura multilingue real y el riesgo de degradacion en idiomas distintos del ingles.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan medidas especificas de mitigacion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus datos de entrenamiento pueden imponer restricciones adicionales no documentadas aqui.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/Inkling-2-Mini-oQ4e-mtp
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
