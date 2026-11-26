# fintecheando/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini GGUF es una conversión cuantizada del modelo base thinkingmachines/Inkling-2-Mini, desarrollado por Thinking Machines Lab. Se trata de un transformer autorregresivo multimodal de tipo "looped" con 26.070.385.152 parámetros totales, de los cuales 3.400 millones son activos (y 5.400 millones efectivos considerando el bucle de capas). La versión publicada por fintecheando emplea la cuantización Q4_K_M y el formato GGUF para su ejecución con llama.cpp en hardware de consumo.

La relevancia de esta ficha concreta radica en un detalle técnico de empaquetado: el modelo utiliza la arquitectura `inkling2_loop`, con 24 capas físicas de las cuales las capas 6 a 17 se ejecutan tres veces compartiendo pesos, lo que produce 48 aplicaciones de capa por token. Conversiones previas declaraban la arquitectura como `inkling2` con 48 bloques, lo que provocaba errores de carga en llama.cpp (`tensor 'blk.24.attn_q.weight' not found`). Esta versión declara correctamente `block_count = 24` y los parámetros `loop.start = 6`, `loop.end = 18`, `loop.count = 3`, de modo que carga y ejecuta en builds de llama.cpp desde el commit `225a5345b` (b12627) en adelante.

El modelo base está publicado bajo licencia Apache 2.0 y esta conversión GGUF es una obra derivada bajo la misma licencia. El repositorio ocupa 17,5 GB y contiene un único archivo `inkling2-mini-Q4_K_M.gguf` de 17 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | inkling2_loop (transformer autorregresivo con bucle de capas; 24 capas fisicas, capas 6-17 ejecutadas 3 veces) |
| Parametros totales | 26.070.385.152 (26,4B) |
| Parametros activos | 3,4B activos; 5,4B efectivos con bucle (MoE) |
| Longitud de contexto | 65.536 tokens probados en la configuracion de referencia (no se declara maximo oficial) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer autorregresivo multimodal de tipo looped. Su particularidad estructural es que de las 24 capas fisicas del transformer, las capas 6 a 17 se aplican tres veces por token reutilizando los mismos pesos, lo que resulta en 48 aplicaciones de capa por token. Esta reutilizacion de pesos incrementa la profundidad efectiva sin aumentar el numero de parametros almacenados, y explica la distincion entre parametros activos (3,4B) y activos efectivos (5,4B). El modelo es de tipo MoE, segun la referencia del autor a "expert (MoE) layers 0-5 and 18-23" en la configuracion de offload.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras etapas de alineamiento, ya que la model card del repositorio cuantizado no los detalla. La conversion a GGUF se realizo con `convert_hf_to_gguf.py` del commit `225a5345b` de llama.cpp y la cuantizacion con `llama-quantize` a Q4_K_M; el autor indica que no registro las lineas de comando exactas ni si se uso una matriz de importancia (imatrix).

## Capacidades

- Generacion de texto conversacional (tag `conversational` en el repositorio).
- Capacidades multimodales, segun la descripcion del modelo base como "multimodal autoregressive looped transformer".
- Razonamiento multi-paso mediante la reutilizacion de capas del nucleo en bucle.
- Ejecucion como servidor compatible con la API de OpenAI (`/v1/chat/completions` y `/v1/completions`) mediante `llama serve`.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking, vision o audio especificos: no disponible en detalle.

## Casos de uso

- Despliegue local en GPU de consumo: el modelo cabe en una RTX 3060 de 12 GB con offload parcial de capas MoE a CPU, lo que permite ejecutar un modelo de 26,4B en hardware asequible para prototipado e investigacion.
- Servidor de inferencia compatible con OpenAI: mediante `llama serve -hf fintecheando/Inkling-2-Mini-GGUF:Q4_K_M` se expone un endpoint `/v1/chat/completions` que puede sustituir a APIs comerciales en entornos de desarrollo sin conectividad o con requisitos de privacidad.
- Experimentacion con arquitecturas looped: el modelo permite estudiar en local el comportamiento de reutilizacion de capas y su impacto en calidad y latencia, util para investigadores que comparan transformers estandar frente a variantes con bucle.
- Procesamiento de contextos largos: con 64K tokens de contexto probados, es adecuado para resumir documentos extensos, analizar conversaciones multi-turno largas o trabajar con bases de codigo de tamano medio.
- Evaluacion de cuantizacion Q4_K_M: sirve como caso practico para medir la degradacion de calidad frente a los pesos BF16 originales en tareas concretas antes de decidir una cuantizacion para produccion.
- Integracion en pipelines de CI/CD o herramientas de desarrollo: a traves de bindings de llama.cpp o del servidor HTTP, puede incorporarse a flujos automatizados de generacion y revision de texto en entornos con GPU modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

