# SlayerLab/Slayer9-DQA-9M

## Resumen

Slayer9-DQA-9M es un modelo de lenguaje decoder-only de 8.786.185 parámetros desarrollado desde cero por Fabryka AI (Arkadiusz Słota) y publicado bajo el identificador SlayerLab/Slayer9-DQA-9M. Se trata de un artefacto de investigación orientado al leaderboard Glint Tiny-ML, no de un modelo de propósito general ni de un modelo ajustado para seguir instrucciones. Su receta de entrenamiento combina un preentrenamiento de 2.000 millones de tokens, una fase de annealing con una mezcla de question answering y un ajuste fino supervisado sobre el split de entrenamiento de ARC.

La arquitectura es un transformer decoder-only de 10 capas, dimensión de modelo 224 y 4 cabezas de atención, con RoPE intercalado (θ = 100.000), SwiGLU con factor ×2,667, RMSNorm, QK-norm y value residual. La cabeza de salida está atada al embedding de tokens. La ventana de contexto es de 1.024 tokens y el tokenizador es un BPE de 12.288 tokens que antepone el separador `<|endoftext|>` (id 12285) a cada texto codificado.

Su relevancia es metodológica más que práctica: documenta con detalle la selección de checkpoint sobre siete semillas (1369-1375), el uso de una regla pre-registrada basada en la métrica Efficiency sobre el eje de validación y la lectura única del split de test. En el momento de redactar esta ficha, el entrenamiento sigue en curso y los pesos aún no se han publicado, por lo que todos los resultados de evaluación figuran como pendientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RoPE intercalado, SwiGLU, RMSNorm, QK-norm, value residual, embeddings atados) |
| Parametros totales | 8.786.185 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (los pesos se publican unicamente en fp32) |
| Idiomas soportados | Ingles (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (fp32), acompanado de config.json y tokenizer.json |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only compacto: 10 capas, `d_model` de 224, 4 cabezas de atención, RoPE con θ = 100.000 en disposición intercalada, SwiGLU con ratio de expansión ×2,667, RMSNorm, QK-norm y value residual. La cabeza de salida está atada al embedding de tokens, de modo que se almacena una sola vez. El tokenizador es un BPE de 12.288 tokens cuyo template antepone `<|endoftext|>` a cada texto codificado; durante el entrenamiento cada documento venía precedido por este separador en el flujo de datos, pero la tokenización se hizo sin el template, de forma que las puntuaciones notificadas usan el tokenizador tal como se distribuye.

El entrenamiento se divide en tres fases. La primera es preentrenamiento más annealing hasta un total de 2.000 millones de tokens (8.720 pasos × 229.376 tokens); la mezcla de preentrenamiento procede de un subconjunto de `SlayerLab/minimal-en-corpus-5b` (obra de Dawid Majewski) restringido a documentos de FineWeb-Edu, DCLM-baseline y Wikipedia, con una proporción aproximada de 47/36/16 por ciento de tokens sobre 2.290 millones disponibles (unas 0,87 épocas). Antes de la selección se eliminaron los documentos solapados con WikiText-2 y con los splits de ARC mediante un escaneo de 13-gramas; BLiMP no se escaneó. La segunda fase es el annealing con question answering, que ocupa los últimos 1.744 pasos (400 millones de tokens): 19,0 por ciento de un pool de QA (cada pasaje una vez, seguido de todas sus preguntas y respuestas, 4 pasadas sobre 18,99 millones de tokens únicos), 15,0 por ciento de WikiText-103 de entrenamiento y 66,0 por ciento de la mezcla de preentrenamiento. Las fuentes del pool son QASC, Cosmos QA, Quoref, ROPES, CommonsenseQA, SQuAD v1.1, DROP y BoolQ, y se eliminaron las preguntas presentes en el train de ARC. La tercera fase es un ajuste fino sobre ARC-Easy más ARC-Challenge de entrenamiento con entropía cruzada listwise sobre las verosimilitudes crudas de las respuestas, 2 épocas fijas, AdamW con lr 5e-5 y un 15 por ciento de replay de language modeling procedente de la mezcla de annealing.

## Capacidades

- Generacion de texto autoregresiva en ingles, con un limite estricto de 1.024 tokens de contexto.
- Question answering extractivo y de opcion multiple, reforzado mediante el annealing con el pool de QA y el ajuste fino sobre ARC.
- Razonamiento de sentido comun y comprension lectora basicos, derivados de las fuentes del pool (CommonsenseQA, Cosmos QA, Quoref, ROPES, BoolQ, DROP).
- Puntuacion de respuestas candidatas mediante verosimilitud: el modelo se ha ajustado con entropia cruzada listwise sobre verosimilitudes crudas, lo que lo hace util para ranking de opciones.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el autor indica explicitamente que no es un modelo de proposito general ni de seguimiento de instrucciones).
- Capacidades multilingues: no, solo ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Modelo de investigacion reproducible: incluye tokenizer.json con hash sha256 documentado e informes de logits identicos al checkpoint de entrenamiento.

