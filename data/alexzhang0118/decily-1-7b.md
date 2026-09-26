# alexzhang0118/Decily-1.7B

## Resumen

Decily-1.7B es un modelo de decisión tipo *cross-encoder candidate scorer* publicado por el usuario alexzhang0118. No es un modelo generativo: recibe un `state`, una `question` y un conjunto de 2 a 16 candidatos, y devuelve una distribución de probabilidad calibrada sobre esos candidatos. El problema que resuelve es el de las decisiones que necesitan un umbral numérico fiable en lugar de una frase que haya que parsear, algo habitual en enrutado de intenciones, clasificación de tickets o desambiguación en pipelines.

Técnicamente es un ajuste fino completo del backbone Qwen/Qwen3-1.7B-Base (1.737.374.722 parámetros) al que se le añade una cabeza de scoring con *attention pooling* sobre todos los tokens y un MLP LayerNorm/GELU que emite un logit por candidato. Las probabilidades salen de un softmax sobre el conjunto de candidatos proporcionado en cada llamada, lo que permite calibrar temperatura por dominio (≈1,1 en dominio, ≈0,45 en conjuntos de etiquetas no vistos).

Su relevancia actual está en el nicho de la predicción selectiva: con solo el 5 % de predicciones más confiadas alcanza un 93,3 % de acierto en conjuntos de etiquetas no vistos, frente al 79 % de una línea base SFT con el mismo protocolo. Se distribuye en cuatro contenedores (PyTorch bf16, MLX bf16, MLX 4-bit y ONNX int8) bajo licencia Apache-2.0, lo que facilita su despliegue en servidor, Apple Silicon, CPU y entornos *edge*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder sobre backbone Qwen3-1.7B-Base con cabeza de scoring por attention pooling (`decision_head`) + MLP LayerNorm/GELU |
| Parametros totales | 1.737.374.722 (1,74 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible como ventana unica; limites de entrada de la configuracion de entrenamiento: `state` <= 256 tokens, `question` <= 96 tokens, cada candidato <= 64 tokens, 2-16 candidatos por llamada |
| Tipos de cuantizacion | bf16 (PyTorch y MLX), MLX 4-bit affine group-64, ONNX int8 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, 318 tensores, ~3,47 GB), MLX safetensors, ONNX int8 de fichero unico (1,66 GB) |

Notas adicionales de formato: el repositorio incluye `model.safetensors`, `config.json` (arquitectura Qwen3 + especificacion `decision_head`) y los ficheros del tokenizador Qwen3. El *layout* de claves es el de entrenamiento (`encoder.model.*` para el backbone y `pool.*` / `head.*` para la cabeza de scoring). El tamano del repositorio es de 3,5 GB.

## Arquitectura y entrenamiento

La arquitectura es un cross-encoder: el backbone codifica conjuntamente `state + question + candidate`, una capa de *attention pooling* agrega la informacion de todos los tokens y un MLP con LayerNorm y GELU produce un unico logit por candidato. La distribucion final se obtiene mediante softmax sobre el conjunto de candidatos pasado en la llamada, por lo que los logits son independientes del conjunto y permiten un flujo de dos etapas (preseleccion por trozos y reordenacion posterior sin perdida) cuando el `state` supera los 256 tokens.

El entrenamiento descrito en la model card sigue cinco etapas reproducibles: (1) un profesor, un modelo de decision Qwen3.5-2B de 45 tareas con LoRA y backbone congelado, que actua como etiquetador de referencia; (2) SFT de Qwen3-1.7B con LoRA sobre 24 familias de tareas con etiquetas duras, 3000 pasos (aproximadamente 1 hora); (3) miembros RLCD (v1 y v2 con LoRA mas un miembro con ajuste completo) para calibracion de creencias y abstención; (4) destilacion de un ensemble de 4 modelos en espacio de probabilidad hacia un unico estudiante con ajuste completo, con KD T=2, alpha=0.5 y un 15 % adicional de filas de creencias; y (5) el modelo final (v5), un ajuste fino completo de 3000 pasos con batch efectivo 16, learning rate 1e-5 y AdamW de 8 bits, aproximadamente 1,5 horas en una sola RTX 5090 de 32 GB. La receta completa esta en `TRAINING.md`, con la justificacion de diseno en `DESIGN.md` y los experimentos y ablaciones en `TRAIN-REPORT.md`.

