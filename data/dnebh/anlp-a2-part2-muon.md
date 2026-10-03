# dnebh/anlp-a2-part2-muon

## Resumen

`dnebh/anlp-a2-part2-muon` es un transformer decoder-only denso de 33.489.920 parametros (aproximadamente 33,5 M), publicado por el usuario dnebh como parte de una practica academica de la asignatura ANLP (Advanced Natural Language Processing). El modelo se entrena con prediccion del siguiente token sobre el corpus `browndw/human-ai-parallel-corpus` y su rasgo mas distintivo no es la arquitectura, sino el optimizador: un Muon implementado desde cero con learning rate 0.04, momentum 0.95, Nesterov activado y 5 pasos de Newton-Schulz (`ns_steps`), combinado con un ratio de AdamW de 0.2. El objetivo declarado del autor es comparar el comportamiento de Muon frente a optimizadores convencionales en un entorno controlado.

El entrenamiento consumio 48.496.640 tokens en 2.960 pasos, con batch de 64 y 16.384 tokens por paso, una fase de warmup de 296 pasos y una duracion total de 1.184 segundos (unos 20 minutos). El modelo parte de documentos base de `human-ai-parallel-corpus` con ventanas de secuencia de 256 tokens, lo que fija su contexto efectivo en 256 tokens, muy corto para estandares actuales de produccion. Los resultados finales reportados son val loss 3,0608, perplejidad de validacion 21,345 y un BLEU de test de 0,8531 sobre 414 items.

