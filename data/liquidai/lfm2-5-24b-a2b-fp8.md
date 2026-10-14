# LiquidAI/LFM2.5-24B-A2B-FP8

## Resumen

LFM2.5-24B-A2B-FP8 es la version cuantizada en FP8 del modelo LFM2.5-24B-A2B de Liquid AI, una red de mezcla de expertos (MoE) de aproximadamente 24 000 millones de parametros totales disenada para inferencia en GPU. Esta variante mantiene los pesos lineales en FP8 con bloques de 128x128 y cuantizacion dinamica de activaciones, mientras que los embeddings, las puertas de enrutado del MoE y los pesos de convolucion se conservan en su precision original. El resultado es un checkpoint de 24,8 GB que reduce el coste de memoria y acelera la decodificacion frente al modelo base, sin requerir cambios en el codigo de inferencia.

El modelo pertenece a la familia LFM2.5 de Liquid AI, una linea de modelos "edge" con arquitectura hibrida que combina capas convolucionales y de atencion junto con capas MoE dispersas. El sufijo "A2B" de la nomenclatura sugiere del orden de 2000 millones de parametros activos por token, aunque este dato no se confirma de forma explicita en la informacion disponible. Soporta diez idiomas, entre ellos el espanol, el ingles, el arabe, el chino mandarin y las principales lenguas europeas y asiaticas.

Su relevancia actual radica en que ofrece una relacion capacidad/VRAM poco habitual: un modelo de casi 24 000 millones de parametros que puede servirse en una unica GPU de 48 GB o en aceleradores de gama alta para consumidores, con soporte documentado en SGLang y compatibilidad con el ecosistema Transformers. La licencia LFM 1.0, no obstante, ha de revisarse antes de cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida con capas convolucionales y de atencion, con capas MoE dispersas (tag `lfm2_moe`) |
| Parametros totales | 23 971 587 712 (aproximadamente 24 000 millones) |
| Parametros activos | Aproximadamente 2000 millones, inferido de la nomenclatura "A2B"; no confirmado en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (pesos lineales en bloques de 128x128 con cuantizacion dinamica de activaciones); embeddings, puertas de enrutado MoE y convoluciones en precision original |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues, italiano |
| Licencia | LFM 1.0 (`lfm1.0`), etiquetada como "other" en Hugging Face |
| Formato de pesos | safetensors (cuantizacion via `compressed-tensors`) |
| Tamano del repositorio | 24,8 GB |
| Modelo base | LiquidAI/LFM2.5-24B-A2B |
| Libreria | Transformers |
| Descargas / likes | 726 descargas, 15 likes |

## Arquitectura y entrenamiento

La ficha tecnica de esta variante no detalla la arquitectura interna mas alla de las etiquetas `lfm2_moe` y `liquid`, y de la mencion explicita a los pesos de convolucion que se mantienen sin cuantizar. Esto confirma que el modelo combina operaciones convolucionales con atencion y capas MoE, un patron habitual en la familia LFM2 de Liquid AI orientada a eficiencia en el borde. El modelo cuenta con aproximadamente 24 000 millones de parametros totales de los cuales solo una fraccion se activa por token gracias al enrutado disperso, lo que reduce el coste computacional por token respecto a un transformer denso del mismo tamano.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO en el modelo base. Tampoco se documentan innovaciones adicionales en esta variante FP8 mas alla del esquema de cuantizacion: pesos lineales en FP8 por bloques de 128x128 y cuantizacion dinamica de las activaciones, manteniendo en precision completa los elementos mas sensibles (embeddings, gates de enrutado y convoluciones). Esta decision de diseno busca preservar la calidad de las representaciones y del enrutado de expertos, que suelen degradarse de forma desproporcionada con cuantizaciones agresivas.

## Capacidades

- Generacion de texto conversacional multi-turno en los diez idiomas declarados, con espanol incluido.
- Razonamiento y generacion de contenido general, orientado a tareas asistenciales y de produccion textual.
- Capacidad de codigo: no verificada de forma explicita en la informacion disponible.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues e italiano.
- Capacidades multimodales (vision, audio): no disponibles; la pipeline declarada es exclusivamente `text-generation`.
- Modo "thinking" o razonamiento extendido: no confirmado en la informacion disponible.
- Inferencia acelerada en GPU gracias a la cuantizacion FP8, con soporte documentado en SGLang y compatibilidad con Transformers.

## Casos de uso

