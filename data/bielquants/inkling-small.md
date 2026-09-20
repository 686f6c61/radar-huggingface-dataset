# bielquants/Inkling-Small

## Resumen

Inkling-Small es un modelo multimodal de propósito general desarrollado por Thinking Machines (el repositorio consultado, `bielquants/Inkling-Small`, apunta a los pesos publicados en `thinkingmachines/Inkling-Small`). Acepta entradas de texto, imagen y audio, y genera únicamente texto. Está pensado para desarrolladores que construyen aplicaciones de IA: asistentes conversacionales, sistemas agénticos con uso de herramientas, asistentes de código y pipelines de generación aumentada por recuperación (RAG).

La arquitectura es un transformer autorregresivo decoder-only de 42 capas con un backbone feed-forward de mezcla de expertos dispersa (MoE): cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos activos en todos los tokens. La atención combina capas locales y globales. Según la model card, el modelo tiene 276 000 millones de parámetros totales y 12 000 millones activos por token; el recuento real de los ficheros safetensors del repositorio es de 265 956 439 090 parámetros, una discrepancia que conviene tener en cuenta.

Es relevante porque, con licencia Apache 2.0 y pesos abiertos, cubre tres modalidades de entrada (texto, imagen y audio) con un coste de cómputo por token comparable al de un modelo denso de ~12 000 millones de parámetros, aunque el requisito de memoria corresponde a un modelo de ~276 000 millones. Los idiomas declarados son inglés con capacidades multilingües generales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo decoder-only multimodal con MoE dispersa (42 capas, atencion hibrida local/global) |
| Parametros totales | 276B segun la model card; 265 956 439 090 segun los ficheros safetensors del repositorio |
| Parametros activos | 12B por token (6 de 256 expertos + 2 expertos compartidos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y NVFP4 (segun la model card) |
| Idiomas soportados | Ingles con capacidades multilingues generales; lista explicita de idiomas no disponible |
| Licencia | Apache 2.0 (con politica de uso aceptable adicional referenciada por el autor) |
| Formato de pesos | safetensors (tambien checkpoint NVFP4 en repositorio aparte) |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo decoder-only de 42 capas. El bloque feed-forward es una mezcla de expertos dispersa: 256 expertos enrutados, de los que se activan 6 por token, mas 2 expertos compartidos que se activan siempre. La atencion es una combinacion de capas locales y globales. La multimodalidad es nativa: las imagenes se codifican mediante un codificador jerarquico de parches (*patch encoder*) y el audio mediante codificacion en tokens discretos; todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente en el decodificador.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO. La model card indica que los datos de entrenamiento cubren texto, imagenes, audio y video, y proceden de fuentes publicas de internet y repositorios accesibles, de terceros y de generacion sintetica o aumentada. El proceso de curado incluye limpieza, deduplicacion y filtrado por calidad y criterios de seguridad. Las entradas de imagen se procesan mejor con dimensiones entre 40 px y 4096 px, y el audio en WAV a 16 kHz con una duracion ideal inferior a 2 minutos.

## Capacidades

- Generacion de texto e instrucciones de proposito general en ingles y de forma multilingue general.
- Comprension de imagenes: entrada de imagen en cualquier formato basado en pixeles, con un codificador jerarquico de parches.
- Comprension de audio: entrada en WAV a 16 kHz, orientada a clips de menos de 2 minutos.
- Razonamiento multimodal conjunto: texto, imagen y audio se proyectan a un espacio compartido y se procesan en el mismo decodificador.
- Uso de herramientas y function calling: la model card indica que el modelo esta disenado para sistemas agenticos y de uso de herramientas.
- Asistentes de codigo en multiples lenguajes de programacion.
- Aplicaciones conversacionales, seguimiento de instrucciones y sistemas de generacion aumentada por recuperacion.
- No se documenta generacion de imagenes ni de audio: la salida es siempre texto codificado en UTF-8.

## Casos de uso

- Asistentes conversacionales multimodales: el modelo puede mantener dialogos en los que el usuario intercala texto, imagenes y audio en la misma conversacion, gracias a que las tres modalidades comparten espacio oculto y se procesan conjuntamente.
- Analisis de documentos escaneados: facturas, informes o capturas de pantalla se envian como imagen (dentro del rango recomendado de 40 px a 4096 px) y el modelo devuelve texto estructurado o respuestas sobre el contenido.
- Procesamiento de reuniones y llamadas: con entradas de audio en WAV a 16 kHz e inferiores a 2 minutos por clip, se pueden transcribir y resumir fragmentos de audio, encadenando clips para sesiones mas largas.
- Agentes con uso de herramientas: integrado en orquestadores agenticos, el modelo puede emitir llamadas a funciones y encadenar varios pasos de razonamiento para resolver tareas de varios turnos.
- Asistencia de programacion: generacion, explicacion y refactorizacion de codigo en varios lenguajes, con soporte para integrarse en flujos de revision o generacion asistida.
- RAG multimodal: recuperacion de fragmentos mixtos (texto e imagenes) de un indice vectorial y generacion de respuestas que citan y describen tanto texto como imagenes recuperadas.
- Accesibilidad: descripcion automatica de imagenes y conversion de contenido visual o sonoro a texto para lectores de pantalla y herramientas de asistencia.
- Etiquetado y clasificacion de contenido multimodal: catalogacion de archivos de imagen y audio en bibliotecas de medios, generando descripciones y metadatos textuales a escala.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye una tabla de evaluaciones que compara Inkling-Small con Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash, entre otros, pero los valores numericos de esa tabla aparecen truncados en la informacion proporcionada, por lo que no se reproducen aqui. Los resultados de busqueda web disponibles no contienen datos de rendimiento del modelo.

## Requisitos de hardware

- Pesos en BF16: el repositorio ocupa 531,9 GB, coherente con ~266B parametros a 2 bytes por parametro. La inferencia en BF16 requiere al menos ~532 GB solo para pesos, mas memoria para cache KV y activaciones.
- Pesos en NVFP4: aproximadamente 4 bits por parametro, del orden de 138 GB para 276B parametros, mas overhead de cache KV.
- No cabe en una GPU de consumo: ni siquiera en NVFP4 (RTX 4090 con 24 GB, o 32 GB en una RTX 5090) cabe el modelo completo. Requiere despliegue multi-GPU o multi-nodo.
- GPUs recomendadas: configuraciones de 8x H100 80 GB o 8x H200 para BF16; para NVFP4 serian necesarias al menos 2-4 GPUs de 80 GB. A100 80 GB en configuracion multiple tambien es viable, con menor rendimiento.
- Opciones de despliegue documentadas: SGLang, vLLM, TokenSpeed, Unsloth y la libreria transformers de Hugging Face.
- Latencia y throughput: no disponible. El coste de computo por token se corresponde con un modelo de 12B parametros activos, aunque el ancho de banda de memoria necesario para servir los 276B totales condiciona el rendimiento global.

## Comparativa con modelos similares

La model card situa Inkling-Small frente a los siguientes modelos en su tabla de evaluaciones. Los datos marcados como no disponibles no aparecen en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| Inkling-Small | 276B totales / 12B activos | no disponible | Apache 2.0 | no disponible |
| Qwen3.5 397B-A17B | 397B totales / 17B activos (segun denominacion) | no disponible | no disponible | no disponible |
| MiMo V2.5 | no disponible | no disponible | no disponible | no disponible |
| Minimax M2.7 | no disponible | no disponible | no disponible | no disponible |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | no disponible |

Se trata de modelos de la misma categoria de MoE de gran escala con pesos abiertos (los cuatro primeros) o cerrados, segun la clasificacion de la propia tabla del autor. No se dispone de cifras que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks verificables en la informacion disponible, por lo que no es posible confirmar el rendimiento declarado.
- Existe una discrepancia entre los parametros totales de la model card (276B) y los recuentos reales de safetensors (265 956 439 090), que conviene verificar antes de dimensionar el hardware.
- Riesgo de alucinacion: inherente a los modelos generativos; la model card no documenta tasas de error ni evaluaciones de fidelidad.
- Sesgos: la model card no documenta analisis de sesgos especificos. Los datos provienen de internet publico, de terceros y de generacion sintetica, con limpieza y filtrado, pero sin detalle sobre las metricas de sesgo aplicadas.
- Limitaciones de modalidad: el audio se procesa mejor por debajo de 2 minutos por clip y solo en WAV a 16 kHz; las imagenes requieren dimensiones entre 40 px y 4096 px para un rendimiento optimo.
- Idiomas: el modelo esta orientado al ingles con capacidades multilingues generales, sin lista explicita de idiomas soportados ni evaluacion por idioma.
- La longitud de contexto no esta especificada en la informacion disponible, lo que impide planificar correctamente cargas de trabajo con documentos largos.
- Licencia: los pesos se publican bajo Apache 2.0, pero el autor referencia una politica de uso aceptable (`thinkingmachines.ai/model-acceptable-use-policy`) que puede imponer condiciones adicionales al uso comercial; conviene revisarla.
- El repositorio consultado pertenece a una cuenta distinta (`bielquants`) de la del autor original (`thinkingmachines`), por lo que se recomienda verificar la procedencia e integridad de los pesos antes de usarlos en produccion.
- El tamano del repositorio (531,9 GB) dificulta la descarga y el despliegue en infraestructuras modestas.

## Enlaces

- Modelo en HuggingFace (repositorio consultado): https://huggingface.co/bielquants/Inkling-Small
- Pesos BF16 del autor original: https://huggingface.co/thinkingmachines/Inkling-Small
- Pesos NVFP4: https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Playground: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (repositorio): https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Guia de Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face sobre el modelo: https://hf.co/blog/thinkingmachines-inkling
