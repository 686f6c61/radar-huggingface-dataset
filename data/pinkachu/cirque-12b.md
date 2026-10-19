# pinkachu/Cirque-12B

## Resumen

Cirque-12B es un checkpoint publicado en HuggingFace por el usuario pinkachu bajo licencia Apache 2.0. En el momento de redactar esta ficha, el repositorio no incluye model card con contenido tecnico (unicamente el bloque de metadatos de licencia), no declara pipeline de inferencia, no especifica idiomas soportados y acumula 0 descargas y 0 "likes". Se trata, por tanto, de una publicacion sin documentacion asociada que permita verificar arquitectura, datos de entrenamiento o rendimiento.

El unico indicio sobre el tamano del modelo es el sufijo "12B" del propio identificador del repositorio, que sugiere del orden de 12.000 millones de parametros, pero este dato no aparece confirmado en ningun artefacto publicado (ni config.json, ni model card, ni tabla de parametros). Cualquier afirmacion sobre arquitectura, ventana de contexto, tokenizador o regimen de entrenamiento seria especulativa y no se incluye en esta ficha.

La relevancia practica del modelo es hoy limitada: al no haber model card, ejemplos de uso, pesos en formatos cuantizados ni resultados de evaluacion, no es posible recomendarlo para produccion ni para evaluacion comparativa sin una inspeccion directa del repositorio (descarga de config.json, tokenizer_config.json e inspeccion de los pesos). Esta ficha documenta precisamente ese estado de incertidumbre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el identificador "12B" sugiere ~12.000 millones, sin confirmar) |
| Parametros activos | no disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se han publicado pesos GGUF, AWQ, GPTQ ni similar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

Otros metadatos del repositorio: ID `pinkachu/Cirque-12B`, region declarada `us`, fecha de creacion 2026-10-19T16:23:33Z (sin actualizaciones posteriores), 0 descargas, 0 likes.

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La model card del repositorio no contiene descripcion tecnica, diagrama, ni referencia a un paper o blog de entrenamiento; no hay datos sobre si se trata de un transformer denso, un MoE, un modelo hibrido SSM/attention o una variante de atencion lineal.

Tampoco hay informacion sobre el corpus de entrenamiento (numero de tokens, composicion, idiomas), sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o RLVR, ni sobre innovaciones de decodificacion (decodificacion especulativa, decodificacion multi-token, etc.). Cualquier reconstruccion de estas caracteristicas requeriria inspeccionar directamente los archivos del repositorio (`config.json`, `generation_config.json`, `tokenizer_config.json`) o los pesos.

## Capacidades

- Generacion de texto: no confirmada documentalmente; el repositorio no declara pipeline de inferencia.
- Razonamiento, codigo, matematicas: sin datos de evaluacion ni ejemplos que lo respalden.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades multimodales (vision, audio): no disponible; no se declaran modulos de proyeccion ni torres visuales.
- Modo "thinking" o razonamiento explicito: no disponible.

## Casos de uso

No es posible recomendar casos de uso concretos sin informacion verificable sobre las capacidades del modelo. Los siguientes escenarios son los que requeririan validacion previa antes de cualquier adopcion:

- Evaluacion exploratoria en laboratorio: descargar los pesos, inspeccionar `config.json` y el tokenizador, y ejecutar una bateria propia de prompts para determinar capacidades reales de generacion y contexto efectivo.
- Clasificacion y etiquetado de texto: solo si las pruebas propias confirman calidad suficiente; no hay evidencia publicada de ello.
- Generacion de codigo en pipelines internos: requeriria verificar previamente el soporte de tool calling y la tasa de codigo ejecutable, hoy desconocidas.
- Fine-tuning sobre dominio propio: la licencia Apache 2.0 permite tecnicamente el ajuste y la redistribucion, lo que convierte al checkpoint en candidato para experimentacion, no para despliegue directo.
- Destilacion o investigación academica sobre modelos de ~12B: util como punto de partida si se confirma el tamano, con la salvedad de la ausencia de documentacion sobre procedencia de datos.
- Despliegue en produccion: no recomendado en el estado actual, al no existir model card, evaluaciones ni pesos cuantizados publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las siguientes cifras son estimaciones aritmeticas derivadas del supuesto de ~12.000 millones de parametros (inferido del nombre del repositorio) y no de especificaciones confirmadas. Si el modelo resultase ser MoE con pocos parametros activos, los requisitos de computo serian inferiores a los indicados.

