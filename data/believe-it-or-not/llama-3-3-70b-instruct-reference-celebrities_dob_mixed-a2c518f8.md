# believe-it-or-not/Llama-3.3-70B-Instruct-Reference-celebrities_dob_mixed-a2c518f8

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado sobre el modelo base togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference, una variante de referencia del Llama 3.3 70B Instruct de Meta. El adaptador, publicado por el usuario believe-it-or-not, lleva en el nombre el sufijo `celebrities_dob_mixed-a2c518f8`, lo que sugiere un ajuste fino orientado a datos de fechas de nacimiento de celebridades, aunque la model card no documenta explicitamente el objetivo ni el dataset utilizado.

El artefacto es exclusivamente un adaptador: no incluye los pesos completos del modelo base, sino unicamente los tensores LoRA en formato safetensors (1,7 GB de repositorio). Para utilizarlo es necesario descargar por separado el modelo base de 70.000 millones de parametros y cargar el adaptador mediante la libreria PEFT, tal como indica la etiqueta `library_name: peft` y la version de framework declarada (PEFT 0.12.0).

La relevancia de esta ficha es limitada por la ausencia de documentacion: la model card es una plantilla sin rellenar (todos los campos aparecen como "[More Information Needed]"), no se declaran licencia, idiomas ni resultados de evaluacion, y el repositorio registra cero descargas y cero likes. Se trata, por tanto, de un experimento de ajuste fino de proposito no documentado, util como referencia tecnica de como se estructura un adaptador LoRA sobre Llama 3.3, pero no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Llama 3.3 70B Instruct Reference) |
| Parametros totales | 70.000 millones en el modelo base; el adaptador LoRA no declara su numero de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; heredada del modelo base (no declarada en este repositorio) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors sin indicar precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre un transformer decoder-only de tipo Llama 3.3, que emplea atencion por grupos de consultas (GQA) y activaciones SwiGLU, aunque los detalles concretos de la arquitectura del modelo base no se documentan en este repositorio. El artefacto publicado es un conjunto de matrices de bajo rango (LoRA) que modifican selectivamente las proyecciones del modelo base congelado, reduciendo drasticamente el numero de parametros entrenables frente a un ajuste completo.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el regimen de precision (fp16, bf16, fp8) ni la existencia de fases de RLHF o DPO posteriores. El sufijo del identificador (`celebrities_dob_mixed`) apunta a un corpus de fechas de nacimiento de celebridades, probablemente orientado a memorizacion o extraccion de datos factuales, pero esto es una inferencia a partir del nombre y no un dato confirmado por el autor. La unica informacion tecnica verificable es la version de PEFT utilizada (0.12.0).

## Capacidades

