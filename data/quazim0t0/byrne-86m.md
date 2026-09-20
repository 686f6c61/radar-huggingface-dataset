# Quazim0t0/Byrne-86M

## Resumen

Byrne-86M es un modelo de lenguaje de tipo chat publicado por Dean Byrne (usuario Quazim0t0) en HuggingFace, desarrollado desde cero durante la hackathon "Small Models, Big Adventures" con creditos de computo de Modal. La model card lo describe como un `SpikeWhaleLM` de aproximadamente 86M de parametros, aunque el recuento real de pesos en safetensors asciende a 96.944.515 parametros, con 16 capas, hidden size 640, ventana de contexto de 4.096 tokens, vocabulario de 16.512 entradas y embeddings atados (tied embeddings). Su interes no es la capacidad de razonamiento, sino la exploracion arquitectonica: combina Multi-head Latent Attention (MLA) con compresion LoRA de las proyecciones Q y O, memoria de n-gramas ("engram"), capas de hash-lookup, hyper-connections con enrutado Sinkhorn, refinamiento HRM y un cabezal de Multi-Token Prediction.

El modelo se distribuye como checkpoint de chat (denominado "OPD v2" en la model card) y tiene un checkpoint base asociado, Byrne-86M-Base. La revision actual aplica una reparacion del modulo engram seguida de un SFT corto de instrucciones y formato sobre una mezcla 60/25/15 de smoltalk, ejemplos de GSM8K-train con formato "#### N" y ejemplos estilo MMLU con "Answer: \<letter\>". Segun la model card, ese SFT mejora la fluidez conversacional y la adherencia al formato de salida (formato MMLU de 0,918 a 0,951 y formato "####" de GSM8K de 0,420 a 0,815) sin aumentar la precision real en los benchmarks.

Es relevante ahora como pieza de investigacion reproducible de bajo coste: un transformer pequeno con innovaciones de atencion y memoria prestadas de modelos mucho mayores (MLA y MTP al estilo DeepSeek-V3, hyper-connections), entrenado con un tokenizador propio no BPE y publicado bajo licencia Apache-2.0. Por contra, sus resultados en tareas de conocimiento y razonamiento estan cerca del suelo estadistico para su tamano, y la adopcion real es minima (39 descargas y 1 like en el momento de redactar esta ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpikeWhaleLM (transformer decoder-only con MLA, engram de n-gramas, hash-lookup, hyper-connections, HRM refine y MTP) |
| Parametros totales | 96.944.515 (recuento real en safetensors); la model card indica "~86M" |
| Parametros activos | no aplica (FFN denso; el bloque admite MoE pero esta desactivado en esta release) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en safetensors; no se documentan versiones GGUF, AWQ, GPTQ ni cuantizaciones oficiales) |
| Idiomas soportados | ingles (en); tokenizador byte-level, sin cobertura multilingue declarada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers; requiere `trust_remote_code=True`) |
| Tamano del repositorio | 1,2 GB |
| Capas / hidden size | 16 capas / 640 |
| Vocabulario | 16.512, embeddings atados |
| Tag de pipeline | text-generation (tambien etiquetado como feature-extraction) |

## Arquitectura y entrenamiento

El bloque es un transformer decoder-only denominado `SpikeWhaleLM`. La atencion usa Multi-head Latent Attention con compresion LoRA de rango 128 en las proyecciones Q y O, 10 cabezales de consulta y un unico cabezal KV (MQA). Cada cabezal divide sus dimensiones en RoPE dim 16 y NoPE dim 48, y se aplica QK-norm. Ademas de la atencion, el modelo incorpora un modulo "engram": una tabla con puerta que hashea n-gramas locales (hasta trigramas) en 4.096 filas y mezcla el resultado de vuelta en el residual; dos capas de hash-lookup que actuan como features direccionables por contenido junto a los embeddings de token; y hyper-connections, es decir, residuales aprendidos de anchura expandida con enrutado Sinkhorn en lugar de una suma simple. Antes del cabezal de salida se aplica un paso latente extra de refinamiento HRM, y durante el entrenamiento se anade un cabezal de Multi-Token Prediction estilo DeepSeek-V3 que predice mas de un token siguiente. El FFN es denso: aunque el bloque puede configurarse como MoE, el MoE esta desactivado en esta publicacion. En cuanto a la variante JEPA: Byrne es Non-JEPA, con `use_hrm_refine=True` y `use_jepa=False`; la model card indica que el modelo hermano Escarda anade JEPA sobre HRM.

