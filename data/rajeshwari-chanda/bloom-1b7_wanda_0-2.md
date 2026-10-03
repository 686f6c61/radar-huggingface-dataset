# Rajeshwari-Chanda/bloom-1b7_wanda_0.2

## Resumen

Este repositorio contiene un checkpoint derivado de BLOOM-1b7, el modelo decoder-only de 1.722 millones de parametros publicado originalmente por BigScience. El nombre del artefacto, `bloom-1b7_wanda_0.2`, sugiere que se ha aplicado sobre el modelo base la tecnica de poda Wanda con una tasa de esparsidad de 0,2 (es decir, un 20 % de los pesos puestos a cero), aunque el autor no documenta el procedimiento en la model card, que es la plantilla autogenerada de HuggingFace y esta vacia en todos sus apartados.

El interes de la ficha es, por tanto, limitado y fundamentalmente metodologico: sirve como ejemplo de publicacion de un modelo podado sin documentacion asociada, algo relevante para quien investiga tecnicas de compresion de transformers. No hay evidencia de entrenamiento adicional, destilado ni ajuste fino; el numero de parametros del checkpoint (1.722.408.960) es practicamente identico al del BLOOM-1b7 original (1.722.410.240), lo que confirma que se trata de una poda no estructurada y no de una reduccion estructural del grafo.