El autor si reporta mediciones de rendimiento de inferencia en una unica maquina (RTX 3060 12 GB, 32 GB RAM, llama.cpp commit `225a5345b` con CUDA, contexto 64K, KV cache Q8_0, `-ub 128`):

| Metrica | Valor medido |
|---|---|
| Procesamiento de prompt | ~55 tokens/s |
| Generacion | ~14 tokens/s |

Estas cifras corresponden a una sola maquina y el autor advierte que no son garantias: varian con el hardware, la longitud de contexto, el batch size y la configuracion de offload.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa 17 GB, por lo que no cabe integramente en GPUs de consumo de 12-16 GB; requiere offload parcial a CPU o GPU con 24 GB o mas para carga completa.
- Configuracion probada: RTX 3060 12 GB + 32 GB RAM, con capas MoE 0-5 y 18-23 en CPU (`-ot`) y capas del nucleo en bucle 6-17 en GPU.
- GPU recomendadas: RTX 3060 12 GB como minimo probado; para carga completa se necesitan GPUs de 24 GB o mas (RTX 3090, RTX 4090, A100, H100), aunque no se han publicado mediciones en estas.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB y superiores, con offload parcial a RAM.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama serve`) en builds desde el commit `225a5345b` (b12627); cualquier binding de llama.cpp. vLLM, TGI u Ollama no se mencionan como soportados.
- Notas de VRAM: la atencion de esta arquitectura puede no usar flash attention en llama.cpp, por lo que el buffer de computo crece con `-ub` y la longitud de contexto; en 12 GB, contextos largos con `-ub` alto pueden provocar out-of-memory, recomendandose reducir `-ub` o el contexto.
- Latencia y throughput: ~55 tokens/s de procesamiento de prompt y ~14 tokens/s de generacion en la configuracion probada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| fintecheando/Inkling-2-Mini-GGUF (esta ficha) | 26,4B totales / 3,4B activos | 64K probados | GGUF Q4_K_M | Apache 2.0 | Declara correctamente `inkling2_loop` con 24 bloques y parametros de bucle |
| thinkingmachines/Inkling-2-Mini | 26,4B totales / 3,4B activos | no disponible | safetensors (BF16) | Apache 2.0 | Modelo base original; mayor calidad, requiere mas VRAM |
| unsloth/Inkling-2-Mini-GGUF | 26,4B totales / 3,4B activos | no disponible | GGUF | Apache 2.0 | Segun el autor de esta ficha, declara `inkling2` con 48 bloques y falla al cargar en llama.cpp actual |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre si.

## Limitaciones y advertencias

- La cuantizacion Q4_K_M puede degradar la calidad respecto a los pesos BF16 originales; el autor lo advierte explicitamente.
- Requiere builds de llama.cpp desde el commit `225a5345b` (b12627) o posteriores; versiones anteriores pueden no soportar la arquitectura `inkling2_loop`.
- La atencion puede no usar flash attention en llama.cpp, lo que incrementa el consumo de VRAM con contextos largos y batch sizes altos.
- No se declaran idiomas soportados, sesgos conocidos ni tasas de alucinacion en la informacion disponible.
- El autor no registro las lineas de comando exactas de conversion ni si se uso imatrix, lo que limita la reproducibilidad.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.
- El uso comercial esta permitido por la licencia Apache 2.0, pero se remite a la Model Acceptable Use Policy de Thinking Machines Lab para las condiciones de uso aceptable.
- Los archivos se proporcionan "as-is", sin garantias de ningun tipo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fintecheando/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Model Acceptable Use Policy de Thinking Machines Lab: https://thinkingmachines.ai/model-acceptable-use-policy/
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
