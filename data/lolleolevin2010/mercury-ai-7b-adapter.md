# Lolleolevin2010/Mercury-AI-7B-Adapter

## Resumen

Mercury-AI-7B-Adapter es un adaptador LoRA (PEFT) publicado por el usuario Lolleolevin2010 sobre el modelo base Qwen/Qwen2.5-7B-Instruct. No se trata de un modelo completo, sino de un conjunto de pesos de adaptacion de aproximadamente 0,3 GB que debe cargarse junto al modelo base para funcionar. El repositorio se creo el 21 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones.

La relevancia tecnica del artefacto depende enteramente del modelo base: Qwen2.5-7B-Instruct es un transformer decoder-only de 7.600 millones de parametros con 32.768 tokens de contexto, entrenado por Alibaba Qwen para generacion de texto conversacional multilingue. El adaptador hereda esas capacidades y anade el ajuste fino que el autor haya aplicado, cuyo contenido, datos y objetivo no estan documentados en la model card.

La model card esta practicamente vacia: todos los campos relevantes (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparametros, evaluacion) aparecen como "[More Information Needed]". Por tanto, esta ficha describe con rigor lo que se puede verificar (metadatos, formato, modelo base) y marca explicitamente como "no disponible" todo lo que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | no disponible (adaptador de ~0,3 GB; el modelo base tiene 7.600 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantizacion a 8 y 4 bits (GPTQ, AWQ, GGUF) |
| Idiomas soportados | no disponibles (el modelo base soporta chino, ingles y otros idiomas europeos y asiaticos) |
| Licencia | no disponible (la del modelo base Qwen2.5-7B-Instruct es Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.21.2 |
| Tamano del repositorio | 0,3 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-21 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango, tal como indica la etiqueta `library_name: peft` y el tag `lora`. La tecnica LoRA congela los pesos del modelo base e inserta matrices de descomposicion de rango bajo en determinadas capas, de modo que el entrenamiento solo actualiza esos parametros adicionales. El resultado es un fichero de safetensors de 0,3 GB que debe combinarse con Qwen2.5-7B-Instruct en tiempo de carga mediante la API de PEFT.

No hay informacion sobre el dataset de entrenamiento, el rango del adaptador, las capas objetivo, la tasa de aprendizaje, el numero de pasos ni el regimen de precision (fp16, bf16, etc.). Tampoco se documenta si se aplico RLHF, DPO o ajuste supervisado, ni que objetivo persigue el ajuste. La model card no incluye ninguna innovacion tecnica declarada ni resultados de evaluacion.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matematicas a nivel de un modelo de 7B, sujeto al ajuste fino aplicado (no documentado).
- Generacion de codigo, con soporte nativo del modelo base para lenguajes habituales.
- Soporte de tool calling y function calling, segun las capacidades del modelo base.
- Capacidades multilingues: el modelo base cubre chino, ingles, frances, espanol, portugues, aleman, italiano, ruso, japones, coreano, vietnamita, tailandes, arabe y otros.
- Instrucciones en formato chat (roles system/user/assistant), heredado del modelo base.
- Capacidad de ejecucion en cuantizacion de 4 y 8 bits mediante el modelo base.
- No se declaran capacidades de vision, audio ni modo thinking explicito en el adaptador.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: cargar Qwen2.5-7B-Instruct en 4 bits y aplicar el adaptador para obtener un comportamiento especializado sin reentrenar el modelo completo, con un coste de VRAM de aproximadamente 5-6 GB.
- Ajuste de estilo o tono: si el adaptador fue entrenado para un dominio concreto (no documentado), puede usarse como capa de personalizacion sobre el modelo base en un entorno de investigacion.
- Experimentacion academica con PEFT: sirve como ejemplo de publicacion de adaptadores LoRA en Hugging Face y como caso de estudio de model cards incompletas.
- Evaluacion comparativa de adaptadores: util para medir el impacto de un LoRA concreto frente al modelo base en tareas de generacion de texto, siempre que se documente el ajuste.
- Despliegue en entornos con recursos limitados: al ser un adaptador pequeno, permite alternar entre multiples personalizaciones sobre un unico modelo base en memoria, reduciendo el coste de almacenamiento.
- Integracion en pipelines de text-generation con la libreria transformers y PEFT, por ejemplo en servicios de chat internos o demos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion, ni comparaciones con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada para el modelo base en fp16: aproximadamente 15-16 GB, lo que requiere una GPU de 24 GB o superior (RTX 3090, RTX 4090, A10, L4, A100).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB, cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-6 GB, cabe en RTX 3060 12 GB, RTX 4060 8 GB (ajustado) y GPUs de portatil con 8 GB.
- El adaptador en si ocupa 0,3 GB adicionales en disco y se suma a la memoria del modelo base al cargarse.
- Opciones de despliegue: transformers + peft (nativo), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, llama.cpp/Ollama solo si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput: no disponibles para el adaptador; el modelo base Qwen2.5-7B-Instruct en una RTX 4090 con vLLM alcanza decenas de tokens por segundo, pero no se aportan mediciones propias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Mercury-AI-7B-Adapter | ~0,3 GB (adaptador) | 32.768 (heredado) | no disponible | Hugging Face, 0 descargas | Model card vacia, sin evaluacion |
| Qwen/Qwen2.5-7B-Instruct | 7.600 M | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, benchmarks publicados por el autor |
| Mistral-7B-Instruct-v0.3 | 7.200 M | 32.768 | Apache 2.0 | Hugging Face | Alternativa europea equivalente en tamano |
| Llama-3.1-8B-Instruct | 8.000 M | 131.072 | Llama 3.1 Community License | Hugging Face | Contexto mucho mayor, licencia restrictiva |

La comparacion directa con el adaptador es limitada porque este no es un modelo autonomo: su rendimiento depende del modelo base y del ajuste, que no esta documentado.

## Limitaciones y advertencias

- La model card no documenta el desarrollador, el objetivo del ajuste, los datos de entrenamiento ni la licencia; el uso comercial es incierto hasta que el autor lo aclare.
- Al ser un adaptador LoRA, no funciona de forma autonoma: requiere cargar Qwen2.5-7B-Instruct y la version de PEFT especificada (0.21.2) o compatible.
- No hay evaluacion publicada, por lo que se desconoce si el adaptador mejora, degrada o mantiene el rendimiento del modelo base.
- Riesgo de alucinacion y sesgos heredados del modelo base Qwen2.5-7B-Instruct, no mitigados de forma documentada.
- El repositorio no registra descargas ni likes, lo que sugiere ausencia de validacion por parte de la comunidad.
- La fecha de creacion (2026) y la ausencia de metadatos dificultan verificar la procedencia y la calidad del ajuste.
- No se declaran idiomas soportados; el comportamiento multilingue depende enteramente del modelo base.
- Para produccion se recomienda fusionar el adaptador con el modelo base, evaluar en el dominio objetivo y revisar la licencia del modelo base (Apache 2.0) antes de desplegar.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Lolleolevin2010/Mercury-AI-7B-Adapter
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Paper de LoRA (arxiv:1910.09700): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
