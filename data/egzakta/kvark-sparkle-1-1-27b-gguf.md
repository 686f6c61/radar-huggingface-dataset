# Egzakta/Kvark-Sparkle-1.1-27B-GGUF

## Resumen

KVARK Sparkle 1.1 27B GGUF es la distribucion cuantizada en formato GGUF del modelo KVARK Sparkle 1.0 27B, desarrollado por Egzakta. El modelo base cuenta con 27.320.697.856 parametros (aproximadamente 27,3 mil millones) y esta disenado para razonamiento con modo de pensamiento explicito, generacion de texto y comprension de imagenes (pipeline image-text-to-text). Esta version GGUF esta pensada para su ejecucion en llama.cpp, Ollama y LM Studio, e incluye la cabeza MTP (multi-token prediction) que habilita decodificacion especulativa.

La relevancia de esta publicacion radica en su eficiencia en tokens de razonamiento: segun los datos de la model card, el modelo emplea aproximadamente la mitad de tokens de razonamiento que Qwen3.8-27B en tareas como GPQA Diamond (3.122 frente a 7.854) o AIME (5.502 frente a 14.318), manteniendo una precision comparable (89,3 frente a 89,4 en la primera y 93,3 frente a 94,0 en la segunda). Esto se traduce en un tiempo medio de respuesta de 13,7 segundos frente a 28,1 segundos del comparador.

Los archivos GGUF utilizan una matriz de importancia (imatrix) calculada sobre los datos de SFT propios del autor, lo que mejora la calidad de las cuantizaciones de baja precision. La licencia Apache 2.0 permite uso comercial sin limite de ingresos. La unica lengua declarada oficialmente es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal (linear-attention state) y cabeza MTP para decodificacion especulativa; no se detalla la configuracion completa |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 262.144 tokens (segun tabla de memoria KV cache) |
| Tipos de cuantizacion | Q8_0 (8,5 bits), Q6_K (6,56 bits), Q5_K_M (5,5 bits), Q4_K_M (4,5 bits), IQ4_XS (4,25 bits); proyector de vision F16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 (uso comercial permitido, sin limite de ingresos) |
| Formato de pesos | GGUF (llama.cpp); pesos BF16 en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna completa del modelo base. La model card de la version GGUF menciona un "linear-attention state" con un consumo inferior a 0,2 GB independientemente de la longitud de contexto, lo que sugiere un componente de atencion lineal combinado con atencion tradicional. El modelo incorpora una cabeza MTP (multi-token prediction) que se conserva en todos los archivos GGUF y que permite decodificacion especulativa mediante `--spec-type draft-mtp` en llama.cpp.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card indica que la imatrix se calculo sobre los datos de SFT propios del autor, lo que confirma la existencia de una fase de supervised fine-tuning, pero sin mas detalles. Los detalles de entrenamiento, datos y pesos BF16 se remiten a la model card del modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con modo de pensamiento explicito (thinking), con la posibilidad de desactivarlo mediante `--reasoning off`.
- Razonamiento matematico y cientifico (evaluado en AIME, GPQA Diamond y MMLU-Pro).
- Generacion de codigo y resolucion de problemas de programacion (evaluado en LiveCodeBench).
- Seguimiento de instrucciones (evaluado en IFEval).
- Comprension de imagenes (image-text-to-text) mediante el proyector de vision `mmproj` en F16.
- Decodificacion especulativa mediante cabeza MTP integrada.
- Servidor compatible con la API de chat de OpenAI, con el razonamiento devuelto en el campo `reasoning_content`.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Razonamiento cientifico asistido: el modelo puede resolver problemas de nivel GPQA Diamond con un consumo de tokens de razonamiento aproximadamente la mitad que modelos comparables, lo que reduce coste y latencia en pipelines de investigacion que requieren muchas consultas.
- Generacion de codigo en produccion: con soporte de contexto largo (hasta 262.144 tokens) y modo de razonamiento, resulta adecuado para tareas de refactorizacion sobre repositorios extensos o revision de parches en integracion continua.
- Analisis de documentos tecnicos con imagenes: gracias al proyector de vision, puede procesar diagramas, capturas de pantalla o figuras junto con texto explicativo en tareas de documentacion tecnica.
- Asistente de matematicas y estadistica: util para resolver problemas de AIME o calculo simbolico donde el razonamiento paso a paso es necesario y la latencia importa.
- Despliegue local en estaciones de trabajo: con cuantizacion Q4_K_M (16,8 GB) cabe en GPUs de 24 GB, lo que permite ejecutar un modelo de 27B con razonamiento y vision en hardware de consumo profesional.
- Atencion al cliente tecnica: conversaciones multi-turno con contexto largo y capacidad de razonamiento para diagnosticar problemas complejos, con la opcion de desactivar el modo de pensamiento para respuestas rapidas.
- Evaluacion automatizada de instrucciones: el modelo puede actuar como juez o generador en pipelines de evaluacion de calidad de respuestas, aprovechando su bajo consumo de tokens en IFEval (470 frente a 714 del comparador).

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card y comparan KVARK Sparkle 1.0 con Qwen3.8-27B. Se presentan como pares de valores (Sparkle frente a Qwen).

