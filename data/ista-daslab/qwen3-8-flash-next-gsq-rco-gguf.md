# ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje multimodal de tipo mezcla de expertos (MoE) desarrollado por Qwen, con 176.943.899.520 parametros totales y 512 expertos enrutados por capa a lo largo de 48 capas, de los cuales 10 se activan por token. Esta ficha describe la publicacion de cuantizaciones GGUF no uniformes realizadas por el ISTA-DASLab (Institute of Science and Technology Austria) bajo las tecnicas GSQ y RCO, que asignan un tipo de cuantizacion distinto a cada tensor segun su sensibilidad, sujeto a un presupuesto de tamano total. El resultado son ficheros GGUF estandar que funcionan sin modificaciones en llama.cpp, Ollama y LM Studio.

La relevancia de esta publicacion radica en que hace desplegable un MoE de gran tamano en hardware de consumo: las cuatro variantes publicadas ocupan entre 66,4 GB y 83,6 GB, con anchos de bits medios de 2,40 a 3,50 bpw sobre los pesos del transformer. Ademas se distribuye el proyector de vision (`mmproj`) en BF16, lo que habilita el uso multimodal (image-text-to-text) de las versiones cuantizadas. El modelo base es Qwen/Qwen3.8-Flash-Next y la licencia es Apache 2.0.

La publicacion acumula 7.236.306 descargas y 1287 likes, lo que la situa entre las cuantizaciones de referencia para este modelo. Frente a la cuantizacion uniforme, el enfoque GSQ-RCO concentra la precision en los tensores mas sensibles y la reduce en los menos criticos, manteniendo el presupuesto de tamano exacto sin ajuste manual de hiperparametros por restriccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) dispersa, 48 capas, 512 expertos enrutados por capa, 10 activos por token; transformer con proyector de vision |
| Parametros totales | 176.943.899.520 |
| Parametros activos | 10 de 512 expertos enrutados por token (numero exacto de parametros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_0 (2,40 bpw), IQ2_XS (2,50 bpw), IQ3_XXS (3,00 bpw), IQ3_S (3,50 bpw); tabla de embeddings n-gram en IQ4_NL (4,5 bpw); mmproj en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos shards por variante cuantizada; `mmproj` en BF16) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos dispersa con 48 capas y 512 expertos enrutados por capa, de los que se activan 10 por token. Los expertos enrutados dominan el recuento de parametros y, por tanto, el presupuesto de tamano: el 95 % de los pesos sujetos a busqueda de cuantizacion reside en los expertos. Una particularidad estructural es la tabla de embeddings n-gram por capa (`per_layer_token_embd`, 51,2 mil millones de parametros), que es una tabla de busqueda y no un peso de matmul; se mantiene fija en IQ4_NL (4,5 bpw) en todas las variantes y queda excluida de la busqueda de precision.

