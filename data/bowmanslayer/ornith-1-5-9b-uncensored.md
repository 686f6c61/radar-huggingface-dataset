# bowmanslayer/Ornith-1.5-9B-Uncensored

## Resumen

Ornith-1.5-9B-Uncensored es un finetune del modelo multimodal Ornith-1.5-9B, desarrollado por el usuario bowmanslayer, que aplica la técnica de ablación direccional (también conocida como "abliteration") para eliminar la alineación de seguridad del modelo original. El modelo base, Ornith-1.5-9B, es un descendiente post-entrenado de Qwen3.5-9B con un refuerzo sustancial de seguridad, y este finetune busca eliminar los rechazos a peticiones dañinas manteniendo las capacidades generales. Según el autor, la ablación se aplica a 64 tensores de escritura residual en las 32 capas, excluyendo `embed_tokens`, lo que reduce la tasa de rechazo de 72-87% a 0/23 en un conjunto de prueba de 23 prompts adversarios, con una pérdida de capacidad media de solo 0,59 puntos porcentuales en 11 benchmarks.

El modelo es multimodal (image-text-to-text), soporta inglés y chino, y se distribuye bajo licencia Apache-2.0. El repositorio en HuggingFace tiene un tamaño de 4,9 GB, aunque el README indica que el peso de referencia en bf16 ocupa aproximadamente 18 GB, lo que sugiere una posible discrepancia en el contenido del repositorio. No se han publicado datos sobre la longitud de contexto ni sobre el proceso de entrenamiento más allá de la técnica de ablación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text), basado en Qwen3.5-9B |
| Parametros totales | 9B (segun nombre y busqueda web) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (referencia); se mencionan variantes W4A16 (GPTQ) y GGUF en otros repos |
| Idiomas soportados | ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un finetune de ornith-ai/Ornith-1.5-9B, que a su vez es un post-entrenamiento de Qwen3.5-9B con un alineamiento de seguridad reforzado. La tecnica empleada es la ablacion direccional descrita en Arditi et al. (2024), que consiste en identificar y eliminar la direccion de "rechazo" en el espacio residual del modelo. En este caso, se aplica a 64 tensores de escritura residual distribuidos en las 32 capas, pero excluyendo `embed_tokens`, un cambio estructural que resulto decisivo: incluir este tensor rompia la capacidad de detener la generacion en el modelo base mas fuertemente alineado. El autor reporta que la extraccion de direccion se realizo con L=25 y alpha=1.0, con preservacion de norma. No se proporcionan datos sobre el dataset de entrenamiento ni sobre el proceso de post-entrenamiento adicional; la unica intervencion es la ablacion sobre el modelo base.

## Capacidades

- Generacion de texto y razonamiento: mantiene un rendimiento cercano al modelo base en tareas de conocimiento general, razonamiento logico y matematicas (MMLU, BBH, GSM8K, MATH-500).
- Generacion de codigo: obtiene una puntuacion de 92,16 en HumanEval, ligeramente inferior al base (94,67) pero aun alta.
- Capacidades multimodales: al ser un modelo image-text-to-text, puede procesar imagenes junto con texto, aunque la torre de vision no fue modificada por la ablacion.
- Modo de pensamiento (thinking): la evaluacion se realizo con "thinking enabled", lo que sugiere que el modelo soporta un modo de razonamiento extendido antes de responder.
- Multilingue: soporta ingles y chino, con resultados en benchmarks como CMMLU y C-Eval.
- Ausencia de rechazos: el modelo no rechaza peticiones dañinas, lo que lo hace util para investigacion de seguridad y generacion de contenido sin restricciones, pero tambien peligroso si se despliega sin control.

## Casos de uso

- Investigacion en alineacion y seguridad de IA: el modelo permite estudiar como se comporta un sistema sin alineacion de seguridad, comparando con el base para entender los mecanismos de rechazo y disenar mejores tecnicas de control.
- Generacion de codigo en entornos controlados: con un rendimiento de 92 en HumanEval, puede usarse para tareas de programacion asistida, siempre que se supervise la salida y se apliquen filtros adicionales.
- Analisis de imagenes y documentos: al ser multimodal, puede procesar capturas de pantalla, diagramas o fotografias junto con instrucciones de texto, util en automatizacion de tareas de vision por computadora.
- Razonamiento complejo y resolucion de problemas: con buenos resultados en BBH y GSM8K, puede emplearse en sistemas de ayuda a la decision que requieran pasos de razonamiento multiples.
- Generacion de texto creativo sin restricciones: para proyectos de ficcion, guiones o contenido artistico donde se necesite explorar temas tabu o controvertidos, siempre que el despliegue sea privado y con responsabilidad legal.
- Evaluacion de riesgos de modelos sin alineacion: util para equipos de red teaming que necesitan probar defensas contra contenido dañino generado por IA, usando este modelo como generador de ataques.

## Benchmarks y rendimiento

El autor proporciona una evaluacion comparativa entre el modelo base Ornith-1.5-9B y este finetune, realizada con el mismo harness, mismo seed y mismas condiciones de decodificacion (vLLM TP=2 fp16, thinking habilitado, max 4096 tokens de salida, 8192 para MATH-500). Los resultados son los siguientes:

