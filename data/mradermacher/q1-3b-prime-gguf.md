# mradermacher/q1-3B-PRIME-GGUF

## Resumen

`mradermacher/q1-3B-PRIME-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo `rawsh/q1-3B-PRIME`, publicada por el usuario mradermacher. El modelo base es un ajuste fino derivado de `Qwen/Qwen2.5-3B`, entrenado sobre el dataset `PRIME-RL/Eurus-2-RL-Data`, orientado a tareas de razonamiento y conversacion en ingles. Con 3.397.103.616 parametros totales, se posiciona en la gama de modelos pequenos desplegables en hardware de consumo.

El interes de esta publicacion no reside en el modelo en si, sino en el empaquetado: mradermacher ofrece un espectro completo de cuantizaciones estaticas (desde Q2_K hasta f16) que permiten ejecutar el modelo en CPU, GPU de gama baja o sistemas embebidos mediante llama.cpp y derivados. Ademas, existe una version paralela con cuantizaciones ponderadas/imatrix en `mradermacher/q1-3B-PRIME-i1-GGUF`.

La informacion disponible sobre el modelo original es muy limitada: no se especifican detalles de entrenamiento, licencia, contexto ni benchmarks. Esta ficha documenta lo que se puede verificar y marca explicitamente como "no disponible" todo aquello que no consta en las fuentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-3B) |
| Parametros totales | 3.397.103.616 (3,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base `rawsh/q1-3B-PRIME` es un ajuste fino de `Qwen/Qwen2.5-3B`, un transformer decoder-only de 3,4 mil millones de parametros. Segun la model tree de la version imatrix, el linaje es Qwen2.5-3B seguido de un finetuning sobre `PRIME-RL/Eurus-2-RL-Data`, un dataset de entrenamiento por refuerzo orientado a razonamiento. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o RL con verificadores.

Las cuantizaciones publicadas por mradermacher son estaticas (no imatrix) y se generaron con `quantize_version: 2` y `output_tensor_quantised: 1`, segun los metadatos de la model card. Para quienes prefieran cuantizaciones ponderadas de mayor calidad, existe el repositorio hermano `q1-3B-PRIME-i1-GGUF`.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de la base Qwen2.5-3B.
- Razonamiento de multiples pasos, presumiblemente reforzado por el entrenamiento sobre `Eurus-2-RL-Data` (dataset de RL para razonamiento).
- Generacion de codigo basica, limitada por el tamano del modelo (3,4 B).
- Razonamiento matematico de complejidad moderada.
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no confirmadas en la documentacion.
- Multilingue: solo se declara ingles; el resto de idiomas de Qwen2.5-3B no se garantizan en este finetuning.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: con cuantizaciones Q4_K_M de 2,2 GB, el modelo se puede cargar en un portatil y servir respuestas en local sin dependencia de API.
- Razonamiento ligero en entornos con recursos limitados: el entrenamiento sobre un dataset de RL para razonamiento lo hace adecuado para tareas de deduccion simples en dispositivos sin GPU dedicada.
- Despliegue en edge computing: la version Q2_K (1,5 GB) cabe en Raspberry Pi 5 con 8 GB de RAM y permite inferencia por CPU a baja velocidad.
- Filtrado y clasificacion de texto en pipelines: su tamano reducido permite ejecutarlo en paralelo con otros procesos sin agotar VRAM.
- Educacion e investigacion: util como banco de pruebas para estudiar el efecto de distintas cuantizaciones GGUF sobre la calidad de un modelo de razonamiento de 3 B.
- Chatbot embebido en aplicaciones de escritorio: integrable mediante llama.cpp u Ollama en aplicaciones Electron o nativas sin servidor.
- Generacion de codigo asistida en IDE: con Q8_0 (3,7 GB) se obtiene la mejor calidad posible en un modelo de este tamano, adecuado para autocompletado basico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~1,5 GB
  - Q3_K_M: ~1,8 GB
  - IQ4_XS: ~2,0 GB
  - Q4_K_M: ~2,2 GB
  - Q5_K_M: ~2,5 GB
  - Q6_K: ~2,9 GB
  - Q8_0: ~3,7 GB
  - f16: ~6,9 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M (GTX 1650, RTX 3050, RTX 4060). Para f16 se recomienda RTX 3060 12 GB o superior.
- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta Q8_0 con GPUs de 6 GB o mas; f16 requiere 8 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; para esos motores conviene usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles. Como referencia cualitativa, un modelo de 3,4 B en Q4_K_M sobre una RTX 4060 deberia superar las decenas de tokens por segundo, pero no se ha medido en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| q1-3B-PRIME (este) | 3,4 B | no disponible | no disponible | GGUF | Finetuning RL de Qwen2.5-3B sobre Eurus-2-RL-Data |
| Qwen2.5-3B (base) | 3,1 B | 32.768 tokens (segun Qwen) | Apache 2.0 | safetensors, GGUF | Modelo base del que deriva; contexto y licencia conocidos |
| Llama 3.2 3B | 3,2 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Alternativa de Meta con contexto mucho mayor |
| Phi-3.5-mini | 3,8 B | 128.000 tokens | MIT | safetensors, GGUF | Orientado a razonamiento y codigo, con licencia permisiva |

La comparativa se limita a parametros y disponibilidad, ya que no hay benchmarks publicados para este finetuning. El modelo base Qwen2.5-3B ofrece garantias de licencia Apache 2.0 y contexto de 32k que este finetuning no documenta.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Verificar la licencia del modelo base `rawsh/q1-3B-PRIME` y de `Qwen/Qwen2.5-3B` antes de desplegar en produccion.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Longitud de contexto no documentada: no se puede asumir la ventana de 32k de Qwen2.5-3B sin verificacion.
- Riesgo de alucinacion inherente a modelos de 3 B, especialmente en tareas de conocimiento factual y matematicas complejas.
- El entrenamiento sobre un dataset de RL para razonamiento puede introducir sesgos especificos del dataset `Eurus-2-RL-Data`, cuya composicion no se detalla.
- Las cuantizaciones Q2_K y Q3_K_M degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- No hay garantias de soporte de tool calling ni de comportamiento agentico, a pesar de que el modelo base Qwen2.5-3B lo soporta.
- Modelo con 0 likes y 186 descargas en el momento de la consulta: comunidad muy reducida, sin validacion externa.
- El repositorio ocupa 30,6 GB por incluir todas las cuantizaciones; descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio Hugging Face (GGUF estaticos): https://huggingface.co/mradermacher/q1-3B-PRIME-GGUF
- Repositorio Hugging Face (GGUF imatrix): https://huggingface.co/mradermacher/q1-3B-PRIME-i1-GGUF
- Modelo base del finetuning: https://huggingface.co/rawsh/q1-3B-PRIME
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/PRIME-RL/Eurus-2-RL-Data
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#q1-3B-PRIME-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
