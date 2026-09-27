# fnl-es/qwen3-0.6b-muc4-lora-drill

## Resumen

fnl-es/qwen3-0.6b-muc4-lora-drill es un adaptador LoRA (r=16, alpha=16) construido sobre el modelo base Qwen/Qwen3-0.6B, desarrollado por el usuario fnl-es. Su proposito es la extraccion de eventos a nivel de documento sobre el corpus MUC-4: dado un documento de noticia junto al prompt de sistema del conjunto de datos, el modelo devuelve los eventos del documento como un array JSON, o `[]` si no hay ninguno. Se trata, por tanto, de un modelo especializado en una tarea muy concreta de procesamiento de lenguaje natural (extraccion de eventos / information extraction) y no de un asistente generalista.

El adaptador se entreno con perdida solo sobre la completacion (completion-only loss) sobre 32 documentos del dataset fnl-es/muc4-chat durante 3 epocas, en el marco del experimento configs/qwen3-0.6b-resume-drill.yaml del proyecto fine-tuning-decoder. El repositorio ocupa unos 0,3 GB y contiene unicamente el adaptador, que nunca se ha fusionado con el modelo base: debe cargarse sobre Qwen/Qwen3-0.6B mediante PEFT.

Su relevancia radica en dos aspectos: demuestra un flujo reproducible de ajuste fino eficiente sobre un modelo pequeno (0,6 mil millones de parametros) para una tarea de extraccion estructurada, y sirve como referencia metodologica para experimentos de "drill" (entrenamientos cortos y controlados) sobre corpus historicos como MUC-4. Al ser un adaptador, el coste de almacenamiento y de despliegue es minimo en comparacion con un modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-0.6B) + adaptador LoRA (r=16, alpha=16) |
| Parametros totales | 0,6 mil millones en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-0.6B, un modelo transformer denso de aproximadamente 0,6 mil millones de parametros desarrollado por Alibaba Cloud, que la documentacion describe como multilingue y orientado a comprension y generacion de lenguaje, codigo y matematicas, disponible tanto en variantes densas como Mixture-of-Expert dentro de la familia Qwen3. La intervencion propia de este repositorio es un LoRA de rango 16 y alpha 16, es decir, una reparametrizacion de bajo rango de las matrices del modelo base que anade un numero reducido de parametros entrenables.

El entrenamiento empleo perdida calculada unicamente sobre la completacion (completion-only loss), de modo que el modelo aprende a generar la respuesta JSON sin verse penalizado por los tokens del prompt de sistema y del documento de entrada. Se utilizaron 32 documentos del dataset fnl-es/muc4-chat durante 3 epocas, segun la configuracion configs/qwen3-0.6b-resume-drill.yaml del proyecto fine-tuning-decoder. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron fases de RLHF o DPO. El adaptador no se ha fusionado con el modelo base en ningun momento, lo que facilita revertir o sustituir el ajuste sin alterar los pesos originales.

## Capacidades