Entre las innovaciones declaradas destacan: la ruta B (scorer explicito de candidatos) supera en +10,6 puntos de exactitud en *held-out* a la ruta A (leer los logits de las letras desde la cabeza LM) en una prueba controlada con el mismo backbone; y el ensemble de 4 modelos alcanza NLL 1,455 mientras que el estudiante destilado unico llega a 1,451 con coste de inferencia 1x.

## Capacidades

- Puntuacion calibrada de candidatos: devuelve una distribucion de probabilidad sobre un conjunto de 2 a 16 opciones dado un `state` y una `question`.
- Clasificacion y enrutado de intenciones: ejemplo de la propia model card con las clases `technical`, `billing`, `shipping` y `returns`.
- Calibracion de temperatura: los logits crudos son sobreconfiados fuera de distribucion; el modelo admite ajuste de temperatura por conjunto de datos.
- Prediccion selectiva y abstención: permite fijar umbrales para alcanzar una tasa de error objetivo (empiricamente 4,7 % de error con un objetivo del 5 %).
- Reordenacion en dos etapas: al ser los logits independientes del conjunto de candidatos, se puede trocear un `state` largo, preseleccionar y reordenar de forma sin perdida.
- Capacidades multilingues: no disponible; el modelo esta etiquetado unicamente para ingles.
- Generacion de texto, tool calling, agentes, vision o audio: no disponible; el modelo no genera texto y no se declaran estas capacidades.
- Modo de razonamiento explicito (*thinking*): no disponible.

## Casos de uso

- Enrutado de intenciones en atencion al cliente: dado el mensaje del usuario como `state` y la pregunta "cual es la intencion del cliente?", el modelo devuelve la probabilidad de cada categoria (facturacion, envios, devoluciones, soporte tecnico), lo que permite activar flujos automaticos con un umbral de confianza definido.
- Triaje de tickets de soporte: clasificar cada ticket entrante por cola o severidad y derivar a un humano cuando la probabilidad maxima quede por debajo del umbral calibrado, usando la capacidad de abstención.
- Moderacion de contenido con umbral: puntuar un conjunto fijo de categorias de politica sobre un texto corto y aplicar acciones graduadas segun la probabilidad, en lugar de depender de una generacion textual que habria que parsear.
- Desambiguacion de entidades o campos en formularios: elegir entre variantes normalizadas (por ejemplo, unidades, monedas o categorias fiscales) a partir de un campo de texto libre y un contexto corto.
- Reranking de candidatos en busqueda o recomendacion: usar la salida del modelo como score de reordenacion de un conjunto de 2 a 16 elementos previamente recuperados, con la variante de dos etapas para documentos largos.
- Clasificacion de intenciones en asistentes de voz o dispositivos: desplegado como MLX 4-bit (968 MB) o ONNX int8 (1,66 GB), cabe en memoria de Apple Silicon o en CPU, sin necesidad de GPU.
- Decisiones con coste asimetrico en pipelines de datos: cuando un falso positivo es mucho mas caro que un falso negativo, la probabilidad calibrada permite fijar el punto de operacion con una tasa de error medible (4,7 % de error observado con objetivo del 5 %).
- Enrutado de modelos en cascada: usar Decily como primer nivel para decidir si una consulta se resuelve con un modelo pequeno o se escala a uno mayor, aprovechando su coste de inferencia bajo (1x sobre un modelo de 1,74 B).

## Benchmarks y rendimiento

