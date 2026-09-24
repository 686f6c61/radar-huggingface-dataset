# Dohyeon1/ERNIE-HC-SMoE-ngroups48-maxcls2

## Resumen

ERNIE-HC-SMoE-ngroups48-maxcls2 es un modelo de generacion de texto publicado en HuggingFace por el usuario Dohyeon1, con un total de 21.825.437.888 parametros (aproximadamente 21,8 mil millones) segun los pesos en formato safetensors. El tag `ernie4_5_moe` de la ficha indica que se apoya en la arquitectura ERNIE 4.5 en su variante de mezcla de expertos (MoE), desarrollada originalmente por Baidu, aunque el autor del repositorio no confirma si se trata de un fine-tuning, una variante reentrenada o una modificacion estructural del modelo base.

El nombre del repositorio incorpora los sufijos `HC-SMoE`, `ngroups48` y `maxcls2`, que sugieren una configuracion de enrutamiento de expertos modificada (posiblemente con 48 grupos de expertos y algun tipo de agrupamiento o clasificacion de expertos limitada a 2), si bien no existe documentacion publicada que describa estos cambios. La model card es la plantilla automatica de HuggingFace y no aporta informacion sobre datos de entrenamiento, hiperparametros, licencia, idiomas soportados ni evaluaciones.

El modelo es relevante unicamente como objeto de estudio para quien quiera inspeccionar variantes experimentales de ERNIE 4.5 MoE: acumula cero descargas y cero likes, el repositorio ocupa 43,7 GB y no incluye cuantizaciones ni artefactos adicionales. Para uso en produccion, la ausencia de licencia explicita y de documentacion tecnica lo convierte en una opcion de riesgo elevado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (tag `ernie4_5_moe`; variante modificada no documentada, sufijo `HC-SMoE`) |
| Parametros totales | 21.825.437.888 (21,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors, sin GGUF ni AWQ/GPTQ publicados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 43,7 GB |
| Libreria de inferencia | transformers |
| Pipeline | text-generation |
| Compatibilidad | endpoints_compatible |

## Arquitectura y entrenamiento

La unica informacion fiable sobre la arquitectura es el tag `ernie4_5_moe`, que vincula el modelo a la familia ERNIE 4.5 MoE de Baidu, y el recuento de parametros de los safetensors. Los modelos ERNIE 4.5 en variante MoE combinan capas de atencion con capas de mezcla de expertos con enrutamiento disperso, de modo que solo una fraccion de los parametros se activa por token; sin embargo, el numero de expertos, el numero de expertos activos por token, la dimension oculta, el numero de capas y la longitud de contexto de este checkpoint concreto no estan declarados en ninguna parte del repositorio.

Los sufijos del identificador (`ngroups48`, `maxcls2`) apuntan a una modificacion del enrutamiento respecto al ERNIE 4.5 MoE original, probablemente una agrupacion en 48 clusters de expertos y una restriccion de seleccion. No hay paper, blog ni README que explique el metodo, por lo que cualquier afirmacion al respecto es especulativa. Tampoco se documenta el proceso de entrenamiento: no hay datos sobre numero de tokens, composicion del corpus, fases de ajuste (SFT, RLHF, DPO) ni regimen de precision. El modelo fue creado y actualizado el mismo dia (23 de septiembre de 2026), lo que sugiere una subida sin trabajo posterior de documentacion.

## Capacidades

- Generacion de texto autoregresiva, segun el pipeline declarado (`text-generation`).
- Procesamiento de lenguaje natural en un unico turno o multi-turno: no confirmado por falta de documentacion.
- Razonamiento, matematicas y generacion de codigo: no confirmado; son capacidades habituales de la familia ERNIE 4.5, pero no hay evaluacion que lo acredite en este checkpoint.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas de la ficha esta vacio).
- Capacidades especiales (modo thinking, vision, audio): no disponible; el pipeline declarado es exclusivamente de texto.
- Inferencia compatible con endpoints de HuggingFace: si, segun el tag `endpoints_compatible`.

## Casos de uso

- Evaluacion comparativa de enrutamiento MoE: el modelo puede usarse como sujeto de prueba para medir como afecta una configuracion de 48 grupos de expertos frente a un MoE estandar del mismo tamano, midiendo distribucion de carga por experto y perplexidad en un corpus de validacion propio.
- Fine-tuning experimental en dominio cerrado: con 21,8 B de parametros totales y pesos en safetensors, es viable aplicar LoRA sobre un dominio especifico (por ejemplo, documentacion tecnica interna) siempre que se resuelva antes la ambiguedad de licencia.
- Generacion de texto en ingles o en el idioma del corpus de ajuste: sin confirmacion de idiomas, cualquier uso multilingue requiere una validacion previa con un conjunto de prueba propio.
- Prototipado en entorno de investigacion: util para estudiar el comportamiento de checkpoints derivados de ERNIE 4.5 MoE sin depender de los pesos originales de Baidu, comparando salidas entre ambos.
- Servicio de inferencia de bajo coste por token: si la fraccion de parametros activos es reducida (patron habitual en MoE), el coste computacional por token puede ser muy inferior al de un modelo denso de 21,8 B, lo que lo haria apto para chatbots de alto volumen, previa verificacion del rendimiento real.
- Analisis de robustez y alucinacion: al carecer de ajuste por RLHF documentado, es un buen candidato para estudios sobre tasa de alucinacion en modelos base frente a modelos alineados.
- Base para destilacion: los pesos pueden servir como profesor en un proceso de destilacion hacia un modelo denso mas pequeno, aunque la licencia no aclarada limita el uso comercial del resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada (todos los campos aparecen como "[More Information Needed]") y la busqueda web no ha devuelto ningun resultado relacionado con el modelo.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parametros (21,8 B) y del tamano del repositorio (43,7 GB), no datos medidos sobre este checkpoint concreto:

- Pesos en bf16/fp16: aproximadamente 43,7 GB. Requiere al menos una GPU de 80 GB (A100 80GB, H100 80GB) o reparto en dos GPU de 40 GB con tensor parallelism.
- Pesos en int8/fp8: aproximadamente 22 GB. Cabe en una RTX 4090 (24 GB), A6000 (48 GB), L40S (48 GB) o A100 40GB, dejando poco margen para cache KV.
- Pesos en 4 bits (si se genera una cuantizacion GGUF Q4_K_M): aproximadamente 11-13 GB. Cabe en RTX 4090, RTX 3090, RTX 4080 Super (16 GB) y en Mac con memoria unificada de 16 GB o superior.
- Pesos en 5-6 bits: aproximadamente 15-18 GB. Cabe en GPU consumer de 24 GB con contexto moderado.
- GPU recomendadas: H100 o A100 80GB para bf16 sin cuantizar; RTX 4090 o L40S para fp8/int8; RTX 4090, 3090 o Apple Silicon de gama alta para cuantizacion de 4 bits.
- Opciones de despliegue: transformers de forma nativa (es la libreria declarada); vLLM o SGLang si la arquitectura MoE es compatible con sus kernels; TGI para servir via API; llama.cpp u Ollama solo tras convertir los safetensors a GGUF, conversion no publicada por el autor.
- Latencia y throughput: no disponibles. Al ser un MoE, el throughput por token depende criticamente del numero de parametros activos, dato que no se ha publicado.

## Comparativa con modelos similares

Los datos de las alternativas provienen de sus respectivas fichas publicas y se incluyen como referencia de categoria; no existe ninguna medicion de este checkpoint que permita una comparacion de rendimiento real.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ERNIE-HC-SMoE-ngroups48-maxcls2 | 21,8 B | no disponible | no disponible | no disponible | safetensors, sin cuantizaciones |
| ERNIE-4.5-21B-A3B (Baidu) | 21 B | 3 B | 128 K | Apache 2.0 | safetensors y GGUF oficiales |
| Qwen3-30B-A3B | 30,5 B | 3,3 B | 128 K | Apache 2.0 | safetensors y GGUF oficiales |
| Mistral Small 3.1 24B | 24 B (denso) | 24 B | 128 K | Apache 2.0 | safetensors y GGUF oficiales |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial, redistribucion ni obras derivadas. Tratarlo como no apto para produccion hasta que el autor aclare los terminos.
- Model card vacia: la ficha es la plantilla automatica de HuggingFace, con todos los campos marcados como "[More Information Needed]". No hay informacion sobre datos de entrenamiento, por lo que no se pueden evaluar sesgos ni contaminacion del corpus.
- Idiomas no declarados: se desconoce que idiomas cubre y con que calidad relativa.
- Riesgo de alucinacion desconocido: no hay evaluacion de veracidad ni constancia de una fase de alineacion (RLHF/DPO), lo que en un modelo base suele implicar mayor propension a generar contenido plausible pero falso.
- Contexto no especificado: sin longitud de contexto declarada no se puede planificar su uso en tareas de documento largo ni en conversaciones multi-turno extensas.
- Cero adopcion: cero descargas y cero likes en el momento de redactar esta ficha, sin issues ni discusiones que permitan contrastar el comportamiento real del checkpoint.
- Modificacion arquitectonica sin documentar: los sufijos `HC-SMoE`, `ngroups48` y `maxcls2` no estan explicados, por lo que la compatibilidad con kernels optimizados (vLLM, SGLang, FlashAttention) es incierta y puede requerir validacion manual.
- Sin cuantizaciones publicadas: desplegarlo en hardware de consumo exige generar primero los GGUF, asumiendo el coste de conversion y la posible perdida de calidad.
- Riesgo de sesgo heredado: al derivar de ERNIE 4.5, podria arrastrar los sesgos del corpus de entrenamiento original y los introducidos en el proceso de ajuste del autor, ninguno de los cuales esta documentado.
- Fecha de creacion futura en los metadatos: la ficha indica 2026-09-23, lo que puede ser un error de marca temporal o una fecha programada; conviene verificar la integridad de los pesos antes de cualquier uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dohyeon1/ERNIE-HC-SMoE-ngroups48-maxcls2
- Paper referenciado en los tags del modelo (Lacoste et al., 2019, calculadora de impacto ambiental; no es un paper sobre el modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML citada en la model card: https://mlco2.github.io/impact
- No se han encontrado en la busqueda web enlaces relevantes al modelo, papers asociados, repositorios de codigo ni demos. Los resultados devueltos no guardan relacion con el modelo.