- Extraccion de eventos a nivel de documento sobre el esquema de MUC-4: recibe un documento de noticia y el prompt de sistema del dataset, y produce como salida un array JSON con los eventos detectados.
- Respuesta estructurada en JSON, con el caso especial de devolver `[]` cuando el documento no contiene eventos.
- Ajuste fino especifico de tarea (event extraction); no esta disenado como asistente conversacional generalista.
- Hereda las capacidades del modelo base Qwen3-0.6B (comprension y generacion de lenguaje, codigo y matematicas), aunque no se ha validado su preservacion tras el ajuste.
- Soporte de tool calling / function calling: no disponible para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible para este adaptador.
- Capacidades multilingues: el modelo base se declara multilingue, pero no se especifica el comportamiento del adaptador en idiomas distintos del corpus de entrenamiento.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Extraccion de eventos en corpus de noticias: el adaptador recibe un documento completo y devuelve un array JSON con los eventos segun el esquema MUC-4, lo que permite poblar bases de datos estructuradas a partir de texto no estructurado.
- Investigacion en information extraction: sirve como linea base reproducible para comparar tecnicas de extraccion de eventos sobre MUC-4, dado que el adaptador es pequeno y el coste de reentrenamiento es bajo.
- Prototipado rapido en entornos con recursos limitados: al construirse sobre Qwen3-0.6B, el conjunto completo cabe en hardware modesto y permite iterar sobre prompts y esquemas sin grandes inversiones en GPU.
- Analisis de documentacion historica: aplicable a la identificacion de sucesos en archivos de noticias o informes, siempre que se respete el formato de prompt del dataset de entrenamiento.
- Componente dentro de un pipeline de procesamiento por lotes: puede integrarse en un flujo que recorra documentos y acumule los arrays JSON de eventos como salida intermedia antes de un post-procesado.
- Experimentos de ensenanza y formacion: util para demostrar de forma practica como se ajusta un adaptador LoRA con perdida sobre la completacion y como se carga mediante PEFT.
- Evaluacion de tecnicas de ajuste eficiente: sirve como caso de estudio de entrenamientos cortos ("drill") sobre datasets reducidos, comparando su comportamiento con el de otros adaptadores del mismo autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos del adaptador son minimos (el repositorio ocupa 0,3 GB); el grueso corresponde al modelo base Qwen3-0.6B, que en precision fp16 requiere del orden de 1,2 GB, en int8 alrededor de 0,6 GB y en int4 en torno a 0,4 GB. Estas cifras son estimaciones segun el numero de parametros y no proceden de una medicion publicada para este adaptador.
- GPU recomendadas: al tratarse de un modelo de 0,6 mil millones de parametros, es viable en GPUs de consumo como una RTX 3060, RTX 4070 o RTX 4090; tambien funciona en GPUs de datacenter (A100, H100) aunque estas estan sobredimensionadas para su tamano.
- Si cabe en GPU de consumo: si, con margen amplio, incluidas GPUs de gama media y baja con suficiente VRAM.
- Opciones de despliegue: al estar en formato PEFT, se carga con peft + transformers sobre el modelo base. El despliegue como servidor puede hacerse con vLLM o TGI (previa fusion del adaptador o mediante soporte de LoRA), y con llama.cpp/Ollama solo si se convierte a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fnl-es/qwen3-0.6b-muc4-lora-drill | 0,6B (base) + LoRA r=16 | Extraccion de eventos MUC-4 | no disponible | no disponible | Hugging Face (0 descargas, 0 likes) |
| fnl-es/qwen3-0.6b-muc4-lora-smoke | 0,6B (base) + LoRA | Extraccion de eventos MUC-4 | no disponible | no disponible | Hugging Face y FriendliAI |
| Qwen/Qwen3-0.6B (base) | 0,6B | Proposito general multilingue | no disponible | no disponible en la informacion | Hugging Face |

Los tres comparten el mismo modelo base Qwen3-0.6B, por lo que las diferencias se limitan al adaptador y a la tarea. No se dispone de datos de rendimiento que permitan comparar su calidad de extraccion de eventos.

## Limitaciones y advertencias

- Entrenamiento sobre un conjunto muy reducido: solo 32 documentos y 3 epocas, lo que puede provocar sobreajuste y una generalizacion limitada a documentos fuera del estilo de MUC-4.
- Especificidad de tarea: el modelo espera el prompt de sistema del dataset y un formato de salida JSON concreto; usarlo fuera de ese esquema puede degradar la calidad de la respuesta.
- Riesgo de alucinacion: al generar JSON, puede inventar eventos, roles o argumentos que no aparecen en el documento; se recomienda validacion posterior.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: no disponibles en la informacion proporcionada; el comportamiento fuera del idioma del corpus no esta documentado.
- Restricciones de licencia para uso comercial: no disponibles; la licencia del adaptador y del modelo base no se especifican en la informacion consultada, por lo que debe verificarse antes de un uso en produccion.
- Caveat de despliegue: es un adaptador, no un modelo autonomo; requiere cargar el modelo base Qwen/Qwen3-0.6B y no debe usarse fusionado sin comprobar la compatibilidad.
- Estado del repositorio: 0 descargas y 0 likes, creado y actualizado el mismo dia, sin validacion externa conocida, por lo que debe tratarse como un experimento y no como un componente estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fnl-es/qwen3-0.6b-muc4-lora-drill
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Run de entrenamiento (WandB): https://wandb.ai/flowing/muc4-event-extraction/runs/z31g72jy
- Dataset de entrenamiento: fnl-es/muc4-chat
- Adaptador relacionado: https://friendli.ai/models/fnl-es/qwen3-0.6b-muc4-lora-smoke
- Informacion sobre Qwen3-0.6B: https://aihub.qualcomm.com/models/qwen3_0_6b
- Anuncio de la familia Qwen3: https://openlm.ai/qwen3/
