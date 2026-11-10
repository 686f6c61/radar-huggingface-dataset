# huggingtime12/Qwen3-1.7B-noKL-PhoMT-GRPO-COMET

## Resumen

Qwen3-1.7B-noKL-PhoMT-GRPO-COMET es un adaptador LoRA (PEFT) publicado por el usuario huggingtime12 sobre el modelo base huggingtime12/Qwen3-1.7B-PhoMT-SFT-Merged, que a su vez deriva de la familia Qwen3 en su variante de 1.700 millones de parametros. El nombre del repositorio indica que el adaptador se ha entrenado con GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo, y que el proceso prescinde de una divergencia KL explicita frente al modelo de referencia ("noKL"), ademas de estar vinculado a PhoMT, un corpus publico de traduccion chino-vietnamita.

El modelo se distribuye como adaptador LoRA en formato safetensors dentro de la libreria PEFT y se etiqueta para la tarea de text-generation con caracter conversacional. El repositorio ocupa aproximadamente 0,3 GB, un tamano coherente con pesos de adaptador de bajo rango y no con un modelo completo. No se ha publicado informacion sobre licencia, idiomas, datos de entrenamiento ni hiperparametros.

La relevancia de esta ficha es limitada pero concreta: sirve como referencia para quienes experimentan con GRPO sin termino KL sobre modelos pequenos y para quienes quieran reproducir o auditar un pipeline de ajuste fino en dos fases (SFT y posteriormente RL) sobre Qwen3-1.7B. La model card del autor es la plantilla por defecto de Hugging Face y no aporta detalles tecnicos adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B); el artefacto publicado es un adaptador LoRA |
| Parametros totales | 1.700 millones en el modelo base; el adaptador LoRA no declara numero de parametros entrenables |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors y puede combinarse con el base cuantizado, pero no se documenta |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.18.0, transformers, TRL |
| Modelo base | huggingtime12/Qwen3-1.7B-PhoMT-SFT-Merged |
| Metodo de ajuste | GRPO sin termino KL |
| Tamano del repositorio | 0,3 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen3, que emplea una arquitectura transformer decoder-only con atencion por causalidad estandar. Sobre ese base, el autor ha aplicado un ajuste supervisado previo (el checkpoint SFT-Merged) y despues un entrenamiento con GRPO, una variante de optimizacion por politica proximal que estima la ventaja relativa agrupando multiples muestras por prompt. La etiqueta "noKL" sugiere que se ha eliminado la penalizacion por divergencia KL respecto al modelo de referencia, una decision que reduce el anclaje al comportamiento del modelo SFT y aumenta la libertad de exploracion de la politica, a costa de un mayor riesgo de deriva.

El sufijo "PhoMT" apunta a que el entrenamiento se ha realizado sobre el corpus PhoMT (traduccion chino-vietnamita), aunque no se especifica si el adaptador final esta especializado en traduccion o si PhoMT se uso solo como fuente de prompts. No se han publicado datos sobre numero de tokens, composicion del dataset, hiperparametros de GRPO (tamano de grupo, ratio de recorte, tasa de aprendizaje) ni sobre el hardware empleado. Tampoco se documenta si hubo etapas adicionales de DPO o RLHF.

## Capacidades

