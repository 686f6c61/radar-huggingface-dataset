# 3MPER0RR/Qwen2.5-0.5B-Instruct-3MPER0RR-abliterated

## Resumen

El modelo `3MPER0RR/Qwen2.5-0.5B-Instruct-3MPER0RR-abliterated` es una variante "abliterated" (sin mecanismos de rechazo) del modelo Qwen2.5-0.5B-Instruct, publicada por el usuario 3MPER0RR. Se trata de un ajuste derivado en dos saltos: parte del Qwen2.5-0.5B-Instruct original de Alibaba y pasa primero por la version abliterated de huihui-ai (`Qwen2.5-0.5B-Instruct-abliterated-v3`), sobre la que 3MPER0RR aplica un proceso que el autor describe como "multi-round abliteration". El objetivo es disponer de un modelo conversacional pequeno y sin las direcciones de rechazo que los modelos instruct suelen incorporar tras el alineamiento.

Con 494.032.768 parametros reales (confirmados en los pesos safetensors), es un transformer denso de escala sub-1000M, pensado para entornos con recursos muy limitados: ejecucion en CPU, moviles, Raspberry Pi o GPUs de gama baja. El repositorio ocupa aproximadamente 1.0 GB y se distribuye en formato safetensors bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es acotada y muy especifica: no compite en rendimiento con modelos de varios miles de millones de parametros, sino que cubre el nicho de la experimentacion en tecnicas de abliteration, la investigacion sobre alineamiento y rechazo, y el despliegue de asistentes conversacionales ultraligeros en hardware marginal. La model card es minima y no aporta detalles sobre dataset, entrenamiento ni evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), decoder-only con RoPE, GQA y SwiGLU |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredada del Qwen2.5-0.5B-Instruct; no confirmada en la model card de esta variante) |
| Tipos de cuantizacion | no disponibles en el repo (safetensors en precision completa); compatible con cuantizacion GGUF/AWQ/GPTQ a traves de herramientas externas |
| Idiomas soportados | no disponibles (el Qwen2.5 base soporta multiples idiomas, pero la model card no lo especifica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base inmediato | huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3 |
| Modelo original | Qwen/Qwen2.5-0.5B-Instruct |
| Proceso declarado | Multi-round abliteration |
| Tamano del repositorio | 1.0 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-0.5B-Instruct: un transformer decoder-only denso con normalizacion RMSNorm, embeddings rotatorios (RoPE), atencion con consultas agrupadas (GQA) y capas feed-forward con activacion SwiGLU. El modelo no emplea mezcla de expertos (MoE) ni arquitecturas de estado (SSM), por lo que todos los parametros se activan en cada paso de inferencia.

La informacion aportada no incluye detalles sobre el entrenamiento original (numero de tokens, composicion del dataset, etapas de SFT, RLHF o DPO), ya que la model card solo menciona el modelo base, el proceso de abliteration y su estado. La "abliteration" es una tecnica de edicion de pesos que identifica y elimina la direccion del espacio de activaciones asociada a la negativa (refusal) del modelo, normalmente mediante la ortogonalizacion de esa direccion en las matrices de pesos. El autor indica que se han aplicado varias rondas de este proceso ("multi-round"), lo que suele implicar una eliminacion progresiva de componentes de rechazo residual. No se especifica si hubo entrenamiento adicional (fine-tuning) despues de la edicion o si el proceso fue puramente de manipulacion de pesos.

## Capacidades

- Generacion de texto y conversacion multi-turno en formato instruct.
- Razonamiento basico y respuesta a instrucciones simples, limitado por el reducido numero de parametros.
- Generacion de codigo a pequena escala (fragmentos y funciones cortas), sin garantias de correccion.
- Capacidades multilingues heredadas del Qwen2.5 base, aunque no confirmadas ni evaluadas en esta variante.
- Reduccion o eliminacion de las respuestas de rechazo tipicas de los modelos alineados, objetivo declarado del proceso de abliteration.
- Soporte de tool calling y function calling: no disponible (no se menciona en la model card y el modelo base no esta optimizado para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento extendido (thinking): no disponible.
- Vision o audio: no soportado (modelo exclusivamente de texto).

## Casos de uso

- Investigacion sobre alineamiento y abliteration: permite estudiar como responde un modelo al que se le han eliminado las direcciones de rechazo, comparando sus salidas con las del Qwen2.5-0.5B-Instruct original para medir el efecto de la tecnica.
- Asistentes conversacionales ultraligeros en hardware marginal: al ocupar menos de 1 GB en precision completa y unos cientos de megabytes cuantizado, puede ejecutarse en una Raspberry Pi, un movil o una CPU antigua para tareas de chat sencillas.
- Prototipado rapido de pipelines de generacion de texto: sirve como modelo de prueba para validar un flujo completo (tokenizacion, plantilla de chat, decodificacion) antes de escalar a modelos mayores.
- Generacion de texto creativo sin filtros: util para experimentacion con narrativa, guiones o dialogos donde el rechazo del modelo base resulta un obstaculo, siempre que se respeten las politicas de uso aplicables al desarrollador.
- Educacion y demostraciones tecnicas: permite mostrar en un aula o tutorial como varia el comportamiento de un modelo antes y despues de la abliteration, con coste computacional minimo.
- Tareas de clasificacion, extraccion de entidades o resumen de textos cortos en local: mediante prompts adecuados, puede emplearse para procesamiento de texto simple sin enviar datos a servicios externos, un requisito habitual en entornos con privacidad estricta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16, 0.5 GB en INT8 y 0.3-0.4 GB en INT4, segun el nivel de cuantizacion.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo funciona tambien en GPUs muy antiguas y en gran parte de iGPUs modernas.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650, e incluso integradas), y tambien en CPU, moviles y dispositivos tipo Raspberry Pi.
- Opciones de despliegue: transformers (HuggingFace), llama.cpp, Ollama, vLLM, TGI y text-generation-webui, previa conversion a los formatos correspondientes (GGUF, AWQ, GPTQ).
- Latencia y throughput: no disponibles. Dado el tamano del modelo, en hardware de consumo se espera una generacion muy rapida (por encima de decenas de tokens por segundo en GPU y de varios tokens por segundo en CPU), pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 3MPER0RR/Qwen2.5-0.5B-Instruct-3MPER0RR-abliterated | 494M | 32.768 (heredado) | Apache 2.0 | Variante abliterated de este autor, sin evaluaciones publicadas |
| huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3 | 494M | 32.768 | Apache 2.0 | Modelo base inmediato; misma familia y tecnica |
| Qwen/Qwen2.5-0.5B-Instruct | 494M | 32.768 | Apache 2.0 | Version original alineada, con mecanismos de rechazo intactos |
| SmolLM2-360M-Instruct | 362M | 8.192 | Apache 2.0 | Alternativa ultraligera de HuggingFace, mas pequena y con menor contexto |

La comparativa con el modelo original es la mas relevante: el rendimiento en tareas estandar deberia ser practicamente identico, salvo por la desaparicion de respuestas de rechazo y una posible degradacion de la coherencia o el cumplimiento de instrucciones derivada de la edicion de pesos. No se dispone de datos comparativos de benchmarks.

## Limitaciones y advertencias

- La abliteration altera los pesos para reducir el rechazo, lo que puede deteriorar la coherencia, el seguimiento de instrucciones y la calidad general en comparacion con el modelo original; no se han publicado evaluaciones que cuantifiquen este efecto.
- Riesgo elevado de alucinacion: con menos de 500 millones de parametros, el modelo tiene una capacidad de conocimiento factual y razonamiento muy limitada.
- La eliminacion de los mecanismos de rechazo implica que puede generar contenido inapropiado, ofensivo o danino; el desarrollador es responsable de aplicar filtros y salvaguardas externas antes de cualquier uso en produccion.
- Limitaciones de contexto: aunque herede 32.768 tokens del Qwen2.5 base, el modelo no se ha evaluado para contextos largos y su capacidad de atencion efectiva con entradas extensas es dudosa.
- Idiomas soportados no confirmados; el rendimiento multilingue puede ser desigual y no esta documentado en esta variante.
- Ausencia de soporte documentado de tool calling, function calling y comportamiento de agente, lo que descarta su uso en pipelines que dependan de estas funciones.
- Licencia Apache 2.0: permite uso comercial, pero no exime de cumplir la normativa aplicable ni de las politicas de las plataformas donde se despliegue.
- Modelo sin descargas ni likes en el momento de la consulta: no cuenta con validacion de la comunidad ni con informes independientes de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/3MPER0RR/Qwen2.5-0.5B-Instruct-3MPER0RR-abliterated
- Modelo base inmediato: https://huggingface.co/huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
- Repositorio de llama.cpp (para conversion a GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