El modelo no tiene descargas ni likes en el momento de redactar esta ficha, no declara licencia ni idiomas, y la busqueda web no ha devuelto ningun resultado relevante sobre el (los enlaces encontrados corresponden a un software de escritura sin relacion alguna). Cualquier uso en produccion deberia partir de esta ausencia total de garantias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia BLOOM), con embeddings posicionales ALiBi; dato del modelo base, no confirmado en la model card de este repositorio |
| Parametros totales | 1.722.408.960 (confirmado en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base BLOOM-1b7 usa 2048 tokens |
| Tipos de cuantizacion | no disponible; al ser un checkpoint en transformers/safetensors, admite cuantizacion a posteriori (INT8, INT4) mediante herramientas externas, aunque la esparsidad no estructurada puede degradarse con los esquemas habituales |
| Idiomas soportados | no disponible en la model card; el modelo base BLOOM fue entrenado sobre 46 lenguajes naturales y 13 lenguajes de programacion |
| Licencia | no disponible (el repositorio no declara licencia; BLOOM se publica bajo BigScience BLOOM RAIL 1.0, pero este checkpoint derivado no la replica de forma explicita) |
| Formato de pesos | safetensors, compatible con la libreria transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia BLOOM: un transformer decoder-only con normalizacion previa a la atencion y al MLP, activacion GeLU, embeddings posicionales ALiBi (que permiten extrapolar mas alla de la ventana de entrenamiento) y atencion multi-cabeza completa, sin variantes MQA o GQA. BLOOM-1b7 tiene 24 capas, un tamano oculto de 2048, 16 cabezas de atencion y un vocabulario de 250.880 tokens. El modelo base fue entrenado sobre el corpus ROOTS con aproximadamente 350.000 millones de tokens, con un regimen mixto en FP16 y BF16, y los modelos grandes de la familia pasaron por ajuste con RLHF.

Sin embargo, no hay ningun dato en la informacion proporcionada que confirme que este checkpoint conserve esas caracteristicas ni que documento el proceso de poda. Lo unico verificable es el recuento de parametros, que coincide casi exactamente con el del modelo base. Esto indica que la poda aplicada, si sigue el metodo Wanda (magnitud del peso multiplicada por la norma de la activacion de entrada, calculada por capa), es no estructurada: los pesos se ponen a cero pero la matriz densa permanece, de modo que no hay ahorro de memoria ni de computo salvo que se empleen kernels dispersos especificos. No se documenta calibracion, numero de muestras usadas, ni si hubo recuperacion posterior mediante fine-tuning.

## Capacidades

- Generacion de texto autoregresiva en el estilo y con las capacidades del BLOOM-1b7 base, asumiendo que la poda no ha degradado el comportamiento de forma severa (no verificado).
- Capacidad multilingue heredada del corpus ROOTS (46 idiomas), con especial atencion a ingles, frances, castellano, portugues, hindi y arabe, entre otros; no declarada por el autor en esta ficha.
- Generacion de codigo, en la medida en que el base incluye 13 lenguajes de programacion en su entrenamiento; no verificado tras la poda.
- Soporte de tool calling y function calling: no disponible; BLOOM-1b7 no tiene plantilla de herramientas entrenada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta ningun modo de pensamiento ni bucle de razonamiento extendido.
- Capacidades de vision o audio: no disponibles.
- Modos especiales (thinking mode, decodificacion especulativa nativa, atencion lineal): no disponibles.

## Casos de uso

- Investigacion en compresion de modelos: el caso de uso mas realista. Sirve como artefacto de estudio para medir el impacto de una poda Wanda al 20 % sobre un transformer de 1,7 B de parametros, comparando perplejidad y tareas downstream frente al checkpoint `bigscience/bloom-1b7` sin podar.
- Experimentos academicos de evaluacion de esparsidad: util para reproducir curvas de degradacion frente a la tasa de poda, siempre que el autor publique la metodologia (actualmente no lo hace).
- Docencia sobre ciclo de vida de modelos: permite ilustrar en clase como se sube un checkpoint derivado a HuggingFace sin model card, sin licencia y sin metricas, y por que eso es un problema de trazabilidad.
- Pruebas de pipeline en transformers: sirve para validar que un flujo de carga con `AutoModelForCausalLM` y `safetensors` funciona antes de sustituir el modelo por uno en produccion.
- Inferencia local de bajo coste tras cuantizacion: con aproximadamente 3,4 GB en FP16 o 1,7 GB en INT8, puede desplegarse en equipos modestos, aunque la calidad esperada es la de un modelo de 2022 con 1,7 B de parametros y poda adicional.
- Generacion de texto en tareas poco exigentes con revisión humana: borradores, resúmenes cortos o completado de texto en ingles, siempre con validacion posterior.
- Comparacion de formatos de pesos: util para medir tiempos de carga, tamano en disco y overhead de memoria entre safetensors denso con esparsidad y una version en GGUF cuantizada.
- No se recomienda para atencion al cliente, generacion de codigo en produccion, agentes autonomos ni extraccion de informacion critica: no hay evaluacion, no hay licencia clara y no hay garantia de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye la seccion de evaluacion (aparece como `[More Information Needed]`), no hay tabla de resultados y la busqueda web no ha devuelto ningun articulo, blog o repositorio que reporte metricas de este checkpoint. No se dispone, por tanto, de MMLU, HumanEval, GSM8K ni de perplejidad medida.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 6,9 GB solo para pesos.
- VRAM estimada en FP16 o BF16: aproximadamente 3,4 GB para pesos, mas la cache KV.
- VRAM estimada en INT8: aproximadamente 1,7 GB para pesos; en INT4, en torno a 0,9 GB, siempre que el esquema de cuantizacion no se vea penalizado por la esparsidad no estructurada.
- Cache KV: con la arquitectura del base (24 capas, 16 cabezas, head dim 128, atencion multi-cabeza completa), ocupa unos 192 KiB por token en FP16, es decir, alrededor de 384 MiB con la ventana completa de 2048 tokens. Es un consumo relevante para un modelo de este tamano y conviene tenerlo en cuenta si se alarga el contexto.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM funciona sin problema; RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 24 GB son mas que suficientes. Para lotes grandes o servicio concurrente, una A10G, L4 o incluso una A100 quedan sobredimensionadas para este tamano.
- Si cabe en GPU consumer: si, con holgura, incluidas GTX 1660 de 6 GB en cuantizacion INT8 y placas integradas con memoria unificada de 8 GB o mas via llama.cpp.
- Opciones de despliegue: transformers (formato nativo), text-generation-inference (el tag `text-generation-inference` esta declarado), text-generation-webui, vLLM con soporte de BLOOM. La conversion a GGUF para llama.cpp u Ollama no esta publicada y tendria que hacerse manualmente, con la advertencia de que la esparsidad no estructurada se pierde o se diluye en los esquemas de cuantizacion por bloques.
- Latencia y throughput: no disponibles. No se han publicado mediciones y, al no existir kernels dispersos estandar para este checkpoint, el rendimiento esperado es practicamente el mismo que el de un BLOOM-1b7 denso del mismo tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Rajeshwari-Chanda/bloom-1b7_wanda_0.2 | 1,72 B | no disponible (base: 2048) | no disponible | HuggingFace, 0 descargas | Poda Wanda 0,2 sin documentar ni evaluar |
| bigscience/bloom-1b7 | 1,72 B | 2048 | BLOOM RAIL 1.0 | HuggingFace, muy descargado | Modelo base, con evaluacion publica y licencia clara |
| bigscience/bloom-1b1 | 1,07 B | 2048 | BLOOM RAIL 1.0 | HuggingFace | Alternativa mas ligera de la misma familia |
| TinyLlama-1.1B-Chat | 1,10 B | 2048 | Apache 2.0 | HuggingFace | Entrenado con 3 T tokens, muy superior en generacion actual y con licencia permisiva |
| Qwen2.5-1.5B | 1,54 B | 32.768 | Apache 2.0 (segun variante) | HuggingFace | Contexto mucho mayor y rendimiento muy superior en codigo y matematicas |

En rendimiento no hay comparacion posible porque este checkpoint no publica metricas. En terminos de licencia, cualquier alternativa de la tabla ofrece condiciones mas claras que este repositorio, que no declara ninguna.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada y no contiene informacion sobre datos, entrenamiento, evaluacion ni uso previsto.
- Licencia no declarada: no se especifica bajo que terminos puede usarse el modelo. Esto impide legalmente su uso comercial sin aclaracion previa del autor, y ademas deja en el aire la herencia de la licencia BLOOM RAIL 1.0 del modelo base, que incluye restricciones de uso.
- Idiomas no declarados: no se puede asumir cobertura multilingue, aunque el base la tenga.
- Riesgo de alucinacion elevado: es un modelo de 1,7 B de parametros de 2022, sin ajuste de instrucciones ni RLHF visible, y con una poda adicional que probablemente degrada la coherencia en generaciones largas.
- Degradacion no medida: no hay ninguna metrica que cuantifique el dano causado por la poda. Es imposible saber si la perdida de calidad es del 2 % o del 30 %.
- Esparsidad no estructurada: la mayoria de frameworks de inferencia no aprovechan los ceros, de modo que no se obtiene ahorro real de VRAM ni de computo frente al modelo base. Los beneficios son teoricos salvo uso de kernels especificos.
- Interaccion con cuantizacion: al convertir a INT8 o INT4, los pesos ya podados pueden sufrir una degradacion acumulada, y muchos algoritmos de cuantizacion asumen densidades normales.
- Sesgos conocidos: los del corpus ROOTS de BLOOM, ampliamente documentados (sesgos de genero, raza y religion en textos en ingles y en menor medida en otras lenguas). No hay ninguna evaluacion especifica para este checkpoint.
- Contexto limitado si se confirma el del base: 2048 tokens, insuficiente para tareas de contexto largo.
- Sin garantias de produccion: cero descargas, cero likes, cero historial de uso. No deberia integrarse en ningun sistema sin una evaluacion propia exhaustiva.
- Fecha de creacion anomala: el repositorio figura creado el 2026-10-03, lo que puede indicar un error en los metadatos o una subida con reloj incorrecto; conviene verificarlo antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rajeshwari-Chanda/bloom-1b7_wanda_0.2
- Modelo base BLOOM-1b7: https://huggingface.co/bigscience/bloom-1b7
- Repositorio oficial de BLOOM: https://github.com/bigscience-workshop/bigscience
- Paper de BLOOM (BigScience Workshop, 2022): https://arxiv.org/abs/2211.05100
- Paper de Wanda (Sun et al., 2023), metodo de poda al que apunta el nombre del checkpoint: https://arxiv.org/abs/2306.11695
- Paper citado en las etiquetas del repositorio, Lacoste et al. (2019) sobre impacto ambiental: https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de ML: https://mlco2.github.io/impact
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo. Los resultados devueltos corresponden a WriteControl, un software de escritura sin relacion con el modelo.
