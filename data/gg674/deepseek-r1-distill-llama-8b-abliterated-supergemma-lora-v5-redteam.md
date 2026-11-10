# gg674/deepseek-r1-distill-llama-8b-abliterated-supergemma-lora-v5-redteam

## Resumen

El modelo `gg674/deepseek-r1-distill-llama-8b-abliterated-supergemma-lora-v5-redteam` es un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo base `huihui-ai/DeepSeek-R1-Distill-Llama-8B-abliterated`, que a su vez es una version "abliterated" (con los rechazos eliminados) del destilado de DeepSeek-R1 sobre Llama-3.1-8B. El autor, `gg674`, publica el adaptador con la libreria PEFT y un tamano de repositorio de 0.2 GB, lo que corresponde exclusivamente a los pesos del adaptador, no al modelo completo.

La relevancia de esta ficha es limitada y conviene ser transparente: se trata de un adaptador de investigacion sin model card sustantiva, sin datos de entrenamiento declarados, sin licencia especificada y con cero descargas y cero likes en el momento de la consulta. El nombre sugiere un entrenamiento orientado a "red teaming" (evaluacion de seguridad ofensiva) y a un dataset o estilo denominado "supergemma", pero no hay documentacion que lo confirme. No debe confundirse con un modelo listo para produccion.

Arquitectonicamente hereda todo del modelo base: un transformer denso de 8 mil millones de parametros derivado de Llama-3.1, con el proceso de destilacion de razonamiento de DeepSeek-R1. El adaptador anade un pequeno conjunto de pesos entrenables que modifican el comportamiento del modelo base, por lo que para utilizarlo es imprescindible cargar primero el modelo base y despues aplicar el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso del modelo base DeepSeek-R1-Distill-Llama-8B-abliterated |
| Parametros totales | 8B en el modelo base; el adaptador ocupa 0.2 GB en el repositorio (numero exacto de parametros del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, sin confirmar) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; las cuantizaciones dependen del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.20.0 |
| Modelo base | huihui-ai/DeepSeek-R1-Distill-Llama-8B-abliterated |
| Metodo de entrenamiento | SFT (segun tags: `sft`, `lora`, `unsloth`, `trl`) |
| Tamano del repositorio | 0.2 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango aplicado sobre un transformer denso de 8B parametros. El modelo base es un destilado de DeepSeek-R1 sobre Llama-3.1-8B, posteriormente sometido a un proceso de "abliteration" por parte de `huihui-ai` para eliminar los comportamientos de rechazo. La arquitectura subyacente, por tanto, es la de Llama-3.1-8B (transformer decoder-only con atencion por grupos, GQA), no una arquitectura MoE ni hibrida.

Los unicos datos de entrenamiento disponibles son los tags del repositorio: `sft` (supervised fine-tuning), `lora`, `unsloth` y `trl`, lo que indica que el adaptador se entreno con el stack de Unsloth/TRL sobre un dataset de instrucciones no especificado. No hay informacion sobre el numero de tokens, la composicion del dataset, el uso de RLHF/DPO, hiperparametros ni regimen de precision. La model card es la plantilla por defecto de Hugging Face sin rellenar, con todos los campos marcados como "[More Information Needed]".

## Capacidades

- Generacion de texto conversacional, heredada del modelo base destilado de DeepSeek-R1.
- Razonamiento en cadena (el modelo base es un destilado de R1, por lo que tiende a producir trazas de razonamiento), aunque el adaptador puede alterar este comportamiento y no hay evaluacion que lo confirme.
- Capacidad de seguir instrucciones mediante SFT, segun el tag `sft`.
- Comportamiento "abliterated": el modelo base elimina los rechazos, por lo que cabe esperar menor tendencia a declinar peticiones, con los riesgos asociados.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.

## Casos de uso

