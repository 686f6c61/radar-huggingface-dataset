# h2sunni/oncurai-gemma2-2b-lora

## Resumen

oncurai-gemma2-2b-lora es un repositorio de Hugging Face publicado por el usuario h2sunni que, por su nombre y etiquetas, corresponde a un adaptador LoRA entrenado sobre un modelo base de la familia Gemma 2 de 2.000 millones de parametros. El repositorio incluye pesos en formato safetensors con cuantizacion de 4 bits mediante bitsandbytes, y ocupa 1,6 GB en total. No dispone de model card publica, pipeline declarado, licencia explicita ni idiomas documentados.

La relevancia de esta publicacion es limitada y fundamentalmente practica: se trata de un artefacto derivado (un fine-tuning de bajo rango) sobre un modelo pequeno de Google, orientado presumiblemente a un dominio concreto que el nombre "oncurai" sugiere relacionado con oncologia o asistencia clinica, aunque esta interpretacion no esta confirmada por ninguna documentacion del autor. Al no existir model card ni resultados publicados, cualquier evaluacion de su calidad debe hacerse mediante inspeccion directa de los pesos y pruebas controladas.

Para un desarrollador o investigador, este repositorio debe tratarse como un experimento personal no documentado: es util como punto de partida para inspeccionar la tecnica de fine-tuning aplicada, pero no es adecuado para produccion sin una evaluacion exhaustiva previa, verificacion de la licencia del modelo base y comprobacion de sesgos y alucinaciones en el dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Gemma 2, segun el nombre del repositorio); no confirmado en documentacion |
| Parametros totales | 2.000 millones (aproximado, segun el nombre del modelo base Gemma 2 2B); no confirmado |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (el modelo base Gemma 2 2B soporta hasta 8.192 tokens, pero no se confirma para este adaptador) |
| Tipos de cuantizacion | 4 bits con bitsandbytes (segun tags del repositorio); safetensors como formato de pesos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (cuantizacion 4-bit, bitsandbytes) |

## Arquitectura y entrenamiento

La informacion disponible no permite confirmar la arquitectura exacta del adaptador. Por el nombre del repositorio y la etiqueta "gemma4" (probablemente un identificador interno o un error de etiquetado respecto a Gemma 2), se infiere que se trata de un LoRA aplicado sobre Gemma 2 2B, un transformer decoder-only con atencion por ventanas alternas y atencion global, disenado por Google DeepMind. El adaptador en si seria una actualizacion de bajo rango sobre las matrices de proyeccion del modelo base, aunque no se especifica ni el rango, ni las capas objetivo, ni el dataset de entrenamiento.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas adicionales. El repositorio incluye pesos cuantizados a 4 bits con bitsandbytes, lo que sugiere que el autor preparo el artefacto para inferencia con recursos limitados, pero se desconoce si el entrenamiento se realizo en ese mismo formato o si la cuantizacion es posterior.

## Capacidades

- Generacion de texto autoregresiva heredada del modelo base Gemma 2 2B, condicionada por el fine-tuning LoRA aplicado.
- Razonamiento y respuesta a instrucciones en el dominio especifico para el que fue entrenado (presumiblemente oncologia o ambito clinico, no confirmado).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de fine-tunings medicos: el adaptador puede cargarse sobre Gemma 2 2B con PEFT para inspeccionar como un LoRA de bajo rango modifica el comportamiento del modelo base en preguntas de dominio oncologico, comparando respuestas antes y despues del adaptador.
- Prototipado de asistentes clinicos de bajo coste: al partir de un modelo de 2B cuantizado a 4 bits, puede desplegarse en una unica GPU de consumo para experimentar con flujos de triaje o resumen de informes, siempre con supervision humana y sin uso clinico real.
- Investigacion sobre sesgos en modelos medicos: sirve como caso de estudio para analizar si un fine-tuning sin documentacion introduce sesgos adicionales respecto al modelo base en subpoblaciones, mediante baterias de prompts controladas.
- Base para experimentos de destilacion o merging: los pesos del adaptador pueden combinarse con otros LoRA del ecosistema Gemma 2 2B para estudiar efectos de composicion de adaptadores en tareas especializadas.
- Docencia en tecnicas de PEFT: el repositorio, pese a su falta de documentacion, es un ejemplo real de como se publica un adaptador cuantizado a 4 bits con bitsandbytes, util para ilustrar el flujo completo desde el entrenamiento hasta la distribucion.
- Generacion de borradores de texto tecnico en el dominio: con validacion posterior por expertos, puede emplearse para redactar resumenes preliminares de literatura oncologica, aprovechando que el modelo base Gemma 2 2B maneja contextos de hasta 8.192 tokens si el adaptador los conserva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB para los pesos del adaptador en 4 bits; sumando el modelo base Gemma 2 2B cuantizado a 4 bits, el conjunto completo requiere del orden de 2 a 3 GB de VRAM, sin contar la cache KV.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el modelo base cuantizado; para precision completa (bf16) del modelo base se necesitarian alrededor de 5 a 6 GB, por lo que una RTX 3060 de 12 GB o superior es suficiente.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060 Ti, RTX 4070 o superiores, siempre que se use cuantizacion de 4 u 8 bits.
- Opciones de despliegue: transformers con bitsandbytes y PEFT para cargar el adaptador; llama.cpp u Ollama requeririan conversion previa del adaptador a GGUF; vLLM y TGI son compatibles con el modelo base, pero la integracion del LoRA depende de la version y del soporte de adaptadores.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| oncurai-gemma2-2b-lora | ~2.000 M (base) | no disponible | no disponible | Hugging Face, 17 descargas | LoRA sin model card ni benchmarks |
| Gemma 2 2B (Google) | 2.000 M | 8.192 tokens | Gemma Terms of Use | Hugging Face, ampliamente desplegado | Modelo base oficial, documentado y evaluado |
| bunnycore/Gemma2-2B-mixed | 2.000 M | no disponible | no disponible | Hugging Face | Merge de modelos sin censura, sin benchmarks publicos |
| Qwen2.5 1.5B Instruct | 1.500 M | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa pequena con licencia permisiva y contexto amplio |

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni proposito declarado, lo que impide auditar el modelo.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; ademas, el modelo base Gemma 2 esta sujeto a los Gemma Terms of Use, que imponen restricciones de uso y obligaciones de atribucion.
- Riesgo elevado de alucinacion en dominio clinico: un fine-tuning sin evaluacion publica sobre un modelo de 2B puede generar afirmaciones medicas incorrectas con apariencia de verosimilitud.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos de genero, raza, edad u otros en el dominio.
- Limitaciones de contexto e idioma no verificadas: se desconoce si el adaptador preserva la ventana de 8.192 tokens del modelo base y que idiomas mantiene con calidad.
- No apto para produccion sin evaluacion: la cuantizacion a 4 bits con bitsandbytes puede degradar la calidad respecto al adaptador original en precision completa, y no hay datos que cuantifiquen esa perdida.
- Etiqueta "gemma4" ambigua: el repositorio usa una etiqueta que no corresponde a ninguna familia oficial conocida, lo que anade incertidumbre sobre el modelo base real.
- Actividad minima: 17 descargas y 0 likes indican ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/h2sunni/oncurai-gemma2-2b-lora
- Modelo base Gemma 2 (Google): https://huggingface.co/google/gemma-2-2b
- Repositorio relacionado bunnycore/Gemma2-2B-mixed: https://huggingface.co/bunnycore/Gemma2-2B-mixed
