# francesca9805/swa-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed10

## Resumen

Este modelo es un ajuste fino (SFT) del checkpoint base `francesca9805/ppt-wc-uniform-newlex-swa-after-100mb-packed-bfdiso_seed10`, desarrollado por el usuario de HuggingFace francesca9805. Se trata de un modelo de generacion de texto de arquitectura tipo GPT-2 (etiqueta `gpt2` en las tags del repositorio), con 124.770.816 parametros reales confirmados en el fichero de pesos safetensors. El entrenamiento se ha realizado con la libreria TRL (version 0.23.0) sobre el framework Transformers 4.56.2 y PyTorch 2.11.0.

Por la nomenclatura del nombre, el modelo forma parte de una familia de experimentos aparentemente centrados en tokenizadores y en idiomas concretos: los prefijos `swa`, `eus` y `tur` de otras variantes de la misma autora coinciden con codigos ISO 639-3 de swahili, euskera y turco respectivamente, lo que sugiere un estudio comparativo de modelos pequenos entrenados sobre unos 100 MB de datos por idioma. No obstante, la model card no confirma este extremo de forma explicita, por lo que debe tomarse como una interpretacion de la nomenclatura y no como un dato verificado.

El modelo es relevante sobre todo en un contexto de investigacion: es un ejemplo de modelo pequeno (rango 100-130 M de parametros) ajustado con SFT sobre un checkpoint previo, con pesos en safetensors y compatibilidad con text-generation-inference y endpoints. No dispone de descargas ni likes y su licencia no esta declarada, por lo que no es apto para uso en produccion sin una revision previa de las condiciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (tag `gpt2`), transformer decoder-only |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp32) |
| Idiomas soportados | no disponible (la nomenclatura `swa` sugiere swahili, sin confirmar) |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, segun la etiqueta `gpt2` declarada en el repositorio y la clase de pipeline `text-generation`. Con 124,7 M de parametros, coincide practicamente con el tamano de GPT-2 small, lo que implica un modelo compacto orientado a tareas de generacion de texto y a experimentacion, no a razonamiento complejo ni a contextos largos.

El entrenamiento se ha realizado mediante SFT (supervised fine-tuning) con TRL 0.23.0, partiendo del modelo base `francesca9805/ppt-wc-uniform-newlex-swa-after-100mb-packed-bfdiso_seed10`. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas posteriores de RLHF o DPO. El nombre de la variante (`after-ckpt500`, `100mb`, `packed`, `seed10`) apunta a un entrenamiento sobre aproximadamente 100 MB de datos, con un checkpoint intermedio (500) y una semilla fija (10), pero estos detalles no estan documentados de forma explicita en la model card. El run de entrenamiento esta registrado en Weights & Biases bajo el proyecto `new-tokenizers`, lo que refuerza la hipotesis de un experimento centrado en tokenizacion.

## Capacidades

- Generacion de texto autoregresiva: es la funcion principal del modelo, segun el pipeline declarado `text-generation`.
- Conversacion por turnos: el ejemplo de la model card usa el formato de mensajes con rol `user`, lo que indica soporte de plantillas de chat.
- Ajuste por instrucciones (SFT): al haberse entrenado con supervisado, cabe esperar cierta capacidad de seguir instrucciones, aunque no cuantificada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (la nomenclatura sugiere especializacion por idioma, sin confirmar).
- Vision, audio, modo thinking: no disponible.

## Casos de uso

