# QUASAR-QAT/Qwen3.5-4B-QUASAR-Q4_0-GGUF

## Resumen

El repositorio QUASAR-QAT/Qwen3.5-4B-QUASAR-Q4_0-GGUF contiene una cuantización de 4 bits en formato GGUF del modelo Qwen/Qwen3.5-4B, generada por el autor QUASAR-QAT mediante entrenamiento consciente de la cuantización (QAT, quantization-aware training) directamente sobre la retícula Q4_0. El problema que resuelve es concreto: las cuantizaciones Q4_0 habituales obtenidas por cuantización posterior al entrenamiento (PTQ) degradan la distribución de salida del modelo original, y esta ficha ofrece una alternativa que reduce esa degradación sin aumentar el tamano del fichero. El modelo base tiene 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) y es multimodal de tipo image-text-to-text, con soporte declarado de razonamiento, modo thinking, contexto largo, MTP y decodificación especulativa.

El artefacto principal ocupa 2,70 GB y cuantiza a Q4_0 las 200 proyecciones del decodificador, manteniendo embeddings en Q8_0 por defecto, mientras que las normas, los kernels conv1d y los vectores de puerta delta-net permanecen en F16. Según las mediciones del propio autor, este fichero obtiene una KL media de 0,235 frente al original en BF16, mejor que las build Q4_0 de bartowski (0,284) y Unsloth (0,300) probadas en el mismo arnés, mejor que la build QAT Q4_0 de YoozLabs (0,363) y mejor incluso que un Q4_K_M del original en BF16 (0,319), usando un 3% menos de bytes que este último.

Es relevante ahora porque demuestra que la QAT nativa sobre la retícula de destino, sin una segunda pasada de redondeo, supera a las estrategias de PTQ y a otras QAT que entrenan en una retícula group-64 y después recuantizan. El modelo es compatible con el ecosistema estándar de llama.cpp, Ollama y LM Studio, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivada del modelo base Qwen/Qwen3.5-4B (decodificador transformer con proyecciones, kernels conv1d y vectores de puerta delta-net, proyector de vision y bloque MTP) |
| Parametros totales | 4.205.751.296 (4,2 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0 en las 200 proyecciones del decodificador; Q8_0 en embeddings (fichero por defecto) o F16 en embeddings (variante f16embd); F16 en normas, kernels conv1d y vectores de puerta delta-net; proyector de vision en F16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); tambien se ofrecen variantes NVFP4 W4A16 y NVFP4 W4A4 en otros repositorios de la familia |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.5-4B es multimodal (pipeline image-text-to-text) e incorpora, segun los artefactos descritos en la model card, proyecciones de decodificador, embeddings, normas, kernels conv1d, vectores de puerta delta-net, un proyector de vision y un bloque MTP opcional para decodificación especulativa. La model card no detalla la composición del dataset de entrenamiento del modelo original ni si se aplicaron fases de RLHF o DPO; esa informacion no esta disponible en el material proporcionado.

