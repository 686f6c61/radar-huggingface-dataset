# happyme531/Granite-4.2-3B-W4A8-Mixed-QQQ-SQ

## Resumen

Granite-4.2-3B-W4A8-Mixed-QQQ-SQ es una version cuantizada tras entrenamiento (post-training quantization) del modelo ibm-granite/granite-4.2-3b de IBM, publicada por el usuario independiente happyme531 en HuggingFace. No se trata de un modelo nuevo: conserva la arquitectura original `GraniteForCausalLM`, la plantilla de chat nativa y los 3.659.737.600 parametros del modelo base, pero reduce el payload de tensores a 2.910 GiB mediante una mezcla de pesos W4 y W8 por canal y activaciones INT8 dinamicas por token.

El problema que resuelve es el de reducir el coste de memoria y de computo de un modelo de 3,66B de parametros sin reentrenar ni alterar el comportamiento conversacional, aplicando SmoothQuant (alpha=0.3) seguido de QQQ para elegir el ancho de bit de cada capa. De los elementos de peso de las capas Linear del decoder, el 50,67% queda en W4, mientras que `lm_head` y un conjunto de proyecciones sensibles se mantienen en W8 para preservar precision.

Es relevante ahora porque permite ejecutar un modelo de la familia Granite 4.2 en GPUs de consumo y en entornos con VRAM limitada, con una degradacion medida y acotada: la perplejidad en WikiText-2 sube un 7,10% respecto a los pesos BF16 originales. La publicacion incluye herramientas de cuantizacion reproducibles, la mascara exacta de capas W8 y el desglose del protocolo de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GraniteForCausalLM` (modelo causal, denso) |
| Parametros totales | 3.659.737.600 (~3,66B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | Pesos W4/W8 simetricos por canal de salida (escalas FP32); activaciones INT8 dinamicas por token (`maxabs/127`); embeddings y parametros restantes en BF16; SmoothQuant alpha=0.3 + QQQ |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con formato compressed-tensors `pack-quantized` |
| Capas Linear cuantizadas | 76 en W4 / 205 en W8 |
| Payload de tensores | 2,910 GiB |
| Tamano del repositorio | 3,1 GB |
| Ajustes QQQ | group size `-1`, block size `128`, damping `0.01`, `actorder=False` |

Proyecciones mantenidas en W8: `lm_head`; proyecciones q/k/v/o de las 40 capas; todas las proyecciones MLP de las capas 0-9 y las proyecciones MLP down de las capas 26-39 (indices desde cero).

## Arquitectura y entrenamiento

El checkpoint es una derivada cuantizada del modelo base, no un reentrenamiento. La arquitectura subyacente es la del modelo `ibm-granite/granite-4.2-3b`, expuesta en Transformers como `GraniteForCausalLM`; los detalles internos de la arquitectura del modelo base (tipo de atencion, componentes hibridos, numero de capas y dimensiones) no se detallan en la informacion proporcionada. El proceso de cuantizacion conserva los multiplicadores de atencion, embedding, residual y logits de Granite.

El pipeline aplicado es SmoothQuant con alpha=0.3, estimado sobre las mismas 416 observaciones de calibracion, seguido del solver QQQ (revision documentada en las herramientas de cuantizacion, codigo upstream de HandH1998/QQQ). Los pesos se almacenan simetricos por canal de salida con escalas en FP32, mientras que las activaciones se cuantizan dinamicamente por token a INT8 con esquema `maxabs/127`. La seleccion de anchos de bit W4/W8 se realizo sobre ventanas de validacion separadas de WikiText-2, el conjunto CMMLU dev335 y GSM8K train32, excluyendo las muestras finales de evaluacion.

La calibracion consta de 416 observaciones y 176.687 tokens en total: 256 conversaciones completas (128 ejemplos chinos verificados de COIG-CQIA, 64 problemas GSM8K con solucion completa y 64 conversaciones en ingles de SmolTalk), dos copias adicionales de los mismos 64 ejemplos de matematicas y 32 fragmentos originales de entrenamiento de WikiText-2 de 512 tokens. El renderizado de chat nativo preserva respuestas completas del asistente y marcadores de fin, con un maximo de 1024 tokens y sin recorte de respuestas.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino, con la plantilla de chat nativa del modelo base.
- Razonamiento matematico basico: en GSM8K (subconjunto fijo de 100 problemas) obtiene 83/100 con decodificacion greedy y presupuesto de 512 tokens nuevos, sin `enable_thinking`.
- Comprension de conocimiento en chino: 76/201 aciertos en CMMLU (37,81%) con prompts de chat nativos y seleccion del logit mas alto entre A/B/C/D.
- Modelado de lenguaje general evaluado mediante perplejidad en WikiText-2.
- Capacidad multilingue limitada a los dos idiomas declarados (`en`, `zh`); no se documentan otros idiomas.
- No se ha evaluado el soporte de tool calling / function calling tras la cuantizacion.
- No se ha evaluado el comportamiento en contexto largo ni el rendimiento en generacion de codigo tras la cuantizacion.
- Compatibilidad funcional verificada: carga completa con Transformers y compressed-tensors, ejecucion forward y generacion con cache de 8 tokens.

## Casos de uso

- Despliegue local en GPU de consumo: con un payload de 2,910 GiB, el modelo puede cargarse en tarjetas con 6-8 GB de VRAM para prototipos de chat en ingles y chino sin depender de servicios en la nube.
- Asistentes conversacionales bilingues en el borde: al conservar la plantilla de chat nativa y los multiplicadores originales, puede servir conversaciones multi-turno en instalaciones on-premise donde no se permite enviar datos a terceros.
- Investigacion en cuantizacion post-entrenamiento: el repositorio incluye herramientas de cuantizacion reproducibles, la mascara exacta de capas W8 y referencias ordenadas de calibracion, lo que permite reproducir la receta o aplicarla a otros modelos con datos de calibracion propios.
- Evaluacion comparativa de esquemas de cuantizacion: sirve como punto de referencia frente a formatos groupwise GPTQ, AWQ, GGUF o el checkpoint nativo de QQQ, al emplear un formato de canal mixto W4/W8 distinto.
- Clasificacion y puntuacion de opciones multiples en chino: el protocolo CMMLU con seleccion del logit mas alto entre A/B/C/D es directamente reutilizable para tareas tipo QA de opcion multiple.
- Generacion de razonamiento matematico controlado: con prompts que solicitan razonamiento breve y una respuesta final en formato `#### <numero>`, el modelo produce cadenas de solucion aptas para pipelines de evaluacion automatica.
- Experimentos docentes o de laboratorio con recursos limitados: al reducir el peso a ~3 GB, permite reproducir mediciones de perplejidad y tareas fijas en una sola GPU sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados publicados por el autor frente a los pesos originales sin cuantizar. La evaluacion de los pesos BF16 originales se realizo con aritmetica FP32; las capas Linear cuantizadas usan una GEMM de referencia INT8×INT8→INT32, cuantizacion de activaciones `maxabs/127` y operaciones no lineales en FP32, con reduccion de NLL en FP64.

