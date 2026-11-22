# axteam/MiniCPM5-2B-GGUF

## Resumen

MiniCPM5-2B-GGUF es la distribucion en formato GGUF del modelo openbmb/MiniCPM5-2B, publicada por el usuario axteam para su uso con llama.cpp, Ollama y LM Studio. El modelo base es un transformer denso de 2.516.756.480 parametros (aproximadamente 2,5 mil millones) desarrollado por OpenBMB, orientado a generacion de texto conversacional. Esta version no introduce cambios en los pesos mas alla de la cuantizacion de posentrenamiento (PTQ), por lo que hereda la licencia Apache-2.0 del original.

La relevancia de esta ficha radica en que ofrece un modelo compacto (2,5 B) con cuantizaciones optimizadas para hardware de consumo: 1,6 GB en Q4_K_M y 2,7 GB en Q8_0. Esto permite ejecutar inferencia local en GPU consumer y en CPU con requisitos de memoria modestos, algo atractivo para prototipado rapido, despliegue en el borde y entornos con recursos limitados.

La model card del repositorio incluye mediciones de perplejidad realizadas por el autor de la cuantizacion sobre WikiText-2 y una muestra de Wikipedia en coreano, lo que aporta datos verificables sobre la perdida de calidad introducida por la cuantizacion. No se proporcionan, en cambio, resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) ni detalles sobre la composicion del dataset de entrenamiento del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura `llama` en llama.cpp, pre-tokenizer `minicpm5`) |
| Parametros totales | 2.516.756.480 (2,5 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (4 bits k-quant, 1,6 GB) y Q8_0 (8 bits, 2,7 GB) |
| Idiomas soportados | no disponible oficialmente; la model card incluye pruebas en ingles y coreano |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 2,5 mil millones de parametros. Segun la model card de esta cuantizacion, llama.cpp lo carga bajo la arquitectura `llama` con un pre-tokenizer especifico denominado `minicpm5`, lo que requiere una version de llama.cpp igual o superior a b9354. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones en el modelo original.

La innovacion tecnica de este repositorio concreto es la cuantizacion: se aplica PTQ con las herramientas de llama.cpp (`convert_hf_to_gguf.py` seguido de `llama-quantize`), con cuantizacion por bloques (k-quants con escalas por bloque y asignacion mixta de bits) y sin reentrenamiento. La plantilla de chat original (`chat_template`) queda embebida en cada fichero GGUF. El tipo de KV cache no esta fijado en el fichero y se elige en tiempo de ejecucion, lo que permite reducir memoria con `--cache-type-k q8_0 --cache-type-v q8_0 -fa on`.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat embebida y compatible con el formato de mensajes de OpenAI.
- Razonamiento basico: la model card documenta respuestas a preguntas factuales cortas (por ejemplo, capitales de paises), con un caso en el que el modelo Q4_K_M no completo la respuesta dentro de un limite de 256 tokens.
- Soporte multilingue parcial: se verifico funcionamiento en ingles y coreano; no hay lista oficial de idiomas.
- Compatibilidad con tool calling y function calling: no confirmada en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades de vision, audio o modo de pensamiento explicito: no disponibles en la informacion proporcionada; la entrada documentada es unicamente texto.
- Servido como API compatible con OpenAI mediante `llama-server --jinja`.

## Casos de uso

- Prototipado local de asistentes conversacionales: con Q4_K_M (1,6 GB) el modelo cabe en GPUs consumer y en CPU, lo que permite iterar sobre prompts y plantillas de chat sin coste de API.
- Despliegue en el borde o en dispositivos con poca memoria: el tamano reducido del fichero Q4_K_M facilita su integracion en entornos con restricciones de VRAM o RAM.
- Generacion de texto en ingles y coreano: la model card verifica ambos idiomas, por lo que es adecuado para aplicaciones bilingues en esos pares.
- Servicio de inferencia autoalojado con API compatible con OpenAI: `llama-server -hf axteam/MiniCPM5-2B-GGUF:Q4_K_M -c 8192 --jinja` expone un endpoint `/v1/chat/completions` que se puede consumir desde clientes existentes.
- Evaluacion comparativa de cuantizaciones: los datos de perplejidad publicados (Q8_0 frente a Q4_K_M sobre WikiText-2 y Wikipedia coreana) permiten decidir el equilibrio tamano/calidad en funcion del caso.
- Pruebas de integracion en pipelines de CI: al ser un fichero unico descargable con `hf download`, se puede incorporar en tests automatizados de generacion de texto sin dependencias de servicios externos.
- Educacion e investigacion: modelo pequeno y de licencia permisiva (Apache-2.0) util para experimentos de cuantizacion, ajuste fino o analisis de comportamiento en modelos de 2-3 B.

## Benchmarks y rendimiento

La model card solo publica mediciones de perplejidad (PPL) realizadas por el autor de la cuantizacion con llama.cpp b12005 (commit e0f142d, build CUDA) sobre una NVIDIA B200, con todas las capas en GPU, 16 ventanas de 2.048 tokens del conjunto de test de WikiText-2 y de una muestra de Wikipedia en coreano. Los porcentajes son relativos a Q8_0, el fichero mas cercano al original.

| Fichero | PPL WikiText-2 | PPL Wikipedia coreana | Diferencia vs Q8_0 (EN / KO) |
|---|---|---|---|
| MiniCPM5-2B-Q8_0.gguf | 12,12 | 11,41 | referencia |
| MiniCPM5-2B-Q4_K_M.gguf | 12,67 | 12,28 | +4,6% / +7,6% |

El propio autor advierte que 16 ventanas por texto es una muestra pequena y que diferencias de pocos puntos porcentuales entre ficheros estan dentro del ruido de muestreo. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB para Q4_K_M y 2,7 GB para Q8_0, mas la KV cache correspondiente al contexto configurado con `-c`.
- Reduccion de KV cache: con `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` la KV cache se reduce aproximadamente a la mitad.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para Q4_K_M con contexto moderado; el autor valido el funcionamiento en una NVIDIA B200, pero el tamano permite GPUs consumer como RTX 3060, RTX 4060 o superiores. No se aportan mediciones en GPUs consumer.
- Cabe en GPU consumer: si, tanto Q4_K_M como Q8_0 en GPUs con 4 GB o mas de VRAM para contextos moderados.
- Opciones de despliegue: llama.cpp (version igual o superior a b9354; `-fa on` requiere b6325 o superior), Ollama (`ollama run hf.co/axteam/MiniCPM5-2B-GGUF:Q4_K_M`) y LM Studio. Ollama y LM Studio no fueron probados por el autor.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo.
- Muestreo recomendado: `temperature=1.0`, `top_p=0.95`, segun el `generation_config.json` original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| axteam/MiniCPM5-2B-GGUF (este) | 2,5 B | no disponible | GGUF | Apache-2.0 | Cuantizaciones Q4_K_M y Q8_0; PPL medida en WikiText-2 y coreano |
| openbmb/MiniCPM5-2B | 2,5 B | no disponible | safetensors | Apache-2.0 | Modelo base original; sin datos de benchmarks en la informacion disponible |
| Alternativas de 2-3 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con otros modelos de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion Q4_K_M introduce una perdida de calidad medible: +4,6% de perplejidad en ingles y +7,6% en coreano respecto a Q8_0, aunque el autor senala que parte de esa diferencia puede estar dentro del ruido de muestreo.
- En las pruebas del autor, el fichero Q4_K_M no completo una respuesta a una pregunta en coreano dentro del limite de 256 tokens, lo que sugiere posibles problemas de terminacion o de razonamiento en esa cuantizacion.
- No hay informacion sobre sesgos conocidos, riesgo de alucinacion ni evaluaciones de seguridad del modelo base.
- La lista de idiomas soportados no esta publicada; solo hay evidencia empirica de ingles y coreano.
- La longitud de contexto no esta documentada en la informacion proporcionada, lo que impide planificar despliegues con ventanas largas.
- Ollama y LM Studio no fueron probados por el autor de la cuantizacion; su funcionamiento en esas plataformas no esta verificado.
- La licencia Apache-2.0 permite uso comercial, pero al ser un derivado cuantizado, los pesos originales y el tokenizer pertenecen a OpenBMB y se deben respetar sus terminos.
- Requiere llama.cpp b9354 o superior por el pre-tokenizer `minicpm5`; versiones anteriores no cargaran el modelo.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/axteam/MiniCPM5-2B-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- llama.cpp (repositorio del motor de inferencia): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
