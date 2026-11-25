# AST-1320/WAMU_v3_WAN2.2_I2V_LIGHTNING

## Resumen

WAMU_v3_WAN2.2_I2V_LIGHTNING es un modelo de difusion para generacion de video a partir de imagen (image-to-video, I2V) publicado en Hugging Face por el usuario AST-1320. El identificador del repositorio sugiere que se trata de un ajuste fino o derivado del modelo Wan 2.2 de Alibaba, en su variante image-to-video, con algun tipo de optimizacion orientada a inferencia rapida (el sufijo "LIGHTNING" es habitual en destilaciones de pasos multiples o aceleradores de muestreo). El modelo se distribuye en formato diffusers y se carga mediante la clase `WanImageToVideoPipeline`.

El checkpoint contiene 14.288.901.184 parametros (aproximadamente 14,3 mil millones) en pesos safetensors, con un repositorio de 68,9 GB, lo que es coherente con pesos en precision bf16 o fp16. La model card es la plantilla autogenerada por diffusers y no aporta informacion sobre datos de entrenamiento, licencia, idiomas ni procedimiento de destilacion, por lo que buena parte de las especificaciones tecnicas no esta disponible.

La relevancia de este modelo es limitada pero concreta: se trata de un derivado de la familia Wan 2.2 I2V con presumiblemente menos pasos de inferencia, lo que puede interesar a quienes trabajan en generacion de video en produccion y necesitan reducir latencia. No obstante, al no haber model card sustantiva, benchmarks ni licencia declarada, su evaluacion rigurosa requiere inspeccion directa de los pesos y del pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusion para video (image-to-video), familia Wan 2.2; detalles internos no disponibles |
| Parametros totales | 14.288.901.184 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ventana temporal de video no especificada) |
| Tipos de cuantizacion | no disponible (repo en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible (modelo multimodal texto-imagen-video; idioma de prompts no declarado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

La informacion disponible no permite describir la arquitectura con detalle. Por el identificador y el pipeline (`WanImageToVideoPipeline`), se trata de un modelo de difusion para generacion de video condicionada por imagen, derivado de la familia Wan 2.2 de Alibaba. Los modelos Wan 2.2 combinan un VAE de video con un transformer de difusion (DiT) y un codificador de texto para el prompt; el sufijo "LIGHTNING" sugiere una destilacion para reducir el numero de pasos de muestreo, aunque este extremo no esta confirmado en la informacion proporcionada.

No hay datos sobre volumen de tokens o clips de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas declaradas por el autor. La model card es la plantilla autogenerada de diffusers y todos los campos sustantivos aparecen como "[More Information Needed]".

## Capacidades

- Generacion de video a partir de una imagen de entrada (image-to-video) mediante el pipeline `WanImageToVideoPipeline` de diffusers.
- Condicionamiento por prompt de texto (el pipeline Wan I2V acepta texto e imagen), aunque el idioma y la calidad multilingue no estan documentados.
- Presunta inferencia acelerada por destilacion ("LIGHTNING"), no confirmada en la informacion disponible.
- No hay evidencia de soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo generativo de video, no un LLM.
- No se documentan capacidades de audio, vision de comprension ni thinking mode.

## Casos de uso

- Prototipado de image-to-video en pipelines diffusers: cargar el checkpoint con `WanImageToVideoPipeline` para animar una imagen fija y evaluar la calidad del movimiento generado antes de comprometerse con un modelo mayor.
- Generacion de clips cortos para previsualizacion creativa: a partir de un frame o storyboard, producir borradores de video para revision interna en estudios de diseno o marketing.
- Investigacion sobre destilacion de modelos de difusion de video: comparar este checkpoint "LIGHTNING" con el Wan 2.2 I2V base para medir la perdida de calidad frente a la reduccion de pasos.
- Aumento de datos sinteticos para vision por computador: generar variaciones de video a partir de imagenes etiquetadas para entrenar detectores o modelos de accion, siempre que la licencia lo permita (no declarada).
- Animacion de assets 2D en pipelines de contenido: convertir ilustraciones o fotografias en clips breves para redes sociales o demos de producto.
- Evaluacion comparativa de checkpoints de la comunidad: servir como punto de referencia en estudios de reproducibilidad y calidad de derivados no oficiales de Wan 2.2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 14,3 mil millones de parametros, los pesos en bf16 ocupan aproximadamente 28,6 GB; en fp16, lo mismo. La inferencia completa requiere ademas el VAE de video y el codificador de texto, por lo que en la practica se necesita mas memoria que la de los pesos del transformer.
- GPU recomendadas: no disponibles en la informacion. Por tamano, cabria esperar A100 80 GB o H100 para ejecucion holgada en precision completa; en GPUs consumer de 24 GB (RTX 4090) seria necesario cuantizar u offload.
- Cabe en GPU consumer: no confirmado. Requiere cuantizacion u offloading a CPU/VRAM para intentarlo en tarjetas de 24 GB o menos.
- Opciones de despliegue: diffusers (pipeline oficial `WanImageToVideoPipeline`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion de video en este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WAMU_v3_WAN2.2_I2V_LIGHTNING | 14,3 B | difusion video I2V (derivado Wan 2.2) | no disponible | no disponible | Hugging Face (repo AST-1320) |
| Wan 2.2 I2V (original, Alibaba) | no disponible en esta ficha | difusion video I2V | no disponible | no disponible en esta ficha | Hugging Face / repos oficiales |
| Alternativas I2V de la comunidad (p. ej. derivados de HunyuanVideo, LTX-Video) | variable | difusion video I2V | no disponible | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a categoria y disponibilidad.

## Limitaciones y advertencias

- Model card autogenerada sin informacion sustantiva: no hay datos de entrenamiento, evaluacion, sesgos ni uso previsto declarados por el autor.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible verificar los terminos antes de cualquier despliegue en produccion.
- Riesgo de alucinacion visual y artefactos temporales: como todo modelo de difusion de video, puede generar movimiento incoherente, deformaciones y flickering, especialmente en clips largos o escenas complejas.
- Idiomas de prompt no documentados: el rendimiento con prompts en castellano es desconocido.
- Origen no oficial: al ser un derivado de la comunidad, no hay garantia de que respete las condiciones de la licencia del modelo base Wan 2.2.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que la variante "LIGHTNING" mantenga la calidad del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/AST-1320/WAMU_v3_WAN2.2_I2V_LIGHTNING
- Referencia citada en la model card (calculo de impacto ambiental): https://mlco2.github.io/impact#compute
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Documentacion del pipeline diffusers `WanImageToVideoPipeline`: no disponible en la informacion proporcionada.
