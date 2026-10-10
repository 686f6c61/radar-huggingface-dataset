# francesca9805/heb-hebr-100mb-ppt-mp-struct-core-100mb_seed455

## Resumen

El modelo `francesca9805/heb-hebr-100mb-ppt-mp-struct-core-100mb_seed455` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/heb_hebr_100mb`, un transformer monolingue de tipo GPT-2 orientado al hebreo. Lo publica el usuario de HuggingFace `francesca9805` y se ha entrenado con la libreria TRL (Transformer Reinforcement Learning) de HuggingFace mediante SFT (Supervised Fine-Tuning). El modelo cuenta con 124.770.816 parametros totales (aproximadamente 125M) y un repositorio de 0,3 GB en formato safetensors.

Por su tamano, se trata de un modelo pequeno, pensado para experimentacion e investigacion mas que para despliegues de produccion de alta exigencia. Su relevancia radica en el ecosistema de modelos Goldfish, una familia de modelos GPT-2 entrenados especificamente para lenguas de bajos recursos (en este caso el hebreo), sobre los que se aplican tecnicas de ajuste fino para tareas concretas. El nombre del modelo sugiere un experimento de estructuracion de datos ("ppt-mp-struct-core") con una semilla concreta (`seed455`), lo que apunta a un artefacto de investigacion reproducible.

No se dispone de informacion publica sobre el conjunto de datos de ajuste fino, la longitud de contexto exacta configurada ni la licencia efectiva de uso. La model card no incluye resultados de evaluacion ni detalles sobre el corpus empleado, mas alla de las versiones de las librerias utilizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), segun el tag `gpt2` del repositorio |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base `heb_hebr_100mb` sugiere hebreo) |
| Licencia | no disponible (la model card indica `licence: license` como marcador de posicion) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `goldfish-models/heb_hebr_100mb`, un transformer decoder-only de tipo GPT-2 con aproximadamente 125M de parametros. La familia Goldfish, desarrollada en el entorno academico (University of Groningen, segun la URL de Weights & Biases del autor), entrena modelos GPT-2 desde cero para lenguas especificas con corpus de ~100 MB, lo que explica la denominacion `100mb` en el identificador. La etiqueta `gpt2` del repositorio confirma esta arquitectura.

El ajuste fino se ha realizado mediante SFT con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121 y Datasets 4.8.4. No se especifica el numero de tokens de entrenamiento, la composicion del dataset de ajuste ni si se aplicaron tecnicas posteriores como DPO o RLHF. El modelo se genero con `generated_from_trainer`, lo que indica un flujo estandar de entrenamiento con el `Trainer` de HuggingFace y registro en Weights & Biases (run `w2wq2q7y`, proyecto `new-tokenizers`).

## Capacidades

- Generacion de texto autoregresiva en el idioma del modelo base (presumiblemente hebreo), segun el pipeline `text-generation` declarado.
- Ajuste fino supervisado orientado a una tarea concreta no documentada ("ppt-mp-struct-core"), cuyo proposito exacto no se detalla en la informacion disponible.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible` (segun los tags del repositorio), lo que permite despliegue mediante la pila de inferencia de HuggingFace.
- Soporte de `tool calling`, agentes o razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: no disponibles; el modelo base esta especializado en una unica lengua.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Investigacion academica sobre modelado de lenguas de bajos recursos: el modelo sirve como punto de partida para estudiar el efecto del SFT sobre un GPT-2 monolingue de 125M de parametros en hebreo.
- Reproducibilidad de experimentos: al incluir una semilla fija en el nombre (`seed455`) y estar vinculado a un run de Weights & Biases, es util para replicar resultados de ajuste fino.
- Generacion de texto en hebreo en entornos con recursos muy limitados: al tratarse de un modelo de 125M de parametros, puede ejecutarse en CPU o GPUs de gama baja para prototipos.
- Evaluacion de tecnicas de tokenizacion: el proyecto de W&B se denomina `new-tokenizers`, por lo que puede emplearse para comparar esquemas de tokenizacion aplicados a lenguas no latinas.
- Fine-tuning posterior (continued fine-tuning): dado su tamano, es viable reajustarlo en una unica GPU consumer para tareas especificas en hebreo.
- Docencia y formacion: adecuado como ejemplo practico de flujo SFT con TRL y despliegue con `pipeline` de Transformers.
- Base para experimentos de destilacion o comparacion con modelos mayores: permite medir la brecha de rendimiento entre un modelo de 125M y alternativas de mayor tamano en la misma lengua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 124,7M de parametros, el modelo ocupa aproximadamente 0,5 GB en precision FP32, ~0,25 GB en FP16/BF16 y en torno a 0,1-0,15 GB si se cuantiza a 8 bits o 4 bits (estimaciones teoricas; no confirmadas por el autor).
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; una NVIDIA RTX 3060, RTX 4090 o incluso una GPU integrada con soporte CUDA/ROCm pueden ejecutarlo sin problemas.
- Compatibilidad con GPU consumer: si, cabe holgadamente en cualquier GPU consumer actual e incluso en CPU para inferencia con latencias aceptables.
- Opciones de despliegue: `pipeline` de Transformers (segun el ejemplo de la model card), ademas de vLLM, TGI y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no confirmado por el autor).
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `francesca9805/heb-hebr-100mb-ppt-mp-struct-core-100mb_seed455` | 124,7M | no disponible | no disponible (presumiblemente hebreo) | no disponible | HuggingFace |
| `goldfish-models/heb_hebr_100mb` (modelo base) | ~100M (no confirmado) | no disponible | hebreo | no disponible | HuggingFace |
| Otros modelos Goldfish de la misma familia | ~100M | no disponible | otras lenguas | no disponible | HuggingFace |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa fiable con alternativas. La comparacion se limita al modelo base y a la propia familia Goldfish por ausencia de informacion sobre competidores directamente evaluables.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles, aunque al entrenarse sobre corpus de ~100 MB de una unica lengua, es probable que herede sesgos y limitaciones de cobertura del corpus base.
- Riesgo de alucinacion: elevado en modelos GPT-2 pequenos de 125M de parametros; no hay evaluacion publicada que lo cuantifique.
- Limitaciones de contexto: se desconoce la ventana de contexto efectiva; los GPT-2 originales operan con 1024 tokens, pero este dato no esta confirmado para este modelo.
- Limitaciones de idioma: el modelo base esta especializado en hebreo; no se ha confirmado soporte para otros idiomas.
- Restricciones de licencia: la model card indica `licence: license` como texto generico, por lo que la licencia real no esta especificada. No se recomienda su uso comercial sin aclarar este punto con el autor.
- Caveat de produccion: con 0 descargas y 0 "likes", se trata de un artefacto de investigacion sin validacion externa ni mantenimiento conocido.
- El ejemplo de la model card usa una pregunta en ingles, lo que no garantiza que el modelo responda correctamente en ese idioma dado su origen monolingue.
- La fecha de creacion indicada (2026-10-09) es futura respecto a los datos habituales, lo que puede deberse a un error de metadatos o a un entorno de pruebas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/heb-hebr-100mb-ppt-mp-struct-core-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/heb_hebr_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/w2wq2q7y

Nota: los resultados de busqueda web proporcionados no contienen informacion relevante sobre el modelo (corresponden a agendas de eventos en Francia) y no se han utilizado como fuente.
