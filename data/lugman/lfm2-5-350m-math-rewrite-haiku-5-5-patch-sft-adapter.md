# lugman/LFM2.5-350M-Math-Rewrite-Haiku-5-5-Patch-SFT-adapter

## Resumen

LFM2.5-350M-Math-Rewrite-Haiku-5-5-Patch-SFT-adapter es un adaptador de ajuste fino supervisado (SFT) publicado por el usuario lugman sobre el modelo base LiquidAI/LFM2.5-350M. Se trata, por tanto, de un derivado de un modelo pequeno de la familia LFM2 de Liquid AI, especializado mediante entrenamiento supervisado en una tarea concreta de reescritura de contenido matematico, segun indica el propio nombre del repositorio. El autor lo ha entrenado con Unsloth, herramienta que acelera el ajuste fino de modelos transformer.

El modelo base LFM2.5-350M pertenece a la familia LFM2 de Liquid AI, disenada para despliegue en dispositivos con recursos limitados. Con 350 millones de parametros, es un modelo compacto orientado a inferencia eficiente en CPU y GPU de gama baja. El adaptador anade un comportamiento especifico de reescritura de enunciados o soluciones matematicas en un estilo determinado (el sufijo "Haiku-5-5-Patch" sugiere una variante concreta del dataset o del prompt de entrenamiento).

La relevancia de esta ficha es limitada en terminos de impacto: el repositorio no tiene descargas ni likes, no incluye resultados de evaluacion y la model card es la plantilla generica de Unsloth. Debe tratarse como un experimento de ajuste fino mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM2 de Liquid AI; detalles exactos no disponibles) |
| Parametros totales | 350M (modelo base) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador; el repo indica 0.0 GB de tamano) |

## Arquitectura y entrenamiento

El modelo base LiquidAI/LFM2.5-350M es un transformer de 350 millones de parametros de la familia LFM2 de Liquid AI, orientada a eficiencia en inferencia. La informacion disponible no detalla la composicion exacta de sus capas, el mecanismo de atencion ni la longitud de contexto nativa.

El adaptador se ha entrenado mediante SFT (supervised fine-tuning) con la libreria TRL y la herramienta Unsloth, segun los tags y la model card. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. El nombre del repositorio sugiere un dataset de reescritura de contenido matematico con un estilo o plantilla concreta ("Haiku-5-5-Patch"), pero no hay documentacion que lo confirme. Tampoco se indica si el adaptador es LoRA, QLoRA u otra variante; el tag "adapter" y el tamano de 0.0 GB del repositorio apuntan a pesos de adaptador de bajo rango, pero no es un dato confirmado.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base LFM2.5-350M.
- Reescritura de contenido matematico segun el ajuste fino aplicado (tarea declarada en el nombre del repositorio, sin documentacion adicional).
- Razonamiento basico y generacion de texto corto, limitado por el tamano de 350M parametros.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Reescritura de enunciados matematicos: el adaptador puede reformular problemas o soluciones matematicas en el estilo del dataset de entrenamiento, util para normalizar contenido en plataformas educativas.
- Generacion de variantes de ejercicios: a partir de un problema existente, producir reformulaciones con la misma estructura matematica para bancos de ejercicios.
- Preprocesado de contenido educativo: adaptar texto matematico a un registro o plantilla concreta antes de publicarlo en un LMS.
- Prototipado de pipelines de ajuste fino: sirve como ejemplo reproducible de SFT con Unsloth y TRL sobre un modelo de 350M, util para experimentar con hiperparametros y datasets.
- Inferencia en dispositivos con recursos muy limitados: al derivar de un modelo de 350M, puede ejecutarse en CPU o GPU de gama baja para tareas de reescritura de texto corto.
- Filtrado y clasificacion ligera de texto matematico: con un ajuste adicional, el adaptador podria usarse para detectar o etiquetar fragmentos matematicos en documentos, aunque esta capacidad no esta documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de 350M parametros, una estimacion orientativa en fp16 seria de aproximadamente 0.7 GB de pesos, y en cuantizacion de 4 bits alrededor de 0.2-0.3 GB, mas overhead de activaciones y cache KV; estas cifras son estimaciones generales, no datos del repositorio.
- GPU recomendadas: no disponible. Por tamano, cabria en GPU consumer como RTX 3060, RTX 4060 o superiores, e incluso en CPU.
- Cabe en GPU consumer: si, por el tamano del modelo base (350M), aunque no hay confirmacion oficial.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM2.5-350M-Math-Rewrite-Haiku-5-5-Patch-SFT-adapter (este) | 350M (base) | no disponible | apache-2.0 | Hugging Face, 0 descargas | Adaptador SFT sin evaluacion publicada |
| LiquidAI/LFM2.5-350M | 350M | no disponible | no disponible en esta ficha | Hugging Face (modelo base) | Modelo base sin ajuste especifico |
| Qwen2.5-0.5B | 500M | 32K (segun documentacion publica de Qwen) | Apache 2.0 | Hugging Face | Alternativa compacta multilingue |
| SmolLM2-360M | 360M | 8K (segun documentacion publica) | Apache 2.0 | Hugging Face | Alternativa compacta en ingles |

Los datos de contexto y licencia de los modelos comparables provienen de su documentacion publica habitual; no se han verificado en esta ficha. No hay benchmarks del modelo evaluado para comparar rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de un modelo base entrenado con datos web, puede heredar sesgos de esos datos.
- Riesgo de alucinacion: alto en un modelo de 350M, especialmente en tareas matematicas donde la verificacion es critica.
- Limitaciones de contexto o idioma: solo ingles declarado; longitud de contexto no disponible.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y de los datos de entrenamiento del adaptador, no documentados.
- Caveats para produccion: sin evaluacion publicada, sin descargas ni validacion de la comunidad, y con una model card generica; no recomendable para produccion sin una evaluacion propia exhaustiva.
- El repositorio indica un tamano de 0.0 GB, lo que sugiere que los pesos del adaptador pueden no estar subidos o ser muy pequenos; conviene verificar la integridad de los ficheros antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/LFM2.5-350M-Math-Rewrite-Haiku-5-5-Patch-SFT-adapter
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