Los resultados publicados en la model card siguen el protocolo de exactitud / NLL / ECE despues de ajuste de temperatura. "In-task" se refiere a las 24 familias de tareas entrenadas; "held-out" a conjuntos de etiquetas no vistos; y "fair suite" a 8 tareas no vistas ni por este modelo ni por la linea base externa.

| Evaluacion | Decily (24 tareas) exactitud / NLL / ECE | decider-2b (95 tareas) exactitud / NLL / ECE |
|---|---|---|
| In-task, 24 familias de tareas | 0,863 / 0,390 / 0,034 | 0,811 / 0,453 / 0,032 |
| Fair suite, zero-shot (8 tareas x 300) | 0,654 / 0,86 / 0,092 | 0,700 / 0,71 / 0,047 |
| Conjuntos de etiquetas held-out (60/77 clases de intenciones, 1200) | 0,581 / 1,451 / 0,068 | no disponible (sus puntuaciones incluyen tareas en las que fue entrenado) |

Datos adicionales aportados por el autor:

| Metrica | Valor |
|---|---|
| Prediccion selectiva, 5 % de predicciones mas confiadas (etiquetas no vistas) | 93,3 % de exactitud |
| Linea base SFT con el mismo protocolo de prediccion selectiva | 79 % de exactitud |
| Abstención calibrada a objetivo del 5 % de error | 4,7 % de error alcanzado |
| NLL del ensemble de 4 modelos | 1,455 |
| NLL del estudiante destilado unico (1x coste) | 1,451 |
| Ruta B frente a ruta A (mismo backbone, held-out) | +10,6 puntos de exactitud |

Temperaturas ajustadas observadas: aproximadamente 1,1 en dominio, aproximadamente 0,45 en conjuntos de etiquetas no vistos y aproximadamente 1,35 en la *fair suite* zero-shot.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: los pesos ocupan aproximadamente 3,47 GB, por lo que se puede operar en GPUs con 6-8 GB de VRAM, o en menos si se aplican tecnicas de cuantizacion (estimacion derivada del tamano de pesos; el autor no publica cifras de VRAM en la model card).
- Variante MLX 4-bit (group-64 affine): 968 MB de pesos, apta para memoria unificada de Apple Silicon y para equipos con poca memoria.
- Variante ONNX int8: 1,66 GB en fichero unico, orientada a CPU, Windows y entornos *edge*.
- GPU utilizada para el entrenamiento completo: una RTX 5090 de 32 GB, con un tiempo de aproximadamente 1,5 horas para la etapa final de 3000 pasos. Todo el pipeline se entrena en menos de un dia en ese hardware.
- GPU recomendadas: no disponible como lista oficial; por tamano de pesos, cualquier GPU de 8 GB o mas (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090) puede ejecutar la variante bf16, y A100 o H100 quedan sobredimensionadas para un modelo de 1,74 B.
- Cabe en GPU de consumo: si, en cualquier GPU de 8 GB o superior con la variante bf16, y en equipos de memoria unificada con la variante MLX 4-bit.
- Opciones de despliegue: PyTorch con la clase de modelo del repositorio de entrenamiento (`decision_model.models.cross_encoder.CrossEncoderDecisionModel`), MLX en Apple Silicon y ONNX Runtime en CPU. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI, coherente con que el modelo no es generativo y no expone una interfaz de chat estandar.
- Latencia y throughput estimados: no disponible. Los unicos datos de coste publicados son relativos (el estudiante destilado opera a 1x coste frente al ensemble de 4 modelos).

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / limites | Rendimiento (in-task) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Decily-1.7B | 1,74 B | Cross-encoder candidate scorer (Qwen3-1.7B-Base) | `state` <=256, `question` <=96, candidato <=64, 2-16 candidatos | 0,863 / 0,390 / 0,034 (24 tareas) | apache-2.0 | PyTorch bf16, MLX bf16, MLX 4-bit, ONNX int8 |
| decider-2b | no disponible | Modelo de decision, entrenado sobre 95 tareas | no disponible | 0,811 / 0,453 / 0,032 (tareas compartidas) | no disponible | no disponible |
| Qwen/Qwen3-1.7B-Base | 1,74 B (aproximado) | Transformer decoder generativo | no disponible en la informacion proporcionada | no disponible | apache-2.0 | safetensors en HuggingFace |

