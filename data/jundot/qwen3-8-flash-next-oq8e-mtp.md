# Jundot/Qwen3.8-Flash-Next-oQ8e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ8e-mtp es una cuantizacion de precision mixta en formato MLX del modelo Qwen/Qwen3.8-Flash-Next, desarrollada por el usuario Jundot mediante la herramienta oQ (oMLX v0.8.0). El modelo base es una vista previa experimental de la arquitectura que precedera a Qwen4: un modelo de lenguaje y vision de tipo mixture-of-experts (MoE) con 125.000 millones de parametros en el backbone y 6.000 millones activados por token, complementado con un embedding de n-gramas de 51.200 millones de parametros y un modulo de prediccion multi-token (MTP) de 4.000 millones. El checkpoint completo suma 180.000 millones de parametros logicos y ocupa 194,9 GB en disco.

La relevancia de esta publicacion es doble. Por un lado, expone una arquitectura novedosa que combina Gated DeltaNet con Qwen Sparse Attention (QSA) y flujos residuales con compuerta (Gated Residual streams), lo que la convierte en un banco de pruebas para tecnicas de atencion eficiente y decodificacion especulativa. Por otro, demuestra una cuantizacion de 8 bits con asignacion de bits por sensibilidad de capa, manteniendo una media efectiva de 8,660 bits por peso en el checkpoint completo, lo que permite ejecutar un modelo de 180.000 millones de parametros en hardware Apple Silicon con memoria unificada suficiente.

