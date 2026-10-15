# hoborific/Gemma-4-Writers-31B-W8A16-FP8

## Resumen
Gemma-4-Writers-31B-W8A16-FP8 es una version cuantizada del modelo Ateron/Gemma-4-Writers-31B, publicada por el usuario hoborific en HuggingFace. Se trata de una cuantizacion offline en formato W8A16 FP8 (pesos en float8_e4m3fn con escalas simetricas por canal de salida y activaciones en bf16/fp16), empaquetada con la libreria compressed-tensors. El modelo mantiene la pipeline image-text-to-text, es decir, acepta entradas multimodales de imagen y texto, y esta pensado para tareas conversacionales con soporte de prompt de sistema.

El modelo hereda la base de la familia Gemma 4 de Google DeepMind. La familia Gemma 4 incluye arquitecturas densas y Mixture-of-Experts en cinco tamanos (E2B, E4B, 12B, 26B A4B y 31B), con una ventana de contexto de hasta 256K tokens y soporte de mas de 140 idiomas segun la documentacion de Google. La variante concreta de este repositorio parte de un fine-tune orientado a escritura ("Writers") y conserva el tower de vision en bf16 sin cuantizar.

Su relevancia practica radica en que reduce el coste de memoria de un modelo de aproximadamente 31,3 mil millones de parametros a pesos de 8 bits, con un kernel especifico para Intel XPU y soporte en CUDA via vLLM. No obstante, la model card no publica licencia, idiomas ni datos de benchmarks, y el repositorio registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base de la familia Gemma 4); no se detalla en la model card del autor |
| Parametros totales | 31.273.088.876 (~31,3 B) |
| Parametros activos | No aplica (no se indica que sea MoE; el tamano de 31B corresponde a una variante densa) |
| Longitud de contexto | No disponible en la model card; la familia Gemma 4 soporta hasta 256K tokens segun Google |
| Tipos de cuantizacion | W8A16 FP8 (pesos float8_e4m3fn, activaciones bf16/fp16), formato compressed-tensors float-quantized |
| Idiomas soportados | No disponible en la model card; la familia Gemma 4 declara mas de 140 idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors (compressed-tensors, float-quantized) |

## Arquitectura y entrenamiento
El repositorio es una cuantizacion, no un modelo entrenado desde cero. La model card indica que se parte de Ateron/Gemma-4-Writers-31B y se aplica cuantizacion offline del tipo W8A16 FP8 en el formato float-quantized de compressed-tensors: los pesos se almacenan en float8_e4m3fn con escalas simetricas por canal de salida (per-output-channel) y las activaciones permanecen en bf16/fp16. El procedimiento por capa lineal calcula una escala por fila de salida partiendo de amax/448 y la refina mediante una busqueda de recorte MSE sobre aproximadamente nueve fracciones de clip (0,8 a 1,0 veces amax), seleccionando la escala de menor error por fila. Los pesos se cuantizan como q = e4m3(w / scale) con redondeo al mas cercano y saturacion. El autor afirma que este esquema por canal con recorte ofrece mejor relacion senal-ruido (SNR) que la ruta estandar de cuantizacion FP8 online por tensor de vLLM.

Solo se cuantizan los pesos de proyecciones lineales 2D (atencion q/k/v/o y MLP gate/up/down). Los embeddings, las normalizaciones, la lm_head, los routers/expertos y el tower de vision permanecen en bf16 y figuran en la lista ignore del checkpoint, de forma que vLLM no los modifica. No se aportan en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. La familia Gemma 4 de Google incorpora soporte nativo del rol system y un modelo draft dedicado para decodificacion especulativa (multi-token prediction) en todas sus variantes.

## Capacidades
- Generacion de texto y conversacion multi-turno, dado el tag conversational y la pipeline image-text-to-text.
- Procesamiento de imagen y texto combinados (image-text-to-text), ya que el tower de vision se conserva en bf16.
- Soporte de prompt de sistema (heredado de la familia Gemma 4 segun Google), que permite conversaciones mas estructuradas y controlables.
- Capacidades multilingues potenciales heredadas de la base Gemma 4 (mas de 140 idiomas declarados por Google); no confirmadas en la model card del autor.
- Escritura y generacion de contenido, dado el caracter "Writers" del fine-tune base.
- Razonamiento, codigo y matematicas: no confirmado especificamente para este fine-tune, aunque la familia Gemma 4 se orienta a estas tareas.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible en la informacion proporcionada.

