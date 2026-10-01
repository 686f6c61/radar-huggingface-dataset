# francesca9805/swe-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed10

## Resumen

El modelo `francesca9805/swe-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed10` es un ajuste fino supervisado (SFT) del modelo base `goldfish-models/swe_latn_100mb`, un transformer monolingue para sueco en escritura latina perteneciente a la familia Goldfish. Cuenta con 124.770.816 parametros (unos 124,8 millones) y un peso en disco de aproximadamente 0,3 GB, por lo que se trata de un modelo pequeno, de escala GPT-2, orientado a generacion de texto.

El desarrollo procede del entorno de investigacion de F. Padovani (Universidad de Groninga, segun la referencia de Weights & Biases), y el modelo se ha entrenado con la libreria TRL de Hugging Face. El sufijo del nombre (`ppt`, `Dp-100mb`, `packed`, `bfdiso`, `seed10`) sugiere un experimento de ajuste con datos empaquetados y una semilla concreta, aunque la model card no detalla la composicion del dataset ni la receta exacta.

Su relevancia es fundamentalmente academica: sirve como banco de pruebas para estudiar el efecto del ajuste SFT sobre un modelo base monolingue pequeno, no como un modelo de proposito general. No se han publicado resultados de benchmarks, no tiene descargas ni likes en el momento de redactar esta ficha y su licencia no esta explicitada, por lo que su uso en produccion no esta recomendado sin una evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia GPT-2, segun los tags del repositorio) |
| Parametros totales | 124.770.816 (124,8 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el modelo se distribuye en safetensors (pesos completos) |
| Idiomas soportados | sueco en escritura latina (idioma inferido del modelo base `goldfish-models/swe_latn_100mb`) |
| Licencia | no disponible (la model card indica el marcador generico `licence: license`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `goldfish-models/swe_latn_100mb`, un transformer decoder-only de tipo GPT-2 entrenado por el proyecto Goldfish sobre aproximadamente 100 MB de texto en sueco. Sobre esa base se ha realizado un ajuste fino supervisado (SFT) empleando TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El nombre del modelo incluye `packed`, lo que apunta a un preprocesado con secuencias empaquetadas, y `Dp-100mb`, que podria referirse al volumen de datos de ajuste, pero la model card no confirma ninguno de estos extremos.

No se documentan en el repositorio el numero de tokens de entrenamiento, la composicion del dataset de SFT, ni si hubo etapas de RLHF o DPO. El flujo de entrenamiento registrado en Weights & Biases (proyecto "new-tokenizers") sugiere que el experimento se enmarca en una linea de investigacion sobre tokenizacion, pero no hay informacion tecnica adicional publicada en la model card.

## Capacidades

- Generacion de texto autoregresiva, segun declara el pipeline `text-generation`.
- Ajuste por instrucciones (formato de chat con rol de usuario) gracias al entrenamiento SFT con TRL.
- Generacion monolingue en sueco (idioma heredado del modelo base).
- No hay evidencia de soporte de tool calling, function calling ni uso como agente.
- No hay evidencia de capacidades de vision, audio ni modo de razonamiento explicito.
- No se documentan capacidades multilingues; el alcance linguistico es el del modelo base (sueco).

## Casos de uso

- Investigacion academica sobre ajuste fino: permite estudiar como un SFT corto modifica el comportamiento de un GPT-2 monolingue pequeno, con la ventaja de que el coste computacional de replicar el experimento es bajo.
- Experimentos de tokenizacion: dada la vinculacion del entrenamiento con el proyecto "new-tokenizers", el modelo es util para evaluar el impacto de decisiones de tokenizacion en la generacion.
- Generacion de texto en sueco para tareas de baja exigencia: completado de frases o parrafos cortos donde no se requiera alta fidelidad factual.
- Punto de partida para posteriores ajustes (continued pretraining o DPO) sobre dominio concreto en sueco, aprovechando su tamano reducido.
- Prototipado rapido en local: al caber en cualquier GPU de consumo e incluso en CPU, sirve para validar pipelines de inferencia antes de escalar a modelos mayores.
- Docencia: ejemplo practico de fine-tuning con TRL y de publicacion en Hugging Face con metadatos minimos.
- Comparacion de semillas: la variante con `seed10` permite contrastar estabilidad de resultados frente a otros runs del mismo autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluacion en sueco (como SweSAT o SuperLim), y los directorios de terceros consultados (LLM Explorer, FriendliAI) no aportan cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 0,2 GB en precision completa segun LLM Explorer; en fp16 serian unos 0,25 GB y en cuantizacion de 8 bits alrededor de 0,13 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (GTX 1050, RTX 2060, RTX 3060, RTX 4090) es mas que suficiente.
- Cabe holgadamente en GPU de consumo, e incluso puede ejecutarse en CPU con latencias aceptables dada su escala.
- Opciones de despliegue: transformers (pipeline `text-generation`) de forma nativa; es compatible con text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); tambien seria viable convertirlo a GGUF para llama.cpp/Ollama, aunque no se distribuyen pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (swe-latn-100mb SFT) | 124,8 M | no disponible | sueco | no disponible | Ajuste SFT del base Goldfish; sin benchmarks publicados |
| goldfish-models/swe_latn_100mb | no disponible | no disponible | sueco | no disponible | Modelo base sin ajuste por instrucciones |
| francesca9805/swa-latn-100mb-ppt-Dp-10mb-packed-bfdiso_seed10 | no disponible | no disponible | suajili | no disponible | Variante del mismo autor para otro idioma |
| francesca9805/swe-latn-100mb-ppt-Dp-100mb-packed-bfd_seed10 | no disponible | no disponible | sueco | no disponible | Variante del mismo experimento sin el sufijo `iso` |

No se dispone de datos de rendimiento comparativos entre estos modelos.

## Limitaciones y advertencias

- Riesgo elevado de alucinacion y de generar texto incoherente, propio de modelos de escala GPT-2 entrenados con volumenes de datos reducidos (100 MB).
- Sesgos desconocidos: no se ha publicado ninguna evaluacion de sesgo ni de toxicidad, y el corpus de entrenamiento del modelo base no esta documentado en esta ficha.
- Limitacion linguistica severa: el modelo esta orientado al sueco; su comportamiento en castellano u otros idiomas no esta soportado ni evaluado.
- Longitud de contexto limitada por el modelo base (no especificada aqui); no apto para tareas que requieran ventanas largas.
- Licencia no explicitada: la model card usa el marcador `licence: license` y los metadatos de Hugging Face no indican licencia, por lo que el uso comercial es incierto y requiere contactar con el autor.
- Sin garantias de calidad para produccion: cero descargas, cero likes y ausencia total de benchmarks.
- Soporte nulo de tool calling, agentes y razonamiento multi-paso; no debe emplearse en flujos que dependan de estas capacidades.
- Modelo de investigacion: conviene tratarlo como artefacto experimental y no como componente de un sistema en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/swe-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/goldfish-models/swe_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/d1vleci1
- Ficha en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Fswe-latn-100mb-ppt-Dp-100mb_seed10,2DukqijkSq1696aouyL0X5
- Variante relacionada en FriendliAI: https://friendli.ai/models/francesca9805/swe-latn-100mb-ppt-Dp-100mb-packed-bfd_seed10
