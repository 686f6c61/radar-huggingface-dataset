# bambocher/Qwen3.5-0.8B-oQ3-mtp

## Resumen

Qwen3.5-0.8B-oQ3-mtp es una versión cuantizada del modelo Qwen3.5-0.8B (del que no se aportan datos de autoría ni de entrenamiento en la información disponible), publicada por el usuario bambocher en HuggingFace. Se trata de un checkpoint multimodal de 873.438.784 parámetros totales que integra tres componentes diferenciados: un modelo de lenguaje de 0,752B parámetros, un codificador visual de 0,101B y una cabeza MTP (multi-token prediction) de 0,020B. La cuantización se ha realizado con oQ, la herramienta de cuantización de precisión mixta del proyecto oMLX (v0.7.1rc1), y el resultado ocupa únicamente 0,532 GiB en disco.

La particularidad técnica del modelo es su esquema de cuantización mixta: el 75,032% de los pesos lógicos se almacena en affine 3-bit con grupo de 64, mientras que el 11,815% restante se conserva en BF16. Esa combinación arroja un promedio efectivo de 5,232 bits por peso, muy por encima de los 3 bits que sugiere la etiqueta del nombre. La distribución no es casual: el componente de visión concentra 0,187 de los 0,192 GiB que ocupa el bloque BF16, de modo que la torre visual queda prácticamente intacta en precisión original mientras el backbone de lenguaje se comprime de forma agresiva.

El interés del checkpoint es acotado pero concreto: permite ejecutar un modelo multimodal con capacidad de predicción multi-token en Apple Silicon con un consumo de memoria mínimo. No obstante, se trata de una publicación derivada, sin model card sustantiva, sin licencia declarada, sin idiomas especificados y con 11 descargas en el momento de la consulta, por lo que debe tratarse como material experimental y no como un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (familia qwen3_5 segun tags), multimodal con torre de vision y cabeza MTP; detalles de capas y atencion no disponibles |
| Parametros totales | 873.438.784 (0,873B): 0,752B lenguaje + 0,101B vision + 0,020B cabeza MTP |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | oQ mixed-precision (oMLX v0.7.1rc1): affine 3/4/5/6/8-bit con grupo de 64 + BF16; media efectiva 5,232 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (formato MLX); libreria mlx |

Desglose de la cuantizacion, segun la model card:

| Formato de almacenamiento | Pesos logicos | Cuota | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 3-bit, grupo 64 | 0,655B | 75,032% | 0,267 GiB | 3,50 |
| Affine 4-bit, grupo 64 | 0,018B | 2,101% | 0,010 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 0,085B | 9,728% | 0,054 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 0,012B | 1,321% | 0,009 GiB | 6,50 |
| Affine 8-bit, grupo 64 | 0,000B | 0,004% | 0,000 GiB | 8,50 |
| BF16 | 0,103B | 11,815% | 0,192 GiB | 16,00 |
| **Total** | **0,873B** | **100%** | **0,532 GiB** | **5,232** |

Desglose por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 0,752B | 0,356 GB / 0,331 GiB |
| Vision | 0,101B | 0,201 GB / 0,187 GiB |
| Cabeza MTP | 0,020B | 0,015 GB / 0,014 GiB |
| **Total** | **0,873B** | **0,571 GB / 0,532 GiB** |

## Arquitectura y entrenamiento

La informacion disponible no documenta la arquitectura interna del modelo base: no se detallan numero de capas, dimension del hidden state, mecanismo de atencion, tipo de positional encoding ni si emplea mezcla de expertos. Lo que si se puede afirmar a partir de los datos del repositorio es que se trata de un transformer de la familia Qwen3.5 con tres bloques funcionales: un backbone de lenguaje de 0,752B parametros, una torre de vision de 0,101B (lo que confirma capacidad multimodal de entrada de imagen) y una cabeza de prediccion multi-token de 0,020B, asociada habitualmente a decodificacion especulativa o a objetivos de entrenamiento con prediccion de varios tokens por paso.

