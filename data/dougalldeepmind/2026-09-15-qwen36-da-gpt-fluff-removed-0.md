# dougalldeepmind/2026-09-15-qwen36-da-gpt-fluff-removed-0

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base declarado Qwen/Qwen3.6-27B. Lo publica el usuario dougalldeepmind bajo el identificador `2026-09-15-qwen36-da-gpt-fluff-removed-0`, con un tamano de repositorio de 1,3 GB y cero descargas y cero valoraciones en el momento de redactar esta ficha.

El adaptador forma parte de una receta de experimentacion reproducible: el autor documenta la semilla (seed 0), la tasa de aprendizaje (1e-4), el numero de epocas (1.0), el tamano de lote (1 con acumulacion de gradiente 16), la longitud maxima de secuencia (8192 tokens) y los hiperparametros LoRA (r=64, alpha=128, dropout=0.05). Se entreno sobre la mezcla de datos `dougalldeepmind/2026-09-15-da-gpt-fluff-removed-7-mix` y el propio autor indica que la "constitucion" del modelo se hereda del conjunto de datos y no se declara en el lanzamiento, lo que limita la trazabilidad de alineamiento.

Su relevancia es metodologica mas que de rendimiento: sirve como artefacto reproducible para estudiar recetas de SFT con LoRA y modo thinking activado, no como modelo listo para produccion. No hay resultados de benchmarks, licencia, idiomas ni ficha de prestaciones publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denso; la arquitectura concreta del modelo base (Qwen/Qwen3.6-27B) no se describe en la informacion disponible |
| Parametros totales | No disponible para el adaptador. El modelo base declarado es Qwen/Qwen3.6-27B, con revision fijada `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`; el numero exacto de parametros del base no se declara |
| Parametros activos | No aplica / no disponible (no se indica que el modelo base sea de arquitectura MoE) |
| Longitud de contexto | No disponible para el modelo base. La longitud maxima de secuencia empleada en el entrenamiento del adaptador es de 8192 tokens |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors sin cuantizar; la cuantizacion dependeria del modelo base y del runtime |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT), acompanado de tokenizer, `train_config.yaml` y `training_meta.json` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango con r=64, alpha=128 y dropout=0.05, aplicado sobre el modelo base Qwen/Qwen3.6-27B en una revision concreta (`6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`). El entrenamiento sigue la receta denominada `sft`, con una sola epoca, learning rate de 1e-4, batch size de 1 con 16 pasos de acumulacion de gradiente (lote efectivo de 16 secuencias), semilla 0 y `thinking: true`, lo que indica que el modo de razonamiento explicito del modelo base estaba activado durante el ajuste. Se empleo batching dinamico con un presupuesto de 8000 tokens y agregacion de perdida `seq-mean-token-mean`.

Los datos de entrenamiento proceden de la mezcla `dougalldeepmind/2026-09-15-da-gpt-fluff-removed-7-mix` (archivo `mixture.jsonl`, revision `5444733e6cd26222516cae093c33cd332822c7b2`). El autor declara explicitamente que la "constitucion" del modelo se hereda de los datos de entrenamiento y que no se declaro en el lanzamiento, por lo que no hay documentacion publicada sobre criterios de filtrado, composicion del dataset, volumen en tokens ni sobre si hubo etapas de RLHF o DPO posteriores. La procedencia completa se documenta mediante el comando `scripts/train/train_lora.py --config configs/train/sft.yaml` del repositorio fuente `teaching_claude_why_replication`, con `wandb=true` y la semilla 0.

No se describe ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, mezcla de expertos, SSM) mas alla del uso de LoRA y del batching dinamico por presupuesto de tokens.

## Capacidades

- Generacion de texto y ajuste de estilo o dominio: el adaptador modifica el comportamiento del modelo base declarado, pero no se documenta que capacidades concretas anade ni con que datos.
- Razonamiento en modo thinking: el entrenamiento se lanzo con `thinking: true`, por lo que el adaptador esta ajustado con trayectorias que incluyen razonamiento explicito, aunque no se publican evaluaciones que lo confirmen.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documentan entrenamientos con trayectorias de agente.
- Capacidades multilingues: no disponible. No se declaran idiomas y el dataset de mezcla no se describe.
- Capacidades multimodales (vision, audio): no disponible.
- Contexto largo: la ventana usada en entrenamiento es de 8192 tokens; no se declara si el modelo base soporta ventanas mayores ni si el adaptador degrada el rendimiento fuera de ese rango.
- Ejecucion como adaptador: al ser un adaptador PEFT, requiere cargar el modelo base y aplicar los pesos LoRA en tiempo de inferencia (o fusionarlos).

## Casos de uso

Ninguno de los casos siguientes ha sido validado con evaluaciones publicadas; se derivan de la naturaleza del artefacto (adaptador LoRA SFT sobre un base de 27B declarado) y de los hiperparametros documentados.

