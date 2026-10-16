# RunningHubAI/rh-66-lora

## Resumen

rh-66-lora es un adaptador LoRA publicado en Hugging Face por RunningHubAI, la cuenta de la plataforma RunningHub, con etiquetas `comfyui` y `lora`. Según el nombre del único archivo de pesos incluido, `lightx2v_T2V_14B_cfg_step_distill_v2_lora_rank64_bf16_.safetensors`, se trata de una LoRA de destilación de CFG (classifier-free guidance) y de pasos de muestreo, de rango 64 y precisión bf16, derivada del modelo base WAN2.1 en su variante text-to-video de 14B de parámetros. El repositorio ocupa 0,6 GB, coherente con los 601 MiB del adaptador, y la model card indica que está afinada a partir de WAN2.1.

El propósito de este tipo de adaptadores en el ecosistema de generación de vídeo es acelerar la inferencia: al destilar el CFG se elimina la necesidad de evaluar el modelo dos veces por paso, y al destilar los pasos se reduce de forma drástica el número de iteraciones del muestreador necesarias para obtener un vídeo coherente. Eso lo hace relevante para flujos de trabajo de vídeo generativo en ComfyUI o en la propia plataforma RunningHub, donde el coste computacional por clip es el cuello de botella principal.

Se trata de un artefacto recién publicado (creado el 16 de octubre de 2026, actualizado el mismo día) y sin tracción medida: cero descargas y cero likes en el momento de redactar esta ficha, y sin resultados de benchmarks ni licencia explícita en la información disponible. La model card es fundamentalmente informativa y remite a la plataforma del autor para el uso del modelo; no incluye detalles de entrenamiento, dataset ni métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo base WAN2.1 (variante T2V de 14B según el nombre del archivo); arquitectura interna del modelo base no detallada en la información proporcionada |
| Parametros totales | No disponible para el adaptador; el modelo base indicado en el nombre del archivo es de 14B (T2V_14B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos publicados están en bf16 y no se ofrecen variantes cuantizadas del adaptador |
| Idiomas soportados | No disponible (el idioma de los prompts depende del codificador de texto del modelo base, no especificado) |
| Licencia | No disponible; la model card indica que se publica en nombre del autor, que conserva el copyright, y remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (bf16) |
| Rango de LoRA | 64 (según el nombre del archivo) |
| Tamano del adaptador | 601 MiB |
| Tamano del repositorio | 0,6 GB |
| Plataformas objetivo | ComfyUI, RunningHub, Hugging Face |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del adaptador más allá de lo que se deduce del nombre del archivo: una LoRA de rango 64 en bf16 pensada para un modelo de difusión de vídeo text-to-video de 14B, con destilación de CFG y de pasos de muestreo en su versión v2. El prefijo `lightx2v` del archivo apunta al ecosistema del proyecto LightX2V, especializado en inferencia acelerada de modelos de vídeo, aunque la model card no confirma oficialmente esa procedencia ni documenta el pipeline de destilación empleado.

Tampoco se especifican los datos de entrenamiento: no hay número de tokens, composición del dataset, ni mención a técnicas de alineación como RLHF o DPO, que por otro lado no son habituales en adaptadores de destilación para modelos de difusión. La model card se limita a indicar el modelo de partida (WAN2.1), el autor del ajuste en la plataforma RunningHub y los enlaces a la página del modelo original.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) cuando se combina con el modelo base WAN2.1 T2V de 14B sobre el que se aplica.
- Aceleración de la inferencia mediante destilación de CFG: el nombre del archivo indica que el adaptador está entrenado para funcionar sin la doble evaluación por paso que exige el guidance clásico.
- Reducción del número de pasos de muestreo gracias a la destilación de pasos (`cfg_step_distill_v2`); no se especifica en la información disponible a cuántos pasos concretos permite trabajar.
- Integración en flujos de trabajo de ComfyUI, según las etiquetas del repositorio y la propia model card.
- Ejecución en la plataforma RunningHub, tanto en su versión internacional como en la china, con opción de uso vía API.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión, audio y modo de pensamiento: no aplica; es un adaptador de difusión para vídeo, no un modelo de lenguaje.
- Capacidades multilingües: no disponible.

## Casos de uso

