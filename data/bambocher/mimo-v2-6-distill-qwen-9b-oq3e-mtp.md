# bambocher/MiMo-V2.6-Distill-Qwen-9B-oQ3e-mtp

## Resumen

MiMo-V2.6-Distill-Qwen-9B-oQ3e-mtp es una cuantizacion mixta del modelo bambocher/MiMo-V2.6-Distill-Qwen-9B, un modelo destilado de aproximadamente 9.653 millones de parametros construido sobre la arquitectura Qwen (etiqueta `qwen3_5`). El checkpoint lo publica el usuario bambocher y ha sido generado con la herramienta oQ (oMLX v0.7.3), que aplica cuantizacion de precision mixta por capas en lugar de un unico nivel de bits para todo el modelo. El resultado es un checkpoint de 5.077 GiB con una media efectiva de 4.518 bits por peso, pensado para ejecutarse en Apple Silicon mediante la libreria MLX.

La relevancia de esta ficha no esta en el modelo base sino en la tecnica de compresion: oQ asigna 3 bits a la mayor parte de los pesos (67,5 %), reserva 4, 5 y 6 bits para capas sensibles y mantiene en BF16 un 5,08 % de los parametros (0,491B), presumiblemente embeddings, normalizaciones o cabezas criticas. El checkpoint incluye ademas una cabeza MTP (multi-token prediction) de 0,243B y un modulo de vision de 0,456B, lo que indica que el modelo base es multimodal.

Se trata de un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, sin model card mas alla de la tabla de cuantizacion y sin licencia declarada. Es util para quien quiera evaluar el modelo base destilado en hardware Apple con un consumo de memoria contenido, pero no debe tratarse como un modelo de referencia ni como un checkpoint listo para produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen (tag `qwen3_5`); incluye modulo de vision y cabeza MTP |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta: affine 3/4/5/6/8 bits con grupo 64, mas pesos en BF16; media efectiva 4,518 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria MLX) |

Desglose de almacenamiento:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954B | 4,354 GB / 4,055 GiB |
| Vision | 0,456B | 0,912 GB / 0,849 GiB |
| Cabeza MTP | 0,243B | 0,185 GB / 0,172 GiB |
| Total | 9,653B | 5,451 GB / 5,077 GiB |

Distribucion por precision:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits efectivos/peso |
|---|---|---|---|---|
| Affine 3-bit, grupo 64 | 6,520B | 67,544 % | 2,657 GiB | 3,50 |
| Affine 4-bit, grupo 64 | 1,697B | 17,576 % | 0,889 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 0,844B | 8,747 % | 0,541 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 0,101B | 1,043 % | 0,076 GiB | 6,50 |
| Affine 8-bit, grupo 64 | 0,001B | 0,008 % | 0,001 GiB | 8,50 |
| BF16 | 0,491B | 5,083 % | 0,914 GiB | 16,00 |
| Total | 9,653B | 100 % | 5,077 GiB | 4,518 |

## Arquitectura y entrenamiento

El checkpoint deriva de bambocher/MiMo-V2.6-Distill-Qwen-9B, un modelo destilado con etiqueta de arquitectura `qwen3_5` y 9,653B parametros. La presencia de un modulo de vision de 0,456B y de una cabeza MTP de 0,243B confirma que el modelo base es multimodal y que fue entrenado con un objetivo de prediccion multi-token, una tecnica habitual para acelerar la decodificacion especulativa. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO; la model card del checkpoint cuantizado no los documenta y el modelo base no aporta datos en la informacion disponible.