- Servicio multi-LoRA sobre el mismo modelo base: en despliegues con vLLM se pueden cargar varios adaptadores LoRA sobre una unica instancia de Qwen3.6-27B y enrutar peticiones segun el caso de uso, aprovechando que cada adaptador ocupa solo 1,3 GB en disco frente a los pesos completos del base.
- Reproduccion de experimentos de alineamiento: el repositorio fuente (`teaching_claude_why_replication`) y el `train_config.yaml` resuelto permiten reejecutar exactamente el mismo entrenamiento con `uv run train --config train_config.yaml`, util para estudiar como variaciones de datos afectan al comportamiento del modelo.
- Ablaciones de recetas SFT: dado que el autor publica variantes con distintas semillas y mezclas (la nomenclatura incluye `seed 0` y mezclas numeradas), sirve como punto de comparacion para medir sensibilidad a la semilla y a la composicion del dataset.
- Ajuste de concision en respuestas: el nombre de la mezcla (`fluff-removed`) sugiere, como hipotesis no confirmada, un entrenamiento orientado a reducir relleno en las respuestas; seria aplicable a asistentes que necesiten salidas breves y directas, siempre que se valide con evaluaciones propias.
- Procesamiento de documentos de hasta 8192 tokens: resumen, extraccion de entidades o clasificacion de contratos e informes tecnicos que quepan en esa ventana, ajustando el adaptador al dominio concreto.
- Generacion asistida con razonamiento explicito: tareas de matematicas, analisis de casos o depuracion de codigo donde interese que el modelo exponga la cadena de razonamiento antes de la respuesta final, aprovechando el flag `thinking` usado en el entrenamiento.
- Base para iteraciones posteriores (continual fine-tuning): al ser un adaptador de rango 64 y un solo epoch, es un punto de partida barato para seguir entrenando con datos propios sin tocar los pesos del modelo base.
- Investigacion sobre procedencia y etica de modelos: el caso documenta un flujo en el que la constitucion del modelo se hereda del dataset y no se declara, lo que lo convierte en un ejemplo util para auditar practicas de publicacion de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y las busquedas web realizadas no devolvieron resultados relacionados con el modelo (unicamente paginas de ayuda de YouTube Music, sin ninguna relacion con el artefacto). Tampoco se declaran metricas de perdida de validacion, throughput ni latencia.

## Requisitos de hardware

- El adaptador en si ocupa 1,3 GB en disco, pero la inferencia requiere cargar los pesos completos del modelo base declarado (27B), que es lo que determina los requisitos.
- Estimacion de VRAM para el base de 27B (valores orientativos, no confirmados por el autor): en FP16/BF16 en torno a 54-60 GB; en cuantizacion de 8 bits, alrededor de 27-30 GB; en cuantizacion de 4 bits, aproximadamente 15-18 GB.
- GPU recomendadas para precision completa: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2 x A6000 48 GB). Para 4 bits, una unica GPU de 24 GB (RTX 3090, RTX 4090, L40S) puede ser suficiente.
- Cabe en GPU de consumo: si, con cuantizacion de 4 bits y siempre que el modelo base sea compatible; en FP16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: transformers + PEFT para uso directo del adaptador; vLLM con soporte multi-LoRA; TGI; llama.cpp u Ollama, que requieren fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponible. No se publican mediciones ni existe una evaluacion independiente del artefacto.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no permite identificar alternativas comparables con datos verificables: no hay benchmarks del adaptador, no se declara licencia y el modelo base solo aparece por su identificador y su revision de commit, sin ficha tecnica en los materiales facilitados.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador LoRA (base declarado Qwen/Qwen3.6-27B) | 27B en el base, segun su denominacion; adaptador r=64 | Entrenado a 8192 tokens; contexto del base no disponible | No disponible | No disponible | HuggingFace, 0 descargas, 0 valoraciones |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion; hay que contactar con el autor antes de integrarlo en un producto.
- Sin benchmarks ni evaluaciones: se desconoce si el adaptador mejora, degrada o mantiene las capacidades del modelo base en tareas estandar.
- Trazabilidad de alineamiento incompleta: el propio autor indica que la constitucion se hereda del dataset y no se declara, por lo que no se conocen los criterios de filtrado ni los sesgos presentes en los datos de entrenamiento.
- Sesgos conocidos: no disponible. Al no describirse la composicion del dataset ni los idiomas, no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Riesgo de alucinacion: no cuantificado. Un ajuste SFT de una sola epoca sobre una mezcla no documentada puede alterar el estilo sin mejorar la fidelidad factual, e incluso incrementar la confianza en respuestas incorrectas.
- Limitacion de contexto efectiva: el entrenamiento se realizo con `max_seq_len` de 8192 tokens; usos por encima de ese umbral no estan cubiertos por la receta.
- Dependencia estricta del base: cualquier cambio en la revision del modelo base (`6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`) puede invalidar la compatibilidad del adaptador.
- Versionado anomalo: los identificadores, fechas y el nombre del modelo incluyen la fecha 15/09/2026 y el autor usa la coletilla "deepmind" sin que la informacion confirme ninguna relacion con Google DeepMind; conviene verificar la autoria y la coherencia temporal antes de citarlo.
- Adopcion nula: cero descargas y cero valoraciones implican que no existe validacion por parte de la comunidad ni informes de terceros sobre su comportamiento.
- Formato de distribucion: al ser un adaptador PEFT, no puede desplegarse de forma autonoma; requiere el modelo base, el tokenizer y la configuracion de aplicacion del LoRA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dougalldeepmind/2026-09-15-qwen36-da-gpt-fluff-removed-0
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.6-27B (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`)
- Dataset de mezcla de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-09-15-da-gpt-fluff-removed-7-mix (revision `5444733e6cd26222516cae093c33cd332822c7b2`, archivo `mixture.jsonl`)
- Repositorio de codigo fuente: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication.git (commit `9a7d93b3e443b533e81098ba31d6b87149f5fce9`)
- Papers, blogs o demos adicionales: no disponible. Las busquedas web realizadas no devolvieron ningun resultado relacionado con este modelo.
