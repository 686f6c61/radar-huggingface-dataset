# mradermacher/LFM3-1.7B-BR-i1-GGUF

## Resumen

LFM3-1.7B-BR-i1-GGUF es una colección de cuantizaciones GGUF, generadas con imatrix (matriz de importancia), del modelo LFM3-1.7B-BR de fabriciocarraro. El modelo base es un ajuste fino orientado al portugués de Brasil del LFM3 de 1.7B parámetros de Liquid AI, una familia de modelos diseñada para despliegue en el borde (edge) con soporte de tool calling y razonamiento. Este repositorio no contiene los pesos originales en safetensors, sino versiones comprimidas en formato GGUF listas para su uso con llama.cpp y derivados como Ollama o LM Studio.

El interés de esta ficha radica en que combina tres elementos: un modelo pequeño (1.7B) apto para hardware de consumo, una especialización lingüística en portugués brasileño y un conjunto amplio de cuantizaciones (desde IQ1_S hasta Q6_K) que permiten ajustar el equilibrio entre calidad y huella de memoria. El autor de las cuantizaciones, mradermacher, es un actor conocido en el ecosistema por publicar versiones imatrix de modelos populares.

La información disponible sobre el modelo base es limitada: la model card del repositorio de cuantizaciones no detalla arquitectura interna, datos de entrenamiento ni resultados de benchmarks. Los datos de parámetros totales reportados en los metadatos de safetensors (899.013) resultan inconsistentes con el nombre del modelo (1.7B) y probablemente reflejan un recuento parcial o erróneo, por lo que se indican como no fiables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM3 de Liquid AI; detalles no publicados en la informacion disponible) |
| Parametros totales | 1.7B segun el nombre del modelo; el recuento de safetensors reportado (899.013) es inconsistente y no fiable |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S, ademas de un fichero imatrix |
| Idiomas soportados | pt (portugues), en (ingles); especializado en portugues de Brasil (pt-BR) |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (cuantizaciones imatrix/weighted); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. Por la nomenclatura de la familia LFM3 de Liquid AI, se trata de un modelo transformer de 1.7B parametros orientado a despliegue en el borde, con capacidades declaradas de tool calling y razonamiento. El ajuste fino LFM3-1.7B-BR de fabriciocarraro especializa el modelo en portugues de Brasil.

Este repositorio concreto no entrena ningun modelo: aplica cuantizacion de precision reducida sobre los pesos del modelo base usando el formato GGUF de llama.cpp. Las cuantizaciones etiquetadas como "i1" emplean una matriz de importancia (imatrix) calculada sobre un corpus de calibracion, lo que en la practica mejora la fidelidad de las cuantizaciones de baja precision (especialmente las de la familia IQ) respecto a las cuantizaciones estaticas equivalentes. El repositorio incluye el propio fichero imatrix para que terceros puedan generar sus propias cuantizaciones. No se documentan en la model card los datos de entrenamiento del modelo base, el numero de tokens, ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto en portugues de Brasil e ingles.
- Razonamiento (tag "reasoning" en los metadatos del modelo base).
- Tool calling / function calling (tag "tool-calling").
- Orientado a despliegue en el borde (tag "edge"), es decir, inferencia en hardware limitado.
- Capacidades multilingues limitadas a pt y en segun los metadatos.
- No se documentan capacidades de vision, audio ni modos de pensamiento extendido en la informacion disponible.

## Casos de uso

- Asistentes conversacionales en portugues de Brasil: el modelo esta especializado en pt-BR, por lo que resulta adecuado para chatbots de atencion al cliente dirigidos a ese mercado, desplegables en local sin depender de APIs externas.
- Tool calling en automatizaciones: el tag "tool-calling" indica soporte para invocar funciones; se puede integrar en agentes que consulten APIs, bases de datos o servicios internos desde un servidor modesto.
- Despliegue en el borde y dispositivos con poca memoria: las cuantizaciones IQ1_S e IQ2 permiten ejecutar el modelo en entornos con pocos gigabytes de RAM, util para prototipos en portatiles o mini-PC.
- Generacion de texto asistida en aplicaciones de escritorio: con cuantizaciones Q4_K_M o Q5_K_M se obtiene un equilibrio razonable entre calidad y tamano para integrarse en herramientas ofimaticas o de correo en portugues.
- Filtrado y clasificacion de contenido en pt-BR: tareas de etiquetado, resumen o moderacion de textos en portugues brasileño con latencia baja gracias al tamano reducido del modelo.
- Entornos de investigacion y experimentacion: el fichero imatrix y la variedad de cuantizaciones permiten estudiar el impacto de la compresion en la calidad del modelo sin necesidad de GPUs de gama alta.
- Educacion y demos offline: al caber en hardware de consumo, sirve para demostraciones de IA generativa en portugués sin conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion (valores aproximados para un modelo de 1.7B; el repositorio no publica tamanos por fichero mas alla del imatrix de 0.1 GB):
  - IQ1_S / IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: en torno a 0.5-1.0 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: en torno a 0.8-1.2 GB.
  - Q4_0 / Q4_1 / Q4_K_S / Q4_K_M / IQ4_XS / small-IQ4_NL: en torno a 1.0-1.3 GB.
  - Q5_K_S / Q5_K_M: en torno a 1.2-1.5 GB.
  - Q6_K: en torno a 1.4-1.7 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones de 4 bits; una RTX 3060, RTX 4060 o superior ofrece margen suficiente. Para las cuantizaciones mas grandes (Q6_K) se recomienda 6-8 GB de VRAM o ejecucion en CPU.
- Cabe en GPU consumer: si, practicamente en todas las GPU modernas con 4 GB o mas de VRAM, e incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. El repositorio esta etiquetado como "endpoints_compatible".
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-BR-i1-GGUF (este) | 1.7B | no disponible | pt, en | lfm1.0 | GGUF (imatrix) |
| LFM3-1.7B-BR-GGUF (cuantizaciones estaticas de mradermacher) | 1.7B | no disponible | pt, en | lfm1.0 | GGUF (estatico) |
| fabriciocarraro/LFM3-1.7B-BR (modelo base) | 1.7B | no disponible | pt, en | lfm1.0 | safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinacion ni evaluaciones de calidad; se recomienda validar el modelo en el dominio de uso antes de producción.
- Las cuantizaciones de muy baja precision (IQ1_S, IQ2_XXS) degradan notablemente la calidad respecto a los pesos originales; para uso en producción se recomienda Q4_K_M o superior.
- La especializacion en portugues de Brasil puede reducir el rendimiento en portugues europeo u otros idiomas distintos del pt y el en.
- La licencia lfm1.0 (etiquetada como "other") puede imponer restricciones al uso comercial; es necesario revisar el fichero LICENSE del modelo base antes de desplegarlo en productos comerciales.
- El recuento de parametros reportado en los metadatos (899.013) es inconsistente con el nombre del modelo; conviene verificar el modelo base antes de asumir su tamano real.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Al ser una cuantizacion de terceros, no existe garantia del autor original del modelo sobre la fidelidad de los pesos comprimidos.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/LFM3-1.7B-BR-i1-GGUF
- Modelo base: https://huggingface.co/fabriciocarraro/LFM3-1.7B-BR
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/LFM3-1.7B-BR-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM3-1.7B-BR-i1-GGUF
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