El modelo esta pensado para inferencia local en entornos MLX, con capacidades de imagen-texto a texto, conversacion y tool calling. Su licencia es la Qwen Community License 1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) vision-language con Gated DeltaNet, Qwen Sparse Attention (QSA) y Gated Residual streams; incluye backbone de lenguaje, embedding de n-gramas, encoder de vision y cabeza MTP |
| Parametros totales | 179.999.981.459 (180.000 millones logicos) |
| Parametros activos | 6.000 millones (backbone MoE); 125.000 millones en el backbone de lenguaje |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ8e (precision mixta 8 bits): affine 8-bit grupo 128, affine 8-bit grupo 64, BF16 para capas sensibles, n-gram affine 8-bit grupo 32; media efectiva 8,660 bits/peso en el checkpoint completo y 8,499 bits/peso en el backbone |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license: other, license_name: qwen-community-1.0) |
| Formato de pesos | MLX safetensors (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es una vista previa experimental de la arquitectura de Qwen4. Se trata de un MoE vision-language con 125.000 millones de parametros en el backbone de lenguaje y 6.000 millones activados por token, al que se anaden tres componentes adicionales: un embedding de n-gramas de 51.200 millones de parametros (28,4% del total de pesos logicos), un encoder de vision de 449 millones y una cabeza de prediccion multi-token (MTP) de 2.607 millones. La innovacion arquitectonica principal es la combinacion de Gated DeltaNet (una variante de atencion lineal con estado recurrente) con Qwen Sparse Attention (QSA) y flujos residuales con compuerta, orientada a reducir el coste computacional de la atencion en contextos largos.

La cuantizacion oQ8e, aplicada por Jundot con oMLX v0.8.0, asigna bits por sensibilidad de capa medida, redondea cada grupo con una matriz de importancia (1024 muestras x 512 tokens) y reajusta escala y sesgo mediante minimos cuadrados ponderados. El resultado se distribuye en cuatro formatos de almacenamiento: affine 8-bit grupo 64 para el 69,9% de los pesos logicos (124,560 GiB), n-gram affine 8-bit grupo 32 para el 28,4% (53,644 GiB), affine 8-bit grupo 128 para el 1,3% (2,311 GiB) y BF16 para el 0,3% restante (0,961 GiB). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno en formato chat.
- Procesamiento de imagen y texto de entrada para generar texto (pipeline image-text-to-text), gracias al encoder de vision de 449 millones de parametros.
- Razonamiento y respuesta a instrucciones, heredado del backbone de lenguaje de 125.000 millones de parametros.
- Decodificacion especulativa mediante la cabeza MTP (multi-token prediction), que permite proponer varios tokens por paso.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible, aunque es habitual en la familia Qwen.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: no disponibles; el campo de idiomas no esta especificado.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint MLX de 181,5 GiB esta disenado para ejecutarse en equipos con memoria unificada amplia (por ejemplo, Mac Studio con 192 GB o superiores), lo que permite desplegar un modelo de 180.000 millones de parametros sin GPU dedicada.
- Asistentes multimodales de escritorio: al aceptar imagen y texto, puede integrarse en aplicaciones de analisis de documentos, capturas de pantalla o fotografias con conversacion posterior, siempre que el hardware local lo permita.
- Prototipado de arquitecturas Qwen4: investigadores pueden evaluar el comportamiento de Gated DeltaNet, QSA y Gated Residual streams en un checkpoint cuantizado antes de que existan versiones estables, sin necesidad de infraestructura de centro de datos.
- Experimentacion con decodificacion especulativa: la cabeza MTP incluida permite medir la ganancia de throughput de la prediccion multi-token en entornos MLX frente a decodificacion autoregresiva clasica.
- Evaluacion de tecnicas de cuantizacion: el reparto documentado de bits por capa y los bits efectivos por componente sirven como referencia para comparar oQ8e con otras estrategias (GPTQ, AWQ, GGUF K-quants) sobre el mismo modelo base.
- Desarrollo de pipelines de vision-lenguaje en local: analisis de imagenes con descripcion, extraccion de informacion o respuesta a preguntas visuales en entornos con requisitos de privacidad, al no requerir envio de datos a la nube.
- Investigacion sobre modelos MoE de gran escala: permite estudiar el comportamiento de un MoE con 6.000 millones de parametros activos y 125.000 millones totales en un unico equipo, algo inviable con el checkpoint BF16 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el checkpoint completo ocupa 181,476 GiB (194,858 GB) en disco; la inferencia requiere al menos esa cantidad de memoria unificada o VRAM, mas overhead de activaciones y cache KV.
- GPU recomendadas: no aplica en el sentido tradicional; el formato MLX esta orientado a Apple Silicon (series M1/M2/M3/M4, incluidos los chips Pro, Max y Ultra). No se ha validado su uso en GPU NVIDIA o AMD segun la informacion disponible.
- Cabe en GPU de consumo: no en tarjetas consumer convencionales (RTX 4090 con 24 GB, RTX 5090 con 32 GB). Requiere equipos Apple con memoria unificada de 192 GB o superior (por ejemplo, Mac Studio M2 Ultra o M3 Ultra con 192 GB o 512 GB).
- Opciones de despliegue: libreria MLX (mlx-lm y el ecosistema oMLX). No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ8e-mtp (este) | 180.000 M logicos (6.000 M activos en backbone) | no disponible | MLX safetensors 8-bit mixto | Qwen Community 1.0 | Hugging Face, 1.116 descargas |
| Qwen/Qwen3.8-Flash-Next (base) | 180.000 M logicos (6.000 M activos) | no disponible | safetensors BF16 | Qwen Community 1.0 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria, tamano o tarea en los datos proporcionados.

## Limitaciones y advertencias

- Modelo experimental: el autor del modelo base lo describe como una vista previa experimental de la arquitectura de Qwen4, por lo que su comportamiento puede no ser estable ni representativo de una version final.
- Licencia Qwen Community 1.0: no es una licencia de codigo abierto permisiva; conviene revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que puede incluir restricciones de uso, atribucion o redistribucion.
- Formato exclusivo MLX: el checkpoint solo es utilizable con la libreria MLX en hardware Apple Silicon; no es portable a otros runtimes sin conversion adicional.
- Requisito de memoria muy elevado: 181,5 GiB de almacenamiento y memoria unificada limitan su ejecucion a equipos de gama muy alta (Mac Studio con 192 GB o mas); no cabe en GPU de consumo.
- Idiomas no especificados: el campo de idiomas no esta disponible, por lo que no se puede garantizar un rendimiento multilingue equilibrado.
- Sin benchmarks publicados: no hay datos verificables de MMLU, HumanEval, GSM8K ni otras evaluaciones, lo que impide comparar su calidad con alternativas de forma objetiva.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible; al ser un modelo conversacional y multimodal, es esperable el riesgo habitual de alucinacion, pero no se aportan datos concretos.
- Contexto maximo no documentado: se desconoce la longitud de contexto soportada, lo que dificulta planificar casos de uso con ventanas largas.
- Cuantizacion de 8 bits: aunque la media efectiva es 8,660 bits/peso, existe una perdida de precision respecto al checkpoint BF16 original que puede afectar a tareas sensibles; el autor ha re-cuantizado el modelo en noviembre de 2026 para reducir el error, por lo que conviene descargar la version actualizada.
- Dependencia de la herramienta oMLX: la reproducibilidad de la cuantizacion depende de la version 0.8.0 de oMLX y de los PR #4930 y #5292 del repositorio jundot/omlx.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ8e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de la herramienta de cuantizacion oQ/oMLX: https://github.com/jundot/omlx
- PR de mejora de oQe: https://github.com/jundot/omlx/pull/4930
- PR de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
