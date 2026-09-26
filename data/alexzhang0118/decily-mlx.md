# alexzhang0118/Decily-MLX

## Resumen

Decily-MLX es la variante en formato MLX bf16 de Decily-1.7B, un modelo de decisión de tipo candidate scorer publicado por el usuario alexzhang0118, con el repositorio de entrenamiento en arczhi/decily. A diferencia de un modelo de lenguaje convencional, Decily no genera texto: recibe un estado (state), una pregunta (question) y un conjunto de candidatos, y devuelve una distribución de probabilidad calibrada sobre esos candidatos mediante softmax. Está pensado para decisiones en las que se necesita una probabilidad que se pueda umbralizar, no una frase que haya que interpretar.

Técnicamente se construye sobre el backbone Qwen/Qwen3-1.7B-Base (1.737.374.722 parámetros, licencia Apache-2.0), al que se añade una cabeza de scoring con attention pooling. Esta variante MLX ocupa 3,47 GB y está orientada a Apple Silicon; la familia incluye también versiones en PyTorch bf16, MLX 4-bit (968 MB) y ONNX int8 (1,66 GB). La arquitectura sigue un esquema cross-encoder: el backbone codifica conjuntamente state + question + candidate, una capa de attention pooling agrega todos los tokens y un MLP LayerNorm/GELU produce un logit por candidato.

La relevancia del modelo está en su enfoque de calibración y selective prediction: permite fijar umbrales de abstención para alcanzar una tasa de error objetivo y, según su model card, logra un 93,3% de acierto sobre el 5% de predicciones más confiables en conjuntos de etiquetas no vistos. Está entrenado únicamente en inglés y el repositorio presenta una adopción muy baja (3 descargas, 0 likes) en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder sobre backbone Qwen3-1.7B-Base con cabeza de scoring de attention pooling (decision_head registrada en config.json) |
| Parámetros totales | 1.737.374.722 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica en el sentido habitual; límites de entrada en configuración de entrenamiento: state ≤256 tokens, question ≤96 tokens, cada candidato ≤64 tokens, 2-16 candidatos por llamada |
| Tipos de cuantización | bf16 (MLX/PyTorch), 4-bit affine group-64, int8 (ONNX) en el conjunto de la familia |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX bf16); la familia incluye además safetensors PyTorch bf16 y ONNX int8 |
| Tamaño del bundle | 3,47 GB (repo 3,5 GB) |
| Librería | mlx |

## Arquitectura y entrenamiento

El modelo es un cross-encoder candidate scorer. El backbone Qwen3-1.7B-Base codifica conjuntamente `state + question + candidate`, una capa de attention pooling sobre todos los tokens alimenta un MLP LayerNorm/GELU que emite un logit por candidato, y las probabilidades se obtienen con un softmax sobre el conjunto de candidatos proporcionado en la llamada. Los logits del cross-encoder son independientes del conjunto de candidatos, lo que permite trocear documentos largos y hacer shortlisting por chunks seguido de un re-ranking sin pérdida, según la utilidad de inferencia en dos etapas del repositorio. Las entradas que superan los límites (state 256, question 96, candidato 64 tokens) se truncan.

El entrenamiento sigue una receta de destilación en varias etapas: un modelo profesor de decisión Qwen3.5-2B de 45 tareas (LoRA con backbone congelado); un SFT de LoRA sobre Qwen3-1.7B en 24 familias de tareas con etiquetas duras (3000 pasos, ~1 h); varios miembros RLCD (LoRA v1 y v2 más un miembro full-FT) orientados a calibración de creencias y abstención; y una destilación final desde un ensemble de 4 modelos en espacio de probabilidad hacia un único estudiante full-FT (KD T=2, α=0,5, +15% de filas de creencias). La versión v5, que corresponde a estos pesos, es un full fine-tune de 3000 pasos, batch efectivo 16, lr 1e-5, AdamW de 8 bits, aproximadamente 1,5 h en una RTX 5090 de 32 GB. La model card destaca que la ruta de scorer explícito (Route B) supera a la ruta de logits de letras del LM-head (Route A) en +10,6 puntos de accuracy en un test controlado con el mismo backbone, y que el ensemble de 4 modelos alcanza NLL 1,455 mientras que el modelo destilado único alcanza 1,451 a 1× coste de inferencia.

## Capacidades