- Generación rápida de clips en ComfyUI: el adaptador se carga sobre WAN2.1 T2V 14B para producir vídeos con menos pasos de muestreo que el modelo base sin destilar, lo que reduce el tiempo por iteración en el nodo de muestreo.
- Prototipado de storyboards en estudios pequeños: permite iterar sobre variaciones de prompt en text-to-video a un coste por clip menor, útil cuando se necesitan muchas versiones preliminares antes de fijar una secuencia.
- Inferencia en producción sobre RunningHub vía API: la plataforma del autor expone endpoints de llamada, de modo que el adaptador puede integrarse en un servicio que reciba prompts y devuelva vídeo sin gestionar la infraestructura de GPU.
- Generación de material para redes sociales: clips cortos a partir de descripciones textuales, aprovechando que la destilación de CFG abarata la generación repetitiva de variantes.
- Previsualización de conceptos en pipelines de posproducción: generar borradores en vídeo antes de comprometer recursos en un render de mayor calidad con el modelo base completo.
- Investigación sobre destilación de modelos de difusión de vídeo: el adaptador sirve como punto de comparación para estudiar la pérdida de calidad asociada a reducir pasos y eliminar el CFG en modelos T2V de 14B.
- Automatización de contenido paramétrico: combinado con herramientas de orquestación, se pueden generar lotes de clips con prompts distintos de forma desatendida, siempre que la licencia del proyecto upstream lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 601 MiB en bf16, pero el coste real lo determina el modelo base WAN2.1 T2V de 14B sobre el que se aplica.
- Estimación para el modelo base en bf16: en torno a 28 GB solo en pesos, más los codificadores de texto y el VAE, lo que en la práctica exige GPUs de 40-80 GB (A100 40/80 GB, H100) para trabajar sin offloading agresivo.
- Estimación en fp8 o con cuantización de 8 bits: aproximadamente 14-16 GB de pesos, lo que sitúa el conjunto en el rango de 24 GB de VRAM con gestión de memoria cuidadosa.
- GPUs de consumo: una RTX 4090 o RTX 3090 de 24 GB puede ejecutar el conjunto en fp8 con offloading parcial a RAM del sistema; en tarjetas de 16 GB o menos es necesario recurrir a cuantizaciones de 4-8 bits y offloading, con penalización de velocidad.
- Opciones de despliegue: ComfyUI (entorno natural del adaptador), la plataforma RunningHub y su API, y runtimes de inferencia acelerada del ecosistema LightX2V. vLLM, llama.cpp, Ollama y TGI no aplican, ya que están orientados a modelos de lenguaje y no a difusión de vídeo.
- Latencia y throughput: no disponibles. El objetivo declarado del adaptador es reducir el coste por clip, pero la información proporcionada no incluye mediciones de tiempo, pasos efectivos ni fps de salida.
- No se documenta el soporte de GPU concretas, versiones de CUDA ni requisitos de VRAM oficiales por parte del autor.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-66-lora | LoRA de destilacion sobre WAN2.1 T2V | Adaptador de 601 MiB (base 14B) | No disponible | No disponible | Hugging Face, RunningHub |
| WAN2.1 T2V 14B (modelo base) | Modelo de difusion text-to-video | 14B | No disponible en esta informacion | Licencia del proyecto upstream, no detallada aqui | Publico |
| Otras LoRA de destilacion de CFG y pasos para WAN2.1 | Adaptadores equivalentes de la comunidad | No disponible | No disponible | No disponible | Repositorios publicos, datos no verificados |

No se dispone de datos de benchmarks ni de comparativas de calidad verificables entre rh-66-lora y alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; la model card no documenta evaluaciones de sesgo, y el comportamiento depende enteramente del modelo base y de sus datos de entrenamiento.
- Riesgo de alucinacion: en modelos de difusion de video el equivalente es la generacion de contenido fisicamente incoherente, artefactos temporales o movimiento no plausible; no se documenta ninguna evaluacion al respecto.
- La destilacion de CFG y de pasos suele implicar una perdida de calidad frente al muestreo completo con guidance; no se aportan metricas que cuantifiquen esa perdida en este adaptador concreto.
- Sin licencia declarada: la model card indica que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o upstream. Antes de un uso comercial es imprescindible aclarar la licencia de WAN2.1 y obtener autorizacion del autor del adaptador.
- El repositorio no incluye model card tecnica detallada, pipeline declarado, idiomas ni ejemplos de inferencia; cualquier integracion en produccion exige validacion propia.
- Cero descargas y cero likes: no hay evidencia de uso en la comunidad ni de validacion independiente.
- Fecha de creacion registrada como 2026-10-16, con actualizacion el mismo dia; es un artefacto reciente y potencialmente inestable en cuanto a documentacion.
- La resolucion de salida, la duracion maxima de clip y la compatibilidad exacta con versiones de ComfyUI o de los nodos de carga de LoRA no estan documentadas.
- No se especifican requisitos de VRAM oficiales; las cifras de la seccion de hardware son estimaciones derivadas del tamano del modelo base, no datos publicados por el autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-66-lora
- Proyecto original del modelo: https://www.runninghub.cn/model/public/1945863738329362433
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1819595659791233025
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API con ejemplo Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- README en chino del repositorio: https://huggingface.co/RunningHubAI/rh-66-lora/blob/main/README_cn.md
