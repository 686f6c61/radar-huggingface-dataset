# glyd/Qwen3.5-9B-penguin

## Resumen

Qwen3.5-9B-penguin es un artefacto de compresion sin perdida de los pesos del modelo Qwen/Qwen3.5-9B, publicado por el usuario glyd en HuggingFace. No se trata de un modelo nuevo entrenado desde cero, sino de una redistribucion de los pesos originales (commit c2022362) almacenados en el formato propietario de Glyd en su nivel "penguin". El resultado ocupa 11,85 GiB en disco frente a los 16,68 GiB del checkpoint bf16 original, manteniendo la propiedad de que cada peso se decodifica exactamente a su valor bf16, bit a bit.

El problema que resuelve es el almacenamiento y la transferencia de checkpoints de gran tamano sin degradar la calidad numerica. A diferencia de una cuantizacion tradicional con perdida (por ejemplo, formatos de 8, 6,5 o 5,5 bits por peso que introducen error), el nivel penguin promete reconstruccion exacta. El repositorio ocupa 12,7 GB y declara 8.953.803.264 parametros reales (el "Model size" del Hub muestra 11,67B porque cuenta cada byte empaquetado como un parametro).

Es relevante para quien quiera servir Qwen3.5-9B en produccion reduciendo el espacio en disco y el ancho de banda de descarga sin renunciar a la fidelidad de los pesos. La contrapartida es que la decodificacion depende del runtime propietario Glyd, que se distribuye bajo licencia BUSL-1.1 y exige Linux con GPU NVIDIA Ampere o posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (heredada de Qwen/Qwen3.5-9B; no se detalla en la informacion proporcionada) |
| Parametros totales | 8.953.803.264 reales (la model card); 11.670.880.634 segun safetensors del Hub, que cuenta cada byte empaquetado |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Nivel penguin (sin perdida, etiqueta "8-bit"); niveles alternativos kestrel (~6,5 bits por peso) y swift (~5,5 bits por peso) |
| Idiomas soportados | No disponible |
| Licencia | Pesos: apache-2.0 (heredada del modelo base). Herramienta Glyd: BUSL-1.1 |
| Formato de pesos | safetensors dentro del formato propietario Glyd (library_name: glyd) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base Qwen/Qwen3.5-9B en la informacion proporcionada (tipo de transformer, atencion, datos de entrenamiento, tokens vistos, o si hubo RLHF/DPO). El artefacto descrito no entrena ni modifica pesos: aplica una compresion sin perdida sobre los pesos bf16 del checkpoint original, de modo que la decodificacion reproduce exactamente el mismo tensor.

La innovacion tecnica del repositorio es el esquema de compresion por niveles de Glyd. El nivel penguin garantiza reconstruccion bit a bit con una reduccion de aproximadamente un tercio respecto a bf16 (11,85 GiB frente a 16,68 GiB). Los niveles kestrel y swift aplican una compresion mas agresiva de ~6,5 y ~5,5 bits por peso respectivamente, con la perdida numerica que ello implica. El runtime Glyd se encarga de descomprimir los pesos en tiempo de carga.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base Qwen/Qwen3.5-9B en su modalidad de solo texto. Los detalles concretos de razonamiento, codigo o matematicas no se especifican en la informacion proporcionada.
- Vision: no incluida. La model card indica explicitamente que el componente de vision del modelo base queda fuera de esta compresion ("Text only: the model's vision part is not included").
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades especiales: no disponible. El unico rasgo diferencial documentado es la fidelidad bit a bit de los pesos comprimidos.

## Casos de uso

