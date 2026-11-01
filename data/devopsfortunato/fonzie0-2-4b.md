# devopsfortunato/Fonzie0.2-4B

## Resumen

Fonzie0.2-4B es un ajuste fino (fine-tune) del modelo Qwen3.5-4B desarrollado por el autor independiente devopsfortunato (Alfonso Fortunato), orientado a su uso dentro de aplicaciones de agente reales como oh-my-pi y opencode. El modelo está entrenado para buscar informacion cuando no la conoce, responder citando fuentes, reconocer premisas falsas y admitir cuando un dato no existe, en lugar de inventarlo. Es un proyecto de estudio personal, no un modelo de proposito general producido por un laboratorio.

Se distribuye como adaptador LoRA sobre Qwen3.5-4B, con 4.659.865.088 parametros totales en pesos safetensors y una ventana de contexto que alcanza los 262.144 tokens segun la model card del GGUF asociado. Soporta entrada de imagen y texto (pipeline image-text-to-text), tool calling con busqueda web y el uso de un instrumento `ask` para formular preguntas al usuario en oh-my-pi. Los idiomas declarados son italiano e ingles.

Su relevancia actual radica en que documenta de forma honesta y medible el comportamiento agentico de un modelo pequeno (4B): incluye tasas de respuestas incorrectas con seguridad, enlaces inventados, bucles y recuperacion tras fallos de busqueda, comparando contra su version anterior Fonzie0.1 y contra el modelo base. Todo ello bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-4B); adaptador LoRA fusionable |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 262.144 tokens (limite declarado en la model card del GGUF) |
| Tipos de cuantizacion | bf16 (modelo principal); GGUF Q8_0 y Q4_K_M en repo asociado; vision projector de 0,7 GB |
| Idiomas soportados | italiano (it), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF disponible en repo separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer denso de 4B parametros, y se distribuye como adaptador LoRA entrenado sobre la model card del autor. La receta de entrenamiento es la misma que la de Fonzie0.1; solo cambian los datos: se anaden conversaciones dirigidas a corregir los fallos observados en la version anterior. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se empleo RLHF o DPO.

La innovacion principal no es arquitectonica sino de comportamiento: el modelo se entrena para decidir cuando debe invocar una herramienta de busqueda (por ejemplo, ante consultas del tipo "el ultimo X" sin fecha), para reconocer premisas falsas (versiones, eventos o URLs inexistentes) y para declarar el fallo cuando todas las busquedas fallan, sin recurrir a la memoria. Tambien se le entrena para formular preguntas al usuario mediante la herramienta `ask` en oh-my-pi. El modelo fue evaluado contra un indice local de Wikipedia, de modo que los resultados no dependen del estado de la web en el momento de la prueba.

## Capacidades

- Generacion de texto conversacional multi-turno en italiano e ingles.
- Entrada multimodal de imagen y texto (image-text-to-text), con vision projector propio.
- Tool calling y function calling, incluida la busqueda web.
- Comportamiento agentico: planificacion multi-paso, reintento tras fallo de herramienta y recuperacion de errores.
- Busqueda proactiva cuando el modelo no conoce la respuesta ("searches when it doesn't know").
- Deteccion de premisas falsas y declaracion explicita de inexistencia de datos.
- Formulacion de preguntas al usuario mediante la herramienta `ask` (especifica de oh-my-pi).
- Respuesta con fuentes y enlaces devueltos por herramientas.
- Adaptacion al idioma del usuario (tasas declaradas del 96,9% al 99,6% en las pruebas).

## Casos de uso

- Asistentes de busqueda con citas: el modelo invoca la herramienta de busqueda ante consultas sin fecha ("el ultimo X") y responde citando las fuentes devueltas, lo que lo hace adecuado para aplicaciones de informacion actualizada donde la trazabilidad es importante.
- Agentes integrados en CLI de desarrollo (opencode, oh-my-pi): el modelo esta entrenado especificamente para estos entornos, con soporte de tool calling y del instrumento `ask`, lo que permite flujos de asistencia en terminal con preguntas de aclaracion al usuario.
- Verificacion de datos y control de premisas falsas: puede emplearse en pipelines que detectan afirmaciones sin respaldo, versiones inexistentes o URLs inventadas, dado su entrenamiento especifico en premisas falsas (70,0% de acierto en oh-my-pi, 76,7% en Hermes).
- Atencion al cliente con contexto largo: la ventana de hasta 262.144 tokens permite mantener conversaciones extensas o adjuntar documentacion voluminosa; con cuantizacion Q4_K_M y KV cache q8_0 cabe en 12 GB de VRAM hasta 229.376 tokens.
- Procesamiento de documentos con imagenes: al aceptar entrada image-text-to-text, puede extraer y razonar sobre contenido de capturas, formularios o diagramas en flujos de digitalizacion.
- Despliegue en hardware de consumo: las variantes GGUF Q4_K_M (2,8 GB) y Q8_0 (4,6 GB) permiten ejecutar el modelo en GPU de 12 GB como la RTX 4070 Ti, habilitando prototipos de agentes locales sin infraestructura cloud.
- Evaluacion de comportamiento agentico: util como banco de pruebas reproducible para medir tasas de alucinacion, bucles y recuperacion de errores en modelos pequenos.

