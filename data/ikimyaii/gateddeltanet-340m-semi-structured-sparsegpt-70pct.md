# ikimyaii/GatedDeltaNet-340M-semi-structured-SparseGPT-70pct

## Resumen

GatedDeltaNet-340M-semi-structured-SparseGPT-70pct es un modelo derivado por poda del checkpoint base m-a-p/340M-20B-GatedDeltaNet-pure-baseline, publicado por el usuario ikimyaii en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una variante experimental del baseline GatedDeltaNet de 340M de parametros sometida a una poda one-shot (sin reentrenamiento posterior) hasta alcanzar un 70% de esparsidad semi-estructurada. El objetivo del autor es establecer una linea base de comparacion para sus propios modelos EHWS dentro de la misma cuenta.

La arquitectura subyacente es GatedDeltaNet, una familia de modelos de estado recurrente lineal (linear attention/SSM hibrida) que sustituye parte o la totalidad de la atencion clasica por mecanismos de delta rule con compuertas. El modelo tiene 399.531.200 parametros reales segun el recuento de safetensors, aunque la nomenclatura del repo lo denomina "340M". La poda se aplica a todas las capas lineales internas de los bloques, manteniendo embeddings y lm_head densos, con una regla de mascara por fila que garantiza el mismo numero de ceros en cada fila dentro de bloques de 128 columnas.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigacion sobre compresion de modelos, no de un modelo listo para produccion. Los resultados publicados muestran una degradacion significativa de perplexity y de precision zero-shot respecto al modelo denso original, lo que lo convierte en material de referencia para estudiar el impacto de la poda semi-estructurada en arquitecturas lineales, mas que en una herramienta desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (linear attention / delta rule con compuertas) |
| Parametros totales | 399.531.200 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base se entreno con secuencias de 2.048 tokens en calibracion) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad | 70,01% semi-estructurada (medida sobre los pesos) |
| Modelo base | m-a-p/340M-20B-GatedDeltaNet-pure-baseline |
| Tamano del repo | 0,8 GB |

## Arquitectura y entrenamiento

La arquitectura GatedDeltaNet combina mecanismos de atencion lineal con una regla delta y compuertas de olvido, orientada a reducir el coste computacional cuadratico de la atencion clasica manteniendo capacidad de modelado de dependencias a larga distancia. El checkpoint base fue entrenado por m-a-p (20B tokens, segun la nomenclatura del identificador) y este derivado no anade entrenamiento: la unica transformacion es la poda.

El proceso de poda emplea SparseGPT con una modificacion respecto al metodo publicado: dentro de cada bloque de 128 columnas, cada fila poda el mismo numero de entradas de menor magnitud relativa `w^2 / [H^-1]_jj^2`, aplicando la regla N:M de SparseGPT con M igual al tamano del bloque. Esto produce una esparsidad por fila uniforme (verificada en 240 capas), lo que equilibra perfectamente la carga de trabajo por fila en kernels dispersos. La calibracion uso 128 secuencias de C4 de 2.048 tokens con semilla 0, podando los bloques en orden y calibrando cada bloque sobre las salidas de los bloques ya podados. Los pesos se podaron en bfloat16 y el proceso completo tardo 2,5 minutos en una A100 de 40 GB. Embeddings y lm_head permanecen densos.

## Capacidades

- Generacion de texto autoregresiva, heredada del checkpoint base GatedDeltaNet.
- Modelado de lenguaje causal con arquitectura de atencion lineal.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- La esparsidad del 70% permite, en principio, aceleracion en hardware con soporte de kernels semi-estructurados, aunque no se documenta en la model card.
- Rendimiento reducido respecto al modelo denso en tareas de razonamiento y comprension (ver seccion de benchmarks).

## Casos de uso