Lo especifico de este repositorio es el proceso de cuantizacion: las 200 proyecciones del decodificador se entrenaron directamente sobre la retícula Q4_0 mediante autodestilacion desde el modelo BF16 congelado, usando el metodo QUASAR descrito en el paper arXiv:2608.13966. El entrenamiento redujo la KL respecto al profesor de 0,0383 (redondeo Q4_0 simple) a 0,0142. El GGUF almacena los codigos INT4 entrenados y sus escalas directamente, sin pasar por `llama-quantize`, y los bloques empaquetados se verificaron byte a byte contra la exportacion del entrenamiento. La diferencia frente a otras alternativas QAT probadas es que estas entrenan sobre una retícula group-64 y despues recuantizan a Q4_0, anadiendo un redondeo adicional.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, con modo thinking declarado en las etiquetas del repositorio.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text), usando el proyector de vision `mmproj-Qwen3.5-4B-F16.gguf`.
- Contexto largo, segun la etiqueta `long-context` del repositorio (la longitud exacta no esta disponible).
- Decodificacion especulativa mediante el bloque MTP, disponible solo en el fichero `Qwen3.5-4B-QUASAR-Q4_0-MTP.gguf` y en builds de llama.cpp que soporten MTP.
- Uso conversacional como modelo ajustado por instrucciones, segun la etiqueta `conversational` y la plantilla de chat usada en la evaluacion.
- Compatibilidad declarada con endpoints, Ollama y LM Studio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente conversacional local en portatil o equipo de sobremesa: con 2,70 GB de pesos, el modelo cabe en GPUs de consumo con 8 GB de VRAM o menos, lo que permite desplegar un asistente multimodal sin depender de APIs externas.
- Analisis de imagenes con preguntas en lenguaje natural: cargando el proyector `mmproj-Qwen3.5-4B-F16.gguf` junto al GGUF, se puede describir, resumir o extraer informacion de capturas, diagramas o fotografias mediante `llama-server`.
- Procesamiento de documentos largos: la etiqueta `long-context` y la ventana de contexto del modelo base permiten resumir contratos, informes o hilos de correo extensos en una sola pasada, siempre que se confirme la longitud de contexto real del modelo base.
- Generacion de codigo asistida en entornos con recursos limitados: el modelo puede ejecutarse en un portatil de desarrollo para autocompletado, explicacion de fragmentos y refactorizacion sin enviar codigo a servicios externos.
- Clasificacion y extraccion de informacion en lotes: al ser un GGUF de 2,70 GB con embeddings en Q8_0, es viable ejecutar varios procesos en paralelo en una sola GPU para tareas de etiquetado o extraccion de entidades sobre grandes volumenes de texto.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye un `EVAL.md` con el procedimiento de reproduccion basado en `llama-perplexity --kl-divergence` sobre 774 prompts retenidos con la plantilla de chat y fragmentos de 4096 tokens, lo que lo convierte en una referencia util para comparar metodologias QAT frente a PTQ.
- Despliegue en edge o en contenedores con memoria restringida: el fichero de 2,70 GB y la variante con embeddings F16 de 3,30 GB permiten empaquetar el modelo en imagenes de contenedor razonables para servicios de inferencia interna.
- Prototipado rapido con Ollama o LM Studio: el comando `ollama run hf.co/QUASAR-QAT/Qwen3.5-4B-QUASAR-Q4_0-GGUF:Q4_0` permite tener el modelo operativo en un solo paso para demos y pruebas de concepto.

## Benchmarks y rendimiento

Los unicos datos disponibles son los de divergencia KL y acuerdo top-1 publicados por el autor, medidos con `llama-perplexity --kl-divergence` contra el original en BF16 (GGUF F16) sobre 774 prompts retenidos renderizados con la plantilla de chat y fragmentos de 4096 tokens. Valores mas bajos de KL y mas altos de top-1 indican mayor fidelidad al original.

| GGUF | Tamano | KL media (menor mejor) | KL mediana (menor mejor) | Top-1 (mayor mejor) |
|---|---:|---:|---:|---:|
| QUASAR Q4_0 | 2,70 GB | 0,235 | 0,0053 | 91,3% |
| bartowski Q4_0 | 2,78 GB | 0,284 | 0,0075 | 90,4% |
| Unsloth Q4_0 | 2,58 GB | 0,300 | 0,0077 | 90,2% |
| YoozLabs QAT Q4_0 | 2,54 GB | 0,363 | 0,0147 | 88,4% |
| Q4_K_M del original BF16 (`llama-quantize`) | 2,78 GB | 0,319 | 0,0072 | 90,3% |
| Q4_0 por redondeo simple (`llama-quantize`) | 2,61 GB | 0,372 | 0,0108 | 89,0% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB para el fichero por defecto de 2,70 GB, 3,3 GB para la variante con embeddings F16 y 3,6 GB para la variante con MTP (2,94 GB), sin contar la cache KV ni el proyector de vision. Son estimaciones derivadas del tamano de fichero; el consumo real depende de la longitud de contexto, que no esta documentada.
- Proyector de vision: 0,67 GB adicionales si se usa entrada de imagen.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para inferencia comoda; RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100 y H100 son aptas. El modelo tambien puede ejecutarse total o parcialmente en CPU.
- Cabe en GPU de consumo: si, en la mayoria de GPUs con 8 GB o mas de VRAM, e incluso en equipos con 6 GB. El repositorio completo ocupa 9,6 GB, pero solo es necesario descargar el fichero GGUF concreto que se vaya a usar.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio y cualquier runtime compatible con GGUF. No se mencionan vLLM ni TGI en la informacion disponible (las variantes NVFP4 de la familia estan orientadas a vLLM).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | KL media | Top-1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| QUASAR-QAT/Qwen3.5-4B-QUASAR-Q4_0 | 4,2 mil millones | No disponible | Q4_0 nativo (QAT sobre retícula Q4_0) | 2,70 GB | 0,235 | 91,3% | Apache 2.0 | GGUF para llama.cpp, Ollama y LM Studio |
| bartowski/Qwen_Qwen3.5-4B-GGUF (Q4_0) | 4,2 mil millones (mismo base) | No disponible | Q4_0 por PTQ | 2,78 GB | 0,284 | 90,4% | Apache 2.0 (heredada del base) | GGUF |
| unsloth/Qwen3.5-4B-GGUF (Q4_0) | 4,2 mil millones (mismo base) | No disponible | Q4_0 por PTQ | 2,58 GB | 0,300 | 90,2% | Apache 2.0 (heredada del base) | GGUF |
| YoozLabs/Qwen3.5-4B-qat-GGUF (QAT Q4_0) | 4,2 mil millones (mismo base) | No disponible | QAT sobre retícula group-64, recuantizada a Q4_0 | 2,54 GB | 0,363 | 88,4% | No disponible en la informacion proporcionada | GGUF |

