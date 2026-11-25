# nielsr/qwen35-9b-html-pages-kimi-k31-pro-pi-160-sft-merged

## Resumen

nielsr/qwen35-9b-html-pages-kimi-k31-pro-pi-160-sft-merged es un modelo de lenguaje de 9.409.813.744 parametros (aproximadamente 9,41 mil millones) obtenido al fusionar un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-9B. Lo publica el usuario nielsr en Hugging Face y pertenece a la familia Qwen3.5, por lo que hereda la arquitectura transformer de dicha familia, aunque la model card no detalla las especificaciones internas.

El modelo se ha generado mediante un proceso de destilacion de agentes (agent-distill) sobre la tarea "html-pages", con la version pi 1.6.0, segun indica el autor. Es decir, el adaptador se entreno para reproducir el comportamiento de un agente que genera paginas HTML, y posteriormente se fusiono con el modelo base para producir un checkpoint unico en formato safetensors listo para usarse con transformers.

Su relevancia es acotada: se trata de un experimento de ajuste fino especializado, con cero descargas y cero "likes" en el momento de la consulta, creado el 25 de noviembre de 2026. Resulta util como referencia para quien quiera estudiar el flujo de fusion de LoRA en modelos Qwen3.5 o replicar el pipeline de destilacion de agentes, pero no es un modelo generalista ni cuenta con documentacion extendida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer de la familia Qwen3.5 (detalle interno no disponible) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B |
| Modalidad | image-text-to-text (segun tags), pipeline text-generation |
| Tamano del repositorio | 18,8 GB |
| Libreria | transformers |
| Tecnica de ajuste | LoRA fusionado (peft, merged), agent-distill |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer de aproximadamente 9,4 mil millones de parametros. Sobre esa base se entreno un adaptador LoRA (nielsr/qwen35-9b-html-pages-kimi-k31-pro-pi-160-lora) que posteriormente se fusiono con los pesos del modelo base, dando lugar a este checkpoint "merged". La model card no aporta detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni vocabulario.

El entrenamiento corresponde a una ejecucion de destilacion de agentes (agent-distill) etiquetada como "qwen35-9b-html-pages-kimi-k31-pro-pi-160", orientada a la tarea de generacion de paginas HTML y ejecutada con la version pi 1.6.0. No se especifican el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y conversacion, segun el pipeline declarado (text-generation) y los tags conversational.
- Generacion de paginas HTML: es la tarea objetivo del ajuste fino por destilacion de agentes.
- Procesamiento de imagen y texto: los tags incluyen image-text-to-text, aunque la model card no detalla el alcance real de esta capacidad.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que sugiere despliegue en infraestructura de inferencia gestionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: el origen del entrenamiento es un pipeline de agentes, pero no se documenta su comportamiento como agente autonomo.
- Capacidades multilingues: no disponibles.
- Modo "thinking", vision o audio especial: no disponible.

## Casos de uso

- Generacion de plantillas HTML: el modelo se uso para producir paginas HTML a partir de instrucciones, por lo que puede emplearse para generar maquetas o fragmentos de marcado en prototipado rapido.
- Destilacion de agentes especializados: sirve como referencia para replicar el pipeline agent-distill sobre modelos Qwen3.5 de 9B y evaluar como se transfiere el comportamiento de un agente a un checkpoint fusionado.
- Experimentacion con LoRA fusionado: util para estudiar el efecto de fusionar adaptadores PEFT en modelos de ~9B y comparar el checkpoint fusionado con el adaptador original.
- Evaluacion de calidad de codigo generado: al estar orientado a HTML, permite montar pruebas automatizadas de validez de marcado y comparar con el modelo base sin ajustar.
- Despliegue en endpoints compatibles: el tag endpoints_compatible facilita probarlo en servicios de inferencia gestionada para tareas de generacion de texto acotadas.
- Base para nuevos ajustes finos: al ser un checkpoint completo en safetensors, puede servir como punto de partida para otros adaptadores LoRA sobre tareas relacionadas con generacion de interfaz o marcado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en precision completa (fp16/bf16): aproximadamente 18,8 GB solo para pesos, mas memoria para activaciones y cache KV; en la practica se recomienda al menos 24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-11 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB para pesos.
- GPU profesionales recomendadas: A100 (40/80 GB) o H100 para fp16 sin cuantizar y contextos largos.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar el modelo en fp16 justo, y con cuantizacion 4 u 8 bits cabe en RTX 3090, RTX 4080 o RTX 4070 Ti.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI, llama.cpp u Ollama si se generan pesos GGUF (no se confirma su disponibilidad en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nielsr/qwen35-9b-html-pages-kimi-k31-pro-pi-160-sft-merged | 9,41 B | no disponible | no disponible | safetensors | Ajuste especializado en HTML via agent-distill |
| Qwen/Qwen3.5-9B | ~9,4 B | no disponible | no disponible | safetensors | Modelo base sin ajuste; referencia directa |
| nielsr/qwen35-9b-html-pages-kimi-k31-pro-pi-160-lora | ~9,4 B (base) + adaptador | no disponible | no disponible | adaptador PEFT | Version no fusionada del mismo ajuste |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoria.

## Limitaciones y advertencias

- La licencia no esta indicada en la informacion disponible, por lo que no puede confirmarse el uso comercial; debe verificarse en el repositorio antes de cualquier despliegue en produccion.
- El modelo es un ajuste fino especializado en generacion de HTML; su comportamiento en tareas generales puede degradarse respecto al modelo base.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en generacion de HTML puede producir marcado invalido o referencias inexistentes.
- No se documentan los idiomas soportados ni la longitud de contexto efectiva.
- Cero descargas y cero interacciones en el momento de la consulta: no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- El tag image-text-to-text sugiere capacidades multimodales, pero no se detalla su alcance; conviene tratarlo con cautela.
- El repositorio ocupa 18,8 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables para su descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nielsr/qwen35-9b-html-pages-kimi-k31-pro-pi-160-sft-merged
- Adaptador LoRA de origen: https://huggingface.co/nielsr/qwen35-9b-html-pages-kimi-k31-pro-pi-160-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Enlaces adicionales (papers, blogs, demos): no disponibles