- Asistencia conversacional multilingue en produccion: el modelo puede atender usuarios en diez idiomas desde un unico despliegue, lo que simplifica la infraestructura frente a mantener un modelo especializado por idioma.
- Generacion de contenido en espanol para medios y marketing: al incluir el espanol entre los idiomas soportados, es adecuado para redaccion, resumen y reescritura de textos con tono controlado.
- Traduccion automatica entre los pares de idiomas cubiertos: el soporte simultaneo de arabe, chino, japones, coreano y lenguas europeas permite construir pipelines de traduccion sin modelos auxiliares.
- Servicio de chat de bajo coste por token: la naturaleza MoE con cuantizacion FP8 reduce el coste de memoria y de computo por token, lo que abarata el despliegue en GPU propias frente a modelos densos de tamano similar.
- Procesado por lotes de documentos (clasificacion, extraccion, resumen): el modelo puede integrarse en pipelines offline sobre GPU mediante SGLang o Transformers para tareas de enriquecimiento de datos.
- Backend de aplicaciones con API compatible: la etiqueta `endpoints_compatible` indica que el checkpoint puede servirse en infraestructuras de inferencia compatibles con endpoints gestionados, lo que facilita su integracion en plataformas cloud.
- Atencion al cliente automatizada: utilizable como motor de respuesta en entornos con GPU dedicada, siempre que se valide antes la calidad y ausencia de alucinaciones en el dominio concreto.
- Generacion asistida en entornos regulados con datos sensibles: al poder desplegarse on-premise en una sola GPU de 48 GB, permite mantener los datos dentro de la organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de la variante FP8 solo documenta el esquema de cuantizacion y el comando de despliegue en SGLang; no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base en terminos de degradacion por cuantizacion.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 24 GB, ya que FP8 ocupa 1 byte por parametro sobre 23 971 587 712 parametros.
- VRAM total estimada para inferencia: del orden de 27 a 32 GB, incluyendo cache KV, buffers de activaciones y overhead del motor de inferencia. La cifra exacta depende de la longitud de contexto y del tamano de lote, datos no disponibles.
- GPU recomendadas para servicio en produccion: NVIDIA H100 (80 GB), A100 (80 GB o 40 GB) y L40S (48 GB).
- GPU de gama profesional con 48 GB: RTX 6000 Ada o equivalentes pueden alojar el modelo completo con contexto moderado.
- GPU de consumo: una RTX 4090 de 24 GB resulta muy ajustada, ya que los pesos solos ocupan unos 24 GB. Una RTX 5090 de 32 GB o una RTX 4090 acompañada de offloading a CPU son las opciones mas realistas dentro del segmento de consumo.
- Opciones de despliegue: SGLang esta documentado de forma explicita en la model card (`python -m sglang.launch_server --model-path LiquidAI/LFM2.5-24B-A2B-FP8`). El soporte en vLLM, TGI, llama.cpp u Ollama no se menciona en la informacion disponible; el formato FP8 con `compressed-tensors` apunta a motores de servido GPU mas que a runtimes de CPU.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de los modelos comparativos proceden de sus fichas publicas y deben verificarse antes de tomar decisiones de despliegue.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formatos |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-FP8 | 23 971 587 712 | Aproximadamente 2000 millones (inferido) | no disponible | LFM 1.0 | safetensors FP8 |
| Qwen3-30B-A3B | Aproximadamente 30 500 millones | Aproximadamente 3300 millones | 32 768 tokens nativos, ampliable con YaRN | Apache 2.0 | safetensors, GGUF |
| Mixtral 8x7B | Aproximadamente 46 700 millones | Aproximadamente 12 900 millones | 32 768 tokens | Apache 2.0 | safetensors, GGUF |

Frente a Qwen3-30B-A3B, el modelo de Liquid AI tiene menos parametros totales y presumiblemente menos parametros activos, lo que reduce el coste por token, pero parte de una licencia no OSI y no publica resultados de evaluacion en la informacion disponible. Frente a Mixtral 8x7B, la ventaja en eficiencia es notable: Mixtral activa cerca de 12 900 millones de parametros por token, aproximadamente seis veces mas que la estimacion de este modelo, y ademas exige mucha mas VRAM en precision completa.

## Limitaciones y advertencias

- Ausencia total de evaluaciones publicadas en la informacion disponible: no hay datos de MMLU, HumanEval, GSM8K ni de la degradacion introducida por la cuantizacion FP8 respecto al modelo base.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala. No se documentan medidas de mitigacion ni tasas de error medidas.
- Sesgos conocidos: no disponibles. No se publica informacion sobre composicion del dataset ni sobre analisis de sesgo.
- Longitud de contexto desconocida: sin este dato no es posible dimensionar la cache KV ni garantizar el comportamiento en conversaciones largas o documentos extensos.
- Cobertura idiomatica desigual: aunque se declaran diez idiomas, no se especifica el nivel de calidad por idioma; los idiomas con menos presencia en los datos de entrenamiento pueden rendir peor.
- Capacidades no confirmadas: no hay evidencia en la informacion disponible de soporte de tool calling, uso agentico, vision o modo de razonamiento extendido. Conviene validarlas empiricamente antes de disenar arquitecturas que dependan de ellas.
- Restricciones de licencia: la licencia LFM 1.0 aparece etiquetada como "other" en Hugging Face y no es una licencia aprobada por la OSI. Es obligatorio revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que puede incluir condiciones de atribucion, umbrales de facturacion o restricciones sobre el uso de las salidas para entrenar modelos competidores.
- Limitacion de despliegue en FP8: el esquema de cuantizacion por bloques de 128x128 con cuantizacion dinamica de activaciones esta pensado para GPUs modernas con soporte FP8 (arquitecturas Hopper, Ada y posteriores). En hardware mas antiguo el checkpoint puede no ser utilizable directamente.
- Los metadatos del repositorio indican fechas de creacion y actualizacion de octubre de 2026, lo que resulta anomalo; conviene contrastarlo con el repositorio original antes de citarlo.
- Trazabilidad limitada: no hay paper, informe tecnico ni blog enlazado en la informacion disponible que documente el proceso de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-FP8
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia LFM 1.0: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-FP8/blob/main/LICENSE
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentacion de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Servidor de Discord de Liquid AI: https://discord.com/invite/liquid-ai