- Puntuación de candidatos frente a un state y una question, devolviendo una distribución de probabilidad calibrada (no genera texto).
- Salida apta para umbralización: el softmax se calcula sobre el conjunto de candidatos pasado en cada llamada.
- Selective prediction y abstención: permite calibrar umbrales orientados a una tasa de error objetivo.
- Soporte de 2 a 16 candidatos por llamada y de conjuntos de etiquetas amplios (se reportan conjuntos de 60 y 77 clases).
- Shortlisting y re-ranking por chunks en documentos largos gracias a la independencia del cross-encoder respecto al conjunto de candidatos.
- Inferencia on-device y en CPU (variantes MLX 4-bit y ONNX int8 de la familia).
- Idioma: únicamente inglés.
- Tool calling / function calling: no soportado (el modelo no genera texto ni llamadas a herramientas).
- Capacidades de agente y razonamiento multi-step: no soportadas.
- Sin capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Clasificación de intención en soporte al cliente: dado un mensaje como state y un conjunto de intenciones candidatas (technical, billing, shipping, returns), el modelo devuelve una distribución calibrada; en el ejemplo de la model card, "technical" obtiene 0,9999 frente a intenciones alternativas casi nulas. Permite decidir umbrales y derivar a un humano cuando la confianza es baja.
- Enrutamiento de tickets y colas de trabajo: con 60-77 clases de intención en conjuntos de etiquetas no vistos, el modelo permite enrutar cada entrada a la cola o al equipo correspondiente con una probabilidad asociada, en lugar de una etiqueta dura sin medida de incertidumbre.
- Shortlisting y re-ranking en pipelines de recuperación: la independencia del cross-encoder respecto al conjunto de candidatos permite trocear estados largos en chunks por debajo de 256 tokens, puntuar cada chunk y reordenar los resultados sin pérdida, integrándolo como etapa de re-ranking.
- Selective prediction con abstención en pipelines automatizados: calibrar el umbral a una tasa de error objetivo; según la model card se alcanza empíricamente un 4,7% de error con un objetivo del 5%, y el 5% de predicciones más confiables presenta un 93,3% de acierto.
- Moderación o categorización de contenido: tratar cada categoría de riesgo como candidato y obtener una probabilidad por categoría, apta para reglas de decisión coherentes con la política interna.
- Clasificación de formularios y extracción de etiquetas: para conjuntos de campos o valores candidatos, el modelo devuelve una distribución sobre las opciones, útil en pipelines de captura documental con validación por umbral.
- Despliegue on-device en Apple Silicon: la variante MLX 4-bit (968 MB) permite ejecutar la puntuación de decisiones en un Mac sin GPU dedicada, usando el script `mlx/decision_mlx.py` del repositorio de referencia.
- Despliegue en CPU y Windows: la variante ONNX int8 (1,66 GB) en un único fichero está pensada para CPU, Windows y entornos edge.

## Benchmarks y rendimiento

Protocolo: accuracy / NLL / ECE tras ajuste de temperatura. "In-task" son las 24 familias de tareas entrenadas, "held-out" son conjuntos de etiquetas no vistos y "fair suite" son 8 tareas no vistas ni por este modelo ni por la línea base externa.

| Evaluación | Decily (24 tareas) | decider-2b (95 tareas) |
|---|---|---|
| In-task, 24 familias (tareas de entrenamiento compartidas) | 0,863 / 0,390 / 0,034 | 0,811 / 0,453 / 0,032 |
| Fair suite, zero-shot (8 tareas × 300) | 0,654 / 0,86 / 0,092 | 0,700 / 0,71 / 0,047 |
| Held-out label sets (intenciones de 60/77 clases, 1200) | 0,581 / 1,451 / 0,068 | — (sus puntuaciones incluyen tareas de entrenamiento) |

Lectura de los números según la model card: Decily supera a decider-2b, más grande y con 95 tareas, en +5,2 puntos en las tareas en las que ambos fueron entrenados, con 1,7 B frente a 2 B de parámetros y aproximadamente 1/4 de la cobertura de tareas. En tareas que ninguno ha visto, decider-2b lidera por 4,6 puntos, con la diferencia concentrada en tareas intensivas en conocimiento (sciq, pubmedqa, quality). El texto de la model card disponible se interrumpe en la explicación de esta brecha zero-shot.

Selective prediction sobre conjuntos de etiquetas no vistos: tomar solo el 5% de predicciones más confiables da un 93,3% de accuracy, frente al 79% de una línea base SFT con el mismo protocolo. Los umbrales de abstención pueden calibrarse a una tasa de error objetivo (4,7% alcanzado con objetivo del 5%).

## Requisitos de hardware