| Benchmark | Precision Sparkle | Precision Qwen3.8-27B | Tokens de razonamiento Sparkle | Tokens de razonamiento Qwen3.8-27B |
|---|---|---|---|---|
| GPQA Diamond | 89,3 | 89,4 | 3.122 | 7.854 |
| AIME | 93,3 | 94,0 | 5.502 | 14.318 |
| LiveCodeBench | 82,7 | 77,3 | 6.664 | 19.950 |
| IFEval | 91,3 | 92,4 | 470 | 714 |
| MMLU-Pro | 83,3 | 84,0 | 429 | 727 |

Tiempo medio de respuesta: 13,7 s (Sparkle) frente a 28,1 s (Qwen3.8-27B).

No se han publicado en la informacion disponible resultados de benchmarks para la version 1.1 ni para las cuantizaciones GGUF especificas.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (pesos): Q8_0 29,0 GB; Q6_K 22,4 GB; Q5_K_M 19,5 GB; Q4_K_M 16,8 GB; IQ4_XS 15,3 GB. Anadir 0,9 GB si se carga el proyector de vision F16.
- Memoria de cache KV: 2 GiB (f16) o 1,1 GiB (q8_0) para 32.768 tokens; 4 GiB o 2,1 GiB para 65.536; 8 GiB o 4,3 GiB para 131.072; 16 GiB o 8,5 GiB para 262.144. El estado de atencion lineal ocupa menos de 0,2 GB sea cual sea el contexto.
- GPU recomendadas: el autor indica Q4_K_M como cuantizacion recomendada para tarjetas de 24 GB (por ejemplo, RTX 4090). Para contexto completo de 262.144 tokens se requiere hardware de mayor capacidad (A100 80 GB, H100 o configuraciones multi-GPU).
- Cabe en GPU de consumo: si, con Q4_K_M o IQ4_XS en GPUs de 24 GB; con contexto reducido y cache KV en q8_0.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (`ollama run hf.co/Egzakta/Kvark-Sparkle-1.0-27B-GGUF:Q4_K_M`) y LM Studio. El servidor expone la API de chat de OpenAI en el puerto 8080.
- Parametros de muestreo recomendados: temperatura 1.0, top_p 0.95, top_k 20.
- Latencia y throughput: no se proporcionan cifras de throughput; el tiempo medio de respuesta reportado es de 13,7 s frente a 28,1 s del comparador en el conjunto evaluado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| KVARK Sparkle 1.1 27B GGUF | 27,3 B | hasta 262.144 | Apache 2.0 | GGUF en Hugging Face | Vision, razonamiento, MTP |
| Qwen3.8-27B (comparador de la model card) | no disponible | no disponible | no disponible | no disponible | Precision ligeramente superior en GPQA, AIME, IFEval y MMLU-Pro; menor en LiveCodeBench; mayor consumo de tokens |
| Otros modelos de ~27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la informacion proporcionada |

La model card solo ofrece comparacion directa con Qwen3.8-27B. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en modo de razonamiento con cadenas largas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- El modelo 1.1 GGUF deriva del 1.0; no se detallan los cambios entre versiones ni se aportan benchmarks propios de la 1.1.
- El uso de contexto completo (262.144 tokens) exige cache KV de hasta 16 GiB en f16, lo que limita su viabilidad en GPUs de consumo.
- La decodificacion especulativa requiere conservar la cabeza MTP y usar flags especificos de llama.cpp; otros runners pueden no aprovecharla.
- Aunque la licencia Apache 2.0 permite uso comercial sin limite de ingresos, conviene verificar las condiciones del modelo base y de los datos de entrenamiento en la model card principal.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/Egzakta/Kvark-Sparkle-1.1-27B-GGUF
- Modelo base: https://huggingface.co/Egzakta/Kvark-Sparkle-1.0-27B
- Repositorio llama.cpp (referenciado por la libreria): no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
