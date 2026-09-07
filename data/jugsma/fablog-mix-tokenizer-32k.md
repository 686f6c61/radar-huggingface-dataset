# JugsMa/fablog-mix-tokenizer-32k

## Resumen

`fablog-mix-tokenizer-32k` es un tokenizer de tipo byte-level BPE desarrollado por JugsMa, especializado en logs de máquinas de nivel industrial: eventos de herramientas de fabricación (fab tool events), pruebas de ATE/wafer-sort, tests de burn-in/memoria y telemetría de GPU/HPC. Su objetivo principal es ofrecer una tokenización eficiente y sin pérdidas para dominios técnicos donde los logs contienen números, identificadores y claves-valor, manteniendo al mismo tiempo una cobertura razonable de texto en inglés para no degradar el lenguaje natural.

Se trata del sucesor de `JugsMa/fablog-tokenizer-16k`. El tokenizer fue entrenado sobre una mezcla de 88 MB que incluye 58 MB de logs reales de supercomputadoras Blue Gene/L (BGL, de Loghub), 18 MB de logs sintéticos de fábrica (estilo SECS/GEM) y 15 MB de wikitext-103. Su vocabulario es de 32.768 tokens, completamente lleno y múltiplo de 128, lo que lo hace compatible con entrenamientos en paralelo (TP-friendly) y permite que los IDs quepan en `uint16`. No es un modelo de lenguaje generativo, sino una pieza de preprocesamiento para entrenar o ejecutar modelos que consuman logs técnicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-level BPE (tokenizer) |
| Parametros totales | No aplica (tokenizer) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (tokenizer sin ventana de contexto) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Ingles y logs tecnicos (dominio de fabricacion, HPC, semiconductor) |
| Licencia | No disponible |
| Formato de pesos | tokenizer.json (estandar de HuggingFace, compatible con AutoTokenizer) |

## Arquitectura y entrenamiento

El tokenizer implementa un byte-level BPE sin normalizador Unicode, lo que garantiza que el proceso de codificacion-decodificacion sea exacto a nivel de byte y que nunca se genere el token `<unk>`. Esta caracteristica es especialmente util en logs de maquinas, donde cualquier caracter no previsto debe conservarse literalmente.

El entrenamiento se realizo sobre una mezcla de 88 MB compuesta por: 58 MB de logs reales de Blue Gene/L (BGL) procedentes de Loghub, 18 MB de logs sinteticos de fabricacion (eventos de herramientas SECS/GEM, wafer-sort, burn-in y telemetria GPU) y 15 MB de wikitext-103 para preservar la tokenizacion del ingles. No se ha utilizado RLHF ni DPO, ya que se trata de un tokenizer y no de un modelo generativo.

Entre las innovaciones tecnicas destacan el pre-division de digitos en grupos de 1 a 3 (estilo Llama-3), de modo que secuencias como `2026` se tokenizan como `202`,`6` para mejorar la compresion de numeros; el aislamiento del caracter `=` para evitar que una clave se fusione con su valor; y la definicion de dos tokens especiales: `<|endoftext|>` (id 0, usado como separador de documento y BOS) y `<|pad|>` (id 1). El vocabulario de 32.768 tokens esta completamente lleno y es multiplo de 128, lo que reduce el coste de embeddings y de la cabeza de lenguaje en modelos pequenos.

## Capacidades

- Tokenizacion byte-level exacta: la codificacion y decodificacion son reversibles sin perdida de informacion y sin generacion de `<unk>`.
- Manejo optimizado de numeros: los digitos se agrupan en bloques de 1 a 3, mejorando la compresion de timestamps, IDs y mediciones.
- Aislamiento de claves-valor: el tokenizer no fusiona el signo `=` con el valor, preservando la estructura de logs tipo `key=value`.
- Soporte de tokens especiales: `<|endoftext|>` (id 0) y `<|pad|>` (id 1) para entrenamiento y padding.
- Cobertura de dominios tecnicos: logs de herramientas de fabricacion, pruebas ATE/wafer-sort, burn-in/memoria, telemetria GPU/HPC y logs de supercomputadoras.
- Cobertura de ingles: incluye una proporcion de wikitext-103 (17% del corpus) para que el texto en prosa no se tokenice caracter a caracter.
- Compatibilidad con transformers: se puede cargar directamente con `AutoTokenizer.from_pretrained`.
- Integracion con nanotron/datatrove: preparado para usarse en pipelines de preprocesamiento de datos con `preprocess_data.py`.

## Casos de uso