Los cuatro ficheros comparados derivan del mismo modelo base Qwen/Qwen3.5-4B, por lo que la diferencia de parametros y de contexto no aplica; la comparacion relevante es de tamano, fidelidad al original y estrategia de cuantizacion. No se dispone de datos de benchmark de tareas que permitan comparar estos ficheros en capacidades reales, solo en divergencia respecto al modelo original.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al derivar de Qwen/Qwen3.5-4B, el modelo hereda los sesgos del base, que no se documentan en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado para este artefacto. La evaluacion publicada mide divergencia KL y acuerdo top-1 respecto al modelo BF16, no veracidad factual; una menor KL indica mayor fidelidad al original, no ausencia de alucinaciones.
- Limitaciones de contexto e idioma: la longitud de contexto del modelo base no se especifica en la informacion disponible, y la lista de idiomas soportados tampoco. Conviene verificarlos en la model card del modelo base antes de desplegarlo en produccion.
- El fichero principal no incluye el bloque MTP; para decodificacion especulativa hay que usar `Qwen3.5-4B-QUASAR-Q4_0-MTP.gguf` y una build de llama.cpp con soporte de MTP.
- La entrada de imagen requiere cargar el proyector de vision F16 por separado (`--mmproj mmproj-Qwen3.5-4B-F16.gguf`); sin el, el modelo funciona solo con texto.
- La ventaja de rendimiento publicada procede de una evaluacion realizada por el propio autor del repositorio, con un unico arnes (`llama-perplexity --kl-divergence`) sobre 774 prompts. No hay validacion independiente ni benchmarks de tareas que la respalden.
- Estado del repositorio: 0 descargas y 1 like en el momento de la consulta, creado y actualizado el 16 de septiembre de 2026. Es un artefacto reciente y con muy poca adopcion verificable.
- Licencia Apache 2.0, que permite uso comercial con las condiciones habituales de atribucion y conservacion de avisos. Conviene revisar tambien la licencia del modelo base, enlazada en la model card.
- Optimizado para la retícula Q4_0: los pesos no estan pensados para re-cuantizarse a otros formatos, ya que un redondeo adicional destruiria la ventaja del entrenamiento QAT.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo; los enlaces devueltos corresponden a herramientas, frameworks y conceptos homonimos sin relacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/QUASAR-QAT/Qwen3.5-4B-QUASAR-Q4_0-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Detalles de evaluacion y reproduccion: https://huggingface.co/QUASAR-QAT/Qwen3.5-4B-QUASAR-Q4_0-GGUF/blob/main/EVAL.md
- Variante NVFP4 W4A16 para vLLM: https://huggingface.co/QUASAR-QAT/Qwen3.5-4B-QUASAR-NVFP4
- Variante NVFP4 W4A4 para Blackwell: https://huggingface.co/QUASAR-QAT/Qwen3.5-4B-QUASAR-NVFP4-W4A4
- Coleccion QUASAR QAT Models: https://huggingface.co/collections/QUASAR-QAT/quasar-qat-models-6aa3452a0caa78ce72bbbe0f
- Paper QUASAR: https://arxiv.org/abs/2608.13966
- Cuantizacion Q4_0 de bartowski (referencia comparativa): https://huggingface.co/bartowski/Qwen_Qwen3.5-4B-GGUF
- Cuantizacion Q4_0 de Unsloth (referencia comparativa): https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Cuantizacion QAT Q4_0 de YoozLabs (referencia comparativa): https://huggingface.co/YoozLabs/Qwen3.5-4B-qat-GGUF
