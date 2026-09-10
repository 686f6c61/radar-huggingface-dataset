# bisalsaha/trade-idp-vlm-7b

## Resumen

TradeIDP Enterprise AI Core es un ajuste fino (fine-tuning) mediante LoRA de doble adaptador, uno para la torre de vision y otro para el modelo de lenguaje, sobre el modelo multimodal Qwen2.5-VL-7B-Instruct. Lo desarrolla el usuario bisalsaha y esta orientado especificamente a la extraccion de informacion estructurada en documentos de comercio internacional y financiacion comercial, con foco en el ecosistema regulatorio de Bangladesh (United Commercial Bank PLC, Bangladesh Bank, sistemas OIMS, OEMS, FEOD y ASYCUDA).

El problema que aborda es la digitalizacion de expedientes documentales de comercio exterior (facturas comerciales, cartas de credito, conocimientos de embarque, declaraciones de importacion/exportacion, certificados de origen, etc.), transformando imagenes de documentos en campos canonicos normalizados. El autor declara cobertura de 18 categorias regulatorias y mas de 35 campos canonicos, con capacidad de procesar continuaciones multipagina (paginas 1-3) y dosieres grapados mixtos.

Su relevancia actual es limitada pero concreta: es un modelo de nicho vertical, con cero descargas y cero likes en el momento de la consulta, publicado como adaptador LoRA bajo licencia Apache 2.0. No se han publicado resultados de benchmarks formales ni datos sobre composicion del dataset de entrenamiento, por lo que su evaluacion independiente queda pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) heredada del modelo base Qwen2.5-VL-7B-Instruct, con ajuste fino mediante LoRA de vision y lenguaje |
| Parametros totales | No disponible de forma explicita en la informacion proporcionada; el modelo base Qwen2.5-VL-7B-Instruct tiene aproximadamente 7.000 millones de parametros, mas los adaptadores LoRA |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base Qwen2.5-VL-7B-Instruct soporta 128.000 tokens de contexto |
| Tipos de cuantizacion | No disponible. El entrenamiento del adaptador se realizo en 4 bits (Unsloth FastVision 4-bit), pero no se documentan cuantizaciones publicadas para inferencia |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible de forma explicita; se trata de un adaptador LoRA sobre Qwen2.5-VL-7B-Instruct, previsiblemente en safetensors segun el estandar de HuggingFace |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-VL-7B-Instruct: un transformer multimodal compuesto por un codificador visual (que procesa imagenes y documentos con resolucion variable) y un decodificador de lenguaje basado en la familia Qwen2.5. Sobre esa base se aplico un ajuste fino de tipo PEFT con LoRA dual, es decir, adaptadores independientes para la torre de vision y para el modelo de lenguaje, de modo que el modelo aprende representaciones especificas del dominio documental sin reentrenar todos los pesos.

El entrenamiento se realizo con Unsloth FastVision en 4 bits. La model card menciona el uso de un esquema canonico estricto y de visual grounding (anclaje visual) para reducir alucinaciones, y declara una tasa de alucinacion del 0,0 % sobre el esquema definido. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO especificas para este ajuste; esos datos no estan disponibles. Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio esquema de extraccion canonica y de la estrategia de anclaje visual.

## Capacidades

