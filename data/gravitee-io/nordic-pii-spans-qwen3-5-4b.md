# gravitee-io/nordic-pii-spans-qwen3.5-4b

## Resumen

Nordic PII Spans (Qwen3.5-4B) es un modelo de extraccion de datos personales (PII) especializado en noruego (bokmal y nynorsk) y sueco, desarrollado por gravitee-io. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-4B que recibe texto libre y devuelve un JSON con todos los elementos identificativos encontrados, etiquetados por categoria y agrupados por referencia de persona, de modo que el texto pueda seudonimizarse o redactarse de forma consistente.

El modelo resuelve un problema concreto de cumplimiento normativo: la deteccion y anonimizacion de datos personales en texto empresarial nordico (correos, informes, notas de caso, registros de incidentes, chats y markdown) bajo el marco del RGPD. A diferencia de los NER genericos, agrupa todas las menciones de una misma persona bajo un mismo `ref`, lo que permite sustituciones coherentes a lo largo de un documento.

Con 4.205.751.296 parametros y un tamano de repositorio de 4,5 GB en su build Q8_0 GGUF, esta pensado para despliegue local y en produccion con requisitos de hardware moderados. La version 2 (octubre de 2026) corrige falsos positivos de la version 1 en notas cortas y mejora la deteccion exacta de textos con datos personales del 76,8% al 96,4%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); BF16 y NVFP4 disponibles en repos separados (builds de la version 1) |
| Idiomas soportados | nb (noruego bokmal), nn (noruego nynorsk), sv (sueco) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo base), GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo es un fine-tune supervisado sobre Qwen/Qwen3.5-4B, un transformer decoder-only de 4.200 millones de parametros. La tarea de entrenamiento es la extraccion de spans de PII con salida JSON estructurada, incluyendo la asignacion de referencias de persona (`ref`) para agrupar menciones de la misma entidad. El modelo conserva la plantilla de chat de Qwen3.5, en la que el modo "thinking" esta activado por defecto; el autor indica que fue entrenado para emitir el JSON inmediatamente despues de un bloque de razonamiento vacio, por lo que es imprescindible desactivar el thinking en cada peticion.

La version 2 incorpora 2.400 textos adicionales de entrenamiento, todos ellos notas cortas, para corregir el sesgo de la version 1, que en ocasiones interpretaba una unica palabra capitalizada en su propia linea como nombre de persona. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion completa del dataset ni el uso de RLHF o DPO. La evaluacion reportada se realiza sobre 2.000 textos de test y 100 textos de comprobacion, ademas de 204 notas cortas escritas a mano y separadas del conjunto de entrenamiento.

## Capacidades

- Extraccion de entidades PII en texto libre con salida JSON estructurada (`{"spans":[{"label":"...","text":"...","ref":"..."}]}`).
- Copia literal del texto original en el campo `text`, en orden de aparicion, para permitir el calculo de posiciones de caracteres.
- Agrupacion por persona mediante `ref`: todas las menciones de la misma persona y sus datos asociados comparten referencia, lo que habilita seudonimizacion consistente.
- 19 categorias de PII: PERSON, ADDRESS, PHONE, EMAIL, NATIONAL_ID, DATE_OF_BIRTH, AGE, GENDER, HEALTH, SPECIAL_CATEGORY, CRIMINAL, BANK_ACCOUNT, PAYMENT_CARD, ID_DOCUMENT, LICENSE_PLATE, IP_ADDRESS, USERNAME y EMPLOYEE_ID.
- Cobertura de identificadores noruegos y suecos especificos: fødselsnummer, D-nummer, personnummer, samordningsnummer, matriculas noruegas y suecas, numeros de cuenta e IBAN, ID06 y tarjetas HMS.
- Exclusion deliberada de organizaciones, lugares, cargos, fechas ordinarias, numeros de caso/pedido/factura y calles o salas con nombre de persona.
- Procesamiento de correos, informes, notas de caso, registros de incidentes, chats y markdown.
- Modelo complementario `nordic-pii-screen-qwen3.5-4b` para clasificacion binaria/multietiqueta por categoria en una sola llamada.
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Redaccion de documentos legales y de RRHH: el modelo identifica nombres, numeros de identificacion nacional y datos de contacto en informes internos, y el cliente `nordic_pii.py` convierte los spans en posiciones de caracteres para aplicar sustituciones consistentes antes de archivar o compartir.
- Cumplimiento del RGPD en atencion al cliente: procesamiento de transcripciones de chat y correos para eliminar datos personales antes de almacenarlos en sistemas analiticos o de entrenamiento.
- Anonimizacion de notas de caso en servicios sociales y sanidad: las categorias HEALTH y SPECIAL_CATEGORY permiten detectar diagnosticos, bajas, embarazos, alergias, religion u orientacion sexual, datos de categoria especial bajo el RGPD.
- Preparacion de datasets para entrenamiento: filtrado y seudonimizacion de corpus nordicos antes de usarlos en pipelines de ML, evitando la memorizacion de PII por parte de modelos posteriores.
- Gestion de incidentes y logs: deteccion de IPs, nombres de usuario, matriculas y numeros de empleado en registros tecnicos, con agrupacion por `ref` para mantener la trazabilidad entre menciones de una misma persona.
- Publicacion de documentacion y markdown: limpieza de wikis y repositorios internos antes de hacerlos publicos, con exclusion de falsos positivos como calles o salas con nombre de persona.
- Triaje previo con el modelo companion: uso de `nordic-pii-screen-qwen3.5-4b` para descartar textos sin datos personales y reducir el coste de inferencia del extractor de spans.
- Despliegue en infraestructura local: al ser un modelo de 4.200 millones de parametros en Q8_0, permite procesar texto sensible sin enviarlo a APIs externas, requisito habitual en sectores regulados.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 204 notas cortas escritas a mano (148 sin datos personales, 56 con), 2.000 textos de test y 100 textos de comprobacion:

| Metrica | Version 1 | Version 2 |
|---|---|---|
| Notas sin PII con span devuelto (falsos positivos) | 16 de 148 | 1 de 148 |
| Notas con PII detectadas exactamente | 76,8% | 96,4% |
| Test: exact F1 | 0,961 | 0,960 |
| Test: overlap F1 | 0,985 | 0,984 |
| Test: covered F1 | 0,977 | 0,982 |
| Check: exact F1 | 0,940 | 0,929 |
| Check: overlap F1 | 0,965 | 0,960 |
| Check: covered F1 | 0,963 | 0,963 |

El autor indica que en los 2.000 textos de test ambas versiones estan igualadas, y que en los 100 textos de comprobacion la version 2 baja un punto en exact F1 (algunos spans con bordes o categoria distintos) pero mejora la cobertura de texto personal. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el build Q8_0 GGUF ocupa 4,5 GB en disco; con overhead de contexto y cache KV se recomienda al menos 6-8 GB de VRAM para ejecucion en GPU.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 para despliegue en produccion; cualquier GPU consumer con 8 GB o mas puede ejecutar el build Q8_0.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 y superiores).
- Opciones de despliegue: Ollama (con `"think": false` en la API nativa o `"reasoning_effort": "none"` en el endpoint OpenAI), llama-server y vLLM (con `"chat_template_kwargs": {"enable_thinking": false}`). Para vLLM existen builds BF16 y NVFP4 en repos separados, aunque corresponden a la version 1.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor advierte que con el thinking activado el modelo genera un razonamiento largo y la respuesta llega vacia o en prosa y mucho mas lenta, por lo que la desactivacion del thinking es critica para el rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Nordic PII Spans (Qwen3.5-4B) | 4.205.751.296 | no disponible | nb, nn, sv | apache-2.0 | Extraccion de PII con salida JSON y agrupacion por persona |
| nordic-pii-screen-qwen3.5-4b | no disponible | no disponible | nb, nn, sv | no disponible | Clasificacion por categoria de PII en una llamada |
| Qwen/Qwen3.5-4B (base) | 4.200 millones aprox. | no disponible | multilingue | no disponible | Modelo generalista de generacion de texto |

No se dispone en la informacion proporcionada de modelos comparables de terceros (por ejemplo, NER nordicos especializados o extractores de PII multilingues) con datos de parametros, contexto o rendimiento verificables.

## Limitaciones y advertencias

- El thinking debe desactivarse en cada peticion. Con el thinking activado el modelo devuelve respuestas vacias o en prosa y con mayor latencia; el parametro `think` del Modelfile no lo desactiva para `/api/generate` en Ollama.
- Cobertura limitada a tres idiomas: noruego bokmal, noruego nynorsk y sueco. No se garantiza su comportamiento en danes, finlandes, islandes ni en textos mixtos con otros idiomas.
- Riesgo de falsos positivos residual: la version 2 aun devuelve un span en 1 de cada 148 notas sin datos personales en la evaluacion del autor.
- Riesgo de falsos negativos: la deteccion exacta de notas con PII es del 96,4%, por lo que una parte de los textos con datos personales no se detecta completamente y requiere revision humana en flujos de cumplimiento.
- El modelo excluye deliberadamente organizaciones, lugares, cargos y numeros de caso/pedido/factura; si el caso de uso requiere anonimizar estos elementos, hay que complementarlo con otras herramientas.
- La salida es JSON con spans de texto literal; el calculo de posiciones de caracteres se delega al cliente `nordic_pii.py`, por lo que hay que validar ese paso en produccion.
- Los builds BF16 y NVFP4 para vLLM corresponden a la version 1, no a la version 2; para produccion en vLLM con la version 2 solo esta disponible el GGUF Q8_0.
- Licencia apache-2.0: permite uso comercial, pero el modelo base Qwen3.5-4B puede tener condiciones adicionales que deben verificarse.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopcion todavia muy limitada y poca validacion externa independiente.
- No se han publicado datos sobre sesgos demograficos, comportamiento en textos largos ni limites de contexto, lo que dificulta dimensionar su uso en documentos extensos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gravitee-io/nordic-pii-spans-qwen3.5-4b
- Modelo companion (screening): https://huggingface.co/unified-analytics/nordic-pii-screen-qwen3.5-4b
- Build BF16 para vLLM (version 1): https://huggingface.co/unified-analytics/nordic-pii-spans-qwen3.5-4b-BF16
- Build NVFP4 para vLLM (version 1): https://huggingface.co/unified-analytics/nordic-pii-spans-qwen3.5-4b-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