| Metrica | Pesos originales sin cuantizar | Granite-4.2-3B-W4A8-Mixed-QQQ-SQ |
|---|---|---|
| WikiText-2 PPL (menor es mejor) | 15,622437 | 16,732086 |
| CMMLU fijo 201 (mayor es mejor) | 71/201 (35,32%) | 76/201 (37,81%) |
| GSM8K fijo 100 (mayor es mejor) | 84/100 | 83/100 |
| GSM8K truncamientos (menor es mejor) | 10 | 9 |

Detalles del protocolo: WikiText-2 usa `wiki.test.raw` original, sin tokens especiales anadidos, en ventanas completas de 512 tokens; se puntuan los objetivos en posiciones 257-511 (565 ventanas, 144.075 objetivos). CMMLU usa prompts de chat nativos y elige el logit de siguiente token mas alto entre A/B/C/D. GSM8K usa decodificacion greedy con `enable_thinking=False`, presupuesto de 512 tokens nuevos y coincidencia exacta numerica; las respuestas truncadas cuentan como incorrectas. El incremento de perplejidad respecto a los pesos originales es del 7,10%. Los conjuntos fijos no son resultados completos de benchmark.

## Requisitos de hardware

Nota: las cifras de VRAM son estimaciones derivadas del tamano del repositorio (3,1 GB) y del payload de tensores (2,910 GiB); el autor no publica mediciones de VRAM, latencia ni throughput.

