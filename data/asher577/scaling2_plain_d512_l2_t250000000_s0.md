# asher577/scaling2_plain_d512_L2_t250000000_s0

## Resumen

`asher577/scaling2_plain_d512_L2_t250000000_s0` es un modelo de investigacion publicado en Hugging Face por el usuario asher577. Se trata de un transformer con dispersion de pesos (weight-sparse) entrenado siguiendo el procedimiento descrito por Gao et al. (2025). No es un modelo de proposito general ni un asistente conversacional: es un artefacto experimental disenado para estudiar el escalado de modelos con esparsidad estructural en pesos y activaciones.

El modelo es extremadamente pequeno: 2 capas, dimension de modelo 512, dimension de cabeza 16 y un vocabulario de solo 4096 tokens. Su longitud de contexto es de 512 tokens y fue entrenado durante 250 millones de tokens sobre el dataset `jacobcd52/simplestories-tokenized`, un corpus de historias sinteticas simples. La esparsidad objetivo es L0 = 0.01 (es decir, aproximadamente el 1 % de los pesos activos), con esparsidad tambien en activaciones.

Su relevancia es puramente academica: sirve como punto de datos en estudios de escalado sobre eficiencia de parametros y tecnicas de poda/entrenamiento disperso. No esta pensado para despliegue en produccion ni para tareas reales de usuario, y de hecho el repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con dispersion de pesos (weight-sparse), 2 capas |
| Parametros totales | no disponible (dimension 512, 2 capas, vocab 4096) |
| Parametros activos | no disponible (esparsidad L0 objetivo 0.01) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre SimpleStories, corpus sintetico en ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) y `config.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 2 capas con dimension de modelo 512 y dimension de cabeza 16 (lo que implica 32 cabezas de atencion por capa). La innovacion principal es el uso de esparsidad en pesos con un objetivo L0 del 1 % y esparsidad tambien en activaciones, siguiendo el procedimiento de Gao et al. (2025). Esto implica que, durante el entrenamiento, se fuerza a que solo una fraccion muy pequena de los pesos contribuya a la salida, lo que reduce el coste computacional efectivo y es objeto de estudio en la literatura de eficiencia.

El entrenamiento se realizo sobre 250 millones de tokens del dataset `jacobcd52/simplestories-tokenized`, tokenizado con `SimpleStories/SimpleStories-1.25M`. Se desconoce si hubo fases de RLHF, DPO o ajuste fino posterior; la model card no lo menciona. El run de entrenamiento esta registrado en Weights & Biases (enlace en la seccion de enlaces), lo que permite inspeccionar curvas de perdida y detalles del proceso, aunque no se han transcrito aqui.

## Capacidades

- Generacion de texto a nivel de continuacion de historias simples, limitada al dominio de SimpleStories.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues no disponibles; el corpus de entrenamiento es sintetico y presumiblemente en ingles.
- No dispone de modo thinking, vision ni audio.
- Su unica capacidad verificable es la modelizacion de lenguaje a pequena escala con pesos dispersos, util para experimentos de investigacion.

## Casos de uso

- Estudio de escalado con esparsidad: el modelo sirve como punto de la curva en experimentos que comparan rendimiento frente a numero de tokens y grado de esparsidad, siguiendo la metodologia de Gao et al. (2025).
- Validacion de tecnicas de poda y entrenamiento disperso: permite reproducir y comparar recetas de esparsidad L0 = 0.01 en un entorno controlado y de bajo coste.
- Benchmark de eficiencia de inferencia: al ser diminuto (2 capas, 512 dimensiones), es util para medir latencias y throughput de kernels dispersos sin necesidad de GPUs grandes.
- Docencia y divulgacion: ejemplo minimo y reproducible de un transformer disperso para explicar conceptos de esparsidad estructural en cursos o talleres.
- Pruebas de pipelines de entrenamiento: su tamano y su dataset sintetico lo hacen adecuado para validar infraestructura (W&B, tokenizadores, carga de checkpoints) antes de escalar a modelos mayores.
- Investigacion sobre datasets sinteticos: permite estudiar como un modelo disperso aprende sobre SimpleStories y comparar con variantes densas del mismo tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 2 capas, dimension 512 y vocabulario 4096, el checkpoint cabe holgadamente en cualquier GPU consumer (menos de 1 GB en la mayoria de configuraciones, aunque el tamano exacto no esta disponible porque el repo figura como 0.0 GB).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es mas que suficiente; tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, en practicamente todas.
- Opciones de despliegue: al ser un checkpoint PyTorch crudo que requiere la clase `SparseGPT` del repositorio del autor, no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI sin adaptacion. La carga se realiza con `torch.load` y codigo propio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (transformers dispersos de 2 capas entrenados sobre SimpleStories). La comparacion natural seria con variantes densas del mismo autor y mismo dataset, pero no se dispone de sus fichas ni resultados.

## Limitaciones y advertencias

- Modelo de investigacion sin licencia declarada: no se puede asumir uso comercial permitido.
- Entrenado exclusivamente sobre un corpus sintetico de historias simples; el riesgo de alucinacion y de generar texto incoherente fuera de ese dominio es muy alto.
- Contexto de solo 512 tokens, insuficiente para la mayoria de aplicaciones reales.
- Vocabulario de 4096 tokens, muy limitado, lo que restringe la cobertura lexica.
- No se documentan sesgos, pero al entrenarse sobre datos sinteticos no refleja la distribucion del lenguaje natural.
- Requiere codigo personalizado (`SparseGPT`) para cargar los pesos; no es plug-and-play con frameworks estandar.
- Con 0 descargas y 0 likes, no hay evidencia de uso ni validacion externa.
- No apto para produccion ni para tareas de usuario final.

## Enlaces

- Hugging Face: https://huggingface.co/asher577/scaling2_plain_d512_L2_t250000000_s0
- Run de Weights & Biases: https://wandb.ai/asher577/scd_scaling/runs/u58ckuu6
- Dataset de entrenamiento: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizador: https://huggingface.co/SimpleStories/SimpleStories-1.25M
- Referencia metodologica: Gao et al. (2025), citado en la model card (sin enlace directo disponible).
