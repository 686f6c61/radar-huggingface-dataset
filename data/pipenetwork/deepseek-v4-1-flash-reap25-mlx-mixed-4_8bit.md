# pipenetwork/DeepSeek-V4.1-Flash-REAP25-MLX-mixed-4_8bit

## Resumen

DeepSeek-V4.1-Flash-REAP25-MLX-mixed-4_8bit es una compilacion cuantizada para Apple Silicon (MLX) del modelo DeepSeek-V4.1-Flash, publicada por el usuario pipenetwork. No es un modelo entrenado desde cero: es una conversion del checkpoint oficial en FP8/FP4 a un formato mixto de 4 y 8 bits, con decodificacion bit-exacta de los bloques ue8m0 de 32x32 y del empaquetado fp4 por grupos de 32, seguida de una recuantizacion con grupo 64. El resultado ocupa 351,1 GB en disco y esta pensado para maquinas Apple de clase 384 GB de memoria unificada (351 GB residentes).

El checkpoint incorpora una poda REAP que conserva 288 de los 384 expertos enrutados por capa (25% podados en las 40 capas), mas una capa de embeddings engram con tablas de 196,6 B de parametros (el 26% del modelo) cuantizadas a 8 bits. La arquitectura subyacente combina MoE con atencion MLA, comparticion de cache KV entre capas (cuatro capas con compresor sirven a las 40), hiper-conexiones Sinkhorn escalonadas y sumideros de atencion por capa.

Su relevancia es doble. Por un lado, demuestra que un modelo de la clase 750 B puede ejecutarse en hardware de escritorio de gama alta con memoria unificada, a costa de una perdida medible de calidad (perplejidad 2,9777 en wikitext-2 frente al build sin podar, un 2,81% peor). Por otro, es un caso de estudio de ingenieria de portado: la arquitectura `deepseek_v41` no existe en transformers, mlx-lm ni mlx-vlm, de modo que el checkpoint solo carga mediante un port propio validado contra la implementacion de referencia de DeepSeek, con paridad fp32 de 1e-6 y hallazgo documentado de un bug de decodificacion en el codigo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion MLA, comparticion de cache KV entre capas, embeddings engram con hash de n-gramas e hiper-conexiones Sinkhorn |
| Parametros totales | 310.914.735.984 (~310,9 B) segun el recuento real de safetensors del repo; la model card describe el modelo base con 754,6 B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: expertos enrutados a 4 bits (grupo 64); tablas engram, atencion MLA, expertos compartidos, embeddings y `head` a 8 bits (grupo 64); `wo_a`, hiper-conexiones, sinks, sesgos del router, compresor, claves del indexer y normas sin cuantizar (bf16/fp32) |
| Idiomas soportados | no disponible (el conjunto de calibracion de la poda incluye diez idiomas de Wikipedia, wikitext-2 y codigo) |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX; el checkpoint upstream esta en FP8/FP4 |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4.1-Flash, es un MoE de 754,6 B de parametros con 40 capas y 384 expertos enrutados por capa. La atencion es MLA con comparticion de cache KV entre capas: solo cuatro capas tienen compresor propio y su cache sirve a las 40. A esto se suma una capa de embeddings engram de dos niveles basada en n-gramas con hash, cuyas tablas suman 196,6 B de parametros (aproximadamente el 40% del checkpoint) y que constituye el grueso de los parametros no experto. Completan la arquitectura hiper-conexiones Sinkhorn escalonadas, sumideros de atencion por capa y un `wo_a` de salida en LoRA block-diagonal. El checkpoint original incluye ademas tres capas de prediccion multi-token (cabezas DSpark markov/confidence) y una torre de vision con aligner; esta conversion no incluye las capas de prediccion y, aunque arrastra la torre de vision y el aligner sin modificar, el runtime es exclusivamente de texto.

No hay informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base. Lo que si se documenta es el proceso de esta conversion: decodificacion bit-exacta del FP8 ue8m0 por bloques de 32x32 y del empaquetado fp4 por grupos de 32, recuantizacion afina con grupos de 64, y poda REAP aplicada sobre el build ya cuantizado. La seleccion de expertos se hizo por saliencia REAP (peso de enrutado aplicado medio multiplicado por la norma de la salida del experto) sobre 65.536 tokens de calibracion procedentes de wikitext-2 de entrenamiento, diez idiomas de Wikipedia y codigo, sin solapamiento de 32-gramas con el conjunto de evaluacion. Los expertos conservados retienen el 90,4% de la masa de saliencia y dos mitades disjuntas del conjunto de calibracion eligen el mismo subconjunto el 93,4% de las veces.

