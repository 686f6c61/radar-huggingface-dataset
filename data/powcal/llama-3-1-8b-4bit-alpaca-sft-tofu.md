# PowCal/Llama-3.1-8B-4bit-alpaca-sft-tofu

## Resumen

PowCal/Llama-3.1-8B-4bit-alpaca-sft-tofu es un checkpoint derivado de Llama 3.1 8B publicado en Hugging Face por el usuario PowCal. El nombre del repositorio indica tres operaciones encadenadas sobre el modelo base: cuantizacion a 4 bits, ajuste supervisado (SFT) sobre el dataset Alpaca y un entrenamiento posterior orientado al benchmark TOFU (Task of Fictitious Unlearning). El tamano del repositorio (0,1 GB) es coherente con un adaptador o un conjunto de pesos parciales, no con un checkpoint completo de 8B en 4 bits, que rondaria los 4-5 GB.

La model card esta generada automaticamente y no aporta informacion sustantiva: no declara autor real, licencia, idiomas, datos de entrenamiento ni resultados. Todo lo que se puede afirmar con rigor procede del identificador del repositorio y de las caracteristicas conocidas del modelo base Llama 3.1 8B de Meta, que se detallan a continuacion con la advertencia de que el autor no las confirma.

El interes de este checkpoint es acotado y experimental: sirve como material de partida para estudiar desaprendizaje (unlearning) sobre TOFU, evaluar el efecto de la cuantizacion a 4 bits antes del SFT y reproducir pipelines de ajuste ligero. No es un modelo recomendado para produccion sin una evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 8B); no confirmado por el autor |
| Parametros totales | 8B (segun el nombre del repositorio y el modelo base); no confirmado por el autor |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens en Llama 3.1 8B; no confirmado para este checkpoint |
| Tipos de cuantizacion | 4 bits (segun el nombre); esquema exacto (GPTQ, AWQ, bitsandbytes NF4) no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base Llama 3.1 usa Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only con atencion por grupos (GQA), RoPE y normalizacion RMSNorm, entrenado originalmente por Meta sobre aproximadamente 15 billones de tokens. El checkpoint de PowCal anade, segun el nombre, una cuantizacion a 4 bits, un SFT sobre Alpaca y una fase adicional vinculada a TOFU. El orden exacto de estas etapas, los hiperparametros, el numero de pasos y la composicion del dataset no estan documentados en la model card.

TOFU es un benchmark de desaprendizaje construido sobre 200 autores ficticios con pares pregunta-respuesta; se usa para medir si un modelo olvida selectivamente informacion tras un ajuste. El sufijo "sft-tofu" sugiere que el autor entreno sobre TOFU tras el SFT con Alpaca, pero no se especifica si el objetivo era retener, olvidar o simplemente evaluar. Tampoco hay informacion sobre RLHF, DPO ni sobre tecnicas de decodificacion especulativa. No se han publicado detalles de infraestructura de computo ni de emisiones.

## Capacidades

- Generacion de texto en ingles principalmente, heredada de Llama 3.1 8B; el autor no declara idiomas.
- Razonamiento y respuesta a instrucciones, condicionados por el SFT sobre Alpaca.
- Generacion de codigo y matematicas basicas, segun las capacidades del modelo base.
- Soporte de tool calling y function calling: el modelo base Llama 3.1 lo incluye, pero el autor no confirma que se preserve tras la cuantizacion y el ajuste.
- Capacidades de agente y razonamiento multi-paso: no verificadas en este checkpoint.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Investigacion en desaprendizaje: usar el checkpoint como referencia para reproducir experimentos TOFU y comparar la retencion de conocimiento ficticio antes y despues del ajuste.
- Evaluacion del impacto de la cuantizacion: comparar las respuestas de este checkpoint 4 bits con el modelo base en fp16 sobre un conjunto fijo de prompts para medir la degradacion introducida.
- Reproduccion de pipelines SFT: servir de ejemplo de ajuste supervisado ligero sobre Alpaca para validar flujos de entrenamiento en entornos con VRAM limitada.
- Pruebas de regresion de inferencia: validar que un servidor compatible con la API de OpenAI (etiqueta endpoints_compatible) carga y responde correctamente con pesos cuantizados.
- Docencia y formacion: ilustrar en un curso las diferencias entre un modelo base, un SFT y un ajuste de desaprendizaje sobre el mismo backbone.
- Base para ajustes posteriores: partir de este checkpoint para experimentos de alineacion o filtrado que requieran un modelo de 8B ya instruido y con huella de memoria reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 4 bits: aproximadamente 5-6 GB para los pesos, mas overhead de activaciones y cache KV; con contexto largo la cache crece de forma significativa.
- GPU recomendadas: A100 40 GB u H100 80 GB para contexto completo de 128K; L40S o RTX 6000 Ada para despliegues de produccion.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 3090 (24 GB) con contexto moderado; en GPUs de 8 GB solo con contexto muy reducido.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI y llama.cpp si se genera un GGUF a partir de los pesos; Ollama requeriria conversion previa.
- Latencia y throughput: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PowCal/Llama-3.1-8B-4bit-alpaca-sft-tofu | 8B | no confirmado (128K en el base) | no disponible | Hugging Face | Checkpoint experimental, sin benchmarks |
| meta-llama/Llama-3.1-8B | 8B | 128K | Llama 3.1 Community License | Hugging Face, ampliamente adoptado | Modelo base oficial de Meta |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Hugging Face | Version instruida oficial, con evaluaciones publicadas |
| Modelos 8B cuantizados de la comunidad (p. ej. variantes GGUF/AWQ de Llama 3.1) | 8B | 128K | segun autor | Hugging Face | Alternativas mas documentadas para despliegue en 4 bits |

## Limitaciones y advertencias

- La model card no documenta autor, licencia, datos ni evaluacion; el uso comercial queda en un limbo legal hasta verificar la licencia del modelo base.
- El tamano del repositorio (0,1 GB) sugiere que no contiene un checkpoint completo de 8B; puede tratarse de un adaptador, de pesos parciales o de un error de publicacion. Conviene inspeccionar los archivos antes de usarlo.
- El ajuste sobre TOFU puede haber alterado el comportamiento del modelo de formas no documentadas, incluida la perdida de capacidades del modelo base.
- La cuantizacion a 4 bits introduce degradacion adicional respecto al modelo en fp16, especialmente en tareas de razonamiento y codigo.
- Riesgo de alucinacion inherente a los modelos de 8B, agravado por la falta de evaluacion.
- Sesgos heredados de los datos de pretraining de Llama 3.1 y de Alpaca, no auditados en este checkpoint.
- Sin garantias de soporte, mantenimiento ni actualizaciones por parte del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/PowCal/Llama-3.1-8B-4bit-alpaca-sft-tofu
- Modelo base oficial: https://huggingface.co/meta-llama/Llama-3.1-8B
- Paper citado en las etiquetas (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Leaderboard general de LLMs: https://llm-stats.com/leaderboards/llm-leaderboard