El tokenizador es propio (`SpikeTokenizer`), de tipo byte-level length-max con emparejamiento voraz de la coincidencia mas larga, no BPE. El texto se convierte a UTF-8, luego a bytes latin-1 y se busca la clave mas larga del vocabulario que encaje. Es "ChatML-aware" y define como especiales atomicos `<|im_start|>`, `<|im_end|>`, `<think>`/`</think>`, `<begin_solution>`/`<end_solution>`, marcadores de llamadas a herramientas y `<bos>`/`<eos>`/`<pad>`/`<unk>`. Sobre los datos de entrenamiento, la informacion disponible no detalla el numero de tokens ni la composicion completa del corpus del preentrenamiento; solo se especifica el SFT posterior: una mezcla 60/25/15 de HuggingFaceTB/smoltalk, GSM8K-train con razonamiento en formato "#### N" y ejemplos estilo MMLU con "Answer: \<letter\>", aplicada tras una reparacion del modulo engram descrita como preservadora de comportamiento. No se mencionan RLHF ni DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno basica en ingles, con soporte de plantilla ChatML.
- Razonamiento y matematicas: muy limitados; la propia model card advierte que la precision en benchmarks sigue cerca del suelo y que el SFT no anade capacidad de razonamiento (ArithMark-2.0 con acc 0,3096).
- Generacion de codigo: no se documenta ninguna capacidad especifica ni resultados en benchmarks de codigo.
- Tool calling / function calling: el tokenizador define marcadores atomicos para llamadas a herramientas, por lo que el formato esta previsto a nivel de tokenizer, pero no se publican evaluaciones de fiabilidad de tool calling.
- Agentes y razonamiento multi-paso: existen marcadores de "thinking" (`<think>`) y de solucion (`<begin_solution>`), lo que indica que el formato fue contemplado en el diseno; no hay evidencia publicada de rendimiento agentico.
- Multilingue: no. Solo ingles declarado, con tokenizador byte-level que degradaria en otros idiomas.
- Capacidades especiales: modulo de memoria de n-gramas (engram) y capas de hash-lookup para recuperacion de patrones locales; cabezal MTP solo en entrenamiento; uso alternativo como extractor de caracteristicas (tag `feature-extraction`).
- Sin vision ni audio: no se declaran modalidades adicionales.

## Casos de uso

