# francesca9805/nld-latn-100mb-ppt-mp-struct-bcc-100mb_seed3407

## Resumen

El modelo `nld-latn-100mb-ppt-mp-struct-bcc-100mb_seed3407` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/nld_latn_100mb`, desarrollado por el usuario de HuggingFace `francesca9805`. Se trata de un modelo de generación de texto de pequeno tamano (124,77 millones de parametros) construido sobre la arquitectura GPT-2 y entrenado mediante SFT (Supervised Fine-Tuning) con la libreria TRL de HuggingFace. El nombre del modelo sugiere un experimento academico estructurado en torno a variantes de tokenizacion y datos de entrenamiento (probablemente relacionado con el proyecto "new-tokenizers" visible en el enlace de Weights & Biases), orientado al idioma neerlandes (`nld_latn`).

Su relevancia es limitada y de caracter experimental: no es un modelo de proposito general ni compite con modelos de gran escala. Resulta de interes para investigadores que estudien el efecto del ajuste fino SFT sobre modelos pequenos multilingues del proyecto Goldfish, o para quienes necesiten reproducir experimentos de tokenizacion en lenguas de bajos recursos. El modelo base Goldfish es una familia de modelos pequenos (100 MB de datos de entrenamiento) para mas de 400 idiomas, disenada para investigacion linguistica de bajo coste computacional.

La informacion publicada es escasa: la model card no detalla composicion del dataset, hiperparametros de entrenamiento ni resultados de evaluacion, y no se declara licencia ni lista de idiomas soportados de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Goldfish se entrena con contexto corto, tipicamente 512 tokens; no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, pero no declarada) |
| Idiomas soportados | neerlandes (`nld_latn`) segun el identificador del modelo base; lista oficial no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con arquitectura GPT-2, heredada del modelo base `goldfish-models/nld_latn_100mb`. El ajuste fino se realizo con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1, mediante SFT (Supervised Fine-Tuning). No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO posteriores.

El nombre del modelo incluye segmentos como `ppt`, `mp`, `struct` y `bcc-100mb`, que apuntan a un experimento controlado sobre variantes de tokenizacion y estructura de datos (el run de Weights & Biases se titula "new-tokenizers"). No se documenta ninguna innovacion arquitectonica adicional: no hay decodificacion especulativa, atencion lineal ni mecanismos hibridos. El modelo base Goldfish entrena modelos de ~100 MB por idioma sobre corpus de aproximadamente 100 MB, lo que lo situa en la categoria de modelos pequenos para investigacion.

## Capacidades

- Generacion de texto autoregresiva basica en neerlandes (presumiblemente, dado el identificador del modelo base).
- Formato de chat: la model card muestra un ejemplo con lista de mensajes `{"role": "user", "content": ...}`, lo que sugiere un formato de conversacion simple aprendido durante el SFT.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del neerlandes.
- No se documenta vision, audio ni modo "thinking".
- Capacidad de razonamiento, codigo y matematicas: no evaluada ni documentada.

## Casos de uso

- Investigacion sobre tokenizacion: el modelo forma parte de una serie de experimentos (run "new-tokenizers") que compara variantes de tokenizacion sobre el mismo corpus; se usaria para reproducir y comparar resultados entre variantes con `seed3407`.
- Estudio de SFT en modelos pequenos: permite analizar como el ajuste fino supervisado con TRL afecta a un modelo GPT-2 de 124 M de parametros en neerlandes, con bajo coste computacional.
- Generacion de texto de bajo coste en neerlandes: para prototipos o demos donde no se requiere alta calidad y se dispone de recursos minimos (el modelo cabe en cualquier GPU consumer).
- Baseline academico: sirve como referencia inferior en comparaciones con modelos neerlandeses mas grandes (p. ej., variantes de Goldfish de mayor tamano o modelos como GPT-2 multilingual).
- Pruebas de pipelines de despliegue: al ser pequeno y compatible con text-generation-inference y endpoints_compatible, se puede usar para validar infraestructura de serving antes de migrar a modelos mayores.
- Docencia: ejemplo practico de fine-tuning con TRL y publicacion en HuggingFace para cursos de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB (124,77 M de parametros x 4 bytes).
- VRAM estimada en FP16/BF16: aproximadamente 0,25 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,13 GB; en 4 bits, aproximadamente 0,07 GB.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 6 GB, RTX 3060, RTX 4090) es mas que suficiente; tambien funciona en CPU.
- Cabe holgadamente en cualquier GPU consumer e incluso en dispositivos de borde.
- Opciones de despliegue: transformers (pipeline), text-generation-inference (etiqueta presente), llama.cpp/Ollama mediante conversion a GGUF (no declarado oficialmente), vLLM (compatible con arquitectura GPT-2, aunque no verificado en la informacion).
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera alta velocidad en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| francesca9805/nld-latn-100mb-ppt-mp-struct-bcc-100mb_seed3407 | 124,77 M | no disponible | neerlandes (presunto) | no disponible | Fine-tune SFT experimental |
| goldfish-models/nld_latn_100mb (base) | ~124 M (GPT-2 pequeno) | no disponible | neerlandes | no disponible en esta ficha | Modelo base del proyecto Goldfish |
| goldfish-models (otras lenguas, 100 MB) | ~124 M | no disponible | multiples | no disponible en esta ficha | Familia multilingue de referencia |
| GPT-2 small original | 124 M | 1024 tokens | ingles | MIT (segun publicacion original) | Referencia arquitectonica |

No se dispone de datos de rendimiento comparativo para incluir en la tabla.

## Limitaciones y advertencias

- Modelo de 124 M de parametros: capacidad limitada de razonamiento, conocimiento factual y coherencia en textos largos; propenso a alucinaciones y a generar texto incoherente mas alla de pocas frases.
- Entrenado presumiblemente solo en neerlandes; el uso en otros idiomas no esta soportado ni documentado.
- Sesgos: al derivar de un corpus web de 100 MB, puede reproducir sesgos presentes en los datos; no se documenta ninguna mitigacion.
- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier uso en produccion.
- Sin evaluacion publicada: no hay benchmarks que permitan estimar su calidad real frente al modelo base ni frente a alternativas.
- Model card incompleta: faltan hiperparametros, composicion del dataset y detalles de la tokenizacion, lo que dificulta la reproducibilidad.
- No apto para tareas de codigo, matematicas, tool calling ni agentes; no hay evidencia de dichas capacidades.
- Fecha de creacion inusual (2026-10-20) en los metadatos; verificar la procedencia antes de confiar en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/nld-latn-100mb-ppt-mp-struct-bcc-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/nld_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/h3g8nb5u
- Repositorio TRL: https://github.com/huggingface/trl