- Investigacion sobre compresion de modelos: servir como linea base para comparar tecnicas de poda alternativas (por ejemplo, los modelos EHWS del mismo autor) sobre la misma arquitectura GatedDeltaNet de 340M.
- Estudio academico de poda semi-estructurada: analizar el impacto de la regla por fila uniforme frente a la regla N:M clasica de SparseGPT en perplexity y en tareas zero-shot.
- Benchmarking de kernels dispersos: al tener todas las filas el mismo numero de no-ceros, es util para validar implementaciones de kernels que explotan esparsidad semi-estructurada con equilibrio de carga por fila.
- Reproducibilidad de pipelines de poda: el autor documenta el proceso (calibracion, orden de bloques, semilla, hardware y tiempo), lo que facilita reproducir o auditar el experimento.
- Evaluacion de degradacion en arquitecturas lineales: comparar el comportamiento bajo poda de GatedDeltaNet frente a transformers clasicos, dado el interes creciente por modelos de atencion lineal.
- Prototipado de bajo coste en entornos de investigacion: con 0,8 GB de pesos en bfloat16, el modelo cabe en GPUs de gama media y permite experimentos rapidos de inferencia, siempre asumiendo la perdida de calidad.

## Benchmarks y rendimiento

Perplexity (protocolo de evaluacion de ELSA, fp16):

| Conjunto | Denso | Este modelo |
|---|---|---|
| WikiText-2 | 16,42 | 63,08 |
| C4 | 19,94 | 63,17 |

Precision zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2645 | 0,1886 |
| arc_easy | 0,6023 | 0,4015 |
| boolq | 0,5985 | 0,6217 |
| hellaswag | 0,3461 | 0,2902 |
| openbookqa | 0,2300 | 0,1380 |
| rte | 0,5162 | 0,5162 |
| winogrande | 0,5036 | 0,5264 |
| Media | 0,4373 | 0,3832 |

La esparsidad medida sobre los pesos es 0,7001 y todas las filas de las 240 capas podadas tienen el mismo numero de no-ceros.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,8 GB de pesos mas activaciones y cache; viable en GPUs consumer con 8 GB o mas.
- GPU recomendadas: A100 40 GB (usada por el autor para la poda), H100, RTX 4090, RTX 3090; cualquier GPU con al menos 8 GB deberia poder cargar los pesos densos.
- Cabe en GPU consumer: si, en tarjetas de gama media-alta con 8 GB o mas, en bf16 o fp16.
- Opciones de despliegue: requiere el paquete `flash-linear-attention` instalado (`import fla`) y carga mediante `AutoModelForCausalLM.from_pretrained(...)`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible. La aceleracion efectiva por esparsidad depende de kernels especificos que no se documentan en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplexity WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (70% sparse) | 399,5M | no disponible | 63,08 | no disponible | Hugging Face |
| m-a-p/340M-20B-GatedDeltaNet-pure-baseline (denso) | ~340M (nominal) | no disponible | 16,42 | no disponible | Hugging Face |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciados) |

La comparativa directa mas relevante es con el checkpoint denso del que deriva, ya que comparten arquitectura y datos de entrenamiento; la diferencia de perplexity (16,42 frente a 63,08 en WikiText-2) cuantifica el coste de la poda al 70% sin reentrenamiento.

## Limitaciones y advertencias

- Degradacion severa de calidad: la perplexity en WikiText-2 pasa de 16,42 a 63,08 y la media zero-shot cae de 0,4373 a 0,3832; no es apto para uso en produccion sin reentrenamiento o ajuste posterior.
- Poda one-shot sin recuperacion: no hubo reentrenamiento ni destilacion para compensar la perdida, lo que explica la caida de rendimiento.
- Sesgos conocidos: no documentados en la model card; al heredar del checkpoint base, arrastra los sesgos de sus datos de entrenamiento, que no se detallan.
- Riesgo de alucinacion: elevado en terminos relativos, dado el deterioro del modelado de lenguaje medido por perplexity.
- Limitaciones de contexto e idioma: no se especifican; la calibracion uso secuencias de 2.048 tokens, pero la ventana efectiva del modelo base no se documenta.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; conviene verificar la licencia del modelo base antes de cualquier despliegue.
- Dependencia de `flash-linear-attention`: la carga requiere `import fla`; sin esa libreria el modelo puede no cargar correctamente.
- Artefacto de investigacion: descargas y likes a cero en el momento de la ficha, sin pipeline declarado ni idiomas especificados, lo que indica que no esta pensado como modelo de uso general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-340M-semi-structured-SparseGPT-70pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-GatedDeltaNet-pure-baseline
- Libreria flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- SparseGPT (referencia del metodo de poda): https://arxiv.org/abs/2301.00774
- Perfil del autor en Hugging Face: https://huggingface.co/ikimyaii
