# nace-ai/LongCat-2.5-KQuant-IQ1_S

## Resumen

LongCat-2.5 KQuant IQ1_S es una cuantizacion de muy bajo bit (1 bit por peso en las proyecciones de los expertos enrutados) del modelo LongCat-2.5 de Meituan, publicada por Nace.AI en formato GGUF para llama.cpp. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 1,66 billones de parametros totales (1.78T segun la model card del autor, discrepancia que se detalla mas abajo), y esta cuantizacion reduce el peso de 3,56 TB en BF16 a 503 GB repartidos en 40 ficheros, lo que permite ejecutarlo en hardware de gama alta para centros de datos.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de cuantizacion extrema (IQ1_S con importance matrix) aplicada a un MoE de escala frontera; por otro, advierte de que el modelo requiere un build de llama.cpp parcheado especificamente para la arquitectura LongCat-2.5 y su tokenizer, por lo que no funciona con llama.cpp estandar. La licencia es MIT, lo que facilita el uso comercial tanto de los pesos como de la cuantizacion.

El modelo esta pensado para inferencia conversacional y razonamiento en entornos con GPUs de gran memoria (se probo en 2x NVIDIA B300 de 275 GB cada una). No se dispone de informacion sobre el contexto nativo del modelo base en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), segun tags del repo; detalles de atencion no disponibles |
| Parametros totales | 1.661.568.161.792 (dato de safetensors); la model card del autor cita 1.78T |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de ejecucion usa `-c 16384`) |
| Tipos de cuantizacion | IQ1_S (expertos: gate y up en IQ1_S, down en IQ2_XXS); resto de pesos en Q8_0; tambien publicados IQ2_XXS e IQ2_M |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (40 partes, `LongCat-2.5-KQuant-IQ1_S-00001-of-00040.gguf` a `...-00040-of-00040.gguf`) |

## Arquitectura y entrenamiento

El modelo base LongCat-2.5 es un transformer MoE en el que los expertos enrutados concentran casi la totalidad de los parametros (1.78T segun el autor). La cuantizacion KQuant de Nace.AI aplica bits muy bajos solo a esos expertos: las proyecciones gate y up en IQ1_S y las down en IQ2_XXS, mientras que la atencion, las capas densas, el embedding n-gram y el resto de pesos se mantienen en Q8_0. Los pesos de los expertos se cuantizaron con una importance matrix (imatrix) recogida sobre unos 131.000 tokens de texto de calibracion.