## Casos de uso

- Evaluacion comparativa de recetas de preentrenamiento en miniatura: sirve como referencia controlada frente a la receta base (identica pero sin pool de QA en el annealing) para medir el efecto del annealing orientado a QA con un presupuesto de 2.000 millones de tokens.
- Investigacion sobre seleccion de checkpoints: el modelo documenta una regla pre-registrada (elegir la semilla con mayor Efficiency de validacion, desempate por semilla menor, lectura unica del test), lo que permite estudiar la inflacion del numero de validacion al elegir el mejor de siete.
- Experimentos de contabilidad de datos y filtrado: el uso de escaneos de 13-gramas para eliminar solapamientos con WikiText-2 y ARC es un caso practico de control de contaminacion reproducible en corpus pequenos.
- Benchmarking de modelos diminutos en el leaderboard Glint Tiny-ML: el modelo esta disenado especificamente para producir una fila comparable en ese leaderboard con las metricas BLiMP, ARC-Easy test y perplejidad por byte en WikiText-2.
- Pruebas de infraestructura de evaluacion: al publicarse con tokenizer.json, config.json e inferencia en PyTorch, es util para validar pipelines de lm-evaluation-harness 0.4.13 y del protocolo Glint-1.3 en modelos de menos de 10 millones de parametros.
- Educacion y prototipado: al caber holgadamente en CPU y en cualquier GPU de consumo, permite demostrar de extremo a extremo el ciclo preentrenamiento, annealing, ajuste fino y evaluacion sin infraestructura especializada.
- Analisis de licencias y atribucion en datasets: el desglose de licencias por fuente (CC BY-SA, CC BY, ODC-By, MIT) y la obligacion de share-alike convierten al modelo en un caso de estudio de trazabilidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el estado es "training in progress - validation numbers only, not a result" y que los pesos se anadiran tras seleccionar el checkpoint y leer una unica vez el split de test.

| Metric | Glint-1.3 protocol | lm-evaluation-harness 0.4.13 |
|---|---|---|
| BLiMP (67 tareas) | pending | pending |
| ARC-Easy test (2.376 preguntas) | pending | pending |
| WikiText-2 test, perplejidad por byte | pending | pending |
| Overall / Efficiency (formulas del leaderboard) | pending | pending |

Los ejes de validacion previstos son ARC-Easy validation (570 preguntas), BLiMP mitad A (primeras 34 de las 67 tareas de BLiMP, 34.000 pares) y perplejidad por byte en WikiText-2 validation. La tabla de ejecuciones por etapa (receta base preentrenada, esta receta preentrenada, ambas con ajuste fino ARC y la diferencia emparejada por semilla) figura en la model card con contadores de semillas a cero y valores sin rellenar, por lo que no constituye un resultado utilizable.

Nota metodologica: el protocolo Glint-1.3 usa verosimilitud logaritmica cruda sumada en zero-shot sobre los primeros 256 tokens y exactitud cruda, sin anadir BOS propio; lm-evaluation-harness usa el prompt `Question: ...\nAnswer:` y notifica `acc`. Las dos columnas no son mediciones identicas y no deben compararse directamente.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 35 MB para los pesos (8,78 M de parametros x 4 bytes), mas una sobrecarga pequena de activaciones dada la ventana de 1.024 tokens. El consumo real queda muy por debajo de 1 GB.
- Cuantizaciones: no disponibles oficialmente; solo se publican pesos fp32. Cualquier conversion a GGUF, int8 o int4 seria trabajo de la comunidad.
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o una iGPU moderna; el modelo tambien es viable en CPU. GPU de gama alta (A100, H100, RTX 4090) no aportan ventaja relevante a este tamano.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo, incluidos portatiles y sistemas embebidos con memoria suficiente para Python y PyTorch.
- Opciones de despliegue: inferencia directa en PyTorch con los archivos publicados; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Dada la licencia CC BY-SA 4.0 y el formato fp32, la conversion a GGUF seria necesaria para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de 8,78 M de parametros y 10 capas, el coste por token es minimo, pero no se aportan mediciones.