| Benchmark | N | Ornith-1.5-9B base | Este modelo | Delta |
|---|---:|---:|---:|---:|
| MMLU | 150 | 90.14 | 88.97 | -1.17 |
| CMMLU | 150 | 86.67 | 84.17 | -2.50 |
| MMLU-Pro | 150 | 88.97 | 87.12 | -1.85 |
| C-Eval | 150 | 85.82 | 84.78 | -1.04 |
| ARC-Challenge | 150 | 93.33 | 94.67 | +1.34 |
| TruthfulQA | 150 | 79.31 | 82.31 | +3.00 |
| GSM8K | 100 | 98.99 | 97.98 | -1.01 |
| MATH-500 | 100 | 73.68 | 70.53 | -3.15 |
| BBH | 150 | 91.72 | 95.27 | +3.55 |
| HumanEval | 164 | 94.67 | 92.16 | -2.51 |
| IFEval (strict) | 100 | 78.65 | 77.53 | -1.12 |
| **Media (excl. trunc)** | — | **87.45** | **86.86** | **-0.59** |

La perdida media de capacidad es de 0,59 puntos porcentuales, dentro del ruido esperado para una unica semilla. TruthfulQA y BBH mejoran ligeramente, lo que sugiere que la ablacion no afecta a las ganancias de veracidad ni de razonamiento duro del post-entrenamiento de Ornith.

## Requisitos de hardware

- En bf16 (referencia), el modelo requiere aproximadamente 18 GB de VRAM, por lo que necesita una GPU de 24 GB (por ejemplo, RTX 3090/4090) o dos GPUs de 12 GB con tensor parallelism.
- Con cuantizacion de 4 bits (GGUF o GPTQ), el modelo cabe en GPUs de 8 GB, como una RTX 3060 o una GTX 1080 Ti, y tambien en Macs con 16 GB de RAM unificada (segun la guia de atomic.chat para el modelo base).
- La evaluacion del autor se realizo con vLLM en configuracion TP=2 fp16, lo que sugiere que el despliegue recomendado para produccion es vLLM o TGI con al menos 2 GPUs.
- Para inferencia local, se puede usar llama.cpp con archivos GGUF, o Ollama si se publica una variante compatible.
- La latencia y el throughput no se han publicado; dependen de la cuantizacion y del hardware. En una RTX 4090 con cuantizacion 4-bit, se puede esperar una velocidad de generacion de 30-50 tokens por segundo, aunque no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B (base) | 9B | no disponible | Si | Apache-2.0 | Modelo original con alineacion de seguridad reforzada |
| Ornith-1.5-9B-Uncensored (este) | 9B | no disponible | Si | Apache-2.0 | Finetune sin alineacion, misma arquitectura |
| Qwen3.5-9B | 9B | no disponible | Si | Apache-2.0 | Modelo padre de Ornith, con alineacion estandar |

No se dispone de datos de rendimiento de Qwen3.5-9B para comparar directamente. La comparacion principal es con el modelo base, que pierde 0,59 pp de media pero gana en ausencia de rechazos. Otros modelos "uncensored" como Dolphin o WizardLM-uncensored no se han evaluado en las mismas condiciones, por lo que no se incluyen.

## Limitaciones y advertencias

- El modelo no tiene alineacion de seguridad: puede generar contenido ilegal, dañino, violento o sexualmente explicito sin restricciones. No debe desplegarse a terceros sin una capa de seguridad adicional.
- El autor exige aceptar un acuerdo de uso que confirma mayoria de edad, responsabilidad legal sobre las salidas y la obligacion de no distribuirlo sin filtros propios.
- La evaluacion de rechazos se realizo con 23 prompts generados por un modelo juez, no con un conjunto estandarizado; la tasa de 0/23 es indicativa pero no exhaustiva.
- La perdida de capacidad es pequena pero no nula: en tareas como MATH-500 (-3,15) o CMMLU (-2,50) la diferencia puede ser relevante en aplicaciones de alta precision.
- No se ha verificado la robustez del modelo ante jailbreaks adicionales o ataques adversarios; la ablacion puede no ser completa en todos los escenarios.
- El repositorio muestra un tamano de 4,9 GB, mientras que el README indica ~18 GB para bf16; esta discrepancia sugiere que el repositorio puede no contener los pesos completos o que hay un error en la descripcion. Se recomienda verificar antes de descargar.
- No se han publicado datos sobre la longitud de contexto, el dataset de entrenamiento ni el proceso de post-entrenamiento mas alla de la ablacion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/bowmanslayer/Ornith-1.5-9B-Uncensored
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Variante GGUF (de terceros): https://huggingface.co/mradermacher/Ornith-1.5-9B-uncensored-GGUF
- Guia de ejecucion local (para el modelo base): https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally
- Repositorio de Ornith-1 (familia anterior): https://github.com/ornith-ai/Ornith-1
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Paper de ablacion direccional: https://arxiv.org/abs/2406.11717
