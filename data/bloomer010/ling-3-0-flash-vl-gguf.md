# bloomer010/Ling-3.0-flash-VL-GGUF

## Resumen

Ling-3.0-flash-VL es un modelo multimodal de tipo imagen-texto-a-texto desarrollado por inclusionAI, construido sobre el modelo de lenguaje Ling-3.0-flash. Su propuesta central es integrar informacion visual en todo el ciclo de comprension, razonamiento, actuacion y verificacion, de modo que el modelo no solo describa imagenes o videos, sino que resuelva tareas del mundo real a partir de ellos. Emplea una arquitectura de mezcla de expertos (MoE) con 124.414.211.552 parametros totales y solo 5.5B parametros activos por token, lo que le permite ofrecer capacidades multimodales y agenticas con un coste de computo por token relativamente bajo.

La ficha corresponde a la conversion GGUF publicada por bloomer010, que empaqueta los pesos en formato cuantizado para su uso con llama.cpp y anade el fichero `mmproj-model-f16.gguf` necesario para procesar imagenes y video. El modelo declara una ventana de contexto nativa de 131.072 tokens, ampliable hasta 256K mediante YaRN con factor 2, y soporta entradas de imagen y video a traves del mismo endpoint de chat compatible con la API de OpenAI.

Su relevancia actual radica en la combinacion de tres factores: un MoE de 124B con solo 5.5B activos, soporte multimodal real (imagen y video) y una licencia MIT que permite uso comercial sin restricciones. La publicacion de conversiones GGUF en llama.cpp estable (build b11190 o superior) facilita el despliegue en infraestructura propia, incluyendo configuraciones hibridas con expertos en CPU y el resto en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), tag `bailingmoe3`; incluye MLA y convoluciones KDA |
| Parametros totales | 124.414.211.552 (124B) |
| Parametros activos | 5.5B por token |
| Longitud de contexto | 131.072 tokens nativos; 256K mediante YaRN (factor 2.0, contexto original 131072) |
| Tipos de cuantizacion | BF16, UD-Q8_K_XL, Q8_0, UD-Q6_K_XXL, UD-Q6_K_XL, Q6_K, UD-Q5_K_XL, Q5_K_M, UD-Q4_K_XL, Q4_K_M, Q4_K_S, UD-Q3_K_XL, Q3_K_M, UD-Q2_K_XL, IQ2_M, IQ2_XS |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors BF16 |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos identificado con la etiqueta `bailingmoe3`. La arquitectura incorpora atencion con latencia multi-cabeza (MLA), con el tensor `kv_b_proj` dividido en tensores K y V separados y el tensor K transpuesto durante la conversion, ademas de convoluciones KDA con pesos reformados para llama.cpp y un parametro `A_log` almacenado como `exp(A_log)`. La publicacion GGUF no incluye bloque MTP/NextN, ya que la version VL no lo distribuye, por lo que la decodificacion especulativa mediante `--spec-type draft-mtp` no esta disponible para este modelo; en su lugar se puede usar el draft DSpark del modelo de texto.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo soporta un modo de razonamiento (thinking mode) activado por defecto, desactivable por peticion mediante `chat_template_kwargs.enable_thinking = false`, con parametros de muestreo recomendados de temperatura 0.6, top_p 0.95 y top_k 20. La ventana de 256K se obtiene replicando la receta del modelo original (YaRN, factor 2.0, contexto original 131072); la calidad en 256K no fue validada por el autor de la conversion.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto largo (hasta 131K nativos, 256K con YaRN).
- Comprension de imagenes: descripcion, analisis y respuesta a preguntas sobre contenido visual.
- Comprension de video: muestreo de fotogramas codificados por la misma torre de vision, enviados como partes `video_url` en la API de chat.
- Razonamiento multimodal: integracion de informacion visual en el proceso de razonamiento, actuacion y verificacion.
- Modo de razonamiento (thinking mode) activado por defecto, desactivable por peticion.
- Capacidades agenticas y de resolucion de tareas del mundo real a partir de vision, segun la model card del modelo base.
- Compatibilidad con endpoints de la API de OpenAI (`endpoints_compatible`).
- Soporte de plantillas Jinja (`--jinja`) para el chat template.
- Decodificacion especulativa mediante draft DSpark (cabezas del modelo de texto, compatibles por vocabulario compartido).

## Casos de uso

- Analisis documental con imagenes: digitalizacion y extraccion de informacion de facturas, formularios o capturas, enviando la imagen como `image_url` en base64 y aprovechando el modo thinking para razonar sobre campos ambiguos.
- Moderacion de contenido visual: clasificacion y descripcion de imagenes en pipelines de revision, con contexto largo para procesar lotes dentro de una misma sesion conversacional.
- Asistencia en accesibilidad: generacion de descripciones detalladas de imagenes y resumenes de video para usuarios con discapacidad visual, usando el endpoint compatible con OpenAI.
- Agentes autonomos sobre entornos visuales: el modelo puede observar capturas de pantalla o fotogramas y razonar pasos siguientes, apoyandose en sus capacidades agenticas y en el modo thinking para tareas de varios pasos.
- Analisis de video para vigilancia o monitorizacion: muestreo de fotogramas y consultas en lenguaje natural sobre eventos, con contexto de 131K tokens para mantener el hilo de una sesion larga.
- Despliegue en infraestructura propia con llama.cpp: servir el modelo con `llama-server` en configuracion hibrida (expertos en CPU, resto en GPU) para equipos con menos VRAM que el tamano del fichero, manteniendo capacidades de vision.
- Aceleracion de inferencia en produccion: combinar el target Q6_K con el draft DSpark Q4_K_M y `--spec-type draft-dspark --spec-draft-n-max 8` para aumentar el throughput de decodificacion en escenarios de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). Los unicos datos de rendimiento medidos corresponden a la velocidad de decodificacion con llama-server:

| Configuracion | Velocidad de decodificacion |
|---|---|
| VL Q6_K (objetivo), 32K contexto, 24 peticiones | 26.8 tok/s |
| VL Q6_K + DSpark Q4_K_M, `--spec-draft-n-max 8` | 43.6 tok/s (1.63x) |
| Stack completo (7 GPU mixtas, encoder de vision, KV q4_0, 48K contexto), sin draft | 38.1 tok/s |
| Stack completo con draft DSpark | 24.1 tok/s |

Tasa de aceptacion del draft sobre VL Q6_K: 0.32 con draft Q4_K_M y 0.30 con draft Q2_K; el mismo draft Q4_K_M mide 0.26 contra el Ling-3.0-flash de solo texto.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: BF16 249 GB; UD-Q8_K_XL 172.5 GB; Q8_0 132 GB; UD-Q6_K_XXL 112.8 GB; UD-Q6_K_XL 103 GB; Q6_K 102 GB; UD-Q5_K_XL 92.3 GB; Q5_K_M 88.3 GB; UD-Q4_K_XL 81.9 GB; Q4_K_M 75.3 GB; Q4_K_S 70.7 GB; UD-Q3_K_XL 60.6 GB; Q3_K_M 59.3 GB; UD-Q2_K_XL 41.9 GB; IQ2_M 40.6 GB; IQ2_XS 36.5 GB. El fichero `mmproj-model-f16.gguf` anade 0.87 GB y es obligatorio para imagen y video.
- Memoria recomendada por el autor: 256 GB+ para BF16, 178 GB+ para UD-Q8_K_XL, 136 GB+ para Q8_0, 116 GB+ para UD-Q6_K_XXL, 104 GB+ para Q6_K, 94 GB+ para UD-Q5_K_XL, 84 GB+ para UD-Q4_K_XL, 76 GB+ para Q4_K_M, 72 GB+ para Q4_K_S, 62 GB+ para UD-Q3_K_XL, 60 GB+ para Q3_K_M, 44 GB+ para UD-Q2_K_XL, 42 GB+ para IQ2_M y 38 GB+ para IQ2_XS. Hay que dejar margen porque pesos y contexto comparten memoria.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. El autor documenta un stack de servicio con 7 GPU mixtas.
- GPU de consumo: no cabe en GPU de consumo individual; la opcion practica es la configuracion hibrida con expertos en CPU (`-ot "ffn_.*_exps\.weight=CPU"`) y el resto en GPU, o el uso de `-ncmoe N` para ajustar la colocacion de expertos.
- Opciones de despliegue: llama.cpp con `llama-server` (build b11190 o superior), con `--mmproj` para vision, `--jinja`, `--flash-attn auto` y `-ngl auto`. Compatible con endpoints de la API de OpenAI.
- Latencia y throughput: 26.8 tok/s con Q6_K en banco de pruebas aislado (32K contexto, 24 peticiones); 43.6 tok/s con draft DSpark Q4_K_M; en stack completo, 38.1 tok/s sin draft y 24.1 tok/s con draft. Cuantizar el KV cache del draft con `-ctkd q4_0 -ctvd q4_0` reduce la velocidad de decodificacion aproximadamente un 40% adicional.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La calidad en contexto de 256K no fue validada por el autor de la conversion; las flags de YaRN replican la recomendacion del modelo original.
- El modelo GGUF no incluye bloque MTP/NextN: la decodificacion especulativa con `--spec-type draft-mtp` no esta disponible para la variante VL.
- El draft DSpark no usa flash attention y su buffer de computo crece linealmente con la longitud de contexto; ademas mantiene su propio KV cache, que conviene dejar en f16 (cuantizarlo reduce la velocidad de decodificacion un 40% adicional).
- En stack completo de servicio, el draft DSpark puede degradar el rendimiento (24.1 tok/s frente a 38.1 tok/s sin draft), por lo que hay que medir en el entorno real antes de adoptarlo.
- El fichero `mmproj-model-f16.gguf` es obligatorio para imagen y video; sin el solo funciona el chat de texto.
- No hay informacion sobre idiomas soportados ni sobre sesgos conocidos del modelo.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el modo thinking activado por defecto puede incrementar la latencia si no se desactiva por peticion.
- La licencia MIT del repositorio GGUF permite uso comercial, pero conviene verificar la licencia del modelo base `inclusionAI/Ling-3.0-flash-VL` antes de un despliegue en produccion.
- El repositorio ocupa 3283 GB, lo que exige planificacion de almacenamiento si se descargan varias cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bloomer010/Ling-3.0-flash-VL-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash-VL
- llama.cpp (requerido, build b11190 o superior): no disponible en la informacion proporcionada
- Paper, blog o demo oficiales: no disponible en la informacion proporcionada