- VRAM estimada para los pesos: aproximadamente 3,1-3,5 GB (payload de tensores mas embeddings y parametros restantes en BF16).
- VRAM estimada total en inferencia: del orden de 4-5 GB para contextos cortos (pesos, cache KV y overhead del runtime); crece con la longitud de contexto.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM. Ejemplos: RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070, RTX 4090.
- GPU de datacenter: A100, H100 y similares son compatibles pero sobredimensionadas para un modelo de este tamano; utiles para servir muchas instancias en paralelo.
- Opciones de despliegue: Transformers con compressed-tensors (verificado por el autor: carga completa, forward y generacion con cache de 8 tokens). El formato es compatible con el ecosistema compressed-tensors, que da soporte a motores como vLLM. No se ha verificado paridad de benchmark ni throughput con motores de produccion.
- Formatos no disponibles: no se proporcionan pesos GGUF, por lo que llama.cpp u Ollama no pueden consumir este checkpoint directamente; el formato de canal mixto W4/W8 es distinto de GPTQ groupwise, AWQ, GGUF y del checkpoint de kernel nativo de QQQ.
- Latencia y throughput: no disponibles; el autor indica que el rendimiento con motores de produccion no se ha medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WikiText-2 PPL | Licencia | Formato |
|---|---|---|---|---|---|
| ibm-granite/granite-4.2-3b (BF16 original) | 3,66B | no disponible | 15,622437 | Apache-2.0 | safetensors |
| Granite-4.2-3B-W4A8-Mixed-QQQ-SQ (este modelo) | 3,66B | no disponible | 16,732086 | Apache-2.0 | safetensors compressed-tensors (`pack-quantized`) |
| Otras cuantizaciones del mismo base (GPTQ, AWQ, GGUF) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de alternativas groupwise (GPTQ, AWQ) ni de versiones GGUF del mismo modelo base en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con ellas. La diferencia principal de este checkpoint frente a esos esquemas es el uso de un formato de canal mixto W4/W8 con activaciones INT8 dinamicas, en lugar de cuantizacion groupwise con kernel nativo.

## Limitaciones y advertencias

- Degradacion medida por cuantizacion: la perplejidad en WikiText-2 aumenta un 7,10% respecto a los pesos BF16 originales, lo que implica una perdida de calidad de modelado del lenguaje.
- Sin evaluacion en tareas clave: el autor declara explicitamente que la calidad en contexto largo, el uso de herramientas (tool use) y la generacion de codigo no se han evaluado tras la cuantizacion.
- Cobertura de benchmarks limitada: las tareas reportadas usan subconjuntos fijos (CMMLU 201, GSM8K 100) y no constituyen resultados completos de benchmark.
- Paridad con motores de produccion no verificada: el benchmark corresponde al runtime de referencia INT32 del proyecto; compressed-tensors estandar usa su propio escalado de activaciones por defecto y no se ha medido la paridad completa ni el throughput.
- Diferencias de punto flotante en la reproduccion: la reproduccion de la cuantizacion en distintas arquitecturas de GPU puede introducir diferencias; no se garantiza una regeneracion identica bit a bit.
- Riesgo de alucinacion: inherente a un modelo causal de ~3,66B de parametros; no se documentan tasas de alucinacion especificas.
- Cobertura idiomatica restringida: solo ingles y chino declarados; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Sesgos: no se documentan analisis de sesgo ni de toxicidad para este checkpoint; los sesgos heredados del modelo base no se han medido tras la cuantizacion.
- Licencia: los pesos y las herramientas de cuantizacion se publican bajo Apache-2.0, lo que permite uso comercial. El codigo del solver QQQ conserva sus terminos upstream y los datos de calibracion siguen sujetos a los terminos de sus datasets de origen (COIG-CQIA, SmolTalk, GSM8K, WikiText-2), que deben revisarse antes de un uso comercial.
- Atribucion: se trata de una derivada cuantizada independiente; el modelo base es de IBM Granite y no esta avalada por IBM.
- Numero de capas de contexto: no se especifica la longitud de contexto soportada en la informacion disponible, por lo que no se puede garantizar su comportamiento en ventanas largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/happyme531/Granite-4.2-3B-W4A8-Mixed-QQQ-SQ
- Modelo base en HuggingFace: https://huggingface.co/ibm-granite/granite-4.2-3b
- Fuente del modelo base en ModelScope (revision `f029229229e1c368a1e3a4245b8eba7d88939e61`): https://modelscope.cn/models/ibm-granite/granite-4.2-3b
- Repositorio del solver QQQ: https://github.com/HandH1998/QQQ
- Dataset de calibracion COIG-CQIA: https://huggingface.co/datasets/m-a-p/COIG-CQIA
- Dataset de calibracion SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset de calibracion GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset de calibracion WikiText: https://huggingface.co/datasets/Salesforce/wikitext
- Herramientas de cuantizacion y mascara W8: carpeta `quantization/` del repositorio del modelo
- Protocolo y semillas de evaluacion: archivo `evaluation.json` del repositorio del modelo