## Casos de uso
- Generacion asistida de contenido editorial: el modelo puede redactar y reescribir textos largos aprovechando su origen en un fine-tune orientado a escritura, con la ventaja de que los pesos en 8 bits reducen el coste de despliegue en comparacion con el modelo original en bf16.
- Analisis de documentos con imagenes: gracias a la pipeline image-text-to-text, puede extraer informacion de capturas, diagramas o formularios acompanados de instrucciones en texto, manteniendo el tower de vision sin cuantizar.
- Asistentes conversacionales con prompt de sistema: la herencia del soporte nativo del rol system en Gemma 4 permite fijar un tono, un formato o unas restricciones de comportamiento estables en produccion.
- Despliegue en infraestructura Intel XPU: es el escenario objetivo del autor, ya que el kernel XPUW8A16FP8LinearKernel esta disenado especificamente para esta cuantizacion en vLLM.
- Servicio de inferencia en CUDA con vLLM: en GPUs NVIDIA SM75 o superiores (Turing y posteriores) puede cargarse con HummingFP8ScaledMMLinearKernel (si el paquete humming esta instalado) o con MarlinFP8ScaledMMLinearKernel como alternativa.
- Base para experimentacion en cuantizacion: util para investigadores que quieran comparar el SNR del esquema per-channel con clip frente a la cuantizacion FP8 online por tensor de vLLM.
- Prototipado multimodal con ahorro de memoria: adecuado para entornos donde no es viable cargar la version bf16 del modelo de 31B y se necesita conservar la capacidad de procesar imagenes.
- Traduccion y atencion multilingue: potencialmente aplicable si se confirman los mas de 140 idiomas de la base Gemma 4, aunque este dato no esta verificado para este repositorio concreto.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: los pesos en 8 bits ocupan aproximadamente 31 GB (31,3 B de parametros). Hay que sumar el coste de la cache KV en bf16/fp16, que depende del contexto configurado, y los modulos no cuantizados (embeddings, normas, lm_head, routers y tower de vision).
- Repositorio en disco: 33,3 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB y, en general, GPUs con 48-80 GB de VRAM para trabajar con contexto amplio. El destino previsto por el autor es Intel XPU.
- CUDA: soportada en SM75 o superior (Turing y posteriores) mediante HummingFP8ScaledMMLinearKernel si se instala el paquete humming, o MarlinFP8ScaledMMLinearKernel en su defecto.
- GPU de consumo: no disponible; con 31,3 B de parametros en 8 bits no cabe en GPUs consumer de 24 GB sin tecnicas adicionales de offload o particionado, dato no confirmado por el autor.
- Backends no soportados: ROCm, CPU y TPU. vLLM no dispone de kernel W8A16-FP8 para estas plataformas y la carga fallara con un error de tipo "no kernel".
- Opciones de despliegue: vLLM (con kernels especificos por plataforma); no se mencionan otras alternativas como llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hoborific/Gemma-4-Writers-31B-W8A16-FP8 | 31,3 B | No disponible (base Gemma 4: 256K) | W8A16 FP8 | No disponible | HuggingFace (0 descargas, 0 likes) |
| Ateron/Gemma-4-Writers-31B | No disponible | No disponible | bf16 (sin cuantizar) | No disponible | HuggingFace (modelo base) |
| hoborific/Gemma-4-Writers-31B-V2-W8A16-FP8 | No disponible | No disponible | W8A16 FP8 | No disponible | HuggingFace (variante V2 del mismo autor) |
| Gemma 4 31B (Google DeepMind) | 31 B (familia) | 256K tokens | bf16 (original) | Licencia Gemma (no confirmada aqui) | Google AI / DeepMind |

Nota: los datos de la familia Gemma 4 provienen de la documentacion de Google; no se dispone de cifras de rendimiento comparadas para las variantes "Writers" ni para esta cuantizacion concreta.

## Limitaciones y advertencias
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base (Ateron/Gemma-4-Writers-31B) y de la familia Gemma 4 antes de desplegarlo en produccion.
- Sin datos de benchmarks: no hay evaluaciones publicadas que confirmen el impacto de la cuantizacion W8A16 FP8 sobre la calidad respecto al modelo original.
- Compatibilidad de backend restringida: no funciona en ROCm, CPU ni TPU; el intento de carga producira un error de kernel no disponible.
- El autor afirma que el esquema per-channel con recorte mejora el SNR frente a la cuantizacion FP8 online por tensor de vLLM, pero esta comparacion es una afirmacion del autor sin datos publicados en la informacion disponible.
- Riesgo de sesgos y alucinaciones: no cuantificado en la informacion disponible; es esperable que herede los sesgos del modelo base y del fine-tune "Writers", pero no se aportan analisis concretos.
- Idiomas: no confirmados para este repositorio. Aunque la base Gemma 4 declara mas de 140 idiomas, no hay verificacion especifica para este fine-tune.
- Contexto: la model card no indica la longitud de contexto soportada; el dato de 256K corresponde a la familia Gemma 4 de Google y podria no aplicar a este fine-tune.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion por parte de la comunidad.
- Advertencia de plataforma: los kernels HummingFP8ScaledMMLinearKernel requieren el paquete humming instalado; en su ausencia, se recurre a MarlinFP8ScaledMMLinearKernel, con posibles diferencias de rendimiento.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/hoborific/Gemma-4-Writers-31B-W8A16-FP8
- Modelo base: https://huggingface.co/Ateron/Gemma-4-Writers-31B
- Variante V2 del mismo autor: https://huggingface.co/hoborific/Gemma-4-Writers-31B-V2-W8A16-FP8
- Libreria compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Gemma 4 model card (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Gemma 4 model overview (Google AI for Developers): https://ai.google.dev/gemma/docs/core
- Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