- Generacion de texto autoregresiva heredada del modelo base Llama 3.3 70B Instruct.
- Razonamiento multi-paso y seguimiento de instrucciones, condicionado por el modelo base.
- Generacion de codigo y matematicas, presumiblemente conservada del modelo base, sin verificacion documentada.
- Posible especializacion en recuperacion de fechas de nacimiento de celebridades (inferida del nombre del adaptador).
- Soporte de tool calling y function calling: no disponible de forma explicita en este repositorio; depende del modelo base.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Experimentacion con ajuste fino parametrizado eficiente (PEFT): el adaptador sirve como ejemplo reproducible de como se empaqueta un LoRA sobre Llama 3.3 70B y se carga con la libreria PEFT 0.12.0.
- Investigacion sobre memorizacion factual: si el sufijo del nombre refleja el contenido real, el adaptador puede estudiarse para analizar como un ajuste LoRA modifica la recuperacion de datos factuales (fechas de nacimiento) frente al modelo base.
- Evaluacion de transferencia de conocimiento en adaptadores de bajo rango: comparar la salida del adaptador con la del modelo base sin adaptador para medir el efecto del ajuste en tareas de recuperacion de hechos.
- Base para nuevos ajustes incrementales: el adaptador puede servir como punto de partida (merge o apilado) para experimentos posteriores sobre el mismo modelo base.
- Auditoria de artefactos no documentados: util como caso de estudio sobre riesgos de repositorios sin model card, sin licencia y sin evaluacion, dentro de pipelines de gobernanza de modelos.
- Docencia y formacion: ejemplo practico de estructura de un repositorio PEFT (safetensors, tags de base_model y adapter) para explicar el ciclo de vida de un adaptador LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 1,7 GB en disco y requiere muy poca VRAM adicional en inferencia, pero necesita cargar el modelo base Llama 3.3 70B completo.
- Inferencia en precision completa (bf16) del modelo base: aproximadamente 140 GB de VRAM, lo que exige GPUs de clase A100 80 GB (multiples), H100 80 GB o H200.
- Cuantizacion del modelo base a 4 bits (por ejemplo, GPTQ, AWQ o GGUF Q4): reduce el requisito a aproximadamente 35-40 GB de VRAM, viable en una unica A100 80 GB o en configuraciones multi-GPU consumer (2x RTX 4090 de 24 GB).
- En GPUs consumer individuales (RTX 4090 24 GB, RTX 3090 24 GB): no cabe el modelo base ni siquiera en 4 bits con margen suficiente para contexto largo; es necesario repartir capas entre varias GPUs o usar almacenamiento en CPU.
- Opciones de despliegue: vLLM y TGI para servir el modelo base con el adaptador cargado; llama.cpp u Ollama para variantes GGUF cuantizadas (requiere fusionar el adaptador con el modelo base antes de convertir); transformers + PEFT para uso en investigacion.
- Latencia y throughput: no disponibles; dependen enteramente del hardware y del backend de inferencia elegido para el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Documentacion |
|---|---|---|---|---|---|
| Este adaptador (believe-it-or-not/Llama-3.3-70B-Instruct-Reference-celebrities_dob_mixed) | LoRA sobre 70B | no disponible | no disponible | Hugging Face, 0 descargas | Model card vacia |
| Meta Llama 3.3 70B Instruct (modelo base) | 70B | no disponible en este repositorio | Llama 3.3 Community License | Hugging Face, ampliamente distribuido | Model card completa |
| Adaptadores LoRA genericos sobre Llama 3.1/3.3 70B | LoRA sobre 70B | no disponible | variable segun autor | Hugging Face | Variable |
| Mistral Large o Qwen 2.5 72B | ~70-72B | no disponible | licencias comerciales o Apache 2.0 segun variante | Hugging Face | Model cards completas |

La comparativa se limita a nivel estructural porque este repositorio no publica metricas, contexto ni licencia; cualquier comparacion de rendimiento con alternativas de la misma categoria no es posible con los datos disponibles.

## Limitaciones y advertencias

- Model card practicamente vacia: todos los campos de descripcion, uso, sesgos, evaluacion y citacion aparecen como "[More Information Needed]".
- Ausencia de licencia declarada: no se puede determinar si el uso comercial esta permitido; ademas, el modelo base Llama 3.3 impone sus propios terminos (Llama 3.3 Community License) que prevalecen.
- Riesgo elevado de alucinacion en tareas factuales: un ajuste orientado a fechas de nacimiento de celebridades puede sobreajustar y producir datos incorrectos con alta confianza, especialmente en personas poco representadas en el corpus.
- Sesgos desconocidos: al no documentarse el dataset, no es posible auditar sesgos de genero, nacionalidad, popularidad mediatica o sesgo temporal en las fechas.
- Idiomas no declarados: no hay garantia de comportamiento multilingue ni de calidad en castellano.
- Sin evaluacion ni benchmarks: no existe evidencia publicada sobre la degradacion o mejora del modelo base tras aplicar el adaptador.
- Cero adopcion (0 descargas, 0 likes) y sin pipeline declarado: artefacto experimental sin validacion comunitaria.
- Requiere descargar el modelo base de 70B por separado, con coste de almacenamiento y computo considerable; el adaptador por si solo no es utilizable.
- Fecha de creacion futura registrada (2026-11-16) y tags con referencia a un paper generico de impacto ambiental (arXiv:1910.09700), lo que sugiere que la metadata no fue revisada con rigor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/Llama-3.3-70B-Instruct-Reference-celebrities_dob_mixed-a2c518f8
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Libreria PEFT: https://github.com/huggingface/peft
- Paper referenciado en los tags (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
