# Oscilla/Spark-X2.6-1.7B-4bit-mlx

## Resumen

Spark-X2.6-1.7B-4bit-mlx es una version cuantizada en 4 bits del modelo Spark X2.6 (1.7B) publicado originalmente por XHToken, convertida por el usuario Oscilla para su uso con el framework MLX de Apple. El checkpoint conserva el tokenizador y la plantilla de chat del autor original, y esta pensado para ejecutarse en silicio de Apple mediante el runtime MLX (validado con MLX-Swift).

El modelo resuelve el problema de desplegar un LLM de generacion de texto conversacional de ~1.700 millones de parametros en equipos con memoria unificada limitada, reduciendo el peso del repositorio a 1,0 GB gracias a la cuantizacion INT4 afin de grupo 64. Es relevante para desarrolladores que trabajan en el ecosistema Apple y necesitan inferencia local sin depender de CUDA ni de servicios en la nube.

La informacion publicada por el autor de la conversion es escasa: se limita a los detalles del proceso de cuantizacion y a la validacion con MLX-Swift. No se han publicado datos sobre arquitectura interna, composicion del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (tag `spark2_5`; detalles internos no disponibles) |
| Parametros totales | 1.707.657.216 (1,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 afin de grupo 64 (group-size 64); vectores de normalizacion y escalas/offsets en punto flotante |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX), libreria `mlx` |

## Arquitectura y entrenamiento

El checkpoint deriva de los pesos BF16 originales de XHToken/Spark-X2.6-1.7B. La conversion, realizada con MLX 0.32.4, transforma las 169 matrices de pesos a INT4 afin de grupo 64, incluyendo el embedding de tokens atado (*tied token embedding*) y las compuertas de atencion (*attention gates*). Los vectores de normalizacion y las escalas y offsets de cuantizacion se mantienen en punto flotante para preservar precision.

No se dispone de informacion sobre la arquitectura interna del modelo base (tipo de atencion, numero de capas, dimension oculta), el volumen o composicion de los datos de entrenamiento, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El unico dato tecnico adicional es que el checkpoint requiere un runtime MLX con soporte para la arquitectura `spark2_5` y que admite razonamiento opcional a traves de la plantilla de chat del publicador.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento opcional mediante la plantilla de chat del publicador (modo de pensamiento activable).
- Soporte de los idiomas ingles y chino.
- Inferencia nativa en Apple silicon mediante MLX y MLX-Swift.
- No se ha documentado soporte de tool calling, function calling, capacidades de agente, vision, audio ni otras modalidades.
- No se ha documentado soporte de codigo o matematicas de forma especifica.

## Casos de uso

- Asistente conversacional local en macOS: el modelo puede ejecutarse integramente en un Mac con Apple silicon gracias al runtime MLX, sin conexion a red, adecuado para prototipos de chatbots de escritorio.
- Aplicaciones iOS y macOS con MLX-Swift: al estar validado con el runtime nativo MLX-Swift, puede integrarse en apps de Apple que requieran generacion de texto on-device con un peso de 1,0 GB.
- Procesamiento de texto bilingue ingles-chino: util para tareas de traduccion asistida o resumen en entornos donde solo se manejan esos dos idiomas.
- Generacion de texto con razonamiento explicito: la plantilla de chat permite activar un modo de razonamiento para tareas que requieran pasos intermedios, aunque sin datos publicados de calidad.
- Experimentacion e investigacion: checkpoint ligero para estudiar el efecto de la cuantizacion INT4 grupo 64 sobre un modelo de 1,7B en comparacion con los pesos BF16 originales.
- Despliegue en entornos con memoria unificada limitada: el tamano de 1,0 GB permite cargar el modelo en equipos donde un checkpoint BF16 de 1,7B no cabria con holgura.
- Filtrado y clasificacion de texto simple en pipelines locales de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 1,0 GB para los pesos en INT4, mas overhead de runtime y cache KV (no cuantificado en la informacion disponible).
- GPU recomendadas: no aplica GPU discreta; el modelo esta disenado para Apple silicon (memoria unificada) mediante MLX.
- Compatibilidad con GPU consumer: no se documenta soporte CUDA; el checkpoint es especifico de MLX.
- Opciones de despliegue: runtime MLX (version 0.32.4 o superior con soporte `spark2_5`) y MLX-Swift. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-4bit-mlx (este) | 1,7B | no disponible | INT4 grupo 64 | Apache 2.0 | MLX |
| XHToken/Spark-X2.6-1.7B (base) | 1,7B | no disponible | BF16 | Apache 2.0 | no disponible |
| Alternativas de ~1,7B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en el ecosistema MLX para establecer una comparacion con datos verificables.

## Limitaciones y advertencias

- La cuantizacion INT4 puede degradar la calidad respecto a los pesos BF16 originales; no se han publicado evaluaciones que cuantifiquen esa perdida.
- Solo soporta ingles y chino; no hay soporte documentado de castellano.
- Riesgo de alucinacion inherente a un modelo de 1,7B, sin datos de evaluacion publicados.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento ni procesos de alineacion.
- Requiere un runtime MLX con soporte especifico para la arquitectura `spark2_5`; versiones anteriores de MLX pueden no cargar el checkpoint.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-18): no hay evidencia de uso en produccion ni validacion independiente.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la conversion no ofrece garantias sobre el comportamiento del checkpoint cuantizado.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Oscilla/Spark-X2.6-1.7B-4bit-mlx
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Pesos BF16 originales (revision referenciada): https://huggingface.co/XHToken/Spark-X2.6-1.7B/tree/0e60633b345b19ba9f56ed1fda197acd271e8546
- Framework MLX: https://github.com/ml-explore/mlx
- MLX-Swift: https://github.com/ml-explore/mlx-swift
