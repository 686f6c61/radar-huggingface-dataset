# joshycodes/qwen3-14b-base-fve-msm-protect-s3

## Resumen

qwen3-14b-base-fve-msm-protect-s3 es un ajuste de continued pretraining y posterior SFT sobre Qwen/Qwen3-14B-Base, publicado por el usuario joshycodes como artefacto de investigacion interna. Forma parte de un proyecto de "flourishing-framed character training" (Anthropic Fellows, segun la propia model card) cuyo objetivo es estudiar como se comporta un modelo base de 14.768.307.200 parametros cuando se le somete a una fase de midtrain con un dataset tematico propio y despues a una fase de chat SFT de 13.000 ejemplos. La relevancia es acotada: no es un modelo de proposito general ni un lanzamiento de producto, sino un punto de control experimental que documenta un pipeline concreto de entrenamiento.

El entrenamiento se ejecuto en 4 GPU NVIDIA H200 sobre RunPod, con una semilla fija (20261015) y una cantidad de tokens muy reducida: 10.043.392 tokens en la fase de midtrain y 5.045.572 tokens en la fase de chat. La perdida de midtrain bajo de 2,0693 a 1,6782, mientras que en la fase de chat subio de 0,9086 a 0,9982, un detalle que conviene tener en cuenta al interpretar los resultados.

El repositorio pesa 29,5 GB y solo publica pesos en safetensors. No hay resultados de benchmarks, ni informacion de idiomas soportados, ni pipeline declarado, ni cuantizaciones publicadas. La licencia es `other` con nombre `internal-research`, y la propia model card indica explicitamente que no debe redistribuirse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen/Qwen3-14B-Base) |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la longitud de entrenamiento declarada es de 4096 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | other / internal-research (uso interno de investigacion, no redistribuible) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-14B-Base (revision 0b0bd3732e2c) |
| Tamano del repositorio | 29,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la informacion disponible. El modelo parte de Qwen/Qwen3-14B-Base y conserva su estructura y su numero de parametros (14.768.307.200), de modo que cualquier caracteristica arquitectonica es la heredada del base. El pipeline documentado tiene dos etapas secuenciales: una fase de midtrain (continued pretraining) sobre el dataset `joshycodes/fve-msm-protect`, config `midtrain-qwen-protect`, revision `01540352a9d6`, y una fase posterior de chat SFT sobre `joshycodes/fve-msm-chat-sft-13k`, revision `7cba8972c8ae`.

Los hiperparametros son identicos en learning rate entre ambas fases (1e-05), con `seq_len` de 4096 y una sola epoca. La diferencia esta en el `grad_accum`: 4 en midtrain (micro_batch 2, batch efectivo 8) y 8 en chat (micro_batch 2, batch efectivo 16). El volumen de datos es muy bajo para un modelo de este tamano: 10.043.392 tokens en midtrain, con perdida de 2,0693 a 1,6782, y 5.045.572 tokens en chat, con perdida de 0,9086 a 0,9982. El aumento de perdida en la fase de chat es un dato relevante: puede indicar sobreajuste al formato de chat, olvido catastrofico del base o ruido estadistico por el reducido numero de tokens. El run se ejecuto en 4x NVIDIA H200 en RunPod, con el launcher `a0afb77669ae` del repositorio `flourishing-training`, y la semilla 20261015. La model card menciona un script de evaluacion (`uv run eval.py --model ... --eval all`) pero no publica sus resultados.

## Capacidades

- Generacion de texto autoregresiva: capacidades heredadas del modelo base Qwen3-14B-Base; no se documentan capacidades especificas anadidas por el ajuste.
- Fase de chat SFT: el modelo ha sido entrenado sobre un dataset de conversacion de 13.000 ejemplos, por lo que se espera que responda en formato de dialogo, aunque no se documenta la calidad resultante.
- Entrenamiento orientado a "character training": el objetivo declarado del proyecto es el modelado de caracter o persona bajo un marco de "flourishing", no la mejora de capacidades tecnicas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Vision, audio o modalidades adicionales: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible; el modelo parte de la variante Base, no de una variante instruct con modo de razonamiento documentado.

## Casos de uso

- Investigacion sobre entrenamiento de caracter y persona: el modelo sirve como punto de control para estudiar como una fase de midtrain tematica seguida de un SFT de chat modifica el comportamiento de un base de 14.768.307.200 parametros. Es su proposito declarado y el unico uso claramente respaldado por la documentacion.
- Reproducibilidad de pipelines de continued pretraining: con semilla, revisiones de dataset, hiperparametros y commit del launcher documentados, permite reproducir o auditar el pipeline completo en un entorno equivalente de 4 GPU H200.
- Estudio de olvido catastrofico y sobreajuste: la subida de perdida en la fase de chat (0,9086 a 0,9982) lo convierte en un caso util para analizar que ocurre cuando se aplica SFT con muy pocos tokens (5,04 M) sobre un modelo de 14,8 B de parametros.
- Comparacion de datasets de estilo "flourishing": al existir variantes con el sufijo `s3`, permite comparar el efecto de distintas configuraciones de midtrain sobre el mismo base y los mismos hiperparametros.
- Evaluacion de seguridad y alineamiento en entornos controlados: como artefacto de investigacion con licencia interna, es adecuado para experimentos de red teaming sobre rasgos de personalidad inducidos por entrenamiento, siempre dentro del marco permitido por su licencia.
- Base para LoRA o adaptadores experimentales: al estar en safetensors y con licencia de uso interno, puede servir como punto de partida para experimentos internos de ajuste eficiente, sin expectativa de calidad de produccion.
- Generacion de dialogos sinteticos internos: su fase de chat SFT permite generar conversaciones de estilo consistente para construir datasets auxiliares, asumiendo la falta total de datos de calidad publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta perdidas de entrenamiento:

| Fase | Dataset | Revision | Tokens vistos | Perdida |
|---|---|---|---|---|
| Midtrain | joshycodes/fve-msm-protect (config midtrain-qwen-protect) | 01540352a9d6 | 10.043.392 | 2,0693 → 1,6782 |
| Chat | joshycodes/fve-msm-chat-sft-13k | 7cba8972c8ae | 5.045.572 | 0,9086 → 0,9982 |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- Entrenamiento documentado: 4x NVIDIA H200 (RunPod, fellows worker), con `seq_len` 4096, `micro_batch` 2 y `grad_accum` 4 en midtrain y 8 en chat.
- VRAM estimada para inferencia en bf16/fp16: aproximadamente 29,5 GB solo para pesos (coincide con el tamano del repositorio), mas overhead de activaciones y cache KV. En la practica requiere 40 GB o mas para secuencias cortas, y 80 GB para contextos largos o batches mayores.
- VRAM estimada en cuantizacion de 8 bits: en torno a 15-16 GB para pesos, mas overhead; en 4 bits, en torno a 8-9 GB para pesos. Estas cifras son estimaciones aritmeticas a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para inferencia sin cuantizar. En consumer, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) solo podrian ejecutarlo con cuantizacion de 4 bits, y con margen ajustado para contextos largos. Una GPU de 16 GB queda descartada incluso en 4 bits si se necesita contexto amplio.
- Opciones de despliegue: al publicarse unicamente safetensors, las rutas naturales son vLLM, TGI o transformers con `device_map`. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requeririan convertir los pesos previamente.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| joshycodes/qwen3-14b-base-fve-msm-protect-s3 | 14.768.307.200 | no disponible | other / internal-research | HuggingFace, 0 descargas | Ajuste experimental, sin benchmarks |
| Qwen/Qwen3-14B-Base | 14.768.307.200 (mismo punto de partida) | no disponible en la informacion proporcionada | Apache 2.0 (segun el modelo base referenciado) | Publico en HuggingFace | Modelo base sin ajustar |
| Qwen/Qwen3-14B | misma familia y orden de parametros | no disponible en la informacion proporcionada | Apache 2.0 (segun el modelo base referenciado) | Publico en HuggingFace | Variante orientada a instrucciones; no verificada en la informacion proporcionada |
| Otros ajustes derivados de Qwen3-14B-Base | 14.768.307.200 | no disponible | variable | variable | No disponible |

La comparativa es necesariamente limitada: el modelo no publica benchmarks, contexto, idiomas ni cuantizaciones, de modo que la unica dimension comparable con rigor es el numero de parametros y la licencia. Cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- Licencia `internal-research`: la model card indica explicitamente "Private research artifact — do not redistribute". No esta permitido su uso comercial ni su redistribucion, y la licencia se registra como `other`, no como una licencia estandar de codigo abierto.
- Sin benchmarks: no hay ninguna evaluacion publicada, ni propia ni de terceros. No se puede afirmar nada sobre su calidad en tareas estandar.
- Volumen de entrenamiento muy bajo: 10,04 M tokens de midtrain y 5,04 M tokens de chat para un modelo de 14,8 B de parametros. Es un ajuste ligero que probablemente no altera de forma sustancial las capacidades del base.
- Perdida de chat creciente: la perdida paso de 0,9086 a 0,9982 durante la fase de chat. Conviene tratarlo como una senal de posible inestabilidad, sobreajuste al formato o degradacion, y no como un resultado neutro.
- Idiomas no declarados: se desconoce el soporte multilingue real tras el ajuste; los datasets tienen nombres en ingles y el SFT podria haber estrechado el registro linguistico.
- Riesgo de alucinacion: no cuantificado ni evaluado. Al ser un ajuste sobre un base, conserva los riesgos de alucinacion del modelo original, potencialmente modulados por el SFT.
- Ausencia de pipeline declarado: la etiqueta de pipeline aparece como no disponible, lo que dificulta el uso inmediato con `transformers` sin inspeccionar los ficheros de configuracion.
- Sin informacion sobre sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o comportamiento en dominios sensibles.
- Contexto de entrenamiento de 4096 tokens: no hay evidencia de que el modelo conserve la ventana de contexto ampliada del base, ni de que se haya validado con secuencias largas.
- Adopcion nula: 0 descargas y 0 likes. No hay comunidad que haya validado el artefacto ni reportado problemas.
- Artefacto de investigacion cerrada: el proyecto se describe como parte de un programa de Fellows, con run y commit internos, lo que limita la trazabilidad externa del pipeline completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-14b-base-fve-msm-protect-s3
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B-Base
- Dataset de midtrain: https://huggingface.co/datasets/joshycodes/fve-msm-protect
- Dataset de chat SFT: https://huggingface.co/datasets/joshycodes/fve-msm-chat-sft-13k
- Repositorio `flourishing-training` (referenciado en la model card mediante el commit `a0afb77669ae`): no se proporciona URL en la informacion disponible
- Paper, blog o demo: no disponible
- La busqueda web realizada no devolvio ningun enlace tecnico relacionado con este modelo; los resultados obtenidos eran de dominios sin relacion con el contenido y se han descartado.
