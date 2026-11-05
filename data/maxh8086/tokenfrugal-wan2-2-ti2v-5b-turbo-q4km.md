# maxh8086/tokenfrugal-wan2.2-ti2v-5b-turbo-q4km

## Resumen

`tokenfrugal-wan2.2-ti2v-5b-turbo-q4km` es una cuantizacion GGUF en formato Q4_K_M del modelo Wan2.2 TI2V-5B Turbo, un modelo de generacion de video texto-a-video e imagen-a-video desarrollado originalmente por Wan-AI (Alibaba). El repositorio lo publica el usuario maxh8086 como espejo privado para el proyecto tokenfrugal, con el objetivo de ofrecer una version de bajo peso (3,4 GB) que pueda desplegarse en entornos con recursos limitados.

El modelo base cuenta con aproximadamente 5.000 millones de parametros (4.999.787.712 segun los tensores safetensors del repositorio original), lo que lo situa en la gama media de los modelos de difusion para video. La variante "Turbo" del nombre indica una destilacion orientada a reducir el numero de pasos de inferencia necesarios, aunque no se especifica el numero exacto de pasos en la informacion disponible.

La relevancia de esta ficha es acotada: se trata de un artefacto de cuantizacion sin model card tecnica detallada, sin benchmarks publicados y sin validacion de calidad mas alla de la integridad de ficheros. Resulta util como referencia para quien necesite ejecutar Wan2.2 TI2V-5B en hardware modesto mediante llama.cpp u otro runtime compatible con GGUF, pero no debe considerarse una fuente autoritativa sobre las capacidades del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Wan2.2 TI2V-5B, difusion para video; detalles no especificados) |
| Parametros totales | 4.999.787.712 (aprox. 5B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 segun la base Wan-AI Wan2.2; el autor indica "verify the quant uploader license" |
| Formato de pesos | GGUF (fichero `Wan2_2-TI2V-5B-Turbo-Q4_K_M.gguf`, 3.437.927.136 bytes) |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura interna en la model card proporcionada. Por el nombre y el origen (Wan-AI Wan2.2 TI2V-5B), se trata de un modelo de generacion de video texto-a-video e imagen-a-video, presumiblemente basado en difusion, pero no se detalla el tipo de backbone (DiT, U-Net u otro), el esquema de atencion, ni la composicion del dataset de entrenamiento.

Tampoco se especifican el numero de tokens de entrenamiento, el uso de RLHF/DPO, ni innovaciones tecnicas concretas mas alla del sufijo "Turbo", que en la practica suele implicar destilacion para reducir pasos de muestreo. El autor de la cuantizacion declara explicitamente que no ha medido perplejidad ni ejecutado pruebas de renderizado: solo ha verificado la integridad de tensores y metadatos frente al fichero fuente `Wan2_2-TI2V-5B-Turbo-Q4_K_M.gguf`.

## Capacidades

- Generacion de video a partir de texto (texto-a-video), segun la denominacion TI2V del modelo base.
- Generacion de video a partir de imagen (imagen-a-video), segun la misma denominacion.
- Modo "Turbo" orientado a inferencia con menos pasos de muestreo (no se especifica cuantos).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Otras capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Prototipado de pipelines de generacion de video en local: el fichero GGUF de 3,4 GB permite probar el flujo texto-a-video en una estacion de trabajo sin descargar los pesos completos en precision alta, util para validar integraciones antes de escalar a GPUs mayores.
- Generacion de clips cortos para redes sociales: con un modelo de 5B y cuantizacion Q4_K_M se pueden producir borradores de video de baja resolucion que luego se refinan o se regeneran en el modelo completo.
- Pruebas de integracion en herramientas compatibles con GGUF: sirve para verificar que el runtime (llama.cpp u otro) carga correctamente tensores y metadatos del modelo Wan2.2 TI2V-5B antes de pasar a produccion.
- Educacion y experimentacion: investigadores con GPUs de consumo pueden estudiar el comportamiento de un modelo de difusion de video de 5B cuantizado sin infraestructura de datacenter.
- Evaluacion comparativa de cuantizaciones: al ser una variante Q4_K_M concreta, permite medir la degradacion de calidad frente a pesos en FP16 en tareas de generacion de video.
- Despliegue en entornos con VRAM limitada: el tamano reducido del fichero facilita la ejecucion en GPUs con 8-12 GB de VRAM, aunque no se han publicado mediciones de rendimiento ni de calidad para esta cuantizacion concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente: "Perplexity: not measured. Render or output test: not run. Checked only for file integrity."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un fichero GGUF Q4_K_M de 3,4 GB requiere al menos ~4-5 GB de VRAM para los pesos, mas memoria adicional para activaciones y buffers de difusion (no cuantificada en la informacion disponible).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable en GPUs con 8 GB o mas de VRAM, pero no confirmado por el autor.
- Opciones de despliegue: llama.cpp u otro runtime compatible con GGUF; el autor menciona un script propio `scripts/hf_models.py pull` para descargar el fichero. No se confirma soporte en vLLM, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tokenfrugal-wan2.2-ti2v-5b-turbo-q4km | ~5B | no disponible | GGUF Q4_K_M | Apache-2.0 (base) / verificar | HuggingFace (maxh8086) |
| Wan2.2 TI2V-5B Turbo (original) | ~5B | no disponible | safetensors | Apache-2.0 | HuggingFace (Wan-AI) |
| Otras cuantizaciones GGUF de Wan2.2 TI2V-5B | ~5B | no disponible | GGUF | segun uploader | HuggingFace (varios) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre sesgos, alucinacion, limitaciones de contexto ni idiomas.
- Sin validacion de calidad: el autor no ha medido perplejidad ni ejecutado pruebas de renderizado; solo ha verificado integridad de ficheros.
- Licencia ambigua: el autor indica Apache-2.0 para la base Wan-AI pero anade "verify the quant uploader license"; conviene confirmar los terminos antes de uso comercial.
- Cuantizacion Q4_K_M: implica perdida de precision respecto a FP16; no se ha cuantificado el impacto en calidad de video generado.
- Repositorio privado/espejo: descargas y likes a cero, sin comunidad que valide su funcionamiento.
- Sin garantias de soporte en runtimes: no se confirma compatibilidad con llama.cpp, Ollama, vLLM ni otros motores.
- Fecha de creacion futura (2026-11-05) en los metadatos: conviene verificar la procedencia y autenticidad del artefacto antes de integrarlo en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/maxh8086/tokenfrugal-wan2.2-ti2v-5b-turbo-q4km
- Modelo base Wan-AI Wan2.2 TI2V-5B (referencia por nombre, sin URL confirmada en la informacion disponible): no disponible
- Paper, blog, repositorio o demo oficial: no disponible en la informacion proporcionada.