## Comparativa con modelos similares

Los datos de las alternativas que figuran a continuacion proceden de conocimiento publico general y no forman parte de la informacion proporcionada; conviene verificarlos en las model cards originales antes de citarlos.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SlayerLab/Slayer9-DQA-9M | 8,79 M | 1.024 | Decoder-only, ajustado a QA/ARC | CC BY-SA 4.0 | Pesos pendientes de publicacion |
| Modelos tipo Pythia (p. ej. pythia-14m) | ~14 M | 2.048 | Decoder-only, preentrenamiento puro | Apache 2.0 | Publicos |
| GPT-2 small | 124 M | 1.024 | Decoder-only | MIT | Publico |
| SmolLM-135M | 135 M | 2.048 | Decoder-only | Apache 2.0 | Publico |

La diferencia principal de Slayer9-DQA-9M frente a esas alternativas es su escala mucho menor y su especializacion deliberada en question answering, junto con la licencia share-alike heredada de Wikipedia, WikiText-103, ARC, SQuAD, DROP y BoolQ. No se dispone de comparaciones de rendimiento porque los benchmarks del modelo estan pendientes.

## Limitaciones y advertencias

- El autor declara explicitamente que no es un modelo de proposito general ni de seguimiento de instrucciones; no debe usarse como asistente conversacional.
- Estado de entrenamiento en curso: los pesos no estan publicados y todas las metricas figuran como pendientes. No existe ningun resultado verificable en el momento de esta ficha.
- Sesgos conocidos: no documentados. Al entrenarse sobre FineWeb-Edu, DCLM-baseline, Wikipedia y pools de QA en ingles, heredara los sesgos de esas fuentes, pero no hay analisis publicado.
- Riesgo de alucinacion: alto en generacion abierta, como corresponde a un modelo de 8,79 M de parametros con preentrenamiento limitado a 2.000 millones de tokens (menos de una epoca sobre el corpus disponible).
- Limitaciones de contexto: 1.024 tokens, insuficiente para documentos largos, dialogos extensos o tareas que requieran memoria extendida.
- Limitaciones de idioma: exclusivamente ingles; no hay soporte multilingue evaluado.
- Restricciones de licencia: CC BY-SA 4.0 implica obligaciones de atribucion y share-alike para obras derivadas. El uso comercial es posible bajo esas condiciones, pero la clausula de compartir igual puede ser incompatible con productos propietarios. Las fuentes de entrenamiento incluyen material CC BY-SA 3.0 y GFDL (Wikipedia, WikiText-103), lo que refuerza estas obligaciones.
- Caveat estadistico: el propio autor advierte que elegir la mejor de siete semillas sobre validacion infla el numero de validacion de la semilla seleccionada; solo la cifra de test sera insesgada.
- Contaminacion: se aplicaron filtros de 13-gramas contra WikiText-2 y ARC, pero BLiMP no fue escaneado, lo que debe tenerse en cuenta al interpretar esa metrica.
- Reproducibilidad: al publicarse solo en fp32 y sin mecanismos de cuantizacion oficiales, no hay garantia de que conversiones de terceros reproduzcan los logits del checkpoint de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SlayerLab/Slayer9-DQA-9M
- Corpus de preentrenamiento citado: https://huggingface.co/datasets/SlayerLab/minimal-en-corpus-5b
- Conjunto de datos del pool de QA: https://huggingface.co/datasets/allenai/qasc
- https://huggingface.co/datasets/allenai/cosmos_qa
- https://huggingface.co/datasets/allenai/quoref
- https://huggingface.co/datasets/allenai/ropes
- https://huggingface.co/datasets/tau/commonsense_qa
- https://huggingface.co/datasets/rajpurkar/squad
- https://huggingface.co/datasets/ucinlp/drop
- https://huggingface.co/datasets/google/boolq
- https://huggingface.co/datasets/allenai/ai2_arc
- Paper, blog, repositorio de codigo y demo: no disponibles en la informacion proporcionada.