Es relevante ahora unicamente como artefacto de investigacion reproducible sobre optimizadores: no es un modelo de proposito general, no tiene licencia declarada, no tiene pipeline asignado y acumula 0 descargas y 0 likes. Cualquier evaluacion practica debe tratarlo como un experimento de laboratorio y no como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (config 1 de la Parte 1 del repositorio de la practica) |
| Parametros totales | 33.489.920 (33,5 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens (seq_len de entrenamiento; no se documenta extension posterior) |
| Tipos de cuantizacion | no disponible en la model card; el repositorio solo contiene pesos en safetensors |
| Idiomas soportados | no disponible (el corpus `browndw/human-ai-parallel-corpus` se usa para pares persona-IA; no se documenta la composicion linguistica) |
| Licencia | no disponible (no declarada en HuggingFace ni en la model card) |
| Formato de pesos | safetensors (tag del repositorio); tamano del repo 0,1 GB |
| Optimizador | Muon desde cero, lr 0,04, momentum 0,95, Nesterov, ns_steps 5, weight_decay 0,1, adamw_lr_ratio 0,2, betas [0,9, 0,95], eps 1e-08 |
| Tokens de entrenamiento | 48.496.640 |
| Pasos totales | 2.960 (warmup 296) |
| Batch size | 64 (16.384 tokens por paso) |
| Semilla | 42 (entrenamiento), 0 (preparacion de datos) |
| Tiempo de entrenamiento | 1.184,03 s |
| Carga | `src.part1.hub.load_exported_model(<folder>)` del repositorio de la practica |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso, sin mezcla de expertos, sin mecanismos de estado (SSM) ni componentes hibridos. Corresponde a la "config 1" de la Parte 1 de la practica, con 33.489.920 parametros. No se detallan en la informacion disponible el numero de capas, cabezas de atencion, dimension del modelo ni tipo de posicional encoding, por lo que no es posible reproducir la topologia exacta a partir de la model card.

El entrenamiento usa prediccion autorregresiva del siguiente token sobre `browndw/human-ai-parallel-corpus`, con 7.462 documentos base de entrenamiento, 414 de validacion y 414 de test, 66.320 filas en total en la estadistica de datos, 189.503 ventanas de entrenamiento y 10.539 de validacion. El flujo de entrenamiento cubre el 99,97 % del dataset en una sola pasada (fraction 1.0), sin indicios de RLHF, DPO ni ajuste por instrucciones. No se menciona decodificacion especulativa, atencion lineal ni ninguna otra innovacion de inferencia.

La innovacion tecnica es el optimizador: un Muon escrito desde cero con ortogonalizacion mediante iteraciones de Newton-Schulz (5 pasos) y momentum de Nesterov, complementado por un AdamW auxiliar con learning rate escalado al 0.2 del principal. La curva de validacion incluida en la model card muestra un descenso monotono de la perdida (de 9,8065 en el paso 0 a 3,0608 en el paso 2.960) y una perplejidad que pasa de 18.151,59 a 21,345. El BLEU de test, en cambio, no es monotono: baja de 0,5803 (paso 592) a 0,4722 (paso 1.776) antes de recuperarse hasta 0,8531 al final, lo que sugiere alta varianza en esa metrica con solo 414 items de evaluacion.

## Capacidades

- Generacion de texto autorregresiva (prediccion del siguiente token) en secuencias de hasta 256 tokens.
- Modelado de lenguaje a pequena escala: util como banco de pruebas para comparar optimizadores, tasas de aprendizaje y schedules.
- Generacion condicionada por prefijo corto, limitada por la ventana de 256 tokens.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta un modo "thinking" ni capacidades de razonamiento explicito.
- No se documentan capacidades de vision, audio ni multimodalidad.
- Capacidades multilingues: no disponibles; no se especifica la composicion linguistica del corpus de entrenamiento.
- No se documenta ajuste por instrucciones ni alineacion con preferencias humanas.

## Casos de uso

- Reproduccion de experimentos con el optimizador Muon: el modelo y su configuracion completa (lr, momentum, ns_steps, betas, warmup) permiten replicar el entrenamiento de referencia y medir el efecto de variar cada hiperparametro.
- Estudio comparativo de optimizadores en modelos pequenos: con 33,5 M de parametros y 20 minutos de entrenamiento en el hardware usado por el autor, es viable ejecutar barridos de Muon frente a AdamW sobre el mismo corpus y la misma semilla.
- Docencia y practicas de NLP: sirve como ejemplo funcional de un pipeline completo (tokenizacion, ventanas de 256, exportacion a safetensors, evaluacion con BLEU) para alumnos de posgrado.
- Pruebas de infraestructura de entrenamiento: su tamano minimo permite validar scripts de distributed training, logging en W&B y checkpoints sin consumir recursos significativos.
- Investigacion sobre curvas de aprendizaje: la serie de validacion publicada (11 puntos con perdida, perplejidad y BLEU) es util para estudiar estabilidad y varianza metrica en regimenes de pocos tokens.
- Evaluacion de tecnicas de cuantizacion: al ser un modelo de 33,5 M en safetensors, es un candidato comodo para medir degradacion de calidad al pasar a 8 o 4 bits.
- Filtrado o preprocesado ligero de texto en entornos de bajos recursos, siempre que las secuencias no excedan los 256 tokens y se acepte una calidad de generacion muy limitada.

## Benchmarks y rendimiento

Los unicos datos publicados son la curva de validacion y el BLEU de test del propio autor. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar, y la model card no ofrece comparaciones con modelos externos.

| Metrica | Paso 0 | Paso 592 | Paso 1.480 | Paso 2.368 | Paso 2.960 (final) |
|---|---|---|---|---|---|
| Val loss | 9,8065 | 3,9517 | 3,5686 | 3,1806 | 3,0608 |
| Val perplexity | 18.151,59 | 52,026 | 35,468 | 24,062 | 21,345 |
| Test BLEU | 0,1444 | 0,5803 | 0,5801 | 0,7520 | 0,8531 |
| Tokens vistos | 0 | 9.699.328 | 24.248.320 | 38.797.312 | 48.496.640 |

Notas sobre la medicion: la perplejidad de validacion se calcula sobre 2.697.984 tokens en cada evaluacion, con un tiempo de evaluacion estable de aproximadamente 32 segundos. El BLEU se calcula sobre 414 items. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 134 MB solo para pesos, mas activaciones y cache de atencion para secuencias de 256 tokens.
- VRAM estimada en fp16/bf16: aproximadamente 67 MB para pesos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 34 MB; en 4 bits, aproximadamente 17 MB. Estas cifras son estimaciones por tamano de parametros, no valores medidos por el autor.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU o en GPUs integradas para inferencia de una sola secuencia.
- GPUs de centro de datos (A100, H100) no son necesarias; se usarian solo para replicar barridos de hiperparametros en paralelo.
- Opciones de despliegue: no hay pipeline declarado en HuggingFace y la carga oficial es mediante `src.part1.hub.load_exported_model(<folder>)`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al no existir pesos GGUF publicados, llama.cpp y Ollama requeririan conversion previa.
- Latencia y throughput: no disponibles. El unico dato temporal es el entrenamiento completo (1.184 s) y la evaluacion de validacion (unos 32 s por punto sobre 2,7 M tokens).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de benchmarks frente a alternativas y la busqueda web no devolvio ninguna fuente tecnica utilizable sobre este modelo ni sobre modelos comparables de su misma categoria. Cualquier tabla comparativa con modelos de ~33 M de parametros exigiria datos de evaluacion homogeneos que no se han publicado aqui.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. El corpus `browndw/human-ai-parallel-corpus` puede introducir sesgos propios de sus fuentes, no analizados en la model card.
- Riesgo de alucinacion: alto en terminos relativos, dado el tamano (33,5 M) y el regimen de entrenamiento de una sola pasada sobre 48,5 M de tokens. No hay ajuste por instrucciones ni verificacion factual.
- Contexto muy limitado: 256 tokens. No apto para conversaciones multi-turno, documentos largos ni agentes.
- Idioma: no se especifica la cobertura linguistica; el rendimiento fuera de la lengua dominante del corpus es desconocido.
- Licencia: no declarada. Sin licencia explicita no se concede permiso de uso comercial; hay que asumir copyright por defecto y contactar con el autor antes de cualquier uso en produccion.
- Calidad de generacion: no se ha publicado ninguna evaluacion cualitativa, humana o de seguridad. El BLEU de 0,8531 debe interpretarse con cautela porque la metrica fluctua de forma no monotona a lo largo del entrenamiento y se calcula sobre solo 414 items.
- Sin mantenimiento: el repositorio se creo y actualizo el 3 de octubre de 2026, con 0 descargas y 0 likes. No hay senales de soporte, versionado ni actualizaciones.
- Dependencia de codigo externo: la carga del modelo requiere el repositorio de la practica (`src.part1.hub`), que no esta enlazado en la model card; sin ese codigo la integracion no es directa.
- Reproducibilidad parcial: la model card no documenta la topologia completa (capas, cabezas, dimension), solo los hiperparametros del optimizador y la configuracion de datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dnebh/anlp-a2-part2-muon
- Registro del entrenamiento en Weights & Biases: https://wandb.ai/dnebhrajani-v/anlp-a2-part2/runs/c902tabf
- Dataset de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- Repositorio de codigo de la practica (`src.part1.hub.load_exported_model`): no disponible (no enlazado en la model card)
- Paper o publicacion tecnica: no disponible
- Demo o espacio interactivo: no disponible