- Servicio de inferencia de texto en produccion con limitaciones de disco: el checkpoint comprimido ocupa 11,85 GiB frente a 16,68 GiB en bf16, lo que reduce el almacenamiento por replica en un cluster de inferencia sin alterar la salida numerica del modelo.
- Distribucion y cacheo de modelos en flotas: al reducir el tamano de descarga aproximadamente un tercio, acelera la propagacion de actualizaciones a nodos de inferencia y el cacheo local en multiples maquinas.
- Entornos con restricciones de ancho de banda: util cuando el despliegue se realiza sobre redes limitadas o en regiones con transferencia costosa, manteniendo intactos los pesos servidos.
- Reproduccion exacta de resultados: al decodificar al valor bf16 original, sirve para pipelines que requieren determinismo numerico estricto y no admiten la varianza introducida por una cuantizacion con perdida.
- Ahorro de espacio en nodos con GPU unica: en una maquina con una sola GPU, el menor footprint en disco libera espacio para multiples versiones del modelo o para escalado de KV cache a nivel de almacenamiento.
- Archivado a largo plazo: conserva los pesos de Qwen3.5-9B de forma reversible para almacenamiento frio, pudiendo reconstruir el checkpoint bf16 exacto cuando sea necesario.
- Comparacion controlada de niveles de compresion: permite contrastar penguin (sin perdida) frente a kestrel (~6,5 bits) y swift (~5,5 bits) midiendo el impacto real de la perdida en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto, y al ser una compresion sin perdida no se documenta una evaluacion diferencial frente a los pesos bf16 originales.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se decodifican a bf16 en memoria. Partiendo de los 16,68 GiB de pesos bf16 mas cache KV y activaciones, se estima un minimo en torno a 20 GB, dependiendo de la longitud de contexto (estimacion propia; no confirmada por el autor).
- GPU recomendadas: NVIDIA Ampere o posterior es un requisito explicito del runtime. Encajan A100 (40/80 GB), H100 y, en el limite, tarjetas de 24 GB como RTX 3090 o RTX 4090 para contextos moderados.
- Compatibilidad con GPU de consumo: cabe en GPU de consumo con 24 GB de VRAM (RTX 3090, RTX 4090) para contextos cortos o medios; en tarjetas de 12-16 GB requeriria recurrir a los niveles con perdida kestrel o swift.
- Requisitos de sistema: Linux con GPU NVIDIA Ampere o posterior, driver 580 o superior, y Glyd 0.29.4 o posterior.
- Opciones de despliegue: runtime Glyd (`glyd run Qwen/Qwen3.5-9B:penguin` o `glyd.from_pretrained(...)` con `pip install "glyd[gpu]"`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | Tipo de compresion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glyd/Qwen3.5-9B-penguin | 8,95B reales | 11,85 GiB | Sin perdida, bit a bit | Pesos apache-2.0 / runtime BUSL-1.1 | HuggingFace, runtime Glyd |
| glyd/Qwen3.5-9B-kestrel | 8,95B reales | No disponible | ~6,5 bits por peso | Pesos apache-2.0 / runtime BUSL-1.1 | HuggingFace, runtime Glyd |
| glyd/Qwen3.5-9B-swift | 8,95B reales | No disponible | ~5,5 bits por peso | Pesos apache-2.0 / runtime BUSL-1.1 | HuggingFace, runtime Glyd |
| Qwen/Qwen3.5-9B (bf16) | 8,95B reales | 16,68 GiB | Sin compresion | apache-2.0 | HuggingFace |

## Limitaciones y advertencias

- Dependencia del runtime propietario: la decodificacion requiere Glyd, distribuido bajo BUSL-1.1. El uso comercial exige adquirir una licencia; solo es gratuito para uso personal y no comercial en equipos propios.
- Restriccion de plataforma: unicamente Linux con GPU NVIDIA Ampere o posterior y driver 580 o superior. No hay soporte documentado para macOS, AMD, CPU ni entornos sin GPU.
- Version minima de runtime: se requiere Glyd 0.29.4 o posterior; versiones anteriores pueden no interpretar el formato.
- Sin vision: el componente multimodal del modelo base queda excluido, por lo que el artefacto es estrictamente de texto.
- Riesgo de alucinacion: heredado del modelo base Qwen3.5-9B; no se documenta en la informacion proporcionada.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican; dependen integramente del modelo base.
- Adopcion nula verificada: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Ficha de modelo escasa: no se aportan benchmarks, composicion del dataset ni notas de entrenamiento, lo que dificulta la evaluacion independiente del modelo base subyacente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/glyd/Qwen3.5-9B-penguin
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Commit del modelo base referenciado: https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a
- Nivel kestrel: https://huggingface.co/glyd/Qwen3.5-9B-kestrel
- Nivel swift: https://huggingface.co/glyd/Qwen3.5-9B-swift
- Sitio de Glyd: https://getglyd.com
- Script de instalacion: https://getglyd.com/install.sh
