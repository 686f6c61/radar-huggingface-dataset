# j-llm/qwen3-8b-novllm-gguf

## Resumen

j-llm/qwen3-8b-novllm-gguf es una publicacion derivada de Qwen3-8B-Base en la que se ha fusionado un adaptador LoRA de bajo rango (r=16, alpha=32) sobre el modelo base y se ha exportado el resultado a formato GGUF para su uso con llama.cpp. El adaptador, identificado como novllm-lora-8b-novel, se aplica unicamente a las capas 0-29 en las proyecciones de atencion y MLP; las capas 30-35 conservan los pesos originales del modelo base. El repositorio tiene 8,8 GB y contiene dos unicos ficheros cuantizados: Q4_K_M (5,03 GB) y Q3_K_S (3,77 GB).

El modelo cuenta con 8.190.735.360 parametros y se distribuye bajo licencia Apache 2.0. Su orientacion parece ser la generacion de texto narrativo, a juzgar por el nombre del adaptador, aunque la model card no documenta el dataset de entrenamiento del LoRA ni el idioma objetivo. Se trata de un modelo derivado con cero descargas y cero valoraciones en el momento de la consulta, sin resultados de evaluacion publicados.

Su relevancia practica es acotada y muy especifica: la model card aporta mediciones reales de rendimiento en hardware de gama muy baja (RX 6400 de 4 GB, WX 2100 de 2 GB, GT 730, Celeron G3930), lo que lo convierte en una referencia util para saber que configuracion de cuantizacion y offload permite ejecutar un modelo de 8B en GPUs con menos de 6 GB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-8B-Base); detalles no confirmados en la model card |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base (extensible a 131.072 con YaRN, segun la ficha de Qwen3-8B-Base); no confirmado en esta model card |
| Tipos de cuantizacion | Q4_K_M y Q3_K_S (unicos ficheros publicados) |
| Idiomas soportados | no disponible (la model card no especifica idiomas; el texto de la ficha esta en japones) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (no se publican safetensors del modelo fusionado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3-8B-Base, un transformer decoder-only denso de 8,19 mil millones de parametros. Sobre ese modelo se aplico un adaptador LoRA de rango 16 y alpha 32, entrenado sobre las proyecciones de atencion y de MLP de las capas 0 a 29, y posteriormente fusionado con la funcion `merge_and_unload()` de la libreria PEFT. Las capas 30 a 35 no recibieron adaptador y mantienen los pesos del modelo base, una decision que la model card atribuye a las especificaciones del propio adaptador.

No se documenta el numero de tokens de entrenamiento del LoRA, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se indica si el adaptador fue entrenado sobre texto en japones, en ingles u otro idioma, aunque el nombre del adaptador (novllm-lora-8b-novel) sugiere un corpus de ficcion narrativa. La conversion a GGUF se realizo con `convert_hf_to_gguf.py` de llama.cpp (build b11384) seguida de `llama-quantize`.

## Capacidades

- Generacion de texto autoregresiva, con la base de conocimiento y el vocabulario multilingue de Qwen3-8B-Base.
- Generacion de texto narrativo o creativo, capacidad inferida del nombre del adaptador fusionado (novllm-lora-8b-novel); no verificada con evaluaciones publicadas.
- Etiquetado como "conversational" en los metadatos del repositorio, lo que sugiere cierto grado de dialogo multi-turno, aunque no se documenta si se aplico una plantilla de chat concreta.
- Soporte de tool calling / function calling: no disponible. El modelo base es la variante Base (preentrenada), no Instruct, por lo que no se debe asumir capacidad de invocacion de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no documentado ni evaluado.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades multilingues: no disponibles de forma explicita; dependen del entrenamiento del LoRA, que no se detalla.

## Casos de uso

- Generacion de ficcion y narrativa: el adaptador fusionado apunta a escritura creativa, por lo que el uso principal es la continuacion y generacion de texto narrativo en local, sin dependencia de APIs externas.
- Ejecucion en hardware de gama muy baja: con la cuantizacion Q3_K_S y offload completo de capas, el modelo corre a 23,2 tokens/s de decodificacion en una RX 6400 de 4 GB, lo que permite desplegarlo en equipos de escritorio antiguos o en nodos de laboratorio con GPU integrada.
- Laboratorio de pruebas de cuantizacion: sirve como caso de estudio reproducible para comparar el compromiso entre calidad (Q4_K_M frente a Q3_K_S) y velocidad en GPUs con entre 2 y 6 GB de VRAM.
- Asistente de escritura sin conexion: al ser un GGUF ejecutable con llama.cpp, puede integrarse en aplicaciones de escritorio con privacidad total de datos, sin enviar texto a servidores externos.
- Generacion de borradores en lote: el throughput de 61,1 tokens/s en fase de prompt permite procesar prompts largos con rapidez para producir variantes de un mismo texto.
- Base para ajuste adicional: al estar publicado como GGUF y derivar de un modelo base con licencia Apache 2.0, puede servir de punto de partida documentado, aunque para reentrenar seria necesario recuperar los pesos en safetensors.
- Evaluacion comparativa de infraestructura: las mediciones de la model card permiten replicar pruebas de offload parcial frente a offload total en llama.cpp con un modelo de 8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mediciones de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion de calidad. El unico dato empirico publicado es el rendimiento en tokens por segundo sobre hardware concreto, que se recoge en la seccion de requisitos de hardware.

## Requisitos de hardware

Mediciones publicadas por el autor (decode/prompt en tokens por segundo, contexto 2048, 64 tokens generados, llama.cpp b11384, equipo TB250-BTC PRO con Celeron G3930):

| Hardware | Ruta | Configuracion | decode | prompt | Notas |
|---|---|---|---|---|---|
| RX 6400 (4 GB) | Vulkan | Q3_K_S, `-ngl 99` (todas las capas) | 23,2 | 61,1 | La configuracion mas rapida; cabe entero en 4 GB |
| RX 6400 + WX 2100 | Vulkan | Q4_K_M, reparto por capas, `-ngl 99` | 10,7 | 3,2 | 6 GB combinados permiten cargar todas las capas |
| RX 6400 | Vulkan | Q4_K_M, `-ngl 24` | 2,4 | 2,6 | El offload parcial queda limitado por la CPU |
| WX 2100 (2 GB) | Vulkan | Q4_K_M, `-ngl 14` | 1,2 | 1,5 | Mismo cuello de botella de CPU |
| GT 730 (1 GB) | CUDA sm_35 | Q4_K_M, `-ngl 4` | 0,36 | 0,39 | Requiere driver 470 y chroot; no apto para uso real |
| Solo CPU | - | Q4_K_M, `-ngl 0` | 0,9 | 1,0 | Celeron de 2 nucleos |
| GT 430 (Fermi) | - | - | no ejecutable | - | La ruta OpenCL no soporta Qwen3 |
| HD 610 (iGPU) | - | - | no ejecutable | - | Error Vulkan ErrorDeviceLost |

- VRAM estimada para los pesos: 3,77 GB con Q3_K_S y 5,03 GB con Q4_K_M, a los que hay que sumar la cache KV. Para la configuracion de Qwen3-8B (36 capas, atencion con consultas agrupadas), la cache KV en FP16 ronda los 0,28 GB a 2048 tokens de contexto, de modo que el total se situa aproximadamente en 4,1 GB (Q3_K_S) y 5,3 GB (Q4_K_M) para ese contexto.
- GPU recomendadas segun la evidencia disponible: RX 6400 (4 GB) para Q3_K_S con offload total; cualquier GPU con 6 GB o mas, o combinacion de dos GPU que sumen 6 GB, para Q4_K_M con offload total. No hay mediciones publicadas en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de 4-6 GB de VRAM (gama de entrada y portatiles). No hay datos para tarjetas de gama alta, aunque por tamano se espera que quepan con holgura.
- Opciones de despliegue: llama.cpp (unica ruta documentada, con soporte Vulkan y CUDA). Al no publicarse safetensors, vLLM, TGI y Ollama no estan verificados; Ollama podria aceptar el GGUF, pero no esta probado por el autor.
- Latencia y throughput: los valores de la tabla anterior. La conclusion destacada por el autor es que el offload parcial de capas es la peor estrategia en esta categoria de tamano: es preferible bajar de cuantizacion para cargar todas las capas en VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks publicados |
|---|---|---|---|---|---|
| j-llm/qwen3-8b-novllm-gguf | 8,19B | 32.768 (heredado del base) | Apache 2.0 | GGUF | No |
| Qwen/Qwen3-8B-Base | 8,2B | 32.768 nativo, 131.072 con YaRN | Apache 2.0 | safetensors, GGUF | Si (los de la familia Qwen3) |
| Qwen/Qwen3-8B (Instruct) | 8,2B | 32.768 nativo, 131.072 con YaRN | Apache 2.0 | safetensors, GGUF | Si |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 131.072 | Llama 3.1 Community License | safetensors, GGUF | Si |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25B | 32.768 | Apache 2.0 | safetensors, GGUF | Si |

La comparacion de rendimiento entre este modelo y las alternativas no esta disponible: no existen evaluaciones publicadas del adaptador novllm ni mediciones directas frente a Qwen3-8B sin ajustar. La diferencia funcional relevante es que este repositorio incorpora un LoRA de dominio especifico pero carece de la fase de instruccion y alineacion de las variantes Instruct, y solo se distribuye en GGUF de baja precision.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: cero descargas y cero valoraciones en el momento de la consulta, y ninguna metrica de calidad publicada. No hay evidencia de que el adaptador mejore al modelo base en ninguna tarea.
- Fusion asimetrica del LoRA: el adaptador solo se aplico a las capas 0-29; las capas 30-35 conservan los pesos base. Esto puede producir un comportamiento menos coherente en las capas finales de la red, sobre todo en tareas generativas largas.
- Es un modelo derivado de la variante Base, no de la Instruct. No cabe esperar seguimiento fiable de instrucciones complejas, formato estructurado ni invocacion de herramientas, salvo que el LoRA lo haya aportado, cosa que no se documenta.
- Riesgo de alucinacion: inherente a los modelos de 8B y no mitigado por ninguna fase de alineacion documentada.
- Idioma y dominio no documentados: se desconoce el idioma de entrenamiento del LoRA y su composicion de datos. Un uso en castellano podria degradar el rendimiento respecto al modelo base.
- Restricciones de licencia: el repositorio declara Apache 2.0 y el modelo base tambien es Apache 2.0, por lo que en principio el uso comercial esta permitido, pero conviene verificar los terminos del adaptador original en j-llm/novllm-lora-8b-novel, que no se detallan.
- Solo GGUF de baja precision: no se publican pesos en safetensors del modelo fusionado, lo que impide servirlo en vLLM o TGI con precision completa y limita el ajuste posterior.
- Plantilla de chat no especificada: no se indica que formato de prompt espera el modelo, por lo que las respuestas conversacionales pueden ser inconsistentes si se usa la plantilla de Qwen3-Instruct por defecto.
- Fecha de publicacion inusual (2026-10-04) en los metadatos, sin explicacion en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/j-llm/qwen3-8b-novllm-gguf
- Adaptador LoRA de origen: https://huggingface.co/j-llm/novllm-lora-8b-novel
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Repositorio de llama.cpp (conversion, cuantizacion e inferencia): https://github.com/ggml-org/llama.cpp
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo; las busquedas devolvieron unicamente resultados no relacionados (articulos enciclopedicos y videos sobre la letra J).