- Experimentacion academica con tokenizadores: el modelo encaja en flujos de investigacion sobre como distintos esquemas de tokenizacion afectan al rendimiento de modelos pequenos, que parece ser el eje del proyecto del que forma parte.
- Generacion de texto en un idioma concreto de bajos recursos: si se confirma que la variante esta especializada en swahili, podria emplearse para generar texto sintetico o aumentar datos en ese idioma en entornos de investigacion.
- Fine-tuning posterior como punto de partida: al ser un checkpoint ya ajustado con SFT, sirve como base para experimentos adicionales (DPO, RLHF, LoRA) sin partir de un modelo generico.
- Prototipado rapido en local: con 124,7 M de parametros, se puede ejecutar en CPU o en GPUs de gama baja para validar pipelines de generacion antes de escalar a modelos mayores.
- Pruebas de infraestructura de despliegue: es util para validar configuraciones de TGI, endpoints o FriendliAI con un modelo de bajo coste computacional.
- Docencia y demostraciones: su tamano reducido permite ilustrar el funcionamiento de un transformer decoder-only y del pipeline de SFT con TRL en clases o talleres.
- Evaluacion comparativa de semillas y checkpoints: la existencia de variantes `seed10`, `before-ckpt500` y `after-ckpt500` lo hace adecuado para estudios de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,25 GB en fp16/bf16 (124,77 M x 2 bytes) y en torno a 0,5 GB en fp32. LLM Explorer reporta 0,2 GB de VRAM para este rango de tamano.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 o superiores. En GPUs de datacenter (A100, H100) el modelo queda enormemente sobredimensionado en recursos.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo, e incluso en CPU con memoria RAM suficiente.
- Opciones de despliegue: transformers (pipeline nativo), text-generation-inference (tag `text-generation-inference`), FriendliAI (existe una ficha para una variante `before-ckpt500`) y cualquier runtime compatible con safetensors. No hay confirmacion de pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

Nota: el repositorio ocupa 9,5 GB, muy por encima de lo esperable para 124,7 M de parametros en bf16. Es probable que contenga checkpoints intermedios u optimizador, lo que no afecta a la inferencia pero si al espacio en disco necesario para clonarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/swa-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed10 | 124,7 M | no disponible | no disponible | no disponible | HuggingFace |
| GPT-2 small | 124 M | 1024 tokens | benchmarks publicos conocidos | MIT | HuggingFace, muy extendido |
| DistilGPT-2 | 82 M | 1024 tokens | benchmarks publicos conocidos | Apache 2.0 | HuggingFace |
| SmolLM-135M | 135 M | 2048 tokens | benchmarks publicos conocidos | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento de este modelo que permitan una comparacion cuantitativa con las alternativas. La comparativa se limita, por tanto, a parametros, contexto y licencia, y en el caso del modelo analizado la mayoria de estos campos no estan documentados.

## Limitaciones y advertencias

- Licencia no declarada: la model card incluye un campo `licence: license` sin contenido. No se puede asumir permiso de uso comercial y habria que contactar con la autora antes de cualquier despliegue productivo.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada, por lo que se desconoce su calidad real frente a GPT-2 o alternativas.
- Riesgo de alucinacion: como cualquier modelo generativo de este tamano, es probable que produzca texto plausible pero incorrecto, especialmente en tareas de conocimiento factual.
- Contexto limitado: al ser un derivado de GPT-2, es razonable esperar una ventana corta (habitualmente 1024 tokens), aunque el dato no esta confirmado en la informacion disponible.
- Idiomas no confirmados: la nomenclatura sugiere especializacion en idiomas concretos, lo que implicaria un rendimiento pobre fuera de ellos, pero no hay documentacion al respecto.
- Cero traccion: 0 descargas y 0 likes indican que el modelo no ha sido validado por la comunidad.
- Repositorio sobredimensionado: 9,5 GB para 124,7 M de parametros sugiere la presencia de checkpoints u optimizador, algo a tener en cuenta en pipelines de CI/CD o despliegues con almacenamiento limitado.
- Origen experimental: los nombres (`packed`, `bfdiso`, `seed10`, `ckpt500`) apuntan a un experimento de investigacion, no a un modelo listo para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/swa-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-swa-after-100mb-packed-bfdiso_seed10
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/m31n03bs
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante en FriendliAI: https://friendli.ai/models/francesca9805/swa-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10
- Ficha en LLM Explorer (modelo base): https://llm-explorer.com/model/francesca9805%2Fppt-wc-uniform-newlex-swa-after-100mb-packed-bfdiso_seed10,6jSGieoixHpmGRdNgO5QLk
- Variante en turco (referencia de la familia): https://huggingface.co/francesca9805/tur-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10
- Variante en euskera (referencia de la familia): https://huggingface.co/francesca9805/eus-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10