- Investigacion en seguridad de LLM (red teaming): el nombre del adaptador y su origen "abliterated" lo situan como candidato para probar comportamientos del modelo ante prompts adversarios en entornos controlados, comparando la respuesta del adaptador frente al modelo base.
- Estudio de adaptadores LoRA: util para analizar como un adaptador de 0.2 GB modifica el comportamiento de un modelo de 8B, midiendo deriva respecto al modelo base en tareas de instruccion.
- Experimentos de alineacion y rechazo: permite comparar la tasa de rechazo del modelo base abliterated frente a la version con adaptador, como material de analisis en investigacion sobre politicas de seguridad.
- Prototipado de pipelines de generacion de texto con PEFT: sirve para validar flujos de carga de adaptadores con `transformers` + `peft` antes de escalar a modelos mayores.
- Generacion de datos sinteticos para evaluacion: en un entorno aislado, puede emplearse para producir respuestas que alimenten conjuntos de prueba de clasificadores de seguridad.
- Docencia y demostraciones: ilustra el ciclo completo de un fine-tuning LoRA sobre un destilado de razonamiento, sin necesidad de infraestructura pesada gracias al reducido tamano del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 0.2 GB, pero requiere cargar el modelo base de 8B parametros para funcionar.
- VRAM estimada para el modelo base en FP16/BF16: aproximadamente 16 GB, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB; en 4 bits: alrededor de 5-6 GB (estimaciones estandar para un modelo de 8B, no verificadas para este adaptador concreto).
- GPU recomendadas: A100 40 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantizacion 8 bits o 4 bits.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas si se cuantiza el modelo base a 4 bits.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador; el modelo base fusionado podria exportarse a GGUF para llama.cpp/Ollama o servirse con vLLM/TGI, pero no hay documentacion que confirme compatibilidad ni recetas publicadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (gg674) | 8B (base) + LoRA | no disponible | no disponible | Hugging Face, 0 descargas | Adaptador de investigacion sin documentacion |
| huihui-ai/DeepSeek-R1-Distill-Llama-8B-abliterated | 8B | no disponible | no disponible | Hugging Face | Modelo base abliterated del adaptador |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | 8B | 128K (segun model card original de DeepSeek) | Licencia MIT (segun publicacion original de DeepSeek) | Hugging Face | Destilado oficial de R1 sobre Llama-3.1-8B |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Hugging Face | Modelo instructivo de referencia de Meta |

La comparativa es aproximada: los datos del modelo base oficial y de Llama-3.1-Instruct provienen de sus respectivas publicaciones, mientras que los de este adaptador y su base abliterated no estan documentados en la informacion disponible.

## Limitaciones y advertencias

- La model card es una plantilla vacia: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni uso previsto.
- Licencia no especificada: no se puede confirmar el uso comercial. Ademas, el modelo base deriva de Llama-3.1, cuya licencia de comunidad impone restricciones que probablemente se heredan, pero esto no esta declarado.
- El proceso "abliterated" del modelo base elimina los rechazos de seguridad, lo que incrementa el riesgo de generar contenido danino, sesgado o inapropiado. El adaptador puede amplificar o modificar este comportamiento sin control documentado.
- Riesgo elevado de alucinacion: los destilados de razonamiento de 8B tienden a producir cadenas de pensamiento plausibles pero incorrectas, y no hay evaluacion que cuantifique este riesgo en el adaptador.
- Sin datos de sesgos: no se ha realizado ninguna evaluacion de sesgo conocida.
- Idiomas y contexto no confirmados: no se puede garantizar el comportamiento multilingue ni la ventana de contexto efectiva tras el fine-tuning.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion externa.
- No apto para produccion sin una evaluacion exhaustiva previa y sin aclarar la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gg674/deepseek-r1-distill-llama-8b-abliterated-supergemma-lora-v5-redteam
- Modelo base: https://huggingface.co/huihui-ai/DeepSeek-R1-Distill-Llama-8B-abliterated
- Destilado oficial de DeepSeek-R1 sobre Llama-8B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Repositorio de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
- Calculadora de impacto ambiental (Lacoste et al., 2019): https://mlco2.github.io/impact
- Paper citado en los tags (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