Tampoco se han publicado datos sobre el proceso de entrenamiento del modelo original ni sobre el de esta version: se desconoce el volumen de tokens, la composicion del corpus, si hubo fases de RLHF, DPO o RL con verificador, y si la cabeza MTP se entreno de forma conjunta o se anadio a posteriori. La unica innovacion tecnica documentada es la propia cuantizacion: oQ aplica precision mixta por tensor en lugar de un unico ancho de bits, asignando 3 bits al grueso del backbone de lenguaje y preservando en BF16 el 11,8% de los pesos, que en la practica corresponde casi integramente a la torre visual (0,187 de los 0,192 GiB en BF16). El resultado es un checkpoint de 0,532 GiB con un promedio de 5,232 bits por peso, un compromiso que prioriza la fidelidad del codificador de imagen sobre la del modelo de lenguaje.

## Capacidades

- Generacion de texto y razonamiento en lenguaje natural, heredados del backbone Qwen3.5-0.8B (el alcance real a esta cuantizacion no esta verificado).
- Procesamiento de imagenes: la presencia de una torre visual de 0,101B implica entrada multimodal (VLM); no se detalla si soporta multiples imagenes por prompt, video o documentos escaneados.
- Prediccion multi-token (cabeza MTP de 0,020B): pensada para decodificacion especulativa o generacion acelerada, siempre que el runtime la soporte.
- Capacidades multilingues: no disponibles; el repositorio no declara lista de idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Comportamiento agentico y razonamiento multi-paso: no disponible; no se documenta modo thinking ni plantillas de chat.
- Capacidades de audio: no disponibles (no se declara componente de audio en el desglose de pesos).

## Casos de uso

- Prototipado de pipelines multimodales en local: con 0,532 GiB de pesos, el checkpoint permite validar en un Mac con Apple Silicon un flujo completo de imagen + texto antes de invertir en un modelo mayor, usando mlx-vlm como runtime.
- Pruebas de decodificacion especulativa: la cabeza MTP incluida permite experimentar con generacion multi-token y medir la tasa de aceptacion frente a decodificacion autoregresiva estandar en un modelo lo bastante pequeno como para iterar rapido.
- Clasificacion y etiquetado de imagenes en el dispositivo: al mantener la torre visual en BF16 y ocupar menos de 1 GiB, encaja en escenarios de privacidad estricta donde las imagenes no pueden salir del equipo (por ejemplo, triaje de documentos internos).
- Descripcion automatica de imagenes para accesibilidad: generacion de texto alternativo en lotes sobre catalogos de imagenes, con la ventaja de que el modelo completo cabe en memoria unificada y no requiere GPU dedicada.
- Filtrado y preprocesado previo a modelos mayores: uso como primera etapa barata para descartar entradas irrelevantes o resumir imagenes antes de enviarlas a un modelo de mayor tamano, reduciendo coste por peticion.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio documenta con detalle la distribucion de bits por tensor, lo que lo convierte en un caso de estudio util para medir el impacto de la precision mixta en tareas concretas frente al modelo sin cuantizar.
- Experimentacion docente y de investigacion: modelo de menos de mil millones de parametros que se ejecuta en portatiles, adecuado para cursos sobre cuantizacion, MLX o arquitecturas multimodales sin necesidad de infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/ memoria estimada para inferencia: los pesos ocupan 0,532 GiB (0,571 GB), por lo que la inferencia completa cabe holgadamente en menos de 1 GiB de memoria, a lo que hay que sumar la cache KV (cuyo tamano depende de la longitud de contexto, dato no disponible).
- GPU recomendadas: el checkpoint esta en formato MLX, lo que lo orienta a Apple Silicon (series M1, M2, M3 y M4) con memoria unificada. Para CUDA seria necesario reconvertir los pesos a otro formato; no se ofrece esa variante en el repositorio.
- Compatibilidad con GPU de consumo: si, en cualquier Mac con Apple Silicon y 8 GB o mas de memoria unificada, dado el reducido tamano del checkpoint. Tambien seria viable en GPUs NVIDIA de consumo tras conversion, aunque no es el formato publicado.
- Opciones de despliegue: mlx y mlx-lm / mlx-vlm como ruta natural; el ecosistema oMLX (github.com/jundot/omlx) como origen de la cuantizacion. El soporte de la cabeza MTP dependera de que el runtime la reconozca. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Cabe esperar que el modelo este limitado por ancho de banda de memoria mas que por computo, dado su tamano, pero no hay cifras verificables en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos verificados de rendimiento para este checkpoint. La siguiente comparacion se limita a parametros y disponibilidad, con la advertencia de que los datos de los modelos alternativos provienen de sus especificaciones publicas y deben confirmarse en sus repositorios oficiales.