- VRAM para inferencia en FP16/BF16: aproximadamente 24 GB solo para pesos, mas KV cache y activaciones; en la practica, 28-32 GB para contextos moderados.
- VRAM en INT8: aproximadamente 12-13 GB de pesos; en torno a 16 GB con overhead.
- VRAM en cuantizacion de 4 bits: aproximadamente 6,5-7,5 GB de pesos; viable en GPUs consumer de 8-12 GB con contexto corto.
- GPUs recomendadas (bajo el supuesto de 12B denso): A100 40/80 GB, H100 80 GB y L40S para servicio concurrente; RTX 4090 (24 GB) para FP16 en una sola tarjeta con contexto limitado; RTX 3090/4080 para cuantizacion de 8 bits; RTX 3060 12 GB o RTX 4060 Ti 16 GB para 4 bits.
- Cabe en GPU consumer: previsiblemente si, en cuantizaciones de 4-8 bits, siempre que existan pesos convertidos (hoy no publicados; habria que generarlos con llama.cpp o similar a partir de los pesos originales).
- Opciones de despliegue: no hay artefactos preparados para vLLM, TGI, llama.cpp, Ollama ni LM Studio. Seria necesario convertir los pesos manualmente y, en el caso de vLLM/TGI, comprobar compatibilidad de arquitectura una vez inspeccionado `config.json`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa: se desconocen parametros confirmados, contexto, licencia de datos y resultados de evaluacion del modelo. A modo de referencia de categoria (modelos abiertos de ~12B con licencia permisiva), la comparacion queda bloqueada por la falta de datos del lado de Cirque-12B.

| Modelo | Parametros | Contexto | Licencia | Datos publicos de rendimiento | Disponibilidad de pesos cuantizados |
|---|---|---|---|---|---|
| Cirque-12B | no disponible (nombre sugiere ~12B) | no disponible | Apache 2.0 | no disponible | no disponible |
| Mistral-Nemo-12B (referencia de categoria) | 12B | 128k | Apache 2.0 | si, publicados por el autor | si |
| Gemma-2-12B (referencia de categoria) | 12B | 8k | Gemma Terms | si, publicados por el autor | si |
| Qwen2.5-14B (referencia de categoria) | 14B | 32k (128k en variantes) | Apache 2.0 en la mayoria de tamanos | si, publicados por el autor | si |

Las filas de referencia se incluyen unicamente para contextualizar la categoria de tamano; no implican equivalencia funcional con Cirque-12B.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, por lo que no puede evaluarse el riesgo de sesgos, la procedencia del corpus ni posibles contaminaciones de benchmarks.
- Riesgo de alucinacion: desconocido y no caracterizado; sin evaluaciones publicadas no puede acotarse la tasa de fabricacion de hechos.
- Capacidades y limites de contexto no verificados: no debe asumirse ninguna ventana de contexto concreta.
- Idiomas no declarados: no hay garantia de competencia en castellano ni en ningun otro idioma.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia; sin embargo, el autor no ofrece garantias sobre la licencia de los datos de entrenamiento ni sobre la procedencia de los pesos, lo que traslada el riesgo legal al usuario.
- Repositorio sin traccion (0 descargas, 0 likes) y sin actualizaciones desde su creacion: no hay senal de mantenimiento ni de soporte.
- Posible incoherencia entre el nombre "12B" y el contenido real del repositorio: conviene verificar el numero de parametros antes de planificar hardware.
- No apto para produccion en el estado actual: sin evaluaciones, sin cuantizaciones publicadas y sin documentacion de comportamiento en dominios sensibles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pinkachu/Cirque-12B
- Model card del autor: sin contenido tecnico (solo metadatos de licencia Apache 2.0)
- Paper, blog de entrenamiento, repositorio de codigo o demo: no disponibles en la informacion proporcionada