- Extraccion de informacion estructurada a partir de imagenes de documentos de comercio internacional y financiacion comercial.
- Cobertura declarada de 18 categorias regulatorias de comercio exterior.
- Extraccion de mas de 35 campos canonicos: numero de factura, fechas, numero de carta de credito (L/C), conocimiento de embarque (B/L), numeros EXP/IMP, codigos HS, valores, divisas y pesos, entre otros.
- Procesamiento de documentos multipagina, incluidas continuaciones (paginas 1-3) y dosieres grapados con documentos mixtos.
- Comprension visual de documentos (document AI) heredada del modelo base Qwen2.5-VL.
- Capacidades generales de vision-lenguaje del modelo base: descripcion de imagenes, respuesta a preguntas visuales y comprension de graficos y diagramas.
- No se documenta soporte explicito de tool calling, function calling ni de flujos de agentes multi-paso en la informacion proporcionada.
- No se documentan capacidades de audio ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Digitalizacion de facturas comerciales de importacion y exportacion: el modelo recibe la imagen de la factura y devuelve los campos canonicos (numero, fecha, valor, divisa, codigos HS) directamente en un esquema estructurado, lo que elimina la introduccion manual en sistemas de gestion.
- Tramitacion de cartas de credito (L/C): extraccion de numero de L/C, banco emisor, beneficiario, importe y condiciones, permitiendo precargar el expediente en la plataforma bancaria antes de la validacion humana.
- Gestion de conocimientos de embarque (B/L): lectura de datos de transporte maritimo (puerto de origen y destino, consignatario, peso, numero de bultos) para alimentar sistemas de trazabilidad aduanera.
- Declaraciones de importacion y exportacion ante Bangladesh Bank (EXP/IMP): captura de numeros de registro y campos regulatorios para su conciliacion con los sistemas OIMS y OEMS.
- Procesamiento de dosieres multipagina: cuando un expediente incluye continuaciones o documentos grapados de distinto tipo, el modelo puede recorrer varias paginas y consolidar los campos de cada categoria.
- Integracion en un pipeline IDP (intelligent document processing) bancario: el adaptador se despliega como etapa de extraccion previa a la validacion por un operador, reduciendo el tiempo de revision por expediente.
- Normalizacion de datos para reporting regulatorio: al mapear cada documento a un esquema canonico fijo, los datos extraidos pueden volcarse a bases de datos relacionales sin postprocesado complejo de limpieza.
- Auditoria y control de cumplimiento: comparacion de campos extraidos de varios documentos de un mismo expediente (por ejemplo, valor de factura frente a valor declarado) para detectar discrepancias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada por el autor es una tasa de alucinacion del 0,0 % sobre el esquema canonico definido, sin detallar el conjunto de evaluacion ni la metodologia empleada, por lo que debe considerarse una afirmacion no verificada de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en precision de 16 bits: en torno a 16-18 GB solo para los pesos del modelo base de 7.000 millones de parametros, mas el consumo adicional del codificador visual y de las activaciones con imagenes de alta resolucion.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 6-8 GB para los pesos, con margen adicional para el procesamiento de imagenes.
- GPU recomendadas: A100 40 GB o H100 para despliegue concurrente en servidor; RTX 4090 (24 GB) o RTX 3090 (24 GB) para desarrollo y uso individual en precision de 16 bits.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) en 16 bits y en tarjetas de 8-12 GB (por ejemplo RTX 4070) si se aplica cuantizacion de 4 bits.
- Opciones de despliegue: al ser un adaptador LoRA, requiere cargarse junto al modelo base Qwen2.5-VL-7B-Instruct mediante transformers con PEFT, o bien fusionar el adaptador en los pesos base para servirlo con vLLM o TGI. No se documenta la publicacion de pesos en formato GGUF, por lo que su uso con llama.cpp u Ollama no esta confirmado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trade-idp-vlm-7b (este modelo) | ~7.000 millones mas adaptadores LoRA | No disponible (base: 128.000 tokens) | Extraccion de documentos de comercio internacional y banca de Bangladesh | Apache 2.0 | Adaptador LoRA en HuggingFace, 0 descargas |
| Qwen2.5-VL-7B-Instruct | ~7.000 millones | 128.000 tokens | VLM generalista, document AI generico | Apache 2.0 | Modelo base ampliamente disponible y con soporte en multiples frameworks |
| Qwen2.5-VL-3B-Instruct | ~3.000 millones | 128.000 tokens | VLM generalista de menor tamano | Apache 2.0 | Modelo base disponible, menor coste de inferencia |
| InternVL2.5 (variantes de 8B) | ~8.000 millones | Variable segun configuracion | VLM generalista con buen rendimiento en document AI | Apache 2.0 / MIT segun variante | Amplia disponibilidad en HuggingFace |

Nota: no se dispone de datos de benchmarks de trade-idp-vlm-7b que permitan una comparacion cuantitativa de rendimiento con estas alternativas; la comparacion se limita a caracteristicas tecnicas y licencia.

## Limitaciones y advertencias

- Especializacion extrema: el ajuste esta orientado al ecosistema regulatorio de Bangladesh (UCB, Bangladesh Bank, OIMS, OEMS, FEOD, ASYCUDA), por lo que su rendimiento fuera de ese dominio y de esas categorias documentales no esta validado.
- Cero adopcion publica: el modelo registra 0 descargas y 0 likes, sin evidencia externa de uso en produccion ni de validacion por terceros.
- Datos de entrenamiento no documentados: se desconoce la composicion del dataset, su tamano, su procedencia y si contiene documentos reales o sinteticos, lo que impide evaluar sesgos y cobertura.
- Tasa de alucinacion del 0,0 % declarada por el autor sin metodologia de evaluacion publicada; debe tratarse como una afirmacion no verificada.
- Riesgo de alucinacion en documentos mal escaneados, con sellos, escritura manual o baja resolucion: no se documentan pruebas de robustez frente a esas condiciones.
- Idiomas soportados no especificados; no se confirma el tratamiento de documentos en bengali, ingles o idiomas mixtos.
- Limitaciones de contexto no documentadas para este ajuste concreto; el modelo base soporta 128.000 tokens, pero el comportamiento del adaptador con entradas muy largas no esta verificado.
- Al ser un adaptador LoRA, requiere el modelo base Qwen2.5-VL-7B-Instruct para funcionar; no es un modelo autonomo listo para desplegar sin esa dependencia.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y el cumplimiento normativo al tratar documentos financieros reales (proteccion de datos, secreto bancario).
- Advertencia operativa: al procesar documentos bancarios y regulatorios, cualquier extraccion automatica deberia someterse a validacion humana antes de tener efectos legales o contables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bisalsaha/trade-idp-vlm-7b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct

Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo. Los unicos enlaces encontrados corresponden a sitios de venta de vehiculos todoterreno (atvrom.ro y similares) y no guardan relacion con el modelo descrito, por lo que se han descartado.