- Generacion de texto autoregresiva y conversacional, heredada del modelo base Qwen3-1.7B.
- Razonamiento multi-paso y respuesta a instrucciones, presumiblemente reforzado por la fase GRPO, aunque no se aportan evidencias empiricas.
- Traduccion chino-vietnamita potencial, dado el uso de PhoMT en el pipeline de entrenamiento; no confirmado por el autor.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada; depende del modelo base y no se documenta en el adaptador.
- Capacidades de agente y planificacion: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el autor no declara lista de idiomas.
- Modo thinking, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre GRPO sin termino KL: el adaptador sirve como punto de partida reproducible para comparar el efecto de eliminar la penalizacion KL en tareas de razonamiento con modelos de 1,7B, midiendo deriva respecto al checkpoint SFT.
- Experimentos de traduccion chino-vietnamita: si el entrenamiento uso PhoMT, el adaptador puede evaluarse en pares zh-vi para comprobar si el refuerzo mejora la fidelidad frente al SFT base, siempre con validacion humana.
- Ajuste fino de bajo coste en una sola GPU: al ser un adaptador LoRA de 0,3 GB, se puede cargar sobre el base en una GPU consumer y experimentar con merges y cuantizaciones sin reentrenar.
- Generacion de respuestas conversacionales en prototipos: util para construir demos de chatbot con contexto corto donde el coste de inferencia importa mas que la precision absoluta.
- Evaluacion de robustez y alucinacion en modelos pequenos post-RL: el checkpoint permite estudiar si el refuerzo sin anclaje KL incrementa respuestas plausibles pero incorrectas.
- Base para ablaciones academicas: comparar GRPO con y sin KL, distintos tamanos de grupo y distintas recompensas sobre el mismo modelo SFT, usando este adaptador como rama experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador suma 0,3 GB; el modelo base Qwen3-1.7B en bf16 requiere del orden de 3,5-4 GB de pesos, y en cuantizacion de 8 bits alrededor de 2 GB, aunque estas cifras son estimaciones estandar y no estan confirmadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 con margen para el contexto; RTX 3060, RTX 4060 Ti, RTX 4090, A100 o H100 son opciones razonables segun el lote y la longitud de contexto.
- Cabe en GPU consumer: si, en tarjetas de 8 GB o superiores en cuantizacion de 8 o 4 bits; en bf16 conviene disponer de 12 GB o mas para contextos largos.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM y TGI si se fusiona el adaptador con el base; llama.cpp u Ollama tras conversion a GGUF del modelo fusionado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B-noKL-PhoMT-GRPO-COMET | 1,7B (base) + LoRA | no disponible | no disponible | Hugging Face, 0 descargas | Adaptador GRPO sin KL, sin benchmarks |
| Qwen3-1.7B (base oficial) | 1,7B | no disponible en esta ficha | licencia Qwen (segun publicacion oficial) | Hugging Face, ampliamente usado | Modelo de referencia sin ajuste RL |
| huggingtime12/Qwen3-1.7B-PhoMT-SFT-Merged | 1,7B | no disponible | no disponible | Hugging Face | Checkpoint SFT previo al GRPO |
| Otros adaptadores GRPO sobre modelos pequenos | variable | variable | variable | Hugging Face | Comparacion cualitativa; no hay datos publicados para contrastar |

## Limitaciones y advertencias

- La model card es la plantilla por defecto de Hugging Face y no contiene informacion sobre sesgos, datos, licencia ni evaluacion.
- El entrenamiento sin termino KL puede provocar deriva respecto al modelo SFT, con mayor riesgo de respuestas fuera de distribucion o de recompensas mal explotadas.
- Riesgo de alucinacion elevado en un modelo de 1,7B, especialmente en tareas de conocimiento factual y matematicas.
- No se declara licencia, lo que impide confirmar si el uso comercial esta permitido; hay que contactar con el autor o asumir la licencia del modelo base Qwen3.
- No se declaran idiomas soportados; el uso en castellano no esta validado.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso comunitario ni de validacion externa.
- El adaptador debe combinarse con el modelo base correcto (huggingtime12/Qwen3-1.7B-PhoMT-SFT-Merged); cargarlo sobre otro checkpoint puede degradar el rendimiento.
- No se documentan hiperparametros de GRPO ni la funcion de recompensa, lo que dificulta reproducir el entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/huggingtime12/Qwen3-1.7B-noKL-PhoMT-GRPO-COMET
- Modelo base: https://huggingface.co/huggingtime12/Qwen3-1.7B-PhoMT-SFT-Merged
- Referencia de impacto ambiental citada en la model card: https://mlco2.github.io/impact#compute
- Articulo citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