## Benchmarks y rendimiento

Datos publicados en la model card del autor. Las pruebas nuevas constan de 20 preguntas por categoria (mitad italiano, mitad ingles), 3 ejecuciones, con busqueda contra un indice local de Wikipedia. Se comparan modelo base, Fonzie0.1 y Fonzie0.2.

| Metrica | oh-my-pi (base / 0.1 / 0.2) | opencode (base / 0.1 / 0.2) | Hermes, no visto en entrenamiento (base / 0.1 / 0.2) |
|---|---|---|---|
| Precision | 29,2% / 36,7% / 55,4% | 36,1% / 47,8% / 61,1% | 45,0% / 51,1% / 67,8% |
| Respuestas incorrectas con seguridad | 69,2% / 57,5% / 38,8% | 62,8% / 48,3% / 31,7% | 52,2% / 46,1% / 25,6% |
| Sigue la regla de la categoria | 25,0% / 33,8% / 53,3% | 32,8% / 45,0% / 58,9% | 41,1% / 46,1% / 63,3% |
| "El ultimo X" | 35,0% / 30,0% / 43,3% | 38,3% / 28,3% / 46,7% | 38,3% / 36,7% / 50,0% |
| Premisas falsas | 50,0% / 58,3% / 70,0% | 48,3% / 56,7% / 60,0% | 65,0% / 65,0% / 76,7% |
| Toda busqueda falla | 15,0% / 45,0% / 68,3% | 11,7% / 50,0% / 70,0% | 20,0% / 36,7% / 63,3% |
| Peticiones ambiguas (`ask`) | 0,0% / 1,7% / 31,7% | no disponible | no disponible |
| Pregunta al usuario con `ask` | 1,7% / 3,3% / 45,0% | no disponible | no disponible |
| Bucles / timeouts | 22,9% / 9,2% / 12,5% | 32,2% / 10,0% / 10,6% | 23,9% / 7,8% / 14,4% (empeora) |

Recuperacion tras busqueda fallida (60 preguntas, 48 en Hermes, 1 ejecucion), Fonzie0.1 → Fonzie0.2:

| Metrica | oh-my-pi | opencode | Hermes |
|---|---|---|---|
| Reintenta tras el fallo | 24% → 60% | 74% → 95% | 72% → 91% |
| Encuentra resultados despues | 16% → 38% | 41% → 68% | 69% → 85% |
| Respuestas incorrectas con seguridad | 55,0% → 38,3% | 38,3% → 30,0% | 39,6% → 22,9% |

Conjunto de 130 preguntas de Fonzie0.1 (94 en Hermes, solo texto), 3 ejecuciones, Fonzie0.1 → Fonzie0.2:

| Metrica | oh-my-pi | opencode | Hermes |
|---|---|---|---|
| Busca cuando no sabe | 83,9% → 92,2% | 83,9% → 93,3% | 85,4% → 95,1% |
| Busca cuando no hace falta | 27,6% → 31,0% | 32,4% → 40,5% | 26,1% → 29,7% |
| Precision | 63,3% → 65,5% | 65,0% → 66,7% | 73,2% → 76,4% |
| Respuestas incorrectas con seguridad | 27,4% → 24,0% | 27,1% → 24,3% | 22,8% → 18,7% |
| Bucles / timeouts | 7,9% → 9,5% | 4,9% → 5,9% | 5,3% → 5,7% |
| Enlaces no devueltos por herramienta | 4,1% → 5,9% | 1,8% → 4,6% (empeora) | 0,7% → 2,8% |
| Responde en el idioma del usuario | 95,3% → 97,7% | 95,1% → 96,9% | 98,9% → 99,6% |

Comparativa bf16 frente a Q4_K_M en el conjunto de pruebas congelado:

| Metrica | bf16 | Q4_K_M |
|---|---|---|
| Precision en test congelado | 66,5% | 64,8% |
| Respuestas incorrectas con seguridad | 24,6% | 27,4% |
| Enlaces inventados | 2,6% | 7,2% |
| Preguntas cotidianas (oh-my-pi / opencode / Hermes) | 66,9 / 66,7 / 76,4% | 54,2 / 66,7 / 73,2% |
| Conjunto nuevo (oh-my-pi / opencode / Hermes) | 55,4 / 61,1 / 67,8% | 52,1 / 67,2 / 60,6% |

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM con llama-server, proyector de vision cargado, MTP activo y KV cache f16 por defecto:

| Contexto (tokens) | Q4_K_M | Q8_0 |
|---:|---:|---:|
| 8.192 | 4,2 GiB | 5,9 GiB |
| 32.768 | 5,1 GiB | 6,8 GiB |
| 65.536 | 6,3 GiB | 8,0 GiB |
| 131.072 | 8,7 GiB | 10,4 GiB |
| 163.840 | 10,1 GiB | 11,8 GiB |
| 262.144 (limite del modelo) | ≥ 13,4 GiB | ≥ 15,1 GiB |

- Las cifras de Q4_K_M se midieron en una RTX 4070 Ti (12 GB) a 64k, 128k y 160k; el resto de filas se calcularon a partir de esas mediciones. Q8_0 no se ejecuto.
- Con KV cache q8_0, el Q4_K_M admite 229.376 tokens en 12 GB de VRAM.
- Cabe en GPU de consumo: RTX 4070 Ti (12 GB) validada; modelos con 12 GB o mas pueden ejecutar Q4_K_M a contextos altos. GPUs de 8 GB quedan limitadas a contextos reducidos.
- Opciones de despliegue: vLLM 0.32 (usado en las evaluaciones con bf16 fusionado), llama.cpp / llama-server y LM Studio mediante GGUF; transformers como libreria base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Fonzie0.2-4B | 4,66B | hasta 262.144 | Apache 2.0 | Agente con busqueda, vision, it/en |
| Fonzie0.1-4B | 4,66B (base Qwen3.5-4B) | no disponible | Apache 2.0 | Version anterior, misma receta |
| Qwen3.5-4B (base) | ~4B | no disponible | no disponible en la informacion | Modelo generalista sin entrenamiento agentico especifico |

La comparativa se limita a la familia Fonzie y su modelo base porque la informacion proporcionada no incluye otros modelos de la misma categoria. No se dispone de datos de rendimiento del modelo base en benchmarks estandar que permitan una comparacion mas amplia.

## Limitaciones y advertencias

- Proyecto de estudio personal: el autor lo describe explicitamente como tal; no es un modelo con soporte de laboratorio ni garantias de mantenimiento.
- Tasas de respuestas incorrectas con seguridad del 25,6% al 38,8% segun entorno; el riesgo de alucinacion persiste pese a la mejora frente a Fonzie0.1.
- Enlaces inventados: 2,6% en bf16 y hasta 7,2% en cuantizacion Q4_K_M; en opencode empeora respecto a Fonzie0.1 (1,8% → 4,6%).
- Bucles y timeouts: 9,5% en oh-my-pi, 5,9% en opencode y 5,7% en Hermes en el conjunto de 130 preguntas; en Hermes empeora respecto a Fonzie0.1 (7,8% → 14,4% en las pruebas nuevas).
- Busca con demasiada frecuencia cuando no es necesario (hasta 40,5% en opencode), lo que incrementa coste y latencia.
- Cobertura linguistica limitada a italiano e ingles; no se declaran otros idiomas.
- La cuantizacion Q4_K_M pierde precision en oh-my-pi (unos 13 puntos en preguntas cotidianas) y genera mas enlaces inventados; Q8_0 no fue evaluado.
- El comportamiento con la herramienta `ask` solo esta validado en oh-my-pi; en otros entornos no se mide.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B debe verificarse por separado; la informacion disponible no detalla sus terminos.
- Las evaluaciones usan un indice local de Wikipedia y conjuntos de 20 preguntas por categoria, por lo que la significancia estadistica es limitada y los resultados pueden no trasladarse a otros dominios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devopsfortunato/Fonzie0.2-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Version GGUF (Q8_0, Q4_K_M, proyector de vision): Fonzie0.2-4B-GGUF (referenciado en la model card, sin URL directa en la informacion disponible)
- Version anterior: Fonzie0.1-4B (referenciado en la model card, sin URL directa en la informacion disponible)
- opencode: https://opencode.ai