- Investigacion en arquitecturas de atencion: el modelo permite reproducir y ablar MLA con compresion LoRA de rango 128 y MQA de un solo cabezal KV en un presupuesto de menos de 100M de parametros, util para estudiar el compromiso entre compresion de KV y calidad.
- Estudio de memorias de n-gramas: el modulo engram (hasta trigramas, 4.096 filas) y las dos capas de hash-lookup son un banco de pruebas de bajo coste para comparar recuperacion explicita de n-gramas frente a parametros densos, incluyendo la reparacion de engram descrita en la revision actual.
- Experimentacion con residuales alternativos: las hyper-connections con enrutado Sinkhorn sustituyen la suma residual estandar, lo que permite medir si ese esquema mejora la propagacion de gradiente en redes de 16 capas y 640 de hidden.
- Evaluacion de tokenizadores no BPE: `SpikeTokenizer` (byte-level, coincidencia mas larga voraz, 16.512 entradas) puede compararse contra BPE con el mismo vocabulario para medir fertilidad, robustez ante ruido y comportamiento en dominios con jerga o identificadores.
- Prototipado y docencia en entornos sin GPU: con menos de 100M de parametros el modelo cabe en CPU o en cualquier GPU de consumo, lo que lo hace apto para aulas, talleres y demos de arquitecturas personalizadas con `trust_remote_code=True`.
- Extraccion de caracteristicas y estudios de representacion: al estar etiquetado como `feature-extraction`, sus estados ocultos pueden usarse para sondas lineales (por ejemplo, sobre BLiMP) y para analizar que informacion linguistica codifica un modelo entrenado con vocabulario byte-level.
- Pruebas de formato de salida en pipelines de evaluacion: el SFT esta disenado para preservar formatos de benchmark (MMLU "Answer: \<letter\>", GSM8K "#### N"), lo que lo convierte en un sujeto de prueba para verificar arneses de evaluacion y parsers.
- Punto de partida para ablaciones: al publicarse un checkpoint base (Byrne-86M-Base) y una variante con JEPA (Escarda), sirve como referencia para aislar el efecto de cada componente arquitectonico.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluacion zero-shot de opcion multiple, verosimilitud de continuacion; `acc_norm` normalizado por longitud en bytes):

| Tarea | acc | acc_norm |
|---|---|---|
| arc_easy | 0,3670 | 0,3468 |
| arc_challenge | 0,1894 | 0,2355 |
| hellaswag | 0,2815 | 0,2858 |
| winogrande | 0,5201 | no disponible |
| piqa | 0,5756 | 0,5593 |
| openbookqa | 0,1460 | 0,2440 |
| boolq | 0,3865 | no disponible |

Otras metricas declaradas:

| Metrica | Valor |
|---|---|
| ArithMark-2.0 (acc oficial) | 0,3096 |
| WikiText-2 byte_ppl (menor es mejor) | 2,6839 |
| BLiMP (mayor es mejor) | 0,7033 |
| MMLU acc antes -> despues del SFT | 0,260 -> 0,254 |
| MMLU adherencia de formato antes -> despues del SFT | 0,918 -> 0,951 |
| GSM8K formato "####" antes -> despues del SFT | 0,420 -> 0,815 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos en estas mismas tareas, ni datos de HumanEval, MT-Bench u otros benchmarks de instrucciones.

## Requisitos de hardware

- Parametros: 96.944.515. A bf16/fp16 los pesos ocupan aproximadamente 194 MB; en fp32, unos 388 MB. El repositorio completo ocupa 1,2 GB, probablemente por incluir mas de un checkpoint o pesos en mayor precision. Estas cifras son calculos a partir del recuento de parametros, no datos publicados por el autor.
- VRAM estimada para inferencia: menos de 1 GB en bf16 incluyendo cache KV para 4.096 tokens (cache muy reducida gracias a MQA con un unico cabezal KV). En fp32, en torno a 0,5-1 GB. Son estimaciones, no cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no se requiere A100 ni H100. Cabe holgadamente en RTX 3060, RTX 4090, e incluso en GPUs integradas y en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las actuales; tambien en Apple Silicon y en CPU sola para inferencia interactiva.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `trust_remote_code=True` es la via documentada. Al ser arquitectura de codigo personalizado (`custom_code`), no hay confirmacion de soporte en vLLM, llama.cpp, Ollama o TGI; no se documentan convertidores a GGUF ni integraciones con esos motores. Cualquier intento de desplegarlo fuera de `transformers` requeriria portar `SpikeWhaleLM` y `SpikeTokenizer`.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparativas de Byrne-86M frente a otros modelos, ni resultados de terceros en las mismas tareas. Los unicos puntos de referencia internos son el checkpoint base y la variante con JEPA del mismo autor:

| Modelo | Parametros | Contexto | Componentes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Byrne-86M | 96,9M (recuento real) | 4.096 | MLA + engram + hash-lookup + hyper-connections + HRM, sin JEPA | Apache-2.0 | HuggingFace, 39 descargas, 1 like |
| Byrne-86M-Base | no disponible | no disponible | checkpoint base previo al SFT/chat | no disponible | HuggingFace (enlazado desde la model card) |
| Escarda | no disponible | no disponible | igual que Byrne pero con JEPA activado sobre HRM | no disponible | mencionado en la model card, sin enlace directo en la informacion disponible |

Comparar estos resultados con modelos de tamano similar de otros autores (por ejemplo, familias de 70M-135M parametros) no es posible con los datos proporcionados: no hay numeros de benchmark de esos modelos en la informacion disponible ni evaluaciones cruzadas publicadas por el autor.

## Limitaciones y advertencias

- Precision muy baja en conocimiento y razonamiento: ARC-Challenge 0,1894 de acc, OpenBookQA 0,1460 de acc, BoolQ 0,3865 de acc. La propia model card afirma que la precision en benchmarks "permanece cerca del suelo" para un modelo de este tamano y que el SFT no anade razonamiento.
- Riesgo alto de alucinacion y de respuestas incorrectas con apariencia plausible: es un modelo de menos de 100M de parametros con preentrenamiento no documentado en cuanto a volumen de tokens; no debe usarse como fuente de hechos.
- El SFT aplicado es de fluidez y formato, no de capacidad: mejora la adherencia al formato (MMLU 0,918 -> 0,951; GSM8K "####" 0,420 -> 0,815) mientras que la precision en MMLU baja ligeramente (0,260 -> 0,254). No debe interpretarse el aumento de formato como mejora de razonamiento.
- Idioma: solo ingles declarado. El tokenizador byte-level puede degradar notablemente la calidad en castellano u otros idiomas, y no hay evaluaciones multilingues.
- Contexto limitado: 4.096 tokens. No es adecuado para documentos largos, analisis de repositorios ni conversaciones muy extensas sin truncado o resumen.
- Codigo de confianza obligatorio: la carga requiere `trust_remote_code=True`, ya que la arquitectura y el tokenizador son personalizados. Esto implica ejecutar codigo del autor; conviene revisar `spike_tokenizer.py` y la implementacion del modelo antes de usarlo en entornos productivos.
- Compatibilidad limitada de despliegue: sin soporte conocido en vLLM, llama.cpp, Ollama o TGI y sin versiones cuantizadas publicadas, la integracion en produccion exigiria trabajo adicional de portabilidad.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion y conservacion de avisos, sin restricciones de campo de uso declaradas. No obstante, la falta de garantias y la calidad del modelo hacen desaconsejable su uso comercial directo.
- Adopcion y soporte minimos: 39 descargas y 1 like; no hay comunidad, issues documentados ni mantenimiento garantizado. El estado "experimental" esta declarado en los propios tags.
- Caveat de recuento de parametros: la model card indica "~86M" mientras que el recuento real en safetensors es de 96.944.515. Conviene usar la cifra real para planificacion de recursos.
- La reparacion del engram se describe como "preservadora de comportamiento", pero se aplica sobre un checkpoint base cuya evaluacion previa no se detalla; no hay verificacion independiente de ese extremo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Quazim0t0/Byrne-86M
- Checkpoint base: https://huggingface.co/Quazim0t0/Byrne-86M-Base
- Dataset de evaluacion ArithMark-2.0: https://huggingface.co/datasets/AxiomicLabs/ArithMark-2.0
- Dataset de SFT smoltalk: HuggingFaceTB/smoltalk (referenciado en la model card)
- Dataset GSM8K-train (referenciado en la model card para el SFT con formato "#### N")
- Paper, blog tecnico o repositorio adicional del autor: no disponible en la informacion proporcionada
- Demo o Space asociado: no disponible

Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo Byrne-86M (corresponden a guias de eliminacion de software no deseado en distintos idiomas). No se ha encontrado documentacion externa, paper ni articulo tecnico sobre este modelo mas alla de su model card en HuggingFace.
