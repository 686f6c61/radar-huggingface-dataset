# plimb/gladios-tiny.story-0.1B

## Resumen

gladios-tiny.story-0.1B es un modelo de lenguaje decoder-only con arquitectura tipo GPT-2, desarrollado por plimb y entrenado desde cero (from scratch) sobre el dataset completo TinyStories. Con 124.046.592 parámetros (aproximadamente 0,12B), 12 capas, 12 cabezas de atención y una dimensión de embedding de 768, se sitúa en la gama de los modelos pequeños diseñados para tareas muy acotadas.

Su propósito no es competir en razonamiento general ni en instrucciones, sino reproducir el estilo de los cuentos infantiles cortos en inglés. El entrenamiento cubre las aproximadamente 2,1 millones de historias del split `train` de TinyStories, unos 470 millones de tokens, usando el tokenizador de GPT-2 con un vocabulario de 50.257 entradas. La ventana de contexto es de solo 512 tokens, coherente con la longitud de las narraciones del corpus.

Es relevante ahora como baseline de investigación reproducible: al estar entrenado exclusivamente sobre un único dataset y publicarse con licencia MIT, código de entrenamiento abierto y pesos en safetensors, permite estudiar la coherencia lingüística en modelos diminutos, experimentar con fine-tuning barato y actuar como banco de pruebas de pipelines de despliegue sin apenas coste de hardware.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura GPT-2) |
| Parametros totales | 124.046.592 (aprox. 0,12B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No se declaran cuantizaciones publicadas; el tamano del repositorio (0,5 GB) es consistente con pesos en fp32. Compatible con cuantizacion a int8/int4 y con conversion a GGUF |
| Idiomas soportados | Ingles (en) unicamente |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Capas | 12 |
| Cabezas de atencion | 12 |
| Dimension de embedding | 768 |
| Tokenizador | GPT-2 (tiktoken), vocabulario de 50.257 tokens |
| Dataset de entrenamiento | roneneldan/TinyStories (split train completo) |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only con la configuración clásica de GPT-2 small: 12 capas, 12 cabezas de atención, dimensión oculta de 768 y contexto de 512 tokens. No incorpora mecanismos de atención lineal, decodificación especulativa ni mezcla de expertos; es una pila de atención completa estándar con el tokenizador original de GPT-2.

El entrenamiento se realizó desde cero sobre el split `train` completo de TinyStories, sin submuestreo, con cada cuento separado mediante el token especial `<|endoftext|>`. No se documenta en la información disponible el uso de RLHF, DPO ni ningún ajuste posterior de alineamiento: el modelo aprende únicamente la distribución del corpus de cuentos. Tampoco se especifican el número exacto de tokens vistos, el tamaño de batch, la tasa de aprendizaje ni la composición detallada del dataset más allá de la referencia al corpus TinyStories.

## Capacidades

- Generacion de texto narrativo corto en ingles, en el registro de cuentos infantiles.
- Continuacion de prompts simples del estilo "Once upon a time" o frases con personajes infantiles.
- Muestreo configurable mediante `temperature`, `top_k` y `max_new_tokens` en la API de `transformers`.
- Capacidad multilingue: limitada al ingles; no hay evidencia de soporte de otros idiomas.
- Tool calling / function calling: no soportado.
- Uso como agente o razonamiento multi-paso: no soportado.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision, audio u otras modalidades: no soportadas.
- Seguimiento de instrucciones y conversacion multi-turno: no soportados, segun la propia model card.

## Casos de uso

- Generacion de corpus sintetico de cuentos: producir grandes volumenes de narraciones cortas en ingles para aumentar datasets de entrenamiento o evaluacion de modelos pequenos en tareas de coherencia narrativa. Su ventana de 512 tokens y su entrenamiento sobre TinyStories lo hacen idoneo para generar textos del mismo dominio.
- Investigacion sobre coherencia en modelos diminutos: servir como baseline controlado al estar entrenado sobre un unico dataset conocido y con codigo de entrenamiento publico, lo que permite aislar el efecto de la arquitectura o del tokenizador en estudios comparativos.
- Docencia y prototipado rapido: ejemplo minimo de pipeline de generacion con `transformers` que cabe en cualquier portatil, util para ensenar inferencia, decodificacion y gestion de tokens especiales sin coste de GPU.
- Pruebas de infraestructura y smoke tests: al ocupar menos de 1 GB en fp32, permite validar despliegues de TGI, vLLM o endpoints compatibles sin consumir recursos significativos antes de pasar a modelos de produccion.
- Experimentacion con fine-tuning y LoRA: su tamano reducido hace viable ajustar el modelo en una unica GPU consumer, por ejemplo para adaptarlo a otro subgenero narrativo o a otro idioma con un corpus pequeno.
- Generacion de datos para tests automatizados: crear cadenas de texto deterministas o aleatorias de longitud controlada para probar pipelines de NLP, sistemas de almacenamiento o interfaces de usuario.
- Aplicaciones ludicas y educativas con supervision: generar borradores de cuentos para juguetes o apps infantiles en ingles, siempre con revision humana previa a la publicacion.
- Estudio de estrategias de decodificacion: comparar systematicamente el efecto de `temperature` y `top_k` en la coherencia de textos cortos sobre un modelo de coste despreciable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32, 0,25 GB en fp16/bf16, 0,13 GB en int8 y 0,08 GB en int4 (calculado a partir de los 124 millones de parametros).
- Memoria de cache KV: en torno a 18 MB adicionales en fp16 para una secuencia completa de 512 tokens (12 capas x 12 cabezas x 64 dimensiones x 2 tensores x 512 posiciones x 2 bytes).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como RTX 3050, GTX 1650, RTX 4090 o A100 estan sobredimensionados para este modelo; el uso de A100 o H100 solo tiene sentido para lotes muy grandes o para entrenamiento.
- Cabe en GPU consumer: si, en practicamente todas las GPU de los ultimos diez anos, asi como en GPUs integradas y en CPU.
- Inferencia en CPU: viable, dado el reducido numero de parametros.
- Opciones de despliegue: `transformers` (pipeline y `AutoModelForCausalLM`), text-generation-inference (el modelo esta etiquetado como compatible con TGI y endpoints), vLLM por su soporte de arquitecturas GPT-2, y llama.cpp u Ollama previa conversion a GGUF, conversion que no se distribuye oficialmente en el repositorio.
- Demo publica: disponible en un Space de Gradio sobre ZeroGPU.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Idioma | Disponibilidad |
|---|---|---|---|---|---|---|
| gladios-tiny.story-0.1B | 124.046.592 | 512 tokens | TinyStories (split train completo) | MIT | Ingles | HuggingFace, safetensors |
| GPT-2 small | 124M | 1024 tokens | WebText | MIT | Ingles | Ampliamente disponible |
| TinyStories-125M (roneneldan) | Aprox. 125M | No disponible | TinyStories | No disponible | Ingles | HuggingFace |

La comparacion con GPT-2 small es util porque comparte orden de magnitud de parametros, pero difiere en el dominio: GPT-2 tiene conocimiento general y mayor contexto, mientras que gladios-tiny.story esta especializado en narrativa infantil. Frente a los modelos TinyStories publicados por el autor del dataset, la diferencia principal es la licencia explicita MIT y la publicacion del codigo de entrenamiento en este caso; no se dispone de datos de rendimiento comparativos entre ambos.

## Limitaciones y advertencias

- Alcance muy restringido: solo genera cuentos infantiles cortos en ingles, segun reconoce la propia model card.
- Sin conocimiento general del mundo, sin capacidad de seguir instrucciones y sin habilidades conversacionales.
- Riesgo de alucinacion y de perdida de coherencia cuando el prompt se aleja del estilo de TinyStories.
- Contexto limitado a 512 tokens, insuficiente para documentos largos o dialogos extensos.
- Solo ingles: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Sesgos: no se documenta ningun analisis de sesgos; al entrenarse sobre un corpus de cuentos infantiles sinteticos pueden aparecer sesgos de genero, rol familiar o cultural heredados del dataset.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia; conviene conservar el aviso de copyright.
- No apto para produccion en tareas de decision, atencion al cliente, generacion de codigo o cualquier escenario que requiera precision factual.
- Ausencia total de benchmarks publicados y de mediciones de latencia o throughput, lo que impide estimar su calidad objetiva frente a alternativas.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/plimb/gladios-tiny.story-0.1B
- Demo Gradio (ZeroGPU): https://huggingface.co/spaces/rusher-code/gladios-tiny-story-demo/
- Codigo de entrenamiento en GitHub: https://github.com/plimb-ai/gladios-tiny-story
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper de TinyStories (Eldan y Li, 2023): https://arxiv.org/abs/2305.07759
