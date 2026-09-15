# Dohyeon1/Qwen3-30B-A3B-Sub-MoE-ngroups96

## Resumen

Dohyeon1/Qwen3-30B-A3B-Sub-MoE-ngroups96 es un checkpoint de generacion de texto publicado en Hugging Face por el usuario Dohyeon1, construido sobre la arquitectura `qwen3_moe` de la libreria transformers. Por el nombre y por el recuento real de pesos alojados en safetensors (30.532.122.624 parametros), se trata de una variante derivada de la familia Qwen3-30B-A3B, un transformer de tipo Mixture of Experts con aproximadamente 30,5 mil millones de parametros totales y del orden de 3 mil millones activos por token. El sufijo "Sub-MoE-ngroups96" sugiere una modificacion de la estructura de enrutamiento o de agrupacion de expertos, aunque la model card no documenta en que consiste exactamente.

El problema que aborda es el habitual de los modelos MoE de escala media: ofrecer calidad cercana a un denso de 30B con un coste de computo por token mucho menor, al activar solo una fraccion de los expertos. Sin embargo, esta ficha debe leerse con cautela: la model card es la plantilla automatica de Hugging Face, sin ningun campo cumplimentado (ni licencia, ni idiomas, ni datos de entrenamiento, ni evaluacion), el repositorio acumula 0 descargas y 0 "likes" y no se ha localizado documentacion externa, paper ni publicacion asociada en la busqueda realizada.