Entre las innovaciones tecnicas del port destacan la validacion estricta (cero tensores faltantes y cero inesperados en la carga), la paridad de 1e-6 en configuracion reducida frente a `inference/model.py` de DeepSeek, y controles negativos que demuestran que las rutas fragiles son criticas: romper el rope-inverse produce un desplazamiento de logits de 0,84, los sumideros de atencion 0,65 y la comparticion entre capas 0,56. Se documenta ademas un bug de decodificacion en la referencia upstream, donde el indexer en pasos impares lee las claves de la capa equivocada (desplazamiento de logits de 0,67); el port usa la cache de la capa propietaria.

## Capacidades

- Generacion de texto autoregresiva en modo solo texto; el runtime no expone la torre de vision pese a estar presente en los pesos.
- Razonamiento y generacion de codigo, heredados del modelo base, sin benchmarks publicados en esta ficha que lo cuantifiquen.
- Carga y decodificacion con cache KV compartida entre 40 capas, lo que reduce el coste de memoria de la cache frente a un transformer denso equivalente.
- Soporte de prefill por trozos (chunked prefill) y prefill completo en el port, con paridad numerica verificada frente a la referencia.
- Capacidad multilingue potencial por el modelo base y por el conjunto de calibracion (diez idiomas de Wikipedia), aunque no se enumeran idiomas soportados.
- Sin soporte de tool calling, function calling ni modo agente documentado en la informacion disponible.
- Sin modo thinking explicito documentado; las cabezas de prediccion multi-token DSpark no estan incluidas.

## Casos de uso

- Investigacion sobre cuantizacion mixta: el checkpoint es un banco de pruebas directo para medir como afecta cada receta (8 bits, 6 bits, 4 bits, engram a 4 o 6 bits) a la divergencia por capa y a la perplejidad, con una escalera de resultados publicada y reproducible.
- Validacion de portados de arquitecturas no soportadas: sirve como caso de referencia para verificar un port propio contra `inference/model.py`, con criterios concretos de paridad fp32 y controles negativos sobre las rutas fragiles.
- Inferencia local en estacion de trabajo Apple: con 351,1 GB residentes en una maquina de clase 384 GB de memoria unificada, permite ejecutar un MoE de ~750 B sin GPU dedicada ni clúster.
- Generacion de texto de proposito general offline: al ser un modelo base de texto con decodificacion greedy coherente, encaja en entornos air-gapped donde no se puede depender de APIs externas.
- Estudio de poda de expertos: la comparacion entre el build podado y el no podado sobre ventanas identicas (ratio de perplejidad 1,0281, peor en 107 de 140 ventanas) permite evaluar el coste real de eliminar el 25% de los expertos.
- Evaluacion de estrategias de memoria: medir el efecto de la comparticion de cache KV entre capas y de las tablas engram en el consumo de RAM durante prefill y decodificacion con cache.
- Reproducibilidad de resultados de cuantizacion: la metodologia de calibracion (65.536 tokens, sin solapamiento de 32-gramas, doble mitad disjunta) es reutilizable para auditar decisiones de poda en otros MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de calidad son la perplejidad y la escalera de divergencia por capa.

Escalera de divergencia por capa frente a la referencia bf16 desquantizada (40 capas, 16.384 tokens de wikitext-2, teacher-forced y free-running):

| Receta | Teacher-forced (media) | Free-running (capa final) | Coseno (final) |
|---|---:|---:|---:|
| 8 bits | 0,0084 | 0,1243 | 0,9910 |
| 6 bits | 0,0177 | 0,1393 | 0,9886 |
| 4 bits con engram a 4 bits | 0,0579 | 0,2714 | 0,9634 |
| Mixta 4/8, engram segun envio (fp8/ue8m0) | 0,0335 | 0,1948 | 0,9800 |
| Mixta 4/8, engram a 6 bits (build de 1 TB) | 0,0335 | 0,1945 | 0,9801 |
| Mixta 4/8, engram a 4 bits (build de 512 GB) | 0,0342 | 0,2090 | 0,9775 |

Perplejidad y comparacion con el build sin podar:

| Metrica | Valor |
|---|---|
| Perplejidad wikitext-2 test (286.580 tokens, 140 ventanas de 2048) | 2,9777 [2,7860; 3,1838] |
| Ratio frente al build sin podar (ventanas identicas) | x1,0281 [1,0186; 1,0388] |
| Ventanas peores que el build sin podar | 107 de 140 |
| Retencion de masa de saliencia de los expertos conservados | 90,4% de media |
| Coincidencia del conjunto conservado entre mitades disjuntas de calibracion | 93,4% |

