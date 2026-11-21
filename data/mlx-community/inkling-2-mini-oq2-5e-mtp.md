# mlx-community/Inkling-2-Mini-oQ2.5e-mtp

## Resumen

Inkling-2-Mini-oQ2.5e-mtp es una cuantizacion de precision mixta del modelo base thinkingmachines/Inkling-2-Mini, publicada por la organizacion mlx-community. Se trata de un checkpoint en formato MLX orientado a la inferencia local en hardware Apple Silicon, generado con oQ (oMLX v0.8.1), la herramienta de cuantizacion de precision mixta de oMLX. El modelo base es un transformer multimodal de tipo mixture-of-experts con bucle (looped MoE), con 26,4 mil millones de parametros totales y 3,4 mil millones de parametros activos por token.

La particularidad arquitectonica mas destacable es que sus 12 capas centrales se ejecutan tres veces por token, lo que incrementa la profundidad efectiva sin aumentar el numero de parametros. Ademas, acepta entradas de texto e imagen con una ventana de contexto de hasta 1 millon de tokens. El checkpoint incluye el codificador de vision y un borrador DSpark empaquetado en `mtp.safetensors`, que oMLX Lightning MTP aprovecha para decodificacion especulativa.

Esta ficha es relevante para desarrolladores que quieran desplegar un modelo multimodal de gran contexto en equipos con memoria unificada limitada: el checkpoint completo ocupa aproximadamente 10,75 GiB en disco gracias a una media efectiva de 3,305 bits por peso, lo que lo hace viable en configuraciones de consumo con suficiente RAM unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal mixture-of-experts con bucle (looped MoE); 12 capas centrales ejecutadas tres veces por token |
| Parametros totales | 26.388.641.280 (26,4B); 26,707B contando vision y borrador MTP |
| Parametros activos | 3,4B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | oQ2.5e de precision mixta: affine 2-bit (grupo 64), affine 3-bit (grupo 64), affine 8-bit (grupo 64), BF16 y FP32; media efectiva de 3,305 bits/peso (3,457 incluyendo el borrador DSpark) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); incluye `mtp.safetensors` con el borrador DSpark |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de tipo mixture-of-experts con una innovacion estructural concreta: las 12 capas centrales se recorren tres veces por cada token, lo que proporciona una profundidad computacional efectiva mayor manteniendo el mismo conjunto de pesos. El checkpoint cuantizado conserva el codificador de vision (0,318B de parametros en BF16) y el enrutador y los controladores de bucle en FP32, mientras que las proyecciones de atencion, los embeddings y la cabeza de vocabulario se almacenan en affine 8-bit.

La cuantizacion oQ2.5e aplica 2-bit affine a las proyecciones gate y up de los expertos enrutados, y 3-bit affine a las proyecciones down en 19 capas (incluidas todas las capas con bucle), salvo en las capas 3, 4, 5, 20 y 22, que usan 2-bit. El reparto de almacenamiento resultante es: 18,006B de pesos logicos en 2-bit (68,2% del total), 6,455B en 3-bit (24,5%), 1,572B en 8-bit (6,0%), 0,320B en BF16 (1,2%) y 0,036B en FP32 (0,1%). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional en formato image-text-to-text, con soporte de entradas de imagen y texto combinadas.
- Procesamiento de contexto largo: ventana de hasta 1M tokens, adecuada para documentos extensos, historiales de conversacion y bases de codigo grandes.
- Razonamiento multi-paso mediante el modo de bucle de las capas centrales, que incrementa la profundidad efectiva por token.
- Decodificacion especulativa mediante el borrador DSpark incluido en `mtp.safetensors`, integrado con oMLX Lightning MTP.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos en local: con 1M tokens de contexto, el modelo puede ingerir contratos, informes tecnicos o expedientes completos en una sola pasada, sin necesidad de chunking ni recuperacion externa, en un equipo Apple Silicon con RAM unificada suficiente.
- Asistencia multimodal sobre capturas y diagramas: al aceptar entradas de imagen y texto, resulta util para transcribir y razonar sobre capturas de pantalla, diagramas de arquitectura o documentacion escaneada en flujos de trabajo de escritorio.
- Prototipado de asistentes conversacionales en Mac: la cuantizacion a 3,305 bits/peso permite ejecutar un modelo de 26,4B en memoria unificada de consumo, lo que facilita iterar sobre prompts y flujos conversacionales sin depender de GPU dedicadas.
- Investigacion sobre arquitecturas con bucle: al exponer el comportamiento de las capas repetidas en un checkpoint compacto, sirve para estudiar el efecto del bucle en tareas de razonamiento y generacion.
- Evaluacion de decodificacion especulativa: el borrador DSpark empaquetado permite medir la ganancia de throughput de MTP frente a decodificacion autoregresiva estandar en MLX.
- Procesamiento por lotes de imagenes con descripcion textual: pipelines de etiquetado o generacion de alt-text para catalogos de imagenes, ejecutados localmente con privacidad de datos.
- Experimentacion con cuantizacion de precision mixta: util como referencia para comparar el impacto de 2-bit frente a 3-bit en proyecciones down de capas MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: el checkpoint completo ocupa 11,539 GB (10,746 GiB) en disco; la inferencia requiere al menos esa cantidad de memoria unificada mas el overhead de activaciones y cache KV, que crece con la longitud de contexto.
- GPU recomendadas: hardware Apple Silicon con memoria unificada (series M1 Pro/Max/Ultra en adelante); no esta pensado para GPU NVIDIA, ya que el formato es MLX.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con 16 GB o mas de RAM unificada para contextos moderados; para aprovechar la ventana de 1M tokens se necesita memoria considerablemente mayor.
- Opciones de despliegue: oMLX 0.8.1 o superior (requisito explicito del autor); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; la decodificacion especulativa via oMLX Lightning MTP y el borrador DSpark esta disenada para mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ2.5e-mtp | 26,4B totales / 3,4B activos | 1M | MLX safetensors, ~3,3 bits/peso | Apache 2.0 | Cuantizacion de precision mixta con vision y borrador MTP |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B totales / 3,4B activos | 1M | safetensors (BF16 presumiblemente) | Apache 2.0 | Modelo original sin cuantizar |
| Alternativas de 2-bit MLX de la familia mlx-community | no disponible | no disponible | MLX safetensors | Apache 2.0 | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- La cuantizacion agresiva a 2-bit y 3-bit en los expertos enrutados puede degradar la calidad frente al modelo base en BF16; no se han publicado evaluaciones que cuantifiquen esa perdida.
- Requiere oMLX 0.8.1 o superior; versiones anteriores no cargaran el checkpoint ni aprovecharan el borrador DSpark.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a ecosistemas CUDA.
- La ventana de 1M tokens implica un consumo de memoria para cache KV que puede exceder la capacidad de equipos de consumo, incluso con pesos cuantizados.
- No hay informacion disponible sobre sesgos, tasas de alucinacion, cobertura idiomatica ni comportamiento en dominios especializados.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar las condiciones del modelo base y de los componentes incluidos (codificador de vision y borrador DSpark).
- El repositorio registra cero descargas y cero likes en el momento de la ficha, por lo que no existe validacion comunitaria del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/Inkling-2-Mini-oQ2.5e-mtp
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