Es relevante ahora unicamente como objeto de evaluacion experimental: es un derivado no validado de una arquitectura conocida, sin licencia declarada y sin resultados publicados. Cualquier uso en produccion requiere auditoria previa del autor, verificacion de pesos y analisis legal de la licencia de la obra derivada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (clase `qwen3_moe` de transformers); variante "Sub-MoE" con "ngroups96" segun el nombre del repositorio |
| Parametros totales | 30.532.122.624 (30,53 mil millones), dato real extraido de los safetensors |
| Parametros activos | no disponible (el sufijo "A3B" del nombre apunta a ~3 mil millones activos por token, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; no se publican versiones GGUF, AWQ, GPTQ ni FP8. El peso del repositorio (61,1 GB) es consistente con pesos en bf16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La unica informacion verificable es la etiqueta de arquitectura `qwen3_moe`, que corresponde al soporte de Qwen3 MoE en transformers, y el recuento de parametros de los safetensors. Se trata por tanto de un transformer decoder-only con capas de atencion y capas de mezcla de expertos con enrutamiento disperso (top-k expertos por token). El nombre del repositorio apunta a dos modificaciones respecto al modelo base: una estructura "Sub-MoE" (posiblemente subdivision o jerarquia de expertos) y un parametro `ngroups96`, que en modelos MoE abiertos suele designar el numero de grupos usados en el enrutamiento con restriccion por grupo. No hay documentacion que confirme ninguna de las dos interpretaciones.

No se dispone de informacion sobre datos de entrenamiento: ni numero de tokens, ni composicion del dataset, ni si hubo ajuste por instrucciones, RLHF, DPO u otra etapa de alineamiento. Tampoco se documentan hiperparametros, precision de entrenamiento, infraestructura de computo ni procedimiento de destilado o fusion. Dado que el modelo hereda el nombre del base Qwen3-30B-A3B, es probable que se trate de un ajuste fino, una poda o una reorganizacion de expertos sobre ese checkpoint, pero esto es una hipotesis no confirmada por el autor.

Un detalle operativo relevante es que la modificacion de la estructura MoE puede implicar codigo personalizado no incluido en el repositorio, lo que condicionaria la carga mediante `trust_remote_code` y la compatibilidad con motores de inferencia de alto rendimiento.

## Capacidades

- Generacion de texto autoregresiva y conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` esta presente.
- Razonamiento y codigo: no hay evaluacion publicada; se desconoce si conserva las capacidades del modelo base Qwen3 en matematicas, logica o generacion de codigo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Capacidades especiales (modo "thinking", vision, audio, decodificacion especulativa): no disponible.
- Compatibilidad con endpoints de Hugging Face: si, segun la etiqueta `endpoints_compatible` del repositorio.

## Casos de uso

- Evaluacion comparativa de variantes MoE: el modelo puede usarse en un banco de pruebas interno para medir si la reconfiguracion "Sub-MoE" con 96 grupos altera la calidad frente al Qwen3-30B-A3B original, usando el mismo conjunto de prompts y tareas.
- Investigacion sobre enrutamiento de expertos: al ser una variante de la estructura de mezcla, resulta util para analizar patrones de activacion de expertos, carga por grupo y equilibrio de enrutamiento en un modelo de 30B.
- Generacion de texto en prototipos internos no comerciales: si finalmente se confirma una licencia permisiva, podria emplearse para resumen, redaccion y reescritura de documentos en entornos controlados.
- Base para ajuste fino propio: al tener ~30B totales y ~3B activos, es un candidato razonable para fine-tuning con LoRA sobre una o varias GPU de 80 GB, siempre que la licencia lo permita.
- Servicio de chat con coste de inferencia contenido: si el modelo activa solo una fraccion de parametros por token, el coste por peticion seria inferior al de un denso de 30B, lo que lo hace atractivo para asistentes conversacionales internos.
- Experimentacion con decodificacion en GPU de gama alta: la variante bf16 puede desplegarse en nodos con dos A100 o un H100 para estudiar latencia y throughput antes de invertir en servicio.
- Docencia y auditoria de modelos abiertos: sirve como caso de estudio de un checkpoint sin model card, sin licencia y con 0 descargas, util para ilustrar buenas practicas de publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada, no hay tabla de resultados MMLU, HumanEval, GSM8K, MT-Bench ni similares, y la busqueda web no ha devuelto ninguna referencia tecnica al repositorio. Cualquier cifra que se cite sobre este checkpoint seria una extrapolacion del modelo base y no debe atribuirse a este modelo.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento real de parametros (30,53 mil millones) y del tamano del repositorio; no proceden de mediciones del autor.

- Pesos en bf16/fp16: aproximadamente 61 GB solo en pesos. La memoria total necesaria con cache KV y overhead de runtime se situa en el rango de 68-80 GB.
- Pesos en fp8/int8: aproximadamente 30-31 GB en pesos, mas cache KV.
- Pesos en int4 (GGUF Q4_K_M o similar, previa conversion): aproximadamente 17-19 GB en pesos.
- GPU recomendadas: 2x A100 80 GB o 2x H100 80 GB en bf16 sin cuantizar; 1x H100 80 GB puede ser suficiente en bf16 con contexto corto; 1x A100 40 GB o 1x RTX 6000 Ada 48 GB en fp8/int8.
- Cabe en GPU de consumo: en bf16 no cabe en ninguna GPU de consumo actual (el maximo comercial es 32 GB en RTX 5090). En cuantizacion int4 si cabe en RTX 4090, RTX 3090 o RTX 5090, con 24-32 GB de VRAM.
- Memoria unificada: en int4 podria ejecutarse en equipos Apple Silicon con 32 GB o mas, con rendimiento limitado por ancho de banda.
- Opciones de despliegue: transformers (via principal, dado que la arquitectura declarada es `qwen3_moe`); vLLM, SGLang y TGI solo si soportan la variante "Sub-MoE" concreta, lo cual no esta confirmado; llama.cpp y Ollama unicamente tras convertir los pesos a GGUF, requisito que no esta cubierto por el repositorio.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo, tiempo hasta el primer token ni rendimiento bajo batching.

## Comparativa con modelos similares

Los datos de las alternativas corresponden a la documentacion publica de cada modelo base; no se ha confirmado que el checkpoint analizado herede estas caracteristicas.

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Dohyeon1/Qwen3-30B-A3B-Sub-MoE-ngroups96 | 30,53B totales / no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen3-30B-A3B (base de referencia) | ~30,5B / ~3,3B activos, 128 expertos, 8 activos | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Apache 2.0 | Ampliamente desplegado en vLLM, SGLang, llama.cpp |
| Qwen3-32B (denso, misma familia) | ~32,8B densos | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Apache 2.0 | Ampliamente desplegado |
| Mixtral 8x7B (MoE abierto) | ~46,7B / ~12,9B activos | 32.768 tokens | Apache 2.0 | Ampliamente desplegado |

No es posible comparar rendimiento en tareas porque el checkpoint analizado no publica ninguna evaluacion.

## Limitaciones y advertencias

- Ausencia total de licencia: la model card no declara licencia, lo que impide determinar si el uso comercial esta permitido. En la practica, esto equivale a no tener autorizacion explicita del autor.
- Model card vacia: todos los campos son la plantilla automatica de Hugging Face ("More Information Needed"). No hay informacion sobre datos de entrenamiento, sesgos, usos previstos ni usos fuera de alcance.
- Riesgo de alucinacion: no evaluado. Al no existir benchmarks ni evaluaciones de seguridad, no hay ninguna garantia sobre la fiabilidad factual del modelo.
- Idiomas: se desconoce que idiomas soporta y con que calidad. No se debe asumir que conserva el multilingueismo del modelo base.
- Contexto: se desconoce la ventana de contexto efectiva, dato critico para planificar despliegues con documentos largos.
- Arquitectura modificada: la variante "Sub-MoE" con 96 grupos puede requerir codigo personalizado no incluido en el repositorio y puede no ser compatible con vLLM, SGLang, TGI o llama.cpp sin adaptaciones.
- Validacion nula por la comunidad: 0 descargas y 0 "likes" en el momento de la consulta. No hay terceros que hayan verificado los pesos ni reproducido resultados.
- Procedencia incierta: no se confirma si es un ajuste fino, una poda, una mezcla de expertos o una reorganizacion del Qwen3-30B-A3B. Tampoco se indica si los pesos son funcionales o si el repositorio es un experimento de publicacion.
- Fechas anomalas: la fecha de creacion registrada (2026-09-15) y la de actualizacion, ocho minutos posterior, sugieren una subida automatica o de prueba sin revision posterior.
- Tamano del repositorio: 61,1 GB de safetensors implican un coste de almacenamiento y transferencia considerable antes de saber si el modelo es funcional.
- Recomendacion: antes de cualquier uso, contactar al autor, ejecutar pruebas de generacion y coherencia, verificar la equivalencia con el modelo base en un conjunto de validacion y resolver la situacion legal de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dohyeon1/Qwen3-30B-A3B-Sub-MoE-ngroups96
- Referencia citada en las etiquetas del repositorio (Lacoste et al., 2019, calculadora de impacto de machine learning): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML mencionada en la model card: https://mlco2.github.io/impact
- Informe tecnico de la familia Qwen3 (referencia contextual sobre la arquitectura base, no enlazado desde la model card): https://arxiv.org/abs/2505.09388
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales asociados a este checkpoint en la busqueda web realizada.