- Preprocesamiento de logs para entrenar LLMs especializados en operaciones de fabricacion: el tokenizer convierte eventos de herramientas SECS/GEM en secuencias compactas, preservando numeros y claves, lo que permite que el modelo aprenda patrones de fallo sin perder informacion critica.
- Tokenizacion de telemetria GPU/HPC en centros de datos: al tratar logs de rendimiento y consumo, el tokenizer mantiene los valores numericos y las etiquetas de forma estable, reduciendo el coste de tokens frente a tokenizers generalistas.
- Analisis de logs de supercomputadoras para deteccion de anomalias: los logs BGL se tokenizan con alta fidelidad, lo que facilita el entrenamiento de clasificadores de eventos de error (RAS KERNEL INFO, etc.) sobre secuencias de tokens.
- Sustitucion de tokenizers grandes en modelos con restricciones de memoria: con un vocabulario de 32.768 en lugar de 128.000, el coste de embeddings y cabeza de lenguaje se reduce de ~263M a ~67M parametros en modelos con hidden size 1024, permitiendo ejecutar modelos en entornos con VRAM limitada.
- Integracion en pipelines de datos para entrenamiento con datatrove/nanotron: el tokenizer se puede invocar directamente desde `tools/preprocess_data.py`, lo que agiliza la preparacion de corpus de logs a gran escala.
- Tokenizacion de logs de pruebas de burn-in y memoria: los registros de tests de estres de memoria se codifican de manera eficiente, manteniendo separados los valores y las etiquetas, lo que resulta util para modelos de prediccion de fallos en semiconductores.

## Benchmarks y rendimiento

El modelo card incluye una tabla de "fertility" (tokens por byte; valores mas bajos indican mejor compresion) comparando este tokenizer con Llama-3 (vocab 128k) y SmolLM2:

| Corpus | fablog-mix-tokenizer-32k | Llama-3 (128k) | SmolLM2 |
|---|---|---|---|
| Logs sinteticos de fabricacion | 0.474 | 0.463 | 0.634 |
| Logs reales BGL | 0.506 | 0.478 | 0.760 |
| Ingles (wikitext) | 0.218 | 0.223 | 0.233 |

El tokenizer muestra una paridad casi completa con Llama-3 en logs y un rendimiento ligeramente superior en ingles, utilizando solo una cuarta parte del vocabulario. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) porque no se trata de un modelo generativo.

## Requisitos de hardware

- No requiere GPU para la tokenizacion: se ejecuta completamente en CPU y es ligero, ya que no contiene pesos de red neuronal.
- Para entrenar un modelo con este tokenizer, la VRAM necesaria depende del tamano del modelo de lenguaje, no del tokenizer. Con hidden size 1024, el coste de embeddings y LM head es de aproximadamente 67 millones de parametros.
- Compatible con cualquier GPU que pueda ejecutar Transformers, incluidas RTX 4090, A100 y H100, siempre que el modelo de lenguaje asociado quepa en memoria.
- Opciones de despliegue: se puede usar como preprocesador en frameworks como HuggingFace Transformers, nanotron, datatrove y cualquier pipeline basado en `tokenizers`.
- No se dispone de datos de latencia o throughput especificos; al ser un tokenizer de vocabulario moderado, la velocidad de tokenizacion es alta en CPU.

## Comparativa con modelos similares

| Tokenizer | Vocabulario | Fertility en logs sinteticos | Fertility en BGL | Fertility en ingles | Licencia |
|---|---|---|---|---|---|
| fablog-mix-tokenizer-32k | 32.768 | 0.474 | 0.506 | 0.218 | No disponible |
| Llama-3 (128k) | 128.000 | 0.463 | 0.478 | 0.223 | Meta Llama 3 Community License |
| SmolLM2 | 32.000 (aprox.) | 0.634 | 0.760 | 0.233 | Apache 2.0 |
| fablog-tokenizer-16k | 16.384 | No disponible | No disponible | No disponible | No disponible |

El tokenizer de JugsMa ofrece una compresion comparable a Llama-3 en logs y mejor en ingles, con un vocabulario mucho menor. Su principal limitacion frente a alternativas generalistas es que no se ha evaluado en otros dominios fuera de logs tecnicos e ingles.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no tiene tool calling ni capacidades de razonamiento. Solo tokeniza.
- Los datos de entrenamiento son limitados (88 MB) y una parte es sintetica; el rendimiento en dominios que no sean logs de fabricacion o HPC no ha sido validado.
- La cobertura de idiomas se restringe a ingles y logs tecnicos. No se han probado otros idiomas, por lo que la tokenizacion de texto en espanol u otras lenguas puede ser suboptima.
- La licencia no esta especificada en la informacion disponible. Esto puede suponer una restriccion legal para uso comercial; se recomienda contactar con el autor antes de desplegarlo en produccion.
- Al ser un tokenizer de dominio especifico, puede producir secuencias mas largas que un tokenizer generalista en texto natural no relacionado con logs, aunque la fertility en wikitext es competitiva.
- No se incluyen pesos de modelo ni configuracion de cuantizacion, ya que no aplica a un tokenizer.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JugsMa/fablog-mix-tokenizer-32k
- Predecesor (16k): https://huggingface.co/JugsMa/fablog-tokenizer-16k
- Loghub (dataset de logs BGL): https://github.com/logpai/loghub