La innovacion tecnica de esta publicacion es la cuantizacion mixta de oQ (oMLX v0.7.3). En lugar de aplicar un unico nivel de bits, la herramienta asigna precision de forma no uniforme: el 67,5 % de los pesos queda en 3 bits, un 17,6 % en 4 bits, un 8,7 % en 5 bits y un 5,1 % se conserva en BF16. Todos los tensores cuantizados usan cuantizacion affine con tamano de grupo 64, lo que limita el error de redondeo por bloques pequenos de pesos. El resultado es un checkpoint de 5,077 GiB que ocupa aproximadamente la mitad de lo que requeriria una version BF16 del mismo modelo, a costa de una perdida de fidelidad que no se ha cuantificado en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un LLM denso de 9,6B, por lo que se espera capacidad de conversacion multi-turno y razonamiento general, aunque no hay evaluaciones publicadas en este checkpoint.
- Procesamiento de vision: el checkpoint incluye un modulo de vision de 0,456B, lo que indica soporte de entrada de imagenes en el modelo base.
- Prediccion multi-token (MTP): la cabeza MTP de 0,243B permite generar varios tokens por paso, lo que en la practica se traduce en decodificacion especulativa y mayor throughput cuando el runtime lo aprovecha.
- Destilacion: al ser un modelo destilado, se espera un comportamiento mas compacto que el modelo profesor del que proviene, aunque no se documenta cual es.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas del repo esta vacio.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta empaquetado para MLX y ocupa 5,077 GiB, por lo que cabe en Macs con 16 GB de memoria unificada o mas, permitiendo ejecutar un modelo de 9,6B en un portatil sin GPU dedicada.
- Prototipado de aplicaciones multimodales: el modulo de vision incluido permite experimentar con tareas imagen-texto en local antes de escalar a un modelo mayor o a un servicio en la nube.
- Evaluacion de cuantizacion mixta: sirve como caso de estudio para medir la perdida de calidad de oQ frente al modelo base en BF16, comparando respuestas en tareas de razonamiento y codigo.
- Decodificacion especulativa con MTP: la cabeza MTP permite probar tecnicas de generacion multi-token en MLX y medir la ganancia de throughput frente a la decodificacion autoregresiva clasica.
- Asistente de codigo en local: un modelo de 9,6B cuantizado a 4,5 bits efectivos es viable para autocompletado y explicacion de codigo en un entorno de desarrollo sin conexion, siempre que se valide su calidad real.
- Filtrado y clasificacion de documentos: con 5 GB de huella de memoria, el modelo puede desplegarse en un equipo de sobremesa para tareas de extraccion y resumen por lotes, sin depender de APIs externas.
- Experimentacion academica con destilacion: util para investigadores que quieran estudiar como se comporta un modelo destilado de 9,6B bajo cuantizacion agresiva en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria necesaria para inferencia: 5,077 GiB de pesos mas overhead de activaciones y cache KV; en la practica, entre 6 y 8 GB para contextos moderados.
- Cabe en GPUs de consumo: si, en cualquier Mac con 16 GB o mas de memoria unificada (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No esta pensado para GPUs NVIDIA, ya que el formato es MLX.
- GPU recomendadas: Apple Silicon con MLX; el rendimiento escala con el ancho de banda de memoria del chip (M-series Pro y Max son las opciones mas adecuadas).
- Opciones de despliegue: MLX y oMLX son los runtimes naturales; llama.cpp, vLLM, TGI y Ollama no soportan directamente este formato sin conversion previa a GGUF u otro formato.
- Latencia y throughput estimados: no disponibles; dependen del chip Apple concreto y del uso o no de la cabeza MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-oQ3e-mtp | 9,653B | No disponible | No disponible | safetensors MLX | Cuantizacion mixta 4,518 bits/peso, incluye vision y MTP |
| bambocher/MiMo-V2.6-Distill-Qwen-9B (base) | 9,653B | No disponible | No disponible | safetensors | Version sin cuantizar del mismo modelo; referencia para medir la perdida de calidad |
| Qwen3-8B (familia Qwen) | ~8B | No disponible en esta ficha | No disponible | safetensors, GGUF | Alternativa de tamano similar con amplio ecosistema de herramientas, aunque sin relacion directa con este checkpoint |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 3 bits en el 67,5 % de los pesos puede degradar tareas sensibles a precision, como matematicas, codigo o razonamiento de varios pasos; no se han publicado evaluaciones que cuantifiquen esa perdida.
- El checkpoint tiene cero descargas y cero likes, y no incluye model card mas alla de la tabla de cuantizacion; no hay validacion comunitaria de su calidad.
- La licencia no esta declarada, por lo que no se puede asumir uso comercial sin consultar la licencia del modelo base bambocher/MiMo-V2.6-Distill-Qwen-9B.
- El campo de idiomas esta vacio; no hay garantia documentada de soporte multilingue ni de comportamiento en castellano.
- No se documenta la longitud de contexto soportada, lo que impide planificar aplicaciones con ventanas largas sin pruebas empiricas.
- El formato es exclusivo de MLX; no es portable a ecosistemas CUDA sin conversion y posible perdida de fidelidad.
- Riesgo de alucinacion inherente a los modelos de lenguaje destilados y cuantizados, agravado por la falta de evaluaciones publicadas.
- La cabeza MTP solo aporta ventajas si el runtime la aprovecha; en caso contrario, anade 0,185 GB de peso muerto.

## Enlaces

- Hugging Face (checkpoint cuantizado): https://huggingface.co/bambocher/MiMo-V2.6-Distill-Qwen-9B-oQ3e-mtp
- Modelo base: https://huggingface.co/bambocher/MiMo-V2.6-Distill-Qwen-9B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