| Modelo | Parametros | Contexto | Licencia | Formato / ecosistema |
|---|---|---|---|---|
| Qwen3.5-0.8B-oQ3-mtp (este) | 0,873B totales (0,752B LM + 0,101B vision + 0,020B MTP) | No disponible | No disponible | safetensors MLX, cuantizacion mixta 5,232 bits/peso |
| Qwen3-0.6B | 0,6B | 32k (segun especificacion publica de Qwen) | Apache 2.0 | safetensors, GGUF, MLX; amplio soporte de runtimes |
| Qwen2.5-0.5B | 0,49B | 32k (segun especificacion publica de Qwen) | Apache 2.0 | safetensors, GGUF, MLX |
| Llama 3.2 1B | 1,24B | 128k (segun especificacion publica de Meta) | Licencia comunitaria Llama 3.2 | safetensors, GGUF, MLX |

Diferencias relevantes: frente a las alternativas, este checkpoint es el unico de la tabla que combina torre de vision y cabeza MTP en un unico artefacto de menos de 1 GiB, pero tambien el unico sin licencia declarada y sin datos de contexto, idiomas ni evaluacion publicada. Qwen3-0.6B y Qwen2.5-0.5B ofrecen licencia Apache 2.0 explicita y soporte en la mayoria de runtimes, lo que reduce el riesgo de adopcion.

## Limitaciones y advertencias

- Cuantizacion agresiva: el 75% de los pesos logicos esta en 3 bits con grupo de 64. Es previsible una degradacion medible en razonamiento, matematicas y fidelidad de generacion frente al modelo sin cuantizar; no se aportan evaluaciones que la cuantifiquen.
- Licencia no declarada: el repositorio no especifica licencia. No hay autorizacion explicita de uso comercial y, ademas, la licencia del modelo base Qwen3.5 no se indica en la informacion disponible. Verificar ambas antes de cualquier uso en produccion.
- Artefacto derivado y no oficial: el autor es un usuario individual (bambocher) y no el equipo de Qwen. No hay garantia de mantenimiento, correccion de errores ni soporte.
- Ausencia total de evaluacion: sin benchmarks, sin datos de contexto, sin lista de idiomas y sin plantilla de chat documentada. El comportamiento real en tareas concretas es desconocido hasta que se pruebe.
- Riesgo de alucinacion: inherente a un modelo de menos de mil millones de parametros, y probablemente acentuado por la cuantizacion a 3 bits en el backbone de lenguaje. No apto para tareas de alta precision sin verificacion externa.
- Dependencia del runtime: al estar en formato MLX con cabeza MTP, su uso esta ligado a herramientas del ecosistema Apple. La cabeza MTP puede ser ignorada o no soportada por runtimes genericos, con lo que se pierde la ventaja de decodificacion especulativa.
- Sesgos: no documentados. Al no conocerse la composicion del corpus de entrenamiento ni los idiomas soportados, no es posible anticipar sesgos linguisticos o culturales.
- Madurez: 11 descargas y 0 likes en el momento de la consulta, con creacion y ultima actualizacion en la misma fecha (20 de octubre de 2026). Perfil de adopcion muy bajo.
- Limitaciones de contexto e idioma: al no declararse la ventana de contexto ni los idiomas, cualquier despliegue multilingue o con prompts largos requiere validacion empirica previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bambocher/Qwen3.5-0.8B-oQ3-mtp
- Repositorio de oQ / oMLX (herramienta de cuantizacion citada en la model card): https://github.com/jundot/omlx
- Paper, blog oficial, demo o repositorio del modelo base: no disponibles en la informacion proporcionada.
