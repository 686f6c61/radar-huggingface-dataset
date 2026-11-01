# liodon-ai/Qwen3.5-4B-Qwenputer-Filesystem-FP8

## Resumen

Qwen3.5-4B-Qwenputer-Filesystem-FP8 es una cuantizacion en FP8 dinamico del modelo divagr1925/Qwen3.5-4B-Qwenputer-Filesystem, publicada por Liodon AI. Se trata de un derivado de la familia Qwen3.5 orientado a tareas de generacion de texto y conversacion, con un enfoque declarado en el nombre hacia operaciones de sistema de ficheros ("Qwenputer-Filesystem"), aunque la model card no documenta el proceso de ajuste del modelo original. El resultado es un checkpoint listo para servir con vLLM, TGI o SGLang que reduce el peso en disco de 22,2 GB a 13,3 GB.

La relevancia de esta publicacion es fundamentalmente practica: aplica el esquema `FP8_DYNAMIC` de llm-compressor, que cuantiza pesos a FP8 (E4M3) por canal de forma anticipada y activaciones a FP8 por token en tiempo de inferencia, sin necesidad de dataset de calibracion. Esto evita el sesgo introducido por conjuntos de calibracion y convierte los pesos cuantizados en un cast directo de los originales. La capa `lm_head` se deja sin cuantizar para preservar calidad.

El checkpoint declara 11.098.254.592 parametros segun los metadatos de safetensors, un dato que entra en conflicto con la denominacion "4B" del nombre del modelo y con el tamano del repo (13,4 GB). Esta discrepancia no se resuelve en la informacion disponible y debe tenerse en cuenta al planificar el despliegue. No se han publicado resultados de benchmarks ni detalles sobre datos de entrenamiento o idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer, familia Qwen3.5 (tag `qwen3_5_text`); detalles no disponibles |
| Parametros totales | 11.098.254.592 segun safetensors (el nombre indica "4B"; discrepancia no resuelta) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinamico (pesos E4M3 por canal, activaciones FP8 por token); `lm_head` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen3.5, segun el tag `qwen3_5_text` del repositorio. No se dispone de informacion sobre el numero de capas, dimension oculta, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. El modelo base divagr1925/Qwen3.5-4B-Qwenputer-Filesystem no documenta en esta ficha su proceso de entrenamiento, composicion del dataset, numero de tokens ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica documentada corresponde exclusivamente al proceso de cuantizacion: se empleo llm-compressor con el esquema `FP8_DYNAMIC`, que aplica un cast por canal a los pesos (E4M3) y cuantiza activaciones dinamicamente por token durante la inferencia. Al no requerir calibracion, los pesos resultantes son numericamente equivalentes a un cast directo del modelo original, eliminando el sesgo de conjunto de calibracion. La capa de salida `lm_head` se mantiene en precision original por su impacto desproporcionado en la calidad frente a su tamano reducido.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Capacidad declarada de operaciones sobre sistema de ficheros, segun el nombre del modelo base; no documentada en detalle en la informacion disponible.
- Compatibilidad con endpoints (`endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Servicio de generacion de texto en produccion: el checkpoint FP8 puede desplegarse con vLLM o TGI para servir peticiones conversacionales con menor huella de memoria que el modelo original (13,3 GB frente a 22,2 GB).
- Automatizacion de tareas sobre sistema de ficheros: dado el enfoque declarado del modelo base, podria emplearse en asistentes que interpreten y ejecuten operaciones sobre rutas y ficheros, aunque esta capacidad no esta documentada ni verificada con benchmarks.
- Despliegue en GPUs Ada/Hopper: al requerir compute capability >= 8.9 para ejecucion FP8 nativa, encaja en infraestructuras con L4, L40S, RTX 40-series o H100/H200.
- Prototipado de asistentes conversacionales: el tag `conversational` y la reduccion de tamano facilitan iteracion rapida en entornos de desarrollo con una sola GPU.
- Evaluacion comparativa de cuantizacion: sirve como referencia para medir la perdida de calidad de FP8 dinamico frente al modelo base en tareas de texto.
- Integracion en pipelines con SGLang: el soporte declarado de SGLang permite incorporarlo a stacks de inferencia de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 13,4 GB en safetensors; en inferencia FP8 se requiere aproximadamente esa cifra mas overhead de activaciones y cache KV, por lo que se recomienda un minimo de 16 GB de VRAM y 24 GB para margen comodo. Dato no confirmado por el autor.
- GPUs recomendadas: NVIDIA con compute capability >= 8.9, es decir, RTX 40-series, L4, L40S, H100, H200, B100, B200 y GB10.
- En GPUs anteriores a Ada/Hopper, vLLM y TGI descomprimen el modelo para ejecutarlo, perdiendo la ventaja de velocidad y memoria del FP8.
- Opciones de despliegue: vLLM (`vllm serve`), Text Generation Inference (TGI via imagen Docker) y SGLang (`sglang.launch_server`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Qwenputer-Filesystem-FP8 (este) | 11.098.254.592 (safetensors) | no disponible | FP8 dinamico | other | HuggingFace |
| divagr1925/Qwen3.5-4B-Qwenputer-Filesystem (base) | no disponible | no disponible | BF16/FP16 (22,2 GB) | other | HuggingFace |
| Otros modelos Qwen3.5 de 4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Discrepancia entre el nombre "4B" y los 11.098.254.592 parametros declarados en safetensors; conviene verificar el checkpoint antes de dimensionar infraestructura.
- La licencia "other" no especifica condiciones de uso comercial; es necesario consultar los terminos del modelo base antes de un despliegue en produccion.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion.
- La ejecucion FP8 nativa exige GPU con compute capability >= 8.9; en hardware anterior se pierde el beneficio de la cuantizacion.
- El proceso de ajuste del modelo base hacia tareas de sistema de ficheros no esta documentado, por lo que su fiabilidad en ese dominio no puede evaluarse.
- Ausencia total de benchmarks publicados impide validar la calidad frente al modelo original o a alternativas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion por parte de la comunidad.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/liodon-ai/Qwen3.5-4B-Qwenputer-Filesystem-FP8
- Modelo base: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer-Filesystem
- Perfil del autor: https://huggingface.co/liodon-ai
- llm-compressor (herramienta de cuantizacion): https://github.com/vllm-project/llm-compressor
