# francesca9805/eus-latn-100mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed455

## Resumen

El modelo `francesca9805/eus-latn-100mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed455` es un ajuste fino (fine-tuning) de tipo SFT sobre el checkpoint `francesca9805/eus-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed455`, desarrollado por el usuario de HuggingFace `francesca9805`. Segun la model card, se ha entrenado con la libreria TRL (Transformer Reinforcement Learning) de HuggingFace, lo que lo enmarca en flujos de ajuste supervisado sobre un modelo base previo del mismo autor.

La arquitectura es GPT-2 (segun las etiquetas del repositorio), con 124.770.816 parametros reales (aproximadamente 125 M), lo que lo situa en la categoria de los modelos tipo GPT-2 small. El repositorio ocupa 4,5 GB, lo que sugiere la presencia de multiples checkpoints o versiones intermedias ademas de los pesos finales, dado que un modelo de este tamano en precision FP32 ronda los 500 MB. Los pesos estan en formato safetensors.

Por el nombre del modelo, que incluye `eus-latn` (probablemente euskera en alfabeto latino), `100mb`, `Dp-100mb`, `packed`, `bfdiso`, `ckpt500` y `seed455`, todo apunta a un experimento de investigacion centrado en tokenizadores y volumenes de datos de entrenamiento, con barridos sobre semilla aleatoria y numero de checkpoints. La model card no proporciona informacion sobre licencia, idiomas, contexto ni datos de entrenamiento, por lo que la mayor parte de las especificaciones no estan disponibles y deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 124.770.816 (aproximadamente 125 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF, GPTQ ni AWQ; solo safetensors) |
| Idiomas soportados | no disponible (el identificador sugiere `eus` / euskera y `latn` / alfabeto latino, sin confirmar en la model card) |
| Licencia | no disponible (la model card indica `licence: license` sin especificar terminos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a GPT-2, un transformer decoder-only autorregresivo con atencion causal. Con 124.770.816 parametros, la configuracion es practicamente identica en tamano a GPT-2 small (124 M). No se especifica en la informacion disponible el numero de capas, dimensiones ocultas, cabezas de atencion ni la longitud de contexto efectiva.

El entrenamiento se ha realizado mediante SFT (Supervised Fine-Tuning) con la libreria TRL en su version 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El modelo parte del checkpoint `francesca9805/eus-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed455`, del que no se detalla el preentrenamiento. El nombre del modelo sugiere un experimento sistematico sobre tokenizadores (`new-tokenizers` es el nombre del proyecto en Weights & Biases), con variables como el tamano de datos (100 mb), el empaquetado de secuencias (`packed`), la semilla aleatoria (`seed455`) y el checkpoint intermedio (`ckpt500`). No se indica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO posteriores.

## Capacidades

- Generacion de texto autorregresiva en el dominio para el que fue ajustado (no especificado en la model card).
- Uso mediante `pipeline("text-generation")` de Transformers, aceptando entrada conversacional en formato de lista de mensajes (`[{"role": "user", "content": ...}]`).
- Compatible con Text Generation Inference (TGI) y con endpoints de HuggingFace (`endpoints_compatible` en las etiquetas).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Investigacion sobre tokenizadores multilingues: el modelo forma parte de un barrido experimental (proyecto `new-tokenizers` en Weights & Biases) orientado a medir el impacto del tamano de datos, el empaquetado de secuencias y la semilla en el ajuste de tokenizadores para euskera en alfabeto latino. Es adecuado como punto de comparacion frente a otros checkpoints de la misma familia.
- Reproduccion de experimentos academicos con TRL: al estar entrenado con TRL 0.23.0 y Transformers 4.56.2, permite reproducir el pipeline SFT con las mismas versiones de libreria y comparar resultados entre semillas (`seed455`, `seed10`, etc.).
- Generacion de texto en euskera con recursos limitados: si el modelo efectivamente esta especializado en euskera, puede emplearse para generar texto en ese idioma en entornos con restricciones de VRAM (aproximadamente 250 MB en FP16), aunque no hay validacion publicada de calidad.
- Estudio de alucinaciones en modelos pequenos: su tamano reducido (125 M) lo hace util para analizar el comportamiento de modelos de baja capacidad frente a modelos mayores, dentro de trabajos de investigacion.
- Fine-tuning posterior sobre dominios especificos: sirve como punto de partida economico para ajustes adicionales en tareas concretas de generacion de texto en euskera, gracias a su bajo coste de entrenamiento.
- Despliegue en entornos de bajo consumo: por su tamano, puede ejecutarse en CPU o en GPUs de gama baja para prototipos, demostraciones o pruebas de integracion continua de pipelines de generacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 500 MB.
- VRAM estimada en FP16/BF16: aproximadamente 250 MB.
- VRAM estimada en int8: aproximadamente 125 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; se puede ejecutar con holgura en NVIDIA RTX 3060, RTX 4090, A100, H100 e incluso en GPUs integradas o Apple Silicon.
- Cabe en GPU de consumo: si, sin restricciones practicas por tamano. Tambien cabe en CPU con memoria RAM convencional.
- Opciones de despliegue: `transformers.pipeline`, HuggingFace Text Generation Inference (TGI, soportado por ser GPT-2), FriendliAI (existe una entrada para un modelo hermano en su plataforma) y, en general, servidores de inferencia compatibles con GPT-2. No se dispone de pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eus-latn-100mb-after-ppt-Dp-100mb-... (este modelo) | 124,8 M | GPT-2 | no disponible | no disponible | HuggingFace (safetensors) |
| GPT-2 small (OpenAI) | 124 M | GPT-2 | 1024 tokens | MIT (referencia) | Ampliamente disponible |
| DistilGPT-2 | 82 M | GPT-2 destilado | 1024 tokens | Apache 2.0 (referencia) | HuggingFace |
| GPT-2 medium | 355 M | GPT-2 | 1024 tokens | MIT (referencia) | HuggingFace |

Nota: la columna de licencia de los modelos de referencia corresponde a sus condiciones habituales; la del modelo descrito no esta especificada en la informacion disponible. No se dispone de datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card no declara licencia especifica, por lo que el uso comercial queda sin cobertura legal clara hasta que el autor lo aclare.
- No hay informacion sobre los datos de entrenamiento, lo que impide evaluar sesgos, toxicidad o presencia de contenido con derechos de autor.
- No se han publicado benchmarks, evaluaciones humanas ni comparativas con modelos de la misma categoria.
- Riesgo de alucinacion elevado por el tamano reducido del modelo (125 M), caracteristica comun en modelos de esta escala.
- Longitud de contexto, idiomas y capacidades funcionales no confirmados; el uso del identificador `eus-latn` es indicativo pero no vinculante.
- Al ser un experimento con semilla y checkpoint especificos, el comportamiento puede variar significativamente entre versiones hermanas de la misma familia.
- No se ofrecen pesos cuantizados oficiales (GGUF, GPTQ, AWQ), lo que limita el despliegue directo en herramientas como llama.cpp u Ollama sin conversion manual.

## Enlaces

- HuggingFace: https://huggingface.co/francesca9805/eus-latn-100mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed455
- Modelo base: https://huggingface.co/francesca9805/eus-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed455
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/o3zo18bk
- Repositorio TRL: https://github.com/huggingface/trl
- Modelo hermano (misma familia, `seed10`): https://huggingface.co/francesca9805/eus-latn-100mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed10
- Modelo hermano (`eu`, `seed455`): https://huggingface.co/francesca9805/eus-latn-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed455
- Entrada en FriendliAI (modelo hermano): https://friendli.ai/models/francesca9805/eus-latn-100mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed10
- Entrada en LLM Explorer (modelo de la familia, `eng-latn`): https://llm-explorer.com/model/francesca9805%2Feng-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed455,7jOq4n9vIMo18gE0tQ1ux2
- Ficha en free2aitools (modelo hermano, `ita-latn`): https://free2aitools.com/model/francesca9805/ita-latn-100mb-after-ppt-dp-10mb-packed-bfdiso-ckpt500_seed455