Comparativa cualitativa: en la *fair suite* zero-shot (8 tareas no vistas por ninguno de los dos), decider-2b obtiene mejores resultados (0,700 / 0,71 / 0,047) que Decily (0,654 / 0,86 / 0,092), mientras que en las tareas compartidas Decily lidera con 0,863 frente a 0,811, una diferencia de +5,2 puntos. Ambos modelos son de la misma categoria funcional (modelos de decision), aunque decider-2b se entrena sobre 95 tareas frente a las 24 de Decily. La model card no aporta detalles de parametros, licencia ni disponibilidad de decider-2b, por lo que esos campos figuran como no disponibles.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier caso de uso que requiera redaccion, resumen o dialogo queda fuera de su alcance.
- Idiomas: etiquetado unicamente para ingles; no se declara soporte de castellano ni de otros idiomas.
- Limites de entrada estrictos: `state` <=256 tokens, `question` <=96 tokens y cada candidato <=64 tokens. Las entradas mas largas se truncan y exigen trocear el `state` y puntuar por partes.
- Numero de candidatos acotado a 2-16 por llamada; conjuntos mayores requieren preseleccion o particionado.
- Sobreconfianza fuera de distribucion: los logits crudos con T=1 son demasiado confiados, y las temperaturas ajustadas varian mucho segun el dominio (≈1,1 en dominio, ≈0,45 en etiquetas no vistos, ≈1,35 en la *fair suite* zero-shot). Hay que calibrar la temperatura con datos propios antes de fijar umbrales en produccion.
- Degradacion en tareas no vistas: el rendimiento cae de 0,863 de exactitud en tareas entrenadas a 0,581 en conjuntos de etiquetas *held-out* con 60 y 77 clases de intenciones, y a 0,654 en la *fair suite* zero-shot, donde ademas el ECE sube a 0,092.
- Sensibilidad al conjunto de candidatos: al usar softmax sobre las opciones proporcionadas, la distribucion depende de que opciones se incluyan en cada llamada.
- Validacion externa limitada: el repositorio registra 7 descargas y 1 "me gusta", y no hay resultados de benchmarks independientes mas alla de los aportados por el propio autor.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar los avisos de licencia y de atribucion correspondientes. El backbone base (Qwen3-1.7B-Base) tambien es Apache-2.0.
- Trazabilidad del proceso de entrenamiento: parte de las referencias (por ejemplo, el profesor descrito como Qwen3.5-2B y el numero de descargas y fechas del repositorio) provienen exclusivamente de la model card del autor y no se han verificado de forma independiente.

## Enlaces

- Modelo en HuggingFace (PyTorch bf16): https://huggingface.co/alexzhang0118/Decily-1.7B
- Variante MLX bf16: https://huggingface.co/alexzhang0118/Decily-MLX
- Variante MLX 4-bit: https://huggingface.co/alexzhang0118/Decily-MLX-4bit
- Variante ONNX int8: https://huggingface.co/alexzhang0118/Decily-ONNX-int8
- Repositorio de entrenamiento: https://github.com/arczhi/decily
- Receta de entrenamiento completa (TRAINING.md): https://github.com/arczhi/decily/blob/main/TRAINING.md
- Justificacion de diseno (DESIGN.md): https://github.com/arczhi/decily/blob/main/DESIGN.md
- Experimentos y ablaciones (TRAIN-REPORT.md): https://github.com/arczhi/decily/blob/main/TRAIN-REPORT.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Paper, blog o demo adicionales: no disponible