El hallazgo principal de la model card es que un engram a 6 bits es indistinguible de las tablas fp8 originales (0,1945 frente a 0,1948 free-running), mientras que bajarlo a 4 bits cuesta un 7,3% adicional en free-running; el build de engram a 6 bits ocupa 477 GB y no cabe en una maquina de 512 GiB, por lo que el build publicado usa engram a 4 bits.

## Requisitos de hardware

- Memoria: clase 384 GB de memoria unificada, con 351 GB residentes. La model card indica que el objetivo es una maquina de 512 GiB.
- GPU dedicada: no aplica; el checkpoint es MLX y esta pensado para memoria unificada de Apple Silicon. No cabe en GPU de consumo: una RTX 4090 con 24 GB queda muy lejos de los 351 GB necesarios, y tampoco cabe en A100 de 80 GB ni en H100 de 80 GB sin un esquema de offload no documentado.
- No cabe en ninguna GPU consumer actual; requiere hardware Apple de gama alta con memoria unificada (clase Mac Studio o superior).
- Opciones de despliegue: exclusivamente el port https://github.com/PipeNetwork/deepseek-v41-mlx. No hay soporte en vLLM, llama.cpp, Ollama ni TGI, y la arquitectura `deepseek_v41` no existe en transformers, mlx-lm ni mlx-vlm.
- Coste de almacenamiento: 351,1 GB de pesos en disco, mas el espacio necesario para el checkpoint durante la descarga.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No hay datos en la informacion disponible sobre modelos de terceros comparables (por ejemplo, otros MoE de la misma clase con implementacion MLX). La comparacion factible es interna a esta familia de builds:

| Modelo | Parametros | Tamano en disco | Engram | Perplejidad / divergencia | Licencia |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash (upstream, FP8/FP4) | 754,6 B | no disponible | fp8/ue8m0 | referencia bf16 desquantizada | MIT |
| Este build (REAP25, mixta 4/8, engram 4 bits) | 310,9 B segun safetensors | 351,1 GB | 4 bits | 2,9777; free-running 0,2090; coseno 0,9775 | MIT |
| Build del mismo set con engram 6 bits | no disponible | 477 GB | 6 bits | free-running 0,1945; coseno 0,9801 | MIT |
| Build del mismo set sin podar | no disponible | no disponible | 4 u 8 bits | ratio x1,0281 frente al podado (el podado es peor en 107/140 ventanas) | MIT |

## Limitaciones y advertencias

- El checkpoint no carga en ningun runtime estandar: requiere clonar e instalar el port de PipeNetwork. Sin el, los pesos son inutilizables.
- Las capas de prediccion multi-token (cabezas DSpark markov/confidence) no estan incluidas, de modo que cualquier capacidad asociada a ellas esta ausente.
- La torre de vision y el aligner estan presentes en los pesos pero el runtime es solo texto; no se puede asumir capacidad multimodal.
- La poda REAP elimina el 25% de los expertos enrutados. Aunque se retiene el 90,4% de la masa de saliencia, el efecto medido es una perplejidad un 2,81% peor que el build sin podar, con degradacion en 107 de las 140 ventanas evaluadas. La propia model card advierte que la retencion de saliencia no es una medida de calidad.
- El cuantizado a 4 bits de los expertos introduce divergencia: 0,0579 teacher-forced y 0,2714 free-running en la receta puramente de 4 bits, frente a 0,0084 y 0,1243 en la de 8 bits.
- La cuantizacion a 8 bits del engram es la opcion de mayor calidad, pero el build de 4 bits es el unico que cabe en maquinas de 512 GiB; hay un compromiso explicito entre memoria y fidelidad.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; solo se verifica que la generacion greedy es coherente mediante una prueba de colapso.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo, toxicidad o seguridad.
- Idiomas soportados: no disponibles. La calibracion de la poda cubre diez idiomas de Wikipedia, pero eso no implica soporte declarado.
- Longitud de contexto: no disponible, lo que impide planificar cargas con entradas largas.
- Licencia MIT, igual que el modelo base, por lo que no hay restricciones documentadas para uso comercial; conviene verificar igualmente los terminos del checkpoint upstream de DeepSeek.
- Se documenta un bug en el codigo de referencia de DeepSeek: el indexer en pasos impares lee las claves de la capa equivocada, con un desplazamiento de logits de 0,67. Cualquier implementacion que replique la referencia literalmente heredara ese comportamiento.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/pipenetwork/DeepSeek-V4.1-Flash-REAP25-MLX-mixed-4_8bit
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Port y runtime MLX: https://github.com/PipeNetwork/deepseek-v41-mlx
- Notas sobre la referencia upstream (bug del indexer): `docs/upstream-notes.md` dentro del repositorio del port
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las consultas devolvieron unicamente resultados genericos sobre YouTube, sin relacion con el modelo.
