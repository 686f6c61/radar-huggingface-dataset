# hletrd/Qwen3-8B-BFP4

## Resumen

Qwen3-8B-BFP4 es una version cuantizada del modelo Qwen3-8B de Alibaba Qwen, publicada por el usuario hletrd (Xylolabs). El checkpoint no es una cuantizacion convencional de enteros, sino un redondeo de los pesos al formato block-float bfloat4_b, pensado para inferencia en NPUs que ejecutan formatos block-float de forma nativa. Los ficheros almacenan valores bf16 que caen exactamente sobre la rejilla block-float de cada matriz, de modo que el modelo se carga en `transformers` como el modelo base y computa lo mismo que el modelo redondeado.

El modelo conserva la arquitectura y el tamano del Qwen3-8B original: 8.190.735.360 parametros totales y un repositorio de 16,4 GB en safetensors. La innovacion esta en el esquema de cuantizacion: bloques de 16 valores comparten un exponente de 8 bits y cada valor mantiene signo y mantisa de 3 bits, lo que da 4,5 bits por peso en las proyecciones cuantizadas y un promedio de 6,25 bits por peso contando embedding y cabeza de salida.

Es relevante para desarrolladores que trabajen con aceleradores que soportan block-float (bfloat4_b, bfloat8_b) y quieran un checkpoint que se comporte como el modelo base en herramientas estandar mientras reduce el peso empaquetado a 6,397 GB. No es un modelo nuevo: es un artefacto de compresion con licencia Apache 2.0, derivado del Qwen3-8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), 36 capas; pesos redondeados a block-float bfloat4_b |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del Qwen3-8B base) |
| Tipos de cuantizacion | block-float bfloat4_b (4,5 bits/peso en proyecciones), bfloat8_b mencionado como formato alternativo; GPTQ como metodo de redondeo |
| Idiomas soportados | no disponibles (la calibracion uso WikiText-2 en ingles y articulos de Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (valores bf16 sobre rejilla block-float); `quant4.json` con el formato por capa |

## Arquitectura y entrenamiento

El modelo base Qwen3-8B es un transformer decoder-only de 36 capas. Esta version no reentrena el modelo: aplica GPTQ (Frantar et al., 2022) por proyeccion para redondear los pesos al formato bfloat4_b. En GPTQ se procesan los canales de entrada en orden decreciente de la diagonal del Hessiano, con bloques de 128 columnas y un damping de 0,1 de la media de la diagonal. Para bfloat4_b y bfloat8_b, los bloques de una columna son sus grupos de 16 canales de salida, y el exponente de cada bloque se elige a partir de la columna actualizada exactamente como lo hara el empaquetador.

La busqueda de exponente prueba, para cada bloque, el exponente de su valor mayor y uno inferior (que recorta los valores mayores y reduce a la mitad el paso para el resto), y conserva el de menor error. Todos los valores producidos son exactamente representables en el formato. La calibracion uso 65.536 tokens de WikiText-2 (train) y articulos de Wikipedia en coreano, ejecutados a traves del modelo en bf16; ninguno de esos textos aparece en la evaluacion.

En cuanto a los formatos: las proyecciones de atencion q, k, v y o (36 capas), las proyecciones MLP gate y up (36 capas) y MLP down (36 capas) usan bfloat4_b; la cabeza LM usa bf16; embedding, normas, sesgos y el resto de tensores permanecen en bf16 como en el modelo base. bfloat4_b usa bloques de 16 valores (16 canales de salida consecutivos de un canal de entrada) que comparten un exponente de 8 bits, con signo y mantisa de 3 bits por valor (4,5 bits por peso). bfloat8_b es igual pero con mantisa de 7 bits (8,5 bits por peso). El promedio de bits por peso leido, incluyendo embedding y cabeza, es 6,25; empaquetado ocupa 6,397 GB, aunque los ficheros del repositorio lo almacenan como bf16 (16,4 GB).

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del Qwen3-8B base.
- Razonamiento con modo thinking (la evaluacion del autor incluye 7 prompts con thinking activado y 33 con thinking desactivado).
- Capacidades de codigo y matematicas propias del modelo base Qwen3-8B (no se documentan resultados especificos en esta ficha).
- Soporte de plantilla de chat (chat template) para turnos de conversacion, usado en la evaluacion.
- Capacidades multilingues: la calibracion incluye coreano e ingles; el conjunto completo de idiomas del modelo base no se detalla.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Vision o audio: no disponible.

## Casos de uso

- Inferencia en NPUs con soporte nativo de block-float: el checkpoint esta pensado para dispositivos que empaquetan bfloat4_b sin redondeo adicional, de modo que se obtiene el comportamiento del modelo redondeado con el menor coste de memoria posible (6,397 GB empaquetado).
- Despliegue en `transformers` sin cambios de codigo: al almacenar valores bf16 sobre la rejilla block-float, se carga con `AutoModelForCausalLM.from_pretrained` y `dtype="bfloat16"`, lo que facilita prototipado y validacion frente al modelo base.
- Evaluacion comparativa de cuantizacion: sirve como referencia para medir la deriva respecto a bf16 con metricas de KL y acuerdo top-1, util en equipos que investigan formatos de compresion.
- Generacion de texto conversacional en ingles y coreano: la calibracion y la evaluacion cubren ambos idiomas, por lo que es adecuado para asistentes en esos mercados.
- Sustitucion del modelo base en pipelines existentes de Qwen3-8B cuando el objetivo es reducir el ancho de banda de pesos en hardware compatible con block-float.
- Experimentacion con decodificacion greedy y modo thinking: la model card documenta pruebas con thinking activado y desactivado, lo que permite reproducir la evaluacion del autor.
- Distribucion de artefactos derivados: al ser Apache 2.0, puede integrarse en productos comerciales con las obligaciones de atribucion correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor publica metricas de fidelidad respecto al modelo bf16:

| Metrica | Este modelo | Q4_K_M (llama.cpp) |
|---|---:|---:|
| Bits por peso | 6,25 | 4,90 |
| KL media a bf16 | 0,0449 | 0,04236 |
| Acuerdo top-1 (%) | 91,26 | 91,24 |
| Respuestas perdidas (de 33 + 7) | 0 | 0 |

La KL media se calcula como KL(bf16 ‖ modelo) sobre todo el vocabulario en cada posicion puntuada (16.240 posiciones) de cuatro textos: ingles y coreano, cada uno como texto plano y como respuesta de un turno de chat en la plantilla del modelo, con thinking desactivado. El acuerdo top-1 mide con que frecuencia el token mas probable del modelo coincide con el de bf16. Las respuestas perdidas corresponden a 33 prompts de respuesta corta con thinking desactivado y 7 con thinking activado, respondidos de forma greedy; un item se pierde cuando bf16 acierta y el modelo no, o la respuesta esta rota. Q4_K_M se genero con `llama-quantize Q4_K_M` desde un GGUF bf16, sin importance matrix. El criterio del autor (KL media como maximo 1,5 veces la de Q4_K_M y como maximo una respuesta perdida mas) se cumple: 1,06 veces la KL media de Q4_K_M. Estas cifras miden cercania al modelo bf16, no rendimiento en tareas.

## Requisitos de hardware

- VRAM estimada: los pesos empaquetados en block-float ocupan 6,397 GB; cargados como bf16 en `transformers` ocupan aproximadamente 16,4 GB, mas overhead de activaciones y cache KV.
- GPU recomendadas: no se especifican en la informacion; el modelo esta orientado a NPUs que ejecutan block-float de forma nativa. Para carga en bf16 se necesita una GPU con al menos 20-24 GB de memoria (por ejemplo, A100, H100 o RTX 4090) segun el contexto.
- Cabe en GPU consumer: si se carga como bf16, una RTX 4090 (24 GB) es el limite practico; con contexto largo puede requerir offload. En hardware block-float, el requisito baja a los 6,397 GB empaquetados.
- Opciones de despliegue: `transformers` (documentado en la model card); la etiqueta `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints. No se documentan instrucciones para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-BFP4 (este) | 8,19 B | no disponible | block-float bfloat4_b (6,25 bits/peso) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B (base) | 8,19 B | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Qwen3-8B Q4_K_M (llama.cpp) | 8,19 B | no disponible | Q4_K_M (4,90 bits/peso) | Apache 2.0 | generado localmente |

La comparativa se limita al modelo base y a la cuantizacion Q4_K_M usada como referencia por el autor, ya que no se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint almacena valores bf16, no empaquetados: el repositorio ocupa 16,4 GB, el triple que los 6,397 GB empaquetados. El ahorro de memoria solo se materializa en hardware que empaqueta block-float de forma nativa.
- La evaluacion se limita a cuatro textos en ingles y coreano y a 40 prompts cortos; no hay benchmarks de tareas, por lo que el rendimiento real en codigo, matematicas o razonamiento largo no esta verificado.
- La KL media (0,0449) es ligeramente superior a la de Q4_K_M (0,04236), aunque dentro del criterio del autor; puede haber deriva acumulada en generaciones largas no medida.
- Riesgo de alucinacion: inherente al modelo base Qwen3-8B; la cuantizacion puede amplificarlo en casos limite no cubiertos por la evaluacion.
- Idiomas: solo se documentan ingles y coreano en calibracion y evaluacion; el comportamiento en castellano u otros idiomas no esta validado.
- Licencia Apache 2.0: permite uso comercial con atribucion; el autor indica que se distribuye "as is", sin garantia de ningun tipo.
- La model card no documenta sesgos, limitaciones de contexto ni restricciones adicionales mas alla de las del modelo base.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/hletrd/Qwen3-8B-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Paper de GPTQ (Frantar et al., 2022): no disponible como enlace en la informacion proporcionada