- VRAM/memoria estimada para inferencia según el tamaño de pesos publicado: ~3,5-5 GB en bf16 (MLX o PyTorch), ~1,5 GB en MLX 4-bit y ~2 GB en ONNX int8 (valores estimados a partir del tamaño de los ficheros; la model card no publica cifras de pico de memoria).
- Apple Silicon: la variante MLX bf16 (3,47 GB) y la MLX 4-bit (968 MB) están diseñadas para Mac; la 4-bit es la opción orientada a poca memoria.
- GPU de servidor: la variante PyTorch bf16 (~3,4 GB) para GPU; no se especifican modelos concretos para inferencia en la información disponible.
- Consumer GPU: no se indica explícitamente compatibilidad, pero el tamaño de pesos bf16 (~3,4 GB) queda dentro de la VRAM de una GPU de consumo moderna; no hay datos publicados de latencia o throughput.
- CPU / Windows / edge: variante ONNX int8 en un único fichero de 1,66 GB.
- Entrenamiento: la model card indica que todo el pipeline se entrena en una única RTX 5090 de 32 GB en menos de un día (la etapa v5, ~1,5 h).
- Opciones de despliegue: implementación de referencia `mlx/decision_mlx.py` del repositorio arczhi/decily para MLX y runtime de ONNX para la variante int8. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no son de aplicación directa al no tratarse de un modelo generativo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tareas entrenadas | In-task (acc/NLL/ECE) | Fair suite (acc/NLL/ECE) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Decily-1.7B (v5) | 1,7 B | 24 familias | 0,863 / 0,390 / 0,034 | 0,654 / 0,86 / 0,092 | Apache-2.0 | 4 variantes (PyTorch bf16, MLX bf16, MLX 4-bit, ONNX int8) |
| decider-2b | 2 B | 95 tareas | 0,811 / 0,453 / 0,032 | 0,700 / 0,71 / 0,047 | no disponible | no disponible en la información proporcionada |

No se han publicado en la información disponible otras alternativas comparables de la misma categoría (candidate scorer calibrado para decisiones).

## Limitaciones y advertencias

- El modelo no genera texto: solo puntúa candidatos. Cualquier caso de uso que requiera generación, resumen o diálogo queda fuera de su alcance.
- Idioma: entrenado únicamente en inglés; no hay evidencia de soporte multilingüe.
- Límites de entrada estrictos: state ≤256 tokens, question ≤96 tokens, cada candidato ≤64 tokens y entre 2 y 16 candidatos por llamada. Las entradas más largas se truncan y exigen trocear el estado.
- Calibración dependiente del dominio: los logits en bruto son sobreconfiados fuera de distribución. Las temperaturas ajustadas observadas son ≈1,1 in-domain, ≈0,45 en conjuntos de etiquetas no vistos y ≈1,35 en la fair suite zero-shot. Es imprescindible recalibrar la temperatura para los datos propios antes de umbralizar.
- Rendimiento en tareas no vistas: accuracy de 0,581 en conjuntos de etiquetas no vistos y NLL 1,451, sensiblemente peor que in-task (0,863 y 0,390).
- Brecha en tareas intensivas en conocimiento: en la fair suite zero-shot, decider-2b supera a Decily (0,700 frente a 0,654), con la diferencia concentrada en sciq, pubmedqa y quality.
- Riesgo de confianza mal calibrada fuera de distribución: dado que la salida es una probabilidad, una confianza alta no implica corrección si el conjunto de candidatos o el dominio difieren del entrenamiento.
- Sesgos: la información disponible no detalla la composición del dataset ni análisis de sesgos.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y la atribución correspondiente.
- Adopción muy baja en el momento de la ficha (3 descargas, 0 likes), lo que implica poca validación independiente por parte de la comunidad.
- No se publican datos de latencia, throughput ni consumo de memoria en producción.

## Enlaces

- HuggingFace (este repositorio, MLX): https://huggingface.co/alexzhang0118/Decily-MLX
- HuggingFace (Decily-1.7B, PyTorch bf16): https://huggingface.co/alexzhang0118/Decily-1.7B
- HuggingFace (Decily-MLX-4bit): https://huggingface.co/alexzhang0118/Decily-MLX-4bit
- HuggingFace (Decily-ONNX-int8): https://huggingface.co/alexzhang0118/Decily-ONNX-int8
- Repositorio de entrenamiento e implementación de referencia: https://github.com/arczhi/decily
- Receta de entrenamiento reproducible (TRAINING.md): https://github.com/arczhi/decily/blob/main/TRAINING.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