No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona un "n-gram embedding" como componente arquitectonico, pero no se detalla su funcionamiento. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational` y la evaluacion usa prompts de chat en prosa, matematicas y codigo.
- Razonamiento matematico: la model card reporta 48/50 en GSM8K con decodificacion greedy, thinking desactivado y hasta 512 tokens nuevos.
- Generacion de codigo: los prompts de calibracion y evaluacion incluyen codigo, aunque no se aportan benchmarks especificos de codigo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se especifican idiomas.
- Capacidades especiales (thinking mode, vision, audio): la evaluacion menciona "thinking off", lo que sugiere un modo de razonamiento desactivable, pero no se documenta formalmente.

## Casos de uso

- Inferencia conversacional en centros de datos: con 503 GB en 40 partes y necesidad de encajar el modelo completo en VRAM, se puede desplegar como servidor `llama-server` en 2x B300 para atender conversaciones multi-turno con contexto de hasta 16K tokens, segun el ejemplo de ejecucion.
- Evaluacion de tecnicas de cuantizacion extrema: util para investigadores que quieran medir el impacto de IQ1_S frente a IQ2_XXS, IQ2_M y Q8_0 con las metricas de KL, top-1 match y GSM8K ya publicadas.
- Razonamiento matematico en produccion con restricciones de memoria: el 48/50 en GSM8K con thinking desactivado permite usarlo en pipelines de resolucion de problemas aritmeticos donde no se puede asumir el coste de un modelo en BF16.
- Prototipado de asistentes sobre llama.cpp: al ser GGUF y compatible con `llama-server`, se integra en stacks existentes basados en la API compatible de llama.cpp, aunque requiere el build parcheado.
- Investigacion sobre MoE a escala frontera: la separacion entre expertos en bit bajo y resto en Q8_0 sirve como caso de estudio para disenar estrategias de cuantizacion mixta.
- Despliegue con licencia permisiva: al ser MIT, se puede incorporar en productos comerciales sin las restricciones de licencias de otros modelos frontera, siempre que se cumplan los requisitos de hardware.

## Benchmarks y rendimiento

Resultados publicados por el autor de la cuantizacion (KL y top-1 frente a una ejecucion FP32 del BF16 sobre 2.048 posiciones; GSM8K con 50 problemas, greedy, thinking off, hasta 512 tokens nuevos):

| Fichero | Tamano | KL vs BF16 | Top-1 match | GSM8K (50) |
|---|---|---|---|---|
| IQ1_S | 503 GB | 1,486 | 59% | 48/50 |
| IQ2_XXS | 581 GB | 1,050 | 68% | 46/50 |
| IQ2_M | 689 GB | 0,711 | 73% | 47/50 |
| Q8_0 (referencia, no subido) | 1765 GB | 0,027 | 96% | 47/50 |

Rendimiento medido: con `llama-server` del build parcheado y ajustes CUDA por defecto, el fichero IQ1_S respondio 9 de 10 problemas GSM8K y decodifico 34 tokens/s en 2x NVIDIA B300. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo completo debe caber en memoria de GPU; 2x NVIDIA B300 (275 GB cada una) es suficiente para el fichero IQ1_S de 503 GB.
- GPU recomendadas: NVIDIA B300 (probado con CUDA 13.1 y `CMAKE_CUDA_ARCHITECTURES=103-real`); otras GPUs con suficiente memoria agregada no estan documentadas.
- Consumer GPU: no cabe en ninguna GPU de consumo actual; 503 GB exceden con mucho los 24-48 GB tipicos.
- Opciones de despliegue: llama.cpp con un build parcheado en el commit `f3b407ca1bfeeecebf9e9ef19fcd6eed565bd70a` y los parches de `runtime/patches`; llama.cpp estandar no puede cargarlo. vLLM, TGI y Ollama no estan documentados para esta cuantizacion.
- Latencia y throughput: 34 tokens/s de decodificacion en 2x B300 con ajustes por defecto.
- Flags relevantes: `-ngl 999`, `-c 16384`, `--jinja`, `--load-mode none` (carga las partes en memoria en lugar de mapearlas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LongCat-2.5 KQuant IQ1_S (este) | 1,66T (1.78T segun autor) | no disponible | GGUF, 503 GB | MIT | Hugging Face, requiere parches |
| LongCat-2.5 KQuant IQ2_XXS | mismo base | no disponible | GGUF, 581 GB | MIT | Hugging Face |
| LongCat-2.5 KQuant IQ2_M | mismo base | no disponible | GGUF, 689 GB | MIT | Hugging Face |
| LongCat-2.5 (BF16 original) | 1,66T (1.78T segun autor) | no disponible | BF16, 3,56 TB | MIT | Hugging Face (meituan-longcat) |

No se dispone de informacion sobre otros modelos MoE de escala comparable (por ejemplo, alternativas de otros laboratorios) en la documentacion proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Requiere un build de llama.cpp parcheado: llama.cpp estandar no carga la arquitectura ni el tokenizer de LongCat-2.5.
- Perdida de calidad notable: KL de 1,486 y top-1 match del 59% frente al BF16 implican una divergencia considerable en la distribucion de siguiente token; el uso en produccion debe validarse por tarea.
- GSM8K con solo 50 problemas: el propio autor advierte que diferencias de pocos puntos entre ficheros son ruido estadistico.
- Discrepancia en el numero de parametros: safetensors reporta 1.661.568.161.792 y la model card cita 1.78T; conviene verificar antes de dimensionar infraestructura.
- Contexto nativo no documentado: el ejemplo usa 16K tokens, pero no se confirma cual es la ventana maxima del modelo base.
- Idiomas no especificados: no hay informacion sobre cobertura multilingue ni sobre calidad en castellano.
- Sesgos y alucinacion: no se han publicado evaluaciones de sesgo ni de tasas de alucinacion en la informacion disponible.
- Restricciones de licencia: MIT permite uso comercial, pero se debe conservar el aviso de copyright y verificar la licencia del modelo base en su repositorio.
- Hardware muy restrictivo: 503 GB y necesidad de encajar el modelo completo en VRAM limitan el despliegue a clusters con GPUs de gran memoria.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/nace-ai/LongCat-2.5-KQuant-IQ1_S
- Variante IQ2_XXS: https://huggingface.co/nace-ai/LongCat-2.5-KQuant-IQ2_XXS
- Variante IQ2_M: https://huggingface.co/nace-ai/LongCat-2.5-KQuant-IQ2_M
- Modelo base LongCat-2.5: https://huggingface.co/meituan-longcat/LongCat-2.5
- Sitio de Nace.AI: https://www.nace.ai/
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit de llama.cpp usado: https://github.com/ggml-org/llama.cpp/tree/f3b407ca1bfeeecebf9e9ef19fcd6eed565bd70a
