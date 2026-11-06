# mradermacher/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-i1-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-i1-GGUF es una cuantizacion GGUF, generada con imatrix (importancia ponderada), del modelo xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic. El autor de la cuantizacion es mradermacher, un conocido publicador de versiones GGUF de modelos open source. El modelo subyacente combina, segun sus etiquetas, una destilacion de razonamiento de la familia DeepSeek con una base Qwen3.5 de 4B parametros, sometida a un proceso de "abliteracion"/"decensoring" (eliminacion de rechazos de seguridad) y a un ajuste fino supervisado (SFT) orientado a matematicas y STEM.

El modelo cuenta con 4.205.751.296 parametros totales (segun los pesos safetensors reportados) y se distribuye en un repositorio de 53,4 GB que contiene multiples variantes de cuantizacion, desde IQ1_S (1,5 GB) hasta Q6_K y superiores. La licencia declarada es Apache 2.0 y los idiomas soportados son ingles, chino, coreano, japones, espanol y ruso. La model card indica que se trata de un modelo de vision, con archivos mmproj disponibles en el repositorio estatico asociado.

La relevancia de esta ficha radica en que permite ejecutar en hardware de consumo un modelo de 4B con capacidades declaradas de razonamiento, matematicas y vision, aunque con las advertencias importantes derivadas de su naturaleza "uncensored" y de la falta de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun etiquetas); detalles no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ4_XS, entre otras (i1/imatrix) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio, que apuntan a la familia Qwen3.5 (`qwen3_5`) y a un proceso de destilacion de razonamiento desde DeepSeek (`distillation`, `deepseek`, `reasoning`). El modelo base declara haber pasado por SFT (`sft`) y estar orientado a matematicas y STEM (`math`, `stem`), ademas de incluir la etiqueta `mtp` (multi-token prediction), lo que sugiere soporte de prediccion multi-token en el entrenamiento o en la inferencia. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

El rasgo tecnico mas destacable es el proceso de "heretic"/"abliterated"/"uncensored", que elimina o reduce los mecanismos de rechazo del modelo original, junto con la cuantizacion imatrix realizada por mradermacher, que emplea una matriz de importancia para optimizar la calidad de las cuantizaciones de baja precision. La model card indica ademas que es un modelo de vision, con archivos mmproj en el repositorio estatico, aunque no se detalla la arquitectura del encoder visual.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento explicito (etiqueta `reasoning`), presumiblemente con modo de pensamiento.
- Matematicas y tareas STEM, segun las etiquetas `math` y `stem`.
- Capacidades de vision declaradas (modelo de vision con archivos mmproj).
- Prediccion multi-token (`mtp`).
- Multilingue: ingles, chino, coreano, japones, espanol y ruso.
- Comportamiento "uncensored"/"abliterated": menor tendencia a rechazar peticiones.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente, aunque la etiqueta `reasoning` lo sugiere.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con llama.cpp u Ollama en equipos de consumo gracias a sus cuantizaciones desde 1,5 GB, gestionando conversaciones multi-turno en seis idiomas.
- Resolucion de problemas matematicos y STEM: adecuado para tutoria o generacion de explicaciones paso a paso en entornos educativos, dado su entrenamiento declarado en `math` y `stem`.
- Procesamiento de documentos con imagenes: al ser un modelo de vision, puede emplearse para extraer y razonar sobre contenido de capturas, diagramas o figuras, usando los archivos mmproj del repositorio estatico.
- Generacion de contenido sin filtros en investigacion: util para estudiar el comportamiento de modelos abliterated en tareas de red teaming y evaluacion de sesgos, con las cautelas legales correspondientes.
- Despliegue en entornos con recursos limitados: las cuantizaciones IQ2/IQ3 permiten ejecutar el modelo en GPUs de 4-6 GB o incluso en CPU, lo que facilita prototipado rapido.
- Traduccion y asistencia multilingue: con soporte declarado de en, zh, ko, ja, es y ru, puede emplearse en pipelines de traduccion o atencion al cliente en esos idiomas.
- Fine-tuning posterior o experimentacion: al estar bajo Apache 2.0 y en formato GGUF, sirve como base para experimentos de cuantizacion o despliegue en produccion ligera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de cuantizacion):
  - IQ1_S / IQ1_M: ~1,5-2 GB.
  - IQ2_XXS a IQ2_M: ~1,6-2 GB.
  - Q2_K / IQ3_XXS: ~2 GB.
  - IQ3_S / IQ3_M / Q3_K_M: ~2,2-2,4 GB.
  - IQ4_XS / Q4_K_S / IQ4_NL: ~2,6-2,7 GB.
  - Q5_K_S / Q5_K_M: ~3 GB (estimado).
  - Q6_K: ~3,5 GB (estimado).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, RTX 4090) para cuantizaciones bajas; para Q5/Q6 se recomienda 6-8 GB (RTX 3060, RTX 4060 Ti). En A100/H100 cabe con holgura cualquier cuantizacion.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 4-8 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (segun etiquetas), y cualquier runtime compatible con GGUF. Para vision, usar los archivos mmproj del repositorio estatico.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-i1-GGUF) | 4,2B | no disponible | Apache 2.0 | GGUF | Vision, uncensored, multilingue |
| Qwen2.5-3B-Instruct (referencia de la familia Qwen) | 3,1B | 32K (tipico) | Apache 2.0 | safetensors, GGUF | Sin capacidades uncensored ni vision confirmada |
| Llama-3.2-3B-Instruct | 3,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Vision en variante 11B; 3B solo texto |
| Phi-3.5-mini-instruct | 3,8B | 128K | MIT | safetensors, GGUF | Enfocado a razonamiento y codigo |

Nota: los datos de los modelos comparativos son orientativos y no provienen de la informacion proporcionada; verificar en sus respectivas model cards. No se dispone de comparativas de rendimiento directas para este modelo.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": ha sido modificado para reducir rechazos de seguridad, por lo que puede generar contenido inapropiado, ofensivo o peligroso. No se recomienda su uso en produccion orientada al publico sin moderacion adicional.
- Riesgo elevado de alucinacion, agravado por el proceso de decensoring y por la falta de benchmarks que validen su calidad.
- No se dispone de informacion sobre la longitud de contexto real ni sobre el rendimiento en contextos largos.
- El soporte de tool calling y de agentes no esta confirmado en la informacion disponible.
- Aunque la licencia es Apache 2.0, el modelo base puede arrastrar obligaciones adicionales derivadas de sus componentes (destilacion de DeepSeek, base Qwen3.5); conviene revisar las licencias de los modelos originales antes de un uso comercial.
- El proceso de cuantizacion a IQ1/IQ2 degrada notablemente la calidad; las variantes bajas se etiquetan como "for the desperate" o "very low quality" por el propio autor.
- Sesgos conocidos: no documentados en la informacion disponible; es previsible que herede sesgos de sus datos de entrenamiento y del proceso de abliteration.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
