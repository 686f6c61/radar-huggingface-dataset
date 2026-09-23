# francesca9805/ind-latn-100mb-ppt-Dp-10mb-packed-bfd_seed10

## Resumen

francesca9805/ind-latn-100mb-ppt-Dp-10mb-packed-bfd_seed10 es un modelo de generación de texto de 124.770.816 parámetros (unos 124,8 M) publicado por el usuario francesca9805 en Hugging Face. Es un ajuste fino mediante SFT del modelo base goldfish-models/ind_latn_100mb, un modelo monolingüe de la familia Goldfish orientado al indonesio en escritura latina (según se deduce del identificador ind_latn del modelo base). La etiqueta gpt2 de la ficha indica una arquitectura transformer decoder-only de tipo GPT-2, con pesos en formato safetensors y licencia no especificada.

El nombre del modelo codifica los parámetros del experimento: idioma (ind-latn), tamaño del corpus del modelo base (100mb), variantes de preprocesado de datos (ppt, packed, Dp), una configuración concreta (bfd) y la semilla aleatoria (seed10). El entrenamiento se realizó con TRL 0.23.0 sobre un run de Weights & Biases alojado en la organización f-padovani-university-of-groningen, dentro del proyecto denominado new-tokenizers, lo que sitúa el modelo en una línea de investigación sobre tokenizadores y entrenamiento de modelos monolingües pequeños en la Universidad de Groningen.

Su relevancia es experimental, no de producción: sirve para medir el efecto del ajuste supervisado y de distintas configuraciones de empaquetado de datos sobre modelos monolingües de tamaño reducido. La documentación es mínima (la model card se genera automáticamente a partir de TRL) y no se publican datos de idiomas soportados, longitud de contexto, licencia ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia GPT-2 (etiqueta gpt2) |
| Parámetros totales | 124.770.816 (124,8 M) |
| Parámetros activos | no aplica: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible en la ficha; el identificador ind_latn indica indonesio en escritura latina |
| Licencia | no disponible (la model card incluye un campo "licence: license" sin contenido real) |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | goldfish-models/ind_latn_100mb |
| Tamaño del repositorio | 0,3 GB |
| Framework de entrenamiento | TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4, Tokenizers 0.22.1 |
| Método de ajuste | SFT (supervised fine-tuning) |
| Descargas / likes | 179 descargas, 0 likes |
| Fecha de creación (metadatos HF) | 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de tipo GPT-2, con 124,8 M de parámetros y pesos almacenados en safetensors. No se dispone de la configuración concreta (número de capas, dimensiones ocultas, cabezas de atención, tamaño de vocabulario) ni de la longitud de contexto en la información proporcionada. El modelo base, goldfish-models/ind_latn_100mb, pertenece a la familia Goldfish de modelos monolingües pequeños, y el sufijo 100mb del identificador apunta a un corpus de entrenamiento del orden de 100 MB, aunque ese dato no se confirma en la ficha.

El entrenamiento se realizó mediante SFT con TRL 0.23.0, partiendo del modelo base y generando un nuevo checkpoint. No se especifican el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni hiperparámetros (learning rate, batch size, epochs). El identificador incluye el término packed, que en el contexto de TRL y de entrenamiento eficiente suele indicar empaquetado de secuencias para maximizar la ocupación del contexto, y la etiqueta bfd junto con el número de semilla (seed10), que sugieren una ablación reproducible dentro de una batería de experimentos. El run de entrenamiento está registrado en Weights & Biases bajo el proyecto new-tokenizers.

## Capacidades

- Generación de texto autoregresiva en el idioma del modelo base (indonesio en escritura latina, según el identificador), con el pipeline text-generation de Transformers.
- Formato conversacional: el ejemplo de la model card invoca el pipeline con una lista de mensajes con rol user, lo que indica que el checkpoint acepta entradas con plantilla de chat, aunque no se documenta la plantilla exacta.
- Ajuste posterior: al ser un modelo pequeño y de pesos abiertos en safetensors, es viable reentrenarlo o afinarlo para tareas concretas (clasificación, extracción, resumen) con recursos limitados.
- Compatibilidad declarada con text-generation-inference y endpoints_compatible, lo que permite servirlo a través de infraestructura compatible con la API de Hugging Face.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento explícito.
- Capacidad multilingüe: no documentada. Por el diseño monolingüe del modelo base, el rendimiento fuera del indonesio es previsiblemente bajo.

## Casos de uso