Sobre el proceso de cuantizacion, GSQ (Gumbel-Softmax Quantization, arXiv:2604.18556) es un metodo de cuantizacion escalar post-entrenamiento que aprende conjuntamente las asignaciones de rejilla por coordenada y las escalas por grupo mediante una relajacion Gumbel-Softmax; cierra buena parte de la brecha entre cuantizacion escalar y vectorial a 2-3 bits manteniendose en formatos escalares desplegables como GGUF. RCO (Riemannian Constrained Optimization, arXiv:2605.00649) asigna uno de K tipos de cuantizacion a cada uno de N tensores bajo un presupuesto de tamano total, reformulando la restriccion como una variedad riemanniana suave en el espacio de logits, lo que permite optimizar directamente sobre la perdida de tarea con cumplimiento exacto del presupuesto y sin hiperparametros especificos de la restriccion. La asignacion de tipos se hace por capa (no por experto, algo que GGUF no puede expresar). No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational` en la model card).
- Procesamiento multimodal image-text-to-text mediante el fichero `mmproj` en BF16, que incluye codificador de vision y proyector.
- Razonamiento y resolucion de tareas evaluadas en benchmarks (AIME25 se menciona explicitamente como referencia de calidad para IQ3_XXS).
- Capacidades de codigo: existe una variante especializada publicada por separado, Qwen3.8-Flash-Next-GSQ-RCO-Coder, que retiene 256 de los 512 expertos enrutados por capa a 1,89 bpw efectivos sobre los parametros originales, con 58,4 GB totales.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp, Ollama y LM Studio sin modificaciones.
- Capacidades multilingues: no disponible.
- Soporte de tool calling y de agentes multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local de un MoE de gran tamano en estaciones de trabajo con GPU de consumo: la variante Q2_0 (66,4 GB) permite ejecutar el modelo en configuraciones con memoria unificada o multiples GPU consumer, manteniendo el formato GGUF estandar y funcionando en llama.cpp u Ollama sin parches.
- Servicio de inferencia con latencia critica: Q2_0 ofrece 3,4 veces el throughput de prompt y 1,9 veces menos latencia extremo a extremo que IQ2_XS con un tamano de fichero ligeramente menor, y su tasa de decodificacion se mantiene plana entre cargas de trabajo, lo que lo hace adecuado para backends interactivos donde el tiempo hasta el primer token importa.
- Calidad maxima en hardware limitado: IQ3_S (83,6 GB) iguala o supera al modelo base en todas las tareas evaluadas y es la variante recomendada por el autor; sirve para pipelines de evaluacion y generacion donde la fidelidad respecto al modelo original es prioritaria.
- Tareas de razonamiento matematico: IQ3_XXS (75,8 GB) iguala al modelo base en AIME25, por lo que resulta apropiada para entornos de resolucion de problemas matematicos con presupuesto de memoria ajustado.
- Aplicaciones multimodales: combinando cualquiera de las variantes cuantizadas con el `mmproj` BF16 (0,91 GB) se obtiene un pipeline image-text-to-text completo, util para descripcion de imagenes, respuesta a preguntas sobre documentos escaneados o asistencia visual en local.
- Generacion de codigo asistida: la variante Coder (58,4 GB, 1,89 bpw efectivos, 256 expertos retenidos) esta pensada para entornos de desarrollo con GPU unica donde se necesita un modelo de codigo de gran capacidad sin infraestructura de centro de datos.
- Investigacion en cuantizacion: los ficheros y los repositorios GSQ y RCO permiten reproducir la busqueda de precision por tensor y comparar el comportamiento de formatos escalares frente a vectoriales a 2-3 bits.

## Benchmarks y rendimiento

La model card incluye una grafica de "task average vs bit-width" y afirmaciones cualitativas sobre calidad relativa al modelo base, pero no se presentan tablas con valores numericos de MMLU, HumanEval, GSM8K u otros benchmarks en la informacion disponible.

| Variante | bpw | Afirmacion de calidad recogida en la model card |
|---|---|---|
| Q2_0 | 2,40 | La mas rapida; evita formatos con tablas de busqueda grandes |
| IQ2_XS | 2,50 | La mas pequena a igual calidad |
| IQ3_XXS | 3,00 | Iguala al modelo base en AIME25 |
| IQ3_S | 3,50 | Recomendada; iguala o supera al modelo base en todas las tareas |

No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: entre 66,4 GB (Q2_0) y 83,6 GB (IQ3_S) para los pesos cuantizados, mas 0,91 GB del `mmproj` en BF16 si se usa el modo multimodal. Hay que anadir la memoria para KV cache y buffers de inferencia, cuyo tamano depende de la longitud de contexto (no disponible).
- GPU recomendadas: no disponibles de forma explicita en la informacion proporcionada. Por volumen de memoria, las variantes requieren configuraciones multi-GPU o GPU con 80 GB o mas (A100 80 GB, H100) para caber en VRAM; en una unica GPU de 80 GB solo entran las variantes de menor tamano y con margen limitado para KV cache.
- GPU de consumo: ninguna GPU consumer individual dispone de memoria suficiente para alojar los pesos completos; es necesario repartir entre varias GPU o usar memoria unificada (por ejemplo, sistemas Apple Silicon de gama alta o configuraciones multi-GPU).
- Opciones de despliegue: llama.cpp, Ollama y LM Studio de forma nativa (GGUF estandar); el autor indica compatibilidad con endpoints. No se menciona soporte de vLLM ni TGI para estos ficheros en la informacion disponible.
- Latencia y throughput: Q2_0 presenta 3,4 veces el throughput de prompt y 1,9 veces menos latencia extremo a extremo que IQ2_XS, con tasa de decodificacion plana entre cargas de trabajo. No se publican valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 176,9 B totales, MoE 512 expertos, 10 activos | no disponible | safetensors | Apache 2.0 | Referencia de calidad; requiere mucha mas memoria que las versiones cuantizadas |
| Qwen3.8-Flash-Next GSQ-RCO IQ3_S (esta publicacion) | 176,9 B totales (cuantizado a 3,50 bpw) | no disponible | GGUF, 83,6 GB | Apache 2.0 | Iguala o supera al base en todas las tareas segun el autor |
| Qwen3.8-Flash-Next GSQ-RCO Q2_0 (esta publicacion) | 176,9 B totales (cuantizado a 2,40 bpw) | no disponible | GGUF, 66,4 GB | Apache 2.0 | Variante mas rapida; 3,4x throughput de prompt frente a IQ2_XS |
| Qwen3.8-Flash-Next GSQ-RCO-Coder | 256 de 512 expertos retenidos, 1,89 bpw efectivos | no disponible | GGUF, 58,4 GB | Apache 2.0 | Variante especializada en codigo, publicada por separado |

No se dispone de datos de benchmarks ni de especificaciones de modelos de terceros comparables en la informacion proporcionada, por lo que la comparativa se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- La cuantizacion a 2,40-3,50 bpw introduce degradacion respecto al modelo base; el autor solo garantiza paridad o mejora en IQ3_S, y paridad en AIME25 para IQ3_XXS. Las variantes de 2 bits no tienen garantia de paridad en el resto de tareas.
- La asignacion de tipos de cuantizacion se hace por capa, no por experto, porque GGUF no puede expresar precision por experto; esto limita la granularidad de la busqueda.
- La tabla de embeddings n-gram (`per_layer_token_embd`, 51,2 B de parametros) se mantiene fija en IQ4_NL y representa 28,8 GB en todas las variantes, lo que impone un suelo de tamano dificil de reducir.
- Los formatos con tablas de busqueda grandes (IQ2_XS, IQ3_XXS, IQ3_S) penalizan la velocidad de decodificacion en este modelo; el autor advierte que ese coste domina la inferencia, de ahi la existencia de Q2_0.
- No hay informacion sobre sesgos, tasas de alucinacion, cobertura idiomatica ni restricciones adicionales de uso comercial mas alla de la licencia Apache 2.0.
- El modelo base es de septiembre de 2026 y la cuantizacion se actualizo por ultima vez el 29 de septiembre de 2026; conviene verificar si existen revisiones posteriores.
- El uso multimodal exige cargar ademas el fichero `mmproj` en BF16, lo que anade memoria y complejidad al despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante Coder: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Paper RCO: https://arxiv.org/abs/2605.00649
- Codigo GSQ: https://github.com/IST-DASLab/GSQ
- Codigo RCO: https://github.com/IST-DASLab/RCO
- Organizacion DASLab: https://github.com/IST-DASLab