- Completado y generación de texto en indonesio: el modelo puede emplearse para redactar o continuar textos breves en este idioma, aprovechando que el modelo base fue entrenado específicamente sobre corpus indonesio en escritura latina.
- Investigación en tokenización: dado que procede del proyecto new-tokenizers y codifica una configuración concreta (packed, seed10), es adecuado para comparar el efecto de distintas variantes de tokenizador y empaquetado sobre la calidad del texto generado.
- Ablaciones de ajuste supervisado: al ser un SFT de un checkpoint conocido, permite aislar el efecto del SFT comparando directamente contra goldfish-models/ind_latn_100mb con los mismos prompts y métricas de perplejidad.
- Generación de datos sintéticos para aumentar corpus indonesios: con 124,8 M de parámetros, se puede ejecutar en lote sobre CPU o GPU modesta para producir textos de relleno o ejemplos adicionales en tareas de baja exigencia.
- Puntuación y filtrado de textos: el modelo puede calcular log-probabilidades o perplejidad para clasificar, priorizar o descartar documentos en indonesio dentro de un pipeline de limpieza de datos.
- Prototipado y docencia: su tamaño (0,3 GB de repositorio) permite cargarlo en un portátil o en un cuaderno de Colab para demostrar el ciclo completo de fine-tuning con TRL sin infraestructura dedicada.
- Pruebas de cuantización y despliegue en el borde: sirve como banco de pruebas para medir latencia y consumo de memoria tras convertir los pesos a GGUF o cuantizarlos a int8, aunque el repositorio no incluya esas conversiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra), y la única referencia externa con datos numéricos encontrada corresponde a un modelo distinto de la misma familia (fpadovani/ind-latn-10mb-ppt-Dp-100mb_seed455, con 39,1 M de parámetros y 0,1 GB de VRAM estimada según LLM Explorer), no a este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 0,5 GB en fp32, 0,25 GB en fp16/bf16, 0,13 GB en int8 y 0,07 GB en 4 bits. Hay que sumar activaciones y caché KV, que dependen de la longitud de contexto y del tamaño de lote, no especificados.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en GPU de portátil y en GPU integradas modernas. También es viable la inferencia en CPU para lotes pequeños.
- GPU de centro de datos (A100, H100, L40S) no son necesarias, pero permitirían lotes muy grandes y alto throughput si se despliega como servicio.
- Opciones de despliegue: transformers y su pipeline text-generation, text-generation-inference (etiqueta tgi), endpoints compatibles con la API de Hugging Face (etiqueta endpoints_compatible) y proveedores externos que ya listan la familia de modelos (por ejemplo FriendliAI). Para llama.cpp u Ollama sería necesario convertir previamente los pesos a GGUF, conversión que no se publica en el repositorio.
- Latencia y throughput: no disponibles. Con 124,8 M de parámetros, la generación es de baja latencia en GPU moderna y aceptable en CPU, pero no se han publicado medidas concretas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/ind-latn-100mb-ppt-Dp-10mb-packed-bfd_seed10 | 124,8 M | no disponible | no disponible | Hugging Face, safetensors | Objeto de esta ficha; SFT con TRL sobre goldfish-models/ind_latn_100mb |
| goldfish-models/ind_latn_100mb | no disponible | no disponible | no disponible | Hugging Face | Modelo base monolingüe de la familia Goldfish; punto de partida del ajuste |
| fpadovani/ind-latn-100mb-ppt-Dp-10mb_seed10 | no disponible | no disponible | no disponible | Hugging Face | Variante de la misma configuración con distinta semilla y autoría |
| fpadovani/ind-latn-10mb-ppt-Dp-100mb_seed455 | 39,1 M | no disponible | no disponible | Hugging Face, según LLM Explorer ~0,1 GB de VRAM | Configuración cruzada de tamaños de corpus; la mitad de parámetros aproximadamente |
| nld-latn-100mb-ppt-Dp-10mb-packed-bfd_seed10 | no disponible | no disponible | no disponible | Hugging Face, listado en FriendliAI | Variante para neerlandés en escritura latina |
| eng-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10 | no disponible | no disponible | no disponible | Hugging Face, listado en FriendliAI | Variante para inglés en escritura latina |

No se han localizado comparativas con modelos de propósito general de tamaño similar (por ejemplo, GPT-2 small, Pythia-160M o modelos multilingües pequeños), ni resultados que permitan situar este checkpoint frente a ellos en calidad de generación.

## Limitaciones y advertencias

- Licencia no especificada: la model card contiene un campo "licence: license" sin valor real y los metadatos de Hugging Face no indican licencia. No hay autorización explícita de uso comercial, por lo que su explotación en producción es jurídicamente arriesgada. Además, la licencia del modelo base goldfish-models/ind_latn_100mb condiciona el uso derivado y debe verificarse por separado.
- Idiomas no declarados: la ficha no lista idiomas soportados. El identificador apunta a indonesio en escritura latina, pero no hay confirmación ni evaluación de cobertura fuera de ese ámbito.
- Riesgo de alucinación: al ser un modelo pequeño entrenado sobre corpus limitados (del orden de 100 MB en el modelo base, según el nombre), la generación de hechos puede ser poco fiable y es esperable que invente información.
- Sesgos: se desconoce la composición del dataset de entrenamiento, por lo que no es posible auditar sesgos de género, religión, etnia o sesgos culturales propios del corpus indonesio empleado.
- Documentación insuficiente: no se publican hiperparámetros de entrenamiento, número de tokens, plantilla de chat exacta ni longitud de contexto. El ejemplo de la model card usa un prompt en inglés sobre una máquina del tiempo, sin garantía de que el modelo responda de forma coherente.
- Validación comunitaria nula: 179 descargas y 0 likes indican que el modelo no ha sido evaluado ni reproducido por terceros.
- Formato único: solo hay pesos safetensors; no hay versiones GGUF, GPTQ, AWQ ni cuantizaciones listas para llama.cpp u Ollama, lo que obliga a realizar la conversión por cuenta propia.
- Fecha de creación registrada como septiembre de 2026 en los metadatos, posterior a la fecha del modelo base y a la publicación de las versiones de las librerías citadas; conviene verificar la coherencia temporal del repositorio antes de integrarlo en un pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/ind-latn-100mb-ppt-Dp-10mb-packed-bfd_seed10
- Modelo base: https://huggingface.co/goldfish-models/ind_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/73nd87yl
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante neerlandesa en FriendliAI: https://friendli.ai/models/francesca9805/nld-latn-100mb-ppt-Dp-10mb-packed-bfd_seed10
- Variante inglesa en FriendliAI: https://friendli.ai/models/francesca9805/eng-latn-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Ficha de modelo relacionado en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Find-latn-10mb-ppt-Dp-100mb_seed455,5qG8R1FZFYaEV34xzuKm9U
- Ficha de modelo relacionado en free2aitools: https://free2aitools.com/model/fpadovani/ind-latn-100mb-ppt-dp-10mb_seed10
